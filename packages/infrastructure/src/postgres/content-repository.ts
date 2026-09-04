import { isDeepStrictEqual } from "node:util";
import { allowedConditionsSchema } from "@bestehen/contracts";
import type {
  AppId,
  AuthorizedScope,
  ContentApprovalLevel,
  ContentClass,
  ContentFamilyId,
  ContentFormId,
  ContentItemId,
  ContentRevisionId,
  EvidenceObservationId,
  FreshnessDecision,
  ImpactCauseKind,
  ImpactMode,
  JobId,
  LearnerScopeId,
  MediaRevisionId,
  OperationId,
  Result,
  ServingManifestId,
} from "@bestehen/domain";
import {
  appId,
  canHoldApprovalLevel,
  canTransitionContentApproval,
  type EvidenceValidityState,
  type ExposureClass,
  exposureClasses,
  reasonRegistryRelease,
} from "@bestehen/domain";
import type { Pool, PoolClient } from "pg";
import type { AudioCatalogueValidator } from "@bestehen/application";
import { PostgresMediaCatalogue } from "../media/catalogue.js";
import { type ContentQueue, jobPolicyFor } from "../jobs/index.js";
import { inTransaction, lockActiveLearnerScope } from "./foundation-repository.js";

/* ------------------------------------------------------------------------------------------------
 * Errors
 * ---------------------------------------------------------------------------------------------- */

/**
 * Why a content command was refused. `not_available` is deliberately the answer to a cross-scope or
 * unknown reference: a caller outside the scope learns nothing about whether the thing exists.
 */
export type ContentRepositoryError =
  | "not_available"
  | "conflict"
  | "idempotency_conflict"
  | "illegal_transition"
  | "approval_ineligible"
  | "content_unavailable"
  | "rights_withdrawn"
  | "accessibility_blocked";

/** Whether a write created new state or replayed committed state. Never "overwrote". */
export type CommitDisposition = "created" | "replayed";

/* ------------------------------------------------------------------------------------------------
 * Shared helpers
 * ---------------------------------------------------------------------------------------------- */

const advisoryNamespace = 420_105;

/** Serializes concurrent promotions of one release identity without locking a whole relation. */
async function lockReleaseIdentity(client: PoolClient, releaseIdentity: string): Promise<void> {
  await client.query("SELECT pg_advisory_xact_lock($1, hashtext($2))", [
    advisoryNamespace,
    releaseIdentity,
  ]);
}

async function lockApprovalSubject(client: PoolClient, subjectId: string): Promise<void> {
  await client.query("SELECT pg_advisory_xact_lock($1, hashtext($2))", [
    advisoryNamespace + 1,
    subjectId,
  ]);
}

/**
 * The Stage 03 `app.content_revisions.approval_state` union is coarser than the Stage 05 approval
 * level union and was not replaced by `20260901_051_content_graph`. The level stays the precise
 * fact on `app.approval_decisions`; this is the projection onto the older column so a Stage 03
 * reader keeps working.
 */
function approvalStateFor(
  level: ContentApprovalLevel,
  outcome: "granted" | "denied",
): "candidate" | "approved" | "denied" | "quarantined" | "retired" {
  if (outcome === "denied") return "denied";
  switch (level) {
    case "draft":
      return "candidate";
    case "quarantine":
      return "quarantined";
    case "retired":
      return "retired";
    default:
      return "approved";
  }
}

/** Approval levels a serving lease may cite. `draft`, `quarantine` and `retired` never serve. */
export const servableApprovalLevels: readonly ContentApprovalLevel[] = [
  "training",
  "independent_b1",
  "readiness_p4",
  "gold",
];

/* ------------------------------------------------------------------------------------------------
 * Inputs
 * ---------------------------------------------------------------------------------------------- */

export interface ContentReleaseEntry {
  readonly contentRevisionId: ContentRevisionId;
  readonly formId?: ContentFormId;
}

export interface ContentReleasePublication {
  readonly releaseId: string;
  readonly releaseIdentity: string;
  readonly digest: string;
  readonly predecessorReleaseId?: string;
  readonly entries: readonly ContentReleaseEntry[];
  readonly activatedAt: Date;
}

export interface ApprovalDecisionInput {
  readonly decisionId: string;
  readonly subjectKind: "content_revision" | "content_form" | "media_asset";
  readonly subjectId: string;
  readonly contentClass: ContentClass;
  readonly level: ContentApprovalLevel;
  readonly outcome: "granted" | "denied";
  /** Three distinct recorded commands even when the owner holds every role (§7.6). */
  readonly authorRef: string;
  readonly validatorRef: string;
  readonly approverRef: string;
  readonly methodVersion: string;
  readonly reasonCode: string;
  readonly evidenceRef: string;
  readonly decidedAt: Date;
}

export interface ServingManifestEntryInput {
  readonly ordinal: number;
  readonly contentRevisionId: ContentRevisionId;
  readonly contentItemId?: ContentItemId;
  readonly mediaRevisionId?: MediaRevisionId;
}

export interface ServingManifestIssueRequest {
  readonly servingManifestId: ServingManifestId;
  readonly operationId: OperationId;
  readonly formId?: ContentFormId;
  readonly contentClass: ContentClass;
  readonly approvalRole: ContentApprovalLevel;
  readonly entries: readonly ServingManifestEntryInput[];
  /** Key **digests** only. No key, correct flag or rationale may reach this relation. */
  readonly keyRevisionDigests: readonly string[];
  readonly allowedConditions: unknown;
  readonly learnerSafePayloadDigest: string;
  readonly freshnessDecision: FreshnessDecision;
  readonly comparedFamilyRefs: readonly string[];
  readonly authorizationVersion: string;
  readonly contentReleaseIdentity: string;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  readonly digest: string;
}

export interface ServingManifestRecord {
  readonly servingManifestId: ServingManifestId;
  readonly learnerScopeId: LearnerScopeId;
  readonly operationId: OperationId;
  readonly formId?: ContentFormId;
  readonly contentClass: ContentClass;
  readonly approvalRole: ContentApprovalLevel;
  readonly entries: readonly ServingManifestEntryInput[];
  readonly keyRevisionDigests: readonly string[];
  readonly allowedConditions: unknown;
  readonly learnerSafePayloadDigest: string;
  readonly freshnessDecision: FreshnessDecision;
  readonly comparedFamilyRefs: readonly string[];
  readonly authorizationVersion: string;
  readonly contentReleaseIdentity: string;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  readonly revocationState: "active" | "revoked_before_start" | "revoked_after_pin";
  readonly digest: string;
}

/**
 * The exact learner-facing revision pinned by a serving manifest. Values authored in the content
 * package remain `unknown` here because the infrastructure package may not depend on content. The
 * web composition boundary validates them before rendering. This read never names the key table.
 */
export interface PinnedLearnerMaterialRecord {
  readonly manifest: ServingManifestRecord;
  readonly contentFamilyId: ContentFamilyId;
  readonly taskFamilyKind: string;
  readonly contentRevisionId: ContentRevisionId;
  readonly instruction: unknown;
  readonly learnerPayload: unknown;
  readonly progressionProfile: string;
  readonly itemIds: readonly ContentItemId[];
}

/** One publishable revision selected before a manifest is issued. Key bytes never cross this read. */
export interface EligibleServingRevisionRecord {
  readonly contentFamilyId: ContentFamilyId;
  readonly taskFamilyKind: string;
  readonly contentRevisionId: ContentRevisionId;
  readonly contentClass: ContentClass;
  readonly approvalRole: ContentApprovalLevel;
  readonly contentReleaseIdentity: string;
  readonly instruction: unknown;
  readonly learnerPayload: unknown;
  readonly progressionProfile: string;
  readonly itemIds: readonly ContentItemId[];
  readonly mediaRevisionIds: readonly MediaRevisionId[];
  readonly keyRevisionDigests: readonly string[];
  readonly priorExposureClass?: ExposureClass;
  /** Safe exact aggregate pins. Listening issuance requires these in allowedConditions.audioManifestPins. */
  readonly audioManifestPins?: readonly AudioManifestPin[];
}

