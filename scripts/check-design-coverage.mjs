import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { executableCheckIds } from "./check-design-coverage-ids.mjs";

const expectedInventory = {
  compactFrames: 41,
  largeExemplars: 8,
  componentFamilies: 43,
  icons: 20,
};
const expectedSchema = {
  coverageKinds: ["board", "compact-frame", "large-exemplar", "component-family", "icon"],
  sourceAnchorTypes: ["attribute", "heading", "design-token"],
  routeArchetypes: [
    "governance",
    "foundation",
    "entry",
    "coach",
    "attempt",
    "result",
    "repair",
    "readiness",
    "train",
    "mock",
    "progress",
    "account",
    "session",
    "skill-region",
    "system-state",
    "responsive-rule",
    "handoff",
    "component-library",
    "icon-library",
  ],
  semanticStates: [
    "valid",
    "partially_valid",
    "pending",
    "interrupted",
    "not_counted",
    "evidence_building",
    "not_ready",
    "borderline",
    "safe",
    "ready_to_book",
    "stale_contradicted",
    "processing",
    "slow",
    "partial",
    "unavailable",
    "retry_fresh",
    "signed_out",
    "callback_failed",
    "expired_idle",
    "expired_mid_attempt",
    "access_denied",
    "preparing",
    "sending",
    "queued_offline",
    "retrying",
    "not_sent",
    "sent",
    "requested",
    "building",
    "ready",
    "expired",
    "failed",
    "recent_auth_required",
    "confirmation_required",
    "revoking",
    "purge_running",
    "provider_pending",
    "live_purge_complete",
    "completed",
    "compare",
    "select",
    "merge",
  ],
  semanticReasons: [
    "VALIDITY.CONTENT_APPROVAL",
    "VALIDITY.RIGHTS_COMPATIBILITY",
    "VALIDITY.ACCESS_EQUIVALENCE",
    "VALIDITY.TECHNICAL_PREFLIGHT",
    "VALIDITY.IDENTITY_CLAIM_INVALID",
    "DIRECT.MISSING_WRITTEN",
    "DIRECT.MISSING_ORAL",
    "DIRECT.TARGET_CONDITION_GAP",
    "DIRECT.ASSISTANCE_DEPENDENT",
    "DIRECT.STALE_DIRECT_SAMPLE",
    "RISK.WRITTEN_BLOCKER",
    "RISK.ORAL_BLOCKER",
    "RISK.BOOKED_DATE",
    "RISK.MOCK_REVEALED",
    "UNCERTAINTY.PENDING_EVALUATION",
    "UNCERTAINTY.CONTRADICTORY_EVIDENCE",
    "UNCERTAINTY.CAUSE_UNRESOLVED",
    "UNCERTAINTY.PROJECTION_UPDATING",
    "DUE.TRANSFER_WINDOW",
    "DUE.RETENTION_WINDOW",
    "DUE.POST_MOCK_CLARIFIER",
    "PROGRESSION.REACHABLE_PREREQUISITE",
    "PROGRESSION.ASSISTANCE_FADE",
    "PROGRESSION.REALISM_PROBE",
    "COVERAGE.SECTION_AGING",
    "COVERAGE.TASK_FAMILY_GAP",
    "COVERAGE.NORMAL_ROTATION",
    "PREFERENCE.REQUESTED_SKILL",
    "PREFERENCE.REQUESTED_MODE",
    "PREFERENCE.VARIETY",
    "CONTEXT.TIME_CHANGED",
    "CONTEXT.LOW_ENERGY",
    "CONTEXT.NO_AUDIO",
    "CONTEXT.NO_MIC",
    "CONTEXT.OFFLINE",
    "CONTEXT.ACCESS_NEED",
    "FALLBACK.NO_VALID_PLAN",
    "FALLBACK.CONTENT_UNAVAILABLE",
    "FALLBACK.EVALUATOR_PENDING",
    "FALLBACK.TECHNICAL_FAULT",
    "FALLBACK.NO_FRESH_RETRY",
    "FALLBACK.AUTHORIZATION_DENIED",
    "FALLBACK.JOB_RETRY_EXHAUSTED",
  ],
  responsiveLanes: ["compact", "tablet", "desktop"],
  coverageStatuses: ["accepted", "corrected", "derived", "obsolete"],
};
const maximumTargetAnchorUses = 5;

