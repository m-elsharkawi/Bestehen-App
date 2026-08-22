# ADR-0004 — App runtime independent from Corpus

> **Status:** Accepted
>
> **Owner:** Stage 02
>
> **Date:** 2026-08-22
>
> **Decision IDs:** `ARCH-S02-D01`, `ARCH-S02-D02`, `ARCH-S02-D07`
>
> **Supersedes / superseded by:** None

## Context

Bestehen / Corpus owns raw/reference ingestion, provenance, authenticity/confidence, rights action eligibility, deduplication, taxonomy, task-side difficulty/relevance and publication eligibility. Bestehen / App owns learner state, approved practice, coaching, evaluation interpretation, evidence and Readiness. A live Corpus lookup or shared raw store in ordinary attempts would couple availability, privacy, cost and rights internals to the learner runtime.

Current traceability: `app/28-bestehen-app-product-specification.md` §§1.1, 14; `app/21-content-strategy.md` §§3–5; `app/22-user-controls-vs-coach-autonomy.md` §10; `corpus/12-corpus-app-contract.md` §§3–4; `corpus/17-bestehen-corpus-product-specification.md` §§4.11, 6.1; Stage 02 §§3–9. Source commits/SHAs are recorded in Stage 02 §2.1.

## Decision

Corpus and App remain separate products. Corpus publishes compatible, versioned, rights-aware intelligence/impact artifacts asynchronously through an App import, validation and approval gate. App separately versions and approves every learner-playable content/media artifact. Normal learner attempts resolve only App-approved snapshots; they make no live Corpus/raw-source call and send Corpus no learner profile or response.

The App retains a named last-compatible approved snapshot. Unknown breaking contract versions, invalid bundles and withdrawn capabilities fail closed at import or only at affected use. Historical attempts keep the exact Corpus/App/version lineage active at delivery time. Rights-only removal and correctness/fairness invalidation use distinct impact classes.

## Alternatives

1. **Shared Corpus storage or live query from App.** Simplest initial integration, but exposes internals, couples availability and makes App reproduce Corpus trust/rights rules.
2. **Synchronous Corpus service per learner attempt.** Keeps intelligence fresh, but adds latency/cost/failure and invites learner-profile transfer.
3. **One static export forever.** Maximally cheap and runtime-independent, but cannot safely reconcile target, taxonomy, rights or correctness changes.

## Consequences

App and Corpus need a stable compatibility/impact contract and two auditable gates: Corpus use eligibility and App learner-artifact approval. This adds publication/version work but removes Corpus/raw sources and per-click Corpus AI from learner runtime, keeps requests cacheable, supports outages and lets each product evolve independently.

Stage 10 owns transport, integrity, bundle/cache/reconciliation and withdrawal details. Stage 09 owns App content approval. Stage 05/06 own retained lineage and affected-scope recomputation. The cheaper fallback is the last eligible compatible snapshot plus a curated App seed/broader valid activity. Exit from a transport/provider uses portable manifests, stable IDs and replayable import fixtures; the product boundary remains.

## Validation and review trigger

Stage 10/25 must prove zero Corpus/raw-source calls during normal attempts; reject unknown major versions; continue from last-compatible content during outage; and correctly process rights, correctness, taxonomy and target-currentness fixtures without over-invalidating learner evidence. Review the publication mechanism when measured staleness, withdrawal latency or operator burden prevents the shaped product outcome. Reopen the product boundary only through a separately shaped public Corpus or ownership decision.

## Traceability

- Product/design sources: Stage 02 §2.1 and paths above
- Owning stage output: `Architecture/02-system-context-and-product-boundaries.md`
- Checklist items: Stage 02 runtime/offline separation, dependency inventory, ownership, versioning, failure and cost
- Related ADRs: ADR-0001, ADR-0002, ADR-0005
