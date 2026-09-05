import type { MediaPreflightObservation, PlaybackOccurrenceCommand } from "@bestehen/contracts";

export interface ClientListeningContext {
  readonly contextId: string;
  readonly environmentChangeCounter: number;
}
export interface ClientListeningCandidate {
  readonly assetId: string;
  readonly manifestRevision: string;
  readonly manifestDigest: string;
  readonly mediaRevisionId: string;
  readonly digest: string;
  readonly bytes: number;
  readonly mime: "audio/mpeg" | "audio/wav";
  readonly durationMs: number;
}
export interface ClientListeningOccurrence {
  readonly occurrenceId: string;
  readonly ordinal: number;
  readonly family: "H1" | "H2" | "H3";
  readonly contentRevisionId: string;
  readonly stimulusId: string;
  readonly itemIds: readonly string[];
  readonly candidates: readonly ClientListeningCandidate[];
  readonly allowedPlayCount: number;
  readonly authoredSpeedRatio: number;
  readonly ordinalPolicies: readonly {
    readonly playOrdinal: number;
    readonly evidenceCondition: "authored_opportunity" | "assisted_extra";
    readonly requiresCompletedOrdinal: number | null;
  }[];
  readonly seekingAllowed: boolean;
  readonly pauseAllowed: boolean;
  readonly transcriptPhase: "never" | "after_attempt" | "after_block";
  readonly responseWindow: { readonly readBeforeMs: number; readonly respondAfterMs: number };
}
export interface ClientListeningPlan {
  readonly contractMajor: 1;
  readonly listeningPlanId: string;
  readonly attemptId: string;
  readonly servingManifestId: string;
  readonly formId?: string;
  readonly planVersion: string;
  readonly targetBlueprintVersion: string;
  readonly evidenceRole: string;
  readonly progressionProfile: "P0" | "P1" | "P2" | "P3" | "P4";
  readonly practiceKind: "ordinary" | "target_probe" | "target_block";
  readonly occurrences: readonly ClientListeningOccurrence[];
  readonly preflightPolicyRef: string;
  readonly playbackPolicyRef: string;
  readonly timerPolicyRef: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly revocationState: "active" | "revoked_before_start" | "revoked_after_pin";
}
export interface ClientMediaPreflightReceipt {
  readonly contractMajor: 1;
  readonly receiptId: string;
  readonly listeningPlanId: string;
  readonly operationId: string;
  readonly resourceVersion: number;
  readonly observationDigest: string;
  readonly context: ClientListeningContext;
  readonly outcome: "ready" | "retryable" | "unavailable_affected_activity";
  readonly reasons: readonly string[];
  readonly issuedAt: string;
  readonly expiresAt: string;
}
export interface ClientPlaybackReceipt {
  readonly operationId: string;
  readonly listeningPlanId: string;
  readonly occurrenceId: string;
  readonly playOrdinal: number;
  readonly resourceVersion: number;
  readonly event: PlaybackOccurrenceCommand["event"];
  readonly localIntentId: string;
  readonly recordedAt: string;
  readonly mayStartNow: boolean;
  readonly authorizationExpiresAt: string;
  readonly affectedItemIds: readonly string[];
  readonly phase: "ready" | "begin_recorded" | "playing" | "block_complete" | "interrupted";
}
export interface ClientListeningPlanView {
  readonly plan: ClientListeningPlan;
  readonly resourceVersion: number;
  readonly phase: ClientPlaybackReceipt["phase"];
  readonly outputProbeRevisionId: string;
  readonly latestPreflight: ClientMediaPreflightReceipt | null;
  readonly playback: readonly ClientPlaybackReceipt[];
}
export interface ClientTranscriptReveal {
  readonly transcriptRevisionId: string;
  readonly mediaRevisionId: string;
  readonly kind: "target_transcript" | "focused_repair_excerpt";
  readonly language: "de";
  readonly digest: string;
  readonly authorizedPhase: "after_attempt" | "after_block";
  readonly text: string;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const digest = /^[a-f0-9]{64}$/;
const own = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const exact = (value: unknown, keys: readonly string[]): value is Record<string, unknown> =>
  own(value) &&
  keys.every((key) => key in value) &&
  Object.keys(value).every((key) => keys.includes(key));
const text = (value: unknown, maximum = 160) =>
  typeof value === "string" && value.length > 0 && value.length <= maximum ? value : undefined;
const identifier = (value: unknown) =>
  typeof value === "string" && uuid.test(value) ? value : undefined;
const hash = (value: unknown) =>
  typeof value === "string" && digest.test(value) ? value : undefined;
const integer = (value: unknown, minimum = 0) =>
  typeof value === "number" && Number.isInteger(value) && value >= minimum ? value : undefined;
const positive = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
const instant = (value: unknown) => {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return undefined;
  return value;
};
function oneOf<const T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : undefined;
}
function reject(): never {
  throw new Error("Listening system fault");
}
function requireValue<T>(value: T | undefined): T {
  return value === undefined ? reject() : value;
}
function parseContext(value: unknown): ClientListeningContext {
  if (!exact(value, ["contextId", "environmentChangeCounter"])) reject();
  return {
    contextId: requireValue(text(value.contextId)),
    environmentChangeCounter: requireValue(integer(value.environmentChangeCounter)),
  };
}
function parseCandidate(value: unknown): ClientListeningCandidate {
  if (
    !exact(value, [
      "assetId",
      "manifestRevision",
      "manifestDigest",
      "mediaRevisionId",
      "digest",
      "bytes",
      "mime",
      "durationMs",
    ])
  )
    reject();
  return {
    assetId: requireValue(identifier(value.assetId)),
    manifestRevision: requireValue(text(value.manifestRevision)),
    manifestDigest: requireValue(hash(value.manifestDigest)),
    mediaRevisionId: requireValue(identifier(value.mediaRevisionId)),
    digest: requireValue(hash(value.digest)),
    bytes: requireValue(integer(value.bytes, 1)),
    mime: requireValue(oneOf(value.mime, ["audio/mpeg", "audio/wav"])),
    durationMs: requireValue(integer(value.durationMs)),
  };
}
function parseOccurrence(value: unknown, ordinal: number): ClientListeningOccurrence {
  if (
    !exact(value, [
      "occurrenceId",
      "ordinal",
      "family",
      "contentRevisionId",
      "stimulusId",
      "itemIds",
      "candidates",
      "allowedPlayCount",
      "authoredSpeedRatio",
      "ordinalPolicies",
      "seekingAllowed",
      "pauseAllowed",
      "transcriptPhase",
      "responseWindow",
    ]) ||
    !Array.isArray(value.itemIds) ||
    !Array.isArray(value.candidates) ||
    !Array.isArray(value.ordinalPolicies) ||
    !exact(value.responseWindow, ["readBeforeMs", "respondAfterMs"])
  )
    reject();
  const itemIds = value.itemIds.map((item) => requireValue(identifier(item)));
  const candidates = value.candidates.map(parseCandidate);
  const ordinalPolicies = value.ordinalPolicies.map((policy) => {
    if (!exact(policy, ["playOrdinal", "evidenceCondition", "requiresCompletedOrdinal"])) reject();
    return {
      playOrdinal: requireValue(integer(policy.playOrdinal, 1)),
      evidenceCondition: requireValue(
        oneOf(policy.evidenceCondition, ["authored_opportunity", "assisted_extra"]),
      ),
      requiresCompletedOrdinal:
        policy.requiresCompletedOrdinal === null
          ? null
          : requireValue(integer(policy.requiresCompletedOrdinal, 1)),
    };
  });
  const allowedPlayCount = requireValue(integer(value.allowedPlayCount, 1));
  if (
    value.ordinal !== ordinal ||
    itemIds.length === 0 ||
    new Set(itemIds).size !== itemIds.length ||
    candidates.length === 0 ||
    new Set(candidates.map((candidate) => candidate.mediaRevisionId)).size !== candidates.length ||
    ordinalPolicies.length !== allowedPlayCount ||
    ordinalPolicies.some((policy, index) => policy.playOrdinal !== index + 1)
  )
    reject();
  return {
    occurrenceId: requireValue(identifier(value.occurrenceId)),
    ordinal,
    family: requireValue(oneOf(value.family, ["H1", "H2", "H3"])),
    contentRevisionId: requireValue(identifier(value.contentRevisionId)),
    stimulusId: requireValue(text(value.stimulusId)),
    itemIds,
    candidates,
    allowedPlayCount,
    authoredSpeedRatio: requireValue(positive(value.authoredSpeedRatio)),
    ordinalPolicies,
    seekingAllowed: typeof value.seekingAllowed === "boolean" ? value.seekingAllowed : reject(),
    pauseAllowed: typeof value.pauseAllowed === "boolean" ? value.pauseAllowed : reject(),
    transcriptPhase: requireValue(
      oneOf(value.transcriptPhase, ["never", "after_attempt", "after_block"]),
    ),
    responseWindow: {
      readBeforeMs: requireValue(integer(value.responseWindow.readBeforeMs)),
      respondAfterMs: requireValue(integer(value.responseWindow.respondAfterMs)),
    },
  };
}
function parsePlan(value: unknown): ClientListeningPlan {
  const optionalForm = own(value) && "formId" in value;
  const keys = [
    "contractMajor",
    "listeningPlanId",
    "attemptId",
    "servingManifestId",
    ...(optionalForm ? ["formId"] : []),
    "planVersion",
    "targetBlueprintVersion",
    "evidenceRole",
    "progressionProfile",
    "practiceKind",
    "occurrences",
    "preflightPolicyRef",
    "playbackPolicyRef",
    "timerPolicyRef",
    "issuedAt",
    "expiresAt",
    "revocationState",
  ];
  if (!exact(value, keys) || !Array.isArray(value.occurrences)) reject();
  const occurrences = value.occurrences.map((occurrence, index) =>
    parseOccurrence(occurrence, index + 1),
  );
  const plan = {
    contractMajor: value.contractMajor === 1 ? (1 as const) : reject(),
    listeningPlanId: requireValue(identifier(value.listeningPlanId)),
    attemptId: requireValue(identifier(value.attemptId)),
    servingManifestId: requireValue(identifier(value.servingManifestId)),
    ...(optionalForm ? { formId: requireValue(identifier(value.formId)) } : {}),
    planVersion: requireValue(text(value.planVersion)),
    targetBlueprintVersion: requireValue(text(value.targetBlueprintVersion)),
    evidenceRole: requireValue(
      oneOf(value.evidenceRole, [
        "learning_practice",
        "repair_check",
        "independent_practice",
        "mini_mock",
        "section_mock",
        "full_mock",
        "booking_confirmation",
      ]),
    ),
    progressionProfile: requireValue(
      oneOf(value.progressionProfile, ["P0", "P1", "P2", "P3", "P4"]),
    ),
    practiceKind: requireValue(
      oneOf(value.practiceKind, ["ordinary", "target_probe", "target_block"]),
    ),
    occurrences,
    preflightPolicyRef: requireValue(text(value.preflightPolicyRef)),
    playbackPolicyRef: requireValue(text(value.playbackPolicyRef)),
    timerPolicyRef: requireValue(text(value.timerPolicyRef)),
    issuedAt: requireValue(instant(value.issuedAt)),
    expiresAt: requireValue(instant(value.expiresAt)),
    revocationState: requireValue(
      oneOf(value.revocationState, ["active", "revoked_before_start", "revoked_after_pin"]),
    ),
  };
  if (
    occurrences.length === 0 ||
    occurrences.length > 32 ||
    new Set(occurrences.map((occurrence) => occurrence.occurrenceId)).size !== occurrences.length ||
    new Set(occurrences.flatMap((occurrence) => occurrence.itemIds)).size !==
      occurrences.flatMap((occurrence) => occurrence.itemIds).length ||
    Date.parse(plan.expiresAt) <= Date.parse(plan.issuedAt) ||
    (plan.progressionProfile === "P4") !== (plan.practiceKind === "target_block") ||
    (plan.practiceKind === "target_probe" && plan.progressionProfile !== "P3")
  )
    reject();
  return plan;
}

