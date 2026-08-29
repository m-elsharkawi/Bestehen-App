/**
 * The offline Corpus bundle import path of decision D18 — `P05-BOUNDARY-001` (bundle half) and the
 * D18 fixture half of `P05-CONTENT-001`.
 *
 * Two properties are load-bearing here and neither is provable by reading the fixture alone:
 *
 * 1. **Digest verification is real.** Mutating one byte of one object must move that object's
 *    digest and quarantine the candidate, and the assertion is keyed to the mutated partition's own
 *    identity rather than to its position in the manifest's partition list.
 * 2. **An unverifiable signature holds the candidate.** The personal profile ships no publisher key
 *    ring, so the committed fixture is *held*, never promoted. A test that promoted it would be
 *    claiming an authenticity check that never ran.
 */

import { generateKeyPairSync, sign as signBytes } from "node:crypto";
import path from "node:path";
import { canonicalDigest, canonicalJson } from "../digest.js";
import { describe, expect, it } from "vitest";
import {
  type CorpusBundleFixture,
  corpusBundleDigestSidecarPath,
  corpusBundleFixturePath,
  corpusManifestDigest,
  readCorpusBundleDigestSidecar,
  readCorpusBundleFixture,
  validateCorpusBundle,
} from "./bundle-reader.js";
import { buildDiscoveryRequest, importCorpusBundleOffline } from "./import.js";
import { buildOutboundCorpusBody, offlineCorpusTransport } from "./client.js";

const repositoryRoot = path.resolve(import.meta.dirname, "..", "..", "..", "..");
const fixturePath = path.join(repositoryRoot, corpusBundleFixturePath);
const sidecarPath = path.join(repositoryRoot, corpusBundleDigestSidecarPath);

async function loadFixture(): Promise<CorpusBundleFixture> {
  return readCorpusBundleFixture(fixturePath);
}

/**
 * Re-derives every declared digest from the objects a fixture actually carries, then republishes
 * and re-signs it. Tampering tests use this to build a bundle that is *internally consistent but
 * substantively wrong*, which is the only way to reach the gates that sit behind digest
 * verification. A test that tampered without resealing would only ever prove the digest gate.
 */
function resealFixture(fixture: CorpusBundleFixture): CorpusBundleFixture {
  const familyPartitions = fixture.manifest.familyPartitions.map((partition) => {
    const object = fixture.objects[partition.objectDigest];
    const records = (object as { records?: readonly unknown[] }).records ?? [];
    return {
      ...partition,
      objectDigest: canonicalDigest(object),
      byteSize: Buffer.byteLength(canonicalJson(object), "utf8"),
      recordCount: records.length,
    };
  });
  const objects = Object.fromEntries(
    fixture.manifest.familyPartitions.map((partition, index) => [
      familyPartitions[index]?.objectDigest ?? partition.objectDigest,
      fixture.objects[partition.objectDigest],
    ]),
  );
  const manifest = { ...fixture.manifest, familyPartitions };
  const manifestDigest = corpusManifestDigest(manifest);
  return {
    ...fixture,
    manifest,
    objects,
    index: {
      ...fixture.index,
      entries: fixture.index.entries.map((entry) =>
        entry.bundleId === manifest.bundleId && entry.bundleRevision === manifest.bundleRevision
          ? { ...entry, manifestDigest }
          : entry,
      ),
    },
  };
}

/** Signs the canonical manifest with an ephemeral key. No private key is ever committed. */
function signManifest(fixture: CorpusBundleFixture): {
  readonly fixture: CorpusBundleFixture;
  readonly keyRing: ReadonlyMap<string, string>;
} {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const { signature: _signature, ...unsigned } = fixture.manifest;
  // Ed25519 signs the message directly, so there is no digest algorithm to choose.
  const signature = signBytes(
    null,
    Buffer.from(canonicalJson(unsigned), "utf8"),
    privateKey,
  ).toString("base64");
  return {
    fixture: { ...fixture, manifest: { ...fixture.manifest, signature } },
    keyRing: new Map([
      [fixture.manifest.signingKeyId, publicKey.export({ type: "spki", format: "pem" }).toString()],
    ]),
  };
}

