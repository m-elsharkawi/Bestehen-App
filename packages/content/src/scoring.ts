/**
 * Canonical response operations and deterministic objective scoring (decision **D10**;
 * `Architecture/15-…` §5.3 and §5.5).
 *
 * **Everything in this module is pure.** No clock, no random source, no database handle, no network
 * client, no learner history, no coaching priority, no latest-key lookup and no model call. The same
 * canonical response, against the same pinned keys, under the same pinned policy and algorithm
 * version, produces a byte-identical outcome and a byte-identical checksum, always. Two consequences
 * of that are deliberate and visible in the types:
 *
 * - There is **no `scoredAt`**. The architecture's `OriginalObjectiveOutcome` records one, but a
 *   clock is not an input to a pure function. The transaction that appends the outcome records the
 *   instant alongside this value.
 * - There is **no `outcomeId`**. Identity is minted by the writer, not by the calculation.
 *
 * Three distinctions this module refuses to blur:
 *
 * 1. **`blank` is not absence.** A learner who deliberately left a captured item empty produced
 *    `blank`, and the pinned policy may assign it no point. A response the system never captured —
 *    an unsubmitted checkpoint, an interrupted activity, a lost response, a technical failure — is
 *    *absence*: it never becomes a `UnitOutcome` at all, and travels out as `uncapturedScope` for
 *    the evidence owner to classify as `not_counted`/`interrupted`. Conflating the two would convert
 *    a system fault into a learner penalty.
 * 2. **`structurally_invalid` is never learner failure.** It is a system/content state awaiting
 *    interpretation. It never routes to `incorrect` and never enters a raw-accuracy denominator.
 * 3. **Correctness is not validity.** This module produces an outcome and nothing else. Validity is
 *    classified separately by `classifyInitialValidity` in `@bestehen/application`, which takes the
 *    scopes exported here and never takes correctness.
 */

import {
  type AttemptId,
  type ContentItemId,
  type KeyRevisionId,
  type ServingManifestId,
  type SubmissionId,
  type Result,
  objectiveUnitOutcomeKinds,
} from "@bestehen/domain";
import { canonicalDigest } from "./digest.js";
import { type AcceptedResponse, acceptedResponseIdentity } from "./keys.js";
import type { ItemBinding, ResponseKind } from "./model.js";

/* ------------------------------------------------------------------------------------------------
 * Canonical response operations (`Architecture/15-…` §5.3)
 * ---------------------------------------------------------------------------------------------- */

/**
 * The right-hand sentinel meaning "this prompt is deliberately left unmatched". It is a reserved
 * identity rather than a separate operation kind, exactly as `responseOperationSchema` in
 * `@bestehen/contracts` — which owns the wire form of this union — expresses it.
 */
export const noMatchRightId = "no_match";

export type ResponseOperation =
  | { readonly kind: "set_selection"; readonly itemId: string; readonly optionId: string }
  | { readonly kind: "clear_selection"; readonly itemId: string }
  | {
      readonly kind: "set_match";
      readonly itemId: string;
      readonly leftId: string;
      readonly rightId: string;
    }
  | { readonly kind: "clear_match"; readonly itemId: string; readonly leftId: string }
  | {
      readonly kind: "place_candidate";
      readonly itemId: string;
      readonly gapId: string;
      readonly candidateId: string;
    }
  | { readonly kind: "remove_candidate"; readonly itemId: string; readonly gapId: string }
  | {
      readonly kind: "move_candidate";
      readonly itemId: string;
      readonly fromGapId: string;
      readonly toGapId: string;
    }
  | { readonly kind: "confirm_boundary"; readonly boundaryId: string };

export interface CanonicalMatch {
  readonly leftId: string;
  /** A right-hand identity, or {@link noMatchRightId} for a deliberate no-match. */
  readonly rightId: string;
}

export interface CanonicalPlacement {
  readonly itemId: string;
  readonly candidateId: string;
}

