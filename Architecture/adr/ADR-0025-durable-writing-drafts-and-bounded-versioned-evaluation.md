# ADR-0025: Durable Writing drafts and bounded versioned evaluation

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 17 — Writing Editor, Autosave, and Evaluation Pipeline
- **Decisions:** ARCH-S17-D01–D10
- **Supersedes:** None

## Context

Writing is learner-authored personal data and pass-critical direct Written evidence. A browser/network failure must not erase it; a timer/reload must not silently grant extra target time; and evaluator delay, disagreement or outage must not become a weak score. The original measured response, same-prompt revision and fresh independent transfer have different evidence meanings and cannot share one mutable “latest answer.”

Bestehen has already selected a low-ops modular web architecture: PostgreSQL owns accepted facts and durable jobs, IndexedDB holds bounded local checkpoints/outbox, HTTP commands are idempotent and versioned, evidence uses exactly valid, partially_valid, pending, interrupted and not_counted, and high-stakes activities require capability-local durability proof. Product truth fixes one structured versioned evaluator, at most one escalation, exact 30-minute P4 Writing, no invented word-count gate, and an approximately-five-second draft-loss design target subject to measured validation.

## Decision

1. Content & Forms publishes an immutable Writing prompt revision binding scenario, recipient/register, communicative purpose, explicit semantic content points, rubric, target blueprint, support/timing policy, rights and approval. Attempts pin it.
2. Session & Attempt separates mutable draft checkpoints from immutable original submissions, same-prompt revisions and fresh-transfer responses. Same-prompt revision remains in the original episode/occasion; fresh independent evidence needs a new unexposed family and eligible occasion.
3. The editor uses a bounded dual checkpoint: IndexedDB write-ahead plus idempotent server sync when reachable. Meaningful changes are coalesced inside a versioned cadence and forced at lifecycle, timer and finalization boundaries. Release evidence must meet the approximately-five-second recoverable-loss target; proven durability gates high-stakes Writing.
4. P4 finalization freezes one response hash and actual-condition cut at learner submit or the accepted 30-minute cutoff. Reload/offline cannot reset or extend target time. Offline finalization may synchronize later under the same operation. Further typing is a distinct post-time practice revision.
5. Deterministic validation precedes one provider-neutral evaluator request. The request returns one structured candidate containing official I/II/III bands, per-content-point states, evidence spans, coaching dimensions, limited corrections, confidence, versions and uncertainty. It contains no pass probability or Readiness calculation.
6. The Evidence owner—not the provider—accepts supported candidate scope and applies one of the five validity states. At most one policy-justified escalation is allowed for consequential uncertainty. Material unresolved disagreement remains Pending/cannot-judge or leads to a fresh sample; candidates are never averaged or voted indefinitely.
7. Original evaluation and subsequent evaluator corrections are immutable and append-audited. A correction names affected scope and triggers targeted deterministic recomputation without creating a new evidence occasion or rewriting what was historically shown.
8. The provider payload is minimum-purpose: response, minimum prompt/content-point/rubric context, output schema and non-identifying condition facts only. It excludes profile, Readiness, other attempts, device fingerprint, accessibility/medical inference, exact exam date, Corpus and analytics identity.
9. Accepted learner Writing, revisions, structured evaluations and corrections remain learner-useful until deletion by default. Acknowledged local recovery copies expire within 24 hours; abandoned local drafts within 30 days. Export preserves useful text/lineage; deletion revokes first and purges local/App/provider work under existing backup-journal rules.
10. Save, offline, conflict, finalization, Pending and fault states are non-modal, semantic and accessible. The editor stays usable when safe, both conflict branches survive, important state is not toast-only, autosave does not move focus, and timer ticks are never announced. AI provider/model/region/pricing/retention and global model governance remain Stage 19 decisions behind this contract; Stage 21 owns the mechanism and Stages 23–25 own legal/threat, operational and release evidence without weakening these semantics.

## Alternatives considered

| Alternative | Reason not chosen |
|---|---|
| Save only on submit | Loses learner effort and cannot meet the shaped recovery target. |
| Local-only draft | Useful fallback, but cannot prove server acceptance, cross-device recovery or durable submission truth. |
| Server save on every keystroke | Adds privacy, write, latency and failure coupling without improving measured semantics over coalesced local-first checkpoints. |
| Fixed five-second polling interval | Lifecycle edges and sustained writes can still breach the loss target. A measured policy with forced boundaries is safer. |
| Event-source every keystroke | Invasive, storage-heavy and unnecessary for evidence; snapshots plus immutable submissions preserve required truth. |
| Last-write-wins draft sync | Can silently erase a learner branch. Explicit divergence preserves both. |
| CRDT collaborative editor | There is no collaborative multi-author requirement; the operational complexity is unearned. |
| Trust browser wall clock | Wall-clock changes/suspension/reload can reset or expand target time. Anchored monotonic observations and a frozen cutoff are required. |
| Require network for all Writing | Violates loaded-work continuity and turns connectivity into learner failure. |
| Treat the final revised text as the attempt | Erases the original measured performance and inflates independent evidence. |
| Self-check only | Remains the near-zero-cost fallback but cannot supply the required structured rubric evaluation. |
| Separate model calls for scoring, corrections, diagnosis and plans | Multiplies cost and inconsistency; one structured candidate can serve all supported dimensions. |
| Always accept the first model output | Cannot preserve consequential B/C uncertainty or malformed/weak slices. |
| Model majority vote | Creates arbitrary recurring cost and fake precision. One escalation followed by uncertainty/fresh evidence is bounded. |
| Choose a commercial model now | Stage 17 lacks the current benchmark, provider privacy/region/retention and cost evidence Stage 19 must own. |
| Retain full provider prompts/responses/logs forever | Increases sensitive-text exposure and deletion cost without being required for learner history. |
| Delete all learner text immediately after scoring | Prevents learner review, revision, correction audit and useful export. |
| Modal save and evaluation wait | Interrupts typing and blocks unrelated coaching. Stable inline states are sufficient. |

