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
  stage05MediaRevision,
  stage05Revision,
  stage05RuntimeRevision,
} from "../postgres/migrations.js";

const databaseUrl = process.env.TEST_DATABASE_URL;
const hash = (text: string) => createHash("sha256").update(text).digest("hex");

async function migrated(run: (pool: Pool) => Promise<void>) {
  await withIsolatedDatabase(databaseUrl as string, async (url) => {
    await migrateDatabase(url);
    const pool = createPostgresPool(url);
    try {
      await run(pool);
    } finally {
      await pool.end();
    }
  });
}

async function contentFixture(pool: Pool) {
  const familyId = randomUUID();
  const revisionId = randomUUID();
  const itemId = randomUUID();
  await pool.query("INSERT INTO app.content_families(id,family_key) VALUES($1,$2)", [
    familyId,
    `synthetic-media-migration/${familyId}`,
  ]);
  await pool.query(
    `INSERT INTO app.content_revisions(id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest)
     VALUES($1,$2,'synthetic-v1','task','candidate','unknown','compatible',$3)`,
    [revisionId, familyId, hash(revisionId)],
  );
  await pool.query(
    `INSERT INTO app.content_items(id,content_revision_id,ordinal,response_kind,binding,scorable)
     VALUES($1,$2,1,'single_select','{"questionId":"synthetic-question"}','{}')`,
    [itemId, revisionId],
  );
  return { familyId, revisionId, itemId };
}

async function assetFixture(pool: Pool, familyId: string, legacyImage = false) {
  const assetId = randomUUID();
  const rightsId = randomUUID();
  await pool.query(
    `INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest)
     VALUES($1,$2,'current','{"synthetic":true,"allowedActions":[]}',$3)`,
    [rightsId, `synthetic/${rightsId}`, hash(rightsId)],
  );
  // Old-schema fixture is an authored image, never a tone mislabeled as reviewed speech.
  await pool.query(
    `INSERT INTO app.media_assets(id,kind,manifest_revision,content_family_id,source_role,generator,qa,
      rights_envelope_id,status,digest)
     VALUES($1,$2,'synthetic-m1',$3,$4,'{"synthetic":true}','{"approval":"none"}',$5,'current',$6)`,
    [
      assetId,
      legacyImage ? "image" : "audio",
      familyId,
      legacyImage ? "authored_image" : "deterministic_non_speech_fixture",
      rightsId,
      hash(assetId),
    ],
  );
  return assetId;
}

async function renditionFixture(pool: Pool, assetId: string) {
  const mediaId = randomUUID();
  // No real audio, approvals, or object-store writes: these rows test relational identity only.
  await pool.query(
    `INSERT INTO app.media_revisions(id,asset_id,role,object_key,byte_digest,bytes,mime,codec,container,
      duration_ms,cache_policy_ref,rights_actions,manifest_digest)
     VALUES($1,$2,'web_primary',$3,$4,100,'audio/wav','pcm','wav',1000,'synthetic/no-cache','[]',$5)`,
    [mediaId, assetId, `synthetic/non-speech/${mediaId}`, hash(`bytes/${mediaId}`), hash(mediaId)],
  );
  return mediaId;
}

interface ManifestIdentity {
  assetId: string;
  contentRevisionId: string;
  mediaIds: readonly string[];
  manifestRevision: string;
  stimulusId: string;
}

function manifestValue(input: ManifestIdentity): Record<string, unknown> {
  // Sorted ASCII keys are already canonical-json/v1. This minimal synthetic storage envelope is
  // deliberately not evidence of a fully validated or approved AudioAssetManifest.
  return {
    assetId: input.assetId,
    contentRevisionId: input.contentRevisionId,
    learnerMediaRevisions: input.mediaIds.map((mediaRevisionId) => ({ mediaRevisionId })),
    manifestRevision: input.manifestRevision,
    stimulusId: input.stimulusId,
  };
}

async function insertManifest(
  pool: Pool,
  input: ManifestIdentity,
  value = manifestValue(input),
  digestOverride?: string,
) {
  const text = JSON.stringify(value);
  return pool.query(
    `INSERT INTO app.audio_asset_manifests(asset_id,manifest_revision,content_revision_id,stimulus_id,
      canonicalization_version,canonical_manifest,digest) VALUES($1,$2,$3,$4,'canonical-json/v1',$5,$6)`,
    [
      input.assetId,
      input.manifestRevision,
      input.contentRevisionId,
      input.stimulusId,
      text,
      digestOverride ?? hash(text),
    ],
  );
}

