import { createHash } from "node:crypto";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  appId,
  appIdKinds,
  assistanceKinds,
  assistancePhases,
  attemptRuntimeStates,
  canHoldApprovalLevel,
  canTransitionAttemptRuntime,
  canTransitionContentApproval,
  canTransitionEvidenceValidity,
  canTransitionPlayback,
  canTransitionSemanticJob,
  type ContentApprovalLevel,
  contentApprovalLevels,
  contentClasses,
  contentRightsStates,
  evidenceValidityStates,
  exposureClasses,
  freshnessDecisions,
  impactCauseKinds,
  impactModes,
  independenceClasses,
  objectiveUnitOutcomeKinds,
  playbackStates,
  readinessStates,
  reasonFamilies,
  reasonRegistryRelease,
  reasonRegistryV1,
  semanticJobStates,
  timerIntegrityStates,
  validateValidityPartition,
} from "./index.js";

describe("appId", () => {
  it("accepts an opaque application identifier", () => {
    expect(appId<"correlation">("corr_01_stage01")).toBe("corr_01_stage01");
  });

  it("rejects short or unsafe identifiers", () => {
    expect(() => appId<"correlation">("vendor/1")).toThrow(/opaque/);
  });
});

describe("Stage 03 canonical domain", () => {
  it("keeps distinct App-owned identifiers and exact closed state unions", () => {
    expect(new Set(appIdKinds).size).toBe(47);
    expect(evidenceValidityStates).toEqual([
      "valid",
      "partially_valid",
      "pending",
      "interrupted",
      "not_counted",
    ]);
    expect(readinessStates).toEqual([
      "evidence_building",
      "not_ready",
      "borderline",
      "safe",
      "ready_to_book",
      "stale_contradicted",
    ]);
  });

  it("requires exact affected/unaffected partitions for partial and pending evidence", () => {
    expect(
      validateValidityPartition("partially_valid", ["written", "oral"], {
        affected: ["oral"],
        unaffected: ["written"],
      }),
    ).toMatchObject({ ok: true });
    expect(
      validateValidityPartition("pending", ["written", "oral"], {
        affected: ["oral"],
        unaffected: ["oral"],
      }),
    ).toEqual({ ok: false, error: "partition_overlap" });
  });

  it("has a complete reason-registry/v1 family set without learner-fault protocol reasons", () => {
    expect(new Set(reasonRegistryV1.map((entry) => entry.code.split(".")[0]))).toEqual(
      new Set(reasonFamilies),
    );
    expect(reasonRegistryV1.every((entry) => entry.major === 1 && !entry.learnerFault)).toBe(true);
  });

  it("never permits semantic jobs to leave terminal states", () => {
    const terminal = [
      "published",
      "cancelled",
      "failed_terminal",
      "expired",
      "quarantined",
      "superseded",
    ] as const;
    fc.assert(
      fc.property(
        fc.constantFrom(...terminal),
        fc.constantFrom(...semanticJobStates),
        (from, to) => {
          expect(canTransitionSemanticJob(from, to)).toBe(false);
        },
      ),
    );
  });

  it("exposes only explicitly audited validity reversals", () => {
    expect(canTransitionEvidenceValidity("interrupted", "valid")).toBe(true);
    expect(canTransitionEvidenceValidity("valid", "valid")).toBe(false);
  });
});

/**
 * Asserts a guard against a complete edge list: every listed pair must be legal and every other
 * ordered pair over the union — including self-transitions and every edge out of a terminal state —
 * must be rejected. A guard tested only on its happy path is not tested.
 */
function assertExhaustiveGuard<State extends string>(
  states: readonly State[],
  guard: (from: State, to: State) => boolean,
  legalEdges: readonly (readonly [State, State])[],
): void {
  const legal = new Set(legalEdges.map(([from, to]) => `${from}->${to}`));
  expect(legal.size).toBe(legalEdges.length);
  const observed: string[] = [];
  for (const from of states) {
    for (const to of states) {
      if (guard(from, to)) observed.push(`${from}->${to}`);
    }
  }
  expect(observed.sort()).toEqual([...legal].sort());
}

