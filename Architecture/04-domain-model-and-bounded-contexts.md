# Bestehen / App — Domain Model and Bounded Contexts

> **Stage:** 04 of 28  
> **Status:** Accepted  
> **Decision date:** 2026-08-23  
> **Scope:** Logical domain ownership and contracts; no production schema, endpoint, provider, or deployment implementation

## 1. Purpose and scope

This stage defines the smallest sufficient domain model for Bestehen / App: ubiquitous language, logical bounded contexts inside the accepted modular monolith, one authoritative owner for every consequential state, legal dependency directions, and anti-corruption boundaries around UI, Corpus, and external processors.

The result prevents feature implementations, provider payloads, screens, or database tables from becoming accidental sources of product truth. It creates no production code, schema, migration, package scaffold, endpoint syntax, deployable configuration, design change, shaping change, or later-stage artifact.

## 2. Inputs, authority, and continuity

### 2.1 Current repository references

Every required input was read from current GitHub main. Blob SHAs identify the exact content used.

| Repository / commit | Path | Blob SHA | Use |
|---|---|---|---|
| m-elsharkawi/Bestehen-Shaping@9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc | app/28-bestehen-app-product-specification.md | 18ae80cc2fd63cecd76c297c3e56d44a68367856 | Highest App authority; §§2.1, 4–20 |
| same | app/04-learner-model.md | f7ae1f4af375ee3302d04c726d8fe8453a9daf80 | Evidence, capability lanes, conditions, confidence, freshness |
| same | app/05-mistake-memory.md | a7c574b08c33418eab44aba8b6e9b7f8ab877109 | Event/episode/pattern/weakness and lifecycle |
| same | app/06-daily-coaching-engine.md | 3cd869cd337dd3a878c27f35e1e8b5dad0c4c7bb | Session plan, priority, override |
| same | app/07-core-learning-loop.md | c313c859f64997972feca87497d70476c4528a20 | Canonical learning loop |
| same | app/08-a1-to-b1-progression.md | 839a01c010cf79777520714d0ab09304a2ba9a06 | P0–P4 local condition profiles |
| same | app/15-telc-readiness.md | b4456939928493569336bbc565d7e67307e7a3db | Written/Oral estimates and uncertainty |
| same | app/16-mock-exams.md | 8f6c23fa16524bd251cef39d823cfeea73bfcef3 | Mock scope, result, validity, consistency |
| same | app/17-ready-to-book-logic.md | 9e3e8b24faefe885d5b10409725619d0d0d84e6d | Gates A–F over Readiness |
| same | app/21-content-strategy.md | 8149d6a268da70e17cad46f774b9d5de77776986 | Content approval, freshness, rights, correction |
| same | app/22-user-controls-vs-coach-autonomy.md | 27f33cd56a09df27952e15bb3dfd0e077b89633c | Control matrix and Corpus → App contract |
| m-elsharkawi/Bestehen-App@e5d0605d96b2ded5573e9c05da2c5f49c044b22f | Design/DESIGN-HANDOFF.md | 417a6820037e045e2dd9f29afc42b9f2e94fd638 | §3 domain states, §6 accessibility, §7 assumptions |
| same | Design/Bestehen-01-Design-System.dc.html | d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a | §3 state projections |
| same | Architecture/00-architecture-shaping-plan.md | b263c5e7b3bccc0450ddd17aa0cc007432d672b7 | Workflow, authority, ADR convention |
| same | Architecture/01-architecture-charter-and-quality-attributes.md | cc8d28816f43d627861d11cd90e8770c4c96414c | Accepted truth, projection, failure constraints |
| same | Architecture/02-system-context-and-product-boundaries.md | 046d114bbbc96528bf0b9eae0406c0235f759127 | Trust zones, runtime/offline boundary, App authority |
| same | Architecture/03-technology-stack-and-repository-strategy.md | 907b04c57813dc50f92a7ed00e49196ff7d4a924 | Modular monorepo and pure-domain boundaries |
| same | Bestehen_App_Architecture_Checklist.md | 3fecaf563f5b50319625c2a0eb59c60d6a355ef7 | Stage-04 acceptance section before work |
| same | prompts/architecture/04_define_domain_model_and_bounded_contexts.txt | 158ce1fd137d8c15b24c9636e8c9309ab3188502 | Stage execution contract |

The App head contains accepted Stages 01–03 and ADR-0001 through ADR-0009. Stage 04 was absent and all 23 owned checklist items were open. Required Stages 01 and 02 are complete and consistent. Accepted Stage 03 constrains this stage to a pure domain in one TypeScript/pnpm modular monorepo without importing framework, storage, queue, or provider semantics.

### 2.2 Authority and source reconciliation

Authority is final specification → detailed shaping under Stage-27 precedence → Identity → Product Overview → human-authored design → illustrative runtime. Stage-27 order remains: validity/fairness → direct evidence → independent Written/Oral risk → uncertainty resolution → due repair/retention → progression/coverage → preference. Urgency changes priority only.

| Difference | Resolution |
|---|---|
| Design §3.5 says stabilising; shaping/final specification use Stabilizing. | Canonical domain/contract code is stabilizing. Presentation/localization may render “stabilising”; an inbound legacy alias maps explicitly and never creates another state. |
| Design §3.5 shortens the weakness lifecycle and omits Historical/Unconfirmed, Resolved and reopening. | Preserve the complete product lifecycle. historical_unconfirmed is one resting state. Reopening is a recorded transition from repaired/resolved back to known, not a simultaneous state. |
| Design §3.3 presents six readiness states; Stage 15 defines four component bands and Stage 17 defines booking gates. | Measurement publishes the six-state learner projection: evidence_building, not_ready, borderline, safe, ready_to_book, stale_contradicted. Component performance keeps Stage-15 meanings. ready_to_book is a gate over safe; stale_contradicted preserves history and names the recheck. |
| Stage 16 mock labels differ from evidence validity. | Measurement owns mock verdict; Evidence owns observation validity. Clean maps to valid; modified is valid only at actual narrower conditions; partial maps to partially_valid; system-invalid maps to not_counted; outstanding evaluation maps to pending. |
| Design §7 calls 65 and speech confidence open. Final §§10/20.5 settle behavior. | Model 60 as target truth; model 65 and confidence floors as versioned calibration with provenance, effective date, evidence, owner and rollback. |
| Design groups Ready to Book into four conditions; Stage 17 defines Gates A–F. | Preserve all six gates. UI may group them but cannot delete a gate or create another score. |

