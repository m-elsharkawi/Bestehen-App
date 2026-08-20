# Bestehen / App — Final Product Specification

> **Status:** Authoritative Stage 28 product specification  
> **Product:** Bestehen / App  
> **Target at launch:** TELC Deutsch B1  
> **Audience:** Product design, architecture, implementation, content, evaluation, and future calibration work  
> **Authority:** This document consolidates Stages 01–27. The linked stage documents remain the detailed normative source for their domain. If stage-local rules appear to conflict when combined, the cross-stage precedence rules in this document govern.

## 1. Purpose and Scope

Bestehen / App is a **personal German exam coach that teaches German through TELC B1 preparation and continuously tells the learner where they stand, what is holding them back, and what to do next**.

The initial learner may be around A1, wants a B1 certificate, and values passing the exam over completing a broad conventional curriculum. Bestehen therefore works backward from the exam: **observe, attempt, diagnose, repair, retry, remember**. It adapts language, support, timing, and realism while keeping the exam purpose visible.

The complete product includes:

- onboarding, goal/date setup, and an adaptive five-skill diagnostic;
- a persistent learner model and Mistake Memory;
- daily coach-selected training and learner-directed practice;
- Reading, Language Elements, Listening, Writing, and Speaking coaching;
- review, delayed transfer, and spaced retention checks;
- skill-specific A1→B1 progression into target conditions;
- TELC-aligned Readiness, mocks, and Ready-to-Book logic;
- calm coach behavior, restrained motivation, and useful reminders;
- rights-safe original practice grounded in Corpus intelligence;
- account-optional first use, data ownership, accessibility, resilience, analytics, and cost controls.

This is a product specification, not an architecture. It defines observable behavior, evidence semantics, quality boundaries, and launch expectations. It intentionally does not choose frameworks, providers, schemas, deployment topology, model vendors, or storage mechanisms.

### 1.1 Product boundary

Bestehen / App is the learner product. It owns learner state, coaching decisions, approved practice content, evidence interpretation, Readiness, and UX. Bestehen / Corpus is a separate evidence and intelligence product. It does not become a learner-facing catalog, and the App does not treat raw reference material as practice inventory merely because it is authentic or publicly accessible.

### 1.2 Initial non-goals

Bestehen is not initially:

- a complete general-German course;
- a generic CEFR placement service;
- a substitute for an official TELC result or a pass guarantee;
- an exercise marketplace, source-document browser, or verbatim exam archive;
- a social network, leaderboard, streak game, or virtual-currency economy;
- a live human tutor or examiner service;
- a multi-exam public SaaS product, native-app suite, or enterprise platform;
- an advertising or learner-data monetization product.

## 2. Inputs and Existing Decisions

The specification preserves the shared [Product Overview](../01_Bestehen_Product_Overview.md), [Identity](../02_Bestehen_Identity.md), the live [App checklist](../Bestehen_App_Product_Shaping_Checklist.md), and every App shaping output:

| Stages | Settled product domain | Detailed authority |
|---|---|---|
| 01–02 | Thesis and complete learner journey | [Product Thesis](01-product-thesis.md), [Learner Journey](02-complete-learner-journey.md) |
| 03–05 | Diagnostic, learner model, and Mistake Memory | [Diagnostic](03-initial-diagnostic.md), [Learner Model](04-learner-model.md), [Mistake Memory](05-mistake-memory.md) |
| 06–08 | Daily coach, canonical loop, and A1→B1 progression | [Daily Engine](06-daily-coaching-engine.md), [Learning Loop](07-core-learning-loop.md), [Progression](08-a1-to-b1-progression.md) |
| 09–13 | All exam-skill experiences | [Reading](09-reading-training.md), [Language Elements](10-language-elements-training.md), [Listening](11-listening-training.md), [Writing](12-writing-coaching.md), [Speaking](13-speaking-coaching.md) |
| 14–17 | Review, Readiness, mocks, and Ready to Book | [Review](14-review-and-spaced-repetition.md), [Readiness](15-telc-readiness.md), [Mocks](16-mock-exams.md), [Ready to Book](17-ready-to-book-logic.md) |
| 18–20 | Coach behavior, information architecture, and motivation | [Coach](18-coach-personality-and-behavior.md), [IA](19-information-architecture-and-core-screens.md), [Progress](20-progress-and-motivation.md) |
| 21–23 | Content, controls/Corpus contract, and urgency/reminders | [Content](21-content-strategy.md), [Controls and Corpus Contract](22-user-controls-vs-coach-autonomy.md), [Urgency](23-exam-date-and-urgency.md) |
| 24–26 | Analytics/data, business boundary, and non-functional expectations | [Analytics and Data](24-analytics-and-success-metrics.md), [Business Boundaries](25-business-model-and-product-boundaries.md), [Platform and Accessibility](26-platform-accessibility-nonfunctional.md) |
| 27 | End-to-end validation and cross-stage precedence | [Scenario Validation](27-end-to-end-scenario-validation.md) |

### 2.1 Reconciliation result

Stage 27 validated nine representative journeys: A1 Day 1, A2 midpoint, strong Reading/weak Speaking, a 30-day deadline, return after a break, failed full mock, Speaking coaching, Writing repair, and Ready-to-Book transition. It found **no earlier decision that requires reversal**.

The only missing system-level rule was how correct stage-local decisions combine. This specification adopts the following precedence:

1. **Validity and fairness:** broken content, media, input, evaluator, or access conditions cannot become learner failure.
2. **Direct evidence:** direct performance in the claimed modality outranks inference from another skill.
3. **Independent pass risk:** the weaker of Written and Oral controls overall Readiness and coaching risk.
4. **Uncertainty resolution:** collect the smallest useful clarifier before committing to a large repair or high-stakes claim.
5. **Due repair and retention:** protect time-sensitive transfer and retention evidence.
6. **Progression and coverage:** advance realism and fill meaningful target/task-family gaps.
7. **Learner preference:** shape the valid plan without changing evidence truth.

Exam-date urgency changes the value and order of valid actions but never changes ability, evidence strength, pass thresholds, or evaluator confidence.

## 3. Product Decisions and Rationale

### 3.1 The objective function is defensible exam readiness

Features must improve the learner's chance of passing, improve the quality of the readiness decision, or make the preparation process usable enough to sustain those outcomes. Activity volume, time in app, streaks, and content completion are supporting observations—not success definitions.

### 3.2 Learning evidence and Readiness evidence are different

Supported A1/A2 work, bridge activities, same-session retries, explanations, and practice with help can represent real learning progress. They cannot manufacture a TELC B1 target-score estimate. Readiness requires fresh, direct, target-mappable B1 evidence under the conditions claimed.

