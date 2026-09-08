import AxeBuilder from "@axe-core/playwright";
import { listeningOutboxProbePayload } from "@bestehen/application";
import { canonicalDigest } from "@bestehen/content";
import type {
  ListeningPlan,
  MediaPreflightObservation,
  MediaPreflightReceipt,
  PlaybackOccurrenceCommand,
} from "@bestehen/contracts";
import { expect, type Page } from "@playwright/test";
import { test, jsonHeaders, publicOrigin, type BrowserAttempt } from "./p05-owner.fixture";

async function selectAnswer(page: Page, attempt: BrowserAttempt, index: number) {
  await page
    .locator(`input[name="select:${attempt.itemIds[index]}"][value="choice-${index + 1}"]`)
    .check();
}
async function selectAnswerAndSync(page: Page, attempt: BrowserAttempt, index: number) {
  const checkpoint = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.url().endsWith("/checkpoint"),
  );
  await selectAnswer(page, attempt, index);
  expect((await checkpoint).status()).toBe(200);
  await expect(page.getByText("Synced. Your answers are saved.")).toBeVisible();
}
async function submit(page: Page) {
  await page.getByRole("checkbox", { name: /I confirm these answers/ }).check();
  await page.getByRole("button", { name: "Submit answer", exact: true }).click();
}
async function gotoAttempt(page: Page, attemptId: string) {
  const recovery = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      response.url().includes(`/api/v1/attempts/${attemptId}?major=1`),
  );
  await page.goto(`/attempt/${attemptId}`);
  expect((await recovery).status()).toBe(200);
  await expect(
    page.getByText("Choose answers, or deliberately leave blanks, then submit."),
  ).toBeVisible();
}
async function localResponse(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{ values: Record<string, string>; pending: unknown }[]>((resolve, reject) => {
        const request = indexedDB.open("bestehen-objective-continuity-v1", 1);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("responses", "readonly");
          const read = tx.objectStore("responses").getAll();
          tx.oncomplete = () => {
            db.close();
            resolve(read.result);
          };
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      }),
  );
}

test("P05-RECOVERY-001 authenticated network interruption preserves the local draft and syncs the real checkpoint", async ({
  page,
  context,
  owner,
}) => {
  const attempt = await owner.createAttempt();
  await gotoAttempt(page, attempt.id);
  await context.setOffline(true);
  await selectAnswer(page, attempt, 0);
  await expect(
    page.getByText("Your saved work is waiting for a connection. Retry when you are ready."),
  ).toBeVisible();
  const saved = await localResponse(page);
  expect(saved).toHaveLength(1);
  expect(saved[0]?.values[`select:${attempt.itemIds[0]}`]).toBe("choice-1");
  await context.setOffline(false);
  await page.getByRole("button", { name: "Retry saved work" }).click();
  await expect(page.getByText("Synced. Your answers are saved.")).toBeVisible();
  await selectAnswerAndSync(page, attempt, 1);
  await submit(page);
  await expect(page).toHaveURL(`/attempt/${attempt.id}/result`);
  const count = await owner.pool.query(
    "SELECT count(*)::int AS n FROM app.attempt_submissions WHERE attempt_id=$1",
    [attempt.id],
  );
  expect(count.rows[0].n).toBe(1);
});

