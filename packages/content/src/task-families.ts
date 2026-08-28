/**
 * The closed `TaskFamily` union (`Architecture/15-…` §5.2 for R1-R3/SB1-SB2 and
 * `Architecture/16-…` §6.2 for H1-H3).
 *
 * A `TaskFamily` value **is** the learner-safe payload. It carries instructions, sanitized
 * `SafeContentNode`s, option labels, response constraints and accessible relations — and nothing
 * else. No key, no correct flag, no decisive-anchor span, no distractor rationale, no scoring
 * weight, no operator note, no restricted source URL and no unpublished target mapping is
 * expressible here, because none of those types is reachable from this module.
 *
 * Counts, candidate reuse, no-match behaviour and playback opportunity are pinned from the verified
 * target release; P0-P3 variants use a different explicit task definition and progression profile
 * and can never be relabelled P4.
 */

import type { MediaRevisionId } from "@bestehen/domain";
import type { MatchConstraint, Option, SafeContentNode } from "./model.js";

export const taskFamilyKinds = [
  "R1HeadingMatching",
  "R2DetailedSelect",
  "R3SituationNoticeMatching",
  "SB1ContextualGrammarCloze",
  "SB2SharedBankLexicalCloze",
  "H1ShortAnnouncements",
  "H2ConversationInterview",
  "H3ShortFunctionalTexts",
] as const;
export type TaskFamilyKind = (typeof taskFamilyKinds)[number];

/** The five written families share one target block; the three listening families do not. */
export const writtenTaskFamilyKinds = [
  "R1HeadingMatching",
  "R2DetailedSelect",
  "R3SituationNoticeMatching",
  "SB1ContextualGrammarCloze",
  "SB2SharedBankLexicalCloze",
] as const satisfies readonly TaskFamilyKind[];

export const listeningTaskFamilyKinds = [
  "H1ShortAnnouncements",
  "H2ConversationInterview",
  "H3ShortFunctionalTexts",
] as const satisfies readonly TaskFamilyKind[];

export type ListeningTaskFamilyKind = (typeof listeningTaskFamilyKinds)[number];

/* ------------------------------------------------------------------------------------------------
 * Stimuli, gaps and bindings
 * ---------------------------------------------------------------------------------------------- */

export interface ReadingStimulus {
  readonly stimulusId: string;
  readonly safeContentNodes: readonly SafeContentNode[];
  readonly language: "de";
  readonly genreDomainRegister: string;
  /**
   * Anchor identities only. The decisive span itself lives in the server-only key revision and is
   * not revealable before finalization.
   */
  readonly evidenceAnchorIds: readonly string[];
}

export interface ClozeStimulus extends ReadingStimulus {
  /** Cloze stimuli are connected text; the gaps appear as `cloze_anchor` nodes inside the tree. */
  readonly connected: true;
}

/**
 * A listening stimulus references approved immutable bytes by revision. The manifest for those
 * bytes is owned by `media.ts`; nothing about the object key, digest or signed URL appears in a
 * learner payload.
 */
export interface ListeningStimulus {
  readonly stimulusId: string;
  readonly mediaRevisionId: MediaRevisionId;
  readonly language: "de";
  readonly genreDomainRegister: string;
  /** Written instructions accompanying audio instructions, per the accessibility publication gate. */
  readonly writtenInstructionNodes: readonly SafeContentNode[];
  readonly evidenceAnchorIds: readonly string[];
}

export interface MatchPrompt {
  readonly promptId: string;
  readonly safeContentNodes: readonly SafeContentNode[];
}

/** Binds one left-hand prompt to the item that scores it. Identity, never position. */
export interface MatchItem {
  readonly itemRef: string;
  readonly leftId: string;
}

export interface SelectItem {
  readonly itemRef: string;
  readonly questionId: string;
  readonly questionNodes: readonly SafeContentNode[];
  readonly options: readonly Option[];
}

/** A cloze gap with its own local option set (the P4 written target currently uses three). */
export interface LocalOptionGap {
  readonly itemRef: string;
  readonly gapId: string;
  readonly options: readonly Option[];
}

/** A cloze gap answered from the shared candidate bank. */
export interface BankGap {
  readonly itemRef: string;
  readonly gapId: string;
}

export const candidateReusePolicies = ["at_most_once", "unrestricted"] as const;
export type CandidateReusePolicy = (typeof candidateReusePolicies)[number];

/* ------------------------------------------------------------------------------------------------
 * The closed union
 * ---------------------------------------------------------------------------------------------- */

export interface R1HeadingMatching {
  readonly kind: "R1HeadingMatching";
  readonly texts: readonly ReadingStimulus[];
  readonly headings: readonly Option[];
  readonly matchConstraints: MatchConstraint;
  readonly itemBindings: readonly MatchItem[];
}

export interface R2DetailedSelect {
  readonly kind: "R2DetailedSelect";
  readonly stimulus: ReadingStimulus;
  readonly questions: readonly SelectItem[];
}

export interface R3SituationNoticeMatching {
  readonly kind: "R3SituationNoticeMatching";
  readonly situations: readonly MatchPrompt[];
  readonly notices: readonly ReadingStimulus[];
  readonly matchConstraints: MatchConstraint;
  readonly noMatchOption?: Option;
  readonly itemBindings: readonly MatchItem[];
}

export interface SB1ContextualGrammarCloze {
  readonly kind: "SB1ContextualGrammarCloze";
  readonly connectedText: ClozeStimulus;
  readonly gaps: readonly LocalOptionGap[];
}

export interface SB2SharedBankLexicalCloze {
  readonly kind: "SB2SharedBankLexicalCloze";
  readonly connectedText: ClozeStimulus;
  readonly gaps: readonly BankGap[];
  readonly candidateBank: readonly Option[];
  readonly candidateReusePolicy: CandidateReusePolicy;
}

