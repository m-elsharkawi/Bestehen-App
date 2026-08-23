# ADR-0022: Capability-gated responsive web and evidence-aware accessibility

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 14 — Responsive, Accessibility, Browser, and Device Architecture
- **Decisions:** ARCH-S14-D01–D10
- **Supersedes:** None

## Context

Bestehen launches as one responsive web application. Phone is first-class for coaching and core practice; larger screens materially improve long Writing, evidence inspection and mocks. The product and final design fix five responsive ranges, WCAG 2.2 AA, current/current-previous evergreen browser families, contextual microphone permission, local capability degradation, no background capture, and honest evidence meaning under accessibility support.

Browser APIs, storage, media formats, permissions, private contexts, embedded contexts and assistive-technology behavior vary independently. A browser name or API-presence check cannot prove that a clean high-stakes action is fair or recoverable. Conversely, one missing capability cannot justify blocking unrelated coaching. Accessibility support may leave the tested capability unchanged or may alter timing, modality, exposure or assistance; treating every support as automatically clean or automatically invalid would both be wrong.

## Decision

1. Lock one IA across five viewport contracts: ≤479, 480–767, 768–1023, 1024–1279 and ≥1280. Use the finalized grid, navigation, sheet/dialog, content-measure and focused-shell behaviors. Layout and screen size never decide evidence.
2. Use activity-scoped, versioned capability requirements and safe actual probes. Do not use a global browser/device gate. Missing/denied/broken storage, microphone, audio, media, checkpoint, notification or context capability blocks only the dependent action and offers unaffected alternatives.
3. Make high-stakes preflight a client observation plus server admission: normalized observations, requirement/support/policy versions, exact result/reasons, expiry and an idempotent receipt. Feature/permission queries are hints; an actual local operation and required server checkpoint receipt are decisive. Runtime facts can supersede preflight.
4. Request microphone only after deliberate voice intent and purpose explanation. Keep the test sample local/ephemeral, show visible capture, stop every track at teardown, and never capture in the background. Notification permission is similarly optional and contextual.
5. Make WCAG 2.2 AA and the stronger shaped requirements repository-owned primitive/shell release gates: native semantics, logical/not-obscured focus, keyboard completion, labelled errors, sparse live regions, text/table chart alternatives, select-then-place drag alternative, 44×44 targets with 8 px spacing, 200% zoom, 320 px reflow and reduced-motion behavior.
6. Use pre-mounted polite/assertive announcement channels and explicit event objects. Announce measured timer warnings at 10 minutes politely, final 5 minutes assertively once, and 1 minute politely. Never announce ticks. Announce recording start/stop politely and recording failure assertively. Prevent duplicate five-minute output.
7. Keep the design keyboard map only as optional, scoped convenience. Every shortcut yields to editors, IME, native controls, browser and assistive-technology bindings; every action has a visible/focusable ordinary control.
8. Resolve current and immediately previous major releases of desktop Chrome/Edge/Firefox/Safari, iOS/iPadOS Safari and Android Chrome into a versioned release support manifest. Use Playwright engines for fast cross-engine checks and branded real browser/device/AT evidence for release. Patched WebKit is not branded Safari and emulation is not a physical-device claim.
9. Classify accessibility conditions against the activity's tested capability as `equivalent`, `altering`, `unverified`, or `not_applicable`. Equivalent interaction produces the same canonical response/timing/exposure/assistance facts. Altering/unverified support remains available for learning but cannot silently gain a standard clean target claim. Future verified accommodation profiles are authority-backed, scoped, versioned, privacy-reviewed and auditable.
10. Persist only minimum admission/audit facts and aggregate normalized operational measures; do not create a device, audio or accessibility fingerprint. Correct policy/profile errors append supersession and trigger targeted projection recomputation only for referenced affected scopes.

## Consequences

### Positive

