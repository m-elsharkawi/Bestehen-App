# Bestehen / App — Live Architecture Checklist

> **Status:** Architecture not yet shaped; every stage starts unchecked  
> **Workflow plan:** `Architecture/00-architecture-shaping-plan.md`  
> **Executable prompts:** `prompts/architecture/01_*.txt` through `28_*.txt`  
> **Rule:** A checkbox is evidence that the decision is documented, not that implementation code exists.

## How every architecture agent uses this checklist

1. Fetch the current checklist and all required sources from GitHub `main`; record current SHAs/commit refs in the stage output.
2. Inspect every checkbox in the owned stage before work. Update items sequentially only after the decision is documented.
3. Do not edit `m-elsharkawi/Bestehen-Shaping` or any file under `Bestehen-App/Design/`.
4. Leave a true later-stage/implementation deferral unchecked with a precise note. Leave an owner blocker unchecked with `Blocked — owner decision required:` and one exact question plus a recommended default.
5. Re-fetch the checklist immediately before the final update; avoid unrelated stage changes unless a documented cross-stage correction is necessary.
6. Architecture stages do not write production code. Pseudotypes, state tables, contract examples, and Mermaid diagrams are allowed only to make decisions unambiguous.

## 01. Architecture Charter and Quality Attributes

**Required prior stages:** None  
**Prompt:** `prompts/architecture/01_define_architecture_charter_and_quality_attributes.txt`  
**Output:** `Architecture/01-architecture-charter-and-quality-attributes.md`  
**Major downstream consumers:** All stages; Stage 25 turns the quality attributes into gates and Stage 28 consolidates them.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/01_Bestehen_Product_Overview.md`
- `m-elsharkawi/Bestehen-Shaping/02_Bestehen_Identity.md`
- `m-elsharkawi/Bestehen-Shaping/app/01-product-thesis.md`
- `m-elsharkawi/Bestehen-Shaping/app/25-business-model-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-Shaping/app/27-end-to-end-scenario-validation.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html §§0–1 and §3`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html #h`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Translate product and design invariants into binding architecture principles and forbidden shortcuts.
- [x] Define measurable quality-attribute scenarios and initial budgets for evidence correctness, accessibility, latency, durability, recovery, privacy, operability, and cost.
- [x] Define the decision method: evidence required, alternatives, recommendation, consequence, review trigger, and how an empirical default remains tunable.
- [x] Define lightweight ADR statuses, filename/template rules, ownership, supersession, and index maintenance under `Architecture/adr/`.
- [x] State personal/private-project constraints, expected operating posture, and triggers that justify added complexity.
- [x] Create the architecture assumption/risk vocabulary and identify shortcuts that are categorically forbidden.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Define spend categories, measurement expectations, and complexity/upgrade triggers without inventing a euro budget.
- [x] Security/privacy/rights — Set privacy-by-default, least-privilege, secrets, and threat-model expectations.
- [x] Accessibility — Make WCAG 2.2 AA and identical-evidence alternative input paths release criteria.
- [x] Failure/recovery — Require named failure ownership and non-learner invalidation for system/content/media/evaluator faults.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Quality-attribute scenario table with stimulus, environment, response, measure, evidence, and test owner.
- [x] Include Architecture principles/forbidden-shortcuts table.
- [x] Include ADR template and ADR index rules (supporting files allowed).
- [x] Include Initial risk and assumption register.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/01-architecture-charter-and-quality-attributes.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Validity and fairness outrank convenience and cost.
- The architecture must remain a modular, low-ops responsive web system unless later evidence justifies more.
- Do not reopen: TELC B1 as launch target.
- Do not reopen: responsive web as launch product.
- Do not reopen: account-optional first use.
- Do not reopen: independent Written/Oral pass truth.
- Do not reopen: bounded AI and deterministic-first behavior.

**Done when:** Every Stage 01 owned decision is traceable and unambiguous in `Architecture/01-architecture-charter-and-quality-attributes.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 02. System Context and Product Boundaries

**Required prior stages:** 01  
**Prompt:** `prompts/architecture/02_define_system_context_and_product_boundaries.txt`  
**Output:** `Architecture/02-system-context-and-product-boundaries.md`  
**Major downstream consumers:** Stages 03–05, 09–12, 20, 23, 26–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/01_Bestehen_Product_Overview.md`
- `m-elsharkawi/Bestehen-Shaping/app/01-product-thesis.md`
- `m-elsharkawi/Bestehen-Shaping/app/02-complete-learner-journey.md`
- `m-elsharkawi/Bestehen-Shaping/app/19-information-architecture-and-core-screens.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/22-user-controls-vs-coach-autonomy.md`
- `m-elsharkawi/Bestehen-Shaping/app/25-business-model-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/12-corpus-app-contract.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/17-bestehen-corpus-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html Flows A–G`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §§1, 3.7, 9`
- `m-elsharkawi/Bestehen-App/Architecture/01-architecture-charter-and-quality-attributes.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Identify learner, owner/operator, optional tester, browser/device, App, Corpus, model/media providers, notification transport, identity provider, and hosting/data services as actors or systems.
- [x] Draw C4-style context and trust boundaries for learner runtime, offline authoring/publication, operator actions, and third-party processors.
- [x] Separate runtime dependencies from asynchronous authoring/publication inputs and state exactly what continues during Corpus or provider downtime.
- [x] Inventory external dependencies, data crossing each boundary, authority, failure effect, and substitution path.
- [x] Define what is explicitly outside the App: raw Corpus ingestion/search, source archive UI, billing, social features, public multi-tenant Corpus API, and provider implementation internals.
- [x] Assign high-level ownership for learner state, content approval, evidence interpretation, readiness, rights eligibility, source intelligence, and audit.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Prefer the fewest independently operated systems; flag any always-on or per-request external dependency.
- [x] Security/privacy/rights — Name trust zones and processor/data boundaries without claiming legal compliance.
- [x] Accessibility — Show browser/device capability as local activity eligibility, not a global access gate.
- [x] Failure/recovery — Define graceful behavior for Corpus, AI, identity, media, network, and notification unavailability.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include C4 system-context diagram.
- [x] Include Actor/system responsibility matrix.
- [x] Include Trust-zone and data-flow diagram.
- [x] Include Runtime-versus-offline dependency table.
- [x] Include External dependency/failure inventory.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/02-system-context-and-product-boundaries.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Normal learner attempts do not require live Corpus access or raw/reference sources.
- Corpus never receives learner mastery, mistakes, readiness, fatigue, schedule, or other learner profile data.
- Do not reopen: App owns learner-specific decisions.
- Do not reopen: Corpus is pattern/intelligence first.
- Do not reopen: raw/reference access is not a learner runtime path.

**Done when:** Every Stage 02 owned decision is traceable and unambiguous in `Architecture/02-system-context-and-product-boundaries.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 03. Technology Stack and Repository Strategy

**Required prior stages:** 01, 02  
**Prompt:** `prompts/architecture/03_decide_technology_stack_and_repository_strategy.txt`  
**Output:** `Architecture/03-technology-stack-and-repository-strategy.md`  
**Major downstream consumers:** All implementation-facing stages, especially 05, 12–14, 19–26, and 28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/25-business-model-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §2`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-03-Desktop-Responsive.dc.html`
- `m-elsharkawi/Bestehen-App/Design/support.js (rendering insight only; never a production mandate)`
- `m-elsharkawi/Bestehen-App/Architecture/01-architecture-charter-and-quality-attributes.md`
- `m-elsharkawi/Bestehen-App/Architecture/02-system-context-and-product-boundaries.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Compare and select the frontend, server/runtime, language, database/access layer, background-job mechanism, object/media storage, hosting, and deployment baseline.
- [x] Decide monorepo versus polyrepo and define package/module boundaries, dependency direction, shared contracts, and generated-artifact policy.
- [x] Define local-development, testing, build, package, lint/type, migration, and environment tooling at architecture level.
- [x] Set dependency admission/update policy, supported runtime/browser baselines, lockfile/reproducibility, and supply-chain expectations.
- [x] Compare managed-service simplicity, recurring/variable cost, free-tier limits, operational burden, portability, and exit path using current official sources.
- [x] Identify deliberately deferred provider choices owned by later media, AI, identity, notification, or operations stages.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Research current official pricing/quotas and include a cheaper fallback and measured upgrade trigger for each mutable commercial service.
- [x] Security/privacy/rights — Assess patch cadence, secrets integration, dependency provenance, and security-support lifetime.
- [x] Accessibility — Select a stack that can support semantic HTML, focus management, live regions, 320px reflow, and browser APIs without bespoke forks.
- [x] Failure/recovery — Document platform limitations, degraded-mode feasibility, and exit/migration strategy.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Weighted alternative matrix with official-source links/access dates.
- [x] Include Repository/module dependency diagram.
- [x] Include Toolchain and environment table.
- [x] Include Provider/stack cost and exit-risk table.
- [x] Include Consequential ADRs for selected durable choices.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/03-technology-stack-and-repository-strategy.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Do not copy `.dc.html` framework/runtime patterns into production by default.
- Do not introduce microservices, Kubernetes, event streaming, a warehouse, or multi-region deployment without a demonstrated need.
- Do not reopen: responsive web launch.
- Do not reopen: phone-first daily use with large-screen strengths.
- Do not reopen: current/current-previous major browser-family contract.

**Done when:** Every Stage 03 owned decision is traceable and unambiguous in `Architecture/03-technology-stack-and-repository-strategy.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 04. Domain Model and Bounded Contexts

**Required prior stages:** 01, 02  
**Prompt:** `prompts/architecture/04_define_domain_model_and_bounded_contexts.txt`  
**Output:** `Architecture/04-domain-model-and-bounded-contexts.md`  
**Major downstream consumers:** Stages 05–13, 15–25, 27, 28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/04-learner-model.md`
- `m-elsharkawi/Bestehen-Shaping/app/05-mistake-memory.md`
- `m-elsharkawi/Bestehen-Shaping/app/06-daily-coaching-engine.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/08-a1-to-b1-progression.md`
- `m-elsharkawi/Bestehen-Shaping/app/15-telc-readiness.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/17-ready-to-book-logic.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/22-user-controls-vs-coach-autonomy.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html §3`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §3`
- `m-elsharkawi/Bestehen-App/Architecture/01-architecture-charter-and-quality-attributes.md`
- `m-elsharkawi/Bestehen-App/Architecture/02-system-context-and-product-boundaries.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define ubiquitous language and bounded contexts/modules for learner/profile, attempts/sessions, evidence, coaching, mistake/review, progression, content/forms, Corpus publication, readiness/mocks, productive evaluation, and operations.
- [x] Assign aggregate/state-machine/policy/value-object ownership and legal dependency directions between contexts.
- [x] Map every product and design state to one authoritative domain owner; distinguish domain state from UI projection and provider schema.
- [x] Model shared five-skill foundations with modality-specific extensions rather than five feature stacks.
- [x] Define commands, policies, domain services, projections, and anti-corruption layers conceptually without selecting schemas or endpoint syntax.
- [x] Resolve naming differences such as `stabilizing/stabilising`, historical/unconfirmed, resolved/reopened, readiness bands, and validity states without losing product semantics.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Favor modular-monolith boundaries and in-process policies until an independently scalable/isolatable need is proven.
- [x] Security/privacy/rights — Identify sensitive aggregates and authorization boundaries without forcing accounts onto first use.
- [x] Accessibility — Represent accommodations/capabilities and evidence meaning in domain contracts, not UI-only flags.
- [x] Failure/recovery — Model non-learner invalidation, Pending, partial validity, and local degradation as domain outcomes.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Bounded-context map.
- [x] Include Authoritative state-ownership table.
- [x] Include Ubiquitous-language glossary.
- [x] Include Aggregate/policy responsibility table.
- [x] Include Cross-context dependency rules and anti-corruption boundaries.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/04-domain-model-and-bounded-contexts.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- One domain owner per consequential state.
- P0–P4 are task-family/lane condition profiles, not a global course level.
- Do not reopen: canonical learning loop semantics.
- Do not reopen: Mistake Memory lifecycle truth.
- Do not reopen: six readiness states and five validity states.
- Do not reopen: learner/system control boundary.

