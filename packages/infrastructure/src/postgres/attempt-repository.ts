/**
 * Attempt lifecycle, checkpoints, attempt facts, assistance, and the **evidence-proposal
 * transaction** (decision **D11**; `Architecture/15-…` §5.5, §6.1, §6.2 and `Architecture/06-…`
 * §5.2, §6.2).
 *
 * Four properties this module exists to hold, each of which is silent and expensive when wrong:
 *
 * 1. **One transaction writes the whole proposal.** {@link PostgresAttemptRepository.submitObjectiveAttempt}
 *    writes the immutable submission, the original outcome, its unit outcomes, the response,
 *    condition and exposure facts, the independent occasion, the evidence observation, its
 *    **initial** validity assertion, the attempt's terminal runtime state and the projection
 *    rebuild request in a single transaction. A partial write — an outcome with no assertion, an
 *    assertion with no outcome — is the failure mode the whole module is shaped around.
 * 2. **Correctness is never validity.** Scoring happens above this layer, in the pure
 *    `scoreObjectiveSubmission` of `@bestehen/content`; validity is chosen by the pure
 *    `classifyInitialValidity` of `@bestehen/application`. This module calls the classifier and
 *    reimplements nothing (`Architecture/15-…:444`).
 * 3. **Technical absence is not learner failure.** The scorer's `uncapturedScope` — units the
 *    system never captured — travels into the classifier as `nonLearnerFaultScope`, never as
 *    `blank`. The observation's supported scope is therefore the union of what was scored and what
 *    was lost, so a lost unit can actually be excluded instead of silently vanishing.
 * 4. **Decisive evidence is time-gated, not merely access-gated.** `Architecture/15-…:13` — the
 *    runtime "exposes decisive evidence only after the shaped submission point".
 *    {@link PostgresAttemptRepository.readDecisiveEvidence} proves the committed submission exists
 *    **before** it issues any statement naming `app.key_revisions`.
 *
 * Two things this module deliberately does not do:
 *
 * - It never scores. `@bestehen/content` is not, and may not become, a dependency of
 *   `@bestehen/infrastructure` (`scripts/check-boundaries.mjs` fixes the arrow set). The caller
 *   scores and hands the outcome here; identity (`outcomeId`) and the instant (`scoredAt`) are
 *   minted at this write site, because the scorer is pure and owns neither.
 * - It never mutates a validity assertion. There is no `UPDATE app.validity_assertions` anywhere in
 *   this file: no elapsed timer, operator edit or replacement attempt can promote a validity state,
 *   and a replacement is simply a new attempt that leaves the old attempt, submission and outcome
 *   byte-identical (`Architecture/06-…:228`).
 */

import { randomUUID } from "node:crypto";
import {
  type AttemptConditionSummary,
  classifyInitialValidity,
  type PinnedContentStatus,
} from "@bestehen/application";
import {
  type AppId,
  appId,
  type AttemptId,
  type AttemptRuntimeState,
  type AssistanceKind,
  type AssistancePhase,
  type AuthorizedScope,
  canTransitionAttemptRuntime,
  type ContentItemId,
  type ContentRevisionId,
  type EvidenceObservationId,
  type EvidenceValidityState,
  type ExposureClass,
  type IndependenceClass,
  type JobId,
  type KeyRevisionId,
  type LearnerScopeId,
  type ObjectiveOutcomeId,
  type ObjectiveUnitOutcomeKind,
  type OperationId,
  type ReasonCode,
  reasonRegistryRelease,
  type Result,
  type ServingManifestId,
  type SubmissionId,
  type ValidityAssertionId,
} from "@bestehen/domain";
import type { Pool, PoolClient } from "pg";
import { jobPolicyFor } from "../jobs/index.js";
import type { CommitDisposition } from "./content-repository.js";
import { inTransaction, lockActiveLearnerScope } from "./foundation-repository.js";

/* ------------------------------------------------------------------------------------------------
 * Errors and dispositions
 * ---------------------------------------------------------------------------------------------- */

/**
 * Why an attempt command was refused.
 *
 * `not_available` is the deliberate answer to a cross-scope or unknown reference: a caller outside
 * the scope learns nothing about whether the thing exists. `idempotency_conflict` is the answer to a
 * **conflicting reuse** of a committed operation key — never a silent overwrite, and never a
 * cheerful `replayed` for a value that does not match what actually stands.
 */
export type AttemptRepositoryError =
  | "not_available"
  | "conflict"
  | "idempotency_conflict"
  | "illegal_transition"
  | "submission_committed"
  | "partition_invalid"
  | "dangling_reference";

/** How a checkpoint was disposed of. `divergent` never overwrites: last-write-wins is forbidden. */
export type CheckpointDisposition = "accepted" | "replayed" | "stale" | "divergent";

export const attemptModalities = [
  "reading",
  "language_elements",
  "listening",
  "writing",
  "speaking",
] as const;
export type AttemptModality = (typeof attemptModalities)[number];

/**
 * The reason code an initial `valid` assertion cites.
 *
 * `classifyInitialValidity` deliberately returns **no** reason code for `valid`: a clean claim
 * carries no fault reason. `app.validity_assertions.reason_code` is `NOT NULL` with a composite
 * foreign key into `app.reason_codes`, so the row needs one anyway. This names the condition that
 * was actually satisfied — the technical preflight passed and nothing narrowed the scope — rather
 * than borrowing a fault code, and a test asserts a `valid` assertion never cites one.
 */
export const cleanEvidenceReasonCode: ReasonCode = "VALIDITY.TECHNICAL_PREFLIGHT";

/** The three attempt fact relations, as a closed map. A relation name is never interpolated. */
const factRelations = {
  response: "app.response_facts",
  condition: "app.condition_facts",
  exposure: "app.exposure_facts",
} as const;
export type AttemptFactKind = keyof typeof factRelations;

/** The runtime states from which a submission may be committed (`Architecture/15-…` §6.1). */
const submittableStates: ReadonlySet<AttemptRuntimeState> = new Set([
  "in_progress",
  "checkpointed",
  "submission_unknown",
]);

/** The `Submitted → Scoring → InterpretingEvidence → ResultAvailable` arc, walked arrow by arrow. */
const submissionArc: readonly AttemptRuntimeState[] = [
  "submitted",
  "scoring",
  "interpreting_evidence",
  "result_available",
];

/* ------------------------------------------------------------------------------------------------
 * Records
 * ---------------------------------------------------------------------------------------------- */

export interface AttemptStateRecord {
  readonly attemptId: AttemptId;
  readonly learnerScopeId: LearnerScopeId;
  readonly operationId: OperationId;
  readonly servingManifestId?: ServingManifestId;
  readonly contentRevisionId: ContentRevisionId;
  readonly modality: AttemptModality;
  readonly directLane: string;
  readonly state: AttemptRuntimeState;
  readonly resourceVersion: number;
  /** The highest checkpoint sequence accepted on any stream. `0` when none was ever accepted. */
  readonly acknowledgedCheckpointSequence: number;
}

export interface AttemptCheckpointRecord {
  readonly checkpointId: AppId<"checkpoint">;
  readonly attemptId: AttemptId;
  readonly stream: string;
  readonly sequence: number;
  readonly payloadDigest: string;
  readonly acceptedAt: Date;
}

export interface AttemptCheckpointResult {
  readonly disposition: CheckpointDisposition;
  readonly attempt: AttemptStateRecord;
  /**
   * The digest already standing at this coordinate. Present for `replayed` and, crucially, for
   * `divergent`: the caller needs both branches to let the learner resolve before submitting.
   */
  readonly storedDigest?: string;
}

export interface ObjectiveUnitOutcomeRecord {
  readonly contentItemId: ContentItemId;
  readonly kind: ObjectiveUnitOutcomeKind;
  readonly issueCode?: string;
  readonly taskRef: string;
  readonly keyRevisionId: KeyRevisionId;
}

