import type { TaskFamily } from "@bestehen/content";
import { describe, expect, it } from "vitest";
import {
  projectLearnerResult,
  type LearnerResultEvidence,
  type LearnerResultInput,
} from "./result-projection";

const payload: TaskFamily = {
  kind: "R2DetailedSelect",
  stimulus: {
    stimulusId: "stimulus",
    safeContentNodes: [{ kind: "inline_text", text: "Text" }],
    language: "de",
    genreDomainRegister: "notice",
    evidenceAnchorIds: [],
  },
  questions: [
    {
      itemRef: "item-a",
      questionId: "question-a",
      questionNodes: [{ kind: "inline_text", text: "Frage A" }],
      options: [
        {
          optionId: "shared-option",
          learnerSafeLabel: [{ kind: "inline_text", text: "Erste Bedeutung" }],
          positionIsPresentationOnly: true,
        },
      ],
    },
    {
      itemRef: "item-b",
      questionId: "question-b",
      questionNodes: [{ kind: "inline_text", text: "Frage B" }],
      options: [
        {
          optionId: "shared-option",
          learnerSafeLabel: [{ kind: "inline_text", text: "Zweite Bedeutung" }],
          positionIsPresentationOnly: true,
        },
      ],
    },
  ],
};
const submission = {
  canonicalResponse: {
    selections: { "item-b": "shared-option", "item-a": "shared-option" },
    matches: {},
    placements: {},
    confirmedBoundaries: [],
  },
  unitOutcomes: [
    { contentItemId: "item-b", kind: "incorrect" },
    { contentItemId: "item-a", kind: "correct" },
  ],
  validity: { affectedScope: ["item-a"], unaffectedScope: ["item-b"] },
} satisfies LearnerResultInput;
const evidence = [
  {
    contentItemId: "item-a",
    decisiveEvidence: {
      refs: [{ safeRevealSpanOrRelation: "Beleg für A" }],
      rationale: "A passt genau zum Text.",
    },
    distractorRationale: [],
  },
  {
    contentItemId: "item-b",
    decisiveEvidence: {
      refs: [{ safeRevealSpanOrRelation: "Beleg für B" }],
      rationale: "B passt nicht.",
    },
    distractorRationale: [
      {
        optionOrCandidateId: "shared-option",
        whyPlausible: "Das Wort klingt ähnlich.",
        decisiveMismatch: "Der Text nennt eine andere Bedingung.",
      },
    ],
  },
] satisfies readonly LearnerResultEvidence[];

describe("P05-RESULT-001 pinned authored result projection", () => {
  it("joins shuffled outcome, evidence, and repeated option identities by item rather than position", () => {
    const result = projectLearnerResult(submission, evidence, payload);
    expect(result.validityScope.map((entry) => entry.text)).toEqual([
      "Affected scope: Question 1.",
      "Unaffected scope: Question 2.",
    ]);
    expect(result.outcomes.map((entry) => entry.text)).toEqual([
      "Question 1: the recorded response fits.",
      "Question 2: the recorded response does not fit.",
    ]);
    expect(result.decisiveEvidence.map((entry) => entry.text)).toEqual([
      "Question 1: decisive evidence.",
      "Question 2: decisive evidence.",
    ]);
    expect(result.rationales.map((entry) => entry.text)).toEqual([
      "Question 1: Why this response fits.",
      "Question 2: The selected response seems plausible at first, but does not fit.",
    ]);
    expect(new Set(result.decisiveEvidence.map((entry) => entry.id)).size).toBe(2);
    expect(result.causes[0]?.text).toContain("No supported diagnostic observation is recorded");
    expect(result.outcomes[0]?.germanText).toBe("Frage A — Erste Bedeutung");
    expect(result.rationales[1]?.germanText).toContain("Das Wort klingt ähnlich.");
    expect(result.decisiveEvidence[0]?.germanText).toBe("Frage A — Beleg für A");
  });

  it("uses learner-safe fallbacks for malformed persisted fields", () => {
    const result = projectLearnerResult(
      { ...submission, canonicalResponse: { selections: {}, matches: {}, placements: {} } },
      [
        {
          contentItemId: "item-a",
          decisiveEvidence: { refs: ["malformed"] },
          distractorRationale: [],
        },
      ],
      undefined,
    );
    expect(result.decisiveEvidence[0]?.text).toBe(
      "The recorded decisive evidence is unavailable for this item.",
    );
    expect(result.outcomes[0]?.text).toContain("Recorded item");
  });

  it("keeps blank R1 matching feedback item-keyed when bindings are shuffled from stimuli", () => {
    const r1: TaskFamily = {
      kind: "R1HeadingMatching",
      texts: [
        {
          stimulusId: "text-one",
          safeContentNodes: [{ kind: "inline_text", text: "Aushang eins" }],
          language: "de",
          genreDomainRegister: "notice",
          evidenceAnchorIds: [],
        },
        {
          stimulusId: "text-two",
          safeContentNodes: [{ kind: "inline_text", text: "Aushang zwei" }],
          language: "de",
          genreDomainRegister: "notice",
          evidenceAnchorIds: [],
        },
      ],
      headings: [],
      matchConstraints: {
        leftCardinality: { min: 1, max: 1 },
        rightReusePolicy: "at_most_once",
        unmatchedPolicy: "permitted",
        completionRule: "partial_permitted",
      },
      itemBindings: [
        { itemRef: "r1-item-two", leftId: "text-two" },
        { itemRef: "r1-item-one", leftId: "text-one" },
      ],
    };
    const result = projectLearnerResult(
      {
        canonicalResponse: { selections: {}, matches: {}, placements: {}, confirmedBoundaries: [] },
        unitOutcomes: [
          { contentItemId: "r1-item-two", kind: "blank" },
          { contentItemId: "r1-item-one", kind: "blank" },
        ],
        validity: { affectedScope: ["r1-item-one"], unaffectedScope: ["r1-item-two"] },
      },
      [],
      r1,
    );
    expect(result.outcomes.map((entry) => entry.text)).toEqual([
      "Text 1: no response was recorded.",
      "Text 2: no response was recorded.",
    ]);
    expect(result.validityScope.map((entry) => entry.text)).toEqual([
      "Affected scope: Text 1.",
      "Unaffected scope: Text 2.",
    ]);
  });

  it("uses the selected SB candidate label from its owning item", () => {
    const sb1: TaskFamily = {
      kind: "SB1ContextualGrammarCloze",
      connectedText: {
        stimulusId: "sb-text",
        safeContentNodes: [{ kind: "inline_text", text: "Text" }],
        language: "de",
        genreDomainRegister: "notice",
        evidenceAnchorIds: [],
        connected: true,
      },
      gaps: [
        {
          itemRef: "gap-item",
          gapId: "gap-one",
          options: [
            {
              optionId: "shared-candidate",
              learnerSafeLabel: [{ kind: "inline_text", text: "passende Form" }],
              positionIsPresentationOnly: true,
            },
          ],
        },
      ],
    };
    const result = projectLearnerResult(
      {
        canonicalResponse: {
          selections: {},
          matches: {},
          placements: { "gap-one": { itemId: "gap-item", candidateId: "shared-candidate" } },
          confirmedBoundaries: [],
        },
        unitOutcomes: [{ contentItemId: "gap-item", kind: "correct" }],
        validity: { affectedScope: ["gap-item"], unaffectedScope: [] },
      },
      [],
      sb1,
    );
    expect(result.outcomes[0]?.text).toBe("Gap 1: the recorded response fits.");
    expect(result.outcomes[0]?.germanText).toBe("passende Form");
  });
});