describe("P05-DOMAIN-001 Stage 05 semantic unions and transition guards", () => {
  it("keeps the Stage 05 unions exact and ordered", () => {
    expect(contentClasses).toEqual(["C0", "C1", "C2", "C3", "C4"]);
    expect(contentApprovalLevels).toEqual([
      "draft",
      "quarantine",
      "training",
      "independent_b1",
      "readiness_p4",
      "gold",
      "retired",
    ]);
    expect(contentRightsStates).toEqual(["current", "superseded", "withdrawn", "takedown"]);
    expect(attemptRuntimeStates).toEqual([
      "acquiring_manifest",
      "ready",
      "in_progress",
      "checkpointed",
      "submission_unknown",
      "submitted",
      "scoring",
      "interpreting_evidence",
      "result_available",
      "interrupted",
      "unavailable",
    ]);
    expect(playbackStates).toEqual([
      "unprepared",
      "preflighting",
      "setup_blocked",
      "ready",
      "authorized",
      "playing",
      "completed",
      "faulted",
      "interrupted",
      "block_complete",
      "protected",
    ]);
    expect(objectiveUnitOutcomeKinds).toEqual([
      "correct",
      "incorrect",
      "blank",
      "structurally_invalid",
    ]);
    expect(independenceClasses).toEqual([
      "first_attempt",
      "immediate_retry",
      "delayed_transfer",
      "retention_check",
      "repeated_exposed_practice",
      "mock_measurement",
    ]);
    expect(assistanceKinds).toHaveLength(10);
    expect(assistancePhases).toEqual([
      "before_response",
      "during_response",
      "after_submission",
      "repair",
    ]);
    expect(exposureClasses[0]).toBe("unseen");
    expect(timerIntegrityStates).toEqual([
      "in_context_trusted",
      "cross_context_supported",
      "expired",
      "inconsistent",
      "insufficient",
    ]);
    expect(freshnessDecisions).toEqual([
      "fresh",
      "exposed_review",
      "not_independent",
      "unavailable",
    ]);
    expect(impactModes).toEqual([
      "serving_only",
      "visibility_redaction",
      "validity_change",
      "target_mapping_change",
      "reevaluation_required",
    ]);
    expect(impactCauseKinds).toHaveLength(9);
  });

  it("keeps the runtime and validity vocabularies separate where the architecture separates them", () => {
    // `not_counted` is a validity judgement, never a runtime lifecycle state.
    expect(evidenceValidityStates as readonly string[]).toContain("not_counted");
    expect(attemptRuntimeStates as readonly string[]).not.toContain("not_counted");
    // Correctness is never a validity state.
    for (const kind of objectiveUnitOutcomeKinds) {
      expect(evidenceValidityStates as readonly string[]).not.toContain(kind);
    }
    // `interrupted` is legitimately both: runtime continuity loss and a lost clean claim.
    expect(attemptRuntimeStates as readonly string[]).toContain("interrupted");
    expect(evidenceValidityStates as readonly string[]).toContain("interrupted");
    // The coaching lifecycle stays in Stage 07.
    for (const coaching of ["diagnose", "repair", "fresh_retry", "transfer_pending", "remember"]) {
      expect(attemptRuntimeStates as readonly string[]).not.toContain(coaching);
    }
  });

  it("implements the attempt runtime arrows exactly and stops at the result boundary", () => {
    assertExhaustiveGuard(attemptRuntimeStates, canTransitionAttemptRuntime, [
      ["acquiring_manifest", "ready"],
      ["acquiring_manifest", "unavailable"],
      ["ready", "in_progress"],
      ["in_progress", "checkpointed"],
      ["in_progress", "submission_unknown"],
      ["in_progress", "submitted"],
      ["in_progress", "interrupted"],
      ["checkpointed", "in_progress"],
      ["submission_unknown", "submitted"],
      ["submission_unknown", "in_progress"],
      ["submitted", "scoring"],
      ["scoring", "interpreting_evidence"],
      ["interpreting_evidence", "result_available"],
    ]);
  });

  it("never leaves an attempt terminal state and never skips scoring or interpretation", () => {
    for (const terminal of ["result_available", "interrupted", "unavailable"] as const) {
      for (const to of attemptRuntimeStates) {
        expect(canTransitionAttemptRuntime(terminal, to)).toBe(false);
      }
    }
    expect(canTransitionAttemptRuntime("submitted", "result_available")).toBe(false);
    expect(canTransitionAttemptRuntime("submitted", "interpreting_evidence")).toBe(false);
    expect(canTransitionAttemptRuntime("in_progress", "result_available")).toBe(false);
    expect(canTransitionAttemptRuntime("ready", "submitted")).toBe(false);
    expect(canTransitionAttemptRuntime("checkpointed", "submitted")).toBe(false);
  });

  it("implements the content approval arrows exactly", () => {
    assertExhaustiveGuard(contentApprovalLevels, canTransitionContentApproval, [
      ["draft", "quarantine"],
      ["draft", "training"],
      ["draft", "retired"],
      ["quarantine", "draft"],
      ["quarantine", "retired"],
      ["training", "independent_b1"],
      ["training", "gold"],
      ["training", "quarantine"],
      ["training", "retired"],
      ["independent_b1", "readiness_p4"],
      ["independent_b1", "gold"],
      ["independent_b1", "quarantine"],
      ["independent_b1", "retired"],
      ["readiness_p4", "gold"],
      ["readiness_p4", "quarantine"],
      ["readiness_p4", "retired"],
      ["gold", "quarantine"],
      ["gold", "retired"],
    ]);
  });

  it("never restores a quarantined revision straight to a serving level", () => {
    for (const level of ["training", "independent_b1", "readiness_p4", "gold"] as const) {
      expect(canTransitionContentApproval("quarantine", level)).toBe(false);
    }
    expect(canTransitionContentApproval("quarantine", "draft")).toBe(true);
    expect(canTransitionContentApproval("quarantine", "retired")).toBe(true);
  });

  it("keeps gold and readiness_p4 independent in both directions", () => {
    expect(canTransitionContentApproval("training", "gold")).toBe(true);
    expect(canTransitionContentApproval("readiness_p4", "gold")).toBe(true);
    expect(canTransitionContentApproval("gold", "readiness_p4")).toBe(false);
    expect(canTransitionContentApproval("training", "readiness_p4")).toBe(false);
    expect(canTransitionContentApproval("draft", "independent_b1")).toBe(false);
    expect(canTransitionContentApproval("retired", "draft")).toBe(false);
  });

  it("gates approval levels by class and fails an unknown class closed to draft", () => {
    const matrix: Readonly<Record<string, readonly ContentApprovalLevel[]>> = {
      C0: ["draft", "quarantine", "retired"],
      C1: ["draft", "quarantine", "training", "independent_b1", "retired"],
      C2: [...contentApprovalLevels],
      C3: ["draft", "quarantine", "training", "independent_b1", "retired"],
      C4: ["draft", "quarantine", "retired"],
    };
    for (const contentClass of contentClasses) {
      for (const level of contentApprovalLevels) {
        expect([contentClass, level, canHoldApprovalLevel(contentClass, level)]).toEqual([
          contentClass,
          level,
          matrix[contentClass]?.includes(level) ?? false,
        ]);
      }
    }
    for (const level of contentApprovalLevels) {
      expect(canHoldApprovalLevel("C9", level)).toBe(level === "draft");
      expect(canHoldApprovalLevel("", level)).toBe(level === "draft");
      expect(canHoldApprovalLevel("c2", level)).toBe(level === "draft");
    }
  });

  it("implements the playback arrows exactly and lets no fault award a replay", () => {
    assertExhaustiveGuard(playbackStates, canTransitionPlayback, [
      ["unprepared", "preflighting"],
      ["preflighting", "ready"],
      ["preflighting", "setup_blocked"],
      ["setup_blocked", "preflighting"],
      ["ready", "authorized"],
      ["authorized", "playing"],
      ["playing", "completed"],
      ["playing", "faulted"],
      ["playing", "interrupted"],
      ["completed", "ready"],
      ["completed", "block_complete"],
      ["faulted", "protected"],
      ["interrupted", "protected"],
    ]);
    expect(canTransitionPlayback("faulted", "ready")).toBe(false);
    expect(canTransitionPlayback("faulted", "playing")).toBe(false);
    expect(canTransitionPlayback("interrupted", "playing")).toBe(false);
    expect(canTransitionPlayback("protected", "ready")).toBe(false);
    expect(canTransitionPlayback("block_complete", "ready")).toBe(false);
    expect(canTransitionPlayback("unprepared", "playing")).toBe(false);
  });

  it("appends the Stage 05 reason codes without breaking the registry contract", () => {
    const codes = reasonRegistryV1.map((entry) => entry.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(new Set(codes.map((code) => code.split(".")[0]))).toEqual(new Set(reasonFamilies));
    expect(reasonRegistryV1.every((entry) => entry.major === 1 && !entry.learnerFault)).toBe(true);
    for (const code of [
      "VALIDITY.CONTENT_QUARANTINED_AFTER_PIN",
      "VALIDITY.MEDIA_INTEGRITY_FAILED",
      "VALIDITY.TIMER_INTEGRITY_LOST",
      "VALIDITY.RESPONSE_STRUCTURALLY_INVALID",
      "DIRECT.EXPOSED_FAMILY_PRACTICE",
      "DIRECT.PLAYBACK_CONDITION_ALTERED",
      "UNCERTAINTY.KEY_VALIDATOR_DISAGREEMENT",
      "FALLBACK.MEDIA_UNAVAILABLE",
      "FALLBACK.NO_ELIGIBLE_FAMILY",
      "FALLBACK.SUBMISSION_OUTCOME_UNKNOWN",
      "FALLBACK.CONTENT_UPDATE_REQUIRED",
    ]) {
      expect(codes).toContain(code);
    }
    expect(codes).toHaveLength(54);
    expect(reasonRegistryRelease).toEqual({ id: "reason-registry/v1.1", major: 1, minor: 1 });
  });

  it("pins the reason-registry digest so an unreviewed edit cannot ride along", () => {
    // `packages/infrastructure/src/postgres/migrations.ts` stores exactly this digest as the
    // registry release identity, so any change to a code, its owner, its retention class or its
    // order must be deliberate and must update this pin.
    expect(createHash("sha256").update(JSON.stringify(reasonRegistryV1)).digest("hex")).toBe(
      "e0d7062536bb41dc7fd8c7a655284348f70436d4ae773272ce582292437a42eb",
    );
    expect(
      reasonRegistryV1
        .filter((entry) => entry.retentionClass === "security")
        .map((entry) => entry.code),
    ).toEqual(["FALLBACK.AUTHORIZATION_DENIED"]);
  });
});
