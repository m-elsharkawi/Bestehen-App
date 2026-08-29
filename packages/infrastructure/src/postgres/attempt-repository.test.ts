/**
 * Unit coverage for {@link PostgresAttemptRepository}. The attempt and evidence halves of
 * `P05-IDEMPOTENCY-001` and `P05-EVIDENCE-001` that need no database.
 *
 * The repository is driven against a recording `pg` double that answers each statement from a small
 * routing table and keeps every statement and every bound value. Four claims are far easier to
 * state here than against a real database, and three of them are claims about what did **not**
 * happen:
 *
 * 1. **The decisive-evidence time gate is unreachable, not merely empty.** Before the shaped
 *    submission point the repository must issue no statement naming `app.key_revisions` at all. An
 *    empty result set would not prove that; the recorded statement list does.
 * 2. **No elapsed timer or operator edit promotes a validity state.** Every mutating method is
 *    driven and the whole recorded statement list is checked for an `UPDATE`/`DELETE` against
 *    `app.validity_assertions`, `app.objective_outcomes` or `app.attempt_submissions`. This is a
 *    property of the file, not of one method.
 * 3. **A replay writes nothing and a conflicting reuse writes nothing.** Both are assertions over
 *    the absence of an `INSERT`.
 * 4. **Rollback on a mid-transaction failure.** A route is made to throw partway through the
 *    submission transaction; the recorded statements must end in `ROLLBACK` with no `COMMIT`.
 *
 * The database-backed halves — real constraints, the widened partition CHECK, real atomicity, real
 * concurrency — live in `postgres.integration.test.ts`.
 */

import type { AttemptConditionSummary } from "@bestehen/application";
import {
  appId,
  type AuthorizedScope,
  assistanceKinds,
  reasonRegistryRelease,
} from "@bestehen/domain";
import type { Pool } from "pg";
import { describe, expect, it } from "vitest";
import {
  type AssistanceEventInput,
  type AttemptCheckpointInput,
  type AttemptCreateInput,
  cleanEvidenceReasonCode,
  type ObjectiveSubmissionInput,
  PostgresAttemptRepository,
  projectionRebuildIdentity,
} from "./attempt-repository.js";

/* ------------------------------------------------------------------------------------------------
 * The recording double
 * ---------------------------------------------------------------------------------------------- */

type Row = Record<string, unknown>;

interface RecordedQuery {
  readonly text: string;
  readonly values: readonly unknown[];
}

interface Route {
  readonly when: RegExp;
  readonly rows?: readonly Row[] | ((values: readonly unknown[]) => readonly Row[]);
  /** Makes the matched statement fail, so a mid-transaction failure can be forced. */
  readonly throws?: { readonly code?: string; readonly message?: string };
}

class RecordingPool {
  public readonly queries: RecordedQuery[] = [];
  private readonly routes: readonly Route[];

  public constructor(routes: readonly Route[]) {
    this.routes = routes;
  }

  public readonly query = async (
    text: string,
    values: readonly unknown[] = [],
  ): Promise<{ rows: Row[]; rowCount: number }> => {
    this.queries.push({ text, values });
    const route = this.routes.find((candidate) => candidate.when.test(text));
    if (route?.throws) {
      const failure = new Error(route.throws.message ?? "synthetic failure") as Error & {
        code?: string;
      };
      if (route.throws.code) failure.code = route.throws.code;
      throw failure;
    }
    const source = route?.rows ?? [];
    const rows = typeof source === "function" ? source(values) : source;
    return { rows: [...rows], rowCount: rows.length };
  };

  public readonly connect = async (): Promise<{
    query: RecordingPool["query"];
    release: () => void;
  }> => ({ query: this.query, release: () => undefined });

  public get statements(): readonly string[] {
    return this.queries.map((entry) => entry.text);
  }

  public matching(pattern: RegExp): readonly RecordedQuery[] {
    return this.queries.filter((entry) => pattern.test(entry.text));
  }

  public only(pattern: RegExp): RecordedQuery {
    const found = this.matching(pattern);
    expect(found).toHaveLength(1);
    return found[0] as RecordedQuery;
  }
}

