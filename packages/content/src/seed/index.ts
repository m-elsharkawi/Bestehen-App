/** The complete Stage 05 C3 seed release and its executable invariant report. */

import { createHash } from "node:crypto";
import type { TaskFamilyKind } from "../task-families.js";
import { evaluateAccessibilityGate } from "../accessibility.js";
import { validateForPublication, type PublicationValidation } from "../publication.js";
import { evaluateAction } from "../rights.js";
import { renderFakeSpeech, type SeedAudioManifest } from "./audio.js";
import {
  type SeedArtifact,
  seedApprovalLevel,
  seedReleaseIdentity,
  seedReleaseVersion,
  seedTargetBlueprintRelease,
} from "./builders.js";
import { ambiguousQuarantineFixture, sb1SeedArtifacts, withdrawalFixture } from "./language-sb1.js";
import { sb2SeedArtifacts } from "./language-sb2.js";
import { h1SeedArtifacts, h1SeedAudio } from "./listening-h1.js";
import { h2SeedArtifacts, h2SeedAudio } from "./listening-h2.js";
import { h3SeedArtifacts, h3SeedAudio } from "./listening-h3.js";
import { r1SeedArtifacts } from "./reading-r1.js";
import { r2SeedArtifacts } from "./reading-r2.js";
import { r3SeedArtifacts } from "./reading-r3.js";
import { seedUuid } from "./identity.js";

export const seedArtifactsByTaskFamily = {
  R1HeadingMatching: r1SeedArtifacts,
  R2DetailedSelect: r2SeedArtifacts,
  R3SituationNoticeMatching: r3SeedArtifacts,
  SB1ContextualGrammarCloze: sb1SeedArtifacts,
  SB2SharedBankLexicalCloze: sb2SeedArtifacts,
  H1ShortAnnouncements: h1SeedArtifacts,
  H2ConversationInterview: h2SeedArtifacts,
  H3ShortFunctionalTexts: h3SeedArtifacts,
} as const satisfies Readonly<Record<TaskFamilyKind, readonly SeedArtifact[]>>;

export const servingSeedArtifacts: readonly SeedArtifact[] =
  Object.values(seedArtifactsByTaskFamily).flat();

export const negativeSeedFixtures = {
  quarantine: ambiguousQuarantineFixture,
  withdrawal: withdrawalFixture,
} as const;

export const seedAudioManifests: readonly SeedAudioManifest[] = [
  ...h1SeedAudio,
  ...h2SeedAudio,
  ...h3SeedAudio,
];

function publicationValidation(artifact: SeedArtifact): PublicationValidation {
  return validateForPublication(artifact.revision, seedApprovalLevel, {
    recordedResults: artifact.recordedResults,
    keyRevisions: artifact.keys,
    accessibilityManifest: artifact.accessibility,
    rightsEnvelopes: [artifact.rights],
    currentTargetBlueprintRelease: seedTargetBlueprintRelease,
    ...(artifact.revision.learnerPayload.kind.startsWith("H")
      ? {
          mediaRenderRecord: {
            renderedAt: artifact.revision.frozenAt ?? "2026-09-01T00:00:00.000Z",
            afterSemanticAndLanguagePass: true,
          },
        }
      : {}),
  });
}

export interface SeedInvariantFinding {
  readonly code: string;
  readonly identity: string;
  readonly detail: string;
}

function cardinalityFindings(artifact: SeedArtifact): readonly SeedInvariantFinding[] {
  const payload = artifact.revision.learnerPayload;
  const fail = (detail: string): readonly SeedInvariantFinding[] => [
    { code: "seed_cardinality_mismatch", identity: artifact.seedKey, detail },
  ];
  switch (payload.kind) {
    case "R1HeadingMatching":
      return payload.texts.length === 5 && payload.headings.length === 7
        ? []
        : fail("R1 requires five texts and seven headings.");
    case "R2DetailedSelect":
      return payload.questions.length === 5 &&
        payload.questions.every((q) => q.options.length === 3)
        ? []
        : fail("R2 requires five questions with three options each.");
    case "R3SituationNoticeMatching":
      return payload.situations.length === 10 &&
        payload.notices.length === 12 &&
        payload.noMatchOption
        ? []
        : fail("R3 requires ten situations, twelve notices and an explicit no-match option.");
    case "SB1ContextualGrammarCloze":
      return payload.gaps.length === 6 && payload.gaps.every((gap) => gap.options.length === 3)
        ? []
        : fail("SB1 requires six gaps with three local options each.");
    case "SB2SharedBankLexicalCloze":
      return payload.gaps.length === 6 &&
        payload.candidateBank.length === 10 &&
        payload.candidateReusePolicy === "at_most_once"
        ? []
        : fail("SB2 requires six gaps, ten candidates and reuse-at-most-once.");
    case "H1ShortAnnouncements":
      return payload.announcements.length === 5 &&
        payload.questions.length === 5 &&
        payload.allowedPlayCountPerText === 1
        ? []
        : fail("H1 requires five texts, five items and one play per text.");
    case "H2ConversationInterview":
      return payload.questions.length === 5 && payload.allowedPlayCount === 2
        ? []
        : fail("H2 requires one connected dialogue, five items and two plays.");
    case "H3ShortFunctionalTexts":
      return payload.texts.length === 5 &&
        payload.questions.length === 5 &&
        payload.allowedPlayCountPerText === 2
        ? []
        : fail("H3 requires five texts, five items and two plays per text.");
  }
}

