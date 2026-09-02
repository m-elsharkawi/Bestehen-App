"use client";

import type { SafeContentNode, TaskFamily } from "@bestehen/content";
import { NativeButton } from "@bestehen/design-system";
import type { ReactNode } from "react";
import { useState } from "react";

function SafeNodes({ nodes }: { readonly nodes: readonly SafeContentNode[] }): ReactNode {
  return nodes.map((node, index) => {
    const key = `${node.kind}-${index}`;
    switch (node.kind) {
      case "inline_text":
        return node.text;
      case "paragraph":
        return (
          <p key={key}>
            <SafeNodes nodes={node.children} />
          </p>
        );
      case "heading": {
        const contents = <SafeNodes nodes={node.children} />;
        if (node.level === 2) return <h2 key={key}>{contents}</h2>;
        if (node.level === 3) return <h3 key={key}>{contents}</h3>;
        return <h4 key={key}>{contents}</h4>;
      }
      case "emphasis":
        return node.role === "strong" ? (
          <strong key={key}>
            <SafeNodes nodes={node.children} />
          </strong>
        ) : (
          <em key={key}>
            <SafeNodes nodes={node.children} />
          </em>
        );
      case "quote":
        return (
          <blockquote key={key}>
            <SafeNodes nodes={node.children} />
          </blockquote>
        );
      case "list": {
        const items = node.items.map((item) => (
          <li key={JSON.stringify(item)}>
            <SafeNodes nodes={[item]} />
          </li>
        ));
        return node.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>;
      }
      case "semantic_group":
        return (
          <div key={key}>
            <SafeNodes nodes={node.children} />
          </div>
        );
      case "cloze_anchor":
        return <span key={key}>Gap {node.gapId}: _____</span>;
      case "evidence_anchor_placeholder":
        return null;
    }
    return null;
  });
}

function safeNodeText(nodes: readonly SafeContentNode[]): string {
  return nodes
    .map((node) => {
      switch (node.kind) {
        case "inline_text":
          return node.text;
        case "paragraph":
        case "heading":
        case "emphasis":
        case "quote":
        case "semantic_group":
          return safeNodeText(node.children);
        case "list":
          return safeNodeText(node.items);
        case "cloze_anchor":
          return `Gap ${node.gapId}`;
        case "evidence_anchor_placeholder":
          return "";
      }
      return "";
    })
    .filter(Boolean)
    .join(" ");
}

function LearnerMaterial({ payload }: { readonly payload: TaskFamily }) {
  switch (payload.kind) {
    case "R1HeadingMatching":
      return payload.texts.map((text) => (
        <section key={text.stimulusId}>
          <SafeNodes nodes={text.safeContentNodes} />
        </section>
      ));
    case "R2DetailedSelect":
      return <SafeNodes nodes={payload.stimulus.safeContentNodes} />;
    case "R3SituationNoticeMatching":
      return (
        <>
          {payload.situations.map((situation) => (
            <SafeNodes key={situation.promptId} nodes={situation.safeContentNodes} />
          ))}
          {payload.notices.map((notice) => (
            <SafeNodes key={notice.stimulusId} nodes={notice.safeContentNodes} />
          ))}
        </>
      );
    case "SB1ContextualGrammarCloze":
    case "SB2SharedBankLexicalCloze":
      return <SafeNodes nodes={payload.connectedText.safeContentNodes} />;
    case "H1ShortAnnouncements":
      return payload.announcements.map((announcement) => (
        <SafeNodes key={announcement.stimulusId} nodes={announcement.writtenInstructionNodes} />
      ));
    case "H2ConversationInterview":
      return <SafeNodes nodes={payload.conversation.writtenInstructionNodes} />;
    case "H3ShortFunctionalTexts":
      return payload.texts.map((text) => (
        <SafeNodes key={text.stimulusId} nodes={text.writtenInstructionNodes} />
      ));
  }
}

