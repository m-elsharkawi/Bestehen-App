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
| [ADR-0004](ADR-0004-app-runtime-independent-from-corpus.md) | App runtime independent from Corpus | Accepted | Stage 02 | `ARCH-S02-D01`, `D02`, `D07` | — |
| [ADR-0005](ADR-0005-app-semantic-authority-across-processors.md) | App semantic authority across processors | Accepted | Stage 02 | `ARCH-S02-D03`, `D04`, `D08`, `D09`, `D10` | — |
| [ADR-0006](ADR-0006-typescript-nextjs-modular-monorepo.md) | TypeScript Next.js modular monorepo | Accepted | Stage 03 | `ARCH-S03-D01`, `D06`, `D07`, `D08` | — |
| [ADR-0007](ADR-0007-postgresql-authority-and-durable-jobs.md) | PostgreSQL authority and durable jobs | Accepted | Stage 03 | `ARCH-S03-D02`, `D03` | — |
| [ADR-0008](ADR-0008-render-single-region-managed-deployment.md) | Render single-region managed deployment | Accepted | Stage 03 | `ARCH-S03-D05` | — |
| [ADR-0009](ADR-0009-private-eu-s3-compatible-object-storage.md) | Private EU S3-compatible object storage | Accepted | Stage 03 | `ARCH-S03-D04` | — |
| [ADR-0010](ADR-0010-bounded-contexts-and-single-state-ownership.md) | Bounded contexts and single state ownership | Accepted | Stage 04 | `ARCH-S04-D01`, `D02`, `D04`–`D08`, `D10` | — |
| [ADR-0011](ADR-0011-shared-five-skill-foundation-with-modality-extensions.md) | Shared five-skill foundation with modality extensions | Accepted | Stage 04 | `ARCH-S04-D03`, `D09` | — |
| [ADR-0012](ADR-0012-append-oriented-relational-truth-and-bounded-persistence.md) | Append-oriented relational truth and bounded persistence | Accepted | Stage 05 | `ARCH-S05-D01`–`D10` | — |
| [ADR-0013](ADR-0013-immutable-evidence-envelope-and-append-audited-validity.md) | Immutable evidence envelope and append-audited validity | Accepted | Stage 06 | `ARCH-S06-D01`–`D10` | — |
| [ADR-0014](ADR-0014-deterministic-learner-projections-and-capability-obligations.md) | Deterministic learner projections and capability obligations | Accepted | Stage 07 | `ARCH-S07-D01`–`D10` | — |
