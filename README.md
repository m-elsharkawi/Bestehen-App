# Bestehen App repository baseline

This private workspace is the Stage 01 repository and delivery baseline. It contains product-neutral web and worker process shells, strict package boundaries, fake adapters, PostgreSQL migration/readiness infrastructure, and delivery checks. It does not contain a learner workflow, a live provider integration, or a deployment.

The authoritative architecture is [Architecture/28](Architecture/28-bestehen-app-architecture-specification.md). Repository choices follow [Architecture/03](Architecture/03-technology-stack-and-repository-strategy.md), runtime contracts follow [Architecture/12](Architecture/12-api-contracts-jobs-events-and-idempotency.md), and quality/delivery follow [Architecture/25](Architecture/25-testing-evaluation-and-quality-gates.md) and [Architecture/26](Architecture/26-environments-ci-cd-release-and-operations.md). The accepted bounded execution is described by the [Stage 01 plan](Implementation/Personal/01-repository-delivery-baseline/plan.md).

## Prerequisites

- Node.js `24.19.0`
- pnpm `11.23.0` through Corepack
- Docker with Compose for PostgreSQL `18.6` and OCI runtime checks
- Chromium installed by `pnpm exec playwright install chromium`

## Safe local path

```sh
corepack enable
corepack prepare pnpm@11.23.0 --activate
pnpm install --frozen-lockfile
docker compose up -d postgres
cp .env.example .env
pnpm db:migrate
pnpm dev
```

The default profile uses only deterministic fakes, keeps every personal admission/productive flag closed, binds PostgreSQL to loopback, and makes no paid-provider call. Web is at `http://127.0.0.1:3000`; the worker control listener is private at `127.0.0.1:3001` for local Node execution.

Run `pnpm check` for the fast gate and `TEST_DATABASE_URL=postgresql://bestehen_local:bestehen_local@127.0.0.1:5432/bestehen_local pnpm check:full` for the complete local gate. Docker is mandatory for `pnpm test:oci`; an unavailable daemon is an unresolved check, never a pass.

See [local development](docs/local-development.md), [configuration](docs/configuration.md), [package boundaries](docs/architecture/package-boundaries.md), and [delivery](docs/delivery.md) for ownership, recovery, and troubleshooting.
