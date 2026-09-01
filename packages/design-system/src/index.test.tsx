// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AppShell,
  AnswerChoice,
  BinaryChoice,
  ComponentGallery,
  componentGalleryFixtureCases,
  componentFixtureCases,
  componentFixtureRegistry,
  componentFamilies,
  DraftConflict,
  DecisiveEvidence,
  EvidenceLabel,
  Field,
  Icon,
  iconNames,
  MatchingPair,
  Overlay,
  ReadinessEvidence,
  ReorderList,
  ResultCard,
  SessionDurationPicker,
  SessionNotice,
  UploadStatus,
  PendingBanner,
  ClozeGap,
  ListeningRegion,
} from "./index.js";

afterEach(cleanup);

describe("P04-COMPONENT-001 design system", () => {
  it("provides a skip target, landmarks, one heading, and fixed navigation order", () => {
    render(
      <AppShell activeDestination="coach" title="Today's plan">
        Content
      </AppShell>,
    );
    const skipTarget = screen.getByRole("link", { name: "Skip to main content" });
    const main = screen.getByRole("main");
    expect(skipTarget).toHaveAttribute("href", `#${main.id}`);
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen
        .getAllByRole("link", { name: /Coach|Readiness|Train|Progress/ })
        .map((link) => link.textContent?.trim()),
    ).toEqual(["Coach", "Readiness", "Train", "Progress"]);
    expect(screen.getByRole("link", { name: "Coach" })).toHaveAttribute("aria-current", "page");
  });

  it("renders one deterministic gallery row for all 43 families", () => {
    const { container } = render(<ComponentGallery />);
    expect(container.querySelectorAll("[data-component-family]")).toHaveLength(43);
    expect(componentFamilies).toHaveLength(43);
    expect(componentGalleryFixtureCases).toHaveLength(126);
    expect(container).not.toHaveTextContent("Deterministic state fixture");
  });

  it("renders every closed family contract through its real export", () => {
    expect(componentFixtureCases).toHaveLength(143);
    for (const fixture of componentFixtureRegistry) {
      expect(
        componentFixtureCases
          .filter((entry) => entry.id === fixture.id)
          .map((entry) => entry.variant),
        fixture.id,
      ).toEqual(fixture.variants);
    }
    for (const fixture of componentFixtureCases) {
      const { container, unmount } = render(<div>{fixture.render()}</div>);
      expect(container.querySelector(fixture.selector), fixture.id).not.toBeNull();
      expect(container, fixture.id).toHaveTextContent(fixture.expectedText);
      expect(fixture.variants, fixture.id).toContain(fixture.variant);
      unmount();
    }
  });

  it("renders shared subparts once while retaining a targeted assertion for each one", () => {
    expect(
      componentFixtureCases.filter((fixture) => fixture.caseKind === "shared-subpart"),
    ).toHaveLength(29);
    expect(
      componentGalleryFixtureCases.filter((fixture) => fixture.caseKind === "shared-subpart"),
    ).toHaveLength(12);
  });

  it("keeps inert Stage 04 fixtures static while native form entry remains available", () => {
    const fixture = (id: string, variant: string) => {
      const match = componentFixtureCases.find(
        (candidate) => candidate.id === id && candidate.variant === variant,
      );
      if (!match) throw new Error(`Missing ${id} ${variant} fixture`);
      return match.render();
    };
    const { container } = render(
      <>
        <section data-test-family="C08-segmented">{fixture("C08", "segmented")}</section>
        <section data-test-family="C08-tabs">{fixture("C08", "tabs")}</section>
        <section data-test-family="C08-chip">{fixture("C08", "chip")}</section>
        <section data-test-family="C11">{fixture("C11", "revealed")}</section>
        <section data-test-family="C12">{fixture("C12", "select-place")}</section>
        <section data-test-family="C13-input">{fixture("C13", "input")}</section>
        <section data-test-family="C13-options">{fixture("C13", "options")}</section>
        <section data-test-family="C14">{fixture("C14", "move")}</section>
        <section data-test-family="C39">{fixture("C39", "audioPlayer")}</section>
        <section data-test-family="C40">{fixture("C40", "autosave")}</section>
        <section data-test-family="C41">{fixture("C41", "recording")}</section>
      </>,
    );

    for (const variant of ["C08-segmented", "C08-tabs"]) {
      const choicePreview = container.querySelector(`[data-test-family='${variant}']`);
      expect(choicePreview).toHaveTextContent("Current");
      expect(
        choicePreview?.querySelector("a, button, input, [role='tablist'], [role='tab']"),
      ).toBeNull();
    }
    const chip = container.querySelector("[data-test-family='C08-chip'] input");
    expect(chip).toBeEnabled();

    const answer = container.querySelector("[data-test-family='C11']");
    expect(answer?.querySelector("input")).toBeEnabled();
    expect(answer?.querySelector("[role='status'], [aria-live]")).toBeNull();

    for (const family of ["C12", "C14"]) {
      const controls = container.querySelectorAll(`[data-test-family='${family}'] button`);
      expect(controls.length).toBeGreaterThan(0);
      for (const control of controls) expect(control).toBeDisabled();
      expect(container.querySelector(`[data-test-family='${family}']`)).toHaveTextContent(
        /unavailable in this static preview/i,
      );
    }

    expect(container.querySelector("[data-test-family='C13-input'] input")).toBeEnabled();
    const clozeOptions = container.querySelectorAll("[data-test-family='C13-options'] input");
    expect(clozeOptions).toHaveLength(2);
    for (const option of clozeOptions) expect(option).toBeEnabled();

    const listening = container.querySelector("[data-test-family='C39']");
    expect(listening).toHaveTextContent("Audio controls are unavailable");
    expect(listening?.querySelector("audio")).not.toHaveAttribute("controls");

    const writing = container.querySelector("[data-test-family='C40']");
    expect(writing?.querySelector("textarea")).toBeEnabled();
    expect(writing).toHaveTextContent("No draft is saved by this fixture");
    expect(writing).not.toHaveTextContent("Saved on this device");
    expect(writing?.querySelector("[role='status'], [aria-live]")).toBeNull();

    const speaking = container.querySelector("[data-test-family='C41']");
    expect(speaking).toHaveTextContent("No microphone capture is running");
    expect(speaking?.querySelector("button")).toBeDisabled();
    expect(speaking?.querySelector("[role='status'], [aria-live]")).toBeNull();
  });

  it("drives C29 fault categories and C32 readiness states through their public APIs", () => {
    const failures = componentFixtureCases.filter((fixture) => fixture.id === "C29");
    expect(failures.map((fixture) => fixture.variant)).toEqual([
      "identity",
      "media",
      "capability",
      "transfer",
      "storage",
    ]);
    for (const failure of failures) {
      const { container, unmount } = render(failure.render());
      expect(container.querySelector(`[data-failure-kind='${failure.variant}']`)).not.toBeNull();
      expect(container).toHaveTextContent(failure.expectedText);
      unmount();
    }

    const readiness = componentFixtureCases.filter((fixture) => fixture.id === "C32");
    expect(readiness.map((fixture) => fixture.variant)).toEqual([
      "evidence-building",
      "not-ready",
      "borderline",
      "safe",
      "ready-to-book",
      "stale-contradicted",
    ]);
    const firstReadinessCase = readiness[0];
    if (!firstReadinessCase) throw new Error("C32 needs an evidence-building fixture case");
    const { container } = render(firstReadinessCase.render());
    expect(container).toHaveTextContent("Written");
    expect(container).toHaveTextContent("Oral");
    expect(container.querySelectorAll(".gate-list > li")).toHaveLength(6);
    expect(container).toHaveTextContent("Gate F: not met");
  });

  it("allocates collision-safe field, group, and overlay identifiers", () => {
    const { container } = render(
      <>
        <Field label="First response" />
        <Field label="Second response" />
        <BinaryChoice legend="First choice" />
        <BinaryChoice legend="Second choice" />
        <SessionDurationPicker />
        <SessionDurationPicker />
        <Overlay title="First overlay" />
        <Overlay title="Second overlay" />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    const radioNames = [...container.querySelectorAll("input[type='radio']")].map((node) =>
      node.getAttribute("name"),
    );
    expect(new Set(radioNames).size).toBe(4);
  });

  it("renders the exact closed 20-icon registry as decorative geometry", () => {
    const { container } = render(iconNames.map((name) => <Icon key={name} name={name} />));
    expect(iconNames).toHaveLength(20);
    expect(container.querySelectorAll("svg[aria-hidden='true']")).toHaveLength(20);
    expect(container.querySelectorAll("svg[stroke-width='1.75']")).toHaveLength(20);
  });

  it("separates validity, practice eligibility, Readiness, and Gates A through F", () => {
    render(
      <>
        <EvidenceLabel
          eligibility="practice-only"
          reason="The timer was interrupted."
          validity="interrupted"
        />
        <ReadinessEvidence
          gates={["A", "B", "C", "D", "E", "F"].map((id) => ({
            id: id as "A" | "B" | "C" | "D" | "E" | "F",
            met: id === "A",
            reason:
              id === "A" ? "Recent written mock is valid." : "More direct evidence is required.",
          }))}
          state="evidence_building"
        />
      </>,
    );
    expect(screen.getByText("interrupted")).toBeInTheDocument();
    expect(screen.getByText(/practice-only/)).toBeInTheDocument();
    expect(screen.getByText("evidence building")).toBeInTheDocument();
    expect(screen.getAllByText(/Gate [A-F]:/)).toHaveLength(6);
    expect(screen.getAllByText("Not enough evidence")).toHaveLength(2);
  });

  it("keeps C19 results and C28 capability status as distinct public contracts", () => {
    const resultProjection = {
      affectedScope: ["Writing response"],
      announcement: "none",
      contract: { major: 1, minor: 0 },
      focusTarget: "heading",
      message: "The written result is available.",
      source: { release: "test-1", sourceCut: 1 },
      state: "partially_valid",
      status: "attention",
      title: "Writing result",
    } as const;
    const pendingProjection = {
      affectedScope: ["Speaking recording"],
      announcement: "polite",
      contract: { major: 1, minor: 0 },
      focusTarget: "none",
      message: "Capability status is waiting for a server update.",
      source: { release: "test-1", sourceCut: 1 },
      state: "pending",
      status: "attention",
      title: "Capability status",
    } as const;
    const { container } = render(
      <>
        <ResultCard projection={resultProjection} />
        <PendingBanner projection={pendingProjection} />
      </>,
    );

    const result = container.querySelector("[data-component='result-card']");
    const pending = container.querySelector("[data-component='pending-banner']");
    expect(result).toHaveTextContent("Outcome");
    expect(result).toHaveTextContent("Validity");
    expect(result).toHaveTextContent("Affected: Writing response");
    expect(result).toHaveAttribute("tabindex", "-1");
    expect(pending).toHaveAttribute("aria-live", "polite");
    expect(pending).toHaveAttribute("role", "status");
    expect(pending).toHaveAttribute("data-state", "pending");
    expect(pending).toHaveTextContent("Affected: Speaking recording");
  });

  it("renders both draft versions and keyboard-native preview choices", () => {
    render(<DraftConflict />);
    expect(screen.getByRole("heading", { name: "This device" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Server checkpoint" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("uses honest interrupted-attempt and transfer copy", () => {
    render(
      <>
        <SessionNotice state="expired_mid_attempt" />
        <UploadStatus state="not_sent" />
      </>,
    );
    expect(screen.getByText(/server will decide the final validity/i)).toBeInTheDocument();
    expect(screen.getByText(/local recording is still available/i)).toBeInTheDocument();
    expect(screen.queryByText(/still counts/i)).not.toBeInTheDocument();
  });

  it("does not offer sign-in for access denied and keeps session copy detail-free", () => {
    const { container } = render(<SessionNotice state="access_denied" />);
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
    expect(container.querySelector("a[href='/auth/login']")).toBeNull();

    for (const state of [
      "signed_out",
      "callback_failed",
      "expired_idle",
      "expired_mid_attempt",
      "access_denied",
    ] as const) {
      const { container: notice, unmount } = render(<SessionNotice state={state} />);
      expect(notice).not.toHaveTextContent(/provider|credential|otp|password/i);
      unmount();
    }
  });

  it.each([
    ["expired_idle", "Sign in to continue."],
    [
      "expired_mid_attempt",
      "Your draft, elapsed time, and attempt conditions are preserved. The server will decide the final validity after you sign in.",
    ],
  ] as const)(
    "announces %s assertively exactly once after the empty region mounts",
    async (state, copy) => {
      vi.useFakeTimers();
      try {
        const { container, rerender } = render(<SessionNotice state="signed_out" />);
        rerender(<SessionNotice state={state} />);
        const assertiveRegions = container.querySelectorAll("[aria-live='assertive']");
        expect(assertiveRegions).toHaveLength(1);
        const region = assertiveRegions.item(0);
        if (!region) throw new Error("Session expiry announcement region is missing");
        expect(region).toHaveAttribute("aria-atomic", "true");
        expect(region).toBeEmptyDOMElement();

        const changes: string[] = [];
        const observer = new MutationObserver(() => changes.push(region.textContent ?? ""));
        observer.observe(region, { childList: true });
        await act(async () => {
          vi.runAllTimers();
        });
        observer.disconnect();

        expect(region).toHaveTextContent(copy);
        expect(changes).toEqual([copy]);
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it("disables deferred matching and ordering commands while duration stays native", () => {
    render(
      <>
        <MatchingPair />
        <ReorderList />
        <SessionDurationPicker />
      </>,
    );
    expect(screen.getByRole("button", { name: "Select item A" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Place in position 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move up" })).toBeDisabled();
    const durationChoices = screen.getAllByRole("radio");
    expect(durationChoices).toHaveLength(3);
    for (const choice of durationChoices) expect(choice).toBeEnabled();
  });
});

describe("P05-COMPONENT-001 deterministic learning primitives", () => {
  it("keeps the accepted no-prop markup at every extended call site", () => {
    const cases = [
      ["answer", <AnswerChoice key="answer" />],
      ["matching", <MatchingPair key="matching" />],
      ["cloze", <ClozeGap key="cloze" />],
      ["evidence", <DecisiveEvidence key="evidence" />],
      ["listening", <ListeningRegion key="listening" />],
    ] as const;
    const expected = new Map<string, string>([
      [
        "answer",
        '<fieldset><legend>Choose the answer</legend><label><input type="radio" name="_r_0_"> Yes</label><label><input type="radio" name="_r_0_"> No</label></fieldset>',
      ],
      [
        "matching",
        '<fieldset disabled=""><legend>Match each item</legend><p>Select an item, then choose its numbered position.</p><p>Matching controls are unavailable in this static preview.</p><button type="button">Select item A</button><button type="button">Place in position 1</button><button type="button">Reset matches</button></fieldset>',
      ],
      [
        "cloze",
        '<span class="cloze-gap" data-cloze-status="active"><label><span class="cloze-gap-word">Gap </span><span class="cloze-gap-number">1</span><input aria-label="Answer for gap 1"></label></span>',
      ],
      [
        "evidence",
        '<section class="card" data-status="neutral"><h2>Decisive evidence</h2><blockquote lang="de">Vielen Dank für die Einladung.</blockquote><dl><dt>Condition</dt><dd>No answer-bearing help</dd><dt>Recorded</dt><dd><time datetime="2026-08-26">26 August 2026</time></dd></dl></section>',
      ],
      [
        "listening",
        '<section><h2>Hören</h2><audio preload="none"></audio><p>Audio controls are unavailable in this static preview.</p><p>Replay limit: two. No transcript is available during this task.</p></section>',
      ],
    ]);
    for (const [name, element] of cases) {
      const { container, unmount } = render(element);
      expect(container.innerHTML.replace(/_r_[a-z0-9]+_/g, "_r_0_"), name).toBe(expected.get(name));
      unmount();
    }
  });

  it("provides native selection and named select-then-place matching without drag", () => {
    const selected: string[] = [];
    const selectedPrompt: string[] = [];
    const placements: Array<readonly [string, string]> = [];
    render(
      <>
        <AnswerChoice
          response={{
            itemLabel: "Choose the notice",
            onSelect: (id) => selected.push(id),
            options: [
              { id: "notice-a", label: "Notice A" },
              { id: "notice-b", label: "Notice B" },
            ],
            selectedIds: ["notice-a"],
          }}
        />
        <MatchingPair
          matching={{
            itemLabel: "Match situations to notices",
            destinations: [{ id: "notice-a", label: "Notice A" }],
            onPlace: (promptId, destinationId) => placements.push([promptId, destinationId]),
            onSelectPrompt: (promptId) => selectedPrompt.push(promptId),
            prompts: [{ id: "situation-a", label: "Situation A" }],
            selectedPromptId: "situation-a",
          }}
        />
      </>,
    );
    const answer = screen.getByRole("radio", { name: "Notice A" });
    expect(answer).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Notice B" }));
    expect(selected).toEqual(["notice-b"]);
    const prompt = screen.getByRole("button", { name: "Situation A" });
    expect(prompt).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(prompt);
    fireEvent.click(screen.getByRole("button", { name: "Notice A, empty" }));
    expect(selectedPrompt).toEqual(["situation-a"]);
    expect(placements).toEqual([["situation-a", "notice-a"]]);
  });

  it("keeps an SB2 candidate unavailable after placement and gives each gap a named placement path", () => {
    const placements: Array<readonly [string, string]> = [];
    render(
      <>
        <ClozeGap
          number={1}
          sharedBank={{
            candidates: [
              { id: "candidate-a", label: "kommen" },
              { id: "candidate-b", label: "gekommen" },
            ],
            itemLabel: "Shared candidate bank",
            onPlaceCandidate: (gapId, candidateId) => placements.push([gapId, candidateId]),
            placements: { "gap-2": "candidate-b" },
            reusePolicy: "at_most_once",
            selectedCandidateId: "candidate-a",
          }}
          gapId="gap-1"
        />
        <ClozeGap
          number={2}
          sharedBank={{
            candidates: [
              { id: "candidate-a", label: "kommen" },
              { id: "candidate-b", label: "gekommen" },
            ],
            itemLabel: "Shared candidate bank",
            placements: { "gap-2": "candidate-b" },
            reusePolicy: "at_most_once",
            selectedCandidateId: "candidate-a",
          }}
          state="options"
        />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Place kommen in gap 1" }));
    expect(placements).toEqual([["gap-1", "candidate-a"]]);
    expect(screen.getByRole("button", { name: /gekommen, already placed/i })).toBeDisabled();
  });

  it("renders server-provided decisive evidence and phase-gated listening state", () => {
    const { container } = render(
      <>
        <DecisiveEvidence
          evidence={{
            condition: "No answer-bearing help",
            excerpt: "Der Kurs beginnt um acht Uhr.",
            recordedAt: { dateTime: "2026-09-02", label: "2 September 2026" },
            relation: "The start time rules out the later notice.",
          }}
        />
        <ListeningRegion
          listening={{
            audio: { label: "German announcement", src: "/media/announcement.mp3" },
            remainingPlays: 1,
            state: "ready",
            transcript: { phase: "unavailable", reason: "Transcript available after submission." },
          }}
        />
      </>,
    );
    expect(screen.getByText("Der Kurs beginnt um acht Uhr.")).toBeInTheDocument();
    expect(screen.getByText("The start time rules out the later notice.")).toBeInTheDocument();
    expect(screen.getByText("Plays remaining: 1.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Audio is ready to play.");
    expect(screen.getByText(/Der Kurs beginnt/)).toBeInTheDocument();
    expect(container.querySelector(".listening-transcript")).toBeNull();
    expect(screen.getByText("Transcript available after submission.")).toBeInTheDocument();
  });

  it("keeps unavailable audio out of transport and only renders an authorized transcript payload", () => {
    const { rerender } = render(
      <ListeningRegion
        listening={{
          audio: { label: "German announcement", src: "/media/announcement.mp3" },
          remainingPlays: 0,
          state: "unavailable",
          transcript: {
            phase: "unavailable",
            reason: "Transcript is not authorized in this phase.",
          },
        }}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Audio is unavailable for this activity.");
    expect(
      screen.getByText("This was a system problem, not a result about you."),
    ).toBeInTheDocument();
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
    expect(screen.queryByText("Der Kurs beginnt um acht Uhr.")).not.toBeInTheDocument();

    rerender(
      <ListeningRegion
        listening={{
          audio: { label: "German announcement", src: "/media/announcement.mp3" },
          remainingPlays: 0,
          state: "paused",
          transcript: {
            label: "Read transcript",
            phase: "available",
            text: "Der Kurs beginnt um acht Uhr.",
          },
        }}
      />,
    );
    expect(screen.getByRole("group", { name: "Audio transport" })).toBeInTheDocument();
    expect(screen.getByText("Der Kurs beginnt um acht Uhr.")).toBeInTheDocument();
  });
});

describe("P05-COPY-001 learner-facing copy", () => {
  it("keeps shipped component strings and API fields free of unsupported certainty and implementation jargon", () => {
    const components = readFileSync("packages/design-system/src/components.tsx", "utf8");
    const contracts = readFileSync("packages/design-system/src/contracts.ts", "utf8");
    const source = [
      components.slice(
        components.indexOf("export function AnswerChoice"),
        components.indexOf("export function ReorderList"),
      ),
      components.slice(
        components.indexOf("export function DecisiveEvidence"),
        components.indexOf("export function RepairCard"),
      ),
      components.slice(
        components.indexOf("function listeningStatus"),
        components.indexOf("export type WritingRegionVariant"),
      ),
      contracts.slice(
        contracts.indexOf("/** A learner-safe option"),
        contracts.indexOf("export const consequentialProjectionStates"),
      ),
    ].join("\n");
    const banned = [
      /pass\s+(?:probability|chance|likelihood)/i,
      /guaranteed\s+(?:pass|result|outcome)/i,
      new RegExp(["it", "still", "counts"].join("\\s+"), "i"),
      new RegExp(["pro", "vider"].join(""), "i"),
      /credential|signed URL|infrastructure/i,
    ];
    for (const pattern of banned) expect(source).not.toMatch(pattern);
  });
});
