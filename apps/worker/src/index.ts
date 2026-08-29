import { createServer, type Server } from "node:http";
import type { SemanticJob, SemanticJobStore } from "@bestehen/application";
import {
  createLogger,
  databaseUrlFor,
  parseServerEnvironmentForService,
  type ServerEnvironment,
} from "@bestehen/configuration";
import { contentReleaseIdentity } from "@bestehen/content";
import { jobEnvelopeSchema } from "@bestehen/contracts";
import { appId, reasonRegistryRelease, type Result } from "@bestehen/domain";
import {
  checkDatabaseReadiness,
  type ContentQueue,
  contentQueues,
  createPostgresPool,
  executeSemanticEffect,
  type JobExecutionChecks,
  jobPolicyFor,
  PgBossSupervisor,
  PostgresFoundationRepository,
  type QueueHandlers,
} from "@bestehen/infrastructure";
import type { Pool } from "pg";

/* ------------------------------------------------------------------------------------------------
 * The content job protocol (`P05-JOB-001`)
 * ---------------------------------------------------------------------------------------------- */

/** A parsed job envelope. Anything that fails `jobEnvelopeSchema` never reaches a handler. */
export type ContentJobEnvelope = ReturnType<typeof jobEnvelopeSchema.parse>;

/**
 * What one content job did. Every value is a *recorded* durable state, not a log line: the caller
 * can assert on it and so can the audit trail.
 */
export type ContentJobDisposition =
  | "published"
  | "replayed"
  | "cancelled"
  | "quarantined"
  | "retry_scheduled"
  | "failed_terminal"
  | "not_leasable"
  | "not_available"
  | "conflict";

/**
 * The identity and digest of the effect a job produced. `job_effect_receipts` is unique on
 * `(job_id, effect_identity)`, so this pair — not the delivery — is what makes the effect
 * exactly-once. A redelivery that recomputes the same effect replays; one that computes a different
 * digest under the same identity is refused as a conflict rather than applied twice.
 */
export interface ContentJobEffectResult {
  readonly effectIdentity: string;
  readonly effectDigest: string;
}

/**
 * The work a content job performs, injected rather than hard-wired.
 *
 * `retryable` means the failure may resolve on its own — a lease that expired mid-render, a
 * transient storage fault. `permanent` means retrying cannot help and the job goes terminal on the
 * first failure rather than burning its retry budget.
 */
export type ContentJobEffect = (
  job: SemanticJob,
  envelope: ContentJobEnvelope,
) => Promise<Result<ContentJobEffectResult, "retryable" | "permanent">>;

export interface ContentJobRuntime {
  readonly jobs: SemanticJobStore;
  readonly effects: Readonly<Record<ContentQueue, ContentJobEffect>>;
  /** The content release axis this worker is built to run. A different one is quarantined. */
  readonly contentReleaseIdentity: string;
  readonly now: () => Date;
}

/**
 * The default effect: it commits the durable effect receipt and performs no content work.
 *
 * This is deliberately not a stub that pretends to publish. The exactly-once machinery — accept,
 * lease, receipt, `succeeded_candidate` then `published` — is the part the worker owns, and it is
 * complete and exercised here. The ordered publication gates and the targeted recompute are pure
 * functions in `@bestehen/content` driven by a command surface that Stage 05 defines outside this
 * file; a composition that has them supplies them through {@link ContentJobRuntime.effects}.
 */
export const recordDurableEffectOnly: ContentJobEffect = async (_job, envelope) => ({
  ok: true,
  value: { effectIdentity: envelope.semanticIdentity, effectDigest: envelope.payloadDigest },
});

/**
 * The states a delivery may lease from, and the arrows it must walk to reach `running`.
 * `canTransitionSemanticJob` rejects `accepted -> running` directly, and `commitFoundationEffect`
 * rejects a commit from anything but `running`, so the two-step walk is the contract, not a detour.
 */
const leasePath: Partial<Record<SemanticJob["state"], readonly SemanticJob["state"][]>> = {
  accepted: ["scheduled", "running"],
  scheduled: ["running"],
  retry_scheduled: ["running"],
  running: [],
};

type LeaseOutcome =
  | { readonly ok: true; readonly job: SemanticJob }
  | { readonly ok: false; readonly disposition: "not_leasable" | "conflict" };

