// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ResultView } from "./archetypes";

afterEach(cleanup);

describe("P05-RESULT-A11Y-001 authored language segments", () => {
  it("marks authored German fragments while result chrome remains English", () => {
    render(
      <ResultView
        projection={{
          validityScope: [{ id: "scope", text: "Affected scope.", germanText: "Frage A" }],
          outcomes: [
            {
              id: "outcome",
              text: "Question 1: the recorded response fits.",
              germanText: "Frage A — Antwort A",
            },
          ],
          decisiveEvidence: [{ id: "evidence", text: "Decisive evidence.", germanText: "Beleg A" }],
          rationales: [
            {
              id: "rationale",
              text: "Why this response fits.",
              germanText: "Weil der Text es sagt.",
            },
          ],
          causes: [{ id: "cause", text: "No supported diagnostic observation is recorded." }],
          repair: "Review the decisive evidence.",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Decisive evidence" })).not.toHaveAttribute("lang");
    expect(screen.getByText("Beleg A")).toHaveAttribute("lang", "de");
    expect(screen.getByText(/Antwort A/)).toHaveAttribute("lang", "de");
    expect(screen.getByText("Decisive evidence.")).not.toHaveAttribute("lang");
  });
});
