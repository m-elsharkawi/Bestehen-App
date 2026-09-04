# Stage 05 orchestration log

The evidence trail behind Stage 05. Every gate result here was run by the
**orchestrator**, at a named commit, and observed directly. Subagent-reported
outcomes are not recorded as evidence — several did not reproduce.

Baseline: local `main` `009d2c62`, which is ahead of a stale `origin/main`
`c966c4b4` and carries the Stage 04 follow-up corrections
(`post-acceptance-corrections.md`). `main` has never been pushed and no pull
request has been opened, because the owner is holding GitHub Actions spend.

## Task ledger

| Step | Task | Model | Status | Commits |
|---:|---|---|---|---|
| — | 05P Planning | Opus | **Accepted** after one rejection (4 defects) | `d56adbe`, `3382938` |
| 1 | T1 semantic spine (merged T1+T2) | Opus | **Accepted** | `8673374`,`cd38355`,`0c802a6`,`ab639e4` |
| 1b | design-system union sync (unplanned) | Sonnet | **Accepted** | `3a47475`,`ffb6d93` |
| 2 | T3 content model | Opus | **Accepted** | `74117e5`,`a05c620`,`7ccbc0a`,`de83c63`,`4cfc428`,`9f3ee8a` |
| 3 | T4 publication/scoring/freshness/impact | Opus | **Accepted** | `f38c423`,`11c15b6`,`a879a93`,`9dd0095`,`72a4e5c` |
| 4a | T7a migrations + schema + config window | Opus | **Accepted** | `87e66a7`,`328b6c6`,`6bec882`,`d661cb6` |
| 4b | T7b (died) + orchestrator salvage | Opus | **Accepted** | `d343647`,`4a0057c`,`1083bdf`,`37d6f6a` |
| 4c | T7c repo tests, worker handlers, content routes | Opus | **Accepted** | `3e1e750`,`4eafb8c`,`8c321a5`,`a7c3fa0`,`f1d5401` |
| 5 | T8 attempt repo + evidence transaction | Opus | **Accepted** after one rejection | `e8a4522`,`5e75745`,`d2590ce`,`7474ae7` |
| 6 | T6 seed corpus + boundary | Opus + continuation worker | **Accepted implementation**, seed remains draft/candidate | `a9bbec7` through `332559a` |
| 7 | T9 design-system components | continuation model not retained in this log | **Accepted** | `cd23b55`, `7cd9f23`, `c3af737` |
| 8 | T10 routes + islands + archetypes | GPT-5.6 Terra high, Sol high recovery/exposure, Terra high presentation correction | **Accepted implementation**; T12 authenticated browser evidence remains | `43a9251` through `2ff7251` |
| 9 | T5 Listening | GPT-5.6 Sol high | resumed with bounded server/media slice after exposure correction | dispatch `888c989`, resumed below |
| 10 | T11 gate wiring | — | not started | |
| 11 | T12 browser/a11y/responsive tests | — | not started | |
| 12 | T13 handoff | orchestrator | not started | |

## Orchestrator-run gate results

| Commit | Command | Observed |
|---|---|---|
| `009d2c62` | `pnpm check` | exit 0. 218 tests/18 files. `P04-COVERAGE-001` 37/41/8/43/20. `P04-PERF-001` 196,233 B gzip. `check:scope` printed "Stage 01 scope is not applicable on main." |
| `ffb6d93` | `pnpm test:unit` | 1 failed / 252 passed (253) — known-red only |
| `9f3ee8a` | lint/format/typecheck/boundaries/lock | all pass; `pnpm test:unit` 1/345 |
| `72a4e5c` | as above | 1 failed / 482 passed (483) |
| `f1d5401` | **`pnpm test:integration` on PINNED `postgres:18.6`** | **9/9**. `SELECT version()` = "PostgreSQL 18.6 (Debian 18.6-1.pgdg12+2)" |
| `f1d5401` | **`pnpm test:process` on pinned 18.6** | **3/3** |
| `f1d5401` | check:assets/lock/secrets/providers/test:release/build/web-budget/generated | all PASS; build exit 0; **196,549 B gzip** |
| `7474ae7` | `pnpm test:integration` x6 consecutive | **19/19 every run** |
| `a9bbec7` | `pnpm test:unit` | 1 failed / 651 passed (652) — known-red only |

## The known-red baseline

`pnpm test:unit` has **exactly one** expected failure until T11 lands:

    scripts/check-design-coverage-ids.test.mjs > semantic union parity with the
    product sources > holds between the checker copy and the real contracts and
    domain unions

Cause: `expectedSchema.semanticStates` is hardcoded at
`scripts/check-design-coverage.mjs:37` and must mirror the product union, **and**
every declared value must be *claimed by a coverage row* (lines 462-468) whose
`targetPath`/`targetAnchor` resolve to a real file (lines 417-437). Those files do
not exist until T9/T10. This is why T11 is last and why it cannot be fixed earlier.

**After every task, assert the failing set is EXACTLY this one.** Anything else is
new breakage attributable to that task.

## `pnpm check` cannot be green until T11 — and it hides things

`pnpm check` is a `&&` chain that halts at `check:coverage`. Everything after it
(`test:unit`, `test:release`, `build`, `check:web-budget`, `check:generated`) is
**never reached**. Running `pnpm check` alone would leave build, budget and release
regressions invisible. **Until T11, run those five individually.**

## Budget tracking — the binding constraint

`scripts/check-web-budget.mjs` ceiling is `200 * 1024` = **204,800 B**, binary.

| Commit | Protected first load | Headroom | Stage 05 consumed |
|---|---|---|---|
| `009d2c62` baseline | 196,233 B | 8,567 B | 0 |
| `f1d5401` | 196,549 B | 8,251 B | 316 B |

`post-acceptance-corrections.md` §5 says "~4 KB" of headroom. **That figure is
wrong** — it treated 200 KB as decimal 200,000. The true baseline headroom is
8,567 B. The second budget (App-owned chunks, 90 KiB, ~60 KB free) is roomy and is
the one Stage 05's own code moves.

**Rule:** no Stage 05 client island may be imported by a `(protected)` route.
`protectedRouteFiles(build, routeManifest, "/(protected)/coach/page")` measures the
coach route specifically, so `(focused)`-only islands charge the roomy budget only.

## Defects found in the accepted plan (all corrected)

1. **05P rejected once** for four defects: the `app.attempts` state reconciliation
   undercounted (six new states, not four) and left `not_counted` with no data
   disposition; D06 overclaimed fidelity to the sixteen-state `Architecture/15`
   §6.1 diagram while implementing eleven; the Corpus boundary proof omitted the
   outbound serialization guard and the zero-bytes fixture; the parallel execution
   waves were replaced by a serial order.
2. **T3** found the plan's `keys.ts` "server-only" row **over-broad**.
   `Architecture/15-…:337` and `:548` make decisive evidence, distractor rationale
   and cause **learner-facing after submission** (Stage 04 ships `C20
   DecisiveEvidence`). Branding them server-only would have blocked the result view.
3. **T4** found `Architecture/15-…` §5.5 lists `outcome_id`/`scored_at` on the
   `OriginalObjectiveOutcome` pseudotype while the same section defines scoring as
   a pure function of four inputs. The pseudotype describes the persisted record,
   not the function return. Both moved to the write site.
