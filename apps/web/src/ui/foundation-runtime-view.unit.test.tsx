// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FoundationRuntimeView } from "./foundation-runtime-view";

afterEach(cleanup);

describe("P05-FOUNDATION-001 rendered foundation route", () => {
  it("renders the fixed order, separate horizons, and honest unavailable blocks", () => {
    const action = async () => undefined;
    const { container } = render(
      <FoundationRuntimeView
        projection={{
          sessionId: "11111111-1111-4111-8111-111111111111",
          planningHorizonYears: 65,
          officialTargetYears: 60,
          completedSkills: ["reading"],
          nextSkill: "language_elements",
          nextTaskFamily: "SB1ContextualGrammarCloze",
          activityOccurrenceId: "22222222-2222-4222-8222-222222222222",
          unavailableSkills: [
            { skill: "writing", reasonCode: "FALLBACK.CONTENT_UNAVAILABLE" },
            { skill: "speaking", reasonCode: "FALLBACK.CONTENT_UNAVAILABLE" },
          ],
        }}
        saveAccess={action}
        saveTarget={action}
        startAttempt={action}
      />,
    );

    const text = container.textContent ?? "";
    const positions = ["Reading", "Language Elements", "Listening", "Writing", "Speaking"].map(
      (skill) => text.indexOf(skill),
    );
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(screen.getByText(/planning horizon is 65 years/i)).toBeInTheDocument();
    expect(screen.getByText(/official target reference remains 60/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue with Language Elements" })).toBeVisible();
    expect(container).not.toHaveTextContent("FALLBACK.CONTENT_UNAVAILABLE");
    expect(screen.getAllByText(/Unavailable in this release/)).toHaveLength(2);
    expect(container).toHaveTextContent("evidence building");
    expect(container).not.toHaveTextContent(/probability|placement claim|overall level/i);

    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveClass("action", "action-primary");
    }

    expect(screen.getByLabelText("Date status")).toHaveAttribute("id", "foundation-target-mode");
    expect(screen.getByLabelText(/Month \(YYYY-MM\)/)).toHaveAttribute(
      "id",
      "foundation-target-value",
    );
    const preferences = screen.getByRole("group", { name: "Preferences for this route" });
    const preferenceLabels = [
      "Prefer reduced motion",
      "Use forced colors",
      "Audio is available",
      "Prefer captions",
    ];
    for (const label of preferenceLabels) {
      const control = within(preferences).getByLabelText(label);
      expect(control).toHaveAttribute("type", "checkbox");
      expect(control.closest("label")).toBeTruthy();
    }
  });
});
