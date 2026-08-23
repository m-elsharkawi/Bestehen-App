# Bestehen / App — Speaking Audio, STT, Partner, and Evaluation Pipeline

> **Status:** Architecture decision — Stage 18 of 28  
> **Date / mutable-source access date:** 2026-08-23  
> **Owner:** Stage 18  
> **Scope:** Architecture contracts only; no production implementation or provider selection

## 1. Purpose and scope

This stage defines the smallest complete architecture for contextual microphone access, bounded voice capture, turn-based S1–S3 interaction, provisional speech-to-text, structured oral evaluation, one justified escalation, correction, and provable raw-audio deletion.

The five skills continue to share one Session / Attempt / Result / Repair / Evidence foundation. Speaking adds only a capability-local capture controller, partner-turn coordinator, STT reference, and productive-evaluation adapter. Actual learner voice is mandatory for oral evidence. Typed or captioned work remains valuable learning, but cannot initialize or improve Speaking mastery, Oral estimates, or S2/S3 interaction evidence.

Exactly five evidence-validity values exist: **valid, partially_valid, pending, interrupted, not_counted**. The six Readiness states remain **evidence_building, not_ready, borderline, safe, ready_to_book, stale_contradicted**. Missing Oral evidence is absent, never zero. Written and Oral remain independent pass gates. Safe is not Ready to Book. No pass-probability field, model, event, copy template, or hidden calculation is introduced.

Stage 19 owns specific STT, evaluator, partner-generation and partner-voice provider/model selection, regions, prices, retention terms, global AI governance and benchmark promotion. This stage fixes the provider-neutral behavior those choices must satisfy.

## 2. Inputs, authority, and continuity

### 2.1 Reproducible source snapshot

All required inputs were read from GitHub main before deciding. App main was **adddb272657058225b9e1369f0a76315ce9f3ee8**; Shaping main was **9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc**.

| Source | Blob |
|---|---|
| Shaping app/28-bestehen-app-product-specification.md | 18ae80cc2fd63cecd76c297c3e56d44a68367856 |
| Shaping app/07-core-learning-loop.md | c313c859f64997972feca87497d70476c4528a20 |
| Shaping app/08-a1-to-b1-progression.md | 839a01c010cf79777520714d0ab09304a2ba9a06 |
| Shaping app/11-listening-training.md | e77948d6722b2ce635886d4b345e2ff9aad476a8 |
| Shaping app/13-speaking-coaching.md | 9462c78a1e7cc68249d38aa5a18a287be8aacd9c |
| Shaping app/14-review-and-spaced-repetition.md | fa9b65e92cd1511e00e106a199eb6fbc06273a69 |
| Shaping app/15-telc-readiness.md | b4456939928493569336bbc565d7e67307e7a3db |
| Shaping app/16-mock-exams.md | 8f6c23fa16524bd251cef39d823cfeea73bfcef3 |
| Shaping app/21-content-strategy.md | 8149d6a268da70e17cad46f774b9d5de77776986 |
| Shaping app/24-analytics-and-success-metrics.md | 28d1a5380a7ea9f28efdc95ce0c96987920917e1 |
| Shaping app/26-platform-accessibility-nonfunctional.md | 8137091683941b0d55f3d4fb90af3c402b8371e5 |
| Shaping app/27-end-to-end-scenario-validation.md | 5da3b0a27ba516770210773399f0415cfb1f5460 |
| Design/DESIGN-HANDOFF.md | 417a6820037e045e2dd9f29afc42b9f2e94fd638 |
| Design/Bestehen-02-Mobile-Screens.dc.html | 0a9f2d3ea982c3197f399941b57defd9869d2428 |
| Design/Bestehen-01-Design-System.dc.html | d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a |
| Design/Bestehen-04-Flows-Handoff.dc.html | 7120b05a2272c31e5896e4313a7007935f5d0aed |
| Architecture/00-architecture-shaping-plan.md | b263c5e7b3bccc0450ddd17aa0cc007432d672b7 |
| Bestehen_App_Architecture_Checklist.md | f8850212c2b4ba0dea3c93de8a40a778a6e7a75b |
| Stage-18 prompt | 2a613e6d8e8f2aebb26df40d14ee74065f205a94 |
| Architecture/05-data-ownership-persistence-and-schema-evolution.md | bb6df811ec9010de556d1719f22e31bb8ca3190e |
| Architecture/06-evidence-ledger-validity-versioning-and-audit.md | 53d34ae65ef4c8fa79c00026f9bd5d7b876ce672 |
| Architecture/08-coaching-engine-and-session-state-machines.md | 02c5e1ee5967bad976eda49ab4813a768eda5bd3 |
| Architecture/09-content-exercise-form-and-media-architecture.md | e6fb121ab1b10c6cbcf692bc88acaf98f2e45e7a |
| Architecture/11-readiness-scoring-mocks-and-ready-to-book.md | 7c327cd770460b94107f2756e2b7d8f29c56b909 |
| Architecture/12-api-contracts-jobs-events-and-idempotency.md | c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528 |
| Architecture/13-frontend-application-and-design-system-architecture.md | 7da94f122fa86412b0d1a12b84c123645693efb4 |
| Architecture/14-responsive-accessibility-browser-and-device-architecture.md | 362068924a6942eb955dcc132fb4c94da122597b |
| Architecture/16-listening-audio-tts-and-media-delivery.md | 6bb60e2d6048a39035107ff427a0c4fd305c1ba6 |

Required Stages 05, 06, 08, 09, 11, 12, 13, 14 and 16 are complete and compatible. PostgreSQL owns semantic facts/jobs; private object storage holds opaque bytes; Evidence owns validity/correction; HTTP work is versioned/idempotent; the browser never decides evidence truth; capability failure stays activity-local; Speaking remains a narrow extension of the shared five-skill shell.

### 2.2 Authority reconciliation and exact design issue

Stage-27 precedence applies: validity/fairness → direct evidence → independent Written/Oral risk → uncertainty resolution → due repair/retention → progression/coverage → preference.

Product and design agree on contextual permission, visible recording, preflight, turn-taking, typed rehearsal as learning-only, neutral failure, and deletion after evaluation. One exact design copy conflict is preserved rather than silently edited:

- Design/Bestehen-02-Mobile-Screens.dc.html, Speaking preflight, says audio “is never shared.”
- Product app/13-speaking-coaching.md and app/28-bestehen-app-product-specification.md explicitly permit bounded STT/partner/evaluator processing. A cloud processor transfer is sharing with an approved processor, even when pseudonymous and purpose-bound.

The product authority wins. Release copy must truthfully disclose purpose, approved processor transfer when applicable, retention/deletion, and learner controls; it must not repeat “never shared” unless Stage 19 selects and proves a wholly local path. This is a downstream UX/legal-copy issue for Stages 19, 23 and 25, not permission to edit Design here.

### 2.3 Current primary technical references

Accessed 2026-08-23:

- [W3C Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/) — secure-context capture, device-label exposure, permission behavior, track lifecycle, microphone Permissions Policy and privacy/fingerprinting considerations.
- [W3C MediaStream Recording](https://www.w3.org/TR/mediastream-recording/) — MediaRecorder states/events, Blob chunks, errors and security dependence on Media Capture.
- [MDN MediaRecorder.isTypeSupported](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static) — runtime MIME capability probe; a true result is support intent, not a quality/durability guarantee.
- [MDN Permissions-Policy microphone](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/microphone) — origin-level microphone restriction and NotAllowedError behavior.
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) and [Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html) — minimize sensitive storage, separate keys/data, rotate keys, and use managed secret/key facilities.

These sources describe primitives, not release proof. Browser/current-current-previous support remains resolved by the Stage-14/25 real device and assistive-technology matrix. No codec, browser, permission or encryption claim is inferred from one API returning success.

