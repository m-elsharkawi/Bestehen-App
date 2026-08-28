import { appId, contentApprovalLevels } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import type { AccessibilityManifest } from "./accessibility.js";
import { contentRevisionDigest, formDigest } from "./digest.js";
import { type ObjectiveKeyRevision, sealObjectiveKeyRevision } from "./keys.js";
import type {
  ContentItem,
  ContentRevision,
  ObjectiveForm,
  Option,
  SafeContentNode,
} from "./model.js";
import {
  type PublicationContext,
  type PublicationGateId,
  type RecordedGateResult,
  collectClozeAnchorGapIds,
  countIndependentFamilies,
  describePayloadItems,
  evaluateDeterministicStructure,
  offeredIdentifiersByItemRef,
  publicationGateIds,
  publicationGateVersion,
  requiredGatesForLevel,
  validateForPublication,
  validateFormComposition,
} from "./publication.js";
import type { RightsEnvelope } from "./rights.js";
import type { SB2SharedBankLexicalCloze, TaskFamily } from "./task-families.js";

/* ------------------------------------------------------------------------------------------------
 * Fixtures — an R2 detailed-select revision with three questions, and an SB2 shared-bank cloze.
 * ---------------------------------------------------------------------------------------------- */

const targetRelease = "telc-b1-blueprint/2026-01";

function text(value: string): SafeContentNode {
  return { kind: "paragraph", children: [{ kind: "inline_text", text: value }] };
}

function option(optionId: string, label: string): Option {
  return {
    optionId,
    learnerSafeLabel: [{ kind: "inline_text", text: label }],
    positionIsPresentationOnly: true,
  };
}

const r2Payload: TaskFamily = {
  kind: "R2DetailedSelect",
  stimulus: {
    stimulusId: "stim-vereinsheft",
    safeContentNodes: [text("Das Vereinsheft erscheint viermal im Jahr.")],
    language: "de",
    genreDomainRegister: "vereinsmitteilung/neutral",
    evidenceAnchorIds: ["anchor-erscheinung"],
  },
  questions: [
    {
      itemRef: "item-0001",
      questionId: "q-erscheinung",
      questionNodes: [text("Wie oft erscheint das Heft?")],
      options: [
        option("opt-viermal", "viermal im Jahr"),
        option("opt-monatlich", "jeden Monat"),
        option("opt-woechentlich", "jede Woche"),
      ],
    },
    {
      itemRef: "item-0002",
      questionId: "q-abgabe",
      questionNodes: [text("Wann ist der Redaktionsschluss?")],
      options: [
        option("opt-monatsende", "am Monatsende"),
        option("opt-quartalsende", "am Quartalsende"),
        option("opt-jahresende", "am Jahresende"),
      ],
    },
  ],
};

function itemFor(
  ordinal: number,
  itemId: string,
  questionId: string,
  keyRevisionId: string,
): ContentItem {
  return {
    contentItemId: appId<"content_item">(itemId),
    contentRevisionId: appId<"content_revision">("rev-0001"),
    ordinal,
    binding: { kind: "select", questionId },
    scorable: {
      itemId: appId<"content_item">(itemId),
      responseKind: "single_select",
      responseCardinality: { min: 1, max: 1 },
      primaryCapabilityRefs: ["cap-detail"],
      optionalSecondaryRefs: [],
      mappingConfidence: "high",
      keyRevisionId: appId<"key_revision">(keyRevisionId),
      scoringPolicyRef: "policy-objective-v1",
    },
  };
}

