/**
 * The offline Corpus bundle reader of decision D18 — worker/operator side only.
 *
 * **This module is deliberately unreachable from `apps/web`.** Like `./client.js` it is exported
 * from no package barrel, and `packages/content/src/corpus-boundary.test.ts` asserts over the real
 * module graph that no module under `apps/web` reaches it. An attempt never reads a bundle:
 * bundles feed authoring briefs, briefs feed content, and content is published before it can be
 * served (`Architecture/10-…` §9.2, plan D18).
 *
 * What the reader implements is the offline-decidable part of the ordered validation and promotion
 * gates of `Architecture/10-…` §6.2, in their authoritative order, with the same discipline the
 * content publication gates use:
 *
 * - evaluation stops at the first blocking gate and every later gate reports `not_evaluated`;
 * - a missing recorded fact is a **block**, never a pass — in particular an unverifiable signature
 *   holds the candidate rather than promoting it;
 * - a credible material defect (a digest that does not match its bytes, a sequence regression, a
 *   partition carrying learner-facing text) **quarantines** rather than merely blocking.
 *
 * Two things this module explicitly does not claim. It performs no network call — the personal
 * profile has no Corpus host, and egress denial is a Stage 10 deployment obligation recorded as
 * unclaimed. And it canonicalizes with `canonical-json/v1`, the repository's single
 * canonicalization, rather than RFC 8785: one repository has one canonicalization, and the two
 * agree on the JSON subset a bundle manifest is allowed to contain (no floats with exponents, no
 * duplicate keys, no non-finite numbers).
 */

import { readFile } from "node:fs/promises";
import { createPublicKey, verify as verifySignature } from "node:crypto";
import { canonicalDigest, canonicalJson } from "../digest.js";
import { findForbiddenOutboundFields } from "../corpus-request.js";

/* ------------------------------------------------------------------------------------------------
 * The bundle shape (`Architecture/10-…` §5.2)
 * ---------------------------------------------------------------------------------------------- */

export const supportedBundlePackagingSchema = "corpus-bundle-packaging/v1";
export const supportedBundleIndexSchema = "corpus-publication-index/v1";
export const supportedBundleContractMajor = 1;

/** Capabilities this importer can materialize. An unknown required capability is `incompatible`. */
export const supportedAppCapabilities: readonly string[] = [
  "exam_structure_release/v1",
  "skill_graph_release/v1",
  "generation_blueprint_release/v1",
  "demand_signal_release/v1",
];

export interface CorpusFamilyPartition {
  readonly family: string;
  readonly payloadSchema: string;
  readonly objectDigest: string;
  readonly byteSize: number;
  readonly recordCount: number;
}

export interface CorpusBundleManifest {
  readonly bundleId: string;
  readonly bundleRevision: number;
  readonly packagingSchema: string;
  readonly contractVersion: {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
  };
  readonly capabilityScope: readonly string[];
  readonly publishedAt: string;
  readonly effectiveAt: string;
  readonly supersedes: readonly string[];
  readonly state: "current" | "superseded" | "withdrawn";
  readonly requiredAppCapabilities: readonly string[];
  readonly taxonomyRelease: string;
  readonly targetProfileRelease: string;
  readonly familyPartitions: readonly CorpusFamilyPartition[];
  readonly exactAssetPartitions: readonly unknown[];
  readonly impactManifestRef: string | null;
  readonly limitations: readonly string[];
  readonly signingKeyId: string;
  /** Base64 Ed25519 signature over `canonicalJson(manifest without signature)`. */
  readonly signature: string | null;
}

export interface CorpusPublicationIndexEntry {
  readonly bundleId: string;
  readonly bundleRevision: number;
  readonly contractVersion: {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
  };
  readonly capabilityScope: readonly string[];
  readonly manifestDigest: string;
  readonly immutableLocation: string;
  readonly publishedAt: string;
  readonly effectiveAt: string;
  readonly supersedes: readonly string[];
  readonly impactClass: string | null;
}

export interface CorpusPublicationIndex {
  readonly indexSchema: string;
  readonly publisherId: string;
  readonly publicationSequence: number;
  readonly generatedAt: string;
  readonly signingKeyId: string;
  readonly entries: readonly CorpusPublicationIndexEntry[];
}

/**
 * The committed fixture: a publication index, one bundle manifest and the digest-addressed objects
 * the manifest names, in one file so the import path is exercisable with no network and no host.
 */
