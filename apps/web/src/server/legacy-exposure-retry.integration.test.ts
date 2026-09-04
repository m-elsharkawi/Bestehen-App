import { randomUUID } from "node:crypto";
import { canonicalDigest } from "@bestehen/content";
import { appId, type AuthorizedScope } from "@bestehen/domain";
import {
  createPostgresPool,
  migrateDatabase,
  PostgresAttemptRepository,
  PostgresContentRepository,
} from "@bestehen/infrastructure";
import { withIsolatedDatabase } from "@bestehen/test-support";
import type { Pool } from "pg";
import { describe, expect, it, vi } from "vitest";
import { createAttemptCommandFunctions } from "./attempt-command-runtime";

/** Minimal synthetic pins, not approved seed content or a learner publication. */
async function legacyFixture(
  pool: Pool,
  transcript: boolean,
  shape: "complete" | "index_only" | "fact_only" | "none",
) {
  const scopeId = appId<"learner_scope">(randomUUID());
  const family = appId<"content_family">(randomUUID());
  const revision = appId<"content_revision">(randomUUID());
  const attemptId = appId<"attempt">(randomUUID());
  const operationId = appId<"operation">(randomUUID());
  const factId = appId<"response_fact">(randomUUID());
  const plan = randomUUID();
  const session = randomUUID();
  const activity = randomUUID();
  const episode = randomUUID();
  const manifest = randomUUID();
  const scope: AuthorizedScope = {
    principalId: appId(randomUUID()),
    learnerScopeId: scopeId,
    actorKind: "owner",
    capabilities: [],
    authenticatedAt: new Date(),
  };
  await pool.query("INSERT INTO app.learner_scopes(id,state) VALUES($1,'active')", [scopeId]);
  await pool.query("INSERT INTO app.content_families(id,family_key) VALUES($1,$2)", [
    family,
    `synthetic/${family}`,
  ]);
  await pool.query(
    `INSERT INTO app.content_revisions(id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest)
    VALUES($1,$2,'synthetic-v1','task','candidate','unknown','compatible',$3)`,
    [revision, family, canonicalDigest(revision)],
  );
  await pool.query(
    `INSERT INTO app.plan_revisions(id,learner_scope_id,source_cut,policy_release,reason_release,template_release,content_release,intents,reasons,checksum)
    VALUES($1,$2,1,'synthetic','reason-registry/v1','synthetic','synthetic','[]','[]',$3)`,
    [plan, scopeId, canonicalDigest(plan)],
  );
  await pool.query(
    "INSERT INTO app.sessions(id,learner_scope_id,plan_revision_id,state) VALUES($1,$2,$3,'active')",
    [session, scopeId, plan],
  );
  await pool.query(
    "INSERT INTO app.activity_occurrences(id,learner_scope_id,session_id,operation_id,state) VALUES($1,$2,$3,$4,'active')",
    [activity, scopeId, session, randomUUID()],
  );
  await pool.query(
    "INSERT INTO app.coaching_episodes(id,learner_scope_id,activity_occurrence_id,state) VALUES($1,$2,$3,'active')",
    [episode, scopeId, activity],
  );
  await pool.query(
    `INSERT INTO app.serving_manifests(id,learner_scope_id,operation_id,content_class,approval_role,key_revision_digests,allowed_conditions,learner_safe_payload_digest,freshness_decision,compared_family_refs,authorization_version,content_release_identity,issued_at,expires_at,revocation_state,digest)
    VALUES($1,$2,$3,'C3','training','[]','{}',$4,'fresh','[]','synthetic','synthetic',now(),now()+interval '1 hour','active',$5)`,
    [
      manifest,
      scopeId,
      randomUUID(),
      canonicalDigest("synthetic-payload"),
      canonicalDigest(manifest),
    ],
  );
  await pool.query(
    "INSERT INTO app.serving_manifest_entries(serving_manifest_id,learner_scope_id,ordinal,content_revision_id) VALUES($1,$2,1,$3)",
    [manifest, scopeId, revision],
  );
  await pool.query(
    `INSERT INTO app.attempts(id,learner_scope_id,session_id,activity_occurrence_id,episode_id,content_revision_id,modality,direct_lane,state,operation_id,serving_manifest_id)
    VALUES($1,$2,$3,$4,$5,$6,'reading','written','in_progress',$7,$8)`,
    [attemptId, scopeId, session, activity, episode, revision, randomUUID(), manifest],
  );
  const attempts = new PostgresAttemptRepository(pool);
  const content = new PostgresContentRepository(pool);
  const payload = {
    attemptId,
    contentFamilyId: family,
    exposureEventId: factId,
    revealedKind: transcript ? ("transcript" as const) : ("stimulus" as const),
    exposureClass: transcript ? ("answer_exposed" as const) : ("exposed_family" as const),
    phase: transcript ? ("after_submission" as const) : ("during_response" as const),
    occurredAt: "2026-09-01T08:00:00.000Z",
  };
  const digest = canonicalDigest(payload);
  const trigger = transcript ? ("transcript" as const) : ("learner_visible_stimulus" as const);
  // These are the exact two pre-440086b production calls, retaining their old receipt kinds.
  async function writeLegacy(writeShape: "complete" | "index_only" | "fact_only") {
    const index =
      writeShape === "fact_only"
        ? { ok: true as const, value: { exposureClass: payload.exposureClass } }
        : await content.recordExposure(scope, {
            operationId,
            contentFamilyId: family,
            contentRevisionId: revision,
            exposureClass: payload.exposureClass,
            trigger,
            occurredAt: new Date(payload.occurredAt),
            payloadDigest: digest,
          });
    expect(index.ok).toBe(true);
    if (!index.ok) throw new Error(index.error);
    if (writeShape !== "index_only") {
      expect(
        await attempts.recordAttemptFact(scope, operationId, {
          kind: "exposure",
          factId,
          attemptId,
          factType: "objective_exposure_v1",
          envelope: { exposureClass: index.value.exposureClass, trigger, phase: payload.phase },
          digest,
        }),
      ).toMatchObject({ ok: true });
    }
  }
  if (shape !== "none") await writeLegacy(shape);
  return {
    writeLegacy,
    scope,
    family,
    revision,
    attemptId,
    operationId,
    factId,
    payload,
    attempts,
    content,
    commands: createAttemptCommandFunctions(attempts, content),
  };
}