function repositoryOn(
  routes: readonly Route[] = [],
  registryRelease?: string,
): { repository: PostgresAttemptRepository; recorder: RecordingPool } {
  const recorder = new RecordingPool(routes);
  const pool = recorder as unknown as Pool;
  return {
    repository:
      registryRelease === undefined
        ? new PostgresAttemptRepository(pool)
        : new PostgresAttemptRepository(pool, registryRelease),
    recorder,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Fixtures
 * ---------------------------------------------------------------------------------------------- */

const scopeId = "11111111-1111-4111-8111-111111111111";
const attemptId = "22222222-2222-4222-8222-222222222222";
const manifestId = "33333333-3333-4333-8333-333333333333";
const operationId = "44444444-4444-4444-8444-444444444444";
const submissionId = "55555555-5555-4555-8555-555555555555";
const observationId = "66666666-6666-4666-8666-666666666666";
const assertionId = "77777777-7777-4777-8777-777777777777";
const occasionId = "88888888-8888-4888-8888-888888888888";
const sessionId = "99999999-9999-4999-8999-999999999999";
const activityOccurrenceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const episodeId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const revisionId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const checkpointId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const jobId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const assistanceId = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const factId = "12121212-1212-4121-8121-121212121212";
const itemAlpha = "13131313-1313-4131-8131-131313131313";
const itemBeta = "14141414-1414-4141-8141-141414141414";
const keyRevisionId = "15151515-1515-4151-8151-151515151515";

const digest = (seed: string): string => seed.repeat(64).slice(0, 64);
const responseDigest = digest("ab12cd34");
const payloadDigest = digest("9f8e7d6c");

const scope: AuthorizedScope = {
  principalId: appId<"principal">("16161616-1616-4161-8161-161616161616"),
  learnerScopeId: appId<"learner_scope">(scopeId),
  actorKind: "owner",
  capabilities: [],
  authenticatedAt: new Date("2026-09-01T09:00:00.000Z"),
};

const occurredAt = new Date("2026-09-01T10:00:00.000Z");

const cleanConditions: AttemptConditionSummary = {
  nonLearnerFaultScope: [],
  continuityLostScope: [],
  timerIntegrity: "in_context_trusted",
  independenceClass: "first_attempt",
};

function attemptRow(overrides: Row = {}): Row {
  return {
    id: attemptId,
    learner_scope_id: scopeId,
    operation_id: operationId,
    serving_manifest_id: manifestId,
    content_revision_id: revisionId,
    modality: "reading",
    direct_lane: "written",
    state: "in_progress",
    resource_version: 3,
    acknowledged_sequence: 4,
    ...overrides,
  };
}

function createInput(overrides: Partial<AttemptCreateInput> = {}): AttemptCreateInput {
  return {
    operationId: appId<"operation">(operationId),
    attemptId: appId<"attempt">(attemptId),
    servingManifestId: appId<"serving_manifest">(manifestId),
    sessionId: appId<"session">(sessionId),
    activityOccurrenceId: appId<"activity_occurrence">(activityOccurrenceId),
    episodeId: appId<"episode">(episodeId),
    contentRevisionId: appId<"content_revision">(revisionId),
    modality: "reading",
    directLane: "written",
    payloadDigest,
    occurredAt,
    ...overrides,
  };
}

function checkpointInput(overrides: Partial<AttemptCheckpointInput> = {}): AttemptCheckpointInput {
  return {
    operationId: appId<"operation">(operationId),
    checkpointId: appId<"checkpoint">(checkpointId),
    attemptId: appId<"attempt">(attemptId),
    stream: "primary",
    sequence: 5,
    expectedAttemptVersion: 3,
    payloadDigest,
    ...overrides,
  };
}

function assistanceInput(overrides: Partial<AssistanceEventInput> = {}): AssistanceEventInput {
  return {
    operationId: appId<"operation">(operationId),
    assistanceEventId: appId<"assistance_event">(assistanceId),
    attemptId: appId<"attempt">(attemptId),
    kind: "strategy_cue",
    state: "used",
    phase: "during_response",
    affectedScope: [itemAlpha],
    answerBearing: "no",
    testedCapabilityEffect: "equivalent",
    policyVersion: "assistance-policy/v1",
    occurredAt,
    ...overrides,
  };
}

function submissionInput(
  overrides: Partial<ObjectiveSubmissionInput> = {},
): ObjectiveSubmissionInput {
  return {
    operationId: appId<"operation">(operationId),
    submissionId: appId<"submission">(submissionId),
    attemptId: appId<"attempt">(attemptId),
    servingManifestId: appId<"serving_manifest">(manifestId),
    checkpointSequence: 5,
    canonicalResponse: { selections: { [itemAlpha]: "option-a" } },
    responseDigest,
    conditions: cleanConditions,
    uncapturedItemIds: [],
    outcome: {
      algorithmVersion: "objective-scoring/v1",
      scoringPolicyRef: "scoring-policy/v1",
      formAndKeyVersions: { contentReleaseIdentity: "content-release/test" },
      taskRollups: [],
      supportedScope: [itemAlpha, itemBeta],
      structurallyInvalidScope: [],
      uncapturedScope: [],
      checksum: digest("c0ffee01"),
      unitOutcomes: [
        {
          contentItemId: appId<"content_item">(itemAlpha),
          kind: "correct",
          taskRef: "task-1",
          keyRevisionId: appId<"key_revision">(keyRevisionId),
        },
        {
          contentItemId: appId<"content_item">(itemBeta),
          kind: "incorrect",
          taskRef: "task-1",
          keyRevisionId: appId<"key_revision">(keyRevisionId),
        },
      ],
    },
    occasion: {
      occasionId: appId<"independent_occasion">(occasionId),
      independenceClass: "first_attempt",
      familyRelation: "same-family",
      policyRelease: "independence/v1",
    },
    observationId: appId<"evidence_observation">(observationId),
    assertionId: appId<"validity_assertion">(assertionId),
    contentStatus: "published",
    facts: [
      {
        kind: "condition",
        factId: appId<"response_fact">(factId),
        attemptId: appId<"attempt">(attemptId),
        factType: "attempt.conditions",
        envelope: { timerIntegrity: "in_context_trusted" },
        digest: digest("11aa22bb"),
      },
    ],
    projectionRebuild: {
      jobId: appId<"job">(jobId),
      payloadDigest: digest("77dd88ee"),
      deadline: new Date("2026-09-01T11:00:00.000Z"),
      maximumAttempts: 5,
    },
    ...overrides,
  };
}

/** The happy-path routing table for a committing submission. */
function submitRoutes(overrides: readonly Route[] = []): readonly Route[] {
  return [
    ...overrides,
    { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
    { when: /INSERT INTO app\.operation_receipts/, rows: [{ operation_id: operationId }] },
    { when: /SELECT 1 FROM app\.attempts/, rows: [{ "?column?": 1 }] },
    { when: /SELECT a\.id,a\.learner_scope_id/, rows: [attemptRow()] },
    {
      when: /FROM app\.serving_manifests/,
      rows: [{ content_release_identity: "content-release/test" }],
    },
    {
      when: /INSERT INTO app\.objective_outcomes/,
      rows: [{ scored_at: "2026-09-01T10:05:00.000Z" }],
    },
    { when: /FROM app\.job_resources/, rows: [{ id: jobId }] },
  ];
}

function boundValues(query: RecordedQuery): readonly unknown[] {
  return query.values;
}

/* ------------------------------------------------------------------------------------------------
 * The decisive-evidence time gate
 * ---------------------------------------------------------------------------------------------- */

describe("P05-EVIDENCE-001 decisive evidence is time-gated", () => {
  it("never names the key relation before the shaped submission point", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /FROM app\.attempt_submissions/, rows: [] },
    ]);

    const result = await repository.readDecisiveEvidence(scope, appId<"attempt">(attemptId));

    expect(result).toEqual({ ok: false, error: "not_available" });
    // Unreachable, not merely empty: one statement, and it is the gate itself.
    expect(recorder.statements).toHaveLength(1);
    expect(recorder.matching(/app\.key_revisions/)).toHaveLength(0);
  });

  it("reads the pinned key material only once a submission is committed", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /FROM app\.attempt_submissions/, rows: [{ "?column?": 1 }] },
      {
        when: /app\.key_revisions/,
        rows: [
          {
            content_item_id: itemAlpha,
            kind: "incorrect",
            issue_code: null,
            decisive_evidence: { safeRevealSpanOrRelation: "lines 4-6" },
            distractor_rationale: { whyPlausible: "shares the surface form" },
          },
        ],
      },
    ]);

    const result = await repository.readDecisiveEvidence(scope, appId<"attempt">(attemptId));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(1);
    expect(result.value[0]?.decisiveEvidence).toEqual({ safeRevealSpanOrRelation: "lines 4-6" });
    expect(recorder.matching(/app\.key_revisions/)).toHaveLength(1);
    // The gate is still evaluated first, so the ordering is a property of the code, not of luck.
    expect(recorder.statements[0]).toMatch(/FROM app\.attempt_submissions/);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Append-only evidence
 * ---------------------------------------------------------------------------------------------- */