**Done when:** Every Stage 04 owned decision is traceable and unambiguous in `Architecture/04-domain-model-and-bounded-contexts.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 05. Data Ownership, Persistence, and Schema Evolution

**Required prior stages:** 01, 02, 03, 04  
**Prompt:** `prompts/architecture/05_define_data_ownership_persistence_and_schema_evolution.txt`  
**Output:** `Architecture/05-data-ownership-persistence-and-schema-evolution.md`  
**Major downstream consumers:** Stages 06–12, 16–24, 26–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/04-learner-model.md`
- `m-elsharkawi/Bestehen-Shaping/app/05-mistake-memory.md`
- `m-elsharkawi/Bestehen-Shaping/app/15-telc-readiness.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §3`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html Act 5`
- `m-elsharkawi/Bestehen-App/Architecture/01-architecture-charter-and-quality-attributes.md`
- `m-elsharkawi/Bestehen-App/Architecture/02-system-context-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Classify data by owner, purpose, sensitivity, authority, mutability, retention, exportability, and deletion behavior.
- [x] Select persistence technologies and map relational/document/blob/local/cache needs to them without a premature warehouse or time-series platform.
- [x] Define stable identifiers, content/evidence family identity, timestamps, learner locale/time zone, ordering, and clock semantics.
- [x] Define transaction boundaries, consistency requirements, concurrency strategy, and how append-only facts coexist with mutable corrections/projections.
- [x] Define migration, backward/forward compatibility, schema versioning, historical correction, backup/restore, and data-integrity validation.
- [x] Separate local anonymous state, synchronized server state, cached Corpus/content bundles, raw media, and derived projections.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Choose the smallest durable managed/local combination and quantify idle, storage, backup, egress, and growth drivers.
- [x] Security/privacy/rights — Map encryption, access boundaries, sensitive fields, deletion proof, and backup retention.
- [x] Accessibility — Persist only access preferences/conditions needed for experience/evidence; avoid inferring disability.
- [x] Failure/recovery — Define corruption, partial write, retry, restore, and projection-rebuild behavior.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Data ownership/classification matrix.
- [x] Include Conceptual ER/data map.
- [x] Include Transaction/consistency table.
- [x] Include Schema-evolution and correction flow.
- [x] Include Backup/restore and retention summary.
- [x] Include Database/storage alternatives and ADR.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/05-data-ownership-persistence-and-schema-evolution.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Historical evidence remains auditable when interpretation changes.
- Raw media and exact reusable assets retain distinct retention/rights treatment from structured evidence.
- Do not reopen: export/delete entitlement.
- Do not reopen: account optionality.
- Do not reopen: raw-audio ephemerality.
- Do not reopen: no learner state in Corpus.

**Done when:** Every Stage 05 owned decision is traceable and unambiguous in `Architecture/05-data-ownership-persistence-and-schema-evolution.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 06. Evidence Ledger, Validity, Versioning, and Audit

**Required prior stages:** 04, 05  
**Prompt:** `prompts/architecture/06_define_evidence_ledger_validity_versioning_and_audit.txt`  
**Output:** `Architecture/06-evidence-ledger-validity-versioning-and-audit.md`  
**Major downstream consumers:** Stages 07–12, 15–25, 27, 28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/03-initial-diagnostic.md`
- `m-elsharkawi/Bestehen-Shaping/app/04-learner-model.md`
- `m-elsharkawi/Bestehen-Shaping/app/05-mistake-memory.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/08-a1-to-b1-progression.md`
- `m-elsharkawi/Bestehen-Shaping/app/14-review-and-spaced-repetition.md`
- `m-elsharkawi/Bestehen-Shaping/app/15-telc-readiness.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/17-ready-to-book-logic.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-Shaping/app/27-end-to-end-scenario-validation.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html §§2.5, 3.2, 3.3, 3.6`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §3`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define immutable observation/attempt/evidence identities, episode and content-family independence, provenance, and the boundary between facts and derived claims.
- [x] Specify `valid`, `partially_valid`, `pending`, `interrupted`, and `not_counted`, including affected scope and who may transition each state.
- [x] Represent assistance, timing, playback, transcript/reference exposure, freshness, target conditions, accessibility conditions, and direct modality as explicit dimensions.
- [x] Carry blueprint, taxonomy, content, form, rubric, evaluator, prompt, calculation, and contract versions through evidence and projections.
- [x] Define idempotent ingestion, correction, invalidation, quarantine/takedown effects, targeted recomputation, and audit history.
- [x] Forbid any pass-probability field/model before the product gate and represent missing estimates as absence, never zero.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Use deterministic projections/recomputation and targeted rebuilds; avoid an event-streaming platform unless measurements justify it.
- [x] Security/privacy/rights — Make evidence correction/invalidation and privileged overrides auditable; minimize external evaluator payloads.
- [x] Accessibility — Record the actual condition and affected claim without treating access support as learner failure.
- [x] Failure/recovery — Preserve unaffected scope and Pending work while avoiding duplicate evidence on retry/reconnect.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Evidence envelope/pseudotype.
- [x] Include Validity state machine.
- [x] Include Version lineage table.
- [x] Include Invalidation/recomputation sequence diagrams.
- [x] Include Idempotency and audit-boundary table.
- [x] Include State/API projection mapping for design labels.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/06-evidence-ledger-validity-versioning-and-audit.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Immediate retry, delayed transfer, retention, and independent mock occasions stay distinct.
- Technical/content/media/access/evaluator failures cannot create negative learner evidence.
- Do not reopen: five validity states.
- Do not reopen: direct-evidence rule.
- Do not reopen: no pass probability.
- Do not reopen: historical auditability.

**Done when:** Every Stage 06 owned decision is traceable and unambiguous in `Architecture/06-evidence-ledger-validity-versioning-and-audit.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 07. Learner Model, Mistake Memory, Progression, and Review

**Required prior stages:** 04, 05, 06  
**Prompt:** `prompts/architecture/07_define_learner_model_mistake_memory_progression_and_review.txt`  
**Output:** `Architecture/07-learner-model-mistake-memory-progression-and-review.md`  
**Major downstream consumers:** Stages 08, 11, 12, 20, 22, 24, 25, 27, 28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/04-learner-model.md`
- `m-elsharkawi/Bestehen-Shaping/app/05-mistake-memory.md`
- `m-elsharkawi/Bestehen-Shaping/app/06-daily-coaching-engine.md`
- `m-elsharkawi/Bestehen-Shaping/app/08-a1-to-b1-progression.md`
- `m-elsharkawi/Bestehen-Shaping/app/14-review-and-spaced-repetition.md`
- `m-elsharkawi/Bestehen-Shaping/app/20-progress-and-motivation.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html §3.4 and weakness models`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html return/weakness/review surfaces`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define deterministic projections for capability/mastery, confidence, freshness, stability, assistance dependence, timing, direct lane, coverage, and readiness contribution without duplicating readiness.
- [x] Implement conceptually the Candidate → Known → Repairing → Stabilizing → Repaired → Resolved lifecycle plus Historical/Unconfirmed and Reopened paths.
- [x] Define promotion, recurrence, opportunity denominators, confidence, cross-skill influence, stale history, and re-opening semantics.
- [x] Represent P0–P4 profiles per task family/direct-evidence lane and one-axis promotion/regression probes.
- [x] Define due review/retention obligations, windows, natural-practice satisfaction, missed-day behavior, capping, and deterministic scheduling.
- [x] Define explainable recalculation inputs, versioned empirical defaults, and projection invalidation.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Keep scheduling and projections deterministic; model calls may inform bounded diagnosis but never run merely to update the learner model.
- [x] Security/privacy/rights — Keep sensitive learner history inside App and export/delete it coherently.
- [x] Accessibility — Ensure alternate inputs create equivalent evidence when they test the same capability; represent changed conditions explicitly otherwise.
- [x] Failure/recovery — Unknown cause, invalid task, stale data, and recalculation failure remain explicit and recoverable.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Projection ownership table.
- [x] Include Mistake lifecycle state diagram.
- [x] Include Progression profile model/table.
- [x] Include Review obligation/scheduling state machine.
- [x] Include Cross-lane influence matrix.
- [x] Include Worked recalculation examples.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/07-learner-model-mistake-memory-progression-and-review.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Corpus frequency/relevance is a prior, never learner mastery or weakness.
- Time lowers currentness/priority; it never repairs a weakness or deletes history.
- Do not reopen: two independent episodes default for a fine weakness.
- Do not reopen: same-session success is not retention.
- Do not reopen: P0–P4 are local profiles.
- Do not reopen: review is not a deck/debt economy.

**Done when:** Every Stage 07 owned decision is traceable and unambiguous in `Architecture/07-learner-model-mistake-memory-progression-and-review.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 08. Coaching Engine and Session State Machines

**Required prior stages:** 04, 06, 07  
**Prompt:** `prompts/architecture/08_define_coaching_engine_and_session_state_machines.txt`  
**Output:** `Architecture/08-coaching-engine-and-session-state-machines.md`  
**Major downstream consumers:** Stages 11–13, 15–22, 24, 25, 27, 28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/02-complete-learner-journey.md`
- `m-elsharkawi/Bestehen-Shaping/app/03-initial-diagnostic.md`
- `m-elsharkawi/Bestehen-Shaping/app/06-daily-coaching-engine.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/08-a1-to-b1-progression.md`
- `m-elsharkawi/Bestehen-Shaping/app/14-review-and-spaced-repetition.md`
- `m-elsharkawi/Bestehen-Shaping/app/18-coach-personality-and-behavior.md`
- `m-elsharkawi/Bestehen-Shaping/app/19-information-architecture-and-core-screens.md`
- `m-elsharkawi/Bestehen-Shaping/app/22-user-controls-vs-coach-autonomy.md`
- `m-elsharkawi/Bestehen-Shaping/app/23-exam-date-and-urgency.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html Acts 1–2`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html Flows A–C`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html §3.1`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/07-learner-model-mistake-memory-progression-and-review.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define daily-plan inputs, lexicographic priority tiers, within-tier comparison, deterministic selection, tie-breaking, and structured reason codes.
- [x] Define `Coach me` versus `Just practice X`, alternative plans, time/context changes, early target-condition/mock choices, and non-punitive overrides.
- [x] Define session/activity/attempt boundaries, plan assembly, one dominant action, limited secondary scope, partial completion, stop, resume, and replanning.
- [x] Model Observe → Attempt → Diagnose → Repair → Retry → Remember with allowed compression/deferment and productive Pending branches.
- [x] Separate deterministic policy from bounded model-assisted diagnosis/copy and define reviewed fallback reasons/copy.
- [x] Define state ownership and concurrency when evaluations arrive after the learner continues or a plan changes.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — No per-session premium planner; use structured deterministic policy, cached content, and templated explanations.
- [x] Security/privacy/rights — Do not send full learner history to models just to choose or phrase a plan.
- [x] Accessibility — Capability/access context may change activity eligibility but must not globally block the App.
- [x] Failure/recovery — A plan assembly/content/evaluator failure yields a specific fallback or alternative activity without learner penalty.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Planning decision table/pseudologic.
- [x] Include Session and canonical-loop state diagrams.
- [x] Include Coach-me/Just-practice sequences.
- [x] Include Override/consequence matrix.
- [x] Include Reason-code and fallback-copy contract.
- [x] Include Partial completion/resume table.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/08-coaching-engine-and-session-state-machines.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Stage 27 precedence is lexicographic; preference cannot outweigh validity, direct evidence, pass risk, uncertainty, due repair, or coverage.
- Learner override changes the plan, never evidence truth or readiness semantics.
- Do not reopen: 25-minute default with 10/45 alternatives.
- Do not reopen: one dominant recommended action.
- Do not reopen: Coach me and Just practice X are distinct.
- Do not reopen: canonical loop evidence boundaries.

