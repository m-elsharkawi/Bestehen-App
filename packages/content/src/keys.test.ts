import { appId } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import {
  acceptedResponseIdentity,
  assertNoKeyBearingFields,
  findKeyBearingFields,
  keyBearingFieldNames,
  requiresQuarantine,
  sealObjectiveKeyRevision,
  validateObjectiveKeyRevision,
  type AcceptedResponse,
  type ObjectiveKeyRevision,
} from "./keys.js";

const offeredResponseIdentifiers = ["option-alpha", "option-beta", "option-gamma"];

interface KeyOverrides {
  readonly acceptedResponseSet?: readonly AcceptedResponse[];
  readonly responseCardinality?: { readonly min: number; readonly max: number };
  readonly agreedWithProposedKey?: boolean;
  readonly distractorIds?: readonly string[];
  readonly decisiveEvidence?: boolean;
  readonly causeMappingFor?: readonly string[];
}

function key(overrides: KeyOverrides = {}): ObjectiveKeyRevision {
  return sealObjectiveKeyRevision({
    keyRevisionId: appId<"key_revision">("key-revision-0001"),
    itemId: appId<"content_item">("content-item-0001"),
    acceptedResponseSet: overrides.acceptedResponseSet ?? [
      { kind: "option", optionId: "option-alpha" },
    ],
    responseCardinality: overrides.responseCardinality ?? { min: 1, max: 1 },
    scoringPolicyRef: "scoring-policy/objective-v1",
    decisiveEvidenceRefs:
      overrides.decisiveEvidence === false
        ? []
        : [
            {
              stimulusId: "article-1",
              anchorId: "anchor-1",
              safeRevealSpanOrRelation: "Der Kurs beginnt am Montag.",
              relationKind: "direct_span",
            },
          ],
    correctRationale: "Nur Alpha erfüllt die Bedingung.",
    distractorRationales: (overrides.distractorIds ?? ["option-beta", "option-gamma"]).map(
      (optionOrCandidateId) => ({
        optionOrCandidateId,
        whyPlausible: "Teilt ein Oberflächenwort mit dem Text.",
        decisiveMismatch: "Der Text nennt einen anderen Wochentag.",
        failureFamily: "surface_word_match" as const,
        minimumSafeFeedbackKey: "feedback.surface-word",
      }),
    ),
    intendedCauseMappings: (overrides.causeMappingFor ?? ["option-beta"]).map(
      (optionOrCandidateId) => ({ optionOrCandidateId, causeRef: "cause.scanning" }),
    ),
    independentValidatorResult: {
      validatorRef: "validator-1",
      method: "blind_solve",
      agreedWithProposedKey: overrides.agreedWithProposedKey ?? true,
      recordedAt: "2026-01-05T09:00:00.000Z",
    },
    targetAndContentLineage: {
      contentRevisionId: appId<"content_revision">("content-revision-0001"),
      targetBlueprintRelease: "blueprint/2026-01",
      taxonomyRelease: "taxonomy/2026-01",
    },
    approvalDecisionId: appId<"approval_decision">("approval-decision-0001"),
  });
}

function codes(defects: ReturnType<typeof validateObjectiveKeyRevision>): readonly string[] {
  return defects.map((defect) => defect.code);
}

