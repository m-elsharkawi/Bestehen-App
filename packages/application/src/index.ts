import {
  type AppId,
  type AppSessionId,
  type AttemptRuntimeState,
  type AuthorizedScope,
  type ContentApprovalLevel,
  type ContentClass,
  type ContentRevisionId,
  type EvidenceObservationId,
  type EvidenceValidityState,
  type ExposureClass,
  type FreshnessDecision,
  type ImpactCauseKind,
  type ImpactMode,
  type IndependenceClass,
  type JobId,
  type LearnerScopeId,
  type ObjectiveUnitOutcomeKind,
  type OperationId,
  type PrincipalId,
  type ReasonCode,
  type Result,
  type ScopePartition,
  type SemanticJobState,
  type ServingManifestId,
  type TimerIntegrityState,
  type ValidityAssertionId,
  validateValidityPartition,
} from "@bestehen/domain";

export interface Clock {
  now(): Date;
}

export interface IdSource {
  next<Kind extends string>(): AppId<Kind>;
}

export interface Lifecycle {
  start(): Promise<void>;
  stop(signal: "SIGINT" | "SIGTERM" | "startup_failure"): Promise<void>;
}

export type ProviderConfigurationCheck =
  | { readonly status: "ready"; readonly reason: "configured"; readonly retryable: false }
  | { readonly status: "not_ready"; readonly reason: "disabled"; readonly retryable: false }
  | { readonly status: "not_ready"; readonly reason: "timeout"; readonly retryable: true }
  | { readonly status: "not_ready"; readonly reason: "quota_exceeded"; readonly retryable: true }
  | {
      readonly status: "not_ready";
      readonly reason: "malformed_response";
      readonly retryable: false;
    }
  | {
      readonly status: "not_ready";
      readonly reason: "retryable_failure";
      readonly retryable: true;
    }
  | {
      readonly status: "not_ready";
      readonly reason: "permanent_failure";
      readonly retryable: false;
    };

export interface ProviderAdapter {
  readonly kind: "fake" | "configured";
  readonly capability: "identity" | "object_storage" | "email" | "ai" | "stt" | "tts";
  checkConfiguration(): Promise<ProviderConfigurationCheck>;
}

export interface KeyedDigest {
  digest(purpose: string, value: string): string;
  equals(left: string, right: string): boolean;
}

export interface SecretSealer {
  seal(purpose: string, plaintext: string): string;
  open(purpose: string, sealed: string): Result<string, "invalid_seal">;
}

export interface IdentityProof {
  readonly issuer: string;
  readonly subject: string;
  readonly emailVerified: boolean;
  readonly authenticationTime: Date;
  readonly authenticationMethod: "email_otp";
}

export interface BoundIdentity {
  readonly principalId: PrincipalId;
  readonly learnerScopeId: LearnerScopeId;
  readonly credentialState: "active" | "retiring" | "retired" | "revoked";
  readonly scopeBindingState: "pending" | "active" | "retired";
}

export interface IdentityDirectory {
  resolve(
    proof: IdentityProof,
  ): Promise<Result<BoundIdentity, "unknown_binding" | "binding_inactive">>;
}

export interface AppSessionRecord {
  readonly id: AppSessionId;
  readonly tokenDigest: string;
  readonly principalId: PrincipalId;
  readonly learnerScopeId: LearnerScopeId;
  readonly state: "active" | "revoked" | "idle_expired" | "absolute_expired";
  readonly createdAt: Date;
  readonly lastUsedAt: Date;
  readonly authenticatedAt: Date;
  readonly idleExpiresAt: Date;
  readonly absoluteExpiresAt: Date;
}

