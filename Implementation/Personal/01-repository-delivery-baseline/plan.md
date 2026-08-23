# Personal Stage 01 — repository and delivery baseline plan

Status: execution-ready Planning proposal; independent acceptance is pending.

Planning date: 2026-08-23 (Europe/Berlin).

Stage boundary: `01P` only. This document plans `01E`; it does not implement the
workspace, configure a provider, create an account, handle a secret, or deploy a
service.

## 1. Objective

Create the smallest private, portable pnpm modular-monorepo baseline that later
personal stages can extend without weakening the accepted commercial architecture.
Execution will establish reproducible runtime and package versions, enforce dependency
direction, provide product-neutral web and worker processes, prove real PostgreSQL
integration and fake-provider operation, build non-root OCI images, and install CI and
release-evidence gates. The result must run locally without a paid service and retain a
standard Node/PostgreSQL/S3-compatible exit from Coolify, Pangolin, R2, Auth0, and the
commercial AI providers.

## 2. Verified baseline and repository state

The following facts were independently checked before planning:

- Expected and actual GitHub repository: `m-elsharkawi/Bestehen-App`; fetch and push
  URL are both `https://github.com/m-elsharkawi/Bestehen-App.git`.
- GitHub and `git remote show origin` identify `main` as the default branch.
- Accepted baseline: `5c7e8b1ebdd2370b519b2d984b0ff732851b89ae`.
- `origin/main`, the local starting `main`, and the merge base all resolved to that
  exact commit after `git fetch --prune --tags origin`.
- The baseline commit is dated 2026-08-23 19:02:11 +0200 and has subject
  `Add phased personal and commercial implementation prompts`.
- The repository has no tags or releases. The baseline has no check runs and no
  commit-status contexts (GitHub reports a combined `pending` state with zero
  statuses, not a failed check).
- There were no open pull requests, no pull request from the mandated stage branch,
  no matching remote stage branch, and no existing Stage 01 implementation to reuse.
- The working tree was clean before the branch was made.
- Planning is on
  `implementation/personal-01-repository-delivery-baseline`, created directly from
  the accepted baseline. `main` will not be rewritten or merged by this stage.
- The baseline contains architecture, design, and implementation-prompt material but
  no `package.json`, lockfile, workspace declaration, TypeScript configuration,
  workflow, Dockerfile, Compose definition, or production application source.

These assertions are rechecked at the start and end of `01E`. If `origin/main` moves,
execution continues from the accepted baseline on this same stage branch and reports
the divergence; it does not silently rebase, merge, or change the accepted source.

## 3. Authoritative inputs and evidence anchors

Authority is applied in this order: final architecture specification and accepted
ADRs; detailed architecture; incorporated design-review decisions and personal
profile; implementation-program instructions. The personal profile changes the
deployment and access posture only. It does not erase account-optional commercial
contracts, provider ports, portability, evidence rules, or release gates.

All repository inputs below were read from the accepted baseline. Blob IDs make the
review input immutable:

- `Architecture/28-bestehen-app-architecture-specification.md` —
  `89a761d64767e048b59338ec13e61b1b06472dbd`.
- `Architecture/03-technology-stack-and-repository-strategy.md` —
  `907b04c57813dc50f92a7ed00e49196ff7d4a924`.
- `Architecture/12-api-contracts-jobs-events-and-idempotency.md` —
  `c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528`.
- `Architecture/13-frontend-application-and-design-system-architecture.md` —
  `7da94f122fa86412b0d1a12b84c123645693efb4`.
- `Architecture/14-responsive-accessibility-browser-and-device-architecture.md` —
  `362068924a6942eb955dcc132fb4c94da122597b`.
- `Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md`
  — `c588f48790e2fc06b9ba656fddace222d73e554a`.
- `Architecture/25-testing-evaluation-and-quality-gates.md` —
  `83f4f481fb681bf09666032a4e06e7c77289e883`.
- `Architecture/26-environments-ci-cd-release-and-operations.md` —
  `c81412c46aa3b2a77ac9fcb4a0840e1b63af8bd4`.
- `prompts/implementation/README.md` —
  `079359bf538e12591380a6c2c055e1ebcfac18ae`.
- `prompts/implementation/DESIGN_REVIEW_NOTES.md` —
  `7e9ca27e4119b6a189d6ee6bd8c8ee67d05b469a`.
- `prompts/implementation/personal/00-personal-implementation-plan.md` —
  `0943abe96625ebe048f89031b45b76518400f7f1`.
- `prompts/implementation/personal/personal-implementation-checklist.md` —
  `163b0ac746d2953a0caf244b3b9620144dfc58a8`.

Incorporated ADR blobs:

- ADR-0002 `bc55348b30ce9570ecaef29c75477d527ac0bd97` and ADR-0003
  `010437c072277d6d0aed39a53d76b5cb56e363c7`.
- ADR-0006 `05a728f5f545125c60bc775353aff32329af51a9`, ADR-0007
  `025f38e0b834acab7542f6f6a41575decb524b5e`, and ADR-0008
  `a5266a2734faadeeeca1ef350942bb8a3b51ef38`.
- ADR-0019 `3239c98511979ef49a50773e736ce8b0b0e76f9e`, ADR-0020
  `154d1f7e1d0cd2d5d72a8b55717098d5679da17a`, ADR-0021
  `144057917dedbdc91e8ea0c2a32826c7476625c1`, and ADR-0022
  `dd0d19e408898e232629b350aa927615a7174dda`.
- ADR-0032 `54ae839749fe66f8809080466a97f6cde5a917e7`, ADR-0033
  `6cf0903e5e9ef72f121c0234f8e0f3494b5a4500`, and ADR-0034
  `4ca9f8cf6edb65a423d803ae3ae4cb4c733ac574`.

