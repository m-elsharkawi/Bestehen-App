# Bestehen / App — Coaching Engine and Session State Machines

> **Stage:** 08 of 28  
> **Status:** Accepted architecture decision  
> **Decision date:** 2026-08-23  
> **Scope:** Deterministic coaching policy, plan/session/activity/attempt boundaries, canonical-loop orchestration, overrides, late evaluation, reason/copy contracts, and failure behavior; no production code, endpoint syntax, schema, migration, provider, or design change

## 1. Purpose and scope

This stage defines the smallest sufficient architecture that turns current App-owned evidence and learner projections into one explainable daily recommendation, lets the learner deliberately choose another useful path, and executes either path without changing evidence truth. Coaching owns a rebuildable recommendation and session orchestration. It does not own attempts, evidence validity, capability, Mistake Memory, Progression, Review, Readiness, content rights, or evaluator truth.

The routine planner is deterministic. It filters invalid or inaccessible work, compares eligible candidates in binding lexicographic order, creates an immutable versioned plan revision, and explains the result with structured reasons and reviewed copy. Productive evaluation may be asynchronous; a late result updates only its original attempt and dependent projections, never rewrites original conditions or an activity already in progress.

This document contains explanatory pseudotypes, tables, and diagrams. It does not create application code, database DDL, deployment configuration, content, screens, or a framework/provider choice.

## 2. Inputs, authority, and continuity

### 2.1 Repository references read from current `main`

| Repository / commit | Path | Blob SHA | Use |
|---|---|---:|---|
| Bestehen-App @ `0c55b3e8a042765388aaea4ddd52d95d39b2e2de` | `prompts/architecture/08_define_coaching_engine_and_session_state_machines.txt` | `5ef8cc1f392cc93bcce05545afc1a66f44e9773a` | Binding Stage 08 contract |
| same | `Architecture/00-architecture-shaping-plan.md` | `b263c5e7b3bccc0450ddd17aa0cc007432d672b7` | Routing, authority, scope |
| same | `Bestehen_App_Architecture_Checklist.md` | `2a3f1877f9f1611c0cf021ce063542d0c7b70e8b` | Live pre-stage checklist; Stage 08 was 0/24 |
| same | `Architecture/04-domain-model-and-bounded-contexts.md` | `ab1a775d7689e47bba00c2544c247ef344c44e70` | Context and state ownership |
| same | `Architecture/06-evidence-ledger-validity-versioning-and-audit.md` | `53d34ae65ef4c8fa79c00026f9bd5d7b876ce672` | Evidence envelope, validity, audit, correction |
| same | `Architecture/07-learner-model-mistake-memory-progression-and-review.md` | `ad58238aee48e41a0d4bd30bd21ac5a17707656f` | Current projections, review obligations, source cuts |
| same | `Design/DESIGN-HANDOFF.md` | `417a6820037e045e2dd9f29afc42b9f2e94fd638` | UI state and failure contracts |
| same | `Design/Bestehen-01-Design-System.dc.html` §3.1 | `d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a` | Shared evidence/control/state semantics |
| same | `Design/Bestehen-02-Mobile-Screens.dc.html` Acts 1–2 | `0a9f2d3ea982c3197f399941b57defd9869d2428` | First plan and daily-loop behavior |
| same | `Design/Bestehen-04-Flows-Handoff.dc.html` Flows A–C | `7120b05a2272c31e5896e4313a7007935f5d0aed` | First session, daily loop, repair/retention exits |
| Bestehen-Shaping @ `9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc` | `app/28-bestehen-app-product-specification.md` | `18ae80cc2fd63cecd76c297c3e56d44a68367856` | Highest App product authority |
| same | `app/02-complete-learner-journey.md` | `3c536176154a8239aeafc0697acd947280130142` | Return, partial completion, recovery |
| same | `app/03-initial-diagnostic.md` | `038ab89b0be23464eedf1408111dd1936320f57a` | Provisional first recommendation |
| same | `app/06-daily-coaching-engine.md` | `3cd869cd337dd3a878c27f35e1e8b5dad0c4c7bb` | Candidates, session budgets, tiers, tie-breaks |
| same | `app/07-core-learning-loop.md` | `c313c859f64997972feca87497d70476c4528a20` | Canonical loop and evidence boundaries |
| same | `app/08-a1-to-b1-progression.md` | `839a01c010cf79777520714d0ab09304a2ba9a06` | Local P0–P4 conditions and reachable probes |
| same | `app/14-review-and-spaced-repetition.md` | `fa9b65e92cd1511e00e106a199eb6fbc06273a69` | Due windows, queue caps, natural satisfaction |
| same | `app/18-coach-personality-and-behavior.md` | `7bc3c2ee918264911a9550fe20e53dc565f986dd` | Fact → meaning → next action and fallback voice |
| same | `app/19-information-architecture-and-core-screens.md` | `615ba3ce97fb25f974b6ba3a020cf254ddd0065f` | Coach, Train, session, resume surfaces |
| same | `app/22-user-controls-vs-coach-autonomy.md` | `27f33cd56a09df27952e15bb3dfd0e077b89633c` | Coach me / Just practice and override boundary |
| same | `app/23-exam-date-and-urgency.md` | `5942ed811bcbaa5baaf1dd55079b8971d34b1d01` | Horizon modes, compression, final-day behavior |

The App and Shaping heads match the planning baseline for all immutable shaping sources. Required architecture Stages 04, 06, and 07 are present and accepted. The Stage 08 output was absent. No prerequisite is missing or blocked.

### 2.2 Authority reconciliation

| Exact sources | Apparent tension | Applied authority and architecture consequence |
|---|---|---|
| `app/27-end-to-end-scenario-validation.md` precedence as carried by the final specification and Stage 08 prompt vs `app/06-daily-coaching-engine.md` §§3.4, 4.3–4.4 | The earlier tier table starts with pass-risk after validity, while the later cross-stage rule explicitly places direct evidence before independent Written/Oral risk and uncertainty before due work. | The later Stage 27 precedence is binding. Validity/fairness is a hard eligibility gate; the comparison tuple is directness → independent gate risk → uncertainty → due repair/retention → progression/coverage → preference. Earlier candidate types, ordinal dimensions, and tie-breaks remain useful inside that order. |
| `Design/Bestehen-04-Flows-Handoff.dc.html` Flow B | A skill swap is described as requiring “no warning,” while `app/22-user-controls-vs-coach-autonomy.md` §§5.2, 5.10 requires a brief consequence when a deviation is materially important. | Product truth wins. Ordinary swaps are frictionless; a material pass-gate/evidence/due consequence is stated once, calmly. No source is edited. |
| `Design/Bestehen-04-Flows-Handoff.dc.html` Flow B exit and `Design/Bestehen-02-Mobile-Screens.dc.html` Act 2 | Design shorthand can read as if only “unaided” work may affect Readiness. Stages 06–07 and final spec distinguish equivalent access support, offered-but-unused help, assistance classes, and narrower claims. | Evidence-envelope semantics win. Non-answer-bearing equivalent access is not a penalty; answer-bearing assistance narrows the claim. Coaching never decides this from a UI label. |
| `Design/Bestehen-02-Mobile-Screens.dc.html` Act 2 | The example shows three named items, while final spec §6.1 permits one dominant commitment and at most one secondary major block. | Short due checks are not additional major blocks. A Standard plan still has one dominant action, at most one secondary major block, and normally no more than two major skill contexts. |

These are documented implementation/design issues only. Shaping and Design remain unchanged.

## 3. Decision registry

