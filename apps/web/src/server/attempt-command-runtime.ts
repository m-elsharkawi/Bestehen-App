import { createHash } from "node:crypto";
import {
  appSecuritySecret,
  databaseUrlFor,
  parseServerEnvironmentForService,
} from "@bestehen/configuration";
import { canonicalDigest } from "@bestehen/content";
import { type AppId, appId } from "@bestehen/domain";
import {
  AppIdentityService,
  createPostgresPool,
  PostgresAttemptRepository,
  PostgresContentRepository,
} from "@bestehen/infrastructure";
import type { AttemptCommandDependencies, AttemptCommandFunctions } from "./attempt-commands";
import { DeterministicAttemptService } from "./attempt-runtime";
import type { ServingManifestCommandDependencies } from "./serving-manifest-commands";

export function stableId<Kind extends string>(kind: Kind, seed: string): AppId<Kind> {
  const hex = createHash("sha256").update(`${kind}:${seed}`, "utf8").digest("hex");
  return appId(
    `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`,
  );
}

function commandFailure(error: string) {
  switch (error) {
    case "idempotency_conflict":
    case "conflict":
    case "illegal_transition":
      return error;
    default:
      return "not_available" as const;
  }
}

let dependencies: AttemptCommandDependencies | undefined;
let servingDependencies: ServingManifestCommandDependencies | undefined;

export function getServingManifestCommandDependencies(): ServingManifestCommandDependencies {
  if (servingDependencies) return servingDependencies;
  const environment = parseServerEnvironmentForService(process.env, "web");
  const pool = createPostgresPool(databaseUrlFor(environment, "web"));
  const identity = new AppIdentityService(pool, environment, appSecuritySecret(environment));
  servingDependencies = {
    authenticate: (token) => identity.authenticate(token),
    attempts: new PostgresAttemptRepository(pool),
    content: new PostgresContentRepository(pool),
    identity: stableId,
    now: () => new Date(),
  };
  return servingDependencies;
}

export function getAttemptCommandDependencies(): AttemptCommandDependencies {
  if (dependencies) return dependencies;
  const environment = parseServerEnvironmentForService(process.env, "web");
  const pool = createPostgresPool(databaseUrlFor(environment, "web"));
  const attempts = new PostgresAttemptRepository(pool);
  const content = new PostgresContentRepository(pool);
  const identity = new AppIdentityService(pool, environment, appSecuritySecret(environment));
  const runtime = new DeterministicAttemptService(
    { attempts, content },
    stableId,
    () => new Date(),
  );

  const commands: AttemptCommandFunctions = {
    create: async (scope, input) => {
      const material = await content.readPinnedLearnerMaterial(
        scope,
        appId<"serving_manifest">(input.servingManifestId),
      );
      const context = await attempts.readAttemptContext(
        scope,
        appId<"activity_occurrence">(input.activityOccurrenceId),
      );
      if (!material || !context) return { ok: false, error: "not_available" };
      const attemptId = stableId("attempt", `${material.manifest.operationId}:attempt`);
      const modality = material.taskFamilyKind.startsWith("SB")
        ? ("language_elements" as const)
        : material.taskFamilyKind.startsWith("H")
          ? ("listening" as const)
          : ("reading" as const);
      const created = await attempts.createAttempt(scope, {
        operationId: input.operationId,
        attemptId,
        servingManifestId: material.manifest.servingManifestId,
        sessionId: context.sessionId,
        activityOccurrenceId: context.activityOccurrenceId,
        episodeId: context.episodeId,
        contentRevisionId: material.contentRevisionId,
        modality,
        directLane: modality === "listening" ? "aural" : "written",
        payloadDigest: canonicalDigest({
          servingManifestId: input.servingManifestId,
          activityOccurrenceId: input.activityOccurrenceId,
        }),
        occurredAt: new Date(),
      });
      if (!created.ok) return { ok: false, error: commandFailure(created.error) };
      if (created.value.attempt.state === "ready") {
        const started = await attempts.transitionAttempt(scope, {
          attemptId,
          to: "in_progress",
          expectedVersion: created.value.attempt.resourceVersion,
        });
        if (!started.ok) return { ok: false, error: commandFailure(started.error) };
      } else if (created.value.attempt.state !== "in_progress") {
        return { ok: false, error: "illegal_transition" };
      }
      return { ok: true, value: { attemptId } };
    },
    checkpoint: async (scope, input) => {
      const result = await runtime.checkpointObjective(scope, input);
      return result.ok ? { ok: true, value: { disposition: result.value.disposition } } : result;
    },
    submit: async (scope, input) => {
      const result = await runtime.submitObjective(scope, input);
      return result.ok
        ? { ok: true, value: { submissionId: result.value.submission.submissionId } }
        : result;
    },
    assistance: async (scope, operationId, payload) => {
      const result = await attempts.recordAssistance(scope, {
        operationId,
        assistanceEventId: appId<"assistance_event">(payload.assistanceEventId),
        attemptId: appId<"attempt">(payload.attemptId),
        kind: payload.kind,
        state: payload.state,
        phase: payload.phase,
        affectedScope: payload.affectedScope,
        answerBearing: payload.answerBearing,
        testedCapabilityEffect: payload.testedCapabilityEffect,
        policyVersion: payload.policyVersion,
        occurredAt: new Date(payload.occurredAt),
      });
      return result.ok
        ? { ok: true, value: { resourceId: payload.assistanceEventId } }
        : { ok: false, error: commandFailure(result.error) };
    },
    exposure: async (scope, operationId, payload) => {
      const attempt = await attempts.readAttempt(scope, appId<"attempt">(payload.attemptId));
      if (!attempt) return { ok: false, error: "not_available" };
      const trigger =
        payload.revealedKind === "stimulus"
          ? ("learner_visible_stimulus" as const)
          : payload.revealedKind === "transcript"
            ? ("transcript" as const)
            : payload.revealedKind === "decisive_information"
              ? ("decisive_information" as const)
              : ("key_or_rationale" as const);
      const digest = canonicalDigest(payload);
      const recorded = await content.recordExposure(scope, {
        operationId,
        contentFamilyId: appId<"content_family">(payload.contentFamilyId),
        exposureClass: payload.exposureClass,
        trigger,
        contentRevisionId: attempt.contentRevisionId,
        occurredAt: new Date(payload.occurredAt),
        payloadDigest: digest,
      });
      if (!recorded.ok) return { ok: false, error: commandFailure(recorded.error) };
      const fact = await attempts.recordAttemptFact(scope, operationId, {
        kind: "exposure",
        factId: appId<"response_fact">(payload.exposureEventId),
        attemptId: attempt.attemptId,
        factType: "objective_exposure_v1",
        envelope: { exposureClass: recorded.value.exposureClass, trigger, phase: payload.phase },
        digest,
      });
      return fact.ok
        ? { ok: true, value: { resourceId: payload.exposureEventId } }
        : { ok: false, error: commandFailure(fact.error) };
    },
  };
  dependencies = {
    authenticate: (token) => identity.authenticate(token),
    commands,
    now: () => new Date(),
  };
  return dependencies;
}
