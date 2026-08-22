# ADR-0001 — Evidence truth and explicit uncertainty

> **Status:** Accepted  
> **Owner:** Stage 01  
> **Date:** 2026-08-22  
> **Decision IDs:** `ARCH-S01-D01`, `ARCH-S01-D03`, `ARCH-S01-D04`, `ARCH-S01-D08`, `ARCH-S01-D11`  
> **Supersedes / superseded by:** None

## Context

Bestehen makes consequential learner claims from direct evidence while TELC B1 requires independent Written and Oral pass gates. Conditions, missing evidence, technical faults, corrections and changing blueprints must remain explainable. Storing only a current score or letting each feature infer validity would make historical correction and honest uncertainty impossible.

Traceability: `app/28-bestehen-app-product-specification.md` §§2.1, 5, 10–11, 15–16, 19; `app/27-end-to-end-scenario-validation.md` §4; `Design/DESIGN-HANDOFF.md` §3; Stage 01 §§3–8.

## Decision

Evidence truth and Stage 27 precedence are non-overridable. Authoritative observations/corrections are append-oriented logical facts with explicit modality, conditions, validity, affected scope and version lineage. Learner/Mistake/Readiness values are reproducible versioned projections. Client contracts use the five evidence-validity and six Readiness discriminated states; missing is absence, not zero. Written and Oral never compensate. No pass-probability field/model/event/copy exists before an independently calibrated product gate permits it.

Privacy, rights and minimum-purpose provider handling are part of evidence integrity. Empirical numbers are typed, versioned calibration records with provenance/effective date/validation/rollback; stable product rules are not configuration.

## Alternatives

1. **Store only current aggregates.** Simpler, but cannot audit, target recalculation or distinguish a system correction from learner regression.
2. **Let each feature/UI infer state.** Initially flexible, but produces drift and allows missing/pending/system faults to become scores.
3. **Use a full event-stream platform.** Could retain history, but adds unnecessary personal-project operational cost. Append-oriented semantics do not require enterprise streaming infrastructure.

## Consequences

Stages 04–12 must define one authoritative owner per fact/projection and compatibility. Corrections retain history and change only affected scope. Unknown consequential contract versions fail closed. Provider results are structured versioned inputs, not system truth. The architecture costs more modeling effort but prevents misleading pass claims and preserves provider/storage exits.

## Validation and review trigger

Stage 06/11 golden fixtures must reproduce projections, prove independent gates and audit corrections; Stage 25 gates schema/API/copy against probability and missing-as-zero. Review only after a superseding product decision or evidence that the model cannot represent a required direct condition without loss.

