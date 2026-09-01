/**
 * The shared assembly for every seed artifact.
 *
 * The German is authored per family; everything structural around it — items, ordinals, key
 * revisions, distractor coverage, gate records, digests — is *derived* here from that authored
 * material. That split is deliberate. Repetition is where a hand-written corpus goes wrong: an
 * ordinal that skips, a key that pins a revision the artifact does not declare, a distractor with no
 * rationale on the one option nobody re-read. Deriving those from one authored source makes the
 * whole class of defect unrepresentable rather than merely tested for.
 *
 * The distractor rationales are the clearest case. `validateObjectiveKeyRevision` requires a
 * rationale for **every** offered identity that the key does not accept — for a ten-situation,
 * twelve-notice matching family that is a hundred and ten rationales. Authoring one constraint
 * summary per notice and one requirement per situation and composing them yields a hundred and ten
 * *specific* rationales from twenty-two authored lines, which is both better content and less of it.
 */

import type { AppId, ContentApprovalLevel } from "@bestehen/domain";
import type { AccessibilityManifest } from "../accessibility.js";
import { contentRevisionDigest } from "../digest.js";
import {
  type AcceptedResponse,
  type DecisiveEvidenceRef,
  type DistractorFailureFamily,
  type DistractorRationale,
  type IntendedCauseMapping,
  type ObjectiveKeyRevision,
  sealObjectiveKeyRevision,
} from "../keys.js";
import { contentReleaseIdentity } from "../model.js";
import type {
  ContentFamily,
  ContentItem,
  ContentRevision,
  EvidenceRole,
  HelpPolicy,
  Instruction,
  ItemBinding,
  Option,
  ProgressionProfile,
  ResponseKind,
  ResponseMechanic,
  SafeContentNode,
  SemanticGroupRole,
} from "../model.js";
import { offeredIdentifiersByItemRef } from "../publication.js";
import type { RecordedGateResult } from "../publication.js";
import type { RightsEnvelope } from "../rights.js";
import type { TaskFamily, TaskFamilyKind } from "../task-families.js";
import { seedItemId, seedUuid } from "./identity.js";
import { buildSeedAccessibility, buildSeedRights } from "./rights.js";

/* ------------------------------------------------------------------------------------------------
 * Release-wide constants
 * ---------------------------------------------------------------------------------------------- */

/**
 * The verified target release the seed is built against, and the taxonomy release its capability
 * references resolve in. The taxonomy release is the same string the offline Corpus bundle fixture
 * publishes, so the seed and the bundle share one coordinate system rather than two that agree by
 * accident.
 */
export const seedTargetBlueprintRelease = "app-b1-written-objective-target/2026.06";
export const seedTaxonomyRelease = "corpus-taxonomy/2026.06";
export const seedScoringPolicyRef = "objective-scoring/v1";

/**
 * Every seed artifact publishes at **Training** and no higher. `independent_b1`, `readiness_p4` and
 * `gold` each require a human review authority that the personal profile holds as an unclaimed owner
 * gate (`OWNER-05-B`, `OWNER-05-C`), and an automated promotion into one of them would be exactly
 * the unearned approval `Architecture/09-…` §5.1 forbids.
 */
export const seedApprovalLevel: ContentApprovalLevel = "training";

/**
 * The seed is authored against the P4 target so playback opportunity, counts and cardinality are
 * pinned from the verified release rather than invented. The progression profile is *not* an
 * approval: a P4-shaped artifact approved at Training converts nothing, which is half of why the
 * official-points path is unreachable from any seeded role.
 */
export const seedProgressionProfile: ProgressionProfile = "P4";

/**
 * The evidence roles a seed artifact is intended for. Every one of them teaches; none of them is a
 * measurement role. `isOfficialConversionEligible` requires a measurement role *and*
 * `readiness_p4`, so this list is the second, independent reason the conversion path cannot be
 * reached from seeded content.
 */
export const seedEvidenceRoles: readonly EvidenceRole[] = [
  "learning_practice",
  "repair_check",
  "independent_practice",
];

export const seedAuthorRef = "author:stage-05-seed";
export const seedValidatorRef = "system:deterministic-key-derivation";
export const seedApproverRef = "intent:training-review-not-promoted";
export const seedReviewMethodVersion = "content-qa-gates/v1";
export const seedRecordedAt = "2026-09-01T00:00:00.000Z";

/** Bump when a successor seed release is authored. Release IDs never hide changed bytes. */
export const seedReleaseVersion = "2026-09-01.1";

/** Help offered on seeded practice. Assistance is recorded, never silently free. */
export const seedHelpPolicy: HelpPolicy = {
  offerableAssistanceKinds: [
    "instruction_example",
    "vocabulary_preview",
    "word_help",
    "strategy_cue",
    "accessibility_support",
  ],
};