function filesUnder(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

export function loadCoverageManifest(root = process.cwd()) {
  const source = execFileSync(
    process.execPath,
    [
      "--import=tsx",
      "--eval",
      `import { sourceAnchorManifest } from './packages/design-system/src/coverage/source-anchors.ts'; process.stdout.write(JSON.stringify(sourceAnchorManifest));`,
    ],
    { cwd: root, encoding: "utf8" },
  );
  return JSON.parse(source);
}

export function loadGeneratedCoverage(root = process.cwd()) {
  return JSON.parse(
    readFileSync(
      resolve(root, "packages/design-system/src/coverage/source-anchors.generated.json"),
      "utf8",
    ),
  );
}

export function collectExecutableCoverageIds(root = process.cwd()) {
  const evidenceFiles = ["apps", "packages", "scripts"]
    .flatMap((directory) => filesUnder(resolve(root, directory)))
    .filter(
      (path) =>
        /(?:\.(?:test|spec)\.(?:ts|tsx)|\.mjs)$/.test(path) &&
        !path.endsWith("scripts/check-design-coverage.mjs") &&
        !path.endsWith("scripts/check-design-coverage-ids.test.mjs"),
    );
  return new Set(
    evidenceFiles.flatMap((path) => [...executableCheckIds(readFileSync(path, "utf8"))]),
  );
}

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizedDesignText(contents) {
  return contents
    .replace(/<[^>]*>/g, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&ndash;", "–")
    .replaceAll("&mdash;", "—")
    .replace(/\s+/g, " ");
}

export function sourceAnchorResolves(row, contents) {
  const anchor = escapePattern(row.sourceAnchor);
  if (row.sourceAnchorType === "attribute") {
    return new RegExp(`\\b(?:id|data-frame)\\s*=\\s*["']${anchor}["']`, "i").test(contents);
  }
  const text = normalizedDesignText(contents);
  if (row.sourceAnchorType === "heading") {
    return new RegExp(`(?:^|\\s)${anchor}\\s*(?:·|—|–)`).test(text);
  }
  if (row.sourceAnchorType === "design-token") {
    return new RegExp(`(?:^|[\\s·])${anchor}(?=$|[\\s·(),;:/&])`).test(text);
  }
  return false;
}

function assertNonEmptyString(row, field) {
  if (typeof row[field] !== "string" || row[field].trim() === "") {
    throw new Error(`Missing required ${field} for ${row.id}`);
  }
}

function assertArray(row, field, { nonEmpty = false } = {}) {
  if (!Array.isArray(row[field]) || (nonEmpty && row[field].length === 0)) {
    throw new Error(`Missing required ${field} for ${row.id}`);
  }
}

function assertUnion(row, field, values, label, { nonEmpty = false } = {}) {
  assertArray(row, field, { nonEmpty });
  const allowed = new Set(values);
  const invalid = row[field].find((value) => !allowed.has(value));
  if (invalid !== undefined) throw new Error(`Invalid ${label} for ${row.id}: ${invalid}`);
}

function assertStableId(row) {
  const patterns = {
    board: /^0[1-6]-(?:s0[0-3]|a[1-5]|d[1-6]|[fach]|u[0-7]|v[0-9])$/,
    "compact-frame": /^CF-0[1-6]-\d{2}$/,
    "large-exemplar": /^LG-(?:D[1-5]|V[347])$/,
    "component-family": /^C(?:0[1-9]|[1-3]\d|4[0-3])$/,
    icon: /^I(?:0[1-9]|1\d|20)$/,
  };
  if (!patterns[row.kind]?.test(row.id))
    throw new Error(`Invalid stable ID for ${row.kind}: ${row.id}`);
}

export function validateCoverageManifest(
  manifest,
  { root = process.cwd(), generated, executableIds = collectExecutableCoverageIds(root) } = {},
) {
  if (manifest.version !== "p04-source-anchors/v2") {
    throw new Error(`Unsupported coverage manifest version: ${manifest.version}`);
  }
  if (JSON.stringify(manifest.schema) !== JSON.stringify(expectedSchema)) {
    throw new Error("Coverage manifest closed unions drifted");
  }
  if (JSON.stringify(manifest.inventory) !== JSON.stringify(expectedInventory)) {
    throw new Error(`P04 coverage drift: ${JSON.stringify(manifest.inventory)}`);
  }
  if (
    generated !== undefined &&
    JSON.stringify({ generatedFrom: "source-anchors.ts", ...manifest }) !==
      JSON.stringify(generated)
  ) {
    throw new Error("Generated source-anchor projection drifted from the typed manifest");
  }

  const collections = [
    ["board", manifest.boardAnchors, 37],
    ["compact-frame", manifest.compactFrames, 41],
    ["large-exemplar", manifest.largeExemplars, 8],
    ["component-family", manifest.componentFamilies, 43],
    ["icon", manifest.icons, 20],
  ];
  for (const [kind, rows, expectedCount] of collections) {
    if (!Array.isArray(rows) || rows.length !== expectedCount) {
      throw new Error(`Expected ${expectedCount} ${kind} rows`);
    }
    if (rows.some((row) => row.kind !== kind))
      throw new Error(`Invalid collection kind for ${kind}`);
  }
  const rows = collections.flatMap(([, entries]) => entries);
  const ids = rows.map((row) => row.id);
  if (new Set(ids).size !== ids.length)
    throw new Error("Source-anchor IDs are not globally unique");
  const componentIds = new Set(manifest.componentFamilies.map((row) => row.id));
  const iconIds = new Set(manifest.icons.map((row) => row.id));
  const targetAnchorUses = new Map();

  for (const row of rows) {
    for (const field of [
      "id",
      "sourcePath",
      "sourceAnchor",
      "sourceAnchorType",
      "kind",
      "routeArchetype",
      "targetPath",
      "targetAnchor",
      "status",
      "resolution",
    ])
      assertNonEmptyString(row, field);
    for (const field of [
      "semanticStates",
      "semanticReasons",
      "componentDependencies",
      "iconDependencies",
    ])
      assertArray(row, field);
    for (const field of [
      "targetImplementationExports",
      "automatedTestIds",
      "manualEvidenceIds",
      "responsiveLanes",
    ])
      assertArray(row, field, { nonEmpty: true });

    assertStableId(row);
    if (!expectedSchema.coverageKinds.includes(row.kind))
      throw new Error(`Invalid coverage kind for ${row.id}: ${row.kind}`);
    if (!expectedSchema.sourceAnchorTypes.includes(row.sourceAnchorType))
      throw new Error(`Invalid source anchor type for ${row.id}: ${row.sourceAnchorType}`);
    if (!expectedSchema.routeArchetypes.includes(row.routeArchetype))
      throw new Error(`Invalid route/archetype for ${row.id}: ${row.routeArchetype}`);
    if (!expectedSchema.coverageStatuses.includes(row.status))
      throw new Error(`Invalid coverage status for ${row.id}: ${row.status}`);
    assertUnion(row, "semanticStates", expectedSchema.semanticStates, "semantic state");
    assertUnion(row, "semanticReasons", expectedSchema.semanticReasons, "semantic reason");
    assertUnion(row, "responsiveLanes", expectedSchema.responsiveLanes, "responsive lane", {
      nonEmpty: true,
    });

    const unresolvedComponent = row.componentDependencies.find((id) => !componentIds.has(id));
    if (unresolvedComponent)
      throw new Error(
        `Unresolved component family dependency for ${row.id}: ${unresolvedComponent}`,
      );
    const unresolvedIcon = row.iconDependencies.find((id) => !iconIds.has(id));
    if (unresolvedIcon)
      throw new Error(`Unresolved icon dependency for ${row.id}: ${unresolvedIcon}`);
    if (
      (row.kind === "component-family" || row.kind === "icon") &&
      !row.sourcePath.startsWith("Design/")
    ) {
      throw new Error(`Component/icon row must cite its Design source: ${row.id}`);
    }

    const sourcePath = resolve(root, row.sourcePath);
    const targetPath = resolve(root, row.targetPath);
    if (!existsSync(sourcePath))
      throw new Error(`Missing coverage source: ${row.id} -> ${row.sourcePath}`);
    if (!existsSync(targetPath))
      throw new Error(`Missing coverage target: ${row.id} -> ${row.targetPath}`);
    const sourceContents = readFileSync(sourcePath, "utf8");
    const targetContents = readFileSync(targetPath, "utf8");
    if (!sourceAnchorResolves(row, sourceContents)) {
      throw new Error(
        `Unresolved coverage source anchor: ${row.id} -> ${row.sourcePath}#${row.sourceAnchor}`,
      );
    }
    if (!targetContents.includes(row.targetAnchor)) {
      throw new Error(
        `Unresolved coverage target anchor: ${row.id} -> ${row.targetPath}#${row.targetAnchor}`,
      );
    }
    const unresolvedExport = row.targetImplementationExports.find(
      (name) => !targetContents.includes(name),
    );
    if (unresolvedExport)
      throw new Error(`Unresolved target implementation export for ${row.id}: ${unresolvedExport}`);

    if (row.automatedTestIds.some((id) => !manifest.tests.includes(id)))
      throw new Error(`Invalid test mapping for ${row.id}`);
    if (row.automatedTestIds.some((id) => !executableIds.has(id))) {
      throw new Error(
        `Non-executable test mapping for ${row.id}: ${row.automatedTestIds.join(", ")}`,
      );
    }
    if (row.manualEvidenceIds.some((id) => !/^P04-MANUAL-[A-Za-z0-9-]+$/.test(id))) {
      throw new Error(`Invalid manual evidence ID for ${row.id}`);
    }

    const targetKey = `${row.targetPath}#${row.targetAnchor}`;
    targetAnchorUses.set(targetKey, [...(targetAnchorUses.get(targetKey) ?? []), row.id]);
  }

  for (const [targetKey, targetIds] of targetAnchorUses) {
    if (targetIds.length > maximumTargetAnchorUses) {
      throw new Error(`Over-reused target anchor: ${targetKey} serves ${targetIds.join(", ")}`);
    }
  }
  return { rows: rows.length, targetAnchors: targetAnchorUses.size };
}

export function runCoverageCheck(root = process.cwd()) {
  const manifest = loadCoverageManifest(root);
  const generated = loadGeneratedCoverage(root);
  const result = validateCoverageManifest(manifest, { root, generated });
  process.stdout.write(
    `P04-COVERAGE-001 full reciprocal 37/41/8/43/20 projection passed (${result.targetAnchors} target anchors).\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCoverageCheck();
}