### 3.3 The coach chooses a strong default; the learner retains agency

The Coach/Home route normally offers one dominant recommended action and explains why. The learner may shorten, replace, postpone, request help, choose a skill, select easier/harder work, stop, or start a mock early. The choice changes the plan and the evidence conditions, not the interpretation of the result.

### 3.4 Readiness is conservative and reversible

Written and Oral are judged separately because TELC requires each to pass. Readiness can rise, fall, become stale, or return to evidence-building when newer evidence contradicts older evidence or coverage expires. Historical progress and milestones remain true even when current readiness changes.

### 3.5 Productive AI is bounded and uncertainty-aware

Writing and Speaking benefit from model-assisted evaluation; Speaking may also need transcription and adaptive partner behavior. The default is one structured evaluation at the cheapest quality level proven adequate, at most one justified escalation for a pass-critical or genuinely ambiguous case, then an honest Pending/uncertain result. No generated prose may override structured state.

### 3.6 Complete product, phased validation

The target product is complete across all five skills, review, mocks, Readiness, and booking guidance. Delivery may be sequenced for private validation, but an incomplete slice must not claim complete TELC readiness. Later phases should deepen accuracy, content scale, calibration, and polish—not rescue a product that omitted a pass-critical modality.

## 4. Complete Learner Journey

| State | Learner experience | Coach decision / transition |
|---|---|---|
| First visit | See the exam-coach promise and begin without an account wall | Ask only for TELC B1 goal context, date status, available time, explanation language, and relevant access/device needs |
| Goal setup | Choose No date, Target month, Exact planned date, or Booked exact date | Date initializes planning urgency only; it does not create Readiness |
| Diagnostic | Complete a resumable adaptive five-skill baseline | Route each skill independently; stop unnecessary hard probes; retain incomplete valid evidence |
| Starting snapshot | See Written/Oral state, five skill signals, confidence, blockers, gaps, and one recommended action | Withhold false precision; prioritize missing decision-relevant evidence or a reachable blocker |
| First coached session | Experience a complete exam-shaped loop | Choose one reachable, high-value issue so the product demonstrates attempt → diagnosis → repair → fresh check |
| Daily preparation | Use Coach me or Just practice X | Rebuild the time-bounded plan from current risk, due review, uncertainty, progression, deadline, context, and preference |
| Weekly/monthly review | See meaningful changes, not an activity recap | Explain capability, evidence, weakness, Readiness, and plan changes; omit noisy summaries |
| Realism transition | Progress independently by task family/skill lane | Fade one support or add one constraint at a time; confirm on a later fresh occasion |
| Mocks | Take mini, section/component, or full measurement blocks when useful | Recommend the smallest mock that answers the current decision; preserve exact validity conditions |
| Safe range | Both components have a conservative margin and decision-grade evidence | Maintain and close any booking-specific confirmation gaps; never promise a pass |
| Ready to Book | All Stage 17 gates pass | Recommend booking and explain the evidence; preserve learner choice |
| Booked preparation | Enter date-aware Build & Confirm, then Taper & Execute | Protect weak-pass risk, fresh confirmation, execution, and recovery; avoid late cramming/full-mock theater |
| Exam/post-exam | Show practical final-day guidance, then Outcome pending / Passed / Not passed | Stop urgency when the exam is marked complete; optionally collect the result; maintain, close, or rebase the goal |
| Return after absence | Resume without debt or shame | Preserve history, refresh only the smallest stale evidence set that changes today's decision, and rebuild the plan |

### 4.1 Onboarding and diagnostic rules

- Core first use is account-optional.
- The diagnostic has a **20-minute adaptive core**, normally 18–22 minutes, a 12–16 minute foundation route, and a hard 30-minute ceiling for useful stronger-learner extension.
- Reading, Language Elements, Listening, Writing, and Speaking are all offered directly. Writing is a short functional response; Speaking is a 45–90 second sample plus a fixed two-turn planning interaction.
- A minimum useful provisional baseline needs evidence in at least three of five areas, including one receptive/objective and one productive area. Below that, the primary action is Resume diagnostic.
- Skill routing is independent. Strong objective performance may step up; clear overwhelm steps down or exits after one easier confirmation. Routing heuristics guide content choice and are not Readiness cutoffs.
- The diagnostic initializes evidence observations and candidate mistake signals; it never grants high confidence, a global CEFR placement label, or Ready-to-Book evidence.
- Learner-facing starting language is Foundation, Bridge to B1, B1 evidence building, or Not enough evidence by skill—not one reductive level.

## 5. Learner Model and Mistake Memory

### 5.1 Learner model

The learner model is an **append-only evidence ledger plus derived state** over a shared, versioned skill graph. At product level every relevant observation preserves:

- skill, section, task family, capability nodes, and topic/domain context;
- served difficulty/realism profile and content/blueprint version;
- direct modality/lane, including receptive versus productive and production versus interaction;
- response, completeness, score/rubric dimensions actually observed, timing, playback, and assistance offered/used;
- content, technical, evaluator, and fairness validity;
- evaluation method and confidence;
- independent episode/fresh-content identity;
- timestamp, recency, mock/diagnostic/practice context, and relevant accessibility condition.

Derived state includes capability/mastery band, confidence, freshness, stability, assistance dependence, timing status, section/component rollups, mistake lifecycle, progression profile, and Readiness. The learner does not see a raw internal graph; the UI translates it into useful evidence, blockers, and next actions.

Core rules:

- direct evidence is required for the claimed modality;
- support and timing are dimensions, not global discounts;
- offered-but-unused or post-response help does not weaken the original attempt;
- missing evidence stays missing; strong evidence elsewhere does not fill it;
- time makes evidence stale, not historically false;
- invalid evidence is excluded rather than scored as poor performance;
- Corpus relationships may propose what to verify but cannot invent learner mastery.

### 5.2 Mistake Memory

Mistake Memory stores the **coachable shortfall and likely cause**, not merely the wrong answer. It separates:

- a mistake event;
- a repair-chain episode;
- a recurring pattern;
- a known weakness.

The primary cause taxonomy includes vocabulary, grammar, listening recognition, misunderstanding, exam strategy, attention/careless, production, timing, unresolved cause, and non-learner invalidation. Diagnosis uses one primary and at most one contributing cause, each with confidence.

Lifecycle:

`Candidate → Known → Repairing → Stabilizing → Repaired → Resolved`, with historical/unconfirmed and reopened paths.

Default promotion to a known fine-grained weakness requires two independent failure episodes across two sessions/days, enough comparable opportunities, meaningful recurrence, medium cause confidence, direct evidence in the claimed lane, and valid conditions. Repeated errors inside one response or retries in one repair chain count as one episode.

