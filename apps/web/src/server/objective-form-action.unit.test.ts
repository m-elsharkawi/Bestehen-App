import { describe, expect, it, vi } from "vitest";
import type { TaskFamily } from "@bestehen/content";
import { responseFields } from "../ui/objective-form";
import { initialObjectiveFormState } from "../ui/objective-form-state";

const f = vi.hoisted(() => ({
  authenticate: vi.fn(),
  checkpoint: vi.fn(),
  submit: vi.fn(),
  material: vi.fn(),
  attempt: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "synthetic" }) }) }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));
vi.mock("./attempt-command-runtime", () => ({
  stableId: (_kind: string, value: string) => value,
  getAttemptCommandDependencies: () => ({ authenticate: f.authenticate }),
  getServingManifestCommandDependencies: () => ({
    attempts: { readAttempt: f.attempt },
    content: { readPinnedLearnerMaterial: f.material },
  }),
}));
vi.mock("./attempt-commands", () => ({
  handleCheckpointAttempt: f.checkpoint,
  handleSubmitAttempt: f.submit,
  isDatabaseAppId: () => true,
}));
import { submitObjectiveForm } from "../app/(focused)/attempt/[id]/actions";

const payload: TaskFamily = {
  kind: "SB2SharedBankLexicalCloze",
  connectedText: {
    stimulusId: "text",
    language: "de",
    genreDomainRegister: "synthetic",
    evidenceAnchorIds: [],
    connected: true,
    safeContentNodes: [],
  },
  gaps: [
    { itemRef: "item-a", gapId: "gap-a" },
    { itemRef: "item-b", gapId: "gap-b" },
  ],
  candidateReusePolicy: "at_most_once",
  candidateBank: [
    {
      optionId: "candidate-a",
      learnerSafeLabel: [{ kind: "inline_text", text: "Test" }],
      positionIsPresentationOnly: true,
    },
  ],
};
function form() {
  vi.clearAllMocks();
  f.authenticate.mockResolvedValue({ learnerScopeId: "synthetic" });
  f.attempt.mockResolvedValue({ servingManifestId: "manifest" });
  f.material.mockResolvedValue({ learnerPayload: payload });
  f.checkpoint.mockResolvedValue(new Response(null, { status: 200 }));
  f.submit.mockResolvedValue(new Response(null, { status: 200 }));
  const data = new FormData();
  data.set("attemptId", "11111111-1111-4111-8111-111111111111");
  data.set("expectedVersion", "2");
  data.set("sequence", "1");
  data.set("intent", "submit");
  data.set("confirmBoundary", String(data.get("attemptId")));
  for (const field of responseFields(payload)) data.set(field, "");
  data.set("capturedFields", JSON.stringify(responseFields(payload)));
  return data;
}
describe("P05-RECOVERY-001 plain form server action", () => {
  it("retries the same form identities after checkpoint success and lost submission transport", async () => {
    const data = form();
    data.set("candidate:item-a:gap-a", "candidate-a");
    f.submit.mockRejectedValueOnce(new Error("synthetic transport loss"));
    const result = await submitObjectiveForm(initialObjectiveFormState, data);
    expect(result.status).toBe("retry");
    expect(result.values["candidate:item-a:gap-a"]).toBe("candidate-a");
    await expect(submitObjectiveForm(result, data)).rejects.toThrow("redirect:/attempt/");
    const firstCheckpoint = f.checkpoint.mock.calls[0]?.[3];
    const replayedCheckpoint = f.checkpoint.mock.calls[1]?.[3];
    expect(replayedCheckpoint.operationId).toBe(firstCheckpoint.operationId);
    expect(replayedCheckpoint.payload.responseDigest).toBe(firstCheckpoint.payload.responseDigest);
    expect(replayedCheckpoint.payload.operations).toEqual(firstCheckpoint.payload.operations);
    expect(f.submit.mock.calls[1]?.[3]).toEqual(f.submit.mock.calls[0]?.[3]);
    expect(f.submit).toHaveBeenCalledTimes(2);
  });
  it("requires deliberate confirmation and every captured response field", async () => {
    const data = form();
    data.delete("confirmBoundary");
    expect((await submitObjectiveForm(initialObjectiveFormState, data)).status).toBe("invalid");
    data.set("confirmBoundary", String(data.get("attemptId")));
    data.delete("candidate:item-a:gap-a");
    expect((await submitObjectiveForm(initialObjectiveFormState, data)).status).toBe("invalid");
    expect(f.checkpoint).not.toHaveBeenCalled();
  });
  it("records a deliberate all-blank boundary with conservative timing through the same command functions", async () => {
    const data = form();
    await expect(submitObjectiveForm(initialObjectiveFormState, data)).rejects.toThrow(
      "redirect:/attempt/",
    );
    expect(f.checkpoint.mock.calls[0]?.[3].payload.operations).toEqual([
      { kind: "confirm_boundary", boundaryId: data.get("attemptId") },
    ]);
    expect(f.submit.mock.calls[0]?.[3].payload).not.toHaveProperty("clockObservation");
    expect(f.submit.mock.calls[0]?.[3].payload.conditions.timerIntegrity).toBe("insufficient");
  });
  it("does not turn technically uncaptured work into a scored blank", async () => {
    const data = form();
    data.delete("capturedFields");
    const result = await submitObjectiveForm(initialObjectiveFormState, data);
    expect(result.status).toBe("invalid");
    expect(f.checkpoint).not.toHaveBeenCalled();
    expect(f.submit).not.toHaveBeenCalled();
  });
  it("returns item-specific duplicate errors and preserves every submitted selection", async () => {
    const data = form();
    data.set("candidate:item-a:gap-a", "candidate-a");
    data.set("candidate:item-b:gap-b", "candidate-a");
    const result = await submitObjectiveForm(initialObjectiveFormState, data);
    expect(result.invalidFields).toEqual(["candidate:item-b:gap-b"]);
    expect(result.values).toEqual({
      "candidate:item-a:gap-a": "candidate-a",
      "candidate:item-b:gap-b": "candidate-a",
    });
    expect(f.checkpoint).not.toHaveBeenCalled();
    expect(f.submit).not.toHaveBeenCalled();
  });
  it("retains selections on session expiry", async () => {
    const data = form();
    data.set("candidate:item-a:gap-a", "candidate-a");
    f.authenticate.mockResolvedValue(undefined);
    const result = await submitObjectiveForm(initialObjectiveFormState, data);
    expect(result.status).toBe("session_expired");
    expect(result.values["candidate:item-a:gap-a"]).toBe("candidate-a");
    expect(f.submit).not.toHaveBeenCalled();
  });
});