No shaping/design source is edited. No owner preference, legal-risk tolerance, or budget decision blocks this stage.

## 3. Ubiquitous language

| Term | Canonical meaning | Explicitly not |
|---|---|---|
| Learner scope | App-owned stable subject scope, anonymous or account-linked | Identity-provider subject or Corpus identity |
| Goal | TELC B1 target/date/availability/preferences for planning | Ability evidence |
| Capability node | Versioned exam-relevant concept in one direct ability lane | Global CEFR level |
| Ability lane | Reading recognition, Listening recognition, Writing production, Speaking production, observed Speaking interaction | Cross-modal mastery shortcut |
| Task family | Stable exam-shaped mechanism within a skill | Screen, route, or provider task type |
| Condition profile | Local P0–P4 mix of difficulty, help, timing, replay/reference, realism per family/lane | Learner badge or global course level |
| Session | Time-bounded coaching commitment with one dominant goal | Activity pile or compliance score |
| Attempt | One response episode with served content, actual conditions, and recovery history | Score alone |
| Evidence observation | Accepted lineage-bearing statement of what an attempt directly supports | Raw provider output or aggregate |
| Evidence validity | Exactly valid, partially_valid, pending, interrupted, or not_counted with scope/reason | Correctness or UI color |
| Independence | First attempt, immediate retry, delayed transfer, repeat/exposed, or fresh equivalent occasion | Another click |
| Learning evidence | Evidence useful for capability, repair, or progression | Automatically Readiness evidence |
| Readiness evidence | Fresh direct target-mappable B1 evidence under named conditions | Supported work, inference, activity, or mock label alone |
| Mistake event | One valid shortfall or unresolved outcome | Known weakness |
| Repair-chain episode | Attempt, diagnosis, repair, and same-chain retries as one independence unit | Multiple independent failures |
| Pattern | Defensible recurring manifestation/cause across opportunities | Speculative tag set |
| Known weakness | Pattern that passed promotion gates in its direct lane | One anomaly |
| Review obligation | Due fresh transfer/retention check with interval/purpose | Deck, debt, or punitive backlog |
| Fresh equivalent | New content preserving the mechanism while preventing answer-memory success | Exposed original with reordered options |
| Content family | Exposure/independence unit | Filename only |
| Approved content revision | App-owned immutable serving revision eligible for a role | Raw Corpus/reference material |
| Corpus bundle | Versioned rights-aware intelligence publication | Learner search result or learner profile |
| Mock | Declared no-coaching measured block with exact scope/rules/blueprint/promise | Evidence multiplier |
| Component | Independent Written or Oral pass-gated aggregate | Compensating total |
| Readiness Index | Target-performance estimate bottlenecked by weaker component | Pass probability |
| Safe | Estimate plus uncertainty/breadth/currentness meets Bestehen margin | Official certification or Ready to Book |
| Ready to Book | Current Stage-17 Gates A–F recommendation over Readiness | Higher score, permanent badge, or guarantee |
| Pending | Dependent conclusion unavailable; unaffected work continues | Zero or whole-product failure |
| Correction | Append-only scoped invalidation/reinterpretation with lineage | Destructive fact edit |
| Projection | Recomputable view with source/rules lineage | Independent authority |
| Anti-corruption layer (ACL) | Translator/validator protecting App semantics from foreign schemas | Pass-through mapper |

## 4. Bounded-context map

These are logical modules in the accepted modular monolith, not services, repositories, schemas, or queues.

| Context | Owns | Does not own |
|---|---|---|
| **Learner Profile & Goal** | learner scope, account-link intent, target/date, study/access preferences, declared accommodations/capabilities, data-rights request | mastery, Readiness, provider identity |
| **Session & Attempt** | session commitment, learner choice, loop position, attempt execution, response/checkpoint, timer/playback/help/exposure facts, interruption/idempotent completion | evidence interpretation, weakness, Readiness |
| **Evidence & Capability** | observation ledger, five validity states, conditions/labels, direct attribution, capability/confidence/freshness/stability, correction/recomputation | provider truth, coaching priority |
| **Coaching & Planning** | recommendation candidates, Stage-27 priority, plan lifecycle, structured reason, override/replan consequence | evidence, progression, Readiness mutation |
| **Mistake Memory & Review** | events/episodes/patterns, lifecycle, cause confidence, weakness priority, repair and review obligations | attempts, mastery, pass status |
| **Progression** | local family/lane P0–P4 profile, probe/promotion/confirmation/regression and support fading | global level, content approval, Readiness |
| **Content & Forms** | approved families/revisions/forms/media metadata, role, quality/rights/freshness eligibility, quarantine/correction scope | Corpus source truth, learner mastery, byte-store truth |
| **Corpus Publication ACL** | bundle receipt, compatibility, last-compatible activation, quarantine, translated intelligence | Corpus provenance authority, learner data/runtime search |
| **Measurement: Readiness & Mocks** | mock specification/result/verdict, Written/Oral estimates/bands, six readiness states, six booking gates, milestones | attempt capture, provider authority, pass probability |
| **Productive Evaluation** | bounded job, minimum payload, processor lineage, candidate result, confidence/disagreement/escalation, audio deletion obligation | accepted evidence or Readiness |
| **Operations & Governance** | incident/capability/cost/release health, calibration governance, export/delete orchestration evidence | edits to other contexts’ truth |

Identity, storage, jobs, routes, and provider SDKs are adapters, not domain owners.

~~~mermaid
flowchart LR
  Profile["Learner Profile & Goal"] -->|goal/access/preference view| Coach["Coaching & Planning"]
  Corpus["Corpus Publication ACL"] -->|compatible intelligence| Content["Content & Forms"]
  Content -->|approved revision| Attempt["Session & Attempt"]
  Content -->|fresh availability| Coach
  Coach -->|plan specification| Attempt
  Attempt -->|response/condition facts| Eval["Productive Evaluation"]
  Attempt -->|attempt facts| Evidence["Evidence & Capability"]
  Eval -->|candidate evaluation| Evidence
  Evidence --> Mistake["Mistake Memory & Review"]
  Evidence --> Progression
  Evidence --> Measure["Readiness & Mocks"]
  Attempt -->|measured run facts| Measure
  Mistake -->|weakness/review view| Coach
  Progression -->|working profile| Coach
  Measure -->|risk/gap view| Coach
  Ops["Operations & Governance"] -. observes and requests owner commands .-> Evidence
  Ops -. observes and requests owner commands .-> Content