| ID | Decision | Consequential ADR | Downstream consumers |
|---|---|---|---|
| `ARCH-S08-D01` | Use a deterministic, versioned, lexicographic planning policy; never a routine weighted or model-selected plan. | ADR-0015 | 11–13, 19, 24, 25, 27, 28 |
| `ARCH-S08-D02` | Keep `Coach me` and `Just practice X` as distinct request origins with non-punitive, truth-preserving overrides. | ADR-0015 | 12–15, 20–22, 25, 27, 28 |
| `ARCH-S08-D03` | Separate plan revision, session, activity, coaching episode, and attempt; preserve facts at meaningful boundaries. | ADR-0015 | 12–18, 20–22, 25, 27, 28 |
| `ARCH-S08-D04` | Orchestrate the canonical loop as six semantic states with explicit legal compression, deferment, and terminal boundaries. | ADR-0015 | 11–18, 21, 25, 27, 28 |
| `ARCH-S08-D05` | Accept productive evaluation asynchronously by attempt identity/source cut; late results never rewind active work or rewrite original conditions. | ADR-0015 | 11–12, 17–19, 21, 24–28 |
| `ARCH-S08-D06` | Generate explanations from a versioned reason registry and reviewed fallback templates; models cannot invent the plan or truth. | ADR-0015 | 12–13, 19, 24–28 |
| `ARCH-S08-D07` | Degrade locally for access, content, media, network, browser, permission, or evaluator faults and assign zero learner penalty. | — | 12–18, 21, 23–28 |
| `ARCH-S08-D08` | Publish exhaustive client-visible states and immutable policy/plan versions with fail-closed compatibility and targeted re-planning. | — | 12–14, 20–22, 24–28 |
| `ARCH-S08-D09` | Reuse the accepted App/PostgreSQL/worker stack with negligible routine AI cost, privacy-minimized operations, and deterministic fallback. | — | 19, 23–26, 28 |
| `ARCH-S08-D10` | Release through golden, property, concurrency, accessibility, failure, privacy, and shadow-policy gates. | — | 24–28 |

## 4. Ownership and module boundaries

| State or action | Owner | Coaching may | Coaching must not |
|---|---|---|---|
| Attempt, response, actual timing/help/playback/access/technical conditions | Session & Attempt | Create an activity/attempt intent and consume the immutable occurrence | Rewrite conditions, score non-response, or infer learner ability |
| Accepted observation and validity assertions | Evidence & Capability | Read exhaustive availability/validity state and request a direct sample | Accept provider output as truth or mutate evidence |
| Capability/condition/coverage and ReadinessContribution | Evidence & Capability | Use published generation and reason codes | Merge Written/Oral, convert missing to zero, or calculate pass probability |
| Weakness lifecycle | Mistake Memory | Select known/candidate/repairing obligations as qualified inputs | Create a weakness from a plan, skip promotion gates, or count avoidance as recurrence |
| P0–P4 local profile and probes | Progression | Choose a reachable axis change | Treat a rung as global level/unlock or silently claim target conditions |
| Review obligations/windows | Review & Retention | Select/naturally satisfy within cap and due rules | Create deck debt, missed-review failure, or mutate schedule from preference |
| Written/Oral Readiness, mocks, Ready to Book | Readiness & Booking | Consume separate component state when current and choose a clarifier/action | Calculate readiness, compensate gates, make probability, or make booking truth |
| Plan recommendation, plan revisions, session orchestration | Coaching | Own deterministic recommendation, reasons, alternatives, revisions, and execution intent | Change upstream truth because the learner accepted/declined a plan |
| Content bytes, approval, rights, taxonomy/bundle metadata | Content & Forms / App Content Access | Query a compatible approved cached pool | Search raw Corpus at runtime, send learner state to Corpus, or bypass rights/quality |
| Productive evaluation candidate | Productive Evaluation | Start/track a bounded evaluation and accept a structured result by attempt identity | Send full history merely to phrase/rank a plan or fabricate unsupported dimensions |

Coaching reads immutable/current generations and publishes a recommendation projection. Upstream corrections invalidate only affected plan inputs; they do not rewrite completed sessions.

## 5. Deterministic planning policy

### 5.1 Planning request and source cut

The following is explanatory pseudotype, not production code.

~~~text
PlanningRequest =
  learner_or_local_profile_id
  + origin                         # coach_me | just_practice
  + requested_duration_minutes     # quick 10 | standard 25 | extended 45 | custom 5..60
  + today_context                  # energy/load, audio, microphone, network/device/access
  + requested_focus?               # skill, task family, weakness, review, mock, condition
  + override_intent?                # easier | harder | target | postpone | stop | assistance
  + exam_date_mode_and_horizon
  + required_projection_source_cuts
  + compatible_content_bundle_version
  + planning_policy_version
  + reason_registry_version
  + copy_template_version
  + idempotency_key

PlanningSourceCut =
  accepted_evidence_ledger_sequence
  + validity_assertion_sequence
  + correction_impact_sequence
  + capability_generation_id
  + mistake_generation_id
  + progression_generation_id
  + review_generation_id
  + readiness_generation_id?
  + content_bundle/taxonomy/blueprint/rubric/evaluator versions
  + date_context_version
  + access_context_version
~~~

Raw responses, transcripts, audio, unrestricted history, Corpus source bodies, and hidden model reasoning are not planner inputs. An account-optional local profile uses the same contract with a device-local opaque identity and explicit recovery limits.

### 5.2 Projection availability gate

| Input state from Stage 07 | Planning use |
|---|---|
| `current` | Eligible for the decision it supports |
| `recomputing` | Use last-good only when marked safe; add `STATE.UPDATING` and do not make a new high-stakes conclusion |
| `stale` | Historical context only; prefer the smallest fresh direct recheck if decision-relevant |
| `blocked_by_pending` | Block only the dependent fine conclusion; continue unrelated work |
| `unavailable` | Treat as absence/product gap, never zero; prefer a feasible direct sample or broader approved activity |
| `failed` | Retain safe last-good; otherwise choose a local fallback and expose system ownership |
| `deleted` | Do not plan from prior state; only new authorized facts can begin a new profile |

Unknown enum, contract major, reason code, or required version fails closed at its affected scope. The client never supplies a numeric fallback.

### 5.3 Candidate contract

An eligible candidate declares:

- exact direct lane, component, section, task family, target claim, content revision/form, and intended occasion;
- estimated duration range and meaningful boundaries;
- assistance, timing, playback, exposure, difficulty/profile axes, access/equivalence, and evaluation needs;
- reachability/prerequisites and whether a lower-condition activity proves only a narrower claim;
- freshness/independence, due window, review/mistake/progression identifiers, mock/date context;
- cognitive load, device/audio/microphone/network needs and locally available alternatives;
- approval, rights, compatibility, inventory, evaluation confidence/cost class;
- structured reason candidates and the exact source projection/version for each.

The routine candidate kinds remain due transfer/retention, clarifying probe, targeted repair loop, direct evidence-gap task, realism progression, coverage/maintenance, mock preparation/recovery, and learner-requested useful practice.

### 5.4 Canonical lexicographic precedence

Eligibility is decided before ranking:

1. content/evaluator/rights compatibility and evidence validity;
2. fairness and accessibility eligibility;
3. feasible meaningful boundary within available time;
4. reachability at an honest condition;
5. required device/context capability or a declared local alternative.

An ineligible candidate cannot win by urgency, cost, or preference. Eligible candidates compare the following tuple in order; the first unequal dimension decides:

| Order | Dimension | Comparison |
|---:|---|---|
| 1 | Direct evidence | Prefer the more direct lane/occasion and the task that replaces inferential, assisted, stale, or missing decision evidence with a valid fresh observation. No cross-lane substitution. |
| 2 | Independent Written/Oral pass risk | Prefer the weaker/less-evidenced independent gate, then larger recoverable exam/rubric impact. Neither gate compensates for the other. |
| 3 | Uncertainty resolution | Prefer the smallest direct clarifier that can change a current coaching/readiness decision over speculative repair. Pending blocks only its dependent conclusion. |
| 4 | Due repair/retention | Prefer the due window with the greatest loss of transfer/retention decision value if delayed; a qualifying natural task may satisfy it. |
| 5 | Progression/coverage | Prefer reachable transfer, justified one-axis realism change, neglected task family/section, and aging coverage. |
| 6 | Preference | Use learner focus, variety, or interest among still-useful choices; preference never changes truth. |

