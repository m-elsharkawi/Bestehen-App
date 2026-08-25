import type {
  AppSessionRecord,
  AppSessionStore,
  BoundIdentity,
  EvidenceLedger,
  EvidenceObservation,
  IdentityDirectory,
  IdentityProof,
  OperationReceipt,
  OperationReceiptStore,
  ProjectionCandidate,
  ProjectionPublisher,
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

export class PostgresFoundationRepository
  implements
    IdentityDirectory,
    AppSessionStore,
    OperationReceiptStore,
    EvidenceLedger,
    ProjectionPublisher,
    SemanticJobStore
{
  public constructor(private readonly pool: Pool) {}

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
       WHERE cb.issuer=$1 AND cb.subject=$2 AND cb.state='active' AND psb.state='active' AND ls.state='active'`,
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
    await this.pool.query(
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
  }

  public async findByTokenDigest(tokenDigest: string): Promise<AppSessionRecord | undefined> {
    const result = await this.pool.query(
      `SELECT s.* FROM app.app_sessions s
       JOIN app.principal_scope_bindings b ON b.principal_id=s.principal_id AND b.learner_scope_id=s.learner_scope_id AND b.state='active'
       JOIN app.learner_scopes ls ON ls.id=s.learner_scope_id AND ls.state='active'
       WHERE s.token_digest=$1`,
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
      `UPDATE app.app_sessions SET last_used_at=$3,idle_expires_at=LEAST($4,absolute_expires_at)
       WHERE id=$1 AND last_used_at=$2 AND state='active'`,
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
      if (inserted.rows[0])
        return { ok: true as const, value: { disposition: "created" as const, receipt } };
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
          receipt: { ...receipt, resourceId: row.resource_ref ?? undefined },
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
      initialAssertion.observationId !== observation.id
    )
      return { ok: false as const, error: "not_available" as const };
    try {
      return await inTransaction(this.pool, async (client) => {
        const learner = await client.query(
          "SELECT next_sequence FROM app.learner_scopes WHERE id=$1 AND state='active' FOR UPDATE",
          [scope.learnerScopeId],
        );
        if (!learner.rows[0]) return { ok: false as const, error: "not_available" as const };
        const sequence = Number(learner.rows[0].next_sequence);
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
       VALUES($1,$2,$3,$4,$5,$6,$7,'reason-registry/v1',$8,'Evidence & Capability','app-principal','owner-command',$9,'evidence-contract/v1')`,
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
      ],
    );
  }

  public async appendAssertion(scope: AuthorizedScope, assertion: ValidityAssertion) {
    return inTransaction(this.pool, async (client) => {
      const current = await client.query(
        `SELECT o.current_assertion_id,a.state FROM app.evidence_observations o
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
      await this.insertAssertion(client, scope.learnerScopeId, assertion);
      await client.query(
        "UPDATE app.evidence_observations SET current_assertion_id=$2 WHERE id=$1 AND learner_scope_id=$3",
        [assertion.observationId, assertion.id, scope.learnerScopeId],
      );
      return { ok: true as const, value: assertion };
    });
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
      const generation = await client.query(
        "SELECT checksum,source_cut FROM app.projection_generations WHERE id=$1 AND learner_scope_id=$2 FOR UPDATE",
        [candidate.generationId, scope.learnerScopeId],
      );
      if (!generation.rows[0] || generation.rows[0].checksum !== candidate.checksum)
        return { ok: false as const, error: "checksum_mismatch" as const };
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
    const inserted = await this.pool.query(
      `INSERT INTO app.job_resources(id,kind,semantic_identity,state,revision,owner,actor_scope,learner_scope_id,payload_digest,contract_major,release,deadline,attempt,maximum_attempts,dependent_scope,unaffected_scope)
       VALUES($1,$2,$3,$4,$5,'foundation','worker',$6,$7,1,'job-policy/foundation-v1',$8,$9,$10,'[]','[]')
       ON CONFLICT(kind,semantic_identity) DO NOTHING RETURNING *`,
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
    if (inserted.rows[0]) return { ok: true as const, value: job };
    const existing = await this.pool.query(
      "SELECT id,payload_digest FROM app.job_resources WHERE kind=$1 AND semantic_identity=$2",
      [job.kind, job.semanticIdentity],
    );
    if (existing.rows[0]?.payload_digest === job.payloadDigest)
      return { ok: true as const, value: { ...job, id: appId<"job">(existing.rows[0].id) } };
    return { ok: false as const, error: "semantic_identity_conflict" as const };
  }

  public async transition(
    id: JobId,
    expectedRevision: number,
    state: SemanticJob["state"],
    reasonCode?: string,
  ) {
    return inTransaction(this.pool, async (client) => {
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

  public async recordEffect(id: JobId, effectIdentity: string, effectDigest: string) {
    const inserted = await this.pool.query(
      "INSERT INTO app.job_effect_receipts(job_id,effect_identity,effect_digest) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING effect_digest",
      [id, effectIdentity, effectDigest],
    );
    if (inserted.rows[0]) return { ok: true as const, value: "created" as const };
    const existing = await this.pool.query(
      "SELECT effect_digest FROM app.job_effect_receipts WHERE job_id=$1 AND effect_identity=$2",
      [id, effectIdentity],
    );
    return existing.rows[0]?.effect_digest === effectDigest
      ? { ok: true as const, value: "replayed" as const }
      : { ok: false as const, error: "effect_conflict" as const };
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
    return "created";
  });
}
