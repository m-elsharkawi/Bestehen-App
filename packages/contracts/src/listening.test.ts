import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { allowedConditionsSchema } from "./index.js";
import {
  type ListeningPlan,
  listeningPlanSchema,
  mediaPreflightObservationSchema,
  playbackOccurrenceCommandSchema,
} from "./listening.js";

it("P05-LISTENING-001 admits optional exact audio pins without changing old conditions or permitting private carriers", () => {
  const legacy = {
    progressionProfile: "P4",
    timingMode: "exam",
    transcriptPhase: "after_block",
    offerableAssistanceKinds: [],
  };
  expect(allowedConditionsSchema.parse(legacy)).toEqual(legacy);
  const pin = {
    assetId: randomUUID(),
    manifestRevision: "manifest/v1",
    digest: "a".repeat(64),
    contentRevisionId: randomUUID(),
    stimulusId: "conversation",
    mediaRevisionIds: [randomUUID()],
  };
  expect(allowedConditionsSchema.parse({ ...legacy, audioManifestPins: [pin] })).toEqual({
    ...legacy,
    audioManifestPins: [pin],
  });
  for (const invalid of [
    { ...pin, objectKey: "private/key" },
    { ...pin, digest: "wrong" },
    { ...pin, mediaRevisionIds: [] },
    { ...pin, mediaRevisionIds: [pin.mediaRevisionIds[0], pin.mediaRevisionIds[0]] },
  ])
    expect(
      allowedConditionsSchema.safeParse({ ...legacy, audioManifestPins: [invalid] }).success,
    ).toBe(false);
  expect(
    allowedConditionsSchema.safeParse({ ...legacy, audioManifestPins: [pin, pin] }).success,
  ).toBe(false);
});

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("missing synthetic fixture identity");
  return value;
}

function plan(
  profile: ListeningPlan["progressionProfile"] = "P4",
  family: "H1" | "H2" | "H3" = "H1",
  count = family === "H1" ? 1 : 2,
): ListeningPlan {
  const authored = profile === "P0" ? 1 : family === "H1" ? 1 : 2;
  return {
    contractMajor: 1,
    listeningPlanId: randomUUID(),
    attemptId: randomUUID(),
    servingManifestId: randomUUID(),
    planVersion: "listening-plan/v1",
    targetBlueprintVersion: "synthetic/target-v1",
    evidenceRole: profile === "P4" ? "section_mock" : "learning_practice",
    progressionProfile: profile,
    practiceKind: profile === "P4" ? "target_block" : "ordinary",
    preflightPolicyRef: "preflight/v1",
    playbackPolicyRef: "playback/v1",
    timerPolicyRef: "timer/v1",
    issuedAt: "2026-09-04T10:00:00.000Z",
    expiresAt: "2026-09-04T11:00:00.000Z",
    revocationState: "active",
    occurrences: [
      {
        occurrenceId: randomUUID(),
        ordinal: 1,
        family,
        contentRevisionId: randomUUID(),
        stimulusId: "synthetic-stimulus",
        itemIds: [randomUUID()],
        candidates: [
          {
            assetId: randomUUID(),
            manifestRevision: "m1",
            manifestDigest: "a".repeat(64),
            mediaRevisionId: randomUUID(),
            digest: "b".repeat(64),
            bytes: 12000,
            mime: "audio/mpeg",
            durationMs: 10000,
          },
        ],
        allowedPlayCount: count,
        authoredSpeedRatio: 1,
        seekingAllowed: false,
        pauseAllowed: false,
        transcriptPhase: "after_block",
        responseWindow: { readBeforeMs: 2000, respondAfterMs: 5000 },
        ordinalPolicies: Array.from({ length: count }, (_, index) => ({
          playOrdinal: index + 1,
          evidenceCondition: index >= authored ? "assisted_extra" : "authored_opportunity",
          requiresCompletedOrdinal: index === 0 ? null : index,
        })),
      },
    ],
  };
}

