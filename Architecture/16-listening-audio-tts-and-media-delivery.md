# Bestehen / App — Listening, Audio, TTS, and Media Delivery

> **Stage:** 16 of 28  
> **Status:** Accepted architecture decision  
> **Decision date / mutable-source access date:** 2026-08-23  
> **Owning boundary:** Content & Forms publishes approved audio; Session & Attempt owns playback occurrences; Evidence & Capability interprets actual conditions.

## 1. Purpose and scope

This stage fixes the smallest sufficient runtime and media architecture for H1 global, H2 detail, and H3 selective Listening. It binds every attempt to immutable approved bytes, exact playback opportunities, actual speed/replay/transcript conditions, locally proven readiness, and neutral recovery. The browser observes and renders; it never decides learner ability, validity, progression, Readiness, mock validity, or Ready-to-Book.

The default is reviewed scripts, offline batch synthesis, final-byte audit, immutable storage, and reuse. There is no per-play AI or TTS call and no live Corpus dependency. P4 needs current target conditions and target-calibrated audited voice/audio variety; one synthetic voice or one provider can never silently establish broad Listening Readiness.

This stage does not implement media endpoints, players, jobs, database schema, storage configuration, or TTS calls. It does not choose recording formats or raw-speaking-audio behavior (Stage 18), authoritative timer mechanics (Stage 21), final identity/retention/legal controls (Stage 23), numeric operational thresholds (Stage 24), or the release browser matrix execution (Stage 25).

Hard truth remains unchanged:

- the validity set is exactly valid, partially_valid, pending, interrupted, not_counted;
- a media, browser, output-device, network, content, rights, or system fault has zero learner-negative effect;
- accessibility support is valid under its recorded actual condition; if it changes the tested capability, it narrows the target claim rather than penalizing the learner;
- unrelated skills and already-valid units remain available;
- Written and Oral gates are independent, missing evidence is absence rather than zero, Safe is not Ready to Book, and no pass-probability field, calculation, event, copy, or telemetry dimension exists.

## 2. Inputs, authority, and continuity

GitHub was the source of truth. The read-only Shaping source was read at commit 9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc. App prerequisites and design were read at accepted App commit eb2dfa40f7f231b0802e87c419619e26fa78504c. The Stage-16 prompt blob was e32aeb903169907da8b782c2c4a54545dbcae535. The Stage-16 checklist baseline blob was e08e9d657f96403e4216e1b2494a3a381bee42d7 and all 24 Stage-16 items were open.

### 2.1 Required current source record

| Repository path | Blob SHA |
|---|---|
| Bestehen-Shaping/app/28-bestehen-app-product-specification.md | 18ae80cc2fd63cecd76c297c3e56d44a68367856 |
| Bestehen-Shaping/app/07-core-learning-loop.md | c313c859f64997972feca87497d70476c4528a20 |
| Bestehen-Shaping/app/08-a1-to-b1-progression.md | 839a01c010cf79777520714d0ab09304a2ba9a06 |
| Bestehen-Shaping/app/11-listening-training.md | e77948d6722b2ce635886d4b345e2ff9aad476a8 |
| Bestehen-Shaping/app/14-review-and-spaced-repetition.md | fa9b65e92cd1511e00e106a199eb6fbc06273a69 |
| Bestehen-Shaping/app/16-mock-exams.md | 8f6c23fa16524bd251cef39d823cfeea73bfcef3 |
| Bestehen-Shaping/app/21-content-strategy.md | 8149d6a268da70e17cad46f774b9d5de77776986 |
| Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md | 8137091683941b0d55f3d4fb90af3c402b8371e5 |
| Direct precedence rule: Bestehen-Shaping/app/27-end-to-end-scenario-validation.md | 5da3b0a27ba516770210773399f0415cfb1f5460 |
| Bestehen-App/Design/DESIGN-HANDOFF.md | 417a6820037e045e2dd9f29afc42b9f2e94fd638 |
| Bestehen-App/Design/Bestehen-01-Design-System.dc.html | d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a |
| Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html | 0a9f2d3ea982c3197f399941b57defd9869d2428 |
| Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html | 7120b05a2272c31e5896e4313a7007935f5d0aed |
| Bestehen-App/Architecture/00-architecture-shaping-plan.md | b263c5e7b3bccc0450ddd17aa0cc007432d672b7 |
| Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md | bb6df811ec9010de556d1719f22e31bb8ca3190e |
| Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md | 53d34ae65ef4c8fa79c00026f9bd5d7b876ce672 |
| Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md | e6fb121ab1b10c6cbcf692bc88acaf98f2e45e7a |
| Bestehen-App/Architecture/10-corpus-integration-compatibility-cache-and-rights.md | d4e1ab25e359dcfcc506ee29462760a41647138d |
| Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md | c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528 |
| Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md | 7da94f122fa86412b0d1a12b84c123645693efb4 |
| Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md | 362068924a6942eb955dcc132fb4c94da122597b |

All seven required architecture stages are Accepted and consistent. Stage 05 makes PostgreSQL semantic authority, private object storage the byte authority, and browser storage a bounded continuity copy. Stage 06 owns the exact five validity states and scoped correction. Stage 09 pins immutable media revisions, final-byte QA, rights/accessibility gates, and content-family exposure. Stage 10 keeps Corpus asynchronous and learner-free. Stage 12 fixes typed HTTP contracts, durable jobs, idempotency, and conflicts. Stage 13 gives Listening the shared five-skill shell with a narrow media controller. Stage 14 requires an actual playback probe, full measured-asset readiness, learner output confirmation, and activity-local failure.

### 2.2 Authority reconciliation

The final specification delegates Listening detail to app/11-listening-training.md, progression conditions to app/08-a1-to-b1-progression.md, and mock playback to app/16-mock-exams.md. They agree:

- H1: five short texts, each once in clean target conditions.
- H2: one longer conversation/interview, played twice.
- H3: five short functional texts, each twice.
- P0–P3 can use declared speed/replay assistance; P4 uses authored target speed and the current verified target rule.
- full transcripts are post-attempt diagnosis/repair support; P4 withholds them for the whole measured block.
- target-condition media/output preflight occurs before timing and exposure.
- a failed clip is not_counted for the affected scope; valid unaffected units survive.

Design copy “Listening · 1 replay” is a drawn ordinary-practice example, not a universal rule. Product app/08 and app/11 own the exact profile/family playback count, so the UI renders the server-supplied remaining count. Design’s Space/R shortcuts are optional guarded conveniences, not extra rights. No source contradiction requires a shaping or design edit.