Repair requires:

1. a responsible pattern statement;
2. the smallest targeted explanation or controlled practice;
3. a fresh equivalent retry;
4. a delayed fresh transfer check;
5. broader/target-condition confirmation when the claim requires it.

Immediate retry success means responsive to repair, not retained or resolved. Productive weaknesses require productive repair evidence. Previously confirmed patterns may reopen on one new medium/high-confidence recurrence; questionable anomalies trigger a recheck instead.

## 6. Daily Coaching Engine and Canonical Learning Loop

### 6.1 Session contract

- Default daily session: **25 minutes**.
- Presets: Quick 10, Standard 25, Extended 45; custom time is bounded to 5–60 minutes.
- A Standard plan normally contains one dominant commitment and at most one secondary major block, usually across no more than two major skill contexts.
- A session optimizes **risk-adjusted expected Readiness gain per useful learner minute**, subject to validity, reachability, fatigue, device/context, review timing, coverage, and cost.
- Priority is lexicographic rather than an opaque precision score: pass-risk/evidence gap, due repair/retention, known weakness or clarifier, realism/coverage, then preference. Inside a tier, prefer recoverable exam impact, directness, decision value, reachable transfer, and efficient completion.
- Cost breaks ties between learning-equivalent options; it never displaces materially better pass-critical work.

The learner sees the expected time, the main goal, and a concise **Why this today?** explanation grounded in structured state.

### 6.2 Canonical loop

| State | Product behavior | Evidence meaning |
|---|---|---|
| Observe | State goal, conditions, allowed help, and why the task matters | Planning context only |
| Attempt | Capture a clean fresh response and actual conditions | Primary evidence observation |
| Diagnose | Validate the attempt, identify outcome and smallest defensible cause, or preserve uncertainty | Attribution, not new mastery |
| Repair | Deliver one focused explanation, cue, distinction, pattern, strategy, or micro-practice | Repair exposure, not independent mastery |
| Retry | Use new equivalent content in the same direct lane without answer-bearing help | Same-session fresh transfer; stronger than repetition, weaker than retention |
| Remember | Commit evidence, update state, schedule delayed transfer/monitoring, and explain what changed | Derived state only |

Repair and Retry are conditional: a valid correct attempt may go directly to Remember; a pending evaluator defers diagnosis; a mock defers all coaching until the measured block ends. Attempt is required for new ability evidence, meaningful shortfalls require at least a broad/pending diagnosis, and valid evidence is always remembered.

The loop avoids grind:

- normal repair is a short intervention, not a generic lesson;
- one useful re-diagnosis is allowed;
- retries use fresh equivalent content, not the exposed original;
- if fresh content is unavailable, transfer stays pending;
- stopping, skipping, or interruption preserves completed evidence and does not create a failed-session score;
- later return re-ranks unfinished work instead of carrying a backlog blindly.

## 7. A1→B1 Progression

Progression is skill- and task-family-specific, not a global course level.

| Rung | Experience | Evidence claim |
|---|---|---|
| P0 Supported Foundation | Short, concrete exam-shaped microtasks; substantial visible support; open timing | What is possible with support at accessible difficulty |
| P1 Guided A2 | Genuine A2 language and familiar exam mechanisms; selective support; soft timing | Functional A2 work and emerging independence |
| P2 A2/B1 Bridge | B1 task mechanisms with controlled language, longer input/output, limited help | Transfer toward B1-shaped performance |
| P3 Independent B1 Training | Genuine B1 tasks; no default answer-bearing help; explicit target-condition probes | Current B1 capability and accumulating direct evidence |
| P4 Target Conditions | Current TELC-like format, difficulty, length, timing/playback/reference rules, no in-attempt coaching | Strong target-condition Readiness/mock evidence |

Difficulty is multidimensional: language, task length, reasoning, distractors, topic familiarity, audio/acoustic load, output/interaction burden, assistance, and timing/playback. The coach normally changes one meaningful axis at a time.

Promotion uses stabilize → one-axis probe → provisional adoption → later confirmation. One probe may open a harder profile; it does not establish stable progression. Regression is equally local: after a difficulty wall, restore the smallest needed support, diagnose, and retry. Historical ability is not erased, and a learner needing P0 in one area is not globally labeled P0.

P4 is a measurement condition, not an unlocked level. A learner may request it early for a baseline, but the resulting validity—not permission—controls the evidence claim.

## 8. Exam-Skill Experiences

All learner-playable tasks are original/approved or explicitly rights-permitted. Every task preserves the target reasoning or communication mechanism at lower rungs and records assistance, timing, freshness, validity, and evaluation confidence.

| Skill | Target task families / rubric | Coaching experience | Measurement boundary |
|---|---|---|---|
| Reading | R1 global/heading matching; R2 detailed comprehension; R3 selective situation-to-notice matching | Teach gist vs scanning vs close reading, paraphrase/synonym recognition, distractor rejection, decisive evidence, and unknown-word strategy | Deterministic scoring; target timing is measured in the shared Reading + Language Elements block; translation/answer-bearing help cannot set Readiness |
| Language Elements | SB1 grammar/context; SB2 lexis/cohesion/context | Train contextual choice, semantic relation, syntax, governed chunks, register, cohesion, and why alternatives fail; frequency prioritizes but never diagnoses | Deterministic by default; no invented official standalone timer; eligible target evidence maps to current official units |
| Listening | H1 global; H2 detail; H3 selective | Progress speed, replay, speaker/audio variety, corrections/distractors, numbers/dates, connected speech, negation, inference, and attention; transcripts appear after attempt for diagnosis/repair | P4 follows current playback rules; transcript/in-attempt support cannot set Listening Readiness; strong evidence needs target-calibrated audio variety |
| Writing | Current target: one 30-minute informal/semi-formal email, four content points, evaluated through Aufgabenbewältigung, Kommunikative Gestaltung, Formale Richtigkeit | Plan obligations; mark each content point fulfilled/partial/not/uncertain; correct for B1 sufficiency; prioritize one or two material repairs; preserve learner voice; revise then use a fresh task | No invented word-count gate; P4 removes answer-bearing templates; model evaluation is versioned, structured, confidence-aware, and bounded |
| Speaking | S1 get acquainted; S2 discuss a topic; S3 plan together | Separate production from interaction; allow solo/fixed rehearsal early; use adaptive turn-based partner where previous meaning must shape S2/S3; diagnose task fulfillment, intelligibility, fluency, interaction, repair, language control | Actual voice is required for oral evidence; typed rehearsal is learning-only; S2/S3 interaction cannot be inferred from monologue; no coaching between clean measured parts |