function keyFor(
  keyRevisionId: string,
  itemId: string,
  acceptedOptionId: string,
  distractorIds: readonly string[],
  agreed = true,
): ObjectiveKeyRevision {
  return sealObjectiveKeyRevision({
    keyRevisionId: appId<"key_revision">(keyRevisionId),
    itemId: appId<"content_item">(itemId),
    acceptedResponseSet: [{ kind: "option", optionId: acceptedOptionId }],
    responseCardinality: { min: 1, max: 1 },
    scoringPolicyRef: "policy-objective-v1",
    decisiveEvidenceRefs: [
      {
        stimulusId: "stim-vereinsheft",
        anchorId: "anchor-erscheinung",
        safeRevealSpanOrRelation: "viermal im Jahr",
        relationKind: "direct_span",
      },
    ],
    correctRationale: "Der Text nennt die Häufigkeit wörtlich.",
    distractorRationales: distractorIds.map((optionOrCandidateId) => ({
      optionOrCandidateId,
      whyPlausible: "Eine übliche Frequenzangabe.",
      decisiveMismatch: "Der Text nennt eine andere Frequenz.",
      failureFamily: "surface_word_match" as const,
      minimumSafeFeedbackKey: "feedback.frequenz",
    })),
    intendedCauseMappings: [],
    independentValidatorResult: {
      validatorRef: "validator-blind-01",
      method: "blind_solve",
      agreedWithProposedKey: agreed,
      recordedAt: "2026-02-01T09:00:00.000Z",
    },
    targetAndContentLineage: {
      contentRevisionId: appId<"content_revision">("rev-0001"),
      targetBlueprintRelease: targetRelease,
      taxonomyRelease: "taxonomy/2026-01",
    },
    approvalDecisionId: appId<"approval_decision">("approval-0001"),
  });
}

const keys: readonly ObjectiveKeyRevision[] = [
  keyFor("key-0001", "item-0001", "opt-viermal", ["opt-monatlich", "opt-woechentlich"]),
  keyFor("key-0002", "item-0002", "opt-monatsende", ["opt-quartalsende", "opt-jahresende"]),
];

function revision(overrides: Partial<ContentRevision> = {}): ContentRevision {
  const base: ContentRevision = {
    contentRevisionId: appId<"content_revision">("rev-0001"),
    contentFamilyId: appId<"content_family">("family-0001"),
    contentClass: "C2",
    taskDefinition: { id: "task-r2", revision: 1 },
    generationBrief: { id: "brief-r2-0001", revision: 1 },
    targetBlueprintRelease: targetRelease,
    taxonomyRelease: "taxonomy/2026-01",
    capabilityRefs: ["cap-detail"],
    progressionProfile: "P3",
    intendedEvidenceRoles: ["independent_practice"],
    instruction: {
      instructionId: "instr-r2",
      locale: "de",
      safeContentNodes: [text("Lesen Sie den Text und beantworten Sie die Fragen.")],
      responseMechanic: "single_select",
      helpPolicy: { offerableAssistanceKinds: ["word_help"] },
      learnerFacingTimingLabel: null,
    },
    learnerPayload: r2Payload,
    items: [
      itemFor(1, "item-0001", "q-erscheinung", "key-0001"),
      itemFor(2, "item-0002", "q-abgabe", "key-0002"),
    ],
    keyRevisionIds: [appId<"key_revision">("key-0001"), appId<"key_revision">("key-0002")],
    mediaRevisionIds: [],
    rightsEnvelopeId: appId<"rights_envelope">("rights-0001"),
    accessibilityManifestId: "a11y-0001",
    currentApprovalDecisionId: appId<"approval_decision">("approval-0001"),
    digest: "",
    ...overrides,
  };
  return { ...base, digest: contentRevisionDigest(base) };
}

const rightsEnvelope: RightsEnvelope = {
  identity: {
    rightsEnvelopeId: appId<"rights_envelope">("rights-0001"),
    revision: 1,
    sourceRef: null,
    sourceComponentRevision: null,
    state: "current",
    effectiveFrom: "2026-01-01T00:00:00.000Z",
  },
  separateTrust: { authenticityConfidence: "local_review", qaReferences: [] },
  actionEligibility: {
    actions: { display: "allowed", reproduce: "allowed", cache: "allowed" },
    territoryLimit: null,
    audienceLimit: null,
  },
  conditions: [],
  exactCredit: {
    attributionRequired: false,
    authorOrRightsholder: "Bestehen (Stage 05 seed)",
    titleOrSource: "Bestehen practice material",
    requiredLink: null,
    licenceIdentifier: "proprietary-internal",
    licenceNoticeText: null,
    modificationNotice: null,
    placementRule: null,
  },
  componentScope: { componentRef: "rev-0001", componentKind: "composite" },
  provenance: {
    corpusBundleRef: null,
    rightsDecisionRef: null,
    sourceRevisionRef: null,
    groundingManifest: "grounding/original-authored",
    note: "Original App content.",
  },
  incidentDisposition: null,
};

