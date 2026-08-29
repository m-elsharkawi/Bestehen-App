import { createHash, randomUUID } from "node:crypto";
import {
  type AuthorizedScope,
  appId,
  attemptRuntimeStates,
  type ContentApprovalLevel,
  reasonRegistryRelease,
} from "@bestehen/domain";
import { withIsolatedDatabase } from "@bestehen/test-support";
import { Kysely, PostgresDialect } from "kysely";
import { Migrator } from "kysely/migration";
import type { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { AesGcmSealer, HmacDigest } from "../crypto.js";
import { PostgresOidcTransactionStore } from "../identity/index.js";
import { foundationJobPolicy, jobPolicyFor } from "../jobs/index.js";
import {
  type ApprovalDecisionInput,
  PostgresContentRepository,
  type ServingManifestIssueRequest,
} from "./content-repository.js";
import { bootstrapPersonalOwner, PostgresFoundationRepository } from "./foundation-repository.js";
import {
  checkDatabaseReadiness,
  checkSchemaCompatibility,
  createPostgresPool,
  foundationRevision,
  migrateDatabase,
  migrationChecksums,
  stage05Revision,
} from "./index.js";
import { foundationMigrations } from "./migrations.js";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

const stage03AppTables = [
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
];

const stage05AppTables = [
  "accessibility_manifests",
  "approval_decisions",
  "assistance_events",
  "attempt_submissions",
  "content_defect_reports",
  "content_exposure_index",
  "content_form_entries",
  "content_forms",
  "content_gate_results",
  "content_impact_assertions",
  "content_impact_targets",
  "content_items",
  "content_release_entries",
  "content_releases",
  "corpus_bundles",
  "key_revisions",
  "listening_plan_occurrences",
  "listening_plans",
  "media_assets",
  "media_preflight_receipts",
  "media_revisions",
  "objective_outcomes",
  "objective_unit_outcomes",
  "playback_occurrences",
  "rights_envelopes",
  "serving_manifest_entries",
  "serving_manifests",
  "transcript_revisions",
];

const expectedAppTables = [...stage03AppTables, ...stage05AppTables].sort();

const stage05ImmutableRelations = [
  "approval_decisions",
  "assistance_events",
  "attempt_submissions",
  "content_gate_results",
  "content_impact_assertions",
  "content_impact_targets",
  "key_revisions",
  "objective_outcomes",
  "objective_unit_outcomes",
];

/**
 * Applies only the four Stage 03 migrations, so a rehearsal can seed rows into the shape a
 * production database was actually left in before Stage 05 and then migrate forward over them.
 */
async function migrateToFoundation(databaseUrl: string): Promise<void> {
  const database = new Kysely<unknown>({
    dialect: new PostgresDialect({ pool: createPostgresPool(databaseUrl, { max: 2 }) }),
  });
  try {
    const migrator = new Migrator({
      db: database,
      provider: {
        async getMigrations() {
          return { ...foundationMigrations };
        },
      },
    });
    const result = await migrator.migrateTo(foundationRevision);
    if (result.error) throw result.error;
    expect(result.results?.map((entry) => entry.migrationName)).toEqual(
      Object.keys(foundationMigrations).slice(0, 4),
    );
  } finally {
    await database.destroy();
  }
}

describe.skipIf(!testDatabaseUrl)("PostgreSQL 18 Stage 03 foundation", () => {
  it("migrates baseline concurrently to the exact checksummed foundation and installs pg-boss only through the migrator", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      const [first, concurrent] = await Promise.all([
        migrateDatabase(databaseUrl),
        migrateDatabase(databaseUrl),
      ]);
      expect([first.toRevision, concurrent.toRevision]).toEqual([stage05Revision, stage05Revision]);
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
        checkSchemaCompatibility(pool, foundationRevision, stage05Revision),
      ).resolves.toMatchObject({ compatible: true, observedRevision: stage05Revision });
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
        observedRevision: stage05Revision,
      });
      // Drift at the TERMINAL Stage 05 revision. Before the §8.2c fix, verification ran only when
      // the observed revision equalled the Stage 03 revision, so this row reported compatible.
      await pool.query(
        "UPDATE app.schema_revisions SET checksum=repeat('f',64) WHERE revision=$1",
        [stage05Revision],
      );
      await expect(
        checkSchemaCompatibility(pool, foundationRevision, stage05Revision),
      ).resolves.toMatchObject({ compatible: false, observedRevision: "drifted" });
      await pool.query("UPDATE app.schema_revisions SET checksum=$2 WHERE revision=$1", [
        stage05Revision,
        migrationChecksums[stage05Revision],
      ]);
      // Drift on an earlier revision is still caught at the Stage 05 revision.
      await pool.query(
        "UPDATE app.schema_revisions SET checksum=repeat('f',64) WHERE revision=$1",
        [foundationRevision],
      );
      await expect(
        checkSchemaCompatibility(pool, foundationRevision, stage05Revision),
      ).resolves.toMatchObject({ compatible: false, observedRevision: "drifted" });
      await pool.query("UPDATE app.schema_revisions SET checksum=$2 WHERE revision=$1", [
        foundationRevision,
        migrationChecksums[foundationRevision],
      ]);
      await pool.end();
      await expect(
        checkDatabaseReadiness(pool, foundationRevision, stage05Revision),
      ).resolves.toMatchObject({ connected: false, compatible: false });
      const recovered = createPostgresPool(databaseUrl);
      await expect(
        checkDatabaseReadiness(recovered, foundationRevision, stage05Revision),
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
      await pool.query("INSERT INTO app.principals(id,kind,state) VALUES($1,'account','active')", [
        attacker.principalId,
      ]);
      const attackerCredentialId = randomUUID();
      await pool.query(
        `INSERT INTO app.credential_bindings(id,principal_id,kind,provider,issuer,subject,subject_fingerprint,state,verified_at,identity_release)
         VALUES($1,$2,'oidc','auth0',$3,$4,$5,'active',$6,'identity-contract/v1')`,
        [
          attackerCredentialId,
          attacker.principalId,
          "https://synthetic-attacker.eu.auth0.com/",
          "synthetic-attacker-subject",
          "e".repeat(64),
          ownerInput.verifiedAt,
        ],
      );
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
      await pool.query("UPDATE app.credential_bindings SET state='revoked' WHERE id=$1", [
        ownerInput.credentialBindingId,
      ]);
      await expect(repository.findByTokenDigest(ownerSession.tokenDigest)).resolves.toBeUndefined();
      await pool.query("UPDATE app.credential_bindings SET state='active' WHERE id=$1", [
        ownerInput.credentialBindingId,
      ]);
      await pool.query("UPDATE app.principals SET state='revoked' WHERE id=$1", [
        owner.principalId,
      ]);
      await expect(repository.findByTokenDigest(ownerSession.tokenDigest)).resolves.toBeUndefined();
      await pool.query("UPDATE app.principals SET state='active' WHERE id=$1", [owner.principalId]);
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
      await expect(
        pool.query(
          `INSERT INTO app.activity_occurrences(id,learner_scope_id,session_id,operation_id,state,resource_version)
           VALUES($1,$2,$3,$4,'unknown_state',1)`,
          [randomUUID(), owner.learnerScopeId, productSessionId, randomUUID()],
        ),
      ).rejects.toMatchObject({ code: "23514" });
      await expect(
        pool.query(
          `INSERT INTO app.coaching_episodes(id,learner_scope_id,activity_occurrence_id,state,resource_version)
           VALUES($1,$2,$3,'unknown_state',1)`,
          [randomUUID(), owner.learnerScopeId, occurrenceId],
        ),
      ).rejects.toMatchObject({ code: "23514" });
      await pool.query(
        `INSERT INTO app.attempts(id,learner_scope_id,session_id,activity_occurrence_id,episode_id,content_revision_id,modality,direct_lane,state,operation_id)
         VALUES($1,$2,$3,$4,$5,$6,'writing','written','result_available',$7)`,
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
        status: "accepted" as const,
      };
      await expect(repository.claim(receipt)).resolves.toMatchObject({
        ok: true,
        value: { disposition: "created" },
      });
      await expect(
        repository.claim({ ...receipt, status: "completed", resourceId: randomUUID() }),
      ).resolves.toEqual({
        ok: true,
        value: { disposition: "replayed", receipt },
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
      const authoritativeJobReplay = {
        ...semanticJob,
        id: appId<"job">(randomUUID()),
        state: "accepted" as const,
        revision: 1,
        attempt: 2,
        maximumAttempts: 9,
        deadline: new Date("2026-08-25T14:00:00.000Z"),
      };
      await expect(repository.accept(authoritativeJobReplay)).resolves.toEqual({
        ok: true,
        value: semanticJob,
      });
      await expect(
        repository.accept({ ...authoritativeJobReplay, payloadDigest: "f".repeat(64) }),
      ).resolves.toEqual({ ok: false, error: "semantic_identity_conflict" });
      const attackerJob = {
        ...semanticJob,
        id: appId<"job">(randomUUID()),
        learnerScopeId: attacker.learnerScopeId,
      };
      await expect(repository.accept(attackerJob)).resolves.toEqual({
        ok: true,
        value: attackerJob,
      });
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

      const expectPersonalWritesDenied = async () => {
        const deniedObservationId = appId<"evidence_observation">(randomUUID());
        await expect(
          repository.appendObservation(
            ownerScope,
            {
              ...observation,
              id: deniedObservationId,
              operationId: appId<"operation">(randomUUID()),
            },
            {
              ...firstAssertion,
              id: appId<"validity_assertion">(randomUUID()),
              observationId: deniedObservationId,
            },
          ),
        ).resolves.toEqual({ ok: false, error: "not_available" });
        await expect(
          repository.appendAssertion(ownerScope, {
            ...secondAssertion,
            id: appId<"validity_assertion">(randomUUID()),
          }),
        ).resolves.toEqual({ ok: false, error: "not_available" });
        await expect(
          repository.appendCorrection(ownerScope, {
            ...firstCorrection,
            id: appId<"correction">(randomUUID()),
            operationId: appId<"operation">(randomUUID()),
          }),
        ).resolves.toEqual({ ok: false, error: "not_available" });
        await expect(repository.publish(ownerScope, capabilityCandidate, 1)).resolves.toEqual({
          ok: false,
          error: "not_available",
        });
        await expect(
          repository.claim({ ...receipt, operationId: appId<"operation">(randomUUID()) }),
        ).resolves.toEqual({ ok: false, error: "not_available" });
        const deniedJob = {
          ...semanticJob,
          id: appId<"job">(randomUUID()),
          semanticIdentity: `projection:${owner.learnerScopeId}:${randomUUID()}`,
        };
        await expect(repository.accept(deniedJob)).resolves.toEqual({
          ok: false,
          error: "not_available",
        });
        await expect(repository.transition(semanticJob.id, 4, "superseded")).resolves.toEqual({
          ok: false,
          error: "not_available",
        });
        await expect(
          repository.commitFoundationEffect(semanticJob, "projection:2", "b".repeat(64)),
        ).resolves.toEqual({ ok: false, error: "not_available" });
        await expect(
          repository.findByTokenDigest(attackerSession.tokenDigest),
        ).resolves.toBeDefined();
        await expect(
          repository.findByTokenDigest(ownerSession.tokenDigest),
        ).resolves.toBeUndefined();
        await expect(
          repository.insert({
            ...ownerSession,
            id: appId<"app_session">(randomUUID()),
            tokenDigest: sessionDigest.digest("app-session", randomUUID()),
            state: "active",
          }),
        ).rejects.toThrow("not available");
      };

      await pool.query("UPDATE app.learner_scopes SET state='deletion_in_progress' WHERE id=$1", [
        owner.learnerScopeId,
      ]);
      await expectPersonalWritesDenied();
      await pool.query("UPDATE app.learner_scopes SET state='active' WHERE id=$1", [
        owner.learnerScopeId,
      ]);
      const attackerDeletionOperationId = randomUUID();
      await pool.query(
        `INSERT INTO app.deletion_operations(id,learner_scope_id,operation_id,state,inventory_version,inventory_digest,requested_at,access_revoked_at,backup_expires_at,policy_release)
         VALUES($1,$2,$3,'access_revoked','inventory/foundation-v1',$4,$5,$5,transaction_timestamp()+interval '90 days','deletion-policy/v1')`,
        [
          attackerDeletionOperationId,
          attacker.learnerScopeId,
          randomUUID(),
          "f".repeat(64),
          sessionTime,
        ],
      );
      await expect(
        pool.query(
          `INSERT INTO app.learner_tombstones(learner_scope_id,scope_digest,deletion_operation_id,cutoff,expires_at,state)
           VALUES($1,$2,$3,$4,transaction_timestamp()+interval '90 days','active')`,
          [owner.learnerScopeId, "e".repeat(64), attackerDeletionOperationId, sessionTime],
        ),
      ).rejects.toMatchObject({ code: "23503" });
      const deletionOperationId = randomUUID();
      await pool.query(
        `INSERT INTO app.deletion_operations(id,learner_scope_id,operation_id,state,inventory_version,inventory_digest,requested_at,access_revoked_at,backup_expires_at,policy_release)
         VALUES($1,$2,$3,'access_revoked','inventory/foundation-v1',$4,$5,$5,transaction_timestamp()+interval '90 days','deletion-policy/v1')`,
        [deletionOperationId, owner.learnerScopeId, randomUUID(), "0".repeat(64), sessionTime],
      );
      await pool.query(
        `INSERT INTO app.learner_tombstones(learner_scope_id,scope_digest,deletion_operation_id,cutoff,expires_at,state)
         VALUES($1,$2,$3,$4,transaction_timestamp()+interval '90 days','active')`,
        [owner.learnerScopeId, "1".repeat(64), deletionOperationId, sessionTime],
      );
      await expectPersonalWritesDenied();
      await pool.end();
    });
  });
});

