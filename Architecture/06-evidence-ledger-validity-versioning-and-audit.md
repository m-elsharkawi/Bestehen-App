# Bestehen / App — Evidence Ledger, Validity, Versioning, and Audit

> **Stage:** 06 of 28
>
> **Status:** Accepted architecture decision
>
> **Decision date:** 2026-08-23
> **Scope:** Evidence identity, validity, lineage, correction, audit, and projection contracts; no production schema, API, migration, or application code

## 1. Purpose and scope

This stage defines the smallest sufficient architecture that lets Bestehen say exactly what happened, what a learner response directly supports, why a conclusion currently counts, and how that conclusion changes when content, evaluation, taxonomy, rights, or target rules change.

The Evidence & Capability context owns accepted evidence observations and their validity assertions. Session & Attempt owns what the learner and device actually did. Productive Evaluation supplies versioned candidates, not truth. Content & Forms, Corpus Publication, and Measurement own their own facts and request evidence reinterpretation through owner commands. Capability, Mistake Memory, Progression, Readiness, Coaching, and analytics are versioned projections over accepted observations; they never rewrite the ledger.

This document contains explanatory pseudotypes and diagrams only. It creates no production code, DDL, migrations, deployable configuration, storage resource, provider selection, or implementation schema.

## 2. Inputs, authority, and prior-stage continuity

### 2.1 Current repository evidence

Every required input was fetched from current GitHub main before deciding. Blob identifiers are immutable Git object SHAs.

| Repository / commit | Path | Blob SHA |
|---|---|---|
| Bestehen-Shaping @ 9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc | app/28-bestehen-app-product-specification.md | 18ae80cc2fd63cecd76c297c3e56d44a68367856 |
| same | app/03-initial-diagnostic.md | 038ab89b0be23464eedf1408111dd1936320f57a |
| same | app/04-learner-model.md | f7ae1f4af375ee3302d04c726d8fe8453a9daf80 |
| same | app/05-mistake-memory.md | a7c574b08c33418eab44aba8b6e9b7f8ab877109 |
| same | app/07-core-learning-loop.md | c313c859f64997972feca87497d70476c4528a20 |
| same | app/08-a1-to-b1-progression.md | 839a01c010cf79777520714d0ab09304a2ba9a06 |
| same | app/14-review-and-spaced-repetition.md | fa9b65e92cd1511e00e106a199eb6fbc06273a69 |
| same | app/15-telc-readiness.md | b4456939928493569336bbc565d7e67307e7a3db |
| same | app/16-mock-exams.md | 8f6c23fa16524bd251cef39d823cfeea73bfcef3 |
| same | app/17-ready-to-book-logic.md | 9e3e8b24faefe885d5b10409725619d0d0d84e6d |
| same | app/21-content-strategy.md | 8149d6a268da70e17cad46f774b9d5de77776986 |
| same | app/24-analytics-and-success-metrics.md | 28d1a5380a7ea9f28efdc95ce0c96987920917e1 |
| same | app/26-platform-accessibility-nonfunctional.md | 8137091683941b0d55f3d4fb90af3c402b8371e5 |
| same | app/27-end-to-end-scenario-validation.md | 5da3b0a27ba516770210773399f0415cfb1f5460 |
| Bestehen-App @ e0554a9e2f19153372431c66d42b24cee502f33d | Architecture/00-architecture-shaping-plan.md | b263c5e7b3bccc0450ddd17aa0cc007432d672b7 |
| same | Bestehen_App_Architecture_Checklist.md | ff1c740d8999ca0994fd53af800e45a0e81db3be |
| same | prompts/architecture/06_define_evidence_ledger_validity_versioning_and_audit.txt | afc2f4c0e4c07df6bf83e3d9494d7f664444cfa4 |
| same | Design/DESIGN-HANDOFF.md | 417a6820037e045e2dd9f29afc42b9f2e94fd638 |
| same | Design/Bestehen-01-Design-System.dc.html | d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a |
| same | Architecture/04-domain-model-and-bounded-contexts.md | ab1a775d7689e47bba00c2544c247ef344c44e70 |
| same | Architecture/05-data-ownership-persistence-and-schema-evolution.md | bb6df811ec9010de556d1719f22e31bb8ca3190e |
| same | Architecture/adr/README.md | 1df52c1e4c9ad92723cffa806841dc8d53c80018 |

The Stage 06 output was absent and all 24 Stage 06 checklist items were open at this baseline. Required Stages 04 and 05 are accepted and substantive. Stage 04 fixes the Evidence & Capability command owner, five validity states, shared five-skill foundation, direct-evidence lanes, and rebuildable projections. Stage 05 fixes PostgreSQL authority, append-oriented fact/correction semantics, opaque identities, per-learner accepted sequence, immutable content revisions, idempotent fact-plus-job transactions, source-cut projections, and targeted rebuilds. This stage refines those contracts; it does not reinterpret them.

### 2.2 Authority and reconciliation

Authority is final product specification, then detailed shaping under Stage 27 precedence, then Identity/Product Overview, then human-authored design, then illustrative design runtime. The precedence order is validity/fairness → direct evidence → independent Written/Oral risk → uncertainty resolution → due repair/retention → progression/coverage → preference. Urgency and learner choice affect priority, never truth.

| Source difference | Resolution |
|---|---|
| Design says only valid can move a component estimate, while product shaping also preserves unaffected scope after partial interruption. | partially_valid may contribute only explicitly named unaffected units or dimensions; it never moves the invalid whole-block claim. valid remains the only state that supports the complete named observation scope. |
| Design names Ready-to-Book as a four-condition checklist; product Stage 17 defines Gates A–F. | Preserve all six authoritative gates. A UI may group them but the API exposes every gate and precise failing reason. |
| Design shortens some labels and uses learner copy rather than domain detail. | Server projections derive the exact learner labels from richer immutable conditions; the labels are read-only and cannot be used as input facts. |
| Design treats 65 and speech confidence as open. Product stages settle behavior but require calibration. | Keep 60 official target truth separate from the 65 Bestehen default; version all empirical thresholds with provenance, effective date, validation evidence, and rollback. |

No source requires modification. No owner preference, private source, legal-risk tolerance, or budget decision blocks Stage 06. No mutable framework, provider, service, browser API, price, quota, or region claim is introduced, so no new external technology research is required.

## 3. Decision registry

