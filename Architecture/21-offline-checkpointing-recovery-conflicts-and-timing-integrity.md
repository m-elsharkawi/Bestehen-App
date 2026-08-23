# Bestehen / App — Offline, Checkpointing, Recovery, Conflicts, and Timing Integrity

> **Stage:** 21 of 28  
> **Status:** Accepted architecture decision and implementation handoff  
> **Decision owner:** loaded-work offline continuity, browser persistence, checkpoint/outbox mechanics, reconnect/conflict recovery, interruption scope, and honest timer reconstruction  
> **Baseline:** m-elsharkawi/Bestehen-App@e475b848c2a38249c374f7778067bb0a6d3b728e; m-elsharkawi/Bestehen-Shaping@9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc  
> **Scope:** logical architecture only; no production code, schema migration, service-worker implementation, provider resource, product copy edit, or Design edit

## 1. Purpose and scope

Bestehen preserves learner work when connectivity, a browser process, a device clock, an evaluator, or an identity provider is unreliable. It does not promise a downloadable course or full offline parity. Launch continuity is deliberately bounded: a learner may continue an already-started activity only when every required content, media, policy, timer and persistence capability for that activity is already present and passes preflight.

PostgreSQL remains authority for accepted facts. IndexedDB is a same-origin write-ahead checkpoint and operation queue until a server receipt exists. A service worker caches a versioned application shell and explicitly admitted immutable assets; it never becomes a semantic database. Reconnect replays stable operations through the Stage-12 idempotent API and Stage-20 owner-specific merge rules. No clock, UUID, device, tab, cache, push hint or client projection may become Evidence or Readiness authority.

The only validity values remain valid, partially_valid, pending, interrupted and not_counted. The only Readiness client states remain evidence_building, not_ready, borderline, safe, ready_to_book and stale_contradicted. Missing remains absence, not zero. Written and Oral remain independent; Safe is not Ready to Book; no pass-probability field, model, event, copy template or hidden calculation exists.

## 2. Inputs, source snapshot, continuity, and authority

All required inputs were fetched from GitHub before deciding. App main was re-fetched immediately before drafting and remained exactly e475b848c2a38249c374f7778067bb0a6d3b728e. The required Stage 05, 06, 08, 12, 13, 14, 16, 17, 18 and 20 outputs are Accepted and compatible. This output was absent and Stage 21 began with 0 of 24 checklist boxes checked.

| Repository / path | Blob SHA | Use |
|---|---|---|
| App prompts/architecture/21_define_offline_checkpointing_recovery_conflicts_and_timing_integrity.txt | 5254656f3192c4c6a470c327400f28f7ae589598 | Binding execution contract |
| Shaping app/28-bestehen-app-product-specification.md | 18ae80cc2fd63cecd76c297c3e56d44a68367856 | Highest product authority and Stage-27 precedence |
| Shaping app/02-complete-learner-journey.md | 3c536176154a8239aeafc0697acd947280130142 | Return, partial work, and failed-mock recovery |
| Shaping app/06-daily-coaching-engine.md | 3cd869cd337dd3a878c27f35e1e8b5dad0c4c7bb | Meaningful activity boundaries and replanning |
| Shaping app/07-core-learning-loop.md | c313c859f64997972feca87497d70476c4528a20 | Exposure, retry freshness, interruption semantics |
| Shaping app/12-writing-coaching.md | 0a606197ad514e8c8958004188837e37173258be | Timed Writing and draft truth |
| Shaping app/13-speaking-coaching.md | 9462c78a1e7cc68249d38aa5a18a287be8aacd9c | Oral boundaries and technical invalidation |
| Shaping app/16-mock-exams.md | 8f6c23fa16524bd251cef39d823cfeea73bfcef3 | Granular mock continuity and pause rules |
| Shaping app/22-user-controls-vs-coach-autonomy.md | 27f33cd56a09df27952e15bb3dfd0e077b89633c | Learner control without truth editing |
| Shaping app/26-platform-accessibility-nonfunctional.md | 8137091683941b0d55f3d4fb90af3c402b8371e5 | Loaded-work boundary, approximately-five-second Writing loss bound, timer integrity |
| App Design/DESIGN-HANDOFF.md | 417a6820037e045e2dd9f29afc42b9f2e94fd638 | §3.7 recovery and failure ownership |
| App Design/Bestehen-02-Mobile-Screens.dc.html | 0a9f2d3ea982c3197f399941b57defd9869d2428 | Offline Writing and interrupted-mock screens |
| App Design/Bestehen-04-Flows-Handoff.dc.html | 7120b05a2272c31e5896e4313a7007935f5d0aed | Flows D, F, G and announcement contract |
| App Architecture/00-architecture-shaping-plan.md | b263c5e7b3bccc0450ddd17aa0cc007432d672b7 | Stage boundary and downstream ownership |
| App Bestehen_App_Architecture_Checklist.md | 71c1e7c79c6bf830f643485fe4316f0eab40f844 | Live Stage-21 checklist, initially 0/24 |
| App Architecture/05-data-ownership-persistence-and-schema-evolution.md | bb6df811ec9010de556d1719f22e31bb8ca3190e | IndexedDB, timestamps, retention, server authority |
| App Architecture/06-evidence-ledger-validity-versioning-and-audit.md | 53d34ae65ef4c8fa79c00026f9bd5d7b876ce672 | Five validity states and scoped fault handling |
| App Architecture/08-coaching-engine-and-session-state-machines.md | 02c5e1ee5967bad976eda49ab4813a768eda5bd3 | Session/activity boundaries and local failure |
| App Architecture/12-api-contracts-jobs-events-and-idempotency.md | c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528 | Operation receipts, compatibility and jobs |
| App Architecture/13-frontend-application-and-design-system-architecture.md | 7da94f122fa86412b0d1a12b84c123645693efb4 | Server-first UI and exhaustive discriminated states |
| App Architecture/14-responsive-accessibility-browser-and-device-architecture.md | 362068924a6942eb955dcc132fb4c94da122597b | Capability-local degradation and release evidence |
| App Architecture/16-listening-audio-tts-and-media-delivery.md | 6bb60e2d6048a39035107ff427a0c4fd305c1ba6 | Immutable media, preload and playback ordinals |
| App Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md | c2c3de417f1d3bcd8c53e1bf40fbb49522c34529 | Durable drafts and immutable submissions |
| App Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md | 2f118f817a99b76dc1e0c38c0aedaa1e0662268e | Ephemeral voice, turn commits and bounded evaluation |
| App Architecture/20-account-local-first-profile-sync-export-and-deletion.md | 9a1aa2d5fea31ff0bdccfc4561806bb870511ab6 | Stable IDs, semantic sync, conflicts and tombstones |

### 2.1 Authority reconciliation

The authority order is final specification, delegated detailed shaping with Stage-27 precedence, Identity, Product Overview, consistent human-authored Design, then illustrative runtime. Validity/fairness outranks direct evidence; direct evidence outranks independent Written/Oral risk; then uncertainty resolution, due repair/retention, progression/coverage and preference.

