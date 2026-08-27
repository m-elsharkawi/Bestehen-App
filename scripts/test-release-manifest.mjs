import { spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import process from "node:process";
import { requiredChecks, validateManifest } from "./release-manifest.mjs";

const digest = `sha256:${"a".repeat(64)}`;
const commit = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
const checks = requiredChecks.flatMap((check) => ["--check", `${check}=local:synthetic-pass`]);

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
  "Release manifest validates its schema and rejects mutable, missing, dirty, and untracked inputs.\n",
);
