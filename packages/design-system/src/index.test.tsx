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

  it("preserves both draft branches and gives keyboard-native resolution choices", () => {
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

  it("provides keyboard-native alternatives for matching, ordering, and duration", () => {
    render(
      <>
        <MatchingPair />
        <ReorderList />
        <SessionDurationPicker />
      </>,
    );
    expect(screen.getByRole("button", { name: "Select item A" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Place in position 1" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Move up" })).toBeEnabled();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });
});