export interface AppSessionStore {
  insert(session: AppSessionRecord): Promise<void>;
  findByTokenDigest(tokenDigest: string): Promise<AppSessionRecord | undefined>;
  touch(
    id: AppSessionId,
    expectedLastUsedAt: Date,
    nextLastUsedAt: Date,
    nextIdleExpiry: Date,
  ): Promise<boolean>;
  revoke(id: AppSessionId, at: Date): Promise<boolean>;
  revokeForPrincipal(
    principalId: PrincipalId,
    except: AppSessionId | undefined,
    at: Date,
  ): Promise<number>;
}

export const sessionPolicyV1 = {
  revision: "session-policy/v1",
  idleMilliseconds: 24 * 60 * 60 * 1000,
  absoluteMilliseconds: 7 * 24 * 60 * 60 * 1000,
  recentAuthenticationMilliseconds: 10 * 60 * 1000,
} as const;

export type SessionResolutionFailure =
  | "missing"
  | "revoked"
  | "idle_expired"
  | "absolute_expired"
  | "binding_inactive";

export function resolveSessionState(
  session: AppSessionRecord | undefined,
  now: Date,
): Result<AppSessionRecord, SessionResolutionFailure> {
  if (!session) return { ok: false, error: "missing" };
  if (session.state !== "active") return { ok: false, error: session.state };
  if (now >= session.absoluteExpiresAt) return { ok: false, error: "absolute_expired" };
  if (now >= session.idleExpiresAt) return { ok: false, error: "idle_expired" };
  return { ok: true, value: session };
}

export function isRecentAuthentication(session: AppSessionRecord, now: Date): boolean {
  return (
    now.getTime() - session.authenticatedAt.getTime() <=
    sessionPolicyV1.recentAuthenticationMilliseconds
  );
}

export type AuthorizationAction =
  | "owner_status:read"
  | "evidence:append"
  | "evidence:correct"
  | "projection:publish"
  | "session:revoke_other"
  | "rights:request"
  | "content:publish"
  | "content:quarantine"
  | "content:report"
  | "attempt:create"
  | "attempt:checkpoint"
  | "attempt:submit"
  | "attempt:read_result"
  | "media:authorize";

const ownerActions: readonly AuthorizationAction[] = [
  "owner_status:read",
  "evidence:append",
  "evidence:correct",
  "projection:publish",
  "session:revoke_other",
  "rights:request",
  "content:publish",
  "content:quarantine",
  "content:report",
  "attempt:create",
  "attempt:checkpoint",
  "attempt:submit",
  "attempt:read_result",
  "media:authorize",
];

export function authorize(
  scope: AuthorizedScope | undefined,
  action: AuthorizationAction,
  input: { readonly learnerScopeId?: LearnerScopeId; readonly requireRecentAuth?: boolean },
  now: Date,
): Result<AuthorizedScope, "not_available" | "recent_auth_required"> {
  if (!scope) return { ok: false, error: "not_available" };
  if (scope.actorKind === "owner" && !ownerActions.includes(action)) {
    return { ok: false, error: "not_available" };
  }
  if (scope.actorKind !== "owner" && !scope.capabilities.includes(action)) {
    return { ok: false, error: "not_available" };
  }
  if (input.learnerScopeId && input.learnerScopeId !== scope.learnerScopeId) {
    return { ok: false, error: "not_available" };
  }
  if (
    input.requireRecentAuth &&
    now.getTime() - scope.authenticatedAt.getTime() >
      sessionPolicyV1.recentAuthenticationMilliseconds
  ) {
    return { ok: false, error: "recent_auth_required" };
  }
  return { ok: true, value: scope };
}

export interface OperationReceipt {
  readonly learnerScopeId: LearnerScopeId;
  readonly operationId: OperationId;
  readonly kind: string;
  readonly canonicalizationVersion: "canonical-json/v1";
  readonly payloadDigest: string;
  readonly status: "accepted" | "completed";
  readonly resourceId?: string;
}

export interface OperationReceiptStore {
  claim(
    receipt: OperationReceipt,
  ): Promise<
    Result<
      { readonly disposition: "created" | "replayed"; readonly receipt: OperationReceipt },
      "idempotency_conflict" | "not_available"
    >
  >;
}

