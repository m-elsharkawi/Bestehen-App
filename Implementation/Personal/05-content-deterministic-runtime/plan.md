# Personal Stage 05 — Content and deterministic learning runtime (Planning)

Status: Planning draft. Checklist line `05P` is `[~]`. Only the orchestrator promotes it to `[x]`.

Planning worker boundary: this document, the `05P` checklist line, and nothing else. No production
source file, migration, infrastructure descriptor, provider configuration, database, or secret was
changed. No `.ts`/`.tsx` file was created anywhere. No build, test, or Docker command was run; every
repository fact below was established by read-only inspection (`cat`, `sed`, `grep`, `git log`) or
was supplied as a measured value by the orchestrator and is attributed as such.

---

## 1. Objective

Deliver the first complete deterministic learning slice of Bestehen:

1. an App-owned, versioned, rights-aware **content graph** with immutable publication, quarantine,
   withdrawal, impact assertion and audit;
2. legally safe **seeded personal content** authored originally for this repository;
3. a **shared attempt runtime** — pinned serving manifest, canonical response operations, server
   clock, checkpoint/autosave, submit/finalize, resume/expiry, deterministic scoring, evidence
   proposal and acceptance, retry/idempotency and correction;
4. the three objective skills that ride on it — **Reading (R1/R2/R3)**, **Language Elements
   (SB1/SB2)** and **Listening (H1/H2/H3)** — with accessible alternatives, transcript policy,
   playback control, buffering/failure behaviour and deterministic scoring;
5. **foundation-route checkpoints** for the personal owner, including the 65-year planning horizon
   and mandatory Auth0 presentation;
6. **evidence acceptance** that appends to the Stage 03 canonical ledger and rebuilds projections
   without rewriting history.

Hard boundary, restated from `ADR-0004` and the 05P Definition of Done: **no live Corpus call and no
paid or productive AI call may occur during an active deterministic attempt.** Corpus ingestion is
asynchronous, batch, and never a runtime dependency of an attempt. Objective scoring is a pure
function of the canonical submitted response, the exact pinned key, the scoring policy and the
algorithm version (`Architecture/15-…:373`).

Later stages must be able to extend the *same* attempt and evidence contracts for Writing, Speaking,
mocks and readiness. Stage 05 therefore designs the shared runtime first and the skill variants as
extensions, never as forks (`Architecture/15-…:476-488`, `ADR-0011`, `ADR-0021`).

---

## 2. Verified baseline

| Fact | Value |
|---|---|
| Working branch | local `main` — no branch created, no checkout, no pull/merge/rebase/push |
| Baseline commit | `009d2c62fbc45b4084d8778716705ce57d54f442` — "Record the Stage 04 post-acceptance corrections and the Stage 05 orchestration prompt" |
| Baseline parent | `1854963903805eb6be3c2120790a30d1f38581c2` — "Cache the visual image's dependency layers above the source copy" |
| `origin/main` | `c966c4b4d143150c5396d57f41fe9d803f0689bf` — "Make the design coverage manifest carry and verify plan §5 (#29)" |
| Divergence | local `main` is **14 commits ahead** of `origin/main`, a strict fast-forward |

### 2.1 `origin/main` is stale — recorded owner override

`origin/main` ends at the **Stage 04 acceptance** commit. It does **not** contain the thirteen Stage
04 post-acceptance correction commits (`59ba7e6` … `15784f2`, plus `1854963` and `009d2c6`). Those
corrections changed the design-system public API that Stage 05 builds every view on.

The common contract's "Start from GitHub reality" step (`prompts/implementation/COMMON_STAGE_CONTRACT.md:11-19`)
is therefore **explicitly overridden by owner decision for this stage**: the baseline is local `main`
at `009d2c6`, not the remote default branch. The reason recorded by the owner in
`Implementation/Personal/04-responsive-web-design-system/post-acceptance-corrections.md` is that
pushing `main` fires the full CI workflow and Actions credits are nearly exhausted. Stage 05
accumulates on local `main`; no stage branch is created.

**Stage 05 builds on Stage 04 follow-up work that is not yet on the remote default branch.** Anyone
resuming this stage from `origin/main` will get a false baseline.

### 2.2 Measured facts supplied by the orchestrator (not re-run here)

The orchestrator ran these on `009d2c6` and supplied the results. They are recorded as observed by
the orchestrator, not claimed as run by this Planning worker:

- `pnpm check` exit 0; 218 unit tests across 18 files passed.
- `pnpm check:scope` printed exactly `Stage 01 scope is not applicable on main.` and exited 0,
  enforcing nothing.
- `P04-COVERAGE-001` reported the full reciprocal 37/41/8/43/20 projection with 87 target anchors,
  42 product states and 43 product reasons.
- `P04-ASSET-001` reported 262,144 local WOFF2 bytes and 20 compiled icons.
- `P04-PERF-001` (`scripts/check-web-budget.mjs`) measured:

  | Budget | Measured | Ceiling | Headroom |
  |---|---:|---:|---:|
  | Protected-route first load (**includes** shared framework runtime) | 196,233 B gzip | 204,800 B (200 KiB) | **8,567 B** |
  | App-owned chunks (**excludes** shared framework runtime) | 31,779 B gzip | 92,160 B (90 KiB) | 60,381 B |
  | Per-client-island cap | — | 61,440 B (60 KiB) each | — |
  | Design-system CSS | 4,371 B gzip | 51,200 B | 46,829 B |
  | Fonts (WOFF2, uncompressed) | 262,144 B | 307,200 B | 45,056 B |
  | Icons + brand | 1,863 B gzip | 40,960 B | 39,097 B |

  **Correction of an inherited number.** `post-acceptance-corrections.md` §5 states "~4 KB" of
  first-load headroom. That figure treated the 200 KiB ceiling as decimal 200,000 B;
  `scripts/check-web-budget.mjs` uses `200 * 1024`. The corrections doc is **right that the
  constraint is thin and wrong about this specific figure**. The correct headroom is **8,567 B**.
  This plan uses 8,567 B throughout so the wrong number stops propagating.

---

## 3. Authoritative inputs

Read in full or in the cited ranges while planning. Paths are repository-relative.

### 3.1 Binding process sources

- `prompts/implementation/COMMON_STAGE_CONTRACT.md` — binding worker contract.
- `prompts/implementation/README.md` — authority order (architecture → detailed architecture →
  DESIGN_REVIEW_NOTES + active profile → Design handoff/boards → supporting material).
- `prompts/implementation/personal/05P_plan_content_and_deterministic_learning_runtime.txt` — the
  ten Planning responsibilities and the Definition of Done.
- `prompts/implementation/DESIGN_REVIEW_NOTES.md` — the thirteen corrections every stage preserves.
- `prompts/implementation/personal/personal-implementation-checklist.md` — the live ledger.

### 3.2 Architecture

- `Architecture/28-bestehen-app-architecture-specification.md` — final specification.
- `Architecture/06-evidence-ledger-validity-versioning-and-audit.md` — five validity states, the
  evidence envelope (§5.2), authorized transitions (§6.2), fault-to-state matrix (§6.3), condition
  dimensions (§7.1), occasion classes (§7.2), version lineage (§8.1), idempotency/audit table (§9.1),
  impact assertion (§10.1) and targeted recomputation (§10.2-10.4).
- `Architecture/07-learner-model-mistake-memory-progression-and-review.md` — consumers of evidence.
- `Architecture/08-coaching-engine-and-session-state-machines.md` — session state machine (§7.3),
  boundary/identity table (§7.1), partial completion and resume (§7.4), canonical-loop orchestration
  (§8), pending evaluation (§9), reason families (§10.2) and reviewed fallback copy (§10.3).
- `Architecture/09-content-exercise-form-and-media-architecture.md` — the whole stage. Identity table
  (§4.1), C0-C4 classes (§4.2), `ContentRevision`/`ServingManifest` pseudotypes (§4.3), approval
  levels and state diagram (§5.1-5.2), ordered QA gates (§5.3), key and rubric contracts (§6.1-6.2),
  form composition (§6.3), freshness/independence table (§7.2), media manifest (§8.1), rights
  envelope (§8.2), accessibility publication gate (§8.3), serving/pinning (§9.1), client-visible
  discriminated states (§9.2), boundary commands (§9.3), impact dispositions (§10.1) and the
  serving/cache failure matrix (§10.2).
- `Architecture/10-corpus-integration-compatibility-cache-and-rights.md` — bundle model, publication
  and acceptance sequence, cache authority, compatibility matrix, runtime-independence table.
- `Architecture/12-api-contracts-jobs-events-and-idempotency.md` — resource/command catalog,
  envelope and version policy, domain outcomes vs RFC 9457 problems, durable job model and state
  diagram, outbox, idempotency and concurrency matrix.
- `Architecture/15-reading-and-language-elements-runtime.md` — the objective runtime. Form and block
  contract (§5.1), closed task-family variants (§5.2), canonical response operations (§5.3), key and
  decisive-evidence contract (§5.4), deterministic scoring (§5.5), attempt runtime state machine
  (§6.1), scoring/validity state machine (§6.2), accessibility equivalence table (§7.1), navigation
  and shell behaviour (§7.2), shared-shell extension map (§8), assistance facts and the
  assistance/exposure/validity matrix (§9), boundary operations (§12.2), version axes (§12.3),
  failure and recovery (§13), security and answer integrity (§14.1).
- `Architecture/16-listening-audio-tts-and-media-delivery.md` — `AudioAssetManifest`, `ListeningPlan`,
  `PlaybackOccurrence`, `MediaPreflightReceipt`, `TranscriptEnvelope` (§6), identity/compatibility
  (§6.1), H1-H3 playback contract (§6.2), boundary API (§6.3), playback state machine (§7.1), batch
  TTS publication (§7.2), measured preload/offline sequence (§7.3), preflight/failure matrix (§8.1),
  replay/duplicate protection (§8.2), transcript and accommodation behaviour (§8.3).
- `Architecture/23-…`, `Architecture/24-…`, `Architecture/25-…` — security/privacy/retention,
  observability and quality gates.

### 3.3 ADRs relied on (cited by ID throughout)

`ADR-0004` app runtime independent from corpus · `ADR-0011` shared five-skill foundation ·
`ADR-0012` append-oriented relational truth · `ADR-0013` immutable evidence envelope ·
`ADR-0016` immutable approved content manifests and family independence ·
`ADR-0017` signed immutable corpus bundles and atomic promotion ·
`ADR-0019` versioned HTTP contracts and durable idempotent async work ·
`ADR-0020` server-first composition and bounded browser state ·
`ADR-0021`/`ADR-0022` design system and capability-gated responsive web ·
`ADR-0023` deterministic objective task runtime and immutable outcomes ·
`ADR-0024` pinned batch audio and evidence-sensitive playback ·
`ADR-0029` bounded local write-ahead continuity and conservative timer reconstruction.

### 3.4 Design

- `Design/DESIGN-IMPLEMENTATION-HANDOFF.md`, `Design/DESIGN-HANDOFF.md`
- `Design/design-05-post-architecture-coverage-audit.md`, `Design/design-06-ui-foundation-handoff.md`,
  `Design/design-07-critical-view-handoff.md`
- `Design/Bestehen-01-Design-System.dc.html` … `Design/Bestehen-06-Critical-View-Deltas.dc.html`

The boards are interaction and visual anchors, **not** an independent behavioural specification
(`DESIGN_REVIEW_NOTES.md`, "Outcome"). Where they disagree with architecture, architecture wins and
the resolution is recorded in §11 with a regression test.

### 3.5 Prior implementation stages

- `Implementation/Personal/01-repository-delivery-baseline/{plan,handoff}.md`
- `Implementation/Personal/02-provider-service-setup/{plan,handoff}.md`
- `Implementation/Personal/03-domain-data-jobs-auth/{plan,handoff}.md`
- `Implementation/Personal/04-responsive-web-design-system/{plan,handoff}.md`
- **`Implementation/Personal/04-responsive-web-design-system/post-acceptance-corrections.md`** —
  mandatory. `handoff.md` describes a baseline that no longer exists.

### 3.6 Existing code inspected (not assumed)

| Path | Lines | What Stage 05 must respect |
|---|---:|---|
| `packages/domain/src/index.ts` | 331 | `appIdKinds` already carries `attempt`, `checkpoint`, `response_fact`, `evidence_observation`, `validity_assertion`, `correction`, `independent_occasion`, `mock_occasion`, `episode`, `activity_occurrence`, `release_unit`, `activation_manifest`. `evidenceValidityStates`, `readinessStates`, `semanticJobStates`, `canTransitionEvidenceValidity`, `canTransitionSemanticJob`, `reasonFamilies`, `reasonRegistryV1`, `validateValidityPartition`, `AuthorizedScope`. **Extend, never fork.** |
| `packages/content/src/index.ts` | 10 | Stub: `contentBoundary = { contractMajor: 1, produced: false }`. This is the package Stage 05 fills. |
| `packages/contracts/src/index.ts` | ~180 | `apiContractVersion`, `problemSchema`, `commandEnvelopeSchema`, `jobEnvelopeSchema` (kind enum is closed to three foundation queues), `validityAssertionSchema`, `projectionSchema`, `scopedCursorSchema`. |
| `packages/contracts/src/ui-projections.ts` | ~160 | `consequentialUiProjectionStates` — order-critical, see §8.3. |
| `packages/application/src/index.ts` | ~330 | Ports: `EvidenceLedger`, `ProjectionPublisher`, `SemanticJobStore`, `OperationReceiptStore`, `AuthorizationAction` union, `authorize()`. |
| `packages/infrastructure/src/postgres/migrations.ts` | 413 | `foundationRevision = "20260825_040_p03_foundation"`; four migration sources; `app.content_families` and `app.content_revisions` exist as thin placeholders; `app.attempts`, `attempt_checkpoints`, `response_facts`, `condition_facts`, `exposure_facts`, `independent_occasions`, `evidence_observations`, `validity_assertions`, `evidence_corrections`, `projection_generations` are already modelled. |
| `packages/infrastructure/src/postgres/index.ts` | 169 | `migrateDatabase`, `verifyMigrationChecksums`, `checkSchemaCompatibility`. See §8.2 for a latent defect. |
| `packages/infrastructure/src/postgres/foundation-repository.ts` | 791 | `PostgresFoundationRepository` implements the Stage 03 ports. |
| `packages/infrastructure/src/jobs/index.ts` | — | `foundationQueues` is a closed three-queue tuple; `executeSemanticEffect`; `PgBossTransport`. |
| `packages/design-system/src/{contracts,components,shells,skill-regions}.tsx` | 2,162 in `components.tsx` | `ReadingRegion`, `LanguageElementsRegion` (input/result variants, `ClozeGapIndex`), `ListeningRegion` (a static placeholder), `AttemptShell`, `MockShell`, `ShellSlots.utilityHeader`/`contentSplit`. |
| `packages/design-system/src/coverage/source-anchors.{ts,generated.json}` | — | Exact-count reciprocal manifest; see §12. |
| `apps/web/src/app/**`, `apps/web/src/ui/archetypes.tsx`, `apps/web/src/server/frontend-data.ts` | — | Routes are static archetype renders behind `requirePersonalSession`. |
| `scripts/{check-scope,test-scope,check-design-coverage,check-design-coverage-ids,check-web-budget,release-manifest,test-release-manifest,check-generated,check-boundaries}.mjs` | — | The live gates. |
| `schemas/release-manifest.schema.json` | — | `checks.required`, `releaseAxes`, `database.{min,max}Revision` are all `const`/closed. |
| `package.json` `check` composition | — | `check:scope → test:scope → check:coverage → check:assets → check:lock → check:secrets → check:providers → format:check → lint → typecheck → check:boundaries → test:unit → test:release → build → check:web-budget → check:generated`. |

---

## 4. Scope and non-scope

### 4.1 In scope

1. **Content package** (`packages/content`): the content graph types, task-family variants, key
   contract, form composition, rights/accessibility envelopes, media manifest, seeded fixtures,
   deterministic scorer, and the seed/import CLI with dry-run and validation report.
2. **Domain extensions** (`packages/domain`): new `appIdKinds`, content lifecycle state unions,
   objective-runtime state unions, transition guards, exposure/independence classification,
   assistance taxonomy, new reason codes.
3. **Contracts** (`packages/contracts`): serving-manifest, attempt, checkpoint, submission, result,
   listening-plan, playback-occurrence, preflight-receipt, defect-report and content-impact schemas;
   the new UI projection states for the attempt runtime.
4. **Application ports** (`packages/application`): `ServingManifestBroker`, `AttemptRuntime`,
   `ObjectiveScorer`, `ContentCatalog`, `ContentImpactSink`, `MediaAuthorizer`, plus the new
   `AuthorizationAction` values.
5. **Infrastructure** (`packages/infrastructure`): Stage 05 migrations, content and attempt
   repositories, two new durable job kinds, media object authorization adapter (fake by default).
6. **Web** (`apps/web`): real Reading / Language Elements / Listening attempt routes, result route,
   foundation-route session, versioned `/api/v1` command and query routes, progressive-enhancement
   forms, and the failure/recovery route states.
7. **Design system** (`packages/design-system`): a real `ListeningRegion` audio player, R1/R3
   matching and SB2 shared-bank interaction primitives, `DecisiveEvidence` wiring — all built as
   extensions of the existing component families so the coverage inventory stays at 43/20/41/8/37.
8. **Worker** (`apps/worker`): content publication, media pipeline (fake TTS adapter), and content
   impact recompute handlers.
9. **Gates and evidence**: `stage05Branch`/`stage05Allowed` in `check-scope.mjs` with matching
   `test-scope.mjs` fixtures, the `P05-*` id set, release-manifest schema and workflow wiring.

### 4.2 Explicit non-scope

- **Writing and Speaking runtimes, AI/STT/TTS productive pipelines, private-object upload** — Stage
  06. `WritingRegion` and `SpeakingRegion` stay as they are.
- **Learner model, coaching policy, mistake memory, review scheduling, progression** — Stage 07.
  Stage 05 emits evidence and triggers projection rebuild jobs; it does not compute weakness,
  progression or review obligations. Stated as states rather than as concepts: the five
  post-result nodes of the `Architecture/15-…:390-417` attempt diagram — `Diagnose`, `Repair`,
  `FreshRetry`, `TransferPending` and `Remember` — are **Stage 07's**, and Stage 05's attempt runtime
  stops at `result_available` (D06). The `RepairCard`, `FreshCheckBanner` and `HintDisclosure`
  components render Stage 05 result data; they do not acquire a coaching state machine here.
- **Mocks, readiness, Ready-to-Book, Gates A-F** — Stage 08. `MockShell`/`MockOutcome` stay static.
  Stage 05 designs `mock_occasion_id` and form composition so Stage 08 can extend them, and stops
  there.
- **Export, deletion, notifications, full offline/WAL** — Stage 09. Stage 05 uses only the bounded
  in-attempt write-ahead continuity that `ADR-0029` already permits.
- **Coolify deployment and release acceptance** — Stage 10.
- **`releaseAxes.evaluation` and `releaseAxes.model`** — these MUST stay `"not-produced"`. They are
  Stage 06's axes. Moving them is a scope breach. Recorded as a non-scope item because the schema
  edit that moves `content` sits three lines away from them.
- **A general CMS, authoring UI, reviewer workflow tooling** — `Architecture/09-…:10` explicitly
  excludes it; the personal profile has one owner holding every role.
- **Live Corpus integration.** Stage 05 implements the *App side* of the bundle contract — import,
  validate, promote, cache, compatibility-window — against a local fixture bundle. No network call
  to a Corpus service is made or required.
- **Native app, PWA installability, service worker.** Forbidden by profile.

### 4.3 Scope-check finding (observed, must be planned for)

`scripts/check-scope.mjs` keys its per-stage allowlist off the **branch name**
(`stage01Branch` … `stage04Branch`, lines 5-8) and returns early when no stage matches
(lines 138-144). On `main`, no stage matches. The orchestrator observed the literal output:

```
Stage 01 scope is not applicable on main.
```

exit 0. **The live scope diff gate is inert for Stage 05**, because the owner decided this stage
accumulates on local `main` rather than a stage branch.