Within the first equal dimension, compare small ordinal bands for exam impact, learner need, deadline/mock relevance, reachability, time efficiency, fatigue/environment/access fit, repetition penalty, diagnosis/quality risk, and coverage. Cost compares only learning/evidence-equivalent options.

Stable tie-break order is: weaker/less-evidenced gate; recoverable impact; closing due window; decision-blocking uncertainty; stronger direct target-condition opportunity; reachable complete outcome; least recently served compatible task family; better access/environment fit; lower repetition; lower operating cost; explicit preference; then deterministic rotation by `last_served_at`, `candidate_kind`, `task_family_id`, and `candidate_id`. Identical request/source-cut/policy/content inputs produce the same ordered result and reason codes.

### 5.5 Planning decision pseudologic

~~~text
INPUT PlanningRequest plus current/allowed-last-good projections and approved content inventory

1. Validate contract majors, source cuts, deletion state, duration, and access context.
2. Generate candidate intents from direct evidence gaps, independent pass risks,
   uncertainty, due repair/retention, progression/coverage, mock/date obligations,
   and useful learner requests.
3. Reject candidates that are invalid, unfair, rights-ineligible, inaccessible,
   exposed, incompatible, unreachable, or too long for a meaningful boundary.
4. Convert an unreachable priority into the smallest reachable prerequisite,
   scaffolded repair, or honest clarifier; preserve the target gap.
5. Assign structured reasons and compare the binding lexicographic tuple.
6. Select one dominant commitment. Reserve a time-sensitive due check only when
   delaying loses material value or embed it naturally in the commitment.
7. Add at most one secondary major block when it closes material evidence or
   coverage value without fragmentation. Normally use at most two major skill contexts.
8. Budget orientation, attempt, conditional repair/retry, and summary to meaningful
   boundaries. Remove the lowest-value optional block rather than asking the learner to rush.
9. Produce two compact alternatives when available: close-value/context-friendly first;
   learner-requested useful path second. Never fabricate an invalid alternative.
10. Render fact → meaning → next action from structured reasons and reviewed templates.
11. Publish immutable PlanRevision with source cut, versions, alternatives, and checksum.

IF no responsible plan fits:
  publish locally blocked/unavailable reason plus duration/context/approved broader options;
  create no learner-negative event and no fake filler task.
~~~

### 5.6 Time and assembly rules

| Request | Default assembly |
|---|---|
| Custom 5–9 minutes | One complete micro-check or a meaningful part whose boundary and deferred consequence are explicit |
| Quick 10 | One dominant commitment; normally one–two short due checks only when they form that commitment |
| Standard 25 | One dominant commitment using roughly two-thirds or more of useful time; at most one secondary major block; normally no more than two major skill contexts |
| Extended 45 | One dominant plus at most one secondary major block; three–eight minutes of explicit review normally, with natural embedding preferred |
| Mock/measurement | Separate commitment and preflight; no ordinary review or coaching inside the measured block |
| Final day/exam eve | Default light familiar review/logistics/rest, normally 10–25 minutes; no full mock or broad repair campaign |
| Exam day | No normal plan; optional familiar 5–10 minute warm-up and logistics only |

The 25-minute default and 10/45 alternatives are stable product rules. Calibration may improve duration estimates and boundary metadata, not redefine the promise silently. Changing today’s duration does not change the stored default unless the learner explicitly saves that preference.

## 6. Coach me, Just practice X, and overrides

### 6.1 Distinct request origins

| Contract | `Coach me` | `Just practice X` |
|---|---|---|
| Primary intent | Accept the strongest current time/context-aware recommendation | Ask for a useful skill/task/mode chosen by the learner |
| Candidate scope | Whole compatible pool under precedence | Requested focus first, then compatible choices inside it |
| Primary card | One dominant recommendation with concise Why | Chosen activity/short plan with actual conditions and purpose |
| Alternatives | Normally up to two compact useful alternatives | Nearby task/condition variants; coach recommendation remains available |
| Consequence copy | Explain why selected | Only when the deviation materially leaves a pass risk, uncertainty, due window, or evidence gap unresolved |
| Evidence effect | Only actual attempt conditions/validity matter | Identical rule; selection/override itself is never evidence |
| Personalization | Recommendation history may be measured operationally | Choice may be stored as transient context; no permanent trait from one choice and no compliance score |

### 6.2 Sequences

~~~mermaid
sequenceDiagram
    actor L as Learner
    participant UI as Coach / Train UI
    participant C as Coaching policy
    participant P as Published projections
    participant F as Approved content pool
    participant S as Session & Attempt
    alt Coach me
        L->>UI: Coach me + time/context
        UI->>C: PlanningRequest(origin=coach_me)
        C->>P: Read compatible source cuts
        C->>F: Query eligible cached activities
        C-->>UI: PlanRevision + reasons + alternatives
        L->>UI: Accept or adjust
    else Just practice X
        L->>UI: Skill/task/mode + time/context
        UI->>C: PlanningRequest(origin=just_practice)
        C->>P: Check current consequences and conditions
        C->>F: Query eligible requested activities
        C-->>UI: Learner-selected plan + material consequence if any
        L->>UI: Start, revise, or return to Coach me
    end
    UI->>S: Start SessionInstance from exact plan revision
    S-->>UI: Current activity and actual evidence conditions
~~~

### 6.3 Override and consequence matrix

| Learner action | Plan/session consequence | Evidence/Readiness consequence | Required explanation |
|---|---|---|---|
| Quick/Standard/Extended/custom time | New immutable plan revision for remaining minutes; no silent default change | None from choice; attempted boundaries determine evidence | New time and what now fits; name omitted material work once |
| Lighter energy / quiet / no audio / no microphone / device constraint | Refilter locally and select highest-value compatible activity | Oral/Listening gap remains; typed/transcript work is not substituted as direct evidence | Neutral context statement and when the direct obligation can return |
| Different skill / Just practice X | Create learner-origin revision; current coach priority remains available | Valid chosen work counts normally; bypassed gap remains missing/stale/due | No warning for close-value choice; one fact/meaning/next action for material deviation |
| Easier / more help | Serve reachable lower condition; actual assistance/profile recorded | Proves only served condition; never global regression | “Useful practice; this does not yet test target conditions” when material |
| Harder / more exam-like | Preflight reachability/validity, then explicit condition revision | Failure counts only if attempt valid; choice is not evidence; lower success cannot erase stronger history alone | State harder conditions and current uncertainty; no punishment |
| Target conditions early | Allow a valid activity or mock after consequence/preflight; do not gate by P0–P4 | Honest target-condition result; no hidden penalty for being early | Explain recommended alternative and what the early result can/cannot decide |
| Start mock early | Separate mock commitment/revision and preflight; offer shorter/component option if time/setup insufficient | Mock validity rules own the claim; coaching is deferred inside measured blocks | Purpose, rules, interruption consequence, and current recommendation once |
| Request assistance before attempt | New condition before response | Assistance class affects claim exactly as recorded; equivalent access is not penalty | Show allowed help and evidence meaning |
| Request assistance after attempt | Preserve original attempt; assistance applies to repair/subsequent attempt only | Original evidence unchanged; later attempt has its own condition | No retroactive relabeling |
| Postpone/skip block | Replan remaining time; return priority is recalculated, not blindly carried | No failure/refusal/recurrence; due/gap remains by its owner | Material risk/due consequence once, plus next feasible return |
| Stop early | Close at meaningful boundary: `completed` if dominant boundary reached, otherwise `partially_completed`; offer resume only if valid | Preserve completed evidence; no session score or penalty | What was saved, what remains, and whether resume is valid |
| Resume same day | Use same activity only if content integrity, condition, and enough time remain; otherwise new revision/fresh equivalent | Preserve original facts; paused timing stays explicit | Remaining time and any measurement loss |
| Return later / exam date/context changed | Re-rank from current source cut; supersede unfinished optional revision | Completed evidence stands; no backlog | Name material change, e.g. due window/date/new evidence |
| Repeated avoidance | Continue respecting choice; offer lower-friction direct route | No trait, compliance score, or ability penalty; gap stays honest | Calm repeated trade-off, never coercion |

