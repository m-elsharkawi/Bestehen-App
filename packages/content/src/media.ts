/** Private publication facts. None of this manifest is a learner delivery payload. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { canonicalDigest, canonicalJson, canonicalizationVersion } from "./digest.js";
import type { SeedAudioManifest } from "./seed/audio.js";
import {
  fakeAudioBitsPerSample,
  fakeAudioChannels,
  fakeAudioDurationMs,
  fakeAudioSampleRate,
  fakeTtsRendererVersion,
  renderFakeSpeech,
} from "./seed/audio.js";
import { seedUuid } from "./seed/identity.js";

const id = z.uuid();
const ref = z.string().min(1).max(160);
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const bytes = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const objectKey = z
  .string()
  .min(1)
  .max(512)
  .regex(/^[a-zA-Z0-9_./-]+$/)
  .refine(
    (key) =>
      !key.startsWith("/") &&
      !key.split("/").some((part) => part === ".." || part === "." || part === ""),
    "Object keys must be exact private catalogue keys",
  );
const qaOutcome = z.enum(["pass", "fail", "not_evaluated"]);
const sourceRoles = [
  "reviewed_tts",
  "audited_premium_tts",
  "native_human",
  "reusable_direct",
  "deterministic_non_speech_fixture",
] as const;

export const audioRenditionSchema = z
  .object({
    mediaRevisionId: id,
    predecessorMediaRevisionId: id.nullable(),
    role: z.enum(["web_primary", "future_optimized"]),
    objectKey,
    digest,
    bytes,
    mime: z.enum(["audio/mpeg", "audio/wav"]),
    codec: ref,
    container: z.enum(["mp3", "wav"]),
    durationMs: z.number().int().positive(),
    sampleRate: z.number().int().positive(),
    channels: z.number().int().positive(),
    bitrate: z.number().int().positive(),
    cachePolicyRef: ref,
    rightsActions: z
      .array(z.enum(["display", "reproduce", "cache", "download_offline", "transform_transcode"]))
      .min(1),
  })
  .strict();

export const audioAssetManifestSchema = z
  .object({
    contractMajor: z.literal(1),
    assetId: id,
    manifestRevision: ref,
    predecessorManifestRevision: ref.nullable(),
    contentRevisionId: id,
    contentFamilyId: id,
    stimulusId: ref,
    listeningFamily: z.enum(["H1", "H2", "H3"]),
    scriptRevisionId: ref,
    instructionTextRevisionId: ref,
    targetBlueprintVersion: ref,
    progressionProfile: z.enum(["P0", "P1", "P2", "P3", "P4"]),
    sourceRole: z.enum(sourceRoles),
    voiceClass: ref,
    speakerCount: z.number().int().nonnegative(),
    turnMap: z.array(
      z
        .object({
          speakerRef: ref,
          fromMs: z.number().int().nonnegative(),
          toMs: z.number().int().positive(),
        })
        .strict(),
    ),
    authoredSpeedRatio: z.number().positive(),
    generator: z
      .object({
        provider: ref,
        region: ref,
        engine: ref,
        modelRelease: ref,
        voiceRelease: ref,
        requestDigest: digest,
      })
      .strict(),
    sourceMaster: z
      .object({ masterRevisionId: id, objectKey, digest, bytes, format: z.enum(["wav", "flac"]) })
      .strict(),
    learnerMediaRevisions: z.array(audioRenditionSchema).min(1).max(8),
    qa: z
      .object({
        scriptMatch: qaOutcome,
        pronunciation: qaOutcome,
        cueAlignment: qaOutcome,
        clipping: qaOutcome,
        silence: qaOutcome,
        loudness: qaOutcome,
        artifacts: qaOutcome,
        speakerAttribution: qaOutcome,
        targetCalibration: qaOutcome,
        reviewerRefs: z.array(ref),
        goldRelease: ref.nullable(),
        methodVersion: ref,
      })
      .strict(),
    transcript: z
      .object({
        transcriptRevisionId: id,
        mediaRevisionId: id,
        sourceRevisionId: ref,
        objectKey,
        digest,
        kind: z.enum(["target_transcript", "focused_repair_excerpt"]),
        answerBearing: z.literal(true),
        earliestRevealPhase: z.enum(["never", "after_attempt", "after_block"]),
        rightsEnvelopeRef: id,
        language: z.literal("de"),
      })
      .strict(),
    transcriptPolicyRef: ref,
    rightsEnvelopeRef: id,
    accessibilityManifestRef: ref,
    approval: z
      .object({
        decisionId: id.nullable(),
        level: z.enum([
          "draft",
          "quarantine",
          "training",
          "independent_b1",
          "readiness_p4",
          "gold",
          "retired",
        ]),
      })
      .strict(),
    status: z.enum(["current", "superseded", "quarantined", "withdrawn"]),
    limitations: z.array(z.enum(["not_speech", "not_p4_approved", "owner_05_a_unclaimed"])),
  })
  .strict()
  .superRefine((manifest, context) => {
    const fail = (message: string) => context.addIssue({ code: "custom", message });
    const fixture = manifest.sourceRole === "deterministic_non_speech_fixture";
    if (fixture ? manifest.speakerCount !== 0 : manifest.speakerCount === 0)
      fail("Non-speech has no speakers; speech must identify its speaker count");
    const media = manifest.learnerMediaRevisions;
    if (
      new Set(media.map((candidate) => candidate.mediaRevisionId)).size !== media.length ||
      media.filter((candidate) => candidate.role === "web_primary").length !== 1
    )
      fail("An aggregate requires unique exact candidates and one primary rendition");
    if (
      !media.some(
        (candidate) =>
          candidate.role === "web_primary" &&
          candidate.mediaRevisionId === manifest.transcript.mediaRevisionId,
      )
    )
      fail("Transcript lineage must name the exact primary rendition");
    if (
      new Set([
        manifest.sourceMaster.objectKey,
        manifest.transcript.objectKey,
        ...media.map((candidate) => candidate.objectKey),
      ]).size !==
      media.length + 2
    )
      fail("Master, transcript and learner objects must be separate");
    if (
      !manifest.sourceMaster.objectKey.startsWith("audio/raw/") ||
      !manifest.transcript.objectKey.startsWith("media/approved/private-transcripts/")
    )
      fail("Master and target transcript require their distinct private namespaces");
    for (const candidate of media) {
      if (!candidate.objectKey.startsWith(fixture ? "tmp/non-speech/" : "media/approved/audio/"))
        fail("Learner rendition is outside its exact delivery namespace");
      if (
        candidate.mime !== (fixture ? "audio/wav" : "audio/mpeg") ||
        candidate.container !== (fixture ? "wav" : "mp3") ||
        candidate.codec !== (fixture ? "pcm_u8" : "mp3")
      )
        fail("Production delivery requires MP3; deterministic non-speech uses WAV only");
      if (new Set(candidate.rightsActions).size !== candidate.rightsActions.length)
        fail("Duplicate rights actions");
    }
    if (
      manifest.turnMap.some(
        (turn) =>
          turn.toMs <= turn.fromMs ||
          turn.toMs > Math.min(...media.map((candidate) => candidate.durationMs)),
      )
    )
      fail("Speaker turns must fit the pinned rendition duration");
    if (
      fixture &&
      (manifest.approval.decisionId !== null ||
        !["draft", "quarantine"].includes(manifest.approval.level) ||
        manifest.status !== "quarantined" ||
        ["not_speech", "not_p4_approved", "owner_05_a_unclaimed"].some(
          (limit) => !manifest.limitations.includes(limit as (typeof manifest.limitations)[number]),
        ))
    )
      fail("Non-speech fixtures cannot claim learner approval or current delivery");
    if (!fixture && manifest.limitations.includes("not_speech"))
      fail("Non-speech provenance cannot be relabeled as speech");
    if (["training", "independent_b1", "readiness_p4", "gold"].includes(manifest.approval.level)) {
      if (
        manifest.approval.decisionId === null ||
        manifest.qa.reviewerRefs.length === 0 ||
        Object.entries(manifest.qa).some(
          ([key, value]) =>
            !["reviewerRefs", "goldRelease", "methodVersion", "targetCalibration"].includes(key) &&
            value !== "pass",
        )
      )
        fail("Approval requires explicit final-byte QA and review references");
    }
    if (
      manifest.progressionProfile === "P4" &&
      !fixture &&
      (manifest.authoredSpeedRatio !== 1 ||
        manifest.transcript.earliestRevealPhase !== "after_block")
    )
      fail("P4 requires target speed and whole-block withholding");
    if (
      ["readiness_p4", "gold"].includes(manifest.approval.level) &&
      (manifest.qa.targetCalibration !== "pass" || manifest.qa.goldRelease === null)
    )
      fail("Target approval requires calibration and a pinned gold release");
  });

export type AudioAssetManifest = z.infer<typeof audioAssetManifestSchema>;
export type AudioRendition = z.infer<typeof audioRenditionSchema>;

export interface AudioManifestRecord {
  readonly canonicalizationVersion: "canonical-json/v1";
  readonly assetId: string;
  readonly manifestRevision: string;
  readonly contentRevisionId: string;
  readonly stimulusId: string;
  readonly canonicalManifest: string;
  readonly digest: string;
}

export function serializeAudioManifest(input: unknown): AudioManifestRecord {
  const manifest = audioAssetManifestSchema.parse(input);
  return {
    canonicalizationVersion,
    assetId: manifest.assetId,
    manifestRevision: manifest.manifestRevision,
    contentRevisionId: manifest.contentRevisionId,
    stimulusId: manifest.stimulusId,
    canonicalManifest: canonicalJson(manifest),
    digest: canonicalDigest(manifest),
  };
}

/** Revalidates even a correctly hashed row. Hash equality alone is not canonicalization or QA. */
export function readAudioManifest(record: AudioManifestRecord): AudioAssetManifest {
  const manifest = audioAssetManifestSchema.parse(JSON.parse(record.canonicalManifest));
  if (
    record.canonicalizationVersion !== canonicalizationVersion ||
    canonicalJson(manifest) !== record.canonicalManifest ||
    canonicalDigest(manifest) !== record.digest ||
    manifest.assetId !== record.assetId ||
    manifest.manifestRevision !== record.manifestRevision ||
    manifest.contentRevisionId !== record.contentRevisionId ||
    manifest.stimulusId !== record.stimulusId
  )
    throw new Error("audio_manifest_identity_or_canonical_digest_mismatch");
  return manifest;
}

