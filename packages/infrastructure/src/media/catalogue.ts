import { createHash } from "node:crypto";
import { canHoldApprovalLevel } from "@bestehen/domain";
import type {
  AudioCatalogueRecord,
  AudioCatalogueValidator,
  CatalogueAudioManifest,
  CatalogueMediaBinding,
  CatalogueRendition,
} from "@bestehen/application";
import type { Pool, PoolClient } from "pg";
import { inTransaction } from "../postgres/foundation-repository.js";

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
    .join(",")}}`;
}
const sha = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
const same = (left: unknown, right: unknown) => canonical(left) === canonical(right);

export class MediaCatalogueError extends Error {
  constructor(
    readonly reason:
      | "invalid_media"
      | "immutable_conflict"
      | "scope_mismatch"
      | "media_unavailable",
  ) {
    super(reason);
  }
}
function requireFact(value: unknown, reason: MediaCatalogueError["reason"]): asserts value {
  if (!value) throw new MediaCatalogueError(reason);
}

/** Identifiers are code-owned constants, never arguments received from an importer. */
async function immutableInsert(
  client: PoolClient,
  table: string,
  identity: Readonly<Record<string, unknown>>,
  facts: Readonly<Record<string, unknown>>,
  allowCreate = true,
): Promise<boolean> {
  const keys = Object.keys(identity);
  const query = `SELECT ${Object.keys(facts).join(",")} FROM app.${table} WHERE ${keys.map((key, i) => `${key}=$${i + 1}`).join(" AND ")}`;
  const existing = await client.query(query, Object.values(identity));
  if (existing.rows[0]) {
    requireFact(same(existing.rows[0], facts), "immutable_conflict");
    return false;
  }
  requireFact(allowCreate, "immutable_conflict");
  const fields = Object.keys(facts);
  await client.query(
    `INSERT INTO app.${table}(${fields.join(",")}) VALUES(${fields.map((_, i) => `$${i + 1}`).join(",")})`,
    Object.values(facts).map((value) =>
      value !== null && typeof value === "object" ? JSON.stringify(value) : value,
    ),
  );
  return true;
}

function renditionFacts(assetId: string, rendition: CatalogueRendition) {
  return {
    id: rendition.mediaRevisionId,
    asset_id: assetId,
    predecessor_id: rendition.predecessorMediaRevisionId,
    role: rendition.role,
    object_key: rendition.objectKey,
    byte_digest: rendition.digest,
    bytes: String(rendition.bytes),
    mime: rendition.mime,
    codec: rendition.codec,
    container: rendition.container,
    duration_ms: rendition.durationMs,
    sample_rate: rendition.sampleRate,
    channels: rendition.channels,
    bitrate: rendition.bitrate,
    cache_policy_ref: rendition.cachePolicyRef,
    rights_actions: rendition.rightsActions,
    // Rendition identity never depends on an aggregate or transcript successor.
    manifest_digest: sha(canonical({ assetId, rendition })),
  };
}
function transcriptFacts(manifest: CatalogueAudioManifest) {
  const transcript = manifest.transcript;
  return {
    id: transcript.transcriptRevisionId,
    media_revision_id: transcript.mediaRevisionId,
    kind: transcript.kind,
    answer_bearing: transcript.answerBearing,
    earliest_reveal_phase: transcript.earliestRevealPhase,
    rights_envelope_id: transcript.rightsEnvelopeRef,
    language: transcript.language,
    digest: transcript.digest,
  };
}
function bindingFacts(binding: CatalogueMediaBinding) {
  return {
    content_revision_id: binding.contentRevisionId,
    content_item_id: binding.contentItemId,
    stimulus_id: binding.stimulusId,
    asset_id: binding.assetId,
    manifest_revision: binding.manifestRevision,
    media_revision_id: binding.mediaRevisionId,
  };
}
function recordFacts(record: AudioCatalogueRecord) {
  return {
    asset_id: record.assetId,
    manifest_revision: record.manifestRevision,
    content_revision_id: record.contentRevisionId,
    stimulus_id: record.stimulusId,
    canonicalization_version: record.canonicalizationVersion,
    canonical_manifest: record.canonicalManifest,
    digest: record.digest,
  };
}
function toRecord(row: Record<string, unknown>): AudioCatalogueRecord {
  requireFact(row.canonicalization_version === "canonical-json/v1", "invalid_media");
  return {
    assetId: String(row.asset_id),
    manifestRevision: String(row.manifest_revision),
    contentRevisionId: String(row.content_revision_id),
    stimulusId: String(row.stimulus_id),
    canonicalizationVersion: row.canonicalization_version,
    canonicalManifest: String(row.canonical_manifest),
    digest: String(row.digest),
  };
}

export interface OfflineMediaCatalogueInput {
  readonly records: readonly AudioCatalogueRecord[];
  readonly bindings: readonly CatalogueMediaBinding[];
  readonly objects: readonly { readonly objectKey: string; readonly bytes: Uint8Array }[];
  /** Only exact committed non-speech seed metadata may reconcile an absent historical rendition. */
  readonly historicalSeedAudio?: readonly unknown[];
  /** Explicit publication of an already approved exact successor; draft storage never advances it. */
  readonly activateApprovedSuccessor?: boolean;
}

/** No object-store or network access. Verifies supplied bytes and persists catalogue facts only. */
export class PostgresMediaCatalogue {
  constructor(
    private readonly pool: Pool,
    readonly validator: AudioCatalogueValidator,
  ) {}

  private parse(record: AudioCatalogueRecord): CatalogueAudioManifest {
    requireFact(
      record.canonicalizationVersion === "canonical-json/v1" &&
        sha(record.canonicalManifest) === record.digest,
      "invalid_media",
    );
    return this.validator.readManifest(record);
  }

  async importCatalogue(input: OfflineMediaCatalogueInput): Promise<{
    readonly disposition: "created" | "replayed";
    readonly byteStorage: "not_performed";
    readonly learnerAdmission: "not_granted";
  }> {
    input = structuredClone(input);
    const manifests = input.records.map((record) => this.parse(record));
    requireFact(
      manifests.length > 0 && new Set(manifests.map((m) => m.assetId)).size === manifests.length,
      "invalid_media",
    );
    const objects = new Map(input.objects.map((object) => [object.objectKey, object.bytes]));
    requireFact(objects.size === input.objects.length, "invalid_media");
    const expectedKeys = new Set<string>();
    for (const manifest of manifests) {
      for (const object of [
        ...manifest.learnerMediaRevisions,
        manifest.sourceMaster,
        manifest.transcript,
      ]) {
        const bytes = objects.get(object.objectKey);
        requireFact(
          bytes &&
            sha(bytes) === object.digest &&
            (!("bytes" in object) || bytes.length === object.bytes),
          "invalid_media",
        );
        expectedKeys.add(object.objectKey);
      }
    }
    requireFact(objects.size === expectedKeys.size, "invalid_media");
    const historical = (input.historicalSeedAudio ?? []).map((seed) =>
      this.validator.readHistoricalSeedRendition(seed),
    );
    requireFact(
      new Set(historical.map((entry) => entry.rendition.mediaRevisionId)).size ===
        historical.length,
      "invalid_media",
    );
    return inTransaction(this.pool, async (client) => {
      let created = false;
      for (const assetId of manifests.map((entry) => entry.assetId).sort())
        await client.query("SELECT pg_advisory_xact_lock(420106,hashtext($1))", [assetId]);
      for (const contentRevisionId of [
        ...new Set(manifests.map((entry) => entry.contentRevisionId)),
      ].sort()) {
        const content = await client.query(
          "SELECT family_id,learner_payload,progression_profile,instruction,target_blueprint_release FROM app.content_revisions WHERE id=$1 FOR SHARE",
          [contentRevisionId],
        );
        requireFact(content.rows[0], "scope_mismatch");
        const records = input.records.filter(
          (record) => record.contentRevisionId === contentRevisionId,
        );
        const bindings = input.bindings.filter(
          (binding) => binding.contentRevisionId === contentRevisionId,
        );
        this.validator.validateBindings({
          contentRevisionId,
          learnerPayload: content.rows[0].learner_payload,
          bindings,
          records,
        });
        const items = await client.query(
          "SELECT id FROM app.content_items WHERE content_revision_id=$1 ORDER BY id",
          [contentRevisionId],
        );
        requireFact(
          same(
            items.rows.map((row) => row.id),
            [...new Set(bindings.map((binding) => binding.contentItemId))].sort(),
          ),
          "scope_mismatch",
        );
        requireFact(
          manifests
            .filter((m) => m.contentRevisionId === contentRevisionId)
            .every(
              (m) =>
                m.contentFamilyId === content.rows[0].family_id &&
                m.progressionProfile === content.rows[0].progression_profile &&
                m.instructionTextRevisionId === content.rows[0].instruction?.instructionId &&
                m.targetBlueprintVersion === content.rows[0].target_blueprint_release,
            ),
          "scope_mismatch",
        );
      }
      requireFact(
        input.bindings.every((binding) =>
          input.records.some(
            (record) =>
              record.assetId === binding.assetId &&
              record.manifestRevision === binding.manifestRevision &&
              record.contentRevisionId === binding.contentRevisionId,
          ),
        ),
        "scope_mismatch",
      );
      for (const manifest of manifests) {
        await this.checkRights(client, manifest);
        const asset = await client.query("SELECT * FROM app.media_assets WHERE id=$1 FOR UPDATE", [
          manifest.assetId,
        ]);
        if (asset.rows[0]) {
          requireFact(
            asset.rows[0].kind === "audio" &&
              asset.rows[0].content_family_id === manifest.contentFamilyId &&
              asset.rows[0].listening_family === manifest.listeningFamily,
            "scope_mismatch",
          );
        } else {
          await client.query(
            `INSERT INTO app.media_assets(id,kind,manifest_revision,content_family_id,listening_family,source_role,authored_speed_ratio,generator,qa,rights_envelope_id,accessibility_manifest_id,status,digest)
            VALUES($1,'audio',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
            [
              manifest.assetId,
              manifest.manifestRevision,
              manifest.contentFamilyId,
              manifest.listeningFamily,
              manifest.sourceRole,
              manifest.authoredSpeedRatio,
              manifest.generator,
              manifest.qa,
              manifest.rightsEnvelopeRef,
              manifest.accessibilityManifestRef,
              manifest.status,
              sha(
                canonical({
                  assetId: manifest.assetId,
                  contentFamilyId: manifest.contentFamilyId,
                  listeningFamily: manifest.listeningFamily,
                }),
              ),
            ],
          );
          created = true;
        }
        const oldManifest = await client.query(
          "SELECT canonical_manifest FROM app.audio_asset_manifests WHERE asset_id=$1 AND manifest_revision=$2",
          [manifest.assetId, manifest.manifestRevision],
        );
        const record = required(input.records.find((r) => r.assetId === manifest.assetId));
        const isReplay = Boolean(oldManifest.rows[0]);
        if (isReplay)
          requireFact(
            oldManifest.rows[0].canonical_manifest === record.canonicalManifest,
            "immutable_conflict",
          );
        if (manifest.approval.decisionId)
          await this.checkApproval(client, record, manifest, !isReplay);
        if (!oldManifest.rows[0] && asset.rows[0]) {
          requireFact(
            manifest.predecessorManifestRevision === asset.rows[0].manifest_revision,
            "immutable_conflict",
          );
          const predecessor = await client.query(
            "SELECT 1 FROM app.audio_asset_manifests WHERE asset_id=$1 AND manifest_revision=$2",
            [manifest.assetId, manifest.predecessorManifestRevision],
          );
          requireFact(predecessor.rowCount === 1, "immutable_conflict");
        }
        for (const entry of historical.filter((h) => h.assetId === manifest.assetId)) {
          requireFact(
            manifest.sourceRole === "deterministic_non_speech_fixture" &&
              manifest.learnerMediaRevisions.some(
                (r) => r.predecessorMediaRevisionId === entry.rendition.mediaRevisionId,
              ),
            "scope_mismatch",
          );
          const original = await client.query(
            "SELECT family_id,learner_payload,digest FROM app.content_revisions WHERE id=$1",
            [entry.sourceContentRevisionId],
          );
          requireFact(
            original.rows[0]?.family_id === manifest.contentFamilyId &&
              original.rows[0].digest === entry.sourceContentDigest &&
              this.validator.hasMediaPin(
                original.rows[0].learner_payload,
                entry.rendition.mediaRevisionId,
              ),
            "scope_mismatch",
          );
          requireFact(
            sha(entry.bytes) === entry.rendition.digest &&
              entry.bytes.length === entry.rendition.bytes,
            "invalid_media",
          );
          created =
            (await immutableInsert(
              client,
              "media_revisions",
              { id: entry.rendition.mediaRevisionId },
              renditionFacts(manifest.assetId, entry.rendition),
              !isReplay,
            )) || created;
        }
        for (const rendition of manifest.learnerMediaRevisions) {
          if (rendition.predecessorMediaRevisionId) {
            const predecessor = await client.query(
              "SELECT asset_id FROM app.media_revisions WHERE id=$1",
              [rendition.predecessorMediaRevisionId],
            );
            requireFact(predecessor.rows[0]?.asset_id === manifest.assetId, "scope_mismatch");
          }
          created =
            (await immutableInsert(
              client,
              "media_revisions",
              { id: rendition.mediaRevisionId },
              renditionFacts(manifest.assetId, rendition),
              !isReplay,
            )) || created;
        }
        created =
          (await immutableInsert(
            client,
            "transcript_revisions",
            { id: manifest.transcript.transcriptRevisionId },
            transcriptFacts(manifest),
            !isReplay,
          )) || created;
        created =
          (await immutableInsert(
            client,
            "audio_asset_manifests",
            { asset_id: manifest.assetId, manifest_revision: manifest.manifestRevision },
            recordFacts(record),
            !isReplay,
          )) || created;
        for (const rendition of manifest.learnerMediaRevisions) {
          const facts = {
            asset_id: manifest.assetId,
            manifest_revision: manifest.manifestRevision,
            media_revision_id: rendition.mediaRevisionId,
          };
          created =
            (await immutableInsert(client, "audio_manifest_renditions", facts, facts, !isReplay)) ||
            created;
        }
        for (const binding of input.bindings.filter((b) => b.assetId === manifest.assetId)) {
          const facts = bindingFacts(binding);
          created =
            (await immutableInsert(
              client,
              "content_item_media_bindings",
              facts,
              facts,
              !isReplay,
            )) || created;
        }
        const storedBindings = await client.query(
          "SELECT content_revision_id,content_item_id,stimulus_id,asset_id,manifest_revision,media_revision_id FROM app.content_item_media_bindings WHERE asset_id=$1 AND manifest_revision=$2",
          [manifest.assetId, manifest.manifestRevision],
        );
        requireFact(
          same(
            storedBindings.rows.map(canonical).sort(),
            input.bindings
              .filter((binding) => binding.assetId === manifest.assetId)
              .map(bindingFacts)
              .map(canonical)
              .sort(),
          ),
          "immutable_conflict",
        );
        const storedMembers = await client.query(
          "SELECT media_revision_id FROM app.audio_manifest_renditions WHERE asset_id=$1 AND manifest_revision=$2 ORDER BY media_revision_id",
          [manifest.assetId, manifest.manifestRevision],
        );
        requireFact(
          same(
            storedMembers.rows.map((row) => row.media_revision_id),
            manifest.learnerMediaRevisions.map((rendition) => rendition.mediaRevisionId).sort(),
          ),
          "immutable_conflict",
        );
        if (!isReplay && asset.rows[0] && input.activateApprovedSuccessor) {
          requireFact(
            manifest.approval.decisionId &&
              ["training", "independent_b1", "readiness_p4", "gold"].includes(
                manifest.approval.level,
              ) &&
              manifest.status === "current",
            "media_unavailable",
          );
          await client.query(
            `UPDATE app.media_assets SET manifest_revision=$2,source_role=$3,authored_speed_ratio=$4,generator=$5,qa=$6,rights_envelope_id=$7,accessibility_manifest_id=$8,status=$9 WHERE id=$1`,
            [
              manifest.assetId,
              manifest.manifestRevision,
              manifest.sourceRole,
              manifest.authoredSpeedRatio,
              manifest.generator,
              manifest.qa,
              manifest.rightsEnvelopeRef,
              manifest.accessibilityManifestRef,
              manifest.status,
            ],
          );
        }
      }
      requireFact(
        historical.every((h) => manifests.some((m) => m.assetId === h.assetId)),
        "scope_mismatch",
      );
      return {
        disposition: created ? "created" : "replayed",
        byteStorage: "not_performed",
        learnerAdmission: "not_granted",
      };
    });
  }

  private async checkRights(
    client: PoolClient,
    manifest: CatalogueAudioManifest,
    at?: Date,
  ): Promise<void> {
    for (const [rightsId, refs, purpose] of [
      [manifest.rightsEnvelopeRef, [manifest.assetId, manifest.contentRevisionId], "audio"],
      [
        manifest.transcript.rightsEnvelopeRef,
        [manifest.transcript.transcriptRevisionId, manifest.contentRevisionId],
        "transcript",
      ],
    ] as const) {
      const rights = await client.query(
        "SELECT state,envelope,digest FROM app.rights_envelopes WHERE id=$1 FOR SHARE",
        [rightsId],
      );
      requireFact(rights.rows[0], "scope_mismatch");
      requireFact(
        sha(canonical(rights.rows[0].envelope)) === rights.rows[0].digest,
        "invalid_media",
      );
      if (at) requireFact(rights.rows[0].state === "current", "media_unavailable");
      this.validator.validateRightsScope(rights.rows[0].envelope, rightsId, refs, purpose, at);
    }
  }

  private async checkApproval(
    client: PoolClient,
    record: AudioCatalogueRecord,
    manifest: CatalogueAudioManifest,
    requireCurrent = true,
  ): Promise<void> {
    await client.query("SELECT pg_advisory_xact_lock(420106,hashtext($1))", [manifest.assetId]);
    const decisions = await client.query(
      "SELECT id,predecessor_id,subject_kind,subject_id,content_class,level,outcome,evidence_ref FROM app.approval_decisions WHERE subject_kind='media_asset' AND subject_id=$1",
      [manifest.assetId],
    );
    const granted = decisions.rows.filter((row) => row.outcome === "granted");
    const head = granted.find((row) => row.id === manifest.approval.decisionId);
    const content = await client.query(
      "SELECT content_class FROM app.content_revisions WHERE id=$1",
      [manifest.contentRevisionId],
    );
    requireFact(
      head &&
        head.level === manifest.approval.level &&
        head.content_class === content.rows[0]?.content_class &&
        canHoldApprovalLevel(head.content_class, head.level) &&
        head.evidence_ref === `audio-manifest/sha256/${record.digest}`,
      "media_unavailable",
    );
    const ancestors = new Set<string>();
    let cursor = head;
    while (cursor) {
      requireFact(!ancestors.has(String(cursor.id)), "media_unavailable");
      ancestors.add(String(cursor.id));
      if (cursor.predecessor_id === null) break;
      const predecessor = granted.find((row) => row.id === cursor.predecessor_id);
      requireFact(predecessor, "media_unavailable");
      cursor = predecessor;
    }
    if (requireCurrent) requireFact(ancestors.size === granted.length, "media_unavailable");
    const reused = await client.query(
      "SELECT digest FROM app.audio_asset_manifests WHERE manifest->'approval'->>'decisionId'=$1",
      [manifest.approval.decisionId],
    );
    requireFact(
      reused.rows.every((row) => row.digest === record.digest),
      "immutable_conflict",
    );
  }

  /** Exact current aggregates only. Missing validators are handled by the caller as unavailable. */
  async readEligible(
    client: PoolClient,
    contentRevisionId: string,
    approvalRole: string,
    at: Date,
  ): Promise<
    readonly { readonly record: AudioCatalogueRecord; readonly manifest: CatalogueAudioManifest }[]
  > {
    const assets = await client.query(
      "SELECT DISTINCT asset_id FROM app.audio_asset_manifests WHERE content_revision_id=$1 ORDER BY asset_id",
      [contentRevisionId],
    );
    for (const row of assets.rows)
      await client.query("SELECT pg_advisory_xact_lock(420106,hashtext($1))", [row.asset_id]);
    const result = await client.query(
      `SELECT m.* FROM app.audio_asset_manifests m JOIN app.media_assets a ON a.id=m.asset_id AND a.manifest_revision=m.manifest_revision WHERE m.content_revision_id=$1 ORDER BY m.stimulus_id,m.asset_id FOR SHARE OF a`,
      [contentRevisionId],
    );
    requireFact(result.rows.length > 0, "media_unavailable");
    const records = result.rows.map(toRecord);
    const manifests = records.map((record) => this.parse(record));
    const content = await client.query(
      "SELECT family_id,learner_payload,progression_profile,instruction,target_blueprint_release FROM app.content_revisions WHERE id=$1 FOR SHARE",
      [contentRevisionId],
    );
    requireFact(content.rows[0], "media_unavailable");
    const bindingsResult = await client.query(
      `SELECT b.* FROM app.content_item_media_bindings b JOIN app.media_assets a ON a.id=b.asset_id AND a.manifest_revision=b.manifest_revision WHERE b.content_revision_id=$1`,
      [contentRevisionId],
    );
    const bindings = bindingsResult.rows.map((row) => ({
      contentRevisionId: String(row.content_revision_id),
      contentItemId: String(row.content_item_id),
      stimulusId: String(row.stimulus_id),
      assetId: String(row.asset_id),
      manifestRevision: String(row.manifest_revision),
      mediaRevisionId: String(row.media_revision_id),
    }));
    this.validator.validateBindings({
      contentRevisionId,
      learnerPayload: content.rows[0].learner_payload,
      bindings,
      records,
    });
    const items = await client.query(
      "SELECT id FROM app.content_items WHERE content_revision_id=$1 ORDER BY id",
      [contentRevisionId],
    );
    requireFact(
      same(
        items.rows.map((row) => row.id),
        [...new Set(bindings.map((b) => b.contentItemId))].sort(),
      ),
      "media_unavailable",
    );
    for (const manifest of manifests) {
      await this.checkApproval(
        client,
        required(records.find((record) => record.assetId === manifest.assetId)),
        manifest,
      );
      requireFact(
        manifest.contentFamilyId === content.rows[0].family_id &&
          manifest.progressionProfile === content.rows[0].progression_profile &&
          manifest.instructionTextRevisionId === content.rows[0].instruction?.instructionId &&
          manifest.targetBlueprintVersion === content.rows[0].target_blueprint_release &&
          manifest.sourceRole !== "deterministic_non_speech_fixture" &&
          manifest.status === "current" &&
          manifest.approval.level === approvalRole &&
          manifest.approval.decisionId,
        "media_unavailable",
      );
      const eligibility = await client.query(
        `SELECT a.*,r.state AS rights_state,r.envelope,x.gate_status,d.outcome,d.level FROM app.media_assets a JOIN app.rights_envelopes r ON r.id=a.rights_envelope_id JOIN app.accessibility_manifests x ON x.id=a.accessibility_manifest_id JOIN app.approval_decisions d ON d.id=$2 AND d.subject_kind='media_asset' AND d.subject_id=a.id WHERE a.id=$1 FOR SHARE OF a,r,x`,
        [manifest.assetId, manifest.approval.decisionId],
      );
      const current = eligibility.rows[0];
      requireFact(
        current &&
          current.status === "current" &&
          current.kind === "audio" &&
          current.content_family_id === manifest.contentFamilyId &&
          current.listening_family === manifest.listeningFamily &&
          Number(current.authored_speed_ratio) === manifest.authoredSpeedRatio &&
          current.source_role === manifest.sourceRole &&
          current.rights_envelope_id === manifest.rightsEnvelopeRef &&
          current.accessibility_manifest_id === manifest.accessibilityManifestRef &&
          current.rights_state === "current" &&
          current.gate_status === "pass" &&
          current.outcome === "granted" &&
          current.level === approvalRole &&
          same(current.qa, manifest.qa) &&
          same(current.generator, manifest.generator),
        "media_unavailable",
      );
      await this.checkRights(client, manifest, at);
      requireFact(this.validator.permitsOfflinePlayback(current.envelope, at), "media_unavailable");
      for (const rendition of manifest.learnerMediaRevisions) {
        const facts = renditionFacts(manifest.assetId, rendition);
        const row = await client.query(
          `SELECT ${Object.keys(facts).join(",")} FROM app.media_revisions WHERE id=$1`,
          [rendition.mediaRevisionId],
        );
        requireFact(
          row.rows[0] &&
            same(row.rows[0], facts) &&
            ["display", "reproduce", "cache", "download_offline"].every((action) =>
              rendition.rightsActions.includes(action),
            ),
          "media_unavailable",
        );
      }
      const transcript = transcriptFacts(manifest);
      const row = await client.query(
        `SELECT ${Object.keys(transcript).join(",")} FROM app.transcript_revisions WHERE id=$1`,
        [manifest.transcript.transcriptRevisionId],
      );
      requireFact(row.rows[0] && same(row.rows[0], transcript), "media_unavailable");
      const members = await client.query(
        "SELECT media_revision_id FROM app.audio_manifest_renditions WHERE asset_id=$1 AND manifest_revision=$2 ORDER BY media_revision_id",
        [manifest.assetId, manifest.manifestRevision],
      );
      requireFact(
        same(
          members.rows.map((r) => r.media_revision_id),
          manifest.learnerMediaRevisions.map((r) => r.mediaRevisionId).sort(),
        ),
        "media_unavailable",
      );
    }
    return records.map((record, index) => ({ record, manifest: required(manifests[index]) }));
  }
}

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("required_media_identity_missing");
  return value;
}
