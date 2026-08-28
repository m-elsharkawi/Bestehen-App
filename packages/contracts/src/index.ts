import {
  assistanceKinds,
  assistancePhases,
  attemptRuntimeStates,
  contentApprovalLevels,
  contentClasses,
  evidenceValidityStates,
  exposureClasses,
  freshnessDecisions,
  impactCauseKinds,
  impactModes,
  independenceClasses,
  objectiveUnitOutcomeKinds,
  projectionAvailabilityStates,
  readinessStates,
  semanticJobStates,
  sessionStates,
  timerIntegrityStates,
} from "@bestehen/domain";
import { z } from "zod";

export * from "./ui-projections.js";

export const contractVersionSchema = z
  .object({
    major: z.number().int().positive(),
    minor: z.number().int().nonnegative(),
  })
  .strict();

export const healthPayloadSchema = z
  .object({
    version: z.literal(1),
    status: z.enum(["live", "ready", "not_ready", "stopping"]),
    service: z.enum(["web", "worker"]),
    releaseCommit: z.string().min(1).max(64),
  })
  .strict();

export type HealthPayload = z.infer<typeof healthPayloadSchema>;

export interface ProviderPortMarker {
  readonly providerNeutral: true;
  readonly capability: "identity" | "object_storage" | "email" | "ai" | "stt" | "tts";
}

export const apiContractVersion = { major: 1, minor: 0 } as const;
export const opaqueAppIdSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9_-]{7,127}$/i)
  .describe("App-owned opaque identifier");
export const operationIdSchema = opaqueAppIdSchema;

export const domainResultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("completed"), resourceId: opaqueAppIdSchema.optional() }).strict(),
  z.object({ status: z.literal("accepted_pending"), jobId: opaqueAppIdSchema }).strict(),
  z.object({ status: z.literal("partial"), reasonCode: z.string().min(3) }).strict(),
  z.object({ status: z.literal("conflict"), reasonCode: z.string().min(3) }).strict(),
  z.object({ status: z.literal("unavailable"), reasonCode: z.string().min(3) }).strict(),
  z.object({ status: z.literal("deleted"), reasonCode: z.string().min(3) }).strict(),
]);

export const problemSchema = z
  .object({
    type: z.string().url(),
    title: z.string().min(1).max(120),
    status: z.number().int().min(400).max(599),
    code: z.enum([
      "malformed_request",
      "authentication_required",
      "authorization_denied",
      "precondition_failed",
      "idempotency_conflict",
      "rate_limited",
      "dependency_unavailable",
      "unsupported_contract_major",
      "internal_protocol_error",
    ]),
    requestId: opaqueAppIdSchema,
    detail: z.string().max(240).optional(),
    fieldPointers: z.array(z.string().startsWith("/")).max(20).optional(),
  })
  .strict();

