import { appId } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import {
  canonicalDigest,
  canonicalJson,
  canonicalizationVersion,
  contentRevisionDigest,
  formDigest,
  keyRevisionDigest,
  keyRevisionReference,
  maxCanonicalDepth,
  mediaRevisionDigest,
  servingManifestDigest,
} from "./digest.js";
import {
  findKeyBearingFields,
  sealObjectiveKeyRevision,
  type ObjectiveKeyRevision,
} from "./keys.js";
import type { ContentRevision, ObjectiveForm, SafeContentNode, ServingManifest } from "./model.js";
import type { R2DetailedSelect } from "./task-families.js";

const text = (value: string): SafeContentNode => ({ kind: "inline_text", text: value });

const learnerPayload: R2DetailedSelect = {
  kind: "R2DetailedSelect",
  stimulus: {
    stimulusId: "article-1",
    safeContentNodes: [{ kind: "paragraph", children: [text("Ein kurzer Text.")] }],
    language: "de",
    genreDomainRegister: "magazine",
    evidenceAnchorIds: ["anchor-1"],
  },
  questions: [
    {
      itemRef: "item-1",
      questionId: "question-1",
      questionNodes: [text("Was stimmt?")],
      options: [
        {
          optionId: "option-a",
          learnerSafeLabel: [text("Erste")],
          positionIsPresentationOnly: true,
        },
        {
          optionId: "option-b",
          learnerSafeLabel: [text("Zweite")],
          positionIsPresentationOnly: true,
        },
      ],
    },
  ],
};

const revision: ContentRevision = {
  contentRevisionId: appId<"content_revision">("content-revision-0001"),
  contentFamilyId: appId<"content_family">("content-family-0001"),
  contentClass: "C3",
  taskDefinition: { id: "task-definition-r2", revision: 1 },
  generationBrief: { id: "generation-brief-r2", revision: 1 },
  targetBlueprintRelease: "blueprint/2026-01",
  taxonomyRelease: "taxonomy/2026-01",
  capabilityRefs: ["capability.reading.detail"],
  progressionProfile: "P3",
  intendedEvidenceRoles: ["learning_practice"],
  instruction: {
    instructionId: "instruction-1",
    locale: "de",
    safeContentNodes: [text("Lesen Sie den Text und beantworten Sie die Frage.")],
    responseMechanic: "single_select",
    helpPolicy: { offerableAssistanceKinds: ["strategy_cue"] },
    learnerFacingTimingLabel: null,
  },
  learnerPayload,
  items: [],
  keyRevisionIds: [appId<"key_revision">("key-revision-0001")],
  mediaRevisionIds: [],
  rightsEnvelopeId: appId<"rights_envelope">("rights-envelope-0001"),
  accessibilityManifestId: "accessibility-manifest-0001",
  digest: "not-yet-computed",
};

const form: ObjectiveForm = {
  formId: appId<"content_form">("content-form-0001"),
  formRevisionId: "form-revision-1",
  targetBlueprintReleaseId: "blueprint/2026-01",
  taskDefinitionVersions: [{ id: "task-definition-r2", revision: 1 }],
  contentRevisionIds: [revision.contentRevisionId],
  contentFamilyIds: [revision.contentFamilyId],
  itemIds: [appId<"content_item">("content-item-0001")],
  keyRevisionIds: [appId<"key_revision">("key-revision-0001")],
  approvalDecisionId: appId<"approval_decision">("approval-decision-0001"),
  intendedRole: "learning_practice",
  progressionProfile: "P3",
  blockContracts: [
    {
      kind: "objective_practice_block",
      blockId: "block-1",
      taskFamilyKind: "R2DetailedSelect",
      timingRule: { kind: "open" },
      submissionBoundary: "task_set",
      feedbackAfterSubmission: "block_end",
    },
  ],
  navigationPolicy: "navigation/free-within-block",
  feedbackPolicy: "feedback/block-end",
  checkpointPolicyRef: "checkpoint/objective-v1",
  rightsAndAccessibilityManifestRefs: ["rights-envelope-0001", "accessibility-manifest-0001"],
  digest: "not-yet-computed",
};