`scripts/test-scope.mjs`, by contrast, runs under `pnpm test:scope` inside `pnpm check` on *every*
branch, because it calls the pure exported predicates with synthetic contexts rather than reading
`git branch --show-current`. So the allowed-path list stays genuinely enforced **as a contract
test** even though the live diff gate is inert.

Plan: add `stage05Branch = "implementation/personal-05-content-deterministic-runtime"`, a
`stage05Baseline` constant equal to `009d2c62fbc45b4084d8778716705ce57d54f442`, a `stage05Allowed`
pattern list, and `stage05ScopeApplies` / `unexpectedStage05Paths` exports wired into `main()`'s
selection chain, plus positive and negative fixtures in `test-scope.mjs` mirroring the Stage 03/04
pattern.

`implementation/personal-05-content-deterministic-runtime` is **deliberately not added** to the push
trigger list in `.github/workflows/ci.yml` (lines 4-10). Adding it would spend CI credits the owner
has nearly exhausted. Note that `on: pull_request:` has no branch filter, so opening a PR from that
branch *would* still trigger CI; Stage 05 opens no PR.

---

## 5. Decisions

Each decision records the alternatives considered and why they were rejected, per the common
contract's "record the decision and alternatives" rule.

### D01 — Content lives in `packages/content` as data plus pure functions; PostgreSQL holds the published graph

**Decision.** `packages/content` owns the content *type system*, the seed corpus as typed TypeScript
data, the deterministic scorer, and the publication validator. PostgreSQL (via
`packages/infrastructure`) owns the *published* graph, approvals, exposure index and impact history.
`packages/content` may depend only on `@bestehen/domain` and `@bestehen/contracts`
(`scripts/check-boundaries.mjs`, `packageOrder.content = ["domain","contracts"]`) — this constraint
already exists and is not being widened.

**Alternatives.** (A) Seed content as JSON/YAML files loaded at runtime — rejected: no type safety,
no compile-time exhaustiveness over the closed task-family union, and the digest of a formatted JSON
file is fragile under `biome format`. (B) Content only in the database, seeded by SQL — rejected:
the seed becomes untestable without a database, so `pnpm test:unit` could not prove the scorer or
the key contract. (C) A separate authoring service — rejected by `Architecture/09-…:10` and
`ADR-0002` (low-ops posture).

**Consequence.** Every content fact is unit-testable without Postgres. The seed CLI's job is to
project the typed corpus into the database idempotently and produce a validation report.

### D02 — Publication identity is a digest over a canonical serialization, computed in `packages/content`

**Decision.** `contentRevisionDigest`, `formDigest`, `keyRevisionDigest`, `mediaRevisionDigest` and
`servingManifestDigest` are SHA-256 over a canonical JSON serialization (`canonical-json/v1`, the
same canonicalization version Stage 03 already records in `app.operation_receipts`). The digest is an
integrity fact, never a semantic identity (`Architecture/09-…:113`).

**Alternatives.** (A) Hash the source file bytes — rejected: formatting churn changes the digest.
(B) Use a monotonically increasing integer revision only — rejected: cannot detect silent mutation
of already-published content, which is the invariant `ADR-0016` exists to protect.

### D03 — The seed corpus is originally authored for this repository, in German, with explicit provenance

**Decision.** All Stage 05 seed content is **class C3 — validated original practice**
(`Architecture/09-…:142`), authored for this repository. No restricted exam source bytes are copied.
Each seed revision carries a rights envelope with:

- `sourceKind: "app_original"`, `author: "Bestehen (Stage 05 seed)"`,
- action eligibility: `display: allowed`, `reproduce: allowed`, `adapt: allowed`,
  `generate_from: allowed`, `cache: allowed`, `download_offline: allowed_with_conditions`,
  `transform_transcode: allowed`, with no territory or audience limit;
- `attribution: { required: false, text: "Bestehen practice material" }`;
- `provenance: { corpusBundleRef: null, groundingManifest: "originally-authored", note: "No restricted source expression was consulted." }`;
- `licenceIdentifier: "proprietary-internal"`.

Learner-facing labelling is "Bestehen practice", never an implied TELC or provider endorsement
(`Architecture/09-…:379`).

**Seed inventory (minimum, one eligible family per objective task family plus one fresh-equivalent
sibling so the immediate-retry path is testable):**

| Family | Task definition | Seed families | Notes |
|---|---|---:|---|
| R1 | Heading matching | 2 | 5 short notices, 7 headings, no-reuse |
| R2 | Detailed select | 2 | 1 stimulus ≤ 400 words, 5 select items, 3 options each |
| R3 | Situation/notice matching | 2 | 10 situations, 12 notices, one explicit no-match |
| SB1 | Contextual grammar cloze | 2 | connected letter text, 6 gaps, 3 local options each |
| SB2 | Shared-bank lexical cloze | 2 | connected text, 6 gaps, 10-candidate bank, reuse-at-most-once |
| H1 | Short announcements | 2 | 5 short texts, one play each at P4 |
| H2 | Conversation/interview | 2 | one dialogue, two plays at P4 |
| H3 | Short functional texts | 2 | 5 texts, two plays each at P4 |

Each family gets one **quarantine fixture** (a deliberately ambiguous item) and one **withdrawal
fixture** so the impact and rights paths have real subjects. Quarantine fixtures are marked
`intendedForNegativeTesting: true` and can never publish to a serving role — a publication-gate test
locks that.

**Alternatives.** (A) Reuse public-domain German texts — rejected: public-domain status is a
jurisdiction-specific legal question this stage is not authorized to settle
(`Architecture/09-…:583`), and it would put a legal-review gate on the critical path. (B) Generate
seed text with a model at build time — rejected: `ADR-0004`/`ADR-0016` require reviewed cached
content, and a build-time model call is a paid provider dependency in CI. (C) Lorem-ipsum
placeholders — rejected: the naturalness and pronunciation QA gates would be vacuous, and the
Listening pipeline could not be exercised meaningfully.

### D04 — Seed audio is synthesized offline into committed fixtures via a deterministic fake TTS adapter

**Decision.** `packages/content` declares the `AudioAssetManifest` for each Listening family. The
media pipeline has two adapters behind one port: a **deterministic fake** (default, and the only one
used in CI and by `pnpm check`) that renders a short, byte-stable WAV→MP3 fixture from the script,
and a **configured** adapter reserved for a later owner-gated live Polly run
(`Architecture/16-…:353`). The committed fixtures are small mono MP3s of a few seconds; the exact
byte budget is set below.

The fake adapter must produce **byte-identical output for identical input** so that
`mediaRevisionDigest` is reproducible and `check:generated` stays green.

**Alternatives.** (A) Commit real TTS output from a live provider — rejected: requires a paid call
during Stage 05, adds a secret to the critical path, and the owner action cannot be verified from
the repository. (B) Ship no audio and stub the player — rejected: 05P responsibility 4 requires
deterministic Listening scoring with real buffering and failure behaviour, and `P05-MEDIA-001`
would be a placeholder test. (C) Generate audio at test time — rejected: non-deterministic across
platforms and slow.

**Owner gate.** Live Polly synthesis, voice audition, and P4 human audio sign-off remain an
**unclaimed owner action** (`OWNER-05-A`, §14). Stage 05 ships reviewed *fake-rendered* fixtures at
approval level Training only. No seed audio is promoted to `readiness_p4`.

### D05 — One shared attempt runtime; skills are extensions, enforced by a single canonical operation port

**Decision.** Implement exactly one attempt state machine, one checkpoint protocol, one submission
command, one scoring entry point and one result projection. Skills contribute a **task-family
adapter** that maps interaction to the closed `ResponseOperation` union
(`Architecture/15-…:244-252`) and a **scoring rule** for that family. Reading, Language Elements and
Listening differ only in their adapter, their key shape and (for Listening) their playback plan.

**Alternatives.** (A) Per-skill attempt controllers — rejected explicitly by `ADR-0011`,
`ADR-0021` and the "Forbidden fork" column of `Architecture/15-…:476-488`. (B) A generic
`Record<string, unknown>` response payload — rejected: it defeats exhaustiveness checking and lets a
client invent a response meaning, contradicting `Architecture/15-…:280`.

### D06 — Attempt runtime states are a closed union with explicit guards, bounded at the result boundary

**Decision.** Add to `packages/domain`:

```ts
export const attemptRuntimeStates = [
  "acquiring_manifest",
  "ready",
  "in_progress",
  "checkpointed",
  "submission_unknown",
  "submitted",
  "scoring",
  "interpreting_evidence",
  "result_available",
  "interrupted",
  "unavailable",
] as const;
```

with `canTransitionAttemptRuntime(from, to)` and the terminal set
`{ result_available, interrupted, unavailable }`. `submission_unknown → in_progress` is legal
**only** when no committed receipt exists; that precondition is a repository query, not a
state-machine edge, and is enforced in the runtime service with reason
`FALLBACK.TECHNICAL_FAULT`.

**Scope of the fidelity claim.** The guard implements exactly the arrows of the
`Architecture/15-…:390-417` diagram **up to and including the `ResultAvailable` boundary**. That
diagram has sixteen states; this union has eleven. The five deliberately excluded are
`Diagnose`, `Repair`, `FreshRetry`, `TransferPending` and `Remember`. They are the coaching
lifecycle — diagnosis, repair selection, retry obligation and the Remember commit — and
`Architecture/08-…:377-408` assigns them to the coaching engine, which §4.2 places in **Stage 07**.
Stage 05 stops at `result_available` and hands the result projection to Stage 07. Building all
sixteen here would breach scope; claiming all sixteen without building them would be a false
statement in the accepted record. Neither is acceptable, so the boundary is named in both places:
here as states, and in §4.2 as scope.

**Reconciling the existing CHECK constraint.** `app.attempts.state`
(`packages/infrastructure/src/postgres/migrations.ts:138`) currently allows six values:
`started | checkpointed | submitted | completed | interrupted | not_counted`. The reconciliation is:

| Stage 03 value | Disposition | Stage 05 value |
|---|---|---|
| `started` | renamed | `in_progress` |
| `checkpointed` | unchanged | `checkpointed` |
| `submitted` | unchanged | `submitted` |
| `completed` | renamed | `result_available` |
| `interrupted` | unchanged | `interrupted` |
| `not_counted` | **removed from the runtime union** — see below | (moves to validity) |
| — | **new (six)** | `acquiring_manifest`, `ready`, `submission_unknown`, `scoring`, `interpreting_evidence`, `unavailable` |

Three kept, two renamed, one removed, **six** genuinely new. Total eleven.

**`not_counted` disposition — an explicit correction of a Stage 03 conflation.** `not_counted` is a
**validity** state, not a runtime state. It is a member of `evidenceValidityStates`
(`packages/domain/src/index.ts:61-67`) and `Architecture/15-…:444` is unambiguous: "The five
validity states are exactly valid, partially_valid, pending, interrupted, and not_counted.
Correctness is not a validity state." Stage 03's `app.attempts.state` CHECK admits `not_counted`,
which conflates a validity judgement into the runtime lifecycle. Stage 05 separates them: the
runtime records what *happened* to the attempt; `app.validity_assertions` records what the evidence
*means*. An attempt whose media failed reaches `result_available` or `interrupted` in the runtime
and carries a `not_counted` **validity assertion** with an affected scope and a reason code.

*Note that `interrupted` legitimately appears in both unions and is not a conflation.* In the
runtime it means continuity was lost before submission; in validity it means the clean continuous
claim for a named scope is gone. They are different facts about different subjects that happen to
share a word, and the plan keeps both.

**Data disposition, which T7 must implement and must not invent.** The new CHECK
**does not admit `not_counted`**, and the migration rewrites existing rows before replacing the
constraint, in this order inside `20260901_052_attempt_runtime` (which runs after `051` has inserted
the reason codes that step 3 references):

1. `UPDATE app.attempts SET state = 'in_progress' WHERE state = 'started';`
2. `UPDATE app.attempts SET state = 'result_available' WHERE state = 'completed';`
3. For every row with `state = 'not_counted'`: set `state = 'interrupted'` (the conservative runtime
   reading — the attempt did not reach a published result) and **append a `not_counted` validity
   assertion** for the attempt's observation, if one exists, with reason
   `VALIDITY.RESPONSE_STRUCTURALLY_INVALID` and a migration actor reference, so the meaning is
   preserved rather than silently dropped. Where no observation exists, the row is a runtime-only
   fact and the state rewrite alone is sufficient.
4. `ALTER TABLE app.attempts DROP CONSTRAINT … ; ADD CONSTRAINT … CHECK (state IN (<the eleven>));`

On the current personal database this migration is expected to touch **zero** rows, because Stage 03
shipped no attempt-creating path. T7 must not assume that: the `UPDATE`s run unconditionally, the
migration reports the affected row counts, and `P05-COMPAT-001` rehearses the path against a
P03-seeded database that has been given one row in each of the six old states, so every branch is
exercised at least once.

Because the CHECK lives inside the already-checksummed `learnerFactsSql`, **it cannot be edited in
place** (§8.2). All of the above goes in a new migration source, preserving the Stage 03 source
string byte for byte.

**Rollback consequence, restated.** §15.1 claims a Stage 04 image can write `state = 'started'`
against a Stage 05 database. With `started` renamed and removed from the CHECK, that claim is
**false** for `started` and `completed`. Two options, and Execution takes the second:

- *(rejected)* Keep `started` and `completed` in the new CHECK as accepted aliases. Rejected: the
  database would then accept a value the domain union rejects, which is the exact defect alternative
  (A) below is rejected for, and it leaves two spellings of one state in the data forever.
- *(chosen)* Accept that **a rolled-back Stage 04 image can read a Stage 05 database but must not
  write new attempts to it.** This is honest and costs nothing real: Stage 04 shipped no
  attempt-creating path, so there is no Stage 04 write to preserve. §15.1 is corrected to say
  read-compatible, not write-compatible, for `app.attempts`.

**Alternatives.** (A) Keep the Stage 03 six-state set and map the new states in application code —
rejected: the database would accept a row the domain considers impossible, and
`submission_unknown` is precisely the state whose durability matters. (B) Rewrite `learnerFactsSql`
— rejected: it changes `migrationChecksums["20260825_020_learner_facts_evidence"]`, which
`verifyMigrationChecksums` (`packages/infrastructure/src/postgres/index.ts:62-80`) reads as **drift**
against every already-migrated database. (C) Keep `not_counted` in the runtime union so no data
rewrite is needed — rejected: it preserves the conflation, and every later stage would inherit an
attempt state that contradicts `Architecture/15-…:444`.

### D07 — Content approval is an append-only decision chain with a closed level union

**Decision.** Add to `packages/domain`:

```ts
export const contentApprovalLevels = [
  "draft",
  "quarantine",
  "training",
  "independent_b1",
  "readiness_p4",
  "gold",
  "retired",
] as const;
export const contentClasses = ["C0", "C1", "C2", "C3", "C4"] as const;
```

with `canTransitionContentApproval(from, to)` implementing exactly
`Architecture/09-…:205-226`. Note the asymmetries the guard must encode:

- `quarantine → training | independent_b1 | readiness_p4 | gold` is **illegal**. Restoration goes
  `quarantine → draft` (successor revision restarts full QA) or `quarantine → retired`.
  "Restoring a quarantined artifact requires new evidence and an explicit decision; it is never
  automatic because a job retried" (`Architecture/09-…:201`).
- `gold` does not imply `readiness_p4`; `readiness_p4 → gold` and `training → gold` are both legal
  and neither grants the other.
- Every non-`draft` state can go to `quarantine`.

Class/approval eligibility is a **separate** matrix (`Architecture/09-…:149-155`), not a state
transition: C0 may never hold a learner-serving level; C4 may never hold `training`,
`independent_b1`, `readiness_p4` or `gold`. Implement as `canHoldApprovalLevel(class, level)`.

**Alternatives.** (A) A single `approved: boolean` — rejected by `ARCH-S09-D03`; it loses the
reviewer basis and cannot express Gold vs P4. (B) Collapse class into approval — rejected by
`ARCH-S09-D02`: class is provenance, approval is a gate, and neither implies the other.

### D08 — Serving manifests are server-issued leases with an explicit freshness decision

**Decision.** `AcquireServingManifest` returns a discriminated result whose success branch pins
exact revisions and carries `freshnessDecision: "fresh" | "exposed_review" | "not_independent" | "unavailable"`
(`Architecture/09-…:173-180`). The learner-safe payload and the server-only key payload are
**separate rows in separate tables with separate read paths** — not one row with a filtered
projection — so an accidental `SELECT *` cannot leak a key.

Serving-manifest issuance runs a **defence-in-depth eligibility recheck** at read time against the
current authoritative approval/rights status, not against a cached projection
(`Architecture/09-…:470`).

**Alternatives.** (A) One content row with `learnerPayload` and `key` columns and a view — rejected:
one forgotten column list leaks the answer key; `Architecture/15-…:718` is unambiguous that the
learner payload contains no key. (B) Client-side key with client scoring — rejected outright:
`Architecture/15-…:719`.

### D09 — The server clock is authoritative; the browser reports observations, never truth

**Decision.** A timed attempt carries `serverStartedAt`, `targetDurationRule` and
`clockPolicyRelease` issued with the manifest. The client sends `monotonicElapsedMs`,
`visibilityChanges`, `stallIntervals` and `wallClockSkewMs` as **observations**. The server computes
elapsed time from its own clock and records `timerIntegrity: "continuous" | "reconstructed" | "uncertain"`.
Hiding the timer is presentation only and never pauses the clock (`Architecture/15-…:173`,
`Architecture/16-…:418`). Conservative timer reconstruction follows `ADR-0029`: when integrity
cannot be established, the *clean continuous claim* is lost (validity `interrupted` for that scope)
and the work remains valid practice at actual conditions — it is never converted into a wrong
answer.

**Alternatives.** (A) Trust `performance.now()` deltas — rejected: a paused tab, a suspended device
or a clock change silently manufactures a clean target claim. (B) Fail the attempt on any
discontinuity — rejected: `Architecture/06-…:211` says `interrupted` preserves useful work; failing
it would be a learner penalty for a device event.

### D10 — Deterministic scoring is a pure function in `packages/content` with a pinned algorithm version

**Decision.** `scoreObjectiveSubmission(submission, pinnedKeys, scoringPolicy, algorithmVersion)`
returns an `OriginalObjectiveOutcome` with `unitOutcomes` drawn from the closed union
`correct | incorrect | blank | structurally_invalid` (`Architecture/15-…:355-359`). It takes no
clock, no random source, no database handle, no network client and no learner history. It is
property-tested for determinism and for replay-checksum stability.

`structurally_invalid` is a **system/content state awaiting interpretation, never learner failure**
(`Architecture/15-…:380`). A deliberate blank in a validly submitted form is preserved as `blank`
and the pinned policy may assign no point; an unsubmitted checkpoint or a technical failure is
absence/`not_counted`, not `blank` (`Architecture/15-…:379`). These two must never be conflated — a
dedicated test locks the distinction.

**Official conversion** (`rawOfficialConversion`) is computed **only** for an approved current
P4/mock role. P0-P3 microtasks never display pseudo-official points (`Architecture/15-…:381`). Stage
05 ships no P4-approved content (D04), so the conversion path is implemented, unit-tested against a
fixture blueprint, and unreachable from any seeded serving role — a test asserts that.

**Alternatives.** (A) Score in the database with SQL — rejected: untestable in `pnpm test:unit`, and
version-pinning the algorithm becomes a migration. (B) Score in the worker asynchronously —
rejected: the learner would wait on a queue for a deterministic computation, and
`Architecture/15-…:743` says scoring is linear in submitted units and synchronous.

### D11 — Evidence proposal and acceptance are two steps with two owners

**Decision.** The attempt runtime **proposes** an evidence observation; the evidence owner
**accepts** it. Concretely: `SubmitObjectiveAttempt` writes, in one transaction, the immutable
submission, the original outcome, the condition/exposure facts, an `app.evidence_observations` row
and its **initial** `app.validity_assertions` row, then enqueues the projection rebuild job. The
initial assertion state is chosen by a pure classifier:

