/**
 * The offline Corpus import operation of decision D18 — worker/operator side only, and reachable
 * from no learner route.
 *
 * It composes the two restricted modules: the transport seam (`./corpus-client.js`) and the bundle
 * reader (`./corpus-bundle-reader.js`). In the personal profile the transport has no host, so a
 * discovery attempt is refused before any byte is offered and the import proceeds from the
 * committed fixture instead — which is exactly the `Architecture/10-…` §9.1 row this stage lives
 * in: *no active compatible snapshot → use App-curated seed/original bank only*.
 *
 * The import never touches learner data, never reads an attempt, and is never on a serving path.
 */

import { type CorpusTransport, offlineCorpusTransport, sendCorpusRequest } from "./client.js";
import {
  type CorpusBundleFixture,
  type CorpusImportOptions,
  type CorpusImportValidation,
  corpusBundleDigestSidecarPath,
  corpusBundleFixturePath,
  corpusManifestDigest,
  readCorpusBundleDigestSidecar,
  readCorpusBundleFixture,
  supportedBundleContractMajor,
  validateCorpusBundle,
} from "./bundle-reader.js";

export interface CorpusImportOutcome {
  readonly validation: CorpusImportValidation;
  /** What the discovery attempt did. In the personal profile it is always refused, with no bytes. */
  readonly discovery: {
    readonly attempted: boolean;
    readonly reason: string;
    readonly bytesOffered: number;
  };
  /** Whether the committed digest sidecar still agrees with the fixture's own bytes. */
  readonly sidecarAgrees: boolean;
  readonly promoted: boolean;
}

/**
 * The discovery request the App would send. It carries only the highest publication sequence and
 * supported contract metadata — `Architecture/10-…` §11.2 — and it is built through the guarded
 * serializer, so a contaminated value would throw here rather than reach a socket.
 */
export function buildDiscoveryRequest(highestAcceptedSequence: number): unknown {
  return {
    kind: "corpus_discovery",
    highestPublicationSequence: Math.max(0, highestAcceptedSequence),
    supportedContractMajor: supportedBundleContractMajor,
    supportedPackagingMajor: 1,
    supportedFamilyMajors: [
      { family: "exam_structure_release", major: 1 },
      { family: "skill_graph_release", major: 1 },
      { family: "generation_blueprint_release", major: 1 },
      { family: "demand_signal_release", major: 1 },
    ],
  };
}

export interface CorpusImportRunOptions extends CorpusImportOptions {
  readonly fixturePath?: string;
  readonly digestSidecarPath?: string;
  readonly transport?: CorpusTransport;
  /** Skip the discovery attempt entirely. The default attempts it and records the refusal. */
  readonly skipDiscovery?: boolean;
}

/**
 * Runs one offline import. It returns a decision and never writes: promotion into
 * `app.corpus_bundles` is the seed CLI's transaction, so a dry run and an apply share this exact
 * evaluation rather than two implementations of it.
 */
export async function importCorpusBundleOffline(
  options: CorpusImportRunOptions = {},
): Promise<CorpusImportOutcome> {
  const fixturePath = options.fixturePath ?? corpusBundleFixturePath;
  const sidecarPath = options.digestSidecarPath ?? corpusBundleDigestSidecarPath;
  const fixture: CorpusBundleFixture = await readCorpusBundleFixture(fixturePath);

  let discovery = { attempted: false, reason: "skipped", bytesOffered: 0 };
  if (options.skipDiscovery !== true) {
    const transport = options.transport ?? offlineCorpusTransport;
    const result = await sendCorpusRequest(
      transport,
      "publication_index",
      "corpus://publication-index",
      buildDiscoveryRequest(options.highestAcceptedSequence ?? 0),
    );
    discovery = { attempted: true, reason: result.reason, bytesOffered: result.bytes };
  }

  const validation = validateCorpusBundle(fixture, options);
  const sidecar = await readCorpusBundleDigestSidecar(sidecarPath);
  const sidecarAgrees =
    sidecar.manifestDigest === corpusManifestDigest(fixture.manifest) &&
    sidecar.bundleId === fixture.manifest.bundleId &&
    sidecar.bundleRevision === fixture.manifest.bundleRevision &&
    fixture.manifest.familyPartitions.every(
      (partition) => sidecar.objectDigests[partition.family] === partition.objectDigest,
    );

  return {
    validation,
    discovery,
    sidecarAgrees,
    promoted: validation.decision === "promotable" && sidecarAgrees,
  };
}