| ID | Recommended default and criteria | Credible alternatives and why rejected | Consequence, fallback, review trigger | ADR |
|---|---|---|---|---|
| ARCH-S06-D01 | Three immutable identities—attempt fact, evidence observation, and validity assertion—plus explicit episode, independent occasion, mock occasion, and content-family references. Criteria: auditability, no confidence inflation, correction without rewriting. | A: one mutable result record is simplest but conflates action, interpretation, and current validity. B: infer independence from timestamps/session IDs is cheap but creates false recurrence. C chosen: explicit identities and relations. | More fields, but every claim can be traced. Fall back to broader/non-independent evidence when an identity is missing. Review only if a required real-world relationship cannot be represented without conflation. | ADR-0013 |
| ARCH-S06-D02 | One versioned evidence envelope shared by all five skills, with typed modality extensions and explicit conditions. | A: per-skill envelopes drift. B: generic flags erase playback, productive dimensions, and interaction. C chosen: stable kernel plus typed extensions. | Unknown required extension/contract major is quarantined or Pending. Add compatible fields without changing old meaning. | ADR-0013; refines ADR-0011 |
| ARCH-S06-D03 | Facts and derived claims are separate: Session & Attempt owns occurrence facts; Evidence owns accepted observations/current validity; projections own current interpretations. | A: evaluator output is truth but couples providers. B: projection writes back to facts but destroys reproducibility. C chosen: owner-routed acceptance. | Provider/processor exit does not change domain history. Unsupported candidate stays Pending/rejected; deterministic facts and unrelated work survive. | ADR-0013; refines ADR-0010 |
| ARCH-S06-D04 | Exactly five validity states with append-only current-assertion transitions, affected scope, reason, authority, and transition evidence. | A: valid/invalid boolean cannot express Pending or partial scope. B: independent flags permit contradictory states. C chosen: closed state machine. | Unknown state/transition fails closed. A learner, UI, provider, analytics process, or operator SQL edit can never set validity. Review only by superseding product decision. | ADR-0013; ADR-0001 |
| ARCH-S06-D05 | Independence is a conjunction of occasion, episode, content-family freshness, exposure, and role—not another click or a different ID. Immediate retry, delayed transfer, retention, and mocks remain distinct. | A: count every attempt overstates recurrence/confidence. B: same-family elapsed-time heuristic is easy but can reward memorization. C chosen: explicit correlation and freshness. | Ambiguity reduces independence/claim strength and requests a fresh occasion; it never manufactures readiness. Review thresholds, not semantic classes, from Stage 24 evidence. | ADR-0013 |
| ARCH-S06-D06 | Carry independent blueprint, taxonomy, content, form, rubric, evaluator, prompt, calculation/calibration, evidence-contract, and client-contract lineage through observations and projections. | A: one global version over-invalidates everything. B: latest-only versions reinterpret history. C chosen: typed version tuple. | Compatible readers preserve old facts; unknown consequential major is quarantined. Targeted recomputation follows the changed axis. | ADR-0013 |
| ARCH-S06-D07 | Idempotent ingest and semantic effect use operation uniqueness, payload hash, terminal constraints, provider-result identity, accepted sequence, and deterministic recompute identity. | A: at-least-once duplicates cleaned later can create false independence. B: provider exactly-once claims are not App proof. C chosen: App-owned idempotency. | Exact retry returns the committed result; conflicting key reuse is rejected. Reconnect never creates a second observation. | ADR-0013; refines ADR-0012 |
| ARCH-S06-D08 | Corrections, invalidations, quarantine, rights takedown, and target changes append an audited impact assertion and rebuild only indexed affected scope in shadow generations. | A: destructive edit loses history. B: global rebuild/invalidate is safe-looking but erases unaffected learner truth and wastes resources. C chosen: explicit impact selectors plus conservative containment. | If exact scope cannot be proven, quarantine the smallest defensible superset and label it; never penalize. Promote full rebuild only after measured scoped-rebuild failure. | ADR-0013 |
| ARCH-S06-D09 | Learner-facing evidence labels and validity/readiness states are server-derived discriminated projections; missing numeric estimates are absent, never zero; pass probability is structurally forbidden. | A: client derives labels and missing defaults, causing drift/zero. B: reserve a hidden probability field for later, which invites leakage. C chosen: no field/event/template/calculation exists. | Unknown enum/reason renders an unavailable/update-required state, never success/failure/zero. A future probability requires a new product gate, ADR, schema major, validation, and copy review. | ADR-0013; ADR-0001 |
| ARCH-S06-D10 | Deterministic PostgreSQL projections plus pg-boss targeted jobs and append audit; no streaming platform, warehouse, or per-observation AI. | A: synchronous global rebuild increases learner latency. B: Kafka/event-sourcing platform adds personal-project operations. C chosen: ordinary transactions and durable jobs. | Last validated projection may remain visible as stale/rebuilding; dependent conclusion Pending when safety requires. Review after sustained scoped rebuild/SLO contention despite ordinary optimization. | ADR-0013; ADR-0002/0007/0012 |

## 4. Ownership and audit boundaries

| Concern | Authoritative owner | May request / supply | Cannot do |
|---|---|---|---|
| Session, attempt, response, checkpoint, timer, playback, help, reference, exposure, device observations | Session & Attempt | UI/browser adapter supplies signed/validated command facts | Interpret mastery, validity, or Readiness |
| Content family/revision/form/media role, quality, rights, quarantine | Content & Forms | Corpus ACL supplies versioned intelligence; learner/operator may report a defect | Change learner result or evidence directly |
| Productive evaluator job/candidate/confidence | Productive Evaluation | Provider adapter supplies candidate result | Accept evidence, set validity, or set Readiness |
| Evidence observation, direct lane, supported dimensions, validity assertion, corrections | Evidence & Capability | Attempt/Evaluation/Content/Operations invoke typed owner commands | Rewrite occurrence facts or accept arbitrary operator edits |
| Capability projection | Evidence & Capability | Recompute from accepted ledger cut | Become occurrence truth |
| Mistake, Review, Progression | Their Stage 04 owners | Consume observation stream/projection view | Mutate evidence backward |
| Readiness, mocks, booking gates | Measurement | Consume eligible evidence and target lineage | Invent direct evidence or pass probability |
| Calibration release, incident, audit access | Operations & Governance | Approves releases and invokes owner commands | Patch semantic rows or override product rules |
| Learner-visible labels/state/copy | API projection of owning domain | UI renders exhaustive discriminated contract | Let learner/client edit system-owned truth |

An operator action is not authority merely because it is privileged. It must become a typed command to the semantic owner, pass authorization and invariant checks, append actor/purpose/reason evidence, and return an immutable audit reference. Direct database edits are break-glass incidents, not a supported correction path; restoration must append a reconciliation record before affected state is trusted again.

## 5. Evidence identity and envelope

### 5.1 Identity and independence model

| Identity | Meaning | Independence rule |
|---|---|---|
| session_id | One time-bounded coaching commitment | Never proves evidence independence by itself |
| attempt_id | One immutable served-response execution, including actual conditions and terminal outcome | A retry is a new attempt but not necessarily a new independent occasion |
| observation_id | One immutable accepted statement about a direct lane and supported scope from an attempt | Several dimensions may share one attempt/occasion and cannot inflate occasion count |
| validity_assertion_id | One append-only assertion of current validity/scope/reason that supersedes an earlier assertion | History is a chain; current pointer is a convenience only |
| episode_id | Original attempt, diagnosis, repair exposure, and same-chain retries | All events inside remain one recurrence episode |
| independent_occasion_id | Correlated opportunity used for confidence/consistency | Changes only when product independence policy says the opportunity is distinct |
| mock_occasion_id | All scored units in one mini/component/full mock | One mock is one correlated confidence occasion even with many items |
| content_family_id | Semantic exposure/freshness family | A new revision or prompt ID is not fresh if the family/answer mechanism was exposed |
| content_revision_id | Exact immutable served text/media/rubric binding | Never retargeted after serving |
| form_id | Exact controlled mock/section composition | A fresh form still needs distinct content families and occasion |

