# ADR-0003 — Quality attributes are release gates

> **Status:** Accepted  
> **Owner:** Stage 01  
> **Date:** 2026-08-22  
> **Decision IDs:** `ARCH-S01-D05`, `ARCH-S01-D06`, `ARCH-S01-D07`  
> **Supersedes / superseded by:** None

## Context

Accessibility, evidence correctness, recovery, latency, durability, privacy, operability and cost directly change what learner evidence can mean. Treating them as later polish would let a technical/access failure masquerade as learner performance or make a pass-critical modality inaccessible.

Traceability: `app/26-platform-accessibility-nonfunctional.md` §§3–8; final product §§16, 18–19; `Design/DESIGN-HANDOFF.md` §§3.7, 6; W3C WCAG 2.2 (accessed 2026-08-22); Stage 01 §6.

## Decision

The measurable quality-attribute scenarios and budgets in Stage 01 §6 are release criteria. Core flows target WCAG 2.2 AA and equivalent-evidence alternative interaction paths. Failure is assigned to the smallest affected non-learner scope, preserves work, blocks only dependent conclusions and keeps unrelated coaching available. A budget miss produces an explicit degraded/Pending state or blocks release; it never authorizes hidden state or a guessed result.

No enterprise uptime SLA is introduced. The gates are proportionate, evidence-focused launch defaults and are versioned/reviewed from measured evidence.

## Alternatives

1. **Best-effort non-functional goals.** Easy to write, impossible to verify and unsafe for learner claims.
2. **Retrofit accessibility/recovery after feature completion.** Creates divergent paths and likely changes evidence semantics late.
3. **Enterprise SLA and redundant topology now.** Expensive and does not substitute for correct local failure semantics.

## Consequences

Stages 14, 21, 23 and 24 must produce capability, recovery, privacy and measurement evidence. Stage 25 converts every scenario into automated/manual gates; Stage 26 requires release/rollback evidence. Cost may choose between equivalent options but cannot relax evidence truth, accessibility or pass-critical recovery.

## Validation and review trigger

Review budgets when measured supported-device performance, accessibility audits, fault drills, incidents or cost data show they are either insufficient to protect learner truth or materially stricter than necessary. Any change is versioned with evidence and rollback; stable truth/fairness rules cannot be relaxed by calibration.

