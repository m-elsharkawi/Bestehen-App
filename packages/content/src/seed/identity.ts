/**
 * Stable identities for the seed corpus.
 *
 * Every seed identifier is a **deterministic UUID derived from a human-readable name**, never a
 * `randomUUID()`. Three properties depend on that:
 *
 * 1. The revision digest of a seed artifact is stable across runs, so `contentRevisionDigest` can
 *    actually detect the silent mutation it exists to detect.
 * 2. Re-applying the seed is a genuine no-op rather than a fresh insert under a new primary key,
 *    which is what makes `content:seed` idempotent at all.
 * 3. A test that asserts over seeded rows can key its assertions to the row's identity. A fixture
 *    built on `randomUUID()` makes every identity-keyed assertion impossible and pushes tests
 *    towards positional assertions, which pass just as happily when a value is attached to the
 *    wrong entity.
 *
 * The derivation is RFC 4122 version 5 (SHA-1, name-based) under a fixed App namespace, so the same
 * name always yields the same identifier and two different names never collide in practice. The
 * result is a UUID because the Stage 05 relations type these columns `uuid`; the App-side contract
 * (`appId`) accepts it, and it stays opaque — a UUID reveals nothing about what it names.
 */

import { createHash } from "node:crypto";

/**
 * The seed namespace. It is a constant, not a secret: a name-based UUID namespace exists to make
 * derivation reproducible, and there is nothing to protect.
 */
export const seedUuidNamespace = "6f2a1c34-8b5d-4e97-9a01-3f5c7d2e8b40";

const seedIdentityKinds = [
  "content_family",
  "content_revision",
  "content_item",
  "key_revision",
  "media_asset",
  "media_revision",
  "rights_envelope",
  "approval_decision",
  "impact_assertion",
  "content_release",
] as const;
export type SeedIdentityKind = (typeof seedIdentityKinds)[number];

function namespaceBytes(): Buffer {
  return Buffer.from(seedUuidNamespace.replace(/-/g, ""), "hex");
}

/**
 * A deterministic RFC 4122 version 5 UUID for one named seed entity. The kind participates in the
 * name, so a family and the revision that realises it never share an identifier even when they
 * share a slug.
 */
export function seedUuid(kind: SeedIdentityKind, name: string): string {
  const digest = createHash("sha1")
    .update(namespaceBytes())
    .update(`${kind}:${name}`, "utf8")
    .digest();
  const bytes = Buffer.from(digest.subarray(0, 16));
  const versionByte = bytes[6] ?? 0;
  const variantByte = bytes[8] ?? 0;
  bytes[6] = (versionByte & 0x0f) | 0x50;
  bytes[8] = (variantByte & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** The item identity a payload position binds to. Payload `itemRef` and `contentItemId` are one fact. */
export function seedItemId(seedKey: string, itemKey: string): string {
  return seedUuid("content_item", `${seedKey}/${itemKey}`);
}
