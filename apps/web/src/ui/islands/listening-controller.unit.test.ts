import { canonicalDigest } from "@bestehen/content";
import type { MediaPreflightObservation, PlaybackOccurrenceCommand } from "@bestehen/contracts";
import { describe, expect, it, vi } from "vitest";
import {
  ListeningController,
  listeningDigest,
  listeningMutationHeaders,
  type ListeningAudio,
  type LocalListening,
} from "./listening-controller";
import {
  technicalListeningWav,
  technicalListeningPlan,
  technicalPlaybackReceipt,
  technicalPreflightReceipt,
  listeningTestAttemptId,
} from "./listening.test-fixture";

async function setup(ordinary = false) {
  const bytes = technicalListeningWav();
  let view = technicalListeningPlan(await listeningDigest(bytes), bytes.byteLength);
  if (ordinary)
    view = {
      ...view,
      plan: {
        ...view.plan,
        progressionProfile: "P0",
        practiceKind: "ordinary",
        occurrences: view.plan.occurrences.map((o) => ({
          ...o,
          pauseAllowed: true,
          seekingAllowed: true,
          transcriptPhase: "after_attempt",
        })),
      },
    };
  let stored: LocalListening | undefined;
  let now = new Date();
  const order: string[] = [];
  const replies = new Map<string, unknown>();
  const store = {
    read: vi.fn(async () => structuredClone(stored)),
    write: vi.fn(async (record: LocalListening, previous: number) => {
      if ((stored?.revision ?? 0) !== previous) throw new Error("conflict");
      stored = structuredClone(record);
      order.push(
        record.nativeIntents.length
          ? "durable-native"
          : record.pending.length
            ? "durable-command"
            : "durable",
      );
    }),
  };
  const audio: ListeningAudio = {
    supports: () => true,
    decode: vi.fn(async () => {
      order.push("decode");
    }),
    retain: vi.fn(() => "blob:exact"),
    probe: vi.fn(async () => {
      order.push("probe");
    }),
    play: vi.fn(async () => {
      order.push("native-play");
    }),
    pause: vi.fn(),
    dispose: vi.fn(),
  };
  const transport = vi.fn<typeof fetch>(async (url, options) => {
    if (String(url).includes("/media/")) return new Response(bytes);
    if (!options?.body) return Response.json(view);
    const command = JSON.parse(String(options.body)) as
      | MediaPreflightObservation
      | PlaybackOccurrenceCommand;
    if (replies.has(command.operationId)) return Response.json(replies.get(command.operationId));
    order.push("event" in command ? `server-${command.event}` : "server-preflight");
    const receipt =
      "event" in command
        ? technicalPlaybackReceipt(command, view)
        : technicalPreflightReceipt(command, view, canonicalDigest(command));
    replies.set(command.operationId, receipt);
    view = {
      ...view,
      resourceVersion: receipt.resourceVersion,
      ...("event" in receipt
        ? { phase: receipt.phase, playback: [...view.playback, receipt] }
        : { latestPreflight: receipt }),
    };
    return Response.json(receipt);
  });
  const create = () =>
    new ListeningController(
      "test",
      listeningTestAttemptId,
      store,
      audio,
      transport,
      () => undefined,
      () => now,
    );
  const controller = create();
  await controller.restore();
  return {
    controller,
    create,
    store,
    audio,
    transport,
    order,
    bytes,
    stored: () => stored,
    view: () => view,
    setView: (next: typeof view) => {
      view = next;
    },
    advance: (ms: number) => {
      now = new Date(now.getTime() + ms);
    },
  };
}

