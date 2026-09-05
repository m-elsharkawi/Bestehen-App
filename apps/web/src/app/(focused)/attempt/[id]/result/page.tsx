import { notFound } from "next/navigation";
import {
  isSyntheticFixtureRequest,
  loadResultProjection,
  requirePersonalSession,
} from "../../../../../server/frontend-data";
import { ResultView } from "../../../../../ui/archetypes";
import { projectLearnerResult } from "../../../../../ui/result-projection";
import { ListeningTranscriptIsland } from "../../../../../ui/islands/listening-transcript";

export default async function AttemptResultPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (await isSyntheticFixtureRequest()) {
    await requirePersonalSession(`/attempt/${id}/result`);
    return <ResultView />;
  }
  const projection = await loadResultProjection(id, `/attempt/${id}/result`);
  if (!projection) notFound();
  const result = projectLearnerResult(
    projection.submission,
    projection.evidence,
    projection.learnerPayload,
  );
  return (
    <>
      <ResultView
        backHref={
          projection.attempt.sessionId ? `/session/${projection.attempt.sessionId}` : "/coach"
        }
        projection={result}
        validity={projection.submission.validity.state}
      />
      {projection.attempt.modality === "listening" ? (
        <ListeningTranscriptIsland attemptId={id} />
      ) : null}
    </>
  );
}