const accessibilityManifest: AccessibilityManifest = {
  accessibilityManifestId: "a11y-0001",
  surface: {
    hasAudioInstructions: false,
    hasListeningMedia: false,
    hasDragInteraction: false,
    hasQuestionBearingImage: false,
  },
  writtenInstructionsPresent: true,
  transcript: { available: false, captionsAvailable: false, revealPhase: "never" },
  images: [],
  equivalentTargetValidPath: true,
  responseMechanic: {
    semantic: true,
    keyboardSelectThenPlace: true,
    evidenceEquivalentToDrag: true,
  },
  focusAndReadOrderDeclared: true,
  languageTag: "de-DE",
  textNotTruncated: true,
  zoomAndReflowSuitable: true,
  colorOnlyState: false,
  playbackControls: null,
  supportClaims: [],
};

const reviewedGates: readonly PublicationGateId[] = [
  "eligibility_brief",
  "semantic_task_design",
  "language_media_creation",
  "naturalness_register",
  "difficulty_target_fit",
  "anti_copy_diversity",
];

function recordedResults(
  overrides: readonly RecordedGateResult[] = [],
): readonly RecordedGateResult[] {
  const base = reviewedGates.map<RecordedGateResult>((gate) => ({
    gate,
    outcome: "passed",
    reviewerRef: "owner-reviewer",
    methodVersion: "review/v1",
    recordedAt: "2026-02-01T10:00:00.000Z",
  }));
  return [...base, ...overrides];
}

function context(overrides: Partial<PublicationContext> = {}): PublicationContext {
  return {
    recordedResults: recordedResults(),
    keyRevisions: keys,
    accessibilityManifest,
    rightsEnvelopes: [rightsEnvelope],
    currentTargetBlueprintRelease: targetRelease,
    ...overrides,
  };
}

/* ------------------------------------------------------------------------------------------------
 * The ordered gates
 * ---------------------------------------------------------------------------------------------- */

