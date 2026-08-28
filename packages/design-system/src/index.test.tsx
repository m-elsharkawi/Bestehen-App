// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AppShell,
  BinaryChoice,
  ComponentGallery,
  componentGalleryFixtureCases,
  componentFixtureCases,
  componentFixtureRegistry,
  componentFamilies,
  DraftConflict,
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