```
classifyInitialValidity(outcome, conditions, contentStatus) ->
  | valid            // complete named scope supported, no fault, no pending dependency
  | partially_valid  // disjoint exhaustive partition of the supported scope
  | pending          // content/integrity interpretation outstanding
  | interrupted      // clean continuity lost for the named scope
  | not_counted      // non-learner fault
```

This reuses `validateValidityPartition` from `packages/domain` unchanged and appends through the
existing `EvidenceLedger.appendObservation` port. **No new evidence ledger is created.**

Correctness is never a validity state (`Architecture/15-…:444`). A valid wrong answer is evidence.

**Alternatives.** (A) Let the scorer set validity — rejected by `ARCH-S06-D03`: facts and
interpretation have different owners, and coupling them means a scoring change rewrites history.
(B) Always start `pending` and let a job resolve it — rejected: `Architecture/06-…:228` forbids a
scheduled job promoting `pending` by elapsed time, and it would make every deterministic result
asynchronous for no reason.

### D12 — Content impact is an append-only assertion; recompute is idempotent and scoped

**Decision.** `QuarantineScope`, `WithdrawRightsUse`, `RetireTargetRole` and `PublishReplacement`
each append an `app.content_impact_assertions` row with explicit selectors, `impactMode`
(`serving_only | visibility_redaction | validity_change | target_mapping_change | reevaluation_required`),
`affectedScope`/`unaffectedScope`, a declared expected cardinality and a reason code. A durable job
resolves selectors to observation IDs, appends validity assertions through the existing ledger port,
and rebuilds only the projection kinds that declare a dependency on the changed axis.

**Rights withdrawal defaults to `serving_only`** and does **not** change validity
(`Architecture/06-…:394`, `Architecture/09-…:448`). A content *defect* targets the precise item made
unfair. These two must not share a code path; a test asserts a rights withdrawal leaves every
validity assertion untouched.

If the resolved selector cardinality differs from the declared expectation, **publication stops and
an incident is raised** (`Architecture/06-…:426`). Unknown scope quarantines the smallest defensible
superset and says so — never the whole learner by convenience.

**Alternatives.** (A) Mutate the content row and let projections notice — rejected: destroys audit
(`ARCH-S09-D09`). (B) Invalidate every observation touching the family — rejected: penalises
unaffected evidence and wastes rebuild work.

### D13 — Two new durable job kinds, not a generic job

**Decision.** Extend `foundationQueues` and the `jobEnvelopeSchema` `kind` enum with exactly:

- `content_publication_v1` — validate, digest, and atomically promote a content release; also drives
  the fake TTS media render.
- `content_impact_recompute_v1` — resolve impact selectors, append validity assertions, rebuild
  affected projections in shadow generations, publish atomically.

Both reuse `executeSemanticEffect` and the existing `job_effect_receipts` idempotency
(`packages/infrastructure/src/jobs/index.ts:34-66`) unchanged. Semantic identity is
`content_publication_v1: releaseId + contentReleaseDigest` and
`content_impact_recompute_v1: impactAssertionId + projectionKind + generation`
(`Architecture/09-…:456`).

**Alternatives.** (A) Reuse `projection_rebuild_v1` for impact recompute — rejected: the semantic
identity and the cancel/quarantine semantics differ, and one queue would serialize unrelated work
behind content operations. (B) A generic `content_v1` queue with a discriminated payload — rejected:
`job_resources.kind` has a CHECK constraint and a per-kind singleton key; one queue would make the
singleton key meaningless.

### D14 — The API is versioned `/api/v1` with RFC 9457 problems and Stage 03's command envelope

**Decision.** Follow `Architecture/12-…` and the existing `packages/contracts` shapes exactly.
Commands take `commandEnvelopeSchema` (`contract`, `operationId`, `expectedVersion`, `payload`) and
return `domainResultSchema`. Protocol failures return `problemSchema`. Unknown contract **major**
returns `unsupported_contract_major`; the client never guesses a mapping
(`Architecture/15-…:671`).

`commandEnvelopeSchema.contract.major` is currently `z.literal(1)`. Stage 05 stays on major 1 and
adds fields additively; every new field is optional or has an explicit default so a Stage 04-era
reader is unaffected. A schema-compatibility test locks that.

**Alternatives.** (A) tRPC or a GraphQL layer — rejected: adds a dependency and a second contract
language, and `ADR-0019` fixes versioned HTTP. (B) Server Actions only — rejected: Server Actions
have no stable versioned wire contract, cannot express `unsupported_contract_major`, and are not
addressable by the browser and worker tests the evidence matrix needs. Server Actions *are* used as
the progressive-enhancement transport for form posts (D15), layered over the same command handlers.

### D15 — Server-first rendering; three narrowly scoped client islands and nothing more

**Decision.** Per `ADR-0020` and the 8,567 B first-load headroom, every Stage 05 route is a React
Server Component by default. Exactly three client islands are permitted, each justified in §13:

1. `ObjectiveResponseIsland` — selection/matching/cloze state and the checkpoint outbox.
2. `AudioPlaybackIsland` — the Listening player, preflight, and playback-occurrence log.
3. `AttemptClockIsland` — the timer display and visibility observation reporter.

Every island is progressively enhanced: without JavaScript, a plain `<form>` POST to a Server Action
records the response and re-renders the server-rendered page. Listening without JavaScript degrades
to a native `<audio controls>` with the server enforcing the play-count rule from the
`ListeningPlan`, and the attempt is labelled at its actual conditions rather than being blocked.

**Alternatives.** (A) One client island for the whole attempt shell — rejected: it would pull the
shell, the shared components and the result view into the client bundle and blow the first-load
budget. (B) No JavaScript at all — rejected: select-then-place matching and playback-occurrence
recording (`Architecture/16-…:431`, the local start intent written *before* native play) cannot be
expressed by a form round-trip without losing the exposure fact on a crash.

### D16 — Foundation route: a five-skill resumable checkpoint sequence with the 65-year horizon

**Decision.** The foundation route (`/session/[id]`) is a `SessionInstance` whose plan revision is a
fixed, versioned **foundation plan template** — not a coaching computation, which is Stage 07. It
sequences Reading → Language Elements → Listening (Writing and Speaking render an honest
`unavailable` block with reason `FALLBACK.CONTENT_UNAVAILABLE` until Stage 06). Each completed skill
is a checkpoint; the route resumes at the first incomplete block.

Profile checkpoints captured on this route, appended as `app.profile_facts` rows (the table already
exists) with `fact_kind`:

| `fact_kind` | Content | Rule |
|---|---|---|
| `planning_horizon_v1` | `{ horizonYears: 65 }` | Resolved by `DESIGN_REVIEW_NOTES` §13: the personal planning horizon is **65 years**. This is a Bestehen product default and is stored separately from the official target of 60 (`Architecture/06-…:60`). Both values are present and never collapsed. |
| `target_exam_context_v1` | `{ mode: "no_date" \| "target_month" \| "booked_date", value? }` | No pass probability, no readiness inference. |
| `access_preferences_v1` | `{ reducedMotion, forcedColors, audioAvailable, captionsPreferred }` | Declared preference, stored separately from *actual* support observed at attempt time (`Architecture/06-…:284`). |
| `foundation_route_progress_v1` | `{ completedSkills, sourceCut }` | Supersedable; `supersedes_id` chains. |

Auth0 Universal Login with email OTP and closed registration is mandatory and already enforced by
`requirePersonalSession`. No password fallback, no guest path, no "no account wall" copy
(`DESIGN_REVIEW_NOTES` §2-3).

A partial foundation route contributes **evidence building**, never a placement claim or a level
label — the existing `SessionView` copy already says this and must not regress.

**Alternatives.** (A) Compute the foundation sequence from a coaching policy — rejected: that is
Stage 07's owner, and Stage 05 would have to invent a policy version it cannot validate. (B) Store
the horizon as a derived constant in code — rejected: it is a learner profile fact that must appear
in export and must be supersedable.

### D17 — `releaseAxes.content` moves to `stage-05-content-v1`; `application` moves to `stage-05-runtime`

**Decision.** `schemas/release-manifest.schema.json`, `packages/configuration/src/index.ts:446-470`
and `scripts/release-manifest.mjs` all change together:

```json
"application": { "const": "stage-05-runtime" },
"content":     { "const": "stage-05-content-v1" },
"evaluation":  { "const": "not-produced" },
"model":       { "const": "not-produced" }
```

`content: "stage-05-content-v1"` **is** the content release identity that version pinning and
withdrawal depend on. It is not a parallel version concept: the value is the semantic version of the
`app.content_releases` row that the seed CLI promotes, and every serving manifest records it in its
lineage. A test asserts `releaseMetadata(env).content === contentReleaseIdentity` so the two cannot
drift.

**On `application`, both cases argued.** *Keep `stage-03-foundation`*: Stage 04 left it there
because it added no data and no migration, and the axis arguably names the *foundation* contract
rather than the newest stage. *Move to `stage-05-runtime`* (chosen): Stage 05 adds both a migration
and learner data, so the axis would otherwise claim a schema and runtime surface that no longer
describes the deployed application, and Stage 10's rollback story needs the application axis to
identify which runtime a database revision belongs to. Moving it is a one-line `const` change in
three files with a test; leaving it stale is a silent lie in the release evidence.

`evaluation` and `model` stay `"not-produced"`. Stage 05 makes no productive AI call. Moving them
would be a scope breach into Stage 06.

**Alternatives.** (A) Change `const` to `enum` so the axes accept a range — rejected: it weakens an
existing gate, which the common contract forbids. (B) Add a new `contentRelease` property alongside
— rejected: two version concepts for one fact, which is exactly what the orchestrator flagged.

### D18 — Corpus integration is implemented as an offline bundle importer against a repository fixture

**Decision.** Implement `ImportCorpusBundle` as a worker job that reads a **signed, digest-verified
bundle fixture** committed under `packages/content/fixtures/corpus/`, validates it against the
bundle schema, checks the compatibility window, and promotes it atomically
(`ADR-0017`, `Architecture/10-…:296-325`). The bundle is a *blueprint and governance envelope only*:
task blueprints, taxonomy nodes, difficulty axes and rights decisions. It contains **no learner-facing
text** and no learner profile is ever sent in the opposite direction (`Architecture/09-…:401`).

An attempt never reads a bundle. Bundles feed the *authoring brief*, and briefs feed content, and
content is published before it can be served. A test asserts that no code path from
`AcquireServingManifest` or `scoreObjectiveSubmission` reaches the bundle reader — enforced by a
dependency assertion, not only by convention.

**Alternatives.** (A) Skip Corpus entirely in Stage 05 — rejected: `ADR-0017`'s atomic promotion and
`Architecture/10-…`'s compatibility matrix are Stage 05 scope per the prompt, and Stage 07/08 will
need the taxonomy version to be real. (B) Call a live Corpus service — rejected: no such service
exists in the personal profile and `ADR-0004` forbids making it a runtime dependency.

### D19 — Dark-surface contrast is verified numerically for every new filled control

**Decision.** Every new filled or bordered control introduced by Stage 05 (audio transport buttons,
the SB2 candidate chip, the R1/R3 match pill, the selected-option state, the "not counted" neutral
history mark) gets a **numeric contrast assertion in `tokens.test.ts` against both its light and its
dark surface**, at the WCAG 2.2 AA thresholds (4.5:1 text, 3:1 non-text/UI component).

This is a direct response to `post-acceptance-corrections.md` §5: the boards define no dark
exemplars, and a 1.19:1 invisible primary action survived Stage 04 review. Following the same
correction's precedent, a dark fix inverts the *component's own* fill/label pair rather than
redefining a shared token.

New card surfaces use `--radius-panel: 7px`. Board UI cards are flat with a 1px border — no
elevation (`post-acceptance-corrections.md` §2).

**Alternatives.** (A) Rely on the visual regression baselines — rejected: `maxDiffPixelRatio` is
`0.0024` and a full-page raster comparison cannot see a token in the wrong role, which was the exact
Stage 04 failure mode. (B) Manual review only — rejected: unrepeatable, and there is no dark board.

### D20 — Session-expiry and interruption copy defers validity to the server

**Decision.** Board 06 frame 6.2 contains the banned phrase "it still counts"
(`post-acceptance-corrections.md` §5). Architecture and `DESIGN_REVIEW_NOTES` §8 win. Stage 05's
mid-attempt expiry and interruption copy states, in order: what was preserved (draft/response,
elapsed time, attempt conditions), that the server decides validity, and the next action. The
existing `SessionNotice` + `session-expiry-announcement.tsx` already implement this and must not
regress. A copy test asserts the banned phrase appears in no shipped string.

---

---

## 6. File-by-file work map

New files are marked **new**. Everything else is an edit to an existing file. The "Owner" column is
the Execution task from §18 that owns the file; a file with two owners is a **sequential** hazard and
is called out in §18.

### 6.1 `packages/domain`

| File | Change | Owner |
|---|---|---|
| `src/index.ts` | Append to `appIdKinds`: `content_family` (exists as concept, not as kind), `content_revision`, `content_item`, `content_form`, `key_revision`, `media_asset`, `media_revision`, `rights_envelope`, `approval_decision`, `serving_manifest`, `impact_assertion`, `content_release`, `listening_plan`, `playback_occurrence`, `preflight_receipt`, `assistance_event`, `exposure_event`, `submission`, `objective_outcome`, `defect_report`, `corpus_bundle`. Add `contentClasses`, `contentApprovalLevels`, `contentRightsStates`, `attemptRuntimeStates`, `objectiveUnitOutcomeKinds`, `independenceClasses` (already implied by the `app.independent_occasions` CHECK — lift it to the domain), `assistanceKinds`, `assistancePhases`, `exposureClasses`, `timerIntegrityStates`, `playbackStates`, `freshnessDecisions`, `impactModes`, `impactCauseKinds`. Add guards `canTransitionAttemptRuntime`, `canTransitionContentApproval`, `canTransitionPlayback`, `canHoldApprovalLevel`. Extend `reasonRegistryV1` with the Stage 05 codes in §7.4. | T1 |
| `src/index.test.ts` | Exhaustive transition tables, illegal-transition negatives, class/approval matrix, reason-registry digest stability. `P05-DOMAIN-001`. | T1 |

`packages/domain` must stay framework-free — `scripts/check-boundaries.mjs` rejects any
`next`/`react`/`pg`/`pg-boss`/`kysely`/`pino` import from it, and `dependency-cruiser.cjs`
`domain-is-pure` repeats the rule.

### 6.2 `packages/contracts`

| File | Change | Owner |
|---|---|---|
| `src/index.ts` | Add `jobEnvelopeSchema.kind` values `content_publication_v1`, `content_impact_recompute_v1`; add `owner` value `content`. Add `servingManifestSchema`, `attemptResourceSchema`, `checkpointCommandSchema`, `submitObjectiveCommandSchema`, `objectiveResultSchema`, `assistanceCommandSchema`, `exposureCommandSchema`, `defectReportCommandSchema`, `contentImpactCommandSchema`. All additive on contract major 1. | T1 |
| `src/index.test.ts` | Round-trip, rejection of unknown major, additive-compatibility fixture (a Stage 04-era payload still parses). `P05-CONTRACT-001`. | T1 |
| `src/ui-projections.ts` | **Order-critical.** Add the Stage 05 attempt/content states to `consequentialUiProjectionStates` (§8.3). Add `statusForState` cases for each. | T1 |
| `src/ui-projections.test.ts` | Exhaustiveness of `statusForState` over the extended union; `isSupportedUiProjection` rejects an unknown state. | T1 |
| **new** `src/listening.ts` | `listeningPlanSchema`, `playbackOccurrenceCommandSchema`, `mediaPreflightReceiptSchema`, `transcriptRevealSchema`. Kept in its own module so `packages/contracts/src/index.ts` does not become unreviewable; re-exported from the barrel. | T5 |
| **new** `src/listening.test.ts` | Schema tests. Part of `P05-LISTENING-001`. | T5 |

### 6.3 `packages/content` — the package Stage 05 fills

All **new** except `src/index.ts` and `src/index.test.ts`.

| File | Contents | Owner |
|---|---|---|
| `src/index.ts` | Barrel. Replaces the `produced: false` stub with `contentBoundary = { contractMajor: 1, produced: true, releaseIdentity: contentReleaseV1.identity }`. | T3 |
| `src/model.ts` | The content graph pseudotypes made real: `ContentFamily`, `ContentRevision`, `ContentItem`, `ObjectiveForm`, `BlockContract`, `Instruction`, `SafeContentNode` (closed union), `Option`, `MatchConstraint`, `ScorableItem`. Mirrors `Architecture/09-…:162-181` and `Architecture/15-…:120-237`. | T3 |
| `src/task-families.ts` | The closed `TaskFamily` union: `R1HeadingMatching`, `R2DetailedSelect`, `R3SituationNoticeMatching`, `SB1ContextualGrammarCloze`, `SB2SharedBankLexicalCloze`, `H1ShortAnnouncements`, `H2ConversationInterview`, `H3ShortFunctionalTexts`. | T3 |
| `src/keys.ts` | `ObjectiveKeyRevision`, `DecisiveEvidenceRef`, `DistractorRationale`, `CauseAssessment`, `RepairPlan` (`Architecture/15-…:287-332`). Server-only types; a lint fixture asserts they are never imported by `apps/web` client code. | T3 |
| `src/rights.ts` | `RightsEnvelope` with the eight field groups of `Architecture/09-…:368-377`; `evaluateAction(envelope, action)` returning `allowed \| allowed_with_conditions \| reference_only \| unknown_review_required \| prohibited`; mixed-component least-permission resolution. | T3 |
| `src/media.ts` | `AudioAssetManifest`, `AudioRendition`, `TranscriptEnvelope`, `ListeningPlan` shapes (`Architecture/16-…:162-250`). | T5 |
| `src/accessibility.ts` | `AccessibilityManifest` and the publication gate of `Architecture/09-…:385-391`. | T3 |
| `src/publication.ts` | The ordered QA gates of `Architecture/09-…:243-252` as pure validators returning a structured `GateResult[]`; `validateForPublication(revision, level)`; the class/approval matrix; the form-composition validator (`Architecture/09-…:316-323`). | T4 |
| `src/digest.ts` | `canonicalJson` (`canonical-json/v1`) and the five digest functions of D02. | T3 |
| `src/scoring.ts` | `scoreObjectiveSubmission` (D10), `canonicalizeResponse`, `applyResponseOperation`, `completenessProjection`. Pure. | T4 |
| `src/freshness.ts` | Family assignment, exposure recording rules, the freshness/independence table of `Architecture/09-…:335-346` as a decision function, `classifyIndependence`. | T4 |
| `src/impact.ts` | `ImpactAssertion` shape and `resolveSelectors` cardinality contract (`Architecture/06-…:380-431`). | T4 |
| `src/seed/` | The seed corpus of D03, one module per task family plus `rights.ts`, `provenance.md` and `index.ts` exporting `contentReleaseV1`. | T6 |
| `src/fixtures/corpus/bundle-v1.json` | The offline Corpus bundle fixture of D18 plus its digest sidecar. | T6 |
| **new** `src/corpus-request.ts` | Outbound Corpus request schemas whose `superRefine` **rejects** (never strips) any forbidden learner/profile field (§9.2 item 4). | T6 |
| **new** `src/corpus-boundary.test.ts` | The Corpus boundary proof: forbidden-field property test with named field pointers, and the module-graph assertion that `apps/web` cannot reach the Corpus client. `P05-BOUNDARY-001`. | T6 |
| `src/fixtures/audio/*.mp3` | Fake-rendered seed audio (D04). Byte budget in §13.4. | T5 |
| `src/*.test.ts` | Unit and property tests per module. `P05-CONTENT-001`, `P05-SCORE-001`, `P05-KEY-001`, `P05-RIGHTS-001`, `P05-FRESH-001`. | T3/T4/T6 |

### 6.4 `packages/application`

