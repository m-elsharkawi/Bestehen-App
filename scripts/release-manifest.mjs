import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const requiredChecks = [
  "P01-BASE-001",
  "P01-SCOPE-001",
  "P01-DEPS-001",
  "P01-BOUNDARY-001",
  "P01-TYPE-001",
  "P01-STYLE-001",
  "P01-UNIT-001",
  "P01-CONFIG-001",
  "P01-SECRET-001",
  "P01-PG-001",
  "P01-JOB-001",
  "P01-HTTP-001",
  "P01-A11Y-001",
  "P01-OCI-WEB-001",
  "P01-OCI-WORKER-001",
  "P01-RELEASE-001",
  "P01-DOC-001",
];

function git(arguments_) {
  return execFileSync("git", arguments_, { encoding: "utf8" }).trim();
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

export function parseArguments(arguments_) {
  const values = { checks: {} };
  for (let index = 0; index < arguments_.length; index += 1) {
    const name = arguments_[index];
    if (name === "--dry-run") {
      values.dryRun = true;
      continue;
    }
    const value = arguments_[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${name}`);
    index += 1;
    if (name === "--check") {
      const separator = value.indexOf("=");
      if (separator < 1) throw new Error("--check must be CHECK-ID=evidence-reference");
      values.checks[value.slice(0, separator)] = value.slice(separator + 1);
    } else if (name === "--commit") values.commit = value;
    else if (name === "--web-digest") values.webDigest = value;
    else if (name === "--worker-digest") values.workerDigest = value;
    else if (name === "--output") values.output = value;
    else throw new Error(`Unknown argument ${name}`);
  }
  return values;
}

export function validateManifest(manifest) {
  const digestPattern = /^sha256:[a-f0-9]{64}$/;
  if (manifest.schemaVersion !== 1) throw new Error("Unsupported manifest schema version");
  if (!/^[a-f0-9]{40}$/.test(manifest.commit)) throw new Error("Commit must be an exact SHA");
  if (manifest.dirty !== false) throw new Error("Dirty releases are forbidden");
  if (!digestPattern.test(manifest.images.web) || !digestPattern.test(manifest.images.worker)) {
    throw new Error("Both immutable image digests are required");
  }
  if (!/^[a-f0-9]{64}$/.test(manifest.dependencies.lockSha256)) {
    throw new Error("Invalid dependency lock digest");
  }
  if (
    manifest.runtime.node !== "24.19.0" ||
    manifest.runtime.pnpm !== "11.23.0" ||
    manifest.database.postgres !== "18.6" ||
    manifest.database.minimumRevision !== "baseline" ||
    manifest.database.maximumRevision !== "baseline" ||
    manifest.database.migrationOwner !== "explicit-migrator"
  ) {
    throw new Error("Runtime or schema compatibility identity drifted");
  }
  if (
    manifest.tools.typescript !== "5.9.3" ||
    manifest.tools.biome !== "2.5.10" ||
    manifest.tools.vitest !== "4.1.11" ||
    manifest.tools.playwright !== "1.62.1"
  ) {
    throw new Error("Tool identity drifted");
  }
  const expectedActions = {
    checkout: "3d3c42e5aac5ba805825da76410c181273ba90b1",
    setupNode: "820762786026740c76f36085b0efc47a31fe5020",
    pnpmSetup: "0977fd99725f1db4007ccb2928dbb4e90d06cc86",
    uploadArtifact: "043fb46d1a93c77aae656e7c1c64a875d1fc6a0a",
    downloadArtifact: "3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c",
    dependencyReview: "a1d282b36b6f3519aa1f3fc636f609c47dddb294",
    setupBuildx: "37fe631027851001ddb9b187196cc803df7f5f0e",
    buildPush: "53b7df96c91f9c12dcc8a07bcb9ccacbed38856a",
  };
  if (Object.entries(expectedActions).some(([name, sha]) => manifest.actions[name] !== sha)) {
    throw new Error("Workflow action identity drifted");
  }
  if (
    manifest.containerBases.node !==
      "sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03" ||
    manifest.containerBases.postgres !==
      "sha256:7d2695c3aa88e792e8b3b233e7e4adb296a20412c6c0ca361e3edaaacfada108"
  ) {
    throw new Error("Container base identity drifted");
  }
  if (Object.values(manifest.flags).some((value) => value !== false)) {
    throw new Error("Stage 01 release flags must remain closed");
  }
  const missing = requiredChecks.filter((check) => !manifest.checks[check]);
  if (missing.length > 0) throw new Error(`Missing check evidence: ${missing.join(", ")}`);
  if (
    manifest.releaseAxes.application !== "stage-01-baseline" ||
    [
      manifest.releaseAxes.content,
      manifest.releaseAxes.evaluation,
      manifest.releaseAxes.model,
    ].some((value) => value !== "not-produced")
  ) {
    throw new Error("Release axes are incomplete or mutable");
  }
  return manifest;
}

export function createManifest(options) {
  if (!/^[a-f0-9]{40}$/.test(options.commit ?? "")) {
    throw new Error("--commit must be an exact 40-character lowercase SHA");
  }
  if (git(["rev-parse", "HEAD"]) !== options.commit) {
    throw new Error("Requested commit does not equal the checked-out commit");
  }
  if (
    git(["status", "--porcelain", "--untracked-files=no"]) ||
    process.env.RELEASE_MANIFEST_TEST_DIRTY === "true"
  ) {
    throw new Error("Release manifest refuses a dirty tracked worktree");
  }
  const createdAt = process.env.SOURCE_DATE_EPOCH
    ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
    : new Date().toISOString();
  return validateManifest({
    schemaVersion: 1,
    commit: options.commit,
    dirty: false,
    createdAt,
    builder: process.env.GITHUB_RUN_ID
      ? `github-actions:${process.env.GITHUB_RUN_ID}`
      : "local-synthetic",
    dependencies: { lockSha256: sha256("pnpm-lock.yaml") },
    images: { web: options.webDigest, worker: options.workerDigest },
    database: {
      postgres: "18.6",
      minimumRevision: "baseline",
      maximumRevision: "baseline",
      migrationOwner: "explicit-migrator",
    },
    runtime: { node: "24.19.0", pnpm: "11.23.0" },
    tools: {
      typescript: "5.9.3",
      biome: "2.5.10",
      vitest: "4.1.11",
      playwright: "1.62.1",
    },
    actions: {
      checkout: "3d3c42e5aac5ba805825da76410c181273ba90b1",
      setupNode: "820762786026740c76f36085b0efc47a31fe5020",
      pnpmSetup: "0977fd99725f1db4007ccb2928dbb4e90d06cc86",
      uploadArtifact: "043fb46d1a93c77aae656e7c1c64a875d1fc6a0a",
      downloadArtifact: "3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c",
      dependencyReview: "a1d282b36b6f3519aa1f3fc636f609c47dddb294",
      setupBuildx: "37fe631027851001ddb9b187196cc803df7f5f0e",
      buildPush: "53b7df96c91f9c12dcc8a07bcb9ccacbed38856a",
    },
    containerBases: {
      node: "sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03",
      postgres: "sha256:7d2695c3aa88e792e8b3b233e7e4adb296a20412c6c0ca361e3edaaacfada108",
    },
    releaseAxes: {
      application: "stage-01-baseline",
      content: "not-produced",
      evaluation: "not-produced",
      model: "not-produced",
    },
    flags: {
      guestPresentation: false,
      accountOptionalPresentation: false,
      externalProviderCalls: false,
      paidProductiveProcessing: false,
      publicObjectAccess: false,
      experimentalProductBehavior: false,
    },
    checks: options.checks,
  });
}

function main() {
  JSON.parse(readFileSync("schemas/release-manifest.schema.json", "utf8"));
  const options = parseArguments(process.argv.slice(2));
  const manifest = createManifest(options);
  const output = `${JSON.stringify(manifest, null, 2)}\n`;
  if (options.output && !options.dryRun)
    writeFileSync(path.resolve(options.output), output, "utf8");
  else process.stdout.write(output);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : "Manifest generation failed"}\n`,
    );
    process.exitCode = 1;
  }
}