### 8.1 Shared feedback rules

- Feedback begins with outcome, then decisive evidence, likely cause/confidence, smallest repair, fresh check, and what changed.
- Objective feedback explains why the learner's option was tempting and what disqualified it.
- Writing/Speaking feedback targets B1-functional sufficiency rather than advanced perfection.
- A model answer is optional, delayed, and never used to pretend the learner produced it.
- Ambiguous or defective content is quarantined; affected learner evidence is invalidated/recomputed without penalty.

## 9. Review and Spaced Repetition

Review manages **due coaching obligations**, not a permanent flashcard deck. Eligible obligations include vocabulary, grammar patterns, useful phrases, listening distinctions, Writing/Speaking patterns, exam strategy, delayed transfer, and target-condition rechecks.

Initial lifecycle:

`same-session fresh retry → 1–3 days → ~7 days → ~21 days → ~60 days/natural retention opportunity`

These are tunable launch defaults. Rules:

- natural fresh exam-shaped opportunities can satisfy due review;
- stronger-condition success can satisfy a weaker-condition obligation;
- immediate repair success is reported separately from delayed retention;
- spontaneous productive use is strong evidence for productive claims;
- one delayed failure returns to repair; two consecutive delayed failures trigger re-diagnosis/repair-quality review;
- repeated target-condition failure becomes a coherent priority, not a queue grind;
- overdue volume is collapsed by value; absence never creates review debt;
- exam urgency may compress intervals but cannot weaken evidence requirements;
- deterministic scheduling is the default; no premium AI is needed merely to decide what is due.

## 10. TELC Readiness

### 10.1 Current target anchor

The target definition is versioned and must be revalidated before implementation/P4 publication and after any TELC blueprint change. The shaped baseline is:

| Area | Maximum | Pass treatment |
|---|---:|---|
| Reading | 75 | Written component |
| Language Elements | 30 | Written component |
| Listening | 75 | Written component |
| Writing | 45 | Written component |
| **Written total** | **225** | **Must reach at least 135/225 (60%)** |
| Speaking | 75 | **Must reach at least 45/75 (60%)** |
| **Exam total** | **300** | Total points never override either component gate |

An overall 180/300 model is invalid. Strong Written cannot hide weak Oral and vice versa.

### 10.2 Representation and calculation

The learner sees:

- a band: Evidence building / Not enough evidence, Not ready, Borderline, or Safe pass range;
- a 0–100 Readiness Index only after both components meet minimum numeric-coverage rules;
- separate Written and Oral estimates/ranges versus their pass lines;
- Low/Medium/High evidence confidence;
- the primary performance blocker or evidence gap;
- no pass probability until real matched outcomes support empirical calibration.

Let `W` be predicted Written performance as a percentage of 225 and `O` predicted Oral performance as a percentage of 75.

**Readiness Index = min(W, O).** It is a bottleneck index, not a probability.

The component estimates mirror current official weights:

- Written points = `75 × Reading + 30 × Language Elements + 75 × Listening + 45 × Writing`;
- Oral points = `15 × S1 + 30 × S2 + 30 × S3`.

Only fresh, direct, current-blueprint-mappable, B1-level, valid E3/E4 observations can set these target estimates. Supported P0–P2 work, answer-bearing help, same-item retries, transcript-dependent Listening, typed Speaking, and uncertain evaluator output remain coaching evidence without raising the target score.

### 10.3 Eligibility, bands, and evidence breadth

A provisional numeric component estimate requires direct target-mappable coverage of every official scoring unit in that component. Overall index eligibility requires both components.

Initial bands:

- **Not ready:** normally below 55 with sufficient direct evidence, repeated P4 evidence below the pass line, or a clear pass-critical target-condition failure.
- **Borderline:** 55–64.9; a planning range crossing 60; an estimate ≥65 without decision-grade breadth; meaningful contradiction; or unstable pass-critical evidence.
- **Safe pass range:** estimate ≥65, lower planning-range bound ≥60, Medium+ confidence, complete decision-grade breadth, current blueprint, and no unresolved pass-critical contradiction.

Written decision-grade evidence covers R1–R3, SB1–SB2, H1–H3, and Writing; contains current target anchors for every written section; includes shared-block timing, target Listening playback, a clean timed Writing response plus another independent response, multiple occasions, and Medium+ section confidence.

Oral decision-grade evidence covers S1–S3 directly; includes real S2/S3 interaction, at least two fresh interaction contexts/occasions, a current full target-condition oral sequence, another independent recent oral occasion, judgeable intelligibility, and Medium+ part confidence.

Readiness movement is recalculated from evidence, not awarded as points. Explanations distinguish demonstrated performance change, evidence becoming more/less current, uncertainty resolution, and invalidation. Tiny/noisy changes are not celebrated.

## 11. Mock Exams and Ready to Book

### 11.1 Mock modes

| Mode | Purpose | Scope |
|---|---|---|
| Mini-mock | Answer one narrow measurement question with low burden | 8–25 minutes; one/few task families; no in-block coaching |
| Section/component mock | Measure a coherent official area or pass component | Reading+Language Elements, Listening, Writing, full Written, or full Oral |
| Full mock | Rehearse and measure the complete target package | Complete Written + Oral, preserving actual component conditions without inventing a false same-day endurance claim |

Mocks use current target timing/playback/reference rules, clean fresh forms, no in-block help, granular validity, and deferred coaching. A learner may always stop. Pausing, resuming, technical interruption, partner failure, or missing productive evaluation changes only the affected evidence claim; valid unaffected sections remain useful.

Every valid mock contributes ordinary evidence immediately. The label “mock” adds no secret multiplier. One mock is one correlated occasion. Post-mock analysis shows validity first, then component/section results, cause groups, at most two immediate priorities, evidence impact, and a repair plan.

After a failed full mock, the default is focused repair → delayed transfer → smaller decision-useful retest before another full mock. Passing repeatedly is a useful consistency milestone, not a reason for unnecessary repeated full mocks.

### 11.2 Ready-to-Book gate

Ready to Book is a gate over Readiness, not a second score. All gates must pass:

1. the TELC B1 target/blueprint and affected content/evaluations are current and valid;
2. Written and Oral are both Safe pass range;
3. complete Written and Oral decision-grade breadth remains current;
4. one clean passing full mock exists within 14 days;
5. within 30 days and independently of that mock, there is another clean Written-component pass and another clean Oral-component pass; a second full mock may satisfy both but is not mandatory;
6. overall confidence is Medium+, with no pending productive result, unresolved pass-critical contradiction, or unsupported target-condition/accommodation claim that could change the decision.

