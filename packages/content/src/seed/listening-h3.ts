/** H3 short functional texts. Five voicemail/radio/service texts per family, two plays each at P4. */

import type { MediaRevisionId } from "@bestehen/domain";
import type { H3ShortFunctionalTexts, ListeningStimulus } from "../task-families.js";
import { p4AllowedPlayCounts } from "../task-families.js";
import { paragraph } from "./builders.js";
import {
  type ListeningQuestionSpec,
  buildListeningArtifact,
  listeningQuestion,
  seedAudio,
} from "./listening-builders.js";

interface FunctionalTextSpec {
  readonly id: string;
  readonly register: string;
  readonly script: string;
  readonly question: ListeningQuestionSpec;
}

function buildH3(input: {
  readonly seedKey: string;
  readonly familySlug: string;
  readonly scenario: string;
  readonly texts: readonly FunctionalTextSpec[];
}) {
  const audio = input.texts.map((entry) =>
    seedAudio({
      assetKey: `${input.seedKey}-${entry.id}`,
      contentSeedKey: input.seedKey,
      contentFamilySlug: input.familySlug,
      listeningFamily: "H3",
      script: entry.script,
    }),
  );
  const payloadTexts: readonly ListeningStimulus[] = input.texts.map((entry, index) => ({
    stimulusId: entry.id,
    mediaRevisionId: audio[index]?.rendition.mediaRevisionId as MediaRevisionId,
    language: "de",
    genreDomainRegister: entry.register,
    writtenInstructionNodes: [paragraph("Hören Sie den kurzen Text zweimal.")],
    evidenceAnchorIds: [entry.question.anchorId],
  }));
  const payload: H3ShortFunctionalTexts = {
    kind: "H3ShortFunctionalTexts",
    texts: payloadTexts,
    questions: input.texts.map((entry) => listeningQuestion(input.seedKey, entry.question)),
    allowedPlayCountPerText: p4AllowedPlayCounts.H3ShortFunctionalTexts,
  };
  return buildListeningArtifact({
    seedKey: input.seedKey,
    familySlug: input.familySlug,
    kind: "H3ShortFunctionalTexts",
    shortFamily: "H3",
    scenario: input.scenario,
    capabilityRef: "tax.listening.functional_intent",
    payload,
    questions: input.texts.map((entry) => entry.question),
    audio,
  });
}

