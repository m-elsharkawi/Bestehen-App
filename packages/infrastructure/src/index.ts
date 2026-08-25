import type { ProviderAdapter, ProviderConfigurationCheck } from "@bestehen/application";

export type FakeCapability = ProviderAdapter["capability"];
export type FakeProviderOutcome =
  | "success"
  | "disabled"
  | "timeout"
  | "quota"
  | "malformed_response"
  | "retryable_failure"
  | "permanent_failure";

const checks: Readonly<Record<FakeProviderOutcome, ProviderConfigurationCheck>> = {
  success: { status: "ready", reason: "configured", retryable: false },
  disabled: { status: "not_ready", reason: "disabled", retryable: false },
  timeout: { status: "not_ready", reason: "timeout", retryable: true },
  quota: { status: "not_ready", reason: "quota_exceeded", retryable: true },
  malformed_response: {
    status: "not_ready",
    reason: "malformed_response",
    retryable: false,
  },
  retryable_failure: {
    status: "not_ready",
    reason: "retryable_failure",
    retryable: true,
  },
  permanent_failure: {
    status: "not_ready",
    reason: "permanent_failure",
    retryable: false,
  },
};

export function createFakeAdapter(
  capability: FakeCapability,
  outcome: FakeProviderOutcome = "success",
): ProviderAdapter {
  return {
    kind: "fake",
    capability,
    async checkConfiguration() {
      return checks[outcome];
    },
  };
}

export function createFakeAdapterRegistry(
  outcome: FakeProviderOutcome = "success",
): ReadonlyMap<FakeCapability, ProviderAdapter> {
  const capabilities: readonly FakeCapability[] = [
    "identity",
    "object_storage",
    "email",
    "ai",
    "stt",
    "tts",
  ];
  return new Map(
    capabilities.map((capability) => [capability, createFakeAdapter(capability, outcome)]),
  );
}

export * from "./crypto.js";
export * from "./jobs/index.js";
export * from "./postgres/foundation-repository.js";
export * from "./postgres/index.js";
export * from "./supervisor.js";