4. **Orchestrator** found a plan sequencing defect: `packages/configuration`
   §110-111 pins the schema window to p03 at both ends and the plan assigned that
   file to T11 (step 10), but T7 (step 4) needs it bumped or its own integration
   tests cannot pass. Reassigned narrowly to T7a.
5. **T7a's rehearsal** found D06's stated migration order **cannot run**:
   `in_progress`/`result_available` are not in the Stage 03 union, so the first
   `UPDATE` fails 23514 while the old CHECK stands. Corrected to drop → rewrite →
   add.
6. **Orchestrator** found `classifyInitialValidity` legitimately emits whole-scope
   `pending` with empty `unaffected`, which `migrations.ts:186`'s CHECK rejected.
   T7a widened only the `pending` arm; `partially_valid` with no partition still
   fails.

## Orchestrator decisions of record

- **Fail-closed stands; the plan is wrong, not the code.** Plan §15.1 claimed a
  rolled-back Stage 04 image reads a Stage 05 database and reports ready. It cannot
  — it resolves the observed revision against its own compile-time
  `Object.keys(foundationMigrations)` and fails closed, and `verifyMigrationChecksums`
  demands exact set equality. **Consequence, which must reach the handoff and Stage
  10: rolling back the image is NOT sufficient. A Stage 05 → Stage 04 rollback
  requires a database restore to the Stage 03 revision.**
- **`reason-registry/v1` frozen at 43 codes.** Migration `010`'s seed iterated the
  live registry, so a fresh database got 54 codes while a migrated one had 43 — a
  release identity varying by migration date is not immutable. Safe to freeze
  because the `seed?:` callback is not part of the checksummed source.
- **Execution runs strictly serially.** Every agent shares one checkout; and the
  plan's own wave B was type-coupled (T7's content API routes import T3's package),
  so file-level disjointness was necessary but not sufficient. Recorded in plan
  §18.2 as "disjoint files, coupled types".
- **T13 (handoff) is written by the orchestrator**, not a subagent — only the
  orchestrator holds the verification record.

## Standing review item: order-dependence

**Three independent instances in three files.** Treat any positional assertion over
a query result as suspect, and treat a first-run green on a `randomUUID()` fixture
as carrying far less information than it appears to.

1. **T7c** — `content-repository.ts` `assertServable` was row-order dependent
   (`LEFT JOIN` + `new Map(rows.map(...))`); a revision surviving a release
   rotation belongs to both the retired and active release. Its own first test
   passed by luck of planner order; it added a release-rollback step specifically
   to make the bug reproducible.
2. **T8 test** — asserted positional order from `readDecisiveEvidence`, which is
   `ORDER BY content_item_id` over random UUIDs. ~50% flake. T8 reported 19/19
   three times; the orchestrator's first independent run failed.
3. **T8 repository (found by the sweep the rejection forced)** —
   `submitObjectiveAttempt` echoed the caller's array order on `created` but read
   `ORDER BY content_item_id` on `replayed`, so the same command returned the same
   submission in two different orders. A client reconciling a retry would read that
   as a changed outcome: the "replay is indistinguishable from the original"
   contract, broken and invisible half the time.

Do not "fix" such a test with `arrayContaining` or sort-then-compare — both still
pass when the value is attached to the wrong entity. Key the assertion to the row's
identity.

## Package boundary correction

`scripts/check-boundaries.mjs:10` sets
`infrastructure: ["domain","contracts","application","configuration"]` — **no
`content`**. An orchestrator brief wrongly told T8 to call
`findKeyBearingFields`/`assertNoKeyBearingFields` from `packages/content` in the
repository. T8 correctly refused and proved something stronger at the relation
level: the pre-submission path issues exactly one statement, against
`app.attempt_submissions`, and never names `app.key_revisions`. **T10 lives in
`apps/web`, which may depend on both, and must carry that guard instead.**

## Environment

- Toolchain: `export PATH=/Users/sharkawi/Developer/Bestehen/.toolchains/node-v24.19.0-darwin-arm64/bin:$PATH`
  Node 24.19.0, pnpm 11.23.0.
- **Docker registry access was broken and the owner restored it.** Confirmed three
  ways at the time (zero-byte pulls, BuildKit hanging at "load metadata"). Both
  pinned images now pull: `node:24.19.0-bookworm-slim@sha256:a9f5f7c9…` and
  `postgres:18.6-bookworm@sha256:1c59e2c3…`.
- Integration container that works:
  `docker run -d --name <name> -e POSTGRES_USER=bestehen_local -e POSTGRES_PASSWORD=bestehen_local -e POSTGRES_DB=bestehen_local -p 55434:5432 postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af`
  then `export TEST_DATABASE_URL="postgresql://bestehen_local:bestehen_local@127.0.0.1:55434/bestehen_local"`.
  **The role name is load-bearing** — `withSyntheticDatabaseUnavailable` accepts
  only `bestehen_ci`/`bestehen_local` as controller.
- Disk has swung 31 → 14 → 43 → 30 Gi. `docker image prune -f` and
  `docker builder prune -af` reclaim 0 B; everything Docker reports as
  "reclaimable" is the owner's other-project images and volumes. **Never**
  `docker image prune -a`, `docker volume prune`, or delete `Docker.raw`.
- **Never delete `bestehen-p04-visual:local`.**

## Owner gates still unclaimed

`OWNER-05-A` live TTS · `OWNER-05-B` P4 sign-off · `OWNER-05-C` independent blind
key validation · `OWNER-05-E` manual screen-reader run · plus the
`Architecture/10-…` §9.2 item 3 **egress-denial** obligation, deferred to Stage 10
because the absence of a live Corpus host is not proof of a policy.

`OWNER-05-F` (re-run integration on the pinned 18.6) was raised and then **retired**
— the orchestrator ran it locally once registry access returned. It must not appear
in the handoff.

## Continuation acceptance — T6 seed corpus and operations

T6 was salvaged from the six untracked seed sources and accepted at
`332559aa9a13d004fd097110eae96cab9a2a835b` after four corrective returns. The
accepted slice is eleven additive commits from `ac2960f` through `332559a`:

- 16 serving draft families plus two negative lifecycle fixtures;
- 18 immutable revision graphs, 106 items and server-only key revisions, 108
  recorded gate facts, rights/accessibility facts and 22 deterministic fake-audio
  manifests;
- the package-neutral generated `release.json`;
- local and PostgreSQL seed adapters with dry-run/report/apply, withdrawal,
  quarantine, rollback and immutable operation receipts;
- `pnpm --filter @bestehen/infrastructure content:seed` and the operations runbook.

No seed claims independent key validation or launch human review. All serving
entries remain `draft`/database `candidate`; OWNER-05-A/B/C remain unclaimed.

### Defects rejected before T6 acceptance

1. The first pass marked generated keys publishable and named a system process as
   reviewer even though Architecture 09 requires independent validation and launch
   human review. The corpus was returned to honest draft/candidate state.
2. The first CLI only planned a local catalogue and emitted an incomplete release
   document. It did not apply the complete graph to PostgreSQL.
3. Withdrawal/quarantine/rollback were not idempotent and rewrote rights/revision
   state directly. They now append successor rights, approval decisions and impact
   assertions, then update only current projection pointers.
4. `ON CONFLICT DO NOTHING` accepted immutable identity conflicts, operation time
   contaminated the semantic idempotency digest, and a whole report was hidden in
   `security_audit_events.target_class`. Exact entity comparisons and audit-shaped
   receipts replaced those shortcuts.