test("P05-RECOVERY-001 lost real submit response resolves submission_unknown by receipt and duplicate command replays", async ({
  page,
  context,
  owner,
}) => {
  const attempt = await owner.createAttempt();
  await gotoAttempt(page, attempt.id);
  await selectAnswerAndSync(page, attempt, 0);
  await selectAnswerAndSync(page, attempt, 1);
  let submittedBody: unknown;
  let dropped = false;
  const recoveries: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "GET" && request.url().includes(`/api/v1/attempts/${attempt.id}?`))
      recoveries.push(request.url());
  });
  await page.route(`**/api/v1/attempts/${attempt.id}/submit`, async (route) => {
    if (dropped) {
      await route.continue();
      return;
    }
    submittedBody = route.request().postDataJSON();
    const response = await route.fetch();
    expect(response.status(), await response.text()).toBe(200);
    dropped = true;
    // The real handler committed. Only its network response is lost.
    await context.setOffline(true);
    await route.abort("connectionclosed");
  });
  await submit(page);
  await expect(
    page.getByText(
      "Your response is preserved. The submission result is not yet confirmed. Retry to check it.",
    ),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const before = recoveries.length;
  await context.setOffline(false);
  await expect(page).toHaveURL(`/attempt/${attempt.id}/result`);
  expect(recoveries.length).toBeGreaterThan(before);
  const replay = await owner.context.request.post(
    `${publicOrigin}/api/v1/attempts/${attempt.id}/submit`,
    { headers: jsonHeaders, data: submittedBody },
  );
  expect(replay.status(), await replay.text()).toBe(200);
  const count = await owner.pool.query(
    "SELECT count(*)::int AS n FROM app.attempt_submissions WHERE attempt_id=$1",
    [attempt.id],
  );
  expect(count.rows[0].n).toBe(1);
});