export interface AuthoredMediaBinding {
  readonly contentItemId: string;
  readonly questionId: string;
  readonly stimulusId: string;
}

/** Offline authoring supplies explicit mapping. This function has no keys or database input. */
export function bindAuthoredAudio(input: {
  readonly contentRevisionId: string;
  readonly questions: readonly { readonly itemRef: string; readonly questionId: string }[];
  readonly stimuli: readonly { readonly stimulusId: string; readonly mediaRevisionId: string }[];
  readonly authoredBindings: readonly AuthoredMediaBinding[];
  readonly manifests: readonly AudioAssetManifest[];
}) {
  const seenItems = new Set<string>();
  const seenStimuli = new Set<string>();
  if (
    new Set(input.questions.map((question) => question.itemRef)).size !== input.questions.length ||
    new Set(input.questions.map((question) => question.questionId)).size !==
      input.questions.length ||
    new Set(input.stimuli.map((stimulus) => stimulus.stimulusId)).size !== input.stimuli.length ||
    new Set(input.manifests.map((manifest) => manifest.stimulusId)).size !== input.manifests.length
  )
    throw new Error("duplicate_authored_identity");
  const bindings = input.authoredBindings.flatMap((binding) => {
    id.parse(binding.contentItemId);
    if (seenItems.has(binding.contentItemId)) throw new Error("duplicate_item_media_binding");
    seenItems.add(binding.contentItemId);
    const question = input.questions.find(
      (entry) => entry.itemRef === binding.contentItemId && entry.questionId === binding.questionId,
    );
    const stimulus = input.stimuli.find((entry) => entry.stimulusId === binding.stimulusId);
    const rawManifest = input.manifests.find((entry) => entry.stimulusId === binding.stimulusId);
    if (!question || !stimulus || !rawManifest) throw new Error("missing_authored_media_identity");
    const manifest = audioAssetManifestSchema.parse(rawManifest);
    if (
      manifest.contentRevisionId !== input.contentRevisionId ||
      !manifest.learnerMediaRevisions.some(
        (entry) =>
          entry.mediaRevisionId === stimulus.mediaRevisionId && entry.role === "web_primary",
      )
    )
      throw new Error("authored_media_revision_mismatch");
    seenStimuli.add(binding.stimulusId);
    return manifest.learnerMediaRevisions.map((candidate) => ({
      contentRevisionId: input.contentRevisionId,
      contentItemId: binding.contentItemId,
      stimulusId: binding.stimulusId,
      assetId: manifest.assetId,
      manifestRevision: manifest.manifestRevision,
      mediaRevisionId: candidate.mediaRevisionId,
    }));
  });
  if (
    seenItems.size !== input.questions.length ||
    seenStimuli.size !== input.stimuli.length ||
    seenStimuli.size !== input.manifests.length
  )
    throw new Error("incomplete_authored_media_scope");
  return bindings;
}

