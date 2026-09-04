/** Private offline catalogue boundary. These facts are never learner delivery payloads. */
export interface AudioCatalogueRecord {
  readonly canonicalizationVersion: "canonical-json/v1";
  readonly assetId: string;
  readonly manifestRevision: string;
  readonly contentRevisionId: string;
  readonly stimulusId: string;
  readonly canonicalManifest: string;
  readonly digest: string;
}

export interface CatalogueRendition {
  readonly mediaRevisionId: string;
  readonly predecessorMediaRevisionId: string | null;
  readonly role: "web_primary" | "future_optimized";
  readonly objectKey: string;
  readonly digest: string;
  readonly bytes: number;
  readonly mime: string;
  readonly codec: string;
  readonly container: string;
  readonly durationMs: number;
  readonly sampleRate: number;
  readonly channels: number;
  readonly bitrate: number;
  readonly cachePolicyRef: string;
  readonly rightsActions: readonly string[];
}

export interface CatalogueAudioManifest {
  readonly assetId: string;
  readonly manifestRevision: string;
  readonly predecessorManifestRevision: string | null;
  readonly contentRevisionId: string;
  readonly contentFamilyId: string;
  readonly stimulusId: string;
  readonly listeningFamily: "H1" | "H2" | "H3";
  readonly progressionProfile: "P0" | "P1" | "P2" | "P3" | "P4";
  readonly instructionTextRevisionId: string;
  readonly targetBlueprintVersion: string;
  readonly sourceRole: string;
  readonly authoredSpeedRatio: number;
  readonly generator: Readonly<Record<string, unknown>>;
  readonly qa: Readonly<Record<string, unknown>>;
  readonly rightsEnvelopeRef: string;
  readonly accessibilityManifestRef: string;
  readonly status: "current" | "superseded" | "quarantined" | "withdrawn";
  readonly approval: { readonly decisionId: string | null; readonly level: string };
  readonly learnerMediaRevisions: readonly CatalogueRendition[];
  readonly sourceMaster: {
    readonly objectKey: string;
    readonly digest: string;
    readonly bytes: number;
  };
  readonly transcript: {
    readonly transcriptRevisionId: string;
    readonly mediaRevisionId: string;
    readonly objectKey: string;
    readonly digest: string;
    readonly kind: "target_transcript" | "focused_repair_excerpt";
    readonly answerBearing: true;
    readonly earliestRevealPhase: "never" | "after_attempt" | "after_block";
    readonly rightsEnvelopeRef: string;
    readonly language: "de";
  };
}

export interface CatalogueMediaBinding {
  readonly contentRevisionId: string;
  readonly contentItemId: string;
  readonly stimulusId: string;
  readonly assetId: string;
  readonly manifestRevision: string;
  readonly mediaRevisionId: string;
}

/** Required composition dependency. A digest-only or identity-only validator is not sufficient. */
export interface AudioCatalogueValidator {
  readManifest(record: AudioCatalogueRecord): CatalogueAudioManifest;
  hasMediaPin(learnerPayload: unknown, mediaRevisionId: string): boolean;
  validateRightsScope(
    envelope: unknown,
    rightsId: string,
    componentRefs: readonly string[],
    purpose: "audio" | "transcript",
    at?: Date,
  ): void;
  permitsOfflinePlayback(envelope: unknown, at: Date): boolean;
  validateBindings(input: {
    readonly contentRevisionId: string;
    readonly learnerPayload: unknown;
    readonly bindings: readonly CatalogueMediaBinding[];
    readonly records: readonly AudioCatalogueRecord[];
  }): void;
  readHistoricalSeedRendition(seed: unknown): {
    readonly assetId: string;
    readonly sourceContentRevisionId: string;
    readonly sourceContentDigest: string;
    readonly rendition: CatalogueRendition;
    readonly bytes: Uint8Array;
  };
}
