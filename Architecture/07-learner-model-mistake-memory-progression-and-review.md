# Bestehen / App — Learner Model, Mistake Memory, Progression, and Review

## 1. Purpose and scope

This stage defines the App-owned, deterministic architecture that turns accepted evidence facts into explainable learner capability, Mistake Memory, local progression profiles, and due review obligations. It fixes ownership, contracts, state transitions, empirical defaults, recalculation, failure behavior, privacy/accessibility boundaries, operations, and downstream obligations. It does not implement application code, choose a new provider, calculate Readiness, or change product/design sources.

The governing separation is:

- immutable attempt, observation, validity, correction, and version facts remain authoritative under Stages 05–06;
- capability, confidence, freshness, stability, condition facets, coverage, mistake state, progression profile, and review schedule are rebuildable projections;
- Readiness owns the independent Written and Oral component estimates, Safe rules, and Ready-to-Book gate; this stage emits only traceable claim-level contribution inputs;
- Corpus supplies versioned nodes, relationships, task mappings, relevance, rights, and approved content. Corpus never receives learner history and its frequency/relevance never becomes mastery or weakness;
- a non-learner fault has zero negative learner effect. Missing stays absent. Time changes currentness and priority, never historical truth or repair status.

## 2. Inputs, authority, and continuity

### 2.1 Repository references read on 2026-08-23

| Repository / path | Blob SHA |
|---|---|
| Bestehen-App main before Stage 07 | 48be4e898638ad0e23de2065dd76cebc94ac1f80 |
| Bestehen-Shaping main | 9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc |
| prompts/architecture/07_define_learner_model_mistake_memory_progression_and_review.txt | 46c9b128de41385038ba50d7dd6433fe18936301 |
| Architecture/00-architecture-shaping-plan.md | b263c5e7b3bccc0450ddd17aa0cc007432d672b7 |
| Bestehen_App_Architecture_Checklist.md | 0313cb4b0dd24c88a799f02424edef0a8d04c1bc |
| app/28-bestehen-app-product-specification.md | 18ae80cc2fd63cecd76c297c3e56d44a68367856 |
| app/04-learner-model.md | f7ae1f4af375ee3302d04c726d8fe8453a9daf80 |
| app/05-mistake-memory.md | a7c574b08c33418eab44aba8b6e9b7f8ab877109 |
| app/06-daily-coaching-engine.md | 3cd869cd337dd3a878c27f35e1e8b5dad0c4c7bb |
| app/08-a1-to-b1-progression.md | 839a01c010cf79777520714d0ab09304a2ba9a06 |
| app/14-review-and-spaced-repetition.md | fa9b65e92cd1511e00e106a199eb6fbc06273a69 |
| app/20-progress-and-motivation.md | fd8d002dbb79fd66dca3fdfa8f6771318f76cbe4 |
| app/24-analytics-and-success-metrics.md | 28d1a5380a7ea9f28efdc95ce0c96987920917e1 |
| Design/DESIGN-HANDOFF.md | 417a6820037e045e2dd9f29afc42b9f2e94fd638 |
| Design/Bestehen-01-Design-System.dc.html | d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a |
| Design/Bestehen-02-Mobile-Screens.dc.html | 0a9f2d3ea982c3197f399941b57defd9869d2428 |
| Architecture/04-domain-model-and-bounded-contexts.md | ab1a775d7689e47bba00c2544c247ef344c44e70 |
| Architecture/05-data-ownership-persistence-and-schema-evolution.md | bb6df811ec9010de556d1719f22e31bb8ca3190e |
| Architecture/06-evidence-ledger-validity-versioning-and-audit.md | 53d34ae65ef4c8fa79c00026f9bd5d7b876ce672 |
| Architecture/adr/README.md before Stage 07 | d4cca0cf5426f5e10c694909f11a57f5f713b430 |

The exact Stage 07 output and ADR-0014 were absent before this work. The required Stages 04–06 were present and complete.

### 2.2 Authority and reconciliation

The final product specification remains first authority; detailed shaping files retain delegated detail. Stage 27 precedence is applied lexicographically: validity/fairness, direct evidence, independent Written/Oral risk, uncertainty resolution, due repair/retention, progression/coverage, then preference. The design is consistent with that truth: P0–P4 are conditions and never badges; weakness/review surfaces distinguish repaired today from retained later; overdue is not a deck/debt count.

One terminology difference is reconciled without changing either source: the Design handoff shows the common visible path through Repaired and mentions 7/21-day obligations, while product shaping also requires Historical/Unconfirmed, Resolved, Reopened, same-session, 1–3-day, and ~60-day paths. The domain state includes the complete product lifecycle; the UI may disclose only the relevant path and next obligation. British “stabilising” design copy maps to canonical API state stabilizing. No product/design contradiction requires amendment.

No new mutable framework, browser API, codec, commercial service, price, quota, or support-lifetime choice is made here. Existing PostgreSQL/pg-boss/Render/R2 decisions are inherited from Stages 03–06, so no additional vendor research is needed for this stage.

## 3. Decision registry

| ID | Decision | Default | Main trace | ADR |
|---|---|---|---|---|
| ARCH-S07-D01 | Projection boundary and ownership | One evidence source cut feeds separately owned, immutable-generation projections | Product §§5, 9; Architecture 04 §§4, 6–8; 05 §§5–9; 06 §§4–10 | ADR-0014 |
| ARCH-S07-D02 | Capability projection vector | Claim-scoped normalized performance plus explicit mastery, confidence, freshness, stability, assistance, timing, lane, coverage, and readiness-contribution state | Product §5.1; app/04 §§3.3–4.19; Design §3 | ADR-0014 |
| ARCH-S07-D03 | Mistake lifecycle | Append-audited Candidate/Historical-Unconfirmed/Known/Repairing/Stabilizing/Repaired/Resolved/Reopened projection with shaped gates | Product §5.2; app/05 §§4.5–4.12; Design §3.5 | ADR-0014 |
| ARCH-S07-D04 | Recurrence and cross-lane influence | Independent opportunity-aware recurrence; negative evidence never crosses lanes; related lanes receive verification targets, with narrow positive support only | app/04 §§4.10, 4.18; app/05 §§4.6, 4.13 | ADR-0014 |
| ARCH-S07-D05 | Local progression | One P0–P4 profile per task-family/direct-lane with axis vector and one-axis probe/adopt/confirm/recover flow | Product §7; app/08 §§3–10; Design §3.4 | ADR-0014 |
| ARCH-S07-D06 | Review obligation scheduler | Capability obligations, deterministic windows, natural satisfaction, capped selection, no debt economy | Product §9; app/14 §§3–14; Design weakness/review/return surfaces | ADR-0014 |
| ARCH-S07-D07 | Versioned empirical defaults and rebuild | Immutable parameter bundles plus calculation version; targeted shadow recomputation and atomic generation publication | app/04 §§4.14–4.17; Architecture 05 §§7–9; 06 §§8–10 | ADR-0014 |
| ARCH-S07-D08 | API and failure contract | Exhaustive discriminated availability/status/reason states; last-good generation with explicit stale/recomputing status; dependent conclusions only block | Product §19; Architecture 06 §§6, 11–13 | ADR-0014 |
| ARCH-S07-D09 | Privacy, rights, accessibility, and cost | Learner history stays in App; equivalent access preserves claim, changed capability is explicit; deterministic PostgreSQL/pg-boss default and no model call for projection/scheduling | Product §§15–18; app/24 §§8–10; Architecture 05 §§10–12 | ADR-0014 |
| ARCH-S07-D10 | Operational validation and handoff | Deterministic checksums, golden/property/metamorphic tests, calibrated shadow comparison, explicit downstream contracts | app/24 §§4–8; Architecture 01 quality gates; prompt §14 | ADR-0014 |

