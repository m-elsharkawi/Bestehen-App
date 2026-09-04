// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import type { TaskFamily } from "@bestehen/content";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RuntimeAttemptView } from "./attempt-runtime-view";

afterEach(cleanup);

const payload: TaskFamily = {
  kind: "R2DetailedSelect",
  stimulus: {
    stimulusId: "stimulus-one",
    safeContentNodes: [{ kind: "paragraph", children: [{ kind: "inline_text", text: "Text" }] }],
    language: "de",
    genreDomainRegister: "notice",
    evidenceAnchorIds: [],
  },
  questions: [
    {
      itemRef: "11111111-1111-4111-8111-111111111111",
      questionId: "question-one",
      questionNodes: [{ kind: "inline_text", text: "Choose" }],
      options: [
        {
          optionId: "option-one",
          learnerSafeLabel: [{ kind: "inline_text", text: "One" }],
          positionIsPresentationOnly: true,
        },
      ],
    },
  ],
};
const instruction = {
  instructionId: "instruction-one",
  locale: "de" as const,
  safeContentNodes: [
    {
      kind: "paragraph" as const,
      children: [{ kind: "inline_text" as const, text: "Lesen Sie den Text." }],
    },
  ],
  responseMechanic: "single_select" as const,
  helpPolicy: { offerableAssistanceKinds: [] },
  learnerFacingTimingLabel: "Übungszeit",
};

describe("P05-COMPONENT-001 rendered objective response", () => {
  it("uses the tested primary action role for progressive submission", () => {
    const { container } = render(
      <RuntimeAttemptView
        action={async (state) => state}
        attemptId="22222222-2222-4222-8222-222222222222"
        kind="reading"
        instruction={instruction}
        learnerPayload={payload}
        nextSequence={1}
        resourceVersion={2}
        state="in_progress"
      />,
    );

    expect(screen.getByRole("button", { name: "Submit answer" })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("button", { name: "Submit answer" })).toHaveClass(
      "action",
      "action-primary",
    );
    expect(container.querySelector(".sticky-action")).toBeNull();
    expect(screen.getByRole("region", { name: "Instructions" })).toHaveAttribute("lang", "de");
    expect(screen.getByRole("region", { name: "Instructions" })).toHaveTextContent(
      "Lesen Sie den Text.Übungszeit",
    );
  });
});
