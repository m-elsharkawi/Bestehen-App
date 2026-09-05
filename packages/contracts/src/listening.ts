import { z } from "zod";

const id = z.uuid();
const ref = z.string().min(1).max(160);
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const milliseconds = z.number().int().nonnegative();
const instant = z.iso.datetime();

/** Exact aggregate pins, sorted by assetId; candidate identifiers are sorted by identity. */
export const audioManifestPinsSchema = z
  .array(
    z
      .object({
        assetId: id,
        manifestRevision: ref,
        digest,
        contentRevisionId: id,
        stimulusId: ref,
        mediaRevisionIds: z
          .array(id)
          .min(1)
          .max(8)
          .refine((values) => new Set(values).size === values.length),
      })
      .strict(),
  )
  .min(1)
  .max(100)
  .refine((pins) => new Set(pins.map((pin) => pin.assetId)).size === pins.length);

export const listeningCandidateSchema = z
  .object({
    assetId: id,
    manifestRevision: ref,
    manifestDigest: digest,
    mediaRevisionId: id,
    digest,
    bytes: z.number().int().positive(),
    mime: z.enum(["audio/mpeg", "audio/wav"]),
    durationMs: milliseconds,
  })
  .strict();

export const listeningOccurrenceSchema = z
  .object({
    occurrenceId: id,
    ordinal: z.number().int().positive(),
    family: z.enum(["H1", "H2", "H3"]),
    contentRevisionId: id,
    stimulusId: ref,
    itemIds: z.array(id).min(1),
    candidates: z.array(listeningCandidateSchema).min(1),
    allowedPlayCount: z.number().int().min(1).max(32),
    authoredSpeedRatio: z.number().positive(),
    ordinalPolicies: z
      .array(
        z
          .object({
            playOrdinal: z.number().int().positive(),
            evidenceCondition: z.enum(["authored_opportunity", "assisted_extra"]),
            requiresCompletedOrdinal: z.number().int().positive().nullable(),
          })
          .strict(),
      )
      .min(1)
      .max(32),
    seekingAllowed: z.boolean(),
    pauseAllowed: z.boolean(),
    transcriptPhase: z.enum(["never", "after_attempt", "after_block"]),
    responseWindow: z.object({ readBeforeMs: milliseconds, respondAfterMs: milliseconds }).strict(),
  })
  .strict();