test("P05-RECOVERY-001 session expiry preserves answers elapsed time and pinned conditions through reauthentication and reload", async ({
  page,
  owner,
}) => {
  const attempt = await owner.createAttempt();
  await gotoAttempt(page, attempt.id);
  const pinned = (
    await owner.pool.query("SELECT occurred_at,serving_manifest_id FROM app.attempts WHERE id=$1", [
      attempt.id,
    ])
  ).rows[0];
  await page.waitForTimeout(1100);
  await owner.expireSession();
  await selectAnswer(page, attempt, 0);
  await expect(
    page.getByText("Sign in again, then retry. Pending answers remain saved on this device."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sign in in a new tab, then return here" }),
  ).toHaveAttribute("href", `/auth/login?returnTo=${encodeURIComponent(`/attempt/${attempt.id}`)}`);
  expect((await localResponse(page))[0]?.values[`select:${attempt.itemIds[0]}`]).toBe("choice-1");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  // Test provisioning replaces an expired opaque session; normal authenticate validates it.
  await owner.renewSession();
  await page.getByRole("button", { name: "Retry saved work" }).click();
  await expect(page.getByText("Synced. Your answers are saved.")).toBeVisible();
  await page.reload();
  await expect(
    page.locator(`input[name="select:${attempt.itemIds[0]}"][value="choice-1"]`),
  ).toBeChecked();
  await expect(
    page.getByText(
      "Timing continuity needs review. Your work is preserved and can continue as practice.",
    ),
  ).toBeVisible();
  await selectAnswer(page, attempt, 1);
  await submit(page);
  await expect(page).toHaveURL(`/attempt/${attempt.id}/result`);
  expect(
    (
      await owner.pool.query(
        "SELECT occurred_at,serving_manifest_id FROM app.attempts WHERE id=$1",
        [attempt.id],
      )
    ).rows[0],
  ).toEqual(pinned);
  const conditions = (
    await owner.pool.query("SELECT conditions FROM app.attempt_submissions WHERE attempt_id=$1", [
      attempt.id,
    ])
  ).rows[0].conditions;
  expect(conditions.continuityLostScope).toEqual(expect.arrayContaining(attempt.itemIds));
  expect(conditions.timerIntegrity).not.toBe("intact");
  const clock = (
    await owner.pool.query(
      "SELECT envelope FROM app.condition_facts WHERE learner_scope_id=$1 AND attempt_id=$2 AND fact_type='attempt_clock_observation_v1' ORDER BY learner_sequence DESC LIMIT 1",
      [owner.scopeId, attempt.id],
    )
  ).rows[0]?.envelope;
  expect(clock.recoveredFromAnotherContext).toBe(true);
  const elapsed = (
    await owner.pool.query(
      "SELECT extract(epoch FROM (s.committed_at-a.occurred_at))*1000 AS elapsed_ms FROM app.attempt_submissions s JOIN app.attempts a ON a.id=s.attempt_id WHERE s.attempt_id=$1",
      [attempt.id],
    )
  ).rows[0]?.elapsed_ms;
  expect(Number(elapsed)).toBeGreaterThan(1_000);
});

test("P05-RECOVERY-001 withdrawal after pin preserves the real recovery receipt and prevents fresh disclosure", async ({
  page,
  owner,
}) => {
  const attempt = await owner.createAttempt();
  await gotoAttempt(page, attempt.id);
  await selectAnswerAndSync(page, attempt, 0);
  const read = () =>
    owner.context.request.get(`${publicOrigin}/api/v1/attempts/${attempt.id}?major=1`);
  const before = await (await read()).json();
  await owner.pool.query("UPDATE app.content_revisions SET rights_state='withdrawn' WHERE id=$1", [
    attempt.revision,
  ]);
  const after = await read();
  expect(after.status()).toBe(200);
  expect(await after.json()).toEqual(before);
  await page.reload();
  await expect(
    page.getByText("Der Zug fährt heute nach Berlin. Das Museum öffnet um neun Uhr."),
  ).toBeVisible();
  const activity = crypto.randomUUID();
  await owner.pool.query(
    "INSERT INTO app.activity_occurrences(id,learner_scope_id,session_id,operation_id,state,resource_version) VALUES($1,$2,$3,$4,'active',1)",
    [activity, owner.scopeId, owner.sessionId, crypto.randomUUID()],
  );
  await owner.pool.query(
    "INSERT INTO app.coaching_episodes(id,learner_scope_id,activity_occurrence_id,state,resource_version) VALUES($1,$2,$3,'active',1)",
    [crypto.randomUUID(), owner.scopeId, activity],
  );
  const fresh = await owner.context.request.post(`${publicOrigin}/api/v1/serving-manifests`, {
    headers: jsonHeaders,
    data: {
      contract: { major: 1, minor: 0 },
      operationId: crypto.randomUUID(),
      expectedVersion: 0,
      payload: {
        taskFamily: attempt.kind,
        progressionProfile: "P2",
        activityOccurrenceId: activity,
      },
    },
  });
  expect(fresh.status()).toBe(404);
  const submission = await owner.pool.query(
    "SELECT count(*)::int AS n FROM app.attempt_submissions WHERE attempt_id=$1",
    [attempt.id],
  );
  expect(submission.rows[0].n).toBe(0);
});

test("P05-LISTENING-001 P05-A11Y-001 authenticated H2 production bytes fail closed and preserve the pinned attempt", async ({
  page,
  owner,
}) => {
  const attempt = await owner.createListeningAttempt();
  const planResponse = page.waitForResponse((response) =>
    response.url().includes(`/api/v1/attempts/${attempt.id}/listening-plan`),
  );
  await page.goto(`/attempt/${attempt.id}`);
  await expect(page.getByRole("heading", { level: 1, name: "Listening" })).toBeVisible();
  expect((await planResponse).status()).toBe(200);
  const audioResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/listening-plans/") && response.url().includes("/media/"),
  );
  await page.getByRole("button", { name: "Check audio and output" }).click();
  const denied = await audioResponse;
  expect(denied.status()).toBe(404);
  expect(denied.headers()).toMatchObject({
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  });
  await expect(page.getByText("This was a system problem, not a result about you.")).toBeVisible();
  const responseGroup = page.getByRole("group", { name: "Listening response" });
  await expect(responseGroup).toHaveAttribute("disabled", "");
  for (const control of await responseGroup.locator("input, select, button").all())
    await expect(control).toBeDisabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    (
      await owner.pool.query(
        "SELECT state,occurred_at FROM app.attempts WHERE learner_scope_id=$1 AND id=$2",
        [owner.scopeId, attempt.id],
      )
    ).rows[0],
  ).toEqual({ state: "ready", occurred_at: null });
  expect(
    (
      await owner.pool.query(
        "SELECT count(*)::int AS n FROM app.attempt_submissions WHERE learner_scope_id=$1 AND attempt_id=$2",
        [owner.scopeId, attempt.id],
      )
    ).rows[0].n,
  ).toBe(0);
});