Mutable facts were checked on 2026-08-23 against primary sources:

- [Node.js v24.19.0 archive](https://nodejs.org/download/release/v24.19.0/).
- [Next.js support policy](https://nextjs.org/support-policy), which identifies 16.x
  as Active LTS at the check date.
- [PostgreSQL 18 documentation](https://www.postgresql.org/docs/18/index.html) and
  [versioning policy](https://www.postgresql.org/support/versioning/); 18.6 was the
  current supported minor.
- [pnpm settings](https://pnpm.io/settings) and
  [pnpm build-script policy](https://pnpm.io/settings/build).
- [npm public registry metadata](https://registry.npmjs.org/) queried with exact
  package/version, engine, and peer-dependency fields for every JavaScript choice in
  §7.3.
- [Coolify Dockerfile deployment](https://next.coolify.io/docs/applications/builds/dockerfile)
  and [health checks](https://next.coolify.io/docs/applications/configuration/health-checks).
- Pangolin [resources](https://docs.pangolin.net/manage/resources/understanding-resources),
  [targets](https://docs.pangolin.net/manage/resources/public/targets),
  [health/failover](https://docs.pangolin.net/manage/resources/public/healthchecks-failover),
  and [DNS/networking](https://docs.pangolin.net/self-host/dns-and-networking).
- Render [Docker](https://render.com/docs/docker),
  [deploy](https://render.com/docs/deploys),
  [service types](https://render.com/docs/service-types), and
  [Blueprint](https://render.com/docs/blueprint-spec) documentation, used only to
  preserve the documented exit path.

No provider account, DNS record, credential, billing setting, running service, or live
provider state was inferred from documentation.

## 4. Reconciled personal deployment decision

`01E` records `docs/decisions/IDR-0001-personal-deployment-profile.md`. The record is
implementation-specific and subordinate to the accepted ADRs. It states:

- Personal ingress is Pangolin and the application VM/orchestration target is
  Coolify. Only the web HTTP target is public. PostgreSQL, the worker control port,
  object-store administrative surfaces, and other persistent services stay on the
  private LAN or provider-private endpoint.
- Pangolin forwards the public FQDN to the web target and uses web readiness for
  routing. It is not an application-authorization substitute. Auth0 remains the
  identity proof and the server remains the authorization authority.
- Auth0 EU Universal Login email OTP is mandatory for the personal profile,
  registration is closed, and only the owner's configured identity is admitted. No
  password fallback is introduced.
- Commercial account-optional/guest domain and HTTP contracts remain viable behind
  typed flags, but guest presentation and the obsolete no-account-wall UI are disabled
  in the personal profile. A future commercial profile can enable the port without a
  domain rewrite.
- Private objects use an S3-compatible port implemented by R2 in the personal profile.
  AI, STT, TTS, email, identity, object storage, and ingress remain adapter/configuration
  choices. Provider SDK types do not enter domain or application interfaces.
- The processes remain standard Node programs with PostgreSQL and S3-compatible
  boundaries. The OCI images and health contracts remain deployable on Render or a
  comparable host; no Coolify or Pangolin API is imported into production packages.
- No native app or PWA installability is added.

This decision is reversible by changing adapters, configuration, and ingress—not by
changing accepted domain facts.

## 5. Scope

`01E` is limited to:

- Root workspace, tool, lock, update, ownership, and repository policy files.
- Product-neutral `web` and `worker` process shells, health/readiness endpoints, signal
  handling, and compilation targets.
- Domain, application, contract, infrastructure, configuration, content,
  design-system, and test-support package boundaries with deliberately tiny public
  exports.
- Configuration validation, secret-name inventory, fake-adapter defaults, feature-flag
  types, structured logging/redaction, and release metadata contracts.
- PostgreSQL 18 local/test service and a single explicit migration command/harness with
  no product schema.
- Web and worker OCI build definitions, non-root runtime, internal health probes, and
  a Coolify/Pangolin-compatible network contract.
- Local, pull-request, and release-candidate checks; immutable evidence naming and
  retention; exact GitHub Action pins.
- The personal deployment-profile implementation decision record and operator-facing
  baseline documentation.

## 6. Explicit non-scope

`01E` does not implement learner, content, attempt, evidence, readiness, mock, export,
deletion, notification, billing, analytics, or provider workflows. It does not define
product tables, canonical product state unions, jobs, HTTP product endpoints, model
prompts, design components, or copied design assets. Those belong to later accepted
stages.

It also does not:

- create or modify GitHub rules, DNS, Coolify, Pangolin, Auth0, R2, SES/email, AI,
  speech, Render, or other provider resources;
- request, reveal, copy, validate, rotate, or commit a real credential or personal
  identity;
- deploy, publish an image, run a production migration, or claim a live-provider test;
- add native mobile, service-worker, manifest, install prompt, offline product behavior,
  or PWA scope;
- merge the pull request or mark `01P`, `01E`, or a program gate complete.

## 7. Repository and dependency decisions

### 7.1 Workspace layout

The private workspace uses `apps/*` and `packages/*`:

```text
apps/web                 Next.js server-first composition root
apps/worker              standard Node/pg-boss composition root
packages/domain          pure product vocabulary and invariants
packages/application     use cases and provider/storage/job ports
packages/contracts       versioned transport/job/event schemas
packages/infrastructure  PostgreSQL, pg-boss, HTTP/provider and fake adapters
packages/configuration   environment schemas, flags, release metadata, redaction
packages/content         versioned content-import/publication boundary
packages/design-system   semantic React UI primitives/tokens boundary
packages/test-support    builders, fakes, fixtures, PostgreSQL test helpers
```

There is no `shared`, `common`, or `utils` package. New code is placed with the owner of
the concept. Every package declares explicit `exports`; production code cannot import
another package's `src` path.

### 7.2 Allowed direction

- `domain` imports no workspace package and no framework/provider package.
- `contracts` may use `domain` vocabulary, never infrastructure.
- `application` may use `domain` and `contracts` and defines ports.
- `configuration` uses schema/logging libraries but no application or infrastructure.
- `infrastructure` implements application ports and may use `domain`, `contracts`, and
  `configuration`.
- `content` may use domain/contract schema vocabulary; it never reaches provider SDKs.
- `design-system` is UI-only with React as a peer; it does not import application or
  infrastructure.
- `web` and `worker` are composition roots. They may wire application ports to
  infrastructure adapters and configuration. Business decisions cannot live there.
- `test-support` is dev-only and may depend on public test surfaces; no production
  package may depend on it.

`dependency-cruiser` and TypeScript project references enforce these arrows. Cycles,
deep imports, application-to-infrastructure imports, and provider/framework imports in
domain fail CI.

### 7.3 Exact runtime and package baseline

All manifest ranges are exact; `saveExact: true`, a shared lockfile, strict peer checks,
and frozen installs are mandatory. The initial choices are:

- Node.js `24.19.0`, pnpm `11.23.0`, TypeScript `5.9.3`.
- Next.js `16.3.2`, React `19.2.8`, React DOM `19.2.8`.
- PostgreSQL `18.6`, Kysely `0.29.5`, `pg` `8.23.0`, pg-boss `12.27.0`.
- Biome `2.5.10`, Vitest `4.1.11`, Playwright `1.62.1`.
- Testing Library React `16.3.2`, DOM `10.4.1`, jest-dom `7.0.1`,
  axe Playwright `4.13.0`.
- Zod `4.4.3`, jsdom `30.0.1`, dependency-cruiser `18.2.0`, fast-check
  `4.9.0`, Pino `10.3.1`, and tsx `4.23.12`.
- Type declarations: `@types/node` `24.13.3`, `@types/react` `19.2.18`,
  `@types/react-dom` `19.2.4`, and `@types/pg` `8.23.1`.
- Coverage adapter: `@vitest/coverage-v8` `4.1.11`.

The official multi-architecture image tags resolved on 2026-08-23 to:

- `node:24.19.0-bookworm-slim` —
  `sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03`.
- `postgres:18.6-bookworm` —
  `sha256:7d2695c3aa88e792e8b3b233e7e4adb296a20412c6c0ca361e3edaaacfada108`.

`01E` re-resolves the tag, records the platform-specific manifest used by the build,
and fails for review if either digest changed. It never silently substitutes a tag.

A disposable compatibility spike under exact Node `24.19.0` and pnpm `11.23.0`
installed the listed application/tool packages, executed the TypeScript, Next, Biome,
Vitest, and Playwright CLIs, imported the ESM runtime modules, and completed a frozen
offline reinstall. All passed. The install also proved pnpm 11's default supply-chain
behavior: an unreviewed `esbuild@0.28.2` lifecycle script fails the install. Therefore
`pnpm-workspace.yaml` explicitly sets only `allowBuilds.esbuild: true`; all other new
dependency lifecycle scripts fail until their exact purpose and artifact are reviewed.
`dangerouslyAllowAllBuilds` is forbidden.

The dated registry metadata also confirms the constraining engines/peers: pnpm requires
Node at least `22.13`; Next requires Node at least `20.9` and accepts React 19; Kysely
requires Node at least 22; pg-boss requires Node at least `22.12`; Vitest accepts Node
24; Playwright requires Node at least 20; and jsdom accepts Node `24.15` or newer. Node
`24.19.0` and the matching React/React DOM `19.2.8` satisfy all of them. `01E` repeats
these metadata assertions from the resolved lock and fails if a transitive constraint
or peer relationship changes.

### 7.4 Update and generated-file policy

- Runtime, direct dependency, container, and action updates arrive in separate,
  reviewable pull requests with lock diff, release notes, engine/peer validation, and
  the complete gate set. No floating `latest`, caret, or tilde versions.
- The pnpm lockfile is generated only by the pinned pnpm version and is committed.
  Manual edits fail review.
- Generated build output, coverage, Playwright output, local objects, secrets, and
  environment files are ignored. Checked-in generated contracts require their source,
  generator version, deterministic regeneration command, and clean-diff check.
- License and dependency metadata are evidence outputs, not bundled private source.
- Dependency-review and lock-policy gates reject unreviewed source URLs, git
  dependencies, lifecycle scripts, or newly introduced critical advisories. Any
  accepted exception is narrow, dated, owned, and documented.

## 8. Runtime, configuration, and delivery contracts

### 8.1 Local operation and fakes

The default developer path uses local PostgreSQL 18 and deterministic in-memory or
filesystem fakes for identity proof, object storage, email, AI, STT, and TTS. External
calls are denied unless an explicit non-test profile and its complete configuration are
selected. Tests install an egress guard and fail if a fake unexpectedly opens an
external socket.

`compose.yaml` binds PostgreSQL only to `127.0.0.1`, uses the pinned digest, a named
volume, `pg_isready`, and synthetic local credentials. Test databases are isolated by
run ID and dropped by the test harness. No real or production-derived data is allowed.
Web and worker run as local Node processes for fast iteration; optional Compose profiles
exercise their built images.

The documented happy path is: verify tools; frozen install; start PostgreSQL; run the
one-shot migrator; start web and worker; inspect liveness/readiness; run the local gate.
The stop path terminates processes gracefully and removes only the named local test
resources, never an unresolved directory or shared volume.

### 8.2 Typed configuration and secret boundary

Configuration is validated once at each process composition root. Build-time config,
server runtime config, and explicitly public browser config are separate schemas. Next
builds do not require live secrets. A value required by a selected adapter is required
only when that adapter is enabled; production refuses fake adapters and incomplete
configuration.

The committed example contains safe placeholders, never working values. The inventory
reserves these server-only classes for later stages:

- PostgreSQL URL/pool/timeouts; release commit, image digest, environment, and schema
  compatibility range.
- Auth mode, Auth0 domain/client identifiers, session secret, application base URL,
  and the owner's closed-registration allowlist. The allowlist is sensitive personal
  configuration and never logged or exposed to the browser.
- Object adapter, R2/S3 endpoint, region, bucket/prefix, access-key identifier, and
  secret key.
- Email, AI/evaluator, STT, and TTS adapter identifiers, credentials, immutable model
  release identifiers, timeouts, and disabled-by-default cost envelopes.
- Log level/format, trace sampling, web/worker ports, shutdown grace, and health-check
  timeouts.

The browser receives no secret and no provider credential. Public variables are
allowlisted individually; a generic environment passthrough is forbidden. Unknown
variables and malformed booleans fail validation. Error messages name missing fields
but never echo values.

Feature flags are typed, centrally owned, and included in release metadata. Personal
defaults are fail-closed: guest presentation off, account-optional presentation off,
external provider calls off, paid productive processing off, public object access off,
and experimental product behavior off. Flags can close admission but cannot reinterpret
persisted truth or silently change a release.

### 8.3 Structured logging and redaction

Every log line is structured and carries service, environment, release commit, request
or job correlation ID, event name, severity, and duration where relevant. The central
redactor removes authorization/cookie headers, session material, database URLs,
credentials, signed URLs, email/owner identity, raw bodies, user text, audio/transcript
content, provider payloads, and stack-local secret fields. Health responses and logs
contain no configuration values. Tests inject sentinel secrets into every named source
and assert neither logs nor errors contain them.

The baseline logs only operational events. It introduces no product analytics and no
learner telemetry. Correlation IDs are opaque and not identity keys.

### 8.4 Database and migration ownership

PostgreSQL is the only durable relational/job authority. Kysely uses explicit SQL; no
ORM entity graph is introduced. A dedicated one-shot `db:migrate` command is the sole
migration owner. Web and worker startup never run migrations.

The Stage 01 migrator may create only Kysely migration metadata; it creates no product
table or seed data. It takes an advisory lock, reports the exact from/to revision, and
fails atomically. Readiness checks connectivity and that the observed revision is within
the process's declared compatibility range. A mismatch returns not-ready without
mutating data.

Future migrations use expand/contract: additive compatible schema; backfill with
observable checkpoints; switch readers/writers; later contract only after the rollback
window. Destructive down-migrations are not an automatic rollback mechanism. The
migration artifact is tied to the exact application commit and is rehearsed against
synthetic PostgreSQL 18 data in CI.

### 8.5 Web and worker process contracts

The web process binds `0.0.0.0:3000` by default and supplies:

- `/api/health/live`: process/event-loop liveness only; no provider or database call.
- `/api/health/ready`: validated runtime configuration, PostgreSQL connectivity, and
  schema compatibility. Optional providers do not make the whole application unready;
  their later capability admissions close separately.

The worker is a separate standard Node process with a private control listener. Its
liveness proves the event loop and shutdown state; readiness proves configuration,
PostgreSQL, schema compatibility, and pg-boss supervisory availability. It accepts no
public workload in Stage 01. Both processes handle `SIGTERM`/`SIGINT`, stop admission,
drain bounded in-flight work, close pools, and exit non-zero on failed startup.

Health payloads are stable, versioned, minimal JSON with status, service, and release
commit. They do not expose dependency addresses, exception detail, environment values,
or identities. Readiness failure is neutral operational evidence, not a product claim.

### 8.6 OCI and network contract

`Dockerfile.web` and `Dockerfile.worker` are independent multi-stage builds from the
pinned Node digest. They install from the frozen lockfile, copy only the relevant
pruned runtime result, run as a fixed non-root UID/GID `10001`, write only to declared
temporary directories, and use init/signal-safe commands. A Node health-probe script
avoids adding curl solely for `HEALTHCHECK`.

The images carry OCI source, revision, created-at, runtime, and license labels. No build
argument or layer contains a runtime secret. CI inspects image history/config, asserts
the runtime user is non-root, starts with a read-only root filesystem plus bounded
tmpfs, and smoke-tests signals and health.

Coolify receives the repository Dockerfile, command, internal port, health path, and
runtime secret references later. Pangolin receives only the web target and readiness
path later. The worker control port and PostgreSQL are never Pangolin resources. Web
readiness is the target health/failover signal; liveness is retained for restart
diagnosis. Binding `0.0.0.0` is a container reachability requirement, not authorization.

The same Dockerfiles accept ordinary environment injection and standard Node commands
on Render. No `render.yaml` or live provider configuration is needed in Stage 01; the
exit is demonstrated by provider-neutral images, ports, health paths, and migration
command.

### 8.7 Release identity and evidence

A release manifest schema records exact Git commit, clean/dirty state, dependency
lock digest, web/worker image digests, migration revision/range, Node/pnpm/PostgreSQL
versions, action/tool versions, flags, check IDs, creation time, and builder identity.
It provides independent immutable slots for application, content, evaluation, and model
releases. Stage 01 does not invent later release IDs; absent axes are explicitly
`not-produced`, never `latest`.

Build once and promote by digest is the target. Rebuilding from the same commit is a
reproducibility check, not the same artifact identity. Release manifests and test
reports contain synthetic evidence only and no secret or private data.

## 9. Checks and CI decisions

### 9.1 Local fast gate

`pnpm check` runs formatting verification, lint, typecheck, package-boundary checks,
unit tests, configuration/redaction tests, and workspace build. `pnpm check:full` adds
real PostgreSQL integration, web/worker process smoke, browser/axe smoke, OCI build and
non-root/health/signal checks when Docker is available.

There is no retry-to-green. A diagnosed infrastructure retry is separately reported;
one diagnostic retry still classifies the check as flaky and cannot satisfy an accepted
release gate.

### 9.2 Pull-request gate

The required workflow runs on pull requests and branch pushes with least-privilege
read-only contents permission, concurrency cancellation for superseded commits, and no
provider secret. It performs:

1. repository/scope/secret and frozen-lock policy checks;
2. format, lint, typecheck, dependency direction, public-export, and generated-diff
   checks;
3. unit/property/configuration/redaction tests and advisory coverage output;
4. PostgreSQL 18 migration/integration/compatibility tests on synthetic data;
5. deterministic web/worker builds and startup/shutdown/health tests;
6. Playwright Chromium critical smoke and axe automation, with keyboard/focus/manual
   requirements tracked explicitly rather than claimed by axe alone;
7. web and worker OCI builds, non-root/image-history/read-only-root/health/signal checks;
8. software/dependency inventory, release-manifest dry run, and evidence upload.

Coverage is diagnostic in Stage 01; behavioral, invariant, boundary, accessibility,
security, migration, and process claims are the gates. The workflow never contacts a
paid provider.

### 9.3 Release-candidate gate

A manually dispatched, non-publishing workflow accepts only an exact commit SHA. It
repeats all required gates, builds both images once, records their local digests,
generates and verifies the release manifest, and uploads the manifest/test evidence.
Image publication and deployment remain Stage 10 owner-controlled actions. The workflow
rejects a dirty tree, mutable reference, missing evidence, schema incompatibility, or
unresolved claim-risk failure.

### 9.4 Pinned workflow actions

Execution uses these full commit pins, verified from the official repositories on
2026-08-23; the readable release tag remains a comment only:

- `actions/checkout` v7.0.1 — `3d3c42e5aac5ba805825da76410c181273ba90b1`.
- `actions/setup-node` v7.0.0 — `820762786026740c76f36085b0efc47a31fe5020`.
- `pnpm/action-setup` v6.0.10 — `0977fd99725f1db4007ccb2928dbb4e90d06cc86`.
- `actions/upload-artifact` v7.0.1 — `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`.
- `actions/download-artifact` v8.0.1 — `3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c`.
- `actions/dependency-review-action` v5.0.0 —
  `a1d282b36b6f3519aa1f3fc636f609c47dddb294`.
- `docker/setup-buildx-action` v4.3.0 —
  `37fe631027851001ddb9b187196cc803df7f5f0e`.
- `docker/build-push-action` v7.3.0 —
  `53b7df96c91f9c12dcc8a07bcb9ccacbed38856a`.

Each action update is reviewed like a dependency update. Workflow permissions are
declared explicitly. Pull-request jobs cannot publish packages, images, deployments,
statuses beyond their own checks, or artifacts containing environment dumps.

### 9.5 Evidence naming and retention

Evidence names start with exact commit and check ID. PR test/coverage/browser reports
are retained 14 days; release-candidate manifests and security/dependency inventories
90 days. Failure artifacts are redacted before upload. Raw environment, PostgreSQL
volumes, browser storage state, audio, provider payloads, and secrets are never evidence.
Long-term accepted release evidence is a later governed repository/database concern;
GitHub artifact retention is not treated as the evidence ledger.

## 10. File-by-file execution map

All paths in this section are proposed `01E` paths; none exists at the Planning
baseline unless stated otherwise.

### 10.1 Root policy and tooling

- `package.json`: private root, exact package manager/runtime engines, canonical scripts,
  exact dev dependencies, no publish surface.
- `pnpm-workspace.yaml`: `apps/*` and `packages/*`, exact catalog if used,
  `saveExact`, strict peer/cycle behavior, and only `allowBuilds.esbuild: true`.
- `pnpm-lock.yaml`: pinned shared dependency graph generated by pnpm `11.23.0`.
- `.node-version` and `.npmrc`: exact Node hint and registry/auth-only safe pnpm/npm
  settings; no credential or registry token.
- `.gitignore` and `.dockerignore`: exclude secrets, local data, caches, test/build
  output, temporary objects, and Git metadata from image context while preserving
  safe examples.
- `.env.example`: fake/local placeholders only; variable names and purpose, no real
  endpoint, owner identity, or credential-shaped value.
- `biome.jsonc`, `tsconfig.base.json`, `vitest.workspace.ts`, and
  `playwright.config.ts`: centralized strict tool policy and deterministic roots.
- `dependency-cruiser.cjs`: the arrows and forbidden deep/provider imports in §7.2.
- `compose.yaml`: pinned local PostgreSQL, loopback-only port, named volume, health,
  optional built-process profiles.
- `Dockerfile.web` and `Dockerfile.worker`: pinned multi-stage, pruned, non-root images.

### 10.2 Repository automation and governance

- `.github/workflows/ci.yml`: the PR gate in §9.2 with exact action SHAs.
- `.github/workflows/release-candidate.yml`: manual exact-commit, non-publishing release
  evidence in §9.3.
- `.github/dependabot.yml`: grouped-by-risk dependency/action proposals, never auto-merge.
- `.github/CODEOWNERS`: platform ownership for root, workflow, container, configuration,
  migration, and decision paths; initial owner is the repository owner/team supported
  by GitHub, with no invented account.
- `.github/pull_request_template.md`: scope, source, migration, privacy, accessibility,
  evidence, rollback, and owner-gate checklist.
- `scripts/check-boundaries.mjs`, `scripts/check-lock-policy.mjs`,
  `scripts/check-secrets.mjs`, and `scripts/check-generated.mjs`: deterministic checks
  with tests/fixtures and non-zero failure.
- `scripts/release-manifest.mjs` and `schemas/release-manifest.schema.json`: exact release
  evidence generation and JSON Schema validation.
- `scripts/healthcheck.mjs`: service/port/path-selectable Node health probe with bounded
  timeout and no response logging.

### 10.3 Packages

Each package gets `package.json`, referenced `tsconfig.json`, `src/index.ts`, and a
boundary smoke test. Initial exports are intentionally minimal:

- `packages/domain`: nominal identifiers/result helpers only if needed to prove the
  package; no product state model is invented.
- `packages/contracts`: version envelope and schema-validation primitives; no product
  endpoint.
- `packages/application`: lifecycle/clock/ID and provider-port patterns needed by the
  shells; no use case.
- `packages/configuration`: environment schemas, server/public separation, flags,
  release metadata, log redaction, and sentinel tests.
- `packages/infrastructure`: PostgreSQL pool/migration/readiness, pg-boss supervisor,
  fake adapter registry, and tests; provider SDKs wait for their owning stage.
- `packages/content`: empty versioned content-boundary export, not a corpus or seed.
- `packages/design-system`: semantic document/shell primitive sufficient for an
  accessible smoke page; no design recreation or external asset/font.
- `packages/test-support`: synthetic builders, fake clock/ID, log capture, egress guard,
  PostgreSQL database lifecycle, and process probes.

Database runner/migration-provider code stays under
`packages/infrastructure/src/postgres/`; its migrations directory has no product
migration. Infrastructure package tests prove empty up/down status, advisory ownership,
and compatibility behavior.

### 10.4 Applications

- `apps/web/package.json`, `tsconfig.json`, `next.config.ts`, and source tree: standalone
  Next output, server-first accessible product-neutral page, composition root, and
  liveness/readiness route handlers. No client state library, service worker, manifest,
  remote font, auth screen, or product route.
- `apps/web/tests/`: route, configuration-failure, keyboard/focus/landmark, axe, process,
  and graceful-shutdown smoke tests.
- `apps/worker/package.json`, `tsconfig.json`, and `src/`: explicit main, private control
  server, pg-boss supervision without a product queue, readiness, and graceful stop.
- `apps/worker/tests/`: configuration failure, database loss/recovery, readiness,
  signal/drain, and process-exit tests.

### 10.5 Documentation and decision evidence

- `README.md`: purpose, authority links, prerequisites, exact local path, checks, and
  troubleshooting; it does not claim deployed state.
- `docs/architecture/package-boundaries.md`: arrows, ownership, examples, and the
  measured split triggers retained from the architecture.
- `docs/configuration.md`: every variable, secret/public classification, environment
  applicability, fake default, validation and rotation owner placeholder.
- `docs/local-development.md`: synthetic PostgreSQL/fake-provider setup and safe cleanup.
- `docs/delivery.md`: OCI commands, ports, health, migration ownership, evidence,
  retention, rollback, and provider-neutral handoff.
- `docs/decisions/IDR-0001-personal-deployment-profile.md`: §4 decision, explicit
  relationship to ADR-0008 and commercial exit.

No architecture or design source document is edited.

## 11. Contracts and migration implications

Stage 01 establishes technical envelopes, not product semantics:

- HTTP health contract v1 and worker control health contract v1.
- Configuration, feature-flag, structured-log/redaction, provider-port marker, and
  release-manifest schemas.
- PostgreSQL pool, migration-owner, revision-compatibility, and pg-boss supervisor
  interfaces.
- Process exit/signal and OCI port/user/health contracts.

It deliberately does not freeze later product payloads, reason codes, event names,
jobs, or the five validity/six readiness states. When later stages add them, they must
use the exact accepted architecture vocabulary, versioned contracts, durable
idempotency, and compatibility tests. No generic event bus or provider object becomes
an architectural contract in Stage 01.

There is no product data migration. The only persistent side effect available to
execution is Kysely's migration metadata in a disposable local/test database when the
explicit migrator is invoked. Rollback of the repository baseline therefore removes
the new application/workspace files and local named resources; it never runs a
destructive production database command.

## 12. Security, privacy, accessibility, reliability, and cost implications

### Security and privacy

- Default-deny external calls, fake providers, server-only secrets, explicit public
  allowlist, central redaction, least-privilege workflows, non-root/read-only containers,
  private database/worker networking, frozen dependencies, reviewed lifecycle scripts,
  and secret/image-history scans are release gates.
- Synthetic data only. The plan does not process learner data, owner identity, audio,
  content corpus, or provider payload.
- Auth0 closed registration is a future adapter/configuration gate; Stage 01 neither
  weakens nor pretends to test it.

### Accessibility and responsive behavior

- The neutral web shell uses semantic landmarks, keyboard access, visible focus,
  no external font, no color-only state, reduced-motion-safe defaults, and responsive
  layout without global device blocking.
- Automated axe is evidence only for detectable rules. Keyboard, focus order,
  zoom/reflow, contrast, reduced motion, and browser/device behavior remain explicit
  manual/automated claims. Product design conformance belongs to Stage 04.

### Reliability and observability

- Liveness is dependency-free; readiness is strict for required config/database/schema.
  Capability health will later close only the affected admission.
- One migrator, bounded shutdown, correlation without identity, immutable release
  evidence, and no retry-to-green reduce ambiguous state.
- No SLO is claimed from a scaffold. The shell provides measurement points only.

### Cost

- Local and CI acceptance use PostgreSQL plus fakes and no paid API. Stage 01 creates
  no account or spend.
- Paid-provider flags and cost envelopes default closed. No euro budget is invented.
- CI artifact retention is bounded; image publication and hosted resources wait for
  owner approval in later stages.

## 13. Test and evidence matrix

Every ID below must link to the exact `01E` commit and raw CI check/artifact in the PR
handoff. “Pass” means first-run pass; a diagnostic retry is recorded as flaky.

- `P01-BASE-001` — remote/default/base/merge-base/branch/clean-tree verification.
  Evidence: command transcript with exact SHAs and `gh` JSON.
- `P01-SCOPE-001` — changed paths are contained by the §10 map; no architecture/design,
  product feature, native/PWA, secret, provider, or deployment mutation. Evidence:
  diff allowlist and scope scanner.
- `P01-DEPS-001` — exact Node/pnpm versions, frozen clean install, lock regeneration
  clean, peer/engine compatibility, only reviewed `esbuild` build script. Evidence:
  versions, lock digest, install logs, negative unreviewed-script fixture.
- `P01-BOUNDARY-001` — allowed dependency arrows and public exports. Evidence:
  dependency graph plus negative fixture tests for each forbidden edge/deep import.
- `P01-TYPE-001` — all referenced TypeScript projects typecheck and build. Evidence:
  root job log and clean generated diff.
- `P01-STYLE-001` — Biome format/lint. Evidence: zero findings.
- `P01-UNIT-001` — package/application unit and property tests. Evidence: Vitest report;
  coverage is advisory.
- `P01-CONFIG-001` — valid fake/local config succeeds; missing, unknown, malformed,
  incomplete selected-adapter, and production-fake config fail closed. Evidence:
  schema test report.
- `P01-SECRET-001` — repository/diff, example env, build context, image history,
  runtime logs/errors, and uploaded artifacts contain no credential/sentinel value.
  Evidence: scanners and redaction test.
- `P01-PG-001` — PostgreSQL 18.6 connection, explicit migrator, advisory ownership,
  empty revision, schema mismatch, connection loss/recovery, and isolated cleanup.
  Evidence: real-PostgreSQL integration report.
- `P01-JOB-001` — worker supervision starts without product queues, reports readiness,
  loses readiness on required DB loss, recovers, drains, and exits correctly. Evidence:
  process/integration log.
- `P01-HTTP-001` — web liveness is dependency-free; readiness checks required config,
  DB and schema; payload leaks no detail. Evidence: contract tests.
- `P01-A11Y-001` — semantic/keyboard/focus/reflow/reduced-motion smoke and axe on the
  neutral page. Evidence: Playwright report; manual items are named, not implied.
- `P01-OCI-WEB-001` and `P01-OCI-WORKER-001` — exact base digest, non-root UID,
  minimal runtime files, no secrets/history leak, read-only-root start, health, signal,
  and bounded shutdown. Evidence: build metadata and container smoke logs.
- `P01-RELEASE-001` — manifest validates and binds exact commit, lock, image,
  migration, flag, and test identities; mutable/dirty/missing input fails. Evidence:
  schema tests and generated dry-run manifest.
- `P01-DOC-001` — repository Markdown, local links, command snippets, configuration
  inventory, decision links, and owner guides are complete and consistent. Evidence:
  documentation/link checks and a fresh-directory rehearsal.

## 14. Rollback and compatibility plan

- Before merge, rollback is a normal revert of the Stage 01 commit(s) on the stage
  branch. Never rewrite `main` and never force-push reviewed history.
- After merge but before any later product migration, revert the merge; stop the local
  web/worker; remove only their explicitly named local containers/volumes after target
  inspection. The baseline has no user data to transform.
- If a tool/runtime pin fails, keep the last passing exact lock/runtime/image digest,
  open a narrowly scoped update, and rerun all evidence. Do not broaden ranges.
- If a new dependency lifecycle script appears, the install remains failed until the
  package/version/script is reviewed and explicitly allowed or the dependency is
  removed.
- If Coolify/Pangolin assumptions drift, retain standard Dockerfile/Node port/health
  semantics and update the future operator guide after official-doc revalidation. No
  provider-specific code enters domain/application.
- Future database changes use forward-compatible expand/contract. App rollback is
  allowed only while the predecessor remains schema-compatible; otherwise roll forward.
- Commercial compatibility is retained by provider ports and preserved guest/account-
  optional contracts. The personal profile disables presentation/admission; it does not
  delete the capability boundary.

## 15. Manual owner actions and unresolved external gates

No action below is performed by `01P` or claimed complete:

1. Independently accept this plan and change `01P` to complete; the worker must not do
   so.
2. After `01E` creates stable required-check names, configure GitHub branch protection
   for `main`: pull request required, required checks from §9, stale approvals dismissed,
   force pushes/deletions blocked, and least privilege verified. Record a dated settings
   screenshot/JSON without tokens. This requires repository-owner authority.
3. Enable a local Docker daemon or rely on clean GitHub CI to execute the OCI runtime
   checks. At Planning time Docker CLI `29.5.3` was present but the daemon was not
   reachable; registry manifest-digest inspection still succeeded. This is the only
   unavailable local compatibility check and does not justify claiming an OCI pass.
4. In Stage 02, select/create and secure Coolify, Pangolin, R2, Auth0 EU, SES/email, and
   commercial AI/STT/TTS accounts; establish budgets, regions, retention, rotation, and
   recovery. Verify through dated owner guides without committing secrets.
5. In Stage 10, create DNS/ingress targets, inject runtime secret references, execute
   the explicit migrator, deploy exact image digests, test health/rollback/restore, and
   accept the personal release. None is a Stage 01 Planning fact.

Unresolved owner-controlled gates are therefore GitHub protection settings, a usable
OCI runtime for local smoke (CI may provide independent evidence), all provider/account/
DNS/secret decisions, and later deployment/backup/restore acceptance. They do not block
the repository-only execution scaffold, but they block any production or live-provider
claim.

## 16. Risks and mitigations

- **Mutable versions or images:** exact pins, dated primary evidence, digest recheck,
  lock review, and separate update PRs.
- **pnpm lifecycle supply-chain execution:** strict default plus the single reviewed
  `esbuild` allowance; negative fixture and lock-policy check.
- **Package shells becoming speculative architecture:** minimal exports, no product
  state, ownership map, forbidden edges, and later feature owners extend them.
- **Framework/provider leakage:** composition roots and infrastructure adapters only;
  dependency graph fails leakage.
- **Personal profile erases commercial portability:** explicit IDR relationship to
  accepted ADRs, typed disabled gates, standard processes, and S3/identity/AI ports.
- **Health exposes detail or creates cascading outages:** minimal payload, dependency-
  free liveness, required-only readiness, later capability-level admission.
- **Migration races:** one explicit migrator and advisory ownership; no migration in
  web/worker startup.
- **Fake path diverges from providers:** contract suites are shared; live smoke waits
  for a named owner-controlled gate and never substitutes for deterministic fakes.
- **CI falsely claims accessibility/security:** exact claim matrix, manual evidence
  retained, axe/secret scanners treated as partial signals.
- **Docker unavailable locally:** do not claim pass; require independent Linux CI OCI
  evidence before `01E` acceptance.
- **Artifacts leak private data:** synthetic inputs, central redaction, content scan,
  bounded retention, forbidden environment/state uploads.

## 17. Execution order

1. Re-fetch and repeat `P01-BASE-001`; stop on remote mismatch, baseline absence,
   unexpected stage work, or unrelated dirty paths.
2. Add root runtime/workspace/tool policy and exact manifests; generate the lock with
   Node `24.19.0`/pnpm `11.23.0`; prove frozen clean install and lifecycle policy.
3. Add package skeletons/public exports and dependency rules; land negative boundary
   fixtures before application composition.
4. Add typed configuration, flags, release metadata, logging/redaction, test support,
   and fake registry; prove fail-closed cases.
5. Add PostgreSQL pool/migration/readiness and pg-boss supervision with real PG tests,
   no product schema/queue.
6. Add web/worker composition roots, neutral accessible web page, health endpoints,
   signals, and process tests.
7. Add local Compose, both Dockerfiles, probe, and OCI checks; record local limitation
   honestly and require Linux CI.
8. Add CI/release-candidate workflows, release schema/generator, dependency/secret/
   generated policy checks, retention, CODEOWNERS, and PR template.
9. Add baseline documentation and `IDR-0001`; rehearse instructions from a clean clone
   using only fakes and synthetic PostgreSQL.
10. Run every §13 check, inspect full diff/history/artifacts for scope and secrets,
    commit to the same stage branch, push, and update the existing draft Stage 01 PR.
    Do not merge or mark checklist lines complete.

## 18. Precise definition of done for `01E`

`01E` is ready for independent acceptance only when all of the following are true:

- The exact accepted baseline, branch, remote, and PR ancestry are evidenced; no
  duplicate or unrelated work was introduced.
- Every created path is in §10, every dependency arrow in §7 passes, and no product,
  provider mutation, secret, native/PWA, or architecture/design-source edit exists.
- Node/pnpm/package/image/action versions are exact, the lock is reproducible, the only
  allowed dependency build script is reviewed `esbuild`, and frozen install passes.
- Web and worker build/run separately, are non-root in OCI, expose correct private/public
  health contracts, handle signals, and never run migrations at startup.
- Real PostgreSQL 18 integration and explicit single-migrator/schema-compatibility tests
  pass with synthetic data; default identity/object/email/AI/speech paths are fakes and
  make no external call.
- Typed configuration fails closed, personal flags are closed as specified, logs/errors/
  images/artifacts redact sentinel secrets, and the browser receives no server config.
- Format, lint, type, boundary, unit/property, integration, browser/accessibility,
  OCI, release-manifest, dependency, secret, documentation, and generated-diff checks
  pass on the first recorded run or are reported as unresolved—not retried to green.
- The personal deployment IDR preserves commercial exit seams and names the exact
  later owner actions without claiming live state.
- The draft PR targets `main`, stays on
  `implementation/personal-01-repository-delivery-baseline`, contains only Stage 01
  Planning plus Execution, and identifies exact commits/checks/evidence/risks/gates.
- The checklist `01E` and all program gates remain incomplete. Only the orchestrator
  may mark `01P`/`01E` accepted after independent verification.

## 19. Planning-artifact acceptance checks

Evidence ID `P01-PLAN` denotes the immutable Planning commit, draft PR, and the exact
outputs of the checks in this section. It is not `01E` implementation evidence.

Before this Planning commit is handed off:

- verify the branch and merge base equal the values in §2;
- ensure changed paths are exactly this plan and the checklist;
- ensure the checklist diff changes only the `01P` line and leaves it `[~]`;
- run whitespace/Markdown/local-link/required-section checks;
- scan the diff for credential/private-data patterns and prohibited later-stage scope;
- verify every external mutable claim has a dated primary source and every repository
  source has an immutable baseline anchor;
- commit, push, and create one draft PR targeting `main`; then independently query the
  PR base/head/draft/commit/check state.

Planning acceptance does not establish `01E` evidence. It establishes an executable,
reviewable contract for producing that evidence.
