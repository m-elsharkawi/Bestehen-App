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

export interface ProviderAdapter {
  readonly kind: "fake" | "configured";
  readonly capability: "identity" | "object_storage" | "email" | "ai" | "stt" | "tts";
  checkConfiguration(): Promise<{ readonly available: boolean }>;
}