describe("Listening island controller", () => {
  it("P05-PREFLIGHT-001 verifies full bytes, actual decode, output confirmation and durable read-back before exact same-origin preflight", async () => {
    const f = await setup();
    await f.controller.prepare();
    expect(f.controller.status).toBe("confirm");
    expect(f.order).not.toContain("server-preflight");
    expect(f.audio.decode).toHaveBeenCalledWith(f.bytes);
    await f.controller.confirmOutput();
    expect(f.controller.status).toBe("ready");
    const mutation = f.transport.mock.calls.find(([, options]) => options?.body);
    expect(mutation?.[1]).toMatchObject({
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: listeningMutationHeaders,
    });
    expect(f.order.indexOf("durable-command")).toBeLessThan(f.order.indexOf("server-preflight"));
    const command = JSON.parse(String(mutation?.[1]?.body));
    expect(command.candidates[0]).toMatchObject({
      receivedBytes: f.bytes.byteLength,
      loadResult: "decoded",
      retainedHandle: { kind: "bounded_cache" },
    });
    expect(JSON.stringify(f.stored())).not.toMatch(/objectKey|"text"|secret/i);
  });
  it.each(["length", "digest", "decode", "output", "durability"] as const)(
    "P05-PREFLIGHT-001 refuses readiness after %s failure",
    async (failure) => {
      const f = await setup();
      if (failure === "length" || failure === "digest") {
        const original = f.transport.getMockImplementation();
        f.transport.mockImplementation(async (url, options) =>
          String(url).includes("/media/")
            ? new Response(new ArrayBuffer(failure === "length" ? 2 : f.bytes.byteLength))
            : (original as typeof fetch)(url, options),
        );
      }
      if (failure === "decode") vi.mocked(f.audio.decode).mockRejectedValue(new Error("Decode"));
      if (failure === "output") vi.mocked(f.audio.probe).mockRejectedValue(new Error("Output"));
      if (failure === "durability") f.store.write.mockRejectedValue(new Error("Disk"));
      await f.controller.prepare();
      await f.controller.confirmOutput();
      expect(f.controller.status).toBe("unavailable");
      expect(f.order).not.toContain("server-preflight");
      expect(f.audio.play).not.toHaveBeenCalled();
    },
  );
  it("P05-PLAYBACK-001 durably binds start intent before native play and consumes ordinals only through server facts", async () => {
    const f = await setup();
    await f.controller.prepare();
    await f.controller.confirmOutput();
    await Promise.all([f.controller.begin(), f.controller.begin()]);
    expect(f.audio.play).toHaveBeenCalledTimes(1);
    expect(f.order.indexOf("durable-command")).toBeLessThan(f.order.indexOf("server-start_intent"));
    expect(f.order.indexOf("server-start_intent")).toBeLessThan(f.order.indexOf("durable-native"));
    expect(f.order.indexOf("durable-native")).toBeLessThan(f.order.indexOf("native-play"));
    expect(f.controller.remainingPlays).toBe(0);
    expect(f.controller.startedAt).toBeUndefined();
    await f.controller.native("started", 0);
    expect(f.controller.startedAt).toBeDefined();
    f.controller.pause();
    expect(f.controller.status).toBe("playing");
    await f.controller.native("completed", 1000);
    expect(f.controller.complete).toBe(true);
    expect(f.stored()?.media).toEqual([]);
    expect(f.audio.dispose).toHaveBeenCalled();
    await f.controller.begin();
    expect(f.audio.play).toHaveBeenCalledTimes(1);
  });
  it.each(["recovery-only", "expired"] as const)(
    "P05-RECOVERY-001 refuses native play for %s authorization",
    async (kind) => {
      const f = await setup();
      await f.controller.prepare();
      await f.controller.confirmOutput();
      if (kind === "expired") f.advance(61_000);
      else {
        const original = f.transport.getMockImplementation();
        f.transport.mockImplementation(async (...args) => {
          const response = await (original as typeof fetch)(...args);
          const body = await response.json();
          return Response.json(
            body.event === "start_intent" ? { ...body, mayStartNow: false } : body,
          );
        });
      }
      await f.controller.begin();
      expect(f.audio.play).not.toHaveBeenCalled();
      expect(f.controller.status).toBe("unavailable");
    },
  );
  it("P05-RECOVERY-001 replays offline operations byte-for-byte after reload without refetching bytes or replaying native audio", async () => {
    const f = await setup();
    await f.controller.prepare();
    await f.controller.confirmOutput();
    const original = f.transport.getMockImplementation();
    f.transport.mockRejectedValue(new TypeError("Offline"));
    await f.controller.begin();
    const pending = structuredClone(f.stored()?.pending[0]);
    expect(f.audio.play).not.toHaveBeenCalled();
    f.controller.dispose();
    f.transport.mockImplementation(original as typeof fetch);
    const recovered = f.create();
    await recovered.restore();
    const replay = f.transport.mock.calls
      .filter(([, options]) => options?.body)
      .map(([, options]) => JSON.parse(String(options?.body)));
    expect(replay.filter((c) => c.operationId === pending?.operationId)).toEqual([
      pending,
      pending,
    ]);
    expect(f.audio.play).not.toHaveBeenCalled();
    expect(f.transport.mock.calls.filter(([url]) => String(url).includes("/media/"))).toHaveLength(
      1,
    );
    expect(recovered.status).toBe("unavailable");
    expect(f.stored()?.pending).toEqual([]);
  });
  it("P05-RECOVERY-001 preserves uncertain native facts and marks a neutral fault on reload", async () => {
    const f = await setup();
    await f.controller.prepare();
    await f.controller.confirmOutput();
    await f.controller.begin();
    await f.controller.native("started", 0);
    f.controller.dispose();
    const recovered = f.create();
    await recovered.restore();
    expect(f.audio.play).toHaveBeenCalledTimes(1);
    expect(recovered.status).toBe("unavailable");
    expect(f.stored()?.facts.at(-1)?.command).toMatchObject({
      event: "failed",
      faultReason: "playback_uncertain",
      clientSequence: 3,
    });
  });
  it("P05-PLAYBACK-001 records ordinary pauses separately from native stalls and output changes", async () => {
    const g = await setup(true);
    await g.controller.prepare();
    await g.controller.confirmOutput();
    await g.controller.begin();
    await g.controller.native("started", 0);
    g.controller.pause();
    g.advance(100);
    await g.controller.resume();
    expect(g.controller.status).toBe("playing");
    await g.controller.stalled(100);
    expect(g.stored()?.facts.at(-1)?.command).toMatchObject({
      event: "failed",
      faultReason: "playback_stalled",
      observations: {
        learnerPauseMs: 100,
        technicalPauseMs: 0,
        stallIntervals: [{ fromMs: 100, toMs: 100 }],
      },
    });
  });
});
