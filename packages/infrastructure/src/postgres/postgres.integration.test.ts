import { randomUUID } from "node:crypto";
import { appId } from "@bestehen/domain";
import { withIsolatedDatabase } from "@bestehen/test-support";
import { describe, expect, it } from "vitest";
import { AesGcmSealer, HmacDigest } from "../crypto.js";
import { PostgresOidcTransactionStore } from "../identity/index.js";
import { bootstrapPersonalOwner, PostgresFoundationRepository } from "./foundation-repository.js";
import {
  checkDatabaseReadiness,
  checkSchemaCompatibility,
  createPostgresPool,
  foundationRevision,
  migrateDatabase,
  migrationChecksums,
} from "./index.js";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

const expectedAppTables = [
  "activation_manifest_units",
  "activation_manifests",
  "activity_occurrences",
  "app_sessions",
  "attempt_checkpoints",
  "attempts",
  "booking_gate_results",
  "coaching_episodes",
  "compatibility_windows",
  "condition_facts",
  "content_families",
  "content_revisions",
  "credential_bindings",
  "current_projection_pointers",
  "deletion_operations",
  "deletion_steps",
  "evidence_corrections",
  "evidence_observations",
  "export_operations",
  "exposure_facts",
  "inbox_receipts",
  "independent_occasions",
  "job_effect_receipts",
  "job_resources",
  "job_transitions",
  "learner_scopes",
  "learner_tombstones",
  "operation_receipts",
  "outbox_events",
  "oidc_transactions",
  "plan_revisions",
  "principal_scope_bindings",
  "principals",
  "profile_facts",
  "progression_profiles",
  "projection_generations",
  "projection_source_refs",
  "readiness_snapshots",
  "reason_codes",
  "reason_registry_releases",
  "release_units",
  "response_facts",
  "restore_suppression_journal",
  "review_obligations",
  "schema_revisions",
  "security_audit_events",
  "sessions",
  "validity_assertions",
  "weakness_transitions",
].sort();

