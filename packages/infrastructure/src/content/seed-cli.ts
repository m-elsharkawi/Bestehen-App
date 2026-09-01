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
import { Pool } from "pg";

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
  readonly family: Readonly<Record<string, unknown>>;
  readonly revision: Readonly<Record<string, unknown>> & {
    readonly items: readonly Readonly<Record<string, unknown>>[];
    readonly learnerPayload: Readonly<Record<string, unknown>>;
  };
  readonly keys: readonly Readonly<Record<string, unknown>>[];
  readonly rights: Readonly<Record<string, unknown>>;
  readonly accessibility: Readonly<Record<string, unknown>>;
  readonly recordedGateResults: readonly Readonly<Record<string, unknown>>[];
  readonly approvalCommand: null | Readonly<Record<string, unknown>>;
  readonly reviewRequirements: readonly string[];
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
  readonly receipts: readonly SeedOperationReceipt[];
}

export interface SeedOperationReceipt {
  readonly operationId: string;
  readonly payloadDigest: string;
  readonly report: SeedValidationReport;
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
  receipts: [],
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

function requestPayloadDigest(request: SeedPlanRequest): string {
  return createHash("sha256")
    .update(
      canonicalize({
        command: request.command,
        selector: request.selector,
        reason: request.reason,
        occurredAt: request.occurredAt,
        dryRun: request.dryRun,
        releaseDigest: seedDocumentDigest(request.release),
      }),
      "utf8",
    )
    .digest("hex");
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
    if (entry.requestedLevel !== "draft" || entry.approvalCommand !== null) {
      failures.push({
        code: "unearned_seed_approval",
        identity: entry.revisionId,
        detail:
          "The seed command applies draft candidates only; Training needs an independent key validation and launch human review.",
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
  const payloadDigest = requestPayloadDigest(request);
  const replay = request.catalogue.receipts.find(
    (receipt) => receipt.operationId === request.operationId,
  );
  if (replay) {
    if (replay.payloadDigest === payloadDigest)
      return { report: replay.report, nextState: request.catalogue };
    return {
      report: {
        schema: "bestehen-seed-validation-report/v1",
        command: request.command,
        dryRun: request.dryRun,
        operationId: request.operationId,
        occurredAt: request.occurredAt,
        release: {
          id: request.release.releaseId,
          identity: request.release.releaseIdentity,
          documentDigest: seedDocumentDigest(request.release),
          priorActiveReleaseId: request.catalogue.activeReleaseId,
        },
        revisions: [],
        summary: {
          created: 0,
          superseded: 0,
          unchanged: 0,
          withdrawn: 0,
          quarantined: 0,
          rolledBack: 0,
          hardFailures: 1,
        },
        failures: [
          {
            code: "idempotency_conflict",
            identity: request.operationId,
            detail: "The operation ID is already committed for a different canonical payload.",
          },
        ],
      },
      nextState: request.catalogue,
    };
  }
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
  const plan: SeedPlan = {
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
            receipts: request.catalogue.receipts,
          },
  };
  if (request.dryRun || failures.length > 0) return plan;
  return {
    report,
    nextState: {
      ...plan.nextState,
      receipts: [
        ...request.catalogue.receipts,
        { operationId: request.operationId, payloadDigest, report },
      ],
    },
  };
}

function recordAt(value: unknown, path: string): Readonly<Record<string, unknown>> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error(`Invalid seed release at ${path}: expected object.`);
  return value as Readonly<Record<string, unknown>>;
}

function stringAt(record: Readonly<Record<string, unknown>>, key: string, path: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0)
    throw new Error(`Invalid seed release at ${path}/${key}: expected non-empty string.`);
  return value;
}

function arrayAt(
  record: Readonly<Record<string, unknown>>,
  key: string,
  path: string,
): readonly unknown[] {
  const value = record[key];
  if (!Array.isArray(value))
    throw new Error(`Invalid seed release at ${path}/${key}: expected array.`);
  return value;
}

function assertNoSensitiveFields(value: unknown, path = ""): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      assertNoSensitiveFields(entry, `${path}/${index}`);
    });
    return;
  }
  if (value === null || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (/^(learnerScopeId|email|password|secret|token|databaseUrl)$/i.test(key))
      throw new Error(
        `Invalid seed release at ${path}/${key}: sensitive or learner field forbidden.`,
      );
    assertNoSensitiveFields(child, `${path}/${key}`);
  }
}

