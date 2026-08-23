import assert from "node:assert/strict";
import { stage01Branch, stage01ScopeApplies, unexpectedStage01Paths } from "./check-scope.mjs";

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

assert.deepEqual(
  unexpectedStage01Paths([
    "apps/web/src/app/page.tsx",
    "Implementation/Personal/01-repository-delivery-baseline/handoff.md",
  ]),
  [],
  "Stage 01 still accepts only its bounded implementation paths",
);

process.stdout.write("Stage 01 scope applicability and allowlist fixtures passed.\n");
