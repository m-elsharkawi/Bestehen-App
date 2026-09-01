import { loadAttemptProjection } from "../../../../server/frontend-data";
import { AttemptView } from "../../../../ui/archetypes";
import { notFound } from "next/navigation";

export default async function AttemptPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projection = await loadAttemptProjection(id, `/attempt/${id}`);
  if (!projection) notFound();
  const kind = projection.attempt.modality === "language_elements" ? "language" : "reading";
  return <AttemptView attemptId={id} kind={kind} state={projection.attempt.state} />;
}
