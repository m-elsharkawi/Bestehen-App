import type { ReactNode } from "react";

export interface BaselineShellProps {
  readonly title: string;
  readonly children: ReactNode;
}

/** A deliberately neutral semantic shell. Product design arrives in Stage 04. */
export function BaselineShell({ title, children }: BaselineShellProps) {
  return (
    <div className="baseline-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="baseline-header">
        <span aria-hidden="true" className="baseline-mark">
          B
        </span>
        <span>Bestehen</span>
      </header>
      <main id="main-content" tabIndex={-1}>
        <h1>{title}</h1>
        {children}
      </main>
      <footer>
        <small>Repository baseline · no learner capability is active</small>
      </footer>
    </div>
  );
}
