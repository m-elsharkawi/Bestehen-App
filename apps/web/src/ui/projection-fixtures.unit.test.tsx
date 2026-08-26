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
import { ProjectionCard } from "@bestehen/design-system";
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

describe("P04-SEMANTIC-001 consequential projection fixtures", () => {
  it.each(consequentialStates)(
    "renders the %s state through the presentation-only card",
    (state) => {
      const status = statusForState(state);
      const { container } = render(
        <ProjectionCard
          projection={{
            affectedScope: ["Writing"],
            message: `Fixture message for ${state}`,
            state,
            status,
            title: `Fixture ${state}`,
          }}
        />,
      );

      expect(container.querySelector(".card")).toHaveAttribute("data-status", status);
      expect(container.querySelector(".status-word")).toHaveTextContent(state.replaceAll("_", " "));
      expect(container).toHaveTextContent("Affected: Writing");
    },
  );
});
