import { requirePersonalSession } from "../../../server/frontend-data";
import { TrainView } from "../../../ui/archetypes";

export default async function TrainPage() {
  await requirePersonalSession("/train");
  return <TrainView />;
}
