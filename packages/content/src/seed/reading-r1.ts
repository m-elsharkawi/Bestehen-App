/**
 * R1 — heading matching. Two independent seed families (decision D03, risk R9).
 *
 * Each family offers five short notices and seven headings with no reuse, so two headings are
 * always unused and "every heading fits something" is never a workable strategy. The decisive
 * evidence is whole-text communicative purpose rather than a span: an R1 heading is chosen because
 * of what the whole notice is *for*, which is why the key cites `whole_text_gist` and the learner
 * payload carries no anchor span at all.
 *
 * The two families are deliberately different scenario configurations — a neighbourhood centre and
 * an office building — rather than the same notices reworded. Revisions, voices and renamed
 * entities do not create freshness (`Architecture/09-…` §7.1), so a second family that was the first
 * one with new nouns would be one family wearing two names, and the fresh-retry path would still be
 * untestable.
 */

import type { DistractorFailureFamily } from "../keys.js";
import type { Option } from "../model.js";
import type { R1HeadingMatching, ReadingStimulus } from "../task-families.js";
import {
  type SeedArtifact,
  type SeedItemSpec,
  buildSeedArtifact,
  option,
  paragraph,
  seedInstruction,
} from "./builders.js";
import { seedItemId } from "./identity.js";

const instructionLines = [
  "Lesen Sie die fünf Aushänge. Wählen Sie zu jedem Aushang die passende Überschrift.",
  "Es gibt sieben Überschriften. Jede Überschrift passt höchstens einmal; zwei Überschriften bleiben übrig.",
];

interface HeadingSpec {
  readonly optionId: string;
  readonly label: string;
  /** One authored line saying what the heading claims. Every distractor rationale composes from it. */
  readonly claim: string;
}

interface NoticeSpec {
  readonly stimulusId: string;
  readonly itemKey: string;
  readonly genreDomainRegister: string;
  readonly lines: readonly string[];
  /** One authored line saying what the notice is actually for. The decisive relation cites it. */
  readonly purpose: string;
  readonly acceptedHeadingId: string;
  /** Headings whose wording overlaps this notice's vocabulary rather than its purpose. */
  readonly surfaceOverlap?: readonly string[];
}

interface R1FamilySpec {
  readonly seedKey: string;
  readonly familySlug: string;
  readonly scenario: string;
  readonly capabilityRefs: readonly string[];
  readonly notices: readonly NoticeSpec[];
  readonly headings: readonly HeadingSpec[];
}

function buildR1(spec: R1FamilySpec): SeedArtifact {
  const headingById = new Map(spec.headings.map((heading) => [heading.optionId, heading] as const));
  const options: readonly Option[] = spec.headings.map((heading) =>
    option(heading.optionId, heading.label),
  );
  const texts: readonly ReadingStimulus[] = spec.notices.map((notice) => ({
    stimulusId: notice.stimulusId,
    safeContentNodes: notice.lines.map((line) => paragraph(line)),
    language: "de",
    genreDomainRegister: notice.genreDomainRegister,
    evidenceAnchorIds: [`${notice.stimulusId}-gist`],
  }));

  const payload: R1HeadingMatching = {
    kind: "R1HeadingMatching",
    texts,
    headings: options,
    matchConstraints: {
      leftCardinality: { min: spec.notices.length, max: spec.notices.length },
      rightReusePolicy: "at_most_once",
      unmatchedPolicy: "forbidden",
      completionRule: "all_left_bound",
    },
    itemBindings: spec.notices.map((notice) => ({
      itemRef: seedItemId(spec.seedKey, notice.itemKey),
      leftId: notice.stimulusId,
    })),
  };

  const items: readonly SeedItemSpec[] = spec.notices.map((notice) => ({
    itemKey: notice.itemKey,
    binding: { kind: "match", leftId: notice.stimulusId },
    responseKind: "match",
    capabilityRefs: ["tax.reading.gist"],
    accepted: [{ kind: "match", leftId: notice.stimulusId, rightId: notice.acceptedHeadingId }],
    decisiveEvidence: [
      {
        stimulusId: notice.stimulusId,
        anchorId: `${notice.stimulusId}-gist`,
        safeRevealSpanOrRelation: notice.purpose,
        relationKind: "whole_text_gist",
      },
    ],
    correctRationale: `${headingById.get(notice.acceptedHeadingId)?.label ?? notice.acceptedHeadingId}: ${notice.purpose}`,
    distractor: (identifier: string) => {
      const heading = headingById.get(identifier);
      const claim = heading?.claim ?? identifier;
      const failureFamily: DistractorFailureFamily = (notice.surfaceOverlap ?? []).includes(
        identifier,
      )
        ? "surface_word_match"
        : "plausible_but_unsupported";
      return {
        whyPlausible: `Die Überschrift kündigt ${claim} an und bleibt damit im Themenfeld des Aushangs.`,
        decisiveMismatch: `${notice.purpose} Von ${claim} ist im Aushang nirgends die Rede.`,
        failureFamily,
      };
    },
    causeRef: "cause.reading.purpose_not_isolated",
  }));

  return buildSeedArtifact({
    seedKey: spec.seedKey,
    familySlug: spec.familySlug,
    taskFamilyKind: "R1HeadingMatching",
    scenarioConfigurationRef: spec.scenario,
    decisiveRealizationRef: "realization.whole_text_purpose",
    answerPathRef: "path.match_notice_to_purpose",
    capabilityRefs: spec.capabilityRefs,
    instruction: seedInstruction(
      `${spec.seedKey}-instruction`,
      "match_select_then_place",
      instructionLines,
    ),
    learnerPayload: payload,
    items,
  });
}

