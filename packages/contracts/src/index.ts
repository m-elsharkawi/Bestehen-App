import { z } from "zod";

export const contractVersionSchema = z.object({
  major: z.number().int().positive(),
  minor: z.number().int().nonnegative(),
});

export const healthPayloadSchema = z.object({
  version: z.literal(1),
  status: z.enum(["live", "ready", "not_ready", "stopping"]),
  service: z.enum(["web", "worker"]),
  releaseCommit: z.string().min(1).max(64),
});

export type HealthPayload = z.infer<typeof healthPayloadSchema>;

export interface ProviderPortMarker {
  readonly providerNeutral: true;
  readonly capability: "identity" | "object_storage" | "email" | "ai" | "stt" | "tts";
}
