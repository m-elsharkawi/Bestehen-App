# ADR-0023: Deterministic objective task runtime and immutable outcomes

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 15 — Reading and Language Elements Runtime
- **Decisions:** ARCH-S15-D01–D10
- **Supersedes:** None

## Context

Bestehen needs one implementation-facing runtime for TELC B1 Reading R1–R3 and Language Elements SB1–SB2. These task families use select, heading/situation matching, local-choice cloze and shared-bank cloze mechanics, but share the same attempt, validity, evidence, repair and recovery truth. Reading and Language Elements also share the official written-block timing condition; no official Language Elements-only time allocation exists.

The runtime must preserve approved immutable content and answer-key lineage, family freshness, offered-versus-used help, exact timing/exposure conditions, decisive evidence before advice, fresh-equivalent retry, and delayed return. Pointer, keyboard, screen-reader, switch and optional drag input must produce identical evidence when the tested capability is unchanged. A content, key, render, accessibility, browser, network or technical defect cannot become learner failure.

The decision is durable because task payloads, frontend adapters, API operations, evidence admission, Readiness scoring, offline/checkpoint recovery, content QA and correction workflows all depend on the same response and outcome semantics. The accepted baseline is m-elsharkawi/Bestehen-App@eee2803b724bd8c95693c7ad4f764c75e5ebeecc and m-elsharkawi/Bestehen-Shaping@9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc. Full source/blob evidence is recorded in Architecture/15-reading-and-language-elements-runtime.md.

## Decision

1. Use one versioned objective-form kernel with closed R1HeadingMatching, R2DetailedSelect, R3SituationNoticeMatching, SB1ContextualGrammarCloze and SB2SharedBankLexicalCloze variants. Counts, reuse/no-match mechanics, official conversions and navigation come from the pinned target/task definition, not UI constants.
2. Represent instructions and stimuli with a sanitized closed learner-safe content AST. Do not send arbitrary HTML, keys, correct flags, distractor rationale, answer-bearing decisive-anchor metadata, restricted source URLs or operator data to the browser before the shaped reveal.
3. Make select, match and candidate-placement operations canonical. Pointer/touch, keyboard, screen reader, switch and optional drag are adapters to the same semantic item/option/gap IDs. Select-then-place is always available for matching/placement; input method alone never changes score or confidence.
4. Session & Attempt pins one exact serving manifest, checkpoints recoverable working state, and accepts one immutable original submission plus actual assistance, exposure, timing, interruption and accessibility conditions. A lost acknowledgement is resolved by the existing idempotent operation receipt. A changed answer after submission requires a new attempt.
5. Score every objective unit deterministically against the exact pinned reviewed key and scoring-algorithm version. No runtime AI, Corpus query, learner-history heuristic, UI position or latest-key lookup may decide correctness. Client checks may report completeness only.
6. Keep OriginalObjectiveOutcome immutable and separate from current evidence interpretation. Validity uses exactly valid, partially_valid, pending, interrupted and not_counted. A deliberate blank in a valid finalized form follows its pinned scoring policy; an unsubmitted/interrupted/technical blank is absence or non-learner fault, not a wrong answer.
7. Store reviewed decisive spans/relations, correct rationale, chosen-distractor rationale and defensible cause mappings server-side. Reveal after the submission/block boundary in the order validity/outcome → decisive evidence → mismatch → supported cause/confidence → smallest repair. Unsupported attribution remains unresolved.
8. Record assistance as offered/used plus phase, affected scope, answer-bearing effect and tested-capability effect. Offered-but-unused and post-submission help do not weaken the original. Post-submission answer/key exposure affects later freshness only.
9. Require another approved eligible content family for a claimed fresh-equivalent retry. Immediate retry is a new attempt inside the same episode/occasion and proves responsiveness/transfer, not independent Readiness. Delayed retention requires a later eligible occasion and another fresh family. If inventory is exhausted, return transfer_pending or broader reviewed practice; never generate/adjudicate per click.
10. On a confirmed ambiguity/defect, quarantine the exact scope, append an impact assertion and scoped validity correction, preserve the original response/outcome and unaffected evidence, publish a different-family replacement, and run idempotent targeted shadow recomputation. Unexpected scope or any unaffected change blocks publication.

Reading and Language Elements target timing is represented only by a SharedWrittenTargetBlock bound to the current blueprint duration rule. Isolated tasks may use open or labelled Bestehen practice timing. Hiding the timer never changes the clock. Only Measurement decides E3/E4 eligibility, official unit weights, Written aggregation, Readiness, mock validity and booking gates.

The runtime remains inside the accepted modular monolith and existing JSON/HTTP, PostgreSQL, local-work/checkpoint and durable-job boundaries. Corpus supplies approved asynchronous intelligence/content only and receives no learner data. Ordinary objective scoring, feedback selection and retry selection have zero runtime AI cost.

## Alternatives considered

