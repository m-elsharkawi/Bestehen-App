import { notFound } from "next/navigation";
import {
  isSyntheticFixtureRequest,
  loadResultProjection,
  requirePersonalSession,
} from "../../../../../server/frontend-data";
import { ResultView } from "../../../../../ui/archetypes";

export default async function AttemptResultPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (await isSyntheticFixtureRequest()) {
    await requirePersonalSession(`/attempt/${id}/result`);
    return <ResultView />;
  }
  const projection = await loadResultProjection(id, `/attempt/${id}/result`);
  if (!projection) notFound();
  const readable = (value: unknown, fallback: string): string => {
    if (typeof value === "string" && value.trim()) return value;
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      for (const key of ["safeRevealSpanOrRelation", "whyItFails", "cause", "repair", "detail"]) {
        if (typeof record[key] === "string" && record[key]) return record[key];
      }
    }
    return fallback;
  };
  return (
    <ResultView
      decisiveEvidence={projection.evidence.map((entry) => ({
        relation: `${entry.contentItemId}:${readable(entry.decisiveEvidence, "recorded")}`,
        text: readable(entry.decisiveEvidence, "Recorded evidence is available."),
      }))}
      details={{
        outcomes: projection.submission.unitOutcomes.map((entry) =>
          entry.kind === "correct"
            ? "The recorded response fits."
            : entry.kind === "incorrect"
              ? "The recorded response does not fit."
              : entry.kind === "blank"
                ? "No response was recorded."
                : "This item could not be interpreted.",
        ),
        rationales: projection.evidence.map((entry) =>
          readable(
            entry.distractorRationale,
            "No distractor explanation is available for this item.",
          ),
        ),
        causes: projection.evidence.map((entry) =>
          readable(
            entry.intendedCauseMapping,
            "One clarifying check is needed before naming a cause.",
          ),
        ),
        repair:
          "Review the decisive relation, then try one fresh item without answer-bearing help.",
      }}
      validity={projection.submission.validity.state}
    />
  );
}
