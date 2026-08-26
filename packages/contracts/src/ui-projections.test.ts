import {
  deletionStates,
  draftConflictStates,
  exportStates,
  isSupportedUiProjection,
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
