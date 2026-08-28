import { evidenceValidityStates, readinessStates } from "@bestehen/domain";

export const uiProjectionVersion = { major: 1, minor: 0 } as const;

export const semanticStatuses = ["neutral", "positive", "attention", "risk", "system"] as const;
export type SemanticStatus = (typeof semanticStatuses)[number];

export const announcementPriorities = ["none", "polite", "assertive"] as const;
export type AnnouncementPriority = (typeof announcementPriorities)[number];

export const uiCapabilityStates = [
  "processing",
  "slow",
  "pending",
  "partial",
  "unavailable",
  "retry_fresh",
] as const;
export type UiCapabilityState = (typeof uiCapabilityStates)[number];

export const sessionNoticeStates = [
  "signed_out",
  "callback_failed",
  "expired_idle",
  "expired_mid_attempt",
  "access_denied",
] as const;
export type SessionNoticeState = (typeof sessionNoticeStates)[number];

export const transferStates = [
  "preparing",
  "sending",
  "queued_offline",
  "retrying",
  "not_sent",
  "sent",
] as const;
export type TransferState = (typeof transferStates)[number];

export const exportStates = ["requested", "building", "ready", "expired", "failed"] as const;
export type ExportState = (typeof exportStates)[number];

export const deletionStates = [
  "recent_auth_required",
  "confirmation_required",
  "revoking",
  "purge_running",
  "provider_pending",
  "live_purge_complete",
  "completed",
] as const;
export type DeletionState = (typeof deletionStates)[number];

export const draftConflictStates = ["compare", "select", "merge"] as const;
export type DraftConflictState = (typeof draftConflictStates)[number];

/**
 * Server-owned content serving states (`Architecture/09-…` §9.2). Missing, unknown, quarantined or
 * incompatible content renders no score, zero, weakness or probability field in any of them.
 */
export const contentServingStates = [
  "available",
  "loading_media",
  "unavailable_no_fresh_family",
  "unavailable_rights_or_target",
  "quarantined_after_pin",
  "media_failed_not_counted",
  "replacement_ready",
  "update_required",
] as const;
export type ContentServingState = (typeof contentServingStates)[number];

/**
 * Client-visible attempt runtime states. `ready`, `interrupted` and `unavailable` are already
 * carried by existing unions and are deliberately reused rather than duplicated here.
 */
export const attemptRuntimeUiStates = [
  "acquiring_manifest",
  "in_progress",
  "checkpointed",
  "submission_unknown",
  "submitted",
  "scoring",
  "result_available",
] as const;
export type AttemptRuntimeUiState = (typeof attemptRuntimeUiStates)[number];

export interface UiProjectionBase<State extends string> {
  readonly contract: typeof uiProjectionVersion;
  readonly state: State;
  readonly title: string;
  readonly message: string;
  readonly status: SemanticStatus;
  readonly affectedScope: readonly string[];
  readonly announcement: AnnouncementPriority;
  readonly focusTarget: "heading" | "error_summary" | "action" | "none";
  readonly action?: { readonly label: string; readonly href: string };
  readonly source: { readonly release: string; readonly sourceCut: number };
}

export type ValidityState = (typeof evidenceValidityStates)[number];
export type ReadinessState = (typeof readinessStates)[number];

export const consequentialUiProjectionStates = [
  ...evidenceValidityStates,
  ...readinessStates,
  ...uiCapabilityStates,
  ...sessionNoticeStates,
  ...transferStates,
  ...exportStates,
  ...deletionStates,
  ...draftConflictStates,
  ...contentServingStates,
  ...attemptRuntimeUiStates,
] as const;
export type ConsequentialUiProjectionState = (typeof consequentialUiProjectionStates)[number];

export type ConsequentialUiProjection =
  | UiProjectionBase<ValidityState>
  | UiProjectionBase<ReadinessState>
  | UiProjectionBase<UiCapabilityState>
  | UiProjectionBase<SessionNoticeState>
  | UiProjectionBase<TransferState>
  | UiProjectionBase<ExportState>
  | UiProjectionBase<DeletionState>
  | UiProjectionBase<DraftConflictState>
  | UiProjectionBase<ContentServingState>
  | UiProjectionBase<AttemptRuntimeUiState>;

export function statusForState(state: ConsequentialUiProjection["state"]): SemanticStatus {
  switch (state) {
    case "valid":
    case "safe":
    case "ready_to_book":
    case "ready":
    case "sent":
    case "completed":
    case "available":
    case "replacement_ready":
    case "result_available":
      return "positive";
    case "borderline":
    case "pending":
    case "slow":
    case "partial":
    case "provider_pending":
    case "quarantined_after_pin":
    case "submission_unknown":
    case "update_required":
      return "attention";
    case "not_ready":
    case "failed":
    case "not_sent":
    case "access_denied":
      return "risk";
    case "partially_valid":
    case "interrupted":
    case "not_counted":
    case "evidence_building":
    case "stale_contradicted":
    case "processing":
    case "unavailable":
    case "retry_fresh":
    case "signed_out":
    case "callback_failed":
    case "expired_idle":
    case "expired_mid_attempt":
    case "preparing":
    case "sending":
    case "queued_offline":
    case "retrying":
    case "requested":
    case "building":
    case "expired":
    case "recent_auth_required":
    case "confirmation_required":
    case "revoking":
    case "purge_running":
    case "live_purge_complete":
    case "compare":
    case "select":
    case "merge":
    case "loading_media":
    case "unavailable_no_fresh_family":
    case "unavailable_rights_or_target":
    case "media_failed_not_counted":
    case "acquiring_manifest":
    case "in_progress":
    case "checkpointed":
    case "submitted":
    case "scoring":
      return "system";
  }
}

export function isSupportedUiProjection(value: {
  readonly contract: { readonly major: number; readonly minor: number };
  readonly state: string;
}): boolean {
  if (value.contract.major !== uiProjectionVersion.major) return false;
  return new Set<string>(consequentialUiProjectionStates).has(value.state);
}
