import { describe, expect, it } from "vitest";
import {
  assistanceCommandSchema,
  attemptResourceSchema,
  checkpointCommandSchema,
  commandEnvelopeSchema,
  contentImpactCommandSchema,
  defectReportCommandSchema,
  exposureCommandSchema,
  healthPayloadSchema,
  jobEnvelopeSchema,
  objectiveResultSchema,
  problemSchema,
  projectionSchema,
  responseOperationSchema,
  scopedCursorSchema,
  servingManifestSchema,
  submitObjectiveCommandSchema,
  validityAssertionSchema,
} from "./index.js";

describe("healthPayloadSchema", () => {
  it("accepts the stable minimal v1 payload", () => {
    expect(
      healthPayloadSchema.parse({
        version: 1,
        status: "ready",
        service: "web",
        releaseCommit: "synthetic-commit",
      }),
    ).toMatchObject({ status: "ready" });
  });

  it("rejects dependency details", () => {
    expect(() =>
      healthPayloadSchema.parse({
        version: 1,
        status: "ready",
        service: "web",
        releaseCommit: "synthetic-commit",
        databaseUrl: "not-allowed",
      }),
    ).toThrow();
  });
});

describe("Stage 03 v1 contracts", () => {
  const id = "opaque_id_12345678";

  it("validates strict commands, jobs, and RFC 9457 problem envelopes", () => {
    expect(
      commandEnvelopeSchema.safeParse({
        contract: { major: 1, minor: 0 },
        operationId: id,
        expectedVersion: 0,
        payload: {},
      }).success,
    ).toBe(true);
    expect(
      jobEnvelopeSchema.safeParse({
        contract: { kind: "foundation", major: 1, minor: 0 },
        jobId: id,
        kind: "projection_rebuild_v1",
        semanticIdentity: "projection:scope:1",
        learnerScopeId: id,
        owner: "evidence",
        attempt: 0,
        deadline: "2026-08-25T12:00:00.000Z",
        payloadDigest: "a".repeat(64),
        selector: {},
      }).success,
    ).toBe(true);
    expect(
      problemSchema.safeParse({
        type: "https://bestehen.invalid/problems/authorization-denied",
        title: "Not available",
        status: 404,
        code: "authorization_denied",
        requestId: id,
      }).success,
    ).toBe(true);
  });

  it("fails closed for unsupported majors and overlapping validity partitions", () => {
    expect(
      commandEnvelopeSchema.safeParse({
        contract: { major: 2, minor: 0 },
        operationId: id,
        expectedVersion: 0,
        payload: {},
      }).success,
    ).toBe(false);
    expect(
      validityAssertionSchema.safeParse({
        assertionId: id,
        observationId: id,
        state: "partially_valid",
        scope: { affected: ["oral"], unaffected: ["oral"] },
        reasonCode: "VALIDITY.TECHNICAL_PREFLIGHT",
        effectiveAt: "2026-08-25T12:00:00.000Z",
        recordedAt: "2026-08-25T12:00:00.000Z",
        release: "evidence-contract/v1",
      }).success,
    ).toBe(false);
  });

  it("rejects undocumented carriers at outer and nested contract boundaries", () => {
    expect(
      commandEnvelopeSchema.safeParse({
        contract: { major: 1, minor: 0, compatibility: "latest" },
        operationId: id,
        expectedVersion: 0,
        payload: {},
      }).success,
    ).toBe(false);
    expect(
      projectionSchema.safeParse({
        generationId: id,
        kind: "readiness",
        availability: "current",
        sourceCut: 4,
        computedAt: "2026-08-25T12:00:00.000Z",
        checksum: "b".repeat(64),
        written: { status: "absent", hiddenScore: 0.91 },
      }).success,
    ).toBe(false);
  });

  it("keeps Written and Oral independent, absence explicit, and probability structurally absent", () => {
    const projection = projectionSchema.parse({
      generationId: id,
      kind: "readiness",
      availability: "current",
      sourceCut: 4,
      computedAt: "2026-08-25T12:00:00.000Z",
      checksum: "b".repeat(64),
      readiness: "evidence_building",
      written: { status: "absent" },
      oral: { status: "value", band: "building" },
    });
    expect(projection.written).toEqual({ status: "absent" });
    expect("probability" in projection).toBe(false);
  });

  it("bounds scoped historical cursors", () => {
    expect(
      scopedCursorSchema.safeParse({
        scopeDigest: "c".repeat(64),
        recordedAt: "2026-08-25T12:00:00.000Z",
        opaqueId: id,
        snapshotCut: 5,
        limit: 101,
      }).success,
    ).toBe(false);
  });
});