Independence is never inferred from UUID order, wall-clock gap, route, tab, or session count alone. Stage 07/14 policy assigns one explicit class: first_attempt, immediate_retry, delayed_transfer, retention_check, repeated_exposed_practice, or mock_measurement. A fresh immediate retry can prove responsiveness but remains in the same episode and occasion. A delayed transfer or retention check requires a new eligible occasion and fresh family. One mock can emit many scoped observations while retaining one mock occasion.

### 5.2 Explanatory evidence envelope pseudotype

This is a logical contract, not executable TypeScript or a table definition.

~~~text
EvidenceEnvelope = {
  identity: {
    observation_id, learner_scope_id, session_id, attempt_id,
    episode_id, independent_occasion_id, mock_occasion_id?,
    operation_id, accepted_learner_sequence
  },

  purpose: diagnostic | coaching_practice | review | progression_probe |
           mini_mock | component_mock | full_mock | booking_confirmation,

  subject: {
    direct_modality: reading | language_elements | listening | writing | speaking,
    direct_lane: recognition | production | interaction,
    skill_or_section, task_family_id, capability_node_refs,
    supported_scope: units + rubric_dimensions + claim_dimensions
  },

  content: {
    content_family_id, content_revision_id, form_id?, media_revision_id?,
    approval_role, target_mapping, corpus_bundle_ref?
  },

  occurrence: {
    response_fact_refs, completeness, submitted_outcome,
    occurred_at, recorded_at, clock_quality, monotonic_elapsed_ms?,
    checkpoint_and_interruption_refs
  },

  conditions: {
    progression_profile,
    assistance_offered[], assistance_used[], assistance_phase,
    timing_mode, target_duration_rule?, timer_integrity,
    playback_rule?, playback_actual?, speed_actual?,
    transcript_or_reference_exposure[],
    exposure_class, independence_class, freshness_basis,
    target_conditions_claimed, target_conditions_met,
    accessibility_support[], equivalence: equivalent | claim_narrowing | unknown,
    browser_device_capability_refs
  },

  evaluation: {
    method: deterministic_key | reviewed_human | bounded_evaluator,
    candidate_ref?, supported_dimensions, dimension_results,
    evaluator_confidence, disagreement_or_limit_reasons[]
  },

  validity: {
    current_assertion_ref,
    state: valid | partially_valid | pending | interrupted | not_counted,
    affected_scope, unaffected_scope, reason_code, explanation_key
  },

  lineage: {
    evidence_contract_version, client_contract_version,
    blueprint_version, taxonomy_version,
    content_version, form_version?, media_version?,
    rubric_version?, evaluator_release?, prompt_template_version?,
    calculation_rules_version, calibration_version
  },

  audit: { payload_hash, accepted_by_policy_version, provenance_refs }
}
~~~

The envelope has deliberately no pass_probability, likelihood, predicted_pass_chance, implicit logit, probability-ready placeholder, or generic extra field permitted to carry one. A target score estimate belongs only to a Measurement projection after Stage 11 eligibility rules; it is not stored as an observation fact.

### 5.3 Facts versus derived claims

| Persisted fact/assertion | Derived claim/projection |
|---|---|
| What content revision was served and what response was submitted | Capability/mastery band |
| Actual help offered/used and phase | Assistance dependence |
| Actual timer/playback/reference/access conditions | Target-condition eligibility |
| Evaluator candidate, supported dimensions, confidence, and release | Accepted dimension result and current estimate |
| Current validity assertion plus full assertion history | Eligible influence at a named source cut |
| Episode, occasion, mock, family, and exposure relations | Recurrence, breadth, consistency, freshness |
| Correction/quarantine/takedown/blueprint impact assertions | Current capability, Mistake, Progression, Readiness, booking state |

Derived projections record their exact evidence source cut, included/excluded observation references or a reproducible selector digest, rules/calibration versions, target lineage, computation time, checksum, state, reasons, and previous validated generation. They are replaceable. Material learner-visible historical snapshots remain as what was shown under then-current inputs, linked to the later correction/current view.

## 6. Validity model

### 6.1 State semantics and effects

Correctness and validity are orthogonal. A valid wrong response is learner evidence. A technically broken apparent wrong response is not_counted. Validity always has a named claim scope and reason.

| State | Exact meaning | Learner/evidence effect | Typical recovery |
|---|---|---|---|
| valid | The complete named observation scope is supported under the recorded actual conditions. | Eligible only according to directness, conditions, role, versions, freshness, and downstream rules; does not automatically mean correct or Readiness-grade. | Derive normally; later correction appends a new assertion. |
| partially_valid | Only the named unaffected units/dimensions are defensible; affected and unaffected scopes are disjoint and exhaustive for this observation. | Only unaffected scope can contribute. Whole-block, clean-continuity, and affected claims are absent. | Evaluate/retry affected scope; preserve unaffected history. |
| pending | Required evaluation or validation is incomplete, incompatible, or below the acceptance decision. | Blocks only dependent dimensions/conclusions. It is not zero, failure, or negative evidence. | Resolve idempotently to another state; unrelated coaching continues. |
| interrupted | Learner work may remain useful, but a required continuous/clean measured condition was lost for the named scope. | Can support practice/history under actual conditions; cannot hold the lost clean exam-condition claim. | Resume as practice or start a fresh measured attempt. Defensible unaffected subscopes may receive separate observations. |
| not_counted | The named scope is unfair or unsupported because of system, content, media, accessibility, browser, network, interaction-partner, or evaluator fault. | Zero learner capability, weakness, progression, Readiness, mock-failure, or motivational penalty. Visible neutral history begins “This wasn't you.” | Replace/fix/quarantine and offer a fair new attempt; audit targeted recomputation. |

partially_valid is not a weaker whole-attempt score. It is a scope partition. pending is not an evaluator job status alias: the job may finish while evidence remains pending admission, and a job may fail into not_counted. interrupted is not a synonym for wrong or abandoned. not_counted is not deletion; the audit history remains until the learner's deletion policy removes personal data.

### 6.2 Authorized transitions

Every transition appends a validity assertion with actor, owner command, reason, evidence, affected scope, occurred/effective/recorded times, prior assertion, contract/policy versions, and projection jobs. The original observation and prior assertion are immutable.

| From | Authorized next state | Preconditions and authority |
|---|---|---|
| new candidate | valid, partially_valid, pending, interrupted, not_counted | Evidence owner accepts Session/Attempt facts and, where needed, an Evaluation candidate. |
| pending | valid, partially_valid, interrupted, not_counted | Evidence owner validates the terminal evaluator/content/condition result. Duplicate/late results cannot apply twice. |
| valid | pending, partially_valid, interrupted, not_counted | Evidence owner accepts a new authoritative re-review, defect, timer/integrity, evaluator, rights-policy, or target-mapping impact. No automatic downgrade from an incident label alone. |
| partially_valid | pending, valid, interrupted, not_counted | Scope review proves more/less support. valid requires the complete original named scope to be affirmatively restored; otherwise create a narrower valid observation rather than relabel the whole. |
| interrupted | pending, partially_valid, not_counted; valid only as audited misclassification reversal | Actual interruption cannot be wished away. A valid reversal requires proof that the recorded interruption did not occur or did not affect the complete named scope. A later retry creates a new observation, never repairs the old one. |
| not_counted | pending, partially_valid, valid only as audited fault-reversal | Requires owner-validated proof that the fault classification was wrong or a retained result is supportable. A replacement task always creates new evidence. |

