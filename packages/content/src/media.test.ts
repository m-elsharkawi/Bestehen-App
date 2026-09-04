import { createHash, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { canonicalJson } from "./digest.js";
import {
  audioAssetManifestSchema,
  bindAuthoredAudio,
  prepareNonSpeechSeedAudio,
  readAudioManifest,
  serializeAudioManifest,
} from "./media.js";
import { buildSeedAudioManifest } from "./seed/audio.js";
import { seedUuid } from "./seed/identity.js";
import { h1FamilyA } from "./seed/listening-h1.js";

const payload = h1FamilyA.artifact.revision.learnerPayload;
if (payload.kind !== "H1ShortAnnouncements") throw new Error("expected H1 fixture");
const h1 = payload;
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("missing synthetic fixture identity");
  return value;
}
function seedFor(stimulusId = "h1a-platform") {
  const stimulus = required(h1.announcements.find((entry) => entry.stimulusId === stimulusId));
  return required(
    h1FamilyA.audio.find((entry) => entry.rendition.mediaRevisionId === stimulus.mediaRevisionId),
  );
}
function context(stimulusId = "h1a-platform") {
  return {
    sourceContentRevisionId: h1FamilyA.artifact.revision.contentRevisionId,
    contentRevisionId: seedUuid("content_revision", "synthetic-media-successor/v1"),
    predecessorManifestRevision: null,
    contentFamilyId: h1FamilyA.artifact.family.contentFamilyId,
    stimulusId,
    instructionTextRevisionId: "synthetic-instruction/v1",
    targetBlueprintVersion: "synthetic-target/v1",
    progressionProfile: "P4" as const,
    rightsEnvelopeId: h1FamilyA.artifact.rights.identity.rightsEnvelopeId,
    accessibilityManifestRef: h1FamilyA.artifact.accessibility.accessibilityManifestId,
  };
}

