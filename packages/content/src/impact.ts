/**
 * The content impact assertion of `Architecture/06-…` §10.1 and the selector scope rules of §10.3.
 *
 * An impact assertion is an **append-only fact**: it never mutates the content, the original
 * attempt, the submitted response or a prior validity assertion. Four properties this module exists
 * to enforce, each of which has been an audit failure somewhere before:
 *
 * 1. **Declared cardinality is a contract, not a hint.** A selector states the exact count or the
 *    reviewed bound it expects. An empty, unexpected or excess resolution **stops publication and
 *    raises an incident** (`Architecture/06-…` §10.3 rule 2). It is never silently adjusted to
 *    whatever the query happened to return.
 * 2. **Rights and correctness stay separate.** A rights takedown defaults to `serving_only` and
 *    changes no validity. Changing validity on a rights cause requires an explicit reviewed policy
 *    reference, and its absence is a defect rather than an inference.
 * 3. **Unknown scope quarantines the smallest defensible superset**, never the whole learner by
 *    convenience — and it must say which superset and why.
 * 4. **Unaffected projections stay untouched.** Recompute rebuilds only projection kinds that
 *    declare a dependency on the changed axis, and {@link verifyRecomputeScope} proves that 100% of
 *    the selected set changed and 0% of the unaffected set did before a generation is published.
 *
 * Pure throughout. Resolution itself is a database operation owned by the durable job; this module
 * owns the *contract* that resolution is checked against.
 */

import {
  type EvidenceObservationId,
  type EvidenceValidityState,
  type ImpactAssertionId,
  type ImpactCauseKind,
  type ImpactMode,
  type LearnerScopeId,
  type ReasonCode,
  type ScopePartition,
  validateValidityPartition,
} from "@bestehen/domain";
import { canonicalizationVersion } from "./digest.js";

/* ------------------------------------------------------------------------------------------------
 * Selectors
 * ---------------------------------------------------------------------------------------------- */

/** The version axes a selector may address. Each maps to a projection dependency declaration. */
export const impactAxes = [
  "observation",
  "content_revision",
  "content_family",
  "content_form",
  "media_revision",
  "evaluator_release",
  "rubric_or_prompt",
  "blueprint_release",
  "taxonomy_release",
  "claim_dimension",
] as const;
export type ImpactAxis = (typeof impactAxes)[number];

export interface SourceCutBound {
  readonly fromInstant: string;
  readonly toInstant: string;
}

/**
 * `Architecture/06-…` §10.3 rule 1: start from exact observation IDs when they are known; otherwise
 * use immutable version indexes plus claim dimensions. A selector with neither has no basis at all.
 */
export interface ImpactSelectors {
  readonly observationIds?: readonly EvidenceObservationId[];
  readonly contentRevisionIds?: readonly string[];
  readonly contentFamilyIds?: readonly string[];
  readonly contentFormIds?: readonly string[];
  readonly mediaRevisionIds?: readonly string[];
  readonly evaluatorRelease?: string;
  readonly rubricOrPromptRef?: string;
  readonly blueprintRelease?: string;
  readonly taxonomyRelease?: string;
  readonly claimDimensions: readonly string[];
  /** Explicit learner bounds. `"incident_scope"` means every scope named by the incident, no wider. */
  readonly learnerScopeBound: readonly LearnerScopeId[] | "incident_scope";
  readonly sourceCutBound: SourceCutBound | null;
}

export type SelectorBasis = "exact_observation_ids" | "version_index" | "none";

/** Which basis a selector actually has. `none` is a defect, never a licence to select broadly. */
export function selectorBasis(selectors: ImpactSelectors): SelectorBasis {
  if ((selectors.observationIds?.length ?? 0) > 0) return "exact_observation_ids";
  const indexed =
    (selectors.contentRevisionIds?.length ?? 0) > 0 ||
    (selectors.contentFamilyIds?.length ?? 0) > 0 ||
    (selectors.contentFormIds?.length ?? 0) > 0 ||
    (selectors.mediaRevisionIds?.length ?? 0) > 0 ||
    selectors.evaluatorRelease !== undefined ||
    selectors.rubricOrPromptRef !== undefined ||
    selectors.blueprintRelease !== undefined ||
    selectors.taxonomyRelease !== undefined;
  return indexed && selectors.claimDimensions.length > 0 ? "version_index" : "none";
}

