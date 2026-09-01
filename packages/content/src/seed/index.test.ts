import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { offeredIdentifiersByItemRef } from "../publication.js";
import type { TaskFamilyKind } from "../task-families.js";
import {
  ambiguousQuarantineFixture,
  contentSeedReleaseV1,
  negativeSeedFixtures,
  renderFakeSpeech,
  seedArtifactsByTaskFamily,
  seedAudioManifests,
  seedReleaseValidation,
  servingSeedArtifacts,
  withdrawalFixture,
} from "./index.js";

const expectedSeedKeys: Readonly<Record<TaskFamilyKind, readonly [string, string]>> = {
  R1HeadingMatching: ["r1-nachbarschaftszentrum", "r1-buerogebaeude"],
  R2DetailedSelect: ["r2-fahrgemeinschaft", "r2-bibliothek"],
  R3SituationNoticeMatching: ["r3-stadtleben", "r3-landkreis"],
  SB1ContextualGrammarCloze: ["sb1-wochenendbesuch", "sb1-fotoclub"],
  SB2SharedBankLexicalCloze: ["sb2-internetwerkstatt", "sb2-nachbarschaftsgarten"],
  H1ShortAnnouncements: ["h1-unterwegs", "h1-stadtleben"],
  H2ConversationInterview: ["h2-fahrradwerkstatt", "h2-kochkurs"],
  H3ShortFunctionalTexts: ["h3-nachrichten", "h3-termine"],
};

describe("P05-SEED-001 typed C3 release", () => {
  it("assembles two named siblings for every task family and passes every invariant", () => {
    expect(seedReleaseValidation).toMatchObject({ valid: true, findings: [] });
    expect(servingSeedArtifacts).toHaveLength(16);
    for (const [kind, expectedKeys] of Object.entries(expectedSeedKeys) as [
      TaskFamilyKind,
      readonly [string, string],
    ][]) {
      const bySeedKey = new Map(
        seedArtifactsByTaskFamily[kind].map((artifact) => [artifact.seedKey, artifact]),
      );
      expect(bySeedKey.size).toBe(2);
      for (const seedKey of expectedKeys) {
        const artifact = bySeedKey.get(seedKey);
        expect(artifact?.revision.learnerPayload.kind).toBe(kind);
        expect(artifact?.revision.contentClass).toBe("C3");
        expect(artifact?.requestedLevel).toBe("training");
      }
    }
  });

  it("keeps each key attached to its own item and to identities that item actually offers", () => {
    for (const artifact of servingSeedArtifacts) {
      const itemsById = new Map(artifact.revision.items.map((item) => [item.contentItemId, item]));
      const offeredByItemId = offeredIdentifiersByItemRef(artifact.revision.learnerPayload);
      const keysById = new Map(artifact.keys.map((key) => [key.keyRevisionId, key]));
      expect(itemsById.size).toBe(artifact.keys.length);
      for (const [itemId, item] of itemsById) {
        const key = keysById.get(item.scorable.keyRevisionId);
        expect(key?.itemId).toBe(itemId);
        expect(key?.independentValidatorResult.validatorRef).toBe(
          "system:deterministic-key-derivation",
        );
        const offered = new Set(offeredByItemId.get(itemId));
        for (const response of key?.acceptedResponseSet ?? []) {
          if (response.kind === "option") expect(offered.has(response.optionId)).toBe(true);
          if (response.kind === "match") expect(offered.has(response.rightId)).toBe(true);
          if (response.kind === "candidate") expect(offered.has(response.candidateId)).toBe(true);
          if (response.kind === "no_match") {
            expect(item.binding).toEqual({ kind: "match", leftId: response.leftId });
          }
        }
      }
    }
  });

  it("pins every fake rendition to the script-derived bytes and to the correct revision", () => {
    const manifestByMediaId = new Map(
      seedAudioManifests.map((manifest) => [manifest.rendition.mediaRevisionId, manifest]),
    );
    expect(manifestByMediaId.size).toBe(seedAudioManifests.length);
    for (const artifact of servingSeedArtifacts) {
      const listening = artifact.revision.learnerPayload.kind.startsWith("H");
      expect(artifact.revision.mediaRevisionIds.length > 0).toBe(listening);
      for (const mediaRevisionId of artifact.revision.mediaRevisionIds) {
        const manifest = manifestByMediaId.get(mediaRevisionId);
        expect(manifest?.contentSeedKey).toBe(artifact.seedKey);
        const bytes = renderFakeSpeech(manifest?.script ?? "");
        expect(bytes.length).toBe(manifest?.rendition.bytes);
        expect(createHash("sha256").update(bytes).digest("hex")).toBe(manifest?.rendition.digest);
        expect(manifest?.limitations).toEqual([
          "not_speech",
          "not_p4_approved",
          "owner_05_a_unclaimed",
        ]);
      }
    }
  });

  it("keeps quarantine and withdrawal as distinct negative subjects", () => {
    expect(negativeSeedFixtures.quarantine.seedKey).toBe("fixture-quarantine-ambiguous-sb1");
    expect(ambiguousQuarantineFixture.intent).toBe("quarantine_fixture");
    expect(
      seedReleaseValidation.publicationByRevisionId[
        ambiguousQuarantineFixture.revision.contentRevisionId
      ]?.decision,
    ).toBe("quarantine_required");
    expect(withdrawalFixture.intent).toBe("withdrawal_fixture");
    expect(withdrawalFixture.rights.identity.state).toBe("withdrawn");
    expect(withdrawalFixture.rights.incidentDisposition?.affectedArtifactSelectors).toEqual([
      withdrawalFixture.revision.contentRevisionId,
    ]);
  });

  it("records honest original-work provenance on every entry", () => {
    for (const artifact of [...servingSeedArtifacts, ...Object.values(negativeSeedFixtures)]) {
      expect(artifact.rights.provenance).toMatchObject({
        corpusBundleRef: null,
        sourceRevisionRef: null,
        groundingManifest: "originally-authored",
      });
      expect(artifact.rights.provenance.note).toContain(
        "No restricted source expression was consulted",
      );
      expect(artifact.rights.exactCredit).toMatchObject({
        attributionRequired: false,
        authorOrRightsholder: "Bestehen practice material",
        licenceIdentifier: "proprietary-internal",
      });
    }
  });

  it("keeps the generated package-neutral release document byte-for-byte current", async () => {
    const generated = JSON.parse(
      await readFile(new URL("./release.json", import.meta.url), "utf8"),
    ) as unknown;
    expect(generated).toEqual(contentSeedReleaseV1);
  });
});
