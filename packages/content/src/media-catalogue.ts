/** Composition adapter for the application port, without a content-to-application dependency. */
import { z } from "zod";
import { appId } from "@bestehen/domain";
import {
  authenticityConfidences,
  evaluateAction,
  rightsActions,
  rightsComponentKinds,
  rightsConditionKinds,
  rightsEligibilities,
} from "./rights.js";
import { canonicalJson } from "./digest.js";
import {
  bindAuthoredAudio,
  readAudioManifest,
  type AudioManifestRecord,
  type AudioRendition,
} from "./media.js";
import {
  fakeAudioBitsPerSample,
  fakeAudioChannels,
  fakeAudioSampleRate,
  renderFakeSpeech,
} from "./seed/audio.js";
import { contentSeedReleaseV1, seedAudioManifests } from "./seed/index.js";
import { seedUuid } from "./seed/identity.js";

const stimulus = z.object({ stimulusId: z.string().min(1), mediaRevisionId: z.uuid() });
const questions = z.array(z.object({ itemRef: z.uuid(), questionId: z.string().min(1) })).min(1);
const payloadSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("H1ShortAnnouncements"),
    questions,
    announcements: z.array(stimulus),
  }),
  z.object({ kind: z.literal("H2ConversationInterview"), questions, conversation: stimulus }),
  z.object({ kind: z.literal("H3ShortFunctionalTexts"), questions, texts: z.array(stimulus) }),
]);
const bindingSchema = z
  .object({
    contentRevisionId: z.uuid(),
    contentItemId: z.uuid(),
    stimulusId: z.string().min(1),
    assetId: z.uuid(),
    manifestRevision: z.string().min(1),
    mediaRevisionId: z.uuid(),
  })
  .strict();
const rightsScope = z.object({
  identity: z.object({
    rightsEnvelopeId: z.uuid(),
    state: z.enum(["current", "superseded", "withdrawn", "takedown"]),
    effectiveFrom: z.iso.datetime(),
    effectiveUntil: z.iso.datetime().optional(),
  }),
  componentScope: z.object({
    componentRef: z.string(),
    componentKind: z.enum(["audio", "transcript", "composite"]),
  }),
});
const nullableText = z.string().nullable();
const rightsEnvelopeSchema = rightsScope.extend({
  identity: rightsScope.shape.identity.extend({
    rightsEnvelopeId: z.uuid().transform((value) => appId<"rights_envelope">(value)),
    revision: z.number().int().positive(),
    sourceRef: nullableText,
    sourceComponentRevision: nullableText,
  }),
  separateTrust: z.object({
    authenticityConfidence: z.enum(authenticityConfidences),
    qaReferences: z.array(z.string()),
  }),
  actionEligibility: z.object({
    actions: z.partialRecord(z.enum(rightsActions), z.enum(rightsEligibilities)),
    territoryLimit: z.array(z.string()).nullable(),
    audienceLimit: z.array(z.string()).nullable(),
  }),
  conditions: z.array(
    z.object({
      conditionId: z.string(),
      kind: z.enum(rightsConditionKinds),
      appliesToActions: z.array(z.enum(rightsActions)),
      resolved: z.boolean(),
      obligation: z.string(),
      expiresAt: z.iso.datetime().optional(),
    }),
  ),
  exactCredit: z.object({
    attributionRequired: z.boolean(),
    authorOrRightsholder: z.string(),
    titleOrSource: nullableText,
    requiredLink: nullableText,
    licenceIdentifier: z.string(),
    licenceNoticeText: nullableText,
    modificationNotice: nullableText,
    placementRule: nullableText,
  }),
  componentScope: z.object({
    componentRef: z.string(),
    componentKind: z.enum(rightsComponentKinds),
  }),
  provenance: z.object({
    corpusBundleRef: nullableText,
    rightsDecisionRef: nullableText,
    sourceRevisionRef: nullableText,
    groundingManifest: z.string(),
    note: z.string(),
  }),
  incidentDisposition: z
    .object({
      reason: z.string(),
      purgeOrTombstoneConstraint: z.string(),
      successorRef: nullableText,
      affectedArtifactSelectors: z.array(z.string()),
      reviewOwner: z.string(),
    })
    .nullable(),
});

