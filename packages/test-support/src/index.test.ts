import net from "node:net";
import { describe, expect, it } from "vitest";
import { FakeClock, installExternalEgressGuard, syntheticId } from "./index.js";

describe("test support", () => {
  it("provides deterministic time and opaque synthetic identifiers", () => {
    const clock = new FakeClock(new Date("2026-08-23T00:00:00.000Z"));
    clock.advance(1000);
    expect(clock.now().toISOString()).toBe("2026-08-23T00:00:01.000Z");
    expect(syntheticId<"test">("test")).toMatch(/^test_[a-f0-9]{32}$/);
  });

  it("blocks external sockets and is explicitly reversible", () => {
    const restore = installExternalEgressGuard();
    try {
      expect(() => net.connect({ host: "provider.example", port: 443 })).toThrow(
        /External network access denied/,
      );
    } finally {
      restore();
    }
  });
});
