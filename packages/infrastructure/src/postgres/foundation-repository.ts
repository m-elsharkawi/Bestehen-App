import { randomUUID } from "node:crypto";
import type {
  AppSessionRecord,
  AppSessionStore,
  BoundIdentity,
  EvidenceCorrection,
  EvidenceLedger,
  EvidenceObservation,
  IdentityDirectory,
  IdentityProof,
  OperationReceipt,
  OperationReceiptStore,
  ProjectionCandidate,
  ProjectionPublisher,
  SecurityAuditEvent,
  SecurityAuditSink,
  SemanticJob,
  SemanticJobStore,
  ValidityAssertion,
} from "@bestehen/application";
import {
  type AppSessionId,
  type AuthorizedScope,
  appId,
  canTransitionEvidenceValidity,
  canTransitionSemanticJob,
  type JobId,
  type LearnerScopeId,
  type PrincipalId,
  type Result,
  validateValidityPartition,
} from "@bestehen/domain";
import type { Pool, PoolClient } from "pg";

function sessionRow(row: Record<string, unknown>): AppSessionRecord {
  return {
    id: appId<"app_session">(String(row.id)),
    tokenDigest: String(row.token_digest),
    principalId: appId<"principal">(String(row.principal_id)),
    learnerScopeId: appId<"learner_scope">(String(row.learner_scope_id)),
    state: row.state as AppSessionRecord["state"],
    createdAt: new Date(String(row.created_at)),
    lastUsedAt: new Date(String(row.last_used_at)),
    authenticatedAt: new Date(String(row.authenticated_at)),
    idleExpiresAt: new Date(String(row.idle_expires_at)),
    absoluteExpiresAt: new Date(String(row.absolute_expires_at)),
  };
}

function semanticJobFromRow(row: Record<string, unknown>): SemanticJob {
  return {
    id: appId<"job">(String(row.id)),
    learnerScopeId: appId<"learner_scope">(String(row.learner_scope_id)),
    kind: row.kind as SemanticJob["kind"],
    semanticIdentity: String(row.semantic_identity),
    state: row.state as SemanticJob["state"],
    revision: Number(row.revision),
    payloadDigest: String(row.payload_digest),
    attempt: Number(row.attempt),
    maximumAttempts: Number(row.maximum_attempts),
    deadline: new Date(String(row.deadline)),
  };
}

function operationReceiptFromRow(row: Record<string, unknown>): OperationReceipt {
  return {
    learnerScopeId: appId<"learner_scope">(String(row.learner_scope_id)),
    operationId: appId<"operation">(String(row.operation_id)),
    kind: String(row.kind),
    canonicalizationVersion: row.canonicalization_version as "canonical-json/v1",
    payloadDigest: String(row.payload_digest),
    status: row.status as OperationReceipt["status"],
    ...(row.resource_ref ? { resourceId: String(row.resource_ref) } : {}),
  };
}

