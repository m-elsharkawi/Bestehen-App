"use client";

import { AppShell } from "@bestehen/design-system";

export default function ErrorPage({ reset }: { readonly reset: () => void }) {
  return (
    <AppShell kind="bare" title="This view is unavailable">
      <p>This wasn't you. Saved work and accepted evidence have not been changed.</p>
      <button className="action action-primary" onClick={reset} type="button">
        Try this view again
      </button>
    </AppShell>
  );
}