Override audit stores intent, old/new plan revision, structured consequence reasons, and time/context—not an inferred motivation. The learner may dismiss a recommendation; the system may not dismiss evidence truth.

## 7. Boundaries, state, and version contracts

### 7.1 Identity and boundary table

| Boundary | Begins | Ends | Facts preserved | Important non-equivalence |
|---|---|---|---|---|
| `PlanRevision` | Policy publishes a recommendation or learner-approved replan for one source cut | Superseded, accepted, expired by material cut change, or session terminal | Candidate order, selected blocks, durations, reasons, alternatives, policy/content/template/source-cut versions, checksum | A plan is a recommendation projection, never learner evidence |
| `SessionInstance` | Learner starts an exact plan revision | Dominant boundary completes, learner stops, or local blocking state closes it | Origin, revisions used, activity occurrences, timing/context, terminal coaching status | Session completion percentage is not ability |
| `ActivityOccurrence` | One coherent goal/condition block becomes active | Meaningful activity boundary, deferment, replacement, or blocking fault | Intended claim, content/form, loop state, actual attempts, exposure, evaluation status | A plan block is not an attempt; an activity can contain retries |
| `CoachingEpisode` | Observe establishes one target/cause/repair purpose | Remember commits consequences or the episode is honestly deferred | Linked attempts, diagnosis, repair exposure, retry/transfer obligation | Same episode is one independence occasion; retry is not retention |
| `AttemptOccurrence` | Learner begins a fresh response under declared conditions | Submission/terminal interruption creates immutable occurrence | Response reference, timing, help, playback, exposure, access, technical conditions | Retry is a new attempt; missing/technical stop is not wrong |
| `EvaluationRequest/Result` | A supported submitted productive attempt needs evaluation | Result accepted/rejected/expired under exact contract | Attempt ID, purpose, rubric/evaluator/content versions, supported dimensions, confidence, status | Evaluation is a candidate; Evidence owner accepts validity/affected scope |

One session can use several plan revisions, but an activity occurrence always records the revision that created it. A replan never edits the plan revision already accepted or the attempt already observed.

### 7.2 Explanatory plan/session contract

~~~text
PlanRevision =
  plan_id + revision_id + predecessor_revision_id?
  + origin + request_id + created_at + valid_until?
  + source_cut + policy/reason/template/content versions
  + dominant_activity_intent
  + secondary_major_activity_intent?
  + embedded_due_checks[]
  + expected_duration_range + meaningful_boundaries[]
  + reason_codes[] + alternative_intents[]
  + replan_cause? + supersession_reason?
  + deterministic_checksum

SessionInstance =
  session_id + learner_or_local_profile_id
  + accepted_plan_revision_id + active_plan_revision_id
  + origin + started_at + current_activity_id?
  + status
  + completed_activity_ids[] + pending_evaluation_ids[]
  + current_context_version + last_meaningful_boundary_at

ClientPlanState =
  assembling | offered | active | updating | paused | partially_completed
  | completed | replanned | blocked | unavailable | failed | deleted
~~~

`replanned` describes a coaching transition/revision, not learner performance. The terminal session result remains `completed`, `partially_completed`, `paused`, `replanned`, or `blocked` as shaped; stopping maps to completed/partial by meaningful boundary. Client-visible states are discriminated and reason-coded—never `null`, spinner-only, or guessed.

### 7.3 Session state machine

~~~mermaid
stateDiagram-v2
    [*] --> Assembling
    Assembling --> Offered: valid plan revision
    Assembling --> Blocked: no responsible plan / local fault
    Offered --> Active: learner starts exact revision
    Offered --> Assembling: time/context/focus changes
    Active --> Active: next activity boundary
    Active --> Replanning: override / new material source cut
    Replanning --> Active: new revision accepted
    Active --> Paused: resumable learner intent
    Paused --> Active: same-day valid resume
    Paused --> Replanning: later return / integrity changed
    Active --> Completed: dominant meaningful boundary reached
    Active --> PartiallyCompleted: learner stops before dominant boundary
    Active --> Blocked: local technical/content/access fault
    Blocked --> Replanning: fallback/alternative available
    Completed --> [*]
    PartiallyCompleted --> [*]
~~~

An evaluation arriving while Active is an input update, not an automatic transition. It may mark feedback available and enqueue projection/plan recomputation; UI interruption waits for a safe boundary unless a validity/safety issue requires stopping the affected activity.

### 7.4 Partial completion and resume

| Interruption boundary | Persist | Same-day resume | Later return | Evidence treatment |
|---|---|---|---|---|
| Between blocks | Completed occurrences and current plan revision | Continue if still valid and time fits | Re-rank unfinished blocks against current cut | Completed evidence stands |
| Unsubmitted objective cluster | Responses/checkpoint and content exposure | Resume only if integrity is preserved; else fresh equivalent | Usually replace/replan | Missing answers are absent, not wrong |
| Writing/Speaking preparation/draft | Draft/checkpoint, timing/context, media references under retention policy | Resume if learner chooses and validity remains | Reopen draft as incomplete/practice or start fresh | Evaluate only responsibly observable dimensions |
| Submitted attempt, feedback pending | Immutable attempt and evaluation request | Continue unrelated activity | Surface feedback later and re-rank | Original conditions never change |
| After repair exposure, before retry | Repair/exposure and transfer obligation | Fresh equivalent retry | Fresh equivalent later; source content never reused as independent | Repair exposure is not transfer |
| After immediate retry | Retry result and delayed obligation | Session may finish normally | Review owner schedules delayed/retention check | Responsiveness is not retention |
| Timed activity paused | Checkpoint, pause/visibility/timer facts | Continue as practice if allowed | Replan/restart clean measurement when needed | Continuous target-timing claim lost only for affected scope |
| Measured mock block | Valid partial units and exact interruption | Follow later mock contract | Follow later mock contract | Never relabel incomplete/paused block as clean full mock |
| Fault after valid unit | Valid unit plus fault assertion | Alternative at next boundary | Replan from valid remainder | Fault has zero learner-negative effect |

No missed-day catch-up debt is created. After a long gap, history remains; the planner selects the smallest decision-relevant refresh and collapses duplicate obligations.

## 8. Canonical-loop orchestration

### 8.1 State and evidence contract

| State | Required orchestration | May compress/defer | Must preserve |
|---|---|---|---|
| Observe | Goal, reason, intended claim, conditions, allowed help, access, time; select valid fresh content | Compress to a compact header for familiar/due work | Planning only; no solution exposure/mastery |
| Attempt | Create immutable attempt occurrence with actual conditions | Never skip when claiming new ability evidence | Fresh response, conditions, completeness, technical facts |
| Diagnose | Validate first; outcome plus smallest defensible cause/confidence | Brief for clear correct objective; broad/pending when unsupported; deferred for measured block | Shortfall gets at least broad/pending diagnosis; no invented cause |
| Repair | Smallest focused intervention | Skip for adequate correct attempt; learner may skip; defer when pending/mock | Exposure/support facts; no independent mastery |
| Retry | Fresh equivalent direct-lane attempt | Skip if no repair needed; defer when no fresh content/time/pending | New content/attempt ID; guided vs independent condition |
| Remember | Commit valid facts, derived consequences, due transfer/monitoring, concise summary | Never skip by system; may complete asynchronously after late evaluation | What changed, what remains uncertain, and next consequence |

