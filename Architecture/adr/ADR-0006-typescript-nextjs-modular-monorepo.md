# ADR-0006 — TypeScript Next.js modular monorepo

> **Status:** Accepted
> **Owner:** Stage 03
> **Date:** 2026-08-23
> **Decision IDs:** `ARCH-S03-D01`, `ARCH-S03-D06`, `ARCH-S03-D07`, `ARCH-S03-D08`
> **Supersedes / superseded by:** None

## Context

Bestehen needs one responsive, accessible browser product, authoritative server commands, durable asynchronous evaluation and a solo-maintainable repository. Stage 01 requires deterministic-first, explicit uncertainty and release-gated accessibility; Stage 02 keeps learner semantics in the App and external processors behind ports. The design React support runtime is illustrative and not a production mandate.

Current inputs are App `main@b8924677b0750e6507f9e50467dbd69465c94a64`, Stage 01 blob `cc8d28816f43d627861d11cd90e8770c4c96414c`, Stage 02 blob `046d114bbbc96528bf0b9eae0406c0235f759127`, design handoff blob `417a6820037e045e2dd9f29afc42b9f2e94fd638`, design support blob `cb009b69ec6b5e00f48c6287a587fe7e0c6c421b` and shaping final product blob `18ae80cc2fd63cecd76c297c3e56d44a68367856`.

Official sources accessed 2026-08-23 identify Next.js 16 as Active LTS under the [support policy](https://nextjs.org/support-policy), describe full-feature [Node deployment](https://nextjs.org/docs/app/getting-started/deploying), and set version-16 runtime/browser floors in the [upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16). Node 24 is an LTS line in the official [release schedule](https://nodejs.org/en/about/previous-releases). pnpm provides native [workspaces](https://pnpm.io/workspaces) and explicit [supply-chain controls](https://pnpm.io/supply-chain-security).

## Decision

Use one private pnpm workspace monorepo with exact Node.js 24 LTS and pnpm 11 patches, TypeScript 5.9 strict mode, Next.js 16 Active LTS/React for one same-origin responsive web application and one standard Node worker.

Keep explicit dependency direction: `apps` compose; infrastructure implements application ports; application depends on contracts/domain; domain imports no workspace package. Keep content, design-system and test-support responsibilities named. Do not create a generic shared/utils package, publish internal packages, or add a build orchestrator before measurement.

Browser support remains current/current-previous Chrome/Edge, Firefox and Safari. Semantic HTML, focus/live regions, 320px reflow and capability-local fallbacks are release evidence. Framework caches and client state are never learner truth. Provider SDKs remain infrastructure-only.

Commit one frozen lockfile, pin tool patches, disable dependency install scripts unless reviewed/allowlisted, apply a seven-day normal minimum-release age, and verify dependency review/signatures where available. Generated contracts are deterministic, labeled and CI-diffed or build-only; design runtime files are never production inputs.

## Alternatives

- **React Router framework with custom Node server:** credible and portable, but adds rendering/server/build assembly without a current product benefit.
- **Vite SPA plus separate API/worker:** portable, but creates another deployable/origin and duplicates auth, caching and failure plumbing.
- **Static/local-browser only:** cheapest and simplest deployment, but cannot satisfy durable governed evidence, productive-job recovery, cross-device adoption or controlled export/delete.
- **Polyrepo or heavy monorepo orchestrator:** separate release ownership does not yet exist; cross-repo version coordination or caching machinery would add cost before measured need.

## Consequences

One language and atomic repository changes reduce coordination. Pure domain/application boundaries preserve provider and framework exit; standard Node output can move to another host or OCI image. Same-origin delivery reduces browser/API surface. Costs include a framework release cadence and the need to enforce boundaries rather than assume folders do so.

No Next/React API may enter the domain. If Next becomes unsuitable, preserve contracts/domain/application and replace the web composition layer. Add a build graph/cache only after a 30-day sample shows median clean CI over 10 minutes or redundant workspace work over 30%. TypeScript 6 adoption waits for a clean full matrix. Start runtime/framework upgrade evaluation six months before support end and finish three months before.

## Validation and review trigger

Stages 14/25 own current/current-previous browser, semantic HTML, keyboard, screen-reader, live-region, zoom and 320px evidence. Stage 25 owns forbidden-import, frozen-lockfile, migration, unit/component/browser and dependency-review gates. Stage 26 owns an exact reproducible deployment and host exit drill.

Supersede this ADR if an independent ownership/release/security boundary justifies repository separation, standard Node deployment cannot meet an accepted SLO, or release-grade accessibility cannot be achieved after component-level remediation. A new ADR must preserve learner truth and include a migration/rollback plan.

## Traceability

- Product/design sources: `app/28-bestehen-app-product-specification.md`; `app/25-business-model-and-product-boundaries.md`; `app/26-platform-accessibility-nonfunctional.md`; `Design/DESIGN-HANDOFF.md`; `Design/Bestehen-03-Desktop-Responsive.dc.html`; `Design/support.js`
- Owning stage output: `Architecture/03-technology-stack-and-repository-strategy.md` §§3–7, 9, 11
- Checklist items: Stage 03 items 3–6, 9, 11–17, 19–21
- Related ADRs: ADR-0002, ADR-0003, ADR-0004, ADR-0005
