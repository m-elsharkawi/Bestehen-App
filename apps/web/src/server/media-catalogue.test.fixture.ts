import { createHash, randomUUID } from "node:crypto";
import {
  audioAssetManifestSchema,
  audioCatalogueValidator,
  canonicalDigest,
  prepareCommittedSeedMediaImport,
  serializeAudioManifest,
} from "@bestehen/content";
import { type AuthorizedScope, appId, type ContentClass } from "@bestehen/domain";
import {
  type ApprovalDecisionInput,
  createPostgresPool,
  executePostgresSeedCommand,
  migrateDatabase,
  type OfflineMediaCatalogueInput,
  PostgresContentRepository,
  validateSeedReleaseDocument,
} from "@bestehen/infrastructure";
import { withIsolatedDatabase } from "@bestehen/test-support";
import { expect } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
type Pool = ReturnType<typeof createPostgresPool>;
export async function setup(run: (pool: Pool) => Promise<void>) {
  await withIsolatedDatabase(required(databaseUrl), async (url) => {
    await migrateDatabase(url);
    const pool = createPostgresPool(url);
    try {
      const prepared = prepareCommittedSeedMediaImport();
      const report = await executePostgresSeedCommand(pool, {
        command: "apply",
        release: validateSeedReleaseDocument(prepared.originalRelease),
        operationId: randomUUID(),
        dryRun: false,
        reportPath: null,
        selector: null,
        reason: null,
        occurredAt: new Date().toISOString(),
      });
      expect(report.summary.hardFailures).toBe(0);
      await run(pool);
    } finally {
      await pool.end();
    }
  });
}
export async function immutableSourceSnapshot(pool: Pool) {
  return (
    await pool.query(
      `SELECT jsonb_build_object('revision',to_jsonb(c),'items',(SELECT jsonb_agg(to_jsonb(i) ORDER BY i.id) FROM app.content_items i WHERE i.content_revision_id=c.id),'keys',(SELECT jsonb_agg(to_jsonb(k) ORDER BY k.id) FROM app.key_revisions k WHERE k.content_revision_id=c.id),'rights',to_jsonb(r)) AS value FROM app.content_revisions c JOIN app.rights_envelopes r ON r.id=c.rights_envelope_id WHERE c.predecessor_id IS NULL ORDER BY c.id`,
    )
  ).rows;
}

