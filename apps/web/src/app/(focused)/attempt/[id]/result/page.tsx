import { loadResultProjection } from "../../../../../server/frontend-data";
import { ResultView } from "../../../../../ui/archetypes";
import { notFound } from "next/navigation";

export default async function AttemptResultPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projection = await loadResultProjection(id, `/attempt/${id}/result`);
  if (!projection) notFound();
  return (
    <ResultView
      decisiveEvidence={projection.evidence.map((entry) => ({
        relation: String(entry.contentItemId),
        text: String(
          (entry.decisiveEvidence as { safeRevealSpanOrRelation?: string })
            .safeRevealSpanOrRelation ?? "Recorded evidence is available.",
        ),
      }))}
      validity={projection.submission.validity.state}
    />
  );
}