export interface EvidenceObservation {
  readonly id: EvidenceObservationId;
  readonly learnerScopeId: LearnerScopeId;
  readonly operationId: OperationId;
  readonly learnerSequence: number;
  readonly supportedScope: readonly string[];
  readonly recordedAt: Date;
  readonly compatibility: Readonly<Record<string, string>>;
}

export interface ValidityAssertion {
  readonly id: ValidityAssertionId;
  readonly observationId: EvidenceObservationId;
  readonly priorAssertionId?: ValidityAssertionId;
  readonly state: EvidenceValidityState;
  readonly partition: ScopePartition;
  readonly reasonCode: string;
  readonly effectiveAt: Date;
  readonly recordedAt: Date;
}

export interface EvidenceCorrection {
  readonly id: AppId<"correction">;
  readonly learnerScopeId: LearnerScopeId;
  readonly operationId: OperationId;
  readonly targetObservationId?: EvidenceObservationId;
  readonly targetAssertionId?: ValidityAssertionId;
  readonly selectorDigest: string;
  readonly impactDigest: string;
  readonly reasonCode: string;
  readonly requestedProjections: readonly ProjectionCandidate["kind"][];
  readonly supersedesId?: AppId<"correction">;
  readonly recordedAt: Date;
}

export interface EvidenceLedger {
  appendObservation(
    scope: AuthorizedScope,
    observation: EvidenceObservation,
    initialAssertion: ValidityAssertion,
  ): Promise<Result<EvidenceObservation, "conflict" | "not_available">>;
  appendAssertion(
    scope: AuthorizedScope,
    assertion: ValidityAssertion,
  ): Promise<Result<ValidityAssertion, "conflict" | "illegal_transition" | "not_available">>;
  appendCorrection(
    scope: AuthorizedScope,
    correction: EvidenceCorrection,
  ): Promise<Result<EvidenceCorrection, "conflict" | "not_available">>;
  readChain(
    scope: AuthorizedScope,
    observationId: EvidenceObservationId,
  ): Promise<readonly ValidityAssertion[]>;
}

export interface ProjectionCandidate {
  readonly generationId: AppId<"projection_generation">;
  readonly learnerScopeId: LearnerScopeId;
  readonly kind: "capability" | "weakness" | "progression" | "readiness";
  readonly sourceCut: number;
  readonly checksum: string;
  readonly predecessorId?: AppId<"projection_generation">;
}

export interface ProjectionPublisher {
  publish(
    scope: AuthorizedScope,
    candidate: ProjectionCandidate,
    expectedCurrentVersion: number,
  ): Promise<Result<ProjectionCandidate, "checksum_mismatch" | "conflict" | "not_available">>;
}

export interface SemanticJob {
  readonly id: JobId;
  readonly learnerScopeId: LearnerScopeId;
  readonly kind:
    | "projection_rebuild_v1"
    | "outbox_dispatch_v1"
    | "rights_reconcile_v1"
    | "content_publication_v1"
    | "content_impact_recompute_v1";
  readonly semanticIdentity: string;
  readonly state: SemanticJobState;
  readonly revision: number;
  readonly payloadDigest: string;
  readonly attempt: number;
  readonly maximumAttempts: number;
  readonly deadline: Date;
}

export interface SemanticJobStore {
  accept(
    job: SemanticJob,
  ): Promise<Result<SemanticJob, "semantic_identity_conflict" | "not_available">>;
  transition(
    id: JobId,
    expectedRevision: number,
    state: SemanticJobState,
    reasonCode?: string,
  ): Promise<Result<SemanticJob, "conflict" | "illegal_transition" | "not_available">>;
  commitFoundationEffect(
    job: SemanticJob,
    effectIdentity: string,
    effectDigest: string,
  ): Promise<
    Result<
      { readonly disposition: "created" | "replayed"; readonly job: SemanticJob },
      "effect_conflict" | "conflict" | "illegal_transition" | "not_available"
    >
  >;
}

