import { Kysely, PostgresDialect } from "kysely";
import { type Migration, type MigrationProvider, Migrator } from "kysely/migration";
import { Pool, type PoolConfig } from "pg";
import { PgBoss } from "pg-boss";
import { foundationQueues, jobPolicyFor } from "../jobs/index.js";
import { foundationMigrations, migrationChecksums } from "./migrations.js";

interface EmptyDatabase {
  readonly _stage01NoProductTables: never;
}

const migrationLockId = 420_101;

class FoundationMigrationProvider implements MigrationProvider {
  public async getMigrations(): Promise<Record<string, Migration>> {
    return { ...foundationMigrations };
  }
}

export interface MigrationResult {
  readonly fromRevision: string;
  readonly toRevision: string;
  readonly applied: readonly string[];
}

export interface SchemaCompatibility {
  readonly compatible: boolean;
  readonly observedRevision: string;
  readonly minimumRevision: string;
  readonly maximumRevision: string;
}

export interface DatabaseReadiness extends SchemaCompatibility {
  readonly connected: boolean;
}

export function createPostgresPool(databaseUrl: string, overrides: PoolConfig = {}): Pool {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10_000,
    ...overrides,
  });
  // Dependency loss on an idle client must degrade readiness, not crash the process or leak raw
  // PostgreSQL detail. The next readiness query discards the failed client and proves recovery.
  pool.on("error", () => undefined);
  return pool;
}

async function observedRevision(pool: Pool): Promise<string> {
  const relation = await pool.query<{ migration_table: string | null }>(
    "SELECT to_regclass('public.kysely_migration')::text AS migration_table",
  );
  if (!relation.rows[0]?.migration_table) return "uninitialized";
  const latest = await pool.query<{ name: string }>(
    "SELECT name FROM kysely_migration ORDER BY timestamp DESC, name DESC LIMIT 1",
  );
  return latest.rows[0]?.name ?? "baseline";
}

async function verifyMigrationChecksums(pool: Pool): Promise<void> {
  const relation = await pool.query<{ relation: string | null }>(
    "SELECT to_regclass('app.schema_revisions')::text AS relation",
  );
  if (!relation.rows[0]?.relation) return;
  const observed = await pool.query<{ revision: string; checksum: string }>(
    "SELECT revision, checksum FROM app.schema_revisions ORDER BY revision",
  );
  const expected = Object.entries(migrationChecksums);
  if (
    observed.rows.length !== expected.length ||
    expected.some(
      ([revision, checksum]) =>
        observed.rows.find((entry) => entry.revision === revision)?.checksum !== checksum,
    )
  ) {
    throw new Error("Schema migration checksum drift detected");
  }
}

async function migratePgBoss(databaseUrl: string): Promise<void> {
  const boss = new PgBoss({
    connectionString: databaseUrl,
    schema: "pgboss",
    migrate: true,
    createSchema: true,
    supervise: false,
    schedule: false,
  });
  boss.on("error", () => undefined);
  await boss.start();
  for (const queue of foundationQueues) {
    const policy = jobPolicyFor(queue);
    await boss.createQueue(queue, {
      expireInSeconds: policy.leaseSeconds,
      retryLimit: policy.retryLimit,
      retryDelay: policy.retryDelaySeconds,
      retryBackoff: policy.retryBackoff,
      retentionSeconds: policy.retentionDays * 86_400,
    });
  }
  await boss.stop({ graceful: true, timeout: 5_000 });
}

export async function migrateDatabase(databaseUrl: string): Promise<MigrationResult> {
  const pool = createPostgresPool(databaseUrl, { max: 3 });
  const lockClient = await pool.connect();
  const database = new Kysely<EmptyDatabase>({ dialect: new PostgresDialect({ pool }) });
  try {
    await lockClient.query("SELECT pg_advisory_lock($1)", [migrationLockId]);
    const fromRevision = await observedRevision(pool);
    const migrator = new Migrator({ db: database, provider: new FoundationMigrationProvider() });
    const result = await migrator.migrateToLatest();
    if (result.error) throw result.error;
    await verifyMigrationChecksums(pool);
    await migratePgBoss(databaseUrl);
    const toRevision = await observedRevision(pool);
    return {
      fromRevision,
      toRevision,
      applied: (result.results ?? [])
        .filter((entry) => entry.status === "Success")
        .map((entry) => entry.migrationName),
    };
  } finally {
    await lockClient
      .query("SELECT pg_advisory_unlock($1)", [migrationLockId])
      .catch(() => undefined);
    lockClient.release();
    await database.destroy();
  }
}

export async function checkSchemaCompatibility(
  pool: Pool,
  minimumRevision: string,
  maximumRevision: string,
): Promise<SchemaCompatibility> {
  const revision = await observedRevision(pool);
  const revisions = ["baseline", ...Object.keys(foundationMigrations)];
  // Verify at EVERY known revision, not only at the Stage 03 terminal one. Gating on
  // `revision === foundationRevision` made checksum drift invisible in readiness the moment a
  // later revision became the observed one, which is a silent loss of the integrity check rather
  // than a deliberate narrowing. This is a strengthening of an existing check.
  if (revisions.includes(revision)) {
    try {
      await verifyMigrationChecksums(pool);
    } catch {
      return {
        compatible: false,
        observedRevision: "drifted",
        minimumRevision,
        maximumRevision,
      };
    }
  }
  const observedIndex = revisions.indexOf(revision);
  const minimumIndex = revisions.indexOf(minimumRevision);
  const maximumIndex = revisions.indexOf(maximumRevision);
  return {
    compatible:
      observedIndex >= 0 &&
      minimumIndex >= 0 &&
      maximumIndex >= minimumIndex &&
      observedIndex >= minimumIndex &&
      observedIndex <= maximumIndex,
    observedRevision: revision,
    minimumRevision,
    maximumRevision,
  };
}

export {
  foundationRevision,
  migrationChecksums,
  reasonRegistryV1Frozen,
  stage05Revision,
} from "./migrations.js";
export * from "./attempt-repository.js";
export * from "./content-repository.js";
export * from "./foundation-repository.js";

export async function checkDatabaseReadiness(
  pool: Pool,
  minimumRevision: string,
  maximumRevision: string,
): Promise<DatabaseReadiness> {
  try {
    await pool.query("SELECT 1 AS ready");
    return {
      connected: true,
      ...(await checkSchemaCompatibility(pool, minimumRevision, maximumRevision)),
    };
  } catch {
    return {
      connected: false,
      compatible: false,
      observedRevision: "unavailable",
      minimumRevision,
      maximumRevision,
    };
  }
}
