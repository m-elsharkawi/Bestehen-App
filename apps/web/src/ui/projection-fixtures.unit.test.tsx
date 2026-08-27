// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import {
  deletionStates,
  draftConflictStates,
  exportStates,
  sessionNoticeStates,
  statusForState,
  transferStates,
  uiCapabilityStates,
} from "@bestehen/contracts";
import {
  isSupportedProjectionCard,
  ProjectionCard,
  type ProjectionCardContract,
} from "@bestehen/design-system";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

const validityStates = ["valid", "partially_valid", "interrupted", "not_counted"] as const;
const readinessStates = [
  "evidence_building",
  "not_ready",
  "borderline",
  "safe",
  "ready_to_book",
  "stale_contradicted",
] as const;
const consequentialStates = [
  ...validityStates,
  ...readinessStates,
  ...uiCapabilityStates,
  ...sessionNoticeStates,
  ...transferStates,
  ...exportStates,
  ...deletionStates,
  ...draftConflictStates,
] as const;

function projectionFor(state: ProjectionCardContract["state"]): ProjectionCardContract {
  return {
    affectedScope: ["Writing"],
    action: { href: "/train", label: "Review Writing" },
    announcement: "polite",
    contract: { major: 1, minor: 0 },
    focusTarget: "heading",
    message: `Fixture message for ${state}`,
    source: { release: "fixture-release", sourceCut: 4 },
    state,
    status: statusForState(state),
    title: `Fixture ${state}`,
  };
}

describe("P04-SEMANTIC-001 consequential projection fixtures", () => {
  it.each(consequentialStates)(
    "renders the %s state through the presentation-only card",
    (state) => {
      const status = statusForState(state);
      const { container } = render(<ProjectionCard projection={projectionFor(state)} />);

      expect(container.querySelector(".card")).toHaveAttribute("data-status", status);
      expect(container.querySelector(".status-word")).toHaveTextContent(state.replaceAll("_", " "));
      expect(container).toHaveTextContent("Affected: Writing");
      expect(container.querySelector("[role='status']")).toHaveAttribute("aria-live", "polite");
      expect(container.querySelector("[data-source-cut='4']")).toHaveAttribute(
        "data-source-release",
        "fixture-release",
      );
    },
  );

  it("fails closed for an unsupported projection major or state", () => {
    const valid = projectionFor("pending");
    const unsupportedMajor = { ...valid, contract: { major: 2, minor: 0 } };
    const unsupportedState = { ...valid, state: "invented" };

    expect(isSupportedProjectionCard(valid)).toBe(true);
    expect(isSupportedProjectionCard(unsupportedMajor)).toBe(false);
    expect(isSupportedProjectionCard(unsupportedState)).toBe(false);
    expect(() =>
      render(<ProjectionCard projection={unsupportedMajor as unknown as ProjectionCardContract} />),
    ).toThrow("Unsupported consequential UI projection");
    expect(() =>
      render(<ProjectionCard projection={unsupportedState as unknown as ProjectionCardContract} />),
    ).toThrow("Unsupported consequential UI projection");
  });
});