export interface InitialValidityRecord {
  readonly assertionId: ValidityAssertionId;
  readonly observationId: EvidenceObservationId;
  readonly state: EvidenceValidityState;
  readonly affectedScope: readonly string[];
  readonly unaffectedScope: readonly string[];
  readonly reasonCode: ReasonCode;
  readonly reasonRegistryId: string;
}

/**
 * Everything the submission transaction committed.
 *
 * A retryable command that answered only "recorded" would make a genuine replay indistinguishable
 * from a resolution that reached nothing, so both `created` and `replayed` return this whole record.
 */
export interface CommittedObjectiveSubmission {
  readonly submissionId: SubmissionId;
  readonly attemptId: AttemptId;
  /** Minted here: the pure scorer owns no identity. */
  readonly outcomeId: ObjectiveOutcomeId;
  /** Minted here: the pure scorer owns no clock. One instant for the whole transaction. */
  readonly scoredAt: Date;
  readonly checksum: string;
  readonly responseDigest: string;
  readonly unitOutcomes: readonly ObjectiveUnitOutcomeRecord[];
  readonly validity: InitialValidityRecord;
  readonly learnerSequence: number;
  readonly projectionRebuildJobId: JobId;
  readonly attempt: AttemptStateRecord;
}

/** A submission command's answer: what happened, and the whole committed record either way. */
export interface SubmissionCommit {
  readonly disposition: CommitDisposition;
  readonly submission: CommittedObjectiveSubmission;
}

/** One item's decisive evidence. Reachable only after a committed submission. */
export interface DecisiveEvidenceRecord {
  readonly contentItemId: ContentItemId;
  readonly kind: ObjectiveUnitOutcomeKind;
  readonly issueCode?: string;
  readonly decisiveEvidence: unknown;
  readonly distractorRationale: unknown;
}

/* ------------------------------------------------------------------------------------------------
 * Inputs
 * ---------------------------------------------------------------------------------------------- */

export interface AttemptCreateInput {
  readonly operationId: OperationId;
  readonly attemptId: AttemptId;
  readonly servingManifestId: ServingManifestId;
  readonly sessionId: AppId<"session">;
  readonly activityOccurrenceId: AppId<"activity_occurrence">;
  readonly episodeId: AppId<"episode">;
  readonly contentRevisionId: ContentRevisionId;
  readonly modality: AttemptModality;
  readonly directLane: string;
  readonly payloadDigest: string;
  readonly occurredAt: Date;
}

export interface AttemptCheckpointInput {
  readonly operationId: OperationId;
  readonly checkpointId: AppId<"checkpoint">;
  readonly attemptId: AttemptId;
  readonly stream: string;
  readonly sequence: number;
  readonly expectedAttemptVersion: number;
  readonly payloadDigest: string;
}

export interface AssistanceEventInput {
  readonly operationId: OperationId;
  readonly assistanceEventId: AppId<"assistance_event">;
  readonly attemptId: AttemptId;
  readonly kind: AssistanceKind;
  readonly state: "offered" | "used";
  readonly phase: AssistancePhase;
  readonly affectedScope: readonly string[];
  readonly answerBearing: "yes" | "no" | "uncertain";
  readonly testedCapabilityEffect: "equivalent" | "altering" | "unverified" | "not_applicable";
  readonly policyVersion: string;
  readonly occurredAt: Date;
}

export interface AttemptFactInput {
  readonly kind: AttemptFactKind;
  readonly factId: AppId<"response_fact">;
  readonly attemptId: AttemptId;
  readonly factType: string;
  readonly envelope: unknown;
  readonly digest: string;
}

export interface ObjectiveUnitOutcomeInput {
  readonly contentItemId: ContentItemId;
  readonly kind: ObjectiveUnitOutcomeKind;
  /** Only a `structurally_invalid` unit may carry one; the relation's CHECK agrees. */
  readonly issueCode?: string;
  readonly taskRef: string;
  readonly keyRevisionId: KeyRevisionId;
}

/**
 * The scorer's `OriginalObjectiveOutcome`, minus the two fields a pure function cannot own.
 * Structurally a superset-free mirror of `@bestehen/content`'s type, restated here because the
 * boundary rules forbid `infrastructure -> content`; the field names are identical so a caller maps
 * one onto the other without translation.
 */
export interface ScoredObjectiveOutcomeInput {
  readonly algorithmVersion: string;
  readonly scoringPolicyRef: string;
  readonly formAndKeyVersions: unknown;
  readonly taskRollups: unknown;
  readonly rawOfficialConversion?: unknown;
  readonly supportedScope: readonly string[];
  readonly structurallyInvalidScope: readonly string[];
  readonly uncapturedScope: readonly string[];
  readonly checksum: string;
  readonly unitOutcomes: readonly ObjectiveUnitOutcomeInput[];
}

export interface IndependentOccasionInput {
  readonly occasionId: AppId<"independent_occasion">;
  readonly independenceClass: IndependenceClass;
  readonly familyRelation: string;
  readonly policyRelease: string;
}

/**
 * The rebuild request enqueued in the same transaction. There is deliberately no caller-supplied
 * semantic identity: it is derived from the submission id by {@link projectionRebuildIdentity}, so a
 * replay of the submission can only ever name the same job, and a caller cannot break exactly-once
 * delivery by varying it.
 */
export interface ProjectionRebuildRequest {
  readonly jobId: JobId;
  readonly payloadDigest: string;
  readonly deadline: Date;
  readonly maximumAttempts: number;
}

/** The `projection_rebuild_v1` semantic identity a submitted attempt owns. */
export function projectionRebuildIdentity(submissionId: SubmissionId): string {
  return `attempt-submission:${submissionId}`;
}

export interface ObjectiveSubmissionInput {
  readonly operationId: OperationId;
  readonly submissionId: SubmissionId;
  readonly attemptId: AttemptId;
  readonly servingManifestId: ServingManifestId;
  readonly checkpointSequence: number;
  /** The canonical response projection. Stored verbatim; this layer never reinterprets it. */
  readonly canonicalResponse: unknown;
  readonly responseDigest: string;
  readonly conditions: AttemptConditionSummary;
  readonly exposureClass?: ExposureClass;
  /** Units the system failed to capture. Absence, never `blank`. */
  readonly uncapturedItemIds: readonly ContentItemId[];
  readonly outcome: ScoredObjectiveOutcomeInput;
  readonly occasion: IndependentOccasionInput;
  readonly observationId: EvidenceObservationId;
  readonly assertionId: ValidityAssertionId;
  readonly contentStatus: PinnedContentStatus;
  readonly facts: readonly AttemptFactInput[];
  readonly projectionRebuild: ProjectionRebuildRequest;
}

/* ------------------------------------------------------------------------------------------------
 * Row mapping
 * ---------------------------------------------------------------------------------------------- */

type Row = Record<string, unknown>;

function attemptFromRow(row: Row): AttemptStateRecord {
  return {
    attemptId: appId<"attempt">(String(row.id)),
    learnerScopeId: appId<"learner_scope">(String(row.learner_scope_id)),
    operationId: appId<"operation">(String(row.operation_id)),
    ...(row.serving_manifest_id
      ? { servingManifestId: appId<"serving_manifest">(String(row.serving_manifest_id)) }
      : {}),
    contentRevisionId: appId<"content_revision">(String(row.content_revision_id)),
    modality: row.modality as AttemptModality,
    directLane: String(row.direct_lane),
    state: row.state as AttemptRuntimeState,
    resourceVersion: Number(row.resource_version),
    acknowledgedCheckpointSequence: Number(row.acknowledged_sequence ?? 0),
  };
}