Design/DESIGN-HANDOFF.md §3.7 and Mobile Screens say an offline Writing timing claim is kept because the clock is local. The higher-authority product rule says it is kept only if local content, persistence and time anchors remain trustworthy. This architecture makes that condition explicit: network loss alone does not change a claim, but a missing/corrupt anchor, material reload interruption, expired asset lease or irreconstructible elapsed interval narrows the affected timing/continuity claim. Work is still preserved. This is clarification, not a Design edit.

Design Flow D provides three interruption choices and says backgrounding loses the affected clean claim. Product authority is more precise: mere hidden-page state does not pause the timer and is not automatically learner failure; a material interruption or untrustworthy reconstruction loses the claim. Stage 25 must reconcile final copy and interaction detail with this conditional truth.

No owner blocker remains.

## 3. Current browser evidence and selected baseline

Mutable platform facts were checked against current official specifications and browser documentation on 2026-08-23.

- IndexedDB supplies ordered transactional object stores, atomic commit/abort and a strict durability hint where loss risk outweighs battery/performance cost. Strict remains a hint, so UI confirms only a completed transaction and never promises device-level invulnerability: https://www.w3.org/TR/IndexedDB/
- The Storage Standard exposes usage estimates and a persistent-storage request. Best-effort storage may be evicted; persistence is granted by the user agent and cannot replace server receipts or honest loss messaging: https://storage.spec.whatwg.org/
- Service workers can intercept requests and maintain Cache API entries, but introduce persistent code/cache state with independent update lifecycle: https://www.w3.org/TR/service-workers/
- High Resolution Time defines performance.now and timeOrigin against a monotonic clock not affected by wall-clock adjustment within a reachable execution context; user agents may freeze callbacks in background and may reset the shared clock across browser restarts: https://www.w3.org/TR/hr-time-3/
- Background Synchronization remains unavailable in some widely used browsers. It is therefore an optional wake-up hint, never the only replay path: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
- BroadcastChannel is suitable for same-origin tab notifications, but it defines messaging rather than ordering or consensus. IndexedDB compare-and-set state remains authority: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel

No mutable commercial service is selected. The accepted Next.js/Node/PostgreSQL/pg-boss/R2 deployment remains unchanged.

## 4. Decision registry

| ID | Accepted decision | Meaningful alternatives and rejection | Consequence / trigger | ADR |
|---|---|---|---|---|
| ARCH-S21-D01 | Launch guarantees continuity only for already-loaded, preflight-valid work. | Full offline course duplicates delivery/rights/update systems. Online-only loses started work. | Add downloadable packs only after measured demand, rights-safe packaging and storage/upgrade evidence. | ADR-0029 |
| ARCH-S21-D02 | Use one narrow service worker for versioned shell and immutable admitted assets; no generic API cache. Installability is optional. | No worker cannot reload a loaded activity. Cache-everything leaks/stales semantic data. | Remove worker if browser evidence shows no continuity gain; expand only by manifest and threat review. | ADR-0029 |
| ARCH-S21-D03 | IndexedDB is the local write-ahead checkpoint/outbox; PostgreSQL is authority after receipt. | Memory/localStorage lose work or block the UI. Client-primary truth violates prior stages. | Schema major is versioned; incompatible upgrade fails locally with export/recovery, never destructive guessing. | ADR-0029 |
| ARCH-S21-D04 | Replay is foreground-first through stable IDs/hashes, server cursors and receipts; Background Sync is optional. | Dedicated sync service adds cost/authority. Background-only is not portable. | Consider a sync service only after sustained measured PostgreSQL/API SLO failure. | ADR-0029 |
| ARCH-S21-D05 | Server-owner semantics resolve conflicts; no global LWW or general CRDT. Draft branches are preserved. | Timestamp LWW can overwrite truth. Whole-model CRDT cannot decide validity/deletion/evidence. | Add text merge assistance only if branch frequency warrants it; submission remains explicit. | ADR-0029 |
| ARCH-S21-D06 | Tombstone/deletion dominates stale queued work; raw audio never syncs or enters general caches. | Replaying stale writes resurrects deleted data. Syncing voice violates Stage 18/20. | Late data is purged and audited; originating device owns transient voice lifecycle. | ADR-0029 |
| ARCH-S21-D07 | Timers combine in-context monotonic elapsed facts, persisted anchors and server-clock samples; reconstruction chooses a conservative supported elapsed interval. | Date.now alone is mutable. Interval callbacks freeze. Server round-trip per tick fails offline. | Unresolvable anchors preserve work but change the affected claim to interrupted/modified. | ADR-0029 |
| ARCH-S21-D08 | Backgrounding/sleep never pauses P4 time. Ordinary practice may pause explicitly. | Silent freeze grants extra time. Always-invalidating a hidden tab over-penalizes harmless scheduling. | Record visibility/suspension facts; invalidate only when continuity or trustworthy time is materially lost. | ADR-0029 |
| ARCH-S21-D09 | Interruption affects the smallest defensible scope; completed independent facts survive. | Whole-session discard wastes fair evidence. Clean-label preservation falsifies conditions. | Same exposed form may continue as practice; clean evidence uses a fresh equivalent scope. | ADR-0029 |
| ARCH-S21-D10 | Activity-specific data-loss budgets are release gates and visible save claims follow committed storage. | Vague autosave cannot be tested. Synchronous every-keystroke storage harms responsiveness. | Tune debounce only with crash-recovery evidence; never exceed product bounds. | ADR-0029 |
| ARCH-S21-D11 | Recovery UI is exhaustive, neutral, accessible and learner-controlled; faults never create learner-negative evidence. | Spinner/toast-only recovery hides consequence. Blocking modal prevents unaffected work. | Stage 25 implements/tests surfaces; semantics are fixed here. | ADR-0029 |
| ARCH-S21-D12 | Local data is minimized and bounded; browser persistence is not an encryption/security boundary. | Storing an app key beside ciphertext gives false assurance. Retaining everything increases loss exposure. | Stage 23 may add platform-backed protection only with a usable recovery/exit model. | ADR-0029 |

## 5. Offline capability matrix

“Offline” means the network is unavailable after the required activity was loaded and preflighted. It does not mean a cold first visit, new guest scope, new content selection, account recovery or provider work.

