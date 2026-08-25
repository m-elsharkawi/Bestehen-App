# Personal Stage 03 — domain, data, jobs, identity, and authorization plan

Status: `03P` planning in progress; not independently accepted and not execution.

Planning date: 2026-08-25 (Europe/Berlin).

Accepted semantic input: Personal Stage 02 merge
`3c2ae433c10db0dde876405d50a50210b27b647e`, with green post-merge CI
[32667024749](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32667024749).

Effective Stage 03 baseline: `cb2e9a7a88fc384d9cad155647e4a6acccf6b5c3`, the
matching clean Stage 03 branch,
`origin/implementation/personal-03-domain-data-jobs-auth`, and `origin/main` when
planning resumed. The only changes after the accepted Stage 02 merge are
owner-authored PRs #4 and #5: the temporary one-shot compose wrapper was replaced by
the dedicated `Dockerfile.migrator`. Stage 03 will preserve and use that image; it
will not create a second migration runner.

Branch: `implementation/personal-03-domain-data-jobs-auth`; PR base/head will be
`main` and this branch. Stage boundary: this document plans `03E`. This Planning
change creates no source, migration, dependency, lock, provider, secret, database,
deployment, or live call and does not begin `03E`.

## 1. Objective and acceptance shape

`03E` will deliver the smallest server-authoritative foundation that later stages can
consume through stable domain/application ports:

- exact App-owned identities, canonical states, reason codes and version lineage;
- one PostgreSQL 18 schema evolution for relational facts, projections, releases,
  operation receipts, durable job semantics, audit and data-rights foundations;
- one pg-boss worker boundary with at-least-once delivery and exactly-once semantic
  effects;
- mandatory personal Auth0 Email OTP sign-in, an App-owned opaque session registry,
  a pre-provisioned owner binding, and deny-by-default server authorization;
- append-audited Evidence validity and correction foundations; and
- deterministic fakes and adversarial tests, including two synthetic users even
  though the private deployment admits one owner.

This is Slice 0 infrastructure. It must not expose practice, claim a complete coach,
calculate capability/Readiness, call AI/STT/TTS/R2/SES product routes, or implement
later feature workflows. Foundation records may represent later states, but only the
owning later stage may create their product behavior.

## 2. Verified baseline and authority

The fetched repository was clean before planning. The accepted Stage 02 merge is an
ancestor of the effective baseline. The dedicated migrator builds the existing
worker deployment and executes
`@bestehen/infrastructure/dist/postgres/migrate-cli.js` as non-root UID/GID `10001`;
web and worker startup still do not migrate. The repository currently has no product
tables, no job startup, no auth route, and no product API. Kysely metadata reports
`baseline`; migration advisory lock `420101` is the only current migration lock.

Existing reusable boundaries are deliberately small:

- `@bestehen/domain`: opaque `AppId` and `Result` only;
- `@bestehen/contracts`: Zod contract version and health schemas only;
- `@bestehen/application`: clock, ID source, lifecycle and provider-neutral health
  port;
- `@bestehen/infrastructure`: deterministic provider fakes, PostgreSQL pool,
  readiness, explicit migrator and process supervisor;
- strict server configuration, central redaction, fake-by-default adapters, closed
  flags, exact runtime/lock, real PostgreSQL CI and seven existing CI jobs.

Authoritative input blobs at the effective baseline are:

- common contract and exact prompt: `fa21241f24ee8a179585b4b6bf8f82a7c8960de6`,
  `6170a0971214a74b4d48c5206477352f46ac2c09`;
- Stage 01 handoff and Stage 02 plan/handoff:
  `7f7376cb0da2cf376cc28c6262cf01e6a34cbcf1`,
  `268b81ac9edd6a12b7f1d174d6c5b70085fb7aba`,
  `f538df5be3ada4c26891e3f4a2ab1d800f244f24`;
- Architecture 04–08: `ab1a775d7689e47bba00c2544c247ef344c44e70`,
  `bb6df811ec9010de556d1719f22e31bb8ca3190e`,
  `53d34ae65ef4c8fa79c00026f9bd5d7b876ce672`,
  `ad58238aee48e41a0d4bd30bd21ac5a17707656f`,
  `02c5e1ee5967bad976eda49ab4813a768eda5bd3`;
- Architecture 10–12, 20–21 and 23:
  `d4e1ab25e359dcfcc506ee29462760a41647138d`,
  `7c327cd770460b94107f2756e2b7d8f29c56b909`,
  `c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528`,
  `9a1aa2d5fea31ff0bdccfc4561806bb870511ab6`,
  `1216f98f5489119b4d8114804ac87936bc78ddd4`,
  `abc1a300d5b0fd659d28f768669dd73afbb90887`;
- final Architecture 28: `89a761d64767e048b59338ec13e61b1b06472dbd`;
- relevant Accepted ADRs 0001, 0002, 0007, 0010–0015, 0017–0019,
  0028–0029, 0031, 0033–0034, whose blobs are the values recorded in
  Architecture 28 §18;
- personal setup index/Auth0/staging guides and configuration:
  `269542c44492bbd2b6df3492c1e7dea9312530b6`,
  `a3d4f66176a60b49bf21e3e0ca696ed605b811d5`,
  `29b9323c283aac7e6c704711a8476a8e5dbf1e0c`,
  `94bb76be6d68bc43125eb39036937a732bbcdde4`.

Architecture owns semantics. The personal profile makes Auth0 login mandatory for
the deployed App but does not erase guest/adoption concepts from domain and schema.
The lower-authority personal flags remain presentation/routing gates, never semantic
switches.

## 3. Scope and non-scope

### 3.1 `03E` scope

- Add domain values, exhaustive unions, legal transition functions and owner-tagged
  commands for the Stage 03 foundation.
- Add strict `/api/v1` result/problem/job/session schemas and one canonical reason
  registry major; generated API documentation is unnecessary until feature routes
  exist.
- Replace the empty migration provider with ordered reviewed Kysely migrations and
  a typed database boundary; install pg-boss schema only through the existing
  explicit migrator.