describe("objective key contract (P05-KEY-001)", () => {
  it("accepts a sound key with no defects", () => {
    expect(validateObjectiveKeyRevision(key(), { offeredResponseIdentifiers })).toEqual([]);
  });

  it("rejects an accepted set outside the declared cardinality", () => {
    const twoAccepted = key({
      acceptedResponseSet: [
        { kind: "option", optionId: "option-alpha" },
        { kind: "option", optionId: "option-beta" },
      ],
      distractorIds: ["option-gamma"],
      causeMappingFor: [],
    });
    expect(
      codes(validateObjectiveKeyRevision(twoAccepted, { offeredResponseIdentifiers })),
    ).toEqual(["cardinality_mismatch"]);
  });

  it("rejects an empty accepted set", () => {
    const empty = key({ acceptedResponseSet: [], distractorIds: [], causeMappingFor: [] });
    const found = codes(validateObjectiveKeyRevision(empty, { offeredResponseIdentifiers }));
    expect(found).toContain("empty_accepted_response_set");
    expect(found).toContain("cardinality_mismatch");
  });

  it("rejects a duplicated accepted response", () => {
    const duplicated = key({
      acceptedResponseSet: [
        { kind: "option", optionId: "option-alpha" },
        { kind: "option", optionId: "option-alpha" },
      ],
      responseCardinality: { min: 1, max: 2 },
      causeMappingFor: [],
    });
    expect(
      codes(validateObjectiveKeyRevision(duplicated, { offeredResponseIdentifiers })),
    ).toContain("duplicate_accepted_response");
  });

  it("treats a bare position as an identity defect that quarantines", () => {
    for (const positional of ["2", "B", "0"]) {
      const positionalKey = key({
        acceptedResponseSet: [{ kind: "option", optionId: positional }],
        distractorIds: offeredResponseIdentifiers,
        causeMappingFor: [],
      });
      const defects = validateObjectiveKeyRevision(positionalKey, { offeredResponseIdentifiers });
      expect(codes(defects)).toContain("position_used_as_identity");
      expect(requiresQuarantine(defects)).toBe(true);
    }
  });

  it("rejects an accepted identity that was never offered", () => {
    const unknown = key({
      acceptedResponseSet: [{ kind: "option", optionId: "option-omega" }],
      distractorIds: offeredResponseIdentifiers,
      causeMappingFor: [],
    });
    expect(codes(validateObjectiveKeyRevision(unknown, { offeredResponseIdentifiers }))).toContain(
      "unknown_response_identity",
    );
  });

  it("requires a rationale for every distractor and every mapped cause", () => {
    const thin = key({ distractorIds: ["option-beta"], causeMappingFor: ["option-gamma"] });
    const found = codes(validateObjectiveKeyRevision(thin, { offeredResponseIdentifiers }));
    expect(found).toContain("missing_distractor_rationale");
    expect(found).toContain("cause_mapping_without_rationale");
  });

  it("requires decisive evidence", () => {
    const blind = key({ decisiveEvidence: false });
    expect(codes(validateObjectiveKeyRevision(blind, { offeredResponseIdentifiers }))).toContain(
      "missing_decisive_evidence",
    );
  });

  it("quarantines on blind-validator disagreement", () => {
    const disputed = key({ agreedWithProposedKey: false });
    const defects = validateObjectiveKeyRevision(disputed, { offeredResponseIdentifiers });
    expect(codes(defects)).toEqual(["blind_validator_disagreement"]);
    expect(requiresQuarantine(defects)).toBe(true);
  });

  it("identifies a response by semantics, so option order cannot change the key", () => {
    expect(acceptedResponseIdentity({ kind: "option", optionId: "option-alpha" })).toBe(
      "option:option-alpha",
    );
    expect(acceptedResponseIdentity({ kind: "match", leftId: "left-1", rightId: "right-2" })).toBe(
      "match:left-1->right-2",
    );
    expect(acceptedResponseIdentity({ kind: "no_match", leftId: "left-1" })).toBe(
      "match:left-1->no_match",
    );
    expect(
      acceptedResponseIdentity({ kind: "candidate", gapId: "gap-1", candidateId: "bank-a" }),
    ).toBe("candidate:gap-1<-bank-a");
  });
});

describe("keys never reach a learner-safe payload (P05-SECURITY-001)", () => {
  it("finds every key-bearing field in a sealed key, by pointer", () => {
    const pointers = findKeyBearingFields(key());
    expect(pointers).toContain("/acceptedResponseSet");
    expect(pointers).toContain("/keyRevisionId");
    expect(pointers).toContain("/correctRationale");
    expect(pointers).toContain("/distractorRationales");
    expect(pointers).toContain("/decisiveEvidenceRefs");
    expect(pointers).toContain("/decisiveEvidenceRefs/0/safeRevealSpanOrRelation");
    expect(pointers).toContain("/distractorRationales/0/whyPlausible");
    expect(pointers).toContain("/independentValidatorResult");
  });

  it("finds key-bearing fields on a raw snake_case database row too", () => {
    const row = {
      key_revision_id: "key-revision-0001",
      accepted_response_set: [{ kind: "option", option_id: "option-alpha" }],
      correct_rationale: "…",
    };
    expect([...findKeyBearingFields(row)].sort()).toEqual([
      "/accepted_response_set",
      "/correct_rationale",
      "/key_revision_id",
    ]);
  });

  it("passes a learner-safe payload that carries only key digests", () => {
    const lease = {
      servingManifestId: "serving-manifest-0001",
      itemIds: ["content-item-0001"],
      keyRevisionDigests: ["a".repeat(64)],
      learnerSafePayloadDigest: "b".repeat(64),
      learnerPayload: {
        kind: "R2DetailedSelect",
        questions: [
          {
            questionId: "question-1",
            options: [{ optionId: "option-alpha", positionIsPresentationOnly: true }],
          },
        ],
      },
    };
    expect(findKeyBearingFields(lease)).toEqual([]);
    expect(() => assertNoKeyBearingFields(lease, "serving lease")).not.toThrow();
  });

  it("fails loudly rather than stripping when a key leaks into a payload", () => {
    const contaminated = {
      learnerPayload: { kind: "R2DetailedSelect" },
      answerKey: "option-alpha",
    };
    expect(() => assertNoKeyBearingFields(contaminated, "serving lease")).toThrowError(
      /serving lease carries key-bearing fields: \/answerKey/,
    );
  });

  it("keeps the digest carrier out of the denylist and the key carriers in it", () => {
    expect(keyBearingFieldNames).not.toContain("keyRevisionDigests");
    expect(keyBearingFieldNames).not.toContain("learnerSafePayloadDigest");
    for (const name of ["acceptedResponseSet", "keyRevisionId", "correct", "key", "rubric"]) {
      expect(keyBearingFieldNames).toContain(name);
    }
  });

  it("never serializes the server-only brand", () => {
    expect(JSON.stringify(key())).not.toContain("server_only");
    expect(Object.getOwnPropertySymbols(key())).toHaveLength(0);
  });

  it("terminates on a cyclic value", () => {
    const cyclic: Record<string, unknown> = { name: "loop" };
    cyclic.self = cyclic;
    cyclic.answerKey = "leaked";
    expect(findKeyBearingFields(cyclic)).toEqual(["/answerKey"]);
  });
});