export interface AudioManifestPin {
  readonly assetId: string;
  readonly manifestRevision: string;
  readonly digest: string;
  readonly contentRevisionId: string;
  readonly stimulusId: string;
  readonly mediaRevisionIds: readonly string[];
}

function audioPins(
  entries: Awaited<ReturnType<PostgresMediaCatalogue["readEligible"]>>,
): readonly AudioManifestPin[] {
  return entries
    .map(({ record, manifest }) => ({
      assetId: record.assetId,
      manifestRevision: record.manifestRevision,
      digest: record.digest,
      contentRevisionId: record.contentRevisionId,
      stimulusId: record.stimulusId,
      mediaRevisionIds: manifest.learnerMediaRevisions
        .map((rendition) => rendition.mediaRevisionId)
        .sort(),
    }))
    .sort((left, right) =>
      left.assetId < right.assetId ? -1 : left.assetId > right.assetId ? 1 : 0,
    );
}

const listeningKinds = new Set([
  "H1ShortAnnouncements",
  "H2ConversationInterview",
  "H3ShortFunctionalTexts",
]);

/** Exact server-only scoring input selected by the manifest's pinned key digests. */
export interface PinnedScoringUnitRecord {
  readonly contentItemId: ContentItemId;
  readonly contentRevisionId: ContentRevisionId;
  readonly binding: unknown;
  readonly scorable: unknown;
  readonly keyRevisionId: AppId<"key_revision">;
  readonly acceptedResponseSet: unknown;
  readonly responseCardinality: { readonly min: number; readonly max: number };
  readonly scoringPolicyRef: string;
}

export const exposureTriggerValues = [
  "learner_visible_stimulus",
  "decisive_information",
  "key_or_rationale",
  "transcript",
  "partner_private_content",
] as const;
export type ExposureTriggerValue = (typeof exposureTriggerValues)[number];

export interface ExposureRecordInput {
  readonly operationId: OperationId;
  readonly contentFamilyId: ContentFamilyId;
  readonly exposureClass: ExposureClass;
  readonly trigger: ExposureTriggerValue;
  readonly contentRevisionId?: ContentRevisionId;
  readonly occurredAt: Date;
  /** Digest over the caller's canonical exposure payload; a differing digest is a conflict. */
  readonly payloadDigest: string;
}

export interface ExposureIndexRow {
  readonly contentFamilyId: ContentFamilyId;
  readonly exposureClass: ExposureClass;
  readonly lastTrigger: ExposureTriggerValue;
  readonly occurrenceCount: number;
  readonly firstExposedAt: Date;
  readonly lastExposedAt: Date;
}

export interface ImpactSelectorInput {
  readonly observationIds?: readonly EvidenceObservationId[];
  readonly contentRevisionIds?: readonly ContentRevisionId[];
  readonly contentFamilyIds?: readonly ContentFamilyId[];
  readonly contentItemIds?: readonly ContentItemId[];
  readonly contentFormIds?: readonly ContentFormId[];
  readonly mediaRevisionIds?: readonly MediaRevisionId[];
}

export interface ImpactAssertionInput {
  readonly impactAssertionId: string;
  readonly incidentId: string;
  readonly ownerContext: string;
  readonly actorRef: string;
  readonly authorizationVersion: string;
  readonly causeKind: ImpactCauseKind;
  readonly impactMode: ImpactMode;
  readonly requestedValidity?: EvidenceValidityState;
  readonly selectors: ImpactSelectorInput;
  readonly learnerScopeBound: readonly LearnerScopeId[];
  readonly declaredCardinality: number;
  readonly affectedScope: readonly string[];
  readonly unaffectedScope: readonly string[];
  readonly reasonCode: string;
  readonly evidenceRefs: readonly string[];
  readonly policyAndContractVersions: Readonly<Record<string, string>>;
  readonly unknownScopeSuperset?: Readonly<Record<string, unknown>>;
  readonly reviewedPolicyOverrideRef?: string;
  readonly effectiveAt: Date;
  readonly digest: string;
}

export interface ImpactTargetRow {
  readonly learnerScopeId: LearnerScopeId;
  readonly observationId: EvidenceObservationId;
}

export interface ImpactTargetInput extends ImpactTargetRow {
  /** The validity assertion the ledger appended, or `undefined` for a serving-only impact. */
  readonly assertionId?: string;
  readonly disposition: "resolved" | "unresolved_superset";
}

export interface DefectReportInput {
  readonly defectReportId: string;
  readonly operationId: OperationId;
  readonly contentRevisionId: ContentRevisionId;
  readonly contentItemId?: ContentItemId;
  readonly attemptId?: string;
  readonly category:
    | "ambiguous_key"
    | "contradictory_stimulus"
    | "media_defect"
    | "accessibility_barrier"
    | "rights_concern"
    | "other";
  readonly note?: string;
  readonly reportedAt: Date;
}

export interface ContentJobInput {
  readonly jobId: JobId;
  readonly learnerScopeId: LearnerScopeId;
  readonly kind: ContentQueue;
  readonly semanticIdentity: string;
  readonly payloadDigest: string;
  readonly deadline: Date;
  readonly maximumAttempts: number;
}

/* ------------------------------------------------------------------------------------------------
 * The repository
 * ---------------------------------------------------------------------------------------------- */

/**
 * Content graph writes: publication, the approval chain, serving-manifest issuance, the exposure
 * index and impact assertions.
 *
 * Three properties hold across every method here and are what the tests pin:
 *
 * 1. **Every retryable mutation is idempotent.** An exact retry returns the committed result with
 *    `disposition: "replayed"` and performs no second effect; a reuse of the same identity with a
 *    different payload is rejected as `idempotency_conflict` rather than silently overwritten.
 * 2. **Serving is rechecked at issuance.** Whatever the caller decided, {@link assertServable} runs
 *    again inside the transaction that writes the lease. UI hiding and a caller's prior decision are
 *    not authorization.
 * 3. **Withdrawal stops serving and rewrites no history.** Revocation changes `revocation_state` and
 *    nothing else; {@link readServingManifest} resolves an already-issued lease without re-applying
 *    the servable check, so an attempt already under way still finds its exact pinned material.
 */
export class PostgresContentRepository {
  private readonly mediaCatalogue: PostgresMediaCatalogue | undefined;
  public constructor(
    private readonly pool: Pool,
    mediaValidator?: AudioCatalogueValidator,
  ) {
    this.mediaCatalogue = mediaValidator
      ? new PostgresMediaCatalogue(pool, mediaValidator)
      : undefined;
  }

  /* ---------------------------------------------------------------------------------------------
   * Defence in depth
   * ------------------------------------------------------------------------------------------- */

  /**
   * Re-verifies, inside the caller's transaction, that every named revision may be served right
   * now: it belongs to the active release under the cited identity, its class matches, its current
   * approval decision is a granted decision at the cited level that the class may hold, its rights
   * envelope is `current`, and its accessibility manifest passed.
   *
   * This deliberately repeats work the serving planner already did. The planner reads a snapshot;
   * this runs in the same transaction as the write, so a withdrawal or quarantine that landed in
   * between cannot slip a lease out.
   */
  private async assertServable(
    client: PoolClient,
    revisionIds: readonly ContentRevisionId[],
    expected: {
      readonly contentClass: ContentClass;
      readonly approvalRole: ContentApprovalLevel;
      readonly contentReleaseIdentity: string;
    },
  ): Promise<ContentRepositoryError | undefined> {
    if (revisionIds.length === 0) return "not_available";
    if (!servableApprovalLevels.includes(expected.approvalRole)) return "approval_ineligible";
    if (!canHoldApprovalLevel(expected.contentClass, expected.approvalRole)) {
      return "approval_ineligible";
    }
    // Release membership is asked as a correlated EXISTS, not as a join. A revision that survives a
    // release rotation belongs to BOTH the retired and the active release, so joining
    // `content_release_entries` returns several rows for one revision and whichever row landed last
    // decided the answer. That made serving depend on row order: the same database could refuse a
    // perfectly servable revision. One row per revision, and the membership question answered once.
    const result = await client.query(
      `SELECT cr.id,
              cr.content_class,
              ad.level AS approval_level,
              ad.outcome AS approval_outcome,
              re.state AS rights_state,
              am.gate_status AS accessibility_status,
              EXISTS (
                SELECT 1 FROM app.content_release_entries cre
                  JOIN app.content_releases rel ON rel.id = cre.release_id
                 WHERE cre.content_revision_id = cr.id
                   AND rel.state = 'active' AND rel.release_identity = $2
              ) AS in_active_release
         FROM app.content_revisions cr
         LEFT JOIN app.approval_decisions ad ON ad.id = cr.current_approval_decision_id
         LEFT JOIN app.rights_envelopes re ON re.id = cr.rights_envelope_id
         LEFT JOIN app.accessibility_manifests am ON am.id = cr.accessibility_manifest_id
        WHERE cr.id = ANY($1::uuid[])`,
      [[...revisionIds], expected.contentReleaseIdentity],
    );
    const byId = new Map(result.rows.map((row) => [String(row.id), row]));
    for (const revisionId of revisionIds) {
      const row = byId.get(revisionId);
      if (!row) return "content_unavailable";
      if (row.in_active_release !== true) return "content_unavailable";
      if (row.content_class !== expected.contentClass) return "content_unavailable";
      if (row.approval_outcome !== "granted" || row.approval_level !== expected.approvalRole) {
        return "approval_ineligible";
      }
      if (row.rights_state !== "current") return "rights_withdrawn";
      if (row.accessibility_status !== "pass") return "accessibility_blocked";
    }
    return undefined;
  }