- Add repositories/use cases for owner bootstrap, login/session lookup and
  revocation, object/scope authorization, operation receipts, append Evidence,
  projection publication, outbox/inbox and semantic jobs.
- Add `/auth/login`, `/auth/callback`, `/auth/logout` and a minimal authenticated
  owner-status route. Keep the neutral product page; no Stage 04 UI.
- Add deterministic fake OIDC claims/session paths and a disabled real Auth0 adapter.
  Add exactly one reviewed, exact-pinned OIDC implementation dependency if required;
  no home-grown JWT/JWKS/PKCE cryptography and no second auth framework.
- Extend existing CI/check/release evidence and documentation only where these
  contracts require it.

### 3.2 Explicit non-scope

- No content import, task serving, exercise runtime, scoring, capability calculation,
  coaching selection, Mistake promotion, progression calculation, mock/Readiness
  calculation, export ZIP, deletion execution, offline UI, notification, object
  adapter, or productive provider call.
- No public/production deployment, branch-tip autodeploy, new database/queue/cache,
  Redis/Kafka/workflow engine, row-level-security framework, generic event platform,
  GraphQL, WebSocket, SSE, repository abstraction generator, or per-context service.
- No automatic “first login wins,” email-as-primary-key, password fallback, guest
  presentation, provider ID as App ID, client-supplied ownership, UI-only
  authorization, raw identity/token logging, or real second Auth0 learner.
- No backup wiring/restore claim, R2 verification, provider readiness receipt, AI
  smoke, or claim that prepared owner setup is live-ready.

## 4. Binding decisions

1. Use one logical PostgreSQL schema `app` plus pg-boss's owned transport schema.
   Bounded contexts remain code/ownership boundaries, not one SQL schema per context.
2. Use UUID primary keys generated by an injected source; UUIDv7 is preferred and
   UUIDv4 accepted. UUID time/order is never truth. Provider identities are namespaced
   attributes beside App IDs.
3. Use `text` plus named `CHECK` constraints for stable closed unions. PostgreSQL
   native enums are avoided because adding a value complicates expand/contract.
   Unknown consequential values fail locally closed.
4. Normalize indexed ownership, identity, state, time and release columns. JSONB is
   limited to strict, versioned envelopes whose shape genuinely varies; the
   application validates before write and after read. There is no generic extension
   bag.
5. Allocate `learner_sequence` atomically from the learner scope row for accepted
   learner facts. `recorded_at` is database/server time. Client `occurred_at` travels
   with clock quality; monotonic elapsed facts never derive from UUID/wall-clock
   ordering.
6. One command owner writes each state. Cross-owner asynchronous notification uses an
   outbox; one-owner deferred work uses a semantic job. Telemetry/cache warming never
   enters the truth outbox.
7. PostgreSQL constraints and receipts enforce identity/terminal uniqueness;
   handlers still check semantic effect. pg-boss delivery is at least once, never
   described as exactly once.
8. The personal owner is explicitly bootstrapped by a one-shot operator command after
   migration using protected issuer/subject input and the existing opaque allowlist
   reference. Login is denied until that binding exists. There is no automatic
   enrollment and email is never authorization.
9. Real Auth0 is a provider adapter. Successful callback produces an App principal
   and random opaque App session, then discards provider tokens. The browser receives
   only the Secure, HttpOnly, SameSite=Lax `__Host-bestehen_session` cookie.
10. Every route, use case and repository query derives its `AuthorizedScope` from a
    validated App session or explicit worker/operator capability. An opaque resource
    ID never authorizes a read or write.
11. Guest/adoption types and nullable binding lifecycle are retained and tested with
    fakes, while personal configuration exposes no guest route and keeps
    `BESTEHEN_FLAG_GUEST_PRESENTATION=false` and
    `BESTEHEN_FLAG_ACCOUNT_OPTIONAL_PRESENTATION=false`.
12. The first schema boundary is additive but one-way after facts exist. There is no
    destructive automatic down migration; correct a failed migration/application by
    roll-forward. The empty pre-product baseline permits an isolated pre-write
    rebuild only with explicit operator evidence.

## 5. Canonical contract registry

### 5.1 Identities, clocks and versions

Foundation IDs are distinct branded types: `LearnerScopeId`, `PrincipalId`,
`CredentialBindingId`, `AppSessionId`, `OperationId`, `RequestId`, `PlanRevisionId`,
`SessionId`, `ActivityOccurrenceId`, `EpisodeId`, `AttemptId`, `CheckpointId`,
`ResponseFactId`, `IndependentOccasionId`, `MockOccasionId`, `EvidenceObservationId`,
`ValidityAssertionId`, `CorrectionId`, `ProjectionGenerationId`, `JobId`, `EventId`,
`ReleaseUnitId`, `ActivationManifestId`, `ExportOperationId`, `DeletionOperationId`
and `AuditEventId`.

Every consequential fact carries the applicable subset of schema, API, evidence,
validity, content/family/revision/form/media, target blueprint, taxonomy, rubric,
evaluator/model/prompt, calculation/calibration/policy, reason/template,
checkpoint/timer/sync, identity/session, rights/approval, quality and activation
releases. Independent columns/foreign keys are used for required axes; a validated
compatibility vector records the remainder. No `latest` lookup may reinterpret an
existing fact.

Clock fields retain their Architecture 05 meaning: client `occurred_at` plus
`clock_quality`; server `recorded_at`; per-scope `learner_sequence`; optional
`monotonic_elapsed_ms`; `effective_at`; projection `computed_at/source_cut`; and
IANA `time_zone` plus `utc_offset` where scheduling context exists.

### 5.2 Closed state unions

- Evidence validity: exactly `valid | partially_valid | pending | interrupted |
  not_counted`. Partial and Pending require disjoint affected/unaffected scopes and a
  registered reason. Correctness is orthogonal.
- Readiness: exactly `evidence_building | not_ready | borderline | safe |
  ready_to_book | stale_contradicted`; Stage 03 stores only typed foundation fixtures,
  never calculates or publishes a learner value.
- Weakness resting states: `candidate | historical_unconfirmed | known | repairing |
  stabilizing | repaired | resolved`; reopening is an audited transition to `known`.