export const listeningPlanSchema = z
  .object({
    contractMajor: z.literal(1),
    listeningPlanId: id,
    attemptId: id,
    servingManifestId: id,
    formId: id.optional(),
    planVersion: ref,
    targetBlueprintVersion: ref,
    evidenceRole: z.enum([
      "learning_practice",
      "repair_check",
      "independent_practice",
      "mini_mock",
      "section_mock",
      "full_mock",
      "booking_confirmation",
    ]),
    progressionProfile: z.enum(["P0", "P1", "P2", "P3", "P4"]),
    practiceKind: z.enum(["ordinary", "target_probe", "target_block"]),
    occurrences: z.array(listeningOccurrenceSchema).min(1).max(32),
    preflightPolicyRef: ref,
    playbackPolicyRef: ref,
    timerPolicyRef: ref,
    issuedAt: instant,
    expiresAt: instant,
    revocationState: z.enum(["active", "revoked_before_start", "revoked_after_pin"]),
  })
  .strict()
  .superRefine((plan, context) => {
    const occurrenceIds = new Set<string>();
    const items = new Set<string>();
    if (
      (plan.progressionProfile === "P4") !== (plan.practiceKind === "target_block") ||
      (plan.practiceKind === "target_probe" && plan.progressionProfile !== "P3")
    )
      context.addIssue({
        code: "custom",
        path: ["practiceKind"],
        message: "Practice kind does not match the profile",
      });
    for (const [index, occurrence] of plan.occurrences.entries()) {
      if (occurrence.ordinal !== index + 1 || occurrenceIds.has(occurrence.occurrenceId))
        context.addIssue({
          code: "custom",
          path: ["occurrences", index],
          message: "Occurrence identity/order is not unique and contiguous",
        });
      occurrenceIds.add(occurrence.occurrenceId);
      for (const item of occurrence.itemIds) {
        if (items.has(item))
          context.addIssue({
            code: "custom",
            path: ["occurrences", index, "itemIds"],
            message: "An item must have one exact occurrence scope",
          });
        items.add(item);
      }
      if (
        new Set(occurrence.candidates.map((candidate) => candidate.mediaRevisionId)).size !==
        occurrence.candidates.length
      )
        context.addIssue({
          code: "custom",
          path: ["occurrences", index, "candidates"],
          message: "Duplicate candidate identity",
        });
      const targetCount = occurrence.family === "H1" ? 1 : 2;
      const authoredCount = plan.progressionProfile === "P0" ? 1 : targetCount;
      const ceiling =
        plan.progressionProfile === "P0"
          ? 4
          : plan.progressionProfile === "P1"
            ? targetCount + 2
            : plan.progressionProfile === "P2"
              ? targetCount + 1
              : plan.progressionProfile === "P3" && plan.practiceKind === "ordinary"
                ? targetCount + 1
                : targetCount;
      if (
        occurrence.allowedPlayCount > ceiling ||
        occurrence.allowedPlayCount < authoredCount ||
        (plan.practiceKind !== "ordinary" && occurrence.allowedPlayCount !== targetCount) ||
        occurrence.ordinalPolicies.length !== occurrence.allowedPlayCount
      )
        context.addIssue({
          code: "custom",
          path: ["occurrences", index, "allowedPlayCount"],
          message: "Authored play count exceeds profile policy",
        });
      for (const [ordinalIndex, policy] of occurrence.ordinalPolicies.entries()) {
        if (
          policy.playOrdinal !== ordinalIndex + 1 ||
          policy.evidenceCondition !==
            (ordinalIndex >= authoredCount ? "assisted_extra" : "authored_opportunity") ||
          policy.requiresCompletedOrdinal !== (ordinalIndex === 0 ? null : ordinalIndex)
        )
          context.addIssue({
            code: "custom",
            path: ["occurrences", index, "ordinalPolicies", ordinalIndex],
            message: "Play ordinal must preserve prior completion and actual assistance",
          });
      }
      if (
        plan.practiceKind === "target_probe" &&
        (occurrence.authoredSpeedRatio !== 1 ||
          occurrence.seekingAllowed ||
          occurrence.pauseAllowed)
      )
        context.addIssue({
          code: "custom",
          path: ["occurrences", index],
          message: "Target probe forbids changed speed, seeking or pause",
        });
      if (
        plan.progressionProfile === "P4" &&
        (occurrence.allowedPlayCount !== (occurrence.family === "H1" ? 1 : 2) ||
          occurrence.authoredSpeedRatio !== 1 ||
          occurrence.seekingAllowed ||
          occurrence.pauseAllowed ||
          occurrence.transcriptPhase !== "after_block" ||
          occurrence.candidates.some((candidate) => candidate.mime !== "audio/mpeg"))
      )
        context.addIssue({
          code: "custom",
          path: ["occurrences", index],
          message: "P4 requires exact target playback and whole-block transcript withholding",
        });
    }
    if (Date.parse(plan.expiresAt) <= Date.parse(plan.issuedAt))
      context.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Plan expiry must follow issuance",
      });
  });

export const listeningContextSchema = z
  .object({ contextId: ref, environmentChangeCounter: z.number().int().nonnegative() })
  .strict();
export const mediaPreflightObservationSchema = z
  .object({
    operationId: id,
    listeningPlanId: id,
    contractMajor: z.literal(1),
    expectedVersion: z.number().int().nonnegative(),
    policyVersions: z.object({ preflight: ref, playback: ref, timer: ref }).strict(),
    context: listeningContextSchema,
    candidates: z
      .array(
        z
          .object({
            occurrenceId: id,
            assetId: id,
            manifestRevision: ref,
            manifestDigest: digest,
            mediaRevisionId: id,
            observedDigest: digest,
            receivedBytes: z.number().int().nonnegative(),
            loadResult: z.enum(["decoded", "loaded", "failed", "not_attempted"]),
            retainedHandle: z
              .object({ kind: z.enum(["memory_blob", "bounded_cache"]), handleId: ref })
              .strict()
              .nullable(),
            observedAt: instant,
          })
          .strict(),
      )
      .min(1)
      .max(64),
    outputProbe: z
      .object({
        probeRevisionId: id,
        playbackResult: z.enum(["completed", "failed", "not_attempted"]),
        completedAt: instant.nullable(),
        learnerConfirmedAt: instant.nullable(),
      })
      .strict(),
    outboxProbe: z
      .object({
        operationId: id,
        writeResult: z.enum(["committed_and_read_back", "failed", "not_attempted"]),
        payloadDigest: digest,
        observedAt: instant,
      })
      .strict(),
  })
  .strict();

