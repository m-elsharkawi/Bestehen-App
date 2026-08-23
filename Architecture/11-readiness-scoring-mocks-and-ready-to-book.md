# Bestehen / App — Readiness, Scoring, Mocks, and Ready-to-Book

> **Stage:** 11 of 28  
> **Status:** Architecture decision record and implementation handoff  
> **Decision owner:** Measurement: Readiness & Mocks  
> **Baseline:** Bestehen-App `main` at `3ece24ea4471efa44c58f4f7abb0cc55961bc98e`; Bestehen-Shaping `main` at `9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc`  
> **Scope:** Deterministic domain contracts and projections; no production schema, endpoint, provider, or UI implementation

## 1. Purpose and scope

This stage fixes the smallest sufficient architecture for converting accepted direct evidence into official-aligned Written and Oral estimates, conservative planning ranges, six client states, mock results, and a reversible Ready-to-Book recommendation. It preserves the official target separately from Bestehen policy: current TELC B1 requires **135/225 Written** and **45/75 Oral**, each **60%**; Bestehen's launch **Safe** floor is the separately versioned default **65**, with range, breadth, confidence, currentness, and contradiction rules. Neither component can compensate for the other.

The Readiness Index is `min(written_target_percent, oral_target_percent)`: a target-performance bottleneck index, never a chance of passing. Missing is absence, not zero. Safe is a performance band; Ready to Book is a stricter action gate over Safe, not a score. No production field, event, hidden calculation, copy template, or recurring AI call may represent pass probability before the empirical and product activation gate is satisfied.

This stage owns scoring/readiness/mock/booking projections and their explanation. It does not own attempt capture, evidence validity, content approval, evaluator execution, learner capability, route/layout choices, notification timing, real-outcome consent UX, or later empirical validation infrastructure.

## 2. Inputs, authority, and continuity

### 2.1 Source snapshot

All required inputs were fetched from GitHub `main`. Blob identifiers make this decision reproducible.

| Repository / path | Blob SHA | Stage-11 use |
|---|---|---|
| Bestehen-App `prompts/architecture/11_define_readiness_scoring_mocks_and_ready_to_book.txt` | `43701ccf3b3d2b52d98ba2e9c11fb49ee89545e6` | Binding task contract |
| Bestehen-Shaping `app/28-bestehen-app-product-specification.md` | `18ae80cc2fd63cecd76c297c3e56d44a68367856` | Highest product authority |
| Bestehen-Shaping `app/15-telc-readiness.md` | `b4456939928493569336bbc565d7e67307e7a3db` | Calculation, eligibility, bands, calibration |
| Bestehen-Shaping `app/16-mock-exams.md` | `8f6c23fa16524bd251cef39d823cfeea73bfcef3` | Mock scope, validity, scoring, consistency |
| Bestehen-Shaping `app/17-ready-to-book-logic.md` | `9e3e8b24faefe885d5b10409725619d0d0d84e6d` | Gates A–F and reversibility |
| Bestehen-Shaping `app/24-analytics-and-success-metrics.md` | `28d1a5380a7ea9f28efdc95ce0c96987920917e1` | Frozen snapshots, outcome calibration, lean metrics |
| Bestehen-Shaping `app/27-end-to-end-scenario-validation.md` | `5da3b0a27ba516770210773399f0415cfb1f5460` | Binding precedence and scenarios |
| Bestehen-App `Design/DESIGN-HANDOFF.md` | `417a6820037e045e2dd9f29afc42b9f2e94fd638` | Six states and truthful presentation |
| Bestehen-App `Design/Bestehen-01-Design-System.dc.html` | `d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a` | §§2.8, 3.3 components/states |
| Bestehen-App `Design/Bestehen-02-Mobile-Screens.dc.html` | `0a9f2d3ea982c3197f399941b57defd9869d2428` | Act 4 mobile behavior |
| Bestehen-App `Design/Bestehen-03-Desktop-Responsive.dc.html` | `94056db181b45298a759ff727ad5cfeac2f2a469` | D2 claim plus audit trail |
| Bestehen-App `Architecture/00-architecture-shaping-plan.md` | `b263c5e7b3bccc0450ddd17aa0cc007432d672b7` | Routing and downstream ownership |
| Bestehen-App `Bestehen_App_Architecture_Checklist.md` | `98488b0670bf7df66d2e0bcf4c30c7f0a5b364ad` | 25 Stage-11 checks initially open |
| Bestehen-App `Architecture/04-domain-model-and-bounded-contexts.md` | `ab1a775d7689e47bba00c2544c247ef344c44e70` | Measurement owner, six states, no compensation |
| Bestehen-App `Architecture/05-data-ownership-persistence-and-schema-evolution.md` | `bb6df811ec9010de556d1719f22e31bb8ca3190e` | Append facts, immutable snapshots, source cuts |
| Bestehen-App `Architecture/06-evidence-ledger-validity-versioning-and-audit.md` | `53d34ae65ef4c8fa79c00026f9bd5d7b876ce672` | Five validity states, scope, correction lineage |
| Bestehen-App `Architecture/07-learner-model-mistake-memory-progression-and-review.md` | `ad58238aee48e41a0d4bd30bd21ac5a17707656f` | Deterministic capability and obligation projections |
| Bestehen-App `Architecture/09-content-exercise-form-and-media-architecture.md` | `e6fb121ab1b10c6cbcf692bc88acaf98f2e45e7a` | P4 manifests, freshness/family independence, defects |
| Bestehen-App `Architecture/10-corpus-integration-compatibility-cache-and-rights.md` | `d4e1ab25e359dcfcc506ee29462760a41647138d` | Imported blueprints, asynchronous boundary, no learner data |

Required Stages 04, 05, 06, 07, 09, and 10 are present, accepted, and mutually consistent. This stage consumes their owners and version axes; it does not alter them.

### 2.2 Authority reconciliation

Stage-27 precedence is applied throughout: validity/fairness → direct evidence → independent Written/Oral risk → uncertainty resolution → due repair/retention → progression/coverage → preference. Urgency and learner override change priority, never evidence truth.

Two presentation-source discrepancies are explicitly resolved without editing Design:

1. `Design/DESIGN-HANDOFF.md §3.3` describes Ready to Book as a “four-condition checklist”; `app/17-ready-to-book-logic.md §4.1` requires Gates A–F. Product authority wins. A UI may group A–F into four rows, but the contract returns and audits all six gates and every granular reason; grouping may drop none.
2. `Design/DESIGN-HANDOFF.md §3.3` calls 65 open. Final product specification §§10/20.5 and the Stage-11 prompt settle the versioned launch default at 65. It remains labeled Bestehen policy, never the official TELC line.

### 2.3 Current official anchor

The official TELC product page and official `Zertifikat Deutsch B1, Übungstest Version 1` were rechecked on **2026-08-23**. The product page states separate written and oral parts and the current structure/timing; the official practice-test PDF pp. 40–41 lists the 225/75 split and requires 60% in each, explicitly 135 Written and 45 Oral.

- https://www.telc.net/sprachpruefungen/deutsch/zertifikat-deutsch-telc-deutsch-b1/
- https://shop.telc.net/media/catalog/product/file/2/0/20201225_5061-b00-010301_web.pdf

These references are evidence for a versioned target release, not hard-coded eternal truth. Privileged blueprint approval must compare a newly verified official source before activation.

