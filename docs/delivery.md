# Delivery baseline

Stage 01 builds two provider-neutral artifacts from the pinned Node multi-architecture manifest: `Dockerfile.web` (port `3000`, `/api/health/live`, `/api/health/ready`) and `Dockerfile.worker` (private port `3001`, `/health/live`, `/health/ready`). Both use fixed UID/GID `10001`, declare `SIGTERM`, and run with a read-only root plus bounded `/tmp` in checks.

Build and inspect locally:

```sh
docker build --file Dockerfile.web --build-arg OCI_CREATED=local --build-arg OCI_REVISION="$(git rev-parse HEAD)" --tag bestehen-web:local .
docker build --file Dockerfile.worker --build-arg OCI_CREATED=local --build-arg OCI_REVISION="$(git rev-parse HEAD)" --tag bestehen-worker:local .
pnpm test:oci
```

The OCI gate re-resolves the exact Node and PostgreSQL tags, records the current Linux platform manifests and local image digests, scans history/config, verifies minimal runtime files and non-root identity, starts read-only, executes the explicit migrator, checks liveness/readiness, and requires bounded zero-exit `SIGTERM` handling. Runtime secrets are environment references only and never build arguments or layers.

Pull-request evidence is synthetic, named by candidate commit/check ID/run ID, and retained for 14 days. Manual release-candidate evidence is retained for 90 days. Neither workflow publishes an image or deploys. Evidence excludes environment dumps, database volumes, browser storage, recordings, private data, provider payloads, and secrets.

Future Coolify receives the Dockerfile, command, internal port, health path, and secret references. Pangolin receives only web readiness; PostgreSQL and the worker control port stay private. The same Node commands, PostgreSQL URL, S3-compatible port, and images preserve a Render/comparable-host exit. See [IDR-0001](decisions/IDR-0001-personal-deployment-profile.md).

Rollback before merge is a normal revert on the stage branch without history rewrite. After a later merge but before product migrations, stop only inspected baseline processes and revert the merge. Future schema rollback is permitted only while predecessor compatibility remains; otherwise roll forward. Publishing, DNS/ingress, secret injection, migration against a live database, backup/restore proof, deployment, and acceptance are owner-controlled later gates.