~~~

Arrows are published fact/view dependencies, never shared-table ownership. Derived contexts never write backward into Evidence. Coaching is last in the decision chain and cannot change facts it consumes.

## 5. Architecture decisions, alternatives, and consequences

| ID | Recommended default and criteria | Credible alternatives and rejection | Consequence, fallback, review trigger | ADR |
|---|---|---|---|---|
| ARCH-S04-D01 | Eleven logical contexts inside one modular monolith; criteria are ownership, low coupling, local failure, solo sustainability. | A: undifferentiated domain is initially simple but semantically coupled. B: microservice/context isolates more but adds distributed failure/ops. C chosen: explicit in-process modules. | Split-compatible ports; no new runtime dependency. Split only after measured scale/security/isolation/ownership/deploy benefit exceeds cost. | ADR-0010 |
| ARCH-S04-D02 | Every consequential state has one command owner; others receive immutable facts or versioned projections. | A: shared mutable learner record makes correction/auth ambiguous. B: full event-stream platform is excessive. C chosen: append-oriented facts in ordinary storage later. | Rebuild projection from facts; review if scoped rebuild cannot meet Stage-24 SLO after ordinary optimization. | ADR-0010, ADR-0001 |
| ARCH-S04-D03 | Shared Session/Attempt/Evidence/Repair foundation with explicit modality extensions. | A: five stacks drift. B: generic question engine hides productive/media meaning. C chosen: shared semantic kernel plus typed extensions. | Replace modality adapters independently. Review repeated unsafe generic fields/casts, not UI differences. | ADR-0011, ADR-0002 |
| ARCH-S04-D04 | Separate attempt execution, evidence validity, outcome/evaluation, and mock verdict; preserve five validity states with scope. | A: one status conflates learner/system outcome. B: free-form flags are non-exhaustive. C chosen: closed state machines and mappings. | Unknown incompatible state quarantines dependent result. Product-state meaning changes only by superseding decision. | ADR-0010, ADR-0001 |
| ARCH-S04-D05 | Weakness resting states: candidate, historical_unconfirmed, known, repairing, stabilizing, repaired, resolved; reopening transitions back to known. | A: design-short lifecycle loses truth. B: permanent reopened duplicates known. C chosen: complete state plus WeaknessReopened transition. | Legacy names stay ACL/presentation aliases. Thresholds may calibrate; meanings remain stable. | ADR-0010 |
| ARCH-S04-D06 | Capability, Mistake, Progression, Readiness, Coaching are separate deterministic policy owners; Written/Oral independent. | A: global score violates direct evidence/gates. B: feature-local calculation drifts. C chosen: separate projections over Evidence. | Missing/Pending + smallest clarifier is fallback; no pass-probability field/event/copy. | ADR-0010, ADR-0001 |
| ARCH-S04-D07 | Corpus, provider, and UI ACLs protect App semantic authority; App approves serving and evidence. | A: direct foreign schemas create lock-in. B: duplicate translators spread coupling. C chosen: one ACL per foreign semantic source. | Last compatible bundle/cached content/Pending are fallbacks; replace transport/provider without domain rewrite. | ADR-0010, ADR-0004/5 |
| ARCH-S04-D08 | Independently version facts, rules/calibration, contracts, content/blueprint/taxonomy, evaluator; append corrections and recompute. | A: overwrite aggregates is unauditable. B: one global version over-invalidates. C chosen: typed lineage tuple. | Additive minor first; incompatible major rejected locally; rules rollback preserves facts. | ADR-0010, ADR-0001 |
| ARCH-S04-D09 | Access/accommodation/device capability are domain conditions; anonymous use has identical evidence semantics. | A: UI-only flags lose equivalence. B: block unsupported learners violates access/local degradation. C chosen: declaration + actual condition + claim policy. | Equivalent support preserves claim; capability change narrows claim. Stage 20/23 choose mechanism. | ADR-0011, ADR-0003 |
| ARCH-S04-D10 | Failures are owner-specific outcomes/corrections; Operations observes but never edits truth. | A: global error discards unaffected work. B: silent retry/guess creates false completion. C chosen: local unavailable/Pending/interrupted/not-counted. | Cached/deterministic/fixed alternatives; review incidents for narrower fallback or justified isolation. | ADR-0010, ADR-0003 |

Mutable numbers—promotion/recency/review gates, Safe margin, evaluator floors—are typed calibration records with provenance, effective date, validation evidence, named owner, rules version, monitoring, and rollback. Stable product meanings are not configurable.

### 5.1 Cross-cutting decision consequences

| Decision | Data/API/version | Security/privacy/rights/accessibility | Failure/operations/cost | Main consumers |
|---|---|---|---|---|
| D01 contexts | owner-tagged contracts and independent evolution | authorization follows owner; Content rights stay isolated | local failure; one deployable system; measured split only | all, especially 05/12/25 |
| D02 ownership | fact/correction/source-cut/rules lineage; projections rebuildable | shared mutable records and cross-owner privilege are forbidden | rebuild/replay fallback; avoids event-platform cost | 05–13, 24–28 |
| D03 five skills | one base contract plus versioned extensions | actual access condition preserved; raw media stays purpose-bound | modality-local degradation/provider exit; avoids five stacks | 05–09, 12–19, 21 |
| D04 status separation | exhaustive unions and scope-bearing reasons | system/access fault cannot be learner wrongness | dependent-only Pending/recovery; no guessed result | 05–08, 11–14, 17–25 |
| D05 weakness naming | one canonical state code and transition history; legacy alias at ACL | explanations disclose evidence, not stigmatizing speculative labels | stale/unconfirmed/recheck fallback; deterministic policy | 05–08, 11, 13, 24 |
| D06 derived policies | independently versioned projections; Written/Oral never merged | minimum evidence and no provider-owned truth | absence/clarifier fallback; no AI/probability cost | 05–08, 11–13, 24–28 |
| D07 ACLs | foreign version retained beside canonical mapping | minimum processor payload; Corpus learner isolation; serving rights rechecked | quarantine/last-compatible/cached/Pending; adapter exit | 09, 10, 12, 16–19, 23–26 |
| D08 version/correction | compatible minors, incompatible-major rejection, targeted recompute | rights/evaluator/blueprint correction remains auditable | rollback without fact loss; scoped recompute rather than full reset | 05, 09–12, 19, 23–28 |
| D09 access/anonymous | declaration and actual condition are separate versioned facts | account optional; accommodation is sensitive and least-visible | equivalent path or narrower claim, never block/failure | 13, 14, 20–23, 25 |
| D10 failure/governance | owner-specific incident/correction contracts | Operations has no semantic write privilege; logs exclude responses/audio | local disable/retry/fallback; split only after incident evidence | 12, 17–26 |

