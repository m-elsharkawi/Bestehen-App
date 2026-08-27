import { AppShell, SessionNotice } from "@bestehen/design-system";

export default function SignInFailurePage() {
  return (
    <AppShell kind="bare" title="Sign-in unavailable">
      <SessionNotice state="callback_failed" />
    </AppShell>
  );
}
