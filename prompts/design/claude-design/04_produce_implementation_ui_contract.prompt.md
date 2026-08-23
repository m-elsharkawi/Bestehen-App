# Phase 4 prompt — produce the implementation UI contract

You are Claude Design acting as the final design-handoff owner for Bestehen. You have no GitHub access. Work only from the uploaded baseline and accepted Phase 1–3 outputs.

## Uploaded inputs

- `00_design_context_packet.md`
- `DESIGN-HANDOFF.md`
- `Bestehen-04-Flows-Handoff.dc.html`
- `support.js`
- `design-05-post-architecture-coverage-audit.md`
- `design-06-ui-foundation-handoff.md`
- `Bestehen-05-UI-Foundation-Delta.dc.html`, if created
- `Bestehen-06-Critical-View-Deltas.dc.html`
- `design-07-critical-view-handoff.md`

If a required output is missing, name it and stop. Do not compensate by inventing content.

## Objective

Produce one concise, implementation-facing design contract that lets multiple implementation agents build views consistently without reopening product/design decisions or reading the entire design history.

This phase is consolidation, not another mockup phase. Create no new visual artifact unless you discover a release-blocking contradiction that cannot be expressed in the contract; if that happens, report it and stop instead of improvising.

## Work

1. Reconcile the original handoff with the accepted audit and delta artifacts. Binding corrections in `00_design_context_packet.md` win over stale design prose.
2. Build a complete route/view/archetype/state manifest. Every implementation-facing surface must point to:
   - an existing source anchor;
   - a Phase 2–3 delta anchor; or
   - a named archetype plus explicit state contract.
3. Define the shared component composition rules that prevent per-skill forks and local state invention.
4. Include exhaustive learner-visible state mappings for:
   - identity/session/account;
   - plan/session/attempt/result/repair/remember;
   - five modality extensions;
   - Writing/Speaking/STT/TTS processing and Pending;
   - evidence validity, Readiness and Gates A–F;
   - checkpoint/upload/offline/conflict/recovery;
   - history/weakness/review/progress;
   - export/deletion and bounded backup truth.
5. Record responsive behavior by archetype, not by duplicating every screen.
6. Record accessibility behavior as acceptance tests: focus order/movement, keyboard path, live regions, text alternatives, 320 px reflow, 200% zoom, reduced motion, target size and non-color meaning.
7. State which strings are fixed production-intent copy, which are structured server-owned reasons and which may vary without changing meaning.
8. Include Auth0/R2/commercial-AI implications while keeping providers out of normal learner UI.
9. Define a token-efficient implementation order beginning with one vertical slice: authenticated entry → Coach → one attempt → deterministic or Pending result → repair/fresh retry → history/Readiness projection. Preserve truthful Writing and Speaking exposure before presenting the product as complete.
10. Include a short design QA checklist implementation agents can apply to each pull request.

Do not rewrite the product or architecture specifications, describe backend implementation, generate production code, or duplicate every mockup's visual details in prose. Link by uploaded filename and stable anchor/index.

## Deliverable

Return one downloadable Markdown file named exactly:

`DESIGN-IMPLEMENTATION-HANDOFF.md`

It must contain:

1. authority and source manifest;
2. product/UI invariants;
3. complete route-view-archetype-state manifest;
4. design artifact anchor index;
5. shared component composition contracts;
6. domain-state-to-UI projection matrix;
7. responsive and accessibility contracts;
8. copy and fault-ownership rules;
9. auth/storage/AI capability-state rules;
10. vertical-slice implementation sequence;
11. per-view design QA checklist;
12. resolved corrections, true remaining owner questions and explicit out-of-scope surfaces.

Prefer matrices and references. Keep the document compact enough to serve as routine implementation-agent context rather than another full specification.

Stop after this deliverable.

