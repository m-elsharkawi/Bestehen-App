import { notFound } from "next/navigation";
import {
  isSyntheticFixtureRequest,
  loadFoundationProjection,
  requirePersonalSession,
} from "../../../../server/frontend-data";
import { SessionView } from "../../../../ui/archetypes";
import { FoundationRuntimeView } from "../../../../ui/foundation-runtime-view";
import { saveAccessPreferences, saveTargetContext, startFoundationAttempt } from "./actions";

export default async function SessionPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (await isSyntheticFixtureRequest()) {
    await requirePersonalSession(`/session/${id}`);
    return <SessionView />;
  }
  const projection = await loadFoundationProjection(id, `/session/${id}`);
  if (!projection) notFound();
  return (
    <FoundationRuntimeView
      projection={projection}
      saveAccess={saveAccessPreferences}
      saveTarget={saveTargetContext}
      startAttempt={startFoundationAttempt}
    />
  );
}
