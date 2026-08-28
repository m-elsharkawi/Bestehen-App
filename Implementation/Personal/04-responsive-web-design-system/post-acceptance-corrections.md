# Stage 04 post-acceptance corrections

Reference for anyone building on Stage 04. Everything below landed **after** checklist line `04E`
was accepted, so it is not described in `handoff.md`.

- **Baseline:** `origin/main` (Stage 04 acceptance) → local `main` `1854963`
- **13 commits**, 22 files, +537 / −70
- **Not on `origin/main`.** Also pushed as `fix/p04-board-fidelity`. Held unpushed on `main` because
  pushing `main` fires the full CI workflow and Actions credits are nearly exhausted.
- **Verified locally on a committed tree:** `pnpm check` exit 0 · `pnpm test:e2e` 66/66 across
  Chromium, Firefox and WebKit · `pnpm test:visual:container` 9/9 in the pinned container.

## Why this work exists

Stage 04's automated visual gate compares full-page screenshots at a pixel-ratio tolerance. That
catches raster drift; it cannot catch a card painted with `--surface-sunken` where the board uses
`--raised`. Nobody had put the running UI beside the accepted Design boards and looked. A manual
pass did that, found five defects, and two rounds of owner design review found four more.

The recurring failure mode was **the right token in the wrong role** — every value legal, every
role wrong. Worth remembering when extending the system.

---

## 1. Changed public API — read this before writing Stage 05 views

### `ShellSlots` (`packages/design-system/src/contracts.ts`)

```ts
/** Extra header-flow utility controls, placed before the shell's own controls. */
readonly utilityHeader?: ReactNode;

/**
 * Main/aside width ratio for the `content-with-aside` grid at >=1024px.
 * "default" is the 2:1 split (LG-D2 readiness, LG-V3 progress, LG-V7).
 * "narrow-aside" is the 7:5 (1.4) split required by LG-D1 (coach).
 */
readonly contentSplit?: "default" | "narrow-aside";
```

`.content-with-aside` had a single `2fr / 1fr` rule from 768 up. That is correct for LG-D2, LG-V3
and LG-V7, and wrong for LG-D1, which requires 7/5. **A new view with an aside must choose its
split deliberately** — the default stays 2:1.

### `ThemeControl` — new export, new home

Moved from `apps/web/src/ui/theme-controller.tsx` into
`packages/design-system/src/theme-control.tsx` and exported from the barrel. It is **no longer in
the shell header**; it renders inside Account under an "Appearance" card. `AppShell` renders no
theme control at all, and embedded (gallery) shells never render one.

### `ClozeGap` — extended additively

```ts
export type ClozeGapStatus = "active" | "filled" | "unvisited";
// ClozeGap({ number, state, status, options, word })
```

`status`, `options` and `word` are optional; every pre-existing call site renders identical DOM.
A module-private `ClozeGapIndex` backs the persistent gap index.

### New token

`--radius-panel: 7px` in `tokens.css`. Board UI cards measure 7px; `--radius-medium` (12px) was too
soft. `.card`, the aside panel and the desktop active-nav pill all use it. **`.skeleton` still uses
`--radius-medium`** — no board evidence to move it.

---

## 2. Design corrections, with measured values

| Area | Board | Was | Now |
|---|---|---|---|
| Desktop rail surface | `#FFFFFF` (`--raised`) | `--surface-ink` navy | `--surface-raised` + hairline |
| Active destination | `--ink` fill, `--on-ink` text, 7px | `--accent-base` green, 0px, full-bleed | ink pill, 7px, uniform width |
| Evidence aside | one raised white panel | `--sunken` grey **with a `.card` nested inside** | single raised panel, zero nesting |
| `h1` | 600 / −0.02em / lh 1.15 | 700 / normal / 1.08 (browser default) | 600 / −0.0200em / 1.150 |
| `h2` | 600 | 700 | 600 |
| Card radius | 7px | 12px | 7px |
| Coach split (LG-D1) | 1.400 | 2.000 | 1.400 |
| Cloze two-column (LG-V4) | 1.55fr / 1fr at 768+ | **did not exist** | 1.5499 from 768 |
| Rail label | 15px / 600 | 12px / 650 | 15px / 600 |
| Rail row | 212×44 | 191×60 active, 207×60 others | 207×44, uniform |
| Dark `.action-primary` | — | **1.19:1** vs its card | **13.92:1** |

Notes that matter downstream:

- **`h1` declared no `font-weight` and no `letter-spacing`**, so headings inherited the browser
  default 700/normal. Any new display-face heading should rely on the now-explicit rule.
- **Dark theme had an invisible primary action.** `--surface-ink` resolves to `#070C15` against a
  `#17202D` card. Fixed by inverting `.action-primary`'s own fill/label pair in dark rather than
  redefining the shared token, which still backs the rail pill and the timer. **Check any new
  filled control against its dark surface**, not just its light one.
- **Nav active state is not colour-only** — a 3px rule on the bottom bar, a filled pill on the rail.
  Every destination reserves the rule so marking one does not shift its label 1.5px.
- **The boards are flat.** An earlier claim that they lean on `--shadow-2` was wrong: `--shadow-2`
  appears only on the browser-chrome mock that frames a desktop board, which is a presentation
  device, not a component. Board UI cards are flat with a 1px border. Do not add elevation.

### LG-V4, built from nothing