- Progression: `P0 | P1 | P2 | P3 | P4`, local per task family/direct lane, with
  adoption state `confirmed | probe_eligible | probing | provisional | recovering`.
- Review: `scheduled | window_open | overdue | pending_evaluation | blocked_content |
  repair_required | satisfied | completed`.
- Projection availability: `current | recomputing | stale | blocked_by_pending |
  unavailable | failed | deleted`.
- Plan/client states: `assembling | offered | active | updating | paused |
  partially_completed | completed | replanned | blocked | unavailable | failed |
  deleted`; terminal coaching outcome remains completed/partial/paused/replanned/blocked.
- Semantic job states: `accepted | scheduled | running | succeeded_candidate |
  retry_scheduled | cancel_requested | published | cancelled | failed_terminal |
  expired | quarantined | superseded`. Candidate success is never domain truth.
- Identity/session: learner scope `active | deletion_in_progress | deleted`;
  credential `active | retiring | retired | revoked`; session `active | revoked |
  idle_expired | absolute_expired`; binding `pending | active | retired`.
- Deletion foundation: `requested | access_revoked | live_purging |
  provider_pending | live_erased_backup_residual | fully_expired | failed_retrying`.

There is no probability carrier, merged compensating Written/Oral field, ambiguous
boolean state, or unknown-to-success/default mapping.

### 5.3 Reason registry

Create code-owned `reason-registry/v1` with exact families
`VALIDITY`, `DIRECT`, `RISK`, `UNCERTAINTY`, `DUE`, `PROGRESSION`, `COVERAGE`,
`PREFERENCE`, `CONTEXT`, and `FALLBACK`. Seed only the Architecture 08 representative
codes and required Stage 03 protocol/auth/job reasons. Each entry has stable code,
major/minor, owner, learner-fault flag, permitted state/scope, safe generic
fact/meaning/action template key and retention class. Clients may use a reviewed
same-family minor fallback; unknown major closes the affected surface.

## 6. Single write owner and transition map

| State/fact | Sole command owner | Stage 03 write rule |
|---|---|---|
| learner scope, principal/binding, profile fact, session, rights request | Profile/Identity | explicit versioned command; provider proof cannot write learner facts |
| plan revision | Coaching | immutable revision only; Stage 03 fixture/contract, no selection policy |
| session/activity/episode/attempt/checkpoint/response/conditions/exposure | Session & Attempt | expected version + operation receipt; terminal occurrence immutable |
| observation/current validity/correction | Evidence & Capability | append observation/assertion/correction; current pointer is convenience |
| weakness/review/progression | their named owners | transition log or validated projection generation; no cross-owner edit |
| Readiness/mock/gates | Measurement | foundation shape only; no Stage 03 calculation or client write |
| content revision/serving eligibility | Content & Forms | immutable revision + approval/deny overlay; no Corpus direct learner use |
| release/compatibility/activation | Operations/Governance | immutable units and atomic activation manifest |
| semantic job/candidate | job's named owner | transport completion never publishes truth without owner validation |
| export/delete orchestration proof | Profile/Data Rights + Operations | request/tombstone first; typed steps remain dormant until Stage 09 |
| audit/incident | semantic owner or Security/Operations | append minimized event; never a payload warehouse or truth editor |

Legal validity transitions are exactly Architecture 06 §6.2. A new observation may
start in any of the five states. Later transitions append a superseding assertion
with owner, reason, evidence, complete scope partition, effective/recorded times and
release lineage. A retry creates no assertion; a new learner attempt needs a new
operation ID.

## 7. PostgreSQL 18 schema plan

All learner-owned tables have an indexed non-null `learner_scope_id` unless they are
global release/content metadata. Foreign keys never use provider identifiers.
Learner-owned unique/index definitions begin with `learner_scope_id` where that is
the authorization/query boundary. Sensitive values are structurally absent from
audit/outbox/job payloads.

### 7.1 Identity and profile

| Table | Required columns and constraints | Main indexes / purpose |
|---|---|---|
| `app.learner_scopes` | UUID PK; state check; next sequence; resource version; created/updated/deletion times | state; one row locked to allocate sequence and reject tombstoned writes |
| `app.principals` | UUID PK; `account|guest|operator|worker`; state; created/retired | kind/state; principal is App-owned |
| `app.credential_bindings` | UUID PK; principal FK; kind/provider; normalized issuer and subject; keyed fingerprint; state; verified/retired; release | unique active `(issuer,subject)` and fingerprint; email is not a key |
| `app.principal_scope_bindings` | principal/scope FKs; binding state; operation; created/retired | unique active launch binding; adoption can later append/retire without ID rewrite |
| `app.app_sessions` | UUID PK; keyed token digest only; principal/scope; state; created/last-used/authenticated/idle/absolute/revoked; policy release; rotation predecessor | unique token digest; active expiry and principal/session-list indexes |
| `app.oidc_transactions` | opaque transaction digest; keyed state/nonce digests; PKCE verifier sealed/encrypted server-side; return-path allowlist token; created/expires/used | bounded TTL and single-use; verifier remains recoverable only until code exchange; no URL/token logging |
| `app.profile_facts` | fact ID; scope; fact kind; operation; sequence; versioned bounded payload; occurred/recorded/effective; supersedes | unique scope/operation/kind; `(scope,sequence)`; Stage 09 later supplies full commands |

### 7.2 Release, content and compatibility foundation

| Table | Required columns and constraints | Main indexes / purpose |
|---|---|---|
| `app.release_units` | typed unit, name, semantic version, digest, state, effective time, predecessor, provenance/evidence refs | unique `(type,name,version)` and digest; immutable after activation |
| `app.activation_manifests` | manifest ID/version/digest/state, source commit, created/activated, predecessor | exactly one active environment/profile pointer through partial unique index |
| `app.activation_manifest_units` | manifest/unit FK, role, compatibility status | unique manifest/unit/role; complete compatible set |
| `app.compatibility_windows` | producer/consumer kind+major, min/max revision, effective/retired, migration mode | indexed supported read/write/job windows; unknown major closes exact consumer |
| `app.reason_registry_releases` / `app.reason_codes` | immutable registry release and exact code/family/owner/fallback semantics | unique release/code; DB FK for persisted reasons |
| `app.content_families` / `app.content_revisions` | App IDs; immutable family/revision lineage; role; approval/rights/compatibility state; digest; predecessor | unique family/revision; only named approved role eligible; no content body in foundation |