/** Every axis a selector actually addresses, for the projection dependency filter of §10.3 rule 4. */
export function changedAxes(selectors: ImpactSelectors): readonly ImpactAxis[] {
  const axes: ImpactAxis[] = [];
  if ((selectors.observationIds?.length ?? 0) > 0) axes.push("observation");
  if ((selectors.contentRevisionIds?.length ?? 0) > 0) axes.push("content_revision");
  if ((selectors.contentFamilyIds?.length ?? 0) > 0) axes.push("content_family");
  if ((selectors.contentFormIds?.length ?? 0) > 0) axes.push("content_form");
  if ((selectors.mediaRevisionIds?.length ?? 0) > 0) axes.push("media_revision");
  if (selectors.evaluatorRelease !== undefined) axes.push("evaluator_release");
  if (selectors.rubricOrPromptRef !== undefined) axes.push("rubric_or_prompt");
  if (selectors.blueprintRelease !== undefined) axes.push("blueprint_release");
  if (selectors.taxonomyRelease !== undefined) axes.push("taxonomy_release");
  if (selectors.claimDimensions.length > 0) axes.push("claim_dimension");
  return axes;
}

/* ------------------------------------------------------------------------------------------------
 * The assertion
 * ---------------------------------------------------------------------------------------------- */

/**
 * The expected size of a resolution. `exact` is the strong form; `reviewed_bound` is the form for a
 * scope that genuinely cannot be counted ahead of time and has been reviewed as a bound. There is no
 * "unbounded" form: an unbounded selector is exactly what §10.3 rule 2 forbids.
 */
export type DeclaredCardinality =
  | { readonly kind: "exact"; readonly count: number }
  | {
      readonly kind: "reviewed_bound";
      readonly minimum: number;
      readonly maximum: number;
      readonly reviewRef: string;
    };

/**
 * A superset quarantined because the exact scope is unknown. Both fields are required: a superset
 * with no justification is the "whole learner by convenience" the architecture forbids.
 */
export interface UnknownScopeSuperset {
  readonly supersetRef: string;
  readonly justification: string;
  /** `true` only when the superset genuinely is every observation in the learner scope. */
  readonly coversEntireLearnerScope: boolean;
}

export interface ImpactActor {
  readonly actorRef: string;
  readonly authorizationVersion: string;
}

export interface ImpactPolicyVersions {
  readonly contentReleaseIdentity: string;
  readonly reasonRegistryRelease: string;
  readonly canonicalizationVersion: string;
}

export interface ImpactAssertion {
  readonly impactAssertionId: ImpactAssertionId;
  readonly incidentId: string;
  /** The bounded context that discovered and validated the incident. */
  readonly ownerContext: string;
  readonly actorAndAuthorization: ImpactActor;
  readonly causeKind: ImpactCauseKind;
  readonly selectors: ImpactSelectors;
  readonly declaredCardinality: DeclaredCardinality;
  readonly impactMode: ImpactMode;
  /** `null` for a mode that does not change validity. Non-null on such a mode is a defect. */
  readonly requestedValidity: EvidenceValidityState | null;
  /** Disjoint and exhaustive over the prior claim scope. */
  readonly scope: ScopePartition;
  readonly reason: ReasonCode;
  readonly evidenceRefs: readonly string[];
  readonly effectiveAt: string;
  readonly recordedAt: string;
  readonly policyAndContractVersions: ImpactPolicyVersions;
  readonly unknownScopeSuperset?: UnknownScopeSuperset;
  /** The reviewed policy that permits a rights cause to change validity at all. */
  readonly reviewedPolicyOverrideRef?: string;
}

/** The default impact mode for a cause. A rights takedown defaults to serving only. */
export function defaultImpactModeForCause(cause: ImpactCauseKind): ImpactMode {
  switch (cause) {
    case "rights_takedown":
      return "serving_only";
    case "blueprint_change":
      return "target_mapping_change";
    case "taxonomy_change":
      return "target_mapping_change";
    case "evaluator_release":
    case "rubric_or_prompt_defect":
      return "reevaluation_required";
    case "content_defect":
    case "media_defect":
    case "timer_or_platform_fault":
    case "manual_correction":
      return "validity_change";
  }
}