| File | Change | Owner |
|---|---|---|
| `src/index.ts` | Add ports `ContentCatalog`, `ServingManifestBroker`, `AttemptRuntime`, `ObjectiveScorerPort`, `ExposureRecorder`, `ContentImpactSink`, `MediaAuthorizer`, `ListeningPlanBroker`. Extend `AuthorizationAction` with `content:publish`, `content:quarantine`, `content:report`, `attempt:create`, `attempt:checkpoint`, `attempt:submit`, `attempt:read_result`, `media:authorize`. Extend `ownerActions` accordingly. Add `classifyInitialValidity` (D11) as a pure function next to the existing `resolveSessionState`. | T1 |
| `src/index.test.ts` | Authorization matrix including cross-scope denial and the new actions; `classifyInitialValidity` table. `P05-AUTHZ-001`. | T1 |

`packages/application` may not import `infrastructure`, `configuration`, `design-system` or
`test-support` — both `check-boundaries.mjs` and `dependency-cruiser.cjs` enforce it.

### 6.5 `packages/infrastructure`

| File | Change | Owner |
|---|---|---|
| `src/postgres/migrations.ts` | **Append only.** Add `contentGraphSql`, `attemptRuntimeSql`, `contentImpactSql` and a new terminal `stage05Revision = "20260901_054_p05_content_runtime"` compatibility source. Do **not** edit any existing source string (§8.2). Register the new sources in `migrationSources`/`foundationMigrations` after the existing four. | T7 |
| **new** `src/postgres/content-repository.ts` | Publication, approval chain, serving-manifest issuance with defence-in-depth recheck, exposure index, impact assertions. | T7 |
| **new** `src/postgres/attempt-repository.ts` | Attempt lifecycle, checkpoints, response/condition/exposure facts, submission, outcome, evidence proposal transaction. | T8 |
| `src/postgres/index.ts` | Fix the latent checksum-verification defect (§8.2); export the new revision constant and repositories. | T7 |
| `src/jobs/index.ts` | Add the two queues to `foundationQueues`; per-queue policy for the longer-running publication job. | T7 |
| **new** `src/media/object-authorizer.ts` | Short-lived scoped read authorization for media bytes; **fake adapter by default** (serves from the repository fixture through a same-origin route), configured R2 adapter behind the existing provider-adapter shape. | T5 |
| **new** `src/media/tts-adapter.ts` | The deterministic fake TTS renderer of D04 plus the `ProviderAdapter` seam for a later configured engine. | T5 |
| **new** `src/content/seed-cli.ts` | The seed/import tool of §7.6: `--dry-run`, `--report`, idempotent apply, `--withdraw`, `--quarantine`. | T6 |
| `src/index.ts` | Re-exports. | T7 |
| `src/postgres/postgres.integration.test.ts` | Extend with the Stage 05 relations, immutability triggers, idempotent replay, and impact recompute. `P05-SCHEMA-001`, `P05-IDEMPOTENCY-001`. Runs under `pnpm test:integration`, not `pnpm check`. | T7 |
| **new** `src/stage05.unit.test.ts` | Mirrors the existing `stage03.unit.test.ts` pattern: pure assertions over migration source text, queue policy, and repository SQL shape without a database, so `pnpm check` covers them. | T7 |

### 6.6 `packages/design-system`

| File | Change | Owner |
|---|---|---|
| `src/components.tsx` | Replace the static `ListeningRegion` with a real player region (transport, remaining-plays text, preflight state, transcript-phase gate). Extend `AnswerChoice` and `MatchingPair` into working select-then-place primitives. Extend `ClozeGap`/`ClozeGapIndex` additively for the SB2 shared bank. Wire `DecisiveEvidence` to real props. **All additive: every existing call site must render identical DOM**, as the Stage 04 `ClozeGap` extension did. | T9 |
| `src/contracts.ts` | Props contracts for the above. | T9 |
| `src/styles.css` | Player, bank and match-pill rules. `--radius-panel` for cards; no elevation. | T9 |
| `src/tokens.test.ts` | The dark/light numeric contrast assertions of D19. `P05-CONTRAST-001`. | T9 |
| `src/index.test.tsx` | Component behaviour and DOM-stability tests for the additive extensions. `P05-COMPONENT-001`. | T9 |
| `src/coverage/source-anchors.ts` | Re-point `targetPath`/`targetAnchor` for the rows whose implementation moves (§12). Counts stay 43/20/41/8/37. | T11 |
| `src/coverage/source-anchors.generated.json` | Regenerated by `pnpm generate:coverage`; never hand-edited. | T11 |

**Not touched:** `apps/web/tests/p04-visual.spec.ts-snapshots/`. If a Stage 05 change alters a
baseline raster, that is a signal to re-examine the change, not to update the snapshot; snapshot
regeneration is an explicit orchestrator decision (§15.4).

### 6.7 `apps/web`

| File | Change | Owner |
|---|---|---|
| `src/app/(focused)/attempt/[id]/page.tsx` | Real server component: resolve the attempt, render the pinned learner-safe manifest through the shared `AttemptShell`, mount the task-family region. | T10 |
| `src/app/(focused)/attempt/[id]/result/page.tsx` | Real result: validity → outcome → decisive evidence → distractor rationale → cause → repair, in that order (`Architecture/15-…:337`). | T10 |
| `src/app/(focused)/session/[id]/page.tsx` | Foundation route (D16). | T10 |
| **new** `src/app/api/v1/attempts/route.ts` and `[id]/{checkpoint,submit,assistance,exposure}/route.ts` | Versioned commands. | T10 |
| **new** `src/app/api/v1/serving-manifests/route.ts` | `AcquireServingManifest`. | T10 |
| **new** `src/app/api/v1/listening-plans/[id]/{route,preflight-receipts}/route.ts`, `playback-occurrences/[id]/{start,complete,fail}/route.ts` | Listening boundary API (`Architecture/16-…:280-291`). | T5 |
| **new** `src/app/api/v1/content/{reports,impacts}/route.ts` | Defect report and owner impact commands. | T7 |
| **new** `src/app/media/[mediaRevisionId]/route.ts` | Same-origin authorized byte proxy for the fake object store; digest-verified, `Cache-Control` from the rights envelope, never a public URL. | T5 |
| **new** `src/ui/islands/{objective-response,audio-playback,attempt-clock}.tsx` | The three client islands of D15. | T10/T5 |
| `src/ui/archetypes.tsx` | `AttemptView`/`ResultView`/`SessionView` accept real projections instead of hard-coded copy; the `(test)/ui-fixtures` route keeps rendering them from fixtures so the visual and coverage anchors survive. | T10 |
| `src/server/frontend-data.ts` | Add `requireAttemptScope`, the server-side projection loaders, and the `unsupported_contract_major` fallback path. | T10 |
| **new** `tests/p05-attempt.spec.ts` | Playwright: keyboard-only R1/R3 matching and SB2 placement, 320 px/200 % reflow, forced colors, reduced motion, screen-reader state announcements, no-JavaScript progressive-enhancement path. `P05-A11Y-001`, `P05-RSP-001`. | T12 |
| **new** `tests/p05-runtime.spec.ts` | Network interruption mid-attempt, submission-unknown recovery, duplicate submit, playback stall, content withdrawal mid-attempt. `P05-RECOVERY-001`. | T12 |

### 6.8 `apps/worker`

| File | Change | Owner |
|---|---|---|
| `src/index.ts` | Register the two new queue handlers; keep the existing supervisor and health contract. | T7 |
| `src/index.unit.test.ts` | Handler dispatch, idempotent replay, quarantine on incompatible contract. `P05-JOB-001`. | T7 |

### 6.9 Gates, schemas and documentation

| File | Change | Owner |
|---|---|---|
| `scripts/check-scope.mjs` | `stage05Branch`, `stage05Baseline`, `stage05Allowed`, `stage05ScopeApplies`, `unexpectedStage05Paths`, wired into `main()` (§4.3). | T11 |
| `scripts/check-boundaries.mjs` | The Corpus dependency assertion of §9.2 item 2: fail if any module under `apps/web/` transitively reaches the Corpus client or the bundle reader. T6 authors and tests the rule; T11 wires it into the script, so the enforcement lands late in the serial order and the orchestrator re-runs `pnpm check:boundaries` after T11. | T11 (rule specified by T6) |
| `scripts/test-scope.mjs` | Positive and negative Stage 05 fixtures; keep every Stage 01-04 fixture. `P05-SCOPE-001`. | T11 |
| `scripts/check-design-coverage.mjs` | Update `expectedSchema.semanticStates` and `semanticReasons` **in the exact product order** (§8.3). Counts unchanged. | T11 |
| `schemas/release-manifest.schema.json` | `releaseAxes` per D17; `database.minimumRevision`/`maximumRevision` per §8.1; the `P05-*` ids appended to `checks.required`. | T11 |
| `scripts/release-manifest.mjs` | The `database` and `releaseAxes` literals it emits must match the schema. | T11 |
| `scripts/test-release-manifest.mjs` | Extend fixtures for the new required ids and axes. `P05-RELEASE-001`. | T11 |
| `.github/workflows/{ci,release-candidate}.yml` | Append the `P05-*` ids to the `for CHECK_ID in …` loops (`ci.yml:283`, `release-candidate.yml:94`). **Do not** add the Stage 05 branch to the push trigger list. | T11 |
| `packages/configuration/src/index.ts` | `BESTEHEN_SCHEMA_MIN_REVISION`/`MAX_REVISION` defaults, `ReleaseMetadata` axes, and any new Stage 05 feature flag defaults (all default-off). | T11 |
| `docs/configuration.md` | Document the new revision defaults and any new variable. `check:docs` enforces the inventory. | T11 |
| **new** `docs/content-operations.md` | Seed/import/withdraw runbook with dry-run examples and the validation-report format. | T6 |
| `prompts/implementation/personal/personal-implementation-checklist.md` | `05P`/`05E` lines only. | T0 (Planning) / orchestrator |
| **new** `Implementation/Personal/05-content-deterministic-runtime/handoff.md` | Written by Execution. | T13 |

---

## 7. Contracts

Sketches below are **interface sketches inside this plan**, permitted by the Planning worker
boundary. They are not `.ts` files and Execution owns their final form; where a sketch and the
architecture disagree, the architecture wins.

### 7.1 Content graph and serving

```ts
// packages/content/src/model.ts (sketch)
export interface ContentRevision {
  readonly contentRevisionId: AppId<"content_revision">;
  readonly predecessorRevisionId?: AppId<"content_revision">;
  readonly contentFamilyId: AppId<"content_family">;
  readonly contentClass: ContentClass;            // "C0" | ... | "C4"
  readonly taskDefinition: { readonly id: string; readonly revision: number };
  readonly generationBrief: { readonly id: string; readonly revision: number };
  readonly corpusBundleRef?: { readonly bundleId: string; readonly revision: number };
  readonly targetBlueprintRelease: string;
  readonly taxonomyRelease: string;
  readonly capabilityRefs: readonly string[];
  readonly progressionProfile: "P0" | "P1" | "P2" | "P3" | "P4";
  readonly intendedEvidenceRoles: readonly EvidenceRole[];
  readonly learnerPayload: TaskFamily;            // closed union, SafeContentNode only
  readonly items: readonly ContentItem[];
  readonly keyRevisionIds: readonly AppId<"key_revision">[];   // server-only join
  readonly mediaRevisionIds: readonly AppId<"media_revision">[];
  readonly rightsEnvelopeId: AppId<"rights_envelope">;
  readonly accessibilityManifestId: string;
  readonly currentApprovalDecisionId?: AppId<"approval_decision">;
  readonly frozenAt?: string;                     // set on first publication; immutable after
  readonly digest: string;                        // sha256 over canonical-json/v1
}

export type FreshnessDecision =
  | "fresh" | "exposed_review" | "not_independent" | "unavailable";

export interface ServingManifest {
  readonly servingManifestId: AppId<"serving_manifest">;
  readonly attemptId: AppId<"attempt">;
  readonly formId?: AppId<"content_form">;
  readonly contentRevisionIds: readonly AppId<"content_revision">[];
  readonly itemIds: readonly AppId<"content_item">[];
  readonly mediaRevisionIds: readonly AppId<"media_revision">[];
  readonly keyRevisionDigests: readonly string[];  // digests only; keys never leave the server
  readonly allowedConditions: AllowedConditions;
  readonly learnerSafePayloadDigest: string;
  readonly freshnessDecision: FreshnessDecision;
  readonly comparedFamilyRefs: readonly AppId<"content_family">[];
  readonly authorizationVersion: string;
  readonly contentReleaseIdentity: string;         // === releaseAxes.content (D17)
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly revocationState: "active" | "revoked_before_start" | "revoked_after_pin";
}
```

**Learner-safe payload invariant.** `learnerPayload` contains only instructions, sanitized
`SafeContentNode`s, option labels, response constraints, accessible relations and permitted
metadata. It contains **no key, no correct flag, no decisive-anchor coordinates that reveal the
answer, no distractor rationale, no scoring weight, no operator note, no restricted source URL and
no unpublished target mapping** (`Architecture/15-…:718`). This is enforced three ways: separate
tables (D08), a type-level split (`keys.ts` types are never reachable from a client module), and a
serialization test (`P05-SECURITY-001`) that walks a published manifest and fails on any key-bearing
field name.

### 7.2 Attempt runtime

```ts
// packages/application/src/index.ts (sketch)
export type ResponseOperation =
  | { readonly kind: "set_selection"; readonly itemId: ItemId; readonly optionId: OptionId }
  | { readonly kind: "clear_selection"; readonly itemId: ItemId }
  | { readonly kind: "set_match"; readonly itemId: ItemId; readonly leftId: string;
      readonly rightId: string | "no_match" }
  | { readonly kind: "clear_match"; readonly itemId: ItemId; readonly leftId: string }
  | { readonly kind: "place_candidate"; readonly itemId: ItemId; readonly gapId: string;
      readonly candidateId: string }
  | { readonly kind: "remove_candidate"; readonly itemId: ItemId; readonly gapId: string }
  | { readonly kind: "move_candidate"; readonly itemId: ItemId; readonly fromGapId: string;
      readonly toGapId: string }
  | { readonly kind: "confirm_boundary"; readonly boundaryId: string };
```

Every input path — pointer, drag, keyboard select-then-place, number-key shortcut, screen-reader
activation, switch input — produces the **same** operation (`Architecture/15-…:280`). DOM order and
option order are presentation facts. `P05-EQUIV-001` proves each path yields an identical canonical
response and identical score.

**Idempotency keys** (matching `Architecture/06-…:340-351` and the existing
`app.operation_receipts` primary key `learner_scope_id + operation_id + kind`):

| Command | Idempotency identity | Conflict behaviour |
|---|---|---|
| `CreateObjectiveAttempt` | `scope + operationId + "attempt.create"`; payload digest over `{ servingManifestId, activityOccurrenceId }` | same id + same digest → committed attempt; same id + different digest → `idempotency_conflict` |
| `CheckpointObjectiveResponse` | `scope + operationId + "attempt.checkpoint"`; plus `UNIQUE(attempt_id, stream, sequence)` already in `app.attempt_checkpoints` | a lower sequence is ignored; an equal sequence with a different digest is a **divergence**, not a conflict — both branches are preserved (`Architecture/15-…:701`) |
| `RecordAssistance` / `RecordExposure` | `scope + operationId + "attempt.assistance"` / `"attempt.exposure"` | exact retry returns the receipt |
| `SubmitObjectiveAttempt` | `scope + operationId + "attempt.submit"`; digest over the canonical response snapshot | exact retry returns the committed outcome; different snapshot → `idempotency_conflict`; **no second attempt is ever created by a reconnect** (`Architecture/06-…:370`) |
| `AcquireServingManifest` | `scope + operationId + "content.acquire"` | replay returns the same lease, never a second exposure |
| `StartPlaybackOccurrence` | `occurrenceId + playOrdinal` | duplicate tap, DOM remount, outbox replay and late callback all return the same receipt (`Architecture/16-…:433`) |
| `ApplyContentImpact` | `impactAssertionId + projectionKind + generation` | `job_effect_receipts` makes the effect exactly-once |

**Checkpoint is not evidence.** It is mutable recoverable work replaceable by a higher accepted
sequence (`Architecture/15-…:282`). The submitted response is immutable.

**Divergent checkpoints across devices preserve both branches** and the learner resolves before
submit; last-write-wins is forbidden. Stage 05 ships the *preservation and comparison* for objective
responses; the full accessible compare/select/merge writing-draft view is Stage 06/09
(`DESIGN_REVIEW_NOTES` §7).

### 7.3 Result contract and ordering

`GetObjectiveResult` returns, in this order (`Architecture/15-…:337`):

1. current validity (five states) with `affectedScope`/`unaffectedScope`;
2. the immutable original outcome and, only for an eligible P4/mock role, the official conversion;
3. decisive evidence (`safe_reveal_span_or_relation`, `relationKind`);
4. why the chosen distractor fails;
5. supported cause with confidence, or `unresolved` with **one** smallest clarifier;
6. the smallest repair.

If a cause cannot be isolated, the runtime returns `unresolved` with one clarifier — it never
creates several weaknesses from one ambiguous item (`Architecture/15-…:337`). Missing, unknown,
quarantined or incompatible content renders **no score, zero, weakness or pass-probability field**
(`Architecture/09-…:426`).

### 7.4 New reason codes

Appended to `reasonRegistryV1` in the existing `representativeCodes` structure, so the derived
registry digest changes and the `app.reason_registry_releases` row bumps to
`reason-registry/v1.1` (minor, additive — the `major = 1` CHECK stays satisfied):

| Family | New codes | Used by |
|---|---|---|
| `VALIDITY` | `CONTENT_QUARANTINED_AFTER_PIN`, `MEDIA_INTEGRITY_FAILED`, `TIMER_INTEGRITY_LOST`, `RESPONSE_STRUCTURALLY_INVALID` | serving states, playback faults, timer reconstruction, scorer |
| `DIRECT` | `EXPOSED_FAMILY_PRACTICE`, `PLAYBACK_CONDITION_ALTERED` | freshness labelling, non-standard playback |
| `UNCERTAINTY` | `KEY_VALIDATOR_DISAGREEMENT` | publication gate 5 |
| `FALLBACK` | `MEDIA_UNAVAILABLE`, `NO_ELIGIBLE_FAMILY`, `SUBMISSION_OUTCOME_UNKNOWN`, `CONTENT_UPDATE_REQUIRED` | serving/cache failure matrix |

Every one has `learnerFault: false`. **Adding these is not free** — see §8.3.

### 7.5 Client-visible discriminated states

Added to `consequentialUiProjectionStates` (order matters, §8.3), mirroring `Architecture/09-…:415-424`
and the attempt runtime:

`available`, `loading_media`, `unavailable_no_fresh_family`, `unavailable_rights_or_target`,
`quarantined_after_pin`, `media_failed_not_counted`, `replacement_ready`, `update_required`,
`acquiring_manifest`, `in_progress`, `checkpointed`, `submission_unknown`, `submitted`, `scoring`,
`result_available`.

Note `pending`, `partial`, `unavailable`, `interrupted`, `not_counted`, `failed`, `completed`,
`retry_fresh`, `ready`, `expired` already exist and are reused rather than duplicated.

### 7.6 Seed and import tooling

`pnpm --filter @bestehen/infrastructure content:seed` with:

| Flag | Behaviour |
|---|---|
| `--dry-run` | Runs every publication gate, resolves digests, prints the validation report, writes nothing. Exit 1 on any hard-gate failure. |
| `--report <path>` | Writes the report as JSON: per-revision gate results, digests, class/approval decision, rights action evaluation, accessibility gate, and a diff against what is already published. |
| *(default)* | Idempotent apply. Re-running with an unchanged corpus is a no-op that reports `0 created, 0 superseded`. A changed revision creates a **successor**, never an in-place edit. |
| `--withdraw <familyId> --reason <code>` | Appends a `retired` approval decision plus a `serving_only` impact assertion. |
| `--quarantine <selector> --reason <code>` | Appends a `quarantine` decision plus an impact assertion with the declared cardinality. |
| `--rollback <releaseId>` | Selects the prior approved content release; does **not** mutate already-served history (`Architecture/09-…:550`). |

