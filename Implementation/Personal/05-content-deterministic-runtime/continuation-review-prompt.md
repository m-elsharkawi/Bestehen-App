# Stage 05 audit and continuation prompt

You are the next orchestrator for Personal Stage 05 in
`/Users/sharkawi/Developer/Bestehen/App`.

The owner explicitly requested a fresh review because the previous orchestration
used too much quota and repeatedly reopened T10. Your job is to audit the work,
then finish the remaining stage without repeating that pattern. Do not assume
either that the previous work is sound or that all of it must be redone.

## Read first

Read these in order before implementation:

1. `orchestration-log.md` in this directory, in full. It records accepted commits,
   failed checks, corrections, environment traps and unclaimed owner gates.
2. `plan.md` in this directory, in full. It is the accepted product plan. The log
   identifies specific corrections to it; do not silently revive superseded rules.
3. `prompts/implementation/COMMON_STAGE_CONTRACT.md`.
4. `prompts/implementation/personal/05E_execute_content_and_deterministic_learning_runtime.txt`.
5. `prompts/implementation/personal/05O_orchestrate_content_and_deterministic_learning_runtime.txt`.
6. `Implementation/Personal/04-responsive-web-design-system/post-acceptance-corrections.md`.

Paths other than the first two are relative to the repository root. Follow any
applicable AGENTS.md and skill instructions. Provide the common contract to every
implementation subagent. The original orchestration prompt's sections 3–8 bind
you, subject to newer owner instructions and recorded environment corrections.

## First job: audit the previous orchestration

Produce a short, evidence-backed audit before dispatching more implementation.
It must distinguish real defects from avoidable orchestration overhead.

- Inspect the actual commits supporting the latest T10 and T5 acceptances. Use
  the log's SHA-indexed evidence rather than the former agents' completion text.
- Check whether the current catalogue checkpoint actually satisfies its bounded
  purpose. Pay particular attention to exact revision and approval binding,
  immutable retry, rights scope, and SQL ordering and lock behavior.
- Review the repeated T10 reopenings. Recovery, exposure and transport security
  are distinct findings. Decide which remain acceptance-critical and which have
  already been fixed with adequate regression evidence.
- Check for scope drift, excessive new abstractions, redundant tests, and
  repeated full gate runs after documentation-only changes. Do not perform a
  cosmetic rewrite or delete tests merely to reduce their number.
- Classify each finding as verified defect, unproven concern, or process issue.
  Cite the source and a test or reproduction for a defect. An unproven concern
  does not automatically authorize another implementation cycle.

Make one consolidated audit pass. Do not continuously send new speculative
requirements while a worker is implementing an agreed checkpoint. Audit at a
frozen commit, then issue one bounded correction brief if needed.

## Snapshot and acceptance boundary

Handoff snapshot, 2026-09-04: production checkpoint `6ee0bfc897468a2deea415e35be7780ec99cee4c`,
preceded by `4ff1d12`; test-only repair `5d6957224b8386dd16168f4c91d81cb426ac4bc2`.
The current catalogue checkpoint is accepted within its limited offline purpose.
The outgoing orchestrator is stopping at the owner's request, not continuing T5.
After the final documentation commit, local main is 125 commits ahead of stale
origin/main and clean. Both implementation agents are stopped. `.next` was moved
to Trash, Docker cache is zero, and host free space is 35 GiB. The disposable
PostgreSQL container remains running. See the log for exact cleanup details.

Independent verification on frozen `6ee0bfc`: formatting, lint, both TypeScript
checks, dependency boundaries, assets, lock, secrets, provider checks, release,
build, budget and generated checks passed. PostgreSQL passed 54/54 three times;
process tests passed 3/3 with the database configured; browser tests passed 66
across all three engines, with exactly three expected container-only visual skips.
Protected first-load bytes stayed at 198157. No new raster or OCI claim.

The full unit run initially found two failures: the known coverage failure and
a test-double routing collision. The latter was corrected in `5d69572` without
production edits or weakened assertions. Root read the correction and reran the
full unit suite: 816 passed, exactly the one known coverage failure, 817 total.
Gate logs are `/tmp/p05-6ee0bfc-root-*.log` and
`/tmp/p05-5d69572-root-*.log`; durable summaries are in the orchestration log.