/**
 * The canonical response projection. Keys are sorted, so the same set of answers always serializes
 * to the same bytes whatever order the learner produced them in. Placements are keyed by **gap**
 * because a shared candidate bank is shared across gaps; the owning item travels with the value.
 */
export interface CanonicalResponse {
  readonly selections: Readonly<Record<string, string>>;
  readonly matches: Readonly<Record<string, CanonicalMatch>>;
  readonly placements: Readonly<Record<string, CanonicalPlacement>>;
  readonly confirmedBoundaries: readonly string[];
}

export const emptyCanonicalResponse: CanonicalResponse = {
  selections: {},
  matches: {},
  placements: {},
  confirmedBoundaries: [],
};

export const localValidationIssueCodes = [
  "clear_without_selection",
  "clear_match_not_set",
  "clear_match_left_mismatch",
  "remove_from_empty_gap",
  "move_from_empty_gap",
  "move_to_same_gap",
  "empty_identifier",
] as const;
export type LocalValidationIssueCode = (typeof localValidationIssueCodes)[number];

/**
 * A local validation issue. It records that an operation could not apply — it never discards work
 * and never becomes a learner outcome; the projection is returned unchanged alongside it.
 */
export interface LocalValidationIssue {
  readonly code: LocalValidationIssueCode;
  readonly operationIndex: number;
  readonly detail: string;
}

export interface ResponseOperationResult {
  readonly response: CanonicalResponse;
  readonly issue?: LocalValidationIssue;
}

function sortedRecord<Value>(
  entries: Readonly<Record<string, Value>>,
): Readonly<Record<string, Value>> {
  const sorted: Record<string, Value> = {};
  for (const key of Object.keys(entries).sort()) {
    const value = entries[key];
    if (value !== undefined) sorted[key] = value;
  }
  return sorted;
}

function withSelection(
  response: CanonicalResponse,
  itemId: string,
  optionId: string | null,
): CanonicalResponse {
  const selections: Record<string, string> = { ...response.selections };
  if (optionId === null) delete selections[itemId];
  else selections[itemId] = optionId;
  return { ...response, selections: sortedRecord(selections) };
}

function withMatch(
  response: CanonicalResponse,
  itemId: string,
  match: CanonicalMatch | null,
): CanonicalResponse {
  const matches: Record<string, CanonicalMatch> = { ...response.matches };
  if (match === null) delete matches[itemId];
  else matches[itemId] = match;
  return { ...response, matches: sortedRecord(matches) };
}

function withPlacements(
  response: CanonicalResponse,
  mutate: (placements: Record<string, CanonicalPlacement>) => void,
): CanonicalResponse {
  const placements: Record<string, CanonicalPlacement> = { ...response.placements };
  mutate(placements);
  return { ...response, placements: sortedRecord(placements) };
}

function issue(
  code: LocalValidationIssueCode,
  operationIndex: number,
  detail: string,
): LocalValidationIssue {
  return { code, operationIndex, detail };
}

/**
 * Applies exactly one canonical operation. Every input path — pointer, drag, keyboard
 * select-then-place, number key, screen-reader activation, switch input — reaches this function with
 * the same operation, so all of them produce the same projection and therefore the same score. DOM
 * order, option order and focus movement never appear here.
 */
