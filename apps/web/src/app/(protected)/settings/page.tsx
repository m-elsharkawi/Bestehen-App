import { requirePersonalSession } from "../../../server/frontend-data";
import { AccountView } from "../../../ui/archetypes";

export default async function SettingsPage() {
  await requirePersonalSession("/settings");
  return <AccountView />;
}