const messages: readonly FunctionalTextSpec[] = [
  {
    id: "h3a-voicemail",
    register: "private Sprachnachricht, freundlich",
    script:
      "Hallo Daria, hier ist Ben. Unser Treffen morgen muss eine Stunde später beginnen, also um halb sieben. Der Ort bleibt das Café am Markt. Ruf bitte nur an, wenn die neue Zeit nicht passt.",
    question: {
      id: "h3a-q-voicemail",
      itemKey: "item-voicemail",
      question: "Wann soll Daria anrufen?",
      stimulusId: "h3a-voicemail",
      anchorId: "h3a-a-voicemail",
      decisiveRelation: "Sie soll nur anrufen, wenn 18.30 Uhr für sie nicht möglich ist.",
      acceptedOptionId: "h3a-o-problem",
      answers: [
        { id: "h3a-o-now", label: "Sofort zur Bestätigung.", failureFamily: "opposite_polarity" },
        { id: "h3a-o-problem", label: "Wenn die neue Uhrzeit nicht passt." },
        {
          id: "h3a-o-place",
          label: "Wenn sie das Café nicht findet.",
          failureFamily: "plausible_but_unsupported",
        },
      ],
    },
  },
  {
    id: "h3a-radio",
    register: "lokaler Radiobeitrag, informierend",
    script:
      "Am Wochenende bleibt es am Samstag trocken und mild. Erst am Sonntagmittag zieht von Westen Regen auf. Wer einen Ausflug plant, sollte deshalb den Samstag nutzen.",
    question: {
      id: "h3a-q-radio",
      itemKey: "item-radio",
      question: "Welcher Tag wird für einen Ausflug empfohlen?",
      stimulusId: "h3a-radio",
      anchorId: "h3a-a-radio",
      decisiveRelation: "Der Samstag wird empfohlen, weil es dann trocken bleibt.",
      acceptedOptionId: "h3a-o-sat",
      answers: [
        { id: "h3a-o-fri", label: "Freitag.", failureFamily: "plausible_but_unsupported" },
        { id: "h3a-o-sat", label: "Samstag." },
        { id: "h3a-o-sun", label: "Sonntag.", failureFamily: "opposite_polarity" },
      ],
    },
  },
  {
    id: "h3a-order",
    register: "geschäftlicher Rückruf, höflich",
    script:
      "Guten Tag, hier ist die Bäckerei Schmitt. Ihre bestellte Torte ist morgen ab elf Uhr fertig. Da wir am Nachmittag schließen, holen Sie sie bitte spätestens um vierzehn Uhr ab.",
    question: {
      id: "h3a-q-order",
      itemKey: "item-order",
      question: "Bis wann soll die Torte abgeholt werden?",
      stimulusId: "h3a-order",
      anchorId: "h3a-a-order",
      decisiveRelation: "Die späteste Abholzeit ist 14 Uhr.",
      acceptedOptionId: "h3a-o-14",
      answers: [
        { id: "h3a-o-11", label: "Bis 11 Uhr.", failureFamily: "wrong_referent" },
        { id: "h3a-o-14", label: "Bis 14 Uhr." },
        { id: "h3a-o-evening", label: "Am Abend.", failureFamily: "opposite_polarity" },
      ],
    },
  },
  {
    id: "h3a-club",
    register: "Vereinsinformation, sachlich",
    script:
      "Das heutige Lauftraining fällt wegen Glatteis aus. Der Theorieabend im Vereinsraum beginnt trotzdem wie geplant um neunzehn Uhr. Thema ist sicheres Training im Winter.",
    question: {
      id: "h3a-q-club",
      itemKey: "item-club",
      question: "Was findet statt?",
      stimulusId: "h3a-club",
      anchorId: "h3a-a-club",
      decisiveRelation: "Das Lauftraining fällt aus, der Theorieabend findet statt.",
      acceptedOptionId: "h3a-o-theory",
      answers: [
        { id: "h3a-o-run", label: "Das Lauftraining.", failureFamily: "opposite_polarity" },
        { id: "h3a-o-theory", label: "Der Theorieabend." },
        { id: "h3a-o-both", label: "Beide Termine.", failureFamily: "partial_constraint_match" },
      ],
    },
  },
  {
    id: "h3a-delivery",
    register: "Lieferdienstnachricht, neutral",
    script:
      "Wir konnten Ihr Paket heute nicht zustellen. Es liegt ab morgen neun Uhr im Paketshop an der Bergstraße. Bitte bringen Sie zur Abholung einen Ausweis mit.",
    question: {
      id: "h3a-q-delivery",
      itemKey: "item-delivery",
      question: "Was braucht man bei der Abholung?",
      stimulusId: "h3a-delivery",
      anchorId: "h3a-a-delivery",
      decisiveRelation: "Zur Abholung ist ein Ausweis nötig.",
      acceptedOptionId: "h3a-o-id",
      answers: [
        { id: "h3a-o-money", label: "Bargeld.", failureFamily: "plausible_but_unsupported" },
        { id: "h3a-o-id", label: "Einen Ausweis." },
        {
          id: "h3a-o-box",
          label: "Eine eigene Tasche.",
          failureFamily: "plausible_but_unsupported",
        },
      ],
    },
  },
];

