# Personal provider setup

Last verified against official provider documentation: **2026-08-23**.

This is the dependency-ordered runbook for the private, single-owner staging
checkpoint. Stage 02 only prepares and tests this runbook. Do not perform any step
until `02E` has been independently accepted and merged. Keep every productive and
paid flag false until the relevant later stage is accepted.

## Safe sequence

1. [GitHub](./01-github.md)
2. [Coolify on two VMs](./02-coolify-two-vm.md)
3. [Pangolin private ingress and DNS boundaries](./03-pangolin-private-ingress-and-dns.md)
4. [Cloudflare R2 private EU storage](./04-r2-eu-private-storage.md)
5. [Auth0 EU Passwordless Email OTP](./05-auth0-eu-email-otp.md)
6. [Amazon SES Frankfurt](./06-ses-frankfurt.md)
7. [AI, STT, and TTS](./07-ai-stt-tts.md)
8. [Secrets, rotation, recovery, and offboarding](./08-secrets-rotation-recovery.md)
9. [Post-02E staging-readiness checkpoint](./09-staging-readiness.md)

The owner performs dashboard, billing, terms, DNS, account, and secret-entry steps.
An agent may use an authenticated connection only when the owner has already granted
that authority. A dashboard-only step returns a redacted result such as
`owner_pending`, `verified`, `failed`, or `rolled_back`; it never returns a value.

The readiness receipt covers the private runtime boundaries (Coolify and Pangolin)
and the seven provider rows. GitHub source, Dependency Graph, and CI readiness remain
repository evidence recorded by commit and check URL in the handoff. GitHub is
intentionally rejected as a receipt resource; no GitHub identifier or credential
belongs in the receipt.

## Prerequisites and symbolic values

Choose these in a protected owner ledger before starting. Angle-bracket values are
symbols, not text to paste literally:

| Symbol | Meaning | Repository-safe? |
|---|---|---|
| `<owner-domain>` | privately owned base domain | no |
| `https://staging.<owner-domain>` | single private staging origin | no |
| `https://staging.<owner-domain>/auth/callback` | exact Auth0 callback | no |
| `<vm-control-private-address>` | Coolify controller/Pangolin path | no |
| `<vm-app-private-address>` | Coolify deployment host | no |
| `<owner-email>` | sole Auth0/SES owner identity | never |
| `<protected-ledger-ref>` | opaque reference to protected evidence or a secret record | yes, only if it reveals no provider/account/private identifier |

Required before the checkpoint: access to the existing two Linux VMs, authoritative
DNS, GitHub, Coolify, Pangolin, Cloudflare, Auth0, AWS, Google AI, and OpenAI
dashboards; MFA and offline recovery material; an owner-approved spend envelope; and
the exact accepted merge commit. Record installed Coolify, Pangolin/Newt, Docker, and
host OS versions without recording private addresses.

## Names and regions

| Resource | Staging convention | Fixed location/status |
|---|---|---|
| Coolify project/environment | `bestehen` / `staging` | existing two-VM private network |
| Pangolin resources | `bestehen-coolify`, `bestehen-staging` | private HTTP resources, explicit owner access |
| R2 runtime/backup | `bestehen-staging-runtime`, `bestehen-staging-backup` | jurisdiction `eu`, Standard, SDK region `auto` |
| Auth0 | separate staging tenant/application | tenant region `EU`; GA Passwordless Email connection `email` |
| SES | dedicated sending and MAIL FROM subdomains | `eu-central-1` |
| Gemini | billing-enabled staging project | exact `gemini-3.6-flash` |
| OpenAI | staging project; separate STT/TTS keys | exact dated mini Transcribe/TTS snapshots |
| Polly | no resource by default | `not_admitted` until an accepted media benchmark |

Production resources and credentials are always separate. Never encode an email,
name, account ID, transcript, object meaning, or private address into a resource name,
object key, evidence reference, or commit.

## Origin and callback matrix

| Consumer | Exact value | Wildcards/localhost |
|---|---|---|
| App base URL | `https://staging.<owner-domain>` | forbidden |
| Auth0 Allowed Callback URL | `https://staging.<owner-domain>/auth/callback` | forbidden |
| Auth0 Allowed Logout URL | `https://staging.<owner-domain>` | forbidden |
| Auth0 Allowed Web Origin | `https://staging.<owner-domain>` | forbidden |
| R2 runtime CORS origin | `https://staging.<owner-domain>` | forbidden |
| Coolify public instance URL | the existing protected controller URL | never reused as the App origin |
| Pangolin private HTTP names | the two owner-only internal names above | configured in Pangolin, not authoritative public DNS |

