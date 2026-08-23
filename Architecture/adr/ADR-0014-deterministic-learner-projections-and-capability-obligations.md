# ADR-0014 — Deterministic learner projections and capability obligations

> **Status:** Accepted
>
> **Owner:** Stage 07
>
> **Date:** 2026-08-23
>
> **Decision IDs:** ARCH-S07-D01–ARCH-S07-D10
> **Supersedes / superseded by:** None; refines ADR-0001, ADR-0002, ADR-0007, ADR-0010, ADR-0011, ADR-0012, and ADR-0013

## Context

Bestehen must turn accepted evidence into capability, Mistake Memory, local progression, and review while preserving direct modality, independence, conditions, validity, missing evidence, history, and independent Written/Oral risk. Immediate retry is not retention; time is not repair; Corpus relevance is not mastery. P0–P4 are local conditions, and review is a capability obligation rather than deck debt.

Stages 04–06 establish bounded owners, append-oriented PostgreSQL facts/corrections, an immutable evidence envelope, five validity states, source-cut projections, and targeted pg-boss rebuilds. Stage 07 must define the coupled learner-state projection boundary without duplicating Readiness or adding an ML/streaming/deck platform.

Current source commits/blob SHAs and full rationale are recorded in Architecture/07-learner-model-mistake-memory-progression-and-review.md §2.

## Decision

Use one deterministic, full-rebuild-equivalent projection engine over an exact accepted-evidence source cut. Evidence & Capability owns claim-scoped capability, condition facets, coverage, and ReadinessContribution. Mistake Memory owns Candidate/Historical-Unconfirmed/Known/Repairing/Stabilizing/Repaired/Resolved/Reopened and opportunity-aware recurrence. Progression owns one P0–P4 axis-vector profile per task-family/direct-lane. Review owns R0–R4 capability obligations, windows, natural satisfaction, and capped selection. Each current output is an immutable validated generation with source/checksum/version lineage.

Negative evidence affects only the directly observed supported lane. Related lanes receive verification targets; narrowly supported productive success may add reduced positive concept support, never cross-lane failure or repair. Missing stays absent. Stable history survives contradiction/staleness. P4 remains a measurement condition, not an unlock or learner level.

Use shaped structural gates and immutable versioned empirical parameter bundles. Defaults include E0–E4 weights, confidence/freshness/stability gates, two independent failure episodes for a known weakness, one-axis progression probes, and R0 same-session/R1 1–3/R2 6–9/R3 18–28/R4 45–75-day windows. Stable invariants are not tunable.

ReadinessContribution carries eligible/limited/ineligible/pending/absent claim inputs and lineage only. It never calculates overall Readiness, merges Written/Oral, emits Ready-to-Book, or contains a pass probability.

Corrections, invalidations, evaluator/content/taxonomy/blueprint/parameter changes, quarantine, takedown, and deletion select exact affected scope. The existing pg-boss worker builds a shadow generation, validates counts/invariants/checksum, and atomically publishes only if the source cut is still current. Failure retains an explicitly aged last-good state when safe; affected high-stakes conclusions fail closed.

Keep learner history entirely in App, export/delete coherently, and preserve accessibility equivalence as an explicit versioned condition. No model call runs merely to update projection, lifecycle, progression, review date, explanation, or queue order.

## Alternatives

1. **Mutable all-purpose learner summary plus wrong-answer history.** Initially smallest storage/code, but owners overwrite one another, corrections lose history, conditions collapse, and review/Readiness can drift.
2. **No scheduler/progression projection; rely on learner choice and natural repetition.** Lower implementation effort, but retention and one-axis support fading become accidental and unexplained.
3. **Generic SRS deck plus one global course/CEFR level.** Familiar, but treats content as capability, creates debt, hides uneven skills, and violates local P0–P4.
4. **Probabilistic knowledge tracing/AI scheduler with event streaming and global replay.** Potential future adaptivity, but uncalibrated, opaque, costlier, high-ops, and unnecessary for a personal project.
5. **Chosen — deterministic claim projections and capability obligations over relational evidence.** Preserves truth, explanation, correction, privacy, low operations, and provider exit.

## Consequences

- Implementations require explicit ClaimKey, condition facets, independent episode/opportunity identities, source cuts, parameter/calculation versions, reason codes, and projection generations.
- One accepted observation can update multiple defensible claims but counts once per independence occasion/component rollup.
- A same-session retry records responsiveness; only delayed fresh direct evidence can establish retention.
- Reopened preserves earlier progress and current recurrence. Time changes freshness/due status only.
- Natural stronger direct practice can satisfy review and avoid duplicate drills; inactivity creates no negative event or backlog debt.
- P0–P4 remains uneven across task families/lanes and changes one primary axis per normal probe.
- Readiness receives traceable inputs while retaining sole authority for Written/Oral gates and Safe/booking.
- Parameter tuning costs shadow rebuild/calibration work but is reversible without fact mutation.
- Existing PostgreSQL/pg-boss resources are sufficient; no new vendor, AI call, warehouse, streaming platform, or permanent raw media is introduced.
- Learner deletion removes facts and every derived generation/obligation; append audit does not override deletion.

## Validation and review trigger

Stages 24–25 must prove deterministic checksums, idempotent retry/redelivery, legal lifecycle transitions, same-session non-retention, direct-lane non-transfer, time-only freshness, natural satisfaction matching, one-axis isolation, complete affected/zero-unaffected correction, version rollback, accessibility equivalence, export/deletion, and repository/schema/API/event/template/copy absence of pass probability.

Shadow-report false weakness promotion, delayed transfer/retention, assistance-dependence accuracy, review usefulness, projection latency/backlog/cost, and Written/Oral separation with raw counts.

Review only when a structural invariant changes through a superseding product decision, measured false diagnosis/scheduling materially harms retained transfer, targeted rebuild cannot satisfy correctness or exceeds the decision window for seven consecutive days after ordinary optimization, or calibrated longitudinal evidence demonstrates a simpler or more accurate replacement. Any successor must preserve fact ownership, directness, conditions, missing-as-absence, five validity states, independent Written/Oral, history, correction, deletion, deterministic fallback, and the probability prohibition.

## Traceability

- Architecture/07-learner-model-mistake-memory-progression-and-review.md
- app/28-bestehen-app-product-specification.md §§5, 7, 9, 19
- app/04-learner-model.md §§3.3–4.19
- app/05-mistake-memory.md §§4.5–4.15
- app/06-daily-coaching-engine.md §§3–4
- app/08-a1-to-b1-progression.md §§3–10
- app/14-review-and-spaced-repetition.md §§3–14
- app/20-progress-and-motivation.md; app/24-analytics-and-success-metrics.md
- Design/DESIGN-HANDOFF.md §3.4–3.5; Design/Bestehen-01-Design-System.dc.html §3.4 and weakness models; Design/Bestehen-02-Mobile-Screens.dc.html return/weakness/review surfaces
- Architecture/04-domain-model-and-bounded-contexts.md; Architecture/05-data-ownership-persistence-and-schema-evolution.md; Architecture/06-evidence-ledger-validity-versioning-and-audit.md
- Related ADRs: ADR-0001, ADR-0002, ADR-0007, ADR-0010, ADR-0011, ADR-0012, ADR-0013
