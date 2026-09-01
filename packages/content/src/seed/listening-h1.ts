/** H1 short announcements. Five independently played texts per family, one play each at P4. */

import type { MediaRevisionId } from "@bestehen/domain";
import type { H1ShortAnnouncements, ListeningStimulus } from "../task-families.js";
import { p4AllowedPlayCounts } from "../task-families.js";
import { paragraph } from "./builders.js";
import {
  type ListeningQuestionSpec,
  buildListeningArtifact,
  listeningQuestion,
  seedAudio,
} from "./listening-builders.js";

interface AnnouncementSpec {
  readonly id: string;
  readonly script: string;
  readonly question: ListeningQuestionSpec;
}

function buildH1(input: {
  readonly seedKey: string;
  readonly familySlug: string;
  readonly scenario: string;
  readonly announcements: readonly AnnouncementSpec[];
}) {
  const audio = input.announcements.map((entry) =>
    seedAudio({
      assetKey: `${input.seedKey}-${entry.id}`,
      contentSeedKey: input.seedKey,
      contentFamilySlug: input.familySlug,
      listeningFamily: "H1",
      script: entry.script,
    }),
  );
  const audioById = new Map(
    input.announcements.map((entry, index) => [entry.id, audio[index]] as const),
  );
  const announcements: readonly ListeningStimulus[] = input.announcements.map((entry) => ({
    stimulusId: entry.id,
    mediaRevisionId: audioById.get(entry.id)?.rendition.mediaRevisionId as MediaRevisionId,
    language: "de",
    genreDomainRegister: "kurze öffentliche Ansage, sachlich gesprochen",
    writtenInstructionNodes: [paragraph("Hören Sie die kurze Ansage einmal.")],
    evidenceAnchorIds: [entry.question.anchorId],
  }));
  const payload: H1ShortAnnouncements = {
    kind: "H1ShortAnnouncements",
    announcements,
    questions: input.announcements.map((entry) => listeningQuestion(input.seedKey, entry.question)),
    allowedPlayCountPerText: p4AllowedPlayCounts.H1ShortAnnouncements,
  };
  return buildListeningArtifact({
    seedKey: input.seedKey,
    familySlug: input.familySlug,
    kind: "H1ShortAnnouncements",
    shortFamily: "H1",
    scenario: input.scenario,
    capabilityRef: "tax.listening.short_announcement",
    payload,
    questions: input.announcements.map((entry) => entry.question),
    audio,
  });
}

