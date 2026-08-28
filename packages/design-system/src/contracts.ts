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
  /** Extra header-flow utility controls, placed before the shell's own controls. */
  readonly utilityHeader?: ReactNode;
  /**
   * Main/aside width ratio for the `content-with-aside` grid at >=1024px.
   * "default" is the 2:1 split (LG-D2 readiness, LG-V3 progress, LG-V7).
   * "narrow-aside" is the 7:5 (1.4) split required by LG-D1 (coach).
   */
  readonly contentSplit?: "default" | "narrow-aside";
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
  "available",
  "loading_media",
  "unavailable_no_fresh_family",
  "unavailable_rights_or_target",
  "quarantined_after_pin",
  "media_failed_not_counted",
  "replacement_ready",
  "update_required",
  "acquiring_manifest",
  "in_progress",
  "checkpointed",
  "submission_unknown",
  "submitted",
  "scoring",
  "result_available",
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