Self-transitions may append a narrower scope, corrected reason, or superseding assertion without erasing history. No scheduled job may promote pending by elapsed time. A hard timeout can append not_counted or keep pending under a bounded policy; it cannot invent a learner outcome.

~~~mermaid
stateDiagram-v2
  [*] --> Valid: complete scope accepted
  [*] --> PartiallyValid: unaffected scope accepted
  [*] --> Pending: evaluation/validation outstanding
  [*] --> Interrupted: clean continuity lost
  [*] --> NotCounted: non-learner fault
  Pending --> Valid: supported result accepted
  Pending --> PartiallyValid: supported dimensions only
  Pending --> Interrupted: continuity impact confirmed
  Pending --> NotCounted: fault/unjudgeable
  Valid --> Pending: audited re-review
  Valid --> PartiallyValid: scoped correction
  Valid --> Interrupted: integrity loss discovered
  Valid --> NotCounted: invalidation
  PartiallyValid --> Pending: remaining scope re-reviewed
  PartiallyValid --> Valid: full scope affirmatively restored
  PartiallyValid --> Interrupted: continuity claim lost
  PartiallyValid --> NotCounted: affected support removed
  Interrupted --> PartiallyValid: unaffected scope accepted
  Interrupted --> NotCounted: no defensible learner scope
  NotCounted --> Pending: fault classification reopened
  NotCounted --> Valid: audited misclassification reversal
  NotCounted --> PartiallyValid: audited partial restoration
~~~

### 6.3 Fault-to-state matrix

| Fault | Default validity effect | Never allowed |
|---|---|---|
| Ambiguous/defective answer or rubric | affected item/dimension not_counted; unaffected units partial/valid separately | wrong learner answer, weakness, or negative score from defect |
| Audio/media load, wrong file, corrupt playback | affected Listening scope not_counted; incomplete continuous block partial/interrupted as applicable | interpret silence or missed item as Listening weakness |
| Mic denied, silent/wrong input before attempt | no oral observation; preflight fact only | create weak Oral evidence |
| Capture failure after valid speaking turns | preserve defensible completed turns; affected turn partial/not_counted | infer poor German from missing/noisy recording |
| Browser/network/reconnect | preserve accepted/checkpointed facts; affected timing/continuity interrupted only when actually lost | duplicate evidence or whole-product failure |
| Accessibility support | record actual support and equivalence; valid at actual condition, narrower/unknown only when capability changed | treat access need as failure, penalty, or diagnosis |
| Evaluator slow/out/unsupported dimension | pending or not_counted for dependent dimensions | zero score, guessed result, or whole-session block |
| Partner goes off scenario | interaction scope partial/not_counted; learner production may remain valid if defensible | blame learner for partner failure |
| Content rights takedown | future serving blocked; correctness evidence unchanged by default unless an explicit policy impact says otherwise | turn a rights fault into a learner failure |

## 7. Conditions, directness, and claim eligibility

### 7.1 Explicit condition dimensions

| Dimension | Required representation | Claim rule |
|---|---|---|
| Direct modality/lane | Reading, Language Elements, Listening, Writing, Speaking; recognition, production, interaction where applicable | No cross-skill relationship substitutes for direct evidence. Typed work never becomes Oral; monologue never proves interaction. |
| Assistance | Offered and used separately; type, phase, affected dimensions, answer-bearing classification | Offered-but-unused and post-response help do not weaken the original attempt. Used pre-response answer-bearing help narrows independence/Readiness eligibility. |
| Timing | open, practice, exam; target rule; actual elapsed; monotonic integrity; pauses/background/recovery | A timer label never substitutes for actual integrity. Missing/uncertain anchors narrow only timing/continuity claims. |
| Playback | target rule, allowed count, actual starts/completions/seeks/speed, failures | Extra replay or altered speed remains valid practice at actual conditions, not target Listening evidence. |
| Transcript/reference exposure | resource, phase, portion, decisive-answer exposure | Post-response repair does not change the original. Post-exposure attempts are exposed practice until a fresh family. |
| Freshness | family ID, prior exposure relation, family similarity decision, unseen basis | A different revision ID or reordered options cannot manufacture freshness. |
| Independence | episode, occasion, mock occasion, class, correlation reasons | Same-chain retry and one mock remain one occasion; delayed transfer/retention require a new occasion. |
| Target conditions | claimed profile and verified actual blueprint/timing/playback/reference/interaction rules | P4 is a condition, not a course level. A mismatch narrows only affected claim. |
| Accessibility | declared preference separately from actual support; equivalence status and evidence basis | Equivalent non-answer-bearing access preserves evidence. Unknown/changed capability narrows honestly; access itself never counts negatively. |
| Evaluator confidence | confidence per supported dimension plus limit/disagreement reason | Unsupported/low-confidence dimension is absent or pending, never zero. |
| Evidence role | learning, progression, transfer, retention, target estimate, mock, booking confirmation eligibility | One observation may be eligible for several projections without being counted twice inside a projection. |

### 7.2 Occasion classes and effects

| Class | Episode/occasion relation | Content requirement | Maximum claim |
|---|---|---|---|
| first_attempt | starts episode; one occasion | served family may be unseen or explicitly exposed | Direct evidence at actual conditions |
| immediate_retry | same episode and occasion after repair | fresh equivalent preferred; exposed original is repeated practice | Repair responsiveness / same-session transfer, never retention or independent consistency |
| delayed_transfer | new episode and occasion after time | fresh equivalent family | Transfer at actual lane/conditions |
| retention_check | new episode and occasion in later due window | fresh family and no answer exposure | Retention/stability at actual lane/conditions |
| repeated_exposed_practice | any later attempt with exposed/near-duplicate family | explicitly exposed | Learning/practice only; not fresh independent evidence |
| mock_measurement | one mock occasion shared by all included units | fresh approved form/families | Scoped P4/mock evidence; one correlated confidence occasion |

## 8. Version lineage and compatibility

### 8.1 Version lineage table

| Axis | Owner and captured reference | Why it travels | Compatibility/correction effect |
|---|---|---|---|
| Evidence envelope schema | Evidence & Capability; evidence_contract_version | Interpret immutable fields and validity semantics | Additive minor may be absent in old facts. Unknown consequential major quarantines dependent admission. |
| Client/API contract | Stage 12 owner; client_contract_version | Exhaustive state/reason/label rendering | Old supported minor gets adapter; unknown major returns upgrade_required/unavailable, never guessed mapping. |
| Target blueprint/pass rules | Measurement; blueprint_version | Defines current task, component, timing, playback, pass-line mapping | Material change rebuilds only target/readiness/mock/booking projections and revalidates affected P4 content; learning history remains. |
| Taxonomy/skill graph | Corpus Publication ACL + App mapping; taxonomy_version and node refs | Explains capability attribution | Rename preserves; merge deduplicates shared observations; split supplies reduced-confidence support and direct recheck; retire preserves history. |
| Content family/revision/media | Content & Forms; immutable IDs and content/media version | Freshness, exact served material, defect/rights lookup | Revision defect targets matching scopes; family defect may target family; rights removal may redact bytes without altering unaffected evidence. |
| Mock/form composition | Content/Measurement; form_version | Proves scope, correlation, freshness, target contract | Defective unit can partially invalidate; form-level flaw targets form. One corrected form is a new immutable version. |
| Rubric/answer key | Content/Measurement; rubric_version | Defines supported dimensions/outcome | Quarantine affected key/dimensions; append re-evaluation/correction; deterministic unrelated units remain. |
| Evaluator/model | Productive Evaluation; evaluator_release and adapter contract | Reproducibility, benchmark admission, provider exit | Quarantine release/dimension; re-evaluate only impacted candidates when payload retention permits, else Pending/new sample. |
| Prompt/template | Productive Evaluation/Content; prompt_template_version | Model result depends on exact prompt/rubric context | Bad prompt targets its candidate dimensions; never recompute objective evidence. |
| Calculation rules | Each projection owner; calculation_rules_version | Reproduce capability/Mistake/Progression/Readiness/gates | Build a new projection generation from unchanged facts; historical displayed snapshots remain linked. |
| Calibration parameters | Semantic owner + Operations governance; calibration_version, provenance, effective date, validation, rollback | Empirical thresholds must be explainable | New generation and shadow comparison; roll back version, never rewrite observation. |