## 3. Architecture decisions

| ID | Decision and recommended default | Consequence / review trigger | ADR |
|---|---|---|---|
| **ARCH-S18-D01** | Request microphone access only after a learner chooses a Speaking action and sees purpose/retention/processor copy. Default Permissions Policy is same-origin; no onboarding request, auto-start, or hidden always-listening stream. | Denial affects Speaking capture only. Review if a verified embedded origin is required. | ADR-0026 |
| **ARCH-S18-D02** | Use an activity-scoped permission → device choice → local level/quality sample → learner confirmation → capture-policy admission preflight. Device labels are shown only as the browser exposes them; no durable device fingerprint or cross-session device ID. | No measured attempt starts on silent/wrong/clipped/unproven input. Review from false-ready incidents. | ADR-0026 |
| **ARCH-S18-D03** | Capture explicit learner turns with a server-authored policy allowlist and runtime MIME probe. Preserve the exact observed MIME/settings/digest; do not let the browser choose evidence semantics. Raw chunks stay in memory until encrypted upload to opaque private objects; no default persistent browser raw-audio cache. | If no validated capture encoding intersects, offer learning-only alternatives or another device. Stage 25 promotes the actual matrix. | ADR-0026 |
| **ARCH-S18-D04** | Session & Attempt owns SpeakingAttempt, Part, PartnerTurn, LearnerTurn, AudioChunkManifest and actual-condition receipts. Stable ordinals and idempotency keys prevent duplicate turns/chunks after retry. | Byte identity is separate from semantic/evidence identity. Review on duplicate/missing-chunk incidents. | ADR-0026 |
| **ARCH-S18-D05** | Fixed/reviewed partner branches are default for P0–P2, diagnostic, repair and routine drills. Adaptive turn-based partner is bounded to P2/P3 S2/S3 and selected P4 where previous meaning must shape the next turn. S1 normally uses fixed prompts. | Full-duplex streaming is absent at launch. Upgrade only when transfer evidence shows turn-based under-tests needed interaction. | ADR-0026 |
| **ARCH-S18-D06** | Genuine S2/S3 interaction requires linked consecutive partner/learner turns proving uptake, response/negotiation/repair/convergence. Monologue, typed response, or partner turns unrelated to learner meaning cannot satisfy it. | Fixed interaction can be direct but bounded-confidence; adaptive dependency is explicit. | ADR-0026 |
| **ARCH-S18-D07** | STT produces a provisional reference transcript with segment/word uncertainty and version lineage. One post-attempt correction pass may annotate “I said something else” for uncertain spans; it never rewrites audio, adds unsaid content, or proves pronunciation/intelligibility. | ASR failure alone creates no pronunciation/grammar weakness. Material dispute is rechecked from audio or remains uncertain. | ADR-0026 |
| **ARCH-S18-D08** | One provider-neutral structured oral evaluation consumes actual voice, scenario/rubric, exact turns, audio-quality facts, provisional/corrected transcript and assistance/timing. It returns part/rubric/coaching dimensions, audio/turn evidence refs, confidence and cannot-judge scope. | The provider is a candidate producer; Evidence accepts supported scope. No score from transcript alone for audio-dependent dimensions. | ADR-0026 |
| **ARCH-S18-D09** | Permit at most one policy-justified stronger evaluation for pass-critical ambiguity, audio-dependent judgment, material disagreement/dispute, or calibration sampling. Never average/vote. Unresolved work stays Pending or becomes a fresh-sample request. | Cost and latency are bounded; no low result is manufactured from outage. Stage 19 defines the release policy/provider. | ADR-0026 |
| **ARCH-S18-D10** | Raw learner audio is purpose-bound, encrypted, pseudonymous, excluded from logs/analytics/session replay/backups, and deleted immediately after finalized evaluation/correction decision. Pending raw audio has an absolute seven-day capture-time ceiling, including provider copies; deletion proof is durable metadata. | At ceiling, delete first and append a system-owned not_counted correction/fresh-sample request if evaluation cannot finalize. Raw audio never waits for backups. | ADR-0026 |
| **ARCH-S18-D11** | Permission, capture, partner, STT, evaluator, background/network and deletion faults have scoped neutral consequences using only the five validity states. Typed/captioned alternatives remain learning-only unless a later verified accommodation profile defines a supported equivalent claim. | Unrelated skills and valid parts survive; accessibility need is never learner failure. | ADR-0026 |
| **ARCH-S18-D12** | Independently version capture policy, scenario/partner contract, STT release, transcript schema/correction, evaluator contract/release, rubric, quality calibration, retention/deletion, blueprint and evidence rules. Corrections append and trigger targeted deterministic recomputation. | Unknown consequential majors fail closed. Provider exit preserves App-owned schemas, raw-independent structured evidence and benchmark fixtures. | ADR-0026 |

## 4. Alternatives, rationale, consequences, and exit

| Topic | Simpler / do-nothing | Other credible option | Chosen rationale, rejected reason, exit |
|---|---|---|---|
| Permission | Ask during onboarding | Persistent background permission | Contextual request is more understandable and least privilege. Background/onboarding capture widens denial/privacy blast radius. Exit is browser-native permission settings. |
| Device | Browser default only | Persist exact deviceId | Default-only causes wrong-input failures; durable IDs add fingerprint/staleness risk. Let learner choose after permission, keep only activity-scoped alias and non-identifying quality facts. |
| Preflight | Level meter only | Upload a full practice answer | Meter-only misses wrong device/codec/upload; full answer collects excess raw speech. Short local sample plus capture/upload capability check is sufficient. |
| Capture | One monolithic session blob | Continuous streaming/full duplex | One blob loses turn/chunk recovery; streaming adds latency/cost and always-open risk. Explicit turn chunks preserve interaction and bounded upload. |
| Codec | Hard-code one MIME | Accept anything and normalize later | Hard-code breaks supported browsers; accept-anything is unsafe. A versioned allowlist plus feature/record/playback/ingestion validation records exact bytes. Concrete release order comes from Stage 25 evidence. |
| Browser persistence | Save raw audio in IndexedDB by default | Require live network for every turn | Persistent raw increases deletion exposure; online-only turns network into learner failure. Memory + per-turn encrypted upload is default; high-stakes admission requires upload route. |
| Partner | Fixed only | Real-time unrestricted voice chatbot | Fixed only cannot prove meaning-dependent S2/S3 breadth; unrestricted real-time is costly, unsafe and hard to audit. Bounded turn contract is sufficient. |
| STT | No transcript | Treat transcript as ground truth | No transcript weakens review/partner routing; ground truth mis-scores ASR error. Provisional reference with uncertainty/correction keeps both benefits. |
| Transcript correction | Fully editable transcript | No learner correction | Full editing can invent speech; none leaves known ASR error. One annotation pass over uncertain spans preserves provenance. |
| Evaluation | Transcript-only deterministic score | Multiple specialist agents | Transcript-only cannot judge pronunciation/fluency and may mishear; agent chains multiply cost/disagreement. One audio-aware structured candidate is smallest sufficient. |
| Escalation | Always accept first result | Majority vote/continuous review | Blind acceptance ignores consequential uncertainty; voting fakes precision. One trigger-based escalation then Pending/fresh evidence. |
| Audio retention | Keep recordings as learner history | Delete immediately before evaluation finishes | Indefinite storage is disproportionate; premature deletion blocks correction. Delete after finalization, absolute seven-day Pending ceiling. |
| Accessibility | Disable Speaking when mic path unavailable | Count typed answer as Oral | A local alternative preserves learning, but typed work cannot claim voice/interaction. Capability affects only the claimed Speaking activity. |
| Provider | Select vendor now | Vendor-specific data model | Stage 18 lacks Stage-19 benchmark/region/price/terms evidence. App-owned contracts make STT/evaluator/partner adapters replaceable. |

