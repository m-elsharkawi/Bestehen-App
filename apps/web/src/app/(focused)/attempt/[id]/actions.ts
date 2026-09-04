"use server";

import { canonicalizeResponse, canonicalResponseDigest, type TaskFamily } from "@bestehen/content";
import { appId } from "@bestehen/domain";
import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAttemptCommandDependencies,
  getServingManifestCommandDependencies,
  stableId,
} from "../../../../server/attempt-command-runtime";
import {
  handleCheckpointAttempt,
  handleSubmitAttempt,
  isDatabaseAppId,
} from "../../../../server/attempt-commands";
import { formOperations, responseFields, responseIssues } from "../../../../ui/objective-form";
import type { ObjectiveFormState } from "../../../../ui/objective-form-state";

export async function submitObjectiveForm(
  _previous: ObjectiveFormState,
  formData: FormData,
): Promise<ObjectiveFormState> {
  const attemptId = String(formData.get("attemptId") ?? "");
  const values = Object.fromEntries(
    [...formData.entries()].filter(
      ([key, value]) => /^(select|candidate|match):/.test(key) && typeof value === "string",
    ),
  ) as Record<string, string>;
  const failure = (
    status: ObjectiveFormState["status"],
    message: string,
    invalidFields: readonly string[] = [],
  ): ObjectiveFormState => ({ status, values, message, invalidFields });
  if (!isDatabaseAppId(attemptId))
    return failure("invalid", "This activity could not be identified. Your choices are preserved.");
  const token = (await cookies()).get(appSessionCookie.name)?.value;
  const dependencies = getAttemptCommandDependencies();
  const scope = await dependencies.authenticate(token).catch(() => undefined);
  if (!scope)
    return failure(
      "session_expired",
      "Sign in again, then retry. Your choices remain on this page.",
    );
  const repositories = getServingManifestCommandDependencies();
  const attempt = await repositories.attempts.readAttempt(scope, appId<"attempt">(attemptId));
  if (!attempt?.servingManifestId)
    return failure("retry", "This activity is unavailable. Your choices are preserved.");
  const material = await repositories.content.readPinnedLearnerMaterial(
    scope,
    attempt.servingManifestId,
  );
  if (!material)
    return failure("retry", "This activity is unavailable. Your choices are preserved.");
  const payload = material.learnerPayload as TaskFamily;
  const fields = responseFields(payload);
  if (
    formData.get("intent") !== "submit" ||
    formData.get("confirmBoundary") !== attemptId ||
    formData.get("capturedFields") !== JSON.stringify(fields) ||
    fields.some((field) => !formData.has(field))
  ) {
    return failure(
      "invalid",
      "The whole response was not captured. Review the form before submitting. No result was recorded.",
    );
  }
  const invalid = responseIssues(payload, values);
  if (invalid.length)
    return failure(
      "invalid",
      "Review the marked answers. Use each restricted choice only once. Your other choices are preserved.",
      invalid,
    );
  const operations = formOperations(values, attemptId);
  const responseDigest = canonicalResponseDigest(canonicalizeResponse(operations).response);
  const expectedVersion = Number(formData.get("expectedVersion"));
  const sequence = Number(formData.get("sequence"));
  const checkpoint = await handleCheckpointAttempt(dependencies, token, attemptId, {
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
  }).catch(() => undefined);
  if (!checkpoint?.ok)
    return failure(
      "retry",
      "Another saved response may need review. Your choices remain here. Reload to compare saved work before retrying.",
    );
  const submitted = await handleSubmitAttempt(dependencies, token, attemptId, {
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
        elapsedMs: 0,
        exposureClass: "unseen",
        independenceClass: "first_attempt",
        assistanceUsed: [],
        accessibilityEquivalence: "equivalent",
      },
    },
  }).catch(() => undefined);
  if (!submitted?.ok)
    return failure(
      "retry",
      "Your response is saved. The result could not be confirmed. Retry this same submission.",
    );
  redirect(`/attempt/${attemptId}/result`);
}
