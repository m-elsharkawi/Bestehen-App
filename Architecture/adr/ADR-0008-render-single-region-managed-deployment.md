# ADR-0008 — Render single-region managed deployment

> **Status:** Accepted
> **Owner:** Stage 03
> **Date:** 2026-08-23
> **Decision IDs:** `ARCH-S03-D05`
> **Supersedes / superseded by:** None

## Context

The private-first App needs the fewest independently operated production services while supporting one standard Node web process, one continuously consuming worker and durable PostgreSQL. It has no accepted multi-region availability claim and no owner-provided fixed euro budget. Free services cannot carry durable learner evidence.

Current inputs are App `main@b8924677b0750e6507f9e50467dbd69465c94a64`, business-boundary blob `904ae20e8cb3f9f354d6505513821e86f609622b`, nonfunctional blob `8137091683941b0d55f3d4fb90af3c402b8371e5`, Stage 01 blob `cc8d28816f43d627861d11cd90e8770c4c96414c` and Stage 02 blob `046d114bbbc96528bf0b9eae0406c0235f759127`.

Render's official [regions](https://render.com/docs/regions) include Frankfurt and define same-region private networking; its [PostgreSQL guide](https://render.com/docs/postgresql-creating-connecting) supports PostgreSQL 18 and its [background-worker guide](https://render.com/docs/background-workers) provides a continuous worker service. Current [pricing](https://render.com/pricing) lists Starter web and worker compute at USD 7/month each and Basic-256mb PostgreSQL at USD 6/month plus storage; [free limits](https://render.com/docs/free) include sleep/ephemeral/expiring database constraints unsuitable for durable production. Sources were accessed 2026-08-23; prices must be rechecked before purchase.

## Decision

Initial production topology is one Render Frankfurt Node web service, one Frankfurt Node background worker and one Frankfurt managed PostgreSQL 18 database on the private network. Use paid durable services before any real learner relies on availability/evidence. Keep media bytes in the separately decided private EU object store.

Use native Node builds initially with exact Node/pnpm versions, frozen lockfile and Next standalone-compatible output. Do not depend on Render application APIs. Stage 26 owns the actual Blueprint, environment/secret references, health checks, release/migration command, backups, off-provider logical export, rollback and spend approval. OCI packaging is deferred until an OS dependency, provider exit or reproducibility failure warrants it.

Run one web and one worker instance initially. Do not add multi-region or horizontal instances until cache/version, idempotency, recovery and cost evidence support them. A regional outage is an honest interruption/Pending condition, not hidden by false availability copy.

## Alternatives

- **Vercel plus external PostgreSQL/object/worker:** excellent Next integration, but a continuously consuming worker and database remain separate providers; the official Pro platform fee currently starts at USD 20/month before those services.
- **Cloudflare Workers/D1/Queues:** low idle/usage cost, but platform-specific runtime/data semantics concentrate provider coupling and weaken the conventional PostgreSQL/Node exit.
- **Single self-managed VM:** may be cheaper, but transfers OS patching, PostgreSQL, backup, TLS and process supervision to one maintainer.
- **Free Render services:** valid only for synthetic disposable preview; sleep and expiring/no-backup database behavior cannot satisfy learner truth.

## Consequences

The current minimum selected paid list-price comparison is about USD 20/month plus database storage, object overage, tax and later providers. This is not an owner budget or commitment. Managed database/compute reduce operating work, but one region and one vendor are availability and commercial dependencies.

Exit uses standard Node entry points, PostgreSQL logical export and externalized secrets. Move web/worker to another Node/container host and restore/migrate PostgreSQL; no application semantic changes are permitted during an emergency provider exit. Periodic off-provider `pg_dump` and quarterly restore evidence are required because provider-local backups disappear with database deletion.

Scale compute only after a 14-day p95 CPU above 70%, memory above 80%, or accepted latency/queue SLO breach attributable to capacity. Exit/review on repeated regional or restore-objective failure, missing security/data control, or cost exceeding the explicit Stage-26 owner threshold.

## Validation and review trigger

Stage 25 validates reproducible build/migration/release gates. Stage 26 re-verifies pricing/region/quotas and owns provisioning, least-privilege secrets, backup/restore, deploy/rollback and another-host recovery drill. Stage 24 supplies capacity/availability evidence.

Supersede with a new ADR before provider/topology change. It must identify data transfer, DNS/certificate, secret rotation, queued-job reconciliation, rollback and the learner-visible interruption contract.

## Traceability

- Product/design sources: `app/25-business-model-and-product-boundaries.md`; `app/26-platform-accessibility-nonfunctional.md`; `Architecture/01-architecture-charter-and-quality-attributes.md`; `Architecture/02-system-context-and-product-boundaries.md`
- Owning stage output: `Architecture/03-technology-stack-and-repository-strategy.md` §§3.2, 4.5, 6, 8–12
- Checklist items: Stage 03 items 3, 7–10, 11, 13, 18–21
- Related ADRs: ADR-0002, ADR-0003, ADR-0007, ADR-0009
