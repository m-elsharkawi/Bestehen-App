import { requirePersonalSession } from "../../../../server/frontend-data";
import { AttemptView } from "../../../../ui/archetypes";

export default async function AttemptPage() {
  await requirePersonalSession("/attempt/current");
  return <AttemptView />;
}
