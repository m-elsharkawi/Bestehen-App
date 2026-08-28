import {
  AppShell,
  sessionNoticeTitle,
  SessionNotice,
  type SessionNoticeState,
} from "@bestehen/design-system";

export default async function SignInFailurePage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly code?: string; readonly returnTo?: string }>;
}) {
  const params = await searchParams;
  const state: SessionNoticeState =
    params.code === "identity_not_configured" ||
    params.code === "sign_in_unavailable" ||
    params.code === "sign_in_failed"
      ? params.code
      : "callback_failed";
  const returnTo = params.returnTo?.startsWith("/") ? params.returnTo : undefined;
  return (
    <AppShell kind="bare" title={sessionNoticeTitle(state)}>
      <SessionNotice state={state} returnTo={returnTo} />
    </AppShell>
  );
}
