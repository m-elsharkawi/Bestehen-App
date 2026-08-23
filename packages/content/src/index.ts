/** Stage 01 exposes only the versioned publication boundary, not content or seed data. */
export interface ContentBoundaryVersion {
  readonly contractMajor: 1;
  readonly produced: false;
}

export const contentBoundary: ContentBoundaryVersion = {
  contractMajor: 1,
  produced: false,
};