export interface CorpusBundleFixture {
  readonly packagingSchema: string;
  readonly index: CorpusPublicationIndex;
  readonly manifest: CorpusBundleManifest;
  readonly objects: Readonly<Record<string, unknown>>;
}

/* ------------------------------------------------------------------------------------------------
 * Gates and findings
 * ---------------------------------------------------------------------------------------------- */

export const corpusImportGateIds = [
  "packaging_schema",
  "index_authenticity_and_sequence",
  "manifest_authenticity",
  "bounded_parse_limits",
  "contract_compatibility",
  "object_digest_verification",
  "identity_and_revision_uniqueness",
  "governance_completeness",
  "non_reconstructive_boundary",
] as const;
export type CorpusImportGateId = (typeof corpusImportGateIds)[number];

export const corpusImportFindingCodes = [
  "packaging_schema_unsupported",
  "index_schema_unsupported",
  "index_entry_missing_for_manifest",
  "index_manifest_digest_mismatch",
  "publication_sequence_regression",
  "signature_absent",
  "signing_key_not_trusted",
  "signature_invalid",
  "declared_limit_exceeded",
  "contract_major_unsupported",
  "required_capability_unsupported",
  "object_missing_for_partition",
  "object_digest_mismatch",
  "object_byte_size_mismatch",
  "object_record_count_mismatch",
  "undeclared_object_present",
  "duplicate_record_identity",
  "revision_not_monotonic",
  "governance_field_missing",
  "cross_reference_unresolved",
  "learner_facing_text_present",
  "learner_data_present",
  "exact_asset_partition_not_permitted",
] as const;
export type CorpusImportFindingCode = (typeof corpusImportFindingCodes)[number];

export interface CorpusImportFinding {
  readonly code: CorpusImportFindingCode;
  readonly pointer: string;
  readonly detail: string;
  readonly requiresQuarantine: boolean;
}

export type CorpusImportGateStatus = "pass" | "blocked" | "not_evaluated";

export interface CorpusImportGateResult {
  readonly gate: CorpusImportGateId;
  readonly ordinal: number;
  readonly status: CorpusImportGateStatus;
  readonly findings: readonly CorpusImportFinding[];
}

export type CorpusImportDecision = "promotable" | "held" | "quarantine_required";

export interface CorpusImportValidation {
  readonly decision: CorpusImportDecision;
  readonly bundleId: string;
  readonly bundleRevision: number;
  readonly manifestDigest: string;
  readonly gateResults: readonly CorpusImportGateResult[];
  readonly firstBlockingGate?: CorpusImportGateId;
  readonly findings: readonly CorpusImportFinding[];
}

export interface CorpusImportOptions {
  /**
   * Trusted publisher public keys, keyed by `signingKeyId`, in SPKI PEM form. The personal profile
   * ships **no** key ring, so the default is empty and the fixture is *held*, not promoted. That is
   * deliberate: "we could not check the signature" is never "the signature was fine".
   */
  readonly keyRing?: ReadonlyMap<string, string>;
  /** The highest publication sequence already accepted. An older index can never roll the App back. */
  readonly highestAcceptedSequence?: number;
  /** Declared parse ceilings, enforced before allocation (`Architecture/10-…` §6.2 gate 3). */
  readonly limits?: {
    readonly maxObjectBytes: number;
    readonly maxRecordsPerPartition: number;
    readonly maxPartitions: number;
  };
}

export const defaultCorpusImportLimits = {
  maxObjectBytes: 256 * 1024,
  maxRecordsPerPartition: 512,
  maxPartitions: 16,
} as const;

/**
 * Field names that would make a bundle carry learner-facing expression. A bundle is a blueprint and
 * governance envelope; the moment it carries a stimulus, an option label or a transcript it is
 * reconstructive source, which quarantines (`Architecture/10-…` §5.4 family 5, §8.3).
 */
export const learnerFacingTextFieldNames: readonly string[] = [
  "candidateBank",
  "learnerSafeLabel",
  "options",
  "safeContentNodes",
  "stimulusText",
  "transcript",
  "writtenInstructionNodes",
];

const learnerFacingTextFieldNameSet: ReadonlySet<string> = new Set(learnerFacingTextFieldNames);

function finding(
  code: CorpusImportFindingCode,
  pointer: string,
  detail: string,
  requiresQuarantine = false,
): CorpusImportFinding {
  return { code, pointer, detail, requiresQuarantine };
}

function manifestWithoutSignature(
  manifest: CorpusBundleManifest,
): Omit<CorpusBundleManifest, "signature"> {
  const { signature: _signature, ...rest } = manifest;
  return rest;
}

