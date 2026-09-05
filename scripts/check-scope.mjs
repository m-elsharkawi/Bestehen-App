import { execFileSync } from "node:child_process";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const stage01Branch = "implementation/personal-01-repository-delivery-baseline";
export const stage02Branch = "implementation/personal-02-provider-service-setup";
export const stage03Branch = "implementation/personal-03-domain-data-jobs-auth";
export const stage04Branch = "implementation/personal-04-responsive-web-design-system";
export const stage05Branch = "implementation/personal-05-content-deterministic-runtime";
const stage01Baseline = "5c7e8b1ebdd2370b519b2d984b0ff732851b89ae";
const stage02Baseline = "e6491b8628c723614e38e56ffa25cfebb74d229b";
const stage03Baseline = "f466e29ee07b06da19130d60e2887be1e088c68b";
const stage04Baseline = "c39ec9c1ecb3a3dd2220ea28f7f71ecf88322cf8";
const stage05Baseline = "009d2c62fbc45b4084d8778716705ce57d54f442";
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
  /^\.gitignore$/,
  /^\.github\/workflows\/(?:ci|release-candidate)\.yml$/,
  /^apps\/web\/(?:package\.json|public\/theme-init\.js|src\/app\/|src\/server\/frontend-data(?:\.unit\.test)?\.ts|src\/ui\/|tests\/(?:baseline\.spec\.ts|p04-))/,
  /^Implementation\/Personal\/04-responsive-web-design-system\/handoff\.md$/,
  /^package\.json$/,
  /^pnpm-lock\.yaml$/,
  /^packages\/contracts\/src\/(?:index|ui-projections)(?:\.test)?\.ts$/,
  /^packages\/design-system\//,
  /^playwright\.config\.ts$/,
  /^prompts\/implementation\/personal\/personal-implementation-checklist\.md$/,
  /^schemas\/release-manifest\.schema\.json$/,
  /^scripts\/(?:check-assets|check-design-coverage|check-generated|check-scope|check-web-budget|generate-design-coverage|test-release-manifest|test-scope)\.mjs$/,
];
const stage05Allowed = [
  // Newer owner correction (2026-09-05): permit only the local HTTPS browser harness and the
  // terminal-revision configuration surfaces named in the frozen T11 correction brief.
  /^\.env\.example$/,
  /^\.github\/workflows\/(?:ci|release-candidate)\.yml$/,
  /^compose\.yaml$/,
  /^apps\/web\/(?:package\.json|tsconfig\.json)$/,
  /^apps\/web\/src\/app\/\(focused\)\/(?:attempt|session)\//,
  /^apps\/web\/src\/app\/\(test\)\/ui-fixtures\/\[view\]\/page\.tsx$/,
  /^apps\/web\/src\/app\/api\/v1\/(?:attempts|content|listening-plans|serving-manifests)\//,
  /^apps\/web\/src\/server\/(?:attempt|content|foundation|frontend-data|json-mutation-boundary|legacy-exposure-retry|listening|media-catalogue|objective-form-action|serving-manifest)[^/]*\.(?:ts|tsx)$/,
  /^apps\/web\/src\/ui\/(?:archetypes|attempt-runtime-view|attempt-shell|foundation-runtime-view|objective-form|objective-form-state|result-projection|result-view)(?:\.unit\.test)?\.(?:ts|tsx)$/,
  /^apps\/web\/src\/ui\/islands\/(?:attempt-clock[^/]*|clock-observation[^/]*|listening[^/]*|objective[^/]*)\.(?:ts|tsx)$/,
  /^apps\/web\/tests\/p05-(?:attempt|runtime|listening-island)\.spec\.ts$/,
  /^apps\/worker\/(?:package\.json|tsconfig\.json)$/,
  /^apps\/worker\/src\/(?:index(?:\.unit\.test)?|media-import)\.ts$/,
  /^apps\/worker\/tests\/baseline\.process\.test\.ts$/,
  /^docs\/(?:configuration|content-operations|local-development)\.md$/,
  /^Implementation\/Personal\/05-content-deterministic-runtime\/handoff\.md$/,
  /^packages\/application\/src\/(?:index(?:\.test)?|listening-runtime|media-catalogue)\.ts$/,
  /^packages\/configuration\/src\/index(?:\.test)?\.ts$/,
  /^packages\/content\/(?:package\.json|tsconfig\.json)$/,
  /^packages\/content\/src\/(?:accessibility|corpus-boundary|corpus-request|digest|freshness|impact|index|keys|media|media-catalogue|media-seed-import|model|publication|response-operation-parity|rights|scoring|task-families)(?:\.test)?\.ts$/,
  /^packages\/content\/src\/corpus\/(?:bundle-reader|client|import)(?:\.test)?\.ts$/,
  /^packages\/content\/src\/fixtures\/corpus\/bundle-v1\.(?:json|digest\.json)$/,
  /^packages\/content\/src\/seed\/(?:audio|builders|generate-release|identity|index|language-sb[12]|listening-builders|listening-h[123]|reading-r[123]|rights)(?:\.test)?\.ts$/,
  /^packages\/content\/src\/seed\/(?:provenance\.md|release\.json)$/,
  /^packages\/contracts\/src\/(?:index|listening|ui-projections)(?:\.test)?\.ts$/,
  /^packages\/design-system\/src\/(?:components|contracts|index\.test|shells|styles|tokens\.test)\.(?:ts|tsx|css)$/,
  /^packages\/design-system\/src\/coverage\/source-anchors(?:\.generated\.json|\.ts)$/,
  /^packages\/domain\/src\/index(?:\.test)?\.ts$/,
  /^packages\/infrastructure\/package\.json$/,
  /^packages\/infrastructure\/src\/(?:index|stage05\.unit\.test|supervisor)\.ts$/,
  /^packages\/infrastructure\/src\/content\/seed-cli(?:\.test)?\.ts$/,
  /^packages\/infrastructure\/src\/jobs\/index\.ts$/,
  /^packages\/infrastructure\/src\/media\/(?:catalogue|listening-runtime|listening-runtime-migration\.integration\.test|media-migration\.integration\.test|transcript-migration\.integration\.test)\.ts$/,
  /^packages\/infrastructure\/src\/postgres\/(?:attempt-repository|content-repository)(?:\.test)?\.ts$/,
  /^packages\/infrastructure\/src\/postgres\/(?:foundation-repository|index|listening-binding-migration|listening-media-migration|listening-runtime-migration|migrations|postgres\.integration\.test|transcript-lineage-migration)\.ts$/,
  /^pnpm-lock\.yaml$/,
  /^playwright\.config\.ts$/,
  /^prompts\/implementation\/personal\/personal-implementation-checklist\.md$/,
  /^schemas\/release-manifest\.schema\.json$/,
  /^scripts\/(?:check-boundaries|check-design-coverage|check-design-coverage-ids(?:\.test)?|check-web-budget|check-scope|release-manifest|serve-playwright-https|test-oci|test-release-manifest|test-scope)\.mjs$/,
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

export function stage05ScopeApplies(context) {
  return scopeRef(context) === stage05Branch;
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

export function unexpectedStage05Paths(changed) {
  return changed.filter((file) => !stage05Allowed.some((pattern) => pattern.test(file)));
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
          : stage05ScopeApplies(context)
            ? {
                baseline: stage05Baseline,
                label: "P05-SCOPE-001",
                unexpected: unexpectedStage05Paths,
              }
            : undefined;
  if (!stage) {
    process.stdout.write(
      `Stage scope is not applicable on ${scopeRef(context) || "detached HEAD"}.\n`,
    );
    return;
  }

  const baseline = process.env.STAGE_BASE_SHA ?? stage.baseline;
  execFileSync("git", ["merge-base", "--is-ancestor", baseline, "HEAD"]);
  execFileSync("git", ["diff", "--check", `${baseline}..HEAD`], { stdio: "inherit" });
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