## 6. Authoritative state ownership

| Consequential state/fact | Single owner | Fact or derived | Consumer/projection rule |
|---|---|---|---|
| Learner scope and account-link history | Learner Profile & Goal | Fact | App ID is authority; provider subject proves identity only |
| Target/date/booked/completed, study/access preferences | Learner Profile & Goal | Fact/history | Date changes urgency, never ability |
| Declared accommodation/capability | Learner Profile & Goal | Fact | Attempt records actual use; Evidence decides equivalence |
| Learner choice: path, duration, skill, difficulty, help, stop/postpone/mock early | Session & Attempt | Fact | Never compliance/mastery; Coaching replans |
| Session plan/dominant commitment/priority reason | Coaching & Planning | Versioned derived plan | Attempt executes referenced plan; unfinished re-ranks |
| Observe/Attempt/Diagnose/Repair/Retry/Remember position | Session & Attempt | Execution state | UI projects; missing evaluation may defer diagnosis |
| Attempt lifecycle, response, checkpoint, timer/playback/help/exposure | Session & Attempt | Fact/history | Evidence/Measurement consume; provider cannot overwrite |
| valid/partially_valid/pending/interrupted/not_counted with scope/reason | Evidence & Capability | Accepted observation state | Only valid moves claimed full scope |
| correct/partial/incorrect/incomplete/skipped | Evidence & Capability | Supported observation dimension | Orthogonal to validity |
| Conditions/evidence labels | Evidence & Capability | Derived read-only projection | UI cannot edit; display limit is presentation |
| Direct lane, help/timing/exposure/independence/evaluator lineage | Evidence & Capability | Fact | All derived contexts use exact conditions |
| Capability band, confidence, freshness, stability, trend, assistance/timing | Evidence & Capability | Recomputable projection | Missing remains unknown/not measured |
| Mistake event and repair-chain episode | Mistake Memory & Review | Fact from observation refs | Same-chain retries are one episode |
| Cause and diagnosis confidence | Mistake Memory & Review | Versioned assessment | unresolved remains explicit |
| Weakness lifecycle and reopen transition | Mistake Memory & Review | State/log | Seven resting states; reopen returns to known |
| Weakness priority/pass-critical | Mistake Memory & Review | Derived | Uses risk input but does not own Readiness |
| Review obligation/due/completion | Mistake Memory & Review | State | Skip/postpone reschedules; fresh evidence satisfies |
| P0–P4 profile per family/lane and probe/confirmation/regression | Progression | Derived state/log | UI shows conditions, never global rung |
| Coach recommendation/plan revision | Coaching & Planning | Derived | Cannot mutate its inputs |
| Content family/revision/form/role | Content & Forms | Immutable revision/lifecycle | Only eligible revision may serve |
| Rights/quality/target/freshness eligibility and quarantine | Content & Forms | App decision | Quarantine triggers scoped correction request |
| Corpus provenance/authenticity/confidence/rights source | Bestehen / Corpus external | External fact | Corpus ACL translates; receives no learner state |
| Bundle compatible/active/quarantined/last-compatible | Corpus Publication ACL | Integration state | Ordinary work uses cached compatible data |
| Evaluation job/escalation/disagreement/candidate | Productive Evaluation | Job/state | Evidence alone accepts semantic result |
| Raw-audio deletion obligation/proof | Productive Evaluation | Short-lived fact | Delete accepted/terminal audio within seven days maximum |
| Mock definition/result/verdict/consistency | Measurement: Readiness & Mocks | Immutable result + projection | No mock multiplier; mapped to evidence scope |
| Written/Oral estimate/range/confidence/band | Measurement: Readiness & Mocks | Recomputable | Independent; missing is absence; weaker controls overall |
| Six Readiness states and Gates A–F | Measurement: Readiness & Mocks | Discriminated derived state | Ready requires all gates; Safe alone insufficient |
| Historical Safe/Ready/mock milestones | Measurement: Readiness & Mocks | Fact history | Current advice may become stale/contradicted |
| Calibration release | Operations & Governance | Governance fact; semantic owner named | Domain references accepted version |
| Incident/capability/dependency/cost/release health | Operations & Governance | Operational state | May disable adapter, never assign learner failure |
| Export/delete request | Learner Profile & Goal | Request fact | Operations orchestrates commands to each owner |
| Export/delete completion evidence | Operations & Governance | Audit fact | Does not replace owner deletion |

### 6.1 Canonical state families and projections

