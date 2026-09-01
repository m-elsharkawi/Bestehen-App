/**
 * The deterministic fake TTS renderer of decision D04, and the audio manifests the Listening seed
 * families pin.
 *
 * The renderer produces **byte-identical output for identical input**, which is what makes
 * `mediaRevisionDigest` reproducible and lets the rendered bytes be committed as fixtures. Two
 * choices carry that property, and both are deliberate:
 *
 * 1. **Every sample is computed with integer arithmetic.** `Math.sin` is implementation-defined in
 *    ECMAScript — two engines may legally return different last bits — so a waveform built from it
 *    would be byte-stable on the machine that generated it and quietly different in CI. The
 *    waveform here is an integer triangle whose period and envelope are read out of a SHA-256 of
 *    the script, so identical input yields identical bytes on every platform.
 * 2. **The container is uncompressed PCM WAV.** An MP3 encoder is a third-party dependency whose
 *    output is not stable across versions; a fake that needed a stable encoder would have swapped
 *    one determinism problem for another.
 *
 * What this is *not*: speech. It is a short, byte-stable placeholder for an unreviewed draft
 * rendition. Live synthesis, voice audition and P4 audio sign-off remain
 * the unclaimed owner gate `OWNER-05-A`, and nothing here may be read as satisfying it.
 */

import { createHash } from "node:crypto";
import type { AppId } from "@bestehen/domain";
import { seedUuid } from "./identity.js";

/** 6 kHz mono, 8-bit unsigned PCM. Small enough that the whole seed stays inside its asset budget. */
export const fakeAudioSampleRate = 6000;
export const fakeAudioChannels = 1;
export const fakeAudioBitsPerSample = 8;
export const fakeAudioMime = "audio/wav";
export const fakeAudioCodec = "pcm_u8";
export const fakeAudioContainer = "wav";

/** Duration bounds. The upper bound is what keeps the committed fixtures inside §13.4's ceiling. */
export const fakeAudioMinimumDurationMs = 400;
export const fakeAudioMaximumDurationMs = 1200;

/** The renderer's own version. A changed algorithm changes the bytes, so it changes this too. */
export const fakeTtsRendererVersion = "fake-tts/v1";

/** Duration is a function of the script, so a longer announcement is a longer clip — up to the cap. */
export function fakeAudioDurationMs(script: string): number {
  const scaled = fakeAudioMinimumDurationMs + script.length * 4;
  return Math.min(fakeAudioMaximumDurationMs, scaled);
}

function writeWavHeader(pcmBytes: number): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = fakeAudioSampleRate * fakeAudioChannels * (fakeAudioBitsPerSample / 8);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcmBytes, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(fakeAudioChannels, 22);
  header.writeUInt32LE(fakeAudioSampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(fakeAudioChannels * (fakeAudioBitsPerSample / 8), 32);
  header.writeUInt16LE(fakeAudioBitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcmBytes, 40);
  return header;
}

/**
 * Renders one script to bytes. Integer arithmetic only: the period, the envelope and every sample
 * are derived from the script's SHA-256 by integer operations, so the result is byte-identical on
 * any platform that can add and divide.
 */
export function renderFakeSpeech(script: string): Buffer {
  const seed = createHash("sha256").update(script, "utf8").digest();
  const durationMs = fakeAudioDurationMs(script);
  const sampleCount = Math.round((fakeAudioSampleRate * durationMs) / 1000);
  const period = 40 + ((seed[0] ?? 0) % 60);
  const pcm = Buffer.alloc(sampleCount);
  for (let index = 0; index < sampleCount; index += 1) {
    const phase = index % period;
    // An integer triangle over one period, centred on zero.
    const triangle = phase * 2 < period ? phase * 4 - period : period * 3 - phase * 4;
    const envelope = 18 + ((seed[(index >> 7) % seed.length] ?? 0) % 44);
    const value = 128 + Math.trunc((triangle * envelope) / (period * 2));
    pcm[index] = Math.max(0, Math.min(255, value));
  }
  return Buffer.concat([writeWavHeader(pcm.length), pcm]);
}

