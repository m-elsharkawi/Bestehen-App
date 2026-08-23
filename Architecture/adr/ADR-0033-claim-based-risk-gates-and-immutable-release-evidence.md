# ADR-0033 — Claim-based risk gates and immutable release evidence

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owners:** Architecture; Quality; Evidence; Accessibility; Security; Data Rights
- **Decision IDs:** ARCH-S25-D01, D04, D06, D07, D08, D09
- **Supersedes:** none

## Context

Bestehen publishes consequential claims about learner evidence, independent Written/Oral readiness, productive language performance, content quality, accessibility, recovery, privacy, rights, deletion, and cost. A code-coverage percentage or a green end-to-end smoke cannot prove those claims. Conversely, running every permutation through browsers and live AI providers would be slow, flaky, expensive, privacy-heavy, and still unable to isolate semantic faults.

The existing architecture selects Vitest/React Testing Library, Playwright, axe plus manual accessibility evidence, real PostgreSQL integration, provider adapters, deterministic domain owners, versioned content/evaluator releases, and protected release operations. Stage 25 must define how those pieces qualify a release without allowing schedule, cost, retry noise, or a partial product to weaken learner truth.

## Decision

1. Define a versioned catalog of consequential learner claims. Every claim names authoritative owner/oracle, risk, applicable release axes, fixtures, test techniques, cadence, artifacts, blocker, fallback, and review trigger.
2. Use a risk portfolio: broad deterministic example/property/model/replay tests; real PostgreSQL and contract seams; narrow browser/device/AT/provider/manual evidence only where substitutes cannot prove the claim.
3. Treat code coverage as advisory diagnostic data, never a promotion oracle.
4. Qualify content, Writing/Speaking evaluators, STT, TTS/audio, partner behavior, and calibration against immutable rights-cleared benchmark releases with independent holdouts, material slices, human adjudication, predecessor deltas, uncertainty, latency/cost, and rollback. Insufficient evidence does not pass.
5. Bind promotion to an immutable digest-bound `QualityEvidenceBundle` containing source/dependency, schema/contract/policy/content/model/browser/environment/test releases; dataset manifests; results; minimized artifacts; exceptions; approvals; and predecessor.
6. Class gates as blocking, conditional blocking, or advisory. Truth, evidence, rights, pass-critical content/productive evaluation, supported core accessibility, critical security, deletion/raw-audio/restore, and compatibility gates have no ordinary waiver. An emergency response may roll back or disable the exact capability; it cannot present degraded work as equivalent evidence.
7. Permit one diagnostic retry. A pass after failure is `flaky`, not green. Quarantine requires owner, claim impact, replacement control, expiry, and visible evidence; a quarantined test can never be the sole proof of a blocking claim.
8. Default to synthetic/minimized test data. Gold data is original, licensed, synthetic, or explicitly purpose-bound/consented. Production learner snapshots are prohibited. Artifacts are redacted before persistence and follow the stricter applicable rights, withdrawal, deletion, raw-audio, provider, and test-evidence TTL.

## Consequences

- Releases can be audited from learner claim to exact source, versions, datasets, results, and promotion receipt.
- Deterministic suites carry most combinations cheaply while real environments prove the seams that matter.
- Productive and accessibility evidence remain real release costs; they cannot be deleted merely because objective tests are cheaper.
- A model, prompt, price, provider config, content/media, browser/OS/AT, schema, policy, or harness change invalidates only mapped evidence rather than forcing unrelated global reruns.
- Stage 26 must implement impact mapping, protected promotion, artifact retention/signing, rollback, and current support manifests. Stage 27 must exercise the nine scenarios and Flows A–G; Stage 28 consolidates.
- Human adjudication and real-device/AT time remain operational work. The architecture avoids a new commercial platform until measured access, throughput, or defect-escape evidence justifies one.

## Alternatives considered

### Coverage threshold and manual release smoke

Simplest, cheap, and rejected. It cannot prove state transitions, duplicate effects, missing-as-absence, independent gates, rights, evaluator slices, restoration, or equivalent accessibility.

### End-to-end and live-provider tests for everything

Rejected. It is expensive, nondeterministic, privacy-heavy, slow to diagnose, and still cannot enumerate semantic state spaces. Live sandbox tests remain a narrow candidate lane.

### Every failure waivable by release owner

Rejected. It lets schedule/cost redefine truth. Exceptions are capability-scoped and expiring; non-waivable claims can only be fixed, rolled back, or disabled.

### No retries or unlimited retries

Both rejected. Zero diagnostic retry mistakes infrastructure noise for proof; unlimited retry hides races. One retry classifies and preserves the first failure.

### Production snapshots as realistic fixtures

Rejected. They couple tests to learner data, deletion, security, and provider leakage. Synthetic and separately governed gold datasets are sufficient and auditable.

## Security, privacy, rights, accessibility, failure, and cost

Authorization/property, malicious-input, dependency/provenance, provider-config, takedown, deletion/restore and no-sensitive-log tests are blocking by mapped risk. WCAG 2.2 AA requires automated plus manual complete-process keyboard/AT/reflow/branded-browser/real-device evidence; automation alone cannot claim conformance. Faults produce scoped Pending/partial/interrupted/not_counted behavior, never learner failure. Test artifacts exclude secrets/payloads by construction and are access-/TTL-bounded. Benchmark calls record cost per useful accepted evidence unit, enforce envelopes/circuits, and retain provider-neutral exit fixtures.

## Validation

Stage 25’s strategy matrix, invariant catalog, compatibility matrix, benchmark table, accessibility matrix, gate table, and test-data plan are the normative validation catalog. Promotion requires an exact current quality bundle and successful replay of applicable blocking gates. Defect escapes, flakes, expired evidence, provider/browser/standard change, benchmark drift, restore/delete failure, or cost-envelope breach trigger review.

## Traceability

- Product: `app/28-bestehen-app-product-specification.md` §§10–20; detailed `app/15–17`, `app/21`, `app/24`, `app/26`, `app/27`.
- Corpus: `corpus/12-corpus-app-contract.md`; `corpus/17-bestehen-corpus-product-specification.md` §§4.9, 4.11, 4.15.
- Design: `Design/DESIGN-HANDOFF.md` §6; `Design/Bestehen-04-Flows-Handoff.dc.html` Flows A–G/accessibility.
- Architecture: Stages 01–24, especially 03, 05–12, 14–24.
- Owning output: `Architecture/25-testing-evaluation-and-quality-gates.md`.

## Review and supersession trigger

Review when a consequential defect escapes, a blocking suite repeatedly flakes, evidence runtime/cost becomes unsustainable, browser/device/AT support changes, a provider/model/price/terms/region changes, a benchmark slice drifts, an audit shows missing provenance, or a claim cannot be proved with the current portfolio. Any replacement must preserve claim traceability, non-waivable gates, privacy/rights/accessibility, exact state semantics, bounded cost, and rollback. Supersede by ADR; never erase prior release evidence.