Normal repair remains 2–6 minutes and under 8 minutes; one fresh retry, one useful re-diagnosis, and only one micro-adjustment/second fresh check when the cause remains defensible and the eight-minute boundary is intact. After two failed fresh checks or the boundary, stop at a meaningful point, preserve uncertainty/support dependence, choose a future reachable intervention, and do not grind.

### 8.2 Activity/canonical-loop state diagram

~~~mermaid
stateDiagram-v2
    [*] --> Observe
    Observe --> Attempt
    Attempt --> Diagnose
    Attempt --> PendingEvaluation: productive evaluator required
    PendingEvaluation --> Diagnose: accepted result
    PendingEvaluation --> Remember: learner continues; dependent conclusion pending
    Diagnose --> Remember: valid sufficient result / no supported repair
    Diagnose --> Repair: coachable supported blocker
    Diagnose --> Attempt: invalid attempt; fresh replacement
    Repair --> Retry
    Repair --> Remember: learner stops / no fresh equivalent / transfer deferred
    Retry --> Remember: success, stop, or boundary
    Retry --> Diagnose: one useful re-diagnosis
    Remember --> [*]
~~~

Diagnostic/mock/exam measurement batches Observe/Attempt under measured rules and defers all coaching until the block ends. A valid correct attempt may use Observe → Attempt → brief Diagnose → Remember. A pending evaluator never blocks unrelated activity. No fresh equivalent content means `transfer_pending`, not reuse of exposed content.

## 9. Pending evaluation and concurrency

### 9.1 Authoritative rules

1. Each evaluation request has semantic identity `attempt_id + evaluation_purpose + evaluator_contract_major + rubric_version`; retries return the committed request/result.
2. Attempt facts, response references, content revision, actual conditions, and submission time are immutable before evaluation.
3. A pending state names supported dependent dimensions. It cannot block objective feedback, other skills, other plan blocks, or nondependent projections.
4. The learner may continue. The active activity is not rewound and the session plan is not mutated in place.
5. On arrival, Productive Evaluation validates request identity, version compatibility, supported dimensions, confidence, and duplication. Evidence & Capability then accepts, narrows, marks pending, or rejects the affected observation scope.
6. Late accepted evidence uses the original attempt occasion and conditions. Arrival time is not evidence time and does not become a new attempt.
7. Projection owners rebuild the exact affected closure and publish a new source cut. Coaching may create a new plan revision only at a meaningful boundary; the current activity remains stable unless its own validity is revoked.
8. If a learner already changed plans, a late result may supersede a future recommendation but cannot cancel valid chosen/completed work or infer the override was wrong.
9. If repair has already exposed a model while evaluation was pending, that exposure applies only to subsequent attempts; it cannot relabel the original attempt.
10. Duplicate/out-of-order results converge idempotently. A result for a deleted learner, incompatible major, quarantined unsupported scope, or superseded request is audit-recorded and fails closed.

### 9.2 Late-evaluation sequence

~~~mermaid
sequenceDiagram
    actor L as Learner
    participant S as Session & Attempt
    participant E as Productive Evaluation
    participant V as Evidence & Capability
    participant P as Projection owners
    participant C as Coaching
    L->>S: Submit productive Attempt A under conditions C
    S->>E: Evaluate(idempotency key, A, exact versions)
    E-->>S: pending(supported dependent dimensions)
    S-->>L: Pending; continue unrelated work
    L->>S: Start/complete Activity B
    E-->>V: Late structured result for A
    V->>V: Validate identity, provenance, confidence, affected scope
    V->>P: Accept observation/correction at original occasion A
    P->>C: Publish new affected source cut
    alt Learner is between activities
        C-->>L: Feedback available + optional/new recommended revision
    else Learner is inside Activity B
        C-->>L: Non-interrupting availability; apply at next safe boundary
    end
~~~

If ordinary evaluation exceeds its service target, the UI says Pending and uses reviewed copy. A single higher-quality reevaluation is reserved by later evaluator/Readiness policy for a pass-critical contradiction; routine Coaching never repeatedly pays or calls merely to rank tomorrow.

## 10. Reason-code and fallback-copy contract

### 10.1 Structured explanation

Every plan, replan, alternative, block, and failure exposes:

~~~text
CoachingReason =
  code + registry_major/minor
  + affected_component/skill/task/claim?
  + evidence_reference_or_gap
  + source_projection_id + source_cut
  + severity_band                 # informational | material | urgent, never learner blame
  + learner_visible_fact_fields
  + consequence_fields
  + next_action_fields
  + template_key + template_version
  + safe_detail_link?
~~~

Learner copy follows fact → meaning → next action, normally no more than three reasons. It never exposes weights, hidden inference, a pass probability, a global P0–P4 label, internal cause speculation, or raw Corpus/provider data. Unknown reason/template major fails to a reviewed generic local template and emits an operational compatibility event.

### 10.2 Canonical reason families

| Family / representative codes | Meaning and permitted use |
|---|---|
| `VALIDITY.*` — `CONTENT_APPROVAL`, `RIGHTS_COMPATIBILITY`, `ACCESS_EQUIVALENCE`, `TECHNICAL_PREFLIGHT` | Hard eligibility/fairness reason; may replace/block affected activity, never blame learner |
| `DIRECT.*` — `MISSING_WRITTEN`, `MISSING_ORAL`, `TARGET_CONDITION_GAP`, `ASSISTANCE_DEPENDENT`, `STALE_DIRECT_SAMPLE` | Need for direct fresh evidence; missing has no numeric value |
| `RISK.*` — `WRITTEN_BLOCKER`, `ORAL_BLOCKER`, `BOOKED_DATE`, `MOCK_REVEALED` | Independent gate/date consequence grounded in a current upstream state; never pass certainty |
| `UNCERTAINTY.*` — `PENDING_EVALUATION`, `CONTRADICTORY_EVIDENCE`, `CAUSE_UNRESOLVED`, `PROJECTION_UPDATING` | Smallest clarifier or local hold; unsupported precision prohibited |
| `DUE.*` — `TRANSFER_WINDOW`, `RETENTION_WINDOW`, `POST_MOCK_CLARIFIER` | Time-sensitive repair/retention obligation with due window, not debt |
| `PROGRESSION.*` — `REACHABLE_PREREQUISITE`, `ASSISTANCE_FADE`, `REALISM_PROBE` | Exact local axis/condition consequence; never global level/unlock |
| `COVERAGE.*` — `SECTION_AGING`, `TASK_FAMILY_GAP`, `NORMAL_ROTATION` | Breadth/freshness reason after higher precedence |
| `PREFERENCE.*` — `REQUESTED_SKILL`, `REQUESTED_MODE`, `VARIETY` | Useful deliberate choice/tie-break; no truth effect |
| `CONTEXT.*` — `TIME_CHANGED`, `LOW_ENERGY`, `NO_AUDIO`, `NO_MIC`, `OFFLINE`, `ACCESS_NEED` | Today’s eligibility/replan context; not a learner trait |
| `FALLBACK.*` — `NO_VALID_PLAN`, `CONTENT_UNAVAILABLE`, `EVALUATOR_PENDING`, `TECHNICAL_FAULT`, `NO_FRESH_RETRY` | System/product ownership and next responsible alternative |

### 10.3 Reviewed fallback copy

