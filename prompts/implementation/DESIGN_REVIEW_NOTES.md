# Quick Design implementation review

Reviewed against the final architecture before creating the implementation packs.

## Outcome

The Design folder is sufficiently complete to implement the responsive web views without commissioning another full mockup pass. Its current handoff provides route/state coverage, 43 reusable components, 20 icons, 41 compact responsive-web frames, eight large-screen exemplars, accessibility notes, and suggested vertical slices.

Implementation agents must use the Design files as interaction and visual anchors, not as an independent behavioral specification. The support script is preview tooling only.

## Required Design inputs

- `Design/DESIGN-IMPLEMENTATION-HANDOFF.md`
- the original Design handoff in `Design/`
- `Design/Bestehen-01-*.dc.html` through `Design/Bestehen-06-*.dc.html`
- `Design/design-05-*.md`, `Design/design-06-*.md`, and `Design/design-07-*.md`
- the relevant architecture stage/ADR for the feature being built

## Corrections that every implementation stage must preserve

1. Architecture has higher authority for domain behavior, state machines, security, accessibility, data rights, and operations.
2. The personal profile requires Auth0 sign-in and closed registration. Do not render the old “no account wall” promise. Preserve account-optional/guest contracts behind a disabled feature flag for later commercial restoration.
3. Auth0 Universal Login uses email OTP only. Ignore Design wording about password changes.
4. Account views need a current session/device list, revoke-other-sessions, and recent-auth handling.
5. Export must be the architecture-defined source-cut ZIP with README, accessible summary, profile, attempts, evidence, learning state, readiness, writing/evaluation material, content references, activity CSV, deletion/audit data, and checksummed manifest. Exclude raw audio, secrets, and restricted source bytes. Default artifact expiry is 24 hours and may never exceed seven days.
6. Deletion must not promise that backups can never be restored. Revoke access first, suppress restored data before exposure, purge live/provider data idempotently, expose partial/provider-pending states, and retain no falsely terminal status. Encrypted inaccessible residuals may remain only within the architecture's bounded backup window; raw audio follows its immediate deletion/seven-day ceiling.
7. Preserve both branches of divergent writing drafts. Add a neutral, accessible compare/select/merge recovery view even though the Design board does not draw it.
8. Session-expiry copy cannot promise that an interrupted attempt “still counts.” Preserve the draft, elapsed time, and attempt conditions, then let the server determine validity.
9. Use the current Design counts: 43 components, 20 icons, all 41 compact responsive-web frames, and eight large-screen exemplars. Older architecture inventory counts are stale.
10. Self-host font, icon, and logo assets with licenses and content digests. Do not copy external Google Fonts links from `.dc.html` files.
11. Compact or “mobile” frames describe one responsive web product. They do not authorize an iOS, Android, React Native, Flutter, or PWA-installability project.
12. Keep 320 CSS-pixel, 200% zoom, keyboard, screen-reader, high-contrast, and reduced-motion acceptance tests.
13. Previously open Design decisions are resolved as follows: use a 65-year personal planning horizon; use the architecture notification policy; use the architecture export contract; use neutral bounded readiness copy. Only the personal closed-registration profile temporarily overrides account-optional presentation.

## Required acceptance evidence

- a source-anchor manifest mapping routes, states, components, icons, compact frames, and large-screen exemplars to implementation tests;
- architecture-versus-Design conflict resolutions and regression tests;
- semantic state and reason-code fixtures independent of styling;
- Auth0 OTP, session, authorization, export, purge/restore, raw-audio deletion, draft-conflict, and session-expiry tests;
- golden export ZIP fixtures and assistive-technology-readable summaries;
- asset license/digest inventory with no external font dependency;
- automated and manual WCAG evidence across representative compact and large layouts.