interface SeededChain {
  readonly learnerScopeId: string;
  readonly contentFamilyId: string;
  readonly contentRevisionId: string;
  readonly sessionId: string;
  readonly occurrenceId: string;
  readonly episodeId: string;
}

function hex(seed: string): string {
  return createHash("sha256").update(seed).digest("hex");
}

/** The Stage 03 chain every attempt needs: scope, plan, session, occurrence, episode, content. */
async function seedLearnerChain(pool: Pool): Promise<SeededChain> {
  const learnerScopeId = randomUUID();
  const contentFamilyId = randomUUID();
  const contentRevisionId = randomUUID();
  const planRevisionId = randomUUID();
  const sessionId = randomUUID();
  const occurrenceId = randomUUID();
  const episodeId = randomUUID();
  await pool.query("INSERT INTO app.learner_scopes(id,state) VALUES($1,'active')", [
    learnerScopeId,
  ]);
  await pool.query("INSERT INTO app.content_families(id,family_key) VALUES($1,$2)", [
    contentFamilyId,
    `family-${contentFamilyId}`,
  ]);
  await pool.query(
    `INSERT INTO app.content_revisions(id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest)
     VALUES($1,$2,'v1','task','approved','eligible','compatible',$3)`,
    [contentRevisionId, contentFamilyId, hex(`revision:${contentRevisionId}`)],
  );
  await pool.query(
    `INSERT INTO app.plan_revisions(id,learner_scope_id,source_cut,policy_release,reason_release,template_release,content_release,intents,reasons,checksum)
     VALUES($1,$2,1,'policy/foundation','reason-registry/v1','template/foundation','content/synthetic','[]','[]',$3)`,
    [planRevisionId, learnerScopeId, hex(`plan:${planRevisionId}`)],
  );
  await pool.query(
    "INSERT INTO app.sessions(id,learner_scope_id,plan_revision_id,state) VALUES($1,$2,$3,'active')",
    [sessionId, learnerScopeId, planRevisionId],
  );
  await pool.query(
    `INSERT INTO app.activity_occurrences(id,learner_scope_id,session_id,operation_id,state,resource_version)
     VALUES($1,$2,$3,$4,'active',1)`,
    [occurrenceId, learnerScopeId, sessionId, randomUUID()],
  );
  await pool.query(
    `INSERT INTO app.coaching_episodes(id,learner_scope_id,activity_occurrence_id,state,resource_version)
     VALUES($1,$2,$3,'active',1)`,
    [episodeId, learnerScopeId, occurrenceId],
  );
  return {
    learnerScopeId,
    contentFamilyId,
    contentRevisionId,
    sessionId,
    occurrenceId,
    episodeId,
  };
}

async function insertAttempt(
  pool: Pool,
  chain: SeededChain,
  state: string,
  attemptId = randomUUID(),
): Promise<string> {
  await pool.query(
    `INSERT INTO app.attempts(id,learner_scope_id,session_id,activity_occurrence_id,episode_id,content_revision_id,modality,direct_lane,state,operation_id)
     VALUES($1,$2,$3,$4,$5,$6,'reading','written',$7,$8)`,
    [
      attemptId,
      chain.learnerScopeId,
      chain.sessionId,
      chain.occurrenceId,
      chain.episodeId,
      chain.contentRevisionId,
      state,
      randomUUID(),
    ],
  );
  return attemptId;
}

/** An observation plus its current validity assertion, so an impact or a rewrite has a target. */
async function seedObservation(
  pool: Pool,
  chain: SeededChain,
  attemptId: string,
  sequence: number,
  registryId = "reason-registry/v1",
): Promise<{ readonly observationId: string; readonly assertionId: string }> {
  const occasionId = randomUUID();
  const observationId = randomUUID();
  const assertionId = randomUUID();
  await pool.query(
    `INSERT INTO app.independent_occasions(id,learner_scope_id,episode_id,independence_class,family_relation,policy_release)
     VALUES($1,$2,$3,'first_attempt','same-family','independence/foundation')`,
    [occasionId, chain.learnerScopeId, chain.episodeId],
  );
  await pool.query(
    `INSERT INTO app.evidence_observations(id,learner_scope_id,attempt_id,occasion_id,operation_id,direct_lane,supported_scope,outcome,conditions,evaluation,compatibility,learner_sequence)
     VALUES($1,$2,$3,$4,$5,'written','["written","oral"]','{}','{}','{}','{}',$6)`,
    [observationId, chain.learnerScopeId, attemptId, occasionId, randomUUID(), sequence],
  );
  await pool.query(
    `INSERT INTO app.validity_assertions(id,learner_scope_id,observation_id,state,affected_scope,unaffected_scope,reason_registry_id,reason_code,asserted_owner,actor_ref,evidence_ref,effective_at,release)
     VALUES($1,$2,$3,'valid','[]','["written","oral"]',$4,'VALIDITY.TECHNICAL_PREFLIGHT','Evidence & Capability','app-principal','owner-command',transaction_timestamp(),'evidence-contract/v1')`,
    [assertionId, chain.learnerScopeId, observationId, registryId],
  );
  await pool.query("UPDATE app.evidence_observations SET current_assertion_id=$1 WHERE id=$2", [
    assertionId,
    observationId,
  ]);
  return { observationId, assertionId };
}