function parsePreflightReceipt(value: unknown): ClientMediaPreflightReceipt {
  if (
    !exact(value, [
      "contractMajor",
      "receiptId",
      "listeningPlanId",
      "operationId",
      "resourceVersion",
      "observationDigest",
      "context",
      "outcome",
      "reasons",
      "issuedAt",
      "expiresAt",
    ]) ||
    !Array.isArray(value.reasons)
  )
    reject();
  const reasons = value.reasons.map((reason) =>
    requireValue(
      oneOf(reason, [
        "policy_changed",
        "plan_expired",
        "candidate_mismatch",
        "integrity_failed",
        "decode_failed",
        "handle_missing",
        "output_unconfirmed",
        "outbox_unavailable",
        "context_changed",
        "media_unavailable",
      ]),
    ),
  );
  return {
    contractMajor: value.contractMajor === 1 ? (1 as const) : reject(),
    receiptId: requireValue(identifier(value.receiptId)),
    listeningPlanId: requireValue(identifier(value.listeningPlanId)),
    operationId: requireValue(identifier(value.operationId)),
    resourceVersion: requireValue(integer(value.resourceVersion, 1)),
    observationDigest: requireValue(hash(value.observationDigest)),
    context: parseContext(value.context),
    outcome: requireValue(
      oneOf(value.outcome, ["ready", "retryable", "unavailable_affected_activity"]),
    ),
    reasons,
    issuedAt: requireValue(instant(value.issuedAt)),
    expiresAt: requireValue(instant(value.expiresAt)),
  };
}
function parsePlaybackReceipt(value: unknown): ClientPlaybackReceipt {
  if (
    !exact(value, [
      "operationId",
      "listeningPlanId",
      "occurrenceId",
      "playOrdinal",
      "resourceVersion",
      "event",
      "localIntentId",
      "recordedAt",
      "mayStartNow",
      "authorizationExpiresAt",
      "affectedItemIds",
      "phase",
    ]) ||
    !Array.isArray(value.affectedItemIds)
  )
    reject();
  return {
    operationId: requireValue(identifier(value.operationId)),
    listeningPlanId: requireValue(identifier(value.listeningPlanId)),
    occurrenceId: requireValue(identifier(value.occurrenceId)),
    playOrdinal: requireValue(integer(value.playOrdinal, 1)),
    resourceVersion: requireValue(integer(value.resourceVersion, 1)),
    event: requireValue(oneOf(value.event, ["start_intent", "started", "completed", "failed"])),
    localIntentId: requireValue(identifier(value.localIntentId)),
    recordedAt: requireValue(instant(value.recordedAt)),
    mayStartNow: typeof value.mayStartNow === "boolean" ? value.mayStartNow : reject(),
    authorizationExpiresAt: requireValue(instant(value.authorizationExpiresAt)),
    affectedItemIds: value.affectedItemIds.map((item) => requireValue(identifier(item))),
    phase: requireValue(
      oneOf(value.phase, ["ready", "begin_recorded", "playing", "block_complete", "interrupted"]),
    ),
  };
}