## 3. Architecture decisions

| ID | Decision and default | Credible alternatives and rejection | Consequence, fallback, review trigger | ADR |
|---|---|---|---|---|
| `ARCH-S11-D01` | Measurement owns one deterministic, rebuildable Readiness/Mocks projection over accepted Evidence and immutable mock facts. Facts, derived current state, and material historical snapshots remain distinct. | A: feature screens calculate locally—simple but divergent and unauditable. B: AI calculates the final claim—flexible but nondeterministic, costly, and unsafe. C chosen: one server domain policy with shared pure specifications. | Last validated generation remains with stale/rebuilding provenance; dependent claims become Pending/absent. Review split only after measured contention or independent security/deploy ownership. | ADR-0018 |
| `ARCH-S11-D02` | Store official target blueprint and Bestehen calibration as independent immutable releases. Blueprint contains units, point weights, pass gates, mechanics; calibration contains 65 Safe default, recency/evaluation weights, range floors, breadth/confidence policies, and empirical provenance. | A: constants in UI—cheap but conflates official and product rules. B: one global settings blob—simple but destroys lineage. C chosen: typed version axes and an approved compatibility binding. | Roll back active pointers without rewriting facts/snapshots. Unknown consequential major fails closed. Reverify on official change or scheduled governance review. | ADR-0018 |
| `ARCH-S11-D03` | Eligibility begins with independent episodes/occasions, never clicks. Only current, direct, target-mappable, fresh, unassisted E3/E4 evidence with adequate evaluator quality sets numeric score; `partially_valid` contributes only named unaffected scope. | A: all activity raises score—motivating but false. B: only full mocks—simple but wastes valid distributed evidence. C chosen: unit eligibility with explicit exclusion reasons. | Missing unit yields absence, not zero. Smallest valid recheck is fallback. Review thresholds only with outcome/evaluator evidence. | ADR-0018 |
| `ARCH-S11-D04` | Aggregate eligible episode results to official units, sections, independent Written/Oral components, planning ranges/confidence/bands/reasons, then `min(W,O)`. No component compensation and no extra mock multiplier. | A: 300-point total violates official gates. B: equal five-skill average ignores blueprint. C chosen: official point weights plus bottleneck. | Stable formulas are deterministic and replayable. Blueprint change produces a new projection. Review only after target revision or validated calibration evidence. | ADR-0018 |
| `ARCH-S11-D05` | Publish exactly six client states: `evidence_building`, `not_ready`, `borderline`, `safe`, `ready_to_book`, `stale_contradicted`. State includes exhaustive reasons, missing fields as null/absent, current lineage, and smallest clarifier. | A: one percent—fake precision. B: many ad-hoc flags—contradictory. C chosen: discriminated state union. | Unknown state/reason major fails closed; clients show neutral unavailable copy. Additive reasons require compatible fallback. | ADR-0018 |
| `ARCH-S11-D06` | Mock definitions pin scope, form families/revisions, blueprint, rules, promise, and conditions. One mock is one correlated occasion. Original responses/conditions/result are immutable; later evaluation correction appends a new interpretation and repair/retry creates new evidence. | A: mutable mock score after coaching destroys audit. B: discard any compromised mock loses fair scope. C chosen: immutable outcome plus granular validity mapping. | Partial never becomes whole; pending blocks dependent conclusions only; technical failure carries zero learner penalty. Fall back to valid units/fresh form. | ADR-0018 |
| `ARCH-S11-D07` | Ready to Book is a reversible conjunction of Stage-17 Gates A–F over current Safe evidence, with every gate and granular blocker returned. No hidden booking score. | A: Safe equals Ready—drops confirmation. B: two full mocks alone—ignores breadth/current contradictions. C chosen: exact full gate. | Any gate regression moves to `stale_contradicted`, `safe`, `borderline`, or `not_ready` as truth requires while preserving milestone history. Review only by superseding product decision. | ADR-0018 |
| `ARCH-S11-D08` | Corrections, defects, staleness, contradiction, evaluator changes, and blueprint changes enqueue idempotent scoped shadow recomputation from a source cut; validated generations publish atomically and material changes append a snapshot/explanation. | A: mutate current totals in place is fast but irreproducible. B: full learner replay for every incident is simple but costly and broad. C chosen: affected-scope rebuild with full replay fallback. | Last safe unaffected projection remains. Coalesce duplicate impacts; full replay if scope cannot be proven. Review if queue lag exceeds later SLO after tuning. | ADR-0018 |
| `ARCH-S11-D09` | All empirical parameters are immutable calibration releases with provenance, effective date, validation evidence, monitor, approver, and rollback. Pass probability is structurally forbidden until the separately approved empirical gate. | A: launch probability from heuristics is misleading. B: never permit it forecloses evidence. C chosen: schema/event deny-list now and later new ADR/contract major only after gate. | Permanent honest fallback is index + ranges. Withdraw later probability after incompatible blueprint/evaluator drift until revalidated. | ADR-0018 |
| `ARCH-S11-D10` | All scoring/readiness/gating is deterministic and provider-neutral. AI may produce bounded structured evaluator observations; Measurement admits accepted Evidence and computes every final claim without a model call. | A: AI summary/score per view adds cost/drift. B: rule engine service is unnecessary infrastructure. C chosen: versioned in-process policy plus durable recompute jobs. | Objective scoring and cached structured explanations continue during AI/Corpus outage. Upgrade only for measured evaluator quality, never for final-claim prose. | ADR-0018 |

## 4. Components and responsibility ownership

| Component / contract | Owner | Responsibility and prohibited behavior |
|---|---|---|
| Target blueprint registry | Content & Forms with privileged target approver | Immutable current official structure, units, mechanics, points, pass gates and source verification. Cannot set learner state or Safe policy. |
| Calibration registry | Measurement governance | Immutable product parameters, provenance, effective interval, validation, monitor, rollback. Cannot change official gates. |
| Session/attempt/mock occurrence facts | Session & Attempt | Response, timer, playback, assistance, pause/interruption, start/end and idempotent completion. Cannot declare evidence validity or readiness. |
| Evidence Ledger | Evidence & Capability | Five states `valid`, `partially_valid`, `pending`, `interrupted`, `not_counted`; affected scope, conditions, direct lane, independence, evaluator admission and corrections. Cannot set readiness bands. |
| Content/form catalogue | Content & Forms | P4 approval, family independence/exposure/freshness, immutable forms/assets, rights/quality/target eligibility and quarantine. Corpus data is asynchronous input only. |
| Productive Evaluation | Productive Evaluation | Bounded candidate observations with rubric/evaluator lineage and confidence. Never owns accepted evidence or final Readiness. |
| Readiness calculator | Measurement: Readiness & Mocks | Eligibility, unit/section/component aggregation, ranges, confidence, bands, index and reasons. Only owner of current Readiness projection. |
| Mock adjudicator | Measurement: Readiness & Mocks | Mock scope/result/verdict/consistency from immutable facts and Evidence validity. No secret multiplier. |
| Booking gate evaluator | Measurement: Readiness & Mocks | Exact Gates A–F, booking blockers, reversibility, material snapshots. No booking score. |
| Coaching/Planning | Coaching & Planning | Consumes reasons/clarifiers and selects action using Stage-27 precedence. Cannot mutate readiness. |
| API/presentation adapter | App boundary | Projects exhaustive typed states and textual alternatives. Cannot calculate, relabel, suppress a gate, or convert null to zero. |
| Operations/Governance | Operations & Governance | Authorizes releases, observes lag/drift/cost, requests owner commands. Cannot edit semantic rows directly. |