/** Whether a mode may change a validity assertion at all. */
export function changesValidity(mode: ImpactMode): boolean {
  return (
    mode === "validity_change" ||
    mode === "reevaluation_required" ||
    mode === "target_mapping_change"
  );
}

/* ------------------------------------------------------------------------------------------------
 * Assertion validation
 * ---------------------------------------------------------------------------------------------- */

export const impactDefectCodes = [
  "selector_without_basis",
  "declared_cardinality_invalid",
  "validity_requested_on_non_validity_mode",
  "validity_change_without_requested_state",
  "rights_takedown_changes_validity_without_reviewed_policy",
  "scope_partition_invalid",
  "unknown_scope_superset_missing",
  "unknown_scope_superset_overbroad",
  "learner_scope_bound_missing",
  "reason_code_required",
  "canonicalization_version_mismatch",
] as const;
export type ImpactDefectCode = (typeof impactDefectCodes)[number];

export interface ImpactDefect {
  readonly code: ImpactDefectCode;
  readonly detail: string;
}

/**
 * `Architecture/06-…` §10.3 rule 3, applied unconditionally: the two halves are disjoint and
 * together cover the prior claim scope exactly. Returns `null` when the partition holds.
 */
function partitionDefectFor(
  partition: ScopePartition,
  priorClaimScope: readonly string[],
): string | null {
  const affected = new Set(partition.affected);
  const overlap = partition.unaffected.filter((entry) => affected.has(entry));
  if (overlap.length > 0) return `affected and unaffected overlap on [${overlap.sort().join(",")}]`;
  const covered = new Set([...partition.affected, ...partition.unaffected]);
  const prior = new Set(priorClaimScope);
  const missing = [...prior].filter((entry) => !covered.has(entry)).sort();
  const extra = [...covered].filter((entry) => !prior.has(entry)).sort();
  if (missing.length > 0 || extra.length > 0) {
    return `uncovered prior scope [${missing.join(",")}] and out-of-scope entries [${extra.join(",")}]`;
  }
  return null;
}

/**
 * Validates an assertion before anything is resolved or applied. `priorClaimScope` is the scope the
 * assertion is allowed to speak about; the affected/unaffected partition must be disjoint and cover
 * it exactly, which `validateValidityPartition` in `@bestehen/domain` decides — this module does not
 * own a second copy of that rule.
 */
