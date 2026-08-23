# Bestehen design-agent context packet

Use this file as the compact authority bridge between the existing design artifacts and the completed architecture. Do not assume GitHub access or request the entire repository.

## Authority and task boundary

Apply this order when uploaded sources disagree:

1. final product rules summarized here;
2. post-architecture reconciliations summarized here;
3. `DESIGN-HANDOFF.md` and the human-authored `.dc.html` design files;
4. illustrative renderer/runtime behavior.

This is a design-completion exercise. Do not write production application code, choose new architecture, invent product policy, or redesign screens already covered. Preserve the existing visual identity and component system.

## Product and information architecture

Bestehen is a responsive German TELC B1 exam coach. It takes a learner from roughly A1 toward a defensible pass decision through one shared loop:

**Observe → Attempt → Diagnose → Repair → Retry → Remember**.

The five skills are Reading, Language Elements, Listening, Writing and Speaking. They share one attempt shell, one result foundation, one repair foundation and one evidence-label system; modality-specific input regions extend that foundation rather than fork it.

The four destinations remain in this order on every device: **Coach · Readiness · Train · Progress**. Review and Mocks live inside Train. Frames are process/layout states, not necessarily routes.

Written and Oral are independent pass gates. One may never compensate for the other. There is no pass-probability field, percentage, chart or copy. Missing Readiness is absence, never zero.

## Existing design coverage

Treat these as existing assets to audit and reuse, not work to recreate:

- `Bestehen-01-Design-System.dc.html`: semantic tokens, both themes, 41 components and UI state models.
- `Bestehen-02-Mobile-Screens.dc.html`: 26 current mobile frames across arrival, daily loop, skill extensions, Readiness/mocks and recovery/data states.
- `Bestehen-03-Desktop-Responsive.dc.html`: four desktop layouts, one tablet layout and fixed breakpoint behavior.
- `Bestehen-04-Flows-Handoff.dc.html`: Flows A–G, recovery, accessibility, coverage and acceptance material.

Older prose says 24 mobile screens; the actual source has 26. All 26 must remain covered, but no route-per-frame assumption is allowed.

## Binding post-architecture corrections

These rules supersede stale design wording without requiring a product decision:

1. The first diagnostic is a resumable five-skill foundation route, normally 18–22 minutes with a hard 30-minute ceiling. A six-minute partial probe may yield useful `evidence_building`; it may not claim complete placement.
2. AI evaluation copy must reflect measured policy, not promise a provider time. The accepted baseline seeks first useful feedback around 15 seconds and moves to explicit Pending around 30 seconds under connected degradation.
3. Ready to Book has authoritative Gates A–F. The UI may group them for comprehension but must expose every failing reason.
4. The weakness lifecycle is Candidate, Historical/Unconfirmed, Known, Repairing, Stabilizing, Repaired, Resolved, with reopen-to-Known behavior. Learner-facing views may project a subset without deleting truth.
5. Deletion revokes access and starts live purge immediately. Inaccessible encrypted backup residual may remain, under restore suppression, for at most 91 days. Raw learner audio is excluded and has the stricter immediate-after-finalization / seven-day absolute ceiling.
6. `practice-only` is an eligibility/condition projection, not a sixth evidence-validity value.

## Immutable learner-visible semantics

Evidence validity has exactly five stored/API values:

`valid` · `partially_valid` · `pending` · `interrupted` · `not_counted`

Readiness has exactly six values:

`evidence_building` · `not_ready` · `borderline` · `safe` · `ready_to_book` · `stale_contradicted`

Safe is not Ready to Book. The official pass line 60 and Bestehen's versioned Safe default 65 are distinct. Every system/content/media/network/device/evaluator/identity/storage fault is neutral and scoped; it cannot become a weakness, low score, zero or Readiness decline.

P0–P4 are local task-family conditions, never a global learner level or collectible badge. Assistance, timing, exposure, freshness, interruption and accessibility condition remain visible and read-only.

## Current implementation/provider decision

The first implementation uses:

- Coolify on owner-operated Linux servers for the web application, worker and PostgreSQL;
- Cloudflare R2 for private S3-compatible object storage and off-server backups;
- Auth0 from the personal phase onward;
- commercial AI APIs for Writing evaluation, Speaking evaluation, speech recognition and speech generation.

Provider names should not normally appear in learner UI. Design consequences are limited to capability states:

- Auth0 Universal Login owns credential entry; Bestehen needs signed-out redirect, callback failure, session-expired, access-denied and account/profile/data surfaces—not a custom password form.
- The personal deployment is closed-registration and authenticated. Preserve the architecture's app-owned learner ID and future account-optional/guest adoption capability unless the owner explicitly removes it.
- R2 is private implementation infrastructure. The learner sees upload/progress/retry/deletion behavior, never buckets, keys or storage-provider controls.
- AI/STT/TTS are asynchronous replaceable capabilities. The learner sees processing, Pending, partial/unavailable, retry/fresh-sample and deterministic fallback behavior, never provider routing or model selection.

## Responsive and accessibility contract

- Phone: one column, bottom navigation, sheets, sticky single action.
- 480–767 px: deliberately phone-like with centered measure; no extra layout.
- Tablet: top rail, two-up Readiness, Writing prompt/editor split, centered dialogs.
- Desktop: persistent left sidebar; Coach uses a 7/5 plan/context split.
- Large desktop adds one read-only Readiness claim-plus-audit view; it does not add more charts.

WCAG 2.2 AA is a release criterion. Preserve 320 px reflow, 200% zoom, 44×44 targets, keyboard completion, screen-reader meaning, reduced motion, no color-only status, text-equivalent charts, drag-free alternatives, controlled timers, focus restoration and the existing announcement contract.

## Visual and copy invariants

Preserve the existing Bricolage Grotesque / IBM Plex Sans / IBM Plex Mono typography, semantic token system, restrained elevation, Lucide subset and both themes. Do not add mascots, confetti, trophies, streak economies, probability, AI chat as the product, TELC accreditation styling, Corpus tooling, billing, social or enterprise-administration surfaces.

Coach copy is factual, calm and brief: observation, meaning, next action; maximum three sentences. System faults begin from neutral ownership rather than learner blame. The established production-intent copy should be reused unless a binding correction above requires a delta.

## Token discipline

- Cite existing artifact anchors instead of restating them.
- Design only proven gaps or ambiguous high-risk states.
- Represent repeated state variants in an annotated matrix or component state board rather than full duplicate screens.
- Stop after the requested phase and return only the named deliverables plus a concise handoff.

