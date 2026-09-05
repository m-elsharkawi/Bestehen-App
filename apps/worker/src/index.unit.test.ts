/**
 * `P05-JOB-001` — the two content queues: dispatch, retry, cancel, quarantine on an incompatible
 * contract, and an exactly-once effect. Plus the worker's existing configuration contract.
 *
 * The durable job store is an in-memory double that reproduces `PostgresFoundationRepository`'s
 * rules rather than approximating them: optimistic locking on `revision`, the domain's own
 * `canTransitionSemanticJob` guard, idempotent `accept` on `(scope, kind, semanticIdentity)`, and
 * `job_effect_receipts` keyed by `(job_id, effect_identity)`. The point of the double is that it can
 * be *inspected*: every transition and every receipt is recorded, so "exactly once" is a count over
 * what the store holds, not a claim about what the handler intended.
 */

import type { SemanticJob, SemanticJobStore } from "@bestehen/application";
import { contentReleaseIdentity } from "@bestehen/content";
import {
  appId,
  canTransitionSemanticJob,
  type JobId,
  type Result,
  type SemanticJobState,
} from "@bestehen/domain";
import { contentQueues, jobPolicyFor } from "@bestehen/infrastructure";
import { describe, expect, it } from "vitest";
import {
  type ContentJobEffect,
  type ContentJobRuntime,
  recordDurableEffectOnly,
  runContentJob,
  WorkerRuntime,
} from "./index.js";

/* ------------------------------------------------------------------------------------------------
 * The inspectable job store
 * ---------------------------------------------------------------------------------------------- */

interface RecordedTransition {
  readonly from: SemanticJobState;
  readonly to: SemanticJobState;
  readonly reasonCode?: string;
}

class InMemoryJobStore implements SemanticJobStore {
  public readonly jobs = new Map<string, SemanticJob>();
  public readonly transitions: RecordedTransition[] = [];
  public readonly receipts = new Map<string, string>();
  public scopeAvailable = true;

  private identityOf(job: SemanticJob): string {
    return `${job.learnerScopeId}:${job.kind}:${job.semanticIdentity}`;
  }

  public seed(job: SemanticJob): void {
    this.jobs.set(job.id, job);
  }

  public async accept(
    job: SemanticJob,
  ): Promise<Result<SemanticJob, "semantic_identity_conflict" | "not_available">> {
    if (!this.scopeAvailable) return { ok: false, error: "not_available" };
    const existing = [...this.jobs.values()].find(
      (candidate) => this.identityOf(candidate) === this.identityOf(job),
    );
    if (existing) {
      return existing.payloadDigest === job.payloadDigest
        ? { ok: true, value: existing }
        : { ok: false, error: "semantic_identity_conflict" };
    }
    this.jobs.set(job.id, job);
    return { ok: true, value: job };
  }

  public async transition(
    id: JobId,
    expectedRevision: number,
    state: SemanticJobState,
    reasonCode?: string,
  ): Promise<Result<SemanticJob, "conflict" | "illegal_transition" | "not_available">> {
    if (!this.scopeAvailable) return { ok: false, error: "not_available" };
    const current = this.jobs.get(id);
    if (!current || current.revision !== expectedRevision) return { ok: false, error: "conflict" };
    if (!canTransitionSemanticJob(current.state, state)) {
      return { ok: false, error: "illegal_transition" };
    }
    const next: SemanticJob = { ...current, state, revision: expectedRevision + 1 };
    this.jobs.set(id, next);
    this.transitions.push({
      from: current.state,
      to: state,
      ...(reasonCode ? { reasonCode } : {}),
    });
    return { ok: true, value: next };
  }