## 4. Projection ownership and module boundaries

### 4.1 Projection ownership table

| State / contract | Authoritative owner | Persisted truth or projection | Writes / consumes | Must not do |
|---|---|---|---|---|
| Attempt, response, condition, session, episode occurrence | Session & Attempt | Immutable fact | Writes occurrence; Evidence consumes | Infer capability or validity |
| Accepted observation, direct lane, valid affected scope, content/evaluator lineage | Evidence & Capability | Immutable accepted fact plus append validity/correction assertions | Writes accepted observations; all learner projections consume | Rewrite attempt facts or accept provider claims blindly |
| CapabilityProjection and ConditionFacet | Evidence & Capability | Rebuildable immutable generation | Consumes accepted facts; publishes claim vector | Calculate overall Readiness or mutate facts |
| CoverageProjection and ReadinessContribution | Evidence & Capability | Rebuildable claim input | Readiness/Coaching consume | Merge Written and Oral or expose pass probability |
| WeaknessPattern and WeaknessTransition | Mistake Memory | Rebuildable current generation plus append transition explanation | Consumes evidence/corrections; Review/Coaching consume | Create direct failure in an unobserved lane |
| ProgressionProfile and ProbeTransition | Progression | Rebuildable current generation plus adopted-profile history | Consumes capability, conditions, walls; Coaching consumes | Treat P0–P4 as global course level or permission gate |
| ReviewObligation and ScheduleTransition | Review & Retention | Rebuildable current generation plus schedule explanations | Consumes evidence/weakness/progression/content availability; Coaching consumes | Count deck debt or mark repair by elapsed time |
| Written/Oral Readiness and Ready-to-Book | Readiness & Booking | Separate later-stage projections | Consumes contribution contracts and mock facts | Receive mutable learner truth or infer missing as zero |
| Plan recommendation | Coaching | Rebuildable recommendation | Consumes all above using Stage 27 precedence | Change truth because of urgency/preference |
| Node graph, mappings, relevance, publication eligibility, rights | App Content Access from Corpus bundles | Immutable versioned imported metadata | Projections consume by exact version | Send learner state to Corpus or treat frequency as mastery |
| Export/delete/sync scope | Account & Portability | Commands, journals, and projections | Deletes/exports all learner-owned state coherently | Leave orphan projections or raw media |

A module writes only its state. Cross-module updates use identifiers and generation/version contracts; no projection writes backward into evidence.

### 4.2 Data flow

~~~mermaid
flowchart LR
    A[Session and Attempt facts] --> E[Evidence acceptance and validity]
    C[Approved content and taxonomy versions] --> E
    E --> CP[Capability and condition projections]
    E --> MM[Mistake Memory]
    CP --> MM
    CP --> PP[Local P0-P4 progression]
    MM --> RO[Review obligations]
    CP --> RO
    PP --> RO
    C --> RO
    CP --> RC[Readiness contribution contract]
    RC --> R[Later Readiness owner]
    CP --> CO[Coaching]
    MM --> CO
    PP --> CO
    RO --> CO
    R --> CO
    X[Correction/quarantine/version impact] --> E
    X --> J[Targeted rebuild jobs]
    J --> CP
    J --> MM
    J --> PP
    J --> RO
    J --> RC
~~~

## 5. State, data, API, and version contracts

The following are explanatory architecture pseudotypes, not production code.

### 5.1 Keys and source cut

~~~text
ClaimKey =
  learner_id
  + target_exam_definition_id
  + capability_node_id
  + taxonomy_version
  + task_family_id
  + direct_lane

DirectLane =
  reading | language_elements_controlled | listening
  | writing_production | speaking_production | speaking_interaction

ProjectionSourceCut =
  learner_id
  + accepted_evidence_ledger_sequence
  + validity_assertion_sequence
  + correction_impact_sequence
  + content_bundle_version
  + taxonomy_version
  + blueprint_version
  + rubric_version_set
  + evaluator_version_set
  + calculation_version
  + parameter_bundle_id
  + parameter_bundle_version
  + parameter_effective_at
~~~

ClaimKey is deliberately fine enough to protect directness but does not materialize every assistance/timing combination as a new capability node. ConditionFacet rows aggregate explicit comparable slices beneath the same claim. One evidence observation may affect several primary claims, but its independence unit is capped once per section/component rollup.

### 5.2 Capability projection

~~~text
CapabilityProjection =
  claim_key
  + normalized_performance_estimate?       # outcome estimate, never pass probability
  + performance_range?
  + mastery_band                           # unknown | not_yet_demonstrated | emerging
                                           # | functional | reliable | target_evidenced
  + confidence_band                        # none | low | medium | high
  + confidence_limit_reason[]
  + freshness_band                         # fresh | aging | stale | historical_only
  + stability_band                         # unproven | recent | stable
  + trend                                  # insufficient | improving | stable | contradictory
  + assistance_dependence                  # unknown | independent
                                           # | light_support_responsive | support_dependent
  + timing_status                          # not_measured | within_target
                                           # | inconsistent | over_target_or_incomplete
  + working_profile_id
  + highest_recent_demonstrated_profile_id
  + direct_occasion_count
  + effective_evidence_units
  + distinct_content_family_count
  + distinct_task_form_count
  + distinct_session_day_count
  + coverage                               # tested and missing blueprint/task/rubric slices
  + latest_observation_at?
  + projection_status
  + source_cut
  + explanation_reason_codes[]
~~~

Unknown means no valid direct evidence. It is never internally replaced by zero or a neutral prior. A normalized estimate is present only after direct accepted evidence exists. Learner-facing views normally show the band, condition, confidence/freshness, evidence gap, and next action, not the decimal.

### 5.3 Condition facets

| Facet | Required partitions | Rule |
|---|---|---|
| Direct lane | All DirectLane values | Only observed lane receives direct positive/negative capability effect |
| Assistance | none; access/non-answer-bearing; language; strategy; answer-narrowing; model/solution exposed | Offered-but-unused and post-response help do not weaken original evidence |
| Timing | open; practice-timed; exam-timed | Untimed success cannot establish timed reliability |
| Listening | speed condition, target-rule play count, extra plays, transcript exposure | Transcript/excess replay cannot establish independent Listening |
| Productive independence | spontaneous; controlled; phrase/frame supported; model exposed | Productive claim needs productive evidence; interaction needs partner-turn evidence |
| Occasion | first attempt; immediate retry; delayed transfer; retention; exposed; diagnostic; practice; mock | Same repair episode is not independent retention |
| Difficulty/profile | P0–P4 plus exact axis vector | Success is interpreted at served conditions, never silently promoted |
| Accessibility | adaptation/equivalence assertion and tested capability | Equivalent access is not a penalty; changed test claim is explicit |
| Evaluation | supported dimensions, confidence, rubric/evaluator version | Unsupported dimensions remain absent |
| Validity | valid; partially_valid; pending; interrupted; not_counted with affected scope | Non-valid affected scope has zero learner effect |