If the gates fail, the learner receives the exact blocker—performance gap or evidence/confirmation gap. Booking never changes Readiness. A learner may book early and receives calm deadline-aware risk coaching.

After booking:

- more than 21 days: normal deadline-aware coaching;
- 21–8 days: **Build & Confirm**—repair remaining risks and collect only useful confirmation;
- final 7 days: **Taper & Execute**—stabilize, protect execution, and reduce unnecessary load;
- final 48 hours: light review/logistics; no routine full mock.

Ready-to-Book status may reopen when evidence becomes stale or contradictory, while the historical milestone remains recorded.

## 12. Coach Personality, Information Architecture, and User Control

### 12.1 Coach behavior

Bestehen is the only coach identity; no mascot or separate character is required. The coach is calm, direct, diagnostic, practical, evidence-based, efficient, and encouraging only when progress is earned.

Meaningful messages follow **fact → meaning → next action**. The coach:

- explains learner-specific reasons and prefers one primary move;
- preserves B1-appropriate learner voice rather than rewriting toward perfection;
- distinguishes cause uncertainty, evidence uncertainty, and outcome uncertainty;
- can say that evidence is insufficient and turn that into a small next step;
- never promises a pass, invents emotion, uses shame, protects a streak, fakes intimacy, or speaks like an examiner;
- uses German for target performance and progressively more explanation, with English available when it improves understanding; target conditions never include explanatory help that changes the test.

Structured truth always precedes generated wording. If copy and state disagree, state wins and the generated copy is rejected/fallback text is used.

### 12.2 Information architecture

Primary navigation:

1. **Coach** — default route, current plan, one dominant Start/Continue action.
2. **Readiness** — current Written/Oral pass picture, confidence, blockers, evidence gaps, Ready-to-Book state.
3. **Train** — curated secondary choice hub, including Just practice X, review, and mock entry—not a giant catalog.
4. **Progress** — historical changes, milestones, repair/retention movement, and weekly/monthly reviews.

Goal/Exam Date and Settings are utilities. Supporting experiences include Today's Session, focused Attempt, Diagnosis/Repair/Fresh Check, Review obligations, Mock setup/attempt/results, and weakness detail.

Readiness owns current truth; Progress owns history. Review does not expose deck debt. Raw Corpus internals and raw learner-model graphs remain hidden. Responsive layout always prioritizes current action and pass risk over analytics.

### 12.3 Control boundary

Two explicit paths exist:

- **Coach me:** accept the strongest time/context-aware recommendation, with compact alternatives.
- **Just practice X:** select a useful skill/task/mode while receiving a brief consequence explanation only when the deviation is materially important.

Learner-controlled: time, schedule, energy/context, skill choice, support during ordinary practice, easier/harder/target-condition request, skipping/postponing, stopping, mock start, and notification preferences.

System-controlled and not configurable: target blueprint, scoring/pass rules, content/evaluator validity, actual assistance/timing labels, evidence strength, Readiness interpretation, mistake-history truth, and mock validity. There is no coach-control percentage, compliance score, advanced-settings escape hatch, or ability penalty for override.

## 13. Progress, Motivation, Notifications, and Urgency

### 13.1 Progress and motivation

Readiness is the primary progress concept. Supporting layers are:

1. current Written/Oral Readiness and evidence confidence;
2. capability/evidence movement and repaired/stabilizing weaknesses;
3. sparse meaningful milestones;
4. tertiary weekly preparation consistency.

Launch milestones: starting picture established; first section reaches target range; Oral Safe; Written Safe; first full-mock pass; repeated full-mock pass; Ready to Book. A section milestone is a Bestehen coaching milestone, not an official standalone pass gate.

No launch daily streak, XP, currency, hearts/lives, leaderboard, activity-derived level, collectible badge system, or punitive backlog is allowed. A potential plateau is a signal to change coaching strategy, not increase pressure.

### 13.2 Date and urgency

Date modes are No date, Target month, Exact planned date, Booked exact date, and Post-exam. Milestone modes at 60/30/21/7 days change planning emphasis. A target month remains a range; the product does not invent an exact day.

When time is short, triage scope before increasing volume. If the deadline is unrealistic, state the mismatch, identify the highest-value achievable plan, and preserve honest Readiness. The final day/exam day prioritize light review, logistics, equipment, route/time/documents, and execution.

### 13.3 Notifications and habit support

Notifications exist only to protect a concrete preparation action or planning decision. Supported types are planned study, grouped due review, scheduled/recommended mock, meaningful exam-horizon transition, exam logistics, optional weekly coaching summary, and one gentle post-exam outcome follow-up.

The learner can configure preferred days, a time/window, usual duration, reminders, temporary snooze/change, and an optional long mock window. The App never assumes seven-day study or silently adds sessions under urgency.

Launch defaults:

- quiet hours: 21:00–08:00 local time, editable; explicit learner scheduling may override for that reminder;
- normal preparation: at most one proactive coaching notification/day and normally four/rolling seven days;
- booked exam within 21 days: at most one/day and up to six/rolling seven days when enabled and action-specific;
- exam eve/day: one additional useful logistics notification may bring that day to two;
- bundle obligations; never send one notification per item or mistake;
- after three consecutive ignored routine reminders, suppress the next routine push and ask in-app whether to change/disable the schedule;
- no streak, guilt, “we miss you,” generic engagement, or arithmetic-only countdown copy.

A missed day changes planning and possibly freshness, never mastery.

## 14. Content Strategy and Corpus Contract

### 14.1 App content classes and quality

Conceptual content classes:

- C0 reference only;
- C1 reusable source with explicit rights/attribution;
- C2 curated gold original;
- C3 validated original practice;
- C4 adaptive/ephemeral interaction.

Unknown or reference-only rights default to original generation from abstract pattern intelligence, not close paraphrase. Authenticity/confidence and usage rights remain independent.

Normal practice is authored/pre-generated, validated, cached, and reused. Runtime generation is reserved for adaptation that genuinely needs it, especially a fresh narrow retry or adaptive Speaking interaction. Generation begins from a structured content brief, never raw source imitation.

Approval progresses from Draft/quarantine to Training, Independent-B1, Readiness/P4, and Gold. Launch batches receive human review until automated QA is empirically proven; P4/gold retains human sign-off. Objective items require independent answer validation and distractor rationale. Productive prompts require clear obligations and multiple valid-solution paths.

Freshness is measured by content family, not cosmetic wording. Near-duplicates cannot create independent transfer, mock consistency, or Readiness evidence. Learners can report defects; material defects quarantine the content and trigger evidence correction.

### 14.2 Corpus → App product contract

