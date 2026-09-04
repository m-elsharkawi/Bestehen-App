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
| 8 | T10 routes + islands + archetypes | GPT-5.6 Terra high, then Sol high recovery | **Reopened**, recovery review in progress | `43a9251` through `d7979b9` |
| 9 | T5 Listening | — | not started | |
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
