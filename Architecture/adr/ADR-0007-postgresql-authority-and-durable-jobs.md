# ADR-0007 — PostgreSQL authority and durable jobs

> **Status:** Accepted
> **Owner:** Stage 03
> **Date:** 2026-08-23
> **Decision IDs:** `ARCH-S03-D02`, `ARCH-S03-D03`
> **Supersedes / superseded by:** None

## Context

The App must preserve append-oriented learner facts, versioned projections, independent Written/Oral evidence, resumable checkpoints and productive evaluation that may be Pending. Web and worker are concurrent writers; acceptance of a learner command cannot depend on a processor completing in the request. A solo maintainer should not operate a database plus an avoidable cache/broker.

Current inputs are App `main@b8924677b0750e6507f9e50467dbd69465c94a64`, Stage 01 blob `cc8d28816f43d627861d11cd90e8770c4c96414c`, Stage 02 blob `046d114bbbc96528bf0b9eae0406c0235f759127` and final product blob `18ae80cc2fd63cecd76c297c3e56d44a68367856`.

PostgreSQL's official [version policy](https://www.postgresql.org/support/versioning/) supports each major for five years and currently lists version 18 through November 2030. Kysely's official [repository](https://github.com/kysely-org/kysely) describes a thin type-safe SQL builder and migration primitive. The official [pg-boss repository](https://github.com/timgit/pg-boss) documents PostgreSQL-backed reliable jobs, retries and dead-letter behavior. Sources were accessed 2026-08-23.

## Decision

Use one managed PostgreSQL 18 database as authoritative server storage. Use Kysely with the standard PostgreSQL driver as the thin access/migration layer; migrations and reviewed SQL remain schema authority and no generated ORM client owns the data model.

Use pg-boss in the same database with one Node worker. Persist accepted facts and enqueue required work transactionally. Every job carries an explicit contract/version/idempotency identity, uses bounded retry/retention and has an operator-visible terminal/dead-letter state. Handlers validate input, tolerate redelivery and apply each domain effect once; library delivery claims do not replace semantic idempotency.

Worker or provider downtime leaves dependent evidence Pending while unrelated activity continues. No command is acknowledged durable while PostgreSQL is unavailable. Schema details, retention, indexes and retry budgets remain owned by Stages 05 and 12.

## Alternatives

- **SQLite:** simple and excellent for single-process/local data, but its own [appropriate-use guidance](https://www.sqlite.org/whentouse.html) favors client/server databases for many network writers; web plus worker need concurrent server writes and managed recovery.
- **Prisma generated client:** capable and productive, but adds code-generation and a broader schema abstraction without a current benefit over visible SQL.
- **Drizzle:** credible thin alternative, but its official v1 line remains beta with stated breaking-change risk.
- **Inline-only work:** no worker cost, but request timeout/outage cannot truthfully preserve productive evaluation.
- **Redis/BullMQ or proprietary queue:** may scale independently, but adds a service or lock-in before measured queue contention.

## Consequences

Facts and job intent can be atomic, backups/exports use standard PostgreSQL tools and there is no Redis service. The shared database creates a contention/failure coupling, so worker connections, transactions and concurrency are bounded and measured. Pause/throttle the worker first if learner transaction SLOs degrade.

Exit from Kysely retains SQL and PostgreSQL. Exit from pg-boss introduces a new application-port adapter and drains/reconciles jobs by stable identity. Move jobs to a separate PostgreSQL database or managed queue only when queue load causes learner SLO breach, oldest eligible jobs miss the Stage-12 SLO for seven days from capacity, or security/isolation evidence requires it.

Migrations are forward-only, tested from empty and supported upgrade fixtures, applied by one production runner with backup/restore evidence and expanded/contracted compatibly. Recovery is roll-forward unless the release can safely run against the old schema.

## Validation and review trigger

Stage 05 owns schema/constraint/migration tests; Stage 12 owns idempotency, redelivery, retry, dead-letter and Pending contract tests; Stage 24 owns transaction/connection/queue-age telemetry; Stage 26 owns backup/restore and database-provider exit drills.

Re-evaluate six months before PostgreSQL 18 support end, if Kysely/pg-boss becomes unmaintained or insecure, if restore objectives fail, or if measured queue contention breaches learner SLOs. Supersession requires reconciled job/fact migration and proof that no evidence becomes falsely complete or duplicated.

## Traceability

- Product/design sources: `app/28-bestehen-app-product-specification.md`; `app/25-business-model-and-product-boundaries.md`; `app/26-platform-accessibility-nonfunctional.md`
- Owning stage output: `Architecture/03-technology-stack-and-repository-strategy.md` §§4.2–4.3, 6, 8–11
- Checklist items: Stage 03 items 3, 5, 7, 9–14, 18–21
- Related ADRs: ADR-0001, ADR-0002, ADR-0005