| Capability | Start offline? | Continue after loss? | Local requirement | Reconnect result / evidence boundary |
|---|---|---|---|---|
| App/recovery shell | Yes after one compatible load | Yes | Active + last-compatible versioned shell | Refresh policy and retire safe old generation at boundary |
| Loaded Reading / Language Elements objective task | Yes while content lease/current compatibility passes | Yes | Prompt/assets/key metadata, attempt policy, checkpoint store | Push one immutable outcome; deterministic server admission; no duplicate |
| Loaded Listening | Only after complete audio integrity/decode/output/preload and playback ledger preflight | Yes if all bytes and playback semantics remain intact | Immutable media revision, digest, full bytes, consumed-playback ordinals | Upload response/conditions; evaluator is unnecessary; missing/corrupt media is not_counted |
| Ordinary Writing | Yes for an already-created prompt/draft | Yes | Prompt/rubric revision, draft branch and timer mode | Submission queues; evaluation becomes pending until online |
| Timed/P4 Writing | Yes only with fresh permit, prompt/rubric, storage and timer anchors | Yes across network loss; not automatically across crash/reload | Complete prompt, strict checkpoint path, reconstructable target deadline | Preserve original response/conditions; evaluation pending; untrusted time narrows claim |
| Speaking fixed/reviewed practice | Only if all fixed partner assets exist and voice upload is not required for the promised path | Partial | Scenario/turn assets; ephemeral local turn buffer | Completed voice turns require recoverable upload before advance; unsupported audio dimension stays pending/not_counted |
| Adaptive Speaking / STT / oral evaluation | No provider work offline | Preserve completed prior turns; current meaning-dependent exchange may stop | No general raw-audio cache; originating attempt/turn manifest only | Resume only if interaction integrity holds; otherwise fresh fair turn/part |
| Productive evaluation | No | Attempt remains usable with pending dependent dimensions | Immutable submission receipt or queued operation | One bounded evaluation; no duplicate job; unrelated coaching continues |
| Mini/section/full mock | Start only when every required block asset, media, device, storage, timer and version lease passes | Continue exactly unaffected locally capable blocks | Frozen form manifest, rules, timer permit, per-unit checkpoints, media counters | Preserve granular evidence; no fabricated full result while productive parts pending |
| Readiness/history | Cached last-accepted view only | View only | Server-issued projection/source cut and “last synced” time | Refetch/recompute server-side; client never advances Readiness |
| Plan/session | Continue current pinned activity and cached approved fallback | Yes to meaningful boundary | Exact plan revision/activity intent and assets | Server reconciles occurrence; replan on new source cut |
| New content fetch / cold diagnostic / cold guest scope | No | Not applicable | None | Requires server and approved current bundle; no live Corpus search |
| Sync/account/export/deletion | No network effect offline | Queue only already-authorized ordinary mutation; sensitive rights commands require live recent auth | Never cache provider tokens; deletion intent may be shown but not claimed complete | Server-authoritative durable operation and proof |

An asset is “loaded” only when its immutable ID/revision, digest, rights/eligibility lease, contract major and every required byte are locally verified. A shell HTML response alone is not loaded work.

## 6. Components and ownership

| Component | Owns | Must not own |
|---|---|---|
| Activity controller | Current rendered state, commands, accessible notices | Accepted semantic truth |
| Local continuity adapter | IndexedDB transactions, schema migration, quota/persistence observations, recovery scan | Score, validity, Readiness |
| Checkpoint store | Latest recoverable mutable snapshot plus immutable version chain needed for recovery | Accepted server history after compaction |
| Operation outbox | Stable operation IDs, hashes, dependencies, attempts and receipts | Timestamp-based conflict choice |
| Reconnect coordinator | Foreground/page-resume/online replay and optional background wake | A new sync source of truth |
| Same-tab/multi-tab coordinator | Lease notifications and stale-view hints | Consensus; BroadcastChannel loss cannot corrupt state |
| Service worker/cache controller | Versioned shell and immutable allowlisted resource bytes | Learner response, auth, raw audio, projections, generic API responses |
| Timer integrity adapter | Monotonic observations, persisted anchors, reconstruction assessment | Learner ability or validity decision |
| Server Session & Attempt owner | Command admission, accepted sequence, immutable occurrence facts | Client-local unsaved draft authority |
| Evidence / Measurement owners | Five-state validity, corrections, deterministic projections/Readiness | Browser/provider guesses |
| Data Rights | Tombstones, purge and deletion proof | Resurrection by late outbox/job |
| Corpus ACL / Content | Async approved manifests and rights impact | Learner data or per-click runtime calls |

## 7. Local data, contracts, and versioning

The following are explanatory pseudotypes, not production TypeScript, DDL or endpoint code.

~~~text
LocalCheckpoint = {
  checkpoint_id, learner_scope_id, device_installation_id,
  activity_id, attempt_id, branch_id, checkpoint_ordinal,
  checkpoint_schema_major, activity_contract_major,
  content_revision_id, policy_versions,
  payload, payload_hash, committed_local_at,
  timer_anchor?, playback_ledger?, exposure_state?,
  server_receipt_id?, compact_after?
}

QueuedOperation = {
  client_operation_id, learner_scope_id, command_kind,
  semantic_id, canonical_payload_hash, expected_resource_version?,
  dependency_operation_ids[], contract_major,
  created_local_sequence, status:
    queued | sending | receipt_pending | accepted | pending |
    conflict | superseded | deleted | blocked_incompatible,
  last_attempt_class?, retry_not_before?, receipt?
}

TimerAnchor = {
  timer_contract: timer-integrity/v1,
  attempt_id, target_duration_ms, mode,
  start_context_id, performance_time_origin,
  start_monotonic_ms, last_monotonic_ms,
  client_wall_sample_at_start,
  server_clock_sample?: { server_at, client_send, client_receive, max_uncertainty_ms },
  persisted_checkpoint_at, target_deadline_estimate,
  visibility_intervals[], suspension_observations[],
  reconstruction_quality:
    in_context_trusted | cross_context_supported |
    expired | inconsistent | insufficient
}

RecoveryCase = {
  recovery_case_id, activity_id, detected_reason,
  last_local_checkpoint, last_server_receipt?,
  defensible_completed_scopes[], affected_scopes[],
  timer_quality, exposure_state, media/playback_state,
  choices[], semantic_effect
}
~~~

### 7.1 IndexedDB logical stores

| Store | Key / content | Durability and retention |
|---|---|---|
| meta | schema major, device installation ID, migration state, last server cursor | Strict for migration/cursor switch |
| checkpoints | activity/branch/ordinal snapshots and hashes | Strict before “Saved” for measured/productive work; compact only after receipt |
| operations | operation ID, payload/hash, dependencies and state | Strict before UI treats an offline mutation as queued |
| receipts | immutable server receipt and accepted cursor | Strict until related checkpoint compaction |
| conflicts | both local/server branches and reason | Retain until explicit resolution or deletion |
| tombstones | server deletion/supersession markers | Applied before replay; bounded by server horizon and deletion rules |
| resource-manifests | shell/content/media revision, digest, lease, cache keys | Metadata only; actual admitted bytes in Cache API |
| tab-leases | short activity writer lease with compare-and-set epoch | Advisory coordination; never semantic truth |

Schema upgrades are additive/transactional. A new client reads the previous supported major, migrates a copy, verifies counts/hashes, then switches meta. On quota, corruption or unsupported major it stops new measured work, preserves/exportable learner draft where safe, and offers Retry storage, Continue another activity, Download local draft, Reset this device with consequences, or Sign in/recover. It never clears automatically.

### 7.2 Checkpoint and operation transaction