Stage-27 precedence is applied throughout: validity/fairness → direct evidence → independent Written/Oral risk → uncertainty resolution → due repair/retention → progression/coverage → preference.

### 2.3 Current primary technical and commercial evidence

All mutable facts below were accessed on 2026-08-23. Static tables are planning evidence only; the Stage-14 current/current-previous browser matrix plus a real candidate decode remains the release authority.

| Source | Decision use |
|---|---|
| [MDN Web audio codec guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs) | MP3 is supported by the launch browser families and its patents have expired; Opus is open and efficient but container/browser details add a second path. |
| [WHATWG HTML media](https://html.spec.whatwg.org/multipage/media.html) | Native audio events and playback are observations, not evidence authority. |
| [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/) | Standard: USD 0.015/GB-month, Class A USD 4.50/million, Class B USD 0.36/million, free Internet egress; free tier 10 GB-month, 1M Class A, 10M Class B. Prices are mutable. |
| [Cloudflare R2 data location](https://developers.cloudflare.com/r2/reference/data-location/) | EU jurisdiction guarantees storage/processing within the EU; a location hint is only best effort. Jurisdiction cannot later be changed. |
| [Cloudflare R2 data security](https://developers.cloudflare.com/r2/reference/data-security/) | R2 encrypts objects/metadata at rest and uses TLS in transit. |
| [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) | Time-limited object-specific access; URLs are bearer tokens and cannot use a custom domain. |
| [Cloudflare cache with R2](https://developers.cloudflare.com/cache/interaction-cloudflare-products/r2/) | Edge caching requires a custom domain and makes the bucket publicly reachable unless additional access controls are applied. |
| [Cloudflare R2 consistency](https://developers.cloudflare.com/r2/reference/consistency/) | Edge cache can retain overwritten/deleted objects; immutable keys plus explicit purge are required. |
| [Amazon Polly pricing](https://aws.amazon.com/polly/pricing/) | Standard USD 4, Neural USD 16, Generative USD 30 per million characters; generated audio may be cached/replayed without further Polly charge. Prices/free tier are mutable. |
| [Amazon Polly available voices](https://docs.aws.amazon.com/polly/latest/dg/available-voices.html) | German de-DE currently includes standard, neural, and generative candidates; capability is resolved at authoring time, not assumed forever. |
| [Amazon Polly generative voices](https://docs.aws.amazon.com/polly/latest/dg/generative-voices.html) | German candidates exist in Europe (Frankfurt); provider warns generative speech can cut or hallucinate, reinforcing final-byte script audit. |
| [Amazon Polly privacy/security service card](https://docs.aws.amazon.com/ai/responsible-ai/amazon-polly/overview.html) and [security best practices](https://docs.aws.amazon.com/polly/latest/dg/security-best-practices.html) | Polly says synthesis inputs/outputs are not stored or used for training; traffic/data encryption and least privilege remain App obligations. |
| [Official TELC B1 page](https://www.telc.net/sprachpruefungen/deutsch/zertifikat-deutsch-telc-deutsch-b1/) and [official model test](https://shop.telc.net/media/catalog/product/file/2/0/20201225_5061-b00-010301_web.pdf) | Current target blueprint and playback constraints must be revalidated before each P4 policy release. |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Instruction, controls, focus, reflow, status, and alternatives remain a WCAG 2.2 AA release gate. |

## 3. Architecture decisions

| ID | Decision and simplest sufficient default | Consequence / exit / review trigger | ADR |
|---|---|---|---|
| ARCH-S16-D01 | Bind every H1–H3 block to an immutable ListeningPlan whose ordered occurrences carry family, clip, allowed play count, authored speed, sequencing, transcript phase, and evidence role. P4 is H1 once, H2 twice, H3 twice under a current blueprint. | The client cannot invent replay or order. Blueprint change publishes a successor plan and recomputes only current-target eligibility. | ADR-0024 |
| ARCH-S16-D02 | Session & Attempt owns an idempotent PlaybackOccurrence ledger: authorize one ordinal, record started/completed/failed actual facts, and never issue a duplicate ordinal after reload/retry. | A technical fault never buys a same-content “clean” replay. The affected scope is replaced fairly. Exit is provider-neutral HTTP/outbox contracts. | ADR-0024 |
| ARCH-S16-D03 | Extend Stage-09’s immutable media manifest with a lossless approved master, one launch MP3 learner rendition, script/transcript lineage, voice/model release, acoustic and pronunciation QA, rights, and reveal policy. | A changed render/voice/trim is a successor media revision; provider identity is provenance, never semantic identity or freshness. | ADR-0024 |
| ARCH-S16-D04 | Keep the accepted private EU R2 Standard bucket. Serve short-lived, object-specific authorized reads; do not add a public CDN at launch. MP3 is the sole required launch rendition; preserve a lossless master. | Lowest coupling and one browser path. Add Opus/edge cache only from measured bytes/latency/Class-B pressure and only with equivalent QA and access control. | ADR-0024 |
| ARCH-S16-D05 | A clean measured block starts only after every required byte is fully fetched, digest/length verified, loaded/decoded by the actual browser candidate, retained locally for the block, output test confirmed by the learner, and a versioned preflight receipt issued. | Poor connectivity is discovered before exposure/timing. A heuristic ready event alone is insufficient. Preflight expires on asset/policy/device/context change. | ADR-0024 |
| ARCH-S16-D06 | Use provider-neutral offline batch synthesis; launch default is Amazon Polly Neural in Europe (Frankfurt), evaluated from current German candidates, followed by App-controlled transcode and human audit. Standard is the cheap fallback; generative is an audited candidate only. | No runtime Polly dependency or per-play cost. Switch provider by re-rendering successor assets from App-owned scripts/SSML/QA; never mass-retarget old IDs. | ADR-0024 |
| ARCH-S16-D07 | Separate instructional text equivalents from answer-bearing Listening transcripts. Instructions are always available; target transcript bytes/URLs are absent until the authorized reveal phase. Actual transcript/caption use is recorded and interpreted under the tested-capability/accommodation policy. | Access is preserved without a false standard claim. A verified accommodation profile may later authorize equivalence; Stage 23 owns authority/legal review. | ADR-0024 |
| ARCH-S16-D08 | Continue fully preloaded measured audio through network loss only when playback, clock, responses, and local occurrence log remain exact. Media/output/background/device faults protect valid units and yield not_counted/interrupted only in affected scopes; all other skills remain available. | Recovery protects effort and truth, not the “clean” label. Unknown continuity is never guessed favorable or negative. | ADR-0024 |
| ARCH-S16-D09 | Rights and answer protection are enforced at manifest acquisition and byte access. Tokens are short-lived and redacted; transcript and answer objects are separate; no DRM or fingerprinting is claimed. | Learners necessarily receive played bytes, so controls prevent casual/unauthorized access rather than promise impossible copy prevention. Rights changes stop serving and trigger scoped impact. | ADR-0024 |
| ARCH-S16-D10 | Version all mutable media/playback/preflight policies, measure QA/latency/cache/failure/cost without learner content, and use append-only correction plus targeted recomputation. | Rollback selects the previous approved release. Complexity/spend changes only after measured quality, inventory, support, latency, or operator-load triggers. | ADR-0024 |

## 4. Alternatives and durable rationale

| Area | Chosen | Simpler / do-nothing | Other credible alternative | Why rejected now / exit |
|---|---|---|---|---|
| Playback authority | Immutable plan + idempotent occurrences | Client counter only | Per-play online server token | Client counters duplicate after reload/offline; online token makes network a playback dependency. Preauthorized ordinals sync idempotently. |
| Target media readiness | Full-block preload and verify | Stream and hope | Downloadable course packs/service-worker offline product | Streaming can fail after exposure; full offline parity is out of scope. The measured block alone is bounded. |
| Web format | Lossless master + MP3 learner rendition | Only provider output | MP3 plus Opus/WebM/AAC variants | MP3 is one broadly supported, patent-expired path. Add a second codec only if measured byte/latency savings exceed QA/support/rendition cost. |
| Storage/delivery | Private EU R2 Standard, short-lived reads | Public hash URLs | Public custom-domain CDN/WAF; AWS S3/CloudFront | Public URLs leak restricted assets; CDN access adds coupling/plan/security work with no measured need. S3 is a tested S3-compatible exit. |
| TTS | Polly Neural Frankfurt batch candidate + provider-neutral adapter | Standard TTS only | Google Cloud TTS EU; Polly Generative; native-human only | Standard may lack P3 naturalness; generative has higher cost/audit risk; human-only blocks breadth. Google remains a credible substitution and migration drill. |
| P4 authenticity | Small audited human/native and target-calibrated premium/TTS benchmark pool | Synthetic-only | Human-record every asset | Synthetic-only weakens generalization; all-human costs/review throughput are unproven. Expand from measured transfer/incident evidence. |
| Transcript security | Separate object, phase-gated authorization | Ship hidden transcript in DOM/JSON | DRM/encrypted media extension | CSS/hidden JSON leaks answers; DRM is disproportionate and cannot prevent analog capture. |
| Replay tracking | occurrence ordinal with start/complete/fail | Count click events | Count only completed clips | Clicks overcount failures; completion-only permits repeated partial exposure. Preserve both start and completion plus actual heard/material-fault facts. |
| Media failure | scoped not_counted + fresh equivalent | Let replay continue | Zero the item or whole block | Replaying exposed content is not clean; zero/whole invalidation penalizes or discards unaffected evidence. |
| CDN/cache | No public edge cache at launch | Browser HTTP cache only | Worker-signed edge cache | Browser/in-memory block cache is sufficient. Add signed edge cache from p95/preload/Class-B measurements, with exportable origin keys. |

Cost may select among equivalent-quality options only. It cannot remove P4 variety, truth, accessibility, or recovery.

## 5. Components and responsibility ownership

~~~mermaid
flowchart LR
  Corpus["Corpus publication<br/>patterns + governance only"] --> CF["Content & Forms"]
  Author["Scripts / SSML / native recordings"] --> Batch["Batch media pipeline"]
  Batch --> QA["Final-byte QA + human audit"]
  QA --> CF
  CF --> DB["PostgreSQL manifests<br/>approval + rights + lineage"]
  CF --> R2["Private EU R2<br/>immutable masters/renditions"]
  SA["Session & Attempt"] --> DB
  SA --> Plan["Pinned ListeningPlan<br/>preflight + playback occurrences"]
  Plan --> UI["Shared attempt shell<br/>Listening controller"]
  UI --> R2
  UI --> SA
  SA --> EV["Evidence & Capability"]
  EV --> Proj["Capability / Readiness / mock projections"]
~~~

| Module / owner | Owns | Must not own |
|---|---|---|
| Content & Forms | scripts, audio assets/revisions/renditions, QA, approval, rights, target mapping, transcript reveal metadata, replacement/impact assertions | learner replay decisions, validity, Readiness |
| Batch media worker | provider adapter, render request, source receipt, lossless normalization, renditions, objective checks, review package | automatic P4 promotion, learner runtime |
| R2 media adapter | immutable object put/get/delete/purge/export, digest metadata, short-lived authorization | semantic identity, rights interpretation |
| Session & Attempt | ListeningPlan pin, preflight receipt, playback occurrence ordinals, actual conditions, response/checkpoint, idempotent sync | audio approval, validity or learner capability |
| Listening browser controller | capability probe, preload/hash/load, accessible controls, local occurrence outbox, native event observations, dispose | changing allowed count/speed, scoring, validity, latest-version substitution |
| Evidence & Capability | append-only validity assertion and condition interpretation; scoped impact recompute | changing occurrence history or media bytes |
| Operations/Governance | reviewer authority, quarantine, policy release, costs/incidents, rights action | editing learner results directly |
| Corpus | asynchronous rights-aware pattern/intelligence publication | learner profile, attempt, replay, TTS runtime, raw audio |

No new independently operated service is introduced. Polly is an offline processor; R2 and the existing job runner remain the only media infrastructure.

## 6. Data, state, contracts, and versioning

The following are explanatory pseudotypes, not production schema or code.

~~~text
AudioAssetRevision {
  asset_id
  media_revision_id
  predecessor_media_revision_id?
  content_revision_id
  content_family_id
  listening_family: H1 | H2 | H3
  script_revision_id
  transcript_revision_id
  instruction_text_revision_id
  target_blueprint_version
  progression_profile: P0 | P1 | P2 | P3 | P4
  source_role: reviewed_tts | audited_premium_tts | native_human | reusable_direct
  voice_class, speaker_count, turn_map?
  authored_speed_ratio
  duration_ms, channels, sample_rate
  master: { object_key, digest, bytes, format }
  renditions: AudioRendition[]
  generator: { provider, region, engine, model_release, voice_release, request_digest }
  qa: { script_match, pronunciation, cue_alignment, clipping, silence, loudness, artifacts,
        speaker_attribution, target_calibration, reviewer_refs, gold_release }
  transcript_policy_ref
  rights_envelope_ref
  accessibility_manifest_ref
  approval_decision_id
  status: current | superseded | quarantined | withdrawn
}

AudioRendition {
  rendition_id
  role: web_primary | future_optimized
  object_key, digest, bytes
  mime, codec, container
  duration_ms, sample_rate, channels, bitrate
  cache_policy_ref, rights_actions
}

ListeningPlan {
  listening_plan_id
  attempt_id, serving_manifest_id, form_id?
  contract_major, plan_version
  target_blueprint_version
  evidence_role
  progression_profile
  ordered_occurrences: [{
    occurrence_id, item_or_part_scope, media_revision_id, rendition_candidates[],
    allowed_play_count, authored_speed_ratio, seeking_allowed,
    pause_allowed, transcript_phase, response_window
  }]
  preflight_policy_ref, playback_policy_ref, timer_policy_ref
  issued_at, expires_at, revocation_state
}

PlaybackOccurrence {
  occurrence_id
  play_ordinal
  operation_id, idempotency_hash
  state: authorized | started | completed | failed
  authorized_at, started_at?, completed_at?
  media_revision_id, rendition_id
  start_position_ms, observed_end_position_ms
  visibility_changes, stall_intervals, output_or_device_change
  learner_pause?, technical_pause?, speed_actual
  transcript_opened, help_used
  fault_reason?, client_sequence, server_receipt?
}

MediaPreflightReceipt {
  receipt_id
  listening_plan_id, policy_versions
  candidate_renditions_by_media[]
  verified_digest_and_length[]
  decoded_or_loaded[]
  local_retention_class
  output_probe_confirmed
  checkpoint_path_confirmed
  issued_at, expires_at
  environment_change_counter
  outcome: ready | retryable | unavailable_affected_activity
}

TranscriptEnvelope {
  transcript_revision_id
  media_revision_id
  kind: instructional_equivalent | target_transcript | focused_repair_excerpt
  answer_bearing
  earliest_reveal_phase
  rights_envelope_ref, digest, language
}
~~~

### 6.1 Identity and compatibility rules

- asset_id is a logical lineage. media_revision_id names exact approved rendered meaning and bytes.
- A new voice, model/engine release, script, SSML, splice, normalization, timing, pause/emphasis, channel mix, or final-byte correction creates a successor media revision.
- Re-encoding identical approved audio creates a new rendition under the same media revision only when decoded timing/cue meaning and QA are proven equivalent. Otherwise create a new media revision.
- Voice changes never create a fresh content family. Freshness remains Stage-09 content-family plus exposure.
- Browser clients must reject unknown contract majors, unknown H-family/playback semantics, unsupported MIME candidates, digest mismatch, and unknown transcript phase. They never choose latest.
- Plan, preflight, playback, target-blueprint, accommodation, evidence, and media-pipeline releases are independently versioned and pinned.
- Empirical speed bands, preload TTL, stall tolerance, loudness/bitrate thresholds, and upgrade thresholds carry provenance, effective date, validation evidence, and rollback. Stable H1–H3 target rules are not abstracted into meaningless free-form configuration.

### 6.2 H1–H3 runtime and playback contract

| Profile/family | Authored speed | Allowed plays | Transcript / seeking / coaching | Evidence meaning |
|---|---|---|---|---|
| P0 | careful-connected or about 0.80–0.90× | authored first play + up to 3 extra | transcript after meaningful attempt; no infinite loop | valid learning evidence at actual support |
| P1 | about 0.90–0.97× (progression allows up to normal) | up to 2 beyond target-family rule | transcript after attempt; help explicit | guided evidence |
| P2 | about 0.97–1.00× | target-family rule + 1 optional extra | transcript after attempt; explicit assistance | bridge evidence |
| P3 ordinary | natural 1.00× default | target rule; one extra only after target opportunity and marked assisted | no transcript in clean opportunity; no hidden help | independent B1 at actual condition |
| P3 target probe | natural 1.00× | exact target rule | no seek/loop/speed/transcript/between-item repair | target-like probe |
| P4 H1 | authored target asset | each short text once | unavailable for whole measured block | strongest current-target H1 when all other gates pass |
| P4 H2 | authored target asset | conversation/interview twice | same | strongest current-target H2 |
| P4 H3 | authored target asset | each short functional text twice | same | strongest current-target H3 |

Volume/output-device changes do not alter linguistic evidence when playback remains complete. Playback-rate change always records speed_actual and cannot satisfy a standard P4 claim. An exposed but incomplete play is not erased; a system fault makes the affected scope not_counted rather than awarding another same-content clean opportunity.

### 6.3 Boundary API and idempotency

Representative conceptual resources/commands:

- GET /v1/listening-plans/{id}: pinned learner-safe plan, conditions, candidate rendition metadata, no target transcript or answer payload.
- POST /v1/listening-plans/{id}/preflight-receipts: accept observed capability/integrity facts and issue/deny admission.
- POST /v1/playback-occurrences/{id}/start: idempotently authorize/record the exact ordinal before playback.
- POST /v1/playback-occurrences/{id}/complete: idempotently record actual completion/stalls/visibility/speed.
- POST /v1/playback-occurrences/{id}/fail: record non-learner fault and affected scope.
- POST /v1/attempts/{id}/responses: record objective response/checkpoint under Stage-12 rules.
- GET /v1/attempts/{id}/listening-reveal: returns the phase-authorized transcript/repair projection only after server truth permits it.
- POST /v1/content/media/{id}/reports: scoped report without raw learner/profile content.

Every mutation carries operation ID, semantic payload hash, expected version, attempt/guest scope, and sequence. Same ID/same hash returns the original receipt; same ID/different hash conflicts. Offline commands retain the original occurrence ID and ordinal. A retry cannot create another observation or playback opportunity.

Range requests, native audio callbacks, Cache Storage, and local clocks are transport/observation mechanisms. They never become semantic APIs.

## 7. Main flows and state transitions

### 7.1 Playback state machine

~~~mermaid
stateDiagram-v2
  [*] --> Unprepared
  Unprepared --> Preflighting: learner opens activity
  Preflighting --> Ready: full bytes + digest + decode/load + output confirmation + receipt
  Preflighting --> SetupBlocked: affected requirement fails
  SetupBlocked --> Preflighting: retry/switch candidate or device
  SetupBlocked --> [*]: choose another activity
  Ready --> Authorized: reserve exact occurrence ordinal idempotently
  Authorized --> Playing: native playback actually starts
  Playing --> Completed: required media reaches end under allowed conditions
  Playing --> Faulted: stall/corrupt/wrong asset/output/device/system interruption
  Playing --> Interrupted: continuity/background/time condition lost without media defect
  Completed --> Ready: another authorized ordinal/clip remains
  Completed --> BlockComplete: plan exhausted
  Faulted --> Protected: affected scope not_counted
  Interrupted --> Protected: lost clean scope interrupted; defensible units preserved
  Protected --> [*]: fresh replacement later or practice continuation
  BlockComplete --> [*]: submit/evaluate/reveal phase
~~~

No failure transition creates an incorrect response, weakness, lower capability, or compensating replay. The server-owned plan determines whether another authorized ordinal exists.

### 7.2 Batch TTS and audit publication flow

~~~mermaid
sequenceDiagram
  participant C as Content author/reviewer
  participant J as Durable batch job
  participant P as Provider adapter
  participant Q as Deterministic QA
  participant H as Human auditor/P4 approver
  participant O as Private EU R2
  participant M as Content manifest store

  C->>J: approved script + SSML + target/voice brief
  J->>P: synthesize once in selected EU region
  P-->>J: provider bytes + release/provenance receipt
  J->>Q: normalize lossless master; compare script/timing; render MP3
  Q-->>J: digest, loudness, clipping, silence, cue and artifact results
  J->>H: review final bytes, names/numbers/dates/corrections, naturalness and calibration
  alt any defect
    H-->>J: reject/quarantine with reason
    J-->>C: new script/SSML/voice candidate required
  else approved
    H-->>J: signed scoped approval
    J->>O: immutable master + rendition + transcript objects
    J->>M: publish media revision/QA/rights/lineage atomically
  end
~~~

Launch defaults:

1. App-owned original scripts/SSML are reviewed before synthesis.
2. Amazon Polly Neural in Europe (Frankfurt) is the initial broad-quality candidate; current German voices are auditioned by voice-release, never hard-coded as permanent product identities.
3. Standard is the cheaper fallback for lower rungs only after QA. Generative is never trusted without exact script-byte/content audit because the provider documents rare cut/hallucination behavior.
4. P0–P2 normally use reviewed cached TTS. P3 adds voice diversity and independent/native validation. P4 uses target-calibrated final assets with human sign-off and an audited variety pool; prefer native-human or equivalently audited premium assets for anchors.
5. Provider output is normalized to an App-owned lossless master, then the launch MP3 rendition. Provider-specific URLs are never published.
6. Human audit always covers answer-bearing cues, names, numbers, dates, times, prices, abbreviations, negation/correction, speaker attribution, unnatural emphasis, clipping/silence, artifacts, and target calibration. Launch P4 is complete-form signed, not sample-only audited.
7. No generated script/audio is published from learner data; Corpus receives no learner profile. Routine playback has no provider call.

### 7.3 Measured preload and offline/cache sequence

~~~mermaid
sequenceDiagram
  participant U as Learner
  participant B as Browser controller
  participant A as App API
  participant R as Private R2
  participant L as Bounded local store

  U->>B: Open clean Listening block
  B->>A: Acquire pinned ListeningPlan
  A-->>B: exact media revisions, candidate MIME/digests, conditions
  loop every required asset in next measured block
    B->>A: request short-lived object authorization
    A-->>B: exact object authorization
    B->>R: fetch full MP3 bytes
    R-->>B: bytes
    B->>B: verify length/digest; load/decode candidate
    B->>L: retain bounded immutable block copy + manifest
  end
  B->>B: play approved tiny output probe
  U->>B: confirm audible output
  B->>L: prove occurrence/response outbox durability
  B->>A: submit preflight facts + policy versions
  A-->>B: admission receipt
  U->>B: Begin
  B->>L: append occurrence start before playback
  B->>B: play from verified local bytes
  B->>L: append completion/fault once
  opt network available
    B->>A: sync idempotent occurrence/response
  end
  opt network lost after full readiness
    B->>B: continue exact local playback and clock
    B->>A: sync same IDs once after reconnect
  end
~~~

Locally ready means all assets required for the clean measured block—not an entire course—have complete bytes, expected length/digest, successful actual browser load/decode, a retained local handle, and output confirmation. canPlayType, canplaythrough, navigator.onLine, and an HTTP 200 alone are insufficient.

The normal active-block copy is held in memory/Blob URLs and a bounded cache where available. It is replaceable and may be evicted; PostgreSQL/R2 remain authority. No general service-worker course cache or guaranteed offline library is launched. Ordinary low-stakes practice may lazy-load. P4 does not start until readiness is complete.

If network disappears after readiness, the block may remain clean only while the audio, authoritative timer semantics, response persistence, and occurrence log remain exact. A reconnect sends each original operation exactly once. If a reload/cache eviction forces a fresh fetch or a same-content replay after meaningful exposure, the clean affected claim is lost and a fresh equivalent is offered.

## 8. Preflight, failure, recovery, and uncertainty

### 8.1 Preflight/failure matrix

| Condition | Before start | During playback / attempt | Validity/evidence consequence | Recovery |
|---|---|---|---|---|
| Missing/late asset or R2/API unavailable | no clean start; no attempt/evidence | n/a | none | wait, retry exact revision, ordinary cached work, or another skill |
| Digest/length mismatch, corrupt/wrong audio | reject candidate; quarantine/report | stop affected occurrence | affected Listening scope not_counted; unaffected units preserved | purge exact cache/object, successor asset, fresh equivalent |
| Candidate MIME cannot load/decode | try next approved candidate; launch has MP3 only | stop if runtime capability changes | affected scope not_counted when system failed after start | supported browser/device or alternative task |
| Output probe not heard / device wrong | no clean start | if output changes materially, stop/observe | no pre-start observation; after start affected scope not_counted | learner adjusts volume/output, reruns probe; other skills available |
| Poor connectivity before full preload | no clean start | n/a | none | wait, lower-stakes cached work, another skill |
| Network loss after verified preload | allow exact continuation if all local contracts hold | sync later once | valid at actual unchanged conditions | reconnect; no duplicate play/evidence |
| Network loss removes/stalls audio | n/a | stop affected occurrence | media-dependent scope not_counted; continuous scope partial/interrupted as applicable | fresh equivalent; never score missed audio |
| Browser background / device sleep | target clock never silently pauses | record visibility and native playback facts | if playback and trustworthy timing remain exact, unchanged; otherwise clean continuous claim interrupted; media fault scope not_counted | practice continuation or later fresh block |
| OS call/notification/Bluetooth switch | rerun preflight if before start | record actual interruption/device change | preserve completed valid units; affected target scope interrupted/not_counted according to fault | setup retry/fresh equivalent |
| Native event duplicated / command retried | same receipt/ordinal | de-duplicate by occurrence and operation ID | exactly one exposure/evidence occurrence | reconcile local/server log |
| Browser crashes/reloads after meaningful exposure | existing ordinal cannot be reset | recover responses/log | completed units survive; in-progress clean occurrence interrupted or not_counted on media fault | continue as practice or new fair manifest |
| Transcript/help opened | warn before opening | record reveal/support fact | valid at actual assisted condition; cannot set unchanged standard P4; P4 reveal denied until block end | diagnosis/repair after measurement |
| Playback rate/seek changed outside plan | prevent where possible and observe actual | stop or label actual condition | no standard P4 claim; learner is not penalized | ordinary assisted practice/fresh target probe |
| Rights/target/quarantine changes before start | revoke lease/no start | submitted facts retained for impact review | dependent conclusion Pending during review; scoped disposition only | authorized replacement; no global block |
| No audited P4 variety | do not counterfeit breadth | training continues | P4 breadth/confidence missing, never zero | prioritize benchmark production; P0–P3 remain available |

Audio failure learner copy begins “This wasn't you.” The history remains visible as not counted / our fault, neutral grey/dashed, never red or scored. A fresh replacement is a new attempt and never a negative retry. A system fault cannot create Mistake Memory or a weaker Listening profile.

### 8.2 Replay and duplicate protection

The player writes a local start intent before invoking native play. Meaningful exposure, native start, progress, stall, end, visibility, and device changes are recorded. The exact product threshold for “meaningful exposure” is calibrated, but uncertainty does not grant another clean play: a system fault protects the affected scope as not_counted and supplies fresh content. A learner pause in allowed ordinary practice and a technical stall are separate facts.

For H2/H3 P4, play ordinal 2 is separately authorized by the plan. A duplicated tap, command retry, DOM remount, offline outbox replay, or late callback returns the same occurrence receipt. A browser cannot increment remaining replays locally. If the server and local log conflict, stop the clean claim, preserve bytes/responses, and reconcile; never guess.

### 8.3 Transcript and accommodation behavior

Instructional audio (navigation, instructions, coach explanation) has an always-available text equivalent. Its text is not an answer-bearing target transcript. German target content carries lang=de and the player has accessible name/state/remaining-play text. Controls are native/semantic, keyboard-operable, at least 44×44 with spacing, and work at 320 px/200% zoom. Space and R are optional scoped shortcuts that yield to editing, browser, and assistive technology. Every shortcut has a visible/focusable control. Playback changes are announced politely as discrete events; time ticks are never announced.

Target transcripts and focused repair excerpts are separate authorized objects:

- P0–P2: hidden during the meaningful clean attempt; available after submission, preferably focused to the decisive span.
- P3: hidden in the clean opportunity; opening during practice records assistance and changes the claim.
- P4: absent from the learner payload/cache and denied until the entire measured block ends.
- Captions/live transcript during a standard target claim are evidence-altering unless a current verified accommodation profile explicitly defines equivalence.
- Accessibility need is never a failure. The work stays valid under actual conditions when the complete named scope is supported. Evidence & Capability narrows only the affected target claim.

No transcript text, signed URL, task answer, audio sample, learner profile, or accommodation/medical inference enters analytics, logs, URLs, or session replay.

## 9. Security, privacy, rights, and correction

### 9.1 Access and rights

- R2 buckets remain private and EU-jurisdictional. API credentials are server/job-only, least privilege, rotated, and never sent to browsers.
- A learner receives an exact short-lived read authorization after serving-manifest rights/currentness checks. Treat the URL as a bearer token: do not log, referrer-leak, place in analytics, or persist beyond the bounded block cache.
- Transcript, answer/rationale, authoring master, and learner-playable rendition use separate object keys and access policies. The transcript is not merely hidden with CSS.
- Cache-Control and authorization follow the action-level rights envelope: reproduce, adapt, TTS/generate, transcode, cache, download/offline, territory/audience, attribution, expiry, and takedown. Unknown or unmet action denies publication.
- Exact source audio is learner-playable only when current rights permit it. Public availability is not redistribution permission. Original App audio is still rights-labelled and must not imply TELC endorsement.
- R2/Polly encryption statements are provider controls, not a legal-compliance claim. Stage 23 owns jurisdiction-specific license, processor, DPA, consent, retention, accommodation, and takedown review before public launch.
- No DRM, audio watermark/fingerprint, device fingerprint, or perfect copy-prevention claim is introduced. The learner must receive sound to hear it.

### 9.2 Correction/versioning

A content/media report names attempt, media revision, occurrence and observed fault without copying learner content. A credible wrong/corrupt/misaligned/pronunciation/rights defect:

1. stops new serving of the exact revision/role;
2. purges replaceable delivery/browser caches as policy requires;
3. publishes an append-only impact assertion with exact item/part/form/media/blueprint scope;
4. creates a successor script/media/rendition/approval where needed;
5. lets Evidence & Capability append not_counted/partial/Pending assertions and rebuild only affected capability, Mistake, Review, Progression, Readiness, mock, and booking projections;
6. retains unaffected facts and historical “what was shown then” while personal deletion policy permits;
7. uses idempotent shadow recomputation and atomic projection publication;
8. rolls back by selecting the previous approved media/pipeline policy, never overwriting bytes behind an identity.

A rights-only withdrawal stops future access/cache and follows legal disposition; it does not automatically make a previously correct learner response wrong. A blueprint update removes old media from current-P4 eligibility but can preserve historical capability at its actual condition.

## 10. Performance, reliability, operations, cost, and exit

### 10.1 Launch performance and reliability contract

- Ordinary practice may lazy-load one small asset. A measured block preloads only its exact pinned assets, in parallel with bounded concurrency, before timing/exposure.
- MP3 mono speech is the single launch delivery rendition. Final bitrate/sample-rate/loudness are QA parameters, not invented product constants; quality must preserve numbers, negations, corrections, speaker distinction, naturalness, and cue timing.
- Full bytes avoid mid-clip range/network dependency in P4. Preflight measures manifest acquisition, time-to-first-byte, full preload, digest, decode/load, and learner output confirmation separately.
- Native audio event timing is not the target clock. Stage 21 supplies authoritative time semantics. Backgrounding never silently pauses/resets target time.
- A clean P4 package is immutable for the block. “Latest” fallback, mid-block rendition switching, server-side live transcode, and per-play TTS are forbidden.
- Availability objectives are scoped to the affected activity. R2/Polly/Corpus downtime never becomes a global App outage; already-published media has no Polly or Corpus runtime dependency.

Release validation includes:

| Test family | Required evidence |
|---|---|
| H-family contract | H1 once, H2 twice, H3 twice; P0–P3 exact replay/speed/help tables; no client-added opportunity |
| Format/browser | Current/current-previous branded browser/device matrix; actual full MP3 fetch/digest/decode/play; no automation-as-Safari claim |
| Playback ledger | duplicate taps, offline retry, reload, late callback, ordinal conflict, partial exposure and completion produce exactly one occurrence |
| Preflight | slow/failed fetch, corrupt digest, unsupported decode, silent/wrong output, device change, expiry, rights change, local durability failure |
| Offline/background | H1 exact playback during network loss remains clean; stall/reload/sleep/visibility uncertainty yields scoped neutral consequence |
| Accessibility | native controls/labels/focus/keyboard, Space/R guards, German language, text-equivalent instructions, transcript phase denial/reveal, AT announcements |
| Media QA | script-byte fidelity, names/numbers/dates/prices/negation/correction, cue alignment, clipping/silence/artifacts, voice diversity, P4 target calibration |
| Rights/security | token leakage, object enumeration, transcript early access, expired/revoked authorization, cache purge, mixed-rights deny |
| Correction | quarantine/target/rights/provider revision yields successor identities and exact idempotent recompute only |
| Exit | export masters/scripts/SSML/manifests/QA/rights; render through substitute provider; move immutable objects via S3-compatible interface |

### 10.2 Operational measures

Aggregate by media/pipeline/policy/browser-release IDs, never learner content:

- media publish/QA rejection and pronunciation/cue/artifact incident rate;
- P4 audited voice/native benchmark coverage by H1–H3, speaker/voice class, form, target release, and independent family;
- preflight readiness, full-preload p50/p95, byte volume, digest/decode/output failure and false-ready rates;
- playback start/completion/stall/background/device-change and duplicate-suppression rates;
- not_counted/interrupted scope and fresh-replacement completion by normalized reason;
- R2 storage, Class A/B operations, cache hit/miss if later added, Internet/other-service egress, and authorized-read failure;
- TTS characters/cost per accepted asset, provider rejection waste, human audit minutes/queue age, native recording cost;
- stale/quarantined/withdrawn cache access, token/log leakage, purge/recompute latency;
- provider/model/voice release distribution and regression/gold-set comparison.

Stage 24 sets alert/SLO thresholds. Stage 25 makes release gates. These measures never become a learner score, diagnosis, or pass probability.

### 10.3 Cost and sustainability

At the access date, R2 Standard lists USD 0.015/GB-month, USD 4.50/million Class A, USD 0.36/million Class B, and free R2 Internet egress. Polly lists USD 4/16/30 per million characters for Standard/Neural/Generative. These are mutable list prices, exclude taxes/other attached-service costs, and require re-check before procurement.

Default cost shape:

1. review scripts in batches;
2. synthesize a candidate once;
3. reject before upload when deterministic checks fail;
4. normalize, render one MP3, audit final bytes;
5. store immutable approved assets in R2 Standard;
6. preload each measured asset once per block and replay locally according to the plan;
7. use deterministic scoring/repair metadata;
8. maintain a small reusable native-human/target-calibrated benchmark pool;
9. never invoke TTS/AI per learner play.

Cheaper fallback: Polly Standard for audited P0–P2, a smaller honest bank, manual recordings, and no CDN/Opus. Do not substitute unreviewed synthetic P4 or remove variety.

Measured upgrade triggers:

- P4 voice/native breadth blocks decision-grade H1–H3 evidence or synthetic-to-native transfer is materially worse;
- pronunciation/cue/naturalness incident rate exceeds the Stage-24 threshold after ordinary audit improvements;
- audited generative/premium/native assets materially outperform Neural on the gold set;
- full-preload p95 or playback stalls breach release budgets despite asset sizing;
- R2 Class B/storage/request cost or geographic latency justifies a signed edge cache;
- MP3 bytes materially cause poor-connectivity failures and an Opus candidate passes the complete browser/QA matrix with sustainable rendition cost;
- owner review queue becomes unsustainable or fresh P4 inventory blocks Written evidence;
- provider region/terms/voice removal/security/price or quality change breaches the approved policy.

Provider exit:

- TTS: retain App-owned scripts, SSML, pronunciation lexicon, request digests, lossless masters, approvals and gold cases; render successor candidates through Google Cloud TTS EU, another provider, or human recording. No attempt calls the provider.
- Storage: export original bytes, digests, manifests, rights and relational metadata through the S3-compatible interface to S3/another compatible store. Stable semantic IDs remain App-owned.
- Delivery: signed access is behind an App media authorization contract; a future Worker/CDN can be removed without changing ListeningPlan/evidence semantics.
- Codec: preserve lossless masters so another rendition is deterministic and does not require TTS regeneration.

## 11. Downstream handoff

Stages 18, 19, 21, and 23–28 must preserve:

- exactly H1/H2/H3 and current target playback (H1 once; H2/H3 twice);
- shared five-skill attempt/evidence foundation with a narrow Listening controller;
- exact actual replay, speed, voice/source, transcript/help, timing, exposure, media and output conditions;
- batch-reviewed cached audio and no per-play AI/TTS;
- no live Corpus and no learner data to Corpus;
- P4 target-calibrated audited variety; one TTS voice/provider is insufficient;
- immutable pinned media/plan/rendition/target/rights/approval versions;
- full measured-block preload, digest/decode/output confirmation before clock/exposure;
- idempotent playback ordinals and no duplicate playback/evidence after retry/reconnect;
- instructional text equivalents separated from answer-bearing target transcripts;
- transcript/support is valid under actual conditions but cannot silently set standard Listening Readiness;
- media/system fault not_counted only in affected scope, interrupted clean-continuity where applicable, unaffected evidence and all unrelated skills preserved;
- exactly five validity states, six Readiness states, independent Written/Oral truth, absence not zero, Safe not Ready, and no pass probability.

Dependencies introduced: versioned ListeningPlan, PlaybackOccurrence and MediaPreflightReceipt contracts; batch TTS provider adapter; approved lossless master plus MP3 rendition; short-lived R2 authorization; media gold/regression and P4 variety evidence. Dependencies removed: runtime TTS, per-play model, live Corpus, public CDN, streaming dependency for clean P4.

Risks/assumptions and validation:

1. MP3-only may cost more bytes than Opus. Measure preload/stall data on the release browser matrix before adding a rendition.
2. Polly Neural may not provide enough voice/prosody diversity. Blind-audit against target/native gold clips and measure transfer before provider/premium expansion.
3. Learner output confirmation is subjective. Keep it because software cannot prove sound was heard; measure false-ready incidents and improve setup copy, not fingerprinting.
4. Browser storage/memory may be evicted. Do not start P4 without a retained active handle; run background/reload/quota fault drills.
5. Short-lived URLs can leak. Redact/referrer-test, minimize TTL, and rotate/revoke; add a signed edge layer only after security/cost evidence.
6. A static meaningful-exposure threshold can be gamed or unfair. Treat it only as an operational calibration fact; system uncertainty gives not_counted/fresh content, never extra clean exposure or learner blame.
7. Native-human rights/production can bottleneck P4. Maintain action-level rights and an honest missing-breadth state; never lower the gate.

## 12. ADR

Created:

- Architecture/adr/ADR-0024-pinned-batch-audio-and-evidence-sensitive-playback.md — **Accepted**. It records immutable batch-produced audio, private EU delivery, full measured preload, idempotent occurrence accounting, evidence-sensitive transcript/support, and scoped neutral failure.

ADR-0024 applies ADR-0001, ADR-0002, ADR-0003, ADR-0009, ADR-0011, ADR-0012, ADR-0013, ADR-0016, ADR-0017, ADR-0019, ADR-0020, ADR-0021, ADR-0022, and ADR-0023. It supersedes none.

## 13. Decisions made

1. H1/H2/H3 runtime structure and target playback are immutable server-authored plan facts.
2. P0–P3 speed/replay/support and P4 exact rules are rendered, observed, and preserved without client invention.
3. Playback start/completion/fault use idempotent occurrence ordinals; reload/offline retry cannot add exposure or evidence.
4. Stage-09 media manifests are extended with lossless master, MP3 rendition, voice/release, QA, rights and transcript-phase facts.
5. Private EU R2 Standard remains the byte store; short-lived controlled reads are used and no public CDN is added at launch.
6. MP3 is the only required launch web rendition; Opus/edge cache require measured benefit and full matrix evidence.
7. Amazon Polly Neural in Frankfurt is the initial provider candidate for offline batch breadth, behind an exportable adapter; Standard is cheaper fallback, Generative audited-only.
8. P4 uses target-calibrated complete-form human sign-off and audited voice/native variety; synthetic breadth alone is insufficient.
9. Clean measured blocks fully preload, integrity-check, load/decode and confirm output before timing/exposure.
10. Fully ready playback may continue offline with idempotent later sync; missing/stalled audio never becomes learner failure.
11. Instructional text is always accessible; target transcripts are separate and phase-gated. Actual accommodation/support conditions remain explicit.
12. Media/background/device faults affect only exact scopes and preserve other skills/valid units.
13. Corrections are append-only successor revisions plus targeted recomputation.
14. Routine learner playback has zero TTS/AI cost and no Corpus dependency.
15. Current provider/pricing/browser facts have direct official sources, access date, cheaper fallbacks, exits, and measurable change triggers.

## 14. Open questions and intentionally deferred implementation choices

**Owner questions:** None.

| Choice | Future owner | Fixed Stage-16 boundary |
|---|---|---|
| Exact MP3 bitrate/sample-rate/loudness and preload/expiry/stall thresholds | Stages 24/25 and implementation validation | one MP3 rendition; final-byte intelligibility/cue QA; versioned provenance/effective date/rollback |
| Exact Polly German voice mix and whether Google/native supplements launch | Content Operations / Stage 25 release evidence | Frankfurt batch only; multiple audited voice classes; provider ID is provenance, no P4 from one synthetic voice |
| Initial native-human benchmark quantity/staffing | Content owner / Stage 25 | small reusable pool must cover audited H1–H3 target variety before strong P4 breadth |
| R2 signed URL TTL/cache-control implementation | Stage 23 security/rights | short-lived exact authorization, bearer-token redaction, action-level rights, no public fallback |
| Optional Worker/custom-domain signed CDN and Opus rendition | Stage 24 operations/cost then Stage 25 release | absent at launch; only measured trigger; same immutable IDs/digests/access and full browser/QA evidence |
| Authoritative clock and server/local time reconciliation | Stage 21 | preflight before clock; background never grants time; uncertainty narrows claim |
| Recording/capture MIME and raw audio | Stage 18 | no conflation with learner Listening assets |
| Accommodation authority and equivalence | Stage 23 | transcript/caption/extra playback remains actual altering condition unless verified profile says otherwise |
| Concrete HTTP paths, database columns, Cache Storage library and player helper | Implementation | typed contracts/owners/idempotency/exhaustive states fixed; no product rule may move client-side |
| SLO/alert thresholds | Stage 24/25 | measures and failure correctness fixed; values must be calibrated/versioned |

No feature implementer may choose a new TTS/storage/CDN/codec, add runtime generation, reveal transcripts early, reset replay counts, stream an unready P4 block, or reinterpret a fault without an architecture/ADR change.

## 15. Definition-of-done check

- [x] All current required sources and direct Stage-27 rule were read; immutable commits/blobs and prerequisite continuity are recorded.
- [x] Source authority was applied; the design one-replay example is reconciled to the product-owned profile/family contract.
- [x] H1–H3 plans, exact target playback, speed/voice/replay metadata and transcript gating are complete.
- [x] Media/asset, playback occurrence and preflight pseudotypes are present.
- [x] Playback state machine, TTS publication flow and offline/cache sequence are present.
- [x] Format/storage/CDN/TTS alternatives use current official browser/provider/price/region/security sources.
- [x] Batch/cached TTS, P4 audited variety, final-byte pronunciation QA and no per-play TTS are fixed.
- [x] Measured preload, local readiness, output confirmation, timing boundary, offline/reconnect/background and duplicate prevention are fixed.
- [x] Instructional alternatives, target transcript restrictions and honest accommodation effects are fixed.
- [x] Missing/corrupt/late/output/device/network/cache/background/rights faults preserve unaffected evidence and other skills with no learner penalty.
- [x] Data, API, ownership, compatibility, versioning, correction and recomputation are complete.
- [x] Security/privacy/rights, accessibility, performance/reliability, operations/cost, triggers/fallbacks and provider exits are complete.
- [x] ADR-0024 is Accepted and indexed; no owner blocker remains.
- [x] Downstream dependencies, risks, validation and intentional deferrals have named owners.
- [x] No production, Shaping, Design, earlier/later architecture, configuration, or unrelated checklist path is changed.
