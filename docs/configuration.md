# Configuration inventory

`packages/configuration` parses only `DATABASE_URL` and `BESTEHEN_*` server fields. Unknown, malformed, or incomplete fields fail startup. Server configuration is never serialized to the browser; the only public build field is `NEXT_PUBLIC_APP_NAME`, fixed to `Bestehen`.

## Foundation runtime

- `BESTEHEN_APP_ENV`: `local`, `test`, `preview`, `staging`, or `production`; required, server-only.
- `BESTEHEN_RELEASE_COMMIT`: immutable release identity; required, server-only.
- `BESTEHEN_RELEASE_DIRTY`: strict boolean; defaults false and releases refuse true.
- `BESTEHEN_SCHEMA_MIN_REVISION`, `BESTEHEN_SCHEMA_MAX_REVISION`: the Stage 05 runtime's inclusive compatibility range. They default to `20260825_040_p03_foundation` and `20260905_062_p05_listening_runtime`. This range supports Stage 05 rollout sequencing; it does not authorize a Stage 04 image against the newer database. Rolling the application back to Stage 04 also requires restoring the database to the Stage 03 revision.
- `BESTEHEN_WEB_PORT`, `BESTEHEN_WORKER_PORT`: internal listeners; default `3000` and `3001`.
- `BESTEHEN_SHUTDOWN_GRACE_MS`: bounded shutdown; default `5000`.
- `BESTEHEN_LOG_LEVEL`: structured log level; default `info`.
- `BESTEHEN_LOG_FORMAT`: fixed to `json`.
- `DATABASE_URL`: PostgreSQL URL used only as the local/test fallback; required secret configuration.
- `BESTEHEN_MIGRATOR_DATABASE_URL`, `BESTEHEN_WEB_DATABASE_URL`, `BESTEHEN_WORKER_DATABASE_URL`: protected role-specific PostgreSQL URLs. Staging/production require the matching URL in each service: migrator and one-shot owner bootstrap receive only the migrator URL, web receives only the web URL, and worker receives only the worker URL. A complete offline configuration audit may validate all three together and requires distinct database principals. Only the migrator/one-shot bootstrap role may perform DDL; web and worker roles are runtime-only. Rotate and inject each URL through the runtime secret owner; never expose it to another service, the browser, or evidence.

## Adapters and closed flags

`BESTEHEN_AUTH_ADAPTER`, `BESTEHEN_OBJECT_STORAGE_ADAPTER`, `BESTEHEN_EMAIL_ADAPTER`, `BESTEHEN_AI_ADAPTER`, `BESTEHEN_STT_ADAPTER`, and `BESTEHEN_TTS_ADAPTER` default to `fake`. Their only configured values are respectively `auth0`, `r2`, `ses`, `gemini`, `openai`, and `openai`. Production refuses fakes. Selecting a provider requires its complete exact group below even while its route remains disabled.

`BESTEHEN_FLAG_GUEST_PRESENTATION`, `BESTEHEN_FLAG_ACCOUNT_OPTIONAL_PRESENTATION`, `BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS`, `BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING`, `BESTEHEN_FLAG_PUBLIC_OBJECT_ACCESS`, and `BESTEHEN_FLAG_EXPERIMENTAL_PRODUCT_BEHAVIOR` are strict booleans and default false. External calls are forbidden in local, test, and preview even if requested. Paid processing additionally requires external calls, exact Gemini/OpenAI selections, and the complete verified envelope group. Public object access is forbidden for this personal profile.

## Configured-adapter fields

- Auth0: `BESTEHEN_AUTH0_ISSUER_BASE_URL` must be an HTTPS EU Auth0 issuer; `BESTEHEN_APPLICATION_BASE_URL` is one HTTPS origin without path or wildcard. `BESTEHEN_AUTH0_CLIENT_ID`, `BESTEHEN_AUTH0_CLIENT_SECRET`, `BESTEHEN_AUTH0_SESSION_SECRET` (at least 32 characters), and `BESTEHEN_AUTH0_OWNER_ALLOWLIST_REFERENCE` are server-only. The App session secret is separate from Coolify's controller `APP_KEY`; only web and the one-shot owner bootstrap receive it. The session secret is purpose-separated for keyed session/state/nonce digests and recoverable sealed PKCE storage. `BESTEHEN_AUTH0_CONNECTION` is exactly `email`, `BESTEHEN_AUTH0_CALLBACK_PATH` is exactly `/auth/callback`, and `BESTEHEN_AUTH0_SESSION_POLICY_REVISION` is exactly `session-policy/v1`. Selecting Auth0 does not make a provider call while the external-provider flag remains false. Email OTP sign-in resolves only a pre-bound issuer+subject; email is never authorization.
- R2: `BESTEHEN_S3_ENDPOINT` must use the EU jurisdiction endpoint, `BESTEHEN_S3_REGION` is exactly `auto`, and `BESTEHEN_S3_ALLOWED_PREFIXES` is exactly `media/approved/,audio/raw/,exports/,tmp/`. `BESTEHEN_S3_BUCKET`, `BESTEHEN_S3_ACCESS_KEY_ID`, and `BESTEHEN_S3_SECRET_ACCESS_KEY` remain private server fields. The bucket stays private.
- SES: `BESTEHEN_SES_REGION` is exactly `eu-central-1`; `BESTEHEN_SES_FROM_REFERENCE`, `BESTEHEN_SES_CONFIGURATION_SET`, `BESTEHEN_SES_ACCESS_KEY_ID`, and `BESTEHEN_SES_SECRET_ACCESS_KEY` belong only to the App email consumer. Auth0's distinct SMTP credential stays in Auth0.
- AI/audio: `BESTEHEN_GEMINI_MODEL` is exactly `gemini-3.6-flash`, `BESTEHEN_OPENAI_STT_MODEL` is exactly `gpt-4o-mini-transcribe-2025-12-15`, and `BESTEHEN_OPENAI_TTS_MODEL` is exactly `gpt-4o-mini-tts-2025-12-15`. Credentials are separate `BESTEHEN_GEMINI_API_KEY`, `BESTEHEN_OPENAI_STT_API_KEY`, and `BESTEHEN_OPENAI_TTS_API_KEY` values.
- Paid envelope: positive integer `BESTEHEN_PAID_DAILY_ENVELOPE_MICRO_USD` and `BESTEHEN_PAID_ROLLING_30D_ENVELOPE_MICRO_USD`, plus `BESTEHEN_PAID_ENVELOPE_POLICY_REVISION` and ISO date `BESTEHEN_PAID_ENVELOPE_VERIFIED_AT`. Partial groups fail startup. Amounts and verification evidence remain protected operations data.

These are all server-only and may not use `NEXT_PUBLIC_*`. Secret, identifier, and provider response values are redacted centrally and excluded from release/readiness output. Follow the [personal setup guides](./setup/personal/README.md) for custody, verification, rotation, rollback, and provider exit. Stage 02 supplies no real value or live adapter. `.env.example` contains only fake/local synthetic placeholders.
