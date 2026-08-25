import { appId } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import {
  type AppSessionRecord,
  authorize,
  type Clock,
  isRecentAuthentication,
  type ProviderConfigurationCheck,
  resolveSessionState,
  safeReturnPath,
  sessionPolicyV1,
  validateUnsafeRequest,
} from "./index.js";

describe("application ports", () => {
  it("keep the clock replaceable", () => {
    const clock: Clock = { now: () => new Date("2026-08-23T00:00:00.000Z") };
    expect(clock.now().toISOString()).toBe("2026-08-23T00:00:00.000Z");
  });

  it("shares a provider-neutral configuration-check vocabulary", () => {
    const check = {
      status: "not_ready",
      reason: "timeout",
      retryable: true,
    } satisfies ProviderConfigurationCheck;
    expect(check).toEqual({ status: "not_ready", reason: "timeout", retryable: true });
  });
});

describe("Stage 03 authorization and session policy", () => {
  const now = new Date("2026-08-25T12:00:00.000Z");
  const ownerScope = {
    principalId: appId<"principal">("principal_owner_0001"),
    learnerScopeId: appId<"learner_scope">("scope_owner_0000001"),
    actorKind: "owner" as const,
    capabilities: [] as const,
    authenticatedAt: new Date(now.getTime() - 60_000),
  };

  it("denies absent and cross-scope principals at the use-case boundary", () => {
    expect(authorize(undefined, "owner_status:read", {}, now)).toEqual({
      ok: false,
      error: "not_available",
    });
    expect(
      authorize(
        ownerScope,
        "evidence:append",
        { learnerScopeId: appId<"learner_scope">("scope_attacker_0001") },
        now,
      ),
    ).toEqual({ ok: false, error: "not_available" });
  });

  it("enforces recent OTP independently from the session lifetime", () => {
    const stale = {
      ...ownerScope,
      authenticatedAt: new Date(
        now.getTime() - sessionPolicyV1.recentAuthenticationMilliseconds - 1,
      ),
    };
    expect(authorize(stale, "session:revoke_other", { requireRecentAuth: true }, now)).toEqual({
      ok: false,
      error: "recent_auth_required",
    });
  });

  it("expires opaque App sessions on idle and absolute boundaries", () => {
    const session: AppSessionRecord = {
      id: appId<"app_session">("session_owner_000001"),
      tokenDigest: "a".repeat(64),
      principalId: ownerScope.principalId,
      learnerScopeId: ownerScope.learnerScopeId,
      state: "active",
      createdAt: new Date(now.getTime() - 1_000),
      lastUsedAt: now,
      authenticatedAt: ownerScope.authenticatedAt,
      idleExpiresAt: new Date(now.getTime() + 1_000),
      absoluteExpiresAt: new Date(now.getTime() + 2_000),
    };
    expect(resolveSessionState(session, now).ok).toBe(true);
    expect(resolveSessionState(session, session.idleExpiresAt)).toEqual({
      ok: false,
      error: "idle_expired",
    });
    expect(isRecentAuthentication(session, now)).toBe(true);
  });

  it("allows only same-origin unsafe requests with CSRF proof", () => {
    expect(
      validateUnsafeRequest(
        { origin: "https://staging.example.test", "sec-fetch-site": "same-origin" },
        "https://staging.example.test",
        true,
      ),
    ).toEqual({ ok: true, value: true });
    expect(validateUnsafeRequest({}, "https://staging.example.test", true)).toEqual({
      ok: false,
      error: "origin_denied",
    });
  });

  it("closes open redirects", () => {
    expect(safeReturnPath("/account?tab=sessions")).toBe("/account?tab=sessions");
    expect(safeReturnPath("//attacker.invalid/path")).toBe("/");
  });
});
