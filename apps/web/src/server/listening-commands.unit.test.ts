import { randomUUID } from "node:crypto";
import { appId, type AuthorizedScope } from "@bestehen/domain";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const f = vi.hoisted(() => ({
  cookies: vi.fn(),
  dependencies: vi.fn(),
  preflight: vi.fn(),
  playback: vi.fn(),
  authenticate: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: f.cookies }));
vi.mock("./listening-command-runtime", () => ({ getListeningCommandDependencies: f.dependencies }));
import { POST as preflight } from "../app/api/v1/listening-plans/[id]/preflight-receipts/route";
import { POST as playback } from "../app/api/v1/listening-plans/[id]/playback/route";
import { handleListeningCommand } from "./listening-commands";
const planId = randomUUID();
const now = new Date("2026-09-05T12:00:00.000Z");
const scope: AuthorizedScope = {
  actorKind: "owner",
  learnerScopeId: appId(randomUUID()),
  principalId: appId(randomUUID()),
  authenticatedAt: now,
  capabilities: [],
};
const context = { contextId: "context/v1", environmentChangeCounter: 0 };
const preflightInput = {
  contractMajor: 1,
  operationId: randomUUID(),
  listeningPlanId: planId,
  expectedVersion: 0,
  policyVersions: { preflight: "preflight/v1", playback: "playback/v1", timer: "timer/v1" },
  context,
  candidates: [
    {
      occurrenceId: randomUUID(),
      assetId: randomUUID(),
      manifestRevision: "manifest/v1",
      manifestDigest: "a".repeat(64),
      mediaRevisionId: randomUUID(),
      observedDigest: "a".repeat(64),
      receivedBytes: 1000,
      loadResult: "decoded",
      retainedHandle: { kind: "memory_blob", handleId: "handle/v1" },
      observedAt: now.toISOString(),
    },
  ],
  outputProbe: {
    probeRevisionId: randomUUID(),
    playbackResult: "completed",
    completedAt: now.toISOString(),
    learnerConfirmedAt: now.toISOString(),
  },
  outboxProbe: {
    operationId: randomUUID(),
    writeResult: "committed_and_read_back",
    payloadDigest: "b".repeat(64),
    observedAt: now.toISOString(),
  },
};
const playbackInput = {
  contractMajor: 1,
  operationId: randomUUID(),
  listeningPlanId: planId,
  occurrenceId: randomUUID(),
  expectedVersion: 1,
  playOrdinal: 1,
  mediaRevisionId: randomUUID(),
  preflightReceiptId: randomUUID(),
  context,
  clientSequence: 1,
  event: "start_intent",
  localIntentId: randomUUID(),
  intentPersistedAt: now.toISOString(),
  intentDurability: "committed_and_read_back",
  occurredAt: now.toISOString(),
  positionMs: 0,
  observations: {
    visibilityChanges: 0,
    stallIntervals: [],
    outputOrDeviceChange: false,
    learnerPauseMs: 0,
    technicalPauseMs: 0,
    speedActual: 1,
  },
};
const routes = [
  { name: "preflight-receipts", run: preflight, input: preflightInput, command: f.preflight },
  { name: "playback", run: playback, input: playbackInput, command: f.playback },
];
const headers = {
  "content-type": "application/json",
  origin: "https://app.example.test",
  "sec-fetch-site": "same-origin",
  "x-bestehen-csrf": "1",
};
const dependencies = () => ({
  authenticate: f.authenticate,
  now: () => now,
  runtime: {
    preflight: f.preflight,
    playback: f.playback,
    readPlan: vi.fn(),
    audio: vi.fn(),
    transcript: vi.fn(),
  },
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("BESTEHEN_APP_ENV", "test");
  vi.stubEnv("BESTEHEN_RELEASE_COMMIT", "test");
  vi.stubEnv("DATABASE_URL", "postgresql://synthetic:synthetic@127.0.0.1:5432/synthetic");
  vi.stubEnv("BESTEHEN_APPLICATION_BASE_URL", "https://app.example.test");
  f.cookies.mockResolvedValue({ get: () => ({ value: "test-session" }) });
  f.authenticate.mockResolvedValue(scope);
  f.dependencies.mockImplementation(dependencies);
  f.preflight.mockResolvedValue({ outcome: "ready" });
  f.playback.mockResolvedValue({ event: "start_intent" });
});
afterEach(() => vi.unstubAllEnvs());
describe("Listening route transport", () => {
  it.each(routes)(
    "P05-SECURITY-001 checks $name before cookie, JSON and dependency access",
    async (route) => {
      for (const change of [
        { method: "GET" },
        { headers: { "content-type": "text/plain" } },
        { headers: { origin: "" } },
        { headers: { origin: "https://cross.example.test" } },
        { headers: { "sec-fetch-site": "cross-site" } },
        { headers: { "x-bestehen-csrf": "" } },
      ]) {
        vi.clearAllMocks();
        const json = vi.fn();
        const request = {
          method: change.method ?? "POST",
          url: `http://internal:3000/api/v1/listening-plans/${planId}/${route.name}`,
          headers: new Headers({ ...headers, ...change.headers }),
          json,
        } as unknown as Request;
        expect((await route.run(request, { params: Promise.resolve({ id: planId }) })).status).toBe(
          404,
        );
        expect(json).not.toHaveBeenCalled();
        expect(f.cookies).not.toHaveBeenCalled();
        expect(f.dependencies).not.toHaveBeenCalled();
        expect(f.authenticate).not.toHaveBeenCalled();
        expect(route.command).not.toHaveBeenCalled();
      }
    },
  );
  it.each(routes)(
    "P05-SECURITY-001 accepts an authenticated same-origin $name request through the real handler",
    async (route) => {
      const response = await route.run(
        new Request(`http://internal:3000/api/v1/listening-plans/${planId}/${route.name}`, {
          method: "POST",
          headers,
          body: JSON.stringify(route.input),
        }),
        { params: Promise.resolve({ id: planId }) },
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(f.authenticate).toHaveBeenCalledWith("test-session");
      expect(route.command).toHaveBeenCalledWith(scope, route.input);
    },
  );
  it("P05-SECURITY-001 refuses unauthorized or malformed claims without touching runtime", async () => {
    f.authenticate.mockResolvedValue(undefined);
    expect(
      (await handleListeningCommand(dependencies(), undefined, "preflight", planId, preflightInput))
        .status,
    ).toBe(404);
    expect(f.preflight).not.toHaveBeenCalled();
    f.authenticate.mockResolvedValue(scope);
    expect(
      (
        await handleListeningCommand(dependencies(), "test", "playback", planId, {
          ...playbackInput,
          localIntentId: undefined,
        })
      ).status,
    ).toBe(400);
    expect(f.playback).not.toHaveBeenCalled();
  });
});