1. Validate activity/contract/content versions and current writer lease.
2. Build a canonical payload and stable operation/checkpoint ID before network work.
3. In one short IndexedDB transaction append the next checkpoint and any queued operation, advance the local sequence, and update timer/playback/exposure facts.
4. Wait for transaction complete. Only then show “Saved on this device” or allow a measured boundary that depends on durability.
5. Attempt same-origin API submission when online. Network response without a durable local/server receipt remains receipt_pending and is safely queried/retried.
6. Persist receipt and opaque server cursor; mark checkpoint compactable.
7. Compact only checkpoints dominated by an accepted receipt, while retaining the acknowledged local recovery copy for the accepted Stage-05 maximum 24 hours and keeping abandoned drafts up to 30 days.
8. Any hash mismatch, reused operation ID with another payload or incompatible major fails closed into conflict/blocked_incompatible.

Strict durability is required for activity start anchors, measured responses, submission boundary, playback consumption, completed Speaking-turn manifests, outbox mutations and receipts. Relaxed durability may be used for replaceable cached projections, resource manifests recoverable from immutable bytes and high-frequency intermediate snapshots only when the five-second Writing loss test still passes.

## 8. Checkpoint / queue / reconnect state

~~~mermaid
stateDiagram-v2
  [*] --> preflight
  preflight --> local_ready: schema/quota/assets/timer pass
  preflight --> unavailable_local: capability fails
  local_ready --> editing
  editing --> checkpointing: response change / boundary
  checkpointing --> queued: transaction complete
  checkpointing --> save_failed: abort/quota/corruption
  queued --> sending: foreground online / retry now / optional sync wake
  sending --> receipt_pending: transport uncertain
  sending --> accepted: durable matching receipt
  sending --> pending: async evaluation accepted
  sending --> conflict: version/hash/domain conflict
  sending --> deleted: tombstone / scope deletion
  sending --> queued: retryable fault + backoff
  receipt_pending --> accepted: receipt query finds commit
  receipt_pending --> queued: server proves absent
  conflict --> queued: learner/domain resolution creates new operation
  accepted --> compactable
  pending --> accepted: terminal semantic result
  deleted --> purged_local
  save_failed --> editing: storage recovered, work still in memory
  save_failed --> recovery_required: safe persistence unavailable
  unavailable_local --> [*]
  compactable --> [*]
  purged_local --> [*]
~~~

Replay occurs on initial load, online, pageshow, return to visible foreground, explicit Retry now and optional service-worker sync. The durable outbox is the fallback; Background Sync is never required. One device coordinator acquires a short compare-and-set lease per activity and refreshes it at meaningful writes. BroadcastChannel announces changes, but every writer rechecks the IndexedDB lease/epoch in its transaction.

Operations are sent in dependency and local-sequence order, grouped by learner scope and bounded request size. Retry honors server Retry-After; otherwise sync-policy/v1 uses jittered bounded exponential delay and stops active retry after a small bounded series until another foreground/network signal. Authorization, deletion, validation and contract faults do not retry blindly.

## 9. Reconnect, idempotency, conflict, and tombstones

### 9.1 Reconnect sequence

~~~mermaid
sequenceDiagram
  participant UI as Activity UI
  participant IDB as Local continuity
  participant RC as Reconnect coordinator
  participant API as Same-origin API
  participant DB as PostgreSQL owners

  UI->>IDB: checkpoint + stable operation/hash
  IDB-->>UI: committed locally
  UI-->>UI: Saved on this device / Pending sync
  RC->>IDB: lease + oldest ready dependency batch
  RC->>API: push operations after opaque cursor
  API->>DB: authorize and apply owner commands idempotently
  DB-->>API: receipts/conflicts/tombstones/new cursor
  API-->>RC: complete discriminated result
  RC->>IDB: persist receipt/cursor before compaction
  RC->>API: pull changes after cursor
  API-->>RC: accepted facts/projections/tombstones
  RC->>IDB: tombstones first; replace caches; keep draft conflicts
  IDB-->>UI: sparse state/conflict notification
~~~

### 9.2 Conflict-resolution matrix

| Conflict / race | Local mechanism and authoritative resolution | Learner recovery | Evidence effect |
|---|---|---|---|
| Same operation ID + same hash | Query/return existing receipt | None | Exactly one effect |
| Same operation ID + different hash | Quarantine second payload; security/domain conflict | Preserve local copy; explicit retry/support | First fact remains; no duplicate |
| Same fact ID + same hash | Union once | None | One occasion |
| Different valid attempt IDs | Preserve both; exposure/independence owner decides | History may show both | Never clock-dedupe legitimate attempts |
| Mutable field same base | Expected version conflict | Show both values and explicit choose | No evidence rewrite |
| Writing draft branches | Preserve immutable branches; optional deterministic three-way text aid only | Compare/select/merge before new submission | Draft is not evidence; accepted submission immutable |
| Same activity in two tabs | IndexedDB writer lease/epoch prevents silent co-write | Open read-only/current, take over explicitly, or make separate attempt | Takeover/interruption condition recorded |
| Same active session on devices | Server owner refuses co-mingled timer/attempt | Join, separate attempt, or explicit takeover | No clock merge |
| Local derived view differs | Server projection/source cut replaces local cache | Show stale/rebuilding/Pending | Never merge score/Readiness/weakness |
| Stale content/policy major | Stop start/replay; preserve response | Update, continue ordinary narrower practice if safe, or export draft | No current-target claim from incompatible policy |
| Tombstone vs queued update | Apply tombstone first; mark op deleted and purge reachable payload | “Deleted on another device”; no resubmit | No resurrection |
| Deletion vs evaluator/provider callback | Server rejects, deletion job purges late result | Deletion proof stays retrying | No candidate/evidence recreation |
| Rights quarantine vs cached asset | Purge serving key at next online reconciliation; block new start after lease expiry | Approved replacement | System/content fault; zero learner penalty |
| Raw audio | Never general sync/cache | Retry on originating device within lifecycle or fresh sample | Pending/not_counted, never learner failure |
| Lost receipt after server commit | receipt_pending query by operation ID before resend | Automatic | Same committed semantic result |

Global last-write-wins, highest-score-wins, whole-profile CRDT, clock ordering and local projection upload are prohibited.

## 10. Service worker and cache contract

The launch service worker exists for continuity, not an install badge. A web-app manifest may provide a useful home-screen name/icon later, but installation, standalone display, push, background fetch and periodic sync are not launch dependencies.

### 10.1 Cache allowlist

May cache:

- hashed application JS/CSS/font/icon assets needed by the active and last-compatible shell;
- immutable approved prompt/instruction/media bytes explicitly included in an activity resource manifest;
- a minimal same-origin recovery/offline shell;
- non-personal reviewed repair assets whose rights and versions allow device caching.

Must never cache:

- authenticated HTML/API responses containing profile, evidence, Readiness or history;
- auth callbacks, OTP, cookies, tokens, exports or deletion proof;
- learner answers, Writing, transcripts, evaluator payload/results or operational logs;
- raw microphone audio or transient signed object URLs;
- raw Corpus/reference material, unapproved content or opaque cross-origin responses without explicit CORS/rights contract.

