# Personal Stage 05 execution handoff

Date: 2026-09-08 (Europe/Berlin)

Status: `05E` accepted locally. The frozen code candidate is
`ac18652f605c8bb964c1528d95521be84595c470`; this handoff and the checklist
promotion are a documentation-only successor. No branch was pushed, no pull
request or workflow was opened, and no live provider was called.

The accepted plan is `Implementation/Personal/05-content-deterministic-runtime/plan.md`.
Where it conflicts with the later evidence record, the corrections in
`orchestration-log.md` control. In particular, the protected-route ceiling is
204,800 B, and a Stage 05 to Stage 04 application rollback requires restoring
the database to the Stage 03 revision.

## Delivered boundary

- Added the closed Stage 05 content, key, rights, freshness, scoring, attempt,
  evidence, media, playback and recovery contracts. Canonical digests bind
  immutable content and exact media identities; learner-safe projections exclude
  answer keys, object keys, provider URLs and transcripts before their allowed phase.
- Added ordered publication validation, action-level rights evaluation, immutable
  revision/successor rules, quarantine and withdrawal operations, targeted impact
  assertions and deterministic scoring. Content corrections do not rewrite prior
  attempts or validity assertions.
- Added migrations through `20260905_062_p05_listening_runtime`. Sixteen migration
  sources are now in the complete checksum set. The last two migrations add the
  scoped Listening operation journal and its terminal compatibility record; all
  fourteen inherited hashes stayed unchanged.
- Added PostgreSQL content, attempt, media-catalogue and Listening repositories,
  exact idempotency receipts, scope fences, immutable evidence facts, two content
  worker queues, and the offline seed/media import composition.
- Added sixteen authored C3 practice families, eighteen immutable revisions, 106
  items and 22 deterministic non-speech media fixtures. They remain drafts or
  quarantined catalogues. The fixtures are technical data, not approved learner
  audio, human review, or a synthetic substitute for an owner approval.
- Added authenticated Reading, Language Elements and Listening attempt/result
  routes, native Server Action fallbacks, durable local checkpoints,
  submission-unknown recovery, and server-authoritative result projection. JSON
  mutation routes share one method/content-type, canonical-Origin, Fetch Metadata
  and CSRF boundary; native forms and Secure `__Host-` session cookies remain intact.
- Added exact Listening plan, private byte authorization, digest verification,
  decode and output confirmation, durable preflight, play ordinals, pause policy,
  transcript-phase enforcement and fault-scoped scoring. Timing begins only after
  verified bytes, successful decode, output confirmation, durable persistence and
  explicit Begin. Expiry, withdrawal and reconnect preserve old facts without
  granting new bytes or play opportunities.
- Added the audio island without importing it into protected shell routes. It
  records start intent before native play, retries immutable operations, preserves
  offline and uncertain native facts, skips terminal failed occurrences, and blocks
  submission while an admitted occurrence is unresolved.
- Added all-engine authenticated browser coverage for keyboard completion,
  no-JavaScript forms, focus repair, sparse timer announcements, 44 px targets,
  320 px/400% text reflow, representative 200% zoom, network loss, duplicate
  submission, session expiry, withdrawal, playback stalls and visibility changes.
  Two inspected Chromium anchors now cover Listening at 320 px/400% text and the
  Reading 720 px measure in the pinned raster container.
- Added all 29 `P05-*` evidence IDs to the release schema and both candidate
  workflow maps. Coverage remains exactly 43 component families, 20 icons, 41
  compact frames, eight large-screen exemplars and 37 board anchors.

The product still makes no live Corpus or productive AI call. The release axes are
`application: stage-05-runtime`, `content: stage-05-content-v1`, and
`evaluation`/`model: not-produced`. Public object access and external-provider
flags remain false.

## Consolidated audit of the inherited checkpoint

The continuation began with one frozen-commit review of the SHA-indexed evidence,
not the earlier agents' completion prose.

- **Verified defect:** all eight Stage 05 JSON mutation handlers parsed bodies
  without the shared unsafe-request proof. Source inspection reproduced the gap;
  `048f596` applies the existing policy to every handler and adds negative plus
  genuine same-origin success tests. This was the only unresolved T10 finding.
- **Verified defect:** `ListeningRegion` enabled Pause solely from presentation
  state, although P4 and target probes forbid pausing. `2edd9c2` adds one optional
  policy input, preserves omitted-call-site DOM, and proves accessible disabled
  state and light/dark contrast.
