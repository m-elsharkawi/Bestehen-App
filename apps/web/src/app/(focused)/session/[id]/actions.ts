"use server";

import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAttemptCommandDependencies,
  getServingManifestCommandDependencies,
  stableId,
} from "../../../../server/attempt-command-runtime";
import { handleCreateAttempt } from "../../../../server/attempt-commands";
import { parseTargetExamContext } from "../../../../server/foundation-runtime";
import {
  loadFoundationProjection,
  saveFoundationPreference,
} from "../../../../server/frontend-data";
import { handleAcquireServingManifest } from "../../../../server/serving-manifest-commands";

function sessionIdFrom(formData: FormData): string {
  const value = String(formData.get("sessionId") ?? "");
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value)
    ? value
    : "";
}

export async function startFoundationAttempt(formData: FormData): Promise<void> {
  const sessionId = sessionIdFrom(formData);
  if (!sessionId) redirect("/coach");
  const returnPath = `/session/${sessionId}`;
  const projection = await loadFoundationProjection(sessionId, returnPath);
  if (!projection?.nextTaskFamily || !projection.activityOccurrenceId) {
    redirect(`${returnPath}?status=unavailable`);
  }
  const token = (await cookies()).get(appSessionCookie.name)?.value;
  const manifestOperation = stableId(
    "operation",
    `${sessionId}:${projection.nextTaskFamily}:foundation-manifest`,
  );
  const acquired = await handleAcquireServingManifest(
    getServingManifestCommandDependencies(),
    token,
    {
      contract: { major: 1, minor: 0 },
      operationId: manifestOperation,
      expectedVersion: 1,
      payload: {
        taskFamily: projection.nextTaskFamily,
        progressionProfile: "P2",
        activityOccurrenceId: projection.activityOccurrenceId,
      },
    },
  );
  if (!acquired.ok) redirect(`${returnPath}?status=content-unavailable`);
  const acquiredBody = (await acquired.json()) as {
    readonly servingManifestId?: unknown;
    readonly attemptId?: unknown;
  };
  if (
    typeof acquiredBody.servingManifestId !== "string" ||
    typeof acquiredBody.attemptId !== "string"
  ) {
    redirect(`${returnPath}?status=content-unavailable`);
  }
  const created = await handleCreateAttempt(getAttemptCommandDependencies(), token, {
    contract: { major: 1, minor: 0 },
    operationId: stableId("operation", `${sessionId}:${projection.nextTaskFamily}:attempt`),
    expectedVersion: 1,
    payload: {
      servingManifestId: acquiredBody.servingManifestId,
      activityOccurrenceId: projection.activityOccurrenceId,
    },
  });
  if (!created.ok) redirect(`${returnPath}?status=attempt-unavailable`);
  const createdBody = (await created.json()) as { readonly resourceId?: unknown };
  redirect(
    typeof createdBody.resourceId === "string"
      ? `/attempt/${createdBody.resourceId}`
      : `${returnPath}?status=attempt-unavailable`,
  );
}

export async function saveTargetContext(formData: FormData): Promise<void> {
  const sessionId = sessionIdFrom(formData);
  if (!sessionId) redirect("/coach");
  const returnPath = `/session/${sessionId}`;
  const mode = String(formData.get("mode") ?? "");
  const value = String(formData.get("value") ?? "");
  const context = parseTargetExamContext(mode, value);
  if (!context) redirect(`${returnPath}?status=target-invalid`);
  const saved = await saveFoundationPreference(
    sessionId,
    "target_exam_context_v1",
    context,
    returnPath,
  );
  redirect(`${returnPath}${saved ? "" : "?status=save-retry"}`);
}

export async function saveAccessPreferences(formData: FormData): Promise<void> {
  const sessionId = sessionIdFrom(formData);
  if (!sessionId) redirect("/coach");
  const returnPath = `/session/${sessionId}`;
  const saved = await saveFoundationPreference(
    sessionId,
    "access_preferences_v1",
    {
      reducedMotion: formData.has("reducedMotion"),
      forcedColors: formData.has("forcedColors"),
      audioAvailable: formData.has("audioAvailable"),
      captionsPreferred: formData.has("captionsPreferred"),
    },
    returnPath,
  );
  redirect(`${returnPath}${saved ? "" : "?status=save-retry"}`);
}