| Condition | Reason code | Required reviewed copy pattern | Action |
|---|---|---|---|
| No valid plan fits time/context | `FALLBACK.NO_VALID_PLAN` | “No complete, valid activity fits these conditions yet. A longer slot, a broader reviewed task, or another skill will work.” | Offer exact responsible alternatives; no filler |
| Compatible content missing | `FALLBACK.CONTENT_UNAVAILABLE` | “We do not have a fresh checked task for this exact pattern. That is our content gap, not a result about you.” | Broader reviewed equivalent or defer fine check |
| Audio/media/browser failure | `FALLBACK.TECHNICAL_FAULT` | “The audio did not load, so this attempt was not counted. Choose a replacement Listening task or continue with another skill.” | Mark affected scope not counted/pending, preserve all else |
| Microphone denied/unavailable | `CONTEXT.NO_MIC` | “Speaking cannot be measured without a working microphone. You can fix access, switch device, or rehearse by typing; typed work will not count as oral evidence.” | Local alternatives; oral gap remains |
| Network/offline limitation | `CONTEXT.OFFLINE` | “This activity needs a connection. Your saved work is unchanged; continue with an available checked task or return later.” | Cached low-risk work; no duplicate evidence |
| Productive evaluation slow/unavailable | `FALLBACK.EVALUATOR_PENDING` | “Your response is saved. Evaluation is pending; only the conclusions that need it will wait.” | Continue unrelated coaching; notify non-interruptingly |
| Projection rebuilding/stale | `UNCERTAINTY.PROJECTION_UPDATING` | “Your evidence is updating. We are keeping the last safe view and will not make a new high-stakes claim yet.” | Last-good or smallest direct recheck |
| No fresh retry after repair | `FALLBACK.NO_FRESH_RETRY` | “The repair is saved, but we do not have a fresh equivalent check. Transfer remains pending and will return later.” | Never reuse exposed answer |
| Access path changes tested capability | `VALIDITY.ACCESS_EQUIVALENCE` | “This option keeps the task accessible but tests a different capability. It is useful practice; the original evidence gap remains.” | Narrow explicit claim; other App areas stay available |
| Plan changed after new evidence/date/context | matching source reason + `CONTEXT.TIME_CHANGED` if applicable | “What changed” fact, its meaning, and the new one primary action | New immutable revision at safe boundary |

Reviewed templates are the normal path. A bounded language model may phrase a nuanced productive diagnosis only after structured truth exists and only with the minimal necessary response/context under later Stage 19 policy. If generated copy conflicts, adds certainty, invents emotion/cause, changes evidence semantics, or fails validation, reject it and use the reviewed template. Routine plan selection, Why copy, Remember copy, state update, or replan uses no model call.

## 11. Failure, recovery, accessibility, security, and rights

### 11.1 Local failure matrix

| Failure | State/evidence effect | Recovery | Forbidden consequence |
|---|---|---|---|
| Planner query/assembly failure | `failed`/`blocked`; last-good only if compatible and safe | Bounded retry; minimal approved fallback/Just practice path | Empty spinner, random activity, learner failure |
| Projection source changes mid-assembly | Candidate revision is not published | Reassemble latest cut idempotently | Mixed-cut plan |
| Content invalid/quarantined/rights-ineligible | Candidate excluded; active affected attempt validity handled upstream | Fresh compatible replacement and targeted recompute | Serve restricted bytes or score learner negatively |
| Media, permission, device, browser, or network fault | Affected scope pending/interrupted/not counted | Resume if integrity holds; otherwise alternative/replacement | Convert fault to wrong answer, weakness, regression, or readiness input |
| Evaluator pending/fails/disagrees | Dependent dimensions pending/limited | Continue unrelated; one justified later escalation or fresh sample | Fabricated feedback, repeated paid retries, global block |
| Accessibility path unavailable | Local activity unavailable/system fault | Equivalent access path, different valid activity, narrower explicit claim | Block whole App or label inability |
| Time estimate overruns | Close at next meaningful boundary; optional block removed | Partial completion and replan | Rush, silently exceed promise, failed-session score |
| Duplicate request/result/reconnect | Return same semantic plan/attempt/evaluation outcome | Idempotent convergence | Duplicate evidence/obligation |
| Unsupported contract/reason enum | Fail closed locally and expose compatibility fallback | Upgrade client/dual-read supported major | Client-invented default |
| Learner deletion during pending work | Terminal `deleted`; reject/erase later personal result under deletion journal | No reconstruction without new authorized facts | Orphan plan/evaluation/projection |

Technical, content, media, accessibility, browser, network, partner, permission, or evaluator failure has zero negative learner effect.

### 11.2 Accessibility and fairness

- Access context is an eligibility input, never a global ability flag. A no-audio/no-mic/keyboard/screen-reader constraint filters only activities that cannot currently be performed responsibly.
- Equivalent, non-answer-bearing access support does not weaken evidence. If an adaptation changes the tested capability, the exact alternate lane/condition is recorded and the original gap remains.
- The pre-activity contract announces goal, conditions, allowed help, duration, device requirements, and measurement consequences in text, not color alone.
- One dominant action, logical focus order, keyboard operability, screen-reader names/states, reduced-motion-safe transitions, 200% text reflow, and 44×44 minimum targets remain downstream UI gates. Disabled primary actions state why and provide an alternative.
- Timers may be hidden without changing timing. Practice timing may adapt. Exact P4 timing changes only under a verified official accommodation/equivalence policy owned later.
- Assistance requested after an attempt does not retroactively alter that attempt. Transcripts, typed rehearsal, monologue, or alternate input never silently satisfy Listening, oral production, or interaction evidence.
- A learner far below target receives a reachable prerequisite at an honest condition; a learner already near target may receive direct P3/P4 work. P0–P4 remains local and hidden as a global badge.

### 11.3 Security, privacy, and rights

The planner reads normalized claim/projection states, reason codes, date/context, obligation identifiers, and approved content metadata. It does not need full response text, transcripts, audio, complete event history, contact data, or raw Corpus material. Productive evaluators receive only the minimum response/task/rubric context required for their existing bounded purpose; no model receives full learner history merely to choose or phrase a plan.

Learner state stays in App-owned storage. Corpus receives no learner identifier, profile, choice, weakness, response, or schedule; routine planning queries only App-imported compatible rights-approved bundles. Logs and metrics carry opaque identifiers, versions, timing, status, reason/fallback codes, counts, and cost class—not response text, plan copy containing sensitive facts, audio, transcript, or content bodies.

Learner authorization scopes plan/session/evaluation reads and writes. Export includes portable session/plan explanations and learner facts as later specified; deletion removes personal plans, sessions, pending jobs/results, and projections coherently under Stage 05. Raw speaking audio remains ephemeral under the accepted ≤7-day policy. Stage 23 owns jurisdiction-specific legal review; this stage makes no compliance claim.

## 12. Compatibility, correction, and re-planning

| Change | Compatibility and coaching effect |
|---|---|
| Add optional candidate/reason detail | Minor-compatible when older consumers have a safe exhaustive fallback |
| New/changed reason, state, key, precedence, or evidence meaning | Contract/policy major; dual-read/shadow required; unknown major fails closed locally |
| Parameter/duration estimate/template text change | Immutable version with provenance, effective date, validation result, and rollback; stable product rules/precedence cannot be tuned away |
| Evidence validity/evaluator/content correction | Targeted upstream rebuild; plan input source cut changes; replan future blocks only; completed attempt/session history stays auditable |
| Content/taxonomy/blueprint/rubric incompatibility | Exclude/suspend affected candidate/claim; use last compatible approved bundle or broader task; preserve defensible history |
| Date/context/access change | New plan revision for remaining work; no evidence mutation |
| Plan policy change | Shadow replay golden/representative requests, compare selection/reasons/fairness/cost, publish new version atomically, retain rollback |

A published plan revision is immutable. If its source cut becomes materially unsafe before start, the server returns `replanned` with exact reason rather than starting stale high-stakes work. If the learner is already inside an unaffected activity, finish the meaningful boundary and apply the new revision afterward. A validity/safety revocation for the active content stops only that activity.

## 13. Alternatives, rationale, consequences, and exits