describe.skipIf(!testDatabaseUrl)("PostgreSQL 18 Stage 05 content and attempt runtime", () => {
  it("creates every Stage 05 relation with its immutability triggers, scope fences and closed unions", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      await migrateDatabase(databaseUrl);
      const pool = createPostgresPool(databaseUrl);
      const chain = await seedLearnerChain(pool);
      const other = await seedLearnerChain(pool);

      // reason-registry/v1.1 is a minor bump that keeps every v1 code addressable.
      const registry = await pool.query<{ id: string; minor: number }>(
        "SELECT id,minor FROM app.reason_registry_releases ORDER BY id",
      );
      expect(registry.rows.map((row) => row.id)).toEqual([
        "reason-registry/v1",
        reasonRegistryRelease.id,
      ]);
      const stage05Codes = await pool.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM app.reason_codes WHERE registry_id=$1 AND code=ANY($2)",
        [
          reasonRegistryRelease.id,
          [
            "VALIDITY.CONTENT_QUARANTINED_AFTER_PIN",
            "VALIDITY.RESPONSE_STRUCTURALLY_INVALID",
            "FALLBACK.SUBMISSION_OUTCOME_UNKNOWN",
            "UNCERTAINTY.KEY_VALIDATOR_DISAGREEMENT",
          ],
        ],
      );
      expect(stage05Codes.rows[0]?.count).toBe(4);

      // ---- content graph -----------------------------------------------------------------
      const rightsEnvelopeId = randomUUID();
      await pool.query(
        `INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest)
         VALUES($1,'seed-corpus/v1','current','{}',$2)`,
        [rightsEnvelopeId, hex("rights")],
      );
      const accessibilityManifestId = "accessibility/seed-v1";
      await pool.query(
        `INSERT INTO app.accessibility_manifests(id,manifest,language_tag,gate_status,digest)
         VALUES($1,'{}','de','pass',$2)`,
        [accessibilityManifestId, hex("a11y")],
      );
      await pool.query(
        `INSERT INTO app.corpus_bundles(bundle_id,revision,state,digest,provenance,rights_envelope_id)
         VALUES('bundle/seed',1,'imported',$1,'{}',$2)`,
        [hex("bundle"), rightsEnvelopeId],
      );
      const mediaAssetId = randomUUID();
      await pool.query(
        `INSERT INTO app.media_assets(id,kind,manifest_revision,content_family_id,listening_family,source_role,authored_speed_ratio,generator,qa,rights_envelope_id,accessibility_manifest_id,status,digest)
         VALUES($1,'audio','r1',$2,'H1','reviewed_tts',1.0,'{}','{}',$3,$4,'current',$5)`,
        [
          mediaAssetId,
          chain.contentFamilyId,
          rightsEnvelopeId,
          accessibilityManifestId,
          hex("asset"),
        ],
      );
      const mediaRevisionId = randomUUID();
      await pool.query(
        `INSERT INTO app.media_revisions(id,asset_id,role,object_key,byte_digest,bytes,mime,codec,container,duration_ms,cache_policy_ref,rights_actions,manifest_digest)
         VALUES($1,$2,'web_primary','media/seed-h1.mp3',$3,1024,'audio/mpeg','mp3','mpeg',30000,'cache/immutable-v1','[]',$4)`,
        [mediaRevisionId, mediaAssetId, hex("bytes"), hex("media-manifest")],
      );
      await pool.query(
        `INSERT INTO app.transcript_revisions(id,media_revision_id,kind,answer_bearing,earliest_reveal_phase,rights_envelope_id,language,digest)
         VALUES($1,$2,'target_transcript',true,'after_block',$3,'de',$4)`,
        [randomUUID(), mediaRevisionId, rightsEnvelopeId, hex("transcript")],
      );
      await expect(
        pool.query(
          `INSERT INTO app.transcript_revisions(id,media_revision_id,kind,answer_bearing,earliest_reveal_phase,rights_envelope_id,language,digest)
           VALUES($1,$2,'target_transcript',true,'immediately',$3,'de',$4)`,
          [randomUUID(), mediaRevisionId, rightsEnvelopeId, hex("transcript-bad")],
        ),
      ).rejects.toMatchObject({ code: "23514" });

      const approvalDecisionId = randomUUID();
      await pool.query(
        `INSERT INTO app.approval_decisions(id,subject_kind,subject_id,content_class,level,outcome,author_ref,validator_ref,approver_ref,method_version,reason_registry_id,reason_code,evidence_ref,decided_at)
         VALUES($1,'content_revision',$2,'C2','independent_b1','granted','owner:author','owner:validator','owner:approver','content-qa-gates/v1',$3,'VALIDITY.CONTENT_APPROVAL','gate-report/1',transaction_timestamp())`,
        [approvalDecisionId, chain.contentRevisionId, reasonRegistryRelease.id],
      );
      await expect(
        pool.query(
          `INSERT INTO app.approval_decisions(id,subject_kind,subject_id,content_class,level,outcome,author_ref,validator_ref,approver_ref,method_version,reason_registry_id,reason_code,evidence_ref,decided_at)
           VALUES($1,'content_revision',$2,'C2','platinum','granted','a','v','p','content-qa-gates/v1',$3,'VALIDITY.CONTENT_APPROVAL','gate-report/2',transaction_timestamp())`,
          [randomUUID(), chain.contentRevisionId, reasonRegistryRelease.id],
        ),
      ).rejects.toMatchObject({ code: "23514" });

      const contentItemId = randomUUID();
      await pool.query(
        `INSERT INTO app.content_items(id,content_revision_id,ordinal,response_kind,binding,scorable)
         VALUES($1,$2,1,'single_select','{}','{}')`,
        [contentItemId, chain.contentRevisionId],
      );
      const keyRevisionId = randomUUID();
      await pool.query(
        `INSERT INTO app.key_revisions(id,content_revision_id,content_item_id,accepted_response_set,response_cardinality_min,response_cardinality_max,scoring_policy_ref,decisive_evidence,distractor_rationale,intended_cause_mapping,independent_validation,digest)
         VALUES($1,$2,$3,'[{"kind":"option","optionId":"a"}]',1,1,'scoring-policy/v1','[]','[]','{}','{}',$4)`,
        [keyRevisionId, chain.contentRevisionId, contentItemId, hex("key")],
      );
      // Key material is server-only: PUBLIC holds no privilege on the relation.
      const keyGrant = await pool.query<{ granted: boolean }>(
        "SELECT has_table_privilege('public','app.key_revisions','SELECT') AS granted",
      );
      expect(keyGrant.rows[0]?.granted).toBe(false);

      await pool.query(
        `INSERT INTO app.content_gate_results(id,content_revision_id,gate,ordinal,status,gate_version,reviewer_ref,method_version,findings)
         VALUES($1,$2,'deterministic_structure',4,'pass','content-qa-gates/v1','owner:validator','structure/v1','[]')`,
        [randomUUID(), chain.contentRevisionId],
      );
      const formId = randomUUID();
      await pool.query(
        `INSERT INTO app.content_forms(id,form_revision_id,target_blueprint_release_id,approval_decision_id,intended_role,progression_profile,block_contracts,navigation_policy,feedback_policy,checkpoint_policy_ref,rights_and_accessibility_refs,digest)
         VALUES($1,'form-r1','blueprint/v1',$2,'independent_practice','P3','[]','navigation/v1','feedback/v1','checkpoint/v1','[]',$3)`,
        [formId, approvalDecisionId, hex("form")],
      );
      await pool.query(
        `INSERT INTO app.content_form_entries(form_id,ordinal,block_id,content_revision_id,content_item_id)
         VALUES($1,1,'block-1',$2,$3)`,
        [formId, chain.contentRevisionId, contentItemId],
      );
      // An item belonging to a different revision cannot be composed into the form.
      await expect(
        pool.query(
          `INSERT INTO app.content_form_entries(form_id,ordinal,block_id,content_revision_id,content_item_id)
           VALUES($1,2,'block-1',$2,$3)`,
          [formId, other.contentRevisionId, contentItemId],
        ),
      ).rejects.toMatchObject({ code: "23503" });
      await pool.query(
        `INSERT INTO app.content_releases(id,release_identity,state,digest,activated_at)
         VALUES('content-release/1','stage-05-content-v1','active',$1,transaction_timestamp())`,
        [hex("release")],
      );
      await pool.query(
        "INSERT INTO app.content_release_entries(release_id,content_revision_id,form_id) VALUES('content-release/1',$1,$2)",
        [chain.contentRevisionId, formId],
      );

      // ---- attempt runtime ---------------------------------------------------------------
      const servingManifestId = randomUUID();
      await pool.query(
        `INSERT INTO app.serving_manifests(id,learner_scope_id,operation_id,form_id,content_class,approval_role,key_revision_digests,allowed_conditions,learner_safe_payload_digest,freshness_decision,compared_family_refs,authorization_version,content_release_identity,issued_at,expires_at,revocation_state,digest)
         VALUES($1,$2,$3,$4,'C2','independent_b1','[]','{}',$5,'fresh','[]','media-authorization/v1','stage-05-content-v1',transaction_timestamp(),transaction_timestamp()+interval '1 hour','active',$6)`,
        [
          servingManifestId,
          chain.learnerScopeId,
          randomUUID(),
          formId,
          hex("payload"),
          hex("manifest"),
        ],
      );
      await pool.query(
        `INSERT INTO app.serving_manifest_entries(serving_manifest_id,learner_scope_id,ordinal,content_revision_id,content_item_id,media_revision_id)
         VALUES($1,$2,1,$3,$4,$5)`,
        [
          servingManifestId,
          chain.learnerScopeId,
          chain.contentRevisionId,
          contentItemId,
          mediaRevisionId,
        ],
      );
      await expect(
        pool.query(
          `INSERT INTO app.serving_manifest_entries(serving_manifest_id,learner_scope_id,ordinal,content_revision_id,content_item_id)
           VALUES($1,$2,2,$3,$4)`,
          [servingManifestId, other.learnerScopeId, chain.contentRevisionId, contentItemId],
        ),
      ).rejects.toMatchObject({ code: "23503" });

      // The eleven-state union is exactly representable and nothing outside it is.
      for (const state of attemptRuntimeStates) {
        await expect(insertAttempt(pool, chain, state)).resolves.toBeDefined();
      }
      for (const rejected of ["started", "completed", "not_counted"]) {
        await expect(insertAttempt(pool, chain, rejected)).rejects.toMatchObject({ code: "23514" });
      }
      const attemptId = await insertAttempt(pool, chain, "submitted");
      await pool.query("UPDATE app.attempts SET serving_manifest_id=$1 WHERE id=$2", [
        servingManifestId,
        attemptId,
      ]);
      const foreignAttemptId = await insertAttempt(pool, other, "ready");
      await expect(
        pool.query("UPDATE app.attempts SET serving_manifest_id=$1 WHERE id=$2", [
          servingManifestId,
          foreignAttemptId,
        ]),
      ).rejects.toMatchObject({ code: "23503" });

      const submissionId = randomUUID();
      await pool.query(
        `INSERT INTO app.attempt_submissions(id,learner_scope_id,attempt_id,operation_id,serving_manifest_id,checkpoint_sequence,canonical_response,response_digest,conditions,uncaptured_item_ids,form_and_key_versions)
         VALUES($1,$2,$3,$4,$5,3,'{}',$6,'{}','[]','{}')`,
        [
          submissionId,
          chain.learnerScopeId,
          attemptId,
          randomUUID(),
          servingManifestId,
          hex("response"),
        ],
      );
      // A reconnect can never write a second submission for the same attempt.
      await expect(
        pool.query(
          `INSERT INTO app.attempt_submissions(id,learner_scope_id,attempt_id,operation_id,serving_manifest_id,checkpoint_sequence,canonical_response,response_digest,conditions,uncaptured_item_ids,form_and_key_versions)
           VALUES($1,$2,$3,$4,$5,4,'{}',$6,'{}','[]','{}')`,
          [
            randomUUID(),
            chain.learnerScopeId,
            attemptId,
            randomUUID(),
            servingManifestId,
            hex("response-2"),
          ],
        ),
      ).rejects.toMatchObject({ code: "23505" });

      const outcomeId = randomUUID();
      await pool.query(
        `INSERT INTO app.objective_outcomes(id,learner_scope_id,submission_id,attempt_id,algorithm_version,scoring_policy_ref,form_and_key_versions,task_rollups,supported_scope,structurally_invalid_scope,uncaptured_scope,checksum)
         VALUES($1,$2,$3,$4,'objective-scoring/v1','scoring-policy/v1','{}','[]','["written"]','[]','[]',$5)`,
        [outcomeId, chain.learnerScopeId, submissionId, attemptId, hex("outcome")],
      );
      await pool.query(
        `INSERT INTO app.objective_unit_outcomes(outcome_id,learner_scope_id,content_item_id,kind,task_ref,key_revision_id)
         VALUES($1,$2,$3,'correct','task-1',$4)`,
        [outcomeId, chain.learnerScopeId, contentItemId, keyRevisionId],
      );
      // An issue code only exists for a structurally invalid unit; correctness never carries one.
      await expect(
        pool.query(
          `INSERT INTO app.objective_unit_outcomes(outcome_id,learner_scope_id,content_item_id,kind,issue_code,task_ref,key_revision_id)
           VALUES($1,$2,$3,'correct','cardinality_violation','task-1',$4)`,
          [outcomeId, chain.learnerScopeId, randomUUID(), keyRevisionId],
        ),
      ).rejects.toMatchObject({ code: "23514" });

      await pool.query(
        `INSERT INTO app.assistance_events(id,learner_scope_id,attempt_id,operation_id,kind,state,phase,affected_scope,answer_bearing,tested_capability_effect,policy_version,occurred_at)
         VALUES($1,$2,$3,$4,'word_help','used','during_response','["written"]','no','equivalent','assistance-policy/v1',transaction_timestamp())`,
        [randomUUID(), chain.learnerScopeId, attemptId, randomUUID()],
      );

      const listeningPlanId = randomUUID();
      await pool.query(
        `INSERT INTO app.listening_plans(id,learner_scope_id,attempt_id,serving_manifest_id,form_id,contract_major,plan_version,target_blueprint_version,evidence_role,progression_profile,preflight_policy_ref,playback_policy_ref,timer_policy_ref,issued_at,expires_at,revocation_state)
         VALUES($1,$2,$3,$4,$5,1,'listening-plan/v1','blueprint/v1','independent_practice','P3','preflight/v1','playback/v1','timer/v1',transaction_timestamp(),transaction_timestamp()+interval '1 hour','active')`,
        [listeningPlanId, chain.learnerScopeId, attemptId, servingManifestId, formId],
      );
      const planOccurrenceId = randomUUID();
      await pool.query(
        `INSERT INTO app.listening_plan_occurrences(id,learner_scope_id,listening_plan_id,ordinal,item_or_part_scope,candidate_media_revision_ids,allowed_play_count,authored_speed_ratio,seeking_allowed,pause_allowed,transcript_phase,response_window)
         VALUES($1,$2,$3,1,'["written"]',$4,1,1.0,false,false,'after_block','{}')`,
        [
          planOccurrenceId,
          chain.learnerScopeId,
          listeningPlanId,
          JSON.stringify([mediaRevisionId]),
        ],
      );
      await pool.query(
        `INSERT INTO app.playback_occurrences(occurrence_id,learner_scope_id,play_ordinal,operation_id,idempotency_hash,state,media_revision_id,authorized_at,client_sequence)
         VALUES($1,$2,1,$3,$4,'authorized',$5,transaction_timestamp(),1)`,
        [planOccurrenceId, chain.learnerScopeId, randomUUID(), hex("playback"), mediaRevisionId],
      );
      // A duplicate tap, a DOM remount and a late callback all resolve to the same ordinal.
      await expect(
        pool.query(
          `INSERT INTO app.playback_occurrences(occurrence_id,learner_scope_id,play_ordinal,operation_id,idempotency_hash,state,media_revision_id,authorized_at,client_sequence)
           VALUES($1,$2,1,$3,$4,'authorized',$5,transaction_timestamp(),2)`,
          [
            planOccurrenceId,
            chain.learnerScopeId,
            randomUUID(),
            hex("playback-2"),
            mediaRevisionId,
          ],
        ),
      ).rejects.toMatchObject({ code: "23505" });
      // A failure must name its reason; a silent fault is not a recordable fact.
      await expect(
        pool.query(
          `INSERT INTO app.playback_occurrences(occurrence_id,learner_scope_id,play_ordinal,operation_id,idempotency_hash,state,media_revision_id,authorized_at,client_sequence)
           VALUES($1,$2,2,$3,$4,'failed',$5,transaction_timestamp(),3)`,
          [
            planOccurrenceId,
            chain.learnerScopeId,
            randomUUID(),
            hex("playback-3"),
            mediaRevisionId,
          ],
        ),
      ).rejects.toMatchObject({ code: "23514" });
      await pool.query(
        `INSERT INTO app.media_preflight_receipts(id,learner_scope_id,listening_plan_id,operation_id,policy_versions,candidate_media_revisions,verified_digest_and_length,decoded_or_loaded,local_retention_class,output_probe_confirmed,checkpoint_path_confirmed,outcome,issued_at,expires_at)
         VALUES($1,$2,$3,$4,'{}','[]','[]','[]','session',true,true,'ready',transaction_timestamp(),transaction_timestamp()+interval '10 minutes')`,
        [randomUUID(), chain.learnerScopeId, listeningPlanId, randomUUID()],
      );
      await pool.query(
        `INSERT INTO app.content_exposure_index(learner_scope_id,content_family_id,exposure_class,last_trigger,last_content_revision_id)
         VALUES($1,$2,'exposed_family','learner_visible_stimulus',$3)`,
        [chain.learnerScopeId, chain.contentFamilyId, chain.contentRevisionId],
      );

      // ---- validity partition widening ---------------------------------------------------
      const { observationId } = await seedObservation(pool, chain, attemptId, 10);
      const wholeScopePending = randomUUID();
      await pool.query(
        `INSERT INTO app.validity_assertions(id,learner_scope_id,observation_id,state,affected_scope,unaffected_scope,reason_registry_id,reason_code,asserted_owner,actor_ref,evidence_ref,effective_at,release)
         VALUES($1,$2,$3,'pending','["written","oral"]','[]',$4,'VALIDITY.CONTENT_QUARANTINED_AFTER_PIN','Evidence & Capability','app-principal','owner-command',transaction_timestamp(),'evidence-contract/v1')`,
        [wholeScopePending, chain.learnerScopeId, observationId, reasonRegistryRelease.id],
      );
      // Still forbidden: a partially_valid without a surviving partition says nothing.
      await expect(
        pool.query(
          `INSERT INTO app.validity_assertions(id,learner_scope_id,observation_id,state,affected_scope,unaffected_scope,reason_registry_id,reason_code,asserted_owner,actor_ref,evidence_ref,effective_at,release)
           VALUES($1,$2,$3,'partially_valid','["written","oral"]','[]',$4,'VALIDITY.ACCESS_EQUIVALENCE','Evidence & Capability','app-principal','owner-command',transaction_timestamp(),'evidence-contract/v1')`,
          [randomUUID(), chain.learnerScopeId, observationId, reasonRegistryRelease.id],
        ),
      ).rejects.toMatchObject({ code: "23514" });
      // Still forbidden: neither state may claim an empty affected scope.
      for (const state of ["pending", "partially_valid"]) {
        await expect(
          pool.query(
            `INSERT INTO app.validity_assertions(id,learner_scope_id,observation_id,state,affected_scope,unaffected_scope,reason_registry_id,reason_code,asserted_owner,actor_ref,evidence_ref,effective_at,release)
             VALUES($1,$2,$3,$4,'[]','["written","oral"]',$5,'VALIDITY.ACCESS_EQUIVALENCE','Evidence & Capability','app-principal','owner-command',transaction_timestamp(),'evidence-contract/v1')`,
            [randomUUID(), chain.learnerScopeId, observationId, state, reasonRegistryRelease.id],
          ),
        ).rejects.toMatchObject({ code: "23514" });
      }

      // ---- impact and defect reports -----------------------------------------------------
      const impactAssertionId = randomUUID();
      await pool.query(
        `INSERT INTO app.content_impact_assertions(id,incident_id,owner_context,actor_ref,authorization_version,cause_kind,impact_mode,requested_validity,selectors,declared_cardinality,affected_scope,unaffected_scope,reason_registry_id,reason_code,evidence_refs,policy_and_contract_versions,effective_at,digest)
         VALUES($1,'incident-1','Content & Media','owner:operator','authorization/v1','content_defect','validity_change','pending','{}',1,'["written"]','["oral"]',$2,'VALIDITY.CONTENT_QUARANTINED_AFTER_PIN','[]','{}',transaction_timestamp(),$3)`,
        [impactAssertionId, reasonRegistryRelease.id, hex("impact")],
      );
      // A serving-only impact never changes validity.
      await expect(
        pool.query(
          `INSERT INTO app.content_impact_assertions(id,incident_id,owner_context,actor_ref,authorization_version,cause_kind,impact_mode,requested_validity,selectors,declared_cardinality,affected_scope,unaffected_scope,reason_registry_id,reason_code,evidence_refs,policy_and_contract_versions,effective_at,digest)
           VALUES($1,'incident-2','Content & Media','owner:operator','authorization/v1','rights_takedown','serving_only','not_counted','{}',1,'["written"]','["oral"]',$2,'VALIDITY.RIGHTS_COMPATIBILITY','[]','{}',transaction_timestamp(),$3)`,
          [randomUUID(), reasonRegistryRelease.id, hex("impact-bad")],
        ),
      ).rejects.toMatchObject({ code: "23514" });
      await pool.query(
        `INSERT INTO app.content_impact_targets(impact_assertion_id,learner_scope_id,observation_id,assertion_id,disposition)
         VALUES($1,$2,$3,$4,'resolved')`,
        [impactAssertionId, chain.learnerScopeId, observationId, wholeScopePending],
      );
      await expect(
        pool.query(
          `INSERT INTO app.content_impact_targets(impact_assertion_id,learner_scope_id,observation_id,disposition)
           VALUES($1,$2,$3,'resolved')`,
          [impactAssertionId, other.learnerScopeId, observationId],
        ),
      ).rejects.toMatchObject({ code: "23503" });
      await pool.query(
        `INSERT INTO app.content_defect_reports(id,learner_scope_id,operation_id,content_revision_id,content_item_id,attempt_id,category,note,state,reported_at)
         VALUES($1,$2,$3,$4,$5,$6,'ambiguous_key','synthetic report','open',transaction_timestamp())`,
        [
          randomUUID(),
          chain.learnerScopeId,
          randomUUID(),
          chain.contentRevisionId,
          contentItemId,
          attemptId,
        ],
      );

      // ---- job kinds ---------------------------------------------------------------------
      for (const kind of ["content_publication_v1", "content_impact_recompute_v1"]) {
        await pool.query(
          `INSERT INTO app.job_resources(id,kind,semantic_identity,state,revision,owner,actor_scope,learner_scope_id,payload_digest,contract_major,release,deadline,maximum_attempts,dependent_scope,unaffected_scope)
           VALUES($1,$2,$3,'accepted',1,'Content & Media','owner',$4,$5,1,'stage-05-content-v1',transaction_timestamp()+interval '5 minutes',3,'[]','[]')`,
          [randomUUID(), kind, `${kind}:1`, chain.learnerScopeId, hex(kind)],
        );
      }
      await pool.query(
        `INSERT INTO app.job_resources(id,kind,semantic_identity,state,revision,owner,actor_scope,learner_scope_id,payload_digest,contract_major,release,deadline,maximum_attempts,dependent_scope,unaffected_scope)
         VALUES($1,'projection_rebuild_v1',$2,'accepted',1,'Evidence & Capability','owner',$3,$4,1,'stage-05-content-v1',transaction_timestamp()+interval '5 minutes',3,'[]','[]')`,
        [randomUUID(), "projection:kept", chain.learnerScopeId, hex("projection")],
      );
      await expect(
        pool.query(
          `INSERT INTO app.job_resources(id,kind,semantic_identity,state,revision,owner,actor_scope,learner_scope_id,payload_digest,contract_major,release,deadline,maximum_attempts,dependent_scope,unaffected_scope)
           VALUES($1,'content_unknown_v1',$2,'accepted',1,'Content & Media','owner',$3,$4,1,'stage-05-content-v1',transaction_timestamp()+interval '5 minutes',3,'[]','[]')`,
          [randomUUID(), "unknown:1", chain.learnerScopeId, hex("unknown")],
        ),
      ).rejects.toMatchObject({ code: "23514" });

      // ---- immutability ------------------------------------------------------------------
      for (const relation of stage05ImmutableRelations) {
        const definition = await pool.query<{ definition: string }>(
          `SELECT pg_get_triggerdef(t.oid) AS definition FROM pg_trigger t
           WHERE t.tgrelid=$1::regclass AND NOT t.tgisinternal`,
          [`app.${relation}`],
        );
        expect(definition.rows.map((row) => row.definition).join("\n")).toContain(
          "reject_immutable_mutation",
        );
        const rows = await pool.query<{ count: number }>(
          `SELECT count(*)::int AS count FROM app.${relation}`,
        );
        expect(rows.rows[0]?.count).toBeGreaterThan(0);
        await expect(pool.query(`DELETE FROM app.${relation}`)).rejects.toThrow(
          "immutable_relation",
        );
      }
      await expect(
        pool.query("UPDATE app.approval_decisions SET evidence_ref='rewritten'"),
      ).rejects.toThrow("immutable_relation");
      await expect(
        pool.query("UPDATE app.objective_outcomes SET algorithm_version='rewritten'"),
      ).rejects.toThrow("immutable_relation");

      await pool.end();
    });
  });

  it("rehearses the D06 rewrite and the checksum re-upsert forward from a P03-seeded database", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      await migrateToFoundation(databaseUrl);
      const seedPool = createPostgresPool(databaseUrl);
      // Emulate a database the Stage 03 image migrated: it recorded only its own four checksums.
      await seedPool.query("DELETE FROM app.schema_revisions WHERE revision <> ALL($1)", [
        Object.keys(foundationMigrations).slice(0, 4),
      ]);
      const beforeRevisions = await seedPool.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM app.schema_revisions",
      );
      expect(beforeRevisions.rows[0]?.count).toBe(4);

      const chain = await seedLearnerChain(seedPool);
      const legacyStates = [
        "started",
        "checkpointed",
        "submitted",
        "completed",
        "interrupted",
        "not_counted",
      ] as const;
      const attempts = new Map<string, string>();
      for (const state of legacyStates) {
        attempts.set(state, await insertAttempt(seedPool, chain, state));
      }
      // The not_counted attempt carries an observation, so its meaning has somewhere to move.
      const { observationId, assertionId } = await seedObservation(
        seedPool,
        chain,
        attempts.get("not_counted") as string,
        20,
      );
      await seedPool.end();

      const result = await migrateDatabase(databaseUrl);
      expect(result.fromRevision).toBe(foundationRevision);
      expect(result.toRevision).toBe(stage05Revision);
      expect(result.applied).toEqual([
        "20260901_051_content_graph",
        "20260901_052_attempt_runtime",
        "20260901_053_content_impact",
        stage05Revision,
      ]);

      const pool = createPostgresPool(databaseUrl);
      const rewritten = await pool.query<{ id: string; state: string }>(
        "SELECT id,state FROM app.attempts WHERE learner_scope_id=$1",
        [chain.learnerScopeId],
      );
      const stateById = new Map(rewritten.rows.map((row) => [row.id, row.state]));
      expect(stateById.get(attempts.get("started") as string)).toBe("in_progress");
      expect(stateById.get(attempts.get("completed") as string)).toBe("result_available");
      expect(stateById.get(attempts.get("checkpointed") as string)).toBe("checkpointed");
      expect(stateById.get(attempts.get("submitted") as string)).toBe("submitted");
      expect(stateById.get(attempts.get("interrupted") as string)).toBe("interrupted");
      expect(stateById.get(attempts.get("not_counted") as string)).toBe("interrupted");

      // The meaning of not_counted moved into validity rather than vanishing.
      const chainRows = await pool.query<{
        id: string;
        state: string;
        reason_code: string;
        reason_registry_id: string;
        prior_assertion_id: string | null;
        affected_scope: unknown;
        unaffected_scope: unknown;
        actor_ref: string;
      }>(
        `SELECT id,state,reason_code,reason_registry_id,prior_assertion_id,affected_scope,unaffected_scope,actor_ref
           FROM app.validity_assertions WHERE observation_id=$1 ORDER BY recorded_at`,
        [observationId],
      );
      expect(chainRows.rows).toHaveLength(2);
      const appended = chainRows.rows[1];
      expect(appended).toMatchObject({
        state: "not_counted",
        reason_code: "VALIDITY.RESPONSE_STRUCTURALLY_INVALID",
        reason_registry_id: reasonRegistryRelease.id,
        prior_assertion_id: assertionId,
        actor_ref: "migration:20260901_052_attempt_runtime",
      });
      expect(appended?.affected_scope).toEqual(["written", "oral"]);
      expect(appended?.unaffected_scope).toEqual([]);
      const current = await pool.query<{ current_assertion_id: string }>(
        "SELECT current_assertion_id FROM app.evidence_observations WHERE id=$1",
        [observationId],
      );
      expect(current.rows[0]?.current_assertion_id).toBe(appended?.id);

      // Only the rows that needed rewriting were touched: the untouched observation chain of the
      // other five attempts does not exist, so exactly one assertion was appended overall.
      const appendedCount = await pool.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM app.validity_assertions WHERE actor_ref='migration:20260901_052_attempt_runtime'",
      );
      expect(appendedCount.rows[0]?.count).toBe(1);

      // §8.2b: the terminal migration re-upserted the whole map onto a four-row table.
      const revisions = await pool.query<{ revision: string; checksum: string }>(
        "SELECT revision,checksum FROM app.schema_revisions ORDER BY revision",
      );
      expect(Object.fromEntries(revisions.rows.map((row) => [row.revision, row.checksum]))).toEqual(
        migrationChecksums,
      );
      await expect(
        checkSchemaCompatibility(pool, foundationRevision, stage05Revision),
      ).resolves.toMatchObject({ compatible: true, observedRevision: stage05Revision });

      // Re-running is a no-op, and the old spellings are gone for good.
      const replay = await migrateDatabase(databaseUrl);
      expect(replay.applied).toEqual([]);
      await expect(insertAttempt(pool, chain, "not_counted")).rejects.toMatchObject({
        code: "23514",
      });
      await pool.end();
    });
  });
});