### 5.4 Readiness contribution without duplicate Readiness

~~~text
ReadinessContribution =
  claim_key
  + component                              # written | oral
  + section
  + state                                  # absent | pending | ineligible | limited | eligible
  + normalized_performance_estimate?
  + performance_range?
  + directness
  + target_condition_coverage
  + confidence_band
  + freshness_band
  + coverage_gaps[]
  + bottleneck_candidate_reason_codes[]
  + limitation_reason_codes[]
  + source_observation_ids[]
  + source_cut
~~~

This contract never contains overall readiness, Safe, Ready to Book, a Written/Oral merge, or pass probability. The later Readiness owner applies the official independent component gates, Safe margin/breadth/currentness rules, mock rules, and weaker-component bottleneck. State absent has no numeric field; pending blocks only the dependent section/component.

### 5.5 Projection availability contract

Every client query returns exactly one state:

| State | Meaning | Client behavior |
|---|---|---|
| current | Published generation matches the required source cut | Show projection and explanation |
| recomputing | A newer source cut is rebuilding; last-good generation is safe to show | Show last-good with “updating” reason and timestamp; no spinner-only screen |
| stale | Last-good generation is older than allowed for this decision | Show history and smallest recheck/recompute path; high-stakes consumer must not treat it as current |
| blocked_by_pending | Specific accepted evidence/evaluator result is unresolved and no safe dependent claim exists | Name only affected conclusion; continue unrelated coaching |
| unavailable | No direct evidence or compatible content/version exists | Show absence/product gap, never zero or learner failure |
| failed | Rebuild failed validation | Retain last-good if safe, emit local failure, retry idempotently; high-stakes dependent change is withheld |
| deleted | Learner deletion has removed the projection | Do not reconstruct without new authorized learner facts |

Unknown enum/version/reason code fails closed at the affected scope and is observable. Consumer clients never invent fallback numbers.

## 6. Deterministic capability projection

### 6.1 Calculation pipeline

ARCH-S07-D02 uses a full-rebuild-equivalent algorithm:

1. Select accepted evidence at a single ProjectionSourceCut.
2. Apply validity affected scope. Exclude not_counted, unresolved pending dimensions, unsupported evaluator dimensions, repeated/exposed claims, and incompatible target mappings.
3. Map evidence only to defensible primary ClaimKeys. Secondary/prerequisite mappings carry reduced positive support only when product rules allow it; they never carry negative mastery.
4. Group attempts into repair episode, independent occasion, content family, and mock occasion using Stage 06 identities. Deduplicate retries and provider redelivery semantically.
5. Normalize outcome inside its task/rubric and served difficulty. Raw percentages across unlike tasks are never compared directly.
6. Produce comparable ConditionFacet contributions. Assistance, timing, playback, directness, difficulty, and accessibility are conditions, not one global discount.
7. Aggregate using the versioned parameter bundle. Cap contribution per independent occasion/content family and once per component rollup.
8. Apply structural gates for mastery, confidence, freshness, stability, assistance dependence, timing, coverage, and target-evidenced status.
9. If one contradictory result meets a stable history, mark contradictory and request a fresh clarifier; do not erase history or move more than one learner-facing band from that single occasion.
10. Emit explanations from stored reason codes and exact source observations. Never call a model merely to recalculate.

The normalized performance estimate is a deterministic weighted outcome summary, not a forecast that the learner will pass. It is never serialized under a probability-like name.

### 6.2 Versioned launch parameter bundle

| Parameter | Launch default | Structural guardrail |
|---|---|---|
| Evidence strength | E0 0; E1 0.25; E2 0.5; E3 1.0; E4 1.5 | E0 never contributes; conditions remain explicit |
| Freshness bands | Fresh 0–30 days; Aging 31–60; Stale 61–120; Historical-only >120 | Time never changes historical outcome or repairs a weakness |
| Confidence Low | One usable episode, <2 effective units, heavy assistance, narrow coverage, or weak evaluation | Claim-specific |
| Confidence Medium | ≥2 effective units across ≥2 independent tasks/episodes, includes unassisted signal, no major unresolved contradiction | Volume cannot substitute for directness |
| Confidence High | ≥5 effective units across ≥3 occasions/fresh variants, recent strong direct evidence at claim condition, adequate coverage | Productive/interaction requires multiple days/prompts |
| Stability Stable | Successful fresh tasks across ≥3 occasions spanning ≥14 days, including unassisted use | Immediate retry cannot satisfy |
| Progression probe objective | ≥3 fresh opportunities across ≥2 sessions and ~70% success, or two successful clusters | Initial routing default, not Readiness threshold |
| Progression probe productive | ≥2 fresh direct samples across ≥2 occasions at current standard | Direct lane only |
| Known weakness window | Two independent failures across two sessions/days within 60 days; ≥3 opportunities; failure ≥40% of last five or 2 of last 3; medium+ cause confidence | One response/retry chain is one episode |
| Review windows | R0 same session; R1 1–3d; R2 6–9d; R3 18–28d; R4 45–75d | Valid relevant-lane evidence only |

All mutable numbers are data in an immutable ParameterBundle with provenance, rationale, effective date, validation evidence, status (draft/shadow/active/rolled_back), and predecessor. Stable product rules—five validity states, direct modality, independent Written/Oral, same-session not retention, local P0–P4, no review debt, no probability—are code/contract invariants, not tunable parameters.

A new parameter bundle is evaluated in shadow against the same source cuts, compared by cohort and claim type, approved, then activated prospectively. Historical views retain the version originally published. Current projections rebuild under the active version with an explicit explanation. Rollback reactivates the last accepted bundle and rebuilds; it never edits facts.

### 6.3 Band rules

- Unknown: no accepted direct evidence for the ClaimKey.
- Not yet demonstrated: valid direct opportunities exist, but functional use at the served reachable profile has not been demonstrated.
- Emerging: success is inconsistent/narrow or depends on substantial help.
- Functional: current-profile performance is normally successful with the exact condition named; promotion-probe evidence may be eligible.
- Reliable: repeated fresh evidence across occasions with medium+ confidence, majority clean for the claimed condition, and no unresolved contradiction.
- Target-evidenced: Reliable gates plus recent direct evidence under the relevant P4/target condition and compatible blueprint. It is a fine claim, not section readiness.

The internal estimate informs the lower three evidenced bands through the parameter bundle; Reliable and Target-evidenced always require structural breadth/condition gates, so a high mean from one item cannot create them.

### 6.4 Assistance, timing, freshness, and stability

Assistance dependence compares genuinely comparable task/difficulty evidence. A help request alone does not label dependence. Offered-but-unused support stays none. Access support stays non-penalizing unless it changes the tested capability, in which case a separate condition facet is used.

Timing is orthogonal: valid untimed language evidence updates language at open timing; timed incompletion may update timing/strategy and only updates language when attribution supports it. Freshness is calculated from the latest relevant accepted evidence at the claim condition. Stable history stays visible when current evidence becomes stale.

## 7. Mistake Memory lifecycle and recurrence

### 7.1 Canonical state machine