Version identifiers are typed, not concatenated into one opaque release number. No active pointer retargets historical evidence. If lineage required for a consequential claim is missing or incompatible, that claim is absent/Pending; it never falls back to “latest” silently.

### 8.2 Projection lineage pseudotype

~~~text
ProjectionGeneration = {
  projection_id, learner_scope_id, projection_kind,
  source_cut: accepted_learner_sequence,
  observation_selector_digest,
  correction_set_digest,
  calculation_rules_version, calibration_version,
  blueprint_version?, taxonomy_version?,
  state, reasons, value_or_absence,
  computed_at, checksum, previous_validated_generation?
}
~~~

For any numeric component/overall estimate, value_or_absence is a discriminated union. Evidence building carries absence, not 0, NaN, an empty string later coerced to zero, or a hidden probability.

## 9. Idempotent ingestion and audit boundary

### 9.1 Idempotency and audit table

| Boundary/effect | Idempotency identity and checks | Append-audit record | Duplicate/conflict behavior |
|---|---|---|---|
| Checkpoint/attempt completion | learner_scope_id + operation_id + command_kind; payload hash; expected attempt version; terminal constraint | command acceptance, actual conditions, fact IDs, recorded sequence | Identical retry returns committed result; different payload is conflict; no second attempt/observation. |
| Deterministic objective observation | attempt terminal fact + observation kind/scope + rules version | acceptance policy, answer/rubric lineage, observation ID | Rebuild finds existing semantic effect; cannot emit duplicate independence. |
| Productive submission/job | attempt + submission operation; response checksum; unique job | pending observation/job refs and provider payload manifest | Reconnect returns original Pending; worker retry does not create another response. |
| Evaluator candidate/result | job_id + provider_result_id + provider release; candidate hash | raw-minimized candidate lineage, validation/rejection, terminal effect | Exact duplicate is no-op; conflicting duplicate quarantined; late result audited but cannot reapply. |
| Validity transition/correction | owner correction operation ID + target observation/assertion + impact hash | actor/purpose/reason/evidence, before/after scope, policy/contract versions | Exact retry returns assertion; conflicting reuse rejected. |
| Content quarantine/takedown | content-owner incident/version + immutable impact assertion | report, validation, serving effect, evidence-impact mode | Repeated command resumes missing tasks; cannot broaden scope silently. |
| Recompute request | projection kind + learner/scope selector + source cut + rules/calibration/target versions + correction-set digest | request cause, selector cardinality, before/current generation | Duplicate converges on same generation; newer cut supersedes, never overwrites. |
| Projection publication | generation ID + checksum + validated source cut | invariant/golden/shadow results and pointer switch | Only one current validated generation; failed candidate remains audit-visible. |
| Export/delete | Stage 05 operation identity and source cut | export manifest or deletion target receipt | Retry resumes same operation; deletion semantics supersede personal audit retention. |

Application idempotency means exactly-once semantic effect despite at-least-once transport. It does not claim that the network, queue, browser, or provider delivers exactly once.

### 9.2 Retry/reconnect sequence

~~~mermaid
sequenceDiagram
  participant B as Browser outbox
  participant A as Attempt owner
  participant E as Evidence owner
  participant J as Durable job
  B->>A: finalize(operation_id, payload_hash)
  A->>A: transaction: facts + terminal state + job
  A--xB: acknowledgement lost
  B->>A: same operation_id and payload_hash
  A-->>B: committed attempt/result refs
  J->>E: derive observation(effect identity)
  E->>E: insert once or return existing observation
  E-->>J: semantic effect complete
  Note over B,E: A new learner attempt requires a new deliberate operation ID; reconnect never creates one.
~~~

## 10. Correction, invalidation, quarantine, takedown, and recomputation

### 10.1 Impact assertion

Every incident becomes one append-only impact assertion owned by the domain that discovered/validated it and accepted by Evidence where learner evidence is affected.

~~~text
ImpactAssertion = {
  impact_id, incident_id, owner_context, actor_and_authorization,
  cause_kind: content_defect | media_defect | evaluator_release |
              rubric_or_prompt_defect | rights_takedown | taxonomy_change |
              blueprint_change | timer_or_platform_fault | manual_correction,
  selectors: observation_ids? + content_revision/family/form? + evaluator/rubric/prompt?
             + blueprint/taxonomy? + claim_dimensions + learner/source-cut bounds,
  impact_mode: serving_only | visibility_redaction | validity_change |
               target_mapping_change | reevaluation_required,
  requested_validity, affected_scope, reason,
  evidence_refs, effective_at, recorded_at, policy_and_contract_versions
}
~~~

Rights and correctness remain separate. A rights-only takedown normally uses serving_only or visibility_redaction: it blocks future display/removes prohibited bytes while keeping minimum permitted lineage and previously demonstrated capability. It changes validity only when an explicit reviewed policy says the evidence can no longer support the claim. A content defect, by contrast, targets the precise item/dimension/result made unfair. A blueprint change targets current target mapping, not historical language capability. An evaluator defect targets only supported dimensions produced by that release/prompt/rubric.

### 10.2 Targeted recomputation sequence

~~~mermaid
sequenceDiagram
  participant R as Report/monitor
  participant O as Content/Evaluator/Target owner
  participant E as Evidence & Capability
  participant P as Projection owners
  participant U as Learner/operator view
  R->>O: finding with exact version and evidence
  O->>O: validate; append impact; quarantine serving if needed
  O->>E: idempotent owner command + selectors + scope
  E->>E: resolve indexed observations; append validity assertions
  E-->>P: affected learner/scope + corrected source cut
  par Capability
    P->>P: shadow rebuild affected nodes only
  and Mistake/Review/Progression
    P->>P: remove/add only affected influence
  and Readiness/Mocks/Booking
    P->>P: rebuild dependent target scopes only
  end
  P->>P: prove 100% selected, 0 unaffected changed, invariants pass
  P-->>U: atomically publish current generation + before/after reason
  Note over O,U: Original attempt, observation, prior validity, and historical displayed conclusion remain auditable.
~~~

### 10.3 Scope rules