Positive consequences: contextual privacy, recoverable turn identity, genuine interaction lineage, bounded recurring AI cost, honest transcript limits, neutral failure, raw-audio minimization and provider portability.

Costs/trade-offs: real-device capture validation, per-turn manifests/uploads, one bounded adaptive latency path, human benchmark/adjudication work, occasional Pending/not_counted fresh samples, and truthful processor copy replacing a simpler design promise. Cost cannot remove actual-voice evidence, S2/S3 interaction, accessibility, or recovery.

## 5. Components and responsibility ownership

| Component / semantic owner | Owns | Must not own |
|---|---|---|
| Content & Forms | immutable S1–S3 scenario, paired input, fixed branch/audio assets, rubric/blueprint/rights/approval revisions | learner state, provider score, Readiness |
| Session & Attempt | attempt/part/turn order, preparation, capture/preflight receipts, chunk manifest, exact actual conditions, idempotent finalization | evidence validity, ability, provider policy |
| Speaking browser controller | contextual request, device UI, local short sample, level/status, MediaRecorder observations, memory buffer, signed upload, accessible recording state, track teardown | score, validity, partner freedom, latest revision |
| Partner coordinator | fixed branch resolution or bounded adaptive request, scenario-contract enforcement, latency/fallback facts, partner turn identity/audio/text | coaching during clean attempt, learner score |
| Productive Evaluation | STT and oral-evaluator jobs/adapters, minimum provider payload, candidates, one escalation, provider deletion receipt | final validity, Readiness, Corpus |
| Evidence & Capability | candidate acceptance, five-state validity, direct modality/interaction claim, correction, affected scope and recompute impact | raw-byte transport, transcript rewrite |
| Coaching / Mistake / Review | diagnosis, minimal repair, due obligation and fresh retry from accepted evidence | inventing weakness from ASR/fault |
| Measurement | deterministic Oral/readiness projection from eligible accepted S1–S3 evidence | provider calls, pass probability |
| Operations / Governance | policy promotion, gold set, aggregate latency/quality/cost/deletion monitoring, incident/quarantine | learner content in analytics |
| Account / Data rights | scope, export/delete orchestration and authorization | accommodation inference or evidence meaning |
| Corpus | asynchronous rights-aware pattern/intelligence publication only | learner audio/transcript/profile/runtime calls |

No new independently operated service is required. Existing PostgreSQL, pg-boss and private object storage support metadata, durable jobs and transient bytes. Stage 19 may select processors behind these ports.

~~~mermaid
flowchart LR
  CF[Content & Forms<br/>scenario/rubric] --> SA[Session & Attempt<br/>parts/turns/conditions]
  UI[Speaking controller<br/>permission/capture] <--> SA
  UI --> OBJ[Private transient audio objects]
  SA --> PC[Partner coordinator]
  PC --> FX[Fixed approved assets]
  PC --> AD[Bounded adaptive adapter]
  SA --> PE[Productive Evaluation jobs]
  OBJ --> PE
  PE --> STT[STT candidate]
  PE --> EV[Oral evaluator candidate]
  EV --> EC[Evidence & Capability]
  STT --> EC
  EC --> CO[Coaching / Mistake / Review]
  EC --> ME[Deterministic Measurement]
  DR[Data rights / deletion] --> OBJ
  DR --> PE
~~~

## 6. Data, state, contracts, and versioning

All examples are explanatory pseudotypes, not production TypeScript, DDL, endpoint code, or provider schemas.

### 6.1 Capture, turn, and session pseudotypes

~~~text
CapturePolicy = {
  capture_policy_version,
  allowed_input_mime_candidates[],
  max_turn_bytes, max_turn_duration_policy,
  chunk_interval_policy, upload_deadline,
  required_quality_checks[],
  supported_browser_release_matrix_id,
  encryption_and_object_policy_version,
  provenance, effective_at, validation_evidence, rollback_version
}

MicPreflightReceipt = {
  receipt_id, attempt_id, speaking_part,
  permission_observation: prompt | granted | denied | dismissed | policy_blocked,
  device_session_alias, device_label_shown?,
  input_track_settings_observed,
  selected_mime, recorder_api_release_observed,
  local_sample: {
    speech_detected, silence, clipping, level_range,
    sustained_background, playback_confirmed_by_learner
  },
  upload_path_probe, lifecycle/visibility_observations[],
  result: ready | needs_device_choice | quality_failed |
          unsupported | denied | unavailable,
  capture_policy_version, expires_at, evidence_digest
}

SpeakingAttempt = {
  attempt_id, learner_scope_id, session_id, episode_id,
  independent_occasion_id, purpose,
  progression_profile: P0 | P1 | P2 | P3 | P4,
  blueprint_version, scenario_revision_id, rubric_revision_id,
  partner_contract_revision_id, capture_policy_version,
  preflight_receipt_id,
  state: prepared | capturing | awaiting_partner | locally_interrupted |
         uploaded | evaluation_pending | evaluated | closed,
  preparation_condition, actual_condition_refs[],
  contract_major, resource_version
}

SpeakingPart = {
  part_id, attempt_id, part: S1 | S2 | S3,
  ordered_turn_plan[], paired_input_revision_ids[],
  target_or_practice_timing_rule_version,
  partner_mode: solo | fixed | adaptive_turn_based | target_simulation,
  interaction_claim_required,
  assistance_policy_version
}

PartnerTurn = {
  partner_turn_id, part_id, ordinal,
  actor_role, intent, text_or_asset_revision_id,
  branch_id?, adaptive_request_id?,
  depends_on_learner_turn_ids[],
  allowed_scenario_fact_refs[], hidden_constraint_refs[],
  generated_release?, moderation/policy_receipt?,
  audio_media_revision_id?, began_at, ended_at,
  latency_ms, fallback_or_fault?
}

LearnerTurn = {
  learner_turn_id, part_id, ordinal,
  responds_to_partner_turn_ids[],
  expected_intents[], explicit_end_requested,
  capture_started_at, capture_ended_at,
  audio_manifest_id?, transcript_reference_id?,
  background/track/device/endpointing_observations[],
  restart/support/exposure_facts[],
  state: armed | recording | finalizing | uploaded |
         unusable | interrupted | accepted
}

AudioChunkManifest = {
  audio_manifest_id, learner_turn_id,
  ordered_chunks: [{
    chunk_id, ordinal, opaque_object_id,
    byte_length, digest, observed_mime,
    recorder_event_started_at, recorder_event_ended_at,
    upload_operation_id, stored_receipt
  }],
  complete_ordinal_range, total_bytes, content_digest,
  missing_or_duplicate_ordinals[],
  encryption_policy_version, raw_audio_delete_by,
  object_state: uploading | complete | quarantined |
                deletion_due | deleted_proven
}

InteractionEvidenceLink = {
  link_id, part_id,
  partner_turn_id, learner_turn_id,
  dependency: addressed | negotiated | clarified | repaired |
              counterproposed | converged | unrelated | uncertain,
  evidence_refs[], evaluator_confidence,
  partner_fairness: adequate | limited | defective
}
~~~

Identifiers are opaque and never recycled. Chunk order and digest—not arrival time—establish byte completeness. A retry reuses the same operation/ordinal; it cannot create a second evidentiary turn. Device session alias is destroyed at capture teardown and is not an analytics dimension.

### 6.2 STT and learner correction contract