~~~mermaid
stateDiagram-v2
    [*] --> Candidate: valid coachable shortfall
    Candidate --> Known: all promotion gates met
    Candidate --> HistoricalUnconfirmed: 2 clean comparable opportunities or stale without confirmation
    HistoricalUnconfirmed --> Candidate: new medium+ supported recurrence
    Known --> Repairing: targeted repair begins
    Repairing --> Stabilizing: successful delayed fresh transfer
    Repairing --> Known: repair or delayed check fails
    Stabilizing --> Repaired: repair criteria met
    Stabilizing --> Known: supported recurrence
    Repaired --> Resolved: later clean retention
    Repaired --> Reopened: medium/high-confidence recurrence
    Resolved --> Reopened: medium/high-confidence recurrence
    Reopened --> Known: transition accepted and priority recalculated
    Reopened --> HistoricalUnconfirmed: new event invalidated or attribution corrected
~~~

Reopened is explicit in the API/history so the learner can see that earlier progress still counts. It deterministically enters Known for the next coaching decision unless a correction invalidates the recurrence. Resolved means no current dedicated repair, never deletion or impossibility of recurrence.

### 7.2 Promotion, repair, resolution, and reopening

| Transition | Deterministic requirement | Failure/uncertainty behavior |
|---|---|---|
| Candidate → Known | Same defensible pattern; ≥2 independent failure episodes on fresh tasks across two sessions/days within 60d; ≥3 relevant opportunities; ≥40% last five or 2/3; medium+ cause confidence; direct claimed lane; valid/access-fair conditions | Broad blocker/candidate only if cause or lane unresolved |
| Candidate → Historical/Unconfirmed | Two fresh comparable clean opportunities on different occasions with no recurrence, or >60d without a relevant opportunity | Silence is not repaired |
| Known → Repairing | A targeted repair starts or is assigned | Skipping records no learner-negative fact; obligation remains |
| Repairing → Stabilizing | One successful delayed fresh transfer, normally R1, no answer-bearing support | Immediate retry remains responsiveness only |
| Stabilizing → Repaired | ≥3 fresh successes across ≥3 occasions spanning ≥14d; majority unassisted; no recurrence after repair; direct original lane and reachable difficulty | Productive/interaction must be direct; high/pass-critical adds recent target-condition success |
| Repaired → Resolved | Later R4/natural retention succeeds, normally 30–60d, without recurrence | Time alone never transitions |
| Repaired/Resolved → Reopened | One new independent medium/high-confidence supported recurrence | Low-confidence/invalid anomaly creates clarifier, not reopening |
| Any → corrected prior state | Append correction changes attribution/validity/affected scope | Preserve original transition history and recompute current state |

### 7.3 Opportunity and recurrence model

An opportunity counts only if the capability/pattern was genuinely required or directly tested. Skipped, invalid, inaccessible, speculative secondary tags, same-item repeats after exposure, and provider redelivery do not count. Assisted and unassisted denominators remain separate.

One repair-chain episode includes original failure, explanation, controlled practice, and immediate retry. Several same-root surface errors within one Writing response can raise within-episode severity/cause confidence but remain one episode. A new independent episode requires fresh content/prompt, no answer exposure, a valid comparable opportunity, and normally a different session/day.

Mistake Memory retains lifetime recurrence and a 60-day recent window:

- Isolated: one independent episode.
- Repeated: two independent episodes.
- Recurring: at least three independent episodes across at least two sessions/days.
- Persistent under target conditions: recurring in recent unassisted/timed B1-relevant evidence.

Failure influence may soften after 30 days only with successful/neutral relevant evidence. At 61–120 days without opportunity the current state is stale/unverified; over 120 days it is historical-only. Neither is repaired.

### 7.4 Cause and priority

A pattern holds one primary and at most one contributing cause, each unresolved/low/medium/high with evaluator/probe provenance. Low/unresolved can route a clarifier but cannot promote a fine weakness. Cause correction appends an attribution assertion and targeted rebuild.

Priority is a separate projection: Observe, Monitor, Active, High, Pass-critical. Newly Known normally starts Active. Exam date may raise scheduling urgency one band but cannot confirm a weakness. Pass-critical requires later direct Written/Oral risk evidence, never frequency alone. Unresolved high-impact evidence stays Observe/diagnosis priority.

## 8. Cross-lane influence matrix

Legend: D = direct positive/negative evidence for supported dimension; S+ = reduced positive supporting evidence only; V = create/rank a verification target or hypothesis, no mastery change; — = no transfer. Every relationship requires a compatible versioned node mapping; Corpus relevance affects V priority only.

| Observed valid lane ↓ / receiving claim → | Reading | Language Elements controlled | Listening | Writing production | Speaking production | Speaking interaction |
|---|---:|---:|---:|---:|---:|---:|
| Reading | D | V | V | V | V | V |
| Language Elements controlled | V | D | V | V | V | V |
| Listening | V | V | D | V | V | V |
| Writing production | V | S+ for the exact produced concept | — | D | V | V |
| Speaking production | V | S+ for the exact produced concept | — | V | D | V |
| Speaking interaction | V | S+ only when evaluator supports exact concept | — | V | D only for supported production dimensions | D |

Rules:

- Negative evidence never crosses lanes.
- Writing never initializes Speaking; Reading never initializes Listening.
- Productive success may support availability of the exact underlying concept, but cannot prove broad recognition/forms or another modality.
- A monologue cannot repair interaction; a transcript/cloze cannot repair Listening; recognition cannot repair productive weakness.
- Cross-modal Known or repair claims require direct supported evidence in every named lane.
- Success in one lane may lower diagnostic uncertainty or satisfy only an obligation whose ClaimKey/condition it directly matches.

## 9. Local P0–P4 progression profiles

### 9.1 Progression profile model

~~~text
ProgressionProfile =
  learner_id + task_family_id + direct_lane + target_exam_definition_id
  + rung                                  # P0 | P1 | P2 | P3 | P4
  + adoption_state                        # confirmed | probe_eligible | probing
                                          # | provisional | recovering
  + axis_vector
  + last_confirmed_axis_vector
  + probe_axis?
  + probe_source_observation_id?
  + current_wall_reason?
  + confidence
  + source_cut

AxisVector =
  linguistic_load + reasoning_load + length_breadth + assistance
  + timing + playback_reference + production_independence
  + realism_sequence + evaluation_standard
~~~

| Rung | Default condition | Claim |
|---|---|---|
| P0 Supported Foundation | Exam-shaped microtask, accessible language, substantial explicit support, open timing | Possible with support at reachable difficulty |
| P1 Guided A2 | Genuine A2 language/mechanism, selective support, soft timing/bounded replay | Functional A2 and emerging independence |
| P2 A2/B1 Bridge | B1 mechanism with controlled language/longer input, limited on-request support | Transfer toward B1-shaped work |
| P3 Independent B1 | Genuine B1 task, no default answer-bearing help, explicit target probes | Current B1 capability at named conditions |
| P4 Target Conditions | Exact compatible blueprint/format/difficulty/timing/playback/reference, no coaching inside attempt | Strong target-condition claim input |

The rung and exact axes are not learner levels, badges, or averages. UI exposes plain conditions such as “with help · open timing” or “on your own · exam conditions.” P4 is always a selectable measurement condition when useful, not an unlock.

### 9.2 One-axis probe state machine