export const commandEnvelopeSchema = z
  .object({
    contract: z.object({ major: z.literal(1), minor: z.number().int().min(0).max(99) }).strict(),
    operationId: operationIdSchema,
    expectedVersion: z.number().int().nonnegative(),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

export const jobEnvelopeSchema = z
  .object({
    contract: z
      .object({ kind: z.literal("foundation"), major: z.literal(1), minor: z.literal(0) })
      .strict(),
    jobId: opaqueAppIdSchema,
    kind: z.enum([
      "projection_rebuild_v1",
      "outbox_dispatch_v1",
      "rights_reconcile_v1",
      "content_publication_v1",
      "content_impact_recompute_v1",
    ]),
    semanticIdentity: z.string().min(8).max(256),
    learnerScopeId: opaqueAppIdSchema,
    owner: z.enum(["evidence", "operations", "profile", "content"]),
    attempt: z.number().int().min(0),
    deadline: z.iso.datetime(),
    payloadDigest: z.string().regex(/^[a-f0-9]{64}$/),
    selector: z.record(z.string(), z.string().max(256)).default({}),
  })
  .strict();

export const jobResourceSchema = z
  .object({
    jobId: opaqueAppIdSchema,
    state: z.enum(semanticJobStates),
    revision: z.number().int().positive(),
    reasonCode: z.string().min(3).optional(),
    retryAt: z.iso.datetime().optional(),
  })
  .strict();

export const sessionProjectionSchema = z
  .object({
    sessionId: opaqueAppIdSchema,
    state: z.enum(sessionStates),
    idleExpiresAt: z.iso.datetime(),
    absoluteExpiresAt: z.iso.datetime(),
    recentAuth: z.boolean(),
  })
  .strict();

const scopePartitionSchema = z
  .object({
    affected: z.array(z.string().min(1)).max(100),
    unaffected: z.array(z.string().min(1)).max(100),
  })
  .strict();

export const validityAssertionSchema = z
  .object({
    assertionId: opaqueAppIdSchema,
    observationId: opaqueAppIdSchema,
    priorAssertionId: opaqueAppIdSchema.optional(),
    state: z.enum(evidenceValidityStates),
    scope: scopePartitionSchema,
    reasonCode: z.string().regex(/^[A-Z]+\.[A-Z0-9_]+$/),
    effectiveAt: z.iso.datetime(),
    recordedAt: z.iso.datetime(),
    release: z.literal("evidence-contract/v1"),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      (value.state === "partially_valid" || value.state === "pending") &&
      (value.scope.affected.length === 0 || value.scope.unaffected.length === 0)
    ) {
      context.addIssue({ code: "custom", path: ["scope"], message: "partition is required" });
    }
    const affected = new Set(value.scope.affected);
    if (value.scope.unaffected.some((entry) => affected.has(entry))) {
      context.addIssue({ code: "custom", path: ["scope"], message: "partition overlaps" });
    }
  });

export const projectionSchema = z
  .object({
    generationId: opaqueAppIdSchema,
    kind: z.enum(["capability", "weakness", "progression", "readiness"]),
    availability: z.enum(projectionAvailabilityStates),
    sourceCut: z.number().int().nonnegative(),
    computedAt: z.iso.datetime(),
    checksum: z.string().regex(/^[a-f0-9]{64}$/),
    readiness: z.enum(readinessStates).optional(),
    written: z
      .union([
        z.object({ status: z.literal("absent") }).strict(),
        z.object({ status: z.literal("value"), band: z.string() }).strict(),
      ])
      .optional(),
    oral: z
      .union([
        z.object({ status: z.literal("absent") }).strict(),
        z.object({ status: z.literal("value"), band: z.string() }).strict(),
      ])
      .optional(),
  })
  .strict();

export const scopedCursorSchema = z
  .object({
    scopeDigest: z.string().regex(/^[a-f0-9]{64}$/),
    recordedAt: z.iso.datetime(),
    opaqueId: opaqueAppIdSchema,
    snapshotCut: z.number().int().nonnegative(),
    limit: z.number().int().min(1).max(100),
  })
  .strict();

/* ------------------------------------------------------------------------------------------------
 * Stage 05 — content serving and the deterministic objective attempt runtime.
 * Additive on contract major 1: every schema below is new, and no existing schema was narrowed.
 * ---------------------------------------------------------------------------------------------- */

export const reasonCodeSchema = z.string().regex(/^[A-Z]+\.[A-Z0-9_]+$/);
export const digestSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const progressionProfileSchema = z.enum(["P0", "P1", "P2", "P3", "P4"]);
const scopeListSchema = z.array(z.string().min(1).max(120)).max(100);

/** Learner-facing conditions the server permits for this pinned manifest. */
export const allowedConditionsSchema = z
  .object({
    progressionProfile: progressionProfileSchema,
    timingMode: z.enum(["open", "practice", "exam"]),
    targetDurationMs: z
      .number()
      .int()
      .positive()
      .max(24 * 60 * 60 * 1000)
      .optional(),
    allowedPlays: z.number().int().min(0).max(8).optional(),
    transcriptPhase: z.enum(["never", "after_attempt", "after_block"]),
    offerableAssistanceKinds: z.array(z.enum(assistanceKinds)).max(assistanceKinds.length),
  })
  .strict();

/**
 * Server-issued serving lease. It carries key **digests** only; no key, correct flag, distractor
 * rationale, scoring weight or operator note may cross this boundary, and `.strict()` rejects any
 * undocumented carrier that tries.
 */
export const servingManifestSchema = z
  .object({
    servingManifestId: opaqueAppIdSchema,
    attemptId: opaqueAppIdSchema,
    formId: opaqueAppIdSchema.optional(),
    contentRevisionIds: z.array(opaqueAppIdSchema).min(1).max(64),
    itemIds: z.array(opaqueAppIdSchema).min(1).max(200),
    mediaRevisionIds: z.array(opaqueAppIdSchema).max(64),
    keyRevisionDigests: z.array(digestSchema).max(64),
    contentClass: z.enum(contentClasses),
    approvalRole: z.enum(contentApprovalLevels),
    allowedConditions: allowedConditionsSchema,
    learnerSafePayloadDigest: digestSchema,
    freshnessDecision: z.enum(freshnessDecisions),
    comparedFamilyRefs: z.array(opaqueAppIdSchema).max(64),
    authorizationVersion: z.string().min(1).max(64),
    contentReleaseIdentity: z.string().min(1).max(64),
    issuedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
    revocationState: z.enum(["active", "revoked_before_start", "revoked_after_pin"]),
  })
  .strict();

/**
 * The closed canonical response operation union (`Architecture/15-…` §5.3). Every input path —
 * pointer, drag, keyboard select-then-place, number key, assistive activation — produces exactly one
 * of these. DOM order and option order are presentation facts and never appear here.
 */
export const responseOperationSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("set_selection"),
      itemId: opaqueAppIdSchema,
      optionId: z.string().min(1).max(64),
    })
    .strict(),
  z.object({ kind: z.literal("clear_selection"), itemId: opaqueAppIdSchema }).strict(),
  z
    .object({
      kind: z.literal("set_match"),
      itemId: opaqueAppIdSchema,
      leftId: z.string().min(1).max(64),
      rightId: z.string().min(1).max(64),
    })
    .strict(),
  z
    .object({
      kind: z.literal("clear_match"),
      itemId: opaqueAppIdSchema,
      leftId: z.string().min(1).max(64),
    })
    .strict(),
  z
    .object({
      kind: z.literal("place_candidate"),
      itemId: opaqueAppIdSchema,
      gapId: z.string().min(1).max(64),
      candidateId: z.string().min(1).max(64),
    })
    .strict(),
  z
    .object({
      kind: z.literal("remove_candidate"),
      itemId: opaqueAppIdSchema,
      gapId: z.string().min(1).max(64),
    })
    .strict(),
  z
    .object({
      kind: z.literal("move_candidate"),
      itemId: opaqueAppIdSchema,
      fromGapId: z.string().min(1).max(64),
      toGapId: z.string().min(1).max(64),
    })
    .strict(),
  z.object({ kind: z.literal("confirm_boundary"), boundaryId: z.string().min(1).max(64) }).strict(),
]);