The final checkpoint SHA, gate outcomes and cleanup state are recorded in the
last section of `orchestration-log.md`. Read that section before running anything.
Verify local HEAD, dirty files and active processes; do not rely on this prompt
for a live process inventory.

T6 seed work, T9 components and substantial T10 attempt/result/recovery work have
landed. T10's last accepted disclosure/retry correction is `2ff7251`; the log
subsequently identifies an unresolved unsafe-request transport check gap.

The agent named `t10_finish_recovery` was reused for T5. Its name is misleading:
the latest work is the Listening media catalogue, not another T10 UI rewrite.
Accepted T5 checkpoints before the latest catalogue commit are:

- `fb8816d`: immutable media identity and successor bindings, with retained old
  database upgrade proof.
- `6de4d9a`: canonical media model, Listening contracts and explicit non-speech
  seed handoff.
- `8436ba9`: append-only transcript lineage correction, migrations 059 and 060,
  with a genuine populated 058-to-060 upgrade and immutable-history proof.

The current checkpoint adds private persisted media catalogue validation, an
offline successor seed importer and exact-media eligibility. It does not store
audio bytes, authorize playback, implement the Listening runtime, or approve
the seed for learner use. Read its final acceptance or rejection in the log.

There is no completed Stage 05 handoff. `05E` must not be promoted from these
partial checkpoints. Old general browser tests are not authenticated Stage 05
completion evidence.

## Work still required, in order

Use one implementation subagent at a time on local main. You coordinate and
independently verify; do not write production code yourself except a small
remainder from a dead worker. Choose a model for each bounded task and explain
the choice briefly. Mid-tier is appropriate for decided mechanics and tests;
reserve the strongest model for Listening recovery and validity semantics.

1. If the catalogue checkpoint has an independently reproduced blocking defect,
   fix that defect only. Otherwise accept its recorded boundary and move on.
2. Correct the new Stage 05 JSON write routes' transport security. Audit all
   eight existing unsafe route handlers, not just attempts/create. They currently
   parse JSON without method/content-type, Origin, Fetch Metadata and CSRF proof
   checks. Reuse the existing application unsafe-request policy and canonical
   public origin handling; update the continuity client's headers. Preserve
   native Server Action forms and secure session-cookie flags. Prove negative
   cases and genuine same-origin success. Future Listening routes must reuse
   this boundary. This is a source-level finding, not a claimed exploit.
3. Make one additive T9-owned player policy correction. `ListeningRegion` lacks
   a pause-policy input and enables Pause whenever its state is playing. P4 and
   target probes forbid pause. Preserve every old call site's default DOM and
   assert disabled-state accessibility and dark contrast. T5 must not work around
   this by lying about player state or mutating design-system DOM.
4. Complete T5 in two coherent checkpoints: server-side byte authorization,
   Listening plan/preflight/playback/transcript semantics; then the audio island
   and actual browser recovery/fault integration. Do not split every helper into
   a new acceptance cycle. No live paid provider actions.
5. T11 owns all gate wiring, scripts, schemas, configuration, workflows and
   coverage. One worker must hold the entire gate picture. Do not invent passing
   evidence IDs before their real producing tests exist.
6. T12 owns authenticated browser, accessibility, responsive and recovery tests
   and new visual anchors. Exercise Chromium, Firefox and WebKit. Snapshot
   regeneration requires your explicit decision and the pinned container,
   followed by a separate non-update verification run.
7. You write T13 handoff, run the final required gates, update the checklist in
   the same commit as its evidence, and leave the machine clean. Report owner
   gates honestly even if that limits acceptance.

## Prevent another review loop

- Before each worker starts, write its exact deliverable, owned files, acceptance
  tests and explicit non-goals. Keep that contract stable during implementation.
- New unrelated findings go into a pending list. Interrupt only for a confirmed
  safety issue or a defect that prevents the current checkpoint's acceptance.
- Run one independent gate batch per frozen production checkpoint. Do not rerun
  all gates after a log-only commit. After a targeted repair, rerun the failing
  suite and affected gates; do not automatically repeat unrelated browser/build
  suites. The final stage still needs every required gate on the final code.
- Repeat nondeterministic database tests three times within that batch. Do not
  ask the worker to run three repeats and then repeat another three yourself.
- Allow at most two targeted repair cycles for a checkpoint. If it still fails,
  stop that checkpoint, report the concrete blocker and change the approach.
  Do not weaken tests or call it accepted. Ask the owner if scope or authority
  must change; do not spend another unbounded cycle re-deriving the same design.
