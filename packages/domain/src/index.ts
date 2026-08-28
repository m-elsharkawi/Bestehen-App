declare const opaqueId: unique symbol;

/** App-owned identifier. Provider identifiers must never be used as domain identifiers. */
export type AppId<Kind extends string> = string & {
  readonly [opaqueId]: Kind;
};

export type Result<Value, Failure> =
  | { readonly ok: true; readonly value: Value }
  | { readonly ok: false; readonly error: Failure };

export function appId<Kind extends string>(value: string): AppId<Kind> {
  if (!/^[a-z0-9][a-z0-9_-]{7,127}$/i.test(value)) {
    throw new Error("App identifiers must be opaque and between 8 and 128 safe characters.");
  }
  return value as AppId<Kind>;
}

export const appIdKinds = [
  "learner_scope",
  "principal",
  "credential_binding",
  "app_session",
  "operation",
  "request",
  "plan_revision",
  "session",
  "activity_occurrence",
  "episode",
  "attempt",
  "checkpoint",
  "response_fact",
  "independent_occasion",
  "mock_occasion",
  "evidence_observation",
  "validity_assertion",
  "correction",
  "projection_generation",
  "job",
  "event",
  "release_unit",
  "activation_manifest",
  "export_operation",
  "deletion_operation",
  "audit_event",
  "content_family",
  "content_revision",
  "content_item",
  "content_form",
  "key_revision",
  "media_asset",
  "media_revision",
  "rights_envelope",
  "approval_decision",
  "serving_manifest",
  "impact_assertion",
  "content_release",
  "listening_plan",
  "playback_occurrence",
  "preflight_receipt",
  "assistance_event",
  "exposure_event",
  "submission",
  "objective_outcome",
  "defect_report",
  "corpus_bundle",
] as const;

export type AppIdKind = (typeof appIdKinds)[number];
export type LearnerScopeId = AppId<"learner_scope">;
export type PrincipalId = AppId<"principal">;
export type AppSessionId = AppId<"app_session">;
export type OperationId = AppId<"operation">;
export type RequestId = AppId<"request">;
export type AttemptId = AppId<"attempt">;
export type EvidenceObservationId = AppId<"evidence_observation">;
export type ValidityAssertionId = AppId<"validity_assertion">;
export type ProjectionGenerationId = AppId<"projection_generation">;
export type JobId = AppId<"job">;
export type AuditEventId = AppId<"audit_event">;
export type ContentFamilyId = AppId<"content_family">;
export type ContentRevisionId = AppId<"content_revision">;
export type ContentItemId = AppId<"content_item">;
export type ContentFormId = AppId<"content_form">;
export type KeyRevisionId = AppId<"key_revision">;
export type MediaRevisionId = AppId<"media_revision">;
export type ServingManifestId = AppId<"serving_manifest">;
export type ImpactAssertionId = AppId<"impact_assertion">;
export type ListeningPlanId = AppId<"listening_plan">;
export type PlaybackOccurrenceId = AppId<"playback_occurrence">;
export type SubmissionId = AppId<"submission">;
export type ObjectiveOutcomeId = AppId<"objective_outcome">;

export const evidenceValidityStates = [
  "valid",
  "partially_valid",
  "pending",
  "interrupted",
  "not_counted",
] as const;
export type EvidenceValidityState = (typeof evidenceValidityStates)[number];

export const readinessStates = [
  "evidence_building",
  "not_ready",
  "borderline",
  "safe",
  "ready_to_book",
  "stale_contradicted",
] as const;
export type ReadinessState = (typeof readinessStates)[number];

export const weaknessStates = [
  "candidate",
  "historical_unconfirmed",
  "known",
  "repairing",
  "stabilizing",
  "repaired",
  "resolved",
] as const;
export const progressionStates = ["P0", "P1", "P2", "P3", "P4"] as const;
export const adoptionStates = [
  "confirmed",
  "probe_eligible",
  "probing",
  "provisional",
  "recovering",
] as const;
export const reviewStates = [
  "scheduled",
  "window_open",
  "overdue",
  "pending_evaluation",
  "blocked_content",
  "repair_required",
  "satisfied",
  "completed",
] as const;
export const projectionAvailabilityStates = [
  "current",
  "recomputing",
  "stale",
  "blocked_by_pending",
  "unavailable",
  "failed",
  "deleted",
] as const;
export const planStates = [
  "assembling",
  "offered",
  "active",
  "updating",
  "paused",
  "partially_completed",
  "completed",
  "replanned",
  "blocked",
  "unavailable",
  "failed",
  "deleted",
] as const;
export const semanticJobStates = [
  "accepted",
  "scheduled",
  "running",
  "succeeded_candidate",
  "retry_scheduled",
  "cancel_requested",
  "published",
  "cancelled",
  "failed_terminal",
  "expired",
  "quarantined",
  "superseded",
] as const;
export type SemanticJobState = (typeof semanticJobStates)[number];

