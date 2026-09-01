/**
 * Package-neutral Stage 05 seed planner and CLI.
 *
 * Infrastructure may not import `@bestehen/content`. The typed content package therefore emits a
 * strict JSON release document and this module consumes only that data contract. The separation is
 * useful: a malformed document cannot borrow compile-time trust from the package that produced it.
 */

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";

export type SeedCommand = "apply" | "withdraw" | "quarantine" | "rollback";
export type SeedDiffAction =
  | "create"
  | "supersede"
  | "unchanged"
  | "withdraw"
  | "quarantine"
  | "rollback";

export interface SeedGateResult {
  readonly gate: string;
  readonly ordinal: number;
  readonly status: "pass" | "blocked" | "not_evaluated" | "not_applicable";
  readonly gateVersion: string;
  readonly findings: readonly {
    readonly code: string;
    readonly pointer: string;
    readonly detail: string;
    readonly requiresQuarantine: boolean;
  }[];
}

export interface SeedReleaseEntryDocument {
  readonly seedKey: string;
  readonly intent: "serving" | "quarantine_fixture" | "withdrawal_fixture";
  readonly familyId: string;
  readonly taskFamily: string;
  readonly revisionId: string;
  readonly predecessorRevisionId: string | null;
  readonly digest: string;
  readonly requestedLevel: string;
  readonly contentClass: "C3";
  readonly rightsState: "current" | "superseded" | "withdrawn" | "takedown";
  readonly rightsEnvelopeId: string;
  readonly rightsActionEvaluation: {
    readonly display: string;
    readonly cache: string;
    readonly downloadOffline: string;
  };
  readonly accessibilityManifestId: string;
  readonly accessibilityGate: {
    readonly status: "pass" | "blocked";
    readonly findings: readonly unknown[];
    readonly narrowedClaims: readonly unknown[];
  };
  readonly keyRevisionIds: readonly string[];
  readonly mediaRevisionIds: readonly string[];
  readonly validation: {
    readonly decision: "publishable" | "blocked" | "quarantine_required";
    readonly requestedLevel: string;
    readonly firstBlockingGate?: string;
    readonly gateResults: readonly SeedGateResult[];
    readonly findings: readonly SeedGateResult["findings"][number][];
  };
}

export interface SeedReleaseDocument {
  readonly schema: "bestehen-seed-release/v1";
  readonly releaseId: string;
  readonly releaseIdentity: string;
  readonly generatedFrom: "typed-seed-source";
  readonly entries: readonly SeedReleaseEntryDocument[];
  readonly audio: readonly unknown[];
}

export interface SeedCatalogueRevision {
  readonly seedKey: string;
  readonly familyId: string;
  readonly revisionId: string;
  readonly predecessorRevisionId: string | null;
  readonly digest: string;
  readonly state: "active" | "superseded" | "quarantined" | "withdrawn";
}

export interface SeedCatalogueRelease {
  readonly releaseId: string;
  readonly releaseIdentity: string;
  readonly documentDigest: string;
  readonly predecessorReleaseId: string | null;
  readonly state: "active" | "retired";
}

export interface SeedCatalogueState {
  readonly schema: "bestehen-seed-catalogue/v1";
  readonly activeReleaseId: string | null;
  readonly revisions: readonly SeedCatalogueRevision[];
  readonly releases: readonly SeedCatalogueRelease[];
  readonly audit: readonly SeedAuditRecord[];
}

export interface SeedAuditRecord {
  readonly operationId: string;
  readonly command: SeedCommand;
  readonly subjectId: string;
  readonly reason: string;
  readonly occurredAt: string;
}

export interface SeedPlanRequest {
  readonly release: SeedReleaseDocument;
  readonly catalogue: SeedCatalogueState;
  readonly dryRun: boolean;
  readonly reportPath: string | null;
  readonly operationId: string;
  readonly occurredAt: string;
  readonly command: SeedCommand;
  readonly selector: string | null;
  readonly reason: string | null;
}

export interface SeedRevisionReport {
  readonly seedKey: string;
  readonly familyId: string;
  readonly revisionId: string;
  readonly predecessorRevisionId: string | null;
  readonly digest: string;
  readonly contentClass: "C3";
  readonly requestedLevel: string;
  readonly action: SeedDiffAction;
  readonly rights: {
    readonly envelopeId: string;
    readonly state: string;
    readonly actions: SeedReleaseEntryDocument["rightsActionEvaluation"];
  };
  readonly accessibility: {
    readonly manifestId: string;
    readonly status: "pass" | "blocked";
  };
  readonly validation: {
    readonly decision: SeedReleaseEntryDocument["validation"]["decision"];
    readonly firstBlockingGate: string | null;
    readonly gates: readonly SeedGateResult[];
  };
  readonly currentRevisionId: string | null;
}