export function validateImpactAssertion(
  assertion: ImpactAssertion,
  priorClaimScope: readonly string[],
): readonly ImpactDefect[] {
  const defects: ImpactDefect[] = [];
  const push = (code: ImpactDefectCode, detail: string): void => {
    defects.push({ code, detail });
  };

  if (selectorBasis(assertion.selectors) === "none") {
    push(
      "selector_without_basis",
      "A selector starts from exact observation IDs, or from immutable version indexes plus claim dimensions.",
    );
  }
  const cardinality = assertion.declaredCardinality;
  if (cardinality.kind === "exact") {
    if (!Number.isInteger(cardinality.count) || cardinality.count < 0) {
      push("declared_cardinality_invalid", `\`${cardinality.count}\` is not an expected count.`);
    }
  } else if (
    !Number.isInteger(cardinality.minimum) ||
    !Number.isInteger(cardinality.maximum) ||
    cardinality.minimum < 0 ||
    cardinality.maximum < cardinality.minimum ||
    cardinality.reviewRef.trim() === ""
  ) {
    push(
      "declared_cardinality_invalid",
      "A reviewed bound states an ordered non-negative range and the review that set it.",
    );
  }

  if (!changesValidity(assertion.impactMode) && assertion.requestedValidity !== null) {
    push(
      "validity_requested_on_non_validity_mode",
      `\`${assertion.impactMode}\` blocks serving or redacts bytes; it does not change validity.`,
    );
  }
  if (assertion.impactMode === "validity_change" && assertion.requestedValidity === null) {
    push(
      "validity_change_without_requested_state",
      "A validity change states the state it requests.",
    );
  }
  if (
    assertion.causeKind === "rights_takedown" &&
    changesValidity(assertion.impactMode) &&
    (assertion.reviewedPolicyOverrideRef ?? "").trim() === ""
  ) {
    push(
      "rights_takedown_changes_validity_without_reviewed_policy",
      "Rights and correctness are separate; only an explicit reviewed policy lets a takedown touch validity.",
    );
  }

  // §10.3 rule 3 is unconditional, so the disjoint/exhaustive check runs for every mode — including
  // `serving_only`, where the affected set is legitimately empty because no validity moves. When a
  // validity state *is* requested, the domain's own guard runs too, so its rule stays single-sourced.
  const partitionDefect = partitionDefectFor(assertion.scope, priorClaimScope);
  if (partitionDefect !== null) push("scope_partition_invalid", partitionDefect);
  else if (assertion.requestedValidity !== null) {
    const guarded = validateValidityPartition(
      assertion.requestedValidity,
      priorClaimScope,
      assertion.scope,
    );
    if (!guarded.ok) {
      push(
        "scope_partition_invalid",
        `The requested \`${assertion.requestedValidity}\` needs a partition the domain accepts: ${guarded.error}.`,
      );
    }
  }

  const superset = assertion.unknownScopeSuperset;
  if (superset !== undefined) {
    if (superset.supersetRef.trim() === "" || superset.justification.trim() === "") {
      push(
        "unknown_scope_superset_missing",
        "An unknown scope names the superset it quarantines and why that superset is the smallest defensible one.",
      );
    }
    if (superset.coversEntireLearnerScope && superset.justification.trim().length < 16) {
      push(
        "unknown_scope_superset_overbroad",
        "Quarantining an entire learner scope needs a stated defence, never convenience.",
      );
    }
  }

  if (
    assertion.selectors.learnerScopeBound !== "incident_scope" &&
    assertion.selectors.learnerScopeBound.length === 0
  ) {
    push("learner_scope_bound_missing", "A selector bounds the learner scopes it reaches.");
  }
  if (assertion.reason.trim() === "") {
    push("reason_code_required", "Every impact assertion records a registry reason code.");
  }
  if (assertion.policyAndContractVersions.canonicalizationVersion !== canonicalizationVersion) {
    push(
      "canonicalization_version_mismatch",
      `The assertion records \`${assertion.policyAndContractVersions.canonicalizationVersion}\`; this release canonicalizes with \`${canonicalizationVersion}\`.`,
    );
  }

  return defects;
}

/* ------------------------------------------------------------------------------------------------
 * Selector resolution and the cardinality contract (`Architecture/06-…` §10.3 rule 2)
 * ---------------------------------------------------------------------------------------------- */

export const selectorCardinalityFaults = [
  "empty_result",
  "under_declared",
  "excess_result",
] as const;
export type SelectorCardinalityFault = (typeof selectorCardinalityFaults)[number];

export type SelectorResolution =
  | {
      readonly status: "resolved";
      readonly observationIds: readonly EvidenceObservationId[];
      readonly resolvedCount: number;
    }
  | {
      readonly status: "cardinality_fault";
      readonly fault: SelectorCardinalityFault;
      readonly resolvedCount: number;
      readonly declared: DeclaredCardinality;
      /** Always `true`. Recorded on the value so a caller cannot treat the fault as advisory. */
      readonly stopsPublication: true;
      readonly incidentRequired: true;
      readonly detail: string;
    };

function describeDeclared(declared: DeclaredCardinality): string {
  return declared.kind === "exact"
    ? `exactly ${declared.count}`
    : `between ${declared.minimum} and ${declared.maximum}`;
}

/**
 * Checks a resolution against the declared cardinality.
 *
 * The resolved set is passed in because resolution itself is a database read owned by the durable
 * job; what must be *pure and testable* is the contract it is held to. An empty result is a fault
 * even when the declaration allowed a minimum of zero — an impact assertion that reaches nothing is
 * an assertion built on a wrong premise, and publishing it silently would hide the error.
 */
