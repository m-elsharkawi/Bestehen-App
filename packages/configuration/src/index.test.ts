import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { createLogger, featureFlags, parseServerEnvironment, sanitizeLogPayload } from "./index.js";

function validEnvironment(): Record<string, string> {
  return {
    BESTEHEN_APP_ENV: "test",
    BESTEHEN_RELEASE_COMMIT: "synthetic-commit",
    BESTEHEN_RELEASE_DIRTY: "false",
    BESTEHEN_SCHEMA_MIN_REVISION: "baseline",
    BESTEHEN_SCHEMA_MAX_REVISION: "baseline",
    DATABASE_URL: "postgresql://synthetic:synthetic@127.0.0.1:5432/synthetic",
    BESTEHEN_AUTH_ADAPTER: "fake",
    BESTEHEN_OBJECT_STORAGE_ADAPTER: "fake",
    BESTEHEN_EMAIL_ADAPTER: "fake",
    BESTEHEN_AI_ADAPTER: "fake",
    BESTEHEN_STT_ADAPTER: "fake",
    BESTEHEN_TTS_ADAPTER: "fake",
  };
}

function configuredStagingEnvironment(): Record<string, string> {
  return {
    ...validEnvironment(),
    BESTEHEN_APP_ENV: "staging",
    BESTEHEN_AUTH_ADAPTER: "auth0",
    BESTEHEN_AUTH0_ISSUER_BASE_URL: "https://synthetic.eu.auth0.com",
    BESTEHEN_AUTH0_CLIENT_ID: "synthetic-client",
    BESTEHEN_AUTH0_CLIENT_SECRET: "synthetic-client-secret",
    BESTEHEN_AUTH0_SESSION_SECRET: "synthetic-session-secret",
    BESTEHEN_AUTH0_OWNER_ALLOWLIST_REFERENCE: "protected-ledger:owner-allowlist",
    BESTEHEN_APPLICATION_BASE_URL: "https://staging.example.invalid",
    BESTEHEN_AUTH0_CONNECTION: "email",
    BESTEHEN_AUTH0_CALLBACK_PATH: "/auth/callback",
    BESTEHEN_AUTH0_SESSION_POLICY_REVISION: "session-policy/v1",
    BESTEHEN_OBJECT_STORAGE_ADAPTER: "r2",
    BESTEHEN_S3_ENDPOINT: "https://synthetic.eu.r2.cloudflarestorage.com",
    BESTEHEN_S3_REGION: "auto",
    BESTEHEN_S3_BUCKET: "bestehen-staging-media",
    BESTEHEN_S3_ALLOWED_PREFIXES: "media/approved/,audio/raw/,exports/,tmp/",
    BESTEHEN_S3_ACCESS_KEY_ID: "synthetic-r2-access",
    BESTEHEN_S3_SECRET_ACCESS_KEY: "synthetic-r2-secret",
    BESTEHEN_EMAIL_ADAPTER: "ses",
    BESTEHEN_SES_REGION: "eu-central-1",
    BESTEHEN_SES_FROM_REFERENCE: "protected-ledger:ses-from",
    BESTEHEN_SES_CONFIGURATION_SET: "bestehen-staging",
    BESTEHEN_SES_ACCESS_KEY_ID: "synthetic-ses-access",
    BESTEHEN_SES_SECRET_ACCESS_KEY: "synthetic-ses-secret",
    BESTEHEN_AI_ADAPTER: "gemini",
    BESTEHEN_GEMINI_MODEL: "gemini-3.6-flash",
    BESTEHEN_GEMINI_API_KEY: "synthetic-gemini-key",
    BESTEHEN_STT_ADAPTER: "openai",
    BESTEHEN_OPENAI_STT_MODEL: "gpt-4o-mini-transcribe-2025-12-15",
    BESTEHEN_OPENAI_STT_API_KEY: "synthetic-openai-stt-key",
    BESTEHEN_TTS_ADAPTER: "openai",
    BESTEHEN_OPENAI_TTS_MODEL: "gpt-4o-mini-tts-2025-12-15",
    BESTEHEN_OPENAI_TTS_API_KEY: "synthetic-openai-tts-key",
  };
}

