# Bestehen / App — Reading and Language Elements Runtime

> **Stage:** 15 of 28  
> **Status:** Accepted architecture decision and implementation handoff  
> **Decision owner:** Reading R1–R3 and Language Elements SB1–SB2 runtime contracts, deterministic objective response/scoring, shared written-block execution, repair/retry integration, and defect-neutral correction  
> **Baseline:** m-elsharkawi/Bestehen-App@eee2803b724bd8c95693c7ad4f764c75e5ebeecc; m-elsharkawi/Bestehen-Shaping@9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc  
> **Scope:** Architecture and validation contracts only; no route, component, production code, configuration, content, product, or design artifact is implemented or changed

## 1. Purpose and scope

This stage turns the settled Reading and Language Elements product behavior into one deterministic objective-task runtime. It defines exact responsibility boundaries and explanatory contracts for Reading R1 global/heading matching, R2 detailed select, R3 situation-to-notice matching, SB1 contextual grammar cloze, and SB2 shared-bank lexical cloze. It preserves one shared five-skill attempt/result/repair foundation and gives Reading and Language Elements only their modality input-region extensions.

The runtime pins an approved immutable learner-safe form before an attempt; captures canonical responses independent of pointer, keyboard, or assistive technology; checkpoints work without creating evidence; finalizes one immutable original response and actual-condition record; scores reviewed objective keys without runtime AI; exposes decisive evidence only after the shaped submission point; and sends accepted facts to the Evidence owner. A later content defect appends a scoped validity correction and recomputes only affected projections. It never rewrites the learner response or turns a system/content fault into learner failure.

Reading and Language Elements share the current official written-block timing rule. The current accepted blueprint gives the combined block 90 minutes, but the number lives only in a versioned target release. No standalone official Language Elements limit is invented. Isolated practice may use a clearly labelled Bestehen practice target; only a verified combined block can establish the shared target-allocation condition.

This stage does not reopen task families, scoring weights, Readiness rules, P0–P4 behavior, content approval, freshness semantics, general API transport, frontend composition, browser support, or accessibility-equivalence policy. It does not choose widget libraries, persistence table shapes, a content authoring tool, or a commercial provider.

## 2. Inputs, authority, and continuity

All required inputs were fetched from GitHub main and read before deciding. The Stage 15 output and proposed ADR-0023 did not exist. The Stage 15 checklist contained exactly 24 open checks. Required Stages 06, 08, 09, 11, 12, 13, and 14 are present and consistent after the reconciliation in §2.2.

### 2.1 Reproducible source snapshot

| Repository / path | Commit or blob SHA | Stage-15 use |
|---|---|---|
| Bestehen-Shaping main | 9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc | Read-only shaping head |
| app/28-bestehen-app-product-specification.md | 18ae80cc2fd63cecd76c297c3e56d44a68367856 | Highest product authority and Stage-27 precedence |
| app/07-core-learning-loop.md | c313c859f64997972feca87497d70476c4528a20 | Attempt/diagnose/repair/retry/remember semantics |
| app/08-a1-to-b1-progression.md | 839a01c010cf79777520714d0ab09304a2ba9a06 | P0–P4, assistance fading, timing progression |
| app/09-reading-training.md | fcc41029a7dfc44a65feca0602b42c4fa40e53cf | R1–R3 mechanisms, decisive evidence, distractors, timing |
| app/10-language-elements-training.md | a5aac29a9cb4b84e2951fc64bf0b5f4b0d15e6bf | SB1/SB2, contextual cloze, shared timing, deterministic scoring |
| app/14-review-and-spaced-repetition.md | fa9b65e92cd1511e00e106a199eb6fbc06273a69 | Delayed fresh transfer and retention obligations |
| app/21-content-strategy.md | 8149d6a268da70e17cad46f774b9d5de77776986 | Reviewed variants, independent families, defect correction |
| app/26-platform-accessibility-nonfunctional.md | 8137091683941b0d55f3d4fb90af3c402b8371e5 | Responsive web, continuity, accessibility and fault neutrality |
| Bestehen-App accepted baseline | eee2803b724bd8c95693c7ad4f764c75e5ebeecc | Parent commit for Stage 15 |
| Architecture/00-architecture-shaping-plan.md | b263c5e7b3bccc0450ddd17aa0cc007432d672b7 | Invariants, naming, traceability, ADR rules |
| Bestehen_App_Architecture_Checklist.md | 689c72f849459c0198d4683241c6cda462d4464c | 24 Stage-15 checks initially open |
| Design/DESIGN-HANDOFF.md | 417a6820037e045e2dd9f29afc42b9f2e94fd638 | Shared shell, labels, diagnosis, accessibility summary |
| Design/Bestehen-01-Design-System.dc.html | d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a | Attempt/input/result/repair components and state models |
| Design/Bestehen-02-Mobile-Screens.dc.html | 0a9f2d3ea982c3197f399941b57defd9869d2428 | Reading attempt/diagnosis/repair/retry and shared shell |
| Design/Bestehen-04-Flows-Handoff.dc.html | 7120b05a2272c31e5896e4313a7007935f5d0aed | Flows B–C, keyboard and identical-evidence interaction |
| Architecture/06-evidence-ledger-validity-versioning-and-audit.md | 53d34ae65ef4c8fa79c00026f9bd5d7b876ce672 | Immutable occurrence/evidence, five validity states, correction |
| Architecture/08-coaching-engine-and-session-state-machines.md | 02c5e1ee5967bad976eda49ab4813a768eda5bd3 | Activity and canonical-loop orchestration |
| Architecture/09-content-exercise-form-and-media-architecture.md | e6fb121ab1b10c6cbcf692bc88acaf98f2e45e7a | Immutable forms, keys, learner-safe manifests, content families |
| Architecture/11-readiness-scoring-mocks-and-ready-to-book.md | 7c327cd770460b94107f2756e2b7d8f29c56b909 | R/SB weights, P4 eligibility, immutable original mock result |
| Architecture/12-api-contracts-jobs-events-and-idempotency.md | c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528 | Versioned commands/results, receipts, conflicts and jobs |
| Architecture/13-frontend-application-and-design-system-architecture.md | 7da94f122fa86412b0d1a12b84c123645693efb4 | AttemptShell, skill extension port, local-work boundary |
| Architecture/14-responsive-accessibility-browser-and-device-architecture.md | 362068924a6942eb955dcc132fb4c94da122597b | Capability admission and evidence-aware accessibility |
| Stage prompt | 163ff407f283b34a4d0598cc8d88c6f020a65dd3 | Exact Stage-15 execution contract |
| Architecture/adr/README.md | 11e8575714bab30928304b8c76112a5c11b60326 | ADR numbering and index convention |

### 2.2 Authority reconciliation and source issues

The applied order is final product specification → detailed App shaping → identity/overview → human-authored design → illustrative design runtime. Stage 27 remains binding: validity/fairness → direct evidence → independent Written/Oral risk → uncertainty resolution → due repair/retention → progression/coverage → preference.

No prior architecture decision is contradicted. Three wording/detail issues are resolved without editing their sources:

1. Design/Bestehen-02-Mobile-Screens.dc.html screen 2.5 says a fresh same-session retry is “the attempt that counts,” and labels it “Counts as evidence.” Product final §§5.2/6.2, app/07, app/14, Architecture/06 §7.2, and Architecture/11 §7.1 are more precise: it counts as immediate transfer/repair responsiveness, but remains the same episode and occasion and cannot provide independent Readiness consistency. This runtime returns a purpose-specific evidence role and never promotes immediate retry to an independent occasion. Stage 25 should validate revised learner copy that removes the ambiguity.
2. Design/Bestehen-04-Flows-Handoff.dc.html Flow B says a valid, unaided, fresh attempt may update a component estimate. Architecture/11 adds the authoritative eligibility requirements: direct current B1 target-mappable E3/E4 evidence, adequate evaluation/conditions, and unit breadth. The runtime supplies facts; Measurement alone decides whether an estimate changes.
3. Design/DESIGN-HANDOFF.md shortens the weakness lifecycle and describes four booking conditions. Stages 07, 11, and 13 already preserve the fuller lifecycle and Gates A–F. Stage 15 consumes those contracts and creates neither a second weakness state machine nor a booking shortcut.