export function validateSeedReleaseDocument(value: unknown): SeedReleaseDocument {
  const document = recordAt(value, "");
  if (document.schema !== "bestehen-seed-release/v1")
    throw new Error("The release file is not a bestehen-seed-release/v1 document.");
  stringAt(document, "releaseId", "");
  stringAt(document, "releaseIdentity", "");
  if (document.generatedFrom !== "typed-seed-source")
    throw new Error("Invalid seed release at /generatedFrom.");
  const entries = arrayAt(document, "entries", "");
  const audio = arrayAt(document, "audio", "");
  if (entries.length === 0) throw new Error("Invalid seed release at /entries: empty release.");
  const seenRevisionIds = new Set<string>();
  entries.forEach((rawEntry, index) => {
    const path = `/entries/${index}`;
    const entry = recordAt(rawEntry, path);
    const seedKey = stringAt(entry, "seedKey", path);
    const familyId = stringAt(entry, "familyId", path);
    const revisionId = stringAt(entry, "revisionId", path);
    const taskFamily = stringAt(entry, "taskFamily", path);
    const digest = stringAt(entry, "digest", path);
    if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error(`Invalid seed release at ${path}/digest.`);
    if (seenRevisionIds.has(revisionId))
      throw new Error(`Invalid seed release at ${path}/revisionId: duplicate ${revisionId}.`);
    seenRevisionIds.add(revisionId);
    if (
      !seedKey ||
      !["serving", "quarantine_fixture", "withdrawal_fixture"].includes(String(entry.intent))
    )
      throw new Error(`Invalid seed release at ${path}/intent.`);

    const family = recordAt(entry.family, `${path}/family`);
    if (family.contentFamilyId !== familyId || family.taskFamilyKind !== taskFamily)
      throw new Error(`Invalid seed release at ${path}/family: identity mismatch.`);

    const revision = recordAt(entry.revision, `${path}/revision`);
    if (
      revision.contentRevisionId !== revisionId ||
      revision.contentFamilyId !== familyId ||
      revision.contentClass !== "C3" ||
      revision.digest !== digest
    )
      throw new Error(`Invalid seed release at ${path}/revision: identity mismatch.`);
    const learnerPayload = recordAt(revision.learnerPayload, `${path}/revision/learnerPayload`);
    if (learnerPayload.kind !== taskFamily)
      throw new Error(`Invalid seed release at ${path}/revision/learnerPayload/kind.`);
    const items = arrayAt(revision, "items", `${path}/revision`);
    const keys = arrayAt(entry, "keys", path);
    const keyRevisionIds = arrayAt(entry, "keyRevisionIds", path);
    const revisionKeyRevisionIds = arrayAt(revision, "keyRevisionIds", `${path}/revision`);
    const mediaRevisionIds = arrayAt(entry, "mediaRevisionIds", path);
    const revisionMediaRevisionIds = arrayAt(revision, "mediaRevisionIds", `${path}/revision`);
    if (items.length === 0 || keys.length !== items.length || keyRevisionIds.length !== keys.length)
      throw new Error(`Invalid seed release at ${path}: item/key cardinality mismatch.`);
    if (
      json(keyRevisionIds) !== json(revisionKeyRevisionIds) ||
      json(mediaRevisionIds) !== json(revisionMediaRevisionIds)
    )
      throw new Error(`Invalid seed release at ${path}/revision: pinned identity mismatch.`);
    const itemIds = new Set<string>();
    for (const [itemIndex, rawItem] of items.entries()) {
      const item = recordAt(rawItem, `${path}/revision/items/${itemIndex}`);
      const itemId = stringAt(item, "contentItemId", `${path}/revision/items/${itemIndex}`);
      if (item.contentRevisionId !== revisionId || itemIds.has(itemId))
        throw new Error(
          `Invalid seed release at ${path}/revision/items/${itemIndex}: identity mismatch.`,
        );
      itemIds.add(itemId);
      recordAt(item.binding, `${path}/revision/items/${itemIndex}/binding`);
      recordAt(item.scorable, `${path}/revision/items/${itemIndex}/scorable`);
    }
    const keysById = new Map<string, Readonly<Record<string, unknown>>>();
    for (const [keyIndex, rawKey] of keys.entries()) {
      const key = recordAt(rawKey, `${path}/keys/${keyIndex}`);
      const keyId = stringAt(key, "keyRevisionId", `${path}/keys/${keyIndex}`);
      if (
        !itemIds.has(String(key.itemId)) ||
        !Array.isArray(key.acceptedResponseSet) ||
        key.acceptedResponseSet.length === 0
      )
        throw new Error(`Invalid seed release at ${path}/keys/${keyIndex}: item/key mismatch.`);
      recordAt(key.responseCardinality, `${path}/keys/${keyIndex}/responseCardinality`);
      arrayAt(key, "decisiveEvidenceRefs", `${path}/keys/${keyIndex}`);
      arrayAt(key, "distractorRationales", `${path}/keys/${keyIndex}`);
      arrayAt(key, "intendedCauseMappings", `${path}/keys/${keyIndex}`);
      const independent = recordAt(
        key.independentValidatorResult,
        `${path}/keys/${keyIndex}/independentValidatorResult`,
      );
      if (
        independent.validatorRef !== "unclaimed:OWNER-05-C" ||
        independent.agreedWithProposedKey !== false
      )
        throw new Error(
          `Invalid seed release at ${path}/keys/${keyIndex}/independentValidatorResult: review is not recorded.`,
        );
      keysById.set(keyId, key);
    }
    for (const keyId of keyRevisionIds)
      if (typeof keyId !== "string" || !keysById.has(keyId))
        throw new Error(`Invalid seed release at ${path}/keyRevisionIds.`);

    const rights = recordAt(entry.rights, `${path}/rights`);
    const rightsIdentity = recordAt(rights.identity, `${path}/rights/identity`);
    if (
      rightsIdentity.rightsEnvelopeId !== entry.rightsEnvelopeId ||
      rightsIdentity.state !== entry.rightsState
    )
      throw new Error(`Invalid seed release at ${path}/rights/identity.`);
    const provenance = recordAt(rights.provenance, `${path}/rights/provenance`);
    if (
      provenance.corpusBundleRef !== null ||
      provenance.groundingManifest !== "originally-authored"
    )
      throw new Error(`Invalid seed release at ${path}/rights/provenance.`);
    recordAt(rights.actionEligibility, `${path}/rights/actionEligibility`);
    recordAt(rights.componentScope, `${path}/rights/componentScope`);
    const accessibility = recordAt(entry.accessibility, `${path}/accessibility`);
    if (accessibility.accessibilityManifestId !== entry.accessibilityManifestId)
      throw new Error(`Invalid seed release at ${path}/accessibility/accessibilityManifestId.`);
    const recordedGateResults = arrayAt(entry, "recordedGateResults", path);
    if (
      recordedGateResults.length !== 6 ||
      recordedGateResults.some(
        (gate) => recordAt(gate, `${path}/recordedGateResults`).outcome !== "not_run",
      )
    )
      throw new Error(
        `Invalid seed release at ${path}/recordedGateResults: human gates remain not run.`,
      );
    const validation = recordAt(entry.validation, `${path}/validation`);
    arrayAt(validation, "gateResults", `${path}/validation`);
    arrayAt(validation, "findings", `${path}/validation`);
    if (
      entry.intent === "serving" &&
      (entry.requestedLevel !== "draft" || entry.approvalCommand !== null)
    )
      throw new Error(
        `Invalid seed release at ${path}: unreviewed serving candidate must be a draft.`,
      );
    const requirements = arrayAt(entry, "reviewRequirements", path);
    if (
      !requirements.includes("independent_key_validation:OWNER-05-C") ||
      !requirements.includes("launch_human_review")
    )
      throw new Error(`Invalid seed release at ${path}/reviewRequirements.`);
  });
  const revisionIdsBySeedKey = new Map(
    entries.map((rawEntry, index) => {
      const entry = recordAt(rawEntry, `/entries/${index}`);
      return [
        String(entry.seedKey),
        new Set(arrayAt(entry, "mediaRevisionIds", `/entries/${index}`)),
      ] as const;
    }),
  );
  for (const [index, rawAudio] of audio.entries()) {
    const path = `/audio/${index}`;
    const manifest = recordAt(rawAudio, path);
    const contentSeedKey = stringAt(manifest, "contentSeedKey", path);
    stringAt(manifest, "script", path);
    stringAt(manifest, "transcript", path);
    if (
      manifest.rendererVersion !== "fake-tts/v1" ||
      manifest.sourceRole !== "deterministic_fake_training_fixture"
    )
      throw new Error(`Invalid seed release at ${path}: fake-audio identity mismatch.`);
    const rendition = recordAt(manifest.rendition, `${path}/rendition`);
    const mediaRevisionId = stringAt(rendition, "mediaRevisionId", `${path}/rendition`);
    if (
      !revisionIdsBySeedKey.get(contentSeedKey)?.has(mediaRevisionId) ||
      typeof rendition.bytes !== "number" ||
      rendition.bytes <= 0 ||
      !/^[0-9a-f]{64}$/.test(String(rendition.digest))
    )
      throw new Error(`Invalid seed release at ${path}/rendition.`);
  }
  assertNoSensitiveFields(document);
  return document as unknown as SeedReleaseDocument;
}

