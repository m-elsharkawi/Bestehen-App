import type { SemanticJob, SemanticJobStore } from "@bestehen/application";
import { appId } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import { AesGcmSealer, HmacDigest, randomOpaqueToken } from "./crypto.js";
import { appSessionCookie, FakeEmailOtpIdentityAdapter } from "./identity/index.js";
import { executeSemanticEffect } from "./jobs/index.js";
import { deterministicProjectionChecksum } from "./projection-checksum.js";

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
  it("rolls back a failed atomic commit and replays exactly one foundation effect", async () => {
    const effects = new Map<string, string>();
    const job = {
      id: appId<"job">("job_foundation_00001"),
      learnerScopeId: appId<"learner_scope">("scope_owner_0000001"),
      kind: "projection_rebuild_v1" as const,
      semanticIdentity: "projection:scope:cut:1",
      state: "running" as const,
      revision: 2,
      payloadDigest: "a".repeat(64),
      attempt: 1,
      maximumAttempts: 3,
      deadline: new Date("2026-08-25T13:00:00.000Z"),
    };
    let persistedJob: SemanticJob = job;
    let failBeforeCommit = true;
    const store: SemanticJobStore = {
      async accept(input) {
        return { ok: true, value: input };
      },
      async transition() {
        return { ok: false, error: "conflict" };
      },
      async commitFoundationEffect(input, identity, digest) {
        const existing = effects.get(identity);
        if (existing && existing !== digest) return { ok: false, error: "effect_conflict" };
        if (existing) {
          return {
            ok: true,
            value: { disposition: "replayed", job: persistedJob },
          };
        }
        if (failBeforeCommit) throw new Error("synthetic atomic commit failure");
        persistedJob = { ...input, state: "published", revision: input.revision + 2 };
        effects.set(identity, digest);
        return {
          ok: true,
          value: { disposition: "created", job: persistedJob },
        };
      },
    };
    const checks = {
      contractCompatible: true,
      ownerAuthorized: true,
      tombstoned: false,
      cancelled: false,
      releaseCompatible: true,
      deadlineExceeded: false,
    };
    await expect(
      executeSemanticEffect(store, job, checks, "projection:1", "b".repeat(64)),
    ).rejects.toThrow("synthetic atomic commit failure");
    expect(effects.size).toBe(0);
    expect(persistedJob).toMatchObject({ state: "running", revision: 2 });

    failBeforeCommit = false;
    await expect(
      executeSemanticEffect(store, job, checks, "projection:1", "b".repeat(64)),
    ).resolves.toEqual({ ok: true, value: "published" });
    expect(effects.size).toBe(1);
    expect(persistedJob).toMatchObject({ state: "published", revision: 4 });
    await expect(
      executeSemanticEffect(store, job, checks, "projection:1", "b".repeat(64)),
    ).resolves.toEqual({ ok: true, value: "replayed" });
    expect(effects.size).toBe(1);
  });
});

describe("deterministic projection cut", () => {
  it("is reorder-stable and changes only when semantic source disposition changes", () => {
    const scope = appId<"learner_scope">("scope_owner_0000001");
    const sourceOne = {
      observationId: appId<"evidence_observation">("observation_owner_0001"),
      assertionId: appId<"validity_assertion">("assertion_owner_000001"),
      disposition: "included" as const,
    };
    const sourceTwo = {
      observationId: appId<"evidence_observation">("observation_owner_0002"),
      assertionId: appId<"validity_assertion">("assertion_owner_000002"),
      disposition: "excluded" as const,
      reasonCode: "VALIDITY.TECHNICAL_PREFLIGHT",
    };
    const sources = [sourceOne, sourceTwo];
    const base = {
      learnerScopeId: scope,
      kind: "capability" as const,
      sourceCut: 2,
      rulesRelease: "projection-rules/foundation-v1",
      sources,
    };
    expect(deterministicProjectionChecksum(base)).toBe(
      deterministicProjectionChecksum({ ...base, sources: [...sources].reverse() }),
    );
    expect(deterministicProjectionChecksum(base)).not.toBe(
      deterministicProjectionChecksum({
        ...base,
        sources: [{ ...sourceOne, disposition: "excluded" }, sourceTwo],
      }),
    );
    expect(sourceTwo).toMatchObject({
      observationId: "observation_owner_0002",
      disposition: "excluded",
    });
  });
});
