import { createHash, randomUUID } from "node:crypto";
import { withIsolatedDatabase } from "@bestehen/test-support";
import { Kysely, PostgresDialect } from "kysely";
import { Migrator } from "kysely/migration";
import { describe, expect, it } from "vitest";
import { createPostgresPool, migrateDatabase } from "../postgres/index.js";
import {
  foundationMigrations,
  migrationChecksums,
  stage05Revision,
  stage05TranscriptRevision,
} from "../postgres/migrations.js";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");
describe.skipIf(!process.env.TEST_DATABASE_URL)("Listening 060 upgrade", () => {
  it("P05-MIGRATION-001 retains populated 060 rows and all 14 hashes, then enforces immutable scoped operation facts", async () => {
    await withIsolatedDatabase(process.env.TEST_DATABASE_URL as string, async (url) => {
      const db = new Kysely<unknown>({
        dialect: new PostgresDialect({ pool: createPostgresPool(url) }),
      });
      try {
        const result = await new Migrator({
          db,
          provider: { getMigrations: async () => ({ ...foundationMigrations }) },
        }).migrateTo(stage05TranscriptRevision);
        if (result.error) throw result.error;
      } finally {
        await db.destroy();
      }
      const pool = createPostgresPool(url);
      try {
        const inherited = Object.keys(migrationChecksums).slice(0, 14);
        await pool.query("DELETE FROM app.schema_revisions WHERE revision<>ALL($1)", [inherited]);
        const hashes = (await pool.query("SELECT * FROM app.schema_revisions ORDER BY revision"))
          .rows;
        const learner = randomUUID(),
          family = randomUUID(),
          content = randomUUID(),
          plan = randomUUID(),
          session = randomUUID(),
          activity = randomUUID(),
          episode = randomUUID(),
          manifest = randomUUID(),
          attempt = randomUUID(),
          listening = randomUUID(),
          occurrence = randomUUID(),
          preflight = randomUUID();
        await pool.query("INSERT INTO app.learner_scopes(id,state) VALUES($1,'active')", [learner]);
        await pool.query("INSERT INTO app.content_families(id,family_key) VALUES($1,$2)", [
          family,
          `synthetic/${family}`,
        ]);
        await pool.query(
          "INSERT INTO app.content_revisions(id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest) VALUES($1,$2,'test','task','candidate','unknown','compatible',$3)",
          [content, family, digest(content)],
        );
        await pool.query(
          "INSERT INTO app.plan_revisions(id,learner_scope_id,source_cut,policy_release,reason_release,template_release,content_release,intents,reasons,checksum) VALUES($1,$2,0,'test','test','test','test','[]','[]',$3)",
          [plan, learner, digest(plan)],
        );
        await pool.query(
          "INSERT INTO app.sessions(id,learner_scope_id,plan_revision_id,state) VALUES($1,$2,$3,'active')",
          [session, learner, plan],
        );
        await pool.query(
          "INSERT INTO app.activity_occurrences(id,learner_scope_id,session_id,operation_id,state) VALUES($1,$2,$3,$4,'active')",
          [activity, learner, session, randomUUID()],
        );
        await pool.query(
          "INSERT INTO app.coaching_episodes(id,learner_scope_id,activity_occurrence_id,state) VALUES($1,$2,$3,'active')",
          [episode, learner, activity],
        );
        await pool.query(
          "INSERT INTO app.serving_manifests(id,learner_scope_id,operation_id,content_class,approval_role,key_revision_digests,allowed_conditions,learner_safe_payload_digest,freshness_decision,compared_family_refs,authorization_version,content_release_identity,issued_at,expires_at,revocation_state,digest) VALUES($1,$2,$3,'C3','training','[]','{}',$4,'fresh','[]','test','test',now(),now()+interval '1 hour','active',$4)",
          [manifest, learner, randomUUID(), digest(manifest)],
        );
        await pool.query(
          "INSERT INTO app.attempts(id,learner_scope_id,session_id,activity_occurrence_id,episode_id,content_revision_id,modality,direct_lane,state,operation_id,serving_manifest_id) VALUES($1,$2,$3,$4,$5,$6,'listening','aural','ready',$7,$8)",
          [attempt, learner, session, activity, episode, content, randomUUID(), manifest],
        );
        await pool.query(
          "INSERT INTO app.listening_plans(id,learner_scope_id,attempt_id,serving_manifest_id,contract_major,plan_version,target_blueprint_version,evidence_role,progression_profile,preflight_policy_ref,playback_policy_ref,timer_policy_ref,issued_at,expires_at,revocation_state) VALUES($1,$2,$3,$4,1,'old-plan','test','learning_practice','P2','test','test','test',now(),now()+interval '1 hour','active')",
          [listening, learner, attempt, manifest],
        );
        await pool.query(
          "INSERT INTO app.listening_plan_occurrences(id,learner_scope_id,listening_plan_id,ordinal,item_or_part_scope,candidate_media_revision_ids,allowed_play_count,authored_speed_ratio,seeking_allowed,pause_allowed,transcript_phase,response_window) VALUES($1,$2,$3,1,'[" +
            JSON.stringify(content) +
            "]','[" +
            JSON.stringify(randomUUID()) +
            "]',1,1,true,true,'after_attempt','{}')",
          [occurrence, learner, listening],
        );
        await pool.query(
          "INSERT INTO app.media_preflight_receipts(id,learner_scope_id,listening_plan_id,operation_id,policy_versions,candidate_media_revisions,verified_digest_and_length,decoded_or_loaded,local_retention_class,output_probe_confirmed,checkpoint_path_confirmed,outcome,issued_at,expires_at) VALUES($1,$2,$3,$4,'{}','[]','[]','[]','unknown',false,false,'retryable',now(),now()+interval '1 hour')",
          [preflight, learner, listening, randomUUID()],
        );
        const before = (
          await pool.query(
            "SELECT to_jsonb(p) AS plan,to_jsonb(o) AS occurrence,to_jsonb(r) AS receipt FROM app.listening_plans p JOIN app.listening_plan_occurrences o ON o.listening_plan_id=p.id JOIN app.media_preflight_receipts r ON r.listening_plan_id=p.id",
          )
        ).rows;
        expect(await migrateDatabase(url)).toEqual({
          fromRevision: stage05TranscriptRevision,
          toRevision: stage05Revision,
          applied: ["20260905_061_listening_runtime", stage05Revision],
        });
        const after = (
          await pool.query(
            "SELECT to_jsonb(p)-ARRAY['plan_json','resource_version','context','begin_at','started_at','block_completed_at'] AS plan,to_jsonb(o) AS occurrence,to_jsonb(r)-ARRAY['observation','receipt'] AS receipt FROM app.listening_plans p JOIN app.listening_plan_occurrences o ON o.listening_plan_id=p.id JOIN app.media_preflight_receipts r ON r.listening_plan_id=p.id",
          )
        ).rows;
        expect(after).toEqual(before);
        expect(
          (
            await pool.query(
              "SELECT * FROM app.schema_revisions WHERE revision=ANY($1) ORDER BY revision",
              [inherited],
            )
          ).rows,
        ).toEqual(hashes);
        expect(
          (
            await pool.query(
              "SELECT plan_json,resource_version,started_at FROM app.listening_plans",
            )
          ).rows,
        ).toEqual([{ plan_json: null, resource_version: "0", started_at: null }]);
        await pool.query(
          "UPDATE app.listening_plans SET resource_version=1,context='{}',begin_at=now() WHERE id=$1",
          [listening],
        );
        await expect(
          pool.query("UPDATE app.listening_plans SET plan_version='changed' WHERE id=$1", [
            listening,
          ]),
        ).rejects.toThrow("immutable Listening plan identity");
        await expect(
          pool.query("DELETE FROM app.listening_plan_occurrences WHERE id=$1", [occurrence]),
        ).rejects.toThrow();
        const operation = randomUUID();
        await pool.query(
          "INSERT INTO app.listening_operation_facts(learner_scope_id,operation_id,listening_plan_id,kind,payload_digest,command,receipt) VALUES($1,$2,$3,'preflight',$4,'{}','{}')",
          [learner, operation, listening, digest(operation)],
        );
        await expect(
          pool.query(
            "UPDATE app.listening_operation_facts SET receipt='{}' WHERE operation_id=$1",
            [operation],
          ),
        ).rejects.toThrow();
        await expect(
          pool.query(
            "INSERT INTO app.listening_operation_facts(learner_scope_id,operation_id,listening_plan_id,kind,payload_digest,command,receipt) VALUES($1,$2,$3,'playback',$4,'{}','{}')",
            [learner, operation, listening, digest(operation)],
          ),
        ).rejects.toMatchObject({ code: "23505" });
        const other = randomUUID();
        await pool.query("INSERT INTO app.learner_scopes(id,state) VALUES($1,'active')", [other]);
        await expect(
          pool.query(
            "INSERT INTO app.listening_operation_facts(learner_scope_id,operation_id,listening_plan_id,kind,payload_digest,command,receipt) VALUES($1,$2,$3,'playback',$4,'{}','{}')",
            [other, randomUUID(), listening, digest(operation)],
          ),
        ).rejects.toMatchObject({ code: "23503" });
        expect((await migrateDatabase(url)).applied).toEqual([]);
      } finally {
        await pool.end();
      }
    });
  });
});
