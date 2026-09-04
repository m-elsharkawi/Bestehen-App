import { describe, expect, it } from "vitest";
import { audioCatalogueValidator } from "./media-catalogue.js";
import { buildSeedAudioManifest } from "./seed/audio.js";
import { contentSeedReleaseV1, seedAudioManifests } from "./seed/index.js";

describe("P05-MEDIA-001 historical source authority", () => {
  it("P05-SECURITY-001 checks rights purpose, scope, expiry and action policy without claiming conditional delivery", () => {
    const original = required(
      contentSeedReleaseV1.entries.find((entry) => entry.taskFamily === "H2ConversationInterview"),
    ).rights;
    const refs = [original.componentScope.componentRef];
    expect(() =>
      audioCatalogueValidator.validateRightsScope(
        original,
        original.identity.rightsEnvelopeId,
        refs,
        "audio",
      ),
    ).not.toThrow();
    expect(() =>
      audioCatalogueValidator.validateRightsScope(
        original,
        original.identity.rightsEnvelopeId,
        refs,
        "transcript",
      ),
    ).not.toThrow();
    for (const [kind, purpose] of [
      ["transcript", "audio"],
      ["audio", "transcript"],
    ] as const)
      expect(() =>
        audioCatalogueValidator.validateRightsScope(
          { ...original, componentScope: { ...original.componentScope, componentKind: kind } },
          original.identity.rightsEnvelopeId,
          refs,
          purpose,
        ),
      ).toThrow("media_rights_component_mismatch");
    expect(
      audioCatalogueValidator.permitsOfflinePlayback(
        original,
        new Date("2026-09-04T00:00:00.000Z"),
      ),
    ).toBe(false);
    const unconditional = {
      ...original,
      conditions: [],
      actionEligibility: {
        ...original.actionEligibility,
        actions: { ...original.actionEligibility.actions, download_offline: "allowed" },
      },
    };
    expect(
      audioCatalogueValidator.permitsOfflinePlayback(
        unconditional,
        new Date("2026-09-04T00:00:00.000Z"),
      ),
    ).toBe(true);
    for (const changed of [
      {
        ...unconditional,
        identity: { ...unconditional.identity, effectiveUntil: "2026-09-03T00:00:00.000Z" },
      },
      {
        ...unconditional,
        actionEligibility: {
          ...unconditional.actionEligibility,
          audienceLimit: ["unverified-audience"],
        },
      },
      {
        ...unconditional,
        actionEligibility: {
          ...unconditional.actionEligibility,
          actions: { ...unconditional.actionEligibility.actions, cache: "prohibited" },
        },
      },
    ])
      expect(
        audioCatalogueValidator.permitsOfflinePlayback(
          changed,
          new Date("2026-09-04T00:00:00.000Z"),
        ),
      ).toBe(false);
  });
  it("reconciles every actual committed seed, with exact original bytes and object identity", () => {
    expect(seedAudioManifests).toHaveLength(22);
    for (const seed of seedAudioManifests) {
      const result = audioCatalogueValidator.readHistoricalSeedRendition(seed);
      expect(result.rendition).toMatchObject(seed.rendition);
      expect(result.bytes).toHaveLength(seed.rendition.bytes);
      expect(result.rendition.predecessorMediaRevisionId).toBeNull();
    }
  });
  it("P05-SECURITY-001 denies a self-consistent changed script reusing a committed asset identity", () => {
    const original = required(seedAudioManifests[0]);
    const counterfeit = buildSeedAudioManifest({
      ...original,
      script: `${original.script} Changed.`,
    });
    expect(counterfeit.assetId).toBe(original.assetId);
    expect(counterfeit.rendition.digest).not.toBe(original.rendition.digest);
    expect(() => audioCatalogueValidator.readHistoricalSeedRendition(counterfeit)).toThrow(
      "historical_seed_metadata_mismatch",
    );
  });
});

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("required_media_identity_missing");
  return value;
}