**Done when:** Every Stage 08 owned decision is traceable and unambiguous in `Architecture/08-coaching-engine-and-session-state-machines.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 09. Content, Exercise, Form, and Media Architecture

**Required prior stages:** 02, 04, 05, 06  
**Prompt:** `prompts/architecture/09_define_content_exercise_form_and_media_architecture.txt`  
**Output:** `Architecture/09-content-exercise-form-and-media-architecture.md`  
**Major downstream consumers:** Stages 10–12, 15–19, 23–26, 28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/08-a1-to-b1-progression.md`
- `m-elsharkawi/Bestehen-Shaping/app/09-reading-training.md`
- `m-elsharkawi/Bestehen-Shaping/app/10-language-elements-training.md`
- `m-elsharkawi/Bestehen-Shaping/app/11-listening-training.md`
- `m-elsharkawi/Bestehen-Shaping/app/12-writing-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/13-speaking-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/12-corpus-app-contract.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/17-bestehen-corpus-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html shared attempt/component library`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html skill input regions`
- `m-elsharkawi/Bestehen-App/Architecture/02-system-context-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define C0–C4 content classes, source/brief/task/form/item/content-family/version identities, and exact asset/media references.
- [x] Define approval levels from draft/quarantine through training, independent-B1, Readiness/P4, and Gold, including who may promote each class.
- [x] Define generation brief, deterministic structural checks, independent answer/rubric validation, human review, anti-copy, naturalness, and post-publication quality flow.
- [x] Define freshness/exposure/near-duplicate rules and independent form-family composition for retries, retention, mocks, and booking confirmation.
- [x] Model objective keys, productive rubrics, content-point obligations, distractor rationale, media manifests, and attribution/rights envelopes.
- [x] Define content serving, caching, version pinning, quarantine/takedown, replacement, and affected-evidence recomputation hooks.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Batch generation/TTS and cache approved assets; identify high-stakes human-review volume and storage/egress drivers.
- [x] Security/privacy/rights — Treat authoring input as untrusted; enforce rights eligibility and prevent restricted source expression from leaking into learner content.
- [x] Accessibility — Require alternative text/transcript metadata and accessible interaction form metadata before publication.
- [x] Failure/recovery — Defective or unavailable content is quarantined/replaced; learner evidence is targeted for correction without penalty.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Conceptual content/form/media model.
- [x] Include Approval lifecycle state diagram.
- [x] Include Content-family freshness/independence table.
- [x] Include QA/publication/quarantine sequence.
- [x] Include Rights/attribution envelope.
- [x] Include Serving/cache strategy and failure matrix.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/09-content-exercise-form-and-media-architecture.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Routine content is pre-generated/authored, reviewed, cached, and reused; runtime generation is exceptional.
- Rights and attribution travel with the exact reusable asset; authenticity/confidence and rights remain separate.
- Do not reopen: five content classes.
- Do not reopen: original reviewed content as default.
- Do not reopen: fresh family independence.
- Do not reopen: objective deterministic scoring.

**Done when:** Every Stage 09 owned decision is traceable and unambiguous in `Architecture/09-content-exercise-form-and-media-architecture.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 10. Corpus Integration, Compatibility, Cache, and Rights

**Required prior stages:** 02, 05, 09  
**Prompt:** `prompts/architecture/10_define_corpus_integration_compatibility_cache_and_rights.txt`  
**Output:** `Architecture/10-corpus-integration-compatibility-cache-and-rights.md`  
**Major downstream consumers:** Stages 11, 12, 16, 19, 23–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/01_Bestehen_Product_Overview.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/22-user-controls-vs-coach-autonomy.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/12-corpus-app-contract.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/17-bestehen-corpus-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §§1, 9 (Corpus remains behind the learner experience)`
- `m-elsharkawi/Bestehen-App/Architecture/02-system-context-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Choose and specify App request/Corpus publication contract style: bundles, API, files, or hybrid, with evidence-based comparison.
- [x] Map six information families plus governance envelopes into versioned App-consumable contracts without leaking Corpus tables.
- [x] Define asynchronous publication, acceptance/promotion, immutable bundle/version identity, cache layout, rollback, and offline/runtime fallback.
- [x] Define contract/model/payload version compatibility, stable IDs, taxonomy/blueprint migrations, deprecation, and unsupported-major behavior.
- [x] Define confidence, currentness, source breadth, analytical independence, use eligibility, exact-asset rights, attribution, takedown, and reclassification handling.
- [x] Prove normal practice and previously approved P4 content continue during Corpus downtime and that Corpus never receives learner state.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Prefer batched immutable publication and local/cache reads; quantify storage, transfer, refresh, and invalidation costs.
- [x] Security/privacy/rights — Authenticate authoring/publication channels, validate signatures/checksums where justified, and enforce rights/takedown.
- [x] Accessibility — Carry accessibility metadata and do not publish learner tasks missing required alternatives.
- [x] Failure/recovery — Define no-match, sparse evidence, stale bundle, incompatible major, revoked asset, and Corpus outage behavior.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Contract/bundle pseudotypes.
- [x] Include Publication/acceptance sequence.
- [x] Include Compatibility matrix.
- [x] Include Cache/fallback state table.
- [x] Include Rights/change impact matrix.
- [x] Include Corpus-downtime walkthrough.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/10-corpus-integration-compatibility-cache-and-rights.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Corpus owns eligibility of Corpus-derived material; App owns learner selection, original practice, evaluation, and readiness.
- No live Corpus AI/search is required for normal learner attempts.
- Do not reopen: pattern-first contract.
- Do not reopen: no learner data sent to Corpus.
- Do not reopen: App-approved content as runtime inventory.
- Do not reopen: separate rights and confidence.

**Done when:** Every Stage 10 owned decision is traceable and unambiguous in `Architecture/10-corpus-integration-compatibility-cache-and-rights.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 11. Readiness, Scoring, Mocks, and Ready-to-Book

**Required prior stages:** 04, 05, 06, 07, 09, 10  
**Prompt:** `prompts/architecture/11_define_readiness_scoring_mocks_and_ready_to_book.txt`  
**Output:** `Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`  
**Major downstream consumers:** Stages 12–14, 17–25, 27, 28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/15-telc-readiness.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/17-ready-to-book-logic.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-Shaping/app/27-end-to-end-scenario-validation.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html §§2.8, 3.3`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html Act 4`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-03-Desktop-Responsive.dc.html D2`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/07-learner-model-mistake-memory-progression-and-review.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/10-corpus-integration-compatibility-cache-and-rights.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Represent the versioned official blueprint, scoring units, Written 225/135 gate, Oral 75/45 gate, official 60 line, and Bestehen Safe margin as distinguishable data.
- [x] Specify eligibility and aggregation from independent evidence episodes to scoring units, sections, components, planning ranges, confidence, bands, reasons, and bottleneck index.
- [x] Define all six client states: `evidence_building`, `not_ready`, `borderline`, `safe`, `ready_to_book`, and `stale_contradicted`, including absent estimate versus zero.
- [x] Define mock scopes, form-family independence, correlated occasion handling, target-condition validity, partial/pending result behavior, and immutable original mock outcomes.
- [x] Specify Ready-to-Book as a reversible gate over Safe/current evidence with all Stage 17 gates and granular failure reasons; UI grouping may not drop a gate.
- [x] Define recalculation/invalidation for evidence correction, content defect, evaluator correction, staleness, contradiction, and blueprint change.
- [x] Version all empirical parameters and explicitly prohibit pass probability until calibrated with independent outcomes and the product gate is satisfied.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — All scoring/readiness/gating is deterministic; AI may create structured evaluator observations but never computes the final claim in a recurring call.
- [x] Security/privacy/rights — Protect consequential calculations, version/audit history, and privileged blueprint/calibration updates.
- [x] Accessibility — Return complete textual meaning for every chart/band/gate and preserve evidence-equivalent accommodations.
- [x] Failure/recovery — Pending productive evaluation blocks dependent conclusions only; missing evidence is absence; partial mock scope cannot silently become whole-mock validity.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Scoring/readiness calculation specification.
- [x] Include Readiness and Ready-to-Book state diagrams.
- [x] Include Eligibility/reason discriminated unions or pseudotypes.
- [x] Include Mock validity/scope matrix.
- [x] Include Recomputation sequence and audit table.
- [x] Include Worked missing/pending/partial/contradicted examples.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/11-readiness-scoring-mocks-and-ready-to-book.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Written and Oral cannot compensate for each other.
- Safe is a band; Ready to Book is a stricter gate, not a higher score.
- Do not reopen: 65 Safe default and 60 official line.
- Do not reopen: weaker-component index.
- Do not reopen: no pass probability at launch.
- Do not reopen: full Stage 17 Ready-to-Book gate.

**Done when:** Every Stage 11 owned decision is traceable and unambiguous in `Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 12. API Contracts, Jobs, Events, and Idempotency

**Required prior stages:** 03, 04, 05, 06, 08, 09, 10, 11  
**Prompt:** `prompts/architecture/12_define_api_contracts_jobs_events_and_idempotency.txt`  
**Output:** `Architecture/12-api-contracts-jobs-events-and-idempotency.md`  
**Major downstream consumers:** Stages 13–26, 28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/03-initial-diagnostic.md`
- `m-elsharkawi/Bestehen-Shaping/app/06-daily-coaching-engine.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/15-telc-readiness.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/17-ready-to-book-logic.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/22-user-controls-vs-coach-autonomy.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/12-corpus-app-contract.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/17-bestehen-corpus-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §3`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html Flows B–F`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/10-corpus-integration-compatibility-cache-and-rights.md`
- `m-elsharkawi/Bestehen-App/Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Choose client/server contract style and define command/query/resource boundaries, versioning, validation, pagination, concurrency, and generated contract documentation.
- [x] Define a discriminated error/result taxonomy that preserves evidence validity, pending, partial scope, conflict, capability, rights, and retryability.
- [x] Specify long-running productive evaluation/content/media jobs, state transitions, polling/push/callback choice, deadlines, cancellation, and late-result behavior.
- [x] Separate domain events, integration events, and internal jobs; introduce outbox/queue infrastructure only where loss/duplication risk justifies it.
- [x] Define idempotency keys and deduplication boundaries for attempts, checkpoints, submissions, evaluation requests/results, notifications, Corpus publication, and deletion.
- [x] Define optimistic concurrency/conflict behavior for anonymous-to-account merge, multiple devices, session resume, and version changes.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Prefer simple request/response plus a durable background-job mechanism over a general event platform.
- [x] Security/privacy/rights — Define authentication/authorization per contract, validation, abuse limits, secret boundaries, and minimum AI payload.
- [x] Accessibility — APIs return semantic labels, reasons, alternatives, and focus/live-region hints where the design contract requires them.
- [x] Failure/recovery — Retries are explicit and idempotent; late/pending/duplicate results cannot overwrite newer truth.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include API style alternative/decision table.
- [x] Include Resource/command/query catalog.
- [x] Include Error/result taxonomy.
- [x] Include Job/event state diagrams.
- [x] Include Idempotency/concurrency matrix.
- [x] Include Representative non-production contract examples.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/12-api-contracts-jobs-events-and-idempotency.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- The client never invents readiness, validity, evidence labels, scoring, or mistake state.
- Structured state is authoritative; generated wording is presentation.
- Do not reopen: server/domain ownership of consequential state.
- Do not reopen: pending is not error or zero.
- Do not reopen: partial validity keeps named unaffected scope.