/* ------------------------------------------------------------------------------------------------
 * Family A — notice board of a neighbourhood centre
 * ---------------------------------------------------------------------------------------------- */

const neighbourhoodHeadings: readonly HeadingSpec[] = [
  {
    optionId: "r1a-h-reparieren",
    label: "Selbst reparieren statt wegwerfen",
    claim: "eine Gelegenheit, defekte Dinge unter Anleitung selbst instand zu setzen",
  },
  {
    optionId: "r1a-h-sprechen",
    label: "Miteinander reden, ganz ohne Unterricht",
    claim: "ein zwangloses Gespräch ohne Lehrkraft und ohne Programm",
  },
  {
    optionId: "r1a-h-winterkleidung",
    label: "Gut erhaltene Winterkleidung gesucht",
    claim: "die Annahme von gebrauchter, aber sauberer Winterkleidung",
  },
  {
    optionId: "r1a-h-ehrenamt",
    label: "Freiwillige für Schulkinder gesucht",
    claim: "die Suche nach Menschen, die Kindern regelmäßig Zeit schenken",
  },
  {
    optionId: "r1a-h-beet",
    label: "Ein Beet für den Sommer sichern",
    claim: "die Vergabe von Gartenbeeten an Interessierte",
  },
  {
    optionId: "r1a-h-kurs",
    label: "Neuer Deutschkurs mit Prüfung am Ende",
    claim: "einen geführten Kurs, der mit einer Prüfung abschließt",
  },
  {
    optionId: "r1a-h-flohmarkt",
    label: "Flohmarkt für gebrauchte Kleidung",
    claim: "den Verkauf gebrauchter Kleidung an Besucherinnen und Besucher",
  },
];