~~~text
TranscriptReference = {
  transcript_reference_id, audio_manifest_id,
  language, stt_contract_major, stt_release,
  segments: [{
    segment_id, learner_turn_id, start_ms, end_ms,
    text, words: [{ token, start_ms?, end_ms?, confidence?: high | medium | low | unknown }],
    segment_confidence: high | medium | low | unknown,
    uncertain_span_ids[], alternate_hypotheses_limited[]
  }],
  audio_quality_refs[], generated_at,
  role: provisional_reference,
  immutable_original_hash
}

TranscriptCorrection = {
  correction_id, transcript_reference_id,
  learner_turn_id, correction_pass_ordinal: 1,
  annotations: [{
    uncertain_span_id,
    kind: said_something_else | proposed_words | cannot_resolve,
    learner_text?,
    reason
  }],
  original_preserved: true,
  correction_exposure_after_attempt: true,
  accepted_for_semantic_review_scope?,
  does_not_prove: [pronunciation, intelligibility, fluency, timing]
}
~~~

Correction is offered after the clean part/block, never as live answer-bearing text. It is limited to spans the system marked uncertain or the learner explicitly disputes. It may annotate intended lexical/grammatical content, but cannot replace the immutable STT output or audio, add a missing turn, establish intelligibility, or create fresh evidence. If a broad rewrite would be needed, transcript quality is insufficient; evaluation uses audio or stays uncertain.

For adaptive routing, STT is a low-latency reference. Low-confidence meaning triggers at most a scenario-valid clarification, not invented learner meaning. A recognizer-caused partner misunderstanding is a partner/system condition; the learner may demonstrate genuine conversational repair, but is never penalized for the fault.

### 6.3 Structured oral evaluation and escalation

~~~text
OralEvaluationRequest = {
  request_id, attempt_id, purpose: primary | escalation,
  part_ids[], scenario_revision_id, rubric_revision_id,
  partner_contract_revision_id, blueprint_version,
  audio_manifest_refs[],
  transcript_reference_ids[], transcript_correction_ids[],
  turn_and_interaction_links[],
  exact_actual_conditions, audio_quality_receipts[],
  evaluator_contract_major, policy_version,
  minimum_pseudonymous_payload_manifest,
  deadline_before_raw_audio_deletion
}

OralEvaluationCandidate = {
  candidate_id, request_id, evaluator_release,
  per_part: [{
    part: S1 | S2 | S3,
    task_completion, official_criterion_estimates?,
    coaching_dimensions: {
      task_completion, interaction, fluency, vocabulary,
      grammar, intelligibility_pronunciation
    },
    evidence_refs: [{ audio_time_range, learner_turn_id, partner_turn_id? }],
    interaction_dependency_refs[],
    cannot_judge_dimensions[],
    confidence_by_dimension,
    partner_fairness, audio_sufficiency
  }],
  diagnosis: { primary?, contributor?, confidence, unresolved_reasons[] },
  limited_repair_targets[],
  contract_validation,
  generated_at
}

AcceptedOralEvaluation = {
  accepted_evaluation_id, attempt_id,
  accepted_candidate_id, accepted_scope[],
  disagreement_record: {
    primary_candidate_id, escalation_candidate_id?,
    material_differences[], resolution_basis
  },
  validity_by_scope: valid | partially_valid | pending |
                     interrupted | not_counted,
  evidence_rule_version, accepted_at,
  correction_and_recompute_refs[]
}
~~~

The evaluator must use actual audio for intelligibility/pronunciation and any judgment dependent on pauses, timing, prosody or what was audibly produced. STT supplies navigation/semantic reference only. The evaluator judges B1-functional communication, not native accent similarity. Six coaching dimensions never silently become six official score columns; current rubric revision preserves the official structure and labels estimates as Bestehen/TELC-aligned, never official results.

Deterministic gates run before acceptance: complete chunk manifest; audio-quality scope; scenario/turn lineage; schema/range/enumeration validation; every material judgment cites audio/turn evidence; S2/S3 interaction claims cite cross-turn dependency; no forbidden fields/probability; no score for cannot-judge scope; and provider/version allowlist.

One escalation is permitted only when the outcome could materially change coaching/Oral/Readiness and the primary is low-confidence on a consequential dimension, audio judgment is required beyond transcript capacity, evidence/history materially disagrees, a high-impact learner dispute is supported, or governed calibration sampling applies. The escalation uses the same minimum-purpose source cut. Candidates are not averaged. Evidence owner accepts the better-supported scope or leaves it Pending/cannot-judge and schedules fresh direct evidence.

### 6.4 Client/server semantic contracts

Stage 12 owns transport syntax. Required semantic commands/resources are:

| Contract | Authority and idempotency | Result |
|---|---|---|
| CreateSpeakingAttempt | Session & Attempt; unique operation/purpose/scenario | pinned attempt/parts/policies |
| AcceptMicPreflight | Session & Attempt accepts client observations; preflight hash unique | ready or exact local reason |
| IssueChunkUpload | server authorizes exact attempt/turn/chunk ordinal/object | opaque short-lived upload |
| CommitChunkReceipt | digest/bytes/MIME/ordinal idempotent; conflict fails closed | manifest progress |
| CompleteLearnerTurn | freezes actual conditions and complete manifest | accepted, unusable or interrupted |
| ResolvePartnerTurn | fixed deterministic branch or one bounded adaptive request | immutable partner turn/fault |
| FinalizeSpeakingAttempt | immutable source cut; duplicate operation same result | evaluation_pending resource |
| ReadEvaluation | polling resource with retry guidance | Pending, partial or accepted result |
| AnnotateTranscript | one correction pass; immutable original preserved | correction resource |
| AppendEvaluationCorrection | Evidence owner only; scoped/idempotent | targeted recompute impact |
| DeleteRawAudio | Data Rights/retention job; idempotent per object/provider copy | deletion-proof status |

The browser cannot set score, confidence, validity, evidence role, Readiness state, partner fairness, target equivalence or deletion completion. Unknown consequential majors, turn semantics, MIME policies, evaluator states or validity values fail closed with neutral unavailable/retry copy.

### 6.5 Versioning, compatibility, correction, and recomputation

Every accepted observation pins capture policy, actual MIME, browser release, scenario, partner contract/mode/release, STT contract/release, transcript correction policy, evaluator contract/release, rubric, blueprint, quality calibration, accommodation/actual condition, evidence rule and retention policy.

Additive optional fields are compatible only with safe fallback text. A changed scenario fact, partner branch, generation release, codec/normalization, STT hypothesis, rubric/evaluator behavior or retention promise creates a successor revision. Historical bytes/results are never reinterpreted as though created under the successor.

A credible content, partner, audio, STT or evaluator defect appends an impact/correction assertion naming exact attempt/part/turn/dimension. Recompute only affected Evidence, Mistake, Review, Progression, Oral, mock and booking projections through a validated shadow generation. Written and unrelated Speaking parts/skills survive. Provider correction creates no new occasion and never rewrites what the learner heard/saw.

## 7. Main flows and state transitions

### 7.1 Permission, preflight, and capture state

~~~mermaid
stateDiagram-v2
  [*] --> unavailable_check
  unavailable_check --> explain_permission: API/policy candidate exists
  unavailable_check --> learning_only: unsupported or policy blocked
  explain_permission --> requesting: learner chooses Enable microphone
  explain_permission --> learning_only: learner chooses typed/captioned rehearsal
  requesting --> denied: denied/dismissed
  requesting --> device_select: granted
  denied --> device_instructions
  device_instructions --> requesting: learner retries
  device_instructions --> learning_only: choose rehearsal
  device_select --> level_check: device chosen
  level_check --> device_select: silent/wrong/clipped/background
  level_check --> ready: sample + learner confirmation + upload path pass
  ready --> armed: attempt start
  armed --> recording: learner turn begins
  recording --> finalizing: explicit end / bounded endpoint
  recording --> interrupted: track ended, background uncertainty, recorder error
  finalizing --> uploaded: complete digest/ordinals accepted
  finalizing --> interrupted: incomplete/missing/duplicate manifest
  uploaded --> awaiting_partner
  awaiting_partner --> armed: next learner turn
  awaiting_partner --> interrupted: partner/system fault changes claim
  uploaded --> evaluation_pending: part/attempt finalized
  evaluation_pending --> evaluated: accepted structured result
  evaluation_pending --> not_counted: seven-day ceiling/system terminal failure
  evaluated --> deletion_due
  not_counted --> deletion_due
  deletion_due --> deleted_proven
