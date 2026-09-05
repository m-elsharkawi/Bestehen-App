import type {
  ListeningPlan,
  MediaPreflightObservation,
  MediaPreflightReceipt,
  PlaybackOccurrenceCommand,
} from "@bestehen/contracts";

/** Private storage boundary: keys never leave the authenticated server. Missing adapters deny. */
export interface PrivateListeningBytes {
  read(objectKey: string, maximumBytes: number): Promise<Uint8Array | undefined>;
}

export interface PlaybackReceipt {
  readonly operationId: string;
  readonly listeningPlanId: string;
  readonly occurrenceId: string;
  readonly playOrdinal: number;
  readonly resourceVersion: number;
  readonly event: PlaybackOccurrenceCommand["event"];
  readonly localIntentId: string;
  readonly recordedAt: string;
  /** Recovery receipts record past facts and never authorize a native play now. */
  readonly mayStartNow: boolean;
  readonly authorizationExpiresAt: string;
  readonly affectedItemIds: readonly string[];
  readonly phase: "ready" | "begin_recorded" | "playing" | "block_complete" | "interrupted";
}

export interface ListeningPlanView {
  readonly plan: ListeningPlan;
  readonly resourceVersion: number;
  readonly phase: PlaybackReceipt["phase"];
  readonly outputProbeRevisionId: string;
  readonly latestPreflight: MediaPreflightReceipt | null;
  readonly playback: readonly PlaybackReceipt[];
}

/** A fixed, non-linguistic output-check tone. It is never task audio or learner evidence. */
export const listeningOutputProbeRevisionId = "a8ddcbe4-5a3b-5841-a123-0d558ab659ad";
export const listeningPolicies = {
  plan: "listening-plan/v1",
  preflight: "listening-preflight/v1",
  playback: "listening-playback/v1",
  timer: "listening-timer/v1",
} as const;

export function listeningOutboxProbePayload(
  observation: Pick<MediaPreflightObservation, "listeningPlanId" | "context" | "outboxProbe">,
) {
  return [
    "listening-outbox/v1",
    observation.listeningPlanId,
    observation.context.contextId,
    observation.context.environmentChangeCounter,
    observation.outboxProbe.operationId,
  ];
}

export function preflightReasons(
  plan: ListeningPlan,
  observation: MediaPreflightObservation,
  now: Date,
): MediaPreflightReceipt["reasons"] {
  const reasons = new Set<MediaPreflightReceipt["reasons"][number]>();
  if (plan.expiresAt <= now.toISOString() || plan.revocationState !== "active")
    reasons.add("plan_expired");
  if (
    observation.policyVersions.preflight !== plan.preflightPolicyRef ||
    observation.policyVersions.playback !== plan.playbackPolicyRef ||
    observation.policyVersions.timer !== plan.timerPolicyRef
  )
    reasons.add("policy_changed");
  // Exactly one actually decoded candidate per occurrence; alternate encodings are not extra tasks.
  if (
    observation.candidates.length !== plan.occurrences.length ||
    new Set(observation.candidates.map((c) => c.occurrenceId)).size !==
      observation.candidates.length
  )
    reasons.add("candidate_mismatch");
  for (const occurrence of plan.occurrences) {
    const result = observation.candidates.find((c) => c.occurrenceId === occurrence.occurrenceId);
    const candidate = occurrence.candidates.find(
      (c) => c.mediaRevisionId === result?.mediaRevisionId,
    );
    if (
      !candidate ||
      !result ||
      result.assetId !== candidate.assetId ||
      result.manifestRevision !== candidate.manifestRevision ||
      result.manifestDigest !== candidate.manifestDigest
    ) {
      reasons.add("candidate_mismatch");
      continue;
    }
    if (result.observedDigest !== candidate.digest || result.receivedBytes !== candidate.bytes)
      reasons.add("integrity_failed");
    if (result.loadResult !== "decoded" && result.loadResult !== "loaded")
      reasons.add("decode_failed");
    if (!result.retainedHandle) reasons.add("handle_missing");
    if (
      Date.parse(result.observedAt) > now.getTime() ||
      Date.parse(result.observedAt) < Date.parse(plan.issuedAt)
    )
      reasons.add("candidate_mismatch");
  }
  const output = observation.outputProbe;
  if (
    output.probeRevisionId !== listeningOutputProbeRevisionId ||
    output.playbackResult !== "completed" ||
    !output.completedAt ||
    !output.learnerConfirmedAt ||
    Date.parse(output.completedAt) < Date.parse(plan.issuedAt) ||
    Date.parse(output.completedAt) > Date.parse(output.learnerConfirmedAt) ||
    Date.parse(output.learnerConfirmedAt) > now.getTime()
  )
    reasons.add("output_unconfirmed");
  if (
    observation.outboxProbe.writeResult !== "committed_and_read_back" ||
    Date.parse(observation.outboxProbe.observedAt) > now.getTime() ||
    Date.parse(observation.outboxProbe.observedAt) < Date.parse(plan.issuedAt)
  )
    reasons.add("outbox_unavailable");
  return [...reasons].sort();
}
