import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  emptySeedCatalogue,
  planSeedCommand,
  runSeedCli,
  type SeedCatalogueState,
  type SeedPlanRequest,
  type SeedReleaseDocument,
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
        requestedLevel: "training",
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
        validation: { decision: "publishable", firstBlockingGate: null },
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
    expect(second.nextState).toEqual(first.nextState);
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
    const plan = planSeedCommand(request(changed, first.nextState));
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
        reason: "rights test withdrawal",
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
      reason: "rights test withdrawal",
      occurredAt,
    });

    const quarantineTarget = release.entries.find((entry) => entry.seedKey === "r2-bibliothek");
    const quarantined = planSeedCommand(
      request(release, seeded, {
        command: "quarantine",
        selector: quarantineTarget?.revisionId ?? null,
        reason: "confirmed ambiguous item",
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

  it("rolls the active pointer back without mutating historical revisions", async () => {
    const release = await releaseDocument();
    const first = planSeedCommand(request(release, emptySeedCatalogue));
    const secondRelease: SeedReleaseDocument = {
      ...release,
      releaseId: "7d99af67-a77c-5b1f-9d9d-38ae3512bf8f",
    };
    const second = planSeedCommand(request(secondRelease, first.nextState));
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
});