export const learnerScopeStates = ["active", "deletion_in_progress", "deleted"] as const;
export const credentialStates = ["active", "retiring", "retired", "revoked"] as const;
export const sessionStates = ["active", "revoked", "idle_expired", "absolute_expired"] as const;
export const bindingStates = ["pending", "active", "retired"] as const;
export const deletionStates = [
  "requested",
  "access_revoked",
  "live_purging",
  "provider_pending",
  "live_erased_backup_residual",
  "fully_expired",
  "failed_retrying",
] as const;

/**
 * Stage 05 content provenance classes (`Architecture/09-…` §4.2). Class is provenance and never a
 * gate: it never implies an approval level, and an unknown or malformed class fails closed to
 * `draft` through {@link canHoldApprovalLevel}.
 */
export const contentClasses = ["C0", "C1", "C2", "C3", "C4"] as const;
export type ContentClass = (typeof contentClasses)[number];

/** Content approval levels (`Architecture/09-…` §5.1-§5.2). Approval is a gate, never provenance. */
export const contentApprovalLevels = [
  "draft",
  "quarantine",
  "training",
  "independent_b1",
  "readiness_p4",
  "gold",
  "retired",
] as const;
export type ContentApprovalLevel = (typeof contentApprovalLevels)[number];

/** Rights-envelope currentness (`Architecture/09-…` §8.2 identity/currentness row). */
export const contentRightsStates = ["current", "superseded", "withdrawn", "takedown"] as const;
export type ContentRightsState = (typeof contentRightsStates)[number];

/**
 * Attempt runtime lifecycle, bounded at the result boundary (`Architecture/15-…` §6.1 up to and
 * including `ResultAvailable`). `Diagnose`, `Repair`, `FreshRetry`, `TransferPending` and `Remember`
 * belong to the coaching engine and are deliberately absent. `not_counted` is a validity state and
 * is deliberately absent here: the runtime records what happened, validity records what it means.
 */
export const attemptRuntimeStates = [
  "acquiring_manifest",
  "ready",
  "in_progress",
  "checkpointed",
  "submission_unknown",
  "submitted",
  "scoring",
  "interpreting_evidence",
  "result_available",
  "interrupted",
  "unavailable",
] as const;
export type AttemptRuntimeState = (typeof attemptRuntimeStates)[number];

/** Deterministic unit outcome kinds (`Architecture/15-…` §5.5 `UnitOutcome`). */
export const objectiveUnitOutcomeKinds = [
  "correct",
  "incorrect",
  "blank",
  "structurally_invalid",
] as const;
export type ObjectiveUnitOutcomeKind = (typeof objectiveUnitOutcomeKinds)[number];

/**
 * Occasion classes (`Architecture/06-…` §7.2), lifted verbatim from the
 * `app.independent_occasions.independence_class` CHECK so the domain and the schema cannot drift.
 */
export const independenceClasses = [
  "first_attempt",
  "immediate_retry",
  "delayed_transfer",
  "retention_check",
  "repeated_exposed_practice",
  "mock_measurement",
] as const;
export type IndependenceClass = (typeof independenceClasses)[number];

/** Assistance kinds (`Architecture/15-…` §9.1 `AssistanceEvent.kind`). */
export const assistanceKinds = [
  "instruction_example",
  "vocabulary_preview",
  "word_help",
  "phrase_translation",
  "sentence_explanation",
  "full_translation",
  "strategy_cue",
  "evidence_location",
  "answer_narrowing",
  "accessibility_support",
] as const;
export type AssistanceKind = (typeof assistanceKinds)[number];

/** Assistance phases (`Architecture/15-…` §9.1 `AssistanceEvent.phase`). */
export const assistancePhases = [
  "before_response",
  "during_response",
  "after_submission",
  "repair",
] as const;
export type AssistancePhase = (typeof assistancePhases)[number];

/**
 * Recorded family-exposure relation for one observation (`conditions.exposure_class` of the evidence
 * envelope, `Architecture/06-…` §5.2 and §7.1). A different revision identifier or reordered options
 * never manufactures `unseen`.
 */
export const exposureClasses = [
  "unseen",
  "exposed_family",
  "near_duplicate_family",
  "answer_exposed",
] as const;
export type ExposureClass = (typeof exposureClasses)[number];