describe("the ordered QA gates", () => {
  it("lists the eleven gates of Architecture/09 §5.3 in their authoritative order", () => {
    expect(publicationGateIds).toEqual([
      "eligibility_brief",
      "semantic_task_design",
      "language_media_creation",
      "deterministic_structure",
      "independent_key_validation",
      "naturalness_register",
      "difficulty_target_fit",
      "anti_copy_diversity",
      "final_media_render_interaction",
      "approval_publish",
      "post_publication_loop",
    ]);
  });

  it("publishes a sound revision at training and records a version on every gate", () => {
    const result = validateForPublication(revision(), "training", context());
    expect(result.decision).toBe("publishable");
    expect(result.findings).toEqual([]);
    expect(result.firstBlockingGate).toBeUndefined();
    expect(result.gateResults).toHaveLength(publicationGateIds.length);
    for (const gate of result.gateResults) {
      expect(gate.gateVersion).toBe(publicationGateVersion);
    }
    // Every required gate actually ran; only `post_publication_loop` is not required at training.
    expect(
      result.gateResults.filter((gate) => gate.status === "pass").map((gate) => gate.gate),
    ).toEqual(requiredGatesForLevel("training"));
    expect(result.gateResults.find((gate) => gate.gate === "post_publication_loop")?.status).toBe(
      "not_applicable",
    );
  });

  it("stops at the first blocking gate and never claims a later gate passed", () => {
    const broken = revision({ generationBrief: { id: "", revision: 1 } });
    const result = validateForPublication(broken, "training", context());
    expect(result.firstBlockingGate).toBe("eligibility_brief");
    expect(result.decision).toBe("blocked");
    const later = result.gateResults.filter(
      (gate) => gate.ordinal > 1 && gate.status !== "not_applicable",
    );
    expect(later.every((gate) => gate.status === "not_evaluated")).toBe(true);
    expect(later.some((gate) => gate.status === "pass")).toBe(false);
  });

  it("treats an unrecorded review gate as a block, never as a pass", () => {
    const missing = recordedResults().filter((record) => record.gate !== "naturalness_register");
    const result = validateForPublication(
      revision(),
      "training",
      context({ recordedResults: missing }),
    );
    expect(result.firstBlockingGate).toBe("naturalness_register");
    expect(result.findings.map((entry) => entry.code)).toEqual(["gate_result_not_recorded"]);
  });

  it("treats a recorded pass with no method version as unrecorded", () => {
    const unversioned = recordedResults().map((record) =>
      record.gate === "difficulty_target_fit" ? { ...record, methodVersion: " " } : record,
    );
    const result = validateForPublication(
      revision(),
      "training",
      context({ recordedResults: unversioned }),
    );
    expect(result.firstBlockingGate).toBe("difficulty_target_fit");
  });

  it("blocks audio rendered before the semantic and language pass", () => {
    const result = validateForPublication(
      revision(),
      "training",
      context({
        mediaRenderRecord: {
          renderedAt: "2026-02-01T11:00:00.000Z",
          afterSemanticAndLanguagePass: false,
        },
      }),
    );
    expect(result.firstBlockingGate).toBe("language_media_creation");
    expect(result.findings.map((entry) => entry.code)).toContain(
      "media_rendered_before_semantic_pass",
    );
  });

  it("requires the post-publication loop above training and blocks on an unresolved report", () => {
    expect(requiredGatesForLevel("training")).not.toContain("post_publication_loop");
    expect(requiredGatesForLevel("independent_b1")).toContain("post_publication_loop");
    const result = validateForPublication(
      revision(),
      "independent_b1",
      context({
        postPublicationReports: [
          {
            reportId: "report-0001",
            kind: "validator_disagreement",
            resolved: false,
            materialDefect: true,
            detail: "A second blind solve produced a different answer.",
          },
        ],
      }),
    );
    expect(result.firstBlockingGate).toBe("post_publication_loop");
    expect(result.decision).toBe("quarantine_required");
  });
});

/* ------------------------------------------------------------------------------------------------
 * The class/approval matrix
 * ---------------------------------------------------------------------------------------------- */

describe("the class and approval publication matrix", () => {
  it("refuses a level the class may not hold", () => {
    const result = validateForPublication(
      revision({ contentClass: "C3" }),
      "readiness_p4",
      context(),
    );
    expect(result.decision).toBe("blocked");
    expect(result.findings.map((entry) => entry.code)).toContain("class_may_not_hold_level");
  });

  it("refuses quarantine and retired as publication targets", () => {
    for (const level of ["quarantine", "retired"] as const) {
      expect(requiredGatesForLevel(level)).toEqual([]);
      const result = validateForPublication(revision(), level, context());
      // No gate is required, so nothing runs and nothing is claimed to have passed.
      expect(result.gateResults.every((gate) => gate.status === "not_applicable")).toBe(true);
    }
  });

  it("requires only identity, brief and provenance at draft", () => {
    expect(requiredGatesForLevel("draft")).toEqual(["eligibility_brief", "approval_publish"]);
    const { currentApprovalDecisionId: _approval, ...unapproved } = revision();
    const draft: ContentRevision = {
      ...unapproved,
      digest: contentRevisionDigest(unapproved as ContentRevision),
    };
    const result = validateForPublication(draft, "draft", context());
    expect(result.decision).toBe("publishable");
  });

  it("covers every approval level in the domain union", () => {
    for (const level of contentApprovalLevels) {
      expect(() => requiredGatesForLevel(level)).not.toThrow();
    }
  });

  it("refuses to publish a C0 reference-only or C4 adaptive artifact", () => {
    for (const contentClass of ["C0", "C4"] as const) {
      const result = validateForPublication(revision({ contentClass }), "draft", context());
      expect(result.findings.map((entry) => entry.code)).toContain("corpus_input_class_forbidden");
    }
  });
});

/* ------------------------------------------------------------------------------------------------
 * Publication freezes the revision
 * ---------------------------------------------------------------------------------------------- */

