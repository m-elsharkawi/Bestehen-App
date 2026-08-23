# Coolify two-VM staging topology

Last verified: **2026-08-23**. Official references: Coolify
[remote servers](https://coolify.io/docs/knowledge-base/server/introduction),
[firewalls](https://coolify.io/docs/knowledge-base/server/firewall),
[Dockerfile builds](https://next.coolify.io/docs/applications/builds/dockerfile),
[environment variables](https://coolify.io/docs/knowledge-base/environment-variables),
[health checks](https://coolify.io/docs/knowledge-base/health-checks),
[database backups](https://next.coolify.io/docs/databases/backups), and
[instance recovery](https://next.coolify.io/docs/core/backup-and-recovery/instance-backup).

### `OPS-01` — Inventory the existing hosts

- **Owner:** account owner on the two private Linux VMs.
- **Action:** Record, in the protected ledger, OS, Docker, Coolify, Pangolin/Newt, time-sync, disk/headroom, firewall, current backup, and recovery state. Assign VM-control to the Coolify controller/Pangolin path and VM-app to App workloads. Do not store private addresses in Git.
- **Expected result:** versions and responsibilities are known; both clocks are synchronized; disk and recovery gaps are explicit.
- **How to verify:** Use local host version/status/disk commands and read-only dashboard pages. Record result categories, not command output containing addresses.
- **Evidence:** checked date, version strings, `vm_control=verified`, `vm_app=verified`, and named gaps.
- **Rollback:** This step is read-only. Remove any accidental repository/chat record and treat exposed private data under the compromise procedure.
- **NEVER PASTE HERE:** private/public IPs, hostnames, SSH material, Coolify `APP_KEY`, environment files, or recovery codes.

### `OPS-02` — Add VM-app as the deployment server

- **Owner:** account owner in Coolify.
- **Action:** Open **Servers → Add**, select the current documented remote-server path, enter `<vm-app-private-address>` only in the protected dashboard, and use a dedicated SSH key limited to VM-app. Validate the server. Do not expose the Docker API or PostgreSQL port.
- **Expected result:** Coolify reports the remote server reachable and validated; the key is not shared with VM-control administration.
- **How to verify:** Run Coolify's server validation and a read-only deployment-engine health check. Confirm the host firewall admits SSH only from the approved control/admin path.
- **Evidence:** date, installed versions, `remote_server=verified`, and firewall negative-test result.
- **Rollback:** Remove the server from Coolify and its dedicated public key from VM-app; verify the old key fails.
- **NEVER PASTE HERE:** SSH private/public key text, private address, authorized_keys content, host fingerprint inventory, or console output with credentials.

### `OPS-03` — Create project, environment, and isolated resources

- **Owner:** account owner in Coolify.
- **Action:** Create project `bestehen`, environment `staging`, and VM-app resources for PostgreSQL 18.6, web, worker, and a separate one-shot migrator. Use repository `Dockerfile.web` and `Dockerfile.worker`. Put the resources on one private Coolify network; publish only web through the proxy. Keep auto-deploy and previews off.
- **Expected result:** resource definitions exist but no branch-tip deployment runs; worker `3001` and PostgreSQL `5432` have no public proxy.
- **How to verify:** Inspect each resource's source commit setting, internal port/network, and public exposure. A connection from an unapproved external path to `3001`/`5432` must fail.
- **Evidence:** resource class names, exact image/runtime versions, exposure result, and `owner_pending` or `verified`.
- **Rollback:** Stop and delete only the empty staging resource definitions in reverse order. Do not delete any database with data before export/restore duties are checked.
- **NEVER PASTE HERE:** database URL/password, internal addresses, generated resource IDs, deployment token, or log/environment dump.

### `OPS-04` — Configure exact-commit build and health

- **Owner:** account owner in Coolify after repository acceptance.
- **Action:** Select the exact accepted 40-character commit. Configure web port `3000` with `/api/health/live` and `/api/health/ready`; keep worker health `3001` private. Use the repository Dockerfile health checks. The migrator runs explicitly before compatible web/worker activation; do not use web/worker startup or an unobserved post-deploy hook as migration owner.
- **Expected result:** the candidate builds from the exact commit and health routes return only minimal state/release metadata.
- **How to verify:** Compare the deployed revision to the accepted commit and call health routes through the authorized path. Confirm liveness does not query PostgreSQL and readiness fails closed when its dependency is unavailable.
- **Evidence:** commit, image digest/deploy ID reference, status codes, and check IDs only.
- **Rollback:** Disable activation, keep the predecessor running, and roll forward a migration fault; never use an automatic destructive down migration.
- **NEVER PASTE HERE:** source credentials, build arguments containing values, database details, container inspection with environment, or application logs with private data.

### `OPS-05` — Inject runtime-only configuration

- **Owner:** account owner in Coolify; the agent names variables but never receives values.
- **Action:** In each resource's **Environment Variables**, add only required variables from [configuration](../../configuration.md). For every secret disable **Build Variable**, enable **Runtime Variable**, and mark it locked. Give web/worker/migrator only the credentials they consume. Keep external, paid, public-object, and product flags false for the fake-first deploy.
- **Expected result:** startup validation reports only variable names if incomplete; no secret is present in image history/build logs or another consumer.
- **How to verify:** run the repository OCI secret inspection, start with fakes, and inspect only lock/build/runtime toggles—never display values.
- **Evidence:** variable-name inventory, consumer, locked/runtime-only booleans, and redacted validation result.
- **Rollback:** disable the affected adapter, rotate/revoke the credential, remove the variable, and redeploy fakes.
- **NEVER PASTE HERE:** any value, `.env`, dashboard export, image config, token, key, owner allowlist, private URL, or error object containing one.

### `OPS-06` — Back up controller and database separately

- **Owner:** account owner in Coolify and protected recovery store.
- **Action:** Protect the Coolify controller backup and `APP_KEY` outside the VMs. Configure PostgreSQL scheduled encrypted upload to the backup-only R2 bucket after R2 exists. Keep the decryption private key offline; the uploader gets only the public key and bucket-specific write credential.
- **Expected result:** controller recovery and App/PostgreSQL recovery are distinct; a backup badge alone is not a restore claim.
- **How to verify:** check backup age and object sentinel. A later isolated restore must pass schema, deletion-journal replay, and no-resurrection checks before it is accepted.
- **Evidence:** schedule, age/result, encrypted artifact digest/reference, and last isolated-restore status—never archive content.
- **Rollback:** disable the schedule, revoke uploader access, and retain required generations until the recovery/rights policy permits expiry.
- **NEVER PASTE HERE:** `APP_KEY`, archive, database URL/dump, encryption private key, bucket credential, or backup object locator.

### `OPS-07` — Review updates and portability

- **Owner:** operations owner.
- **Action:** Disable automatic Coolify updates. Before a reviewed Coolify/Pangolin/Newt/Docker update, record current version, release notes, backups, rollback method, maintenance window, and health test. Keep standard Dockerfile/Node/PostgreSQL/S3 contracts free of Coolify libraries.
- **Expected result:** updates are deliberate and reversible; provider exit remains possible.
- **How to verify:** compare current/target versions and rehearse predecessor activation on synthetic staging.
- **Evidence:** version pair, guide/check IDs, health result, rollback state, and date.
- **Rollback:** restore the supported predecessor/controller backup and verify exact-commit health; do not restore learner service before deletion replay.
- **NEVER PASTE HERE:** update tokens, host backups, private topology, protected release notes/account data, or database content.
