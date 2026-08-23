# Package boundaries

Concepts live with a single owner; there is deliberately no `shared`, `common`, or `utils` package. Packages publish only explicit `exports`, and production imports never use another package's `src` path.

The allowed direction is:

```text
domain
  └─> contracts ─> application ─> infrastructure
        └────────> content            ↑
configuration ────────────────────────┘
design-system (React-only UI boundary)
test-support (development consumers only)

web/worker composition roots may wire public package exports
```

- `domain` owns pure vocabulary and invariants and imports no framework/provider.
- `contracts` may use domain vocabulary; `application` may use domain/contracts and owns ports.
- `configuration` owns typed environment, flags, release metadata, and redaction.
- `infrastructure` implements ports and owns PostgreSQL, pg-boss, and adapter details.
- `content` owns versioned content import/publication boundaries without provider SDKs.
- `design-system` is semantic UI with React as a peer, without application/infrastructure.
- `test-support` is development-only; production packages cannot depend on it.
- `web` and `worker` are composition roots, not owners of business decisions.

`pnpm check:boundaries` runs dependency-cruiser and negative fixtures for cycles, deep imports, forbidden edges, provider/framework imports in domain, and production use of test support.

Split a package or process only when measured ownership, scale, availability, security isolation, or release cadence requires it. A later split retains contracts, idempotency, event ownership, observability, and rollback compatibility; it is not justified by file count alone. The canonical decision remains [Architecture/03](../../Architecture/03-technology-stack-and-repository-strategy.md).
