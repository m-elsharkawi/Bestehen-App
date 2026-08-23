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

  it.each([
    [{ ...validEnvironment(), BESTEHEN_RELEASE_DIRTY: "yes" }, "BESTEHEN_RELEASE_DIRTY"],
    [{ ...validEnvironment(), BESTEHEN_UNRECOGNIZED: "value" }, "BESTEHEN_UNRECOGNIZED"],
    [{ ...validEnvironment(), BESTEHEN_AI_ADAPTER: "configured" }, "BESTEHEN_AI_API_KEY"],
  ])("fails closed for malformed or incomplete configuration", (environment, field) => {
    expect(() => parseServerEnvironment(environment)).toThrow(field);
  });

  it("refuses fake adapters in production", () => {
    expect(() =>
      parseServerEnvironment({ ...validEnvironment(), BESTEHEN_APP_ENV: "production" }),
    ).toThrow(/BESTEHEN_AUTH_ADAPTER/);
  });
});

describe("structured redaction", () => {
  it("redacts nested named secrets, personal identifiers, bodies, and credential values", () => {
    const sentinel = "sentinel-secret-stage01";
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
      { service: "web", environment: "test", releaseCommit: "synthetic-commit" },
      destination,
    );
    logger.info({ sessionSecret: "sentinel-secret-stage01", eventName: "baseline_test" });
    await new Promise((resolve) => setImmediate(resolve));
    expect(output).not.toContain("sentinel-secret-stage01");
    expect(output).toContain("baseline_test");
  });
});
