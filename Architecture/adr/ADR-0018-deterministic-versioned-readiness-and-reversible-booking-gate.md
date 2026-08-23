# ADR-0018: Deterministic versioned Readiness and reversible booking gate

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Architecture Stage 11 — Readiness, Scoring, Mocks, and Ready-to-Book
- **Decision IDs:** `ARCH-S11-D01`–`ARCH-S11-D10`
- **Supersedes:** None
- **Superseded by:** None

## Context

TELC Deutsch B1 has separate official Written and Oral pass gates: 135/225 and 45/75, each 60%. Bestehen adds a versioned launch Safe default of 65 plus lower-range, breadth, confidence, currentness and contradiction rules. Written and Oral cannot compensate. The learner model contains broader coaching evidence, but a numeric target estimate may use only current, direct, target-mappable, independently occasioned E3/E4 evidence. Missing evidence is absence, not zero.

Readiness, mock results and booking advice are consequential, correction-sensitive claims. They must remain reproducible across content defects, evaluator correction, evidence staleness, contradiction and target-blueprint change. One mock is correlated, partial/Pending scope must remain honest, and post-mock repair cannot rewrite an original result. Safe is a band; Ready to Book is a reversible Gates A–F action recommendation, not a higher score. Before independent empirical calibration, pass probability would be decorative precision.

## Decision

1. The Measurement: Readiness & Mocks context is the single owner of deterministic, rebuildable Readiness, mock and booking projections over immutable attempt/mock facts and accepted Evidence. UI, providers and consumers cannot calculate or relabel them.
2. Official target blueprints and Bestehen calibration releases are independent, immutable, privileged, audited version axes. Blueprint stores official units/points/gates/mechanics/source verification. Calibration stores 65 Safe policy, recency/evaluation weights, range floors, confidence/breadth/currentness and empirical provenance/effective date/validation/rollback.
3. Eligibility begins at the independent episode/occasion, never raw clicks. Only valid current direct B1 target-mappable unassisted E3/E4 evidence with adequate evaluator quality sets an official-unit estimate. `partially_valid` contributes only named unaffected scope; Pending/interrupted/not-counted contributes no negative score.
4. Eligible observations produce unit weighted means and conservative planning ranges, then official-weighted sections and independent Written/Oral components. `Readiness Index = min(Written target %, Oral target %)`. Total 300-point score, five-skill average and strong opposite component cannot compensate.
5. The client contract is exactly `evidence_building`, `not_ready`, `borderline`, `safe`, `ready_to_book`, or `stale_contradicted`, each with exhaustive structured reasons, lineage and smallest clarifier. Missing numeric fields are absent/null, never zero.
6. Mock specifications pin scope, form families/revisions, blueprint, rules, conditions and result promise. One mock is one correlated occasion. Original responses, conditions and result history are immutable. Partial/modified/Pending evidence remains scoped; technical/content/media/access/browser/network/partner/evaluator failure never becomes learner failure. There is no extra mock multiplier.
7. Ready to Book is a reversible conjunction of all Stage-17 Gates A–F: current valid target; both components Safe; full decision-grade breadth; one clean full-mock pass within 14 days; independent additional Written and Oral confirmations within 30 days; and Medium+ overall confidence with no decisive contradiction/Pending/accommodation uncertainty. Every granular blocker is returned; no hidden booking score exists.
8. Corrections, defects, evaluator changes, age boundaries, contradictions, blueprint changes and calibration releases append impacts and enqueue idempotent affected-scope shadow recomputation from a source cut. Validated generations publish atomically; the last validated unaffected projection and immutable material snapshots remain.
9. All empirical parameters carry provenance, effective date, validation evidence, monitoring, approval and rollback. Launch schemas/events/copy/analytics forbid pass-probability semantics. A later probability capability requires the shaped minimum matched/boundary outcomes, held-out/later validation, independent Written/Oral and empirical joint calibration, privacy/fairness review, product approval, a superseding ADR and contract major.
10. All final scoring/readiness/gating is deterministic and provider-neutral. AI may emit bounded structured productive-evaluation candidates, but never computes the final claim or recurring summary. Corpus remains asynchronous and receives no learner state.

## Consequences

### Positive

- Official exam truth and Bestehen safety policy cannot be silently conflated.
- Every current and historical claim is reproducible from source cut and independently versioned blueprint, calibration, rules, content and evaluator lineage.
- Written/Oral independence, absent evidence, partial validity, uncertainty and booking blockers stay visible across every client.
- Scoped correction preserves unaffected evidence and milestone history while retracting unsafe current advice.
- Normal reads use cached projections; scoring/gating adds no per-view AI/Corpus cost.
- Providers and evaluators can be replaced without rewriting accepted learner history.

### Negative / trade-offs

- Typed release governance, source-cut projection generations, reason taxonomies and shadow replay add discipline and storage.
- A conservative model withholds numbers/advice more often than an activity score.
- Fresh P4/form-family inventory and independent confirmation may temporarily prevent Ready-to-Book.
- Productive Pending can delay a dependent component/full-mock conclusion.
- Calibration remains heuristic until sufficient matched real outcomes exist.

## Alternatives considered

