/**
 * The objective key, decisive-evidence, distractor, cause and repair contract
 * (`Architecture/15-…` §5.4).
 *
 * **Everything in this module is server-only.** None of it is reachable from a `TaskFamily`, which
 * is the only thing a learner-safe payload carries, and none of it may be serialized into one.
 * Three independent mechanisms enforce that, because any one of them alone is a single point of
 * failure:
 *
 * 1. *Separation.* Key material lives in its own relation and its own module. A learner payload is
 *    a closed union of safe content nodes that cannot structurally contain any type declared here.
 * 2. *Type level.* {@link ObjectiveKeyRevision} carries a phantom server-only brand that only
 *    {@link sealObjectiveKeyRevision} can produce, so a key cannot be conjured from a plain object
 *    literal in a client module.
 * 3. *Runtime.* {@link findKeyBearingFields} walks a value about to cross the serving boundary and
 *    names every key-bearing field by JSON pointer, in both camelCase and snake_case, so a raw
 *    database row is caught as readily as a mapped object. This is half of `P05-SECURITY-001`.
 *
 * The client never receives a key, so client-side scoring is impossible rather than discouraged.
 */

import type {
  AppId,
  ContentFamilyId,
  ContentItemId,
  ContentRevisionId,
  ExposureClass,
  KeyRevisionId,
} from "@bestehen/domain";

/* ------------------------------------------------------------------------------------------------
 * The server-only brand
 * ---------------------------------------------------------------------------------------------- */

declare const serverOnlyKeyMaterial: unique symbol;

/**
 * A phantom property that exists only in the type system. It is a `unique symbol`, so it is never
 * an own enumerable string key and can never be serialized — its job is to make a key material type
 * unforgeable outside this module, not to travel with the value.
 */
export interface ServerOnlyKeyMaterial {
  readonly [serverOnlyKeyMaterial]: "server_only";
}

/* ------------------------------------------------------------------------------------------------
 * Decisive evidence
 * ---------------------------------------------------------------------------------------------- */

export const decisiveEvidenceRelationKinds = [
  "whole_text_gist",
  "direct_span",
  "cross_sentence_relation",
  "constraint_set",
  "cloze_context",
  "candidate_bank_constraint",
] as const;
export type DecisiveEvidenceRelationKind = (typeof decisiveEvidenceRelationKinds)[number];

/**
 * Why the correct response is correct. R1 may cite whole-text communicative purpose rather than a
 * span; R3 cites the complete must-have constraint set. The span is never revealed before
 * finalization when revealing it would leak the answer, which is why the learner payload carries
 * only the anchor identity.
 */
export interface DecisiveEvidenceRef {
  readonly stimulusId: string;
  readonly anchorId: string;
  readonly safeRevealSpanOrRelation: string;
  readonly relationKind: DecisiveEvidenceRelationKind;
}

/* ------------------------------------------------------------------------------------------------
 * Distractor rationale
 * ---------------------------------------------------------------------------------------------- */

export const distractorFailureFamilies = [
  "surface_word_match",
  "partial_constraint_match",
  "plausible_but_unsupported",
  "opposite_polarity",
  "wrong_referent",
  "register_or_collocation_mismatch",
  "grammatical_form_mismatch",
] as const;
export type DistractorFailureFamily = (typeof distractorFailureFamilies)[number];

/** Why a wrong option is attractive and where it decisively fails. Authored, never inferred. */
export interface DistractorRationale {
  readonly optionOrCandidateId: string;
  readonly whyPlausible: string;
  readonly decisiveMismatch: string;
  readonly failureFamily: DistractorFailureFamily;
  /** The smallest safe feedback that explains the failure without revealing another item's key. */
  readonly minimumSafeFeedbackKey: string;
}

/* ------------------------------------------------------------------------------------------------
 * The key revision
 * ---------------------------------------------------------------------------------------------- */

/**
 * An accepted response, expressed entirely by semantic identity. There is no positional form, so
 * "the second option" is not sayable and reordering options cannot change the keyed meaning.
 */