describe("P05-EVIDENCE-001 no path promotes or rewrites a validity state", () => {
  it("issues no UPDATE or DELETE against evidence relations from any command", async () => {
    const { repository, recorder } = repositoryOn(submitRoutes());
    await repository.submitObjectiveAttempt(scope, submissionInput());
    await repository.createAttempt(scope, createInput());
    await repository.recordCheckpoint(scope, checkpointInput());
    await repository.recordAssistance(scope, assistanceInput());
    await repository.transitionAttempt(scope, {
      attemptId: appId<"attempt">(attemptId),
      to: "checkpointed",
      expectedVersion: 3,
    });
    await repository.recordAttemptFact(scope, appId<"operation">(operationId), {
      kind: "response",
      factId: appId<"response_fact">(factId),
      attemptId: appId<"attempt">(attemptId),
      factType: "attempt.response",
      envelope: {},
      digest: digest("31ff42aa"),
    });

    expect(recorder.queries.length).toBeGreaterThan(20);
    for (const relation of [
      "app\\.validity_assertions",
      "app\\.objective_outcomes",
      "app\\.objective_unit_outcomes",
      "app\\.attempt_submissions",
    ]) {
      expect(recorder.matching(new RegExp(`UPDATE\\s+${relation}`))).toHaveLength(0);
      expect(recorder.matching(new RegExp(`DELETE\\s+FROM\\s+${relation}`))).toHaveLength(0);
    }
  });
});

/* ------------------------------------------------------------------------------------------------
 * The evidence-proposal transaction
 * ---------------------------------------------------------------------------------------------- */