| State family | Canonical values/shape | Owner and projection rule |
|---|---|---|
| Evidence validity | valid · partially_valid · pending · interrupted · not_counted | Evidence; UI/provider cannot set; partial/Pending always names scope/reason |
| Evidence labels | With help · On your own · Open timing · Practice timing · Exam conditions · Fresh task · Seen before/practice only · Waiting for evaluation · Interrupted/practice only · Not counted/our fault | Evidence derives from condition facts; read-only learner projection |
| Capability mastery | unknown/not evidenced · not yet demonstrated · emerging · functional · reliable · target-evidenced | Evidence; claim-specific lane/difficulty/condition, never global level |
| Confidence | none · low · medium · high | Evidence or Measurement for its own claim; includes limiting reason |
| Freshness | fresh · aging · stale · historical-only | Evidence; history stays true while current usefulness changes |
| Stability | unproven · recent · stable | Evidence; delayed independent occasions required |
| Assistance dependence | unknown · independent · light-support responsive · support-dependent | Evidence; family/lane specific |
| Timing | not measured · within target · inconsistent · over target | Evidence; task-pattern/condition specific |
| Trend | improving · stable · declining/contradictory · insufficient evidence | Evidence; only comparable evidence |
| Assistance availability | default · on request · repair only · unavailable in measured attempt | Progression owns recommended profile; Attempt records actual offered/used |
| Session outcome | completed · partially completed · paused · replanned · blocked | Coaching owns plan outcome; never learner success/failure or evidence |
| Canonical loop | Observe · Attempt · Diagnose · Repair · Retry · Remember | Session & Attempt; skipped/deferred transitions only as §9.1 permits |
| Weakness | candidate · historical_unconfirmed · known · repairing · stabilizing · repaired · resolved; WeaknessReopened transition | Mistake Memory & Review; design-short form is a UI projection |
| Weakness priority | observe · monitor · active · high · pass-critical | Mistake Memory & Review; urgency cannot confirm a candidate |
| Progression | P0 supported foundation · P1 guided A2 · P2 A2/B1 bridge · P3 independent B1 · P4 target conditions | Progression; local per task family/lane and not learner badge |
| Mock verdict | clean target-condition · valid but modified · partially valid · invalid/excluded · pending evaluation | Measurement; explicit mapping to Evidence validity/actual conditions |
| Full-mock consistency | no clean result · one pass · repeated pass · mixed recent | Measurement; descriptive evidence, not booking or certification |
| Readiness | evidence_building · not_ready · borderline · safe · ready_to_book · stale_contradicted | Measurement; six-state learner projection over component band, gate, freshness, contradiction |
| Booking gates | A target valid · B both components Safe · C breadth · D current full-mock pass · E independent component consistency · F confidence/no contradiction | Measurement; all pass or exact blocker; never hidden aggregate |
| Productive evaluation | queued/in progress · candidate ready · retryable failure · escalation requested · pending/uncertain · accepted terminal · rejected/cancelled · deletion due/completed | Evaluation owns job state; Evidence owns whether/what semantic result is accepted |
| Corpus bundle | received · compatible · active · incompatible · quarantined · superseded/rolled back | Corpus Publication ACL; last-compatible pointer is explicit |
| Content revision | draft/internal · approved for named role · retired · quarantined/right-restricted | Content; only approved named role may serve/count |

UI screens/components/routes/colors/client cache/analytics are projections. They cannot create or edit semantic states. Provider results are untrusted candidates with release/method/confidence/supported dimensions. Operations invokes named owner commands rather than patching rows.

## 7. Aggregate, policy, command, and projection responsibilities

| Context | Aggregate/state machine | Value objects | Policy/service | Conceptual commands | Published output |
|---|---|---|---|---|---|
| Profile | LearnerProfile, ExamGoal, DataRightsRequest | learner scope, target/date, preferences | adoption intent, goal validity, minimization | establish scope; change goal/preferences; request export/delete | goal/access view |
| Attempt | Session, Attempt, Checkpoint, loop | task family, actual conditions, response ref | integrity, equivalence request, idempotency | start/save/submit/interrupt/stop/replan | attempt/condition facts |
| Evidence | EvidenceLedger logical aggregate, Capability projection | validity/scope, lane, independence, strength | acceptance, attribution cap, correction/recompute | accept observation; append correction; recompute | observation/capability/labels |
| Coaching | CoachingPlan | priority tier, reason, time/context | Stage-27 ranking, assembly, override replan | recommend/accept/replace/shorten/postpone | recommendation/plan revision |
| Mistake/Review | Weakness, ReviewObligation, lifecycle | cause/confidence, recurrence, interval | promotion, transfer/retention/reopen, scheduling | observe/diagnose/repair/transfer/postpone | weakness/due view |
| Progression | ProgressionProfile per family/lane | P0–P4 and difficulty axes | probe, one-axis change, confirm/regress | propose/record/confirm/adapt | working profile/next challenge |
| Content | ContentFamily, ContentRevision, MockForm | role, rights/quality/blueprint, checksum | approval, freshness, independence, correction scope | approve/retire/quarantine/reserve | eligible catalog/lineage |
| Corpus ACL | BundleReceipt | bundle/schema/taxonomy/blueprint/checksum | verify/translate/activate/rollback | ingest/activate/quarantine/revert | compatible intelligence/health |
| Measurement | MockDefinition/Result, ReadinessProjection, BookingGate | component, range, band/reason, gate | verdict, score mapping, eligibility, bottleneck, Gates A–F | finalize mock; recompute; evaluate gate | readiness/mock/blocker views |
| Productive Evaluation | EvaluationJob, DeletionObligation | purpose, release, dimensions, confidence, cost | precheck, one escalation, disagreement, timeout | request/cancel/retry/escalate/delete | candidate/Pending/deletion/cost |
| Operations | Incident, CalibrationRelease, ReleaseEvidence | health, metric, version, rollback | routing, release gates, calibration admission | open/resolve/publish/rollback/request correction | health/cost/release evidence |

These names are conceptual architecture notation, not production types or API syntax.

## 8. Shared five-skill foundation

All five skills share:

**approved revision → session/attempt → actual conditions → outcome/evaluation → evidence observation → diagnosis/repair → fresh retry → delayed review → capability/progression/readiness**

| Skill | Shared foundation | Modality extension | Forbidden substitution |
|---|---|---|---|
| Reading | attempt/result/timing/help/exposure/evidence | passage/item/task-family response, comprehension/strategy attribution | Reading → Listening/productive mastery |
| Language Elements | same | contextual selection/cloze and grammar/vocabulary attribution | tag → broad section ability |
| Listening | same | immutable media, playback/speed/transcript/capability facts | transcript-supported → clean Listening |
| Writing | same | resumable draft/final text, content points, rubric, reference/tool use, evaluator | quiz/model exposure → productive Readiness |
| Speaking | same | preflight, audio/turn/interaction, prep/restart/partner, rubric | typed rehearsal/monologue → interaction |

Writing and Speaking share an evaluation port but not task/rubric truth. Speaking production and interaction are distinct direct lanes. Listening/Speaking failures stay local.

~~~mermaid
sequenceDiagram
  participant C as Coaching
  participant A as Session & Attempt
  participant F as Content & Forms
  participant P as Productive Evaluation
  participant E as Evidence
  participant D as Derived contexts
  C->>A: plan and learner choice
  A->>F: reserve approved fresh revision
  F-->>A: immutable revision/role reference
  A->>A: capture response, conditions, checkpoints
  alt deterministic result
    A->>E: attempt facts and result candidate
  else productive evaluation
    A->>P: minimum response/rubric context
    P-->>E: structured candidate or Pending
  end
  E->>E: validate scope, validity, directness, versions
  E-->>D: accepted observation/correction reference
  D->>D: recompute affected projections only
~~~

## 9. State machines and flows

### 9.1 Canonical loop