The launch deployment stays the accepted modular monolith plus durable PostgreSQL/pg-boss work. Module ports preserve a future split without a new service, stream platform, warehouse, or per-domain database.

~~~mermaid
flowchart LR
  A[Session and Attempt facts] --> E[Evidence Ledger]
  V[Productive evaluator candidate] --> E
  C[Approved content forms and target blueprint] --> E
  E --> R[Readiness calculator]
  A --> M[Mock adjudicator]
  C --> M
  E --> M
  M --> R
  P[Calibration release] --> R
  R --> G[Ready-to-Book gates A-F]
  M --> G
  R --> U[Versioned API projection]
  G --> U
  U --> X[Coach and accessible UI]
  O[Operations] -. owner commands .-> C
  O -. owner commands .-> P
~~~

## 5. Versioned target and calibration model

### 5.1 Distinguishable target data

| Target element | Current approved value | Meaning / rule |
|---|---:|---|
| R1 / R2 / R3 | 25 / 25 / 25 | Reading section max 75 |
| SB1 / SB2 | 15 / 15 | Language Elements max 30 |
| H1 / H2 / H3 | 25 / 25 / 25 | Listening max 75 |
| Writing | 45 | Official three-criterion aligned result; subdimensions do not invent points |
| Written | max 225; pass 135 | Independent official component gate, 60% |
| S1 / S2 / S3 | 15 / 30 / 30 | Oral max 75 |
| Oral | max 75; pass 45 | Independent official component gate, 60% |
| Overall raw | max 300 | Descriptive sum only; cannot compensate for a component failure |

An immutable `TargetBlueprintRelease` includes `target_id`, `blueprint_release_id`, official source URLs/checksums, `verified_at`, `effective_from/to`, scoring-unit graph, point maxima/weights, component pass rules, timing/playback/interaction mechanics, compatibility class, approver and supersession. Historical evidence pins the target version it measured; the current projection uses an approved compatibility mapping or marks affected claims absent/Pending.

### 5.2 Product calibration data

`ReadinessCalibrationRelease` is separate and pins:

- Safe threshold default 65, official-line guard semantics, component band boundaries 55/60/65;
- evidence-tier weights E3=1.0 and E4=1.5 for direct score-setting evidence;
- recency policy: 0–14d 1.00, 15–30d 0.90, 31–60d 0.65, 61–90d 0.35, >90d zero current-readiness influence;
- evaluator-quality policy: high 1.00, medium 0.75, low usable 0.40, unsupported 0;
- planning-range floors: Low ±12, Medium ±8, High ±5; +3 for missing recent E4 or major unresolved contradiction; cap ±20, beyond which numeric claim is normally absent;
- confidence/breadth requirements; Gate-D 14-day and Gate-E 30-day windows;
- provenance (`shaped_default`, later experiment/outcome cohort), `effective_at`, validation dataset/snapshot, approver, monitoring thresholds, rollback target, checksum.

These mutable values are not arbitrary feature flags. Activation requires shadow replay/diff, regression fixtures, approval, and an atomic binding `(blueprint_release_id, calibration_release_id, calculation_rules_version)`. Rollback publishes a new current generation from unchanged facts and retains all historical snapshots.

### 5.3 Structural probability prohibition

Launch contracts contain no `pass_probability`, `pass_likelihood`, `written_pass_probability`, `oral_pass_probability`, `joint_probability`, generated equivalent, analytics event, or copy interpolation. Unknown extension fields at the consequential API boundary are rejected; analytics schemas deny these names/semantics. A later probability contract requires all of:

1. at least 100 matched real-exam outcomes on a materially compatible target blueprint;
2. at least 20 Written non-pass/boundary and 20 Oral non-pass/boundary outcomes, or equivalent boundary evidence;
3. sufficient 60-line cases to test false-safe behavior;
4. held-out or later-time validation showing calibration, not fit;
5. privacy/consent and fairness review, explicit product approval, a superseding ADR and contract major;
6. independent Written/Oral calibration and empirical joint calibration—never multiplication by assumption.

Until then, the permanent fallback is Written/Oral estimated points, ranges, confidence, bands, reasons, and bottleneck index.

## 6. Explanatory contracts and ownership

The following pseudotypes specify semantics, not production syntax.

~~~typescript
type EvidenceValidity =
  | "valid" | "partially_valid" | "pending" | "interrupted" | "not_counted";

type Eligibility =
  | { kind: "eligible"; observationId: Id; unitId: UnitId;
      independentOccasionId: Id; normalized0to100: number;
      evidenceTier: "E3" | "E4"; recencyWeight: number;
      evaluationWeight: number; includedScope: Scope; lineage: Lineage }
  | { kind: "ineligible"; observationId: Id; unitId?: UnitId;
      reason: "missing_direct_modality" | "not_target_mappable" |
        "below_target_difficulty" | "answer_assistance" | "solution_exposed" |
        "not_independent" | "stale_for_current_claim" | "invalid_scope" |
        "evaluation_pending" | "evaluation_unreliable" | "blueprint_incompatible" |
        "content_quarantined" | "interaction_missing";
      affectedScope: Scope; nextEvidence?: Clarifier };

type ComponentEstimate =
  | { kind: "absent"; component: "written" | "oral";
      reasons: NonEmpty<EligibilityReason>; nextEvidence: Clarifier[]; lineage: Lineage }
  | { kind: "estimated"; component: "written" | "oral";
      points: number; maxPoints: 225 | 75; targetPercent: number;
      planningRange: { low: number; high: number; label: "bestehen_planning_range" };
      confidence: "low" | "medium" | "high"; band: ComponentBand;
      sectionResults: SectionEstimate[]; reasons: Reason[]; lineage: Lineage };

type ReadinessState =
  | { kind: "evidence_building"; index: null; componentNumbersMayBeAbsent: true;
      reasons: NonEmpty<Reason>; nextEvidence: Clarifier[]; lineage: Lineage }
  | { kind: "not_ready"; index: number | null; weaker: "written" | "oral" | null;
      reasons: NonEmpty<Reason>; lineage: Lineage }
  | { kind: "borderline"; index: number; weaker: "written" | "oral";
      reasons: NonEmpty<Reason>; lineage: Lineage }
  | { kind: "safe"; index: number; weaker: "written" | "oral";
      booking: BookingGateResult; reasons: NonEmpty<Reason>; lineage: Lineage }
  | { kind: "ready_to_book"; index: number; weaker: "written" | "oral";
      booking: AllGatesPassed; lineage: Lineage }
  | { kind: "stale_contradicted"; index: number | null;
      previousMilestone: MilestoneRef; currentReasons: NonEmpty<Reason>;
      smallestRecheck: Clarifier[]; lineage: Lineage };

type Lineage = { sourceCut: LearnerSequence; projectionGenerationId: Id;
  blueprintReleaseId: Id; calibrationReleaseId: Id; calculationRulesVersion: Version;
  contentRevisionSetHash: Hash; evaluatorReleaseSetHash: Hash;
  computedAt: Instant; stale: boolean; rebuilding: boolean };
~~~

### 6.1 State reasons

Reasons are closed, stable codes with structured scope and safe text keys, not free-form generated conclusions. At minimum:

- coverage: `unit_evidence_missing`, `direct_modality_missing`, `interactive_oral_missing`, `writing_second_occasion_missing`, `decision_grade_breadth_missing`;
- performance: `estimate_below_55`, `estimate_55_to_64_9`, `range_crosses_60`, `target_condition_failure`, `pass_critical_unit_unstable`;
- validity/currentness: `blueprint_unverified`, `content_defect_review`, `evaluator_pending`, `evaluator_uncertain`, `evidence_stale`, `major_contradiction`, `accommodation_equivalence_unresolved`;
- mock/gate: `clean_full_mock_missing`, `clean_full_mock_too_old`, `written_confirmation_missing`, `oral_confirmation_missing`, `confirmation_not_independent`, `overall_confidence_below_medium`.

Every reason contains component/unit/scope, source observation/snapshot refs where learner-visible, policy version, effective time, whether the conclusion is blocked versus merely weakened, and the smallest evidence-equivalent next action. Clients must render unknown additive reason codes using the server-provided safe textual alternative while preserving code/scope for audit.

### 6.2 Persisted facts versus projections

Persist as immutable facts: attempt/mock occurrence and conditions; accepted observations/current validity assertions; immutable content/form/target/calibration releases; mock result versions; correction/impact assertions; privileged approvals; material readiness/gate snapshots. Rebuild as projections: eligibility, unit means, section/component estimates, ranges, confidence, band, index, mock consistency, current Gates A–F and learner explanations.

Current projection tables are replaceable generations. A material snapshot is appended when a band/gate changes, a component/index moves beyond the configured meaningful-change threshold, a correction/blueprint/evaluator release changes interpretation, or an exam-outcome validation snapshot is frozen. Internal candidate rankings and per-view recalculation are not historical truth.

## 7. Scoring and readiness calculation specification

### 7.1 Eligibility pipeline

For every current official scoring unit:

1. Select accepted Evidence observations at the requested source cut. `pending`, `interrupted`, and `not_counted` contribute no numeric outcome; `partially_valid` contributes only the explicitly unaffected unit/dimension.
2. Group responses by `independent_occasion_id`; one task set, one Writing response, one S3 exchange, and one mock are each one confidence occasion irrespective of item count.
3. Require current official mapping, B1-equivalent difficulty, fresh response, direct tested modality, trustworthy evaluation, and no answer-bearing assistance or relevant exposure. Accessibility support that does not alter the tested capability stays eligible with its condition preserved.
4. Collapse repeats/near duplicates/same-family exposed retries within the occasion. A repaired or solution-exposed retry becomes learning/retention evidence, never independent readiness evidence.
5. Normalize the official-unit outcome to 0–100. Do not convert generic grammar/vocabulary/mastery nodes into TELC points.
6. Emit an explicit eligible/ineligible record and reasons; absent eligible observations remain absent.

### 7.2 Unit and component calculation

For eligible observation `i`:

`effective_weight_i = evidence_strength_i × recency_weight_i × evaluation_quality_i`

`unit_estimate = Σ(normalized_i × effective_weight_i) / Σ(effective_weight_i)`

Compute observed comparable-occasion variation, apply the confidence-specific minimum half-width, add the specified realism/contradiction widening, and cap at ±20. If uncertainty remains worse or the unit lacks coverage, withhold rather than publish pseudo-precision.

Apply official weights:

- `Reading = (R1 + R2 + R3) / 3`, contributes 75 points;
- `LanguageElements = (SB1 + SB2) / 2`, contributes 30;
- `Listening = (H1 + H2 + H3) / 3`, contributes 75;
- `Writing` uses the current official three-criterion aligned estimate, contributes 45;
- `OralPoints = 15×S1 + 30×S2 + 30×S3` where part estimates are 0–1.

Then:

`WrittenPoints = 75×Reading + 30×LanguageElements + 75×Listening + 45×Writing`

`W = 100 × WrittenPoints / 225`; `O = 100 × OralPoints / 75`; `Index = min(W, O)`.

Ranges are aggregated through the same official weights. Overall confidence is the lower of component confidence. The weaker component is preserved even when equal (use a deterministic tie value such as `both`; clients must not arbitrarily blame one lane).

### 7.3 Numeric eligibility and confidence

Written numeric eligibility requires current direct target-mappable E3/E4 for R1/R2/R3, SB1/SB2, H1/H2/H3, and a complete-enough Writing response with trustworthy criteria. Oral numeric eligibility requires direct oral S1 plus interactive direct S2 and S3 with trustworthy part estimates. Overall index requires both components.

Medium component confidence normally requires every unit covered, at least two recent independent observations in major families where feasible, every required unassisted lane, more than one productive prompt/occasion, and no major unresolved evaluation/content contradiction. High additionally requires at least five effective units across at least three occasions/fresh variants, broad target-task coverage, recent E4 in each major area, multi-day productive/interactive evidence, and no fragile single evaluator dependency.

### 7.4 Decision-grade Safe evidence

Written requires all of:

1. current direct E3/E4 for R1/R2/R3, SB1/SB2, H1/H2/H3 and Writing;
2. a recent E4 anchor within 30 days in Reading, Language Elements, Listening, and Writing;
3. one valid shared Reading+Language Elements target-condition timing/allocation observation;
4. current part-specific Listening playback conditions;
5. one current clean target-time Writing response plus another fresh independent B1 Writing occasion;
6. evidence over at least two days/occasions;
7. Medium+ confidence in each written section and no unresolved pass-critical contradiction.

Oral requires all of:

1. current direct oral E3/E4 for S1/S2/S3;
2. genuine partner interaction for S2/S3;
3. two fresh S2/S3 contexts across at least two occasions;
4. one current full target-condition three-part oral simulation/equivalent P4 sequence within 30 days;
5. a second independent recent P3/P4 oral occasion;
6. judgeable intelligibility;
7. Medium+ confidence in each oral part and no unresolved pass-critical contradiction.

### 7.5 Band and state calculation

| Result | Exact current meaning |
|---|---|
| `evidence_building` | No responsibly complete component/index claim and no component established Not ready. Numeric fields for missing claims are absent/null, never 0. |
| `not_ready` | A component estimate <55 with sufficient direct evidence; repeated recent E4 under 60; a pass-critical target condition repeatedly fails; or strong lower-rung evidence responsibly establishes current target is unreachable without fake points. |
| `borderline` | Any component 55–64.9; or its range crosses 60; or estimate ≥65 without decision-grade evidence; or realistic contradiction/pass-critical instability remains. |
| `safe` | Both components individually ≥65, each lower range ≥60, complete decision-grade breadth, Medium+ confidence, current target, and no unresolved bottleneck/defect—but at least one booking gate is not yet met. |
| `ready_to_book` | `safe` plus every Gate A–F passes. It does not change the index. |
| `stale_contradicted` | A previously earned Safe/Ready milestone is historical but current evidence, target validity, age, or correction prevents relying on it; include exact reason and recheck. |

If one component is Not ready, overall is Not ready. Else if a required claim is absent, overall is Evidence building. Else if either is Borderline, overall is Borderline. Else both are Safe and the booking gate decides Safe versus Ready to Book. No average or total changes that order.