  public async commitFoundationEffect(
    job: SemanticJob,
    effectIdentity: string,
    effectDigest: string,
  ): Promise<
    Result<
      { readonly disposition: "created" | "replayed"; readonly job: SemanticJob },
      "effect_conflict" | "conflict" | "illegal_transition" | "not_available"
    >
  > {
    if (!this.scopeAvailable) return { ok: false, error: "not_available" };
    const current = this.jobs.get(job.id);
    if (
      !current ||
      current.kind !== job.kind ||
      current.semanticIdentity !== job.semanticIdentity ||
      current.learnerScopeId !== job.learnerScopeId ||
      current.payloadDigest !== job.payloadDigest
    ) {
      return { ok: false, error: "conflict" };
    }
    const receiptKey = `${job.id}:${effectIdentity}`;
    const stored = this.receipts.get(receiptKey);
    if (stored !== undefined) {
      if (stored !== effectDigest) return { ok: false, error: "effect_conflict" };
      if (current.state !== "published") return { ok: false, error: "conflict" };
      return { ok: true, value: { disposition: "replayed", job: current } };
    }
    if (current.revision !== job.revision) return { ok: false, error: "conflict" };
    if (!canTransitionSemanticJob(current.state, "succeeded_candidate")) {
      return { ok: false, error: "illegal_transition" };
    }
    this.receipts.set(receiptKey, effectDigest);
    const published: SemanticJob = {
      ...current,
      state: "published",
      revision: job.revision + 2,
    };
    this.jobs.set(job.id, published);
    this.transitions.push({ from: current.state, to: "succeeded_candidate" });
    this.transitions.push({ from: "succeeded_candidate", to: "published" });
    return { ok: true, value: { disposition: "created", job: published } };
  }

  public statesReached(): readonly SemanticJobState[] {
    return this.transitions.map((entry) => entry.to);
  }
}

/* ------------------------------------------------------------------------------------------------
 * Fixtures
 * ---------------------------------------------------------------------------------------------- */

const jobId = "job-0000000000000001";
const learnerScopeId = "scope-000000000001";
const semanticIdentity = "content-release/2026-09-01#1";
const payloadDigest = "a".repeat(64);
const deadline = "2026-09-01T12:00:00.000Z";
const beforeDeadline = new Date("2026-09-01T11:00:00.000Z");
const afterDeadline = new Date("2026-09-01T13:00:00.000Z");

function envelope(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contract: { kind: "foundation", major: 1, minor: 0 },
    jobId,
    kind: "content_publication_v1",
    semanticIdentity,
    learnerScopeId,
    owner: "content",
    attempt: 0,
    deadline,
    payloadDigest,
    selector: {},
    ...overrides,
  };
}

interface Harness {
  readonly store: InMemoryJobStore;
  readonly runtime: ContentJobRuntime;
  readonly calls: { count: number };
}

function harness(
  effect: ContentJobEffect = recordDurableEffectOnly,
  now: Date = beforeDeadline,
): Harness {
  const store = new InMemoryJobStore();
  const calls = { count: 0 };
  const counted: ContentJobEffect = async (job, parsed) => {
    calls.count += 1;
    return effect(job, parsed);
  };
  return {
    store,
    calls,
    runtime: {
      jobs: store,
      effects: {
        content_publication_v1: counted,
        content_impact_recompute_v1: counted,
      },
      contentReleaseIdentity,
      now: () => now,
    },
  };
}

