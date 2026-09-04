/**
 * Unit coverage for {@link PostgresContentRepository}. `P05-IDEMPOTENCY-001`, `P05-EVIDENCE-001`
 * and `P05-CONTENT-001`, in the half that needs no database.
 *
 * The repository is driven against a recording `pg` double that answers each statement from a small
 * routing table and keeps every statement and every bound value. That buys three things a
 * database-backed test cannot state as directly:
 *
 * 1. **What was NOT executed.** A guard that refuses an input is only a guard if it refuses it
 *    *before* the first round trip, and a replay is only a replay if it performs no second write.
 *    Both are assertions over the recorded statement list.
 * 2. **What crossed the boundary.** Every bound value is inspected, so "no key, correct flag or
 *    rationale reaches the serving relation" and "no statement reads `app.key_revisions`" are
 *    checked over the whole surface rather than one method at a time.
 * 3. **Row order.** A database returns joined rows in whatever order it likes; here the order is
 *    chosen, which is how the `assertServable` release-membership defect below is pinned.
 *
 * The database-backed halves — real transactions, real constraints, real concurrency — live in
 * `postgres.integration.test.ts`.
 */

import {
  type AuthorizedScope,
  appId,
  type ContentApprovalLevel,
  contentApprovalLevels,
  exposureClasses,
} from "@bestehen/domain";
import type { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { foundationJobPolicy, jobPolicyFor } from "../jobs/index.js";
import {
  type ContentJobInput,
  type ContentReleasePublication,
  PostgresContentRepository,
  type ServingManifestIssueRequest,
  servableApprovalLevels,
} from "./content-repository.js";

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
  readonly rows: readonly Row[] | ((values: readonly unknown[]) => readonly Row[]);
}

class RecordingPool {
  public readonly queries: RecordedQuery[] = [];
  public connections = 0;
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
    const rows = route ? (typeof route.rows === "function" ? route.rows(values) : route.rows) : [];
    return { rows: [...rows], rowCount: rows.length };
  };

  public readonly connect = async (): Promise<{
    query: RecordingPool["query"];
    release: () => void;
  }> => {
    this.connections += 1;
    return { query: this.query, release: () => undefined };
  };

  /** Statements with `BEGIN`/`COMMIT`/`ROLLBACK` and the advisory locks removed. */
  public get statements(): readonly string[] {
    return this.queries
      .map((entry) => entry.text)
      .filter(
        (text) =>
          !/^(?:BEGIN|COMMIT|ROLLBACK)$/.test(text) && !text.includes("pg_advisory_xact_lock"),
      );
  }

  public matching(pattern: RegExp): readonly RecordedQuery[] {
    return this.queries.filter((entry) => pattern.test(entry.text));
  }
}