## Inventory templates

Keep values in the protected ledger. Repository evidence may contain only the column
names and redacted result categories.

### Resources and secret custody

| Provider/resource | Owner | Region/class | Secret name/reference | Consumer | Created/verified | Revocation proof |
|---|---|---|---|---|---|---|
| `<provider-resource>` | `<owner-role>` | `<fixed-region>` | `<protected-ledger-ref>` | `<one-purpose-consumer>` | `<date/result>` | `<redacted-result>` |

### Least-privilege roles

| Principal | Minimum access | Explicitly denied |
|---|---|---|
| Coolify GitHub App | contents/metadata for this repository only | organization-wide or write access |
| Coolify to VM-app | deployment SSH on VM-app only | VM-control reuse, Docker API exposure |
| R2 runtime | object read/write/list on runtime bucket only | backup bucket, bucket administration |
| R2 backup uploader | object read/write/list on backup bucket only | runtime bucket, decrypt capability |
| Auth0 provisioning client | `create:users` temporarily; enabled on `email` only while provisioning | read/update/delete users |
| SES Auth0 SMTP | SMTP send from verified identity | AWS API and other services |
| SES App sender | required SES send/configuration-set actions only | R2, Polly, IAM administration |
| Gemini/OpenAI | one staging project/capability | unrelated endpoints/projects |
| Conditional Polly | `polly:SynthesizeSpeech` in Frankfurt | other AWS services and administration |

### Data, region, and retention

| Processor/store | Minimum data | Region observation | Retention/deletion boundary | Exit |
|---|---|---|---|---|
| R2 runtime | approved media; ephemeral raw audio; expiring export | EU jurisdiction | raw audio immediate/7-day backstop; export ≤24h | S3-compatible manifest/digest export |
| R2 backup | encrypted PostgreSQL archive, recovery sentinel | EU jurisdiction | 14 daily + 12 weekly, normally ≤84d | portable encrypted archive |
| Auth0/SES | verified email, issuer/subject, OTP/delivery metadata | Auth0 EU; SES Frankfurt | reviewed provider contract plus later App deletion | OIDC export/re-verification; SMTP replacement |
| Gemini | minimum capability payload | record actual route; do not claim EU/ZDR without proof | paid/no training; logging/datasets/files/grounding off | typed fixture/benchmark replay |
| OpenAI STT/TTS | bounded finalized audio or approved partner text | record actual route; do not assume EU/ZDR | endpoint-specific current controls; temporary bytes deleted | typed STT/TTS fixture replay |
| Polly | approved script/SSML only, if admitted | Frankfurt | offline batch; transient output removed after QA | scripts/manifests and alternate TTS |

### Budget, backup, recovery, and contacts

| Item | Owner value kept outside Git | Verification cadence | Failure action |
|---|---|---|---|
| Daily/rolling paid envelope | positive micro-USD values and policy revision | before enablement and monthly | 50% signal; 80% shed optional work; 100% circuit new paid work |
| Provider budget alerts | owner-selected values/recipients | monthly and after billing change | disable affected route, reconcile invoice |
| PostgreSQL archive | schedule, encryption, protected key custody | daily age; quarterly isolated restore | keep service closed until restore + deletion replay passes |
| Coolify recovery | controller backup and protected `APP_KEY` custody | before update; quarterly inventory | restore controller separately from App data |
| Recovery contacts | primary and alternate owner channels | quarterly | use provider recovery process; never publish contact detail |
| Rotation calendar | credential class, last/next date, dependents | at least annually and on trigger | disable, rotate, verify, revoke old |

### Offboarding/export checklist

- Freeze new writes for the scoped provider capability.
- Export only the provider-neutral manifest/configuration allowed by its guide.
- Verify counts, digests, current denial/deletion overlays, and a sample.
- Activate the validated successor before revoking the old credential.
- Revoke old sessions/tokens/keys and verify an old credential fails.
- Delete provider state only after export and data-rights duties are satisfied.
- Retain a redacted receipt with exact guide step, result class, date, cleanup, and rollback state.

## Evidence contract

Use [`schemas/personal-provider-readiness.schema.json`](../../../schemas/personal-provider-readiness.schema.json)
and the synthetic [example](../../../config/personal-provider-readiness.example.json).
Validate committed synthetic evidence with `pnpm check:providers`. A protected local
receipt may be checked with `pnpm check:providers -- --receipt <local-path>`; the
validator prints only field names and aggregate status, never file contents.

Every numbered action below has Owner, Action, Expected result, How to verify,
Evidence, Rollback, and NEVER PASTE HERE. A screenshot may supplement a result but is
never the only instruction or proof.