~~~mermaid
stateDiagram-v2
  [*] --> Observe
  Observe --> Attempt
  Attempt --> Diagnose: supported result
  Attempt --> Remember: valid correct; no repair
  Attempt --> Attempt: checkpoint/recover
  Attempt --> Remember: interruption/system fact preserved
  Diagnose --> Repair: supported shortfall
  Diagnose --> Remember: no repair/unresolved/deferred
  Repair --> Retry: fresh equivalent available
  Repair --> Remember: deferred/unavailable
  Retry --> Diagnose: one useful rediagnosis
  Retry --> Remember
  Remember --> [*]
~~~

Attempt is required for new ability evidence. Repair/Retry are conditional. Mocks defer coaching until the block ends. Remember commits facts and obligations; it does not claim mastery by itself.

### 9.2 Mistake Memory

~~~mermaid
stateDiagram-v2
  [*] --> Candidate: supported valid event
  Candidate --> HistoricalUnconfirmed: unconfirmed/ages
  Candidate --> Known: promotion gates
  Known --> Repairing: targeted repair
  Repairing --> Stabilizing: delayed fresh transfer
  Stabilizing --> Repaired: transfer criteria
  Repaired --> Resolved: retention holds
  Stabilizing --> Known: recurrence
  Repaired --> Known: WeaknessReopened
  Resolved --> Known: WeaknessReopened
  HistoricalUnconfirmed --> Candidate: plausible new event
~~~

Immediate retry success is responsiveness, not retention. Productive weaknesses require productive repair. Low-confidence anomaly requests recheck rather than reopening.

### 9.3 Evidence validity

| State | Legal effect | Recovery |
|---|---|---|
| valid | Entire named scope supported under actual conditions; only state moving claimed full component | derive normally |
| partially_valid | Named unaffected units/dimensions only | preserve them; whole-block claim absent |
| pending | evaluation/validation incomplete | block dependent conclusion only; resolve idempotently |
| interrupted | useful practice but clean continuous/target claim lost | preserve defensible facts; practice/resume/new clean attempt |
| not_counted | content/media/evaluator/system/access fault unfair/unsupported | neutral visible history, “This wasn’t you,” no penalty; quarantine/correct |

Correctness is orthogonal: a valid wrong answer is learner evidence; a broken apparent wrong answer is not_counted. Missing estimate is absence, never zero.

### 9.4 Readiness

~~~mermaid
flowchart TD
  Obs["Eligible direct observations"] --> W["Written estimate/range/confidence"]
  Obs --> O["Oral estimate/range/confidence"]
  W --> B["Bottleneck overall state"]
  O --> B
  B --> G{"Stage-17 Gates A–F"}
  G -->|all pass| R["ready_to_book"]
  G -->|safe; gate fails| S["safe + named blocker"]
  B --> X["evidence_building / not_ready / borderline"]
  Obs --> C["fresh contradiction/stale target"]
  C --> U["stale_contradicted + smallest recheck"]
~~~

Written/Oral never compensate. Overall uses the weaker component only when both are eligible. No pass-probability field, model, event, copy, or hidden calculation exists before the empirical gate.

## 10. Dependency and anti-corruption rules

1. Domain modules depend on domain values/ports, never Next/React/Kysely/pg-boss/R2/Render/provider SDKs, row types, or clock/random globals.
2. Profile, Content, accepted Evidence are upstream facts. Mistake, Progression, Measurement derive independently and never write back.
3. Coaching consumes read-only Profile/Content/Mistake/Progression/Measurement views and writes only plans.
4. Attempt records actual learner action/conditions even when they differ from recommendation.
5. Productive Evaluation emits a candidate only; Evidence validates dimensions/confidence/release/scope.
6. Corpus publication carries no learner ID/profile/evidence. Routine attempts never call live Corpus search/AI.
7. Content approval stays App authority even when Corpus supplies authoritative provenance/rights metadata.
8. Operations may disable an adapter/capability, but semantic mutation uses owner commands.
9. UI/API/job/bundle contracts map from canonical states; consumers do not recreate rules.
10. Cross-context workflows use idempotent commands/immutable refs. One later DB transaction does not create joint ownership.

| Boundary | Accepted input and ACL | Failure/fallback/exit |
|---|---|---|
| Corpus → Publication | verify schema/checksum/version/compatibility; map to App intelligence, preserve unknowns | quarantine; last compatible + verified blueprint/curated seed; change transport |
| Publication → Content | App quality/rights/role/fresh-family approval | lower claim/omit precision; generic B1; never fabricate P4 |
| Provider → Evaluation | validate schema/ranges/release/dimensions/confidence; one escalation | deterministic/cached/fixed/Pending; swap adapter using benchmark fixtures |
| Evaluation → Evidence | App acceptance/directness/validity | reject/narrow dimensions or Pending; never direct Readiness write |
| UI/browser → domain | command intent + idempotency/expected revision; server authorizes/validates | conflict/incompatible/unavailable/validation; checkpoint/retry; cache never wins |
| Identity → Profile | authenticated subject proof mapped to App learner scope | anonymous continues; replacement preserves App IDs |
| Object store → owners | checksum/TTL/rights verification; metadata remains authority | text/cached alternative; portable S3 migration |

## 11. Data, contracts, and versioning

Explanatory pseudotypes, not implementation:

~~~text
AttemptFact = identity + learner_scope + content_revision + task_family + modality_extension
            + response_reference + actual_conditions + checkpoint/interruption history + occurred_at

EvidenceObservation = identity + attempt_reference + direct_lane + supported_dimensions
                    + validity/scope + outcome + help/timing/exposure/independence
                    + evaluator/content/blueprint/taxonomy lineage + occurred_at

DerivedProjection = identity + learner_scope + kind + source_cut
                  + rules/calibration versions + computed_at + discriminated state/reasons

Correction = identity + authoritative_owner + affected fact/scope
           + reason + effective_at + source + supersedes/excludes + requested recomputations
~~~

The ledger is logically append-oriented; Stage 05 chooses storage. Corrections stay auditable. Projections are replaceable caches.

| Version axis | Owner/rule |
|---|---|
| Domain/API/job contract | owning context/Stage 12; additive minor first; incompatible major rejects dependent input |
| Target blueprint/pass rule | Measurement; exact version on target evidence; material change scopes revalidation |
| Content/form/media revision/family | Content; immutable served revision and correction scope |
| Corpus bundle/schema/taxonomy | Publication ACL; explicit compatibility/last-compatible fallback |
| Evidence/capability/mistake/progression/readiness rules | named owner; projection records version; rollback/recompute preserves facts |
| Calibration | semantic owner + Operations governance; provenance/effective date/evidence/rollback |
| Evaluator/rubric/model release | Evaluation/Content rubric; candidate carries lineage; unsupported dimensions rejected |

