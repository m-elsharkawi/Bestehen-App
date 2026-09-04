// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { readClockObservation, startClockObservation } from "./clock-observation";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("P05-RECOVERY-001 clock observations", () => {
  it("reports monotonic time, visibility, stalls and wall skew without assigning validity", () => {
    vi.useFakeTimers();
    const base = Date.parse("2026-09-04T10:00:00Z");
    vi.setSystemTime(base);
    let monotonic = 0;
    vi.spyOn(performance, "now").mockImplementation(() => monotonic);
    Object.defineProperty(performance, "getEntriesByType", {
      configurable: true,
      value: vi.fn(() => [{ type: "navigate" }]),
    });
    const changed = vi.fn();
    const stop = startClockObservation("attempt", new Date(base).toISOString(), changed);
    monotonic = 1_000;
    vi.advanceTimersByTime(1_000);
    expect(readClockObservation("attempt")).toMatchObject({
      monotonicElapsedMs: 1000,
      wallClockSkewMs: 0,
      recoveredFromAnotherContext: false,
    });
    monotonic = 8_000;
    vi.setSystemTime(base + 11_000);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(readClockObservation("attempt")).toMatchObject({
      monotonicElapsedMs: 8000,
      visibilityChanges: 1,
      wallClockSkewMs: 3000,
      stallIntervals: [{ startedAtMs: 1000, endedAtMs: 8000 }],
    });
    expect(changed).toHaveBeenLastCalledWith(11000, true);
    expect(readClockObservation("attempt")).not.toHaveProperty("timerIntegrity");
    stop();
    expect(readClockObservation("attempt")).toBeUndefined();
  });
  it("marks a reload as another context even when it happens immediately", () => {
    vi.useFakeTimers();
    Object.defineProperty(performance, "getEntriesByType", {
      configurable: true,
      value: vi.fn(() => [{ type: "reload" }]),
    });
    const stop = startClockObservation("reload", new Date().toISOString(), () => undefined);
    expect(readClockObservation("reload")?.recoveredFromAnotherContext).toBe(true);
    stop();
  });
});