The current official unit weights and 90-minute shared block were already verified and versioned by Stage 11. Stage 15 selects no mutable framework, provider, codec, browser, or commercial service, so no new external vendor research or pricing decision is required.

## 3. Architecture decisions

| ID | Recommended default and criteria | Credible alternatives and rejection | Consequence, fallback, review trigger | ADR |
|---|---|---|---|---|
| ARCH-S15-D01 | One immutable, versioned objective form graph covers R1–R3 and SB1–SB2 through closed task-family variants and a shared written-block contract. Criteria: target fidelity, one source of truth, audit, accessibility. | A: one bespoke payload per screen is simpler initially but forks scoring/repair and cannot pin forms. B: one generic arbitrary JSON tree is flexible but permits invalid mechanics and unsafe rendering. Chosen: stable kernel plus closed variants. | Unknown consequential family/major fails closed locally. Historical forms remain readable. Add a new family only by contract major and target/product review. | ADR-0023 |
| ARCH-S15-D02 | Pointer, keyboard, screen reader, switch, and optional drag all emit the same canonical response operations. Select-then-place is first-class for matching/bank placement. | A: drag pointer events as truth is visually direct but inaccessible and device-coupled. B: separate accessible widget/payload risks different evidence. Chosen: one canonical response model with several adapters. | Input method is an access condition, not a score. If an adapter cannot prove semantic identity, offer the canonical path and narrow/block only that adapter. Review on escaped response divergence. | ADR-0023; applies ADR-0022 |
| ARCH-S15-D03 | Session & Attempt pins one learner-safe manifest, checkpoints mutable working state, and accepts one immutable original submission with actual assistance/timing/exposure conditions. Result/repair exposure never rewrites it. | A: rescore mutable client state is easy but loses audit. B: freeze each question separately complicates navigation and measured-block submission. Chosen: checkpoint freely, finalize at the task/form boundary named by the manifest. | Unknown outcome is resolved by operation receipt. A deliberate later answer requires a new attempt. Review only if a verified target rule needs a different boundary. | ADR-0023 |
| ARCH-S15-D04 | Score every valid objective unit deterministically against the exact pinned reviewed key; keys/rationales stay server-only until shaped reveal. Blank on a deliberate valid final submission follows the pinned scoring rule; unsubmitted/interrupted blank is absence. | A: client scoring is fast/offline but leaks keys and drifts. B: runtime AI adjudication handles ambiguity but is nondeterministic, costly, and unfair. Chosen: server deterministic scorer plus cached safe result. | AI/Corpus outage cannot block scoring. Key disagreement quarantines the item. A local precheck may validate completeness but never authoritatively score. | ADR-0023; refines ADR-0016 |
| ARCH-S15-D05 | Store reviewed decisive spans/relations and distractor rationale in the key contract; after validity and outcome, derive the narrowest defensible cause and one repair plan. | A: score-only feedback is cheap but violates decisive-evidence-before-advice. B: generate explanations per click adds hallucination/cost. Chosen: reviewed metadata and deterministic template selection. | Missing/low-confidence attribution yields broad/unresolved cause, never an invented weakness. Fall back to correct answer plus decisive evidence and a broader fresh check. | ADR-0023 |
| ARCH-S15-D06 | Assistance is an append-only offered/used/phase/scope fact. Translation, word help, hint, timer display, and accessibility support each carry answer-bearing and tested-capability effects; offered-but-unused never weakens evidence. | A: one assisted boolean is simple but conflates availability and use. B: infer help from UI state is cheap but cannot audit actual conditions. Chosen: typed events and server-derived labels. | Post-submission help changes exposure for future attempts only. Unknown effect narrows the affected claim, never learner ability. Review when a support class cannot be represented. | ADR-0023; applies ADR-0013/0022 |
| ARCH-S15-D07 | Fresh retry requires another eligible content family with equivalent capability/difficulty; immediate retry remains the same episode/occasion; delayed return requires another fresh family and eligible occasion. | A: reorder options/reuse the item is cheap but rewards memory. B: generate per click improves apparent supply but bypasses QA. Chosen: approved inventory and honest transfer_pending when exhausted. | No fresh family yields broader reviewed practice or deferral, never counterfeit independence. Upgrade inventory only on measured exhaustion/coverage risk. | ADR-0023; applies ADR-0016 |
| ARCH-S15-D08 | A defect report creates a governed content review; confirmed ambiguity/defect appends exact-scope not_counted/partially_valid state, publishes a new-family replacement, and triggers targeted shadow recomputation. | A: silently edit the key is simple but rewrites history. B: invalidate the whole form/learner is conservative-looking but unfair and expensive. Chosen: smallest proven scope. | Original submission/outcome remains audit-visible; unaffected evidence survives. If exact scope is uncertain, quarantine the smallest defensible superset and keep dependent conclusions Pending. | ADR-0023; applies ADR-0013/0016 |
| ARCH-S15-D09 | Learner-safe content is a sanitized closed AST with no active markup, key, rationale, hidden target, restricted URL, or operator metadata. Corpus remains asynchronous and receives no learner data. | A: arbitrary HTML is author-friendly but creates XSS/key leakage. B: flatten to plain text is safest but cannot express evidence spans, gaps, and semantic groups accessibly. Chosen: closed typed content nodes. | Unsupported nodes block the exact task. Direct-use C1 rights/attribution render only when the action envelope permits; original C2/C3 is the normal path. | ADR-0023 |
| ARCH-S15-D10 | Operate the runtime inside the modular monolith using PostgreSQL facts, existing idempotent HTTP commands, local checkpoints, and durable targeted recomputation; zero runtime AI for ordinary attempts. | A: per-skill services/rule engine/event stream isolate code but add idle cost and drift. B: browser-only runtime is cheaper server-side but loses authority/recovery. Chosen: existing owners and ports. | No new provider or recurring AI cost. Split only after measured contention/security ownership; add paid content QA only on quality/inventory evidence. | ADR-0023 |

No owner question remains.

## 4. Components, modules, and responsibility ownership

~~~mermaid
flowchart LR
  CAT[Content and Forms<br/>approved immutable form + server key] --> MAN[Serving manifest<br/>learner-safe exact revisions]
  MAN --> ATT[Session and Attempt<br/>working response + checkpoint + submission]
  UI[Reading/LE input adapters] --> ATT
  ATT --> SCORE[Deterministic objective scorer]
  CAT --> SCORE
  SCORE --> EV[Evidence and Capability<br/>admission + five-state validity]
  EV --> LM[Capability/Mistake/Review]
  EV --> MEAS[Measurement/Readiness]
  CAT --> DEF[Content defect review]
  DEF --> EV
  EV --> UIX[Shared result/repair projection]
~~~

| Module / owner | Owns | Must not own |
|---|---|---|
| Content & Forms | TaskDefinition, immutable form/revision/family, key/rationale, approval, rights, accessibility, target mapping, quarantine/replacement | Learner response, evidence validity, weakness or Readiness |
| Session & Attempt | Attempt identity, pinned manifest, working response, checkpoint, navigation occurrence, assistance/exposure/timer facts, one immutable submission | Key authoring, cause, validity or final evidence eligibility |
| Objective Scoring policy inside Session/Evidence boundary | Pure keyed validation and unit outcome under exact versions | AI adjudication, content defect resolution, readiness weighting |
| Evidence & Capability | Accepted observation, five-state validity, affected scope, conditions, correction and recomputation request | Rewrite submitted response or current content |
| Mistake & Review | Cause lifecycle and delayed fresh obligations from accepted evidence | Score items or manufacture independent occasions |
| Measurement | R1–R3/SB1–SB2 eligibility/weights, Written projection, mock and booking state | Interpret browser input or compensate Written/Oral |
| Shared AttemptShell/Result/Repair UI | Render server-owned manifest/projections; canonical response adapters, focus, checkpoint status | Calculate score/validity/Readiness or reveal a key early |
| Reading extension | Reading text, select and matching presentation, evidence-span display after reveal | Fork shell/result/repair/evidence semantics |
| Language Elements extension | Connected cloze, option bank, select-then-place/reorder learning adapter | Invent a standalone official timer or infer productive mastery |
| Corpus integration | Asynchronous approved intelligence/bundles | Learner profile, response, weakness, schedule, runtime search or scoring |
| Operations/Governance | Release evidence, incident review and owner commands | Direct semantic-row edits or learner-score overrides |

