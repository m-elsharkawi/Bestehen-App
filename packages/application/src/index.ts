import type {
  AppId,
  AppSessionId,
  AuthorizedScope,
  EvidenceObservationId,
  EvidenceValidityState,
  JobId,
  LearnerScopeId,
  OperationId,
  PrincipalId,
  Result,
  ScopePartition,
  SemanticJobState,
  ValidityAssertionId,
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
  | "rights:request";

const ownerActions: readonly AuthorizationAction[] = [
  "owner_status:read",
  "evidence:append",
  "evidence:correct",
  "projection:publish",
  "session:revoke_other",
  "rights:request",
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
      "idempotency_conflict"
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
  readonly kind: "projection_rebuild_v1" | "outbox_dispatch_v1" | "rights_reconcile_v1";
  readonly semanticIdentity: string;
  readonly state: SemanticJobState;
  readonly revision: number;
  readonly payloadDigest: string;
  readonly attempt: number;
  readonly maximumAttempts: number;
  readonly deadline: Date;
}

export interface SemanticJobStore {
  accept(job: SemanticJob): Promise<Result<SemanticJob, "semantic_identity_conflict">>;
  transition(
    id: JobId,
    expectedRevision: number,
    state: SemanticJobState,
    reasonCode?: string,
  ): Promise<Result<SemanticJob, "conflict" | "illegal_transition">>;
  commitFoundationEffect(
    job: SemanticJob,
    effectIdentity: string,
    effectDigest: string,
  ): Promise<
    Result<
      { readonly disposition: "created" | "replayed"; readonly job: SemanticJob },
      "effect_conflict" | "conflict" | "illegal_transition"
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