export function applyResponseOperation(
  response: CanonicalResponse,
  operation: ResponseOperation,
  operationIndex = 0,
): ResponseOperationResult {
  switch (operation.kind) {
    case "set_selection": {
      if (operation.optionId === "") {
        return {
          response,
          issue: issue("empty_identifier", operationIndex, "An option identity is never empty."),
        };
      }
      return { response: withSelection(response, operation.itemId, operation.optionId) };
    }
    case "clear_selection": {
      if (!Object.hasOwn(response.selections, operation.itemId)) {
        return {
          response,
          issue: issue(
            "clear_without_selection",
            operationIndex,
            `\`${operation.itemId}\` has no selection to clear.`,
          ),
        };
      }
      return { response: withSelection(response, operation.itemId, null) };
    }
    case "set_match": {
      if (operation.leftId === "" || operation.rightId === "") {
        return {
          response,
          issue: issue("empty_identifier", operationIndex, "A match identity is never empty."),
        };
      }
      return {
        response: withMatch(response, operation.itemId, {
          leftId: operation.leftId,
          rightId: operation.rightId,
        }),
      };
    }
    case "clear_match": {
      const existing = response.matches[operation.itemId];
      if (!existing) {
        return {
          response,
          issue: issue(
            "clear_match_not_set",
            operationIndex,
            `\`${operation.itemId}\` has no match to clear.`,
          ),
        };
      }
      if (existing.leftId !== operation.leftId) {
        return {
          response,
          issue: issue(
            "clear_match_left_mismatch",
            operationIndex,
            `\`${operation.itemId}\` matches \`${existing.leftId}\`, not \`${operation.leftId}\`.`,
          ),
        };
      }
      return { response: withMatch(response, operation.itemId, null) };
    }
    case "place_candidate": {
      if (operation.gapId === "" || operation.candidateId === "") {
        return {
          response,
          issue: issue("empty_identifier", operationIndex, "A placement identity is never empty."),
        };
      }
      return {
        response: withPlacements(response, (placements) => {
          placements[operation.gapId] = {
            itemId: operation.itemId,
            candidateId: operation.candidateId,
          };
        }),
      };
    }
    case "remove_candidate": {
      if (!Object.hasOwn(response.placements, operation.gapId)) {
        return {
          response,
          issue: issue(
            "remove_from_empty_gap",
            operationIndex,
            `\`${operation.gapId}\` holds no candidate to remove.`,
          ),
        };
      }
      return {
        response: withPlacements(response, (placements) => {
          delete placements[operation.gapId];
        }),
      };
    }
    case "move_candidate": {
      if (operation.fromGapId === operation.toGapId) {
        return {
          response,
          issue: issue(
            "move_to_same_gap",
            operationIndex,
            "A move between one gap and itself changes nothing.",
          ),
        };
      }
      const moving = response.placements[operation.fromGapId];
      if (!moving) {
        return {
          response,
          issue: issue(
            "move_from_empty_gap",
            operationIndex,
            `\`${operation.fromGapId}\` holds no candidate to move.`,
          ),
        };
      }
      return {
        response: withPlacements(response, (placements) => {
          delete placements[operation.fromGapId];
          placements[operation.toGapId] = {
            itemId: operation.itemId,
            candidateId: moving.candidateId,
          };
        }),
      };
    }
    case "confirm_boundary": {
      if (response.confirmedBoundaries.includes(operation.boundaryId)) return { response };
      return {
        response: {
          ...response,
          confirmedBoundaries: [...response.confirmedBoundaries, operation.boundaryId].sort(),
        },
      };
    }
  }
}

export interface CanonicalizationResult {
  readonly response: CanonicalResponse;
  readonly issues: readonly LocalValidationIssue[];
}

/**
 * Folds an ordered operation log into the canonical response projection. This is the
 * `canonical_response_projection` of `WorkingResponse`: the log is mutable recoverable work, and
 * only the projection taken at submission time is immutable evidence.
 */
export function canonicalizeResponse(
  operations: readonly ResponseOperation[],
  base: CanonicalResponse = emptyCanonicalResponse,
): CanonicalizationResult {
  let response = base;
  const issues: LocalValidationIssue[] = [];
  operations.forEach((operation, index) => {
    const applied = applyResponseOperation(response, operation, index);
    response = applied.response;
    if (applied.issue) issues.push(applied.issue);
  });
  return { response, issues };
}

/** The canonical hash of a response projection, over `canonical-json/v1`. */
export function canonicalResponseDigest(response: CanonicalResponse): string {
  return canonicalDigest(response);
}

