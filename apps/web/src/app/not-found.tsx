import { Action, AppShell } from "@bestehen/design-system";

export default function NotFoundPage() {
  return (
    <AppShell kind="bare" title="Page not found">
      <p>That address does not match an available Bestehen view.</p>
      <Action href="/" label="Return to sign-in" />
    </AppShell>
  );
}