5. The replay query selected nonexistent `app.content_revisions.recorded_at`; the
   fake SQL client invented the column. Exact mixed replay now uses one real
   `content_revision` audit fact per apply action.
6. Candidate selection depended on unordered query rows and mixed unrelated
   `release_identity` leaves. Current revisions/releases now derive from scoped
   predecessor leaves with cardinality failures.
7. Exact replay named a predecessor as `currentRevisionId` for an unchanged
   successor. Action-specific reconstruction and a whole-report regression fixed it.
8. The first real PostgreSQL withdrawal failed with SQLSTATE 22023 because
   `String(Date)` produced `GMT+0200`, which PostgreSQL rejected as `timestamptz`.
   Database timestamps are now normalized to canonical ISO instants before reports
   or lifecycle bindings.

### Independent evidence at `332559a`

- Targeted seed tests: **26/26**.
- `format:check`, `lint`, `typecheck`, `check:boundaries`, `check:assets`,
  `check:lock`, `check:secrets`, `check:providers`, `test:release`, `build`,
  `check:web-budget`, `check:generated`: **PASS** with Node 24.19.0. The generated
  release is over Biome's 1 MiB scan limit and produces a warning, not a failure.
- `test:unit`: **1 failed / 677 passed (678)**, exactly the known coverage-parity
  failure.
- Protected first-load budget: **196,549 B gzip**, 8,251 B below the 204,800 B
  ceiling.
- `test:integration`: **19/19 three consecutive independent runs** on the pinned
  PostgreSQL 18.6 image.
- Fresh migrated database exercise: apply created 16 serving drafts; two apply
  replays were byte-identical; withdrawal and quarantine each succeeded and
  replayed byte-identically. SQL inspection found 18 families/revisions, 106
  items/keys, 108 gate results, one candidate release and 18 release entries.
- Append-only proof: the original rights row remained `current`; its linked
  successor was `withdrawn`; granted `retired`/`quarantine` decisions and
  `serving_only` impacts were appended; revision projections pointed to those new
  facts; `validity_assertions=0` and `content_impact_targets=0`.

The two disposable verification databases and temporary report directory were
removed after inspection. The compose PostgreSQL service remains healthy for the
remaining Stage 05 gates. `apps/web/.next` was removed and the tree was clean at
the T6 acceptance boundary. Local `main` was 63 commits ahead of stale
`origin/main`; nothing was pushed and no pull request was opened.

## Continuation acceptance — T9 deterministic learning design primitives

T9 was accepted at `c3af7375f56945c55ddd56dc898729a40ddd493c` after one
corrective return. The accepted slice is three commits:

- `cd23b55` — additive runtime contracts and controls for answer choice,
  select-then-place matching, SB2 shared-bank cloze, decisive evidence and
  listening presentation;
- `7cd9f23` — unique accessible labels for multiple listening regions;
- `c3af737` — contrast assertions bound to the shipped CSS roles, complete SB2
  placement coverage and prohibited-copy coverage.

The five-file single-writer boundary remained intact. Existing no-prop call sites
retain byte-equivalent DOM, cards remain flat, transcript content is rendered only
when the server contract supplies an available transcript, and the runtime
controls use native fieldsets, radios and buttons with named state.

### Defects rejected before T9 acceptance

1. The first contrast test asserted a detached hard-coded palette rather than the
   component roles in `styles.css`. Numerically checking the actual dark surface
   found unselected control boundaries at only 1.317–1.826:1, below the 3:1
   non-text requirement. Component-owned light/dark fill, label and boundary pairs
   replaced the wrong roles; the test now parses the shipped CSS and includes a
   mutation guard that makes a real boundary fail.
2. The first pass left SB2 gap 4 as the legacy free-input control, so a shared-bank
   item mixed two response models. The shared contract now reaches all four
   rendered gaps, and the test proves the SB2 path contains no text input while the
   legacy fixture remains byte-equivalent.
3. One history mark was rendered without a matching state, and prohibited-copy
   coverage checked selected components rather than the shipped UI source. Both
   were corrected before acceptance.

### Independent evidence at `c3af737`

- `tokens.test.ts` plus `index.test.tsx`: **28/28**.
- Actual light/dark role ratios: unselected control text **15.974/14.062** and
  boundary **7.352/7.720**; selected/transport text **14.092/16.796** and boundary
  **15.974/14.062**; match/history text **9.494/7.343** and boundary
  **11.249/11.051**. All exceed 4.5:1 text and 3:1 non-text.
- `format:check`, `lint`, `typecheck`, `check:boundaries`, `test:release`, `build`
  and `check:generated`: **PASS**. The existing generated-release Biome warning
  remains non-failing.
- `test:unit`: **1 failed / 686 passed (687)**, exactly the known
  coverage-parity failure.
- Protected first-load budget: **198,062 B gzip**, 6,738 B below the 204,800 B
  ceiling.
- Disposable rendered gallery inspected in the in-app browser at large and 390 px
  compact widths in both light and dark themes. Selected/unselected choices,
  matching, shared-bank cloze, available/unavailable listening, transcript gating
  and decisive evidence were legible and structurally intact. A radio interaction
  changed the controlled selection exactly once. No repository fixture or visual
  snapshot was added or regenerated.

The disposable preview, local server and `apps/web/.next` were removed after
inspection. The committed tree was clean at the T9 acceptance boundary. Local
`main` was 67 commits ahead of stale `origin/main`; nothing was pushed and no pull
request was opened.

## Continuation acceptance — T10 focused deterministic runtime

T10 was accepted at `01bbae5d719adeb2430db0d20a08604f700b12d5` after replacing
one incomplete mid-tier pass with a top-tier recovery and then returning the
recovery once for rendered UI defects. The accepted slice is nine commits from
`43a9251` through `01bbae5`:

- scoped attempt and result projection reads, with learner-payload key-field
  rejection at the App boundary;
- a deterministic application composition service for exact pinned learner
  material, canonical response checkpoints, server-derived attempt conditions,
  deterministic scoring and the T8 atomic submission transaction;
- versioned manifest, create, checkpoint, submit, assistance and exposure command
  routes, including stable opaque-wire-operation-to-UUID mapping;
- real focused Reading/Language Elements attempt and result routes with a plain
  server-action form that remains usable without JavaScript;
- focused-only objective-response and attempt-clock islands, with no import from a
  `(protected)` route;
- the resumable five-skill foundation route, fixed Reading → Language Elements →
  Listening order, separate 65-year planning and official 60-year facts, append-only
  target/access/progress facts, and honest Writing/Speaking unavailability.

The plan exposed a missing seam rather than a missing table: T1 supplied wire
contracts and T7/T8 supplied repositories, but neither composed a command into the
exact pinned material, canonical operations, server-observed conditions, scoring
policy and one-transaction submission. That application seam was added without a
migration or state-union change. T10 narrowly extended the T8 content/attempt
repositories with reads and the checkpoint transaction needed by that seam; this
was accepted as the smallest correction to the plan's file split.

### Defects rejected before T10 acceptance

1. The initial mid-tier pass stopped after projection reads and reported root
   `pnpm typecheck` green. Root references did not cover `apps/web`; an explicit
   `tsc -p apps/web/tsconfig.json --noEmit` exposed five errors. The partial commit
   remained in history and was corrected forward; no history was rewritten.
