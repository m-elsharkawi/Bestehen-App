# Bestehen / App — Writing Editor, Autosave, and Evaluation Pipeline

> **Status:** Architecture decision — Stage 17 of 28  
> **Date:** 2026-08-23  
> **Owner:** Stage 17  
> **Scope:** Architecture contracts only; no production implementation

## 1. Purpose and scope

This stage defines the smallest complete runtime architecture that lets a learner write an exam-shaped German email, preserve it through ordinary browser/network failure, finalize it with honest timing, obtain one bounded structured evaluation, repair it without rewriting history, and later prove transfer on fresh content.

It owns Writing prompt/rubric identity, draft/checkpoint/finalization truth, response/revision/evaluation identities, evaluator boundary, disagreement/correction, Writing retention/export/delete behavior, and the learner-visible failure/Pending contract. It does not choose an AI vendor or model, create a provider SDK, implement the editor, redefine Readiness, or reopen the 30-minute target behavior, one-escalation ceiling, structured evaluator, or approximately-five-second loss target.

The architecture preserves exactly five evidence-validity states: **valid, partially_valid, pending, interrupted, not_counted**. A system fault never becomes learner failure. Missing or Pending Writing evidence is absence for dependent conclusions, never zero. Writing affects only the Written component. No pass-probability field, model, event, copy template, or hidden calculation exists here.

## 2. Inputs, authority, and continuity

### 2.1 Reproducible source snapshot

All inputs were read from GitHub main before deciding. App main was **6dd537892dbeceac95472f88c582acf860a6987d**; Shaping main was **9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc**.

| Source | Blob |
|---|---|
| Shaping app/28-bestehen-app-product-specification.md | 18ae80cc2fd63cecd76c297c3e56d44a68367856 |
| Shaping app/07-core-learning-loop.md | c313c859f64997972feca87497d70476c4528a20 |
| Shaping app/08-a1-to-b1-progression.md | 839a01c010cf79777520714d0ab09304a2ba9a06 |
| Shaping app/12-writing-coaching.md | 0a606197ad514e8c8958004188837e37173258be |
| Shaping app/14-review-and-spaced-repetition.md | fa9b65e92cd1511e00e106a199eb6fbc06273a69 |
| Shaping app/15-telc-readiness.md | b4456939928493569336bbc565d7e67307e7a3db |
| Shaping app/16-mock-exams.md | 8f6c23fa16524bd251cef39d823cfeea73bfcef3 |
| Shaping app/21-content-strategy.md | 8149d6a268da70e17cad46f774b9d5de77776986 |
| Shaping app/24-analytics-and-success-metrics.md | 28d1a5380a7ea9f28efdc95ce0c96987920917e1 |
| Shaping app/26-platform-accessibility-nonfunctional.md | 8137091683941b0d55f3d4fb90af3c402b8371e5 |
| Design/DESIGN-HANDOFF.md | 417a6820037e045e2dd9f29afc42b9f2e94fd638 |
| Design/Bestehen-02-Mobile-Screens.dc.html | 0a9f2d3ea982c3197f399941b57defd9869d2428 |
| Design/Bestehen-03-Desktop-Responsive.dc.html | 94056db181b45298a759ff727ad5cfeac2f2a469 |
| Design/Bestehen-01-Design-System.dc.html | d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a |
| Architecture/00-architecture-shaping-plan.md | b263c5e7b3bccc0450ddd17aa0cc007432d672b7 |
| Bestehen_App_Architecture_Checklist.md | 1fcf263b796a16b97d5c49a2162b4a5c11246256 |
| Architecture/05-data-ownership-persistence-and-schema-evolution.md | bb6df811ec9010de556d1719f22e31bb8ca3190e |
| Architecture/06-evidence-ledger-validity-versioning-and-audit.md | 53d34ae65ef4c8fa79c00026f9bd5d7b876ce672 |
| Architecture/08-coaching-engine-and-session-state-machines.md | 02c5e1ee5967bad976eda49ab4813a768eda5bd3 |
| Architecture/09-content-exercise-form-and-media-architecture.md | e6fb121ab1b10c6cbcf692bc88acaf98f2e45e7a |
| Architecture/11-readiness-scoring-mocks-and-ready-to-book.md | 7c327cd770460b94107f2756e2b7d8f29c56b909 |
| Architecture/12-api-contracts-jobs-events-and-idempotency.md | c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528 |
| Architecture/13-frontend-application-and-design-system-architecture.md | 7da94f122fa86412b0d1a12b84c123645693efb4 |
| Architecture/14-responsive-accessibility-browser-and-device-architecture.md | 362068924a6942eb955dcc132fb4c94da122597b |

Required Stages 05, 06, 08, 09, 11, 12, 13, and 14 are complete and compatible. Stage 05 already assigns IndexedDB to local outbox/checkpoints and PostgreSQL to accepted attempt/evaluation truth. Stage 06 fixes immutable attempts, explicit occasions and five validity states. Stage 12 fixes typed versioned HTTP resources, durable jobs, idempotency and optimistic conflicts. Stage 13 fixes a recoverable browser draft mirror. Stage 14 makes proven durability an admission gate.

### 2.2 Authority reconciliation

The final product specification and detailed Writing/NFR shaping are normative. The design is consistent after two explicit interpretations:

1. Mobile screen 5.3 says an offline Writing timing claim is kept because the clock is local. This is a conditional projection, not permission to trust any client clock. Timing remains clean only when the accepted start anchor, monotonic elapsed observations, visibility/interruption facts, frozen cutoff hash, and checkpoint chain are sufficient. Otherwise work survives while the exact continuous claim becomes **interrupted**.
2. The design shows “2 of 4 points covered” while typing. Semantic fulfillment is not inferred by per-keystroke AI or treated as evidence before submission. In the editor it is a learner-controlled planning checklist. After submission, the evaluator returns separate authoritative content-point judgments.

Word count is descriptive only. No official word-count gate is invented. The product’s 30-minute P4 behavior remains unchanged.

### 2.3 Current primary references

No commercial evaluator is selected. Mutable provider/model/pricing claims are intentionally deferred to Stage 19. Browser/accessibility mechanisms rely on already accepted Stage 14 evidence and the following primary sources, accessed 2026-08-23:

