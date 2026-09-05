"use client";

import type { ListeningPlanView } from "@bestehen/application";
import { transcriptRevealSchema } from "@bestehen/contracts";
import { NativeButton } from "@bestehen/design-system";
import { useState } from "react";
import { listeningDigest } from "./listening-controller";

/** Result-only entry point. Neither plans nor transcripts are prefetched. */
export function ListeningTranscriptIsland({ attemptId }: { readonly attemptId: string }) {
  const [texts, setTexts] = useState<readonly { id: string; text: string }[]>([]);
  const [state, setState] = useState(
    "Transcripts remain subject to the server's submission and block gates.",
  );
  const [pending, setPending] = useState(false);
  async function reveal() {
    setPending(true);
    try {
      const options = { credentials: "same-origin", cache: "no-store" } as const;
      const response = await fetch(`/api/v1/attempts/${attemptId}/listening-plan`, options);
      if (!response.ok) throw new Error("Unavailable");
      const view = (await response.json()) as ListeningPlanView;
      const revealed: { id: string; text: string }[] = [];
      for (const occurrence of view.plan.occurrences) {
        const candidate = occurrence.candidates[0];
        if (!candidate) throw new Error("No bound transcript");
        const result = await fetch(
          `/api/v1/listening-plans/${view.plan.listeningPlanId}/transcripts/${candidate.mediaRevisionId}`,
          options,
        );
        if (!result.ok) throw new Error("Phase unavailable");
        const transcript = transcriptRevealSchema.parse(await result.json());
        if (
          transcript.mediaRevisionId !== candidate.mediaRevisionId ||
          (await listeningDigest(transcript.text)) !== transcript.digest
        )
          throw new Error("Integrity");
        revealed.push({ id: transcript.transcriptRevisionId, text: transcript.text });
      }
      setTexts(revealed);
      setState("Authorized transcript");
    } catch {
      setState(
        "The transcript is not available in this phase or under its current rights. Your result is unchanged.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <section aria-label="Listening transcript">
      <NativeButton disabled={pending} onClick={() => void reveal()}>
        Request authorized transcript
      </NativeButton>
      <p role="status">{state}</p>
      {texts.map((transcript) => (
        <p lang="de" key={transcript.id}>
          {transcript.text}
        </p>
      ))}
    </section>
  );
}
