import { randomUUID } from "node:crypto";
import { appId } from "@bestehen/domain";
import { withIsolatedDatabase } from "@bestehen/test-support";
import { describe, expect, it } from "vitest";
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
      await pool.end();
    });
  });
});
