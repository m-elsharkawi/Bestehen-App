# ADR-0021: Single semantic design system and shared five-skill extension contract

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 13 — Frontend Application and Design-System Architecture
- **Decisions:** ARCH-S13-D06–D11
- **Supersedes:** None

## Context

The design fixes one semantic token system in light/dark, three type roles, an 18-icon subset, the B1 Threshold B mark, shared accessible components and one five-skill attempt/result/repair/evidence foundation. Product truth requires five validity states, six Readiness states, read-only conditions, independent Written/Oral gates, explicit Pending/absence/partial scope, and zero learner-negative effect from technical/content/media/access/browser/network/evaluator faults.

Copying the .dc.html runtime or building screen-local components would create parallel design systems. A full UI kit or utility theme would introduce competing tokens/behavior. Five vertical skill stacks would drift; an unconstrained generic workflow engine would erase productive/media semantics. Raw content HTML/SVG would add injection and rights risk.

## Decision

1. Own one ui/design-system package. Use exact semantic CSS custom properties and CSS Modules with native HTML semantics. Raw token values exist only in the canonical contract; no full UI kit, utility-token fork, copied inline design runtime or remote theme service.
2. Reuse one AttemptShell, ResultCard, RepairCard, EvidenceLabel and recovery foundation. Add five typed SkillInputRegion extensions—Reading, Language Elements, Listening, Writing, Speaking—that only render/capture modality interaction, checkpoints, exposure and capability observations.
3. Extensions cannot emit or override evidence, validity, Readiness, score interpretation, coaching priority, rights, timing claims, result/repair shells, labels, arbitrary HTML or secrets.
4. Version one build-time design contract containing the exact 25 tokens/two modes, Bricolage Grotesque/IBM Plex Sans/IBM Plex Mono roles, exact 18 semantic icon IDs, and B1 Threshold B asset manifest/digests. Self-host fonts/icons/logo; no browser request to third-party font/icon/CDN.
5. Render all consequential UI from exhaustive discriminated view models supplied by owner projections. Each state contains text, semantic status, affected scope, safe actions, announcement/focus hints, lineage and read-only evidence labels. Unknown consequential major/state fails closed in the nearest boundary.
6. Render approved rich task content from a closed versioned AST mapped to owned components. Escape learner strings; prohibit unsanitized HTML/SVG and server secrets in client modules.
7. Put keyboard, focus, target size, reflow/zoom, live regions, non-color status, chart tables, reduced motion, language and equivalent interaction paths into shared primitives and contract fixtures.

## Consequences

### Positive

- Five skills stay learnable and semantically consistent while retaining modality-specific behavior.
- Token/mode/icon/brand changes are auditable, testable and rollbackable.
- Status cannot be inferred from hue or local thresholds.
- Accessibility and recovery improve once at the primitive/shell boundary.
- Static self-hosted assets reduce recurring dependencies, privacy leakage and provider exit cost.
- Closed content mapping prevents a content/provider payload from executing in the browser.

### Costs and risks

- The shared extension contract needs deliberate evolution and exhaustive cross-skill fixtures.
- Repository-owned primitives require accessibility testing; an admitted headless helper must remain behind them.
- Exact font/icon/logo assets and notices need build/release discipline.
- The current design directory lacks the registered SVG exports; release requires production/verification from the design master.
- A closed AST may need compatible additions for newly approved task structures.

## Alternatives considered

- **Copy .dc.html runtime/inline styles:** fastest visual match, but not production architecture and likely to drift.
- **Full UI kit/Tailwind theme as authority:** accelerates construction but creates a parallel semantic vocabulary and dependency.
- **Screen-local CSS/components:** simple per screen, but duplicates truth, accessibility and recovery.
- **Five skill component libraries:** clear ownership, but forks shell/result/repair/evidence behavior.
- **One universal question engine:** fewer components, but hides media/productive/rights/accessibility differences.
- **Remote fonts/icons/assets/theme:** easy updates, but privacy, availability, CSP and exit risk.
- **Raw HTML or plain text only:** raw is unsafe; plain text cannot express all approved accessible structures.

## Traceability

Full token values, typography/icon/brand manifests, state tables, SkillInputRegion contract, XSS/accessibility rules, frame/flow/API mapping, source SHAs and validation gates are in Architecture/13-frontend-application-and-design-system-architecture.md.

This ADR applies ADR-0001, ADR-0003, ADR-0006, ADR-0010, ADR-0011, ADR-0013, ADR-0016, ADR-0018 and ADR-0019 without superseding them. Major downstream consumers are Stages 14–22 and 25–28.

## Review and exit triggers

Review when a modality requires repeated unsafe casts or the same skill branch in three shared components; token/component breaking change is approved; font/icon/logo license/support/performance/contrast fails; XSS/content fixtures reveal an unsafe node; shared primitive accessibility fails the Stage-25 gate; or a third-party helper demonstrably reduces defects without taking product semantics.

Any replacement must preserve the exact product/design semantics, five-state validity, six-state Readiness, independent gates, read-only labels, one shared shell foundation, modality isolation, self-hosted portable assets, closed content, accessibility, local degradation, absence instead of zero and the prohibition on pass probability. A reversal creates a superseding ADR; history remains.
