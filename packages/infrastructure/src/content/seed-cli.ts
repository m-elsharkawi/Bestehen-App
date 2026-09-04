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
  /** Immutable revision label; omitted legacy documents retain their original seedKey label. */
  readonly revisionLabel?: string;
  readonly rightsEnvelopeKey?: string;
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
  const currentByFamily = new Map<string, SeedCatalogueRevision[]>();
  for (const revision of request.catalogue.revisions.filter(
    (candidate) => candidate.state === "active",
  )) {
    const family = currentByFamily.get(revision.familyId) ?? [];
    family.push(revision);
    currentByFamily.set(revision.familyId, family);
  }
  const byRevisionId = new Map(
    request.catalogue.revisions.map((revision) => [revision.revisionId, revision] as const),
  );
  const next = [...request.catalogue.revisions];
  const revisions: SeedRevisionReport[] = [];

  for (const entry of request.release.entries) {
    if (entry.intent !== "serving") continue;
    const currentCandidates = currentByFamily.get(entry.familyId) ?? [];
    const current = currentCandidates.length === 1 ? currentCandidates[0] : undefined;
    const sameIdentity = byRevisionId.get(entry.revisionId);
    let action: SeedDiffAction = "create";
    if (currentCandidates.length > 1) {
      failures.push({
        code: "current_family_cardinality",
        identity: entry.familyId,
        detail: `Expected at most one current revision, found ${currentCandidates.length}.`,
      });
    }
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
      if (sameIdentity.digest === entry.digest) {
        action = "unchanged";
        if (sameIdentity.state !== "active")
          failures.push({
            code: "revision_not_active",
            identity: entry.revisionId,
            detail: "A retired or quarantined revision cannot be reactivated by re-applying bytes.",
          });
      } else {
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
    revisions.push(
      reportFor(
        entry,
        action,
        action === "unchanged" && sameIdentity
          ? sameIdentity.revisionId
          : (current?.revisionId ?? null),
      ),
    );
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
    const currentReleaseCandidates = request.catalogue.releases.filter(
      (release) =>
        release.releaseIdentity === request.release.releaseIdentity && release.state === "active",
    );
    if (currentReleaseCandidates.length > 1) {
      failures.push({
        code: "current_release_cardinality",
        identity: request.release.releaseIdentity,
        detail: `Expected at most one current release, found ${currentReleaseCandidates.length}.`,
      });
    }
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
    const expectedReason =
      request.command === "withdraw"
        ? "VALIDITY.RIGHTS_COMPATIBILITY"
        : "UNCERTAINTY.KEY_VALIDATOR_DISAGREEMENT";
    if (request.reason !== expectedReason)
      failures.push({
        code: "reason_code_invalid",
        identity: request.selector ?? "missing",
        detail: `${request.command} requires the frozen reason-registry code ${expectedReason}.`,
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
    if ("revisionLabel" in entry) stringAt(entry, "revisionLabel", path);
    if ("rightsEnvelopeKey" in entry) stringAt(entry, "rightsEnvelopeKey", path);
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

function canonicalInstant(value: unknown, field: string): string {
  const instant = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(instant.getTime()))
    throw new Error(`Invalid PostgreSQL timestamp for ${field}.`);
  return instant.toISOString();
}

async function loadPostgresCatalogue(
  client: SeedSqlClient,
  requestedReleaseIdentity: string,
): Promise<SeedCatalogueState> {
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
  const revisionFacts = revisionRows.rows.map((row) => ({
    seedKey: String(row.seed_key),
    familyId: String(row.family_id),
    revisionId: String(row.revision_id),
    predecessorRevisionId: row.predecessor_id === null ? null : String(row.predecessor_id),
    digest: String(row.digest),
    approvalState: String(row.approval_state),
  }));
  const eligibleRevisionIds = new Set(
    revisionFacts
      .filter((revision) => ["candidate", "approved"].includes(revision.approvalState))
      .map((revision) => revision.revisionId),
  );
  const revisionById = new Map(
    revisionFacts.map((revision) => [revision.revisionId, revision] as const),
  );
  const supersededRevisionIds = new Set(
    revisionFacts
      .filter(
        (revision) =>
          revision.predecessorRevisionId !== null &&
          eligibleRevisionIds.has(revision.revisionId) &&
          eligibleRevisionIds.has(revision.predecessorRevisionId) &&
          revisionById.get(revision.predecessorRevisionId)?.familyId === revision.familyId,
      )
      .map((revision) => revision.predecessorRevisionId as string),
  );
  const revisions: SeedCatalogueRevision[] = revisionFacts
    .map((revision) => ({
      seedKey: revision.seedKey,
      familyId: revision.familyId,
      revisionId: revision.revisionId,
      predecessorRevisionId: revision.predecessorRevisionId,
      digest: revision.digest,
      state:
        revision.approvalState === "quarantined"
          ? ("quarantined" as const)
          : revision.approvalState === "retired"
            ? ("withdrawn" as const)
            : eligibleRevisionIds.has(revision.revisionId)
              ? supersededRevisionIds.has(revision.revisionId)
                ? ("superseded" as const)
                : ("active" as const)
              : ("quarantined" as const),
    }))
    .sort((left, right) => left.revisionId.localeCompare(right.revisionId));
  const releaseFacts = releaseRows.rows.map((row) => ({
    releaseId: String(row.id),
    releaseIdentity: String(row.release_identity),
    documentDigest: String(row.digest),
    predecessorReleaseId: row.predecessor_id === null ? null : String(row.predecessor_id),
    databaseState: String(row.state),
  }));
  const eligibleReleaseIds = new Set(
    releaseFacts
      .filter((release) => ["candidate", "active"].includes(release.databaseState))
      .map((release) => release.releaseId),
  );
  const releaseById = new Map(releaseFacts.map((release) => [release.releaseId, release] as const));
  const supersededReleaseIds = new Set(
    releaseFacts
      .filter(
        (release) =>
          release.predecessorReleaseId !== null &&
          eligibleReleaseIds.has(release.releaseId) &&
          eligibleReleaseIds.has(release.predecessorReleaseId) &&
          releaseById.get(release.predecessorReleaseId)?.releaseIdentity ===
            release.releaseIdentity,
      )
      .map((release) => release.predecessorReleaseId as string),
  );
  const releases: SeedCatalogueRelease[] = releaseFacts
    .map((release) => ({
      releaseId: release.releaseId,
      releaseIdentity: release.releaseIdentity,
      documentDigest: release.documentDigest,
      predecessorReleaseId: release.predecessorReleaseId,
      state:
        eligibleReleaseIds.has(release.releaseId) && !supersededReleaseIds.has(release.releaseId)
          ? ("active" as const)
          : ("retired" as const),
    }))
    .sort((left, right) => left.releaseId.localeCompare(right.releaseId));
  const currentReleases = releases.filter(
    (release) => release.releaseIdentity === requestedReleaseIdentity && release.state === "active",
  );
  return {
    schema: "bestehen-seed-catalogue/v1",
    activeReleaseId: currentReleases.length === 1 ? (currentReleases[0]?.releaseId ?? null) : null,
    revisions,
    releases,
    audit: [],
    receipts: [],
  };
}

function json(value: unknown): string {
  return canonicalize(value);
}

async function insertImmutable(
  client: SeedSqlClient,
  sql: string,
  values: unknown[],
  identity: string,
  entity: string,
  verification: {
    readonly sql: string;
    readonly values: unknown[];
    readonly expected: Readonly<Record<string, unknown>>;
  },
): Promise<void> {
  const comparable = (value: unknown): unknown => {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(comparable);
    if (value !== null && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, comparable(child)]),
      );
    return value;
  };
  const matches = (row: Readonly<Record<string, unknown>> | undefined): boolean =>
    row !== undefined &&
    canonicalize(comparable(row)) === canonicalize(comparable(verification.expected));
  const prior = await client.query(verification.sql, verification.values);
  if (prior.rows[0]) {
    if (!matches(prior.rows[0])) throw new SeedDatabaseConflict(identity, entity);
    return;
  }
  const result = await client.query(sql, values);
  if (result.rows[0]) return;
  const raced = await client.query(verification.sql, verification.values);
  if (!matches(raced.rows[0])) throw new SeedDatabaseConflict(identity, entity);
}

async function insertReleaseGraph(
  client: SeedSqlClient,
  release: SeedReleaseDocument,
  report: SeedValidationReport,
): Promise<void> {
  for (const entry of release.entries) {
    const family = entry.family;
    const revision = entry.revision;
    const rights = entry.rights;
    const rightsIdentity = recordAt(rights.identity, `/entries/${entry.seedKey}/rights/identity`);
    const accessibility = entry.accessibility;
    const rightsDigest = createHash("sha256").update(json(rights)).digest("hex");
    const accessibilityDigest = createHash("sha256").update(json(accessibility)).digest("hex");
    await insertImmutable(
      client,
      `INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest,predecessor_id,effective_at)
       VALUES($1,$2,$3,$4::jsonb,$5,$6,$7)
       ON CONFLICT(id) DO NOTHING RETURNING id`,
      [
        entry.rightsEnvelopeId,
        entry.rightsEnvelopeKey ?? entry.seedKey,
        entry.rightsState,
        json(rights),
        rightsDigest,
        rightsIdentity.predecessorRightsEnvelopeId ?? null,
        rightsIdentity.effectiveFrom ?? null,
      ],
      entry.rightsEnvelopeId,
      "rights_envelope",
      {
        sql: `SELECT envelope_key,state,envelope,digest,predecessor_id,effective_at
                FROM app.rights_envelopes WHERE id=$1`,
        values: [entry.rightsEnvelopeId],
        expected: {
          envelope_key: entry.rightsEnvelopeKey ?? entry.seedKey,
          state: entry.rightsState,
          envelope: rights,
          digest: rightsDigest,
          predecessor_id: rightsIdentity.predecessorRightsEnvelopeId ?? null,
          effective_at: rightsIdentity.effectiveFrom ?? null,
        },
      },
    );
    const accessibilityStatus = entry.accessibilityGate.status === "pass" ? "pass" : "blocked";
    await insertImmutable(
      client,
      `INSERT INTO app.accessibility_manifests(id,manifest,language_tag,gate_status,digest)
       VALUES($1,$2::jsonb,$3,$4,$5)
       ON CONFLICT(id) DO NOTHING RETURNING id`,
      [
        entry.accessibilityManifestId,
        json(accessibility),
        accessibility.languageTag,
        accessibilityStatus,
        accessibilityDigest,
      ],
      entry.accessibilityManifestId,
      "accessibility_manifest",
      {
        sql: `SELECT manifest,language_tag,gate_status,digest
                FROM app.accessibility_manifests WHERE id=$1`,
        values: [entry.accessibilityManifestId],
        expected: {
          manifest: accessibility,
          language_tag: accessibility.languageTag,
          gate_status: accessibilityStatus,
          digest: accessibilityDigest,
        },
      },
    );
    const taskDefinition = recordAt(family.taskDefinition, "family/taskDefinition");
    const assignmentBasis = {
      basis: family.assignmentBasis,
      sourceReviewState: family.reviewState,
    };
    await insertImmutable(
      client,
      `INSERT INTO app.content_families(id,family_key,task_definition_id,task_definition_revision,task_family_kind,assignment_basis,review_state)
       VALUES($1,$2,$3,$4,$5,$6::jsonb,'unresolved')
       ON CONFLICT(id) DO NOTHING RETURNING id`,
      [
        entry.familyId,
        entry.seedKey,
        taskDefinition.id,
        taskDefinition.revision,
        entry.taskFamily,
        json(assignmentBasis),
      ],
      entry.familyId,
      "content_family",
      {
        sql: `SELECT family_key,task_definition_id,task_definition_revision,task_family_kind,assignment_basis,review_state
                FROM app.content_families WHERE id=$1`,
        values: [entry.familyId],
        expected: {
          family_key: entry.seedKey,
          task_definition_id: taskDefinition.id,
          task_definition_revision: taskDefinition.revision,
          task_family_kind: entry.taskFamily,
          assignment_basis: assignmentBasis,
          review_state: "unresolved",
        },
      },
    );
    const approvalState =
      entry.intent === "quarantine_fixture"
        ? "quarantined"
        : entry.intent === "withdrawal_fixture"
          ? "retired"
          : "candidate";
    const rightsState = entry.rightsState === "current" ? "eligible" : "withdrawn";
    await insertImmutable(
      client,
      `INSERT INTO app.content_revisions(
         id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest,predecessor_id,
         content_class,task_definition_id,task_definition_revision,generation_brief_id,generation_brief_revision,
         target_blueprint_release,taxonomy_release,capability_refs,progression_profile,intended_evidence_roles,
         instruction,learner_payload,rights_envelope_id,accessibility_manifest_id,current_approval_decision_id,frozen_at)
       VALUES($1,$2,$3,'learning_practice',$4,$5,'compatible',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,$17::jsonb,$18::jsonb,$19::jsonb,$20,$21,NULL,NULL)
       ON CONFLICT(id) DO NOTHING RETURNING id`,
      [
        entry.revisionId,
        entry.familyId,
        entry.revisionLabel ?? entry.seedKey,
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
      entry.revisionId,
      "content_revision",
      {
        sql: `SELECT family_id,revision,role,compatibility_state,digest,predecessor_id,content_class,
                     task_definition_id,task_definition_revision,generation_brief_id,
                     generation_brief_revision,corpus_bundle_id,corpus_bundle_revision,
                     target_blueprint_release,taxonomy_release,capability_refs,progression_profile,
                     intended_evidence_roles,instruction,learner_payload
                FROM app.content_revisions WHERE id=$1`,
        values: [entry.revisionId],
        expected: {
          family_id: entry.familyId,
          revision: entry.revisionLabel ?? entry.seedKey,
          role: "learning_practice",
          compatibility_state: "compatible",
          digest: entry.digest,
          predecessor_id: entry.predecessorRevisionId,
          content_class: entry.contentClass,
          task_definition_id: recordAt(revision.taskDefinition, "revision/taskDefinition").id,
          task_definition_revision: recordAt(revision.taskDefinition, "revision/taskDefinition")
            .revision,
          generation_brief_id: recordAt(revision.generationBrief, "revision/generationBrief").id,
          generation_brief_revision: recordAt(revision.generationBrief, "revision/generationBrief")
            .revision,
          corpus_bundle_id: null,
          corpus_bundle_revision: null,
          target_blueprint_release: revision.targetBlueprintRelease,
          taxonomy_release: revision.taxonomyRelease,
          capability_refs: revision.capabilityRefs,
          progression_profile: revision.progressionProfile,
          intended_evidence_roles: revision.intendedEvidenceRoles,
          instruction: revision.instruction,
          learner_payload: revision.learnerPayload,
        },
      },
    );
    for (const rawItem of entry.revision.items) {
      const item = recordAt(rawItem, "revision/item");
      const scorable = recordAt(item.scorable, "revision/item/scorable");
      await insertImmutable(
        client,
        `INSERT INTO app.content_items(id,content_revision_id,predecessor_item_id,ordinal,response_kind,binding,scorable)
         VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)
         ON CONFLICT(id) DO NOTHING RETURNING id`,
        [
          item.contentItemId,
          entry.revisionId,
          item.predecessorItemId ?? null,
          item.ordinal,
          scorable.responseKind,
          json(item.binding),
          json(scorable),
        ],
        String(item.contentItemId),
        "content_item",
        {
          sql: `SELECT content_revision_id,predecessor_item_id,ordinal,response_kind,binding,scorable
                  FROM app.content_items WHERE id=$1`,
          values: [item.contentItemId],
          expected: {
            content_revision_id: entry.revisionId,
            predecessor_item_id: item.predecessorItemId ?? null,
            ordinal: item.ordinal,
            response_kind: scorable.responseKind,
            binding: item.binding,
            scorable,
          },
        },
      );
    }
    for (const rawKey of entry.keys) {
      const key = recordAt(rawKey, "key");
      const cardinality = recordAt(key.responseCardinality, "key/responseCardinality");
      const keyDigest = createHash("sha256").update(json(key)).digest("hex");
      await insertImmutable(
        client,
        `INSERT INTO app.key_revisions(id,content_revision_id,content_item_id,predecessor_id,accepted_response_set,response_cardinality_min,response_cardinality_max,scoring_policy_ref,decisive_evidence,distractor_rationale,intended_cause_mapping,independent_validation,digest)
         VALUES($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13)
         ON CONFLICT(id) DO NOTHING RETURNING id`,
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
          keyDigest,
        ],
        String(key.keyRevisionId),
        "key_revision",
        {
          sql: `SELECT content_revision_id,content_item_id,predecessor_id,digest
                  FROM app.key_revisions WHERE id=$1`,
          values: [key.keyRevisionId],
          expected: {
            content_revision_id: entry.revisionId,
            content_item_id: key.itemId,
            predecessor_id: key.predecessorKeyRevisionId ?? null,
            digest: keyDigest,
          },
        },
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
      const gateId = stableUuid(`seed-gate/${entry.revisionId}/${String(gate.gate)}`);
      await insertImmutable(
        client,
        `INSERT INTO app.content_gate_results(id,content_revision_id,gate,ordinal,status,gate_version,reviewer_ref,method_version,findings,material_defect,recorded_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11)
         ON CONFLICT(id) DO NOTHING RETURNING id`,
        [
          gateId,
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
        gateId,
        "content_gate_result",
        {
          sql: `SELECT content_revision_id,gate,ordinal,status,gate_version,reviewer_ref,method_version,
                       findings,material_defect,recorded_at
                  FROM app.content_gate_results WHERE id=$1`,
          values: [gateId],
          expected: {
            content_revision_id: entry.revisionId,
            gate: gate.gate,
            ordinal,
            status:
              gate.outcome === "passed"
                ? "pass"
                : gate.outcome === "failed"
                  ? "blocked"
                  : "not_evaluated",
            gate_version: gate.methodVersion,
            reviewer_ref: gate.reviewerRef,
            method_version: gate.methodVersion,
            findings: gate.detail ? [{ detail: gate.detail }] : [],
            material_defect: gate.materialDefect === true,
            recorded_at: gate.recordedAt,
          },
        },
      );
    }
  }
  const releaseDigest = seedDocumentDigest(release);
  await insertImmutable(
    client,
    `INSERT INTO app.content_releases(id,release_identity,state,digest,predecessor_id)
     VALUES($1,$2,'candidate',$3,$4)
     ON CONFLICT(id) DO NOTHING RETURNING id`,
    [
      release.releaseId,
      release.releaseIdentity,
      releaseDigest,
      report.release.priorActiveReleaseId,
    ],
    release.releaseId,
    "content_release",
    {
      sql: "SELECT release_identity,digest,predecessor_id FROM app.content_releases WHERE id=$1",
      values: [release.releaseId],
      expected: {
        release_identity: release.releaseIdentity,
        digest: releaseDigest,
        predecessor_id: report.release.priorActiveReleaseId,
      },
    },
  );
  for (const entry of release.entries)
    await insertImmutable(
      client,
      `INSERT INTO app.content_release_entries(release_id,content_revision_id,form_id)
       VALUES($1,$2,NULL)
       ON CONFLICT(release_id,content_revision_id) DO NOTHING RETURNING content_revision_id AS id`,
      [release.releaseId, entry.revisionId],
      `${release.releaseId}/${entry.revisionId}`,
      "content_release_entry",
      {
        sql: `SELECT form_id FROM app.content_release_entries
               WHERE release_id=$1 AND content_revision_id=$2`,
        values: [release.releaseId, entry.revisionId],
        expected: { form_id: null },
      },
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
    const entry = request.release.entries.find((candidate) => candidate.revisionId === revisionId);
    if (!entry) throw new Error("Withdrawal release entry is missing.");
    const successorRightsId = stableUuid(`content-seed-rights/${request.operationId}`);
    const originalIdentity = recordAt(entry.rights.identity, "withdraw/rights/identity");
    const successorRights = {
      ...entry.rights,
      identity: {
        ...originalIdentity,
        rightsEnvelopeId: successorRightsId,
        revision: Number(originalIdentity.revision) + 1,
        state: "withdrawn",
        effectiveFrom: request.occurredAt,
      },
      incidentDisposition: {
        reason: request.reason,
        purgeOrTombstoneConstraint:
          "Serving is withdrawn; immutable history remains resolvable and no validity fact changes.",
        successorRef: null,
        affectedArtifactSelectors: [revisionId],
        reviewOwner: "owner:approver",
      },
    };
    const rightsDigest = createHash("sha256").update(json(successorRights)).digest("hex");
    const rightsInsert = await client.query(
      `INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest,predecessor_id,effective_at)
       VALUES($1,$2,'withdrawn',$3::jsonb,$4,$5,$6)
       RETURNING id`,
      [
        successorRightsId,
        entry.seedKey,
        json(successorRights),
        rightsDigest,
        entry.rightsEnvelopeId,
        request.occurredAt,
      ],
    );
    if (!rightsInsert.rows[0]) throw new SeedDatabaseConflict(successorRightsId, "rights_envelope");
    await appendLifecycleDecisionAndImpact(client, request, entry, "retired", {
      causeKind: "rights_takedown",
      evidenceRefs: [successorRightsId],
    });
    await client.query(
      "UPDATE app.content_revisions SET rights_envelope_id=$2,rights_state='withdrawn' WHERE id=$1",
      [revisionId, successorRightsId],
    );
  } else if (request.command === "quarantine" && revisionId) {
    const entry = request.release.entries.find((candidate) => candidate.revisionId === revisionId);
    if (!entry) throw new Error("Quarantine release entry is missing.");
    await appendLifecycleDecisionAndImpact(client, request, entry, "quarantine", {
      causeKind: "content_defect",
      evidenceRefs: entry.keyRevisionIds,
    });
  } else if (request.command === "rollback" && request.selector) {
    const target = await client.query("SELECT state FROM app.content_releases WHERE id=$1", [
      request.selector,
    ]);
    if (!target.rows[0] || !["active", "retired"].includes(String(target.rows[0].state)))
      throw new SeedDatabaseConflict(request.selector, "approved_content_release");
    await client.query(
      "UPDATE app.content_releases SET state=CASE WHEN id=$1 THEN 'active' ELSE 'retired' END,activated_at=CASE WHEN id=$1 THEN transaction_timestamp() ELSE activated_at END,retired_at=CASE WHEN id=$1 THEN NULL ELSE transaction_timestamp() END WHERE release_identity=$2",
      [request.selector, request.release.releaseIdentity],
    );
  }
}

class SeedDatabaseConflict extends Error {
  public constructor(
    readonly identity: string,
    readonly entity: string,
  ) {
    super(`Immutable ${entity} ${identity} conflicts with the seed release.`);
  }
}

async function appendLifecycleDecisionAndImpact(
  client: SeedSqlClient,
  request: SeedPlanRequest,
  entry: SeedReleaseEntryDocument,
  level: "retired" | "quarantine",
  impact: {
    readonly causeKind: "rights_takedown" | "content_defect";
    readonly evidenceRefs: readonly string[];
  },
): Promise<void> {
  const decisionId = stableUuid(`content-seed-approval/${request.operationId}`);
  const impactAssertionId = stableUuid(`content-seed-impact/${request.operationId}`);
  const head = await client.query(
    `SELECT id FROM app.approval_decisions
      WHERE subject_kind='content_revision' AND subject_id=$1 AND outcome='granted'
      ORDER BY decided_at DESC,recorded_at DESC LIMIT 1`,
    [entry.revisionId],
  );
  const decision = await client.query(
    `INSERT INTO app.approval_decisions(id,subject_kind,subject_id,content_class,level,outcome,
       author_ref,validator_ref,approver_ref,method_version,reason_registry_id,reason_code,
       evidence_ref,predecessor_id,decided_at)
     VALUES($1,'content_revision',$2,'C3',$3,'granted','author:stage-05-seed',
       'operator:content-lifecycle-validator','operator:content-lifecycle-approver',
       'content-lifecycle/v1','reason-registry/v1.1',$4,$5,$6,$7)
     RETURNING id`,
    [
      decisionId,
      entry.revisionId,
      level,
      request.reason,
      `content-impact:${impactAssertionId}`,
      head.rows[0]?.id ?? null,
      request.occurredAt,
    ],
  );
  if (!decision.rows[0]) throw new SeedDatabaseConflict(decisionId, "approval_decision");
  const assertion = {
    incidentId: `content-seed/${request.operationId}`,
    ownerContext: "Content & Publication",
    actorRef: "operator:content-lifecycle-approver",
    authorizationVersion: "authorization/v1",
    causeKind: impact.causeKind,
    impactMode: "serving_only",
    requestedValidity: null,
    selectors: { contentRevisionIds: [entry.revisionId] },
    declaredCardinality: 0,
    affectedScope: [],
    unaffectedScope: [],
    reasonRegistryId: "reason-registry/v1.1",
    reasonCode: request.reason,
    evidenceRefs: [...impact.evidenceRefs, decisionId],
    policyAndContractVersions: {
      canonicalizationVersion: "canonical-json/v1",
      contentRelease: request.release.releaseId,
    },
    effectiveAt: request.occurredAt,
  };
  const assertionDigest = createHash("sha256").update(json(assertion)).digest("hex");
  const appended = await client.query(
    `INSERT INTO app.content_impact_assertions(id,incident_id,owner_context,actor_ref,
       authorization_version,cause_kind,impact_mode,requested_validity,selectors,
       declared_cardinality,affected_scope,unaffected_scope,reason_registry_id,reason_code,
       evidence_refs,policy_and_contract_versions,effective_at,digest)
     VALUES($1,$2,$3,$4,$5,$6,'serving_only',NULL,$7::jsonb,$8,$9::jsonb,$10::jsonb,$11,$12,$13::jsonb,$14::jsonb,$15,$16)
     RETURNING id`,
    [
      impactAssertionId,
      assertion.incidentId,
      assertion.ownerContext,
      assertion.actorRef,
      assertion.authorizationVersion,
      assertion.causeKind,
      json(assertion.selectors),
      assertion.declaredCardinality,
      json(assertion.affectedScope),
      json(assertion.unaffectedScope),
      assertion.reasonRegistryId,
      assertion.reasonCode,
      json(assertion.evidenceRefs),
      json(assertion.policyAndContractVersions),
      assertion.effectiveAt,
      assertionDigest,
    ],
  );
  if (!appended.rows[0])
    throw new SeedDatabaseConflict(impactAssertionId, "content_impact_assertion");
  await client.query(
    "UPDATE app.content_revisions SET current_approval_decision_id=$2,approval_state=$3 WHERE id=$1",
    [entry.revisionId, decisionId, level === "retired" ? "retired" : "quarantined"],
  );
}

function auditReasonCode(command: SeedCommand, reason: string | null): string {
  if (command === "withdraw" || command === "quarantine")
    return reason ?? "VALIDITY.CONTENT_APPROVAL";
  return command === "rollback" ? "FALLBACK.CONTENT_UPDATE_REQUIRED" : "VALIDITY.CONTENT_APPROVAL";
}

async function reconstructPostgresReport(
  client: SeedSqlClient,
  request: SeedPlanRequest,
  receipt: Readonly<Record<string, unknown>>,
): Promise<SeedValidationReport> {
  const priorActiveReleaseId = String(receipt.action).endsWith("_without_active_release")
    ? null
    : String(receipt.release);
  let revisions: SeedRevisionReport[] = [];
  if (request.command === "apply") {
    const serving = request.release.entries.filter((entry) => entry.intent === "serving");
    const recordedActions = await client.query(
      `SELECT action,target_digest,release
         FROM app.security_audit_events
        WHERE request_id=$1 AND target_class='content_revision'`,
      [stableUuid(`content-seed-operation/${request.operationId}`)],
    );
    const actionByDigest = new Map(
      recordedActions.rows.map((row) => [String(row.target_digest), String(row.action)]),
    );
    revisions = serving.map((entry) => {
      const recordedAction = actionByDigest.get(entry.digest);
      const action = recordedAction?.replace("content_seed_apply_", "") as
        | SeedDiffAction
        | undefined;
      if (
        !action ||
        !["create", "supersede", "unchanged"].includes(action) ||
        recordedActions.rows.find(
          (row) =>
            String(row.target_digest) === entry.digest &&
            String(row.release) !== request.release.releaseId,
        )
      ) {
        throw new SeedDatabaseConflict(entry.revisionId, "content_seed_apply_audit");
      }
      return reportFor(
        entry,
        action,
        action === "create"
          ? null
          : action === "supersede"
            ? entry.predecessorRevisionId
            : entry.revisionId,
      );
    });
    if (recordedActions.rows.length !== serving.length)
      throw new SeedDatabaseConflict(request.operationId, "content_seed_apply_audit_cardinality");
  } else if (request.command === "withdraw" || request.command === "quarantine") {
    const entry = request.release.entries.find(
      (candidate) =>
        candidate.seedKey === request.selector ||
        candidate.familyId === request.selector ||
        candidate.revisionId === request.selector,
    );
    if (!entry) throw new Error("Committed seed receipt refers to an absent release entry.");
    revisions = [reportFor(entry, request.command, entry.revisionId)];
  }
  const failures: SeedValidationReport["failures"] = [];
  return {
    schema: "bestehen-seed-validation-report/v1",
    command: request.command,
    dryRun: false,
    operationId: request.operationId,
    occurredAt: canonicalInstant(receipt.recorded_at, "security_audit_events.recorded_at"),
    release: {
      id: request.release.releaseId,
      identity: request.release.releaseIdentity,
      documentDigest: seedDocumentDigest(request.release),
      priorActiveReleaseId,
    },
    revisions,
    summary: {
      created: count(revisions, "create"),
      superseded: count(revisions, "supersede"),
      unchanged: count(revisions, "unchanged"),
      withdrawn: count(revisions, "withdraw"),
      quarantined: count(revisions, "quarantine"),
      rolledBack: request.command === "rollback" ? 1 : 0,
      hardFailures: 0,
    },
    failures,
  };
}

export async function executePostgresSeedCommand(
  pool: SeedSqlPool,
  request: Omit<SeedPlanRequest, "catalogue">,
): Promise<SeedValidationReport> {
  // `app.operation_receipts` is deliberately learner-scoped, so content seed operations may not
  // borrow it by inventing a learner. The security audit row below remains audit-shaped: it stores
  // a real target class, action, reason code, payload digest, release reference and recorded time.
  // Apply also records one audit-shaped action per content revision. Those facts reconstruct mixed
  // reports exactly; no report body is hidden in `target_class` or another classification column.
  const client = await pool.connect();
  const receiptId = stableUuid(`content-seed-operation/${request.operationId}`);
  let attemptedReport: SeedValidationReport | null = null;
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [request.operationId]);
    const receipt = await client.query(
      "SELECT target_digest,target_class,action,release,recorded_at FROM app.security_audit_events WHERE id=$1 AND target_class='content_seed_operation'",
      [receiptId],
    );
    const catalogue = await loadPostgresCatalogue(client, request.release.releaseIdentity);
    const transactionTime = await client.query("SELECT transaction_timestamp() AS occurred_at");
    const occurredAt = canonicalInstant(
      receipt.rows[0]?.recorded_at ?? transactionTime.rows[0]?.occurred_at ?? request.occurredAt,
      receipt.rows[0]?.recorded_at ? "security_audit_events.recorded_at" : "transaction_timestamp",
    );
    const fullRequest: SeedPlanRequest = { ...request, occurredAt, catalogue };
    const payloadDigest = requestPayloadDigest(fullRequest);
    const prior = receipt.rows[0];
    if (prior) {
      if (prior.target_digest !== payloadDigest) {
        const attempted = planSeedCommand(fullRequest).report;
        const conflict = planSeedCommand({
          ...fullRequest,
          catalogue: {
            ...catalogue,
            receipts: [
              {
                operationId: request.operationId,
                payloadDigest: String(prior.target_digest),
                report: attempted,
              },
            ],
          },
        });
        await client.query("ROLLBACK");
        return conflict.report;
      }
      const replay = await reconstructPostgresReport(client, fullRequest, prior);
      await client.query("COMMIT");
      return replay;
    }
    const plan = planSeedCommand(fullRequest);
    attemptedReport = plan.report;
    if (request.dryRun || plan.report.summary.hardFailures > 0) {
      await client.query("ROLLBACK");
      return plan.report;
    }
    await mutatePostgres(client, fullRequest, plan.report);
    if (request.command === "apply") {
      for (const revision of plan.report.revisions) {
        await client.query(
          `INSERT INTO app.security_audit_events(id,actor_scope,action,target_class,target_digest,
             outcome,reason_code,request_id,trace_id,release,retention_class)
           VALUES($1,'content-seed-cli',$2,'content_revision',$3,'allowed',
             'VALIDITY.CONTENT_APPROVAL',$4,$4,$5,'semantic_until_deletion')`,
          [
            stableUuid(`content-seed-operation/${request.operationId}/${revision.revisionId}`),
            `content_seed_apply_${revision.action}`,
            revision.digest,
            receiptId,
            request.release.releaseId,
          ],
        );
      }
    }
    await client.query(
      `INSERT INTO app.security_audit_events(id,actor_scope,action,target_class,target_digest,outcome,reason_code,request_id,trace_id,release,retention_class)
       VALUES($1,'content-seed-cli',$2,'content_seed_operation',$3,'allowed',$4,$1,$1,$5,'semantic_until_deletion')`,
      [
        receiptId,
        `content_seed_${request.command}_${plan.report.release.priorActiveReleaseId ? "with_active_release" : "without_active_release"}`,
        payloadDigest,
        auditReasonCode(request.command, request.reason),
        plan.report.release.priorActiveReleaseId ?? request.release.releaseId,
      ],
    );
    await client.query("COMMIT");
    return plan.report;
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof SeedDatabaseConflict && attemptedReport) {
      return {
        ...attemptedReport,
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
            code: "immutable_database_conflict",
            identity: error.identity,
            detail: error.message,
          },
        ],
      };
    }
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
