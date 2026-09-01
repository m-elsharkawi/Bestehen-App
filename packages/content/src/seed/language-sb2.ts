/** SB2 shared-bank lexical cloze. Six gaps draw from ten candidates without reuse. */

import type { ClozeStimulus, SB2SharedBankLexicalCloze } from "../task-families.js";
import {
  type SeedArtifact,
  type SeedItemSpec,
  buildSeedArtifact,
  clozeParagraph,
  option,
  seedInstruction,
} from "./builders.js";
import { seedItemId } from "./identity.js";

interface BankCandidate {
  readonly id: string;
  readonly word: string;
}

interface BankGapSpec {
  readonly id: string;
  readonly itemKey: string;
  readonly acceptedCandidateId: string;
  readonly context: string;
}

interface Sb2Spec {
  readonly seedKey: string;
  readonly familySlug: string;
  readonly scenario: string;
  readonly stimulusId: string;
  readonly segments: readonly (string | { readonly gapId: string })[];
  readonly candidates: readonly BankCandidate[];
  readonly gaps: readonly BankGapSpec[];
}

function buildSb2(spec: Sb2Spec): SeedArtifact {
  const wordById = new Map(spec.candidates.map((candidate) => [candidate.id, candidate.word]));
  const connectedText: ClozeStimulus = {
    stimulusId: spec.stimulusId,
    safeContentNodes: [clozeParagraph(spec.segments)],
    language: "de",
    genreDomainRegister: "informierende Mitteilung, Alltag und Organisation, sachlich",
    evidenceAnchorIds: spec.gaps.map((gap) => `${gap.id}-anchor`),
    connected: true,
  };
  const payload: SB2SharedBankLexicalCloze = {
    kind: "SB2SharedBankLexicalCloze",
    connectedText,
    gaps: spec.gaps.map((gap) => ({
      itemRef: seedItemId(spec.seedKey, gap.itemKey),
      gapId: gap.id,
    })),
    candidateBank: spec.candidates.map((candidate) => option(candidate.id, candidate.word)),
    candidateReusePolicy: "at_most_once",
  };
  const items: readonly SeedItemSpec[] = spec.gaps.map((gap) => ({
    itemKey: gap.itemKey,
    binding: { kind: "gap", gapId: gap.id },
    responseKind: "cloze_bank_candidate",
    capabilityRefs: ["tax.language.lexical_cohesion"],
    accepted: [{ kind: "candidate", gapId: gap.id, candidateId: gap.acceptedCandidateId }],
    decisiveEvidence: [
      {
        stimulusId: spec.stimulusId,
        anchorId: `${gap.id}-anchor`,
        safeRevealSpanOrRelation: gap.context,
        relationKind: "candidate_bank_constraint",
      },
    ],
    correctRationale: `${gap.context} Deshalb passt „${wordById.get(gap.acceptedCandidateId)}“ hier.`,
    distractor: (identifier: string) => ({
      whyPlausible: `„${wordById.get(identifier) ?? identifier}“ gehört thematisch zum Text.`,
      decisiveMismatch: gap.context,
      failureFamily: "register_or_collocation_mismatch",
    }),
    causeRef: "cause.language.lexical_relation_not_checked",
  }));
  return buildSeedArtifact({
    seedKey: spec.seedKey,
    familySlug: spec.familySlug,
    taskFamilyKind: "SB2SharedBankLexicalCloze",
    scenarioConfigurationRef: spec.scenario,
    decisiveRealizationRef: "realization.lexical_cohesion_across_text",
    answerPathRef: "path.test_collocation_and_bank_exclusion",
    capabilityRefs: ["tax.language.lexical_cohesion"],
    instruction: seedInstruction(`${spec.seedKey}-instruction`, "cloze_shared_bank", [
      "Lesen Sie den Text. Setzen Sie sechs Wörter aus der Liste in die Lücken ein.",
      "Vier Wörter bleiben übrig. Jedes Wort darf höchstens einmal verwendet werden.",
    ]),
    learnerPayload: payload,
    items,
  });
}

