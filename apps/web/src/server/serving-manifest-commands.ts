import { randomUUID } from "node:crypto";
import { authorize } from "@bestehen/application";
import {
  assertNoKeyBearingFields,
  canonicalDigest,
  type TaskFamilyKind,
  taskFamilyKinds,
} from "@bestehen/content";
import { commandEnvelopeSchema, servingManifestSchema } from "@bestehen/contracts";
import { type AppId, type AuthorizedScope, appId } from "@bestehen/domain";
import type {
  PostgresAttemptRepository,
  PostgresContentRepository,
  ServingManifestRecord,
} from "@bestehen/infrastructure";
import { isDatabaseAppId, wireOperationId } from "./attempt-commands";

export interface ServingManifestCommandDependencies {
  readonly authenticate: (token: string | undefined) => Promise<AuthorizedScope | undefined>;
  readonly attempts: Pick<PostgresAttemptRepository, "readAttemptContext">;
  readonly content: Pick<
    PostgresContentRepository,
    "readServingManifestByOperation" | "findEligibleServingRevision" | "issueServingManifest"
  >;
  readonly identity: <Kind extends string>(kind: Kind, seed: string) => AppId<Kind>;
  readonly now: () => Date;
}

function unavailable(): Response {
  return Response.json(
    { status: "unavailable", reasonCode: "FALLBACK.CONTENT_UNAVAILABLE" },
    { status: 404, headers: { "cache-control": "no-store" } },
  );
}

function malformed(code: "malformed_request" | "unsupported_contract_major", title: string) {
  return Response.json(
    {
      type: `https://bestehen.invalid/problems/${code}`,
      title,
      status: 400,
      code,
      requestId: randomUUID(),
    },
    { status: 400, headers: { "content-type": "application/problem+json" } },
  );
}

function responseFor(manifest: ServingManifestRecord, attemptId: string): Response {
  const learnerManifest = servingManifestSchema.parse({
    servingManifestId: manifest.servingManifestId,
    attemptId,
    ...(manifest.formId ? { formId: manifest.formId } : {}),
    contentRevisionIds: [...new Set(manifest.entries.map((entry) => entry.contentRevisionId))],
    itemIds: manifest.entries.flatMap((entry) =>
      entry.contentItemId ? [entry.contentItemId] : [],
    ),
    mediaRevisionIds: manifest.entries.flatMap((entry) =>
      entry.mediaRevisionId ? [entry.mediaRevisionId] : [],
    ),
    keyRevisionDigests: manifest.keyRevisionDigests,
    contentClass: manifest.contentClass,
    approvalRole: manifest.approvalRole,
    allowedConditions: manifest.allowedConditions,
    learnerSafePayloadDigest: manifest.learnerSafePayloadDigest,
    freshnessDecision: manifest.freshnessDecision,
    comparedFamilyRefs: manifest.comparedFamilyRefs,
    authorizationVersion: manifest.authorizationVersion,
    contentReleaseIdentity: manifest.contentReleaseIdentity,
    issuedAt: manifest.issuedAt.toISOString(),
    expiresAt: manifest.expiresAt.toISOString(),
    revocationState: manifest.revocationState,
  });
  assertNoKeyBearingFields(learnerManifest, "serving manifest response");
  return Response.json(learnerManifest, { headers: { "cache-control": "no-store" } });
}

export async function handleAcquireServingManifest(
  dependencies: ServingManifestCommandDependencies,
  token: string | undefined,
  raw: unknown,
): Promise<Response> {
  const scope = await dependencies.authenticate(token).catch(() => undefined);
  const authorized = authorize(scope, "attempt:create", {}, dependencies.now());
  if (!authorized.ok) return unavailable();
  const envelope = commandEnvelopeSchema.safeParse(raw);
  if (!envelope.success) {
    const major = (raw as { contract?: { major?: unknown } } | null)?.contract?.major;
    return major !== undefined && major !== 1
      ? malformed("unsupported_contract_major", "This release speaks contract major 1.")
      : malformed("malformed_request", "The command envelope is not well formed.");
  }
  const payload = envelope.data.payload;
  const family = payload.taskFamily;
  const profile = payload.progressionProfile;
  const activityOccurrenceId = payload.activityOccurrenceId;
  if (
    typeof family !== "string" ||
    !(taskFamilyKinds as readonly string[]).includes(family) ||
    typeof activityOccurrenceId !== "string" ||
    typeof profile !== "string" ||
    !["P0", "P1", "P2", "P3", "P4"].includes(profile) ||
    Object.keys(payload).some(
      (key) =>
        key !== "taskFamily" && key !== "progressionProfile" && key !== "activityOccurrenceId",
    )
  ) {
    return malformed("malformed_request", "The serving request is invalid.");
  }
  if (!isDatabaseAppId(activityOccurrenceId)) return unavailable();
  const operationId = wireOperationId(envelope.data.operationId);
  const replay = await dependencies.content.readServingManifestByOperation(
    authorized.value,
    operationId,
  );
  const attemptId = dependencies.identity("attempt", `${operationId}:attempt`);
  if (replay) return responseFor(replay, attemptId);
  const context = await dependencies.attempts.readAttemptContext(
    authorized.value,
    appId<"activity_occurrence">(activityOccurrenceId),
  );
  if (!context) return unavailable();
  const eligible = await dependencies.content.findEligibleServingRevision(
    authorized.value,
    family as TaskFamilyKind,
    profile,
  );
  if (
    !eligible ||
    eligible.itemIds.length === 0 ||
    eligible.itemIds.length !== eligible.keyRevisionDigests.length
  ) {
    return unavailable();
  }
  const issuedAt = dependencies.now();
  const expiresAt = new Date(issuedAt.getTime() + 45 * 60_000);
  const allowedConditions = {
    progressionProfile: profile,
    timingMode: "practice",
    targetDurationMs: 1_200_000,
    transcriptPhase: "after_attempt",
    offerableAssistanceKinds: ["strategy_cue"],
  };
  const entries = [
    ...eligible.itemIds.map((contentItemId, index) => ({
      ordinal: index + 1,
      contentRevisionId: eligible.contentRevisionId,
      contentItemId,
    })),
    ...eligible.mediaRevisionIds.map((mediaRevisionId, index) => ({
      ordinal: eligible.itemIds.length + index + 1,
      contentRevisionId: eligible.contentRevisionId,
      mediaRevisionId,
    })),
  ];
  const servingManifestId = dependencies.identity("serving_manifest", `${operationId}:manifest`);
  const basis = {
    servingManifestId,
    operationId,
    contentClass: eligible.contentClass,
    approvalRole: eligible.approvalRole,
    entries,
    keyRevisionDigests: eligible.keyRevisionDigests,
    allowedConditions,
    learnerSafePayloadDigest: canonicalDigest({
      instruction: eligible.instruction,
      learnerPayload: eligible.learnerPayload,
    }),
    freshnessDecision: eligible.priorExposureClass ? "exposed_review" : "fresh",
    comparedFamilyRefs: eligible.priorExposureClass ? [eligible.contentFamilyId] : [],
    authorizationVersion: "authorization/v1",
    contentReleaseIdentity: eligible.contentReleaseIdentity,
  } as const;
  const issued = await dependencies.content.issueServingManifest(authorized.value, {
    ...basis,
    issuedAt,
    expiresAt,
    digest: canonicalDigest({
      ...basis,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }),
  });
  return issued.ok ? responseFor(issued.value.manifest, attemptId) : unavailable();
}