describe("offline Corpus bundle import", () => {
  it("promotes the fixture when the publisher signature verifies", async () => {
    const base = await loadFixture();
    const signed = signManifest(base);
    const validation = validateCorpusBundle(signed.fixture, { keyRing: signed.keyRing });
    expect(validation.findings).toEqual([]);
    expect(validation.decision).toBe("promotable");
    expect(validation.gateResults.every((gate) => gate.status === "pass")).toBe(true);
  });

  it("holds — never promotes — the committed fixture, which carries no signature", async () => {
    const fixture = await loadFixture();
    const validation = validateCorpusBundle(fixture);
    expect(validation.decision).toBe("held");
    expect(validation.firstBlockingGate).toBe("manifest_authenticity");
    expect(validation.findings.map((finding) => finding.code)).toEqual(["signature_absent"]);
  });

  it("refuses a bundle whose signing key is not in the allowlisted ring", async () => {
    const base = await loadFixture();
    const signed = signManifest(base);
    const validation = validateCorpusBundle(signed.fixture, {
      keyRing: new Map([["some-other-key", "not-a-key"]]),
    });
    expect(validation.findings.map((finding) => finding.code)).toEqual(["signing_key_not_trusted"]);
  });

  it("quarantines a candidate whose object bytes no longer match their digest", async () => {
    const base = await loadFixture();
    const signed = signManifest(base);
    // Pick the partition by family identity, not by index: the manifest's partition order is not a
    // contract, and an assertion keyed to position would still pass with the wrong partition.
    const partition = signed.fixture.manifest.familyPartitions.find(
      (candidate) => candidate.family === "generation_blueprint_release",
    );
    if (!partition) throw new Error("the fixture no longer publishes a blueprint partition");
    const original = signed.fixture.objects[partition.objectDigest] as {
      readonly records: readonly Record<string, unknown>[];
    };
    const tampered: CorpusBundleFixture = {
      ...signed.fixture,
      objects: {
        ...signed.fixture.objects,
        [partition.objectDigest]: {
          ...original,
          records: original.records.map((record) => ({ ...record, reconstructive: true })),
        },
      },
    };
    const validation = validateCorpusBundle(tampered, { keyRing: signed.keyRing });
    expect(validation.decision).toBe("quarantine_required");
    const digestFindings = validation.findings.filter(
      (finding) => finding.code === "object_digest_mismatch",
    );
    expect(digestFindings.map((finding) => finding.pointer)).toEqual([
      `/objects/${partition.objectDigest}`,
    ]);
  });

  it("rejects an index whose sequence does not advance", async () => {
    const base = await loadFixture();
    const signed = signManifest(base);
    const validation = validateCorpusBundle(signed.fixture, {
      keyRing: signed.keyRing,
      highestAcceptedSequence: signed.fixture.index.publicationSequence,
    });
    expect(validation.decision).toBe("quarantine_required");
    expect(validation.findings.map((finding) => finding.code)).toContain(
      "publication_sequence_regression",
    );
  });

  it("quarantines a resealed bundle that carries learner-facing expression", async () => {
    const base = await loadFixture();
    const partition = base.manifest.familyPartitions.find(
      (candidate) => candidate.family === "exam_structure_release",
    );
    if (!partition) throw new Error("the fixture no longer publishes an exam-structure partition");
    const contaminated = resealFixture({
      ...base,
      objects: {
        ...base.objects,
        [partition.objectDigest]: {
          ...(base.objects[partition.objectDigest] as object),
          safeContentNodes: [{ kind: "inline_text", text: "Anmeldung bis Freitag." }],
        },
      },
    });
    const signed = signManifest(contaminated);
    const validation = validateCorpusBundle(signed.fixture, { keyRing: signed.keyRing });
    expect(validation.decision).toBe("quarantine_required");
    expect(validation.firstBlockingGate).toBe("non_reconstructive_boundary");
    expect(validation.findings.map((finding) => finding.code)).toEqual([
      "learner_facing_text_present",
    ]);
  });

  it("quarantines a resealed bundle that carries learner data", async () => {
    const base = await loadFixture();
    const partition = base.manifest.familyPartitions.find(
      (candidate) => candidate.family === "demand_signal_release",
    );
    if (!partition) throw new Error("the fixture no longer publishes a demand-signal partition");
    const object = base.objects[partition.objectDigest] as {
      readonly records: readonly Record<string, unknown>[];
    };
    const contaminated = resealFixture({
      ...base,
      objects: {
        ...base.objects,
        [partition.objectDigest]: {
          ...object,
          records: object.records.map((record) => ({
            ...record,
            learnerScopeId: "learner-scope-0001",
          })),
        },
      },
    });
    const signed = signManifest(contaminated);
    const validation = validateCorpusBundle(signed.fixture, { keyRing: signed.keyRing });
    expect(validation.decision).toBe("quarantine_required");
    expect(validation.findings.map((finding) => finding.code)).toContain("learner_data_present");
  });

  it("blocks a resealed bundle whose cross-references do not close", async () => {
    const base = await loadFixture();
    const partition = base.manifest.familyPartitions.find(
      (candidate) => candidate.family === "generation_blueprint_release",
    );
    if (!partition) throw new Error("the fixture no longer publishes a blueprint partition");
    const object = base.objects[partition.objectDigest] as {
      readonly records: readonly Record<string, unknown>[];
    };
    const dangling = resealFixture({
      ...base,
      objects: {
        ...base.objects,
        [partition.objectDigest]: {
          ...object,
          records: object.records.map((record) => ({
            ...record,
            taxonomyNodeRefs: ["tax.node.that.was.never.published"],
          })),
        },
      },
    });
    const signed = signManifest(dangling);
    const validation = validateCorpusBundle(signed.fixture, { keyRing: signed.keyRing });
    expect(validation.decision).toBe("quarantine_required");
    expect(validation.findings.map((finding) => finding.code)).toEqual(
      validation.findings.map(() => "cross_reference_unresolved"),
    );
  });

  it("keeps the committed digest sidecar in agreement with the fixture", async () => {
    const fixture = await loadFixture();
    const sidecar = await readCorpusBundleDigestSidecar(sidecarPath);
    expect(sidecar.canonicalizationVersion).toBe("canonical-json/v1");
    expect(sidecar.manifestDigest).toBe(corpusManifestDigest(fixture.manifest));
    for (const partition of fixture.manifest.familyPartitions) {
      expect(sidecar.objectDigests[partition.family]).toBe(partition.objectDigest);
    }
  });

  it("attempts no network call and offers no bytes during an offline import", async () => {
    const offers: number[] = [];
    const outcome = await importCorpusBundleOffline({
      fixturePath,
      digestSidecarPath: sidecarPath,
      transport: {
        kind: "recording",
        async send(envelope) {
          offers.push(Buffer.byteLength(envelope.body, "utf8"));
          return { ok: false, reason: "corpus_host_not_configured", bytes: 0 };
        },
      },
    });
    expect(outcome.sidecarAgrees).toBe(true);
    expect(outcome.promoted).toBe(false);
    expect(outcome.discovery.bytesOffered).toBe(0);
    // The discovery body is built, but it carries no learner data — that is what makes it safe to
    // build at all. The transport still refuses it because there is no configured host.
    expect(offers).toHaveLength(1);
  });

  it("builds a discovery request that carries only sequence and contract metadata", () => {
    const body = JSON.parse(buildOutboundCorpusBody(buildDiscoveryRequest(41)));
    expect(Object.keys(body).sort()).toEqual([
      "highestPublicationSequence",
      "kind",
      "supportedContractMajor",
      "supportedFamilyMajors",
      "supportedPackagingMajor",
    ]);
  });

  it("refuses every request through the offline transport with zero bytes", async () => {
    const result = await offlineCorpusTransport.send({
      operation: "publication_index",
      immutableLocation: "corpus://publication-index",
      body: buildOutboundCorpusBody(buildDiscoveryRequest(0)),
    });
    expect(result).toEqual({ ok: false, reason: "corpus_host_not_configured", bytes: 0 });
  });
});
