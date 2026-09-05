import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import {
  type AudioCatalogueValidator,
  authorize,
  type ListeningPlanView,
  listeningOutboxProbePayload,
  listeningOutputProbeRevisionId,
  listeningPolicies,
  type PlaybackReceipt,
  type PrivateListeningBytes,
  preflightReasons,
} from "@bestehen/application";
import {
  allowedConditionsSchema,
  type ListeningPlan,
  listeningPlanSchema,
  type MediaPreflightObservation,
  type MediaPreflightReceipt,
  mediaPreflightObservationSchema,
  mediaPreflightReceiptSchema,
  type PlaybackOccurrenceCommand,
  playbackOccurrenceCommandSchema,
  transcriptRevealSchema,
} from "@bestehen/contracts";
import type { AuthorizedScope } from "@bestehen/domain";
import type { Pool, PoolClient, QueryResultRow } from "pg";
import { inTransaction, lockActiveLearnerScope } from "../postgres/foundation-repository.js";
import { PostgresMediaCatalogue } from "./catalogue.js";

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
    .join(",")}}`;
}
const digest = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
const id = (seed: string) => {
  const hex = digest(seed);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
const iso = (value: unknown) =>
  (value instanceof Date ? value : new Date(String(value))).toISOString();
export class ListeningRuntimeError extends Error {
  constructor(
    readonly reason: "not_available" | "conflict" | "idempotency_conflict" | "integrity_failed",
  ) {
    super(reason);
  }
}
function requireFact(
  value: unknown,
  reason: ListeningRuntimeError["reason"] = "not_available",
): asserts value {
  if (!value) throw new ListeningRuntimeError(reason);
}
type Eligible = Awaited<ReturnType<PostgresMediaCatalogue["readEligible"]>>;

/** All mutations lock learner → plan → sorted catalogue subjects, then write one atomic receipt. */
export class PostgresListeningRuntime {
  private readonly catalogue: PostgresMediaCatalogue;
  constructor(
    private readonly pool: Pool,
    private readonly validator: AudioCatalogueValidator,
    private readonly bytes: PrivateListeningBytes,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.catalogue = new PostgresMediaCatalogue(pool, validator);
  }

  private async transact<T>(
    scope: AuthorizedScope,
    run: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    requireFact(authorize(scope, "media:authorize", {}, this.now()).ok);
    return inTransaction(this.pool, async (client) => {
      requireFact(await lockActiveLearnerScope(client, scope.learnerScopeId));
      return run(client);
    });
  }

  private async pinned(client: PoolClient, scope: AuthorizedScope, attemptId: string) {
    const result = await client.query(
      `SELECT a.id AS attempt_id,a.state AS attempt_state,a.content_revision_id,a.modality,sm.*
      FROM app.attempts a JOIN app.serving_manifests sm ON sm.id=a.serving_manifest_id AND sm.learner_scope_id=a.learner_scope_id
      WHERE a.learner_scope_id=$1 AND a.id=$2 AND a.modality='listening' FOR UPDATE OF a,sm`,
      [scope.learnerScopeId, attemptId],
    );
    const pin = result.rows[0];
    requireFact(pin);
    return pin;
  }

  private async eligible(
    client: PoolClient,
    pin: QueryResultRow,
    purpose: "audio" | "transcript" = "audio",
  ): Promise<Eligible> {
    const entries = (
      await client.query(
        `SELECT e.*,i.ordinal AS item_ordinal FROM app.serving_manifest_entries e
      LEFT JOIN app.content_items i ON i.id=e.content_item_id AND i.content_revision_id=e.content_revision_id
      WHERE e.learner_scope_id=$1 AND e.serving_manifest_id=$2 ORDER BY e.ordinal`,
        [pin.learner_scope_id, pin.id],
      )
    ).rows;
    const revisions = [...new Set(entries.map((row) => String(row.content_revision_id)))].sort();
    requireFact(revisions.includes(String(pin.content_revision_id)));
    const all: Eligible[number][] = [];
    for (const revision of revisions) {
      const current = await client.query(
        `SELECT cr.*,r.state AS envelope_state,r.envelope,r.digest AS rights_digest,x.gate_status,d.level,d.outcome
        FROM app.content_revisions cr JOIN app.rights_envelopes r ON r.id=cr.rights_envelope_id
        JOIN app.accessibility_manifests x ON x.id=cr.accessibility_manifest_id
        JOIN app.approval_decisions d ON d.id=cr.current_approval_decision_id AND d.subject_kind='content_revision' AND d.subject_id=cr.id
        WHERE cr.id=$1 FOR SHARE OF cr,r,x`,
        [revision],
      );
      const cr = current.rows[0];
      requireFact(
        cr &&
          cr.approval_state === "approved" &&
          cr.compatibility_state === "compatible" &&
          cr.envelope_state === "current" &&
          cr.level === pin.approval_role &&
          cr.outcome === "granted" &&
          cr.gate_status === "pass" &&
          cr.content_class === pin.content_class,
      );
      requireFact(digest(canonical(cr.envelope)) === cr.rights_digest);
      this.validator.validateRightsScope(
        cr.envelope,
        cr.rights_envelope_id,
        [revision],
        "audio",
        this.now(),
      );
      const release = await client.query(
        `SELECT rel.id FROM app.content_releases rel JOIN app.content_release_entries e ON e.release_id=rel.id
        WHERE e.content_revision_id=$1 AND rel.release_identity=$2 AND rel.state='active' FOR SHARE OF rel`,
        [revision, pin.content_release_identity],
      );
      requireFact(release.rowCount);
      all.push(
        ...(await this.catalogue.readEligible(
          client,
          revision,
          String(pin.approval_role),
          this.now(),
          purpose,
        )),
      );
    }
    const conditions = allowedConditionsSchema.parse(pin.allowed_conditions);
    const expected = all
      .map(({ record, manifest }) => ({
        assetId: manifest.assetId,
        manifestRevision: manifest.manifestRevision,
        digest: record.digest,
        contentRevisionId: manifest.contentRevisionId,
        stimulusId: manifest.stimulusId,
        mediaRevisionIds: manifest.learnerMediaRevisions.map((r) => r.mediaRevisionId).sort(),
      }))
      .sort((a, b) => a.assetId.localeCompare(b.assetId));
    requireFact(isDeepStrictEqual(conditions.audioManifestPins, expected));
    const media = entries
      .filter((e) => e.media_revision_id)
      .map((e) => String(e.media_revision_id))
      .sort();
    requireFact(
      isDeepStrictEqual(
        media,
        all
          .flatMap(({ manifest }) => manifest.learnerMediaRevisions.map((r) => r.mediaRevisionId))
          .sort(),
      ),
    );
    const bindingItems = (
      await client.query(
        `SELECT DISTINCT b.content_item_id FROM app.content_item_media_bindings b
      WHERE b.content_revision_id=ANY($1::uuid[]) AND EXISTS (SELECT 1 FROM app.media_assets a WHERE a.id=b.asset_id AND a.manifest_revision=b.manifest_revision) ORDER BY b.content_item_id`,
        [revisions],
      )
    ).rows.map((r) => String(r.content_item_id));
    requireFact(
      isDeepStrictEqual(
        entries
          .filter((e) => e.content_item_id)
          .map((e) => String(e.content_item_id))
          .sort(),
        bindingItems,
      ),
    );
    if (pin.form_id) {
      const form = (
        await client.query("SELECT * FROM app.content_forms WHERE id=$1", [pin.form_id])
      ).rows[0];
      const formItems = (
        await client.query(
          "SELECT content_item_id FROM app.content_form_entries WHERE form_id=$1 AND content_item_id IS NOT NULL ORDER BY content_item_id",
          [pin.form_id],
        )
      ).rows.map((r) => String(r.content_item_id));
      requireFact(
        form &&
          form.progression_profile === conditions.progressionProfile &&
          isDeepStrictEqual(formItems, bindingItems),
      );
    }
    return all;
  }

  private active(pin: QueryResultRow, row?: QueryResultRow) {
    requireFact(
      pin.revocation_state === "active" &&
        Date.parse(iso(pin.expires_at)) > this.now().getTime() &&
        ["ready", "in_progress", "checkpointed"].includes(pin.attempt_state),
    );
    if (row)
      requireFact(
        row.revocation_state === "active" && Date.parse(iso(row.expires_at)) > this.now().getTime(),
      );
  }

  private async load(client: PoolClient, scope: AuthorizedScope, planId: string) {
    const row = (
      await client.query(
        "SELECT * FROM app.listening_plans WHERE learner_scope_id=$1 AND id=$2 FOR UPDATE",
        [scope.learnerScopeId, planId],
      )
    ).rows[0];
    requireFact(row?.plan_json); // Unpopulated legacy plans have no invented immutable bindings.
    const plan = listeningPlanSchema.parse(row.plan_json);
    const pin = await this.pinned(client, scope, plan.attemptId);
    requireFact(plan.servingManifestId === pin.id);
    return { row, plan, pin };
  }

  async readPlan(scope: AuthorizedScope, attemptId: string): Promise<ListeningPlanView> {
    return this.transact(scope, async (client) => {
      const pin = await this.pinned(client, scope, attemptId);
      let row = (
        await client.query(
          "SELECT * FROM app.listening_plans WHERE learner_scope_id=$1 AND attempt_id=$2 FOR UPDATE",
          [scope.learnerScopeId, attemptId],
        )
      ).rows[0];
      if (!row) {
        this.active(pin);
        requireFact(pin.attempt_state === "ready");
        const eligible = await this.eligible(client, pin);
        const conditions = allowedConditionsSchema.parse(pin.allowed_conditions);
        const profile = conditions.progressionProfile;
        const practiceKind =
          conditions.practiceKind ?? (profile === "P4" ? "target_block" : "ordinary");
        const planId = id(`listening-plan:${attemptId}`);
        const occurrences = [];
        for (const { record, manifest } of eligible) {
          requireFact(manifest.progressionProfile === profile);
          const items = (
            await client.query(
              `SELECT DISTINCT b.content_item_id,i.ordinal FROM app.content_item_media_bindings b JOIN app.content_items i ON i.id=b.content_item_id
            WHERE b.asset_id=$1 AND b.manifest_revision=$2 ORDER BY i.ordinal,b.content_item_id`,
              [manifest.assetId, manifest.manifestRevision],
            )
          ).rows;
          const target = manifest.listeningFamily === "H1" ? 1 : 2;
          const authored = profile === "P0" ? 1 : target;
          const ceiling = profile === "P0" ? 4 : profile === "P1" ? target + 2 : target + 1;
          const allowed =
            conditions.allowedPlays ?? (practiceKind === "ordinary" ? ceiling : target);
          occurrences.push({
            occurrenceId: id(
              `listening-occurrence:${planId}:${manifest.assetId}:${manifest.manifestRevision}`,
            ),
            ordinal: occurrences.length + 1,
            family: manifest.listeningFamily,
            contentRevisionId: manifest.contentRevisionId,
            stimulusId: manifest.stimulusId,
            itemIds: items.map((i) => String(i.content_item_id)),
            candidates: manifest.learnerMediaRevisions.map((r) => ({
              assetId: manifest.assetId,
              manifestRevision: manifest.manifestRevision,
              manifestDigest: record.digest,
              mediaRevisionId: r.mediaRevisionId,
              digest: r.digest,
              bytes: r.bytes,
              mime: r.mime,
              durationMs: r.durationMs,
            })),
            allowedPlayCount: allowed,
            authoredSpeedRatio: manifest.authoredSpeedRatio,
            ordinalPolicies: Array.from({ length: allowed }, (_, i) => ({
              playOrdinal: i + 1,
              evidenceCondition: i >= authored ? "assisted_extra" : "authored_opportunity",
              requiresCompletedOrdinal: i === 0 ? null : i,
            })),
            seekingAllowed: practiceKind === "ordinary",
            pauseAllowed: practiceKind === "ordinary",
            transcriptPhase: profile === "P4" ? "after_block" : conditions.transcriptPhase,
            responseWindow: { readBeforeMs: 0, respondAfterMs: 0 },
          });
        }
        // Authored item order determines occurrence order, never UUID or PostgreSQL row order.
        const orderedItems = (
          await client.query(
            "SELECT content_item_id FROM app.serving_manifest_entries WHERE serving_manifest_id=$1 AND content_item_id IS NOT NULL ORDER BY ordinal",
            [pin.id],
          )
        ).rows.map((r) => String(r.content_item_id));
        occurrences.sort(
          (a, b) =>
            orderedItems.indexOf(a.itemIds[0] ?? "") - orderedItems.indexOf(b.itemIds[0] ?? ""),
        );
        const content = (
          await client.query("SELECT role FROM app.content_revisions WHERE id=$1", [
            pin.content_revision_id,
          ])
        ).rows[0];
        const plan = listeningPlanSchema.parse({
          contractMajor: 1,
          listeningPlanId: planId,
          attemptId,
          servingManifestId: pin.id,
          ...(pin.form_id ? { formId: pin.form_id } : {}),
          planVersion: listeningPolicies.plan,
          targetBlueprintVersion: eligible[0]?.manifest.targetBlueprintVersion,
          evidenceRole: content?.role,
          progressionProfile: profile,
          practiceKind,
          occurrences: occurrences.map((o, i) => ({ ...o, ordinal: i + 1 })),
          preflightPolicyRef: listeningPolicies.preflight,
          playbackPolicyRef: listeningPolicies.playback,
          timerPolicyRef: listeningPolicies.timer,
          issuedAt: this.now().toISOString(),
          expiresAt: iso(pin.expires_at),
          revocationState: "active",
        });
        await client.query(
          `INSERT INTO app.listening_plans(id,learner_scope_id,attempt_id,serving_manifest_id,form_id,contract_major,plan_version,target_blueprint_version,evidence_role,progression_profile,preflight_policy_ref,playback_policy_ref,timer_policy_ref,issued_at,expires_at,revocation_state,plan_json)
          VALUES($1,$2,$3,$4,$5,1,$6,$7,$8,$9,$10,$11,$12,$13,$14,'active',$15)`,
          [
            planId,
            scope.learnerScopeId,
            attemptId,
            pin.id,
            pin.form_id,
            plan.planVersion,
            plan.targetBlueprintVersion,
            plan.evidenceRole,
            profile,
            plan.preflightPolicyRef,
            plan.playbackPolicyRef,
            plan.timerPolicyRef,
            plan.issuedAt,
            plan.expiresAt,
            plan,
          ],
        );
        for (const o of plan.occurrences)
          await client.query(
            `INSERT INTO app.listening_plan_occurrences(id,learner_scope_id,listening_plan_id,ordinal,item_or_part_scope,candidate_media_revision_ids,allowed_play_count,authored_speed_ratio,seeking_allowed,pause_allowed,transcript_phase,response_window)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
            [
              o.occurrenceId,
              scope.learnerScopeId,
              planId,
              o.ordinal,
              JSON.stringify(o.itemIds),
              JSON.stringify(o.candidates.map((c) => c.mediaRevisionId)),
              o.allowedPlayCount,
              o.authoredSpeedRatio,
              o.seekingAllowed,
              o.pauseAllowed,
              o.transcriptPhase,
              o.responseWindow,
            ],
          );
        row = (await client.query("SELECT * FROM app.listening_plans WHERE id=$1", [planId]))
          .rows[0];
      }
      requireFact(row?.plan_json);
      const facts = (
        await client.query(
          "SELECT kind,receipt FROM app.listening_operation_facts WHERE learner_scope_id=$1 AND listening_plan_id=$2 ORDER BY (receipt->>'resourceVersion')::bigint",
          [scope.learnerScopeId, row.id],
        )
      ).rows;
      const plan = listeningPlanSchema.parse(row.plan_json);
      const playback = facts
        .filter((f) => f.kind === "playback")
        .map((f) => f.receipt as PlaybackReceipt);
      return {
        plan: {
          ...plan,
          revocationState:
            pin.revocation_state === "active" ? row.revocation_state : pin.revocation_state,
        },
        resourceVersion: Number(row.resource_version),
        phase: this.phase(row, pin),
        outputProbeRevisionId: listeningOutputProbeRevisionId,
        latestPreflight: facts.filter((f) => f.kind === "preflight").at(-1)?.receipt ?? null,
        playback,
      };
    });
  }

  private phase(row: QueryResultRow, pin: QueryResultRow): PlaybackReceipt["phase"] {
    return pin.attempt_state === "interrupted"
      ? "interrupted"
      : row.block_completed_at
        ? "block_complete"
        : row.started_at
          ? "playing"
          : row.begin_at
            ? "begin_recorded"
            : "ready";
  }

  private async replay<T>(
    client: PoolClient,
    scope: AuthorizedScope,
    planId: string,
    operationId: string,
    kind: string,
    command: unknown,
  ): Promise<T | undefined> {
    const fact = (
      await client.query(
        "SELECT * FROM app.listening_operation_facts WHERE learner_scope_id=$1 AND operation_id=$2",
        [scope.learnerScopeId, operationId],
      )
    ).rows[0];
    if (!fact) return undefined;
    requireFact(
      fact.listening_plan_id === planId &&
        fact.kind === kind &&
        fact.payload_digest === digest(canonical(command)),
      "idempotency_conflict",
    );
    return fact.receipt as T;
  }
  private async record(
    client: PoolClient,
    scope: AuthorizedScope,
    planId: string,
    operationId: string,
    kind: string,
    command: unknown,
    receipt: unknown,
  ) {
    await client.query(
      "INSERT INTO app.listening_operation_facts(learner_scope_id,operation_id,listening_plan_id,kind,payload_digest,command,receipt) VALUES($1,$2,$3,$4,$5,$6,$7)",
      [
        scope.learnerScopeId,
        operationId,
        planId,
        kind,
        digest(canonical(command)),
        command,
        receipt,
      ],
    );
    await client.query(
      "UPDATE app.listening_plans SET resource_version=resource_version+1 WHERE learner_scope_id=$1 AND id=$2",
      [scope.learnerScopeId, planId],
    );
  }

  async preflight(
    scope: AuthorizedScope,
    input: MediaPreflightObservation,
  ): Promise<MediaPreflightReceipt> {
    const command = mediaPreflightObservationSchema.parse(input);
    return this.transact(scope, async (client) => {
      const { row, plan, pin } = await this.load(client, scope, command.listeningPlanId);
      const replay = await this.replay<MediaPreflightReceipt>(
        client,
        scope,
        plan.listeningPlanId,
        command.operationId,
        "preflight",
        command,
      );
      if (replay) return replay;
      requireFact(Number(row.resource_version) === command.expectedVersion, "conflict");
      requireFact(!row.begin_at, "conflict");
      const reasons = preflightReasons(
        { ...plan, revocationState: row.revocation_state },
        command,
        this.now(),
      );
      if (
        pin.revocation_state !== "active" ||
        Date.parse(iso(pin.expires_at)) <= this.now().getTime()
      )
        reasons.push("plan_expired");
      // Candidate validation may acquire several locks. Roll back failed admission to release them.
      await client.query("SAVEPOINT listening_eligibility");
      try {
        await this.eligible(client, pin);
      } catch (error) {
        if (error && typeof error === "object" && "code" in error) throw error;
        await client.query("ROLLBACK TO SAVEPOINT listening_eligibility");
        reasons.push("media_unavailable");
      }
      if (
        row.context &&
        !isDeepStrictEqual(row.context, command.context) &&
        command.context.environmentChangeCounter <= Number(row.context.environmentChangeCounter)
      )
        reasons.push("context_changed");
      if (
        command.outboxProbe.payloadDigest !==
        digest(canonical(listeningOutboxProbePayload(command)))
      )
        reasons.push("outbox_unavailable");
      const uniqueReasons = [...new Set(reasons)].sort();
      const now = this.now();
      const receipt = mediaPreflightReceiptSchema.parse({
        contractMajor: 1,
        receiptId: id(`preflight:${scope.learnerScopeId}:${command.operationId}`),
        listeningPlanId: plan.listeningPlanId,
        operationId: command.operationId,
        resourceVersion: Number(row.resource_version) + 1,
        observationDigest: digest(canonical(command)),
        context: command.context,
        outcome:
          uniqueReasons.length === 0
            ? "ready"
            : uniqueReasons.includes("media_unavailable") || uniqueReasons.includes("plan_expired")
              ? "unavailable_affected_activity"
              : "retryable",
        reasons: uniqueReasons,
        issuedAt: now.toISOString(),
        expiresAt: new Date(Math.max(now.getTime() + 1, Date.parse(plan.expiresAt))).toISOString(),
      });
      await client.query(
        `INSERT INTO app.media_preflight_receipts(id,learner_scope_id,listening_plan_id,operation_id,policy_versions,candidate_media_revisions,verified_digest_and_length,decoded_or_loaded,local_retention_class,output_probe_confirmed,checkpoint_path_confirmed,environment_change_counter,outcome,issued_at,expires_at,observation,receipt)
        VALUES($1,$2,$3,$4,$5,$6,$6,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          receipt.receiptId,
          scope.learnerScopeId,
          plan.listeningPlanId,
          command.operationId,
          command.policyVersions,
          JSON.stringify(command.candidates),
          "bounded_block",
          !uniqueReasons.includes("output_unconfirmed"),
          !uniqueReasons.includes("outbox_unavailable"),
          command.context.environmentChangeCounter,
          receipt.outcome,
          receipt.issuedAt,
          receipt.expiresAt,
          command,
          receipt,
        ],
      );
      if (receipt.outcome === "ready")
        await client.query(
          "UPDATE app.listening_plans SET context=$3 WHERE learner_scope_id=$1 AND id=$2",
          [scope.learnerScopeId, plan.listeningPlanId, command.context],
        );
      await this.record(
        client,
        scope,
        plan.listeningPlanId,
        command.operationId,
        "preflight",
        command,
        receipt,
      );
      return receipt;
    });
  }

  async audio(
    scope: AuthorizedScope,
    planId: string,
    mediaRevisionId: string,
  ): Promise<{ bytes: Uint8Array; mime: string }> {
    return this.transact(scope, async (client) => {
      const { row, plan, pin } = await this.load(client, scope, planId);
      this.active(pin, row);
      requireFact(!row.begin_at); // After Begin only the already verified bounded copy is playable.
      requireFact(
        plan.occurrences.some((o) =>
          o.candidates.some((c) => c.mediaRevisionId === mediaRevisionId),
        ),
      );
      const eligible = await this.eligible(client, pin);
      const rendition = eligible
        .flatMap((e) => e.manifest.learnerMediaRevisions)
        .find((r) => r.mediaRevisionId === mediaRevisionId);
      requireFact(rendition && rendition.bytes <= 64 * 1024 * 1024);
      const bytes = await this.bytes.read(rendition.objectKey, rendition.bytes);
      requireFact(
        bytes && bytes.length === rendition.bytes && digest(bytes) === rendition.digest,
        "integrity_failed",
      );
      return { bytes, mime: rendition.mime };
    });
  }

  async playback(
    scope: AuthorizedScope,
    input: PlaybackOccurrenceCommand,
  ): Promise<PlaybackReceipt> {
    const command = playbackOccurrenceCommandSchema.parse(input);
    return this.transact(scope, async (client) => {
      const { row, plan, pin } = await this.load(client, scope, command.listeningPlanId);
      const replay = await this.replay<PlaybackReceipt>(
        client,
        scope,
        plan.listeningPlanId,
        command.operationId,
        "playback",
        command,
      );
      if (replay) return replay;
      requireFact(Number(row.resource_version) === command.expectedVersion, "conflict");
      const occurrence = plan.occurrences.find((o) => o.occurrenceId === command.occurrenceId);
      const candidate = occurrence?.candidates.find(
        (c) => c.mediaRevisionId === command.mediaRevisionId,
      );
      requireFact(occurrence && candidate && command.playOrdinal <= occurrence.allowedPlayCount);
      const receiptRow = (
        await client.query(
          "SELECT observation,receipt FROM app.media_preflight_receipts WHERE learner_scope_id=$1 AND id=$2 AND listening_plan_id=$3",
          [scope.learnerScopeId, command.preflightReceiptId, plan.listeningPlanId],
        )
      ).rows[0];
      requireFact(receiptRow?.receipt);
      const preflight = mediaPreflightReceiptSchema.parse(receiptRow.receipt);
      const observation = mediaPreflightObservationSchema.parse(receiptRow.observation);
      requireFact(
        preflight.outcome === "ready" &&
          isDeepStrictEqual(preflight.context, command.context) &&
          isDeepStrictEqual(row.context, command.context) &&
          observation.candidates.some(
            (c) =>
              c.occurrenceId === occurrence.occurrenceId &&
              c.mediaRevisionId === candidate.mediaRevisionId,
          ),
      );
      requireFact(
        Date.parse(command.occurredAt) <= this.now().getTime() &&
          Date.parse(command.intentPersistedAt) >= Date.parse(preflight.issuedAt),
      );
      const stored = (
        await client.query(
          "SELECT * FROM app.playback_occurrences WHERE learner_scope_id=$1 AND occurrence_id=$2 AND play_ordinal=$3 FOR UPDATE",
          [scope.learnerScopeId, occurrence.occurrenceId, command.playOrdinal],
        )
      ).rows[0];
      let mayStartNow = false;
      if (command.event === "start_intent") {
        const latestPreflight = (
          await client.query(
            "SELECT receipt->>'receiptId' AS id FROM app.listening_operation_facts WHERE learner_scope_id=$1 AND listening_plan_id=$2 AND kind='preflight' ORDER BY (receipt->>'resourceVersion')::bigint DESC LIMIT 1",
            [scope.learnerScopeId, plan.listeningPlanId],
          )
        ).rows[0];
        requireFact(latestPreflight?.id === preflight.receiptId, "conflict");
        requireFact(
          !stored && command.clientSequence === 1 && command.positionMs === 0,
          "conflict",
        );
        requireFact(Date.parse(command.occurredAt) < Date.parse(preflight.expiresAt));
        requireFact(Date.parse(command.intentPersistedAt) === Date.parse(command.occurredAt));
        requireFact(
          (!row.block_completed_at || plan.practiceKind === "ordinary") &&
            ["ready", "in_progress", "checkpointed"].includes(pin.attempt_state),
        );
        const priorOrdinal =
          occurrence.ordinalPolicies[command.playOrdinal - 1]?.requiresCompletedOrdinal;
        if (priorOrdinal)
          requireFact(
            (
              await client.query(
                "SELECT 1 FROM app.playback_occurrences WHERE learner_scope_id=$1 AND occurrence_id=$2 AND play_ordinal=$3 AND state='completed'",
                [scope.learnerScopeId, occurrence.occurrenceId, priorOrdinal],
              )
            ).rowCount,
            "conflict",
          );
        for (const previous of plan.occurrences.filter((o) => o.ordinal < occurrence.ordinal)) {
          requireFact(
            (
              await client.query(
                "SELECT 1 FROM app.playback_occurrences WHERE learner_scope_id=$1 AND occurrence_id=$2 AND play_ordinal=$3 AND state='completed'",
                [
                  scope.learnerScopeId,
                  previous.occurrenceId,
                  previous.ordinalPolicies.filter(
                    (p) => p.evidenceCondition === "authored_opportunity",
                  ).length,
                ],
              )
            ).rowCount,
            "conflict",
          );
        }
        // A delayed outbox event can record past use under its receipt. It cannot grant a play now.
        const currentLease =
          Date.parse(preflight.expiresAt) > this.now().getTime() &&
          row.revocation_state === "active" &&
          pin.revocation_state === "active" &&
          Date.parse(iso(pin.expires_at)) > this.now().getTime();
        if (currentLease) {
          await client.query("SAVEPOINT start_admission");
          try {
            await this.eligible(client, pin);
            mayStartNow = true;
          } catch (error) {
            if (error && typeof error === "object" && "code" in error) throw error;
            await client.query("ROLLBACK TO SAVEPOINT start_admission");
          }
        }
        // A present-time failed admission is no historical fact; preserve only a delayed intent.
        requireFact(mayStartNow || Date.parse(command.occurredAt) < this.now().getTime() - 5_000);
        await client.query(
          `INSERT INTO app.playback_occurrences(occurrence_id,learner_scope_id,play_ordinal,operation_id,idempotency_hash,state,media_revision_id,authorized_at,client_sequence,local_intent_id,preflight_receipt_id,context)
          VALUES($1,$2,$3,$4,$5,'authorized',$6,$7,1,$8,$9,$10)`,
          [
            occurrence.occurrenceId,
            scope.learnerScopeId,
            command.playOrdinal,
            command.operationId,
            digest(canonical(command)),
            candidate.mediaRevisionId,
            command.occurredAt,
            command.localIntentId,
            preflight.receiptId,
            command.context,
          ],
        );
        await client.query(
          "UPDATE app.listening_plans SET begin_at=COALESCE(begin_at,$3) WHERE learner_scope_id=$1 AND id=$2",
          [scope.learnerScopeId, plan.listeningPlanId, command.occurredAt],
        );
        row.begin_at ??= command.occurredAt;
      } else {
        requireFact(
          stored &&
            stored.local_intent_id === command.localIntentId &&
            stored.media_revision_id === candidate.mediaRevisionId &&
            stored.preflight_receipt_id === preflight.receiptId &&
            isDeepStrictEqual(stored.context, command.context),
          "conflict",
        );
        requireFact(
          command.clientSequence === Number(stored.client_sequence) + 1 &&
            Date.parse(command.intentPersistedAt) === Date.parse(iso(stored.authorized_at)),
          "conflict",
        );
        requireFact(!["completed", "failed"].includes(stored.state), "conflict");
        requireFact(
          command.event === "started"
            ? stored.state === "authorized"
            : command.event === "completed"
              ? stored.state === "started"
              : true,
          "conflict",
        );
        requireFact(
          Date.parse(command.occurredAt) >=
            Date.parse(iso(stored.started_at ?? stored.authorized_at)) &&
            command.positionMs >= Number(stored.observed_end_position_ms ?? 0) &&
            command.positionMs <= candidate.durationMs,
          "conflict",
        );
        if (command.event === "started") {
          requireFact(Date.parse(command.occurredAt) < Date.parse(preflight.expiresAt));
          requireFact(command.positionMs === 0, "conflict");
          await client.query(
            "UPDATE app.listening_plans SET started_at=COALESCE(started_at,$3) WHERE learner_scope_id=$1 AND id=$2",
            [scope.learnerScopeId, plan.listeningPlanId, command.occurredAt],
          );
          await client.query(
            "UPDATE app.attempts SET occurred_at=COALESCE(occurred_at,$3),state=CASE WHEN state='ready' THEN 'in_progress' ELSE state END,resource_version=resource_version+1 WHERE learner_scope_id=$1 AND id=$2",
            [scope.learnerScopeId, plan.attemptId, command.occurredAt],
          );
          row.started_at ??= command.occurredAt;
          await this.exposure(client, scope, plan, occurrence.contentRevisionId);
        }
        if (command.event === "completed")
          requireFact(command.positionMs === candidate.durationMs, "conflict");
        await client.query(
          `UPDATE app.playback_occurrences SET state=$4,started_at=CASE WHEN $4='started' THEN $5 ELSE started_at END,completed_at=CASE WHEN $4='completed' THEN $5 ELSE completed_at END,observed_end_position_ms=$6,visibility_changes=$7,stall_intervals=$8,output_or_device_change=$9,learner_pause_ms=$10,technical_pause_ms=$11,speed_actual=$12,fault_reason=$13,client_sequence=$14 WHERE learner_scope_id=$1 AND occurrence_id=$2 AND play_ordinal=$3`,
          [
            scope.learnerScopeId,
            occurrence.occurrenceId,
            command.playOrdinal,
            command.event,
            command.occurredAt,
            command.positionMs,
            command.observations.visibilityChanges,
            JSON.stringify(command.observations.stallIntervals),
            command.observations.outputOrDeviceChange,
            command.observations.learnerPauseMs,
            command.observations.technicalPauseMs,
            command.observations.speedActual,
            command.faultReason ?? null,
            command.clientSequence,
          ],
        );
      }
      const played = (
        await client.query(
          "SELECT p.*,o.item_or_part_scope FROM app.playback_occurrences p JOIN app.listening_plan_occurrences o ON o.id=p.occurrence_id WHERE p.learner_scope_id=$1 AND o.listening_plan_id=$2",
          [scope.learnerScopeId, plan.listeningPlanId],
        )
      ).rows;
      const failedItems = new Set(
        played.filter((p) => p.state === "failed").flatMap((p) => p.item_or_part_scope as string[]),
      );
      const wholeScope = plan.occurrences
        .flatMap((o) => o.itemIds)
        .every((item) => failedItems.has(item));
      if (wholeScope) {
        await client.query(
          "UPDATE app.attempts SET state='interrupted',resource_version=resource_version+1 WHERE learner_scope_id=$1 AND id=$2 AND state IN ('ready','in_progress','checkpointed')",
          [scope.learnerScopeId, plan.attemptId],
        );
        pin.attempt_state = "interrupted";
      }
      const blockDone = plan.occurrences.every(
        (o) =>
          o.ordinalPolicies
            .filter((p) => p.evidenceCondition === "authored_opportunity")
            .every((policy) =>
              played.some(
                (p) =>
                  p.occurrence_id === o.occurrenceId &&
                  Number(p.play_ordinal) === policy.playOrdinal &&
                  ["completed", "failed"].includes(p.state),
              ),
            ) || played.some((p) => p.occurrence_id === o.occurrenceId && p.state === "failed"),
      );
      if (blockDone) {
        await client.query(
          "UPDATE app.listening_plans SET block_completed_at=COALESCE(block_completed_at,$3) WHERE learner_scope_id=$1 AND id=$2",
          [scope.learnerScopeId, plan.listeningPlanId, command.occurredAt],
        );
        row.block_completed_at ??= command.occurredAt;
      }
      const receipt: PlaybackReceipt = {
        operationId: command.operationId,
        listeningPlanId: plan.listeningPlanId,
        occurrenceId: occurrence.occurrenceId,
        playOrdinal: command.playOrdinal,
        resourceVersion: Number(row.resource_version) + 1,
        event: command.event,
        localIntentId: command.localIntentId,
        recordedAt: this.now().toISOString(),
        mayStartNow,
        authorizationExpiresAt: preflight.expiresAt,
        affectedItemIds: command.event === "failed" ? occurrence.itemIds : [],
        phase: this.phase(row, pin),
      };
      await this.record(
        client,
        scope,
        plan.listeningPlanId,
        command.operationId,
        "playback",
        command,
        receipt,
      );
      return receipt;
    });
  }

  private async exposure(
    client: PoolClient,
    scope: AuthorizedScope,
    plan: ListeningPlan,
    revision: string,
    transcript?: { transcriptRevisionId: string; mediaRevisionId: string },
  ) {
    const factId = id(
      `listening-exposure:${plan.attemptId}:${revision}:${transcript?.transcriptRevisionId ?? "audio"}`,
    );
    if (
      (
        await client.query("SELECT 1 FROM app.exposure_facts WHERE learner_scope_id=$1 AND id=$2", [
          scope.learnerScopeId,
          factId,
        ])
      ).rowCount
    )
      return;
    const family = (
      await client.query("SELECT family_id FROM app.content_revisions WHERE id=$1", [revision])
    ).rows[0]?.family_id;
    requireFact(family);
    const previous =
      (
        await client.query(
          "SELECT exposure_class FROM app.content_exposure_index WHERE learner_scope_id=$1 AND content_family_id=$2",
          [scope.learnerScopeId, family],
        )
      ).rows[0]?.exposure_class ?? "unseen";
    const envelope = {
      kind: transcript ? "transcript" : "listening_stimulus",
      contentRevisionId: revision,
      contentFamilyId: family,
      preAttemptExposureClass: previous,
      exposureClass: transcript ? "answer_exposed" : "exposed_family",
      ...(transcript ?? {}),
    };
    const sequence = (
      await client.query(
        "UPDATE app.learner_scopes SET next_sequence=next_sequence+1 WHERE id=$1 RETURNING next_sequence-1 AS n",
        [scope.learnerScopeId],
      )
    ).rows[0]?.n;
    await client.query(
      "INSERT INTO app.exposure_facts(id,learner_scope_id,attempt_id,fact_type,schema_major,envelope,digest,learner_sequence) VALUES($1,$2,$3,'pinned_disclosure_v1',1,$4,$5,$6)",
      [
        factId,
        scope.learnerScopeId,
        plan.attemptId,
        envelope,
        digest(canonical(envelope)),
        sequence,
      ],
    );
    await client.query(
      `INSERT INTO app.content_exposure_index(learner_scope_id,content_family_id,exposure_class,last_trigger,last_content_revision_id) VALUES($1,$2,$4,$5,$3)
      ON CONFLICT(learner_scope_id,content_family_id) DO UPDATE SET exposure_class=CASE WHEN app.content_exposure_index.exposure_class IN ('answer_exposed','near_duplicate_family') AND $4='exposed_family' THEN app.content_exposure_index.exposure_class ELSE $4 END,last_trigger=$5,last_content_revision_id=$3,occurrence_count=app.content_exposure_index.occurrence_count+1,last_exposed_at=transaction_timestamp()`,
      [
        scope.learnerScopeId,
        family,
        revision,
        transcript ? "answer_exposed" : "exposed_family",
        transcript ? "transcript" : "learner_visible_stimulus",
      ],
    );
  }

  async transcript(scope: AuthorizedScope, planId: string, mediaId: string) {
    return this.transact(scope, async (client) => {
      const { row, plan, pin } = await this.load(client, scope, planId);
      const occurrence = plan.occurrences.find((o) =>
        o.candidates.some((c) => c.mediaRevisionId === mediaId),
      );
      requireFact(occurrence && occurrence.transcriptPhase !== "never");
      // Playback exhaustion alone does not prove the response block has ended.
      requireFact(
        (
          await client.query(
            "SELECT 1 FROM app.attempt_submissions WHERE learner_scope_id=$1 AND attempt_id=$2",
            [scope.learnerScopeId, plan.attemptId],
          )
        ).rowCount,
      );
      if (occurrence.transcriptPhase === "after_block") requireFact(row.block_completed_at);
      const eligible = await this.eligible(client, pin, "transcript");
      const manifest = eligible.find((e) =>
        e.manifest.learnerMediaRevisions.some((r) => r.mediaRevisionId === mediaId),
      )?.manifest;
      requireFact(
        manifest &&
          manifest.transcript.mediaRevisionId === mediaId &&
          manifest.transcript.earliestRevealPhase !== "never",
      );
      if (manifest.transcript.earliestRevealPhase === "after_block")
        requireFact(row.block_completed_at);
      const bytes = await this.bytes.read(manifest.transcript.objectKey, 100_000);
      requireFact(
        bytes && bytes.length <= 100_000 && digest(bytes) === manifest.transcript.digest,
        "integrity_failed",
      );
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      await this.exposure(client, scope, plan, occurrence.contentRevisionId, {
        transcriptRevisionId: manifest.transcript.transcriptRevisionId,
        mediaRevisionId: mediaId,
      });
      return transcriptRevealSchema.parse({
        transcriptRevisionId: manifest.transcript.transcriptRevisionId,
        mediaRevisionId: mediaId,
        kind: manifest.transcript.kind,
        language: "de",
        digest: manifest.transcript.digest,
        authorizedPhase: occurrence.transcriptPhase,
        text,
      });
    });
  }
}