/* ------------------------------------------------------------------------------------------------
 * Completeness
 * ---------------------------------------------------------------------------------------------- */

/** What one scorable unit expects, without any key material. */
export interface ResponseExpectation {
  readonly itemId: ContentItemId;
  readonly binding: ItemBinding;
  readonly responseKind: ResponseKind;
}

/**
 * Which captured units carry a response and which are deliberately empty. `blankItemIds` means
 * *empty in a captured response*; it is never a claim about units the system failed to capture,
 * which are `uncapturedItemIds` and are excluded from both counts.
 */
export interface CompletenessProjection {
  readonly expectedUnits: number;
  readonly capturedUnits: number;
  readonly answeredItemIds: readonly string[];
  readonly blankItemIds: readonly string[];
  readonly uncapturedItemIds: readonly string[];
  /** Every captured unit carries a response. An uncaptured unit never makes a response complete. */
  readonly complete: boolean;
}

function respondedIdentity(
  response: CanonicalResponse,
  expectation: ResponseExpectation,
): AcceptedResponse | null {
  switch (expectation.binding.kind) {
    case "select": {
      const optionId = response.selections[expectation.itemId];
      return optionId === undefined ? null : { kind: "option", optionId };
    }
    case "match": {
      const match = response.matches[expectation.itemId];
      if (!match || match.leftId !== expectation.binding.leftId) return null;
      return match.rightId === noMatchRightId
        ? { kind: "no_match", leftId: match.leftId }
        : { kind: "match", leftId: match.leftId, rightId: match.rightId };
    }
    case "gap": {
      const gapId = expectation.binding.gapId;
      const placement = response.placements[gapId];
      return placement === undefined
        ? null
        : { kind: "candidate", gapId, candidateId: placement.candidateId };
    }
  }
}

/**
 * The completeness projection of `WorkingResponse`. It is presentation and submission guidance only:
 * it never scores, and it never turns an uncaptured unit into a blank one.
 */