~~~mermaid
stateDiagram-v2
  [*] --> evidence_building
  evidence_building --> not_ready: defensible below-target evidence
  evidence_building --> borderline: both estimates exist, one uncertain/55-64.9
  not_ready --> borderline: repaired plus fresh direct evidence
  borderline --> safe: both components satisfy every Safe rule
  safe --> ready_to_book: Gates A-F all pass
  ready_to_book --> stale_contradicted: age, correction, contradiction or target change
  safe --> stale_contradicted: current claim loses support
  stale_contradicted --> evidence_building: required claim becomes absent
  stale_contradicted --> not_ready: current direct evidence establishes below target
  stale_contradicted --> borderline: current estimate/uncertainty is borderline
  stale_contradicted --> safe: recheck restores Safe but not all booking gates
  stale_contradicted --> ready_to_book: recheck restores all gates
  safe --> borderline: new current evidence/range/breadth change
  borderline --> not_ready: coherent current failure
~~~

## 8. Mock contract, scope, validity, and immutable results

### 8.1 Mock definition and occasion

`MockSpecificationVersion` pins: mode; exact units/blocks/components; purpose; expected duration/preparation; target blueprint; content form and independent family revisions; freshness/exposure eligibility; timing/playback/notes/help/pause/restart/feedback/interaction rules; equipment/access condition; and an exhaustive result promise. Starting creates an immutable `mock_occasion_id`. All items/criteria in that mock share the occasion for confidence; granular results retain unit scope.

`MockOutcome` preserves original responses/checksums, conditions, occurrence facts, objective scored facts, productive candidate refs, target/rubric/evaluator lineage and the result version available at each audit time. An evaluator correction appends a new accepted observation/validity assertion and a new interpreted result; it never alters the original learner work. Post-mock explanation/repair/retry uses a fresh attempt/evidence identity and cannot backdate a pass.

### 8.2 Scope/validity matrix

| Mode / condition | Valid claim | Forbidden claim | Readiness treatment / recovery |
|---|---|---|---|
| Mini-mock, clean | Named task units/conditions only | Whole section/component/exam pass | Eligible E4 only if truly target-condition; otherwise scoped E3. Fresh task if clarification needed. |
| Section mock, clean | Completed named section and actual timing/playback behavior | Omitted sections or component gate unless full component measured | Normal scoped evidence; may be efficient Gate-E confirmation only when the exact component is complete and independent. |
| Written component, clean | 225-point estimate/pass statement if every written area valid/evaluated | Oral or whole-exam pass | One written component occasion. Pass requires ≥135; cannot compensate Oral. |
| Oral component, clean | 75-point estimate/pass statement with valid interaction/evaluation | Written or whole-exam pass | One oral occasion. Pass requires ≥45; cannot compensate Written. |
| Full mock, clean/current | Written and Oral results, sequencing/endurance actually reproduced | “Passed TELC”, guarantee, independent item occasions | One correlated occasion; E4 by unit; no bonus. Both 135 and 45 required for mock pass. |
| Valid but modified | Actual narrower condition/scope | Clean target-condition, full realism | Typically E3/practice for affected dimensions; preserve conditions and request clean confirmation. |
| Partial/interrupted | Exact completed unaffected units | Whole-block/full-mock continuity, omitted/affected scope | Map Evidence `partially_valid`/`interrupted`; keep fair units, dependent whole claim absent. |
| Productive evaluation Pending | Objective and other already valid results | Final component/full pass/fail depending on missing points | Evidence `pending`; continue unrelated coaching; bounded retry/one justified escalation/fresh sample. |
| Technical/content/media/access/browser/network/partner/evaluator failure | Unaffected proved scope only | Negative learner outcome for affected scope | `not_counted`, `partially_valid`, or Pending; neutral explanation and fresh fair opportunity. |
| Exposed/reused family | Practice/repair under disclosed condition | Independent/fresh confirmation | Exclude from independence; select a fresh family/form. |
| Blueprint incompatible | Historical capability if mapping remains valid | Current P4/mock/current booking claim | Freeze dependent result; revalidate mapping/new form and recompute. |

One passing mock affects its units immediately but cannot alone create High confidence or Safe with missing breadth. Two independent clean full-mock passes on separate days/fresh forms form a descriptive “repeated full-mock pass” milestone, not a hidden readiness or booking rule. Mixed recent mocks create contradiction reasons. Older mocks retain history but decay under current-readiness policy.

## 9. Ready-to-Book gate

Evaluate in order and return every gate result; short-circuiting may optimize internal work only if the published response still carries all already-known failures and marks unevaluated dependencies explicitly Pending.

| Gate | Exact requirement | Example granular failure codes |
|---|---|---|
| A — target valid | TELC B1 active; approved current blueprint; affected content/evaluation valid | `target_inactive`, `blueprint_unverified`, `affected_content_invalid`, `target_mapping_pending` |
| B — both components Safe | Written Safe; Oral Safe; each estimate ≥65 and each lower range ≥60 | `written_not_safe`, `oral_not_safe`, `written_range_crosses_pass`, `oral_range_crosses_pass` |
| C — decision-grade breadth | Full Written and Oral minima in §7.4 still present | `written_breadth_missing`, `oral_interaction_missing`, `timing_anchor_missing`, `productive_second_occasion_missing` |
| D — current full-mock pass | One clean full mock within 14 days with Written ≥135 and Oral ≥45 | `clean_full_mock_missing`, `clean_full_mock_too_old`, `full_mock_written_failed`, `full_mock_oral_failed`, `full_mock_evaluation_pending` |
| E — independent consistency | Within 30 days and independent of Gate D: additional clean Written pass and additional clean Oral pass; one second full mock may satisfy both | `written_confirmation_missing`, `oral_confirmation_missing`, `confirmation_not_independent`, `confirmation_too_old` |
| F — confidence/contradiction | Overall confidence Medium+; no unresolved pass-critical contradiction; no materially decisive Pending/low-confidence productive result; no unsupported target-condition/accommodation equivalence | `confidence_below_medium`, `pass_critical_contradiction`, `productive_decision_pending`, `accommodation_equivalence_unresolved` |

~~~typescript
type Gate = "A_target" | "B_safe" | "C_breadth" |
  "D_full_mock" | "E_independent_confirmation" | "F_confidence";
type GateResult =
  | { gate: Gate; status: "passed"; evidenceRefs: Id[]; evaluatedAt: Instant }
  | { gate: Gate; status: "failed"; reasons: NonEmpty<BookingReason>; nextEvidence: Clarifier[] }
  | { gate: Gate; status: "pending"; reasons: NonEmpty<BookingReason>; dependencyRefs: Id[] };
type BookingGateResult = { status: "not_ready" | "close_performance" |
  "close_confirmation" | "ready_to_book" | "booked_current" |
  "booked_readiness_under_review"; gates: Six<GateResult>; rulesVersion: Version };
~~~

No exam date, urgency, learner override, historical pass, total score, or strong opposite component can waive a gate. If a Ready learner later loses a gate, preserve the milestone snapshot and change current state immediately: performance failure may yield Borderline/Not ready; confirmation age alone normally yields Safe or `stale_contradicted`; target/correction uncertainty yields `stale_contradicted`/Pending. Booking remains a learner fact and changes coaching urgency, never evidence.