describe("publication freezes a revision", () => {
  it("quarantines a digest that no longer matches the revision's own bytes", () => {
    const mutated: ContentRevision = { ...revision(), digest: "0".repeat(64) };
    const result = validateForPublication(mutated, "training", context());
    expect(result.decision).toBe("quarantine_required");
    expect(result.findings.map((entry) => entry.code)).toContain("digest_does_not_match_revision");
  });

  it("quarantines a frozen revision whose content moved since publication", () => {
    const frozen = revision({ frozenAt: "2026-02-02T08:00:00.000Z" });
    const result = validateForPublication(
      frozen,
      "training",
      context({ publishedDigest: "a".repeat(64) }),
    );
    expect(result.decision).toBe("quarantine_required");
    expect(result.findings.map((entry) => entry.code)).toContain("frozen_revision_mutated");
  });

  it("accepts a frozen revision whose digest is unchanged, so a successor is the only edit path", () => {
    const frozen = revision({ frozenAt: "2026-02-02T08:00:00.000Z" });
    const result = validateForPublication(
      frozen,
      "training",
      context({ publishedDigest: frozen.digest }),
    );
    expect(result.decision).toBe("publishable");
  });
});

/* ------------------------------------------------------------------------------------------------
 * Gate 4 — deterministic structure
 * ---------------------------------------------------------------------------------------------- */