export interface SecurityAuditEvent {
  readonly action: string;
  readonly actorScope: LearnerScopeId | "operator" | "worker" | "anonymous";
  readonly targetClass: string;
  readonly targetDigest: string;
  readonly outcome: "allowed" | "denied" | "conflict" | "failed";
  readonly reasonCode: string;
  readonly requestId: string;
  readonly traceId: string;
  readonly recordedAt: Date;
}

export interface SecurityAuditSink {
  append(event: SecurityAuditEvent): Promise<void>;
}

export function safeReturnPath(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  const url = new URL(value, "https://bestehen.invalid");
  return url.origin === "https://bestehen.invalid" ? `${url.pathname}${url.search}` : "/";
}

/* ------------------------------------------------------------------------------------------------
 * Stage 05 — content serving and the deterministic objective attempt runtime.
 * Ports only: this package owns no adapter, no SQL and no HTTP.
 * ---------------------------------------------------------------------------------------------- */

export interface ContentRevisionSummary {
  readonly contentRevisionId: ContentRevisionId;
  readonly contentFamilyId: AppId<"content_family">;
  readonly contentClass: ContentClass;
  readonly approvalLevel: ContentApprovalLevel;
  readonly digest: string;
  readonly frozenAt?: Date;
}

export interface ContentCatalog {
  findEligibleRevisions(
    scope: AuthorizedScope,
    query: {
      readonly taskFamily: string;
      readonly progressionProfile: "P0" | "P1" | "P2" | "P3" | "P4";
      readonly excludedFamilyIds: readonly AppId<"content_family">[];
    },
  ): Promise<readonly ContentRevisionSummary[]>;
  readRevision(
    scope: AuthorizedScope,
    contentRevisionId: ContentRevisionId,
  ): Promise<Result<ContentRevisionSummary, "not_available" | "quarantined" | "retired">>;
  recordApprovalDecision(
    scope: AuthorizedScope,
    decision: {
      readonly approvalDecisionId: AppId<"approval_decision">;
      readonly contentRevisionId: ContentRevisionId;
      readonly fromLevel: ContentApprovalLevel;
      readonly toLevel: ContentApprovalLevel;
      readonly reasonCode: ReasonCode;
      readonly recordedAt: Date;
    },
  ): Promise<
    Result<
      ContentRevisionSummary,
      "illegal_transition" | "class_ineligible" | "conflict" | "not_available"
    >
  >;
}

export interface ServingManifestLease {
  readonly servingManifestId: ServingManifestId;
  readonly attemptId: AppId<"attempt">;
  readonly contentRevisionIds: readonly ContentRevisionId[];
  readonly freshnessDecision: FreshnessDecision;
  readonly contentReleaseIdentity: string;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  readonly revocationState: "active" | "revoked_before_start" | "revoked_after_pin";
}

export interface ServingManifestBroker {
  /**
   * Idempotent by `scope + operationId + "content.acquire"`. A replay returns the same lease and
   * never records a second exposure.
   */
  acquire(
    scope: AuthorizedScope,
    request: {
      readonly operationId: OperationId;
      readonly activityOccurrenceId: AppId<"activity_occurrence">;
      readonly taskFamily: string;
    },
    now: Date,
  ): Promise<
    Result<
      ServingManifestLease,
      "no_eligible_family" | "rights_or_target" | "idempotency_conflict" | "not_available"
    >
  >;
  revoke(
    scope: AuthorizedScope,
    servingManifestId: ServingManifestId,
    disposition: "revoked_before_start" | "revoked_after_pin",
    reasonCode: ReasonCode,
  ): Promise<Result<ServingManifestLease, "conflict" | "not_available">>;
}

