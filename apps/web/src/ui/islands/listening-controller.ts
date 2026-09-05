import type { MediaPreflightObservation, PlaybackOccurrenceCommand } from "@bestehen/contracts";
import {
  parseBoundPlaybackReceipt,
  parseBoundPreflightReceipt,
  parseListeningPlanView,
  type ClientListeningCandidate,
  type ClientListeningContext,
  type ClientListeningPlanView,
  type ClientMediaPreflightReceipt,
  type ClientPlaybackReceipt,
} from "./listening-client-parsers";

type Candidate = ClientListeningCandidate;
type Command = MediaPreflightObservation | PlaybackOccurrenceCommand;
type Receipt = ClientMediaPreflightReceipt | ClientPlaybackReceipt;
export interface RetainedListeningMedia {
  occurrenceId: string;
  candidate: Candidate;
  bytes: ArrayBuffer;
  handleId: string;
  observedAt: string;
}
export interface LocalListening {
  key: string;
  revision: number;
  view: ClientListeningPlanView;
  context: ClientListeningContext;
  media: RetainedListeningMedia[];
  pending: Command[];
  facts: { command: Command; receipt: Receipt }[];
  nativeIntents: string[];
  probeAt: string | null;
  fault: boolean;
}
export interface ListeningStore {
  read(key: string): Promise<LocalListening | undefined>;
  /** Compare-and-write prevents another tab from replacing a newer journal. */
  write(record: LocalListening, previousRevision: number): Promise<void>;
}
export interface ListeningAudio {
  supports(mime: string): boolean;
  decode(bytes: ArrayBuffer): Promise<void>;
  retain(mediaId: string, bytes: ArrayBuffer, mime: string): string;
  probe(): Promise<void>;
  play(url: string, speed: number): Promise<void>;
  pause(): void;
  dispose(): void;
}
export const listeningMutationHeaders = {
  "content-type": "application/json",
  "x-bestehen-csrf": "1",
};
export async function listeningDigest(bytes: ArrayBuffer | string): Promise<string> {
  const value = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", value))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
function canonical(value: unknown): string {
  if (!value || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
    .join(",")}}`;
}
const same = (a: unknown, b: unknown) => canonical(a) === canonical(b);
function fail(): never {
  throw new Error("Listening system fault");
}
const isPlayback = (command: Command): command is PlaybackOccurrenceCommand => "event" in command;

/** Bounded media and immutable local operations only. Responses use their existing separate store. */
export class ListeningController {
  record: LocalListening | undefined;
  status: "preflight" | "confirm" | "ready" | "playing" | "paused" | "retry" | "unavailable" =
    "preflight";
  startedAt: string | undefined;
  private urls = new Map<string, string>();
  private writes: Promise<unknown> = Promise.resolve();
  private sending: Promise<void> | undefined;
  private disposed = false;
  private preparing = false;
  private active: PlaybackOccurrenceCommand | undefined;
  private started = false;
  private pauseAt: number | undefined;
  private observations: PlaybackOccurrenceCommand["observations"] = {
    visibilityChanges: 0,
    stallIntervals: [],
    outputOrDeviceChange: false,
    learnerPauseMs: 0,
    technicalPauseMs: 0,
    speedActual: 1,
  };
  constructor(
    private readonly key: string,
    private readonly attemptId: string,
    private readonly store: ListeningStore,
    private readonly audio: ListeningAudio,
    private readonly transport: typeof fetch,
    private readonly changed: () => void,
    private readonly now = () => new Date(),
  ) {}
  private get state() {
    return this.record ?? fail();
  }
  private async save(edit: (record: LocalListening) => void) {
    const writing = this.writes.then(async () => {
      if (this.disposed) return fail();
      const previous = this.state;
      const next = structuredClone(previous);
      edit(next);
      next.revision++;
      await this.store.write(next, previous.revision);
      const proof = await this.store.read(this.key);
      if (!proof || !same({ ...proof, media: [] }, { ...next, media: [] })) fail();
      for (const media of next.media) {
        const saved = proof?.media.find((m) => m.handleId === media.handleId);
        if (
          !saved ||
          saved.bytes.byteLength !== media.candidate.bytes ||
          (await listeningDigest(saved.bytes)) !== media.candidate.digest
        )
          fail();
      }
      this.record = next;
      this.changed();
    });
    this.writes = writing.catch(() => undefined);
    return writing;
  }
  private async json(url: string, command?: Command) {
    const response = await this.transport(url, {
      credentials: "same-origin",
      cache: "no-store",
      ...(command
        ? { method: "POST", headers: listeningMutationHeaders, body: JSON.stringify(command) }
        : {}),
    });
    if (!response.ok) throw new Error(response.status === 409 ? "conflict" : "unavailable");
    return response.json();
  }
  private planUrl(suffix: string) {
    return `/api/v1/listening-plans/${this.state.view.plan.listeningPlanId}/${suffix}`;
  }
  private admissible() {
    const { plan } = this.state.view;
    return (
      !this.state.fault &&
      plan.revocationState === "active" &&
      Date.parse(plan.expiresAt) > this.now().getTime()
    );
  }
  private hasBegun() {
    return (
      this.state.nativeIntents.length > 0 ||
      this.state.facts.some((f) => isPlayback(f.command)) ||
      this.state.pending.some(isPlayback) ||
      this.state.view.playback.length > 0
    );
  }
  get complete() {
    return this.record?.view.phase === "block_complete";
  }
  get responseReady() {
    return Boolean(
      this.complete &&
        this.record &&
        !this.active &&
        !this.preparing &&
        !this.state.pending.some(isPlayback) &&
        !["retry", "playing", "paused"].includes(this.status),
    );
  }
  get current(): RetainedListeningMedia | undefined {
    if (!this.record) return undefined;
    if (this.active)
      return this.record.media.find((m) => m.occurrenceId === this.active?.occurrenceId);
    return this.record.media.find((media) => {
      const occurrence = this.record?.view.plan.occurrences.find(
        (o) => o.occurrenceId === media.occurrenceId,
      );
      const finished = this.record?.view.playback.filter(
        (f) => f.occurrenceId === media.occurrenceId && f.event === "completed",
      ).length;
      const terminalFault = this.record?.view.playback.some(
        (f) => f.occurrenceId === media.occurrenceId && f.event === "failed",
      );
      return occurrence && !terminalFault && (finished ?? 0) < occurrence.allowedPlayCount;
    });
  }
  get occurrence() {
    return this.record?.view.plan.occurrences.find(
      (o) => o.occurrenceId === this.current?.occurrenceId,
    );
  }
  get url() {
    return this.current ? (this.urls.get(this.current.candidate.mediaRevisionId) ?? "") : "";
  }
  get remainingPlays() {
    const occurrence = this.occurrence;
    if (!occurrence || !this.record) return 0;
    const consumed = this.record.view.playback.filter(
      (f) => f.occurrenceId === occurrence.occurrenceId && f.event === "start_intent",
    ).length;
    return Math.max(0, occurrence.allowedPlayCount - consumed);
  }
  async restore() {
    try {
      const saved = await this.store.read(this.key);
      this.record = saved;
      let view = parseListeningPlanView(
        await this.json(`/api/v1/attempts/${this.attemptId}/listening-plan`),
      );
      if (view.plan.attemptId !== this.attemptId) fail();
      if (saved) {
        if (!same({ ...saved.view.plan, revocationState: view.plan.revocationState }, view.plan))
          fail();
        const hadPending = saved.pending.length > 0;
        await this.drain();
        if (this.state.pending.length) return;
        if (hadPending)
          view = parseListeningPlanView(
            await this.json(`/api/v1/attempts/${this.attemptId}/listening-plan`),
          );
        if (this.state.view.resourceVersion !== view.resourceVersion) fail();
        await this.save((r) => {
          r.view = view;
        });
        this.startedAt = this.state.facts.flatMap((f) =>
          isPlayback(f.command) && f.command.event === "started" ? [f.command.occurredAt] : [],
        )[0];
        if (this.hasBegun()) {
          // Reload cannot establish whether a reserved native play ran. Never start it again.
          const open = this.state.facts
            .map((f) => f.command)
            .filter(isPlayback)
            .find(
              (c) =>
                c.event === "start_intent" &&
                !this.state.facts.some(
                  (f) =>
                    isPlayback(f.command) &&
                    f.command.localIntentId === c.localIntentId &&
                    ["completed", "failed"].includes(f.command.event),
                ),
            );
          if (open) {
            this.active = open;
            await this.native("failed", 0, "playback_uncertain");
          }
          if (!this.complete) await this.markFault();
          await this.clearMedia();
          this.changed();
          return;
        }
        if (!this.admissible()) fail();
        if (
          this.state.view.latestPreflight &&
          this.state.media.length !== view.plan.occurrences.length
        )
          fail();
        for (const media of this.state.media) {
          const occurrence = view.plan.occurrences.find(
            (o) => o.occurrenceId === media.occurrenceId,
          );
          if (!occurrence?.candidates.some((c) => same(c, media.candidate))) fail();
        }
        for (const media of this.state.media) await this.verifyAndRetain(media);
        // A reloaded context must demonstrate output again before a new preflight.
        this.status = "preflight";
      } else {
        if (view.playback.length || view.phase !== "ready" || view.latestPreflight) fail();
        this.record = {
          key: this.key,
          revision: 0,
          view,
          context: { contextId: crypto.randomUUID(), environmentChangeCounter: 0 },
          media: [],
          pending: [],
          facts: [],
          nativeIntents: [],
          probeAt: null,
          fault: false,
        };
        await this.save(() => undefined);
      }
      this.changed();
    } catch (error) {
      if (error instanceof TypeError && this.record) {
        this.status = "retry";
        this.changed();
      } else await this.markFault();
    }
  }
  private async verifyAndRetain(media: RetainedListeningMedia) {
    if (
      media.bytes.byteLength !== media.candidate.bytes ||
      (await listeningDigest(media.bytes)) !== media.candidate.digest
    )
      fail();
    await this.audio.decode(media.bytes.slice(0));
    this.urls.set(
      media.candidate.mediaRevisionId,
      this.audio.retain(media.candidate.mediaRevisionId, media.bytes, media.candidate.mime),
    );
  }
  async prepare() {
    if (this.preparing) return;
    this.preparing = true;
    try {
      if (!this.admissible() || this.hasBegun()) fail();
      this.status = "preflight";
      this.changed();
      const media: RetainedListeningMedia[] = [];
      for (const occurrence of this.state.view.plan.occurrences) {
        let verified: RetainedListeningMedia | undefined;
        for (const candidate of occurrence.candidates) {
          if (!this.audio.supports(candidate.mime)) continue;
          try {
            const retained = this.state.media.find(
              (media) =>
                media.occurrenceId === occurrence.occurrenceId && same(media.candidate, candidate),
            );
            const response = retained
              ? undefined
              : await this.transport(this.planUrl(`media/${candidate.mediaRevisionId}`), {
                  credentials: "same-origin",
                  cache: "no-store",
                });
            if (response && !response.ok) throw new Error("Candidate unavailable");
            const entry: RetainedListeningMedia = retained ?? {
              occurrenceId: occurrence.occurrenceId,
              candidate,
              bytes: await (response as Response).arrayBuffer(),
              handleId: crypto.randomUUID(),
              observedAt: this.now().toISOString(),
            };
            await this.verifyAndRetain(entry);
            verified = entry;
            break;
          } catch {
            // Another exact, approved encoding may still establish readiness for this occurrence.
          }
        }
        if (!verified) fail();
        media.push(verified);
      }
      await this.save((r) => {
        r.media = media;
        r.probeAt = null;
      });
      await this.audio.probe();
      await this.save((r) => {
        r.probeAt = this.now().toISOString();
      });
      this.status = "confirm";
      this.changed();
    } catch {
      await this.markFault();
    } finally {
      this.preparing = false;
    }
  }
  async confirmOutput() {
    if (this.status !== "confirm") return;
    try {
      if (this.status !== "confirm" || !this.state.probeAt || !this.admissible()) fail();
      this.status = "preflight";
      this.changed();
      const at = this.now().toISOString();
      const plan = this.state.view.plan;
      const operationId = crypto.randomUUID();
      const probeId = crypto.randomUUID();
      const command: MediaPreflightObservation = {
        contractMajor: 1,
        operationId,
        listeningPlanId: plan.listeningPlanId,
        expectedVersion: this.state.view.resourceVersion,
        policyVersions: {
          preflight: plan.preflightPolicyRef,
          playback: plan.playbackPolicyRef,
          timer: plan.timerPolicyRef,
        },
        context: this.state.context,
        candidates: this.state.media.map((m) => ({
          occurrenceId: m.occurrenceId,
          assetId: m.candidate.assetId,
          manifestRevision: m.candidate.manifestRevision,
          manifestDigest: m.candidate.manifestDigest,
          mediaRevisionId: m.candidate.mediaRevisionId,
          observedDigest: m.candidate.digest,
          receivedBytes: m.bytes.byteLength,
          loadResult: "decoded",
          retainedHandle: { kind: "bounded_cache", handleId: m.handleId },
          observedAt: m.observedAt,
        })),
        outputProbe: {
          probeRevisionId: this.state.view.outputProbeRevisionId,
          playbackResult: "completed",
          completedAt: this.state.probeAt,
          learnerConfirmedAt: at,
        },
        outboxProbe: {
          operationId: probeId,
          writeResult: "committed_and_read_back",
          observedAt: at,
          payloadDigest: await listeningDigest(
            JSON.stringify([
              "listening-outbox/v1",
              plan.listeningPlanId,
              this.state.context.contextId,
              this.state.context.environmentChangeCounter,
              probeId,
            ]),
          ),
        },
      };
      await this.save((r) => {
        r.pending.push(command);
      });
      await this.drain();
      if (!this.state.pending.length && this.state.view.latestPreflight?.outcome === "ready")
        this.status = "ready";
      else if (!this.state.pending.length) await this.markFault();
      this.changed();
    } catch {
      await this.markFault();
    }
  }
  private async drain() {
    if (this.sending) return this.sending;
    const sending = (async () => {
      while (this.state.pending.length) {
        const command = this.state.pending[0] as Command;
        let raw: unknown;
        try {
          raw = await this.json(
            this.planUrl(isPlayback(command) ? "playback" : "preflight-receipts"),
            command,
          );
        } catch (error) {
          if (error instanceof TypeError) {
            this.status = "retry";
            this.changed();
            return;
          }
          throw error;
        }
        const receipt = isPlayback(command)
          ? parseBoundPlaybackReceipt(raw, command)
          : await parseBoundPreflightReceipt(raw, command, listeningDigest, canonical(command));
        await this.save((r) => {
          r.pending.shift();
          r.facts.push({ command, receipt });
          r.view = { ...r.view, resourceVersion: receipt.resourceVersion };
          if (isPlayback(command)) {
            const played = receipt as ClientPlaybackReceipt;
            r.view = { ...r.view, phase: played.phase, playback: [...r.view.playback, played] };
            if (command.event === "started") this.startedAt ??= command.occurredAt;
          } else r.view = { ...r.view, latestPreflight: receipt as ClientMediaPreflightReceipt };
        });
      }
    })();
    this.sending = sending;
    try {
      await sending;
    } finally {
      this.sending = undefined;
    }
  }
  async begin() {
    try {
      if (this.active || this.status !== "ready" || this.state.pending.length) return;
      if (!this.admissible()) fail();
      const preflight = this.state.view.latestPreflight;
      const media = this.current;
      const occurrence = this.occurrence;
      if (
        preflight?.outcome !== "ready" ||
        !media ||
        !occurrence ||
        this.remainingPlays === 0 ||
        Date.parse(preflight.expiresAt) <= this.now().getTime() ||
        !same(preflight.context, this.state.context)
      )
        fail();
      const at = this.now().toISOString();
      this.observations = {
        visibilityChanges: 0,
        stallIntervals: [],
        outputOrDeviceChange: false,
        learnerPauseMs: 0,
        technicalPauseMs: 0,
        speedActual: occurrence.authoredSpeedRatio,
      };
      const command: PlaybackOccurrenceCommand = {
        contractMajor: 1,
        operationId: crypto.randomUUID(),
        listeningPlanId: this.state.view.plan.listeningPlanId,
        occurrenceId: occurrence.occurrenceId,
        expectedVersion: this.state.view.resourceVersion,
        playOrdinal: occurrence.allowedPlayCount - this.remainingPlays + 1,
        mediaRevisionId: media.candidate.mediaRevisionId,
        preflightReceiptId: preflight.receiptId,
        context: preflight.context,
        clientSequence: 1,
        event: "start_intent",
        localIntentId: crypto.randomUUID(),
        intentPersistedAt: at,
        intentDurability: "committed_and_read_back",
        occurredAt: at,
        positionMs: 0,
        observations: this.observations,
      };
      this.active = command;
      this.started = false;
      await this.save((r) => {
        r.pending.push(command);
      });
      await this.drain();
      if (this.state.pending.length) return;
      const receipt = this.state.facts.find((f) => f.command.operationId === command.operationId)
        ?.receipt as ClientPlaybackReceipt | undefined;
      if (
        !receipt?.mayStartNow ||
        Date.parse(receipt.authorizationExpiresAt) <= this.now().getTime() ||
        receipt.authorizationExpiresAt !== preflight.expiresAt ||
        !this.admissible()
      )
        fail();
      await this.save((r) => {
        r.nativeIntents.push(command.localIntentId);
      });
      if (Date.parse(receipt.authorizationExpiresAt) <= this.now().getTime()) fail();
      await this.audio.play(this.url, occurrence.authoredSpeedRatio);
    } catch {
      if (this.active) await this.native("failed", 0, "playback_uncertain");
      else await this.markFault();
    }
  }
  async native(
    event: "started" | "completed" | "failed",
    positionMs: number,
    reason?: PlaybackOccurrenceCommand["faultReason"],
  ) {
    if (!this.active || this.disposed) return;
    const active = this.active;
    if (event === "started" && this.started) return;
    if (event === "started") {
      this.started = true;
      this.status = "playing";
    }
    if (event !== "started") {
      this.active = undefined;
      this.audio.pause();
    }
    try {
      await this.save((r) => {
        const previous = [...r.facts.map((f) => f.command), ...r.pending]
          .filter(isPlayback)
          .filter((c) => c.localIntentId === active.localIntentId);
        const command: PlaybackOccurrenceCommand = {
          ...active,
          operationId: crypto.randomUUID(),
          event,
          expectedVersion: r.view.resourceVersion + r.pending.length,
          clientSequence: previous.length + 1,
          occurredAt: this.now().toISOString(),
          positionMs: Math.max(0, Math.round(positionMs)),
          observations: structuredClone(this.observations),
          ...(event === "failed" ? { faultReason: reason ?? "playback_uncertain" } : {}),
        };
        r.pending.push(command);
        if (event === "failed") r.fault = true;
      });
      await this.drain();
      if (event !== "started") {
        this.status = event === "failed" ? "unavailable" : "ready";
        if (
          this.state.view.phase === "interrupted" ||
          (this.complete &&
            (this.state.view.plan.practiceKind !== "ordinary" ||
              this.state.fault ||
              this.state.view.plan.occurrences.every(
                (o) =>
                  this.state.view.playback.filter(
                    (p) => p.occurrenceId === o.occurrenceId && p.event === "start_intent",
                  ).length >= o.allowedPlayCount,
              )))
        )
          await this.clearMedia();
      }
    } catch {
      await this.markFault();
    }
    this.changed();
  }
  pause() {
    if (!this.active || !this.occurrence?.pauseAllowed || this.status !== "playing") return;
    this.pauseAt = this.now().getTime();
    this.audio.pause();
    this.status = "paused";
    this.changed();
  }
  async resume() {
    if (!this.active || this.status !== "paused" || !this.occurrence?.pauseAllowed) return;
    if (!this.admissible()) {
      await this.native("failed", 0, "context_lost");
      return;
    }
    this.observations.learnerPauseMs += Math.max(
      0,
      this.now().getTime() - (this.pauseAt ?? this.now().getTime()),
    );
    this.status = "playing";
    try {
      await this.audio.play(this.url, this.occurrence?.authoredSpeedRatio ?? 1);
    } catch {
      await this.native("failed", 0, "playback_uncertain");
    }
    this.changed();
  }
  visibilityChanged() {
    this.observations.visibilityChanges++;
  }
  speedChanged(speed: number) {
    if (speed > 0 && speed !== this.occurrence?.authoredSpeedRatio)
      this.observations.speedActual = speed;
  }
  async deviceChanged(positionMs = 0) {
    this.observations.outputOrDeviceChange = true;
    if (this.active) await this.native("failed", positionMs, "output_changed");
    else await this.markFault();
  }
  async stalled(positionMs: number) {
    if (!this.started || !this.active) return;
    this.observations.stallIntervals.push({
      fromMs: Math.round(positionMs),
      toMs: Math.round(positionMs),
    });
    await this.native("failed", positionMs, "playback_stalled");
  }
  async retry() {
    try {
      await this.drain();
      if (this.state.pending.length) return;
      // Retry acknowledges original operations only. It never invokes native play.
      if (this.active && !this.started) await this.native("failed", 0, "playback_uncertain");
      if (this.complete || this.state.view.phase === "interrupted") await this.clearMedia();
      this.status = this.state.fault ? "unavailable" : this.hasBegun() ? "unavailable" : "ready";
      this.changed();
    } catch {
      await this.markFault();
    }
  }
  private async clearMedia() {
    this.audio.dispose();
    this.urls.clear();
    if (this.record)
      await this.save((r) => {
        r.media = [];
      });
  }
  async expireRetainedMedia() {
    if (
      this.record &&
      Date.parse(this.record.view.plan.expiresAt) <= this.now().getTime() &&
      !this.active
    )
      await this.clearMedia();
  }
  private async markFault() {
    this.status = "unavailable";
    this.audio.pause();
    if (this.record) {
      try {
        await this.save((r) => {
          r.fault = true;
          r.media = [];
        });
      } catch {
        /* Keep existing durable facts untouched. */
      }
    }
    this.audio.dispose();
    this.urls.clear();
    this.changed();
  }
  dispose() {
    if (this.record && this.complete && !this.record.pending.length) {
      const erased = { ...this.record, revision: this.record.revision + 1, media: [] };
      void this.store.write(erased, this.record.revision).catch(() => undefined);
    }
    this.disposed = true;
    this.audio.dispose();
    this.urls.clear();
  }
}