export type AcceptedResponse =
  | { readonly kind: "option"; readonly optionId: string }
  | { readonly kind: "match"; readonly leftId: string; readonly rightId: string }
  | { readonly kind: "no_match"; readonly leftId: string }
  | { readonly kind: "candidate"; readonly gapId: string; readonly candidateId: string };

export const independentValidationMethods = ["blind_solve", "blind_solve_with_rationale"] as const;
export type IndependentValidationMethod = (typeof independentValidationMethods)[number];

/**
 * The independent validator solves blind to the proposed key. Generator output cannot validate its
 * own key, and one person holding several duties in a personal project still records author,
 * validator method and result distinctly.
 */
export interface IndependentValidatorResult {
  readonly validatorRef: string;
  readonly method: IndependentValidationMethod;
  readonly agreedWithProposedKey: boolean;
  readonly recordedAt: string;
}

export interface IntendedCauseMapping {
  readonly optionOrCandidateId: string;
  readonly causeRef: string;
}

export interface KeyTargetAndContentLineage {
  readonly contentRevisionId: ContentRevisionId;
  readonly targetBlueprintRelease: string;
  readonly taxonomyRelease: string;
}

/** The immutable objective judgment contract for exactly one scorable item. */
export interface ObjectiveKeyRevision extends ServerOnlyKeyMaterial {
  readonly keyRevisionId: KeyRevisionId;
  readonly itemId: ContentItemId;
  readonly acceptedResponseSet: readonly AcceptedResponse[];
  readonly responseCardinality: { readonly min: number; readonly max: number };
  readonly scoringPolicyRef: string;
  readonly decisiveEvidenceRefs: readonly DecisiveEvidenceRef[];
  readonly correctRationale: string;
  readonly distractorRationales: readonly DistractorRationale[];
  readonly intendedCauseMappings: readonly IntendedCauseMapping[];
  readonly independentValidatorResult: IndependentValidatorResult;
  readonly targetAndContentLineage: KeyTargetAndContentLineage;
  readonly approvalDecisionId: AppId<"approval_decision">;
}

/** The only way to obtain an {@link ObjectiveKeyRevision}. Server modules only. */
export function sealObjectiveKeyRevision(
  input: Omit<ObjectiveKeyRevision, typeof serverOnlyKeyMaterial>,
): ObjectiveKeyRevision {
  return input as ObjectiveKeyRevision;
}

/* ------------------------------------------------------------------------------------------------
 * Cause and repair
 * ---------------------------------------------------------------------------------------------- */

export const causeConfidences = ["high", "moderate", "low"] as const;
export type CauseConfidence = (typeof causeConfidences)[number];

/**
 * If a cause cannot be isolated the runtime returns `unresolved` with exactly **one** smallest
 * clarifier — `smallestClarifier` is deliberately singular, so one ambiguous item can never be
 * turned into several weaknesses.
 */
export type CauseAssessment =
  | {
      readonly kind: "supported";
      readonly primaryCause: string;
      readonly contributor?: string;
      readonly confidence: CauseConfidence;
      readonly evidenceRefs: readonly DecisiveEvidenceRef[];
    }
  | {
      readonly kind: "unresolved";
      readonly candidateCauses: readonly string[];
      readonly smallestClarifier: string;
    }
  | { readonly kind: "not_applicable" };

export const repairRetryRequirements = ["fresh_equivalent", "deferred_transfer", "none"] as const;
export type RepairRetryRequirement = (typeof repairRetryRequirements)[number];

export interface ExposureEffect {
  readonly contentFamilyId: ContentFamilyId;
  readonly exposureClass: ExposureClass;
}

export interface RepairPlan {
  readonly causeRef: string;
  readonly reviewedExplanationKey: string;
  readonly decisiveEvidenceRefs: readonly DecisiveEvidenceRef[];
  readonly controlledActions: readonly string[];
  readonly maxDurationPolicyRef: string;
  readonly retryRequirement: RepairRetryRequirement;
  readonly exposureEffects: readonly ExposureEffect[];
}

/* ------------------------------------------------------------------------------------------------
 * Validation (`P05-KEY-001`)
 * ---------------------------------------------------------------------------------------------- */