**Done when:** Every Stage 12 owned decision is traceable and unambiguous in `Architecture/12-api-contracts-jobs-events-and-idempotency.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 13. Frontend Application and Design-System Architecture

**Required prior stages:** 01, 02, 03, 04, 08, 11, 12  
**Prompt:** `prompts/architecture/13_define_frontend_application_and_design_system_architecture.txt`  
**Output:** `Architecture/13-frontend-application-and-design-system-architecture.md`  
**Major downstream consumers:** Stages 14–22, 25–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/02_Bestehen_Identity.md`
- `m-elsharkawi/Bestehen-Shaping/app/18-coach-personality-and-behavior.md`
- `m-elsharkawi/Bestehen-Shaping/app/19-information-architecture-and-core-screens.md`
- `m-elsharkawi/Bestehen-Shaping/app/20-progress-and-motivation.md`
- `m-elsharkawi/Bestehen-Shaping/app/22-user-controls-vs-coach-autonomy.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-03-Desktop-Responsive.dc.html`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-Type-Options.dc.html`
- `m-elsharkawi/Bestehen-App/Design/Bestehen Logo/Bestehen Logo System.dc.html`
- `m-elsharkawi/Bestehen-App/Architecture/01-architecture-charter-and-quality-attributes.md`
- `m-elsharkawi/Bestehen-App/Architecture/02-system-context-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define responsive web application composition, routing, four-destination IA, focused attempt/mock shells, feature-module boundaries, and dependency direction.
- [x] Define server/client/local/form state ownership, query/cache invalidation, draft state, optimistic UI limits, and how authoritative domain state becomes UI projections.
- [x] Define one shared component library and extension points for five skill-specific input regions; prevent skill-specific forks of shell/result/repair/evidence behavior.
- [x] Map 25 named semantic design tokens across light/dark modes, typography roles, 18-icon subset, Threshold B logo assets, theme override, and asset delivery.
- [x] Define component contracts for all validity/readiness/failure/pending states, progressive disclosure, error boundaries, empty states, and read-only evidence labels.
- [x] Create a screen/flow/component-to-module/API traceability map without treating each design frame as a separate route or backend service.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Prefer one web client and one shared library; avoid duplicate state stores/frameworks and unnecessary client analytics.
- [x] Security/privacy/rights — Prevent XSS/content injection, protect tokens/secrets from the client, and make system-owned states read-only.
- [x] Accessibility — Build semantics/focus/live regions/reduced motion into shared primitives rather than per-screen fixes.
- [x] Failure/recovery — Use local error boundaries and recovery state contracts; one failed capability must not crash the whole App.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Frontend/module/component dependency diagram.
- [x] Include Route/shell/state ownership table.
- [x] Include Design-token/theme/asset architecture.
- [x] Include Design screen/flow/component mapping.
- [x] Include Error-boundary/degradation plan.
- [x] Include Shared-shell extension contract.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/13-frontend-application-and-design-system-architecture.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Design markup/runtime is a specification, not code to copy.
- Coach/Home has one dominant action; Train remains secondary; evidence state is never inferred from color or local UI heuristics.
- Do not reopen: four-destination IA.
- Do not reopen: chosen type roles.
- Do not reopen: Threshold B B1 logo.
- Do not reopen: shared component library across five skills.
- Do not reopen: fixed design semantics.

**Done when:** Every Stage 13 owned decision is traceable and unambiguous in `Architecture/13-frontend-application-and-design-system-architecture.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 14. Responsive, Accessibility, Browser, and Device Architecture

**Required prior stages:** 01, 03, 13  
**Prompt:** `prompts/architecture/14_define_responsive_accessibility_browser_and_device_architecture.txt`  
**Output:** `Architecture/14-responsive-accessibility-browser-and-device-architecture.md`  
**Major downstream consumers:** Stages 15–18, 20–23, 25–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/19-information-architecture-and-core-screens.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §§5–6`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-03-Desktop-Responsive.dc.html`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html #a`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html accessibility rows`
- `m-elsharkawi/Bestehen-App/Architecture/01-architecture-charter-and-quality-attributes.md`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Lock breakpoint/layout contract for ≤479, 480–767, 768–1023, 1024–1279, and ≥1280, including max measures, navigation changes, dialog/sheet behavior, and focused shells.
- [x] Define capability detection/preflight and activity-level eligibility for storage, microphone, audio, media formats, checkpoint durability, notifications, and private/embedded contexts.
- [x] Specify WCAG 2.2 AA mechanics for semantics, focus, keyboard, live regions, labels/errors, chart text/table alternatives, drag-free input, target sizes, 200% zoom, 320px reflow, and reduced motion.
- [x] Define timer/recording announcements, priority, focus movement, shortcuts, and conflicts with browser/screen-reader bindings.
- [x] Choose and justify browser/device support and automated/manual test matrix from current capability evidence.
- [x] Define evidence-equivalent versus evidence-altering accessibility conditions and the architecture contract for verified future accommodation profiles.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Bound the support matrix to current/current-previous major families and automate high-value checks before adding breadth.
- [x] Security/privacy/rights — Treat permission/capability checks contextually; never capture microphone in the background.
- [x] Accessibility — This stage owns the complete acceptance contract and must turn every design criterion into a testable mechanism.
- [x] Failure/recovery — Unsupported/denied/broken capability blocks only the affected high-stakes action and offers valid alternatives.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Responsive behavior matrix.
- [x] Include Capability/preflight state model.
- [x] Include Accessibility semantic/focus/live-region contract.
- [x] Include Browser/device support matrix with official-source access dates.
- [x] Include Evidence/accommodation matrix.
- [x] Include Acceptance-test catalog.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/14-responsive-accessibility-browser-and-device-architecture.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Timer ticks are never announced.
- Keyboard/screen-reader users must be able to create identical evidence when the tested capability is unchanged.
- Do not reopen: WCAG 2.2 AA baseline.
- Do not reopen: fixed responsive rules.
- Do not reopen: contextual microphone permission.
- Do not reopen: no global device-capability block.

**Done when:** Every Stage 14 owned decision is traceable and unambiguous in `Architecture/14-responsive-accessibility-browser-and-device-architecture.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 15. Reading and Language Elements Runtime

**Required prior stages:** 06, 08, 09, 11, 12, 13, 14  
**Prompt:** `prompts/architecture/15_define_reading_and_language_elements_runtime.txt`  
**Output:** `Architecture/15-reading-and-language-elements-runtime.md`  
**Major downstream consumers:** Stages 21, 24–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/08-a1-to-b1-progression.md`
- `m-elsharkawi/Bestehen-Shaping/app/09-reading-training.md`
- `m-elsharkawi/Bestehen-Shaping/app/10-language-elements-training.md`
- `m-elsharkawi/Bestehen-Shaping/app/14-review-and-spaced-repetition.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html attempt/input/result/repair components`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html Reading and shared shell`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html Flows B–C`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define task runtime contracts for R1–R3 and SB1–SB2, including instruction/stimulus/item/option/gap/matching representations and form-level shared blocks.
- [x] Specify select, matching, select-then-place, and cloze interactions with identical pointer/keyboard evidence and deterministic validation/scoring.
- [x] Define attempt shell extensions, navigation, shared Reading+Language Elements timing, answer submission, exposure, and immutable original outcome.
- [x] Define decisive-evidence spans, distractor rationale, cause/repair contract, fresh-equivalent retry, delayed return, and content-family independence.
- [x] Define assistance/translation/word-help/timing labels and eligibility effects without conflating offered with used help.
- [x] Handle ambiguity/defect reports, invalidation, replacement, and recalculation without learner failure.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Zero runtime AI for ordinary objective scoring/explanation selection; precompute reviewed explanations and variants.
- [x] Security/privacy/rights — Sanitize content and prevent answer-key leakage before submission.
- [x] Accessibility — All matching/cloze/select interactions require semantic, keyboard, zoom, and screen-reader equivalence.
- [x] Failure/recovery — Preserve submitted work and unaffected evidence; ambiguous/defective items become not_counted and trigger targeted recomputation.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Task/form/response pseudotypes.
- [x] Include Runtime and scoring state diagrams.
- [x] Include Interaction/accessibility equivalence table.
- [x] Include Assistance/exposure/validity matrix.
- [x] Include Defect/invalidation sequence.
- [x] Include Shared-shell extension map.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/15-reading-and-language-elements-runtime.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Objective scoring is deterministic.
- No invented official standalone time limit for Language Elements; target timing belongs to the shared block.
- Do not reopen: R1–R3 and SB1–SB2 task families.
- Do not reopen: decisive evidence before advice.
- Do not reopen: fresh retry requirement.
- Do not reopen: deterministic objective scoring.

**Done when:** Every Stage 15 owned decision is traceable and unambiguous in `Architecture/15-reading-and-language-elements-runtime.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 16. Listening, Audio, TTS, and Media Delivery

**Required prior stages:** 05, 06, 09, 10, 12, 13, 14  
**Prompt:** `prompts/architecture/16_define_listening_audio_tts_and_media_delivery.txt`  
**Output:** `Architecture/16-listening-audio-tts-and-media-delivery.md`  
**Major downstream consumers:** Stages 18, 19, 21, 23–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/08-a1-to-b1-progression.md`
- `m-elsharkawi/Bestehen-Shaping/app/11-listening-training.md`
- `m-elsharkawi/Bestehen-Shaping/app/14-review-and-spaced-repetition.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html audio/timer/failure components`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html Listening and audio-failed states`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html Flows D and F`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/10-corpus-integration-compatibility-cache-and-rights.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define H1–H3 runtime/playback contracts, audio manifests, playback/reference limits, replay accounting, speed/voice metadata, and transcript gating.
- [x] Select storage/CDN/delivery formats and cache/preload strategy from current browser support, cost, licensing, and accessibility evidence.
- [x] Define batch TTS/human-audited/native benchmark pipeline boundary, asset versioning, pronunciation QA, and evidence role.
- [x] Define measured-block media preflight, locally-ready criteria, timer/playback integrity, reconnect/offline/poor-connectivity behavior, and no duplicate playback/evidence.
- [x] Define instructional text alternatives versus target Listening transcript restrictions and evidence-altering accommodations.
- [x] Handle missing/corrupt/late audio, device output problems, backgrounding, and replacement without learner failure.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Batch/cache TTS, avoid per-play generation, measure storage/CDN/egress and define human-audio upgrade triggers.
- [x] Security/privacy/rights — Use signed/controlled asset access where needed, enforce rights, and avoid leaking restricted transcripts.
- [x] Accessibility — Instructional audio has text equivalents; target Listening remains evidence-sensitive with honest accommodation labels.
- [x] Failure/recovery — Audio failure is not_counted; preflight prevents false clean claims and unrelated skills remain available.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Media manifest/asset pseudotypes.
- [x] Include Playback state machine.
- [x] Include Delivery/storage/format comparison with official browser/price sources.
- [x] Include Preflight/failure matrix.
- [x] Include TTS/audit publication flow.
- [x] Include Offline/cache sequence.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/16-listening-audio-tts-and-media-delivery.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Cached reviewed TTS may support breadth, but strong P4 needs target-calibrated audited variety.
- Transcript/extra replay conditions remain explicit and cannot silently set Listening Readiness.
- Do not reopen: H1–H3 families and playback rules.
- Do not reopen: batch/cached audio default.
- Do not reopen: transcript gating.
- Do not reopen: target-condition preflight.

**Done when:** Every Stage 16 owned decision is traceable and unambiguous in `Architecture/16-listening-audio-tts-and-media-delivery.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 17. Writing Editor, Autosave, and Evaluation Pipeline

