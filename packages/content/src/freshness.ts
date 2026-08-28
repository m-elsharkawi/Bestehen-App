/**
 * Conservative family assignment, exposure recording, and the freshness/independence table of
 * `Architecture/09-…` §7.1-§7.2 as a decision function.
 *
 * Three rules shape every function here:
 *
 * 1. **No calibrated numeric similarity threshold is invented.** `Architecture/09-…` §7.1 says so
 *    explicitly: Stage 26 validates a threshold against human-labelled duplicate/independent pairs,
 *    weighting false-independent errors highest. This module therefore takes a *labelled* review
 *    outcome, never a score, and treats an unresolved review conservatively — the candidate joins
 *    the family or stays ineligible for an independence claim.
 * 2. **Reordering answers, changing names or dates, and changing only a voice cannot create a
 *    family.** The semantic family key is built from the authored task definition and the semantic
 *    configuration references, never from surface text, so those changes are invisible to it.
 * 3. **Exposure only ever strengthens.** Abandonment does not erase exposure, a later `unseen`
 *    observation never overwrites a recorded one, and a serving decision may deliberately reuse an
 *    exposed family — but must then label it repetition and may not call it transfer.
 *
 * Pure throughout: no clock, no store, no randomness.
 */

import {
  type ContentApprovalLevel,
  type ContentFamilyId,
  type ExposureClass,
  type FreshnessDecision,
  type IndependenceClass,
  type ReasonCode,
  exposureClasses,
} from "@bestehen/domain";
import type { FamilyAssignmentBasis, FamilyReviewState } from "./model.js";
import type { TaskFamilyKind } from "./task-families.js";

/* ------------------------------------------------------------------------------------------------
 * Conservative family assignment (`Architecture/09-…` §7.1)
 * ---------------------------------------------------------------------------------------------- */

/**
 * The facts a family comparison is allowed to use.
 *
 * `normalizedTextDigest` participates in the **exact** duplicate check only. It is deliberately not
 * part of the semantic key: renaming an entity or changing a date changes the text and must not
 * therefore manufacture a new family.
 */
export interface FamilySignature {
  readonly taskFamilyKind: TaskFamilyKind;
  readonly taskDefinitionId: string;
  /** Digest over canonical normalized stimulus text, for exact and byte-level duplicate detection. */
  readonly normalizedTextDigest: string;
  readonly scenarioConfigurationRef: string;
  readonly decisiveRealizationRef: string;
  readonly answerPathRef: string;
  /** Prompt obligations and interaction constraints, order-insensitive. */
  readonly obligationRefs: readonly string[];
}

/**
 * Canonical normalization for the exact-duplicate comparison: case folded, punctuation-insensitive,
 * whitespace collapsed. It is used to prove *sameness*, never independence — two texts that differ
 * after normalization are not thereby independent.
 */