- **No catalogue defect reproduced:** tests against `6ee0bfc` and `5d69572`
  confirmed exact revision/approval/digest binding, purpose-scoped rights,
  immutable retries, identity ordering, advisory locking and savepoint rollback.
  The catalogue was accepted at its documented offline boundary and was not reopened.
- **Unproven concern:** no new recovery or exposure failure was reproduced at the
  accepted T10 commit `2ff7251`. Those areas already had PostgreSQL and browser
  regression evidence, so they received no further implementation cycle.
- **Process issue:** earlier T10 reviews mixed recovery, disclosure and transport
  into repeated reopenings and reran broad gates after documentation-only changes.
  The continuation kept one correction brief per checkpoint, used targeted repair
  runs, and preserved accepted evidence. It found no reason to delete tests or
  rewrite working abstractions merely to reduce their count.

Later T12 execution found two bounded defects: the root loading boundary prevented
native focused-route forms from becoming usable without JavaScript, and native
controls did not retain their target/reflow contract in WebKit at extreme text
scale. `3207d74` and `cc764ae` fix those behaviors with focused cross-engine tests.
The pinned visual image also lacked OpenSSL after local HTTPS became mandatory;
`465c31f` adds that prerequisite and keeps the strict application configuration
namespace free of harness-only variables.

## Accepted checkpoints

- Content/domain/repository foundation: commits from `74117e5` through `a9bbec7`.
- Seed corpus and operations: `ac2960f` through `332559a`.
- Design-system and shared attempt runtime: accepted checkpoints through `2ff7251`.
- Media lineage and catalogue: `fb8816d`, `6de4d9a`, `8436ba9`, `4ff1d12`,
  `6ee0bfc`, with test-only repair `5d69572`.
- Unsafe-request and player-policy corrections: `048f596`, `2edd9c2`.
- Listening server and browser runtime: `b69fdda`, test-only `8f4be31`,
  `310a1d3`, `bbc65c8`, and `9f14aa7`.
- Gate wiring and HTTPS: `aa2a596`, `47ba29f`, `75a9041`, `7b952f6`, `1375eec`.
- Authenticated/responsive browser completion: `3207d74`, `cc764ae`, `043887e`,
  `465c31f`.
- Final evidence binding: `ac18652`.

The full correction history and per-checkpoint evidence are retained in
`Implementation/Personal/05-content-deterministic-runtime/orchestration-log.md`.

## Independent final verification

All commands used repository-pinned Node 24.19.0 and pnpm 11.23.0. The final code
batch ran serially on clean `ac18652`; PostgreSQL used the disposable pinned 18.6
container at local port 55435. Logs are `/tmp/p05-ac18652-final-*.log` and their
outcomes are summarized here so the evidence does not depend on those temporary files.

- `pnpm check`: exit 0. Scope fixtures, exact reciprocal coverage, assets, lock,
  secrets, fake-provider readiness, format, lint, both TypeScript graphs,
  boundaries, release and generated-file checks passed. Unit result: 61 files,
  868/868 tests. The production build passed.
- `pnpm check:web-budget` within that run: protected first-load 198,702 B gzip
  against 204,800 B; App-owned chunks 66,761 B against 92,160 B. Listening-related
  chunks were 10,625/15,360 B, 7,792/12,288 B and 15,602/29,696 B for their
  declared shared-island combinations. CSS was 5,115 B gzip; self-hosted fonts
  262,144 B; icons/brand 1,863 B gzip. No ceiling was raised.
- `TEST_DATABASE_URL=<local disposable database> pnpm test:integration`: 8 files,
  71/71 tests, no skips, in exactly three consecutive runs. These include populated
  predecessor upgrades, all sixteen checksums, exact retries, concurrency and
  immutable-history tests.
- Configured `pnpm test:process`: 3/3, no database-required skip. Worker shutdown
  and standalone Next SIGTERM forwarding passed.
- Configured `pnpm test:e2e`: 129 passed across Chromium, Firefox and WebKit, with
  exactly three expected `P04-VISUAL-001` skips outside the pinned raster image.
  The 63 Stage 05 tests include real authenticated database sessions and attempts.
- `pnpm test:visual:container`: 1/1 after an explicitly approved update and visual
  inspection. A separate non-update run passed at `465c31f`, and the final
  non-update comparison passed again at `ac18652`. No threshold changed.
- `pnpm test:oci`: exit 0. Fresh images ran as `10001:10001`, with read-only roots,
  init and SIGTERM checks. Web digest
  `sha256:215ced8833f855fcb9d8c166e306c5d753057347eec60e01f0a97f443f2809b8`;
  worker digest
  `sha256:9a98c3b60c91c5dc71f7d000385c2c4a90a79a44947a72dbc3a788f70afaf588`.
  The fresh migrator applied 16 revisions and reported terminal revision 062.