### 7.3 Attempts and Evidence ledger

| Table | Required columns and constraints | Main indexes / purpose |
|---|---|---|
| `app.plan_revisions` | immutable source cut, policy/reason/template/content releases, intents, reasons, checksum, predecessor | scope/source cut and checksum; no plan policy yet |
| `app.sessions` / `app.activity_occurrences` / `app.coaching_episodes` | separate IDs, exact plan revision, version/state, meaningful-boundary and terminal facts | scope/current state; identities cannot collapse |
| `app.attempts` | scope/session/activity/episode; pinned content revision; modality/direct lane; version/state; operation; occurrence/record times; terminal hash | unique scope/operation/kind; one terminal submission; content never retargeted |
| `app.attempt_checkpoints` | attempt; stream; sequence; expected attempt version; payload/reference digest; accepted time | unique attempt/stream/sequence and operation; stale cannot replace newer |
| `app.response_facts` / `app.condition_facts` / `app.exposure_facts` | immutable attempt refs; strict versioned envelope/digest; accepted sequence | scope/attempt/type; exposure cannot be removed to manufacture freshness |
| `app.independent_occasions` | episode, optional mock occasion, independence class, family relation and policy release | correlation identity; UUID/session/time alone cannot prove independence |
| `app.evidence_observations` | immutable attempt/occasion/direct lane/supported scope/outcome/condition/evaluation/lineage refs; accepted sequence | unique semantic observation effect; scope/sequence and lineage selectors |
| `app.validity_assertions` | observation; prior assertion; exact five-state check; affected/unaffected scope; reason FK; actor/owner/evidence; effective/recorded; release | one current pointer via observation; assertion chain immutable |
| `app.evidence_corrections` | target fact/assertion; selector+impact digest; reason; asserted owner; requested projections; supersedes | unique owner operation/impact; exact version/scope selector indexes |

### 7.4 Projection, review, coaching and Readiness foundation

| Table | Required columns and constraints | Main indexes / purpose |
|---|---|---|
| `app.projection_generations` | scope, owner, strict projection kind, availability state, source cut, selector/correction digests, rules/calibration/target versions, bounded typed payload, checksum, predecessor, created/published | unique semantic generation; source cut/kind; immutable candidate/validated generation |
| `app.current_projection_pointers` | scope+projection kind, generation FK, resource version | one atomic current generation; old validated generation retained |
| `app.projection_source_refs` | generation + observation/assertion ref + included/excluded reason | deterministic replay/differential proof without copying evidence payload |
| `app.weakness_transitions` | weakness ID; exact resting from/to or reopened event; claim key; cause/confidence; source cut; reason | scope/claim/current; Stage 07 policy later owns promotion |
| `app.review_obligations` | exact review state, required lane/condition/stage, window, source cut, version | scope/status/window; no overdue debt/negative fact |
| `app.progression_profiles` | task family/direct lane; exact P0–P4 and adoption state; axes/version/source cut | unique current claim key through generation/pointer semantics |
| `app.readiness_snapshots` / `app.booking_gate_results` | immutable exact six-state foundation, separate Written/Oral absence/value union, source cut, rules; six named gate rows/status/reasons | material history only; no probability, no compensation, no Stage 03 calculation |

### 7.5 Idempotency, jobs, events and audit

| Table | Required columns and constraints | Main indexes / purpose |
|---|---|---|
| `app.operation_receipts` | scope, client operation ID, kind, canonicalization version, keyed payload hash, status, resource/result ref, first/last seen, expiry class | unique `(scope,operation,kind)`; same hash returns result, changed hash conflicts |
| `app.job_resources` | job ID/kind/semantic identity/state/revision; owner/actor scope; refs+contract versions; deadlines; attempts/policy; cancellation; dependent/unaffected scope; result/failure/expiry/lineage | unique kind/semantic identity; state/deadline/owner indexes |
| `app.job_transitions` / `app.job_effect_receipts` | append state changes and exactly-once domain effect identity/digest | unique semantic effect; race/dead-letter audit |
| `app.outbox_events` | stable event/type/version; owner aggregate/revision; minimized selector payload/digest; correlation/causation; dispatch state | undispatched age and aggregate order; no raw learner/provider payload |
| `app.inbox_receipts` | event ID + consumer + handler major; digest/effect/status | unique triple; same ID/different digest quarantines |
| `app.security_audit_events` | actor scope, action, target class/keyed hash, outcome/reason, request/trace, release, recorded time, retention class | high-risk action/time; no email/token/body/response/audio/provider payload |

pg-boss transport tables are library-owned and never exported as domain truth. Queue
names are a closed versioned registry, not client input.

### 7.6 Export/deletion journals and tombstones

| Table | Required columns and constraints | Main indexes / purpose |
|---|---|---|
| `app.export_operations` | scope, operation/source cut/format, exact state, artifact ref/digest/expiry, receipt | unique operation/source cut; dormant until Stage 09 |
| `app.deletion_operations` | scope, exact deletion state, inventory version/digest, requested/access-revoked/live/backup times, policy | one active operation/scope; revocation precedes purge |
| `app.deletion_steps` | operation, owner/target class, state, inventory/receipt digests, attempt/next action/times | unique operation/step; retry resumes, never reopens access |
| `app.learner_tombstones` | scope keyed reference, operation, cutoff, created/expires, state | checked before every personal write/job/callback; linkable max 91 days |
| `app.restore_suppression_journal` | tombstone/backup generation, cutoff, replay/proof state, expiry | restore gate; inaccessible to product queries/analytics |

Foundation migrations create constraints, comments and indexes, not sample learner
data. Unit fixtures use factories. PostgreSQL integration tests seed only randomized
synthetic scopes and remove the isolated database.

## 8. Migration and compatibility contract

