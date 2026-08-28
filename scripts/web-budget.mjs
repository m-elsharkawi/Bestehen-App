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
