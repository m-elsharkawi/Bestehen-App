import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schema = JSON.parse(readFileSync("schemas/release-manifest.schema.json", "utf8"));
export const requiredChecks = Object.freeze([...schema.properties.checks.required]);
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

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
  if (!validateSchema(manifest)) {
    throw new Error(
      `Release manifest violates its JSON Schema: ${ajv.errorsText(validateSchema.errors, {
        separator: "; ",
      })}`,
    );
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
  if (git(["status", "--porcelain"]) || process.env.RELEASE_MANIFEST_TEST_DIRTY === "true") {
    throw new Error("Release manifest refuses a dirty worktree");
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
      minimumRevision: "20260825_040_p03_foundation",
      maximumRevision: "20260825_040_p03_foundation",
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
      setupBuildx: "37fe631027851001ddb9b187196cc803df7f5f0e",
      buildPush: "53b7df96c91f9c12dcc8a07bcb9ccacbed38856a",
    },
    containerBases: {
      node: "sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df",
      postgres: "sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af",
    },
    releaseAxes: {
      application: "stage-03-foundation",
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