~~~mermaid
stateDiagram-v2
    [*] --> Confirmed
    Confirmed --> ProbeEligible: shaped evidence gates met
    ProbeEligible --> Probing: one primary axis selected
    Probing --> Provisional: fresh valid success
    Probing --> Recovering: wall or invalid reachability
    Provisional --> Confirmed: later fresh success at new condition
    Provisional --> Recovering: later comparable failure
    Recovering --> Confirmed: restore smallest prior axis and repair
    Confirmed --> Recovering: repeated comparable failure on 2 occasions
    Recovering --> ProbeEligible: fresh reachable stability returns
~~~

Objective probe eligibility defaults to three fresh opportunities across two sessions with about 70% success or two coherent successful clusters, current Functional/medium confidence, one no-answer-narrowing success, no unresolved fault, reachable fresh content, and no higher-value repair. Productive/interaction uses two fresh direct samples across two occasions. A successful probe changes one axis provisionally; a second fresh occasion confirms it.

One contradictory result keeps the confirmed profile and requests a clarifier. Failure of a provisional profile restores the changed axis. Repeated comparable failure across at least two occasions regresses only that axis/task family one step. Long absence, low-energy support choice, or technical failure never regresses capability. Historical highest demonstrated profile remains.

## 10. Review obligation and deterministic scheduling

### 10.1 Obligation contract

~~~text
ReviewObligation =
  obligation_id
  + learner_id
  + claim_key_or_weakness_pattern_id
  + entry_class                           # repair_retention | weakness_monitoring
                                          # | high_value_learned_pattern | freshness_maintenance
  + required_lane
  + minimum_condition
  + review_stage                          # R0 | R1 | R2 | R3 | R4
  + status                                # scheduled | window_open | overdue
                                          # | pending_evaluation | blocked_content
                                          # | repair_required | satisfied | completed
  + window_start + target_at + window_end
  + last_qualifying_observation_id?
  + preferred_task_forms[]
  + priority_reason_codes[]
  + source_cut
~~~

The unit is the smallest claim that needs a future fresh opportunity, not an item/card. The exact original content is excluded from delayed transfer unless recognition of that item is itself the claim.

### 10.2 Scheduling state machine

~~~mermaid
stateDiagram-v2
    [*] --> Scheduled: defensible obligation created
    Scheduled --> WindowOpen: window starts
    WindowOpen --> Satisfied: valid matching or stronger natural evidence
    WindowOpen --> Overdue: window ends without evidence
    WindowOpen --> PendingEvaluation: productive result awaits trusted evaluator
    PendingEvaluation --> Satisfied: accepted valid success
    PendingEvaluation --> WindowOpen: invalid/unsupported/pending resolved without conclusion
    WindowOpen --> BlockedContent: no fresh valid content
    BlockedContent --> WindowOpen: compatible fresh content/natural opportunity appears
    WindowOpen --> RepairRequired: valid failure
    Overdue --> Satisfied: valid natural or explicit check
    Overdue --> RepairRequired: valid failure
    RepairRequired --> Scheduled: repair plus fresh retry schedules R1
    Satisfied --> Scheduled: next meaningful R stage remains
    Satisfied --> Completed: lifecycle criteria need no active obligation
~~~

R0 is same-session fresh retry and measures responsiveness. R1 is 1–3 days, R2 6–9, R3 18–28, and R4 45–75. Window anchors use the accepted evidence occurred-at instant plus learner-zone calendar semantics; Stage 22 finalizes time-zone transport and notification behavior without changing evidence truth.

A valid stronger-condition success may skip a redundant weaker micro-check and advance to the next meaningful stage. Assisted success advances only the assisted claim. Model exposure/repetition, invalid media, same-item exposure, wrong lane, or unsupported evaluator dimension never advances.

One valid delayed failure creates an independent episode when Stage 06 independence gates hold, returns the weakness to Diagnose/Repair, and schedules R1 after repair. Two consecutive delayed failures require repair-quality review or prerequisite/axis correction, never an identical tighter loop. A session normally permits one meaningful check and, when needed, one repair plus fresh retry for a pattern.

### 10.3 Natural satisfaction and capping

Natural practice or a mock satisfies an obligation when it is fresh, direct to the ClaimKey, meets at least the minimum condition, is not answer-exposed, and has trustworthy evaluation. One observation may satisfy several exact obligations, but still counts once as an independence occasion and once in section rollup.

Review selection uses Stage 27 precedence, then deterministic reason codes:

1. valid/fair and direct eligible evidence only;
2. independent Written/Oral pass risk;
3. unresolved high-impact clarifier;
4. window ending / due repair or retention;
5. reachability and exam relevance;
6. coverage/progression;
7. learner preference;
8. stable tiebreaker: target_at, then obligation_id.

Session caps preserve the shaped experience:

| Session | Explicit review cap |
|---|---|
| 5–9 minute micro | One highest-value check or one repair/retry loop |
| 10 minute Quick | Normally one–two obligations |
| 25 minute Standard | Normally one–three checks and at most four minutes unless review becomes the dominant repair |
| 45 minute Extended | Normally three–eight minutes; prefer natural embedding |
| P4/mock measured block | No review interruption; reconcile qualifying evidence afterward |

No inactivity job creates daily misses, negative events, deck count, streak loss, or debt. On return, query current obligations, collapse duplicates by canonical claim/pattern, choose a small representative set by precedence, and leave lower-value historical items for natural opportunities. The UI may show days/window for a selected obligation, never accumulated overdue count.

## 11. Recalculation, invalidation, compatibility, and audit

### 11.1 Triggers and affected scope

| Trigger | Scope selector | Required consequence |
|---|---|---|
| New accepted/corrected evidence | learner + observation affected claims | Incremental rebuild of capability, weakness, progression, review, contribution |
| Validity change/technical fault | exact observation/dimension/affected scope | Remove only invalid effect; preserve unaffected work |
| Evaluator correction/version defect | evaluator version + supported dimensions + observations | Reattribute/rebuild exact productive claims; pending blocks dependent conclusions |
| Content quarantine/takedown | content revision/family/form + impact assertion | Remove invalid target/learner effect as asserted; preserve defensible historical capability; delete restricted bytes/text per rights policy |
| Taxonomy mapping change | old/new node mapping version | Shadow remap; split/merge only with explicit mapping, never silently duplicate evidence |
| Blueprint change | affected task forms/conditions/component weights | Suspend incompatible target-evidenced/readiness contributions; retain transferable historical capability |
| Parameter/calculation change | affected projection kinds/source cuts | Shadow full-equivalent rebuild; compare; publish atomically if gates pass |
| Account deletion | learner deletion journal | Delete facts, projections, jobs, exports, references per Stage 05; no automatic rebuild |
| Long absence | no fact mutation | Freshness evaluated deterministically on read/rebuild; no repair/regression transition |

### 11.2 Publication sequence

~~~mermaid
sequenceDiagram
    participant F as Fact/correction accepted
    participant J as pg-boss rebuild job
    participant P as Projection engine
    participant S as Shadow generation
    participant V as Validator
    participant C as Consumers
    F->>J: semantic idempotency key + affected scope + source cut
    J->>P: rebuild exact learner/claim closure
    P->>S: write immutable candidate generation
    S->>V: counts, invariants, checksum, source coverage
    alt valid and source cut still current
        V->>C: atomic current-generation pointer
    else newer cut exists
        V->>J: supersede and enqueue current cut
    else validation fails
        V->>C: retain last-good + failed/stale reason
        V->>J: bounded retry / operator incident
    end