2. The first recovery split checkpoint coordinates from their canonical response
   fact across transactions. A crash could therefore acknowledge a checkpoint that
   submission could not reconstruct. The repository now commits both together and
   tests rollback, replay, divergence and bounded legacy repair.
3. Browser timer observations were initially too authoritative. The server now
   derives integrity from server elapsed time, target duration, monotonic elapsed,
   skew, visibility and stall observations; missing or inconsistent evidence fails
   to a narrower validity claim.
4. A shared-archetype import would have charged focused islands to protected
   routes. The runtime view moved to a focused-only module; the protected first-load
   budget confirms the boundary.
5. The manifest response omitted allowed digest-only key references and did not
   parse the checked schema. It now validates the whole manifest while returning
   only digests, never key payloads.
6. Opaque non-UUID operation tokens would have reached PostgreSQL UUID columns and
   failed with SQLSTATE 22P02. They now map deterministically to UUIDs; repeated
   wire tokens map identically.
7. Independent dark/390 px inspection found browser-default submit buttons,
   collapsed access-preference labels, an overlapping save control and raw
   `FALLBACK.CONTENT_UNAVAILABLE` syntax in learner copy. Existing
   design-system `NativeButton`, `.field` and fieldset roles fixed the layout
   without touching T9-exclusive files; the registry reason remains in the
   projection but not in learner text.
8. The recovery agent reported Docker Desktop stopped. Independent `docker info`
   and a real pinned PostgreSQL container proved it was running, so the database
   evidence was completed rather than deferred.

### Independent evidence at `01bbae5`

- T10 pre-correction targeted server/repository/rendered set: **110/110** at
  `0a77660`. The corrected rendered tests were independently rerun **2/2** at
  `01bbae5`. The earlier combined 112/112 claim double-counted an existing test
  and is corrected here; it was not a separately observed combined run.
- `format:check`, `lint`, root `typecheck`, forced `apps/web` typecheck,
  `check:boundaries`, `test:release`, `build`, `check:web-budget` and
  `check:generated`: **PASS** with the pinned Node 24.19.0 toolchain. The existing
  generated-release Biome warning remains non-failing.
- `test:unit`: **1 failed / 717 passed (718)**, exactly the known coverage-parity
  failure.
- Protected first-load budget: **198,141 B gzip**, 6,659 B below the 204,800 B
  ceiling; no ceiling changed. This was measured after the control correction;
  source review found no protected-route island import. The precise cause of the
  79 B increase from T9 was not isolated.
- `test:integration`: **19/19 three consecutive independent runs** on a disposable
  PostgreSQL 18.6 container using the pinned toolchain. These runs are schema and
  repository regression evidence; the full browser command walk remains assigned
  to T12 and is not claimed here.
- Independent rendered inspection of the corrected Foundation view at 390×844 in
  dark mode found no horizontal overflow or console error, no raw fallback code,
  four distinct 44 px preference rows, and three 44 px primary actions. The result
  ordering was also inspected: validity → outcome → decisive evidence → rationale
  → cause → repair.

The disposable preview is recoverable from Trash. The disposable PostgreSQL
container and `apps/web/.next` are removed after this log commit. Local `main` was
77 commits ahead of stale `origin/main` at the T10 production boundary; nothing was
pushed and no pull request was opened.

### T10 acceptance reopened — recovery audit

The T10 acceptance above was too broad and is reopened before T5 implementation.
The orchestrator's deeper source/render audit found four missing obligations:

- `ObjectiveResponseIsland` only changed a status string; it had no durable
  checkpoint outbox, acknowledged response restoration or network-loss recovery.
- `AttemptClockIsland` only displayed elapsed time; it did not report monotonic,
  visibility, stall or wall-clock observations required by D09/D15.
- `submitObjectiveForm` rejected zero operations and every choice was `required`,
  so an intentional all-blank submission could not reach the scorer's valid blank
  semantics.
- `FoundationRuntimeView` passed `availableComplete + 1` to the zero-based
  `Sequence` contract. With Reading complete, it falsely labelled Language
  Elements complete and Listening current while offering Language Elements.

T5 was paused before editing. The same T10 recovery agent is returned to these
obligations before T5 resumes. Existing test/build/budget evidence above remains
true, but it is not evidence of completed recovery behavior. T12 must verify the
finished implementation; it must not become the owner of missing production code.

### Recovery continuation review at `d7979b9`, 2026-09-04

The continuing orchestrator inspected the inherited work before resuming one
GPT-5.6 Sol high worker. The scope remained T10 recovery, not a fresh runtime.
The following commits are banked, but T10 is not yet reaccepted:

- `4a574ab`: real-database command composition proof, deliberate blank support,
  recovery query, and transactional submission correction. The domain forbids
  `checkpointed -> submitted`; submission now follows the permitted resume arc.
  A logical refusal late in the transaction now rolls back inserted outcome,
  evidence, receipt and job rows rather than committing a partial result.
- `01ab4bd`: recovery version, checkpoint coordinates and submission are read in
  one PostgreSQL statement. The orchestrator found that separate pool reads could
  combine an old attempt version with newly committed response rows. A real-PG
  interleaving regression proves the single-snapshot result.
- `0cc2f75`: Foundation's displayed current step agrees with its Continue action.
- `d7979b9`: durable local response and submission intents, raw clock observations,
  explicit blank confirmation, preserved server-action failures, human-readable
  branch comparison, and native/numeric input parity tests for all five written
  families.

The orchestrator returned further defects during review. Network reconciliation
originally serialized local writes, so a hung request could prevent a later edit
from reaching IndexedDB. Submission intent also needed durable capture independent
of that request. Editing after a final intent now freezes that response snapshot.
The first conflict comparison showed raw operation JSON and internal IDs; it now
uses per-item learner labels and selects the acknowledged checkpoint by identity.
Clock reporter tests exercise actual observation collection rather than only the
server's interpretation of fabricated observations.