/** The manifest digest: `canonical-json/v1` over the manifest with its own signature removed. */
export function corpusManifestDigest(manifest: CorpusBundleManifest): string {
  return canonicalDigest(manifestWithoutSignature(manifest));
}

/* ------------------------------------------------------------------------------------------------
 * The gates
 * ---------------------------------------------------------------------------------------------- */

function evaluatePackagingSchema(fixture: CorpusBundleFixture): readonly CorpusImportFinding[] {
  const findings: CorpusImportFinding[] = [];
  if (fixture.packagingSchema !== supportedBundlePackagingSchema) {
    findings.push(
      finding(
        "packaging_schema_unsupported",
        "/packagingSchema",
        `A reader must explicitly support a packaging schema before staging objects; \`${fixture.packagingSchema}\` is not \`${supportedBundlePackagingSchema}\`.`,
      ),
    );
  }
  if (fixture.manifest.packagingSchema !== supportedBundlePackagingSchema) {
    findings.push(
      finding(
        "packaging_schema_unsupported",
        "/manifest/packagingSchema",
        "The manifest declares a packaging schema this reader does not support.",
      ),
    );
  }
  return findings;
}

function evaluateIndex(
  fixture: CorpusBundleFixture,
  options: CorpusImportOptions,
): readonly CorpusImportFinding[] {
  const findings: CorpusImportFinding[] = [];
  const { index, manifest } = fixture;
  if (index.indexSchema !== supportedBundleIndexSchema) {
    findings.push(
      finding(
        "index_schema_unsupported",
        "/index/indexSchema",
        `\`${index.indexSchema}\` is not the supported publication index schema.`,
      ),
    );
  }
  const highest = options.highestAcceptedSequence ?? -1;
  if (index.publicationSequence <= highest) {
    findings.push(
      finding(
        "publication_sequence_regression",
        "/index/publicationSequence",
        `Sequence ${index.publicationSequence} does not advance past the accepted ${highest}; an older index never rolls the App back.`,
        true,
      ),
    );
  }
  // Entry lookup is by identity, never by position: the index may list many bundles and the one
  // this fixture carries is found by (bundleId, bundleRevision), not by being first.
  const entry = index.entries.find(
    (candidate) =>
      candidate.bundleId === manifest.bundleId &&
      candidate.bundleRevision === manifest.bundleRevision,
  );
  if (!entry) {
    findings.push(
      finding(
        "index_entry_missing_for_manifest",
        "/index/entries",
        `The index does not publish \`${manifest.bundleId}@${manifest.bundleRevision}\`; the signed index is the discovery aid and a bundle it never announced is not a candidate.`,
        true,
      ),
    );
    return findings;
  }
  const computed = corpusManifestDigest(manifest);
  if (entry.manifestDigest !== computed) {
    findings.push(
      finding(
        "index_manifest_digest_mismatch",
        "/index/entries/manifestDigest",
        "The index announces a manifest digest that the manifest bytes do not produce.",
        true,
      ),
    );
  }
  return findings;
}

function evaluateManifestAuthenticity(
  fixture: CorpusBundleFixture,
  options: CorpusImportOptions,
): readonly CorpusImportFinding[] {
  const { manifest } = fixture;
  const keyRing = options.keyRing ?? new Map<string, string>();
  if (manifest.signature === null || manifest.signature.trim() === "") {
    return [
      finding(
        "signature_absent",
        "/manifest/signature",
        "The manifest carries no publisher signature, so authenticity cannot be established; the candidate is held rather than promoted.",
      ),
    ];
  }
  const publicKeyPem = keyRing.get(manifest.signingKeyId);
  if (publicKeyPem === undefined) {
    return [
      finding(
        "signing_key_not_trusted",
        "/manifest/signingKeyId",
        `\`${manifest.signingKeyId}\` is not in the allowlisted publisher key ring. A bundle cannot introduce its own trusted key.`,
      ),
    ];
  }
  let verified = false;
  try {
    verified = verifySignature(
      null,
      Buffer.from(canonicalJson(manifestWithoutSignature(manifest)), "utf8"),
      createPublicKey(publicKeyPem),
      Buffer.from(manifest.signature, "base64"),
    );
  } catch {
    verified = false;
  }
  if (!verified) {
    return [
      finding(
        "signature_invalid",
        "/manifest/signature",
        "The publisher signature does not verify over the canonical manifest.",
        true,
      ),
    ];
  }
  return [];
}

