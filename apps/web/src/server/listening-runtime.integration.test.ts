import { randomUUID } from "node:crypto";
import { listeningOutboxProbePayload } from "@bestehen/application";
import { audioCatalogueValidator, canonicalDigest } from "@bestehen/content";
import type {
  MediaPreflightObservation,
  MediaPreflightReceipt,
  PlaybackOccurrenceCommand,
} from "@bestehen/contracts";
import { appId } from "@bestehen/domain";
import {
  type createPostgresPool,
  PostgresAttemptRepository,
  PostgresContentRepository,
  PostgresListeningRuntime,
  PostgresMediaCatalogue,
} from "@bestehen/infrastructure";
import { describe, expect, it, vi } from "vitest";
import { createAttemptCommandFunctions } from "./attempt-command-runtime";
import { approval, scopeFor, setup, syntheticSpeech } from "./media-catalogue.test.fixture";

type Pool = ReturnType<typeof createPostgresPool>;
type Speech = Awaited<ReturnType<typeof syntheticSpeech>>;

async function seedAttempt(
  pool: Pool,
  speech: readonly Speech[],
  profile: "P0" | "P1" | "P2" | "P3" | "P4" = "P4",
) {
  const scope = await scopeFor(pool);
  const first = speech[0];
  if (!first) throw new Error("missing fixture");
  const [planId, sessionId, activityId, episodeId] = [
    randomUUID(),
    randomUUID(),
    randomUUID(),
    randomUUID(),
  ];
  await pool.query(
    "INSERT INTO app.plan_revisions(id,learner_scope_id,source_cut,policy_release,reason_release,template_release,content_release,intents,reasons,checksum) VALUES($1,$2,0,'test','test','test','test','[]','[]',$3)",
    [planId, scope.learnerScopeId, canonicalDigest(planId)],
  );
  await pool.query(
    "INSERT INTO app.sessions(id,learner_scope_id,plan_revision_id,state) VALUES($1,$2,$3,'active')",
    [sessionId, scope.learnerScopeId, planId],
  );
  await pool.query(
    "INSERT INTO app.activity_occurrences(id,learner_scope_id,session_id,operation_id,state) VALUES($1,$2,$3,$4,'active')",
    [activityId, scope.learnerScopeId, sessionId, randomUUID()],
  );
  await pool.query(
    "INSERT INTO app.coaching_episodes(id,learner_scope_id,activity_occurrence_id,state) VALUES($1,$2,$3,'active')",
    [episodeId, scope.learnerScopeId, activityId],
  );
  const catalogue = new PostgresMediaCatalogue(pool, audioCatalogueValidator);
  for (const s of speech) await catalogue.importCatalogue(s.input);
  const release = (
    await pool.query(
      "SELECT rel.* FROM app.content_releases rel JOIN app.content_release_entries e ON e.release_id=rel.id WHERE e.content_revision_id=$1",
      [first.revisionId],
    )
  ).rows[0];
  for (const s of speech.slice(1))
    await pool.query(
      "INSERT INTO app.content_release_entries(release_id,content_revision_id) VALUES($1,$2)",
      [release.id, s.revisionId],
    );
  const content = new PostgresContentRepository(pool, audioCatalogueValidator);
  const attempts = new PostgresAttemptRepository(pool);
  const now = new Date();
  const manifestId = appId<"serving_manifest">(randomUUID());
  const entries = speech
    .flatMap((s) => [
      {
        contentRevisionId: appId<"content_revision">(s.revisionId),
        contentItemId: appId<"content_item">(s.itemId),
      },
      ...s.manifest.learnerMediaRevisions.map((r) => ({
        contentRevisionId: appId<"content_revision">(s.revisionId),
        mediaRevisionId: appId<"media_revision">(r.mediaRevisionId),
      })),
    ])
    .map((e, i) => ({ ...e, ordinal: i + 1 }));
  const issued = await content.issueServingManifest(scope, {
    servingManifestId: manifestId,
    operationId: appId(randomUUID()),
    contentClass: "C3",
    approvalRole: "training",
    entries,
    keyRevisionDigests: [],
    allowedConditions: {
      progressionProfile: profile,
      timingMode: "practice",
      transcriptPhase: profile === "P4" ? "after_block" : "after_attempt",
      offerableAssistanceKinds: [],
      audioManifestPins: speech
        .map((s) => ({
          assetId: s.assetId,
          manifestRevision: s.manifest.manifestRevision,
          digest: s.record.digest,
          contentRevisionId: s.revisionId,
          stimulusId: s.manifest.stimulusId,
          mediaRevisionIds: s.manifest.learnerMediaRevisions.map((r) => r.mediaRevisionId).sort(),
        }))
        .sort((a, b) => a.assetId.localeCompare(b.assetId)),
    },
    learnerSafePayloadDigest: canonicalDigest("synthetic"),
    freshnessDecision: "fresh",
    comparedFamilyRefs: speech.map((s) => s.familyId),
    authorizationVersion: "synthetic/v1",
    contentReleaseIdentity: release.release_identity,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 45 * 60_000),
    digest: canonicalDigest(manifestId),
  });
  expect(issued.ok).toBe(true);
  // Production creation must leave Listening timing unset, including exact retry.
  const commands = createAttemptCommandFunctions(attempts, content, () => now);
  const createInput = {
    operationId: appId<"operation">(randomUUID()),
    servingManifestId: manifestId,
    activityOccurrenceId: activityId,
  };
  let attemptId: string;
  if (speech.length === 1) {
    const created = await commands.create(scope, createInput);
    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error(created.error);
    expect(await commands.create(scope, createInput)).toEqual(created);
    attemptId = created.value.attemptId;
  } else {
    // A persisted multi-part pin exercises plan scope; the current acquisition UI selects one family.
    attemptId = randomUUID();
    const created = await attempts.createAttempt(scope, {
      operationId: createInput.operationId,
      attemptId: appId(attemptId),
      servingManifestId: manifestId,
      sessionId: appId(sessionId),
      activityOccurrenceId: appId(activityId),
      episodeId: appId(episodeId),
      contentRevisionId: appId(first.revisionId),
      modality: "listening",
      directLane: "aural",
      payloadDigest: canonicalDigest(createInput),
      occurredAt: now,
    });
    expect(created.ok).toBe(true);
  }
  expect(
    (await pool.query("SELECT state,occurred_at FROM app.attempts WHERE id=$1", [attemptId]))
      .rows[0],
  ).toEqual({ state: "ready", occurred_at: null });
  return { scope, attemptId, manifestId, content, attempts, commands };
}

