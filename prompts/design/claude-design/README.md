# Claude Design phased prompt pack

This pack closes only the design gaps that remain after the completed product and architecture work. It is deliberately **not** a request to redesign Bestehen or to mock every screen again.

The repository already contains a mature design baseline:

- 41 shared components and the two-mode token system;
- 26 current mobile frames, despite older prose saying 24;
- four desktop layouts and one tablet layout;
- Flows A–G, 12 recovery situations, accessibility tests and a coverage matrix.

The efficient sequence is therefore: audit coverage → fill foundation gaps → design only critical deltas → produce one implementation-facing UI contract.

## How to run the phases

Use a **fresh Claude Design conversation for each phase**. Upload only the files listed for that phase, paste the corresponding prompt, and download the named outputs. Do not paste earlier conversations into the next conversation; carry forward only the small output artifacts listed below.

Claude Design has no GitHub access. Every path mentioned in a prompt refers to a file that must be uploaded from this repository. Keep each file's original basename so references resolve unambiguously.

Do not begin a later phase until the preceding output has been reviewed. If a phase identifies a genuine product decision, stop and resolve it rather than allowing the design agent to invent one.

## Phase 1 — post-architecture coverage audit

Prompt: `01_audit_post_architecture_view_coverage.prompt.md`

Upload:

- `prompts/design/claude-design/00_design_context_packet.md`
- `Design/DESIGN-HANDOFF.md`
- `Design/Bestehen-01-Design-System.dc.html`
- `Design/Bestehen-02-Mobile-Screens.dc.html`
- `Design/Bestehen-03-Desktop-Responsive.dc.html`
- `Design/Bestehen-04-Flows-Handoff.dc.html`
- `Design/support.js`

Download and retain:

- `design-05-post-architecture-coverage-audit.md`

## Phase 2 — UI foundation and shell delta

Prompt: `02_define_ui_foundation_and_shell_delta.prompt.md`

Upload:

- `prompts/design/claude-design/00_design_context_packet.md`
- `Design/DESIGN-HANDOFF.md`
- `Design/Bestehen-01-Design-System.dc.html`
- `Design/Bestehen-03-Desktop-Responsive.dc.html`
- `Design/support.js`
- Phase 1 output: `design-05-post-architecture-coverage-audit.md`

Download and retain:

- `design-06-ui-foundation-handoff.md`
- `Bestehen-05-UI-Foundation-Delta.dc.html`, only if Phase 2 proves a visual/component delta is necessary

## Phase 3 — critical view deltas

Prompt: `03_design_critical_view_deltas.prompt.md`

Upload:

- `prompts/design/claude-design/00_design_context_packet.md`
- `Design/DESIGN-HANDOFF.md`
- `Design/Bestehen-01-Design-System.dc.html`
- `Design/Bestehen-02-Mobile-Screens.dc.html`
- `Design/Bestehen-03-Desktop-Responsive.dc.html`
- `Design/Bestehen-04-Flows-Handoff.dc.html`
- `Design/support.js`
- Phase 1 output: `design-05-post-architecture-coverage-audit.md`
- Phase 2 output: `design-06-ui-foundation-handoff.md`
- Phase 2 visual delta, if one was created

Download and retain:

- `Bestehen-06-Critical-View-Deltas.dc.html`
- `design-07-critical-view-handoff.md`

## Phase 4 — implementation UI contract

Prompt: `04_produce_implementation_ui_contract.prompt.md`

Upload:

- `prompts/design/claude-design/00_design_context_packet.md`
- `Design/DESIGN-HANDOFF.md`
- `Design/Bestehen-04-Flows-Handoff.dc.html`
- `Design/support.js`
- every Phase 1–3 output created above

Download and retain:

- `DESIGN-IMPLEMENTATION-HANDOFF.md`

## Escalation-only source files

Do not upload these large files by default. Upload one only if Claude Design identifies a precise unresolved rule and names the file/section needed:

- `Design/uploads/28-bestehen-app-product-specification.md`
- `Architecture/28-bestehen-app-architecture-specification.md`
- `Architecture/13-frontend-application-and-design-system-architecture.md`
- `Architecture/14-responsive-accessibility-browser-and-device-architecture.md`
- `Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`
- `Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`
- `Architecture/20-account-local-first-profile-sync-export-and-deletion.md`
- `Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`

The escalation rule prevents a full architecture specification from consuming context when the compact context packet already answers the design question.

## Completion gate

This design pass is complete when every implementation-facing view or state is either:

1. linked to an existing design anchor;
2. linked to a new delta mockup; or
3. explicitly derivable from a named archetype plus a complete state contract.

It is not necessary to produce a separate high-fidelity frame for every loading, error, breakpoint or domain-state combination.