function evaluateLimits(
  fixture: CorpusBundleFixture,
  options: CorpusImportOptions,
): readonly CorpusImportFinding[] {
  const findings: CorpusImportFinding[] = [];
  const limits = options.limits ?? defaultCorpusImportLimits;
  const partitions = fixture.manifest.familyPartitions;
  if (partitions.length > limits.maxPartitions) {
    findings.push(
      finding(
        "declared_limit_exceeded",
        "/manifest/familyPartitions",
        `${partitions.length} partitions exceed the configured ceiling of ${limits.maxPartitions}.`,
      ),
    );
  }
  for (const partition of partitions) {
    if (partition.byteSize > limits.maxObjectBytes) {
      findings.push(
        finding(
          "declared_limit_exceeded",
          `/manifest/familyPartitions/${partition.family}/byteSize`,
          `Declared ${partition.byteSize} bytes exceeds the configured ceiling of ${limits.maxObjectBytes}.`,
        ),
      );
    }
    if (partition.recordCount > limits.maxRecordsPerPartition) {
      findings.push(
        finding(
          "declared_limit_exceeded",
          `/manifest/familyPartitions/${partition.family}/recordCount`,
          `Declared ${partition.recordCount} records exceeds the configured ceiling of ${limits.maxRecordsPerPartition}.`,
        ),
      );
    }
  }
  return findings;
}

function evaluateCompatibility(fixture: CorpusBundleFixture): readonly CorpusImportFinding[] {
  const findings: CorpusImportFinding[] = [];
  const { manifest } = fixture;
  if (manifest.contractVersion.major !== supportedBundleContractMajor) {
    findings.push(
      finding(
        "contract_major_unsupported",
        "/manifest/contractVersion/major",
        `Contract major ${manifest.contractVersion.major} is never parsed into domain meaning by an importer that supports ${supportedBundleContractMajor}; the last compatible snapshot stays active.`,
      ),
    );
  }
  const supported = new Set(supportedAppCapabilities);
  for (const capability of manifest.requiredAppCapabilities) {
    if (!supported.has(capability)) {
      findings.push(
        finding(
          "required_capability_unsupported",
          `/manifest/requiredAppCapabilities/${capability}`,
          "An unsupported required capability quarantines the declared closure rather than being coerced.",
        ),
      );
    }
  }
  return findings;
}

function evaluateObjectDigests(fixture: CorpusBundleFixture): readonly CorpusImportFinding[] {
  const findings: CorpusImportFinding[] = [];
  const declared = new Set<string>();
  for (const partition of fixture.manifest.familyPartitions) {
    declared.add(partition.objectDigest);
    const object = fixture.objects[partition.objectDigest];
    if (object === undefined) {
      findings.push(
        finding(
          "object_missing_for_partition",
          `/manifest/familyPartitions/${partition.family}/objectDigest`,
          "A declared partition has no object; there is no partial promotion and no `latest` substitution.",
          true,
        ),
      );
      continue;
    }
    const serialized = canonicalJson(object);
    const computed = canonicalDigest(object);
    if (computed !== partition.objectDigest) {
      findings.push(
        finding(
          "object_digest_mismatch",
          `/objects/${partition.objectDigest}`,
          "The object's bytes do not produce the digest the manifest declares.",
          true,
        ),
      );
    }
    const bytes = Buffer.byteLength(serialized, "utf8");
    if (bytes !== partition.byteSize) {
      findings.push(
        finding(
          "object_byte_size_mismatch",
          `/manifest/familyPartitions/${partition.family}/byteSize`,
          `Declared ${partition.byteSize} bytes; the canonical object is ${bytes}.`,
          true,
        ),
      );
    }
    const records = Array.isArray((object as { records?: unknown }).records)
      ? (object as { records: readonly unknown[] }).records.length
      : -1;
    if (records !== partition.recordCount) {
      findings.push(
        finding(
          "object_record_count_mismatch",
          `/manifest/familyPartitions/${partition.family}/recordCount`,
          `Declared ${partition.recordCount} records; the object holds ${records}.`,
          true,
        ),
      );
    }
  }
  for (const digest of Object.keys(fixture.objects)) {
    if (!declared.has(digest)) {
      findings.push(
        finding(
          "undeclared_object_present",
          `/objects/${digest}`,
          "An undeclared object is never staged; the manifest is the complete object list.",
          true,
        ),
      );
    }
  }
  if (fixture.manifest.exactAssetPartitions.length > 0) {
    findings.push(
      finding(
        "exact_asset_partition_not_permitted",
        "/manifest/exactAssetPartitions",
        "Exact source partitions are operator-only and are not imported without a real direct-use need and action eligibility.",
      ),
    );
  }
  return findings;
}

