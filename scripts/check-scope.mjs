import { execFileSync } from "node:child_process";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const stage01Branch = "implementation/personal-01-repository-delivery-baseline";
export const stage02Branch = "implementation/personal-02-provider-service-setup";
export const stage03Branch = "implementation/personal-03-domain-data-jobs-auth";
export const stage04Branch = "implementation/personal-04-responsive-web-design-system";
const stage01Baseline = "5c7e8b1ebdd2370b519b2d984b0ff732851b89ae";
const stage02Baseline = "e6491b8628c723614e38e56ffa25cfebb74d229b";
const stage03Baseline = "f466e29ee07b06da19130d60e2887be1e088c68b";
const stage04Baseline = "c39ec9c1ecb3a3dd2220ea28f7f71ecf88322cf8";
const stage01Allowed = [
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
const stage02Allowed = [
  /^\.env\.example$/,
  /^\.github\/workflows\/ci\.yml$/,
  /^config\/personal-provider-readiness\.example\.json$/,
  /^docs\/configuration\.md$/,
  /^docs\/setup\/personal\//,
  /^Implementation\/Personal\/02-provider-service-setup\/handoff\.md$/,
  /^package\.json$/,
  /^packages\/(?:application|configuration|infrastructure)\/src\/index(?:\.test)?\.ts$/,
  /^prompts\/implementation\/personal\/personal-implementation-checklist\.md$/,
  /^schemas\/personal-provider-readiness\.schema\.json$/,
  /^schemas\/release-manifest\.schema\.json$/,
  /^scripts\/(?:check-docs|check-provider-readiness|check-scope|test-release-manifest|test-scope)\.mjs$/,
];
const stage03Allowed = [
  /^\.env\.example$/,
  /^\.github\/workflows\/(?:ci|release-candidate)\.yml$/,
  /^apps\/web\/(?:package\.json|tsconfig\.json|src\/app\/(?:api\/v1\/owner\/status|auth\/[^/]+)\/[^/]+|src\/server\/(?:identity|runtime)\.ts|tests\/baseline\.spec\.ts)$/,
  /^apps\/worker\/(?:src\/index\.ts|tests\/baseline\.process\.test\.ts)$/,
  /^compose\.yaml$/,
  /^docs\/(?:configuration|local-development)\.md$/,
  /^docs\/setup\/personal\/(?:05-auth0-eu-email-otp|09-staging-readiness)\.md$/,
  /^Implementation\/Personal\/03-domain-data-jobs-auth\/handoff\.md$/,
  /^package\.json$/,
  /^packages\/(?:application|configuration|contracts|domain)\/src\/index(?:\.test)?\.ts$/,
  /^packages\/infrastructure\/(?:package\.json|src\/)/,
  /^playwright\.config\.ts$/,
  /^pnpm-lock\.yaml$/,
  /^prompts\/implementation\/personal\/personal-implementation-checklist\.md$/,
  /^schemas\/release-manifest\.schema\.json$/,
  /^scripts\/(?:check-docs|check-scope|release-manifest|test-oci|test-release-manifest|test-scope)\.mjs$/,
];
const stage04Allowed = [
  /^\.github\/workflows\/ci\.yml$/,
  /^apps\/web\/(?:package\.json|src\/app\/|src\/server\/frontend-data\.ts|src\/ui\/|tests\/p04-)/,
  /^Implementation\/Personal\/04-responsive-web-design-system\/handoff\.md$/,
  /^package\.json$/,
  /^packages\/contracts\/src\/(?:index|ui-projections)(?:\.test)?\.ts$/,
  /^packages\/design-system\//,
  /^playwright\.config\.ts$/,
  /^prompts\/implementation\/personal\/personal-implementation-checklist\.md$/,
  /^scripts\/(?:check-assets|check-design-coverage|check-scope|check-web-budget|test-scope)\.mjs$/,
];

export function scopeRef({ githubHeadRef, githubRefName, localBranch }) {
  return githubHeadRef || githubRefName || localBranch;
}

export function stage01ScopeApplies(context) {
  return scopeRef(context) === stage01Branch;
}

export function stage02ScopeApplies(context) {
  return scopeRef(context) === stage02Branch;
}

export function stage03ScopeApplies(context) {
  return scopeRef(context) === stage03Branch;
}

export function stage04ScopeApplies(context) {
  return scopeRef(context) === stage04Branch;
}

export function unexpectedStage01Paths(changed) {
  return changed.filter((file) => !stage01Allowed.some((pattern) => pattern.test(file)));
}

export function unexpectedStage02Paths(changed) {
  return changed.filter((file) => !stage02Allowed.some((pattern) => pattern.test(file)));
}

export function unexpectedStage03Paths(changed) {
  return changed.filter((file) => !stage03Allowed.some((pattern) => pattern.test(file)));
}

export function unexpectedStage04Paths(changed) {
  return changed.filter((file) => !stage04Allowed.some((pattern) => pattern.test(file)));
}

function main() {
  const context = {
    githubHeadRef: process.env.GITHUB_HEAD_REF,
    githubRefName: process.env.GITHUB_REF_NAME,
    localBranch: execFileSync("git", ["branch", "--show-current"], {
      encoding: "utf8",
    }).trim(),
  };
  const stage = stage01ScopeApplies(context)
    ? { baseline: stage01Baseline, label: "Stage 01", unexpected: unexpectedStage01Paths }
    : stage02ScopeApplies(context)
      ? { baseline: stage02Baseline, label: "P02-SCOPE-001", unexpected: unexpectedStage02Paths }
      : stage03ScopeApplies(context)
        ? { baseline: stage03Baseline, label: "P03-SCOPE-001", unexpected: unexpectedStage03Paths }
        : stage04ScopeApplies(context)
          ? {
              baseline: stage04Baseline,
              label: "P04-SCOPE-001",
              unexpected: unexpectedStage04Paths,
            }
          : undefined;
  if (!stage) {
    process.stdout.write(
      `Stage 01 scope is not applicable on ${scopeRef(context) || "detached HEAD"}.\n`,
    );
    return;
  }

  const baseline = process.env.STAGE_BASE_SHA ?? stage.baseline;
  execFileSync("git", ["merge-base", "--is-ancestor", baseline, "HEAD"]);
  const changed = execFileSync("git", ["diff", "--name-only", baseline], {
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);
  const unexpected = stage.unexpected(changed);
  if (unexpected.length > 0)
    throw new Error(`${stage.label} scope contains unexpected paths: ${unexpected}`);
  if (changed.some((file) => /^(?:Architecture|Design)\//.test(file))) {
    throw new Error(`Architecture and design sources are immutable during ${stage.label}`);
  }
  process.stdout.write(
    `${stage.label} valid for ${changed.length} changed paths from ${baseline}.\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