export interface AttemptRecord {
  readonly attemptId: AppId<"attempt">;
  readonly learnerScopeId: LearnerScopeId;
  readonly servingManifestId: ServingManifestId;
  readonly state: AttemptRuntimeState;
  readonly revision: number;
  readonly acknowledgedCheckpointSequence: number;
  readonly expiresAt: Date;
}

export interface AttemptRuntime {
  create(
    scope: AuthorizedScope,
    input: { readonly operationId: OperationId; readonly servingManifestId: ServingManifestId },
    now: Date,
  ): Promise<Result<AttemptRecord, "idempotency_conflict" | "conflict" | "not_available">>;
  checkpoint(
    scope: AuthorizedScope,
    input: {
      readonly operationId: OperationId;
      readonly attemptId: AppId<"attempt">;
      readonly stream: string;
      readonly sequence: number;
      readonly responseDigest: string;
    },
  ): Promise<
    Result<
      { readonly disposition: "accepted" | "stale" | "divergent"; readonly attempt: AttemptRecord },
      "conflict" | "not_available"
    >
  >;
  /**
   * Writes the immutable submission, the original outcome, the condition and exposure facts, the
   * evidence observation and its initial validity assertion in one transaction, then enqueues the
   * projection rebuild. A reconnect never creates a second attempt.
   */
  submit(
    scope: AuthorizedScope,
    input: {
      readonly operationId: OperationId;
      readonly attemptId: AppId<"attempt">;
      readonly responseDigest: string;
    },
    now: Date,
  ): Promise<
    Result<
      { readonly attempt: AttemptRecord; readonly observationId: EvidenceObservationId },
      "idempotency_conflict" | "illegal_transition" | "conflict" | "not_available"
    >
  >;
  readByOperation(
    scope: AuthorizedScope,
    operationId: OperationId,
  ): Promise<AttemptRecord | undefined>;
}

export interface ObjectiveUnitOutcome {
  readonly itemId: AppId<"content_item">;
  readonly kind: ObjectiveUnitOutcomeKind;
  readonly issueCode?: string;
}

/**
 * Deterministic scoring is a pure function of the canonical submitted response, the exact pinned
 * key, the scoring policy and the algorithm version. The port exists so the runtime cannot reach a
 * model, a clock, learner history or a "latest key" lookup through it.
 */
export interface ObjectiveScorerPort {
  readonly algorithmVersion: string;
  score(input: {
    readonly canonicalResponseDigest: string;
    readonly keyRevisionDigest: string;
    readonly itemIds: readonly AppId<"content_item">[];
  }): Result<
    { readonly unitOutcomes: readonly ObjectiveUnitOutcome[]; readonly checksum: string },
    "key_incompatible" | "manifest_mismatch"
  >;
}

export interface ExposureRecorder {
  record(
    scope: AuthorizedScope,
    exposure: {
      readonly operationId: OperationId;
      readonly exposureEventId: AppId<"exposure_event">;
      readonly attemptId: AppId<"attempt">;
      readonly contentFamilyId: AppId<"content_family">;
      readonly exposureClass: ExposureClass;
      readonly occurredAt: Date;
    },
  ): Promise<Result<{ readonly disposition: "created" | "replayed" }, "not_available">>;
}

export interface ContentImpactSink {
  /**
   * Append-only. If the resolved selector cardinality differs from the declared expectation the
   * assertion is refused and an incident is raised rather than a guess being published.
   */
  assert(
    scope: AuthorizedScope,
    assertion: {
      readonly impactAssertionId: AppId<"impact_assertion">;
      readonly causeKind: ImpactCauseKind;
      readonly impactMode: ImpactMode;
      readonly declaredCardinality: number;
      readonly affectedScope: readonly string[];
      readonly unaffectedScope: readonly string[];
      readonly reasonCode: ReasonCode;
      readonly effectiveAt: Date;
    },
  ): Promise<
    Result<
      { readonly resolvedCardinality: number },
      "cardinality_mismatch" | "conflict" | "not_available"
    >
  >;
}