## 5. Task, form, response, and scoring contracts

The following pseudotypes describe semantics, not production TypeScript, database tables, or arbitrary extensibility.

### 5.1 Form and shared-block contract

~~~text
ObjectiveForm {
  form_id
  form_revision_id
  form_family_id?
  target_blueprint_release_id
  task_definition_versions[]
  content_revision_ids[]
  content_family_ids[]
  item_ids[]
  key_revision_ids[]                 # server only
  approval_decision_id
  intended_role
  progression_profile
  block_contracts[]
  navigation_policy
  feedback_policy
  checkpoint_policy_ref
  rights_and_accessibility_manifest_refs[]
  digest
}

BlockContract =
  ObjectivePracticeBlock {
    block_id
    task_family
    timing_rule: open | practice_target(rule_ref)
    submission_boundary: item | cluster | task_set
    feedback_after_submission: immediate | block_end
  }
  | SharedWrittenTargetBlock {
    block_id
    covered_families: R1 + R2 + R3 + SB1 + SB2
    target_duration_rule_ref          # current approved value is 90 minutes
    clock_and_resume_policy_ref
    navigation_policy_from_blueprint
    submission_boundary: block
    feedback_after_submission: block_end
  }

Instruction {
  instruction_id
  locale
  safe_content_nodes[]
  response_mechanic
  help_policy
  learner_facing_timing_label
}

SafeContentNode =
  Paragraph | Heading | InlineText | Emphasis | Quote | List |
  EvidenceAnchorPlaceholder | ClozeAnchor | SemanticGroup
~~~

The target duration is never copied into a Language Elements task definition. Practice budgets are separate immutable strategy/calibration rules and are labelled Bestehen practice targets. Hiding a timer changes only presentation; it never pauses or changes the authoritative clock.

### 5.2 Closed task-family variants

~~~text
TaskFamily =
  R1HeadingMatching {
    texts: ReadingStimulus[]
    headings: Option[]
    match_constraints: MatchConstraint
    item_bindings: MatchItem[]
  }
  | R2DetailedSelect {
    stimulus: ReadingStimulus
    questions: SelectItem[]
  }
  | R3SituationNoticeMatching {
    situations: MatchPrompt[]
    notices: ReadingStimulus[]
    match_constraints: MatchConstraint
    no_match_option?: Option
    item_bindings: MatchItem[]
  }
  | SB1ContextualGrammarCloze {
    connected_text: ClozeStimulus
    gaps: LocalOptionGap[]             # target P4 currently has three choices per gap
  }
  | SB2SharedBankLexicalCloze {
    connected_text: ClozeStimulus
    gaps: BankGap[]
    candidate_bank: Option[]
    candidate_reuse_policy             # current target: at most once
  }

ReadingStimulus {
  stimulus_id
  safe_content_nodes[]
  language: de
  genre_domain_register
  evidence_anchor_ids[]                # not revealable before submission
}

Option {
  option_id
  learner_safe_label
  position_is_presentation_only
}

MatchConstraint {
  left_cardinality
  right_reuse_policy
  unmatched_policy
  completion_rule
}

ScorableItem {
  item_id
  response_kind
  primary_capability_refs[]
  optional_secondary_refs[]
  mapping_confidence
  key_revision_id
  scoring_policy_ref
}
~~~

Counts, candidate reuse, no-match behavior, navigation, and official point conversions are pinned from the verified target release. P0–P3 may use smaller or scaffolded variants only through a different explicit TaskDefinition/progression profile; they cannot be mislabeled P4.

### 5.3 Canonical response operations

~~~text
ResponseOperation =
  SetSelection(item_id, option_id)
  | ClearSelection(item_id)
  | SetMatch(item_id, left_id, right_id_or_no_match)
  | ClearMatch(item_id, left_id)
  | PlaceCandidate(item_id, gap_id, candidate_id)
  | RemoveCandidate(item_id, gap_id)
  | MoveCandidate(item_id, from_gap_id, to_gap_id)
  | ConfirmResponseBoundary(boundary_id)

WorkingResponse {
  attempt_id
  manifest_id
  base_resource_version
  checkpoint_sequence
  canonical_operations[]
  canonical_response_projection
  completeness_projection
  local_validation_issues[]
  canonical_hash
}

SubmittedObjectiveResponse {
  submission_id
  attempt_id
  manifest_id
  client_operation_id
  canonical_response_snapshot
  completeness
  actual_conditions_ref
  response_hash
  submitted_at
  accepted_resource_version
}
~~~

A drag adapter, pointer click, number-key shortcut, keyboard select-then-place sequence, screen-reader activation, and switch input call the same operation. DOM order, option order, and focus movement are presentation facts; semantic option/item IDs determine the response. Reordering options cannot change the keyed meaning or create a fresh family.

A checkpoint is mutable recoverable work, not evidence. It may be replaced by a higher accepted sequence. The submitted response is immutable. If the learner deliberately checks one item in ordinary practice and the key becomes exposed, changing the answer requires a new attempt/retry identity; the original outcome remains.

### 5.4 Key, decisive evidence, distractor, cause, and repair contract

~~~text
ObjectiveKeyRevision {
  key_revision_id
  item_id
  accepted_response_set
  response_cardinality
  scoring_policy_ref
  decisive_evidence_refs[]
  correct_rationale
  distractor_rationales[]
  intended_cause_mappings[]
  independent_validator_result_ref
  target_and_content_lineage
  approval_decision_id
}

DecisiveEvidenceRef {
  stimulus_id
  anchor_id
  safe_reveal_span_or_relation
  relation_kind:
    whole_text_gist | direct_span | cross_sentence_relation |
    constraint_set | cloze_context | candidate_bank_constraint
}

DistractorRationale {
  option_or_candidate_id
  why_plausible
  decisive_mismatch
  failure_family
  minimum_safe_feedback_key
}

CauseAssessment =
  supported(primary_cause, contributor?, confidence, evidence_refs)
  | unresolved(candidate_causes[], smallest_clarifier)
  | not_applicable

RepairPlan {
  cause_ref
  reviewed_explanation_key
  decisive_evidence_refs[]
  controlled_actions[]
  max_duration_policy_ref
  retry_requirement: fresh_equivalent | deferred_transfer | none
  exposure_effects[]
}
~~~

R1 decisive evidence may be the whole-text communicative purpose rather than a tiny quote. R2 normally uses the exact local/cross-sentence support. R3 uses the complete must-have constraint set and the first decisive mismatch. SB1/SB2 uses the local and, when required, wider connected-text context. A span is not exposed before finalization when it would leak the answer.

The result order is validity → immutable outcome/score → decisive evidence → why the chosen distractor fails → supported cause/confidence → smallest repair. If a cause cannot be isolated, the runtime returns unresolved and one clarifier; it never creates several weaknesses from one ambiguous item.

### 5.5 Deterministic scoring and original outcome

~~~text
OriginalObjectiveOutcome {
  outcome_id
  submission_id
  form_and_key_versions
  scored_at
  algorithm_version
  unit_outcomes[]
  task_rollups[]
  raw_official_conversion?             # only for current eligible P4/mock role
  response_and_condition_refs
  checksum
}

UnitOutcome =
  correct(item_id, canonical_response, key_ref)
  | incorrect(item_id, canonical_response, key_ref)
  | blank(item_id, key_ref)
  | structurally_invalid(item_id, issue_code)

CurrentObjectiveInterpretation {
  original_outcome_ref
  evidence_validity:
    valid | partially_valid | pending | interrupted | not_counted
  affected_scope[]
  unaffected_scope[]
  current_validity_assertion_ref
  eligibility_and_label_projection
  correction_or_rebuild_state?
}
~~~

Scoring is a pure function of canonical submitted response, exact pinned key, scoring policy, and algorithm version. It has no model call, random choice, learner history, coaching priority, Corpus query, UI ordering, or latest-key lookup.

Rules:

