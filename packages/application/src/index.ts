import type { AppId } from "@bestehen/domain";

export interface Clock {
  now(): Date;
}

export interface IdSource {
  next<Kind extends string>(): AppId<Kind>;
}

export interface Lifecycle {
  start(): Promise<void>;
  stop(signal: "SIGINT" | "SIGTERM" | "startup_failure"): Promise<void>;
}

export type ProviderConfigurationCheck =
  | { readonly status: "ready"; readonly reason: "configured"; readonly retryable: false }
  | { readonly status: "not_ready"; readonly reason: "disabled"; readonly retryable: false }
  | { readonly status: "not_ready"; readonly reason: "timeout"; readonly retryable: true }
  | { readonly status: "not_ready"; readonly reason: "quota_exceeded"; readonly retryable: true }
  | {
      readonly status: "not_ready";
      readonly reason: "malformed_response";
      readonly retryable: false;
    }
  | {
      readonly status: "not_ready";
      readonly reason: "retryable_failure";
      readonly retryable: true;
    }
  | {
      readonly status: "not_ready";
      readonly reason: "permanent_failure";
      readonly retryable: false;
    };

export interface ProviderAdapter {
  readonly kind: "fake" | "configured";
  readonly capability: "identity" | "object_storage" | "email" | "ai" | "stt" | "tts";
  checkConfiguration(): Promise<ProviderConfigurationCheck>;
}
