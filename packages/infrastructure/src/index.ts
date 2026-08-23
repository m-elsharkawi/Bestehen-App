import type { ProviderAdapter } from "@bestehen/application";

export type FakeCapability = ProviderAdapter["capability"];

export function createFakeAdapter(capability: FakeCapability): ProviderAdapter {
  return {
    kind: "fake",
    capability,
    async checkConfiguration() {
      return { available: true };
    },
  };
}

export function createFakeAdapterRegistry(): ReadonlyMap<FakeCapability, ProviderAdapter> {
  const capabilities: readonly FakeCapability[] = [
    "identity",
    "object_storage",
    "email",
    "ai",
    "stt",
    "tts",
  ];
  return new Map(capabilities.map((capability) => [capability, createFakeAdapter(capability)]));
}

export * from "./postgres/index.js";
export * from "./supervisor.js";