1. Validate manifest, response IDs, cardinality, candidate reuse, and key compatibility before scoring.
2. Compare canonical response to the exact accepted response set. Position is never identity.
3. A deliberate final submission of a valid scored item may retain blank and the pinned official/practice scoring policy may assign no point. An unsubmitted checkpoint, interrupted activity, lost response, or technical failure is absence/not_counted for the affected scope, not a wrong answer.
4. structurally_invalid is a system/content state awaiting interpretation, never learner failure.
5. Compute task raw accuracy and, only for an approved current P4/mock role, official unit conversion from the pinned blueprint. P0–P3 microtasks never display pseudo-official points.
6. Append the outcome once. Current validity and evidence eligibility are separate, replaceable interpretations.
7. Measurement alone applies R1/R2/R3 and SB1/SB2 weights, readiness eligibility, Written aggregation, ranges, confidence, and current target rules.
8. No probability field, event, hidden value, copy, extension map, or analytics dimension exists.

## 6. Runtime and scoring state models

### 6.1 Attempt runtime

~~~mermaid
stateDiagram-v2
  [*] --> AcquiringManifest
  AcquiringManifest --> Ready: exact eligible manifest pinned
  AcquiringManifest --> Unavailable: no eligible or compatible form
  Ready --> InProgress: attempt started
  InProgress --> InProgress: canonical response operation
  InProgress --> Checkpointed: checkpoint receipt accepted
  Checkpointed --> InProgress: continue or restore
  InProgress --> SubmissionUnknown: submit response timed out
  SubmissionUnknown --> Submitted: committed receipt found
  SubmissionUnknown --> InProgress: no receipt and safe same-operation retry
  InProgress --> Submitted: immutable submission accepted
  InProgress --> Interrupted: learner/system continuity lost before submit
  Submitted --> DeterministicScoring
  DeterministicScoring --> InterpretingEvidence: original outcome appended
  InterpretingEvidence --> ResultAvailable: current scoped validity published
  ResultAvailable --> Diagnose
  Diagnose --> Repair: coachable supported cause
  Diagnose --> Remember: correct or no responsible repair
  Repair --> FreshRetry: eligible fresh-equivalent family
  Repair --> TransferPending: no eligible fresh family or learner stops
  FreshRetry --> Remember: new attempt in same episode
  TransferPending --> Remember
  Remember --> [*]
  Unavailable --> [*]
  Interrupted --> Remember: preserve actual practice/checkpoint facts
~~~

Measured shared blocks set feedback_policy to block_end. They do not enter Diagnose/Repair until the block is finalized. Ordinary item/cluster feedback may expose a key at its manifest boundary; exposure freezes the original attempt and affects future freshness.

### 6.2 Scoring, validity, and correction

~~~mermaid
stateDiagram-v2
  [*] --> SubmittedOriginal
  SubmittedOriginal --> OriginalOutcome: deterministic exact-key score
  OriginalOutcome --> Valid: complete supported scope
  OriginalOutcome --> PartiallyValid: unaffected scope supported
  OriginalOutcome --> Pending: content/integrity interpretation outstanding
  OriginalOutcome --> Interrupted: clean continuity lost
  OriginalOutcome --> NotCounted: non-learner fault
  Valid --> Pending: audited defect review
  Valid --> PartiallyValid: scoped correction
  Valid --> NotCounted: confirmed unfair item
  PartiallyValid --> Pending: remaining scope reviewed
  Pending --> Valid: support confirmed
  Pending --> PartiallyValid: unaffected scope confirmed
  Pending --> NotCounted: defect confirmed
  Interrupted --> PartiallyValid: unaffected units admitted
  Interrupted --> NotCounted: no defensible affected scope
  NotCounted --> Pending: audited classification reopened
~~~

The five validity states are exactly valid, partially_valid, pending, interrupted, and not_counted. Correctness is not a validity state. No elapsed timer or operator edit promotes a state. A replacement is a new attempt and never changes the old state/outcome.

## 7. Interaction and accessibility equivalence

### 7.1 Equivalence table

| Mechanic | Pointer/touch path | Keyboard and assistive path | Canonical response | Focus/semantic contract | Evidence effect |
|---|---|---|---|---|---|
| R2/SB1 select | Activate labelled option row | Native radio group; Tab enters group, arrows or visible option controls select; optional guarded 1–4/a–d | SetSelection(item, option) | fieldset/group label includes question/gap; selected state programmatic | Identical when tested content/support unchanged |
| R1/R3 matching | Optional drag or tap source then destination | Required select-then-place: choose prompt, then choose destination/no-match; status text confirms mapping | SetMatch(item, left, right) | Each side has accessible name; completed pair is revisitable/removable; no spatial-only instruction | Identical; drag telemetry never changes score |
| SB2 shared bank | Optional drag candidate into gap or tap pair | Required select candidate then place in named gap; candidate availability/used state announced on action, not every focus | PlaceCandidate / MoveCandidate / RemoveCandidate | Connected text remains readable in DOM order; gap has context label; bank constraints are text | Identical; same reuse validation |
| Cloze gap review | Tap gap and select option | Focus gap button/combobox-like owned primitive, open labelled option group, Escape closes, focus returns | SetSelection or PlaceCandidate | No ARIA recreation when native controls suffice; language de on text, UI locale on controls | Identical |
| Clear/change before submission | Activate selected item/gap | Visible Remove/Change control; Delete/Backspace shortcut optional only when scoped | ClearSelection/ClearMatch/RemoveCandidate | Change announced politely only when needed; no error until validation boundary | No evidence until submit |
| Evidence-span inspection after submit | Tap/highlight relation | Focusable Decisive evidence disclosure; source quote and relation text in reading order | No response mutation; RecordExposure if materially revealing | Color/mark is supplementary; exact words/constraint stated | Original outcome unchanged; later family exposure recorded |
| Timer hide | Hide timer control | Same labelled button and optional guarded T | presentation event only | Clock continues; no ticks announced | Timing unchanged/equivalent |
| Zoom/reflow/forced colors | Browser/OS controls | Same | No response change | 200% zoom, 320 px reflow, 44×44 targets, non-color status | Equivalent |
| Screen reader for UI/instructions | Explore/activate semantic controls | Same | Same canonical operation | German stimulus lang=de; UI instructions labelled | Equivalent if tested Reading stimulus is unchanged |
| TTS/screen reader reading tested Reading content | Device support | Same | Response can still be captured | Support allowed | altering/unverified for standard visual-reading claim per Stage 14; never failure |

Every action has a visible focusable control. Optional shortcuts yield to editors, native controls, browser/AT bindings, IME composition, modifiers, and defaultPrevented. Result announcements are sparse; timer ticks, selection movement, and each cloze-bank focus change are not live-announced.

### 7.2 Navigation and shell behavior

- Focused AttemptShell hides primary navigation and retains one title, fixed Conditions row, timer presentation, task region, progress, and one dominant submission/navigation action.
- DOM/focus order is conditions → instruction/stimulus → current question/gap → options/bank → action. Step change focuses the first new meaningful heading/question, never page top.
- Reading text remains no wider than 720 px and uses lang=de and hyphens:auto. At narrow widths, source precedes response; wide layouts may show them together without changing DOM order.
- R1/R3 matching and SB2 placement preserve all pair/gap state in a text/list representation; visual lines or spatial proximity are never the only relationship.
- Errors identify the exact item/gap and repair action, focus the error summary then first invalid control only at a shaped validation boundary, and never erase valid selections.
- Result, RepairCard, FreshCheckBanner, WhatChangedSummary, EvidenceLabel, validity, conflict, and failure components are shared with all five skills.

## 8. Shared-shell extension map

| Shared foundation surface | Shared owner and contract | Reading extension | Language Elements extension | Forbidden fork |
|---|---|---|---|---|
| Observe/header | AttemptShell renders task family, conditions, allowed help, block timing | R1/R2/R3 title and strategy purpose | SB1/SB2 title and contextual-choice purpose | Separate skill header/timer/condition rules |
| Stimulus | Closed SafeContentNode renderer, language and measure | ReadingTextPane with text/notice groups/headings | ClozeTextPane with connected text and gap anchors | Arbitrary HTML or separate token system |
| Input | SkillInputRegion canonical operation port | select and MatchPair adapter | local-option gap and shared-bank PlaceCandidate adapter | Pointer-only or skill-owned evidence |
| Navigation | Pinned form navigation policy and checkpoint | question/text navigation | gap/bank navigation | Client invented official sequence |
| Timing | shared BlockClock and labels | Reading pace facts | Language Elements pace facts | standalone official LE timer |
| Checkpoint | shared local-work/outbox receipt protocol | canonical selections/matches | canonical gaps/bank placements | localStorage or skill-specific conflict policy |
| Submission | shared immutable command/receipt | objective task or shared-block response | objective task or shared-block response | client score, mutable resubmit |
| Result/diagnose | shared validity/result/decisive evidence/cause | text spans, constraint/distractor rationale | cloze context, candidate/grammar rationale | advice before evidence |
| Repair | shared RepairCard/exposure | reading strategy/language repair adapter | connector/case/word-order/lexical repair adapter | whole lesson or per-click model |
| Retry/Remember | shared fresh-family and episode contract | equivalent fresh R task | equivalent fresh SB task | same-item/reordered freshness |