describe("server configuration", () => {
  it("loads the closed fake-only local profile", () => {
    const environment = parseServerEnvironment(validEnvironment());
    expect(featureFlags(environment)).toEqual({
      guestPresentation: false,
      accountOptionalPresentation: false,
      externalProviderCalls: false,
      paidProductiveProcessing: false,
      publicObjectAccess: false,
      experimentalProductBehavior: false,
    });
  });

  it("loads the exact configured staging matrix while external calls stay closed", () => {
    const environment = parseServerEnvironment(configuredStagingEnvironment());
    expect(environment.BESTEHEN_AUTH0_CONNECTION).toBe("email");
    expect(environment.BESTEHEN_S3_REGION).toBe("auto");
    expect(environment.BESTEHEN_GEMINI_MODEL).toBe("gemini-3.6-flash");
    expect(environment.BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS).toBe(false);
  });

  it.each([
    [{ ...validEnvironment(), BESTEHEN_RELEASE_DIRTY: "yes" }, "BESTEHEN_RELEASE_DIRTY"],
    [{ ...validEnvironment(), BESTEHEN_UNRECOGNIZED: "value" }, "BESTEHEN_UNRECOGNIZED"],
    [{ ...validEnvironment(), BESTEHEN_AI_ADAPTER: "gemini" }, "BESTEHEN_GEMINI_MODEL"],
    [
      { ...configuredStagingEnvironment(), BESTEHEN_AUTH0_CALLBACK_PATH: "/api/auth/callback" },
      "BESTEHEN_AUTH0_CALLBACK_PATH",
    ],
    [
      { ...configuredStagingEnvironment(), BESTEHEN_AUTH0_CONNECTION: "database" },
      "BESTEHEN_AUTH0_CONNECTION",
    ],
    [
      {
        ...configuredStagingEnvironment(),
        BESTEHEN_AUTH0_ISSUER_BASE_URL: "https://example.invalid",
      },
      "BESTEHEN_AUTH0_ISSUER_BASE_URL",
    ],
    [
      { ...configuredStagingEnvironment(), BESTEHEN_S3_REGION: "eu-central-1" },
      "BESTEHEN_S3_REGION",
    ],
    [
      { ...configuredStagingEnvironment(), BESTEHEN_GEMINI_MODEL: "gemini-latest" },
      "BESTEHEN_GEMINI_MODEL",
    ],
    [
      {
        ...configuredStagingEnvironment(),
        BESTEHEN_APP_ENV: "test",
        BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS: "true",
      },
      "BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS",
    ],
    [
      {
        ...configuredStagingEnvironment(),
        BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS: "true",
        BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING: "true",
      },
      "BESTEHEN_PAID_DAILY_ENVELOPE_MICRO_USD",
    ],
    [
      { ...validEnvironment(), BESTEHEN_FLAG_PUBLIC_OBJECT_ACCESS: "true" },
      "BESTEHEN_FLAG_PUBLIC_OBJECT_ACCESS",
    ],
  ])("fails closed for malformed or incomplete configuration", (environment, field) => {
    expect(() => parseServerEnvironment(environment)).toThrow(field);
  });

  it("loads paid staging only with verified positive envelopes and exact paid adapters", () => {
    const environment = parseServerEnvironment({
      ...configuredStagingEnvironment(),
      BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS: "true",
      BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING: "true",
      BESTEHEN_PAID_DAILY_ENVELOPE_MICRO_USD: "1000",
      BESTEHEN_PAID_ROLLING_30D_ENVELOPE_MICRO_USD: "10000",
      BESTEHEN_PAID_ENVELOPE_POLICY_REVISION: "paid-envelope/v1",
      BESTEHEN_PAID_ENVELOPE_VERIFIED_AT: "2026-08-23",
    });
    expect(environment.BESTEHEN_PAID_DAILY_ENVELOPE_MICRO_USD).toBe(1000);
  });

  it("refuses fake adapters in production", () => {
    expect(() =>
      parseServerEnvironment({ ...validEnvironment(), BESTEHEN_APP_ENV: "production" }),
    ).toThrow(/BESTEHEN_AUTH_ADAPTER/);
  });

  it("reports only field names when a configured secret is invalid", () => {
    const sentinel = ["do", "not", "emit"].join("-");
    expect(() =>
      parseServerEnvironment({
        ...configuredStagingEnvironment(),
        BESTEHEN_AUTH0_CLIENT_SECRET: sentinel,
      }),
    ).toThrow("BESTEHEN_AUTH0_CLIENT_SECRET");
    try {
      parseServerEnvironment({
        ...configuredStagingEnvironment(),
        BESTEHEN_AUTH0_CLIENT_SECRET: sentinel,
      });
    } catch (error) {
      expect(String(error)).not.toContain(sentinel);
    }
  });
});

describe("structured redaction", () => {
  it("redacts nested named secrets, personal identifiers, bodies, and credential values", () => {
    const sentinel = ["sentinel", "secret", "stage01"].join("-");
    const result = sanitizeLogPayload({
      authorization: sentinel,
      nested: { email: "owner@example.invalid", body: sentinel, safe: "readiness_checked" },
      database: "postgresql://user:password@database.invalid/app",
    });
    expect(JSON.stringify(result)).not.toContain(sentinel);
    expect(JSON.stringify(result)).not.toContain("owner@example.invalid");
    expect(JSON.stringify(result)).toContain("readiness_checked");
  });

  it("does not emit a sentinel through the logger", async () => {
    let output = "";
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    });
    const logger = createLogger(
      {
        service: "web",
        environment: "test",
        releaseCommit: "synthetic-commit",
        level: "info",
      },
      destination,
    );
    const sentinel = ["sentinel", "secret", "stage01"].join("-");
    logger.info({ sessionSecret: sentinel, eventName: "baseline_test" });
    await new Promise((resolve) => setImmediate(resolve));
    expect(output).not.toContain(sentinel);
    expect(output).toContain("baseline_test");
  });

  it("honors the validated configured log threshold without exposing values", async () => {
    const environment = parseServerEnvironment({
      ...validEnvironment(),
      BESTEHEN_LOG_LEVEL: "warn",
    });
    let output = "";
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    });
    const logger = createLogger(
      {
        service: "worker",
        environment: environment.BESTEHEN_APP_ENV,
        releaseCommit: environment.BESTEHEN_RELEASE_COMMIT,
        level: environment.BESTEHEN_LOG_LEVEL,
      },
      destination,
    );
    const sentinel = ["configured", "secret", "threshold"].join("-");
    logger.info({ eventName: "below_configured_threshold" });
    logger.warn({ eventName: "configured_threshold", sessionSecret: sentinel });
    await new Promise((resolve) => setImmediate(resolve));
    expect(output).not.toContain("below_configured_threshold");
    expect(output).toContain("configured_threshold");
    expect(output).not.toContain(sentinel);
  });
});