async function leaseForExecution(jobs: SemanticJobStore, job: SemanticJob): Promise<LeaseOutcome> {
  const path = leasePath[job.state];
  if (!path) return { ok: false, disposition: "not_leasable" };
  let current = job;
  for (const next of path) {
    const moved = await jobs.transition(current.id, current.revision, next);
    if (!moved.ok) return { ok: false, disposition: "conflict" };
    current = moved.value;
  }
  return { ok: true, job: current };
}

/**
 * Runs one delivery of one content job.
 *
 * Order matters and is the point of the function. The job resource is accepted first — idempotently,
 * so a redelivery finds the same row rather than creating a second one — and only then are the
 * refusal checks applied, because a cancel or a quarantine must be *recorded against the durable
 * job*, not decided in memory and forgotten. The effect runs only after the job is leased into
 * `running`, and its result is committed through the effect receipt, which is what makes a duplicate
 * delivery a replay instead of a second promotion.
 */
export async function runContentJob(
  runtime: ContentJobRuntime,
  queue: ContentQueue,
  payload: unknown,
): Promise<ContentJobDisposition> {
  const envelope = jobEnvelopeSchema.parse(payload);
  // Defence in depth behind the transport's own guard: an envelope delivered to the wrong queue
  // would run the wrong effect under the right idempotency key.
  if (envelope.kind !== queue) throw new Error("Job envelope kind does not match its queue");

  const policy = jobPolicyFor(queue);
  const accepted = await runtime.jobs.accept({
    id: appId<"job">(envelope.jobId),
    learnerScopeId: appId<"learner_scope">(envelope.learnerScopeId),
    kind: queue,
    semanticIdentity: envelope.semanticIdentity,
    state: "accepted",
    revision: 1,
    payloadDigest: envelope.payloadDigest,
    attempt: envelope.attempt,
    maximumAttempts: policy.retryLimit + 1,
    deadline: new Date(envelope.deadline),
  });
  if (!accepted.ok) return accepted.error === "not_available" ? "not_available" : "conflict";
  const job = accepted.value;

  // A job that already published is a replay by definition; there is nothing left to lease and no
  // second effect to attempt.
  if (job.state === "published") return "replayed";

  const checks: JobExecutionChecks = {
    contractCompatible: envelope.contract.major === 1 && envelope.contract.kind === "foundation",
    ownerAuthorized: envelope.owner === "content",
    tombstoned: false,
    releaseCompatible:
      (envelope.selector.contentReleaseIdentity ?? runtime.contentReleaseIdentity) ===
      runtime.contentReleaseIdentity,
    cancelled: job.state === "cancel_requested",
    deadlineExceeded: runtime.now().getTime() > job.deadline.getTime(),
  };
  if (
    !checks.contractCompatible ||
    !checks.ownerAuthorized ||
    !checks.releaseCompatible ||
    checks.tombstoned ||
    checks.cancelled ||
    checks.deadlineExceeded
  ) {
    // `executeSemanticEffect` short-circuits on every one of these before it reaches an effect, so
    // no content work is performed and the refusal is recorded as a transition on the job.
    const decided = await executeSemanticEffect(
      runtime.jobs,
      job,
      checks,
      envelope.semanticIdentity,
      envelope.payloadDigest,
    );
    return decided.ok ? decided.value : "conflict";
  }

  const leased = await leaseForExecution(runtime.jobs, job);
  if (!leased.ok) return leased.disposition;

  const effect = await runtime.effects[queue](leased.job, envelope);
  if (!effect.ok) {
    const exhausted =
      effect.error === "permanent" || leased.job.attempt + 1 >= leased.job.maximumAttempts;
    const state = exhausted ? "failed_terminal" : "retry_scheduled";
    const reason =
      effect.error === "retryable" && exhausted
        ? "FALLBACK.JOB_RETRY_EXHAUSTED"
        : "FALLBACK.TECHNICAL_FAULT";
    const moved = await runtime.jobs.transition(leased.job.id, leased.job.revision, state, reason);
    return moved.ok ? state : "conflict";
  }
  const committed = await executeSemanticEffect(
    runtime.jobs,
    leased.job,
    checks,
    effect.value.effectIdentity,
    effect.value.effectDigest,
  );
  return committed.ok ? committed.value : "conflict";
}

/** Optional composition inputs. Omitting them keeps the worker's own defaults. */
export interface WorkerRuntimeOptions {
  readonly contentJobEffects?: Readonly<Record<ContentQueue, ContentJobEffect>>;
  readonly contentReleaseIdentity?: string;
  readonly now?: () => Date;
}