describe("P05-EVIDENCE-001 the evidence-proposal transaction", () => {
  it("writes submission, outcome, units, facts, observation and assertion inside one transaction", async () => {
    const { repository, recorder } = repositoryOn(submitRoutes());

    const result = await repository.submitObjectiveAttempt(scope, submissionInput());

    expect(result.ok).toBe(true);
    const statements = recorder.statements;
    expect(statements[0]).toBe("BEGIN");
    expect(statements.at(-1)).toBe("COMMIT");
    expect(statements.filter((text) => text === "BEGIN")).toHaveLength(1);
    for (const relation of [
      /INSERT INTO app\.attempt_submissions/,
      /INSERT INTO app\.objective_outcomes/,
      /INSERT INTO app\.independent_occasions/,
      /INSERT INTO app\.evidence_observations/,
      /INSERT INTO app\.validity_assertions/,
      /INSERT INTO app\.job_resources/,
    ]) {
      expect(recorder.matching(relation)).toHaveLength(1);
    }
    expect(recorder.matching(/INSERT INTO app\.objective_unit_outcomes/)).toHaveLength(2);
    expect(recorder.matching(/INSERT INTO app\.condition_facts/)).toHaveLength(1);
  });

  it("rolls the whole proposal back when a statement fails partway through", async () => {
    const { repository, recorder } = repositoryOn(
      submitRoutes([
        {
          when: /INSERT INTO app\.evidence_observations/,
          throws: { code: "23503", message: "dangling occasion" },
        },
      ]),
    );

    const result = await repository.submitObjectiveAttempt(scope, submissionInput());

    expect(result).toEqual({ ok: false, error: "dangling_reference" });
    expect(recorder.statements).toContain("ROLLBACK");
    expect(recorder.statements).not.toContain("COMMIT");
    // The submission and outcome were attempted; the assertion, the state advance and the rebuild
    // job were never reached, and the rollback is what makes that partial write disappear.
    expect(recorder.matching(/INSERT INTO app\.attempt_submissions/)).toHaveLength(1);
    expect(recorder.matching(/INSERT INTO app\.validity_assertions/)).toHaveLength(0);
    expect(recorder.matching(/UPDATE app\.attempts SET state/)).toHaveLength(0);
    expect(recorder.matching(/INSERT INTO app\.job_resources/)).toHaveLength(0);
  });

  it("refuses the partition before the first write rather than rolling one back", async () => {
    const { repository, recorder } = repositoryOn(submitRoutes());

    const result = await repository.submitObjectiveAttempt(
      scope,
      submissionInput({
        outcome: { ...submissionInput().outcome, supportedScope: [] },
      }),
    );

    expect(result).toEqual({ ok: false, error: "not_available" });
    expect(recorder.matching(/INSERT INTO app\.attempt_submissions/)).toHaveLength(0);
    expect(recorder.matching(/INSERT INTO app\.objective_outcomes/)).toHaveLength(0);
  });

  it("mints the outcome identity here and takes the instant from the relation", async () => {
    const { repository, recorder } = repositoryOn(submitRoutes());

    const result = await repository.submitObjectiveAttempt(scope, submissionInput());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const insert = recorder.only(/INSERT INTO app\.objective_outcomes/);
    // The pure scorer returns neither, so neither may arrive from the caller.
    expect(insert.text).toMatch(/RETURNING scored_at/);
    expect(insert.text).not.toMatch(/scored_at\s*[,)]/);
    expect(boundValues(insert)[0]).toBe(result.value.submission.outcomeId);
    expect(result.value.submission.outcomeId).not.toBe(submissionId);
    expect(result.value.submission.outcomeId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(result.value.submission.scoredAt.toISOString()).toBe("2026-09-01T10:05:00.000Z");
  });

  it("returns unit outcomes in the same order the committed read does, whatever order they arrive in", async () => {
    const base = submissionInput();
    const { repository } = repositoryOn(submitRoutes());

    const result = await repository.submitObjectiveAttempt(scope, {
      ...base,
      // Reversed on the way in. The committing path must not echo this: the committed read is
      // `ORDER BY content_item_id`, and a `created` answer in a different order from the
      // `replayed` answer for the same submission reads to a client as a changed outcome.
      outcome: { ...base.outcome, unitOutcomes: [...base.outcome.unitOutcomes].reverse() },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.submission.unitOutcomes.map((unit) => unit.contentItemId)).toEqual([
      itemAlpha,
      itemBeta,
    ]);
    expect(itemAlpha < itemBeta).toBe(true);
  });

  it("derives the rebuild job identity from the submission so a replay cannot name another job", async () => {
    const { repository, recorder } = repositoryOn(submitRoutes());

    await repository.submitObjectiveAttempt(scope, submissionInput());

    const insert = recorder.only(/INSERT INTO app\.job_resources/);
    expect(boundValues(insert)[1]).toBe(
      projectionRebuildIdentity(appId<"submission">(submissionId)),
    );
    expect(insert.text).toMatch(
      /ON CONFLICT\(learner_scope_id,kind,semantic_identity\) DO NOTHING/,
    );
  });
});

/* ------------------------------------------------------------------------------------------------
 * Initial validity classification at the write site
 * ---------------------------------------------------------------------------------------------- */

describe("P05-EVIDENCE-001 initial validity is classified, never invented", () => {
  async function assertionFor(
    input: ObjectiveSubmissionInput,
    registryRelease?: string,
  ): Promise<{
    readonly state: string;
    readonly affected: readonly string[];
    readonly unaffected: readonly string[];
    readonly registry: string;
    readonly reasonCode: string;
    readonly supportedScope: readonly string[];
  }> {
    const { repository, recorder } = repositoryOn(submitRoutes(), registryRelease);
    const result = await repository.submitObjectiveAttempt(scope, input);
    expect(result.ok).toBe(true);
    const insert = recorder.only(/INSERT INTO app\.validity_assertions/);
    const observation = recorder.only(/INSERT INTO app\.evidence_observations/);
    const values = boundValues(insert);
    return {
      state: String(values[3]),
      affected: JSON.parse(String(values[4])) as readonly string[],
      unaffected: JSON.parse(String(values[5])) as readonly string[],
      registry: String(values[6]),
      reasonCode: String(values[7]),
      supportedScope: JSON.parse(String(boundValues(observation)[6])) as readonly string[],
    };
  }

  it("records a clean objective attempt as valid, citing no fault code", async () => {
    const assertion = await assertionFor(submissionInput());

    expect(assertion.state).toBe("valid");
    expect(assertion.affected).toEqual([]);
    expect(assertion.reasonCode).toBe(cleanEvidenceReasonCode);
    // Correctness is never validity: this submission contains a wrong answer and is still valid.
    expect(assertion.supportedScope).toEqual([itemAlpha, itemBeta]);
  });

  it("targets reason-registry/v1.1 by default and honours an explicit release", async () => {
    expect((await assertionFor(submissionInput())).registry).toBe(reasonRegistryRelease.id);
    expect(reasonRegistryRelease.id).toBe("reason-registry/v1.1");
    expect((await assertionFor(submissionInput(), "reason-registry/v1")).registry).toBe(
      "reason-registry/v1",
    );
  });

  it("routes an uncaptured unit through non-learner fault, never through blank", async () => {
    const base = submissionInput();
    const assertion = await assertionFor(
      submissionInput({
        uncapturedItemIds: [appId<"content_item">(itemBeta)],
        outcome: {
          ...base.outcome,
          supportedScope: [itemAlpha],
          uncapturedScope: [itemBeta],
          unitOutcomes: [base.outcome.unitOutcomes[0] as never],
        },
      }),
    );

    // The observation speaks for the lost unit too, which is the only way it can be excluded
    // rather than silently vanish; and the lost unit is affected, the learner's work is not.
    expect(assertion.supportedScope).toEqual([itemAlpha, itemBeta]);
    expect(assertion.state).toBe("partially_valid");
    expect(assertion.affected).toEqual([itemBeta]);
    expect(assertion.unaffected).toEqual([itemAlpha]);
    expect(assertion.reasonCode).toBe("FALLBACK.TECHNICAL_FAULT");
  });

  it("represents a whole-scope pending for a content quarantine after pin", async () => {
    const assertion = await assertionFor(
      submissionInput({ contentStatus: "quarantined_after_pin" }),
    );

    expect(assertion.state).toBe("pending");
    expect(assertion.affected).toEqual([itemAlpha, itemBeta]);
    // The Stage 03 CHECK rejected this shape; `20260901_052` widened only the `pending` arm.
    expect(assertion.unaffected).toEqual([]);
    expect(assertion.reasonCode).toBe("VALIDITY.CONTENT_QUARANTINED_AFTER_PIN");
  });

  it("records a lost timer as interrupted over the whole scope", async () => {
    const assertion = await assertionFor(
      submissionInput({
        conditions: { ...cleanConditions, timerIntegrity: "inconsistent" },
      }),
    );

    expect(assertion.state).toBe("interrupted");
    expect(assertion.reasonCode).toBe("VALIDITY.TIMER_INTEGRITY_LOST");
  });

  it("leaves a structurally invalid unit awaiting interpretation, never marked wrong", async () => {
    const base = submissionInput();
    const assertion = await assertionFor(
      submissionInput({
        outcome: { ...base.outcome, structurallyInvalidScope: [itemBeta] },
      }),
    );

    expect(assertion.state).toBe("pending");
    expect(assertion.affected).toEqual([itemBeta]);
    expect(assertion.unaffected).toEqual([itemAlpha]);
    expect(assertion.reasonCode).toBe("VALIDITY.RESPONSE_STRUCTURALLY_INVALID");
  });
});

/* ------------------------------------------------------------------------------------------------
 * Idempotency
 * ---------------------------------------------------------------------------------------------- */

describe("P05-IDEMPOTENCY-001 submission replay and conflicting reuse", () => {
  const committedRoutes = (receiptRow: Row): readonly Route[] => [
    { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
    { when: /INSERT INTO app\.operation_receipts/, rows: [] },
    { when: /FROM app\.operation_receipts/, rows: [receiptRow] },
    {
      when: /FROM app\.attempt_submissions s/,
      rows: [
        {
          submission_id: submissionId,
          attempt_id: attemptId,
          response_digest: responseDigest,
          outcome_id: "17171717-1717-4171-8171-171717171717",
          checksum: digest("c0ffee01"),
          scored_at: "2026-09-01T10:05:00.000Z",
          observation_id: observationId,
          learner_sequence: 42,
          assertion_id: assertionId,
          state: "valid",
          affected_scope: [],
          unaffected_scope: [itemAlpha, itemBeta],
          reason_code: cleanEvidenceReasonCode,
          reason_registry_id: reasonRegistryRelease.id,
        },
      ],
    },
    { when: /FROM app\.objective_unit_outcomes/, rows: [] },
    { when: /FROM app\.job_resources/, rows: [{ id: jobId }] },
    { when: /SELECT a\.id,a\.learner_scope_id/, rows: [attemptRow({ state: "result_available" })] },
  ];

  it("returns the whole committed record on an exact retry, and writes nothing", async () => {
    const { repository, recorder } = repositoryOn(
      committedRoutes({
        payload_digest: responseDigest,
        resource_ref: attemptId,
        result_ref: submissionId,
      }),
    );

    const result = await repository.submitObjectiveAttempt(scope, submissionInput());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.disposition).toBe("replayed");
    // Not a bare "recorded": a replay that reached nothing would be indistinguishable from this.
    expect(result.value.submission.submissionId).toBe(submissionId);
    expect(result.value.submission.validity.state).toBe("valid");
    expect(result.value.submission.projectionRebuildJobId).toBe(jobId);
    expect(recorder.matching(/INSERT INTO app\.attempt_submissions/)).toHaveLength(0);
    expect(recorder.matching(/INSERT INTO app\.objective_outcomes/)).toHaveLength(0);
    expect(recorder.matching(/INSERT INTO app\.validity_assertions/)).toHaveLength(0);
  });

  it("rejects a reuse of the key that names a different attempt, digest or submission", async () => {
    const conflicts: readonly Row[] = [
      { payload_digest: digest("00000000"), resource_ref: attemptId, result_ref: submissionId },
      { payload_digest: responseDigest, resource_ref: occasionId, result_ref: submissionId },
      { payload_digest: responseDigest, resource_ref: attemptId, result_ref: occasionId },
    ];
    for (const receipt of conflicts) {
      const { repository, recorder } = repositoryOn(committedRoutes(receipt));

      const result = await repository.submitObjectiveAttempt(scope, submissionInput());

      expect(result).toEqual({ ok: false, error: "idempotency_conflict" });
      // The other attempt's committed result is never read, let alone returned as this one's.
      expect(recorder.matching(/FROM app\.attempt_submissions s/)).toHaveLength(0);
      expect(recorder.matching(/INSERT INTO app\.attempt_submissions/)).toHaveLength(0);
    }
  });
});

describe("P05-IDEMPOTENCY-001 a reconnect never creates a second attempt", () => {
  const replayRoutes = (attemptOverrides: Row = {}): readonly Route[] => [
    { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
    { when: /INSERT INTO app\.operation_receipts/, rows: [] },
    {
      when: /FROM app\.operation_receipts/,
      rows: [{ payload_digest: payloadDigest, resource_ref: attemptId }],
    },
    {
      when: /SELECT id,session_id,activity_occurrence_id/,
      rows: [
        {
          id: attemptId,
          session_id: sessionId,
          activity_occurrence_id: activityOccurrenceId,
          episode_id: episodeId,
          content_revision_id: revisionId,
          modality: "reading",
          direct_lane: "written",
          serving_manifest_id: manifestId,
          ...attemptOverrides,
        },
      ],
    },
    { when: /SELECT a\.id,a\.learner_scope_id/, rows: [attemptRow({ state: "ready" })] },
  ];

  it("replays the committed attempt without inserting a second one", async () => {
    const { repository, recorder } = repositoryOn(replayRoutes());

    const result = await repository.createAttempt(scope, createInput());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.disposition).toBe("replayed");
    expect(result.value.attempt.attemptId).toBe(attemptId);
    expect(recorder.matching(/INSERT INTO app\.attempts/)).toHaveLength(0);
  });

  it("compares every recorded field, not only the payload digest", async () => {
    const perturbations: readonly Row[] = [
      { id: occasionId },
      { session_id: occasionId },
      { activity_occurrence_id: occasionId },
      { episode_id: occasionId },
      { content_revision_id: occasionId },
      { modality: "listening" },
      { direct_lane: "oral" },
      { serving_manifest_id: occasionId },
    ];
    for (const perturbation of perturbations) {
      const { repository, recorder } = repositoryOn(replayRoutes(perturbation));

      const result = await repository.createAttempt(scope, createInput());

      expect(result).toEqual({ ok: false, error: "idempotency_conflict" });
      expect(recorder.matching(/INSERT INTO app\.attempts/)).toHaveLength(0);
    }
  });

  it("rejects a receipt whose resource reference names a different attempt", async () => {
    const { repository } = repositoryOn([
      { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
      { when: /INSERT INTO app\.operation_receipts/, rows: [] },
      {
        when: /FROM app\.operation_receipts/,
        rows: [{ payload_digest: payloadDigest, resource_ref: occasionId }],
      },
    ]);

    expect(await repository.createAttempt(scope, createInput())).toEqual({
      ok: false,
      error: "idempotency_conflict",
    });
  });

  it("refuses to create against a revoked or expired lease", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
      { when: /INSERT INTO app\.operation_receipts/, rows: [{ operation_id: operationId }] },
      { when: /FROM app\.serving_manifests/, rows: [] },
    ]);

    expect(await repository.createAttempt(scope, createInput())).toEqual({
      ok: false,
      error: "not_available",
    });
    expect(recorder.matching(/INSERT INTO app\.attempts/)).toHaveLength(0);
    expect(recorder.only(/FROM app\.serving_manifests/).text).toMatch(
      /revocation_state='active' AND expires_at>\$3/,
    );
  });
});

