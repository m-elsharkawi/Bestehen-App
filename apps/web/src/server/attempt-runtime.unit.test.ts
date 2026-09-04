import { createHash } from "node:crypto";
import { canonicalizeResponse, canonicalResponseDigest, type TaskFamily } from "@bestehen/content";
import { type AuthorizedScope, appId } from "@bestehen/domain";
import type {
  AttemptStateRecord,
  ObjectiveSubmissionInput,
  PinnedLearnerMaterialRecord,
  PinnedScoringUnitRecord,
  SubmissionCommit,
} from "@bestehen/infrastructure";
import { describe, expect, it, vi } from "vitest";
import {
  type AttemptRuntimeIdentityFactory,
  DeterministicAttemptService,
  resolveScoringPolicy,
} from "./attempt-runtime";

const scope: AuthorizedScope = {
  principalId: appId<"principal">("11111111-1111-4111-8111-111111111111"),
  learnerScopeId: appId<"learner_scope">("22222222-2222-4222-8222-222222222222"),
  actorKind: "owner",
  capabilities: [],
  authenticatedAt: new Date("2026-09-02T08:00:00.000Z"),
};
const attemptId = appId<"attempt">("33333333-3333-4333-8333-333333333333");
const manifestId = appId<"serving_manifest">("44444444-4444-4444-8444-444444444444");
const revisionId = appId<"content_revision">("55555555-5555-4555-8555-555555555555");
const familyId = appId<"content_family">("66666666-6666-4666-8666-666666666666");
const itemId = appId<"content_item">("77777777-7777-4777-8777-777777777777");
const keyId = appId<"key_revision">("88888888-8888-4888-8888-888888888888");
const operationId = appId<"operation">("99999999-9999-4999-8999-999999999999");
const now = new Date("2026-09-02T08:10:00.000Z");

const payload: TaskFamily = {
  kind: "R2DetailedSelect",
  stimulus: {
    stimulusId: "stimulus-route",
    safeContentNodes: [
      {
        kind: "paragraph",
        children: [{ kind: "inline_text", text: "Der Kurs beginnt am Montag." }],
      },
    ],
    language: "de",
    genreDomainRegister: "notice",
    evidenceAnchorIds: ["anchor-route"],
  },
  questions: [
    {
      itemRef: itemId,
      questionId: "question-route",
      questionNodes: [{ kind: "inline_text", text: "Wann beginnt der Kurs?" }],
      options: [
        {
          optionId: "option-monday",
          learnerSafeLabel: [{ kind: "inline_text", text: "Am Montag" }],
          positionIsPresentationOnly: true,
        },
        {
          optionId: "option-tuesday",
          learnerSafeLabel: [{ kind: "inline_text", text: "Am Dienstag" }],
          positionIsPresentationOnly: true,
        },
      ],
    },
  ],
};

const attempt: AttemptStateRecord = {
  attemptId,
  learnerScopeId: scope.learnerScopeId,
  operationId,
  servingManifestId: manifestId,
  contentRevisionId: revisionId,
  modality: "reading",
  directLane: "written",
  state: "checkpointed",
  resourceVersion: 3,
  acknowledgedCheckpointSequence: 1,
  occurredAt: new Date("2026-09-02T08:00:00.000Z"),
};

const material: PinnedLearnerMaterialRecord = {
  manifest: {
    servingManifestId: manifestId,
    learnerScopeId: scope.learnerScopeId,
    operationId,
    contentClass: "C3",
    approvalRole: "training",
    entries: [{ ordinal: 1, contentRevisionId: revisionId, contentItemId: itemId }],
    keyRevisionDigests: ["a".repeat(64)],
    allowedConditions: {
      progressionProfile: "P2",
      timingMode: "practice",
      targetDurationMs: 1_200_000,
      transcriptPhase: "after_attempt",
      offerableAssistanceKinds: ["strategy_cue"],
    },
    learnerSafePayloadDigest: "b".repeat(64),
    freshnessDecision: "fresh",
    comparedFamilyRefs: [],
    authorizationVersion: "authorization/v1",
    contentReleaseIdentity: "stage-05-content-v1",
    issuedAt: new Date("2026-09-02T07:59:00.000Z"),
    expiresAt: new Date("2026-09-02T08:45:00.000Z"),
    revocationState: "active",
    digest: "c".repeat(64),
  },
  contentFamilyId: familyId,
  taskFamilyKind: payload.kind,
  contentRevisionId: revisionId,
  instruction: {
    instructionId: "instruction-route",
    locale: "de",
    safeContentNodes: [{ kind: "inline_text", text: "Lesen Sie den Text." }],
    responseMechanic: "single_select",
    helpPolicy: { offerableAssistanceKinds: ["strategy_cue"] },
    learnerFacingTimingLabel: "Übungszeit",
  },
  learnerPayload: payload,
  progressionProfile: "P2",
  itemIds: [itemId],
};

