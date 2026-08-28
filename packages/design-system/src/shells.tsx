import { type ReactNode, useId } from "react";
import { Brand } from "./brand.js";
import type { NavigationDestination, ShellSlots } from "./contracts.js";
import { Icon, type IconName } from "./icons.js";
import { ThemeControl } from "./theme-control.js";

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
  utilityHeader,
  embedded = false,
}: ShellSlots & { readonly embedded?: boolean }) {
  const mainId = useId();
  const focused = kind === "focused";
  const bare = kind === "bare";
  const Content = embedded ? "div" : "main";
  const Title = embedded ? "h3" : "h1";
  return (
    <div className={`app-shell shell-${kind}`}>
      {embedded ? null : (
        <a className="skip-link" href={`#${mainId}`}>
          Skip to main content
        </a>
      )}
      <header className="app-header">
        <a aria-label="Bestehen App home" href="/">
          <Brand compact={focused} />
        </a>
        {/* Utility slot: header-flow home for shell-level controls. An embedded
            shell is a gallery specimen, so it carries no live utility control. */}
        {embedded ? null : (
          <div className="header-utility">
            {utilityHeader}
            <ThemeControl />
            {!bare && !focused ? (
              <a className="account-link" href="/settings">
                <Icon name="lock" />
                Account
              </a>
            ) : null}
          </div>
        )}
      </header>
      {!bare && !focused ? <PrimaryNavigation active={activeDestination} /> : null}
      <Content id={mainId} tabIndex={embedded ? undefined : -1}>
        {backHref ? (
          <a className="back-link" href={backHref}>
            Back
          </a>
        ) : null}
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <Title>{title}</Title>
        {banner}
        <div className={aside ? "content-with-aside" : "content-column"}>
          <div>{children}</div>
          {aside ? <aside aria-label="Supporting evidence">{aside}</aside> : null}
        </div>
      </Content>
      {!bare && !focused ? (
        <footer>
          <small>Private personal release</small>
        </footer>
      ) : null}
    </div>
  );
}

export function AttemptShell({
  title,
  conditions,
  children,
  action,
  embedded = false,
}: {
  readonly title: string;
  readonly conditions: readonly string[];
  readonly children: ReactNode;
  readonly action: ReactNode;
  readonly embedded?: boolean;
}) {
  return (
    <AppShell embedded={embedded} eyebrow="Focused practice" kind="focused" title={title}>
      <ul aria-label="Attempt conditions" className="conditions-row">
        {conditions.map((condition) => (
          <li key={condition}>{condition}</li>
        ))}
      </ul>
      {/* Assertion hook: keeps attempt content identifiable in the component gallery. */}
      <div className="attempt-content">{children}</div>
      <div className="sticky-action">{action}</div>
    </AppShell>
  );
}

export function MockShell({
  children,
  remaining,
  interrupted = false,
  embedded = false,
}: {
  readonly children: ReactNode;
  readonly remaining: string;
  readonly interrupted?: boolean;
  readonly embedded?: boolean;
}) {
  return (
    <AppShell embedded={embedded} eyebrow="Measured mock" kind="focused" title="Written mock">
      <p className="timer">
        <Icon name="measured-time" /> <span>Time remaining</span> <time>{remaining}</time>
      </p>
      {interrupted ? (
        <p role="status">This measured block was interrupted. Its final validity is not assumed.</p>
      ) : null}
      <div className="mock-measure">{children}</div>
    </AppShell>
  );
}
