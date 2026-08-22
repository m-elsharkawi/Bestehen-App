# Bestehen / App Architecture Decision Records

This directory is the live index for consequential, durable architecture choices. Full analysis remains in the owning stage document; each ADR is a compact historical decision record.

## Convention

- Filename: `ADR-NNNN-kebab-case-title.md`; choose the next unused zero-padded number. `ADR-template.md` is the sole exception.
- Status: `Proposed`, `Accepted`, `Superseded`, or `Deprecated`.
- Create an ADR only when alternatives are meaningful and the result has durable cross-stage coupling.
- Never delete or renumber a published ADR. A reversal creates a new ADR and marks the old record `Superseded by ADR-NNNN`.
- An index entry is added or status-updated in the same commit as the ADR. Record owner stage, decision IDs, review trigger and supersession.
- A later stage may amend continuity facts only with an explicit reason. Stage 28 publishes the consolidated index/status.

## Index

| ADR | Title | Status | Owner | Architecture decisions | Supersession |
|---:|---|---|---|---|---|
| [ADR-0001](ADR-0001-evidence-truth-and-explicit-uncertainty.md) | Evidence truth and explicit uncertainty | Accepted | Stage 01 | `ARCH-S01-D01`, `D03`, `D04`, `D08`, `D11` | — |
| [ADR-0002](ADR-0002-modular-low-ops-deterministic-first-posture.md) | Modular low-ops deterministic-first posture | Accepted | Stage 01 | `ARCH-S01-D02`, `D09`, `D10` | — |
| [ADR-0003](ADR-0003-quality-attributes-are-release-gates.md) | Quality attributes are release gates | Accepted | Stage 01 | `ARCH-S01-D05`, `D06`, `D07` | — |