export interface SeedValidationReport {
  readonly schema: "bestehen-seed-validation-report/v1";
  readonly command: SeedCommand;
  readonly dryRun: boolean;
  readonly operationId: string;
  readonly occurredAt: string;
  readonly release: {
    readonly id: string;
    readonly identity: string;
    readonly documentDigest: string;
    readonly priorActiveReleaseId: string | null;
  };
  readonly revisions: readonly SeedRevisionReport[];
  readonly summary: {
    readonly created: number;
    readonly superseded: number;
    readonly unchanged: number;
    readonly withdrawn: number;
    readonly quarantined: number;
    readonly rolledBack: number;
    readonly hardFailures: number;
  };
  readonly failures: readonly {
    readonly code: string;
    readonly identity: string;
    readonly detail: string;
  }[];
}

export interface SeedPlan {
  readonly report: SeedValidationReport;
  readonly nextState: SeedCatalogueState;
}

export const emptySeedCatalogue: SeedCatalogueState = {
  schema: "bestehen-seed-catalogue/v1",
  activeReleaseId: null,
  revisions: [],
  releases: [],
  audit: [],
};

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const record = value as Readonly<Record<string, unknown>>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`)
    .join(",")}}`;
}

export function seedDocumentDigest(document: SeedReleaseDocument): string {
  return createHash("sha256").update(canonicalize(document), "utf8").digest("hex");
}

function count(actions: readonly SeedRevisionReport[], action: SeedDiffAction): number {
  return actions.filter((entry) => entry.action === action).length;
}

function reportFor(
  entry: SeedReleaseEntryDocument,
  action: SeedDiffAction,
  currentRevisionId: string | null,
): SeedRevisionReport {
  return {
    seedKey: entry.seedKey,
    familyId: entry.familyId,
    revisionId: entry.revisionId,
    predecessorRevisionId: entry.predecessorRevisionId,
    digest: entry.digest,
    contentClass: entry.contentClass,
    requestedLevel: entry.requestedLevel,
    action,
    rights: {
      envelopeId: entry.rightsEnvelopeId,
      state: entry.rightsState,
      actions: entry.rightsActionEvaluation,
    },
    accessibility: {
      manifestId: entry.accessibilityManifestId,
      status: entry.accessibilityGate.status,
    },
    validation: {
      decision: entry.validation.decision,
      firstBlockingGate: entry.validation.firstBlockingGate ?? null,
      gates: entry.validation.gateResults,
    },
    currentRevisionId,
  };
}

function planApply(
  request: SeedPlanRequest,
  failures: SeedValidationReport["failures"][number][],
): { readonly revisions: SeedRevisionReport[]; readonly nextRevisions: SeedCatalogueRevision[] } {
  const currentByFamily = new Map(
    request.catalogue.revisions
      .filter((revision) => revision.state === "active")
      .map((revision) => [revision.familyId, revision] as const),
  );
  const byRevisionId = new Map(
    request.catalogue.revisions.map((revision) => [revision.revisionId, revision] as const),
  );
  const next = [...request.catalogue.revisions];
  const revisions: SeedRevisionReport[] = [];

  for (const entry of request.release.entries) {
    if (entry.intent !== "serving") continue;
    const current = currentByFamily.get(entry.familyId);
    const sameIdentity = byRevisionId.get(entry.revisionId);
    let action: SeedDiffAction = "create";
    if (entry.validation.decision !== "publishable") {
      failures.push({
        code: "publication_gate_failed",
        identity: entry.revisionId,
        detail: `Seed validation is ${entry.validation.decision}.`,
      });
    }
    if (entry.rightsState !== "current" || entry.rightsActionEvaluation.display !== "allowed") {
      failures.push({
        code: "rights_not_servable",
        identity: entry.revisionId,
        detail: "A serving seed needs current rights and allowed display.",
      });
    }
    if (entry.accessibilityGate.status !== "pass") {
      failures.push({
        code: "accessibility_gate_failed",
        identity: entry.revisionId,
        detail: "A serving seed needs a passing accessibility gate.",
      });
    }
    if (sameIdentity) {
      if (sameIdentity.digest === entry.digest) action = "unchanged";
      else {
        action = "unchanged";
        failures.push({
          code: "immutable_revision_changed",
          identity: entry.revisionId,
          detail:
            "The revision identity already exists with a different digest. Author a successor identity and name this revision as predecessor.",
        });
      }
    } else if (current) {
      if (entry.predecessorRevisionId !== current.revisionId) {
        failures.push({
          code: "successor_predecessor_missing",
          identity: entry.revisionId,
          detail: `The current family revision is ${current.revisionId}; a changed artifact must name it as predecessor.`,
        });
      } else {
        action = "supersede";
      }
    }
    revisions.push(reportFor(entry, action, current?.revisionId ?? null));
    if (action === "create") {
      next.push({
        seedKey: entry.seedKey,
        familyId: entry.familyId,
        revisionId: entry.revisionId,
        predecessorRevisionId: entry.predecessorRevisionId,
        digest: entry.digest,
        state: "active",
      });
    } else if (action === "supersede" && current) {
      const currentIndex = next.findIndex((revision) => revision.revisionId === current.revisionId);
      next[currentIndex] = { ...current, state: "superseded" };
      next.push({
        seedKey: entry.seedKey,
        familyId: entry.familyId,
        revisionId: entry.revisionId,
        predecessorRevisionId: entry.predecessorRevisionId,
        digest: entry.digest,
        state: "active",
      });
    }
  }
  return { revisions, nextRevisions: next };
}

