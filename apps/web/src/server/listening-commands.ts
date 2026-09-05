import { authorize, type ListeningPlanView, type PlaybackReceipt } from "@bestehen/application";
import {
  mediaPreflightObservationSchema,
  playbackOccurrenceCommandSchema,
  type MediaPreflightObservation,
  type MediaPreflightReceipt,
  type PlaybackOccurrenceCommand,
} from "@bestehen/contracts";
import type { AuthorizedScope } from "@bestehen/domain";
import { isDatabaseAppId } from "./attempt-commands";

export interface ListeningCommandDependencies {
  authenticate(token: string | undefined): Promise<AuthorizedScope | undefined>;
  readonly now: () => Date;
  readonly runtime: {
    readPlan(scope: AuthorizedScope, attemptId: string): Promise<ListeningPlanView>;
    preflight(
      scope: AuthorizedScope,
      input: MediaPreflightObservation,
    ): Promise<MediaPreflightReceipt>;
    playback(scope: AuthorizedScope, input: PlaybackOccurrenceCommand): Promise<PlaybackReceipt>;
    audio(
      scope: AuthorizedScope,
      planId: string,
      mediaId: string,
    ): Promise<{ bytes: Uint8Array; mime: string }>;
    transcript(scope: AuthorizedScope, planId: string, mediaId: string): Promise<unknown>;
  };
}
export const listeningPrivateHeaders = {
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
};
const unavailable = () =>
  Response.json({ status: "not_available" }, { status: 404, headers: listeningPrivateHeaders });

export async function handleListeningCommand(
  dependencies: ListeningCommandDependencies,
  token: string | undefined,
  kind: "plan" | "preflight" | "playback" | "audio" | "transcript",
  resourceId: string,
  raw?: unknown,
  mediaId?: string,
): Promise<Response> {
  const scope = await dependencies.authenticate(token).catch(() => undefined);
  const auth = authorize(scope, "media:authorize", {}, dependencies.now());
  if (
    !auth.ok ||
    !isDatabaseAppId(resourceId) ||
    (mediaId !== undefined && !isDatabaseAppId(mediaId))
  )
    return unavailable();
  try {
    let value: unknown;
    if (kind === "plan") value = await dependencies.runtime.readPlan(auth.value, resourceId);
    else if (kind === "audio") {
      if (!mediaId) return unavailable();
      const result = await dependencies.runtime.audio(auth.value, resourceId, mediaId);
      return new Response(new Uint8Array(result.bytes), {
        headers: {
          ...listeningPrivateHeaders,
          "content-type": result.mime,
          "content-length": String(result.bytes.length),
        },
      });
    } else if (kind === "transcript") {
      if (!mediaId) return unavailable();
      value = await dependencies.runtime.transcript(auth.value, resourceId, mediaId);
    } else {
      const command =
        kind === "preflight"
          ? mediaPreflightObservationSchema.safeParse(raw)
          : playbackOccurrenceCommandSchema.safeParse(raw);
      if (!command.success || command.data.listeningPlanId !== resourceId)
        return Response.json(
          { status: "malformed_request" },
          { status: 400, headers: listeningPrivateHeaders },
        );
      value =
        kind === "preflight"
          ? await dependencies.runtime.preflight(
              auth.value,
              command.data as MediaPreflightObservation,
            )
          : await dependencies.runtime.playback(
              auth.value,
              command.data as PlaybackOccurrenceCommand,
            );
    }
    return Response.json(value, { headers: listeningPrivateHeaders });
  } catch (error) {
    const reason =
      error && typeof error === "object" && "reason" in error ? error.reason : undefined;
    if (reason === "conflict" || reason === "idempotency_conflict")
      return Response.json({ status: reason }, { status: 409, headers: listeningPrivateHeaders });
    return unavailable();
  }
}