test("P05-RECOVERY-001 authenticated playback stall records server-derived affected scope without an empty outcome", async ({
  owner,
}) => {
  const attempt = await owner.createListeningAttempt();
  const planResponse = await owner.context.request.get(
    `${publicOrigin}/api/v1/attempts/${attempt.id}/listening-plan`,
  );
  expect(planResponse.status(), await planResponse.text()).toBe(200);
  const view = (await planResponse.json()) as {
    plan: ListeningPlan;
    resourceVersion: number;
    outputProbeRevisionId: string;
  };
  const occurrence = view.plan.occurrences[0];
  if (!occurrence) throw new Error("Listening plan did not contain an occurrence");
  const candidate = occurrence.candidates[0];
  if (!candidate) throw new Error("Listening occurrence did not contain a candidate");
  const observedAt = new Date().toISOString();
  const preflight: MediaPreflightObservation = {
    contractMajor: 1,
    operationId: crypto.randomUUID(),
    listeningPlanId: view.plan.listeningPlanId,
    expectedVersion: view.resourceVersion,
    policyVersions: {
      preflight: view.plan.preflightPolicyRef,
      playback: view.plan.playbackPolicyRef,
      timer: view.plan.timerPolicyRef,
    },
    context: { contextId: "browser-test-only/v1", environmentChangeCounter: 0 },
    candidates: [
      {
        occurrenceId: occurrence.occurrenceId,
        assetId: candidate.assetId,
        manifestRevision: candidate.manifestRevision,
        manifestDigest: candidate.manifestDigest,
        mediaRevisionId: candidate.mediaRevisionId,
        observedDigest: candidate.digest,
        receivedBytes: candidate.bytes,
        loadResult: "decoded",
        retainedHandle: { kind: "bounded_cache", handleId: crypto.randomUUID() },
        observedAt,
      },
    ],
    outputProbe: {
      probeRevisionId: view.outputProbeRevisionId,
      playbackResult: "completed",
      completedAt: observedAt,
      learnerConfirmedAt: observedAt,
    },
    outboxProbe: {
      operationId: crypto.randomUUID(),
      writeResult: "committed_and_read_back",
      payloadDigest: "0".repeat(64),
      observedAt,
    },
  };
  preflight.outboxProbe.payloadDigest = canonicalDigest(listeningOutboxProbePayload(preflight));
  const readyResponse = await owner.context.request.post(
    `${publicOrigin}/api/v1/listening-plans/${view.plan.listeningPlanId}/preflight-receipts`,
    { headers: jsonHeaders, data: preflight },
  );
  expect(readyResponse.status(), await readyResponse.text()).toBe(200);
  const ready = (await readyResponse.json()) as MediaPreflightReceipt;
  expect(ready.outcome).toBe("ready");
  const localIntentId = crypto.randomUUID();
  const intentPersistedAt = new Date().toISOString();
  const observations = {
    visibilityChanges: 0,
    stallIntervals: [] as { fromMs: number; toMs: number }[],
    outputOrDeviceChange: false,
    learnerPauseMs: 0,
    technicalPauseMs: 0,
    speedActual: occurrence.authoredSpeedRatio,
  };
  const event = async (
    kind: PlaybackOccurrenceCommand["event"],
    expectedVersion: number,
    clientSequence: number,
  ) => {
    const command: PlaybackOccurrenceCommand = {
      contractMajor: 1,
      operationId: crypto.randomUUID(),
      listeningPlanId: view.plan.listeningPlanId,
      occurrenceId: occurrence.occurrenceId,
      expectedVersion,
      playOrdinal: 1,
      mediaRevisionId: candidate.mediaRevisionId,
      preflightReceiptId: ready.receiptId,
      context: ready.context,
      clientSequence,
      event: kind,
      localIntentId,
      intentPersistedAt,
      intentDurability: "committed_and_read_back",
      occurredAt: kind === "start_intent" ? intentPersistedAt : new Date().toISOString(),
      positionMs: 0,
      observations:
        kind === "failed"
          ? {
              ...observations,
              stallIntervals: [{ fromMs: 0, toMs: 250 }],
              technicalPauseMs: 250,
            }
          : observations,
      ...(kind === "failed" ? { faultReason: "playback_stalled" as const } : {}),
    };
    const response = await owner.context.request.post(
      `${publicOrigin}/api/v1/listening-plans/${view.plan.listeningPlanId}/playback`,
      { headers: jsonHeaders, data: command },
    );
    expect(response.status(), await response.text()).toBe(200);
    return (await response.json()) as {
      resourceVersion: number;
      mayStartNow: boolean;
      affectedItemIds: string[];
      phase: string;
    };
  };
  const intent = await event("start_intent", ready.resourceVersion, 1);
  expect(intent.mayStartNow).toBe(true);
  const started = await event("started", intent.resourceVersion, 2);
  const failed = await event("failed", started.resourceVersion, 3);
  expect(failed.affectedItemIds).toEqual(attempt.itemIds);
  expect(failed.phase).toBe("interrupted");
  expect(
    (
      await owner.pool.query(
        "SELECT state,fault_reason FROM app.playback_occurrences WHERE learner_scope_id=$1 AND occurrence_id=$2",
        [owner.scopeId, occurrence.occurrenceId],
      )
    ).rows[0],
  ).toEqual({ state: "failed", fault_reason: "playback_stalled" });
  const outcomeCounts = await owner.pool.query(
    "SELECT (SELECT count(*)::int FROM app.attempt_submissions WHERE attempt_id=$1) AS submissions,(SELECT count(*)::int FROM app.objective_outcomes WHERE attempt_id=$1) AS outcomes",
    [attempt.id],
  );
  expect(outcomeCounts.rows[0]).toEqual({ submissions: 0, outcomes: 0 });
});

