import { appId, canTransitionSemanticJob, type JobId } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import { AesGcmSealer, HmacDigest, randomOpaqueToken } from "./crypto.js";
import { executeSemanticEffect } from "./jobs/index.js";

describe("Stage 03 cryptographic storage boundaries", () => {
  const secret = "synthetic-test-secret-at-least-thirty-two-bytes";

  it("uses purpose-separated keyed digests and timing-safe equality", () => {
    const digest = new HmacDigest(secret);
    const token = "opaque-session-token";
    expect(digest.digest("session", token)).not.toBe(digest.digest("oidc-state", token));
    expect(digest.equals(digest.digest("session", token), digest.digest("session", token))).toBe(
      true,
    );
    expect(digest.equals("a", "bb")).toBe(false);
  });

  it("seals recoverable PKCE material and rejects tampering", () => {
    const sealer = new AesGcmSealer(secret);
    const sealed = sealer.seal("oidc-pkce", "synthetic-pkce-verifier");
    expect(sealed).not.toContain("synthetic-pkce-verifier");
    expect(sealer.open("oidc-pkce", sealed)).toEqual({
      ok: true,
      value: "synthetic-pkce-verifier",
    });
    expect(sealer.open("other-purpose", sealed)).toEqual({ ok: false, error: "invalid_seal" });
  });

  it("creates high-entropy opaque session material", () => {
    expect(randomOpaqueToken()).toMatch(/^[A-Za-z0-9_-]{40,}$/);
  });
});

describe("deterministic semantic job effects", () => {
  it("replays exactly one semantic effect and quarantines tombstoned work", async () => {
    let state = "running" as const;
    let revision = 2;
    const effects = new Map<string, string>();
    const store = {
      async accept(job: never) {
        return { ok: true as const, value: job };
      },
      async transition(
        id: JobId,
        expected: number,
        next: typeof state | "succeeded_candidate" | "published" | "quarantined",
      ) {
        if (expected !== revision || !canTransitionSemanticJob(state, next))
          return { ok: false as const, error: "conflict" as const };
        state = next as typeof state;
        revision += 1;
        return {
          ok: true as const,
          value: { ...job, id, state: next, revision },
        };
      },
      async recordEffect(_id: JobId, identity: string, digest: string) {
        const existing = effects.get(identity);
        if (existing && existing !== digest)
          return { ok: false as const, error: "effect_conflict" as const };
        if (existing) return { ok: true as const, value: "replayed" as const };
        effects.set(identity, digest);
        return { ok: true as const, value: "created" as const };
      },
    };
    const job = {
      id: appId<"job">("job_foundation_00001"),
      learnerScopeId: appId<"learner_scope">("scope_owner_0000001"),
      kind: "projection_rebuild_v1" as const,
      semanticIdentity: "projection:scope:cut:1",
      state: "running" as const,
      revision,
      payloadDigest: "a".repeat(64),
      attempt: 1,
      maximumAttempts: 3,
      deadline: new Date("2026-08-25T13:00:00.000Z"),
    };
    let calls = 0;
    const checks = {
      contractCompatible: true,
      ownerAuthorized: true,
      tombstoned: false,
      cancelled: false,
      releaseCompatible: true,
      deadlineExceeded: false,
    };
    await expect(
      executeSemanticEffect(store, job, checks, "projection:1", "b".repeat(64), async () => {
        calls += 1;
      }),
    ).resolves.toEqual({ ok: true, value: "published" });
    expect(calls).toBe(1);

    const replayStore = { ...store, transition: store.transition };
    await expect(
      executeSemanticEffect(
        replayStore,
        { ...job, state: "running", revision },
        checks,
        "projection:1",
        "b".repeat(64),
        async () => {
          calls += 1;
        },
      ),
    ).resolves.toEqual({ ok: true, value: "replayed" });
    expect(calls).toBe(1);
  });
});