const scoringUnit: PinnedScoringUnitRecord = {
  contentItemId: itemId,
  contentRevisionId: revisionId,
  binding: { kind: "select", questionId: "question-route" },
  scorable: {
    responseKind: "single_select",
    responseCardinality: { min: 1, max: 1 },
    keyRevisionId: keyId,
    scoringPolicyRef: "objective-scoring/v1",
  },
  keyRevisionId: keyId,
  acceptedResponseSet: [{ kind: "option", optionId: "option-monday" }],
  responseCardinality: { min: 1, max: 1 },
  scoringPolicyRef: "objective-scoring/v1",
};

const identity: AttemptRuntimeIdentityFactory = (kind, seed) => {
  const hex = createHash("sha256").update(`${kind}:${seed}`).digest("hex");
  return appId(
    `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`,
  );
};

const clockObservation = {
  monotonicElapsedMs: 600_000,
  visibilityChanges: 0,
  stallIntervals: [],
  wallClockSkewMs: 0,
  accessibilityEquivalence: "equivalent" as const,
};

function dependencies() {
  const operation = { kind: "set_selection", itemId, optionId: "option-monday" } as const;
  const canonical = canonicalizeResponse([operation]).response;
  const responseDigest = canonicalResponseDigest(canonical);
  let captured: ObjectiveSubmissionInput | undefined;
  const committed = {
    disposition: "created",
    submission: { attemptId },
  } as unknown as SubmissionCommit;
  const attempts = {
    readAttempt: vi.fn(async () => attempt),
    readCanonicalCheckpoint: vi.fn(async () => ({
      sequence: 1,
      stream: "primary",
      operations: [operation],
      canonicalResponse: canonical,
      responseDigest,
    })),
    recordCheckpoint: vi.fn(),
    recordAttemptFact: vi.fn(async () => ({
      ok: true as const,
      value: { disposition: "created" as const, learnerSequence: 1 },
    })),
    readRecordedAttemptConditions: vi.fn(async () => ({ assistance: [], clockObservation })),
    submitObjectiveAttempt: vi.fn(
      async (_scope: AuthorizedScope, input: ObjectiveSubmissionInput) => {
        captured = input;
        return { ok: true as const, value: committed };
      },
    ),
  };
  const content = {
    readPinnedLearnerMaterial: vi.fn(async () => material),
    readPinnedScoringUnits: vi.fn(async () => [scoringUnit]),
    readPinnedContentStatus: vi.fn(async () => "published" as const),
  };
  return {
    responseDigest,
    attempts,
    content,
    captured: () => captured,
    service: new DeterministicAttemptService({ attempts, content }, identity, () => now),
  };
}

describe("P05-SECURITY-001 active learner projection", () => {
  it("loads the pinned learner payload without touching the key-bearing read", async () => {
    const fixture = dependencies();
    const result = await fixture.service.readLearnerAttempt(scope, attemptId);

    expect(result.ok && result.value.material.learnerPayload).toEqual(payload);
    expect(fixture.content.readPinnedScoringUnits).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("acceptedResponseSet");
  });
});

describe("P05-RECOVERY-001 atomic checkpoint composition", () => {
  it("hands one canonical coordinate and response fact to the atomic repository method", async () => {
    const fixture = dependencies();
    fixture.attempts.recordCheckpoint.mockResolvedValue({
      ok: true,
      value: { disposition: "accepted", attempt },
    });
    const operations = [{ kind: "set_selection" as const, itemId, optionId: "option-monday" }];

    const result = await fixture.service.checkpointObjective(scope, {
      operationId,
      attemptId,
      expectedVersion: 3,
      stream: "primary",
      sequence: 1,
      operations,
      responseDigest: fixture.responseDigest,
    });

    expect(result.ok).toBe(true);
    expect(fixture.attempts.recordCheckpoint).toHaveBeenCalledWith(
      scope,
      expect.objectContaining({
        operationId,
        attemptId,
        payloadDigest: fixture.responseDigest,
        canonicalFact: expect.objectContaining({ operations }),
      }),
    );
    expect(fixture.content.readPinnedScoringUnits).not.toHaveBeenCalled();
  });
});