~~~

Permission is never equated with readiness: “granted” does not guarantee a working device, allowed policy, usable MIME, intact track, understandable level, upload route or learner-confirmed source.

The short preflight sample stays local and is destroyed on completion. It uses text feedback such as “no voice detected,” “input clips,” or “background overwhelms voice”; the visual meter alone is insufficient. The learner confirms they heard the expected input/device. A measured attempt begins only after a current receipt; device/track/visibility/policy change expires it.

During capture, recording state is always visible as word + dot + duration + accessible level status. The learner explicitly ends turns. Automatic endpointing may assist but cannot silently cut speech; endpoint uncertainty narrows the affected turn.

### 7.2 Partner-turn sequence

~~~mermaid
sequenceDiagram
  participant L as Learner
  participant UI as Speaking controller
  participant SA as Session & Attempt
  participant PC as Partner coordinator
  participant PE as Productive Evaluation
  participant EC as Evidence

  L->>UI: choose Speaking action
  UI->>L: purpose, retention, processor and alternatives
  L->>UI: grant/select/test microphone
  UI->>SA: accept preflight observations
  SA-->>UI: pinned attempt + first turn plan
  L->>UI: record and explicitly end turn
  UI->>SA: commit ordered encrypted chunks + actual conditions
  SA->>PC: resolve next turn with bounded scenario context
  alt fixed/reviewed
    PC-->>SA: immutable branch/audio asset
  else adaptive turn-based
    PC-->>SA: validated scenario-bounded partner turn
  else provider/contract failure
    PC-->>SA: fault; no invented fallback inside clean attempt
  end
  SA-->>UI: partner turn or scoped recovery
  UI-->>L: play/display permitted partner turn
  L->>UI: next actual-voice response
  SA->>PE: one finalized source cut
  PE-->>SA: STT + structured primary candidate
  opt one justified escalation
    PE-->>SA: stronger candidate
  end
  SA->>EC: candidates, disagreement, exact conditions
  EC-->>L: accepted feedback, Pending, or fresh-sample request
  PE->>PE: delete all raw audio/provider copies
  PE-->>SA: durable deletion proof metadata
~~~

### 7.2a Part-specific S1–S3 state contracts

These are operational part states, not new evidence-validity values. The immutable SpeakingPart pins its permitted path, preparation rule and bounded turn plan; the client cannot invent or skip a state.

| Part | Pinned state path | Completion / interaction claim | Fault boundary |
|---|---|---|---|
| S1 | prepared → preparation_complete → fixed_prompt → learner_turn → optional_fixed_follow_up → learner_response → part_complete | learner explicitly ends required voice turns; reciprocity cites the follow-up/response pair | prompt/capture fault interrupts only S1; an unresponsive monologue can retain production but cannot claim reciprocal S1 breadth |
| S2 | prepared → preparation_complete → learner_input_contribution → partner_different_view → learner_response_and_reason → optional_clarify_or_disagree → part_complete | genuine interaction requires a learner turn dependent on the partner’s different view, not only the initial source summary | hidden-input leak, unrelated/malformed partner turn or capture loss narrows S2 interaction; completed defensible production survives |
| S3 | prepared → preparation_complete → opening_proposal → partner_proposal_or_constraint → negotiate/counter/repair loop bounded by the plan → convergence_or_declared_end → confirmation → part_complete | genuine interaction cites reaction, proposal/alternative/compromise and convergence evidence; a different workable plan is valid | partner domination/blocking, scenario drift or failed turn capture affects only cited S3 scopes; lack of convergence is judged only when conditions were fair |

Preparation starts only after current preflight and before the first measured learner turn. It follows the pinned blueprint/timing rule; the microphone may remain authorized but is not recording, and no coaching/partner generation is allowed to consume the learner’s private preparation. At P4, all feedback waits until the complete oral block ends. Each learner turn completes by explicit learner action or a validated bounded endpoint followed by confirmation; automatic endpointing cannot be the sole authority. System/partner wait is recorded separately and excluded from learner fluency/timing. A learner stop preserves completed defensible turns and enters the shared interrupted path rather than manufacturing a part score.

### 7.3 Partner behavior and fallback table

| Part/profile | Default | Genuine evidence available | Failure/fallback |
|---|---|---|---|
| S1 P0–P2/diagnostic | reviewed fixed prompts/follow-ups | actual voice, reciprocal response; interaction breadth bounded | solo/fixed fresh practice; no adaptive dependency required |
| S1 P3/P4 | pinned target-like fixed examiner/peer prompts unless blueprint needs branching | direct S1 reciprocity under actual conditions | interrupted/not_counted affected part; fresh equivalent |
| S2/S3 P0–P1 | reviewed fixed branches: agree/disagree/reason/constraint/clarify | direct response-turn evidence, limited adaptability explicitly lowers breadth/confidence | switch to learning-only solo/typed or fresh fixed scenario |
| S2/S3 P2/P3 | adaptive turn-based when previous meaning must change next turn; fixed remains valid drill | linked uptake, response, negotiation, repair and S3 convergence | no silent mid-attempt scripted substitution; mark affected interaction partial/interrupted and offer fresh route |
| S2/S3 P4 | pinned target-like scenario contract, bounded adaptive turn-based where required, no coaching | strong only with fair partner, actual voice, cross-turn dependency and complete target conditions | partner latency paused/excluded; malformed/dominant/helpful/out-of-scenario partner neutralizes affected interaction |
| Any profile with adaptive outage before start | fixed reviewed branch if declared before exposure and plan labels it | evidence at actual fixed condition only | learner may accept fixed practice or defer |
| Adaptive outage after meaning exposure | no “seamless” fixed continuation for clean claim | completed unaffected turns survive | interrupted/partially_valid exact scope; fresh equivalent for direct claim |
| Full-duplex unavailable | turn-based remains normal | sufficient by product definition | no downgrade; full-duplex is later realism upgrade |

Partner wait time is system time, excluded from learner fluency/timing. One bounded retry may occur before any new learner exposure; after that return a fault. Partner never teaches, corrects, translates, supplies model wording or silently simplifies during a clean measured exchange. S3 must cooperate toward a plan, not block convergence indefinitely. S2 paired-input secrecy is preserved.

### 7.4 STT/evaluator confidence and escalation contract

| Condition | STT role | Evaluator action | Evidence consequence |
|---|---|---|---|
| high-confidence transcript + usable audio | navigation/semantic reference | judge all supported dimensions from actual evidence | eligible subject to other conditions |
| uncertain lexical span | mark uncertainty/alternatives; learner may annotate later | inspect audio; avoid grammar/vocabulary claim dependent on invented word | partial dimension or Pending, never automatic mistake |
| ASR rejects/misrecognizes word but audio understandable | reference is wrong | audio-aware judgment governs | no pronunciation penalty from ASR |
| audio usable with limitations | transcript may help semantics | cite judgeable dimensions only | partially_valid exact scope |
| clipping/missing audio over material speech | transcript cannot repair lost signal | cannot judge affected dimensions/turn | not_counted or interrupted exact scope |
| partner misunderstood due STT | retain both turn/STT facts | evaluate learner repair separately; exclude system-caused mismatch | neutral partner/system condition |
| primary low confidence on pass-critical dimension | retain primary candidate | one stronger evaluation if policy permits | Pending until resolved |
| primary/escalation materially disagree | never average | Evidence selects better-supported scope or cannot judge | Pending/fresh sample |
| evaluator outage/schema failure | STT is not fallback score | durable retry within retention deadline | Pending; no learner-negative score |
| seven-day deadline reached unresolved | structured history retained, raw deleted | no further audio evaluation | append system not_counted and fresh-sample request |