/** A durable job resource already in a given state, as a prior delivery would have left it. */
function seededJob(overrides: Partial<SemanticJob> = {}): SemanticJob {
  return {
    id: appId<"job">(jobId),
    learnerScopeId: appId<"learner_scope">(learnerScopeId),
    kind: "content_publication_v1",
    semanticIdentity,
    state: "accepted",
    revision: 1,
    payloadDigest,
    attempt: 0,
    maximumAttempts: jobPolicyFor("content_publication_v1").retryLimit + 1,
    deadline: new Date(deadline),
    ...overrides,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Dispatch
 * ---------------------------------------------------------------------------------------------- */

describe("P05-JOB-001 content job dispatch", () => {
  it("runs each content queue's own envelope through to a published effect", async () => {
    for (const queue of contentQueues) {
      const { store, runtime, calls } = harness();
      expect(await runContentJob(runtime, queue, envelope({ kind: queue })), queue).toBe(
        "published",
      );
      expect(calls.count, queue).toBe(1);
      expect(store.statesReached(), queue).toEqual([
        "scheduled",
        "running",
        "succeeded_candidate",
        "published",
      ]);
      // The accepted resource carries the queue's own retry budget, not the foundation one.
      expect(store.jobs.get(jobId)?.maximumAttempts, queue).toBe(
        jobPolicyFor(queue).retryLimit + 1,
      );
    }
  });

  it("refuses an envelope delivered to the wrong queue before it touches the store", async () => {
    const { store, runtime, calls } = harness();
    await expect(runContentJob(runtime, "content_impact_recompute_v1", envelope())).rejects.toThrow(
      /does not match its queue/,
    );
    expect(store.jobs.size).toBe(0);
    expect(calls.count).toBe(0);
  });

  it("refuses a malformed envelope before it touches the store", async () => {
    const malformed: readonly Record<string, unknown>[] = [
      envelope({ contract: { kind: "foundation", major: 2, minor: 0 } }),
      envelope({ payloadDigest: "not-a-digest" }),
      envelope({ semanticIdentity: "short" }),
      envelope({ owner: "operations-and-content" }),
      envelope({ attempt: -1 }),
      envelope({ unexpected: "field" }),
    ];
    for (const payload of malformed) {
      const { store, runtime, calls } = harness();
      await expect(
        runContentJob(runtime, "content_publication_v1", payload),
        JSON.stringify(payload).slice(0, 60),
      ).rejects.toThrow();
      expect(store.jobs.size).toBe(0);
      expect(calls.count).toBe(0);
    }
  });

  it("registers a handler for both content queues and none for the foundation queues", () => {
    const runtime = new WorkerRuntime({
      BESTEHEN_APP_ENV: "staging",
      BESTEHEN_RELEASE_COMMIT: "synthetic-commit",
      DATABASE_URL: "postgresql://synthetic_worker:synthetic@database.invalid/synthetic",
      BESTEHEN_WORKER_DATABASE_URL:
        "postgresql://synthetic_worker:synthetic@database.invalid/synthetic",
    });
    expect(Object.keys(runtime.contentQueueHandlers()).sort()).toEqual([...contentQueues].sort());
  });
});

/* ------------------------------------------------------------------------------------------------
 * Exactly-once
 * ---------------------------------------------------------------------------------------------- */

describe("P05-JOB-001 a content job effect happens exactly once", () => {
  it("replays a redelivery of a published job without a second effect or a second receipt", async () => {
    const { store, runtime, calls } = harness();
    expect(await runContentJob(runtime, "content_publication_v1", envelope())).toBe("published");
    expect(await runContentJob(runtime, "content_publication_v1", envelope())).toBe("replayed");
    expect(await runContentJob(runtime, "content_publication_v1", envelope({ attempt: 1 }))).toBe(
      "replayed",
    );
    expect(calls.count).toBe(1);
    expect(store.receipts.size).toBe(1);
    expect(store.statesReached().filter((state) => state === "published")).toHaveLength(1);
  });

  it("refuses a redelivery whose effect computes a different digest under the same identity", async () => {
    // The delivery finds the job already leased into `running` with a receipt from the interrupted
    // attempt. A different digest under the same effect identity is a second, different effect —
    // never an overwrite.
    const { store, runtime, calls } = harness(async (_job, parsed) => ({
      ok: true,
      value: { effectIdentity: parsed.semanticIdentity, effectDigest: "b".repeat(64) },
    }));
    store.seed(seededJob({ state: "running", revision: 3 }));
    store.receipts.set(`${jobId}:${semanticIdentity}`, "c".repeat(64));
    expect(await runContentJob(runtime, "content_publication_v1", envelope())).toBe("conflict");
    expect(calls.count).toBe(1);
    expect(store.receipts.get(`${jobId}:${semanticIdentity}`)).toBe("c".repeat(64));
    expect(store.jobs.get(jobId)?.state).toBe("running");
  });

  it("never creates a second job resource for one semantic identity", async () => {
    const { store, runtime } = harness();
    await runContentJob(runtime, "content_publication_v1", envelope());
    await runContentJob(runtime, "content_publication_v1", envelope());
    expect(store.jobs.size).toBe(1);
  });

  it("refuses the same semantic identity under a different payload", async () => {
    const { store, runtime, calls } = harness();
    store.seed(seededJob());
    expect(
      await runContentJob(
        runtime,
        "content_publication_v1",
        envelope({ jobId: "job-0000000000000002", payloadDigest: "d".repeat(64) }),
      ),
    ).toBe("conflict");
    expect(calls.count).toBe(0);
    expect(store.jobs.size).toBe(1);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Retry
 * ---------------------------------------------------------------------------------------------- */

describe("P05-JOB-001 a failing content job retries within its budget and then stops", () => {
  const retryable: ContentJobEffect = async () => ({ ok: false, error: "retryable" });
  const permanent: ContentJobEffect = async () => ({ ok: false, error: "permanent" });

  it("schedules a retry while the budget lasts and records a technical fault", async () => {
    const { store, runtime } = harness(retryable);
    expect(await runContentJob(runtime, "content_publication_v1", envelope())).toBe(
      "retry_scheduled",
    );
    expect(store.transitions.at(-1)).toEqual({
      from: "running",
      to: "retry_scheduled",
      reasonCode: "FALLBACK.TECHNICAL_FAULT",
    });
    expect(store.receipts.size).toBe(0);
  });

  it("leases a retry-scheduled job again and can publish it", async () => {
    const { store, runtime, calls } = harness(retryable);
    expect(await runContentJob(runtime, "content_publication_v1", envelope())).toBe(
      "retry_scheduled",
    );
    // A later delivery of the same job, this time with a working effect.
    const recovered: ContentJobRuntime = {
      ...runtime,
      effects: {
        content_publication_v1: recordDurableEffectOnly,
        content_impact_recompute_v1: recordDurableEffectOnly,
      },
    };
    expect(await runContentJob(recovered, "content_publication_v1", envelope({ attempt: 1 }))).toBe(
      "published",
    );
    expect(store.statesReached()).toEqual([
      "scheduled",
      "running",
      "retry_scheduled",
      "running",
      "succeeded_candidate",
      "published",
    ]);
    expect(calls.count).toBe(1);
  });

  it("goes terminal when the retry budget is exhausted", async () => {
    const budget = jobPolicyFor("content_publication_v1").retryLimit + 1;
    const { store, runtime } = harness(retryable);
    store.seed(seededJob({ attempt: budget - 1 }));
    expect(await runContentJob(runtime, "content_publication_v1", envelope())).toBe(
      "failed_terminal",
    );
    expect(store.transitions.at(-1)).toEqual({
      from: "running",
      to: "failed_terminal",
      reasonCode: "FALLBACK.JOB_RETRY_EXHAUSTED",
    });
  });

  it("goes terminal on the first permanent failure without spending the retry budget", async () => {
    const { store, runtime } = harness(permanent);
    expect(await runContentJob(runtime, "content_publication_v1", envelope())).toBe(
      "failed_terminal",
    );
    expect(store.statesReached()).toEqual(["scheduled", "running", "failed_terminal"]);
    expect(store.transitions.at(-1)?.reasonCode).toBe("FALLBACK.TECHNICAL_FAULT");
  });

  it("does not lease a job that already reached a terminal state", async () => {
    for (const state of ["failed_terminal", "cancelled", "expired", "quarantined"] as const) {
      const { store, runtime, calls } = harness();
      store.seed(seededJob({ state }));
      expect(await runContentJob(runtime, "content_publication_v1", envelope()), state).toBe(
        "not_leasable",
      );
      expect(calls.count, state).toBe(0);
      expect(store.transitions, state).toEqual([]);
    }
  });
});

/* ------------------------------------------------------------------------------------------------
 * Cancel and quarantine
 * ---------------------------------------------------------------------------------------------- */

describe("P05-JOB-001 a content job is refused before any content work happens", () => {
  it("cancels a job whose cancellation was requested, and runs no effect", async () => {
    const { store, runtime, calls } = harness();
    store.seed(seededJob({ state: "cancel_requested" }));
    expect(await runContentJob(runtime, "content_publication_v1", envelope())).toBe("cancelled");
    expect(calls.count).toBe(0);
    expect(store.statesReached()).toEqual(["cancelled"]);
    expect(store.receipts.size).toBe(0);
  });

  it("quarantines an envelope that declares an incompatible content release", async () => {
    const { store, runtime, calls } = harness();
    expect(
      await runContentJob(
        runtime,
        "content_publication_v1",
        envelope({ selector: { contentReleaseIdentity: "stage-06-content-v9" } }),
      ),
    ).toBe("quarantined");
    expect(calls.count).toBe(0);
    expect(store.transitions).toEqual([
      { from: "accepted", to: "quarantined", reasonCode: "FALLBACK.AUTHORIZATION_DENIED" },
    ]);
    expect(store.receipts.size).toBe(0);
  });

  it("accepts an envelope that declares this worker's own content release", async () => {
    const { runtime } = harness();
    expect(
      await runContentJob(
        runtime,
        "content_publication_v1",
        envelope({ selector: { contentReleaseIdentity } }),
      ),
    ).toBe("published");
  });

  it("quarantines a job whose envelope claims an owner other than content", async () => {
    for (const owner of ["evidence", "operations", "profile"] as const) {
      const { store, runtime, calls } = harness();
      expect(
        await runContentJob(runtime, "content_publication_v1", envelope({ owner })),
        owner,
      ).toBe("quarantined");
      expect(calls.count, owner).toBe(0);
      expect(store.transitions.at(-1)?.reasonCode, owner).toBe("FALLBACK.AUTHORIZATION_DENIED");
    }
  });

  it("expires a job past its deadline instead of running it late", async () => {
    const { store, runtime, calls } = harness(recordDurableEffectOnly, afterDeadline);
    expect(await runContentJob(runtime, "content_publication_v1", envelope())).toBe("quarantined");
    expect(calls.count).toBe(0);
    expect(store.statesReached()).toEqual(["expired"]);
  });

  it("refuses a job for a scope that is tombstoned or otherwise unavailable", async () => {
    const { store, runtime, calls } = harness();
    store.scopeAvailable = false;
    expect(await runContentJob(runtime, "content_publication_v1", envelope())).toBe(
      "not_available",
    );
    expect(calls.count).toBe(0);
    expect(store.jobs.size).toBe(0);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Configuration — unchanged Stage 03 contract
 * ---------------------------------------------------------------------------------------------- */

describe("worker configuration", () => {
  it("fails before opening a listener when configuration is incomplete", () => {
    expect(() => new WorkerRuntime({ BESTEHEN_APP_ENV: "test" })).toThrow(
      /Invalid server configuration/,
    );
  });

  it("accepts a staging worker with only its own role credential", () => {
    expect(
      () =>
        new WorkerRuntime({
          BESTEHEN_APP_ENV: "staging",
          BESTEHEN_RELEASE_COMMIT: "synthetic-commit",
          DATABASE_URL: "postgresql://synthetic_worker:synthetic@database.invalid/synthetic",
          BESTEHEN_WORKER_DATABASE_URL:
            "postgresql://synthetic_worker:synthetic@database.invalid/synthetic",
        }),
    ).not.toThrow();
  });
});
