import {
  type AcceptedResponse,
  assertNoKeyBearingFields,
  canonicalDigest,
  canonicalizeResponse,
  canonicalResponseDigest,
  collectSafeContentNodes,
  type Instruction,
  type ItemBinding,
  offeredIdentifiersByItemRef,
  type PinnedKey,
  parseSafeContentTree,
  type ResponseKind,
  type ResponseOperation,
  responseMechanics,
  type ScoredUnitDescriptor,
  type ScoringPolicy,
  scoreObjectiveSubmission,
  type TaskFamily,
  taskFamilyKinds,
} from "@bestehen/content";
import { allowedConditionsSchema, responseOperationSchema } from "@bestehen/contracts";
import type {
  AppId,
  AttemptId,
  AuthorizedScope,
  OperationId,
  Result,
  ServingManifestId,
  TimerIntegrityState,
} from "@bestehen/domain";
import { assistanceKinds } from "@bestehen/domain";
import type {
  AttemptCheckpointResult,
  AttemptStateRecord,
  CanonicalCheckpointRecord,
  ObjectiveSubmissionInput,
  PinnedScoringUnitRecord,
  PostgresAttemptRepository,
  PostgresContentRepository,
  RecordedAttemptConditions,
  SubmissionCommit,
} from "@bestehen/infrastructure";
import { responseFields, responseIssues, valuesFromOperations } from "../ui/objective-form";

type AttemptConditionSummary = ObjectiveSubmissionInput["conditions"];

export const objectiveScoringAlgorithmVersion = "objective-scoring/v1";

/**
 * The policy reference is immutable data. Its implementation is a closed application release map,
 * so a database row cannot invent point semantics and a deploy cannot silently reinterpret an
 * unknown reference.
 */
export function resolveScoringPolicy(reference: string): ScoringPolicy | undefined {
  if (reference !== "objective-scoring/v1") return undefined;
  return {
    scoringPolicyRef: reference,
    pointsPerCorrectUnit: 1,
    pointsPerIncorrectUnit: 0,
    pointsPerBlankUnit: 0,
    officialConversion: null,
  };
}

export type AttemptRuntimeFailure =
  | "not_available"
  | "malformed_pinned_content"
  | "checkpoint_mismatch"
  | "unsupported_scoring_policy"
  | "scoring_rejected"
  | "idempotency_conflict"
  | "conflict"
  | "illegal_transition";

export type AttemptRuntimeIdentityFactory = <Kind extends string>(
  kind: Kind,
  seed: string,
) => AppId<Kind>;

export interface AttemptRuntimeRepositories {
  readonly attempts: Pick<
    PostgresAttemptRepository,
    | "readAttempt"
    | "readSubmissionReplay"
    | "readCanonicalCheckpoint"
    | "readRecordedAttemptConditions"
    | "recordCheckpoint"
    | "recordAttemptFact"
    | "submitObjectiveAttempt"
  >;
  readonly content: Pick<
    PostgresContentRepository,
    "readPinnedLearnerMaterial" | "readPinnedScoringUnits" | "readPinnedContentStatus"
  >;
}

export interface LearnerAttemptProjection {
  readonly attempt: AttemptStateRecord;
  readonly material: {
    readonly servingManifestId: ServingManifestId;
    readonly contentRevisionId: AppId<"content_revision">;
    readonly contentFamilyId: AppId<"content_family">;
    readonly taskFamilyKind: TaskFamily["kind"];
    readonly instruction: Instruction;
    readonly learnerPayload: TaskFamily;
    readonly allowedConditions: ReturnType<typeof allowedConditionsSchema.parse>;
    readonly contentReleaseIdentity: string;
    readonly expiresAt: Date;
    readonly revocationState: "active" | "revoked_before_start" | "revoked_after_pin";
  };
}