function recordIdentities(object: unknown): readonly string[] {
  const records = (object as { records?: readonly unknown[] }).records;
  if (!Array.isArray(records)) return [];
  return records.map((record) => {
    const typed = record as { id?: unknown; revision?: unknown };
    return `${String(typed.id)}@${String(typed.revision)}`;
  });
}

function evaluateIdentityUniqueness(fixture: CorpusBundleFixture): readonly CorpusImportFinding[] {
  const findings: CorpusImportFinding[] = [];
  if (!Number.isInteger(fixture.manifest.bundleRevision) || fixture.manifest.bundleRevision < 1) {
    findings.push(
      finding(
        "revision_not_monotonic",
        "/manifest/bundleRevision",
        "A bundle revision is a positive integer that only advances.",
      ),
    );
  }
  const seen = new Set<string>();
  for (const partition of fixture.manifest.familyPartitions) {
    const object = fixture.objects[partition.objectDigest];
    if (object === undefined) continue;
    for (const identity of recordIdentities(object)) {
      const scoped = `${partition.family}:${identity}`;
      if (seen.has(scoped)) {
        findings.push(
          finding(
            "duplicate_record_identity",
            `/objects/${partition.objectDigest}/records/${identity}`,
            "Stable identities are never reused; a duplicate identity/revision pair is a publisher defect.",
            true,
          ),
        );
      }
      seen.add(scoped);
    }
  }
  return findings;
}

const requiredGovernanceFields = [
  "lifecycle",
  "useEligibility",
  "confidence",
  "currentness",
  "versions",
  "provenanceSummary",
] as const;

function evaluateGovernance(fixture: CorpusBundleFixture): readonly CorpusImportFinding[] {
  const findings: CorpusImportFinding[] = [];
  const taxonomyNodeIds = new Set<string>();
  for (const partition of fixture.manifest.familyPartitions) {
    if (partition.family !== "skill_graph_release") continue;
    const object = fixture.objects[partition.objectDigest] as
      | { readonly records?: readonly { readonly id?: unknown }[] }
      | undefined;
    for (const record of object?.records ?? []) taxonomyNodeIds.add(String(record.id));
  }

  for (const partition of fixture.manifest.familyPartitions) {
    const object = fixture.objects[partition.objectDigest] as
      | { readonly records?: readonly Record<string, unknown>[] }
      | undefined;
    for (const record of object?.records ?? []) {
      const identity = `${String(record.id)}@${String(record.revision)}`;
      for (const field of requiredGovernanceFields) {
        if (record[field] === undefined || record[field] === null) {
          findings.push(
            finding(
              "governance_field_missing",
              `/objects/${partition.objectDigest}/records/${identity}/${field}`,
              "The governance envelope is the complete App input; a missing consequential field denies the claimed use.",
            ),
          );
        }
      }
      const refs = record.taxonomyNodeRefs;
      if (!Array.isArray(refs)) continue;
      for (const ref of refs) {
        if (!taxonomyNodeIds.has(String(ref))) {
          findings.push(
            finding(
              "cross_reference_unresolved",
              `/objects/${partition.objectDigest}/records/${identity}/taxonomyNodeRefs/${String(ref)}`,
              "Cross-reference closure fails: the bundle cites a taxonomy node it does not publish.",
              true,
            ),
          );
        }
      }
    }
  }
  return findings;
}

function findLearnerFacingText(value: unknown, pointer: string, depth: number): readonly string[] {
  if (depth > 32 || typeof value !== "object" || value === null) return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      findLearnerFacingText(entry, `${pointer}/${index}`, depth + 1),
    );
  }
  const found: string[] = [];
  for (const [name, entry] of Object.entries(value)) {
    const childPointer = `${pointer}/${name}`;
    if (learnerFacingTextFieldNameSet.has(name)) found.push(childPointer);
    found.push(...findLearnerFacingText(entry, childPointer, depth + 1));
  }
  return found;
}

