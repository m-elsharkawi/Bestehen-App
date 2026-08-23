import { Kysely, PostgresDialect } from "kysely";
import { Migrator, type Migration, type MigrationProvider } from "kysely/migration";
import { Pool, type PoolConfig } from "pg";

interface EmptyDatabase {
  readonly _stage01NoProductTables: never;
}

const migrationLockId = 420_101;

class EmptyMigrationProvider implements MigrationProvider {
  public async getMigrations(): Promise<Record<string, Migration>> {
    return {};
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

export async function migrateDatabase(databaseUrl: string): Promise<MigrationResult> {
  const pool = createPostgresPool(databaseUrl, { max: 3 });
  const lockClient = await pool.connect();
  const database = new Kysely<EmptyDatabase>({ dialect: new PostgresDialect({ pool }) });
  try {
    await lockClient.query("SELECT pg_advisory_lock($1)", [migrationLockId]);
    const fromRevision = await observedRevision(pool);
    const migrator = new Migrator({ db: database, provider: new EmptyMigrationProvider() });
    const result = await migrator.migrateToLatest();
    if (result.error) throw result.error;
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
  return {
    compatible:
      revision === "baseline" && minimumRevision === "baseline" && maximumRevision === "baseline",
    observedRevision: revision,
    minimumRevision,
    maximumRevision,
  };
}

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