export interface SubmitObjectiveInput {
  readonly operationId: OperationId;
  readonly attemptId: AttemptId;
  readonly checkpointSequence: number;
  readonly responseDigest: string;
  /** Browser measurements are observations only. The service derives timer integrity. */
  readonly clockObservation: {
    readonly monotonicElapsedMs: number;
    readonly visibilityChanges: number;
    readonly stallIntervals: readonly {
      readonly startedAtMs: number;
      readonly endedAtMs: number;
    }[];
    readonly wallClockSkewMs: number;
    readonly accessibilityEquivalence: "equivalent" | "claim_narrowing" | "unknown";
    readonly timeOrigin?: number;
    readonly contextStartedAt?: string;
    readonly recoveredFromAnotherContext?: boolean;
    readonly unavailable?: boolean;
  };
}

export interface CheckpointObjectiveInput {
  readonly operationId: OperationId;
  readonly attemptId: AttemptId;
  readonly expectedVersion: number;
  readonly stream: string;
  readonly sequence: number;
  readonly operations: readonly ResponseOperation[];
  readonly responseDigest: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTaskFamily(value: unknown, expectedKind: string): TaskFamily | undefined {
  if (!isRecord(value) || value.kind !== expectedKind) return undefined;
  if (!(taskFamilyKinds as readonly string[]).includes(expectedKind)) return undefined;
  try {
    const family = value as unknown as TaskFamily;
    const safe = parseSafeContentTree(collectSafeContentNodes(family), "/learnerPayload");
    return safe.ok ? family : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Pinned instructions travel alongside the learner payload, but come from a JSONB boundary.  Keep
 * the validation here so the route never turns an unrecognised persisted shape into UI markup.
 */
function parseInstruction(value: unknown): Instruction | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.instructionId !== "string" || value.instructionId.length === 0) return undefined;
  if (value.locale !== "de" && value.locale !== "en") return undefined;
  if (!Array.isArray(value.safeContentNodes)) return undefined;
  if (!(responseMechanics as readonly string[]).includes(String(value.responseMechanic))) {
    return undefined;
  }
  if (!isRecord(value.helpPolicy) || !Array.isArray(value.helpPolicy.offerableAssistanceKinds)) {
    return undefined;
  }
  if (
    value.helpPolicy.offerableAssistanceKinds.some(
      (kind) => !(assistanceKinds as readonly string[]).includes(String(kind)),
    )
  ) {
    return undefined;
  }
  if (
    value.learnerFacingTimingLabel !== null &&
    typeof value.learnerFacingTimingLabel !== "string"
  ) {
    return undefined;
  }
  const safe = parseSafeContentTree(value.safeContentNodes, "/instruction/safeContentNodes");
  return safe.ok ? (value as unknown as Instruction) : undefined;
}

function parseBinding(value: unknown): ItemBinding | undefined {
  if (!isRecord(value) || typeof value.kind !== "string") return undefined;
  if (value.kind === "select" && typeof value.questionId === "string") {
    return { kind: "select", questionId: value.questionId };
  }
  if (value.kind === "match" && typeof value.leftId === "string") {
    return { kind: "match", leftId: value.leftId };
  }
  if (value.kind === "gap" && typeof value.gapId === "string") {
    return { kind: "gap", gapId: value.gapId };
  }
  return undefined;
}

const responseKinds: ReadonlySet<string> = new Set([
  "single_select",
  "match",
  "cloze_local_option",
  "cloze_bank_candidate",
]);

function parseAcceptedResponse(value: unknown): AcceptedResponse | undefined {
  if (!isRecord(value) || typeof value.kind !== "string") return undefined;
  if (value.kind === "option" && typeof value.optionId === "string") {
    return { kind: "option", optionId: value.optionId };
  }
  if (
    value.kind === "match" &&
    typeof value.leftId === "string" &&
    typeof value.rightId === "string"
  ) {
    return { kind: "match", leftId: value.leftId, rightId: value.rightId };
  }
  if (value.kind === "no_match" && typeof value.leftId === "string") {
    return { kind: "no_match", leftId: value.leftId };
  }
  if (
    value.kind === "candidate" &&
    typeof value.gapId === "string" &&
    typeof value.candidateId === "string"
  ) {
    return { kind: "candidate", gapId: value.gapId, candidateId: value.candidateId };
  }
  return undefined;
}

function parseScoringUnit(
  record: PinnedScoringUnitRecord,
  offeredIdentifiers: readonly string[],
): { readonly unit: ScoredUnitDescriptor; readonly key: PinnedKey } | undefined {
  const scorable = record.scorable;
  const binding = parseBinding(record.binding);
  if (!binding || !isRecord(scorable)) return undefined;
  if (
    typeof scorable.responseKind !== "string" ||
    !responseKinds.has(scorable.responseKind) ||
    !isRecord(scorable.responseCardinality) ||
    typeof scorable.responseCardinality.min !== "number" ||
    typeof scorable.responseCardinality.max !== "number" ||
    !Number.isInteger(scorable.responseCardinality.min) ||
    !Number.isInteger(scorable.responseCardinality.max) ||
    scorable.responseCardinality.min < 0 ||
    scorable.responseCardinality.max < scorable.responseCardinality.min ||
    record.responseCardinality.min !== scorable.responseCardinality.min ||
    record.responseCardinality.max !== scorable.responseCardinality.max ||
    typeof scorable.keyRevisionId !== "string" ||
    scorable.keyRevisionId !== record.keyRevisionId ||
    typeof scorable.scoringPolicyRef !== "string" ||
    scorable.scoringPolicyRef !== record.scoringPolicyRef
  ) {
    return undefined;
  }
  if (!Array.isArray(record.acceptedResponseSet)) return undefined;
  const accepted = record.acceptedResponseSet.map(parseAcceptedResponse);
  if (accepted.some((entry) => entry === undefined)) return undefined;
  return {
    unit: {
      itemId: record.contentItemId,
      binding,
      responseKind: scorable.responseKind as ResponseKind,
      responseCardinality: {
        min: scorable.responseCardinality.min,
        max: scorable.responseCardinality.max,
      },
      keyRevisionId: record.keyRevisionId,
      taskRef: record.contentRevisionId,
      offeredIdentifiers,
    },
    key: {
      keyRevisionId: record.keyRevisionId,
      itemId: record.contentItemId,
      acceptedResponseSet: accepted as readonly AcceptedResponse[],
      responseCardinality: record.responseCardinality,
      scoringPolicyRef: record.scoringPolicyRef,
    },
  };
}

function parseOperations(
  checkpoint: CanonicalCheckpointRecord,
): readonly ResponseOperation[] | undefined {
  if (!Array.isArray(checkpoint.operations)) return undefined;
  const parsed = checkpoint.operations.map((operation) =>
    responseOperationSchema.safeParse(operation),
  );
  return parsed.every((entry) => entry.success)
    ? parsed.map((entry) => entry.data as ResponseOperation)
    : undefined;
}

function actualTimerIntegrity(
  attempt: AttemptStateRecord,
  now: Date,
  observation: NonNullable<RecordedAttemptConditions["clockObservation"]> | undefined,
  targetDurationMs: number | undefined,
): TimerIntegrityState {
  if (
    !attempt.occurredAt ||
    !observation ||
    observation.unavailable === true ||
    observation.recoveredFromAnotherContext === true ||
    !Number.isFinite(observation.monotonicElapsedMs) ||
    observation.monotonicElapsedMs < 0 ||
    !Number.isInteger(observation.visibilityChanges) ||
    observation.visibilityChanges < 0 ||
    !Array.isArray(observation.stallIntervals) ||
    !Number.isFinite(observation.wallClockSkewMs)
  ) {
    return "insufficient";
  }
  const serverElapsed = Math.max(0, now.getTime() - attempt.occurredAt.getTime());
  if (
    observation.contextStartedAt &&
    Math.abs(new Date(observation.contextStartedAt).getTime() - attempt.occurredAt.getTime()) >
      30_000
  ) {
    return "insufficient";
  }
  if (targetDurationMs !== undefined && serverElapsed > targetDurationMs) return "expired";
  const difference = Math.abs(serverElapsed - observation.monotonicElapsedMs);
  if (difference > 30_000 || Math.abs(observation.wallClockSkewMs) > 30_000) return "inconsistent";
  if (observation.visibilityChanges > 0 || observation.stallIntervals.length > 0) {
    return "cross_context_supported";
  }
  return "in_context_trusted";
}

function conditionsFor(
  attempt: AttemptStateRecord,
  now: Date,
  recorded: RecordedAttemptConditions,
  scope: readonly string[],
  targetDurationMs: number | undefined,
): AttemptConditionSummary {
  const timerIntegrity = actualTimerIntegrity(
    attempt,
    now,
    recorded.clockObservation,
    targetDurationMs,
  );
  const accessibilityNarrowed =
    recorded.clockObservation?.accessibilityEquivalence !== "equivalent";
  const answerBearingAssistance = recorded.assistance.flatMap((entry) =>
    entry.answerBearing === "yes" ? entry.affectedScope : [],
  );
  return {
    nonLearnerFaultScope: [
      ...new Set([
        ...(accessibilityNarrowed ? scope : []),
        ...(recorded.listening?.uncapturedItemIds ?? []),
      ]),
    ],
    continuityLostScope:
      timerIntegrity === "expired" ||
      timerIntegrity === "inconsistent" ||
      timerIntegrity === "insufficient"
        ? scope
        : [...new Set([...answerBearingAssistance, ...(recorded.listening?.alteredItemIds ?? [])])],
    timerIntegrity,
    independenceClass:
      recorded.exposureClass && recorded.exposureClass !== "unseen"
        ? "repeated_exposed_practice"
        : "first_attempt",
  };
}

function modalityFor(kind: TaskFamily["kind"]): "reading" | "language_elements" | "listening" {
  if (kind.startsWith("SB")) return "language_elements";
  if (kind.startsWith("H")) return "listening";
  return "reading";
}

export class DeterministicAttemptService {
  public constructor(
    private readonly repositories: AttemptRuntimeRepositories,
    private readonly identity: AttemptRuntimeIdentityFactory,
    private readonly now: () => Date,
  ) {}