Every cache entry is addressed by immutable revision/digest, content type, byte size, rights/eligibility lease and owning manifest. Cache-first is allowed only for immutable admitted bytes. Navigations use network-first with the compatible recovery shell fallback. Semantic APIs are network-only and use IndexedDB state explicitly; the worker never manufactures a success response for a mutation.

A worker update installs alongside the current worker, verifies its cache manifest, then waits. Active measured activities stay pinned to the prior compatible shell/content contract. Activation occurs at a safe boundary or explicit restart; emergency security/rights revocation blocks affected new activity as soon as an online client learns it. Retain active + last-compatible shell generations and only resource generations referenced by active/local work; purge unreferenced/expired entries. A bounded offline-start eligibility lease prevents indefinite use of an unverifiable blueprint/rights version.

## 11. Data-loss budgets

| Activity / fact | Commit trigger and launch loss budget | What “saved” means | Failure recovery |
|---|---|---|---|
| Objective selection/typed short answer | Every change and navigation/submission boundary; no acknowledged selection loss after completed transaction | Current value/hash committed locally | Keep in-memory edit visible; retry before advancing |
| Writing draft | Input-coalesced checkpoints plus blur/visibility/navigation/submission; normally no more than approximately 5 seconds recent typing under recoverable App/browser failure | Exact shown saved time/revision is committed locally | Resume branch; download/copy if persistence fails |
| Timed start/deadline | Strict transaction before measured clock starts; zero accepted starts without anchor | Permit, duration, start anchors and policy committed | Do not start; ordinary practice alternative |
| Listening playback opportunity | Consume ordinal/ledger in strict transaction before audio begins; zero silent replay reset | Opportunity is durably consumed with media revision | If playback itself then fails, fault scope is not_counted; no learner penalty |
| Ordinary activity boundary | Attempt/checkpoint committed before leaving | Last meaningful boundary recoverable | Replan unfinished work without failure |
| Productive submission | Local immutable submission + operation before “Submitted”; zero acknowledged submission loss | Recoverable local or server copy exists | Query/retry by operation ID; Pending evaluation |
| Speaking | Every completed turn/part manifest committed before advance; zero completed-turn loss where browser/device permits | Complete digest/ordinal manifest recoverable locally/server-side | Active incomplete turn may need a fair fresh capture; raw lifecycle still applies |
| Mock unit/block | Each response, media counter and self-contained unit boundary; zero acknowledged completed-unit loss | Defensible scope and conditions reconstructable | Preserve completed scopes; affected continuous claim may narrow |
| Sync receipt/cursor | Receipt transaction before checkpoint compaction; zero accepted-effect duplication | Server acceptance and local receipt agree | receipt_pending query |
| Raw audio | No durability promise beyond explicit active/turn flow; never backup/general cache | Only current purpose-bound buffer/object exists | Loss is system fault; fresh capture, not learner failure |

The five-second Writing number is a shaped release boundary, not a precise guarantee against device destruction, explicit site-data clearing, private-browsing closure or operating-system storage failure. Save copy says “Saved on this device at …” until server receipt, then “Synced at …”. Storage pressure/persistence status and the guest/device-loss limitation are disclosed before meaningful local-only work accumulates.

## 12. Timer integrity model

### 12.1 Authority and reconstruction

Target time is an elapsed-duration claim, not a repeating callback and not a device wall-clock difference.

1. Before Start, pin timer-integrity/v1, target duration, attempt/form/policy, current compatible server-clock sample when required, performance.timeOrigin + performance.now, Date wall sample, visibility state and a unique context ID in one strict checkpoint.
2. While the context lives, elapsed time uses performance.now deltas. Rendering callbacks may be throttled; each displayed update derives from current anchors rather than decrementing a counter.
3. Persist last monotonic observation and corresponding epoch estimate at checkpoints and visibility/page lifecycle boundaries. Backgrounding does not pause target time.
4. On reload/recovery, compare the prior deadline/epoch estimate, new timeOrigin/monotonic value, wall-clock movement and a new server sample if online. Clock-quality policy accepts reconstruction only when independent anchors form a consistent conservative interval.
5. When credible anchors give a range, use the greatest supported elapsed value for enforcing the deadline; never choose a smaller elapsed value merely to retain a clean label. Record uncertainty.
6. If the device wall clock moves backward/forward materially, the browser restarts without compatible anchors, storage is missing, or samples conflict beyond the versioned tolerance, preserve the response and classify the affected continuous timing claim interrupted/modified. Do not guess extra time.
7. recorded_at and learner_sequence remain server authority for acceptance/order/retention. occurred_at is client-observed history with clock_quality. Neither UUID time nor sync order proves target duration.
8. A target deadline ends the measured response. Continuing produces a linked after-time practice revision, not a rewrite of the original.

### 12.2 Timer state

~~~mermaid
stateDiagram-v2
  [*] --> preflight
  preflight --> armed: assets/storage/clock policy pass
  preflight --> unavailable: missing capability
  armed --> running: strict start anchor committed
  running --> running_hidden: page hidden; clock continues
  running_hidden --> running: visible + anchors consistent
  running --> expired: elapsed reaches target
  running --> recovering: reload/crash/sleep observation
  running_hidden --> recovering: context recreated
  recovering --> running: supported reconstruction, no material interruption
  recovering --> modified: anchors inconsistent or continuity lost
  running --> practice_paused: ordinary non-P4 learner pause only
  practice_paused --> running: ordinary resume
  expired --> submitted
  modified --> continued_practice
  modified --> ended
  unavailable --> [*]
  submitted --> [*]
  continued_practice --> [*]
  ended --> [*]
~~~

### 12.3 Timer threat and failure table

| Threat/failure | Detection / reconstruction | Honest effect |
|---|---|---|
| User/device wall clock changes | Compare monotonic/context/server samples; wall clock never sole elapsed source | No guessed benefit; modified/interrupted if unresolved |
| Background timer throttling | Derive from anchors on visibility; do not count callbacks | Timer continues; claim survives if conditions intact |
| Device sleep | Deadline/monotonic/server interval comparison on wake | Continue/expire conservatively; uncertain scope narrows |
| Reload/navigation | Persisted start + new context reconciliation | Work returns; material continuous interruption may become interrupted |
| Browser/process crash | Recovery scan and last strict checkpoint | Data budget applies; clean continuity normally lost for affected block |
| Network loss | No timer effect if all local capabilities remain | Continue clean; evaluation/sync pending |
| Server clock unavailable | Valid unexpired local permit/anchors may continue loaded work | No cold high-stakes start if policy requires fresh sample |
| Clock sample high latency | Store round-trip uncertainty; reject stale/wide sample | Retry preflight or ordinary practice |
| Multiple tabs | Writer lease + context ID; other tab read-only/takeover | No merged timer; explicit takeover condition |
| OS notification/call | Visibility/suspension record; timer continues | If material interruption, preserve work and narrow claim |
| Learner hides visible countdown | Internal timer unchanged; sparse accessible announcements remain | No evidence effect |
| Accommodation adds time/pause | Exact verified profile/policy version | Actual condition explicit; Stage 23/25 owns equivalence |