| Decision | Chosen default | Simpler/do-nothing alternative | More complex alternative | Rationale, consequence, exit/review trigger |
|---|---|---|---|---|
| D01 planning | Deterministic eligibility + lexicographic policy + ordinal ties | Hand-authored fixed rotation or learner-only catalog | Weighted optimizer / LLM planner / learned ranking | Fixed rotation ignores pass gates/due uncertainty; weighted/model plans can hide precedence and cost. Deterministic replay/explanation is required. Revisit bounded ranking only after measured retained-transfer/readiness benefit; hard precedence remains authoritative. |
| D02 autonomy | Distinct Coach me and Just practice origins with material-consequence copy | One generic “start practice” path | Preference-learning agent/control percentage | Generic path loses intentional distinction; preference agent risks serving comfort and inferring traits. Exit is stateless per-request context and reviewed alternatives. |
| D03 state | Immutable plan revisions and explicit session/activity/episode/attempt boundaries | Mutable current-plan/session row | Full event-sourcing framework/streaming workflow engine | Mutable rows erase causality and late-result safety; full event sourcing adds operations. Relational append facts and rebuildable plan projections are sufficient and portable. |
| D04 loop | Six semantic states with bounded compression/deferment | Six mandatory screens or ad hoc feature loops | General workflow DSL/BPM engine | Mandatory screens create friction; ad hoc loops break evidence; workflow platform is excessive. A typed policy/state table is sufficient; UI may compress semantics. |
| D05 concurrency | Attempt-scoped async evaluation; nonblocking unrelated work; safe-boundary replan | Block whole session until evaluation | Real-time event streaming/orchestration service | Blocking harms reliability; streaming adds cost/ops. Existing durable jobs and source cuts handle personal scale. Upgrade only if measured pending volume/order cannot meet correctness/latency after database/job tuning. |
| D06 copy | Structured reason registry + reviewed templates; bounded generated prose only after truth | One generic reason/no explanation | Free-form conversational coach/planner | Generic copy is not traceable; free-form copy can invent truth and adds per-session cost. Templates are the outage/cost/privacy fallback and permanent exit. |
| D07 access/failure | Local eligibility degradation and honest narrower claim | Globally disable flow/device | Maintain separate modality-specific applications | Global block violates access; separate apps duplicate foundation. Shared five-skill shell with modality extensions remains sufficient. |
| D08 versioning | Source cuts, major/minor compatibility, shadow/rollback | Change policy constants in place | Online experimentation/control plane | In-place changes destroy explanation; experiment platform is premature. Immutable bundles on existing stack are sufficient until calibration scale proves otherwise. |

## 14. Performance, reliability, operations, and cost

### 14.1 Operational model

Planning runs in the existing modular App over PostgreSQL-published projections and App-cached approved content. No new service, model, queue, warehouse, stream, vector database, or provider is introduced. Durable existing jobs handle evaluation and affected projection/replan work; ordinary plan assembly is synchronous and deterministic with an idempotent request/result.

Initial operational objectives are versioned launch hypotheses, not learner truth:

- normal current-cut plan assembly p95 ≤1 second excluding network, with interaction acknowledgement near the accepted ~100 ms UI target;
- identical request/source cut/policy/content versions yield identical selected IDs, ordering, reasons, and checksum 100%;
- no published plan mixes source cuts or uses an ineligible/rights-incompatible candidate;
- a late evaluation never changes original attempt conditions and never interrupts an unrelated active activity;
- no system fault creates a learner-negative evidence/lifecycle/Readiness effect;
- plan overrun and fallback rates are measurable by activity kind/access context without storing learner content.

Monitor plan latency, candidate rejection reasons, source-cut supersession, deterministic checksum mismatch, plan/actual duration error, partial/blocked/resume/replan rates, override and material-consequence rates, direct-lane and Written/Oral selection distribution, repeated avoidance offers, due-window outcomes, pending evaluation age, late-result age, no-valid-plan/content-inventory gaps, access-context local fallback, unknown enum/template, job retry, evaluator/cost class, and model/template fallback—all privacy-minimized.

### 14.2 Cost, fallback, provider exits, and upgrade triggers

Routine planning and copy have negligible marginal AI cost. They use structured deterministic policy, indexed published projections, reviewed/cached content, precomputed Corpus intelligence, and reviewed templates. Writing/Speaking may use the one bounded evaluation already justified by the activity; Coaching makes no second call for ranking, memory, or prose.

Recurring/variable costs are existing PostgreSQL storage/query/backup, existing worker execution, approved content/media storage/delivery, and bounded productive evaluation. There is no Stage 08 provider or egress commitment. Cheaper fallback is the last safe compatible plan, a broader reviewed activity, local objective/due work, templated copy, deferred fine check, or Just practice from the compatible pool. Truth, direct Writing/Oral opportunity, access, and recovery are never removed to save cost.

Provider exit remains standard PostgreSQL logical export/import, ordinary relational jobs replacing pg-boss, S3-compatible content/media export, and evaluator adapter substitution with preserved request/result versions. No planning truth lives in Render, R2, a model provider, Corpus runtime, or a client cache.

Review/upgrade only after ordinary query/index/cache/batching tuning when, for seven consecutive days, normal assembly p95 exceeds 1 second, source-cut/job delay misses a decision window, or compatible inventory causes material no-plan/fallback rates; or when controlled evidence shows a bounded alternative materially improves retained transfer/readiness calibration without fairness/privacy/cost regression. Any future model ranks a bounded eligible set behind immutable hard constraints, is exceptional rather than per-session, caches its result, publishes uncertainty, and always falls back to the deterministic plan.

## 15. Validation and release evidence

| Risk/invariant | Required validation before release |
|---|---|
| Precedence drift | Golden cases for validity/fairness, directness, each independent gate, uncertainty, due work, coverage, preference; property test that a lower dimension never defeats a higher one |
| Written/Oral compensation | Metamorphic tests swapping stronger/weak component; assert weaker/under-evidenced gate remains independently protected |
| Missing/pending truth | Tests that absent has no numeric field and pending blocks only declared dependent conclusions |
| Determinism | Replay identical request/source/policy/content cuts across process restarts; byte-equivalent ordered IDs/reasons/checksum |
| Reachability/progression | Cases for far-below learner, near-target learner, one-axis probe, assistance request, target attempt early; no global P0–P4 gate |
| Override fairness | Every matrix row; assert no refusal/avoidance/stop/choice creates negative evidence, recurrence, regression, readiness, or compliance score |
| Boundaries | Property tests that plan/session/activity/episode/attempt IDs never collapse; retry is fresh attempt; same episode is not retention |
| Partial/resume | Check every interruption row, exposure integrity, timed pause, later re-ranking, and no backlog/session-failure percentage |
| Late evaluation | Concurrent/out-of-order/duplicate/delete/quarantine/source-change tests; original conditions immutable; active unrelated activity not rewound |
| Canonical loop | All legal compress/defer branches plus retry-cycle cap, mock batching, no-fresh-retry pending, Remember always persists valid facts |
| Failure ownership | Inject plan/content/audio/mic/network/browser/evaluator/access faults; zero learner-negative effect and useful local alternative |
| Accessibility | Keyboard/screen reader/reflow/reduced motion, non-color reasons, focus at transitions, hidden timer integrity, equivalent vs changed-capability support |
| Privacy/rights | Data-flow test proves no learner payload to Corpus and no full history to planner/copy model; authorization, export/delete, log redaction, rights incompatibility |
| Compatibility | Unknown state/reason/template/major fail-closed, minor additive path, dual-read/shadow and rollback |
| Cost/operations | Query plan/load tests, duration/fallback/pending/cost metrics without sensitive payloads; deterministic/template fallback under evaluator/provider outage |

Release a policy/template/parameter version only after golden and property suites pass, shadow results preserve invariants, selection/reason deltas are reviewed, access-context outcome distribution shows no unexplained exclusion, and rollback to the predecessor bundle is proven.

## 16. ADR

- `Architecture/adr/ADR-0015-deterministic-coaching-policy-and-revisioned-session-execution.md` — **Accepted**. It records the durable decision to use a deterministic lexicographic planner, immutable plan/session boundaries, attempt-scoped late evaluation, and reviewed reason/copy contracts.

