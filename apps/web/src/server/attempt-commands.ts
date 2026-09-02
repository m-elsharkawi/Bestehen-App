import { randomUUID } from "node:crypto";
import { authorize } from "@bestehen/application";
import {
  assistanceCommandSchema,
  checkpointCommandSchema,
  commandEnvelopeSchema,
  exposureCommandSchema,
  opaqueAppIdSchema,
  submitObjectiveCommandSchema,
} from "@bestehen/contracts";
import { type AuthorizedScope, appId, type OperationId, type Result } from "@bestehen/domain";
import type { CheckpointObjectiveInput, SubmitObjectiveInput } from "./attempt-runtime";

type AssistancePayload = ReturnType<typeof assistanceCommandSchema.parse>;
type ExposurePayload = ReturnType<typeof exposureCommandSchema.parse>;

type CommandFailure =
  | "not_available"
  | "malformed_pinned_content"
  | "checkpoint_mismatch"
  | "unsupported_scoring_policy"
  | "scoring_rejected"
  | "idempotency_conflict"
  | "conflict"
  | "illegal_transition";

export interface AttemptCommandFunctions {
  create(
    scope: AuthorizedScope,
    input: {
      readonly operationId: OperationId;
      readonly servingManifestId: string;
      readonly activityOccurrenceId: string;
    },
  ): Promise<Result<{ readonly attemptId: string }, CommandFailure>>;
  checkpoint(
    scope: AuthorizedScope,
    input: CheckpointObjectiveInput,
  ): Promise<Result<{ readonly disposition: string }, CommandFailure>>;
  submit(
    scope: AuthorizedScope,
    input: SubmitObjectiveInput,
  ): Promise<Result<{ readonly submissionId: string }, CommandFailure>>;
  assistance(
    scope: AuthorizedScope,
    operationId: OperationId,
    payload: AssistancePayload,
  ): Promise<Result<{ readonly resourceId: string }, CommandFailure>>;
  exposure(
    scope: AuthorizedScope,
    operationId: OperationId,
    payload: ExposurePayload,
  ): Promise<Result<{ readonly resourceId: string }, CommandFailure>>;
}

export interface AttemptCommandDependencies {
  readonly authenticate: (token: string | undefined) => Promise<AuthorizedScope | undefined>;
  readonly commands: AttemptCommandFunctions;
  readonly now: () => Date;
}

function unavailable(): Response {
  return Response.json(
    { status: "unavailable", reasonCode: "FALLBACK.AUTHORIZATION_DENIED" },
    { status: 404, headers: { "cache-control": "no-store" } },
  );
}

function problem(
  status: number,
  code:
    | "malformed_request"
    | "unsupported_contract_major"
    | "precondition_failed"
    | "idempotency_conflict",
  title: string,
): Response {
  return Response.json(
    {
      type: `https://bestehen.invalid/problems/${code}`,
      title,
      status,
      code,
      requestId: randomUUID(),
    },
    {
      status,
      headers: { "cache-control": "no-store", "content-type": "application/problem+json" },
    },
  );
}

function completed(resourceId: string, extra: Record<string, unknown> = {}): Response {
  return Response.json(
    { status: "completed", resourceId, ...extra },
    { status: 200, headers: { "cache-control": "no-store" } },
  );
}

function refusal(error: CommandFailure): Response {
  if (error === "not_available") return unavailable();
  if (error === "idempotency_conflict") {
    return problem(409, "idempotency_conflict", "That operation was already used differently.");
  }
  return problem(409, "precondition_failed", "The command does not hold in the current state.");
}

async function authorizedEnvelope(
  dependencies: AttemptCommandDependencies,
  token: string | undefined,
  action: "attempt:create" | "attempt:checkpoint" | "attempt:submit",
  raw: unknown,
) {
  const scope = await dependencies.authenticate(token).catch(() => undefined);
  const authorized = authorize(scope, action, {}, dependencies.now());
  if (!authorized.ok) return unavailable();
  const envelope = commandEnvelopeSchema.safeParse(raw);
  if (!envelope.success) {
    const major = (raw as { contract?: { major?: unknown } } | null)?.contract?.major;
    return major !== undefined && major !== 1
      ? problem(400, "unsupported_contract_major", "This release speaks contract major 1.")
      : problem(400, "malformed_request", "The command envelope is not well formed.");
  }
  return { scope: authorized.value, envelope: envelope.data };
}