  /** Canonicalizes and atomically records both the checkpoint coordinate and its operation fact. */
  public async checkpointObjective(
    scope: AuthorizedScope,
    input: CheckpointObjectiveInput,
  ): Promise<Result<AttemptCheckpointResult, AttemptRuntimeFailure>> {
    const parsed = input.operations.map((operation) =>
      responseOperationSchema.safeParse(operation),
    );
    if (parsed.some((entry) => !entry.success)) {
      return { ok: false, error: "checkpoint_mismatch" };
    }
    const operations = parsed.map((entry) => entry.data as ResponseOperation);
    const learner = await this.readLearnerAttempt(scope, input.attemptId);
    if (!learner.ok) return learner;
    const values = valuesFromOperations(operations);
    const fields = responseFields(learner.value.material.learnerPayload);
    if (
      Object.keys(values).some((name) => !fields.includes(name)) ||
      responseIssues(learner.value.material.learnerPayload, values).length
    ) {
      return { ok: false, error: "checkpoint_mismatch" };
    }
    const canonical = canonicalizeResponse(operations);
    if (
      canonical.issues.length > 0 ||
      canonicalResponseDigest(canonical.response) !== input.responseDigest
    ) {
      return { ok: false, error: "checkpoint_mismatch" };
    }
    const recorded = await this.repositories.attempts.recordCheckpoint(scope, {
      operationId: input.operationId,
      checkpointId: this.identity("checkpoint", `${input.operationId}:checkpoint`),
      attemptId: input.attemptId,
      stream: input.stream,
      sequence: input.sequence,
      expectedAttemptVersion: input.expectedVersion,
      payloadDigest: input.responseDigest,
      canonicalFact: {
        factId: this.identity("response_fact", `${input.operationId}:checkpoint-fact`),
        operations,
        canonicalResponse: canonical.response,
      },
    });
    if (recorded.ok) return recorded;
    return {
      ok: false,
      error:
        recorded.error === "idempotency_conflict"
          ? "idempotency_conflict"
          : recorded.error === "conflict"
            ? "conflict"
            : recorded.error === "illegal_transition"
              ? "illegal_transition"
              : "not_available",
    };
  }