test("P05-RECOVERY-001 authenticated visibility change narrows timing integrity while retaining elapsed time and scored units", async ({
  page,
  owner,
}) => {
  const attempt = await owner.createAttempt();
  await gotoAttempt(page, attempt.id);
  await page.waitForTimeout(1100);
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(
    page.getByText(
      "Timing continuity needs review. Your work is preserved and can continue as practice.",
    ),
  ).toBeVisible();
  await selectAnswerAndSync(page, attempt, 0);
  await selectAnswerAndSync(page, attempt, 1);
  await submit(page);
  await expect(page).toHaveURL(`/attempt/${attempt.id}/result`);
  const clock = (
    await owner.pool.query(
      "SELECT envelope FROM app.condition_facts WHERE learner_scope_id=$1 AND attempt_id=$2 AND fact_type='attempt_clock_observation_v1' ORDER BY learner_sequence DESC LIMIT 1",
      [owner.scopeId, attempt.id],
    )
  ).rows[0]?.envelope;
  expect(clock.visibilityChanges).toBeGreaterThan(0);
  expect(clock.monotonicElapsedMs).toBeGreaterThan(0);
  const outcome = (
    await owner.pool.query(
      "SELECT o.supported_scope,s.conditions FROM app.objective_outcomes o JOIN app.attempt_submissions s ON s.id=o.submission_id WHERE o.attempt_id=$1",
      [attempt.id],
    )
  ).rows[0];
  expect(outcome.supported_scope).toEqual(expect.arrayContaining(attempt.itemIds));
  expect(outcome.conditions.timerIntegrity).not.toBe("intact");
});