~~~mermaid
stateDiagram-v2
  [*] --> not_eligible
  not_eligible --> close_performance: neither component Not ready, performance gap remains
  not_eligible --> close_confirmation: both estimates look safe, confirmation gap remains
  close_performance --> close_confirmation: both components become Safe
  close_confirmation --> ready_to_book: A and B and C and D and E and F
  ready_to_book --> under_review: any gate regresses or becomes Pending
  under_review --> ready_to_book: all six gates restored
  under_review --> close_confirmation: Safe remains, confirmation/currentness missing
  under_review --> close_performance: a component becomes Borderline
  under_review --> not_eligible: a component becomes Not ready
~~~

## 10. Recalculation, invalidation, and audit

### 10.1 Trigger-to-impact policy

| Trigger | Authoritative new fact | Affected current interpretation | Unaffected preservation / client state |
|---|---|---|---|
| Evidence correction | Evidence validity assertion with exact observation/unit scope | Eligibility, units, component/range/confidence/band, mock/gates using it | Preserve other units and original snapshots; dependent claim Pending/rebuilding |
| Content defect | Content impact assertion naming revisions/items/families/forms and fairness/correctness dimensions | `not_counted`/partial/Pending admission, then dependent projections | Rights-only takedown does not invent negative evidence; bytes stop serving separately |
| Evaluator correction/release withdrawal | Accepted evaluator impact with rubric dimensions and candidate refs | Productive units and dependent component/mock/gates | Objective/unaffected dimensions remain; if raw input expired, request fresh sample, never fabricate |
| Staleness boundary crossed | Scheduled deterministic age event against calibration release | Weight/eligibility, range/confidence, Safe/Gates D/E | History remains; current state explains exact aged evidence and smallest recheck |
| New contradiction | Newly accepted independent E3/E4 result | Estimate normally updates; range widens/confidence falls; gate F may fail | Do not shotgun-regress unrelated capability; analyze condition/scope |
| Blueprint change | New approved target release plus compatibility mapping/impact | Current target mapping, P4 eligibility, all affected calculations/gates A–C | Historical capability/snapshot remains; incompatible current claim absent/Pending, never zero |
| Calibration/rules release | Approved immutable release | Shadow rebuild all in declared cohort/scope | Facts unchanged; compare current/candidate; rollback active binding |

### 10.2 Recomputation sequence

~~~mermaid
sequenceDiagram
  participant O as Semantic owner
  participant F as Fact transaction
  participant Q as Durable job queue
  participant R as Readiness projector
  participant A as Audit/snapshot store
  participant U as API/client
  O->>F: append correction/impact/release approval
  F->>F: allocate learner sequence and impact hash
  F->>Q: enqueue unique impact+projection+generation
  Q->>R: rebuild affected scope at source cut
  R->>R: eligibility -> units -> components -> states -> gates
  R->>A: write shadow generation, reasons, checksum, audit diff
  R->>R: validate invariants and regression fixtures
  alt valid generation
    R->>A: atomically publish active pointer
    A->>U: material change/snapshot available
  else invalid or incomplete
    R->>A: retain last validated generation; record failure
    A->>U: stale/rebuilding or dependent Pending
  end
~~~

### 10.3 Audit contract

| Audit record | Required fields | Idempotency / proof |
|---|---|---|
| Calculation request | trigger kind/ref, affected learner/scope, source cut, target/calibration/rules versions, requested generation | Unique `(impact_assertion_id, projection_kind, scope_hash, generation)`; exact retry returns same result |
| Eligibility trace | observation/assertion refs, occasion/family refs, condition, included/excluded scope and reason, weights | Deterministic sorted input checksum; no response/audio in routine logs |
| Projection generation | all lineage axes, unit/section/component values/ranges/confidence, band/state/gates, reason codes, checksum | Replay same cut/version must match; differing checksum blocks publish |
| Material snapshot | previous/new generation, structured diff, change reason, learner-facing explanation key, computed/effective time | Append only; historical snapshot never retargeted |
| Privileged release | actor/role/purpose, proposal/diff, official/provenance evidence, validation result, approval, effective time, rollback | Dual-step proposal/approval audit even if one personal-project operator holds both roles at different times |
| Failure/recovery | job attempts, bounded retry, affected dependency, last validated generation, operator action | No learner-failure status; coalesced retry cannot duplicate snapshot/event |

Rebuild order is deterministic (learner sequence, stable IDs); timestamps are inputs only where policy names them. Publish requires: no NaN/out-of-range values; official weights reconcile; absent remains absent; Written/Oral gates are separate; reasons are exhaustive; all six booking gates exist; no forbidden probability semantics; accessibility text is complete.

## 11. Worked examples

### 11.1 Missing oral evidence

Written has complete current evidence and estimates 153/225. S1 exists, but S2/S3 are typed/solo and no interaction was measured. Oral is `{kind: absent, reasons: [interactive_oral_missing]}`; overall is `evidence_building`, index is null—not 0, not `min(68,0)`. Written remains visible as a Bestehen estimate. The next clarifier is a fresh interactive S2/S3 occasion.

### 11.2 Pending Writing evaluation

A full mock has valid objective Written results and valid Oral 50/75. Writing evaluation is Pending. Preserve objective section results, mock timing and Oral result. Written component/full-mock result and every dependent band/Gate D are Pending; unrelated coaching continues. Timeout or provider failure cannot become Writing 0. A bounded retry/one justified escalation may run; otherwise request a fresh fair Writing sample.

### 11.3 Partial mock after media failure

A full mock completed the 90-minute Reading+Language Elements block and Writing cleanly; Listening H2 audio failed. The mock is not a clean full mock. R/SB/Writing can remain valid scoped evidence; H2 is `not_counted`, Listening/full sequencing claim is incomplete, and the affected current component may become absent/Borderline depending on other H2 evidence. The learner receives neutral failure copy and a fresh H2 opportunity.

### 11.4 Contradicted Ready milestone

A learner was Ready to Book, then a new independent clean oral component scores 41/75. The original Ready snapshot stays historical. New E4 evidence updates Oral; the planning range widens and Gate F fails. Current state becomes `stale_contradicted` during rebuild, then Borderline/Not ready as the validated projection dictates. Strong Written cannot compensate; the coach targets the smallest oral cause/recheck.

### 11.5 Safe but not Ready

Written 151/225 (range 140–160), Oral 51/75 (range 46–57), Medium confidence, complete breadth: both are Safe. The latest clean full mock is 20 days old. Current state is `safe`, not a higher/lower score; Gate D fails `clean_full_mock_too_old`. UI may group blockers, but must retain Gate D and all other A–F results. The next action is one fresh full simulation, not generic study.

### 11.6 High total with failed component

Written 150/225 plus Oral 35/75 totals 185/300. Oral is below 45 and the overall state is Not ready. No total, index display, confidence, historical pass, or booking urgency overrides the Oral gate.

### 11.7 Blueprint change

An approved target revision changes a unit mechanic. Historical outcomes retain old blueprint lineage. Compatibility review preserves unaffected capability but marks the changed current target unit absent/Pending; current Safe/Ready becomes `stale_contradicted`, Gate A fails, and a new approved form/recheck is requested. It never writes zero or erases the milestone.

## 12. Boundary APIs, compatibility, and events

Stage 12 owns transport syntax; this stage fixes semantics. Queries return one versioned projection envelope containing component estimates/absence, index/absence, six-state union, complete reasons, Gates A–F, mock consistency, lineage, staleness/rebuild status, and a complete textual alternative. Commands accept occurrence/owner facts only; clients cannot set score, band, state, gate, reason, validity, calibration, or active blueprint.

