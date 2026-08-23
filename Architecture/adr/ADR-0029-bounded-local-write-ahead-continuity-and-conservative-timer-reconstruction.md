# ADR-0029 — Bounded local write-ahead continuity and conservative timer reconstruction

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 21 — Offline, Checkpointing, Recovery, Conflicts, and Timing Integrity
- **Decisions:** ARCH-S21-D01–ARCH-S21-D12
- **Supersession:** None

## Context

Bestehen must preserve already-started learner work across connectivity and recoverable browser failure without promising a full offline product. Clean timed evidence must never gain time because callbacks froze, a page reloaded or a device clock changed. Reconnect must not duplicate Evidence, merge derived truth, resurrect deletion or sync raw voice. The App is account optional; a local/provider fault cannot block unrelated work or become learner failure.

Accepted architecture already fixes PostgreSQL as accepted-fact authority, IndexedDB as a write-ahead replica, stable operation IDs/hashes, five validity states, six Readiness states, server cursors, owner-specific merge, deletion tombstones, raw-audio ephemerality and bounded productive evaluation. This ADR chooses the concrete local/recovery posture without creating a second semantic authority.

## Decision

1. Launch supports only already-loaded continuity. Cold guest creation, new content selection, provider work, evaluation, sync and rights operations require the server. A measured block starts offline only when every immutable asset, policy/version lease, timer and persistence capability is locally verified.
2. Use one narrow service worker for a compatible recovery shell and immutable manifest-admitted application/content/media assets. Semantic API responses, learner data, authentication, exports, deletion proof, evaluator results and raw audio never enter Cache API. Installability is not a launch goal.
3. IndexedDB stores versioned checkpoints, queued operations, receipts, conflicts, tombstones, manifests and advisory tab leases. A completed local transaction is required before saying “Saved on this device”; a durable server receipt is required before saying “Synced.”
4. Foreground load/online/pageshow/visibility and explicit retry are the mandatory replay paths. Optional Background Sync only wakes the same durable outbox. BroadcastChannel only announces; IndexedDB compare-and-set state remains local coordination authority.
5. Every command carries stable semantic/operation identity, canonical hash, contract major, dependencies and expected mutable version. PostgreSQL owners apply it idempotently and return receipts, conflicts, opaque cursors and tombstones. Lost receipts are queried before resending.
6. Stage-20 merge remains exact: immutable facts union by ID/hash, mutable owner fields conflict explicitly, Writing draft branches are preserved, derived projections are replaced from server source cuts, and tombstones dominate stale updates. No global timestamp last-write-wins, highest-score merge or whole-model CRDT exists.
7. Target timers persist target duration plus in-context performance.now/timeOrigin anchors, wall sample, server-clock sample/uncertainty when available, visibility/suspension facts and reconstruction quality. Interval callbacks and Date.now are never timer authority.
8. Backgrounding and sleep do not pause target time. Reconstruction accepts only consistent supported anchors and enforces the greatest supported elapsed value; it never grants guessed extra time. If time or continuity cannot be proved, preserve work and mark only the affected clean timing scope interrupted/modified.
9. Network loss alone may retain a clean claim when local content/media, playback, persistence, interaction and timer conditions remain exact. Crash, media/partner failure, exposure or material interruption affects the smallest defensible scope. The learner can continue the same work as practice, end with completed evidence, or later take a fresh equivalent clean scope.
10. Release data-loss bounds include: no acknowledged objective/receipt/submission/completed-turn loss after its commit; Writing normally loses no more than approximately five seconds under recoverable App/browser failure; playback opportunities commit before play; mock checkpoints preserve defensible completed units. Save failure is visible and blocks dependent measured advancement.
11. Recovery is an exhaustive accessible domain contract: local saved, sync pending, receipt uncertain, conflict, incompatible/stale, storage at risk, save failed, timing reconstructed/uncertain, media/partner fault, evaluation pending, deletion, local data missing and recovered. Notices are neutral, sparse, keyboard/screen-reader/reflow complete and non-blocking for unaffected work.
12. Local data is minimized/retained only for continuity. Browser persistence is not claimed to be encryption against same-origin script/device compromise. Provider tokens never enter local stores; raw audio never enters general outbox/cache/sync/backup and retains its immediate-final/seven-day-Pending deletion ceiling.

Full contracts, matrices, diagrams, official browser evidence, alternatives, validation and downstream handoff are in Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md.

## Alternatives considered

- **Online-only:** simplest but violates the fixed already-loaded continuity and measured-work loss bounds.
- **Full offline course/PWA:** adds content packaging, rights, media quota, revocation and update coupling without launch evidence.
- **No service worker:** foreground IndexedDB state remains possible, but reload cannot reliably restore the compatible shell/assets. It is the fallback if worker defects outweigh benefit.
- **Cache every request:** risks stale semantic truth, sensitive-data exposure and mutation ambiguity.
- **Memory/localStorage queue:** memory loses work; localStorage is synchronous and lacks the transactional/indexed contract needed here.
- **Client-primary local database:** conflicts with server-evaluated evidence, cross-device rights and accepted PostgreSQL authority.
- **Background Sync as required transport:** unsupported in some widely used browsers and has no completion guarantee.
- **Dedicated sync service/event stream:** increases cost and creates a second authority before measured need.
- **Global LWW/CRDT:** cannot decide evidence validity, submission, target timing, deletion or Readiness truth.
- **Date.now or decrementing interval timer:** vulnerable to wall-clock changes, callback throttling, reload and sleep.
- **Server tick/heartbeat timer:** blocks offline continuity and confuses transport availability with elapsed target time.
- **Always invalidate network loss:** discards fair locally complete conditions. **Always preserve clean label:** hides material interruption. Granular evidence is the responsible middle.