async function fixture(pool: Pool, count = 1, profile: "P0" | "P1" | "P2" | "P3" | "P4" = "P4") {
  const speech = [];
  for (let i = 0; i < count; i++)
    speech.push(await syntheticSpeech(pool, `runtime-${i}`, "C3", false, profile));
  const seeded = await seedAttempt(pool, speech, profile);
  let now = new Date(Date.now() + 1000);
  const objects = new Map(
    speech.flatMap((s) => s.input.objects ?? []).map((o) => [o.objectKey, o.bytes]),
  );
  const read = vi.fn(async (key: string) => objects.get(key));
  const runtime = new PostgresListeningRuntime(pool, audioCatalogueValidator, { read }, () => now);
  const view = await runtime.readPlan(seeded.scope, seeded.attemptId);
  let version = view.resourceVersion;
  const advance = (ms = 1000) => {
    now = new Date(now.getTime() + ms);
  };
  function observation(): MediaPreflightObservation {
    const at = now.toISOString();
    const command: MediaPreflightObservation = {
      contractMajor: 1,
      operationId: randomUUID(),
      listeningPlanId: view.plan.listeningPlanId,
      expectedVersion: version,
      policyVersions: {
        preflight: view.plan.preflightPolicyRef,
        playback: view.plan.playbackPolicyRef,
        timer: view.plan.timerPolicyRef,
      },
      context: { contextId: "test-context/v1", environmentChangeCounter: 0 },
      candidates: view.plan.occurrences.map((o) => {
        const c = o.candidates[0];
        if (!c) throw new Error("fixture candidate");
        return {
          occurrenceId: o.occurrenceId,
          assetId: c.assetId,
          manifestRevision: c.manifestRevision,
          manifestDigest: c.manifestDigest,
          mediaRevisionId: c.mediaRevisionId,
          observedDigest: c.digest,
          receivedBytes: c.bytes,
          loadResult: "decoded",
          retainedHandle: { kind: "memory_blob", handleId: randomUUID() },
          observedAt: at,
        };
      }),
      outputProbe: {
        probeRevisionId: view.outputProbeRevisionId,
        playbackResult: "completed",
        completedAt: at,
        learnerConfirmedAt: at,
      },
      outboxProbe: {
        operationId: randomUUID(),
        writeResult: "committed_and_read_back",
        payloadDigest: "0".repeat(64),
        observedAt: at,
      },
    };
    command.outboxProbe.payloadDigest = canonicalDigest(listeningOutboxProbePayload(command));
    return command;
  }
  async function ready() {
    const command = observation();
    const receipt = await runtime.preflight(seeded.scope, command);
    version = receipt.resourceVersion;
    expect(receipt.outcome).toBe("ready");
    return { command, receipt };
  }
  const intents = new Map<string, { id: string; at: string; sequence: number }>();
  function event(
    receipt: MediaPreflightReceipt,
    event: PlaybackOccurrenceCommand["event"],
    occurrenceIndex = 0,
    ordinal = 1,
  ): PlaybackOccurrenceCommand {
    const occurrence = view.plan.occurrences[occurrenceIndex];
    const candidate = occurrence?.candidates[0];
    if (!occurrence || !candidate) throw new Error("fixture occurrence");
    const key = `${occurrenceIndex}/${ordinal}`;
    const previous = intents.get(key);
    const intent = previous ?? { id: randomUUID(), at: now.toISOString(), sequence: 0 };
    intent.sequence++;
    intents.set(key, intent);
    return {
      contractMajor: 1,
      operationId: randomUUID(),
      listeningPlanId: view.plan.listeningPlanId,
      occurrenceId: occurrence.occurrenceId,
      expectedVersion: version,
      playOrdinal: ordinal,
      mediaRevisionId: candidate.mediaRevisionId,
      preflightReceiptId: receipt.receiptId,
      context: receipt.context,
      clientSequence: intent.sequence,
      event,
      localIntentId: intent.id,
      intentPersistedAt: intent.at,
      intentDurability: "committed_and_read_back",
      occurredAt: now.toISOString(),
      positionMs: event === "completed" ? candidate.durationMs : 0,
      observations: {
        visibilityChanges: 0,
        stallIntervals: [],
        outputOrDeviceChange: false,
        learnerPauseMs: 0,
        technicalPauseMs: 0,
        speedActual: occurrence.authoredSpeedRatio,
      },
      ...(event === "failed" ? { faultReason: "playback_stalled" } : {}),
    };
  }
  async function play(command: PlaybackOccurrenceCommand) {
    const receipt = await runtime.playback(seeded.scope, command);
    version = receipt.resourceVersion;
    return receipt;
  }
  async function complete(receipt: MediaPreflightReceipt, occurrence = 0, ordinal = 1) {
    await play(event(receipt, "start_intent", occurrence, ordinal));
    advance();
    await play(event(receipt, "started", occurrence, ordinal));
    advance(1000);
    return play(event(receipt, "completed", occurrence, ordinal));
  }
  return {
    ...seeded,
    speech,
    runtime,
    view,
    objects,
    read,
    advance,
    observation,
    ready,
    event,
    play,
    complete,
    now: () => now,
    setVersion: (v: number) => {
      version = v;
    },
  };
}

