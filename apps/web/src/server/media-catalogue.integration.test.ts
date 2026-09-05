import { createHash, randomUUID } from "node:crypto";
import {
  audioAssetManifestSchema,
  audioCatalogueValidator,
  canonicalDigest,
  canonicalJson,
  prepareCommittedSeedMediaImport,
  serializeAudioManifest,
} from "@bestehen/content";
import { allowedConditionsSchema } from "@bestehen/contracts";
import { appId } from "@bestehen/domain";
import {
  executePostgresSeedCommand,
  type OfflineMediaCatalogueInput,
  PostgresContentRepository,
  PostgresMediaCatalogue,
  type ServingManifestIssueRequest,
  validateSeedReleaseDocument,
} from "@bestehen/infrastructure";
import { describe, expect, it } from "vitest";
import { importCommittedSeedMedia } from "../../../worker/src/media-import.js";

const databaseUrl = process.env.TEST_DATABASE_URL;

import {
  approval,
  immutableSourceSnapshot,
  scopeFor,
  setup,
  syntheticSpeech,
} from "./media-catalogue.test.fixture";

const bytesDigest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

describe.skipIf(!databaseUrl)("P05-MEDIA-001 PostgreSQL offline catalogue composition", () => {
  it("P05-SECURITY-001 revalidates stored canonical shape and separate transcript rights without granting transcript delivery", async () => {
    await setup(async (pool) => {
      const speech = await syntheticSpeech(pool, "separate-rights");
      const catalogue = new PostgresMediaCatalogue(pool, audioCatalogueValidator);
      await catalogue.importCatalogue(speech.input);
      const scope = await scopeFor(pool);
      const repository = new PostgresContentRepository(pool, audioCatalogueValidator);
      expect(
        (await repository.findEligibleServingRevision(scope, "H2ConversationInterview", "P4"))
          ?.contentRevisionId,
      ).toBe(speech.revisionId);
      const original = (
        await pool.query("SELECT envelope FROM app.rights_envelopes WHERE id=$1", [
          speech.transcriptRightsId,
        ])
      ).rows[0].envelope;
      for (const changed of [
        { ...original, componentScope: { ...original.componentScope, componentKind: "audio" } },
        {
          ...original,
          identity: { ...original.identity, effectiveUntil: "2026-09-01T00:00:00.000Z" },
        },
      ]) {
        await pool.query("UPDATE app.rights_envelopes SET envelope=$2,digest=$3 WHERE id=$1", [
          speech.transcriptRightsId,
          changed,
          canonicalDigest(changed),
        ]);
        expect(
          await repository.findEligibleServingRevision(scope, "H2ConversationInterview", "P4"),
        ).toBeUndefined();
      }
      await pool.query(
        "UPDATE app.rights_envelopes SET envelope=$2,digest=$3,state='withdrawn' WHERE id=$1",
        [speech.transcriptRightsId, original, canonicalDigest(original)],
      );
      expect(
        await repository.findEligibleServingRevision(scope, "H2ConversationInterview", "P4"),
      ).toBeUndefined();
      const malformed = {
        ...speech.manifest,
        manifestRevision: "synthetic-corrupt/v2",
        speakerCount: "not-a-number",
      };
      const raw = canonicalJson(malformed);
      await pool.query(
        "INSERT INTO app.audio_asset_manifests(asset_id,manifest_revision,content_revision_id,stimulus_id,canonicalization_version,canonical_manifest,digest) VALUES($1,$2,$3,$4,'canonical-json/v1',$5,$6)",
        [
          speech.assetId,
          malformed.manifestRevision,
          speech.revisionId,
          speech.manifest.stimulusId,
          raw,
          bytesDigest(Buffer.from(raw)),
        ],
      );
      await pool.query("UPDATE app.media_assets SET manifest_revision=$2 WHERE id=$1", [
        speech.assetId,
        malformed.manifestRevision,
      ]);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await expect(
          catalogue.readEligible(client, speech.revisionId, "training", new Date()),
        ).rejects.toThrow("speakerCount");
      } finally {
        await client.query("ROLLBACK");
        client.release();
      }
    });
  });
  it("P05-MEDIA-001 stores same-byte transcript rights/phase successors without changing rendition or current aggregate", async () => {
    await setup(async (pool) => {
      expect((await importCommittedSeedMedia(pool, randomUUID())).state).toBe(
        "quarantined_catalogue_imported",
      );
      const prepared = prepareCommittedSeedMediaImport();
      const original = required(
        prepared.catalogue.records.find(
          (record) => JSON.parse(record.canonicalManifest).listeningFamily === "H2",
        ),
      );
      const manifest = audioAssetManifestSchema.parse(JSON.parse(original.canonicalManifest));
      const transcriptId = randomUUID();
      const rightsId = randomUUID();
      const oldRows = (
        await pool.query("SELECT to_jsonb(t) FROM app.transcript_revisions t WHERE id=$1", [
          manifest.transcript.transcriptRevisionId,
        ])
      ).rows;
      const oldRights = (
        await pool.query("SELECT envelope FROM app.rights_envelopes WHERE id=$1", [
          manifest.transcript.rightsEnvelopeRef,
        ])
      ).rows[0].envelope;
      const rights = {
        ...oldRights,
        identity: {
          ...oldRights.identity,
          rightsEnvelopeId: rightsId,
          predecessorRightsEnvelopeId: manifest.transcript.rightsEnvelopeRef,
        },
        componentScope: { componentRef: transcriptId, componentKind: "transcript" },
      };
      await pool.query(
        "INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest,predecessor_id) VALUES($1,$2,'current',$3,$4,$5)",
        [
          rightsId,
          `synthetic-transcript/${rightsId}`,
          rights,
          canonicalDigest(rights),
          manifest.transcript.rightsEnvelopeRef,
        ],
      );
      const successor = {
        ...manifest,
        manifestRevision: "transcript-policy/v2",
        predecessorManifestRevision: manifest.manifestRevision,
        transcript: {
          ...manifest.transcript,
          transcriptRevisionId: transcriptId,
          rightsEnvelopeRef: rightsId,
          earliestRevealPhase: "after_block",
          objectKey: `media/approved/private-transcripts/${transcriptId}/${manifest.transcript.digest}.txt`,
        },
      };
      const record = serializeAudioManifest(successor);
      const keys = new Set([
        ...manifest.learnerMediaRevisions.map((r) => r.objectKey),
        manifest.sourceMaster.objectKey,
        manifest.transcript.objectKey,
      ]);
      const input: OfflineMediaCatalogueInput = {
        records: [record],
        bindings: prepared.catalogue.bindings
          .filter((binding) => binding.assetId === manifest.assetId)
          .map((binding) => ({ ...binding, manifestRevision: record.manifestRevision })),
        objects: prepared.catalogue.objects
          .filter((object) => keys.has(object.objectKey))
          .map((object) => ({
            ...object,
            objectKey:
              object.objectKey === manifest.transcript.objectKey
                ? successor.transcript.objectKey
                : object.objectKey,
          })),
      };
      const catalogue = new PostgresMediaCatalogue(pool, audioCatalogueValidator);
      await expect(catalogue.importCatalogue(input)).resolves.toMatchObject({
        disposition: "created",
      });
      await expect(catalogue.importCatalogue(input)).resolves.toMatchObject({
        disposition: "replayed",
      });
      expect(
        (
          await pool.query("SELECT to_jsonb(t) FROM app.transcript_revisions t WHERE id=$1", [
            manifest.transcript.transcriptRevisionId,
          ])
        ).rows,
      ).toEqual(oldRows);
      expect(
        (
          await pool.query(
            "SELECT digest,media_revision_id,earliest_reveal_phase,rights_envelope_id FROM app.transcript_revisions WHERE id=$1",
            [transcriptId],
          )
        ).rows[0],
      ).toEqual({
        digest: manifest.transcript.digest,
        media_revision_id: manifest.transcript.mediaRevisionId,
        earliest_reveal_phase: "after_block",
        rights_envelope_id: rightsId,
      });
      expect(
        (
          await pool.query("SELECT manifest_revision FROM app.media_assets WHERE id=$1", [
            manifest.assetId,
          ])
        ).rows[0].manifest_revision,
      ).toBe(manifest.manifestRevision);
      expect(
        (
          await pool.query("SELECT count(*)::int n FROM app.media_revisions WHERE asset_id=$1", [
            manifest.assetId,
          ])
        ).rows[0].n,
      ).toBe(2);
    });
  });
  it("P05-LISTENING-001 requires every candidate and refuses family media bound only to another revision", async () => {
    await setup(async (pool) => {
      const speech = await syntheticSpeech(pool, "exact-revision", "C3", true);
      const catalogue = new PostgresMediaCatalogue(pool, audioCatalogueValidator);
      await expect(
        catalogue.importCatalogue({ ...speech.input, bindings: speech.input.bindings.slice(0, 1) }),
      ).rejects.toThrow("incomplete_or_conflicting_media_bindings");
      expect((await pool.query("SELECT count(*)::int n FROM app.media_assets")).rows[0].n).toBe(0);
      await catalogue.importCatalogue({
        ...speech.input,
        bindings: [...speech.input.bindings].reverse(),
      });
      const scope = await scopeFor(pool);
      const repository = new PostgresContentRepository(pool, audioCatalogueValidator);
      expect(
        (await repository.findEligibleServingRevision(scope, "H2ConversationInterview", "P4"))
          ?.mediaRevisionIds,
      ).toEqual(speech.manifest.learnerMediaRevisions.map((r) => r.mediaRevisionId).sort());
      const revisionId = randomUUID();
      const rightsId = randomUUID();
      const itemId = randomUUID();
      const old = (
        await pool.query(
          "SELECT c.*,r.envelope FROM app.content_revisions c JOIN app.rights_envelopes r ON r.id=c.rights_envelope_id WHERE c.id=$1",
          [speech.revisionId],
        )
      ).rows[0];
      const rights = {
        ...old.envelope,
        identity: { ...old.envelope.identity, rightsEnvelopeId: rightsId },
        componentScope: { componentRef: revisionId, componentKind: "composite" },
      };
      await pool.query(
        "INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest) VALUES($1,$2,'current',$3,$4)",
        [rightsId, `synthetic/${rightsId}`, rights, canonicalDigest(rights)],
      );
      const payload = {
        ...old.learner_payload,
        questions: [{ itemRef: itemId, questionId: "synthetic-question" }],
      };
      await pool.query(
        "INSERT INTO app.content_revisions(id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest,content_class,rights_envelope_id,accessibility_manifest_id,learner_payload,instruction,progression_profile,target_blueprint_release) VALUES($1,$2,'different-exact-revision','learning_practice','candidate','eligible','compatible',$3,'C3',$4,$5,$6,$7,'P4',$8)",
        [
          revisionId,
          speech.familyId,
          canonicalDigest(revisionId),
          rightsId,
          old.accessibility_manifest_id,
          payload,
          old.instruction,
          old.target_blueprint_release,
        ],
      );
      await pool.query(
        "INSERT INTO app.content_items(id,content_revision_id,ordinal,response_kind,binding,scorable) VALUES($1,$2,1,'single_select','{}','{}')",
        [itemId, revisionId],
      );
      await approval(pool, {
        decisionId: randomUUID(),
        subjectId: revisionId,
        subjectKind: "content_revision",
        contentClass: "C3",
        level: "training",
        evidenceRef: "synthetic-only",
      });
      await pool.query(
        "UPDATE app.content_releases SET state='retired' WHERE id IN(SELECT release_id FROM app.content_release_entries WHERE content_revision_id=$1)",
        [speech.revisionId],
      );
      const releaseId = randomUUID();
      await pool.query(
        "INSERT INTO app.content_releases(id,release_identity,state,digest) VALUES($1,'synthetic-unbound','active',$2)",
        [releaseId, canonicalDigest(releaseId)],
      );
      await pool.query(
        "INSERT INTO app.content_release_entries(release_id,content_revision_id) VALUES($1,$2)",
        [releaseId, revisionId],
      );
      expect(
        await repository.findEligibleServingRevision(scope, "H2ConversationInterview", "P4"),
      ).toBeUndefined();
    });
  });
  it("P05-IDEMPOTENCY-001 releases refused candidate locks under opposite exposure ranking", async () => {
    await setup(async (pool) => {
      const a = await syntheticSpeech(pool, "01-unavailable-a");
      const b = await syntheticSpeech(pool, "02-unavailable-b");
      const good = await syntheticSpeech(pool, "03-eligible");
      const catalogue = new PostgresMediaCatalogue(pool, audioCatalogueValidator);
      for (const fixture of [a, b, good]) await catalogue.importCatalogue(fixture.input);
      await pool.query("UPDATE app.media_assets SET status='withdrawn' WHERE id=ANY($1::uuid[])", [
        [a.assetId, b.assetId],
      ]);
      const left = await scopeFor(pool);
      const right = await scopeFor(pool);
      for (const [scope, families] of [
        [left, [b.familyId, good.familyId]],
        [right, [a.familyId, good.familyId]],
      ] as const)
        for (const familyId of families)
          await pool.query(
            "INSERT INTO app.content_exposure_index(learner_scope_id,content_family_id,exposure_class,last_trigger) VALUES($1,$2,'exposed_family','learner_visible_stimulus')",
            [scope.learnerScopeId, familyId],
          );
      for (let run = 0; run < 3; run += 1) {
        let arrived = 0;
        let release!: () => void;
        const barrier = new Promise<void>((resolve) => {
          release = resolve;
        });
        const seen = new WeakSet<object>();
        const firstAssets: string[] = [];
        const instrumented = new Proxy(pool, {
          get(target, property) {
            if (property === "connect")
              return async () => {
                const client = await target.connect();
                return new Proxy(client, {
                  get(connection, key) {
                    if (key === "query")
                      return async (...args: unknown[]) => {
                        const result = await Reflect.apply(connection.query, connection, args);
                        if (
                          String(args[0]).includes("pg_advisory_xact_lock(420106") &&
                          !seen.has(connection)
                        ) {
                          seen.add(connection);
                          arrived += 1;
                          firstAssets.push(String(Array.isArray(args[1]) ? args[1][0] : "missing"));
                          if (arrived === 2) release();
                          await barrier;
                        }
                        return result;
                      };
                    const value = Reflect.get(connection, key, connection);
                    return typeof value === "function" ? value.bind(connection) : value;
                  },
                });
              };
            const value = Reflect.get(target, property, target);
            return typeof value === "function" ? value.bind(target) : value;
          },
        });
        const repository = new PostgresContentRepository(instrumented, audioCatalogueValidator);
        const results = await Promise.all([
          repository.findEligibleServingRevision(left, "H2ConversationInterview", "P4"),
          repository.findEligibleServingRevision(right, "H2ConversationInterview", "P4"),
        ]);
        expect(new Set(firstAssets)).toEqual(new Set([a.assetId, b.assetId]));
        expect(results.map((result) => result?.contentRevisionId)).toEqual([
          good.revisionId,
          good.revisionId,
        ]);
      }
    });
  });
  it("P05-MEDIA-001 retains approved current media while storing a draft successor and refuses immutable rendition edits", async () => {
    await setup(async (pool) => {
      const speech = await syntheticSpeech(pool, "draft-successor");
      const catalogue = new PostgresMediaCatalogue(pool, audioCatalogueValidator);
      await catalogue.importCatalogue(speech.input);
      const before = (
        await pool.query(
          "SELECT to_jsonb(m) FROM app.media_revisions m WHERE asset_id=$1 ORDER BY id",
          [speech.assetId],
        )
      ).rows;
      const draft = audioAssetManifestSchema.parse({
        ...speech.manifest,
        manifestRevision: "draft-successor/v2",
        predecessorManifestRevision: speech.manifest.manifestRevision,
        approval: { decisionId: null, level: "draft" },
        status: "quarantined",
      });
      const record = serializeAudioManifest(draft);
      const input = {
        ...speech.input,
        records: [record],
        bindings: speech.input.bindings.map((binding) => ({
          ...binding,
          manifestRevision: record.manifestRevision,
        })),
      };
      await expect(catalogue.importCatalogue(input)).resolves.toMatchObject({
        disposition: "created",
      });
      expect(
        (
          await pool.query("SELECT manifest_revision,status FROM app.media_assets WHERE id=$1", [
            speech.assetId,
          ])
        ).rows[0],
      ).toEqual({ manifest_revision: speech.manifest.manifestRevision, status: "current" });
      expect(
        (
          await pool.query(
            "SELECT to_jsonb(m) FROM app.media_revisions m WHERE asset_id=$1 ORDER BY id",
            [speech.assetId],
          )
        ).rows,
      ).toEqual(before);
      const scope = await scopeFor(pool);
      expect(
        (
          await new PostgresContentRepository(
            pool,
            audioCatalogueValidator,
          ).findEligibleServingRevision(scope, "H2ConversationInterview", "P4")
        )?.audioManifestPins?.[0]?.digest,
      ).toBe(speech.record.digest);
      const changed = serializeAudioManifest({
        ...draft,
        manifestRevision: "conflicting-rendition/v3",
        learnerMediaRevisions: draft.learnerMediaRevisions.map((r) => ({
          ...r,
          cachePolicyRef: "changed-under-old-id",
        })),
      });
      await expect(
        catalogue.importCatalogue({
          ...input,
          records: [changed],
          bindings: input.bindings.map((b) => ({
            ...b,
            manifestRevision: changed.manifestRevision,
          })),
        }),
      ).rejects.toThrow("immutable_conflict");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM app.audio_asset_manifests WHERE asset_id=$1",
            [speech.assetId],
          )
        ).rows[0].n,
      ).toBe(2);
    });
  });
  it("P05-SECURITY-001 refuses wrong-family, cross-revision, old-rights and missing predecessor input atomically", async () => {
    await setup(async (pool) => {
      const prepared = prepareCommittedSeedMediaImport();
      const draft = await executePostgresSeedCommand(pool, {
        command: "apply",
        release: validateSeedReleaseDocument(prepared.successorRelease),
        operationId: randomUUID(),
        dryRun: false,
        reportPath: null,
        selector: null,
        reason: null,
        occurredAt: new Date().toISOString(),
      });
      expect(draft.summary.hardFailures).toBe(0);
      const source = prepared.catalogue;
      const catalogue = new PostgresMediaCatalogue(pool, audioCatalogueValidator);
      await expect(
        catalogue.importCatalogue({ ...source, historicalSeedAudio: [] }),
      ).rejects.toThrow("scope_mismatch");
      const first = required(source.records[0]);
      const manifest = audioCatalogueValidator.readManifest(first);
      const changedFamily = serializeAudioManifest({
        ...JSON.parse(first.canonicalManifest),
        contentFamilyId: randomUUID(),
      });
      await expect(
        catalogue.importCatalogue({
          ...source,
          records: source.records.map((record) =>
            record.assetId === first.assetId ? changedFamily : record,
          ),
        }),
      ).rejects.toThrow("scope_mismatch");
      const original = required(
        prepared.originalRelease.entries.find(
          (entry) => entry.familyId === manifest.contentFamilyId,
        ),
      );
      const oldRights = serializeAudioManifest({
        ...JSON.parse(first.canonicalManifest),
        rightsEnvelopeRef: original.rightsEnvelopeId,
      });
      await expect(
        catalogue.importCatalogue({
          ...source,
          records: source.records.map((record) =>
            record.assetId === first.assetId ? oldRights : record,
          ),
        }),
      ).rejects.toThrow("media_rights_component_mismatch");
      await expect(
        catalogue.importCatalogue({
          ...source,
          bindings: source.bindings.map((binding, index) =>
            index === 0
              ? { ...binding, contentItemId: required(original.revision.items[0]).contentItemId }
              : binding,
          ),
        }),
      ).rejects.toThrow();
      expect((await pool.query("SELECT count(*)::int n FROM app.media_assets")).rows[0].n).toBe(0);
      expect((await pool.query("SELECT count(*)::int n FROM app.media_revisions")).rows[0].n).toBe(
        0,
      );
    });
  });
  it("P05-LISTENING-001 selects exact eligible pins past bad families, validates canonical wire conditions and rechecks withdrawal at issuance", async () => {
    await setup(async (pool) => {
      const bad = await syntheticSpeech(pool, "00-missing");
      const good = await syntheticSpeech(pool, "10-eligible");
      const catalogue = new PostgresMediaCatalogue(pool, audioCatalogueValidator);
      await catalogue.importCatalogue(good.input);
      const scope = await scopeFor(pool);
      const repository = new PostgresContentRepository(pool, audioCatalogueValidator);
      expect(
        await new PostgresContentRepository(pool).findEligibleServingRevision(
          scope,
          "H2ConversationInterview",
          "P4",
        ),
      ).toBeUndefined();
      const selected = await repository.findEligibleServingRevision(
        scope,
        "H2ConversationInterview",
        "P4",
      );
      expect(selected?.contentRevisionId).toBe(good.revisionId);
      expect(selected?.mediaRevisionIds).toEqual([good.mediaId]);
      expect(selected?.audioManifestPins).toEqual([
        {
          assetId: good.assetId,
          manifestRevision: good.manifest.manifestRevision,
          digest: good.record.digest,
          contentRevisionId: good.revisionId,
          stimulusId: good.manifest.stimulusId,
          mediaRevisionIds: [good.mediaId],
        },
      ]);
      expect(selected?.contentFamilyId).not.toBe(bad.familyId);
      const conditions = {
        progressionProfile: "P4",
        timingMode: "exam",
        transcriptPhase: "after_block",
        offerableAssistanceKinds: [],
        audioManifestPins: required(required(selected).audioManifestPins).map((pin) =>
          Object.fromEntries(Object.entries(pin).reverse()),
        ),
      };
      expect(allowedConditionsSchema.safeParse(conditions).success).toBe(true);
      const request: ServingManifestIssueRequest = {
        servingManifestId: appId(randomUUID()),
        operationId: appId(randomUUID()),
        contentClass: "C3",
        approvalRole: "training",
        entries: [
          {
            ordinal: 1,
            contentRevisionId: appId(good.revisionId),
            contentItemId: appId(good.itemId),
          },
          {
            ordinal: 2,
            contentRevisionId: appId(good.revisionId),
            mediaRevisionId: appId(good.mediaId),
          },
        ],
        keyRevisionDigests: [],
        allowedConditions: conditions,
        learnerSafePayloadDigest: canonicalDigest("synthetic"),
        freshnessDecision: "fresh",
        comparedFamilyRefs: [good.familyId],
        authorizationVersion: "synthetic/v1",
        contentReleaseIdentity: required(selected).contentReleaseIdentity,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
        digest: canonicalDigest("synthetic-lease"),
      };
      const issued = await repository.issueServingManifest(scope, request);
      expect(issued.ok).toBe(true);
      if (!issued.ok) throw new Error(issued.error);
      expect(allowedConditionsSchema.parse(issued.value.manifest.allowedConditions)).toEqual(
        conditions,
      );
      for (const altered of [
        [],
        [
          {
            ...required(required(required(selected).audioManifestPins)[0]),
            digest: "0".repeat(64),
          },
        ],
        [
          {
            ...required(required(required(selected).audioManifestPins)[0]),
            mediaRevisionIds: [good.mediaId, randomUUID()],
          },
        ],
      ]) {
        expect(
          await repository.issueServingManifest(scope, {
            ...request,
            servingManifestId: appId(randomUUID()),
            operationId: appId(randomUUID()),
            allowedConditions: { ...conditions, audioManifestPins: altered },
          }),
        ).toMatchObject({ ok: false, error: "content_unavailable" });
      }
      await pool.query("UPDATE app.rights_envelopes SET state='withdrawn' WHERE id=$1", [
        good.rightsId,
      ]);
      expect(
        await repository.issueServingManifest(scope, {
          ...request,
          servingManifestId: appId(randomUUID()),
          operationId: appId(randomUUID()),
        }),
      ).toMatchObject({ ok: false });
      expect(
        await repository.findEligibleServingRevision(scope, "H2ConversationInterview", "P4"),
      ).toBeUndefined();
      expect(await repository.issueServingManifest(scope, request)).toMatchObject({
        ok: true,
        value: { disposition: "replayed" },
      });
    });
  });
  it("P05-SECURITY-001 denies stale exact-byte approval, conflicting immutable facts and correctly hashed corrupt shape", async () => {
    await setup(async (pool) => {
      const speech = await syntheticSpeech(pool, "synthetic-approved", "C2");
      const catalogue = new PostgresMediaCatalogue(pool, audioCatalogueValidator);
      await expect(catalogue.importCatalogue(speech.input)).resolves.toMatchObject({
        disposition: "created",
      });
      await expect(catalogue.importCatalogue(speech.input)).resolves.toMatchObject({
        disposition: "replayed",
      });
      const scope = await scopeFor(pool);
      const repository = new PostgresContentRepository(pool, audioCatalogueValidator);
      expect(
        (await repository.findEligibleServingRevision(scope, "H2ConversationInterview", "P4"))
          ?.contentRevisionId,
      ).toBe(speech.revisionId);
      const changed = {
        ...speech.manifest,
        manifestRevision: "synthetic-manifest/v2",
        predecessorManifestRevision: speech.manifest.manifestRevision,
      };
      const record = serializeAudioManifest(changed);
      await expect(
        catalogue.importCatalogue({
          ...speech.input,
          records: [record],
          bindings: speech.input.bindings.map((b) => ({
            ...b,
            manifestRevision: record.manifestRevision,
          })),
        }),
      ).rejects.toThrow("media_unavailable");
      await approval(pool, {
        decisionId: randomUUID(),
        subjectId: speech.assetId,
        subjectKind: "media_asset",
        contentClass: "C2",
        level: "quarantine",
        evidenceRef: "synthetic-quarantine",
      });
      expect(
        await repository.findEligibleServingRevision(scope, "H2ConversationInterview", "P4"),
      ).toBeUndefined();
      const projectionBefore = (
        await pool.query("SELECT to_jsonb(a) FROM app.media_assets a WHERE id=$1", [speech.assetId])
      ).rows;
      await expect(catalogue.importCatalogue(speech.input)).resolves.toMatchObject({
        disposition: "replayed",
      });
      expect(
        (
          await pool.query("SELECT to_jsonb(a) FROM app.media_assets a WHERE id=$1", [
            speech.assetId,
          ])
        ).rows,
      ).toEqual(projectionBefore);
      const before = (
        await pool.query(
          "SELECT canonical_manifest FROM app.audio_asset_manifests WHERE asset_id=$1",
          [speech.assetId],
        )
      ).rows;
      const corrupt = JSON.stringify({ ...speech.manifest, speakerCount: "wrong-type" });
      await expect(
        catalogue.importCatalogue({
          ...speech.input,
          records: [
            {
              ...speech.record,
              canonicalManifest: corrupt,
              digest: bytesDigest(Buffer.from(corrupt)),
            },
          ],
        }),
      ).rejects.toThrow();
      expect(
        (
          await pool.query(
            "SELECT canonical_manifest FROM app.audio_asset_manifests WHERE asset_id=$1",
            [speech.assetId],
          )
        ).rows,
      ).toEqual(before);
    });
  });
  it("P05-IDEMPOTENCY-001 imports all 22 actual seeds, reconciles absent predecessors and retries without rewriting source or approval", async () => {
    await setup(async (pool) => {
      const before = await immutableSourceSnapshot(pool);
      expect((await pool.query("SELECT count(*)::int n FROM app.media_revisions")).rows[0].n).toBe(
        0,
      );
      const operation = randomUUID();
      const first = await importCommittedSeedMedia(pool, operation);
      expect(first.state).toBe("quarantined_catalogue_imported");
      expect(first).toMatchObject({
        media: {
          disposition: "created",
          learnerAdmission: "not_granted",
          byteStorage: "not_performed",
        },
      });
      const after = await immutableSourceSnapshot(pool);
      expect(after).toEqual(before);
      const retry = await importCommittedSeedMedia(pool, operation);
      expect(retry).toMatchObject({
        state: "quarantined_catalogue_imported",
        media: { disposition: "replayed" },
      });
      expect((await pool.query("SELECT count(*)::int n FROM app.media_revisions")).rows[0].n).toBe(
        44,
      );
      expect(
        (await pool.query("SELECT count(*)::int n FROM app.audio_asset_manifests")).rows[0].n,
      ).toBe(22);
      expect(
        (await pool.query("SELECT count(*)::int n FROM app.transcript_revisions")).rows[0].n,
      ).toBe(22);
      expect(
        (await pool.query("SELECT count(*)::int n FROM app.approval_decisions")).rows[0].n,
      ).toBe(0);
      expect(
        (await pool.query("SELECT count(*)::int n FROM app.content_releases WHERE state='active'"))
          .rows[0].n,
      ).toBe(0);
      expect(
        (await pool.query("SELECT count(*)::int n FROM app.content_exposure_index")).rows[0].n,
      ).toBe(0);
      const prepared = prepareCommittedSeedMediaImport();
      for (const entry of prepared.successorRelease.entries) {
        const stored = (
          await pool.query(
            "SELECT c.revision,c.family_id,r.envelope_key,r.envelope FROM app.content_revisions c JOIN app.rights_envelopes r ON r.id=c.rights_envelope_id WHERE c.id=$1",
            [entry.revisionId],
          )
        ).rows[0];
        expect(stored).toMatchObject({
          revision: entry.revisionLabel,
          family_id: entry.familyId,
          envelope_key: entry.rightsEnvelopeKey,
          envelope: { componentScope: { componentRef: entry.revisionId } },
        });
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await expect(
            new PostgresMediaCatalogue(pool, audioCatalogueValidator).readEligible(
              client,
              entry.revisionId,
              "training",
              new Date(),
            ),
          ).rejects.toThrow();
        } finally {
          await client.query("ROLLBACK");
          client.release();
        }
      }
      for (const key of ["revisionLabel", "rightsEnvelopeKey"] as const) {
        const changed = {
          ...prepared.successorRelease,
          entries: prepared.successorRelease.entries.map((entry, index) =>
            index === 0 ? { ...entry, [key]: "conflicting-label" } : entry,
          ),
        };
        const report = await executePostgresSeedCommand(pool, {
          command: "apply",
          release: validateSeedReleaseDocument(changed),
          operationId: operation,
          dryRun: false,
          reportPath: null,
          selector: null,
          reason: null,
          occurredAt: new Date().toISOString(),
        });
        expect(report.summary.hardFailures).toBeGreaterThan(0);
      }
    });
  });
  it("P05-SECURITY-001 retains only an unapproved draft after media refusal, then reconciles exact retry", async () => {
    await setup(async (pool) => {
      // Force a late media failure after the separate draft commit; no source or approval is forged.
      await pool.query(
        "CREATE FUNCTION app.synthetic_media_refusal() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic media refusal'; END $$",
      );
      await pool.query(
        "CREATE TRIGGER synthetic_media_refusal BEFORE INSERT ON app.audio_asset_manifests FOR EACH ROW EXECUTE FUNCTION app.synthetic_media_refusal()",
      );
      const operation = randomUUID();
      expect(await importCommittedSeedMedia(pool, operation)).toMatchObject({
        state: "draft_retained_media_refused",
        learnerAdmission: "not_granted",
      });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM app.content_revisions WHERE predecessor_id IS NOT NULL",
          )
        ).rows[0].n,
      ).toBe(6);
      expect((await pool.query("SELECT count(*)::int n FROM app.media_revisions")).rows[0].n).toBe(
        0,
      );
      await pool.query("DROP TRIGGER synthetic_media_refusal ON app.audio_asset_manifests");
      expect(await importCommittedSeedMedia(pool, operation)).toMatchObject({
        state: "quarantined_catalogue_imported",
        media: { disposition: "created" },
      });
      const input = prepareCommittedSeedMediaImport().catalogue;
      const catalogue = new PostgresMediaCatalogue(pool, audioCatalogueValidator);
      const before = canonicalDigest(
        (await pool.query("SELECT to_jsonb(m) FROM app.media_revisions m ORDER BY id")).rows,
      );
      const badBytes = structuredClone(input);
      required(badBytes.objects[0]).bytes[0] = (required(badBytes.objects[0]).bytes[0] ?? 0) ^ 1;
      await expect(catalogue.importCatalogue(badBytes)).rejects.toThrow();
      await expect(
        catalogue.importCatalogue({ ...input, bindings: input.bindings.slice(1) }),
      ).rejects.toThrow();
      expect(
        canonicalDigest(
          (await pool.query("SELECT to_jsonb(m) FROM app.media_revisions m ORDER BY id")).rows,
        ),
      ).toBe(before);
    });
  });
});

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("required_media_identity_missing");
  return value;
}