  /* ---------------------------------------------------------------------------------------------
   * Publication
   * ------------------------------------------------------------------------------------------- */

  /**
   * Promotes a content release atomically. Re-running with the same id and digest is a no-op that
   * reports `replayed`; the same id with a different digest is a conflict, because a release
   * identity is immutable once published.
   */
  public async publishContentRelease(
    input: ContentReleasePublication,
  ): Promise<
    Result<
      { readonly disposition: CommitDisposition; readonly releaseId: string },
      ContentRepositoryError
    >
  > {
    if (input.entries.length === 0) return { ok: false, error: "not_available" };
    return inTransaction(this.pool, async (client) => {
      await lockReleaseIdentity(client, input.releaseIdentity);
      const existing = await client.query(
        "SELECT id,release_identity,state,digest FROM app.content_releases WHERE id=$1 FOR UPDATE",
        [input.releaseId],
      );
      const current = existing.rows[0];
      if (current) {
        if (current.digest !== input.digest || current.release_identity !== input.releaseIdentity) {
          return { ok: false as const, error: "conflict" as const };
        }
        if (current.state === "active") {
          return {
            ok: true as const,
            value: { disposition: "replayed" as const, releaseId: input.releaseId },
          };
        }
        if (current.state !== "candidate")
          return { ok: false as const, error: "conflict" as const };
      } else {
        await client.query(
          `INSERT INTO app.content_releases(id,release_identity,state,digest,predecessor_id,created_at)
           VALUES($1,$2,'candidate',$3,$4,transaction_timestamp())`,
          [
            input.releaseId,
            input.releaseIdentity,
            input.digest,
            input.predecessorReleaseId ?? null,
          ],
        );
      }
      for (const entry of input.entries) {
        await client.query(
          `INSERT INTO app.content_release_entries(release_id,content_revision_id,form_id)
           VALUES($1,$2,$3) ON CONFLICT(release_id,content_revision_id) DO NOTHING`,
          [input.releaseId, entry.contentRevisionId, entry.formId ?? null],
        );
      }
      const counted = await client.query(
        "SELECT count(*)::int AS entries FROM app.content_release_entries WHERE release_id=$1",
        [input.releaseId],
      );
      if (Number(counted.rows[0]?.entries) !== input.entries.length) {
        // A replay that names a different entry set is not the same release.
        return { ok: false as const, error: "conflict" as const };
      }
      await client.query(
        `UPDATE app.content_releases SET state='retired',retired_at=transaction_timestamp()
          WHERE release_identity=$1 AND state='active' AND id<>$2`,
        [input.releaseIdentity, input.releaseId],
      );
      const promoted = await client.query(
        `UPDATE app.content_releases SET state='active',activated_at=$2
          WHERE id=$1 AND state='candidate' RETURNING id`,
        [input.releaseId, input.activatedAt],
      );
      if (!promoted.rows[0]) return { ok: false as const, error: "conflict" as const };
      return {
        ok: true as const,
        value: { disposition: "created" as const, releaseId: input.releaseId },
      };
    });
  }

  /* ---------------------------------------------------------------------------------------------
   * Approval chain
   * ------------------------------------------------------------------------------------------- */