~~~

Every generation stores its source cut, row count, selected source count, checksum, algorithm/parameter versions, created/published times, and predecessor. Reprocessing the same semantic job returns the same generation/checksum. A later source cut supersedes but never mutates a published historical generation.

### 11.3 Compatibility

- Additive fields are minor-compatible when old consumers have exhaustive fallback reason handling.
- New enum state, changed semantic meaning, key shape, or calculation interpretation requires a contract major and dual-read/shadow period.
- Unknown major/enum fails closed for the local projection.
- Parameter versions cannot change stable invariants.
- Export contains learner facts, current human-readable states, source/version lineage, weakness/review history, and explanations in a documented portable format. It need not export provider secrets or restricted content bodies.

## 12. Worked recalculation examples

### 12.1 Reading restriction: Candidate to Known to Repaired

Parameter bundle S07-LAUNCH-1 applies. Three valid direct Reading opportunities occur:

| Occasion | Outcome | Independence / strength | Effect |
|---|---|---|---|
| Day 1 fresh notice, missed “nur werktags” | failure | independent E3 | Candidate, cause medium |
| Day 1 fresh post-repair retry succeeds | success | same repair episode E1 | responsive only; no recurrence/retention |
| Day 10 fresh notice, missed “außer sonntags” | failure | independent E3 | Two failures across days |
| Day 10 third comparable opportunity exists | denominator | valid direct opportunity | Last comparable rate is 2/3 |

All promotion gates now hold: same node/cause/lane, two independent failure episodes across two days within 60 days, three opportunities and 2/3 failure, medium cause confidence, direct valid evidence. Current state becomes Known/Active. A delayed clean check on Day 12 moves Repairing → Stabilizing. Clean direct successes on three occasions spanning 14+ days, majority unassisted, move to Repaired. A natural fresh R4 success around Day 60 moves to Resolved. No success deletes the two failures.

### 12.2 Language Elements failure and Writing verification

A high-confidence controlled-choice failure for “weil” creates a Language Elements Candidate. The matrix emits a Writing verification target but no Writing negative contribution. A fresh unassisted email later uses correct verb-final order. It is direct positive Writing evidence and S+ for the exact concept’s controlled availability; it satisfies a matching Writing obligation if due. The original controlled Candidate remains until its own direct opportunities confirm/dismiss it. Writing mastery was never lowered.

### 12.3 One target-condition failure against stable history

A task-family projection has six effective units across four fresh occasions, Stable/Reliable at P3. One valid P4 timed failure contributes one new target occasion. The current target facet records the failure and the overall trend becomes contradictory; timing/strategy attribution is evaluated. The learner-facing band moves at most one step from this single occasion and a fresh target clarifier is requested. If the next comparable P4 occasion fails, realistic evidence accumulates and may lower the target facet/profile. Old P3 history remains.

### 12.4 Return after six weeks

No facts are added during absence. At day 43, relevant claims move from Fresh to Aging; weakness state does not become Repaired or Known merely because time passed. Review obligations may be overdue, but there is no missed-day failure or debt count. The selector chooses the smallest high-value Written/Oral and known-weakness checks; a clean stronger natural task may satisfy several exact obligations. Low-value historical vocabulary stays unsurfaced.

### 12.5 Content correction and targeted rebuild

An audio revision used by 11 learner observations is quarantined for a defective decisive segment; the impact assertion marks only its Listening outcome dimension not_counted. The rebuild selector finds those 11 observations and their dependent Listening claims, weakness patterns, progression profiles, review obligations, and readiness contributions. Writing/Reading and unaffected audio dimensions keep identical checksums. Apparent failures disappear with zero learner penalty; affected target claims become unavailable/recomputing until replacement evidence. Audit proves 100% selected scope and zero unaffected mutation.

### 12.6 Progression one-axis probe

Listening P2 is confirmed at normal speed with target playback plus one extra. The profile is Functional/medium with three fresh opportunities across two sessions and no unresolved blocker. The probe removes only the extra replay. Fresh success creates provisional P3 playback condition; a later fresh success confirms it. If the learner uses an extra replay, the attempt remains valid assisted P2 evidence and does not confirm the P3 axis. No other Listening axis or section is promoted.

## 13. Failure, recovery, and uncertainty

| Situation | State/effect | Recovery |
|---|---|---|
| Unknown cause | Broad task evidence; fine weakness Candidate/clarifier only | One smallest direct contrast; unresolved is acceptable |
| Invalid/inaccessible task | not_counted or partially_valid affected scope; zero learner-negative effect | Replace/quarantine and targeted rebuild |
| Evaluator pending | blocked_by_pending only for supported dependent dimensions | Continue unrelated work; accept later idempotently |
| Recalculation fails | failed/recomputing; retain last-good when safe | Bounded retry, operator incident, shadow repair; no partial publish |
| Source cut changes mid-build | Candidate generation not published | Supersede with current-cut job |
| Stale capability | Historical state retained; high-stakes contribution limited/ineligible | Smallest direct fresh recheck |
| No fresh compatible content | Review blocked_content/unavailable, never learner failure | Natural opportunity, broader reviewed task, or product inventory work |
| Contradictory evidence | Trend contradictory, confidence lowered, claim widened | Fresh comparable clarifier; stable history remains |
| Technical/media/browser/network fault | Affected observation invalid/pending | Local fallback/resume/retry; unrelated modules continue |
| Content/taxonomy/blueprint drift | Incompatible target claim suspended | Versioned mapping/revalidation; retain transferable history |
| Learner disputes diagnosis | Preserve evidence and reason, lower cause confidence if plausible | Fresh direct check; never argue from opaque authority |
| Unsupported client enum/version | Local fail-closed state | Upgrade client/contract; server never sends invented default |
| Long inactivity/backlog | No failure/debt/regression | Compact reprioritized return plan |
| Duplicate submission/job | Same semantic outcome | Return committed identifiers/generation |

Technical, content, media, accessibility, browser, network, partner, or evaluator failure never becomes negative capability, recurrence, progression regression, review failure, or Readiness input.

## 14. Security, privacy, rights, accessibility, performance, and cost

### 14.1 Security, privacy, and rights

Learner facts and projections remain inside App PostgreSQL with the Stage 05 classification/access boundary. Corpus receives no learner identifier, profile, response, weakness, or review schedule. Authorization is learner-scoped on reads, exports, corrections, and deletion; administrative corrections are append-audited.

Projection explanations use structured reason codes and references, not raw hidden reasoning. Logs/metrics carry pseudonymous learner/claim identifiers, versions, counts, duration, status, and reason codes—not response text, transcripts, audio, diagnosis prose, or content bodies. Raw speaking audio remains ephemeral under the accepted ≤7-day policy and is not required for Mistake Memory.

Rights/version changes can remove content bodies and invalidate affected target claims without erasing defensible learner history. Export includes portable structured history and current projection/explanation versions; deletion removes all personal facts, projection generations, obligations, jobs, caches, and generated exports under the Stage 05 journal/backup policy. Jurisdiction-specific legal review remains Stage 23; this document does not claim compliance.

### 14.2 Accessibility