describe("P05-LISTENING-001 exact profile playback contracts", () => {
  for (const family of ["H1", "H2", "H3"] as const) {
    const target = family === "H1" ? 1 : 2;
    for (const profile of ["P0", "P1", "P2", "P3", "P4"] as const) {
      it(`${profile}/${family} keeps authored lower and upper bounds rather than the database cap`, () => {
        const minimum = profile === "P0" ? 1 : target;
        const maximum =
          profile === "P0"
            ? 4
            : profile === "P1"
              ? target + 2
              : profile === "P2" || profile === "P3"
                ? target + 1
                : target;
        expect(listeningPlanSchema.safeParse(plan(profile, family, minimum)).success).toBe(true);
        expect(listeningPlanSchema.safeParse(plan(profile, family, maximum)).success).toBe(true);
        expect(listeningPlanSchema.safeParse(plan(profile, family, minimum - 1)).success).toBe(
          false,
        );
        expect(listeningPlanSchema.safeParse(plan(profile, family, maximum + 1)).success).toBe(
          false,
        );
        expect(listeningPlanSchema.safeParse(plan(profile, family, 32)).success).toBe(false);
      });
    }
    it(`P3/${family} extra is assisted only after the target opportunity; target probe has no extra`, () => {
      const ordinary = plan("P3", family, target + 1);
      const occurrence = required(ordinary.occurrences[0]);
      required(occurrence.ordinalPolicies[target]).evidenceCondition = "authored_opportunity";
      expect(listeningPlanSchema.safeParse(ordinary).success).toBe(false);
      required(occurrence.ordinalPolicies[target]).evidenceCondition = "assisted_extra";
      required(occurrence.ordinalPolicies[target]).requiresCompletedOrdinal = null;
      expect(listeningPlanSchema.safeParse(ordinary).success).toBe(false);
      const probe = { ...plan("P3", family, target), practiceKind: "target_probe" };
      expect(listeningPlanSchema.safeParse(probe).success).toBe(true);
      expect(
        listeningPlanSchema.safeParse({ ...ordinary, practiceKind: "target_probe" }).success,
      ).toBe(false);
      required(probe.occurrences[0]).authoredSpeedRatio = 0.9;
      expect(listeningPlanSchema.safeParse(probe).success).toBe(false);
    });
  }

  it("requires exact aggregate pins and denies private carriers, unknown majors, duplicate scope and early P4 reveal", () => {
    const input = plan();
    const occurrence = required(input.occurrences[0]);
    const candidate = required(occurrence.candidates[0]);
    for (const key of [
      "assetId",
      "manifestRevision",
      "manifestDigest",
      "mediaRevisionId",
      "digest",
      "bytes",
    ]) {
      const broken = structuredClone(input) as unknown as {
        occurrences: { candidates: Record<string, unknown>[] }[];
      };
      delete required(required(broken.occurrences[0]).candidates[0])[key];
      expect(listeningPlanSchema.safeParse(broken).success).toBe(false);
    }
    expect(listeningPlanSchema.safeParse({ ...input, contractMajor: 2 }).success).toBe(false);
    expect(listeningPlanSchema.safeParse({ ...input, transcript: "private" }).success).toBe(false);
    occurrence.candidates = [{ ...candidate, objectKey: "private" } as typeof candidate];
    expect(listeningPlanSchema.safeParse(input).success).toBe(false);
    occurrence.candidates = [candidate];
    occurrence.itemIds.push(required(occurrence.itemIds[0]));
    expect(listeningPlanSchema.safeParse(input).success).toBe(false);
    occurrence.itemIds.pop();
    occurrence.transcriptPhase = "after_attempt";
    expect(listeningPlanSchema.safeParse(input).success).toBe(false);
  });

  it("preflight requires raw versioned observations, not a client readiness boolean", () => {
    const input = plan();
    const occurrence = required(input.occurrences[0]);
    const candidate = required(occurrence.candidates[0]);
    const observation = {
      operationId: randomUUID(),
      listeningPlanId: input.listeningPlanId,
      contractMajor: 1,
      expectedVersion: 1,
      policyVersions: {
        preflight: input.preflightPolicyRef,
        playback: input.playbackPolicyRef,
        timer: input.timerPolicyRef,
      },
      context: { contextId: "browser-context", environmentChangeCounter: 0 },
      candidates: [
        {
          occurrenceId: occurrence.occurrenceId,
          assetId: candidate.assetId,
          manifestRevision: candidate.manifestRevision,
          manifestDigest: candidate.manifestDigest,
          mediaRevisionId: candidate.mediaRevisionId,
          observedDigest: candidate.digest,
          receivedBytes: candidate.bytes,
          loadResult: "decoded",
          retainedHandle: { kind: "memory_blob", handleId: "local-handle" },
          observedAt: input.issuedAt,
        },
      ],
      outputProbe: {
        probeRevisionId: randomUUID(),
        playbackResult: "completed",
        completedAt: input.issuedAt,
        learnerConfirmedAt: input.issuedAt,
      },
      outboxProbe: {
        operationId: randomUUID(),
        writeResult: "committed_and_read_back",
        payloadDigest: "c".repeat(64),
        observedAt: input.issuedAt,
      },
    };
    expect(mediaPreflightObservationSchema.safeParse(observation).success).toBe(true);
    expect(mediaPreflightObservationSchema.safeParse({ ...observation, ready: true }).success).toBe(
      false,
    );
    expect(
      mediaPreflightObservationSchema.safeParse({ ...observation, outputProbe: true }).success,
    ).toBe(false);
    expect(
      mediaPreflightObservationSchema.safeParse({ ...observation, candidates: [] }).success,
    ).toBe(false);
    expect(
      mediaPreflightObservationSchema.safeParse({ ...observation, outboxProbe: undefined }).success,
    ).toBe(false);
  });

  it("P05-IDEMPOTENCY-001 playback observations retain exact intent identity, ordinal, sequence and typed fault", () => {
    const input = {
      contractMajor: 1,
      operationId: randomUUID(),
      listeningPlanId: randomUUID(),
      occurrenceId: randomUUID(),
      expectedVersion: 1,
      playOrdinal: 1,
      mediaRevisionId: randomUUID(),
      preflightReceiptId: randomUUID(),
      context: { contextId: "local", environmentChangeCounter: 0 },
      clientSequence: 1,
      event: "start_intent",
      localIntentId: randomUUID(),
      intentPersistedAt: "2026-09-04T10:00:00.000Z",
      intentDurability: "committed_and_read_back",
      occurredAt: "2026-09-04T10:00:00.000Z",
      positionMs: 0,
      observations: {
        visibilityChanges: 0,
        stallIntervals: [],
        outputOrDeviceChange: false,
        learnerPauseMs: 0,
        technicalPauseMs: 0,
        speedActual: 1,
      },
    };
    expect(playbackOccurrenceCommandSchema.safeParse(input).success).toBe(true);
    expect(playbackOccurrenceCommandSchema.safeParse({ ...input, event: "failed" }).success).toBe(
      false,
    );
    expect(
      playbackOccurrenceCommandSchema.safeParse({
        ...input,
        event: "failed",
        faultReason: "context_lost",
      }).success,
    ).toBe(true);
    expect(
      playbackOccurrenceCommandSchema.safeParse({ ...input, faultReason: "context_lost" }).success,
    ).toBe(false);
    expect(
      playbackOccurrenceCommandSchema.safeParse({ ...input, localIntentId: undefined }).success,
    ).toBe(false);
    expect(
      playbackOccurrenceCommandSchema.safeParse({
        ...input,
        observations: { ...input.observations, stallIntervals: [{ fromMs: 3, toMs: 2 }] },
      }).success,
    ).toBe(false);
  });
});
