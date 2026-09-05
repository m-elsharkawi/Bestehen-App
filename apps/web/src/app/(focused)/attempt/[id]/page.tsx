import { notFound } from "next/navigation";
import {
  isSyntheticFixtureRequest,
  loadAttemptProjection,
  attemptReturnPathForAuthentication,
  requirePersonalSession,
} from "../../../../server/frontend-data";
import { AttemptView } from "../../../../ui/archetypes";
import { RuntimeAttemptView } from "../../../../ui/attempt-runtime-view";
import { submitObjectiveForm } from "./actions";
import type { ResponseOperation } from "@bestehen/content";

export default async function AttemptPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ id: string }>;
  readonly searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { id } = await params;
  const returnPath = attemptReturnPathForAuthentication(id, (await searchParams).returnTo);
  if (await isSyntheticFixtureRequest()) {
    await requirePersonalSession(returnPath);
    return <AttemptView />;
  }
  const projection = await loadAttemptProjection(id, returnPath);
  if (!projection) notFound();
  const kind =
    projection.attempt.modality === "language_elements"
      ? "language"
      : projection.attempt.modality === "listening"
        ? "listening"
        : "reading";
  return (
    <RuntimeAttemptView
      action={submitObjectiveForm}
      attemptId={id}
      kind={kind}
      instruction={projection.material.instruction}
      learnerPayload={projection.material.learnerPayload}
      nextSequence={
        (projection.recovery?.acknowledgedCheckpointSequence ??
          projection.attempt.acknowledgedCheckpointSequence) + 1
      }
      resourceVersion={projection.recovery?.resourceVersion ?? projection.attempt.resourceVersion}
      {...(projection.attempt.occurredAt
        ? { startedAt: projection.attempt.occurredAt.toISOString() }
        : {})}
      state={projection.attempt.state}
      continuityScope={projection.continuityScope}
      {...(projection.preAttemptExposureClass
        ? { preAttemptExposureClass: projection.preAttemptExposureClass }
        : {})}
      restoredOperations={
        (projection.recovery?.checkpoints.find(
          (c) => c.sequence === projection.recovery?.acknowledgedCheckpointSequence,
        )?.operations ?? []) as readonly ResponseOperation[]
      }
    />
  );
}