export const attemptResourceSchema = z
  .object({
    attemptId: opaqueAppIdSchema,
    servingManifestId: opaqueAppIdSchema,
    state: z.enum(attemptRuntimeStates),
    revision: z.number().int().positive(),
    acknowledgedCheckpointSequence: z.number().int().nonnegative(),
    startedAt: z.iso.datetime().optional(),
    expiresAt: z.iso.datetime(),
    reasonCode: reasonCodeSchema.optional(),
  })
  .strict();

/** A checkpoint is recoverable working state, never evidence. */
export const checkpointCommandSchema = z
  .object({
    attemptId: opaqueAppIdSchema,
    stream: z.string().min(1).max(64),
    sequence: z.number().int().nonnegative(),
    operations: z.array(responseOperationSchema).min(1).max(200),
    responseDigest: digestSchema,
    observedAt: z.iso.datetime(),
  })
  .strict();

/** Actual recorded assistance/timing/playback/exposure conditions for one attempt. */
export const attemptConditionsSchema = z
  .object({
    progressionProfile: progressionProfileSchema,
    timingMode: z.enum(["open", "practice", "exam"]),
    timerIntegrity: z.enum(timerIntegrityStates),
    elapsedMs: z.number().int().nonnegative(),
    exposureClass: z.enum(exposureClasses),
    independenceClass: z.enum(independenceClasses),
    assistanceUsed: z
      .array(
        z
          .object({
            kind: z.enum(assistanceKinds),
            phase: z.enum(assistancePhases),
            answerBearing: z.enum(["yes", "no", "uncertain"]),
            affectedScope: scopeListSchema,
          })
          .strict(),
      )
      .max(50),
    accessibilityEquivalence: z.enum(["equivalent", "claim_narrowing", "unknown"]),
    playbackActual: z
      .object({
        plays: z.number().int().nonnegative().max(32),
        completedPlays: z.number().int().nonnegative().max(32),
        speedActual: z.number().positive().max(4),
      })
      .strict()
      .optional(),
  })
  .strict();

export const submitObjectiveCommandSchema = z
  .object({
    attemptId: opaqueAppIdSchema,
    checkpointSequence: z.number().int().nonnegative(),
    responseDigest: digestSchema,
    conditions: attemptConditionsSchema,
  })
  .strict();

/**
 * `GetObjectiveResult` in the order `Architecture/15-…` §5.4/§7.3 requires: current validity first,
 * then the immutable original outcome, then decisive evidence, then why the chosen distractor fails,
 * then the supported cause or one smallest clarifier, then the smallest repair. No score, zero,
 * weakness or probability field exists anywhere in this shape.
 */