describe("P05-CONTRACT-001 Stage 05 serving and attempt runtime contracts", () => {
  const id = "opaque_id_12345678";
  const digest = "a".repeat(64);
  const at = "2026-09-01T09:00:00.000Z";

  const manifest = {
    servingManifestId: id,
    attemptId: id,
    contentRevisionIds: [id],
    itemIds: [id],
    mediaRevisionIds: [],
    keyRevisionDigests: [digest],
    contentClass: "C3",
    approvalRole: "training",
    allowedConditions: {
      progressionProfile: "P2",
      timingMode: "practice",
      transcriptPhase: "after_attempt",
      offerableAssistanceKinds: ["word_help"],
    },
    learnerSafePayloadDigest: digest,
    freshnessDecision: "fresh",
    comparedFamilyRefs: [],
    authorizationVersion: "authz/v1",
    contentReleaseIdentity: "stage-05-content-v1",
    issuedAt: at,
    expiresAt: "2026-09-01T10:00:00.000Z",
    revocationState: "active",
  };

  const conditions = {
    progressionProfile: "P2",
    timingMode: "practice",
    timerIntegrity: "in_context_trusted",
    elapsedMs: 240_000,
    exposureClass: "unseen",
    independenceClass: "first_attempt",
    assistanceUsed: [],
    accessibilityEquivalence: "equivalent",
  };

  it("round-trips the serving lease and rejects any key-bearing carrier", () => {
    expect(servingManifestSchema.parse(manifest)).toMatchObject({ freshnessDecision: "fresh" });
    for (const forbidden of [
      { answerKey: ["a", "b"] },
      { correctOptionId: "o1" },
      { distractorRationale: "because" },
      { scoringWeight: 2 },
      { operatorNote: "internal" },
      { passProbability: 0.9 },
    ]) {
      expect(servingManifestSchema.safeParse({ ...manifest, ...forbidden }).success).toBe(false);
    }
  });

  it("keeps every input path on one closed canonical response operation union", () => {
    for (const operation of [
      { kind: "set_selection", itemId: id, optionId: "o1" },
      { kind: "clear_selection", itemId: id },
      { kind: "set_match", itemId: id, leftId: "l1", rightId: "no_match" },
      { kind: "clear_match", itemId: id, leftId: "l1" },
      { kind: "place_candidate", itemId: id, gapId: "g1", candidateId: "c1" },
      { kind: "remove_candidate", itemId: id, gapId: "g1" },
      { kind: "move_candidate", itemId: id, fromGapId: "g1", toGapId: "g2" },
      { kind: "confirm_boundary", boundaryId: "b1" },
    ]) {
      expect(responseOperationSchema.safeParse(operation).success).toBe(true);
    }
    // Presentation facts are never canonical operations.
    expect(responseOperationSchema.safeParse({ kind: "drag_start", itemId: id }).success).toBe(
      false,
    );
    expect(
      responseOperationSchema.safeParse({ kind: "set_selection", itemId: id, optionIndex: 2 })
        .success,
    ).toBe(false);
  });

  it("accepts checkpoints and submissions and rejects a negative or unbounded sequence", () => {
    expect(
      checkpointCommandSchema.safeParse({
        attemptId: id,
        stream: "objective",
        sequence: 0,
        operations: [{ kind: "set_selection", itemId: id, optionId: "o1" }],
        responseDigest: digest,
        observedAt: at,
      }).success,
    ).toBe(true);
    expect(
      checkpointCommandSchema.safeParse({
        attemptId: id,
        stream: "objective",
        sequence: -1,
        operations: [{ kind: "clear_selection", itemId: id }],
        responseDigest: digest,
        observedAt: at,
      }).success,
    ).toBe(false);
    expect(
      submitObjectiveCommandSchema.safeParse({
        attemptId: id,
        checkpointSequence: 4,
        responseDigest: digest,
        conditions,
      }).success,
    ).toBe(true);
    expect(
      submitObjectiveCommandSchema.safeParse({
        attemptId: id,
        checkpointSequence: 4,
        responseDigest: digest,
        conditions: { ...conditions, timerIntegrity: "probably_fine" },
      }).success,
    ).toBe(false);
  });

  it("carries the attempt runtime state and never the removed not_counted runtime value", () => {
    expect(
      attemptResourceSchema.safeParse({
        attemptId: id,
        servingManifestId: id,
        state: "submission_unknown",
        revision: 2,
        acknowledgedCheckpointSequence: 3,
        expiresAt: at,
        reasonCode: "FALLBACK.SUBMISSION_OUTCOME_UNKNOWN",
      }).success,
    ).toBe(true);
    for (const state of ["not_counted", "started", "completed", "diagnose"]) {
      expect(
        attemptResourceSchema.safeParse({
          attemptId: id,
          servingManifestId: id,
          state,
          revision: 1,
          acknowledgedCheckpointSequence: 0,
          expiresAt: at,
        }).success,
      ).toBe(false);
    }
  });

  it("returns the objective result in the architecture's order with no probability field", () => {
    const parsed = objectiveResultSchema.parse({
      validity: { state: "valid", affectedScope: [], unaffectedScope: ["reading.r1"] },
      originalOutcome: {
        outcomeId: id,
        submissionId: id,
        algorithmVersion: "objective-scoring/v1",
        scoredAt: at,
        unitOutcomes: [{ itemId: id, kind: "incorrect" }],
        checksum: digest,
      },
      decisiveEvidence: [{ itemId: id, safeRevealSpanOrRelation: "…", relationKind: "paraphrase" }],
      distractorRationale: [{ itemId: id, optionId: "o2", whyItFails: "…" }],
      cause: { status: "unresolved", clarifier: "One smallest clarifier." },
    });
    expect(Object.keys(parsed)).toEqual([
      "validity",
      "originalOutcome",
      "decisiveEvidence",
      "distractorRationale",
      "cause",
    ]);
    expect("probability" in parsed).toBe(false);
    expect(
      objectiveResultSchema.safeParse({
        validity: { state: "valid", affectedScope: [], unaffectedScope: [] },
        originalOutcome: {
          outcomeId: id,
          submissionId: id,
          algorithmVersion: "objective-scoring/v1",
          scoredAt: at,
          unitOutcomes: [],
          checksum: digest,
        },
        decisiveEvidence: [],
        distractorRationale: [],
        cause: { status: "supported", causeRef: "c", confidence: "high" },
        passProbability: 0.8,
      }).success,
    ).toBe(false);
  });

  it("records assistance, exposure and defect reports without raw learner content", () => {
    expect(
      assistanceCommandSchema.safeParse({
        attemptId: id,
        assistanceEventId: id,
        kind: "word_help",
        state: "offered",
        phase: "before_response",
        affectedScope: ["reading.r1.item.3"],
        answerBearing: "no",
        testedCapabilityEffect: "equivalent",
        occurredAt: at,
        policyVersion: "assistance-policy/v1",
      }).success,
    ).toBe(true);
    expect(
      exposureCommandSchema.safeParse({
        attemptId: id,
        exposureEventId: id,
        contentFamilyId: id,
        exposureClass: "answer_exposed",
        revealedKind: "key_or_model",
        phase: "after_submission",
        occurredAt: at,
      }).success,
    ).toBe(true);
    expect(
      defectReportCommandSchema.safeParse({
        defectReportId: id,
        contentRevisionId: id,
        category: "ambiguous_key",
        note: "Two options are defensible.",
        reportedAt: at,
        learnerResponse: "B",
      }).success,
    ).toBe(false);
  });

  it("keeps a rights-only withdrawal from changing validity", () => {
    const impact = {
      impactAssertionId: id,
      causeKind: "rights_takedown",
      impactMode: "serving_only",
      selectors: {
        contentFamilyIds: [id],
        contentRevisionIds: [],
        itemIds: [],
        formIds: [],
        mediaRevisionIds: [],
      },
      affectedScope: [],
      unaffectedScope: ["reading.r1"],
      declaredCardinality: 1,
      reasonCode: "VALIDITY.RIGHTS_COMPATIBILITY",
      effectiveAt: at,
    };
    expect(contentImpactCommandSchema.safeParse(impact).success).toBe(true);
    expect(
      contentImpactCommandSchema.safeParse({ ...impact, requestedValidity: "not_counted" }).success,
    ).toBe(false);
    expect(
      contentImpactCommandSchema.safeParse({
        ...impact,
        causeKind: "content_defect",
        impactMode: "validity_change",
        requestedValidity: "not_counted",
        affectedScope: ["reading.r1.item.3"],
        reasonCode: "VALIDITY.RESPONSE_STRUCTURALLY_INVALID",
      }).success,
    ).toBe(true);
  });

  it("accepts the two new durable job kinds and still parses a Stage 04-era envelope", () => {
    const stage04Envelope = {
      contract: { kind: "foundation", major: 1, minor: 0 },
      jobId: id,
      kind: "projection_rebuild_v1",
      semanticIdentity: "projection:scope:1",
      learnerScopeId: id,
      owner: "evidence",
      attempt: 0,
      deadline: at,
      payloadDigest: digest,
      selector: {},
    };
    expect(jobEnvelopeSchema.safeParse(stage04Envelope).success).toBe(true);
    for (const kind of ["content_publication_v1", "content_impact_recompute_v1"]) {
      expect(
        jobEnvelopeSchema.safeParse({ ...stage04Envelope, kind, owner: "content" }).success,
      ).toBe(true);
    }
    expect(
      jobEnvelopeSchema.safeParse({ ...stage04Envelope, kind: "content_regenerate_v1" }).success,
    ).toBe(false);
    expect(jobEnvelopeSchema.safeParse({ ...stage04Envelope, owner: "corpus" }).success).toBe(
      false,
    );
    // Stage 05 stays on contract major 1; an unknown major still fails closed.
    expect(
      commandEnvelopeSchema.safeParse({
        contract: { major: 2, minor: 0 },
        operationId: id,
        expectedVersion: 0,
        payload: {},
      }).success,
    ).toBe(false);
  });
});
