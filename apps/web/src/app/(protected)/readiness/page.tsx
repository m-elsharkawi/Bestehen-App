import { requirePersonalSession } from "../../../server/frontend-data";
import { ReadinessView } from "../../../ui/archetypes";

export default async function ReadinessPage() {
  await requirePersonalSession("/readiness");
  return <ReadinessView />;
}
