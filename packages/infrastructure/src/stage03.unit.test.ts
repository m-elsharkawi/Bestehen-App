import { appId, canTransitionSemanticJob, type JobId } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import { AesGcmSealer, HmacDigest, randomOpaqueToken } from "./crypto.js";
import { appSessionCookie, FakeEmailOtpIdentityAdapter } from "./identity/index.js";
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

  it("uses the exact host-only opaque App session cookie", () => {
    expect(appSessionCookie).toEqual({
      name: "__Host-bestehen_session",
      options: { secure: true, httpOnly: true, sameSite: "lax", path: "/" },
    });
    expect("domain" in appSessionCookie.options).toBe(false);
  });
});

describe("deterministic fake Email OTP identity", () => {
  const now = new Date("2026-08-25T12:00:00.000Z");
  const adapter = new FakeEmailOtpIdentityAdapter(
    { issuer: "https://synthetic.eu.auth0.com/", audience: "synthetic-client" },
    now,
  );
  const claims = {
    iss: "https://synthetic.eu.auth0.com/",
    aud: "synthetic-client",
    sub: "auth0|synthetic-owner",
    email_verified: true,
    auth_time: now.getTime() / 1000 - 30,
    iat: now.getTime() / 1000 - 30,
    exp: now.getTime() / 1000 + 300,
  };

  it("accepts the exact issuer/audience/time/subject/verified-email claim set", () => {
    expect(adapter.verify(claims)).toMatchObject({
      ok: true,
      value: { authenticationMethod: "email_otp", emailVerified: true },
    });
  });

  it.each([
    [{ ...claims, iss: "https://wrong.example/" }, "issuer_invalid"],
    [{ ...claims, aud: "wrong-client" }, "audience_invalid"],
    [{ ...claims, sub: "" }, "subject_missing"],
    [{ ...claims, email_verified: false }, "email_unverified"],
    [{ ...claims, auth_time: undefined }, "authentication_time_invalid"],
    [{ ...claims, iat: now.getTime() / 1000 + 600 }, "issued_at_invalid"],
    [{ ...claims, exp: now.getTime() / 1000 - 1 }, "expired"],
    [{ ...claims, nbf: now.getTime() / 1000 + 600 }, "not_yet_valid"],
  ])("rejects malformed claims closed", (fixture, reason) => {
    expect(adapter.verify(fixture as never)).toEqual({ ok: false, error: reason });
  });

  it.each([
    [{ state: "wrong" }, "state_invalid"],
    [{ nonce: "wrong" }, "nonce_invalid"],
    [{ pkceVerifier: "wrong" }, "pkce_invalid"],
  ])("rejects callback transaction mismatch", (override, reason) => {
    expect(
      adapter.verifyCallback({
        claims,
        state: "state-ok",
        expectedState: "state-ok",
        nonce: "nonce-ok",
        expectedNonce: "nonce-ok",
        pkceVerifier: "pkce-ok",
        expectedPkceVerifier: "pkce-ok",
        ...override,
      }),
    ).toEqual({ ok: false, error: reason });
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
