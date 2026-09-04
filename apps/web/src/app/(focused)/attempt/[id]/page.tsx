import { notFound } from "next/navigation";
import {
  isSyntheticFixtureRequest,
  loadAttemptProjection,
  requirePersonalSession,
} from "../../../../server/frontend-data";
import { AttemptView } from "../../../../ui/archetypes";
import { RuntimeAttemptView } from "../../../../ui/attempt-runtime-view";
import { submitObjectiveForm } from "./actions";
import type { ResponseOperation } from "@bestehen/content";

export default async function AttemptPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (await isSyntheticFixtureRequest()) {
    await requirePersonalSession(`/attempt/${id}`);
    return <AttemptView />;
  }
  const projection = await loadAttemptProjection(id, `/attempt/${id}`);
  if (!projection) notFound();
  const kind = projection.attempt.modality === "language_elements" ? "language" : "reading";
  return (
    <RuntimeAttemptView
      action={submitObjectiveForm}
      attemptId={id}
      kind={kind}
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
      restoredOperations={
        (projection.recovery?.checkpoints.find(
          (c) => c.sequence === projection.recovery?.acknowledgedCheckpointSequence,
        )?.operations ?? []) as readonly ResponseOperation[]
      }
    />
  );
}