Client unions are exhaustive. New semantics require compatible behavior or contract major. Unknown never maps to success, failure, or zero.

~~~mermaid
sequenceDiagram
  participant O as Operations/learner report
  participant C as Content owner
  participant E as Evidence owner
  participant P as Projection owners
  O->>C: report defective revision
  C->>C: validate and quarantine
  C-->>E: correction request with revision/scope
  E->>E: append not-counted/partial correction
  E-->>P: corrected source cut
  P->>P: recompute capability/mistake/progression/readiness
  P-->>O: audited completion and safe explanation
~~~

Evaluator corrections and blueprint changes use the same owner-routed pattern.

## 12. Failure, recovery, and uncertainty

| Situation | Owner/outcome | Recovery |
|---|---|---|
| Network loss mid-Writing | Attempt keeps checkpoint/timer facts; validity reflects integrity maintained | resume draft; no failed score; unrelated work continues |
| Audio load/playback failure | Attempt records fault; Evidence not_counted or partial | replace media/non-listening alternative; no penalty |
| Mic denied/silent/wrong | Attempt preflight/capture; no supported oral observation | text/prerecorded rehearsal with narrower claim |
| Mock paused/backgrounded/stopped | Attempt interruption; Measurement verdict; Evidence keeps defensible units | practice/restart; no silent clean claim |
| Evaluator slow/out/uncertain | Evaluation bounded Pending, max one justified escalation | deterministic feedback/unrelated coaching; dependent Readiness absent |
| Content defect/right loss | Content quarantine; Evidence scoped correction | another approved item; recompute without penalty |
| Fresh P4/retry exhausted | Content unavailable role/family | lower-claim useful work; transfer/readiness Pending |
| Unsupported browser | capability preflight narrows dependent activity | equivalent alternative or narrower claim |
| Accessibility adaptation | declaration + actual adaptation + equivalence policy | never failure; standard P4 only if verified equivalent |
| Return after absence | Evidence history + freshness; Review collapses/reranks | smallest decision-relevant recheck, no debt/reset |
| Blueprint/bundle incompatible | Publication/Measurement quarantine affected target semantics | last compatible for ordinary work; suspend stale target claims only |
| Duplicate submission | Attempt idempotency accepts one fact | prior result/explicit conflict; no duplicate independence |

Pending always bears scope. App/content/media/access/browser/evaluator failure never becomes learner failure and cannot silently grant target conditions.

## 13. Security, privacy, rights, and accessibility

| Boundary | Domain rule | Later owner |
|---|---|---|
| Profile/evidence | authorize to App learner scope; anonymous/account share semantics; no Corpus learner export | 05, 12, 20, 23 |
| Responses/evaluation | minimum-purpose, pseudonymous refs, no unrelated history/default provider training | 17–19, 23 |
| Raw audio | contextual capture; delete after accepted/terminal result and within seven days; exclude logs/backups | 18, 23, 26 |
| Content/media rights | obligations travel with revision; byte existence is not serving right; scoped takedown correction | 09, 10, 16, 23 |
| Access/accommodation | declaration separate from actual condition; equivalent support preserves, changed capability narrows | 13, 14, 21, 23, 25 |
| Data rights | explicit idempotent export/delete; owners act; completion audited | 20, 23, 26 |
| Telemetry | no raw response/audio/secrets; minimum identifiers; no semantic write path | 23, 24, 26 |

No legal-compliance claim is made. Public/commercial operation requires jurisdiction-specific owner/legal review.

WCAG 2.2 AA remains a release gate. Capability/accommodation facts in domain contracts prevent alternative paths from silently changing evidence. Labels/chart/status meaning require equivalent text; color/animation never owns meaning.

## 14. Operations, validation, performance, and cost

| Evidence/test | Purpose | Owner/response |
|---|---|---|
| Ownership/dependency architecture test | prevent cross-context writes/framework leakage/cycles | Stage 25; violation blocks release |
| Exhaustive state-machine tests | cover 5 validity, 7 weakness resting, P0–P4, 6 readiness | owners/25; unknown state blocks |
| Golden observation → projection fixtures | deterministic derived state and independent gates | 05–08, 11, 25; version/rollback on drift |
| Correction/rebuild test | remove only affected influence, preserve history | 05, 09, 11, 25 |
| ACL substitution contracts | prevent foreign authority | 10, 12, 17–19, 25 |
| Idempotency/concurrency/recovery | no duplicate evidence/lost checkpoint | 05, 12, 21, 25 |
| Accessibility-equivalence matrix | equivalent or explicitly narrower claim | 14, 21, 25 |
| Pending/correction/projection age | detect stuck/stale conclusions | 24/26 set SLO; replay/swap/degrade locally |
| Rights incident/audio deletion proof | fairness/privacy/rights | 23–26 quarantine/disable/audit |
| Cost per useful productive evidence | cost chooses only equivalent quality | 19/24/26; cheaper/Pending fallback |

- Contexts remain in-process deterministic modules. No service, event platform, extra DB, Kubernetes, warehouse, or multi-region is added.
- PostgreSQL remains accepted future authority/job substrate, but this stage selects no tables. Plain append facts plus projections are preferred over event-stream infrastructure.
- Routine scoring/capability/mistake/review/progression/coaching/readiness/gates/explanations are deterministic/versioned; content is approved/cached; no per-click AI.
- Productive AI: one structured call, at most one justified escalation; fixed/cached/deterministic/Pending fallback. Exit through evaluation port + request/result fixtures + benchmark corpus.
- Corpus is asynchronous; last compatible bundle + verified blueprint + seed is fallback. Transport changes behind ACL.
- Cost cannot remove Writing/Oral evidence, accessibility, recovery, or truth.

**Upgrade/split triggers:** sustained DB/queue contention after indexing/throttling; distinct processor security/retention boundary; independently scaling media/evaluation; seven consecutive days oldest-job SLO miss; demonstrated ownership/release blockage; or three months above a Stage-26 owner-approved cost threshold. Before topology growth, batch/cache/throttle/disable optional work, replace adapter, or narrow only dependent claims.

## 15. Traceability and handoff

