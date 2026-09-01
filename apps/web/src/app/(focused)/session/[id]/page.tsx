import { requirePersonalSession } from "../../../../server/frontend-data";
import { SessionView } from "../../../../ui/archetypes";

export default async function SessionPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requirePersonalSession(`/session/${id}`);
  return <SessionView sessionId={id} />;
}
