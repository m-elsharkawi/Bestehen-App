/**
 * The Corpus client seam — worker/operator side only.
 *
 * **This module is deliberately unreachable from `apps/web`.** `packages/content/src/index.ts`
 * exports it from no barrel line, and `scripts/check-boundaries.mjs` forbids deep workspace
 * imports, so reaching a Corpus transport, host name or credential from a learner route is not
 * merely absent — it would have to break a gate that is already green. That is items 1 and 2 of
 * the boundary proof of `Architecture/10-…` §9.2, and `packages/content/src/corpus-boundary.test.ts`
 * asserts it over the real module graph.
 *
 * Two further properties hold here:
 *
 * - **Every outbound value passes {@link assertOutboundCorpusRequest} before it can become bytes.**
 *   The transport port takes an already-serialized body, and the only function in this module that
 *   produces one rejects a forbidden learner or profile field rather than stripping it.
 * - **No live host exists in the personal profile.** The only transport shipped here is
 *   {@link offlineCorpusTransport}, which refuses every request. Egress denial of a Corpus
 *   publication host is a Stage 10 deployment obligation and is **not** claimed by this module:
 *   the absence of a host is not a policy.
 */

import { assertOutboundCorpusRequest, type OutboundCorpusRequest } from "../corpus-request.js";

/** What the App would send. There is no `GET arbitrary URL`; the two shapes are the whole surface. */
export type CorpusOperation = "publication_index" | "bundle_object";

export interface CorpusRequestEnvelope {
  readonly operation: CorpusOperation;
  /** Digest-addressed location for `bundle_object`; the index location otherwise. */
  readonly immutableLocation: string;
  /** Already validated and serialized by {@link buildOutboundCorpusBody}. */
  readonly body: string;
}

export interface CorpusTransportResult {
  readonly ok: boolean;
  readonly reason: string;
  readonly bytes: number;
}

/**
 * The provider-neutral transport port. A transport receives bytes that have already been proven
 * free of learner data; it is never handed a raw object it might serialize itself.
 */
export interface CorpusTransport {
  readonly kind: string;
  send(envelope: CorpusRequestEnvelope): Promise<CorpusTransportResult>;
}

/**
 * The only place an outbound Corpus body is produced. It throws
 * `OutboundCorpusRequestRejected` — naming the offending field — rather than returning a cleaned
 * request, so a contaminated payload can never reach a transport.
 */
export function buildOutboundCorpusBody(request: OutboundCorpusRequest | unknown): string {
  return assertOutboundCorpusRequest(request);
}

/**
 * The personal profile's transport: there is no Corpus publication host, so every request is
 * refused before any byte is offered to a socket. This is an honest "not configured", not an
 * egress-policy claim.
 */
export const offlineCorpusTransport: CorpusTransport = {
  kind: "offline_no_host",
  async send(): Promise<CorpusTransportResult> {
    return {
      ok: false,
      reason: "corpus_host_not_configured",
      bytes: 0,
    };
  },
};

/**
 * Sends one request through a transport after proving it carries no learner data. Returns the
 * transport result; it never retries and never falls back to a different host.
 */
export async function sendCorpusRequest(
  transport: CorpusTransport,
  operation: CorpusOperation,
  immutableLocation: string,
  request: unknown,
): Promise<CorpusTransportResult> {
  const body = buildOutboundCorpusBody(request);
  return transport.send({ operation, immutableLocation, body });
}