const workshopCandidates: readonly BankCandidate[] = [
  { id: "sb2a-c-anmeldung", word: "Anmeldung" },
  { id: "sb2a-c-beginn", word: "Beginn" },
  { id: "sb2a-c-mitbringen", word: "mitbringen" },
  { id: "sb2a-c-teilnahme", word: "Teilnahme" },
  { id: "sb2a-c-begrenzt", word: "begrenzt" },
  { id: "sb2a-c-erhalten", word: "erhalten" },
  { id: "sb2a-c-besuchen", word: "besuchen" },
  { id: "sb2a-c-verkaufen", word: "verkaufen" },
  { id: "sb2a-c-vergleichen", word: "vergleichen" },
  { id: "sb2a-c-umziehen", word: "umziehen" },
];
const workshopGaps: readonly BankGapSpec[] = [
  {
    id: "sb2a-g1",
    itemKey: "item-1",
    acceptedCandidateId: "sb2a-c-anmeldung",
    context: "Vor ‚ist bis Freitag möglich‘ wird ein Nomen für das Registrieren benötigt.",
  },
  {
    id: "sb2a-g2",
    itemKey: "item-2",
    acceptedCandidateId: "sb2a-c-beginn",
    context: "Die Uhrzeit 9 Uhr bezeichnet den Start der Veranstaltung.",
  },
  {
    id: "sb2a-g3",
    itemKey: "item-3",
    acceptedCandidateId: "sb2a-c-mitbringen",
    context: "Nach ‚bitte‘ nennt der Text eine Handlung mit dem eigenen Gerät.",
  },
  {
    id: "sb2a-g4",
    itemKey: "item-4",
    acceptedCandidateId: "sb2a-c-teilnahme",
    context: "‚kostenlos‘ beschreibt hier das Mitmachen an der Veranstaltung.",
  },
  {
    id: "sb2a-g5",
    itemKey: "item-5",
    acceptedCandidateId: "sb2a-c-begrenzt",
    context: "Zwölf Plätze setzen eine feste Obergrenze.",
  },
  {
    id: "sb2a-g6",
    itemKey: "item-6",
    acceptedCandidateId: "sb2a-c-erhalten",
    context: "Nach dem Kurs bekommen die Teilnehmenden Unterlagen per E-Mail.",
  },
];
const workshopSegments = [
  "Unser Workshop ‚Sicher im Internet‘ findet am Samstag statt. Die ",
  { gapId: "sb2a-g1" },
  " ist bis Freitag möglich. ",
  { gapId: "sb2a-g2" },
  " ist um 9 Uhr. Sie können Ihren eigenen Laptop ",
  { gapId: "sb2a-g3" },
  ". Die ",
  { gapId: "sb2a-g4" },
  " ist kostenlos. Da die Zahl der Plätze auf zwölf ",
  { gapId: "sb2a-g5" },
  " ist, melden Sie sich bitte früh an. Nach dem Workshop ",
  { gapId: "sb2a-g6" },
  " Sie die wichtigsten Hinweise per E-Mail.",
] as const;

const gardenCandidates: readonly BankCandidate[] = [
  { id: "sb2b-c-gemeinsam", word: "gemeinsam" },
  { id: "sb2b-c-werkzeug", word: "Werkzeug" },
  { id: "sb2b-c-ernte", word: "Ernte" },
  { id: "sb2b-c-aufgaben", word: "Aufgaben" },
  { id: "sb2b-c-erfahrung", word: "Erfahrung" },
  { id: "sb2b-c-verteilt", word: "verteilt" },
  { id: "sb2b-c-balkon", word: "Balkon" },
  { id: "sb2b-c-mietet", word: "mietet" },
  { id: "sb2b-c-geschlossen", word: "geschlossen" },
  { id: "sb2b-c-rechnung", word: "Rechnung" },
];
const gardenGaps: readonly BankGapSpec[] = [
  {
    id: "sb2b-g1",
    itemKey: "item-1",
    acceptedCandidateId: "sb2b-c-gemeinsam",
    context: "Die Gruppe bearbeitet die Fläche zusammen und nicht einzeln.",
  },
  {
    id: "sb2b-g2",
    itemKey: "item-2",
    acceptedCandidateId: "sb2b-c-werkzeug",
    context: "Spaten und Gießkannen sind Geräte für die Gartenarbeit.",
  },
  {
    id: "sb2b-g3",
    itemKey: "item-3",
    acceptedCandidateId: "sb2b-c-aufgaben",
    context: "Gießen und Jäten sind Arbeiten, die die Mitglieder übernehmen.",
  },
  {
    id: "sb2b-g4",
    itemKey: "item-4",
    acceptedCandidateId: "sb2b-c-verteilt",
    context: "Die Arbeiten werden wöchentlich unter den Mitgliedern aufgeteilt.",
  },
  {
    id: "sb2b-g5",
    itemKey: "item-5",
    acceptedCandidateId: "sb2b-c-erfahrung",
    context: "Der folgende Satz erklärt, dass Vorkenntnisse nicht nötig sind.",
  },
  {
    id: "sb2b-g6",
    itemKey: "item-6",
    acceptedCandidateId: "sb2b-c-ernte",
    context: "Am Ende geht es um das gemeinsam angebaute Gemüse, das geteilt wird.",
  },
];
const gardenSegments = [
  "Im Nachbarschaftsgarten arbeiten Menschen aus dem Viertel ",
  { gapId: "sb2b-g1" },
  ". Das nötige ",
  { gapId: "sb2b-g2" },
  " ist bereits vorhanden. Zu den ",
  { gapId: "sb2b-g3" },
  " gehören Gießen, Jäten und kleine Reparaturen. Sie werden jede Woche neu ",
  { gapId: "sb2b-g4" },
  ". Besondere ",
  { gapId: "sb2b-g5" },
  " ist nicht nötig, denn erfahrene Mitglieder helfen. Im Sommer wird die ",
  { gapId: "sb2b-g6" },
  " unter allen Aktiven geteilt.",
] as const;

export const sb2FamilyA = buildSb2({
  seedKey: "sb2-internetwerkstatt",
  familySlug: "sb2-family-digital-workshop",
  scenario: "scenario.cloze.workshop_information",
  stimulusId: "sb2a-workshop",
  segments: workshopSegments,
  candidates: workshopCandidates,
  gaps: workshopGaps,
});
export const sb2FamilyB = buildSb2({
  seedKey: "sb2-nachbarschaftsgarten",
  familySlug: "sb2-family-community-garden",
  scenario: "scenario.cloze.community_project",
  stimulusId: "sb2b-garden",
  segments: gardenSegments,
  candidates: gardenCandidates,
  gaps: gardenGaps,
});

export const sb2SeedArtifacts: readonly SeedArtifact[] = [sb2FamilyA, sb2FamilyB];