Timer manipulation prevention is not an anti-cheat surveillance system. The architecture preserves honest conditions and detects technical inconsistency proportionately; it does not fingerprint devices or collect invasive focus histories.

## 13. Interruption and recovery rules

### 13.1 Smallest affected scope

| Activity | Network-only loss with intact local path | Crash/reload/material interruption | Resume choices |
|---|---|---|---|
| Ordinary objective task | Continue | Resume same attempt if no solution exposure/semantic ambiguity | Resume; replace affected item; stop at boundary |
| Repair/retry loop | Continue | After answer/model exposure, do not reuse exposed retry as fresh evidence | Resume repair; fresh equivalent retry; stop with transfer pending |
| Ordinary Writing | Continue branch | Resume exact draft branch | Continue; submit later; export/copy |
| P4 Writing | Continue if timer/storage intact | Preserve text; continuous claim interrupted unless reconstruction and product rule prove no material loss | Continue as practice, end/save, or fresh equivalent prompt |
| Listening | Continue only with complete verified media/playback ledger | Consumed ordinal never resets; mid-play failure affects smallest unit | Continue next valid boundary, fresh affected item/part, or end |
| Speaking | Preserve completed turns | Active incomplete turn/system-affected interaction is not learner failure | Fair fresh turn/part; typed learning-only; defer |
| Mini/section/full mock | Preserve unaffected completed units/blocks | Full/continuous label may be lost while completed blocks remain | Continue modified practice, end with partial evidence, or fresh clean block/form |
| Productive evaluation outage | Submission stays pending | No activity interruption | Continue unrelated work; bounded later evaluation |
| Identity/provider outage | Current local work continues | Sign-in/sync rights command waits | Retry identity later; no account wall/global block |
| Storage loss/clear | Memory work only until navigation; guest recovery may be impossible | No fabricated recovery | Sign-in server recovery if linked; otherwise honest loss/reset path |

### 13.2 Mock interruption / resume sequence

~~~mermaid
sequenceDiagram
  participant L as Learner
  participant UI as Mock UI
  participant LC as Local continuity
  participant API as Server owners
  participant EV as Evidence

  L->>UI: Start measured block
  UI->>LC: verify assets/media/quota + commit start/timer/playback anchors
  LC-->>UI: preflight accepted
  UI->>L: show rules, save state and target timer
  L->>UI: answer / Writing input / media action
  UI->>LC: strict checkpoints at owned triggers
  Note over UI,LC: network loss alone; local target conditions continue
  UI->>LC: checkpoint responses + elapsed/playback facts
  UI-->>L: Offline · saved on this device · timer continues
  Note over UI,LC: crash/reload/material interruption
  UI->>LC: recovery scan
  LC-->>UI: completed scopes, affected scopes, exposure/media/timer quality
  UI-->>L: explain what was saved and what claim changed
  alt continue same exposed work
    L->>UI: Continue as practice
    UI->>LC: mark affected continuous scope interrupted/modified
  else end
    L->>UI: End and keep completed work
  else fresh measurement
    L->>UI: Choose fresh equivalent block/form later
  end
  UI->>API: replay exact operations after reconnect
  API->>EV: accept only defensible scoped observations
  EV-->>UI: five-state results; pending only blocks dependencies
~~~

Recovery preserves learner work before preserving a clean mock label. A system fault never yields a failed mock. Unanswered content is incomplete in this simulation, not a broad weakness.

## 14. Recovery UI/domain contract

### 14.1 Exhaustive states

| State | Required learner information | Primary actions | Semantic effect |
|---|---|---|---|
| local_saved_sync_pending | What is saved, device-only time, network state | Keep working, Retry sync | No accepted server claim yet |
| sync_in_progress | Exact scope and non-blocking status | Continue elsewhere | No duplicate UI promise |
| receipt_uncertain | Request may have committed | Check status, Keep local copy | Query before resend |
| conflict_requires_choice | Both values/branches and owner meaning | Compare, choose/merge, defer | No automatic truth change |
| stale_or_incompatible | Asset/policy/client version and affected claim | Update, safer practice, export draft | No current-target overclaim |
| storage_at_risk | Persistence/quota unavailable and exact consequence | Free space, request persistence, copy/export, another activity | Do not start measured work |
| save_failed | Last successful save time and in-memory risk | Retry, copy response, end safely | Never say saved |
| timer_reconstructed | Remaining time and that time continued | Continue/end | Claim only if quality supports it |
| timing_uncertain | Work preserved; clean timing cannot be proved | Continue practice, end, fresh attempt | affected scope interrupted/modified |
| media_or_partner_fault | Owner, saved parts and unaffected work | Retry fresh scope, alternate skill | affected scope not_counted/partial |
| evaluation_pending | What is complete and what depends on evaluation | Continue elsewhere, check later | dependent dimensions pending |
| deleted_or_revoked | Server tombstone/source and local purge result | Acknowledge, new independent start if desired | no replay/resurrection |
| local_data_missing | Device/site data is absent; linked-account recovery availability | Sign in/recover, start fresh, help | no guessed local history |
| recovered | Exact checkpoint and consequence | Resume or choose another action | sparse success announcement |

Notices use persistent inline status near the affected work, not color alone or a blocking modal. A polite live region announces meaningful transitions such as offline/saved, save failed, evaluation ready and recovered; timer ticks are never announced. Target timer announcements follow the accepted sparse 10/5/1-minute and final rule contract. Focus moves only for a modal the learner deliberately opens; recovery choices are keyboard-operable, labelled, reflow to 320 CSS px / 400% zoom as applicable, preserve typed work during error correction, and never require memory of an earlier message.

### 14.2 Neutral copy facts

Copy is assembled from structured facts: responsible system/provider/content condition; last committed checkpoint; affected scope; preserved scope; changed evidence claim; next choices. It never says “you failed,” “your answer was lost” when a checkpoint exists, “synced” before receipt, “timer paused” during target work, or “complete” while evaluation/deletion is pending.

## 15. Security, privacy, rights, and deletion