Equivalent non-answer-bearing access support does not reduce ability evidence. Equivalence is a versioned assertion tied to task capability and accommodation. When an alternate input changes what is tested—typed instead of oral production, transcript instead of Listening, monologue instead of interaction—it creates a different direct lane/condition and cannot satisfy the original obligation or readiness contribution.

Every availability, weakness, progression, and review state has text plus non-color semantics. Conditions and due windows are exposed to assistive technology; no P0–P4 badge/debt counter is required. A failed access path is a system fault with an alternate path or narrower explicit claim.

### 14.3 Performance, reliability, and operations

The default is incremental per-learner/affected-claim recomputation in PostgreSQL with pg-boss durable jobs; small same-request projections may compute synchronously only when they use the identical engine and publish semantics. Full rebuild remains available for validation/recovery but is not the normal write path.

Initial service objectives to validate, not product truth:

- accepted ordinary evidence to current affected learner projection: p95 ≤5 seconds;
- user query for current projection/obligations from published rows: p95 ≤250 ms excluding network;
- correction job must select all asserted affected rows and mutate zero unaffected projection checksums;
- deterministic rebuild of the same source cut/version must match checksum 100%;
- no projection publish from incomplete source selection or failed invariants.

Monitor job lag/age, affected-row counts, source-cut supersession, rebuild duration, checksum mismatch, invalid transition attempts, pending age, blocked-content age, last-good age, parameter shadow drift, duplicate semantic keys, queue cap outcomes, and cost per accepted evidence/projection—without sensitive payloads.

### 14.4 Cost, fallback, exit, and upgrade triggers

This stage adds no provider and no model call. Marginal costs are PostgreSQL rows/indexes, existing pg-boss worker time, backup/export bytes, and engineering maintenance. Routine objective diagnosis, projections, lifecycle changes, scheduling, explanations, and queue selection are deterministic. Writing/Speaking evaluation may supply bounded structured facts in its existing evaluation call; no second memory/projection call is allowed.

Cheaper fallback: recompute only the active learner/claim synchronously, batch low-priority freshness/review refresh on the existing worker, use templates/reason codes, and use natural practice rather than generated review. Last-good projections permit temporary delayed richness without lowering truth.

Provider exit follows accepted ADRs: standard PostgreSQL logical export/import, ordinary relational jobs replacing pg-boss, NDJSON/CSV learner export, and S3-compatible object export where needed. No projection truth lives in Render, R2, an AI provider, or client cache.

Review/upgrade only after ordinary query/index/batching optimization if either p95 publication exceeds 5 seconds or correction backlog exceeds the decision window for seven consecutive days, checksum/invariant gates cannot be met by targeted rebuild, or measured false diagnosis/scheduling harms retained transfer. An upgrade may add partitioning, read replicas, or a better bounded productive evaluator; it must not add a streaming platform, warehouse, per-click AI, learner data in Corpus, or a new probability field merely for scale.

## 15. Alternatives, rationale, and exits

| Decision | Chosen | Simpler/do-nothing alternative | More complex alternative | Criteria and rejection / exit |
|---|---|---|---|---|
| D01 ownership | Separately owned rebuildable projections over one accepted evidence cut | Mutable learner summary updated by each feature | Full event-sourcing framework/streaming platform | Mutable summary loses audit and lets owners conflict; streaming adds operations without need. Exit is standard relational rebuild/export |
| D02 capability | Explicit claim vector and condition facets | One global level/score | Per-node probabilistic knowledge-tracing model | Global score hides lane/condition/missing evidence; ML lacks calibration/data and invites opacity. Revisit only with validated predictive benefit while keeping vector contract |
| D03 mistake | Complete deterministic lifecycle with shaped gates | Store wrong answers/history only | Cause probability graph/research-grade telemetry | History-only cannot drive repair/retention; probability graph is uncalibrated/costly. Broader unresolved cause is the safe fallback |
| D04 cross-lane | Direct-only negative effect plus V/S+ asymmetry | No cross-lane relationships | Automatic mastery transfer across graph | No relationships wastes useful verification; automatic transfer invents mastery. Disable V relationship version safely if mappings fail |
| D05 progression | Local axis-vector P0–P4 with one-axis probes | One global CEFR/course level | Adaptive black-box difficulty optimizer | Global level violates product; black box confounds causes and cost. Fixed confirmed profile is fallback during optimizer/probe issues |
| D06 review | Capability obligations with deterministic windows/natural satisfaction/caps | No scheduling; rely on learner memory | Generic SM-2/AI deck and debt counter | No scheduling misses retention; deck treats content exposure as learning and violates design. Natural embedding is the cheapest fallback |
| D07 versions | Immutable parameter bundles, source cuts, shadow rebuild/publish | Change constants in place | Always recompute every learner globally / online experiment platform | In-place constants destroy explanation; global recompute is excess blast radius. Roll back to prior bundle/generation |
| D08 failure/API | Exhaustive states and last-good local degradation | Null/500/spinner and client guesses | Multi-region active-active projection service | Client guessing turns missing into false truth; multi-region is unnecessary. Last-good plus bounded worker retry is fallback |
| D09 cross-cutting | App-contained data, equivalence assertions, deterministic existing stack | Store only current summary, omit export lineage | Warehouse/cross-learner profiling/permanent media | Summary cannot explain/delete coherently; profiling/media are privacy/cost overreach. Portable relational export is exit |
| D10 validation | Golden/property/metamorphic tests and checksums | Example tests only/manual spot checks | Full formal verification/research experimentation platform | Examples miss invariant interactions; formal platform is disproportionate. Add specialized verification only after a measured escaped class |

The choices minimize operations while preserving pass-critical evidence, accessibility, recovery, privacy, and audit. Cost may choose between equivalent mechanisms; it never removes direct Writing/Oral evidence or truthfulness.

## 16. Validation and release evidence

Required automated architecture-to-implementation tests for Stages 24–25:

- golden fixtures for all worked examples and every legal lifecycle/progression/review transition;
- property test: recompute twice at identical source cut/version yields identical rows/checksum;
- property test: input ordering, job retry, reconnect, and provider redelivery do not change semantic result;
- metamorphic test: same-session retry/repeated item never creates independent episode or retention;
- metamorphic test: invalid/non-learner fault has zero negative capability/weakness/progression/review effect;
- metamorphic test: elapsed time changes freshness/due status only, never repair, weakness confirmation, mastery history, or regression;
- metamorphic test: Reading/Listening/Writing/Speaking negative evidence affects only direct supported lane;
- metamorphic test: offered-but-unused/post-response help preserves original condition;
- metamorphic test: stronger direct natural evidence satisfies weaker matching obligation, while wrong-lane/exposed evidence does not;
- transition-table tests for Candidate/Historical/Known/Repairing/Stabilizing/Repaired/Resolved/Reopened and review failure/recovery;
- one-axis progression tests proving unrelated task families/axes remain byte-identical;
- correction/quarantine/takedown seed tests proving complete affected selection and zero unaffected checksum change;
- blueprint/taxonomy/evaluator/parameter version compatibility and rollback tests;
- accessibility equivalence fixtures for same capability and changed-capability alternatives;
- export/delete tests covering facts, every projection generation, obligation/job/cache, and ephemeral media reference;
- repository/schema/API/event/template/copy scan proving no pass-probability field or hidden calculation;
- shadow-calibration reporting with raw counts, false weakness promotion, repair transfer/retention, support dependence accuracy, review usefulness, projection latency/cost, and Written/Oral separation.

