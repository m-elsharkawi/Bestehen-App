# ADR-0016: Immutable approved content manifests and family independence

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Architecture Stage 09 — Content, Exercise, Form, and Media Architecture
- **Decision IDs:** `ARCH-S09-D01`–`ARCH-S09-D10`
- **Supersedes:** None
- **Superseded by:** None

## Context

Bestehen needs original, reviewed practice from A1 assistance through B1 target conditions while preserving exact rights, accessible delivery, deterministic objective scoring, fresh independent families, and honest evidence repair. Routine App work cannot call Corpus or content-generation AI per click. One mutable “approved item” record, latest asset URLs, or item-ID freshness would make historical attempts unverifiable and allow cosmetic variants, rights changes, or defects to corrupt learner evidence.

Stages 02, 04, 05, and 06 already establish asynchronous Corpus, Content & Forms ownership, PostgreSQL semantic truth/private versioned bytes, immutable attempt/evidence lineage, five validity states, and scoped append-only correction. Stage 09 must provide the corresponding content instrument and serving contract without a CMS, microservice, or event-platform expansion.

## Decision

1. Preserve exactly C0–C4 as content provenance/creation classes. Class is orthogonal to approval, rights eligibility, target currentness, difficulty, evidence role, learner freshness, and Gold status; no dimension implies another.
2. Content & Forms owns stable source/blueprint/brief/task/family identities and immutable content/item/form/media/key/rubric revisions. Publication freezes the exact revision. A material correction creates a successor and historical attempts retain the revision actually seen.
3. Approval decisions are append-only and scoped: Draft/quarantine, Training-approved, Independent-B1 approved, Readiness/P4 approved, Gold benchmark, and withdrawn/retired. Every launch batch receives human review; complete P4/gold forms/assets require human sign-off. Generator output never validates its own key.
4. Routine content follows structured non-reconstructive brief → semantic design → creation → deterministic structure → independent key/rubric validation → naturalness → difficulty/target → anti-copy/family → final media/accessibility → approval → post-publication quality. It is batch-authored/generated, cached, and reused; objective/runtime generation is not normal serving.
5. `content_family_id`, assigned conservatively from scenario/information configuration and answer/interaction path, is the freshness unit. Cosmetic text, option, name/date, or voice changes stay in the family. Exposure is explicit. Immediate retry, delayed transfer, retention, mocks, and booking confirmation retain their Stage 06 occasion meanings and require the appropriate fresh family/form.
6. Every attempt receives a server-authorized immutable serving manifest before start, pinning exact content/item/form/media/key/rubric versions, conditions, approval, rights, and freshness decision. Learner-safe payloads are segregated from server-only keys, rationales, hidden partner inputs, and evaluator-only material.
7. Final media bytes carry digest, immutable object reference, script/transcript/cue, playback, accessibility, derivation, rights, and QA lineage. Rights/attribution is action- and component-scoped; authenticity/confidence stays separate. Restricted source expression never enters normal generation.
8. Quarantine, takedown, target change, or defect stops new serving and appends a scoped impact assertion. Evidence & Capability—not Content & Forms—maps the scope to `partially_valid`, `pending`, or `not_counted` and runs idempotent targeted projection rebuilds. Technical/content/media/accessibility/network/evaluator faults have zero learner penalty. Rights-only withdrawal does not automatically negate learner performance.
9. PostgreSQL stores semantic manifests/audit, private S3-compatible storage holds immutable bytes, and durable relational jobs reconcile impacts. Caches and providers are replaceable. No runtime Corpus dependency, per-click generation, CMS/microservice split, streaming platform, or analytics warehouse is introduced.

## Consequences

### Positive

- Every result resolves to the exact measuring instrument, key/rubric, form, media, target, rights, and approval used.
- Freshness cannot be manufactured by IDs, shuffling, new voices, or elapsed time.
- Rights, QA, accessibility, and target gates fail closed independently and locally.
- A defect repairs only the affected learner-evidence scope; unrelated history survives and the learner receives a fair replacement.
- Objective scoring remains deterministic; productive prompts support multiple valid paths and bounded uncertainty.
- Batch generation/TTS and immutable caching keep routine marginal AI cost near zero while preserving provider exit.

