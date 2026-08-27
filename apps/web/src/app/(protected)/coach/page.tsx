import { requirePersonalSession } from "../../../server/frontend-data";
import { CoachView } from "../../../ui/archetypes";

export default async function CoachPage() {
  await requirePersonalSession("/coach");
  return <CoachView />;
}
