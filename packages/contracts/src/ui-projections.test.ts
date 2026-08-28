import {
  attemptRuntimeUiStates,
  consequentialUiProjectionStates,
  contentServingStates,
  deletionStates,
  draftConflictStates,
  exportStates,
  isSupportedUiProjection,
  semanticStatuses,
  sessionNoticeStates,
  statusForState,
  transferStates,
  uiCapabilityStates,
  uiProjectionVersion,
} from "./ui-projections.js";
import { describe, expect, it } from "vitest";

describe("P04-SEMANTIC-001 UI projection contract", () => {
  it("keeps asynchronous and recovery states exact", () => {
    expect(uiCapabilityStates).toEqual([
      "processing",
      "slow",
      "pending",
      "partial",
      "unavailable",
      "retry_fresh",
    ]);
    expect(sessionNoticeStates).toHaveLength(5);
    expect(transferStates).toHaveLength(6);
    expect(exportStates).toHaveLength(5);
    expect(deletionStates).toHaveLength(7);
    expect(draftConflictStates).toEqual(["compare", "select", "merge"]);
  });

  it("fails an unknown contract major or state closed", () => {
    expect(isSupportedUiProjection({ contract: uiProjectionVersion, state: "safe" })).toBe(true);
    expect(isSupportedUiProjection({ contract: { major: 2, minor: 0 }, state: "safe" })).toBe(
      false,
    );
    expect(
      isSupportedUiProjection({ contract: uiProjectionVersion, state: "probably_ready" }),
    ).toBe(false);
  });

  it("maps status by meaning rather than styling booleans", () => {
    expect(statusForState("safe")).toBe("positive");
    expect(statusForState("borderline")).toBe("attention");
    expect(statusForState("not_ready")).toBe("risk");
    expect(statusForState("interrupted")).toBe("system");
  });
});

describe("P05-CONTRACT-001 Stage 05 UI projection states", () => {
  it("appends the content serving and attempt runtime states in the accepted order", () => {
    expect(contentServingStates).toEqual([
      "available",
      "loading_media",
      "unavailable_no_fresh_family",
      "unavailable_rights_or_target",
      "quarantined_after_pin",
      "media_failed_not_counted",
      "replacement_ready",
      "update_required",
    ]);
    expect(attemptRuntimeUiStates).toEqual([
      "acquiring_manifest",
      "in_progress",
      "checkpointed",
      "submission_unknown",
      "submitted",
      "scoring",
      "result_available",
    ]);
    // Order is load-bearing: `assertSemanticUnionParity` compares the coverage manifest with
    // `declared.join("|") !== actual.join("|")`, so the Stage 05 block is appended, never spliced.
    expect(consequentialUiProjectionStates.slice(-15)).toEqual([
      ...contentServingStates,
      ...attemptRuntimeUiStates,
    ]);
  });

  it("reuses the states that already exist instead of duplicating them", () => {
    const stage05 = [...contentServingStates, ...attemptRuntimeUiStates] as readonly string[];
    for (const reused of [
      "pending",
      "partial",
      "unavailable",
      "interrupted",
      "not_counted",
      "failed",
      "completed",
      "retry_fresh",
      "ready",
      "expired",
    ]) {
      expect(stage05).not.toContain(reused);
      expect(consequentialUiProjectionStates as readonly string[]).toContain(reused);
    }
  });

  it("maps every state exhaustively, with no unmapped or invented status", () => {
    for (const state of consequentialUiProjectionStates) {
      expect(semanticStatuses as readonly string[]).toContain(statusForState(state));
    }
    expect(statusForState("available")).toBe("positive");
    expect(statusForState("result_available")).toBe("positive");
    expect(statusForState("quarantined_after_pin")).toBe("attention");
    expect(statusForState("submission_unknown")).toBe("attention");
    expect(statusForState("media_failed_not_counted")).toBe("system");
    expect(statusForState("scoring")).toBe("system");
  });

  it("still fails an unknown Stage 05 state closed", () => {
    expect(
      isSupportedUiProjection({ contract: uiProjectionVersion, state: "result_available" }),
    ).toBe(true);
    expect(isSupportedUiProjection({ contract: uiProjectionVersion, state: "diagnose" })).toBe(
      false,
    );
    expect(
      isSupportedUiProjection({ contract: { major: 2, minor: 0 }, state: "result_available" }),
    ).toBe(false);
  });
});
