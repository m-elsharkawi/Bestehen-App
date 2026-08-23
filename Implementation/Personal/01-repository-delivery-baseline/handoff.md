# Personal Stage 01 execution handoff

Date: 2026-08-23

Status: Stage 01 Execution accepted for reviewed input head
`b38129a4ff01c23a6484adf05f2c682bd8b3076c` by the
[independent orchestrator acceptance](https://github.com/m-elsharkawi/Bestehen-App/pull/1#issuecomment-5388049241);
not merged, deployed, or marked ready

Draft PR: [#1](https://github.com/m-elsharkawi/Bestehen-App/pull/1)

Verified implementation candidate: `d69f47a23b4e56d376f5b1d56d6a0148e652d0c4`

Passing candidate run:
[32660827161](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161)

The prior handoff refresh and checklist evidence update were evidence-only. The
checklist status is now `[x]` solely to record the independent orchestrator acceptance
linked above. This acceptance-record update does not alter the implementation.

## Source and ancestry

- Remote: `https://github.com/m-elsharkawi/Bestehen-App.git`; default branch `main`.
- Accepted baseline and merge base:
  `5c7e8b1ebdd2370b519b2d984b0ff732851b89ae`.
- Accepted plan input: `233eb0c84e092e5bdda88a1f3692bd41ddc07d3e`.
- Exact accepted Planning branch head:
  `3ec38ef815416aa45d6af44c12257be51f74df09`.
- Branch: `implementation/personal-01-repository-delivery-baseline`.
- PR base/head remain `main` and the branch above. PR #1 is open, draft, and
  mergeable. It was not rebased, force-pushed, marked ready, or merged.
- Fetch, branch, remote, default-branch, merge-base, accepted-commit, PR-head, and
  clean-tree checks passed before implementation. A final fetch/ancestry/clean-tree
  check is required immediately before handoff completion.
- The accepted plan is byte-unchanged from the accepted Planning head. Architecture,
  Design, common-contract, and prompt sources were not edited.

## Delivered scope

- A pnpm workspace with the two composition roots `apps/web` and `apps/worker`, plus
  the accepted domain, contracts, application, configuration, infrastructure,
  content, design-system, and test-support ownership packages.
- Enforced TypeScript project references, public exports, allowed dependency arrows,
  forbidden deep/provider/test imports, and negative boundary fixtures. There is no
  `shared`, `common`, or `utils` package.
- Exact runtime, dependency, lock, registry/source, engine/peer, and lifecycle-script
  policy. `esbuild` is the only reviewed dependency build script.
- Typed fail-closed server configuration, fake-only default adapters, central
  redaction, minimal release metadata, and all six personal flags closed.
- A neutral semantic web page; dependency-free liveness; strict config/database/schema
  readiness; a private worker health server; bounded, zero-exit `SIGTERM` handling;
  and no product route, workflow, or queue.
- One explicit Kysely migrator with an advisory lock. Web and worker startup never
  migrate. The baseline creates only Kysely migration metadata and no product table,
  seed, queue, or user data.
- Provider-neutral web and worker OCI definitions, fixed non-root UID/GID `10001`,
  read-only-root operation, bounded `/tmp`, init, internal probes, source/revision
  labels, minimal runtime content, and image-history/config secret checks.
- Least-privilege pull-request/push CI and a non-publishing manual release-candidate
  workflow, exact full-SHA action pins, synthetic bounded-retention evidence, immutable
  release-manifest schema/generator, dependency inventory, license inventory,
  Dependabot policy, CODEOWNERS, and a PR template.
- Local development, configuration, package-boundary, delivery, and personal
  deployment-profile documentation. `IDR-0001` preserves standard Node/PostgreSQL,
  S3-compatible, identity/AI port, Render, and comparable-host exits.

Scope was deliberately kept at the smallest accepted baseline: fakes, empty product
migrations/queues, one neutral page, two ordinary Node processes, and one small signal
wrapper. No speculative provider adapter, deployment client, product schema, duplicate
tooling, optional polish, or later-stage feature was added.

## Commits

Execution commits after the accepted Planning head are:

- `0e9c74fe2c39d3572a6bd1dd9a2c501ca15c1baa` — scaffold pinned modular monorepo
  baseline.
- `719f7a6361e8b24a39442d1949bc0bce0aa2e278` — add container and process delivery
  gates.
- `8962f78fa4e8864b6b25c9d1d9a623dbd9eab5a1` — establish delivery policy workflows
  and guides.
- `75fa9d93d33552b70dc69ec06308f888a36751b7` — harden standalone runtime and release
  evidence.
- `d0194244495dc910713bc12f526df819de251305` — fix signal and database recovery
  process gates.
- `746278d6ea6f952bdf4d9167d40ca7aa82965415` — replace unavailable GHAS dependency
  review gate.
- `952f7821045996329e2593eacf8cfc6d793c2096` — separate browser and process test
  discovery.
- `eb4b97c486553a3262acb181fd82a2d362641c3c` — make the isolated synthetic database
  outage deterministic.
- `6aead604db9d5d23448b58b716215a7ac5160c0e` — record the first Stage 01 execution
  handoff candidate.
- `a7256a195e93b74f9b324a11c3be2c8f81f63be7` — use a randomly named non-superuser
  role and database for each PostgreSQL fixture.
- `1f71c55fa987346f95323983c960bb556245c829` — control the isolated database outage
  with a validated synthetic CI administrator.
- `58e93774eb62dcd9c5f26c66403fc4292759e689` — keep the worker alive and readiness
  reconnecting when an idle PostgreSQL connection is lost.
- `abff9349a3727bbb4fb21bee35afc0e3e962d7c6` — finalize the prior execution
  evidence candidate.
- `d69f47a23b4e56d376f5b1d56d6a0148e652d0c4` — repair Stage 01 scope applicability,
  release validation/cleanliness, and configured logging contracts.

The final evidence-only commit is the commit containing this document refresh and the
evidence link on the already `[~]` `01E` checklist line; its exact SHA is recorded in
the PR execution-evidence comment because a commit cannot truthfully contain its own
SHA.

## Changed paths and generated artifacts

The verified implementation candidate changes 101 allowed paths from the exact
accepted Planning head. They are confined to:

- root workspace/runtime/tooling policy and the frozen lock;
- `.github` ownership, update, PR, CI, and release-candidate policy;
- `apps/web`, `apps/worker`, and the eight accepted `packages/*` owners;
- both Dockerfiles, Compose, health/signal/OCI/release/policy scripts, and schemas;
- Stage 01 repository docs and `IDR-0001`;
- this Stage 01 plan/handoff and only the checklist `01E` line.

`git diff --name-status 5c7e8b1ebdd2370b519b2d984b0ff732851b89ae...HEAD`
is the authoritative full list. On the exact Stage 01 branch,
`scripts/check-scope.mjs` rejects every path outside that map and rejects all
Architecture/Design edits. On `main` and future stage branches, it intentionally does
not apply this stale Stage 01 baseline diff; deterministic fixtures prove both cases.

Generated or resolved artifacts are:

- `pnpm-lock.yaml`, generated by pnpm `11.23.0`, SHA-256
  `87653beab06b6d24dd159be5cd77ebb9dd965293d7f51b4cc6f324bb17b8d4ca`;
- Next standalone web output and TypeScript build output, ignored and regenerated by
  the build;
- Playwright Chromium `151` from Playwright `1.62.1` browser revision `1234`;
- synthetic JUnit, coverage, Playwright, OCI, dependency/license, and immutable
  release-manifest evidence retained for 14 days in the PR run;
- no published package, image, tag, deployment, database volume, recording, private
  object, provider payload, environment dump, credential, or secret.

Key exact pins include Node `24.19.0`, pnpm `11.23.0`, TypeScript `5.9.3`, Next
`16.3.2`, React/React DOM `19.2.8`, Kysely `0.29.5`, PostgreSQL client `8.23.0`,
pg-boss `12.27.0`, Zod `4.4.3`, Pino `10.3.1`, Vitest `4.1.11`, Playwright
`1.62.1`, Biome `2.5.10`, dependency-cruiser `18.2.0`, Ajv `8.20.0`, and
Ajv Formats `3.0.1`. Every JavaScript manifest uses exact versions or internal
`workspace:*` references.

## Migration and operational contract

- PostgreSQL is `18.6`. Compatible schema range is `baseline..baseline`; the release
  manifest names `explicit-migrator` as owner.
- The explicit migrator takes advisory lock `420101`, reports from/to/applied
  revisions, and is idempotent under concurrent invocation.
- The only baseline relations are `kysely_migration` and
  `kysely_migration_lock`. There is no product data migration and no automatic down
  migration.
- Web listens on `3000` with `/api/health/live` and `/api/health/ready`. Worker listens
  privately on `3001` with `/health/live` and `/health/ready`.
- Liveness does not touch PostgreSQL. Readiness fails closed for configuration,
  connection, schema compatibility, supervisor state, or shutdown without exposing
  dependency address, exception detail, environment values, identity, or credentials.
- Local startup is frozen install, explicit `pnpm db:migrate`, then `pnpm dev`. Real
  values belong only in a future protected runtime store; `.env.example` is synthetic.

## Local verification

The local runtime was exact Node `24.19.0` and pnpm `11.23.0`.

- `pnpm install --frozen-lockfile` — pass; 11 workspace projects, no lock mutation.
- `pnpm check` — pass: scope/lock/lifecycle/source/secret/generated policy; Biome
  format/lint; TypeScript; 35 modules/27 dependencies with no boundary violation; 10
  unit files and 20 tests; Stage 01/future-branch scope fixtures; JSON Schema-invalid,
  immutable/missing/mutable/tracked-dirty/non-ignored-untracked release negatives; web
  and worker builds; offline frozen-lock regeneration. Secret policy covered 272 files.
- `pnpm check:advisories` — pass; full exact lock audited, no known vulnerability.
- `pnpm test:process` — pass locally for the standalone web signal test; the two
  PostgreSQL-dependent worker tests skip without `TEST_DATABASE_URL` and are not
  claimed locally.
- `pnpm test:e2e` — pass, 3 Chromium tests: semantic/keyboard/focus/axe, 320 CSS-pixel
  reflow/reduced motion, and minimal health payloads.
- `pnpm check:docs` and `git diff --check` — pass.
- Local PostgreSQL integration tests correctly skip because no local PostgreSQL URL was
  supplied. Their required real-PostgreSQL evidence is the green Linux job below.
- Docker CLI `29.5.3` is present, but its local daemon is unavailable. `pnpm test:oci`
  stops with `Docker daemon is required for the non-waivable OCI gate.` No local OCI
  pass is claimed or waived; the required clean Linux proof is green below.

## GitHub CI and evidence

The final implementation candidate passed all required jobs independently in both the
pull-request run
[32660827161](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161)
and matching push run
[32660825511](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660825511).
The pull-request jobs are:

- [P01 policy and frozen dependencies](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/job/97246631858)
  — pass. Covers `P01-BASE-001`, `P01-SCOPE-001`, lock, secret, and doc policy.
- [P01 exact-lock dependency audit](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/job/97246631888)
  — pass. Covers `P01-DEPS-001`, critical advisory blocking, source/lifecycle policy,
  deterministic dependency and license inventories.
- [P01 static, unit, build, and release checks](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/job/97246631944)
  — pass. Covers boundary/type/style/unit/config/secret/HTTP/generated/release tests.
  Unit coverage is correctly diagnostic: 38.16% statements, 37.25% branches, 48.21%
  functions, and 38.65% lines.
- [P01 PostgreSQL migration and process](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/job/97246631999)
  — pass against real PostgreSQL `18.6`: two integration tests and three process tests
  cover concurrent idempotent migration, schema mismatch, database outage, readiness
  `503`, recovery to `200`, no product work route, invalid-config failure, and bounded
  zero-exit web/worker `SIGTERM`.
- [P01 browser and accessibility](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/job/97246631719)
  — pass, 3 Chromium/axe smoke tests with keyboard, visible focus, reflow, and reduced
  motion assertions. Axe automation is not represented as complete manual AT proof.
- [P01 OCI non-root read-only health and signal](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/job/97246631969)
  — pass for both images on clean Linux. The gate re-resolved multi-architecture and
  platform manifests; built minimal images; inspected labels, history, config, and
  secrets; ran the explicit migrator; started both images with non-root `10001:10001`,
  init, read-only root, and bounded `/tmp`; checked health/readiness; and required
  bounded zero-exit `SIGTERM`.
- [P01 evidence and release manifest](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/job/97246993259)
  — pass. It downloaded the OCI identity, generated an exact clean immutable manifest,
  and uploaded redacted inventory/license/manifest evidence.

Durable 14-day run artifacts are
[dependencies/licenses/audit](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/artifacts/9498694875),
[unit/coverage](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/artifacts/9498703517),
[PostgreSQL/process](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/artifacts/9498705871),
[browser/accessibility](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/artifacts/9498707152),
[OCI](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/artifacts/9498724440),
and [release manifest/inventory](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161/artifacts/9498732249).

The clean evidence binds Node base manifest
`sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03`,
Linux Node platform manifest
`sha256:65932751ed4073ed02f5c04e494e4b2572a891b7dbea0568a863dc80341bf848`,
PostgreSQL base manifest
`sha256:7d2695c3aa88e792e8b3b233e7e4adb296a20412c6c0ca361e3edaaacfada108`,
Linux PostgreSQL platform manifest
`sha256:b939b3851e2cccb017dc4497af63b15e34efa57fba036548773c53b2f16a8871`,
web image `sha256:50afbecd86418f18af750eb00fccbd47fb1f5c00081ab4dd531e9853a465e2ca`,
and worker image
`sha256:e3feec4f217b2ed4cdacdb0ec34ad9ae18e2dcac2229f02271b3bd9d0888bc81`.
The images are local CI artifacts only and were not published.

### Diagnostic candidate failures

Failures were fixed with new commits; no diagnostic retry was relabeled green.

- Candidate `75fa9d9` run
  [32657789781](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32657789781)
  exposed three independent issues: the private-repository GHAS dependency action was
  unavailable, standalone web returned signal exit `143`, and worker database-outage
  simulation was nondeterministic. Commits `d019424` and `746278d` corrected them.
- Candidate `952f782` pull-request run
  [32658357254](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32658357254)
  proved the corrected OCI gate green but showed that altering a shared synthetic role
  did not deterministically make the isolated database unavailable. Commit `eb4b97c`
  instead toggles connections only on the validated, randomly named isolated synthetic
  database and always restores them in `finally`.
- Candidate `eb4b97c` pull-request run
  [32658581656](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32658581656)
  passed, but the independently triggered same-SHA push run
  [32658579105](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32658579105)
  still failed the outage assertion. It therefore remained diagnostic rather than
  acceptance evidence.
- Candidates through `1f71c55` progressively isolated the fixture to a random
  non-superuser role/database and moved outage control to a validated synthetic CI
  administrator. The duplicate lanes then exposed the root process defect: forced
  loss of an idle `pg.Pool` client emitted an unhandled error and exited the worker
  before readiness could reconnect.
- Commit `58e9377` consumes that expected pool error without logging raw PostgreSQL
  detail; readiness fails closed during loss and reconnects on the next probe. Both
  independent exact-SHA runs above passed PostgreSQL outage/recovery and all other
  gates. Earlier candidate runs remain diagnostic history.

### Independent review repairs

Independent review of evidence head `abff934` found four bounded contract defects.
Focused commit `d69f47a` repairs only those defects:

- The Stage 01 changed-path proof now runs only when GitHub or the local checkout names
  the exact Stage 01 branch. It still proves the complete Stage 01 allowlist here, while
  `main` and a future Stage 02 Planning branch do not apply the stale Stage 01 baseline
  diff. Deterministic fixtures cover enforcement and both non-applicable contexts; no
  general stage framework was introduced.
- The generator now compiles the checked-in Draft 2020-12 schema with exact-pinned Ajv
  and Ajv Formats. The schema explicitly requires all 17 `P01-*` check IDs and rejects
  additional fields. Negative fixtures cover invalid `createdAt`, empty `builder`, an
  additional property, and a missing required check.
- Clean-tree validation now uses normal porcelain status, so non-ignored untracked
  files block a manifest. A temporary non-ignored fixture proves the failure and is
  removed in `finally`; ignored generated evidence remains unaffected.
- Worker and migrator logger creation now receives validated `BESTEHEN_LOG_LEVEL`.
  The regression proves a `warn` threshold suppresses `info`, emits `warn`, and still
  redacts a synthetic secret. Web has no logger construction at this baseline.

Both exact-SHA repair runs
[32660827161](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660827161)
and [32660825511](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32660825511)
passed all seven jobs without retry. This repair adds no provider, product, migration,
deployment, or later-stage behavior.

## Accepted-plan dependency-gate variance

The accepted plan selected pinned `actions/dependency-review-action` for pull requests.
The first CI run proved it unavailable for this private repository without GitHub
Advanced Security. On 2026-08-23 the owner enabled Dependency Graph but explicitly
declined unavailable GitHub Advanced Security; GHAS must not remain an owner gate.

Focused commit `746278d` replaces only that executable gate with a free,
provider-neutral required job: clean frozen exact-lock install, existing registry/source
and lifecycle allowlist enforcement, full-lock `pnpm audit` blocking newly known critical
advisories, and deterministic dependency/license inventories. Bash pipe failure remains
blocking; there is no skip or `continue-on-error`. The now-unused action pin was removed
from executable release-policy validation, while the immutable accepted plan remains
unchanged.

Coverage retained is the accepted Stage 01 rule that newly introduced critical
advisories, unreviewed sources, git dependencies, or lifecycle scripts fail. The named
limitation is loss of GitHub's PR-delta UI and GHSA annotations; the license inventory
also still requires review because the accepted plan defines no automated license deny
list. If GHAS becomes available, add the exact-pinned action back in a narrow reviewed
change while retaining the exact-lock/audit/inventory gates. To roll back this variance,
revert `746278d` only after a replacement required gate is proven available; never
restore an unavailable required check.

## Security, privacy, and accessibility evidence

- Configuration and selected adapters fail closed; production rejects fake adapters;
  all six personal capability flags default closed; deterministic CI contacts no paid
  provider.
- Central redaction covers credentials, URLs, allowlisted identity, signed/object data,
  bodies, text/audio/transcript-like fields, and nested error causes. Secret scanning
  covers repository/diff, safe example, build context, OCI history/config, logs, and
  generated evidence sentinels.
- CI and stored evidence use synthetic identifiers/data only. There are no secrets,
  owner identities, recordings, browser storage, database volumes, raw provider
  responses, private objects, or environment dumps.
- The neutral page uses semantic landmarks/headings, keyboard-reachable controls,
  visible focus, 320 CSS-pixel reflow, and reduced-motion behavior. Chromium axe smoke
  is clean. Manual screen-reader/AT and later complete-flow evidence remain future
  owner/test gates and are not implied by axe.
- Only web HTTP is intended for future public routing. Worker health, PostgreSQL,
  object administration, and migrations remain private. Ingress is explicitly not
  authorization.

## Rollback and compatibility

- Before merge, revert the focused Stage 01 commits on this stage branch. Do not reset,
  rebase, rewrite `main`, or force-push reviewed history.
- After a future merge but before product migrations, stop only inspected baseline
  processes/containers and revert the merge. There is no Stage 01 user data or product
  schema to transform.
- Never use destructive down migration automatically. Future schema changes use
  forward-compatible expand/contract; roll back the app only while the predecessor
  schema range is supported, otherwise roll forward.
- Keep the last passing exact runtime/lock/base digest when updating a tool or
  dependency. Review lifecycle/license/provenance changes and rerun all evidence.
- Standard Node commands, ports, minimal health contracts, explicit migrator,
  PostgreSQL URL, S3-compatible boundary, and provider ports preserve Coolify,
  Render, and comparable-host/provider exits. No Coolify/Pangolin client enters
  domain or application code.

## Owner-controlled gates and limitations

The following do not block repository-only `01E` evidence, but they block any live,
production, or personal-release claim:

- The orchestrator independently reviews this handoff/PR/checks and alone changes the
  checklist from `[~]` to `[x]`.
- A repository owner configures `main` branch protection using the stable seven check
  names above: pull request required, required checks, stale approvals dismissed,
  force pushes/deletions blocked, and least privilege verified. Record dated redacted
  settings evidence without tokens.
- Local Docker remains unavailable; clean Linux CI supplies the non-waivable OCI proof.
  A future local daemon may repeat it, but no duplicate local gate is required for this
  repository-only candidate.
- Provider/account/region/retention/budget/secret-rotation/revocation decisions,
  Coolify/Pangolin, R2, Auth0 EU email OTP, SES Frankfurt, selected AI/STT/TTS,
  protected secret injection, DNS/ingress, live migration, backup/restore, alerting,
  deployment, rollback rehearsal, image publication, tagging, and release acceptance
  remain later owner-controlled work.
- GitHub Advanced Security is explicitly unavailable/declined and is not a remaining
  gate. Dependency Graph is enabled; the required provider-neutral gate above replaces
  the unavailable GHAS action.

## Stage 02 and later inputs

- Stage 02 receives the exact runtime/lock/image/action pins, package boundaries,
  configuration inventory, fake contracts, closed personal flags, health/signal
  contracts, explicit migrator, release schema, `IDR-0001`, owner guide skeletons,
  evidence naming/retention, dependency-gate variance, and this rollback contract.
- After accepted `02E`, a separate single-worker service-readiness checkpoint must
  create or verify private staging resources for Coolify/Pangolin, R2, Auth0 EU email
  OTP, SES Frankfurt, and the selected AI/STT/TTS providers using the generated guides.
  Deterministic fakes remain mandatory in CI.
- After each independently accepted Execution Stage 03 through 09, deploy that exact
  accepted commit to private Coolify staging and run only bounded relevant live
  contract/smoke tests. Use synthetic data, least-privilege staging credentials, strict
  spend limits, protected secret stores, and redacted durable evidence. Use an
  authenticated Coolify connection where available.
- Dashboard-only owner steps must cite the exact guide and verification and must never
  request or store secrets. These checkpoints are later orchestration context, not
  Stage 01 features or claims.
- Stage 10 promotes and comprehensively validates an already integrated build; it must
  not become the first integration point for prior accepted stages.

There is no previous-stage handoff because this is Stage 01.