`LanguageElementsRegion` (the manifest's target for C38 "ClozeTextPane") rendered one `<article>`
with a single inline gap, and `styles.css` contained **zero** cloze rules. Board 06's 768 tablet
exemplar defines the contract: the option list and the gap grid leave the text flow into a side
column, the passage stays under 720px, tab order remains gap → gap → action with the side column
not a tab stop, and **≥1024 keeps the same layout — no third arrangement**. Implemented as a server
component; no client island. The coverage manifest regenerates byte-identically because no anchored
export was added.

### Shell corrections from owner review

- **Brand sits at `x=16` at every width.** It was at `x=249` on desktop because the rail owned the
  first grid column and the header only spanned the second. The header now spans **both** columns
  with the rail beneath it.
- **Product name is "Bestehen"**, not "Bestehen / App" — wordmark, `<title>`, template and the home
  link's accessible name.
- The wordmark is no longer hidden below 360px, but it **must stay breakable**: at 320px under 400%
  text scaling a `nowrap` wordmark exceeds the viewport and fails `P04-RSP-001` on all three
  engines. It uses `overflow-wrap: anywhere` rather than `white-space: nowrap`.

### Deliberate divergence from the boards

Board 03 D1 draws a **full-height rail with the brand inside it**. This shell instead spans the
header across the top so the logo sits in the true corner. That is an owner decision taken after the
board comparison, not an oversight. **Do not "correct" it back** — raise it with the designer if it
needs revisiting.

---

## 3. Tooling and infrastructure

### `scripts/check-design-coverage.mjs` — `filesUnder()` fixed

It walked `apps/`, `packages/` and `scripts/` with no exclusions: **3,107 files**, overwhelmingly
dependency code including zod's own test suite, while hunting for this repo's check ids. It also
descended into `apps/web/.next`, following a self-referential pnpm symlink chain until the path
exceeded the OS limit, and raced Next's transient `next-build-backup-*` directories.

Now skips `.next`, `dist`, `node_modules` and never follows symlinks: **159 files, all 13 coverage
ids preserved** (verified by diffing the id sets, not by trusting a green check). The exclusion list
is deliberately narrow — `packages/design-system/src/coverage` is tracked source, so excluding
directories by a generic `"coverage"` name silently drops the manifest's own test.

**Consequence:** `pnpm test:unit` and `pnpm check:coverage` no longer fail when a build is on disk.

### `Dockerfile.visual` — dependency layers cached

`COPY . .` sat above the install, so every source edit re-ran `pnpm install`, re-downloaded Chromium
and re-installed apt dependencies — 3–4 GB rebuilt per baseline regeneration, which repeatedly
exhausted the disk and wedged the Docker daemon.

Manifests are now copied first, then install and browser fetch, then the source. **A source edit
rebuilds in ~17s with 17 cached layers** (cold build 54s), raster output unchanged.

`pnpm-workspace.yaml` sets `injectWorkspacePackages: true`, so pnpm **copies** workspace packages
into `node_modules` rather than symlinking. A manifest-only install injects empty copies that the
later source copy does not repair — hence the `--offline` re-link after `COPY . .`. **Do not remove
it**, and do not move `COPY . .` back above the install.

### Visual anchors: 7 → 9

Added `language-768` (LG-V4's contract turns on at exactly 768) and `mock-1280` (LG-D4's 720px
measure, a numeric contract with nothing holding it). Both baselines generated in the pinned
container and verified without `--update`.

`maxDiffPixelRatio` is **`0.0024`**, not the `0.02` older notes state.

---

## 4. Verification lessons worth inheriting

Each of these was a real failure during this work.

1. **Kill servers by port, not by process pattern.** `kill -9 $(lsof -t -iTCP:3300)`. The process is
   named `next-server`, so `pkill -f "standalone/apps/web/server.js"` misses it. A surviving server
   serves stale HTML with freshly rebuilt CSS from disk — plausible-looking and wrong. Assert
   something in the served HTML that only exists after your change before trusting a measurement.
2. **Rebuild after switching commits.** A `|| pnpm build` guard that sees an existing `.next` skips
   the rebuild and silently measures the old code.
3. **`pnpm lint` and `pnpm format:check` are different commands.** Lint passing does not mean
   formatting passes.
4. **Run all three Playwright projects.** A chromium-only run hid a genuine cross-browser bug: the
   `size` attribute acts as an intrinsic width floor in Firefox and WebKit but not Chromium, so a
   filled cloze gap pushed the passage 24px sideways at 320px/400% and failed `P04-RSP-001`.
5. **`pnpm check` refuses a dirty worktree** (`test:release`). Commit, then verify.
6. **Do not read an exit code through a pipe.** `cmd | tail` reports `tail`'s status; a failed
   Docker build looked like success.
7. **Inject the app's fonts before capturing a board** and assert `document.fonts.check(...)`.
   Otherwise the board falls back to system fonts and the type comparison is void.
8. **"Invalid signature / repository is not signed" from apt inside a build means the Docker VM's
   overlay is full**, not a security or network problem.
9. **A baseline that regenerates is not a baseline that passes.** Always follow
   `test:visual:update` with a plain `test:visual:container`.

---

## 5. Known gaps in the design source

- **The boards define no dark exemplars.** The dark palette exists only at token level, which is
  why a 1.19:1 invisible primary action survived review. Dark-theme work has no board to check
  against — verify contrast numerically.
- **Board 06 frame 6.2 contains the banned phrase "it still counts."** The app correctly refuses it
  and defers validity to the server. The board is stale; plan §4 wins.
- **C38's manifest anchor is "ClozeTextPane" but targets `LanguageElementsRegion`.** The name
  mismatch is pre-existing and unresolved.
- **First-load budget headroom is thin:** ~196 KB gzip against a 200 KiB ceiling. Stage 05 adds
  substantial runtime surface — treat the budget as a design constraint from the start.