export interface MediaAuthorizer {
  authorize(
    scope: AuthorizedScope,
    request: {
      readonly mediaRevisionId: AppId<"media_revision">;
      readonly servingManifestId: ServingManifestId;
    },
    now: Date,
  ): Promise<
    Result<
      { readonly reference: string; readonly expiresAt: Date; readonly digest: string },
      "not_available" | "not_authorized" | "digest_mismatch"
    >
  >;
}

export interface ListeningPlanBroker {
  read(
    scope: AuthorizedScope,
    listeningPlanId: AppId<"listening_plan">,
  ): Promise<
    Result<
      {
        readonly listeningPlanId: AppId<"listening_plan">;
        readonly allowedPlays: number;
        readonly transcriptPhase: "never" | "after_attempt" | "after_block";
      },
      "not_available"
    >
  >;
  /** Idempotent by `occurrenceId + playOrdinal`; a duplicate tap returns the same receipt. */
  authorizeOccurrence(
    scope: AuthorizedScope,
    input: {
      readonly playbackOccurrenceId: AppId<"playback_occurrence">;
      readonly playOrdinal: number;
    },
  ): Promise<
    Result<
      { readonly disposition: "created" | "replayed"; readonly playOrdinal: number },
      "plan_exhausted" | "conflict" | "not_available"
    >
  >;
}

export interface ObjectiveOutcomeSummary {
  /** The complete scope this observation could support if nothing narrowed it. */
  readonly supportedScope: readonly string[];
  /** Units the scorer could not interpret. A system/content state, never learner failure. */
  readonly structurallyInvalidScope: readonly string[];
}

export interface AttemptConditionSummary {
  /** Scope made unfair by a non-learner fault: media, platform, interaction partner or evaluator. */
  readonly nonLearnerFaultScope: readonly string[];
  /** Scope whose clean continuity was lost before submission. */
  readonly continuityLostScope: readonly string[];
  readonly timerIntegrity: TimerIntegrityState;
  readonly independenceClass: IndependenceClass;
}

export type PinnedContentStatus =
  | "published"
  | "quarantined_after_pin"
  | "withdrawn_after_pin"
  | "under_review";

export type InitialValidityBasis =
  | "complete_supported_scope"
  | "non_learner_fault"
  | "continuity_lost"
  | "timer_integrity_lost"
  | "response_structurally_invalid"
  | "content_interpretation_outstanding";

export interface InitialValidityDecision {
  readonly state: EvidenceValidityState;
  readonly partition: ScopePartition;
  readonly basis: InitialValidityBasis;
  /** Absent exactly when the state is `valid`: a clean claim carries no fault reason. */
  readonly reasonCode?: ReasonCode;
}

const initialValidityReasonCodes: Readonly<
  Record<Exclude<InitialValidityBasis, "complete_supported_scope">, ReasonCode>
> = {
  non_learner_fault: "FALLBACK.TECHNICAL_FAULT",
  continuity_lost: "FALLBACK.TECHNICAL_FAULT",
  timer_integrity_lost: "VALIDITY.TIMER_INTEGRITY_LOST",
  response_structurally_invalid: "VALIDITY.RESPONSE_STRUCTURALLY_INVALID",
  content_interpretation_outstanding: "VALIDITY.CONTENT_QUARANTINED_AFTER_PIN",
};

function uniqueIntersection(
  candidates: readonly string[],
  supported: ReadonlySet<string>,
): readonly string[] {
  return [...new Set(candidates.filter((entry) => supported.has(entry)))];
}