function repositoryOn(routes: readonly Route[] = []): {
  repository: PostgresContentRepository;
  recorder: RecordingPool;
} {
  const recorder = new RecordingPool(routes);
  return {
    repository: new PostgresContentRepository(recorder as unknown as Pool),
    recorder,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Fixtures
 * ---------------------------------------------------------------------------------------------- */

const scopeId = "11111111-1111-4111-8111-111111111111";
const otherScopeId = "22222222-2222-4222-8222-222222222222";
const revisionId = "33333333-3333-4333-8333-333333333333";
const familyId = "44444444-4444-4444-8444-444444444444";
const manifestId = "55555555-5555-4555-8555-555555555555";
const operationId = "66666666-6666-4666-8666-666666666666";
const decisionId = "77777777-7777-4777-8777-777777777777";
const impactId = "88888888-8888-4888-8888-888888888888";
const observationId = "99999999-9999-4999-8999-999999999999";
const jobId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const contentItemId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const keyRevisionId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

const digest = (seed: string): string => seed.repeat(64).slice(0, 64);
const keyDigest = digest("a1b2c3d4e5f6");

const scope: AuthorizedScope = {
  principalId: appId<"principal">("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"),
  learnerScopeId: appId<"learner_scope">(scopeId),
  actorKind: "owner",
  capabilities: [],
  authenticatedAt: new Date("2026-09-01T09:00:00.000Z"),
};

const issuedAt = new Date("2026-09-01T10:00:00.000Z");
const expiresAt = new Date("2026-09-01T10:45:00.000Z");

function issueRequest(
  overrides: Partial<ServingManifestIssueRequest> = {},
): ServingManifestIssueRequest {
  return {
    servingManifestId: appId<"serving_manifest">(manifestId),
    operationId: appId<"operation">(operationId),
    contentClass: "C2",
    approvalRole: "independent_b1",
    entries: [{ ordinal: 1, contentRevisionId: appId<"content_revision">(revisionId) }],
    keyRevisionDigests: [keyDigest],
    allowedConditions: { navigation: "linear" },
    learnerSafePayloadDigest: digest("f0"),
    freshnessDecision: "fresh",
    comparedFamilyRefs: [familyId],
    authorizationVersion: "authorization/v1",
    contentReleaseIdentity: "content-release/2026-09-01",
    issuedAt,
    expiresAt,
    digest: digest("e1"),
    ...overrides,
  };
}

/** One `assertServable` row. Every column is the servable value unless overridden. */
function servableRow(overrides: Row = {}): Row {
  return {
    id: revisionId,
    content_class: "C2",
    approval_level: "independent_b1",
    approval_outcome: "granted",
    rights_state: "current",
    accessibility_status: "pass",
    in_active_release: true,
    ...overrides,
  };
}

const activeScopeRoute: Route = {
  when: /FROM app\.learner_scopes ls/,
  rows: [{ next_sequence: 1 }],
};

const manifestHeadRoute: Route = {
  when: /^SELECT \* FROM app\.serving_manifests/,
  rows: [
    {
      id: manifestId,
      learner_scope_id: scopeId,
      operation_id: operationId,
      form_id: null,
      content_class: "C2",
      approval_role: "independent_b1",
      key_revision_digests: [keyDigest],
      allowed_conditions: { navigation: "linear" },
      learner_safe_payload_digest: digest("f0"),
      freshness_decision: "fresh",
      compared_family_refs: [familyId],
      authorization_version: "authorization/v1",
      content_release_identity: "content-release/2026-09-01",
      issued_at: issuedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      revocation_state: "active",
      digest: digest("e1"),
    },
  ],
};

const manifestEntriesRoute: Route = {
  when: /^SELECT ordinal,content_revision_id/,
  rows: [
    {
      ordinal: 1,
      content_revision_id: revisionId,
      content_item_id: null,
      media_revision_id: null,
    },
  ],
};

function approvalInput(overrides: Row = {}) {
  return {
    decisionId,
    subjectKind: "content_revision" as const,
    subjectId: revisionId,
    contentClass: "C2" as const,
    level: "training" as ContentApprovalLevel,
    outcome: "granted" as const,
    authorRef: "owner:author",
    validatorRef: "owner:validator",
    approverRef: "owner:approver",
    methodVersion: "content-qa-gates/v1",
    reasonCode: "VALIDITY.CONTENT_APPROVAL",
    evidenceRef: "gate-report/1",
    decidedAt: new Date("2026-09-01T08:00:00.000Z"),
    ...overrides,
  };
}

function storedApprovalRow(overrides: Row = {}): Row {
  const input = approvalInput();
  return {
    level: input.level,
    outcome: input.outcome,
    subject_kind: input.subjectKind,
    subject_id: input.subjectId,
    content_class: input.contentClass,
    author_ref: input.authorRef,
    validator_ref: input.validatorRef,
    approver_ref: input.approverRef,
    method_version: input.methodVersion,
    reason_code: input.reasonCode,
    evidence_ref: input.evidenceRef,
    decided_at: input.decidedAt.toISOString(),
    ...overrides,
  };
}

const releasePublication: ContentReleasePublication = {
  releaseId: "content-release/2026-09-01#1",
  releaseIdentity: "content-release/2026-09-01",
  digest: digest("c1"),
  entries: [{ contentRevisionId: appId<"content_revision">(revisionId) }],
  activatedAt: new Date("2026-09-01T07:00:00.000Z"),
};

function contentJob(overrides: Partial<ContentJobInput> = {}): ContentJobInput {
  return {
    jobId: appId<"job">(jobId),
    learnerScopeId: appId<"learner_scope">(scopeId),
    kind: "content_publication_v1",
    semanticIdentity: "content-release/2026-09-01#1",
    payloadDigest: digest("d1"),
    deadline: new Date("2026-09-01T12:00:00.000Z"),
    maximumAttempts: 3,
    ...overrides,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Guards that must refuse before the first round trip
 * ---------------------------------------------------------------------------------------------- */

describe("content repository input guards", () => {
  it("refuses a malformed command without opening a connection or issuing a statement", async () => {
    const cases: readonly {
      readonly name: string;
      readonly run: (repository: PostgresContentRepository) => Promise<unknown>;
      readonly expected: unknown;
    }[] = [
      {
        name: "a release with no entries",
        run: (repository) =>
          repository.publishContentRelease({ ...releasePublication, entries: [] }),
        expected: { ok: false, error: "not_available" },
      },
      {
        name: "a lease with no entries",
        run: (repository) => repository.issueServingManifest(scope, issueRequest({ entries: [] })),
        expected: { ok: false, error: "not_available" },
      },
      {
        name: "a lease that expires when it is issued",
        run: (repository) =>
          repository.issueServingManifest(scope, issueRequest({ expiresAt: issuedAt })),
        expected: { ok: false, error: "not_available" },
      },
      {
        name: "an approval missing one of the three recorded commands",
        run: (repository) => repository.appendApprovalDecision(approvalInput({ validatorRef: "" })),
        expected: { ok: false, error: "not_available" },
      },
      {
        name: "an approval at a level the class may never hold",
        run: (repository) =>
          repository.appendApprovalDecision(approvalInput({ contentClass: "C0" })),
        expected: { ok: false, error: "approval_ineligible" },
      },
      {
        name: "a serving-only impact that also requests a validity state",
        run: (repository) =>
          repository.appendImpactAssertion({
            impactAssertionId: impactId,
            incidentId: "incident/1",
            ownerContext: "Content & Publication",
            actorRef: "owner",
            authorizationVersion: "authorization/v1",
            causeKind: "rights_takedown",
            impactMode: "serving_only",
            requestedValidity: "not_counted",
            selectors: {},
            learnerScopeBound: [appId<"learner_scope">(scopeId)],
            declaredCardinality: 1,
            affectedScope: [],
            unaffectedScope: ["written", "oral"],
            reasonCode: "VALIDITY.RIGHTS_COMPATIBILITY",
            evidenceRefs: [],
            policyAndContractVersions: {},
            effectiveAt: issuedAt,
            digest: digest("b1"),
          }),
        expected: { ok: false, error: "conflict" },
      },
      {
        name: "a note beyond the bounded length",
        run: (repository) =>
          repository.appendDefectReport(scope, {
            defectReportId: impactId,
            operationId: appId<"operation">(operationId),
            contentRevisionId: appId<"content_revision">(revisionId),
            category: "other",
            note: "x".repeat(401),
            reportedAt: issuedAt,
          }),
        expected: { ok: false, error: "not_available" },
      },
    ];

    for (const testCase of cases) {
      const { repository, recorder } = repositoryOn();
      expect(await testCase.run(repository), testCase.name).toEqual(testCase.expected);
      expect(recorder.queries, testCase.name).toEqual([]);
      expect(recorder.connections, testCase.name).toBe(0);
    }
  });

  it("selects nothing at all when a selector or a scope bound is empty", async () => {
    const { repository, recorder } = repositoryOn();
    expect(await repository.resolveImpactTargets({ observationIds: [] }, [])).toEqual([]);
    expect(await repository.readExposureIndex(scope, [])).toEqual([]);
    expect(recorder.queries).toEqual([]);
  });

  it("refuses anything but a 64-character hex key digest at the serving boundary", async () => {
    const forbidden = [
      "option-a",
      "The correct answer is B because the text says so.",
      `${keyDigest}extra`,
      keyDigest.toUpperCase(),
      "",
    ];
    for (const candidate of forbidden) {
      const { repository, recorder } = repositoryOn();
      expect(
        await repository.issueServingManifest(
          scope,
          issueRequest({ keyRevisionDigests: [keyDigest, candidate] }),
        ),
        candidate,
      ).toEqual({ ok: false, error: "not_available" });
      expect(recorder.queries, candidate).toEqual([]);
    }
  });
});

/* ------------------------------------------------------------------------------------------------
 * Serving is re-decided at issuance
 * ---------------------------------------------------------------------------------------------- */

describe("serving-manifest issuance rechecks servability", () => {
  const issuanceRoutes = (
    servable: readonly Row[],
    listening: readonly Row[] = [],
  ): readonly Route[] => [
    activeScopeRoute,
    { when: /^SELECT id,digest FROM app\.serving_manifests/, rows: [] },
    { when: /^SELECT cr\.id,\s+cr\.content_class/, rows: servable },
    {
      when: /^SELECT cr\.id FROM app\.content_revisions cr JOIN app\.content_families cf/,
      rows: listening,
    },
    manifestHeadRoute,
    manifestEntriesRoute,
  ];

  it("issues a lease and stores only key digests, never key material", async () => {
    const { repository, recorder } = repositoryOn(issuanceRoutes([servableRow()]));
    const issued = await repository.issueServingManifest(scope, issueRequest());
    expect(issued.ok).toBe(true);
    if (!issued.ok) return;
    expect(issued.value.disposition).toBe("created");
    expect(issued.value.manifest.keyRevisionDigests).toEqual([keyDigest]);
    expect(issued.value.manifest.revocationState).toBe("active");

    const insert = recorder.matching(/^INSERT INTO app\.serving_manifests\(/)[0];
    expect(insert).toBeDefined();
    expect(JSON.parse(String(insert?.values[6]))).toEqual([keyDigest]);
    // No statement anywhere reads or writes the server-only key relation.
    expect(recorder.statements.some((text) => text.includes("key_revisions"))).toBe(false);
  });

  it("P05-LISTENING-001 refuses an identified Listening revision without a media validator", async () => {
    const { repository, recorder } = repositoryOn(
      issuanceRoutes([servableRow()], [{ id: revisionId }]),
    );
    expect(await repository.issueServingManifest(scope, issueRequest())).toEqual({
      ok: false,
      error: "content_unavailable",
    });
    const lookup = recorder.matching(
      /^SELECT cr\.id FROM app\.content_revisions cr JOIN app\.content_families cf/,
    );
    expect(lookup).toHaveLength(1);
    expect(lookup[0]?.values).toEqual([
      [revisionId],
      ["H1ShortAnnouncements", "H2ConversationInterview", "H3ShortFunctionalTexts"],
    ]);
    expect(recorder.matching(/^INSERT INTO app\.serving_manifests\(/)).toEqual([]);
    expect(recorder.matching(/^INSERT INTO app\.serving_manifest_entries\(/)).toEqual([]);
    expect(recorder.statements.some((text) => text.includes("key_revisions"))).toBe(false);
  });

  it("refuses a level no lease may ever cite, before it asks the database anything", async () => {
    const nonServing = contentApprovalLevels.filter(
      (level) => !servableApprovalLevels.includes(level),
    );
    expect(nonServing).toEqual(["draft", "quarantine", "retired"]);
    for (const level of nonServing) {
      const { repository, recorder } = repositoryOn(issuanceRoutes([servableRow()]));
      expect(
        await repository.issueServingManifest(scope, issueRequest({ approvalRole: level })),
        level,
      ).toEqual({ ok: false, error: "approval_ineligible" });
      expect(recorder.matching(/^SELECT cr\.id/), level).toEqual([]);
      expect(recorder.matching(/^INSERT INTO app\.serving_manifests\(/), level).toEqual([]);
    }
  });

  it("refuses a level the cited class may not hold even when the arrow itself is legal", async () => {
    // C1 reaches `independent_b1` and stops; `readiness_p4` and `gold` are C2-only.
    const { repository, recorder } = repositoryOn(issuanceRoutes([servableRow()]));
    expect(
      await repository.issueServingManifest(
        scope,
        issueRequest({ contentClass: "C1", approvalRole: "gold" }),
      ),
    ).toEqual({ ok: false, error: "approval_ineligible" });
    expect(recorder.matching(/^SELECT cr\.id/)).toEqual([]);
  });

  it("maps every failed servability check to its own refusal and writes nothing", async () => {
    const cases: readonly { readonly row: Row | undefined; readonly expected: string }[] = [
      { row: undefined, expected: "content_unavailable" },
      { row: servableRow({ in_active_release: false }), expected: "content_unavailable" },
      { row: servableRow({ content_class: "C1" }), expected: "content_unavailable" },
      { row: servableRow({ approval_outcome: "denied" }), expected: "approval_ineligible" },
      { row: servableRow({ approval_level: "training" }), expected: "approval_ineligible" },
      { row: servableRow({ approval_level: null }), expected: "approval_ineligible" },
      { row: servableRow({ rights_state: "withdrawn" }), expected: "rights_withdrawn" },
      { row: servableRow({ rights_state: "takedown" }), expected: "rights_withdrawn" },
      { row: servableRow({ accessibility_status: "blocked" }), expected: "accessibility_blocked" },
      {
        row: servableRow({ accessibility_status: "not_evaluated" }),
        expected: "accessibility_blocked",
      },
    ];
    for (const testCase of cases) {
      const { repository, recorder } = repositoryOn(
        issuanceRoutes(testCase.row ? [testCase.row] : []),
      );
      expect(
        await repository.issueServingManifest(scope, issueRequest()),
        testCase.expected,
      ).toEqual({ ok: false, error: testCase.expected });
      expect(recorder.matching(/^INSERT INTO app\.serving_manifests\(/), testCase.expected).toEqual(
        [],
      );
    }
  });

  it("asks release membership once per revision instead of joining the entry table", async () => {
    // A revision that survives a release rotation belongs to the retired release AND to the active
    // one, so joining `content_release_entries` returned two rows for one revision and whichever
    // row happened to land last decided whether the revision was servable. Membership is now a
    // correlated EXISTS, which can only produce one row per revision; the shape of the statement is
    // what makes the row-order question unaskable. The rotation itself is exercised against a real
    // database in `postgres.integration.test.ts`.
    const { repository, recorder } = repositoryOn(issuanceRoutes([servableRow()]));
    await repository.issueServingManifest(scope, issueRequest());
    const servability = recorder.matching(/^SELECT cr\.id/)[0]?.text ?? "";
    expect(servability).toContain("in_active_release");
    expect(servability).toContain("EXISTS (");
    expect(servability).not.toMatch(/JOIN app\.content_release_entries cre ON/);
  });

  it("refuses a lease for a scope that is not active or is tombstoned", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /FROM app\.learner_scopes ls/, rows: [] },
      { when: /^SELECT cr\.id/, rows: [servableRow()] },
    ]);
    expect(await repository.issueServingManifest(scope, issueRequest())).toEqual({
      ok: false,
      error: "not_available",
    });
    expect(recorder.matching(/^SELECT cr\.id/)).toEqual([]);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Idempotency — `P05-IDEMPOTENCY-001`
 * ---------------------------------------------------------------------------------------------- */

describe("an exact retry replays and a conflicting reuse is refused", () => {
  it("returns the committed lease on a reconnect and issues no second one", async () => {
    const { repository, recorder } = repositoryOn([
      activeScopeRoute,
      {
        when: /^SELECT id,digest FROM app\.serving_manifests/,
        rows: [{ id: manifestId, digest: digest("e1") }],
      },
      manifestHeadRoute,
      manifestEntriesRoute,
    ]);
    const replayed = await repository.issueServingManifest(scope, issueRequest());
    expect(replayed.ok).toBe(true);
    if (!replayed.ok) return;
    expect(replayed.value.disposition).toBe("replayed");
    expect(replayed.value.manifest.servingManifestId).toBe(manifestId);
    // A reconnect must not re-decide servability, insert a second lease or add an entry ordinal.
    expect(recorder.matching(/^SELECT cr\.id/)).toEqual([]);
    expect(recorder.matching(/^INSERT INTO app\.serving_manifest/)).toEqual([]);
  });

  it("refuses a reuse of one acquire operation under a different lease payload", async () => {
    const { repository, recorder } = repositoryOn([
      activeScopeRoute,
      {
        when: /^SELECT id,digest FROM app\.serving_manifests/,
        rows: [{ id: manifestId, digest: digest("e1") }],
      },
    ]);
    expect(
      await repository.issueServingManifest(scope, issueRequest({ digest: digest("e2") })),
    ).toEqual({ ok: false, error: "idempotency_conflict" });
    expect(recorder.matching(/^INSERT INTO app\.serving_manifest/)).toEqual([]);
  });

  it("replays an identical approval decision and refuses every altered field under the same id", async () => {
    const identical = repositoryOn([
      { when: /^SELECT level,outcome,/, rows: [storedApprovalRow()] },
    ]);
    expect(await identical.repository.appendApprovalDecision(approvalInput())).toEqual({
      ok: true,
      value: { disposition: "replayed" },
    });
    expect(identical.recorder.matching(/^INSERT INTO app\.approval_decisions\(/)).toEqual([]);

    // Every recorded field takes part. A same-id command that names a different reason, a different
    // evidence reference or a different signing chain is a conflicting reuse, not a replay.
    const altered: readonly Row[] = [
      { level: "independent_b1" },
      { outcome: "denied" },
      { subject_kind: "content_form" },
      { subject_id: familyId },
      { content_class: "C1" },
      { author_ref: "owner:someone-else" },
      { validator_ref: "owner:someone-else" },
      { approver_ref: "owner:someone-else" },
      { method_version: "content-qa-gates/v2" },
      { reason_code: "VALIDITY.RIGHTS_COMPATIBILITY" },
      { evidence_ref: "gate-report/2" },
      { decided_at: new Date("2026-09-02T08:00:00.000Z").toISOString() },
    ];
    for (const overrides of altered) {
      const { repository, recorder } = repositoryOn([
        { when: /^SELECT level,outcome,/, rows: [storedApprovalRow(overrides)] },
      ]);
      const key = Object.keys(overrides)[0] ?? "";
      expect(await repository.appendApprovalDecision(approvalInput()), key).toEqual({
        ok: false,
        error: "idempotency_conflict",
      });
      expect(recorder.matching(/^INSERT INTO app\.approval_decisions\(/), key).toEqual([]);
    }
  });

  it("replays an identical impact assertion and refuses a different one under the same id", async () => {
    const assertion = {
      impactAssertionId: impactId,
      incidentId: "incident/1",
      ownerContext: "Content & Publication",
      actorRef: "owner",
      authorizationVersion: "authorization/v1",
      causeKind: "content_defect" as const,
      impactMode: "validity_change" as const,
      requestedValidity: "not_counted" as const,
      selectors: { observationIds: [appId<"evidence_observation">(observationId)] },
      learnerScopeBound: [appId<"learner_scope">(scopeId)],
      declaredCardinality: 1,
      affectedScope: ["written"],
      unaffectedScope: ["oral"],
      reasonCode: "VALIDITY.CONTENT_APPROVAL",
      evidenceRefs: ["incident/1"],
      policyAndContractVersions: { canonicalization: "canonical-json/v1" },
      effectiveAt: issuedAt,
      digest: digest("b1"),
    };
    const replay = repositoryOn([
      {
        when: /^SELECT digest FROM app\.content_impact_assertions/,
        rows: [{ digest: digest("b1") }],
      },
    ]);
    expect(await replay.repository.appendImpactAssertion(assertion)).toEqual({
      ok: true,
      value: { disposition: "replayed" },
    });
    expect(replay.recorder.matching(/^INSERT INTO app\.content_impact_assertions\(/)).toEqual([]);

    const conflict = repositoryOn([
      {
        when: /^SELECT digest FROM app\.content_impact_assertions/,
        rows: [{ digest: digest("b2") }],
      },
    ]);
    expect(await conflict.repository.appendImpactAssertion(assertion)).toEqual({
      ok: false,
      error: "idempotency_conflict",
    });
    expect(conflict.recorder.matching(/^INSERT INTO app\.content_impact_assertions\(/)).toEqual([]);
  });

  it("replays a defect report on the same operation and refuses one that names different content", async () => {
    const report = {
      defectReportId: impactId,
      operationId: appId<"operation">(operationId),
      contentRevisionId: appId<"content_revision">(revisionId),
      category: "ambiguous_key" as const,
      note: "The two options are both defensible.",
      reportedAt: issuedAt,
    };
    const stored: Row = {
      id: impactId,
      content_revision_id: revisionId,
      content_item_id: null,
      category: "ambiguous_key",
      note: "The two options are both defensible.",
    };
    const replay = repositoryOn([
      activeScopeRoute,
      { when: /FROM app\.content_defect_reports/, rows: [stored] },
    ]);
    expect(await replay.repository.appendDefectReport(scope, report)).toEqual({
      ok: true,
      value: { disposition: "replayed", defectReportId: impactId },
    });
    expect(replay.recorder.matching(/^INSERT INTO app\.content_defect_reports\(/)).toEqual([]);

    for (const overrides of [
      { content_revision_id: familyId },
      { category: "media_defect" },
      { note: "Something else entirely." },
      { content_item_id: familyId },
    ] as const) {
      const { repository, recorder } = repositoryOn([
        activeScopeRoute,
        { when: /FROM app\.content_defect_reports/, rows: [{ ...stored, ...overrides }] },
      ]);
      const key = Object.keys(overrides)[0] ?? "";
      expect(await repository.appendDefectReport(scope, report), key).toEqual({
        ok: false,
        error: "idempotency_conflict",
      });
      expect(recorder.matching(/^INSERT INTO app\.content_defect_reports\(/), key).toEqual([]);
    }
  });

  it("replays a content job on the same semantic identity and refuses a different payload", async () => {
    const replay = repositoryOn([
      activeScopeRoute,
      { when: /^INSERT INTO app\.job_resources\(/, rows: [] },
      {
        when: /^SELECT id,payload_digest FROM app\.job_resources/,
        rows: [{ id: jobId, payload_digest: digest("d1") }],
      },
    ]);
    expect(await replay.repository.acceptContentJob(contentJob())).toEqual({
      ok: true,
      value: { disposition: "replayed", jobId },
    });

    const conflict = repositoryOn([
      activeScopeRoute,
      { when: /^INSERT INTO app\.job_resources\(/, rows: [] },
      {
        when: /^SELECT id,payload_digest FROM app\.job_resources/,
        rows: [{ id: jobId, payload_digest: digest("d2") }],
      },
    ]);
    expect(await conflict.repository.acceptContentJob(contentJob())).toEqual({
      ok: false,
      error: "idempotency_conflict",
    });
  });

  it("replays a release publication and refuses the same identity under a different digest", async () => {
    const replay = repositoryOn([
      {
        when: /^SELECT id,release_identity,state,digest FROM app\.content_releases/,
        rows: [
          {
            id: releasePublication.releaseId,
            release_identity: releasePublication.releaseIdentity,
            state: "active",
            digest: releasePublication.digest,
          },
        ],
      },
    ]);
    expect(await replay.repository.publishContentRelease(releasePublication)).toEqual({
      ok: true,
      value: { disposition: "replayed", releaseId: releasePublication.releaseId },
    });
    expect(replay.recorder.matching(/^UPDATE app\.content_releases/)).toEqual([]);
    expect(replay.recorder.matching(/^INSERT INTO app\.content_release_entries/)).toEqual([]);

    const conflict = repositoryOn([
      {
        when: /^SELECT id,release_identity,state,digest FROM app\.content_releases/,
        rows: [
          {
            id: releasePublication.releaseId,
            release_identity: releasePublication.releaseIdentity,
            state: "active",
            digest: digest("c2"),
          },
        ],
      },
    ]);
    expect(await conflict.repository.publishContentRelease(releasePublication)).toEqual({
      ok: false,
      error: "conflict",
    });
    expect(conflict.recorder.matching(/^UPDATE app\.content_releases/)).toEqual([]);
  });

  it("refuses a replay whose entry set is not the entry set that was published", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /^SELECT id,release_identity,state,digest FROM app\.content_releases/, rows: [] },
      { when: /^SELECT count\(\*\)::int AS entries/, rows: [{ entries: 2 }] },
    ]);
    expect(await repository.publishContentRelease(releasePublication)).toEqual({
      ok: false,
      error: "conflict",
    });
    expect(recorder.matching(/SET state='active'/)).toEqual([]);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Exposure — the reconnect that must not count twice
 * ---------------------------------------------------------------------------------------------- */

describe("the exposure index counts one operation once", () => {
  const exposureInput = {
    operationId: appId<"operation">(operationId),
    contentFamilyId: appId<"content_family">(familyId),
    exposureClass: "exposed_family" as const,
    trigger: "learner_visible_stimulus" as const,
    occurredAt: issuedAt,
    payloadDigest: digest("a1"),
  };

  it("claims the receipt and merges the index in one transaction", async () => {
    const { repository, recorder } = repositoryOn([
      activeScopeRoute,
      { when: /^INSERT INTO app\.operation_receipts\(/, rows: [{ operation_id: operationId }] },
      {
        when: /^INSERT INTO app\.content_exposure_index\(/,
        rows: [{ exposure_class: "exposed_family" }],
      },
    ]);
    expect(await repository.recordExposure(scope, exposureInput)).toEqual({
      ok: true,
      value: { disposition: "created", exposureClass: "exposed_family" },
    });
    const merge = recorder.matching(/^INSERT INTO app\.content_exposure_index\(/)[0];
    // The monotonic comparison reads the domain's own ordering, so a weaker later trigger cannot
    // downgrade an `answer_exposed` family back to `exposed_family`.
    expect(merge?.values[6]).toEqual([...exposureClasses]);
    expect(merge?.text).toContain(
      "occurrence_count = app.content_exposure_index.occurrence_count + 1",
    );
  });

  it("returns the committed class on a reconnect and never increments a second time", async () => {
    const { repository, recorder } = repositoryOn([
      activeScopeRoute,
      { when: /^INSERT INTO app\.operation_receipts\(/, rows: [] },
      {
        when: /^SELECT payload_digest,resource_ref FROM app\.operation_receipts/,
        rows: [{ payload_digest: digest("a1"), resource_ref: familyId }],
      },
      {
        when: /^SELECT exposure_class FROM app\.content_exposure_index/,
        rows: [{ exposure_class: "answer_exposed" }],
      },
    ]);
    expect(await repository.recordExposure(scope, exposureInput)).toEqual({
      ok: true,
      value: { disposition: "replayed", exposureClass: "answer_exposed" },
    });
    expect(recorder.matching(/^INSERT INTO app\.content_exposure_index\(/)).toEqual([]);
  });

  it("refuses a reuse of the exposure operation under a different payload or a different family", async () => {
    for (const stored of [
      { payload_digest: digest("a2"), resource_ref: familyId },
      { payload_digest: digest("a1"), resource_ref: otherScopeId },
    ]) {
      const { repository, recorder } = repositoryOn([
        activeScopeRoute,
        { when: /^INSERT INTO app\.operation_receipts\(/, rows: [] },
        {
          when: /^SELECT payload_digest,resource_ref FROM app\.operation_receipts/,
          rows: [stored],
        },
      ]);
      expect(
        await repository.recordExposure(scope, exposureInput),
        String(stored.resource_ref),
      ).toEqual({ ok: false, error: "idempotency_conflict" });
      expect(recorder.matching(/^INSERT INTO app\.content_exposure_index\(/)).toEqual([]);
    }
  });
});

/* ------------------------------------------------------------------------------------------------
 * Withdrawal stops serving and rewrites nothing
 * ---------------------------------------------------------------------------------------------- */

describe("revocation stops serving without touching history", () => {
  const revocationRoutes = (state: string): readonly Route[] => [
    {
      when: /^SELECT revocation_state FROM app\.serving_manifests/,
      rows: [{ revocation_state: state }],
    },
  ];

  it("writes the revocation state and nothing else", async () => {
    const { repository, recorder } = repositoryOn(revocationRoutes("active"));
    expect(
      await repository.revokeServingManifest(
        scope,
        appId<"serving_manifest">(manifestId),
        "revoked_after_pin",
      ),
    ).toEqual({ ok: true, value: { disposition: "created" } });

    const writes = recorder.statements.filter((text) => /^(?:UPDATE|INSERT|DELETE)/.test(text));
    expect(writes).toHaveLength(1);
    expect(writes[0]).toBe(
      "UPDATE app.serving_manifests SET revocation_state=$3 WHERE learner_scope_id=$1 AND id=$2",
    );
    // A rights-only withdrawal appends no validity assertion, touches no observation and rewrites
    // no approval. The statement list is the proof, not the doc comment.
    for (const relation of [
      "validity_assertions",
      "evidence_observations",
      "approval_decisions",
      "content_revisions",
      "objective_outcomes",
      "attempt_submissions",
    ]) {
      expect(
        recorder.statements.some((text) => text.includes(relation)),
        relation,
      ).toBe(false);
    }
  });

  it("replays an identical revocation and refuses a second, different one", async () => {
    const replay = repositoryOn(revocationRoutes("revoked_after_pin"));
    expect(
      await replay.repository.revokeServingManifest(
        scope,
        appId<"serving_manifest">(manifestId),
        "revoked_after_pin",
      ),
    ).toEqual({ ok: true, value: { disposition: "replayed" } });
    expect(replay.recorder.matching(/^UPDATE app\.serving_manifests/)).toEqual([]);

    const conflict = repositoryOn(revocationRoutes("revoked_before_start"));
    expect(
      await conflict.repository.revokeServingManifest(
        scope,
        appId<"serving_manifest">(manifestId),
        "revoked_after_pin",
      ),
    ).toEqual({ ok: false, error: "conflict" });
    expect(conflict.recorder.matching(/^UPDATE app\.serving_manifests/)).toEqual([]);
  });

  it("resolves an already-issued lease without re-deciding servability", async () => {
    const { repository, recorder } = repositoryOn([manifestHeadRoute, manifestEntriesRoute]);
    const manifest = await repository.readServingManifest(
      scope,
      appId<"serving_manifest">(manifestId),
    );
    expect(manifest?.entries).toEqual([{ ordinal: 1, contentRevisionId: revisionId }]);
    expect(manifest?.contentReleaseIdentity).toBe("content-release/2026-09-01");
    // Re-running the servable check here would let a later withdrawal erase an attempt's pinned
    // material — which is exactly the history rewrite the architecture forbids.
    expect(recorder.matching(/^SELECT cr\.id/)).toEqual([]);
    expect(recorder.matching(/rights_envelopes/)).toEqual([]);
  });

  it("reads a lease only inside the caller's own scope", async () => {
    const { repository, recorder } = repositoryOn([manifestHeadRoute, manifestEntriesRoute]);
    await repository.readServingManifest(
      { ...scope, learnerScopeId: appId<"learner_scope">(otherScopeId) },
      appId<"serving_manifest">(manifestId),
    );
    const head = recorder.matching(/^SELECT \* FROM app\.serving_manifests/)[0];
    expect(head?.text).toContain("learner_scope_id=$1");
    expect(head?.values[0]).toBe(otherScopeId);
  });

  it("resolves pinned learner material without issuing a key-bearing query", async () => {
    const entriesWithItem: Route = {
      when: /^SELECT ordinal,content_revision_id/,
      rows: [
        {
          ordinal: 1,
          content_revision_id: revisionId,
          content_item_id: contentItemId,
          media_revision_id: null,
        },
      ],
    };
    const { repository, recorder } = repositoryOn([
      manifestHeadRoute,
      entriesWithItem,
      {
        when: /^SELECT DISTINCT cr\.id AS content_revision_id/,
        rows: [
          {
            content_revision_id: revisionId,
            family_id: familyId,
            instruction: { safeContentNodes: [] },
            learner_payload: { kind: "R2DetailedSelect", questions: [] },
            progression_profile: "P2",
            task_family_kind: "R2DetailedSelect",
          },
        ],
      },
    ]);

    const material = await repository.readPinnedLearnerMaterial(
      scope,
      appId<"serving_manifest">(manifestId),
    );

    expect(material?.contentRevisionId).toBe(revisionId);
    expect(material?.itemIds).toEqual([contentItemId]);
    expect(recorder.statements.some((statement) => statement.includes("app.key_revisions"))).toBe(
      false,
    );
    expect(recorder.matching(/^SELECT DISTINCT cr\.id AS content_revision_id/)[0]?.values).toEqual([
      scopeId,
      manifestId,
    ]);
  });

  it("reads scoring material only through exact manifest-pinned key digests", async () => {
    const { repository, recorder } = repositoryOn([
      {
        when: /^SELECT item\.id AS content_item_id/,
        rows: [
          {
            content_item_id: contentItemId,
            content_revision_id: revisionId,
            binding: { kind: "select", questionId: "question-1" },
            scorable: {
              responseKind: "single_select",
              responseCardinality: { min: 1, max: 1 },
              keyRevisionId,
              scoringPolicyRef: "objective-scoring/v1",
            },
            key_revision_id: keyRevisionId,
            accepted_response_set: [{ kind: "option", optionId: "option-a" }],
            response_cardinality_min: 1,
            response_cardinality_max: 1,
            scoring_policy_ref: "objective-scoring/v1",
          },
        ],
      },
      { when: /^SELECT count\(\*\)::int AS total/, rows: [{ total: 1 }] },
    ]);

    const units = await repository.readPinnedScoringUnits(
      scope,
      appId<"serving_manifest">(manifestId),
    );

    expect(units?.[0]?.keyRevisionId).toBe(keyRevisionId);
    const keyRead = recorder.matching(/^SELECT item\.id AS content_item_id/)[0];
    expect(keyRead?.text).toContain("sm.key_revision_digests ? key.digest");
    expect(keyRead?.text).not.toMatch(/ORDER BY key\.(?:created_at|recorded_at).*DESC/);
    expect(keyRead?.values).toEqual([scopeId, manifestId]);
  });

  it("rejects an incomplete pinned key set instead of scoring a partial form", async () => {
    const { repository } = repositoryOn([
      {
        when: /^SELECT item\.id AS content_item_id/,
        rows: [
          {
            content_item_id: contentItemId,
            content_revision_id: revisionId,
            binding: {},
            scorable: {},
            key_revision_id: keyRevisionId,
            accepted_response_set: [],
            response_cardinality_min: 1,
            response_cardinality_max: 1,
            scoring_policy_ref: "objective-scoring/v1",
          },
        ],
      },
      { when: /^SELECT count\(\*\)::int AS total/, rows: [{ total: 2 }] },
    ]);

    await expect(
      repository.readPinnedScoringUnits(scope, appId<"serving_manifest">(manifestId)),
    ).resolves.toBeUndefined();
  });
});

/* ------------------------------------------------------------------------------------------------
 * Impact resolution and targets
 * ---------------------------------------------------------------------------------------------- */

describe("impact resolution is bounded and its targets are append-only", () => {
  it("bounds every selector by the named learner scopes and returns the count as it found it", async () => {
    const { repository, recorder } = repositoryOn([
      {
        when: /FROM app\.evidence_observations o/,
        rows: [
          { learner_scope_id: scopeId, observation_id: observationId },
          { learner_scope_id: scopeId, observation_id: manifestId },
        ],
      },
    ]);
    const targets = await repository.resolveImpactTargets(
      { contentFamilyIds: [appId<"content_family">(familyId)] },
      [appId<"learner_scope">(scopeId)],
    );
    // Two resolved against a declared one is a fault for `resolveSelectors` to raise; the repository
    // never trims the result to fit the declaration.
    expect(targets).toHaveLength(2);
    const query = recorder.matching(/FROM app\.evidence_observations o/)[0];
    expect(query?.text).toContain("o.learner_scope_id = ANY($1::uuid[])");
    expect(query?.values[0]).toEqual([scopeId]);
    // Both paths to an observation are reachable: the pinned manifest and the Stage 03 column.
    expect(query?.text).toContain("sme.content_revision_id");
    expect(query?.text).toContain("a.content_revision_id");
  });

  it("refuses a validity assertion on a target of a serving-only impact", async () => {
    const { repository, recorder } = repositoryOn([
      {
        when: /^SELECT impact_mode FROM app\.content_impact_assertions/,
        rows: [{ impact_mode: "serving_only" }],
      },
    ]);
    expect(
      await repository.recordImpactTargets(impactId, [
        {
          learnerScopeId: appId<"learner_scope">(scopeId),
          observationId: appId<"evidence_observation">(observationId),
          assertionId: manifestId,
          disposition: "resolved",
        },
      ]),
    ).toEqual({ ok: false, error: "conflict" });
    expect(recorder.matching(/^INSERT INTO app\.content_impact_targets\(/)).toEqual([]);
  });

  it("reports the committed total on a retry so a replay is not read as a cardinality fault", async () => {
    const inserted = repositoryOn([
      {
        when: /^SELECT impact_mode FROM app\.content_impact_assertions/,
        rows: [{ impact_mode: "validity_change" }],
      },
      {
        when: /^INSERT INTO app\.content_impact_targets\(/,
        rows: [{ observation_id: observationId }],
      },
      { when: /^SELECT count\(\*\)::int AS total/, rows: [{ total: 1 }] },
    ]);
    expect(
      await inserted.repository.recordImpactTargets(impactId, [
        {
          learnerScopeId: appId<"learner_scope">(scopeId),
          observationId: appId<"evidence_observation">(observationId),
          assertionId: manifestId,
          disposition: "resolved",
        },
      ]),
    ).toEqual({ ok: true, value: { recorded: 1, total: 1 } });

    // The retry inserts nothing — `ON CONFLICT DO NOTHING` returns no row — but the committed set is
    // still one target, and the caller can tell that apart from "resolved nothing".
    const retried = repositoryOn([
      {
        when: /^SELECT impact_mode FROM app\.content_impact_assertions/,
        rows: [{ impact_mode: "validity_change" }],
      },
      { when: /^INSERT INTO app\.content_impact_targets\(/, rows: [] },
      { when: /^SELECT count\(\*\)::int AS total/, rows: [{ total: 1 }] },
    ]);
    expect(
      await retried.repository.recordImpactTargets(impactId, [
        {
          learnerScopeId: appId<"learner_scope">(scopeId),
          observationId: appId<"evidence_observation">(observationId),
          assertionId: manifestId,
          disposition: "resolved",
        },
      ]),
    ).toEqual({ ok: true, value: { recorded: 0, total: 1 } });
  });

  it("refuses targets for an assertion that was never appended", async () => {
    const { repository } = repositoryOn([
      { when: /^SELECT impact_mode FROM app\.content_impact_assertions/, rows: [] },
    ]);
    expect(await repository.recordImpactTargets(impactId, [])).toEqual({
      ok: false,
      error: "not_available",
    });
  });
});

/* ------------------------------------------------------------------------------------------------
 * Content jobs carry the content owner and their own policy
 * ---------------------------------------------------------------------------------------------- */

describe("content jobs are audited as content jobs", () => {
  it("records the content owner and the queue's own policy revision", async () => {
    for (const kind of ["content_publication_v1", "content_impact_recompute_v1"] as const) {
      const { repository, recorder } = repositoryOn([
        activeScopeRoute,
        { when: /^INSERT INTO app\.job_resources\(/, rows: [{ id: jobId }] },
      ]);
      expect(await repository.acceptContentJob(contentJob({ kind })), kind).toEqual({
        ok: true,
        value: { disposition: "created", jobId },
      });
      const insert = recorder.matching(/^INSERT INTO app\.job_resources\(/)[0];
      expect(insert?.text, kind).toContain("'content','worker'");
      expect(insert?.values[5], kind).toBe(jobPolicyFor(kind).revision);
      expect(insert?.values[5], kind).not.toBe(foundationJobPolicy.revision);
      expect(insert?.text, kind).toContain("ON CONFLICT(learner_scope_id,kind,semantic_identity)");
    }
  });

  it("refuses a job for a scope that is not active", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /FROM app\.learner_scopes ls/, rows: [] },
    ]);
    expect(await repository.acceptContentJob(contentJob())).toEqual({
      ok: false,
      error: "not_available",
    });
    expect(recorder.matching(/^INSERT INTO app\.job_resources\(/)).toEqual([]);
  });
});

/* ------------------------------------------------------------------------------------------------
 * The approval chain
 * ---------------------------------------------------------------------------------------------- */

describe("the approval chain is append-only and gated twice", () => {
  it("starts a chain at a level `draft` reaches and cites the v1.1 registry", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /^SELECT level,outcome,/, rows: [] },
      { when: /^SELECT id,level FROM app\.approval_decisions/, rows: [] },
    ]);
    expect(await repository.appendApprovalDecision(approvalInput())).toEqual({
      ok: true,
      value: { disposition: "created" },
    });
    const insert = recorder.matching(/^INSERT INTO app\.approval_decisions\(/)[0];
    expect(insert?.values[10]).toBe("reason-registry/v1.1");
    expect(insert?.values[13]).toBeNull();
  });

  it("refuses an illegal arrow from the current head and writes nothing", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /^SELECT level,outcome,/, rows: [] },
      {
        when: /^SELECT id,level FROM app\.approval_decisions/,
        rows: [{ id: decisionId, level: "quarantine" }],
      },
    ]);
    // `quarantine` reaches `draft` and `retired` only; it never returns straight to a serving level.
    expect(await repository.appendApprovalDecision(approvalInput())).toEqual({
      ok: false,
      error: "illegal_transition",
    });
    expect(recorder.matching(/^INSERT INTO app\.approval_decisions\(/)).toEqual([]);
    expect(recorder.matching(/^UPDATE app\.content_revisions/)).toEqual([]);
  });

  it("links each decision to its predecessor and projects the level onto the Stage 03 column", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /^SELECT level,outcome,/, rows: [] },
      {
        when: /^SELECT id,level FROM app\.approval_decisions/,
        rows: [{ id: decisionId, level: "training" }],
      },
    ]);
    expect(
      await repository.appendApprovalDecision(approvalInput({ level: "independent_b1" })),
    ).toEqual({ ok: true, value: { disposition: "created", priorLevel: "training" } });
    expect(recorder.matching(/^INSERT INTO app\.approval_decisions\(/)[0]?.values[13]).toBe(
      decisionId,
    );
    expect(recorder.matching(/^UPDATE app\.content_revisions/)[0]?.values[2]).toBe("approved");
  });

  it("projects a quarantine and a retirement onto the coarser Stage 03 states", async () => {
    for (const [level, projected] of [
      ["quarantine", "quarantined"],
      ["retired", "retired"],
    ] as const) {
      const { repository, recorder } = repositoryOn([
        { when: /^SELECT level,outcome,/, rows: [] },
        {
          when: /^SELECT id,level FROM app\.approval_decisions/,
          rows: [{ id: decisionId, level: "training" }],
        },
      ]);
      expect(await repository.appendApprovalDecision(approvalInput({ level })), level).toEqual({
        ok: true,
        value: { disposition: "created", priorLevel: "training" },
      });
      expect(recorder.matching(/^UPDATE app\.content_revisions/)[0]?.values[2], level).toBe(
        projected,
      );
    }
  });

  it("records a denial without moving the revision's current decision", async () => {
    const { repository, recorder } = repositoryOn([
      { when: /^SELECT level,outcome,/, rows: [] },
      {
        when: /^SELECT id,level FROM app\.approval_decisions/,
        rows: [{ id: decisionId, level: "training" }],
      },
    ]);
    expect(
      await repository.appendApprovalDecision(
        approvalInput({ level: "independent_b1", outcome: "denied" }),
      ),
    ).toEqual({ ok: true, value: { disposition: "created", priorLevel: "training" } });
    expect(recorder.matching(/^INSERT INTO app\.approval_decisions\(/)).toHaveLength(1);
    expect(recorder.matching(/^UPDATE app\.content_revisions/)).toEqual([]);
  });

  it("reads the chain oldest first", async () => {
    const { repository, recorder } = repositoryOn([
      {
        when: /^SELECT id,level,outcome,decided_at FROM app\.approval_decisions/,
        rows: [
          {
            id: decisionId,
            level: "draft",
            outcome: "granted",
            decided_at: "2026-09-01T06:00:00.000Z",
          },
          {
            id: impactId,
            level: "training",
            outcome: "granted",
            decided_at: "2026-09-01T08:00:00.000Z",
          },
        ],
      },
    ]);
    const chain = await repository.readApprovalChain("content_revision", revisionId);
    expect(chain.map((entry) => entry.level)).toEqual(["draft", "training"]);
    expect(recorder.matching(/^SELECT id,level,outcome,decided_at/)[0]?.text).toContain(
      "ORDER BY decided_at, recorded_at, id",
    );
  });
});
