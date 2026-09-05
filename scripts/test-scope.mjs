import assert from "node:assert/strict";
import {
  stage01Branch,
  stage01ScopeApplies,
  stage02Branch,
  stage02ScopeApplies,
  stage03Branch,
  stage03ScopeApplies,
  stage04Branch,
  stage04ScopeApplies,
  stage05Branch,
  stage05ScopeApplies,
  unexpectedStage01Paths,
  unexpectedStage02Paths,
  unexpectedStage03Paths,
  unexpectedStage04Paths,
  unexpectedStage05Paths,
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
    "schemas/release-manifest.schema.json",
    "scripts/test-release-manifest.mjs",
  ]),
  [],
  "Stage 02 accepts its bounded implementation paths",
);

for (const context of [
  { localBranch: stage04Branch },
  { githubHeadRef: stage04Branch, githubRefName: "11/merge" },
]) {
  assert.equal(stage04ScopeApplies(context), true, "Stage 04 branch enforces its allowlist");
  assert.equal(stage03ScopeApplies(context), false, "Stage 03 scope stays branch-specific");
}

assert.deepEqual(
  unexpectedStage04Paths([
    ".gitignore",
    "packages/contracts/src/ui-projections.ts",
    "packages/design-system/src/components.tsx",
    "apps/web/src/app/(protected)/coach/page.tsx",
    "apps/web/tests/p04-responsive.spec.ts",
    "Implementation/Personal/04-responsive-web-design-system/handoff.md",
    "scripts/check-generated.mjs",
  ]),
  [],
  "Stage 04 accepts only its planned implementation surfaces",
);
assert.deepEqual(
  unexpectedStage04Paths([
    "Implementation/Personal/04-responsive-web-design-system/plan.md",
    "Architecture/13-frontend-application-and-design-system-architecture.md",
    "Design/Bestehen-01-Design-System.dc.html",
    "packages/infrastructure/src/postgres/migrations.ts",
  ]),
  [
    "Implementation/Personal/04-responsive-web-design-system/plan.md",
    "Architecture/13-frontend-application-and-design-system-architecture.md",
    "Design/Bestehen-01-Design-System.dc.html",
    "packages/infrastructure/src/postgres/migrations.ts",
  ],
  "Stage 04 rejects plan, architecture, Design, and migration drift",
);

for (const context of [
  { localBranch: stage05Branch },
  { githubHeadRef: stage05Branch, githubRefName: "17/merge" },
]) {
  assert.equal(stage05ScopeApplies(context), true, "Stage 05 branch enforces its allowlist");
  assert.equal(stage04ScopeApplies(context), false, "Stage 04 scope stays branch-specific");
}

assert.deepEqual(
  unexpectedStage05Paths([
    "packages/domain/src/index.ts",
    "packages/content/src/media.ts",
    "packages/infrastructure/src/postgres/listening-runtime-migration.ts",
    "apps/web/src/app/(focused)/attempt/[id]/page.tsx",
    "apps/web/src/app/api/v1/listening-plans/[id]/playback/route.ts",
    "apps/web/src/ui/islands/listening-runtime.tsx",
    "apps/web/tests/p05-runtime.spec.ts",
    "docs/content-operations.md",
    "schemas/release-manifest.schema.json",
    "scripts/check-design-coverage-ids.test.mjs",
    "Implementation/Personal/05-content-deterministic-runtime/handoff.md",
  ]),
  [],
  "Stage 05 accepts its bounded content and deterministic-runtime paths",
);
assert.deepEqual(
  unexpectedStage05Paths([
    "Implementation/Personal/05-content-deterministic-runtime/plan.md",
    "Implementation/Personal/05-content-deterministic-runtime/orchestration-log.md",
    "Architecture/16-listening-architecture.md",
    "Design/Bestehen-06-Critical-View-Deltas.dc.html",
    "apps/web/tests/p04-visual.spec.ts-snapshots/listening-320-chromium-linux.png",
    "apps/web/src/ui/islands/writing-runtime.tsx",
    "apps/web/src/ui/islands/speaking-runtime.tsx",
    "apps/web/src/ui/mock-runtime.tsx",
  ]),
  [
    "Implementation/Personal/05-content-deterministic-runtime/plan.md",
    "Implementation/Personal/05-content-deterministic-runtime/orchestration-log.md",
    "Architecture/16-listening-architecture.md",
    "Design/Bestehen-06-Critical-View-Deltas.dc.html",
    "apps/web/tests/p04-visual.spec.ts-snapshots/listening-320-chromium-linux.png",
    "apps/web/src/ui/islands/writing-runtime.tsx",
    "apps/web/src/ui/islands/speaking-runtime.tsx",
    "apps/web/src/ui/mock-runtime.tsx",
  ],
  "Stage 05 rejects accepted-plan logs, source authority, snapshots, and later-skill drift",
);

for (const context of [
  { localBranch: stage03Branch },
  { githubHeadRef: stage03Branch, githubRefName: "6/merge" },
]) {
  assert.equal(stage03ScopeApplies(context), true, "Stage 03 branch enforces its allowlist");
  assert.equal(stage02ScopeApplies(context), false, "Stage 02 scope stays branch-specific");
}

assert.deepEqual(
  unexpectedStage03Paths([
    "packages/domain/src/index.ts",
    "packages/infrastructure/src/postgres/migrations.ts",
    "apps/web/src/app/auth/login/route.ts",
    "Implementation/Personal/03-domain-data-jobs-auth/handoff.md",
    "prompts/implementation/personal/personal-implementation-checklist.md",
    "scripts/test-oci.mjs",
  ]),
  [],
  "Stage 03 accepts only its planned implementation surfaces",
);
assert.deepEqual(
  unexpectedStage03Paths([
    "Implementation/Personal/03-domain-data-jobs-auth/plan.md",
    "Architecture/23-security-privacy-and-abuse-prevention.md",
    "Design/components/identity.tsx",
    "docs/setup/personal/08-secrets-recovery-offboarding.md",
  ]),
  [
    "Implementation/Personal/03-domain-data-jobs-auth/plan.md",
    "Architecture/23-security-privacy-and-abuse-prevention.md",
    "Design/components/identity.tsx",
    "docs/setup/personal/08-secrets-recovery-offboarding.md",
  ],
  "Stage 03 rejects accepted-plan/history, architecture/design, and unrelated guide drift",
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

process.stdout.write(
  "P05-SCOPE-001 passed alongside preserved Stage 01 through Stage 04 scope fixtures.\n",
);
