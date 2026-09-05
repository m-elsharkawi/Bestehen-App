// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const testRuntime = vi.hoisted(() => ({
  status: "preflight",
  complete: false,
  responseReady: false,
  startedAt: undefined as string | undefined,
  pauseAllowed: false,
  remainingPlays: 1,
  resume: vi.fn(),
  dispose: vi.fn(),
  notify: () => undefined,
}));
vi.mock("./listening-controller", () => ({
  listeningDigest: async () => "a".repeat(64),
  ListeningController: class {
    constructor(...args: unknown[]) {
      testRuntime.notify = args[5] as () => undefined;
    }
    get status() {
      return testRuntime.status;
    }
    get complete() {
      return testRuntime.complete;
    }
    get responseReady() {
      return testRuntime.responseReady;
    }
    get startedAt() {
      return testRuntime.startedAt;
    }
    get occurrence() {
      return { pauseAllowed: testRuntime.pauseAllowed };
    }
    url = "";
    get remainingPlays() {
      return testRuntime.remainingPlays;
    }
    async resume() {
      testRuntime.resume();
    }
    async restore() {
      testRuntime.notify();
    }
    dispose() {
      testRuntime.dispose();
    }
    async prepare() {}
    async retry() {}
  },
}));
vi.mock("./listening-browser", () => ({
  IndexedListeningStore: class {},
  BrowserListeningAudio: class {},
}));
vi.mock("./attempt-clock", () => ({
  AttemptClockIsland: ({ startedAt }: { startedAt: string }) => (
    <p data-attempt-clock="observation-only">Clock from {startedAt}</p>
  ),
}));

import { ListeningRuntimeIsland } from "./listening-runtime";
import { ListeningTranscriptIsland } from "./listening-transcript";
import { technicalListeningPlan } from "./listening.test-fixture";

beforeEach(() => {
  Object.assign(testRuntime, {
    status: "preflight",
    complete: false,
    responseReady: false,
    startedAt: undefined,
    pauseAllowed: false,
    remainingPlays: 1,
  });
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Listening component boundaries", () => {
  it("P05-LISTENING-001 blocks response submission before the server block fact and never starts a preflight clock", async () => {
    const { container } = render(
      <ListeningRuntimeIsland attemptId="test" continuityScope="scope">
        <button type="submit">Submit response</button>
      </ListeningRuntimeIsland>,
    );
    expect(screen.getByRole("button", { name: "Submit response" })).toBeDisabled();
    expect(container.querySelector("[data-attempt-clock]")).toBeNull();
    await act(async () => {
      testRuntime.complete = true;
      testRuntime.responseReady = true;
      testRuntime.notify();
    });
    expect(screen.getByRole("button", { name: "Submit response" })).toBeEnabled();
  });
  it("P05-PLAYBACK-002 keeps a completed ordinary response disabled while an extra ordinal is active", async () => {
    testRuntime.complete = true;
    testRuntime.responseReady = false;
    render(
      <ListeningRuntimeIsland attemptId="test" continuityScope="scope">
        <button type="submit">Submit response</button>
      </ListeningRuntimeIsland>,
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Submit response" })).toBeDisabled(),
    );
    await act(async () => {
      testRuntime.responseReady = true;
      testRuntime.notify();
    });
    expect(screen.getByRole("button", { name: "Submit response" })).toBeEnabled();
  });
  it("P05-PLAYBACK-001 honestly presents playing with pause disabled for target policy and exactly one native-start clock", async () => {
    testRuntime.status = "playing";
    testRuntime.startedAt = "2026-09-05T12:00:00.000Z";
    const { container, unmount } = render(
      <ListeningRuntimeIsland attemptId="test" continuityScope="scope" />,
    );
    await waitFor(() => expect(screen.getByText("Audio is playing.")).toBeVisible());
    expect(screen.getByRole("button", { name: "Pause" })).toBeDisabled();
    expect(container.querySelectorAll("[data-attempt-clock]")).toHaveLength(1);
    await act(async () => {
      testRuntime.pauseAllowed = true;
      testRuntime.notify();
    });
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();
    unmount();
    expect(testRuntime.dispose).toHaveBeenCalledTimes(1);
  });
  it("P05-RECOVERY-001 renders a neutral system fault without removing the response projection", async () => {
    testRuntime.status = "unavailable";
    render(
      <ListeningRuntimeIsland attemptId="test" continuityScope="scope">
        <input aria-label="Preserved response" defaultValue="saved choice" />
      </ListeningRuntimeIsland>,
    );
    await waitFor(() =>
      expect(screen.getByText("This was a system problem, not a result about you.")).toBeVisible(),
    );
    expect(screen.getByRole("textbox", { name: "Preserved response" })).toHaveValue("saved choice");
  });
  it("P05-PLAYBACK-001 can resume an ordinary paused final ordinal without inventing remaining plays", async () => {
    testRuntime.status = "paused";
    testRuntime.pauseAllowed = true;
    testRuntime.remainingPlays = 0;
    render(<ListeningRuntimeIsland attemptId="test" continuityScope="scope" />);
    await waitFor(() => expect(screen.getByText("Audio is paused.")).toBeVisible());
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Resume current play" }));
    expect(testRuntime.resume).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Plays remaining: 0.")).toBeVisible();
  });
  it("P05-TRANSCRIPT-001 never prefetches and explains a denied result-phase request", async () => {
    const transport = vi.fn(async () => new Response(null, { status: 404 }));
    vi.stubGlobal("fetch", transport);
    render(<ListeningTranscriptIsland attemptId="test" />);
    expect(transport).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Request authorized transcript" }));
    await waitFor(() => expect(screen.getByText(/not available in this phase/)).toBeVisible());
    expect(transport).toHaveBeenCalledTimes(1);
  });
  it("P05-TRANSCRIPT-001 reveals only server-gated exact-media transcript bytes after explicit request", async () => {
    const plan = technicalListeningPlan("a".repeat(64), 1);
    const mediaId = plan.plan.occurrences[0]?.candidates[0]?.mediaRevisionId;
    if (!mediaId) throw new Error("missing technical candidate");
    const transport = vi
      .fn()
      .mockResolvedValueOnce(Response.json(plan))
      .mockResolvedValueOnce(
        Response.json({
          transcriptRevisionId: "33333333-3333-4333-8333-333333333333",
          mediaRevisionId: mediaId,
          kind: "target_transcript",
          language: "de",
          digest: "a".repeat(64),
          authorizedPhase: "after_attempt",
          text: "Private authorized words",
        }),
      );
    vi.stubGlobal("fetch", transport);
    render(<ListeningTranscriptIsland attemptId="test" />);
    expect(screen.queryByText("Private authorized words")).toBeNull();
    expect(transport).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Request authorized transcript" }));
    await waitFor(() => expect(screen.getByText("Private authorized words")).toBeVisible());
    expect(transport).toHaveBeenLastCalledWith(
      `/api/v1/listening-plans/${plan.plan.listeningPlanId}/transcripts/${mediaId}`,
      { credentials: "same-origin", cache: "no-store" },
    );
  });
});