Independent commands at clean `d7979b9`, using pinned Node 24.19.0/pnpm 11.23.0:

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`,
  `pnpm exec tsc -p apps/web/tsconfig.json --noEmit`,
  `pnpm check:boundaries`, `pnpm test:release`, `pnpm build`,
  `pnpm check:web-budget`, `pnpm check:generated`: **PASS**. The existing oversized
  generated seed JSON formatting/lint warning remains non-failing.
- `pnpm test:unit`: **1 failed / 753 passed (754)**. The failing set is exactly
  the known coverage semantic-union parity test.
- `TEST_DATABASE_URL=<disposable-local-db> pnpm test:integration`: **21/21** in
  three consecutive independent runs. The two new command-composition tests use
  synthetic pinned material and verify both answered and deliberate-blank paths,
  exact retries, rollback after late refusal and no external calls. This is not
  evidence of seed approval or live owner completion.
- `pnpm exec vitest --run --config test-results/t10-recovery/vitest.config.ts`:
  **1/1**. This ignored diagnostic exercises the actual island and IndexedDB in
  Chromium against a fake HTTP server, including offline/session-expiry reload
  and lost submit acknowledgement. It is not T12 cross-browser or no-JS evidence.
- Protected first load **198,141 B gzip**, App-owned chunks **41,556 B gzip**,
  CSS **5,031 B gzip**. No ceiling changed.
- Independently rebuilt the temporary styled island preview and inspected its
  390 px dark conflict screen. Fonts loaded and scroll width was exactly 390 px.
  An empty `.sticky-action` bar overlaps the first conflict-choice button. This
  remains a rendering defect to correct before acceptance.

Two further review items remain open. The worker flagged an async digest/write
interleaving in checkpoint acknowledgement; source inspection confirms a later
draft can be marked acknowledged by an older digest comparison. A targeted
regression is required. Separately, the result page's generic `readable()` helper
does not consume the importer's actual `{ refs, rationale }` decisive-evidence
object or rationale arrays. Authored feedback can fall back to generic text.
That result-contract correction will be a separate bounded T10 follow-up.

No full `pnpm check`, full browser suite, visual-container suite, process or OCI
acceptance is claimed by this review. Docker is running. The orchestrator owns
the disposable PostgreSQL container `bestehen-t10-orchestrator-0904` on port
55435; the owner's existing database and other containers were not changed.
The temporary preview on 3306 was stopped. `.next` remains for the next review
gates and must be removed at task cleanup. Local main is 83 commits ahead of stale
origin/main at this production boundary; no push or pull request occurred.

### Recovery corrections independently reviewed at `5d408fc`, 2026-09-04

The orchestrator read the actual changes from `3ada955` through `5d408fc`.
`e425e95` guards acknowledgement and restoration against a newer local draft
revision inside the serialized write callback. `52b0850` adds an opt-out for the
empty action bar, preserving the default shell DOM. `129b9cc` renders submission
freeze state and tests stable restoration. `5d408fc` removes an unused digest
override. The worker reported that the acknowledgement regressions fail against
the old implementation; that mutation run was not independently observed.

Independent evidence on the committed tree, pinned Node 24.19.0/pnpm 11.23.0:

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`,
  `pnpm exec tsc -p apps/web/tsconfig.json --noEmit`, `pnpm check:boundaries`,
  `pnpm test:release`: PASS. The existing oversized generated JSON warning remains.
- `pnpm test:unit`: **1 failed / 761 passed (762)**, exactly the known coverage
  semantic-union parity failure.
- `pnpm build`, `pnpm check:web-budget`, `pnpm check:generated`: PASS on the
  independent serial rerun. The first build failed because `.next` was moved to
  Trash during verification. Unit tests also ran concurrently with that first
  build. No gate may be reported green from that run. Builds, unit tests and
  artifact cleanup must not overlap.
- Protected first load **198,157 B gzip**, app-owned chunks **41,753 B gzip**,
  CSS **5,031 B gzip**. The ceiling remains 204,800 B.
- `TEST_DATABASE_URL=<disposable-local-db> pnpm test:integration`: **21/21 in
  three consecutive independent runs**. `pnpm test:process` with that same
  database: **3/3** after the rebuild. Its earlier web timeout with incomplete
  build output is not a pass.
- The ignored actual-island/IndexedDB diagnostic: **1/1** in Chromium. Rebuilt
  styled conflict preview in Chromium, Firefox and WebKit, light and dark at
  390 px: no horizontal overflow, no empty sticky bar, three 44 px buttons and
  no page errors. The orchestrator inspected the corrected dark screenshot.
- `pnpm test:visual:container`: **1/1**, pinned Chromium, existing responsive
  anchors unchanged. No snapshots were regenerated.
- `pnpm test:e2e`: **3 failed / 63 passed / 3 skipped**. Every engine fails
  `P04-ROUTE-001`: `/attempt/synthetic` now holds `/attempt/synthetic` through
  authentication instead of the legacy `/attempt/current`. The skipped cases
  are the container-only visual test. This is a real regression requiring a
  compatibility decision and correction, not permission to weaken the test.

T10 remains open. Besides the result importer/projection mismatch already noted,
the attempt view omits the pinned instruction and does not mark German learning
material with its language under the English document root. The conflict actions
also need separation using existing layout classes. A bounded presentation and
route-compatibility task follows before T5. No T12 runtime end-to-end, OCI, owner
approval or full-stage acceptance is claimed. Local main is 88 commits ahead of
stale origin/main at this production boundary. Nothing was pushed.

### T10 presentation and recovery reaccepted at `7c380fe`, 2026-09-04

The orchestrator independently reviewed `9a5686b`, `916b53d`, `a5440a4` and
`7c380fe`. GPT-5.6 Terra high handled this bounded presentation correction after
Sol high completed the transactional recovery work. T10 implementation is now
accepted. T12 still owns the full authenticated runtime browser evidence.

`9a5686b` replaces the generic result reader with a projection of the importer's
actual evidence references and rationale arrays. It joins committed item IDs to
pinned learner labels, scopes repeated option IDs to their question, and keeps
current validity separate from immutable outcome. The new ResultView branch is
additive; the old call signature and default markup remain. It also restores the
legacy non-UUID authentication return to `/attempt/current`, while real attempt
IDs retain their exact destination and arbitrary query values are ignored.
Pinned instructions now render after validation at the JSONB boundary.
`916b53d` marks German authored feedback separately from English interface text.

Review returned these defects rather than accepting the worker's first report:

- The initial result patch changed the legacy ResultView contract and omitted
  per-question context. It now uses an optional projection branch and labels
  every known item. Raw authored cause mappings are not presented as diagnoses.
- The R3 result mapper paired situations and bindings by position. It now joins
  `binding.leftId` to `promptId`, with shuffled-order regression coverage.
- German stimulus, question, option and result text initially lacked language
  attributes. The English help sentence also sat under a German-language parent.
- The tightened instruction parser exposed an incomplete integration fixture.
  The fixture now contains the complete instruction contract; no assertion was
  removed or weakened.
- A styled 320 px / 400% check found the confirmation text overflowing to 360 px
  in all three engines. `a5440a4` adds wrapping, associated confirmation text and
  a 44 px target. Its test verifies accessible name and label activation.
- A fresh WebKit resize still overflowed to 326 px at normal text size. The
  question legend retained a 292.6 px intrinsic width after 390→320 and 1280→320
  resizing. Two animation frames and a one-second wait did not resolve it.
  Static legend/inner-span constraints did not reliably fix the fresh-source
  case. The orchestrator rejected font-loading state effects and directed the
  native fieldset to use `aria-labelledby` with an in-flow German question
  paragraph. `7c380fe` contains only that naming/layout change and its regression;
  no experimental effects, shared stylesheet changes or snapshot changes remain.

