# Local development

Use exact Node `24.19.0` and pnpm `11.23.0`. From a fresh clone:

```sh
corepack enable
corepack prepare pnpm@11.23.0 --activate
pnpm install --frozen-lockfile
docker compose up -d postgres
cp .env.example .env
pnpm db:migrate
pnpm dev
```

The explicit migrator is the only schema owner. Web and worker never migrate at startup. The baseline migration creates only Kysely's migration metadata and revision `baseline`; there is no product table or queue.

Useful checks:

```sh
pnpm check
TEST_DATABASE_URL=postgresql://bestehen_local:bestehen_local@127.0.0.1:5432/bestehen_local pnpm test:integration
TEST_DATABASE_URL=postgresql://bestehen_local:bestehen_local@127.0.0.1:5432/bestehen_local pnpm test:process
pnpm exec playwright install chromium
pnpm build
pnpm test:e2e
pnpm test:oci
```

If readiness is `503`, confirm configuration, PostgreSQL health, and that `pnpm db:migrate` completed. Liveness deliberately remains independent of PostgreSQL. If Docker is unavailable, local PostgreSQL/OCI claims remain unresolved and clean Linux CI must supply them.

For safe cleanup, first inspect `docker compose ps` and the exact project name. `docker compose down` removes baseline containers and network but preserves `bestehen-postgres-18`. Only when the synthetic local database is intentionally disposable, inspect the exact volume and run `docker compose down --volumes`. Do not target broad Docker resources or a production host.
