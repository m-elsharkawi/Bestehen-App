/**
 * Publication identity: SHA-256 over a canonical JSON serialization (decision D02).
 *
 * A digest is an **integrity fact, never a semantic identity**. It exists to detect silent mutation
 * of already-published content, not to name it: identity is the opaque id, and material meaning
 * never changes behind an id.
 *
 * The canonicalization version is `canonical-json/v1` — the same version Stage 03 already records in
 * `app.operation_receipts.canonicalization_version`, so one repository has one canonicalization, not
 * two that drift.
 *
 * Module layering: this module is a leaf at runtime. It imports **types only** from `./model.js` and
 * `./keys.js`, which are erased at compile time, so nothing here creates an import cycle and nothing
 * here makes key material reachable from a value import.
 */

import { createHash } from "node:crypto";
import type { ContentRevision, ObjectiveForm, ServingManifest } from "./model.js";
import type { ObjectiveKeyRevision } from "./keys.js";

/** The canonicalization contract this module implements. Recorded alongside every digest. */
export const canonicalizationVersion = "canonical-json/v1";
export type CanonicalizationVersion = typeof canonicalizationVersion;

export type CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalJsonValue[]
  | { readonly [key: string]: CanonicalJsonValue };

/** Nesting deeper than this is a defect in the caller, and unbounded recursion is a denial of service. */
export const maxCanonicalDepth = 64;

function fail(pointer: string, detail: string): never {
  throw new Error(`canonical-json/v1 cannot serialize ${pointer || "the root value"}: ${detail}`);
}

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function write(value: unknown, pointer: string, depth: number, seen: WeakSet<object>): string {
  if (depth > maxCanonicalDepth) fail(pointer, `nesting exceeds ${maxCanonicalDepth} levels`);

  if (value === null) return "null";
  switch (typeof value) {
    case "boolean":
      return value ? "true" : "false";
    case "number": {
      if (!Number.isFinite(value)) fail(pointer, "a non-finite number has no canonical form");
      // `-0` and `0` are the same quantity; they must not produce two digests.
      return JSON.stringify(value === 0 ? 0 : value);
    }
    case "string":
      return JSON.stringify(value);
    case "undefined":
      fail(pointer, "`undefined` is not a value; omit the property instead");
      break;
    case "bigint":
      fail(pointer, "a bigint has no JSON form");
      break;
    case "function":
    case "symbol":
      fail(pointer, `a ${typeof value} is not data`);
      break;
    default:
      break;
  }

  const node = value as object;
  if (seen.has(node)) fail(pointer, "the value is cyclic");
  seen.add(node);
  try {
    if (Array.isArray(node)) {
      // Array order is meaning, so it is preserved exactly.
      const parts = node.map((entry, index) =>
        write(entry, `${pointer}/${index}`, depth + 1, seen),
      );
      return `[${parts.join(",")}]`;
    }
    if (!isPlainObject(node)) {
      fail(pointer, "only plain objects, arrays and JSON primitives are canonicalizable");
    }
    const record = node as Record<string, unknown>;
    // Object key order is *not* meaning, so it is normalised by UTF-16 code unit.
    const keys = Object.keys(record).sort();
    const parts: string[] = [];
    for (const key of keys) {
      const entry = record[key];
      // An absent property and a property explicitly set to `undefined` are the same fact.
      if (entry === undefined) continue;
      parts.push(`${JSON.stringify(key)}:${write(entry, `${pointer}/${key}`, depth + 1, seen)}`);
    }
    return `{${parts.join(",")}}`;
  } finally {
    seen.delete(node);
  }
}

/**
 * Deterministic, stable serialization: the same semantic value always produces byte-identical
 * output, whatever order its keys were inserted in. It fails loudly on anything without a canonical
 * form — a `Date`, a `Map`, a class instance, `NaN`, a cycle — rather than inventing one.
 */
export function canonicalJson(value: unknown): string {
  return write(value, "", 0, new WeakSet<object>());
}

/** SHA-256 over the canonical serialization, lower-case hex. */
export function canonicalDigest(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value), "utf8").digest("hex");
}

function withoutDigest<Value extends { readonly digest: string }>(
  value: Value,
): Omit<Value, "digest"> {
  const { digest: _digest, ...rest } = value;
  return rest;
}

/* ------------------------------------------------------------------------------------------------
 * The five publication digests of D02
 * ---------------------------------------------------------------------------------------------- */

/**
 * The digest of a content revision, over every material field except the stored digest itself. A new
 * material field participates automatically, which is the point: a digest that ignored new fields
 * could not detect the mutation it exists to detect.
 */
export function contentRevisionDigest(revision: ContentRevision): string {
  return canonicalDigest(withoutDigest(revision));
}

/** The digest of a frozen form composition, over everything but its own stored digest. */
export function formDigest(form: ObjectiveForm): string {
  return canonicalDigest(withoutDigest(form));
}

/**
 * The digest of an objective key revision. Only this digest — never the key — may cross the serving
 * boundary, which is what lets a lease pin the exact key it was scored against without revealing it.
 */
export function keyRevisionDigest(key: ObjectiveKeyRevision): string {
  return canonicalDigest(key);
}

/**
 * The minimum a media revision must state for its bytes to be identified. `media.ts` owns the full
 * `AudioRendition`/`AudioAssetManifest` shape and satisfies this structurally.
 */
export interface MediaRevisionDigestInput {
  readonly mediaRevisionId: string;
  readonly objectKey: string;
  readonly digest: string;
  readonly bytes: number;
  readonly mime: string;
  readonly codec: string;
  readonly container: string;
  readonly durationMs: number;
}

/**
 * The digest of a media revision manifest. It is deliberately distinct from the byte digest it
 * carries: the byte digest proves the bytes, this proves the manifest that describes them.
 */
export function mediaRevisionDigest(media: MediaRevisionDigestInput): string {
  return canonicalDigest(media);
}

/** The digest of a server-issued serving lease, over the exact set of things the lease pins. */
export function servingManifestDigest(manifest: ServingManifest): string {
  return canonicalDigest(manifest);
}

/**
 * A server-side pairing of a key's identity with its digest, used to build the `keyRevisionDigests`
 * of a serving lease. Only the `digest` half may cross the serving boundary — `keyRevisionId` is a
 * server-only join and is on the `keyBearingFieldNames` denylist for exactly that reason.
 */
export interface KeyRevisionReference {
  readonly keyRevisionId: string;
  readonly digest: string;
}

export function keyRevisionReference(key: ObjectiveKeyRevision): KeyRevisionReference {
  return { keyRevisionId: key.keyRevisionId, digest: keyRevisionDigest(key) };
}