export function parseListeningPlanView(value: unknown): ClientListeningPlanView {
  if (
    !exact(value, [
      "plan",
      "resourceVersion",
      "phase",
      "outputProbeRevisionId",
      "latestPreflight",
      "playback",
    ]) ||
    !Array.isArray(value.playback)
  )
    reject();
  const plan = parsePlan(value.plan);
  const latestPreflight =
    value.latestPreflight === null ? null : parsePreflightReceipt(value.latestPreflight);
  const playback = value.playback.map(parsePlaybackReceipt);
  const resourceVersion = requireValue(integer(value.resourceVersion));
  if (
    (latestPreflight && latestPreflight.listeningPlanId !== plan.listeningPlanId) ||
    playback.some(
      (receipt) =>
        receipt.listeningPlanId !== plan.listeningPlanId ||
        receipt.resourceVersion > resourceVersion ||
        !plan.occurrences.some(
          (occurrence) =>
            occurrence.occurrenceId === receipt.occurrenceId &&
            receipt.playOrdinal <= occurrence.allowedPlayCount,
        ),
    )
  )
    reject();
  return {
    plan,
    resourceVersion,
    phase: requireValue(
      oneOf(value.phase, ["ready", "begin_recorded", "playing", "block_complete", "interrupted"]),
    ),
    outputProbeRevisionId: requireValue(identifier(value.outputProbeRevisionId)),
    latestPreflight,
    playback,
  };
}