/**
 * Timer integrity as recorded on the observation (`conditions.timer_integrity` of the evidence
 * envelope; the `reconstruction_quality` vocabulary of `Architecture/21-…` §12.1). A timer label
 * never substitutes for actual integrity.
 */
export const timerIntegrityStates = [
  "in_context_trusted",
  "cross_context_supported",
  "expired",
  "inconsistent",
  "insufficient",
] as const;
export type TimerIntegrityState = (typeof timerIntegrityStates)[number];

/** Playback lifecycle for one listening plan (`Architecture/16-…` §7.1). */
export const playbackStates = [
  "unprepared",
  "preflighting",
  "setup_blocked",
  "ready",
  "authorized",
  "playing",
  "completed",
  "faulted",
  "interrupted",
  "block_complete",
  "protected",
] as const;
export type PlaybackState = (typeof playbackStates)[number];

/** Serving freshness decision (`Architecture/09-…` §7.2 as a decision, not a state machine). */
export const freshnessDecisions = [
  "fresh",
  "exposed_review",
  "not_independent",
  "unavailable",
] as const;
export type FreshnessDecision = (typeof freshnessDecisions)[number];

/** Impact modes (`Architecture/06-…` §10.1 `ImpactAssertion.impact_mode`). */
export const impactModes = [
  "serving_only",
  "visibility_redaction",
  "validity_change",
  "target_mapping_change",
  "reevaluation_required",
] as const;
export type ImpactMode = (typeof impactModes)[number];

/** Impact cause kinds (`Architecture/06-…` §10.1 `ImpactAssertion.cause_kind`). */
export const impactCauseKinds = [
  "content_defect",
  "media_defect",
  "evaluator_release",
  "rubric_or_prompt_defect",
  "rights_takedown",
  "taxonomy_change",
  "blueprint_change",
  "timer_or_platform_fault",
  "manual_correction",
] as const;
export type ImpactCauseKind = (typeof impactCauseKinds)[number];

const validityTransitions: Readonly<
  Record<EvidenceValidityState, readonly EvidenceValidityState[]>
> = {
  valid: ["pending", "partially_valid", "interrupted", "not_counted"],
  partially_valid: ["pending", "valid", "interrupted", "not_counted"],
  pending: ["valid", "partially_valid", "interrupted", "not_counted"],
  interrupted: ["pending", "partially_valid", "not_counted", "valid"],
  not_counted: ["pending", "partially_valid", "valid"],
};

export function canTransitionEvidenceValidity(
  from: EvidenceValidityState,
  to: EvidenceValidityState,
): boolean {
  return from !== to && validityTransitions[from].includes(to);
}

const terminalJobStates = new Set<SemanticJobState>([
  "published",
  "cancelled",
  "failed_terminal",
  "expired",
  "quarantined",
  "superseded",
]);

export function canTransitionSemanticJob(from: SemanticJobState, to: SemanticJobState): boolean {
  if (from === to || terminalJobStates.has(from)) return false;
  const transitions: Readonly<Record<SemanticJobState, readonly SemanticJobState[]>> = {
    accepted: ["scheduled", "cancel_requested", "expired", "quarantined"],
    scheduled: ["running", "cancel_requested", "expired", "quarantined", "superseded"],
    running: [
      "succeeded_candidate",
      "retry_scheduled",
      "cancel_requested",
      "failed_terminal",
      "expired",
      "quarantined",
      "superseded",
    ],
    succeeded_candidate: ["published", "cancelled", "quarantined", "superseded"],
    retry_scheduled: [
      "scheduled",
      "running",
      "cancel_requested",
      "failed_terminal",
      "expired",
      "quarantined",
      "superseded",
    ],
    cancel_requested: ["cancelled", "succeeded_candidate", "quarantined"],
    published: [],
    cancelled: [],
    failed_terminal: [],
    expired: [],
    quarantined: [],
    superseded: [],
  };
  return transitions[from].includes(to);
}

const terminalAttemptRuntimeStates = new Set<AttemptRuntimeState>([
  "result_available",
  "interrupted",
  "unavailable",
]);

/**
 * Exactly the arrows of `Architecture/15-…` §6.1 up to and including the `ResultAvailable` boundary.
 *
 * `submission_unknown → in_progress` is legal here only as a shape; the runtime service must
 * additionally prove that no committed submission receipt exists. That precondition is a repository
 * query, not a state-machine edge, and is not expressible in this pure guard.
 */
