import type { ProviderConfigurationCheck } from "@bestehen/application";
import { describe, expect, it, vi } from "vitest";
import {
  createFakeAdapter,
  createFakeAdapterRegistry,
  type FakeCapability,
  type FakeProviderOutcome,
} from "./index.js";

const capabilities: readonly FakeCapability[] = [
  "identity",
  "object_storage",
  "email",
  "ai",
  "stt",
  "tts",
];
const outcomes: ReadonlyArray<readonly [FakeProviderOutcome, ProviderConfigurationCheck]> = [
  ["success", { status: "ready", reason: "configured", retryable: false }],
  ["disabled", { status: "not_ready", reason: "disabled", retryable: false }],
  ["timeout", { status: "not_ready", reason: "timeout", retryable: true }],
  ["quota", { status: "not_ready", reason: "quota_exceeded", retryable: true }],
  ["malformed_response", { status: "not_ready", reason: "malformed_response", retryable: false }],
  ["retryable_failure", { status: "not_ready", reason: "retryable_failure", retryable: true }],
  ["permanent_failure", { status: "not_ready", reason: "permanent_failure", retryable: false }],
];

function providerContract(capability: FakeCapability) {
  for (const [outcome, expected] of outcomes) {
    it(`${capability} returns the fixed ${outcome} configuration result`, async () => {
      const adapter = createFakeAdapter(capability, outcome);
      await expect(adapter.checkConfiguration()).resolves.toEqual(expected);
      expect(adapter).toMatchObject({ kind: "fake", capability });
    });
  }
}

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
      await expect(adapter.checkConfiguration()).resolves.toEqual({
        status: "ready",
        reason: "configured",
        retryable: false,
      });
      expect(adapter.kind).toBe("fake");
    }
  });

  describe.each(capabilities)("%s contract", providerContract);

  it("never uses network, clock, randomness, or provider payloads", async () => {
    const fetchCanary = vi.fn(() => {
      throw new Error("network forbidden");
    });
    vi.stubGlobal("fetch", fetchCanary);
    const dateCanary = vi.spyOn(Date, "now");
    const randomCanary = vi.spyOn(Math, "random");
    const sentinel = ["provider", "body", "canary"].join("-");

    for (const capability of capabilities) {
      for (const [outcome] of outcomes) {
        const result = await createFakeAdapter(capability, outcome).checkConfiguration();
        expect(JSON.stringify(result)).not.toContain(sentinel);
      }
    }

    expect(fetchCanary).not.toHaveBeenCalled();
    expect(dateCanary).not.toHaveBeenCalled();
    expect(randomCanary).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});