**Required prior stages:** 05, 06, 08, 09, 11, 12, 13, 14  
**Prompt:** `prompts/architecture/17_define_writing_editor_autosave_and_evaluation_pipeline.txt`  
**Output:** `Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`  
**Major downstream consumers:** Stages 19–21, 23–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/08-a1-to-b1-progression.md`
- `m-elsharkawi/Bestehen-Shaping/app/12-writing-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/14-review-and-spaced-repetition.md`
- `m-elsharkawi/Bestehen-Shaping/app/15-telc-readiness.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html Writing/offline states`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-03-Desktop-Responsive.dc.html D3`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html autosave/pending components`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define prompt/scenario/register/content-point/rubric model and learner draft, submitted response, revision, fresh transfer, and evaluation identities.
- [x] Design editor state, content-point checklist, autosave/checkpoint cadence, local/server recovery, offline continuation, conflict handling, and measured loss bound.
- [x] Define timer/submit/finalization semantics and preserve honest timing through reload, offline, retry, and late sync.
- [x] Define deterministic prechecks and one structured evaluator contract with rubric outputs, evidence spans, confidence, version, disagreement, one escalation, Pending, and correction.
- [x] Separate same-prompt revision learning value from original score and fresh independent Writing evidence.
- [x] Define Writing retention/export/deletion, minimum AI payload, and immutable/auditable evaluator corrections.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — One bounded structured call after deterministic checks; cache/deduplicate safely and escalate once only for justified uncertainty.
- [x] Security/privacy/rights — Protect learner text, minimize provider payload, restrict access, and make deletion/evaluator correction auditable.
- [x] Accessibility — Ensure obligations/prompt/editor remain usable at reflow/zoom and via keyboard/screen reader with visible save state.
- [x] Failure/recovery — Draft survives; evaluation may remain Pending; no outage becomes a weak Writing score.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Writing domain/evaluator pseudotypes.
- [x] Include Editor/autosave/recovery state diagram.
- [x] Include Submission/evaluation/escalation sequence.
- [x] Include Timing/conflict matrix.
- [x] Include Retention/export/deletion flow.
- [x] Include Failure/Pending UI contract.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- No invented official word-count gate.
- Model answers/corrections are not learner evidence; same-prompt revision cannot overwrite the original attempt.
- Do not reopen: 30-minute target Writing behavior.
- Do not reopen: structured versioned evaluator.
- Do not reopen: one-escalation ceiling.
- Do not reopen: ~5-second draft-loss design target subject to measured validation.

**Done when:** Every Stage 17 owned decision is traceable and unambiguous in `Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 18. Speaking Audio, STT, Partner, and Evaluation Pipeline

**Required prior stages:** 05, 06, 08, 09, 11, 12, 13, 14, 16  
**Prompt:** `prompts/architecture/18_define_speaking_audio_stt_partner_and_evaluation_pipeline.txt`  
**Output:** `Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`  
**Major downstream consumers:** Stages 19–21, 23–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/08-a1-to-b1-progression.md`
- `m-elsharkawi/Bestehen-Shaping/app/11-listening-training.md`
- `m-elsharkawi/Bestehen-Shaping/app/13-speaking-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/14-review-and-spaced-repetition.md`
- `m-elsharkawi/Bestehen-Shaping/app/15-telc-readiness.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html Speaking/mic-denied states`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html recording/pending/failure components`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html Flows D and F`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/16-listening-audio-tts-and-media-delivery.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define contextual microphone permission, device selection, preflight, capture/turn/chunk/session identities, persistence, and explicit recording state.
- [x] Define STT/transcript confidence, learner correction limits, transcript/reference role, and why STT cannot independently judge pronunciation.
- [x] Define fixed/scripted versus adaptive turn-based partner contracts, S1–S3 state machines, preparation, turn completion, latency, interruption, and bounded fallback.
- [x] Define structured oral evaluator contract, actual-voice requirement, rubric/interaction evidence, confidence/disagreement, one escalation, Pending, and correction.
- [x] Define raw-audio lifecycle: minimal capture/use, one escalation, deletion after finalized evaluation, and seven-day pending ceiling while structured evidence remains auditable.
- [x] Handle denied permission, silent/wrong device, clipped audio, partner/evaluator outage, backgrounding, and typed rehearsal without substituting typed work for oral evidence.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Prefer fixed/turn-based modes; reserve adaptive generation and stronger evaluation for cases where learner meaning/evidence stakes justify it.
- [x] Security/privacy/rights — Contextual permission, visible capture, pseudonymous provider calls, encryption, ephemeral raw audio, and deletion proof are mandatory.
- [x] Accessibility — Offer learning alternatives without mislabelling typed/captioned interaction as standard oral evidence.
- [x] Failure/recovery — Bad capture/provider behavior creates Pending/not_counted/interrupted states, never a low oral score.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Capture/turn/session pseudotypes.
- [x] Include Permission/preflight/capture state diagram.
- [x] Include Partner-turn sequence and fallback table.
- [x] Include STT/evaluator confidence/escalation contract.
- [x] Include Raw-audio deletion sequence.
- [x] Include Failure/evidence consequence matrix.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Another modality cannot initialize Speaking mastery; typed rehearsal is learning-only.
- S2/S3 readiness requires genuine interaction evidence, not only monologue production.
- Do not reopen: voice required for oral evidence.
- Do not reopen: turn-based interaction is sufficient by default.
- Do not reopen: ephemeral raw audio.
- Do not reopen: one justified premium escalation.

**Done when:** Every Stage 18 owned decision is traceable and unambiguous in `Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 19. AI Gateway, Model Governance, Evaluation, and Cost

**Required prior stages:** 03, 05, 06, 09, 12, 17, 18  
**Prompt:** `prompts/architecture/19_define_ai_gateway_model_governance_evaluation_and_cost.txt`  
**Output:** `Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md`  
**Major downstream consumers:** Stages 23–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/12-writing-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/13-speaking-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/18-coach-personality-and-behavior.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-Shaping/app/25-business-model-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-01-Design-System.dc.html pending/failure models`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html evaluator branches`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Inventory allowed AI capabilities and explicitly excluded uses such as routine objective scoring, per-session planning, readiness calculation, analytics summaries, or decorative coach wording.
- [x] Choose provider abstraction depth by capability and define structured schemas, prompt/evaluator/version registry, deterministic validation, and response provenance.
- [x] Define capability-specific model routing, confidence, one-escalation policy, disagreement, timeout, retry/deduplication, circuit breaker, Pending, and cheaper fallback.
- [x] Define benchmark/golden sets, release gates, drift/repeatability/bias checks, rollback, and provider/model substitution.
- [x] Define minimum/pseudonymous payload, retention/training controls, secrets, regional/processor concerns, and logging redaction without invented legal claims.
- [x] Define per-capability token/audio/model cost accounting and cost per useful productive evidence unit, budgets/alerts, and upgrade triggers using current official pricing.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — This stage owns variable model-cost measurement and must include cheaper/provider-independent fallbacks, not a speculative fixed euro budget.
- [x] Security/privacy/rights — Own secrets, payload minimization, redaction, provider data-use settings, and no hidden model-training contribution.
- [x] Accessibility — Generated feedback must preserve structured semantics and never replace required text alternatives.
- [x] Failure/recovery — Timeout/low confidence/outage becomes Pending or deterministic fallback and does not block unrelated work.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include AI capability/routing matrix.
- [x] Include Gateway/evaluation sequence diagrams.
- [x] Include Schema/version/confidence contract.
- [x] Include Benchmark/release gate table.
- [x] Include Provider/price/exit comparison with official links/access dates.
- [x] Include Cost/fallback/circuit-breaker table.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- AI outputs are structured evaluator/content inputs, not the source of evidence truth or readiness policy.
- No always-on or per-click premium AI.
- Do not reopen: deterministic readiness/scoring/planning.
- Do not reopen: one escalation default ceiling.
- Do not reopen: runtime generation exceptional.
- Do not reopen: minimum necessary AI data.

**Done when:** Every Stage 19 owned decision is traceable and unambiguous in `Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 20. Account, Local-First Use, Profile, Sync, Export, and Deletion

**Required prior stages:** 03, 04, 05, 06, 12, 13, 14  
**Prompt:** `prompts/architecture/20_define_account_local_first_profile_sync_export_and_deletion.txt`  
**Output:** `Architecture/20-account-local-first-profile-sync-export-and-deletion.md`  
**Major downstream consumers:** Stages 21–26, 28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/02-complete-learner-journey.md`
- `m-elsharkawi/Bestehen-Shaping/app/04-learner-model.md`
- `m-elsharkawi/Bestehen-Shaping/app/19-information-architecture-and-core-screens.md`
- `m-elsharkawi/Bestehen-Shaping/app/22-user-controls-vs-coach-autonomy.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-Shaping/app/25-business-model-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html landing and Data & deletion`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html Flow G`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define account-optional first use, anonymous/local identity, device identity, local-loss messaging, and what features work before sign-in.
- [x] Compare/select identity provider and sign-in/recovery strategy with portability, cost, privacy, and exit path.
- [x] Separate profile/preferences/schedule from derived evidence/readiness and define authorization/ownership boundaries.
- [x] Define anonymous-to-account adoption without duplicate evidence, multi-device sync, merge/conflict/tombstone rules, and idempotency.
- [x] Define human-readable/machine-readable export contents/versioning and full deletion orchestration across primary data, jobs, caches, providers, backups, and raw media.
- [x] Define account/provider migration, local reset, device loss, and recovery limitations honestly.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Research current identity pricing/limits, prefer a simple low-maintenance baseline, and document migration/cheaper fallback.
- [x] Security/privacy/rights — Define session/token handling, authorization, account takeover protections proportionate to scope, and deletion proof.
- [x] Accessibility — Sign-in/recovery/export/delete flows must be keyboard/screen-reader/reflow complete and avoid inaccessible CAPTCHA dependency where possible.
- [x] Failure/recovery — Sync/account/provider failure preserves local work; merge cannot duplicate evidence; deletion partial failure remains auditable/retryable.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Identity/account state diagram.
- [x] Include Anonymous adoption and sync sequences.
- [x] Include Data/profile ownership matrix.
- [x] Include Conflict/merge/deduplication table.
- [x] Include Export contract.
- [x] Include Deletion orchestration/proof flow and provider comparison.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/20-account-local-first-profile-sync-export-and-deletion.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- No account wall for core first use.
- Learners cannot edit derived evidence truth through profile/sync/export mechanisms.
- Do not reopen: account optionality.
- Do not reopen: export/delete rights.
- Do not reopen: raw audio excluded after deletion/finalization.
- Do not reopen: profile cannot rewrite derived truth.

**Done when:** Every Stage 20 owned decision is traceable and unambiguous in `Architecture/20-account-local-first-profile-sync-export-and-deletion.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 21. Offline, Checkpointing, Recovery, Conflicts, and Timing Integrity