### 7.5 Raw-audio deletion sequence

~~~mermaid
sequenceDiagram
  participant UI as Browser capture
  participant OBJ as Private object storage
  participant DB as PostgreSQL manifest/job
  participant P as Approved processors
  participant E as Evidence owner
  participant D as Deletion worker

  UI->>OBJ: encrypted opaque chunk upload
  UI->>DB: digest/ordinal receipt (no raw bytes)
  DB->>P: pseudonymous minimum-purpose STT/evaluation request
  P-->>DB: structured candidate + provider copy IDs/expiry
  DB->>E: candidates and exact source cut
  alt finalized or terminal correction
    E-->>DB: accepted result/terminal state
    DB->>D: immediate delete-all job
  else Pending
    DB->>D: deadline at capture + maximum seven days
  end
  D->>P: delete provider raw/intermediate copies
  P-->>D: deletion/expiry receipt
  D->>OBJ: delete every chunk/object
  D->>DB: append deletion proof, object count, receipts, completed_at
  D->>OBJ: verify absent/list reconciliation
  D->>DB: mark deleted_proven or raise privacy incident
~~~

Raw audio is excluded from database dumps, logical/PITR backup payloads, object replication/backup, support exports, logs and analytics. Object lifecycle expiry at seven days is defense in depth, not the primary deletion mechanism. The deletion proof retains opaque operation/object-count/provider-receipt digests, policy, deadline, attempts and completion—not audio, transcript content, public object keys or a reusable capability.

If finalization happens before seven days, deletion begins immediately; the ceiling is not a normal retention period. If deletion cannot be proved by deadline, access remains revoked, the incident is escalated, and the system continues reconciliation. Learner deletion also invokes this path immediately. Structured accepted evaluation, transcript when useful, condition facts, correction and evidence lineage may remain until learner deletion under Stage 05; raw audio does not.

## 8. Failure, recovery, and uncertainty

### 8.1 Failure/evidence consequence matrix

| Failure / condition | Learner experience and recovery | Validity / scope | Forbidden consequence |
|---|---|---|---|
| permission denied/dismissed/policy blocked | device instructions, retry, switch device, typed/captioned/phrase rehearsal | no oral observation; existing Oral unchanged | initialize Speaking from text or global App block |
| no device / track in use | choose another input or defer | not_counted before exposure | low oral score |
| wrong device / silence in preflight | textual status + sample/playback confirmation, no attempt start | no evidence | blame learner |
| clipping/background in preflight | reposition/change device/quiet place or learning-only route | no evidence | infer pronunciation weakness |
| clipping/noise after start | retain unaffected turns; fresh equivalent where needed | partially_valid or not_counted affected turn/dimension | score missing signal |
| endpoint cut / missing chunk | explain capture failure; retry fresh equivalent | interrupted/not_counted affected turn | reconstruct from transcript |
| duplicate/reordered upload | idempotently dedupe; manifest conflict fails closed | Pending until reconciled, then exact scope | duplicate turn/evidence |
| network loss before upload | memory retry while page alive; if bytes lost, fresh turn/scenario | interrupted/not_counted exact turn | claim server has audio |
| background/sleep/device change | stop capture, show explicit recovery; re-preflight | interrupted exact continuity scope | silently continue clean timer/turn |
| learner stops voluntarily | preserve completed valid turns; label practice/incomplete | interrupted or partial actual scope | failed session score |
| fixed asset missing | do not start or offer declared alternative | not_counted affected part | ad hoc hidden branch |
| adaptive partner slow | pause/exclude system wait; one bounded retry | no fluency penalty | count latency as learner pause |
| adaptive partner malformed/helpful/dominant/off-scenario | stop/label/restart fresh; preserve learner production where defensible | partial/not_counted interaction scope | penalize learner for partner |
| STT low confidence/wrong | mark span, allow correction annotation, inspect audio | uncertainty only | ASR-derived pronunciation weakness |
| evaluator outage/malformed output | durable retry, app remains usable | pending dependent evaluation | weak/default score |
| evaluator disagreement | one escalation, then cannot-judge/fresh sample | pending/partial exact dimensions | average or vote |
| raw deletion deadline before result | delete raw first, explain unresolved/fresh sample | terminal system not_counted correction | extend retention silently |
| deletion verification failure | revoke access, retry/reconcile, privacy incident | accepted structured evidence unaffected | claim deletion complete |
| caption/transcript/typed path used | show condition label and learning feedback | learning evidence only unless verified equivalent profile later | standard Oral/S2/S3 readiness claim |
| Corpus/provider downtime | use cached fixed assets or defer affected mode | local affected scope only | send learner data to Corpus or global outage |

Only these five validity values appear. “Unusable,” “failed,” “cannot judge,” quality and processor states are reasons/operational states, not new evidence-validity enum members.

### 8.2 Restart and freshness

P0–P2 ordinary practice may restart before submitted evidence; restarts are assistance/exposure facts. P3/P4 restarts change the clean claim. A true technical/partner fault permits a fresh equivalent replacement and never creates failure, but exposed same content is not silently reset as independent. Completed valid turns/parts remain useful when their scope is defensible. A new fresh interaction claim needs appropriate family/episode/occasion identity under Stages 06/09.

## 9. Security, privacy, rights, and accessibility

### 9.1 Security and privacy boundary

- Capture runs only in a secure, top-level/same-origin permitted context. Microphone Permissions Policy defaults to self. No third-party frame receives capture authority.
- Permission purpose/retention/processor transfer appears before the browser prompt and again while recording. Capture indicator is never hidden.
- Tracks stop and references are released after every activity/terminal fault; no idle/background always-open mic.
- Browser-to-object and App-to-processor transport is encrypted. Raw objects are private, opaque, per-attempt, least-privilege, short-lived and separately authorized. PostgreSQL owns association/lifecycle.
- At-rest encryption/key rotation use managed storage/key facilities; key IDs and rotation are versioned. Keys are not hard-coded or logged. Stage 23 owns the concrete threat model/key/provider control proof.
- Provider payload is pseudonymous and minimum-purpose: exact audio, minimum scenario/rubric/turn context and opaque request IDs. It excludes name, email, exact exam date, profile, Readiness, other attempts, Writing/Listening data, device fingerprint, accommodation/medical inference, notification/analytics identity and Corpus.
- Raw audio/transcript is never placed in URL/query, cookies, analytics, session replay, general logs, traces, notifications, error dumps or Corpus. Support access is explicit, least privilege, time-bound and audited.
- Stage 19/23 procurement gates require region/subprocessors, training-use prohibition, retention/deletion API or enforceable expiry, security controls, export/exit, incident terms and verified deletion behavior. No legal-compliance claim is made.
- Content/paired-input rights are checked before processor transfer. Rights withdrawal and correctness defect remain separate; neither rewrites a learner performance fact without a scoped impact assertion.

### 9.2 Accessibility and equivalent learning paths