- IndexedDB, Cache API and service-worker registrations are same-origin browser storage, not protection against XSS, compromised browser profiles, shared devices, extensions or explicit site-data clearing. Stage 23 must enforce CSP/Trusted Types/dependency controls, CSRF/origin checks and redacted telemetry; local storage is minimized regardless.
- Provider/session tokens remain Secure HttpOnly same-origin cookies and never enter Cache API, IndexedDB payloads or service-worker messages. Guest capability handling remains Stage 20; no browser fingerprint is added.
- Checkpoints contain only the minimum response/activity facts needed for continuity. Replaceable projections and approved assets are separate so deletion/expiry can purge learner data without corrupting shared resources.
- Raw audio uses the Stage-18 purpose-bound buffer/object path, never the general outbox, service-worker cache, browser backup or cross-device sync. It is deleted immediately after final evaluation and no later than seven days while pending, with proof.
- Writing remains retained/exportable under Stage 17/20. Restricted content bytes are excluded from learner export; IDs/rights-safe descriptions preserve lineage.
- Deletion tombstone is applied before any replay. Local outbox, checkpoints, conflicts, receipts, caches containing learner-specific assets and service-worker messages are purged. A permanently offline/lost device cannot be remotely erased; the disclosure and server restore-suppression truth remain Stage 20.
- Requesting persistent storage is contextual after meaningful local work or before a measured commitment, with an explanation. Denial is not an account/access wall; the product offers safe alternatives and honest risk.
- Browser data at rest is not claimed encrypted merely because values could be wrapped with a key stored in the same origin. A future platform-backed key design requires Stage-23 threat/recovery/portability approval.
- Cached rights eligibility has a bounded signed/versioned lease. Next online reconciliation purges a quarantined asset. Offline work after lease expiry cannot start a new current-target claim.

Exact jurisdictional legal wording, consent/processor assessment, retention notices and accommodation authority remain Stage 23 and legal/accessibility review. They may strengthen controls but not weaken local minimization, deletion dominance, raw-audio ephemerality or access.

## 16. Failure, validation, operations, performance, and cost

### 16.1 Failure matrix

| Failure | Result | Recovery / forbidden result |
|---|---|---|
| IndexedDB unavailable/blocked/quota/corrupt | local_unavailable/save_failed | Do not start measured work; never clear silently |
| Service worker install/update fails | Online app remains usable; reload continuity may be unavailable | Direct network path; no global block |
| Cache digest/lease mismatch | resource unavailable/not_counted if already affected | Purge and fetch approved revision; no learner penalty |
| Network flaps | queued/receipt_pending | Query receipt, idempotent retry; no duplicate |
| Background Sync never fires | queue remains durable | foreground/online/retry path |
| Multi-tab lease expires | re-elect via compare-and-set | explicit takeover; no co-write |
| Contract major unsupported | blocked_incompatible | update/fallback/export local draft; no invented default |
| Server rejects stale version | conflict | owner-specific resolution; never clock LWW |
| Timer anchors conflict | timing_uncertain | preserve work, narrow claim, fresh measurement option |
| Clock expires while UI frozen | expired on next derived render/action | no extra target time |
| Content rights/quality withdrawal | cache blocked/purged | unaffected evidence preserved; correctness defect correction separately |
| Evaluation/provider outage | pending/not_counted dependent scope | bounded retry/fresh sample; unrelated work continues |
| Deletion arrives during replay | deleted, purge local | reject all late writes; no resurrection |
| Device/site-data loss | local history absent | linked server recovery or honest unrecoverable guest loss |

### 16.2 Release validation

| Test family | Required evidence |
|---|---|
| Checkpoint crash matrix | Kill/reload at input, transaction, visibility, submit and receipt boundaries; prove budgets |
| Idempotency/property tests | duplicate/reorder/drop every request/response; one semantic effect and stable receipt |
| Conflict/tombstone tests | concurrent fields/drafts/devices, delete race, late job/provider result; no resurrection |
| Timer matrix | wall-clock forward/back, sleep, hidden tab, throttled callbacks, reload, restart, offline, multi-tab; no extra guessed time |
| Mock granularity | interruption at every unit/block; preserve exactly defensible scopes |
| Media/playback | full cache/digest/decode; consumed ordinal before play; crash mid-audio; no free replay |
| Service-worker update | active attempt pinned while new worker waits; rollback to last compatible; revocation purge |
| Storage | best-effort/persistent denied, quota pressure, private mode, eviction, schema upgrade/corruption |
| Browser/device | current/current-previous supported families on real phone/tablet/desktop, including iOS/Safari lifecycle |
| Accessibility | keyboard, VoiceOver/NVDA, reflow/zoom, live regions, reduced motion, hidden timer and error recovery |
| Security/privacy | XSS/cache poisoning scope, auth secret exclusion, local deletion, no raw-audio cache/backup/log |
| Exit | Disable worker/Background Sync/BroadcastChannel and replay through foreground IDB+API with same semantics |

Release blocks if repeated recoverable Writing loss exceeds approximately five seconds, an acknowledged objective/completed-turn/submission is lost, reconnect duplicates evidence, a timer gains unearned time, a tombstone resurrects data, or an inaccessible recovery path blocks core work.

### 16.3 Operations and cost

Measure de-linked counts/latencies for checkpoint abort/quota, save age, recovered bytes/time, outbox depth/oldest age, receipt uncertainty, dedupe/conflict/tombstone, timer reconstruction class, technical invalidation scope, cache hit/bytes/eviction/update rollback and manual retry. Never log response text, transcript, raw audio, guest capability or a precise browsing/focus history.

The baseline adds no paid provider or infrastructure service. Costs are existing PostgreSQL request/storage, R2 approved media egress/storage, application bandwidth and browser disk/battery/maintenance. The service worker reduces repeat immutable asset transfer but increases cache/update test duty. IndexedDB writes are coalesced within the fixed loss budgets; measured boundary writes prefer durability over throughput.

Cheaper fallback is the same App without install manifest, Background Sync or BroadcastChannel: foreground IndexedDB outbox + online/pageshow replay + explicit Retry. If service-worker defects exceed continuity benefit, retain local checkpoints and require an online reload shell. Dedicated offline-sync infrastructure, Background Fetch, periodic sync, downloadable course packs and multi-region are rejected until measured need.

Upgrade triggers:

- sustained outbox age or conflict load breaches Stage-24 SLO after ordinary indexing/batching;
- measured offline demand shows approved downloadable packs materially improve completion without rights/update harm;
- supported-browser evidence makes optional background wake reliable enough to reduce manual recovery;
- full-form media size/quota failures require an explicit downloadable pack manager;
- repeated timer uncertainty requires a stronger server-issued timing permit or narrower offline-start rule;
- local sensitive-data threat evidence justifies platform-backed encryption with recovery/exit;
- real multi-device concurrent editing justifies a dedicated draft collaboration design, never evidence CRDT.

Provider exit is trivial: no new provider exists. Browser primitives are behind App-owned LocalContinuity, ResourceCache and TimerIntegrity ports; disabling an optional primitive leaves foreground replay semantics intact.

## 17. Traceability and downstream handoff

| Decision area | Primary product/design source | Downstream consumers |
|---|---|---|
| Loaded-work boundary | app/28 §§14–15; app/26 §3.9; Design §3.7 | 22–28 |
| Checkpoints/loss budgets | app/26 §§3.13, 4.5; Writing; Speaking; Mobile offline Writing | 23–25, 28 |
| Timer integrity | app/12 §10; app/16 §§4.5–4.6; app/26 §3.14; Flow D/F | 23–25, 28 |
| Interruption scope | app/02; app/07; app/16; app/22; Flow D/F | 22–28 |
| Semantic conflicts/tombstones | Stages 05, 06, 12 and 20 | 22–28 |
| Accessibility/recovery | app/26; Design §3.7 and announcement contract; Stage 14 | 23, 25, 28 |
| Raw audio/content rights | app/13, app/26; Stages 16, 18, 20 | 23–26, 28 |

