import { AppShell } from "@bestehen/design-system";

export default function LoadingPage() {
  return (
    <AppShell kind="bare" title="Loading">
      <p aria-live="polite" role="status">
        Loading the requested view.
      </p>
      <div aria-hidden="true" className="skeleton">
        &nbsp;
      </div>
    </AppShell>
  );
}
