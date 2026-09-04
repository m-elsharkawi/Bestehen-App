// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import {
  canonicalizeResponse,
  canonicalResponseDigest,
  scoreObjectiveSubmission,
  type TaskFamily,
  type ScoredUnitDescriptor,
  type PinnedKey,
} from "@bestehen/content";
import { appId } from "@bestehen/domain";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formOperations, responseFields, responseIssues } from "../objective-form";
import { IndexedResponseStore, type RecoveryView } from "./objective-continuity";
import { ObjectiveResponseIsland } from "./objective-response";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});
const text = (value: string) => [{ kind: "inline_text" as const, text: value }];
const options = [
  {
    optionId: "choice-z",
    learnerSafeLabel: text("Train"),
    positionIsPresentationOnly: true as const,
  },
  {
    optionId: "choice-a",
    learnerSafeLabel: text("Bus"),
    positionIsPresentationOnly: true as const,
  },
];
const stimulus = {
  stimulusId: "synthetic",
  safeContentNodes: text("Synthetic task"),
  language: "de" as const,
  genreDomainRegister: "synthetic",
  evidenceAnchorIds: [],
};
const bindings = [
  { itemRef: "item-zzz", leftId: "left-z" },
  { itemRef: "item-aaa", leftId: "left-a" },
];
const constraints = {
  leftCardinality: { min: 1, max: 1 },
  rightReusePolicy: "at_most_once" as const,
  unmatchedPolicy: "permitted" as const,
  completionRule: "partial_permitted" as const,
};
const gaps = bindings.map((b) => ({ itemRef: b.itemRef, gapId: b.leftId }));
const families: readonly TaskFamily[] = [
  {
    kind: "R1HeadingMatching",
    texts: [stimulus],
    headings: options,
    matchConstraints: constraints,
    itemBindings: bindings,
  },
  {
    kind: "R3SituationNoticeMatching",
    situations: [],
    notices: options.map((o) => ({
      ...stimulus,
      stimulusId: o.optionId,
      safeContentNodes: o.learnerSafeLabel,
    })),
    matchConstraints: constraints,
    itemBindings: bindings,
  },
  {
    kind: "SB2SharedBankLexicalCloze",
    connectedText: { ...stimulus, connected: true },
    gaps,
    candidateBank: options,
    candidateReusePolicy: "at_most_once",
  },
  {
    kind: "SB1ContextualGrammarCloze",
    connectedText: { ...stimulus, connected: true },
    gaps: gaps.map((g) => ({ ...g, options })),
  },
  {
    kind: "R2DetailedSelect",
    stimulus,
    questions: bindings.map((b, index) => ({
      itemRef: b.itemRef,
      questionId: b.leftId,
      questionNodes: text(`Question ${index + 1}`),
      options,
    })),
  },
];
function view(payload: TaskFamily, continuityScope?: string) {
  return render(
    <ObjectiveResponseIsland
      payload={payload}
      action={async (state) => state}
      attemptId="attempt"
      expectedVersion={2}
      sequence={1}
      startedAt="2026-09-04T10:00:00Z"
      {...(continuityScope ? { continuityScope } : {})}
    />,
  );
}
function snapshot(container: HTMLElement, payload: TaskFamily) {
  const form = container.querySelector("form");
  if (!form) throw new Error("Missing native form");
  const data = new FormData(form);
  return Object.fromEntries(
    responseFields(payload).map((name) => [name, String(data.get(name) ?? "")]),
  );
}
function scored(payload: TaskFamily, values: Record<string, string>) {
  const response = canonicalizeResponse(formOperations(values, "attempt")).response;
  const units: ScoredUnitDescriptor[] = bindings.map((b) => ({
    itemId: appId(b.itemRef),
    keyRevisionId: appId(`key-${b.itemRef}`),
    taskRef: "synthetic",
    responseCardinality: { min: 1, max: 1 },
    offeredIdentifiers: options.map((o) => o.optionId),
    binding:
      "questions" in payload
        ? { kind: "select", questionId: b.leftId }
        : "gaps" in payload
          ? { kind: "gap", gapId: b.leftId }
          : { kind: "match", leftId: b.leftId },
    responseKind:
      "questions" in payload
        ? "single_select"
        : "gaps" in payload
          ? "cloze_bank_candidate"
          : "match",
  }));
  const keys: PinnedKey[] = units.map((unit, index) => ({
    itemId: unit.itemId,
    keyRevisionId: unit.keyRevisionId,
    responseCardinality: unit.responseCardinality,
    scoringPolicyRef: "synthetic",
    acceptedResponseSet: [
      unit.binding.kind === "select"
        ? { kind: "option", optionId: options[index]?.optionId ?? "" }
        : unit.binding.kind === "gap"
          ? {
              kind: "candidate",
              gapId: unit.binding.gapId,
              candidateId: options[index]?.optionId ?? "",
            }
          : { kind: "match", leftId: unit.binding.leftId, rightId: options[index]?.optionId ?? "" },
    ],
  }));
  const outcome = scoreObjectiveSubmission(
    {
      submissionId: appId("submission"),
      attemptId: appId("attempt-synthetic"),
      servingManifestId: appId("manifest-synthetic"),
      formAndKeyVersions: {
        formRevisionId: null,
        contentReleaseIdentity: "synthetic",
        keyRevisionIds: units.map((u) => u.keyRevisionId),
      },
      units,
      canonicalResponse: response,
      uncapturedItemIds: [],
      officialRoleContext: null,
    },
    keys,
    {
      scoringPolicyRef: "synthetic",
      pointsPerCorrectUnit: 1,
      pointsPerIncorrectUnit: 0,
      pointsPerBlankUnit: 0,
      officialConversion: null,
    },
    "synthetic-v1",
  );
  expect(outcome.ok).toBe(true);
  if (!outcome.ok) throw new Error(outcome.error);
  expect(Object.fromEntries(outcome.value.unitOutcomes.map((u) => [u.itemId, u.kind]))).toEqual({
    "item-zzz": "correct",
    "item-aaa": "correct",
  });
  return { digest: canonicalResponseDigest(response), outcome: outcome.value };
}