1. **Calculate in each screen/client.** Initially simple, but creates divergent formulas, stale-client certainty and no trusted audit. Rejected.
2. **One mutable learner readiness row.** Cheap reads but corrections/versions cannot be reproduced and history can be overwritten. Rejected for immutable facts plus versioned projections/snapshots.
3. **300-point total or equal five-skill average.** Familiar but violates separate official pass gates and blueprint weights. Rejected.
4. **Full mocks only.** Simple evidence rule but discards valid distributed direct E4 evidence, spends scarce forms/evaluation and overweights fatigue rituals. Rejected.
5. **Treat every mock item as independent or add a pass bonus.** Artificially narrows uncertainty. Rejected for one correlated occasion and normal evidence weighting.
6. **Safe equals Ready, or two passing mocks alone.** Simple advice but drops breadth/currentness/confidence/contradiction and Gate composition. Rejected for Gates A–F.
7. **Mutable original mock result after repair/evaluator change.** Produces a pleasant latest card but destroys occurrence truth. Rejected for append interpretation and new retry evidence.
8. **AI-calculated readiness/probability at launch.** Flexible prose but costly, nondeterministic and empirically unsupported. Rejected for deterministic index/ranges and a structural probability gate.
9. **Full replay on every change.** Correct but unnecessarily broad/expensive. Retained as fallback when exact affected scope cannot be proven; targeted idempotent recompute is default.

## Compatibility, fallback, and exit

- Additive optional reason/detail fields require server safe fallback text. Unknown state, gate, official unit, lineage requirement or consequential contract major fails closed; clients never guess “latest.”
- Last validated projection may remain visibly stale/rebuilding where safe. Dependent claims become Pending/absent; unaffected evidence and objective results remain.
- Index plus Written/Oral estimates, planning ranges, confidence, bands and reasons is the permanent fallback if probability never satisfies its empirical gate.
- PostgreSQL facts/releases/snapshots and deterministic rules are portable. Projection replay provides process/provider exit; evaluator exit uses structured candidate/benchmark lineage and a fresh sample when deleted inputs prevent reevaluation.
- A separate service, warehouse or calibration platform requires measured workload, isolation or analysis evidence after ordinary indexing/coalescing/export is insufficient.

## Security, privacy, rights, accessibility, and cost

Privileged blueprint/calibration/impact activation is least-privilege and audited; direct semantic table edits are forbidden. Learner-scoped authorization protects projections/history. Logs exclude responses/raw audio/profile; raw audio remains ephemeral. Rights-only withdrawal blocks serving/exporting bytes but is not negative learner evidence. Corpus receives no learner data.

Every chart/band/range/gate/mock comparison has a complete textual alternative with official and Bestehen meanings, Written/Oral values, currentness, all reasons/gates and next evidence. Evidence-equivalent non-answer-bearing accommodations remain eligible; unresolved equivalence blocks only the target-condition claim without penalty.

Costs are ordinary database/worker/snapshot use plus bounded productive evaluation. There is no recurring AI readiness/gate/summary call, stream platform, rules SaaS or warehouse. Cheaper safe fallback is coalesced background work, deterministic results, one justified evaluator escalation and a fresh sample—not removing pass-critical Writing/Oral or accessibility.

## Validation

Validate official weights/gates and target mechanics; eligibility across all five validity states and partial scope; deterministic/idempotent replay; missing-not-zero; separate Written/Oral and bottleneck; range/band/state boundaries; all Gates A–F and reversible milestones; content/evaluator/target corrections; fault zero-penalty; accessible text equivalence; learner isolation/privilege/probability deny-list; and synthetic asymmetric/sparse/old/contradictory/Pending histories. Matched real outcomes later validate Written and Oral separately, false-safe behavior, range coverage, evaluator/fairness slices and any calibration release.

## Review triggers

Review on an official target change; validated outcome evidence that 65/ranges/weights/windows are systematically unsafe or overly conservative; evaluator drift/disagreement or pass-gate flips; independent form scarcity blocking decision-grade confirmation; sustained recompute SLO/cost failure after tuning; a security/accessibility incident; or satisfaction of the full pass-probability activation gate. No review may silently introduce compensation, absence-as-zero, a mock bonus, dropped gate, provider/Corpus authority, technical-fault learner penalty, or pass probability.

## Traceability

- Stage output: `Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`
- Product authority: `app/28-bestehen-app-product-specification.md` §§10–11; `app/15-telc-readiness.md` §§3–14; `app/16-mock-exams.md` §§3–4; `app/17-ready-to-book-logic.md` §4; `app/27-end-to-end-scenario-validation.md` §§3–4
- Design: `Design/DESIGN-HANDOFF.md` §3.3; `Design/Bestehen-01-Design-System.dc.html` §§2.8, 3.3; mobile Act 4; desktop D2
- Prior architecture: Stages 04, 05, 06, 07, 09, 10; refines ADR-0001, ADR-0010, ADR-0012, ADR-0013, ADR-0014, ADR-0016, ADR-0017
- Official target references: TELC Deutsch B1 product page and official Übungstest Version 1, accessed 2026-08-23
- Downstream: Stages 12–14, 17–25, 27, 28
