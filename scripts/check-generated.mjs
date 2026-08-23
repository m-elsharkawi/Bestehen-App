import { execFileSync } from "node:child_process";
import process from "node:process";

function run(command, arguments_) {
  return execFileSync(command, arguments_, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

run("git", ["diff", "--check"]);
run("pnpm", ["install", "--lockfile-only", "--offline", "--frozen-lockfile"]);
run("git", ["diff", "--exit-code", "--", "pnpm-lock.yaml"]);

const tracked = run("git", ["ls-files"]).trim().split("\n").filter(Boolean);
const forbidden = tracked.filter((file) =>
  /(^|\/)(?:dist|\.next|coverage|playwright-report|test-results|evidence)(?:\/|$)|\.tsbuildinfo$/.test(
    file,
  ),
);
if (forbidden.length > 0) throw new Error(`Generated outputs are tracked: ${forbidden.join(", ")}`);
process.stdout.write("Generated-file policy and offline frozen lock regeneration passed.\n");