export function canTransitionAttemptRuntime(
  from: AttemptRuntimeState,
  to: AttemptRuntimeState,
): boolean {
  if (from === to || terminalAttemptRuntimeStates.has(from)) return false;
  const transitions: Readonly<Record<AttemptRuntimeState, readonly AttemptRuntimeState[]>> = {
    acquiring_manifest: ["ready", "unavailable"],
    ready: ["in_progress"],
    in_progress: ["checkpointed", "submission_unknown", "submitted", "interrupted"],
    checkpointed: ["in_progress"],
    submission_unknown: ["submitted", "in_progress"],
    submitted: ["scoring"],
    scoring: ["interpreting_evidence"],
    interpreting_evidence: ["result_available"],
    result_available: [],
    interrupted: [],
    unavailable: [],
  };
  return transitions[from].includes(to);
}

const terminalContentApprovalLevels = new Set<ContentApprovalLevel>(["retired"]);

/**
 * Exactly the arrows of `Architecture/09-…` §5.2.
 *
 * Two asymmetries this guard exists to encode: a quarantined artifact is never restored directly to
 * a serving level — it goes to `draft`, whose successor revision restarts full QA, or to `retired`;
 * and `gold` is a curated benchmark decision reachable from `training`, `independent_b1` or
 * `readiness_p4`, none of which it grants in return.
 */
export function canTransitionContentApproval(
  from: ContentApprovalLevel,
  to: ContentApprovalLevel,
): boolean {
  if (from === to || terminalContentApprovalLevels.has(from)) return false;
  const transitions: Readonly<Record<ContentApprovalLevel, readonly ContentApprovalLevel[]>> = {
    draft: ["quarantine", "training", "retired"],
    quarantine: ["draft", "retired"],
    training: ["independent_b1", "gold", "quarantine", "retired"],
    independent_b1: ["readiness_p4", "gold", "quarantine", "retired"],
    readiness_p4: ["gold", "quarantine", "retired"],
    gold: ["quarantine", "retired"],
    retired: [],
  };
  return transitions[from].includes(to);
}

const terminalPlaybackStates = new Set<PlaybackState>(["block_complete", "protected"]);

/** Exactly the arrows of `Architecture/16-…` §7.1. No failure edge awards a replay or a response. */
export function canTransitionPlayback(from: PlaybackState, to: PlaybackState): boolean {
  if (from === to || terminalPlaybackStates.has(from)) return false;
  const transitions: Readonly<Record<PlaybackState, readonly PlaybackState[]>> = {
    unprepared: ["preflighting"],
    preflighting: ["ready", "setup_blocked"],
    setup_blocked: ["preflighting"],
    ready: ["authorized"],
    authorized: ["playing"],
    playing: ["completed", "faulted", "interrupted"],
    completed: ["ready", "block_complete"],
    faulted: ["protected"],
    interrupted: ["protected"],
    block_complete: [],
    protected: [],
  };
  return transitions[from].includes(to);
}

const approvalLevelsByClass: Readonly<Record<ContentClass, readonly ContentApprovalLevel[]>> = {
  C0: ["draft", "quarantine", "retired"],
  C1: ["draft", "quarantine", "training", "independent_b1", "retired"],
  C2: ["draft", "quarantine", "training", "independent_b1", "readiness_p4", "gold", "retired"],
  C3: ["draft", "quarantine", "training", "independent_b1", "retired"],
  C4: ["draft", "quarantine", "retired"],
};

/**
 * Class/approval eligibility (`Architecture/09-…` §4.2), which is a separate matrix from the
 * approval state machine: holding a level legally requires both a legal transition and an eligible
 * class. An unknown or malformed class fails closed to `draft`.
 */
export function canHoldApprovalLevel(contentClass: string, level: ContentApprovalLevel): boolean {
  const eligible = (approvalLevelsByClass as Readonly<Record<string, readonly string[]>>)[
    contentClass
  ];
  if (!eligible) return level === "draft";
  return eligible.includes(level);
}

export const reasonFamilies = [
  "VALIDITY",
  "DIRECT",
  "RISK",
  "UNCERTAINTY",
  "DUE",
  "PROGRESSION",
  "COVERAGE",
  "PREFERENCE",
  "CONTEXT",
  "FALLBACK",
] as const;
export type ReasonFamily = (typeof reasonFamilies)[number];

export type ReasonCode = `${ReasonFamily}.${string}`;

/**
 * Registry release identity. Stage 05 appends codes to the same major, so the bump is additive and
 * the `major = 1` constraint on `app.reason_registry_releases` stays satisfied.
 */
export const reasonRegistryRelease = { id: "reason-registry/v1.1", major: 1, minor: 1 } as const;