1. `03E` adds ordered revisions for (a) identity/release, (b) learner facts/evidence,
   and (c) jobs/audit/data rights. Names are timestamped and stable. A final
   `p03_foundation` compatibility revision is the release boundary.
2. The existing `Dockerfile.migrator` is the only production-shaped runner. It takes
   advisory lock `420101`, runs Kysely migrations and the pinned pg-boss schema
   installer under one explicitly ordered operation, reports names/counts only, and
   exits nonzero on drift. Web/worker roles cannot perform DDL.
3. Test empty → latest, baseline → latest, concurrent migrators, interruption/retry,
   checksum/drift rejection and already-latest idempotency against real PostgreSQL
   18.6. Verify every expected table/constraint/index and no extra public product
   table.
4. Use expand → compatible code/worker → bounded backfill if any → activation →
   observation → later contract. This first migration has no personal-data backfill.
   During the migration window all provider/product flags remain false and routes
   remain closed.
5. Schema readiness reads the actual ordered migration set, not a hard-coded
   `baseline` equality. Release metadata publishes min/max revision and job-contract
   major. Unknown/partial/drifted state fails readiness without SQL/URL detail.
6. Take the protected recovery point required by `OPS-04`/`OPS-06` before the
   production-shaped migration. This does not claim backup wiring or isolated restore
   complete. Once any Stage 03 fact exists, rollback is forward repair only; never
   automatic down or old-database restore over new facts.
7. Keep old/new job majors compatible through the oldest queued/inbox/receipt horizon.
   Stage 03 has no legacy product job, so the migration proves the mechanism with
   synthetic fixtures and registers only v1 foundation queues.

## 9. Durable jobs, outbox and recovery

`job-policy/foundation-v1` is immutable data with owner, queue, concurrency, lease,
heartbeat, service target, hard deadline, retry schedule, maximum attempts,
cancellation, retention and dead-letter action. Stage 03 supplies a conservative
short internal default and injected no-delay test policy; later capability owners
publish exact policies rather than mutating this one.

- A job is inserted with owner fact/receipt in the same PostgreSQL transaction.
  Provider/network work never happens inside that transaction.
- Worker claim changes only the semantic job state/revision. Before each effect it
  rechecks lease, exact contract major, input ownership, tombstone, cancellation,
  release compatibility and existing effect receipt.
- Retryable failures use bounded exponential backoff with cap and no unbounded
  immediate loop. Nonretryable, exhausted, poison and same-ID/different-digest work
  reaches an operator-visible terminal/quarantined state. Deletion remains
  `failed_retrying` with access revoked; transport exhaustion cannot declare it done.
- Lease expiry may redeliver. The handler either returns the stored effect or applies
  one effect transactionally. A late/older generation becomes `superseded`; a
  cancelled result is publishable only if the owner revalidates the race.
- Projection requests coalesce to the newest source cut, but facts/material audit are
  never dropped. Outbox ordering is per aggregate revision, not global. Consumers
  refetch owner truth when a required gap is detected.
- Bulkheads are per closed queue kind and worker concurrency; learner-facing
  transactions have their own pool. Pause/throttle the affected queue before adding
  infrastructure. No Redis/Kafka or general scheduler is introduced.
- Job/resource polling remains the future authority. Stage 03 adds no SSE/WebSocket
  or provider callback endpoint beyond the Auth0 OIDC callback.

## 10. Auth0, App sessions and authorization

### 10.1 Claim and owner-binding boundary

The OIDC adapter must validate exact configured HTTPS EU issuer, signature/JWKS,
audience/client, authorization response issuer, state, nonce, PKCE, code single use,
`exp`, `nbf` where present, `iat`, `auth_time`, and nonempty subject. It requires the
verified-email fact but never keys or authorizes by email. The authorization request
selects `connection=email`; the tenant/application/connection and both allowlist
Actions remain the defense-in-depth setup from `AUTH-01`–`AUTH-08`.

No callback auto-provisions a principal. After the exact schema exists, a dedicated
one-shot owner-bootstrap command creates one App principal, learner scope and active
`(issuer, subject)` binding from protected input. It records only an opaque
allowlist-reference and redacted result. Repeating the exact binding is idempotent;
a different identity, a second active personal owner or a reused subject conflicts.
The raw private identifier never enters plan, logs, CI, PR, release metadata or
evidence.

### 10.2 Session contract

- Store a keyed digest of a cryptographically random session token, never the raw
  token or provider access/refresh/ID token. Rotate at sign-in, privilege/binding
  change and adoption; revoke old generation after safe commit.
- Cookie is `__Host-bestehen_session`, Secure, HttpOnly, SameSite=Lax, path `/`, no
  Domain. Unsafe commands additionally require allowed Origin/Fetch Metadata and CSRF
  proof.
- `session-policy/v1`: 24-hour inactivity and seven-day absolute expiry. `auth_time`
  establishes the recent OTP marker; sensitive future operations require no older
  than ten minutes. Refresh cannot manufacture recent auth.
- Logout revokes the App registry first, clears cookie, and uses only an allowlisted
  provider logout return. Revocation and expiry preserve unrelated drafts/checkpoints;
  sessions never carry learner truth.
- Personal application/API routes require an active owner session. Health and auth
  entry/callback/failure are the only anonymous web surfaces. Fake identity remains
  mandatory for local/test/CI and no password/guest presentation is added.

### 10.3 Four authorization layers

1. Route adapter authenticates and passes a server-created principal context only.
2. Application use case authorizes function/action, recent-auth requirement and
   principal → active scope binding; client payloads cannot set that scope.
3. Repository query joins/filters the authorized scope and active tombstone state at
   source. Every update repeats scope/version in its predicate; zero rows is a neutral
   not-available/conflict result.
4. Serializer/property schema allow-lists the response. Unauthorized/missing object
   uses 404 where existence must be hidden; errors reveal no cross-scope fact.

Workers use a named job capability plus the job's already-authorized scope, not a
browser session. The bootstrap operator uses a separate one-shot command and
migrator/operator database role, never an HTTP learner route. Tests must prove no
record is selected by `learner_scope_id`, principal, object, job or owner ID supplied
solely by the client.

