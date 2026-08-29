import type { SemanticJob, SemanticJobStore } from "@bestehen/application";
import { jobEnvelopeSchema } from "@bestehen/contracts";
import type { JobId, Result } from "@bestehen/domain";
import { type Job, PgBoss } from "pg-boss";

export const foundationQueues = [
  "projection_rebuild_v1",
  "outbox_dispatch_v1",
  "rights_reconcile_v1",
  "content_publication_v1",
  "content_impact_recompute_v1",
] as const;
export type FoundationQueue = (typeof foundationQueues)[number];

/** The two durable content job kinds of decision D13, as a separate closed list. */
export const contentQueues = ["content_publication_v1", "content_impact_recompute_v1"] as const;
export type ContentQueue = (typeof contentQueues)[number];

export interface JobQueuePolicy {
  readonly revision: string;
  readonly concurrency: number;
  readonly leaseSeconds: number;
  readonly heartbeatSeconds: number;
  readonly hardDeadlineSeconds: number;
  readonly retryLimit: number;
  readonly retryDelaySeconds: number;
  readonly retryBackoff: boolean;
  readonly retentionDays: number;
}

export const foundationJobPolicy = {
  revision: "job-policy/foundation-v1",
  concurrency: 1,
  leaseSeconds: 30,
  heartbeatSeconds: 10,
  hardDeadlineSeconds: 300,
  retryLimit: 3,
  retryDelaySeconds: 5,
  retryBackoff: true,
  retentionDays: 7,
} as const satisfies JobQueuePolicy;

/**
 * Publication runs the ordered QA gates, computes five digests and drives the deterministic media
 * render before it promotes a release atomically. That does not fit the 30-second foundation lease:
 * an expiring lease would hand the same release to a second worker while the first is still
 * computing, and the pg-boss retry would then race the promotion. The lease and the hard deadline
 * are widened, and the retry delay with them, so a genuine failure backs off instead of hammering.
 *
 * Widening the lease is safe precisely because the effect is exactly-once at the database:
 * `job_effect_receipts` keyed by `(job_id, effect_identity)` makes a duplicate delivery a replay,
 * not a second promotion. The longer lease reduces duplicate *work*, not the correctness guarantee.
 */
export const contentPublicationJobPolicy = {
  revision: "job-policy/content-publication-v1",
  concurrency: 1,
  leaseSeconds: 600,
  heartbeatSeconds: 30,
  hardDeadlineSeconds: 1800,
  retryLimit: 3,
  retryDelaySeconds: 30,
  retryBackoff: true,
  retentionDays: 30,
} as const satisfies JobQueuePolicy;

/**
 * Recompute resolves selectors, appends validity assertions and rebuilds only the projection kinds
 * that declare a dependency on a changed axis. It is bounded by the resolved cardinality rather than
 * by media work, so it sits between the two: longer than a foundation job, far shorter than a
 * publication. Retention matches publication because an impact is audit-bearing.
 */
export const contentImpactRecomputeJobPolicy = {
  revision: "job-policy/content-impact-recompute-v1",
  concurrency: 1,
  leaseSeconds: 120,
  heartbeatSeconds: 15,
  hardDeadlineSeconds: 900,
  retryLimit: 3,
  retryDelaySeconds: 15,
  retryBackoff: true,
  retentionDays: 30,
} as const satisfies JobQueuePolicy;

const queuePolicies: Readonly<Record<FoundationQueue, JobQueuePolicy>> = {
  projection_rebuild_v1: foundationJobPolicy,
  outbox_dispatch_v1: foundationJobPolicy,
  rights_reconcile_v1: foundationJobPolicy,
  content_publication_v1: contentPublicationJobPolicy,
  content_impact_recompute_v1: contentImpactRecomputeJobPolicy,
};

/** The policy that governs one queue. Every send, lease and retention decision reads it. */
export function jobPolicyFor(queue: FoundationQueue): JobQueuePolicy {
  return queuePolicies[queue];
}

