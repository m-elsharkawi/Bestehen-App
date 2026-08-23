# IDR-0001 — personal deployment profile

- Status: accepted implementation constraint for Personal Stage 01
- Date: 2026-08-23
- Authority: subordinate to accepted architecture and ADRs, including [ADR-0008](../../Architecture/adr/ADR-0008-render-single-region-managed-deployment.md)

## Decision

The personal profile uses Pangolin ingress and a Coolify application VM/orchestration target. Only web HTTP is public and Pangolin routes on web readiness. PostgreSQL, worker control, object-store administration, and persistent services remain private. Ingress is not authorization: Auth0 EU Universal Login email OTP supplies identity proof, registration is closed, and the application server admits only the configured owner identity. No password fallback is introduced.

Guest and account-optional domain/HTTP seams remain viable, while their presentation is disabled by closed typed flags. Private objects use an S3-compatible application port with R2 as the planned personal adapter. Identity, object storage, email, AI, STT, TTS, and ingress remain configuration/adapter choices; provider types cannot enter domain or application interfaces. There is no native application or PWA scope.

## Consequences and reversibility

Standard Node processes, PostgreSQL, S3-compatible boundaries, explicit migration ownership, ports, and health contracts keep the web/worker images deployable on Render or a comparable host. No Coolify or Pangolin API enters production packages. Changing ingress, orchestrator, or a provider therefore changes configuration/adapters and operator evidence, not accepted domain facts.

The personal profile trades multi-region availability for bounded personal cost. It does not claim a live service, selected account, configured credential, DNS record, backup, restore, or production test. Those remain owner-controlled in later stages. If the personal deployment choice changes, replace this implementation record through review while retaining the provider-neutral contracts and the compatibility obligations in ADR-0008.
