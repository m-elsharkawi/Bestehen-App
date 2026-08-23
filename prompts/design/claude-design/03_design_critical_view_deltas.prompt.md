# Phase 3 prompt — design critical view deltas

You are Claude Design acting as the senior interaction designer for Bestehen. You have no GitHub access. Work only from the uploaded sources and accepted Phase 1–2 outputs.

## Uploaded inputs

- `00_design_context_packet.md`
- `DESIGN-HANDOFF.md`
- `Bestehen-01-Design-System.dc.html`
- `Bestehen-02-Mobile-Screens.dc.html`
- `Bestehen-03-Desktop-Responsive.dc.html`
- `Bestehen-04-Flows-Handoff.dc.html`
- `support.js`
- `design-05-post-architecture-coverage-audit.md`
- `design-06-ui-foundation-handoff.md`
- `Bestehen-05-UI-Foundation-Delta.dc.html`, if Phase 2 created it

If a required file is missing, name it and stop. Do not reopen Phase 1 scope or recreate views classified as implementation-ready.

## Objective

Create implementation-grade mockups only for the high-risk view families that the Phase 1 audit proved ambiguous or missing. The goal is consistent implementation, not exhaustive screen production.

## Work

1. Use the Phase 1 prioritized delta list as the maximum scope. Do not exceed eight new base view families.
2. For each selected family, show:
   - the primary mobile state;
   - one tablet/desktop exemplar only when layout or available evidence materially changes;
   - compact annotated variants for loading, empty, Pending, partial, unavailable, retry, interrupted, not-counted or access states as applicable;
   - focus entry/return, live-region behavior, keyboard completion and reduced motion;
   - exact conditions/evidence labels and fault ownership.
3. Reuse the established shell, components, tokens and production-intent copy. New copy must follow observation → meaning → next action and remain provider-neutral.
4. Where a family covers several skills or failures, demonstrate the shared archetype once and annotate modality-specific extensions. Do not draw near-identical screens for every permutation.
5. Ensure the final artifact makes these distinctions impossible to miss:
   - absent estimate versus zero;
   - Safe versus Ready to Book;
   - five validity values versus practice eligibility;
   - learning evidence versus Readiness evidence;
   - learner error versus system/content/provider fault;
   - preserved work versus accepted evidence;
   - Auth0 credential UI versus Bestehen account/session UI.
6. Include mobile and large-screen Readiness only if the audit found a genuine post-architecture gap; do not add more charts because space exists.

Do not create production code, a marketing site, billing/admin dashboards, a Corpus browser, evaluator operations UI or provider-selection controls.

## Deliverables

Return one editable, self-contained design artifact named:

`Bestehen-06-Critical-View-Deltas.dc.html`

If `.dc.html` is unavailable, use the closest editable design format with that basename and record the format.

Also return one concise Markdown handoff named:

`design-07-critical-view-handoff.md`

The handoff must include:

- view-family and state inventory;
- anchor/index for every mockup;
- reused components and any new compositions;
- responsive, accessibility and copy rules;
- mapping back to Phase 1 gaps;
- items intentionally represented as annotations rather than frames;
- remaining blockers, if any;
- a handoff under 500 words for Phase 4.

Stop after these two deliverables.