Downstream stages must preserve:

- already-loaded continuity without promising full offline parity;
- IndexedDB as pre-receipt write-ahead state and PostgreSQL as accepted-fact authority;
- stable operation IDs/hashes, server cursors/receipts and owner-specific merge; no global LWW/CRDT;
- deletion tombstone dominance and no raw-audio sync/cache/backup;
- exact five validity and six Readiness states, independent Written/Oral truth, absent not zero and no probability;
- network loss alone may preserve clean conditions; untrustworthy time/material interruption narrows only affected scope;
- target time never freezes in background, resets on reload or gains guessed extra time;
- completed unaffected work survives and learner work outranks a clean mock label;
- neutral accessible recovery with save/receipt truth and no global fault block;
- async Corpus only, no learner data or live per-click Corpus/AI.

Dependencies introduced: local-continuity-schema/v1, timer-integrity/v1, sync-policy/v1, versioned resource manifest/eligibility lease, strict checkpoint/operation/receipt stores, foreground reconnect coordinator, conflict/recovery discriminators and release crash/timer fixtures.

Dependencies removed/rejected: generic API caching, permanent offline course, dedicated sync service, Background Sync dependency, interval-countdown authority, Date.now-only timing, timestamp LWW, whole-model CRDT, raw audio in general outbox/cache, and installability as a launch goal.

## 18. Risks, assumptions, validation, and deferrals

| Risk / assumption | Evidence / mitigation | Owner |
|---|---|---|
| Strict durability behaves differently across browsers/devices | crash/power-loss matrix; “saved” only after transaction complete; server receipt remains stronger | Stage 25 / implementation |
| Browser storage is evicted or private-mode temporary | persistence/quota preflight, disclosure, server sync, export/copy recovery | Stage 23/25 |
| Service-worker stale asset/cache poisoning | immutable digest/manifest, safe activation, last-compatible rollback, CSP/supply-chain tests | Stage 23/25 |
| Timer behavior differs over sleep/restart | real-device anchor matrix and conservative downgrade | Stage 25 |
| Network-only loss is mistaken for interruption | tests prove local media/timer/persistence continuity and condition facts | Stage 24/25 |
| Multi-tab lease notification is lost | IDB compare-and-set is authority; BroadcastChannel only hint | implementation |
| Offline rights revocation cannot reach device | bounded eligibility lease + next-online purge; legal review of lease length | Stage 23 |
| Data-loss telemetry becomes invasive | de-linked operational facts only; no payload/session replay/focus history | Stage 23/24 |
| Active raw turn cannot be recovered | fair fresh capture and zero learner penalty; completed turns committed | Stage 18/25 |

Intentionally deferred implementation choices:

| Choice | Future owner | Fixed boundary |
|---|---|---|
| Exact IndexedDB wrapper/library, object-store field names and batching sizes | implementation | logical stores, atomicity, versions and budgets fixed |
| Exact retry delays, lease duration, checkpoint coalescing under five seconds, cache lease duration | Stage 24/25 calibration + implementation | versioned parameters, bounded retry, rollback and release tests |
| Final UI component layout/copy | Stage 25 | exhaustive recovery facts/actions and accessibility fixed |
| CSP/Trusted Types, cryptographic key handling, local shared-device threat response | Stage 23 | browser storage not falsely claimed secure/encrypted |
| Accommodation timing equivalence | Stage 23/legal/accessibility review | actual condition and conservative standard P4 claim fixed |
| Notification/time-zone/calendar semantics | Stage 22 | timer elapsed facts are not scheduling authority |
| SLO/error-budget thresholds | Stage 24 | no enterprise SLA invented; critical integrity release gates fixed |
| Optional install manifest/push/background features | Stage 22/25 or later | service-worker continuity does not depend on them |
| Exact HTTP paths/DDL/runtime code | implementation | commands, IDs, hashes, states, owners and compatibility fixed |

No owner question is open.

## 19. ADR

Created:

- Architecture/adr/ADR-0029-bounded-local-write-ahead-continuity-and-conservative-timer-reconstruction.md — Accepted.

ADR-0029 applies ADR-0001 through ADR-0028 where relevant and supersedes none.

## 20. Decisions made

1. Bounded offline continuity applies only to preflight-valid already-loaded work.
2. A narrow service worker caches immutable admitted assets and a recovery shell; semantic APIs/data remain outside Cache API.
3. IndexedDB provides transactional checkpoints/outbox/receipts; PostgreSQL remains accepted-fact authority.
4. Foreground-first idempotent replay is mandatory; Background Sync/BroadcastChannel are optional hints.
5. Stage-20 owner-specific merge, branch preservation and tombstone dominance remain exact; no LWW/CRDT.
6. Data-loss budgets are explicit for objective, Writing, timers, playback, productive submissions, Speaking and mocks.
7. Timers use monotonic/context/server anchors and conservative reconstruction; target time never silently freezes/resets.
8. Network-only loss may preserve a clean claim; material interruption or untrustworthy anchors narrow only affected scope.
9. Recovery preserves completed work before a full/clean label and offers continue-practice, end/keep, or fresh measurement.
10. Recovery UI exposes saved/synced/conflict/stale/storage/timer/media/evaluation/deletion states accessibly and neutrally.
11. Browser local storage is minimized and bounded, not claimed as a security/encryption boundary; raw audio never enters general sync/cache.
12. The baseline adds no paid service and has explicit disable/upgrade/exit paths.

## 21. Definition-of-done check

- [x] Every required current input and relevant direct source was read; immutable heads/blobs and prerequisite continuity are recorded.
- [x] Source authority and Stage-27 precedence are applied; timing copy is reconciled without editing Design.
- [x] Offline matrix covers objective work, Writing, Listening, Speaking, evaluation, mocks, Readiness, sync and content fetch.
- [x] Service-worker/PWA scope is evidence-driven and excludes semantic/private/raw-audio caching.
- [x] Checkpoints, stores, outbox, reconnect, receipts, retry, conflicts, branches, tombstones and compaction are implementable.
- [x] Monotonic/wall/server clock use, reconstruction, background, sleep, reload and clock-change behavior are fixed.
- [x] Ordinary, continuous and mock interruption semantics preserve the smallest defensible evidence scope.
- [x] Crash/reload/network/provider/stale-version/storage-loss recovery states and transitions are complete.
- [x] Offline capability matrix, queue state diagram, timer model/threat table, conflict matrix, mock sequence and data-loss/recovery contract exist.
- [x] Data/API/state/ownership/compatibility, security/privacy/rights, accessibility, failure, cost, operations, validation and exits are complete.
- [x] ADR-0029 is Accepted and indexed; all 24 Stage-21 checklist items are supported.
- [x] No owner blocker remains and no production/configuration, Shaping/Design, earlier/later output or unrelated checklist work is authorized.
