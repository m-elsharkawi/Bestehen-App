import type { ReactNode } from "react";

export type NavigationDestination = "coach" | "readiness" | "train" | "progress";
export type ShellKind = "protected" | "bare" | "focused";

export interface ShellSlots {
  readonly title: string;
  readonly eyebrow?: string;
  readonly activeDestination?: NavigationDestination;
  readonly kind?: ShellKind;
  readonly children: ReactNode;
  readonly banner?: ReactNode;
  readonly aside?: ReactNode;
  readonly backHref?: string;
}

export interface ActionContract {
  readonly label: string;
  readonly href?: string;
  readonly variant?: "primary" | "secondary" | "quiet" | "destructive";
  readonly disabledReason?: string;
}

export interface SemanticCardContract {
  readonly title: string;
  readonly children: ReactNode;
  readonly status?: "neutral" | "positive" | "attention" | "risk" | "system";
  readonly headingLevel?: 2 | 3;
}

export const consequentialProjectionStates = [
  "valid",
  "partially_valid",
  "interrupted",
  "not_counted",
  "evidence_building",
  "not_ready",
  "borderline",
  "safe",
  "ready_to_book",
  "stale_contradicted",
  "processing",
  "slow",
  "pending",
  "partial",
  "unavailable",
  "retry_fresh",
  "signed_out",
  "callback_failed",
  "expired_idle",
  "expired_mid_attempt",
  "access_denied",
  "preparing",
  "sending",
  "queued_offline",
  "retrying",
  "not_sent",
  "sent",
  "requested",
  "building",
  "ready",
  "expired",
  "failed",
  "recent_auth_required",
  "confirmation_required",
  "revoking",
  "purge_running",
  "provider_pending",
  "live_purge_complete",
  "completed",
  "compare",
  "select",
  "merge",
] as const;
export type ConsequentialProjectionState = (typeof consequentialProjectionStates)[number];

/** Complete presentation-only form of the versioned server consequential projection. */
export interface ProjectionCardContract {
  readonly contract: { readonly major: 1; readonly minor: number };
  readonly state: ConsequentialProjectionState;
  readonly title: string;
  readonly message: string;
  readonly status: NonNullable<SemanticCardContract["status"]>;
  readonly affectedScope: readonly string[];
  readonly announcement: "none" | "polite" | "assertive";
  readonly focusTarget: "heading" | "error_summary" | "action" | "none";
  readonly action?: { readonly label: string; readonly href: string };
  readonly source: { readonly release: string; readonly sourceCut: number };
}

export function isSupportedProjectionCard(projection: {
  readonly contract: { readonly major: number };
  readonly state: string;
}): projection is ProjectionCardContract {
  return (
    projection.contract.major === 1 &&
    (consequentialProjectionStates as readonly string[]).includes(projection.state)
  );
}
