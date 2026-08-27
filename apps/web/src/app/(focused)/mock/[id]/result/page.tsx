import { requirePersonalSession } from "../../../../../server/frontend-data";
import { MockView } from "../../../../../ui/archetypes";

export default async function MockResultPage() {
  await requirePersonalSession("/mock/current/result");
  return <MockView result />;
}