/**
 * The single attempt projection.
 *
 * The acknowledged sequence is a **correlated scalar subquery**, not a `LEFT JOIN` folded into a
 * `Map`. A join would return one row per checkpoint, and building a map from those rows makes the
 * answer depend on which row the planner emitted last — a defect that is invisible until an attempt
 * has more than one checkpoint.
 */
const attemptProjection = `SELECT a.id,a.learner_scope_id,a.operation_id,a.serving_manifest_id,
    a.content_revision_id,a.modality,a.direct_lane,a.state,a.resource_version,
    COALESCE((SELECT MAX(c.sequence) FROM app.attempt_checkpoints c
               WHERE c.attempt_id=a.id AND c.learner_scope_id=a.learner_scope_id),0) AS acknowledged_sequence
   FROM app.attempts a`;

function textArray(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.map((entry) => String(entry)) : [];
}

/* ------------------------------------------------------------------------------------------------
 * Repository
 * ---------------------------------------------------------------------------------------------- */

export class PostgresAttemptRepository {
  private readonly reasonRegistryReleaseId: string;

  /**
   * `reasonRegistryReleaseId` selects which registry release an appended validity assertion cites.
   * It defaults to `reasonRegistryRelease.id` — `reason-registry/v1.1` — because every Stage 05
   * initial-validity reason code (`VALIDITY.CONTENT_QUARANTINED_AFTER_PIN`,
   * `VALIDITY.TIMER_INTEGRITY_LOST`, `VALIDITY.RESPONSE_STRUCTURALLY_INVALID`) exists **only** in
   * `v1.1`; `v1` is frozen at its 43 codes and the composite foreign key on
   * `app.validity_assertions(reason_registry_id, reason_code)` would reject them there.
   */
  public constructor(
    private readonly pool: Pool,
    reasonRegistryReleaseId: string = reasonRegistryRelease.id,
  ) {
    this.reasonRegistryReleaseId = reasonRegistryReleaseId;
  }

  /* ---------------------------------------------------------------------------------------------
   * Reads
   * ------------------------------------------------------------------------------------------- */

  public async readAttempt(
    scope: AuthorizedScope,
    attemptId: AttemptId,
  ): Promise<AttemptStateRecord | undefined> {
    const result = await this.pool.query(
      `${attemptProjection} WHERE a.learner_scope_id=$1 AND a.id=$2`,
      [scope.learnerScopeId, attemptId],
    );
    return result.rows[0] ? attemptFromRow(result.rows[0]) : undefined;
  }

  public async readAttemptByOperation(
    scope: AuthorizedScope,
    operationId: OperationId,
  ): Promise<AttemptStateRecord | undefined> {
    const result = await this.pool.query(
      `${attemptProjection} WHERE a.learner_scope_id=$1 AND a.operation_id=$2`,
      [scope.learnerScopeId, operationId],
    );
    return result.rows[0] ? attemptFromRow(result.rows[0]) : undefined;
  }

  public async readCheckpoints(
    scope: AuthorizedScope,
    attemptId: AttemptId,
  ): Promise<readonly AttemptCheckpointRecord[]> {
    const result = await this.pool.query(
      `SELECT id,attempt_id,stream,sequence,payload_digest,accepted_at
         FROM app.attempt_checkpoints WHERE learner_scope_id=$1 AND attempt_id=$2
        ORDER BY stream,sequence`,
      [scope.learnerScopeId, attemptId],
    );
    return result.rows.map((row) => ({
      checkpointId: appId<"checkpoint">(String(row.id)),
      attemptId: appId<"attempt">(String(row.attempt_id)),
      stream: String(row.stream),
      sequence: Number(row.sequence),
      payloadDigest: String(row.payload_digest),
      acceptedAt: new Date(String(row.accepted_at)),
    }));
  }

  /**
   * Whether a submission receipt is committed for this attempt.
   *
   * This is the precondition the pure `canTransitionAttemptRuntime` guard cannot express:
   * `submission_unknown → submitted` needs a committed receipt, and
   * `submission_unknown → in_progress` is legal **only** when none exists. The committed
   * `app.attempt_submissions` row *is* that receipt — it is unique per attempt, immutable, and
   * written in the same transaction as everything else the submission produced.
   */
  public async hasCommittedSubmission(
    scope: AuthorizedScope,
    attemptId: AttemptId,
  ): Promise<boolean> {
    const result = await this.pool.query(
      "SELECT 1 FROM app.attempt_submissions WHERE learner_scope_id=$1 AND attempt_id=$2",
      [scope.learnerScopeId, attemptId],
    );
    return result.rows.length > 0;
  }

  /**
   * The committed submission, its outcome, its unit outcomes and the validity assertion currently
   * standing on the observation. Returns `undefined` before the submission commits.
   *
   * The observation is correlated by the submission id carried in `compatibility`, not by
   * `attempt_id` alone. An attempt may in principle bear more than one observation, and joining on
   * the attempt would make the answer depend on which row the planner returned last.
   */
  public async readCommittedSubmission(
    scope: AuthorizedScope,
    attemptId: AttemptId,
  ): Promise<CommittedObjectiveSubmission | undefined> {
    return this.readCommittedSubmissionOn(this.pool, scope.learnerScopeId, attemptId);
  }

  private async readCommittedSubmissionOn(
    client: Pool | PoolClient,
    learnerScopeId: LearnerScopeId,
    attemptId: AttemptId,
  ): Promise<CommittedObjectiveSubmission | undefined> {
    const head = await client.query(
      `SELECT s.id AS submission_id,s.attempt_id,s.response_digest,
              o.id AS outcome_id,o.checksum,o.scored_at,
              e.id AS observation_id,e.learner_sequence,
              v.id AS assertion_id,v.state,v.affected_scope,v.unaffected_scope,
              v.reason_code,v.reason_registry_id
         FROM app.attempt_submissions s
         JOIN app.objective_outcomes o
           ON o.learner_scope_id=s.learner_scope_id AND o.submission_id=s.id
         JOIN app.evidence_observations e
           ON e.learner_scope_id=s.learner_scope_id
          AND e.attempt_id=s.attempt_id
          AND e.compatibility->>'submissionId' = s.id::text
         JOIN app.validity_assertions v
           ON v.learner_scope_id=e.learner_scope_id AND v.id=e.current_assertion_id
        WHERE s.learner_scope_id=$1 AND s.attempt_id=$2`,
      [learnerScopeId, attemptId],
    );
    const row = head.rows[0];
    if (!row) return undefined;
    const units = await client.query(
      `SELECT content_item_id,kind,issue_code,task_ref,key_revision_id
         FROM app.objective_unit_outcomes
        WHERE learner_scope_id=$1 AND outcome_id=$2 ORDER BY content_item_id`,
      [learnerScopeId, row.outcome_id],
    );
    const submissionId = appId<"submission">(String(row.submission_id));
    const job = await client.query(
      `SELECT id FROM app.job_resources
        WHERE learner_scope_id=$1 AND kind='projection_rebuild_v1' AND semantic_identity=$2`,
      [learnerScopeId, projectionRebuildIdentity(submissionId)],
    );
    const attempt = await client.query(
      `${attemptProjection} WHERE a.learner_scope_id=$1 AND a.id=$2`,
      [learnerScopeId, attemptId],
    );
    const attemptRow = attempt.rows[0];
    if (!attemptRow) return undefined;
    const jobRow = job.rows[0];
    if (!jobRow) return undefined;
    return {
      submissionId,
      attemptId: appId<"attempt">(String(row.attempt_id)),
      outcomeId: appId<"objective_outcome">(String(row.outcome_id)),
      scoredAt: new Date(String(row.scored_at)),
      checksum: String(row.checksum),
      responseDigest: String(row.response_digest),
      unitOutcomes: units.rows.map((unit) => ({
        contentItemId: appId<"content_item">(String(unit.content_item_id)),
        kind: unit.kind as ObjectiveUnitOutcomeKind,
        ...(unit.issue_code ? { issueCode: String(unit.issue_code) } : {}),
        taskRef: String(unit.task_ref),
        keyRevisionId: appId<"key_revision">(String(unit.key_revision_id)),
      })),
      validity: {
        assertionId: appId<"validity_assertion">(String(row.assertion_id)),
        observationId: appId<"evidence_observation">(String(row.observation_id)),
        state: row.state as EvidenceValidityState,
        affectedScope: textArray(row.affected_scope),
        unaffectedScope: textArray(row.unaffected_scope),
        reasonCode: String(row.reason_code) as ReasonCode,
        reasonRegistryId: String(row.reason_registry_id),
      },
      learnerSequence: Number(row.learner_sequence),
      projectionRebuildJobId: appId<"job">(String(jobRow.id)),
      attempt: attemptFromRow(attemptRow),
    };
  }