describe.skipIf(!process.env.TEST_DATABASE_URL)("Listening server runtime", () => {
  it("P05-PREFLIGHT-001 P05-PLAYBACK-001 preserves exact operation UUIDs in receipt and occurrence rows", async () =>
    setup(async (pool) => {
      const f = await fixture(pool);
      const { command, receipt } = await f.ready();
      const intent = f.event(receipt, "start_intent");
      const authorized = await f.play(intent);
      expect(
        (
          await pool.query(
            "SELECT operation_id::text FROM app.media_preflight_receipts WHERE learner_scope_id=$1 AND id=$2",
            [f.scope.learnerScopeId, receipt.receiptId],
          )
        ).rows[0],
      ).toEqual({ operation_id: command.operationId });
      expect(
        (
          await pool.query(
            "SELECT operation_id::text FROM app.playback_occurrences WHERE learner_scope_id=$1 AND occurrence_id=$2 AND play_ordinal=$3",
            [f.scope.learnerScopeId, intent.occurrenceId, intent.playOrdinal],
          )
        ).rows[0],
      ).toEqual({ operation_id: intent.operationId });
      expect(await f.runtime.preflight(f.scope, command)).toEqual(receipt);
      expect(await f.runtime.playback(f.scope, intent)).toEqual(authorized);
      await expect(
        f.runtime.preflight(f.scope, { ...command, expectedVersion: authorized.resourceVersion }),
      ).rejects.toThrow("idempotency_conflict");
      await expect(
        f.runtime.playback(f.scope, { ...intent, expectedVersion: authorized.resourceVersion }),
      ).rejects.toThrow("idempotency_conflict");
      expect(
        (
          await pool.query(
            "SELECT operation_id,receipt FROM app.listening_operation_facts WHERE learner_scope_id=$1 AND listening_plan_id=$2 ORDER BY (receipt->>'resourceVersion')::bigint",
            [f.scope.learnerScopeId, f.view.plan.listeningPlanId],
          )
        ).rows,
      ).toEqual([
        { operation_id: command.operationId, receipt },
        { operation_id: intent.operationId, receipt: authorized },
      ]);
    }));
  it.each(["completed", "failed"] as const)(
    "P05-RECOVERY-001 bounds actual native start by original authorization expiry but retains later %s facts",
    async (terminalEvent) =>
      setup(async (pool) => {
        const f = await fixture(pool);
        const { receipt } = await f.ready();
        const intent = f.event(receipt, "start_intent");
        const authorized = await f.play(intent);
        f.advance(Date.parse(receipt.expiresAt) - f.now().getTime() + 2000);
        const native = f.event(receipt, "started");
        const tooLate = {
          ...native,
          occurredAt: new Date(Date.parse(receipt.expiresAt) + 1).toISOString(),
        };
        await expect(f.runtime.playback(f.scope, tooLate)).rejects.toThrow("not_available");
        await expect(f.runtime.playback(f.scope, tooLate)).rejects.toThrow("not_available");
        expect(
          (
            await pool.query("SELECT state,occurred_at FROM app.attempts WHERE id=$1", [
              f.attemptId,
            ])
          ).rows[0],
        ).toEqual({ state: "ready", occurred_at: null });
        expect(
          (
            await pool.query(
              "SELECT state,started_at,client_sequence FROM app.playback_occurrences WHERE learner_scope_id=$1 AND occurrence_id=$2 AND play_ordinal=$3",
              [f.scope.learnerScopeId, intent.occurrenceId, intent.playOrdinal],
            )
          ).rows[0],
        ).toEqual({ state: "authorized", started_at: null, client_sequence: "1" });
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM app.listening_operation_facts WHERE learner_scope_id=$1 AND listening_plan_id=$2",
              [f.scope.learnerScopeId, f.view.plan.listeningPlanId],
            )
          ).rows[0].n,
        ).toBe(2);
        expect((await pool.query("SELECT count(*)::int n FROM app.exposure_facts")).rows[0].n).toBe(
          0,
        );
        const withinAuthorization = {
          ...native,
          operationId: randomUUID(),
          occurredAt: new Date(Date.parse(receipt.expiresAt) - 1).toISOString(),
        };
        const started = await f.play(withinAuthorization);
        expect(started).toMatchObject({
          event: "started",
          mayStartNow: false,
          authorizationExpiresAt: receipt.expiresAt,
        });
        expect(await f.runtime.playback(f.scope, withinAuthorization)).toEqual(started);
        f.advance();
        const terminal = f.event(receipt, terminalEvent);
        expect(Date.parse(terminal.occurredAt)).toBeGreaterThan(Date.parse(receipt.expiresAt));
        const recorded = await f.play(terminal);
        expect(recorded.event).toBe(terminalEvent);
        expect(recorded.mayStartNow).toBe(false);
        expect(await f.runtime.playback(f.scope, terminal)).toEqual(recorded);
        expect(await f.runtime.playback(f.scope, withinAuthorization)).toEqual(started);
        expect(await f.runtime.playback(f.scope, intent)).toEqual(authorized);
      }),
  );
  it.each(["revoked_before_start", "revoked_after_pin"] as const)(
    "P05-LISTENING-001 projects effective manifest %s without new byte, preflight or play admission",
    async (revocationState) =>
      setup(async (pool) => {
        const f = await fixture(pool);
        const { command, receipt } = await f.ready();
        await pool.query("UPDATE app.serving_manifests SET revocation_state=$2 WHERE id=$1", [
          f.manifestId,
          revocationState,
        ]);
        const revoked = await f.runtime.readPlan(f.scope, f.attemptId);
        expect(revoked.plan).toEqual({ ...f.view.plan, revocationState });
        expect(revoked.latestPreflight).toEqual(receipt);
        // The immutable pin and receipt stay readable; admission uses current revocation.
        expect(
          (
            await pool.query("SELECT revocation_state FROM app.listening_plans WHERE id=$1", [
              f.view.plan.listeningPlanId,
            ])
          ).rows[0],
        ).toEqual({ revocation_state: "active" });
        await expect(
          f.runtime.audio(f.scope, f.view.plan.listeningPlanId, required(f.speech[0]).mediaId),
        ).rejects.toThrow("not_available");
        expect(f.read).not.toHaveBeenCalled();
        await expect(f.runtime.playback(f.scope, f.event(receipt, "start_intent"))).rejects.toThrow(
          "not_available",
        );
        const unavailable = await f.runtime.preflight(f.scope, f.observation());
        expect(unavailable.outcome).toBe("unavailable_affected_activity");
        expect(unavailable.reasons).toContain("plan_expired");
        expect(await f.runtime.preflight(f.scope, command)).toEqual(receipt);
        const recovery = await f.runtime.readPlan(f.scope, f.attemptId);
        expect(recovery.plan.revocationState).toBe(revocationState);
        expect(recovery.latestPreflight).toEqual(unavailable);
        expect(recovery.playback).toEqual([]);
        expect(
          (await pool.query("SELECT count(*)::int n FROM app.playback_occurrences")).rows[0].n,
        ).toBe(0);
        expect(
          (
            await pool.query("SELECT state,occurred_at FROM app.attempts WHERE id=$1", [
              f.attemptId,
            ])
          ).rows[0],
        ).toEqual({ state: "ready", occurred_at: null });
      }),
  );
  it("P05-LISTENING-001 P05-SECURITY-001 pins one exact plan, denies other learners and verifies private bytes without leaking keys", async () =>
    setup(async (pool) => {
      const f = await fixture(pool);
      const s = f.speech[0];
      if (!s) throw new Error("fixture");
      expect(await f.runtime.readPlan(f.scope, f.attemptId)).toEqual(f.view);
      const json = JSON.stringify(f.view);
      expect(json).not.toContain("objectKey");
      expect(json).not.toContain(s.manifest.transcript.digest);
      expect(json).not.toContain("Synthetischer");
      const other = await scopeFor(pool);
      await expect(f.runtime.readPlan(other, f.attemptId)).rejects.toThrow("not_available");
      await expect(f.runtime.audio(other, f.view.plan.listeningPlanId, s.mediaId)).rejects.toThrow(
        "not_available",
      );
      await expect(
        f.runtime.audio(f.scope, f.view.plan.listeningPlanId, randomUUID()),
      ).rejects.toThrow("not_available");
      const bytes = await f.runtime.audio(f.scope, f.view.plan.listeningPlanId, s.mediaId);
      expect(bytes.bytes).toEqual(s.input.objects?.[0]?.bytes);
      f.objects.set(
        s.manifest.learnerMediaRevisions[0]?.objectKey ?? "",
        Buffer.from("wrong length"),
      );
      await expect(
        f.runtime.audio(f.scope, f.view.plan.listeningPlanId, s.mediaId),
      ).rejects.toThrow("integrity_failed");
      f.objects.set(
        s.manifest.learnerMediaRevisions[0]?.objectKey ?? "",
        new Uint8Array(s.manifest.learnerMediaRevisions[0]?.bytes ?? 0),
      );
      await expect(
        f.runtime.audio(f.scope, f.view.plan.listeningPlanId, s.mediaId),
      ).rejects.toThrow("integrity_failed");
      await pool.query(
        "UPDATE app.media_assets SET manifest_revision='unrelated-successor' WHERE id=$1",
        [s.assetId],
      );
      await expect(
        f.runtime.audio(f.scope, f.view.plan.listeningPlanId, s.mediaId),
      ).rejects.toThrow();
      expect((await f.runtime.readPlan(f.scope, f.attemptId)).plan).toEqual(f.view.plan);
    }));
  it("P05-SECURITY-001 separates transcript rights, refuses withdrawn audio and a later approval decision", async () =>
    setup(async (pool) => {
      const f = await fixture(pool);
      const s = f.speech[0];
      if (!s) throw new Error("fixture");
      await pool.query("UPDATE app.rights_envelopes SET state='withdrawn' WHERE id=$1", [
        s.transcriptRightsId,
      ]);
      expect(
        (await f.runtime.audio(f.scope, f.view.plan.listeningPlanId, s.mediaId)).bytes.length,
      ).toBeGreaterThan(0);
      await pool.query("UPDATE app.rights_envelopes SET state='withdrawn' WHERE id=$1", [
        s.rightsId,
      ]);
      await expect(
        f.runtime.audio(f.scope, f.view.plan.listeningPlanId, s.mediaId),
      ).rejects.toThrow();
      await pool.query("UPDATE app.rights_envelopes SET state='current' WHERE id=$1", [s.rightsId]);
      await approval(pool, {
        decisionId: randomUUID(),
        subjectId: s.assetId,
        subjectKind: "media_asset",
        contentClass: "C3",
        level: "quarantine",
        evidenceRef: "synthetic runtime withdrawal",
      });
      await expect(
        f.runtime.audio(f.scope, f.view.plan.listeningPlanId, s.mediaId),
      ).rejects.toThrow();
    }));
  it("P05-PREFLIGHT-001 requires every fact, exact context/policy/outbox and immutable operation retries", async () =>
    setup(async (pool) => {
      const f = await fixture(pool);
      const cases: Array<(c: MediaPreflightObservation) => void> = [
        (c) => {
          required(c.candidates[0]).receivedBytes--;
        },
        (c) => {
          required(c.candidates[0]).observedDigest = "0".repeat(64);
        },
        (c) => {
          required(c.candidates[0]).loadResult = "not_attempted";
        },
        (c) => {
          required(c.candidates[0]).retainedHandle = null;
        },
        (c) => {
          c.outputProbe.learnerConfirmedAt = null;
        },
        (c) => {
          c.outboxProbe.writeResult = "failed";
        },
        (c) => {
          c.outboxProbe.payloadDigest = "0".repeat(64);
        },
        (c) => {
          c.policyVersions.playback = "wrong/v1";
        },
        (c) => {
          c.candidates.push({ ...required(c.candidates[0]) });
        },
      ];
      for (const mutate of cases) {
        const command = f.observation();
        mutate(command);
        const receipt = await f.runtime.preflight(f.scope, command);
        f.setVersion(receipt.resourceVersion);
        expect(receipt.outcome).not.toBe("ready");
        expect(await f.runtime.preflight(f.scope, command)).toEqual(receipt);
        await expect(
          f.runtime.preflight(f.scope, { ...command, expectedVersion: receipt.resourceVersion }),
        ).rejects.toThrow("idempotency_conflict");
      }
      const { command, receipt } = await f.ready();
      expect(
        (await pool.query("SELECT state,occurred_at FROM app.attempts WHERE id=$1", [f.attemptId]))
          .rows[0],
      ).toEqual({ state: "ready", occurred_at: null });
      expect(
        (await pool.query("SELECT count(*)::int n FROM app.playback_occurrences")).rows[0].n,
      ).toBe(0);
      expect((await pool.query("SELECT count(*)::int n FROM app.exposure_facts")).rows[0].n).toBe(
        0,
      );
      const other = await scopeFor(pool);
      await expect(f.runtime.preflight(other, command)).rejects.toThrow("not_available");
      const changed = f.observation();
      changed.context = { contextId: "different-context", environmentChangeCounter: 0 };
      changed.outboxProbe.payloadDigest = canonicalDigest(listeningOutboxProbePayload(changed));
      const failedContext = await f.runtime.preflight(f.scope, changed);
      expect(failedContext.reasons).toContain("context_changed");
      f.setVersion(failedContext.resourceVersion);
      await expect(f.runtime.playback(f.scope, f.event(receipt, "start_intent"))).rejects.toThrow(
        "conflict",
      );
      f.advance(46 * 60_000);
      expect(await f.runtime.preflight(f.scope, command)).toEqual(receipt);
      await expect(
        pool.query("UPDATE app.listening_operation_facts SET receipt='{}' WHERE operation_id=$1", [
          command.operationId,
        ]),
      ).rejects.toThrow();
      await expect(
        pool.query("DELETE FROM app.media_preflight_receipts WHERE id=$1", [receipt.receiptId]),
      ).rejects.toThrow();
    }));
  it("P05-PLAYBACK-001 serializes ordinal admission, preserves native timing and refuses duplicates/prerequisite/exhaustion", async () =>
    setup(async (pool) => {
      const f = await fixture(pool);
      const { receipt } = await f.ready();
      const ordinal2 = f.event(receipt, "start_intent", 0, 2);
      await expect(f.runtime.playback(f.scope, ordinal2)).rejects.toThrow("conflict");
      const start = f.event(receipt, "start_intent");
      await expect(f.runtime.playback(await scopeFor(pool), start)).rejects.toThrow(
        "not_available",
      );
      const contenders = [
        start,
        {
          ...start,
          operationId: randomUUID(),
          localIntentId: randomUUID(),
        },
      ];
      const raced = await Promise.allSettled(
        contenders.map((command) => f.runtime.playback(f.scope, command)),
      );
      expect(raced.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      const winner = raced.findIndex((r) => r.status === "fulfilled");
      const accepted = raced[winner];
      const winningCommand = required(contenders[winner]);
      if (accepted?.status !== "fulfilled") throw new Error("serialized intent missing");
      f.setVersion(accepted.value.resourceVersion);
      expect(accepted.value.mayStartNow).toBe(true);
      expect(await f.runtime.playback(f.scope, winningCommand)).toEqual(accepted.value);
      await expect(
        f.runtime.playback(f.scope, { ...winningCommand, positionMs: 1 }),
      ).rejects.toThrow("idempotency_conflict");
      expect(
        (await pool.query("SELECT occurred_at,state FROM app.attempts WHERE id=$1", [f.attemptId]))
          .rows[0],
      ).toEqual({ occurred_at: null, state: "ready" });
      f.advance();
      const started = await f.play({
        ...f.event(receipt, "started"),
        localIntentId: winningCommand.localIntentId,
        observations: { ...start.observations, speedActual: 0.9 },
      });
      expect(started.phase).toBe("playing");
      expect(
        (await pool.query("SELECT occurred_at,state FROM app.attempts WHERE id=$1", [f.attemptId]))
          .rows[0],
      ).toEqual({ occurred_at: f.now(), state: "in_progress" });
      expect((await pool.query("SELECT count(*)::int n FROM app.exposure_facts")).rows[0].n).toBe(
        1,
      );
      f.advance();
      await f.play({
        ...f.event(receipt, "completed"),
        localIntentId: winningCommand.localIntentId,
      });
      expect(
        (await f.attempts.readRecordedAttemptConditions(f.scope, appId(f.attemptId)))?.listening
          ?.alteredItemIds,
      ).toEqual([required(f.speech[0]).itemId]);
      const correctedSecond = {
        ...ordinal2,
        operationId: randomUUID(),
        expectedVersion: 4,
        occurredAt: f.now().toISOString(),
        intentPersistedAt: f.now().toISOString(),
      };
      const second = await f.runtime.playback(f.scope, correctedSecond);
      f.setVersion(second.resourceVersion);
      // Complete ordinal 2 using its persisted identity, not the failed earlier local draft.
      f.advance();
      const native = {
        ...correctedSecond,
        operationId: randomUUID(),
        expectedVersion: second.resourceVersion,
        event: "started" as const,
        clientSequence: 2,
        occurredAt: f.now().toISOString(),
      };
      const nativeReceipt = await f.runtime.playback(f.scope, native);
      f.advance();
      const end = {
        ...native,
        operationId: randomUUID(),
        expectedVersion: nativeReceipt.resourceVersion,
        event: "completed" as const,
        clientSequence: 3,
        occurredAt: f.now().toISOString(),
        positionMs: 1000,
      };
      expect((await f.runtime.playback(f.scope, end)).phase).toBe("block_complete");
      await expect(
        f.runtime.playback(f.scope, {
          ...end,
          event: "start_intent",
          operationId: randomUUID(),
          expectedVersion: 7,
          playOrdinal: 3,
          clientSequence: 1,
          positionMs: 0,
        }),
      ).rejects.toThrow();
      expect(
        (await pool.query("SELECT count(*)::int n FROM app.playback_occurrences")).rows[0].n,
      ).toBe(2);
      await expect(
        f.runtime.audio(f.scope, f.view.plan.listeningPlanId, required(f.speech[0]).mediaId),
      ).rejects.toThrow("not_available");
    }));
  it("P05-RECOVERY-001 preserves offline facts after expiry/withdrawal without issuing bytes or a fresh opportunity", async () =>
    setup(async (pool) => {
      const f = await fixture(pool);
      const { receipt } = await f.ready();
      const start = f.event(receipt, "start_intent");
      const authorized = await f.play(start);
      f.advance();
      const native = f.event(receipt, "started");
      f.advance();
      const fault = f.event(receipt, "failed");
      await pool.query("UPDATE app.media_assets SET status='withdrawn' WHERE id=$1", [
        f.speech[0]?.assetId,
      ]);
      f.advance(46 * 60_000);
      expect(await f.runtime.playback(f.scope, start)).toEqual(authorized);
      await f.play(native);
      fault.expectedVersion = 3;
      const failed = await f.play(fault);
      expect(failed).toMatchObject({
        mayStartNow: false,
        affectedItemIds: [f.speech[0]?.itemId],
        phase: "interrupted",
      });
      expect(await f.runtime.playback(f.scope, fault)).toEqual(failed);
      await expect(
        f.runtime.audio(f.scope, f.view.plan.listeningPlanId, required(f.speech[0]).mediaId),
      ).rejects.toThrow();
      await expect(
        f.runtime.playback(f.scope, f.event(receipt, "start_intent", 0, 2)),
      ).rejects.toThrow();
      expect(
        (await pool.query("SELECT count(*)::int n FROM app.objective_outcomes")).rows[0].n,
      ).toBe(0);
      expect(
        (await pool.query("SELECT count(*)::int n FROM app.attempt_submissions")).rows[0].n,
      ).toBe(0);
      const conditions = await f.attempts.readRecordedAttemptConditions(
        f.scope,
        appId(f.attemptId),
      );
      expect(conditions?.listening?.uncapturedItemIds).toEqual([f.speech[0]?.itemId]);
    }));
  it("P05-RECOVERY-001 records a delayed durable intent as recovery-only and derives only its affected item partition", async () =>
    setup(async (pool) => {
      const f = await fixture(pool, 2);
      const { receipt } = await f.ready();
      await f.complete(receipt, 0, 1);
      await f.complete(receipt, 0, 2);
      const start = f.event(receipt, "start_intent", 1);
      f.advance();
      const native = f.event(receipt, "started", 1);
      f.advance();
      const fault = f.event(receipt, "failed", 1);
      f.advance(46 * 60_000);
      const recorded = await f.play(start);
      expect(recorded.mayStartNow).toBe(false);
      native.expectedVersion = recorded.resourceVersion;
      const played = await f.play(native);
      fault.expectedVersion = played.resourceVersion;
      const failed = await f.play(fault);
      expect(failed.affectedItemIds).toEqual([f.speech[1]?.itemId]);
      expect(failed.phase).toBe("block_complete");
      const conditions = await f.attempts.readRecordedAttemptConditions(
        f.scope,
        appId(f.attemptId),
      );
      expect(conditions?.listening).toMatchObject({
        started: true,
        blockComplete: true,
        uncapturedItemIds: [f.speech[1]?.itemId],
      });
      expect(conditions?.listening?.uncapturedItemIds).not.toContain(f.speech[0]?.itemId);
    }));
  it.each(["P0", "P1", "P2", "P3", "P4"] as const)(
    "P05-TRANSCRIPT-001 gates %s transcripts on submission and the whole P4 block",
    async (profile) =>
      setup(async (pool) => {
        const f = await fixture(pool, profile === "P4" ? 2 : 1, profile);
        const s = required(f.speech[0]);
        const planId = f.view.plan.listeningPlanId;
        await expect(f.runtime.transcript(f.scope, planId, s.mediaId)).rejects.toThrow();
        expect(f.read).not.toHaveBeenCalled();
        const { receipt } = await f.ready();
        await f.complete(receipt, 0, 1);
        if (profile !== "P0") await f.complete(receipt, 0, 2);
        await expect(f.runtime.transcript(f.scope, planId, s.mediaId)).rejects.toThrow();
        // A synthetic submission row exercises only the persisted phase gate, never owner completion.
        await pool.query(
          "INSERT INTO app.attempt_submissions(id,learner_scope_id,attempt_id,operation_id,serving_manifest_id,checkpoint_sequence,canonical_response,response_digest,conditions,uncaptured_item_ids,form_and_key_versions) VALUES($1,$2,$3,$4,$5,1,'{}',$6,'{}','[]','{}')",
          [
            randomUUID(),
            f.scope.learnerScopeId,
            f.attemptId,
            randomUUID(),
            f.manifestId,
            canonicalDigest("test"),
          ],
        );
        if (profile === "P4") {
          await expect(f.runtime.transcript(f.scope, planId, s.mediaId)).rejects.toThrow();
          await f.complete(receipt, 1, 1);
          await f.complete(receipt, 1, 2);
        }
        expect(await f.runtime.transcript(f.scope, planId, s.mediaId)).toMatchObject({
          text: "Synthetischer privater Text.",
          mediaRevisionId: s.mediaId,
          authorizedPhase: profile === "P4" ? "after_block" : "after_attempt",
        });
        const disclosed = (
          await pool.query(
            "SELECT count(*)::int n FROM app.exposure_facts WHERE learner_scope_id=$1 AND envelope->>'kind'='transcript'",
            [f.scope.learnerScopeId],
          )
        ).rows[0].n;
        expect(disclosed).toBe(1);
        await f.runtime.transcript(f.scope, planId, s.mediaId);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM app.exposure_facts WHERE learner_scope_id=$1 AND envelope->>'kind'='transcript'",
              [f.scope.learnerScopeId],
            )
          ).rows[0].n,
        ).toBe(disclosed);
        const other = await scopeFor(pool);
        await expect(f.runtime.transcript(other, planId, s.mediaId)).rejects.toThrow();
        await pool.query("UPDATE app.rights_envelopes SET state='withdrawn' WHERE id=$1", [
          s.transcriptRightsId,
        ]);
        await expect(f.runtime.transcript(f.scope, planId, s.mediaId)).rejects.toThrow();
        await pool.query("UPDATE app.rights_envelopes SET state='current' WHERE id=$1", [
          s.transcriptRightsId,
        ]);
        f.objects.set(s.manifest.transcript.objectKey, Buffer.from("wrong text"));
        await expect(f.runtime.transcript(f.scope, planId, s.mediaId)).rejects.toThrow(
          "integrity_failed",
        );
      }),
  );
});

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("required Listening fixture");
  return value;
}
