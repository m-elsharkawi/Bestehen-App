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

/** A learner-safe option. Its ID is semantic identity, never a presentation position. */
export interface ObjectiveOptionContract {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
}

/** Server-owned selection state rendered by the native answer-choice control. */
export interface AnswerChoiceContract {
  readonly itemLabel: string;
  readonly options: readonly ObjectiveOptionContract[];
  readonly selectedIds?: readonly string[];
  readonly disabled?: boolean;
  readonly onSelect?: (optionId: string) => void;
}

/** The semantic identities and current response for one select-then-place match set. */
export interface MatchingPairContract {
  readonly itemLabel: string;
  readonly prompts: readonly ObjectiveOptionContract[];
  readonly destinations: readonly ObjectiveOptionContract[];
  readonly selectedPromptId?: string;
  readonly matches?: Readonly<Record<string, string>>;
  readonly disabled?: boolean;
  readonly onSelectPrompt?: (promptId: string) => void;
  readonly onPlace?: (promptId: string, destinationId: string) => void;
  readonly onClear?: (promptId: string) => void;
}

/** Shared-bank state for SB2. A used candidate remains named, but cannot be placed twice. */
export interface SharedBankContract {
  readonly itemLabel: string;
  readonly candidates: readonly ObjectiveOptionContract[];
  readonly selectedCandidateId?: string;
  readonly placements?: Readonly<Record<string, string>>;
  readonly reusePolicy: "at_most_once" | "unrestricted";
  readonly onSelectCandidate?: (candidateId: string) => void;
  readonly onPlaceCandidate?: (gapId: string, candidateId: string) => void;
  readonly onRemoveCandidate?: (gapId: string) => void;
}

export interface DecisiveEvidenceContract {
  readonly excerpt: string;
  readonly language?: string;
  readonly relation: string;
  readonly condition: string;
  readonly recordedAt: { readonly dateTime: string; readonly label: string };
}

export type ListeningPresentationState =
  | "preflight"
  | "ready"
  | "playing"
  | "paused"
  | "unavailable";

/** Presentation contract only. The media island owns playback and the server owns authorization. */
export interface ListeningRegionContract {
  readonly title?: string;
  readonly audio: { readonly src: string; readonly language?: string; readonly label: string };
  readonly state: ListeningPresentationState;
  readonly remainingPlays: number;
  /** Omit to preserve the accepted player policy: Pause is available while playing. */
  readonly pauseAllowed?: boolean;
  readonly unavailableReason?: string;
  readonly transcript:
    | { readonly phase: "unavailable"; readonly reason: string }
    | {
        readonly phase: "available";
        readonly label: string;
        readonly text: string;
        readonly language?: string;
      };
  readonly onTransport?: (action: "play" | "pause" | "replay") => void;
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
