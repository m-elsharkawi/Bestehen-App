/**
 * The two Stage 05 content command boundaries, from the outside.
 *
 * These are the negative cases. Server-side authorization is the only authorization there is — a
 * hidden button is not one — so the tests that matter here are the ones where the caller is not
 * authenticated, holds a scope that may not issue the command, sends something malformed, or names
 * content that belongs to somewhere else. Each of those must fail closed, and the refusals must be
 * indistinguishable from one another so that probing the endpoint reveals nothing.
 */

import { findKeyBearingFields } from "@bestehen/content";
import { appId, type AuthorizedScope, reasonRegistryRelease } from "@bestehen/domain";
import type { ContentRepositoryError, ImpactAssertionInput } from "@bestehen/infrastructure";
import { describe, expect, it } from "vitest";
import {
  type ContentCommandDependencies,
  handleContentImpactCommand,
  handleDefectReportCommand,
} from "./content-commands";

const learnerScopeId = appId<"learner_scope">("11111111-1111-4111-8111-111111111111");
const otherScopeId = appId<"learner_scope">("22222222-2222-4222-8222-222222222222");
const revisionId = "33333333-3333-4333-8333-333333333333";
const reportId = "44444444-4444-4444-8444-444444444444";
const impactId = "55555555-5555-4555-8555-555555555555";
const operationId = "66666666-6666-4666-8666-666666666666";

const now = new Date("2026-09-01T10:00:00.000Z");

const ownerScope: AuthorizedScope = {
  principalId: appId<"principal">("77777777-7777-4777-8777-777777777777"),
  learnerScopeId,
  actorKind: "owner",
  capabilities: [],
  authenticatedAt: new Date("2026-09-01T09:55:00.000Z"),
};

interface Recorder {
  readonly reports: unknown[];
  readonly impacts: ImpactAssertionInput[];
}

type RepositoryOutcome =
  | { readonly ok: true; readonly disposition: "created" | "replayed"; readonly id?: string }
  | { readonly ok: false; readonly error: ContentRepositoryError };

function dependencies(
  scope: AuthorizedScope | undefined,
  outcome: RepositoryOutcome = { ok: true, disposition: "created" },
): { readonly deps: ContentCommandDependencies; readonly recorder: Recorder } {
  const recorder: Recorder = { reports: [], impacts: [] };
  return {
    recorder,
    deps: {
      authenticate: async (token) => (token === "session-token" ? scope : undefined),
      now: () => now,
      repository: {
        async appendDefectReport(commandScope, input) {
          recorder.reports.push({ scope: commandScope, input });
          return outcome.ok
            ? {
                ok: true,
                value: {
                  disposition: outcome.disposition,
                  defectReportId: outcome.id ?? reportId,
                },
              }
            : { ok: false, error: outcome.error };
        },
        async appendImpactAssertion(input) {
          recorder.impacts.push(input);
          return outcome.ok
            ? { ok: true, value: { disposition: outcome.disposition } }
            : { ok: false, error: outcome.error };
        },
      },
    },
  };
}

function reportCommand(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contract: { major: 1, minor: 0 },
    operationId,
    expectedVersion: 0,
    payload: {
      defectReportId: reportId,
      contentRevisionId: revisionId,
      category: "ambiguous_key",
      note: "Two options both fit the text.",
      reportedAt: "2026-09-01T09:59:00.000Z",
      ...((overrides.payload as Record<string, unknown> | undefined) ?? {}),
    },
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== "payload")),
  };
}

function impactCommand(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contract: { major: 1, minor: 0 },
    operationId,
    expectedVersion: 0,
    payload: {
      impactAssertionId: impactId,
      causeKind: "content_defect",
      impactMode: "validity_change",
      selectors: {
        contentFamilyIds: [],
        contentRevisionIds: [revisionId],
        itemIds: [],
        formIds: [],
        mediaRevisionIds: [],
      },
      affectedScope: ["written"],
      unaffectedScope: ["oral"],
      declaredCardinality: 1,
      requestedValidity: "not_counted",
      reasonCode: "VALIDITY.CONTENT_APPROVAL",
      effectiveAt: "2026-09-01T09:59:00.000Z",
      ...((overrides.payload as Record<string, unknown> | undefined) ?? {}),
    },
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== "payload")),
  };
}

async function bodyOf(response: Response): Promise<unknown> {
  return response.json();
}

/* ------------------------------------------------------------------------------------------------
 * Fail closed
 * ---------------------------------------------------------------------------------------------- */

