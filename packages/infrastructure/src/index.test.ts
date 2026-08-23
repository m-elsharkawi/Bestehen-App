import { describe, expect, it } from "vitest";
import { createFakeAdapterRegistry } from "./index.js";

describe("fake provider registry", () => {
  it("provides every reserved capability without an external call", async () => {
    const registry = createFakeAdapterRegistry();
    expect([...registry.keys()]).toEqual([
      "identity",
      "object_storage",
      "email",
      "ai",
      "stt",
      "tts",
    ]);
    for (const adapter of registry.values()) {
      await expect(adapter.checkConfiguration()).resolves.toEqual({ available: true });
      expect(adapter.kind).toBe("fake");
    }
  });
});
