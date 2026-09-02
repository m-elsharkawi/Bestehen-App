import type { ResponseOperation, TaskFamily } from "@bestehen/content";

/** Native controls and keyboard/pointer enhancement share these stable semantic names. */
export function responseFields(payload: TaskFamily): readonly string[] {
  if ("questions" in payload) return payload.questions.map((q) => `select:${q.itemRef}`);
  if ("gaps" in payload) return payload.gaps.map((g) => `candidate:${g.itemRef}:${g.gapId}`);
  return payload.itemBindings.map((b) => `match:${b.itemRef}:${b.leftId}`);
}

export function formOperations(
  values: Readonly<Record<string, string>>,
  boundary?: string,
): ResponseOperation[] {
  const operations: ResponseOperation[] = [];
  for (const name of Object.keys(values).sort()) {
    const value = values[name];
    if (!value) continue;
    const [kind, itemId, slot] = name.split(":");
    if (!itemId) continue;
    if (kind === "select") operations.push({ kind: "set_selection", itemId, optionId: value });
    if (kind === "candidate" && slot)
      operations.push({ kind: "place_candidate", itemId, gapId: slot, candidateId: value });
    if (kind === "match" && slot)
      operations.push({ kind: "set_match", itemId, leftId: slot, rightId: value });
  }
  // Even an all-blank snapshot is a captured checkpoint. Only the deliberate submit adds a boundary.
  if (boundary) operations.push({ kind: "confirm_boundary", boundaryId: boundary });
  return operations;
}

export function valuesFromOperations(
  operations: readonly ResponseOperation[],
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const op of operations) {
    if (op.kind === "set_selection") values[`select:${op.itemId}`] = op.optionId;
    if (op.kind === "set_match") values[`match:${op.itemId}:${op.leftId}`] = op.rightId;
    if (op.kind === "place_candidate")
      values[`candidate:${op.itemId}:${op.gapId}`] = op.candidateId;
    if (op.kind === "clear_selection") delete values[`select:${op.itemId}`];
    if (op.kind === "clear_match") delete values[`match:${op.itemId}:${op.leftId}`];
    if (op.kind === "remove_candidate") delete values[`candidate:${op.itemId}:${op.gapId}`];
    if (op.kind === "move_candidate") {
      const from = `candidate:${op.itemId}:${op.fromGapId}`;
      const value = values[from];
      if (value) values[`candidate:${op.itemId}:${op.toGapId}`] = value;
      delete values[from];
    }
  }
  return values;
}

export function responseIssues(
  payload: TaskFamily,
  values: Readonly<Record<string, string>>,
): readonly string[] {
  const issues: string[] = [];
  const used = new Set<string>();
  for (const name of responseFields(payload)) {
    const value = values[name];
    if (!value) continue;
    let choices: readonly string[] = [];
    if ("questions" in payload)
      choices =
        payload.questions
          .find((q) => name === `select:${q.itemRef}`)
          ?.options.map((o) => o.optionId) ?? [];
    else if (payload.kind === "SB1ContextualGrammarCloze")
      choices =
        payload.gaps
          .find((g) => name === `candidate:${g.itemRef}:${g.gapId}`)
          ?.options.map((o) => o.optionId) ?? [];
    else if (payload.kind === "SB2SharedBankLexicalCloze")
      choices = payload.candidateBank.map((o) => o.optionId);
    else if (payload.kind === "R1HeadingMatching")
      choices = payload.headings.map((o) => o.optionId);
    else if (payload.kind === "R3SituationNoticeMatching")
      choices = [
        ...payload.notices.map((n) => n.stimulusId),
        ...(payload.noMatchOption ? ["no_match"] : []),
      ];
    const noReuse =
      payload.kind === "SB2SharedBankLexicalCloze"
        ? payload.candidateReusePolicy === "at_most_once"
        : "matchConstraints" in payload &&
          payload.matchConstraints.rightReusePolicy === "at_most_once";
    if (!choices.includes(value) || (noReuse && value !== "no_match" && used.has(value)))
      issues.push(name);
    used.add(value);
  }
  return issues;
}

/** Only serializes the native adapter's set-only snapshot. Scoring/canonical operation rules remain server-owned. */
export async function formResponseDigest(
  values: Readonly<Record<string, string>>,
  boundary?: string,
): Promise<string> {
  const selections: Record<string, string> = {};
  const matches: Record<string, unknown> = {};
  const placements: Record<string, unknown> = {};
  for (const op of formOperations(values)) {
    if (op.kind === "set_selection") selections[op.itemId] = op.optionId;
    if (op.kind === "set_match") matches[op.itemId] = { leftId: op.leftId, rightId: op.rightId };
    if (op.kind === "place_candidate")
      placements[op.gapId] = { itemId: op.itemId, candidateId: op.candidateId };
  }
  const sorted = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sorted);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value)
          .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
          .map(([key, entry]) => [key, sorted(entry)]),
      );
    return value;
  };
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(
      JSON.stringify(
        sorted({
          selections,
          matches,
          placements,
          confirmedBoundaries: boundary ? [boundary] : [],
        }),
      ),
    ),
  );
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