describe("P05-IDEMPOTENCY-001 checkpoints", () => {
  const checkpointRoutes = (overrides: readonly Route[] = []): readonly Route[] => [
    ...overrides,
    { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
    { when: /SELECT 1 FROM app\.attempts/, rows: [{ "?column?": 1 }] },
    { when: /SELECT a\.id,a\.learner_scope_id/, rows: [attemptRow()] },
    { when: /WHERE learner_scope_id=\$1 AND operation_id=\$2/, rows: [] },
    { when: /WHERE attempt_id=\$1 AND stream=\$2 AND sequence=\$3/, rows: [] },
  ];

  it("accepts a genuinely higher coordinate exactly once", async () => {
    const { repository, recorder } = repositoryOn(checkpointRoutes());

    const result = await repository.recordCheckpoint(scope, checkpointInput());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.disposition).toBe("accepted");
    expect(recorder.matching(/INSERT INTO app\.attempt_checkpoints/)).toHaveLength(1);
  });

  it("replays the same operation without a second row or a second ordinal", async () => {
    const { repository, recorder } = repositoryOn(
      checkpointRoutes([
        {
          when: /WHERE learner_scope_id=\$1 AND operation_id=\$2/,
          rows: [
            {
              id: checkpointId,
              attempt_id: attemptId,
              stream: "primary",
              sequence: 5,
              payload_digest: payloadDigest,
              expected_attempt_version: 3,
            },
          ],
        },
      ]),
    );

    const result = await repository.recordCheckpoint(scope, checkpointInput());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.disposition).toBe("replayed");
    expect(recorder.matching(/INSERT INTO app\.attempt_checkpoints/)).toHaveLength(0);
  });

  it("rejects a reuse of the checkpoint key that agrees on the digest but not the coordinate", async () => {
    for (const perturbation of [
      { id: occasionId },
      { attempt_id: occasionId },
      { stream: "secondary" },
      { sequence: 6 },
      { expected_attempt_version: 2 },
    ]) {
      const { repository, recorder } = repositoryOn(
        checkpointRoutes([
          {
            when: /WHERE learner_scope_id=\$1 AND operation_id=\$2/,
            rows: [
              {
                id: checkpointId,
                attempt_id: attemptId,
                stream: "primary",
                sequence: 5,
                payload_digest: payloadDigest,
                expected_attempt_version: 3,
                ...perturbation,
              },
            ],
          },
        ]),
      );

      expect(await repository.recordCheckpoint(scope, checkpointInput())).toEqual({
        ok: false,
        error: "idempotency_conflict",
      });
      expect(recorder.matching(/INSERT INTO app\.attempt_checkpoints/)).toHaveLength(0);
    }
  });

  it("preserves the stored branch when a coordinate diverges, and never overwrites it", async () => {
    const { repository, recorder } = repositoryOn(
      checkpointRoutes([
        {
          when: /WHERE attempt_id=\$1 AND stream=\$2 AND sequence=\$3/,
          rows: [{ payload_digest: digest("beefbeef") }],
        },
      ]),
    );

    const result = await repository.recordCheckpoint(scope, checkpointInput());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.disposition).toBe("divergent");
    // Both branches are returned so the learner resolves before submit; last-write-wins is refused.
    expect(result.value.storedDigest).toBe(digest("beefbeef"));
    expect(recorder.matching(/INSERT INTO app\.attempt_checkpoints/)).toHaveLength(0);
    expect(recorder.matching(/UPDATE app\.attempt_checkpoints/)).toHaveLength(0);
  });

  it("ignores a sequence at or below the acknowledged one", async () => {
    const { repository, recorder } = repositoryOn(checkpointRoutes());

    const result = await repository.recordCheckpoint(scope, checkpointInput({ sequence: 4 }));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.disposition).toBe("stale");
    expect(recorder.matching(/INSERT INTO app\.attempt_checkpoints/)).toHaveLength(0);
  });

  it("refuses a stale expected attempt version", async () => {
    const { repository } = repositoryOn(checkpointRoutes());

    expect(
      await repository.recordCheckpoint(scope, checkpointInput({ expectedAttemptVersion: 2 })),
    ).toEqual({ ok: false, error: "conflict" });
  });

  it("refuses a checkpoint against an attempt that is no longer running", async () => {
    const { repository } = repositoryOn(
      checkpointRoutes([
        { when: /SELECT a\.id,a\.learner_scope_id/, rows: [attemptRow({ state: "submitted" })] },
      ]),
    );

    expect(await repository.recordCheckpoint(scope, checkpointInput())).toEqual({
      ok: false,
      error: "illegal_transition",
    });
  });

  it("reads the acknowledged sequence with a correlated subquery, never a join", async () => {
    const { repository, recorder } = repositoryOn(checkpointRoutes());
    await repository.recordCheckpoint(scope, checkpointInput());

    const projection = recorder.matching(/SELECT a\.id,a\.learner_scope_id/)[0];
    expect(projection?.text).toMatch(/SELECT MAX\(c\.sequence\) FROM app\.attempt_checkpoints c/);
    // A LEFT JOIN would return one row per checkpoint and make the answer depend on row order.
    expect(projection?.text).not.toMatch(/JOIN/);
  });
});

