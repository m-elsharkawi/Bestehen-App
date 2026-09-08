import { createHash } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { canonicalDigest } from "@bestehen/content";
import { expect, test, type Page } from "@playwright/test";
import {
  technicalListeningWav,
  technicalListeningPlan,
  technicalPlaybackReceipt,
  technicalPreflightReceipt,
} from "../src/ui/islands/listening.test-fixture";
import type { MediaPreflightObservation, PlaybackOccurrenceCommand } from "@bestehen/contracts";

/** Intercepted technical APIs exercise the real island, not authentication or content approval. */
async function technicalApi(page: Page, failure?: "digest" | "decode", durationMs = 1000) {
  const bytes = failure === "decode" ? new ArrayBuffer(100) : technicalListeningWav(durationMs);
  let view = technicalListeningPlan(
    createHash("sha256").update(new Uint8Array(bytes)).digest("hex"),
    bytes.byteLength,
    durationMs,
  );
  const commands: (MediaPreflightObservation | PlaybackOccurrenceCommand)[] = [];
  const receipts = new Map<string, { command: string; receipt: unknown }>();
  const paths: string[] = [];
  const thirdParty: string[] = [];
  let offline = false;
  page.on("request", (request) => {
    if (
      request.url().startsWith("http") &&
      new URL(request.url()).origin !== "https://app.bestehen.test:3300"
    )
      thirdParty.push(request.url());
  });
  await page.addInitScript(() => {
    const metrics = { digests: 0, decodes: 0, plays: 0, durableBeforeNative: false };
    Object.assign(window, { listeningTest: metrics });
    const digest = crypto.subtle.digest.bind(crypto.subtle);
    crypto.subtle.digest = (...args) => {
      metrics.digests++;
      return digest(...args);
    };
    const decode = AudioContext.prototype.decodeAudioData;
    AudioContext.prototype.decodeAudioData = function (...args) {
      metrics.decodes++;
      return decode.apply(this, args);
    };
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = async function () {
      if (this.src.startsWith("blob:")) {
        metrics.plays++;
        metrics.durableBeforeNative = await new Promise<boolean>((resolve) => {
          const open = indexedDB.open("bestehen-listening-v1", 1);
          open.onsuccess = () => {
            const db = open.result;
            const tx = db.transaction("blocks", "readonly");
            const request = tx.objectStore("blocks").getAll();
            tx.oncomplete = () => {
              resolve(
                request.result.some(
                  (r: {
                    nativeIntents: string[];
                    facts: {
                      command: { localIntentId?: string; event?: string };
                      receipt: { mayStartNow?: boolean };
                    }[];
                  }) =>
                    r.nativeIntents.some((id) =>
                      r.facts.some(
                        (f) =>
                          f.command.localIntentId === id &&
                          f.command.event === "start_intent" &&
                          f.receipt.mayStartNow,
                      ),
                    ),
                ),
              );
              db.close();
            };
          };
          open.onerror = () => resolve(false);
        });
      }
      return play.call(this);
    };
  });
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    // Chromium route.fulfill can bypass browser offline emulation; both boundaries must deny.
    if (offline) {
      await route.abort("internetdisconnected");
      return;
    }
    paths.push(path);
    if (path.endsWith("/listening-plan")) {
      await route.fulfill({ json: view });
      return;
    }
    if (path.includes("/media/")) {
      await route.fulfill({
        contentType: "audio/wav",
        body: Buffer.from(failure === "digest" ? new ArrayBuffer(bytes.byteLength) : bytes),
      });
      return;
    }
    if (path.includes("/transcripts/")) {
      if (view.phase !== "block_complete") {
        await route.fulfill({ status: 404 });
        return;
      }
      const text = "Technischer Testtranskripttext, kein freigegebener Lerninhalt.";
      await route.fulfill({
        json: {
          transcriptRevisionId: "33333333-3333-4333-8333-333333333333",
          mediaRevisionId: view.plan.occurrences[0]?.candidates[0]?.mediaRevisionId,
          kind: "target_transcript",
          language: "de",
          digest: createHash("sha256").update(text).digest("hex"),
          authorizedPhase: "after_attempt",
          text,
        },
      });
      return;
    }
    expect(request.headers()["content-type"]).toBe("application/json");
    expect(request.headers()["x-bestehen-csrf"]).toBe("1");
    expect(request.headers().origin).toBe("https://app.bestehen.test:3300");
    const command = request.postDataJSON() as MediaPreflightObservation | PlaybackOccurrenceCommand;
    commands.push(command);
    const existing = receipts.get(command.operationId);
    if (existing) {
      expect(JSON.stringify(command)).toBe(existing.command);
      await route.fulfill({ json: existing.receipt });
      return;
    }
    expect(command.expectedVersion).toBe(view.resourceVersion);
    const receipt =
      "event" in command
        ? technicalPlaybackReceipt(command, view)
        : technicalPreflightReceipt(command, view, canonicalDigest(command));
    receipts.set(command.operationId, { command: JSON.stringify(command), receipt });
    view = {
      ...view,
      resourceVersion: receipt.resourceVersion,
      ...("event" in receipt
        ? { phase: receipt.phase, playback: [...view.playback, receipt] }
        : { latestPreflight: receipt }),
    };
    await route.fulfill({ json: receipt });
  });
  return {
    paths,
    thirdParty,
    commands,
    view: () => view,
    setOffline: (value: boolean) => {
      offline = value;
    },
  };
}
async function activate(page: Page, name: string, keyboard: boolean) {
  const button = page.getByRole("button", { name, exact: true });
  if (keyboard) await button.press("Enter");
  else await button.click();
}
async function ready(page: Page, keyboard = false) {
  await page.goto("/ui-fixtures/listening");
  await expect(
    page.getByText("Technical non-speech Listening test fixture.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeDisabled();
  await activate(page, "Check audio and output", keyboard);
  await activate(page, "I heard the output check", keyboard);
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeEnabled();
}

test("P05-LISTENING-001 P05-A11Y-001 keyboard-activated browser digest/decode, explicit output confirmation, durable Begin and result-only transcript", async ({
  page,
}) => {
  const api = await technicalApi(page);
  await ready(page, true);
  expect(
    (await new AxeBuilder({ page }).include(".listening-region").analyze()).violations,
  ).toEqual([]);
  expect(api.paths.some((p) => p.includes("/transcripts/"))).toBe(false);
  await page.getByRole("button", { name: "Play", exact: true }).press("Enter");
  await expect
    .poll(() => api.commands.some((c) => "event" in c && c.event === "started"))
    .toBe(true);
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeDisabled();
  await expect(page.getByText("The Listening block is complete.", { exact: false })).toBeVisible();
  const metrics = await page.evaluate(
    () =>
      (
        window as Window & {
          listeningTest: {
            digests: number;
            decodes: number;
            plays: number;
            durableBeforeNative: boolean;
          };
        }
      ).listeningTest,
  );
  expect(metrics.digests).toBeGreaterThan(0);
  expect(metrics.decodes).toBeGreaterThan(0);
  expect(metrics.plays).toBe(1);
  expect(metrics.durableBeforeNative).toBe(true);
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeDisabled();
  expect(
    (await new AxeBuilder({ page }).include(".listening-region").analyze()).violations,
  ).toEqual([]);
  expect(api.paths.some((p) => p.includes("/transcripts/"))).toBe(false);
  await page.goto("/ui-fixtures/listening-result");
  expect(api.paths.some((p) => p.includes("/transcripts/"))).toBe(false);
  await page.getByRole("button", { name: "Request authorized transcript" }).click();
  await expect(
    page.getByText("Technischer Testtranskripttext, kein freigegebener Lerninhalt."),
  ).toBeVisible();
  expect(api.thirdParty).toEqual([]);
});
test("P05-RECOVERY-001 reload preserves an uncertain native occurrence without another play or byte fetch", async ({
  page,
}) => {
  const api = await technicalApi(page, undefined, 4000);
  await ready(page);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect
    .poll(() => api.commands.some((c) => "event" in c && c.event === "started"))
    .toBe(true);
  await page.reload();
  await expect(page.getByText("This was a system problem, not a result about you.")).toBeVisible();
  expect(api.commands.filter((c) => "event" in c && c.event === "start_intent")).toHaveLength(1);
  expect(api.paths.filter((p) => p.includes("/media/"))).toHaveLength(1);
  expect(api.commands.at(-1)).toMatchObject({ event: "failed", faultReason: "playback_uncertain" });
  expect(api.thirdParty).toEqual([]);
});
test("P05-RECOVERY-001 offline intent retries original facts without a native play", async ({
  page,
  context,
}) => {
  const api = await technicalApi(page);
  await ready(page);
  api.setOffline(true);
  await context.setOffline(true);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.getByRole("button", { name: "Retry saved Listening facts" })).toBeVisible();
  api.setOffline(false);
  await context.setOffline(false);
  await expect(page.getByText("This was a system problem, not a result about you.")).toBeVisible();
  const metrics = await page.evaluate(
    () => (window as Window & { listeningTest: { plays: number } }).listeningTest,
  );
  expect(metrics.plays).toBe(0);
  expect(api.commands.filter((c) => "event" in c && c.event === "start_intent")).toHaveLength(1);
  expect(api.paths.filter((p) => p.includes("/media/"))).toHaveLength(1);
  expect(api.thirdParty).toEqual([]);
});
for (const failure of ["digest", "decode"] as const)
  test(`P05-PREFLIGHT-001 actual browser ${failure} refusal never begins`, async ({ page }) => {
    const api = await technicalApi(page, failure);
    await page.goto("/ui-fixtures/listening");
    await page.getByRole("button", { name: "Check audio and output" }).click();
    await expect(
      page.getByText("This was a system problem, not a result about you."),
    ).toBeVisible();
    expect(api.commands).toEqual([]);
    await expect(page.getByRole("button", { name: "Play", exact: true })).toBeDisabled();
    expect(api.paths.some((p) => p.includes("/transcripts/"))).toBe(false);
    expect(api.thirdParty).toEqual([]);
  });