export function resolveSelectors(
  assertion: ImpactAssertion,
  resolved: readonly EvidenceObservationId[],
): SelectorResolution {
  const unique = [...new Set(resolved)].sort();
  const resolvedCount = unique.length;
  const declared = assertion.declaredCardinality;

  const fault = (faultKind: SelectorCardinalityFault, detail: string): SelectorResolution => ({
    status: "cardinality_fault",
    fault: faultKind,
    resolvedCount,
    declared,
    stopsPublication: true,
    incidentRequired: true,
    detail,
  });

  if (resolvedCount === 0) {
    return fault(
      "empty_result",
      `The selectors resolved nothing while declaring ${describeDeclared(declared)}.`,
    );
  }
  if (declared.kind === "exact") {
    if (resolvedCount < declared.count) {
      return fault(
        "under_declared",
        `Resolved ${resolvedCount} against a declared ${declared.count}.`,
      );
    }
    if (resolvedCount > declared.count) {
      return fault(
        "excess_result",
        `Resolved ${resolvedCount} against a declared ${declared.count}.`,
      );
    }
  } else {
    if (resolvedCount < declared.minimum) {
      return fault(
        "under_declared",
        `Resolved ${resolvedCount}, below the reviewed bound of ${declared.minimum}.`,
      );
    }
    if (resolvedCount > declared.maximum) {
      return fault(
        "excess_result",
        `Resolved ${resolvedCount}, above the reviewed bound of ${declared.maximum}.`,
      );
    }
  }
  return { status: "resolved", observationIds: unique, resolvedCount };
}

/* ------------------------------------------------------------------------------------------------
 * Targeted recompute (`Architecture/06-…` §10.2, §10.3 rules 4-5)
 * ---------------------------------------------------------------------------------------------- */

export interface ProjectionDependency {
  readonly projectionKind: string;
  readonly dependsOnAxes: readonly ImpactAxis[];
}

/**
 * Only projection kinds that declare a dependency on a changed axis are rebuilt. Everything else is
 * left alone — rebuilding an independent projection wastes work and risks changing a value nobody
 * asserted anything about.
 */
export function projectionsToRebuild(
  assertion: ImpactAssertion,
  dependencies: readonly ProjectionDependency[],
): readonly string[] {
  const changed = new Set<ImpactAxis>(changedAxes(assertion.selectors));
  return dependencies
    .filter((dependency) => dependency.dependsOnAxes.some((axis) => changed.has(axis)))
    .map((dependency) => dependency.projectionKind)
    .sort();
}

export interface RecomputeVerification {
  readonly ok: boolean;
  /** Selected entries that did not change. The rebuild did not do what the assertion claimed. */
  readonly selectedUnchanged: readonly string[];
  /** Unaffected entries that changed. The rebuild reached past its scope. */
  readonly unaffectedChanged: readonly string[];
  readonly selectedChangedCount: number;
}

/**
 * Proves the §10.2 invariant before a shadow generation is published: 100% of the selected set
 * changed, and 0% of the unaffected set did. A failure here blocks the switch; it never downgrades
 * into a warning.
 */
export function verifyRecomputeScope(
  before: ReadonlyMap<string, string>,
  after: ReadonlyMap<string, string>,
  partition: ScopePartition,
): RecomputeVerification {
  const changed = (entry: string): boolean => before.get(entry) !== after.get(entry);
  const selectedUnchanged = [...partition.affected].filter((entry) => !changed(entry)).sort();
  const unaffectedChanged = [...partition.unaffected].filter(changed).sort();
  return {
    ok: selectedUnchanged.length === 0 && unaffectedChanged.length === 0,
    selectedUnchanged,
    unaffectedChanged,
    selectedChangedCount: partition.affected.length - selectedUnchanged.length,
  };
}

/**
 * The idempotent semantic identity of one recompute effect (D13). The same assertion, projection
 * kind and generation always name the same effect, so a retried job cannot apply it twice.
 */
export function impactRecomputeSemanticIdentity(
  assertion: ImpactAssertion,
  projectionKind: string,
  generation: number,
): string {
  return `${assertion.impactAssertionId}:${projectionKind}:${generation}`;
}