export function normalizeForFamilyComparison(text: string): string {
  return text
    .normalize("NFKC")
    .toLocaleLowerCase("de-DE")
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

/** The semantic identity two candidates must share to be the same family. */
export function semanticFamilyKey(signature: FamilySignature): string {
  return [
    signature.taskFamilyKind,
    signature.taskDefinitionId,
    signature.scenarioConfigurationRef,
    signature.decisiveRealizationRef,
    signature.answerPathRef,
    [...signature.obligationRefs].sort().join("+"),
  ].join("|");
}

/** The exact-duplicate identity. Two candidates sharing it are the same family without review. */
export function exactDuplicateKey(signature: FamilySignature): string {
  return `${signature.taskFamilyKind}|${signature.taskDefinitionId}|${signature.normalizedTextDigest}`;
}

/**
 * A labelled review conclusion. There is no numeric field, by design: a similarity number without a
 * validated threshold is a false precision, and `unresolved` is the honest third answer.
 */
export const familyReviewOutcomes = ["same_family", "independent", "unresolved"] as const;
export type FamilyReviewOutcome = (typeof familyReviewOutcomes)[number];

export interface ExistingFamily {
  readonly contentFamilyId: ContentFamilyId;
  readonly signature: FamilySignature;
}

export interface FamilyReviewInput {
  /** How the semantic comparison concluded, when one was performed at all. */
  readonly outcome: FamilyReviewOutcome;
  /** Families the comparison proposed as related, most similar first. */
  readonly proposedFamilyIds: readonly ContentFamilyId[];
  /** `true` when a human confirmed the conclusion rather than an automated proposal standing alone. */
  readonly humanConfirmed: boolean;
}

export const familyAssignmentReasons = [
  "exact_duplicate",
  "semantic_key_match",
  "review_says_same_family",
  "unresolved_review_joins_proposed_family",
  "unresolved_review_without_proposal",
  "independent_new_family",
] as const;
export type FamilyAssignmentReason = (typeof familyAssignmentReasons)[number];

export interface FamilyAssignment {
  /** `null` means a new family must be minted; identity is the caller's to assign. */
  readonly contentFamilyId: ContentFamilyId | null;
  readonly basis: FamilyAssignmentBasis;
  readonly reviewState: FamilyReviewState;
  /**
   * Whether the candidate may ever back an *independent* occasion claim. An unresolved review
   * yields `false`: an unproven independence is not an independence.
   */
  readonly independenceEligible: boolean;
  readonly reason: FamilyAssignmentReason;
}

/**
 * Assigns a candidate to a family, conservatively.
 *
 * Precedence: an exact duplicate is the same family without review; a matching semantic key is the
 * same family; a review that says `same_family` is obeyed; an **unresolved** review joins the
 * nearest proposed family and, when nothing was proposed, mints a family that is nonetheless
 * ineligible for an independence claim until a review resolves. Only an explicit `independent`
 * conclusion produces an independence-eligible new family.
 */
export function assignFamily(
  candidate: FamilySignature,
  existing: readonly ExistingFamily[],
  review: FamilyReviewInput,
): FamilyAssignment {
  const exactKey = exactDuplicateKey(candidate);
  const duplicate = existing.find((entry) => exactDuplicateKey(entry.signature) === exactKey);
  if (duplicate) {
    return {
      contentFamilyId: duplicate.contentFamilyId,
      basis: "automated_proposal",
      reviewState: "confirmed",
      independenceEligible: false,
      reason: "exact_duplicate",
    };
  }

  const semanticKey = semanticFamilyKey(candidate);
  const semantic = existing.find((entry) => semanticFamilyKey(entry.signature) === semanticKey);
  if (semantic) {
    return {
      contentFamilyId: semantic.contentFamilyId,
      basis: "automated_proposal",
      reviewState: review.humanConfirmed ? "confirmed" : "proposed",
      independenceEligible: false,
      reason: "semantic_key_match",
    };
  }

  if (review.outcome === "same_family") {
    const proposed = review.proposedFamilyIds[0] ?? null;
    return {
      contentFamilyId: proposed,
      basis: review.humanConfirmed ? "human_review" : "automated_proposal",
      reviewState: review.humanConfirmed ? "confirmed" : "proposed",
      independenceEligible: false,
      reason: "review_says_same_family",
    };
  }

  if (review.outcome === "unresolved") {
    const proposed = review.proposedFamilyIds[0];
    return proposed === undefined
      ? {
          contentFamilyId: null,
          basis: "conservative_default",
          reviewState: "unresolved",
          independenceEligible: false,
          reason: "unresolved_review_without_proposal",
        }
      : {
          contentFamilyId: proposed,
          basis: "conservative_default",
          reviewState: "unresolved",
          independenceEligible: false,
          reason: "unresolved_review_joins_proposed_family",
        };
  }

  return {
    contentFamilyId: null,
    basis: review.humanConfirmed ? "human_review" : "automated_proposal",
    reviewState: review.humanConfirmed ? "confirmed" : "proposed",
    independenceEligible: review.humanConfirmed,
    reason: "independent_new_family",
  };
}

/* ------------------------------------------------------------------------------------------------
 * Exposure recording (`Architecture/09-…` §7.1)
 * ---------------------------------------------------------------------------------------------- */

/** What was materially revealed. Anything on this list records an exposure fact. */
export const exposureTriggers = [
  "learner_visible_stimulus",
  "decisive_information",
  "key_or_rationale",
  "transcript",
  "partner_private_content",
] as const;
export type ExposureTrigger = (typeof exposureTriggers)[number];

export interface ExposureEvent {
  readonly contentFamilyId: ContentFamilyId;
  readonly trigger: ExposureTrigger;
  /** `false` when the reveal was incidental and not material — a title, a heading, a control label. */
  readonly materiallyRevealed: boolean;
  /** Abandonment does not erase exposure; it is recorded here only so the rule is testable. */
  readonly attemptAbandoned: boolean;
}

/**
 * Whether the event records an exposure fact. Abandonment is deliberately not a reason to skip
 * recording: a learner who saw the decisive information and walked away has still seen it.
 */
export function shouldRecordExposure(event: ExposureEvent): boolean {
  return event.materiallyRevealed;
}

/** Which exposure class an event produces, for the family it revealed. */
export function exposureClassForTrigger(trigger: ExposureTrigger): ExposureClass {
  switch (trigger) {
    case "key_or_rationale":
      return "answer_exposed";
    case "learner_visible_stimulus":
    case "decisive_information":
    case "transcript":
    case "partner_private_content":
      return "exposed_family";
  }
}

/**
 * Exposure strength, weakest first. Seeing a near-duplicate is weaker evidence of exposure than
 * seeing the family itself, and seeing the key is strongest. The order exists so exposure can be
 * merged monotonically; it is not a score.
 */
export const exposureStrength: Readonly<Record<ExposureClass, number>> = {
  unseen: 0,
  near_duplicate_family: 1,
  exposed_family: 2,
  answer_exposed: 3,
};

/** Merges two recorded exposure classes. Exposure never weakens. */
export function mergeExposure(existing: ExposureClass, incoming: ExposureClass): ExposureClass {
  return exposureStrength[incoming] > exposureStrength[existing] ? incoming : existing;
}

/** The recorded exposure after an event, or the unchanged prior class when nothing was revealed. */
export function recordExposure(existing: ExposureClass, event: ExposureEvent): ExposureClass {
  if (!shouldRecordExposure(event)) return existing;
  return mergeExposure(existing, exposureClassForTrigger(event.trigger));
}

/** `true` for every class that is not `unseen`. */
export function isExposed(exposure: ExposureClass): boolean {
  return exposureStrength[exposure] > exposureStrength.unseen;
}

/** The exposure vocabulary, re-exported from the domain so no second copy can drift. */
export const recordedExposureClasses = exposureClasses;

/* ------------------------------------------------------------------------------------------------
 * The freshness/independence table (`Architecture/09-…` §7.2)
 * ---------------------------------------------------------------------------------------------- */

/** The nine rows of the freshness/independence table, in table order. */
export const freshnessUses = [
  "initial_learning_attempt",
  "immediate_retry",
  "same_item_review",
  "delayed_transfer",
  "retention_check",
  "mini_or_section_mock",
  "full_mock",
  "booking_confirmation",
  "defect_replacement",
] as const;
export type FreshnessUse = (typeof freshnessUses)[number];

export const exhaustionBehaviours = [
  "choose_another_eligible_family_or_declare_unavailable",
  "labelled_exposed_practice",
  "continue_review_or_defer",
  "defer_independent_claim",
  "broaden_or_postpone",
  "rebuild_form_or_declare_unavailable",
  "do_not_reuse_exposed_form",
  "await_evidence_and_prioritise_inventory",
  "postpone_affected_task",
] as const;
export type ExhaustionBehaviour = (typeof exhaustionBehaviours)[number];

export interface FreshnessRequest {
  readonly use: FreshnessUse;
  readonly candidateFamilyId: ContentFamilyId;
  /** The exposure already recorded for the candidate family, for this learner scope. */
  readonly candidateExposure: ExposureClass;
  /** Whether the family assignment permits an independence claim at all. */
  readonly candidateIndependenceEligible: boolean;
  /** Families excluded for this use: qualifying mock, prior confirmation, learning/repair history. */
  readonly excludedFamilyIds: readonly ContentFamilyId[];
  /** Whether another eligible family exists if this one is refused. */
  readonly eligibleAlternativeAvailable: boolean;
  /** An intentional review of an exposed family, declared up front rather than discovered after. */
  readonly declaredAsReview: boolean;
  readonly approvalLevel: ContentApprovalLevel;
  /** Mock rows require an exact frozen eligible form. */
  readonly formFrozenAndEligible?: boolean;
  /** Defect replacement: `true` when only byte delivery changed and nothing was newly revealed. */
  readonly onlyByteDeliveryChanged?: boolean;
}

export interface FreshnessOutcome {
  readonly decision: FreshnessDecision;
  /** The occasion class this use may claim, or `null` when no independent occasion may be claimed. */
  readonly independenceClass: IndependenceClass | null;
  /** `true` when the serving is teaching/repetition and must be labelled as such. */
  readonly labelledAsRepetition: boolean;
  /**
   * Necessary, never sufficient. A direct claim still depends on the recorded conditions and
   * assistance for the attempt, which class and approval never override.
   */
  readonly directClaimPermitted: boolean;
  readonly exhaustionBehaviour: ExhaustionBehaviour;
  readonly reasonCode?: ReasonCode;
}

/**
 * A full mock and a booking confirmation use Readiness/P4-approved content only. A mini/section mock
 * measures a narrower scope and may also use Independent-B1 content — but never Training content,
 * whose gates do not include verified target mapping.
 */
const measurementApprovalLevels: Readonly<
  Record<"narrow" | "target", ReadonlySet<ContentApprovalLevel>>
> = {
  narrow: new Set<ContentApprovalLevel>(["independent_b1", "readiness_p4"]),
  target: new Set<ContentApprovalLevel>(["readiness_p4"]),
};

function unavailable(
  exhaustionBehaviour: ExhaustionBehaviour,
  reasonCode: ReasonCode,
): FreshnessOutcome {
  return {
    decision: "unavailable",
    independenceClass: null,
    labelledAsRepetition: false,
    directClaimPermitted: false,
    exhaustionBehaviour,
    reasonCode,
  };
}

function measurement(request: FreshnessRequest, use: FreshnessUse): FreshnessOutcome {
  const exhaustion: ExhaustionBehaviour =
    use === "full_mock"
      ? "do_not_reuse_exposed_form"
      : use === "booking_confirmation"
        ? "await_evidence_and_prioritise_inventory"
        : "rebuild_form_or_declare_unavailable";
  if (request.formFrozenAndEligible !== true) {
    return unavailable(exhaustion, "FALLBACK.CONTENT_UNAVAILABLE");
  }
  const permitted =
    use === "mini_or_section_mock"
      ? measurementApprovalLevels.narrow
      : measurementApprovalLevels.target;
  if (!permitted.has(request.approvalLevel)) {
    return unavailable(exhaustion, "VALIDITY.CONTENT_APPROVAL");
  }
  if (isExposed(request.candidateExposure) || isExcluded(request)) {
    // A measurement never falls back to exposed practice: it reports honest unavailability instead.
    return unavailable(exhaustion, "FALLBACK.NO_ELIGIBLE_FAMILY");
  }
  if (!request.candidateIndependenceEligible) {
    return unavailable(exhaustion, "FALLBACK.NO_ELIGIBLE_FAMILY");
  }
  return {
    decision: "fresh",
    independenceClass: "mock_measurement",
    labelledAsRepetition: false,
    directClaimPermitted: true,
    exhaustionBehaviour: exhaustion,
  };
}

function isExcluded(request: FreshnessRequest): boolean {
  return request.excludedFamilyIds.includes(request.candidateFamilyId);
}

/**
 * The freshness/independence table of `Architecture/09-…` §7.2 as a decision.
 *
 * The asymmetry the table encodes, and this function preserves: teaching uses may deliberately
 * serve an exposed family and must then label it repetition, while measuring uses may not — they
 * report honest unavailability rather than letting exposed practice masquerade as a fresh claim.
 */
export function decideFreshness(request: FreshnessRequest): FreshnessOutcome {
  const exposed = isExposed(request.candidateExposure);
  const excluded = isExcluded(request);

  switch (request.use) {
    case "initial_learning_attempt": {
      if (excluded || (exposed && !request.declaredAsReview)) {
        return request.eligibleAlternativeAvailable
          ? {
              decision: "not_independent",
              independenceClass: null,
              labelledAsRepetition: false,
              directClaimPermitted: false,
              exhaustionBehaviour: "choose_another_eligible_family_or_declare_unavailable",
              reasonCode: "DIRECT.EXPOSED_FAMILY_PRACTICE",
            }
          : unavailable(
              "choose_another_eligible_family_or_declare_unavailable",
              "FALLBACK.NO_ELIGIBLE_FAMILY",
            );
      }
      if (exposed) {
        return {
          decision: "exposed_review",
          independenceClass: "repeated_exposed_practice",
          labelledAsRepetition: true,
          directClaimPermitted: false,
          exhaustionBehaviour: "labelled_exposed_practice",
          reasonCode: "DIRECT.EXPOSED_FAMILY_PRACTICE",
        };
      }
      return {
        decision: "fresh",
        independenceClass: "first_attempt",
        labelledAsRepetition: false,
        directClaimPermitted: request.candidateIndependenceEligible,
        exhaustionBehaviour: "choose_another_eligible_family_or_declare_unavailable",
      };
    }

    case "immediate_retry": {
      if (exposed || excluded) {
        // Exposed practice is allowed here, but it is labelled and can never pass as transfer.
        return {
          decision: "exposed_review",
          independenceClass: "repeated_exposed_practice",
          labelledAsRepetition: true,
          directClaimPermitted: false,
          exhaustionBehaviour: "labelled_exposed_practice",
          reasonCode: "DIRECT.EXPOSED_FAMILY_PRACTICE",
        };
      }
      return {
        decision: "fresh",
        independenceClass: "immediate_retry",
        labelledAsRepetition: false,
        directClaimPermitted: request.candidateIndependenceEligible,
        exhaustionBehaviour: "labelled_exposed_practice",
      };
    }

    case "same_item_review":
      // The same family is explicitly allowed and the serving is teaching only.
      return {
        decision: "exposed_review",
        independenceClass: "repeated_exposed_practice",
        labelledAsRepetition: true,
        directClaimPermitted: false,
        exhaustionBehaviour: "continue_review_or_defer",
        reasonCode: "DIRECT.EXPOSED_FAMILY_PRACTICE",
      };

    case "delayed_transfer": {
      if (request.candidateExposure === "near_duplicate_family") {
        // A near-duplicate is never a transfer check, whatever else is available.
        return {
          decision: "not_independent",
          independenceClass: null,
          labelledAsRepetition: false,
          directClaimPermitted: false,
          exhaustionBehaviour: "defer_independent_claim",
          reasonCode: "DIRECT.EXPOSED_FAMILY_PRACTICE",
        };
      }
      if (exposed || excluded || !request.candidateIndependenceEligible) {
        return {
          decision: "not_independent",
          independenceClass: null,
          labelledAsRepetition: false,
          directClaimPermitted: false,
          exhaustionBehaviour: "defer_independent_claim",
          reasonCode: exposed ? "DIRECT.EXPOSED_FAMILY_PRACTICE" : "FALLBACK.NO_ELIGIBLE_FAMILY",
        };
      }
      return {
        decision: "fresh",
        independenceClass: "delayed_transfer",
        labelledAsRepetition: false,
        directClaimPermitted: true,
        exhaustionBehaviour: "defer_independent_claim",
      };
    }

    case "retention_check": {
      if (exposed || excluded || !request.candidateIndependenceEligible) {
        return {
          decision: "not_independent",
          independenceClass: null,
          labelledAsRepetition: false,
          directClaimPermitted: false,
          exhaustionBehaviour: "broaden_or_postpone",
          reasonCode: exposed ? "DIRECT.EXPOSED_FAMILY_PRACTICE" : "FALLBACK.NO_ELIGIBLE_FAMILY",
        };
      }
      return {
        decision: "fresh",
        independenceClass: "retention_check",
        labelledAsRepetition: false,
        directClaimPermitted: true,
        exhaustionBehaviour: "broaden_or_postpone",
      };
    }

    case "mini_or_section_mock":
    case "full_mock":
    case "booking_confirmation":
      return measurement(request, request.use);

    case "defect_replacement": {
      // Only byte delivery changed and nothing was revealed: the same family is a fair replacement.
      if (request.onlyByteDeliveryChanged === true && !exposed) {
        return {
          decision: "fresh",
          independenceClass: "first_attempt",
          labelledAsRepetition: false,
          directClaimPermitted: request.candidateIndependenceEligible,
          exhaustionBehaviour: "postpone_affected_task",
        };
      }
      if (exposed || excluded || !request.candidateIndependenceEligible) {
        return request.eligibleAlternativeAvailable
          ? {
              decision: "not_independent",
              independenceClass: null,
              labelledAsRepetition: false,
              directClaimPermitted: false,
              exhaustionBehaviour: "postpone_affected_task",
              reasonCode: "DIRECT.EXPOSED_FAMILY_PRACTICE",
            }
          : unavailable("postpone_affected_task", "FALLBACK.NO_ELIGIBLE_FAMILY");
      }
      // A replacement is a fair new opportunity, never negative retry history.
      return {
        decision: "fresh",
        independenceClass: "first_attempt",
        labelledAsRepetition: false,
        directClaimPermitted: true,
        exhaustionBehaviour: "postpone_affected_task",
      };
    }
  }
}

/**
 * The occasion class a use may claim, or `null` when none may be. It is the independence half of
 * {@link decideFreshness}, exposed separately because the evidence owner needs it without the
 * serving decision around it.
 */
export function classifyIndependence(request: FreshnessRequest): IndependenceClass | null {
  return decideFreshness(request).independenceClass;
}

/**
 * Coverage counts eligible **independent families**, never raw items. Shared questions on one
 * stimulus are one correlated cluster and contribute one family, however many items they carry.
 */
export function countEligibleIndependentFamilies(
  candidates: readonly {
    readonly contentFamilyId: ContentFamilyId;
    readonly exposure: ExposureClass;
    readonly independenceEligible: boolean;
  }[],
): number {
  const eligible = new Set<string>();
  for (const candidate of candidates) {
    if (!candidate.independenceEligible || isExposed(candidate.exposure)) continue;
    eligible.add(candidate.contentFamilyId);
  }
  return eligible.size;
}
