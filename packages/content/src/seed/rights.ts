/**
 * Rights and accessibility for the Stage 05 seed corpus (decision D03).
 *
 * Every seed artifact is **class C3 — validated original practice**, authored for this repository.
 * No restricted exam source bytes were copied and no published exam text is reproduced, so the
 * rights answer is an *original-work* answer rather than a licence interpretation. That is the whole
 * reason D03 rejected public-domain reuse: public-domain status is a jurisdiction-specific legal
 * question this stage is not authorised to settle.
 *
 * A seed row without rights metadata is a defect, not an omission. `buildSeedRights` therefore fills
 * all eight field groups of `Architecture/09-…` §8.2 — there is no partial envelope and no default
 * that means "unknown".
 *
 * Two deliberate values worth stating plainly:
 *
 * - `authenticityConfidence` is `local_review`, never `documented_source`. The content is original,
 *   so there is no external source to document; claiming `documented_source` would collapse
 *   authenticity into permission, which §8.2 keeps separate on purpose.
 * - `download_offline` is `allowed_with_conditions`, not `allowed`. An offline copy outlives the
 *   serving lease that authorised it, so it carries a purge obligation. Recording that as a resolved
 *   condition is what makes the obligation enforceable rather than aspirational.
 */

import type { AppId } from "@bestehen/domain";
import type { AccessibilityManifest, AccessibilitySupportClaim } from "../accessibility.js";
import type { RightsCondition, RightsEnvelope } from "../rights.js";
import { seedUuid } from "./identity.js";

/** The learner-facing credit for App-original practice. Never an implied provider endorsement. */
export const seedAttributionText = "Bestehen practice material";

/** Recorded in the provenance note, not in the learner-facing credit. */
export const seedAuthorOfRecord = "Bestehen (Stage 05 seed)";

export const seedLicenceIdentifier = "proprietary-internal";
export const seedGroundingManifest = "originally-authored";
export const seedEffectiveFrom = "2026-09-01T00:00:00.000Z";

/**
 * The offline-copy obligation. It is `resolved: true` because the App can actually satisfy it — the
 * media route derives `Cache-Control` from this envelope and the lease bounds the copy. An
 * unresolved condition would deny the action outright, which is the correct behaviour for an
 * obligation nobody can currently meet, and is not the situation here.
 */
export const seedOfflineCopyCondition: RightsCondition = {
  conditionId: "seed-offline-copy-purge",
  kind: "other_obligation",
  appliesToActions: ["download_offline"],
  resolved: true,
  obligation:
    "An offline copy is bound to the serving lease that authorised it and is purged when the lease ends or the envelope is withdrawn.",
};

export interface SeedRightsInput {
  readonly envelopeKey: string;
  readonly componentRef: string;
  readonly componentKind: "text" | "audio" | "composite";
  /** `withdrawn` builds the withdrawal fixture's successor envelope. */
  readonly state?: "current" | "withdrawn";
  readonly note?: string;
  readonly revision?: number;
  readonly incidentReason?: string;
}

/**
 * One complete envelope. `display`, `reproduce`, `adapt`, `generate_from`, `cache` and
 * `transform_transcode` are `allowed` because the App owns the work outright; `download_offline`
 * carries its obligation. There is no territory or audience limit, so no action is narrowed by one.
 */
export function buildSeedRights(input: SeedRightsInput): RightsEnvelope {
  const state = input.state ?? "current";
  return {
    identity: {
      rightsEnvelopeId: seedUuid("rights_envelope", input.envelopeKey) as AppId<"rights_envelope">,
      revision: input.revision ?? 1,
      sourceRef: null,
      sourceComponentRevision: null,
      state,
      effectiveFrom: seedEffectiveFrom,
    },
    separateTrust: {
      authenticityConfidence: "local_review",
      qaReferences: ["content-qa-gates/v1", "seed-provenance/v1"],
    },
    actionEligibility: {
      actions: {
        display: "allowed",
        reproduce: "allowed",
        adapt: "allowed",
        generate_from: "allowed",
        cache: "allowed",
        download_offline: "allowed_with_conditions",
        transform_transcode: "allowed",
      },
      territoryLimit: null,
      audienceLimit: null,
    },
    conditions: [seedOfflineCopyCondition],
    exactCredit: {
      attributionRequired: false,
      authorOrRightsholder: seedAttributionText,
      titleOrSource: null,
      requiredLink: null,
      licenceIdentifier: seedLicenceIdentifier,
      licenceNoticeText: null,
      modificationNotice: null,
      placementRule: null,
    },
    componentScope: {
      componentRef: input.componentRef,
      componentKind: input.componentKind,
    },
    provenance: {
      corpusBundleRef: null,
      rightsDecisionRef: null,
      sourceRevisionRef: null,
      groundingManifest: seedGroundingManifest,
      note:
        input.note ??
        `Authored for this repository by ${seedAuthorOfRecord}. No restricted source expression was consulted and no published exam text is reproduced.`,
    },
    incidentDisposition:
      state === "withdrawn"
        ? {
            reason:
              input.incidentReason ??
              "Seed withdrawal fixture: the artifact is retired from serving so the withdrawal path has a real subject.",
            purgeOrTombstoneConstraint:
              "Tombstone retained: the work is App-original, so no byte purge obligation arises and history stays resolvable.",
            successorRef: null,
            affectedArtifactSelectors: [input.componentRef],
            reviewOwner: "owner:approver",
          }
        : null,
  };
}

const seedSupportClaims: readonly AccessibilitySupportClaim[] = [
  { supportKind: "keyboard_only_operation", actuallySupported: true, claimNarrowedTo: null },
  {
    supportKind: "screen_reader_state_announcement",
    actuallySupported: true,
    claimNarrowedTo: null,
  },
  { supportKind: "reflow_at_320_css_pixels", actuallySupported: true, claimNarrowedTo: null },
];

export interface SeedAccessibilityInput {
  readonly manifestKey: string;
  readonly hasListeningMedia: boolean;
}

/**
 * The accessibility manifest every seed artifact publishes with. Listening artifacts additionally
 * declare a transcript, captions, a reveal phase that is not `never`, and accessible keyboard
 * playback controls — all of which `evaluateAccessibilityGate` treats as hard requirements once
 * listening media is present.
 *
 * The transcript reveal phase is `after_attempt`, never `never` and never `during`: an
 * answer-bearing transcript shown during the attempt would hand the learner the key.
 */
export function buildSeedAccessibility(input: SeedAccessibilityInput): AccessibilityManifest {
  return {
    accessibilityManifestId: `seed-a11y-${input.manifestKey}`,
    surface: {
      hasAudioInstructions: input.hasListeningMedia,
      hasListeningMedia: input.hasListeningMedia,
      hasDragInteraction: false,
      hasQuestionBearingImage: false,
    },
    writtenInstructionsPresent: true,
    transcript: {
      available: input.hasListeningMedia,
      captionsAvailable: input.hasListeningMedia,
      revealPhase: input.hasListeningMedia ? "after_attempt" : "never",
    },
    images: [],
    equivalentTargetValidPath: true,
    responseMechanic: {
      semantic: true,
      keyboardSelectThenPlace: true,
      evidenceEquivalentToDrag: true,
    },
    focusAndReadOrderDeclared: true,
    languageTag: "de",
    textNotTruncated: true,
    zoomAndReflowSuitable: true,
    colorOnlyState: false,
    playbackControls: input.hasListeningMedia
      ? { accessibleLabels: true, keyboardOperable: true }
      : null,
    supportClaims: seedSupportClaims,
  };
}
