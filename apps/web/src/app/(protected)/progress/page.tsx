import { requirePersonalSession } from "../../../server/frontend-data";
import { ProgressView } from "../../../ui/archetypes";

export default async function ProgressPage() {
  await requirePersonalSession("/progress");
  return <ProgressView />;
}
