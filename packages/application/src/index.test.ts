import { describe, expect, it } from "vitest";
import type { Clock } from "./index.js";

describe("application ports", () => {
  it("keep the clock replaceable", () => {
    const clock: Clock = { now: () => new Date("2026-08-23T00:00:00.000Z") };
    expect(clock.now().toISOString()).toBe("2026-08-23T00:00:00.000Z");
  });
});