The App requests versioned intelligence for a target/use context: blueprint/task family, content role, difficulty/progression profile, topic/domain, skill nodes, freshness exclusions, desired realism, reuse eligibility, and confidence/source-breadth needs.

Corpus may return:

- stable task patterns and target/provider relevance;
- topic, vocabulary, grammar, distractor, reasoning, discourse/audio, and difficulty signals;
- skill relationships and prerequisites;
- deduplicated source breadth/independence and confidence/authenticity;
- taxonomy/blueprint versions;
- rights, attribution, license, and internal provenance for exact assets.

The App uses these as **priors and content/coverage intelligence**. They never create learner weakness, mastery, or Readiness without direct learner evidence. TELC relevance is not usage permission.

The learner runtime normally uses cached/versioned intelligence and App-approved content. Raw/reference access is limited to internal authoring, QA, calibration, and audit unless an exact asset is explicitly reusable. If Corpus lacks evidence, fall back to the verified target blueprint, curated seed content, broader credible A2/B1 signals, and lower-confidence generic practice. Do not claim fine-grained frequency, difficulty, or P4 realism that cannot be supported.

Corpus downtime does not stop normal cached practice. Material blueprint/taxonomy changes trigger affected content/evidence re-evaluation rather than silent reinterpretation.

## 15. Account, Data, Privacy, and Portability

- Sign-in is not required to set the goal, complete the diagnostic, receive the first plan, or use the initial single-device product.
- Account identity is justified later for explicit cross-device sync/recovery. Local-only loss risk must be stated plainly.
- Collect only goal/date, available time, explanation language, access/equipment, schedule/reminder preferences, optional display name, and derived coaching/evidence state. Do not require unnecessary demographic data.
- Retain structured evidence and progress for the active goal and as history until the learner deletes it. Freshness changes contribution, not historical existence.
- Retain learner-authored Writing with its evidence when useful. Raw Speaking audio is ephemeral: capture only for the attempt, use for evaluation/one escalation, then delete after finalization. Pending audio has a launch ceiling of seven days before deletion/unresolved handling.
- Approved generated content is versioned/cached; the exact content/version needed to explain important evidence remains referenceable.
- Learners ultimately can export goal, Readiness, skill/weakness/review state, useful attempt/mock history, retained Writing/transcripts/evaluations, preferences, and voluntary exam result—without redistributing restricted Corpus assets.
- Full personal-data deletion covers identity, profile, evidence, responses, remaining audio, evaluations, Readiness/mocks, schedule, and voluntary outcome. Irreversibly de-linked aggregates may remain.
- Sync is desirable but not required for the first personal version. Future conflict resolution preserves evidence truth and prevents duplicate attempts; raw ephemeral audio need not sync.
- Full offline parity is not launch scope. Offline/poor-connectivity limits must not corrupt evidence semantics.
- External AI receives the minimum response/task context, pseudonymous references where needed, no unrelated profile/history by default, and no general-model training use of learner responses/audio without separate explicit opt-in.

## 16. Platform, Accessibility, Reliability, and Performance

### 16.1 Launch platform/device expectations

- Responsive web is the launch platform; native apps and installable PWA are not required.
- Phone is first-class for daily coaching and core practice. Larger-screen layouts are first-class for long Writing and mocks. A device change cannot change evidence semantics.
- First-class browser families: current and previous major releases of desktop Chrome, Edge, Firefox, Safari; iOS Safari; Android Chrome. Unsupported capability degrades locally rather than blocking the whole App.

### 16.2 Accessibility

- WCAG 2.2 AA baseline for core flows.
- Keyboard operation, screen-reader semantics, logical focus/order, 200% text scaling/reflow, non-color-only meaning, sufficient contrast, and reduced-motion-safe comprehension.
- Instructional audio has a text equivalent. Listening transcripts/captions follow evidence-sensitive rules: available for access/repair where appropriate, never silently included in a clean target-condition claim.
- Microphone permission is contextual, explicit, and visible; no global/background capture.
- Practice timing may adapt. Standard P4 timing remains exact unless a verified official accommodation profile supports another equivalent condition.
- Accessibility need is never learner failure. If an adaptation changes the tested capability or target equivalence, preserve the actual condition and make a narrower evidence claim.

### 16.3 Reliability and performance

- Preflight equipment, media, permission, checkpointing, and browser capability before high-stakes Listening/Speaking/mocks.
- Do not start a clean measured block when the conditions needed to preserve fairness/recovery are unavailable.
- Preserve objective answers and Writing continuously enough that recoverable loss is exceptional; the shaped Writing loss bound is roughly five seconds. Preserve completed Speaking turns where the browser permits.
- Timers never silently freeze, reset, or grant hidden target time. Interrupted work may continue as practice while losing only the affected clean-measurement claim.
- Technical/content/evaluator failure preserves unaffected evidence and never lowers learner ability.
- Interaction acknowledgement target: roughly 100 ms; deterministic feedback p95 target: ≤1 s; standard model evaluation normally ≤15 s and becomes Pending at about 30 s; adaptive partner target around ≤2 s with fallback after sustained roughly >5 s degradation. These are launch service targets to validate, not guarantees that justify hiding state.
- Slower AI never blocks available deterministic feedback or unrelated coaching.
- No enterprise uptime SLA is required before operational evidence exists.

## 17. Analytics and Product Success

### 17.1 Success hierarchy

Launch North Star: **Decision-Grade Safe Readiness Attainment (DSRA)**—learners who reach Safe in both components with the complete evidence breadth required to make that status decision-grade.

Supporting measures:

- learner outcome: Written/Oral DSRA, Ready-to-Book attainment, time/evidence to meaningful state;
- Readiness safety/calibration: future independent P4 confirmation, contradictions, false-ready cases, and later real-exam calibration;
- learning mechanism: fresh-transfer success, delayed retention, repair resistance, progression, assistance fading;
- session quality: **Useful Session Outcome Rate**, not raw completion/time/question count;
- content/evaluator quality: validity, defects, difficulty, freshness, form health, productive-evaluator agreement/repeatability/pass-gate disagreement/confidence drift;
- cost: total and per active learner/session/productive evidence unit;
- engagement/habit: reported separately and never presented as learning success.

Real TELC outcomes are the ultimate validation but are optional, sparse, delayed, and self-reported at launch. Freeze relevant prediction snapshots for later comparison; report error, bias, pass agreement, and Written/Oral calibration—not correlation alone. Keep pass probability hidden until enough matched out-of-sample outcomes justify it.

### 17.2 Lean launch instrumentation

Capture only what supports coaching, quality, safety, or cost:

- evidence observations and material Readiness snapshots;
- repair/review lifecycle summaries;
- session outcome summaries;
- mock summaries and validity;
- content/evaluator incidents and version changes;
- cost summaries;
- optional real-exam outcome.

Full clickstream, session replay, advanced growth attribution, heavy warehouse infrastructure, and LLM-based analysis of complete learner histories are not launch requirements.

## 18. Business Boundaries and Cost Notes

### 18.1 Initial business state

The initial product is **private, personal, free/non-commercial**. There is no launch billing, subscription, advertising, or data monetization. Do not design entitlement complexity before actual usage/cost evidence exists.

If the product later becomes public, monetization may limit expensive capacity, speed, convenience, or premium realism. It may not sell a higher Readiness score, change evidence semantics, bias recommendations, trap progress/export, or make an honest complete core path impossible.

### 18.2 Low-cost operating model

| Capability | Preferred default | Higher-cost trigger | Cheaper fallback |
|---|---|---|---|
| Objective scoring, learner state, review, plan ranking, Readiness, Ready to Book, analytics | Deterministic, versioned rules over structured evidence | Empirical evidence that a learned model materially improves a decision | Keep transparent rules and recalibrate parameters |
| Routine content | Authored/pre-generated, validated, cached, reused | Coverage/freshness gap or high-value complex item | Simpler curated form or generic B1 practice with narrower claim |
| Content generation/QA | Offline batching, deterministic checks, independent validation, human review for launch/P4 | Disagreement, P4/gold, complex productive/audio asset | Quarantine or keep the item in lower approval tier |
| Writing evaluation | One structured bounded call with deterministic prechecks | Pass-critical ambiguity or evaluator disagreement | Pending/lower confidence; do not update Readiness |
| Speaking | Turn-based capture, transcription/evaluation; fixed/cached partner when valid | S2/S3 meaning-dependent interaction or pass-critical ambiguity | Fixed/prerecorded rehearsal; narrower evidence claim |
| Listening audio | Reviewed scripts with cached TTS for broad practice; small human-audited/native benchmark pool for strong P4 | Benchmark gaps or demonstrated TTS weakness | Reuse approved cached audio; lower evidence role |
| Corpus | Asynchronous analysis and cached versioned bundles | New source, blueprint change, high-value low-confidence pattern | Last compatible approved bundle + conservative seed |
| Analytics/copy | Structured aggregation and templates | High-impact explanation that cannot be expressed safely otherwise | Deterministic fallback copy |

No always-on premium model, live Corpus search per attempt, runtime generation of routine items, or AI-based review scheduling is required. One premium escalation is the normal ceiling for an uncertain productive attempt; persistent uncertainty remains visible.

Spend should rise only when observed quality, outcome calibration, content scarcity, or public capacity justifies it. Cost metrics may choose among equivalent options but cannot silently reduce Oral/Writing evidence just because objective work is cheaper.

## 19. Edge Cases and Uncertainty Handling

| Situation | Required product behavior |
|---|---|
| Sparse/contradictory evidence | Withhold or widen the claim; name the gap; request the smallest direct fresh clarifier |
| Learner clearly far below B1 | Stay exam-shaped at P0/P1, stop repeated hard probes, repair reachable prerequisites, and keep the target visible |
| Learner starts near B1 | Route quickly to P3/P4 evidence; do not force foundation progression |
| Strong Written, weak Oral (or reverse) | Overall state follows the weaker component; coach the pass blocker while maintaining the strength |
| Invalid/ambiguous item | Exclude learner penalty, quarantine content, replace task, and recompute dependent evidence if already published |
| Productive evaluator pending/uncertain | Block only conclusions that depend on it; continue unrelated coaching; escalate once only when justified |
| Technical/media/mic failure | Mark affected scope invalid/pending, preserve unaffected work, offer fallback/practice, never infer low ability |
| Learner pauses/stops a mock | Preserve valid partial evidence; continuing may become practice; never relabel as a clean continuous mock |
| Accessibility adaptation | Preserve access and actual condition; claim target equivalence only when verified |
| Long absence/large review backlog | Preserve history, refresh smallest decision-relevant stale set, collapse debt, and rebuild neutrally |
| Early booking/unrealistic deadline | Keep readiness unchanged, state risk and feasibility honestly, triage to the highest-value plan |
| Failed mock after strong prior evidence | Recompute confidence/state; do focused repair and smaller retest; neither ignore the mock nor reset all mastery |
| Fresh P4/retry inventory exhausted | Treat as product evidence gap, not learner failure; offer useful lower-claim practice and defer the high-stakes decision |
| Corpus unavailable/sparse | Use last compatible bundle, verified blueprint, and curated seed; omit unsupported precision |
| Blueprint changes | Version, revalidate affected content/evidence, retain historical capability where meaningful, and suspend stale target claims |
| AI/provider cost or outage | Use deterministic/cached/fixed fallbacks; lower service richness/evidence scope before lowering truthfulness |
| No sign-in/local data risk | Permit core use and explain recovery limits before surprise loss |
| Poor connectivity | Continue already-loaded low-risk work where valid; prevent duplicate evidence; narrow or defer online-dependent claims |

## 20. Complete-Product Requirements, Phased Possibilities, and Deferrals

### 20.1 Non-negotiable complete-product requirements

Before Bestehen presents itself as a complete TELC B1 exam coach or issues an overall Readiness/Ready-to-Book conclusion, it must have:

- direct coaching/evidence paths for all five skills and every current target task family;
- learner model, Mistake Memory, review, progression, and fresh-transfer semantics;
- separate Written/Oral Readiness with target versioning and uncertainty;
- valid productive evaluation and genuine Speaking interaction evidence;
- mini/section/full mock behavior and post-mock recovery;
- the Ready-to-Book gate and booked-exam preparation modes;
- the Coach/Readiness/Train/Progress experience;
- rights-safe approved content and enough fresh P4 inventory for the claims made;
- data ownership/privacy, accessibility, recovery, analytics, and cost controls defined above.

### 20.2 Permitted phased validation

Implementation may validate product risk incrementally:

1. **Foundation validation:** onboarding, diagnostic mechanics, learner/evidence model, objective-skill loop, original-content pipeline, and Coach shell. Any readiness display is explicitly partial/evidence-building.
2. **Complete coaching validation:** add Writing/Speaking evaluation, interaction, Mistake Memory, review, progression, user controls, and full five-skill daily coaching.
3. **Decision validation:** add P4 content, Readiness, mocks, Ready to Book, urgency/reminders, resilience, and voluntary outcome calibration.
4. **Depth/scale:** expand gold/fresh content, improve calibration/evaluator consistency, sync/recovery, automation, and public operating economics.