function selectOne(
  request: SeedPlanRequest,
  failures: SeedValidationReport["failures"][number][],
): SeedCatalogueRevision | null {
  const selector = request.selector;
  const matches = request.catalogue.revisions.filter(
    (revision) =>
      revision.state === "active" &&
      (revision.familyId === selector ||
        revision.revisionId === selector ||
        revision.seedKey === selector),
  );
  if (matches.length !== 1) {
    failures.push({
      code: "selector_cardinality",
      identity: selector ?? "missing",
      detail: `Expected one active revision, found ${matches.length}.`,
    });
    return null;
  }
  return matches[0] ?? null;
}

export function planSeedCommand(request: SeedPlanRequest): SeedPlan {
  const failures: SeedValidationReport["failures"][number][] = [];
  let revisionReports: SeedRevisionReport[] = [];
  let nextRevisions = [...request.catalogue.revisions];
  let nextReleases = [...request.catalogue.releases];
  let nextActiveReleaseId = request.catalogue.activeReleaseId;
  const audit = [...request.catalogue.audit];
  const documentDigest = seedDocumentDigest(request.release);

  if (request.command === "apply") {
    const planned = planApply(request, failures);
    revisionReports = planned.revisions;
    nextRevisions = planned.nextRevisions;
    const existingRelease = request.catalogue.releases.find(
      (release) => release.releaseId === request.release.releaseId,
    );
    if (existingRelease && existingRelease.documentDigest !== documentDigest) {
      failures.push({
        code: "immutable_release_changed",
        identity: request.release.releaseId,
        detail: "The release identity already exists with a different document digest.",
      });
    } else if (!existingRelease) {
      nextReleases.push({
        releaseId: request.release.releaseId,
        releaseIdentity: request.release.releaseIdentity,
        documentDigest,
        predecessorReleaseId: request.catalogue.activeReleaseId,
        state: "active",
      });
      nextReleases = nextReleases.map((release) =>
        release.releaseId === request.release.releaseId
          ? release
          : release.state === "active"
            ? { ...release, state: "retired" }
            : release,
      );
      nextActiveReleaseId = request.release.releaseId;
    }
  } else if (request.command === "withdraw" || request.command === "quarantine") {
    if (!request.reason)
      failures.push({
        code: "reason_required",
        identity: request.selector ?? "missing",
        detail: `${request.command} requires --reason.`,
      });
    const selected = selectOne(request, failures);
    if (selected) {
      const entry = request.release.entries.find(
        (candidate) => candidate.revisionId === selected.revisionId,
      );
      if (!entry)
        failures.push({
          code: "release_entry_missing",
          identity: selected.revisionId,
          detail: "The active revision is not described by the supplied release document.",
        });
      else revisionReports = [reportFor(entry, request.command, selected.revisionId)];
      nextRevisions = nextRevisions.map((revision) =>
        revision.revisionId === selected.revisionId
          ? { ...revision, state: request.command === "withdraw" ? "withdrawn" : "quarantined" }
          : revision,
      );
      audit.push({
        operationId: request.operationId,
        command: request.command,
        subjectId: selected.revisionId,
        reason: request.reason ?? "missing",
        occurredAt: request.occurredAt,
      });
    }
  } else {
    const target = request.catalogue.releases.find(
      (release) => release.releaseId === request.selector,
    );
    if (!target)
      failures.push({
        code: "rollback_release_missing",
        identity: request.selector ?? "missing",
        detail: "Rollback names a previously recorded release ID.",
      });
    else {
      nextReleases = nextReleases.map((release) => ({
        ...release,
        state: release.releaseId === target.releaseId ? "active" : "retired",
      }));
      nextActiveReleaseId = target.releaseId;
      audit.push({
        operationId: request.operationId,
        command: "rollback",
        subjectId: target.releaseId,
        reason: request.reason ?? "operator rollback",
        occurredAt: request.occurredAt,
      });
    }
  }

  const summary = {
    created: count(revisionReports, "create"),
    superseded: count(revisionReports, "supersede"),
    unchanged: count(revisionReports, "unchanged"),
    withdrawn: count(revisionReports, "withdraw"),
    quarantined: count(revisionReports, "quarantine"),
    rolledBack: request.command === "rollback" && failures.length === 0 ? 1 : 0,
    hardFailures: failures.length,
  };
  const report: SeedValidationReport = {
    schema: "bestehen-seed-validation-report/v1",
    command: request.command,
    dryRun: request.dryRun,
    operationId: request.operationId,
    occurredAt: request.occurredAt,
    release: {
      id: request.release.releaseId,
      identity: request.release.releaseIdentity,
      documentDigest,
      priorActiveReleaseId: request.catalogue.activeReleaseId,
    },
    revisions: revisionReports,
    summary,
    failures,
  };
  return {
    report,
    nextState:
      request.dryRun || failures.length > 0
        ? request.catalogue
        : {
            schema: "bestehen-seed-catalogue/v1",
            activeReleaseId: nextActiveReleaseId,
            revisions: nextRevisions,
            releases: nextReleases,
            audit,
          },
  };
}

