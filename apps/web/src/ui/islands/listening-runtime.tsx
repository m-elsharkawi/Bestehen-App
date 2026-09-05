"use client";

import { ListeningRegion, NativeButton } from "@bestehen/design-system";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AttemptClockIsland } from "./attempt-clock";
import { BrowserListeningAudio, IndexedListeningStore } from "./listening-browser";
import { ListeningController } from "./listening-controller";

export function ListeningRuntimeIsland({
  attemptId,
  continuityScope,
  startedAt,
  children,
}: {
  readonly attemptId: string;
  readonly continuityScope: string;
  readonly startedAt?: string;
  readonly children?: ReactNode;
}) {
  const region = useRef<HTMLDivElement>(null);
  const runtime = useRef<ListeningController | null>(null);
  const [, update] = useState(0);
  useEffect(() => {
    let mounted = true;
    const player = () => region.current?.querySelector("audio") ?? null;
    const controller = new ListeningController(
      `${continuityScope}:${attemptId}`,
      attemptId,
      new IndexedListeningStore(),
      new BrowserListeningAudio(player),
      (...args) => fetch(...args),
      () => {
        if (mounted) update((n) => n + 1);
      },
    );
    runtime.current = controller;
    void controller.restore();
    const nativeStarted = () => void controller.native("started", 0);
    const nativeEnded = () =>
      void controller.native("completed", (player()?.currentTime ?? 0) * 1000);
    const nativeError = () =>
      void controller.native("failed", (player()?.currentTime ?? 0) * 1000, "media_unavailable");
    const stalled = () => void controller.stalled((player()?.currentTime ?? 0) * 1000);
    const visibility = () => controller.visibilityChanged();
    const device = () => void controller.deviceChanged((player()?.currentTime ?? 0) * 1000);
    const speed = () => controller.speedChanged(player()?.playbackRate ?? 1);
    const paused = () => {
      if (controller.status === "playing" && !player()?.ended)
        void controller.native("failed", (player()?.currentTime ?? 0) * 1000, "playback_uncertain");
    };
    const seeking = () => {
      if (controller.status === "playing" && controller.occurrence?.seekingAllowed === false)
        void controller.native("failed", (player()?.currentTime ?? 0) * 1000, "playback_uncertain");
    };
    const retry = () => void controller.retry();
    const audio = player();
    audio?.addEventListener("playing", nativeStarted);
    audio?.addEventListener("ended", nativeEnded);
    audio?.addEventListener("error", nativeError);
    audio?.addEventListener("waiting", stalled);
    audio?.addEventListener("stalled", stalled);
    audio?.addEventListener("ratechange", speed);
    audio?.addEventListener("pause", paused);
    audio?.addEventListener("seeking", seeking);
    document.addEventListener("visibilitychange", visibility);
    navigator.mediaDevices?.addEventListener("devicechange", device);
    window.addEventListener("online", retry);
    return () => {
      mounted = false;
      runtime.current = null;
      audio?.removeEventListener("playing", nativeStarted);
      audio?.removeEventListener("ended", nativeEnded);
      audio?.removeEventListener("error", nativeError);
      audio?.removeEventListener("waiting", stalled);
      audio?.removeEventListener("stalled", stalled);
      audio?.removeEventListener("ratechange", speed);
      audio?.removeEventListener("pause", paused);
      audio?.removeEventListener("seeking", seeking);
      document.removeEventListener("visibilitychange", visibility);
      navigator.mediaDevices?.removeEventListener("devicechange", device);
      window.removeEventListener("online", retry);
      controller.dispose();
    };
  }, [attemptId, continuityScope]);
  const controller = runtime.current;
  const state = controller?.status ?? "preflight";
  const complete = controller?.complete ?? false;
  const responseReady = controller?.responseReady ?? false;
  const nativeStart = controller?.startedAt ?? startedAt;
  const expiresAt = controller?.record?.view.plan.expiresAt;
  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setTimeout(
      () => void runtime.current?.expireRetainedMedia(),
      Math.max(0, Date.parse(expiresAt) - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [expiresAt]);
  return (
    <>
      <div ref={region}>
        <ListeningRegion
          listening={{
            // An empty inert data source avoids fetching the page itself before verified bytes exist.
            audio: { label: "Task audio", src: controller?.url || "data:,", language: "de" },
            state: state === "confirm" || state === "retry" ? "preflight" : state,
            remainingPlays: controller?.remainingPlays ?? 0,
            pauseAllowed: controller?.occurrence?.pauseAllowed ?? false,
            transcript: {
              phase: "unavailable",
              reason: "Transcripts are available only through the authorized result phase.",
            },
            onTransport: (action) => {
              if (action === "pause") controller?.pause();
              else if (state === "paused") void controller?.resume();
              else void controller?.begin();
            },
          }}
        />
      </div>
      {state === "preflight" ? (
        <NativeButton onClick={() => void controller?.prepare()}>
          Check audio and output
        </NativeButton>
      ) : null}
      {state === "confirm" ? (
        <NativeButton onClick={() => void controller?.confirmOutput()}>
          I heard the output check
        </NativeButton>
      ) : null}
      {state === "ready" && !complete ? (
        <p>Choose Play to explicitly begin the verified Listening audio.</p>
      ) : null}
      {state === "paused" && controller?.occurrence?.pauseAllowed ? (
        <NativeButton onClick={() => void controller.resume()}>Resume current play</NativeButton>
      ) : null}
      {state === "retry" ? (
        <NativeButton onClick={() => void controller?.retry()}>
          Retry saved Listening facts
        </NativeButton>
      ) : null}
      {complete ? (
        <p role="status">The Listening block is complete. Your response can now be submitted.</p>
      ) : null}
      {nativeStart ? <AttemptClockIsland attemptId={attemptId} startedAt={nativeStart} /> : null}
      <div
        onSubmitCapture={(event) => {
          if (!responseReady) event.preventDefault();
        }}
      >
        {!responseReady ? (
          <p>Responses stay on this device. Submission waits for the recorded Listening block.</p>
        ) : null}
        <fieldset disabled={!responseReady}>
          <legend>Listening response</legend>
          {children}
        </fieldset>
      </div>
    </>
  );
}
