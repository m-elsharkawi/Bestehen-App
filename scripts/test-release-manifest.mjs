import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import process from "node:process";
import { collectExecutableCoverageIds } from "./check-design-coverage.mjs";
import { requiredChecks, validateManifest } from "./release-manifest.mjs";

const digest = `sha256:${"a".repeat(64)}`;
const commit = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
const checks = requiredChecks.flatMap((check) => ["--check", `${check}=local:synthetic-pass`]);
const executableStage05Checks = [
  "P05-DOMAIN-001",
  "P05-CONTENT-001",
  "P05-KEY-001",
  "P05-RIGHTS-001",
  "P05-FRESH-001",
  "P05-SCORE-001",
  "P05-SEED-001",
  "P05-SCHEMA-001",
  "P05-IDEMPOTENCY-001",
  "P05-JOB-001",
  "P05-EVIDENCE-001",
  "P05-CONTRACT-001",
  "P05-AUTHZ-001",
  "P05-SECURITY-001",
  "P05-BOUNDARY-001",
  "P05-LISTENING-001",
  "P05-MEDIA-001",
  "P05-FOUNDATION-001",
  "P05-COMPONENT-001",
  "P05-CONTRAST-001",
  "P05-COPY-001",
  "P05-EQUIV-001",
  "P05-A11Y-001",
  "P05-RSP-001",
  "P05-RECOVERY-001",
  "P05-COMPAT-001",
  "P05-PERF-001",
  "P05-SCOPE-001",
  "P05-RELEASE-001",
];

function run(arguments_, expectedStatus, environment = {}) {
  const result = spawnSync(process.execPath, ["scripts/release-manifest.mjs", ...arguments_], {
    encoding: "utf8",
    env: { ...process.env, ...environment },
  });
  if (result.status !== expectedStatus) {
    throw new Error(`Manifest fixture returned ${result.status}: ${result.stderr}`);
  }
  return result;
}

const validManifest = JSON.parse(
  run(
    ["--dry-run", "--commit", commit, "--web-digest", digest, "--worker-digest", digest, ...checks],
    0,
  ).stdout,
);

if (
  JSON.stringify(requiredChecks.filter((check) => check.startsWith("P05-"))) !==
  JSON.stringify(executableStage05Checks)
) {
  throw new Error("Release schema Stage 05 checks drifted from the currently executable set");
}
const scriptProducedChecks = new Set(["P05-PERF-001", "P05-SCOPE-001", "P05-RELEASE-001"]);
const executableTestIds = collectExecutableCoverageIds();
const conditionalExecutableChecks = new Map([
  [
    "P05-SCHEMA-001",
    {
      path: "packages/infrastructure/src/postgres/postgres.integration.test.ts",
      title: /describe\.skipIf\(!testDatabaseUrl\)\(\s*["']P05-SCHEMA-001\b/,
    },
  ],
]);
for (const [check, evidence] of conditionalExecutableChecks) {
  if (!evidence.title.test(readFileSync(evidence.path, "utf8"))) {
    throw new Error(`${check} is not bound to its conditional executable test title`);
  }
}
const missingExecutableTestIds = executableStage05Checks.filter(
  (check) =>
    !scriptProducedChecks.has(check) &&
    !executableTestIds.has(check) &&
    !conditionalExecutableChecks.has(check),
);
if (missingExecutableTestIds.length > 0) {
  throw new Error(`Release schema claims non-executable test IDs: ${missingExecutableTestIds}`);
}
const expectedWorkflowLoop = `for CHECK_ID in ${requiredChecks.join(" ")}; do`;
for (const workflow of [".github/workflows/ci.yml", ".github/workflows/release-candidate.yml"]) {
  if (!readFileSync(workflow, "utf8").includes(expectedWorkflowLoop)) {
    throw new Error(`${workflow} check loop drifted from the release schema`);
  }
}
if (
  readFileSync(".github/workflows/ci.yml", "utf8").includes(
    "- implementation/personal-05-content-deterministic-runtime",
  )
) {
  throw new Error("Stage 05 must not add a push trigger");
}
if (
  validManifest.database.minimumRevision !== "20260825_040_p03_foundation" ||
  validManifest.database.maximumRevision !== "20260905_062_p05_listening_runtime"
) {
  throw new Error("Release manifest carries the wrong Stage 05 database window");
}
if (
  validManifest.releaseAxes.application !== "stage-05-runtime" ||
  validManifest.releaseAxes.content !== "stage-05-content-v1" ||
  validManifest.releaseAxes.evaluation !== "not-produced" ||
  validManifest.releaseAxes.model !== "not-produced"
) {
  throw new Error("Release manifest carries the wrong Stage 05 release axes");
}
const contentReleaseIdentity = readFileSync("packages/content/src/model.ts", "utf8").match(
  /export const contentReleaseIdentity = "([^"]+)"/,
)?.[1];
if (!contentReleaseIdentity || validManifest.releaseAxes.content !== contentReleaseIdentity) {
  throw new Error("Release content axis drifted from the canonical content release identity");
}

function expectSchemaInvalid(mutator) {
  const fixture = structuredClone(validManifest);
  mutator(fixture);
  let rejected = false;
  try {
    validateManifest(fixture);
  } catch (error) {
    rejected = error instanceof Error && error.message.includes("violates its JSON Schema");
  }
  if (!rejected) throw new Error("Schema-invalid release manifest fixture was accepted");
}

expectSchemaInvalid((manifest) => {
  manifest.createdAt = "not-a-date";
});
expectSchemaInvalid((manifest) => {
  manifest.builder = "";
});
expectSchemaInvalid((manifest) => {
  manifest.unexpected = true;
});
expectSchemaInvalid((manifest) => {
  delete manifest.checks["P01-DOC-001"];
});
expectSchemaInvalid((manifest) => {
  delete manifest.checks["P02-READINESS-001"];
});
expectSchemaInvalid((manifest) => {
  delete manifest.checks["P03-AUTHZ-001"];
});
expectSchemaInvalid((manifest) => {
  delete manifest.checks["P04-COMPONENT-001"];
});
for (const check of executableStage05Checks) {
  expectSchemaInvalid((manifest) => {
    delete manifest.checks[check];
  });
}
expectSchemaInvalid((manifest) => {
  manifest.database.maximumRevision = "20260904_060_p05_transcript_lineage";
});
expectSchemaInvalid((manifest) => {
  manifest.releaseAxes.content = "not-produced";
});

run(
  ["--dry-run", "--commit", commit, "--web-digest", digest, "--worker-digest", digest, ...checks],
  1,
  { RELEASE_MANIFEST_TEST_DIRTY: "true" },
);
run(["--dry-run", "--commit", "HEAD", "--web-digest", digest, "--worker-digest", digest], 1);
run(["--dry-run", "--commit", commit, "--web-digest", digest], 1);

const untrackedFixture = `.release-manifest-untracked-${process.pid}`;
try {
  writeFileSync(untrackedFixture, "synthetic untracked fixture\n", "utf8");
  run(
    ["--dry-run", "--commit", commit, "--web-digest", digest, "--worker-digest", digest, ...checks],
    1,
  );
} finally {
  rmSync(untrackedFixture, { force: true });
}
process.stdout.write(
  "P05-RELEASE-001 passed: the Stage 05 axes, P03..062 window, executable check set, and dirty-tree refusal are enforced.\n",
);
