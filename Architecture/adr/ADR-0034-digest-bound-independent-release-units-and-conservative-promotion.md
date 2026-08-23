# ADR-0034: Digest-bound independent release units and conservative promotion

> **Status:** Accepted  
> **Owner:** Stage 26 — Environments, CI/CD, Release, and Operations  
> **Decision date:** 2026-08-23  
> **Decision IDs:** `ARCH-S26-D01`, `ARCH-S26-D04`–`ARCH-S26-D08`, `ARCH-S26-D10`–`ARCH-S26-D12`

## Context

Bestehen must release one responsive application, worker, PostgreSQL schema, Corpus snapshots, content/forms/media, target blueprints, prompts, evaluators, model routes and calibration without treating them as one mutable “latest” version. A rollback of deployable code cannot safely rewind database facts, provider state, rights withdrawal, deletion, queued work or historical learner evidence. The project is maintained by one owner and must remain recoverable without enterprise infrastructure or process.

Stage 03 selected native Node builds on Render Frankfurt with PostgreSQL and private R2. Stages 05, 10, 12 and 19–25 require expand/contract migrations, immutable lineage, targeted revalidation, claim-based quality gates, last-compatible rollback, deletion/restore suppression, bounded AI and WCAG 2.2 AA release evidence. Release operations must preserve exactly five validity and six Readiness states, independent Written/Oral gates, absence rather than zero, Safe distinct from Ready to Book, and the prohibition on pass probability.

## Decision

1. Use five logical environment classes: local, ephemeral CI/dev, disposable preview, on-demand production-shaped staging and isolated paid production. Lower environments use only synthetic/rights-cleared fixtures and separate sandbox credentials; production data and secrets never move down.
2. Build a portable digest-bound release manifest for an exact commit/tree/lock/tool/config/quality cut. Native Render builds remain the baseline. Production autodeploy is off; one owner manually promotes a qualified exact commit from staging under one serialized production gate. Plan-dependent GitHub approvals/attestations are optional reinforcement, not correctness dependencies.
3. Version application, schema, API/job/event contracts, Corpus snapshots, App content/forms/media, blueprints, prompts, evaluator/rubric, model/provider routes, calibration/Readiness policy, notification/tzdb/templates and quality evidence independently. An atomic environment-activation record names the compatible set and predecessor. Historical attempts and results retain their original lineage.
4. Evolve schema through backup-first single-runner expand → compatible worker/web → bounded backfill → activation → observation → later contract. Do not use destructive down migrations to undo authoritative facts. Roll forward append-only correction is the semantic default.
5. Roll back the smallest affected capability: flag/route/pointer first, then compatible web/worker deploy if needed. Rights/security/deletion deny overlays always outrank a predecessor pointer. Old/new job majors overlap through the measured queue/callback/client/rollback horizon; unknown candidates quarantine rather than become evidence.
6. Use server-owned typed, default-closed activation flags only for availability/routing/exposure. A flag cannot alter evidence, scoring, P0–P4, Written/Oral independence, Readiness, rights, retention, deletion, accessibility duty or cost gates.
7. Recover through paid Render PITR plus nightly application-encrypted logical archives outside Render, 14 daily + 12 weekly generations, quarterly alternating isolated restore drills, deletion-journal replay, provider/object/job reconciliation, RPO ≤24 hours and validated-service RTO ≤8 hours. Raw audio is absent from backups and remains subject to its ≤7-day pending ceiling.
8. Operate through existing Render/GitHub/PostgreSQL/R2/provider signals, bounded incident/release receipts, actionable email routing and concise runbooks. Add a managed observability/release/flag/queue platform, OCI artifact, persistent staging, second managed object provider or multi-region only after the explicit measured trigger and, where consequential, a superseding ADR.
9. Phase implementation only as internal vertical slices. Learner/public activation cannot present an objective-only build as a complete coach, publish unsupported P4, or show misleading Readiness. Pass-critical Writing/Oral, accessibility, recovery, rights and cost-bounded productive evidence are never waivable for convenience or spend.

## Consequences

### Positive

- A code rollback cannot silently reinterpret or erase learner history.
- Content, model, blueprint and calibration defects can be contained and revalidated at exact scope while unaffected work continues.
- Release evidence is portable even if a private GitHub/Render plan lacks a protection or attestation feature.
- Solo operation has a short deterministic promotion/restore path with no new runtime service.
- Accessibility, deletion, raw-audio, productive evidence and evidence/Readiness truth remain blocking product claims rather than operational polish.

### Costs and limitations

- Implementation must maintain a compatibility graph/activation registry and keep predecessor readers/job handlers for a measured horizon.
- Native Render builds require input/output provenance checks; a single binary is not yet promoted between environments.
- On-demand staging and manual real-device/AT/restore evidence add owner time and may slow release cadence.
- One owner remains a human availability risk; runbooks and recovery drills reduce but do not eliminate it.
- The accepted RPO/RTO are personal-project objectives, not a public SLA or legal-compliance claim.

## Alternatives considered

| Alternative | Rejected reason / future trigger |
|---|---|
| Push-to-main autodeploy and one global version | Can publish unqualified combinations and cannot express independent rollback/history |
| Full persistent dev/preview/staging fleet | Duplicates idle infrastructure and secrets before release cadence justifies it; adopt selectively after measured bottleneck |
| Mandatory OCI build-once promotion | Adds registry/container duty without current OS/build drift; adopt after reproducibility/provider-exit trigger |
| Reversible down migrations/database restore for release rollback | Risks data loss, resurrection and historical reinterpretation; restore is disaster recovery, not routine semantic rollback |
| Third-party flag/release/APM/queue platforms | Add processors, cost, control planes and exit duty without a personal-project need |
| Provider PITR only | Does not prove provider exit or deletion-journal restore safety |
| Multi-region/blue-green database | Adds semantic/operational complexity before availability/RPO evidence demands it |

## Traceability

- Full decision: `Architecture/26-environments-ci-cd-release-and-operations.md`
- Technology/deployment: `Architecture/03-technology-stack-and-repository-strategy.md`
- Persistence/restore: `Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- Corpus promotion: `Architecture/10-corpus-integration-compatibility-cache-and-rights.md`
- Contracts/jobs: `Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- AI/content/calibration/security/quality: Stages 19, 23, 24 and 25
- Product/platform: shaping `app/28-bestehen-app-product-specification.md` and `app/26-platform-accessibility-nonfunctional.md`

## Review trigger

Review when native build drift prevents digest verification; clean CI exceeds the accepted trigger; release cadence makes on-demand staging the bottleneck; multiple maintainers or regulation require separation of duties; PostgreSQL jobs harm learner transactions after tuning; PITR/log retention/RPO/RTO fails; provider/account correlation threatens recovery; or a public availability commitment requires multi-region or a different operational posture. Supersession must preserve historical release/learner lineage, deletion and rights overlays, targeted revalidation and truth gates.

## Supersession

None.