export interface H1ShortAnnouncements {
  readonly kind: "H1ShortAnnouncements";
  readonly announcements: readonly ListeningStimulus[];
  readonly questions: readonly SelectItem[];
  /** Authored opportunity count. The client can never invent an extra play. */
  readonly allowedPlayCountPerText: number;
}

export interface H2ConversationInterview {
  readonly kind: "H2ConversationInterview";
  readonly conversation: ListeningStimulus;
  readonly questions: readonly SelectItem[];
  readonly allowedPlayCount: number;
}

export interface H3ShortFunctionalTexts {
  readonly kind: "H3ShortFunctionalTexts";
  readonly texts: readonly ListeningStimulus[];
  readonly questions: readonly SelectItem[];
  readonly allowedPlayCountPerText: number;
}

export type TaskFamily =
  | R1HeadingMatching
  | R2DetailedSelect
  | R3SituationNoticeMatching
  | SB1ContextualGrammarCloze
  | SB2SharedBankLexicalCloze
  | H1ShortAnnouncements
  | H2ConversationInterview
  | H3ShortFunctionalTexts;

/**
 * The P4 playback opportunities of `Architecture/16-…` §6.2: H1 once, H2 twice, H3 twice. A P0-P3
 * variant declares its own count through its task definition; it is never this table relabelled.
 */
export const p4AllowedPlayCounts: Readonly<Record<ListeningTaskFamilyKind, number>> = {
  H1ShortAnnouncements: 1,
  H2ConversationInterview: 2,
  H3ShortFunctionalTexts: 2,
};

const listeningKinds: ReadonlySet<string> = new Set<string>(listeningTaskFamilyKinds);

export function isListeningTaskFamily(
  family: TaskFamily,
): family is H1ShortAnnouncements | H2ConversationInterview | H3ShortFunctionalTexts {
  return listeningKinds.has(family.kind);
}

/** Every authored option in the payload, in declaration order. Order is presentation, not identity. */
export function collectOptions(family: TaskFamily): readonly Option[] {
  switch (family.kind) {
    case "R1HeadingMatching":
      return family.headings;
    case "R2DetailedSelect":
      return family.questions.flatMap((question) => question.options);
    case "R3SituationNoticeMatching":
      return family.noMatchOption ? [family.noMatchOption] : [];
    case "SB1ContextualGrammarCloze":
      return family.gaps.flatMap((gap) => gap.options);
    case "SB2SharedBankLexicalCloze":
      return family.candidateBank;
    case "H1ShortAnnouncements":
    case "H2ConversationInterview":
    case "H3ShortFunctionalTexts":
      return family.questions.flatMap((question) => question.options);
  }
}

/**
 * Every safe content node the payload would render, so the serving boundary can re-validate the
 * whole tree rather than trusting the shape it was stored with.
 */
export function collectSafeContentNodes(family: TaskFamily): readonly SafeContentNode[] {
  const nodes: SafeContentNode[] = [];
  const pushReading = (stimulus: ReadingStimulus): void => {
    nodes.push(...stimulus.safeContentNodes);
  };
  const pushListening = (stimulus: ListeningStimulus): void => {
    nodes.push(...stimulus.writtenInstructionNodes);
  };
  const pushSelectItems = (questions: readonly SelectItem[]): void => {
    for (const question of questions) {
      nodes.push(...question.questionNodes);
      for (const option of question.options) nodes.push(...option.learnerSafeLabel);
    }
  };

  switch (family.kind) {
    case "R1HeadingMatching":
      for (const text of family.texts) pushReading(text);
      for (const heading of family.headings) nodes.push(...heading.learnerSafeLabel);
      break;
    case "R2DetailedSelect":
      pushReading(family.stimulus);
      pushSelectItems(family.questions);
      break;
    case "R3SituationNoticeMatching":
      for (const situation of family.situations) nodes.push(...situation.safeContentNodes);
      for (const notice of family.notices) pushReading(notice);
      if (family.noMatchOption) nodes.push(...family.noMatchOption.learnerSafeLabel);
      break;
    case "SB1ContextualGrammarCloze":
      pushReading(family.connectedText);
      for (const gap of family.gaps) {
        for (const option of gap.options) nodes.push(...option.learnerSafeLabel);
      }
      break;
    case "SB2SharedBankLexicalCloze":
      pushReading(family.connectedText);
      for (const candidate of family.candidateBank) nodes.push(...candidate.learnerSafeLabel);
      break;
    case "H1ShortAnnouncements":
      for (const announcement of family.announcements) pushListening(announcement);
      pushSelectItems(family.questions);
      break;
    case "H2ConversationInterview":
      pushListening(family.conversation);
      pushSelectItems(family.questions);
      break;
    case "H3ShortFunctionalTexts":
      for (const text of family.texts) pushListening(text);
      pushSelectItems(family.questions);
      break;
  }
  return nodes;
}

/**
 * The item references the payload declares, so a structural gate can compare them against the
 * scorable items of the revision without inferring anything from ordering.
 */
export function collectItemRefs(family: TaskFamily): readonly string[] {
  switch (family.kind) {
    case "R1HeadingMatching":
    case "R3SituationNoticeMatching":
      return family.itemBindings.map((binding) => binding.itemRef);
    case "R2DetailedSelect":
    case "H1ShortAnnouncements":
    case "H2ConversationInterview":
    case "H3ShortFunctionalTexts":
      return family.questions.map((question) => question.itemRef);
    case "SB1ContextualGrammarCloze":
    case "SB2SharedBankLexicalCloze":
      return family.gaps.map((gap) => gap.itemRef);
  }
}
