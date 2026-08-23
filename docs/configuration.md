# Configuration inventory

`packages/configuration` parses only `DATABASE_URL` and `BESTEHEN_*` server fields. Unknown, malformed, or incomplete fields fail startup. Server configuration is never serialized to the browser; the only public build field is `NEXT_PUBLIC_APP_NAME`, fixed to `Bestehen`.

## Baseline runtime

- `BESTEHEN_APP_ENV`: `local`, `test`, `preview`, `staging`, or `production`; required, server-only.
- `BESTEHEN_RELEASE_COMMIT`: immutable release identity; required, server-only.
- `BESTEHEN_RELEASE_DIRTY`: strict boolean; defaults false and releases refuse true.
- `BESTEHEN_SCHEMA_MIN_REVISION`, `BESTEHEN_SCHEMA_MAX_REVISION`: compatibility range; both default `baseline`.
- `BESTEHEN_WEB_PORT`, `BESTEHEN_WORKER_PORT`: internal listeners; default `3000` and `3001`.
- `BESTEHEN_SHUTDOWN_GRACE_MS`: bounded shutdown; default `5000`.
- `BESTEHEN_LOG_LEVEL`: structured log level; default `info`.
- `BESTEHEN_LOG_FORMAT`: fixed to `json`.
- `DATABASE_URL`: PostgreSQL URL; required secret configuration. Rotate and inject through the future runtime secret owner; never expose it to the browser or evidence.

## Adapters and closed flags

`BESTEHEN_AUTH_ADAPTER`, `BESTEHEN_OBJECT_STORAGE_ADAPTER`, `BESTEHEN_EMAIL_ADAPTER`, `BESTEHEN_AI_ADAPTER`, `BESTEHEN_STT_ADAPTER`, and `BESTEHEN_TTS_ADAPTER` default to `fake`. Production refuses fakes. Configured adapters require all of their fields below.

`BESTEHEN_FLAG_GUEST_PRESENTATION`, `BESTEHEN_FLAG_ACCOUNT_OPTIONAL_PRESENTATION`, `BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS`, `BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING`, `BESTEHEN_FLAG_PUBLIC_OBJECT_ACCESS`, and `BESTEHEN_FLAG_EXPERIMENTAL_PRODUCT_BEHAVIOR` are strict booleans and default false. External calls are forbidden in local, test, and preview even if requested.

## Reserved configured-adapter fields

- Identity: `BESTEHEN_AUTH0_DOMAIN`, `BESTEHEN_AUTH0_CLIENT_ID`, `BESTEHEN_AUTH0_SESSION_SECRET`, `BESTEHEN_OWNER_ALLOWLIST`, `BESTEHEN_APPLICATION_BASE_URL`.
- Private object storage: `BESTEHEN_S3_ENDPOINT`, `BESTEHEN_S3_REGION`, `BESTEHEN_S3_BUCKET`, `BESTEHEN_S3_PREFIX`, `BESTEHEN_S3_ACCESS_KEY_ID`, `BESTEHEN_S3_SECRET_ACCESS_KEY`.
- Provider credentials: `BESTEHEN_EMAIL_API_KEY`, `BESTEHEN_AI_API_KEY`, `BESTEHEN_STT_API_KEY`, `BESTEHEN_TTS_API_KEY`.

These are all server-only. Secret and private-identity values are redacted centrally. Selection, regional/retention constraints, injection, rotation, revocation, and recovery remain named owner actions in later stages; Stage 01 supplies no real value and validates no live account. `.env.example` contains only fake/local synthetic placeholders.