These are validation slices, not separate product promises. Architecture should anticipate the complete evidence/content/condition model, but it may implement capability slices in a risk-driven order.

### 20.3 Explicitly deferred product features

- exams/providers beyond TELC B1;
- native apps, installable PWA, full offline packs, and seamless cross-device timed-mock continuation;
- permanent voice-history opt-in and on-device speech evaluation;
- full-duplex real-time voice beyond the validated turn-based requirement;
- human tutoring/examiner marketplace or social/community features;
- classic gamification, leaderboards, and collectible economies;
- public pricing, subscriptions, payment plans, and exact quotas;
- verified certificate/document outcome upload;
- broad demographic/fairness profiling without a justified need;
- enterprise SLA, advanced growth analytics, and large-scale data warehouse;
- external exam booking/calendar integrations.

### 20.4 Architecture choices intentionally open

- web framework, design system, state management, and responsive implementation;
- persistent schema, evidence event storage, rules engine, and recalculation mechanics;
- API/service boundaries, background jobs, queues, caching, search, embeddings/vector use, and Corpus transport/version negotiation;
- authentication, recovery, sync/conflict protocol, structured export format, and deletion mechanism;
- model, STT, TTS, evaluation, and adaptive-partner providers; streaming versus upload behavior;
- local/server checkpointing, timer source, media format/CDN/storage, encryption, regional processing, and provider contracts;
- analytics/observability vendor, dashboards, alerts, deployment, SLOs, and infrastructure topology;
- exact automated accessibility, browser, device, content-QA, and evaluator-release tooling.

Architecture may choose among these only if the product semantics, fallbacks, privacy, explainability, evidence validity, and cost limits remain intact.

### 20.5 Calibration defaults—not unresolved product behavior

The diagnostic duration/routes, Mistake Memory gates, review intervals, progression probes, Readiness guard bands/recency/planning ranges, Ready-to-Book windows, mock spacing, plateau heuristic, reminder caps, latency targets, evaluator gates, and content thresholds are implementable launch defaults. They must be versioned and recalibrated from fresh transfer, retention, mock/real-exam outcomes, evaluator agreement, content defects, accessibility fairness, and actual cost. Calibration may tune numbers without reversing the product contract.

## 21. Decisions Made

1. Adopted one authoritative end-to-end App specification without reversing Stages 01–27.
2. Elevated Stage 27's cross-stage precedence rules into the final product contract.
3. Locked the complete learner journey from account-optional first visit through Ready to Book, booked preparation, exam, and return/recovery.
4. Consolidated the evidence-led learner model, Mistake Memory lifecycle, daily engine, canonical loop, and five-rung skill-specific progression.
5. Consolidated all current TELC skill families and their coaching/measurement boundaries.
6. Preserved separate learning, transfer, retention, target-condition, and Readiness claims.
7. Preserved conservative, independent Written/Oral Readiness and the complete Ready-to-Book gate.
8. Locked coach voice, IA, autonomy boundaries, motivation, urgency, and reminder behavior.
9. Locked the rights-safe content model and asynchronous, versioned Corpus contract.
10. Locked account/data/privacy, responsive-web, accessibility, reliability, analytics, business, and low-cost requirements.
11. Defined what a complete product must contain, what may be validated incrementally, what is deferred, and what architecture must decide later.

## 22. Open Questions and Deferred Decisions

### 22.1 Owner questions

**None.** No unresolved owner preference, legal-risk tolerance, or business constraint blocks the product specification.

### 22.2 Unresolved product questions

**None that require architecture to invent behavior.** Deferred features in Section 20.3 require future product decisions only if they enter scope. Until then, they are explicitly out of launch scope.

### 22.3 Empirical validation still required

The product model is complete but not psychometrically proven. Future evidence must validate/tune:

- the 65 Safe margin, planning ranges, recency windows, and Ready-to-Book confirmation windows;
- actual mock-to-real-exam calibration and eventual pass-probability eligibility;
- diagnostic/progression/repair/review thresholds;
- productive evaluator agreement, bias, confidence, and drift;
- content difficulty, defect, freshness, and required P4 inventory volume;
- reminder/workload/plateau defaults and accessibility-equivalent conditions;
- cost per useful productive evidence unit and when higher-cost providers improve outcomes.

These are calibration questions, not permission to weaken evidence truth while data is sparse.

## 23. Definition of Done Check

### 23.1 Stage 28 deliverable coverage

| Checklist requirement | Status | Where resolved |
|---|---|---|
| Consolidate all shaping documents into a final PRD/spec | Complete | Entire document; Section 2 traceability |
| Complete learner journey | Complete | Section 4 |
| Learner model | Complete | Section 5.1 |
| Coaching engine | Complete | Section 6.1 |
| Mistake Memory | Complete | Section 5.2 |
| A1→B1 progression | Complete | Section 7 |
| Every exam-skill experience | Complete | Section 8 |
| Review/spaced repetition | Complete | Section 9 |
| TELC Readiness | Complete | Section 10 |
| Mock exams and Ready-to-Book logic | Complete | Section 11 |
| Coach personality | Complete | Section 12.1 |
| Information architecture | Complete | Section 12.2 |
| Content strategy | Complete | Section 14.1 |
| Corpus contract | Complete | Section 14.2 |
| Notifications/habit support | Complete | Section 13.3 |
| Account/data expectations | Complete | Section 15 |
| Accessibility/device expectations | Complete | Section 16 |
| Analytics and cost constraints | Complete | Sections 17–18 |
| Explicitly deferred features | Complete | Section 20.3 |
| Architecture questions separated from product questions | Complete | Sections 20.4 and 22 |

### 23.2 Complete shaping test

- [x] An A1 learner is described from first launch to exam booking without inventing a new major state.
- [x] Every major skill has a defined coaching, feedback, progression, evidence, and target-condition experience.
- [x] Every valid mistake can become a candidate, be clarified/promoted, repaired, retried, reviewed, retained, resolved, or reopened.
- [x] Readiness is explainable, uncertainty-aware, and respects independent Written/Oral pass constraints.
- [x] The coach can choose and explain today's highest-value action while respecting learner control.
- [x] Corpus supplies intelligence and rights-aware metadata without becoming the learner product or a live runtime dependency.
- [x] Product success is measurable through readiness safety, transfer, retention, useful sessions, content/evaluator quality, outcomes, and cost—not engagement alone.
- [x] Recurring-cost assumptions and fallbacks are explicit and sustainable for a personal project.
- [x] No major product behavior is left for the architecture agent to invent.

**Stage 28 result:** Bestehen / App is fully shaped for design and architecture, subject to explicit calibration and implementation choices—not unresolved product behavior.
