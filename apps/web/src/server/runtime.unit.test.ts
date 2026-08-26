import { describe, expect, it } from "vitest";
import { canonicalApplicationRequestUrl, livenessPayload } from "./runtime.js";

describe("web health", () => {
  it("keeps liveness dependency free and minimal", () => {
    expect(livenessPayload("synthetic-commit")).toEqual({
      version: 1,
      status: "live",
      service: "web",
      releaseCommit: "synthetic-commit",
    });
  });

  it("uses the configured public origin for a proxied callback", () => {
    expect(
      canonicalApplicationRequestUrl(
        "http://0.0.0.0:3000/auth/callback?code=synthetic&state=opaque",
        "https://staging.example.invalid",
      ).href,
    ).toBe("https://staging.example.invalid/auth/callback?code=synthetic&state=opaque");
  });

  it("keeps the incoming origin without a configured public base URL", () => {
    expect(
      canonicalApplicationRequestUrl("http://127.0.0.1:3000/auth/callback?state=opaque", undefined)
        .href,
    ).toBe("http://127.0.0.1:3000/auth/callback?state=opaque");
  });
});
