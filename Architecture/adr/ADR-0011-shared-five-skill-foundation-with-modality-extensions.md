# ADR-0011 — Shared five-skill foundation with modality extensions

- **Status:** Accepted
- **Date:** 2026-08-23
- **Decision owner:** Stage 04 — Domain Model and Bounded Contexts
- **Supersedes:** None
- **Refines:** ADR-0002

## Context

Reading, Language Elements, Listening, Writing, and Speaking share the canonical loop and must use consistent evidence, validity, recovery, repair, and Readiness semantics. Five stacks would drift. A universal question engine would erase playback, draft, rubric, audio-turn, and interaction meaning and permit indirect evidence substitution.

## Decision

Use one shared Session/Attempt/Evidence/Repair foundation for identity, content/version lineage, actual conditions, validity/scope, independence, checkpoint/recovery, correction, and observation acceptance. Extend it explicitly for Reading/Language Elements response structures; Listening media/playback/transcript facts; Writing drafts/final text/content points/rubrics; and Speaking equipment/audio/turn/interaction/preparation/restart/partner/rubrics.

Writing and Speaking share a productive-evaluation port but retain separate task/rubric semantics. Speaking production and interaction remain separate direct lanes. UI and provider schemas remain projections/inputs.

## Alternatives

1. **Five vertical stacks:** quick isolated prototypes, but duplicate state machines and drift on evidence/failure/accessibility.
2. **Fully generic workflow/question engine:** high reuse, but modality truth becomes flags and productive/interaction evidence is obscured.
3. **Chosen — shared semantic kernel with typed extensions:** reuses invariants while preserving each modality’s tested conditions.

## Consequences

- Every skill uses the same five validity states, labels, loop/recovery, and correction semantics.
- No modality infers another modality’s mastery; productive and interaction claims need direct evidence.
- Accessibility support is an actual condition: equivalent access preserves the claim; changed capability narrows it.
- Modality providers remain replaceable. Cached/fixed/deterministic practice or Pending is fallback.
- The kernel stays pure/in-process. Review only when a modality repeatedly requires unsafe generic escape fields or breaks shared invariants.

## Validation and review trigger

Validate with one cross-skill contract suite plus modality fixtures for playback, Writing checkpoint/evaluation, Speaking production/interaction, system-fault invalidation, and accessible equivalence. Review repeated semantic conditionals/unsafe casts, not different UI/input shapes.

## Traceability

- ARCH-S04-D03, D09
- Architecture/04-domain-model-and-bounded-contexts.md §§7–9, 13–15
- Final specification §§5–8, 10, 16, 19; app/04 §§3–4; app/07 §§3–10; app/08 §§3–9
- Design/DESIGN-HANDOFF.md §§3–6; Architecture 01 §3.1; ADR-0002
