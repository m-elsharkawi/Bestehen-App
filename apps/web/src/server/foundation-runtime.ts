import { canonicalDigest } from "@bestehen/content";
import { type AuthorizedScope, appId, type Result } from "@bestehen/domain";
import type {
  FoundationProfileFactKind,
  FoundationRouteRecord,
  PostgresAttemptRepository,
} from "@bestehen/infrastructure";
import { stableId } from "./attempt-command-runtime";

export const foundationSkills = [
  "reading",
  "language_elements",
  "listening",
  "writing",
  "speaking",
] as const;
export type FoundationSkill = (typeof foundationSkills)[number];

export const foundationUnavailableSkills = [
  { skill: "writing", reasonCode: "FALLBACK.CONTENT_UNAVAILABLE" },
  { skill: "speaking", reasonCode: "FALLBACK.CONTENT_UNAVAILABLE" },
] as const;

const availableFamilies = {
  reading: "R2DetailedSelect",
  language_elements: "SB1ContextualGrammarCloze",
  listening: "H1ShortAnnouncements",
} as const;
const availableSkills = ["reading", "language_elements", "listening"] as const;

type FoundationStore = Pick<
  PostgresAttemptRepository,
  "readFoundationRoute" | "recordFoundationProfileFact"
>;

export interface FoundationRouteProjection {
  readonly sessionId: string;
  readonly planningHorizonYears: 65;
  readonly officialTargetYears: 60;
  readonly completedSkills: readonly FoundationSkill[];
  readonly nextSkill?: keyof typeof availableFamilies;
  readonly nextTaskFamily?: (typeof availableFamilies)[keyof typeof availableFamilies];
  readonly activityOccurrenceId?: string;
  readonly targetExamContext?: unknown;
  readonly accessPreferences?: unknown;
  readonly unavailableSkills: typeof foundationUnavailableSkills;
}

function sameValue(left: unknown, right: unknown): boolean {
  return canonicalDigest(left) === canonicalDigest(right);
}

async function appendIfChanged(
  store: FoundationStore,
  scope: AuthorizedScope,
  route: FoundationRouteRecord,
  factKind: FoundationProfileFactKind,
  payload: unknown,
  now: Date,
): Promise<Result<void, "not_available" | "conflict">> {
  const current = route.profileFacts[factKind];
  if (current && sameValue(current.payload, payload)) return { ok: true, value: undefined };
  const seed = `${route.sessionId}:${factKind}:${current?.sequence ?? 0}:${canonicalDigest(payload)}`;
  const recorded = await store.recordFoundationProfileFact(scope, {
    sessionId: route.sessionId,
    factId: stableId("profile_fact", seed),
    operationId: stableId("operation", seed),
    factKind,
    payload,
    effectiveAt: now,
  });
  return recorded.ok
    ? { ok: true, value: undefined }
    : {
        ok: false,
        error: recorded.error === "not_available" ? "not_available" : "conflict",
      };
}

function project(route: FoundationRouteRecord): FoundationRouteProjection {
  const completedSkills = foundationSkills.filter((skill) =>
    route.completedModalities.includes(skill),
  );
  const nextSkill = availableSkills.find((skill) => !completedSkills.includes(skill));
  return {
    sessionId: route.sessionId,
    planningHorizonYears: 65,
    officialTargetYears: 60,
    completedSkills,
    unavailableSkills: foundationUnavailableSkills,
    ...(nextSkill ? { nextSkill, nextTaskFamily: availableFamilies[nextSkill] } : {}),
    ...(route.activityOccurrenceId ? { activityOccurrenceId: route.activityOccurrenceId } : {}),
    ...(route.profileFacts.target_exam_context_v1
      ? { targetExamContext: route.profileFacts.target_exam_context_v1.payload }
      : {}),
    ...(route.profileFacts.access_preferences_v1
      ? { accessPreferences: route.profileFacts.access_preferences_v1.payload }
      : {}),
  };
}

export async function loadFoundationRoute(
  store: FoundationStore,
  scope: AuthorizedScope,
  sessionId: string,
  now: Date,
): Promise<Result<FoundationRouteProjection, "not_available" | "conflict">> {
  const route = await store.readFoundationRoute(scope, appId<"session">(sessionId));
  if (!route) return { ok: false, error: "not_available" };
  const planning = await appendIfChanged(
    store,
    scope,
    route,
    "planning_horizon_v1",
    { horizonYears: 65 },
    now,
  );
  if (!planning.ok) return planning;
  const afterPlanning = (await store.readFoundationRoute(scope, route.sessionId)) ?? route;
  const completedSkills = foundationSkills.filter((skill) =>
    afterPlanning.completedModalities.includes(skill),
  );
  const progress = await appendIfChanged(
    store,
    scope,
    afterPlanning,
    "foundation_route_progress_v1",
    { completedSkills, sourceCut: afterPlanning.sourceCut },
    now,
  );
  if (!progress.ok) return progress;
  const afterProgress =
    (await store.readFoundationRoute(scope, afterPlanning.sessionId)) ?? afterPlanning;
  return { ok: true, value: project(afterProgress) };
}

export async function recordFoundationPreference(
  store: FoundationStore,
  scope: AuthorizedScope,
  sessionId: string,
  factKind: "target_exam_context_v1" | "access_preferences_v1",
  payload: unknown,
  now: Date,
): Promise<Result<void, "not_available" | "conflict">> {
  const route = await store.readFoundationRoute(scope, appId<"session">(sessionId));
  if (!route) return { ok: false, error: "not_available" };
  return appendIfChanged(store, scope, route, factKind, payload, now);
}