## 11. API, evidence and audit behavior

- Same-origin JSON uses `/api/v1`, strict schemas and path-major v1. Commands carry
  client operation ID, canonical payload hash and expected version/ETag. Queries
  return owner-built discriminated projections with contract version, source cut,
  computed time and staleness.
- Domain results are `completed | accepted_pending | partial | conflict |
  unavailable | deleted`. RFC 9457 problems cover malformed/auth/precondition/
  idempotency/rate/dependency/internal protocol faults. Detail is never logic and
  never includes provider/SQL/token/body data.
- Historical pagination uses opaque scoped cursor over `(recorded_at, opaque_id)`,
  bounded limit/filter and frozen snapshot cut. Stage 03 implements the reusable
  contract/fake, not a broad history route.
- Evidence observation, validity assertion and correction are separate immutable
  records. Current validity is the last accepted chain pointer only. Historical
  occurrence remains; current validity/derived projection can change.
- Projection publication builds a shadow generation, validates same-cut checksum,
  affected/unaffected counts, exact states, missing-as-absence, Written/Oral
  separation and no probability, then atomically switches the pointer.
- Semantic audit records actor/purpose/scope/result/version. Security audit records
  actor scope/action/target class keyed hash/outcome/reason/request/release/time.
  Neither stores response, Writing, transcript, audio, email, subject, cookie, token,
  prompt/rubric body, provider body, private URL or SQL error.

## 12. File-by-file execution map

| Path | `03E` responsibility |
|---|---|
| `packages/domain/src/*` | branded IDs, owner contexts, clocks/releases, exact unions, legal transitions, reason registry and invariant/property tests |
| `packages/contracts/src/*` | Zod v1 command/result/problem/job/session/evidence schemas, canonical payload rules, cursor/accessibility hints and negative fixtures |
| `packages/application/src/*` | identity/session/authorization ports, authorized-scope use cases, receipts, evidence append, projection publication and job/outbox ports |
| `packages/infrastructure/src/postgres/*` | Kysely DB typing, ordered migrations/provider, scoped repositories, transactions, compatibility/readiness and PostgreSQL integration tests |
| `packages/infrastructure/src/jobs/*` | pg-boss lifecycle, closed queue registry, policy, semantic state/effect receipt, outbox/inbox dispatch and fault tests |
| `packages/infrastructure/src/identity/*` | fake OIDC and real Auth0/OIDC adapter, one-shot owner bootstrap, session hashing/storage and redaction tests |
| `apps/web/src/app/auth/*`, `apps/web/src/server/*` | login/callback/logout/failure routes, session context and mandatory owner guard; retain neutral page and health |
| `apps/worker/src/*` | start/stop pg-boss only after config/schema readiness; bounded drain and no provider work |
| `packages/configuration/src/*`, `.env.example`, `docs/configuration.md` | strict identity/session/DB-role/job policy names and safe placeholders; fake defaults and flags closed |
| `Dockerfile.migrator` | preserve existing dedicated role; only adjust tested runtime content/labels if the Stage 03 migrator requires it |
| `scripts/*`, `package.json`, existing CI/release schemas | Stage 03 scope, schema/secret/probability checks, exact test commands and P03 evidence in existing jobs |
| `docs/setup/personal/05-auth0-eu-email-otp.md`, `09-staging-readiness.md` | only the minimum App-binding/exact-commit 03E verification clarification; no private value or false smoke claim |
| `Implementation/Personal/03-domain-data-jobs-auth/handoff.md` and checklist `03E` line | execution-only evidence, commits, tests, migrations, gates and deferrals |

One exact-pinned OIDC dependency may change manifests/lock in `03E`; its official
maintenance/security/Node compatibility, license, lifecycle scripts and provenance
must pass the existing full-lock gates. No other new dependency is expected:
Kysely, pg, pg-boss, Zod, Vitest and fast-check are already present.

## 13. Verification and evidence matrix

| ID | Gate and required proof |
|---|---|
| `P03-DOMAIN-001` | exhaustive unions/legal-illegal transitions, one owner per write, direct Written/Oral/missing/no-probability invariants |
| `P03-SCHEMA-001` | real PostgreSQL 18.6 empty/baseline/concurrent/interrupted/latest migration; exact table/constraint/index/drift and compatibility checks |
| `P03-IDEMPOTENCY-001` | property tests duplicate/reorder/drop/lost response and changed-hash conflict for receipt, attempt, evidence, projection and delete foundation |
| `P03-JOB-001` | pg-boss crash before/after fact/job/effect, lease expiry, bounded retry/backoff, poison/dead letter, cancel/result, coalesce/supersede and tombstone races |
| `P03-EVIDENCE-001` | append/accept/correct/supersede chain, affected partition, historical truth vs current projection, deterministic rebuild checksum, zero unaffected changes |
| `P03-IDENTITY-001` | fake claims cover correct/wrong issuer/audience/nonce/state/PKCE/time/subject/email verification, unknown binding, duplicate bootstrap and no first-user enrollment |
| `P03-SESSION-001` | token hashing/cookie flags/rotation, idle/absolute/recent-auth, logout/revoke, CSRF/origin and session-expiry draft-preservation contract |
| `P03-AUTHZ-001` | synthetic owner/attacker × route/use-case/query/object/property/job matrix; random ID swaps and client owner IDs never cross scope; enumeration-safe result |
| `P03-CONTRACT-001` | every v1 schema/example/discriminator/problem validates; unsupported major/reason closes locally; cursor scoped/bounded; no undocumented carrier |
| `P03-AUDIT-001` | authorized high-risk records exist and forbidden content canaries are structurally absent/redacted from logs/jobs/outbox/errors/release evidence |
| `P03-COMPAT-001` | baseline→foundation, current/old job reader overlap, unknown major quarantine, exact activation set, roll-forward and fake/real identity substitution |
| `P03-SCOPE-001` | only plan/checklist in `03P`; only accepted Stage 03 paths in `03E`; Architecture/Design/Stage 01–02 plans/handoffs unchanged |