export interface JobExecutionChecks {
  readonly contractCompatible: boolean;
  readonly ownerAuthorized: boolean;
  readonly tombstoned: boolean;
  readonly cancelled: boolean;
  readonly releaseCompatible: boolean;
  readonly deadlineExceeded: boolean;
}

export async function executeSemanticEffect(
  store: SemanticJobStore,
  job: SemanticJob,
  checks: JobExecutionChecks,
  effectIdentity: string,
  effectDigest: string,
): Promise<Result<"published" | "replayed" | "cancelled" | "quarantined", "conflict">> {
  if (
    !checks.contractCompatible ||
    !checks.ownerAuthorized ||
    !checks.releaseCompatible ||
    checks.tombstoned
  ) {
    const transition = await store.transition(
      job.id,
      job.revision,
      "quarantined",
      "FALLBACK.AUTHORIZATION_DENIED",
    );
    return transition.ok ? { ok: true, value: "quarantined" } : { ok: false, error: "conflict" };
  }
  if (checks.cancelled) {
    const transition = await store.transition(job.id, job.revision, "cancelled");
    return transition.ok ? { ok: true, value: "cancelled" } : { ok: false, error: "conflict" };
  }
  if (checks.deadlineExceeded) {
    const transition = await store.transition(job.id, job.revision, "expired");
    return transition.ok ? { ok: true, value: "quarantined" } : { ok: false, error: "conflict" };
  }
  const committed = await store.commitFoundationEffect(job, effectIdentity, effectDigest);
  if (!committed.ok) return { ok: false, error: "conflict" };
  return {
    ok: true,
    value: committed.value.disposition === "replayed" ? "replayed" : "published",
  };
}

export class PgBossTransport {
  private readonly boss: PgBoss;
  private started = false;

  public constructor(databaseUrl: string) {
    this.boss = new PgBoss({
      connectionString: databaseUrl,
      schema: "pgboss",
      migrate: false,
      createSchema: false,
      supervise: true,
      schedule: false,
    });
    this.boss.on("error", () => undefined);
  }

  public async start(
    handlers: Partial<Record<FoundationQueue, (payload: unknown) => Promise<void>>> = {},
  ): Promise<void> {
    await this.boss.start();
    for (const queue of foundationQueues) {
      const handler = handlers[queue];
      if (!handler) continue;
      await this.boss.work(
        queue,
        { batchSize: 1, pollingIntervalSeconds: 2 },
        async (jobs: Job[]) => {
          for (const job of jobs) {
            const payload = jobEnvelopeSchema.parse(job.data);
            // A queue only ever carries its own kind. Delivering a publication envelope to the
            // recompute handler would run the wrong effect under the right idempotency key.
            if (payload.kind !== queue) {
              throw new Error("Job envelope kind does not match its queue");
            }
            await handler(payload);
          }
        },
      );
    }
    this.started = true;
  }

  public async send(
    queue: FoundationQueue,
    payload: unknown,
    singletonKey: string,
  ): Promise<JobId> {
    if (!this.started) throw new Error("Job transport is not started");
    const parsed = jobEnvelopeSchema.parse(payload);
    if (parsed.kind !== queue) {
      throw new Error("Job envelope kind does not match its queue");
    }
    const policy = jobPolicyFor(queue);
    const id = await this.boss.send(queue, parsed, {
      singletonKey,
      retryLimit: policy.retryLimit,
      retryDelay: policy.retryDelaySeconds,
      retryBackoff: policy.retryBackoff,
      expireInSeconds: policy.leaseSeconds,
      retentionSeconds: policy.retentionDays * 86_400,
    });
    if (!id) throw new Error("Job transport rejected the closed queue request");
    return id as JobId;
  }

  public async stop(): Promise<void> {
    if (!this.started) return;
    this.started = false;
    await this.boss.stop({ graceful: true, timeout: 5_000 });
  }

  public isReady(): boolean {
    return this.started;
  }
}
