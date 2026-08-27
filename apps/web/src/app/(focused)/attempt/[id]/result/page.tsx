import { requirePersonalSession } from "../../../../../server/frontend-data";
import { ResultView } from "../../../../../ui/archetypes";

export default async function AttemptResultPage() {
  await requirePersonalSession("/attempt/current/result");
  return <ResultView />;
}