/* ------------------------------------------------------------------------------------------------
 * The content repository against a real database
 * ---------------------------------------------------------------------------------------------- */

/** Makes one seeded revision servable: a current rights envelope and a passing a11y manifest. */
async function makeServable(pool: Pool, chain: SeededChain): Promise<void> {
  const rightsEnvelopeId = randomUUID();
  const accessibilityManifestId = `accessibility/${chain.contentRevisionId}`;
  await pool.query(
    `INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest)
     VALUES($1,$2,'current','{}',$3)`,
    [rightsEnvelopeId, `rights/${chain.contentRevisionId}`, hex(`rights:${rightsEnvelopeId}`)],
  );
  await pool.query(
    `INSERT INTO app.accessibility_manifests(id,manifest,language_tag,gate_status,digest)
     VALUES($1,'{}','de','pass',$2)`,
    [accessibilityManifestId, hex(`a11y:${accessibilityManifestId}`)],
  );
  await pool.query(
    `UPDATE app.content_revisions
        SET content_class='C2', rights_envelope_id=$2, accessibility_manifest_id=$3
      WHERE id=$1`,
    [chain.contentRevisionId, rightsEnvelopeId, accessibilityManifestId],
  );
}

function scopeOf(chain: SeededChain): AuthorizedScope {
  return {
    principalId: appId<"principal">(randomUUID()),
    learnerScopeId: appId<"learner_scope">(chain.learnerScopeId),
    actorKind: "owner",
    capabilities: [],
    authenticatedAt: new Date("2026-09-01T09:00:00.000Z"),
  };
}

