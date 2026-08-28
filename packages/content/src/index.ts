/**
 * `@bestehen/content` — the content type system, its pure validators and its digests.
 *
 * The package owns content *facts and functions*; PostgreSQL owns the published graph, approvals,
 * exposure index and impact history. Every content fact here is unit-testable without a database.
 *
 * Each module appends its own export line below, in dependency order.
 */

import { contentReleaseIdentity } from "./model.js";

export * from "./model.js";
export * from "./task-families.js";
export * from "./keys.js";
export * from "./rights.js";
export * from "./accessibility.js";
export * from "./digest.js";
export * from "./publication.js";
export * from "./scoring.js";
export * from "./freshness.js";
export * from "./impact.js";

/**
 * The versioned publication boundary. Stage 05 is the first stage to produce content, so `produced`
 * is now `true` and the boundary carries the content release identity of decision D17 — the same
 * fact as `releaseAxes.content` and as the promoted `app.content_releases` row, not a parallel
 * version concept.
 */
export interface ContentBoundaryVersion {
  readonly contractMajor: 1;
  readonly produced: true;
  readonly releaseIdentity: typeof contentReleaseIdentity;
}

export const contentBoundary: ContentBoundaryVersion = {
  contractMajor: 1,
  produced: true,
  releaseIdentity: contentReleaseIdentity,
};