describe("QA gate 4 — deterministic structure", () => {
  it("describes each respondable position with the identities it offers", () => {
    expect(describePayloadItems(r2Payload)).toEqual([
      {
        itemRef: "item-0001",
        binding: { kind: "select", questionId: "q-erscheinung" },
        responseKind: "single_select",
        offeredIdentifiers: ["opt-viermal", "opt-monatlich", "opt-woechentlich"],
      },
      {
        itemRef: "item-0002",
        binding: { kind: "select", questionId: "q-abgabe" },
        responseKind: "single_select",
        offeredIdentifiers: ["opt-monatsende", "opt-quartalsende", "opt-jahresende"],
      },
    ]);
    expect([...offeredIdentifiersByItemRef(r2Payload).keys()]).toEqual(["item-0001", "item-0002"]);
  });

  it("passes a sound revision", () => {
    expect(evaluateDeterministicStructure(revision(), context())).toEqual([]);
  });

  it("catches a scorable item the payload never presents", () => {
    const orphan = revision({
      items: [
        itemFor(1, "item-0001", "q-erscheinung", "key-0001"),
        itemFor(2, "item-0002", "q-abgabe", "key-0002"),
        itemFor(3, "item-0003", "q-nicht-da", "key-0002"),
      ],
    });
    const codes = evaluateDeterministicStructure(orphan, context()).map((entry) => entry.code);
    expect(codes).toContain("item_without_payload_binding");
  });

  it("catches a payload position with no scorable item behind it", () => {
    const missing = revision({ items: [itemFor(1, "item-0001", "q-erscheinung", "key-0001")] });
    const codes = evaluateDeterministicStructure(missing, context()).map((entry) => entry.code);
    expect(codes).toContain("payload_ref_without_item");
  });

  it("catches a binding that names a position the payload does not declare", () => {
    const wrong = revision({
      items: [
        itemFor(1, "item-0001", "q-falsch", "key-0001"),
        itemFor(2, "item-0002", "q-abgabe", "key-0002"),
      ],
    });
    const codes = evaluateDeterministicStructure(wrong, context()).map((entry) => entry.code);
    expect(codes).toContain("binding_target_unknown");
  });

  it("catches duplicate item identities and non-contiguous ordinals", () => {
    const duplicated = revision({
      items: [
        itemFor(1, "item-0001", "q-erscheinung", "key-0001"),
        itemFor(7, "item-0001", "q-abgabe", "key-0002"),
      ],
    });
    const codes = evaluateDeterministicStructure(duplicated, context()).map((entry) => entry.code);
    expect(codes).toContain("duplicate_item_id");
    expect(codes).toContain("item_ordinal_not_contiguous");
  });

  it("pins single-select cardinality from the target release", () => {
    const item = itemFor(1, "item-0001", "q-erscheinung", "key-0001");
    const loose = revision({
      items: [
        {
          ...item,
          scorable: { ...item.scorable, responseCardinality: { min: 1, max: 2 } },
        },
        itemFor(2, "item-0002", "q-abgabe", "key-0002"),
      ],
    });
    const codes = evaluateDeterministicStructure(loose, context()).map((entry) => entry.code);
    expect(codes).toContain("cardinality_not_permitted_for_response_kind");
  });

  it("requires every item's key to be pinned by the revision", () => {
    const unpinned = revision({ keyRevisionIds: [appId<"key_revision">("key-0001")] });
    const codes = evaluateDeterministicStructure(unpinned, context()).map((entry) => entry.code);
    expect(codes).toContain("key_reference_missing");
  });

  describe("shared-bank rules", () => {
    const sb2Payload = (
      overrides: Partial<SB2SharedBankLexicalCloze> = {},
    ): SB2SharedBankLexicalCloze => ({
      kind: "SB2SharedBankLexicalCloze",
      connectedText: {
        stimulusId: "stim-anmeldung",
        connected: true,
        language: "de",
        genreDomainRegister: "formular/neutral",
        evidenceAnchorIds: [],
        safeContentNodes: [
          {
            kind: "paragraph",
            children: [
              { kind: "inline_text", text: "Bitte" },
              { kind: "cloze_anchor", gapId: "gap-1" },
              { kind: "inline_text", text: "Sie das Formular" },
              { kind: "cloze_anchor", gapId: "gap-2" },
            ],
          },
        ],
      },
      gaps: [
        { itemRef: "item-0001", gapId: "gap-1" },
        { itemRef: "item-0002", gapId: "gap-2" },
      ],
      candidateBank: [
        option("cand-fuellen", "füllen"),
        option("cand-senden", "senden"),
        option("cand-lesen", "lesen"),
      ],
      candidateReusePolicy: "at_most_once",
      ...overrides,
    });

    function sb2Revision(payload: SB2SharedBankLexicalCloze): ContentRevision {
      const gapItems: ContentItem[] = payload.gaps.map((gap, index) => {
        const item = itemFor(index + 1, gap.itemRef, "unused", `key-000${index + 1}`);
        return {
          ...item,
          binding: { kind: "gap", gapId: gap.gapId },
          scorable: { ...item.scorable, responseKind: "cloze_bank_candidate" },
        };
      });
      return revision({ learnerPayload: payload, items: gapItems });
    }

    it("reads the gap anchors out of the connected text", () => {
      expect(collectClozeAnchorGapIds(sb2Payload())).toEqual(["gap-1", "gap-2"]);
    });

    it("accepts a bank that offers at least one candidate per gap", () => {
      expect(evaluateDeterministicStructure(sb2Revision(sb2Payload()), context())).toEqual([]);
    });

    it("rejects a bank smaller than the gap count when reuse is forbidden", () => {
      const payload = sb2Payload({ candidateBank: [option("cand-fuellen", "füllen")] });
      const codes = evaluateDeterministicStructure(sb2Revision(payload), context()).map(
        (entry) => entry.code,
      );
      expect(codes).toContain("bank_smaller_than_gap_count");
    });

    it("rejects a duplicated bank candidate identity", () => {
      const payload = sb2Payload({
        candidateBank: [
          option("cand-fuellen", "füllen"),
          option("cand-fuellen", "ausfüllen"),
          option("cand-senden", "senden"),
        ],
      });
      const codes = evaluateDeterministicStructure(sb2Revision(payload), context()).map(
        (entry) => entry.code,
      );
      expect(codes).toContain("duplicate_offered_identifier");
      expect(codes).toContain("bank_candidate_not_unique");
    });

    it("rejects a declared gap with no anchor in the connected text", () => {
      const payload = sb2Payload({
        gaps: [
          { itemRef: "item-0001", gapId: "gap-1" },
          { itemRef: "item-0002", gapId: "gap-99" },
        ],
      });
      const codes = evaluateDeterministicStructure(sb2Revision(payload), context()).map(
        (entry) => entry.code,
      );
      expect(codes).toContain("cloze_anchor_gap_mismatch");
    });
  });
});