- **Bespoke payload and scoring per task/screen:** initially simple, but forks correctness, accessibility, checkpoint and correction semantics across five families.
- **One arbitrary schema-driven JSON/HTML renderer:** flexible, but permits invalid target mechanics, unsafe markup and non-exhaustive response meaning.
- **Pointer/drag event history as the response:** direct for visual UI, but device-coupled and inaccessible; separate accessible payloads could create different evidence.
- **Client-side answer keys and scoring:** fast/offline, but leaks keys, enables stale/latest drift and makes correction/audit unreliable.
- **Runtime AI adjudication/explanation:** can paper over ambiguous content, but is nondeterministic, costly and unfair; ambiguity should quarantine the instrument.
- **One assisted boolean inferred from UI state:** small payload, but conflates offered/used, pre/post response and answer-bearing/non-answer-bearing help.
- **New item ID/reordered options as freshness:** cheap inventory, but rewards memorization and inflates independence.
- **Live generation for every retry:** apparently fresh, but bypasses independent key/naturalness/rights/accessibility approval and creates per-click cost.
- **Silent key edit or whole-form invalidation:** one destroys history; the other discards unaffected learner truth. Exact-scope append correction is required.
- **Per-skill services/rules engines/event stream:** organizational isolation without current operational need; adds idle cost and semantic drift.

## Consequences

### Positive

- All five objective task families share one response, scoring, accessibility, validity, recovery and correction truth while retaining their exact mechanics.
- Every supported input method can prove identical semantic responses instead of receiving a separate evidence lane.
- Original learner work and result lineage remain reproducible even when a content defect or target release changes current interpretation.
- Objective scoring and reviewed explanation selection continue during Corpus, model or commercial-provider outage.
- Same-session repair cannot accidentally manufacture independent Readiness, and a missing fresh family is represented honestly.
- Defective content is neutral, locally scoped and repairable without lowering unrelated capability, Mistake, Readiness or mock projections.
- Learner-safe payloads reduce XSS, answer leakage, rights leakage and accidental exposure of operator/Corpus material.

### Costs and risks

- Closed task variants, canonical operations, exact keys, rationale metadata and adapter equality fixtures require deliberate schema/test work.
- Content operations must maintain independently reviewed keys, decisive evidence, distractor rationale and enough eligible families.
- Matching/shared-bank keyboard and screen-reader behavior needs real manual testing, not only automated accessibility checks.
- Checkpoint, submission and impact selectors need strict idempotency/versioning; mistakes could duplicate evidence or over-broaden correction.
- A conservative family decision may delay transfer/Readiness when inventory is small; this is safer than false independence.
- Learner-facing design retry copy needs validation so “counts as evidence” does not imply independent Readiness.

### Dependencies and fallback

Stages 21, 24–28 consume the canonical response/checkpoint contract, scoring/defect measures, quality gates, release behavior, scenario validation and final registry. The fallback for inventory shortage is broader reviewed content, labelled exposed practice or transfer_pending. The fallback for attribution uncertainty is broad cause plus one clarifier. The fallback for an incompatible contract/key is local unavailable/Pending, never guessed scoring.

No new commercial provider is selected. Data and contracts are portable JSON/HTTP and PostgreSQL-owned semantic records. UI adapters, content-generation tools and a future service boundary can be replaced without changing task/form/response/outcome identities. A reversal requires a superseding ADR and migrations that preserve published history.

## Validation and review triggers

Release evidence must include:

- schema/golden forms for R1–R3/SB1–SB2 across supported P0–P4 roles;
- exact-key replay checksum equality, blank/interruption distinctions and no key/rationale in learner payload;
- pointer, keyboard, screen-reader and optional drag canonical-response equality;
- 320 px, 200% zoom, forced-colors, focus, German-language and select-then-place completion;
- duplicate/reconnect/conflict/property tests proving one submission/outcome/episode effect;
- offered-unused, answer-bearing, post-submission exposure and access-equivalence matrices;
- family/near-duplicate and no-fresh-inventory fixtures;
- defect quarantine, exact selector, partially-valid preservation, replacement and zero-unaffected-change shadow diff;
- structural deny tests for probability semantics, client scoring, standalone official Language Elements timing, runtime objective AI and learner data sent to Corpus.

Review or supersede when the verified target adds/changes a task mechanism; response adapters cannot express an equivalent input; two pass-critical response/a11y divergences escape in a rolling release window; deterministic replay mismatches; confirmed ambiguity or inventory exhaustion exceeds Stage-24 approved thresholds; correction lag breaches the safe freshness horizon after ordinary tuning; or independent security/deploy ownership justifies a service split.

Rollback restores the prior runtime/task/target release for new eligible attempts, retains every pinned historical form/submission/outcome, and rebuilds only affected projections. Published facts are never rewritten.

## Traceability

- Product/design sources: app/28-bestehen-app-product-specification.md; app/07-core-learning-loop.md; app/08-a1-to-b1-progression.md; app/09-reading-training.md; app/10-language-elements-training.md; app/14-review-and-spaced-repetition.md; app/21-content-strategy.md; app/26-platform-accessibility-nonfunctional.md; Design/DESIGN-HANDOFF.md; Design/Bestehen-01-Design-System.dc.html; Design/Bestehen-02-Mobile-Screens.dc.html; Design/Bestehen-04-Flows-Handoff.dc.html.
- Owning stage output: Architecture/15-reading-and-language-elements-runtime.md.
- Checklist: Stage 15 — all 24 decisions/checks.
- Related ADRs: ADR-0001, ADR-0003, ADR-0011, ADR-0013, ADR-0015, ADR-0016, ADR-0018, ADR-0019, ADR-0021 and ADR-0022.