/**
 * An audio rendition manifest. The field set is exactly `MediaRevisionDigestInput`, so
 * `mediaRevisionDigest` consumes it with no adapter — and, because that digest is taken over the
 * whole value, an extra field here would silently change every media digest.
 */
export interface AudioRendition {
  readonly mediaRevisionId: string;
  readonly objectKey: string;
  /** SHA-256 over the rendered bytes. The byte digest proves the bytes. */
  readonly digest: string;
  readonly bytes: number;
  readonly mime: string;
  readonly codec: string;
  readonly container: string;
  readonly durationMs: number;
}

/** The script a rendition was rendered from, kept beside it so the fixture can be re-derived. */
export interface SeedAudioAsset {
  readonly assetKey: string;
  readonly script: string;
  readonly rendition: AudioRendition;
}

/**
 * T6's provider-neutral seed manifest. T5 will map it to the final `AudioAssetManifest` and media
 * delivery contracts. Keeping that split prevents seed authoring from pre-empting playback routes
 * or an object-store adapter while still pinning every script to deterministic fake bytes.
 */
export interface SeedAudioManifest {
  readonly assetId: AppId<"media_asset">;
  readonly assetKey: string;
  readonly contentSeedKey: string;
  readonly contentFamilySlug: string;
  readonly listeningFamily: "H1" | "H2" | "H3";
  readonly scriptRevisionId: string;
  readonly transcriptRevisionId: string;
  readonly language: "de";
  readonly sourceRole: "deterministic_fake_training_fixture";
  readonly rendererVersion: typeof fakeTtsRendererVersion;
  readonly script: string;
  readonly transcript: string;
  readonly transcriptEarliestRevealPhase: "after_attempt";
  readonly intendedApproval: "training";
  readonly rendition: AudioRendition;
  readonly limitations: readonly ["not_speech", "not_p4_approved", "owner_05_a_unclaimed"];
}

/** Where a rendered fixture lives, relative to the repository root. */
export function seedAudioFixturePath(assetKey: string): string {
  return `packages/content/src/fixtures/audio/${assetKey}.wav`;
}

/**
 * Builds the rendition manifest for one script by actually rendering it. The manifest's `bytes` and
 * `digest` therefore describe bytes that exist rather than bytes somebody expected.
 */
export function buildSeedAudioAsset(assetKey: string, script: string): SeedAudioAsset {
  const rendered = renderFakeSpeech(script);
  return {
    assetKey,
    script,
    rendition: {
      mediaRevisionId: seedUuid("media_revision", assetKey),
      objectKey: `seed/audio/${assetKey}.wav`,
      digest: createHash("sha256").update(rendered).digest("hex"),
      bytes: rendered.length,
      mime: fakeAudioMime,
      codec: fakeAudioCodec,
      container: fakeAudioContainer,
      durationMs: fakeAudioDurationMs(script),
    },
  };
}

export function buildSeedAudioManifest(input: {
  readonly assetKey: string;
  readonly contentSeedKey: string;
  readonly contentFamilySlug: string;
  readonly listeningFamily: "H1" | "H2" | "H3";
  readonly script: string;
}): SeedAudioManifest {
  const asset = buildSeedAudioAsset(input.assetKey, input.script);
  return {
    assetId: seedUuid("media_asset", input.assetKey) as AppId<"media_asset">,
    assetKey: input.assetKey,
    contentSeedKey: input.contentSeedKey,
    contentFamilySlug: input.contentFamilySlug,
    listeningFamily: input.listeningFamily,
    scriptRevisionId: `seed-script/${input.assetKey}/v1`,
    transcriptRevisionId: `seed-transcript/${input.assetKey}/v1`,
    language: "de",
    sourceRole: "deterministic_fake_training_fixture",
    rendererVersion: fakeTtsRendererVersion,
    script: input.script,
    transcript: input.script,
    transcriptEarliestRevealPhase: "after_attempt",
    intendedApproval: "training",
    rendition: asset.rendition,
    limitations: ["not_speech", "not_p4_approved", "owner_05_a_unclaimed"],
  };
}

export function audioMediaRevisionId(asset: SeedAudioAsset): AppId<"media_revision"> {
  return asset.rendition.mediaRevisionId as AppId<"media_revision">;
}
