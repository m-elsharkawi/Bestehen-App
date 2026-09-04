/** Offline-only composition input. No database, provider, approval or learner output. */
import { appId } from "@bestehen/domain";
import { canonicalDigest, contentRevisionDigest } from "./digest.js";
import { sealObjectiveKeyRevision, type ObjectiveKeyRevision } from "./keys.js";
import { bindAuthoredAudio, prepareNonSpeechSeedAudio } from "./media.js";
import { validateForPublication } from "./publication.js";
import {
  contentSeedReleaseV1,
  h1SeedFamilies,
  h2SeedFamilies,
  h3SeedFamilies,
} from "./seed/index.js";
import { seedUuid } from "./seed/identity.js";

/** The original T6 release must already have been applied, as a draft, by the existing seed tool. */
export function prepareCommittedSeedMediaImport() {
  const prepared = [...h1SeedFamilies, ...h2SeedFamilies, ...h3SeedFamilies].map((family) => {
    const source = family.artifact;
    const original = required(
      contentSeedReleaseV1.entries.find(
        (entry) => entry.revisionId === source.revision.contentRevisionId,
      ),
    );
    const sourcePayload = source.revision.learnerPayload;
    if (
      sourcePayload.kind !== "H1ShortAnnouncements" &&
      sourcePayload.kind !== "H2ConversationInterview" &&
      sourcePayload.kind !== "H3ShortFunctionalTexts"
    )
      throw new Error("expected_listening_seed");
    const revisionLabel = `${source.seedKey}/non-speech-catalogue-v1`;
    const revisionId = appId<"content_revision">(seedUuid("content_revision", revisionLabel));
    const rightsEnvelopeId = appId<"rights_envelope">(seedUuid("rights_envelope", revisionLabel));
    const rights = {
      ...source.rights,
      identity: {
        ...source.rights.identity,
        rightsEnvelopeId,
        revision: source.rights.identity.revision + 1,
        predecessorRightsEnvelopeId: source.rights.identity.rightsEnvelopeId,
      },
      componentScope: { ...source.rights.componentScope, componentRef: revisionId },
    };
    const stimuli =
      sourcePayload.kind === "H1ShortAnnouncements"
        ? sourcePayload.announcements
        : sourcePayload.kind === "H2ConversationInterview"
          ? [sourcePayload.conversation]
          : sourcePayload.texts;
    const audio = stimuli.map((stimulus) => {
      const seed = family.audio.find(
        (entry) => entry.rendition.mediaRevisionId === stimulus.mediaRevisionId,
      );
      if (!seed) throw new Error("missing_committed_seed_audio");
      return prepareNonSpeechSeedAudio(seed, {
        sourceContentRevisionId: source.revision.contentRevisionId,
        contentRevisionId: revisionId,
        predecessorManifestRevision: null,
        contentFamilyId: source.family.contentFamilyId,
        stimulusId: stimulus.stimulusId,
        instructionTextRevisionId: source.revision.instruction.instructionId,
        targetBlueprintVersion: source.revision.targetBlueprintRelease,
        progressionProfile: source.revision.progressionProfile,
        rightsEnvelopeId,
        accessibilityManifestRef: source.accessibility.accessibilityManifestId,
      });
    });
    const itemIds = new Map(
      source.revision.items.map((item) => [
        item.contentItemId,
        appId<"content_item">(seedUuid("content_item", `${revisionLabel}/${item.contentItemId}`)),
      ]),
    );
    const keyIds = new Map(
      source.keys.map((key) => [
        key.keyRevisionId,
        appId<"key_revision">(seedUuid("key_revision", `${revisionLabel}/${key.keyRevisionId}`)),
      ]),
    );
    const items = source.revision.items.map((item) => ({
      ...item,
      contentItemId: required(itemIds.get(item.contentItemId)),
      contentRevisionId: revisionId,
      predecessorItemId: item.contentItemId,
      scorable: {
        ...item.scorable,
        itemId: required(itemIds.get(item.contentItemId)),
        keyRevisionId: required(keyIds.get(item.scorable.keyRevisionId)),
      },
    }));
    const keys: readonly (ObjectiveKeyRevision & { readonly predecessorKeyRevisionId: string })[] =
      source.keys.map((key) => ({
        ...sealObjectiveKeyRevision({
          ...key,
          keyRevisionId: required(keyIds.get(key.keyRevisionId)),
          itemId: required(itemIds.get(key.itemId)),
          approvalDecisionId: appId<"approval_decision">(
            seedUuid("approval_decision", `unclaimed:${revisionLabel}`),
          ),
          targetAndContentLineage: {
            ...key.targetAndContentLineage,
            contentRevisionId: revisionId,
          },
        }),
        predecessorKeyRevisionId: key.keyRevisionId,
      }));
    const repin = (stimulus: (typeof stimuli)[number]) => ({
      ...stimulus,
      mediaRevisionId: appId<"media_revision">(
        required(audio.find((entry) => entry.manifest.stimulusId === stimulus.stimulusId))
          .requiredContentRepin.successorMediaRevisionId,
      ),
    });
    const questions = sourcePayload.questions.map((question) => ({
      ...question,
      itemRef: required(itemIds.get(appId<"content_item">(question.itemRef))),
    }));
    const learnerPayload =
      sourcePayload.kind === "H1ShortAnnouncements"
        ? { ...sourcePayload, questions, announcements: sourcePayload.announcements.map(repin) }
        : sourcePayload.kind === "H2ConversationInterview"
          ? { ...sourcePayload, questions, conversation: repin(sourcePayload.conversation) }
          : { ...sourcePayload, questions, texts: sourcePayload.texts.map(repin) };
    const revisionWithoutDigest = {
      ...source.revision,
      contentRevisionId: revisionId,
      predecessorRevisionId: source.revision.contentRevisionId,
      rightsEnvelopeId,
      learnerPayload,
      items,
      keyRevisionIds: keys.map((key) => key.keyRevisionId),
      mediaRevisionIds: audio.map((entry) =>
        appId<"media_revision">(entry.requiredContentRepin.successorMediaRevisionId),
      ),
    };
    const revision = {
      ...revisionWithoutDigest,
      digest: contentRevisionDigest(revisionWithoutDigest),
    };
    const validation = validateForPublication(revision, source.requestedLevel, {
      recordedResults: source.recordedResults,
      keyRevisions: keys,
      accessibilityManifest: source.accessibility,
      rightsEnvelopes: [rights],
      currentTargetBlueprintRelease: revision.targetBlueprintRelease,
      mediaRenderRecord: {
        renderedAt: "2026-09-01T00:00:00.000Z",
        afterSemanticAndLanguagePass: false,
      },
    });
    const bindings = bindAuthoredAudio({
      contentRevisionId: revisionId,
      questions,
      stimuli: stimuli.map(repin),
      authoredBindings: family.authoredMediaBindings.map((binding) => ({
        ...binding,
        contentItemId: required(itemIds.get(appId<"content_item">(binding.contentItemId))),
      })),
      manifests: audio.map((entry) => entry.manifest),
    });
    return {
      entry: {
        ...original,
        revisionLabel,
        rightsEnvelopeKey: revisionLabel,
        revisionId,
        predecessorRevisionId: source.revision.contentRevisionId,
        digest: revision.digest,
        rightsEnvelopeId,
        rights,
        revision,
        keys,
        keyRevisionIds: revision.keyRevisionIds,
        mediaRevisionIds: revision.mediaRevisionIds,
        validation,
      },
      audio,
      bindings,
      historicalSeedAudio: family.audio,
    };
  });
  const entries = prepared.map((entry) => entry.entry);
  return {
    originalRelease: contentSeedReleaseV1,
    successorRelease: {
      ...contentSeedReleaseV1,
      releaseId: seedUuid("content_release", `offline-media/v1:${canonicalDigest(entries)}`),
      entries,
      audio: [],
    },
    catalogue: {
      records: prepared.flatMap((entry) => entry.audio.map((audio) => audio.record)),
      objects: prepared.flatMap((entry) => entry.audio.flatMap((audio) => audio.objects)),
      bindings: prepared.flatMap((entry) => entry.bindings),
      historicalSeedAudio: prepared.flatMap((entry) => entry.historicalSeedAudio),
    },
    limitations: [
      "not_speech",
      "not_p4_approved",
      "owner_05_a_unclaimed",
      "byte_storage_not_performed",
    ] as const,
  };
}

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("required_media_identity_missing");
  return value;
}
