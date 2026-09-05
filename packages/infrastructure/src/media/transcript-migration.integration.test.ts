import { createHash, randomUUID } from "node:crypto";
import { withIsolatedDatabase } from "@bestehen/test-support";
import { Kysely, PostgresDialect } from "kysely";
import { Migrator } from "kysely/migration";
import type { Pool } from "pg";
import { describe, expect, it } from "vitest";
import {
  checkSchemaCompatibility,
  createPostgresPool,
  migrateDatabase,
} from "../postgres/index.js";
import {
  foundationMigrations,
  foundationRevision,
  migrationChecksums,
  stage05BindingRevision,
  stage05Revision,
} from "../postgres/migrations.js";

const databaseUrl = process.env.TEST_DATABASE_URL;
const digest = (text: string) => createHash("sha256").update(text).digest("hex");

async function at058(run: (pool: Pool, url: string) => Promise<void>) {
  await withIsolatedDatabase(databaseUrl as string, async (url) => {
    const db = new Kysely<unknown>({
      dialect: new PostgresDialect({ pool: createPostgresPool(url) }),
    });
    try {
      const result = await new Migrator({
        db,
        provider: { getMigrations: async () => ({ ...foundationMigrations }) },
      }).migrateTo(stage05BindingRevision);
      if (result.error) throw result.error;
    } finally {
      await db.destroy();
    }
    const pool = createPostgresPool(url);
    try {
      // Today's callbacks know future names. Reproduce the actual twelve-entry 058 checksum set.
      const inherited = Object.keys(migrationChecksums).slice(0, 12);
      await pool.query("DELETE FROM app.schema_revisions WHERE revision <> ALL($1)", [inherited]);
      expect(
        (await pool.query("SELECT revision,checksum FROM app.schema_revisions ORDER BY revision"))
          .rows,
      ).toEqual(
        inherited.map((revision) => ({ revision, checksum: migrationChecksums[revision] })),
      );
      expect(
        (await pool.query("SELECT name FROM kysely_migration ORDER BY name DESC LIMIT 1")).rows,
      ).toEqual([{ name: stage05BindingRevision }]);
      await run(pool, url);
    } finally {
      await pool.end();
    }
  });
}

async function fixture(pool: Pool) {
  const rightsId = randomUUID();
  const successorRightsId = randomUUID();
  for (const id of [rightsId, successorRightsId]) {
    await pool.query(
      `INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest)
      VALUES($1,$2,'current','{"synthetic":true,"allowedActions":[]}',$3)`,
      [id, `synthetic/${id}`, digest(id)],
    );
  }
  const assetId = randomUUID();
  await pool.query(
    `INSERT INTO app.media_assets(id,kind,manifest_revision,source_role,generator,qa,rights_envelope_id,status,digest)
    VALUES($1,'audio','synthetic-unpublished','deterministic_non_speech_fixture','{}','{"approved":false}',$2,'quarantined',$3)`,
    [assetId, rightsId, digest(assetId)],
  );
  const mediaId = randomUUID();
  const successorMediaId = randomUUID();
  for (const id of [mediaId, successorMediaId]) {
    await pool.query(
      `INSERT INTO app.media_revisions(id,asset_id,role,object_key,byte_digest,bytes,mime,codec,container,duration_ms,cache_policy_ref,rights_actions,manifest_digest)
      VALUES($1,$2,'web_primary',$3,$4,100,'audio/wav','pcm_u8','wav',100,'synthetic/no-cache','[]',$5)`,
      [id, assetId, `synthetic/non-speech/${id}`, digest(`bytes/${id}`), digest(id)],
    );
  }
  return { rightsId, successorRightsId, mediaId, successorMediaId };
}

interface TranscriptRow {
  id: string;
  mediaId: string;
  rightsId: string;
  phase: "after_attempt" | "after_block";
  byteDigest: string;
}
async function insert(pool: Pool, row: TranscriptRow) {
  return pool.query(
    `INSERT INTO app.transcript_revisions(id,media_revision_id,kind,answer_bearing,earliest_reveal_phase,rights_envelope_id,language,digest)
    VALUES($1,$2,'target_transcript',true,$3,$4,'de',$5)`,
    [row.id, row.mediaId, row.phase, row.rightsId, row.byteDigest],
  );
}

async function constraints(pool: Pool) {
  return (
    await pool.query<{ name: string; definition: string }>(
      "SELECT conname AS name,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='app.transcript_revisions'::regclass ORDER BY conname",
    )
  ).rows;
}