  /**
   * Decisive evidence for a submitted attempt (`Architecture/15-…:13`, §5.4).
   *
   * The gate is **time**, not merely access: the committed submission is proven to exist first, and
   * only then does any statement name `app.key_revisions`. Before the shaped submission point this
   * method issues exactly one statement, against `app.attempt_submissions`, and returns
   * `not_available` — the key relation is never reached, so there is nothing for a leak to escape
   * through.
   */
  public async readDecisiveEvidence(
    scope: AuthorizedScope,
    attemptId: AttemptId,
  ): Promise<Result<readonly DecisiveEvidenceRecord[], AttemptRepositoryError>> {
    if (!(await this.hasCommittedSubmission(scope, attemptId))) {
      return { ok: false, error: "not_available" };
    }
    const result = await this.pool.query(
      `SELECT u.content_item_id,u.kind,u.issue_code,k.decisive_evidence,k.distractor_rationale
         FROM app.objective_unit_outcomes u
         JOIN app.objective_outcomes o
           ON o.learner_scope_id=u.learner_scope_id AND o.id=u.outcome_id
         JOIN app.key_revisions k ON k.id=u.key_revision_id
        WHERE u.learner_scope_id=$1 AND o.attempt_id=$2
        ORDER BY u.content_item_id`,
      [scope.learnerScopeId, attemptId],
    );
    return {
      ok: true,
      value: result.rows.map((row) => ({
        contentItemId: appId<"content_item">(String(row.content_item_id)),
        kind: row.kind as ObjectiveUnitOutcomeKind,
        ...(row.issue_code ? { issueCode: String(row.issue_code) } : {}),
        decisiveEvidence: row.decisive_evidence,
        distractorRationale: row.distractor_rationale,
      })),
    };
  }

  /* ---------------------------------------------------------------------------------------------
   * Attempt lifecycle
   * ------------------------------------------------------------------------------------------- */

  /**
   * Creates an attempt against an already-issued serving lease.
   *
   * A reconnect can never create a second attempt: `app.attempts` is unique on
   * `(learner_scope_id, operation_id)` and the `attempt.create` receipt is claimed in the same
   * transaction. The replay comparison is deliberately **wide** — every field the input names is
   * compared against the stored row, not only the payload digest, because a reuse of the same key
   * naming a different manifest, occurrence or revision is a conflict, not a replay.
   */
  public async createAttempt(
    scope: AuthorizedScope,
    input: AttemptCreateInput,
  ): Promise<
    Result<
      { readonly disposition: CommitDisposition; readonly attempt: AttemptStateRecord },
      AttemptRepositoryError
    >
  > {
    return this.guarded<{
      readonly disposition: CommitDisposition;
      readonly attempt: AttemptStateRecord;
    }>(async () =>
      inTransaction(this.pool, async (client) => {
        if (!(await lockActiveLearnerScope(client, scope.learnerScopeId))) {
          return { ok: false as const, error: "not_available" as const };
        }
        const claimed = await client.query(
          `INSERT INTO app.operation_receipts(learner_scope_id,operation_id,kind,canonicalization_version,
             payload_digest,status,resource_ref,expiry_class)
           VALUES($1,$2,'attempt.create','canonical-json/v1',$3,'completed',$4,'semantic')
           ON CONFLICT DO NOTHING RETURNING operation_id`,
          [scope.learnerScopeId, input.operationId, input.payloadDigest, input.attemptId],
        );
        if (!claimed.rows[0]) {
          return this.replayCreate(client, scope.learnerScopeId, input);
        }
        const manifest = await client.query(
          `SELECT 1 FROM app.serving_manifests
            WHERE learner_scope_id=$1 AND id=$2 AND revocation_state='active' AND expires_at>$3`,
          [scope.learnerScopeId, input.servingManifestId, input.occurredAt],
        );
        if (!manifest.rows[0]) return { ok: false as const, error: "not_available" as const };
        await client.query(
          `INSERT INTO app.attempts(id,learner_scope_id,session_id,activity_occurrence_id,episode_id,
             content_revision_id,modality,direct_lane,state,resource_version,operation_id,occurred_at,
             serving_manifest_id)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,'ready',1,$9,$10,$11)`,
          [
            input.attemptId,
            scope.learnerScopeId,
            input.sessionId,
            input.activityOccurrenceId,
            input.episodeId,
            input.contentRevisionId,
            input.modality,
            input.directLane,
            input.operationId,
            input.occurredAt,
            input.servingManifestId,
          ],
        );
        const attempt = await this.loadAttempt(client, scope.learnerScopeId, input.attemptId);
        return attempt
          ? { ok: true as const, value: { disposition: "created" as const, attempt } }
          : { ok: false as const, error: "not_available" as const };
      }),
    );
  }

  /**
   * The replay half of {@link createAttempt}. Both the receipt and the attempt row are re-read and
   * compared field by field; anything that differs is a conflicting reuse.
   */
  private async replayCreate(
    client: PoolClient,
    learnerScopeId: LearnerScopeId,
    input: AttemptCreateInput,
  ): Promise<
    Result<
      { readonly disposition: CommitDisposition; readonly attempt: AttemptStateRecord },
      AttemptRepositoryError
    >
  > {
    const receipt = await client.query(
      `SELECT payload_digest,resource_ref FROM app.operation_receipts
        WHERE learner_scope_id=$1 AND operation_id=$2 AND kind='attempt.create' FOR UPDATE`,
      [learnerScopeId, input.operationId],
    );
    const stored = receipt.rows[0];
    if (
      !stored ||
      String(stored.payload_digest) !== input.payloadDigest ||
      String(stored.resource_ref) !== input.attemptId
    ) {
      return { ok: false, error: "idempotency_conflict" };
    }
    const existing = await client.query(
      `SELECT id,session_id,activity_occurrence_id,episode_id,content_revision_id,modality,
              direct_lane,serving_manifest_id
         FROM app.attempts WHERE learner_scope_id=$1 AND operation_id=$2`,
      [learnerScopeId, input.operationId],
    );
    const row = existing.rows[0];
    if (!row) return { ok: false, error: "conflict" };
    const mismatched =
      String(row.id) !== input.attemptId ||
      String(row.session_id) !== input.sessionId ||
      String(row.activity_occurrence_id) !== input.activityOccurrenceId ||
      String(row.episode_id) !== input.episodeId ||
      String(row.content_revision_id) !== input.contentRevisionId ||
      String(row.modality) !== input.modality ||
      String(row.direct_lane) !== input.directLane ||
      String(row.serving_manifest_id) !== input.servingManifestId;
    if (mismatched) return { ok: false, error: "idempotency_conflict" };
    const attempt = await this.loadAttempt(client, learnerScopeId, input.attemptId);
    return attempt
      ? { ok: true, value: { disposition: "replayed", attempt } }
      : { ok: false, error: "conflict" };
  }