async function inTransaction<T>(
  pool: Pool,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function lockActiveLearnerScope(
  client: PoolClient,
  learnerScopeId: LearnerScopeId,
): Promise<{ readonly nextSequence: number } | undefined> {
  const result = await client.query(
    `SELECT ls.next_sequence FROM app.learner_scopes ls
     WHERE ls.id=$1 AND ls.state='active'
       AND NOT EXISTS (
         SELECT 1 FROM app.learner_tombstones t
         WHERE t.learner_scope_id=ls.id AND t.state='active'
       )
     FOR UPDATE OF ls`,
    [learnerScopeId],
  );
  return result.rows[0] ? { nextSequence: Number(result.rows[0].next_sequence) } : undefined;
}

/**
 * The registry release a Stage 03 database is guaranteed to hold. `BESTEHEN_SCHEMA_MIN_REVISION`
 * still defaults to the P03 revision, so a database inside the supported window may have `v1` and
 * nothing else; defaulting to `v1.1` would violate the composite FK on
 * `app.validity_assertions(reason_registry_id, reason_code)` there.
 */
export const stage03ReasonRegistryReleaseId = "reason-registry/v1";

export class PostgresFoundationRepository
  implements
    IdentityDirectory,
    AppSessionStore,
    OperationReceiptStore,
    EvidenceLedger,
    ProjectionPublisher,
    SemanticJobStore,
    SecurityAuditSink
{
  private readonly reasonRegistryReleaseId: string;

  /**
   * `reasonRegistryReleaseId` selects which registry release an appended validity assertion cites.
   * It defaults to the Stage 03 release so every existing caller is byte-identical; a Stage 05
   * composition, whose database has run `20260901_051_content_graph`, passes
   * `reasonRegistryRelease.id` from `@bestehen/domain` so an assertion may cite a Stage 05 code —
   * `VALIDITY.CONTENT_QUARANTINED_AFTER_PIN` and its siblings exist only in `v1.1`.
   */
  public constructor(
    private readonly pool: Pool,
    reasonRegistryReleaseId: string = stage03ReasonRegistryReleaseId,
  ) {
    this.reasonRegistryReleaseId = reasonRegistryReleaseId;
  }

  public async resolve(
    proof: IdentityProof,
  ): Promise<Result<BoundIdentity, "unknown_binding" | "binding_inactive">> {
    if (!proof.emailVerified || proof.authenticationMethod !== "email_otp") {
      return { ok: false, error: "unknown_binding" };
    }
    const result = await this.pool.query(
      `SELECT cb.principal_id, psb.learner_scope_id, cb.state AS credential_state, psb.state AS scope_binding_state
       FROM app.credential_bindings cb
       JOIN app.principal_scope_bindings psb ON psb.principal_id=cb.principal_id
       JOIN app.learner_scopes ls ON ls.id=psb.learner_scope_id
       JOIN app.principals p ON p.id=cb.principal_id
       WHERE cb.issuer=$1 AND cb.subject=$2 AND cb.state='active' AND psb.state='active'
         AND p.state='active' AND p.kind='account' AND ls.state='active'
         AND NOT EXISTS (
           SELECT 1 FROM app.learner_tombstones t
           WHERE t.learner_scope_id=ls.id AND t.state='active'
         )`,
      [proof.issuer, proof.subject],
    );
    const row = result.rows[0];
    if (!row) return { ok: false, error: "unknown_binding" };
    return {
      ok: true,
      value: {
        principalId: appId<"principal">(row.principal_id),
        learnerScopeId: appId<"learner_scope">(row.learner_scope_id),
        credentialState: row.credential_state,
        scopeBindingState: row.scope_binding_state,
      },
    };
  }

  public async insert(session: AppSessionRecord): Promise<void> {
    await inTransaction(this.pool, async (client) => {
      if (!(await lockActiveLearnerScope(client, session.learnerScopeId))) {
        throw new Error("Session scope is not available");
      }
      const identity = await client.query(
        `SELECT 1 FROM app.principals p
         JOIN app.credential_bindings cb ON cb.principal_id=p.id AND cb.state='active'
         JOIN app.principal_scope_bindings b ON b.principal_id=p.id
           AND b.learner_scope_id=$2 AND b.state='active'
         WHERE p.id=$1 AND p.kind='account' AND p.state='active'
         FOR SHARE OF p,cb,b`,
        [session.principalId, session.learnerScopeId],
      );
      if (!identity.rows[0]) throw new Error("Session identity is not available");
      await client.query(
        `INSERT INTO app.app_sessions(id,token_digest,principal_id,learner_scope_id,state,created_at,last_used_at,authenticated_at,idle_expires_at,absolute_expires_at,policy_release)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'session-policy/v1')`,
        [
          session.id,
          session.tokenDigest,
          session.principalId,
          session.learnerScopeId,
          session.state,
          session.createdAt,
          session.lastUsedAt,
          session.authenticatedAt,
          session.idleExpiresAt,
          session.absoluteExpiresAt,
        ],
      );
    });
  }

  public async findByTokenDigest(tokenDigest: string): Promise<AppSessionRecord | undefined> {
    const result = await this.pool.query(
      `SELECT s.* FROM app.app_sessions s
       JOIN app.principal_scope_bindings b ON b.principal_id=s.principal_id AND b.learner_scope_id=s.learner_scope_id AND b.state='active'
       JOIN app.learner_scopes ls ON ls.id=s.learner_scope_id AND ls.state='active'
       JOIN app.principals p ON p.id=s.principal_id AND p.kind='account' AND p.state='active'
       WHERE s.token_digest=$1
         AND EXISTS (
           SELECT 1 FROM app.credential_bindings cb
           WHERE cb.principal_id=s.principal_id AND cb.state='active'
         )
         AND NOT EXISTS (
           SELECT 1 FROM app.learner_tombstones t
           WHERE t.learner_scope_id=s.learner_scope_id AND t.state='active'
         )`,
      [tokenDigest],
    );
    return result.rows[0] ? sessionRow(result.rows[0]) : undefined;
  }

  public async touch(
    id: AppSessionId,
    expectedLastUsedAt: Date,
    nextLastUsedAt: Date,
    nextIdleExpiry: Date,
  ): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE app.app_sessions s SET last_used_at=$3,idle_expires_at=LEAST($4,absolute_expires_at)
       WHERE s.id=$1 AND s.last_used_at=$2 AND s.state='active'
         AND EXISTS (
           SELECT 1 FROM app.principals p
           JOIN app.credential_bindings cb ON cb.principal_id=p.id AND cb.state='active'
           JOIN app.principal_scope_bindings b ON b.principal_id=p.id AND b.state='active'
           JOIN app.learner_scopes ls ON ls.id=b.learner_scope_id AND ls.state='active'
           WHERE p.id=s.principal_id AND p.kind='account' AND p.state='active'
             AND b.learner_scope_id=s.learner_scope_id
             AND NOT EXISTS (
               SELECT 1 FROM app.learner_tombstones t
               WHERE t.learner_scope_id=ls.id AND t.state='active'
             )
         )`,
      [id, expectedLastUsedAt, nextLastUsedAt, nextIdleExpiry],
    );
    return result.rowCount === 1;
  }

  public async revoke(id: AppSessionId, at: Date): Promise<boolean> {
    const result = await this.pool.query(
      "UPDATE app.app_sessions SET state='revoked',revoked_at=$2 WHERE id=$1 AND state='active'",
      [id, at],
    );
    return result.rowCount === 1;
  }

  public async revokeForPrincipal(
    principalId: PrincipalId,
    except: AppSessionId | undefined,
    at: Date,
  ): Promise<number> {
    const result = await this.pool.query(
      "UPDATE app.app_sessions SET state='revoked',revoked_at=$3 WHERE principal_id=$1 AND state='active' AND ($2::uuid IS NULL OR id<>$2)",
      [principalId, except ?? null, at],
    );
    return result.rowCount ?? 0;
  }

  public async claim(receipt: OperationReceipt) {
    return inTransaction(this.pool, async (client) => {
      if (!(await lockActiveLearnerScope(client, receipt.learnerScopeId))) {
        return { ok: false as const, error: "not_available" as const };
      }
      const inserted = await client.query(
        `INSERT INTO app.operation_receipts(learner_scope_id,operation_id,kind,canonicalization_version,payload_digest,status,resource_ref,expiry_class)
         VALUES($1,$2,$3,$4,$5,$6,$7,'semantic') ON CONFLICT DO NOTHING RETURNING *`,
        [
          receipt.learnerScopeId,
          receipt.operationId,
          receipt.kind,
          receipt.canonicalizationVersion,
          receipt.payloadDigest,
          receipt.status,
          receipt.resourceId ?? null,
        ],
      );
      if (inserted.rows[0]) {
        return {
          ok: true as const,
          value: {
            disposition: "created" as const,
            receipt: operationReceiptFromRow(inserted.rows[0]),
          },
        };
      }
      const existing = await client.query(
        "SELECT * FROM app.operation_receipts WHERE learner_scope_id=$1 AND operation_id=$2 AND kind=$3 FOR UPDATE",
        [receipt.learnerScopeId, receipt.operationId, receipt.kind],
      );
      const row = existing.rows[0];
      if (!row || row.payload_digest !== receipt.payloadDigest)
        return { ok: false as const, error: "idempotency_conflict" as const };
      return {
        ok: true as const,
        value: {
          disposition: "replayed" as const,
          receipt: operationReceiptFromRow(row),
        },
      };
    });
  }

  public async appendObservation(
    scope: AuthorizedScope,
    observation: EvidenceObservation,
    initialAssertion: ValidityAssertion,
  ) {
    if (
      scope.learnerScopeId !== observation.learnerScopeId ||
      initialAssertion.observationId !== observation.id ||
      !validateValidityPartition(
        initialAssertion.state,
        observation.supportedScope,
        initialAssertion.partition,
      ).ok
    )
      return { ok: false as const, error: "not_available" as const };
    try {
      return await inTransaction(this.pool, async (client) => {
        const learner = await lockActiveLearnerScope(client, scope.learnerScopeId);
        if (!learner) return { ok: false as const, error: "not_available" as const };
        const lineage = await client.query(
          `SELECT 1 FROM app.attempts a
           JOIN app.independent_occasions o ON o.id=$3 AND o.learner_scope_id=a.learner_scope_id
           WHERE a.id=$2 AND a.learner_scope_id=$1 AND a.direct_lane=$4`,
          [
            scope.learnerScopeId,
            observation.compatibility.attemptId,
            observation.compatibility.occasionId,
            observation.compatibility.directLane ?? "foundation",
          ],
        );
        if (!lineage.rows[0]) return { ok: false as const, error: "not_available" as const };
        const sequence = learner.nextSequence;
        await client.query(
          "UPDATE app.learner_scopes SET next_sequence=next_sequence+1,updated_at=transaction_timestamp() WHERE id=$1",
          [scope.learnerScopeId],
        );
        await client.query(
          `INSERT INTO app.evidence_observations(id,learner_scope_id,attempt_id,occasion_id,operation_id,direct_lane,supported_scope,outcome,conditions,evaluation,compatibility,learner_sequence,recorded_at)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,transaction_timestamp())`,
          [
            observation.id,
            observation.learnerScopeId,
            observation.compatibility.attemptId,
            observation.compatibility.occasionId,
            observation.operationId,
            observation.compatibility.directLane ?? "foundation",
            JSON.stringify(observation.supportedScope),
            "{}",
            "{}",
            "{}",
            JSON.stringify(observation.compatibility),
            sequence,
          ],
        );
        await this.insertAssertion(client, scope.learnerScopeId, initialAssertion);
        await client.query(
          "UPDATE app.evidence_observations SET current_assertion_id=$2 WHERE id=$1",
          [observation.id, initialAssertion.id],
        );
        return { ok: true as const, value: { ...observation, learnerSequence: sequence } };
      });
    } catch (error) {
      if ((error as { code?: string }).code === "23505")
        return { ok: false as const, error: "conflict" as const };
      throw error;
    }
  }

  private async insertAssertion(
    client: PoolClient,
    learnerScopeId: LearnerScopeId,
    assertion: ValidityAssertion,
  ): Promise<void> {
    await client.query(
      `INSERT INTO app.validity_assertions(id,learner_scope_id,observation_id,prior_assertion_id,state,affected_scope,unaffected_scope,reason_registry_id,reason_code,asserted_owner,actor_ref,evidence_ref,effective_at,release)
       VALUES($1,$2,$3,$4,$5,$6,$7,$10,$8,'Evidence & Capability','app-principal','owner-command',$9,'evidence-contract/v1')`,
      [
        assertion.id,
        learnerScopeId,
        assertion.observationId,
        assertion.priorAssertionId ?? null,
        assertion.state,
        JSON.stringify(assertion.partition.affected),
        JSON.stringify(assertion.partition.unaffected),
        assertion.reasonCode,
        assertion.effectiveAt,
        this.reasonRegistryReleaseId,
      ],
    );
  }

  public async appendAssertion(scope: AuthorizedScope, assertion: ValidityAssertion) {
    return inTransaction(this.pool, async (client) => {
      if (!(await lockActiveLearnerScope(client, scope.learnerScopeId))) {
        return { ok: false as const, error: "not_available" as const };
      }
      const current = await client.query(
        `SELECT o.current_assertion_id,o.supported_scope,a.state FROM app.evidence_observations o
         JOIN app.validity_assertions a ON a.id=o.current_assertion_id
         WHERE o.id=$1 AND o.learner_scope_id=$2 FOR UPDATE OF o`,
        [assertion.observationId, scope.learnerScopeId],
      );
      const row = current.rows[0];
      if (!row) return { ok: false as const, error: "not_available" as const };
      if (row.current_assertion_id !== assertion.priorAssertionId)
        return { ok: false as const, error: "conflict" as const };
      if (!canTransitionEvidenceValidity(row.state, assertion.state))
        return { ok: false as const, error: "illegal_transition" as const };
      if (!validateValidityPartition(assertion.state, row.supported_scope, assertion.partition).ok)
        return { ok: false as const, error: "illegal_transition" as const };
      await this.insertAssertion(client, scope.learnerScopeId, assertion);
      await client.query(
        "UPDATE app.evidence_observations SET current_assertion_id=$2 WHERE id=$1 AND learner_scope_id=$3",
        [assertion.observationId, assertion.id, scope.learnerScopeId],
      );
      return { ok: true as const, value: assertion };
    });
  }

  public async appendCorrection(scope: AuthorizedScope, correction: EvidenceCorrection) {
    if (
      correction.learnerScopeId !== scope.learnerScopeId ||
      (!correction.targetObservationId && !correction.targetAssertionId)
    ) {
      return { ok: false as const, error: "not_available" as const };
    }
    try {
      return await inTransaction(this.pool, async (client) => {
        if (!(await lockActiveLearnerScope(client, scope.learnerScopeId))) {
          return { ok: false as const, error: "not_available" as const };
        }
        if (correction.targetObservationId) {
          const observation = await client.query(
            "SELECT 1 FROM app.evidence_observations WHERE id=$1 AND learner_scope_id=$2",
            [correction.targetObservationId, scope.learnerScopeId],
          );
          if (!observation.rows[0]) return { ok: false as const, error: "not_available" as const };
        }
        if (correction.targetAssertionId) {
          const assertion = await client.query(
            "SELECT 1 FROM app.validity_assertions WHERE id=$1 AND learner_scope_id=$2",
            [correction.targetAssertionId, scope.learnerScopeId],
          );
          if (!assertion.rows[0]) return { ok: false as const, error: "not_available" as const };
        }
        if (correction.supersedesId) {
          const predecessor = await client.query(
            "SELECT 1 FROM app.evidence_corrections WHERE id=$1 AND learner_scope_id=$2",
            [correction.supersedesId, scope.learnerScopeId],
          );
          if (!predecessor.rows[0]) return { ok: false as const, error: "not_available" as const };
        }
        await client.query(
          `INSERT INTO app.evidence_corrections(id,learner_scope_id,operation_id,target_observation_id,target_assertion_id,selector_digest,impact_digest,reason_registry_id,reason_code,asserted_owner,requested_projections,supersedes_id,recorded_at)
           VALUES($1,$2,$3,$4,$5,$6,$7,'reason-registry/v1',$8,'Evidence & Capability',$9,$10,$11)`,
          [
            correction.id,
            correction.learnerScopeId,
            correction.operationId,
            correction.targetObservationId ?? null,
            correction.targetAssertionId ?? null,
            correction.selectorDigest,
            correction.impactDigest,
            correction.reasonCode,
            JSON.stringify(correction.requestedProjections),
            correction.supersedesId ?? null,
            correction.recordedAt,
          ],
        );
        return { ok: true as const, value: correction };
      });
    } catch (error) {
      if ((error as { code?: string }).code === "23505") {
        return { ok: false as const, error: "conflict" as const };
      }
      throw error;
    }
  }

  public async readChain(
    scope: AuthorizedScope,
    observationId: EvidenceObservation["id"],
  ): Promise<readonly ValidityAssertion[]> {
    const result = await this.pool.query(
      `SELECT a.* FROM app.validity_assertions a JOIN app.evidence_observations o ON o.id=a.observation_id
       WHERE a.observation_id=$1 AND o.learner_scope_id=$2 ORDER BY a.recorded_at,a.id`,
      [observationId, scope.learnerScopeId],
    );
    return result.rows.map((row) => ({
      id: appId<"validity_assertion">(row.id),
      observationId: appId<"evidence_observation">(row.observation_id),
      ...(row.prior_assertion_id
        ? { priorAssertionId: appId<"validity_assertion">(row.prior_assertion_id) }
        : {}),
      state: row.state,
      partition: { affected: row.affected_scope, unaffected: row.unaffected_scope },
      reasonCode: row.reason_code,
      effectiveAt: row.effective_at,
      recordedAt: row.recorded_at,
    }));
  }

  public async publish(
    scope: AuthorizedScope,
    candidate: ProjectionCandidate,
    expectedCurrentVersion: number,
  ) {
    if (candidate.learnerScopeId !== scope.learnerScopeId)
      return { ok: false as const, error: "not_available" as const };
    return inTransaction(this.pool, async (client) => {
      if (!(await lockActiveLearnerScope(client, scope.learnerScopeId))) {
        return { ok: false as const, error: "not_available" as const };
      }
      const generation = await client.query(
        `SELECT checksum,source_cut FROM app.projection_generations
         WHERE id=$1 AND learner_scope_id=$2 AND kind=$3 AND source_cut=$4 AND checksum=$5 FOR UPDATE`,
        [
          candidate.generationId,
          scope.learnerScopeId,
          candidate.kind,
          candidate.sourceCut,
          candidate.checksum,
        ],
      );
      if (!generation.rows[0]) return { ok: false as const, error: "checksum_mismatch" as const };
      const updated = await client.query(
        `INSERT INTO app.current_projection_pointers(learner_scope_id,kind,generation_id,resource_version) VALUES($1,$2,$3,1)
         ON CONFLICT(learner_scope_id,kind) DO UPDATE SET generation_id=EXCLUDED.generation_id,resource_version=app.current_projection_pointers.resource_version+1
         WHERE app.current_projection_pointers.resource_version=$4 RETURNING resource_version`,
        [scope.learnerScopeId, candidate.kind, candidate.generationId, expectedCurrentVersion],
      );
      if (!updated.rows[0]) return { ok: false as const, error: "conflict" as const };
      await client.query(
        "UPDATE app.projection_generations SET availability='current',published_at=transaction_timestamp() WHERE id=$1",
        [candidate.generationId],
      );
      return { ok: true as const, value: candidate };
    });
  }

  public async accept(job: SemanticJob) {
    return inTransaction(this.pool, async (client) => {
      if (!(await lockActiveLearnerScope(client, job.learnerScopeId))) {
        return { ok: false as const, error: "not_available" as const };
      }
      const inserted = await client.query(
        `INSERT INTO app.job_resources(id,kind,semantic_identity,state,revision,owner,actor_scope,learner_scope_id,payload_digest,contract_major,release,deadline,attempt,maximum_attempts,dependent_scope,unaffected_scope)
         VALUES($1,$2,$3,$4,$5,'foundation','worker',$6,$7,1,'job-policy/foundation-v1',$8,$9,$10,'[]','[]')
         ON CONFLICT(learner_scope_id,kind,semantic_identity) DO NOTHING RETURNING *`,
        [
          job.id,
          job.kind,
          job.semanticIdentity,
          job.state,
          job.revision,
          job.learnerScopeId,
          job.payloadDigest,
          job.deadline,
          job.attempt,
          job.maximumAttempts,
        ],
      );
      if (inserted.rows[0]) {
        return { ok: true as const, value: semanticJobFromRow(inserted.rows[0]) };
      }
      const existing = await client.query(
        `SELECT * FROM app.job_resources
         WHERE learner_scope_id=$1 AND kind=$2 AND semantic_identity=$3 FOR UPDATE`,
        [job.learnerScopeId, job.kind, job.semanticIdentity],
      );
      if (existing.rows[0]?.payload_digest === job.payloadDigest) {
        return { ok: true as const, value: semanticJobFromRow(existing.rows[0]) };
      }
      return { ok: false as const, error: "semantic_identity_conflict" as const };
    });
  }

  public async transition(
    id: JobId,
    expectedRevision: number,
    state: SemanticJob["state"],
    reasonCode?: string,
  ) {
    return inTransaction(this.pool, async (client) => {
      const owner = await client.query(
        "SELECT learner_scope_id FROM app.job_resources WHERE id=$1",
        [id],
      );
      if (!owner.rows[0]) return { ok: false as const, error: "conflict" as const };
      if (
        !(await lockActiveLearnerScope(
          client,
          appId<"learner_scope">(owner.rows[0].learner_scope_id),
        ))
      ) {
        return { ok: false as const, error: "not_available" as const };
      }
      const current = await client.query("SELECT * FROM app.job_resources WHERE id=$1 FOR UPDATE", [
        id,
      ]);
      const row = current.rows[0];
      if (!row || Number(row.revision) !== expectedRevision)
        return { ok: false as const, error: "conflict" as const };
      if (!canTransitionSemanticJob(row.state, state))
        return { ok: false as const, error: "illegal_transition" as const };
      const revision = expectedRevision + 1;
      await client.query(
        "UPDATE app.job_resources SET state=$2,revision=$3,updated_at=transaction_timestamp(),failure_reason=$4 WHERE id=$1",
        [id, state, revision, reasonCode ?? null],
      );
      await client.query(
        "INSERT INTO app.job_transitions(job_id,revision,from_state,to_state,reason_code) VALUES($1,$2,$3,$4,$5)",
        [id, revision, row.state, state, reasonCode ?? null],
      );
      return {
        ok: true as const,
        value: {
          id,
          kind: row.kind,
          semanticIdentity: row.semantic_identity,
          learnerScopeId: appId<"learner_scope">(row.learner_scope_id),
          state,
          revision,
          payloadDigest: row.payload_digest,
          attempt: row.attempt,
          maximumAttempts: row.maximum_attempts,
          deadline: row.deadline,
        },
      };
    });
  }

  public async commitFoundationEffect(
    job: SemanticJob,
    effectIdentity: string,
    effectDigest: string,
  ) {
    return inTransaction(this.pool, async (client) => {
      if (!(await lockActiveLearnerScope(client, job.learnerScopeId))) {
        return { ok: false as const, error: "not_available" as const };
      }
      const current = await client.query("SELECT * FROM app.job_resources WHERE id=$1 FOR UPDATE", [
        job.id,
      ]);
      const row = current.rows[0];
      if (
        !row ||
        row.kind !== job.kind ||
        row.semantic_identity !== job.semanticIdentity ||
        row.learner_scope_id !== job.learnerScopeId ||
        row.payload_digest !== job.payloadDigest
      ) {
        return { ok: false as const, error: "conflict" as const };
      }
      const existing = await client.query(
        "SELECT effect_digest FROM app.job_effect_receipts WHERE job_id=$1 AND effect_identity=$2",
        [job.id, effectIdentity],
      );
      if (existing.rows[0]) {
        if (existing.rows[0].effect_digest !== effectDigest) {
          return { ok: false as const, error: "effect_conflict" as const };
        }
        if (row.state !== "published") {
          return { ok: false as const, error: "conflict" as const };
        }
        return {
          ok: true as const,
          value: {
            disposition: "replayed" as const,
            job: semanticJobFromRow(row),
          },
        };
      }
      if (Number(row.revision) !== job.revision) {
        return { ok: false as const, error: "conflict" as const };
      }
      if (
        !canTransitionSemanticJob(row.state, "succeeded_candidate") ||
        !canTransitionSemanticJob("succeeded_candidate", "published")
      ) {
        return { ok: false as const, error: "illegal_transition" as const };
      }
      const candidateRevision = job.revision + 1;
      const publishedRevision = job.revision + 2;
      await client.query(
        "INSERT INTO app.job_effect_receipts(job_id,effect_identity,effect_digest) VALUES($1,$2,$3)",
        [job.id, effectIdentity, effectDigest],
      );
      await client.query(
        `INSERT INTO app.job_transitions(job_id,revision,from_state,to_state,reason_code)
         VALUES($1,$2,$3,'succeeded_candidate',NULL),($1,$4,'succeeded_candidate','published',NULL)`,
        [job.id, candidateRevision, row.state, publishedRevision],
      );
      const updated = await client.query(
        `UPDATE app.job_resources SET state='published',revision=$3,updated_at=transaction_timestamp()
         WHERE id=$1 AND revision=$2 RETURNING *`,
        [job.id, job.revision, publishedRevision],
      );
      if (!updated.rows[0]) return { ok: false as const, error: "conflict" as const };
      return {
        ok: true as const,
        value: {
          disposition: "created" as const,
          job: semanticJobFromRow(updated.rows[0]),
        },
      };
    });
  }

  public async append(event: SecurityAuditEvent): Promise<void> {
    await this.pool.query(
      `INSERT INTO app.security_audit_events(id,actor_scope,action,target_class,target_digest,outcome,reason_code,request_id,trace_id,release,recorded_at,retention_class)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'security-audit/v1',$10,'security_90d')`,
      [
        randomUUID(),
        event.actorScope,
        event.action,
        event.targetClass,
        event.targetDigest,
        event.outcome,
        event.reasonCode,
        event.requestId,
        event.traceId,
        event.recordedAt,
      ],
    );
  }
}

export interface OwnerBootstrapInput {
  readonly issuer: string;
  readonly subject: string;
  readonly subjectFingerprint: string;
  readonly allowlistReference: string;
  readonly principalId: PrincipalId;
  readonly learnerScopeId: LearnerScopeId;
  readonly credentialBindingId: string;
  readonly operationId: string;
  readonly verifiedAt: Date;
}

export async function bootstrapPersonalOwner(
  pool: Pool,
  input: OwnerBootstrapInput,
): Promise<"created" | "already_bound" | "conflict"> {
  return inTransaction(pool, async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(420103)");
    const existing = await client.query(
      "SELECT cb.issuer,cb.subject FROM app.credential_bindings cb JOIN app.principals p ON p.id=cb.principal_id WHERE p.kind='account' AND cb.state='active'",
    );
    if (existing.rows[0])
      return existing.rows[0].issuer === input.issuer && existing.rows[0].subject === input.subject
        ? "already_bound"
        : "conflict";
    await client.query("INSERT INTO app.learner_scopes(id,state) VALUES($1,'active')", [
      input.learnerScopeId,
    ]);
    await client.query("INSERT INTO app.principals(id,kind,state) VALUES($1,'account','active')", [
      input.principalId,
    ]);
    await client.query(
      "INSERT INTO app.credential_bindings(id,principal_id,kind,provider,issuer,subject,subject_fingerprint,state,verified_at,identity_release) VALUES($1,$2,'oidc','auth0',$3,$4,$5,'active',$6,'identity-contract/v1')",
      [
        input.credentialBindingId,
        input.principalId,
        input.issuer,
        input.subject,
        input.subjectFingerprint,
        input.verifiedAt,
      ],
    );
    await client.query(
      "INSERT INTO app.principal_scope_bindings(principal_id,learner_scope_id,state,operation_id) VALUES($1,$2,'active',$3)",
      [input.principalId, input.learnerScopeId, input.operationId],
    );
    await client.query(
      "INSERT INTO app.profile_facts(id,learner_scope_id,fact_kind,operation_id,learner_sequence,schema_major,payload,effective_at) VALUES($1,$2,'owner_bootstrap',$3,1,1,$4,$5)",
      [
        input.operationId,
        input.learnerScopeId,
        input.operationId,
        JSON.stringify({ allowlistReference: input.allowlistReference }),
        input.verifiedAt,
      ],
    );
    await client.query(
      "UPDATE app.learner_scopes SET next_sequence=2,updated_at=transaction_timestamp() WHERE id=$1 AND next_sequence=1",
      [input.learnerScopeId],
    );
    return "created";
  });
}