- Reuse durable accepted evidence. Do not reopen an accepted area without a
  specific new failing test, reproducible defect, or cited unmet requirement.
- Keep progress updates factual: completed deliverable, current check, next
  boundary. Avoid frequent low-information polling or repeated source dumps.
- At each checkpoint report code versus documentation commits, tests newly
  added, independent results, and remaining work. Never equate activity with
  progress or a green legacy suite with new feature completion.

## Environment and safety constraints

- Use Node 24.19.0 and pnpm 11.23.0. Prefix shell commands with
  `export PATH=/Users/sharkawi/Developer/Bestehen/.toolchains/node-v24.19.0-darwin-arm64/bin:$PATH`.
- Work only on local main, a strict fast-forward of stale origin/main
  `c966c4b4`. Never push main, open a PR, run gh/workflows, fetch, rebase or reset.
  CI credits are held by the owner. All verification is local.
- Docker is running, not missing its images. The disposable orchestrator
  PostgreSQL container is `bestehen-t10-orchestrator-0904` on port 55435. Its local
  test URL is `postgresql://bestehen_local:bestehen_local@127.0.0.1:55435/bestehen_local`.
  Preserve the owner's PostgreSQL, Portainer, tagged images and volumes.
- Retained database `bestehen_root_p05_054_0904` is now at migration 060 after
  actual earlier upgrades. Do not rerun old diagnostic scripts that expect it
  still to be at 054 or 058. All 14 committed migration hashes are frozen.
- Until T11, exactly one known unit failure is allowed:
  `scripts/check-design-coverage-ids.test.mjs`, semantic union parity.
  `pnpm check` stops at check:coverage. Independently run unit, release, build,
  web-budget and generated checks. Lint and format are separate commands.
- Last measured protected first-load size is 198157 B against 204800 B, leaving
  6643 B. Never raise the ceiling. No Stage 05 island may enter protected routes.
- Do not overlap builds, server suites or cleanup. Run process tests with
  TEST_DATABASE_URL and verify no database-required tests were skipped. Capture
  command exits directly, never through a tail pipe.
- An ignored root gate aid exists at
  `test-results/t5-media/root-checkpoint-gates.sh`. Inspect before use. It runs
  serially, checks a frozen tree and records direct exits. Its expected check/unit
  failures require human inspection; it is not an all-green certificate. It does
  not run raster or OCI gates or cleanup.
- Verify the server's exact rebuilt output before visual inspection. Kill stale
  servers by their actual port/PID, not a script-name pattern. The process is
  named next-server. Keep .next until dependent browser/process tests finish.
- Check both host and Docker VM free space before container work. Remove generated
  .next at the end, prune build cache and dangling images only, and record df and
  docker system df. Never prune volumes or all images, or delete Docker.raw.

## Semantic traps that must survive the handoff

- Non-speech fake WAVs are technical fixtures, not approved Listening content.
  Actual seeds remain drafts. Synthetic test approval rows are not owner review.
- Owner gates A, B, C and E remain unclaimed as detailed in the log. Stage 10
  network-egress denial is also unclaimed. Do not claim legal, key, audio or AT
  approval from automated tests.
- Start Listening timing only after full byte verification/decode, output
  confirmation, durable local persistence and explicit begin. The current shared
  attempt creation starts immediately and needs a Listening-specific correction.
- Derive playback failures' affected item scope on the server. Current scorer
  integration supplies an empty uncaptured-item list. Whole-scope media failure
  must interrupt without creating an empty or zero-score outcome.
- Preserve actual offline playback facts and exact retry identity after expiry
  or withdrawal, without granting new bytes or fresh play opportunities. Transcript
  bytes remain server-gated until their allowed phase, after the whole block for P4.
- Real authenticated all-engine browser tests need a sound local HTTPS setup.
  WebKit does not accept the earlier HTTP workaround for the Secure __Host cookie.
  Do not weaken the cookie or substitute synthetic-auth bypasses for owner flows.
- Rolling back the app image is insufficient. Stage 05 to Stage 04 rollback needs
  a database restore to Stage 03 because the old image correctly fails closed on
  the newer schema. Plan section 15.1 says otherwise and is wrong.

Finish with an honest account of what shipped, what you independently proved,
what remains owner-blocked, how far local main is ahead, and the disk/Docker state.