export function ObjectiveResponseIsland({
  payload,
  action,
  attemptId,
  expectedVersion,
  sequence,
  startedAt,
}: {
  readonly payload: TaskFamily;
  readonly action: (formData: FormData) => void | Promise<void>;
  readonly attemptId: string;
  readonly expectedVersion: number;
  readonly sequence: number;
  readonly startedAt: string;
}) {
  const [status, setStatus] = useState("Choose an answer, then submit.");
  const selects =
    payload.kind === "R2DetailedSelect" ||
    payload.kind === "H1ShortAnnouncements" ||
    payload.kind === "H2ConversationInterview" ||
    payload.kind === "H3ShortFunctionalTexts"
      ? payload.questions
      : [];
  return (
    <form action={action} onChange={() => setStatus("Answer selected. Ready to submit.")}>
      <input name="attemptId" type="hidden" value={attemptId} />
      <input name="expectedVersion" type="hidden" value={expectedVersion} />
      <input name="sequence" type="hidden" value={sequence} />
      <input name="startedAt" type="hidden" value={startedAt} />
      <LearnerMaterial payload={payload} />
      {selects.map((question) => (
        <fieldset key={question.itemRef}>
          <legend>{safeNodeText(question.questionNodes)}</legend>
          {question.options.map((option) => (
            <label key={option.optionId}>
              <input
                name={`select:${question.itemRef}`}
                required
                type="radio"
                value={option.optionId}
              />
              <SafeNodes nodes={option.learnerSafeLabel} />
            </label>
          ))}
        </fieldset>
      ))}
      {payload.kind === "SB1ContextualGrammarCloze"
        ? payload.gaps.map((gap) => (
            <label key={gap.itemRef}>
              Gap {gap.gapId}
              <select name={`candidate:${gap.itemRef}:${gap.gapId}`} required>
                <option value="">Choose</option>
                {gap.options.map((option) => (
                  <option key={option.optionId} value={option.optionId}>
                    {safeNodeText(option.learnerSafeLabel)}
                  </option>
                ))}
              </select>
            </label>
          ))
        : null}
      {payload.kind === "SB2SharedBankLexicalCloze"
        ? payload.gaps.map((gap) => (
            <label key={gap.itemRef}>
              Gap {gap.gapId}
              <select name={`candidate:${gap.itemRef}:${gap.gapId}`} required>
                <option value="">Choose</option>
                {payload.candidateBank.map((option) => (
                  <option key={option.optionId} value={option.optionId}>
                    {safeNodeText(option.learnerSafeLabel)}
                  </option>
                ))}
              </select>
            </label>
          ))
        : null}
      {payload.kind === "R1HeadingMatching"
        ? payload.itemBindings.map((binding) => (
            <label key={binding.itemRef}>
              Text {binding.leftId}
              <select name={`match:${binding.itemRef}:${binding.leftId}`} required>
                <option value="">Choose</option>
                {payload.headings.map((option) => (
                  <option key={option.optionId} value={option.optionId}>
                    {safeNodeText(option.learnerSafeLabel)}
                  </option>
                ))}
              </select>
            </label>
          ))
        : null}
      {payload.kind === "R3SituationNoticeMatching"
        ? payload.itemBindings.map((binding) => (
            <label key={binding.itemRef}>
              Situation {binding.leftId}
              <select name={`match:${binding.itemRef}:${binding.leftId}`} required>
                <option value="">Choose</option>
                {payload.notices.map((notice) => (
                  <option key={notice.stimulusId} value={notice.stimulusId}>
                    {notice.stimulusId}
                  </option>
                ))}
                {payload.noMatchOption ? (
                  <option value="no_match">
                    {safeNodeText(payload.noMatchOption.learnerSafeLabel)}
                  </option>
                ) : null}
              </select>
            </label>
          ))
        : null}
      <p aria-live="polite">{status}</p>
      <NativeButton type="submit">Submit answer</NativeButton>
    </form>
  );
}