export interface SeedReleaseValidation {
  readonly valid: boolean;
  readonly findings: readonly SeedInvariantFinding[];
  readonly publicationByRevisionId: Readonly<Record<string, PublicationValidation>>;
}

export function validateSeedRelease(): SeedReleaseValidation {
  const findings: SeedInvariantFinding[] = [];
  const publicationByRevisionId: Record<string, PublicationValidation> = {};
  for (const [kind, artifacts] of Object.entries(seedArtifactsByTaskFamily)) {
    if (artifacts.length !== 2) {
      findings.push({
        code: "seed_family_count",
        identity: kind,
        detail: "Each task family requires exactly two fresh-equivalent siblings.",
      });
    }
  }
  const seen = new Map<string, string>();
  for (const artifact of [...servingSeedArtifacts, ...Object.values(negativeSeedFixtures)]) {
    for (const [label, id] of [
      ["family", artifact.family.contentFamilyId],
      ["revision", artifact.revision.contentRevisionId],
      ["rights", artifact.rights.identity.rightsEnvelopeId],
    ] as const) {
      const prior = seen.get(id);
      if (prior)
        findings.push({
          code: "duplicate_seed_identity",
          identity: id,
          detail: `${prior} and ${artifact.seedKey}/${label} share an identity.`,
        });
      seen.set(id, `${artifact.seedKey}/${label}`);
    }
    if (artifact.revision.contentClass !== "C3")
      findings.push({
        code: "seed_class",
        identity: artifact.seedKey,
        detail: "Every seed artifact is C3 App-original practice.",
      });
    if (
      artifact.rights.provenance.corpusBundleRef !== null ||
      artifact.rights.provenance.groundingManifest !== "originally-authored"
    ) {
      findings.push({
        code: "seed_provenance",
        identity: artifact.seedKey,
        detail: "Seed provenance must state App-original authorship without a Corpus source.",
      });
    }
  }
  for (const artifact of servingSeedArtifacts) {
    findings.push(...cardinalityFindings(artifact));
    const validation = publicationValidation(artifact);
    publicationByRevisionId[artifact.revision.contentRevisionId] = validation;
    if (validation.decision !== "publishable")
      findings.push({
        code: "serving_seed_not_publishable",
        identity: artifact.seedKey,
        detail: `${validation.firstBlockingGate ?? "unknown"}: ${validation.findings.map((entry) => entry.code).join(", ")}`,
      });
  }
  const quarantineValidation = publicationValidation(ambiguousQuarantineFixture);
  publicationByRevisionId[ambiguousQuarantineFixture.revision.contentRevisionId] =
    quarantineValidation;
  if (quarantineValidation.decision !== "quarantine_required")
    findings.push({
      code: "quarantine_fixture_not_quarantined",
      identity: ambiguousQuarantineFixture.seedKey,
      detail: "The blind-validator disagreement must require quarantine.",
    });
  const withdrawalValidation = publicationValidation(withdrawalFixture);
  publicationByRevisionId[withdrawalFixture.revision.contentRevisionId] = withdrawalValidation;
  if (
    withdrawalFixture.rights.identity.state !== "withdrawn" ||
    withdrawalValidation.decision === "publishable"
  )
    findings.push({
      code: "withdrawal_fixture_servable",
      identity: withdrawalFixture.seedKey,
      detail: "The withdrawn fixture must fail future serving publication.",
    });

  let totalAudioBytes = 0;
  const mediaIds = new Set<string>();
  for (const manifest of seedAudioManifests) {
    totalAudioBytes += manifest.rendition.bytes;
    const bytes = renderFakeSpeech(manifest.script);
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (bytes.length !== manifest.rendition.bytes || digest !== manifest.rendition.digest)
      findings.push({
        code: "fake_audio_manifest_mismatch",
        identity: manifest.assetKey,
        detail: "Rendered fake bytes do not match their pinned length and digest.",
      });
    if (mediaIds.has(manifest.rendition.mediaRevisionId))
      findings.push({
        code: "duplicate_media_revision",
        identity: manifest.rendition.mediaRevisionId,
        detail: "A media revision may appear once in the release.",
      });
    mediaIds.add(manifest.rendition.mediaRevisionId);
  }
  if (totalAudioBytes > 250_000)
    findings.push({
      code: "fake_audio_budget",
      identity: seedReleaseIdentity,
      detail: `${totalAudioBytes} bytes exceed the 250000-byte seed budget.`,
    });
  const pinnedMedia = new Set<string>(
    servingSeedArtifacts.flatMap((artifact) => artifact.revision.mediaRevisionIds),
  );
  for (const mediaId of mediaIds)
    if (!pinnedMedia.has(mediaId))
      findings.push({
        code: "orphan_seed_media",
        identity: mediaId,
        detail: "A fake audio manifest is not pinned by any seed revision.",
      });

  return { valid: findings.length === 0, findings, publicationByRevisionId };
}