describe("P05-MEDIA-001 private canonical media model and offline handoff", () => {
  it("keeps actual seed identity intact, relocates by successor and makes no speech/approval claim", () => {
    const seed = seedFor();
    const before = structuredClone(seed);
    const handoff = prepareNonSpeechSeedAudio(seed, context());
    expect(seed).toEqual(before);
    expect(handoff.manifest.learnerMediaRevisions[0]).toMatchObject({
      predecessorMediaRevisionId: seed.rendition.mediaRevisionId,
      digest: seed.rendition.digest,
      bytes: seed.rendition.bytes,
    });
    expect(required(handoff.manifest.learnerMediaRevisions[0]).mediaRevisionId).not.toBe(
      seed.rendition.mediaRevisionId,
    );
    expect(required(handoff.manifest.learnerMediaRevisions[0]).objectKey).not.toBe(
      seed.rendition.objectKey,
    );
    expect(handoff.manifest).toMatchObject({
      sourceRole: "deterministic_non_speech_fixture",
      status: "quarantined",
      speakerCount: 0,
      progressionProfile: h1FamilyA.artifact.revision.progressionProfile,
      approval: { decisionId: null, level: "draft" },
    });
    expect(handoff.sourceRequestedApproval).toBe("training");
    expect(handoff.learnerAdmission).toBe("denied_non_speech_fixture");
    expect(handoff.manifest.transcript.sourceRevisionId).toBe(seed.transcriptRevisionId);
    expect(handoff.manifest.transcript.transcriptRevisionId).toMatch(/^[a-f0-9-]{36}$/);
    expect(new Set(handoff.objects.map((object) => object.objectKey)).size).toBe(3);
    expect(readAudioManifest(handoff.record)).toEqual(handoff.manifest);
    expect(prepareNonSpeechSeedAudio(seed, context()).record).toEqual(handoff.record);
    expect(() =>
      prepareNonSpeechSeedAudio(seed, {
        ...context(),
        contentRevisionId: context().sourceContentRevisionId,
      }),
    ).toThrow("requires_successor_content_revision");
  });

  it("exact identities change for altered bytes, transcript rights/media lineage and successor aggregate pins", () => {
    const seed = seedFor();
    const original = prepareNonSpeechSeedAudio(seed, context());
    const changedSeed = buildSeedAudioManifest({
      assetKey: seed.assetKey,
      contentSeedKey: seed.contentSeedKey,
      contentFamilySlug: seed.contentFamilySlug,
      listeningFamily: seed.listeningFamily,
      script: `${seed.script} Anders.`,
    });
    const changed = prepareNonSpeechSeedAudio(changedSeed, context());
    expect(changed.manifest.assetId).toBe(original.manifest.assetId);
    expect(changed.manifest.manifestRevision).not.toBe(original.manifest.manifestRevision);
    expect(required(changed.manifest.learnerMediaRevisions[0]).mediaRevisionId).not.toBe(
      required(original.manifest.learnerMediaRevisions[0]).mediaRevisionId,
    );
    expect(changed.manifest.sourceMaster.masterRevisionId).not.toBe(
      original.manifest.sourceMaster.masterRevisionId,
    );
    expect(changed.manifest.transcript.transcriptRevisionId).not.toBe(
      original.manifest.transcript.transcriptRevisionId,
    );
    const rights = prepareNonSpeechSeedAudio(seed, {
      ...context(),
      rightsEnvelopeId: randomUUID(),
    });
    expect(rights.manifest.transcript.digest).toBe(original.manifest.transcript.digest);
    expect(rights.manifest.transcript.transcriptRevisionId).not.toBe(
      original.manifest.transcript.transcriptRevisionId,
    );
    const successor = prepareNonSpeechSeedAudio(seed, {
      ...context(),
      contentRevisionId: randomUUID(),
      predecessorManifestRevision: original.manifest.manifestRevision,
    });
    expect(successor.manifest.manifestRevision).not.toBe(original.manifest.manifestRevision);
    expect(successor.manifest.learnerMediaRevisions).toEqual(
      original.manifest.learnerMediaRevisions,
    );
    expect(successor.manifest.predecessorManifestRevision).toBe(original.manifest.manifestRevision);
  });

  it("rejects altered seed bytes/metadata and cross-family authoring contexts", () => {
    const seed = seedFor();
    expect(() =>
      prepareNonSpeechSeedAudio(
        { ...seed, rendition: { ...seed.rendition, mediaRevisionId: randomUUID() } },
        context(),
      ),
    ).toThrow("seed_audio_source_identity_mismatch");
    expect(() =>
      prepareNonSpeechSeedAudio(
        { ...seed, rendition: { ...seed.rendition, objectKey: "seed/audio/other.wav" } },
        context(),
      ),
    ).toThrow("seed_audio_source_identity_mismatch");
    for (const rendition of [
      { ...seed.rendition, bytes: 1 },
      { ...seed.rendition, digest: "0".repeat(64) },
      { ...seed.rendition, durationMs: 1 },
      { ...seed.rendition, codec: "mp3" },
    ])
      expect(() => prepareNonSpeechSeedAudio({ ...seed, rendition }, context())).toThrow(
        "bytes_or_transcript_mismatch",
      );
    expect(() =>
      prepareNonSpeechSeedAudio(seed, { ...context(), contentFamilyId: randomUUID() }),
    ).toThrow("seed_content_family_mismatch");
    expect(() =>
      prepareNonSpeechSeedAudio(seed, { ...context(), sourceContentRevisionId: randomUUID() }),
    ).toThrow("seed_source_content_revision_mismatch");
    expect(() =>
      prepareNonSpeechSeedAudio(seed, {
        ...context(),
        sourceContentRevisionId: randomUUID(),
        contentRevisionId: context().sourceContentRevisionId,
      }),
    ).toThrow("seed_source_content_revision_mismatch");
  });

  it("rejects correct hashes of noncanonical JSON, unknown private fields and mismatched outer identities", () => {
    const { manifest, record } = prepareNonSpeechSeedAudio(seedFor(), context());
    const formatted = JSON.stringify(manifest, null, 2);
    const hash = createHash("sha256").update(formatted).digest("hex");
    expect(() =>
      readAudioManifest({ ...record, canonicalManifest: formatted, digest: hash }),
    ).toThrow("canonical_digest_mismatch");
    expect(() => readAudioManifest({ ...record, assetId: randomUUID() })).toThrow(
      "identity_or_canonical",
    );
    expect(() => readAudioManifest({ ...record, digest: "f".repeat(64) })).toThrow(
      "identity_or_canonical",
    );
    expect(() => serializeAudioManifest({ ...manifest, providerToken: "forbidden" })).toThrow();
    expect(record.canonicalManifest).toBe(canonicalJson(manifest));
    const duplicateKeys = `{"assetId":"discarded-duplicate",${record.canonicalManifest.slice(1)}`;
    expect(JSON.parse(duplicateKeys)).toEqual(manifest);
    expect(() =>
      readAudioManifest({
        ...record,
        canonicalManifest: duplicateKeys,
        digest: createHash("sha256").update(duplicateKeys).digest("hex"),
      }),
    ).toThrow("canonical_digest_mismatch");
  });

  it("accepts explicitly synthetic approved-speech metadata, then rejects missing final-byte QA", () => {
    // Shape validation only. This synthetic metadata creates no approval record or actual audio.
    const base = prepareNonSpeechSeedAudio(seedFor(), context()).manifest;
    const speech = {
      ...base,
      sourceRole: "reviewed_tts",
      speakerCount: 1,
      limitations: [],
      progressionProfile: "P0",
      status: "current",
      generator: {
        ...base.generator,
        provider: "synthetic-schema-fixture",
        engine: "synthetic-speech/v1",
      },
      learnerMediaRevisions: base.learnerMediaRevisions.map((candidate) => ({
        ...candidate,
        objectKey: `media/approved/audio/${candidate.mediaRevisionId}.mp3`,
        mime: "audio/mpeg",
        container: "mp3",
        codec: "mp3",
      })),
      approval: { decisionId: randomUUID(), level: "training" },
      qa: {
        scriptMatch: "pass",
        pronunciation: "pass",
        cueAlignment: "pass",
        clipping: "pass",
        silence: "pass",
        loudness: "pass",
        artifacts: "pass",
        speakerAttribution: "pass",
        targetCalibration: "not_evaluated",
        reviewerRefs: ["synthetic-only/not-human-approval"],
        goldRelease: null,
        methodVersion: "synthetic-qa/v1",
      },
    };
    expect(audioAssetManifestSchema.safeParse(speech).success).toBe(true);
    for (const key of [
      "scriptMatch",
      "pronunciation",
      "cueAlignment",
      "clipping",
      "silence",
      "loudness",
      "artifacts",
      "speakerAttribution",
    ])
      expect(
        audioAssetManifestSchema.safeParse({
          ...speech,
          qa: { ...speech.qa, [key]: "not_evaluated" },
        }).success,
      ).toBe(false);
    expect(
      audioAssetManifestSchema.safeParse({
        ...speech,
        approval: { ...speech.approval, decisionId: null },
      }).success,
    ).toBe(false);
    expect(
      audioAssetManifestSchema.safeParse({ ...speech, qa: { ...speech.qa, reviewerRefs: [] } })
        .success,
    ).toBe(false);
  });

  it("refuses fixture promotion, missing private separation, malformed paths and incoherent codec/container", () => {
    const { manifest } = prepareNonSpeechSeedAudio(seedFor(), context());
    for (const level of ["training", "independent_b1", "readiness_p4", "gold"] as const)
      expect(
        audioAssetManifestSchema.safeParse({
          ...manifest,
          approval: { decisionId: randomUUID(), level },
        }).success,
      ).toBe(false);
    expect(audioAssetManifestSchema.safeParse({ ...manifest, status: "current" }).success).toBe(
      false,
    );
    expect(audioAssetManifestSchema.safeParse({ ...manifest, speakerCount: 1 }).success).toBe(
      false,
    );
    expect(
      audioAssetManifestSchema.safeParse({
        ...manifest,
        transcript: {
          ...manifest.transcript,
          objectKey: required(manifest.learnerMediaRevisions[0]).objectKey,
        },
      }).success,
    ).toBe(false);
    expect(
      audioAssetManifestSchema.safeParse({
        ...manifest,
        sourceMaster: { ...manifest.sourceMaster, objectKey: "audio/raw/../secret" },
      }).success,
    ).toBe(false);
    const speech = {
      ...manifest,
      sourceRole: "reviewed_tts",
      speakerCount: 1,
      limitations: [],
      progressionProfile: "P0",
      learnerMediaRevisions: manifest.learnerMediaRevisions.map((candidate) => ({
        ...candidate,
        objectKey: `media/approved/audio/${candidate.mediaRevisionId}.mp3`,
        mime: "audio/mpeg",
        container: "mp3",
        codec: "mp3",
      })),
    };
    expect(audioAssetManifestSchema.safeParse(speech).success).toBe(true); // Draft metadata, not an approval or speech claim.
    expect(
      audioAssetManifestSchema.safeParse({
        ...speech,
        learnerMediaRevisions: [{ ...speech.learnerMediaRevisions[0], codec: "pcm_u8" }],
      }).success,
    ).toBe(false);
    expect(
      audioAssetManifestSchema.safeParse({
        ...speech,
        approval: { decisionId: randomUUID(), level: "training" },
      }).success,
    ).toBe(false);
  });

  it("P05-SECURITY-001 binds reordered authored identities, never positions, old media pins or answer keys", () => {
    const names = ["platform", "pool"];
    const handoffs = names.map((name) =>
      prepareNonSpeechSeedAudio(seedFor(`h1a-${name}`), context(`h1a-${name}`)),
    );
    const questions = names.map((name) =>
      required(h1.questions.find((question) => question.questionId === `h1a-q-${name}`)),
    );
    const authoredBindings = names.map((name) => ({
      contentItemId: required(questions.find((question) => question.questionId === `h1a-q-${name}`))
        .itemRef,
      questionId: `h1a-q-${name}`,
      stimulusId: `h1a-${name}`,
    }));
    const stimuli = handoffs.map(({ manifest }) => ({
      stimulusId: manifest.stimulusId,
      mediaRevisionId: required(manifest.learnerMediaRevisions[0]).mediaRevisionId,
    }));
    const input = {
      contentRevisionId: context().contentRevisionId,
      questions,
      authoredBindings,
      stimuli,
      manifests: handoffs.map((entry) => entry.manifest),
    };
    const original = bindAuthoredAudio(input);
    const shuffled = bindAuthoredAudio({
      ...input,
      questions: [...questions].reverse(),
      stimuli: [...stimuli].reverse(),
      manifests: [...input.manifests].reverse(),
    });
    expect(shuffled).toEqual(original);
    for (const binding of original) {
      const manifest = required(
        handoffs.find((entry) => entry.manifest.stimulusId === binding.stimulusId),
      ).manifest;
      expect(binding).toMatchObject({
        assetId: manifest.assetId,
        manifestRevision: manifest.manifestRevision,
        mediaRevisionId: required(manifest.learnerMediaRevisions[0]).mediaRevisionId,
      });
    }
    expect(() =>
      bindAuthoredAudio({
        ...input,
        stimuli: h1.announcements.filter((stimulus) =>
          stimuli.some((candidate) => candidate.stimulusId === stimulus.stimulusId),
        ),
      }),
    ).toThrow("authored_media_revision_mismatch");
    expect(() => bindAuthoredAudio({ ...input, authoredBindings: [] })).toThrow(
      "incomplete_authored_media_scope",
    );
    expect(() =>
      bindAuthoredAudio({
        ...input,
        authoredBindings: [required(authoredBindings[0]), required(authoredBindings[0])],
      }),
    ).toThrow("duplicate_item_media_binding");
    expect(() => bindAuthoredAudio({ ...input, contentRevisionId: randomUUID() })).toThrow(
      "authored_media_revision_mismatch",
    );
    expect(() =>
      bindAuthoredAudio({
        ...input,
        authoredBindings: [
          { ...required(authoredBindings[0]), questionId: "wrong" },
          required(authoredBindings[1]),
        ],
      }),
    ).toThrow("missing_authored_media_identity");
  });
});
