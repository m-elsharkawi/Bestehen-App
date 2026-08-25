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

export interface ReasonCodeDefinition {
  readonly code: `${ReasonFamily}.${string}`;
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
  ],
  DIRECT: [
    "MISSING_WRITTEN",
    "MISSING_ORAL",
    "TARGET_CONDITION_GAP",
    "ASSISTANCE_DEPENDENT",
    "STALE_DIRECT_SAMPLE",
  ],
  RISK: ["WRITTEN_BLOCKER", "ORAL_BLOCKER", "BOOKED_DATE", "MOCK_REVEALED"],
  UNCERTAINTY: [
    "PENDING_EVALUATION",
    "CONTRADICTORY_EVIDENCE",
    "CAUSE_UNRESOLVED",
    "PROJECTION_UPDATING",
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
  ],
} as const;

export const reasonRegistryV1: readonly ReasonCodeDefinition[] = reasonFamilies.flatMap((family) =>
  representativeCodes[family].map((name) => ({
    code: `${family}.${name}` as `${ReasonFamily}.${string}`,
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