/**
 * Chooses the **initial** validity state for a freshly submitted objective attempt (D11).
 *
 * Pure by construction: it reads no clock, performs no I/O, consults no randomness, and derives
 * every answer from its three arguments. Correctness is never an input — a wrong answer at fair
 * conditions is `valid` evidence.
 *
 * Precedence on an overlapping scope is most-determined first: a proven non-learner fault
 * (`not_counted`) outranks a lost continuity claim (`interrupted`), which outranks an outstanding
 * interpretation (`pending`). A strict, non-empty subset of the supported scope yields
 * `partially_valid` when the affected part is determined, and `pending` when it is still awaiting
 * interpretation; `validateValidityPartition` then proves the partition is disjoint and exhaustive.
 */
export function classifyInitialValidity(
  outcome: ObjectiveOutcomeSummary,
  conditions: AttemptConditionSummary,
  contentStatus: PinnedContentStatus,
): Result<
  InitialValidityDecision,
  "partition_required" | "partition_overlap" | "partition_incomplete" | "supported_scope_required"
> {
  const supportedScope = [...new Set(outcome.supportedScope)];
  if (supportedScope.length === 0) return { ok: false, error: "supported_scope_required" };
  const supported = new Set(supportedScope);

  const faultScope = uniqueIntersection(conditions.nonLearnerFaultScope, supported);
  const timerLost =
    conditions.timerIntegrity === "inconsistent" || conditions.timerIntegrity === "insufficient";
  const continuityScope = uniqueIntersection(
    timerLost ? supportedScope : conditions.continuityLostScope,
    supported,
  );
  const interpretationScope = uniqueIntersection(
    contentStatus === "published"
      ? outcome.structurallyInvalidScope
      : [...outcome.structurallyInvalidScope, ...supportedScope],
    supported,
  );

  const affected = supportedScope.filter(
    (entry) =>
      faultScope.includes(entry) ||
      continuityScope.includes(entry) ||
      interpretationScope.includes(entry),
  );
  const unaffected = supportedScope.filter((entry) => !affected.includes(entry));

  if (affected.length === 0) {
    return {
      ok: true,
      value: {
        state: "valid",
        partition: { affected, unaffected },
        basis: "complete_supported_scope",
      },
    };
  }

  const basis: Exclude<InitialValidityBasis, "complete_supported_scope"> =
    faultScope.length > 0
      ? "non_learner_fault"
      : continuityScope.length > 0
        ? timerLost
          ? "timer_integrity_lost"
          : "continuity_lost"
        : contentStatus === "published"
          ? "response_structurally_invalid"
          : "content_interpretation_outstanding";
  const determined =
    basis !== "response_structurally_invalid" && basis !== "content_interpretation_outstanding";
  const partial = unaffected.length > 0;

  const state: EvidenceValidityState = partial
    ? determined
      ? "partially_valid"
      : "pending"
    : basis === "non_learner_fault"
      ? "not_counted"
      : determined
        ? "interrupted"
        : "pending";

  const partition: ScopePartition = { affected, unaffected };
  // A partition only exists to be validated when some scope survives. A whole-scope `not_counted`,
  // `interrupted` or `pending` has an empty `unaffected` by construction, and
  // `validateValidityPartition` would read that degenerate shape as a missing partition.
  if (partial) {
    const validated = validateValidityPartition(state, supportedScope, partition);
    if (!validated.ok) return validated;
  }
  return {
    ok: true,
    value: { state, partition, basis, reasonCode: initialValidityReasonCodes[basis] },
  };
}

export function validateUnsafeRequest(
  headers: Readonly<Record<string, string | undefined>>,
  expectedOrigin: string,
  csrfProofValid: boolean,
): Result<true, "origin_denied" | "fetch_metadata_denied" | "csrf_denied"> {
  if (headers.origin !== expectedOrigin) return { ok: false, error: "origin_denied" };
  if (headers["sec-fetch-site"] && headers["sec-fetch-site"] !== "same-origin") {
    return { ok: false, error: "fetch_metadata_denied" };
  }
  if (!csrfProofValid) return { ok: false, error: "csrf_denied" };
  return { ok: true, value: true };
}