## Consequences

### Positive

- Already-started work survives ordinary offline periods and recoverable failures within explicit testable budgets.
- Retry, missing responses and concurrent contexts converge to one server-owned semantic result.
- Timed work cannot silently gain extra time from backgrounding, reload or device-clock change.
- Completed unaffected evidence survives without preserving a false full-mock label.
- The baseline uses existing browser primitives and infrastructure, adds no paid provider, and can disable optional features independently.
- Faults remain local, neutral and accessible; Written/Oral and all five/six state invariants remain exact.

### Costs and trade-offs

- IndexedDB schema/transaction, service-worker update/cache and real-device lifecycle testing add implementation/maintenance work.
- Local browser storage may be evicted, cleared or lost with a device; persistent-storage requests are not guarantees.
- Conservative timer reconstruction may downgrade a fair attempt when the browser cannot prove time. That is preferable to an unsupported clean claim.
- A narrow cache does not make new content, adaptive Speaking or evaluation offline.
- Permanently offline/lost devices cannot receive deletion/rights revocation; leases, disclosure and next-online purge bound the limitation.
- Active incomplete raw Speaking turns may need fair recapture; reliability does not authorize permanent audio.

## Security, privacy, rights and accessibility

All local stores are origin-scoped but sensitive. They contain minimum continuity data, no provider tokens, no generic authenticated API cache and no raw audio in the general queue. CSP/Trusted Types, dependency integrity, authorization, CSRF/origin validation, shared-device threat review and exact legal notices remain Stage 23 release work. An app encryption key stored beside ciphertext is not accepted as meaningful protection.

Deletion tombstones apply before replay and purge local personal stores. Rights/blueprint leases bound offline starts and next-online reconciliation purges ineligible assets. Raw audio remains purpose-bound and ephemeral. Recovery status/actions use text and semantics, not color; save/timer transitions are sparse live-region announcements; keyboard, screen reader, reflow, zoom, reduced motion and error correction are release tested.

## Operations, cost and exit

Monitor de-linked checkpoint abort/quota, data-loss test results, outbox age, receipt uncertainty, dedupe/conflict/tombstone, timer reconstruction quality, technical invalidation scope, cache update/rollback, storage bytes and manual recovery. Do not log learner payloads, raw audio, guest capability or precise focus histories.

No new commercial dependency exists. Foreground IndexedDB + same-origin API is the cheapest complete fallback when service worker, Background Sync or BroadcastChannel is disabled. Disable or narrow the worker if cache/update incidents outweigh measured reload-continuity benefit. Add dedicated sync, downloadable packs, collaboration, stronger timing permits or platform-backed local protection only after the measured triggers and security/rights review in the full Stage-21 handoff.

## Validation and review triggers

Review or supersede this ADR when:

- recoverable Writing loss repeatedly exceeds approximately five seconds;
- an acknowledged answer/submission/turn is lost or one replay creates duplicate evidence;
- timer tests grant extra target time or cause frequent unexplained downgrade;
- a tombstone, rights revocation or late provider callback resurrects personal/restricted data;
- supported browser/storage/service-worker behavior changes materially;
- sustained outbox/SLO evidence justifies a dedicated service after ordinary tuning;
- measured offline demand justifies rights-safe downloadable packs;
- local-data threat evidence justifies recoverable platform-backed protection;
- product authority changes the already-loaded boundary or accommodation equivalence.

Any reversal creates a superseding ADR. Server evidence authority, account optionality, scoped fault neutrality, five validity states, six Readiness states, independent Written/Oral truth, no probability, raw-audio ephemerality and deletion dominance are not reopened.

## Traceability and downstream handoff

Primary sources: app/28-bestehen-app-product-specification.md; app/02-complete-learner-journey.md; app/06-daily-coaching-engine.md; app/07-core-learning-loop.md; app/12-writing-coaching.md; app/13-speaking-coaching.md; app/16-mock-exams.md; app/22-user-controls-vs-coach-autonomy.md; app/26-platform-accessibility-nonfunctional.md; Design §3.7, offline Writing and Flows D/F/G; Architecture Stages 05, 06, 08, 12, 13, 14, 16, 17, 18 and 20.

Stages 22–28 must preserve bounded loaded continuity, foreground replay fallback, owner-specific idempotent conflict truth, tombstone dominance, conservative timers, smallest affected evidence scope, exact save/sync claims, accessible neutral recovery and every global evidence/privacy invariant.