export const keyDefectCodes = [
  "empty_accepted_response_set",
  "cardinality_mismatch",
  "duplicate_accepted_response",
  "position_used_as_identity",
  "unknown_response_identity",
  "missing_decisive_evidence",
  "missing_distractor_rationale",
  "cause_mapping_without_rationale",
  "blind_validator_disagreement",
] as const;
export type KeyDefectCode = (typeof keyDefectCodes)[number];

export interface KeyDefect {
  readonly code: KeyDefectCode;
  readonly detail: string;
  /**
   * `true` when the defect is a hard gate on an artifact that may already be published. Restoration
   * from quarantine then needs new evidence and an explicit decision; it is never automatic.
   */
  readonly requiresQuarantine: boolean;
}

/** Bare ordinals and single letters are presentation, never identity. */
const positionalIdentityPattern = /^(?:\d+|[A-Za-z])$/;

/** The semantic identity an accepted response selects, for duplicate and membership checks. */
export function acceptedResponseIdentity(response: AcceptedResponse): string {
  switch (response.kind) {
    case "option":
      return `option:${response.optionId}`;
    case "match":
      return `match:${response.leftId}->${response.rightId}`;
    case "no_match":
      return `match:${response.leftId}->no_match`;
    case "candidate":
      return `candidate:${response.gapId}<-${response.candidateId}`;
  }
}

function selectedIdentifiers(response: AcceptedResponse): readonly string[] {
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
}

export interface KeyValidationContext {
  /**
   * Every identity the learner could choose for this item — option ids, candidate ids or right-hand
   * ids. Anything accepted that is not offered is a binding defect, not a scoring nuance.
   */
  readonly offeredResponseIdentifiers: readonly string[];
}

/**
 * The structural and independent-validation checks of `Architecture/09-…` §5.3 gates 4 and 5, as a
 * pure function. It answers only whether the key is internally sound: it says nothing about target
 * fit, difficulty or naturalness, which are separate gates with separate reviewers.
 */
export function validateObjectiveKeyRevision(
  key: ObjectiveKeyRevision,
  context: KeyValidationContext,
): readonly KeyDefect[] {
  const defects: KeyDefect[] = [];
  const offered = new Set(context.offeredResponseIdentifiers);

  if (key.acceptedResponseSet.length === 0) {
    defects.push({
      code: "empty_accepted_response_set",
      detail: "An objective key accepts at least one response.",
      requiresQuarantine: false,
    });
  }
  const { min, max } = key.responseCardinality;
  if (key.acceptedResponseSet.length < min || key.acceptedResponseSet.length > max) {
    defects.push({
      code: "cardinality_mismatch",
      detail: `Accepted ${key.acceptedResponseSet.length} responses against a cardinality of ${min}-${max}.`,
      requiresQuarantine: false,
    });
  }

  const seen = new Set<string>();
  for (const response of key.acceptedResponseSet) {
    const identity = acceptedResponseIdentity(response);
    if (seen.has(identity)) {
      defects.push({
        code: "duplicate_accepted_response",
        detail: `\`${identity}\` is accepted twice.`,
        requiresQuarantine: false,
      });
    }
    seen.add(identity);
    for (const identifier of selectedIdentifiers(response)) {
      if (positionalIdentityPattern.test(identifier)) {
        defects.push({
          code: "position_used_as_identity",
          detail: `\`${identifier}\` reads as a position; responses bind by semantic identity only.`,
          requiresQuarantine: true,
        });
      } else if (!offered.has(identifier)) {
        defects.push({
          code: "unknown_response_identity",
          detail: `\`${identifier}\` is accepted but never offered to the learner.`,
          requiresQuarantine: true,
        });
      }
    }
  }

  if (key.decisiveEvidenceRefs.length === 0) {
    defects.push({
      code: "missing_decisive_evidence",
      detail: "Every key states why the correct response is decisively correct.",
      requiresQuarantine: false,
    });
  }

  const rationaleTargets = new Set(
    key.distractorRationales.map((rationale) => rationale.optionOrCandidateId),
  );
  const acceptedIdentifiers = new Set(key.acceptedResponseSet.flatMap(selectedIdentifiers));
  for (const identifier of context.offeredResponseIdentifiers) {
    if (acceptedIdentifiers.has(identifier)) continue;
    if (!rationaleTargets.has(identifier)) {
      defects.push({
        code: "missing_distractor_rationale",
        detail: `\`${identifier}\` is a distractor with no authored rationale.`,
        requiresQuarantine: false,
      });
    }
  }

  for (const mapping of key.intendedCauseMappings) {
    if (acceptedIdentifiers.has(mapping.optionOrCandidateId)) continue;
    if (!rationaleTargets.has(mapping.optionOrCandidateId)) {
      defects.push({
        code: "cause_mapping_without_rationale",
        detail: `\`${mapping.optionOrCandidateId}\` maps to a cause with no distractor rationale.`,
        requiresQuarantine: false,
      });
    }
  }

  if (!key.independentValidatorResult.agreedWithProposedKey) {
    defects.push({
      code: "blind_validator_disagreement",
      detail: "The independent blind validator disagreed with the proposed key.",
      requiresQuarantine: true,
    });
  }

  return defects;
}

