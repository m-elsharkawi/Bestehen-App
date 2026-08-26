import { describe, expect, it } from "vitest";
import { safeHeldDestination } from "./frontend-data";

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