const issuedAt = new Date("2026-09-01T10:00:00.000Z");
const expiresAt = new Date("2026-09-01T10:45:00.000Z");
const releaseIdentity = "content-release/integration";

function approvalFor(
  chain: SeededChain,
  level: ContentApprovalLevel,
  decidedAt: string,
  overrides: Partial<ApprovalDecisionInput> = {},
): ApprovalDecisionInput {
  return {
    decisionId: randomUUID(),
    subjectKind: "content_revision",
    subjectId: chain.contentRevisionId,
    contentClass: "C2",
    level,
    outcome: "granted",
    authorRef: "owner:author",
    validatorRef: "owner:validator",
    approverRef: "owner:approver",
    methodVersion: "content-qa-gates/v1",
    reasonCode: "VALIDITY.CONTENT_APPROVAL",
    evidenceRef: `gate-report/${level}`,
    decidedAt: new Date(decidedAt),
    ...overrides,
  };
}

function issueFor(
  chain: SeededChain,
  overrides: Partial<ServingManifestIssueRequest> = {},
): ServingManifestIssueRequest {
  const servingManifestId = randomUUID();
  return {
    servingManifestId: appId<"serving_manifest">(servingManifestId),
    operationId: appId<"operation">(randomUUID()),
    contentClass: "C2",
    approvalRole: "independent_b1",
    entries: [
      { ordinal: 1, contentRevisionId: appId<"content_revision">(chain.contentRevisionId) },
    ],
    keyRevisionDigests: [hex(`key:${chain.contentRevisionId}`)],
    allowedConditions: { navigation: "linear" },
    learnerSafePayloadDigest: hex(`payload:${servingManifestId}`),
    freshnessDecision: "fresh",
    comparedFamilyRefs: [chain.contentFamilyId],
    authorizationVersion: "authorization/v1",
    contentReleaseIdentity: releaseIdentity,
    issuedAt,
    expiresAt,
    digest: hex(`manifest:${servingManifestId}`),
    ...overrides,
  };
}