export async function parseBoundPreflightReceipt(
  value: unknown,
  command: MediaPreflightObservation,
  digestFor: (value: string) => Promise<string>,
  canonicalCommand: string,
): Promise<ClientMediaPreflightReceipt> {
  const receipt = parsePreflightReceipt(value);
  if (
    receipt.operationId !== command.operationId ||
    receipt.listeningPlanId !== command.listeningPlanId ||
    receipt.resourceVersion !== command.expectedVersion + 1 ||
    receipt.observationDigest !== (await digestFor(canonicalCommand)) ||
    receipt.context.contextId !== command.context.contextId ||
    receipt.context.environmentChangeCounter !== command.context.environmentChangeCounter
  )
    reject();
  return receipt;
}

export function parseBoundPlaybackReceipt(
  value: unknown,
  command: PlaybackOccurrenceCommand,
): ClientPlaybackReceipt {
  const receipt = parsePlaybackReceipt(value);
  if (
    receipt.operationId !== command.operationId ||
    receipt.listeningPlanId !== command.listeningPlanId ||
    receipt.resourceVersion !== command.expectedVersion + 1 ||
    receipt.localIntentId !== command.localIntentId ||
    receipt.occurrenceId !== command.occurrenceId ||
    receipt.playOrdinal !== command.playOrdinal ||
    receipt.event !== command.event
  )
    reject();
  return receipt;
}

export function parseTranscriptReveal(value: unknown): ClientTranscriptReveal {
  if (
    !exact(value, [
      "transcriptRevisionId",
      "mediaRevisionId",
      "kind",
      "language",
      "digest",
      "authorizedPhase",
      "text",
    ])
  )
    reject();
  const revealed = {
    transcriptRevisionId: requireValue(identifier(value.transcriptRevisionId)),
    mediaRevisionId: requireValue(identifier(value.mediaRevisionId)),
    kind: requireValue(oneOf(value.kind, ["target_transcript", "focused_repair_excerpt"])),
    language: value.language === "de" ? ("de" as const) : reject(),
    digest: requireValue(hash(value.digest)),
    authorizedPhase: requireValue(oneOf(value.authorizedPhase, ["after_attempt", "after_block"])),
    text:
      typeof value.text === "string" &&
      value.text.length > 0 &&
      value.text.length <= 100_000 &&
      !hasUnsafeControl(value.text)
        ? value.text
        : reject(),
  };
  return revealed;
}

function hasUnsafeControl(value: string) {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (
      (code >= 0 && code <= 8) ||
      (code >= 11 && code <= 12) ||
      (code >= 14 && code <= 31) ||
      code === 127
    )
      return true;
  }
  return false;
}