Independent commands on clean `7c380fe`, pinned Node 24.19.0/pnpm 11.23.0:

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`,
  `pnpm exec tsc -p apps/web/tsconfig.json --noEmit`, `pnpm check:boundaries`,
  `pnpm check:assets`, `pnpm check:lock`, `pnpm check:secrets`,
  `pnpm check:providers`, `pnpm test:release`: **PASS**. The existing oversized
  generated seed JSON warning remains non-failing.
- `pnpm test:unit`: **1 failed / 771 passed (772)**. The sole failure is exactly
  the known coverage semantic-union parity test. `pnpm check` exits 1 at that
  coverage mismatch after the preserved Stage 01–04 scope fixtures pass. Every
  later command was therefore run separately, not inferred from the chain.
- `pnpm build`, `pnpm check:web-budget`, `pnpm check:generated`: **PASS**.
  Protected first load **198,157 B gzip**, app-owned chunks **41,980 B gzip**,
  CSS **5,031 B gzip**, fonts **262,144 B**, icons/brand **1,863 B gzip**. The
  protected ceiling remains 204,800 B; remaining headroom is 6,643 B.
- `TEST_DATABASE_URL=<disposable-local-db> pnpm test:integration`: **21/21 in
  three consecutive independent runs**. `pnpm test:process` against that same
  database: **3/3**.
- `pnpm test:e2e`: **66 passed / 3 skipped**, all three engines. The skips are
  the container-only visual case, one per engine. The legacy return-route
  regression now passes in each engine.
- `pnpm test:visual:container`: **1/1**, no regeneration. Pinned local image:
  `sha256:e19cff183e18e06772ad1d184cf394017a030d83698b4e6281bc57fc889096a0`.
- The ignored actual-island/IndexedDB diagnostic remains **1/1** in Chromium.
  The rebuilt styled preview passed axe, label activation, keyboard activation
  and no-page-error checks for ready, conflict and result states across all
  three engines. Repeated 320/1280/320/390/320 resizing and 320 px / 400% text
  all fit. Confirmation targets were 250×44 at 320 and 650×44 at 1280. The
  orchestrator inspected the final dark 390 px screen and enlarged confirmation
  screenshot. These diagnostics are supplemental, not T12 completion evidence.

Earlier independent runs at `916b53d` and `a5440a4` also passed their release,
build/budget/generated, browser and three repeated 21-test integration gates.
Their unit totals were respectively 769 and 770 passes plus the same known red.
Those green suites did not detect the rendered defects described above. OCI and
full-stage acceptance remain unclaimed until T11/T12; owner gates remain open.

After all gate processes finished, the orchestrator stopped preview port 3306,
moved `apps/web/.next` recoverably to Trash, and pruned only Docker build cache
and dangling images, reclaiming 2.467 GB and 2.366 GB respectively. The newly
tagged visual image and all owner volumes remain. Host `df -h` reports 460 GiB
total, 400 GiB used, 33 GiB available. Docker reports 19 images / 11.41 GB,
28 containers / 34.02 MB, 26 volumes / 7.017 GB, and zero build cache. The VM
has 35 GB available of 59 GB. The orchestrator's disposable PostgreSQL container
`bestehen-t10-orchestrator-0904` stays on port 55435 for T5; owner containers are
untouched. Local main is 93 commits ahead of stale origin/main at the production
boundary. No push, pull request or remote CI run occurred.

### T5 dispatch boundary, 2026-09-04

One existing Sol high worker continues with T5 after T10 acceptance. The first
bounded slice covers media validation, Listening contracts, authorization and
persisted plan/preflight/playback records with real-database tests. Browser
playback and integration into the existing attempt runtime follow after review
of that slice. This split limits review size without giving playback semantics
to different workers. No other implementation agent runs concurrently.

The worker must not mislabel non-speech fake audio as reviewed TTS to satisfy
the existing SQL source-role constraint. It must resolve item/media scope by
identity without reading answer keys during plan acquisition. Existing media
migrations remain immutable. Any additional schema requirement returns to the
orchestrator before implementation. Seed publication and all owner approvals
remain unclaimed. These are dispatch constraints, not implementation evidence.

### Exposure integration finding before T5 editing, 2026-09-04

The orchestrator's T5 integration review found a further T10 omission before
the Listening worker changed any source. `loadAttemptProjection`,
`readLearnerAttempt`, the objective island and `loadResultProjection` do not
record stimulus or result disclosure. Only the standalone exposure command
exists. `acquireServingManifest` derives freshness from `content_exposure_index`,
and submission falls back to `unseen` when no exposure fact exists. Thus the
rendered path does not supply the fact that the next acquisition depends on.
The existing composition tests do not prove that later acquisition changes.

The exposure command also accepts a client-named family without checking it
against the pinned attempt revision. Its two-step index/fact composition needs
review: a receipt retry reads the index's current merged class, which may have
increased since the original command, rather than an immutable original result.

T10 acceptance above was still too broad. Its measured recovery, presentation
and gate results remain true, but do not establish exposure/freshness completion.
T5 implementation is paused before edits. The same Sol high worker is assigned
this bounded correction first, preserving serial order. The fix must distinguish
pre-attempt freshness from this attempt's first disclosure, record no-JS written
stimulus and result disclosure safely, preserve immutable history, and deny
wrong-family mutations. Listening acquisition/preflight must not itself record
target exposure. Root will independently verify the resulting composition and
real-database tests before accepting it or resuming T5.

### Disclosure correction review at `440086b`, 2026-09-04

The orchestrator reviewed `e2cd5cd` and `440086b`. Written server delivery now
records a pinned disclosure atomically with its receipt and family index update.
It captures the family index before the first disclosure, so two previously
issued fresh leases cannot both become fresh attempts after one has been shown.
Refreshing the first attempt preserves its original baseline. Result delivery
records answer exposure without changing the committed outcome. Speculative
prefetch and Listening instruction delivery do not record target exposure.

Review required preserving `near_duplicate_family` as well as `answer_exposed`
when merging index entries. It also required an early, validated submission
receipt lookup: old committed submissions must replay without today's new
disclosure-baseline requirement or another key read. New written submissions
without that baseline fail closed. Synthetic approval records in the integration
fixture do not approve or publish the seed corpus.

Independent evidence on committed `440086b`:

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`,
  `pnpm exec tsc -p apps/web/tsconfig.json --noEmit`, `pnpm check:boundaries`,
  `pnpm test:release`: **PASS**.
- `pnpm test:unit`: **1 failed / 779 passed (780)**. The sole failure is the
  existing coverage semantic-union parity baseline.
- `TEST_DATABASE_URL=<disposable-local-db> pnpm test:integration`: **21/21 in
  three consecutive independent runs**. The expanded composition tests exercise
  real acquisition, display, refresh, result disclosure, rollback after the index
  write, scope/family refusal and historical submission replay.
- Fresh ignored styled preview: ready, conflict, repeated and result states pass
  axe, keyboard/label activation and repeated 320/1280/320/390/320 reflow in all
  three engines. At 320 px with 400% text, no horizontal overflow was observed.
  The orchestrator inspected the repeated-practice screen at 390 px in dark mode.
  This is supplemental evidence, not T12 authenticated browser completion.

T10 remains open. Further source review found that an exact retry of the older
standalone exposure command can create a second fact and index increment. The
old command stored `attempt.exposure` and `attempt.fact.exposure` receipts with
an `objective_exposure_v1` fact; the new path recognizes only the new disclosure
receipt. The same Sol high worker confirmed this mismatch read-only and is
adding a real-database regression before implementation. Complete old retries
must return their original fact ID without changing history. Conflicts and
partial old split writes must not produce another increment. T5 remains paused.
Build, budget, generated-output, full browser, visual and process gates at this
commit are deferred until that correction; their older results are not a pass
for this tree. Local main is 98 commits ahead of stale origin/main at this
production boundary. No push, pull request or remote workflow occurred.

The orchestrator then read the new `legacy-exposure-retry.integration.test.ts`
in full and compared its fixture calls with `440086b^`'s actual old handler.
With production still unchanged, the independent command
`TEST_DATABASE_URL=<disposable-local-db> pnpm exec vitest --run --config vitest.workspace.ts --project integration apps/web/src/server/legacy-exposure-retry.integration.test.ts`
returned **7 failed / 2 passed (9)**. Exact retry, retry after stronger exposure,
changed timestamp/class/fact ID, index-only partial write and old transcript
receipt acknowledgement failed. Wrong family and wrong scope were denied.
This independently observed red run precedes authorization of the bounded fix.

### T10 disclosure and compatibility accepted at `2ff7251`, 2026-09-04

