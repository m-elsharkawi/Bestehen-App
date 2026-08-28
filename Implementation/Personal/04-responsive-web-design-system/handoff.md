# Personal Stage 04 execution handoff

Date: 2026-08-27 (Europe/Berlin)

Status: `04E` accepted at code candidate
`8b955c077546513dfc21bacc5b379c97b54b297c`. Exact-head CI and the bounded
private-staging checkpoint passed. This acceptance record is pending merge.

Draft PR: [#11](https://github.com/m-elsharkawi/Bestehen-App/pull/11)

The owner merged Planning-only PR #10 before Execution. Execution started from its
clean merge commit `c39ec9c1ecb3a3dd2220ea28f7f71ecf88322cf8`; accepted Planning
record `19a16e5ff781949879457e36eb1f912e075656ee` is an ancestor. The accepted plan is
`Implementation/Personal/04-responsive-web-design-system/plan.md`.

## Delivered boundary

- Added the exact 25-token light/dark semantic palette, named type, spacing, measure,
  target, motion, focus, responsive, reduced-motion, and forced-color rules. One CSS
  layout changes the four-destination navigation from compact bottom navigation to
  tablet navigation and a large-screen side rail. Bare and focused shells suppress
  product navigation as required.
- Self-hosted Bricolage Grotesque, IBM Plex Sans, and IBM Plex Mono WOFF2 subsets.
  The emitted font total is 262,144 bytes. Added the exact Threshold B brand geometry
  and a closed 20-icon Lucide registry. Licenses, immutable revisions, source paths,
  byte counts, and SHA-256 digests are recorded in
  `packages/design-system/assets/manifest.json` and `THIRD_PARTY_NOTICES.md`.
  Font loading deliberately remains always-on for this shared design-system stylesheet;
  the measured cost is 262,144 bytes, and all font URLs remain relative and self-hosted.
- Implemented the accepted APIs for all 43 component families and five typed skill
  regions. Consequential presentation consumes the complete versioned projection
  contract, fails closed for unknown majors/states, and keeps source lineage
  provider-neutral. Browser-local state is limited to the dialog and theme preference.
  The component gallery has one deterministic row for every family and 126 distinct
  rendered cases. Its 143 registry assertions either drive a public typed state/variant
  or prove a co-present owned subpart through a targeted selector and assertion.
- Added App Router bare, protected, App, attempt, result, session, and mock shells;
  root loading, error, not-found, sign-in, and failure states; and the four protected
  destinations plus Account/data routes. Server session resolution remains the only
  authorization boundary. Fake identity fails closed and no protected identifier is
  returned in a redirect.
- Added deterministic archetypes for Coach, Readiness, Progress, five skill regions,
  session/device and recent-auth states, source-cut export, revoke-first deletion,
  transfer, capability, interrupted-attempt recovery, and divergent Writing
  compare/select/merge. These are typed presentation fixtures only. Later stages own
  persistence, calculations, commands, provider work, and learner feature logic.
- Added the reciprocal source manifest and generated evidence copy. CI enforces the
  current exact inventory of 41 compact frames, eight large exemplars, 43 component
  families, 20 icons, and 37 board anchors. Architecture corrections prevent stale
  probability, account-optional, password, four-gate, provider-internal, and instant
  backup-erasure copy from returning.
- Added Chromium, Firefox, and WebKit semantic browser coverage, Chromium-only
  supplemental visual baselines, axe, keyboard/focus, dialog focus return, 320 CSS
  pixel, 200% text, 400% effective zoom spot, responsive navigation, reduced-motion,
  forced-color, no-third-party-request, forbidden-copy, and fail-closed route checks.
  The manual screen-reader script is `apps/web/tests/p04-screen-reader-script.md`.
- Added hard checks for asset origins/digests, exact coverage counts, and web budgets.
  The production result is 25,922 bytes gzip of App-owned client JavaScript, 3,729
  bytes gzip of CSS, 262,144 font bytes, and 1,863 bytes gzip of compiled icon/brand
  source. Next.js framework runtime is reported separately. No dependency was added.

No database or data migration exists in this stage. No service worker, web manifest,
install prompt, native client, productive provider call, provider SDK, learning
runtime, scoring, persistence, readiness calculation, export builder, deletion
processor, or Stage 05 work was added.

## Reviewable execution commits

- `743935469eacee03ca2631894101c4b786ffb6b9` defines the versioned UI projections,
  exact source inventory, and Stage 04 scope contract.
- `775ca39ee59d8fe6cdd65e2a64e10a03d5710124` builds the responsive design-system,
  local asset inventory, component gallery, and budget checks.
- `43c6819d258ffe5d0ee1ba327cd9c48e1cd9a6a1` adds the web shells, representative
  routes, browser suite, portable visual baselines, and accessibility lint fixes.
- `ee70711017a62e267bd2822774b11ffa49a8a6c6` preserves the existing package boundary
  by keeping the design-system projection seam presentation-only.
- `228adf906d63c97a485dbd5d3fcc8cbc8ab984c4` permits only the three accepted tracked
  source-coverage manifest files while preserving the generated-output prohibition.
- `a0e5bd63c6192f31ab137b9a34c5580217903d0c` adds the explicit 400% effective zoom
  browser spot and records the first complete execution handoff/checklist candidate.
- `068c9fac6e0566e4e343d39e1a58af2806eb490b` retains portable visual baselines with
  a bounded tolerance for verified macOS/Linux self-hosted-font raster differences.
- `8241a7fe5bddc531aea042c8458cb409aade7fe2` repairs the reciprocal manifest with
  real C01-C43 rows, compact IDs, collision-safe controls, and consequential
  projections.
- `21d6a5bc05202aab7d89ca3fa14768ecaa6db39b` adds the first-party pre-paint theme
  script, hydration proof, 320 through breakpoint-edge and 200/400 percent reflow
  coverage, accessibility interaction fixture, real gallery Overlay state, two-percent
  visual threshold, and source/target/executable-test manifest validation.
- `3e7d0838a8dc2f33f55696948783b1bbcb06fa36` completes the responsive large-text
  reflow repair and cross-browser native-modal containment proof.
- `a6b89fc78f3bd7f1cb3a330e243f976c9c3a41ee` restores the non-overlapping compact
  theme-control position after inspecting the failed Linux 390px visual artifact;
  this keeps the Account link visible at the unchanged two-percent visual limit.
- `d865245a1a697e6fa45af0b6fdc70df99dc192f9` normalizes the two added OFL license
  files so the baseline-range whitespace gate is clean.
- `42289bebbef3a9233b6c3e17f1b31b4b7a204b06` strengthens reciprocal manifest
  resolution, the complete consequential-projection seam, the pre-paint/no-script
  proof, and the immutable release evidence map.
- `3e8deafc2c32b04b0cbed1936d3d575f75c808e6` adds typed, meaningful gallery states
  for the remaining owned families, including C29 fault categories and all six C32
  readiness states with Gates A–F/Written/Oral assertions.
- `f62246f1a5407f08d63a9f3d26c4fa24beba7aa0` scopes the gallery dialog proof to its
  concrete C04 dialog case and asserts all 140 rendered gallery cases.
- `f5b2b9afca03f50829e69010ad37fb6793eec157` replaces the remaining gallery fallback
  overclaim with typed APIs for actual states and one-case targeted proof for co-present
  subparts, corrects ChoiceNav chip semantics, and removes provider/queue/storage jargon
  from rendered product copy.
- `a28ac3cac0d735e86b3c48558fedf387dc6f4c16` makes every Stage 04 evidence ID a
  required release-manifest field, maps them into both candidate workflows, adds a
  missing-P04 negative test, and preserves baseline-range whitespace checking in scope.
- `cf5b1f3c7b6972b5ef5d75eb9a9b1746d7eec5c1` gives sheet and destructive-confirm dialogs their distinct responsive and
  keyboard contracts, and closes every consequential state behind provider-neutral
  presentation labels with exhaustive negative-copy coverage.
- `e7dc34d24f63a84b3ff0591b40444754fbd7132f` makes the writing visual anchor request
  the typed, locally saved draft state explicitly and asserts its user-facing state
  before the unchanged two-percent screenshot comparison.
- `8b955c077546513dfc21bacc5b379c97b54b297c` records the stable saved-writing
  visual evidence after the repaired fixture passed locally and on exact-head Linux.

The documentation/checklist commit containing this handoff is the candidate head in
PR #11. Review and acceptance must use that exact head, not an earlier implementation
commit.

## Verification and evidence

Local deterministic checks used the repository-pinned Node `24.19.0`, pnpm
`11.23.0`, Playwright `1.62.1`, and macOS arm64. Provider adapters stayed fake and
external provider calls stayed disabled.

- `pnpm check` passed at the current code candidate with repository-pinned Node
  `24.19.0` and pnpm `11.23.0`: `P04-SCOPE-001` for 83 accepted paths, preserved
  scope fixtures and baseline-range `git diff --check`, `P04-COVERAGE-001`,
  `P04-ASSET-001`, exact-lock/runtime policy, secret scan, fake-provider readiness,
  format, lint, typecheck, package boundaries, 183 unit tests across 16 files,
  release-manifest tests, production build, `P04-PERF-001`, and generated-file
  policy. The current product-owned client result is 25,922 bytes gzip and CSS is
  3,729 bytes gzip.
- `pnpm test:e2e` passed 55 tests with two expected skips. Firefox and WebKit skip
  only the duplicate raster comparison; Chromium owns seven portable supplemental
  baselines at a maximum two-percent pixel difference. All three engines pass every
  accepted breakpoint edge, representative 200% text reflow, 400% text reflow spot,
  portrait/landscape resize with draft/theme retention, history return, pre-paint theme
  hydration check, JavaScript-disabled server-content proof, all 43 gallery families,
  126 distinct renders with 143 explicit variant/subpart assertions, responsive
  sheet positioning, destructive-confirm Escape prevention with explicit Cancel/Confirm,
  and native modal focus containment/Escape/focus-return proof.
- The `writing-768` visual route explicitly selects the existing `autosave` fixture
  variant through its test-only query contract. This avoids platform-dependent default
  state selection; the test asserts the saved-draft notice before comparing the same
  checked-in screenshot at the unchanged two-percent limit.
- The exact-head Linux browser run `33103277759` initially failed only its
  `coach-390-light` visual comparison: the image inspection showed that a repaired
  fixed theme control covered the Account link, rather than a font-raster-only
  difference. The one-line correction in `a6b89fc78f3bd7f1cb3a330e243f976c9c3a41ee`
  restored the non-overlapping position; the local Chromium visual suite then passed
  all seven anchors at the unchanged two-percent threshold. A subsequent exact-head
  Linux run `33103928671`
  still measured a three-percent platform glyph-raster difference for that sole
  anchor, with all 48 semantic checks passing. The test now applies deterministic
  font smoothing and geometric text rendering before its screenshots; the
  two-percent cap is unchanged and no semantic or visual case was removed.
- Exact-head runs [`33109916283`](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/33109916283)
  and [`33109918908`](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/33109918908)
  for accepted implementation candidate `8b955c077546513dfc21bacc5b379c97b54b297c`
  passed every job: browser/accessibility, static/unit/build/release, OCI,
  PostgreSQL/process, frozen policy, critical advisory audit, and
  evidence/release-manifest. The independent acceptance record is
  [attached to PR #11](https://github.com/m-elsharkawi/Bestehen-App/pull/11#issuecomment-5444442768).
- `pnpm test:process` passed the web shutdown test. Two worker cases skipped because
  the local run had no integration database.
- `pnpm test:integration` selected the three PostgreSQL cases and skipped them because
  no test database was configured. CI remains authoritative for real PostgreSQL.
- `pnpm check:advisories` reported no known vulnerabilities at the mandatory critical
  threshold. `pnpm check:docs` passed.
- `git diff --check c39ec9c1ecb3a3dd2220ea28f7f71ecf88322cf8..HEAD` passed for the
  baseline range, including the normalized OFL files.
- Local `pnpm test:oci` correctly failed closed with `Docker daemon is required for
  the non-waivable OCI gate.` CI remains authoritative for OCI.

Evidence IDs map as follows:

- `P04-TOKEN-001`, `P04-SEMANTIC-001`, `P04-COMPONENT-001`, and `P04-COMPAT-001`:
  design-system, token, UI projection, source-manifest, facade, and component tests.
- `P04-ROUTE-001`, `P04-A11Y-001`, `P04-RSP-001`, and `P04-SECURITY-001`:
  `apps/web/tests/p04-responsive.spec.ts` and the screen-reader script.
- `P04-VISUAL-001`: seven Chromium baselines at 320, 390 light/dark, 768, 1024, and
  1280 widths, with a maximum two-percent pixel difference. The test normalizes font
  smoothing and geometric text rendering before screenshots; semantic and responsive
  checks remain authoritative, and no tolerance was raised or visual case removed.
- `P04-ASSET-001`, `P04-COVERAGE-001`, `P04-PERF-001`, and `P04-SCOPE-001`: the four
  repository checks in `scripts/` and their negative fixtures.
- All 13 Stage 04 IDs are immutable required properties in the release-manifest schema
  and appear in both the CI and release-candidate candidate evidence maps.

The pinned browser manifest is Chrome for Testing `151.0.7922.34` / Chromium build
`1234`, Firefox `153.0` / build `1538`, and WebKit `26.5` / build `2336`. WebKit is not
claimed as branded Safari. On macOS, WebKit link tabbing follows the host full-keyboard
access preference, so the automated WebKit test explicitly focuses the skip link
after the initial Tab. Branded Safari, Chrome, Firefox, Edge, Android, iPhone, and
assistive-technology runs remain manual staging gates; no such run is claimed here.

## Security, compatibility, and rollback

- All existing fake adapters and disabled external/provider/product flags are
  unchanged. Test fixtures are served only when both the App environment is `test`
  and the synthetic Playwright release commit is present. Fixtures do not call the
  network, contain private data, or authorize a route.
- No protected Auth0 field, secret, OTP, session, provider ID, private origin, or
  learner data appears in source, screenshots, logs, manifests, or handoff evidence.
  Personal copy requires the owner's email code and offers no password fallback.
- The projection union rejects unknown major versions and states. Domain IDs and
  server authorization remain outside the design-system. Provider, queue, storage,
  and model terminology is absent from user-facing contracts.
- The change is additive at deployment boundaries and has no migration ordering.
  Rollback keeps providers fake/disabled, reverts the Stage 04 commits to predecessor
  `c39ec9c1ecb3a3dd2220ea28f7f71ecf88322cf8`, rebuilds web, and runs the existing
  health/browser checks. It does not rewrite data or Stage 03 identity/session state.

## Private-staging acceptance and named limitations

The orchestrator deployed exact code candidate
`8b955c077546513dfc21bacc5b379c97b54b297c` to the private Coolify staging web,
worker, and migrator resources. The migrator deployment completed successfully at
that source revision; the exited-container log view did not retain a fresh receipt
body, so no receipt payload is claimed. The worker reached its foundation-ready
supervisor state with the exact release marker. The web resource reported healthy
after both the fake-first deployment and final cleanup deployment.

The bounded branded-Chrome smoke verified the private signed-out shell, protected
fail-closed behavior while identity was fake/disabled, skip-link focus transfer,
theme cycling, semantic navigation order, first-party self-hosted font loading, and
the absence of App-owned third-party page assets. A temporary Auth0-only window then
verified the hosted email-OTP identifier flow and successful protected callback. No
identity, OTP, cookie, secret, private origin, provider response, or session value was
captured. The window was closed by restoring `BESTEHEN_AUTH_ADAPTER=fake` and
`BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS=false`; both values were visibly re-verified
in Coolify before an exact-commit redeployment completed successfully.

The Chrome connector could not independently resize the browser viewport or change
browser zoom, and host Computer Use permission was unavailable for a real VoiceOver
run. Therefore no live 320-pixel, 200/400-percent zoom, or branded assistive-technology
result is claimed. The mandatory deterministic Chromium/Firefox/WebKit reflow,
keyboard, axe, reduced-motion, forced-color, and visual coverage remains passing in
exact-head CI. These named live-device limitations are deferred honestly and do not
weaken or replace that CI coverage.

For issue #12 finding 2, the owner selected Done-when option (b). The inert C08,
C11-C14, and C39-C41 fixtures now expose only static content or behavior supplied by
native form controls. They do not claim a tab widget, matching or ordering commands,
live answer or recording announcements, media playback or capture, autosave, or draft
resolution. Controls whose commands have no Stage 04 runtime are visibly disabled.
Stage 05 owns those interactions, persistence, and event-driven announcements. This
handoff claims accessible fixture content and native text, radio, and checkbox entry
only.

## Stage 05 inputs

Stage 05 should reuse the versioned UI projection seam, App/Attempt/Mock shells,
five skill-region slots, semantic status grammar, route guard, and deterministic
fixture approach. Stage 05 replaces only the relevant synthetic content/attempt
fixtures with its own server-owned runtime. It must not fork the navigation, tokens,
component families, validity/Readiness vocabulary, or source manifest.

Stop after merging accepted 04E. Do not begin Stage 05 from this handoff.
