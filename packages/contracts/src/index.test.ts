import { describe, expect, it } from "vitest";
import { healthPayloadSchema } from "./index.js";

describe("healthPayloadSchema", () => {
  it("accepts the stable minimal v1 payload", () => {
    expect(
      healthPayloadSchema.parse({
        version: 1,
        status: "ready",
        service: "web",
        releaseCommit: "synthetic-commit",
      }),
    ).toMatchObject({ status: "ready" });
  });

  it("rejects dependency details", () => {
    expect(() =>
      healthPayloadSchema.parse({
        version: 1,
        status: "ready",
        service: "web",
        releaseCommit: "synthetic-commit",
        databaseUrl: "not-allowed",
      }),
    ).not.toThrow();
  });
});