const transit: readonly AnnouncementSpec[] = [
  {
    id: "h1a-platform",
    script:
      "Achtung am Gleis vier. Der Regionalzug nach Kassel fährt heute nicht um acht Uhr zwölf, sondern zwanzig Minuten später. Bitte bleiben Sie auf Gleis vier.",
    question: {
      id: "h1a-q-platform",
      itemKey: "item-platform",
      question: "Was sollen die Fahrgäste tun?",
      stimulusId: "h1a-platform",
      anchorId: "h1a-a-platform",
      decisiveRelation: "Der Zug kommt später, aber das Gleis bleibt unverändert.",
      acceptedOptionId: "h1a-o-wait",
      answers: [
        { id: "h1a-o-wait", label: "Auf Gleis vier warten." },
        {
          id: "h1a-o-change",
          label: "Zu Gleis zwei gehen.",
          failureFamily: "plausible_but_unsupported",
        },
        { id: "h1a-o-bus", label: "Einen Bus nehmen.", failureFamily: "plausible_but_unsupported" },
      ],
    },
  },
  {
    id: "h1a-pool",
    script:
      "Liebe Badegäste, das Außenbecken schließt heute wegen eines Gewitters bereits um siebzehn Uhr. Das Hallenbad bleibt bis zwanzig Uhr geöffnet.",
    question: {
      id: "h1a-q-pool",
      itemKey: "item-pool",
      question: "Was bleibt bis 20 Uhr geöffnet?",
      stimulusId: "h1a-pool",
      anchorId: "h1a-a-pool",
      decisiveRelation: "Nur das Hallenbad bleibt bis zwanzig Uhr geöffnet.",
      acceptedOptionId: "h1a-o-indoor",
      answers: [
        { id: "h1a-o-outdoor", label: "Das Außenbecken.", failureFamily: "opposite_polarity" },
        { id: "h1a-o-indoor", label: "Das Hallenbad." },
        { id: "h1a-o-both", label: "Beide Becken.", failureFamily: "partial_constraint_match" },
      ],
    },
  },
  {
    id: "h1a-store",
    script:
      "Eine Information für unsere Kundinnen und Kunden: Die Kasse im ersten Stock ist geschlossen. Bitte bezahlen Sie im Erdgeschoss.",
    question: {
      id: "h1a-q-store",
      itemKey: "item-store",
      question: "Wo kann man bezahlen?",
      stimulusId: "h1a-store",
      anchorId: "h1a-a-store",
      decisiveRelation: "Bezahlt wird im Erdgeschoss.",
      acceptedOptionId: "h1a-o-ground",
      answers: [
        { id: "h1a-o-first", label: "Im ersten Stock.", failureFamily: "opposite_polarity" },
        { id: "h1a-o-ground", label: "Im Erdgeschoss." },
        { id: "h1a-o-exit", label: "Am Ausgang.", failureFamily: "plausible_but_unsupported" },
      ],
    },
  },
  {
    id: "h1a-clinic",
    script:
      "Frau Klose bitte in Behandlungsraum sieben. Nehmen Sie Ihre Versichertenkarte mit und melden Sie sich dort bei der Assistenz.",
    question: {
      id: "h1a-q-clinic",
      itemKey: "item-clinic",
      question: "Was soll Frau Klose mitnehmen?",
      stimulusId: "h1a-clinic",
      anchorId: "h1a-a-clinic",
      decisiveRelation: "Sie soll ihre Versichertenkarte mitnehmen.",
      acceptedOptionId: "h1a-o-card",
      answers: [
        { id: "h1a-o-card", label: "Ihre Versichertenkarte." },
        { id: "h1a-o-coat", label: "Ihre Jacke.", failureFamily: "plausible_but_unsupported" },
        { id: "h1a-o-form", label: "Ein Formular.", failureFamily: "plausible_but_unsupported" },
      ],
    },
  },
  {
    id: "h1a-museum",
    script:
      "Die Führung durch die Fotoausstellung beginnt in fünf Minuten am großen Fenster im Foyer. Sie dauert ungefähr vierzig Minuten.",
    question: {
      id: "h1a-q-museum",
      itemKey: "item-museum",
      question: "Wo beginnt die Führung?",
      stimulusId: "h1a-museum",
      anchorId: "h1a-a-museum",
      decisiveRelation: "Treffpunkt ist das große Fenster im Foyer.",
      acceptedOptionId: "h1a-o-window",
      answers: [
        {
          id: "h1a-o-gallery",
          label: "In der Fotoausstellung.",
          failureFamily: "surface_word_match",
        },
        { id: "h1a-o-window", label: "Am großen Fenster im Foyer." },
        { id: "h1a-o-counter", label: "An der Kasse.", failureFamily: "plausible_but_unsupported" },
      ],
    },
  },
];

