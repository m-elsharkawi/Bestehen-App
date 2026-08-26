import { requirePersonalSession } from "../../../../server/frontend-data";
import { MockView } from "../../../../ui/archetypes";

export default async function MockPage() {
  await requirePersonalSession("/mock/current");
  return <MockView />;
}
