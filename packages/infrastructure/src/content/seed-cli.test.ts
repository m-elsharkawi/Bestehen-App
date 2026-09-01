import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  emptySeedCatalogue,
  planSeedCommand,
  runSeedCli,
  executePostgresSeedCommand,
  type SeedCatalogueState,
  type SeedPlanRequest,
  type SeedReleaseDocument,
  type SeedSqlClient,
  type SeedSqlPool,
} from "./seed-cli.js";

const occurredAt = "2026-09-01T12:00:00.000Z";

async function releaseDocument(): Promise<SeedReleaseDocument> {
  return JSON.parse(
    await readFile(new URL("../../../content/src/seed/release.json", import.meta.url), "utf8"),
  ) as SeedReleaseDocument;
}

function request(
  release: SeedReleaseDocument,
  catalogue: SeedCatalogueState,
  overrides: Partial<SeedPlanRequest> = {},
): SeedPlanRequest {
  return {
    release,
    catalogue,
    dryRun: false,
    reportPath: null,
    operationId: "operation-seed-test",
    occurredAt,
    command: "apply",
    selector: null,
    reason: null,
    ...overrides,
  };
}

describe("P05-SEED-001 seed CLI planner", () => {
  it("produces the exact dry-run report and does not mutate state", async () => {
    const release = await releaseDocument();
    const plan = planSeedCommand(request(release, emptySeedCatalogue, { dryRun: true }));
    expect(plan.nextState).toBe(emptySeedCatalogue);
    expect(plan.report).toMatchObject({
      schema: "bestehen-seed-validation-report/v1",
      command: "apply",
      dryRun: true,
      release: {
        id: release.releaseId,
        identity: "stage-05-content-v1",
        priorActiveReleaseId: null,
      },
      summary: {
        created: 16,
        superseded: 0,
        unchanged: 0,
        withdrawn: 0,
        quarantined: 0,
        rolledBack: 0,
        hardFailures: 0,
      },
    });
    const reportByRevisionId = new Map(
      plan.report.revisions.map((entry) => [entry.revisionId, entry]),
    );
    for (const entry of release.entries.filter((candidate) => candidate.intent === "serving")) {
      expect(reportByRevisionId.get(entry.revisionId)).toMatchObject({
        seedKey: entry.seedKey,
        familyId: entry.familyId,
        digest: entry.digest,
        contentClass: "C3",
        requestedLevel: "draft",
        action: "create",
        rights: {
          envelopeId: entry.rightsEnvelopeId,
          state: "current",
          actions: entry.rightsActionEvaluation,
        },
        accessibility: {
          manifestId: entry.accessibilityManifestId,
          status: "pass",
        },
        validation: { decision: "blocked", firstBlockingGate: "eligibility_brief" },
      });
    }
  });

  it("makes an unchanged second apply a no-op keyed by revision identity", async () => {
    const release = await releaseDocument();
    const first = planSeedCommand(request(release, emptySeedCatalogue));
    const second = planSeedCommand(
      request(release, first.nextState, { operationId: "operation-seed-replay" }),
    );
    expect(first.report.summary.created).toBe(16);
    expect(second.report.summary).toMatchObject({
      created: 0,
      superseded: 0,
      unchanged: 16,
      hardFailures: 0,
    });
    expect(second.nextState.revisions).toEqual(first.nextState.revisions);
    expect(second.nextState.releases).toEqual(first.nextState.releases);
    expect(second.nextState.audit).toEqual(first.nextState.audit);
    expect(second.nextState.receipts).toHaveLength(first.nextState.receipts.length + 1);
    const byRevisionId = new Map(
      second.nextState.revisions.map((revision) => [revision.revisionId, revision]),
    );
    for (const entry of release.entries.filter((candidate) => candidate.intent === "serving")) {
      expect(byRevisionId.get(entry.revisionId)?.digest).toBe(entry.digest);
    }
  });

  it("creates a successor only when the new identity names the active predecessor", async () => {
    const release = await releaseDocument();
    const first = planSeedCommand(request(release, emptySeedCatalogue));
    const original = release.entries.find((entry) => entry.seedKey === "r2-fahrgemeinschaft");
    if (!original) throw new Error("The R2 seed fixture is missing.");
    const successorRevisionId = "5db7a785-9a58-5fc1-9ae0-269d11e56be2";
    const successorDigest = "b".repeat(64);
    const successorEntry = {
      ...original,
      seedKey: "r2-fahrgemeinschaft-successor",
      revisionId: successorRevisionId,
      predecessorRevisionId: original.revisionId,
      digest: successorDigest,
    };
    const successorRelease: SeedReleaseDocument = {
      ...release,
      releaseId: "06b5b38c-d67f-5c38-b204-dffbdcb5d7bf",
      entries: release.entries.map((entry) =>
        entry.revisionId === original.revisionId ? successorEntry : entry,
      ),
    };
    const plan = planSeedCommand(
      request(successorRelease, first.nextState, { operationId: "operation-successor" }),
    );
    expect(plan.report.summary).toMatchObject({ superseded: 1, unchanged: 15, hardFailures: 0 });
    const byRevisionId = new Map(
      plan.nextState.revisions.map((revision) => [revision.revisionId, revision]),
    );
    expect(byRevisionId.get(original.revisionId)).toMatchObject({
      familyId: original.familyId,
      digest: original.digest,
      state: "superseded",
    });
    expect(byRevisionId.get(successorRevisionId)).toMatchObject({
      familyId: original.familyId,
      predecessorRevisionId: original.revisionId,
      digest: successorDigest,
      state: "active",
    });
  });

  it("refuses an in-place digest change and leaves the catalogue byte-for-byte unchanged", async () => {
    const release = await releaseDocument();
    const first = planSeedCommand(request(release, emptySeedCatalogue));
    const changed: SeedReleaseDocument = {
      ...release,
      entries: release.entries.map((entry) =>
        entry.seedKey === "r1-buerogebaeude" ? { ...entry, digest: "c".repeat(64) } : entry,
      ),
    };
    const plan = planSeedCommand(
      request(changed, first.nextState, { operationId: "operation-immutable-change" }),
    );
    expect(plan.report.summary.hardFailures).toBe(2);
    const failuresByCode = new Map(plan.report.failures.map((failure) => [failure.code, failure]));
    expect(failuresByCode.get("immutable_revision_changed")?.identity).toBe(
      changed.entries.find((entry) => entry.seedKey === "r1-buerogebaeude")?.revisionId,
    );
    expect(failuresByCode.get("immutable_release_changed")?.identity).toBe(release.releaseId);
    expect(plan.nextState).toBe(first.nextState);
  });

  it("withdraws and quarantines one exact active identity with an audit reason", async () => {
    const release = await releaseDocument();
    const seeded = planSeedCommand(request(release, emptySeedCatalogue)).nextState;
    const withdrawTarget = release.entries.find((entry) => entry.seedKey === "r1-buerogebaeude");
    const withdrawn = planSeedCommand(
      request(release, seeded, {
        command: "withdraw",
        selector: withdrawTarget?.familyId ?? null,
        reason: "VALIDITY.RIGHTS_COMPATIBILITY",
        operationId: "operation-withdraw",
      }),
    );
    expect(withdrawn.report.summary).toMatchObject({ withdrawn: 1, hardFailures: 0 });
    const withdrawnByRevisionId = new Map(
      withdrawn.nextState.revisions.map((revision) => [revision.revisionId, revision]),
    );
    expect(withdrawnByRevisionId.get(withdrawTarget?.revisionId ?? "")?.state).toBe("withdrawn");
    expect(withdrawn.nextState.audit.at(-1)).toEqual({
      operationId: "operation-withdraw",
      command: "withdraw",
      subjectId: withdrawTarget?.revisionId,
      reason: "VALIDITY.RIGHTS_COMPATIBILITY",
      occurredAt,
    });

    const quarantineTarget = release.entries.find((entry) => entry.seedKey === "r2-bibliothek");
    const quarantined = planSeedCommand(
      request(release, seeded, {
        command: "quarantine",
        selector: quarantineTarget?.revisionId ?? null,
        reason: "UNCERTAINTY.KEY_VALIDATOR_DISAGREEMENT",
        operationId: "operation-quarantine",
      }),
    );
    expect(quarantined.report.summary).toMatchObject({ quarantined: 1, hardFailures: 0 });
    const quarantinedByRevisionId = new Map(
      quarantined.nextState.revisions.map((revision) => [revision.revisionId, revision]),
    );
    expect(quarantinedByRevisionId.get(quarantineTarget?.revisionId ?? "")?.state).toBe(
      "quarantined",
    );
  });

  it("rejects free-form lifecycle reasons before changing state", async () => {
    const release = await releaseDocument();
    const seeded = planSeedCommand(request(release, emptySeedCatalogue)).nextState;
    const target = release.entries.find((entry) => entry.seedKey === "r1-buerogebaeude");
    const plan = planSeedCommand(
      request(release, seeded, {
        command: "withdraw",
        selector: target?.revisionId ?? null,
        reason: "please withdraw this",
        operationId: "invalid-free-form-reason",
      }),
    );
    const failuresByCode = new Map(plan.report.failures.map((failure) => [failure.code, failure]));
    expect(failuresByCode.get("reason_code_invalid")?.identity).toBe(target?.revisionId);
    expect(plan.nextState).toBe(seeded);
  });

  it("rolls the active pointer back without mutating historical revisions", async () => {
    const release = await releaseDocument();
    const first = planSeedCommand(request(release, emptySeedCatalogue));
    const secondRelease: SeedReleaseDocument = {
      ...release,
      releaseId: "7d99af67-a77c-5b1f-9d9d-38ae3512bf8f",
    };
    const second = planSeedCommand(
      request(secondRelease, first.nextState, { operationId: "operation-second-release" }),
    );
    expect(second.nextState.activeReleaseId).toBe(secondRelease.releaseId);
    const rollback = planSeedCommand(
      request(secondRelease, second.nextState, {
        command: "rollback",
        selector: release.releaseId,
        reason: "operator chose prior approved release",
        operationId: "operation-rollback",
      }),
    );
    expect(rollback.report.summary).toMatchObject({ rolledBack: 1, hardFailures: 0 });
    expect(rollback.nextState.activeReleaseId).toBe(release.releaseId);
    const releasesById = new Map(
      rollback.nextState.releases.map((candidate) => [candidate.releaseId, candidate]),
    );
    expect(releasesById.get(release.releaseId)?.state).toBe("active");
    expect(releasesById.get(secondRelease.releaseId)?.state).toBe("retired");
    expect(rollback.nextState.revisions).toEqual(second.nextState.revisions);
  });

  it("honours --dry-run and --report through the executable parser", async () => {
    const directory = await mkdtemp(join(tmpdir(), "bestehen-seed-cli-"));
    const reportPath = join(directory, "report.json");
    const report = await runSeedCli([
      "--dry-run",
      "--report",
      reportPath,
      "--operation-id",
      "operation-cli-parser",
      "--occurred-at",
      occurredAt,
    ]);
    expect(report.summary).toMatchObject({ created: 16, hardFailures: 0 });
    expect(JSON.parse(await readFile(reportPath, "utf8"))).toEqual(report);
  });

  it("replays and rejects conflicting operation IDs for every mutating command", async () => {
    const release = await releaseDocument();
    const applyRequest = request(release, emptySeedCatalogue, { operationId: "receipt-apply" });
    const applied = planSeedCommand(applyRequest);
    const replayedApply = planSeedCommand({ ...applyRequest, catalogue: applied.nextState });
    expect(replayedApply.report).toEqual(applied.report);
    expect(replayedApply.nextState).toBe(applied.nextState);
    const applyConflict = planSeedCommand({
      ...applyRequest,
      catalogue: applied.nextState,
      reason: "different canonical payload",
    });
    expect(applyConflict.report.failures[0]?.code).toBe("idempotency_conflict");
    expect(applyConflict.nextState).toBe(applied.nextState);

    const withdrawTarget = release.entries.find((entry) => entry.seedKey === "r1-buerogebaeude");
    const withdrawRequest = request(release, applied.nextState, {
      command: "withdraw",
      selector: withdrawTarget?.revisionId ?? null,
      reason: "VALIDITY.RIGHTS_COMPATIBILITY",
      operationId: "receipt-withdraw",
    });
    const withdrawn = planSeedCommand(withdrawRequest);
    const replayedWithdraw = planSeedCommand({
      ...withdrawRequest,
      catalogue: withdrawn.nextState,
    });
    expect(replayedWithdraw.report).toEqual(withdrawn.report);
    expect(replayedWithdraw.nextState.audit).toHaveLength(withdrawn.nextState.audit.length);
    const withdrawConflict = planSeedCommand({
      ...withdrawRequest,
      catalogue: withdrawn.nextState,
      reason: "different rights decision",
    });
    expect(withdrawConflict.report.failures[0]?.code).toBe("idempotency_conflict");
    expect(withdrawConflict.nextState).toBe(withdrawn.nextState);

    const quarantineTarget = release.entries.find((entry) => entry.seedKey === "r2-bibliothek");
    const quarantineRequest = request(release, withdrawn.nextState, {
      command: "quarantine",
      selector: quarantineTarget?.revisionId ?? null,
      reason: "UNCERTAINTY.KEY_VALIDATOR_DISAGREEMENT",
      operationId: "receipt-quarantine",
    });
    const quarantined = planSeedCommand(quarantineRequest);
    const replayedQuarantine = planSeedCommand({
      ...quarantineRequest,
      catalogue: quarantined.nextState,
    });
    expect(replayedQuarantine.report).toEqual(quarantined.report);
    expect(replayedQuarantine.nextState.audit).toHaveLength(quarantined.nextState.audit.length);
    const quarantineConflict = planSeedCommand({
      ...quarantineRequest,
      catalogue: quarantined.nextState,
      reason: "different ambiguity report",
    });
    expect(quarantineConflict.report.failures[0]?.code).toBe("idempotency_conflict");
    expect(quarantineConflict.nextState).toBe(quarantined.nextState);

    const secondRelease: SeedReleaseDocument = {
      ...release,
      releaseId: "7d99af67-a77c-5b1f-9d9d-38ae3512bf8f",
    };
    const second = planSeedCommand(
      request(secondRelease, quarantined.nextState, { operationId: "receipt-second-release" }),
    );
    const rollbackRequest = request(secondRelease, second.nextState, {
      command: "rollback",
      selector: release.releaseId,
      reason: "restore prior candidate",
      operationId: "receipt-rollback",
    });
    const rolledBack = planSeedCommand(rollbackRequest);
    const replayedRollback = planSeedCommand({
      ...rollbackRequest,
      catalogue: rolledBack.nextState,
    });
    expect(replayedRollback.report).toEqual(rolledBack.report);
    expect(replayedRollback.nextState.audit).toHaveLength(rolledBack.nextState.audit.length);
    const rollbackConflict = planSeedCommand({
      ...rollbackRequest,
      catalogue: rolledBack.nextState,
      reason: "different rollback reason",
    });
    expect(rollbackConflict.report.failures[0]?.code).toBe("idempotency_conflict");
    expect(rollbackConflict.nextState).toBe(rolledBack.nextState);
  });

  it("writes the complete draft graph through parameterized PostgreSQL statements", async () => {
    const release = await releaseDocument();
    const calls: { text: string; values: unknown[] }[] = [];
    const receipts = new Map<
      string,
      {
        target_digest: string;
        target_class: string;
        action: string;
        release: string;
        recorded_at: string;
      }
    >();
    const revisionAudit: {
      action: string;
      target_digest: string;
      release: string;
      request_id: string;
    }[] = [];
    const client: SeedSqlClient = {
      async query(text, values = []) {
        calls.push({ text, values });
        if (text.includes("FROM app.security_audit_events")) {
          if (text.includes("request_id=$1")) {
            const rows = revisionAudit.filter((event) => event.request_id === String(values[0]));
            return { rows, rowCount: rows.length };
          }
          const receipt = receipts.get(String(values[0]));
          return { rows: receipt ? [receipt] : [], rowCount: receipt ? 1 : 0 };
        }
        if (text.includes("FROM app.content_revisions cr")) return { rows: [], rowCount: 0 };
        if (text.includes("FROM app.content_releases")) return { rows: [], rowCount: 0 };
        if (text.includes("transaction_timestamp() AS occurred_at"))
          return { rows: [{ occurred_at: occurredAt }], rowCount: 1 };
        if (text.includes("SELECT digest FROM app.")) return { rows: [], rowCount: 0 };
        if (text.includes("INSERT INTO app.security_audit_events")) {
          if (text.includes("'content_revision'")) {
            revisionAudit.push({
              action: String(values[1]),
              target_digest: String(values[2]),
              request_id: String(values[3]),
              release: String(values[4]),
            });
          } else {
            receipts.set(String(values[0]), {
              target_class: "content_seed_operation",
              target_digest: String(values[2]),
              action: String(values[1]),
              release: String(values[4]),
              recorded_at: occurredAt,
            });
          }
        }
        if (text.includes("RETURNING")) return { rows: [{ id: String(values[0]) }], rowCount: 1 };
        return { rows: [], rowCount: 1 };
      },
    };
    const pool: SeedSqlPool = {
      async connect() {
        return client;
      },
    };
    const postgresRequest = {
      release,
      dryRun: false,
      reportPath: null,
      operationId: "postgres-apply",
      occurredAt,
      command: "apply" as const,
      selector: null,
      reason: null,
    };
    const report = await executePostgresSeedCommand(pool, postgresRequest);
    expect(report.summary).toMatchObject({ created: 16, hardFailures: 0 });
    const contentRevisionCalls = calls.filter((call) =>
      call.text.includes("INSERT INTO app.content_revisions"),
    );
    const itemsCalls = calls.filter((call) => call.text.includes("INSERT INTO app.content_items"));
    const keyCalls = calls.filter((call) => call.text.includes("INSERT INTO app.key_revisions"));
    expect(contentRevisionCalls).toHaveLength(release.entries.length);
    expect(itemsCalls).toHaveLength(
      release.entries.reduce((total, entry) => total + entry.revision.items.length, 0),
    );
    expect(keyCalls).toHaveLength(
      release.entries.reduce((total, entry) => total + entry.keys.length, 0),
    );
    expect(calls.some((call) => call.text.includes("INSERT INTO app.media_"))).toBe(false);
    const revisionCallById = new Map(
      contentRevisionCalls.map((call) => [String(call.values[0]), call]),
    );
    for (const entry of release.entries) {
      const call = revisionCallById.get(entry.revisionId);
      expect(call?.values[1]).toBe(entry.familyId);
      expect(call?.values[3]).toBe(
        entry.intent === "quarantine_fixture"
          ? "quarantined"
          : entry.intent === "withdrawal_fixture"
            ? "retired"
            : "candidate",
      );
      expect(JSON.parse(String(call?.values[18]))).toEqual(entry.revision.learnerPayload);
    }
    const auditReceipt = calls.find(
      (call) =>
        call.text.includes("INSERT INTO app.security_audit_events") &&
        call.text.includes("'content_seed_operation'"),
    );
    expect(auditReceipt?.text).toContain("'content_seed_operation'");
    expect(auditReceipt?.values[1]).toBe("content_seed_apply_without_active_release");
    expect(auditReceipt?.values[4]).toBe(release.releaseId);
    expect(auditReceipt?.values.some((value) => String(value).includes('"revisions"'))).toBe(false);
    expect(revisionAudit).toHaveLength(
      release.entries.filter((entry) => entry.intent === "serving").length,
    );
    const replay = await executePostgresSeedCommand(pool, postgresRequest);
    expect(replay).toEqual(report);
    const conflict = await executePostgresSeedCommand(pool, {
      ...postgresRequest,
      reason: "different payload",
    });
    expect(conflict.failures[0]?.code).toBe("idempotency_conflict");
  });

  it("replays a mixed apply report from schema-real audit facts exactly", async () => {
    const release = await releaseDocument();
    const serving = release.entries.filter((entry) => entry.intent === "serving");
    const predecessor = serving[0];
    const unchanged = serving[1];
    if (!predecessor || !unchanged) throw new Error("The mixed replay fixtures are missing.");
    const successor = {
      ...predecessor,
      revisionId: "95723a18-a46a-5c9e-a171-a4ae53147911",
      predecessorRevisionId: predecessor.revisionId,
      digest: "e".repeat(64),
    };
    const unchangedSuccessor = {
      ...unchanged,
      predecessorRevisionId: "ca761dd5-2754-5e15-aebe-8374e51b3d6f",
    };
    const mixedRelease: SeedReleaseDocument = {
      ...release,
      releaseId: "f58591d5-b4f4-5a72-a0c7-d68bba677f14",
      entries: release.entries.map((entry) =>
        entry.revisionId === predecessor.revisionId
          ? successor
          : entry.revisionId === unchanged.revisionId
            ? unchangedSuccessor
            : entry,
      ),
    };
    const priorReleaseId = "prior-stage-05-content";
    const operationId = "postgres-mixed-apply";
    const catalogue: SeedCatalogueState = {
      ...emptySeedCatalogue,
      activeReleaseId: priorReleaseId,
      revisions: [
        {
          seedKey: predecessor.seedKey,
          familyId: predecessor.familyId,
          revisionId: predecessor.revisionId,
          predecessorRevisionId: null,
          digest: predecessor.digest,
          state: "active",
        },
        {
          seedKey: unchanged.seedKey,
          familyId: unchanged.familyId,
          revisionId: unchanged.revisionId,
          predecessorRevisionId: unchangedSuccessor.predecessorRevisionId,
          digest: unchanged.digest,
          state: "active",
        },
      ],
      releases: [
        {
          releaseId: priorReleaseId,
          releaseIdentity: release.releaseIdentity,
          documentDigest: "a".repeat(64),
          predecessorReleaseId: null,
          state: "active",
        },
      ],
    };
    const expectedPlan = planSeedCommand(
      request(mixedRelease, catalogue, { operationId, occurredAt }),
    );
    expect(expectedPlan.report.summary).toMatchObject({
      created: 14,
      superseded: 1,
      unchanged: 1,
      hardFailures: 0,
    });
    const expectedByRevisionId = new Map(
      expectedPlan.report.revisions.map((revision) => [revision.revisionId, revision]),
    );
    expect(expectedByRevisionId.get(unchangedSuccessor.revisionId)).toMatchObject({
      action: "unchanged",
      currentRevisionId: unchangedSuccessor.revisionId,
      predecessorRevisionId: unchangedSuccessor.predecessorRevisionId,
    });
    const payloadDigest = expectedPlan.nextState.receipts.find(
      (receipt) => receipt.operationId === operationId,
    )?.payloadDigest;
    if (!payloadDigest) throw new Error("The mixed apply receipt digest is missing.");
    const revisionAudit = expectedPlan.report.revisions.map((revision) => ({
      action: `content_seed_apply_${revision.action}`,
      target_digest: revision.digest,
      release: mixedRelease.releaseId,
    }));
    const calls: { text: string; values: unknown[] }[] = [];
    const client: SeedSqlClient = {
      async query(text, values = []) {
        calls.push({ text, values });
        if (
          text.includes("FROM app.content_revisions") &&
          text.slice(0, text.indexOf("FROM app.content_revisions")).includes("recorded_at")
        ) {
          throw new Error("content_revisions has no recorded_at column");
        }
        if (text.includes("FROM app.security_audit_events") && text.includes("request_id=$1"))
          return { rows: revisionAudit, rowCount: revisionAudit.length };
        if (text.includes("FROM app.security_audit_events"))
          return {
            rows: [
              {
                target_digest: payloadDigest,
                target_class: "content_seed_operation",
                action: "content_seed_apply_with_active_release",
                release: priorReleaseId,
                recorded_at: occurredAt,
              },
            ],
            rowCount: 1,
          };
        if (text.includes("FROM app.content_revisions cr")) return { rows: [], rowCount: 0 };
        if (text.includes("FROM app.content_releases")) return { rows: [], rowCount: 0 };
        if (text.includes("transaction_timestamp() AS occurred_at"))
          return { rows: [{ occurred_at: occurredAt }], rowCount: 1 };
        return { rows: [], rowCount: 1 };
      },
    };
    const replay = await executePostgresSeedCommand(
      {
        async connect() {
          return client;
        },
      },
      {
        release: mixedRelease,
        dryRun: false,
        reportPath: null,
        operationId,
        occurredAt: "2099-01-01T00:00:00.000Z",
        command: "apply",
        selector: null,
        reason: null,
      },
    );
    expect(replay).toEqual(expectedPlan.report);
    expect(
      calls.some(
        (call) =>
          call.text.includes("FROM app.content_revisions") &&
          call.text
            .slice(0, call.text.indexOf("FROM app.content_revisions"))
            .includes("recorded_at"),
      ),
    ).toBe(false);
  });

  it("selects a successor draft by lineage regardless of PostgreSQL row order", async () => {
    const release = await releaseDocument();
    const predecessor = release.entries.find(
      (entry) => entry.seedKey === "r1-nachbarschaftszentrum",
    );
    if (!predecessor) throw new Error("The lineage fixture is missing.");
    const successor = {
      ...predecessor,
      revisionId: "95723a18-a46a-5c9e-a171-a4ae53147911",
      predecessorRevisionId: predecessor.revisionId,
      digest: "e".repeat(64),
    };
    const successorRelease: SeedReleaseDocument = {
      ...release,
      releaseId: "f58591d5-b4f4-5a72-a0c7-d68bba677f14",
      entries: release.entries.map((entry) =>
        entry.revisionId === predecessor.revisionId ? successor : entry,
      ),
    };
    const revisionRows = [
      {
        revision_id: predecessor.revisionId,
        family_id: predecessor.familyId,
        seed_key: predecessor.seedKey,
        predecessor_id: null,
        digest: predecessor.digest,
        approval_state: "candidate",
      },
      {
        revision_id: successor.revisionId,
        family_id: successor.familyId,
        seed_key: successor.seedKey,
        predecessor_id: predecessor.revisionId,
        digest: successor.digest,
        approval_state: "candidate",
      },
    ];
    for (const [order, rows] of [revisionRows, [...revisionRows].reverse()].entries()) {
      const calls: { text: string; values: unknown[] }[] = [];
      const releaseRows = [
        {
          id: successorRelease.releaseId,
          release_identity: successorRelease.releaseIdentity,
          digest: "a".repeat(64),
          predecessor_id: release.releaseId,
          state: "candidate",
        },
        {
          id: release.releaseId,
          release_identity: release.releaseIdentity,
          digest: "b".repeat(64),
          predecessor_id: null,
          state: "candidate",
        },
        {
          id: "unrelated-active-release",
          release_identity: "unrelated-content-line",
          digest: "c".repeat(64),
          predecessor_id: null,
          state: "active",
        },
      ];
      if (order === 1) releaseRows.reverse();
      const client: SeedSqlClient = {
        async query(text, values = []) {
          calls.push({ text, values });
          if (text.includes("FROM app.security_audit_events")) return { rows: [], rowCount: 0 };
          if (text.includes("FROM app.content_revisions cr"))
            return { rows, rowCount: rows.length };
          if (text.includes("FROM app.content_releases"))
            return { rows: releaseRows, rowCount: releaseRows.length };
          if (text.includes("transaction_timestamp() AS occurred_at"))
            return { rows: [{ occurred_at: occurredAt }], rowCount: 1 };
          if (text.includes("SELECT id FROM app.approval_decisions"))
            return { rows: [], rowCount: 0 };
          if (text.includes("RETURNING")) return { rows: [{ id: String(values[0]) }], rowCount: 1 };
          return { rows: [], rowCount: 1 };
        },
      };
      const report = await executePostgresSeedCommand(
        {
          async connect() {
            return client;
          },
        },
        {
          release: successorRelease,
          dryRun: false,
          reportPath: null,
          operationId: `postgres-lineage-${String(rows[0]?.revision_id)}`,
          occurredAt,
          command: "quarantine",
          selector: successor.familyId,
          reason: "UNCERTAINTY.KEY_VALIDATOR_DISAGREEMENT",
        },
      );
      expect(report.summary).toMatchObject({ quarantined: 1, hardFailures: 0 });
      expect(report.release.priorActiveReleaseId).toBe(successorRelease.releaseId);
      const reportsByRevisionId = new Map(
        report.revisions.map((revision) => [revision.revisionId, revision]),
      );
      expect(reportsByRevisionId.get(successor.revisionId)?.action).toBe("quarantine");
      expect(
        calls.find((call) => call.text.startsWith("UPDATE app.content_revisions"))?.values[0],
      ).toBe(successor.revisionId);
    }
  });

  it("rolls back when PostgreSQL returns conflicting immutable content for an existing identity", async () => {
    const release = await releaseDocument();
    const target = release.entries.find((entry) => entry.seedKey === "r1-nachbarschaftszentrum");
    if (!target) throw new Error("The immutable conflict fixture is missing.");
    const calls: { text: string; values: unknown[] }[] = [];
    const client: SeedSqlClient = {
      async query(text, values = []) {
        calls.push({ text, values });
        if (text.includes("FROM app.security_audit_events")) return { rows: [], rowCount: 0 };
        if (text.includes("FROM app.content_revisions cr")) return { rows: [], rowCount: 0 };
        if (text.includes("FROM app.content_releases")) return { rows: [], rowCount: 0 };
        if (text.includes("transaction_timestamp() AS occurred_at"))
          return { rows: [{ occurred_at: occurredAt }], rowCount: 1 };
        if (text.includes("FROM app.rights_envelopes") && values[0] === target.rightsEnvelopeId)
          return { rows: [{ digest: "f".repeat(64) }], rowCount: 1 };
        if (text.includes("SELECT digest FROM app.")) return { rows: [], rowCount: 0 };
        if (text.includes("RETURNING")) return { rows: [{ id: String(values[0]) }], rowCount: 1 };
        return { rows: [], rowCount: 1 };
      },
    };
    const report = await executePostgresSeedCommand(
      {
        async connect() {
          return client;
        },
      },
      {
        release,
        dryRun: false,
        reportPath: null,
        operationId: "postgres-immutable-conflict",
        occurredAt,
        command: "apply",
        selector: null,
        reason: null,
      },
    );
    const failuresByIdentity = new Map(
      report.failures.map((failure) => [failure.identity, failure]),
    );
    expect(failuresByIdentity.get(target.rightsEnvelopeId)?.code).toBe(
      "immutable_database_conflict",
    );
    expect(calls.some((call) => call.text === "ROLLBACK")).toBe(true);
    expect(calls.some((call) => call.text === "COMMIT")).toBe(false);
    expect(calls.some((call) => call.text.includes("INSERT INTO app.security_audit_events"))).toBe(
      false,
    );
  });

  it("compares non-digest immutable item fields by identity", async () => {
    const release = await releaseDocument();
    const entry = release.entries.find(
      (candidate) => candidate.seedKey === "r1-nachbarschaftszentrum",
    );
    const item = entry?.revision.items[0];
    if (!entry || !item) throw new Error("The immutable item fixture is missing.");
    const scorable = item.scorable as Readonly<Record<string, unknown>>;
    const calls: { text: string; values: unknown[] }[] = [];
    const client: SeedSqlClient = {
      async query(text, values = []) {
        calls.push({ text, values });
        if (text.includes("FROM app.security_audit_events")) return { rows: [], rowCount: 0 };
        if (text.includes("FROM app.content_revisions cr")) return { rows: [], rowCount: 0 };
        if (text.includes("FROM app.content_releases")) return { rows: [], rowCount: 0 };
        if (text.includes("transaction_timestamp() AS occurred_at"))
          return { rows: [{ occurred_at: occurredAt }], rowCount: 1 };
        if (text.includes("FROM app.content_items") && values[0] === item.contentItemId)
          return {
            rows: [
              {
                content_revision_id: entry.revisionId,
                predecessor_item_id: null,
                ordinal: 999,
                response_kind: scorable.responseKind,
                binding: item.binding,
                scorable,
              },
            ],
            rowCount: 1,
          };
        if (text.includes("RETURNING")) return { rows: [{ id: String(values[0]) }], rowCount: 1 };
        return { rows: [], rowCount: 0 };
      },
    };
    const report = await executePostgresSeedCommand(
      {
        async connect() {
          return client;
        },
      },
      {
        release,
        dryRun: false,
        reportPath: null,
        operationId: "postgres-item-conflict",
        occurredAt,
        command: "apply",
        selector: null,
        reason: null,
      },
    );
    const failuresByIdentity = new Map(
      report.failures.map((failure) => [failure.identity, failure]),
    );
    expect(failuresByIdentity.get(String(item.contentItemId))?.code).toBe(
      "immutable_database_conflict",
    );
    expect(calls.some((call) => call.text === "ROLLBACK")).toBe(true);
    expect(calls.some((call) => call.text === "COMMIT")).toBe(false);
  });

  it("refuses to promote a candidate release through PostgreSQL rollback", async () => {
    const release = await releaseDocument();
    const calls: { text: string; values: unknown[] }[] = [];
    const client: SeedSqlClient = {
      async query(text, values = []) {
        calls.push({ text, values });
        if (text.includes("FROM app.security_audit_events")) return { rows: [], rowCount: 0 };
        if (text.includes("FROM app.content_revisions cr")) return { rows: [], rowCount: 0 };
        if (text.includes("SELECT id,release_identity,digest,predecessor_id,state"))
          return {
            rows: [
              {
                id: release.releaseId,
                release_identity: release.releaseIdentity,
                digest: "a".repeat(64),
                predecessor_id: null,
                state: "candidate",
              },
            ],
            rowCount: 1,
          };
        if (text.includes("transaction_timestamp() AS occurred_at"))
          return { rows: [{ occurred_at: occurredAt }], rowCount: 1 };
        if (text === "SELECT state FROM app.content_releases WHERE id=$1")
          return { rows: [{ state: "candidate" }], rowCount: 1 };
        return { rows: [], rowCount: 1 };
      },
    };
    const report = await executePostgresSeedCommand(
      {
        async connect() {
          return client;
        },
      },
      {
        release,
        dryRun: false,
        reportPath: null,
        operationId: "postgres-candidate-rollback",
        occurredAt,
        command: "rollback",
        selector: release.releaseId,
        reason: null,
      },
    );
    expect(report.summary).toMatchObject({ rolledBack: 0, hardFailures: 1 });
    expect(report.failures[0]).toMatchObject({
      code: "immutable_database_conflict",
      identity: release.releaseId,
    });
    expect(calls.some((call) => call.text === "ROLLBACK")).toBe(true);
    expect(calls.some((call) => call.text === "COMMIT")).toBe(false);
    expect(calls.some((call) => call.text.startsWith("UPDATE app.content_releases"))).toBe(false);
  });

  it("appends withdrawal and quarantine facts without rewriting rights or learner validity", async () => {
    const release = await releaseDocument();
    const scenarios = [
      {
        command: "withdraw" as const,
        seedKey: "r1-buerogebaeude",
        reason: "VALIDITY.RIGHTS_COMPATIBILITY",
        approvalLevel: "retired",
        causeKind: "rights_takedown",
      },
      {
        command: "quarantine" as const,
        seedKey: "r2-bibliothek",
        reason: "UNCERTAINTY.KEY_VALIDATOR_DISAGREEMENT",
        approvalLevel: "quarantine",
        causeKind: "content_defect",
      },
    ];
    for (const scenario of scenarios) {
      const target = release.entries.find((entry) => entry.seedKey === scenario.seedKey);
      if (!target) throw new Error(`Missing lifecycle fixture ${scenario.seedKey}.`);
      const calls: { text: string; values: unknown[] }[] = [];
      const client: SeedSqlClient = {
        async query(text, values = []) {
          calls.push({ text, values });
          if (text.includes("FROM app.security_audit_events")) return { rows: [], rowCount: 0 };
          if (text.includes("FROM app.content_revisions cr"))
            return {
              rows: [
                {
                  revision_id: target.revisionId,
                  family_id: target.familyId,
                  seed_key: target.seedKey,
                  predecessor_id: target.predecessorRevisionId,
                  digest: target.digest,
                  approval_state: "candidate",
                },
              ],
              rowCount: 1,
            };
          if (text.includes("FROM app.content_releases"))
            return {
              rows: [
                {
                  id: release.releaseId,
                  release_identity: release.releaseIdentity,
                  digest: "a".repeat(64),
                  predecessor_id: null,
                  state: "active",
                },
              ],
              rowCount: 1,
            };
          if (text.includes("transaction_timestamp() AS occurred_at"))
            return { rows: [{ occurred_at: occurredAt }], rowCount: 1 };
          if (text.includes("SELECT id FROM app.approval_decisions"))
            return { rows: [], rowCount: 0 };
          if (text.includes("RETURNING")) return { rows: [{ id: String(values[0]) }], rowCount: 1 };
          return { rows: [], rowCount: 1 };
        },
      };
      const report = await executePostgresSeedCommand(
        {
          async connect() {
            return client;
          },
        },
        {
          release,
          dryRun: false,
          reportPath: null,
          operationId: `postgres-${scenario.command}`,
          occurredAt,
          command: scenario.command,
          selector: target.revisionId,
          reason: scenario.reason,
        },
      );
      expect(report.summary.hardFailures).toBe(0);
      const approval = calls.find((call) =>
        call.text.includes("INSERT INTO app.approval_decisions"),
      );
      expect(approval?.values[1]).toBe(target.revisionId);
      expect(approval?.values[2]).toBe(scenario.approvalLevel);
      expect(approval?.values[3]).toBe(scenario.reason);
      const impact = calls.find((call) =>
        call.text.includes("INSERT INTO app.content_impact_assertions"),
      );
      expect(impact?.values[5]).toBe(scenario.causeKind);
      expect(JSON.parse(String(impact?.values[6]))).toEqual({
        contentRevisionIds: [target.revisionId],
      });
      expect(impact?.values[7]).toBe(0);
      expect(impact?.values[11]).toBe(scenario.reason);
      expect(calls.some((call) => call.text.includes("INSERT INTO app.validity_assertions"))).toBe(
        false,
      );
      expect(
        calls.some((call) => call.text.includes("INSERT INTO app.content_impact_targets")),
      ).toBe(false);
      expect(calls.some((call) => call.text.startsWith("UPDATE app.rights_envelopes"))).toBe(false);
      if (scenario.command === "withdraw") {
        const rights = calls.find((call) => call.text.includes("INSERT INTO app.rights_envelopes"));
        expect(rights?.values[4]).toBe(target.rightsEnvelopeId);
      }
    }
  });

  it("replays a CLI retry without an explicit occurred-at timestamp", async () => {
    const directory = await mkdtemp(join(tmpdir(), "bestehen-seed-retry-"));
    const statePath = join(directory, "catalogue.json");
    const args = ["--state", statePath, "--operation-id", "cli-retry-without-time"];
    const first = await runSeedCli(args);
    const second = await runSeedCli(args);
    expect(second).toEqual(first);
    const state = JSON.parse(await readFile(statePath, "utf8")) as SeedCatalogueState;
    const receiptsByOperationId = new Map(
      state.receipts.map((receipt) => [receipt.operationId, receipt]),
    );
    expect(receiptsByOperationId.get("cli-retry-without-time")?.report).toEqual(first);
    expect(state.receipts).toHaveLength(1);
  });

  it("exposes the documented infrastructure content seed command", async () => {
    const packageDocument = JSON.parse(
      await readFile(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { readonly scripts?: Readonly<Record<string, string>> };
    expect(packageDocument.scripts?.["content:seed"]).toBe("tsx src/content/seed-cli.ts");
  });

  it("fails closed when a nested release graph is malformed", async () => {
    const release = await releaseDocument();
    const directory = await mkdtemp(join(tmpdir(), "bestehen-seed-invalid-"));
    const releasePath = join(directory, "release.json");
    const target = release.entries.find((entry) => entry.seedKey === "r2-bibliothek");
    const malformed = {
      ...release,
      entries: release.entries.map((entry) =>
        entry.revisionId === target?.revisionId
          ? { ...entry, revision: { ...entry.revision, learnerPayload: { kind: "wrong" } } }
          : entry,
      ),
    };
    await writeFile(releasePath, `${JSON.stringify(malformed)}\n`, "utf8");
    await expect(
      runSeedCli(["--dry-run", "--release", releasePath, "--operation-id", "invalid-release"]),
    ).rejects.toThrow("learnerPayload/kind");
  });

  it("refuses Training promotion without a recorded human approval command", async () => {
    const release = await releaseDocument();
    const target = release.entries.find((entry) => entry.seedKey === "r1-nachbarschaftszentrum");
    if (!target) throw new Error("The review-gate fixture is missing.");
    const unearned: SeedReleaseDocument = {
      ...release,
      entries: release.entries.map((entry) =>
        entry.revisionId === target.revisionId ? { ...entry, requestedLevel: "training" } : entry,
      ),
    };
    const plan = planSeedCommand(
      request(unearned, emptySeedCatalogue, { operationId: "unearned-training" }),
    );
    const failuresByIdentity = new Map(
      plan.report.failures.map((failure) => [failure.identity, failure]),
    );
    expect(failuresByIdentity.get(target.revisionId)?.code).toBe("unearned_seed_approval");
    expect(plan.nextState).toBe(emptySeedCatalogue);
  });
});
