import { type AuthorizedScope, appId } from "@bestehen/domain";
import type { FoundationRouteRecord } from "@bestehen/infrastructure";
import { describe, expect, it, vi } from "vitest";
import {
  foundationSkills,
  loadFoundationRoute,
  recordFoundationPreference,
} from "./foundation-runtime";

const scope: AuthorizedScope = {
  principalId: appId<"principal">("11111111-1111-4111-8111-111111111111"),
  learnerScopeId: appId<"learner_scope">("22222222-2222-4222-8222-222222222222"),
  actorKind: "owner",
  capabilities: [],
  authenticatedAt: new Date("2026-09-02T08:00:00.000Z"),
};
const sessionId = appId<"session">("33333333-3333-4333-8333-333333333333");

function storeFor(initial: FoundationRouteRecord) {
  let route = initial;
  return {
    readFoundationRoute: vi.fn(async () => route),
    recordFoundationProfileFact: vi.fn(async (_scope, input) => {
      route = {
        ...route,
        profileFacts: {
          ...route.profileFacts,
          [input.factKind]: { payload: input.payload, sequence: 10 },
        },
      };
      return {
        ok: true as const,
        value: { disposition: "created" as const, learnerSequence: 10 },
      };
    }),
  };
}

describe("P05-FOUNDATION-001 foundation route", () => {
  it("fixes the five-skill order and honest unavailable reasons", () => {
    expect(foundationSkills).toEqual([
      "reading",
      "language_elements",
      "listening",
      "writing",
      "speaking",
    ]);
  });

  it("stores the 65-year horizon separately and resumes at the first incomplete skill", async () => {
    const store = storeFor({
      sessionId,
      state: "active",
      sourceCut: 7,
      activityOccurrenceId: appId<"activity_occurrence">("44444444-4444-4444-8444-444444444444"),
      completedModalities: ["reading"],
      profileFacts: {},
    });

    const result = await loadFoundationRoute(
      store,
      scope,
      sessionId,
      new Date("2026-09-02T08:10:00.000Z"),
    );

    expect(result).toMatchObject({
      ok: true,
      value: {
        planningHorizonYears: 65,
        officialTargetYears: 60,
        completedSkills: ["reading"],
        nextSkill: "language_elements",
        nextTaskFamily: "SB1ContextualGrammarCloze",
        unavailableSkills: [
          { skill: "writing", reasonCode: "FALLBACK.CONTENT_UNAVAILABLE" },
          { skill: "speaking", reasonCode: "FALLBACK.CONTENT_UNAVAILABLE" },
        ],
      },
    });
    expect(store.recordFoundationProfileFact).toHaveBeenCalledWith(
      scope,
      expect.objectContaining({
        factKind: "planning_horizon_v1",
        payload: { horizonYears: 65 },
      }),
    );
    expect(store.recordFoundationProfileFact).toHaveBeenCalledWith(
      scope,
      expect.objectContaining({
        factKind: "foundation_route_progress_v1",
        payload: { completedSkills: ["reading"], sourceCut: 7 },
      }),
    );
  });

  it("does not append an unchanged declared preference", async () => {
    const access = {
      reducedMotion: true,
      forcedColors: false,
      audioAvailable: true,
      captionsPreferred: true,
    };
    const store = storeFor({
      sessionId,
      state: "active",
      sourceCut: 7,
      completedModalities: [],
      profileFacts: { access_preferences_v1: { payload: access, sequence: 9 } },
    });

    await expect(
      recordFoundationPreference(
        store,
        scope,
        sessionId,
        "access_preferences_v1",
        access,
        new Date("2026-09-02T08:10:00.000Z"),
      ),
    ).resolves.toEqual({ ok: true, value: undefined });
    expect(store.recordFoundationProfileFact).not.toHaveBeenCalled();
  });
});