function evaluateNonReconstructive(fixture: CorpusBundleFixture): readonly CorpusImportFinding[] {
  const findings: CorpusImportFinding[] = [];
  for (const pointer of findLearnerFacingText(fixture.objects, "/objects", 0)) {
    findings.push(
      finding(
        "learner_facing_text_present",
        pointer,
        "A bundle is a blueprint and governance envelope; learner-facing expression makes it reconstructive source.",
        true,
      ),
    );
  }
  // The same scan the outbound guard uses, applied inbound. Learner data has no business in a
  // Corpus bundle in either direction, and a bundle that carries some is a governance incident.
  for (const field of findForbiddenOutboundFields(fixture.objects)) {
    findings.push(
      finding(
        "learner_data_present",
        `/objects${field.pointer}`,
        `A bundle carries no learner data; \`${field.fieldName}\` is a learner or profile field.`,
        true,
      ),
    );
  }
  return findings;
}

function evaluateGate(
  gate: CorpusImportGateId,
  fixture: CorpusBundleFixture,
  options: CorpusImportOptions,
): readonly CorpusImportFinding[] {
  switch (gate) {
    case "packaging_schema":
      return evaluatePackagingSchema(fixture);
    case "index_authenticity_and_sequence":
      return evaluateIndex(fixture, options);
    case "manifest_authenticity":
      return evaluateManifestAuthenticity(fixture, options);
    case "bounded_parse_limits":
      return evaluateLimits(fixture, options);
    case "contract_compatibility":
      return evaluateCompatibility(fixture);
    case "object_digest_verification":
      return evaluateObjectDigests(fixture);
    case "identity_and_revision_uniqueness":
      return evaluateIdentityUniqueness(fixture);
    case "governance_completeness":
      return evaluateGovernance(fixture);
    case "non_reconstructive_boundary":
      return evaluateNonReconstructive(fixture);
  }
}

/**
 * Runs the offline-decidable import gates in their authoritative order. Evaluation stops at the
 * first gate that produces a finding; later gates report `not_evaluated`, because a downstream pass
 * over upstream-failed material would be a false record.
 */
export function validateCorpusBundle(
  fixture: CorpusBundleFixture,
  options: CorpusImportOptions = {},
): CorpusImportValidation {
  const gateResults: CorpusImportGateResult[] = [];
  const findings: CorpusImportFinding[] = [];
  let firstBlockingGate: CorpusImportGateId | undefined;

  corpusImportGateIds.forEach((gate, index) => {
    const ordinal = index + 1;
    if (firstBlockingGate !== undefined) {
      gateResults.push({ gate, ordinal, status: "not_evaluated", findings: [] });
      return;
    }
    const gateFindings = evaluateGate(gate, fixture, options);
    if (gateFindings.length > 0) firstBlockingGate = gate;
    findings.push(...gateFindings);
    gateResults.push({
      gate,
      ordinal,
      status: gateFindings.length === 0 ? "pass" : "blocked",
      findings: gateFindings,
    });
  });

  const decision: CorpusImportDecision = findings.some((entry) => entry.requiresQuarantine)
    ? "quarantine_required"
    : findings.length > 0
      ? "held"
      : "promotable";

  return {
    decision,
    bundleId: fixture.manifest.bundleId,
    bundleRevision: fixture.manifest.bundleRevision,
    manifestDigest: corpusManifestDigest(fixture.manifest),
    gateResults,
    ...(firstBlockingGate === undefined ? {} : { firstBlockingGate }),
    findings,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Reading the committed fixture
 * ---------------------------------------------------------------------------------------------- */

/** The repository-relative location of the offline bundle fixture and its digest sidecar. */
export const corpusBundleFixturePath = "packages/content/src/fixtures/corpus/bundle-v1.json";
export const corpusBundleDigestSidecarPath =
  "packages/content/src/fixtures/corpus/bundle-v1.digest.json";

export interface CorpusBundleDigestSidecar {
  readonly canonicalizationVersion: string;
  readonly bundleId: string;
  readonly bundleRevision: number;
  readonly manifestDigest: string;
  readonly objectDigests: Readonly<Record<string, string>>;
}

/** Parses the fixture with a bounded read. It performs no network access of any kind. */
export async function readCorpusBundleFixture(
  filePath: string,
  maximumBytes = 1024 * 1024,
): Promise<CorpusBundleFixture> {
  const raw = await readFile(filePath, "utf8");
  if (Buffer.byteLength(raw, "utf8") > maximumBytes) {
    throw new Error(`Corpus bundle fixture exceeds the ${maximumBytes} byte parse ceiling.`);
  }
  return JSON.parse(raw) as CorpusBundleFixture;
}

export async function readCorpusBundleDigestSidecar(
  filePath: string,
): Promise<CorpusBundleDigestSidecar> {
  return JSON.parse(await readFile(filePath, "utf8")) as CorpusBundleDigestSidecar;
}