- `pnpm check:docs` and baseline-range `git diff --check`: exit 0.
  `pnpm check:advisories` exited 0 at the required critical threshold and reported
  four high-severity advisories below that threshold; this is recorded, not hidden.

The first final `pnpm check` invocation itself completed successfully, but its
wrapper tried to assign zsh's reserved `status` variable and lost the direct exit
code. It was not counted as evidence. The check was run once more with a corrected
wrapper, which captured exit 0 directly. No other final gate was repeated for that
orchestration error.

## Final machine state

After every dependent browser, process, visual and OCI check completed, no
`next-server`, Playwright HTTPS helper or listener on ports 3300-3302 remained.
The 298 MB `apps/web/.next`, current Playwright results/report and JUnit file were
moved recoverably to Trash; the ignored T5/T10 audit scripts and images were
preserved. The disposable PostgreSQL container
`bestehen-t10-orchestrator-0904` remains running on local port 55435.

`docker builder prune -f` removed 2.83 GB of unused build cache; a second pass
reported 0 B reclaimable under that command. `docker image prune -f` removed only
dangling images and reclaimed 2.367 GB. No volume, tagged image or owner container
was removed. After Docker's accounting settled, final host free space is 35 GiB.
`docker system df` reports 21 images / 11.77 GB, 28 containers / 34.02 MB, 27
volumes / 7.116 GB and 33 build-cache records / 2.687 GB with 0 B reclaimable.
The pinned visual image and final OCI web/worker tags remain present.

## Security, compatibility and operations

- Every learner mutation checks authenticated scope server-side. Unsafe JSON routes
  require POST, JSON, canonical same-origin evidence, safe Fetch Metadata and a CSRF
  proof. Cross-scope and malformed requests fail before runtime access.
- Media and transcripts remain private. Authorization is bound to learner scope,
  plan, exact asset/revision/rendition, current approval and rights. The authentic
  H2 browser fixture deliberately fails closed because the production fake byte
  adapter has no approved object bytes; the separate non-speech technical fixture
  proves browser digest/decode/output/playback mechanics without granting content.
- Content import, withdrawal, quarantine and rollback procedures are in
  `docs/content-operations.md`. Exact operation IDs are required for replay; a
  conflicting reuse fails without rewriting history.
- The supported application database window is Stage 03 foundation through Stage 05
  terminal revision 062. Web and worker do not migrate at startup.
- An application rollback from Stage 05 to Stage 04 is **not** image-only. Restore a
  compatible backup at Stage 03 revision `20260825_040_p03_foundation`, deploy the
  Stage 04 image, then run its readiness and authenticated smoke checks. The older
  image correctly fails closed against a Stage 05 migration set.

## Explicitly unclaimed owner and deployment gates

- `OWNER-05-A`: live German TTS synthesis, voice audition and human audit of final
  speech bytes.
- `OWNER-05-B`: human approval of a complete P4 form and its final assets.
- `OWNER-05-C`: blind key validation by a reviewer distinct from the author.
- `OWNER-05-E`: dated VoiceOver/NVDA completion of R1/R3, SB2 and H2 plus real-device
  200% zoom and 320 px reflow. Automated axe, keyboard and engine coverage does not
  claim this manual result.
- Architecture 10 section 9.2 item 3: deployment-level denial of egress to the live
  Corpus publication host. Stage 05 proves package boundaries, serialization refusal,
  zero calls and zero learner-data bytes; Stage 10 must prove the network policy.

`OWNER-05-D` is not required for this C3 App-original corpus. `OWNER-05-F` was
retired after the pinned PostgreSQL rehearsal passed and is not an open gate.

No legal approval, production key readiness, human audio judgment, assistive-
technology approval, live Corpus isolation or learner approval can be inferred from
synthetic rows or automated tests.

## Next-stage inputs

- Stage 06 may extend the skill-neutral attempt/evidence contracts for Writing and
  Speaking, but must not reuse the Listening technical fixtures as speech approval.
- Stage 07 owns interpretation of Stage 05 facts into learner models, coaching and
  progression. It must preserve append-only validity history and actual-condition
  playback/timing facts.
- Stage 08 owns measured P4 forms and `OWNER-05-B`; the seeded P4 conversion path is
  intentionally unreachable without that approval.
- Stage 09 owns full offline/WAL, export, deletion and notification behavior.
- Stage 10 owns live deployment, provider secrets, backup/restore, exact release
  evidence and the Corpus-host egress-denial proof.
