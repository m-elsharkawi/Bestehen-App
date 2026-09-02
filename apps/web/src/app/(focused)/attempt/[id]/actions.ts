"use server";

import {
  canonicalizeResponse,
  canonicalResponseDigest,
  type ResponseOperation,
} from "@bestehen/content";
import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAttemptCommandDependencies,
  stableId,
} from "../../../../server/attempt-command-runtime";
import { handleCheckpointAttempt, handleSubmitAttempt } from "../../../../server/attempt-commands";

function operationsFrom(formData: FormData): readonly ResponseOperation[] {
  const operations: ResponseOperation[] = [];
  for (const [name, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    if (name.startsWith("select:")) {
      operations.push({ kind: "set_selection", itemId: name.slice(7), optionId: value });
    } else if (name.startsWith("candidate:")) {
      const [, itemId, gapId] = name.split(":");
      if (itemId && gapId)
        operations.push({ kind: "place_candidate", itemId, gapId, candidateId: value });
    } else if (name.startsWith("match:")) {
      const [, itemId, leftId] = name.split(":");
      if (itemId && leftId) operations.push({ kind: "set_match", itemId, leftId, rightId: value });
    }
  }
  return operations;
}

export async function submitObjectiveForm(formData: FormData): Promise<void> {
  const attemptId = String(formData.get("attemptId") ?? "");
  const expectedVersion = Number(formData.get("expectedVersion"));
  const sequence = Number(formData.get("sequence"));
  const startedAt = new Date(String(formData.get("startedAt") ?? "")).getTime();
  const operations = operationsFrom(formData);
  const canonical = canonicalizeResponse(operations);
  if (!attemptId || canonical.issues.length > 0 || operations.length === 0)
    redirect(`/attempt/${attemptId}?status=invalid`);
  const responseDigest = canonicalResponseDigest(canonical.response);
  const cookieStore = await cookies();
  const token = cookieStore.get(appSessionCookie.name)?.value;
  const checkpoint = await handleCheckpointAttempt(
    getAttemptCommandDependencies(),
    token,
    attemptId,
    {
      contract: { major: 1, minor: 0 },
      operationId: stableId("operation", `${attemptId}:${sequence}:${responseDigest}:checkpoint`),
      expectedVersion,
      payload: {
        attemptId,
        stream: "primary",
        sequence,
        operations,
        responseDigest,
        observedAt: new Date().toISOString(),
      },
    },
  );
  if (!checkpoint.ok) redirect(`/attempt/${attemptId}?status=checkpoint-retry`);
  const submitted = await handleSubmitAttempt(getAttemptCommandDependencies(), token, attemptId, {
    contract: { major: 1, minor: 0 },
    operationId: stableId("operation", `${attemptId}:${sequence}:${responseDigest}:submit`),
    expectedVersion: expectedVersion + 1,
    payload: {
      attemptId,
      checkpointSequence: sequence,
      responseDigest,
      conditions: {
        progressionProfile: "P2",
        timingMode: "practice",
        timerIntegrity: "insufficient",
        elapsedMs: Math.max(0, Date.now() - startedAt),
        exposureClass: "unseen",
        independenceClass: "first_attempt",
        assistanceUsed: [],
        accessibilityEquivalence: "equivalent",
      },
    },
  });
  redirect(
    submitted.ok ? `/attempt/${attemptId}/result` : `/attempt/${attemptId}?status=submit-retry`,
  );
}