1. Start with exact observation IDs when known; otherwise use immutable version indexes and claim dimensions.
2. A selector declares expected cardinality or a reviewed bound. Empty/unexpected/excess results stop publication and raise an incident.
3. affected_scope and unaffected_scope are disjoint and cover the prior claim scope. Unknown scope quarantines the smallest defensible superset, never the whole learner by convenience.
4. Recompute only projection kinds that declare a dependency on the changed dimension/version.
5. Build a shadow generation, verify source cut, checksum, state invariants, Written/Oral independence, no missing-as-zero, and differential counts before switching.
6. Historical learner-visible snapshots keep “what was shown then,” rules/source lineage, and a link to the corrected current explanation. They are not silently rewritten.
7. If a response payload needed for re-evaluation was correctly deleted, do not fabricate a new result. Mark only the dependent dimension Pending/not_counted or request a fresh sample.
8. Learner deletion remains the Stage 05 privacy operation that removes personal history; append audit is not a reason to retain deleted personal data forever.

### 10.4 Representative impact matrix

| Change | Validity/evidence effect | Projections rebuilt | Unaffected preserved |
|---|---|---|---|
| One ambiguous objective item | item not_counted; containing observation partial if other units valid | capability nodes, mistake episode, relevant section/Readiness/mock | other items, skills, occasions, historical attempt |
| Broken audio asset | exact Listening units not_counted; continuity scope interrupted/partial if applicable | Listening/capability/Readiness/mock scopes | Written/other media/valid units |
| Evaluator release defect for Writing organization | affected dimension pending/not_counted or corrected | Writing capability/Mistake/Readiness and dependent gates | deterministic facts, other rubric dimensions if defensible, other skills |
| Content family discovered near-duplicate | freshness/independence eligibility corrected, not correctness | confidence/transfer/retention/consistency projections | raw result and non-independence learning value |
| Taxonomy node split | original evidence retained as reduced-confidence support; new children request direct checks | affected capability/weakness/progression rollups | unrelated nodes and occurrence facts |
| Target blueprint change | old P4 mapping suspended/reinterpreted | target Readiness/mock/booking plus affected content eligibility | historical capability and non-target practice |
| Rights takedown without correctness issue | serving blocked; bytes redacted when required; validity unchanged by default | serving/visibility views; learner projections only if policy explicitly requires | learner performance and all unrelated content |
| Manual accepted-answer correction | append corrected outcome/validity scope with operator audit | exact dependent projections | original submitted response and other dimensions |

## 11. State/API projection mapping for design labels

All mappings are produced by the owning server projection. The UI may format/order them but cannot infer or edit them. Unknown consequential enum/reason fails closed into an accessible unavailable/update-required state.

### 11.1 Evidence labels

| Learner label | Authoritative fields | Projection rule |
|---|---|---|
| With help | assistance_used contains answer-bearing/pre-response support affecting claim | Offered-but-unused does not produce this label. |
| On your own | no claim-affecting assistance used before submission | Post-response repair does not change original label. |
| Open timing | timing_mode = open | Not evidence of slow/fast performance. |
| Practice timing | timing_mode = practice and timer integrity described | Never called official timing. |
| Exam conditions | target_conditions_met for the named current blueprint/scope | Requires actual timing/playback/reference/interaction conditions, not requested mode alone. |
| Fresh task | exposure_class = unseen and family freshness accepted | Different revision alone is insufficient. |
| Seen before · practice only | repeated/exposed family or near-duplicate | Excluded from independence/Readiness consistency; useful learning may remain. |
| Waiting for evaluation | validity = pending for displayed scope | No placeholder score. |
| Interrupted · practice only | validity = interrupted for clean claim | Actual practice conditions remain available in Conditions. |
| Not counted · our fault | validity = not_counted with non-learner reason | Neutral/system family; never a low result. |

Max-three-visible is presentation only; the complete Conditions projection remains accessible and exportable.

### 11.2 Validity and Readiness projections

| API state | Required payload | UI meaning |
|---|---|---|
| valid | complete named scope, actual conditions, reason/explanation ref | Counts only under those conditions/eligibility rules |
| partially_valid | affected + unaffected scope, reasons | Only named unaffected parts count |
| pending | dependent scope, pending reason, next/status action | Unrelated coaching remains available |
| interrupted | affected continuous/clean claim, preserved practice scope | Practice only for lost condition |
| not_counted | non-learner reason, affected scope, replacement/recovery | “This wasn't you”; no penalty |
| evidence_building | estimate absent; missing direct units; smallest evidence action | Dashed empty track; no index/component number and never zero |
| not_ready | Stage 11 estimate/range/confidence/reasons when numeric eligibility exists | Named pass blocker; Written/Oral separate |
| borderline | discriminated reason: numeric band, range crossing, breadth, contradiction, or other authoritative reason | Amber plus exact reason; never a bool-only state |
| safe | estimate/range/confidence/breadth/blueprint and Bestehen-margin label | 60 official line and 65 current Bestehen calibration remain separate |
| ready_to_book | Stage 17 Gates A–F individually plus Readiness inputs | Gate over safe, not a higher score |
| stale_contradicted | historical milestone, current state/reason, smallest recheck | History remains true; current claim reopens |

No contract exposes a merged compensating Written/Oral value that can hide a failing component. An overall target-performance index, when Stage 11 permits it, is bottlenecked by the weaker component and is explicitly not probability.

## 12. Failure, recovery, security, privacy, rights, and accessibility

### 12.1 Failure and recovery rules

- A retry/reconnect uses the original operation ID until the learner deliberately starts a new attempt. Local outbox acknowledgment is not evidence creation.
- Pending has a bounded operational owner and age, but elapsed time cannot create learner failure. Dependent conclusions remain absent; the App continues deterministic/unrelated work.
- A local capability failure affects the smallest scope. A broken audio task does not block Reading; a Writing evaluator outage does not erase objective Written evidence.
- A last validated projection may remain visible with stale/rebuilding provenance when safe. If its continued display could mislead a consequential current claim, show the relevant state as Pending/stale instead.
- No automatic “best available score” picks the higher of duplicate/conflicting results. Conflict is explicit and requires owner resolution.

### 12.2 Security, privacy, and rights

| Boundary | Requirement |
|---|---|
| Learner authorization | Every command/read is authorized to App learner_scope_id; guest/account attachment preserves IDs. Provider/Corpus IDs are never authority. |
| Evaluator payload | Minimum task/rubric/response context and pseudonymous correlation only; no unrelated learner history. Raw audio remains an ephemeral object reference, not copied into ledger/audit/logs. |
| Audit access | Least-privilege roles; privileged reads/corrections record actor, purpose, scope, and result. Audit streams are not analytics payload warehouses. |
| Integrity | Payload hashes, immutable IDs, source cuts, constraints, and signed/reviewed releases detect substitution; secrets never enter evidence. |
| Rights | Rights status controls serving/bytes/export independently from authenticity, correctness, and learner performance. Takedown retains only permitted minimum lineage. |
| Export/delete | Export explains observations, conditions, versions, corrections, and current versus historical projections. Deletion follows Stage 05 live/provider/backup process and removes personal audit history. |
| Telemetry | Metrics use counts/latencies/version IDs and pseudonymous scope only where required; no raw answer/audio, disability diagnosis, or session replay. |

This is an architecture boundary, not a legal-compliance claim. Stage 23 and jurisdiction-specific owner/legal review must settle lawful basis, processor terms, exact retention wording, data-subject handling, and any future public/commercial duties.