Release a new calculation/parameter major only after deterministic shadow checks, domain review, learner-copy review for changed reasons, and rollback rehearsal. Calibration may tune numeric defaults but cannot tune away structural invariants.

## 17. ADR

Created and accepted:

- ADR-0014 — Deterministic learner projections and capability obligations. It records ARCH-S07-D01–D10, alternatives, consequences, traceability, review triggers, fallback, and supersession. It refines ADR-0001, ADR-0002, ADR-0007, ADR-0010, ADR-0011, ADR-0012, and ADR-0013; it supersedes none.

One ADR is sufficient because the capability vector, Mistake lifecycle, local progression, review obligation, and versioned rebuild are one durable projection boundary. Splitting them would duplicate the same context/review triggers without independent reversibility.

## 18. Downstream handoff and relationships

Stages 08, 11, 12, 20, 22, 24, 25, 27, and 28 must preserve:

- one accepted evidence source cut; facts never rewritten by projections;
- direct-lane negative effect, condition facets, independence/occasion/content-family caps, and missing-as-absence;
- complete Mistake lifecycle and promotion/repair/reopen gates; two independent episodes default; same-session success is not retention;
- local task-family/direct-lane P0–P4 axis profiles; P4 is a condition, not an unlock/global level;
- capability review obligations with R0–R4 windows, natural satisfaction, capped backlog, no debt economy;
- ReadinessContribution only; independent Written/Oral readiness and booking remain with the later owner;
- deterministic scheduling/projections with no model call merely to update state;
- versioned immutable parameter/calculation bundles, targeted shadow rebuilds, last-good failure behavior, and audit checksums;
- App-only learner history, coherent export/delete, rights/version impact, and explicit accessibility equivalence;
- no pass-probability field, model, event, copy, generic carrier, or hidden calculation before a separately authorized calibrated product gate.

Dependencies introduced:

- immutable ParameterBundle and ProjectionSourceCut contracts;
- reason-code registries for capability, weakness, progression, review, failure, and recalculation;
- versioned Corpus node/mapping/task/rights bundle already required by prior stages;
- targeted pg-boss rebuild jobs and immutable projection-generation pointers using the accepted stack;
- fresh-content availability query for review/progression, never live Corpus search.

Dependencies removed/avoided:

- no mutable all-purpose learner row, global CEFR level, generic deck service, ML knowledge tracer, streaming platform, warehouse, per-click AI, or runtime Corpus dependency;
- no second evaluation call merely for Mistake Memory/projections.

Later-stage ownership:

- Stage 08 consumes these states to assemble sessions and structured reasons.
- Stages 11–12 refine productive evaluator-supported dimensions and direct evidence, not lifecycle truth.
- Stage 20 renders progress/regression/milestones without XP/streak/debt.
- Stage 22 finalizes notification/time-zone delivery over existing windows, never creates evidence from reminders/misses.
- Stage 24 defines observability/calibration dashboards and cost gates from privacy-minimized events.
- Stage 25 implements exhaustive tests/evaluation gates.
- Stage 27 validates end-to-end invariants and contradictions.
- Stage 28 consolidates specification/roadmap.

## 19. Risks, assumptions, and validation needs

| Risk / assumption | Consequence | Evidence/test and response |
|---|---|---|
| Launch thresholds over/under-promote weaknesses | False labels or slow coaching | Measure false promotion, later recurrence, delayed transfer; shadow new bundle and roll back |
| Task/tag/cause mapping is weak | Wrong fine projection | Keep broad unresolved state; measure correction/disagreement; require medium cause gate |
| Sparse productive evidence | Low confidence/slow progression | Preserve absence; prioritize smallest direct sample; never transfer from receptive |
| Natural satisfaction matcher too broad | False retention | Golden lane/condition/content-family fixtures and sampled audit |
| Review caps defer useful low-value items | Some items wait | Measure retained transfer and pass-risk coverage; expand only if outcomes justify |
| Projection lag/failed rebuild | Stale coaching | Last-good state, explicit age, bounded retry, source-cut supersession metrics |
| Taxonomy/blueprint mapping changes | Double/lost evidence | Shadow mapping totals/checksums and explicit split/merge rules |
| Accessibility equivalence is asserted incorrectly | Unfair/invalid claim | Capability-specific expert/user testing and versioned equivalence approval |
| Parameter decimal appears as learner certainty | Misleading copy | Contract/UI tests hide estimate and ban probability language |
| One learner/personal-project data is too sparse for ML | Overfitting | Keep deterministic defaults; require external/longitudinal validation before complexity |

## 20. Intentionally deferred implementation choices

These are bounded implementation choices, not undecided product rules:

- exact PostgreSQL table/index names and partition thresholds — Stage 26 implementation/operations, while ownership/keys/source cuts are fixed here;
- transport serialization, pagination, and cache TTLs — API implementation under the exhaustive state/version contract;
- exact taxonomy split/merge operator UI — Stage 22/26, preserving append impact and shadow rebuild;
- task-family-specific fine tuning of timer/playback/profile thresholds — Stages 15–18 and calibration, versioned under this bundle;
- notification copy/channel/local-time behavior — Stage 22, consuming windows without changing them;
- productive evaluator/vendor/model selection and rubric prompts — Stages 12 and 19, bounded by accepted evidence/support contracts;
- jurisdiction-specific lawful basis/retention review — Stage 23; no compliance claim here;
- visual component composition and final wording — implementation following Design, without exposing P-rung badges/debt/probability.

No owner question blocks Stage 07.

## 21. Decisions made

ARCH-S07-D01 through ARCH-S07-D10 are decided and traceable. One accepted ADR captures their durable coupling. No shaping/design file, prior architecture output, production code, configuration, or later-stage file is changed.

## 22. Definition-of-done check

- [x] All required live inputs and SHAs/commits recorded; required Stages 04–06 reconciled.
- [x] Authority/Stage 27 precedence and design terminology reconciliation documented.
- [x] Deterministic capability/mastery, confidence, freshness, stability, assistance, timing, lane, coverage, and readiness-contribution projections defined without duplicate Readiness.
- [x] Complete Mistake lifecycle, promotion, recurrence, opportunity denominator, repair, resolution, history, and reopening defined.
- [x] Local P0–P4 profile/axis/probe/adoption/regression model defined.
- [x] Review obligations, R0–R4 windows, natural satisfaction, missed-day behavior, capping, repeated failure, and deterministic scheduling defined.
- [x] Parameter/calculation versions, projection invalidation, targeted shadow recomputation, compatibility, atomic publication, and rollback defined.
- [x] Projection ownership table, Mistake diagram, progression model/table, review state machine, cross-lane matrix, data flow, rebuild sequence, and worked recalculations included.
- [x] Alternatives include simplest and more-complex options, criteria, consequences, fallbacks, exits, and review triggers.
- [x] Security/privacy/rights, accessibility, failure/recovery, API/state, cost, performance, reliability, operations, validation, downstream handoff, risks, and deferrals covered.
- [x] ADR-0014 created as Accepted and indexed.
- [x] No owner blocker and no consequential rule left for a feature implementer to invent.