No broad CMS. The tool is the entire authoring surface for the personal profile, and the owner holds
every review role — but the audit still records distinct author, validator and approver commands
(`Architecture/09-…:199`).

---

## 8. Migrations and schema compatibility

### 8.1 Revision naming and the compatibility window

Stage 05 adds one new terminal revision following the Stage 03 naming convention
(`YYYYMMDD_NNN_pNN_slug`):

```
20260901_051_content_graph        # relations + reason-registry v1.1
20260901_052_attempt_runtime      # attempt/serving/playback + the D06 data rewrite
20260901_053_content_impact       # impact, defect reports, job-kind widening
20260901_054_p05_content_runtime  # terminal: revision row + checksum upsert
```

`kysely`'s `Migrator` runs in the object's **insertion order**, and `checkSchemaCompatibility`
builds its ordinal list from `Object.keys(foundationMigrations)` — so insertion order is the
contract, not the numeric prefix. The prefixes are numbered to agree with it anyway, and Execution
adds a test asserting `Object.keys(foundationMigrations)` ends with the terminal revision.

**Intra-migration ordering that D06 depends on.** `20260901_052` rewrites `app.attempts` rows and
appends a `not_counted` validity assertion, which carries a composite FK to
`app.reason_codes(registry_id, code)`. The `reason-registry/v1.1` release and its new codes
(§7.4) are therefore inserted in **`20260901_051`**, not in the terminal source. Putting them in
`054` would make the `052` rewrite fail its foreign key. Execution must not "tidy" the registry
insert into the terminal migration.

The compatibility window becomes:

- `BESTEHEN_SCHEMA_MIN_REVISION` default → `20260825_040_p03_foundation` (**unchanged**), so a
  Stage 04 runtime keeps starting against a Stage 05 database during a rollout;
- `BESTEHEN_SCHEMA_MAX_REVISION` default → `20260901_054_p05_content_runtime`;
- `schemas/release-manifest.schema.json` `database.minimumRevision`/`maximumRevision` `const`
  values move to the same pair.

Keeping the minimum at the P03 revision is deliberate: `checkSchemaCompatibility` treats the window
as an inclusive ordinal range, so a wider window is what makes a **migrate-then-deploy** rollout and
a **deploy-rollback-without-database-rollback** both legal. Narrowing the minimum to the Stage 05
revision would make the previous web image unready the instant the migration runs.

### 8.2 Two things Execution must not do, and one latent defect to fix

**(a) Existing migration source strings are immutable.** `migrationChecksums` is
`sha256(source)` per entry (`migrations.ts:357-360`), and `verifyMigrationChecksums`
(`postgres/index.ts:62-80`) compares the on-disk set against `app.schema_revisions` and throws
`Schema migration checksum drift detected` on any difference. Editing `identityAndReleaseSql`,
`learnerFactsSql`, `jobsAuditRightsSql` or `compatibilitySql` would make every already-migrated
database report drift. Every Stage 05 schema change is therefore an `ALTER`/`CREATE` in a **new**
source. This is why D06 alters the `app.attempts` CHECK constraint rather than editing it.

The `seed` **callback** passed to `immutableMigration` is *not* part of the checksum — only the SQL
string is. So the P03 seed callback may be narrowed if needed without causing drift. Execution
should still avoid touching it.

**(b) `verifyMigrationChecksums` requires exact set equality.** `observed.rows.length !== expected.length`
throws. The P03 compatibility migration seeds `app.schema_revisions` from the **whole**
`migrationChecksums` object, which after Stage 05 includes the Stage 05 entries. On a fresh
database that is self-consistent; on an **existing** P03 database the P03 migration does not re-run,
so the Stage 05 terminal migration must upsert the full `migrationChecksums` map with the same
`ON CONFLICT … DO UPDATE` shape. Execution must implement that and prove it with a migration
rehearsal from a P03-seeded database, not only from an empty one. `P05-COMPAT-001`.

**(c) Latent defect to fix.** `checkSchemaCompatibility` (`postgres/index.ts:139-149`) runs
`verifyMigrationChecksums` **only** when `revision === foundationRevision`. Once the observed
revision is the Stage 05 terminal revision, checksum verification is silently skipped and drift
becomes invisible in readiness. Fix: verify whenever the observed revision is any known revision
(`revisions.includes(revision)`), or simply whenever `app.schema_revisions` exists. A regression test
asserts that a drifted checksum at the Stage 05 revision reports `observedRevision: "drifted"` and
`compatible: false`. This is a **strengthening** of an existing check, not a weakening.

### 8.3 Order-critical union parity — the coverage coupling

`scripts/check-design-coverage.mjs` hard-codes `expectedSchema.semanticStates` and
`expectedSchema.semanticReasons`, and `assertSemanticUnionParity` compares them to the live product
unions **including order**:

```
if (declared.join("|") !== actual.join("|")) throw new Error("… order drifted …")
```

It also requires every declared state and reason to be **claimed by at least one coverage row**
(`Unclaimed … in the coverage manifest`).

Therefore, for each new UI projection state (§7.5) and each new reason code (§7.4), Execution must,
in one change:

1. append to `consequentialUiProjectionStates` / `reasonRegistryV1` in the product's order;
2. append the identical values, in the identical order, to `expectedSchema` in
   `check-design-coverage.mjs`;
3. add a `statusForState` case (the `switch` is exhaustive over the union);
4. **claim** each new value on at least one existing coverage row's `semanticStates` /
   `semanticReasons` array, without changing any row count.

Step 4 is the non-obvious one and is the single most likely cause of a red `pnpm check` during
Stage 05. It is called out again in §12.

### 8.4 New relations (summary; exact DDL is Execution's)

`20260901_051_content_graph`
: The `reason-registry/v1.1` release row and its new reason codes (§7.4, and see §8.1 for why they
  must land here). Plus `app.content_items`, `app.content_forms`, `app.content_form_entries`, `app.key_revisions`
  (server-only, separate grant), `app.rights_envelopes`, `app.accessibility_manifests`,
  `app.media_assets`, `app.media_revisions`, `app.transcript_revisions`,
  `app.approval_decisions` (append-only, immutability trigger), `app.content_gate_results`,
  `app.content_releases`, `app.corpus_bundles`. Plus `ALTER TABLE app.content_revisions` to add the
  Stage 05 columns (class, brief/task refs, target/taxonomy releases, progression profile, frozen_at,
  rights/accessibility FKs) — the Stage 03 table is a thin placeholder and is extended, not replaced.

`20260901_052_attempt_runtime`
: `app.serving_manifests` (+ `app.serving_manifest_entries`), `app.attempt_submissions`,
  `app.objective_outcomes` (immutability trigger), `app.objective_unit_outcomes`,
  `app.assistance_events`, `app.listening_plans`, `app.playback_occurrences` (unique on
  `(occurrence_id, play_ordinal)`), `app.media_preflight_receipts`, `app.content_exposure_index`.
  Plus the `app.attempts.state` CHECK replacement of D06 and a `serving_manifest_id` FK on
  `app.attempts`.

`20260901_053_content_impact`
: `app.content_impact_assertions` (append-only), `app.content_impact_targets`,
  `app.content_defect_reports`. Plus the two new `app.job_resources.kind` CHECK values — again an
  `ALTER … DROP CONSTRAINT … ADD CONSTRAINT`, not an edit of `jobsAuditRightsSql`.

`20260901_054_p05_content_runtime`
: compatibility source only: insert the Stage 05 revision row and upsert the full checksum map
  (§8.2b). It creates no relation and inserts no reason code.

All Stage 05 evidence-bearing relations get the existing `app.reject_immutable_mutation()` trigger.
All learner-scoped relations carry `learner_scope_id` and a composite FK so a cross-scope join is
impossible by construction, matching the Stage 03 pattern.

---

## 9. Security, privacy and accessibility implications

### 9.1 Security

| Concern | Control |
|---|---|
| Answer-key leakage | Keys, distractor rationales and decisive-anchor coordinates live in `app.key_revisions` and are never joined into a learner-safe projection (D08). A serialization test walks a published manifest and fails on any key-bearing field name. `P05-SECURITY-001`. |
| Client-side scoring | Impossible: the client never receives a key. The server scores against the pinned key (`Architecture/15-…:719`). |
| Untrusted authored content | `SafeContentNode` is a **closed** union with no raw-HTML escape hatch. Scripts, event handlers, style injection, active embeds, arbitrary SVG, external URLs and prompt-like authoring instructions are rejected at publication *and* re-validated at the serving boundary as defence in depth (`Architecture/09-…:381`, `Architecture/15-…:720`). |
| Media byte access | Private by default. The Stage 05 fake object store is served through a same-origin authenticated route with a short-lived scoped authorization, digest verification and `Cache-Control` derived from the rights envelope. Signed URLs are treated as bearer tokens: never logged, never in a referrer, never in analytics (`Architecture/16-…:454`). `publicObjectAccess` stays `false`. |
| Cross-scope access | Every Stage 05 relation carries `learner_scope_id` with a composite FK, and `authorize()` compares `input.learnerScopeId` to the session scope. Guessing another attempt or item ID reveals nothing, including whether it exists (`Architecture/15-…:721`). |
| Idempotency abuse | Same operation ID with a different payload digest is `idempotency_conflict`, never a silent overwrite. |
| Defect reports | Untrusted, length-bounded, stored separately from rendered content, never interpolated into a task (`Architecture/15-…:722`). |
| Secrets | None introduced. The live TTS/object-store adapters remain unconfigured and default to fakes; `externalProviderCalls` and `paidProductiveProcessing` stay `false` in `schemas/release-manifest.schema.json`. `pnpm check:secrets` continues to gate. |
| Telemetry | Codes, counts, versions, timing classes and opaque IDs only. **No German stimulus text, no transcript, no answer, no selected option label, no learner note, no signed URL** (`Architecture/15-…:722`, `Architecture/16-…:447`). |

### 9.2 Privacy

- **Corpus receives nothing, and the boundary is proved the way architecture specifies it.**
  `Architecture/10-…:430` fixes a five-part testable boundary proof, and Stage 05 implements all
  five rather than the two a naive reading would settle for:

  1. **No Corpus network credential or client on a learner route.** The Corpus client type exists
     only in the import worker's module graph. `apps/web` never imports it, and no Corpus credential
     name appears in the web service's configuration schema — `packages/configuration` keeps the
     importer's variables in the worker-only set, so `parseServerEnvironmentForService(env, "web")`
     cannot even read one.
  2. **Only the import worker may hold the client.** A dependency assertion (`check-boundaries.mjs`
     style, in the same file as the existing deep-import rule) fails the build if any module under
     `apps/web/` reaches the bundle reader or the Corpus client, transitively.
  3. **Egress policy denies the Corpus publication host from the learner web process.** In the
     personal profile there is no live Corpus host, so this is recorded as a deployment obligation
     for Stage 10 rather than claimed as implemented here — and it is named in the handoff as
     unclaimed rather than quietly satisfied by the fact that no host exists yet.
  4. **Contract serialization FAILS on forbidden learner/profile fields.** This is the outbound-leak
     guard and it is the one most easily omitted. Every outbound Corpus request type is serialized
     through a strict schema whose `superRefine` **rejects** — not strips — any field in the
     forbidden set: learner or scope identifier, response, transcript, exposure history, weakness,
     assistance record, schedule, readiness, profile fact, or any free-form field. Stripping would
     be worse than failing: it hides the defect. A property test feeds a payload contaminated with
     each forbidden field in turn and asserts a serialization failure with a named field pointer.
  5. **Fixtures assert zero Corpus calls AND zero learner-data bytes.** Counting calls is not
     enough: a single call carrying a learner id is the whole failure. The integration fixture runs
     a full practice attempt, plus the P4/mock and readiness code paths that exist in Stage 05,
     against an instrumented outbound transport that records **every byte** offered to it, and
     asserts both `calls === 0` and `bytes === 0`.

  D18's dependency assertion locks the reverse direction too: no attempt code path reaches the
  bundle reader. Together these are `P05-BOUNDARY-001`.
- Profile facts added by the foundation route (D16) are ordinary learner data under the existing
  `app.profile_facts` retention and will be covered by Stage 09's export and deletion. Stage 05 adds
  no new retention class.
- Append-only audit is not a pretext for indefinite personal retention (`Architecture/06-…:431`).
- No raw audio is captured in Stage 05 — Listening is playback only. The ephemeral raw-audio policy
  belongs to Stage 06's Speaking work.

### 9.3 Accessibility — the Stage 04 gates that Stage 05 must keep green, plus new obligations

Existing gates that must not regress: WCAG 2.2 AA, keyboard-only, 200 % zoom, 320 CSS-pixel reflow,
reduced motion, forced colors, screen-reader state announcements.

New Stage 05 obligations, drawn from `Architecture/15-…:450-463`, `:733-735` and
`Architecture/16-…:437-446`:

1. **Every mechanic has a required keyboard path that is not drag.** R1/R3 matching and SB2 bank
   placement are **select-then-place**; drag is optional sugar. The keyboard path yields the
   identical canonical operation and the identical score. `P05-EQUIV-001`.
2. **DOM and focus order** is conditions → instruction/stimulus → current question/gap →
   options/bank → action. A step change focuses the first new meaningful heading or question, never
   the page top.
3. **Reading measure stays ≤ 720 px**, `lang="de"` on German content, `hyphens: auto`. At narrow
   widths source precedes response; wide layouts may show them together **without changing DOM
   order**. LG-V4's 768 px cloze contract already encodes this and has a pinned visual anchor.
4. **Relationships are never spatial-only.** Matching pairs and bank placements are also expressed
   as text/list state that a screen reader can read and revisit.
5. **Announcements are sparse.** Timer ticks, selection movement and each bank focus change are
   **not** live-announced. Playback changes are announced politely as discrete events
   (`Architecture/16-…:437`).
6. **Targets ≥ 44 × 44 with spacing**, including the audio transport.
7. **Audio has a text equivalent for instructions** always; the *target* transcript is a separate
   authorized object gated by phase (P0-P2 after submission, P3 records assistance if opened, P4
   denied until the block ends). It is **not merely hidden with CSS** (`Architecture/16-…:456`).
8. **Errors** identify the exact item or gap and the repair action, focus the error summary then the
   first invalid control, only at a shaped validation boundary, and never erase valid selections.
9. **Access need is never failure.** Equivalent access preserves identical evidence. Altering or
   unverified support narrows only the affected claim and always remains available for learning
   (`Architecture/09-…:393`).
10. **Dark-surface contrast is verified numerically** for every new filled control (D19).

---

## 10. Test and evidence matrix

### 10.1 The `P05-*` id set

Naming follows the established `P0N-<AREA>-001` convention (`P03-DOMAIN-001`, `P04-TOKEN-001`).
Every id below names the **exact command that proves it** and the **evidence reference** it emits.
An id with no producing command would be placeholder evidence and is forbidden by the common
contract.

| ID | Proves | Producing command | Evidence reference | Runs in `pnpm check`? |
|---|---|---|---|---|
| `P05-DOMAIN-001` | Content/attempt/playback state unions and transition guards; class↔approval matrix; illegal transitions rejected; reason-registry digest stable | `pnpm test:unit` | `packages/domain/src/index.test.ts` | yes |
| `P05-CONTENT-001` | Content graph invariants, ordered QA gates, publication freezes a revision, successor-on-edit, form composition constraints | `pnpm test:unit` | `packages/content/src/publication.test.ts` | yes |
| `P05-KEY-001` | Objective key contract: cardinality, blind-validator disagreement quarantines, distractor rationale present, position is never identity | `pnpm test:unit` | `packages/content/src/keys.test.ts` | yes |
| `P05-RIGHTS-001` | Action-level rights evaluation, condition denial, mixed-component least permission, attribution rendering, withdrawal blocks serving without changing validity | `pnpm test:unit` | `packages/content/src/rights.test.ts` | yes |
| `P05-FRESH-001` | Family assignment; shuffled options, renamed entities, changed voice and new revision stay the same family; exposure recorded; independence classes | `pnpm test:unit` (property tests via `fast-check`) | `packages/content/src/freshness.test.ts` | yes |
| `P05-SCORE-001` | Deterministic scoring: purity, replay checksum stability, `blank` vs technical absence, `structurally_invalid` is never learner failure, P4 conversion unreachable from seeded roles | `pnpm test:unit` | `packages/content/src/scoring.test.ts` | yes |
| `P05-SEED-001` | Seed CLI dry-run report, idempotent re-apply is a no-op, changed revision creates a successor, withdraw/quarantine/rollback paths, provenance/rights metadata present on every seed | `pnpm test:unit` (pure planner) + `pnpm test:integration` (applied) | `packages/infrastructure/src/content/seed-cli.test.ts` | partly |
| `P05-SCHEMA-001` | Stage 05 relations, constraints, immutability triggers, composite scope FKs, migration rehearsal **from a P03-seeded database** | `pnpm test:integration` | `packages/infrastructure/src/postgres/postgres.integration.test.ts` | no — `check:full` |
| `P05-IDEMPOTENCY-001` | The idempotency table of §7.2: exact retry returns the committed result; conflicting reuse rejected; reconnect never creates a second attempt, exposure or playback ordinal | `pnpm test:integration` + `pnpm test:unit` | receipts and `job_effect_receipts` assertions | partly |
| `P05-JOB-001` | `content_publication_v1` and `content_impact_recompute_v1`: dispatch, retry, cancel, quarantine on incompatible contract, exactly-once effect | `pnpm test:unit` | `apps/worker/src/index.unit.test.ts` | yes |
| `P05-EVIDENCE-001` | Evidence proposal → acceptance; initial validity classification; append-only assertions; targeted impact recompute with declared cardinality; unaffected projections unchanged; rights withdrawal leaves validity untouched | `pnpm test:integration` | impact/recompute assertions | no — `check:full` |
| `P05-CONTRACT-001` | Command/query schemas, RFC 9457 problems, `unsupported_contract_major`, additive minor compatibility with a Stage 04-era payload | `pnpm test:unit` | `packages/contracts/src/index.test.ts` | yes |
| `P05-AUTHZ-001` | New `AuthorizationAction` values, cross-scope denial, recent-auth requirement, worker/operator separation, UI hiding is not authorization | `pnpm test:unit` | `packages/application/src/index.test.ts` | yes |
| `P05-SECURITY-001` | No key-bearing field in any learner-safe payload; `SafeContentNode` rejects script/handler/embed/external-URL fixtures; media route requires authorization; telemetry field allowlist | `pnpm test:unit` | `packages/content/src/model.test.ts` + `apps/web/src/server/*.unit.test.ts` | yes |
| `P05-BOUNDARY-001` | The five-part Corpus boundary proof of `Architecture/10-…:430`: no Corpus client or credential reachable from `apps/web`; only the import worker holds it; outbound contract serialization **fails** (never strips) on any forbidden learner/profile field; a full attempt path records **zero Corpus calls and zero learner-data bytes**; egress denial recorded as a Stage 10 obligation, not claimed | `pnpm test:unit` (serialization + dependency assertion) and `pnpm test:integration` (zero-bytes fixture) | `packages/content/src/corpus-boundary.test.ts`, `scripts/check-boundaries.mjs` stdout, `postgres.integration.test.ts` | partly |
| `P05-LISTENING-001` | `ListeningPlan` pinning, play-ordinal authorization, H1-H3 allowed plays, transcript phase gating (P4 denied until block end), speed/seek outside plan loses the standard claim | `pnpm test:unit` + `pnpm test:e2e` | `packages/contracts/src/listening.test.ts`, `apps/web/tests/p05-runtime.spec.ts` | partly |
| `P05-MEDIA-001` | Media manifest completeness, digest verification, fake TTS byte determinism, digest mismatch rejects the cache and never falls back to "latest" | `pnpm test:unit` | `packages/content/src/media.test.ts` | yes |
| `P05-FOUNDATION-001` | Foundation-route checkpoints and resume; the 65-year planning horizon fact stored separately from the official 60; Auth0 presentation with no password fallback and no guest path; partial route is evidence building, never a placement claim | `pnpm test:unit` + `pnpm test:e2e` | `apps/web/src/server/frontend-data.unit.test.ts`, `apps/web/tests/p05-attempt.spec.ts` | partly |
| `P05-COMPONENT-001` | Additive design-system extensions render identical DOM at every pre-existing call site; new player/bank/match primitives expose correct roles, names and states | `pnpm test:unit` | `packages/design-system/src/index.test.tsx` | yes |
| `P05-CONTRAST-001` | Every new filled/bordered control meets 4.5:1 (text) and 3:1 (non-text) against **both** its light and its dark surface, numerically | `pnpm test:unit` | `packages/design-system/src/tokens.test.ts` | yes |
| `P05-COPY-001` | No pass-probability or unsupported-certainty language in any shipped string, API field, telemetry field or test name; the banned phrase "it still counts" appears nowhere; provider-neutral wording | `pnpm test:unit` | `packages/design-system/src/index.test.tsx` copy fixture | yes |
| `P05-EQUIV-001` | Pointer, keyboard select-then-place, number-key and assistive activation produce an identical canonical response and identical score for R1/R2/R3/SB1/SB2 | `pnpm test:unit` (adapter level) + `pnpm test:e2e` (browser level) | `packages/content/src/scoring.test.ts`, `apps/web/tests/p05-attempt.spec.ts` | partly |
| `P05-A11Y-001` | axe-core clean on every new route/state; keyboard-only completion of R1/R3/SB2/H2; focus order; sparse announcements; 44×44 targets; forced colors; reduced motion | `pnpm test:e2e` (all three Playwright projects) | `apps/web/tests/p05-attempt.spec.ts` | no — `check:full` |
| `P05-RSP-001` | 320 px reflow at 400 % text scale and 200 % zoom for the attempt, result and foundation routes across Chromium, Firefox and WebKit | `pnpm test:e2e` | `apps/web/tests/p05-attempt.spec.ts` | no — `check:full` |
| `P05-RECOVERY-001` | Network interruption mid-attempt; `submission_unknown` recovery by receipt query; duplicate submit; playback stall; content withdrawal after pin; session expiry mid-attempt preserving draft, elapsed time and conditions | `pnpm test:e2e` | `apps/web/tests/p05-runtime.spec.ts` | no — `check:full` |
| `P05-COMPAT-001` | Compatibility window accepts P03↔P05 revisions; checksum drift is detected **at the Stage 05 revision** (§8.2c); unknown contract major fails closed without reinterpretation; content withdrawal does not rewrite history | `pnpm test:unit` + `pnpm test:integration` | `packages/infrastructure/src/stage05.unit.test.ts` | partly |
| `P05-PERF-001` | Each Stage 05 client island stays under its declared gzip budget and the protected-route first load stays under 200 KiB | `pnpm check:web-budget` (extended to print per-island Stage 05 figures) | `scripts/check-web-budget.mjs` stdout | yes |
| `P05-SCOPE-001` | The Stage 05 allowed-path list accepts its planned surfaces and rejects plan/architecture/Design/snapshot drift; Stage 01-04 fixtures preserved | `pnpm test:scope` | `scripts/test-scope.mjs` stdout | yes |
| `P05-RELEASE-001` | The release manifest requires every `P05-*` id, carries the new `releaseAxes` and the new revision window, and still refuses a dirty worktree | `pnpm test:release` | `scripts/test-release-manifest.mjs` stdout | yes |