describe("P05-IDEMPOTENCY-001 assistance events", () => {
  const assistanceRoutes = (stored?: Row): readonly Route[] => [
    { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
    { when: /INSERT INTO app\.assistance_events/, rows: stored ? [] : [{ id: assistanceId }] },
    { when: /SELECT id,attempt_id,kind,state,phase/, rows: stored ? [stored] : [] },
  ];

  const storedRow = (overrides: Row = {}): Row => ({
    id: assistanceId,
    attempt_id: attemptId,
    kind: "strategy_cue",
    state: "used",
    phase: "during_response",
    affected_scope: [itemAlpha],
    answer_bearing: "no",
    tested_capability_effect: "equivalent",
    policy_version: "assistance-policy/v1",
    occurred_at: occurredAt.toISOString(),
    ...overrides,
  });

  it("records an assistance event and touches no outcome or assertion", async () => {
    const { repository, recorder } = repositoryOn(assistanceRoutes());

    expect(await repository.recordAssistance(scope, assistanceInput())).toEqual({
      ok: true,
      value: { disposition: "created" },
    });
    expect(recorder.matching(/app\.objective_outcomes|app\.validity_assertions/)).toHaveLength(0);
  });

  it("replays an identical event", async () => {
    const { repository } = repositoryOn(assistanceRoutes(storedRow()));

    expect(await repository.recordAssistance(scope, assistanceInput())).toEqual({
      ok: true,
      value: { disposition: "replayed" },
    });
  });

  it("rejects a conflicting reuse on any recorded field", async () => {
    const perturbations: readonly Row[] = [
      { id: occasionId },
      { attempt_id: occasionId },
      { kind: "answer_narrowing" },
      { state: "offered" },
      { phase: "after_submission" },
      { affected_scope: [itemBeta] },
      { answer_bearing: "yes" },
      { tested_capability_effect: "altering" },
      { policy_version: "assistance-policy/v2" },
      { occurred_at: "2026-09-01T10:30:00.000Z" },
    ];
    expect(perturbations).toHaveLength(10);
    for (const perturbation of perturbations) {
      const { repository } = repositoryOn(assistanceRoutes(storedRow(perturbation)));
      expect(await repository.recordAssistance(scope, assistanceInput())).toEqual({
        ok: false,
        error: "idempotency_conflict",
      });
    }
    expect(assistanceKinds).toContain("answer_narrowing");
  });
});

describe("P05-IDEMPOTENCY-001 attempt facts never burn a second ordinal", () => {
  const factInput = {
    kind: "exposure" as const,
    factId: appId<"response_fact">(factId),
    attemptId: appId<"attempt">(attemptId),
    factType: "attempt.exposure",
    envelope: { exposureClass: "exposed_family" },
    digest: digest("aa11bb22"),
  };

  it("advances the learner sequence exactly once on a create", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
      { when: /INSERT INTO app\.operation_receipts/, rows: [{ operation_id: operationId }] },
    ]);

    expect(
      await repository.recordAttemptFact(scope, appId<"operation">(operationId), factInput),
    ).toEqual({ ok: true, value: { disposition: "created", learnerSequence: 41 } });
    expect(boundValues(recorder.only(/INSERT INTO app\.exposure_facts/)).at(-1)).toBe(41);
    expect(boundValues(recorder.only(/UPDATE app\.learner_scopes/))[1]).toBe(42);
  });

  it("returns the committed ordinal on a reconnect and advances nothing", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
      { when: /INSERT INTO app\.operation_receipts/, rows: [] },
      {
        when: /FROM app\.operation_receipts/,
        rows: [{ payload_digest: factInput.digest, resource_ref: attemptId, result_ref: factId }],
      },
      { when: /FROM app\.exposure_facts/, rows: [{ learner_sequence: 12 }] },
    ]);

    expect(
      await repository.recordAttemptFact(scope, appId<"operation">(operationId), factInput),
    ).toEqual({ ok: true, value: { disposition: "replayed", learnerSequence: 12 } });
    expect(recorder.matching(/INSERT INTO app\.exposure_facts/)).toHaveLength(0);
    expect(recorder.matching(/UPDATE app\.learner_scopes/)).toHaveLength(0);
  });

  it("rejects a reuse naming a different attempt or a different fact", async () => {
    for (const receipt of [
      { payload_digest: factInput.digest, resource_ref: occasionId, result_ref: factId },
      { payload_digest: factInput.digest, resource_ref: attemptId, result_ref: occasionId },
      { payload_digest: digest("00000000"), resource_ref: attemptId, result_ref: factId },
    ]) {
      const { repository, recorder } = repositoryOn([
        { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
        { when: /INSERT INTO app\.operation_receipts/, rows: [] },
        { when: /FROM app\.operation_receipts/, rows: [receipt] },
      ]);

      expect(
        await repository.recordAttemptFact(scope, appId<"operation">(operationId), factInput),
      ).toEqual({ ok: false, error: "idempotency_conflict" });
      expect(recorder.matching(/FROM app\.exposure_facts/)).toHaveLength(0);
    }
  });
});