  /**
   * Active-attempt projection. This path calls only learner reads and asserts the serialized object
   * has no key-bearing field before it can reach a route or client island.
   */
  public async readLearnerAttempt(
    scope: AuthorizedScope,
    attemptId: AttemptId,
  ): Promise<Result<LearnerAttemptProjection, AttemptRuntimeFailure>> {
    const attempt = await this.repositories.attempts.readAttempt(scope, attemptId);
    if (!attempt?.servingManifestId) return { ok: false, error: "not_available" };
    const material = await this.repositories.content.readPinnedLearnerMaterial(
      scope,
      attempt.servingManifestId,
    );
    if (!material) return { ok: false, error: "not_available" };
    const payload = parseTaskFamily(material.learnerPayload, material.taskFamilyKind);
    const instruction = parseInstruction(material.instruction);
    const allowed = allowedConditionsSchema.safeParse(material.manifest.allowedConditions);
    if (!payload || !instruction || !allowed.success)
      return { ok: false, error: "malformed_pinned_content" };
    if (modalityFor(payload.kind) !== attempt.modality) {
      return { ok: false, error: "malformed_pinned_content" };
    }
    const projection: LearnerAttemptProjection = {
      attempt,
      material: {
        servingManifestId: material.manifest.servingManifestId,
        contentRevisionId: material.contentRevisionId,
        contentFamilyId: material.contentFamilyId,
        taskFamilyKind: payload.kind,
        instruction,
        learnerPayload: payload,
        allowedConditions: allowed.data,
        contentReleaseIdentity: material.manifest.contentReleaseIdentity,
        expiresAt: material.manifest.expiresAt,
        revocationState: material.manifest.revocationState,
      },
    };
    assertNoKeyBearingFields(projection, "active-attempt learner projection");
    return { ok: true, value: projection };
  }