## Consequences

Positive:

- a browser, reload or network fault normally preserves the learner’s effort without falsifying timing;
- one original response, every revision and every evaluation/correction remain attributable;
- same-prompt improvement cannot masquerade as fresh independent evidence;
- one structured call and one exceptional escalation bound cost and inconsistency;
- providers remain replaceable and Corpus remains outside the learner runtime;
- Pending and system faults preserve unaffected learning and never lower a score;
- export/delete can inventory Writing text across local, App and processor boundaries;
- shared accessible save/recovery states serve phone, tablet and desktop.

Costs and trade-offs:

- local/server checkpoint reconciliation and explicit branch resolution are more work than latest-write-wins;
- exact offline cutoff/timer integrity requires real device validation;
- retained learner text is sensitive and needs strict access, redacted telemetry and deletion orchestration;
- a one-call contract may return only partial supported scope and sometimes leave feedback Pending;
- benchmark creation, evaluator promotion and correction review require bounded operator/human effort;
- high-stakes Writing may be unavailable when no durability route can pass preflight.

## Security, privacy, rights, accessibility, and cost

Writing text is never placed in URLs, general logs, analytics, session replay, notifications, Corpus or a learner profile. Provider requests use opaque IDs and minimum prompt/rubric context. Provider training, retention, region, subprocessors and deletion evidence are procurement gates, not assumed. Rights/approval are checked before serving and provider transfer. Rights withdrawal and content/evaluator correctness defects remain distinct. No legal-compliance claim is made.

The prompt, recipient/register, obligations, editor, timer, save state, conflict, errors and submit are semantic and operable at 320 px reflow, 200% zoom and by keyboard/AT. Save state does not depend on color; ordinary saves are not repeatedly announced. Enter never globally submits a multiline editor. IME/native editing wins. Timer ticks are never announced.

Routine typing and reopening have zero AI cost. Normal submit has one structured call; unchanged semantic requests deduplicate. The zero/low-cost fallback preserves the response, provides learner self-check/reviewed reminders and leaves evaluation Pending/cannot-judge without moving Readiness. Upgrade requires measured benchmark, latency, reliability, privacy/region and variable-cost benefit. Cost cannot remove pass-critical Writing evidence, accessibility or recovery.

## Traceability

Primary product: Bestehen-Shaping/app/12-writing-coaching.md §§3–14; app/07-core-learning-loop.md §§7–10; app/08-a1-to-b1-progression.md §§5, 8, 10; app/14-review-and-spaced-repetition.md; app/15-telc-readiness.md; app/16-mock-exams.md; app/26-platform-accessibility-nonfunctional.md §§3.12–3.15; app/28-bestehen-app-product-specification.md.

Architecture: Stages 05, 06, 08, 09, 11, 12, 13, 14 and Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md.

Design: Design/DESIGN-HANDOFF.md §§3–6; Design System autosave/Pending/shared Writing parts; Mobile Writing/offline/Pending/data states; Desktop D3 Writing.

Primary technical evidence accessed 2026-08-23: W3C IndexedDB 3.0; WHATWG HTML system state; W3C High Resolution Time; WCAG 2.2. These primitives do not replace release proof.

## Review triggers

Review when measured evidence shows any of:

- the configured recoverable-loss bound is missed on a supported release/browser/device/storage class;
- silent overwrite, duplicate submission, timer reset/extension or wrong-response evaluation occurs;
- conflict frequency/UX or server write/latency/storage cost makes the dual checkpoint unsustainable;
- a new client or verified accommodation needs compatible timing/input semantics;
- human benchmark agreement, especially content-point or B/C boundary behavior, falls below accepted gates;
- escalation does not materially improve consequential decisions relative to cost;
- evaluator correction, malformed output, low-confidence or Pending age breaches Stage 24/25 thresholds;
- provider privacy/region/retention/price/model/support changes;
- target blueprint, rubric or word-count evidence changes through authoritative TELC review;
- jurisdiction-specific legal review requires a superseding processor/retention decision.

Exit preserves App-owned prompt/rubric/evaluator schemas, immutable learner response/evidence IDs, checkpoint/finalization facts, structured candidates/results/corrections, rights-safe benchmark labels and export formats. The provider adapter, local storage implementation, server coalescing and timing mechanism may change without rewriting semantic history.

## Supersession

Supersedes none. Applies ADR-0001, ADR-0002, ADR-0003, ADR-0010, ADR-0011, ADR-0012, ADR-0013, ADR-0015, ADR-0016, ADR-0018, ADR-0019, ADR-0020, ADR-0021, ADR-0022 and ADR-0023.
