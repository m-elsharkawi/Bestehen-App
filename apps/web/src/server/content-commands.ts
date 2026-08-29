/**
 * The server side of the two Stage 05 content commands: a scoped defect report and an owner content
 * impact.
 *
 * The route files are five lines each on purpose. Everything that decides an outcome lives here, as
 * a function over injected dependencies, so the negative cases — no session, a session that may not
 * hold the action, a malformed body, a reference that belongs to another scope — are unit-testable
 * without a browser, a database or Next's request context.
 *
 * Three rules shape the order of the steps below.
 *
 * 1. **Authorization runs before parsing.** UI hiding is not authorization and neither is a valid
 *    body. An unauthenticated caller must not be able to learn the shape of the command by watching
 *    which malformed bodies produce which errors, so it gets the same answer as a caller that named
 *    something outside its scope: `404`, with no problem document.
 * 2. **Every refusal is the same refusal.** An unknown reference, a reference in another learner
 *    scope and a caller without the action all produce a byte-identical response. A caller learns
 *    nothing about whether the thing exists.
 * 3. **Nothing key-bearing leaves.** `assertNoKeyBearingFields` runs over the response body before
 *    it is serialized. It throws rather than strips, because stripping would hide the defect.
 */

import { authorize } from "@bestehen/application";
import {
  assertNoKeyBearingFields,
  canonicalDigest,
  canonicalizationVersion,
  contentReleaseIdentity,
} from "@bestehen/content";
import { commandEnvelopeSchema, contentImpactCommandSchema } from "@bestehen/contracts";
import { defectReportCommandSchema } from "@bestehen/contracts";
import { appId, type AuthorizedScope, reasonRegistryRelease } from "@bestehen/domain";
import type {
  ContentRepositoryError,
  ImpactAssertionInput,
  PostgresContentRepository,
} from "@bestehen/infrastructure";

/** The slice of {@link PostgresContentRepository} these two commands need. */
export interface ContentCommandSink {
  appendDefectReport: PostgresContentRepository["appendDefectReport"];
  appendImpactAssertion: PostgresContentRepository["appendImpactAssertion"];
}

export interface ContentCommandDependencies {
  readonly authenticate: (token: string | undefined) => Promise<AuthorizedScope | undefined>;
  readonly repository: ContentCommandSink;
  readonly now: () => Date;
}

const contractVersion = { major: 1, minor: 0 } as const;

/** The single refusal. No problem document, no detail, no distinguishing header. */
function notAvailable(): Response {
  return Response.json(
    {
      contract: contractVersion,
      status: "unavailable",
      reasonCode: "FALLBACK.AUTHORIZATION_DENIED",
    },
    { status: 404, headers: { "cache-control": "no-store" } },
  );
}

function problem(
  status: number,
  code:
    | "malformed_request"
    | "unsupported_contract_major"
    | "precondition_failed"
    | "idempotency_conflict"
    | "internal_protocol_error",
  title: string,
): Response {
  return Response.json(
    { contract: contractVersion, status: "conflict", reasonCode: code, title },
    { status, headers: { "cache-control": "no-store" } },
  );
}

/**
 * Maps a repository refusal onto a response.
 *
 * `not_available` deliberately shares its response with an unauthorized caller: the repository
 * answers `not_available` for a reference in another learner scope as well as for one that does not
 * exist, and the boundary must not undo that.
 */
function refusalResponse(error: ContentRepositoryError): Response {
  switch (error) {
    case "not_available":
      return notAvailable();
    case "idempotency_conflict":
      return problem(409, "idempotency_conflict", "That operation was already used differently.");
    default:
      return problem(409, "precondition_failed", "The command does not hold in the current state.");
  }
}

function completed(resourceId: string): Response {
  const body = { contract: contractVersion, status: "completed", resourceId };
  assertNoKeyBearingFields(body, "content command response");
  return Response.json(body, { status: 200, headers: { "cache-control": "no-store" } });
}

interface AuthorizedCommand {
  readonly scope: AuthorizedScope;
  readonly operationId: string;
  readonly payload: Record<string, unknown>;
}

/**
 * Authorizes first, then parses. A failure at either step returns the same refusal, except for a
 * malformed body from an already-authorized caller, which is told so — by then the caller has
 * proved it may issue the command, and an opaque answer would only make a real client harder to fix.
 */
async function authorizeAndParse(
  dependencies: ContentCommandDependencies,
  action: "content:report" | "content:quarantine",
  requireRecentAuth: boolean,
  token: string | undefined,
  rawBody: unknown,
): Promise<AuthorizedCommand | Response> {
  const scope = await dependencies.authenticate(token);
  const authorized = authorize(scope, action, { requireRecentAuth }, dependencies.now());
  if (!authorized.ok) return notAvailable();

  const envelope = commandEnvelopeSchema.safeParse(rawBody);
  if (!envelope.success) {
    const declared = (rawBody as { contract?: { major?: unknown } } | null)?.contract?.major;
    return declared !== undefined && declared !== 1
      ? problem(400, "unsupported_contract_major", "This release speaks contract major 1.")
      : problem(400, "malformed_request", "The command envelope is not well formed.");
  }
  return {
    scope: authorized.value,
    operationId: envelope.data.operationId,
    payload: envelope.data.payload,
  };
}

