import { servingManifestSchema } from "@bestehen/contracts";
import { type AuthorizedScope, appId } from "@bestehen/domain";
import type { ServingManifestRecord } from "@bestehen/infrastructure";
import { describe, expect, it, vi } from "vitest";
import {
  handleAcquireServingManifest,
  type ServingManifestCommandDependencies,
} from "./serving-manifest-commands";

const scope: AuthorizedScope = {
  principalId: appId<"principal">("11111111-1111-4111-8111-111111111111"),
  learnerScopeId: appId<"learner_scope">("22222222-2222-4222-8222-222222222222"),
  actorKind: "owner",
  capabilities: [],
  authenticatedAt: new Date("2026-09-02T08:00:00.000Z"),
};
const operationId = appId<"operation">("33333333-3333-4333-8333-333333333333");
const manifest: ServingManifestRecord = {
  servingManifestId: appId<"serving_manifest">("44444444-4444-4444-8444-444444444444"),
  learnerScopeId: scope.learnerScopeId,
  operationId,
  contentClass: "C2",
  approvalRole: "training",
  entries: [
    {
      ordinal: 1,
      contentRevisionId: appId<"content_revision">("55555555-5555-4555-8555-555555555555"),
      contentItemId: appId<"content_item">("66666666-6666-4666-8666-666666666666"),
    },
  ],
  keyRevisionDigests: ["a".repeat(64)],
  allowedConditions: {
    progressionProfile: "P2",
    timingMode: "practice",
    targetDurationMs: 1_200_000,
    transcriptPhase: "after_attempt",
    offerableAssistanceKinds: ["strategy_cue"],
  },
  learnerSafePayloadDigest: "b".repeat(64),
  freshnessDecision: "fresh",
  comparedFamilyRefs: [],
  authorizationVersion: "authorization/v1",
  contentReleaseIdentity: "content/seed-v1",
  issuedAt: new Date("2026-09-02T08:00:00.000Z"),
  expiresAt: new Date("2026-09-02T08:45:00.000Z"),
  revocationState: "active",
  digest: "c".repeat(64),
};

function dependencies(replay: ServingManifestRecord | undefined, authenticated = true) {
  return {
    authenticate: vi.fn(async () => (authenticated ? scope : undefined)),
    attempts: { readAttemptContext: vi.fn() },
    content: {
      readServingManifestByOperation: vi.fn(async () => replay),
      findEligibleServingRevision: vi.fn(),
      issueServingManifest: vi.fn(),
    },
    identity: <Kind extends string>(_kind: Kind) => appId<Kind>(manifest.servingManifestId),
    now: () => new Date("2026-09-02T08:10:00.000Z"),
  } satisfies ServingManifestCommandDependencies;
}

function request() {
  return {
    contract: { major: 1, minor: 0 },
    operationId,
    expectedVersion: 1,
    payload: {
      taskFamily: "R2DetailedSelect",
      progressionProfile: "P2",
      activityOccurrenceId: "77777777-7777-4777-8777-777777777777",
    },
  };
}

describe("serving-manifest command boundary", () => {
  it("refuses before parsing when authentication is absent", async () => {
    const fixture = dependencies(undefined, false);
    const response = await handleAcquireServingManifest(fixture, undefined, { malformed: true });

    expect(response.status).toBe(404);
    expect(fixture.content.readServingManifestByOperation).not.toHaveBeenCalled();
  });

  it("replays the exact operation without selecting again and returns only key digests", async () => {
    const fixture = dependencies(manifest);
    const response = await handleAcquireServingManifest(fixture, "token", request());
    const body = servingManifestSchema.parse(await response.json());

    expect(response.status).toBe(200);
    expect(body.servingManifestId).toBe(manifest.servingManifestId);
    expect(body.keyRevisionDigests).toEqual(manifest.keyRevisionDigests);
    expect(JSON.stringify(body)).not.toMatch(/answerKey|correctOption|distractorRationale/i);
    expect(fixture.content.findEligibleServingRevision).not.toHaveBeenCalled();
    expect(fixture.content.issueServingManifest).not.toHaveBeenCalled();
  });
});