  /**
   * Composes one deterministic submission. Key material is fetched only in this shaped submit
   * method, by exact digests pinned on the manifest. The T8 repository remains the sole write owner.
   */
  public async submitObjective(
    scope: AuthorizedScope,
    input: SubmitObjectiveInput,
  ): Promise<Result<SubmissionCommit, AttemptRuntimeFailure>> {
    const replay = await this.repositories.attempts.readSubmissionReplay(scope, {
      operationId: input.operationId,
      attemptId: input.attemptId,
      submissionId: this.identity("submission", `${input.operationId}:submission`),
      responseDigest: input.responseDigest,
    });
    if (!replay.ok)
      return {
        ok: false,
        error: replay.error === "idempotency_conflict" ? "idempotency_conflict" : "not_available",
      };
    if (replay.value) return { ok: true, value: replay.value };
    const projection = await this.readLearnerAttempt(scope, input.attemptId);
    if (!projection.ok) return projection;
    const { attempt, material } = projection.value;
    const checkpoint = await this.repositories.attempts.readCanonicalCheckpoint(
      scope,
      input.attemptId,
      input.checkpointSequence,
      input.responseDigest,
    );
    if (!checkpoint) return { ok: false, error: "checkpoint_mismatch" };
    const operations = parseOperations(checkpoint);
    if (!operations) return { ok: false, error: "checkpoint_mismatch" };
    const canonical = canonicalizeResponse(operations);
    if (
      canonical.issues.length > 0 ||
      canonicalResponseDigest(canonical.response) !== input.responseDigest ||
      canonicalDigest(checkpoint.canonicalResponse) !== canonicalDigest(canonical.response)
    ) {
      return { ok: false, error: "checkpoint_mismatch" };
    }

    const clockFactId = this.identity("response_fact", `${input.operationId}:clock-observation`);
    const clockDigest = canonicalDigest(input.clockObservation);
    const clockRecorded = await this.repositories.attempts.recordAttemptFact(
      scope,
      input.operationId,
      {
        kind: "condition",
        factId: clockFactId,
        attemptId: input.attemptId,
        factType: "attempt_clock_observation_v1",
        envelope: input.clockObservation,
        digest: clockDigest,
      },
    );
    if (!clockRecorded.ok) {
      return {
        ok: false,
        error:
          clockRecorded.error === "idempotency_conflict" ? "idempotency_conflict" : "not_available",
      };
    }

    // This is the first key-bearing read on the path. It is deliberately below the committed
    // checkpoint and manifest checks, and selects by the manifest's immutable key digests.
    const storedUnits = await this.repositories.content.readPinnedScoringUnits(
      scope,
      material.servingManifestId,
    );
    if (!storedUnits) return { ok: false, error: "malformed_pinned_content" };
    const offeredByItem = offeredIdentifiersByItemRef(material.learnerPayload);
    const parsedUnits = storedUnits.map((record) =>
      parseScoringUnit(record, offeredByItem.get(record.contentItemId) ?? []),
    );
    if (parsedUnits.some((entry) => entry === undefined)) {
      return { ok: false, error: "malformed_pinned_content" };
    }
    const units = parsedUnits.map((entry) => entry?.unit as ScoredUnitDescriptor);
    const keys = parsedUnits.map((entry) => entry?.key as PinnedKey);
    const policyRefs = new Set(keys.map((key) => key.scoringPolicyRef));
    if (policyRefs.size !== 1) return { ok: false, error: "unsupported_scoring_policy" };
    const policy = resolveScoringPolicy([...policyRefs][0] ?? "");
    if (!policy) return { ok: false, error: "unsupported_scoring_policy" };

    const submissionId = this.identity("submission", `${input.operationId}:submission`);
    const recorded = await this.repositories.attempts.readRecordedAttemptConditions(
      scope,
      input.attemptId,
      clockFactId,
    );
    if (!recorded) return { ok: false, error: "not_available" };
    const uncapturedItemIds =
      attempt.modality === "listening" ? (recorded.listening?.uncapturedItemIds ?? []) : [];
    // A setup failure or whole-scope audio fault is an interruption, never an empty/zero outcome.
    if (
      attempt.modality === "listening" &&
      (!recorded.listening?.started ||
        !recorded.listening.blockComplete ||
        units.every((unit) => uncapturedItemIds.includes(unit.itemId)))
    )
      return { ok: false, error: "not_available" };
    const scored = scoreObjectiveSubmission(
      {
        submissionId,
        attemptId: input.attemptId,
        servingManifestId: material.servingManifestId,
        formAndKeyVersions: {
          formRevisionId: null,
          contentReleaseIdentity: material.contentReleaseIdentity,
          keyRevisionIds: keys.map((key) => key.keyRevisionId),
        },
        units,
        canonicalResponse: canonical.response,
        uncapturedItemIds,
        ...(material.learnerPayload.kind === "SB2SharedBankLexicalCloze"
          ? { candidateReusePolicy: material.learnerPayload.candidateReusePolicy }
          : {}),
        officialRoleContext: null,
      },
      keys,
      policy,
      objectiveScoringAlgorithmVersion,
    );
    if (!scored.ok) return { ok: false, error: "scoring_rejected" };
    // A new written submission without a server disclosure fact cannot claim first exposure.
    if (attempt.modality !== "listening" && !recorded.exposureClass)
      return { ok: false, error: "not_available" };
    const now = this.now();
    const actualConditions = conditionsFor(
      attempt,
      now,
      recorded,
      scored.value.supportedScope,
      material.allowedConditions.targetDurationMs,
    );
    const contentStatus = await this.repositories.content.readPinnedContentStatus(
      scope,
      material.servingManifestId,
    );
    if (!contentStatus) return { ok: false, error: "not_available" };
    const fallbackKey = keys[0];
    if (!fallbackKey) return { ok: false, error: "malformed_pinned_content" };
    const unitsByItem = new Map(units.map((unit) => [unit.itemId, unit]));
    if (scored.value.unitOutcomes.some((outcome) => !unitsByItem.has(outcome.itemId))) {
      return { ok: false, error: "malformed_pinned_content" };
    }
    const factBase = {
      attemptId: input.attemptId,
    } as const;
    const repositoryInput: ObjectiveSubmissionInput = {
      operationId: input.operationId,
      submissionId,
      attemptId: input.attemptId,
      servingManifestId: material.servingManifestId,
      checkpointSequence: input.checkpointSequence,
      canonicalResponse: canonical.response,
      responseDigest: input.responseDigest,
      conditions: actualConditions,
      exposureClass: recorded.exposureClass ?? "unseen",
      uncapturedItemIds,
      outcome: {
        algorithmVersion: scored.value.algorithmVersion,
        scoringPolicyRef: scored.value.scoringPolicyRef,
        formAndKeyVersions: scored.value.formAndKeyVersions,
        taskRollups: scored.value.taskRollups,
        ...(scored.value.rawOfficialConversion
          ? { rawOfficialConversion: scored.value.rawOfficialConversion }
          : {}),
        supportedScope: scored.value.supportedScope,
        structurallyInvalidScope: scored.value.structurallyInvalidScope,
        uncapturedScope: scored.value.uncapturedScope,
        checksum: scored.value.checksum,
        unitOutcomes: scored.value.unitOutcomes.map((outcome) => {
          const unit = unitsByItem.get(outcome.itemId);
          return {
            contentItemId: outcome.itemId,
            kind: outcome.kind,
            ...(outcome.kind === "structurally_invalid" ? { issueCode: outcome.issueCode } : {}),
            taskRef: unit?.taskRef ?? material.contentRevisionId,
            keyRevisionId: unit?.keyRevisionId ?? fallbackKey.keyRevisionId,
          };
        }),
      },
      occasion: {
        occasionId: this.identity("independent_occasion", `${input.operationId}:occasion`),
        independenceClass: actualConditions.independenceClass,
        familyRelation:
          actualConditions.independenceClass === "first_attempt" ? "unseen-family" : "same-family",
        policyRelease: "independence/v1",
      },
      observationId: this.identity("evidence_observation", `${input.operationId}:observation`),
      assertionId: this.identity("validity_assertion", `${input.operationId}:assertion`),
      contentStatus,
      facts: [
        {
          ...factBase,
          kind: "response",
          factId: this.identity("response_fact", `${input.operationId}:response-fact`),
          factType: "objective_submission_v1",
          envelope: {
            canonicalResponse: canonical.response,
            checkpointSequence: input.checkpointSequence,
          },
          digest: canonicalDigest({
            canonicalResponse: canonical.response,
            checkpointSequence: input.checkpointSequence,
          }),
        },
        {
          ...factBase,
          kind: "condition",
          factId: this.identity("response_fact", `${input.operationId}:condition-fact`),
          factType: "objective_conditions_v1",
          envelope: {
            ...actualConditions,
            elapsedMs: attempt.occurredAt
              ? Math.max(0, now.getTime() - attempt.occurredAt.getTime())
              : null,
          },
          digest: canonicalDigest({
            ...actualConditions,
            elapsedMs: attempt.occurredAt
              ? Math.max(0, now.getTime() - attempt.occurredAt.getTime())
              : null,
          }),
        },
        {
          ...factBase,
          kind: "exposure",
          factId: this.identity("response_fact", `${input.operationId}:exposure-fact`),
          factType: "objective_exposure_at_submission_v1",
          envelope: { exposureClass: recorded.exposureClass ?? "unseen" },
          digest: canonicalDigest({ exposureClass: recorded.exposureClass ?? "unseen" }),
        },
      ],
      projectionRebuild: {
        jobId: this.identity("job", `${input.operationId}:projection-rebuild`),
        payloadDigest: canonicalDigest({ submissionId, checksum: scored.value.checksum }),
        deadline: new Date(now.getTime() + 5 * 60_000),
        maximumAttempts: 5,
      },
    };
    const committed = await this.repositories.attempts.submitObjectiveAttempt(
      scope,
      repositoryInput,
    );
    if (committed.ok) return committed;
    if (
      committed.error === "idempotency_conflict" ||
      committed.error === "conflict" ||
      committed.error === "illegal_transition"
    ) {
      return { ok: false, error: committed.error };
    }
    return { ok: false, error: "not_available" };
  }
}
