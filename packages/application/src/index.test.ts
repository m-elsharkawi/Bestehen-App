import { appId } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import {
  type AppSessionRecord,
  type AttemptConditionSummary,
  type AuthorizationAction,
  authorize,
  type Clock,
  classifyInitialValidity,
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

describe("P05-AUTHZ-001 Stage 05 authorization actions", () => {
  const now = new Date("2026-09-01T12:00:00.000Z");
  const ownerScope = {
    principalId: appId<"principal">("principal_owner_0001"),
    learnerScopeId: appId<"learner_scope">("scope_owner_0000001"),
    actorKind: "owner" as const,
    capabilities: [] as const,
    authenticatedAt: new Date(now.getTime() - 60_000),
  };
  const stage05Actions: readonly AuthorizationAction[] = [
    "content:publish",
    "content:quarantine",
    "content:report",
    "attempt:create",
    "attempt:checkpoint",
    "attempt:submit",
    "attempt:read_result",
    "media:authorize",
  ];

  it("admits the owner to every Stage 05 action", () => {
    for (const action of stage05Actions) {
      expect(authorize(ownerScope, action, {}, now)).toEqual({ ok: true, value: ownerScope });
    }
  });

  it("denies a worker or operator without the explicit capability", () => {
    for (const actorKind of ["worker", "operator"] as const) {
      const scope = { ...ownerScope, actorKind, capabilities: ["content:publish"] as const };
      expect(authorize(scope, "content:publish", {}, now).ok).toBe(true);
      expect(authorize(scope, "attempt:submit", {}, now)).toEqual({
        ok: false,
        error: "not_available",
      });
    }
  });

  it("denies every Stage 05 action across a learner scope boundary", () => {
    for (const action of stage05Actions) {
      expect(
        authorize(
          ownerScope,
          action,
          { learnerScopeId: appId<"learner_scope">("scope_attacker_0001") },
          now,
        ),
      ).toEqual({ ok: false, error: "not_available" });
    }
  });

  it("still enforces recent authentication where the caller requires it", () => {
    const stale = {
      ...ownerScope,
      authenticatedAt: new Date(
        now.getTime() - sessionPolicyV1.recentAuthenticationMilliseconds - 1,
      ),
    };
    expect(authorize(stale, "content:publish", { requireRecentAuth: true }, now)).toEqual({
      ok: false,
      error: "recent_auth_required",
    });
    expect(authorize(stale, "content:publish", {}, now).ok).toBe(true);
  });

  it("denies an action absent from the union and from the owner list", () => {
    expect(authorize(ownerScope, "content:invent" as AuthorizationAction, {}, now)).toEqual({
      ok: false,
      error: "not_available",
    });
    expect(authorize(undefined, "attempt:submit", {}, now)).toEqual({
      ok: false,
      error: "not_available",
    });
  });
});

describe("P05-AUTHZ-001 classifyInitialValidity", () => {
  const supportedScope = ["reading.r1.gist", "reading.r1.detail"];
  const clean: AttemptConditionSummary = {
    nonLearnerFaultScope: [],
    continuityLostScope: [],
    timerIntegrity: "in_context_trusted",
    independenceClass: "first_attempt",
  };
  const outcome = { supportedScope, structurallyInvalidScope: [] };

  it("is a pure function of its three arguments", () => {
    const first = classifyInitialValidity(outcome, clean, "published");
    const second = classifyInitialValidity(outcome, clean, "published");
    expect(first).toEqual(second);
    // Repeated evaluation across simulated time cannot move the answer: there is no clock to read.
    const realNow = Date.now;
    try {
      Date.now = () => 4_102_444_800_000;
      expect(classifyInitialValidity(outcome, clean, "published")).toEqual(first);
    } finally {
      Date.now = realNow;
    }
    // The inputs are not mutated.
    expect(outcome.supportedScope).toEqual(supportedScope);
    expect(clean.continuityLostScope).toEqual([]);
  });

  it("treats a wrong answer at fair conditions as valid evidence", () => {
    // Correctness is not an input at all: the classifier never sees unit outcomes.
    expect(classifyInitialValidity(outcome, clean, "published")).toEqual({
      ok: true,
      value: {
        state: "valid",
        partition: { affected: [], unaffected: supportedScope },
        basis: "complete_supported_scope",
      },
    });
  });

  it("classifies the five initial states from the conditions that produce them", () => {
    const cases = [
      {
        name: "whole-scope non-learner fault",
        outcome,
        conditions: { ...clean, nonLearnerFaultScope: supportedScope },
        contentStatus: "published" as const,
        state: "not_counted",
        basis: "non_learner_fault",
      },
      {
        name: "scoped non-learner fault",
        outcome,
        conditions: { ...clean, nonLearnerFaultScope: ["reading.r1.detail"] },
        contentStatus: "published" as const,
        state: "partially_valid",
        basis: "non_learner_fault",
      },
      {
        name: "whole-scope continuity loss",
        outcome,
        conditions: { ...clean, continuityLostScope: supportedScope },
        contentStatus: "published" as const,
        state: "interrupted",
        basis: "continuity_lost",
      },
      {
        name: "irreconstructible timer",
        outcome,
        conditions: { ...clean, timerIntegrity: "insufficient" as const },
        contentStatus: "published" as const,
        state: "interrupted",
        basis: "timer_integrity_lost",
      },
      {
        name: "scoped structurally invalid response",
        outcome: { supportedScope, structurallyInvalidScope: ["reading.r1.detail"] },
        conditions: clean,
        contentStatus: "published" as const,
        state: "pending",
        basis: "response_structurally_invalid",
      },
      {
        name: "content quarantined after pin",
        outcome,
        conditions: clean,
        contentStatus: "quarantined_after_pin" as const,
        state: "pending",
        basis: "content_interpretation_outstanding",
      },
    ];
    for (const testCase of cases) {
      const result = classifyInitialValidity(
        testCase.outcome,
        testCase.conditions,
        testCase.contentStatus,
      );
      expect([testCase.name, result.ok && result.value.state]).toEqual([
        testCase.name,
        testCase.state,
      ]);
      expect([testCase.name, result.ok && result.value.basis]).toEqual([
        testCase.name,
        testCase.basis,
      ]);
    }
  });

  it("never treats a structurally invalid response as learner failure", () => {
    const result = classifyInitialValidity(
      { supportedScope, structurallyInvalidScope: ["reading.r1.detail"] },
      clean,
      "published",
    );
    expect(result.ok && result.value.state).toBe("pending");
    expect(result.ok && result.value.reasonCode).toBe("VALIDITY.RESPONSE_STRUCTURALLY_INVALID");
    expect(result.ok && result.value.partition).toEqual({
      affected: ["reading.r1.detail"],
      unaffected: ["reading.r1.gist"],
    });
  });

  it("resolves overlapping conditions most-determined first", () => {
    const result = classifyInitialValidity(
      { supportedScope, structurallyInvalidScope: supportedScope },
      { ...clean, nonLearnerFaultScope: supportedScope, continuityLostScope: supportedScope },
      "quarantined_after_pin",
    );
    expect(result.ok && result.value.state).toBe("not_counted");
    expect(result.ok && result.value.basis).toBe("non_learner_fault");
  });

  it("produces a disjoint exhaustive partition and carries no fault reason when valid", () => {
    const partialResult = classifyInitialValidity(
      outcome,
      { ...clean, nonLearnerFaultScope: ["reading.r1.detail"] },
      "published",
    );
    expect(partialResult.ok).toBe(true);
    if (partialResult.ok) {
      const { affected, unaffected } = partialResult.value.partition;
      expect(affected.some((entry) => unaffected.includes(entry))).toBe(false);
      expect([...affected, ...unaffected].sort()).toEqual([...supportedScope].sort());
      expect(partialResult.value.reasonCode).toBe("FALLBACK.TECHNICAL_FAULT");
    }
    const validResult = classifyInitialValidity(outcome, clean, "published");
    expect(validResult.ok && "reasonCode" in validResult.value).toBe(false);
  });

  it("ignores fault scope that is not part of the supported scope, and needs a supported scope", () => {
    expect(
      classifyInitialValidity(
        outcome,
        { ...clean, nonLearnerFaultScope: ["speaking.s1"] },
        "published",
      ),
    ).toEqual({
      ok: true,
      value: {
        state: "valid",
        partition: { affected: [], unaffected: supportedScope },
        basis: "complete_supported_scope",
      },
    });
    expect(
      classifyInitialValidity(
        { supportedScope: [], structurallyInvalidScope: [] },
        clean,
        "published",
      ),
    ).toEqual({ ok: false, error: "supported_scope_required" });
  });
});