describe("P05-SCORE-001 deterministic attempt composition", () => {
  it("canonicalizes, resolves the pinned policy, scores, and proposes one transactional write", async () => {
    const fixture = dependencies();
    const result = await fixture.service.submitObjective(scope, {
      operationId,
      attemptId,
      checkpointSequence: 1,
      responseDigest: fixture.responseDigest,
      clockObservation,
    });

    expect(result.ok).toBe(true);
    expect(fixture.content.readPinnedScoringUnits).toHaveBeenCalledWith(scope, manifestId);
    expect(fixture.captured()?.outcome.unitOutcomes).toEqual([
      expect.objectContaining({ contentItemId: itemId, kind: "correct", keyRevisionId: keyId }),
    ]);
    expect(fixture.captured()?.conditions).toEqual({
      nonLearnerFaultScope: [],
      continuityLostScope: [],
      timerIntegrity: "in_context_trusted",
      independenceClass: "first_attempt",
    });
    expect(fixture.attempts.recordAttemptFact.mock.invocationCallOrder[0]).toBeLessThan(
      fixture.content.readPinnedScoringUnits.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
  });

  it("rejects an unknown stored policy rather than guessing points", async () => {
    const fixture = dependencies();
    fixture.content.readPinnedScoringUnits.mockResolvedValue([
      {
        ...scoringUnit,
        scoringPolicyRef: "unknown-policy/v9",
        scorable: {
          responseKind: "single_select",
          responseCardinality: { min: 1, max: 1 },
          keyRevisionId: keyId,
          scoringPolicyRef: "unknown-policy/v9",
        },
      },
    ]);
    const result = await fixture.service.submitObjective(scope, {
      operationId,
      attemptId,
      checkpointSequence: 1,
      responseDigest: fixture.responseDigest,
      clockObservation,
    });
    expect(result).toEqual({ ok: false, error: "unsupported_scoring_policy" });
    expect(fixture.attempts.submitObjectiveAttempt).not.toHaveBeenCalled();
  });

  it("cannot promote an inconsistent client clock observation to trusted timing", async () => {
    const fixture = dependencies();
    const inconsistent = { ...clockObservation, monotonicElapsedMs: 1_000 };
    fixture.attempts.readRecordedAttemptConditions.mockResolvedValue({
      assistance: [],
      clockObservation: inconsistent,
    });

    const result = await fixture.service.submitObjective(scope, {
      operationId,
      attemptId,
      checkpointSequence: 1,
      responseDigest: fixture.responseDigest,
      clockObservation: inconsistent,
    });

    expect(result.ok).toBe(true);
    expect(fixture.captured()?.conditions.timerIntegrity).toBe("inconsistent");
    expect(fixture.captured()?.conditions.continuityLostScope).toEqual([itemId]);
  });

  it.each([
    { unavailable: true },
    { recoveredFromAnotherContext: true },
    { contextStartedAt: "2026-09-02T08:09:00.000Z" },
  ])("narrows timing when continuity is not established: %j", async (extra) => {
    const fixture = dependencies();
    const observation = { ...clockObservation, ...extra };
    fixture.attempts.readRecordedAttemptConditions.mockResolvedValue({
      assistance: [],
      clockObservation: observation,
    });
    const result = await fixture.service.submitObjective(scope, {
      operationId,
      attemptId,
      checkpointSequence: 1,
      responseDigest: fixture.responseDigest,
      clockObservation: observation,
    });
    expect(result.ok).toBe(true);
    expect(fixture.captured()?.conditions.timerIntegrity).toBe("insufficient");
    expect(fixture.captured()?.conditions.continuityLostScope).toEqual([itemId]);
    expect(fixture.captured()?.outcome.unitOutcomes[0]?.kind).toBe("correct");
  });
});

describe("closed scoring policy registry", () => {
  it("binds the seed policy to one deterministic point rule", () => {
    expect(resolveScoringPolicy("objective-scoring/v1")).toEqual({
      scoringPolicyRef: "objective-scoring/v1",
      pointsPerCorrectUnit: 1,
      pointsPerIncorrectUnit: 0,
      pointsPerBlankUnit: 0,
      officialConversion: null,
    });
    expect(resolveScoringPolicy("objective-scoring/latest")).toBeUndefined();
  });
});