describe.skipIf(!testDatabaseUrl)("PostgreSQL 18 Stage 03 foundation", () => {
  it("migrates baseline concurrently to the exact checksummed foundation and installs pg-boss only through the migrator", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      const [first, concurrent] = await Promise.all([
        migrateDatabase(databaseUrl),
        migrateDatabase(databaseUrl),
      ]);
      expect([first.toRevision, concurrent.toRevision]).toEqual([
        foundationRevision,
        foundationRevision,
      ]);
      expect([...first.applied, ...concurrent.applied].sort()).toEqual(
        Object.keys(migrationChecksums).sort(),
      );

      const pool = createPostgresPool(databaseUrl);
      const tables = await pool.query<{ table_name: string }>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='app' ORDER BY table_name",
      );
      expect(tables.rows.map((row) => row.table_name)).toEqual(expectedAppTables);
      const pgBoss = await pool.query<{ version: number }>("SELECT version FROM pgboss.version");
      expect(Number(pgBoss.rows[0]?.version)).toBeGreaterThan(0);
      await expect(
        checkSchemaCompatibility(pool, foundationRevision, foundationRevision),
      ).resolves.toMatchObject({ compatible: true, observedRevision: foundationRevision });
      const latest = await migrateDatabase(databaseUrl);
      expect(latest.applied).toEqual([]);
      await pool.end();
    });
  });

  it("fails readiness closed for revision/checksum drift and recovers through a new pool", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      await migrateDatabase(databaseUrl);
      const pool = createPostgresPool(databaseUrl);
      await expect(checkSchemaCompatibility(pool, "future", "future")).resolves.toMatchObject({
        compatible: false,
        observedRevision: foundationRevision,
      });
      await pool.query(
        "UPDATE app.schema_revisions SET checksum=repeat('f',64) WHERE revision=$1",
        [foundationRevision],
      );
      await expect(
        checkSchemaCompatibility(pool, foundationRevision, foundationRevision),
      ).resolves.toMatchObject({ compatible: false, observedRevision: "drifted" });
      await pool.query("UPDATE app.schema_revisions SET checksum=$2 WHERE revision=$1", [
        foundationRevision,
        migrationChecksums[foundationRevision],
      ]);
      await pool.end();
      await expect(
        checkDatabaseReadiness(pool, foundationRevision, foundationRevision),
      ).resolves.toMatchObject({ connected: false, compatible: false });
      const recovered = createPostgresPool(databaseUrl);
      await expect(
        checkDatabaseReadiness(recovered, foundationRevision, foundationRevision),
      ).resolves.toMatchObject({ connected: true, compatible: true });
      await recovered.end();
    });
  });

  it("binds exactly one owner, isolates two synthetic scopes, and makes receipts idempotent", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      await migrateDatabase(databaseUrl);
      const pool = createPostgresPool(databaseUrl);
      const repository = new PostgresFoundationRepository(pool);
      const owner = {
        principalId: appId<"principal">(randomUUID()),
        learnerScopeId: appId<"learner_scope">(randomUUID()),
      };
      const attacker = {
        principalId: appId<"principal">(randomUUID()),
        learnerScopeId: appId<"learner_scope">(randomUUID()),
      };
      const issuer = "https://synthetic.eu.auth0.com/";
      const subject = "synthetic-owner-subject";
      const operationId = randomUUID();
      const ownerInput = {
        ...owner,
        issuer,
        subject,
        subjectFingerprint: "a".repeat(64),
        allowlistReference: "protected-owner-ref",
        credentialBindingId: randomUUID(),
        operationId,
        verifiedAt: new Date("2026-08-25T12:00:00.000Z"),
      };
      await expect(bootstrapPersonalOwner(pool, ownerInput)).resolves.toBe("created");
      await expect(bootstrapPersonalOwner(pool, ownerInput)).resolves.toBe("already_bound");
      await expect(
        bootstrapPersonalOwner(pool, {
          ...ownerInput,
          ...attacker,
          subject: "different-subject",
          subjectFingerprint: "b".repeat(64),
          credentialBindingId: randomUUID(),
          operationId: randomUUID(),
        }),
      ).resolves.toBe("conflict");

      await pool.query("INSERT INTO app.learner_scopes(id,state) VALUES($1,'active')", [
        attacker.learnerScopeId,
      ]);
      await pool.query("INSERT INTO app.principals(id,kind,state) VALUES($1,'guest','active')", [
        attacker.principalId,
      ]);
      await pool.query(
        "INSERT INTO app.principal_scope_bindings(principal_id,learner_scope_id,state,operation_id) VALUES($1,$2,'active',$3)",
        [attacker.principalId, attacker.learnerScopeId, randomUUID()],
      );

      const proof = {
        issuer,
        subject,
        emailVerified: true,
        authenticationTime: new Date("2026-08-25T12:00:00.000Z"),
        authenticationMethod: "email_otp" as const,
      };
      await expect(repository.resolve(proof)).resolves.toMatchObject({ ok: true, value: owner });
      await expect(repository.resolve({ ...proof, subject: "unknown" })).resolves.toEqual({
        ok: false,
        error: "unknown_binding",
      });

      const sessionSecret = "synthetic-session-secret-at-least-thirty-two-bytes";
      const sessionDigest = new HmacDigest(sessionSecret);
      const ownerToken = "synthetic-owner-opaque-token";
      const attackerToken = "synthetic-attacker-opaque-token";
      const sessionTime = new Date("2026-08-25T12:05:00.000Z");
      const sessionExpiry = new Date("2026-08-26T12:05:00.000Z");
      const absoluteExpiry = new Date("2026-09-01T12:05:00.000Z");
      const ownerSession = {
        id: appId<"app_session">(randomUUID()),
        tokenDigest: sessionDigest.digest("app-session", ownerToken),
        ...owner,
        state: "active" as const,
        createdAt: sessionTime,
        lastUsedAt: sessionTime,
        authenticatedAt: sessionTime,
        idleExpiresAt: sessionExpiry,
        absoluteExpiresAt: absoluteExpiry,
      };
      const attackerSession = {
        ...ownerSession,
        id: appId<"app_session">(randomUUID()),
        tokenDigest: sessionDigest.digest("app-session", attackerToken),
        ...attacker,
      };
      await repository.insert(ownerSession);
      await repository.insert(attackerSession);
      await expect(repository.findByTokenDigest(ownerSession.tokenDigest)).resolves.toMatchObject({
        id: ownerSession.id,
        learnerScopeId: owner.learnerScopeId,
      });
      await expect(
        repository.findByTokenDigest(attackerSession.tokenDigest),
      ).resolves.toMatchObject({
        id: attackerSession.id,
        learnerScopeId: attacker.learnerScopeId,
      });
      await expect(
        repository.findByTokenDigest(sessionDigest.digest("app-session", "swapped")),
      ).resolves.toBeUndefined();
      const storedSession = await pool.query<{ token_digest: string }>(
        "SELECT token_digest FROM app.app_sessions WHERE id=$1",
        [ownerSession.id],
      );
      expect(storedSession.rows[0]?.token_digest).toBe(ownerSession.tokenDigest);
      expect(storedSession.rows[0]?.token_digest).not.toContain(ownerToken);
      await expect(repository.revoke(ownerSession.id, sessionTime)).resolves.toBe(true);
      await expect(repository.findByTokenDigest(ownerSession.tokenDigest)).resolves.toMatchObject({
        state: "revoked",
      });

      const transactionStore = new PostgresOidcTransactionStore(
        pool,
        sessionDigest,
        new AesGcmSealer(sessionSecret),
      );
      const oidcState = "synthetic-state";
      const oidcNonce = "synthetic-nonce";
      const pkceVerifier = "synthetic-recoverable-pkce-verifier";
      const sealer = new AesGcmSealer(sessionSecret);
      await transactionStore.insert({
        transactionDigest: sessionDigest.digest("oidc-transaction", oidcState),
        stateDigest: sessionDigest.digest("oidc-state", oidcState),
        nonceDigest: sessionDigest.digest("oidc-nonce", oidcNonce),
        verifierAndNonceSealed: sealer.seal(
          "oidc-pkce",
          JSON.stringify({ nonce: oidcNonce, pkceVerifier }),
        ),
        returnPath: "/synthetic-draft?preserved=1",
        createdAt: sessionTime,
        expiresAt: new Date(sessionTime.getTime() + 10 * 60 * 1000),
      });
      await expect(
        transactionStore.consume(oidcState, new Date(sessionTime.getTime() + 1_000)),
      ).resolves.toMatchObject({
        ok: true,
        value: { nonce: oidcNonce, pkceVerifier, returnPath: "/synthetic-draft?preserved=1" },
      });
      await expect(
        transactionStore.consume(oidcState, new Date(sessionTime.getTime() + 2_000)),
      ).resolves.toEqual({ ok: false, error: "transaction_missing" });

      const planRevisionId = randomUUID();
      const productSessionId = randomUUID();
      const occurrenceId = randomUUID();
      const episodeId = randomUUID();
      const contentFamilyId = randomUUID();
      const contentRevisionId = randomUUID();
      const attemptId = randomUUID();
      const occasionId = randomUUID();
      await pool.query(
        "INSERT INTO app.content_families(id,family_key) VALUES($1,'synthetic-family')",
        [contentFamilyId],
      );
      await pool.query(
        `INSERT INTO app.content_revisions(id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest)
         VALUES($1,$2,'synthetic-v1','task','approved','eligible','compatible',$3)`,
        [contentRevisionId, contentFamilyId, "1".repeat(64)],
      );
      await pool.query(
        `INSERT INTO app.plan_revisions(id,learner_scope_id,source_cut,policy_release,reason_release,template_release,content_release,intents,reasons,checksum)
         VALUES($1,$2,1,'policy/foundation','reason-registry/v1','template/foundation','content/synthetic','[]','[]',$3)`,
        [planRevisionId, owner.learnerScopeId, "2".repeat(64)],
      );
      await pool.query(
        "INSERT INTO app.sessions(id,learner_scope_id,plan_revision_id,state) VALUES($1,$2,$3,'active')",
        [productSessionId, owner.learnerScopeId, planRevisionId],
      );
      await pool.query(
        `INSERT INTO app.activity_occurrences(id,learner_scope_id,session_id,operation_id,state,resource_version)
         VALUES($1,$2,$3,$4,'completed',1)`,
        [occurrenceId, owner.learnerScopeId, productSessionId, randomUUID()],
      );
      await pool.query(
        `INSERT INTO app.coaching_episodes(id,learner_scope_id,activity_occurrence_id,state,resource_version)
         VALUES($1,$2,$3,'completed',1)`,
        [episodeId, owner.learnerScopeId, occurrenceId],
      );
      await pool.query(
        `INSERT INTO app.attempts(id,learner_scope_id,session_id,activity_occurrence_id,episode_id,content_revision_id,modality,direct_lane,state,operation_id)
         VALUES($1,$2,$3,$4,$5,$6,'writing','written','completed',$7)`,
        [
          attemptId,
          owner.learnerScopeId,
          productSessionId,
          occurrenceId,
          episodeId,
          contentRevisionId,
          randomUUID(),
        ],
      );
      await pool.query(
        `INSERT INTO app.independent_occasions(id,learner_scope_id,episode_id,independence_class,family_relation,policy_release)
         VALUES($1,$2,$3,'first_attempt','same-family','independence/foundation')`,
        [occasionId, owner.learnerScopeId, episodeId],
      );
      const observationId = appId<"evidence_observation">(randomUUID());
      const firstAssertionId = appId<"validity_assertion">(randomUUID());
      const observation = {
        id: observationId,
        learnerScopeId: owner.learnerScopeId,
        operationId: appId<"operation">(randomUUID()),
        learnerSequence: 0,
        supportedScope: ["written", "oral"],
        recordedAt: sessionTime,
        compatibility: { attemptId, occasionId, directLane: "written" },
      };
      const firstAssertion = {
        id: firstAssertionId,
        observationId,
        state: "valid" as const,
        partition: { affected: [] as string[], unaffected: ["written", "oral"] },
        reasonCode: "VALIDITY.TECHNICAL_PREFLIGHT",
        effectiveAt: sessionTime,
        recordedAt: sessionTime,
      };
      const ownerScope = {
        ...owner,
        actorKind: "owner" as const,
        capabilities: [] as const,
        authenticatedAt: sessionTime,
      };
      const attackerScope = {
        ...attacker,
        actorKind: "owner" as const,
        capabilities: [] as const,
        authenticatedAt: sessionTime,
      };
      await expect(
        repository.appendObservation(ownerScope, observation, firstAssertion),
      ).resolves.toMatchObject({ ok: true, value: { learnerSequence: 2 } });
      const swappedObservationId = appId<"evidence_observation">(randomUUID());
      await expect(
        repository.appendObservation(
          attackerScope,
          {
            ...observation,
            id: swappedObservationId,
            learnerScopeId: attacker.learnerScopeId,
            operationId: appId<"operation">(randomUUID()),
          },
          {
            ...firstAssertion,
            id: appId<"validity_assertion">(randomUUID()),
            observationId: swappedObservationId,
          },
        ),
      ).resolves.toEqual({ ok: false, error: "not_available" });
      const secondAssertionId = appId<"validity_assertion">(randomUUID());
      const secondAssertion = {
        ...firstAssertion,
        id: secondAssertionId,
        priorAssertionId: firstAssertionId,
        state: "partially_valid" as const,
        partition: { affected: ["oral"], unaffected: ["written"] },
        reasonCode: "VALIDITY.ACCESS_EQUIVALENCE",
      };
      await expect(repository.appendAssertion(ownerScope, secondAssertion)).resolves.toMatchObject({
        ok: true,
      });
      await expect(repository.appendAssertion(attackerScope, secondAssertion)).resolves.toEqual({
        ok: false,
        error: "not_available",
      });
      await expect(repository.readChain(ownerScope, observationId)).resolves.toHaveLength(2);
      await expect(repository.readChain(attackerScope, observationId)).resolves.toEqual([]);

      const firstCorrection = {
        id: appId<"correction">(randomUUID()),
        learnerScopeId: owner.learnerScopeId,
        operationId: appId<"operation">(randomUUID()),
        targetObservationId: observationId,
        selectorDigest: "3".repeat(64),
        impactDigest: "4".repeat(64),
        reasonCode: "VALIDITY.ACCESS_EQUIVALENCE",
        requestedProjections: ["capability" as const],
        recordedAt: sessionTime,
      };
      await expect(repository.appendCorrection(ownerScope, firstCorrection)).resolves.toMatchObject(
        { ok: true },
      );
      const { targetObservationId: _targetObservationId, ...correctionBase } = firstCorrection;
      void _targetObservationId;
      const supersedingCorrection = {
        ...correctionBase,
        id: appId<"correction">(randomUUID()),
        operationId: appId<"operation">(randomUUID()),
        targetAssertionId: secondAssertionId,
        impactDigest: "5".repeat(64),
        supersedesId: firstCorrection.id,
      };
      await expect(
        repository.appendCorrection(ownerScope, supersedingCorrection),
      ).resolves.toMatchObject({ ok: true });
      await expect(repository.appendCorrection(attackerScope, firstCorrection)).resolves.toEqual({
        ok: false,
        error: "not_available",
      });
      const immutableEvidence = await pool.query(
        "SELECT current_assertion_id FROM app.evidence_observations WHERE id=$1",
        [observationId],
      );
      expect(immutableEvidence.rows[0]?.current_assertion_id).toBe(secondAssertionId);

      const projectionGenerationId = appId<"projection_generation">(randomUUID());
      await pool.query(
        `INSERT INTO app.projection_generations(id,learner_scope_id,owner,kind,availability,source_cut,selector_digest,correction_digest,rules_release,calibration_release,payload,checksum)
         VALUES($1,$2,'Evidence & Capability','capability','recomputing',2,$3,$4,'projection-rules/foundation-v1','calibration/foundation-v1','{}',$5)`,
        [
          projectionGenerationId,
          owner.learnerScopeId,
          "7".repeat(64),
          "8".repeat(64),
          "9".repeat(64),
        ],
      );
      const capabilityCandidate = {
        generationId: projectionGenerationId,
        learnerScopeId: owner.learnerScopeId,
        kind: "capability" as const,
        sourceCut: 2,
        checksum: "9".repeat(64),
      };
      await expect(
        repository.publish(ownerScope, { ...capabilityCandidate, kind: "readiness" }, 0),
      ).resolves.toEqual({ ok: false, error: "checksum_mismatch" });
      await expect(
        repository.publish(ownerScope, { ...capabilityCandidate, sourceCut: 3 }, 0),
      ).resolves.toEqual({ ok: false, error: "checksum_mismatch" });
      await expect(repository.publish(ownerScope, capabilityCandidate, 0)).resolves.toMatchObject({
        ok: true,
      });
      const pointer = await pool.query(
        "SELECT kind,generation_id,resource_version FROM app.current_projection_pointers WHERE learner_scope_id=$1",
        [owner.learnerScopeId],
      );
      expect(pointer.rows).toEqual([
        { kind: "capability", generation_id: projectionGenerationId, resource_version: "1" },
      ]);

      const receipt = {
        learnerScopeId: owner.learnerScopeId,
        operationId: appId<"operation">(randomUUID()),
        kind: "synthetic-foundation",
        canonicalizationVersion: "canonical-json/v1" as const,
        payloadDigest: "c".repeat(64),
        status: "completed" as const,
        resourceId: randomUUID(),
      };
      await expect(repository.claim(receipt)).resolves.toMatchObject({
        ok: true,
        value: { disposition: "created" },
      });
      await expect(repository.claim(receipt)).resolves.toMatchObject({
        ok: true,
        value: { disposition: "replayed" },
      });
      await expect(
        repository.claim({ ...receipt, payloadDigest: "d".repeat(64) }),
      ).resolves.toEqual({ ok: false, error: "idempotency_conflict" });
      const attackerRows = await pool.query(
        "SELECT * FROM app.operation_receipts WHERE learner_scope_id=$1",
        [attacker.learnerScopeId],
      );
      expect(attackerRows.rowCount).toBe(0);

      const semanticJob = {
        id: appId<"job">(randomUUID()),
        learnerScopeId: owner.learnerScopeId,
        kind: "projection_rebuild_v1" as const,
        semanticIdentity: `projection:${owner.learnerScopeId}:2`,
        state: "running" as const,
        revision: 2,
        payloadDigest: "a".repeat(64),
        attempt: 1,
        maximumAttempts: 3,
        deadline: new Date("2026-08-25T13:00:00.000Z"),
      };
      await expect(repository.accept(semanticJob)).resolves.toMatchObject({ ok: true });
      await pool.query(`CREATE FUNCTION app.test_reject_job_publication() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN IF NEW.state='published' THEN RAISE EXCEPTION 'synthetic_publish_failure'; END IF; RETURN NEW; END $$`);
      await pool.query(`CREATE TRIGGER test_reject_job_publication BEFORE UPDATE ON app.job_resources
        FOR EACH ROW EXECUTE FUNCTION app.test_reject_job_publication()`);
      await expect(
        repository.commitFoundationEffect(semanticJob, "projection:2", "b".repeat(64)),
      ).rejects.toThrow("synthetic_publish_failure");
      const rolledBackEffect = await pool.query(
        "SELECT count(*)::int AS count FROM app.job_effect_receipts WHERE job_id=$1",
        [semanticJob.id],
      );
      expect(rolledBackEffect.rows[0]?.count).toBe(0);
      await pool.query("DROP TRIGGER test_reject_job_publication ON app.job_resources");
      await pool.query("DROP FUNCTION app.test_reject_job_publication()");
      await expect(
        repository.commitFoundationEffect(semanticJob, "projection:2", "b".repeat(64)),
      ).resolves.toMatchObject({
        ok: true,
        value: { disposition: "created", job: { state: "published", revision: 4 } },
      });
      await expect(
        repository.commitFoundationEffect(semanticJob, "projection:2", "b".repeat(64)),
      ).resolves.toMatchObject({ ok: true, value: { disposition: "replayed" } });
      await expect(
        repository.commitFoundationEffect(semanticJob, "projection:2", "c".repeat(64)),
      ).resolves.toEqual({ ok: false, error: "effect_conflict" });
      const committedEffect = await pool.query(
        `SELECT j.state,j.revision,count(r.*)::int AS receipts
         FROM app.job_resources j LEFT JOIN app.job_effect_receipts r ON r.job_id=j.id
         WHERE j.id=$1 GROUP BY j.id`,
        [semanticJob.id],
      );
      expect(committedEffect.rows).toEqual([{ state: "published", revision: "4", receipts: 1 }]);

      await repository.append({
        actorScope: owner.learnerScopeId,
        action: "evidence.correct",
        targetClass: "evidence_observation",
        targetDigest: "6".repeat(64),
        outcome: "allowed",
        reasonCode: "VALIDITY.ACCESS_EQUIVALENCE",
        requestId: randomUUID(),
        traceId: randomUUID(),
        recordedAt: sessionTime,
      });
      const auditColumns = await pool.query<{ column_name: string }>(
        "SELECT column_name FROM information_schema.columns WHERE table_schema='app' AND table_name='security_audit_events' ORDER BY column_name",
      );
      expect(auditColumns.rows.map((row) => row.column_name)).not.toEqual(
        expect.arrayContaining([
          "email",
          "subject",
          "token",
          "cookie",
          "body",
          "response",
          "audio",
          "provider_payload",
        ]),
      );
      const audit = await pool.query(
        "SELECT action,target_class,target_digest,outcome,reason_code,release,retention_class FROM app.security_audit_events",
      );
      expect(audit.rows).toEqual([
        {
          action: "evidence.correct",
          target_class: "evidence_observation",
          target_digest: "6".repeat(64),
          outcome: "allowed",
          reason_code: "VALIDITY.ACCESS_EQUIVALENCE",
          release: "security-audit/v1",
          retention_class: "security_90d",
        },
      ]);
      await pool.end();
    });
  });
});