**Required prior stages:** 05, 06, 08, 12, 13, 14, 16, 17, 18, 20  
**Prompt:** `prompts/architecture/21_define_offline_checkpointing_recovery_conflicts_and_timing_integrity.txt`  
**Output:** `Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`  
**Major downstream consumers:** Stages 22–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/02-complete-learner-journey.md`
- `m-elsharkawi/Bestehen-Shaping/app/06-daily-coaching-engine.md`
- `m-elsharkawi/Bestehen-Shaping/app/07-core-learning-loop.md`
- `m-elsharkawi/Bestehen-Shaping/app/12-writing-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/13-speaking-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/22-user-controls-vs-coach-autonomy.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html offline Writing/mock interruption`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html Flows D, F, G`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §3.7`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/16-listening-audio-tts-and-media-delivery.md`
- `m-elsharkawi/Bestehen-App/Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/20-account-local-first-profile-sync-export-and-deletion.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define capability-based offline matrix for loaded objective work, Writing, Listening, Speaking, productive evaluation, mocks, readiness, sync, and content fetch.
- [x] Decide service worker/PWA scope from evidence, browser limitations, cache invalidation, and operating cost rather than installability theater.
- [x] Define checkpoints, local queue, reconnect, retry/idempotency, merge/conflict/tombstone behavior, and explicit data-loss bounds per activity.
- [x] Define authoritative monotonic/wall-clock use, server timestamps, timer reconstruction, page backgrounding, sleep/device-clock changes, and honest timing labels.
- [x] Define interruption/resume choices and the smallest affected evidence scope for ordinary tasks, continuous blocks, and mocks.
- [x] Define recovery UI/domain states and transitions for crash, reload, network loss, provider outage, stale content/version, and local-storage loss.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Use browser/local primitives and a simple queue before dedicated offline-sync infrastructure; state storage/egress/cache drivers.
- [x] Security/privacy/rights — Protect local sensitive data, bound cache retention, and avoid exposing raw audio/content in uncontrolled caches.
- [x] Accessibility — Recovery choices, timer state, and offline notices remain semantically announced and operable.
- [x] Failure/recovery — Reconnection cannot duplicate evidence; background/pause conditions cannot silently retain target validity.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Offline capability matrix.
- [x] Include Checkpoint/queue/reconnect state diagram.
- [x] Include Timer integrity model and threat/failure table.
- [x] Include Conflict-resolution matrix.
- [x] Include Mock interruption/resume sequence.
- [x] Include Data-loss budgets and recovery UI contract.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Full offline parity is not launch scope; continuity of already-started work is.
- Recovery preserves learner work before preserving a clean mock label.
- Do not reopen: already-loaded continuity launch boundary.
- Do not reopen: honest timer/evidence conditions.
- Do not reopen: local failure cannot globally block the App.

**Done when:** Every Stage 21 owned decision is traceable and unambiguous in `Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 22. Notifications, Scheduling, and Time Zones

**Required prior stages:** 05, 08, 12, 13, 14, 20, 21  
**Prompt:** `prompts/architecture/22_define_notifications_scheduling_and_time_zones.txt`  
**Output:** `Architecture/22-notifications-scheduling-and-time-zones.md`  
**Major downstream consumers:** Stages 23–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/02-complete-learner-journey.md`
- `m-elsharkawi/Bestehen-Shaping/app/06-daily-coaching-engine.md`
- `m-elsharkawi/Bestehen-Shaping/app/14-review-and-spaced-repetition.md`
- `m-elsharkawi/Bestehen-Shaping/app/17-ready-to-book-logic.md`
- `m-elsharkawi/Bestehen-Shaping/app/22-user-controls-vs-coach-autonomy.md`
- `m-elsharkawi/Bestehen-Shaping/app/23-exam-date-and-urgency.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html goal/date surfaces`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html notification examples/open-decision reconciliation`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §7 item 4`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/20-account-local-first-profile-sync-export-and-deletion.md`
- `m-elsharkawi/Bestehen-App/Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Model schedule preferences, local time zone, quiet hours, travel/time-zone changes, target month/range, planned date, booked date, milestones, and post-exam state.
- [x] Define in-app versus web-push/email/other reminder transport selection and permission lifecycle with current browser/provider research.
- [x] Implement conceptual reminder types, grouped obligations, one/day and rolling-seven-day caps, booked-period cap, exam-day exception, deduplication, suppression, and ignored-reminder behavior.
- [x] Define background-job scheduling, DST/calendar/time-zone semantics, delivery windows, stale-job cancellation, idempotency, and multi-device duplication prevention.
- [x] Define reviewed template/reason data rather than model-generated engagement copy and preserve learner opt-out/control.
- [x] Define privacy/retention/export/delete behavior for schedules, notification endpoints, delivery logs, and exam dates.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Research official provider/browser limits and prefer in-app/local/simple scheduled delivery with a cheaper fallback.
- [x] Security/privacy/rights — Protect endpoints, tokens, dates, and message contents; avoid exposing sensitive performance details on lock screens by default.
- [x] Accessibility — Notification settings/copy and in-app equivalents must remain accessible and understandable.
- [x] Failure/recovery — Late/duplicate/disabled/unavailable delivery causes no missed-day penalty or backlog and stale jobs are cancelled.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Schedule/date/notification model.
- [x] Include Delivery/suppression state diagram.
- [x] Include Reminder cap/deduplication matrix.
- [x] Include Time-zone/DST examples.
- [x] Include Transport/provider alternative and cost table.
- [x] Include Permission/privacy/failure contract.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/22-notifications-scheduling-and-time-zones.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Notifications protect useful preparation decisions; they never exist only for engagement.
- Push is convenience; all urgency/scheduling behavior remains available in-app.
- Do not reopen: notification caps and tone guardrails.
- Do not reopen: 60/30/21/7 planning milestones.
- Do not reopen: date never changes readiness.
- Do not reopen: no streak/nagging reminders.

**Done when:** Every Stage 22 owned decision is traceable and unambiguous in `Architecture/22-notifications-scheduling-and-time-zones.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 23. Security, Privacy, Rights, Retention, and Threat Model

**Required prior stages:** 02, 03, 04, 05, 06, 09, 10, 12, 16, 17, 18, 19, 20, 21, 22  
**Prompt:** `prompts/architecture/23_define_security_privacy_rights_retention_and_threat_model.txt`  
**Output:** `Architecture/23-security-privacy-rights-retention-and-threat-model.md`  
**Major downstream consumers:** Stages 24–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/01-product-thesis.md`
- `m-elsharkawi/Bestehen-Shaping/app/04-learner-model.md`
- `m-elsharkawi/Bestehen-Shaping/app/05-mistake-memory.md`
- `m-elsharkawi/Bestehen-Shaping/app/12-writing-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/13-speaking-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/15-telc-readiness.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/22-user-controls-vs-coach-autonomy.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-Shaping/app/25-business-model-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/12-corpus-app-contract.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/17-bestehen-corpus-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §§3.6–3.7`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-02-Mobile-Screens.dc.html Act 5/Data & deletion`
- `m-elsharkawi/Bestehen-App/Design/Bestehen Logo/Bestehen Logo System.dc.html licensing/trademark notes`
- `m-elsharkawi/Bestehen-App/Architecture/02-system-context-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/10-corpus-integration-compatibility-cache-and-rights.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/16-listening-audio-tts-and-media-delivery.md`
- `m-elsharkawi/Bestehen-App/Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md`
- `m-elsharkawi/Bestehen-App/Architecture/20-account-local-first-profile-sync-export-and-deletion.md`
- `m-elsharkawi/Bestehen-App/Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`
- `m-elsharkawi/Bestehen-App/Architecture/22-notifications-scheduling-and-time-zones.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Create end-to-end data-flow inventory and threat model for anonymous/local use, accounts, sync, content, Corpus publication, AI/STT/TTS, notifications, analytics, operator access, and deletion.
- [x] Define authentication/authorization, trust boundaries, secrets/key rotation, encryption, headers/session security, abuse/rate limits, and audit logging proportionate to private/public scope.
- [x] Define data minimization/purpose, pseudonymous external calls, provider/processor boundaries, redaction, and no hidden model-training contribution.
- [x] Define retention for structured evidence, Writing, transcripts, raw audio, analytics/logs, exports, deletion tombstones, backups, and third-party copies.
- [x] Define rights-aware serving, attribution, asset access, takedown/quarantine, anti-copy, and source-expression leakage controls.
- [x] Define dependency/supply-chain, content/prompt injection, malicious uploads, cost abuse, incident expectations, and public-launch hardening triggers without asserting legal compliance.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Security controls must be proportionate but consequential data/rights protections cannot be traded away for cost.
- [x] Security/privacy/rights — This stage is the primary owner; cite current official security guidance and separate architecture from later jurisdiction-specific legal review.
- [x] Accessibility — Security/consent/delete/auth controls cannot create inaccessible core flows or silently penalize access needs.
- [x] Failure/recovery — Partial deletion, provider outage, incident, rights revocation, and key compromise have explicit containment/retry/audit behavior.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Threat model/data-flow diagrams.
- [x] Include Data/processor/retention matrix.
- [x] Include Authorization/secrets/control table.
- [x] Include Rights/takedown flow.
- [x] Include Abuse/supply-chain risk register.
- [x] Include Incident and public-hardening trigger table.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/23-security-privacy-rights-retention-and-threat-model.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Raw audio is ephemeral and pending retention is capped at seven days.
- No unauthorized source redistribution, invasive replay, advertising, or data sale.
- Do not reopen: account optionality.
- Do not reopen: minimum AI payload.
- Do not reopen: raw-audio deletion.
- Do not reopen: rights-aware content serving.
- Do not reopen: no legal compliance claims.

**Done when:** Every Stage 23 owned decision is traceable and unambiguous in `Architecture/23-security-privacy-rights-retention-and-threat-model.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 24. Analytics, Calibration, Observability, Performance, Reliability, and Cost

**Required prior stages:** 01, 03, 05, 06, 07, 08, 09, 11, 12, 16, 17, 18, 19, 20, 21, 22, 23  
**Prompt:** `prompts/architecture/24_define_analytics_calibration_observability_performance_reliability_and_cost.txt`  
**Output:** `Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md`  
**Major downstream consumers:** Stages 25–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/01-product-thesis.md`
- `m-elsharkawi/Bestehen-Shaping/app/04-learner-model.md`
- `m-elsharkawi/Bestehen-Shaping/app/05-mistake-memory.md`
- `m-elsharkawi/Bestehen-Shaping/app/06-daily-coaching-engine.md`
- `m-elsharkawi/Bestehen-Shaping/app/11-listening-training.md`
- `m-elsharkawi/Bestehen-Shaping/app/12-writing-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/13-speaking-coaching.md`
- `m-elsharkawi/Bestehen-Shaping/app/14-review-and-spaced-repetition.md`
- `m-elsharkawi/Bestehen-Shaping/app/15-telc-readiness.md`
- `m-elsharkawi/Bestehen-Shaping/app/16-mock-exams.md`
- `m-elsharkawi/Bestehen-Shaping/app/20-progress-and-motivation.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/23-exam-date-and-urgency.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-Shaping/app/25-business-model-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-03-Desktop-Responsive.dc.html evidence audit`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html recovery/acceptance coverage`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md failure/latency assumptions`
- `m-elsharkawi/Bestehen-App/Architecture/01-architecture-charter-and-quality-attributes.md`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/07-learner-model-mistake-memory-progression-and-review.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/16-listening-audio-tts-and-media-delivery.md`
- `m-elsharkawi/Bestehen-App/Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md`
- `m-elsharkawi/Bestehen-App/Architecture/20-account-local-first-profile-sync-export-and-deletion.md`
- `m-elsharkawi/Bestehen-App/Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`
- `m-elsharkawi/Bestehen-App/Architecture/22-notifications-scheduling-and-time-zones.md`
- `m-elsharkawi/Bestehen-App/Architecture/23-security-privacy-rights-retention-and-threat-model.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define lean product/evidence/quality/cost event catalog, purpose, schemas, sampling, retention, privacy, and frozen prediction/readiness snapshots.
- [x] Specify DSRA, Useful Session Outcome, transfer/retention, evaluator/content quality, mock-to-real, calibration, and cost metrics without circular validation.
- [x] Define calibration datasets, versioning, backtesting, sample-size disclosure, drift/recalibration gates, and pass-probability activation boundary.
- [x] Define logs/metrics/traces/correlation/redaction, dashboards, alerts, SLO-style internal targets, incident evidence, and no invasive session replay.
- [x] Consolidate L0–L3 latency, autosave/data-loss, availability/degradation, media/AI reliability, capacity, and storage/model/media cost budgets.
- [x] Define measured upgrade/scale triggers and per-capability cost per useful productive evidence unit for a personal-project operating baseline.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Own consolidated cost measurement, budgets/alerts, provider/media/storage drivers, and progressive upgrade triggers without inventing owner budget.
- [x] Security/privacy/rights — Minimize telemetry, redact sensitive content/audio, control access/retention, and avoid demographic collection without purpose.
- [x] Accessibility — Measure technical/accessibility invalidation and latency fairness without tracking disability unnecessarily.
- [x] Failure/recovery — Observability must distinguish learner outcome from content/media/evaluator/system failure and support targeted recomputation/incidents.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Event/metric catalog.
- [x] Include Calibration data-flow and frozen-snapshot model.
- [x] Include Observability/redaction matrix.
- [x] Include Performance/reliability budget table.
- [x] Include Capacity/cost model and alert/upgrade triggers.
- [x] Include Dashboard/operating baseline.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Product evidence is not clickstream analytics; invalid attempts are excluded from learner metrics.
- No warehouse, pass probability, always-on AI analytics, or fake precision before data justifies it.
- Do not reopen: DSRA north star.
- Do not reopen: Useful Session Outcome.
- Do not reopen: frozen prediction snapshots.
- Do not reopen: lean event set.
- Do not reopen: no circular calibration.

**Done when:** Every Stage 24 owned decision is traceable and unambiguous in `Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 25. Testing, Evaluation, and Quality Gates

