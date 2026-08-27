// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  AppShell,
  BinaryChoice,
  ComponentGallery,
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
  SessionDurationPicker,
  SessionNotice,
  UploadStatus,
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
    expect(container).not.toHaveTextContent("Deterministic state fixture");
  });

  it("renders every closed family contract through its real export", () => {
    expect(componentFixtureCases.length).toBeGreaterThan(43);
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