  /**
   * Moves an attempt along exactly one arrow of `Architecture/15-…` §6.1.
   *
   * Two edges out of `submission_unknown` carry a precondition the pure guard cannot express, and
   * both are answered by a repository query rather than by an assumption:
   *
   * - `submission_unknown → submitted` requires a **committed** submission receipt. Without one the
   *   runtime would be claiming an outcome that was never written.
   * - `submission_unknown → in_progress` is legal **only** when no receipt exists. Reopening an
   *   attempt whose submission did commit would let a second submission overwrite a committed one,
   *   which is why this returns `submission_committed` instead.
   */
  public async transitionAttempt(
    scope: AuthorizedScope,
    input: {
      readonly attemptId: AttemptId;
      readonly to: AttemptRuntimeState;
      readonly expectedVersion: number;
    },
  ): Promise<Result<AttemptStateRecord, AttemptRepositoryError>> {
    return this.guarded<AttemptStateRecord>(async () =>
      inTransaction(this.pool, async (client) => {
        if (!(await lockActiveLearnerScope(client, scope.learnerScopeId))) {
          return { ok: false as const, error: "not_available" as const };
        }
        const current = await client.query(
          "SELECT state,resource_version FROM app.attempts WHERE learner_scope_id=$1 AND id=$2 FOR UPDATE",
          [scope.learnerScopeId, input.attemptId],
        );
        const row = current.rows[0];
        if (!row) return { ok: false as const, error: "not_available" as const };
        const from = row.state as AttemptRuntimeState;
        if (Number(row.resource_version) !== input.expectedVersion) {
          return { ok: false as const, error: "conflict" as const };
        }
        if (!canTransitionAttemptRuntime(from, input.to)) {
          return { ok: false as const, error: "illegal_transition" as const };
        }
        if (from === "submission_unknown") {
          const committed = await client.query(
            "SELECT 1 FROM app.attempt_submissions WHERE learner_scope_id=$1 AND attempt_id=$2",
            [scope.learnerScopeId, input.attemptId],
          );
          const hasReceipt = committed.rows.length > 0;
          if (input.to === "in_progress" && hasReceipt) {
            return { ok: false as const, error: "submission_committed" as const };
          }
          if (input.to === "submitted" && !hasReceipt) {
            return { ok: false as const, error: "conflict" as const };
          }
        }
        await client.query(
          `UPDATE app.attempts SET state=$3,resource_version=resource_version+1
            WHERE learner_scope_id=$1 AND id=$2`,
          [scope.learnerScopeId, input.attemptId, input.to],
        );
        const attempt = await this.loadAttempt(client, scope.learnerScopeId, input.attemptId);
        return attempt
          ? { ok: true as const, value: attempt }
          : { ok: false as const, error: "not_available" as const };
      }),
    );
  }

  /* ---------------------------------------------------------------------------------------------
   * Checkpoints
   * ------------------------------------------------------------------------------------------- */