## 9. Assistance, exposure, timing, and validity

### 9.1 Assistance fact

~~~text
AssistanceEvent {
  assistance_event_id
  attempt_id
  kind:
    instruction_example | vocabulary_preview | word_help | phrase_translation |
    sentence_explanation | full_translation | strategy_cue |
    evidence_location | answer_narrowing | accessibility_support
  state: offered | used
  phase: before_response | during_response | after_submission | repair
  affected_scope[]
  answer_bearing: yes | no | uncertain
  tested_capability_effect: equivalent | altering | unverified | not_applicable
  occurred_at
  policy_version
}
~~~

Offered and used are separate facts. The client cannot derive an evidence label from whether a help button was visible. A failed help request is a technical fact, not used help. Post-submission help never changes the original attempt but may expose the family/answer path for later attempts.

### 9.2 Assistance/exposure/validity matrix

| Condition | Original response validity | Learning/transfer meaning | Readiness/independence effect | Learner label / next action |
|---|---|---|---|---|
| Help offered, unused | unchanged | Full result at actual other conditions | No assistance weakening | On your own |
| Non-answer-bearing instruction/example before attempt | valid when task remains fair | Supported learning where shaped | Usually P0/P1/support condition; target claim follows manifest | With help only if used and claim-affecting |
| Word help/translation used before submit, nondecisive scope | valid at assisted condition | Useful direct task evidence; exact scope recorded | Affected scope not clean unassisted E3/E4 | With help; later fresh unassisted check |
| Decisive word/answer-narrowing/evidence-location help used | valid assisted learning | May support route/repair | Answer-bearing affected item excluded from independent Readiness | With help; fresh family required |
| Full translation/model/key after submission | original unchanged | Repair exposure | Same family subsequent attempt exposed; no retroactive change | Original labels retained; Seen before thereafter |
| Hint offered but request fails technically | original unchanged | No assistance received | No assistance weakening | Neutral technical recovery |
| Open timing | valid at open condition | Comprehension/strategy learning | No target pace claim | Open timing |
| Practice timer, over target | valid if uninterrupted | Accuracy remains; pace condition weak/over | Not official timing | Practice timing; pacing action if pattern |
| Shared target block, timer hidden | valid if clock/integrity hold | Same target execution | Equivalent | Exam conditions when every other rule passes |
| Practice timer extended/paused | valid practice | Useful at actual condition | Not clean shared target timing | Practice timing |
| Immediate fresh retry | valid if fair | Same-session transfer/responsiveness | Same episode/occasion; not independent consistency | Fresh task; transfer role |
| Delayed fresh check | valid if fair | Retention/transfer | New eligible occasion only when Stage 06 rules pass | Fresh task |
| Same/reordered/near-duplicate family | valid exposed practice | Learning/rehearsal | Not fresh/independent | Seen before · practice only |
| Keyboard/select-then-place | valid | Same capability | Equivalent | No assistance label |
| Accessibility support changes tested Reading modality | valid practice | Useful supported work | Standard claim narrowed/unverified | Exact condition; original gap remains |
| Confirmed ambiguous/defective item | affected scope not_counted; remaining scope partial/valid | No learner-negative meaning | Remove affected capability/Readiness influence | Not counted · our fault; replacement |
| Review of possible defect | affected dependency pending where required | Unaffected work continues | Dependent conclusion waits, never zero | Waiting for review; safe alternatives |

Only the Evidence owner sets valid, partially_valid, pending, interrupted, or not_counted. The UI renders a read-only projection.

## 10. Main flows

### 10.1 Ordinary objective task

1. Coaching selects an approved task intent under Stage-27 precedence.
2. Content & Forms acquires an exact fresh/allowed manifest for the requested role and actual support policy.
3. Session & Attempt creates the attempt with an idempotent operation and pins manifest, conditions, content family, key lineage, timing and submission boundary.
4. The extension renders only learner-safe nodes and produces canonical response operations. Each meaningful change checkpoints locally and, as promised by the activity, to the server.
5. A help/reveal action appends offered/used/phase/scope and exposure facts.
6. Final submit freezes the canonical response and actual conditions. A lost response is resolved by the operation receipt.
7. The server deterministically validates and scores the exact key. Content/key incompatibility does not become wrong.
8. Evidence accepts the scoped observation and five-state validity. The result shell displays validity/outcome, then decisive evidence, rationale, cause and repair.
9. Repair exposure appends facts; a fresh-equivalent retry creates a new attempt in the same episode.
10. Remember publishes current learning consequences and delayed obligation. Measurement independently decides whether any E3/E4 unit can influence Readiness.

### 10.2 Shared Reading + Language Elements measured block

1. Measurement/Session preflight verifies exact current P4 form, full learner-unseen families, clock/checkpoint integrity, target rule, content/assets and admission receipt.
2. One SharedWrittenTargetBlock pins R1–R3 and SB1–SB2 to the current blueprint and target duration rule. No standalone LE official clock exists.
3. Learner navigation follows the pinned block policy. The clock is monotonic/authoritative under Stages 14/21; timer display may hide.
4. No answer-bearing help, key, rationale, correctness, diagnosis, or repair is revealed during the block.
5. Checkpoints preserve all canonical responses and actual visibility/connectivity/interruption facts.
6. Finalization accepts one immutable block response and scores objective units deterministically.
7. Evidence validates exact scopes. A defective item may make the containing observation partially_valid; a continuity failure may preserve item results but remove the clean whole-block allocation claim.
8. Measurement applies official R1/R2/R3/SB1/SB2 units and immutable mock/readiness rules. Post-block repair uses new attempts/families and cannot change the original block result.

### 10.3 Fresh repair and delayed return

~~~mermaid
sequenceDiagram
  participant R as Result and repair shell
  participant C as Content and Forms
  participant A as Session and Attempt
  participant E as Evidence
  participant V as Mistake and Review

  R->>C: request equivalent family excluding exposed families
  alt eligible fresh family
    C-->>A: pinned fresh manifest
    A-->>R: start retry in same coaching episode
    R->>A: submit canonical response
    A->>E: original outcome + actual conditions
    E->>V: immediate-transfer observation, same occasion
    V-->>R: responsive / unresolved and delayed obligation
  else no eligible family
    C-->>R: unavailable_no_fresh_family
    R->>V: transfer_pending obligation
    R-->>R: broader reviewed practice or defer
  end
  Note over R,V: Delayed return later requires another fresh family and eligible independent occasion.
~~~

## 11. Defect, invalidation, replacement, and recalculation

### 11.1 Defect report contract

A learner may report unclear content after or during an attempt without having to justify the answer. Report input is minimal: exact manifest/item reference, allow-listed category, optional bounded learner note, client operation ID, and current resource version. It cannot set defect status, key, validity, score, or compensation.

The report immediately acknowledges ownership and preserves work. A credible automated integrity failure can quarantine at once; semantic ambiguity requires authorized review against the exact frozen stimulus/key/rationale. Reporter identity is not sent to Corpus. Notes are treated as untrusted learner data and excluded from routine logs/content-generation training.

### 11.2 Defect/invalidation sequence