async function durableSnapshot(pool: Pool) {
  const index = await pool.query(
    "SELECT * FROM app.content_exposure_index ORDER BY content_family_id",
  );
  const facts = await pool.query("SELECT * FROM app.exposure_facts ORDER BY learner_sequence");
  const receipts = await pool.query(
    "SELECT * FROM app.operation_receipts ORDER BY operation_id,kind",
  );
  const scopes = await pool.query("SELECT id,next_sequence FROM app.learner_scopes ORDER BY id");
  return { index: index.rows, facts: facts.rows, receipts: receipts.rows, scopes: scopes.rows };
}

describe.skipIf(!process.env.TEST_DATABASE_URL)(
  "P05-IDEMPOTENCY-001 legacy auxiliary exposure compatibility",
  () => {
    it.each([
      "exact",
      "stronger",
      "changed_time",
      "changed_class",
      "changed_fact",
      "wrong_family",
      "wrong_scope",
      "active_other_scope",
      "wrong_attempt",
      "partial",
      "fact_only",
      "transcript",
    ] as const)(
      "P05-SECURITY-001 preserves old receipts without fresh exposure: %s",
      async (scenario) => {
        await withIsolatedDatabase(process.env.TEST_DATABASE_URL as string, async (url) => {
          await migrateDatabase(url);
          const pool = createPostgresPool(url);
          const network = vi
            .spyOn(globalThis, "fetch")
            .mockRejectedValue(new Error("No byte delivery during receipt acknowledgement"));
          try {
            const fixture = await legacyFixture(
              pool,
              scenario === "transcript",
              scenario === "partial"
                ? "index_only"
                : scenario === "fact_only"
                  ? "fact_only"
                  : "complete",
            );
            if (scenario === "stronger") {
              expect(
                await fixture.content.recordExposure(fixture.scope, {
                  operationId: appId(randomUUID()),
                  contentFamilyId: fixture.family,
                  contentRevisionId: fixture.revision,
                  exposureClass: "answer_exposed",
                  trigger: "key_or_rationale",
                  occurredAt: new Date(),
                  payloadDigest: canonicalDigest("synthetic-stronger-exposure"),
                }),
              ).toMatchObject({ ok: true });
            }
            const otherScopeId = appId<"learner_scope">(randomUUID());
            if (scenario === "active_other_scope")
              await pool.query("INSERT INTO app.learner_scopes(id,state) VALUES($1,'active')", [
                otherScopeId,
              ]);
            const otherAttemptId = appId<"attempt">(randomUUID());
            if (scenario === "wrong_attempt")
              await pool.query(
                `INSERT INTO app.attempts(id,learner_scope_id,session_id,activity_occurrence_id,episode_id,content_revision_id,modality,direct_lane,state,operation_id,serving_manifest_id)
              SELECT $1,learner_scope_id,session_id,activity_occurrence_id,episode_id,content_revision_id,modality,direct_lane,state,$2,serving_manifest_id FROM app.attempts WHERE id=$3`,
                [otherAttemptId, randomUUID(), fixture.attemptId],
              );
            const before = await durableSnapshot(pool);
            expect(before.receipts.map((row) => row.kind).sort()).toEqual(
              scenario === "partial"
                ? ["attempt.exposure"]
                : scenario === "fact_only"
                  ? ["attempt.fact.exposure"]
                  : scenario === "stronger"
                    ? ["attempt.exposure", "attempt.exposure", "attempt.fact.exposure"]
                    : ["attempt.exposure", "attempt.fact.exposure"],
            );
            expect(before.facts.map((row) => row.fact_type)).toEqual(
              scenario === "partial" ? [] : ["objective_exposure_v1"],
            );
            const payload = {
              ...fixture.payload,
              ...(scenario === "changed_time" ? { occurredAt: "2026-09-02T08:00:00.000Z" } : {}),
              ...(scenario === "changed_class" ? { exposureClass: "answer_exposed" as const } : {}),
              ...(scenario === "changed_fact"
                ? { exposureEventId: appId<"response_fact">(randomUUID()) }
                : {}),
              ...(scenario === "wrong_family"
                ? { contentFamilyId: appId<"content_family">(randomUUID()) }
                : {}),
              ...(scenario === "wrong_attempt" ? { attemptId: otherAttemptId } : {}),
            };
            const scope =
              scenario === "wrong_scope" || scenario === "active_other_scope"
                ? { ...fixture.scope, learnerScopeId: otherScopeId }
                : fixture.scope;
            const result = await fixture.commands.exposure(scope, fixture.operationId, payload);
            if (["exact", "stronger", "transcript"].includes(scenario)) {
              expect(result).toEqual({ ok: true, value: { resourceId: fixture.factId } });
              expect(await fixture.commands.exposure(scope, fixture.operationId, payload)).toEqual(
                result,
              );
            } else if (
              scenario === "wrong_family" ||
              scenario === "wrong_scope" ||
              scenario === "active_other_scope"
            ) {
              expect(result).toEqual({ ok: false, error: "not_available" });
            } else {
              expect(result).toEqual({
                ok: false,
                error:
                  scenario === "partial" || scenario === "fact_only"
                    ? "conflict"
                    : "idempotency_conflict",
              });
            }
            // Receipt acknowledgement cannot create a new baseline, receipt, exposure, or byte URL.
            expect(await durableSnapshot(pool)).toEqual(before);
            expect(JSON.stringify(result)).not.toMatch(
              /transcript|https?:|objectKey|signed|preAttemptExposureClass/,
            );
            expect(network).not.toHaveBeenCalled();
          } finally {
            network.mockRestore();
            await pool.end();
          }
        });
      },
    );
    it("P05-IDEMPOTENCY-001 refuses a new-kind write when an old writer commits after a negative compatibility read", async () => {
      await withIsolatedDatabase(process.env.TEST_DATABASE_URL as string, async (url) => {
        await migrateDatabase(url);
        const pool = createPostgresPool(url);
        try {
          const fixture = await legacyFixture(pool, false, "none");
          const read = fixture.attempts.readLegacyExposureReceipt.bind(fixture.attempts);
          let committedBetween = false;
          vi.spyOn(fixture.attempts, "readLegacyExposureReceipt").mockImplementation(
            async (...args) => {
              const result = await read(...args);
              if (!committedBetween) {
                expect(result).toEqual({ ok: true, value: null });
                await fixture.writeLegacy("complete");
                committedBetween = true;
              }
              return result;
            },
          );
          expect(
            await fixture.commands.exposure(fixture.scope, fixture.operationId, fixture.payload),
          ).toEqual({ ok: false, error: "conflict" });
          const committed = await durableSnapshot(pool);
          expect(committed.index[0].occurrence_count).toBe("1");
          expect(committed.facts.map((row) => row.fact_type)).toEqual(["objective_exposure_v1"]);
          expect(committed.receipts.map((row) => row.kind).sort()).toEqual([
            "attempt.exposure",
            "attempt.fact.exposure",
          ]);
          expect(
            await fixture.commands.exposure(fixture.scope, fixture.operationId, fixture.payload),
          ).toEqual({ ok: true, value: { resourceId: fixture.factId } });
          expect(await durableSnapshot(pool)).toEqual(committed);
        } finally {
          await pool.end();
        }
      });
    });
  },
);