Conceptual owner events/jobs:

- `EvidenceInterpretationChanged`, `ContentImpactAsserted`, `EvaluatorImpactAccepted`, `TargetBlueprintActivated`, `CalibrationActivated`;
- `ReadinessRecomputeRequested/Published/Failed`, `MaterialReadinessSnapshotRecorded`;
- `MockOutcomeFinalized`, `MockInterpretationRevised`, `BookingGateProjectionChanged`.

Each carries an idempotency operation, source ref, affected scope, recorded/effective time, contract major/minor, and lineage—not raw learner response/audio. “Changed” events publish semantic facts/projections; they do not instruct consumers to recalculate with local formulas.

Compatibility rules: additive optional fields/reasons are allowed only with safe fallback text; an unknown state, gate, official unit, lineage requirement, or consequential major is rejected/neutral unavailable. Stale clients never guess the latest target/calibration. Offline clients may show a pinned last validated snapshot labeled with computed time and stale status; they cannot assert Ready after its currentness horizon without server revalidation.

## 13. Failure, security, privacy, rights, and accessibility

### 13.1 Failure and recovery

- Technical, content, media, accessibility, browser, network, partner, or evaluator faults never become learner failure. They yield Pending, `not_counted`, `partially_valid`, or interruption with exact scope.
- Pending productive evaluation blocks only the units/component/mock/gates that depend on it. Objective/unrelated evidence, repair, planning, and navigation continue.
- Queue/provider/Corpus outage leaves active approved content and last validated projections available with honest age. Ordinary attempts/mocks/Readiness never call live Corpus.
- Unknown incompatible rules/blueprint/evaluator data fails closed for the dependent claim. Deterministic objective scoring and unaffected projection remain.
- Recovery uses bounded durable retry, coalescing, last-validated fallback, shadow rebuild, fresh fair sample, or approved rollback. It never silently substitutes “latest,” zero, or AI certainty.

### 13.2 Security, privacy, and rights

- Least privilege separates read projection, evidence admission, content impact, blueprint proposal/approval, calibration proposal/approval, and projection publication. Direct table edits and UI/operator relabeling are forbidden; every privileged semantic action is audited.
- Protect calculations and history against IDOR by learner-scope authorization; use opaque IDs, server-owned learner sequence, CSRF/session protections, input/contract validation, and encrypted managed stores/backups from Stages 03/05. Logs/metrics contain identifiers, scope codes, versions, timings and counts—not response text, raw audio, tokens, or full learner profiles.
- Raw Speaking audio remains ephemeral under the accepted retention/deletion contract. A deleted payload cannot be resurrected for reevaluation; affected result becomes Pending/needs fresh sample where necessary.
- Export includes learner-understandable attempts/evidence, Written/Oral estimates/ranges/confidence/bands, mock results/validity, gate history, material corrections and version labels; deletion removes learner-linked facts/projections/snapshots per Stage 05 and the restore-suppression journal.
- Rights status controls serving/exporting bytes, not whether a learner failed. A rights-only takedown preserves prior capability unless correctness/fairness/target mapping is affected; a scoped impact assertion determines recomputation. Jurisdiction-specific legal wording/review remains later work; this document makes no compliance claim.
- Corpus receives no learner ID/profile, response, exposure, mistake, Readiness, date, preference, fatigue, or accessibility declaration. Readiness consumes only App-approved versions and App Evidence.

### 13.3 Accessibility

Every chart, pass line, range, confidence meter, band, blocker, change timeline, mock comparison and gate checklist has a complete ordered textual alternative containing: Written/Oral points and maxima; estimates/ranges; official pass lines; Bestehen Safe label; confidence; current state; missing/Pending scope; all blocker reasons; computed/currentness time; and smallest recheck. Color, position, animation, hover, and chart shape are never the sole carrier.

The same semantic projection drives phone, tablet, desktop, print/export and assistive technology; desktop may expose claim and audit trail together but cannot add a denser/different calculation. Meaningful animation honors reduced motion and never delays state availability. Focus/order/language are stable; reasons are plain language, not evidence jargon.

Non-answer-bearing accessibility support remains evidence-equivalent when it does not change the tested capability; its condition is preserved. If target/accommodation equivalence is unresolved, do not penalize performance—block only the target-condition/booking claim and request a fair equivalent recheck. Accessibility failure yields no negative evidence.

## 14. Performance, reliability, operations, validation, and cost

### 14.1 Performance and reliability

Read paths use the active validated projection; they never replay the ledger or call AI/Corpus. Attempt finalization commits occurrence/evidence facts and a durable recompute request atomically but need not block on all projections. Objective scoped recomputation should normally publish quickly; productive Pending is explicit. Stage 17/24/26 own numeric SLOs/alerts, informed by observed traffic and personal-project cost rather than invented capacity.

Coalesce multiple impacts by learner/scope/source cut; index observation scope, current validity, occasion, target unit, projection generation and active pointers. Use targeted recomputation, with deterministic full replay as correctness fallback. Preserve one current and previous validated generation plus material snapshots under Stage-05 retention; prune only rebuildable transient candidates.

### 14.2 Operations and monitors

Measure without analytics warehouse:

- recompute queue age/count, retries, failure and publish latency by scope/trigger;
- replay checksum mismatch, invariant rejection, stale/rebuilding duration and source-cut lag;
- state/band/gate transitions with raw counts, reason frequencies and material correction impact;
- missing/Pending duration by unit/evaluator, content defect scope and fresh-form inventory;
- evaluator confidence/disagreement/drift and target/calibration release diffs;
- Safe/Ready false-safe validation against voluntary frozen real-outcome snapshots when available;
- CPU/database/job minutes, storage/snapshot growth, evaluator/model calls/tokens/audio seconds, egress and operator review minutes.

Release procedure: propose immutable blueprint/calibration; verify provenance; shadow replay representative/synthetic histories; inspect diff and fairness/access-condition slices; run invariants/fixtures; approve effective time; atomically activate; monitor; roll back pointer and recompute if thresholds fail. No parameter changes silently mid-snapshot.

### 14.3 Required validation matrix

| Test/evidence | Required invariant | Failure action / future owner |
|---|---|---|
| Golden official-blueprint fixtures | Point weights total 225/75/300; 135 and 45 independent; exact units/mechanics | Block target release; Content/Measurement |
| Property/generative calculation tests | Deterministic replay; bounds; absent not zero; min index; no compensation; order independence | Block rules release; Stage 12 implementation |
| Eligibility/validity matrix | All five states, partial exact scope, assistance/exposure/family/occasion rules | Block release; Evidence/Measurement |
| Six-state/gate transition fixtures | Exhaustive reasons; Safe ≠ Ready; all A–F; reversible history | Block release; Measurement |
| Fault injection | Every technical/content/media/access/browser/network/evaluator failure has zero learner penalty; Pending is scoped | Block release; Stages 12/17/25 |
| Recompute concurrency/idempotency | Duplicate/out-of-order correction/job cannot duplicate snapshots or regress source cut | Keep last validated; Stages 12/24 |
| Accessibility semantic snapshots | Screen reader/keyboard/zoom/reduced motion/print expose complete equivalent text | Block affected UI release; Stages 17/22/25 |
| Security tests | Learner isolation; privilege separation; release audit; no raw response/audio logs; forbidden probability names | Block release/rotate/review; Stages 20/23/25 |
| Synthetic histories | Below B1; asymmetric components; sparse excellent mock; assisted-only; old/contradictory; Pending; S2/S3 missing; blueprint change | Tune only via versioned release; Measurement/Stage 24 |
| Outcome calibration | Matched predicted vs actual Written/Oral; false-safe; range coverage; evaluator/fairness slices | Probability stays absent; Stage 24/27 |