const neighbourhoodNotices: readonly NoticeSpec[] = [
  {
    stimulusId: "r1a-werkstatt",
    itemKey: "item-werkstatt",
    genreDomainRegister: "Aushang, Nachbarschaft, sachlich-freundlich",
    lines: [
      "Jeden Mittwoch von 17 bis 20 Uhr ist die offene Werkstatt im Hinterhof geöffnet.",
      "Wer eine Panne hat, bringt sein Rad mit und setzt es unter Anleitung selbst wieder instand.",
      "Werkzeug steht bereit; Ersatzteile bringen Sie bitte selbst mit.",
    ],
    purpose:
      "Der Aushang lädt dazu ein, das eigene Rad mit fremdem Werkzeug und fremder Anleitung selbst zu reparieren.",
    acceptedHeadingId: "r1a-h-reparieren",
  },
  {
    stimulusId: "r1a-sprachcafe",
    itemKey: "item-sprachcafe",
    genreDomainRegister: "Aushang, Nachbarschaft, einladend",
    lines: [
      "Am ersten Sonntag im Monat treffen sich Nachbarinnen und Nachbarn zum Sprechen auf Deutsch.",
      "Es gibt kein Programm und keine Lehrkraft, nur Kaffee und Gespräche an kleinen Tischen.",
      "Wer sich noch unsicher fühlt, darf beim ersten Mal auch nur zuhören.",
    ],
    purpose:
      "Der Aushang wirbt für ein regelmäßiges Treffen, bei dem ausdrücklich nicht unterrichtet und nicht geprüft wird.",
    acceptedHeadingId: "r1a-h-sprechen",
    surfaceOverlap: ["r1a-h-kurs"],
  },
  {
    stimulusId: "r1a-kleiderkammer",
    itemKey: "item-kleiderkammer",
    genreDomainRegister: "Aushang, soziale Einrichtung, sachlich",
    lines: [
      "Warme Jacken, Schals und Mützen nehmen wir noch bis Ende November entgegen.",
      "Bitte geben Sie nur saubere Stücke ab; beschädigte Kleidung können wir nicht weitergeben.",
      "Die Ausgabe an Bedürftige beginnt im Dezember und ist kostenlos.",
    ],
    purpose:
      "Der Aushang sammelt gebrauchte Winterkleidung ein, die anschließend kostenlos weitergegeben wird.",
    acceptedHeadingId: "r1a-h-winterkleidung",
    surfaceOverlap: ["r1a-h-flohmarkt"],
  },
  {
    stimulusId: "r1a-hausaufgaben",
    itemKey: "item-hausaufgaben",
    genreDomainRegister: "Aushang, Ehrenamt, werbend",
    lines: [
      "Für Kinder der Klassen drei bis sechs suchen wir Menschen, die zweimal pro Woche eine Stunde Zeit haben.",
      "Eine pädagogische Ausbildung ist nicht nötig, Geduld dagegen schon.",
      "Vor dem ersten Termin gibt es eine kurze Einführung im Haus.",
    ],
    purpose: "Der Aushang sucht Freiwillige, die Schulkindern regelmäßig bei den Aufgaben helfen.",
    acceptedHeadingId: "r1a-h-ehrenamt",
  },
  {
    stimulusId: "r1a-garten",
    itemKey: "item-garten",
    genreDomainRegister: "Aushang, Hausgemeinschaft, organisatorisch",
    lines: [
      "Die Beete hinter dem Haus werden im Frühjahr neu verteilt.",
      "Wer ein Beet übernehmen möchte, trägt sich bis zum 15. Februar in die Liste am Eingang ein.",
      "Pro Haushalt ist ein einziges Beet vorgesehen.",
    ],
    purpose:
      "Der Aushang regelt, wie man sich rechtzeitig um eines der neu verteilten Gartenbeete bewirbt.",
    acceptedHeadingId: "r1a-h-beet",
  },
];

/* ------------------------------------------------------------------------------------------------
 * Family B — notice board of an office building
 * ---------------------------------------------------------------------------------------------- */

const officeHeadings: readonly HeadingSpec[] = [
  {
    optionId: "r1b-h-aufzug",
    label: "Nur ein Aufzug in Betrieb",
    claim: "eine Einschränkung beim Aufzug während einer Wartung",
  },
  {
    optionId: "r1b-h-pakete",
    label: "Keine privaten Pakete mehr am Empfang",
    claim: "das Ende der Paketannahme für private Bestellungen",
  },
  {
    optionId: "r1b-h-geschirr",
    label: "Geschirr bitte sofort einräumen",
    claim: "eine Regel für schmutziges Geschirr in der Teeküche",
  },
  {
    optionId: "r1b-h-plakette",
    label: "Ohne Plakette kein Platz im Keller",
    claim: "eine neue Kennzeichnungspflicht für abgestellte Fahrräder",
  },
  {
    optionId: "r1b-h-ruhe",
    label: "Ein Ort zum stillen Arbeiten",
    claim: "einen neuen Bereich, in dem konzentriert und leise gearbeitet wird",
  },
  {
    optionId: "r1b-h-treppenhaus",
    label: "Neue Öffnungszeiten für das Treppenhaus",
    claim: "geänderte Zeiten, zu denen das Treppenhaus zugänglich ist",
  },
  {
    optionId: "r1b-h-umbau",
    label: "Besprechungsräume werden umgebaut",
    claim: "Bauarbeiten in den Besprechungsräumen",
  },
];