  /**
   * Appends one approval decision. The chain is append-only and the relation carries the
   * immutability trigger, so a decision is never edited — a later decision supersedes it.
   *
   * Two independent gates apply, exactly as `Architecture/09-…` §4.2 and §5.2 separate them:
   * `canHoldApprovalLevel` decides whether the *class* may ever hold the level, and
   * `canTransitionContentApproval` decides whether this *arrow* is legal from the current head. A
   * first decision must start at `draft` or at something `draft` reaches.
   */
  public async appendApprovalDecision(
    input: ApprovalDecisionInput,
  ): Promise<
    Result<
      { readonly disposition: CommitDisposition; readonly priorLevel?: ContentApprovalLevel },
      ContentRepositoryError
    >
  > {
    if (!input.authorRef || !input.validatorRef || !input.approverRef) {
      return { ok: false, error: "not_available" };
    }
    if (!canHoldApprovalLevel(input.contentClass, input.level)) {
      return { ok: false, error: "approval_ineligible" };
    }
    return inTransaction(this.pool, async (client) => {
      await lockApprovalSubject(client, input.subjectId);
      // Every field the decision asserts takes part in the replay comparison. Comparing only the
      // level and the subject let a second command reuse a decision id while naming a different
      // reason, a different evidence reference or a different signing chain, and be told
      // `replayed` — the caller would believe its decision was recorded when the stored, different
      // decision still stood. The relation is append-only, so nothing was overwritten; the answer
      // was simply wrong. A conflicting reuse is now refused.
      const replay = await client.query(
        `SELECT level,outcome,subject_kind,subject_id,content_class,author_ref,validator_ref,
                approver_ref,method_version,reason_code,evidence_ref,decided_at
           FROM app.approval_decisions WHERE id=$1`,
        [input.decisionId],
      );
      const replayed = replay.rows[0];
      if (replayed) {
        const same =
          replayed.level === input.level &&
          replayed.outcome === input.outcome &&
          replayed.subject_kind === input.subjectKind &&
          String(replayed.subject_id) === input.subjectId &&
          replayed.content_class === input.contentClass &&
          replayed.author_ref === input.authorRef &&
          replayed.validator_ref === input.validatorRef &&
          replayed.approver_ref === input.approverRef &&
          replayed.method_version === input.methodVersion &&
          replayed.reason_code === input.reasonCode &&
          replayed.evidence_ref === input.evidenceRef &&
          new Date(String(replayed.decided_at)).getTime() === input.decidedAt.getTime();
        return same
          ? { ok: true as const, value: { disposition: "replayed" as const } }
          : { ok: false as const, error: "idempotency_conflict" as const };
      }
      const head = await client.query(
        `SELECT id,level FROM app.approval_decisions
          WHERE subject_kind=$1 AND subject_id=$2 AND outcome='granted'
          ORDER BY decided_at DESC, recorded_at DESC LIMIT 1`,
        [input.subjectKind, input.subjectId],
      );
      const priorLevel = head.rows[0]?.level as ContentApprovalLevel | undefined;
      const legal = priorLevel
        ? canTransitionContentApproval(priorLevel, input.level)
        : input.level === "draft" || canTransitionContentApproval("draft", input.level);
      if (input.outcome === "granted" && !legal) {
        return { ok: false as const, error: "illegal_transition" as const };
      }
      await client.query(
        `INSERT INTO app.approval_decisions(id,subject_kind,subject_id,content_class,level,outcome,
           author_ref,validator_ref,approver_ref,method_version,reason_registry_id,reason_code,
           evidence_ref,predecessor_id,decided_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          input.decisionId,
          input.subjectKind,
          input.subjectId,
          input.contentClass,
          input.level,
          input.outcome,
          input.authorRef,
          input.validatorRef,
          input.approverRef,
          input.methodVersion,
          reasonRegistryRelease.id,
          input.reasonCode,
          input.evidenceRef,
          head.rows[0]?.id ?? null,
          input.decidedAt,
        ],
      );
      if (input.subjectKind === "content_revision" && input.outcome === "granted") {
        await client.query(
          "UPDATE app.content_revisions SET current_approval_decision_id=$2,approval_state=$3,content_class=$4 WHERE id=$1",
          [
            input.subjectId,
            input.decisionId,
            approvalStateFor(input.level, input.outcome),
            input.contentClass,
          ],
        );
      }
      return {
        ok: true as const,
        value: {
          disposition: "created" as const,
          ...(priorLevel ? { priorLevel } : {}),
        },
      };
    });
  }

  /** Reads the full decision chain for one subject, oldest first. */
  public async readApprovalChain(
    subjectKind: ApprovalDecisionInput["subjectKind"],
    subjectId: string,
  ): Promise<
    readonly {
      readonly decisionId: string;
      readonly level: ContentApprovalLevel;
      readonly outcome: "granted" | "denied";
      readonly decidedAt: Date;
    }[]
  > {
    const result = await this.pool.query(
      `SELECT id,level,outcome,decided_at FROM app.approval_decisions
        WHERE subject_kind=$1 AND subject_id=$2 ORDER BY decided_at, recorded_at, id`,
      [subjectKind, subjectId],
    );
    return result.rows.map((row) => ({
      decisionId: String(row.id),
      level: row.level as ContentApprovalLevel,
      outcome: row.outcome as "granted" | "denied",
      decidedAt: new Date(String(row.decided_at)),
    }));
  }

  /* ---------------------------------------------------------------------------------------------
   * Serving-manifest issuance
   * ------------------------------------------------------------------------------------------- */

  /**
   * Issues a serving lease. `app.serving_manifests` is unique on `(learner_scope_id, operation_id)`,
   * so a reconnect that replays the same acquire operation returns the identical lease and never
   * issues a second one — which is what keeps a reconnect from recording a second exposure.
   *
   * The lease is issued **before** the attempt exists; the single authoritative link back is
   * `app.attempts.serving_manifest_id`, written by the attempt repository.
   */
  public async issueServingManifest(
    scope: AuthorizedScope,
    request: ServingManifestIssueRequest,
  ): Promise<
    Result<
      { readonly disposition: CommitDisposition; readonly manifest: ServingManifestRecord },
      ContentRepositoryError
    >
  > {
    if (request.entries.length === 0) return { ok: false, error: "not_available" };
    if (request.expiresAt.getTime() <= request.issuedAt.getTime()) {
      return { ok: false, error: "not_available" };
    }
    if (request.keyRevisionDigests.some((digest) => !/^[a-f0-9]{64}$/.test(digest))) {
      // Only a key **digest** ever crosses this boundary. Anything else is refused here rather
      // than stored and discovered later.
      return { ok: false, error: "not_available" };
    }
    return inTransaction(this.pool, async (client) => {
      if (!(await lockActiveLearnerScope(client, scope.learnerScopeId))) {
        return { ok: false as const, error: "not_available" as const };
      }
      const replay = await client.query(
        "SELECT id,digest FROM app.serving_manifests WHERE learner_scope_id=$1 AND operation_id=$2 FOR UPDATE",
        [scope.learnerScopeId, request.operationId],
      );
      if (replay.rows[0]) {
        if (replay.rows[0].digest !== request.digest) {
          return { ok: false as const, error: "idempotency_conflict" as const };
        }
        const manifest = await this.readManifest(
          client,
          scope.learnerScopeId,
          appId<"serving_manifest">(String(replay.rows[0].id)),
        );
        return manifest
          ? { ok: true as const, value: { disposition: "replayed" as const, manifest } }
          : { ok: false as const, error: "not_available" as const };
      }
      const defect = await this.assertServable(
        client,
        request.entries.map((entry) => entry.contentRevisionId),
        {
          contentClass: request.contentClass,
          approvalRole: request.approvalRole,
          contentReleaseIdentity: request.contentReleaseIdentity,
        },
      );
      if (defect) return { ok: false as const, error: defect };
      const listening = await client.query(
        `SELECT cr.id FROM app.content_revisions cr JOIN app.content_families cf ON cf.id=cr.family_id WHERE cr.id=ANY($1::uuid[]) AND cf.task_family_kind=ANY($2::text[]) ORDER BY cr.id`,
        [
          [...new Set(request.entries.map((entry) => entry.contentRevisionId))],
          [...listeningKinds],
        ],
      );
      if (listening.rows.length > 0) {
        if (!this.mediaCatalogue)
          return { ok: false as const, error: "content_unavailable" as const };
        const expectedPins: AudioManifestPin[] = [];
        try {
          for (const row of listening.rows) {
            const eligible = await this.mediaCatalogue.readEligible(
              client,
              String(row.id),
              request.approvalRole,
              new Date(),
            );
            // Lock mutable publication/rights projections through the actual lease write.
            await client.query(
              "SELECT cr.id FROM app.content_revisions cr JOIN app.rights_envelopes r ON r.id=cr.rights_envelope_id JOIN app.accessibility_manifests a ON a.id=cr.accessibility_manifest_id WHERE cr.id=$1 FOR SHARE OF cr,r,a",
              [row.id],
            );
            await client.query(
              "SELECT rel.id FROM app.content_releases rel JOIN app.content_release_entries e ON e.release_id=rel.id WHERE e.content_revision_id=$1 AND rel.state='active' FOR SHARE OF rel",
              [row.id],
            );
            const lockedDefect = await this.assertServable(
              client,
              [appId<"content_revision">(String(row.id))],
              request,
            );
            if (lockedDefect) return { ok: false as const, error: lockedDefect };
            const pins = audioPins(eligible);
            const mediaIds = pins.flatMap((pin) => pin.mediaRevisionIds).sort();
            const requestedMediaIds = request.entries
              .filter((entry) => entry.contentRevisionId === row.id)
              .flatMap((entry) => (entry.mediaRevisionId ? [entry.mediaRevisionId] : []))
              .sort();
            if (JSON.stringify(mediaIds) !== JSON.stringify(requestedMediaIds))
              return { ok: false as const, error: "content_unavailable" as const };
            expectedPins.push(...pins);
          }
        } catch (error) {
          if (error && typeof error === "object" && "code" in error) throw error;
          return { ok: false as const, error: "content_unavailable" as const };
        }
        const conditions = allowedConditionsSchema.safeParse(request.allowedConditions);
        if (
          !conditions.success ||
          !isDeepStrictEqual(
            conditions.data.audioManifestPins,
            expectedPins.sort((a, b) =>
              a.assetId < b.assetId ? -1 : a.assetId > b.assetId ? 1 : 0,
            ),
          )
        )
          return { ok: false as const, error: "content_unavailable" as const };
      }
      await client.query(
        `INSERT INTO app.serving_manifests(id,learner_scope_id,operation_id,form_id,content_class,
           approval_role,key_revision_digests,allowed_conditions,learner_safe_payload_digest,
           freshness_decision,compared_family_refs,authorization_version,content_release_identity,
           issued_at,expires_at,revocation_state,digest)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'active',$16)`,
        [
          request.servingManifestId,
          scope.learnerScopeId,
          request.operationId,
          request.formId ?? null,
          request.contentClass,
          request.approvalRole,
          JSON.stringify(request.keyRevisionDigests),
          JSON.stringify(request.allowedConditions),
          request.learnerSafePayloadDigest,
          request.freshnessDecision,
          JSON.stringify(request.comparedFamilyRefs),
          request.authorizationVersion,
          request.contentReleaseIdentity,
          request.issuedAt,
          request.expiresAt,
          request.digest,
        ],
      );
      for (const entry of request.entries) {
        await client.query(
          `INSERT INTO app.serving_manifest_entries(serving_manifest_id,learner_scope_id,ordinal,
             content_revision_id,content_item_id,media_revision_id)
           VALUES($1,$2,$3,$4,$5,$6)`,
          [
            request.servingManifestId,
            scope.learnerScopeId,
            entry.ordinal,
            entry.contentRevisionId,
            entry.contentItemId ?? null,
            entry.mediaRevisionId ?? null,
          ],
        );
      }
      const manifest = await this.readManifest(
        client,
        scope.learnerScopeId,
        request.servingManifestId,
      );
      return manifest
        ? { ok: true as const, value: { disposition: "created" as const, manifest } }
        : { ok: false as const, error: "not_available" as const };
    });
  }

  private async readManifest(
    client: PoolClient | Pool,
    learnerScopeId: LearnerScopeId,
    servingManifestId: ServingManifestId,
  ): Promise<ServingManifestRecord | undefined> {
    const head = await client.query(
      "SELECT * FROM app.serving_manifests WHERE learner_scope_id=$1 AND id=$2",
      [learnerScopeId, servingManifestId],
    );
    const row = head.rows[0];
    if (!row) return undefined;
    const entries = await client.query(
      `SELECT ordinal,content_revision_id,content_item_id,media_revision_id
         FROM app.serving_manifest_entries WHERE serving_manifest_id=$1 ORDER BY ordinal`,
      [servingManifestId],
    );
    return {
      servingManifestId,
      learnerScopeId,
      operationId: appId<"operation">(String(row.operation_id)),
      ...(row.form_id ? { formId: appId<"content_form">(String(row.form_id)) } : {}),
      contentClass: row.content_class as ContentClass,
      approvalRole: row.approval_role as ContentApprovalLevel,
      entries: entries.rows.map((entry) => ({
        ordinal: Number(entry.ordinal),
        contentRevisionId: appId<"content_revision">(String(entry.content_revision_id)),
        ...(entry.content_item_id
          ? { contentItemId: appId<"content_item">(String(entry.content_item_id)) }
          : {}),
        ...(entry.media_revision_id
          ? { mediaRevisionId: appId<"media_revision">(String(entry.media_revision_id)) }
          : {}),
      })),
      keyRevisionDigests: row.key_revision_digests as readonly string[],
      allowedConditions: row.allowed_conditions,
      learnerSafePayloadDigest: String(row.learner_safe_payload_digest),
      freshnessDecision: row.freshness_decision as FreshnessDecision,
      comparedFamilyRefs: Array.isArray(row.compared_family_refs)
        ? row.compared_family_refs.map((entry: unknown) => String(entry))
        : [],
      authorizationVersion: String(row.authorization_version),
      contentReleaseIdentity: String(row.content_release_identity),
      issuedAt: new Date(String(row.issued_at)),
      expiresAt: new Date(String(row.expires_at)),
      revocationState: row.revocation_state as ServingManifestRecord["revocationState"],
      digest: String(row.digest),
    };
  }

  /**
   * Resolves an already-issued lease. This deliberately does **not** re-run {@link assertServable}:
   * a withdrawal or quarantine after the pin stops *new* serving, and an attempt already holding
   * this lease must still resolve its exact pinned material. Changing that would rewrite history.
   */
  public async readServingManifest(
    scope: AuthorizedScope,
    servingManifestId: ServingManifestId,
  ): Promise<ServingManifestRecord | undefined> {
    return this.readManifest(this.pool, scope.learnerScopeId, servingManifestId);
  }

  public async readServingManifestByOperation(
    scope: AuthorizedScope,
    operationId: OperationId,
  ): Promise<ServingManifestRecord | undefined> {
    const result = await this.pool.query(
      "SELECT id FROM app.serving_manifests WHERE learner_scope_id=$1 AND operation_id=$2",
      [scope.learnerScopeId, operationId],
    );
    const id = result.rows[0]?.id;
    return id
      ? this.readManifest(this.pool, scope.learnerScopeId, appId<"serving_manifest">(String(id)))
      : undefined;
  }

  /**
   * Selects one eligible revision deterministically for a new lease. Prior exposure ranks after an
   * unseen family; identifiers break ties, so PostgreSQL row order never changes the assignment.
   * The query returns key digests only. Actual key material is read solely by
   * {@link readPinnedScoringUnits} after a shaped submit command.
   */
  public async findEligibleServingRevision(
    scope: AuthorizedScope,
    taskFamilyKind: string,
    progressionProfile: string,
  ): Promise<EligibleServingRevisionRecord | undefined> {
    return inTransaction(this.pool, async (client) => {
      const head = await client.query(
        `SELECT cr.id AS content_revision_id,cr.content_class,cr.instruction,cr.learner_payload,
              cr.progression_profile,cf.id AS content_family_id,cf.task_family_kind,
              ad.level AS approval_role,rel.release_identity,cei.exposure_class
         FROM app.content_revisions cr
         JOIN app.content_families cf ON cf.id=cr.family_id
         JOIN app.approval_decisions ad ON ad.id=cr.current_approval_decision_id
         JOIN app.rights_envelopes rights ON rights.id=cr.rights_envelope_id
         JOIN app.accessibility_manifests accessibility ON accessibility.id=cr.accessibility_manifest_id
         JOIN app.content_release_entries release_entry ON release_entry.content_revision_id=cr.id
         JOIN app.content_releases rel ON rel.id=release_entry.release_id
         LEFT JOIN app.content_exposure_index cei
           ON cei.learner_scope_id=$1 AND cei.content_family_id=cf.id
        WHERE cf.task_family_kind=$2 AND cr.progression_profile=$3
          AND rel.state='active' AND ad.outcome='granted'
          AND ad.level=ANY($4::text[]) AND rights.state='current'
          AND accessibility.gate_status='pass'
        ORDER BY (cei.content_family_id IS NOT NULL),cf.family_key,cr.id`,
        [scope.learnerScopeId, taskFamilyKind, progressionProfile, servableApprovalLevels],
      );
      for (const row of head.rows) {
        const contentRevisionId = appId<"content_revision">(String(row.content_revision_id));
        let pins: readonly AudioManifestPin[] | undefined;
        if (listeningKinds.has(String(row.task_family_kind))) {
          if (!this.mediaCatalogue) continue;
          await client.query("SAVEPOINT media_candidate");
          try {
            pins = audioPins(
              await this.mediaCatalogue.readEligible(
                client,
                contentRevisionId,
                String(row.approval_role),
                new Date(),
              ),
            );
          } catch (error) {
            if (error && typeof error === "object" && "code" in error) throw error;
            await client.query("ROLLBACK TO SAVEPOINT media_candidate");
            await client.query("RELEASE SAVEPOINT media_candidate");
            continue;
          }
          await client.query("RELEASE SAVEPOINT media_candidate");
        }
        const items = await client.query(
          "SELECT id FROM app.content_items WHERE content_revision_id=$1 ORDER BY ordinal,id",
          [contentRevisionId],
        );
        const writtenMedia = pins
          ? []
          : (
              await client.query(
                `SELECT DISTINCT mr.id FROM app.media_revisions mr JOIN app.media_assets ma ON ma.id=mr.asset_id WHERE ma.content_family_id=$1 AND ma.status='current' ORDER BY mr.id`,
                [String(row.content_family_id)],
              )
            ).rows.map((entry) => String(entry.id));
        const keys = await client.query(
          `SELECT k.digest
         FROM app.key_revisions k
         JOIN app.content_items i ON i.id=k.content_item_id
        WHERE i.content_revision_id=$1 ORDER BY i.ordinal,k.id`,
          [contentRevisionId],
        );
        return {
          contentFamilyId: appId<"content_family">(String(row.content_family_id)),
          taskFamilyKind: String(row.task_family_kind),
          contentRevisionId,
          contentClass: row.content_class as ContentClass,
          approvalRole: row.approval_role as ContentApprovalLevel,
          contentReleaseIdentity: String(row.release_identity),
          instruction: row.instruction,
          learnerPayload: row.learner_payload,
          progressionProfile: String(row.progression_profile),
          itemIds: items.rows.map((item) => appId<"content_item">(String(item.id))),
          mediaRevisionIds: (pins?.flatMap((pin) => pin.mediaRevisionIds) ?? writtenMedia).map(
            (id) => appId<"media_revision">(id),
          ),
          ...(pins ? { audioManifestPins: pins } : {}),
          keyRevisionDigests: keys.rows.map((entry) => String(entry.digest)),
          ...(row.exposure_class
            ? { priorExposureClass: row.exposure_class as ExposureClass }
            : {}),
        };
      }
      return undefined;
    });
  }

  /**
   * Loads the pinned learner payload without joining `app.key_revisions`. The manifest scope is in
   * the first predicate, so a guessed manifest id and a cross-scope id have the same answer.
   */
  public async readPinnedLearnerMaterial(
    scope: AuthorizedScope,
    servingManifestId: ServingManifestId,
  ): Promise<PinnedLearnerMaterialRecord | undefined> {
    const manifest = await this.readServingManifest(scope, servingManifestId);
    if (!manifest) return undefined;
    const revisions = await this.pool.query(
      `SELECT DISTINCT cr.id AS content_revision_id,cr.family_id,cr.instruction,cr.learner_payload,
              cr.progression_profile,cf.task_family_kind
         FROM app.serving_manifest_entries entry
         JOIN app.serving_manifests sm
           ON sm.id=entry.serving_manifest_id AND sm.learner_scope_id=entry.learner_scope_id
         JOIN app.content_revisions cr ON cr.id=entry.content_revision_id
         JOIN app.content_families cf ON cf.id=cr.family_id
        WHERE sm.learner_scope_id=$1 AND sm.id=$2
        ORDER BY cr.id`,
      [scope.learnerScopeId, servingManifestId],
    );
    if (revisions.rows.length !== 1) return undefined;
    const row = revisions.rows[0];
    return {
      manifest,
      contentFamilyId: appId<"content_family">(String(row.family_id)),
      taskFamilyKind: String(row.task_family_kind),
      contentRevisionId: appId<"content_revision">(String(row.content_revision_id)),
      instruction: row.instruction,
      learnerPayload: row.learner_payload,
      progressionProfile: String(row.progression_profile),
      itemIds: manifest.entries.flatMap((entry) =>
        entry.contentItemId ? [entry.contentItemId] : [],
      ),
    };
  }

  /**
   * Reads exact key revisions by the digests pinned on the manifest. No "latest key" query exists
   * here. Cardinality must match one key per pinned item or the caller receives no bundle.
   */
  public async readPinnedScoringUnits(
    scope: AuthorizedScope,
    servingManifestId: ServingManifestId,
  ): Promise<readonly PinnedScoringUnitRecord[] | undefined> {
    const result = await this.pool.query(
      `SELECT item.id AS content_item_id,item.content_revision_id,item.binding,item.scorable,
              key.id AS key_revision_id,key.accepted_response_set,
              key.response_cardinality_min,key.response_cardinality_max,key.scoring_policy_ref
         FROM app.serving_manifests sm
         JOIN app.serving_manifest_entries entry
           ON entry.learner_scope_id=sm.learner_scope_id AND entry.serving_manifest_id=sm.id
         JOIN app.content_items item ON item.id=entry.content_item_id
         JOIN app.key_revisions key
           ON key.content_item_id=item.id
          AND sm.key_revision_digests ? key.digest
        WHERE sm.learner_scope_id=$1 AND sm.id=$2
        ORDER BY entry.ordinal,item.id`,
      [scope.learnerScopeId, servingManifestId],
    );
    const expected = await this.pool.query(
      `SELECT count(*)::int AS total
         FROM app.serving_manifest_entries
        WHERE learner_scope_id=$1 AND serving_manifest_id=$2 AND content_item_id IS NOT NULL`,
      [scope.learnerScopeId, servingManifestId],
    );
    if (result.rows.length === 0 || result.rows.length !== Number(expected.rows[0]?.total)) {
      return undefined;
    }
    return result.rows.map((row) => ({
      contentItemId: appId<"content_item">(String(row.content_item_id)),
      contentRevisionId: appId<"content_revision">(String(row.content_revision_id)),
      binding: row.binding,
      scorable: row.scorable,
      keyRevisionId: appId<"key_revision">(String(row.key_revision_id)),
      acceptedResponseSet: row.accepted_response_set,
      responseCardinality: {
        min: Number(row.response_cardinality_min),
        max: Number(row.response_cardinality_max),
      },
      scoringPolicyRef: String(row.scoring_policy_ref),
    }));
  }

  /** Current interpretation of already-pinned content. It never changes the immutable outcome. */
  public async readPinnedContentStatus(
    scope: AuthorizedScope,
    servingManifestId: ServingManifestId,
  ): Promise<
    "published" | "quarantined_after_pin" | "withdrawn_after_pin" | "under_review" | undefined
  > {
    const result = await this.pool.query(
      `SELECT cr.approval_state,rights.state AS rights_state
         FROM app.serving_manifests sm
         JOIN app.serving_manifest_entries entry
           ON entry.learner_scope_id=sm.learner_scope_id AND entry.serving_manifest_id=sm.id
         JOIN app.content_revisions cr ON cr.id=entry.content_revision_id
         JOIN app.rights_envelopes rights ON rights.id=cr.rights_envelope_id
        WHERE sm.learner_scope_id=$1 AND sm.id=$2`,
      [scope.learnerScopeId, servingManifestId],
    );
    if (result.rows.length === 0) return undefined;
    if (result.rows.some((row) => row.rights_state !== "current")) return "withdrawn_after_pin";
    if (result.rows.some((row) => row.approval_state === "quarantined")) {
      return "quarantined_after_pin";
    }
    if (result.rows.some((row) => row.approval_state !== "approved")) return "under_review";
    return "published";
  }

  /**
   * Stops a lease from serving. It writes `revocation_state` and nothing else — no validity
   * assertion, no outcome, no approval row. A rights-only withdrawal must not touch validity
   * (`Architecture/06-…:394`), and the signature makes it impossible to ask this method to.
   */
  public async revokeServingManifest(
    scope: AuthorizedScope,
    servingManifestId: ServingManifestId,
    revocationState: "revoked_before_start" | "revoked_after_pin",
  ): Promise<Result<{ readonly disposition: CommitDisposition }, ContentRepositoryError>> {
    return inTransaction(this.pool, async (client) => {
      const current = await client.query(
        "SELECT revocation_state FROM app.serving_manifests WHERE learner_scope_id=$1 AND id=$2 FOR UPDATE",
        [scope.learnerScopeId, servingManifestId],
      );
      const row = current.rows[0];
      if (!row) return { ok: false as const, error: "not_available" as const };
      if (row.revocation_state === revocationState) {
        return { ok: true as const, value: { disposition: "replayed" as const } };
      }
      if (row.revocation_state !== "active") {
        return { ok: false as const, error: "conflict" as const };
      }
      await client.query(
        "UPDATE app.serving_manifests SET revocation_state=$3 WHERE learner_scope_id=$1 AND id=$2",
        [scope.learnerScopeId, servingManifestId, revocationState],
      );
      return { ok: true as const, value: { disposition: "created" as const } };
    });
  }

  /* ---------------------------------------------------------------------------------------------
   * Exposure index
   * ------------------------------------------------------------------------------------------- */

  /**
   * Records one family exposure. The operation receipt is claimed in the same transaction as the
   * index update, so a duplicate tap, a DOM remount, an outbox replay and a reconnect all return
   * the committed result and increment `occurrence_count` exactly once.
   *
   * The stored class is monotonic: an `answer_exposed` family is never downgraded to
   * `exposed_family` by a later, weaker trigger. Forgetting an exposure is what would let an
   * already-seen item be served as fresh evidence.
   */
  public async recordExposure(
    scope: AuthorizedScope,
    input: ExposureRecordInput,
  ): Promise<
    Result<
      { readonly disposition: CommitDisposition; readonly exposureClass: ExposureClass },
      ContentRepositoryError
    >
  > {
    return inTransaction(this.pool, async (client) => {
      if (!(await lockActiveLearnerScope(client, scope.learnerScopeId))) {
        return { ok: false as const, error: "not_available" as const };
      }
      const claimed = await client.query(
        `INSERT INTO app.operation_receipts(learner_scope_id,operation_id,kind,canonicalization_version,
           payload_digest,status,resource_ref,expiry_class)
         VALUES($1,$2,'attempt.exposure','canonical-json/v1',$3,'completed',$4,'semantic')
         ON CONFLICT DO NOTHING RETURNING operation_id`,
        [scope.learnerScopeId, input.operationId, input.payloadDigest, input.contentFamilyId],
      );
      if (!claimed.rows[0]) {
        // `resource_ref` is compared as well as the digest. The receipt records which family it
        // claimed; without that comparison a replay naming a different family read back THAT
        // family's stored class and reported it as the committed result of this operation.
        const existing = await client.query(
          `SELECT payload_digest,resource_ref FROM app.operation_receipts
            WHERE learner_scope_id=$1 AND operation_id=$2 AND kind='attempt.exposure' FOR UPDATE`,
          [scope.learnerScopeId, input.operationId],
        );
        const receipt = existing.rows[0];
        if (
          !receipt ||
          receipt.payload_digest !== input.payloadDigest ||
          String(receipt.resource_ref) !== input.contentFamilyId
        ) {
          return { ok: false as const, error: "idempotency_conflict" as const };
        }
        const stored = await client.query(
          "SELECT exposure_class FROM app.content_exposure_index WHERE learner_scope_id=$1 AND content_family_id=$2",
          [scope.learnerScopeId, input.contentFamilyId],
        );
        const exposureClass = stored.rows[0]?.exposure_class as ExposureClass | undefined;
        return exposureClass
          ? {
              ok: true as const,
              value: { disposition: "replayed" as const, exposureClass },
            }
          : { ok: false as const, error: "conflict" as const };
      }
      const merged = await client.query(
        `INSERT INTO app.content_exposure_index(learner_scope_id,content_family_id,exposure_class,
           last_trigger,last_content_revision_id,occurrence_count,first_exposed_at,last_exposed_at)
         VALUES($1,$2,$3,$4,$5,1,$6,$6)
         ON CONFLICT(learner_scope_id,content_family_id) DO UPDATE SET
           exposure_class = CASE
             WHEN array_position($7::text[], EXCLUDED.exposure_class)
                > array_position($7::text[], app.content_exposure_index.exposure_class)
             THEN EXCLUDED.exposure_class ELSE app.content_exposure_index.exposure_class END,
           last_trigger = EXCLUDED.last_trigger,
           last_content_revision_id = COALESCE(EXCLUDED.last_content_revision_id,
             app.content_exposure_index.last_content_revision_id),
           occurrence_count = app.content_exposure_index.occurrence_count + 1,
           last_exposed_at = GREATEST(app.content_exposure_index.last_exposed_at, EXCLUDED.last_exposed_at)
         RETURNING exposure_class`,
        [
          scope.learnerScopeId,
          input.contentFamilyId,
          input.exposureClass,
          input.trigger,
          input.contentRevisionId ?? null,
          input.occurredAt,
          [...exposureClasses],
        ],
      );
      return {
        ok: true as const,
        value: {
          disposition: "created" as const,
          exposureClass: merged.rows[0]?.exposure_class as ExposureClass,
        },
      };
    });
  }

  /** Reads the exposure index for the named families. Missing families are simply absent. */
  public async readExposureIndex(
    scope: AuthorizedScope,
    contentFamilyIds: readonly ContentFamilyId[],
  ): Promise<readonly ExposureIndexRow[]> {
    if (contentFamilyIds.length === 0) return [];
    const result = await this.pool.query(
      `SELECT content_family_id,exposure_class,last_trigger,occurrence_count,first_exposed_at,last_exposed_at
         FROM app.content_exposure_index
        WHERE learner_scope_id=$1 AND content_family_id = ANY($2::uuid[])
        ORDER BY content_family_id`,
      [scope.learnerScopeId, [...contentFamilyIds]],
    );
    return result.rows.map((row) => ({
      contentFamilyId: appId<"content_family">(String(row.content_family_id)),
      exposureClass: row.exposure_class as ExposureClass,
      lastTrigger: row.last_trigger as ExposureTriggerValue,
      occurrenceCount: Number(row.occurrence_count),
      firstExposedAt: new Date(String(row.first_exposed_at)),
      lastExposedAt: new Date(String(row.last_exposed_at)),
    }));
  }

  /* ---------------------------------------------------------------------------------------------
   * Impact
   * ------------------------------------------------------------------------------------------- */

  /**
   * Appends an impact assertion. The relation is append-only and carries the immutability trigger,
   * so the only idempotency question is whether an existing row with this id says the same thing.
   *
   * A `serving_only` impact may never carry a requested validity — that is the rights-withdrawal
   * rule, and it is checked here as well as by the relation's own CHECK.
   */
  public async appendImpactAssertion(
    input: ImpactAssertionInput,
  ): Promise<Result<{ readonly disposition: CommitDisposition }, ContentRepositoryError>> {
    if (input.impactMode === "serving_only" && input.requestedValidity !== undefined) {
      return { ok: false, error: "conflict" };
    }
    if (input.learnerScopeBound.length === 0) return { ok: false, error: "not_available" };
    return inTransaction(this.pool, async (client) => {
      const existing = await client.query(
        "SELECT digest FROM app.content_impact_assertions WHERE id=$1",
        [input.impactAssertionId],
      );
      if (existing.rows[0]) {
        return existing.rows[0].digest === input.digest
          ? { ok: true as const, value: { disposition: "replayed" as const } }
          : { ok: false as const, error: "idempotency_conflict" as const };
      }
      await client.query(
        `INSERT INTO app.content_impact_assertions(id,incident_id,owner_context,actor_ref,
           authorization_version,cause_kind,impact_mode,requested_validity,selectors,
           declared_cardinality,affected_scope,unaffected_scope,reason_registry_id,reason_code,
           evidence_refs,policy_and_contract_versions,unknown_scope_superset,
           reviewed_policy_override_ref,effective_at,digest)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [
          input.impactAssertionId,
          input.incidentId,
          input.ownerContext,
          input.actorRef,
          input.authorizationVersion,
          input.causeKind,
          input.impactMode,
          input.requestedValidity ?? null,
          JSON.stringify({
            ...input.selectors,
            learnerScopeBound: [...input.learnerScopeBound],
          }),
          input.declaredCardinality,
          JSON.stringify(input.affectedScope),
          JSON.stringify(input.unaffectedScope),
          reasonRegistryRelease.id,
          input.reasonCode,
          JSON.stringify(input.evidenceRefs),
          JSON.stringify(input.policyAndContractVersions),
          input.unknownScopeSuperset ? JSON.stringify(input.unknownScopeSuperset) : null,
          input.reviewedPolicyOverrideRef ?? null,
          input.effectiveAt,
          input.digest,
        ],
      );
      return { ok: true as const, value: { disposition: "created" as const } };
    });
  }

  /**
   * Resolves selectors to observation identities, bounded by the named learner scopes.
   *
   * Resolution reaches an observation two ways, and both are needed: through the pinned serving
   * manifest (`app.attempts.serving_manifest_id` is the single authoritative link — the manifest
   * carries no `attempt_id`, because the lease is issued before the attempt exists), and through
   * the Stage 03 `app.attempts.content_revision_id` for evidence recorded before Stage 05.
   *
   * The count is returned as-is. Holding it to the declared cardinality is `resolveSelectors` in
   * `@bestehen/content`, and a mismatch is a fault that stops the job — never an adjustment made
   * here.
   */
  public async resolveImpactTargets(
    selectors: ImpactSelectorInput,
    learnerScopeBound: readonly LearnerScopeId[],
  ): Promise<readonly ImpactTargetRow[]> {
    if (learnerScopeBound.length === 0) return [];
    const result = await this.pool.query(
      `SELECT DISTINCT o.learner_scope_id, o.id AS observation_id
         FROM app.evidence_observations o
         JOIN app.attempts a ON a.learner_scope_id = o.learner_scope_id AND a.id = o.attempt_id
         LEFT JOIN app.serving_manifest_entries sme
                ON sme.learner_scope_id = a.learner_scope_id
               AND sme.serving_manifest_id = a.serving_manifest_id
         LEFT JOIN app.serving_manifests sm
                ON sm.learner_scope_id = a.learner_scope_id AND sm.id = a.serving_manifest_id
         LEFT JOIN app.content_revisions pinned ON pinned.id = sme.content_revision_id
         LEFT JOIN app.content_revisions legacy ON legacy.id = a.content_revision_id
        WHERE o.learner_scope_id = ANY($1::uuid[])
          AND (
            o.id = ANY($2::uuid[])
            OR sme.content_revision_id = ANY($3::uuid[])
            OR a.content_revision_id = ANY($3::uuid[])
            OR pinned.family_id = ANY($4::uuid[])
            OR legacy.family_id = ANY($4::uuid[])
            OR sme.content_item_id = ANY($5::uuid[])
            OR sm.form_id = ANY($6::uuid[])
            OR sme.media_revision_id = ANY($7::uuid[])
          )
        ORDER BY o.learner_scope_id, o.id`,
      [
        [...learnerScopeBound],
        [...(selectors.observationIds ?? [])],
        [...(selectors.contentRevisionIds ?? [])],
        [...(selectors.contentFamilyIds ?? [])],
        [...(selectors.contentItemIds ?? [])],
        [...(selectors.contentFormIds ?? [])],
        [...(selectors.mediaRevisionIds ?? [])],
      ],
    );
    return result.rows.map((row) => ({
      learnerScopeId: appId<"learner_scope">(String(row.learner_scope_id)),
      observationId: appId<"evidence_observation">(String(row.observation_id)),
    }));
  }

  /**
   * Records which observations one impact reached. Append-only and idempotent on its primary key.
   *
   * A `serving_only` impact may not name a validity assertion: the mode is read back from the
   * stored assertion rather than trusted from the caller, so a rights withdrawal cannot smuggle a
   * validity change in through this method.
   *
   * `recorded` counts the rows this call inserted and `total` the rows the assertion now holds. A
   * retried job sees `recorded: 0, total: n` — the same committed set, reached without a second
   * effect. Returning only `recorded` made a replay indistinguishable from a resolution that
   * reached nothing, which is precisely the cardinality fault the retry must NOT raise.
   */
  public async recordImpactTargets(
    impactAssertionId: string,
    targets: readonly ImpactTargetInput[],
  ): Promise<
    Result<{ readonly recorded: number; readonly total: number }, ContentRepositoryError>
  > {
    return inTransaction(this.pool, async (client) => {
      const assertion = await client.query(
        "SELECT impact_mode FROM app.content_impact_assertions WHERE id=$1",
        [impactAssertionId],
      );
      const mode = assertion.rows[0]?.impact_mode as ImpactMode | undefined;
      if (!mode) return { ok: false as const, error: "not_available" as const };
      if (mode === "serving_only" && targets.some((target) => target.assertionId !== undefined)) {
        return { ok: false as const, error: "conflict" as const };
      }
      let recorded = 0;
      for (const target of targets) {
        const inserted = await client.query(
          `INSERT INTO app.content_impact_targets(impact_assertion_id,learner_scope_id,observation_id,
             assertion_id,disposition)
           VALUES($1,$2,$3,$4,$5)
           ON CONFLICT(impact_assertion_id,learner_scope_id,observation_id) DO NOTHING
           RETURNING observation_id`,
          [
            impactAssertionId,
            target.learnerScopeId,
            target.observationId,
            target.assertionId ?? null,
            target.disposition,
          ],
        );
        if (inserted.rows[0]) recorded += 1;
      }
      const counted = await client.query(
        "SELECT count(*)::int AS total FROM app.content_impact_targets WHERE impact_assertion_id=$1",
        [impactAssertionId],
      );
      return {
        ok: true as const,
        value: { recorded, total: Number(counted.rows[0]?.total ?? 0) },
      };
    });
  }

  /* ---------------------------------------------------------------------------------------------
   * Defect reports
   * ------------------------------------------------------------------------------------------- */

  /**
   * Records a scoped content report. Idempotent on `(learner_scope_id, operation_id)`; a replay
   * that names different content is a conflict rather than an overwrite.
   */
  public async appendDefectReport(
    scope: AuthorizedScope,
    input: DefectReportInput,
  ): Promise<
    Result<
      { readonly disposition: CommitDisposition; readonly defectReportId: string },
      ContentRepositoryError
    >
  > {
    if (input.note !== undefined && input.note.length > 400) {
      return { ok: false, error: "not_available" };
    }
    return inTransaction(this.pool, async (client) => {
      if (!(await lockActiveLearnerScope(client, scope.learnerScopeId))) {
        return { ok: false as const, error: "not_available" as const };
      }
      const existing = await client.query(
        `SELECT id,content_revision_id,content_item_id,category,note FROM app.content_defect_reports
          WHERE learner_scope_id=$1 AND operation_id=$2 FOR UPDATE`,
        [scope.learnerScopeId, input.operationId],
      );
      const row = existing.rows[0];
      if (row) {
        const same =
          String(row.content_revision_id) === input.contentRevisionId &&
          (row.content_item_id ?? undefined) === (input.contentItemId ?? undefined) &&
          row.category === input.category &&
          (row.note ?? undefined) === (input.note ?? undefined);
        return same
          ? {
              ok: true as const,
              value: { disposition: "replayed" as const, defectReportId: String(row.id) },
            }
          : { ok: false as const, error: "idempotency_conflict" as const };
      }
      const revision = await client.query("SELECT 1 FROM app.content_revisions WHERE id=$1", [
        input.contentRevisionId,
      ]);
      if (!revision.rows[0]) return { ok: false as const, error: "not_available" as const };
      await client.query(
        `INSERT INTO app.content_defect_reports(id,learner_scope_id,operation_id,content_revision_id,
           content_item_id,attempt_id,category,note,state,reported_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,'open',$9)`,
        [
          input.defectReportId,
          scope.learnerScopeId,
          input.operationId,
          input.contentRevisionId,
          input.contentItemId ?? null,
          input.attemptId ?? null,
          input.category,
          input.note ?? null,
          input.reportedAt,
        ],
      );
      return {
        ok: true as const,
        value: { disposition: "created" as const, defectReportId: input.defectReportId },
      };
    });
  }

  /* ---------------------------------------------------------------------------------------------
   * Content jobs
   * ------------------------------------------------------------------------------------------- */

  /**
   * Accepts one of the two content jobs. It mirrors `PostgresFoundationRepository.accept` but
   * records the content owner and the queue's own policy revision, so a content job is not audited
   * as a foundation job. Idempotent on `(learner_scope_id, kind, semantic_identity)`.
   */
  public async acceptContentJob(
    input: ContentJobInput,
  ): Promise<
    Result<
      { readonly disposition: CommitDisposition; readonly jobId: JobId },
      ContentRepositoryError
    >
  > {
    return inTransaction(this.pool, async (client) => {
      if (!(await lockActiveLearnerScope(client, input.learnerScopeId))) {
        return { ok: false as const, error: "not_available" as const };
      }
      const inserted = await client.query(
        `INSERT INTO app.job_resources(id,kind,semantic_identity,state,revision,owner,actor_scope,
           learner_scope_id,payload_digest,contract_major,release,deadline,attempt,maximum_attempts,
           dependent_scope,unaffected_scope)
         VALUES($1,$2,$3,'accepted',1,'content','worker',$4,$5,1,$6,$7,0,$8,'[]','[]')
         ON CONFLICT(learner_scope_id,kind,semantic_identity) DO NOTHING RETURNING id`,
        [
          input.jobId,
          input.kind,
          input.semanticIdentity,
          input.learnerScopeId,
          input.payloadDigest,
          jobPolicyFor(input.kind).revision,
          input.deadline,
          input.maximumAttempts,
        ],
      );
      if (inserted.rows[0]) {
        return {
          ok: true as const,
          value: { disposition: "created" as const, jobId: input.jobId },
        };
      }
      const existing = await client.query(
        `SELECT id,payload_digest FROM app.job_resources
          WHERE learner_scope_id=$1 AND kind=$2 AND semantic_identity=$3 FOR UPDATE`,
        [input.learnerScopeId, input.kind, input.semanticIdentity],
      );
      if (existing.rows[0]?.payload_digest !== input.payloadDigest) {
        return { ok: false as const, error: "idempotency_conflict" as const };
      }
      return {
        ok: true as const,
        value: {
          disposition: "replayed" as const,
          jobId: appId<"job">(String(existing.rows[0].id)),
        },
      };
    });
  }
}