- The MicPreflight and RecordingIndicator use semantic headings/controls, visible labels, word + icon + state, text explanation of level/quality, keyboard operation, 44×44 targets, 320px reflow and 200% zoom.
- Recording start/stop is announced once; recording failure may be assertive. Level/timer ticks are never continuously announced. Reduced motion replaces the pulse with a solid dot plus “Recording.”
- Device selection uses browser-exposed labels with a generic fallback; it never requires interpreting a waveform.
- Partner audio has permitted instructional/text support according to actual condition. Captions/live transcript during a clean target claim are evidence-altering unless a current verified accommodation profile later defines supported equivalence.
- Transcript correction and feedback expose uncertain spans, speaker/turn labels and audio timestamps accessibly. Color/underline alone never communicates error or confidence.
- Typed rehearsal, phrase selection, captioned exchange, observed/model turn reading and solo planning remain available when voice capture is declined/unavailable. They produce learning/assistance facts only, never standard oral performance or genuine voice interaction.
- Accessibility need is not a failure. Evidence narrows only the unsupported capability/claim; all other skills and App functions remain available. No disability/diagnosis is inferred from a chosen path.

## 10. Performance, reliability, operations, cost, and validation

### 10.1 Performance and reliability behavior

- Preflight separates permission, input, codec, recorder event, local quality, upload route and learner device confirmation; no single “ready” flag hides which property passed.
- A versioned capture policy bounds turn duration/bytes/chunk interval and preserves actual MIME. Exact numbers are empirical calibrations with provenance, effective date, evidence and rollback, not stable product rules.
- The learner explicitly ends a turn; automatic endpointing is assistive. System wait/partner latency is excluded from fluency and target timing.
- Chunk upload is bounded and idempotent. A complete manifest is required before evaluation. No direct browser credential grants broad object access.
- Fixed partner media is approved/cached and follows Stage-16 immutable media behavior. Adaptive response is one bounded turn request, not continuous streaming.
- STT is one low-cost pass per completed utterance/block/session as the partner/evaluator need allows, not per acoustic event. One structured evaluation serves feedback/evidence/Mistake Memory; one escalation is exceptional.
- Pending does not block unrelated coaching. Polling follows Stage 12 retry hints; push is not required.

### 10.2 Operational measures without learner content

Measure by opaque policy/provider/release/browser/scenario/part IDs:

- permission request/grant/deny/dismiss/policy-block and device-switch rates;
- preflight silence/clipping/background/wrong-device/false-ready rates;
- selected MIME/track settings, recorder errors, chunk bytes/count, upload latency/failure/dedupe/conflict;
- turn completion, endpoint correction, background/track-ended interruption;
- fixed/adaptive partner latency, retry, scenario-policy rejection, malformed/helpful/dominant incident;
- STT confidence/uncertain-span/correction/dispute rates and transcript-audio disagreement;
- evaluator latency, schema rejection, cannot-judge by dimension, confidence, primary/escalation disagreement, correction and Pending age;
- not_counted/interrupted/partially_valid reason/scope, fresh replacement completion;
- audio object age, delete-by misses, deletion retries, provider receipt and verified-absence completion;
- processor minutes/characters/tokens/calls, object byte-days/operations/egress, human audit/adjudication minutes;
- gold-set agreement by S1–S3, coaching/official criterion, accent/audio condition, partner mode and browser release.

Metrics contain no raw audio, transcript, learner response, profile or pass probability. Stage 24 sets SLO/alert thresholds; Stage 25 turns them into release gates.

### 10.3 Cost and sustainability

Default cost order:

1. reuse reviewed fixed scenarios/branches/audio for P0–P2, diagnostic, repair and routine drills;
2. compute turn order, timing, support, completion and quality observables deterministically;
3. use adaptive turn generation only for S2/S3 when learner meaning must affect the next turn;
4. perform a bounded STT pass only at completed-turn/block granularity;
5. run one structured evaluator for a finalized block;
6. escalate once only for consequential policy reasons;
7. delete raw bytes promptly to minimize storage/retention load;
8. cache only non-learner fixed assets and reviewed repair mappings.

Cheaper fallback: fixed reviewed partner, actual-voice capture, deterministic turn/task feedback, learner review, low-cost transcript with explicit limits, and Pending/not-evidenced unsupported dimensions. It may preserve learning but cannot invent intelligibility, adaptive interaction or Readiness evidence.

Upgrade/substitution triggers:

- fixed/turn-based transfer materially under-predicts real S2/S3 outcomes;
- adaptive partner policy/latency/fairness incidents breach Stage-24/25 gate;
- current STT meaning error materially harms partner routing/evaluation despite repair;
- higher-quality audio evaluation materially improves gold-set pass-critical agreement or reduces false Pending;
- escalation rarely changes supported decisions relative to cost, or changes them enough to justify a different first tier;
- raw-audio deletion/provider expiry cannot be proved;
- capture MIME/browser failure exceeds release gate;
- provider region, retention, training, subprocessor, security, price, support or model release changes;
- human audit/adjudication or fresh-sample burden becomes unsustainable.

Provider exit preserves App-owned scenario/partner/evaluator/STT schemas, immutable turns, manifests, structured candidates/results/corrections, rights-safe benchmark labels, deletion journal and export format. Switch adapters and release new provider/version policies; never rewrite old lineage or require retained raw audio for migration.

### 10.4 Release validation

| Test family | Required evidence |
|---|---|
| Permission/privacy | contextual prompt; denial/dismiss/policy block; same-origin restriction; no pre-grant labels assumption; visible capture and track teardown |
| Device/preflight | silent/wrong device, clipping, background, device switch, learner confirmation, false-ready audit |
| Capture/browser | current/current-previous real browser/device MIME intersection; start/data/stop/error; actual playback/ingestion; exact settings/digest; memory pressure |
| Chunk/idempotency | reordered/duplicate/missing chunks, retry/reload, digest conflict, complete ordinal manifest |
| Lifecycle | background, sleep, track ended, route change, page close, network loss, learner stop, device change |
| Partner | fixed branch determinism; S2/S3 scenario bounds; previous-meaning dependency; fair turn openings; no coaching; latency/fault fallback |
| Interaction | S1 reciprocity; S2 response to different input; S3 proposal/reaction/compromise/convergence; monologue cannot pass interaction gate |
| STT | uncertain spans, no-confidence case, correction overlay, names/numbers, accent/noise diversity, no ASR pronunciation inference |
| Evaluator | schema/evidence refs, audio-dependent dimensions, six coaching vs official rubric separation, cannot-judge, disagreement, exactly one escalation |
| Failure truth | every matrix fault yields only valid/partially_valid/pending/interrupted/not_counted, zero learner-negative system effect, Written/unrelated skills survive |
| Accessibility | keyboard/AT/reflow/zoom/reduced motion, word + state recording, sparse announcements, text meter, learning-only labels |
| Retention/deletion | immediate-final and seven-day-Pending paths; R2/provider deletion; lifecycle defense; absence verification; backups/logs/analytics scan |
| Security/rights | signed object scope, credential leakage, processor minimum payload, training/retention policy, content rights and deletion incident |
| Exit | replay provider-neutral fixtures through substitute STT/evaluator/partner adapters with identical App contract semantics |

## 11. Traceability and downstream handoff

| Decision | Product/design source | Downstream consumers |
|---|---|---|
| contextual permission, actual voice, preflight | app/13 §§9, 17; app/26; Mobile 3.3/5.1; Flow F | 19, 21, 23, 25 |
| fixed/adaptive turn-based partner | app/13 §§6–7, 16; app/28 §8; Mobile 3.4 | 19, 21, 24, 25 |
| genuine S2/S3 interaction | app/13 §§12, 15; app/15; app/28 §§8, 10 | 19, 21, 25, 27, 28 |
| provisional STT/correction | app/13 §§10, 13; app/07 fairness | 19, 23–25 |
| structured audio-aware evaluator, one escalation | app/13 §§12–16; app/28 §§3.5, 8 | 19, 24–28 |
| ephemeral raw audio, seven-day ceiling | app/28 §14; app/26 privacy; Stage 05 | 19, 23–26 |
| typed/captioned learning-only | app/13 §§9, 17; app/15; Design mic-denied/Flow F | 20, 23, 25, 27 |
| neutral scoped failure | app/07; app/16; app/27 precedence; Design failure family | 19–28 |