async function insertMembership(pool: Pool, input: ManifestIdentity, mediaId: string) {
  return pool.query(
    "INSERT INTO app.audio_manifest_renditions(asset_id,manifest_revision,media_revision_id) VALUES($1,$2,$3)",
    [input.assetId, input.manifestRevision, mediaId],
  );
}

async function insertBinding(pool: Pool, input: ManifestIdentity, itemId: string, mediaId: string) {
  return pool.query(
    `INSERT INTO app.content_item_media_bindings(content_revision_id,content_item_id,stimulus_id,
      asset_id,manifest_revision,media_revision_id) VALUES($1,$2,$3,$4,$5,$6)`,
    [
      input.contentRevisionId,
      itemId,
      input.stimulusId,
      input.assetId,
      input.manifestRevision,
      mediaId,
    ],
  );
}

async function fixture(pool: Pool) {
  const content = await contentFixture(pool);
  const assetId = await assetFixture(pool, content.familyId);
  const mediaId = await renditionFixture(pool, assetId);
  const input: ManifestIdentity = {
    assetId,
    contentRevisionId: content.revisionId,
    mediaIds: [mediaId],
    manifestRevision: "synthetic-m1",
    stimulusId: "synthetic-stimulus",
  };
  return { ...content, input, mediaId };
}

