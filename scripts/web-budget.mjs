export function protectedRouteBudgetError(total, cap = 200 * 1024) {
  return total > cap
    ? `Protected route client JS exceeds ${cap / 1024} KiB gzip: ${total} B`
    : null;
}

export function protectedRouteFiles(build, routeManifest, routeKey) {
  const entryKey = Object.keys(routeManifest.entryJSFiles ?? {}).find((key) =>
    key.endsWith(routeKey),
  );
  if (!entryKey) throw new Error(`Protected route client manifest is missing ${routeKey}`);
  const entries = Object.values(routeManifest.entryJSFiles).flat();
  return [
    ...new Set(
      [...build.polyfillFiles, ...build.rootMainFiles, ...entries].map((file) =>
        file.replace(/^\/_next\//, ""),
      ),
    ),
  ];
}

// Every App-owned chunk (i.e. not part of the shared framework runtime), regardless of
// whether any single route's client-reference manifest happens to reference it. This is
// deliberately independent of protectedRouteFiles: a chunk can be App-owned (and therefore
// subject to the per-file/aggregate App-owned budgets below) without being part of the
// /coach protected-route first-load entry set.
export function appOwnedChunks(chunkFiles, framework) {
  return chunkFiles.filter((file) => !framework.has(file));
}
