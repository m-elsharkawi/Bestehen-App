import { spawnSync } from "node:child_process";
import process from "node:process";
import { requiredChecks } from "./release-manifest.mjs";

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
}

run(
  ["--dry-run", "--commit", commit, "--web-digest", digest, "--worker-digest", digest, ...checks],
  0,
);
run(["--dry-run", "--commit", "HEAD", "--web-digest", digest, "--worker-digest", digest], 1);
run(["--dry-run", "--commit", commit, "--web-digest", digest], 1);
run(
  ["--dry-run", "--commit", commit, "--web-digest", digest, "--worker-digest", digest, ...checks],
  1,
  { RELEASE_MANIFEST_TEST_DIRTY: "true" },
);
process.stdout.write(
  "Release manifest accepts complete immutable evidence and rejects mutable/missing inputs.\n",
);
