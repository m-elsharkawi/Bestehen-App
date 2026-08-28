/**
 * The accessibility manifest and the publication gate of `Architecture/09-…` §8.3.
 *
 * The gate is a hard publication requirement, not a checklist to weigh: a manifest that cannot
 * satisfy a requirement blocks publication. The one thing the gate never produces is a learner
 * consequence — if an accessibility support changes target conditions, the task stays fair practice
 * at its actual conditions and the *claim* narrows. That is recorded here as a narrowed claim, never
 * as a failure attributed to the learner.
 */

/** When an answer-bearing transcript may appear. `never` and phase gating are the safe defaults. */
export const transcriptRevealPhases = ["never", "after_attempt", "after_block"] as const;
export type TranscriptRevealPhase = (typeof transcriptRevealPhases)[number];

export const imageRoles = ["informative", "decorative"] as const;
export type ImageRole = (typeof imageRoles)[number];

export interface AccessibleImage {
  readonly imageRef: string;
  readonly role: ImageRole;
  /** Meaningful alternative text. `null` is only correct for an explicitly decorative image. */
  readonly altText: string | null;
}

/**
 * A support the artifact claims to offer. `actuallySupported` is the honest fact; no inaccessible
 * alternative may be silently claimed equivalent, and where support is partial the claim narrows
 * into the evidence envelope rather than being asserted whole.
 */
export interface AccessibilitySupportClaim {
  readonly supportKind: string;
  readonly actuallySupported: boolean;
  readonly claimNarrowedTo: string | null;
}

export interface AccessibilityResponseMechanic {
  /** A semantic mechanic — roles, names and states — rather than a positional pointer gesture. */
  readonly semantic: boolean;
  /** A keyboard select-then-place path exists alongside any drag behaviour. */
  readonly keyboardSelectThenPlace: boolean;
  /** That path is identical in evidence to the drag path: same operation, same score. */
  readonly evidenceEquivalentToDrag: boolean;
}

export interface AccessibilityPlaybackControls {
  readonly accessibleLabels: boolean;
  readonly keyboardOperable: boolean;
}

export interface AccessibilityManifest {
  readonly accessibilityManifestId: string;
  /** What the artifact actually contains, which decides which requirements apply. */
  readonly surface: {
    readonly hasAudioInstructions: boolean;
    readonly hasListeningMedia: boolean;
    readonly hasDragInteraction: boolean;
    readonly hasQuestionBearingImage: boolean;
  };
  readonly writtenInstructionsPresent: boolean;
  readonly transcript: {
    readonly available: boolean;
    readonly captionsAvailable: boolean;
    readonly revealPhase: TranscriptRevealPhase;
  };
  readonly images: readonly AccessibleImage[];
  /** An equivalent, target-valid path exists for anything a question asks about an image. */
  readonly equivalentTargetValidPath: boolean;
  readonly responseMechanic: AccessibilityResponseMechanic;
  readonly focusAndReadOrderDeclared: boolean;
  /** BCP 47 language tag for the artifact's content. */
  readonly languageTag: string;
  readonly textNotTruncated: boolean;
  readonly zoomAndReflowSuitable: boolean;
  /** `true` means some state is conveyed by colour alone, which is never permitted. */
  readonly colorOnlyState: boolean;
  readonly playbackControls: AccessibilityPlaybackControls | null;
  readonly supportClaims: readonly AccessibilitySupportClaim[];
}

export const accessibilityGateCodes = [
  "audio_instructions_without_written_text",
  "listening_without_transcript_or_captions",
  "transcript_reveal_phase_unset",
  "informative_image_without_alt_text",
  "decorative_image_with_alt_text",
  "image_only_question_without_equivalent_path",
  "response_mechanic_not_semantic",
  "drag_without_keyboard_path",
  "keyboard_path_not_evidence_equivalent",
  "focus_and_read_order_undeclared",
  "language_tag_missing_or_malformed",
  "text_truncated",
  "zoom_or_reflow_unsuitable",
  "color_only_state",
  "playback_controls_not_accessible",
  "unsupported_claim_asserted_as_equivalent",
] as const;
export type AccessibilityGateCode = (typeof accessibilityGateCodes)[number];

export interface AccessibilityFinding {
  readonly code: AccessibilityGateCode;
  readonly requirement: string;
  readonly detail: string;
}

export interface AccessibilityGateResult {
  readonly status: "pass" | "blocked";
  readonly findings: readonly AccessibilityFinding[];
  /**
   * Claims that hold only in a narrowed form. These do not block publication: the task remains fair
   * practice at its actual conditions, and the narrowing travels with the evidence envelope.
   */
  readonly narrowedClaims: readonly AccessibilitySupportClaim[];
}

const languageTagPattern = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

/**
 * The publication gate. Every requirement of `Architecture/09-…` §8.3 that applies to the declared
 * surface must hold; anything unmet blocks publication rather than degrading the artifact.
 */