~~~mermaid
sequenceDiagram
  actor L as Learner
  participant UI as Shared result/attempt shell
  participant CF as Content and Forms
  participant EV as Evidence and Capability
  participant PJ as Projection jobs
  participant MS as Measurement/Mistake/Review

  L->>UI: Report unclear item
  UI->>CF: ReportContentProblem(operation, manifest, item, category)
  CF-->>UI: receipt; work preserved; no learner fault
  CF->>CF: review frozen stimulus/key/rationale/rights/render
  alt report not confirmed
    CF-->>UI: reviewed disposition; original facts unchanged
  else defect confirmed
    CF->>CF: quarantine exact item/revision/form role; append impact assertion
    CF->>EV: owner command with exact selectors and affected scope
    EV->>EV: append pending/partial/not_counted validity assertion
    EV->>PJ: enqueue idempotent targeted shadow generations
    par capability and weakness
      PJ->>MS: remove affected influence only
    and readiness and mock
      PJ->>MS: recompute dependent R/SB/Written/gates only
    end
    PJ->>PJ: prove selected count, unaffected checksum, invariants
    PJ-->>UI: publish corrected current result + explanation
    CF-->>UI: replacement_ready with different eligible family
  end
~~~

Rules:

- The original response and OriginalObjectiveOutcome are never edited or deleted to hide the issue.
- Confirmed ambiguity/unfairness makes the exact item not_counted. If other units remain defensible, they are named unaffected and may contribute through partially_valid.
- A rights-only withdrawal stops display/cache according to policy but does not automatically negate demonstrated capability.
- A blueprint change removes current-target/P4 eligibility where required but preserves transferable historical capability.
- Replacement uses another eligible family and a new attempt. It is not a penalty, mandatory redo, failure recurrence, or repair proof.
- If the learner payload required for a new interpretation was validly deleted, the system does not reconstruct it; the dependent claim becomes absent/Pending or requests a fresh sample.
- Unexpected selector cardinality or any unaffected projection change stops publication and raises an operations incident.

## 12. Data, API, state, compatibility, and versioning

### 12.1 Persisted facts versus derived projections

| Persisted immutable fact/assertion | Replaceable projection |
|---|---|
| Pinned form/content/item/key revisions and serving manifest | Learner-safe current task view |
| Canonical response operations at accepted checkpoint cuts | Working completeness/error projection |
| One submitted response, actual conditions and operation receipt | Current result view |
| Original deterministic objective outcome | Evidence validity/eligibility interpretation |
| Assistance offered/used and phase; exposure events | Evidence labels and independence eligibility |
| Attempt/episode/occasion/content-family relations | Transfer, recurrence, freshness and confidence |
| Content defect report/review/impact assertion | Current content availability/replacement |
| Validity assertion history and correction source cut | Capability, Mistake, Review, Readiness, mock and booking generations |

### 12.2 Boundary operations

Stage 12 owns HTTP syntax; Stage 15 fixes semantics for these existing operation families:

| Operation | Owner | Required input/precondition | Result |
|---|---|---|---|
| AcquireServingManifest | Content & Forms | task intent/role, family exclusions, actual condition requirements, source cut | available exact learner-safe manifest or typed unavailable |
| CreateObjectiveAttempt | Session & Attempt | manifest, plan/activity, operation ID, expected version | immutable attempt and initial working projection |
| CheckpointObjectiveResponse | Session & Attempt | canonical response hash, monotonic sequence, expected version | receipt, conflict, or local unavailable scope |
| RecordAssistance/Exposure | Session & Attempt | exact assistance/reveal semantic ID and phase | immutable fact receipt |
| SubmitObjectiveAttempt | Session & Attempt | canonical snapshot/hash, actual conditions, operation ID/version | completed original outcome or typed unknown/conflict/unavailable |
| GetObjectiveResult | Evidence projection | attempt/source cut/contract major | current five-state scoped result, labels, decisive evidence reveal |
| ReportContentProblem | Content & Forms | item/manifest/category, optional bounded note, operation/version | governed review receipt; never validity directly |
| RequestFreshEquivalent | Content & Forms | cause/capability/role plus family exclusions | replacement manifest or unavailable_no_fresh_family |
| ApplyContentImpact | Evidence internal owner command | accepted impact assertion/selectors/scope | validity assertions + recompute receipts |

Same operation ID/same canonical hash returns the committed receipt. Same ID/different semantic payload conflicts. An unknown contract major, task family, response operation, key meaning, validity state, or target rule fails closed for the affected activity; unrelated routes remain.

### 12.3 Version axes

Every outcome/replay keeps:

- objective-runtime contract major/minor;
- client/design contract version;
- target blueprint release;
- task-definition version;
- form/content/family/item revisions;
- key/scoring algorithm versions;
- approval/rights/accessibility versions;
- assistance/exposure policy;
- timer/checkpoint policy;
- taxonomy/capability mapping;
- evidence calculation and calibration versions;
- defect/correction source cut.

Additive presentation metadata may be minor-compatible. Changing response meaning/cardinality, family mechanics, official block rules, key semantics, accessibility evidence effect, or a required state is a major/new immutable release. Historical facts never use latest implicitly.

## 13. Failure, recovery, and uncertainty

| Failure/edge | Runtime behavior | Evidence and recovery |
|---|---|---|
| Network loss before manifest/start | Exact task unavailable; other work remains | No attempt/evidence; retry or choose available activity |
| Fully loaded objective practice loses network | Continue locally when promised checkpoint/integrity remains | Sync same operations idempotently; no automatic invalidation |
| Clean shared block loses network | Continue only if preauthorized form, clock and checkpoint facts remain trustworthy | Network alone need not invalidate; uncertain continuity narrows exact claim |
| Local checkpoint fails | Preserve in memory; attempt server checkpoint and state exact durability | Low-risk work may continue with truthful warning; clean high-stakes admission/recovery follows Stage 14/21 |
| Submit response times out | Show work preserved/outcome unknown; query receipt | Retry same operation/hash only if no committed receipt |
| Same checkpoint sequence diverges across devices | Conflict preserves both branches | Learner resolves before submit; no last-write-wins |
| Client render/input exception | Error boundary preserves checkpoint and correlation | Server interprets recorded facts; no local not_counted guess |
| Unsupported task/response contract | Update-required for exact task | No guessed mapping/score; other skills/routes continue |
| Key/content version mismatch | Do not score against latest; hold exact scope | Pending/system issue, quarantine if defect; never wrong |
| Multiple defensible answers | Quarantine/review exact item | not_counted if confirmed; unaffected scope preserved |
| Learner intentionally submits blank in a valid form | Preserve blank response | Pinned scored-form policy applies; not confused with technical absence |
| Attempt interrupted before submit | Preserve checkpoint/exposure and actual conditions | Unanswered scope absent; resume as practice or fresh task |
| Help unavailable after request | Neutral local failure | No used-help fact; original evidence conditions unchanged |
| No fresh retry inventory | Say product content gap | transfer_pending; broader reviewed task or delayed return |
| Target blueprint changes | Stop obsolete P4 serving; retain old lineage | Current target claim absent/stale until compatible fresh evidence; never zero |
| Correction job delayed | Last validated unaffected projections remain | Dependent exact scope Pending/rebuilding; durable retry |
| Corpus or AI unavailable | No effect on ordinary served objective task | Deterministic score/explanations and cached bank continue |

## 14. Security, privacy, rights, and accessibility implications

### 14.1 Security and answer integrity

- The learner payload contains only instructions, sanitized safe content, option labels, response constraints, accessible relations, and permitted metadata. It contains no key, correct flag, decisive anchor coordinates that reveal the answer, distractor rationale, hidden scoring weight, operator note, restricted source URL, or unpublished target mapping.
- The server authorizes the exact manifest and scores against the pinned server key. Client-side completeness checking cannot decide correctness.
- Closed SafeContentNode rendering rejects scripts, handlers, style injection, active embeds, arbitrary SVG/HTML, external tracking resources and prompt-like authoring instructions. Sanitization and schema validation happen before publication and again at the boundary as defense in depth.
- IDs are opaque and authorization is learner/guest/object scoped. Guessing another item/attempt/result cannot reveal content, response, key or account existence.
- Reports/notes are untrusted, bounded and separated from rendered task content. Routine telemetry contains codes, counts, versions, timing classes and opaque IDs—not German stimulus, answer, selected text, learner note or restricted source expression.
- Rate/resource limits preserve local work and return typed retry behavior; they never silently discard or duplicate a submission.

### 14.2 Privacy and Corpus boundary

