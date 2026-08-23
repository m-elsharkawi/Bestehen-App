import { withIsolatedDatabase } from "@bestehen/test-support";
import { describe, expect, it } from "vitest";
import {
  checkDatabaseReadiness,
  checkSchemaCompatibility,
  createPostgresPool,
  migrateDatabase,
} from "./index.js";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!testDatabaseUrl)("PostgreSQL 18 migration and compatibility", () => {
  it("uses one idempotent advisory-locked migrator and creates no product table", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      const [first, concurrent] = await Promise.all([
        migrateDatabase(databaseUrl),
        migrateDatabase(databaseUrl),
      ]);
      expect([first.toRevision, concurrent.toRevision]).toEqual(["baseline", "baseline"]);

      const pool = createPostgresPool(databaseUrl);
      const tables = await pool.query<{ table_name: string }>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
      );
      expect(tables.rows.map((row) => row.table_name)).toEqual([
        "kysely_migration",
        "kysely_migration_lock",
      ]);
      await pool.end();
    });
  });

  it("reports mismatch and recovers through a new pool after connection loss", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      await migrateDatabase(databaseUrl);
      const pool = createPostgresPool(databaseUrl);
      await expect(checkSchemaCompatibility(pool, "future", "future")).resolves.toMatchObject({
        compatible: false,
        observedRevision: "baseline",
      });
      await pool.end();
      await expect(checkDatabaseReadiness(pool, "baseline", "baseline")).resolves.toMatchObject({
        connected: false,
        compatible: false,
      });
      const recoveredPool = createPostgresPool(databaseUrl);
      await expect(
        checkDatabaseReadiness(recoveredPool, "baseline", "baseline"),
      ).resolves.toMatchObject({ connected: true, compatible: true });
      await recoveredPool.end();
    });
  });
});
