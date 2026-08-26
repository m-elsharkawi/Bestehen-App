import { type ReactNode, useId } from "react";
import { Brand } from "./brand.js";
import type { NavigationDestination, ShellSlots } from "./contracts.js";
import { Icon, type IconName } from "./icons.js";
import { LiveRegions } from "./primitives.js";

const destinations: readonly [NavigationDestination, string, IconName][] = [
  ["coach", "Coach", "coach"],
  ["readiness", "Readiness", "readiness"],
  ["train", "Train", "train"],
  ["progress", "Progress", "progress"],
];

function PrimaryNavigation({ active }: { readonly active: NavigationDestination | undefined }) {
  return (
    <nav aria-label="Primary" className="primary-nav">
      <ul>
        {destinations.map(([id, label, icon]) => (
          <li key={id}>
            <a aria-current={active === id ? "page" : undefined} href={`/${id}`}>
              <Icon name={icon} />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppShell({
  title,
  eyebrow,
  activeDestination,
  kind = "protected",
  children,
  banner,
  aside,
  backHref,
}: ShellSlots) {
  const mainId = useId();
  const focused = kind === "focused";
  const bare = kind === "bare";
  return (
    <div className={`app-shell shell-${kind}`}>
      <a className="skip-link" href={`#${mainId}`}>
        Skip to main content
      </a>
      <header className="app-header">
        <a aria-label="Bestehen App home" href="/">
          <Brand compact={focused} />
        </a>
        {!bare && !focused ? (
          <a className="account-link" href="/settings">
            <Icon name="lock" />
            Account
          </a>
        ) : null}
      </header>
      {!bare && !focused ? <PrimaryNavigation active={activeDestination} /> : null}
      <main id={mainId} tabIndex={-1}>
        {backHref ? (
          <a className="back-link" href={backHref}>
            Back
          </a>
        ) : null}
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {banner}
        <div className={aside ? "content-with-aside" : "content-column"}>
          <div>{children}</div>
          {aside ? <aside aria-label="Supporting evidence">{aside}</aside> : null}
        </div>
      </main>
      {!bare && !focused ? (
        <footer>
          <small>Private personal release</small>
        </footer>
      ) : null}
      <LiveRegions />
    </div>
  );
}

export function AttemptShell({
  title,
  conditions,
  children,
  action,
}: {
  readonly title: string;
  readonly conditions: readonly string[];
  readonly children: ReactNode;
  readonly action: ReactNode;
}) {
  return (
    <AppShell eyebrow="Focused practice" kind="focused" title={title}>
      <ul aria-label="Attempt conditions" className="conditions-row">
        {conditions.map((condition) => (
          <li key={condition}>{condition}</li>
        ))}
      </ul>
      <div className="attempt-content">{children}</div>
      <div className="sticky-action">{action}</div>
    </AppShell>
  );
}

export function MockShell({
  children,
  remaining,
}: {
  readonly children: ReactNode;
  readonly remaining: string;
}) {
  return (
    <AppShell eyebrow="Measured mock" kind="focused" title="Written mock">
      <p className="timer">
        <Icon name="measured-time" /> <span>Time remaining</span> <time>{remaining}</time>
      </p>
      <div className="mock-measure">{children}</div>
    </AppShell>
  );
}
