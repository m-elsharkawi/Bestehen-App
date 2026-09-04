import { safeContentText, type SafeContentNode, type TaskFamily } from "@bestehen/content";
type ResultEntry = { readonly id: string; readonly text: string };

export interface LearnerResultProjection {
  readonly validityScope: readonly ResultEntry[];
  readonly decisiveEvidence: readonly ResultEntry[];
  readonly outcomes: readonly ResultEntry[];
  readonly rationales: readonly ResultEntry[];
  readonly causes: readonly ResultEntry[];
  readonly repair: string;
}

export interface LearnerResultInput {
  readonly canonicalResponse: unknown;
  readonly unitOutcomes: readonly {
    readonly contentItemId: string;
    readonly kind: "correct" | "incorrect" | "blank" | "structurally_invalid";
  }[];
  readonly validity: {
    readonly affectedScope: readonly string[];
    readonly unaffectedScope: readonly string[];
  };
}

export interface LearnerResultEvidence {
  readonly contentItemId: string;
  readonly decisiveEvidence: unknown;
  readonly distractorRationale: unknown;
}

const maximumEntries = 100;
const maximumAuthoredEntries = 20;
const maximumTextLength = 4_000;

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximumTextLength
    ? value
    : undefined;
}

function strings(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.slice(0, maximumEntries).flatMap((entry) => (text(entry) ? [entry] : []))
    : [];
}

function selectedResponses(value: unknown): {
  readonly selections: Readonly<Record<string, string>>;
  readonly matches: Readonly<Record<string, string>>;
  readonly placements: readonly { readonly itemId: string; readonly candidateId: string }[];
} {
  const response = record(value);
  const identifiers = (raw: unknown, field: "rightId" | "candidateId" = "rightId") => {
    const values = record(raw);
    if (!values) return {};
    const parsed: Record<string, string> = {};
    for (const [itemId, item] of Object.entries(values).slice(0, maximumEntries)) {
      const id = text(itemId);
      const candidate = field === "rightId" ? text(record(item)?.rightId) : text(item);
      if (id && candidate) parsed[id] = candidate;
    }
    return parsed;
  };
  const placements = record(response?.placements);
  return {
    selections: identifiers(response?.selections, "candidateId"),
    matches: identifiers(response?.matches),
    placements: placements
      ? Object.values(placements)
          .slice(0, maximumEntries)
          .flatMap((entry) => {
            const placement = record(entry);
            const itemId = text(placement?.itemId);
            const candidateId = text(placement?.candidateId);
            return itemId && candidateId ? [{ itemId, candidateId }] : [];
          })
      : [],
  };
}

function responseLabel(payload: TaskFamily, itemId: string, optionId: string | undefined): string {
  if (!optionId) return "";
  const label = (
    options: readonly {
      readonly optionId: string;
      readonly learnerSafeLabel: readonly SafeContentNode[];
    }[],
  ) => options.find((option) => option.optionId === optionId);
  switch (payload.kind) {
    case "R1HeadingMatching":
      return safeContentText(label(payload.headings)?.learnerSafeLabel ?? []);
    case "R2DetailedSelect":
    case "H1ShortAnnouncements":
    case "H2ConversationInterview":
    case "H3ShortFunctionalTexts":
      return safeContentText(
        label(payload.questions.find((question) => question.itemRef === itemId)?.options ?? [])
          ?.learnerSafeLabel ?? [],
      );
    case "R3SituationNoticeMatching":
      if (optionId === "no_match")
        return safeContentText(payload.noMatchOption?.learnerSafeLabel ?? []);
      return safeContentText(
        payload.notices.find((notice) => notice.stimulusId === optionId)?.safeContentNodes ?? [],
      );
    case "SB1ContextualGrammarCloze":
      return safeContentText(
        label(payload.gaps.find((gap) => gap.itemRef === itemId)?.options ?? [])
          ?.learnerSafeLabel ?? [],
      );
    case "SB2SharedBankLexicalCloze":
      return safeContentText(label(payload.candidateBank)?.learnerSafeLabel ?? []);
  }
}

function selectedIdentifier(
  response: ReturnType<typeof selectedResponses>,
  itemId: string,
): string | undefined {
  return (
    response.selections[itemId] ??
    response.matches[itemId] ??
    response.placements.find((placement) => placement.itemId === itemId)?.candidateId
  );
}

function presentationByItem(
  payload: TaskFamily | undefined,
): Map<string, { label: string; order: number }> {
  if (!payload) return new Map();
  const entries =
    payload.kind === "R1HeadingMatching"
      ? payload.itemBindings.map((binding) => {
          const order = payload.texts.findIndex((text) => text.stimulusId === binding.leftId);
          return [binding.itemRef, `Text ${order >= 0 ? order + 1 : "recorded"}`, order] as const;
        })
      : payload.kind === "R3SituationNoticeMatching"
        ? payload.itemBindings.map((binding) => {
            const order = payload.situations.findIndex(
              (situation) => situation.promptId === binding.leftId,
            );
            const situation = payload.situations[order];
            return [
              binding.itemRef,
              `Situation ${order >= 0 ? order + 1 : "recorded"}: ${safeContentText(situation?.safeContentNodes ?? [])}`,
              order,
            ] as const;
          })
        : "questions" in payload
          ? payload.questions.map(
              (question, order) =>
                [
                  question.itemRef,
                  `Question ${order + 1}: ${safeContentText(question.questionNodes)}`,
                  order,
                ] as const,
            )
          : "gaps" in payload
            ? payload.gaps.map((gap, order) => [gap.itemRef, `Gap ${order + 1}`, order] as const)
            : [];
  return new Map(entries.map(([itemId, label, order]) => [itemId, { label, order }]));
}