### 10.2 Making the ids real — three mandatory wiring steps

An allocated id is not real until all three are done:

1. **Schema.** Append every id above to `schemas/release-manifest.schema.json`
   → `properties.checks.required`. `scripts/release-manifest.mjs:11` derives `requiredChecks`
   directly from that array, and `checks.additionalProperties` is `false`, so the schema is the
   single source of truth.
2. **Producing command.** The command in the table must actually emit the id — Stage 03/04
   precedent is either a test title containing the id or a script's stdout line. For ids proved by
   `pnpm test:unit`, put the id in the `test(...)`/`describe(...)` **title**, matching how
   `check-design-coverage-ids.mjs` discovers ids.
3. **Manifest invocation.** `--check <ID>=<evidence-reference>`
   (`scripts/release-manifest.mjs:37`). Append the ids to the `for CHECK_ID in …` loops in
   `.github/workflows/ci.yml:283` and `.github/workflows/release-candidate.yml:94`.

`scripts/test-release-manifest.mjs` runs inside `pnpm check` (`test:release`) and **refuses a dirty
worktree**, so this machinery is exercised on every gate run, not only at release time. Execution
must commit before running `pnpm check`.

### 10.3 A blocking finding: the coverage id scanner only recognises `P04-*`

`scripts/check-design-coverage-ids.mjs:1` is:

```js
const checkIdPattern = /P04-[A-Z0-9]+-001/g;
```

`collectExecutableCoverageIds` uses it, and `validateCoverageManifest` throws
`Non-executable test mapping for <row>` if a row cites an id the scanner cannot find. **Therefore no
coverage row can cite a `P05-*` id today.** Two options:

- **(chosen)** Generalise the pattern to `/P0[0-9]-[A-Z0-9]+-001/g` and extend
  `scripts/check-design-coverage-ids.test.mjs` with a `P05-` positive fixture and a
  `P99-`/malformed negative. This is a strengthening: it lets the manifest keep proving that a
  cited test really exists, across stages.
- *(rejected)* Leave every Stage 05 coverage row citing only `P04-*` ids. Rejected because a row
  whose implementation is now proved by a Stage 05 test would cite a test that no longer covers it —
  a silent lie in the coverage manifest, which is the exact class of defect Stage 04's corrections
  were about.

### 10.4 Traceability — contract → test → check id

| Contract (05P responsibility) | Where it lives | Proving check ids |
|---|---|---|
| 1. Content manifest/schema, provenance/rights, compatibility/version pinning, immutable publication, quarantine/rejection, cache, withdrawal, audit | `packages/content/src/{model,rights,publication,impact}.ts`; `20260901_051`/`053`/`054` | `P05-CONTENT-001`, `P05-RIGHTS-001`, `P05-SCHEMA-001`, `P05-EVIDENCE-001`, `P05-COMPAT-001` |
| 1b. Corpus ingestion asynchronous, never a runtime dependency | `packages/content/src/fixtures/corpus`, worker importer, outbound request schemas | **`P05-BOUNDARY-001`**, `P05-CONTENT-001`, `P05-JOB-001` |
| 2. Legally safe seeded content | `packages/content/src/seed/**` + `provenance.md` | `P05-SEED-001`, `P05-RIGHTS-001` |
| 3. Shared attempt state machine, sequencing, server clock, autosave/checkpoint, submit/finalize, resume/expiry, scoring, evidence proposal/acceptance, retry/idempotency, correction | `packages/domain`, `packages/application`, `attempt-repository.ts`, `apps/web/src/app/api/v1/attempts/**` | `P05-DOMAIN-001`, `P05-IDEMPOTENCY-001`, `P05-SCORE-001`, `P05-EVIDENCE-001`, `P05-RECOVERY-001` |
| 4. Reading contracts and variants | `task-families.ts` R1/R2/R3, `ReadingRegion`, `AnswerChoice`, `MatchingPair` | `P05-CONTENT-001`, `P05-EQUIV-001`, `P05-COMPONENT-001`, `P05-A11Y-001` |
| 4. Language Elements contracts and variants | `task-families.ts` SB1/SB2, `LanguageElementsRegion`, `ClozeGap` | `P05-CONTENT-001`, `P05-EQUIV-001`, `P05-COMPONENT-001`, `P05-RSP-001` |
| 4. Listening: media, transcript policy, playback, buffering/failure, deterministic scoring | `media.ts`, `listening.ts`, `ListeningRegion`, playback routes | `P05-LISTENING-001`, `P05-MEDIA-001`, `P05-RECOVERY-001`, `P05-A11Y-001` |
| 5. Foundation/onboarding/profile checkpoints, 65-year horizon, mandatory Auth0 | `apps/web/src/app/(focused)/session/[id]`, `profile_facts` | `P05-FOUNDATION-001`, `P05-AUTHZ-001` |
| 6. Accepted outcomes append canonical evidence and update projections without rewriting history | evidence proposal transaction, `content_impact_recompute_v1` | `P05-EVIDENCE-001`, `P05-COMPAT-001` |
| 7. APIs, queries, caches, prefetch, route states, progressive enhancement, offline boundary, provider-neutral failure copy | `apps/web/src/app/api/v1/**`, islands, `SessionNotice` | `P05-CONTRACT-001`, `P05-PERF-001`, `P05-RECOVERY-001`, `P05-COPY-001` |
| 8. Seed/import tooling with validation report, dry-run, idempotency, rollback/withdrawal | `seed-cli.ts`, `docs/content-operations.md` | `P05-SEED-001` |
| 9. Unit/property/schema/golden, database, API, browser, a11y, timing, network-interruption, content-withdrawal, compatibility tests | all of the above | the whole `P05-*` set |
| 10. Thin vertical slice before full variants | §17 | slice-exit evidence in §17 |
| Cross-cutting: no pass probability | every layer | `P05-COPY-001` |
| Cross-cutting: no live Corpus or paid AI during an attempt | dependency assertion, outbound serialization guard, zero-bytes fixture, provider flags | `P05-BOUNDARY-001` (Corpus), `P05-RELEASE-001` (paid AI flags), `P05-CONTENT-001` |

---

## 11. Architecture-versus-Design conflicts and their resolutions

Resolved under the authority order in `prompts/implementation/README.md`. Each resolution names the
regression test that locks it.

| # | Conflict | Sources | Resolution | Locked by |
|---|---|---|---|---|
| 1 | Board 06 frame 6.2 says an interrupted attempt "it still counts" | `Design/Bestehen-06-…` 6.2 vs `DESIGN_REVIEW_NOTES` §8, `Architecture/06-…:210` | Architecture wins. Copy states what was preserved (draft, elapsed time, conditions), that the **server** determines validity, and the next action. The board is stale. | `P05-COPY-001` (banned-phrase assertion), `P05-RECOVERY-001` (mid-attempt expiry flow) |
| 2 | The boards define **no dark exemplars**, so any new filled control has no visual reference | `post-acceptance-corrections.md` §5 | Numeric contrast verification against both surfaces replaces the missing board (D19). A dark fix inverts the component's own fill/label pair, never a shared token. | `P05-CONTRAST-001` |
| 3 | `ListeningRegion` in the design system is a static placeholder with a bare `<audio preload="none">` and the copy "Audio controls are unavailable in this static preview" | `packages/design-system/src/components.tsx:1022-1033` vs `Architecture/16-…:437` | Architecture wins. A real accessible player with transport, remaining-plays text, and phase-gated transcript. The board frame CF-03-01 (3.1) remains the visual anchor and the anchor row keeps resolving because the export name is unchanged. | `P05-LISTENING-001`, `P05-A11Y-001`, `P05-COMPONENT-001` |
| 4 | Board `ClozeGap` renders a free-typing input; SB2 requires a **shared candidate bank with reuse-at-most-once** | `Design/Bestehen-06-…` 6.7 vs `Architecture/15-…:200-205` | Both are real and both ship: SB1 uses local per-gap options (three at target P4), SB2 uses the shared bank. `ClozeGap` is extended **additively** exactly as Stage 04 extended it, so every pre-existing call site renders identical DOM. | `P05-COMPONENT-001`, `P05-EQUIV-001` |
| 5 | Boards show drag-and-drop matching as the primary R1/R3 mechanic | `Design/Bestehen-02/06` vs `Architecture/15-…:453` | Architecture wins: **select-then-place is required and drag is optional**. Drag telemetry never changes the score. | `P05-EQUIV-001`, `P05-A11Y-001` |
| 6 | Board 03 D1 draws a full-height rail with the brand inside it; the shipped shell spans the header across the top | `Design/Bestehen-03-…` D1 vs `post-acceptance-corrections.md` §2 | **Owner decision after board comparison.** Do not "correct" it back. Stage 05 inherits the shipped shell unchanged. | existing `P04-VISUAL-001` anchors |
| 7 | C38's coverage anchor is named `ClozeTextPane` but targets `LanguageElementsRegion` | `post-acceptance-corrections.md` §5 | **Pre-existing and unresolved.** Stage 05 does **not** silently rename it: a rename would change the manifest row and mask the mismatch rather than resolving it. Recorded here so a later stage can resolve it deliberately. | recorded, not tested |
| 8 | Design implies immediate per-item feedback in practice; measured shared blocks must defer all feedback | `Design/Bestehen-02` 2.3 vs `Architecture/15-…:419` | Both, selected by the pinned form's `feedbackPolicy` (`immediate` \| `block_end`). Measured shared blocks do not enter Diagnose/Repair until the block is finalized. | `P05-CONTENT-001` (form composition), `P05-SCORE-001` |
| 9 | Design boards present a single "Attempt" archetype; architecture requires distinct focused shells for practice and measured mock | `Design/Bestehen-02` 2.2 / 4.4 vs `Architecture/15-…:467` | `AttemptShell` for practice, `MockShell` for measured blocks — both already exist. Stage 05 uses `AttemptShell` only; `MockShell` stays Stage 08's. | scope test in `P05-SCOPE-001` |
| 10 | Design copy for content unavailability reads as a learner-facing shortfall | `Design/Bestehen-05` 5.x vs `Architecture/08-…:497` | Architecture's reviewed template wins: "That is our content gap, not a result about you." Reason `FALLBACK.CONTENT_UNAVAILABLE`. | `P05-COPY-001` |

Two further constraints that are not conflicts but are easy to violate:

- **The boards are flat.** `--shadow-2` appears only on the browser-chrome mock that frames a
  desktop board. Do not add elevation to any Stage 05 card (`post-acceptance-corrections.md` §2).
- **A new view with an aside must choose its `contentSplit` deliberately.** The default is 2:1;
  `narrow-aside` is 7:5 and is required only by LG-D1. Stage 05's result view uses the default.

---

## 12. Design anchor coverage

### 12.1 What Stage 05 views correspond to

| Anchor | Frame | Stage 05 surface |
|---|---|---|
| `CF-02-02` | Board 02 · 2.2 | Reading attempt — `AttemptView` → `AttemptShell` + `ReadingRegion` |
| `CF-06-14` | Board 06 · 6.14 | Attempt within the foundation session |
| `CF-06-07` | Board 06 · 6.7 | Language Elements input — `LanguageElementsRegion` (`variant="input"`) |
| `CF-06-08` | Board 06 · 6.8 | Language Elements result — `LanguageElementsRegion` (`variant="result"`) |
| `CF-03-01` | Board 03 · 3.1 | Listening — `ListeningRegion` (now a real player) |
| `CF-01-03`, `CF-06-14` | 1.3, 6.14 | Foundation route — `SessionView` |
| `CF-01-04`, `CF-06-15` | 1.4, 6.15 | Result route — `ResultView` |
| `CF-02-03`, `CF-06-11` | 2.3, 6.11 | `ResultCard` |
| `CF-02-04` | 2.4 | `RepairCard` |
| `CF-02-05` | 2.5 | `FreshCheckBanner` — fresh-equivalent retry |
| `CF-02-06` | 2.6 | `WhatChangedSummary` |
| `CF-06-01`, `CF-06-02` | 6.1, 6.2 | `SessionNotice` — idle and **mid-attempt** expiry |
| `CF-05-02` | 5.2 | `SystemFailureBanner` — media failure, "This wasn't you" |
| `CF-05-05` | 5.5 | `StaleEvidenceNotice` |
| `LG-V4` | Board 06 · V4 | Language Elements two-column at 768+ — already pinned by the `language-768` visual anchor |
| `LG-D5` | Board 06 · D5 | `Overlay` responsive rule |
| Component families | — | `C02` AttemptShell, `C11` AnswerChoice, `C12` MatchingPair, `C13` ClozeGap, `C19` ResultCard, `C20` DecisiveEvidence, `C21` RepairCard, `C22` HintDisclosure, `C23` FreshCheckBanner, `C25` EvidenceLabel, `C28` PendingBanner, `C29` SystemFailureBanner, `C37` ReadingTextPane→`ReadingRegion`, `C38` ClozeTextPane→`LanguageElementsRegion`, `C39` AudioPlayer→`ListeningRegion` |

Stage 06 owns `LG-D3`, `CF-03-02`, `CF-03-03`, `CF-03-04`, `CF-05-01`, `CF-05-03`, `CF-06-09`,
`CF-06-10`, `C40` and `C41`. Stage 08 owns `CF-04-04`, `CF-04-05`, `LG-D4`, `C03` and `C35`. Stage
05 must leave all of those resolving exactly as they do today.

### 12.2 How `pnpm check:coverage` stays green

`scripts/check-design-coverage.mjs` enforces exact counts —
`compactFrames: 41`, `largeExemplars: 8`, `componentFamilies: 43`, `icons: 20`, and 37 board anchors
— plus a reciprocal, order-sensitive parity with the product's semantic unions. Rules Execution must
follow:

1. **Do not add or remove rows.** Stage 05 adds no new component family and no new icon; it extends
   existing families. Adding a 44th family fails the inventory assertion.
2. **Keep the export names.** Every row asserts `targetContents.includes(row.targetAnchor)` and that
   each `targetImplementationExports` name appears in the target file. So `ReadingRegion`,
   `LanguageElementsRegion`, `ListeningRegion`, `AnswerChoice`, `MatchingPair`, `ClozeGap`,
   `DecisiveEvidence` and the rest must keep both their names and their file. **Do not split
   `packages/design-system/src/components.tsx` into modules** unless every affected row's
   `targetPath` is re-pointed in the same change; splitting a 2,162-line file mid-stage is a
   gratuitous coverage risk. If a split is judged necessary, it is its own sequenced task.
3. **Re-point deliberately.** `apps/web/src/ui/archetypes.tsx` rows (`CF-01-02`, `CF-01-03`,
   `CF-01-04`, `CF-02-01`, `CF-02-02`, `CF-04-01`, `CF-04-03`, `CF-04-04`, `CF-06-03`, `CF-06-05`,
   `CF-06-14`, `CF-06-15`, `LG-D1`, `LG-D2`, `LG-D4`, `LG-V3`) survive because §6.7 keeps the
   archetype exports and keeps rendering them from fixtures in `(test)/ui-fixtures`. If Execution
   moves an archetype into a route file, that row's `targetPath` moves with it in the same commit.
4. **Claim the new semantic values.** Every new state in §7.5 and every new reason in §7.4 must be
   listed on at least one existing coverage row's `semanticStates`/`semanticReasons` array, or the
   check throws `Unclaimed …`. Natural homes: attempt/serving states on `CF-02-02` and `CF-03-01`;
   `VALIDITY.*` and `FALLBACK.MEDIA_UNAVAILABLE` on `CF-05-02`; `DIRECT.EXPOSED_FAMILY_PRACTICE` on
   `CF-02-05`; `UNCERTAINTY.KEY_VALIDATOR_DISAGREEMENT` on `CF-06-12`.
5. **Mirror the unions in order.** `expectedSchema.semanticStates`/`semanticReasons` in
   `check-design-coverage.mjs` must equal the product arrays **element for element, in order**
   (§8.3).
6. **Regenerate, never hand-edit.** `pnpm generate:coverage` writes
   `source-anchors.generated.json`; `validateCoverageManifest` compares it byte-for-byte to the typed
   manifest, and `pnpm check:generated` refuses tracked generated drift.
7. **`maximumTargetAnchorUses` is 5.** Re-pointing several rows onto one export can trip
   `Over-reused target anchor`. Current usage leaves headroom, but a re-point must check it.
8. **Generalise the id scanner** (§10.3) before any row cites a `P05-*` test.

### 12.3 Visual anchors

Nine visual anchors exist at `maxDiffPixelRatio: 0.0024`, in a pinned container
(`pnpm test:visual:container`). Stage 05 changes `ListeningRegion` and the attempt/result routes, so
some baselines **will** move.