/* ------------------------------------------------------------------------------------------------
 * `POST /api/v1/content/reports`
 * ---------------------------------------------------------------------------------------------- */

export async function handleDefectReportCommand(
  dependencies: ContentCommandDependencies,
  token: string | undefined,
  rawBody: unknown,
): Promise<Response> {
  const command = await authorizeAndParse(dependencies, "content:report", false, token, rawBody);
  if (command instanceof Response) return command;

  const parsed = defectReportCommandSchema.safeParse(command.payload);
  if (!parsed.success) {
    return problem(400, "malformed_request", "The report payload is not well formed.");
  }
  const report = parsed.data;
  const recorded = await dependencies.repository.appendDefectReport(command.scope, {
    defectReportId: report.defectReportId,
    operationId: appId<"operation">(command.operationId),
    contentRevisionId: appId<"content_revision">(report.contentRevisionId),
    ...(report.itemId ? { contentItemId: appId<"content_item">(report.itemId) } : {}),
    ...(report.attemptId ? { attemptId: report.attemptId } : {}),
    category: report.category,
    ...(report.note === undefined ? {} : { note: report.note }),
    reportedAt: new Date(report.reportedAt),
  });
  return recorded.ok ? completed(recorded.value.defectReportId) : refusalResponse(recorded.error);
}

/* ------------------------------------------------------------------------------------------------
 * `POST /api/v1/content/impacts`
 * ---------------------------------------------------------------------------------------------- */

/**
 * Everything the durable assertion needs that the wire command deliberately does not carry.
 *
 * The learner scope bound is the caller's own scope and nothing wider: a command cannot name the
 * scopes it reaches, so it cannot reach past itself. The digest is computed over the canonical
 * command plus the operation, so a replay under the same operation is byte-identical and a different
 * command under the same identity is a conflict rather than an overwrite.
 */
function impactAssertionFrom(
  command: AuthorizedCommand,
  wire: ReturnType<typeof contentImpactCommandSchema.parse>,
): ImpactAssertionInput {
  return {
    impactAssertionId: wire.impactAssertionId,
    incidentId: `incident:${command.operationId}`,
    ownerContext: "Content & Publication",
    actorRef: `principal:${command.scope.principalId}`,
    authorizationVersion: "authorization/v1",
    causeKind: wire.causeKind,
    impactMode: wire.impactMode,
    ...(wire.requestedValidity === undefined ? {} : { requestedValidity: wire.requestedValidity }),
    selectors: {
      contentRevisionIds: wire.selectors.contentRevisionIds.map((id) =>
        appId<"content_revision">(id),
      ),
      contentFamilyIds: wire.selectors.contentFamilyIds.map((id) => appId<"content_family">(id)),
      contentItemIds: wire.selectors.itemIds.map((id) => appId<"content_item">(id)),
      contentFormIds: wire.selectors.formIds.map((id) => appId<"content_form">(id)),
      mediaRevisionIds: wire.selectors.mediaRevisionIds.map((id) => appId<"media_revision">(id)),
    },
    learnerScopeBound: [command.scope.learnerScopeId],
    declaredCardinality: wire.declaredCardinality,
    affectedScope: wire.affectedScope,
    unaffectedScope: wire.unaffectedScope,
    reasonCode: wire.reasonCode,
    evidenceRefs: [`operation:${command.operationId}`],
    policyAndContractVersions: {
      contentReleaseIdentity,
      reasonRegistryRelease: reasonRegistryRelease.id,
      canonicalizationVersion,
    },
    effectiveAt: new Date(wire.effectiveAt),
    digest: canonicalDigest({ operationId: command.operationId, command: wire }),
  };
}

export async function handleContentImpactCommand(
  dependencies: ContentCommandDependencies,
  token: string | undefined,
  rawBody: unknown,
): Promise<Response> {
  // An impact can move a validity assertion, so it is the destructive owner command of the pair and
  // asks for a recent authentication as well as the capability.
  const command = await authorizeAndParse(dependencies, "content:quarantine", true, token, rawBody);
  if (command instanceof Response) return command;

  const parsed = contentImpactCommandSchema.safeParse(command.payload);
  if (!parsed.success) {
    return problem(400, "malformed_request", "The impact payload is not well formed.");
  }
  const appended = await dependencies.repository.appendImpactAssertion(
    impactAssertionFrom(command, parsed.data),
  );
  return appended.ok ? completed(parsed.data.impactAssertionId) : refusalResponse(appended.error);
}