Account-optional first use uses the same semantic contracts under an unguessable guest scope. Objective attempts need no third-party provider and no per-click AI payload. Corpus receives no learner identifier, response, exposure history, weakness, assistance, schedule or profile. App uses only asynchronously imported approved bundles/content. Export/deletion later includes/removes response, evidence and correction history under Stage 20/23; append audit is not a pretext for indefinite personal retention.

### 14.3 Rights

C0 remains reference-only. C1 direct-use content is rendered only when the exact action/territory/attribution/cache conditions are satisfied and key leakage is avoided. C2/C3 original reviewed content is the ordinary path. A rights withdrawal stops future serving/cache and applies the explicit disposition; rights and correctness remain separate. This architecture claims no jurisdiction-specific legal compliance. Stage 23 owns threat/legal review.

### 14.4 Accessibility

The release gate covers keyboard-only and assistive-technology completion for R1/R2/R3/SB1/SB2; pointer/keyboard response equality; select-then-place alternatives; German language/reading order; labelled gaps/groups/errors; 44×44 targets; 200% zoom; 320 px reflow; forced colors; timer hiding; focus not obscured; and sparse announcements. Equivalent access receives identical evidence. Altering/unverified support narrows only the tested claim and always remains available for learning.

## 15. Performance, reliability, operations, and cost

### 15.1 Runtime posture

- One learner-safe form fetch and existing same-origin API boundary; immutable manifests permit ordinary browser/CDN caching only as rights policy allows.
- Canonical response updates are local and immediate. Checkpoints batch only within the shaped loss/recovery bound and preserve monotonic sequence; exact Stage-21 interval implementation remains deferred.
- Deterministic scoring is linear in submitted units and must not call Corpus, AI, an analytics warehouse, or a commercial rules service.
- Result templates and reviewed explanations are precomputed/cached metadata. Only selected decisive/distractor details are projected after submission.
- Defect correction uses indexed exact selectors, durable idempotent jobs, shadow generations and atomic publication.
- No special Reading/LE deployment, database, queue, object store, websocket, stream platform, or service is introduced.

### 15.2 Operational measures and alerts

Measure without raw task/response text:

- manifest acquisition success/unavailable reasons and fresh-family exhaustion by task/role;
- checkpoint receipt latency/failure/conflict and submission unknown-outcome recovery;
- scoring duration, deterministic replay checksum mismatch, structural/key incompatibility;
- response-adapter canonical divergence across pointer/keyboard/AT fixtures;
- help offered/used event loss or phase inconsistency;
- defect report rate, confirmed ambiguity rate, time to quarantine/replacement;
- impact selector expected/actual counts, unaffected projection checksum changes, recomputation lag/failure;
- keyboard/screen-reader/zoom/reflow release results and escaped objective-task accessibility defects;
- per accepted content artifact authoring/validation/human-review cost, not per learner click.

Release-blocking invariants include no client key, one original submission, deterministic replay equality, exactly five validity states, no learner-negative technical/content result, no duplicate episode/occasion from retry, no missing-as-zero, no Written/Oral compensation, no probability semantics, and no standalone official LE timer.

### 15.3 Cost, fallback, exit, and upgrade triggers

The launch runtime has near-zero variable compute beyond existing HTTP/PostgreSQL work. Ordinary scoring, rationale selection, retry selection, and label projection use no runtime AI. The material costs sit offline in creating, independently validating, naturalness-reviewing and approving content/variants. Text payload storage/egress is small; existing database/backups/observability dominate.

Cheap fallbacks:

- reviewed C2/C3 bank and deterministic rationale templates;
- broader approved task when a fine-grained fresh family is exhausted;
- exposed practice clearly labelled when learning value remains but independence cannot be claimed;
- transfer_pending rather than runtime generation;
- manual/human defect adjudication before adding model spend.

Upgrade only when measured evidence shows one of: repeated pass-critical inventory exhaustion, confirmed ambiguity above the Stage-24 quality threshold, manual review queue missing release cadence, objective scoring/checkpoint p95 violating the later SLO after ordinary optimization, or correction backlog exceeding the safe freshness horizon. A higher-quality offline model or additional human review may reduce measured defects; neither may self-approve a key. Per-click premium generation/adjudication remains rejected.

There is no new provider exit path because none is selected. Contracts are portable JSON/HTTP and semantic IDs; PostgreSQL remains authority; content/key/repair assets are exportable immutable manifests. A future service split consumes the same commands/outcomes and must prove security/deploy ownership and contention. A new UI adapter must emit the same canonical response fixtures.

## 16. Alternatives summary

| Decision area | Simplest/do-nothing | Other credible alternative | Chosen and exit |
|---|---|---|---|
| Task contracts | bespoke page JSON | arbitrary schema-driven renderer | Closed typed family variants; add major only for real target family |
| Input | pointer/drag facts | separate accessible payload | Canonical operations with multiple adapters; replace adapters freely |
| Scoring | client key comparison | runtime AI adjudication | Server deterministic exact key; provider-neutral |
| Feedback | bare correct answer | generated explanation per click | Reviewed decisive/distractor metadata and templates |
| Timing | per-task countdown constants | one global exam timer with hidden allocations | Versioned shared block plus labelled practice strategies |
| Assistance | one assisted flag | client UI-state inference | Offered/used/phase/scope events |
| Freshness | new item ID/reorder | live generation | Conservative family identity and reviewed inventory |
| Defects | edit key in place | invalidate whole form/history | Append exact-scope impact, targeted recompute, new-family replacement |
| Rendering | arbitrary HTML | plain text only | Closed safe content AST |
| Deployment | per-skill service | browser-only truth | Existing modular monolith/HTTP/PostgreSQL owners |

## 17. Traceability and downstream handoff

### 17.1 Decision traceability

| Decision | Product/design source | Prior architecture | Validation | Downstream |
|---|---|---|---|---|
| ARCH-S15-D01 | app/09 §§3.1/4.1; app/10 §§3.1/4.1; final §8 | S09 §§4/6/9 | Schema/golden form fixtures for all five families and P0–P4/P4 rejection | 21, 25, 27, 28 |
| ARCH-S15-D02 | Design 01 §2.3; Design 04 #a; app/26 | S13 §6; S14 §§8/10 | Pointer/keyboard/AT response hash equality; no drag-only route | 21, 25–28 |
| ARCH-S15-D03 | app/07 §§3–8; Design Mobile 2.2–2.5 | S06 §§5/9; S08 §§7–8; S12 §10 | Duplicate/reconnect/conflict/property tests; immutable original snapshot | 21, 25–28 |
| ARCH-S15-D04 | app/09 §3.5; app/10 §§3.6/4.11 | S09 §6; S11 §§5/7 | Exact-key golden/replay, option reorder, blank/interruption and no-key-client tests | 24–28 |
| ARCH-S15-D05 | app/09 §§4.7/4.9; app/10 §§4.7/4.11; design diagnosis | S08 §8; S09 §6 | Independent rationale review; cause uncertainty/feedback order fixtures | 24–28 |
| ARCH-S15-D06 | final §5.1; app/08 §5; app/09 §4.4; app/10 §4.9 | S06 §7; S14 §10 | offered-unused/post-submit/answer-bearing/access-equivalence matrix | 24–28 |
| ARCH-S15-D07 | app/07 §7; app/14 §§5/14; app/21 §4.4 | S06 §7.2; S09 §7 | Near-duplicate/family and episode/occasion property tests; exhaustion path | 21, 24–28 |
| ARCH-S15-D08 | app/09 §5.6; app/10 §5; app/21 §4.10 | S06 §10; S09 §10; S11 §10 | defect sequence, exact selector, zero-unaffected-change and learner-neutral copy | 24–28 |
| ARCH-S15-D09 | final §§14–16; app/21 §§3–4; Design shell | S09 §§8–9; S13 §11 | hostile content/key-leak/rights/authorization and accessibility publication tests | 23–28 |
| ARCH-S15-D10 | final §§18.2/20; app/21 §7 | S03, S12, S13 | load/cost/replay/observability tests; no-AI dependency injection outage | 24–28 |

### 17.2 Decisions downstream stages must preserve