export const audioCatalogueValidator = {
  readManifest: readAudioManifest,
  validateRightsScope(
    input: unknown,
    rightsId: string,
    componentRefs: readonly string[],
    purpose: "audio" | "transcript",
    at?: Date,
  ): void {
    const envelope = rightsScope.parse(input);
    if (
      envelope.identity.rightsEnvelopeId !== rightsId ||
      !componentRefs.includes(envelope.componentScope.componentRef) ||
      (envelope.componentScope.componentKind !== "composite" &&
        (envelope.componentScope.componentKind !== purpose ||
          envelope.componentScope.componentRef !== componentRefs[0]))
    )
      throw new Error("media_rights_component_mismatch");
    if (
      at &&
      (envelope.identity.state !== "current" ||
        new Date(envelope.identity.effectiveFrom) > at ||
        (envelope.identity.effectiveUntil && new Date(envelope.identity.effectiveUntil) <= at))
    )
      throw new Error("media_rights_not_effective");
  },
  permitsOfflinePlayback(input: unknown, at: Date): boolean {
    const envelope = rightsEnvelopeSchema.safeParse(input);
    if (!envelope.success) return false;
    const { effectiveUntil, ...identity } = envelope.data.identity;
    const validated = {
      ...envelope.data,
      identity: { ...identity, ...(effectiveUntil ? { effectiveUntil } : {}) },
      conditions: envelope.data.conditions.map(({ expiresAt, ...condition }) => ({
        ...condition,
        ...(expiresAt ? { expiresAt } : {}),
      })),
    };
    // Conditional delivery, attribution and audience enforcement belong to the byte authorizer.
    return (
      !validated.exactCredit.attributionRequired &&
      (["display", "reproduce", "cache", "download_offline"] as const).every(
        (action) => evaluateAction(validated, action, { at }) === "allowed",
      )
    );
  },
  validateBindings(input: {
    readonly contentRevisionId: string;
    readonly learnerPayload: unknown;
    readonly bindings: readonly z.infer<typeof bindingSchema>[];
    readonly records: readonly AudioManifestRecord[];
  }): void {
    const payload = payloadSchema.parse(input.learnerPayload);
    const bindings = z.array(bindingSchema).parse(input.bindings);
    const manifests = input.records.map(readAudioManifest);
    const authoredBindings = payload.questions.map((question) => {
      const matches = bindings.filter((binding) => binding.contentItemId === question.itemRef);
      if (new Set(matches.map((binding) => binding.stimulusId)).size !== 1)
        throw new Error("missing_or_ambiguous_authored_stimulus");
      return {
        contentItemId: question.itemRef,
        questionId: question.questionId,
        stimulusId: required(matches[0]).stimulusId,
      };
    });
    const expected = bindAuthoredAudio({
      contentRevisionId: input.contentRevisionId,
      questions: payload.questions,
      stimuli:
        payload.kind === "H1ShortAnnouncements"
          ? payload.announcements
          : payload.kind === "H2ConversationInterview"
            ? [payload.conversation]
            : payload.texts,
      authoredBindings,
      manifests,
    });
    const sorted = (entries: readonly unknown[]) => entries.map(canonicalJson).sort();
    if (canonicalJson(sorted(expected)) !== canonicalJson(sorted(bindings)))
      throw new Error("incomplete_or_conflicting_media_bindings");
  },
  hasMediaPin(learnerPayload: unknown, mediaRevisionId: string): boolean {
    const payload = payloadSchema.parse(learnerPayload);
    const stimuli =
      payload.kind === "H1ShortAnnouncements"
        ? payload.announcements
        : payload.kind === "H2ConversationInterview"
          ? [payload.conversation]
          : payload.texts;
    return stimuli.some((entry) => entry.mediaRevisionId === mediaRevisionId);
  },
  readHistoricalSeedRendition(input: unknown) {
    const source = z.object({ assetId: z.uuid() }).parse(input);
    const seed = seedAudioManifests.find((entry) => entry.assetId === source.assetId);
    if (!seed || canonicalJson(seed) !== canonicalJson(input))
      throw new Error("historical_seed_metadata_mismatch");
    const rendition: AudioRendition = {
      ...seed.rendition,
      mime: "audio/wav",
      container: "wav",
      predecessorMediaRevisionId: null,
      role: "web_primary",
      sampleRate: fakeAudioSampleRate,
      channels: fakeAudioChannels,
      bitrate: fakeAudioSampleRate * fakeAudioChannels * fakeAudioBitsPerSample,
      cachePolicyRef: "non-speech-test-only/v1",
      rightsActions: ["display", "reproduce", "cache", "download_offline"],
    };
    return {
      assetId: seed.assetId,
      sourceContentRevisionId: seedUuid("content_revision", seed.contentSeedKey),
      sourceContentDigest: required(
        contentSeedReleaseV1.entries.find((entry) => entry.seedKey === seed.contentSeedKey),
      ).digest,
      rendition,
      bytes: renderFakeSpeech(seed.script),
    };
  },
};

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("required_media_identity_missing");
  return value;
}
