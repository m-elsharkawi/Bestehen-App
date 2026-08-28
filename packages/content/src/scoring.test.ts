import { appId, objectiveUnitOutcomeKinds } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import { canonicalJson } from "./digest.js";
import type { ItemBinding } from "./model.js";
import {
  type CanonicalResponse,
  type ObjectiveSubmission,
  type OfficialRoleContext,
  type PinnedKey,
  type ResponseOperation,
  type ScoredUnitDescriptor,
  type ScoringPolicy,
  applyResponseOperation,
  canonicalResponseDigest,
  canonicalizeResponse,
  completenessProjection,
  emptyCanonicalResponse,
  isOfficialConversionEligible,
  noMatchRightId,
  scoreObjectiveSubmission,
  scoredUnitOutcomeKinds,
  unitOutcomeAttribution,
} from "./scoring.js";

const algorithmVersion = "objective-scoring/v1";

const policy: ScoringPolicy = {
  scoringPolicyRef: "policy-objective-v1",
  pointsPerCorrectUnit: 1,
  pointsPerIncorrectUnit: 0,
  pointsPerBlankUnit: 0,
  officialConversion: null,
};

function item(id: string): ReturnType<typeof appId<"content_item">> {
  return appId<"content_item">(id);
}

function unit(
  itemId: string,
  binding: ItemBinding,
  offeredIdentifiers: readonly string[],
  overrides: Partial<ScoredUnitDescriptor> = {},
): ScoredUnitDescriptor {
  return {
    itemId: item(itemId),
    binding,
    responseKind:
      binding.kind === "select"
        ? "single_select"
        : binding.kind === "match"
          ? "match"
          : "cloze_bank_candidate",
    responseCardinality: { min: 1, max: 1 },
    keyRevisionId: appId<"key_revision">(`key-${itemId}`),
    taskRef: "task-r2",
    offeredIdentifiers,
    ...overrides,
  };
}

function key(itemId: string, accepted: PinnedKey["acceptedResponseSet"]): PinnedKey {
  return {
    keyRevisionId: appId<"key_revision">(`key-${itemId}`),
    itemId: item(itemId),
    acceptedResponseSet: accepted,
    responseCardinality: { min: 1, max: 1 },
    scoringPolicyRef: "policy-objective-v1",
  };
}