/** Whether any defect is a hard gate that quarantines rather than merely blocking publication. */
export function requiresQuarantine(defects: readonly KeyDefect[]): boolean {
  return defects.some((defect) => defect.requiresQuarantine);
}

/* ------------------------------------------------------------------------------------------------
 * Runtime leak detection
 * ---------------------------------------------------------------------------------------------- */

function toSnakeCase(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Field names that carry, or directly reveal, key material. A learner-safe payload containing any
 * of them is a defect regardless of how it got there. Digest-only carriers such as
 * `keyRevisionDigests` are deliberately absent: a digest reveals nothing and is the only key-derived
 * fact a serving lease may hold.
 */
export const keyBearingFieldNames: readonly string[] = (() => {
  const camelCase = [
    "acceptedResponseSet",
    "answerKey",
    "causeAssessment",
    "correctRationale",
    "decisiveEvidenceRefs",
    "decisiveMismatch",
    "distractorRationales",
    "failureFamily",
    "independentValidatorResult",
    "intendedCauseMappings",
    "isCorrect",
    "keyRevisionId",
    "keyRevisionIds",
    "minimumSafeFeedbackKey",
    "operatorNote",
    "primaryCause",
    "repairPlan",
    "restrictedSourceUrl",
    "reviewedExplanationKey",
    "rubricRevisionId",
    "safeRevealSpanOrRelation",
    "scoringWeight",
    "unpublishedTargetMapping",
    "whyPlausible",
  ];
  const extras = ["correct", "key", "rubric"];
  return [...new Set([...camelCase, ...camelCase.map(toSnakeCase), ...extras])].sort();
})();

const keyBearingFieldNameSet: ReadonlySet<string> = new Set(keyBearingFieldNames);

/** Guards against unbounded recursion on a cyclic or adversarial value. */
const maxLeakScanDepth = 32;

/**
 * Walks a value that is about to cross the serving boundary and returns a JSON pointer for every
 * key-bearing field it finds. An empty result is the only acceptable outcome for a learner payload.
 */
export function findKeyBearingFields(value: unknown): readonly string[] {
  const pointers: string[] = [];
  const seen = new WeakSet<object>();
  const walk = (node: unknown, pointer: string, depth: number): void => {
    if (depth > maxLeakScanDepth || typeof node !== "object" || node === null) return;
    if (seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      node.forEach((entry, index) => {
        walk(entry, `${pointer}/${index}`, depth + 1);
      });
      return;
    }
    for (const [name, entry] of Object.entries(node)) {
      const childPointer = `${pointer}/${name}`;
      if (keyBearingFieldNameSet.has(name)) pointers.push(childPointer);
      walk(entry, childPointer, depth + 1);
    }
  };
  walk(value, "", 0);
  return pointers;
}

/**
 * Fails loudly rather than stripping. Stripping a leaked key would hide the defect that produced it,
 * and a hidden key-leak defect is worse than a failed request.
 */
export function assertNoKeyBearingFields(value: unknown, label: string): void {
  const pointers = findKeyBearingFields(value);
  if (pointers.length > 0) {
    throw new Error(`${label} carries key-bearing fields: ${pointers.join(", ")}`);
  }
}