describe.skipIf(!databaseUrl)("transcript lineage correction on PostgreSQL 18", () => {
  it("P05-MEDIA-001 upgrades actual 058 rows to same-byte phase, rights and primary-media successors without rewriting history", async () => {
    await at058(async (pool, url) => {
      const ids = await fixture(pool);
      const original: TranscriptRow = {
        id: randomUUID(),
        mediaId: ids.mediaId,
        rightsId: ids.rightsId,
        phase: "after_attempt",
        byteDigest: digest("synthetic text metadata only; no published transcript object"),
      };
      await insert(pool, original);
      const before = (
        await pool.query("SELECT * FROM app.transcript_revisions WHERE id=$1", [original.id])
      ).rows;
      const oldChecksums = (
        await pool.query("SELECT revision,checksum FROM app.schema_revisions ORDER BY revision")
      ).rows;
      const oldConstraints = await constraints(pool);
      const phaseSuccessor = { ...original, id: randomUUID(), phase: "after_block" as const };
      await expect(insert(pool, phaseSuccessor)).rejects.toMatchObject({
        code: "23505",
        constraint: "transcript_revisions_digest_key",
      });
      const result = await migrateDatabase(url);
      expect(result).toMatchObject({
        fromRevision: stage05BindingRevision,
        toRevision: stage05Revision,
        applied: Object.keys(migrationChecksums).slice(12),
      });
      expect(
        (
          await pool.query(
            "SELECT revision,checksum FROM app.schema_revisions WHERE revision=ANY($1) ORDER BY revision",
            [Object.keys(migrationChecksums).slice(0, 12)],
          )
        ).rows,
      ).toEqual(oldChecksums);
      expect(await constraints(pool)).toEqual(
        oldConstraints.filter(
          (constraint) => constraint.name !== "transcript_revisions_digest_key",
        ),
      );
      const rightsSuccessor = { ...original, id: randomUUID(), rightsId: ids.successorRightsId };
      const mediaSuccessor = { ...original, id: randomUUID(), mediaId: ids.successorMediaId };
      for (const successor of [phaseSuccessor, rightsSuccessor, mediaSuccessor])
        await insert(pool, successor);
      expect(
        (await pool.query("SELECT * FROM app.transcript_revisions WHERE id=$1", [original.id]))
          .rows,
      ).toEqual(before);
      const rows = (
        await pool.query(
          "SELECT id,media_revision_id,rights_envelope_id,earliest_reveal_phase,digest FROM app.transcript_revisions ORDER BY id",
        )
      ).rows;
      expect(rows).toEqual(
        [original, phaseSuccessor, rightsSuccessor, mediaSuccessor]
          .sort((left, right) => left.id.localeCompare(right.id))
          .map((row) => ({
            id: row.id,
            media_revision_id: row.mediaId,
            rights_envelope_id: row.rightsId,
            earliest_reveal_phase: row.phase,
            digest: row.byteDigest,
          })),
      );
      for (const row of [original, phaseSuccessor, rightsSuccessor, mediaSuccessor]) {
        await expect(insert(pool, row)).rejects.toMatchObject({
          code: "23505",
          constraint: "transcript_revisions_pkey",
        });
        await expect(
          pool.query("UPDATE app.transcript_revisions SET language='en' WHERE id=$1", [row.id]),
        ).rejects.toThrow("immutable_relation");
        await expect(
          pool.query("DELETE FROM app.transcript_revisions WHERE id=$1", [row.id]),
        ).rejects.toThrow("immutable_relation");
      }
      await expect(
        insert(pool, { ...original, id: randomUUID(), byteDigest: "short" }),
      ).rejects.toMatchObject({ code: "23514" });
      await expect(
        insert(pool, { ...original, id: randomUUID(), mediaId: randomUUID() }),
      ).rejects.toMatchObject({ code: "23503" });
      await expect(
        insert(pool, { ...original, id: randomUUID(), rightsId: randomUUID() }),
      ).rejects.toMatchObject({ code: "23503" });
      expect(
        (
          await pool.query(
            "SELECT indisunique FROM pg_index WHERE indexrelid='app.transcript_revisions_digest_idx'::regclass",
          )
        ).rows,
      ).toEqual([{ indisunique: false }]);
      expect((await migrateDatabase(url)).applied).toEqual([]);
      await expect(
        checkSchemaCompatibility(pool, foundationRevision, stage05BindingRevision),
      ).resolves.toMatchObject({ compatible: false });
      await expect(
        checkSchemaCompatibility(pool, foundationRevision, stage05Revision),
      ).resolves.toMatchObject({ compatible: true });
      expect((await pool.query("SELECT * FROM app.approval_decisions")).rows).toEqual([]);
    });
  });

  it("P05-SECURITY-001 refuses a same-named constraint on different columns instead of dropping it", async () => {
    await at058(async (pool, url) => {
      await pool.query(
        "ALTER TABLE app.transcript_revisions DROP CONSTRAINT transcript_revisions_digest_key",
      );
      await pool.query(
        "ALTER TABLE app.transcript_revisions ADD CONSTRAINT transcript_revisions_digest_key UNIQUE(language,digest)",
      );
      const before = await constraints(pool);
      await expect(migrateDatabase(url)).rejects.toThrow(
        "expected transcript byte digest uniqueness not found",
      );
      expect(await constraints(pool)).toEqual(before);
      expect(
        (await pool.query("SELECT to_regclass('app.transcript_revisions_digest_idx') AS index"))
          .rows,
      ).toEqual([{ index: null }]);
    });
  });
});
