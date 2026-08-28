// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import {
  consequentialUiProjectionStates,
  deletionStates,
  draftConflictStates,
  exportStates,
  sessionNoticeStates,
  statusForState,
  transferStates,
  uiCapabilityStates,
} from "@bestehen/contracts";
import {
  consequentialProjectionStates,
  isSupportedProjectionCard,
  ProjectionCard,
  type ProjectionCardContract,
} from "@bestehen/design-system";
import { evidenceValidityStates, readinessStates } from "@bestehen/domain";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

const consequentialStates = [
  ...evidenceValidityStates,
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
    message: "Fixture presentation message.",
    source: { release: "fixture-release", sourceCut: 4 },
    state,
    status: statusForState(state),
    title: "Fixture presentation",
  };
}

describe("P04-SEMANTIC-001 consequential projection fixtures", () => {
  it("keeps contracts and design-system consequential projection states in parity", () => {
    expect([...consequentialUiProjectionStates]).toEqual(
      expect.arrayContaining([...consequentialProjectionStates]),
    );
    expect([...consequentialProjectionStates]).toEqual(
      expect.arrayContaining([...consequentialUiProjectionStates]),
    );
  });

  it.each(consequentialStates)(
    "renders the %s state through the presentation-only card",
    (state) => {
      const status = statusForState(state);
      const { container } = render(<ProjectionCard projection={projectionFor(state)} />);

      expect(container.querySelector(".card")).toHaveAttribute("data-status", status);
      expect(container.querySelector(".status-word")).not.toHaveTextContent(
        state.replaceAll("_", " "),
      );
      for (const forbidden of ["provider", "queue", "storage", "callback"]) {
        expect(container).not.toHaveTextContent(forbidden);
      }
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