function scopeEntries(
  scope: "affected" | "unaffected",
  itemIds: readonly string[],
  presentation: ReadonlyMap<string, { label: string; order: number }>,
): readonly ResultEntry[] {
  const prefix = scope === "affected" ? "Affected scope" : "Unaffected scope";
  const labels = itemIds
    .map((itemId) => presentation.get(itemId)?.label)
    .filter((label): label is string => Boolean(label));
  return [
    {
      id: `validity-${scope}`,
      text: labels.length
        ? `${prefix}: ${labels.join("; ")}.`
        : `${prefix}: no named learner-visible item.`,
    },
  ];
}

function decisiveEvidence(value: unknown): {
  readonly refs: readonly string[];
  readonly rationale?: string;
} {
  const evidence = record(value);
  const refs = Array.isArray(evidence?.refs)
    ? evidence.refs.slice(0, maximumAuthoredEntries).flatMap((entry) => {
        const relation = text(record(entry)?.safeRevealSpanOrRelation);
        return relation ? [relation] : [];
      })
    : [];
  const rationale = text(evidence?.rationale);
  return rationale ? { refs, rationale } : { refs };
}

function distractorRationale(value: unknown, optionId: string | undefined) {
  if (!optionId || !Array.isArray(value)) return undefined;
  return value.slice(0, maximumAuthoredEntries).flatMap((entry) => {
    const rationale = record(entry);
    return rationale && rationale.optionOrCandidateId === optionId
      ? [
          {
            whyPlausible: text(rationale.whyPlausible),
            decisiveMismatch: text(rationale.decisiveMismatch),
          },
        ]
      : [];
  })[0];
}

export function projectLearnerResult(
  submission: LearnerResultInput,
  evidence: readonly LearnerResultEvidence[],
  learnerPayload: TaskFamily | undefined,
): LearnerResultProjection {
  const byItem = new Map(evidence.map((entry) => [String(entry.contentItemId), entry]));
  const response = selectedResponses(submission.canonicalResponse);
  const presentation = presentationByItem(learnerPayload);
  const outcomes = [...submission.unitOutcomes]
    .sort(
      (left, right) =>
        (presentation.get(left.contentItemId)?.order ?? maximumEntries) -
        (presentation.get(right.contentItemId)?.order ?? maximumEntries),
    )
    .map((outcome) => {
      const itemId = String(outcome.contentItemId);
      const selected = selectedIdentifier(response, itemId);
      const itemLabel = presentation.get(itemId)?.label ?? "Recorded item";
      const label = learnerPayload ? responseLabel(learnerPayload, itemId, selected) : "";
      const evidenceForItem = byItem.get(itemId);
      const authored = decisiveEvidence(evidenceForItem?.decisiveEvidence);
      const rationale = distractorRationale(evidenceForItem?.distractorRationale, selected);
      const itemKey = `item-${itemId}`;
      const outcomeText =
        outcome.kind === "correct"
          ? `${itemLabel}: the recorded response${label ? ` “${label}”` : ""} fits.`
          : outcome.kind === "incorrect"
            ? `${itemLabel}: the recorded response${label ? ` “${label}”` : ""} does not fit.`
            : outcome.kind === "blank"
              ? `${itemLabel}: no response was recorded.`
              : `${itemLabel}: the response could not be interpreted.`;
      const rationaleText =
        outcome.kind === "correct"
          ? authored.rationale
            ? `Why this response fits: ${authored.rationale}`
            : "The recorded response fits this item."
          : outcome.kind === "incorrect" && rationale?.whyPlausible && rationale.decisiveMismatch
            ? `This response can seem plausible: ${rationale.whyPlausible} It does not fit because ${rationale.decisiveMismatch}`
            : outcome.kind === "blank"
              ? "No response was recorded, so there is no chosen-response rationale."
              : "The recorded response has no learner-safe rationale available for this item.";
      const evidenceText = authored.refs.length
        ? authored.refs.map((relation, relationIndex) => ({
            id: `${itemKey}-evidence-${relationIndex}`,
            text: relation,
          }))
        : [
            {
              id: `${itemKey}-evidence-fallback`,
              text: "The recorded decisive evidence is unavailable for this item.",
            },
          ];
      return {
        outcome: { id: `${itemKey}-outcome`, text: outcomeText },
        rationale: { id: `${itemKey}-rationale`, text: rationaleText },
        evidence: evidenceText,
      };
    });

  return {
    validityScope: [
      ...scopeEntries("affected", strings(submission.validity.affectedScope), presentation),
      ...scopeEntries("unaffected", strings(submission.validity.unaffectedScope), presentation),
    ],
    decisiveEvidence: outcomes.flatMap((outcome) => outcome.evidence),
    outcomes: outcomes.map((outcome) => outcome.outcome),
    rationales: outcomes.map((outcome) => outcome.rationale),
    causes: [
      {
        id: "unresolved-cause",
        text: "No supported diagnostic observation is recorded. One clarifying check: try one fresh equivalent item without answer-bearing help.",
      },
    ],
    repair:
      "Review the decisive evidence for the recorded item, then try one fresh equivalent item.",
  };
}