### Negative / trade-offs

- Immutable revisions, family review, manifests, approval history, and impact indexes add metadata and operator discipline.
- Conservative family assignment can temporarily reduce content inventory.
- Human review and P4/gold sign-off constrain launch throughput.
- Server-only answer segregation limits fully offline new-task selection; only preauthorized safe packages may continue.
- Rights/takedown reconciliation requires operational readiness even for a personal project.

## Alternatives considered

1. **Files with tags and one approved flag.** Simplest authoring, but cannot represent orthogonal rights/target/evidence roles, exact version pinning, or audited demotion. Rejected.
2. **Mutable latest item/assets.** Saves storage but silently reinterprets history and makes defect repair unverifiable. Rejected.
3. **Item ID or elapsed time as freshness.** Cheap, but accepts cosmetic variants and memorized answer paths as independent. Rejected.
4. **Embedding similarity as sole authority.** Useful screening, but thresholds are empirical, opaque at edges, and insufficient for interaction/answer-path equivalence. Retained only as review assistance.
5. **Per-click generation for guaranteed novelty.** Creates unreviewed keys/rubrics/media, variable cost, rights leakage, and inconsistent evidence. Rejected except already-shaped C4/rare low-stakes bounded cases.
6. **Global invalidation on any defect.** Operationally easy but destroys unaffected learner truth. Rejected for scoped impact plus conservative superset only when exact scope is unknowable.
7. **Dedicated CMS/content microservice/event stream.** Familiar scaling pattern, disproportionate operations and another source of truth. Rejected until measured monolith/job failure.

## Compatibility, fallback, and exit

- Additive optional metadata is minor-compatible only when old consumers safely deny unknown consequential roles. Changed class/approval/family/rights/serving/impact meaning, required identity, or key/rubric semantics requires a major contract, dual-read/shadow validation, and rollback.
- Fallback is the previous compatible approved bank, broader compatible fresh family, explicit exposed review, reviewed template, or honest unavailable/defer state. It is never a near-duplicate labelled fresh or an unreviewed item labelled P4.
- Providers are replaceable because App owns briefs, revisions, keys/rubrics, approvals, digests and manifests. Export relational metadata/audit plus original immutable bytes through standard PostgreSQL and S3-compatible paths; regenerate only replaceable renditions.

## Validation

Release requires identity/version immutability, promotion authority/state, class-approval-rights-role matrix, deterministic key/productive rubric, human-labelled family, form composition, media integrity/accessibility, restricted-expression/attribution, server-key segregation, cache/offline, quarantine race, takedown, scoped evidence-impact/idempotency, and cost/coverage operational tests. Generation/validator/media/similarity changes run against versioned gold fixtures and shadow releases before promotion.

## Review triggers

Review when measured gold/incident data proves launch QA can safely automate low-stakes Training review; fresh P4 inventory or reviewer throughput blocks independent Written/Oral evidence; family screening errors exceed versioned quality limits; manual impact reconciliation is unsustainable; object/cache/egress costs remain excessive after ordinary optimization; or the modular monolith/durable-job path cannot meet measured publication/quarantine needs. P4/gold sign-off, instrument traceability, original reviewed routine content, fresh-family independence, deterministic objective scoring, and zero learner penalty cannot be weakened without a superseding product decision and ADR.

## Traceability

- Stage output: `Architecture/09-content-exercise-form-and-media-architecture.md`
- Product authority: `app/28-bestehen-app-product-specification.md` §§14, 16, 18–20; `app/21-content-strategy.md` §§3–8; skill Stages 07–13 and 16
- Corpus authority: `corpus/12-corpus-app-contract.md` §§3–5; `corpus/17-bestehen-corpus-product-specification.md` §§3–4
- Design: `Design/DESIGN-HANDOFF.md` §§3–6; shared attempt/component library and skill input regions
- Prior architecture: Stages 02, 04, 05, 06; refines ADR-0010, ADR-0012, ADR-0013
- Downstream: Stages 10–12, 15–19, 23–26, 28