describe("P05-EQUIV-001 rendered canonical input identity", () => {
  it.each(families)(
    "keeps $kind native, numeric and semantic activation identical by item and score",
    (payload) => {
      const results = [];
      for (const mode of ["native", "numeric", "semantic"] as const) {
        const { container, unmount } = view(payload);
        const fields = responseFields(payload);
        fields.forEach((name, index) => {
          if ("questions" in payload) {
            const group = screen.getByRole("group", { name: `Question ${index + 1}` });
            const radios = group.querySelectorAll<HTMLInputElement>('input[type="radio"]');
            const chosen = radios[index];
            if (!chosen) throw new Error("Missing radio");
            if (mode === "numeric")
              fireEvent.keyDown(radios[0] as HTMLInputElement, { key: String(index + 1) });
            else if (mode === "semantic") chosen.click();
            else fireEvent.click(chosen.closest("label") as HTMLLabelElement);
          } else {
            const select = container.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
            if (!select) throw new Error("Missing select");
            if (mode === "numeric") fireEvent.keyDown(select, { key: String(index + 1) });
            else fireEvent.change(select, { target: { value: options[index]?.optionId } });
          }
        });
        const values = snapshot(container, payload);
        expect(values).toEqual({
          [fields[0] as string]: "choice-z",
          [fields[1] as string]: "choice-a",
        });
        results.push(scored(payload, values));
        unmount();
      }
      expect(results[1]).toEqual(results[0]);
      expect(results[2]).toEqual(results[0]);
    },
  );
  it.each(families.slice(0, 3))(
    "prevents $kind reuse in enhanced controls and rejects it at the native validation boundary",
    (payload) => {
      const { container } = view(payload);
      const [first, second] = screen.getAllByRole("combobox") as HTMLSelectElement[];
      if (!first || !second) throw new Error("Missing matching controls");
      fireEvent.change(first, { target: { value: "choice-z" } });
      expect(second.options[1]).toBeDisabled();
      fireEvent.keyDown(second, { key: "1" });
      expect(second).toHaveValue("");
      const fields = responseFields(payload);
      expect(
        responseIssues(payload, {
          [fields[0] as string]: "choice-z",
          [fields[1] as string]: "choice-z",
        }),
      ).toEqual([fields[1]]);
      expect(snapshot(container, payload)[fields[0] as string]).toBe("choice-z");
    },
  );
  it("compares the acknowledged server branch using learner labels rather than row position or IDs", async () => {
    vi.spyOn(IndexedResponseStore.prototype, "read").mockResolvedValue(undefined);
    vi.spyOn(IndexedResponseStore.prototype, "write").mockResolvedValue();
    const remote: RecoveryView = {
      contract: { major: 1 },
      resourceVersion: 3,
      acknowledgedCheckpointSequence: 1,
      checkpoints: [
        {
          sequence: 1,
          responseDigest: "remote",
          operations: [
            { kind: "set_selection", itemId: "item-zzz", optionId: "choice-a" },
            { kind: "set_selection", itemId: "item-aaa", optionId: "choice-z" },
          ],
        },
        { sequence: 0, responseDigest: "old", operations: [] },
      ],
      submission: null,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(remote)),
    );
    const read = vi.spyOn(IndexedResponseStore.prototype, "read");
    read.mockResolvedValue({
      key: "synthetic",
      major: 1,
      updatedAt: Date.now(),
      values: { "select:item-zzz": "choice-z", "select:item-aaa": "choice-a" },
      expectedVersion: 2,
      sequence: 1,
      pending: null,
      conflict: remote,
      acknowledged: false,
      captured: true,
    });
    const matchingIds: TaskFamily = {
      kind: "R2DetailedSelect",
      stimulus,
      questions: [
        { itemRef: "item-zzz", questionId: "first", questionNodes: text("Question 1"), options },
        {
          itemRef: "item-aaa",
          questionId: "second",
          questionNodes: text("Question 2"),
          options: [
            {
              optionId: "choice-a",
              positionIsPresentationOnly: true,
              learnerSafeLabel: text("Tram"),
            },
            {
              optionId: "choice-z",
              positionIsPresentationOnly: true,
              learnerSafeLabel: text("Ferry"),
            },
          ],
        },
        { itemRef: "item-blank", questionId: "third", questionNodes: text("Question 3"), options },
      ],
    };
    view(matchingIds, "owner");
    const comparison = await screen.findByRole("region", { name: "Compare saved responses" });
    expect(comparison).toHaveTextContent(
      "Question 1: this device Train; other saved response Bus.",
    );
    expect(comparison).toHaveTextContent(
      "Question 2: this device Tram; other saved response Ferry.",
    );
    expect(comparison).toHaveTextContent(
      "Question 3: this device blank; other saved response blank.",
    );
    expect(comparison).not.toHaveTextContent(/choice-a|item-zzz|set_selection/);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Submit answer" })).toBeDisabled(),
    );
  });
});
