import { describe, expect, it } from "vitest";
import {
  commandEnvelopeSchema,
  healthPayloadSchema,
  jobEnvelopeSchema,
  problemSchema,
  projectionSchema,
  scopedCursorSchema,
  validityAssertionSchema,
} from "./index.js";

describe("healthPayloadSchema", () => {
  it("accepts the stable minimal v1 payload", () => {
    expect(
      healthPayloadSchema.parse({
        version: 1,
        status: "ready",
        service: "web",
        releaseCommit: "synthetic-commit",
      }),
    ).toMatchObject({ status: "ready" });
  });

  it("rejects dependency details", () => {
    expect(() =>
      healthPayloadSchema.parse({
        version: 1,
        status: "ready",
        service: "web",
        releaseCommit: "synthetic-commit",
        databaseUrl: "not-allowed",
      }),
    ).toThrow();
  });
});

describe("Stage 03 v1 contracts", () => {
  const id = "opaque_id_12345678";

  it("validates strict commands, jobs, and RFC 9457 problem envelopes", () => {
    expect(
      commandEnvelopeSchema.safeParse({
        contract: { major: 1, minor: 0 },
        operationId: id,
        expectedVersion: 0,
        payload: {},
      }).success,
    ).toBe(true);
    expect(
      jobEnvelopeSchema.safeParse({
        contract: { kind: "foundation", major: 1, minor: 0 },
        jobId: id,
        kind: "projection_rebuild_v1",
        semanticIdentity: "projection:scope:1",
        learnerScopeId: id,
        owner: "evidence",
        attempt: 0,
        deadline: "2026-08-25T12:00:00.000Z",
        payloadDigest: "a".repeat(64),
        selector: {},
      }).success,
    ).toBe(true);
    expect(
      problemSchema.safeParse({
        type: "https://bestehen.invalid/problems/authorization-denied",
        title: "Not available",
        status: 404,
        code: "authorization_denied",
        requestId: id,
      }).success,
    ).toBe(true);
  });

  it("fails closed for unsupported majors and overlapping validity partitions", () => {
    expect(
      commandEnvelopeSchema.safeParse({
        contract: { major: 2, minor: 0 },
        operationId: id,
        expectedVersion: 0,
        payload: {},
      }).success,
    ).toBe(false);
    expect(
      validityAssertionSchema.safeParse({
        assertionId: id,
        observationId: id,
        state: "partially_valid",
        scope: { affected: ["oral"], unaffected: ["oral"] },
        reasonCode: "VALIDITY.TECHNICAL_PREFLIGHT",
        effectiveAt: "2026-08-25T12:00:00.000Z",
        recordedAt: "2026-08-25T12:00:00.000Z",
        release: "evidence-contract/v1",
      }).success,
    ).toBe(false);
  });

  it("rejects undocumented carriers at outer and nested contract boundaries", () => {
    expect(
      commandEnvelopeSchema.safeParse({
        contract: { major: 1, minor: 0, compatibility: "latest" },
        operationId: id,
        expectedVersion: 0,
        payload: {},
      }).success,
    ).toBe(false);
    expect(
      projectionSchema.safeParse({
        generationId: id,
        kind: "readiness",
        availability: "current",
        sourceCut: 4,
        computedAt: "2026-08-25T12:00:00.000Z",
        checksum: "b".repeat(64),
        written: { status: "absent", hiddenScore: 0.91 },
      }).success,
    ).toBe(false);
  });

  it("keeps Written and Oral independent, absence explicit, and probability structurally absent", () => {
    const projection = projectionSchema.parse({
      generationId: id,
      kind: "readiness",
      availability: "current",
      sourceCut: 4,
      computedAt: "2026-08-25T12:00:00.000Z",
      checksum: "b".repeat(64),
      readiness: "evidence_building",
      written: { status: "absent" },
      oral: { status: "value", band: "building" },
    });
    expect(projection.written).toEqual({ status: "absent" });
    expect("probability" in projection).toBe(false);
  });

  it("bounds scoped historical cursors", () => {
    expect(
      scopedCursorSchema.safeParse({
        scopeDigest: "c".repeat(64),
        recordedAt: "2026-08-25T12:00:00.000Z",
        opaqueId: id,
        snapshotCut: 5,
        limit: 101,
      }).success,
    ).toBe(false);
  });
});
