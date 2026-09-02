import {
  isSyntheticFixtureRequest,
  requirePersonalSession,
} from "../../../../server/frontend-data";
import { SessionView } from "../../../../ui/archetypes";

export default async function SessionPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requirePersonalSession(`/session/${id}`);
  if (await isSyntheticFixtureRequest()) return <SessionView />;
  return <SessionView sessionId={id} />;
}
