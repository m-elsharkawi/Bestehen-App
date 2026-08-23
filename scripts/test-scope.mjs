import assert from "node:assert/strict";
import {
  stage01Branch,
  stage01ScopeApplies,
  stage02Branch,
  stage02ScopeApplies,
  unexpectedStage01Paths,
  unexpectedStage02Paths,
} from "./check-scope.mjs";

const fixtures = [
  {
    name: "the mandated Stage 01 branch enforces its allowlist",
    context: { localBranch: stage01Branch },
    applies: true,
    changed: ["Implementation/Personal/02-provider-service-setup/plan.md"],
    unexpected: ["Implementation/Personal/02-provider-service-setup/plan.md"],
  },
  {
    name: "a future-stage pull request does not apply the stale Stage 01 diff",
    context: {
      githubHeadRef: "implementation/personal-02-provider-service-setup",
      githubRefName: "1/merge",
    },
    applies: false,
    changed: ["Implementation/Personal/02-provider-service-setup/plan.md"],
    unexpected: ["Implementation/Personal/02-provider-service-setup/plan.md"],
  },
  {
    name: "main does not apply the stale Stage 01 diff",
    context: { githubRefName: "main", localBranch: stage01Branch },
    applies: false,
    changed: ["Implementation/Personal/02-provider-service-setup/plan.md"],
    unexpected: ["Implementation/Personal/02-provider-service-setup/plan.md"],
  },
];

for (const fixture of fixtures) {
  assert.equal(stage01ScopeApplies(fixture.context), fixture.applies, fixture.name);
  assert.deepEqual(unexpectedStage01Paths(fixture.changed), fixture.unexpected, fixture.name);
}

for (const context of [
  { localBranch: stage02Branch },
  { githubHeadRef: stage02Branch, githubRefName: "3/merge" },
]) {
  assert.equal(stage02ScopeApplies(context), true, "Stage 02 branch enforces its allowlist");
  assert.equal(stage01ScopeApplies(context), false, "Stage 01 scope stays branch-specific");
}

assert.deepEqual(
  unexpectedStage02Paths([
    "docs/setup/personal/README.md",
    "schemas/personal-provider-readiness.schema.json",
    "packages/configuration/src/index.test.ts",
    "Implementation/Personal/02-provider-service-setup/handoff.md",
  ]),
  [],
  "Stage 02 accepts its bounded implementation paths",
);
assert.deepEqual(
  unexpectedStage02Paths([
    "Implementation/Personal/02-provider-service-setup/plan.md",
    "pnpm-lock.yaml",
    "Architecture/28-bestehen-app-architecture-specification.md",
    "packages/infrastructure/src/postgres/migrations/002-provider.sql",
  ]),
  [
    "Implementation/Personal/02-provider-service-setup/plan.md",
    "pnpm-lock.yaml",
    "Architecture/28-bestehen-app-architecture-specification.md",
    "packages/infrastructure/src/postgres/migrations/002-provider.sql",
  ],
  "Stage 02 rejects plan drift, dependency drift, architecture edits, and migrations",
);

assert.deepEqual(
  unexpectedStage01Paths([
    "apps/web/src/app/page.tsx",
    "Implementation/Personal/01-repository-delivery-baseline/handoff.md",
  ]),
  [],
  "Stage 01 still accepts only its bounded implementation paths",
);

process.stdout.write("P02-SCOPE-001 passed alongside preserved Stage 01 scope fixtures.\n");
