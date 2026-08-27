import {
  evidenceValidityStates,
  projectionAvailabilityStates,
  readinessStates,
  semanticJobStates,
  sessionStates,
} from "@bestehen/domain";
import { z } from "zod";

export * from "./ui-projections.js";

export const contractVersionSchema = z
  .object({
    major: z.number().int().positive(),
    minor: z.number().int().nonnegative(),
  })
  .strict();

export const healthPayloadSchema = z
  .object({
    version: z.literal(1),
    status: z.enum(["live", "ready", "not_ready", "stopping"]),
    service: z.enum(["web", "worker"]),
    releaseCommit: z.string().min(1).max(64),
  })
  .strict();

export type HealthPayload = z.infer<typeof healthPayloadSchema>;

export interface ProviderPortMarker {
  readonly providerNeutral: true;
  readonly capability: "identity" | "object_storage" | "email" | "ai" | "stt" | "tts";
}

export const apiContractVersion = { major: 1, minor: 0 } as const;
export const opaqueAppIdSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9_-]{7,127}$/i)
  .describe("App-owned opaque identifier");
export const operationIdSchema = opaqueAppIdSchema;

export const domainResultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("completed"), resourceId: opaqueAppIdSchema.optional() }).strict(),
  z.object({ status: z.literal("accepted_pending"), jobId: opaqueAppIdSchema }).strict(),
  z.object({ status: z.literal("partial"), reasonCode: z.string().min(3) }).strict(),
  z.object({ status: z.literal("conflict"), reasonCode: z.string().min(3) }).strict(),
  z.object({ status: z.literal("unavailable"), reasonCode: z.string().min(3) }).strict(),
  z.object({ status: z.literal("deleted"), reasonCode: z.string().min(3) }).strict(),
]);

export const problemSchema = z
  .object({
    type: z.string().url(),
    title: z.string().min(1).max(120),
    status: z.number().int().min(400).max(599),
    code: z.enum([
      "malformed_request",
      "authentication_required",
      "authorization_denied",
      "precondition_failed",
      "idempotency_conflict",
      "rate_limited",
      "dependency_unavailable",
      "unsupported_contract_major",
      "internal_protocol_error",
    ]),
    requestId: opaqueAppIdSchema,
    detail: z.string().max(240).optional(),
    fieldPointers: z.array(z.string().startsWith("/")).max(20).optional(),
  })
  .strict();

export const commandEnvelopeSchema = z
  .object({
    contract: z.object({ major: z.literal(1), minor: z.number().int().min(0).max(99) }).strict(),
    operationId: operationIdSchema,
    expectedVersion: z.number().int().nonnegative(),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

export const jobEnvelopeSchema = z
  .object({
    contract: z
      .object({ kind: z.literal("foundation"), major: z.literal(1), minor: z.literal(0) })
      .strict(),
    jobId: opaqueAppIdSchema,
    kind: z.enum(["projection_rebuild_v1", "outbox_dispatch_v1", "rights_reconcile_v1"]),
    semanticIdentity: z.string().min(8).max(256),
    learnerScopeId: opaqueAppIdSchema,
    owner: z.enum(["evidence", "operations", "profile"]),
    attempt: z.number().int().min(0),
    deadline: z.iso.datetime(),
    payloadDigest: z.string().regex(/^[a-f0-9]{64}$/),
    selector: z.record(z.string(), z.string().max(256)).default({}),
  })
  .strict();

export const jobResourceSchema = z
  .object({
    jobId: opaqueAppIdSchema,
    state: z.enum(semanticJobStates),
    revision: z.number().int().positive(),
    reasonCode: z.string().min(3).optional(),
    retryAt: z.iso.datetime().optional(),
  })
  .strict();

export const sessionProjectionSchema = z
  .object({
    sessionId: opaqueAppIdSchema,
    state: z.enum(sessionStates),
    idleExpiresAt: z.iso.datetime(),
    absoluteExpiresAt: z.iso.datetime(),
    recentAuth: z.boolean(),
  })
  .strict();

const scopePartitionSchema = z
  .object({
    affected: z.array(z.string().min(1)).max(100),
    unaffected: z.array(z.string().min(1)).max(100),
  })
  .strict();

export const validityAssertionSchema = z
  .object({
    assertionId: opaqueAppIdSchema,
    observationId: opaqueAppIdSchema,
    priorAssertionId: opaqueAppIdSchema.optional(),
    state: z.enum(evidenceValidityStates),
    scope: scopePartitionSchema,
    reasonCode: z.string().regex(/^[A-Z]+\.[A-Z0-9_]+$/),
    effectiveAt: z.iso.datetime(),
    recordedAt: z.iso.datetime(),
    release: z.literal("evidence-contract/v1"),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      (value.state === "partially_valid" || value.state === "pending") &&
      (value.scope.affected.length === 0 || value.scope.unaffected.length === 0)
    ) {
      context.addIssue({ code: "custom", path: ["scope"], message: "partition is required" });
    }
    const affected = new Set(value.scope.affected);
    if (value.scope.unaffected.some((entry) => affected.has(entry))) {
      context.addIssue({ code: "custom", path: ["scope"], message: "partition overlaps" });
    }
  });

export const projectionSchema = z
  .object({
    generationId: opaqueAppIdSchema,
    kind: z.enum(["capability", "weakness", "progression", "readiness"]),
    availability: z.enum(projectionAvailabilityStates),
    sourceCut: z.number().int().nonnegative(),
    computedAt: z.iso.datetime(),
    checksum: z.string().regex(/^[a-f0-9]{64}$/),
    readiness: z.enum(readinessStates).optional(),
    written: z
      .union([
        z.object({ status: z.literal("absent") }).strict(),
        z.object({ status: z.literal("value"), band: z.string() }).strict(),
      ])
      .optional(),
    oral: z
      .union([
        z.object({ status: z.literal("absent") }).strict(),
        z.object({ status: z.literal("value"), band: z.string() }).strict(),
      ])
      .optional(),
  })
  .strict();

export const scopedCursorSchema = z
  .object({
    scopeDigest: z.string().regex(/^[a-f0-9]{64}$/),
    recordedAt: z.iso.datetime(),
    opaqueId: opaqueAppIdSchema,
    snapshotCut: z.number().int().nonnegative(),
    limit: z.number().int().min(1).max(100),
  })
  .strict();