- Every first-class device receives the same coaching/evidence semantics while layout remains purpose-fit.
- Capability failure is local, explainable and recoverable rather than a global crash or false learner failure.
- High-stakes starts have auditable proof of the conditions known at admission without mistaking preflight for runtime truth.
- Accessibility is testable in the same release path as feature behavior, including the two hardest surfaces: timed work and Readiness evidence.
- Keyboard/screen-reader users create identical evidence where the tested capability is unchanged.
- Supports that change the tested capability remain useful and dignified while claims stay honest.
- The bounded support matrix controls solo-project maintenance and can add paid breadth without product lock-in.

### Costs and risks

- Requirement/probe/support manifests and admission receipts require explicit versioning and fixtures.
- Real Safari/mobile/assistive-technology release evidence needs manual device access; automation engines cannot replace it.
- Probes may become stale between admission and use, so runtime observations and recovery remain required.
- Single-key shortcuts require unusually careful conflict testing and may be disabled if safe scoping cannot be proved.
- Accommodation equivalence needs later external authority, privacy/legal review and expiry/revocation handling.
- A small physical-device set may eventually delay releases; a managed grid or formal audit adds recurring cost.

## Alternatives considered

- **One fluid layout with no breakpoints:** cheapest, but does not provide the shaped large-screen Writing/Readiness/mock behavior.
- **Separate desktop/mobile or native clients:** device-specific optimization, but duplicates IA, accessibility and evidence semantics before measured need.
- **Let every activity start and recover after failure:** simple, but risks response loss and false clean claims.
- **Global UA/browser allowlist:** easy support message, but blocks working capabilities, misses restricted contexts and becomes stale every release.
- **Feature-presence checks only:** low effort, but API presence does not prove storage durability, media decode, audible output or usable microphone signal.
- **Global onboarding diagnostic/permission bundle:** one-time setup, but violates contextual permission, privacy and local degradation.
- **Require persistent browser storage for all high-stakes work:** conservative, but rejects cases where server checkpoint durability is proven and still does not prove actual writes.
- **Automated accessibility scanner only:** cheap, but cannot prove focus, keyboard task completion, screen-reader output, timing or identical evidence.
- **Accessibility overlay/widget:** quick apparent coverage, but cannot repair application semantics and introduces privacy/dependency risk.
- **Treat all accessibility support as clean:** inclusive-looking but can misstate a tested modality/timing claim.
- **Treat all accessibility support as assisted/invalid:** discriminatory and false when the tested capability is unchanged.
- **Paid all-browser device grid at launch:** broad evidence, but unproven recurring seat/minute/tunnel/maintenance cost. A small neutral manual matrix is the launch fallback.

## Traceability

Full responsive, capability/preflight, accessibility/focus/live-region, browser/device/AT, evidence/accommodation, failure, privacy, cost, alternatives, source SHAs and acceptance tests are in `Architecture/14-responsive-accessibility-browser-and-device-architecture.md`.

This ADR applies ADR-0001, ADR-0003, ADR-0006, ADR-0011, ADR-0013, ADR-0018, ADR-0019, ADR-0020 and ADR-0021 without superseding them. Major downstream consumers are Stages 15–18, 20–23 and 25–28.

## Review and exit triggers

Review when actual probes materially false-block or false-admit high-stakes actions; two pass-critical browser/device/AT defects escape in a rolling release window; the real-device release queue repeatedly misses cadence; a supported family cannot be accessed; learner usage requires another family/AT; native/PWA capability measurably improves pass-critical offline media/capture/notification; a formal accommodation authority changes equivalence; WCAG or browser APIs materially change; or privacy review finds fingerprint/retention risk.

Any replacement must preserve one IA; the five responsive behavior ranges unless explicitly superseded by approved product/design work; capability-local degradation; contextual permission; no background capture; actual-condition audit; WCAG 2.2 AA and stronger shaped mechanics; identical evidence where tested capability is unchanged; honest altered/unverified claims; five validity states; six Readiness states; independent Written/Oral gates; absence rather than zero; no pass probability; and provider-neutral test/exit artifacts. A reversal creates a superseding ADR; published history remains.

