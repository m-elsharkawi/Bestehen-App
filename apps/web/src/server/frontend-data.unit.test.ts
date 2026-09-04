import { describe, expect, it } from "vitest";
import { attemptReturnPathForAuthentication, safeHeldDestination } from "./frontend-data";

describe("P04-ROUTE-001 held destination", () => {
  it("maps only closed route kinds", () => {
    expect(safeHeldDestination("readiness")).toBe("/readiness");
    expect(safeHeldDestination("settings-data")).toBe("/settings/data");
  });

  it("rejects external, content-specific, and array return values", () => {
    expect(safeHeldDestination("https://example.invalid/steal")).toBe("/coach");
    expect(safeHeldDestination("attempt/sensitive-id")).toBe("/coach");
    expect(safeHeldDestination(["coach"])).toBe("/coach");
  });
});

describe("P04-COMPAT-001 Stage 03-safe presentation seam", () => {
  it("keeps the closed held-destination mapper independent of route identifiers", () => {
    expect(safeHeldDestination("coach")).toBe("/coach");
    expect(safeHeldDestination("/attempt/opaque-stage-03-id")).toBe("/coach");
  });
});

describe("P04-ROUTE-001 focused attempt compatibility", () => {
  it("keeps the legacy held destination for non-ID fixture tokens with or without a query", () => {
    expect(attemptReturnPathForAuthentication("synthetic", undefined)).toBe("/attempt/current");
    expect(attemptReturnPathForAuthentication("synthetic", "/attempt/current")).toBe(
      "/attempt/current",
    );
  });

  it("does not accept an arbitrary query destination and preserves a real attempt recovery URL", () => {
    expect(attemptReturnPathForAuthentication("synthetic", "https://example.invalid/steal")).toBe(
      "/attempt/current",
    );
    expect(
      attemptReturnPathForAuthentication(
        "11111111-1111-4111-8111-111111111111",
        "/attempt/current",
      ),
    ).toBe("/attempt/11111111-1111-4111-8111-111111111111");
  });
});