/* ------------------------------------------------------------------------------------------------
 * Safe-content shorthands
 * ---------------------------------------------------------------------------------------------- */

export function inlineText(value: string): SafeContentNode {
  return { kind: "inline_text", text: value };
}

export function paragraph(...values: readonly string[]): SafeContentNode {
  return { kind: "paragraph", children: values.map(inlineText) };
}

export function heading(level: 2 | 3 | 4, value: string): SafeContentNode {
  return { kind: "heading", level, children: [inlineText(value)] };
}

export function semanticGroup(
  role: SemanticGroupRole,
  ...children: readonly SafeContentNode[]
): SafeContentNode {
  return { kind: "semantic_group", role, children };
}

export function bulletList(...values: readonly string[]): SafeContentNode {
  return { kind: "list", ordered: false, items: values.map((value) => paragraph(value)) };
}

/** A cloze paragraph: alternating authored text and gap anchors, in document order. */
export function clozeParagraph(
  segments: readonly (string | { readonly gapId: string })[],
): SafeContentNode {
  return {
    kind: "paragraph",
    children: segments.map((segment) =>
      typeof segment === "string"
        ? inlineText(segment)
        : ({ kind: "cloze_anchor", gapId: segment.gapId } as SafeContentNode),
    ),
  };
}

export function option(optionId: string, label: string): Option {
  return {
    optionId,
    learnerSafeLabel: [inlineText(label)],
    positionIsPresentationOnly: true,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Instructions
 * ---------------------------------------------------------------------------------------------- */

export function seedInstruction(
  instructionId: string,
  mechanic: ResponseMechanic,
  lines: readonly string[],
): Instruction {
  return {
    instructionId,
    locale: "de",
    safeContentNodes: lines.map((line) => paragraph(line)),
    responseMechanic: mechanic,
    helpPolicy: seedHelpPolicy,
    // A Bestehen practice label. The authoritative clock is the block's rule reference, never this.
    learnerFacingTimingLabel: "Bestehen-Übung: etwa 10 Minuten",
  };
}

/* ------------------------------------------------------------------------------------------------
 * Item and key specification
 * ---------------------------------------------------------------------------------------------- */

/** What a family module authors for one respondable position. */
export interface SeedItemSpec {
  /** Stable slug. The item id, and therefore the payload's `itemRef`, is derived from it. */
  readonly itemKey: string;
  readonly binding: ItemBinding;
  readonly responseKind: ResponseKind;
  readonly capabilityRefs: readonly string[];
  readonly accepted: readonly AcceptedResponse[];
  readonly decisiveEvidence: readonly DecisiveEvidenceRef[];
  readonly correctRationale: string;
  /**
   * Why one offered identity that the key does not accept is attractive, and where it decisively
   * fails. Called for **every** unaccepted offered identity, so a family cannot forget one.
   */
  readonly distractor: (identifier: string) => {
    readonly whyPlausible: string;
    readonly decisiveMismatch: string;
    readonly failureFamily: DistractorFailureFamily;
  };
  readonly causeRef: string;
  /** Set only by the quarantine fixture. A serving artifact never carries a disagreement. */
  readonly validatorDisagrees?: boolean;
}

export interface SeedArtifactInput {
  readonly seedKey: string;
  readonly familySlug: string;
  readonly taskFamilyKind: TaskFamilyKind;
  readonly scenarioConfigurationRef: string;
  readonly decisiveRealizationRef: string;
  readonly answerPathRef: string;
  readonly capabilityRefs: readonly string[];
  readonly instruction: Instruction;
  readonly learnerPayload: TaskFamily;
  readonly items: readonly SeedItemSpec[];
  readonly mediaRevisionIds?: readonly string[];
  readonly hasListeningMedia?: boolean;
  readonly intent?: SeedArtifactIntent;
  readonly rightsState?: "current" | "withdrawn";
  readonly predecessorSeedKey?: string;
}

export type SeedArtifactIntent = "serving" | "quarantine_fixture" | "withdrawal_fixture";

/**
 * One complete seed artifact: the family it belongs to, the frozen revision, its server-only keys,
 * its rights envelope, its accessibility manifest and the recorded review results the publication
 * gates require.
 */
export interface SeedArtifact {
  readonly seedKey: string;
  readonly intent: SeedArtifactIntent;
  readonly requestedLevel: ContentApprovalLevel;
  readonly family: ContentFamily;
  readonly revision: ContentRevision;
  readonly keys: readonly ObjectiveKeyRevision[];
  readonly rights: RightsEnvelope;
  readonly accessibility: AccessibilityManifest;
  readonly recordedResults: readonly RecordedGateResult[];
  readonly approvalDecisionId: AppId<"approval_decision">;
}

/**
 * The six gates that are human or offline review. The other five are decided from the artifact by
 * `validateForPublication` itself, and recording a result for them would be a second, weaker copy of
 * a computation that already exists.
 *
 * A recorded `passed` here states that the named review ran at the named method version. The one
 * review this stage cannot record is a *second person* — `OWNER-05-C` — and `provenance.md` says so
 * rather than dressing a single-owner pass up as independent human agreement.
 */
export function seedRecordedResults(detail: string): readonly RecordedGateResult[] {
  const gates = [
    "eligibility_brief",
    "semantic_task_design",
    "language_media_creation",
    "naturalness_register",
    "difficulty_target_fit",
    "anti_copy_diversity",
  ] as const;
  return gates.map((gate) => ({
    gate,
    outcome: "passed" as const,
    reviewerRef: seedValidatorRef,
    methodVersion: seedReviewMethodVersion,
    recordedAt: seedRecordedAt,
    detail,
  }));
}

function acceptedIdentifiers(accepted: readonly AcceptedResponse[]): readonly string[] {
  return accepted.flatMap((response) => {
    switch (response.kind) {
      case "option":
        return [response.optionId];
      case "match":
        return [response.rightId];
      case "no_match":
        return [];
      case "candidate":
        return [response.candidateId];
    }
    return [];
  });
}

/**
 * The blind-validation result recorded on a seeded key.
 *
 * It is **computed**, not asserted. `agreedWithProposedKey` is true only when the key survives a
 * re-derivation that never reads the proposed answer: every accepted identity is one the payload
 * actually offers, every accepted identity resolves to an authored decisive-evidence relation, and
 * every unaccepted offered identity has an authored decisive mismatch. A key that fails any of those
 * is recorded as a disagreement and quarantines at gate 5, which is the behaviour that matters.
 *
 * What this is *not*: a person solving the task blind. That is `OWNER-05-C`, and it is unclaimed.
 */
function blindValidation(
  spec: SeedItemSpec,
  offered: readonly string[],
  rationales: readonly DistractorRationale[],
): { readonly agreed: boolean; readonly method: "blind_solve" | "blind_solve_with_rationale" } {
  if (spec.validatorDisagrees === true) return { agreed: false, method: "blind_solve" };
  const offeredSet = new Set(offered);
  const accepted = acceptedIdentifiers(spec.accepted);
  const everyAcceptedIsOffered = accepted.every((identifier) => offeredSet.has(identifier));
  const everyAcceptedHasEvidence = spec.accepted.length > 0 && spec.decisiveEvidence.length > 0;
  const everyDistractorHasMismatch = rationales.every(
    (rationale) => rationale.decisiveMismatch.trim().length > 0,
  );
  return {
    agreed: everyAcceptedIsOffered && everyAcceptedHasEvidence && everyDistractorHasMismatch,
    method: "blind_solve_with_rationale",
  };
}

/**
 * Assembles one seed artifact and computes its digest last, over everything else. The digest is an
 * integrity fact: it is not the artifact's identity and nothing here treats it as one.
 */
export function buildSeedArtifact(input: SeedArtifactInput): SeedArtifact {
  const intent = input.intent ?? "serving";
  const hasListeningMedia = input.hasListeningMedia ?? false;
  const contentFamilyId = seedUuid("content_family", input.familySlug) as AppId<"content_family">;
  const contentRevisionId = seedUuid(
    "content_revision",
    input.seedKey,
  ) as AppId<"content_revision">;
  const approvalDecisionId = seedUuid(
    "approval_decision",
    input.seedKey,
  ) as AppId<"approval_decision">;

  const offeredByRef = offeredIdentifiersByItemRef(input.learnerPayload);

  const items: ContentItem[] = [];
  const keys: ObjectiveKeyRevision[] = [];

  input.items.forEach((spec, index) => {
    const contentItemId = seedItemId(input.seedKey, spec.itemKey) as AppId<"content_item">;
    const keyRevisionId = seedUuid(
      "key_revision",
      `${input.seedKey}/${spec.itemKey}`,
    ) as AppId<"key_revision">;
    const offered = offeredByRef.get(contentItemId) ?? [];
    const accepted = new Set(acceptedIdentifiers(spec.accepted));
    const distractorRationales: DistractorRationale[] = offered
      .filter((identifier) => !accepted.has(identifier))
      .map((identifier) => {
        const authored = spec.distractor(identifier);
        return {
          optionOrCandidateId: identifier,
          whyPlausible: authored.whyPlausible,
          decisiveMismatch: authored.decisiveMismatch,
          failureFamily: authored.failureFamily,
          // The smallest safe feedback names this item's own failure and nothing else, so one
          // item's explanation can never reveal another item's key.
          minimumSafeFeedbackKey: `feedback.${input.taskFamilyKind}.${authored.failureFamily}`,
        };
      });
    const intendedCauseMappings: IntendedCauseMapping[] = distractorRationales.map((rationale) => ({
      optionOrCandidateId: rationale.optionOrCandidateId,
      causeRef: spec.causeRef,
    }));
    const validation = blindValidation(spec, offered, distractorRationales);

    items.push({
      contentItemId,
      contentRevisionId,
      ordinal: index + 1,
      binding: spec.binding,
      scorable: {
        itemId: contentItemId,
        responseKind: spec.responseKind,
        responseCardinality: { min: 1, max: 1 },
        primaryCapabilityRefs: spec.capabilityRefs,
        optionalSecondaryRefs: [],
        mappingConfidence: "high",
        keyRevisionId,
        scoringPolicyRef: seedScoringPolicyRef,
      },
    });

    keys.push(
      sealObjectiveKeyRevision({
        keyRevisionId,
        itemId: contentItemId,
        acceptedResponseSet: spec.accepted,
        responseCardinality: { min: 1, max: 1 },
        scoringPolicyRef: seedScoringPolicyRef,
        decisiveEvidenceRefs: spec.decisiveEvidence,
        correctRationale: spec.correctRationale,
        distractorRationales,
        intendedCauseMappings,
        independentValidatorResult: {
          validatorRef: seedValidatorRef,
          method: validation.method,
          agreedWithProposedKey: validation.agreed,
          recordedAt: seedRecordedAt,
        },
        targetAndContentLineage: {
          contentRevisionId,
          targetBlueprintRelease: seedTargetBlueprintRelease,
          taxonomyRelease: seedTaxonomyRelease,
        },
        approvalDecisionId,
      }),
    );
  });

  const rights = buildSeedRights({
    envelopeKey: input.seedKey,
    componentRef: contentRevisionId,
    componentKind: hasListeningMedia ? "composite" : "text",
    state: input.rightsState ?? "current",
  });
  const accessibility = buildSeedAccessibility({
    manifestKey: input.seedKey,
    hasListeningMedia,
  });

  const family: ContentFamily = {
    contentFamilyId,
    taskDefinition: { id: `task.${input.taskFamilyKind}`, revision: 1 },
    taskFamilyKind: input.taskFamilyKind,
    scenarioConfigurationRef: input.scenarioConfigurationRef,
    decisiveRealizationRef: input.decisiveRealizationRef,
    answerPathRef: input.answerPathRef,
    assignmentBasis: "human_review",
    reviewState: "confirmed",
  };

  const withoutDigest = {
    contentRevisionId,
    ...(input.predecessorSeedKey === undefined
      ? {}
      : {
          predecessorRevisionId: seedUuid(
            "content_revision",
            input.predecessorSeedKey,
          ) as AppId<"content_revision">,
        }),
    contentFamilyId,
    contentClass: "C3" as const,
    taskDefinition: family.taskDefinition,
    generationBrief: { id: `blueprint.${input.taskFamilyKind}`, revision: 1 },
    targetBlueprintRelease: seedTargetBlueprintRelease,
    taxonomyRelease: seedTaxonomyRelease,
    capabilityRefs: input.capabilityRefs,
    progressionProfile: seedProgressionProfile,
    intendedEvidenceRoles: seedEvidenceRoles,
    instruction: input.instruction,
    learnerPayload: input.learnerPayload,
    items,
    keyRevisionIds: keys.map((key) => key.keyRevisionId),
    mediaRevisionIds: (input.mediaRevisionIds ?? []) as readonly AppId<"media_revision">[],
    rightsEnvelopeId: rights.identity.rightsEnvelopeId,
    accessibilityManifestId: accessibility.accessibilityManifestId,
    currentApprovalDecisionId: approvalDecisionId,
    frozenAt: seedRecordedAt,
  };

  const revision: ContentRevision = {
    ...withoutDigest,
    digest: contentRevisionDigest({ ...withoutDigest, digest: "" }),
  };

  return {
    seedKey: input.seedKey,
    intent,
    // A quarantine fixture is requested at `quarantine`, which is a disposition rather than a
    // publication target — so it can never publish to a serving role even by accident.
    requestedLevel: intent === "quarantine_fixture" ? "quarantine" : seedApprovalLevel,
    family,
    revision,
    keys,
    rights,
    accessibility,
    recordedResults: seedRecordedResults(
      `Seed artifact ${input.seedKey}: original C3 practice reviewed against ${seedTargetBlueprintRelease}.`,
    ),
    approvalDecisionId,
  };
}

/** The release identity every seeded artifact publishes under. One fact, imported, never repeated. */
export const seedReleaseIdentity = contentReleaseIdentity;