describe("the content command routes are owner-only and fail closed", () => {
  const handlers = [
    { name: "reports", run: handleDefectReportCommand, command: reportCommand },
    { name: "impacts", run: handleContentImpactCommand, command: impactCommand },
  ] as const;

  it("refuses an unauthenticated caller without touching the repository", async () => {
    for (const handler of handlers) {
      const { deps, recorder } = dependencies(ownerScope);
      for (const token of [undefined, "", "forged-token"]) {
        const response = await handler.run(deps, token, handler.command());
        expect(response.status, `${handler.name}/${token}`).toBe(404);
      }
      expect(recorder.reports, handler.name).toEqual([]);
      expect(recorder.impacts, handler.name).toEqual([]);
    }
  });

  it("refuses an actor whose scope does not hold the action", async () => {
    for (const handler of handlers) {
      const worker: AuthorizedScope = { ...ownerScope, actorKind: "worker", capabilities: [] };
      const { deps, recorder } = dependencies(worker);
      const response = await handler.run(deps, "session-token", handler.command());
      expect(response.status, handler.name).toBe(404);
      expect([...recorder.reports, ...recorder.impacts], handler.name).toEqual([]);
    }
  });

  it("gives an unauthenticated caller and a cross-scope caller the identical answer", async () => {
    // The repository answers `not_available` for a reference in another learner scope exactly as it
    // does for one that does not exist. The boundary must not undo that by returning a different
    // status, a different body or a different header.
    const anonymous = dependencies(ownerScope);
    const crossScope = dependencies(ownerScope, { ok: false, error: "not_available" });
    const refused = await handleDefectReportCommand(anonymous.deps, undefined, reportCommand());
    const foreign = await handleDefectReportCommand(
      crossScope.deps,
      "session-token",
      reportCommand(),
    );
    expect(foreign.status).toBe(refused.status);
    expect(await bodyOf(foreign)).toEqual(await bodyOf(refused));
    expect(foreign.headers.get("cache-control")).toBe(refused.headers.get("cache-control"));
  });

  it("requires a recent authentication for an impact but not for a report", async () => {
    const stale: AuthorizedScope = {
      ...ownerScope,
      authenticatedAt: new Date("2026-08-01T09:00:00.000Z"),
    };
    const impact = dependencies(stale);
    expect(
      (await handleContentImpactCommand(impact.deps, "session-token", impactCommand())).status,
    ).toBe(404);
    expect(impact.recorder.impacts).toEqual([]);

    const report = dependencies(stale);
    expect(
      (await handleDefectReportCommand(report.deps, "session-token", reportCommand())).status,
    ).toBe(200);
  });

  it("never trusts a learner scope named by the caller", async () => {
    // The command schemas are strict, so a body that tries to name a scope does not parse at all.
    const { deps, recorder } = dependencies(ownerScope);
    const response = await handleDefectReportCommand(
      deps,
      "session-token",
      reportCommand({ payload: { learnerScopeId: otherScopeId } }),
    );
    expect(response.status).toBe(400);
    expect(recorder.reports).toEqual([]);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Malformed input
 * ---------------------------------------------------------------------------------------------- */

describe("a malformed content command is refused", () => {
  it("refuses a body that is not a command envelope", async () => {
    for (const body of [undefined, null, "text", 42, [], {}, { contract: { major: 1 } }]) {
      const { deps, recorder } = dependencies(ownerScope);
      const response = await handleDefectReportCommand(deps, "session-token", body);
      expect(response.status, JSON.stringify(body)).toBe(400);
      expect(recorder.reports, JSON.stringify(body)).toEqual([]);
    }
  });

  it("names an unsupported contract major as such", async () => {
    const { deps } = dependencies(ownerScope);
    const response = await handleDefectReportCommand(
      deps,
      "session-token",
      reportCommand({ contract: { major: 2, minor: 0 } }),
    );
    expect(response.status).toBe(400);
    expect(await bodyOf(response)).toMatchObject({ reasonCode: "unsupported_contract_major" });
  });

  it("refuses a payload with an unknown category, an over-long note or an extra field", async () => {
    const payloads: readonly Record<string, unknown>[] = [
      { category: "not_a_category" },
      { note: "x".repeat(401) },
      { reportedAt: "yesterday" },
      { acceptedResponseSet: [{ optionId: "a" }] },
      { contentRevisionId: "!" },
    ];
    for (const payload of payloads) {
      const { deps, recorder } = dependencies(ownerScope);
      const response = await handleDefectReportCommand(
        deps,
        "session-token",
        reportCommand({ payload }),
      );
      expect(response.status, JSON.stringify(payload)).toBe(400);
      expect(recorder.reports, JSON.stringify(payload)).toEqual([]);
    }
  });

  it("refuses a serving-only impact that also requests a validity state", async () => {
    const { deps, recorder } = dependencies(ownerScope);
    const response = await handleContentImpactCommand(
      deps,
      "session-token",
      impactCommand({
        payload: { impactMode: "serving_only", requestedValidity: "not_counted" },
      }),
    );
    expect(response.status).toBe(400);
    expect(recorder.impacts).toEqual([]);
  });
});

/* ------------------------------------------------------------------------------------------------
 * What reaches the repository
 * ---------------------------------------------------------------------------------------------- */

describe("an authorized content command reaches the repository correctly", () => {
  it("records a report under the session's scope and the envelope's operation", async () => {
    const { deps, recorder } = dependencies(ownerScope);
    const response = await handleDefectReportCommand(deps, "session-token", reportCommand());
    expect(response.status).toBe(200);
    expect(await bodyOf(response)).toEqual({
      contract: { major: 1, minor: 0 },
      status: "completed",
      resourceId: reportId,
    });
    expect(recorder.reports).toHaveLength(1);
    expect(recorder.reports[0]).toMatchObject({
      scope: { learnerScopeId },
      input: { operationId, contentRevisionId: revisionId, category: "ambiguous_key" },
    });
  });

  it("returns the committed result on a replay rather than a new one", async () => {
    const { deps } = dependencies(ownerScope, {
      ok: true,
      disposition: "replayed",
      id: "already-committed-id",
    });
    const response = await handleDefectReportCommand(deps, "session-token", reportCommand());
    expect(response.status).toBe(200);
    expect(await bodyOf(response)).toMatchObject({ resourceId: "already-committed-id" });
  });

  it("refuses a conflicting reuse of one operation with a distinct status", async () => {
    const { deps } = dependencies(ownerScope, { ok: false, error: "idempotency_conflict" });
    const response = await handleDefectReportCommand(deps, "session-token", reportCommand());
    expect(response.status).toBe(409);
    expect(await bodyOf(response)).toMatchObject({ reasonCode: "idempotency_conflict" });
  });

  it("bounds an impact to the caller's own scope and cites the v1.1 registry", async () => {
    const { deps, recorder } = dependencies(ownerScope);
    expect((await handleContentImpactCommand(deps, "session-token", impactCommand())).status).toBe(
      200,
    );
    const assertion = recorder.impacts[0];
    expect(assertion?.learnerScopeBound).toEqual([learnerScopeId]);
    expect(assertion?.policyAndContractVersions.reasonRegistryRelease).toBe(
      reasonRegistryRelease.id,
    );
    expect(assertion?.policyAndContractVersions.reasonRegistryRelease).not.toBe(
      "reason-registry/v1",
    );
    expect(assertion?.selectors.contentRevisionIds).toEqual([revisionId]);
    expect(assertion?.declaredCardinality).toBe(1);
  });

  it("derives a stable digest so a replay is byte-identical and a different command is not", async () => {
    const first = dependencies(ownerScope);
    const second = dependencies(ownerScope);
    const third = dependencies(ownerScope);
    await handleContentImpactCommand(first.deps, "session-token", impactCommand());
    await handleContentImpactCommand(second.deps, "session-token", impactCommand());
    await handleContentImpactCommand(
      third.deps,
      "session-token",
      impactCommand({ payload: { declaredCardinality: 2 } }),
    );
    expect(second.recorder.impacts[0]?.digest).toBe(first.recorder.impacts[0]?.digest);
    expect(third.recorder.impacts[0]?.digest).not.toBe(first.recorder.impacts[0]?.digest);
  });

  it("lets no key-bearing field into any response it produces", async () => {
    const responses = await Promise.all([
      handleDefectReportCommand(dependencies(ownerScope).deps, "session-token", reportCommand()),
      handleDefectReportCommand(dependencies(ownerScope).deps, undefined, reportCommand()),
      handleDefectReportCommand(
        dependencies(ownerScope, { ok: false, error: "idempotency_conflict" }).deps,
        "session-token",
        reportCommand(),
      ),
      handleContentImpactCommand(dependencies(ownerScope).deps, "session-token", impactCommand()),
      handleContentImpactCommand(dependencies(ownerScope).deps, "session-token", {}),
    ]);
    for (const response of responses) {
      expect(findKeyBearingFields(await bodyOf(response))).toEqual([]);
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
  });
});