### 14.4 Cost and sustainability

The default uses the accepted PostgreSQL/Kysely data authority, pg-boss durable jobs, deterministic in-process rules, cached projections, objective key scoring and bounded structured productive evaluation. There is no recurring AI call for readiness, gating, analytics summary, or learner copy; no Kafka, rules SaaS, warehouse, feature-flag/calibration SaaS, or realtime voice requirement.

Cost classes are ordinary database/worker CPU, projection/snapshot storage/backups, productive evaluator/transcription calls when needed, and operator review. Track actual unit cost and quality. Cheapest safe fallback is slower/coalesced background recompute, deterministic objective results, low-cost validated evaluator, one justified escalation, and a fresh sample—not deleting Writing/Speaking evidence or narrowing accessibility.

Upgrade triggers: sustained learner-visible recompute SLO failure after query/index/coalescing optimization; evaluator disagreement/false-safe evidence justifying a stronger provider; projection workload isolation justified by seven-day measured contention; retained rebuildable bytes dominating cost; or outcome volume justifying a separate calibration workflow. Provider exit exports structured candidate/benchmark/lineage metadata through the Productive Evaluation port; facts/projections remain provider-neutral. A later warehouse is justified only when real cohort/outcome analysis outgrows portable PostgreSQL exports.

## 15. ADRs and relationship to other stages

This stage creates **ADR-0018 — Deterministic versioned Readiness and reversible booking gate**, status **Accepted**. It summarizes `ARCH-S11-D01`–`D10` and does not supersede earlier ADRs.

Preserved dependencies:

- ADR-0001 evidence truth/uncertainty; ADR-0002 deterministic low-ops posture;
- ADR-0010 single owners and ADR-0011 shared five-skill foundation;
- ADR-0012 append-oriented PostgreSQL truth; ADR-0013 evidence envelope/five validity states;
- ADR-0014 deterministic learner projections; ADR-0016 immutable forms/family independence;
- ADR-0017 signed Corpus bundles/atomic App promotion and runtime independence.

Downstream stages must preserve:

- **12–14:** typed projection/recompute/event semantics; no client/provider calculation, compensation, or probability; productive Pending blocks only dependencies.
- **17–19:** render all six states, complete text alternatives and every Gate A–F; UI grouping cannot drop a gate; Safe remains distinct from booking.
- **20–23:** account/offline/export/delete/security/notification contracts retain lineage, absence and reversibility; stale clients cannot assert current Ready.
- **24:** lean instrumentation, frozen material snapshots, independent Written/Oral outcome validation, parameter release governance and probability gate.
- **25:** bounded evaluator/accessibility/reliability/cost decisions cannot manufacture learner failure or remove pass-critical modalities.
- **27–28:** validate and consolidate the same official-versus-Bestehen distinction, bottleneck, no compensation/probability, correction and gate invariants.

No new commercial/provider dependency is introduced. No existing dependency is removed.

## 16. Risks, assumptions, deferrals, and exit criteria

| Risk / assumption | Evidence/test needed | Mitigation / review trigger |
|---|---|---|
| Launch heuristic ranges/65 produce false-safe or excessive conservatism | Synthetic/human review then matched real Written/Oral outcomes | Versioned calibration; preserve 65 until evidence/approval; rollback |
| Productive evaluator bias/drift changes a pass-critical result | Gold benchmarks, human agreement, repeatability, access-condition/fairness slices, gate-flip rate | Lower quality weight, Pending, one escalation/fresh sample, withdraw release |
| P4/form scarcity prevents independent confirmation | Inventory/family/exposure coverage metrics and scenario tests | Prioritize fresh original reviewed forms; Gate remains honestly unmet |
| Target blueprint changes | Scheduled/source-triggered official verification and semantic diff | Gate A fail closed, scoped mapping/rebuild, approved new forms |
| One correlated mock overstates confidence | Occasion/family property tests and replay | Cluster by occasion; no mock multiplier; distributed confirmation |
| Projection backlog leaves stale advice | Source-cut/rebuild age and learner-visible latency | Coalesce/tune; show stale/Pending; isolate only after measured need |
| A design grouping hides gates/reasons | Contract and accessibility snapshot tests across responsive layouts | Server returns A–F; block UI release if any meaning is lost |

No owner question blocks Stage 11.

Intentionally deferred, with architecture already bounded:

- exact HTTP/SQL/event serialization, queue SLO and cache headers — Stage 12;
- Writing/Speaking evaluator/provider/benchmark thresholds and accommodation equivalence — later productive-evaluation/accessibility stages, without changing ownership or fault semantics;
- learner-facing placement, wording, notifications and responsive implementation — Stages 17–19/22–23, using exhaustive server semantics;
- real-outcome consent/verification UX, cohort thresholds beyond the minimum gate and statistical method — Stage 24/27;
- provider procurement/pricing and jurisdiction-specific legal review — later security/privacy/operations owner; no compliance claim here.

Exit/fallback is portable: export immutable facts/releases/snapshots and replay the deterministic policy into another PostgreSQL/worker or application process. Evaluator/provider exit does not rewrite accepted history. If empirical probability never becomes defensible, index+ranges remains permanent.

## 17. Decisions made and definition of done

1. One Measurement owner deterministically publishes Readiness, mocks, and booking projections.
2. Official blueprint (225/135, 75/45, 60) and Bestehen calibration (65 plus rules) are distinct immutable releases.
3. Only eligible independent direct E3/E4 episodes set official-unit estimates; missing is absent.
4. Written and Oral aggregate independently; `min(W,O)` is a non-probabilistic bottleneck.
5. Exactly six reasoned client states are published.
6. Mock scope/family/occasion/conditions are pinned; original outcomes are immutable and partial/Pending remain scoped.
7. Ready to Book requires reversible Gates A–F with granular blockers.
8. Correction/staleness/contradiction/evaluator/blueprint impacts rebuild scoped shadow generations with audit.
9. Empirical parameters have provenance/effective date/validation/rollback; pass probability is structurally forbidden until a new approved major.
10. Deterministic scoring/gating has no recurring AI call and preserves accessibility, failure truth and low operations.

Definition-of-done check:

- [x] All required inputs and current SHAs/commits recorded; prerequisites reconciled.
- [x] Official target, Safe policy, eligibility, aggregation, ranges, confidence, bands/index and reasons specified.
- [x] Six states, missing versus zero, mock matrix, occasion/family/partial/Pending semantics and immutable outcomes specified.
- [x] Full Stage-17 Gates A–F, reversibility and granular reasons specified.
- [x] Correction/recompute sequence, audit/idempotency and worked missing/pending/partial/contradicted examples included.
- [x] Alternatives, ownership, state/API/version compatibility, security/privacy/rights, accessibility, failure/recovery, cost/operations and validation complete.
- [x] ADR-0018 accepted; downstream invariants, risks, fallbacks, upgrade triggers and deferrals named.
- [x] No production code, provider selection, Shaping/Design modification, owner blocker, compensation, or pass probability introduced.