**Required prior stages:** 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24  
**Prompt:** `prompts/architecture/25_define_testing_evaluation_and_quality_gates.txt`  
**Output:** `Architecture/25-testing-evaluation-and-quality-gates.md`  
**Major downstream consumers:** Stages 26–28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/All `app/01-*.md` through `app/28-*.md`, with special focus on Stages 15, 16, 17, 21, 24, 26, and 27`
- `m-elsharkawi/Bestehen-Shaping/corpus/12-corpus-app-contract.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/17-bestehen-corpus-product-specification.md`
- `m-elsharkawi/Bestehen-App/All human-authored design files; especially `Design/Bestehen-04-Flows-Handoff.dc.html` accessibility/coverage and `Design/DESIGN-HANDOFF.md` acceptance criteria`
- `m-elsharkawi/Bestehen-App/Architecture/01-architecture-charter-and-quality-attributes.md`
- `m-elsharkawi/Bestehen-App/Architecture/02-system-context-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/07-learner-model-mistake-memory-progression-and-review.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/10-corpus-integration-compatibility-cache-and-rights.md`
- `m-elsharkawi/Bestehen-App/Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/15-reading-and-language-elements-runtime.md`
- `m-elsharkawi/Bestehen-App/Architecture/16-listening-audio-tts-and-media-delivery.md`
- `m-elsharkawi/Bestehen-App/Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md`
- `m-elsharkawi/Bestehen-App/Architecture/20-account-local-first-profile-sync-export-and-deletion.md`
- `m-elsharkawi/Bestehen-App/Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`
- `m-elsharkawi/Bestehen-App/Architecture/22-notifications-scheduling-and-time-zones.md`
- `m-elsharkawi/Bestehen-App/Architecture/23-security-privacy-rights-retention-and-threat-model.md`
- `m-elsharkawi/Bestehen-App/Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md`

### Decisions and checks

- [x] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [x] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [x] Define test strategy/pyramid by domain, contract, persistence, UI, browser/device, content, evaluator, media, security, recovery, performance, and operations layers.
- [x] Specify invariant/property/model/state-machine tests for evidence, scoring, Readiness, Ready-to-Book, Mistake Memory, review, coaching, idempotency, and timing.
- [x] Define contract/compatibility/migration/backup/restore tests for App, Corpus bundles, APIs, jobs, local sync, and deletion.
- [x] Define golden forms/content QA plus Writing evaluator, Speaking evaluator, STT, TTS/audio, and partner benchmark/release gates.
- [x] Define WCAG/manual/automated, keyboard/screen-reader, 320px/200%, responsive, browser/device, offline/recovery, timer, security, privacy, rights, and cost-regression tests.
- [x] Assign release-blocking versus advisory gates, test data/privacy, ownership, evidence artifacts, flake policy, and exception process.
- [x] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [x] Cost/sustainability — Use risk-based automation; benchmark model/media costs and catch cost regressions in release gates.
- [x] Security/privacy/rights — Include abuse, auth, secrets, injection, dependency, rights, export/delete, and privacy tests.
- [x] Accessibility — Own automated plus manual assistive-technology release gates for all core flows.
- [x] Failure/recovery — Test every recovery/Pending/partial/not_counted path, duplicate delivery, and targeted recomputation.
- [x] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [x] Include Test strategy and ownership matrix.
- [x] Include Invariant/property/state-machine catalog.
- [x] Include Benchmark/golden-set gate table.
- [x] Include Accessibility/browser/device test matrix.
- [x] Include Release-blocking quality gate table.
- [x] Include Test-data/privacy and evidence-retention plan.
- [x] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [x] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [x] Create/update the exact deliverable `Architecture/25-testing-evaluation-and-quality-gates.md` and re-fetch it plus this checklist before final completion.
- [x] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Tests must prove consequential learner claims, not only code coverage.
- A quality gate cannot be waived merely because productive evidence is costlier than objective scoring.
- Do not reopen: WCAG/build-completeness rule.
- Do not reopen: no misleading partial readiness.
- Do not reopen: gold/P4 higher quality bar.
- Do not reopen: all five skills share foundations.

**Done when:** Every Stage 25 owned decision is traceable and unambiguous in `Architecture/25-testing-evaluation-and-quality-gates.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 26. Environments, CI/CD, Release, and Operations

**Required prior stages:** 03, 05, 10, 12, 19, 20, 21, 22, 23, 24, 25  
**Prompt:** `prompts/architecture/26_define_environments_ci_cd_release_and_operations.txt`  
**Output:** `Architecture/26-environments-ci-cd-release-and-operations.md`  
**Major downstream consumers:** Stages 27 and 28.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/app/21-content-strategy.md`
- `m-elsharkawi/Bestehen-Shaping/app/23-exam-date-and-urgency.md`
- `m-elsharkawi/Bestehen-Shaping/app/24-analytics-and-success-metrics.md`
- `m-elsharkawi/Bestehen-Shaping/app/25-business-model-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-Shaping/app/26-platform-accessibility-nonfunctional.md`
- `m-elsharkawi/Bestehen-App/Design/Bestehen-04-Flows-Handoff.dc.html #h (build order is illustrative, not binding)`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md §8`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/10-corpus-integration-compatibility-cache-and-rights.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md`
- `m-elsharkawi/Bestehen-App/Architecture/20-account-local-first-profile-sync-export-and-deletion.md`
- `m-elsharkawi/Bestehen-App/Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`
- `m-elsharkawi/Bestehen-App/Architecture/22-notifications-scheduling-and-time-zones.md`
- `m-elsharkawi/Bestehen-App/Architecture/23-security-privacy-rights-retention-and-threat-model.md`
- `m-elsharkawi/Bestehen-App/Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md`
- `m-elsharkawi/Bestehen-App/Architecture/25-testing-evaluation-and-quality-gates.md`

### Decisions and checks

- [ ] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [ ] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [ ] Define local/dev/preview/staging/production topology and realistic private-project separation, data/configuration isolation, seeded test data, and access.
- [ ] Define configuration/secrets, migration/deploy order, artifact builds, CI checks, provenance, dependency updates, and environment promotion.
- [ ] Define feature flags and independent releases for application, schema, Corpus bundles, content/forms, blueprints, prompts/evaluators/models, and calibration parameters.
- [ ] Define backward compatibility, rollback/roll-forward, cache invalidation, queued-job compatibility, and partial release behavior.
- [ ] Define backups/restore drills, scheduled jobs, monitoring/alerts, incident/runbook expectations, maintenance, and low-ops ownership.
- [ ] Define safe phased implementation/deployment slices that do not publish misleading partial Readiness or unsupported P4 claims.
- [ ] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [ ] Cost/sustainability — Document idle/preview/staging/backup/observability costs and a minimal low-ops baseline with scale triggers.
- [ ] Security/privacy/rights — Protect environments/secrets/artifacts, separate production data, and audit privileged releases.
- [ ] Accessibility — Accessibility/browser/device gates run before promotion and cannot be deferred as polish.
- [ ] Failure/recovery — Define failed deploy/migration/job/content/model release recovery and compatibility during rollback.
- [ ] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [ ] Include Environment/deployment diagram.
- [ ] Include CI/CD and promotion flow.
- [ ] Include Release-unit/version compatibility matrix.
- [ ] Include Migration/rollback sequence.
- [ ] Include Backup/restore/runbook catalog.
- [ ] Include Feature-flag/phased-release safety table.
- [ ] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [ ] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [ ] Create/update the exact deliverable `Architecture/26-environments-ci-cd-release-and-operations.md` and re-fetch it plus this checklist before final completion.
- [ ] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Release units carry versions and targeted revalidation; blueprint/evaluator changes never silently reinterpret history.
- Avoid enterprise process/infrastructure without a personal-project requirement.
- Do not reopen: complete product can be phased.
- Do not reopen: no misleading readiness during partial rollout.
- Do not reopen: separate content/model/blueprint versioning.

**Done when:** Every Stage 26 owned decision is traceable and unambiguous in `Architecture/26-environments-ci-cd-release-and-operations.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 27. End-to-End Architecture Validation

**Required prior stages:** 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26  
**Prompt:** `prompts/architecture/27_validate_end_to_end_architecture.txt`  
**Output:** `Architecture/27-end-to-end-architecture-validation.md`  
**Major downstream consumers:** Stage 28 only.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/All App product Markdown files, especially `app/27-end-to-end-scenario-validation.md` and `app/28-bestehen-app-product-specification.md``
- `m-elsharkawi/Bestehen-Shaping/corpus/12-corpus-app-contract.md`
- `m-elsharkawi/Bestehen-Shaping/corpus/17-bestehen-corpus-product-specification.md`
- `m-elsharkawi/Bestehen-App/All human-authored design files, including Flows A–G, 12 recovery situations, screen coverage, responsive and accessibility contracts`
- `m-elsharkawi/Bestehen-App/Architecture/01-architecture-charter-and-quality-attributes.md`
- `m-elsharkawi/Bestehen-App/Architecture/02-system-context-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/07-learner-model-mistake-memory-progression-and-review.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/10-corpus-integration-compatibility-cache-and-rights.md`
- `m-elsharkawi/Bestehen-App/Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/15-reading-and-language-elements-runtime.md`
- `m-elsharkawi/Bestehen-App/Architecture/16-listening-audio-tts-and-media-delivery.md`
- `m-elsharkawi/Bestehen-App/Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md`
- `m-elsharkawi/Bestehen-App/Architecture/20-account-local-first-profile-sync-export-and-deletion.md`
- `m-elsharkawi/Bestehen-App/Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`
- `m-elsharkawi/Bestehen-App/Architecture/22-notifications-scheduling-and-time-zones.md`
- `m-elsharkawi/Bestehen-App/Architecture/23-security-privacy-rights-retention-and-threat-model.md`
- `m-elsharkawi/Bestehen-App/Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md`
- `m-elsharkawi/Bestehen-App/Architecture/25-testing-evaluation-and-quality-gates.md`
- `m-elsharkawi/Bestehen-App/Architecture/26-environments-ci-cd-release-and-operations.md`