Rule: a moved baseline is a signal to look, not to update. Execution must (a) confirm the diff is the
intended change, (b) regenerate with `pnpm test:visual:update` **in the pinned container**, and
(c) re-run a plain `pnpm test:visual:container` without `--update`, because a baseline that
regenerates is not a baseline that passes (`post-acceptance-corrections.md` §4.9). Snapshot
regeneration is an explicit orchestrator decision, recorded in the handoff with the before/after
frame names.

Two **new** anchors are proposed, following the `language-768` and `mock-1280` precedent of guarding
a numeric contract that nothing else holds:

- `listening-320` — the audio transport at 320 px / 400 % text scale, where the 44×44 target and the
  remaining-plays text compete for width;
- `reading-720` — the 720 px reading-measure ceiling of `Architecture/15-…:469`.

Adding anchors changes only `apps/web/tests/p04-visual.spec.ts` and its snapshot directory; it does
not touch the coverage inventory.

---

## 13. First-load budget analysis

### 13.1 The two budgets, and which one Stage 05 charges

`scripts/check-web-budget.mjs` enforces two independent ceilings, and conflating them is how the
"~4 KB" error entered the corrections doc.

| Budget | What it measures | Ceiling | Measured on `009d2c6` | Headroom |
|---|---|---:|---:|---:|
| **Protected-route first load** | `build-manifest` entries for `/(protected)/coach/page` **plus** the shared framework runtime (`rootMainFiles` + `polyfillFiles`) | `200 * 1024` = 204,800 B | 196,233 B gzip | **8,567 B** |
| **App-owned chunks** | every `.js` in `static/chunks` **minus** the framework runtime | `90 * 1024` = 92,160 B | 31,779 B gzip | 60,381 B |
| Per client island | each app-owned chunk individually | `60 * 1024` = 61,440 B | — | — |
| Design-system CSS | all `.css` in `static/chunks` | 51,200 B | 4,371 B | 46,829 B |

The **binding** constraint is 8,567 B of first-load headroom. The **roomy** one — and the one Stage
05's own code actually moves — is app-owned chunks, with 60,381 B free.

The two are not independent: an app-owned chunk that the *protected route* pulls in charges against
**both**. A chunk reachable only from `/attempt/[id]` or `/session/[id]` charges only against
app-owned chunks, because `protectedRouteFiles(build, routeManifest, "/(protected)/coach/page")`
resolves the coach route's entries specifically.

**Design consequence, stated as a rule Execution follows:** *no Stage 05 client island may be
imported by any `(protected)` route.* The three islands live under `/attempt/[id]`,
`/session/[id]` and the media route, all of which are in the `(focused)` group. `/coach`,
`/readiness`, `/train`, `/progress` and `/settings` stay server-only. If a Stage 05 component must
appear on a protected route, it ships as a server component.

### 13.2 Where client JavaScript is genuinely required, and what it costs

| Island | Why a server component cannot do it | Charged against | Declared budget |
|---|---|---|---:|
| `ObjectiveResponseIsland` | Selection/matching/bank state must update without a round trip, and the checkpoint outbox must survive a lost connection. A form POST per click would be unusable at 320 px and would lose the divergence-preservation contract. | app-owned only | ≤ 14 KB gzip |
| `AudioPlaybackIsland` | `Architecture/16-…:431` requires writing a **local start intent before invoking native play**, and recording stalls, visibility changes and device changes. None of that exists server-side. Digest verification of fetched bytes is also client-side. | app-owned only | ≤ 12 KB gzip |
| `AttemptClockIsland` | The timer display must tick and report visibility changes. It computes nothing authoritative — the server owns elapsed time (D09). | app-owned only | ≤ 3 KB gzip |

Total declared island budget: **≤ 29 KB gzip**, against 60,381 B of app-owned headroom, leaving
~31 KB of margin. Protected-route first load is **unchanged** by design, so the 8,567 B stays intact.

Techniques that keep these numbers honest:

- No new runtime dependency. The islands use React and the existing design-system components only.
  `pnpm check:lock` and `check-boundaries.mjs` already gate new dependencies.
- Zod schemas are **server-side only**; the islands post plain objects and the route validates.
  Pulling `zod` into a client bundle would be the single largest avoidable cost.
- Digest verification uses `crypto.subtle`, a platform API, not a library.
- Audio fixtures are fetched, not bundled.
- Icons stay in the existing compiled set (20 icons, 1,863 B gzip total).

### 13.3 What happens if a route exceeds the ceiling

In priority order, and Execution takes the first that works:

1. **Move state to the server.** Most candidate state (current gap, completeness, error summary) is
   derivable from the canonical response the server already holds.
2. **Split the island by task family** so a Reading attempt never downloads the SB2 bank logic or
   the audio player. Route-level code splitting is the default in the App Router; the risk is an
   accidental shared barrel import, so islands import from concrete modules, never from
   `@bestehen/design-system`'s barrel where a deep import would otherwise be needed —
   `check-boundaries.mjs` forbids deep workspace imports, so the correct fix is to keep the island
   small rather than to deep-import.
3. **Drop the enhancement, keep the contract.** Every island already has a working no-JavaScript
   path (D15). Shipping the server-rendered path for one mechanic is a real, honest option that
   costs interaction polish and nothing else.
4. **Stop and report.** If Reading, Language Elements and Listening cannot all fit, Execution stops
   the stage and reports the measured numbers rather than raising a ceiling. Raising a budget
   ceiling weakens an existing check and is forbidden by the common contract.

**Never acceptable:** raising `200 * 1024`, `90 * 1024` or `60 * 1024` in
`scripts/check-web-budget.mjs`.

### 13.4 Asset budgets

Seed audio is fetched at runtime, not bundled, so it does not charge any gzip budget. It does
consume repository size and the Docker build context. Budget: **≤ 250 KB total** for all Stage 05
audio fixtures — roughly 15-20 s of speech per Listening family at a low mono bitrate, encoded once
by the deterministic fake adapter. `check-assets.mjs` and `check-secrets.mjs` continue to gate what
lands in the repository; Execution adds an assertion that no audio fixture exceeds its per-file cap.

Fonts stay untouched at 262,144 B against a 307,200 B ceiling. **Self-hosted assets only — no
external font or CDN request** is introduced, and `P04-ASSET-001` continues to prove it.

---

## 14. Manual owner actions — verifiable gates, not assumptions

Each is a gate with an explicit verification step. None may be claimed as done without repository
evidence. Stage 05 completes everything that can be completed with fakes, fixtures and local
emulation; these gates are what remains genuinely external.

| Gate | Action | How Execution proceeds without it | Verification that it happened |
|---|---|---|---|
| `OWNER-05-A` — live TTS synthesis | Enable an EU-region TTS provider, audition German voices by voice release, run one batch synthesis, and human-audit the final bytes for names, numbers, dates, times, prices, abbreviations, negation/correction and speaker attribution (`Architecture/16-…:357`) | Deterministic fake adapter renders committed fixtures at approval level `training` only. `externalProviderCalls` stays `false`. | A `configured` `ProviderAdapter` reports `status: "ready"` from `pnpm check:providers`, **and** an `app.approval_decisions` row exists with a human auditor reference for each promoted media revision. Until then this gate is `[!]`. |
| `OWNER-05-B` — P4 content sign-off | Sign off a complete P4 form and its final assets. No automated promotion is permitted (`Architecture/09-…:195`) | No seed content is promoted above `training`/`independent_b1`. The P4 conversion path is implemented and unit-tested against a fixture blueprint but is unreachable from any seeded serving role. | An `app.approval_decisions` row at level `readiness_p4` signed for a complete `form_id`, plus a passing `P05-CONTENT-001` fixture that exercises it. |
| `OWNER-05-C` — independent key validation | Solve each seeded key **blind** to the proposed key and record the validator result, disagreement and release (`Architecture/09-…:294`) | The seed corpus records `independentValidatorResult: { status: "not_performed", reason: "owner gate OWNER-05-C" }`, and `validateForPublication` refuses `independent_b1` without a completed validation. Seed content publishes at `training` only. | Each seeded key carries a completed validator result with a distinct actor reference from the author. |
| `OWNER-05-D` — content rights/legal review | Jurisdiction-specific review of licence, quotation, trademark and takedown procedure before any direct-source (C1) use (`Architecture/09-…:583`) | Not on the critical path: all Stage 05 seed content is C3 App-original (D03). No C1 content is seeded. | A dated review note under `docs/` naming the jurisdiction and the reviewer. Not required for Stage 05 acceptance. |
| `OWNER-05-E` — manual accessibility run | Screen-reader (VoiceOver/NVDA) completion of R1/R3 matching, SB2 placement and an H2 Listening task; 200 % zoom and 320 px reflow on real devices | Automated axe-core, keyboard-only Playwright and forced-colors/reduced-motion runs across all three engines cover what automation can cover. | A dated manual script result recorded in the handoff. Stage 04 explicitly left the equivalent **unclaimed** because the connector could not exercise it; Stage 05 must be equally honest and not claim it silently. |
| `OWNER-05-F` — migration rehearsal on a realistic database | Apply the Stage 05 migrations to a database already seeded at `20260825_040_p03_foundation` with representative rows, then verify checksum parity and readiness | `pnpm test:integration` rehearses it against a container database in CI-equivalent conditions (`P05-COMPAT-001`). | Recorded `fromRevision`/`toRevision`/`applied` output in the handoff. |

Nothing here blocks Planning. `OWNER-05-A`, `-B`, `-C` and `-E` block specific *claims*, not the
stage: Stage 05 can be complete and honest with `training`-level content, fake-rendered audio and
automated accessibility evidence, provided the checklist says exactly that.

---

## 15. Rollback and compatibility strategy

### 15.1 Schema

- Migrations are **roll-forward only** — `immutableMigration`'s `down()` throws
  (`migrations.ts:369`). Stage 05 keeps that.
- The compatibility window (§8.1) keeps `minimum` at the P03 revision, so a **web/worker image
  rollback without a database rollback** is legal: the Stage 04 image reads a Stage 05 database and
  reports ready, because it only touches relations that still exist.
- Every Stage 05 table is **additive**. Modifications to Stage 03 relations are `ALTER TABLE …
  ADD COLUMN` (nullable or defaulted) plus two CHECK-constraint replacements. The
  `app.job_resources.kind` replacement strictly **widens** its accepted set. The `app.attempts.state`
  replacement does **not**: D06 renames `started`→`in_progress` and `completed`→`result_available`
  and removes `not_counted`. So the rollback guarantee for `app.attempts` is **read-compatible, not
  write-compatible** — a rolled-back Stage 04 image can read a Stage 05 database but must not create
  new attempts in it. This costs nothing real: Stage 04 shipped no attempt-creating path, so there is
  no Stage 04 write to preserve. Every other Stage 03 relation stays read- and write-compatible.
- Rolling *back* the database is not supported and is not needed: no Stage 05 migration destroys or
  narrows anything.

### 15.2 Content

- Content rollback selects the **prior approved content release** and never mutates already-served
  history (`Architecture/09-…:550`). `seed-cli --rollback <releaseId>` implements exactly that.
- A withdrawn or quarantined revision stops future serving. Past attempts still resolve their exact
  pinned text, item, key, rubric, media and form — that is the `ADR-0016` invariant and
  `P05-COMPAT-001` proves it with a "serve, withdraw, re-read the old attempt" fixture.
- **Rights withdrawal does not change validity**; a content defect does. Two code paths, one test
  each (D12).

### 15.3 Contracts

- API stays on major 1. Every new field is optional or defaulted; a Stage 04-era payload still
  parses (`P05-CONTRACT-001`).
- A client that sees an unknown consequential state or reason renders `update_required` /
  `unavailable` and **never guesses** (`isSupportedUiProjection` already implements the check).
- `reason-registry/v1.1` is a minor bump. Old assertions keep pointing at `reason-registry/v1`; the
  FK `(reason_registry_id, reason_code)` makes a stale code impossible to reference from a new row
  and a new code impossible to backfill onto an old release.

### 15.4 Repository and evidence

- Everything is left **uncommitted** by Planning; the orchestrator reviews the diff and commits.
- If a Stage 05 change moves a `p04-visual` baseline, Execution reports the frames and the reason;
  it does not update snapshots on its own authority (§12.3).
- If a Stage 05 change would require weakening any existing check — a budget ceiling, a coverage
  count, a contrast threshold, a scope allowlist — Execution **stops the stage and reports**. That
  is a plan failure, not a gate problem.

---

## 16. Risks

Ordered by how much damage they do if unmanaged.

| # | Risk | Why it is likely | Mitigation |
|---|---|---|---|
| R1 | **Coverage/union parity breaks `pnpm check` late and confusingly.** Adding one reason code silently requires four coordinated edits (§8.3, §12.2 rule 4-5), and the failure message points at the coverage manifest rather than the cause. | The coupling is real, undocumented outside this plan, and the union order is compared with `join("|")`. | T1 owns every union and lands first; T11 mirrors them into `check-design-coverage.mjs` last, once they are final, so the two edits are never half-applied. Document the four-step recipe in the handoff. |
| R2 | **First-load budget is exceeded and the fix is architectural, not cosmetic.** 8,567 B is thin, and a single accidental import of a client component into a `(protected)` route pulls a whole island into the first load. | Next's client-boundary rules are easy to trip; a shared `archetypes.tsx` import is exactly the shape that would do it. | The rule in §13.1: no Stage 05 island is imported by a `(protected)` route. Measure with `pnpm check:web-budget` after **every** island lands, not once at the end. The escalation ladder is §13.3. |
| R3 | **Scope drift.** Stage 05 touches nine packages and the live scope gate is inert on `main` (§4.3). Nothing stops an Execution agent editing Stage 06 or Stage 08 surfaces. | The inert gate is precisely the guard that would have caught it. | `stage05Allowed` plus `test-scope.mjs` fixtures make the allowlist a contract test that runs on every `pnpm check`. The orchestrator reviews the diff against §6. `WritingRegion`, `SpeakingRegion`, `MockShell` and `MockOutcome` are named as untouchable. |
| R4 | **Concurrent agents silently auto-merge one file, or typecheck against a half-written package.** In Stage 04, three agents editing one stylesheet in parallel worktrees auto-merged without conflict and defeated review. | `components.tsx` (2,162 lines), `styles.css`, `migrations.ts`, `domain/src/index.ts` and `check-scope.mjs` are each wanted by several Stage 05 tasks; and file-disjoint tasks can still be type-coupled (§18.2). | **Retired as a live risk by the orchestrator's serial-execution decision** (§18.2): one subagent at a time, orchestrator review and gates between tasks. The shared-file map is kept as the rationale for the order and as the diff checklist. |
| R5 | **Deterministic fake TTS is not actually deterministic across platforms.** Float rounding or an encoder version difference changes bytes, so `mediaRevisionDigest` moves and `check:generated` goes red on someone else's machine. | Audio encoding is a classic source of platform variance. | Generate fixtures **once**, commit them, and make the adapter's job at test time to *verify* the digest rather than to re-render. Re-rendering is an explicit `--regenerate` flag with a container-pinned procedure, mirroring the visual-baseline discipline. |
| R6 | **Evidence semantics quietly drift into "missing means zero".** The most damaging possible defect: it silently converts a system fault into a learner failure. | Every aggregation is a place to write `?? 0`. | `value_or_absence` is a discriminated union everywhere (`Architecture/06-…:334`); the scorer's `blank` vs technical-absence distinction has a dedicated test; `P05-COPY-001` scans for pass-probability language; the fault-to-state matrix of `Architecture/06-…:258-268` becomes a table-driven test. |
| R7 | **Migration checksum drift on an existing database.** Editing an existing SQL source, or forgetting to upsert the full checksum map in the Stage 05 terminal migration, bricks readiness on any already-migrated database. | The rule is invisible unless you read `verifyMigrationChecksums`. | §8.2 states it explicitly; `P05-COMPAT-001` rehearses from a P03-seeded database, not an empty one; the latent skip-defect (§8.2c) is fixed so drift is actually observable. |
| R8 | **Timer and playback integrity are over-claimed.** A paused tab or a suspended device produces a "clean" target claim that was never clean. | Browser timing APIs invite exactly this. | D09's conservative reconstruction (`ADR-0029`): unknown integrity → `interrupted` for the affected scope, valid practice at actual conditions, never a wrong answer. `P05-RECOVERY-001` exercises background/visibility transitions. |
| R9 | **Seed content is too small to exercise freshness and exhaustion.** With one family per task family, "no fresh equivalent" is the only reachable state and the fresh-retry path is never proven. | Authoring German content is slow and it is tempting to seed one of each. | D03 mandates **two** families per task family plus quarantine and withdrawal fixtures, so immediate-retry, delayed-transfer and exhaustion are all reachable. `P05-FRESH-001` asserts each state is reached. |
| R10 | **Accessibility regressions appear only in Firefox or WebKit.** Stage 04 found a real cross-browser bug (`size` as an intrinsic width floor) that a Chromium-only run hid. | Playwright's default single-project run. | `P05-A11Y-001` and `P05-RSP-001` run **all three** projects. Recorded as a hard requirement, not a preference. |
| R11 | **The `05E` diff becomes too large to review.** Nine packages, three new job kinds, a new schema and three skills. | Genuine breadth. | §17's thin vertical slice lands first and is reviewed on its own. §18 splits Execution into thirteen bounded tasks with explicit file sets. |
| R12 | **CI credits are spent unintentionally.** `on: pull_request:` has no branch filter. | Opening any PR triggers the full workflow. | Stage 05 opens **no** pull request and does **not** add its branch to the push trigger list (§4.3). Verification is local: `pnpm check`, then `pnpm test:integration`, `pnpm test:e2e`, `pnpm test:visual:container`. |

---

## 17. Execution order and the thin vertical slice

### 17.1 Slice 0 — the thin vertical slice (lands and is reviewed before any variant work)

**Goal:** one Reading R2 item, end to end, on the real runtime, with real evidence.

Path: seed one R2 content family → publish it at `training` through the real gates → acquire a
serving manifest → create an attempt → apply one `set_selection` operation → checkpoint → submit →
score deterministically → append an evidence observation and its initial validity assertion →
enqueue and run the projection rebuild → render the result route with validity, outcome and decisive
evidence.

**Deliberately excluded from Slice 0:** R1/R3 matching, SB1/SB2, all of Listening, media, the
foundation route, assistance/exposure recording, impact and withdrawal, and the client islands.
Slice 0 is server-rendered with a plain form POST, so it also proves the progressive-enhancement
path before any JavaScript exists.

**Slice 0 exit evidence (all must be green before Slice 1 starts):**

- `pnpm check` exit 0 on a committed tree.
- `P05-DOMAIN-001`, `P05-CONTENT-001`, `P05-SCORE-001`, `P05-CONTRACT-001`, `P05-AUTHZ-001`,
  `P05-SEED-001` (dry-run half), `P05-SCOPE-001`, `P05-RELEASE-001` passing.
- `pnpm test:integration` green, including a migration rehearsal from a P03-seeded database
  (`P05-SCHEMA-001`, `P05-IDEMPOTENCY-001`, `P05-EVIDENCE-001`).
- `pnpm check:web-budget` printing a protected-route first load **not larger than 196,233 B**.
- One end-to-end Playwright walk of the R2 attempt with JavaScript **disabled**.

If Slice 0 cannot be made green, the stage stops and reports. Everything after it is variant work on
a proven runtime.

### 17.2 Slices 1-5