function assertCatalogue(value: unknown): asserts value is SeedCatalogueState {
  const state = value as Partial<SeedCatalogueState> | null;
  if (
    state?.schema !== "bestehen-seed-catalogue/v1" ||
    !Array.isArray(state.revisions) ||
    !Array.isArray(state.releases) ||
    !Array.isArray(state.audit) ||
    (state.receipts !== undefined && !Array.isArray(state.receipts))
  ) {
    throw new Error("The state file is not a bestehen-seed-catalogue/v1 document.");
  }
}

export interface SeedSqlResult {
  readonly rows: readonly Record<string, unknown>[];
  readonly rowCount: number | null;
}

export interface SeedSqlClient {
  query(text: string, values?: unknown[]): Promise<SeedSqlResult>;
  release?(): void;
}

export interface SeedSqlPool {
  connect(): Promise<SeedSqlClient>;
  end?(): Promise<void>;
}

function stableUuid(identity: string): string {
  const hex = createHash("sha256").update(identity, "utf8").digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

async function loadPostgresCatalogue(client: SeedSqlClient): Promise<SeedCatalogueState> {
  const [revisionRows, releaseRows] = await Promise.all([
    client.query(
      `SELECT cr.id AS revision_id,cr.family_id,cf.family_key AS seed_key,cr.predecessor_id,cr.digest,cr.approval_state
         FROM app.content_revisions cr JOIN app.content_families cf ON cf.id=cr.family_id`,
    ),
    client.query(
      `SELECT id,release_identity,digest,predecessor_id,state
         FROM app.content_releases`,
    ),
  ]);
  const revisions: SeedCatalogueRevision[] = revisionRows.rows.map((row) => ({
    seedKey: String(row.seed_key),
    familyId: String(row.family_id),
    revisionId: String(row.revision_id),
    predecessorRevisionId: row.predecessor_id === null ? null : String(row.predecessor_id),
    digest: String(row.digest),
    state:
      row.approval_state === "quarantined"
        ? "quarantined"
        : row.approval_state === "retired"
          ? "withdrawn"
          : "active",
  }));
  const releases: SeedCatalogueRelease[] = releaseRows.rows.map((row) => ({
    releaseId: String(row.id),
    releaseIdentity: String(row.release_identity),
    documentDigest: String(row.digest),
    predecessorReleaseId: row.predecessor_id === null ? null : String(row.predecessor_id),
    state: row.state === "active" ? "active" : "retired",
  }));
  return {
    schema: "bestehen-seed-catalogue/v1",
    activeReleaseId: releases.find((release) => release.state === "active")?.releaseId ?? null,
    revisions,
    releases,
    audit: [],
    receipts: [],
  };
}

function json(value: unknown): string {
  return canonicalize(value);
}

async function insertReleaseGraph(
  client: SeedSqlClient,
  release: SeedReleaseDocument,
  report: SeedValidationReport,
): Promise<void> {
  const reportByRevisionId = new Map(report.revisions.map((entry) => [entry.revisionId, entry]));
  for (const entry of release.entries) {
    const family = entry.family;
    const revision = entry.revision;
    const rights = entry.rights;
    const rightsIdentity = recordAt(rights.identity, `/entries/${entry.seedKey}/rights/identity`);
    const accessibility = entry.accessibility;
    const rightsDigest = createHash("sha256").update(json(rights)).digest("hex");
    const accessibilityDigest = createHash("sha256").update(json(accessibility)).digest("hex");
    await client.query(
      `INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest,predecessor_id,effective_at)
       VALUES($1,$2,$3,$4::jsonb,$5,$6,$7) ON CONFLICT(id) DO NOTHING`,
      [
        entry.rightsEnvelopeId,
        entry.seedKey,
        entry.rightsState,
        json(rights),
        rightsDigest,
        rightsIdentity.predecessorRightsEnvelopeId ?? null,
        rightsIdentity.effectiveFrom ?? null,
      ],
    );
    const accessibilityStatus = entry.accessibilityGate.status === "pass" ? "pass" : "blocked";
    await client.query(
      `INSERT INTO app.accessibility_manifests(id,manifest,language_tag,gate_status,digest)
       VALUES($1,$2::jsonb,$3,$4,$5) ON CONFLICT(id) DO NOTHING`,
      [
        entry.accessibilityManifestId,
        json(accessibility),
        accessibility.languageTag,
        accessibilityStatus,
        accessibilityDigest,
      ],
    );
    await client.query(
      `INSERT INTO app.content_families(id,family_key,task_definition_id,task_definition_revision,task_family_kind,assignment_basis,review_state)
       VALUES($1,$2,$3,$4,$5,$6::jsonb,'unresolved') ON CONFLICT(id) DO NOTHING`,
      [
        entry.familyId,
        entry.seedKey,
        recordAt(family.taskDefinition, "family/taskDefinition").id,
        recordAt(family.taskDefinition, "family/taskDefinition").revision,
        entry.taskFamily,
        json({ basis: family.assignmentBasis, sourceReviewState: family.reviewState }),
      ],
    );
    const reportEntry = reportByRevisionId.get(entry.revisionId);
    const approvalState =
      entry.intent === "quarantine_fixture"
        ? "quarantined"
        : entry.intent === "withdrawal_fixture"
          ? "retired"
          : "candidate";
    const rightsState = entry.rightsState === "current" ? "eligible" : "withdrawn";
    await client.query(
      `INSERT INTO app.content_revisions(
         id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest,predecessor_id,
         content_class,task_definition_id,task_definition_revision,generation_brief_id,generation_brief_revision,
         target_blueprint_release,taxonomy_release,capability_refs,progression_profile,intended_evidence_roles,
         instruction,learner_payload,rights_envelope_id,accessibility_manifest_id,current_approval_decision_id,frozen_at)
       VALUES($1,$2,$3,'learning_practice',$4,$5,'compatible',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,$17::jsonb,$18::jsonb,$19::jsonb,$20,$21,NULL,NULL)
       ON CONFLICT(id) DO NOTHING`,
      [
        entry.revisionId,
        entry.familyId,
        entry.seedKey,
        approvalState,
        rightsState,
        entry.digest,
        entry.predecessorRevisionId,
        entry.contentClass,
        recordAt(revision.taskDefinition, "revision/taskDefinition").id,
        recordAt(revision.taskDefinition, "revision/taskDefinition").revision,
        recordAt(revision.generationBrief, "revision/generationBrief").id,
        recordAt(revision.generationBrief, "revision/generationBrief").revision,
        revision.targetBlueprintRelease,
        revision.taxonomyRelease,
        json(revision.capabilityRefs),
        revision.progressionProfile,
        json(revision.intendedEvidenceRoles),
        json(revision.instruction),
        json(revision.learnerPayload),
        entry.rightsEnvelopeId,
        entry.accessibilityManifestId,
      ],
    );
    for (const rawItem of entry.revision.items) {
      const item = recordAt(rawItem, "revision/item");
      const scorable = recordAt(item.scorable, "revision/item/scorable");
      await client.query(
        `INSERT INTO app.content_items(id,content_revision_id,predecessor_item_id,ordinal,response_kind,binding,scorable)
         VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb) ON CONFLICT(id) DO NOTHING`,
        [
          item.contentItemId,
          entry.revisionId,
          item.predecessorItemId ?? null,
          item.ordinal,
          scorable.responseKind,
          json(item.binding),
          json(scorable),
        ],
      );
    }
    for (const rawKey of entry.keys) {
      const key = recordAt(rawKey, "key");
      const cardinality = recordAt(key.responseCardinality, "key/responseCardinality");
      await client.query(
        `INSERT INTO app.key_revisions(id,content_revision_id,content_item_id,predecessor_id,accepted_response_set,response_cardinality_min,response_cardinality_max,scoring_policy_ref,decisive_evidence,distractor_rationale,intended_cause_mapping,independent_validation,digest)
         VALUES($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13) ON CONFLICT(id) DO NOTHING`,
        [
          key.keyRevisionId,
          entry.revisionId,
          key.itemId,
          key.predecessorKeyRevisionId ?? null,
          json(key.acceptedResponseSet),
          cardinality.min,
          cardinality.max,
          key.scoringPolicyRef,
          json({ refs: key.decisiveEvidenceRefs, rationale: key.correctRationale }),
          json(key.distractorRationales),
          json(key.intendedCauseMappings),
          json(key.independentValidatorResult),
          createHash("sha256").update(json(key)).digest("hex"),
        ],
      );
    }
    for (const rawGate of entry.recordedGateResults) {
      const gate = recordAt(rawGate, "recordedGateResult");
      const ordinal =
        [
          "eligibility_brief",
          "semantic_task_design",
          "language_media_creation",
          "deterministic_structure",
          "independent_key_validation",
          "naturalness_register",
          "difficulty_target_fit",
          "anti_copy_diversity",
          "final_media_render_interaction",
          "approval_publish",
          "post_publication_loop",
        ].indexOf(String(gate.gate)) + 1;
      await client.query(
        `INSERT INTO app.content_gate_results(id,content_revision_id,gate,ordinal,status,gate_version,reviewer_ref,method_version,findings,material_defect,recorded_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11) ON CONFLICT(id) DO NOTHING`,
        [
          stableUuid(`seed-gate/${entry.revisionId}/${String(gate.gate)}`),
          entry.revisionId,
          gate.gate,
          ordinal,
          gate.outcome === "passed"
            ? "pass"
            : gate.outcome === "failed"
              ? "blocked"
              : "not_evaluated",
          gate.methodVersion,
          gate.reviewerRef,
          gate.methodVersion,
          json(gate.detail ? [{ detail: gate.detail }] : []),
          gate.materialDefect === true,
          gate.recordedAt,
        ],
      );
    }
    if (reportEntry?.action === "supersede" && reportEntry.currentRevisionId)
      await client.query("UPDATE app.content_revisions SET approval_state='retired' WHERE id=$1", [
        reportEntry.currentRevisionId,
      ]);
  }
  await client.query(
    `INSERT INTO app.content_releases(id,release_identity,state,digest,predecessor_id)
     VALUES($1,$2,'candidate',$3,$4) ON CONFLICT(id) DO NOTHING`,
    [
      release.releaseId,
      release.releaseIdentity,
      seedDocumentDigest(release),
      report.release.priorActiveReleaseId,
    ],
  );
  for (const entry of release.entries)
    await client.query(
      `INSERT INTO app.content_release_entries(release_id,content_revision_id,form_id)
       VALUES($1,$2,NULL) ON CONFLICT(release_id,content_revision_id) DO NOTHING`,
      [release.releaseId, entry.revisionId],
    );
}

async function mutatePostgres(
  client: SeedSqlClient,
  request: SeedPlanRequest,
  report: SeedValidationReport,
): Promise<void> {
  if (request.command === "apply") return insertReleaseGraph(client, request.release, report);
  const revisionId = report.revisions[0]?.revisionId;
  if (request.command === "withdraw" && revisionId) {
    await client.query(
      "UPDATE app.content_revisions SET approval_state='retired',rights_state='withdrawn' WHERE id=$1",
      [revisionId],
    );
    await client.query("UPDATE app.rights_envelopes SET state='withdrawn' WHERE id=$1", [
      report.revisions[0]?.rights.envelopeId,
    ]);
  } else if (request.command === "quarantine" && revisionId) {
    await client.query(
      "UPDATE app.content_revisions SET approval_state='quarantined' WHERE id=$1",
      [revisionId],
    );
  } else if (request.command === "rollback" && request.selector) {
    await client.query(
      "UPDATE app.content_releases SET state=CASE WHEN id=$1 THEN 'active' ELSE 'retired' END,activated_at=CASE WHEN id=$1 THEN transaction_timestamp() ELSE activated_at END,retired_at=CASE WHEN id=$1 THEN NULL ELSE transaction_timestamp() END WHERE release_identity=$2",
      [request.selector, request.release.releaseIdentity],
    );
  }
}

export async function executePostgresSeedCommand(
  pool: SeedSqlPool,
  request: Omit<SeedPlanRequest, "catalogue">,
): Promise<SeedValidationReport> {
  const client = await pool.connect();
  const receiptId = stableUuid(`content-seed-operation/${request.operationId}`);
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [request.operationId]);
    const receipt = await client.query(
      "SELECT target_digest,target_class FROM app.security_audit_events WHERE id=$1 AND reason_code='content_seed_receipt_v1'",
      [receiptId],
    );
    const catalogue = await loadPostgresCatalogue(client);
    const fullRequest: SeedPlanRequest = { ...request, catalogue };
    const payloadDigest = requestPayloadDigest(fullRequest);
    const prior = receipt.rows[0];
    if (prior) {
      if (prior.target_digest !== payloadDigest) {
        const conflict = planSeedCommand({
          ...fullRequest,
          catalogue: {
            ...catalogue,
            receipts: [
              {
                operationId: request.operationId,
                payloadDigest: String(prior.target_digest),
                report: JSON.parse(String(prior.target_class)) as SeedValidationReport,
              },
            ],
          },
        });
        await client.query("ROLLBACK");
        return conflict.report;
      }
      await client.query("COMMIT");
      return JSON.parse(String(prior.target_class)) as SeedValidationReport;
    }
    const plan = planSeedCommand(fullRequest);
    if (request.dryRun || plan.report.summary.hardFailures > 0) {
      await client.query("ROLLBACK");
      return plan.report;
    }
    await mutatePostgres(client, fullRequest, plan.report);
    await client.query(
      `INSERT INTO app.security_audit_events(id,actor_scope,action,target_class,target_digest,outcome,reason_code,request_id,trace_id,release,retention_class)
       VALUES($1,'content-seed-cli',$2,$3,$4,'allowed','content_seed_receipt_v1',$1,$1,$5,'semantic_until_deletion')`,
      [
        receiptId,
        `content_seed_${request.command}`,
        JSON.stringify(plan.report),
        payloadDigest,
        request.release.releaseId,
      ],
    );
    await client.query("COMMIT");
    return plan.report;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release?.();
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
      "database-url": { type: "string" },
    },
  });
  const defaultReleasePath = new URL("../../../content/src/seed/release.json", import.meta.url);
  const releasePath = parsed.values.release ?? defaultReleasePath;
  const release = validateSeedReleaseDocument(
    JSON.parse(await readFile(releasePath, "utf8")) as unknown,
  );
  let catalogue = emptySeedCatalogue;
  const statePath = parsed.values.state;
  const databaseUrl =
    parsed.values["database-url"] ??
    process.env.BESTEHEN_MIGRATOR_DATABASE_URL ??
    process.env.DATABASE_URL;
  if (statePath && databaseUrl)
    throw new Error("Use either --state for a local catalogue or --database-url, not both.");
  if (statePath) {
    try {
      const read = JSON.parse(await readFile(statePath, "utf8")) as unknown;
      assertCatalogue(read);
      catalogue = { ...read, receipts: read.receipts ?? [] };
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
  const request = {
    release,
    dryRun: parsed.values["dry-run"],
    reportPath: parsed.values.report ?? null,
    operationId,
    occurredAt,
    command,
    selector,
    reason: parsed.values.reason ?? null,
  } satisfies Omit<SeedPlanRequest, "catalogue">;
  if (!databaseUrl && !statePath && !parsed.values["dry-run"])
    throw new Error(
      "A write target is required: set --database-url/BESTEHEN_MIGRATOR_DATABASE_URL or use --state for the deterministic local adapter.",
    );
  let report: SeedValidationReport;
  let plan: SeedPlan | null = null;
  if (databaseUrl) {
    const pool = new Pool({ connectionString: databaseUrl });
    try {
      report = await executePostgresSeedCommand(pool as unknown as SeedSqlPool, request);
    } finally {
      await pool.end();
    }
  } else {
    plan = planSeedCommand({ ...request, catalogue });
    report = plan.report;
  }
  if (parsed.values.report)
    await writeFile(parsed.values.report, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  if (!parsed.values["dry-run"] && statePath && plan && report.summary.hardFailures === 0)
    await writeFile(statePath, `${JSON.stringify(plan.nextState, null, 2)}\n`, "utf8");
  return report;
}

async function main(): Promise<void> {
  const report = await runSeedCli(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.summary.hardFailures > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
