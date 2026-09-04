import { randomUUID } from "node:crypto";
import {
  canonicalDigest,
  canonicalizeResponse,
  canonicalResponseDigest,
  type TaskFamily,
} from "@bestehen/content";
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
import {
  handleCheckpointAttempt,
  handleCreateAttempt,
  handleSubmitAttempt,
} from "./attempt-commands";
import { handleAttemptRecovery } from "./attempt-recovery";

describe.skipIf(!process.env.TEST_DATABASE_URL)(
  "P05-RECOVERY-001 real pinned server composition",
  () => {
    it.each(["answered", "deliberate_blank"] as const)(
      "preserves %s, replay and recovery using PostgreSQL with no external calls",
      async (mode) => {
        await withIsolatedDatabase(process.env.TEST_DATABASE_URL as string, async (url) => {
          const pool = createPostgresPool(url);
          const network = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
            throw new Error("External calls forbidden in objective runtime");
          });
          try {
            await migrateDatabase(url);
            const [
              scopeId,
              family,
              revision,
              plan,
              session,
              activity,
              episode,
              rights,
              item,
              key,
              manifest,
            ] = Array.from({ length: 11 }, () => randomUUID()) as [
              string,
              string,
              string,
              string,
              string,
              string,
              string,
              string,
              string,
              string,
              string,
            ];
            const now = new Date();
            const scope: AuthorizedScope = {
              principalId: appId("22222222-2222-4222-8222-222222222222"),
              learnerScopeId: appId(scopeId),
              actorKind: "owner",
              capabilities: [],
              authenticatedAt: now,
            };
            const payload: TaskFamily = {
              kind: "R2DetailedSelect",
              stimulus: {
                stimulusId: "test-stimulus",
                language: "de",
                genreDomainRegister: "synthetic",
                safeContentNodes: [{ kind: "inline_text", text: "Synthetischer Test." }],
                evidenceAnchorIds: [],
              },
              questions: [
                {
                  itemRef: item,
                  questionId: "test-question",
                  questionNodes: [{ kind: "inline_text", text: "Testfrage" }],
                  options: [
                    {
                      optionId: "option-a",
                      learnerSafeLabel: [{ kind: "inline_text", text: "A" }],
                      positionIsPresentationOnly: true,
                    },
                  ],
                },
              ],
            };
            const instruction = {
              instructionId: "synthetic-instruction",
              locale: "de",
              safeContentNodes: [{ kind: "inline_text", text: "Lesen Sie den Test." }],
              responseMechanic: "single_select",
              helpPolicy: { offerableAssistanceKinds: ["strategy_cue"] },
              learnerFacingTimingLabel: "Übungszeit",
            };
            // These are synthetic test-only pins, not a publication or human review of T6 content.
            await pool.query("INSERT INTO app.learner_scopes(id,state) VALUES($1,'active')", [
              scopeId,
            ]);
            await pool.query(
              "INSERT INTO app.content_families(id,family_key,task_family_kind) VALUES($1,$2,'R2DetailedSelect')",
              [family, `synthetic/${family}`],
            );
            await pool.query(
              "INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest) VALUES($1,$2,'current','{}',$3)",
              [rights, `synthetic/${rights}`, canonicalDigest(rights)],
            );
            await pool.query(
              `INSERT INTO app.content_revisions(id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest,content_class,rights_envelope_id,learner_payload,instruction,progression_profile)
          VALUES($1,$2,'synthetic-v1','task','approved','eligible','compatible',$3,'C3',$4,$5,$6::jsonb,'P2')`,
              [
                revision,
                family,
                canonicalDigest(payload),
                rights,
                JSON.stringify(payload),
                JSON.stringify(instruction),
              ],
            );
            await pool.query(
              `INSERT INTO app.plan_revisions(id,learner_scope_id,source_cut,policy_release,reason_release,template_release,content_release,intents,reasons,checksum) VALUES($1,$2,1,'policy/foundation','reason-registry/v1','template/foundation','content/synthetic','[]','[]',$3)`,
              [plan, scopeId, canonicalDigest(plan)],
            );
            await pool.query(
              "INSERT INTO app.sessions(id,learner_scope_id,plan_revision_id,state) VALUES($1,$2,$3,'active')",
              [session, scopeId, plan],
            );
            await pool.query(
              "INSERT INTO app.activity_occurrences(id,learner_scope_id,session_id,operation_id,state,resource_version) VALUES($1,$2,$3,$4,'active',1)",
              [activity, scopeId, session, randomUUID()],
            );
            await pool.query(
              "INSERT INTO app.coaching_episodes(id,learner_scope_id,activity_occurrence_id,state,resource_version) VALUES($1,$2,$3,'active',1)",
              [episode, scopeId, activity],
            );
            await pool.query(
              `INSERT INTO app.content_items(id,content_revision_id,ordinal,response_kind,binding,scorable) VALUES($1,$2,1,'single_select',$3,$4)`,
              [
                item,
                revision,
                JSON.stringify({ kind: "select", questionId: "test-question" }),
                JSON.stringify({
                  responseKind: "single_select",
                  responseCardinality: { min: 1, max: 1 },
                  keyRevisionId: key,
                  scoringPolicyRef: "objective-scoring/v1",
                }),
              ],
            );
            await pool.query(
              `INSERT INTO app.key_revisions(id,content_revision_id,content_item_id,accepted_response_set,response_cardinality_min,response_cardinality_max,scoring_policy_ref,decisive_evidence,distractor_rationale,intended_cause_mapping,independent_validation,digest) VALUES($1,$2,$3,'[{"kind":"option","optionId":"option-a"}]',1,1,'objective-scoring/v1','{}','{}','{}','{}',$4)`,
              [key, revision, item, canonicalDigest(key)],
            );
            await pool.query(
              `INSERT INTO app.serving_manifests(id,learner_scope_id,operation_id,content_class,approval_role,key_revision_digests,allowed_conditions,learner_safe_payload_digest,freshness_decision,compared_family_refs,authorization_version,content_release_identity,issued_at,expires_at,revocation_state,digest) VALUES($1,$2,$3,'C3','training',$4,$5,$6,'fresh','[]','authorization/v1','content/synthetic',$7,$8,'active',$9)`,
              [
                manifest,
                scopeId,
                randomUUID(),
                JSON.stringify([canonicalDigest(key)]),
                JSON.stringify({
                  progressionProfile: "P2",
                  timingMode: "practice",
                  transcriptPhase: "after_attempt",
                  offerableAssistanceKinds: [],
                }),
                canonicalDigest(payload),
                now,
                new Date(now.getTime() + 3600000),
                canonicalDigest(manifest),
              ],
            );
            await pool.query(
              "INSERT INTO app.serving_manifest_entries(serving_manifest_id,learner_scope_id,ordinal,content_revision_id,content_item_id) VALUES($1,$2,1,$3,$4)",
              [manifest, scopeId, revision, item],
            );
            const attempts = new PostgresAttemptRepository(pool);
            const content = new PostgresContentRepository(pool);
            const keys = vi.spyOn(content, "readPinnedScoringUnits");
            const dependencies = {
              authenticate: async () => scope,
              now: () => now,
              commands: createAttemptCommandFunctions(attempts, content, () => now),
            };
            const submitCommand = vi.spyOn(dependencies.commands, "submit");
            const created = await handleCreateAttempt(dependencies, "synthetic-session", {
              contract: { major: 1, minor: 0 },
              operationId: "create-synthetic",
              expectedVersion: 0,
              payload: { servingManifestId: manifest, activityOccurrenceId: activity },
            });
            expect(created.status).toBe(200);
            const attemptId = (await created.json()).resourceId as string;
            expect(keys).not.toHaveBeenCalled();
            const operations = [
              ...(mode === "answered"
                ? [{ kind: "set_selection" as const, itemId: item, optionId: "option-a" }]
                : []),
              { kind: "confirm_boundary" as const, boundaryId: attemptId },
            ];
            const digest = canonicalResponseDigest(canonicalizeResponse(operations).response);
            const checkpoint = {
              contract: { major: 1, minor: 0 },
              operationId: "checkpoint-synthetic",
              expectedVersion: 2,
              payload: {
                attemptId,
                stream: "primary",
                sequence: 1,
                operations,
                responseDigest: digest,
                observedAt: now.toISOString(),
              },
            };
            // Commit immediately after the recovery statement's snapshot was taken. A legacy
            // multi-query projection would return version 2 with sequence-1 response rows here.
            let raced = false;
            const snapshotRepository = new PostgresAttemptRepository({
              query: async (text: string, values: unknown[]) => {
                const result = await pool.query(text, values);
                if (!raced) {
                  raced = true;
                  expect(
                    (
                      await handleCheckpointAttempt(
                        dependencies,
                        "synthetic-session",
                        attemptId,
                        checkpoint,
                      )
                    ).status,
                  ).toBe(200);
                }
                return result;
              },
            } as unknown as Pool);
            expect(await snapshotRepository.readObjectiveRecovery(scope, appId(attemptId))).toEqual(
              expect.objectContaining({
                resourceVersion: 2,
                acknowledgedCheckpointSequence: 0,
                checkpoints: [],
                submission: null,
              }),
            );
            expect(await attempts.readObjectiveRecovery(scope, appId(attemptId))).toEqual(
              expect.objectContaining({
                resourceVersion: 3,
                acknowledgedCheckpointSequence: 1,
                checkpoints: [
                  expect.objectContaining({ sequence: 1, responseDigest: digest, operations }),
                ],
              }),
            );
            expect(
              (
                await handleCheckpointAttempt(
                  dependencies,
                  "synthetic-session",
                  attemptId,
                  checkpoint,
                )
              ).status,
            ).toBe(200);
            expect(
              (
                await handleCheckpointAttempt(
                  dependencies,
                  "synthetic-session",
                  attemptId,
                  checkpoint,
                )
              ).status,
            ).toBe(200);
            expect(await attempts.readCommittedSubmission(scope, appId(attemptId))).toBeUndefined(); // Checkpoint/technical absence is not blank evidence.
            expect(keys).not.toHaveBeenCalled();
            const queryDeps = { ...dependencies, attempts };
            const recovery = await handleAttemptRecovery(queryDeps, "synthetic-session", attemptId);
            expect((await recovery.json()).checkpoints).toEqual([
              expect.objectContaining({ responseDigest: digest, operations }),
            ]);
            expect(keys).not.toHaveBeenCalled();
            const submission = {
              contract: { major: 1, minor: 0 },
              operationId: "submit-synthetic",
              expectedVersion: 3,
              payload: {
                attemptId,
                checkpointSequence: 1,
                responseDigest: digest,
                conditions: {
                  progressionProfile: "P2",
                  timingMode: "practice",
                  timerIntegrity: "in_context_trusted",
                  elapsedMs: 0,
                  exposureClass: "unseen",
                  independenceClass: "first_attempt",
                  assistanceUsed: [],
                  accessibilityEquivalence: "equivalent",
                },
              },
            };
            // Fault injection after proposal rows were written. A logical refusal must roll back too.
            const lateRefusal = vi
              .spyOn(
                attempts as unknown as { advanceThroughSubmissionArc: () => Promise<boolean> },
                "advanceThroughSubmissionArc",
              )
              .mockResolvedValue(false);
            expect(
              (await handleSubmitAttempt(dependencies, "synthetic-session", attemptId, submission))
                .status,
            ).toBe(409);
            for (const table of [
              "attempt_submissions",
              "objective_outcomes",
              "objective_unit_outcomes",
              "evidence_observations",
              "validity_assertions",
              "job_resources",
            ]) {
              expect(
                (await pool.query(`SELECT count(*)::int AS count FROM app.${table}`)).rows[0].count,
              ).toBe(0);
            }
            expect(
              (
                await pool.query(
                  "SELECT count(*)::int AS count FROM app.operation_receipts WHERE kind='attempt.submit'",
                )
              ).rows[0].count,
            ).toBe(0);
            expect((await attempts.readAttempt(scope, appId(attemptId)))?.state).toBe(
              "checkpointed",
            );
            lateRefusal.mockRestore();
            const submitted = await handleSubmitAttempt(
              dependencies,
              "synthetic-session",
              attemptId,
              submission,
            );
            const commandResult = await submitCommand.mock.results.at(-1)?.value;
            if (!commandResult?.ok) throw new Error(`Real submit refused: ${commandResult?.error}`);
            expect(submitted.status).toBe(200);
            const replay = await handleSubmitAttempt(
              dependencies,
              "synthetic-session",
              attemptId,
              submission,
            );
            expect(replay.status).toBe(200);
            expect(await replay.json()).toEqual(await submitted.json());
            const outcome = await attempts.readCommittedSubmission(scope, appId(attemptId));
            expect(outcome?.unitOutcomes).toEqual([
              expect.objectContaining({
                contentItemId: item,
                kind: mode === "answered" ? "correct" : "blank",
                keyRevisionId: key,
              }),
            ]);
            expect(outcome?.conditions).toMatchObject({ timerIntegrity: "insufficient" });
            const recovered = await handleAttemptRecovery(
              queryDeps,
              "synthetic-session",
              attemptId,
            );
            expect((await recovered.json()).submission).toMatchObject({ responseDigest: digest });
            const otherScope = { ...scope, learnerScopeId: appId<"learner_scope">(randomUUID()) };
            expect(
              await attempts.readObjectiveRecovery(otherScope, appId(attemptId)),
            ).toBeUndefined();
            expect(
              (await pool.query("SELECT count(*)::int AS count FROM app.attempt_submissions"))
                .rows[0].count,
            ).toBe(1);
            expect(
              (await pool.query("SELECT count(*)::int AS count FROM app.evidence_observations"))
                .rows[0].count,
            ).toBe(1);
            expect(network).not.toHaveBeenCalled();
          } finally {
            network.mockRestore();
            await pool.end();
          }
        });
      },
    );
  },
);
