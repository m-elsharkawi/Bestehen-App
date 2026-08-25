# Personal Stage 03 execution candidate handoff

Date: 2026-08-25 (Europe/Berlin)

Status: `03E` repository execution candidate is in progress and awaiting independent
review. It is not accepted, merged, deployed, or live-verified.

Draft PR: [#6](https://github.com/m-elsharkawi/Bestehen-App/pull/6)

Accepted Planning input: `f9ecffbcab50d3bfb56bad5ac5e77c92433ee36c`;
execution started from the clean Planning acceptance record
`f466e29ee07b06da19130d60e2887be1e088c68b`. The exact containing candidate SHA and
its final CI run are recorded in the PR evidence comment after this handoff commit;
that external record avoids putting a self-referential commit in this file.

## Delivered boundary

- Added App-owned opaque identifiers, exact state unions, legal transition maps,
  owner-labelled commands, `reason-registry/v1`, validity partition rules, and
  strict v1 result/problem/job/session/evidence/projection/cursor schemas. Written
  and Oral remain independent, absence is explicit, and probability is structurally
  unavailable.
- Added four ordered, checksummed Kysely revisions in the existing explicit migrator:
  `20260825_010_identity_release`,
  `20260825_020_learner_facts_evidence`,
  `20260825_030_jobs_audit_rights`, and
  `20260825_040_p03_foundation`. They create the additive `app` foundation and the
  migrator installs pg-boss's owned schema. Web and worker do not migrate.
- Added scoped PostgreSQL repositories for the one-owner bootstrap, app sessions,
  operation receipts, immutable Evidence observations/assertions/corrections,
  atomic projection publication, semantic jobs/effect receipts, and minimized
  security audit events. Owner bootstrap advances the per-scope fact sequence and is
  idempotent only for the same pre-bound issuer+subject.
- Every Stage 03 learner write boundary takes the same transactional lock and
  requires an active scope with no active tombstone. This includes callbacks/session
  insertion and touch, operation receipts, Evidence assertions/corrections,
  projection publication, job acceptance/transitions, and authoritative job effect
  commit. Session resolution additionally requires the principal, pre-bound
  credential, scope binding, and learner scope all to remain active.
- Added closed pg-boss queue names, bounded policies, explicit semantic job states,
  coalescing/effect receipts, cancellation/tombstone checks, and non-migrating worker
  startup/shutdown. The Stage 03 receipt is the only authoritative foundation effect:
  receipt plus `running` → `succeeded_candidate` → `published` transitions commit in
  one PostgreSQL transaction. There is no callback after receipt creation; later
  external delivery remains an explicit at-least-once outbox concern.
- Added exact-pinned `openid-client@6.8.7` for the real Auth0/OIDC protocol boundary.
  Authorization uses `connection=email`, Authorization Code + PKCE S256, keyed state
  and nonce digests, a recoverable AES-GCM-sealed verifier, single-use database
  transactions, authorization-response issuer validation, exact issuer/audience,
  verified email fact, subject, `exp`/`nbf`/`iat`/`auth_time`, and no provider token
  persistence. No password, guest presentation, email authorization, or automatic
  first-user enrollment was added.
- Added App-owned random opaque sessions stored only as purpose-separated keyed
  digests. The browser receives exactly `__Host-bestehen_session` with Secure,
  HttpOnly, SameSite=Lax, path `/`, and no Domain. The policy is 24-hour idle,
  seven-day absolute, and ten-minute recent OTP. Logout checks Origin, Fetch
  Metadata and CSRF proof, revokes before clearing the cookie, and preserves learner
  facts/drafts. A concurrent optimistic touch miss re-reads through the same
  revocation/tombstone-aware lookup and accepts only a still-active, unexpired
  authoritative session.
- Added `/auth/login`, `/auth/callback`, `/auth/logout`, `/auth/failure`, and the
  enumeration-safe `/api/v1/owner/status` route. All authorization is derived from a
  validated server session; anonymous/cross-scope results are neutral and client
  ownership input never authorizes a query.
- Added distinct protected migrator, web, and worker database URL fields for
  staging/production, with different database principals required. Local/test keep
  the existing single-URL fallback. Only the migrator and one-shot bootstrap select
  the migrator URL; runtime processes select their own roles.
- Enforced learner scope in both repository predicates and composite database foreign
  keys across plan/session/activity/episode/attempt/occasion/Evidence/assertion/
  correction/projection lineage. Projection publication matches generation ID,
  learner scope, kind, source cut, and checksum; the current pointer has the same
  scoped kind/generation identity.
- Qualified semantic-job uniqueness and predecessor lineage by learner scope. A
  same-scope replay hydrates the complete authoritative stored row rather than
  retaining caller-supplied revision/deadline fields, while two scopes may safely use
  the same semantic identity.
- Operation-receipt replay hydrates every returned field from its authoritative row;
  caller-supplied status or resource fields cannot promote an accepted receipt.
  Tombstones reference deletion operations through the same learner-scope composite
  key, and activity occurrences/coaching episodes enforce the accepted closed
  plan/client state vocabulary rather than storing open text states.
- Preserved the dedicated `Dockerfile.migrator` and accepted OCI pins. Compose now
  uses that image and the exact Stage 03 schema range. Release evidence contains all
  twelve `P03-*` IDs, fake/closed flags, the exact foundation revision, and Stage 03
  changed-path enforcement without modifying the accepted plan, Architecture,
  Design, or historical Stage 01/02 handoffs.

No Stage 04 UI, practice/content flow, scoring, capability/Readiness calculation,
productive provider route, public deployment, live-smoke runner, or parallel
migration framework was added.

## Reviewable execution commits

- `6106e748e194a62eab1616a4b554cb2d1d28dd5b` — define Stage 03 domain and
  application contracts.
- `c05653698716b1ad0231c921c47accf4d536ff75` — add PostgreSQL and job foundation.
- `890673a00e287de9f592a735502e20e91074b295` — align the worker process fixture with
  the foundation schema; no runtime readiness weakening.
- `45fc255330ae1e576d2c0a70194c240171ac18fd` — align the OCI fixture with the
  foundation schema; no runtime readiness weakening.
- `3ba88dd14f2dc5573c831ae011cc88bec7009d4a` — add the personal Email OTP identity
  boundary, owner bootstrap, App sessions, routes, and adversarial fakes.
- `38d06f699e91a36d8c965bee72a3d621c3936639` — make the Email OTP browser assertion
  unambiguous without changing product copy.
- `0f7f1c32798316f5d6165abe2c65622c5b9611b6` — complete scoped Evidence correction,
  deterministic projection checksum, audit, and two-scope PostgreSQL coverage.
- `8da7873fd24e0c8817c1eb21ca5e70371b0db9c9` — register Stage 03 release, scope, and
  dedicated-migrator evidence.
- `a79c0a4642e90cd198d414ce5c0eda71f9319f3e` — route migrator, web, and worker
  through explicit role-specific database configuration.
- `c09a3c20b1d708f0c5d365d528fbaed50e858ccf` — make foundation job effects atomic
  and enforce scoped Evidence/projection lineage.

The final documentation/checklist commit containing this file is identified in the
PR evidence comment and is the only candidate root should review/deploy.

## Verification and evidence mapping

Local deterministic checks used pnpm `11.23.0`. The available local Node is
`22.22.3`, so engine-sensitive lock policy and the authoritative complete gate are
intentionally taken only from Linux CI's exact Node `24.19.0`. The local Docker
daemon was unavailable; no local PostgreSQL/OCI claim is made.

- TypeScript, Biome format/lint, package-boundary, build, generated-file, scope,
  documentation, provider-readiness, secret, whitespace, release-schema, exact-lock
  critical advisory, and four Chromium accessibility/browser checks passed locally.
- The current deterministic unit suite has 113 passing tests across 11 files. It
  covers every closed domain union, legal/illegal transition properties, strict
  contract negatives, missing-as-absence/Written/Oral/no-probability, idempotent
  receipts/effects, session expiry/recent auth, origin/fetch/CSRF, cookie flags,
  HMAC purpose separation, sealed PKCE, all required fake claim/state/nonce/PKCE/time
  failures, concurrent session-touch CAS recovery/closed revocation fallback,
  deterministic jobs/projection checksums, redaction, and provider fakes.
- Real PostgreSQL 18.6 CI migrates concurrently from the accepted baseline, verifies
  all exact tables/revisions/checksums/pg-boss ownership, reruns at latest, rejects
  compatibility and checksum drift, and recovers through a fresh pool. Its
  two-synthetic-scope fixture proves same-binding bootstrap idempotency/different
  owner conflict, unknown binding denial, keyed session storage/revocation,
  single-use sealed OIDC transaction consumption, operation receipt replay/hash
  conflict, scoped Evidence append/assert/correct/supersede history, neutral attacker
  reads/writes, random-ID attempt/occasion lineage swaps, wrong-kind/source-cut
  projection publication, scope-qualified same-identity jobs with authoritative
  replay hydration, authoritative receipt replay despite changed caller
  status/resource fields, principal/credential revocation of existing App sessions,
  closed activity/episode state checks, cross-scope tombstone/deletion-operation FK
  rejection, and structurally minimized audit records. It also denies every Stage 03
  learner write, job mutation, and callback/session insertion after both deletion
  state and an active tombstone. A trigger fault after effect-receipt insertion but
  before publication proves the whole job transaction rolls back; retry commits one
  receipt and replay cannot duplicate it.
- Worker/process and OCI gates verify migration-first readiness, non-root/read-only
  web/worker containers, health and signal handling, and exact OCI identity. Browser
  tests verify anonymous owner denial, fake identity/no network, visible Email OTP
  wording, no password presentation, health minimization, axe, keyboard, reflow, and
  reduced motion.

The final exact-head run and job links in the PR comment are the durable evidence for:

- `P03-DOMAIN-001`, `P03-CONTRACT-001`: domain/contract unit and property tests.
- `P03-SCHEMA-001`, `P03-COMPAT-001`: PostgreSQL migration/readiness/overlap tests.
- `P03-IDEMPOTENCY-001`, `P03-JOB-001`: receipts, pg-boss and semantic effect tests.
- `P03-EVIDENCE-001`, `P03-AUDIT-001`: real PostgreSQL Evidence/audit plus checksum
  and redaction tests.
- `P03-IDENTITY-001`, `P03-SESSION-001`, `P03-AUTHZ-001`: deterministic fake claims,
  real database sessions/transactions/two-scope isolation, and browser denial.
- `P03-SCOPE-001`: accepted-baseline changed-path allowlist and negative fixtures.

GitHub Advanced Security remains unavailable by owner choice. Dependency Graph is
enabled. The mandatory provider-neutral gate is the frozen exact lock plus the
complete critical advisory audit and dependency/license inventory.

## Security, compatibility, and rollback

- Every real provider call remains disabled. Repository defaults and release evidence
  keep all provider adapters fake and every external, paid, public-object, guest,
  account-optional, and experimental flag false. Ordinary CI cannot call Auth0.
- Secrets remain protected runtime inputs. No issuer, subject, owner email,
  fingerprint, token, OTP, cookie, database URL, provider response, or private App ID
  is emitted by the bootstrap command, logs, tests, handoff, release manifest, or PR
  evidence. The one-shot owner subject is removed from strict application config
  before parsing and is never accepted as a command argument.
- The schema evolution is additive and roll-forward-only after facts exist. Rollback
  selects fake identity/disables external calls first, revokes affected App sessions
  or bindings, reverts application routing only within the compatible window, and
  corrects schema/data forward. Never rewrite Evidence history or run a destructive
  automatic down migration.
- Old validated projection generations and Evidence assertions remain immutable;
  publication switches a versioned pointer only after same-scope checksum validation.
  pg-boss is transport, while semantic job/effect tables remain authority.

## Honest deferred and owner-only gates

No staging deploy, provider API call, dashboard mutation, OTP, secret read, database
role grant, backup/restore, R2 access, or live smoke occurred during candidate
implementation. Existing owner-prepared staging/provider state remains prepared but
**not live-verified**.

Only after root independently accepts the exact final candidate may root deploy that
same SHA to private Coolify and execute `STAGE-05`/`AUTH-11`:

1. Keep every adapter fake and every provider/product flag false; create a protected
   pre-migration recovery point, run the dedicated migrator, verify the exact schema,
   and prove web/worker roles cannot perform DDL.
2. Run the one-shot protected owner bootstrap and retain only `created` or
   `already_bound`; a conflict stays closed. Never expose the subject or URLs.
3. Enable only Auth0 identity plus the external-call flag for one bounded allowed
   owner Email OTP/callback/App-session flow, anonymous and unknown-binding denials,
   synthetic random-ID/cross-scope denial, logout, and revoked-session denial. Then
   return identity to fake/disabled. Do not create a real second Auth0 user.
4. Record only commit, policy/schema/check IDs, redacted result classes, cleanup, and
   rollback outcome. A failure blocks live identity but never weakens fakes.

Backup wiring, restore proof, R2 verification, protected readiness receipt, provider
readiness/live smokes, DNS/ingress checks, and later capability-specific checks remain
deferred. The age private key is protected in 1Password but is **not genuinely
offline**. These facts block any readiness/backup claim, not this deterministic
repository candidate.

Stop after independent `03E` review and the separately authorized bounded Stage 03
private-staging contract. Do not mark `03E` accepted here and do not start Stage 04.