export const mediaPreflightReceiptSchema = z
  .object({
    contractMajor: z.literal(1),
    receiptId: id,
    listeningPlanId: id,
    operationId: id,
    resourceVersion: z.number().int().positive(),
    observationDigest: digest,
    context: listeningContextSchema,
    outcome: z.enum(["ready", "retryable", "unavailable_affected_activity"]),
    reasons: z.array(
      z.enum([
        "policy_changed",
        "plan_expired",
        "candidate_mismatch",
        "integrity_failed",
        "decode_failed",
        "handle_missing",
        "output_unconfirmed",
        "outbox_unavailable",
        "context_changed",
        "media_unavailable",
      ]),
    ),
    issuedAt: instant,
    expiresAt: instant,
  })
  .strict();

export const playbackOccurrenceCommandSchema = z
  .object({
    contractMajor: z.literal(1),
    operationId: id,
    listeningPlanId: id,
    occurrenceId: id,
    expectedVersion: z.number().int().nonnegative(),
    playOrdinal: z.number().int().positive(),
    mediaRevisionId: id,
    preflightReceiptId: id,
    context: listeningContextSchema,
    clientSequence: z.number().int().positive(),
    event: z.enum(["start_intent", "started", "completed", "failed"]),
    localIntentId: id,
    intentPersistedAt: instant,
    intentDurability: z.literal("committed_and_read_back"),
    occurredAt: instant,
    positionMs: milliseconds,
    observations: z
      .object({
        visibilityChanges: z.number().int().nonnegative(),
        stallIntervals: z.array(z.object({ fromMs: milliseconds, toMs: milliseconds }).strict()),
        outputOrDeviceChange: z.boolean(),
        learnerPauseMs: milliseconds,
        technicalPauseMs: milliseconds,
        speedActual: z.number().positive(),
      })
      .strict(),
    faultReason: z
      .enum([
        "media_unavailable",
        "integrity_failed",
        "decode_failed",
        "output_changed",
        "playback_stalled",
        "context_lost",
        "playback_uncertain",
      ])
      .optional(),
  })
  .strict()
  .superRefine((event, context) => {
    if (Date.parse(event.intentPersistedAt) > Date.parse(event.occurredAt))
      context.addIssue({
        code: "custom",
        path: ["intentPersistedAt"],
        message: "The durable intent must precede native playback",
      });
    if ((event.event === "failed") !== (event.faultReason !== undefined))
      context.addIssue({
        code: "custom",
        path: ["faultReason"],
        message: "A fault reason belongs exactly to a failed observation",
      });
    if (event.observations.stallIntervals.some((stall) => stall.toMs < stall.fromMs))
      context.addIssue({
        code: "custom",
        path: ["observations", "stallIntervals"],
        message: "Stall intervals cannot run backwards",
      });
  });

/** This envelope is constructed only after the server phase gate, never inside a plan. */
export const transcriptRevealSchema = z
  .object({
    transcriptRevisionId: id,
    mediaRevisionId: id,
    kind: z.enum(["target_transcript", "focused_repair_excerpt"]),
    language: z.literal("de"),
    digest,
    authorizedPhase: z.enum(["after_attempt", "after_block"]),
    text: z.string().min(1).max(100_000),
  })
  .strict();

export type ListeningPlan = z.infer<typeof listeningPlanSchema>;
export type ListeningOccurrence = z.infer<typeof listeningOccurrenceSchema>;
export type MediaPreflightObservation = z.infer<typeof mediaPreflightObservationSchema>;
export type MediaPreflightReceipt = z.infer<typeof mediaPreflightReceiptSchema>;
export type PlaybackOccurrenceCommand = z.infer<typeof playbackOccurrenceCommandSchema>;