### Decisions and checks

- [ ] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [ ] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [ ] Validate all prior architecture documents against the nine product scenarios and design Flows A–G with concrete component/state/data/API/failure paths.
- [ ] Build a cross-stage failure/recovery matrix for AI, audio, microphone, network, browser, content, evaluator, Corpus, identity, notification, storage, and deployment failures.
- [ ] Walk through threat, privacy, rights, retention/deletion, accessibility, cost, latency, timing, idempotency, and operability for each consequential scenario.
- [ ] Detect contradictory ownership, duplicate truth, missing state, circular dependency, version gap, hidden live dependency, and implementation invention.
- [ ] Amend earlier architecture documents and ADRs only where evidence requires it, recording every amendment and checklist impact.
- [ ] Answer every architecture-completeness question from the master plan and prove each product/design invariant has an owner and test.
- [ ] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [ ] Cost/sustainability — Validate variable-cost bounds and low-cost fallbacks in every productive/media/provider path.
- [ ] Security/privacy/rights — Validate end-to-end data minimization, rights, deletion, processor, auth, and incident paths.
- [ ] Accessibility — Validate equal completion/evidence paths for all seven design flows and representative skill tasks.
- [ ] Failure/recovery — Prove unaffected scope survives and no system fault becomes learner failure in every representative case.
- [ ] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [ ] Include Scenario walkthrough matrix.
- [ ] Include Failure/recovery matrix.
- [ ] Include Cross-stage consistency/ownership audit.
- [ ] Include Threat/cost/latency/privacy/accessibility walkthroughs.
- [ ] Include Amendment log and residual risk register.
- [ ] Include Go/no-go definition-of-done result.
- [ ] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [ ] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [ ] Create/update the exact deliverable `Architecture/27-end-to-end-architecture-validation.md` and re-fetch it plus this checklist before final completion.
- [ ] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- Validation introduces no new readiness/model formula or feature scope.
- Final specification cannot begin while a consequential gap remains unresolved or explicitly owner-blocked.
- Do not reopen: product scope or target.
- Do not reopen: Stage 27 precedence.
- Do not reopen: all accepted ADRs unless validation demonstrates a contradiction.

**Done when:** Every Stage 27 owned decision is traceable and unambiguous in `Architecture/27-end-to-end-architecture-validation.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.

---

## 28. Final Architecture Specification and Implementation Roadmap

**Required prior stages:** 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27  
**Prompt:** `prompts/architecture/28_produce_final_architecture_specification_and_implementation_roadmap.txt`  
**Output:** `Architecture/28-bestehen-app-architecture-specification.md`  
**Major downstream consumers:** Implementation planning and later feature agents.

### Required inputs

- `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`
- `m-elsharkawi/Bestehen-App/Design/DESIGN-HANDOFF.md`
- `m-elsharkawi/Bestehen-App/Architecture/00-architecture-shaping-plan.md`
- `m-elsharkawi/Bestehen-App/Bestehen_App_Architecture_Checklist.md`
- `m-elsharkawi/Bestehen-Shaping/Every current App Markdown source, product overview, identity, live product checklist, both Corpus contract/final documents, and the final product specification`
- `m-elsharkawi/Bestehen-App/Every human-authored design `.dc.html`, `Design/DESIGN-HANDOFF.md`, logo system, and typography decision; `support.js` only as renderer context`
- `m-elsharkawi/Bestehen-App/Architecture/01-architecture-charter-and-quality-attributes.md`
- `m-elsharkawi/Bestehen-App/Architecture/02-system-context-and-product-boundaries.md`
- `m-elsharkawi/Bestehen-App/Architecture/03-technology-stack-and-repository-strategy.md`
- `m-elsharkawi/Bestehen-App/Architecture/04-domain-model-and-bounded-contexts.md`
- `m-elsharkawi/Bestehen-App/Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `m-elsharkawi/Bestehen-App/Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `m-elsharkawi/Bestehen-App/Architecture/07-learner-model-mistake-memory-progression-and-review.md`
- `m-elsharkawi/Bestehen-App/Architecture/08-coaching-engine-and-session-state-machines.md`
- `m-elsharkawi/Bestehen-App/Architecture/09-content-exercise-form-and-media-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/10-corpus-integration-compatibility-cache-and-rights.md`
- `m-elsharkawi/Bestehen-App/Architecture/11-readiness-scoring-mocks-and-ready-to-book.md`
- `m-elsharkawi/Bestehen-App/Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `m-elsharkawi/Bestehen-App/Architecture/13-frontend-application-and-design-system-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/14-responsive-accessibility-browser-and-device-architecture.md`
- `m-elsharkawi/Bestehen-App/Architecture/15-reading-and-language-elements-runtime.md`
- `m-elsharkawi/Bestehen-App/Architecture/16-listening-audio-tts-and-media-delivery.md`
- `m-elsharkawi/Bestehen-App/Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`
- `m-elsharkawi/Bestehen-App/Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md`
- `m-elsharkawi/Bestehen-App/Architecture/20-account-local-first-profile-sync-export-and-deletion.md`
- `m-elsharkawi/Bestehen-App/Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`
- `m-elsharkawi/Bestehen-App/Architecture/22-notifications-scheduling-and-time-zones.md`
- `m-elsharkawi/Bestehen-App/Architecture/23-security-privacy-rights-retention-and-threat-model.md`
- `m-elsharkawi/Bestehen-App/Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md`
- `m-elsharkawi/Bestehen-App/Architecture/25-testing-evaluation-and-quality-gates.md`
- `m-elsharkawi/Bestehen-App/Architecture/26-environments-ci-cd-release-and-operations.md`
- `m-elsharkawi/Bestehen-App/Architecture/27-end-to-end-architecture-validation.md`

### Decisions and checks

- [ ] Fetch every required input from `main`, record current blob SHA/commit, and reconcile prior-stage continuity before deciding.
- [ ] Apply source authority and Stage 27 precedence; record exact-path contradictions rather than editing shaping/design sources.
- [ ] Consolidate Stages 01–27 into one authoritative implementation-facing architecture without erasing detailed stage rationale.
- [ ] Produce C4 context/container/component/deployment views plus module, data, state, contract, job, trust, and release ownership maps.
- [ ] State authoritative decisions, accepted ADR index/status, versions, compatibility, failure/recovery, security/privacy/rights, accessibility, performance/reliability, operations, and cost requirements.
- [ ] Create dependency-aware phased implementation slices that exercise vertical evidence truth and never expose misleading partial Readiness.
- [ ] Create critical path, risk register, validation/upgrade triggers, intentionally deferred implementation choices, and owner questions.
- [ ] Audit complete product → design → architecture → implementation traceability and final definition of done.
- [ ] Compare credible alternatives, include the simplest sufficient option, document the recommendation/rationale/consequences, and define exit or fallback paths.
- [ ] Cost/sustainability — Include realistic launch/usage cost drivers, measurement, alerts, fallbacks, and upgrade triggers; do not invent owner budget.
- [ ] Security/privacy/rights — Consolidate the full threat/privacy/rights/retention/export/deletion contract and required later legal review.
- [ ] Accessibility — Consolidate WCAG/responsive/browser/device acceptance and test ownership as implementation requirements.
- [ ] Failure/recovery — Consolidate Pending/partial/interrupted/not_counted/recovery semantics and operational runbooks.
- [ ] Define data, API, state, ownership, compatibility, and versioning implications at this stage's boundary.
- [ ] Include Authoritative architecture specification.
- [ ] Include C4 and supporting architecture diagrams.
- [ ] Include Module/state/data/API/job/deployment ownership tables.
- [ ] Include ADR index.
- [ ] Include Phased implementation roadmap and critical path.
- [ ] Include Risk/decision/traceability/definition-of-done audit.
- [ ] Create or update ADRs only for consequential durable choices; record status, alternatives, traceability, consequences, and review trigger.
- [ ] Map decisions to product/design sources and downstream stages; list dependencies, risks, validation needs, upgrade triggers/fallbacks, and intentionally deferred implementation choices.
- [ ] Create/update the exact deliverable `Architecture/28-bestehen-app-architecture-specification.md` and re-fetch it plus this checklist before final completion.
- [ ] Leave any true owner blocker unchecked with `Blocked — owner decision required:`; do not mark architecture/implementation work complete merely because it was discussed.

### Must preserve / must not reopen

- The final document consolidates; it does not silently supersede unresolved details or invent new product behavior.
- Implementation phasing cannot remove pass-critical Writing/Oral evidence or weaken truth/accessibility/recovery.
- Do not reopen: accepted product/design truth.
- Do not reopen: validated earlier architecture decisions except through an explicit superseding ADR.

**Done when:** Every Stage 28 owned decision is traceable and unambiguous in `Architecture/28-bestehen-app-architecture-specification.md`; required views, alternatives, cross-cutting impacts, ADRs, validation, and handoff are complete; and each checkbox is checked or carries a precise blocking note.


---

## Complete architecture definition of done

- [ ] Every product state has one authoritative domain owner and every design state is produced from explicit domain/API state rather than UI guesswork.
- [ ] Evidence, validity, assistance, timing, freshness, exposure, mock, evaluator, blueprint, calculation, and failure semantics are versioned, explainable, and auditable.
- [ ] Written and Oral remain independent pass gates; missing Readiness is absence rather than zero; no prohibited pass-probability field/model/template/event exists.
- [ ] Safe, Ready to Book, and stale/contradicted behavior are distinct; all Stage 17 gates and reason states survive API/UI projection.
- [ ] All five skills share attempt/session/result/repair/evidence foundations while Reading/Language Elements, Listening, Writing, and Speaking preserve valid modality differences.
- [ ] The complete Mistake Memory lifecycle, local P0–P4 progression, due review, fresh retry, delayed transfer, and retention semantics have owned deterministic projections.
- [ ] Normal practice and approved P4 content work when Corpus is unavailable; no learner data is sent to Corpus; rights and confidence remain separate.
- [ ] Routine objective work is deterministic/pre-generated/cached; Writing/Speaking AI is structured, bounded, benchmarked, costed, and has Pending/deterministic fallbacks.
- [ ] Account-optional first use, anonymous adoption, sync/conflict, privacy, retention, export, deletion, raw-audio ephemerality, and provider cleanup work end to end.
- [ ] WCAG 2.2 AA, fixed responsive behavior, browser/device capability, keyboard/screen-reader equivalence, 200% zoom, 320px reflow, reduced motion, and text alternatives are architecturally supported and release-gated.
- [ ] Offline/loaded-work continuity, checkpointing, timer integrity, interruption, resume, idempotency, local degradation, partial scope, Pending, and not-counted recovery states are complete.
- [ ] Security, privacy, rights, threat, abuse, dependency, secrets, audit, incident, and no-invented-legal-claim boundaries are documented.
- [ ] Analytics/calibration avoids circular validation and invasive replay; performance, reliability, variable cost, budgets/alerts, fallbacks, and personal-project operations are realistic.
- [ ] Tests and quality gates cover every consequential learner claim, content/evaluator/media benchmark, migration, browser/device/accessibility, failure, cost, and security path.
- [ ] Corpus/App contracts, APIs/jobs/events, schemas, releases, backups, rollback, and compatibility work through version changes and downtime.
- [ ] The nine product scenarios and design Flows A–G survive end-to-end validation with threat/cost/latency/privacy/accessibility/failure walkthroughs.
- [ ] Implementation can be phased without publishing misleading partial Readiness, unsupported P4 claims, or an objective-only product that omits pass-critical Writing/Oral evidence.
- [ ] The final architecture specification includes C4/data/state/deployment views, ADR index, traceability, critical path, phased roadmap, risk register, and no major ad hoc decision left to a feature implementer.
