import { type AuthorizedScope, appId } from "@bestehen/domain";
import { describe, expect, it, vi } from "vitest";
import {
  type AttemptCommandDependencies,
  handleCheckpointAttempt,
  handleSubmitAttempt,
} from "./attempt-commands";
import type { SubmitObjectiveInput } from "./attempt-runtime";

const attemptId = "11111111-1111-4111-8111-111111111111";
const operationId = "22222222-2222-4222-8222-222222222222";
const scope: AuthorizedScope = {
  principalId: appId<"principal">("33333333-3333-4333-8333-333333333333"),
  learnerScopeId: appId<"learner_scope">("44444444-4444-4444-8444-444444444444"),
  actorKind: "owner",
  capabilities: [],
  authenticatedAt: new Date("2026-09-02T08:00:00.000Z"),
};

function dependencies(authenticated = true) {
  return {
    authenticate: vi.fn(async () => (authenticated ? scope : undefined)),
    now: () => new Date("2026-09-02T08:10:00.000Z"),
    commands: {
      create: vi.fn(),
      checkpoint: vi.fn(async () => ({
        ok: true as const,
        value: { disposition: "accepted" },
      })),
      submit: vi.fn(async (_scope: AuthorizedScope, _input: SubmitObjectiveInput) => ({
        ok: true as const,
        value: { submissionId: operationId },
      })),
      assistance: vi.fn(),
      exposure: vi.fn(),
    },
  } satisfies AttemptCommandDependencies;
}

describe("versioned attempt command boundary", () => {
  it("returns one opaque refusal before parsing for an unauthenticated caller", async () => {
    const fixture = dependencies(false);
    const response = await handleCheckpointAttempt(fixture, undefined, attemptId, {
      malformed: true,
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      status: "unavailable",
      reasonCode: "FALLBACK.AUTHORIZATION_DENIED",
    });
    expect(fixture.commands.checkpoint).not.toHaveBeenCalled();
  });

  it("reports an unsupported contract major explicitly for an authorized caller", async () => {
    const response = await handleCheckpointAttempt(dependencies(), "token", attemptId, {
      contract: { major: 2, minor: 0 },
      operationId,
      expectedVersion: 1,
      payload: {},
    });

    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    expect((await response.json()).code).toBe("unsupported_contract_major");
  });

  it("treats wire timer integrity as non-authoritative and forwards measurements only", async () => {
    const fixture = dependencies();
    const response = await handleSubmitAttempt(fixture, "token", attemptId, {
      contract: { major: 1, minor: 0 },
      operationId,
      expectedVersion: 3,
      payload: {
        attemptId,
        checkpointSequence: 1,
        responseDigest: "a".repeat(64),
        conditions: {
          progressionProfile: "P2",
          timingMode: "practice",
          timerIntegrity: "in_context_trusted",
          elapsedMs: 600_000,
          exposureClass: "unseen",
          independenceClass: "first_attempt",
          assistanceUsed: [],
          accessibilityEquivalence: "equivalent",
        },
      },
    });

    expect(response.status).toBe(200);
    const submitted = fixture.commands.submit.mock.calls[0]?.[1];
    expect(submitted?.clockObservation.monotonicElapsedMs).toBe(600_000);
    expect(submitted).not.toHaveProperty("timerIntegrity");
    expect(submitted?.clockObservation).not.toHaveProperty("timerIntegrity");
  });
});