/* ------------------------------------------------------------------------------------------------
 * The submission_unknown precondition
 * ---------------------------------------------------------------------------------------------- */

describe("P05-RECOVERY-001 submission_unknown is settled by a query, not by a guess", () => {
  const transitionRoutes = (state: string, committed: readonly Row[]): readonly Route[] => [
    { when: /SELECT ls\.next_sequence/, rows: [{ next_sequence: 41 }] },
    {
      when: /SELECT state,resource_version FROM app\.attempts/,
      rows: [{ state, resource_version: 3 }],
    },
    { when: /SELECT 1 FROM app\.attempt_submissions/, rows: committed },
    { when: /SELECT a\.id,a\.learner_scope_id/, rows: [attemptRow({ state: "submitted" })] },
  ];

  it("refuses to reopen an attempt whose submission did commit", async () => {
    const { repository, recorder } = repositoryOn(
      transitionRoutes("submission_unknown", [{ "?column?": 1 }]),
    );

    expect(
      await repository.transitionAttempt(scope, {
        attemptId: appId<"attempt">(attemptId),
        to: "in_progress",
        expectedVersion: 3,
      }),
    ).toEqual({ ok: false, error: "submission_committed" });
    expect(recorder.matching(/UPDATE app\.attempts SET state/)).toHaveLength(0);
  });

  it("reopens an attempt only when no submission receipt exists", async () => {
    const { repository, recorder } = repositoryOn(transitionRoutes("submission_unknown", []));

    const result = await repository.transitionAttempt(scope, {
      attemptId: appId<"attempt">(attemptId),
      to: "in_progress",
      expectedVersion: 3,
    });

    expect(result.ok).toBe(true);
    expect(recorder.matching(/UPDATE app\.attempts SET state/)).toHaveLength(1);
  });

  it("refuses to claim a submission that never committed", async () => {
    const { repository, recorder } = repositoryOn(transitionRoutes("submission_unknown", []));

    expect(
      await repository.transitionAttempt(scope, {
        attemptId: appId<"attempt">(attemptId),
        to: "submitted",
        expectedVersion: 3,
      }),
    ).toEqual({ ok: false, error: "conflict" });
    expect(recorder.matching(/UPDATE app\.attempts SET state/)).toHaveLength(0);
  });

  it("refuses an arrow the state machine does not draw, and a terminal attempt entirely", async () => {
    for (const [state, to] of [
      ["ready", "submitted"],
      ["result_available", "in_progress"],
      ["interrupted", "in_progress"],
    ] as const) {
      const { repository, recorder } = repositoryOn(transitionRoutes(state, []));
      expect(
        await repository.transitionAttempt(scope, {
          attemptId: appId<"attempt">(attemptId),
          to,
          expectedVersion: 3,
        }),
      ).toEqual({ ok: false, error: "illegal_transition" });
      expect(recorder.matching(/UPDATE app\.attempts SET state/)).toHaveLength(0);
    }
  });

  it("refuses a submission from a state that is not submittable", async () => {
    const { repository, recorder } = repositoryOn(
      submitRoutes([
        { when: /SELECT a\.id,a\.learner_scope_id/, rows: [attemptRow({ state: "ready" })] },
      ]),
    );

    expect(await repository.submitObjectiveAttempt(scope, submissionInput())).toEqual({
      ok: false,
      error: "illegal_transition",
    });
    expect(recorder.matching(/INSERT INTO app\.attempt_submissions/)).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Scope fencing and error mapping
 * ---------------------------------------------------------------------------------------------- */

describe("attempt repository scope fencing and failure mapping", () => {
  it("refuses every command on a tombstoned or inactive scope before writing", async () => {
    const { repository, recorder } = repositoryOn([{ when: /SELECT ls\.next_sequence/, rows: [] }]);

    expect(await repository.createAttempt(scope, createInput())).toEqual({
      ok: false,
      error: "not_available",
    });
    expect(await repository.submitObjectiveAttempt(scope, submissionInput())).toEqual({
      ok: false,
      error: "not_available",
    });
    expect(await repository.recordAssistance(scope, assistanceInput())).toEqual({
      ok: false,
      error: "not_available",
    });
    expect(recorder.matching(/INSERT INTO/)).toHaveLength(0);
    expect(recorder.matching(/SELECT ls\.next_sequence/)).toHaveLength(3);
    expect(recorder.matching(/SELECT ls\.next_sequence/)[0]?.text).toMatch(
      /app\.learner_tombstones/,
    );
  });

  it("maps a partition CHECK violation onto partition_invalid rather than swallowing it", async () => {
    const { repository } = repositoryOn(
      submitRoutes([{ when: /INSERT INTO app\.validity_assertions/, throws: { code: "23514" } }]),
    );

    expect(await repository.submitObjectiveAttempt(scope, submissionInput())).toEqual({
      ok: false,
      error: "partition_invalid",
    });
  });

  it("lets an unexpected database error propagate instead of disguising it as a result", async () => {
    const { repository } = repositoryOn(
      submitRoutes([
        {
          when: /INSERT INTO app\.objective_outcomes/,
          throws: { code: "57014", message: "cancelled" },
        },
      ]),
    );

    await expect(repository.submitObjectiveAttempt(scope, submissionInput())).rejects.toThrow(
      "cancelled",
    );
  });

  it("fences every read and write on the learner scope", async () => {
    const { repository, recorder } = repositoryOn(submitRoutes());
    await repository.submitObjectiveAttempt(scope, submissionInput());
    await repository.readAttempt(scope, appId<"attempt">(attemptId));
    await repository.readCheckpoints(scope, appId<"attempt">(attemptId));

    for (const query of recorder.queries) {
      if (/^(?:BEGIN|COMMIT|ROLLBACK)$/.test(query.text)) continue;
      // Two statements are keyed by the scope's own primary key or by an already-fenced
      // coordinate, so they carry no `learner_scope_id` predicate and are exempt by inspection.
      if (/app\.attempt_checkpoints\s+WHERE attempt_id=/.test(query.text)) continue;
      if (/UPDATE app\.learner_scopes SET next_sequence=\$2.+WHERE id=\$1/.test(query.text)) {
        continue;
      }
      expect(query.text).toMatch(/learner_scope_id/);
    }
  });
});
