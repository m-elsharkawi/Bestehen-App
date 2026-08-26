import { requirePersonalSession } from "../../../../server/frontend-data";
import { SessionView } from "../../../../ui/archetypes";

export default async function SessionPage() {
  await requirePersonalSession("/session/current");
  return <SessionView />;
}