| Decisions | Primary sources | Consumers |
|---|---|---|
| D01/D02 contexts/ownership/facts | final §§5–7, 10–16, 19; app/04 §§3–4; Arch 01 §§3–5; Arch 02 §§3/8 | 05–13, 15–28 |
| D03 shared foundation | final §§1, 6–8; app/07 §§3–10; design §§3–4 | 05–09, 12–19, 21, 25 |
| D04 validity/failure | final §§5, 16, 19; design §§3.1–3.2/3.7 | 05–08, 11–14, 17–25 |
| D05 Mistake/Review | final §§5.2/9; app/05 §§3–4; design §3.5 | 05–08, 11, 13, 24, 25 |
| D06 progression/readiness | final §§5/7/10–11; app/08 §§3–9; app/15 §§4–11; app/17 §§3–4 | 05–08, 11–13, 24–28 |
| D07 ACL/content/Corpus | final §§14/18; app/21 §§3–4; app/22 §10; Arch 02 §§5–8 | 09, 10, 12, 16–19, 23–26 |
| D08 version/correction | final §§5/10/14/19–20.5; app/04 §§4.13–4.20; Arch 01 §5 | 05, 09–12, 19, 23–28 |
| D09/D10 access/privacy/recovery/ops | final §§15–19; design §§3.6–3.7/6; Arch 01 §§6–9; Arch 03 §§9–10 | 05, 12–14, 17–26 |

### 15.1 Must preserve

1. Eleven contexts and the ownership table are authority boundaries; storage/API convenience cannot merge them.
2. Facts are append-oriented; corrections explicit; projections rebuildable with source/rules lineage.
3. Five skills share attempt/evidence/recovery with explicit modality extensions.
4. Validity, correctness, attempt execution, mock verdict, and evaluator job status stay separate.
5. Preserve five validity states, six readiness states, complete Mistake lifecycle, canonical loop, and local P0–P4.
6. Written/Oral independent; missing absent; Safe not Ready; probability prohibited until empirical gate.
7. Corpus/provider/UI schemas are inputs/projections. Corpus receives no learner profile and is not routine runtime.
8. Learner controls choice; system controls evidence truth. Access/failure is never learner failure.
9. Policies remain deterministic/in-process until measured triggers justify complexity.

### 15.2 Dependencies

Introduced dependencies are only the logical arrows in §4 and published contracts in §10. No library, service, provider, database, repository, or deployment dependency is introduced. Direct UI → semantic state, provider → Evidence/Readiness, Corpus → learner runtime, derived-context → Evidence mutation, and Operations → shared-row mutation are prohibited.

## 16. ADRs

- ADR-0010 — Bounded contexts and single state ownership, **Accepted**.
- ADR-0011 — Shared five-skill foundation with modality extensions, **Accepted**.
- ADR-0001–0009 remain Accepted and unmodified. ADR-0010 refines ADR-0001/4/5; ADR-0011 refines ADR-0002.

## 17. Risks and validation

| Risk/assumption | Evidence | Owner/fallback |
|---|---|---|
| Seams too fine/cyclic | dependency test + use-case traces | 05–12/25; superseding owner decision, never shared writes |
| Rebuild too slow | full/scoped correction benchmark | 05/24; incremental materialization before infrastructure |
| Modality contracts drift | cross-skill + modality fixtures | 08, 12–18/25; strengthen kernel without erasing modality |
| Evaluator confidence uncalibrated | German B1 human agreement/repeatability/bias/drift/cost | 17–19/24; Pending/narrow/replace adapter |
| Accommodation equivalence unknown | task-specific expert/learner/official evidence | 14/23/25; record changed condition/narrow claim |
| Correction scope wrong | seeded defect/rights/blueprint tests | 05, 09–11/25; conservative quarantine/audit |
| Account adoption duplicates facts | link/merge/conflict/delete/export tests | 20/23; keep scopes separate until safe merge |
| Six states conflated with four bands | exhaustive reason fixtures | 11–13/25; lossy mapping blocks release |

## 18. Intentionally deferred implementation choices

| Choice | Boundary fixed | Future owner |
|---|---|---|
| Tables/keys/transactions/partitions/retention/materialization | one owner; append/correction lineage; rebuildable | 05 |
| Graph aggregation/calibration coefficients | direct lane/conditions, bounded impact, versioned | 06–07; validate 24 |
| Use-case transactions/orchestration | legal dependencies and owner commands | 08, 12 |
| API/job transport/schema/cache | exhaustive states/idempotency/version/unknown-major | 12 |
| UI composition/responsive presentation | projection only; semantics and accessible text survive | 13–14 |
| Media/evaluator/STT/TTS/partner providers | minimum payload, candidate, one escalation, Pending, audio deletion, exit | 16–19 |
| Identity/local DB/link/merge/sync | App learner scope, optional account, no overwrite | 20–21/23 |
| Security controls/jurisdiction/retention | least privilege, purpose, rights, audited data rights | 23 + owner/legal |
| Telemetry/SLO/release tooling/physical split | §14 measures/invariants | 24–26 |

No feature implementer may change settled owners or product semantics through a deferred choice.

## 19. Decisions and owner questions

ARCH-S04-D01 through D10 are Accepted. No owner question remains. Empirical thresholds use shaped launch defaults as versioned calibration records and are reviewed with evidence.

## 20. Definition of done

- [x] Required sources, commits, and blobs recorded; Stages 01–03 reconciled.
- [x] Authority/Stage-27 precedence and naming differences resolved without source edits.
- [x] Ubiquitous language and every required context defined.
- [x] Consequential states, aggregates, policies, commands, services, and projections have one owner.
- [x] Shared five-skill foundation and modality extensions are explicit.
- [x] Dependency rules and Corpus/provider/UI ACLs are explicit.
- [x] Five validity, six readiness, complete Mistake lifecycle, canonical loop, P0–P4 locality, control boundary preserved.
- [x] Alternatives, rationale, versions, security/privacy/rights/accessibility, failure, operations, cost, fallback/exit, triggers documented.
- [x] Required context, ownership, glossary, responsibility, and dependency views exist.
- [x] ADR-0010/0011 Accepted; earlier ADRs unchanged.
- [x] Dependencies, risks, validation, downstream rules, and named deferrals handed off.
- [x] No production code/schema/scaffold/config, shaping/design, or later-stage artifact changed.

**Stage 04 result:** Accepted with no owner blocker. Stage 05 can choose persistence without inventing product truth.