export const seedReleaseValidation = validateSeedRelease();
if (!seedReleaseValidation.valid) {
  throw new Error(
    `Invalid Stage 05 seed release: ${seedReleaseValidation.findings.map((finding) => `${finding.code}@${finding.identity}`).join(", ")}`,
  );
}

export interface SeedReleaseDocumentEntry {
  readonly seedKey: string;
  readonly intent: SeedArtifact["intent"];
  readonly familyId: string;
  readonly taskFamily: TaskFamilyKind;
  readonly revisionId: string;
  readonly predecessorRevisionId: string | null;
  readonly digest: string;
  readonly requestedLevel: SeedArtifact["requestedLevel"];
  readonly contentClass: "C3";
  readonly rightsState: SeedArtifact["rights"]["identity"]["state"];
  readonly rightsEnvelopeId: string;
  readonly rightsActionEvaluation: {
    readonly display: ReturnType<typeof evaluateAction>;
    readonly cache: ReturnType<typeof evaluateAction>;
    readonly downloadOffline: ReturnType<typeof evaluateAction>;
  };
  readonly accessibilityManifestId: string;
  readonly accessibilityGate: ReturnType<typeof evaluateAccessibilityGate>;
  readonly keyRevisionIds: readonly string[];
  readonly mediaRevisionIds: readonly string[];
  readonly validation: PublicationValidation;
}

export interface SeedReleaseDocument {
  readonly schema: "bestehen-seed-release/v1";
  readonly releaseId: string;
  readonly releaseIdentity: typeof seedReleaseIdentity;
  readonly generatedFrom: "typed-seed-source";
  readonly entries: readonly SeedReleaseDocumentEntry[];
  readonly audio: readonly SeedAudioManifest[];
}

function releaseEntry(artifact: SeedArtifact): SeedReleaseDocumentEntry {
  return {
    seedKey: artifact.seedKey,
    intent: artifact.intent,
    familyId: artifact.family.contentFamilyId,
    taskFamily: artifact.family.taskFamilyKind,
    revisionId: artifact.revision.contentRevisionId,
    predecessorRevisionId: artifact.revision.predecessorRevisionId ?? null,
    digest: artifact.revision.digest,
    requestedLevel: artifact.requestedLevel,
    contentClass: "C3",
    rightsState: artifact.rights.identity.state,
    rightsEnvelopeId: artifact.rights.identity.rightsEnvelopeId,
    rightsActionEvaluation: {
      display: evaluateAction(artifact.rights, "display"),
      cache: evaluateAction(artifact.rights, "cache"),
      downloadOffline: evaluateAction(artifact.rights, "download_offline"),
    },
    accessibilityManifestId: artifact.accessibility.accessibilityManifestId,
    accessibilityGate: evaluateAccessibilityGate(artifact.accessibility),
    keyRevisionIds: artifact.keys.map((key) => key.keyRevisionId),
    mediaRevisionIds: artifact.revision.mediaRevisionIds,
    validation: seedReleaseValidation.publicationByRevisionId[
      artifact.revision.contentRevisionId
    ] as PublicationValidation,
  };
}

export const contentSeedReleaseV1: SeedReleaseDocument = {
  schema: "bestehen-seed-release/v1",
  releaseId: seedUuid("content_release", `${seedReleaseIdentity}/${seedReleaseVersion}`),
  releaseIdentity: seedReleaseIdentity,
  generatedFrom: "typed-seed-source",
  entries: [...servingSeedArtifacts, ambiguousQuarantineFixture, withdrawalFixture].map(
    releaseEntry,
  ),
  audio: seedAudioManifests,
};

export * from "./audio.js";
export * from "./builders.js";
export * from "./identity.js";
export * from "./language-sb1.js";
export * from "./language-sb2.js";
export * from "./listening-h1.js";
export * from "./listening-h2.js";
export * from "./listening-h3.js";
export * from "./reading-r1.js";
export * from "./reading-r2.js";
export * from "./reading-r3.js";
export * from "./rights.js";
