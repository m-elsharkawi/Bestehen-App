import type { ListeningPlanView, PlaybackReceipt } from "@bestehen/application";
import type {
  MediaPreflightObservation,
  MediaPreflightReceipt,
  PlaybackOccurrenceCommand,
} from "@bestehen/contracts";

export const listeningTestAttemptId = "11111111-1111-4111-8111-111111111111";
const id = (n: number) => `22222222-2222-4222-8222-${n.toString().padStart(12, "0")}`;

/** Technical non-speech PCM tone. Never approved Listening content or owner evidence. */
export function technicalListeningWav(durationMs = 1000): ArrayBuffer {
  const samples = Math.round((16000 * durationMs) / 1000);
  const bytes = new ArrayBuffer(44 + samples * 2);
  const data = new DataView(bytes);
  const text = (at: number, value: string) =>
    [...value].forEach((c, i) => {
      data.setUint8(at + i, c.charCodeAt(0));
    });
  text(0, "RIFF");
  data.setUint32(4, bytes.byteLength - 8, true);
  text(8, "WAVE");
  text(12, "fmt ");
  data.setUint32(16, 16, true);
  data.setUint16(20, 1, true);
  data.setUint16(22, 1, true);
  data.setUint32(24, 16000, true);
  data.setUint32(28, 32000, true);
  data.setUint16(32, 2, true);
  data.setUint16(34, 16, true);
  text(36, "data");
  data.setUint32(40, samples * 2, true);
  for (let i = 0; i < samples; i++)
    data.setInt16(44 + i * 2, Math.round(Math.sin((i * 2 * Math.PI * 220) / 16000) * 1200), true);
  return bytes;
}
export function technicalListeningPlan(
  digest: string,
  bytes: number,
  durationMs = 1000,
): ListeningPlanView {
  return {
    plan: {
      contractMajor: 1,
      listeningPlanId: id(1),
      attemptId: listeningTestAttemptId,
      servingManifestId: id(2),
      planVersion: "listening-plan/v1",
      targetBlueprintVersion: "test/v1",
      evidenceRole: "learning_practice",
      progressionProfile: "P3",
      practiceKind: "target_probe",
      occurrences: [
        {
          occurrenceId: id(3),
          ordinal: 1,
          family: "H1",
          contentRevisionId: id(4),
          stimulusId: "technical-non-speech",
          itemIds: [id(5)],
          candidates: [
            {
              assetId: id(6),
              manifestRevision: "technical/v1",
              manifestDigest: "a".repeat(64),
              mediaRevisionId: id(7),
              digest,
              bytes,
              mime: "audio/wav",
              durationMs,
            },
          ],
          allowedPlayCount: 1,
          authoredSpeedRatio: 1,
          ordinalPolicies: [
            {
              playOrdinal: 1,
              evidenceCondition: "authored_opportunity",
              requiresCompletedOrdinal: null,
            },
          ],
          seekingAllowed: false,
          pauseAllowed: false,
          transcriptPhase: "after_attempt",
          responseWindow: { readBeforeMs: 0, respondAfterMs: 0 },
        },
      ],
      preflightPolicyRef: "listening-preflight/v1",
      playbackPolicyRef: "listening-playback/v1",
      timerPolicyRef: "listening-timer/v1",
      issuedAt: new Date(Date.now() - 1000).toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      revocationState: "active",
    },
    resourceVersion: 0,
    phase: "ready",
    outputProbeRevisionId: "a8ddcbe4-5a3b-5841-a123-0d558ab659ad",
    latestPreflight: null,
    playback: [],
  };
}
export function technicalPreflightReceipt(
  command: MediaPreflightObservation,
  view: ListeningPlanView,
  digest: string,
): MediaPreflightReceipt {
  return {
    contractMajor: 1,
    receiptId: id(8),
    listeningPlanId: command.listeningPlanId,
    operationId: command.operationId,
    resourceVersion: command.expectedVersion + 1,
    observationDigest: digest,
    context: command.context,
    outcome: "ready",
    reasons: [],
    issuedAt: new Date().toISOString(),
    expiresAt: view.plan.expiresAt,
  };
}
export function technicalPlaybackReceipt(
  command: PlaybackOccurrenceCommand,
  view: ListeningPlanView,
): PlaybackReceipt {
  return {
    operationId: command.operationId,
    listeningPlanId: command.listeningPlanId,
    occurrenceId: command.occurrenceId,
    playOrdinal: command.playOrdinal,
    resourceVersion: command.expectedVersion + 1,
    event: command.event,
    localIntentId: command.localIntentId,
    recordedAt: new Date().toISOString(),
    mayStartNow: command.event === "start_intent",
    authorizationExpiresAt: view.plan.expiresAt,
    affectedItemIds: command.event === "failed" ? (view.plan.occurrences[0]?.itemIds ?? []) : [],
    phase:
      command.event === "start_intent"
        ? "begin_recorded"
        : command.event === "started"
          ? "playing"
          : command.event === "failed"
            ? "interrupted"
            : "block_complete",
  };
}
