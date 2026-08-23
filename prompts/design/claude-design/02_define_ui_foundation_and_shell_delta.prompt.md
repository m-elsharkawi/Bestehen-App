# Phase 2 prompt — define the UI foundation and shell delta

You are Claude Design acting as the design-system owner for Bestehen. You have no GitHub access. Work only from the uploaded files and the accepted Phase 1 audit.

## Uploaded inputs

- `00_design_context_packet.md`
- `DESIGN-HANDOFF.md`
- `Bestehen-01-Design-System.dc.html`
- `Bestehen-03-Desktop-Responsive.dc.html`
- `support.js`
- `design-05-post-architecture-coverage-audit.md`

If one is missing, name it and stop. The Phase 1 audit controls scope: do not add components or shell variants merely because they might be useful.

## Objective

Close only foundation-level gaps that would otherwise force implementation agents to invent inconsistent UI. Preserve the existing tokens, typography, iconography, component contracts, four-destination information architecture and responsive behavior.

## Work

1. Validate the Phase 1 P0/P1 foundation findings against the existing design-system source.
2. Reuse or extend existing components before creating a new primitive. A new component must have a distinct semantic responsibility, not just a different screen context.
3. Define only the required deltas for:
   - authenticated, signed-out, session-expired, callback-failed and access-denied app shells;
   - asynchronous processing/Pending/partial/unavailable status presentation shared by AI, STT and TTS;
   - upload/checkpoint/save/retry status shared by Writing, Speaking and private object storage;
   - neutral system-fault ownership and scoped recovery;
   - responsive navigation/shell behavior where the existing contract is insufficient;
   - focus, live-region and reduced-motion behavior for any new component state.
4. Keep provider names and provider controls out of learner-facing components.
5. Show component states and shell anatomy, not a wall of complete screens. Use compact state boards and annotated responsive exemplars.
6. Preserve both themes and the existing semantic token system. Do not add a token unless an existing semantic token cannot express the required meaning accessibly.

Do not design credential-entry forms: Auth0 Universal Login owns them. Do not create production React/CSS or choose technical implementation libraries.

## Deliverables

Always return one downloadable Markdown file named:

`design-06-ui-foundation-handoff.md`

It must contain:

- validated Phase 1 findings;
- reused versus new component decisions;
- state/interaction/accessibility contracts for each delta;
- responsive behavior;
- exact references to existing design anchors;
- any effect on Phase 3 scope;
- a handoff under 500 words.

Only when a visual or component delta is actually necessary, also return one self-contained design artifact named:

`Bestehen-05-UI-Foundation-Delta.dc.html`

If your environment cannot produce `.dc.html`, return the closest editable design artifact with that basename and record the format in the handoff. If no visual delta is necessary, do not create an empty artifact; explicitly state that the existing foundation is sufficient.

Stop after these deliverables.