export function evaluateAccessibilityGate(
  manifest: AccessibilityManifest,
): AccessibilityGateResult {
  const findings: AccessibilityFinding[] = [];
  const add = (code: AccessibilityGateCode, requirement: string, detail: string): void => {
    findings.push({ code, requirement, detail });
  };

  if (manifest.surface.hasAudioInstructions && !manifest.writtenInstructionsPresent) {
    add(
      "audio_instructions_without_written_text",
      "Written instructions accompany audio instructions.",
      "The artifact plays instructions with no written equivalent.",
    );
  }

  if (manifest.surface.hasListeningMedia) {
    if (!manifest.transcript.available && !manifest.transcript.captionsAvailable) {
      add(
        "listening_without_transcript_or_captions",
        "Listening and repair carry a transcript or captions.",
        "No transcript and no captions are declared for listening media.",
      );
    }
    if (manifest.transcript.available && manifest.transcript.revealPhase === "never") {
      add(
        "transcript_reveal_phase_unset",
        "A transcript declares the phase at which it may appear.",
        "A transcript exists but no reveal phase authorises showing it.",
      );
    }
  }

  for (const image of manifest.images) {
    if (image.role === "informative" && (image.altText === null || image.altText.trim() === "")) {
      add(
        "informative_image_without_alt_text",
        "Informative images carry meaningful alternative text.",
        `\`${image.imageRef}\` is informative with no alternative text.`,
      );
    }
    if (image.role === "decorative" && image.altText !== null) {
      add(
        "decorative_image_with_alt_text",
        "Decorative images declare a decorative role rather than describing themselves.",
        `\`${image.imageRef}\` is decorative but carries alternative text.`,
      );
    }
  }

  if (manifest.surface.hasQuestionBearingImage && !manifest.equivalentTargetValidPath) {
    add(
      "image_only_question_without_equivalent_path",
      "No image-only question without an equivalent target-valid path.",
      "A question depends on an image with no equivalent path to answer it.",
    );
  }

  if (!manifest.responseMechanic.semantic) {
    add(
      "response_mechanic_not_semantic",
      "The response mechanic is semantic.",
      "The mechanic depends on presentation rather than on roles, names and states.",
    );
  }
  if (!manifest.responseMechanic.keyboardSelectThenPlace) {
    add(
      "drag_without_keyboard_path",
      "A keyboard select-then-place path exists.",
      "Only a pointer or drag path is declared.",
    );
  } else if (!manifest.responseMechanic.evidenceEquivalentToDrag) {
    add(
      "keyboard_path_not_evidence_equivalent",
      "The keyboard path is identical in evidence to the drag path.",
      "A keyboard path exists but is not declared evidence-equivalent.",
    );
  }

  if (!manifest.focusAndReadOrderDeclared) {
    add(
      "focus_and_read_order_undeclared",
      "Focus and read order are declared.",
      "No focus or read order is recorded for the artifact.",
    );
  }
  if (!languageTagPattern.test(manifest.languageTag)) {
    add(
      "language_tag_missing_or_malformed",
      "The content declares a language tag.",
      `\`${manifest.languageTag}\` is not a well-formed language tag.`,
    );
  }
  if (!manifest.textNotTruncated) {
    add(
      "text_truncated",
      "Task, content-point and reason text is not truncated.",
      "The artifact declares truncated text.",
    );
  }
  if (!manifest.zoomAndReflowSuitable) {
    add(
      "zoom_or_reflow_unsuitable",
      "The artifact is suitable for zoom and reflow.",
      "The artifact declares itself unsuitable for zoom or reflow.",
    );
  }
  if (manifest.colorOnlyState) {
    add(
      "color_only_state",
      "No state is conveyed by colour alone.",
      "The artifact declares a colour-only state.",
    );
  }

  if (manifest.surface.hasListeningMedia) {
    const controls = manifest.playbackControls;
    if (controls === null || !controls.accessibleLabels || !controls.keyboardOperable) {
      add(
        "playback_controls_not_accessible",
        "Playback controls carry accessible labels and are keyboard operable.",
        "Listening media is declared with no accessible, keyboard-operable playback controls.",
      );
    }
  }

  const narrowedClaims: AccessibilitySupportClaim[] = [];
  for (const claim of manifest.supportClaims) {
    if (claim.actuallySupported) continue;
    if (claim.claimNarrowedTo === null) {
      add(
        "unsupported_claim_asserted_as_equivalent",
        "No inaccessible alternative is silently claimed equivalent.",
        `\`${claim.supportKind}\` is not actually supported and the claim was not narrowed.`,
      );
      continue;
    }
    narrowedClaims.push(claim);
  }

  return {
    status: findings.length === 0 ? "pass" : "blocked",
    findings,
    narrowedClaims,
  };
}