The orchestrator read the complete committed production diff and 318-line
regression fixture. `2ff7251` recognizes the old receipt pair and verifies its
canonical payload digest, pinned family, attempt and original fact ID. Complete
exact retries return that original ID without another fact, receipt, index
increment or baseline. Incomplete old writes and conflicting reuse fail closed.
Acknowledging an already recorded transcript event neither reads nor authorizes
transcript bytes. New transcript disclosure still belongs to T5's phase gate.

The orchestrator also raised the negative-lookup race: an old writer can commit
between the compatibility read and the new disclosure transaction. The worker
added an in-transaction receipt recheck under the active-scope lock. A regression
inserts the actual old write at that exact boundary, observes a conflict with no
new write, then retries to obtain the original fact ID. The original nine-case
red test expanded to thirteen cases, including an active other scope, another
pinned attempt and a fact-only partial write. No assertion was weakened.

Independent verification on clean `2ff7251`, pinned Node 24.19.0/pnpm 11.23.0:

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`,
  `pnpm exec tsc -p apps/web/tsconfig.json --noEmit`, `pnpm check:boundaries`,
  `pnpm check:assets`, `pnpm check:lock`, `pnpm check:secrets`,
  `pnpm check:providers`, `pnpm test:release`: **PASS**. The existing oversized
  generated seed JSON warning remains non-failing.
- `pnpm test:unit`: **1 failed / 779 passed (780)**, exactly the known coverage
  semantic-union parity failure. `pnpm check` stops at that same coverage mismatch.
  Its later gates were run independently, never inferred from the chain.
- `pnpm build`, `pnpm check:web-budget`, `pnpm check:generated`: **PASS**.
  Protected first load **198,157 B gzip**, app-owned chunks **41,980 B gzip**,
  CSS **5,031 B gzip**, fonts **262,144 B**, icons/brand **1,863 B gzip**.
  Protected headroom remains **6,643 B**; no ceiling changed.
- `TEST_DATABASE_URL=<disposable-local-db> pnpm test:integration`: **34/34 in
  three consecutive independent runs**, including all thirteen new regressions.
- `pnpm test:e2e`: **66 passed / 3 skipped** across Chromium, Firefox and WebKit.
  Only the container-only visual test is skipped, once per engine.
- `pnpm test:process` against the disposable database: **3/3**.
- `pnpm test:visual:container`: **1/1**, no snapshot regeneration. Pinned image
  `sha256:4f04098bd8f299ba1e09de01a68eca7c0bb196006603de4b9ed17f754f00ca09`.
- `pnpm exec vitest --run --config test-results/t10-recovery/vitest.config.ts`:
  **1/1**, the ignored actual-island/IndexedDB recovery diagnostic. The rendered
  review recorded above used the identical UI source before this server-only
  compatibility change. Neither diagnostic substitutes for T12.

T10 implementation is accepted with the scope above. T5, T11, T12, OCI and
full-stage completion remain unclaimed. Seed approval and owner gates have not
changed. The same Sol high worker resumes T5's server/media slice first; it must
stop for review before browser playback integration and before any needed
additive migration. No other implementation worker runs concurrently.

After all gate processes ended, `.next` was moved recoverably to Trash. Ports
3300 and 3306 have no listeners. Only Docker build cache and dangling images
were pruned, reclaiming **2.553 GB** and **2.324 GB** respectively. Tagged images
and every volume were preserved. Host `df -h` reports **460 GiB total, 401 GiB
used, 32 GiB available**. Docker reports **19 images / 11.45 GB**, **28 containers
/ 34.02 MB**, **26 volumes / 7.018 GB**, and **zero build cache**; its VM has
**35 GB available of 59 GB**. The disposable PostgreSQL container on 55435 stays
for T5; owner containers are untouched. Local main is a verified strict
fast-forward, **101 commits ahead of stale origin/main** at this production
boundary. No push, pull request or remote workflow occurred.

### T5 schema and exact-media decisions, 2026-09-04

Before T5 edits, source review found that `media_assets.source_role` cannot
truthfully represent the committed non-speech fixtures, and the schema has no
non-answer-bearing item/stimulus/rendition relation. The orchestrator also found
that `findEligibleServingRevision` gathers all current media for a family rather
than the exact selected content revision. The worker is authorized to correct
that narrow query during T5, preserving Reading/Language Elements behavior and
refusing missing, unapproved or rights-invalid Listening media.

The first T5 slice is reduced to an additive migration and its tests before the
larger server/media implementation. Decisions of record:

- Add the explicit `deterministic_non_speech_fixture` source role. It cannot
  establish actual learner-approved content or audio quality. Seed approval
  remains unchanged.
- Preserve `media_assets.id` as the logical asset lineage. A proposed single
  JSONB manifest on that row was rejected because it cannot hold immutable
  successor manifests under a stable asset ID. Use append-only
  `audio_asset_manifests` keyed by asset ID and manifest revision, plus an exact
  `audio_manifest_renditions` membership relation. The existing asset row remains
  the current projection. Do not invent or backfill missing old manifests.
- Add immutable `content_item_media_bindings` with composite item/revision and
  exact asset/manifest/rendition foreign keys. Multiple encodings are distinct
  candidates for the same authored item/stimulus, never positional associations.
  An offline authoring adapter supplies these mappings; acquisition must not
  read answer keys to recover them.
- Store canonical manifest text with a JSON projection and byte-digest check.
  SQL identity checks must reject absent/null values, not accidentally accept
  SQL UNKNOWN. A matching hash alone does not prove canonical JSON; the importer
  and runtime still need the shared canonicalization/shape validation.
- Keep always-available instructional text in the existing instruction payload.
  Do not widen transcript phases. Target transcripts stay private and phase
  gated; app-owned stable UUID mapping preserves opaque source IDs only in
  private metadata.
- Append new media and terminal compatibility sources. All eight inherited
  migration sources/checksums remain immutable. Rehearse both P03 and existing
  P05-054 upgrades. Configuration remains T11-owned; until T11 updates its
  default maximum, intermediate new-schema runtime checks must set the explicit
  new maximum. An old maximum must fail closed, not silently accept the schema.

The orchestrator read the Cloudflare skill and its R2 configuration/API
references, then checked the official [data-location documentation](https://developers.cloudflare.com/r2/reference/data-location/)
and [presigned-URL documentation](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
on 2026-09-04. The review keeps the EU-jurisdiction endpoint and app-controlled
private delivery; generic public/bearer-URL examples do not override the
architecture's authorization and transcript rules. No cloud account changed.
These are implementation decisions, not evidence that T5 is complete.

### T5 migration review returned at `fc14a0a`, 2026-09-04

The orchestrator read the new 055 source, migration registration changes and
complete PostgreSQL regression file. Review added missing immutability triggers
for `media_revisions` and `transcript_revisions`; their exact IDs must not acquire
different bytes, object keys or reveal phases. Logical asset status/current
manifest pointers remain mutable projections. The new manifest insertion guard
also refuses a different content family or an image asset.

The first migration commit was not accepted. Its binding primary key includes
manifest revision, but an extra `UNIQUE(content_revision_id, content_item_id,
media_revision_id)` prevents an item retaining the same primary rendition under
a successor manifest. The first lineage test created the successor manifest
without inserting that successor binding, so it missed the real use case.

The worker extended only the test, then froze. The orchestrator independently
ran `TEST_DATABASE_URL=<disposable-local-db> pnpm exec vitest --run --config vitest.workspace.ts --project integration packages/infrastructure/src/media/media-migration.integration.test.ts -t 'retains stable lineage'`
against unchanged `fc14a0a`: **1 failed / 6 filtered out**, with PostgreSQL 23505
on `content_item_media_bindings_content_revision_id_content_ite_key` when
inserting the m2 binding. The correction must retain both m1 and m2 rows while
still refusing a duplicate exact tuple.

Because 055/056 had just been committed, the orchestrator declined to edit their
sources. A small 057 correction and 058 terminal source are authorized instead.
Their predecessors' checksums remain fixed, including
055 `1802231b3936d69745d67d377dd9ca92c888d4c9201322559366236def799baa`
and 056 `c84c0284e31baeadd3ad012453f2b96bec715bb5725739bab785bcee650ff190`.
The correction must also rehearse an already-applied 056 database. No broad gate
pass or T5 runtime implementation is claimed at `fc14a0a`.

For independent upgrade evidence, the orchestrator used the genuinely old
compiled 054 module before the worker rebuilt it. The disposable database
`bestehen_root_p05_054_0904` on the orchestrator's port 55435 has exactly eight
original checksum rows and saved snapshots of six catalogue/media relations.
Its audio metadata is an explicitly synthetic, quarantined schema fixture with
no actual object, transcript bytes or approval. It remains at 054 for the later
upgrade check. The worker's separate predecessor tests reconstruct the old
checksum set explicitly because a prefix of today's migration callbacks alone
would insert future checksum entries.

The worker's two contract draft files are temporarily preserved in the named
stash `40aba359caa1f7160d044af0487989b39c51f7b9`,
`t5a-contract-draft-before-migration-review`. Only those worker-owned paths were
stashed. They must be restored after migration acceptance and must not remain
hidden at final cleanup.

T12 environment finding from a separate isolated cookie diagnostic: a secure
`__Host-bestehen_session` cookie inserted for the HTTPS loopback origin was sent
over local HTTP by Chromium and Firefox, but not WebKit. The first HTTP-origin
insertion was itself rejected by Chromium. Authenticated browser evidence must
use local HTTPS instead of weakening the production cookie flags. This was a
transport diagnostic, not an authenticated application or owner-login claim.

### T5 migration checkpoint accepted at `fb8816d`, 2026-09-04

The orchestrator reviewed the full committed correction. Migration 057 checks
the exact old constraint name and columns before removing it; the manifest-aware
primary key, foreign keys and immutability triggers remain. Migration 058 is the
new terminal revision. All ten preceding source checksums, including 055/056,
are unchanged. The repaired lineage test now inserts the successor binding,
preserves every original binding field and rejects an exact successor duplicate.
The 056 upgrade test compares the actual constraint catalogue before and after.

Independent gates on the clean committed tree, using pinned Node/pnpm:

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`,
  `pnpm exec tsc -p apps/web/tsconfig.json --noEmit`, `pnpm check:boundaries`,
  `pnpm check:assets`, `pnpm check:lock`, `pnpm check:secrets`,
  `pnpm check:providers`, `pnpm test:release`: **PASS**. The unchanged oversized
  generated seed JSON warning is non-failing.
