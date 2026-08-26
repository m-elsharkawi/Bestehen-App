import { requirePersonalSession } from "../../../../server/frontend-data";
import { AccountView } from "../../../../ui/archetypes";

export default async function DataSettingsPage() {
  await requirePersonalSession("/settings/data");
  return <AccountView data />;
}
