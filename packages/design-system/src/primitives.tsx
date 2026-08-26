import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ActionContract, SemanticCardContract } from "./contracts.js";

export function Action({ label, href, variant = "primary", disabledReason }: ActionContract) {
  if (href && !disabledReason) {
    return (
      <a className={`action action-${variant}`} href={href}>
        {label}
      </a>
    );
  }
  return (
    <span className="action-stack">
      <button
        className={`action action-${variant}`}
        disabled={Boolean(disabledReason)}
        type="button"
      >
        {label}
      </button>
      {disabledReason ? <span className="disabled-reason">{disabledReason}</span> : null}
    </span>
  );
}

export function NativeButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`action action-primary ${className}`} type="button" {...props}>
      {children}
    </button>
  );
}

export function SemanticCard({
  title,
  children,
  status = "neutral",
  headingLevel = 2,
}: SemanticCardContract) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section className="card" data-status={status}>
      <Heading>{title}</Heading>
      {children}
    </section>
  );
}

export function LiveRegions() {
  return (
    <>
      <div aria-atomic="true" aria-live="polite" className="visually-hidden" />
      <div aria-atomic="true" aria-live="assertive" className="visually-hidden" />
    </>
  );
}

export function StatusWord({
  children,
  status = "system",
}: {
  readonly children: ReactNode;
  readonly status?: "positive" | "attention" | "risk" | "system";
}) {
  return (
    <span className="status-word" data-status={status}>
      {children}
    </span>
  );
}