- `pnpm test:unit`: **1 failed / 780 passed (781)**. The sole failure is the
  known coverage semantic-union parity test. `pnpm check` passes its scope
  checks and stops at that same coverage mismatch; no later gate is inferred.
- `TEST_DATABASE_URL=<disposable-local-db> pnpm test:integration`: **42/42 in
  three consecutive independent runs**, including eight media migration tests.
- `pnpm build`, `pnpm check:web-budget`, `pnpm check:generated`: **PASS**.
  Protected first load remains **198,157 B gzip**, with **6,643 B** headroom.
  App-owned chunks **41,980 B**, CSS **5,031 B**, fonts **262,144 B**, icons/brand
  **1,863 B**; no budget changed.
- `pnpm test:e2e`: **66 passed / 3 expected container-only skips**, across all
  three browser projects. `pnpm test:process`: **3/3**.

The separate orchestrator-owned old-054 database was upgraded using the new
compiled runtime, not a reconstruction with today's migration callbacks.
`node test-results/t5-media/root-upgrade-054.mjs` passed: exactly 055–058 applied,
all eight original checksums and six populated relation snapshots are identical,
all three new media tables remain empty, four exact-revision update/delete
attempts are refused, and a second migration applies nothing. The new schema
window accepts 058; the old maximum 054 fails closed. This ignored diagnostic's
output is `/tmp/p05-fb8816d-real-054-upgrade.log`; gate logs share the
`/tmp/p05-fb8816d-` prefix. The isolated database remains available for review.

This accepts only the migration checkpoint, not the Listening runtime. The
worker now restores its named contract stash and continues the bounded server,
contracts and media slice, stopping before browser integration. Configuration
remains T11-owned and still defaults to 054. OCI, full-stage completion and
owner approvals remain unclaimed. No UI source changed in this checkpoint, so
the pinned raster gate was not repeated; the last independent raster pass is
recorded at `2ff7251`. No snapshot was regenerated.

After all gate processes ended, `.next` was moved recoverably to Trash and port
3300 had no listener. Docker build cache remains zero; this checkpoint created
no image or container. Tagged images and volumes were not pruned. Main is a
strict fast-forward **106 commits ahead of stale origin/main** at `fb8816d`.
No remote action occurred.

### T5 model review findings before the next checkpoint, 2026-09-04

The worker restored both contract draft paths and dropped only its named stash;
the orchestrator confirmed that `git stash list` is empty. T5 is narrowed to a
model/contracts/offline-handoff checkpoint before persisted runtime work.

Draft review found an immutable identity conflict: the proposed fixture adapter
retained the seed rendition ID while replacing its `seed/audio/` object key with
a `tmp/non-speech/` key. The existing seed importer already stores the original
ID/key. The worker must publish an explicit successor rendition and require a
successor content payload pin, not overwrite the old record or silently retarget
its payload. Master, transcript and aggregate revision identities must likewise
remain stable for exact retry and change when their immutable facts change.

The orchestrator rendered the 22 committed seed manifests with the existing
deterministic renderer and decoded each byte buffer through an actual
`OfflineAudioContext` in Chromium, Firefox and WebKit. **22/22 in each engine**
decoded with one channel and duration within 1 ms of the manifest. Output is
`/tmp/p05-root-fixture-decode.log`. This establishes decoder compatibility only;
it does not establish an audible output probe, speech quality, preflight
admission, content approval or learner completion.

A separate real-database diagnostic found that the inherited
`transcript_revisions.digest UNIQUE` rule prevents a successor transcript with
unchanged text bytes but changed reveal policy. In the isolated old-054-to-058
database, inserting a fresh ID with the same digest and a different reveal phase
failed with **23505 / transcript_revisions_digest_key**. The original row was
compared afterwards and remained identical. Output is
`/tmp/p05-root-transcript-successor-red.log`; the first diagnostic invocation
failed to resolve the root-level `pg` package and was rerun through the existing
infrastructure pool export before claiming any database result.

This is pending correction, not a gate waiver. Byte digest is not semantic
identity. Changing reveal policy, rights or a media association cannot mutate an
old transcript revision merely because its text is unchanged. The worker must
finish the current model checkpoint first; any storage correction requires a
separate reviewed additive migration and keeps every committed source unchanged.
