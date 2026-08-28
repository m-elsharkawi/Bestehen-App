/**
 * The rights and attribution envelope of `Architecture/09-…` §8.2, and action-level evaluation.
 *
 * Rights answer exactly one question: *may this action be performed on this component right now?*
 * They never grant correctness, target fit, freshness or readiness, and nothing in this module
 * returns any of those. Authenticity and QA confidence are recorded in their own field group and are
 * deliberately never collapsed into permission.
 *
 * Mixed components resolve to **least permission**: a composite is only as permitted as its most
 * restrictive part. A mixed envelope never inherits the most permissive status.
 */

import type { AppId, ContentRightsState } from "@bestehen/domain";

/* ------------------------------------------------------------------------------------------------
 * Vocabulary
 * ---------------------------------------------------------------------------------------------- */

export const rightsActions = [
  "display",
  "reproduce",
  "adapt",
  "generate_from",
  "cache",
  "download_offline",
  "transform_transcode",
] as const;
export type RightsAction = (typeof rightsActions)[number];

export const rightsEligibilities = [
  "prohibited",
  "unknown_review_required",
  "reference_only",
  "allowed_with_conditions",
  "allowed",
] as const;
export type RightsEligibility = (typeof rightsEligibilities)[number];

/**
 * Permission order, least first. `unknown_review_required` sits above `prohibited` because it is
 * recoverable by review, and below `reference_only` because nothing may be done with the component
 * until that review happens — an unreviewed component is not a usable one.
 */
export const rightsPermissionOrder: Readonly<Record<RightsEligibility, number>> = {
  prohibited: 0,
  unknown_review_required: 1,
  reference_only: 2,
  allowed_with_conditions: 3,
  allowed: 4,
};

/** The more restrictive of two eligibilities. */
export function leastPermission(
  left: RightsEligibility,
  right: RightsEligibility,
): RightsEligibility {
  return rightsPermissionOrder[left] <= rightsPermissionOrder[right] ? left : right;
}

export const rightsComponentKinds = [
  "text",
  "image",
  "audio",
  "transcript",
  "option",
  "composite",
] as const;
export type RightsComponentKind = (typeof rightsComponentKinds)[number];

export const authenticityConfidences = ["unverified", "local_review", "documented_source"] as const;
export type AuthenticityConfidence = (typeof authenticityConfidences)[number];

export const rightsConditionKinds = [
  "no_derivatives",
  "placement",
  "modification_notice",
  "expiry",
  "attribution",
  "share_alike",
  "other_obligation",
] as const;
export type RightsConditionKind = (typeof rightsConditionKinds)[number];

/**
 * An exact obligation attached to one or more actions. An **unresolved** condition denies its
 * actions outright: an obligation nobody can currently satisfy is not a warning, it is a denial.
 */
export interface RightsCondition {
  readonly conditionId: string;
  readonly kind: RightsConditionKind;
  readonly appliesToActions: readonly RightsAction[];
  readonly resolved: boolean;
  readonly obligation: string;
  /** ISO instant after which the condition can no longer be satisfied, when one is recorded. */
  readonly expiresAt?: string;
}

/* ------------------------------------------------------------------------------------------------
 * The envelope — the eight field groups of `Architecture/09-…` §8.2
 * ---------------------------------------------------------------------------------------------- */

/** Group 1 — identity and currentness. */
export interface RightsIdentity {
  readonly rightsEnvelopeId: AppId<"rights_envelope">;
  readonly revision: number;
  readonly sourceRef: string | null;
  readonly sourceComponentRevision: string | null;
  readonly state: ContentRightsState;
  readonly effectiveFrom: string;
  readonly effectiveUntil?: string;
}

/** Group 2 — separate trust. Never collapsed into permission. */
export interface RightsSeparateTrust {
  readonly authenticityConfidence: AuthenticityConfidence;
  readonly qaReferences: readonly string[];
}

/** Group 3 — action eligibility, plus territory and audience limits. */
export interface RightsActionEligibility {
  readonly actions: Readonly<Partial<Record<RightsAction, RightsEligibility>>>;
  readonly territoryLimit: readonly string[] | null;
  readonly audienceLimit: readonly string[] | null;
}

/** Group 5 — exact credit. */
export interface RightsExactCredit {
  readonly attributionRequired: boolean;
  readonly authorOrRightsholder: string;
  readonly titleOrSource: string | null;
  readonly requiredLink: string | null;
  readonly licenceIdentifier: string;
  readonly licenceNoticeText: string | null;
  readonly modificationNotice: string | null;
  readonly placementRule: string | null;
}

/** Group 6 — component scope. */
export interface RightsComponentScope {
  readonly componentRef: string;
  readonly componentKind: RightsComponentKind;
}

/** Group 7 — provenance. */
export interface RightsProvenance {
  readonly corpusBundleRef: string | null;
  readonly rightsDecisionRef: string | null;
  readonly sourceRevisionRef: string | null;
  /** Non-reconstructive grounding manifest for original content. */
  readonly groundingManifest: string;
  readonly note: string;
}

/** Group 8 — incident and disposition. */
export interface RightsIncidentDisposition {
  readonly reason: string;
  readonly purgeOrTombstoneConstraint: string;
  readonly successorRef: string | null;
  readonly affectedArtifactSelectors: readonly string[];
  readonly reviewOwner: string;
}