/** Translates draft seed provenance without promoting the seed's intended training request. */
export function prepareNonSpeechSeedAudio(
  seed: SeedAudioManifest,
  context: {
    /** Relocating a pinned rendition requires an explicitly authored successor content revision. */
    readonly sourceContentRevisionId: string;
    readonly contentRevisionId: string;
    readonly predecessorManifestRevision: string | null;
    readonly contentFamilyId: string;
    readonly stimulusId: string;
    readonly instructionTextRevisionId: string;
    readonly targetBlueprintVersion: string;
    readonly progressionProfile: AudioAssetManifest["progressionProfile"];
    readonly rightsEnvelopeId: string;
    readonly accessibilityManifestRef: string;
  },
) {
  id.parse(context.sourceContentRevisionId);
  if (
    seed.sourceRole !== "deterministic_fake_training_fixture" ||
    seed.rendererVersion !== fakeTtsRendererVersion ||
    seed.assetId !== seedUuid("media_asset", seed.assetKey) ||
    seed.rendition.mediaRevisionId !== seedUuid("media_revision", seed.assetKey) ||
    seed.rendition.objectKey !== `seed/audio/${seed.assetKey}.wav`
  )
    throw new Error("seed_audio_source_identity_mismatch");
  if (context.sourceContentRevisionId !== seedUuid("content_revision", seed.contentSeedKey))
    throw new Error("seed_source_content_revision_mismatch");
  if (context.contentFamilyId !== seedUuid("content_family", seed.contentFamilySlug))
    throw new Error("seed_content_family_mismatch");
  if (context.contentRevisionId === context.sourceContentRevisionId)
    throw new Error("relocated_media_requires_successor_content_revision");
  const rendered = renderFakeSpeech(seed.script);
  const actualDigest = createHash("sha256").update(rendered).digest("hex");
  if (
    actualDigest !== seed.rendition.digest ||
    rendered.length !== seed.rendition.bytes ||
    seed.rendition.durationMs !== fakeAudioDurationMs(seed.script) ||
    seed.rendition.mime !== "audio/wav" ||
    seed.rendition.codec !== "pcm_u8" ||
    seed.rendition.container !== "wav" ||
    seed.transcript !== seed.script
  )
    throw new Error("non_speech_seed_bytes_or_transcript_mismatch");
  const transcriptDigest = createHash("sha256").update(seed.transcript, "utf8").digest("hex");
  const renditionFacts = {
    ...seed.rendition,
    predecessorMediaRevisionId: seed.rendition.mediaRevisionId,
    role: "web_primary",
    sampleRate: fakeAudioSampleRate,
    channels: fakeAudioChannels,
    bitrate: fakeAudioSampleRate * fakeAudioChannels * fakeAudioBitsPerSample,
    cachePolicyRef: "non-speech-test-only/v1",
    rightsActions: ["display", "reproduce", "cache", "download_offline"],
  };
  const mediaId = seedUuid(
    "media_revision",
    `non-speech-relocation/v1:${canonicalDigest({ renditionFacts, destination: "tmp/non-speech/" })}`,
  );
  const transcriptId = seedUuid(
    "media_revision",
    `private-transcript/v1:${canonicalDigest({
      mediaRevisionId: mediaId,
      sourceRevisionId: seed.transcriptRevisionId,
      digest: transcriptDigest,
      rightsEnvelopeId: context.rightsEnvelopeId,
      kind: "target_transcript",
      phase: "after_attempt",
      language: "de",
    })}`,
  );
  const transcriptKey = `media/approved/private-transcripts/${transcriptId}/${transcriptDigest}.txt`;
  const masterKey = `audio/raw/${seed.assetId}/${actualDigest}.wav`;
  const learnerKey = `tmp/non-speech/${mediaId}/${actualDigest}.wav`;
  const manifest: AudioAssetManifest = audioAssetManifestSchema.parse({
    contractMajor: 1,
    assetId: seed.assetId,
    manifestRevision: "non-speech-seed/v1",
    predecessorManifestRevision: context.predecessorManifestRevision,
    contentRevisionId: context.contentRevisionId,
    contentFamilyId: context.contentFamilyId,
    stimulusId: context.stimulusId,
    listeningFamily: seed.listeningFamily,
    scriptRevisionId: seed.scriptRevisionId,
    instructionTextRevisionId: context.instructionTextRevisionId,
    targetBlueprintVersion: context.targetBlueprintVersion,
    progressionProfile: context.progressionProfile,
    sourceRole: "deterministic_non_speech_fixture",
    voiceClass: "none/non-speech",
    speakerCount: 0,
    turnMap: [],
    authoredSpeedRatio: 1,
    generator: {
      provider: "deterministic_local",
      region: "none",
      engine: seed.rendererVersion,
      modelRelease: "none",
      voiceRelease: "none",
      requestDigest: canonicalDigest({ script: seed.script, renderer: seed.rendererVersion }),
    },
    sourceMaster: {
      masterRevisionId: seedUuid(
        "media_revision",
        `private-master/v1:${seed.assetId}:${actualDigest}`,
      ),
      objectKey: masterKey,
      digest: actualDigest,
      bytes: rendered.length,
      format: "wav",
    },
    learnerMediaRevisions: [
      {
        ...renditionFacts,
        mediaRevisionId: mediaId,
        objectKey: learnerKey,
      },
    ],
    qa: {
      scriptMatch: "not_evaluated",
      pronunciation: "not_evaluated",
      cueAlignment: "not_evaluated",
      clipping: "not_evaluated",
      silence: "not_evaluated",
      loudness: "not_evaluated",
      artifacts: "not_evaluated",
      speakerAttribution: "not_evaluated",
      targetCalibration: "not_evaluated",
      reviewerRefs: [],
      goldRelease: null,
      methodVersion: "non-speech-fixture/v1",
    },
    transcript: {
      transcriptRevisionId: transcriptId,
      mediaRevisionId: mediaId,
      sourceRevisionId: seed.transcriptRevisionId,
      objectKey: transcriptKey,
      digest: transcriptDigest,
      kind: "target_transcript",
      answerBearing: true,
      earliestRevealPhase: "after_attempt",
      rightsEnvelopeRef: context.rightsEnvelopeId,
      language: "de",
    },
    transcriptPolicyRef: "target-private/v1",
    rightsEnvelopeRef: context.rightsEnvelopeId,
    accessibilityManifestRef: context.accessibilityManifestRef,
    approval: { decisionId: null, level: "draft" },
    status: "quarantined",
    limitations: ["not_speech", "not_p4_approved", "owner_05_a_unclaimed"],
  });
  manifest.manifestRevision = `non-speech/v1/${canonicalDigest({ ...manifest, manifestRevision: undefined })}`;
  return {
    manifest,
    record: serializeAudioManifest(manifest),
    objects: [
      { kind: "non_speech_rendition" as const, objectKey: learnerKey, bytes: rendered },
      { kind: "private_master" as const, objectKey: masterKey, bytes: Buffer.from(rendered) },
      {
        kind: "private_transcript" as const,
        objectKey: transcriptKey,
        bytes: Buffer.from(seed.transcript, "utf8"),
      },
    ],
    learnerAdmission: "denied_non_speech_fixture" as const,
    sourceRequestedApproval: seed.intendedApproval,
    requiredContentRepin: {
      sourceContentRevisionId: context.sourceContentRevisionId,
      successorContentRevisionId: context.contentRevisionId,
      sourceMediaRevisionId: seed.rendition.mediaRevisionId,
      successorMediaRevisionId: mediaId,
    },
  };
}
