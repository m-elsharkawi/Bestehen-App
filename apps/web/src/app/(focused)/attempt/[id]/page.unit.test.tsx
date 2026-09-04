// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../server/frontend-data", () => ({
  attemptReturnPathForAuthentication: () => "/attempt/current",
  isSyntheticFixtureRequest: async () => false,
  loadAttemptProjection: async () => ({
    attempt: {
      modality: "reading",
      acknowledgedCheckpointSequence: 0,
      resourceVersion: 1,
      state: "in_progress",
    },
    material: {
      instruction: {
        instructionId: "pinned-instruction",
        locale: "de",
        safeContentNodes: [
          {
            kind: "paragraph",
            children: [{ kind: "inline_text", text: "Lesen Sie den gepinnten Text." }],
          },
        ],
        responseMechanic: "single_select",
        helpPolicy: { offerableAssistanceKinds: ["strategy_cue"] },
        learnerFacingTimingLabel: "Übungszeit",
      },
      learnerPayload: {
        kind: "R2DetailedSelect",
        stimulus: {
          stimulusId: "stimulus",
          safeContentNodes: [{ kind: "inline_text", text: "Aufgabe" }],
          language: "de",
          genreDomainRegister: "notice",
          evidenceAnchorIds: [],
        },
        questions: [
          {
            itemRef: "item-1",
            questionId: "question-1",
            questionNodes: [{ kind: "inline_text", text: "Frage" }],
            options: [
              {
                optionId: "option-1",
                learnerSafeLabel: [{ kind: "inline_text", text: "Antwort" }],
                positionIsPresentationOnly: true,
              },
            ],
          },
        ],
      },
    },
    continuityScope: "scope",
  }),
  requirePersonalSession: async () => undefined,
}));

vi.mock("./actions", () => ({ submitObjectiveForm: async (state: unknown) => state }));

import AttemptPage from "./page";

afterEach(cleanup);

describe("P05-ATTEMPT-ROUTE-001 pinned instruction presentation", () => {
  it("renders the route's pinned German instruction and timing label through the response island", async () => {
    render(
      await AttemptPage({
        params: Promise.resolve({ id: "synthetic" }),
        searchParams: Promise.resolve({}),
      }),
    );

    const instructions = screen.getByRole("region", { name: "Instructions" });
    expect(instructions).toHaveAttribute("lang", "de");
    expect(instructions).toHaveTextContent("Lesen Sie den gepinnten Text.");
    expect(instructions).toHaveTextContent("Übungszeit");
    expect(screen.getByText("Aufgabe").closest("[lang='de']")).not.toBeNull();
    expect(screen.getByText("Frage")).toHaveAttribute("lang", "de");
    expect(screen.getByText("Antwort")).toHaveAttribute("lang", "de");
    expect(screen.getByText("Help is available when this activity permits it.")).toHaveAttribute(
      "lang",
      "en",
    );
  });
});
