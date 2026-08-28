import { describe, expect, it } from "vitest";
import {
  accessibilityGateCodes,
  evaluateAccessibilityGate,
  type AccessibilityManifest,
} from "./accessibility.js";

function manifest(overrides: Partial<AccessibilityManifest> = {}): AccessibilityManifest {
  return {
    accessibilityManifestId: "accessibility-manifest-0001",
    surface: {
      hasAudioInstructions: false,
      hasListeningMedia: false,
      hasDragInteraction: true,
      hasQuestionBearingImage: false,
    },
    writtenInstructionsPresent: true,
    transcript: { available: false, captionsAvailable: false, revealPhase: "never" },
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
    playbackControls: null,
    supportClaims: [],
    ...overrides,
  };
}

function codes(input: AccessibilityManifest): readonly string[] {
  return evaluateAccessibilityGate(input).findings.map((finding) => finding.code);
}

describe("accessibility publication gate (Architecture/09-… §8.3)", () => {
  it("passes a complete written-task manifest", () => {
    expect(evaluateAccessibilityGate(manifest())).toEqual({
      status: "pass",
      findings: [],
      narrowedClaims: [],
    });
  });

  it("requires written instructions when instructions are spoken", () => {
    expect(
      codes(
        manifest({
          surface: {
            hasAudioInstructions: true,
            hasListeningMedia: false,
            hasDragInteraction: false,
            hasQuestionBearingImage: false,
          },
          writtenInstructionsPresent: false,
        }),
      ),
    ).toContain("audio_instructions_without_written_text");
  });

  it("requires a transcript or captions and a reveal phase for listening media", () => {
    const listeningSurface = {
      hasAudioInstructions: false,
      hasListeningMedia: true,
      hasDragInteraction: false,
      hasQuestionBearingImage: false,
    } as const;
    const bare = codes(manifest({ surface: listeningSurface }));
    expect(bare).toContain("listening_without_transcript_or_captions");
    expect(bare).toContain("playback_controls_not_accessible");

    const ungated = codes(
      manifest({
        surface: listeningSurface,
        transcript: { available: true, captionsAvailable: true, revealPhase: "never" },
        playbackControls: { accessibleLabels: true, keyboardOperable: true },
      }),
    );
    expect(ungated).toEqual(["transcript_reveal_phase_unset"]);

    expect(
      evaluateAccessibilityGate(
        manifest({
          surface: listeningSurface,
          transcript: { available: true, captionsAvailable: true, revealPhase: "after_block" },
          playbackControls: { accessibleLabels: true, keyboardOperable: true },
        }),
      ).status,
    ).toBe("pass");
  });

  it("requires alt text for informative images and no alt text for decorative ones", () => {
    expect(
      codes(manifest({ images: [{ imageRef: "image-1", role: "informative", altText: "   " }] })),
    ).toContain("informative_image_without_alt_text");
    expect(
      codes(
        manifest({ images: [{ imageRef: "image-2", role: "decorative", altText: "Ein Foto" }] }),
      ),
    ).toContain("decorative_image_with_alt_text");
    expect(
      evaluateAccessibilityGate(
        manifest({
          images: [
            { imageRef: "image-3", role: "informative", altText: "Fahrplan der Linie 5" },
            { imageRef: "image-4", role: "decorative", altText: null },
          ],
        }),
      ).status,
    ).toBe("pass");
  });

  it("blocks an image-only question with no equivalent target-valid path", () => {
    expect(
      codes(
        manifest({
          surface: {
            hasAudioInstructions: false,
            hasListeningMedia: false,
            hasDragInteraction: false,
            hasQuestionBearingImage: true,
          },
          equivalentTargetValidPath: false,
        }),
      ),
    ).toContain("image_only_question_without_equivalent_path");
  });

  it("requires a semantic mechanic and an evidence-equivalent keyboard path", () => {
    expect(
      codes(
        manifest({
          responseMechanic: {
            semantic: false,
            keyboardSelectThenPlace: false,
            evidenceEquivalentToDrag: false,
          },
        }),
      ),
    ).toEqual(["response_mechanic_not_semantic", "drag_without_keyboard_path"]);
    expect(
      codes(
        manifest({
          responseMechanic: {
            semantic: true,
            keyboardSelectThenPlace: true,
            evidenceEquivalentToDrag: false,
          },
        }),
      ),
    ).toEqual(["keyboard_path_not_evidence_equivalent"]);
  });

  it("requires focus order, a language tag, untruncated text, reflow and no colour-only state", () => {
    expect(codes(manifest({ focusAndReadOrderDeclared: false }))).toEqual([
      "focus_and_read_order_undeclared",
    ]);
    for (const languageTag of ["", "deutsch-", "d", "DE_de"]) {
      expect(codes(manifest({ languageTag }))).toContain("language_tag_missing_or_malformed");
    }
    expect(codes(manifest({ languageTag: "de-DE" }))).toEqual([]);
    expect(codes(manifest({ textNotTruncated: false }))).toEqual(["text_truncated"]);
    expect(codes(manifest({ zoomAndReflowSuitable: false }))).toEqual([
      "zoom_or_reflow_unsuitable",
    ]);
    expect(codes(manifest({ colorOnlyState: true }))).toEqual(["color_only_state"]);
  });

  it("blocks an unsupported claim asserted as equivalent, and narrows an honest one", () => {
    expect(
      codes(
        manifest({
          supportClaims: [
            { supportKind: "screen_reader_drag", actuallySupported: false, claimNarrowedTo: null },
          ],
        }),
      ),
    ).toEqual(["unsupported_claim_asserted_as_equivalent"]);

    const narrowed = evaluateAccessibilityGate(
      manifest({
        supportClaims: [
          {
            supportKind: "screen_reader_drag",
            actuallySupported: false,
            claimNarrowedTo: "keyboard select-then-place only",
          },
        ],
      }),
    );
    expect(narrowed.status).toBe("pass");
    expect(narrowed.narrowedClaims).toHaveLength(1);
  });

  it("never turns an accessibility narrowing into a learner consequence", () => {
    const narrowed = evaluateAccessibilityGate(
      manifest({
        supportClaims: [
          {
            supportKind: "pointer_drag",
            actuallySupported: false,
            claimNarrowedTo: "keyboard path only",
          },
        ],
      }),
    );
    expect(JSON.stringify(narrowed)).not.toMatch(/fail|incorrect|penalt|score|not_counted/i);
    for (const code of accessibilityGateCodes) {
      expect(code).not.toMatch(/learner/);
    }
  });
});