| Slice | Adds | Per-skill completion evidence |
|---|---|---|
| **1 — Reading complete** | R1 heading matching and R3 situation/notice matching, the select-then-place primitives, `ObjectiveResponseIsland`, assistance and exposure recording, `FreshCheckBanner` fresh-equivalent retry | `P05-EQUIV-001` (pointer = keyboard = AT, identical score, all three engines), `P05-A11Y-001` and `P05-RSP-001` for the Reading attempt and result, `P05-FRESH-001` reaching `first_attempt`, `immediate_retry` and `repeated_exposed_practice` |
| **2 — Language Elements complete** | SB1 local-option cloze and SB2 shared bank with reuse-at-most-once, `ClozeGap` additive extension, the LG-V4 768 px arrangement preserved | `P05-COMPONENT-001` (every pre-existing `ClozeGap` call site renders identical DOM), `P05-EQUIV-001` for SB2 placement, the `language-768` visual anchor still passing without `--update` |
| **3 — Listening complete** | Media manifest, fake TTS fixtures, object-authorization route, `ListeningPlan`, preflight receipt, playback occurrences, transcript phase gate, `AudioPlaybackIsland`, real `ListeningRegion` | `P05-LISTENING-001`, `P05-MEDIA-001`, `P05-A11Y-001` for the player, `P05-RECOVERY-001` for stall/digest-mismatch/late-asset, `P05-CONTRAST-001` for the transport controls in dark |
| **4 — Foundation route and profile checkpoints** | `/session/[id]` five-skill sequence with Writing/Speaking as honest `unavailable` blocks, the four profile fact kinds, resume, `AttemptClockIsland` | `P05-FOUNDATION-001`, and a resume test proving a partial route is evidence building and never a placement claim |
| **5 — Content lifecycle and recovery** | Quarantine, rights withdrawal, replacement, impact assertions, targeted recompute, the full failure matrix, session-expiry copy | `P05-EVIDENCE-001` (declared vs actual selector cardinality; unaffected projections byte-identical), `P05-RECOVERY-001`, `P05-COPY-001` |

Every slice ends with `pnpm check` green on a committed tree plus the slice's own evidence. A slice
that cannot go green is reported before the next one starts.

---

## 18. Proposed execution split

The orchestrator makes the final call; this is file-level input. **"Top-tier synthesis"** means novel
contract design, recovery semantics, or evidence/validity reasoning where a wrong decision is
expensive and hard to detect. **"Well-specified implementation"** means building against a contract
this plan has already decided.

### 18.1 Tasks

T1 below is the orchestrator's merge of this plan's original T1 and T2. Task numbers T3-T13 keep
their original identifiers so every cross-reference in §6 stays valid; there is deliberately no T2.

| # | Task | Files owned | Slice | Judgement needed |
|---|---|---|---|---|
| T1 | **Semantic spine (merged T1+T2 by orchestrator decision):** domain unions and transition guards; contracts and the UI projection unions; application ports, authorization and `classifyInitialValidity` | `packages/domain/src/index{,.test}.ts`, `packages/contracts/src/{index,ui-projections}{,.test}.ts`, `packages/application/src/index{,.test}.ts` | 0 | **Top-tier.** The state machines, the class/approval matrix and `classifyInitialValidity` are the stage's semantic spine, and the union-order coupling of §8.3 is subtle. Merged because T2 depended wholly on T1, both are small and dense, and splitting them would have put the §8.3 four-step recipe across two agents. |
| T3 | Content model, task families, keys, rights, accessibility manifest, digest | `packages/content/src/{model,task-families,keys,rights,accessibility,digest}.ts` + tests | 0 | **Top-tier** for `rights.ts` and `keys.ts`; the rest is well-specified once the pseudotypes are transcribed. |
| T4 | Publication gates, scoring, freshness, impact | `packages/content/src/{publication,scoring,freshness,impact}.ts` + tests | 0/5 | **Top-tier.** Scoring purity, the `blank` vs absence distinction and the freshness table are exactly where a plausible shortcut becomes a learner penalty. |
| T5 | Listening: media model, contracts, TTS fake, object authorizer, playback routes, `AudioPlaybackIsland`, `ListeningRegion` | `packages/content/src/media.ts`, `packages/contracts/src/listening{,.test}.ts`, `packages/infrastructure/src/media/**`, `apps/web/src/app/api/v1/listening-plans/**`, `playback-occurrences/**`, `media/[id]/route.ts`, `apps/web/src/ui/islands/audio-playback.tsx` | 3 | **Top-tier** for the playback/preflight/transcript semantics; the adapter and routes are well-specified. |
| T6 | Seed corpus, Corpus bundle fixture, seed CLI, content-operations runbook | `packages/content/src/seed/**`, `fixtures/corpus/**`, `packages/infrastructure/src/content/seed-cli.ts`, `docs/content-operations.md` | 0/1/2/3 | **Well-specified**, but the German authoring is slow and quality-sensitive. Provenance and rights metadata are non-negotiable. |
| T7 | Content migrations, content repository, jobs, worker handlers, content API routes, the §8.2c defect fix | `packages/infrastructure/src/postgres/{migrations,content-repository,index}.ts`, `src/jobs/index.ts`, `src/stage05.unit.test.ts`, `apps/worker/src/index{,.unit.test}.ts`, `apps/web/src/app/api/v1/content/**` | 0/5 | **Top-tier** for the migration-compatibility and impact-recompute design; the repository SQL is well-specified. |
| T8 | Attempt repository and the evidence-proposal transaction | `packages/infrastructure/src/postgres/attempt-repository.ts`, the Stage 05 half of `postgres.integration.test.ts` | 0 | **Top-tier.** One transaction writes submission, outcome, facts, observation and initial assertion; getting the boundary or the idempotency wrong is silent and expensive. |
| T9 | Design-system components, styles, contrast tests | `packages/design-system/src/{components.tsx,contracts.ts,styles.css,tokens.test.ts,index.test.tsx}` | 1/2/3 | **Well-specified** against the boards and the corrections doc — but the dark-contrast work is unforgiving and needs numeric verification, not judgement. |
| T10 | Attempt/result/session routes, command API routes, `ObjectiveResponseIsland`, `AttemptClockIsland`, `frontend-data.ts`, archetypes | `apps/web/src/app/(focused)/**`, `api/v1/{attempts,serving-manifests}/**`, `src/ui/islands/{objective-response,attempt-clock}.tsx`, `src/ui/archetypes.tsx`, `src/server/frontend-data.ts` | 0/1/2/4 | **Well-specified** against §7, with one genuine judgement call: the progressive-enhancement boundary. |
| T11 | Gates and release wiring: scope, coverage schema/ids, release manifest, workflows, configuration, docs | `scripts/{check-scope,test-scope,check-design-coverage,check-design-coverage-ids,check-design-coverage-ids.test,release-manifest,test-release-manifest,check-web-budget}.mjs`, `schemas/release-manifest.schema.json`, `.github/workflows/*.yml`, `packages/configuration/src/index.ts`, `docs/configuration.md`, `packages/design-system/src/coverage/**` | all | **Well-specified**, and highly coupling-sensitive. Best done by one agent that holds the whole gate picture. |
| T12 | Browser, accessibility, responsive and recovery tests | `apps/web/tests/p05-*.spec.ts`, new visual anchors in `p04-visual.spec.ts` | 1-5 | **Well-specified.** Must run all three Playwright projects. |
| T13 | Handoff | `Implementation/Personal/05-content-deterministic-runtime/handoff.md` | end | **Written by the orchestrator, not a subagent** — the orchestrator holds the verification record (which gates it ran, at which commit, with which observed outcome), and a subagent writing the handoff could only restate claims it cannot independently verify. Must record what was *not* claimed: `OWNER-05-A/B/C/E` and the §9.2 item 3 egress obligation. |

### 18.2 Sequencing — Execution runs strictly one task at a time

**Orchestrator decision, overriding this plan's original parallel waves.** All Execution tasks run
**one subagent at a time** on local `main`. Each task commits its own small commits; the orchestrator
reviews the diff and runs the gates between tasks. Recorded reasons:

1. **Every agent works in the same checkout.** Parallel agents without worktrees collide
   destructively; with worktrees they hit the silent auto-merge that defeated Stage 04 review —
   three agents in one stylesheet, no conflict, no review. Neither outcome is acceptable, and no
   CI-spend pressure is forcing speed here.
2. **File-level disjointness is necessary but not sufficient.** This plan's original wave B put T7
   and T3 in parallel because their file sets do not intersect. They are nonetheless coupled through
   *types*: T7 owns `apps/web/src/app/api/v1/content/**`, which imports the content package that T3
   is concurrently authoring. Both agents would run `pnpm typecheck` against a half-written package
   and get failures that belong to neither of them. **Disjoint files, coupled types.** Any future
   parallelism proposal must clear the type graph, not only the file list.

The table below is therefore the **rationale for the serial ordering**, not a concurrency permit. It
still earns its place: it names which tasks want which file, which is exactly what determines the
order and what the orchestrator diffs against.

**Shared-file map.** These files are wanted by more than one task, so the order below is what keeps
each one single-writer at any moment.

| File | Wanted by | Rule |
|---|---|---|
| `packages/domain/src/index.ts` | T1, and read by everything | T1 lands first. No other task edits it. |
| `packages/contracts/src/index.ts` | T1, T5 | T1 lands first; T5 adds `listening.ts` as a **separate module** and touches the barrel in one small edit at step 9. |
| `packages/contracts/src/ui-projections.ts` | T1 only | T1 owns the union order. T11 mirrors it into `check-design-coverage.mjs` at step 10, after every union is final. |
| `packages/content/src/index.ts` (barrel) | T3, T4, T5, T6 | Sequence T3 → T4 → T5 → T6; each appends its own export line. |
| `packages/infrastructure/src/postgres/migrations.ts` | T7 only | T8's schema needs live in T7's `attemptRuntimeSql`. T7 lands before T8 starts. |
| `packages/infrastructure/src/postgres/index.ts` | T7 only | Includes the §8.2c defect fix. |
| `packages/infrastructure/src/postgres/postgres.integration.test.ts` | T7, T8 | T7 adds content relations; T8 adds attempt/evidence. **Sequential.** |
| `packages/design-system/src/components.tsx` | T5, T9 | **The Stage 04 failure file class.** T9 owns it exclusively at step 7 and implements the player; T5 at step 9 consumes it and does not edit it. Never both. |
| `packages/design-system/src/styles.css` | T9 only | Exclusive. Three agents in one stylesheet is the documented Stage 04 defeat. |
| `apps/web/src/ui/archetypes.tsx` | T10 only | T5's Listening region reaches it through the design-system export. |
| `apps/web/src/app/api/v1/**` | T5, T7, T10 | Disjoint subtrees (`listening-plans`/`playback-occurrences` · `content` · `attempts`/`serving-manifests`). Disjoint files, but each imports the content package, so they are ordered T7 (step 4) → T10 (step 8) → T5 (step 9), all after T1 fixes the envelope. This is the concrete case of "disjoint files, coupled types" above. |
| `scripts/**`, `schemas/release-manifest.schema.json`, `.github/workflows/**` | T11 only | Exclusive. Every other task **reports** the check id it needs and the boundary rule it wants; T11 wires them at step 10. |
| `packages/design-system/src/coverage/**` | T11 only, at step 10 | Regenerated, never hand-edited. Requires T1's final unions and T9's final export names. |
| `apps/web/tests/p04-visual.spec.ts` + snapshots | T12 only, at step 11 | Snapshot regeneration is an orchestrator decision. |

**Serial execution order.** One subagent at a time, orchestrator review and gates between each.

| Step | Task | Why it sits here |
|---:|---|---|
| 1 | **T1** — semantic spine (domain + contracts + application ports) | Everything imports it. Nothing else can typecheck until the unions and ports exist. |
| 2 | **T3** — content model, task families, keys, rights, accessibility, digest | The content types that T4, T5, T6 and T7 all build on. Must precede T7, which imports them through the content API routes. |
| 3 | **T4** — publication gates, scoring, freshness, impact | Needs T3's model; T8's evidence transaction needs T4's scorer. |
| 4 | **T7** — migrations, content repository, jobs, worker handlers, content API routes, the §8.2c fix | Needs T3/T4 to typecheck. Must precede T8, whose schema lives in T7's `attemptRuntimeSql`. |
| 5 | **T8** — attempt repository and the evidence-proposal transaction | Needs T7's schema and T4's scorer. Appends to `postgres.integration.test.ts` after T7. |
| 6 | **T6** — seed corpus, Corpus bundle fixture and request schemas, seed CLI, runbook | Needs T3's types and T7's CLI surface. Produces the audio fixtures T5 consumes and the boundary rule T11 wires. |
| 7 | **T9** — design-system components, styles, contrast tests | Single writer for `components.tsx` and `styles.css` across the whole stage. Consolidated from the original two-part split, since serialization removes the reason for splitting it. |
| 8 | **T10** — attempt/result/session routes, command API routes, response and clock islands, archetypes | Needs T1's contracts, T8's repository and T9's components. |
| 9 | **T5** — Listening: media model, contracts, TTS fake, object authorizer, playback routes, audio island | Needs T6's audio fixtures and T9's player component. Last of the feature work, matching slice 3. |
| 10 | **T11** — all gate wiring: scope, coverage schema and ids, release manifest, workflows, configuration, docs, the Corpus dependency assertion | Every check id must already have a producing command. Wiring one earlier would create exactly the placeholder evidence the common contract forbids. |
| 11 | **T12** — browser, accessibility, responsive and recovery tests; new visual anchors | Exercises the finished surface; snapshot decisions come last. |
| 12 | **T13** — handoff, written by the orchestrator | Needs the complete verification record. |

The order preserves every dependency constraint from the shared-file map above: T1 before all; T3 →
T4 → T7 → T8; T6 before T5 (audio fixtures) and before T11 (boundary rule); T9 before T10 and T5;
T11 after every producing command; T12 last before the handoff.

Slice mapping is unchanged (§17): Slice 0 completes within steps 1-5 plus the first pass of T6 and
T10; slices 1-2 land in T9/T10; slice 3 in T5; slices 4-5 across T10 and T7. The slice-exit evidence
in §17.1 is still what gates progress, independently of task boundaries.

### 18.3 Model recommendation per task

| Tier | Tasks | Reason |
|---|---|---|
| **Top-tier synthesis** | T1 (merged spine), T4, T7, T8, and the semantics half of T5 | Novel contract design, evidence/validity semantics, migration compatibility, recovery behaviour. A wrong decision here is silent, expensive, and only surfaces as a learner penalty or a bricked readiness check. T7 additionally owns the D06 data disposition and the §8.2c fix. |
| **Mid-tier, well-specified** | T3 (transcription of decided pseudotypes), T9, T10, the adapter/route half of T5, T12 | The contract is already decided by this plan; the work is careful implementation against it, with tests that say when it is wrong. |
| **Lower-tier, mechanical but coupling-sensitive** | T6 (bulk authoring against a fixed rights/provenance template, plus the forbidden-field schemas), T11 (wiring) | High volume, low ambiguity. T11 is mechanical but must be done by **one** agent holding the whole gate picture, because its four-step union recipe (§8.3) fails confusingly when partially applied. |
| **Not a subagent** | T13 | Written by the orchestrator, which holds the verification record. |

Rough sizing, for orchestrator planning only: T1 small and dense; T3-T4 medium; T6 large in volume;
T7-T8 medium and risky; T9-T10 medium; T5 large; T11-T12 medium. Because execution is serial, these
sizes are the schedule rather than a packing problem.

---

## 19. Definition of Done

Stage 05 Execution is done when **all** of the following hold. Each is checkable from the repository.

### 19.1 Product behaviour

1. Reading (R1, R2, R3), Language Elements (SB1, SB2) and Listening (H1, H2, H3) each complete end
   to end: acquire manifest → attempt → checkpoint → submit → deterministic score → evidence
   observation with an initial validity assertion → projection rebuild → result view.
2. **No live Corpus call and no paid or productive AI call occurs during an active attempt.** These
   are two boundaries with two different proofs, and the manifest flags only prove the second.
   - *Paid/productive AI:* `externalProviderCalls: false` and `paidProductiveProcessing: false` in
     the release manifest, and the whole attempt path passing with every provider adapter set to
     `fake`.
   - *Corpus:* the five-part proof of `Architecture/10-…:430` — no Corpus client or credential
     reachable from `apps/web`; only the import worker holds it; outbound contract serialization
     **fails** on any forbidden learner or profile field rather than stripping it; an instrumented
     transport records **zero Corpus calls and zero learner-data bytes** across a full practice
     attempt and the P4/mock and readiness paths that exist in Stage 05. Egress denial of the Corpus
     publication host is a Stage 10 deployment obligation and is recorded in the handoff as
     **unclaimed**, not silently satisfied by the absence of a live host. `P05-BOUNDARY-001`.
3. Content publication, versioning, quarantine, rights withdrawal, replacement and audit agree with
   evidence: a withdrawn revision stops serving; an already-served attempt still resolves its exact
   pinned material; a rights-only withdrawal changes no validity assertion; a content defect changes
   exactly the affected scope and no unaffected projection.
4. The foundation route captures the owner's profile checkpoints including the **65-year planning
   horizon**, stored separately from the official 60-year target, behind Auth0 Universal Login with
   email OTP, closed registration and no password fallback.
5. Timing, playback, assistance, exposure, freshness and independence are recorded as **facts** and
   interpreted separately as claims. Hiding a timer never pauses the clock. An extra replay or an
   altered speed remains valid practice at actual conditions and cannot satisfy a target claim.
6. Every asynchronous state has explicit pending, retry, failure and recovery behaviour, and every
   retryable mutation and job is idempotent.
7. No pass-probability or unsupported-certainty language exists in any copy, API field, telemetry
   field or test name. Missing numeric estimates are **absent**, never zero.
8. Later Writing/Speaking and readiness stages can extend the same attempt and evidence contracts:
   the attempt runtime, checkpoint protocol, submission command, evidence proposal and validity
   model are skill-agnostic, and the only skill-specific surfaces are the task-family adapter, the
   key/rubric shape and the playback plan.

### 19.2 Gates

9. `pnpm check` exits 0 on a **committed** tree (`test:release` refuses a dirty worktree).
10. `pnpm test:integration`, `pnpm test:e2e` across Chromium, Firefox **and** WebKit, and
    `pnpm test:visual:container` (plain, without `--update`, after any regeneration) all pass.
11. `pnpm check:web-budget` passes with the protected-route first load **not larger than
    196,233 B gzip**, and every Stage 05 client island under its declared budget.
12. `pnpm check:coverage` passes with the inventory unchanged at 43 component families, 20 icons,
    41 compact frames, 8 large-screen exemplars and 37 board anchors, and with every new semantic
    state and reason claimed by a row and mirrored in order into `check-design-coverage.mjs`.
13. `pnpm test:scope` passes with the Stage 05 fixtures and every Stage 01-04 fixture preserved.
14. `pnpm test:release` passes with every `P05-*` id in `checks.required`, the new `releaseAxes`
    (`application: "stage-05-runtime"`, `content: "stage-05-content-v1"`, `evaluation` and `model`
    still `"not-produced"`), and the new `database` revision window.
15. **No existing test or check was weakened.** No budget ceiling raised, no coverage count lowered,
    no contrast threshold relaxed, no scope allowlist broadened beyond §6, no snapshot updated
    without an explicit recorded decision.

### 19.3 Evidence and honesty

16. Every `P05-*` id has a producing command that actually emits it, a schema entry that requires it,
    and a manifest invocation that carries it.
17. The seed corpus records provenance and rights metadata for every revision, contains no restricted
    exam source bytes, and is labelled "Bestehen practice" with no implied provider endorsement.
18. No secret exists in code, fixtures, logs, telemetry or artifacts. `pnpm check:secrets` passes.
19. `handoff.md` records delivered scope, commits, tests with their **observed** outcomes, migrations,
    operations, owner gates, known limitations and next-stage inputs — and states plainly what was
    **not** claimed, specifically the `OWNER-05-A/B/C/E` gates.
20. The `05E` checklist line carries relative evidence paths, the commit, and the `P05-*` ids. Only
    the orchestrator promotes it to `[x]`.

---

## 20. What this Planning worker did not do

- Did not create, switch, merge, rebase, reset or push any branch; opened no pull request; ran no
  `gh` command; committed nothing.
- Did not run `pnpm build`, `pnpm check`, `pnpm test:*`, `pnpm generate:coverage` or any Docker
  command. Every measured number in this plan was supplied by the orchestrator and is attributed as
  such in §2.2.
- Did not create or modify any `.ts`, `.tsx`, `.mjs`, `.css`, `.json`, `.sql` or workflow file.
- Did not edit anything under `Architecture/` or `Design/`, nor any other stage's `plan.md` or
  `handoff.md`, nor any visual snapshot.
- Did not set the `05P` checklist line to `[x]`.