export const objectiveResultSchema = z
  .object({
    validity: z
      .object({
        state: z.enum(evidenceValidityStates),
        affectedScope: scopeListSchema,
        unaffectedScope: scopeListSchema,
        reasonCode: reasonCodeSchema.optional(),
      })
      .strict(),
    originalOutcome: z
      .object({
        outcomeId: opaqueAppIdSchema,
        submissionId: opaqueAppIdSchema,
        algorithmVersion: z.string().min(1).max(64),
        scoredAt: z.iso.datetime(),
        unitOutcomes: z
          .array(
            z
              .object({
                itemId: opaqueAppIdSchema,
                kind: z.enum(objectiveUnitOutcomeKinds),
                issueCode: z.string().min(1).max(64).optional(),
              })
              .strict(),
          )
          .max(200),
        checksum: digestSchema,
        officialConversion: z
          .object({ blueprintVersion: z.string().min(1).max(64), units: z.number().int().min(0) })
          .strict()
          .optional(),
      })
      .strict(),
    decisiveEvidence: z
      .array(
        z
          .object({
            itemId: opaqueAppIdSchema,
            safeRevealSpanOrRelation: z.string().min(1).max(600),
            relationKind: z.string().min(1).max(64),
          })
          .strict(),
      )
      .max(200),
    distractorRationale: z
      .array(
        z
          .object({
            itemId: opaqueAppIdSchema,
            optionId: z.string().min(1).max(64),
            whyItFails: z.string().min(1).max(600),
          })
          .strict(),
      )
      .max(200),
    cause: z.discriminatedUnion("status", [
      z
        .object({
          status: z.literal("supported"),
          causeRef: z.string().min(1).max(120),
          confidence: z.enum(["low", "medium", "high"]),
        })
        .strict(),
      z.object({ status: z.literal("unresolved"), clarifier: z.string().min(1).max(240) }).strict(),
    ]),
    repair: z
      .object({ repairRef: z.string().min(1).max(120), summary: z.string().min(1).max(240) })
      .strict()
      .optional(),
  })
  .strict();

export const assistanceCommandSchema = z
  .object({
    attemptId: opaqueAppIdSchema,
    assistanceEventId: opaqueAppIdSchema,
    kind: z.enum(assistanceKinds),
    state: z.enum(["offered", "used"]),
    phase: z.enum(assistancePhases),
    affectedScope: scopeListSchema,
    answerBearing: z.enum(["yes", "no", "uncertain"]),
    testedCapabilityEffect: z.enum(["equivalent", "altering", "unverified", "not_applicable"]),
    occurredAt: z.iso.datetime(),
    policyVersion: z.string().min(1).max(64),
  })
  .strict();

export const exposureCommandSchema = z
  .object({
    attemptId: opaqueAppIdSchema,
    exposureEventId: opaqueAppIdSchema,
    contentFamilyId: opaqueAppIdSchema,
    exposureClass: z.enum(exposureClasses),
    revealedKind: z.enum([
      "stimulus",
      "decisive_information",
      "key_or_model",
      "rationale",
      "transcript",
    ]),
    phase: z.enum(assistancePhases),
    occurredAt: z.iso.datetime(),
  })
  .strict();

/** A scoped content report. It carries identifiers and a bounded note, never raw learner content. */
export const defectReportCommandSchema = z
  .object({
    defectReportId: opaqueAppIdSchema,
    contentRevisionId: opaqueAppIdSchema,
    itemId: opaqueAppIdSchema.optional(),
    attemptId: opaqueAppIdSchema.optional(),
    category: z.enum([
      "ambiguous_key",
      "contradictory_stimulus",
      "media_defect",
      "accessibility_barrier",
      "rights_concern",
      "other",
    ]),
    note: z.string().max(400).optional(),
    reportedAt: z.iso.datetime(),
  })
  .strict();

/**
 * Append-only content impact. The declared cardinality is compared with the resolved selector
 * cardinality; a mismatch stops publication and raises an incident rather than guessing.
 */
export const contentImpactCommandSchema = z
  .object({
    impactAssertionId: opaqueAppIdSchema,
    causeKind: z.enum(impactCauseKinds),
    impactMode: z.enum(impactModes),
    selectors: z
      .object({
        contentFamilyIds: z.array(opaqueAppIdSchema).max(64),
        contentRevisionIds: z.array(opaqueAppIdSchema).max(64),
        itemIds: z.array(opaqueAppIdSchema).max(200),
        formIds: z.array(opaqueAppIdSchema).max(64),
        mediaRevisionIds: z.array(opaqueAppIdSchema).max(64),
      })
      .strict(),
    affectedScope: scopeListSchema,
    unaffectedScope: scopeListSchema,
    declaredCardinality: z.number().int().nonnegative().max(100_000),
    requestedValidity: z.enum(evidenceValidityStates).optional(),
    reasonCode: reasonCodeSchema,
    effectiveAt: z.iso.datetime(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.impactMode === "serving_only" && value.requestedValidity !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["requestedValidity"],
        message: "a serving-only impact never changes validity",
      });
    }
  });