Run locally with exact Node/pnpm: frozen install; canonical `pnpm check`; focused unit,
property and contract suites; real PostgreSQL integration when available;
documentation/secret/whitespace checks. Existing CI must run PostgreSQL 18.6, process,
OCI and browser jobs at the exact head. Auth0/network tests never run in ordinary CI;
the fake contract and adversarial claim fixtures are non-waivable. A local skip needs
green exact-head Linux evidence, not a waiver.

## 14. Security, privacy and accessibility implications

- Separate migrator, web and worker database purposes. Production-shaped credentials
  are least privilege; web/worker cannot DDL, web cannot claim arbitrary jobs, worker
  cannot browse unrelated learner history, and no role bypasses tombstones.
- Auth0/SES receive identity/OTP data only. No goal, date, response, Evidence,
  Readiness, Writing, transcript, raw audio or Corpus data crosses the identity
  boundary. Provider tokens are transient server memory only.
- Enforce same-origin cookie, CSRF/Origin/Fetch Metadata, allowlisted callback/return,
  strict body/schema limits and central redaction. Object/function/property checks
  happen below route middleware.
- Operational logs default 30 days and minimized high-risk audit 90 days under the
  existing retention architecture. Personal semantic audit is removed by deletion;
  append-only is not permission for indefinite retention.
- Auth routes and failures expose semantic labels, field pointers, stable focus hints,
  pasteable OTP, neutral text and no spinner-only state. `AUTH-09` manual
  keyboard/VoiceOver/NVDA/reflow/zoom verification remains a later Stage 04 UI gate;
  Stage 03 contract/browser smoke does not claim full hosted-login accessibility.

## 15. Rollback and failure posture

- Planning rollback is a focused revert of this plan/checklist commit; it has no data
  or external consequence.
- Before schema activation, revert code/config and leave flags fake. After migration
  but before product facts, prefer a corrected roll-forward; an isolated staging
  rebuild is allowed only with evidence that no personal/product fact exists.
- After any Stage 03 fact, never run destructive down migration or restore over the
  database. Keep schema, disable identity/product routes, deploy a compatible repair
  and replay original semantic IDs.
- Auth0 failure leaves sign-in unavailable and current App sessions subject to their
  own validity; it does not create a password fallback or learner-negative fact.
  Unknown binding/claim fails before session creation.
- Job/database failure leaves exact dependent work Pending/unavailable and preserves
  accepted facts. An exhausted transport attempt does not invent a terminal domain
  outcome. Deletion access remains revoked during retry.
- A dependency, security, authorization, migration or data-leak gate failure blocks
  Stage 03 acceptance. Disable/roll forward the exact capability; do not weaken the
  fake or adversarial oracle.

## 16. Owner-authoritative setup and post-acceptance staging

The owner reports Coolify/Pangolin, R2, Auth0+SES OTP, Gemini, OpenAI STT/TTS,
budgets, custody inventory, controller backup plus `APP_KEY`, and the backup age
keypair prepared enough to proceed. This plan treats them as **prepared, not
live-verified**. Remaining live smokes, backup wiring, R2 verification, readiness
receipt and related checks are deliberately deferred. The age private key is
protected in 1Password but is not yet genuinely offline; this remains an explicit
recovery/readiness gate and is never softened into “offline.”

Only after independent `03E` acceptance, deploy the exact accepted commit to private
staging:

1. Follow `STAGE-01`; require clean exact commit and green deterministic CI. Recheck
   only current mutable Auth0/SDK facts required by the route. Do not rerun unrelated
   provider setup or request any private value in evidence.
2. Use `OPS-03`–`OPS-06` and the preserved `Dockerfile.migrator`: take the required
   manual protected pre-migration recovery point, run one explicit migration, inspect
   schema/role/readiness state, then start fake-first web and worker. Scheduled backup
   wiring and restore proof remain deferred; PostgreSQL `5432` and worker `3001` remain
   private.
3. Reconfirm `AUTH-02`–`AUTH-03` and `AUTH-06`–`AUTH-08`; run the one-shot App owner
   binding with protected issuer/subject input. `AUTH-10` controls rotation/recovery.
   Evidence contains only result class, contract/policy version, commit and check ID.
4. Run `STAGE-03` for identity only: deterministic fake suite first; then enable only
   the Auth0 identity adapter for this accepted capability. Keep object/email product,
   AI/STT/TTS, paid, public-object, guest/account-optional presentation and
   experimental behavior fake/false.
5. Perform one bounded allowed-owner OTP/callback/session flow; unauthenticated,
   malformed/expired/wrong-issuer/wrong-audience/unknown-subject denial; client-owner
   ID denial; logout and revoked-session denial. Use synthetic database fixtures for
   cross-user isolation—do not create a second live personal Auth0 user.
6. Verify private PostgreSQL migration revision, separate role denial, job
   enqueue/claim/effect idempotency with synthetic data, readiness failure/recovery,
   no public port and redacted logs. No learner response or provider token is used.
7. Apply `STAGE-04` only to the Stage 03 rows honestly. Backup wiring, restore,
   encrypted sentinel, R2 verification and the full readiness receipt stay pending;
   the not-offline age private-key gate is named. On failure, select fake/disable
   Auth0, revoke the App session/binding as appropriate and roll forward schema/code.

No live action occurs in `03P` or `03E` repository execution. The exact-accepted-
commit staging cycle is a later orchestrator/owner operation.

## 17. Risks and bounded deferrals

| Risk | Mitigation / named later owner |
|---|---|
| broad foundation becomes speculative | create only tables/contracts named in the prompt; later owners add payload detail and behavior without bypassing shared IDs/receipts/lineage |
| Auth0 SDK stores provider state in browser or weakens App sessions | require opaque DB-backed App session and transient provider tokens; reject SDK configuration that cannot prove it |
| one-owner deployment hides IDOR | mandatory two-scope synthetic property/integration matrix at every authorization layer |
| generic JSONB hides semantics | bounded schema version, owner/kind check, digest, strict validation and indexed relational ownership/state/version columns |
| pg-boss transport mistaken for truth | separate semantic job/effect records, owner publication and crash/lease/redelivery tests |
| first migration prevents binary rollback | flags closed, exact backup checkpoint, additive DDL, compatibility window and roll-forward-only after writes |
| restored/deleted data reappears | tombstone checked on writes/jobs/callbacks and restore-suppression foundation; full drill stays Stage 09/10 |
| prepared provider state is mistaken for readiness | redacted result states and exact guide steps; all deferred smokes/backup/R2/receipt gates stay explicit |