const community: readonly AnnouncementSpec[] = [
  {
    id: "h1b-library",
    script:
      "Die Stadtbibliothek schließt heute ausnahmsweise um achtzehn Uhr. Bereits ausgeliehene Medien können Sie danach am Rückgabekasten abgeben.",
    question: {
      id: "h1b-q-library",
      itemKey: "item-library",
      question: "Was ist nach 18 Uhr noch möglich?",
      stimulusId: "h1b-library",
      anchorId: "h1b-a-library",
      decisiveRelation: "Nach der Schließung ist nur die Rückgabe am Kasten möglich.",
      acceptedOptionId: "h1b-o-return",
      answers: [
        { id: "h1b-o-borrow", label: "Bücher ausleihen.", failureFamily: "opposite_polarity" },
        { id: "h1b-o-return", label: "Medien am Kasten zurückgeben." },
        {
          id: "h1b-o-register",
          label: "Einen Ausweis beantragen.",
          failureFamily: "plausible_but_unsupported",
        },
      ],
    },
  },
  {
    id: "h1b-school",
    script:
      "Wegen der Hitze endet der Unterricht morgen für alle Klassen nach der fünften Stunde. Die Nachmittagsbetreuung findet wie geplant statt.",
    question: {
      id: "h1b-q-school",
      itemKey: "item-school",
      question: "Was ändert sich morgen?",
      stimulusId: "h1b-school",
      anchorId: "h1b-a-school",
      decisiveRelation:
        "Der Unterricht endet nach der fünften Stunde; die Betreuung bleibt bestehen.",
      acceptedOptionId: "h1b-o-early",
      answers: [
        { id: "h1b-o-early", label: "Der Unterricht endet früher." },
        { id: "h1b-o-care", label: "Die Betreuung fällt aus.", failureFamily: "opposite_polarity" },
        {
          id: "h1b-o-start",
          label: "Die Schule beginnt später.",
          failureFamily: "plausible_but_unsupported",
        },
      ],
    },
  },
  {
    id: "h1b-market",
    script:
      "Der Wochenmarkt zieht diesen Mittwoch vom Rathausplatz auf den Parkplatz an der Sporthalle. Die Öffnungszeit von acht bis dreizehn Uhr bleibt gleich.",
    question: {
      id: "h1b-q-market",
      itemKey: "item-market",
      question: "Was ist neu?",
      stimulusId: "h1b-market",
      anchorId: "h1b-a-market",
      decisiveRelation: "Nur der Ort ändert sich, nicht die Öffnungszeit.",
      acceptedOptionId: "h1b-o-place",
      answers: [
        { id: "h1b-o-place", label: "Der Markt findet an einem anderen Ort statt." },
        { id: "h1b-o-time", label: "Der Markt öffnet später.", failureFamily: "opposite_polarity" },
        {
          id: "h1b-o-day",
          label: "Der Markt findet am Donnerstag statt.",
          failureFamily: "plausible_but_unsupported",
        },
      ],
    },
  },
  {
    id: "h1b-theatre",
    script:
      "Die Vorstellung beginnt um neunzehn Uhr dreißig. Bitte geben Sie große Taschen vor dem Einlass kostenlos an der Garderobe ab.",
    question: {
      id: "h1b-q-theatre",
      itemKey: "item-theatre",
      question: "Was soll vor dem Einlass geschehen?",
      stimulusId: "h1b-theatre",
      anchorId: "h1b-a-theatre",
      decisiveRelation: "Große Taschen sollen kostenlos an der Garderobe abgegeben werden.",
      acceptedOptionId: "h1b-o-bag",
      answers: [
        {
          id: "h1b-o-ticket",
          label: "Man soll eine neue Karte kaufen.",
          failureFamily: "plausible_but_unsupported",
        },
        { id: "h1b-o-bag", label: "Man soll große Taschen abgeben." },
        {
          id: "h1b-o-pay",
          label: "Man soll die Garderobe bezahlen.",
          failureFamily: "opposite_polarity",
        },
      ],
    },
  },
  {
    id: "h1b-park",
    script:
      "Der südliche Parkeingang ist bis Freitag gesperrt. Nutzen Sie bitte den Eingang an der Lindenstraße. Der Spielplatz bleibt geöffnet.",
    question: {
      id: "h1b-q-park",
      itemKey: "item-park",
      question: "Welchen Eingang soll man nutzen?",
      stimulusId: "h1b-park",
      anchorId: "h1b-a-park",
      decisiveRelation: "Geöffnet ist der Eingang an der Lindenstraße.",
      acceptedOptionId: "h1b-o-linden",
      answers: [
        { id: "h1b-o-south", label: "Den südlichen Eingang.", failureFamily: "opposite_polarity" },
        { id: "h1b-o-linden", label: "Den Eingang an der Lindenstraße." },
        {
          id: "h1b-o-play",
          label: "Den Eingang am Spielplatz.",
          failureFamily: "surface_word_match",
        },
      ],
    },
  },
];

export const h1FamilyA = buildH1({
  seedKey: "h1-unterwegs",
  familySlug: "h1-family-public-transit-and-services",
  scenario: "scenario.listening.short_public_announcements",
  announcements: transit,
});
export const h1FamilyB = buildH1({
  seedKey: "h1-stadtleben",
  familySlug: "h1-family-community-announcements",
  scenario: "scenario.listening.community_announcements",
  announcements: community,
});

export const h1SeedFamilies = [h1FamilyA, h1FamilyB] as const;
export const h1SeedArtifacts = h1SeedFamilies.map((family) => family.artifact);
export const h1SeedAudio = h1SeedFamilies.flatMap((family) => family.audio);