- [W3C Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB-3/)
- [WHATWG HTML — system state and capabilities](https://html.spec.whatwg.org/multipage/system-state.html)
- [WHATWG High Resolution Time](https://w3c.github.io/hr-time/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

These sources describe primitives, not a guarantee of persistence, timing fairness, or accessibility. Bestehen proves those properties in its release matrix.

## 3. Architecture decisions

| ID | Decision and default | Consequence / review trigger | ADR |
|---|---|---|---|
| **ARCH-S17-D01** | Content & Forms publishes an immutable **WritingPromptRevision** binding scenario, recipient/register, purpose, explicit semantic content points, rubric revision, target blueprint, support/timing policy, rights and approval. | Attempts pin the exact revision. Reissue, do not mutate. Review on blueprint/rubric/content defect. | ADR-0025 |
| **ARCH-S17-D02** | Separate mutable Draft, immutable OriginalSubmission, same-episode Revision, new-family FreshTransfer, EvaluationCandidate, AcceptedEvaluation, and EvaluationCorrection identities. | Revision never overwrites original; freshness/independence is explicit. Review if a new flow cannot preserve lineage. | ADR-0025 |
| **ARCH-S17-D03** | Use a bounded dual checkpoint: browser IndexedDB write-ahead plus idempotent server checkpoint when reachable. Force checkpoints at semantic/lifecycle boundaries; tune a versioned cadence to meet the approximately-five-second measured loss target. | Server ACK is synchronized truth; local unacked work stays recoverable. High-stakes admission fails closed if durability cannot be proved. Review on loss-bound miss. | ADR-0025 |
| **ARCH-S17-D04** | Finalization freezes one response hash and actual condition cut. P4 uses the accepted 30-minute timing rule; reload/offline cannot reset or extend it. A post-time continuation is a separate practice revision. | A locally frozen offline submission syncs later under the same operation; server receipt alone means accepted. Uncertain continuity narrows validity. Review with Stage 21 timer evidence. | ADR-0025 |
| **ARCH-S17-D05** | Deterministic validation precedes exactly one provider-neutral, structured evaluator request. One request returns official criterion bands, per-point states, evidence spans, coaching dimensions, limited corrections, confidence, versions and uncertainty. | No call chain, live Corpus, hidden scoring field, or readiness calculation. Review on benchmark regression or contract-major need. | ADR-0025 |
| **ARCH-S17-D06** | Permit at most one policy-justified escalation for consequential uncertainty. Evidence owner accepts/rejects candidates and records disagreement; unresolved uncertainty remains Pending/cannot-judge or requests a fresh sample. | No model voting or score averaging. Outage never becomes a weak score. Review cost/quality trigger in Stages 19/24/25. | ADR-0025 |
| **ARCH-S17-D07** | Same-prompt revision is guided learning within the original episode/occasion. Independent Writing evidence requires a fresh unexposed family and eligible new occasion; full claims require a complete fresh email. | Model/correction exposure is recorded. Revision demonstrates responsiveness only. Review if independence policy changes with validation. | ADR-0025 |
| **ARCH-S17-D08** | Retain accepted original Writing, learner revisions, structured evaluations and corrections until learner deletion by default; local abandoned drafts expire after 30 days and acknowledged local copies after 24 hours. Export useful text/lineage; deletion revokes then purges App/local/provider data. | Evaluator payload is minimum-purpose and terminal provider copies are deleted by adapter policy. Stage 23/legal review owns jurisdictional wording. | ADR-0025 |
| **ARCH-S17-D09** | Writing UI exposes non-modal save states, stable prompt/obligations, keyboard/screen-reader editor semantics, sparse announcements, and exact Pending/system-fault recovery actions. | Timer ticks are never announced. Failure blocks only dependent evaluation/claims. Review on AT/reflow failures. | ADR-0025 |
| **ARCH-S17-D10** | Version all prompt, rubric, evaluator-contract/release, checkpoint policy, timing, validity and correction semantics independently. Operate one durable job with bounded retry/cost; Stage 19 selects provider/model and global governance. | Old facts remain interpretable; corrections append and trigger targeted recomputation. Provider exit retains App-owned contracts/benchmarks. | ADR-0025 |

## 4. Alternatives, rationale, consequences, and exits

| Decision | Simpler / do-nothing option | Other credible option | Chosen rationale, rejection and exit |
|---|---|---|---|
| Prompt/rubric | Store one instruction string | Fully generic rubric graph | A string cannot audit four obligations/register; a graph is unnecessary. Immutable typed revision is smallest sufficient. Export JSON and migrate by contract adapter. |
| Identities | Keep only latest text and score | Event-source every keystroke | Latest-only destroys original evidence; keystroke event sourcing is invasive and costly. Checkpoint snapshots plus immutable submissions preserve required truth. |
| Autosave | Server save on submit only | Local-only draft | Submit-only loses effort; local-only cannot prove synchronized acceptance or cross-device recovery. Dual checkpoint degrades locally and exits through standard IndexedDB/HTTP data. |
| Cadence | Fixed five-second interval | Save every keystroke to server | Fixed interval may miss active typing/lifecycle edges; per-key server writes increase privacy/ops cost. Debounced local ≤ calibrated maximum plus forced boundaries and coalesced server sync is measured, not assumed. |
| Timing/finalization | Trust wall clock and latest text | Server-online-only timer | Wall clock is mutable; online-only breaks loaded offline continuity. Anchored monotonic facts plus immutable cutoff preserve honest offline work. Stage 21 can replace mechanism without changing facts. |
| Evaluator | Self-check only | Multi-agent chain for score, feedback and repair | Self-check is honest fallback but cannot provide required rubric evaluation. Chaining multiplies cost/inconsistency. One structured call is bounded and replaceable. |
| Escalation | Always accept first result | Majority vote among models | Blind acceptance overstates uncertainty; voting creates arbitrary recurring cost. One trigger-based escalation, then Pending/fresh sample, has a hard exit. |
| Revision | Overwrite original after feedback | Count revised final text equally | Both corrupt independence. Linked immutable responses preserve learning value and original evidence. |
| Retention | Retain provider payload/log forever | Delete all text immediately after scoring | Indefinite retention increases privacy risk; immediate deletion breaks correction/history/export. App retains learner-useful text, provider receives minimum payload and is cleaned. Learner deletion is the exit. |
| UI state | Spinner/modal until evaluation | Fully optimistic score | Modal blocks unrelated work; optimistic scoring invents truth. Durable Pending resource and local banners are accessible and honest. |
| Provider | Select a cheap model now | Build vendor-specific evaluator | No current benchmark/cost evidence exists at this stage. Stage 19 chooses behind the contract; self-check/Pending remains cheaper fallback. |
| Storage | Add CRDT collaboration | Last-write-wins | Single-learner editing does not justify CRDT; last-write-wins loses branches. Explicit divergent draft resolution is smaller. Add CRDT only if measured simultaneous collaborative editing becomes product scope. |

Positive consequences are durable recovery, auditable independent evidence, bounded evaluation cost, neutral failures, and provider portability. Costs are local/server checkpoint complexity, benchmark/operator work, retained learner text sensitivity, explicit conflicts, and occasional Pending results. Cost may not remove pass-critical Writing evidence, accessibility, or recovery.

## 5. Components and responsibility ownership

| Component / context | Owns | Must not own |
|---|---|---|
| Content & Forms | immutable prompt/scenario/content-point/rubric revisions; approval/rights | learner response, score, evaluator choice |
| Session & Attempt | editor attempt, checkpoint stream, timing facts, frozen finalization, immutable response identities | validity, Readiness, semantic score |
| Writing feature controller | in-memory form, learner planning checklist, local checkpoint mirror/status, guarded finalization intent | accepted submission, evidence, evaluator result |
| Productive Evaluation | job/request, provider adapter, candidates, contract validation, minimum payload and cleanup | final evidence validity, Readiness |
| Evidence & Capability | candidate acceptance, official/coaching observations, five-state validity, corrections and affected scope | provider transport, editable learner text |
| Coaching/Mistake/Review | diagnosis/repair/retry/retention projections from accepted evidence | original score mutation |
| Measurement | deterministic Written projection from eligible accepted evidence | evaluator calls or pass probability |
| Account/Data Rights | scope link, export/delete orchestration | content/evaluator semantics |
| Operations/Governance | version promotion, benchmark, redacted latency/cost/fault measures | learner text in telemetry or Corpus |

Corpus is never on the runtime path and receives no learner text/profile. It may asynchronously inform approved prompt/rubric intelligence through the Stage 09/10 publication boundary.

~~~mermaid
flowchart LR
  C[Content & Forms<br/>prompt/rubric revision] --> A[Session & Attempt<br/>draft/checkpoint/finalize]
  UI[Writing controller<br/>local recovery] <--> A
  A --> J[Durable evaluation job]
  J --> PE[Provider-neutral evaluator adapter]
  PE --> E[Evidence owner<br/>candidate acceptance]
  E --> CO[Coaching / Mistake / Review]
  E --> M[Deterministic Measurement]
  DR[Data rights] --> UI
  DR --> A
  DR --> PE
~~~

## 6. Data, identity, contracts, and versioning

All examples are explanatory pseudotypes, not production TypeScript or DDL.

### 6.1 Writing domain and evaluator pseudotypes

~~~text
WritingPromptRevision = {
  prompt_revision_id, content_family_id, task_family_id,
  scenario_category, source_message, communicative_purpose,
  recipient: { relationship, register: informal | semi_formal },
  content_points: [
    { point_id, learner_wording, intent, semantic_components[],
      acceptable_interpretations, brief_can_satisfy, combinable_with[] }
  ],
  rubric_revision_id, blueprint_version, target_role: P0 | P1 | P2 | P3 | P4,
  permitted_support_policy_version, timing_rule_version,
  language, rights, approval, content_contract_version, payload_hash
}

WritingAttempt = {
  attempt_id, learner_scope_id, session_id, episode_id,
  independent_occasion_id, prompt_revision_id,
  purpose, progression_profile, started_at_receipt,
  expected_resource_version, preflight_receipt_id?,
  state: prepared | editing | recovery_required | locally_finalized |
         accepted_pending | evaluated | closed
}

DraftCheckpoint = {
  checkpoint_id, attempt_id, stream_id, sequence,
  base_server_version, operation_id, local_schema_major,
  response_text, learner_planning_point_states[],
  monotonic_elapsed_ms, wall_observed_at, visibility_observations[],
  assistance_and_exposure_facts[], payload_hash,
  local_committed_at, server_recorded_at?, server_receipt?
}

WritingResponse = {
  response_id, attempt_id, response_kind:
    original_submission | same_prompt_revision | fresh_transfer,
  parent_response_id?, episode_id, independent_occasion_id,
  prompt_revision_id, content_family_id, response_text,
  frozen_payload_hash, finalized_occurred_at, accepted_recorded_at?,
  descriptive_word_count, completeness,
  timing_and_condition_fact_refs[], assistance_and_exposure_refs[],
  submission_ordinal, immutable_after_acceptance
}

EvaluationRequest = {
  evaluation_request_id, attempt_id, response_id,
  purpose: standard | escalation,
  evaluator_contract_major, rubric_revision_id,
  prompt_revision_id, response_hash, condition_context_digest,
  minimum_payload_manifest, requested_dimensions[],
  policy_version, deadline, spend_class
}

StructuredEvaluationCandidate = {
  candidate_id, request_id, evaluator_release,
  official_criteria: [
    { criterion: I | II | III, band: A | B | C | D,
      raw_equivalent?, confidence: high | medium | low,
      evidence_span_refs[], reason_code }
  ],
  content_points: [
    { point_id, state: fulfilled | partly_fulfilled |
      not_fulfilled | uncertain, evidence_span_refs[], confidence }
  ],
  coaching_dimensions: {
    communicative_success, structure_cohesion, vocabulary,
    grammar_formal_accuracy, register, conventions, timing_completion
  },
  task_flags: { wrong_topic, wrong_situation, cannot_judge },
  diagnosis: { primary, contributor?, confidence, unresolved_reasons[] },
  correction_targets: [
    { priority, impact: critical | material | minor,
      original_span_ref, minimal_correction?, explanation_key }
  ],
  verdict: likely_b1_sufficient | borderline | below_b1 | cannot_judge,
  confidence: high | medium | low,
  disagreement_or_limit_reasons[], schema_version, output_hash
}

AcceptedWritingEvaluation = {
  accepted_evaluation_id, response_id, accepted_candidate_id?,
  validity_assertion_id, supported_scope, unsupported_scope,
  acceptance_policy_version, rubric_revision_id, evaluator_release,
  disagreement_resolution?, accepted_at, immutable_payload_hash
}

EvaluationCorrection = {
  correction_id, target_accepted_evaluation_id,
  supersedes_correction_id?, affected_scope, reason_code,
  prior_and_replacement_candidate_refs, asserted_by,
  effective_at, recorded_at, recomputation_requests[]
}
~~~

Evidence spans use a contract-versioned text coordinate system and quote digest, never hidden chain-of-thought. They must point to the learner text or content-point/rubric identifiers and survive Unicode normalization rules. The accepted result may contain at most two emphasized correction targets, or three only when a distinct missing task obligation accompanies two independent high-impact issues.

### 6.2 Identity and independence rules

| Artifact | Mutability | Episode / occasion | Evidence effect |
|---|---|---|---|
| Draft checkpoint | Replaceable by higher accepted sequence; history bounded | Original episode; no observation | Recoverable workflow only |
| Original submission | Immutable after accepted finalization | Establishes attempt response in current episode/occasion | Eligible under actual conditions/evaluation |
| Same-prompt revision | New immutable response linked to original | Same episode and independent occasion | Guided learning/responsiveness; not fresh Readiness anchor |
| Immediate fresh retry | New attempt/family, normally same episode/occasion | Same episode unless independence policy says later | Transfer signal, not automatic independent count |
| Delayed fresh transfer | New unexposed family and eligible occasion | New episode/occasion by Stage 06/07 policy | May become strong independent evidence |
| Model/reference correction | Immutable exposure artifact, not learner response | Exposure recorded on episode | Never learner evidence |
| Evaluation candidate | Immutable processor output | Refers to original occasion only | No truth until accepted |
| Accepted evaluation | Immutable accepted interpretation | Same response/occasion | Can create scoped evidence |
| Correction | Append-only supersession | Reinterprets original occasion | Targeted projection recomputation; no new occasion |

### 6.3 Command, query, and job boundary

The Stage 12 HTTP envelope, operation receipts, ETags, expected versions and RFC 9457 request problems remain authoritative.

| Boundary | Contract |
|---|---|
| Start Writing attempt | Pins prompt/rubric/timing/support/preflight revisions; returns attempt and server timing anchor. No evidence exists. |
| Put checkpoint | Idempotent by attempt + stream + operation; sequence/hash must advance expected base. Returns local/synchronized receipt. |
| Finalize/submit | Includes frozen response hash, checkpoint cut, condition/timing facts and expected attempt version. Returns accepted_pending plus stable evaluation job, or exact conflict/recovery state. |
| Get attempt/recovery | Returns authoritative accepted cut plus safe local merge instructions; never a guessed latest draft. |
| Get job/evaluation | ETag/Retry-After polling. Pending is a domain state, not an error or score. |
| Create revision | Creates a new response linked to original; never updates original. |
| Request dispute review | Creates the one eligible escalation only when policy trigger and ceiling allow; otherwise returns fresh-sample or explanation action. |
| Export/delete | Uses Stage 05/12 durable operations; late checkpoints/results after tombstone are rejected and purged. |

Evaluation semantic identity is response_id + prompt/rubric revision + evaluator contract major + purpose. At most one normal request and one justified escalation exist. Same identity and hash returns the same job/result; changed payload conflicts or requires a new semantic request. An evaluator upgrade never silently rescores a response.

### 6.4 Independent version axes

| Version | Owner / change behavior |
|---|---|
| writing_content_contract / prompt revision | Content & Forms; immutable successor |
| rubric revision / target blueprint | Content & Forms/Measurement governance; historical lineage preserved |
| checkpoint schema / checkpoint policy | Session & Attempt; additive adapter; unknown consequential major fails closed |
| timing rule / timer integrity policy | Session & Attempt, finalized by Stage 21; no reset/guessed time |
| evaluator contract major | Productive Evaluation + Evidence; validates required structure/scope |
| evaluator release | Stage 19 gateway; benchmark/promotion separately |
| acceptance/disagreement policy | Evidence owner; append correction if interpretation changes |
| evidence/validity contract | Evidence owner; exactly five states |
| correction reason/version | Evidence owner; append-only and targeted |
| export/delete format/policy | Data Rights; historical export states versioned |
| loss-target calibration | Session/Operations; provenance, effective date, measurement, rollback |

The approximately-five-second loss target is a shaped behavior and a **versioned operational calibration**, not an unconditional browser promise. A release manifest records target duration, local debounce maximum, forced boundaries, server coalescing policy, evidence window, sample/device matrix, effective date, validation result and rollback. A miss blocks high-stakes Writing promotion until repaired or transparently limits the activity.

## 7. Main flows and state transitions

### 7.1 Editor, autosave, and recovery state diagram

~~~mermaid
stateDiagram-v2
  [*] --> Prepared
  Prepared --> Editing: start receipt + durability ready
  Editing --> LocalSaving: meaningful change / cadence
  LocalSaving --> Editing: IndexedDB commit
  LocalSaving --> RecoveryRequired: local commit fails
  Editing --> ServerSyncing: local checkpoint queued
  ServerSyncing --> Editing: server receipt
  ServerSyncing --> OfflineLocal: network unavailable
  OfflineLocal --> LocalSaving: continued typing
  OfflineLocal --> ServerSyncing: reconnect
  Editing --> Conflict: divergent base/sequence
  OfflineLocal --> Conflict: server branch differs
  Conflict --> Editing: learner chooses/combines branch
  Editing --> LocallyFinalized: submit or target cutoff freezes hash
  OfflineLocal --> LocallyFinalized: offline finalization freezes hash
  LocallyFinalized --> AcceptedPending: server commit + job receipt
  LocallyFinalized --> Conflict: server precondition differs
  AcceptedPending --> Evaluated: accepted result
  AcceptedPending --> Pending: evaluation unresolved
  Pending --> Evaluated: later accepted result
  RecoveryRequired --> Editing: durability restored
  RecoveryRequired --> [*]: preserve/export/leave without clean start
~~~

Meaningful changes are coalesced; local checkpoints occur no later than the active calibrated window and immediately on blur, visibility loss, route/close attempt, connectivity change, timer warning/cutoff, explicit save, and submit. Server sync may be less frequent when local durability is healthy, but a high-stakes start needs proof of at least one recoverable path and finalization needs a recoverable frozen copy.

Save labels are explicit and non-modal: **Saving…**, **Saved on this device at…**, **Saved to your account/guest scope at…**, **Offline — saved on this device**, **Could not save — do not close**, and **Conflict — both drafts preserved**. “Saved” always names its scope.

The learner planning checklist is keyboard-operable, optional and locally checkpointed. It never auto-claims semantic fulfillment. The post-submit result uses evaluator states fulfilled, partly fulfilled, not fulfilled, or uncertain.

### 7.2 Submission, evaluation, escalation, and correction sequence

~~~mermaid
sequenceDiagram
  actor L as Learner
  participant UI as Writing editor
  participant IDB as Local checkpoint
  participant A as Session & Attempt API
  participant Q as Durable job
  participant G as AI gateway adapter
  participant E as Evidence owner
  participant P as Projections

  L->>UI: Write; mark planning obligations
  UI->>IDB: Coalesced + forced checkpoint
  UI->>A: Idempotent checkpoint when online
  L->>UI: Submit / 30-minute cutoff
  UI->>IDB: Freeze response hash + actual conditions
  UI->>A: Finalize same operation + expected version
  A->>A: Deterministic prechecks
  A->>Q: TX immutable response + Pending + one job
  A-->>UI: Accepted; evaluation Pending
  Q->>G: Minimum prompt/rubric/response payload
  G-->>Q: Structured candidate
  Q->>E: Validate schema, identity, rubric, confidence, scope
  alt candidate accepted
    E->>P: Append evaluation/assertion + recompute jobs
    UI->>A: Poll/refetch job/evidence
    A-->>UI: Stable result + next action
  else one escalation justified
    E->>Q: One distinct escalation request
    Q->>G: Stronger/independent configured tier
    G-->>E: Second candidate
    E->>P: Accept scoped resolution or preserve Pending
  else unresolved / invalid / outage
    E-->>UI: Cannot judge / Pending / not_counted; fresh task or retry later
  end
  opt later audited correction
    E->>P: Append correction; targeted recomputation
  end
~~~

### 7.3 Deterministic prechecks and evaluation admission

Before any evaluator cost:

1. verify learner scope, deletion/tombstone and authorization;
2. verify immutable prompt/rubric/blueprint revision, rights/approval and response association;
3. prove submitted/frozen response exists, hash matches and is not corrupt;
4. classify empty/unsubmitted/unsupported-language or obviously corrupt payload without fabricating a rubric score;
5. record descriptive length only; do not apply an official word-count gate;
6. validate actual timing, pause/interruption, assistance, reference/model exposure, accessibility and capability facts;
7. validate content-point metadata and required dimensions;
8. look up the same semantic evaluation request and cached terminal result;
9. enforce payload limit, deadline, abuse and one-escalation ceiling;
10. create one durable request or retain W0 self-check/Pending fallback.

Greeting/closing presence may be a weak deterministic hint, never a semantic grade. Content fulfillment, register, clarity and B1 quality require contextual evaluation or remain unknown.

Candidate admission rejects/quarantines malformed schema, wrong response/hash, missing required dimensions, invented criteria, impossible content-point IDs, prohibited probability-like fields, unsupported versions, duplicate/conflicting result identity, deletion after dispatch, or output outside approved correction limits. A technically valid candidate is still not evidence until the Evidence owner accepts its supported scope.

### 7.4 Timing and conflict matrix

| Situation | Authoritative action | Timing / validity effect | Learner UI |
|---|---|---|---|
| Clean online P4 reaches 30:00 | Freeze exact current text; submit same operation | Target time retained if anchors/facts valid | “Time ended; your response was saved and sent for evaluation.” |
| Learner submits early | Freeze and submit | Actual elapsed recorded; no penalty invented | Confirmation then Pending/result |
| Offline at manual submit | Freeze locally; queue immutable hash | May remain clean if clock/conditions/checkpoint chain trustworthy | “Finished on this device; sends when online.” |
| Offline at 30:00 | Local cutoff freezes measured version; later typing creates post-time revision | Original can remain target-time; continuation is practice | Show both measured version and continue-as-practice choice |
| Reload/crash with trusted anchors | Recover latest committed checkpoint; clock derives from accepted anchor/monotonic facts | Preserve claim only if loss/continuity within policy | State last saved scope/time and remaining trustworthy time |
| Reload/crash with uncertain clock | Preserve draft, never grant guessed time | Exact continuous scope becomes interrupted; other language evidence may remain | “Your writing is safe; exam timing could not be verified.” |
| Background/sleep | Clock does not pause for P4; record visibility/suspension | Clean only if elapsed/cutoff can be reconstructed and no forbidden pause | Honest remaining time or interrupted explanation |
| Ordinary practice pause | Explicit pause fact | Practice timing only; no P4 claim | Paused label and resume |
| Same checkpoint retry | Return existing receipt | No new draft/evidence | Stable saved state |
| Older checkpoint arrives late | Ignore as stale; retain audit as needed | No overwrite | No disruption |
| Same sequence, different hash | Preserve both branches; block submit | Draft conflict, no evidence yet | Side-by-side timestamp/device/source and choose/combine |
| Two devices finalize same attempt | First valid terminal commit wins; divergent later payload conflicts | One original submission only | Show accepted original; offer new revision/attempt |
| Server response lost after commit | Query operation receipt; do not resubmit blindly | Same submission/job | “Checking saved submission…” |
| Target version revoked for fairness | Stop exact scope, preserve text | interrupted/not_counted by Evidence owner | Explain system/content issue; offer fresh fair task |
| Evaluator late after revision | Attach to original response ID only | Cannot overwrite revision or newer truth | Result names original submission/date |
| Late result after deletion | Reject/purge under tombstone | No restored evidence | Deletion status only |

### 7.5 Same-prompt revision and fresh transfer

After the original evaluation, the learner may revise only as a new linked response. The UI renders a diff but the evaluation of the original remains immutable. Model/reference/minimal correction exposure is recorded before revision. A revision may demonstrate self-editing and satisfy a repair obligation; it cannot independently raise Readiness.

A fresh transfer uses a different unexposed content family requiring the same underlying function/pattern. A compact fresh task can prove a narrow repair. Overall task fulfillment, sustained register, full communicative design, target-time execution, or readiness-grade Writing improvement requires a complete fresh email. Repeated same-prompt/model-exposed work remains the original episode/occasion.

## 8. Failure, recovery, uncertainty, and Pending UI contract

| State / failure | Truth and evidence consequence | Required UI and actions | Forbidden behavior |
|---|---|---|---|
| Local saving | Workflow only | Visible non-modal status; editor remains usable | Modal on every save |
| Local durability failed | No new clean high-stakes start; in-memory work preserved | “Could not save — keep this tab open”; retry/server save/export text | Claim “saved” |
| Offline with durable local copy | Continue loaded Writing | Name device-only save; queued finalization; reconnect status | Block editor or imply server save |
| Divergent draft | Both branches preserved | Accessible compare metadata/content; choose/combine/start new attempt | Last-write-wins |
| Evaluation Pending | Dependent rubric/evidence/readiness unchanged | “Waiting for your Writing evaluation”; continue unrelated work; stable job status | Spinner forever, zero/weak score, whole-session block |
| Evaluator outage/timeout | Pending within bounded policy, then cannot-judge/not_counted as supported | W0 self-check, reviewed reminders, retry later/fresh task | Fabricated grade or repeated paid calls |
| Malformed/unsupported candidate | Quarantine; no learner impact | Neutral delayed feedback; correlation ID and safe action | Parse partially and guess |
| Material candidate disagreement | Lower confidence; one escalation if eligible | Show borderline/range/cannot-judge reason and concrete evidence | Average arbitrary scores |
| Prompt/rubric defect | Affected scope not_counted; content quarantined | “This wasn’t you”; preserve draft; fair replacement | Penalize learner |
| Timing integrity lost | Work remains; clean timing scope interrupted | Resume as practice or fresh timed attempt | Reset/grant guessed time |
| Rights withdrawal | Stop future serving/provider transfer; correctness unaffected unless explicit defect | Exact unavailable reason and replacement | Rewrite historical performance solely for rights |
| Late corrected evaluation | Append correction and recompute affected projections | Show original-view history plus current corrected interpretation | Destructive score overwrite |
| Unexpected UI exception | Local error boundary preserves checkpoint and correlation | Restore/editor/export/continue unaffected route | Whole-app crash or evidence guess |

Pending uses a stable banner after the design’s short skeleton period, not indefinite motion. It names what is waiting, what remains usable, and whether the learner must act. System-fault language begins with “This wasn’t you.” Toasts never contain the only copy of a result or recovery action.

## 9. Retention, export, deletion, security, privacy, rights, and accessibility

### 9.1 Retention/export/deletion flow

~~~mermaid
flowchart TD
  D[Local draft/checkpoint] -->|accepted submit| R[Retained App response]
  D -->|abandoned 30-day ceiling| LD[Local purge]
  R --> E[Structured evaluation + correction history]
  R --> X[Authenticated export at source cut]
  E --> X
  U[Learner requests deletion] --> T[Immediate access revocation/tombstone]
  T --> LP[Local purge instruction/journal]
  T --> AP[App owner-context purge]
  T --> PP[Provider/cache/job purge]
  LP --> V[Verified live deletion status]
  AP --> V
  PP --> V
  V --> B[Backup-expiry suppression per Stage 05]
  B --> C[Complete after bounded verification]
~~~

Retention defaults:

- unacknowledged local work remains until completion/abandonment, with **30 days** maximum for abandoned text;
- acknowledged local recovery copies expire within **24 hours**;
- accepted original submissions, learner revisions, accepted structured evaluations/corrections and useful Writing history remain until learner deletion;
- terminal job/idempotency metadata follows Stage 05/12 bounded defaults; payload text is not general job telemetry;
- evaluator/provider request/response copies are removed after terminal acceptance/rejection and any bounded dispute need defined by Stage 19/23; the App keeps its own minimum auditable structured candidate/result;
- temporary export artifacts expire within 24 hours;
- backups and deletion journal follow the accepted 84/91-day maximum process, without claiming immediate physical backup erasure.

Export includes retained learner text, response kind/lineage, prompt description/IDs subject to rights, actual conditions, criterion/content-point outputs, confidence/validity, correction/supersession history and plain-language version explanations in structured and human-readable forms. It excludes vendor secrets, hidden reasoning, raw restricted Corpus/reference content, abuse internals and unrelated learner data.

Delete revokes access first, rejects late checkpoints/callbacks/results, purges local/server/object/provider copies through idempotent tasks, prevents restore resurrection, and states live-deletion versus backup-expiry status. No legal-compliance claim is made; Stage 23 and jurisdiction-specific counsel own processor/retention/consent wording.

### 9.2 Minimum evaluator payload and access boundary

The adapter sends only:

- the learner response text;
- the minimum source scenario/recipient/register/purpose and semantic content-point definitions needed to judge it;
- the official rubric revision and bounded evaluator instructions;
- language and required output schema;
- non-identifying condition facts only when they affect the requested judgment;
- opaque request ID with no learner/account identity.

It excludes learner name/email unless literally and necessarily present in the submitted response, profile, Readiness, mistake history, other attempts, exact exam date, device/browser fingerprint, IP, accessibility/medical inference, raw Corpus, analytics IDs and secrets. Where a prompt uses a personal placeholder, published content should prefer neutral fictional context. Provider logs/training/retention and region are Stage 19/23 procurement gates; no provider receives permission to train on learner text by default.

Authorization is least privilege by context and learner scope. Writing text never enters URLs, general logs, error traces, analytics, session replay, Corpus, notifications or push payloads. Telemetry uses redacted reason/version/status/latency/token/cost categories. Stored text and exports use accepted transport/storage controls; browser encryption is not claimed to make a compromised origin safe.

Rights/approval are checked before serving and before provider transfer. A rights-only takedown blocks future distribution while keeping the least lawful lineage needed to explain a learner-owned result; correctness/fairness defects append scoped evidence impacts.

### 9.3 Accessibility contract

- Prompt, source message, recipient/register, four obligations, editor, word count, save state, timer, errors and submit are semantic text/controls with German language metadata where appropriate.
- At 320 px reflow and 200% zoom, obligations and editor remain reachable without two-dimensional scrolling. At 768+ prompt/checklist may stay beside the editor; at phone widths the checklist is a reachable sticky/disclosure region, never lost behind scroll.
- The editor is a native multiline text input or equivalently tested semantic control. Enter never globally submits it; IME/composition, browser/AT/native controls and editing shortcuts win.
- Every action has a keyboard/touch/switch path. Focus does not jump on autosave. Conflict/recovery moves focus only after explicit action to an error summary or dialog heading and restores it predictably.
- Save state is visible text and is announced only on meaningful failure, offline transition, recovered/conflict state or explicit finalization—not on every checkpoint. Timer ticks are never announced.
- Content-point planning does not depend on color/icons. Post-submit evidence spans have a sequential textual alternative and do not require hover.
- Spellcheck/autocomplete/grammar/dictation policy follows the recorded attempt condition. Access support is not answer assistance by default; any capability-changing support records exact equivalence per Stage 14. P4 language-changing aids narrow the standard Writing claim.
- Pending, correction and system-failure banners use status text plus action, not color alone. Reduced motion removes animated saving/progress indicators.

## 10. Performance, reliability, operations, validation, and cost

### 10.1 Runtime and reliability policy

The local edit path has no Corpus or evaluator call. Typing remains responsive while checkpoint serialization/writes are coalesced off the immediate input path. Server synchronization is background and idempotent. Submit creates one transactionally durable response/job and returns a stable Pending resource; it does not wait for a provider.

High-stakes admission proves the exact candidate browser/device can commit and recover a representative checkpoint through at least one permitted durability route. Persistent-storage API flags alone are insufficient. A finalization is not server-accepted until receipt; if offline, the frozen local copy and queued operation are stated precisely.

No fixed uptime SLA is invented. Stage 24 versions thresholds from evidence. The following measures are mandatory and contain no learner text:

| Measure | Why / release action |
|---|---|
| observed recoverable character/time loss by release/browser/device/storage state | Any measured breach of configured approximately-five-second target blocks affected high-stakes promotion or rolls back checkpoint policy |
| local checkpoint latency/failure/quota/eviction and server receipt latency/error | Tune coalescing; preserve local fallback; capability-local block |
| recovery success, divergent-branch incidence, duplicate finalization prevention | Incident on silent loss/overwrite/duplicate evidence |
| timer reconstruction/cutoff mismatch/background uncertainty | Downgrade exact timing; release gate with Stage 21/25 |
| evaluation queue age, end-to-end latency, timeout/cancel/late/duplicate rate | Pending copy and capacity/fallback decision |
| schema rejection, low confidence, disagreement/escalation and correction rates by approved slice | Evaluator promotion/regression; never learner metric |
| evaluator token/input/output/variable cost per accepted evaluation and escalation yield | Stage 19/24 budget/upgrade decision |
| provider deletion/retention receipt and late-after-delete rejection | Security/privacy release and incident evidence |
| keyboard/AT/reflow completion and save-state announcement noise | Stage 25 accessibility gate |

Validation includes crash/reload at every cadence edge, IndexedDB denial/quota/eviction, offline cutoff and reconnect, lost server response, stale/out-of-order checkpoints, two-device divergence, Unicode/IME, background/sleep/wall-clock change, exact 30-minute cutoff, post-time revision split, tombstone/late callback, malformed/hostile structured output, duplicate/late candidates, B/C and content-point benchmark slices, one-escalation ceiling, prompt/rubric defect, correction/recomputation, 320 px/200% zoom, keyboard and named AT/browser/device matrix.

### 10.2 Bounded cost, fallback, upgrade and provider exit

Normal submitted Writing uses one structured evaluator call. The same response/prompt/rubric/evaluator/condition digest reuses the accepted result. One escalation is permitted only for a policy trigger: consequential P4/mock B/C boundary, low confidence that could move Written readiness, material contradiction with recent high-quality evidence, plausible high-impact learner dispute, known weak benchmark slice, or internally contradictory output. Ordinary low-confidence practice prefers broad W0 feedback or a fresh sample.

Cheapest fallback is W0: preserve text/conditions, learner self-check of four obligations/register, reviewed planning reminders, and Pending/cannot-judge with no Readiness movement. It never claims an official score. Provider/model upgrade requires benchmark gain on relevant boundary/slices, accepted latency/reliability/region/privacy/rights, and justified variable cost. A cheaper model may replace the default only after the same gates.

Provider exit retains App-owned JSON schemas, prompts/instructions, rubric mapping, rights-safe benchmark/gold labels, request/result digests, accepted structured results and correction policy. The adapter can move to another provider or a bounded human path without changing response/evidence IDs. Commercial selection, recurring/variable costs, egress/retention/region, gateway routing, model release, spend ceilings and global governance are intentionally owned by **Stage 19**.

## 11. ADR

Created **ADR-0025: Durable Writing drafts and bounded versioned evaluation**, status **Accepted**. It covers ARCH-S17-D01–D10 and applies ADR-0001, ADR-0012, ADR-0013, ADR-0019, ADR-0020, ADR-0021 and ADR-0022. It supersedes none.

## 12. Relationship to earlier and later stages

### 12.1 Decisions downstream stages must preserve

- **Stage 19:** choose provider/model only behind this structured contract; benchmark before readiness influence; enforce one standard call/one escalation, minimum payload, provider deletion, budgets and exit.
- **Stage 20:** account/local adoption preserves attempt/response/checkpoint IDs and both divergent drafts; export/delete includes local and provider work; no account wall for first use.
- **Stage 21:** finalize clock anchors, offline outbox and conflict mechanics without changing frozen response, five validity states, 30-minute behavior or approximately-five-second measured target.
- **Stage 23:** threat-model Writing text, processors, rights, retention/deletion and jurisdiction-specific review; do not broaden payload or claim compliance.
- **Stage 24:** instrument only redacted measures; version loss/latency/cost/quality thresholds; avoid response/session replay and circular model validation.
- **Stage 25:** release-gate benchmark, failure injection, loss bound, exact cutoff, browser/device/AT/reflow and correction paths.
- **Stage 26:** deploy/rollback evaluator, prompt/rubric/checkpoint/timing versions independently; keep compatible jobs during rollback.
- **Stages 27–28:** validate/consolidate original-versus-revision identity, Pending neutrality, independent Written evidence and provider/runtime absence from Corpus.

Earlier contracts preserved: Stage 05 storage/retention/delete; Stage 06 identity/validity; Stage 08 loop/Pending; Stage 09 immutable content/rubric; Stage 11 Written-only deterministic Readiness; Stage 12 jobs/idempotency; Stage 13 shared shell/state; Stage 14 capability/accessibility.

### 12.2 Dependencies introduced or removed

Introduced semantic contracts: WritingPromptRevision, checkpoint policy manifest, frozen WritingResponse kinds, evaluator contract/candidate/acceptance/correction, minimum-payload manifest and loss-bound release evidence. No new managed service is introduced. Live Corpus, online-only editing, per-keystroke AI, multi-model voting and provider-specific domain types are explicitly removed as dependencies.

### 12.3 Risks, assumptions, and validation evidence

| Risk / assumption | Required evidence / response |
|---|---|
| IndexedDB/browser eviction defeats the loss target | Real crash/reload/quota/private-context matrix; admit server-backed path or block only high-stakes Writing |
| Mobile lifecycle prevents exact offline cutoff | Real iOS/Android background/sleep tests; preserve draft and downgrade timing when unprovable |
| Semantic point evaluator over/under-credits paraphrase | Rights-safe human-reviewed point coverage/B-C benchmark; slice-level promotion and correction |
| Evidence spans break on Unicode edits | Contract-versioned normalization/offset round trip and quote digest tests |
| Learner planning checks are mistaken for score | Label “your checklist”; post-submit evaluator status visually/semantically separate |
| One call cannot support all dimensions reliably | Benchmark first; narrow supported scope or use one escalation, never add silent chains |
| Provider retains learner text unexpectedly | Stage 19/23 contractual/technical verification; W0/no-provider fallback |
| Conflict UX causes accidental loss | Branch-preservation and keyboard/AT usability tests; export both before destructive resolution |
| Correction destabilizes learner trust | Preserve original view/history, reason/scope/version and deterministic targeted recomputation |

No owner decision blocks this stage.

### 12.4 Intentionally deferred implementation choices

| Choice | Future owner | Constraint |
|---|---|---|
| Editor component/library and serialization details | Implementation / Stage 25 validation | semantic multiline behavior, shared shell, no response-history loss |
| Exact local debounce/server coalescing values | Stages 21/24/25 | versioned and must meet measured approximately-five-second target |
| Encryption/key implementation for local drafts | Stages 20/23 | no false at-rest guarantee; deletion/recovery must still work |
| Timer anchoring/reconstruction algorithm | Stage 21 | no freeze/reset/guessed extension; frozen cutoff semantics fixed |
| Evaluator provider/model, region, price and retention settings | Stage 19/23 | benchmarked, provider-neutral, minimum payload, exit |
| Benchmark size and numeric promotion budgets | Stages 19/24/25 | required boundary/slice coverage; product Stage 12 starting gates preserved |
| Notification when result arrives | Stage 22 | optional, no text/result payload or core dependency |
| Exact legal retention/processor/accommodation wording | Stage 23/legal review | no compliance claim |
| Operational alert thresholds | Stage 24 | versioned provenance/effective date/rollback; not learner scores |

## 13. Decisions made

1. Immutable prompt/rubric revisions express scenario, register and semantic content points.
2. Draft, original, revision, fresh transfer, candidate, accepted result and correction have separate identities.
3. Dual local/server idempotent checkpoints preserve work; high-stakes Writing requires proven durability.
4. Finalization freezes the measured response; 30 minutes cannot reset or expand, and post-time work is a revision.
5. Deterministic prechecks precede one provider-neutral structured evaluation.
6. One consequential escalation is the ceiling; unresolved uncertainty remains Pending/cannot-judge or uses a fresh sample.
7. Same-prompt revisions are learning evidence, never independent readiness anchors.
8. Retention/export/delete and minimum provider payload are explicit and auditable.
9. Accessible save/Pending/fault states are part of the shared shell, with no modal autosave or announced ticks.
10. Versions, benchmark, operations, fallback, cost and provider exit are explicit; provider selection remains Stage 19.

## 14. Open questions

There are no owner-blocked questions. All consequential Stage 17 behavior is decided. Only the bounded implementation/procurement/calibration details in §12.4 remain with named owners and fixed constraints.

## 15. Definition-of-done check

- [x] Every required input was read at current GitHub main; commits/blobs and prerequisite continuity are recorded.
- [x] Source authority and Stage 27 precedence were applied; design timing/checklist interpretations are explicit.
- [x] Prompt/scenario/register/content-point/rubric and all required Writing/evaluation identities are defined.
- [x] Editor, autosave, local/server recovery, offline, conflicts, measured loss, timer and finalization are complete.
- [x] Deterministic prechecks, one structured evaluation, one escalation, disagreement, Pending and correction are complete.
- [x] Original/revision/fresh-transfer evidence separation is explicit.
- [x] Retention/export/delete, minimum payload, privacy/rights/security and correction audit are complete.
- [x] Required pseudotypes, state diagram, sequence, timing/conflict matrix, retention flow and Pending UI contract are present.
- [x] Accessibility, failure, operations, cost, provider fallback/exit, validation and downstream handoff are explicit.
- [x] One consequential ADR is accepted; no feature implementer must invent a product rule.