Downstream stages must preserve:

- actual voice for oral evidence and no cross-modality Speaking initialization;
- fixed reviewed early/routine partner and bounded adaptive turn-based S2/S3 only where meaning dependency warrants;
- genuine interaction links for S2/S3; monologue/typed work is insufficient;
- STT as provisional reference, never an independent pronunciation judge;
- one structured audio-aware evaluation and at most one justified escalation;
- Pending/cannot-judge instead of default-low output;
- immediate-final / maximum-seven-day-Pending raw deletion, no backups, and deletion proof;
- provider-neutral minimum pseudonymous payload and no learner data to Corpus;
- exactly five validity and six Readiness states, independent Written/Oral truth, absent not zero and no probability;
- system/partner/evaluator/accessibility failure neutrality and preservation of unaffected evidence.

Dependencies introduced: versioned CapturePolicy, MicPreflightReceipt, SpeakingAttempt/Part/Turn/Chunk manifests, InteractionEvidenceLink, provisional TranscriptReference/Correction, provider-neutral Partner/STT/OralEvaluator adapters, transient encrypted object lifecycle, deletion proof and Speaking gold fixtures.

Dependencies removed/rejected: onboarding/global mic gate, persistent device fingerprint, continuous always-listening/full-duplex requirement, transcript-as-score, ASR pronunciation judgment, indefinite audio archive, raw audio in backups, multi-model voting and live Corpus.

## 12. Risks, assumptions, validation, and deferred choices

| Risk / assumption | Required evidence / mitigation | Owner |
|---|---|---|
| MediaRecorder MIME differs across supported releases | real-device matrix; allowlist and exact manifest; neutral unsupported path | 25 / implementation |
| level heuristic passes wrong/noisy input | learner sample confirmation + post-attempt incident audit | 24/25 |
| memory-only raw buffer loses a turn | per-turn upload; high-stakes admission; fair fresh replacement | implementation / 25 |
| turn-based partner under-tests real interaction | correlate with target/full oral outcomes; upgrade only on measured gap | 24–27 |
| STT error distorts adaptive reply | confidence-aware clarification, repair evidence, partner-fault neutrality | 19/25 |
| evaluator accent/audio bias | diverse rights-safe human gold labels and audio-capable adjudication | 19/25 |
| one escalation adds cost without value | measure decision-change and agreement improvement | 19/24 |
| provider retains/trains despite App deletion | contractual/config/API verification; substitute or block release | 19/23/25 |
| deletion job or lifecycle misses object | deadline index, reconciliation, verified absence, privacy incident | 23/24/25 |
| design “never shared” copy misleads | replace with truthful processor disclosure before release | 19/23/25 |

No owner blocker remains. Intentionally deferred implementation/provider choices:

| Choice | Future owner | Fixed Stage-18 boundary |
|---|---|---|
| STT/evaluator/partner generation/TTS vendor, model, region, price, training/retention configuration | Stage 19 | provider-neutral contract, minimum payload, audio-aware judgment, one escalation, deletion proof |
| exact capture MIME priority, turn/chunk byte/time limits and signal thresholds | Stage 25 + implementation calibration | versioned allowlist, real-device evidence, actual MIME/digest, rollback; system fault neutral |
| exact adaptive latency/retry and evaluator SLA/alert thresholds | Stages 24/25 | system wait excluded, bounded retry, Pending, no mid-clean hidden fallback |
| object/key/upload implementation details | Stage 23 + implementation | private opaque encrypted objects, least privilege, no backups/logs, seven-day ceiling |
| accommodation authority/equivalence | Stage 23/legal/accessibility review | actual conditions explicit; typed/captioned not standard Oral by default |
| authoritative timer semantics | Stage 21 | preparation/turn/system-wait facts separated; background uncertainty narrows claim |
| exact HTTP paths/database columns/library APIs | implementation | typed owners, ids, idempotency, versions and exhaustive states fixed |
| full-duplex voice | later architecture only after measured trigger | turn-based sufficient launch default |

## 13. ADR

Created:

- Architecture/adr/ADR-0026-ephemeral-voice-evidence-and-bounded-oral-evaluation.md — **Accepted**.

ADR-0026 applies ADR-0001, ADR-0002, ADR-0003, ADR-0010 through ADR-0013, ADR-0015, ADR-0016, ADR-0018 through ADR-0024. It supersedes none.

## 14. Decisions made

1. Microphone permission is contextual, same-origin, learner-initiated and activity-local.
2. Permission, device selection, local quality sample, learner confirmation and upload/capture capability are separate preflight facts.
3. Capture is explicit turn-based with exact MIME/settings/chunk manifests and no default persistent raw browser cache.
4. Session & Attempt owns identities/actual conditions; Evidence owns validity/correction.
5. Fixed reviewed partner is default early/routine; bounded adaptive turn-based partner is used only for meaning-dependent S2/S3 and selected target work.
6. Genuine S2/S3 interaction requires cross-turn dependency evidence.
7. STT is a provisional reference with uncertainty and one post-attempt correction overlay; it never judges pronunciation alone.
8. One audio-aware structured evaluator returns cited part/dimension evidence; one justified escalation is the hard ceiling.
9. Unresolved disagreement/outage becomes Pending/cannot-judge/fresh sample, never a low score.
10. Raw audio is minimal, encrypted, pseudonymous, excluded from backups/telemetry and deleted after finalization or no later than seven days while Pending, with proof.
11. Typed/captioned alternatives preserve learning/access but not standard Oral claims.
12. All failure is scoped and neutral; unaffected Written, skills, parts and facts survive.
13. Provider/model selection and global AI governance remain Stage 19, behind fixed contracts.
14. The design “never shared” copy must be corrected before release if any processor receives audio.
15. No owner decision is required to implement these architecture boundaries.

## 15. Definition-of-done check

- [x] Every required current input and direct Stage-27 precedence source was read; immutable heads/blobs and prior-stage continuity are recorded.
- [x] Source authority is applied and the exact “never shared” design conflict is preserved with a downstream correction.
- [x] Contextual permission, device selection, preflight, capture/turn/chunk/session identities, persistence and visible recording are fixed.
- [x] STT confidence/uncertainty, one correction overlay, reference role and no-pronunciation-judge boundary are fixed.
- [x] S1–S3 fixed/adaptive partner state, preparation, turn completion, latency, interaction evidence and fallback are fixed.
- [x] Audio-aware structured evaluation, confidence/disagreement, one escalation, Pending and correction are fixed.
- [x] Minimal encrypted pseudonymous raw-audio lifecycle, immediate-final/seven-day-Pending deletion, backup exclusion and proof are fixed.
- [x] Denial, silence, wrong device, clipping, background, partner, evaluator, network/background and deletion failures are neutral and scoped.
- [x] Typed/captioned alternatives are accessible learning-only paths and never substitute for Oral evidence.
- [x] Capture/turn/session pseudotypes, permission state diagram, partner sequence/fallback table, confidence/escalation contract, deletion sequence and failure matrix are present.
- [x] Alternatives, data/API/state/ownership/versioning/correction, security/privacy/rights/accessibility, cost/operations/validation/exit and downstream handoff are complete.
- [x] ADR-0026 is Accepted and indexed; all 24 Stage-18 checklist items are supported; no owner blocker remains.