## 17. Downstream handoff

Stages 11–13, 15–22, 24, 25, 27, and 28 must preserve:

- validity/fairness eligibility and the binding lexicographic order: direct evidence → independent Written/Oral risk → uncertainty → due repair/retention → progression/coverage → preference;
- one dominant recommended action, Standard 25 with Quick 10/Extended 45, and normally at most one secondary major block/two major skill contexts;
- distinct `Coach me` and `Just practice X`; override changes plan/conditions, never truth, and creates no compliance/ability penalty;
- immutable plan revisions and separate session/activity/episode/attempt identities; meaningful-boundary saving, no backlog, no failed-session percentage;
- six canonical semantic states and legal compression/deferment; Attempt/Remember invariants, fresh retry, bounded cycle, measured-block coaching deferment;
- attempt-scoped Pending/late evaluation, original-condition immutability, affected-scope blocking, and safe-boundary replan;
- structured/versioned reasons plus reviewed fact → meaning → next action fallback; no model planner, no full history for copy, no pass probability;
- local access/failure degradation, equivalent support treatment, explicit narrower claims, and zero learner penalty for system faults;
- App-only learner history, asynchronous cached Corpus bundles, compatible rights-approved content, and deterministic low-cost fallbacks.

Dependencies introduced:

- `PlanningRequest`, `PlanningSourceCut`, immutable `PlanRevision`, `SessionInstance`, activity/episode/attempt references, policy/reason/template versions, and deterministic checksum;
- stable reason/fallback registry and client-visible discriminated plan/session states;
- source-cut-aware safe-boundary replan and idempotent evaluation result handling;
- an approved-content availability query over App-cached bundles, never live Corpus search.

Dependencies avoided/removed:

- no planner microservice, workflow engine, streaming platform, warehouse, learned knowledge tracer, weighted pass-probability score, per-session LLM planner/copy call, global P0–P4 level, compliance score, routine Corpus call, or new provider.

## 18. Risks, assumptions, and validation needs

| Risk/assumption | Evidence needed | Trigger/action |
|---|---|---|
| Lexicographic policy may overselect a narrow direct sample | Retained transfer, coverage, override, and readiness-decision utility by reason | Tune within-dimension ordinal parameters only; never reverse precedence without product/Stage 27 review |
| Duration metadata may be inaccurate by modality/access context | Planned vs meaningful-boundary actual duration distributions | Version duration estimates; remove optional blocks; do not rush |
| Reason templates may be technically true but confusing | Comprehension/accessibility tests and dispute/alternative selection | Revise template version; structured truth/reasons stay stable |
| Pending productive work may age unnoticed | Pending-age and dependent-block duration by dimension | Improve worker/evaluator or prompt fresh sample; no global block/repeated paid retry |
| Inventory gaps may bias away from Oral/Writing | No-valid-plan/fallback and selection distribution by direct lane | Prioritize offline approved inventory work; cost may not suppress a pass-critical modality |
| Context/access filtering may create hidden exclusion | Eligibility/rejection and successful-alternative rates by access context | Accessibility review and equivalent/alternate content; never weaken truth silently |
| Replanning could feel unstable | Plan supersession frequency, cause, completion/override outcomes | Debounce nonmaterial updates and replan only at safe boundaries; name material change |

No owner preference, budget, or legal-risk tolerance blocks Stage 08.

## 19. Intentionally deferred implementation choices

| Choice | Future owner | Constraint already fixed here |
|---|---|---|
| Exact endpoint/event/job names, transport and database tables/indexes | Stage 12 | Idempotency, source cut, immutable revision, exhaustive states, safe-boundary semantics |
| Exact responsive screens/components/focus transitions and local state store | Stages 13–14 | One dominant action, semantic loop states, accessibility/failure copy and conditions |
| Skill-specific content/activity/evaluation details | Stages 15–18 | Shared boundaries, attempt/evidence conditions, Pending and fallback contract |
| Evaluator/model selection, confidence thresholds and spend caps | Stage 19 | One bounded productive purpose, no planner/copy call, minimal context, one escalation ceiling |
| Account/local-first sync, conflict, checkpoint and offline mechanics | Stages 20–21 | Immutable IDs/revisions, meaningful boundaries, idempotency, no evidence duplication |
| Notification delivery/time zone behavior | Stage 22 | Plan/obligation reasons only; no missed-day evidence or nagging/debt |
| Jurisdiction-specific security/privacy/rights/legal review | Stage 23 | App-only learner data, minimization, rights-compatible content, export/delete coherence |
| Dashboards, calibrated thresholds, service objectives | Stage 24 | Required metrics, privacy minimization, cost/fairness gates |
| Executable suites and release gates | Stage 25 | Required golden/property/concurrency/accessibility/failure/privacy tests |
| Cross-stage scenario validation and consolidated roadmap | Stages 27–28 | All Stage 08 invariants and ADR continuity |

Stable product rules—25/10/45, one dominant action, distinct request paths, evidence boundaries, lexicographic precedence, independent gates, missing as absence, no pass probability—are not deferred.

## 20. Decisions made

1. Adopted a deterministic, versioned lexicographic planner and reconciled the later Stage 27 precedence with earlier coaching tiers.
2. Defined eligible candidate inputs, source cuts, availability states, comparison/tie-breaking, plan pseudologic, budget rules, and deterministic checksum.
3. Defined distinct Coach me and Just practice requests, compact alternatives, material-consequence rules, and the complete non-punitive override matrix.
4. Separated plan revision, session, activity, coaching episode, attempt, and evaluation identities and made plan revisions immutable.
5. Defined session statuses, stop/pause/resume/replan behavior, meaningful-boundary persistence, and later re-ranking without backlog.
6. Defined the canonical loop state/evidence contract, allowed compression/deferment, retry/cycle cap, and measured-block behavior.
7. Defined attempt-scoped Pending and late-evaluation concurrency with idempotency, original-condition immutability, affected-scope recomputation, and safe-boundary replan.
8. Defined stable reason families, reviewed fallback copy, model/copy rejection rules, exhaustive client states, compatibility, and rollback.
9. Defined local failure/accessibility degradation, privacy/rights/data minimization, deterministic cost/operations, provider exits, and upgrade triggers.
10. Defined validation and downstream handoff with no owner blocker.

## 21. Definition-of-done check

- [x] Every required input was fetched from current `main`; commits/blob SHAs and prerequisite continuity are recorded.
- [x] Exact-path source tensions are reconciled under authority without editing Shaping or Design.
- [x] Daily-plan inputs, binding lexicographic precedence, ordinal comparison, deterministic selection/ties, and reasons are settled.
- [x] Coach me, Just practice, alternatives, context/time changes, early target/mock choices, and non-punitive overrides are settled.
- [x] Plan/session/activity/episode/attempt boundaries, one dominant action, limited secondary scope, partial/stop/resume/replan are settled.
- [x] Canonical loop state machine, compression/deferment, bounded retry, measured blocks, and productive Pending branches are settled.
- [x] Deterministic policy is separated from bounded productive evaluation/generated prose; reviewed fallback reasons/copy are defined.
- [x] Late-evaluation ownership, idempotency, concurrency, original conditions, and safe-boundary replan are settled.
- [x] Credible alternatives, consequences, exits, cost/security/privacy/rights/accessibility/failure and upgrade triggers are explicit.
- [x] Planning pseudologic, session/loop diagrams, request sequences, override matrix, reason/fallback contract, and partial/resume table are present.
- [x] ADR-0015 is accepted and traceable; downstream invariants, risks/tests, dependencies, deferrals, and no blockers are explicit.
- [x] The exact Stage 08 deliverable and only Stage 08 checklist section are ready for final GitHub verification.

Stage 08 has no unresolved owner question. All implementation details not owned here have an explicit future owner and a fixed architecture boundary.