  /**
   * Accepts recoverable work. **A checkpoint is not evidence** (`Architecture/15-…:282`): it is
   * mutable work replaced by a higher accepted sequence, and it never becomes a learner outcome.
   *
   * Four dispositions, and only one of them writes:
   *
   * - `replayed` — the same operation, or the same coordinate carrying the same digest. Nothing is
   *   written, so a reconnect never creates a second checkpoint or a second ordinal.
   * - `stale` — a sequence at or below the acknowledged one. Ignored, never applied backwards.
   * - `divergent` — the same coordinate carrying a **different** digest. This is a divergence, not a
   *   conflict: the stored branch is left exactly as it stands and both digests are returned so the
   *   learner resolves before submitting. Last-write-wins is forbidden; a caller preserves its own
   *   branch by re-issuing on a distinct `stream`.
   * - `accepted` — a genuinely new, higher coordinate.
   */
  public async recordCheckpoint(
    scope: AuthorizedScope,
    input: AttemptCheckpointInput,
  ): Promise<Result<AttemptCheckpointResult, AttemptRepositoryError>> {
    if (input.sequence <= 0 || input.expectedAttemptVersion <= 0) {
      return { ok: false, error: "not_available" };
    }
    return this.guarded<AttemptCheckpointResult>(async () =>
      inTransaction(this.pool, async (client) => {
        if (!(await lockActiveLearnerScope(client, scope.learnerScopeId))) {
          return { ok: false as const, error: "not_available" as const };
        }
        const attempt = await this.lockAttempt(client, scope.learnerScopeId, input.attemptId);
        if (!attempt) return { ok: false as const, error: "not_available" as const };

        const byOperation = await client.query(
          `SELECT id,attempt_id,stream,sequence,payload_digest,expected_attempt_version
             FROM app.attempt_checkpoints WHERE learner_scope_id=$1 AND operation_id=$2`,
          [scope.learnerScopeId, input.operationId],
        );
        const replay = byOperation.rows[0];
        if (replay) {
          // Every recorded field participates. A replay that agrees on the digest but names a
          // different attempt, stream or sequence is a conflicting reuse of the key, not a retry.
          const mismatched =
            String(replay.id) !== input.checkpointId ||
            String(replay.attempt_id) !== input.attemptId ||
            String(replay.stream) !== input.stream ||
            Number(replay.sequence) !== input.sequence ||
            String(replay.payload_digest) !== input.payloadDigest ||
            Number(replay.expected_attempt_version) !== input.expectedAttemptVersion;
          if (mismatched) return { ok: false as const, error: "idempotency_conflict" as const };
          return {
            ok: true as const,
            value: {
              disposition: "replayed" as const,
              attempt,
              storedDigest: String(replay.payload_digest),
            },
          };
        }

        if (attempt.resourceVersion !== input.expectedAttemptVersion) {
          return { ok: false as const, error: "conflict" as const };
        }
        if (attempt.state !== "in_progress" && attempt.state !== "checkpointed") {
          return { ok: false as const, error: "illegal_transition" as const };
        }

        const coordinate = await client.query(
          `SELECT payload_digest FROM app.attempt_checkpoints
            WHERE attempt_id=$1 AND stream=$2 AND sequence=$3`,
          [input.attemptId, input.stream, input.sequence],
        );
        const occupant = coordinate.rows[0];
        if (occupant) {
          const storedDigest = String(occupant.payload_digest);
          return {
            ok: true as const,
            value: {
              disposition:
                storedDigest === input.payloadDigest
                  ? ("replayed" as const)
                  : ("divergent" as const),
              attempt,
              storedDigest,
            },
          };
        }
        if (input.sequence <= attempt.acknowledgedCheckpointSequence) {
          return { ok: true as const, value: { disposition: "stale" as const, attempt } };
        }

        await client.query(
          `INSERT INTO app.attempt_checkpoints(id,learner_scope_id,attempt_id,stream,sequence,
             expected_attempt_version,operation_id,payload_digest)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            input.checkpointId,
            scope.learnerScopeId,
            input.attemptId,
            input.stream,
            input.sequence,
            input.expectedAttemptVersion,
            input.operationId,
            input.payloadDigest,
          ],
        );
        await client.query(
          `UPDATE app.attempts SET state='checkpointed',resource_version=resource_version+1
            WHERE learner_scope_id=$1 AND id=$2`,
          [scope.learnerScopeId, input.attemptId],
        );
        const updated = await this.loadAttempt(client, scope.learnerScopeId, input.attemptId);
        return updated
          ? { ok: true as const, value: { disposition: "accepted" as const, attempt: updated } }
          : { ok: false as const, error: "not_available" as const };
      }),
    );
  }

  /* ---------------------------------------------------------------------------------------------
   * Assistance and attempt facts
   * ------------------------------------------------------------------------------------------- */

  /**
   * Records an assistance offer or use (`Architecture/15-…` §9.1). Assistance is a **condition**,
   * never a score adjustment: nothing here touches an outcome or a validity assertion.
   *
   * `app.assistance_events` is unique on `(learner_scope_id, operation_id)`, so the replay question
   * is only whether the stored row says the same thing — and every recorded field is compared, not
   * a chosen few.
   */
  public async recordAssistance(
    scope: AuthorizedScope,
    input: AssistanceEventInput,
  ): Promise<Result<{ readonly disposition: CommitDisposition }, AttemptRepositoryError>> {
    return this.guarded<{ readonly disposition: CommitDisposition }>(async () =>
      inTransaction(this.pool, async (client) => {
        if (!(await lockActiveLearnerScope(client, scope.learnerScopeId))) {
          return { ok: false as const, error: "not_available" as const };
        }
        const inserted = await client.query(
          `INSERT INTO app.assistance_events(id,learner_scope_id,attempt_id,operation_id,kind,state,
             phase,affected_scope,answer_bearing,tested_capability_effect,policy_version,occurred_at)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           ON CONFLICT DO NOTHING RETURNING id`,
          [
            input.assistanceEventId,
            scope.learnerScopeId,
            input.attemptId,
            input.operationId,
            input.kind,
            input.state,
            input.phase,
            JSON.stringify(input.affectedScope),
            input.answerBearing,
            input.testedCapabilityEffect,
            input.policyVersion,
            input.occurredAt,
          ],
        );
        if (inserted.rows[0]) {
          return { ok: true as const, value: { disposition: "created" as const } };
        }
        const existing = await client.query(
          `SELECT id,attempt_id,kind,state,phase,affected_scope,answer_bearing,
                  tested_capability_effect,policy_version,occurred_at
             FROM app.assistance_events WHERE learner_scope_id=$1 AND operation_id=$2`,
          [scope.learnerScopeId, input.operationId],
        );
        const row = existing.rows[0];
        if (!row) return { ok: false as const, error: "conflict" as const };
        const mismatched =
          String(row.id) !== input.assistanceEventId ||
          String(row.attempt_id) !== input.attemptId ||
          String(row.kind) !== input.kind ||
          String(row.state) !== input.state ||
          String(row.phase) !== input.phase ||
          JSON.stringify(textArray(row.affected_scope)) !==
            JSON.stringify([...input.affectedScope]) ||
          String(row.answer_bearing) !== input.answerBearing ||
          String(row.tested_capability_effect) !== input.testedCapabilityEffect ||
          String(row.policy_version) !== input.policyVersion ||
          new Date(String(row.occurred_at)).getTime() !== input.occurredAt.getTime();
        return mismatched
          ? { ok: false as const, error: "idempotency_conflict" as const }
          : { ok: true as const, value: { disposition: "replayed" as const } };
      }),
    );
  }

  /**
   * Records one attempt fact outside a submission. The learner sequence is drawn under the scope
   * lock, so a reconnect returns the committed fact and never burns a second ordinal.
   */
  public async recordAttemptFact(
    scope: AuthorizedScope,
    operationId: OperationId,
    input: AttemptFactInput,
  ): Promise<
    Result<
      { readonly disposition: CommitDisposition; readonly learnerSequence: number },
      AttemptRepositoryError
    >
  > {
    return this.guarded<{
      readonly disposition: CommitDisposition;
      readonly learnerSequence: number;
    }>(async () =>
      inTransaction(this.pool, async (client) => {
        const learner = await lockActiveLearnerScope(client, scope.learnerScopeId);
        if (!learner) return { ok: false as const, error: "not_available" as const };
        const claimed = await client.query(
          `INSERT INTO app.operation_receipts(learner_scope_id,operation_id,kind,canonicalization_version,
             payload_digest,status,resource_ref,result_ref,expiry_class)
           VALUES($1,$2,$3,'canonical-json/v1',$4,'completed',$5,$6,'semantic')
           ON CONFLICT DO NOTHING RETURNING operation_id`,
          [
            scope.learnerScopeId,
            operationId,
            `attempt.fact.${input.kind}`,
            input.digest,
            input.attemptId,
            input.factId,
          ],
        );
        if (!claimed.rows[0]) {
          const receipt = await client.query(
            `SELECT payload_digest,resource_ref,result_ref FROM app.operation_receipts
              WHERE learner_scope_id=$1 AND operation_id=$2 AND kind=$3 FOR UPDATE`,
            [scope.learnerScopeId, operationId, `attempt.fact.${input.kind}`],
          );
          const stored = receipt.rows[0];
          if (
            !stored ||
            String(stored.payload_digest) !== input.digest ||
            String(stored.resource_ref) !== input.attemptId ||
            String(stored.result_ref) !== input.factId
          ) {
            return { ok: false as const, error: "idempotency_conflict" as const };
          }
          const committed = await client.query(
            `SELECT learner_sequence FROM ${factRelations[input.kind]}
              WHERE learner_scope_id=$1 AND id=$2`,
            [scope.learnerScopeId, input.factId],
          );
          const row = committed.rows[0];
          return row
            ? {
                ok: true as const,
                value: {
                  disposition: "replayed" as const,
                  learnerSequence: Number(row.learner_sequence),
                },
              }
            : { ok: false as const, error: "conflict" as const };
        }
        await this.insertFact(client, scope.learnerScopeId, input, learner.nextSequence);
        await client.query(
          "UPDATE app.learner_scopes SET next_sequence=$2,updated_at=transaction_timestamp() WHERE id=$1",
          [scope.learnerScopeId, learner.nextSequence + 1],
        );
        return {
          ok: true as const,
          value: { disposition: "created" as const, learnerSequence: learner.nextSequence },
        };
      }),
    );
  }

  private async insertFact(
    client: PoolClient,
    learnerScopeId: LearnerScopeId,
    fact: AttemptFactInput,
    learnerSequence: number,
  ): Promise<void> {
    await client.query(
      `INSERT INTO ${factRelations[fact.kind]}(id,learner_scope_id,attempt_id,fact_type,schema_major,
         envelope,digest,learner_sequence)
       VALUES($1,$2,$3,$4,1,$5,$6,$7)`,
      [
        fact.factId,
        learnerScopeId,
        fact.attemptId,
        fact.factType,
        JSON.stringify(fact.envelope ?? {}),
        fact.digest,
        learnerSequence,
      ],
    );
  }

  /* ---------------------------------------------------------------------------------------------
   * The evidence-proposal transaction
   * ------------------------------------------------------------------------------------------- */

  /**
   * Commits a submitted objective attempt: **one transaction, or nothing.**
   *
   * In order, inside a single transaction: the `attempt.submit` receipt, the immutable
   * `app.attempt_submissions` row, the `app.objective_outcomes` row (identity and `scored_at` minted
   * here), its `app.objective_unit_outcomes` rows, the response/condition/exposure facts, the
   * independent occasion, the `app.evidence_observations` row, its **initial**
   * `app.validity_assertions` row, the observation's current-assertion pointer, the
   * `Submitted → Scoring → InterpretingEvidence → ResultAvailable` arc walked arrow by arrow, and
   * the `projection_rebuild_v1` job request. Any failure rolls the whole thing back, so an outcome
   * without its assertion is not a state the database can reach.
   *
   * The validity state is chosen by `classifyInitialValidity`, which is pure and takes no
   * correctness. Two compositions happen here and are the load-bearing part of the call:
   *
   * - The observation's **supported scope** is `supportedScope ∪ uncapturedScope`. The scorer's
   *   `supportedScope` names only what it actually scored; a unit the system failed to capture is
   *   absent from it by construction. Handing the classifier only the scored units would make a
   *   lost unit vanish rather than be excluded, which is the difference between an honest partial
   *   claim and a quietly narrower one.
   * - `uncapturedScope` enters as **`nonLearnerFaultScope`**, never as `blank`. A device or capture
   *   failure is a system fault; conflating it with a deliberate empty answer turns that fault into
   *   a learner penalty.
   */
  public async submitObjectiveAttempt(
    scope: AuthorizedScope,
    input: ObjectiveSubmissionInput,
  ): Promise<Result<SubmissionCommit, AttemptRepositoryError>> {
    return this.guarded<SubmissionCommit>(async () =>
      inTransaction(this.pool, async (client) => {
        const learner = await lockActiveLearnerScope(client, scope.learnerScopeId);
        if (!learner) return { ok: false as const, error: "not_available" as const };

        const claimed = await client.query(
          `INSERT INTO app.operation_receipts(learner_scope_id,operation_id,kind,canonicalization_version,
             payload_digest,status,resource_ref,result_ref,expiry_class)
           VALUES($1,$2,'attempt.submit','canonical-json/v1',$3,'completed',$4,$5,'semantic')
           ON CONFLICT DO NOTHING RETURNING operation_id`,
          [
            scope.learnerScopeId,
            input.operationId,
            input.responseDigest,
            input.attemptId,
            input.submissionId,
          ],
        );
        if (!claimed.rows[0]) {
          return this.replaySubmission(client, scope.learnerScopeId, input);
        }

        const attempt = await this.lockAttempt(client, scope.learnerScopeId, input.attemptId);
        if (!attempt) return { ok: false as const, error: "not_available" as const };
        if (!submittableStates.has(attempt.state)) {
          return { ok: false as const, error: "illegal_transition" as const };
        }
        if (
          attempt.servingManifestId !== undefined &&
          attempt.servingManifestId !== input.servingManifestId
        ) {
          return { ok: false as const, error: "conflict" as const };
        }
        const manifest = await client.query(
          "SELECT content_release_identity FROM app.serving_manifests WHERE learner_scope_id=$1 AND id=$2",
          [scope.learnerScopeId, input.servingManifestId],
        );
        const manifestRow = manifest.rows[0];
        if (!manifestRow) return { ok: false as const, error: "not_available" as const };

        // `app.objective_outcomes.supported_scope` is CHECKed non-empty: an outcome that speaks for
        // nothing is not an outcome. An attempt whose every unit was lost has no deterministic
        // result to record and belongs on the `interrupted` arrow, not here.
        if (input.outcome.supportedScope.length === 0) {
          return { ok: false as const, error: "not_available" as const };
        }

        // The classifier runs BEFORE the first write. A refused partition must not leave a
        // half-written proposal behind, and returning early is cheaper than rolling one back.
        const uncaptured = [...new Set(input.outcome.uncapturedScope)];
        const supportedScope = [...new Set([...input.outcome.supportedScope, ...uncaptured])];
        const decision = classifyInitialValidity(
          {
            supportedScope,
            structurallyInvalidScope: input.outcome.structurallyInvalidScope,
          },
          {
            ...input.conditions,
            nonLearnerFaultScope: [
              ...new Set([...input.conditions.nonLearnerFaultScope, ...uncaptured]),
            ],
          },
          input.contentStatus,
        );
        if (!decision.ok) return { ok: false as const, error: "partition_invalid" as const };
        const validity = decision.value;

        await client.query(
          `INSERT INTO app.attempt_submissions(id,learner_scope_id,attempt_id,operation_id,
             serving_manifest_id,checkpoint_sequence,canonical_response,response_digest,conditions,
             uncaptured_item_ids,form_and_key_versions)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            input.submissionId,
            scope.learnerScopeId,
            input.attemptId,
            input.operationId,
            input.servingManifestId,
            input.checkpointSequence,
            JSON.stringify(input.canonicalResponse ?? {}),
            input.responseDigest,
            JSON.stringify({
              ...input.conditions,
              ...(input.exposureClass ? { exposureClass: input.exposureClass } : {}),
            }),
            JSON.stringify([...input.uncapturedItemIds]),
            JSON.stringify(input.outcome.formAndKeyVersions ?? {}),
          ],
        );

        // Identity and instant are minted at the write site: `scoreObjectiveSubmission` is pure and
        // deliberately returns neither an `outcomeId` nor a `scoredAt`.
        const outcomeId = appId<"objective_outcome">(randomUUID());
        const outcomeRow = await client.query(
          `INSERT INTO app.objective_outcomes(id,learner_scope_id,submission_id,attempt_id,
             algorithm_version,scoring_policy_ref,form_and_key_versions,task_rollups,
             raw_official_conversion,supported_scope,structurally_invalid_scope,uncaptured_scope,checksum)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING scored_at`,
          [
            outcomeId,
            scope.learnerScopeId,
            input.submissionId,
            input.attemptId,
            input.outcome.algorithmVersion,
            input.outcome.scoringPolicyRef,
            JSON.stringify(input.outcome.formAndKeyVersions ?? {}),
            JSON.stringify(input.outcome.taskRollups ?? []),
            input.outcome.rawOfficialConversion === undefined
              ? null
              : JSON.stringify(input.outcome.rawOfficialConversion),
            JSON.stringify([...input.outcome.supportedScope]),
            JSON.stringify([...input.outcome.structurallyInvalidScope]),
            JSON.stringify(uncaptured),
            input.outcome.checksum,
          ],
        );
        const scoredAt = new Date(String(outcomeRow.rows[0]?.scored_at));

        for (const unit of input.outcome.unitOutcomes) {
          await client.query(
            `INSERT INTO app.objective_unit_outcomes(outcome_id,learner_scope_id,content_item_id,kind,
               issue_code,task_ref,key_revision_id)
             VALUES($1,$2,$3,$4,$5,$6,$7)`,
            [
              outcomeId,
              scope.learnerScopeId,
              unit.contentItemId,
              unit.kind,
              unit.issueCode ?? null,
              unit.taskRef,
              unit.keyRevisionId,
            ],
          );
        }

        let sequence = learner.nextSequence;
        for (const fact of input.facts) {
          await this.insertFact(client, scope.learnerScopeId, fact, sequence);
          sequence += 1;
        }

        await client.query(
          `INSERT INTO app.independent_occasions(id,learner_scope_id,episode_id,independence_class,
             family_relation,policy_release)
           SELECT $1,$2,a.episode_id,$3,$4,$5 FROM app.attempts a
            WHERE a.learner_scope_id=$2 AND a.id=$6
           ON CONFLICT(id) DO NOTHING`,
          [
            input.occasion.occasionId,
            scope.learnerScopeId,
            input.occasion.independenceClass,
            input.occasion.familyRelation,
            input.occasion.policyRelease,
            input.attemptId,
          ],
        );

        const observationSequence = sequence;
        await client.query(
          `INSERT INTO app.evidence_observations(id,learner_scope_id,attempt_id,occasion_id,operation_id,
             direct_lane,supported_scope,outcome,conditions,evaluation,compatibility,learner_sequence)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            input.observationId,
            scope.learnerScopeId,
            input.attemptId,
            input.occasion.occasionId,
            input.operationId,
            attempt.directLane,
            JSON.stringify(supportedScope),
            JSON.stringify({
              outcomeId,
              checksum: input.outcome.checksum,
              taskRollups: input.outcome.taskRollups ?? [],
              scoredScope: [...input.outcome.supportedScope],
              structurallyInvalidScope: [...input.outcome.structurallyInvalidScope],
              uncapturedScope: uncaptured,
            }),
            JSON.stringify({
              ...input.conditions,
              ...(input.exposureClass ? { exposureClass: input.exposureClass } : {}),
            }),
            JSON.stringify({
              kind: "deterministic_objective",
              algorithmVersion: input.outcome.algorithmVersion,
              scoringPolicyRef: input.outcome.scoringPolicyRef,
              checksum: input.outcome.checksum,
            }),
            JSON.stringify({
              attemptId: input.attemptId,
              occasionId: input.occasion.occasionId,
              directLane: attempt.directLane,
              submissionId: input.submissionId,
              servingManifestId: input.servingManifestId,
              contentReleaseIdentity: String(manifestRow.content_release_identity),
            }),
            observationSequence,
          ],
        );
        sequence += 1;
        await client.query(
          "UPDATE app.learner_scopes SET next_sequence=$2,updated_at=transaction_timestamp() WHERE id=$1",
          [scope.learnerScopeId, sequence],
        );

        const reasonCode = validity.reasonCode ?? cleanEvidenceReasonCode;
        await client.query(
          `INSERT INTO app.validity_assertions(id,learner_scope_id,observation_id,prior_assertion_id,
             state,affected_scope,unaffected_scope,reason_registry_id,reason_code,asserted_owner,
             actor_ref,evidence_ref,effective_at,release)
           VALUES($1,$2,$3,NULL,$4,$5,$6,$7,$8,'Evidence & Capability','app-principal',
             'attempt-submission',transaction_timestamp(),'evidence-contract/v1')`,
          [
            input.assertionId,
            scope.learnerScopeId,
            input.observationId,
            validity.state,
            JSON.stringify(validity.partition.affected),
            JSON.stringify(validity.partition.unaffected),
            this.reasonRegistryReleaseId,
            reasonCode,
          ],
        );
        await client.query(
          `UPDATE app.evidence_observations SET current_assertion_id=$3
            WHERE learner_scope_id=$1 AND id=$2`,
          [scope.learnerScopeId, input.observationId, input.assertionId],
        );

        const advanced = await this.advanceThroughSubmissionArc(
          client,
          scope.learnerScopeId,
          input.attemptId,
          attempt.state,
        );
        if (!advanced) return { ok: false as const, error: "illegal_transition" as const };

        await client.query(
          `INSERT INTO app.job_resources(id,kind,semantic_identity,state,revision,owner,actor_scope,
             learner_scope_id,payload_digest,contract_major,release,deadline,attempt,maximum_attempts,
             dependent_scope,unaffected_scope)
           VALUES($1,'projection_rebuild_v1',$2,'accepted',1,'evidence','worker',$3,$4,1,$5,$6,0,$7,$8,'[]')
           ON CONFLICT(learner_scope_id,kind,semantic_identity) DO NOTHING`,
          [
            input.projectionRebuild.jobId,
            projectionRebuildIdentity(input.submissionId),
            scope.learnerScopeId,
            input.projectionRebuild.payloadDigest,
            jobPolicyFor("projection_rebuild_v1").revision,
            input.projectionRebuild.deadline,
            input.projectionRebuild.maximumAttempts,
            JSON.stringify(validity.partition.affected),
          ],
        );

        const finalAttempt = await this.loadAttempt(client, scope.learnerScopeId, input.attemptId);
        if (!finalAttempt) return { ok: false as const, error: "conflict" as const };
        return {
          ok: true as const,
          value: {
            disposition: "created" as const,
            submission: {
              submissionId: input.submissionId,
              attemptId: input.attemptId,
              outcomeId,
              scoredAt,
              checksum: input.outcome.checksum,
              responseDigest: input.responseDigest,
              unitOutcomes: input.outcome.unitOutcomes.map((unit) => ({
                contentItemId: unit.contentItemId,
                kind: unit.kind,
                ...(unit.issueCode === undefined ? {} : { issueCode: unit.issueCode }),
                taskRef: unit.taskRef,
                keyRevisionId: unit.keyRevisionId,
              })),
              validity: {
                assertionId: input.assertionId,
                observationId: input.observationId,
                state: validity.state,
                affectedScope: validity.partition.affected,
                unaffectedScope: validity.partition.unaffected,
                reasonCode,
                reasonRegistryId: this.reasonRegistryReleaseId,
              },
              learnerSequence: observationSequence,
              projectionRebuildJobId: input.projectionRebuild.jobId,
              attempt: finalAttempt,
            },
          },
        };
      }),
    );
  }

  /**
   * The replay half of {@link submitObjectiveAttempt}.
   *
   * Both the payload digest **and** the receipt's `resource_ref`/`result_ref` participate. Comparing
   * the digest alone would let a reuse of the same operation key naming a different attempt read
   * back *that* attempt's committed outcome and report it as this operation's result. The whole
   * committed record is returned, so a replay is never indistinguishable from a resolution that
   * reached nothing.
   */
  private async replaySubmission(
    client: PoolClient,
    learnerScopeId: LearnerScopeId,
    input: ObjectiveSubmissionInput,
  ): Promise<Result<SubmissionCommit, AttemptRepositoryError>> {
    const receipt = await client.query(
      `SELECT payload_digest,resource_ref,result_ref FROM app.operation_receipts
        WHERE learner_scope_id=$1 AND operation_id=$2 AND kind='attempt.submit' FOR UPDATE`,
      [learnerScopeId, input.operationId],
    );
    const stored = receipt.rows[0];
    if (
      !stored ||
      String(stored.payload_digest) !== input.responseDigest ||
      String(stored.resource_ref) !== input.attemptId ||
      String(stored.result_ref) !== input.submissionId
    ) {
      return { ok: false, error: "idempotency_conflict" };
    }
    const committed = await this.readCommittedSubmissionOn(client, learnerScopeId, input.attemptId);
    return committed
      ? { ok: true, value: { disposition: "replayed", submission: committed } }
      : { ok: false, error: "conflict" };
  }

  /** Walks `Submitted → Scoring → InterpretingEvidence → ResultAvailable`, validating each arrow. */
  private async advanceThroughSubmissionArc(
    client: PoolClient,
    learnerScopeId: LearnerScopeId,
    attemptId: AttemptId,
    from: AttemptRuntimeState,
  ): Promise<boolean> {
    let current = from;
    for (const next of submissionArc) {
      if (!canTransitionAttemptRuntime(current, next)) return false;
      current = next;
    }
    await client.query(
      `UPDATE app.attempts SET state=$3,resource_version=resource_version+1
        WHERE learner_scope_id=$1 AND id=$2`,
      [learnerScopeId, attemptId, current],
    );
    return true;
  }

  private async loadAttempt(
    client: Pool | PoolClient,
    learnerScopeId: LearnerScopeId,
    attemptId: AttemptId,
  ): Promise<AttemptStateRecord | undefined> {
    const result = await client.query(
      `${attemptProjection} WHERE a.learner_scope_id=$1 AND a.id=$2`,
      [learnerScopeId, attemptId],
    );
    return result.rows[0] ? attemptFromRow(result.rows[0]) : undefined;
  }

  /**
   * Takes the row lock on `app.attempts` with a plain statement, separate from
   * {@link attemptProjection}. Locking the projection directly would put `FOR UPDATE` on a query
   * whose target list carries a subquery, and keeping the two apart makes the lock obvious rather
   * than incidental.
   */
  private async lockAttempt(
    client: PoolClient,
    learnerScopeId: LearnerScopeId,
    attemptId: AttemptId,
  ): Promise<AttemptStateRecord | undefined> {
    const locked = await client.query(
      "SELECT 1 FROM app.attempts WHERE learner_scope_id=$1 AND id=$2 FOR UPDATE",
      [learnerScopeId, attemptId],
    );
    if (!locked.rows[0]) return undefined;
    return this.loadAttempt(client, learnerScopeId, attemptId);
  }

  /**
   * Maps the constraint violations this repository can legitimately provoke onto its own error
   * union. Anything else propagates: an unexpected database error is a defect, and swallowing it
   * into `conflict` would hide it behind a plausible-looking result.
   */
  private async guarded<T>(
    operation: () => Promise<Result<T, AttemptRepositoryError>>,
  ): Promise<Result<T, AttemptRepositoryError>> {
    try {
      return await operation();
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "23505") return { ok: false, error: "conflict" };
      if (code === "23503") return { ok: false, error: "dangling_reference" };
      if (code === "23514") return { ok: false, error: "partition_invalid" };
      throw error;
    }
  }
}