### 12.3 Accessibility

- Record learner-declared preferences separately from actual support used on an attempt. Never infer a disability, diagnosis, or demographic proxy.
- Record an explicit equivalence assessment: equivalent, claim_narrowing, or unknown, with basis/version. Non-answer-bearing keyboard, screen-reader, text-size, non-color, and alternative input paths can preserve identical evidence when they test the same capability.
- When a support changes the tested capability—such as transcript access for Listening or typed substitution for Speaking—preserve access and make the narrower learning claim. Do not block the learner or mark failure.
- Timer hiding changes presentation, not timing. Practice-time extension is a condition. Standard P4 timing remains exact unless a later verified accommodation profile authorizes an equivalent target condition.
- Every status/condition projection includes accessible text before graphics. Color never owns meaning. The complete evidence table is available without hover/drag.

## 13. Operations, performance, reliability, and cost

### 13.1 Operational model

The launch implementation remains the accepted modular monolith: PostgreSQL append-oriented facts/assertions and projection generations, pg-boss durable jobs in the same database, and typed in-process owner modules. No event-streaming platform, analytics warehouse, service-per-context, or additional database is required.

Routine acceptance, validity, condition labeling, content-version lookup, projection policy, correction selection, and explanations are deterministic. Productive evaluation is already bounded elsewhere; Stage 06 adds no evaluator call. Recalculation is scoped by immutable indexes and runs in durable jobs. A shadow generation is published only after invariants pass.

### 13.2 Measures and release evidence

| Measure/gate | Required evidence / response |
|---|---|
| Duplicate semantic effect | Must remain zero in retry/reconnect/worker replay property tests; any duplicate blocks release and triggers correction audit. |
| Stuck Pending | Age/count by owner, dimension, evaluator release; notify/expire per later SLO without inventing outcome. |
| Correction selection | Expected vs actual affected cardinality; prove 100% intended observations selected and zero out-of-scope changes. |
| Recompute determinism | Same source cut + rules/version tuple yields same checksum/state. |
| Projection differential | Changed learner/scope/kind counts and invariant report before pointer switch. |
| Validity transitions | Exhaustive legal/illegal transition tests with actor/owner authorization and affected-scope partition. |
| Independence/freshness | Fixtures for immediate retry, delayed transfer, retention, exposed family, one-mock occasion, and near-duplicate family. |
| Version compatibility | Old supported facts, unknown major quarantine, taxonomy merge/split, blueprint change, evaluator rollback. |
| No probability/missing-as-zero | Schema/contract/event/template/static-copy and golden-response gates; evidence_building must omit numeric estimate. |
| Written/Oral/directness | Cross-skill fixtures prove no inference/compensation and actual modality conditions. |
| Accessibility/fault fairness | Device/access/media/evaluator matrix proves only affected scope changes and no negative learner evidence. |
| Audit/privacy | Authorized correction trace, minimum payload/log inspection, export explanation, learner deletion removing personal audit under Stage 05. |

Stage 25 owns executable gates. Stage 24 owns SLO/alert calibration and dashboards. Stage 26 owns release/runbook evidence. Stage 27 validates end-to-end scenarios.

### 13.3 Cost, fallback, exit, and upgrade triggers

| Cost/pressure | Default and cheaper fallback | Upgrade/substitution trigger and exit |
|---|---|---|
| Projection CPU/DB I/O | Targeted batch rebuilds, indexed selectors, coalesce jobs to newest source cut, keep last validated generation | If scoped rebuilds miss later SLO for seven consecutive days after indexing/batching/throttling, incrementally materialize hot projections or isolate worker connections. Facts/contracts remain portable PostgreSQL. |
| Audit/storage growth | Compact redundant operational payloads after retry horizon; retain authoritative observations/assertions and material projections until deletion; omit raw audio | If storage forecast reaches Stage 05 trigger or restore SLO misses, partition/prune rebuildable generations before resizing. Standard SQL/logical export is exit. |
| Incident blast radius | Exact version/scope selectors; conservative smallest-superset quarantine | If selector cannot meet 100%-affected/0-unaffected proof, improve lineage/indexing; do not buy a stream platform to mask missing semantics. |
| Job backlog | Durable pg-boss work, coalescing, bounded retries, dependent-only Pending | If job contention harms learner transactions for seven days after tuning, isolate queue/read workload behind existing port. Idempotency and source cuts survive provider migration. |
| Provider/evaluator change | Adapter fixtures and full candidate lineage; re-evaluate only affected retained payloads | Substitute when benchmark, terms, region, SLO, cost, or confidence fails. If payload is deleted, request fresh sample rather than reconstructing. |
| Event volume/analytics | Projection summaries and lean quality metrics; no per-click event stream/warehouse | Consider separate analytical storage only after measured reporting load cannot be met without harming learner truth, with one-way de-identified export and no semantic write path. |

There is no owner-approved fixed euro budget. Cost chooses among equivalent-quality mechanisms and never removes pass-critical Writing/Oral evidence, accessibility, historical auditability, correction, or honest Pending/absence.

## 14. Traceability and downstream handoff

| Decisions | Primary source trace | Downstream consumers |
|---|---|---|
| D01–D03 identities/envelope/fact boundary | final §§5–6, 19; app/03 §3.7–3.11; app/04 evidence model; app/05 episode model; Arch 04 §§3–11; Arch 05 §§5–8 | 07–12, 15–25, 27–28 |
| D04 validity | final §§5, 16, 19; app/07 failure rules; app/16 mock validity; app/27 §4 Rule 1; Design §§2.5/3.2/3.6 | 07–14, 16–25, 27–28 |
| D05 independence/freshness | final §§5–9, 11; app/05 recurrence; app/07 retry; app/14 retention; app/16 one-mock occasion; app/21 family freshness | 07–12, 15–18, 21, 24–25, 27–28 |
| D06 lineage | final §§5, 10–11, 14, 17, 19–20.5; app/04 taxonomy; app/15 target version; app/21 content; Arch 05 §8 | 07, 09–12, 19, 23–28 |
| D07 idempotency | final §§15–16, 19; app/26 recovery; Arch 05 §§6–9 | 08, 12, 17–21, 23–26, 28 |
| D08 correction/recompute | final §§5, 14, 19; app/21 defects/rights; app/24 versioned analysis; Arch 04 §§11–12; Arch 05 §§7–9 | 07, 09–12, 19, 23–28 |
| D09 projections/no probability | final §§3, 10–11, 17; app/15 §§1–6; app/17 gates; Design handoff §§1/3 | 11–15, 19–20, 22, 24–25, 27–28 |
| D10 operations/cost | final §§17–18; app/24/26; Arch 03/05; ADR-0002/7/12 | 12, 19, 23–28 |

### 14.1 Rules every downstream stage must preserve