Deferred to their owning stages: feature-specific content/evidence payloads and
algorithms (05–08), raw-audio/object/provider jobs (06), full learner projections and
coaching (07), mocks/Readiness (08), export ZIP/deletion execution/offline/restore
suppression/notifications (09), and comprehensive deployment/restore/release (10).
No new abstraction or table is added merely for a hypothetical commercial tenant;
the app-owned principal/scope seam is sufficient.

## 18. Execution order

1. Reverify accepted Planning head, effective baseline/ancestry, branch/PR, clean
   tree, immutable inputs and dedicated migrator preservation.
2. Add exact domain IDs, unions, reason/releases and legal transition/property tests.
3. Add contract schemas and application authorization/session/receipt/job/evidence
   ports with deterministic fakes.
4. Add reviewed migrations and scoped repositories in identity/release → facts/
   evidence → jobs/audit/rights order; prove real PostgreSQL migration/compatibility.
5. Add semantic pg-boss lifecycle/outbox/inbox and crash/redelivery/dead-letter tests;
   integrate worker readiness and bounded shutdown.
6. Add one-shot owner binding and real OIDC adapter behind fake default, then minimal
   auth routes/mandatory personal guard and adversarial authorization tests.
7. Extend configuration/docs/current CI/release evidence without parallel tooling;
   run all gates, complete scope/secret/lock/migration/whitespace review.
8. Commit/push in reviewable slices and update the existing draft PR. Write the `03E`
   handoff only during Execution. Independent review alone changes checklist status to
   `[x]`; do not start Stage 04.

## 19. Precise Definition of Done for `03E`

- Every persisted state/fact and transition has exactly one command owner and a
  traceable architecture clause; clients/providers/workers cannot write derived truth.
- Exact IDs, clocks, five validity states, six Readiness states, reason families,
  version axes, missing-as-absence and independent Written/Oral invariants are
  enforced by domain/contracts/database tests.
- PostgreSQL migrations, constraints, indexes, compatibility/readiness, pg-boss,
  receipts, outbox/inbox, audit and tombstone foundations pass real PostgreSQL 18.6
  and fault-injection tests with no duplicate semantic effect.
- Personal Auth0 Email OTP validates claims and resolves only the pre-bound
  issuer/subject to an App principal. App sessions are opaque, revocable and policy-
  bounded; password and automatic enrollment are absent.
- Route/use-case/query/object/property tests prove cross-user isolation with synthetic
  users and prove no record is selected solely from a client owner ID.
- Evidence append/assert/correct/supersede and projection shadow/publish preserve
  historical truth, affected scope and deterministic checksums; no probability exists.
- Fake identity/job/provider behavior remains mandatory and all external/paid/public/
  guest presentation flags remain closed in repository evidence.
- Frozen dependency/advisory/source/lifecycle, boundary, unit/property, contract,
  PostgreSQL/process, OCI, browser smoke, docs, secret, generated, scope and whitespace
  gates pass at the exact pushed head.
- Handoff records commits, changed paths, migrations, compatibility, tests/check IDs,
  exact-head CI, rollback, known limitations and every honest owner/deferred gate.

## Appendix A — architecture-to-contract/schema traceability

| Authority | Stage 03 contract/schema consequence | Proof |
|---|---|---|
| Architecture 04 §§3–11; ADR-0010/0011 | 11 logical owners, shared five-skill IDs, separate session/attempt/evidence/projection states, ACL boundaries | domain ownership and cross-skill invariant tests |
| Architecture 05 §§4–10; ADR-0007/0012 | PostgreSQL authority, opaque IDs, per-scope sequence, transactions, expand/contract, backup/delete foundations | `P03-SCHEMA-001`, idempotency and restore-tombstone fixtures |
| Architecture 06 §§5–10; ADR-0013 | immutable evidence envelope, exact validity, append assertion/correction, targeted projection source cut | `P03-EVIDENCE-001` |
| Architecture 07 §§5, 7, 9–11; ADR-0014 | claim key, projection availability, weakness/review/P0–P4 foundation, immutable generations | domain/projection/property fixtures; no policy calculation |
| Architecture 08 §§7–10; ADR-0015 | non-collapsed plan/session/activity/episode/attempt IDs, job-safe late results, reason registry | state/reason/concurrency fixtures |
| Architecture 10 §§4–8; ADR-0017 | immutable content/release identity, compatibility/active pointer and deny/rollback lineage | release/activation constraints and compatibility tests |
| Architecture 11 §§5–10; ADR-0018 | exact six states, independent Written/Oral, Gates A–F, no probability | contract/static/schema invariants; no Stage 03 computation |
| Architecture 12 §§4–13; ADR-0019 | `/api/v1`, strict results/problems/cursors, receipts, jobs/outbox/inbox, optimistic concurrency, auth matrix | `P03-CONTRACT-001`, `P03-IDEMPOTENCY-001`, `P03-JOB-001`, `P03-AUTHZ-001` |
| Architecture 20 §§3–10; ADR-0028 | App principal/scope, Auth0 issuer+subject binding, opaque sessions, guest/adoption seam, export/delete identities | identity/session tests and dormant rights tables |
| Architecture 21 §§7–15; ADR-0029 | stable operation/checkpoint/receipt identities, no LWW, tombstone dominance and conservative time | reconnect/conflict/timer contract fixtures; no offline UI |
| Architecture 23 §§4–12; ADR-0031 | object/action authorization, minimized audit/retention, secret/cookie/CSRF boundaries, deletion proof | `P03-SESSION-001`, `P03-AUTHZ-001`, `P03-AUDIT-001` |
| Architecture 28 §§3–8, 11, 14–15; ADR-0033/0034 | exact semantic invariants, independent release units, exact-manifest promotion and claim-based gates | activation/compatibility/release evidence and closed flags |