export interface ReasonCodeDefinition {
  readonly code: ReasonCode;
  readonly major: 1;
  readonly minor: number;
  readonly owner: string;
  readonly learnerFault: boolean;
  readonly retentionClass: "semantic" | "operational" | "security";
  readonly templateKey: string;
}

const representativeCodes = {
  VALIDITY: [
    "CONTENT_APPROVAL",
    "RIGHTS_COMPATIBILITY",
    "ACCESS_EQUIVALENCE",
    "TECHNICAL_PREFLIGHT",
    "IDENTITY_CLAIM_INVALID",
    "CONTENT_QUARANTINED_AFTER_PIN",
    "MEDIA_INTEGRITY_FAILED",
    "TIMER_INTEGRITY_LOST",
    "RESPONSE_STRUCTURALLY_INVALID",
  ],
  DIRECT: [
    "MISSING_WRITTEN",
    "MISSING_ORAL",
    "TARGET_CONDITION_GAP",
    "ASSISTANCE_DEPENDENT",
    "STALE_DIRECT_SAMPLE",
    "EXPOSED_FAMILY_PRACTICE",
    "PLAYBACK_CONDITION_ALTERED",
  ],
  RISK: ["WRITTEN_BLOCKER", "ORAL_BLOCKER", "BOOKED_DATE", "MOCK_REVEALED"],
  UNCERTAINTY: [
    "PENDING_EVALUATION",
    "CONTRADICTORY_EVIDENCE",
    "CAUSE_UNRESOLVED",
    "PROJECTION_UPDATING",
    "KEY_VALIDATOR_DISAGREEMENT",
  ],
  DUE: ["TRANSFER_WINDOW", "RETENTION_WINDOW", "POST_MOCK_CLARIFIER"],
  PROGRESSION: ["REACHABLE_PREREQUISITE", "ASSISTANCE_FADE", "REALISM_PROBE"],
  COVERAGE: ["SECTION_AGING", "TASK_FAMILY_GAP", "NORMAL_ROTATION"],
  PREFERENCE: ["REQUESTED_SKILL", "REQUESTED_MODE", "VARIETY"],
  CONTEXT: ["TIME_CHANGED", "LOW_ENERGY", "NO_AUDIO", "NO_MIC", "OFFLINE", "ACCESS_NEED"],
  FALLBACK: [
    "NO_VALID_PLAN",
    "CONTENT_UNAVAILABLE",
    "EVALUATOR_PENDING",
    "TECHNICAL_FAULT",
    "NO_FRESH_RETRY",
    "AUTHORIZATION_DENIED",
    "JOB_RETRY_EXHAUSTED",
    "MEDIA_UNAVAILABLE",
    "NO_ELIGIBLE_FAMILY",
    "SUBMISSION_OUTCOME_UNKNOWN",
    "CONTENT_UPDATE_REQUIRED",
  ],
} as const;

export const reasonRegistryV1: readonly ReasonCodeDefinition[] = reasonFamilies.flatMap((family) =>
  representativeCodes[family].map((name) => ({
    code: `${family}.${name}` as ReasonCode,
    major: 1 as const,
    minor: 0,
    owner: family === "VALIDITY" ? "Evidence & Capability" : "Coaching & Planning",
    learnerFault: false,
    retentionClass: name.includes("AUTHORIZATION") ? ("security" as const) : ("semantic" as const),
    templateKey: `${family.toLowerCase()}.${name.toLowerCase()}`,
  })),
);

export interface ScopePartition {
  readonly affected: readonly string[];
  readonly unaffected: readonly string[];
}

export function validateValidityPartition(
  state: EvidenceValidityState,
  supportedScope: readonly string[],
  partition: ScopePartition,
): Result<ScopePartition, "partition_required" | "partition_overlap" | "partition_incomplete"> {
  if (state !== "partially_valid" && state !== "pending") {
    return { ok: true, value: partition };
  }
  if (partition.affected.length === 0 || partition.unaffected.length === 0) {
    return { ok: false, error: "partition_required" };
  }
  const affected = new Set(partition.affected);
  if (partition.unaffected.some((value) => affected.has(value))) {
    return { ok: false, error: "partition_overlap" };
  }
  const complete = new Set([...partition.affected, ...partition.unaffected]);
  if (
    complete.size !== supportedScope.length ||
    supportedScope.some((value) => !complete.has(value))
  ) {
    return { ok: false, error: "partition_incomplete" };
  }
  return { ok: true, value: partition };
}

export interface AuthorizedScope {
  readonly principalId: PrincipalId;
  readonly learnerScopeId: LearnerScopeId;
  readonly actorKind: "owner" | "worker" | "operator";
  readonly capabilities: readonly string[];
  readonly authenticatedAt: Date;
}
