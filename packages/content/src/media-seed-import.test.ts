import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { canonicalDigest, canonicalJson } from "./digest.js";
import { audioCatalogueValidator } from "./media-catalogue.js";
import { prepareCommittedSeedMediaImport } from "./media-seed-import.js";
import {
  contentSeedReleaseV1,
  h1SeedFamilies,
  h2SeedFamilies,
  h3SeedFamilies,
} from "./seed/index.js";

describe("P05-MEDIA-001 P05-SEED-001 offline successor graph", () => {
  it("keeps the committed release byte-equivalent and exposes authored mapping for every H family", async () => {
    const committed: unknown = JSON.parse(
      await readFile(new URL("./seed/release.json", import.meta.url), "utf8"),
    );
    expect(canonicalJson(contentSeedReleaseV1)).toBe(canonicalJson(committed));
    for (const family of [...h1SeedFamilies, ...h2SeedFamilies, ...h3SeedFamilies]) {
      expect(family.authoredMediaBindings).toHaveLength(family.artifact.revision.items.length);
      for (const binding of family.authoredMediaBindings)
        expect(
          family.artifact.revision.items.find(
            (item) => item.contentItemId === binding.contentItemId,
          )?.binding,
        ).toMatchObject({ questionId: binding.questionId });
    }
  });
  it("repins all 22 assets and all item/key/payload identities without approval or mutation", () => {
    const before = canonicalDigest(contentSeedReleaseV1);
    const prepared = prepareCommittedSeedMediaImport();
    expect(prepared.catalogue.records).toHaveLength(22);
    expect(prepared.catalogue.objects).toHaveLength(66);
    expect(prepareCommittedSeedMediaImport()).toEqual(prepared);
    expect(canonicalDigest(contentSeedReleaseV1)).toBe(before);
    for (const entry of prepared.successorRelease.entries) {
      const original = required(
        prepared.originalRelease.entries.find(
          (source) => source.revisionId === entry.predecessorRevisionId,
        ),
      );
      expect(entry.revisionId).not.toBe(original.revisionId);
      expect(entry.seedKey).toBe(original.seedKey);
      expect(entry.revisionLabel).not.toBe(entry.seedKey);
      expect(entry.rightsEnvelopeId).not.toBe(original.rightsEnvelopeId);
      expect(entry.rights.componentScope.componentRef).toBe(entry.revisionId);
      expect(original.rights.componentScope.componentRef).toBe(original.revisionId);
      expect(entry.approvalCommand).toBeNull();
      expect(entry.validation.decision).not.toBe("publishable");
      const payload = entry.revision.learnerPayload;
      if (!("questions" in payload)) throw new Error("expected Listening questions");
      for (const item of entry.revision.items) {
        expect(item.scorable.itemId).toBe(item.contentItemId);
        const key = required(
          entry.keys.find((key) => key.keyRevisionId === item.scorable.keyRevisionId),
        );
        expect(key.itemId).toBe(item.contentItemId);
        expect(payload.questions.some((question) => question.itemRef === item.contentItemId)).toBe(
          true,
        );
        expect(
          original.revision.items.some((old) => old.contentItemId === item.predecessorItemId),
        ).toBe(true);
        expect(
          original.revision.items.some((old) => old.contentItemId === item.contentItemId),
        ).toBe(false);
        expect(key.independentValidatorResult.agreedWithProposedKey).toBe(false);
      }
      audioCatalogueValidator.validateBindings({
        contentRevisionId: entry.revisionId,
        learnerPayload: payload,
        records: prepared.catalogue.records.filter(
          (record) => record.contentRevisionId === entry.revisionId,
        ),
        bindings: prepared.catalogue.bindings
          .filter((binding) => binding.contentRevisionId === entry.revisionId)
          .toReversed(),
      });
    }
  });
});

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("required_media_identity_missing");
  return value;
}