const key: ObjectiveKeyRevision = sealObjectiveKeyRevision({
  keyRevisionId: appId<"key_revision">("key-revision-0001"),
  itemId: appId<"content_item">("content-item-0001"),
  acceptedResponseSet: [{ kind: "option", optionId: "option-a" }],
  responseCardinality: { min: 1, max: 1 },
  scoringPolicyRef: "scoring-policy/objective-v1",
  decisiveEvidenceRefs: [
    {
      stimulusId: "article-1",
      anchorId: "anchor-1",
      safeRevealSpanOrRelation: "Der Kurs beginnt am Montag.",
      relationKind: "direct_span",
    },
  ],
  correctRationale: "Nur A trifft zu.",
  distractorRationales: [
    {
      optionOrCandidateId: "option-b",
      whyPlausible: "Teilt ein Wort mit dem Text.",
      decisiveMismatch: "Anderer Wochentag.",
      failureFamily: "surface_word_match",
      minimumSafeFeedbackKey: "feedback.surface-word",
    },
  ],
  intendedCauseMappings: [{ optionOrCandidateId: "option-b", causeRef: "cause.scanning" }],
  independentValidatorResult: {
    validatorRef: "validator-1",
    method: "blind_solve",
    agreedWithProposedKey: true,
    recordedAt: "2026-01-05T09:00:00.000Z",
  },
  targetAndContentLineage: {
    contentRevisionId: revision.contentRevisionId,
    targetBlueprintRelease: "blueprint/2026-01",
    taxonomyRelease: "taxonomy/2026-01",
  },
  approvalDecisionId: appId<"approval_decision">("approval-decision-0001"),
});

const manifest: ServingManifest = {
  servingManifestId: appId<"serving_manifest">("serving-manifest-0001"),
  attemptId: appId<"attempt">("attempt-00000001"),
  contentRevisionIds: [revision.contentRevisionId],
  itemIds: [appId<"content_item">("content-item-0001")],
  mediaRevisionIds: [],
  keyRevisionDigests: [keyRevisionDigest(key)],
  contentClass: "C3",
  approvalRole: "training",
  learnerSafePayloadDigest: canonicalDigest(learnerPayload),
  freshnessDecision: "fresh",
  comparedFamilyRefs: [],
  authorizationVersion: "authz/2026-01",
  contentReleaseIdentity: "stage-05-content-v1",
  issuedAt: "2026-06-01T10:00:00.000Z",
  expiresAt: "2026-06-01T11:00:00.000Z",
  revocationState: "active",
};

describe("canonical-json/v1 is deterministic and stable (D02)", () => {
  it("pins the canonicalization version Stage 03 already records", () => {
    expect(canonicalizationVersion).toBe("canonical-json/v1");
  });

  it("is independent of key insertion order, nested objects and arrays included", () => {
    const first = {
      zeta: 1,
      alpha: { nested: { later: [1, 2, { b: true, a: false }], earlier: "x" }, flag: null },
      list: [{ second: 2, first: 1 }],
    };
    const second = {
      list: [{ first: 1, second: 2 }],
      alpha: { flag: null, nested: { earlier: "x", later: [1, 2, { a: false, b: true }] } },
      zeta: 1,
    };
    expect(canonicalJson(first)).toBe(canonicalJson(second));
    expect(canonicalDigest(first)).toBe(canonicalDigest(second));
  });

  it("sorts object keys but preserves array order, because order is meaning in one and not the other", () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]));
  });

  it("produces byte-identical output on repeated calls", () => {
    const value = { list: [1, "zwei", null, true], nested: { deep: { deeper: [{ x: 1 }] } } };
    const once = canonicalJson(value);
    for (let repeat = 0; repeat < 5; repeat += 1) expect(canonicalJson(value)).toBe(once);
  });

  it("treats an omitted property and an explicit undefined as the same fact", () => {
    expect(canonicalJson({ a: 1, b: undefined })).toBe(canonicalJson({ a: 1 }));
  });

  it("normalises negative zero, because it is the same quantity", () => {
    expect(canonicalJson({ value: -0 })).toBe(canonicalJson({ value: 0 }));
  });

  it("escapes strings deterministically", () => {
    expect(canonicalJson('Öffnungszeiten "gilt"\n')).toBe(
      JSON.stringify('Öffnungszeiten "gilt"\n'),
    );
  });

  it("fails loudly on anything with no canonical form", () => {
    expect(() => canonicalJson(undefined)).toThrow(/undefined/);
    expect(() => canonicalJson(Number.NaN)).toThrow(/non-finite/);
    expect(() => canonicalJson({ at: Number.POSITIVE_INFINITY })).toThrow(/non-finite/);
    expect(() => canonicalJson({ at: new Date() })).toThrow(/plain objects/);
    expect(() => canonicalJson(new Map())).toThrow(/plain objects/);
    expect(() => canonicalJson(new Set())).toThrow(/plain objects/);
    expect(() => canonicalJson({ id: 1n })).toThrow(/bigint/);
    expect(() => canonicalJson({ run: () => 1 })).toThrow(/function/);
    expect(() => canonicalJson({ tag: Symbol("x") })).toThrow(/symbol/);
  });

  it("names the offending location", () => {
    expect(() => canonicalJson({ outer: { list: [1, Number.NaN] } })).toThrow(
      "canonical-json/v1 cannot serialize /outer/list/1",
    );
  });

  it("refuses a cyclic value rather than looping", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => canonicalJson(cyclic)).toThrow(/cyclic/);
  });

  it("refuses runaway nesting", () => {
    let nested: unknown = 1;
    for (let depth = 0; depth <= maxCanonicalDepth + 1; depth += 1) nested = { nested };
    expect(() => canonicalJson(nested)).toThrow(/nesting exceeds/);
  });

  it("emits a stable 64-character lower-case hex digest", () => {
    const digest = canonicalDigest({ a: 1 });
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(digest).toBe("015abd7f5cc57a2dd94b7590f04ad8084273905ee33ec5cebeae62276a97f862");
  });
});