export class WorkerRuntime {
  private readonly environment: ServerEnvironment;
  private readonly pool: Pool;
  private readonly supervisor: PgBossSupervisor;
  private readonly logger;
  private readonly contentJobs: ContentJobRuntime;
  private server: Server | undefined;
  private stopping = false;

  public constructor(
    input: Record<string, string | undefined>,
    options: WorkerRuntimeOptions = {},
  ) {
    this.environment = parseServerEnvironmentForService(input, "worker");
    const databaseUrl = databaseUrlFor(this.environment, "worker");
    this.pool = createPostgresPool(databaseUrl);
    this.supervisor = new PgBossSupervisor(databaseUrl);
    this.contentJobs = {
      // The content queues cite `reason-registry/v1.1`: their quarantine and expiry reasons are
      // Stage 05 codes, which exist only in that release.
      jobs: new PostgresFoundationRepository(this.pool, reasonRegistryRelease.id),
      effects: options.contentJobEffects ?? {
        content_publication_v1: recordDurableEffectOnly,
        content_impact_recompute_v1: recordDurableEffectOnly,
      },
      contentReleaseIdentity: options.contentReleaseIdentity ?? contentReleaseIdentity,
      now: options.now ?? (() => new Date()),
    };
    this.logger = createLogger({
      service: "worker",
      environment: this.environment.BESTEHEN_APP_ENV,
      releaseCommit: this.environment.BESTEHEN_RELEASE_COMMIT,
      level: this.environment.BESTEHEN_LOG_LEVEL,
    });
  }

  /** One handler per content queue. The foundation queues keep registering no handler. */
  public contentQueueHandlers(): QueueHandlers {
    const handlers: QueueHandlers = {};
    for (const queue of contentQueues) {
      handlers[queue] = async (payload: unknown) => {
        const disposition = await runContentJob(this.contentJobs, queue, payload);
        this.logger.info({ eventName: "content_job_completed", queue, disposition });
      };
    }
    return handlers;
  }

  public async start(): Promise<void> {
    await this.supervisor.start(this.contentQueueHandlers());
    this.server = createServer(async (request, response) => {
      response.setHeader("content-type", "application/json; charset=utf-8");
      response.setHeader("cache-control", "no-store");
      if (request.method !== "GET") {
        response.writeHead(405).end(JSON.stringify({ status: "method_not_allowed" }));
        return;
      }
      if (request.url === "/health/live") {
        response.writeHead(this.stopping ? 503 : 200).end(
          JSON.stringify({
            version: 1,
            status: this.stopping ? "stopping" : "live",
            service: "worker",
            releaseCommit: this.environment.BESTEHEN_RELEASE_COMMIT,
          }),
        );
        return;
      }
      if (request.url === "/health/ready") {
        const database = await checkDatabaseReadiness(
          this.pool,
          this.environment.BESTEHEN_SCHEMA_MIN_REVISION,
          this.environment.BESTEHEN_SCHEMA_MAX_REVISION,
        );
        const ready =
          !this.stopping && database.connected && database.compatible && this.supervisor.isReady();
        response.writeHead(ready ? 200 : 503).end(
          JSON.stringify({
            version: 1,
            status: ready ? "ready" : "not_ready",
            service: "worker",
            releaseCommit: this.environment.BESTEHEN_RELEASE_COMMIT,
          }),
        );
        return;
      }
      response.writeHead(404).end(JSON.stringify({ status: "not_found" }));
    });
    await new Promise<void>((resolve, reject) => {
      this.server?.once("error", reject);
      this.server?.listen(this.environment.BESTEHEN_WORKER_PORT, "0.0.0.0", () => resolve());
    });
    this.logger.info({
      eventName: "worker_started",
      supervisorState: this.supervisor.status(),
    });
  }

  public async stop(signal: "SIGINT" | "SIGTERM" | "startup_failure"): Promise<void> {
    if (this.stopping) return;
    this.stopping = true;
    this.logger.info({ eventName: "worker_stopping", signal });
    const closeServer = this.server
      ? new Promise<void>((resolve) => this.server?.close(() => resolve()))
      : Promise.resolve();
    let timeout: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        Promise.all([closeServer, this.supervisor.stop(), this.pool.end()]),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error("Worker shutdown exceeded its configured grace period")),
            this.environment.BESTEHEN_SHUTDOWN_GRACE_MS,
          );
        }),
      ]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
    this.logger.info({ eventName: "worker_stopped", signal });
  }
}