/* ------------------------------------------------------------------------------------------------
 * Gate 5 — independent key validation
 * ---------------------------------------------------------------------------------------------- */

describe("QA gate 5 — independent key validation", () => {
  it("quarantines a blind-validator disagreement", () => {
    const disagreed = [
      keyFor("key-0001", "item-0001", "opt-viermal", ["opt-monatlich", "opt-woechentlich"], false),
      keys[1] as ObjectiveKeyRevision,
    ];
    const result = validateForPublication(
      revision(),
      "training",
      context({ keyRevisions: disagreed }),
    );
    expect(result.firstBlockingGate).toBe("independent_key_validation");
    expect(result.decision).toBe("quarantine_required");
  });

  it("quarantines a key that accepts an identity the learner is never offered", () => {
    const stray = [
      keyFor("key-0001", "item-0001", "opt-nicht-angeboten", [
        "opt-viermal",
        "opt-monatlich",
        "opt-woechentlich",
      ]),
      keys[1] as ObjectiveKeyRevision,
    ];
    const result = validateForPublication(revision(), "training", context({ keyRevisions: stray }));
    expect(result.decision).toBe("quarantine_required");
    expect(result.findings.every((entry) => entry.code === "key_defect")).toBe(true);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Gate 9 — accessibility is a hard publication requirement
 * ---------------------------------------------------------------------------------------------- */

describe("QA gate 9 — final media, render and interaction", () => {
  it("blocks on an accessibility gate finding rather than degrading the artifact", () => {
    const result = validateForPublication(
      revision(),
      "training",
      context({
        accessibilityManifest: { ...accessibilityManifest, colorOnlyState: true },
      }),
    );
    expect(result.firstBlockingGate).toBe("final_media_render_interaction");
    expect(result.findings.map((entry) => entry.code)).toEqual(["accessibility_gate_blocked"]);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Form composition
 * ---------------------------------------------------------------------------------------------- */

describe("form composition", () => {
  const revisionA = revision();
  const revisionB = revision({
    contentRevisionId: appId<"content_revision">("rev-0002"),
    contentFamilyId: appId<"content_family">("family-0002"),
    items: [
      {
        ...itemFor(1, "item-1001", "q-erscheinung", "key-1001"),
        contentRevisionId: appId<"content_revision">("rev-0002"),
      },
      {
        ...itemFor(2, "item-1002", "q-abgabe", "key-1002"),
        contentRevisionId: appId<"content_revision">("rev-0002"),
      },
    ],
    keyRevisionIds: [appId<"key_revision">("key-1001"), appId<"key_revision">("key-1002")],
  });

  function form(overrides: Partial<ObjectiveForm> = {}): ObjectiveForm {
    const revisions = [revisionA, revisionB];
    const base: ObjectiveForm = {
      formId: appId<"content_form">("form-0001"),
      formRevisionId: "form-rev-1",
      targetBlueprintReleaseId: targetRelease,
      taskDefinitionVersions: [{ id: "task-r2", revision: 1 }],
      contentRevisionIds: revisions.map((entry) => entry.contentRevisionId),
      contentFamilyIds: revisions.map((entry) => entry.contentFamilyId),
      itemIds: revisions.flatMap((entry) => entry.items.map((item) => item.contentItemId)),
      keyRevisionIds: revisions.flatMap((entry) => [...entry.keyRevisionIds]),
      approvalDecisionId: appId<"approval_decision">("approval-0001"),
      intendedRole: "independent_practice",
      progressionProfile: "P3",
      blockContracts: [
        {
          kind: "objective_practice_block",
          blockId: "block-1",
          taskFamilyKind: "R2DetailedSelect",
          timingRule: { kind: "open" },
          submissionBoundary: "task_set",
          feedbackAfterSubmission: "immediate",
        },
      ],
      navigationPolicy: "free-within-block",
      feedbackPolicy: "immediate",
      checkpointPolicyRef: "checkpoint/v1",
      rightsAndAccessibilityManifestRefs: ["rights-0001", "a11y-0001"],
      digest: "",
      ...overrides,
    };
    return { ...base, digest: formDigest(base) };
  }

  const compositionContext = {
    revisions: [revisionA, revisionB],
    approvalLevelByRevisionId: new Map([
      [revisionA.contentRevisionId, "training" as const],
      [revisionB.contentRevisionId, "training" as const],
    ]),
    sharedStimulusClusters: [],
    exposedFamilyIds: [],
  };

  it("accepts a frozen form whose pinned graph matches what it composes", () => {
    const result = validateFormComposition(form(), compositionContext);
    expect(result.findings).toEqual([]);
    expect(result.status).toBe("pass");
    expect(result.independentFamilyCount).toBe(2);
  });

  it("counts independent families, never items", () => {
    expect(countIndependentFamilies([revisionA, revisionB])).toBe(2);
    // Four items across two families still count as two.
    expect(revisionA.items.length + revisionB.items.length).toBe(4);
  });

  it("permits one family twice inside a shared-stimulus cluster and refuses it outside one", () => {
    const sameFamily = revision({
      contentRevisionId: appId<"content_revision">("rev-0002"),
      items: [
        {
          ...itemFor(1, "item-1001", "q-erscheinung", "key-1001"),
          contentRevisionId: appId<"content_revision">("rev-0002"),
        },
        {
          ...itemFor(2, "item-1002", "q-abgabe", "key-1002"),
          contentRevisionId: appId<"content_revision">("rev-0002"),
        },
      ],
      keyRevisionIds: [appId<"key_revision">("key-1001"), appId<"key_revision">("key-1002")],
    });
    const clustered = {
      ...compositionContext,
      revisions: [revisionA, sameFamily],
      sharedStimulusClusters: [
        {
          clusterId: "cluster-1",
          contentRevisionIds: [revisionA.contentRevisionId, sameFamily.contentRevisionId],
        },
      ],
    };
    expect(validateFormComposition(form(), clustered).findings).toEqual([]);
    // One correlated cluster is one independent family, whatever its item count.
    expect(validateFormComposition(form(), clustered).independentFamilyCount).toBe(1);

    const unclustered = { ...clustered, sharedStimulusClusters: [] };
    expect(
      validateFormComposition(form(), unclustered).findings.map((entry) => entry.code),
    ).toContain("duplicate_family_outside_cluster");
  });

  it("excludes every materially exposed family from a measurement form", () => {
    const result = validateFormComposition(form({ intendedRole: "section_mock" }), {
      ...compositionContext,
      exposedFamilyIds: [revisionB.contentFamilyId],
    });
    expect(result.findings.map((entry) => entry.code)).toContain(
      "exposed_family_in_measurement_form",
    );
  });

  it("requires Readiness/P4-approved revisions in a P4 form", () => {
    const result = validateFormComposition(
      form({ intendedRole: "full_mock", progressionProfile: "P4" }),
      compositionContext,
    );
    expect(result.findings.map((entry) => entry.code)).toContain(
      "revision_level_insufficient_for_role",
    );
  });

  it("refuses a form whose item or key set is not exactly what it pins", () => {
    const short = form({
      itemIds: [revisionA.items[0]?.contentItemId ?? appId<"content_item">("x")],
    });
    expect(
      validateFormComposition(short, compositionContext).findings.map((e) => e.code),
    ).toContain("item_set_mismatch");
  });

  it("refuses a digest that no longer matches the composition", () => {
    const stale: ObjectiveForm = { ...form(), digest: "f".repeat(64) };
    expect(
      validateFormComposition(stale, compositionContext).findings.map((e) => e.code),
    ).toContain("form_digest_mismatch");
  });

  it("refuses an answer-position run longer than the composition rules permit", () => {
    const result = validateFormComposition(form(), {
      ...compositionContext,
      answerPositionProfile: { keyedOrdinals: [1, 1, 1, 2], maxConsecutiveIdenticalOrdinal: 2 },
    });
    expect(result.findings.map((entry) => entry.code)).toContain("answer_position_run_too_long");
  });
});
