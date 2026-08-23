# Personal Stage 02 execution handoff

Date: 2026-08-23

Status: `02E` repository execution accepted independently; not merged, deployed,
or service-ready

Draft PR: [#3](https://github.com/m-elsharkawi/Bestehen-App/pull/3)

Accepted reviewed candidate: `241b8a2828680a40b399c0be7f2863a76fa097f5`

Passing exact-candidate runs:
[push 32666424947](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32666424947) and
[pull request 32666427818](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32666427818)

Independent acceptance:
[PR comment 5388485710](https://github.com/m-elsharkawi/Bestehen-App/pull/3#issuecomment-5388485710).
The checklist now records `02E` as `[x]`. Merge and the post-02E service-readiness
checkpoint remain separate owner gates.

## Source, authority, and ancestry

- Branch: `implementation/personal-02-provider-service-setup`; base: `main`; remote:
  `https://github.com/m-elsharkawi/Bestehen-App.git`.
- Accepted Planning input: `b62d8b98869a7cd4dcd23ee0206575d3952afd20`;
  [independent acceptance](https://github.com/m-elsharkawi/Bestehen-App/pull/3#issuecomment-5388249271).
- Execution started from the evidence-only Planning acceptance record
  `e6491b8628c723614e38e56ffa25cfebb74d229b`.
- The accepted plan, architecture/design sources, common contract, exact prompt, and
  Stage 01 handoff were not edited. The Stage 01 merge remains
  `fd3add5c10e19646412b1413d507611d037797bd`.
- Before implementation and before the first push, local, remote, and PR heads,
  ancestry, branch/base, draft/open state, and clean worktree were checked. PR #3
  remains open, draft, cleanly mergeable, and unmerged.

## Delivered scope

- Nine dependency-ordered personal guides plus a shared symbolic-value,
  owner/action/evidence, inventory, and `NEVER PASTE HERE` contract. Every numbered
  step names the owner, action, observable result, verification, safe evidence,
  rollback, and prohibited private material.
- Current documented setup for the existing two-VM Coolify/Pangolin boundary, private
  R2 EU jurisdiction storage, SES Frankfurt, Auth0 EU GA Passwordless Email OTP,
  Gemini, separate OpenAI STT/TTS credentials, conditional Polly, secret custody,
  recovery, offboarding, and the later staging-readiness checkpoint.
- Auth0 uses the GA Passwordless Email connection `email`, OTP, disabled signups,
  temporary Management API `create:users` owner provisioning with
  `connection=email`, pre-user-registration and post-login allowlist defenses, and
  later App-side issuer+subject authorization. No Flexible Identifiers or database
  passwordless Early Access path was reintroduced.
- A Draft 2020-12, secret-free readiness receipt with exactly nine narrow rows:
  Coolify, Pangolin, Auth0, R2, SES, Gemini, OpenAI STT, OpenAI TTS, and Polly.
  Coolify/Pangolin resolve to `OPS-*`/`NET-*`; GitHub source/Dependency Graph state is
  intentionally repository/CI evidence and is rejected as a receipt resource.
- A validator for schema, exact model/region/resource literals, the single HTTPS
  origin and exact `/auth/callback`, guide-step resolution, redaction, honest live
  claims, verification, and rollback. The committed example uses reserved synthetic
  names, `owner_pending`, and `not_admitted`; it claims no live readiness.
- Strict vendor selections and complete configured-service groups: `auth0`, `r2`,
  `ses`, `gemini`, and separate `openai` STT/TTS. Configuration enforces Auth0 EU,
  `connection=email`, `/auth/callback`, `session-policy/v1`; R2 EU endpoint/`auto`
  and exact private prefixes; SES `eu-central-1`; exact accepted Gemini/OpenAI model
  IDs; no localhost/loopback/wildcard configured origin; and protected positive paid
  envelope relationships.
- One minimal provider-neutral configuration-check vocabulary in the application
  boundary. Infrastructure fakes cover all six capabilities and the fixed success,
  disabled, timeout, quota, malformed-response, retryable-failure, and
  permanent-failure outcomes without network, clock, randomness, or payload output.
- `check:providers` in the canonical check and existing policy/quality CI paths,
  Stage 02 scope enforcement, and the eight `P02-*` checks in the existing immutable
  release-manifest evidence. All seven existing CI job names and the provider-neutral
  exact-lock critical audit remain unchanged.

No live-smoke runner was added. The accepted plan makes it optional, and Stage 02 has
no provider adapter to execute a real call safely. The checkpoint guide instead
requires `check:providers` plus the exact provider guide step and bounded direct
resource verification after the relevant later capability exists.

## Execution commits

- `72c5ea18bafb21fca9a1575701c3ecf7e6231737` — add provider setup runbooks.
- `a3e3d516a4983d7631d956ef8adfe4f1f6e6f4a9` — add redacted readiness contract.
- `99275cd620e39b1b399d94e7bdeadfb9f60e1e4b` — cover runtime readiness boundaries
  and correct the Auth0 callback.
- `64bf5d9b42cb08a9b996d5fad5089e7168601b6d` — enforce the provider service
  configuration matrix.
- `6a93a9672dcae82db4d61aa025fb291011dbb1b3` — cover deterministic fake outcomes.
- `b8959c88d8f1487bf672beb2325275d984a51842` — add Stage 02 gates to existing CI.
- `f542b47cf912ad773be922865b0390724552ea97` — reject unsafe configured origins and
  invented owner budget examples.
- `ef66e4e80b880d5972fa0fed439c9b81b60a1258` — satisfy the readiness lint contract.
- `52be044955086924c35bdf9dcdddd988c03b65db` — register Stage 02 release evidence.

## Changed paths

- Guides/evidence: `docs/setup/personal/README.md`, `01-github.md` through
  `09-staging-readiness.md`, this handoff, and the personal checklist.
- Readiness: `schemas/personal-provider-readiness.schema.json`,
  `config/personal-provider-readiness.example.json`, and
  `scripts/check-provider-readiness.mjs`.
- Configuration/contracts/fakes: `.env.example`, `docs/configuration.md`, and the
  `index.ts`/`index.test.ts` files in `packages/configuration`,
  `packages/application`, and `packages/infrastructure`.
- Gates/evidence: `package.json`, `.github/workflows/ci.yml`,
  `scripts/check-docs.mjs`, `scripts/check-scope.mjs`, `scripts/test-scope.mjs`,
  `schemas/release-manifest.schema.json`, and
  `scripts/test-release-manifest.mjs`.

There is no dependency or `pnpm-lock.yaml` change, no migration or stored-data
contract change, and no provider SDK, live adapter, Auth0 route, product behavior,
product UI, deployment client, account, resource, DNS record, secret, or private
identifier.

## Verification and check IDs

Local verification used exact Node `24.19.0` and pnpm `11.23.0`:

- `pnpm install --frozen-lockfile` and `pnpm check` passed. The canonical gate covered
  scope, lock/source/lifecycle policy, secrets, readiness, formatting, lint, types,
  boundaries, 76 unit tests, release-manifest negatives, build, and generated-file
  policy.
- `pnpm check:advisories` passed with no known critical advisory.
- `pnpm test:coverage` passed for the same 76 unit tests.
- `pnpm test:e2e` passed 3 Chromium semantic, keyboard, axe, reflow,
  reduced-motion, and health checks.
- `pnpm check:docs` passed links/fences, all 9 guide action contracts, commands, and
  53 configuration fields.
- Local PostgreSQL integration and worker process cases were skipped because the
  local Docker daemon was unavailable. The web process case passed. These cases and
  OCI are non-waivable and passed in the exact-head Linux run below.
- Complete diff whitespace, secret scan, changed-path scope, accepted-plan, lockfile,
  and migration inspections passed.

Stage 02 deterministic evidence:

- `P02-SCOPE-001`: exact branch/baseline allowlist; negative plan, lock,
  architecture, and migration fixtures.
- `P02-DOC-001`: all local links/fences and every action field.
- `P02-CONFIG-001`: 20 strict configuration tests, including incomplete groups,
  wrong connection/callback/region/model, unsafe origin, local live calls, fake
  production, public objects, and paid-without-envelope denials.
- `P02-FAKE-001`: all 6 capabilities × 7 outcomes, plus registry and
  no-network/clock/randomness coverage.
- `P02-SECRET-001`: repository/diff/example scanning and configuration/fake redaction
  canaries; errors return field names only.
- `P02-READINESS-001`: valid synthetic receipt plus 12 invalid fixtures for private
  fields, false live claims, unknown steps, wrong region/model/callback/origin,
  missing Coolify, misclassified Pangolin, prohibited GitHub row, and missing
  verification/rollback.
- `P02-DEPS-001`: frozen unchanged lock, exact manifest/runtime policy, registry
  sources, single reviewed lifecycle allowance, complete critical audit.
- `P02-COMPAT-001`: provider-neutral application vocabulary, boundary gate, and
  fake/provider swaps by configuration without vendor types above infrastructure.

Exact-head GitHub run
[32665918536](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32665918536)
passed all preserved jobs for `52be044955086924c35bdf9dcdddd988c03b65db`:

- `P01 static, unit, build, and release checks` — job `97259147369`.
- `P01 OCI non-root read-only health and signal` — job `97259147482`.
- `P01 policy and frozen dependencies` — job `97259147495`.
- `P01 PostgreSQL migration and process` — job `97259147509`.
- `P01 exact-lock dependency audit` — job `97259147537`.
- `P01 browser and accessibility` — job `97259147562`.
- `P01 evidence and release manifest` — job `97259515095`.

The run checked out the exact candidate with pinned Node/pnpm, performed a frozen
install, ran deterministic provider checks in policy and canonical quality, exercised
real PostgreSQL 18.6 migration/recovery/process behavior, inspected both OCI images,
ran browser/accessibility evidence, audited the complete exact lock at critical
severity, and generated the schema-valid release manifest containing all P01/P02 IDs.

## Security, compatibility, rollback, and residual risk

- Fake adapters and all external/paid/public/productive flags remain closed by
  default. Production rejects fakes; local/test/preview reject external calls; paid
  work additionally requires external calls, exact paid adapters, positive owner-set
  envelopes, policy revision, and verification date.
- Provider secrets and private identifiers stay server-only and out of public config,
  receipt output, errors, logs, release metadata, GitHub, build variables, and images.
  Dashboard-only steps ask only for a redacted result.
- Application code knows no Auth0/R2/SES/Gemini/OpenAI type. Existing App facts and
  future stable issuer+subject bindings remain provider-owned only at the adapter
  boundary, preserving provider exit.
- Execution rollback is a focused revert of the guide/readiness/configuration/fake/CI
  commits. It is a no-data rollback with no down migration or external cleanup.
- Provider console mechanics, terms, model availability, pricing, retention, and
  privacy controls are mutable. Every guide is dated 2026-08-23 and requires current
  official re-verification before owner spend or live action.
- GitHub Dependency Graph remains the available repository signal. GHAS/private-plan
  rulesets are unavailable/declined and are not gates; the mandatory exact-lock
  critical audit remains provider-neutral.

## Pending owner and post-02E checkpoint gates

Do not start the service-readiness checkpoint until independent `02E` acceptance and
merge. This handoff records no live readiness.

After that boundary, the owner/orchestrator must:

1. Record the exact accepted merge commit, clean checkout, and green mandatory CI;
   recheck current provider terms, privacy/retention, model availability, pricing,
   positive protected envelopes, dashboard authority, and authoritative-DNS access.
2. Execute only the named guide steps in dependency order for GitHub/Coolify,
   Pangolin, R2, SES, Auth0, Gemini/OpenAI, secrets, backup, recovery, and offboarding.
   Owner-only dashboards return only `verified`, `owner_pending`, `failed`, or a
   similarly redacted result—never a secret or private identifier.
3. Deploy fake-first to the private staging boundary at the exact accepted commit.
   Keep external, paid, public-object, and productive behavior false. Then perform at
   most each named synthetic bounded resource verification with least privilege,
   budget/spend gates, one call/create and verification read where applicable,
   cleanup, rollback, and schema-valid redacted evidence.
4. Keep Polly `not_admitted` and create no Polly credential unless a later accepted
   content/media benchmark admits an exact offline Frankfurt route.
5. Verify negative access, credential revocation, cleanup, encrypted backup sentinel,
   recovery boundaries, and protected receipt validation. A sentinel is not an App or
   database restore claim.

After each independently accepted `03E` through `09E`, deploy that exact commit to the
same private staging environment and run only its relevant bounded live scope.
Deterministic fake contracts remain mandatory CI. Stage 10 remains promotion and
comprehensive validation, not the first integration point.
