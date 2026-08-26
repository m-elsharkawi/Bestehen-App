import { Action, AppShell, Icon, SemanticCard } from "@bestehen/design-system";
import { safeHeldDestination } from "../server/frontend-data";

export default async function PersonalEntryPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly returnTo?: string | string[] }>;
}) {
  const destination = safeHeldDestination((await searchParams).returnTo);
  return (
    <AppShell
      eyebrow="Private personal release"
      kind="bare"
      title="Evidence you can inspect. Practice you can act on."
    >
      <p>Bestehen uses the owner's signed-in account. Registration is closed.</p>
      <Action
        href={`/auth/login?returnTo=${encodeURIComponent(destination)}`}
        label="Sign in with an email code"
      />
      <SemanticCard title="What sign-in protects">
        <p>
          <Icon name="lock" /> Your attempts, evidence, and saved work stay inside the private
          account boundary.
        </p>
      </SemanticCard>
    </AppShell>
  );
}
