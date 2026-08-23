# Bestehen implementation prompt packs

These prompts turn the approved architecture and Design handoff in `https://github.com/m-elsharkawi/Bestehen-App` into two sequential delivery programs. Workers must verify that the checked-out `origin` is that repository before changing anything; a local folder name is not proof.

- `personal/`: a private, single-owner release on Coolify, with Cloudflare R2, Auth0, and commercial AI APIs.
- `commercial/`: the later multi-user release, including the Coolify-to-Render migration and closure of commercial launch gates.

Every numbered stage has two prompts:

- `P` plans the stage, resolves ambiguities, and records a bounded execution contract without changing production code or external services.
- `E` executes only the accepted plan, tests it, updates the live checklist, and writes a handoff.

Run the matching orchestration prompt in `orchestration/`. It resumes from GitHub, starts exactly one subagent at a time, accepts Planning before Execution, independently verifies the result, and does not advance past a failed gate.

## Authority order

When sources disagree, use this order:

1. `Architecture/28-bestehen-app-architecture-specification.md` and its incorporated ADRs/stage artifacts.
2. The relevant detailed files under `Architecture/`.
3. `prompts/implementation/DESIGN_REVIEW_NOTES.md` and the active deployment profile in the current pack.
4. `Design/DESIGN-IMPLEMENTATION-HANDOFF.md`, the original Design handoff, and the six `.dc.html` boards.
5. Supporting product/context material.

The personal deployment profile deliberately overrides the architecture's initial Render topology and account-optional presentation. It does not erase those commercial requirements. The commercial pack restores or explicitly supersedes them with evidence.

## Repository workflow

- The GitHub repository is the system of record. Begin by fetching and inspecting it; never rely only on chat context.
- Use one short-lived branch and pull request per numbered stage. Planning and Execution share that stage branch; Execution begins only after Planning is accepted.
- Merge a stage only after its execution checks and handoff are accepted. Then start the next stage from the new default-branch head.
- Keep the active checklist current in the same commit as the evidence it references.
- Never commit secrets, tokens, private keys, recordings, production data, or local environment files.

## Human actions and secrets

Agents must not ask ordinary design questions. They choose the safest architecture-consistent default, record it, and proceed. When a provider requires a human account owner, payment method, domain change, legal acceptance, or secret entry, the agent writes an exact step-by-step guide and a verifiable owner-action gate. It continues all work that can be completed with local emulators, fake adapters, placeholders, or staging configuration. A stage may remain blocked only when that external action is genuinely required to validate or cut over the stage.

Do not paste secrets into issues, pull requests, logs, chat, screenshots, or guides. Refer to secret names and provider dashboards only.

## Scope guard

This program builds one responsive web application. Compact Design frames are semantic responsive-web references, not a request for iOS, Android, React Native, Flutter, or another native client. Do not add native mobile applications or PWA-installability work. Preserve 320 CSS-pixel reflow, keyboard, assistive-technology, and 200% zoom quality gates.