const bytesDigest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
export async function approval(
  pool: Pool,
  input: Pick<
    ApprovalDecisionInput,
    "decisionId" | "subjectId" | "subjectKind" | "contentClass" | "level" | "evidenceRef"
  >,
) {
  const result = await new PostgresContentRepository(pool).appendApprovalDecision({
    ...input,
    outcome: "granted",
    authorRef: "synthetic-author",
    validatorRef: "synthetic-validator",
    approverRef: "synthetic-approver",
    methodVersion: "synthetic-only/v1",
    reasonCode: "VALIDITY.CONTENT_QUARANTINED_AFTER_PIN",
    decidedAt: new Date(),
  });
  expect(result.ok).toBe(true);
}
/** Synthetic metadata/byte-contract proof only. Not speech decoding, actual review or publication. */
export async function syntheticSpeech(
  pool: Pool,
  familyKey: string,
  contentClass: ContentClass = "C3",
  extraCandidate = false,
  profile: "P0" | "P1" | "P2" | "P3" | "P4" = "P4",
) {
  const familyId = randomUUID();
  const revisionId = randomUUID();
  const assetId = randomUUID();
  const mediaId = randomUUID();
  const transcriptId = randomUUID();
  const rightsId = randomUUID();
  const transcriptRightsId = randomUUID();
  const itemId = randomUUID();
  const approvalId = randomUUID();
  const accessibilityId = `synthetic/${randomUUID()}`;
  const prepared = prepareCommittedSeedMediaImport();
  const base = audioCatalogueValidator.readManifest(
    required(
      prepared.catalogue.records.find(
        (r) => JSON.parse(r.canonicalManifest).listeningFamily === "H2",
      ),
    ),
  );
  const fullBase = audioAssetManifestSchema.parse(
    JSON.parse(
      required(prepared.catalogue.records.find((r) => r.assetId === base.assetId))
        .canonicalManifest,
    ),
  );
  const audioBytes = Buffer.from(`synthetic encoded-byte contract ${assetId}`);
  const masterBytes = Buffer.from(`synthetic master-byte contract ${assetId}`);
  const transcriptBytes = Buffer.from("Synthetischer privater Text.");
  const candidate = {
    ...required(fullBase.learnerMediaRevisions[0]),
    mediaRevisionId: mediaId,
    predecessorMediaRevisionId: null,
    objectKey: `media/approved/audio/${mediaId}.mp3`,
    digest: bytesDigest(audioBytes),
    bytes: audioBytes.length,
    mime: "audio/mpeg" as const,
    codec: "mp3",
    container: "mp3" as const,
    durationMs: 1000,
    cachePolicyRef: "synthetic/v1",
  };
  const optimizedBytes = Buffer.from(`synthetic alternate-byte contract ${assetId}`);
  const optimized = {
    ...candidate,
    mediaRevisionId: randomUUID(),
    role: "future_optimized" as const,
    objectKey: `media/approved/audio/${assetId}/alternate.mp3`,
    digest: bytesDigest(optimizedBytes),
    bytes: optimizedBytes.length,
  };
  const manifest = audioAssetManifestSchema.parse({
    ...fullBase,
    assetId,
    manifestRevision: "synthetic-manifest/v1",
    predecessorManifestRevision: null,
    contentRevisionId: revisionId,
    contentFamilyId: familyId,
    stimulusId: "synthetic-conversation",
    sourceRole: "reviewed_tts",
    progressionProfile: profile,
    speakerCount: 1,
    limitations: [],
    status: "current",
    rightsEnvelopeRef: rightsId,
    accessibilityManifestRef: accessibilityId,
    sourceMaster: {
      masterRevisionId: randomUUID(),
      objectKey: `audio/raw/${assetId}/master.flac`,
      digest: bytesDigest(masterBytes),
      bytes: masterBytes.length,
      format: "flac",
    },
    learnerMediaRevisions: extraCandidate ? [candidate, optimized] : [candidate],
    transcript: {
      ...fullBase.transcript,
      transcriptRevisionId: transcriptId,
      mediaRevisionId: mediaId,
      objectKey: `media/approved/private-transcripts/${transcriptId}/${bytesDigest(transcriptBytes)}.txt`,
      digest: bytesDigest(transcriptBytes),
      rightsEnvelopeRef: transcriptRightsId,
      earliestRevealPhase: profile === "P4" ? "after_block" : "after_attempt",
    },
    qa: {
      ...fullBase.qa,
      scriptMatch: "pass",
      pronunciation: "pass",
      cueAlignment: "pass",
      clipping: "pass",
      silence: "pass",
      loudness: "pass",
      artifacts: "pass",
      speakerAttribution: "pass",
      targetCalibration: "pass",
      reviewerRefs: ["synthetic-only:no-human-approval"],
      goldRelease: "synthetic-gold",
    },
    approval: { decisionId: approvalId, level: "training" },
  });
  const record = serializeAudioManifest(manifest);
  const payload = {
    kind: "H2ConversationInterview",
    conversation: { stimulusId: manifest.stimulusId, mediaRevisionId: mediaId },
    questions: [{ itemRef: itemId, questionId: "synthetic-question" }],
    allowedPlayCount: 2,
  };
  const rights = {
    ...required(prepared.successorRelease.entries[0]).rights,
    identity: {
      ...required(prepared.successorRelease.entries[0]).rights.identity,
      rightsEnvelopeId: rightsId,
    },
    componentScope: { componentRef: revisionId, componentKind: "composite" },
    conditions: [],
    actionEligibility: {
      actions: {
        display: "allowed",
        reproduce: "allowed",
        cache: "allowed",
        download_offline: "allowed",
      },
      territoryLimit: null,
      audienceLimit: null,
    },
  };
  await pool.query(
    "INSERT INTO app.content_families(id,family_key,task_family_kind) VALUES($1,$2,'H2ConversationInterview')",
    [familyId, familyKey],
  );
  await pool.query(
    "INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest) VALUES($1,$2,'current',$3,$4)",
    [rightsId, `synthetic/${rightsId}`, rights, canonicalDigest(rights)],
  );
  const transcriptRights = {
    ...rights,
    identity: { ...rights.identity, rightsEnvelopeId: transcriptRightsId },
    componentScope: { componentRef: transcriptId, componentKind: "transcript" },
  };
  await pool.query(
    "INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest) VALUES($1,$2,'current',$3,$4)",
    [
      transcriptRightsId,
      `synthetic/${transcriptRightsId}`,
      transcriptRights,
      canonicalDigest(transcriptRights),
    ],
  );
  await pool.query(
    "INSERT INTO app.accessibility_manifests(id,manifest,language_tag,gate_status,digest) VALUES($1,'{}','de','pass',$2)",
    [accessibilityId, canonicalDigest(accessibilityId)],
  );
  await pool.query(
    "INSERT INTO app.content_revisions(id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest,content_class,rights_envelope_id,accessibility_manifest_id,learner_payload,instruction,progression_profile) VALUES($1,$2,'synthetic-v1','learning_practice','candidate','eligible','compatible',$3,$4,$5,$6,$7,'{}',$8)",
    [
      revisionId,
      familyId,
      canonicalDigest(revisionId),
      contentClass,
      rightsId,
      accessibilityId,
      payload,
      profile,
    ],
  );
  await pool.query(
    "UPDATE app.content_revisions SET instruction=$2,target_blueprint_release=$3 WHERE id=$1",
    [
      revisionId,
      { instructionId: manifest.instructionTextRevisionId },
      manifest.targetBlueprintVersion,
    ],
  );
  await pool.query(
    "INSERT INTO app.content_items(id,content_revision_id,ordinal,response_kind,binding,scorable) VALUES($1,$2,1,'single_select',$3,$4)",
    [itemId, revisionId, { kind: "select", questionId: "synthetic-question" }, { itemId }],
  );
  await approval(pool, {
    decisionId: randomUUID(),
    subjectId: revisionId,
    subjectKind: "content_revision",
    contentClass,
    level: "training",
    evidenceRef: "synthetic-only",
  });
  await approval(pool, {
    decisionId: approvalId,
    subjectId: assetId,
    subjectKind: "media_asset",
    contentClass,
    level: "training",
    evidenceRef: `audio-manifest/sha256/${record.digest}`,
  });
  const releaseId = randomUUID();
  await pool.query(
    "INSERT INTO app.content_releases(id,release_identity,state,digest) VALUES($1,$2,'active',$3)",
    [releaseId, `synthetic/${familyKey}`, canonicalDigest(releaseId)],
  );
  await pool.query(
    "INSERT INTO app.content_release_entries(release_id,content_revision_id) VALUES($1,$2)",
    [releaseId, revisionId],
  );
  const input: OfflineMediaCatalogueInput = {
    records: [record],
    bindings: manifest.learnerMediaRevisions.map((rendition) => ({
      contentRevisionId: revisionId,
      contentItemId: itemId,
      stimulusId: manifest.stimulusId,
      assetId,
      manifestRevision: manifest.manifestRevision,
      mediaRevisionId: rendition.mediaRevisionId,
    })),
    objects: [
      { objectKey: candidate.objectKey, bytes: audioBytes },
      { objectKey: manifest.sourceMaster.objectKey, bytes: masterBytes },
      { objectKey: manifest.transcript.objectKey, bytes: transcriptBytes },
      ...(extraCandidate ? [{ objectKey: optimized.objectKey, bytes: optimizedBytes }] : []),
    ],
  };
  return {
    familyId,
    revisionId,
    assetId,
    mediaId,
    itemId,
    rightsId,
    transcriptRightsId,
    approvalId,
    manifest,
    record,
    input,
  };
}

export async function scopeFor(pool: Pool): Promise<AuthorizedScope> {
  const id = randomUUID();
  await pool.query("INSERT INTO app.learner_scopes(id,state) VALUES($1,'active')", [id]);
  return {
    learnerScopeId: appId(id),
    principalId: appId(randomUUID()),
    actorKind: "owner",
    capabilities: [],
    authenticatedAt: new Date(),
  };
}

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("required_media_identity_missing");
  return value;
}