function submission(
  units: readonly ScoredUnitDescriptor[],
  canonicalResponse: CanonicalResponse,
  overrides: Partial<ObjectiveSubmission> = {},
): ObjectiveSubmission {
  return {
    submissionId: appId<"submission">("sub-0001"),
    attemptId: appId<"attempt">("attempt-0001"),
    servingManifestId: appId<"serving_manifest">("manifest-0001"),
    formAndKeyVersions: {
      formRevisionId: null,
      contentReleaseIdentity: "stage-05-content-v1",
      keyRevisionIds: units.map((entry) => entry.keyRevisionId),
    },
    units,
    canonicalResponse,
    uncapturedItemIds: [],
    officialRoleContext: null,
    ...overrides,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Canonical response operations
 * ---------------------------------------------------------------------------------------------- */

describe("canonical response operations", () => {
  it("folds an operation log into a projection that ignores the order answers arrived in", () => {
    const forwards: readonly ResponseOperation[] = [
      { kind: "set_selection", itemId: "item-alpha", optionId: "opt-1" },
      { kind: "set_selection", itemId: "item-bravo", optionId: "opt-9" },
      { kind: "set_match", itemId: "item-c", leftId: "left-1", rightId: "right-3" },
    ];
    const backwards: readonly ResponseOperation[] = [
      { kind: "set_match", itemId: "item-c", leftId: "left-1", rightId: "right-3" },
      { kind: "set_selection", itemId: "item-bravo", optionId: "opt-9" },
      { kind: "set_selection", itemId: "item-alpha", optionId: "opt-1" },
    ];
    const left = canonicalizeResponse(forwards);
    const right = canonicalizeResponse(backwards);
    expect(left.issues).toEqual([]);
    expect(canonicalJson(left.response)).toBe(canonicalJson(right.response));
    expect(canonicalResponseDigest(left.response)).toBe(canonicalResponseDigest(right.response));
  });

  it("lets a later operation replace an earlier one for the same item", () => {
    const { response } = canonicalizeResponse([
      { kind: "set_selection", itemId: "item-alpha", optionId: "opt-1" },
      { kind: "set_selection", itemId: "item-alpha", optionId: "opt-2" },
    ]);
    expect(response.selections).toEqual({ "item-alpha": "opt-2" });
  });

  it("clears a selection and records an issue when there is nothing to clear", () => {
    const set = applyResponseOperation(emptyCanonicalResponse, {
      kind: "set_selection",
      itemId: "item-alpha",
      optionId: "opt-1",
    });
    const cleared = applyResponseOperation(set.response, {
      kind: "clear_selection",
      itemId: "item-alpha",
    });
    expect(cleared.response.selections).toEqual({});
    expect(cleared.issue).toBeUndefined();

    const again = applyResponseOperation(cleared.response, {
      kind: "clear_selection",
      itemId: "item-alpha",
    });
    expect(again.issue?.code).toBe("clear_without_selection");
    // The projection is returned unchanged: a local issue never discards work.
    expect(again.response).toEqual(cleared.response);
  });

  it("moves a bank candidate between gaps and refuses a move from an empty gap", () => {
    const placed = canonicalizeResponse([
      { kind: "place_candidate", itemId: "item-alpha", gapId: "gap-1", candidateId: "cand-x" },
      { kind: "move_candidate", itemId: "item-bravo", fromGapId: "gap-1", toGapId: "gap-2" },
    ]);
    expect(placed.response.placements).toEqual({
      "gap-2": { itemId: "item-bravo", candidateId: "cand-x" },
    });
    const bad = applyResponseOperation(placed.response, {
      kind: "move_candidate",
      itemId: "item-alpha",
      fromGapId: "gap-1",
      toGapId: "gap-3",
    });
    expect(bad.issue?.code).toBe("move_from_empty_gap");
  });

  it("records confirmed boundaries once, in a stable order", () => {
    const { response } = canonicalizeResponse([
      { kind: "confirm_boundary", boundaryId: "block-2" },
      { kind: "confirm_boundary", boundaryId: "block-1" },
      { kind: "confirm_boundary", boundaryId: "block-2" },
    ]);
    expect(response.confirmedBoundaries).toEqual(["block-1", "block-2"]);
  });

  it("produces one identical projection for every equivalent input path", () => {
    // Pointer: place directly. Keyboard select-then-place: place then correct. Number key: place.
    const pointer: readonly ResponseOperation[] = [
      { kind: "place_candidate", itemId: "item-alpha", gapId: "gap-1", candidateId: "cand-x" },
    ];
    const keyboard: readonly ResponseOperation[] = [
      { kind: "place_candidate", itemId: "item-alpha", gapId: "gap-1", candidateId: "cand-y" },
      { kind: "remove_candidate", itemId: "item-alpha", gapId: "gap-1" },
      { kind: "place_candidate", itemId: "item-alpha", gapId: "gap-1", candidateId: "cand-x" },
    ];
    expect(canonicalizeResponse(pointer).response).toEqual(canonicalizeResponse(keyboard).response);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Completeness
 * ---------------------------------------------------------------------------------------------- */

describe("completeness projection", () => {
  const expectations = [
    {
      itemId: item("item-alpha"),
      binding: { kind: "select" as const, questionId: "q-a" },
      responseKind: "single_select" as const,
    },
    {
      itemId: item("item-bravo"),
      binding: { kind: "select" as const, questionId: "q-b" },
      responseKind: "single_select" as const,
    },
  ];

  it("counts a deliberately empty captured item as blank", () => {
    const { response } = canonicalizeResponse([
      { kind: "set_selection", itemId: "item-alpha", optionId: "opt-1" },
    ]);
    expect(completenessProjection(response, expectations)).toEqual({
      expectedUnits: 2,
      capturedUnits: 2,
      answeredItemIds: ["item-alpha"],
      blankItemIds: ["item-bravo"],
      uncapturedItemIds: [],
      complete: false,
    });
  });

  it("never counts an uncaptured item as blank", () => {
    const { response } = canonicalizeResponse([
      { kind: "set_selection", itemId: "item-alpha", optionId: "opt-1" },
    ]);
    const projection = completenessProjection(response, expectations, [item("item-bravo")]);
    expect(projection.blankItemIds).toEqual([]);
    expect(projection.uncapturedItemIds).toEqual(["item-bravo"]);
    expect(projection.capturedUnits).toBe(1);
    // Complete over what was captured; the uncaptured unit is absence, handled elsewhere.
    expect(projection.complete).toBe(true);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Deterministic scoring
 * ---------------------------------------------------------------------------------------------- */

describe("deterministic scoring", () => {
  const units = [
    unit("item-alpha", { kind: "select", questionId: "q-a" }, ["opt-1", "opt-2", "opt-3"]),
    unit("item-bravo", { kind: "select", questionId: "q-b" }, ["opt-7", "opt-8", "opt-9"]),
  ];
  const pinnedKeys = [
    key("item-alpha", [{ kind: "option", optionId: "opt-2" }]),
    key("item-bravo", [{ kind: "option", optionId: "opt-8" }]),
  ];

  function scored(
    operations: readonly ResponseOperation[],
    overrides: Partial<ObjectiveSubmission> = {},
  ) {
    const { response } = canonicalizeResponse(operations);
    return scoreObjectiveSubmission(
      submission(units, response, overrides),
      pinnedKeys,
      policy,
      algorithmVersion,
    );
  }

  it("scores against the exact pinned key by semantic identity", () => {
    const result = scored([
      { kind: "set_selection", itemId: "item-alpha", optionId: "opt-2" },
      { kind: "set_selection", itemId: "item-bravo", optionId: "opt-7" },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.unitOutcomes.map((outcome) => outcome.kind)).toEqual([
      "correct",
      "incorrect",
    ]);
    expect(result.value.taskRollups).toEqual([
      {
        taskRef: "task-r2",
        scoredUnits: 2,
        correctUnits: 1,
        incorrectUnits: 1,
        blankUnits: 0,
        structurallyInvalidUnits: 0,
        rawPoints: 1,
        rawAccuracy: 0.5,
      },
    ]);
  });

  it("is a pure function: the same inputs always produce a byte-identical outcome", () => {
    const operations: readonly ResponseOperation[] = [
      { kind: "set_selection", itemId: "item-alpha", optionId: "opt-2" },
      { kind: "set_selection", itemId: "item-bravo", optionId: "opt-8" },
    ];
    const first = scored(operations);
    const second = scored(operations);
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(canonicalJson(first.value)).toBe(canonicalJson(second.value));
    expect(first.value.checksum).toBe(second.value.checksum);
  });

  it("keeps the replay checksum stable across a hundred re-scorings", () => {
    const operations: readonly ResponseOperation[] = [
      { kind: "set_selection", itemId: "item-bravo", optionId: "opt-8" },
      { kind: "set_selection", itemId: "item-alpha", optionId: "opt-3" },
    ];
    const baseline = scored(operations);
    expect(baseline.ok).toBe(true);
    if (!baseline.ok) return;
    const checksums = new Set<string>();
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const replay = scored(operations);
      if (replay.ok) checksums.add(replay.value.checksum);
    }
    expect([...checksums]).toEqual([baseline.value.checksum]);
  });

  it("scores identically when the offered options are presented in a different order", () => {
    const operations: readonly ResponseOperation[] = [
      { kind: "set_selection", itemId: "item-alpha", optionId: "opt-2" },
      { kind: "set_selection", itemId: "item-bravo", optionId: "opt-8" },
    ];
    const { response } = canonicalizeResponse(operations);
    const shuffled = [
      unit("item-alpha", { kind: "select", questionId: "q-a" }, ["opt-3", "opt-2", "opt-1"]),
      unit("item-bravo", { kind: "select", questionId: "q-b" }, ["opt-9", "opt-8", "opt-7"]),
    ];
    const declared = scoreObjectiveSubmission(
      submission(units, response),
      pinnedKeys,
      policy,
      algorithmVersion,
    );
    const reordered = scoreObjectiveSubmission(
      submission(shuffled, response),
      pinnedKeys,
      policy,
      algorithmVersion,
    );
    expect(declared.ok && reordered.ok).toBe(true);
    if (!declared.ok || !reordered.ok) return;
    // Position is never identity, so the checksum is unchanged by presentation order.
    expect(reordered.value.checksum).toBe(declared.value.checksum);
  });

  it("scores a matching item, including a deliberate no-match", () => {
    const matchUnits = [
      unit("item-mike", { kind: "match", leftId: "left-1" }, ["right-1", "right-2", "no_match"]),
    ];
    const matchKeys = [key("item-mike", [{ kind: "no_match", leftId: "left-1" }])];
    const { response } = canonicalizeResponse([
      { kind: "set_match", itemId: "item-mike", leftId: "left-1", rightId: noMatchRightId },
    ]);
    const result = scoreObjectiveSubmission(
      submission(matchUnits, response),
      matchKeys,
      policy,
      algorithmVersion,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.unitOutcomes[0]?.kind).toBe("correct");
  });
});

/* ------------------------------------------------------------------------------------------------
 * `blank` versus technical absence — the distinction that must never collapse
 * ---------------------------------------------------------------------------------------------- */

describe("blank is not technical absence", () => {
  const units = [
    unit("item-alpha", { kind: "select", questionId: "q-a" }, ["opt-1", "opt-2"]),
    unit("item-bravo", { kind: "select", questionId: "q-b" }, ["opt-7", "opt-8"]),
  ];
  const pinnedKeys = [
    key("item-alpha", [{ kind: "option", optionId: "opt-2" }]),
    key("item-bravo", [{ kind: "option", optionId: "opt-8" }]),
  ];
  const { response } = canonicalizeResponse([
    { kind: "set_selection", itemId: "item-alpha", optionId: "opt-2" },
  ]);

  it("records a deliberately empty captured item as blank, worth no point under the policy", () => {
    const result = scoreObjectiveSubmission(
      submission(units, response),
      pinnedKeys,
      policy,
      algorithmVersion,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const blank = result.value.unitOutcomes.find((outcome) => outcome.kind === "blank");
    expect(blank?.itemId).toBe("item-bravo");
    // A blank is scored: it enters the denominator and earns no point.
    expect(result.value.taskRollups[0]?.scoredUnits).toBe(2);
    expect(result.value.taskRollups[0]?.rawPoints).toBe(1);
    expect(result.value.uncapturedScope).toEqual([]);
    expect(result.value.supportedScope).toEqual(["item-alpha", "item-bravo"]);
  });

  it("keeps an uncaptured response out of the outcomes entirely, never as blank or incorrect", () => {
    const result = scoreObjectiveSubmission(
      submission(units, response, { uncapturedItemIds: [appId<"content_item">("item-bravo")] }),
      pinnedKeys,
      policy,
      algorithmVersion,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.unitOutcomes.map((outcome) => outcome.itemId)).toEqual(["item-alpha"]);
    expect(result.value.unitOutcomes.some((outcome) => outcome.kind === "blank")).toBe(false);
    expect(result.value.unitOutcomes.some((outcome) => outcome.kind === "incorrect")).toBe(false);
    // Absence travels out as its own scope for the evidence owner, not as a learner outcome.
    expect(result.value.uncapturedScope).toEqual(["item-bravo"]);
    expect(result.value.supportedScope).toEqual(["item-alpha"]);
    // The uncaptured unit is not in any denominator.
    expect(result.value.taskRollups[0]?.scoredUnits).toBe(1);
  });

  it("produces different checksums for a blank and for the same item uncaptured", () => {
    const asBlank = scoreObjectiveSubmission(
      submission(units, response),
      pinnedKeys,
      policy,
      algorithmVersion,
    );
    const asAbsent = scoreObjectiveSubmission(
      submission(units, response, { uncapturedItemIds: [appId<"content_item">("item-bravo")] }),
      pinnedKeys,
      policy,
      algorithmVersion,
    );
    expect(asBlank.ok && asAbsent.ok).toBe(true);
    if (!asBlank.ok || !asAbsent.ok) return;
    expect(asBlank.value.checksum).not.toBe(asAbsent.value.checksum);
  });
});

/* ------------------------------------------------------------------------------------------------
 * `structurally_invalid` is never learner failure
 * ---------------------------------------------------------------------------------------------- */

describe("structurally invalid is never learner failure", () => {
  const units = [unit("item-alpha", { kind: "select", questionId: "q-a" }, ["opt-1", "opt-2"])];
  const { response } = canonicalizeResponse([
    { kind: "set_selection", itemId: "item-alpha", optionId: "opt-2" },
  ]);

  it("attributes only structurally_invalid to the system or content", () => {
    expect(unitOutcomeAttribution("correct")).toBe("learner_response");
    expect(unitOutcomeAttribution("incorrect")).toBe("learner_response");
    expect(unitOutcomeAttribution("blank")).toBe("learner_response");
    expect(unitOutcomeAttribution("structurally_invalid")).toBe("system_or_content");
  });

  it("routes a missing key to structurally_invalid, never to incorrect", () => {
    const result = scoreObjectiveSubmission(
      submission(units, response),
      [],
      policy,
      algorithmVersion,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const outcome = result.value.unitOutcomes[0];
    expect(outcome?.kind).toBe("structurally_invalid");
    if (outcome?.kind === "structurally_invalid") {
      expect(outcome.issueCode).toBe("key_missing_for_item");
    }
    expect(result.value.structurallyInvalidScope).toEqual(["item-alpha"]);
    // It is excluded from every accuracy denominator, so it cannot depress a score.
    expect(result.value.taskRollups[0]?.scoredUnits).toBe(0);
    expect(result.value.taskRollups[0]?.rawAccuracy).toBeNull();
  });

  it("reports no accuracy rather than zero when nothing is scorable", () => {
    const result = scoreObjectiveSubmission(
      submission(units, response),
      [],
      policy,
      algorithmVersion,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.taskRollups[0]?.rawAccuracy).not.toBe(0);
    expect(result.value.taskRollups[0]?.rawAccuracy).toBeNull();
  });

  it("routes a response identity the learner was never offered to structurally_invalid", () => {
    const stray = [unit("item-alpha", { kind: "select", questionId: "q-a" }, ["opt-1"])];
    const result = scoreObjectiveSubmission(
      submission(stray, response),
      [key("item-alpha", [{ kind: "option", optionId: "opt-1" }])],
      policy,
      algorithmVersion,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const outcome = result.value.unitOutcomes[0];
    expect(outcome?.kind).toBe("structurally_invalid");
    if (outcome?.kind === "structurally_invalid") {
      expect(outcome.issueCode).toBe("response_identity_not_offered");
    }
  });

  it("routes a reused bank candidate to structurally_invalid rather than marking it wrong", () => {
    const gapUnits = [
      unit("item-alpha", { kind: "gap", gapId: "gap-1" }, ["cand-x", "cand-y"]),
      unit("item-bravo", { kind: "gap", gapId: "gap-2" }, ["cand-x", "cand-y"]),
    ];
    const gapKeys = [
      key("item-alpha", [{ kind: "candidate", gapId: "gap-1", candidateId: "cand-x" }]),
      key("item-bravo", [{ kind: "candidate", gapId: "gap-2", candidateId: "cand-y" }]),
    ];
    const { response: reused } = canonicalizeResponse([
      { kind: "place_candidate", itemId: "item-alpha", gapId: "gap-1", candidateId: "cand-x" },
      { kind: "place_candidate", itemId: "item-bravo", gapId: "gap-2", candidateId: "cand-x" },
    ]);
    const result = scoreObjectiveSubmission(
      submission(gapUnits, reused, { candidateReusePolicy: "at_most_once" }),
      gapKeys,
      policy,
      algorithmVersion,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      result.value.unitOutcomes.every((outcome) => outcome.kind === "structurally_invalid"),
    ).toBe(true);
    expect(result.value.structurallyInvalidScope).toEqual(["item-alpha", "item-bravo"]);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Official conversion
 * ---------------------------------------------------------------------------------------------- */

describe("official conversion", () => {
  const units = [unit("item-alpha", { kind: "select", questionId: "q-a" }, ["opt-1", "opt-2"])];
  const pinnedKeys = [key("item-alpha", [{ kind: "option", optionId: "opt-2" }])];
  const { response } = canonicalizeResponse([
    { kind: "set_selection", itemId: "item-alpha", optionId: "opt-2" },
  ]);
  const converting: ScoringPolicy = {
    ...policy,
    officialConversion: {
      targetBlueprintRelease: "telc-b1-blueprint/2026-01",
      officialPointsPerCorrectUnit: 5,
      maximumOfficialPoints: 75,
    },
  };
  const p4Role: OfficialRoleContext = {
    progressionProfile: "P4",
    approvalLevel: "readiness_p4",
    evidenceRole: "full_mock",
    approvalIsCurrent: true,
  };

  it("converts only for an approved current P4/mock role", () => {
    expect(isOfficialConversionEligible(p4Role)).toBe(true);
    expect(isOfficialConversionEligible({ ...p4Role, progressionProfile: "P3" })).toBe(false);
    expect(isOfficialConversionEligible({ ...p4Role, approvalLevel: "training" })).toBe(false);
    expect(isOfficialConversionEligible({ ...p4Role, evidenceRole: "learning_practice" })).toBe(
      false,
    );
    expect(isOfficialConversionEligible({ ...p4Role, approvalIsCurrent: false })).toBe(false);
    expect(isOfficialConversionEligible(null)).toBe(false);
  });

  it("emits no official conversion field at all for a P0-P3 microtask", () => {
    const result = scoreObjectiveSubmission(
      submission(units, response, {
        officialRoleContext: { ...p4Role, progressionProfile: "P2", approvalLevel: "training" },
      }),
      pinnedKeys,
      converting,
      algorithmVersion,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.rawOfficialConversion).toBeUndefined();
    expect(canonicalJson(result.value)).not.toContain("rawOfficialConversion");
  });

  it("converts raw correct units against the pinned blueprint, capped at the maximum", () => {
    const result = scoreObjectiveSubmission(
      submission(units, response, { officialRoleContext: p4Role }),
      pinnedKeys,
      converting,
      algorithmVersion,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.rawOfficialConversion).toEqual({
      targetBlueprintRelease: "telc-b1-blueprint/2026-01",
      officialPoints: 5,
      maximumOfficialPoints: 75,
    });
  });

  it("emits nothing when the policy pins no conversion, even for an eligible role", () => {
    const result = scoreObjectiveSubmission(
      submission(units, response, { officialRoleContext: p4Role }),
      pinnedKeys,
      policy,
      algorithmVersion,
    );
    expect(result.ok && result.value.rawOfficialConversion).toBeUndefined();
  });
});

/* ------------------------------------------------------------------------------------------------
 * Rejections and union parity
 * ---------------------------------------------------------------------------------------------- */

describe("rejections and union parity", () => {
  const units = [unit("item-alpha", { kind: "select", questionId: "q-a" }, ["opt-1"])];

  it("refuses negative marking", () => {
    const result = scoreObjectiveSubmission(
      submission(units, emptyCanonicalResponse),
      [key("item-alpha", [{ kind: "option", optionId: "opt-1" }])],
      { ...policy, pointsPerIncorrectUnit: -1 },
      algorithmVersion,
    );
    expect(result).toEqual({ ok: false, error: "negative_marking_not_permitted" });
  });

  it("refuses an unnamed algorithm version and a duplicated unit", () => {
    expect(
      scoreObjectiveSubmission(submission(units, emptyCanonicalResponse), [], policy, "  "),
    ).toEqual({ ok: false, error: "algorithm_version_required" });
    expect(
      scoreObjectiveSubmission(
        submission([...units, ...units], emptyCanonicalResponse),
        [],
        policy,
        algorithmVersion,
      ),
    ).toEqual({ ok: false, error: "duplicate_unit" });
  });

  it("scores into exactly the domain's four unit outcome kinds", () => {
    expect(scoredUnitOutcomeKinds).toBe(objectiveUnitOutcomeKinds);
    expect([...scoredUnitOutcomeKinds]).toEqual([
      "correct",
      "incorrect",
      "blank",
      "structurally_invalid",
    ]);
  });

  it("records no scoring instant, because a clock is not an input to a pure function", () => {
    const result = scoreObjectiveSubmission(
      submission(units, emptyCanonicalResponse),
      [key("item-alpha", [{ kind: "option", optionId: "opt-1" }])],
      policy,
      algorithmVersion,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const serialized = canonicalJson(result.value);
    expect(serialized).not.toContain("scoredAt");
    expect(serialized).not.toContain("outcomeId");
  });
});