function assertReleaseDocument(value: unknown): asserts value is SeedReleaseDocument {
  const document = value as Partial<SeedReleaseDocument> | null;
  if (document?.schema !== "bestehen-seed-release/v1" || !Array.isArray(document.entries)) {
    throw new Error("The release file is not a bestehen-seed-release/v1 document.");
  }
}

function assertCatalogue(value: unknown): asserts value is SeedCatalogueState {
  const state = value as Partial<SeedCatalogueState> | null;
  if (
    state?.schema !== "bestehen-seed-catalogue/v1" ||
    !Array.isArray(state.revisions) ||
    !Array.isArray(state.releases) ||
    !Array.isArray(state.audit)
  ) {
    throw new Error("The state file is not a bestehen-seed-catalogue/v1 document.");
  }
}

export async function runSeedCli(argv: readonly string[]): Promise<SeedValidationReport> {
  const parsed = parseArgs({
    args: [...argv],
    allowPositionals: false,
    options: {
      "dry-run": { type: "boolean", default: false },
      report: { type: "string" },
      release: { type: "string" },
      state: { type: "string" },
      withdraw: { type: "string" },
      quarantine: { type: "string" },
      rollback: { type: "string" },
      reason: { type: "string" },
      "operation-id": { type: "string" },
      "occurred-at": { type: "string" },
    },
  });
  const defaultReleasePath = new URL("../../../content/src/seed/release.json", import.meta.url);
  const releasePath = parsed.values.release ?? defaultReleasePath;
  const release = JSON.parse(await readFile(releasePath, "utf8")) as unknown;
  assertReleaseDocument(release);
  let catalogue = emptySeedCatalogue;
  const statePath = parsed.values.state;
  if (statePath) {
    try {
      const read = JSON.parse(await readFile(statePath, "utf8")) as unknown;
      assertCatalogue(read);
      catalogue = read;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  const commands = [
    parsed.values.withdraw,
    parsed.values.quarantine,
    parsed.values.rollback,
  ].filter((value) => value !== undefined);
  if (commands.length > 1)
    throw new Error("Use only one of --withdraw, --quarantine, or --rollback.");
  const command: SeedCommand = parsed.values.withdraw
    ? "withdraw"
    : parsed.values.quarantine
      ? "quarantine"
      : parsed.values.rollback
        ? "rollback"
        : "apply";
  const selector =
    parsed.values.withdraw ?? parsed.values.quarantine ?? parsed.values.rollback ?? null;
  const occurredAt = parsed.values["occurred-at"] ?? new Date().toISOString();
  const operationId =
    parsed.values["operation-id"] ??
    `seed-${createHash("sha256")
      .update(`${command}:${selector ?? release.releaseId}:${occurredAt}`)
      .digest("hex")
      .slice(0, 24)}`;
  const plan = planSeedCommand({
    release,
    catalogue,
    dryRun: parsed.values["dry-run"],
    reportPath: parsed.values.report ?? null,
    operationId,
    occurredAt,
    command,
    selector,
    reason: parsed.values.reason ?? null,
  });
  if (parsed.values.report)
    await writeFile(parsed.values.report, `${JSON.stringify(plan.report, null, 2)}\n`, "utf8");
  if (!parsed.values["dry-run"] && statePath && plan.report.summary.hardFailures === 0)
    await writeFile(statePath, `${JSON.stringify(plan.nextState, null, 2)}\n`, "utf8");
  return plan.report;
}

async function main(): Promise<void> {
  const report = await runSeedCli(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.summary.hardFailures > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
