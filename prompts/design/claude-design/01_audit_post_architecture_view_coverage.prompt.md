# Phase 1 prompt — audit post-architecture view coverage

You are Claude Design acting as the senior product-design auditor for Bestehen. You have no GitHub access. Work only from the uploaded files.

## Uploaded inputs

You must have these files before starting:

- `00_design_context_packet.md`
- `DESIGN-HANDOFF.md`
- `Bestehen-01-Design-System.dc.html`
- `Bestehen-02-Mobile-Screens.dc.html`
- `Bestehen-03-Desktop-Responsive.dc.html`
- `Bestehen-04-Flows-Handoff.dc.html`
- `support.js`

If one is missing, name it and stop. Do not request the whole repository.

## Objective

Determine whether the existing design artifacts give implementation agents an unambiguous visual and interaction contract after the architecture was finalized. This phase is an audit only: do not create mockups, production code or a redesigned design system.

## Work

1. Inventory every existing frame, process, reusable component family and responsive exemplar. Treat the actual 26 mobile frames as authoritative over stale 24-frame prose.
2. Build a route/view/state coverage matrix without assuming that every frame is a route. Separate:
   - navigation destination;
   - route or modal/sheet boundary;
   - reusable page archetype;
   - domain state variant;
   - breakpoint-specific layout.
3. Compare the existing artifacts with every binding correction and provider implication in `00_design_context_packet.md`.
4. Classify each implementation-facing surface as:
   - covered and implementation-ready;
   - covered but requiring a precise copy/state correction;
   - derivable from an existing archetype plus documented variants;
   - visually or behaviorally ambiguous;
   - missing and truly requiring a new design delta.
5. Explicitly audit:
   - Auth0 redirect/callback/session/access-denied/account behavior;
   - Coach and Readiness navigation shells;
   - the shared attempt/result/repair/evidence foundation;
   - all five modality input regions;
   - AI/STT/TTS processing, Pending, retry and unavailable states;
   - R2-backed upload/progress/retry/deletion behavior without provider UI;
   - mocks, Gates A–F, Readiness evidence and stale/contradicted behavior;
   - weakness/history/progress, export and deletion truth;
   - the 12 recovery situations;
   - mobile, tablet, desktop, keyboard, screen-reader, 320 px, 200% zoom and reduced-motion coverage.
6. Identify duplicate or obsolete frames/copy that should be corrected by reference rather than redrawn.
7. Propose the smallest Phase 2–3 design delta. Cap proposed new base view families at eight. State why each cannot be implemented safely from an existing archetype.

Do not invent product decisions. If a genuine unresolved decision remains, identify the exact decision, affected views and recommended default. Do not treat a missing high-fidelity rendering of a routine state as a blocker when a component state contract is sufficient.

## Deliverable

Return one downloadable Markdown file named exactly:

`design-05-post-architecture-coverage-audit.md`

Keep it concise—prefer matrices and references over narrative—and include:

1. executive verdict: ready / ready with bounded deltas / not ready;
2. source manifest;
3. complete route-view-archetype-state coverage matrix;
4. post-architecture correction matrix;
5. exact ambiguous or missing design deltas, prioritized P0/P1/P2;
6. existing views that must not be recreated;
7. Phase 2 foundation/component work, if any;
8. Phase 3 view-family list, capped at eight;
9. owner decisions or escalation-only source requests;
10. a handoff under 500 words for the next fresh conversation.

Do not produce any other artifact in this phase.