export async function handleCreateAttempt(
  dependencies: AttemptCommandDependencies,
  token: string | undefined,
  raw: unknown,
): Promise<Response> {
  const command = await authorizedEnvelope(dependencies, token, "attempt:create", raw);
  if (command instanceof Response) return command;
  const rawPayload = command.envelope.payload;
  const servingManifestId = opaqueAppIdSchema.safeParse(rawPayload.servingManifestId);
  const activityOccurrenceId = opaqueAppIdSchema.safeParse(rawPayload.activityOccurrenceId);
  if (
    Object.keys(rawPayload).some(
      (key) => key !== "servingManifestId" && key !== "activityOccurrenceId",
    ) ||
    !servingManifestId.success ||
    !activityOccurrenceId.success
  ) {
    return problem(400, "malformed_request", "The attempt payload is invalid.");
  }
  const result = await dependencies.commands.create(command.scope, {
    operationId: appId<"operation">(command.envelope.operationId),
    servingManifestId: servingManifestId.data,
    activityOccurrenceId: activityOccurrenceId.data,
  });
  return result.ok ? completed(result.value.attemptId) : refusal(result.error);
}

export async function handleCheckpointAttempt(
  dependencies: AttemptCommandDependencies,
  token: string | undefined,
  routeAttemptId: string,
  raw: unknown,
): Promise<Response> {
  const command = await authorizedEnvelope(dependencies, token, "attempt:checkpoint", raw);
  if (command instanceof Response) return command;
  const payload = checkpointCommandSchema.safeParse(command.envelope.payload);
  if (!payload.success || payload.data.attemptId !== routeAttemptId) {
    return problem(400, "malformed_request", "The checkpoint payload is invalid.");
  }
  const result = await dependencies.commands.checkpoint(command.scope, {
    operationId: appId<"operation">(command.envelope.operationId),
    attemptId: appId<"attempt">(routeAttemptId),
    expectedVersion: command.envelope.expectedVersion,
    stream: payload.data.stream,
    sequence: payload.data.sequence,
    operations: payload.data.operations,
    responseDigest: payload.data.responseDigest,
  });
  return result.ok
    ? completed(routeAttemptId, { disposition: result.value.disposition })
    : refusal(result.error);
}

export async function handleSubmitAttempt(
  dependencies: AttemptCommandDependencies,
  token: string | undefined,
  routeAttemptId: string,
  raw: unknown,
): Promise<Response> {
  const command = await authorizedEnvelope(dependencies, token, "attempt:submit", raw);
  if (command instanceof Response) return command;
  const payload = submitObjectiveCommandSchema.safeParse(command.envelope.payload);
  if (!payload.success || payload.data.attemptId !== routeAttemptId) {
    return problem(400, "malformed_request", "The submission payload is invalid.");
  }
  const result = await dependencies.commands.submit(command.scope, {
    operationId: appId<"operation">(command.envelope.operationId),
    attemptId: appId<"attempt">(routeAttemptId),
    checkpointSequence: payload.data.checkpointSequence,
    responseDigest: payload.data.responseDigest,
    clockObservation: {
      monotonicElapsedMs: payload.data.conditions.elapsedMs,
      visibilityChanges: 0,
      stallIntervals: [],
      wallClockSkewMs: 0,
      accessibilityEquivalence: payload.data.conditions.accessibilityEquivalence,
    },
  });
  return result.ok ? completed(result.value.submissionId) : refusal(result.error);
}

async function handleAuxiliary(
  dependencies: AttemptCommandDependencies,
  token: string | undefined,
  routeAttemptId: string,
  raw: unknown,
  kind: "assistance" | "exposure",
): Promise<Response> {
  const command = await authorizedEnvelope(dependencies, token, "attempt:checkpoint", raw);
  if (command instanceof Response) return command;
  const schema = kind === "assistance" ? assistanceCommandSchema : exposureCommandSchema;
  const payload = schema.safeParse(command.envelope.payload);
  if (!payload.success || payload.data.attemptId !== routeAttemptId) {
    return problem(400, "malformed_request", `The ${kind} payload is invalid.`);
  }
  const operationId = appId<"operation">(command.envelope.operationId);
  const result =
    kind === "assistance"
      ? await dependencies.commands.assistance(
          command.scope,
          operationId,
          payload.data as AssistancePayload,
        )
      : await dependencies.commands.exposure(
          command.scope,
          operationId,
          payload.data as ExposurePayload,
        );
  return result.ok ? completed(result.value.resourceId) : refusal(result.error);
}

export const handleAssistanceAttempt = (
  dependencies: AttemptCommandDependencies,
  token: string | undefined,
  attemptId: string,
  raw: unknown,
) => handleAuxiliary(dependencies, token, attemptId, raw, "assistance");

export const handleExposureAttempt = (
  dependencies: AttemptCommandDependencies,
  token: string | undefined,
  attemptId: string,
  raw: unknown,
) => handleAuxiliary(dependencies, token, attemptId, raw, "exposure");