export function completenessProjection(
  response: CanonicalResponse,
  expectations: readonly ResponseExpectation[],
  uncapturedItemIds: readonly ContentItemId[] = [],
): CompletenessProjection {
  const uncaptured = new Set<string>(uncapturedItemIds);
  const answered: string[] = [];
  const blank: string[] = [];
  for (const expectation of expectations) {
    if (uncaptured.has(expectation.itemId)) continue;
    if (respondedIdentity(response, expectation) === null) blank.push(expectation.itemId);
    else answered.push(expectation.itemId);
  }
  return {
    expectedUnits: expectations.length,
    capturedUnits: answered.length + blank.length,
    answeredItemIds: [...answered].sort(),
    blankItemIds: [...blank].sort(),
    uncapturedItemIds: [...new Set<string>(uncapturedItemIds)].sort(),
    complete: blank.length === 0,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Deterministic scoring (`Architecture/15-…` §5.5)
 * ---------------------------------------------------------------------------------------------- */

export const structuralIssueCodes = [
  "key_missing_for_item",
  "key_item_mismatch",
  "key_cardinality_incompatible",
  "key_accepts_nothing",
  "response_identity_not_offered",
  "candidate_reused_against_policy",
  "match_left_mismatch",
] as const;
export type StructuralIssueCode = (typeof structuralIssueCodes)[number];

export type UnitOutcome =
  | {
      readonly kind: "correct";
      readonly itemId: ContentItemId;
      readonly canonicalResponse: AcceptedResponse;
      readonly keyRevisionId: KeyRevisionId;
    }
  | {
      readonly kind: "incorrect";
      readonly itemId: ContentItemId;
      readonly canonicalResponse: AcceptedResponse;
      readonly keyRevisionId: KeyRevisionId;
    }
  | {
      readonly kind: "blank";
      readonly itemId: ContentItemId;
      readonly keyRevisionId: KeyRevisionId;
    }
  | {
      readonly kind: "structurally_invalid";
      readonly itemId: ContentItemId;
      readonly issueCode: StructuralIssueCode;
    };

/**
 * Whether a unit outcome describes what the learner did, or what the system/content did.
 * `structurally_invalid` is the only `system_or_content` value and is never learner failure.
 */
export function unitOutcomeAttribution(
  kind: UnitOutcome["kind"],
): "learner_response" | "system_or_content" {
  return kind === "structurally_invalid" ? "system_or_content" : "learner_response";
}

export interface TaskRollup {
  readonly taskRef: string;
  /** Correct plus incorrect plus blank. Structurally invalid and uncaptured units are excluded. */
  readonly scoredUnits: number;
  readonly correctUnits: number;
  readonly incorrectUnits: number;
  readonly blankUnits: number;
  readonly structurallyInvalidUnits: number;
  readonly rawPoints: number;
  /** `null`, never `0`, when nothing is scorable: a missing measurement is not a zero measurement. */
  readonly rawAccuracy: number | null;
}

/**
 * Points per unit kind. Negative marking is not permitted: a wrong answer costs the point it did not
 * earn and nothing more, and a deliberate blank may simply earn no point.
 */
export interface ScoringPolicy {
  readonly scoringPolicyRef: string;
  readonly pointsPerCorrectUnit: number;
  readonly pointsPerIncorrectUnit: number;
  readonly pointsPerBlankUnit: number;
  readonly officialConversion: OfficialConversionRule | null;
}

export interface OfficialConversionRule {
  readonly targetBlueprintRelease: string;
  readonly officialPointsPerCorrectUnit: number;
  readonly maximumOfficialPoints: number;
}

export interface RawOfficialConversion {
  readonly targetBlueprintRelease: string;
  readonly officialPoints: number;
  readonly maximumOfficialPoints: number;
}

/**
 * Everything the conversion eligibility of `Architecture/15-…` §5.5 rule 5 depends on. All three
 * must line up: a P0-P3 microtask never displays pseudo-official points, and neither does an
 * artifact that merely *looks* like a mock.
 */
export interface OfficialRoleContext {
  readonly progressionProfile: string;
  readonly approvalLevel: string;
  readonly evidenceRole: string;
  /** The approval must be the artifact's current one; a lapsed approval converts nothing. */
  readonly approvalIsCurrent: boolean;
}

const officialEvidenceRoles: ReadonlySet<string> = new Set([
  "mini_mock",
  "section_mock",
  "full_mock",
  "booking_confirmation",
]);

/** Only an approved, current P4/mock role converts raw units into official points. */
export function isOfficialConversionEligible(context: OfficialRoleContext | null): boolean {
  if (context === null) return false;
  return (
    context.approvalIsCurrent &&
    context.progressionProfile === "P4" &&
    context.approvalLevel === "readiness_p4" &&
    officialEvidenceRoles.has(context.evidenceRole)
  );
}

/** One scorable unit as the scorer sees it. No key material and no presentation ordering. */
export interface ScoredUnitDescriptor {
  readonly itemId: ContentItemId;
  readonly binding: ItemBinding;
  readonly responseKind: ResponseKind;
  readonly responseCardinality: { readonly min: number; readonly max: number };
  readonly keyRevisionId: KeyRevisionId;
  /** The task the unit rolls up into — the group raw accuracy is computed over. */
  readonly taskRef: string;
  /** Identities the learner was offered. A response outside it is structural, never wrong. */
  readonly offeredIdentifiers: readonly string[];
}

export interface ObjectiveSubmission {
  readonly submissionId: SubmissionId;
  readonly attemptId: AttemptId;
  readonly servingManifestId: ServingManifestId;
  readonly formAndKeyVersions: {
    readonly formRevisionId: string | null;
    readonly contentReleaseIdentity: string;
    readonly keyRevisionIds: readonly KeyRevisionId[];
  };
  readonly units: readonly ScoredUnitDescriptor[];
  readonly canonicalResponse: CanonicalResponse;
  /**
   * Units whose response the system failed to capture. They are **absence**, not blank: they produce
   * no `UnitOutcome`, enter no denominator, and leave through `uncapturedScope` for the evidence
   * owner to classify. Never populate this with a deliberate empty answer.
   */
  readonly uncapturedItemIds: readonly ContentItemId[];
  /** The shared-bank reuse policy in force, when the submission contains bank placements. */
  readonly candidateReusePolicy?: "at_most_once" | "unrestricted";
  readonly officialRoleContext: OfficialRoleContext | null;
}

export interface OriginalObjectiveOutcome {
  readonly submissionId: SubmissionId;
  readonly attemptId: AttemptId;
  readonly algorithmVersion: string;
  readonly scoringPolicyRef: string;
  readonly formAndKeyVersions: ObjectiveSubmission["formAndKeyVersions"];
  readonly unitOutcomes: readonly UnitOutcome[];
  readonly taskRollups: readonly TaskRollup[];
  /** Present only for an approved current P4/mock role. Absent everywhere else. */
  readonly rawOfficialConversion?: RawOfficialConversion;
  /** Every unit this outcome speaks for. The supported scope handed to validity classification. */
  readonly supportedScope: readonly string[];
  /** Units awaiting interpretation. Never learner failure. */
  readonly structurallyInvalidScope: readonly string[];
  /** Units the system failed to capture. Absence, never blank. */
  readonly uncapturedScope: readonly string[];
  /** Replay checksum over every field above, for byte-stable re-scoring. */
  readonly checksum: string;
}

export const scoringRejections = [
  "algorithm_version_required",
  "duplicate_unit",
  "negative_marking_not_permitted",
  "no_scorable_unit",
] as const;
export type ScoringRejection = (typeof scoringRejections)[number];

function keyAcceptedIdentities(key: PinnedKey): readonly string[] {
  return key.acceptedResponseSet.map(acceptedResponseIdentity);
}

/**
 * The exact pinned key material the scorer compares against. It is deliberately a narrow structural
 * subset of `ObjectiveKeyRevision`: the scorer needs the accepted set, the cardinality and the
 * policy reference, and has no business reading a rationale.
 */
export interface PinnedKey {
  readonly keyRevisionId: KeyRevisionId;
  readonly itemId: ContentItemId;
  readonly acceptedResponseSet: readonly AcceptedResponse[];
  readonly responseCardinality: { readonly min: number; readonly max: number };
  readonly scoringPolicyRef: string;
}

function structuralOutcome(itemId: ContentItemId, issueCode: StructuralIssueCode): UnitOutcome {
  return { kind: "structurally_invalid", itemId, issueCode };
}

function reusedCandidateGapIds(
  response: CanonicalResponse,
  policy: ObjectiveSubmission["candidateReusePolicy"],
): ReadonlySet<string> {
  if (policy !== "at_most_once") return new Set<string>();
  const gapsByCandidate = new Map<string, string[]>();
  for (const [gapId, placement] of Object.entries(response.placements)) {
    const gaps = gapsByCandidate.get(placement.candidateId) ?? [];
    gaps.push(gapId);
    gapsByCandidate.set(placement.candidateId, gaps);
  }
  const reused = new Set<string>();
  for (const gaps of gapsByCandidate.values()) {
    if (gaps.length > 1) for (const gapId of gaps) reused.add(gapId);
  }
  return reused;
}

function scoreUnit(
  unit: ScoredUnitDescriptor,
  key: PinnedKey | undefined,
  response: CanonicalResponse,
  reusedGapIds: ReadonlySet<string>,
): UnitOutcome {
  if (!key) return structuralOutcome(unit.itemId, "key_missing_for_item");
  if (key.itemId !== unit.itemId) return structuralOutcome(unit.itemId, "key_item_mismatch");
  if (key.acceptedResponseSet.length === 0) {
    return structuralOutcome(unit.itemId, "key_accepts_nothing");
  }
  if (
    key.responseCardinality.min !== unit.responseCardinality.min ||
    key.responseCardinality.max !== unit.responseCardinality.max
  ) {
    return structuralOutcome(unit.itemId, "key_cardinality_incompatible");
  }
  if (unit.binding.kind === "gap" && reusedGapIds.has(unit.binding.gapId)) {
    return structuralOutcome(unit.itemId, "candidate_reused_against_policy");
  }

  const expectation: ResponseExpectation = {
    itemId: unit.itemId,
    binding: unit.binding,
    responseKind: unit.responseKind,
  };
  // A match recorded against the wrong left-hand prompt is a structural fault, not a wrong answer:
  // the item binds one prompt, so a mismatch means the capture, not the learner, went wrong.
  if (unit.binding.kind === "match") {
    const match = response.matches[unit.itemId];
    if (match && match.leftId !== unit.binding.leftId) {
      return structuralOutcome(unit.itemId, "match_left_mismatch");
    }
  }
  const responded = respondedIdentity(response, expectation);
  if (responded === null) {
    return { kind: "blank", itemId: unit.itemId, keyRevisionId: unit.keyRevisionId };
  }

  const chosen = chosenIdentifier(responded);
  if (chosen !== null && !unit.offeredIdentifiers.includes(chosen)) {
    return structuralOutcome(unit.itemId, "response_identity_not_offered");
  }

  const accepted = new Set(keyAcceptedIdentities(key));
  const kind = accepted.has(acceptedResponseIdentity(responded)) ? "correct" : "incorrect";
  return {
    kind,
    itemId: unit.itemId,
    canonicalResponse: responded,
    keyRevisionId: unit.keyRevisionId,
  };
}

function chosenIdentifier(response: AcceptedResponse): string | null {
  switch (response.kind) {
    case "option":
      return response.optionId;
    case "match":
      return response.rightId;
    case "no_match":
      return null;
    case "candidate":
      return response.candidateId;
  }
}

function rollUp(
  units: readonly ScoredUnitDescriptor[],
  outcomes: readonly UnitOutcome[],
  policy: ScoringPolicy,
): readonly TaskRollup[] {
  const taskByItem = new Map(units.map((unit) => [unit.itemId, unit.taskRef]));
  const buckets = new Map<
    string,
    { correct: number; incorrect: number; blank: number; invalid: number }
  >();
  for (const taskRef of new Set(units.map((unit) => unit.taskRef))) {
    buckets.set(taskRef, { correct: 0, incorrect: 0, blank: 0, invalid: 0 });
  }
  for (const outcome of outcomes) {
    const taskRef = taskByItem.get(outcome.itemId);
    if (taskRef === undefined) continue;
    const bucket = buckets.get(taskRef);
    if (!bucket) continue;
    if (outcome.kind === "correct") bucket.correct += 1;
    else if (outcome.kind === "incorrect") bucket.incorrect += 1;
    else if (outcome.kind === "blank") bucket.blank += 1;
    else bucket.invalid += 1;
  }
  return [...buckets.entries()]
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([taskRef, bucket]) => {
      const scoredUnits = bucket.correct + bucket.incorrect + bucket.blank;
      return {
        taskRef,
        scoredUnits,
        correctUnits: bucket.correct,
        incorrectUnits: bucket.incorrect,
        blankUnits: bucket.blank,
        structurallyInvalidUnits: bucket.invalid,
        rawPoints:
          bucket.correct * policy.pointsPerCorrectUnit +
          bucket.incorrect * policy.pointsPerIncorrectUnit +
          bucket.blank * policy.pointsPerBlankUnit,
        rawAccuracy: scoredUnits === 0 ? null : bucket.correct / scoredUnits,
      };
    });
}

/**
 * Deterministic objective scoring (**D10**).
 *
 * Order of operations follows `Architecture/15-…` §5.5 exactly: validate identities, cardinality,
 * candidate reuse and key compatibility first; then compare the canonical response to the exact
 * accepted set by semantic identity — never by position; then roll up raw accuracy; and compute the
 * official conversion only for an approved current P4/mock role.
 *
 * A per-unit problem produces a per-unit `structurally_invalid` outcome rather than rejecting the
 * whole submission, because discarding a whole submission over one broken key would throw away the
 * learner's valid work. The rejections are reserved for caller errors that make the *whole*
 * calculation meaningless.
 */
export function scoreObjectiveSubmission(
  submission: ObjectiveSubmission,
  pinnedKeys: readonly PinnedKey[],
  scoringPolicy: ScoringPolicy,
  algorithmVersion: string,
): Result<OriginalObjectiveOutcome, ScoringRejection> {
  if (algorithmVersion.trim() === "") return { ok: false, error: "algorithm_version_required" };
  if (submission.units.length === 0) return { ok: false, error: "no_scorable_unit" };
  if (
    scoringPolicy.pointsPerCorrectUnit < 0 ||
    scoringPolicy.pointsPerIncorrectUnit < 0 ||
    scoringPolicy.pointsPerBlankUnit < 0
  ) {
    return { ok: false, error: "negative_marking_not_permitted" };
  }
  const itemIds = submission.units.map((unit) => unit.itemId);
  if (new Set(itemIds).size !== itemIds.length) return { ok: false, error: "duplicate_unit" };

  const uncaptured = new Set<string>(submission.uncapturedItemIds);
  const keysByItem = new Map<string, PinnedKey>();
  for (const key of pinnedKeys) keysByItem.set(key.itemId, key);
  const reusedGapIds = reusedCandidateGapIds(
    submission.canonicalResponse,
    submission.candidateReusePolicy,
  );

  const scored = submission.units.filter((unit) => !uncaptured.has(unit.itemId));
  const unitOutcomes = scored.map((unit) =>
    scoreUnit(unit, keysByItem.get(unit.itemId), submission.canonicalResponse, reusedGapIds),
  );
  const taskRollups = rollUp(scored, unitOutcomes, scoringPolicy);

  const correctUnits = unitOutcomes.filter((outcome) => outcome.kind === "correct").length;
  const conversionRule = scoringPolicy.officialConversion;
  const converts =
    conversionRule !== null && isOfficialConversionEligible(submission.officialRoleContext);
  const rawOfficialConversion: RawOfficialConversion | undefined =
    converts && conversionRule !== null
      ? {
          targetBlueprintRelease: conversionRule.targetBlueprintRelease,
          officialPoints: Math.min(
            correctUnits * conversionRule.officialPointsPerCorrectUnit,
            conversionRule.maximumOfficialPoints,
          ),
          maximumOfficialPoints: conversionRule.maximumOfficialPoints,
        }
      : undefined;

  const body = {
    submissionId: submission.submissionId,
    attemptId: submission.attemptId,
    algorithmVersion,
    scoringPolicyRef: scoringPolicy.scoringPolicyRef,
    formAndKeyVersions: submission.formAndKeyVersions,
    unitOutcomes,
    taskRollups,
    ...(rawOfficialConversion === undefined ? {} : { rawOfficialConversion }),
    supportedScope: scored.map((unit) => unit.itemId).sort(),
    structurallyInvalidScope: unitOutcomes
      .filter((outcome) => outcome.kind === "structurally_invalid")
      .map((outcome) => outcome.itemId)
      .sort(),
    uncapturedScope: [...uncaptured].sort(),
  };

  return { ok: true, value: { ...body, checksum: canonicalDigest(body) } };
}

/**
 * The four unit outcome kinds, re-exported from the domain so a caller cannot accidentally build a
 * fifth. `objectiveUnitOutcomeKinds` is the single definition; this module only scores into it.
 */
export const scoredUnitOutcomeKinds = objectiveUnitOutcomeKinds;