1. One immutable attempt can support multiple observations, but correlation/occasion identity prevents confidence inflation.
2. Episode, independent occasion, mock occasion, and content family are independent axes. A new ID, revision, session, or delay alone does not prove independence/freshness.
3. Assistance offered/used, timing, playback, transcript/reference exposure, target/accessibility conditions, freshness, direct modality, and evaluator confidence remain explicit—not flattened into a weight.
4. Only Evidence & Capability accepts an observation/validity transition. Provider, Content, Operations, analytics, UI, and learner actions use owner commands.
5. Five validity states, affected scope, and authorized transitions are exhaustive. Faults never become learner failures.
6. Immediate retry, delayed transfer, retention, and independent mock confirmation remain distinct.
7. Every observation/projection carries complete typed lineage; missing/incompatible consequential lineage fails closed locally.
8. Retry/reconnect/provider redelivery has exactly one semantic effect. A new attempt is a deliberate new operation.
9. Correction/quarantine/takedown/blueprint changes append audit and rebuild only affected dependencies; history/unaffected scope survive.
10. Missing estimate is absence, never zero. There is no pass-probability field, model, event, copy template, generic carrier, or hidden calculation.
11. Written and Oral remain separate. Direct modality and actual target conditions cannot be substituted by relationship/inference.
12. Rights availability, authenticity, correctness, and learner performance remain separate axes.

### 14.2 Dependencies introduced or removed

Introduced only as logical dependencies: immutable owner-issued identities; typed version references; owner command authorization; indexed impact selectors; projection source cuts/checksums; and existing PostgreSQL/pg-boss idempotent processing. No service, library, provider, storage engine, event bus, warehouse, or infrastructure dependency is introduced.

Removed: feature-local evidence status, client-derived labels, provider-owned scores, timestamp-derived independence, global correction/rebuild by default, destructive validity edits, and any need to reserve a pass-probability field.

## 15. Risks, assumptions, and validation

| Risk/assumption | Evidence/test needed | Owner/fallback |
|---|---|---|
| Content-family assignment is too broad/narrow | Human/gold near-duplicate set plus learner exposure/transfer analysis | 09/21/24/25; conservative exposed classification and fresh task |
| Occasion policy inflates independence | Property/golden fixtures across retries, tabs, devices, sessions, mocks | 07/12/21/25; collapse to correlated occasion |
| Affected-scope selector misses facts | Seeded defect/evaluator/blueprint/taxonomy incidents with expected IDs | 09/11/19/25; stop publication and quarantine smallest superset |
| Projection replay is nondeterministic | Repeated same-cut checksum, shuffled input order, concurrent correction tests | 07/11/12/25; keep last validated generation/Pending |
| Evaluator confidence is poorly calibrated | Human agreement, repeatability, subgroup/access-condition checks, pass-gate flips, drift and cost | 17–19/24/25; lower confidence/Pending/fresh sample |
| Accessibility equivalence is unknown | Task-specific expert/learner/official evidence and identical-evidence alternate-path tests | 14/23/25; record actual condition and narrow claim |
| Rights takedown over-invalidates learner history | Rights/correctness impact fixtures and legal-policy review | 10/23/25; serving-only default, minimum permitted lineage |
| Old client maps unknown state incorrectly | Exhaustive contract-major and accessible unavailable/update-required tests | 12/13/25; preserve local outbox and fail closed |
| Audit becomes a privacy shadow store | Payload inventory, log inspection, export/delete rehearsal | 20/23/25/26; keep refs/hashes/minimum metadata, apply deletion |
| No-probability rule bypassed via copy/analytics/generic metadata | Repository/schema/API/event/template/static-copy scans and golden fixtures | 11/12/13/19/24/25; block release |

## 16. Intentionally deferred implementation choices

| Deferred choice | Fixed boundary | Named future owner |
|---|---|---|
| Exact table/column/index/partition names and payload serialization | Logical envelope, immutable identities, one owner, typed lineage, scope selectors | Stage 12; physical refinement under Stage 05 |
| Exact learner-facing evidence/readiness endpoint shapes and pagination | Exhaustive discriminated states, absent estimates, complete Conditions, no probability | Stages 11–13 |
| Exact independence/freshness windows and family-similarity algorithm | Semantic classes and conservative ambiguity behavior fixed | Stages 07/09/14/21; calibrate Stage 24 |
| Exact projection formulas/weights/calibration values | Directness/eligibility/version/source-cut and independent Written/Oral fixed | Stages 07 and 11; calibrate Stage 24 |
| Exact recompute batch size, job priority, locks, SLOs, alert thresholds | Idempotent targeted shadow rebuild and invariant gate fixed | Stages 12/24/26 |
| Exact provider candidate schemas and evaluator confidence floors | Minimum payload, supported dimensions, full release lineage, Pending/one escalation fixed | Stages 17–19/23–25 |
| Exact accessibility accommodation authority/equivalence profiles | Actual support recorded; equivalent/narrow/unknown; no penalty fixed | Stages 14/23/25 plus jurisdiction/exam review |
| Exact rights retention/redaction and legal wording | Rights separate; future serving block; minimum permitted lineage; no learner penalty fixed | Stages 10/23 plus jurisdiction-specific owner/legal review |
| Concrete operator UI/runbook and break-glass process | Owner commands, least privilege, append audit, reconciliation before trust fixed | Stages 23/26 |

No feature implementer may use a deferred mechanism to change evidence semantics, validity authority, scope, independence, history, directness, missing behavior, or the probability prohibition.

## 17. ADRs

- ADR-0013 — Immutable evidence envelope and append-audited validity, **Accepted**.
- ADR-0001 and ADR-0010–0012 remain Accepted and are refined, not superseded.

## 18. Decisions made and owner questions

ARCH-S06-D01 through ARCH-S06-D10 are Accepted. The architecture now defines immutable attempt/observation/assertion identities; episode, occasion, mock, and family independence; the complete evidence envelope; exact five-state validity and authorized transitions; explicit conditions; complete lineage; idempotent effects; append-audited targeted correction/recomputation; design/API projections; security/privacy/rights/accessibility behavior; and deterministic low-ops cost boundaries.

**Owner questions:** None.

## 19. Definition-of-done check

- [x] Current required sources, commits, and blob SHAs recorded; Stages 04–05 reconciled.
- [x] Source authority and Stage 27 precedence applied; design differences resolved without editing sources.
- [x] Immutable attempt/observation/validity identities, episode/content-family/occasion independence, provenance, and fact/projection boundary defined.
- [x] Five validity states, affected scope, legal transitions, authorized actors, and fault behavior defined.
- [x] Assistance, timing, playback, transcript/reference exposure, freshness, target/accessibility conditions, direct modality, and evaluator confidence explicit.
- [x] Blueprint, taxonomy, content, form, rubric, evaluator, prompt, calculation/calibration, and contract lineage complete.
- [x] Idempotent ingest/reconnect/provider result/correction/recompute and audit boundary complete.
- [x] Corrections, invalidation, quarantine, takedown, blueprint change, targeted recomputation, history, and unaffected scope complete.
- [x] Missing estimates are absence and pass probability is structurally forbidden.
- [x] Required evidence envelope, validity state machine, lineage table, correction/recompute diagrams, idempotency table, and design projection mapping included.
- [x] Alternatives, rationale, security/privacy/rights/accessibility, failure/recovery, operations, costs, fallbacks, exits, and upgrade triggers documented.
- [x] ADR-0013 Accepted; dependencies, risks/tests, downstream rules, and named deferrals complete.
- [x] No production code, schema, migration, deployable infrastructure, shaping/design source, earlier output, or later-stage artifact changed.

**Stage 06 result:** complete with no owner blocker. Stage 07 may consume this ledger without inventing evidence truth.
