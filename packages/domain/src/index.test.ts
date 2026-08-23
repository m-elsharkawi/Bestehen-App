import { describe, expect, it } from "vitest";
import { appId } from "./index.js";

describe("appId", () => {
  it("accepts an opaque application identifier", () => {
    expect(appId<"correlation">("corr_01_stage01")).toBe("corr_01_stage01");
  });

  it("rejects short or unsafe identifiers", () => {
    expect(() => appId<"correlation">("vendor/1")).toThrow(/opaque/);
  });
});