describe("the five publication digests (D02)", () => {
  it("digests a content revision without its own stored digest", () => {
    const computed = contentRevisionDigest(revision);
    expect(computed).toMatch(/^[0-9a-f]{64}$/);
    expect(contentRevisionDigest({ ...revision, digest: computed })).toBe(computed);
    expect(contentRevisionDigest({ ...revision, digest: "tampered" })).toBe(computed);
  });

  it("detects a material change to a content revision", () => {
    expect(contentRevisionDigest({ ...revision, taxonomyRelease: "taxonomy/2026-02" })).not.toBe(
      contentRevisionDigest(revision),
    );
    expect(
      contentRevisionDigest({
        ...revision,
        instruction: { ...revision.instruction, learnerFacingTimingLabel: "Bestehen practice" },
      }),
    ).not.toBe(contentRevisionDigest(revision));
  });

  it("digests a form without its own stored digest and detects composition change", () => {
    const computed = formDigest(form);
    expect(formDigest({ ...form, digest: computed })).toBe(computed);
    expect(formDigest({ ...form, navigationPolicy: "navigation/linear" })).not.toBe(computed);
  });

  it("digests a key revision stably and never carries key material in its reference", () => {
    expect(keyRevisionDigest(key)).toMatch(/^[0-9a-f]{64}$/);
    const reference = keyRevisionReference(key);
    expect(reference.digest).toBe(keyRevisionDigest(key));
    expect(Object.keys(reference).sort()).toEqual(["digest", "keyRevisionId"]);
    expect(findKeyBearingFields({ keyRevisionDigests: [reference.digest] })).toEqual([]);
  });

  it("keeps a key digest independent of the order its fields were written in", () => {
    const reordered = sealObjectiveKeyRevision({
      approvalDecisionId: key.approvalDecisionId,
      targetAndContentLineage: key.targetAndContentLineage,
      independentValidatorResult: key.independentValidatorResult,
      intendedCauseMappings: key.intendedCauseMappings,
      distractorRationales: key.distractorRationales,
      correctRationale: key.correctRationale,
      decisiveEvidenceRefs: key.decisiveEvidenceRefs,
      scoringPolicyRef: key.scoringPolicyRef,
      responseCardinality: key.responseCardinality,
      acceptedResponseSet: key.acceptedResponseSet,
      itemId: key.itemId,
      keyRevisionId: key.keyRevisionId,
    });
    expect(keyRevisionDigest(reordered)).toBe(keyRevisionDigest(key));
  });

  it("detects a changed accepted response", () => {
    const changed = sealObjectiveKeyRevision({
      ...key,
      acceptedResponseSet: [{ kind: "option", optionId: "option-b" }],
    });
    expect(keyRevisionDigest(changed)).not.toBe(keyRevisionDigest(key));
  });

  it("digests a media revision manifest separately from the bytes it describes", () => {
    const media = {
      mediaRevisionId: "media-revision-0001",
      objectKey: "audio/h1/announcement-1.mp3",
      digest: "c".repeat(64),
      bytes: 40_960,
      mime: "audio/mpeg",
      codec: "mp3",
      container: "mp3",
      durationMs: 21_000,
    };
    const manifestDigest = mediaRevisionDigest(media);
    expect(manifestDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(manifestDigest).not.toBe(media.digest);
    expect(mediaRevisionDigest({ ...media, durationMs: 21_001 })).not.toBe(manifestDigest);
  });

  it("digests a serving lease over exactly what the lease pins", () => {
    const computed = servingManifestDigest(manifest);
    expect(computed).toMatch(/^[0-9a-f]{64}$/);
    expect(servingManifestDigest({ ...manifest, expiresAt: "2026-06-01T12:00:00.000Z" })).not.toBe(
      computed,
    );
  });
});