export interface RightsEnvelope {
  readonly identity: RightsIdentity;
  readonly separateTrust: RightsSeparateTrust;
  readonly actionEligibility: RightsActionEligibility;
  /** Group 4 — conditions. */
  readonly conditions: readonly RightsCondition[];
  readonly exactCredit: RightsExactCredit;
  readonly componentScope: RightsComponentScope;
  readonly provenance: RightsProvenance;
  readonly incidentDisposition: RightsIncidentDisposition | null;
}

/* ------------------------------------------------------------------------------------------------
 * Evaluation
 * ---------------------------------------------------------------------------------------------- */

export interface RightsEvaluationContext {
  /** When the action would happen. Omitted means "evaluate the envelope's time-independent facts". */
  readonly at?: Date;
}

function isPast(instant: string | undefined, at: Date | undefined): boolean {
  if (instant === undefined || at === undefined) return false;
  const parsed = Date.parse(instant);
  return Number.isFinite(parsed) && parsed <= at.getTime();
}

function isFuture(instant: string | undefined, at: Date | undefined): boolean {
  if (instant === undefined || at === undefined) return false;
  const parsed = Date.parse(instant);
  return Number.isFinite(parsed) && parsed > at.getTime();
}

function evaluateSingle(
  envelope: RightsEnvelope,
  action: RightsAction,
  context: RightsEvaluationContext,
): RightsEligibility {
  const { state } = envelope.identity;

  // Withdrawal and takedown stop serving immediately. Neither says anything about the validity of
  // evidence already recorded — that is the evidence ledger's decision, not a rights decision.
  if (state === "withdrawn" || state === "takedown") return "prohibited";

  // A superseded envelope no longer states current permission; it states a former one.
  if (state === "superseded") return "unknown_review_required";

  if (
    isFuture(envelope.identity.effectiveFrom, context.at) ||
    isPast(envelope.identity.effectiveUntil, context.at)
  ) {
    return "unknown_review_required";
  }

  // A missing entry is not a permission. Fail closed to review.
  let eligibility: RightsEligibility =
    envelope.actionEligibility.actions[action] ?? "unknown_review_required";

  for (const condition of envelope.conditions) {
    if (!condition.appliesToActions.includes(action)) continue;
    if (!condition.resolved || isPast(condition.expiresAt, context.at)) return "prohibited";
    // A satisfiable obligation still has to be rendered, so the action is conditional at best.
    eligibility = leastPermission(eligibility, "allowed_with_conditions");
  }

  // A territory or audience limit is an obligation to enforce, not a free pass.
  if (
    envelope.actionEligibility.territoryLimit !== null ||
    envelope.actionEligibility.audienceLimit !== null
  ) {
    eligibility = leastPermission(eligibility, "allowed_with_conditions");
  }

  return eligibility;
}

/**
 * Evaluates one action against one envelope, or against a set of component envelopes that make up a
 * composite. A set resolves to least permission across every component; an empty set is
 * `unknown_review_required`, because "no envelope" is not "no restriction".
 *
 * The answer is a rights answer only. It does not imply the content is correct, current, fresh,
 * target-appropriate or approved for any evidence role — those are separate gates with separate
 * owners, and no combination of rights values grants any of them.
 */
export function evaluateAction(
  envelope: RightsEnvelope | readonly RightsEnvelope[],
  action: RightsAction,
  context: RightsEvaluationContext = {},
): RightsEligibility {
  const envelopes: readonly RightsEnvelope[] = Array.isArray(envelope)
    ? (envelope as readonly RightsEnvelope[])
    : [envelope as RightsEnvelope];
  if (envelopes.length === 0) return "unknown_review_required";
  return envelopes.reduce<RightsEligibility>(
    (resolved, component) => leastPermission(resolved, evaluateSingle(component, action, context)),
    "allowed",
  );
}

/**
 * Whether the envelope stops new serving. Withdrawal and takedown do; they change nothing about
 * evidence already recorded under the content, whose validity is decided elsewhere.
 */
export function blocksServing(envelope: RightsEnvelope): boolean {
  const state = envelope.identity.state;
  return state === "withdrawn" || state === "takedown";
}

/* ------------------------------------------------------------------------------------------------
 * Attribution rendering
 * ---------------------------------------------------------------------------------------------- */

export interface RenderedAttribution {
  readonly required: boolean;
  readonly text: string;
  readonly link: string | null;
  readonly placementRule: string | null;
  readonly modificationNotice: string | null;
}

/**
 * The exact credit to render for a component. Original App content is labelled Bestehen practice;
 * hidden inspiration is never turned into a false learner-facing attribution, and no rendering here
 * may imply a TELC or provider endorsement.
 */
export function renderAttribution(envelope: RightsEnvelope): RenderedAttribution {
  const credit = envelope.exactCredit;
  const title = credit.titleOrSource === null ? "" : ` — ${credit.titleOrSource}`;
  return {
    required: credit.attributionRequired,
    text: `${credit.authorOrRightsholder}${title}`,
    link: credit.requiredLink,
    placementRule: credit.placementRule,
    modificationNotice: credit.modificationNotice,
  };
}

/**
 * Whether every obligation that applies to the action can actually be rendered. If a required
 * attribution has no text to show, the condition is not satisfiable and the action must not be
 * taken — original App content is used instead.
 */
export function attributionRenderable(envelope: RightsEnvelope, action: RightsAction): boolean {
  const attributionRequired = envelope.conditions.some(
    (condition) => condition.kind === "attribution" && condition.appliesToActions.includes(action),
  );
  if (!attributionRequired && !envelope.exactCredit.attributionRequired) return true;
  return envelope.exactCredit.authorOrRightsholder.trim().length > 0;
}
