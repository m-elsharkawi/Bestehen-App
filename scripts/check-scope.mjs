import { execFileSync } from "node:child_process";
import process from "node:process";
import { pathToFileURL } from "node:url";

const baseline = process.env.STAGE_BASE_SHA ?? "5c7e8b1ebdd2370b519b2d984b0ff732851b89ae";
export const stage01Branch = "implementation/personal-01-repository-delivery-baseline";
const allowed = [
  /^\.dockerignore$/,
  /^\.env\.example$/,
  /^\.github\//,
  /^\.gitignore$/,
  /^\.node-version$/,
  /^\.npmrc$/,
  /^Dockerfile\.(?:web|worker)$/,
  /^README\.md$/,
  /^apps\//,
  /^biome\.jsonc$/,
  /^compose\.yaml$/,
  /^dependency-cruiser\.cjs$/,
  /^docs\//,
  /^package\.json$/,
  /^packages\//,
  /^playwright\.config\.ts$/,
  /^pnpm-lock\.yaml$/,
  /^pnpm-workspace\.yaml$/,
  /^schemas\//,
  /^scripts\//,
  /^tsconfig(?:\.base)?\.json$/,
  /^vitest(?:\.config|\.workspace)\.ts$/,
  /^Implementation\/Personal\/01-repository-delivery-baseline\/(?:plan|handoff)\.md$/,
  /^prompts\/implementation\/personal\/personal-implementation-checklist\.md$/,
];

export function scopeRef({ githubHeadRef, githubRefName, localBranch }) {
  return githubHeadRef || githubRefName || localBranch;
}

export function stage01ScopeApplies(context) {
  return scopeRef(context) === stage01Branch;
}

export function unexpectedStage01Paths(changed) {
  return changed.filter((file) => !allowed.some((pattern) => pattern.test(file)));
}

function main() {
  const context = {
    githubHeadRef: process.env.GITHUB_HEAD_REF,
    githubRefName: process.env.GITHUB_REF_NAME,
    localBranch: execFileSync("git", ["branch", "--show-current"], {
      encoding: "utf8",
    }).trim(),
  };
  if (!stage01ScopeApplies(context)) {
    process.stdout.write(
      `Stage 01 scope is not applicable on ${scopeRef(context) || "detached HEAD"}.\n`,
    );
    return;
  }

  execFileSync("git", ["merge-base", "--is-ancestor", baseline, "HEAD"]);
  const changed = execFileSync("git", ["diff", "--name-only", baseline], {
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);
  const unexpected = unexpectedStage01Paths(changed);
  if (unexpected.length > 0)
    throw new Error(`Stage 01 scope contains unexpected paths: ${unexpected}`);
  if (changed.some((file) => /^(?:Architecture|Design)\//.test(file))) {
    throw new Error("Architecture and design sources are immutable during Stage 01 execution");
  }
  process.stdout.write(
    `Stage 01 scope valid for ${changed.length} changed paths from ${baseline}.\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