1. R1–R3 and SB1–SB2 are closed typed runtime families over one objective kernel; their current official counts/mechanics come from the pinned blueprint rather than UI constants.
2. Reading and Language Elements target timing is one shared block. A Language Elements practice target is never an official standalone limit.
3. Pointer, keyboard, screen-reader and select-then-place paths produce identical canonical response facts where the tested capability is unchanged.
4. Only the server exact-key policy creates the immutable original objective outcome. The client and AI never decide correctness.
5. Submission, actual conditions, help/exposure, original outcome and prior validity remain immutable/auditable. Current interpretation can change through appended exact-scope assertions.
6. Validity uses exactly valid, partially_valid, pending, interrupted, and not_counted. Technical/content/access/browser/network faults never become learner failure.
7. Decisive evidence and chosen-distractor mismatch precede cause/advice. Unsupported cause remains unresolved.
8. Offered help differs from used help; post-submission assistance cannot weaken the original. Answer-bearing pre-submit help affects only named scope.
9. Immediate fresh retry proves responsiveness/transfer in the same episode/occasion; delayed retention needs a later fresh family/occasion.
10. Confirmed defective units become not_counted, preserve unaffected evidence, trigger targeted recomputation, and receive a fair new-family replacement.
11. Learner-safe manifests contain no keys/rationales/unsafe markup/restricted source expression. Corpus is asynchronous and receives no learner data.
12. Ordinary objective runtime/scoring/explanation selection has zero runtime AI and no probability semantics.

### 17.3 Dependencies introduced or removed

Introduced:

- Stage 21 must preserve canonical objective-response checkpoints, shared-block clock integrity and unknown-outcome receipts.
- Stage 24 must instrument scoring replay, inventory exhaustion, defect/correction and accessibility quality without raw content/responses.
- Stage 25 must build contract, property, recovery, key-leak, pointer/keyboard/AT equivalence and all five-family test gates.
- Stages 26–28 must preserve release rollback, end-to-end defect/correction scenarios and the final decision registry.
- Content operations need sufficient approved independent families for retry/retention/P4, but this is an inventory dependency, not runtime Corpus/AI.

Removed:

- No runtime AI/Corpus/provider dependency for Reading/Language Elements attempts.
- No separate Language Elements timer/scoring service.
- No drag library as a semantic dependency.
- No client score/validity/readiness logic.
- No owner decision or new commercial-provider choice.

## 18. Risks, assumptions, and validation needs

| Risk/assumption | Required evidence/test | Owner/action |
|---|---|---|
| Content metadata correctly isolates decisive evidence/cause | Independent blind key/rationale review; defect-rate trend by task family | Content & Forms; Stage 24 monitor |
| Canonical adapters truly match across input modes | Cross-adapter property fixtures and manual NVDA/VoiceOver/TalkBack completion | Stage 25 |
| Shared-bank constraints remain understandable on phone/AT | 320 px, 200% zoom, keyboard/screen-reader task completion and error recovery | Stage 25 |
| Family assignment prevents cosmetic retry independence | Human-labelled duplicate/independent pairs with false-independent weighted highest | Content + Stage 24 calibration |
| Checkpoint/timer facts preserve clean shared-block claims | crash/reload/offline/background/unknown-submit scenario suite | Stage 21/25 |
| A scoped defect never changes unaffected learner truth | Shadow-diff invariant: 100% intended selected, 0 unintended changed | Evidence/Measurement + Stage 25 |
| Approved bank depth supports retry/retention/P4 | Inventory coverage/exhaustion dashboard by family/role without learner text | Content + Stage 24 |
| Practice blank versus interruption is not conflated | State-machine/property tests for deliberate submit, stop, network and client fault | Session/Evidence + Stage 25 |
| Design retry wording does not overstate Readiness | Learner-copy fixture states immediate transfer/same occasion explicitly | Stage 25 design/product QA |
| Rights metadata/action conditions remain current | Takedown/attribution/cache purge exercise; jurisdiction-specific review | Stage 23/26 |

## 19. Intentionally deferred implementation details

| Deferred choice | Future owner | Fixed boundary |
|---|---|---|
| Exact framework component implementation for radios, matching and cloze popovers | Implementation under Stage 25 gates | Must emit canonical operations, native semantics first, same evidence |
| Exact PostgreSQL table/index names and transaction batching | Implementation/Stage 26 | Immutable IDs, idempotency, exact selectors and owner boundaries fixed |
| Exact local/server checkpoint cadence and shared clock mechanism | Stage 21 | Shaped recovery/timing integrity and response hashes fixed |
| Exact learner-facing revised retry sentence | Stage 25 product/design QA | Must not imply independent Readiness from immediate retry |
| Exact future blueprint item counts, option/no-match/reuse rules | Target release governance | No UI constants; historical versions remain |
| Exact near-duplicate calibration threshold | Stage 24 using reviewed pairs | Conservative family default and false-independent priority fixed |
| Exact content inventory quantity and authoring workflow UI | Content operations/Stage 24 | Approved independent families and honest exhaustion fixed |
| Optional bounded offline package/service-worker strategy | Stage 21 | No keys/unsafe content; preauthorized high-stakes integrity fixed |
| Whether a future service split is justified | Stage 26/28 after measurements | Same contracts, truth owners, deterministic score and provider exit fixed |

No deferral asks an implementer to invent a consequential product rule.

## 20. ADRs

Created:

- ADR-0023 — Deterministic objective task runtime and immutable outcomes — **Accepted**.

It applies ADR-0001, ADR-0003, ADR-0011, ADR-0013, ADR-0015, ADR-0016, ADR-0018, ADR-0019, ADR-0021, and ADR-0022 without superseding them.

## 21. Decisions made

1. Defined one immutable typed form/runtime kernel for R1–R3 and SB1–SB2.
2. Defined exact task/stimulus/item/option/gap/match/shared-block pseudotypes.
3. Defined canonical select, matching, select-then-place and cloze response operations independent of input method.
4. Defined one immutable submitted response and deterministic exact-key original outcome.
5. Defined shared written-block timing and prohibited an invented official Language Elements split.
6. Defined answer submission, checkpoint, navigation, exposure and key-reveal boundaries.
7. Defined decisive-evidence, distractor, cause and repair contracts with unresolved-cause fallback.
8. Defined offered/used assistance, word help/translation/timing/accessibility effects and learner labels.
9. Defined fresh-equivalent immediate retry, later fresh return and content-family independence.
10. Defined ambiguity reporting, exact-scope invalidation, fair replacement and targeted recomputation.
11. Defined learner-safe content, key-leak, privacy, Corpus, rights and accessibility boundaries.
12. Defined zero-runtime-AI cost/operations/validation and provider-neutral exits.

## 22. Open questions and owner blockers

No owner question blocks Stage 15. Mutable empirical thresholds and future blueprint values are versioned releases with named future owners, validation evidence and rollback; they are not missing product decisions.

## 23. Definition-of-done check

- [x] Every required source and prerequisite was fetched/read from current main and pinned by SHA/commit.
- [x] Authority and Stage-27 precedence were applied; exact design wording conflicts are recorded without editing sources.
- [x] R1–R3 and SB1–SB2 contracts, form-level shared blocks and task/form/response pseudotypes are complete.
- [x] Select, matching, select-then-place and cloze paths produce deterministic identical response evidence.
- [x] Attempt shell extensions, navigation, shared timing, checkpoint/submission, exposure and immutable outcome are decided.
- [x] Decisive evidence, distractors, cause/repair, fresh retry, delayed return and family independence are decided.
- [x] Assistance, translation, word help, timing and accessibility conditions preserve offered-versus-used semantics.
- [x] Ambiguity/defect reporting, invalidation, replacement and targeted recalculation are learner-neutral.
- [x] Alternatives, criteria, consequences, fallbacks, exits and review triggers are explicit.
- [x] Data/API/state/versioning, security/privacy/rights, accessibility, failure/recovery, operations and cost are complete.
- [x] Required runtime/scoring state diagrams, equivalence table, assistance matrix, defect sequence and shell map exist.
- [x] ADR-0023 and its index entry are current.
- [x] Downstream decisions/dependencies/risks/tests/triggers/deferrals are explicit.
- [x] No pass probability, runtime objective AI, live Corpus lookup, learner-data transfer to Corpus, standalone official LE timer, cross-component compensation or learner-negative system fault exists.
- [x] No consequential implementation or owner decision is left to invent.