/** Publishes one release containing the chain's revision, under the shared release identity. */
async function publishRelease(
  repository: PostgresContentRepository,
  chain: SeededChain,
  ordinal: number,
): Promise<string> {
  const releaseId = `${releaseIdentity}#${ordinal}:${chain.contentRevisionId}`;
  const published = await repository.publishContentRelease({
    releaseId,
    releaseIdentity,
    digest: hex(`release:${releaseId}`),
    entries: [{ contentRevisionId: appId<"content_revision">(chain.contentRevisionId) }],
    activatedAt: new Date(`2026-09-0${ordinal}T07:00:00.000Z`),
  });
  expect(published).toEqual({ ok: true, value: { disposition: "created", releaseId } });
  return releaseId;
}

describe.skipIf(!testDatabaseUrl)("PostgreSQL 18 content repository", () => {
  it("gates issuance on the active release and keeps issuing across a release rotation", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      await migrateDatabase(databaseUrl);
      const pool = createPostgresPool(databaseUrl);
      const repository = new PostgresContentRepository(pool);
      const chain = await seedLearnerChain(pool);
      await makeServable(pool, chain);
      const scope = scopeOf(chain);

      // A revision with no approval decision at all cannot be leased.
      const releaseId = await publishRelease(repository, chain, 1);
      expect(await repository.issueServingManifest(scope, issueFor(chain))).toEqual({
        ok: false,
        error: "approval_ineligible",
      });

      // The chain starts where `draft` reaches and walks one legal arrow at a time.
      expect(
        await repository.appendApprovalDecision(
          approvalFor(chain, "independent_b1", "2026-09-01T06:00:00.000Z"),
        ),
      ).toEqual({ ok: false, error: "illegal_transition" });
      expect(
        await repository.appendApprovalDecision(
          approvalFor(chain, "training", "2026-09-01T06:00:00.000Z"),
        ),
      ).toEqual({ ok: true, value: { disposition: "created" } });
      expect(
        await repository.appendApprovalDecision(
          approvalFor(chain, "independent_b1", "2026-09-01T07:30:00.000Z"),
        ),
      ).toEqual({ ok: true, value: { disposition: "created", priorLevel: "training" } });
      expect(
        (await repository.readApprovalChain("content_revision", chain.contentRevisionId)).map(
          (entry) => entry.level,
        ),
      ).toEqual(["training", "independent_b1"]);

      const issued = await repository.issueServingManifest(scope, issueFor(chain));
      expect(issued.ok).toBe(true);

      // Re-running the same publication is a no-op; the same id under a different digest is not.
      expect(
        await repository.publishContentRelease({
          releaseId,
          releaseIdentity,
          digest: hex(`release:${releaseId}`),
          entries: [{ contentRevisionId: appId<"content_revision">(chain.contentRevisionId) }],
          activatedAt: new Date("2026-09-01T07:00:00.000Z"),
        }),
      ).toEqual({ ok: true, value: { disposition: "replayed", releaseId } });
      expect(
        await repository.publishContentRelease({
          releaseId,
          releaseIdentity,
          digest: hex("a different release"),
          entries: [{ contentRevisionId: appId<"content_revision">(chain.contentRevisionId) }],
          activatedAt: new Date("2026-09-01T07:00:00.000Z"),
        }),
      ).toEqual({ ok: false, error: "conflict" });

      // Two rotations. The revision now belongs to three `content_release_entries` rows — one per
      // release — of which exactly one release is active. Joining that table to answer "is this
      // revision in the active release" produced three rows for one revision and let row order
      // decide; the correlated EXISTS produces one row and one answer.
      await publishRelease(repository, chain, 2);
      await publishRelease(repository, chain, 3);
      const entryRows = await pool.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM app.content_release_entries WHERE content_revision_id=$1",
        [chain.contentRevisionId],
      );
      expect(entryRows.rows[0]?.count).toBe(3);
      const activeReleases = await pool.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM app.content_releases WHERE release_identity=$1 AND state='active'",
        [releaseIdentity],
      );
      expect(activeReleases.rows[0]?.count).toBe(1);
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const again = await repository.issueServingManifest(scope, issueFor(chain));
        expect(again.ok, `issuance ${attempt} after rotation`).toBe(true);
      }

      // Now roll back to the FIRST release: it becomes active again and the newest is retired. The
      // active entry is no longer the last row the join would produce for this revision, which is
      // the arrangement under which the old join silently answered `content_unavailable` for a
      // perfectly servable revision.
      await pool.query(
        "UPDATE app.content_releases SET state='retired',retired_at=transaction_timestamp() WHERE release_identity=$1 AND state='active'",
        [releaseIdentity],
      );
      await pool.query("UPDATE app.content_releases SET state='active' WHERE id=$1", [releaseId]);
      const rolledBack = await repository.issueServingManifest(scope, issueFor(chain));
      expect(rolledBack.ok, "issuance after a rollback to the first release").toBe(true);

      // A lease that cites a release identity nobody published is refused.
      expect(
        await repository.issueServingManifest(
          scope,
          issueFor(chain, { contentReleaseIdentity: "content-release/never-published" }),
        ),
      ).toEqual({ ok: false, error: "content_unavailable" });

      await pool.end();
    });
  });

  it("replays every content command exactly and refuses a conflicting reuse of one identity", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      await migrateDatabase(databaseUrl);
      const pool = createPostgresPool(databaseUrl);
      const repository = new PostgresContentRepository(pool);
      const chain = await seedLearnerChain(pool);
      await makeServable(pool, chain);
      const scope = scopeOf(chain);
      await publishRelease(repository, chain, 1);
      await repository.appendApprovalDecision(
        approvalFor(chain, "training", "2026-09-01T06:00:00.000Z"),
      );
      const promotion = approvalFor(chain, "independent_b1", "2026-09-01T07:30:00.000Z");
      expect(await repository.appendApprovalDecision(promotion)).toMatchObject({ ok: true });

      // ---- the approval chain ------------------------------------------------------------
      expect(await repository.appendApprovalDecision(promotion)).toEqual({
        ok: true,
        value: { disposition: "replayed" },
      });
      // Same decision id, different reason. Nothing is overwritten — the relation is append-only —
      // but answering `replayed` would tell the caller a decision it never made had been recorded.
      expect(
        await repository.appendApprovalDecision({
          ...promotion,
          reasonCode: "VALIDITY.RIGHTS_COMPATIBILITY",
        }),
      ).toEqual({ ok: false, error: "idempotency_conflict" });
      expect(
        await repository.appendApprovalDecision({ ...promotion, evidenceRef: "gate-report/other" }),
      ).toEqual({ ok: false, error: "idempotency_conflict" });
      const decisions = await pool.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM app.approval_decisions WHERE subject_id=$1",
        [chain.contentRevisionId],
      );
      expect(decisions.rows[0]?.count).toBe(2);
      // Stage 05 decisions cite the v1.1 registry so a Stage 05 code stays addressable.
      const registries = await pool.query<{ reason_registry_id: string }>(
        "SELECT DISTINCT reason_registry_id FROM app.approval_decisions WHERE subject_id=$1",
        [chain.contentRevisionId],
      );
      expect(registries.rows.map((row) => row.reason_registry_id)).toEqual([
        reasonRegistryRelease.id,
      ]);

      // ---- the serving lease: a reconnect issues no second lease and no second ordinal ----
      const request = issueFor(chain);
      const first = await repository.issueServingManifest(scope, request);
      expect(first.ok).toBe(true);
      if (!first.ok) return;
      const replayed = await repository.issueServingManifest(scope, request);
      expect(replayed.ok).toBe(true);
      if (!replayed.ok) return;
      expect(replayed.value.disposition).toBe("replayed");
      expect(replayed.value.manifest).toEqual(first.value.manifest);
      expect(
        await repository.issueServingManifest(scope, {
          ...request,
          servingManifestId: appId<"serving_manifest">(randomUUID()),
          digest: hex("a different lease"),
        }),
      ).toEqual({ ok: false, error: "idempotency_conflict" });
      const leases = await pool.query<{ manifests: number; entries: number }>(
        `SELECT (SELECT count(*)::int FROM app.serving_manifests WHERE learner_scope_id=$1) AS manifests,
                (SELECT count(*)::int FROM app.serving_manifest_entries WHERE learner_scope_id=$1) AS entries`,
        [chain.learnerScopeId],
      );
      expect(leases.rows[0]).toEqual({ manifests: 1, entries: 1 });
      // Only key digests reached the relation.
      const stored = await pool.query<{ key_revision_digests: string[] }>(
        "SELECT key_revision_digests FROM app.serving_manifests WHERE id=$1",
        [request.servingManifestId],
      );
      expect(
        stored.rows[0]?.key_revision_digests.every((entry) => /^[a-f0-9]{64}$/.test(entry)),
      ).toBe(true);

      // ---- the exposure index: a reconnect counts once -----------------------------------
      const exposure = {
        operationId: appId<"operation">(randomUUID()),
        contentFamilyId: appId<"content_family">(chain.contentFamilyId),
        exposureClass: "answer_exposed" as const,
        trigger: "key_or_rationale" as const,
        occurredAt: issuedAt,
        payloadDigest: hex("exposure"),
      };
      expect(await repository.recordExposure(scope, exposure)).toEqual({
        ok: true,
        value: { disposition: "created", exposureClass: "answer_exposed" },
      });
      expect(await repository.recordExposure(scope, exposure)).toEqual({
        ok: true,
        value: { disposition: "replayed", exposureClass: "answer_exposed" },
      });
      expect(
        await repository.recordExposure(scope, { ...exposure, payloadDigest: hex("different") }),
      ).toEqual({ ok: false, error: "idempotency_conflict" });
      // A later, weaker trigger under a NEW operation counts, and never downgrades the class.
      expect(
        await repository.recordExposure(scope, {
          ...exposure,
          operationId: appId<"operation">(randomUUID()),
          exposureClass: "exposed_family",
          trigger: "learner_visible_stimulus",
          payloadDigest: hex("exposure-2"),
        }),
      ).toEqual({ ok: true, value: { disposition: "created", exposureClass: "answer_exposed" } });
      expect(
        await repository.readExposureIndex(scope, [appId<"content_family">(chain.contentFamilyId)]),
      ).toMatchObject([{ exposureClass: "answer_exposed", occurrenceCount: 2 }]);

      // ---- the defect report --------------------------------------------------------------
      const report = {
        defectReportId: randomUUID(),
        operationId: appId<"operation">(randomUUID()),
        contentRevisionId: appId<"content_revision">(chain.contentRevisionId),
        category: "ambiguous_key" as const,
        note: "Two options both fit the passage.",
        reportedAt: issuedAt,
      };
      expect(await repository.appendDefectReport(scope, report)).toEqual({
        ok: true,
        value: { disposition: "created", defectReportId: report.defectReportId },
      });
      expect(await repository.appendDefectReport(scope, report)).toEqual({
        ok: true,
        value: { disposition: "replayed", defectReportId: report.defectReportId },
      });
      expect(
        await repository.appendDefectReport(scope, { ...report, category: "media_defect" }),
      ).toEqual({ ok: false, error: "idempotency_conflict" });
      const reports = await pool.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM app.content_defect_reports WHERE learner_scope_id=$1",
        [chain.learnerScopeId],
      );
      expect(reports.rows[0]?.count).toBe(1);

      // ---- the content job ----------------------------------------------------------------
      const job = {
        jobId: appId<"job">(randomUUID()),
        learnerScopeId: appId<"learner_scope">(chain.learnerScopeId),
        kind: "content_publication_v1" as const,
        semanticIdentity: `${releaseIdentity}#1`,
        payloadDigest: hex("job"),
        deadline: new Date("2026-09-01T12:00:00.000Z"),
        maximumAttempts: 4,
      };
      expect(await repository.acceptContentJob(job)).toEqual({
        ok: true,
        value: { disposition: "created", jobId: job.jobId },
      });
      expect(
        await repository.acceptContentJob({ ...job, jobId: appId<"job">(randomUUID()) }),
      ).toEqual({ ok: true, value: { disposition: "replayed", jobId: job.jobId } });
      expect(
        await repository.acceptContentJob({
          ...job,
          jobId: appId<"job">(randomUUID()),
          payloadDigest: hex("different job"),
        }),
      ).toEqual({ ok: false, error: "idempotency_conflict" });
      const jobRow = await pool.query<{ owner: string; release: string; count: number }>(
        `SELECT owner,release,(SELECT count(*)::int FROM app.job_resources) AS count
           FROM app.job_resources WHERE id=$1`,
        [job.jobId],
      );
      expect(jobRow.rows[0]).toMatchObject({
        owner: "content",
        release: jobPolicyFor("content_publication_v1").revision,
        count: 1,
      });
      expect(jobRow.rows[0]?.release).not.toBe(foundationJobPolicy.revision);

      await pool.end();
    });
  });

  it("stops serving on a withdrawal without rewriting one validity assertion", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      await migrateDatabase(databaseUrl);
      const pool = createPostgresPool(databaseUrl);
      const repository = new PostgresContentRepository(pool);
      const chain = await seedLearnerChain(pool);
      await makeServable(pool, chain);
      const scope = scopeOf(chain);
      await publishRelease(repository, chain, 1);
      await repository.appendApprovalDecision(
        approvalFor(chain, "training", "2026-09-01T06:00:00.000Z"),
      );
      await repository.appendApprovalDecision(
        approvalFor(chain, "independent_b1", "2026-09-01T07:30:00.000Z"),
      );

      const issued = await repository.issueServingManifest(scope, issueFor(chain));
      expect(issued.ok).toBe(true);
      if (!issued.ok) return;
      const manifest = issued.value.manifest;

      // The attempt pins the lease, and its observation is the history the withdrawal must not touch.
      const attemptId = await insertAttempt(pool, chain, "in_progress");
      await pool.query(
        "UPDATE app.attempts SET serving_manifest_id=$2 WHERE id=$1 AND learner_scope_id=$3",
        [attemptId, manifest.servingManifestId, chain.learnerScopeId],
      );
      const observation = await seedObservation(pool, chain, attemptId, 1);
      const historyBefore = await pool.query<{ digest: string }>(
        `SELECT md5(string_agg(a.id::text || a.state || a.affected_scope::text || a.unaffected_scope::text, '|' ORDER BY a.id)) AS digest
           FROM app.validity_assertions a WHERE a.learner_scope_id=$1`,
        [chain.learnerScopeId],
      );

      // The rights envelope is withdrawn. Serving stops; nothing else moves.
      await pool.query("UPDATE app.rights_envelopes SET state='withdrawn' WHERE envelope_key=$1", [
        `rights/${chain.contentRevisionId}`,
      ]);
      expect(await repository.issueServingManifest(scope, issueFor(chain))).toEqual({
        ok: false,
        error: "rights_withdrawn",
      });
      expect(
        await repository.revokeServingManifest(
          scope,
          manifest.servingManifestId,
          "revoked_after_pin",
        ),
      ).toEqual({ ok: true, value: { disposition: "created" } });
      expect(
        await repository.revokeServingManifest(
          scope,
          manifest.servingManifestId,
          "revoked_after_pin",
        ),
      ).toEqual({ ok: true, value: { disposition: "replayed" } });
      expect(
        await repository.revokeServingManifest(
          scope,
          manifest.servingManifestId,
          "revoked_before_start",
        ),
      ).toEqual({ ok: false, error: "conflict" });

      // The attempt already under way still resolves its exact pinned material.
      const resolved = await repository.readServingManifest(scope, manifest.servingManifestId);
      expect(resolved).toEqual({ ...manifest, revocationState: "revoked_after_pin" });
      expect(resolved?.entries).toEqual(manifest.entries);
      expect(resolved?.contentReleaseIdentity).toBe(manifest.contentReleaseIdentity);

      // Not one validity assertion moved, and the observation still points at the same one.
      const historyAfter = await pool.query<{ digest: string }>(
        `SELECT md5(string_agg(a.id::text || a.state || a.affected_scope::text || a.unaffected_scope::text, '|' ORDER BY a.id)) AS digest
           FROM app.validity_assertions a WHERE a.learner_scope_id=$1`,
        [chain.learnerScopeId],
      );
      expect(historyAfter.rows[0]?.digest).toBe(historyBefore.rows[0]?.digest);
      const current = await pool.query<{ current_assertion_id: string }>(
        "SELECT current_assertion_id FROM app.evidence_observations WHERE id=$1",
        [observation.observationId],
      );
      expect(current.rows[0]?.current_assertion_id).toBe(observation.assertionId);

      // A quarantine after the pin behaves the same way: no new lease, the old lease intact.
      await pool.query("UPDATE app.rights_envelopes SET state='current' WHERE envelope_key=$1", [
        `rights/${chain.contentRevisionId}`,
      ]);
      expect(
        await repository.appendApprovalDecision(
          approvalFor(chain, "quarantine", "2026-09-01T11:00:00.000Z"),
        ),
      ).toEqual({ ok: true, value: { disposition: "created", priorLevel: "independent_b1" } });
      expect(await repository.issueServingManifest(scope, issueFor(chain))).toEqual({
        ok: false,
        error: "approval_ineligible",
      });
      expect(await repository.readServingManifest(scope, manifest.servingManifestId)).toEqual({
        ...manifest,
        revocationState: "revoked_after_pin",
      });

      await pool.end();
    });
  });

  it("resolves impact targets inside their scope bound and leaves the unaffected observation byte-identical", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      await migrateDatabase(databaseUrl);
      const pool = createPostgresPool(databaseUrl);
      const repository = new PostgresContentRepository(pool);
      const chain = await seedLearnerChain(pool);
      const neighbour = await seedLearnerChain(pool);
      await makeServable(pool, chain);
      const scope = scopeOf(chain);
      await publishRelease(repository, chain, 1);
      await repository.appendApprovalDecision(
        approvalFor(chain, "training", "2026-09-01T06:00:00.000Z"),
      );
      await repository.appendApprovalDecision(
        approvalFor(chain, "independent_b1", "2026-09-01T07:30:00.000Z"),
      );

      // One observation reached through the pinned serving manifest, one through the Stage 03
      // `app.attempts.content_revision_id` column that predates it, and one in another learner scope.
      const issued = await repository.issueServingManifest(scope, issueFor(chain));
      expect(issued.ok).toBe(true);
      if (!issued.ok) return;
      const pinnedAttempt = await insertAttempt(pool, chain, "result_available");
      await pool.query(
        "UPDATE app.attempts SET serving_manifest_id=$2 WHERE id=$1 AND learner_scope_id=$3",
        [pinnedAttempt, issued.value.manifest.servingManifestId, chain.learnerScopeId],
      );
      const pinned = await seedObservation(pool, chain, pinnedAttempt, 1);
      const legacyAttempt = await insertAttempt(pool, chain, "result_available");
      const legacy = await seedObservation(pool, chain, legacyAttempt, 2);
      const foreignAttempt = await insertAttempt(pool, neighbour, "result_available");
      const foreign = await seedObservation(pool, neighbour, foreignAttempt, 1);

      const byRevision = await repository.resolveImpactTargets(
        { contentRevisionIds: [appId<"content_revision">(chain.contentRevisionId)] },
        [appId<"learner_scope">(chain.learnerScopeId)],
      );
      expect(byRevision.map((target) => target.observationId).sort()).toEqual(
        [pinned.observationId, legacy.observationId].sort(),
      );
      // The neighbour's observation shares the content family and is still not reachable: the
      // learner scope bound is the fence, not a filter applied afterwards.
      expect(byRevision.some((target) => target.observationId === foreign.observationId)).toBe(
        false,
      );
      expect(
        await repository.resolveImpactTargets(
          { contentFamilyIds: [appId<"content_family">(chain.contentFamilyId)] },
          [appId<"learner_scope">(chain.learnerScopeId)],
        ),
      ).toHaveLength(2);
      expect(
        await repository.resolveImpactTargets(
          { observationIds: [appId<"evidence_observation">(pinned.observationId)] },
          [appId<"learner_scope">(chain.learnerScopeId)],
        ),
      ).toEqual([{ learnerScopeId: chain.learnerScopeId, observationId: pinned.observationId }]);
      // An empty selector selects nothing at all rather than everything in the bound.
      expect(
        await repository.resolveImpactTargets({}, [appId<"learner_scope">(chain.learnerScopeId)]),
      ).toEqual([]);

      // A rights takedown is serving-only: it may name no validity assertion at all.
      const servingOnlyId = randomUUID();
      expect(
        await repository.appendImpactAssertion({
          impactAssertionId: servingOnlyId,
          incidentId: "incident/rights",
          ownerContext: "Content & Publication",
          actorRef: "owner",
          authorizationVersion: "authorization/v1",
          causeKind: "rights_takedown",
          impactMode: "serving_only",
          selectors: { observationIds: [appId<"evidence_observation">(pinned.observationId)] },
          learnerScopeBound: [appId<"learner_scope">(chain.learnerScopeId)],
          declaredCardinality: 1,
          affectedScope: [],
          unaffectedScope: ["written", "oral"],
          reasonCode: "VALIDITY.RIGHTS_COMPATIBILITY",
          evidenceRefs: ["incident/rights"],
          policyAndContractVersions: { canonicalization: "canonical-json/v1" },
          effectiveAt: issuedAt,
          digest: hex(`impact:${servingOnlyId}`),
        }),
      ).toEqual({ ok: true, value: { disposition: "created" } });
      expect(
        await repository.recordImpactTargets(servingOnlyId, [
          {
            learnerScopeId: appId<"learner_scope">(chain.learnerScopeId),
            observationId: appId<"evidence_observation">(pinned.observationId),
            assertionId: pinned.assertionId,
            disposition: "resolved",
          },
        ]),
      ).toEqual({ ok: false, error: "conflict" });

      const unaffectedBefore = await pool.query<{ digest: string }>(
        `SELECT md5(o.*::text || a.*::text) AS digest
           FROM app.evidence_observations o JOIN app.validity_assertions a ON a.id=o.current_assertion_id
          WHERE o.id=$1`,
        [legacy.observationId],
      );

      expect(
        await repository.recordImpactTargets(servingOnlyId, [
          {
            learnerScopeId: appId<"learner_scope">(chain.learnerScopeId),
            observationId: appId<"evidence_observation">(pinned.observationId),
            disposition: "resolved",
          },
        ]),
      ).toEqual({ ok: true, value: { recorded: 1, total: 1 } });
      // The retry inserts nothing and still reports the committed set, so a replay is not mistaken
      // for a resolution that reached nothing.
      expect(
        await repository.recordImpactTargets(servingOnlyId, [
          {
            learnerScopeId: appId<"learner_scope">(chain.learnerScopeId),
            observationId: appId<"evidence_observation">(pinned.observationId),
            disposition: "resolved",
          },
        ]),
      ).toEqual({ ok: true, value: { recorded: 0, total: 1 } });

      // The unaffected observation is byte-identical, and the serving-only impact appended no
      // validity assertion for anyone.
      const unaffectedAfter = await pool.query<{ digest: string }>(
        `SELECT md5(o.*::text || a.*::text) AS digest
           FROM app.evidence_observations o JOIN app.validity_assertions a ON a.id=o.current_assertion_id
          WHERE o.id=$1`,
        [legacy.observationId],
      );
      expect(unaffectedAfter.rows[0]?.digest).toBe(unaffectedBefore.rows[0]?.digest);
      const assertionCount = await pool.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM app.validity_assertions WHERE learner_scope_id=$1",
        [chain.learnerScopeId],
      );
      expect(assertionCount.rows[0]?.count).toBe(2);

      // A replay of the assertion itself, and a different assertion under the same id.
      const replayInput = {
        impactAssertionId: servingOnlyId,
        incidentId: "incident/rights",
        ownerContext: "Content & Publication",
        actorRef: "owner",
        authorizationVersion: "authorization/v1",
        causeKind: "rights_takedown" as const,
        impactMode: "serving_only" as const,
        selectors: { observationIds: [appId<"evidence_observation">(pinned.observationId)] },
        learnerScopeBound: [appId<"learner_scope">(chain.learnerScopeId)],
        declaredCardinality: 1,
        affectedScope: [],
        unaffectedScope: ["written", "oral"],
        reasonCode: "VALIDITY.RIGHTS_COMPATIBILITY",
        evidenceRefs: ["incident/rights"],
        policyAndContractVersions: { canonicalization: "canonical-json/v1" },
        effectiveAt: issuedAt,
        digest: hex(`impact:${servingOnlyId}`),
      };
      expect(await repository.appendImpactAssertion(replayInput)).toEqual({
        ok: true,
        value: { disposition: "replayed" },
      });
      expect(
        await repository.appendImpactAssertion({ ...replayInput, digest: hex("something else") }),
      ).toEqual({ ok: false, error: "idempotency_conflict" });

      await pool.end();
    });
  });
});
