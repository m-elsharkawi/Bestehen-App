import { describe, expect, it } from "vitest";
import { FakeClock, syntheticId } from "./index.js";

describe("test support", () => {
  it("provides deterministic time and opaque synthetic identifiers", () => {
    const clock = new FakeClock(new Date("2026-08-23T00:00:00.000Z"));
    clock.advance(1000);
    expect(clock.now().toISOString()).toBe("2026-08-23T00:00:01.000Z");
    expect(syntheticId<"test">("test")).toMatch(/^test_[a-f0-9]{32}$/);
  });
});