const appointments: readonly FunctionalTextSpec[] = [
  {
    id: "h3b-dentist",
    register: "Praxisnachricht, höflich",
    script:
      "Guten Tag, Praxis Wagner. Ihr Termin am Dienstag um zehn Uhr muss wegen einer Fortbildung verschoben werden. Wir können Ihnen am selben Tag um fünfzehn Uhr oder am Donnerstag um neun Uhr einen Ersatz anbieten.",
    question: {
      id: "h3b-q-dentist",
      itemKey: "item-dentist",
      question: "Warum wird der Termin verschoben?",
      stimulusId: "h3b-dentist",
      anchorId: "h3b-a-dentist",
      decisiveRelation: "Der Termin wird wegen einer Fortbildung der Praxis verschoben.",
      acceptedOptionId: "h3b-o-training",
      answers: [
        { id: "h3b-o-ill", label: "Wegen Krankheit.", failureFamily: "plausible_but_unsupported" },
        { id: "h3b-o-training", label: "Wegen einer Fortbildung." },
        {
          id: "h3b-o-holiday",
          label: "Wegen eines Feiertags.",
          failureFamily: "plausible_but_unsupported",
        },
      ],
    },
  },
  {
    id: "h3b-work",
    register: "betriebliche Nachricht, direkt",
    script:
      "Hallo Team, die Besprechung beginnt morgen schon um acht Uhr dreißig. Wir treffen uns nicht im großen Raum, sondern per Video, weil mehrere Kolleginnen im Homeoffice sind.",
    question: {
      id: "h3b-q-work",
      itemKey: "item-work",
      question: "Wie findet die Besprechung statt?",
      stimulusId: "h3b-work",
      anchorId: "h3b-a-work",
      decisiveRelation: "Die Besprechung findet per Video statt.",
      acceptedOptionId: "h3b-o-video",
      answers: [
        {
          id: "h3b-o-large",
          label: "Im großen Besprechungsraum.",
          failureFamily: "opposite_polarity",
        },
        { id: "h3b-o-video", label: "Per Video." },
        {
          id: "h3b-o-phone",
          label: "Nur telefonisch.",
          failureFamily: "plausible_but_unsupported",
        },
      ],
    },
  },
  {
    id: "h3b-school",
    register: "Schulnachricht, informierend",
    script:
      "Der Elternabend der Klasse sechs B findet am kommenden Montag statt. Beginn ist um neunzehn Uhr in Raum zwölf. Der Eingang am Schulhof ist abends geschlossen; benutzen Sie den Haupteingang.",
    question: {
      id: "h3b-q-school",
      itemKey: "item-school",
      question: "Welcher Eingang ist geöffnet?",
      stimulusId: "h3b-school",
      anchorId: "h3b-a-school",
      decisiveRelation: "Am Abend soll der Haupteingang benutzt werden.",
      acceptedOptionId: "h3b-o-main",
      answers: [
        { id: "h3b-o-yard", label: "Der Eingang am Schulhof.", failureFamily: "opposite_polarity" },
        { id: "h3b-o-main", label: "Der Haupteingang." },
        {
          id: "h3b-o-room",
          label: "Der Eingang bei Raum zwölf.",
          failureFamily: "surface_word_match",
        },
      ],
    },
  },
  {
    id: "h3b-repair",
    register: "Handwerksbetrieb, sachlich",
    script:
      "Hier ist Heizungsservice König. Das Ersatzteil ist heute angekommen. Unser Monteur kann morgen zwischen zwölf und vierzehn Uhr kommen. Bitte sorgen Sie dafür, dass der Keller zugänglich ist.",
    question: {
      id: "h3b-q-repair",
      itemKey: "item-repair",
      question: "Was soll vorbereitet werden?",
      stimulusId: "h3b-repair",
      anchorId: "h3b-a-repair",
      decisiveRelation: "Der Zugang zum Keller muss frei sein.",
      acceptedOptionId: "h3b-o-cellar",
      answers: [
        { id: "h3b-o-part", label: "Das Ersatzteil.", failureFamily: "opposite_polarity" },
        { id: "h3b-o-cellar", label: "Der Zugang zum Keller." },
        { id: "h3b-o-car", label: "Ein Parkplatz.", failureFamily: "plausible_but_unsupported" },
      ],
    },
  },
  {
    id: "h3b-course",
    register: "Kursleitung, freundlich",
    script:
      "Willkommen im Online-Seminar. Bitte schalten Sie Ihr Mikrofon zunächst aus. Fragen können Sie jederzeit in den Chat schreiben; wir besprechen sie jeweils am Ende eines Abschnitts.",
    question: {
      id: "h3b-q-course",
      itemKey: "item-course",
      question: "Wo sollen Fragen zunächst gestellt werden?",
      stimulusId: "h3b-course",
      anchorId: "h3b-a-course",
      decisiveRelation: "Fragen sollen zunächst in den Chat geschrieben werden.",
      acceptedOptionId: "h3b-o-chat",
      answers: [
        { id: "h3b-o-mic", label: "Direkt über das Mikrofon.", failureFamily: "opposite_polarity" },
        { id: "h3b-o-chat", label: "Im Chat." },
        {
          id: "h3b-o-email",
          label: "Später per E-Mail.",
          failureFamily: "plausible_but_unsupported",
        },
      ],
    },
  },
];

export const h3FamilyA = buildH3({
  seedKey: "h3-nachrichten",
  familySlug: "h3-family-everyday-messages",
  scenario: "scenario.listening.functional_messages",
  texts: messages,
});
export const h3FamilyB = buildH3({
  seedKey: "h3-termine",
  familySlug: "h3-family-appointment-information",
  scenario: "scenario.listening.appointments_and_instructions",
  texts: appointments,
});

export const h3SeedFamilies = [h3FamilyA, h3FamilyB] as const;
export const h3SeedArtifacts = h3SeedFamilies.map((family) => family.artifact);
export const h3SeedAudio = h3SeedFamilies.flatMap((family) => family.audio);