describe.skipIf(!databaseUrl)("Listening additive migration on PostgreSQL 18", () => {
  for (const predecessor of [foundationRevision, stage05RuntimeRevision, stage05MediaRevision]) {
    it(`P05-MEDIA-001 rehearses ${predecessor} upgrade without rewriting inherited rows or checksums`, async () => {
      await withIsolatedDatabase(databaseUrl as string, async (url) => {
        const db = new Kysely<unknown>({
          dialect: new PostgresDialect({ pool: createPostgresPool(url) }),
        });
        try {
          const result = await new Migrator({
            db,
            provider: { getMigrations: async () => ({ ...foundationMigrations }) },
          }).migrateTo(predecessor);
          if (result.error) throw result.error;
        } finally {
          await db.destroy();
        }
        const pool = createPostgresPool(url);
        try {
          const inherited = Object.keys(migrationChecksums).slice(
            0,
            Object.keys(migrationChecksums).indexOf(predecessor) + 1,
          );
          // Reproduce predecessor's exact checksum set; current seed callbacks know future names.
          await pool.query("DELETE FROM app.schema_revisions WHERE revision <> ALL($1)", [
            inherited,
          ]);
          const before = (
            await pool.query("SELECT revision,checksum FROM app.schema_revisions ORDER BY revision")
          ).rows;
          expect(before).toEqual(
            inherited.map((revision) => ({ revision, checksum: migrationChecksums[revision] })),
          );
          let oldAssetId: string | undefined;
          let oldListening: Awaited<ReturnType<typeof fixture>> | undefined;
          let oldBindings: unknown[] = [];
          let oldConstraints: { name: string; definition: string }[] = [];
          if (predecessor === stage05RuntimeRevision) {
            const content = await contentFixture(pool);
            oldAssetId = await assetFixture(pool, content.familyId, true);
          }
          if (predecessor === stage05MediaRevision) {
            oldListening = await fixture(pool);
            await insertManifest(pool, oldListening.input);
            await insertMembership(pool, oldListening.input, oldListening.mediaId);
            await insertBinding(
              pool,
              oldListening.input,
              oldListening.itemId,
              oldListening.mediaId,
            );
            oldBindings = (await pool.query("SELECT * FROM app.content_item_media_bindings")).rows;
            oldConstraints = (
              await pool.query<{ name: string; definition: string }>(
                "SELECT conname AS name,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='app.content_item_media_bindings'::regclass ORDER BY conname",
              )
            ).rows;
            expect(oldConstraints.map((row) => row.name)).toContain(
              "content_item_media_bindings_content_revision_id_content_ite_key",
            );
          }
          const result = await migrateDatabase(url);
          expect(result.fromRevision).toBe(predecessor);
          expect(result.toRevision).toBe(stage05Revision);
          expect(result.applied).toEqual(Object.keys(migrationChecksums).slice(inherited.length));
          expect(
            (
              await pool.query(
                "SELECT revision,checksum FROM app.schema_revisions WHERE revision=ANY($1) ORDER BY revision",
                [inherited],
              )
            ).rows,
          ).toEqual(before);
          expect((await migrateDatabase(url)).applied).toEqual([]);
          if (oldListening) {
            expect(
              (await pool.query("SELECT * FROM app.content_item_media_bindings")).rows,
            ).toEqual(oldBindings);
            expect(
              (
                await pool.query(
                  "SELECT conname AS name,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='app.content_item_media_bindings'::regclass ORDER BY conname",
                )
              ).rows,
            ).toEqual(
              oldConstraints.filter(
                (row) =>
                  row.name !== "content_item_media_bindings_content_revision_id_content_ite_key",
              ),
            );
            const successor = { ...oldListening.input, manifestRevision: "synthetic-m2" };
            await insertManifest(pool, successor);
            await insertMembership(pool, successor, oldListening.mediaId);
            await insertBinding(pool, successor, oldListening.itemId, oldListening.mediaId);
            expect(
              (
                await pool.query(
                  "SELECT * FROM app.content_item_media_bindings WHERE manifest_revision=$1",
                  [oldListening.input.manifestRevision],
                )
              ).rows,
            ).toEqual(oldBindings);
            await expect(
              insertBinding(pool, successor, oldListening.itemId, oldListening.mediaId),
            ).rejects.toMatchObject({
              code: "23505",
              constraint: "content_item_media_bindings_pkey",
            });
          }
          await expect(
            checkSchemaCompatibility(pool, foundationRevision, stage05RuntimeRevision),
          ).resolves.toMatchObject({ compatible: false });
          await expect(
            checkSchemaCompatibility(pool, foundationRevision, stage05Revision),
          ).resolves.toMatchObject({ compatible: true });
          if (oldAssetId) {
            expect(
              (
                await pool.query(
                  "SELECT source_role,manifest_revision FROM app.media_assets WHERE id=$1",
                  [oldAssetId],
                )
              ).rows,
            ).toEqual([{ source_role: "authored_image", manifest_revision: "synthetic-m1" }]);
            expect(
              (
                await pool.query("SELECT * FROM app.audio_asset_manifests WHERE asset_id=$1", [
                  oldAssetId,
                ])
              ).rows,
            ).toEqual([]);
          }
          for (const revision of Object.keys(migrationChecksums).slice(8)) {
            await expect(
              foundationMigrations[revision]?.down?.(undefined as never),
            ).rejects.toThrow("roll-forward only");
          }
        } finally {
          await pool.end();
        }
      });
    });
  }

  it("P05-MEDIA-001 retains stable lineage and old manifest pins with two encodings by identity", async () => {
    await migrated(async (pool) => {
      const { input, mediaId, itemId } = await fixture(pool);
      const alternate = await renditionFixture(pool, input.assetId);
      const first = { ...input, mediaIds: [alternate, mediaId] };
      await insertManifest(pool, first);
      for (const id of [mediaId, alternate]) {
        await insertMembership(pool, first, id);
        await insertBinding(pool, first, itemId, id);
      }
      const originalBindings = (
        await pool.query(
          "SELECT * FROM app.content_item_media_bindings WHERE content_item_id=$1 AND manifest_revision=$2 ORDER BY media_revision_id",
          [itemId, first.manifestRevision],
        )
      ).rows;
      const successor = { ...input, manifestRevision: "synthetic-m2" };
      await insertManifest(pool, successor);
      await insertMembership(pool, successor, mediaId);
      await insertBinding(pool, successor, itemId, mediaId);
      await pool.query("UPDATE app.media_assets SET manifest_revision=$2 WHERE id=$1", [
        input.assetId,
        successor.manifestRevision,
      ]);
      const bindings = await pool.query(
        "SELECT manifest_revision,media_revision_id FROM app.content_item_media_bindings WHERE content_item_id=$1 ORDER BY manifest_revision,media_revision_id",
        [itemId],
      );
      expect(bindings.rows).toEqual([
        ...[mediaId, alternate]
          .sort()
          .map((id) => ({ manifest_revision: first.manifestRevision, media_revision_id: id })),
        { manifest_revision: successor.manifestRevision, media_revision_id: mediaId },
      ]);
      expect(
        (
          await pool.query(
            "SELECT * FROM app.content_item_media_bindings WHERE content_item_id=$1 AND manifest_revision=$2 ORDER BY media_revision_id",
            [itemId, first.manifestRevision],
          )
        ).rows,
      ).toEqual(originalBindings);
      await expect(insertBinding(pool, successor, itemId, mediaId)).rejects.toMatchObject({
        code: "23505",
        constraint: "content_item_media_bindings_pkey",
      });
      expect(
        (
          await pool.query(
            "SELECT manifest_revision FROM app.audio_asset_manifests WHERE asset_id=$1 ORDER BY manifest_revision",
            [input.assetId],
          )
        ).rows,
      ).toEqual([
        { manifest_revision: first.manifestRevision },
        { manifest_revision: successor.manifestRevision },
      ]);
      await expect(insertManifest(pool, first)).rejects.toMatchObject({ code: "23505" });
      await expect(insertMembership(pool, first, mediaId)).rejects.toMatchObject({ code: "23505" });
      await expect(insertBinding(pool, first, itemId, mediaId)).rejects.toMatchObject({
        code: "23505",
      });
      for (const table of [
        "audio_asset_manifests",
        "audio_manifest_renditions",
        "content_item_media_bindings",
      ]) {
        await expect(
          pool.query(`UPDATE app.${table} SET manifest_revision='rewritten'`),
        ).rejects.toThrow("immutable_relation");
        await expect(pool.query(`DELETE FROM app.${table}`)).rejects.toThrow("immutable_relation");
      }
    });
  });

  it("P05-SECURITY-001 rejects absent/null/mismatched manifest identities and incorrect byte digest", async () => {
    await migrated(async (pool) => {
      const { input } = await fixture(pool);
      for (const key of ["assetId", "manifestRevision", "contentRevisionId", "stimulusId"]) {
        for (const invalid of [undefined, null, "wrong"]) {
          const value = { ...manifestValue(input), [key]: invalid };
          await expect(insertManifest(pool, input, value)).rejects.toMatchObject({ code: "23514" });
        }
      }
      for (const invalid of [undefined, null, []]) {
        await expect(
          insertManifest(pool, input, { ...manifestValue(input), learnerMediaRevisions: invalid }),
        ).rejects.toMatchObject({ code: "23514" });
      }
      await expect(
        insertManifest(pool, input, manifestValue(input), "0".repeat(64)),
      ).rejects.toMatchObject({ code: "23514" });
      await insertManifest(pool, input);
      expect(
        (
          await pool.query(
            "SELECT manifest,digest FROM app.audio_asset_manifests WHERE asset_id=$1",
            [input.assetId],
          )
        ).rows,
      ).toEqual([
        { manifest: manifestValue(input), digest: hash(JSON.stringify(manifestValue(input))) },
      ]);
    });
  });

  it("P05-SECURITY-001 refuses wrong asset, manifest, item, revision, stimulus and unlisted rendition tuples", async () => {
    await migrated(async (pool) => {
      const first = await fixture(pool);
      const other = await fixture(pool);
      const rogue = await renditionFixture(pool, first.input.assetId);
      await expect(
        insertManifest(pool, { ...first.input, contentRevisionId: other.revisionId }),
      ).rejects.toThrow("audio_manifest_scope_mismatch");
      const imageId = await assetFixture(pool, first.familyId, true);
      await expect(insertManifest(pool, { ...first.input, assetId: imageId })).rejects.toThrow(
        "audio_manifest_scope_mismatch",
      );
      await insertManifest(pool, first.input);
      await insertMembership(pool, first.input, first.mediaId);
      await expect(insertMembership(pool, first.input, rogue)).rejects.toThrow(
        "rendition_not_in_exact_manifest",
      );
      // Even listing another asset's rendition cannot bypass the composite asset/media FK.
      const poisoned = { ...first.input, manifestRevision: "poisoned", mediaIds: [other.mediaId] };
      await insertManifest(pool, poisoned);
      await expect(insertMembership(pool, poisoned, other.mediaId)).rejects.toMatchObject({
        code: "23503",
      });
      for (const input of [
        { ...first.input, assetId: other.input.assetId },
        { ...first.input, manifestRevision: "missing" },
        { ...first.input, contentRevisionId: other.revisionId },
        { ...first.input, stimulusId: "wrong-stimulus" },
      ]) {
        await expect(insertBinding(pool, input, first.itemId, first.mediaId)).rejects.toMatchObject(
          { code: "23503" },
        );
      }
      await expect(
        insertBinding(pool, first.input, other.itemId, first.mediaId),
      ).rejects.toMatchObject({ code: "23503" });
      await expect(insertBinding(pool, first.input, first.itemId, rogue)).rejects.toMatchObject({
        code: "23503",
      });
      await insertBinding(pool, first.input, first.itemId, first.mediaId);
    });
  });

  it("P05-MEDIA-001 rejects in-place audio/transcript changes while retaining successor revision paths", async () => {
    await migrated(async (pool) => {
      const { input, mediaId } = await fixture(pool);
      const transcriptId = randomUUID();
      await pool.query(
        `INSERT INTO app.transcript_revisions(id,media_revision_id,kind,answer_bearing,
          earliest_reveal_phase,rights_envelope_id,language,digest)
         SELECT $1,$2,'target_transcript',true,'after_block',rights_envelope_id,'de',$3
         FROM app.media_assets WHERE id=$4`,
        [transcriptId, mediaId, hash(transcriptId), input.assetId],
      );
      await expect(
        pool.query(
          "UPDATE app.media_revisions SET object_key='rewritten',byte_digest=$2 WHERE id=$1",
          [mediaId, hash("rewritten")],
        ),
      ).rejects.toThrow("immutable_relation");
      await expect(
        pool.query("DELETE FROM app.media_revisions WHERE id=$1", [mediaId]),
      ).rejects.toThrow("immutable_relation");
      await expect(
        pool.query(
          "UPDATE app.transcript_revisions SET earliest_reveal_phase='after_attempt' WHERE id=$1",
          [transcriptId],
        ),
      ).rejects.toThrow("immutable_relation");
      await expect(
        pool.query("DELETE FROM app.transcript_revisions WHERE id=$1", [transcriptId]),
      ).rejects.toThrow("immutable_relation");
      const successor = await renditionFixture(pool, input.assetId);
      expect(successor).not.toBe(mediaId);
      expect(
        (await pool.query("SELECT id FROM app.media_revisions WHERE asset_id=$1", [input.assetId]))
          .rows,
      ).toHaveLength(2);
      // Logical lineage still has a mutable current projection; exact revisions do not.
      await pool.query("UPDATE app.media_assets SET status='quarantined' WHERE id=$1", [
        input.assetId,
      ]);
    });
  });

  it("P05-MEDIA-001 stores non-speech provenance truthfully but never invents an absent manifest or binding", async () => {
    await migrated(async (pool) => {
      const { input, itemId, mediaId } = await fixture(pool);
      expect(
        (await pool.query("SELECT source_role FROM app.media_assets WHERE id=$1", [input.assetId]))
          .rows,
      ).toEqual([{ source_role: "deterministic_non_speech_fixture" }]);
      await expect(insertMembership(pool, input, mediaId)).rejects.toThrow(
        "rendition_not_in_exact_manifest",
      );
      await expect(insertBinding(pool, input, itemId, mediaId)).rejects.toMatchObject({
        code: "23503",
      });
      expect(
        (
          await pool.query(
            `SELECT b.media_revision_id FROM app.content_item_media_bindings b
        JOIN app.audio_asset_manifests m USING(asset_id,manifest_revision)
        WHERE b.content_revision_id=$1`,
            [input.contentRevisionId],
          )
        ).rows,
      ).toEqual([]);
      // No live object, speech QA, learner-ready approval, or runtime admission is claimed here.
      expect(
        (
          await pool.query("SELECT id FROM app.approval_decisions WHERE subject_id=$1", [
            input.assetId,
          ])
        ).rows,
      ).toEqual([]);
    });
  });
});
