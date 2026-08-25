import type { SemanticJob, SemanticJobStore } from "@bestehen/application";
import { jobEnvelopeSchema } from "@bestehen/contracts";
import type { JobId, Result } from "@bestehen/domain";
import { type Job, PgBoss } from "pg-boss";

export const foundationQueues = [
  "projection_rebuild_v1",
  "outbox_dispatch_v1",
  "rights_reconcile_v1",
] as const;
export type FoundationQueue = (typeof foundationQueues)[number];

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
} as const;

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
    const id = await this.boss.send(queue, parsed, {
      singletonKey,
      retryLimit: foundationJobPolicy.retryLimit,
      retryDelay: foundationJobPolicy.retryDelaySeconds,
      retryBackoff: foundationJobPolicy.retryBackoff,
      expireInSeconds: foundationJobPolicy.leaseSeconds,
      retentionSeconds: foundationJobPolicy.retentionDays * 86_400,
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
