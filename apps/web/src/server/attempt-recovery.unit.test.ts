import { describe, expect, it, vi } from "vitest";
import { appId, type AuthorizedScope } from "@bestehen/domain";
import { handleAttemptRecovery } from "./attempt-recovery";

const id = "11111111-1111-4111-8111-111111111111";
const scope: AuthorizedScope = {
  principalId: appId("22222222-2222-4222-8222-222222222222"),
  learnerScopeId: appId("33333333-3333-4333-8333-333333333333"),
  actorKind: "owner",
  capabilities: [],
  authenticatedAt: new Date(),
};
const recovered = {
  attemptId: appId<"attempt">(id),
  resourceVersion: 3,
  state: "checkpointed" as const,
  acknowledgedCheckpointSequence: 1,
  checkpoints: [
    {
      operationId: id,
      sequence: 1,
      stream: "primary",
      responseDigest: "a".repeat(64),
      operations: [{ kind: "set_selection", itemId: id, optionId: "answer-a" }],
    },
  ],
  submission: null,
};
describe("P05-SECURITY-001 learner recovery query", () => {
  it("guards every outgoing recovery envelope against key-bearing fields", async () => {
    const dependencies = {
      authenticate: async () => scope,
      now: () => new Date(),
      attempts: { readObjectiveRecovery: vi.fn(async () => recovered) },
    };
    const response = await handleAttemptRecovery(dependencies, "session", id);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ contract: { major: 1, minor: 0 }, ...recovered });
    dependencies.attempts.readObjectiveRecovery.mockResolvedValue({
      ...recovered,
      checkpoints: [
        { ...recovered.checkpoints[0], operations: { acceptedResponseSet: ["secret"] } },
      ],
    } as unknown as typeof recovered);
    await expect(handleAttemptRecovery(dependencies, "session", id)).rejects.toThrow();
  });
  it("returns indistinguishable absent/cross-scope/expired responses and explicit major incompatibility", async () => {
    const dependencies = {
      authenticate: async () => scope,
      now: () => new Date(),
      attempts: { readObjectiveRecovery: async () => undefined },
    };
    const absent = await handleAttemptRecovery(dependencies, "session", id);
    const expired = await handleAttemptRecovery(
      { ...dependencies, authenticate: async () => undefined },
      undefined,
      id,
    );
    expect(absent.status).toBe(404);
    expect(await absent.json()).toEqual(await expired.json());
    const incompatible = await handleAttemptRecovery(dependencies, "session", id, "2");
    expect(incompatible.status).toBe(400);
    expect((await incompatible.json()).code).toBe("unsupported_contract_major");
  });
});
