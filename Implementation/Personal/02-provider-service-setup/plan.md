# Personal Stage 02 — provider accounts and service setup plan

Status: `02P` planning in progress; awaiting independent orchestrator acceptance.

Planning date: 2026-08-23 (Europe/Berlin).

Verified input baseline: `fd3add5c10e19646412b1413d507611d037797bd`, the
exact matching head of local `main` and `origin/main` when this branch was created.

Draft review: [PR #3](https://github.com/m-elsharkawi/Bestehen-App/pull/3), open,
draft, and unmerged against `main`.

Stage boundary: `02P` only. This document plans `02E`; it creates no provider
account, resource, DNS record, secret, dependency, migration, production adapter,
deployment, or paid call, and it does not begin `02E`.

## 1. Outcome

`02E` will add a dependency-ordered set of owner setup guides, one strict
machine-readable provider-readiness contract, fail-closed server configuration, and
deterministic fake-provider contract tests. Local, test, preview, and CI will need no
live account. Real values will exist only in Coolify or another protected secret
store and will never be committed, pasted into prompts or chat, returned in evidence,
or printed in logs.

Live setup occurs at the next safe boundary, **after independent acceptance of
`02E`**, not by restarting accepted Stage 01. That checkpoint provisions and verifies
private staging resources for the existing Coolify/Pangolin deployment, R2, Auth0,
SES, Gemini, OpenAI STT/TTS, and conditional Polly. Provider calls and paid productive
processing remain disabled until the applicable later stage and an owner-set spend
envelope are accepted.

After each accepted Execution stage `03E` through `09E`, the orchestrator will deploy
that stage's exact accepted commit to the same private Coolify staging environment and
run only the live tests relevant to the capabilities then implemented. Deterministic
fakes remain mandatory CI coverage. Stage 10 therefore promotes and comprehensively
validates an already integrated application; it is not the first integration event.

## 2. Verified repository and hosting facts

- Remote: `https://github.com/m-elsharkawi/Bestehen-App.git`; default branch `main`.
- Local `main`, fetched `origin/main`, and the branch point all resolved to
  `fd3add5c10e19646412b1413d507611d037797bd`; the tree was clean before branching.
- Branch: `implementation/personal-02-provider-service-setup`, created directly from
  that commit. It will not be rebased onto a later `main` or merged by this stage.
- GitHub reports the repository private. The Dependency Graph SBOM endpoint returned
  `com.github.m-elsharkawi/Bestehen-App` with 358 packages on 2026-08-23, so the
  Dependency Graph is enabled.
- Private-repository branch protection/ruleset APIs returned the plan-upgrade `403`.
  GitHub Advanced Security is unavailable and declined. Neither GHAS, dependency
  review, secret scanning, required reviewers, nor paid rulesets is an acceptance
  gate.
- The provider-neutral full exact-lock `pnpm audit --audit-level=critical` gate,
  frozen install, source/lifecycle policy, and dependency/license inventories from
  Stage 01 remain mandatory. Dependabot and the Dependency Graph are useful inputs,
  not substitutes for that gate.
- Stage 01 already supplies ordinary Node web/worker processes, PostgreSQL 18.6,
  explicit migration ownership, Dockerfiles, private health endpoints, safe fake
  defaults, central redaction, a release manifest, and Coolify/Render-portable
  boundaries. Stage 02 will extend those contracts instead of duplicating them.

If `origin/main` advances during `02E`, execution records the divergence and remains
on the accepted baseline until the orchestrator decides otherwise.

## 3. Authority and immutable inputs

The final architecture and accepted ADRs outrank detailed architecture, which
outranks incorporated design decisions and the implementation program. Provider
documentation can update setup mechanics and mutable facts but cannot change accepted
product truth, retention, security, or accessibility decisions.

Repository inputs read at the accepted baseline and their blob IDs are:

- `Architecture/28-bestehen-app-architecture-specification.md` —
  `89a761d64767e048b59338ec13e61b1b06472dbd`.
- `Architecture/16-listening-audio-tts-and-media-delivery.md` —
  `6bb60e2d6048a39035107ff427a0c4fd305c1ba6`.
- `Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md` —
  `2f118f817a99b76dc1e0c38c0aedaa1e0662268e`.
- `Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md` —
  `60aef66f8443e747935b2cfb479dd7f4dd4d5c23`.
- `Architecture/20-account-local-first-profile-sync-export-and-deletion.md` —
  `9a1aa2d5fea31ff0bdccfc4561806bb870511ab6`.
- `Architecture/22-notifications-scheduling-and-time-zones.md` —
  `6e0e8a761b9cf83a75931e815f447e148e3a20d0`.
- `Architecture/23-security-privacy-rights-retention-and-threat-model.md` —
  `abc1a300d5b0fd659d28f768669dd73afbb90887`.
- `Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md`
  — `c588f48790e2fc06b9ba656fddace222d73e554a`.
- `Architecture/26-environments-ci-cd-release-and-operations.md` —
  `c81412c46aa3b2a77ac9fcb4a0840e1b63af8bd4`.
- ADR-0024, ADR-0026, ADR-0027, ADR-0030, ADR-0031, ADR-0032, and ADR-0034 —
  respectively `f792a0f48a4f70625c9cca8cb41bb8a68c59fec6`,
  `7a787a6d1117eaf4783022cdbfb84b024b7e03fe`,
  `c4e526178ce14addec5da22bda6241919ac312ac`,
  `7a7a93a661ecc72ef02e723b24c7030e37d53918`,
  `9ddfd6e31cc55cf095c1d002abb907aa32d770d2`,
  `54ae839749fe66f8809080466a97f6cde5a917e7`, and
  `4ca9f8cf6edb65a423d803ae3ae4cb4c733ac574`.
- Common contract and exact `02P` prompt —
  `fa21241f24ee8a179585b4b6bf8f82a7c8960de6` and
  `b2c61cd0fffd6e8ca15597c6e552def60c99ba0e`.
- Personal program and incorporated Design review notes —
  `0943abe96625ebe048f89031b45b76518400f7f1` and
  `7e9ca27e4119b6a189d6ee6bd8c8ee67d05b469a`.
- Accepted Stage 01 plan/handoff —
  `4574792cdf0dee1eb0f711d2defbfcb00a239a03` and
  `7f7376cb0da2cf376cc28c6262cf01e6a34cbcf1`.
- Current configuration, delivery, and personal-profile decision —
  `d5f7c2ba90ebd9f154a102f8e29f57a6f3dfc034`,
  `89a3359395224ade23d4fd63298ccebb6d588ba5`, and
  `54d110b88ae13bd28c1ba59f403a3203ac4e25e1`.

## 4. Dated official-source register and exact choices

All mutable facts were checked against primary documentation on **2026-08-23**.
The setup-guide header will repeat its last-verified date; the operator must recheck
the linked page before accepting spend, terms, a model route, or a provider update.

### 4.1 Hosting, repository, and ingress

- GitHub [deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments),
  [Actions secrets](https://docs.github.com/en/actions/reference/security/secrets),
  [secure use](https://docs.github.com/en/actions/reference/security/secure-use), and
  [ruleset rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).
  Decision: use current read-only Actions and exact-lock gates. Do not store runtime
  provider secrets in GitHub or require private-plan/GHAS-only controls.
- Coolify [remote servers](https://coolify.io/docs/knowledge-base/server/introduction),
  [firewalls](https://coolify.io/docs/knowledge-base/server/firewall),
  [Dockerfile deployment](https://next.coolify.io/docs/applications/builds/dockerfile),
  [health checks](https://next.coolify.io/docs/applications/configuration/health-checks),
  [runtime variables](https://coolify.io/docs/knowledge-base/environment-variables),
  [GitHub App source](https://next.coolify.io/docs/applications/sources/github/app),
  [API authorization](https://coolify.io/docs/api-reference/authorization),
  [database backups](https://next.coolify.io/docs/databases/backups), and
  [self-updates](https://coolify.io/docs/knowledge-base/self-update).
  Decision: existing self-hosted Coolify v4, with the observed installed version
  recorded at the checkpoint; Dockerfile builds; a selected-repository GitHub App;
  runtime-only locked variables; image health checks; manual reviewed Coolify updates.
- Pangolin [resource types](https://docs.pangolin.net/manage/resources/understanding-resources),
  [private-resource authorization](https://docs.pangolin.net/manage/resources/private/authentication),
  [private destinations](https://docs.pangolin.net/manage/resources/private/destinations),
  [targets](https://docs.pangolin.net/manage/resources/public/targets), and
  [DNS/networking](https://docs.pangolin.net/self-host/dns-and-networking).
  Decision: Newt-backed private HTTP resources with explicit owner access, not
  anonymous public resources, shared links, PINs, or access tokens. The installed
  Pangolin/Newt versions are recorded and reviewed before update.

### 4.2 Storage and identity/email

- R2 [data location](https://developers.cloudflare.com/r2/reference/data-location/),
  [API tokens](https://developers.cloudflare.com/r2/api/tokens/),
  [S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/),
  [CORS](https://developers.cloudflare.com/r2/buckets/cors/),
  [presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/),
  [lifecycle rules](https://developers.cloudflare.com/r2/buckets/object-lifecycles/),
  [security](https://developers.cloudflare.com/r2/reference/data-security/),
  [pricing](https://developers.cloudflare.com/r2/pricing/), and
  [budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/).
  Decision: private R2 Standard buckets with immutable EU jurisdiction and `auto`
  SDK region; no `r2.dev` or public custom domain. R2 has no S3 bucket versioning API,
  so immutable keys, digests, lifecycle, and app metadata supply the version contract.
- Auth0 [tenant creation](https://auth0.com/docs/get-started/auth0-overview/create-tenants),
  [environment separation](https://auth0.com/docs/get-started/auth0-overview/create-tenants/set-up-multiple-environments),
  [Flexible Identifiers email OTP](https://auth0.com/docs/authenticate/database-connections/passwordless-authentication-for-db-connect),
  [application settings](https://auth0.com/docs/get-started/applications/application-settings),
  [Next.js v4 routes](https://auth0.github.io/nextjs-auth0/),
  [tenant sessions](https://auth0.com/docs/get-started/tenant-settings),
  [SMTP providers](https://auth0.com/docs/customize/email/smtp-email-providers), and
  [email templates](https://auth0.com/docs/customize/email/email-templates).
  Decision: a separate EU staging tenant, Regular Web Application, New Universal
  Login, Flexible Identifiers database connection with email OTP only, closed signup,
  one pre-provisioned owner, RS256/OIDC, and no password/social/SMS fallback.
- SES [regional behavior](https://docs.aws.amazon.com/ses/latest/dg/regions.html),
  [sandbox exit](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html),
  [credential types](https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-credentials.html),
  [SMTP TLS](https://docs.aws.amazon.com/ses/latest/dg/smtp-connect.html),
  [custom MAIL FROM](https://docs.aws.amazon.com/ses/latest/dg/mail-from.html),
  [DMARC](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dmarc.html),
  and [suppression](https://docs.aws.amazon.com/ses/latest/dg/sending-email-suppression-list.html).
  Decision: `eu-central-1` (Frankfurt), a dedicated authenticated mail subdomain,
  Easy DKIM, aligned custom MAIL FROM/SPF, DMARC, TLS, and separate Auth0 SMTP and App
  API credentials. Sandbox is sufficient for the owner-only staging checkpoint if the
  owner recipient is verified; production access is a later launch-blocking action.

### 4.3 AI, STT, TTS, and offline media

- Gemini [model catalog](https://ai.google.dev/gemini-api/docs/models),
  [3.6 release evidence](https://ai.google.dev/gemini-api/docs/changelog),
  [deprecations](https://ai.google.dev/gemini-api/docs/deprecations),
  [pricing](https://ai.google.dev/gemini-api/docs/pricing),
  [zero-retention controls](https://ai.google.dev/gemini-api/docs/zdr), and
  [logs/datasets](https://ai.google.dev/gemini-api/docs/logs-datasets).
  Decision: paid Gemini Developer API, exact stable `gemini-3.6-flash`, despite a
  newer 3.7 model existing. Accepted benchmark/release lineage, not `latest`, controls
  upgrades. Use GenerateContent/inline payloads only: no Files, grounding, developer
  logs, datasets, feedback sharing, or training opt-in.
- OpenAI [audio API](https://platform.openai.com/docs/api-reference/audio),
  [data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint),
  and [pricing](https://platform.openai.com/pricing).
  Decision: exact `gpt-4o-mini-transcribe-2025-12-15` for provisional German STT
  with log probabilities and exact `gpt-4o-mini-tts-2025-12-15` for approved adaptive
  partner text only. Use separate staging restricted keys. Do not assume EU regional
  processing or ZDR without provider approval and recorded verification.
- Polly [voices](https://docs.aws.amazon.com/polly/latest/dg/available-voices.html),
  [generative voices](https://docs.aws.amazon.com/polly/latest/dg/generative-voices.html),
  [security](https://docs.aws.amazon.com/polly/latest/dg/security-best-practices.html),
  and [pricing](https://aws.amazon.com/polly/pricing/).
  Decision: `eu-central-1` Neural is the offline batch candidate. No voice ID is
  promoted until the content/media benchmark audits current German candidates.
  Standard is an audited lower-rung fallback; Generative is audit-only. Polly is not
  a runtime learner-attempt dependency and no account key is enabled merely for
  completeness.

## 5. Scope and non-scope for `02E`

### 5.1 In scope

- Add the exact guide set in §14 with dated links, step IDs, owner/agent labels,
  expected result, verification, rollback, and `NEVER PASTE HERE` warnings.
- Extend the existing strict server configuration for explicit provider names,
  endpoints, regions, models, non-secret identifiers, credential references, and paid
  envelopes. Unknown or incomplete combinations fail before readiness.
- Add a committed, secret-free readiness schema/example describing expected staging
  resource shape and redacted verification states.
- Extend the existing six fake adapters with deterministic health/configuration
  behavior and one shared provider contract suite. Fake behavior must cover success,
  disabled, timeout, quota, malformed response, retryable failure, permanent failure,
  and redaction without simulating product evaluation.
- Add scripts that validate only committed synthetic configuration/evidence. A live
  smoke runner may exist but must require an explicit opt-in, protected runtime
  credentials, synthetic data, bounded calls, automatic cleanup, and redacted output.
- Extend existing CI jobs/check commands; do not create a parallel CI or dependency
  scanner.

### 5.2 Out of scope

- Creating or modifying any live account/resource/DNS/secret during `02E`.
- Provider SDKs or adapters, Auth0 routes, SES delivery code, R2 object code, prompts,
  migrations, learner/domain schema, product UI, or real provider payloads.
- Enabling account presentation, external calls, paid processing, public objects,
  production autodeploy, or anonymous staging ingress.
- GHAS, plan upgrades, new observability/secret-management vendors, Cloudflare DNS,
  an OCI registry, Kubernetes, a second database, or a new queue/cache.
- Claiming provider dashboards, a successful backup upload, or a synthetic smoke as
  production readiness. Later stages own feature behavior; Stage 10 owns final release.

## 6. Required resource inventory

Names below are documented identifiers, not requests to create them in `02E`.
`<owner-domain>` and all account IDs, tenant names, private addresses, email addresses,
keys, tokens, and recovery material remain protected owner-supplied values.

| Area | Required staging resource | Launch status and owner |
|---|---|---|
| GitHub | private repository; Dependency Graph; selected-repository Coolify GitHub App | Repository required; GitHub App created only at the post-02E checkpoint by owner |
| Coolify | existing controller on VM-control; remote VM-app; team; `bestehen` project; `staging` environment; web, worker, migrator and PostgreSQL resources | Checkpoint-blocking; owner controls existing VMs and billing |
| Pangolin | existing organization/Newt site; owner role; private HTTP `bestehen-staging`; private HTTP `bestehen-coolify` | Checkpoint-blocking; no anonymous access or share links |
| DNS | Pangolin internal names; public SES identity, DKIM, MAIL FROM/SPF, and DMARC records | Internal names are Pangolin config; SES records are authoritative-DNS owner actions |
| R2 | EU-jurisdiction Standard `bestehen-staging-runtime`; EU-jurisdiction Standard `bestehen-staging-backup`; lifecycle/CORS/budget; runtime and backup tokens | Checkpoint-blocking; production uses separate later buckets/credentials |
| Auth0 | separate EU staging tenant; Regular Web App; Flexible Identifiers DB connection; owner user; post-login allowlist Action; SES email provider | Checkpoint-blocking; owner creates tenant/user and stores recovery material |
| SES | Frankfurt sending identity/subdomain; Easy DKIM; custom MAIL FROM; DMARC; staging configuration set; Auth0 SMTP identity; App API identity | Checkpoint-blocking for OTP; production-access request is launch-blocking, not checkpoint-blocking |
| Gemini | billing-enabled staging project; API key restricted to Gemini API; model access; budget alerts | Checkpoint-blocking for service readiness; paid route remains disabled without owner envelope |
| OpenAI | staging project; restricted STT key; restricted TTS key; project budget/limits | Checkpoint-blocking for service readiness; routes remain disabled without owner envelope |
| Polly | Frankfurt IAM role/user and Neural candidate access | Conditional: create only after an accepted media benchmark requires it |
| Recovery | protected credential store, offline recovery codes, R2 backup destination, encryption public key online/private key offline | Store/checklist readiness required; no private key in web/worker/Coolify env |

Optional and deliberately absent at this stage: Auth0 custom domain, Auth0 log-stream
sink, Cloudflare authoritative DNS, public R2 domain/CDN, OpenAI EU regional processing,
Gemini ZDR, Polly Generative, a second object provider, GHAS, and a new monitoring
vendor. Any becomes required only after its named architecture/security/measurement
gate is independently accepted.

## 7. Two-VM Coolify and Pangolin topology

The guides use symbolic private addresses and first record the existing installation;
they never write actual RFC1918 addresses into Git or evidence.

1. **VM-control** runs the existing Coolify controller and existing Pangolin/Newt
   site path. Its protected Coolify UI is reachable through the private HTTP resource
   `bestehen-coolify`, granted only to the owner account/machine. The public internet
   does not receive the dashboard port.
2. **VM-app** is a Coolify remote deployment server. It runs the staging web, worker,
   explicit migrator, and PostgreSQL resources on an isolated Coolify network. Coolify
   reaches it with a dedicated host key/SSH credential scoped to this server. Docker
   API ports are never exposed.
3. `bestehen-staging` is a Pangolin Newt private HTTP resource whose internal FQDN is
   the single staging origin `https://staging.<owner-domain>`. It targets only the
   Coolify web proxy on VM-app. Owner user/machine access is explicit and default-deny.
   The browser must have an authenticated Pangolin client. This is compatible with
   Auth0 because OIDC redirects occur in the owner's browser; Auth0 does not need to
   call the callback server.
4. Only web HTTP traverses Pangolin. Web container port `3000` stays behind the
   Coolify proxy; worker health `3001` and PostgreSQL `5432` stay on the private
   application network. Readiness routing uses `/api/health/ready`; liveness remains
   `/api/health/live`. No Pangolin header is authorization.
5. VM-app admits SSH only from VM-control/approved administration addresses and proxy
   traffic only from the Newt/private LAN path. VM-control exposes only ports required
   by the observed Pangolin deployment. Both deny unsolicited access to dashboard,
   database, worker, Docker, and container ports. The guide accounts for Docker's
   firewall behavior rather than trusting an unverified host rule.
6. Coolify uses the repository Dockerfiles and exact accepted commit. Build arguments
   contain only public build metadata. All secrets are locked **runtime-only**
   variables; the default Coolify build-time exposure checkbox is disabled for each
   secret.
7. The explicit migrator is a separate one-shot resource/run. Web and worker never
   migrate. Coolify post-deploy hooks are not the sole migration owner because a failed
   post-deploy command does not necessarily fail the deployment.
8. Auto-deploy and preview deploys stay off. An accepted exact commit is selected and
   deployed through the authenticated Coolify connection where available; otherwise
   the owner follows the exact dashboard guide. No branch tip is promoted by accident.
9. Coolify automatic self-update is disabled. The owner records the installed version,
   release notes, controller backup, rollback method, maintenance window, and health
   verification before each reviewed update. Pangolin/Newt follows the same
   record-before-update policy.
10. Coolify configuration backup is separate from App/PostgreSQL recovery. The owner
    protects Coolify `APP_KEY`, SSH keys, and recovery material outside the VMs. A
    database dump is not accepted as recoverable until an isolated restore passes.

The provider-neutral OCI processes, health paths, PostgreSQL contract, and
S3-compatible object boundary retain the Coolify-to-Render exit. Neither Coolify nor
Pangolin libraries enter production packages.

## 8. Exact provider configuration

### 8.1 R2

- Create both buckets with the immutable `eu` jurisdiction and Standard storage.
  The endpoint form is `https://<account-id>.eu.r2.cloudflarestorage.com`; the S3 SDK
  region is `auto`. A location hint is not an EU guarantee and is rejected.
- Runtime bucket prefixes are `media/approved/`, `audio/raw/`, `exports/`, and
  `tmp/`. Names below the prefix are opaque immutable IDs/digests, never email,
  learner name, transcript, or meaning-bearing path data.
- Backup bucket prefixes are `postgres/daily/`, `postgres/weekly/`, and
  `recovery-sentinel/`. Web and worker cannot list/read this bucket. The later backup
  uploader gets only its bucket-specific credential and encryption public key; the
  decryption private key remains offline/protected.
- R2 API token classes are: short-lived/protected bootstrap administration (or
  dashboard-only, then revoked); staging runtime Object Read/Write limited to the
  runtime bucket; staging backup Object Read/Write limited to the backup bucket; and
  temporary read-only exit/audit token created only for an export drill and revoked.
- Runtime CORS admits exactly `https://staging.<owner-domain>`, methods `GET`, `HEAD`,
  and `PUT`, required content/checksum headers, and exposed `ETag`. It admits no
  wildcard, credentials to another origin, browser `DELETE`, or backup-bucket CORS.
- Presigned URLs are bearer capabilities. The default requested expiry is five
  minutes for upload/download and at most fifteen minutes where an accepted later
  flow proves five minutes insufficient; the application still authenticates and
  authorizes before signing. Export artifacts expire at or before 24 hours.
- Lifecycle is a safety backstop, not the primary deletion mechanism: incomplete
  multipart and `tmp/` at one day, `exports/` at one day, and `audio/raw/` at seven
  days. Raw audio is deleted immediately after finalization and never backed up.
  R2 lifecycle deletion can occur within the provider's documented execution window,
  so later evidence checks absence rather than claiming second-precise deletion.
- R2 does not support S3 bucket versioning. Do not turn on object lock for
  delete-sensitive learner/runtime objects. Exact key + digest + immutable manifest
  and application-level successors provide versioning; delete verification uses
  authorized `HEAD`/list checks and a redacted receipt.
- Set provider billing alerts at owner-chosen thresholds and record the values only in
  the protected billing ledger. The repository records that alerts exist, their
  verified date, and which owner receives them—not the billing address or secret.
- Exit drill: freeze writes for the scoped prefix, inventory keys/size/digests with a
  temporary read-only credential, copy to another S3-compatible store, verify sample
  and totals, repoint the adapter, retain delete/rights overlays, then revoke the
  temporary token. Never use a public bucket as an export shortcut.

### 8.2 Auth0

- Tenant: separate staging tenant, region `EU`, environment tag `Staging`; record the
  provider-assigned EU sub-locality. Tenant region/name are immutable decisions, so a
  wrong selection is rolled back by deleting the empty tenant and starting again.
- Application: `Regular Web Application`, OIDC conformant, RS256, Authorization Code
  with PKCE. Allowed Callback URL is exactly
  `https://staging.<owner-domain>/auth/callback`; Allowed Logout URL and Allowed Web
  Origin are exactly `https://staging.<owner-domain>`. No wildcard, localhost,
  production URL, cross-origin authentication, implicit flow, or password grant.
- Connection: Flexible Identifiers database connection; email identifier; email OTP;
  users without passwords supported; password login, password signup, self-service
  password change, social/SMS, and public signup disabled. New Universal Login is the
  only login surface.
- Provision exactly one owner user through the dashboard/API owner step without
  entering the address in the guide, issue, PR, log, or prompt. The post-login Action
  compares the normalized verified email with an Action secret and denies every other
  identity. This is defense in depth: Stage 03's server-side issuer+subject binding and
  owner allowlist remains the authorization authority and fails closed.
- Auth0 SSO session settings mirror `session-policy/v1`: 24-hour idle and seven-day
  absolute maximum. The App later owns its opaque same-origin session with the same
  limits and requires an OTP no older than ten minutes for adoption, credential
  change/link, export, deletion, and revoking other sessions. No Enterprise
  back-channel/session feature is required.
- SES replaces Auth0's built-in test email provider. OTP templates disclose no goal,
  exam date, learning content, response, Readiness, or raw data. Test the configured
  hosted UI and template with keyboard, current Safari/VoiceOver and Firefox or
  Chrome/NVDA, 320 CSS-pixel reflow, 200% zoom, and 400% desktop reflow in the later
  identity feature stage; a provider accessibility claim is not evidence.
- Tenant admins enable their available MFA and protect recovery codes offline.
  Application client secret, Action secret, SES SMTP credential, management tokens,
  recovery codes, and signing/private material never enter the repo/Coolify App env
  unless that specific runtime needs them. Signing-key rotation is rehearsed by
  accepting current+previous JWKS during overlap, then revoking the predecessor.
- Recovery is verified-email OTP only. Loss of email plus no valid App session has no
  automated override. Provider exit exports tenant/application/connection/Action
  configuration and user identifiers, maps issuer+subject to stable App principals,
  re-verifies email at the successor, then revokes/deletes Auth0 state without
  rewriting learner facts.

### 8.3 SES Frankfurt

- Select `eu-central-1` before every SES action; identities, quotas, sandbox status,
  suppression, SMTP credentials, and configuration sets are regional.
- Use a dedicated sending subdomain, not the root domain. Authoritative-DNS steps add
  SES verification/Easy-DKIM CNAME records, a custom MAIL FROM MX and SPF TXT record,
  and a DMARC TXT record aligned through DKIM and/or SPF. Pangolin resource changes
  are a different guide and never masquerade as public DNS.
- Use a staging configuration set and account-level suppression. Bounce/complaint
  handling starts with verified SES feedback/console evidence at the owner-only
  checkpoint; automated event handling is implemented with product email in Stage 09.
  A later production send gate requires operational bounce/complaint processing and
  acceptable reputation before general delivery.
- Create one SMTP credential used only by Auth0 in Frankfurt and one separate IAM
  principal/key for later App product email with only required SES send/read-receipt
  actions. Never use root credentials, reuse SMTP credentials as AWS API keys, or give
  either principal R2/Polly administration.
- Sandbox-safe smoke sends one minimal non-product OTP/template to the verified owner
  identity or SES mailbox simulator, never a learner address. Record message outcome,
  DKIM/SPF/DMARC results, region, configuration-set name, and redacted provider receipt;
  do not record message body, address, message ID if linkable, or credential.
- Request production access only after domain verification, bounce/complaint process,
  sending description, and owner approval are ready. A denial leaves staging in
  sandbox and product email disabled; it never causes a password fallback.

### 8.4 AI, STT, TTS, and Polly

- **Gemini:** one paid staging project, a key restricted to Gemini API and protected by
  provider restrictions available for the deployment. Logging/datasets and voluntary
  data sharing stay off. Smoke sends one fixed synthetic German sentence and strict
  tiny JSON schema to `gemini-3.6-flash`, `thinking_level=low`, no grounding/files,
  maximum 128 output tokens, one attempt, no escalation. Verify schema/model/usage and
  redact content/key/provider response.
- **OpenAI STT:** one staging project key restricted to
  `/v1/audio/transcriptions`. Smoke uses a committed/generated rights-safe synthetic
  sub-five-second German fixture, `language=de`, one request to
  `gpt-4o-mini-transcribe-2025-12-15`, then deletes the local temporary input. Verify
  exact model, a nonempty transcript and log-probability shape; evidence contains only
  fixture digest, byte/duration bounds, result category, latency/usage, not transcript.
- **OpenAI TTS:** a separate staging key restricted to `/v1/audio/speech`. Smoke sends
  one fixed non-personal German sentence to
  `gpt-4o-mini-tts-2025-12-15`, one approved built-in candidate voice recorded by ID,
  and a short output. Verify decodable bounded audio and delete bytes immediately;
  evidence retains only input digest and media metadata, never text/audio.
- OpenAI default data controls are recorded honestly: transcription currently lists
  no abuse/application-state retention, while speech may have abuse logs up to 30
  days; API data is not used for training by default. EU processing/ZDR is not claimed
  unless the dashboard shows approval and the exact endpoint is used.
- **Polly:** no Stage-02 runtime credential. When a later accepted content benchmark
  admits Polly, create a distinct Frankfurt synthesis principal with only
  `polly:SynthesizeSpeech`, audition current de-DE Neural voices against rights-safe
  gold fixtures, create final bytes offline, and delete transient output after
  reviewed publication. One request/voice test is bounded by owner envelope. Standard
  and Generative cannot silently replace Neural; each needs its own audited release.
- All paid providers have provider-side alert/budget controls plus App daily and
  rolling-30-day envelopes. The owner chooses amounts; the plan invents none. The
  readiness validator requires both positive amounts and verification dates before
  `BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING=true`. At 50% signal, 80% shed optional
  work/warn, and 100% circuit new paid work to Pending/fixed fallback.
- A provider dashboard saying “available” never promotes a model. Later capability
  releases bind provider, endpoint, exact model, prompt/schema/voice, deadline,
  retry/circuit, price catalog, benchmark, effective time, and rollback predecessor.

## 9. Configuration and secret contract

`02E` extends `packages/configuration/src/index.ts`, `.env.example`, and
`docs/configuration.md`; it does not add a provider SDK. Existing generic placeholder
keys are replaced or deprecated in one documented compatibility step rather than
leaving ambiguous duplicate sources.

### 9.1 Non-secret or identifier fields

- Auth: `BESTEHEN_AUTH0_ISSUER_BASE_URL`, `BESTEHEN_AUTH0_CLIENT_ID`,
  `BESTEHEN_APPLICATION_BASE_URL`, callback `/auth/callback`, and session policy
  version `session-policy/v1`.
- R2/S3: `BESTEHEN_S3_ENDPOINT`, `BESTEHEN_S3_REGION=auto`, runtime bucket and exact
  allowed prefix set. Bucket/account names are identifiers but remain server-only.
- Email: `BESTEHEN_SES_REGION=eu-central-1`, verified From identifier reference, and
  staging configuration-set identifier.
- AI: `BESTEHEN_GEMINI_MODEL=gemini-3.6-flash`,
  `BESTEHEN_OPENAI_STT_MODEL=gpt-4o-mini-transcribe-2025-12-15`, and
  `BESTEHEN_OPENAI_TTS_MODEL=gpt-4o-mini-tts-2025-12-15`.
- Policy: daily and rolling-30-day paid-envelope integer micro-USD values plus their
  policy revision. They are protected operational configuration even though not
  credentials. No default value is invented.

### 9.2 Secret fields/references

- Auth0 Regular Web App client secret, App session-encryption secret, and protected
  owner allowlist/binding reference.
- R2 runtime access key ID and secret access key. Backup credential is injected only
  into the later backup uploader, never web/worker.
- SES App access key ID/secret key. Auth0 SMTP username/password live in Auth0's email
  provider configuration, not App variables.
- Gemini API key; distinct OpenAI STT and TTS restricted keys. Conditional Polly/AWS
  synthesis credential lives only in the offline batch runner.

Every configured adapter requires its exact identifiers, secrets, region, and policy.
Production forbids fakes; local/test/preview forbid live calls; staging permits them
only when `BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS=true`. Paid calls additionally
require the paid flag and valid envelopes. R2 `eu` endpoint/`auto`, Auth0 HTTPS EU
issuer/staging origin, SES Frankfurt, and exact model IDs are literal validation gates.
No secret may use `NEXT_PUBLIC_*` or enter release metadata/readiness output.

### 9.3 Custody and rotation

| Credential class | Runtime custodian | Rotation/revocation proof |
|---|---|---|
| Coolify/Pangolin owner/admin recovery | protected password manager plus offline recovery copy | new login/MFA works, old session/token revoked; no value in evidence |
| Coolify-to-VM SSH | Coolify key store, scoped to VM-app | new public key works, old authorized key absent, deployment health passes |
| Coolify GitHub App | Coolify/GitHub App stores, selected repo only | clone exact commit succeeds, removed installation cannot clone |
| Auth0 App/session/Action | Coolify or Auth0 store according to consumer | current+previous overlap only where required; old key/session fails after cutover |
| Auth0 SES SMTP | Auth0 email-provider store | test OTP succeeds with new credential; old credential revoked in IAM |
| R2 runtime/backup | consumer-specific Coolify protected store | new sentinel succeeds in allowed bucket; old token fails; cross-bucket denied |
| SES App API | worker/sender protected store | safe simulator send succeeds; old key revoked; unrelated AWS action denied |
| Gemini/OpenAI | worker protected store, separate capability keys | bounded smoke succeeds; old key revoked; forbidden endpoint/project denied |
| Offline recovery/decryption | offline owner-controlled store, absent from VMs | documented recovery check; public-key encryption and isolated decrypt sample pass |

Rotate after suspected disclosure, provider/owner offboarding, material role change, or
provider requirement, and rehearse at least annually plus before final launch. The
procedure is create new → inject without printing → deploy/verify → revoke old → verify
failure → retain a redacted receipt. Never rotate by editing Git history.

## 10. Provider-data map, retention, and exits

| Provider | Minimum data allowed | Retention/deletion boundary | Exit seam |
|---|---|---|---|
| Coolify/Pangolin | commit/config identifiers, container health, owner access identity | bounded operational logs; no learner payloads or env dumps | standard Dockerfile/Node/PG health and ordinary reverse proxy |
| R2 | approved media bytes; ephemeral raw audio; expiring export; encrypted DB archive | raw audio immediate/≤7d backstop; export ≤24h; backup 14 daily + 12 weekly (normal max 84d) | S3 API, immutable manifest/digests, scoped export drill |
| Auth0/SES | verified email, issuer/subject, OTP/template and necessary delivery metadata | provider contract plus App deletion workflow; no learning/profile data | OIDC/profile export and re-verification; alternate SMTP |
| Gemini | minimum response/audio/rubric subset required by registered capability | paid/no training; no developer logs/datasets/files/grounding; provider abuse/ZDR fact recorded | typed capability request/schema and replayable rights-safe benchmark |
| OpenAI STT | finalized bounded audio + `de` + minimal scenario terms | current transcription table: no abuse/application state; verify at release | typed STT port; stored transcript/reference belongs to App policy |
| OpenAI TTS | approved generated partner text only | no application state; default abuse logs may be ≤30d; verify at release | typed TTS port; fixed reviewed audio/text-only fallback |
| Polly | approved script/SSML only in offline batch | provider states no storage/training; final bytes become App asset | script/SSML/QA + successor media revision; alternate TTS/native audio |

Logs and evidence exclude email/name, owner allowlist, private address, full URL/query,
cookies/tokens, prompt/rubric/body, provider response, transcript/audio, learner data,
exact exam date, Readiness, and secrets. Provider deletion/account closure receipts use
opaque resource references and state only. The later revoke-first learner deletion
flow must reconcile Auth0/SES/processor state, R2 objects, backup residual, and restore
suppression; Stage 02 does not implement it.

## 11. GitHub protections and CI

- Keep `permissions: contents: read`, full-SHA Action pins, untrusted-PR-safe jobs,
  `persist-credentials: false`, timeouts, frozen install, and synthetic artifacts.
- Preserve the seven existing Stage 01 job names/checks and the non-publishing exact-
  commit release workflow. Stage 02 adds tests to the appropriate existing policy/
  quality jobs; it does not rename checks or create duplicate workflows.
- Keep `P01 exact-lock dependency audit` mandatory and provider-neutral. It audits the
  complete exact lock at critical severity. Dependency Graph/Dependabot can raise
  review input; GHAS dependency review and secret scanning are unavailable and not
  required.
- On the current private plan, the owner cannot enforce rulesets/required checks via
  GitHub. The guide records the observed `403`, requires a green PR run and independent
  orchestrator acceptance before merge, and offers branch protection only as a future
  optional reinforcement after a plan change.
- Coolify runtime secrets do not go into GitHub environments, repository secrets,
  Actions artifacts, cache keys, command lines, or PR logs. A later deployment uses an
  authenticated Coolify connection/token only from its protected integration context.
- Coolify's GitHub App is installed on only this repository with the minimum current
  permissions. Preview deploys and push-to-branch autodeploy remain off; deployment
  uses the exact accepted commit.

## 12. Machine-verifiable artifacts and tests planned for `02E`

### 12.1 File map

- `docs/setup/personal/README.md` and the nine guides in §14.
- `schemas/personal-provider-readiness.schema.json`: versioned secret-free receipt
  schema with provider, environment, region/model, resource class, checked-at time,
  guide step, result, evidence digest/reference, rollback state, and redaction marker.
- `config/personal-provider-readiness.example.json`: synthetic complete example using
  reserved example names only. No live manifest is committed.
- `scripts/check-provider-readiness.mjs`: validates schema/example, exact literals,
  forbidden fields/values, URL/origin separation, dated guide references, and redacted
  evidence. A local ignored receipt path can be validated without printing contents.
- `packages/configuration/src/index.ts` and tests: exact environment relationships,
  feature gates, region/model allowlists, secret/public classification, and redaction.
- `packages/application/src/index.ts`: only the smallest provider configuration-check
  result vocabulary needed by all six existing capability ports; no vendor SDK type.
- `packages/infrastructure/src/index.ts` and tests: deterministic fake outcomes and
  one reusable provider-configuration contract suite.
- `.env.example` and `docs/configuration.md`: synthetic placeholders and custody.
- `package.json`/existing CI: `check:providers` added to the canonical check; no new
  dependency is expected because Zod/Ajv/Vitest already exist.

If execution proves a new dependency unavoidable, it stops for orchestrator review;
the planned solution intentionally needs none and should not mutate `pnpm-lock.yaml`.
There is no database migration or contract version affecting stored facts.

### 12.2 Deterministic gates

| ID | Gate | Required proof |
|---|---|---|
| `P02-SCOPE-001` | stage scope | only plan/checklist during 02P; only guide/config/schema/fake/test/CI paths during accepted 02E |
| `P02-DOC-001` | guide/link contract | guide index complete; local links valid; every action has owner, expected, verify, rollback, warning |
| `P02-CONFIG-001` | strict configuration | exact accepted valid matrices pass; missing, unknown, mixed-region/model, live-local, paid-without-envelope fail |
| `P02-FAKE-001` | deterministic provider ports | all six capabilities cover fixed success/disabled/error/timeout/quota shapes without network or clock nondeterminism |
| `P02-SECRET-001` | custody/redaction | secret scanner plus canaries prove env/key/email/audio/provider bodies absent from logs/evidence/public config |
| `P02-READINESS-001` | readiness schema | synthetic receipt valid; secret/private-data fields and false live claims rejected; step IDs resolve |
| `P02-DEPS-001` | supply chain | frozen lock unchanged unless approved; full exact-lock critical audit and source/lifecycle policy pass |
| `P02-COMPAT-001` | exit/compatibility | fake provider swap changes configuration only; no provider types above infrastructure/composition boundary |

Fake tests run in every PR. Live tests never run in ordinary PR/push CI and never
replace these gates.

### 12.3 Bounded live-smoke contract

The setup guides define a common harness contract for the post-02E checkpoint and
later staging cycles:

- Require `BESTEHEN_LIVE_SMOKE=1`, environment `staging`, an explicit provider name,
  and protected credentials already present in the execution environment. Refuse
  local/test/preview/production and refuse missing budget/envelope verification.
- Use only generated or committed rights-safe synthetic fixtures. Never use a learner,
  owner email in output, production object, real prompt/rubric, recording, transcript,
  or evidence fact.
- Maximum one create/call and one verification read per provider, with one cleanup
  operation; no semantic retry or model escalation. Enforce small byte/token/character
  limits, timeout, and provider-side spend caps.
- Preflight checks endpoint/region/model and flags. Cleanup runs on failure. Output is
  an allowlisted JSON receipt with provider, capability, exact commit, result class,
  region/model, bounded usage, latency, cleanup state, guide step, and digest—never
  request/response content, address, object key, message ID, account ID, URL, or secret.
- Dashboard-only actions cite the exact guide step and the owner records only its
  verification result. The agent never requests, views, repeats, or validates the
  secret value itself.

## 13. Post-02E service-readiness checkpoint and ongoing staging

This checkpoint begins only after the orchestrator accepts and merges `02E`. It is a
named operational boundary, not `02E` work and not a reason to reopen Stage 01.

### 13.1 Entry

- Exact accepted `02E` merge commit recorded; clean checkout and green mandatory CI.
- Owner has reviewed spend/terms/data handling, chosen private domain identifiers and
  positive daily/rolling envelopes in a protected ledger, and has access to every
  required dashboard plus authoritative DNS.
- Authenticated Coolify connection is used when available. If an operation is
  dashboard-only, the agent points to its exact guide step, the owner performs it, and
  only the redacted expected/actual result is recorded. No secret value is requested.

### 13.2 Dependency-ordered checkpoint

1. `OPS-01` inventories VM-control/VM-app private addresses, installed Coolify,
   Pangolin/Newt and Docker versions, time sync, disk headroom, backups/recovery, and
   firewall state without persisting private values.
2. `OPS-02` creates/validates the selected-repository Coolify GitHub App, remote
   VM-app SSH access, private project/environment, and private Coolify Pangolin
   resource. Auto/preview deploy remain off.
3. `OPS-03` creates the private staging Pangolin HTTP resource and owner grants,
   verifies anonymous/no-client denial, owner-client access, HTTPS, and readiness
   routing, with no app authorization claim.
4. `R2-01` through `R2-07` create EU runtime/backup buckets, scoped credentials,
   CORS/lifecycle/budget controls, and synthetic put/head/get/delete plus backup-
   sentinel cleanup. Cross-bucket access and public access must fail.
5. `SES-01` through `SES-08` create/verify Frankfurt identity, DNS alignment,
   configuration set, suppression/feedback, least-privilege credentials, and a
   sandbox-safe message. DNS verification records are separate from Pangolin config.
6. `AUTH-01` through `AUTH-10` create the EU staging tenant/application/connection,
   exact origin callbacks, SES provider, one owner, allowlist Action, session/recovery
   controls, and verify allowed-owner OTP plus disallowed-user denial. The App server
   owner boundary remains closed until Stage 03.
7. `AI-01` through `AI-04` configure Gemini paid staging/model/logging/budget settings
   and run the bounded synthetic schema smoke with productive feature flags still off.
8. `AUDIO-01` through `AUDIO-05` configure separate OpenAI STT/TTS restricted keys,
   data/budget settings, and run the bounded generated-audio/text smokes. `POLLY-01`
   records `not_admitted` unless an accepted benchmark exists; only then is the
   Frankfurt synthesis principal/smoke created.
9. `STAGE-01` deploys the exact accepted `02E` commit with fake adapters first, runs
   liveness/readiness and fake tests, injects protected configured-service values
   without exposing them, and runs only resource-level live smokes. External/productive
   flags return to false after the smoke.
10. `STAGE-02` verifies PostgreSQL private reachability and an encrypted synthetic
    recovery sentinel to the backup bucket. It records that Coolify/App backup and an
    isolated restore are distinct and not yet a production restore claim.
11. `STAGE-03` validates the redacted readiness receipt, secret scan, resource/budget
    inventory, cleanup, revoked temporary credentials, and rollback. Failure leaves
    the affected adapter disabled/fake and blocks the next live-dependent stage only;
    unrelated deterministic implementation may continue.

### 13.3 After accepted `03E`–`09E`

For each stage, the orchestrator records the accepted 40-character commit, runs all
deterministic CI, verifies migration/compatibility and a current backup when relevant,
deploys that exact commit to private Coolify staging, verifies `/api/health/live` and
`/api/health/ready`, and runs only these bounded live scopes:

- `03E`: Auth0 callback/OTP, closed owner authorization, session failure, private PG;
- `04E`: private staging ingress plus real hosted-login/app keyboard/reflow smoke;
- `05E`: private R2 approved synthetic-object flow and deterministic learning runtime;
- `06E`: Gemini/STT/TTS candidate paths, raw-audio immediate deletion/≤7d backstop,
  object authorization, paid circuits and fixed/Pending fallbacks; Polly only if admitted;
- `07E`: AI candidate-to-deterministic-evidence boundary and provider outage fallback;
- `08E`: no-probability and independent Written/Oral truth under live provider faults;
- `09E`: Auth0/SES sessions/notifications, export ≤24h, revoke-first deletion,
  provider-pending reconciliation, R2 deletion, backup restore suppression.

Each cycle retains the exact commit, guide/test IDs, timestamps, result categories,
bounded usage/cost, cleanup and rollback state in redacted evidence. It never stores
credentials or provider payloads. A live failure does not permit weakening a fake
contract, evidence truth, authorization, retention, accessibility, or spend circuit.

## 14. Guide inventory and owner-action contract

`02E` creates these files in dependency order:

1. `docs/setup/personal/README.md` — index, prerequisites, symbolic values, owner vs
   agent responsibilities, evidence format, and checkpoint/continuous-staging flow.
2. `docs/setup/personal/01-github.md` — observed Dependency Graph, unavailable GHAS
   variance, exact-lock gate, GitHub App minimal access, CI/PR acceptance.
3. `docs/setup/personal/02-coolify-two-vm.md` — inventory, server roles, SSH, project,
   Dockerfile resources, private ports, health, migration, variables, backup/update,
   rollback and Render exit.
4. `docs/setup/personal/03-pangolin-private-ingress-and-dns.md` — Newt private
   resources, owner grants, internal names, targets/health, firewall, authoritative-
   DNS separation, denial and rollback tests.
5. `docs/setup/personal/04-r2-eu-private-storage.md` — jurisdiction, buckets/prefixes,
   credentials, CORS/lifecycle/no-versioning, presigning, deletion, budget, backup and exit.
6. `docs/setup/personal/05-auth0-eu-email-otp.md` — tenant/app/connection, exact URLs,
   SES provider, owner/Action, session/recent auth, rotation, recovery, accessibility and exit.
7. `docs/setup/personal/06-ses-frankfurt.md` — region, identity/DNS, DKIM/SPF/DMARC,
   sandbox/production, credentials, feedback/suppression, safe tests and rollback.
8. `docs/setup/personal/07-ai-stt-tts.md` — Gemini/OpenAI/conditional Polly accounts,
   exact models, privacy/logging, credentials, quotas/envelopes, bounded smokes and exits.
9. `docs/setup/personal/08-secrets-rotation-recovery.md` — custody matrix, creation,
   injection, rotation, compromise, recovery/offboarding and redacted evidence.
10. `docs/setup/personal/09-staging-readiness.md` — post-02E checkpoint, exact-commit
    deployment, live-smoke matrix, cleanup, rollback and `03E`–`09E` recurrence.

Every numbered action has exactly this shape:

- `Step ID` and `Owner`: agent via authenticated connection, or account owner in the
  named dashboard. Owner-only steps never ask for the entered value.
- `Action`: exact navigation/API operation and symbolic inputs.
- `Expected result`: observable state, not “configured successfully.”
- `How to verify`: read-only command/dashboard field/negative test and acceptable result.
- `Evidence`: allowlisted fields and redaction rule, including verification date.
- `Rollback`: disable/revoke/delete/revert action and proof that it took effect.
- `NEVER PASTE HERE`: named secret/private-data classes prohibited from repo, issue,
  PR, chat/prompt, screenshots, commands, logs, and evidence.

## 15. Execution sequence for `02E`

1. Reverify exact accepted Planning commit, branch/PR ancestry, remote/default branch,
   clean tree, and unchanged authority files. Stop on mismatch.
2. Add the guide index and shared owner-action/evidence vocabulary; then add guides in
   the dependency order in §14 using only dated official sources.
3. Add readiness JSON Schema, synthetic example, and validator with invalid fixtures
   for secret/private data, false live claims, unknown steps, wrong regions/models,
   wildcard origins, and missing rollback/verification.
4. Extend configuration and docs with the exact provider/secret/envelope relationships.
   Preserve fake defaults and closed flags; replace ambiguous generic fields cleanly.
5. Extend the existing provider configuration-check port only as needed, implement
   deterministic fake outcomes, and run the same contract suite for all six capabilities.
6. Add the new provider check to existing canonical CI/check commands. Preserve exact
   action/runtime versions and the mandatory full-lock critical advisory gate.
7. Run proportional verification in §17, inspect the complete diff and secret scan,
   commit/push, and update the draft PR. Do not create any live resource or execute
   §13.
8. Write the `02E` handoff only during accepted Execution, with exact commits, changed
   paths, gates, compatibility, no-migration statement, risks, and pending owner/checkpoint
   actions. Independent orchestrator review alone changes `02P`/`02E` to `[x]`.

## 16. Rollback, compatibility, and failure posture

- **Planning rollback:** revert only the plan/checklist evidence commit; no external
  state exists. `main`, Stage 01, and accepted architecture remain unchanged.
- **Execution rollback:** revert guide/schema/config/fake changes as one compatible
  no-data change. There is no database down migration, provider account, or secret to undo.
- **Checkpoint rollback:** first set external/paid/productive flags false, then select
  fake adapters, verify readiness/unrelated work, revoke new credentials, remove
  callbacks/CORS/ingress/DNS only in dependency-reverse order, and retain a redacted
  incident/rollback receipt. Never delete a bucket/tenant before export/deletion duties
  are checked.
- **Provider/model failure:** affected work uses fixed reviewed/deterministic fallback
  or durable Pending; it never becomes negative learner evidence. A model alias/update
  is not accepted in place of an unavailable pinned snapshot without benchmark and a
  new release decision.
- **Identity/email failure:** existing bounded App sessions and local work continue
  where allowed; new sign-in/recovery waits. No password or allowlist bypass is invented.
- **R2 failure:** block only affected media/object action; text/unrelated work continues.
  Raw audio and deletion deadlines still apply.
- **Hosting/ingress failure:** ordinary Dockerfile/Node/PG/S3 and health contracts allow
  Render/comparable-host migration. No learner fact or provider identifier is re-keyed.

## 17. Planning and later evidence

### 17.1 `02P` checks before handoff

- Confirm diff contains only this plan and the single `02P` checklist line.
- Run `pnpm check:scope`, `pnpm test:scope`, `pnpm check:secrets`,
  `pnpm check:docs`, `pnpm format:check`, and `git diff --check` with the exact Stage 01
  toolchain. These are planning checks, not claims that `02E` artifacts exist.
- Search changed files for credential/token/private-key patterns, email addresses,
  private addresses, and accidental later-stage scope. Inspect every external link
  target and every local path named by the plan.
- Fetch and prove baseline ancestry, PR head/base/draft/open/mergeable state, and clean
  tree after the final commit. Record exact commit and PR/run evidence in the handoff
  message/PR; a commit cannot truthfully contain its own SHA.

### 17.2 `02E` acceptance evidence

- All `P02-*` gates in §12 pass locally and on clean GitHub Linux alongside every
  preserved Stage 01 gate and the exact-lock critical advisory check.
- No real secret/account/resource is necessary; tests are deterministic, network-free,
  and pass with all external/productive flags false.
- Guide link/navigation details are rechecked on their execution date. Each unresolved
  dashboard-only item is honestly `owner_pending`, never “pass.”
- `pnpm-lock.yaml` remains unchanged unless separately justified and accepted; no
  migration, deployment, account creation, DNS mutation, or paid call occurred.

### 17.3 Live evidence after `02E`

Only §13 may produce live evidence: redacted readiness receipts, exact accepted commit,
provider region/model/resource class, bounded usage/cost, negative access tests,
cleanup, and rollback. It is stored in the repository only if schema-safe and
non-sensitive; otherwise the repository contains a digest/reference to the protected
evidence location and the exact guide step/result.

## 18. Risks and owners

| Risk | Control and fallback | Owner |
|---|---|---|
| Private-plan GitHub controls unavailable | mandatory CI + exact-lock audit + independent PR acceptance; no GHAS gate | repository owner |
| Misconfigured public ingress/DNS | Pangolin private resource, explicit owner grants, anonymous denial; SES DNS separately reviewed | operations owner |
| Secret leaks through build/log/evidence | Coolify runtime-only locked values, central redaction, canaries/scans, revoke procedure | security/operations |
| Wrong provider region/model/tenant | literal validator, dated dashboard verification, fail closed, recreate empty resource | provider owner |
| Spend surprise or duplicate paid call | provider budgets + positive App envelopes + one-call smoke + 50/80/100% circuits | billing/AI owner |
| Provider retention/terms change | dated release recheck, minimized payload, disabled route, typed exit/fallback | privacy/provider owner |
| R2 deletion/versioning misconception | immediate app delete + lifecycle backstop + absence check; immutable keys/digests, no fake versioning claim | storage owner |
| Auth0/Pangolin mistaken for authorization | server owner binding remains mandatory; deny tests; no header trust | identity/security |
| Backup exists but cannot restore | encrypted portable archive plan + isolated restore; Coolify backup is not sufficient evidence | recovery owner |
| Live staging drifts until Stage 10 | exact-commit deploy and relevant bounded live suite after every accepted `03E`–`09E` | orchestrator/operations |

## 19. Precise Definition of Done

`02P` is ready for independent acceptance when:

- this plan and only the allowed `02P` `[~]` evidence line are committed on the
  mandated branch from the exact accepted baseline;
- every required service/resource/credential class, region, origin/callback, object
  class, DNS/Pangolin distinction, role, quota/budget, backup, recovery, and verification
  gate is inventoried with launch-blocking versus conditional status;
- exact provider/model decisions and current dated official sources are explicit;
- the guide, schema/config, fake-test, evidence, rollback, ownership, and repository
  path maps are implementation-ready without live accounts;
- GHAS is explicitly not a gate while the provider-neutral exact-lock critical audit
  remains mandatory;
- the post-02E readiness checkpoint and exact-commit `03E`–`09E` staging cycle are
  explicit, bounded, synthetic, least-privilege, spend-limited, and redacted;
- secrets remain in Coolify/protected stores; authenticated Coolify use is preferred;
  dashboard-only owner actions cite guide steps and never request values;
- portability, provider exit, deterministic truth/fakes, security, privacy, retention,
  recovery, accessibility, compatibility, and cost circuits are preserved; and
- planning checks pass, the draft PR is open/mergeable/unmerged, and neither `02P`
  nor `02E` is marked accepted by this worker.

`02E` must not start until an independent orchestrator accepts this Planning commit.