const officeNotices: readonly NoticeSpec[] = [
  {
    stimulusId: "r1b-aufzug",
    itemKey: "item-aufzug",
    genreDomainRegister: "Hinweis, Bürogebäude, sachlich",
    lines: [
      "Der linke Aufzug wird von Montag bis Mittwoch gewartet.",
      "In dieser Zeit steht nur der rechte Aufzug zur Verfügung; bitte rechnen Sie mit Wartezeiten.",
      "Wer Treppen steigen kann, nimmt in diesen Tagen bitte das Treppenhaus.",
    ],
    purpose:
      "Der Hinweis kündigt an, dass wegen einer Wartung drei Tage lang nur ein einziger Aufzug fährt.",
    acceptedHeadingId: "r1b-h-aufzug",
    surfaceOverlap: ["r1b-h-treppenhaus"],
  },
  {
    stimulusId: "r1b-empfang",
    itemKey: "item-empfang",
    genreDomainRegister: "Hinweis, Bürogebäude, verbindlich",
    lines: [
      "Private Sendungen werden am Empfang ab sofort nicht mehr angenommen.",
      "Bestellen Sie bitte an Ihre Wohnadresse.",
      "Bereits eingetroffene Pakete können noch bis Freitag abgeholt werden.",
    ],
    purpose:
      "Der Hinweis beendet die Annahme privater Pakete und nennt nur noch eine Frist für die letzten Sendungen.",
    acceptedHeadingId: "r1b-h-pakete",
  },
  {
    stimulusId: "r1b-kueche",
    itemKey: "item-kueche",
    genreDomainRegister: "Hinweis, Teeküche, mahnend",
    lines: [
      "Geschirr, das abends in der Spüle steht, wird am nächsten Morgen in eine Kiste geräumt.",
      "Nach zwei Wochen leeren wir die Kiste und geben den Inhalt ab.",
      "Stellen Sie Ihre Tassen und Teller deshalb bitte gleich in die Spülmaschine.",
    ],
    purpose:
      "Der Hinweis verlangt, benutztes Geschirr sofort einzuräumen, und beschreibt, was sonst damit geschieht.",
    acceptedHeadingId: "r1b-h-geschirr",
  },
  {
    stimulusId: "r1b-fahrradkeller",
    itemKey: "item-fahrradkeller",
    genreDomainRegister: "Hinweis, Hausverwaltung, sachlich",
    lines: [
      "Ab Mai brauchen alle Räder im Keller eine Plakette.",
      "Die Plaketten gibt es beim Hausmeister, solange der Vorrat reicht.",
      "Räder ohne Plakette werden im Sommer aus dem Keller entfernt.",
    ],
    purpose:
      "Der Hinweis führt eine Plakettenpflicht ein und nennt die Folge für Räder ohne Plakette.",
    acceptedHeadingId: "r1b-h-plakette",
  },
  {
    stimulusId: "r1b-ruhezone",
    itemKey: "item-ruhezone",
    genreDomainRegister: "Hinweis, Bürogebäude, informierend",
    lines: [
      "Im dritten Stock entsteht ein Bereich für konzentriertes Arbeiten.",
      "Telefonate und Besprechungen sind dort nicht erlaubt.",
      "Für Gespräche stehen weiterhin die Besprechungsräume im zweiten Stock bereit.",
    ],
    purpose:
      "Der Hinweis stellt einen neuen, ausdrücklich stillen Arbeitsbereich vor und grenzt ihn von Gesprächsorten ab.",
    acceptedHeadingId: "r1b-h-ruhe",
    surfaceOverlap: ["r1b-h-umbau"],
  },
];

export const r1FamilyA: SeedArtifact = buildR1({
  seedKey: "r1-nachbarschaftszentrum",
  familySlug: "r1-family-neighbourhood-noticeboard",
  scenario: "scenario.noticeboard.neighbourhood_centre",
  capabilityRefs: ["tax.reading.gist"],
  notices: neighbourhoodNotices,
  headings: neighbourhoodHeadings,
});

export const r1FamilyB: SeedArtifact = buildR1({
  seedKey: "r1-buerogebaeude",
  familySlug: "r1-family-office-noticeboard",
  scenario: "scenario.noticeboard.office_building",
  capabilityRefs: ["tax.reading.gist"],
  notices: officeNotices,
  headings: officeHeadings,
});

export const r1SeedArtifacts: readonly SeedArtifact[] = [r1FamilyA, r1FamilyB];
