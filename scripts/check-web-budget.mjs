import { createGzip } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable, Writable } from "node:stream";
import { appOwnedChunks, protectedRouteBudgetError, protectedRouteFiles } from "./web-budget.mjs";

const stage05IslandEntries = [
  {
    label: "ObjectiveResponseIsland",
    module: "/apps/web/src/ui/islands/objective-response.tsx",
    budget: 14 * 1024,
  },
  {
    label: "AudioPlaybackIsland",
    module: "/apps/web/src/ui/islands/listening-runtime.tsx",
    budget: 12 * 1024,
  },
  {
    label: "AudioPlaybackIsland",
    module: "/apps/web/src/ui/islands/listening-transcript.tsx",
    budget: 12 * 1024,
  },
  {
    label: "AttemptClockIsland",
    module: "/apps/web/src/ui/islands/attempt-clock.tsx",
    budget: 3 * 1024,
  },
];

async function gzipBytes(path) {
  let bytes = 0;
  await pipeline(
    Readable.from(readFileSync(path)),
    createGzip({ level: 9 }),
    new Writable({
      write(chunk, _encoding, callback) {
        bytes += chunk.length;
        callback();
      },
    }),
  );
  return bytes;
}

function filesUnder(directory, suffix) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    return entry.isDirectory()
      ? filesUnder(entryPath, suffix)
      : entry.name.endsWith(suffix)
        ? [entryPath]
        : [];
  });
}

function readClientReferenceManifest(file) {
  const source = readFileSync(file, "utf8");
  const assignment = source.indexOf(" = {");
  if (assignment < 0) throw new Error(`Cannot parse client reference manifest: ${file}`);
  return JSON.parse(source.slice(assignment + 3, source.lastIndexOf(";")));
}

function stage05IslandModuleIds(nextRoot) {
  const manifests = filesUnder(join(nextRoot, "server/app"), "client-reference-manifest.js");
  const moduleIds = new Map();
  const protectedLeaks = [];
  for (const manifestPath of manifests) {
    const manifest = readClientReferenceManifest(manifestPath);
    for (const [modulePath, reference] of Object.entries(manifest.clientModules ?? {})) {
      const island = stage05IslandEntries.find((entry) => modulePath.endsWith(entry.module));
      if (!island) continue;
      moduleIds.set(island.module, { ...island, id: reference.id });
      if (manifestPath.includes("/app/(protected)/")) {
        protectedLeaks.push(`${manifestPath}: ${island.label}`);
      }
    }
  }
  if (protectedLeaks.length > 0) {
    throw new Error(
      `Stage 05 client island reached a protected route: ${protectedLeaks.join(", ")}`,
    );
  }
  const missing = stage05IslandEntries.filter((entry) => !moduleIds.has(entry.module));
  if (missing.length > 0) {
    throw new Error(
      `Stage 05 client island missing from rebuilt output: ${missing.map((entry) => entry.module).join(", ")}`,
    );
  }
  return [...moduleIds.values()];
}

const nextRoot = "apps/web/.next";
const chunksRoot = join(nextRoot, "static/chunks");
const build = JSON.parse(readFileSync(join(nextRoot, "build-manifest.json"), "utf8"));
const routeManifestPath = join(
  nextRoot,
  "server/app/(protected)/coach/page_client-reference-manifest.js",
);
const routeManifestText = readFileSync(routeManifestPath, "utf8");
const routeManifest = JSON.parse(
  routeManifestText.slice(
    routeManifestText.indexOf(" = {") + 3,
    routeManifestText.lastIndexOf(";"),
  ),
);
const protectedFiles = protectedRouteFiles(build, routeManifest, "/(protected)/coach/page");
const protectedGzip = (
  await Promise.all(protectedFiles.map((file) => gzipBytes(join(nextRoot, file))))
).reduce((sum, value) => sum + value, 0);
const protectedBudgetError = protectedRouteBudgetError(protectedGzip);
if (protectedBudgetError) throw new Error(protectedBudgetError);

// App-owned chunks: every .js chunk on disk minus the shared framework runtime
// (rootMainFiles + polyfillFiles). This is the full chunk set, independent of which
// route(s) reference each file, so it must not be narrowed to a single route's entries.
const framework = new Set(
  [...build.polyfillFiles, ...build.rootMainFiles].map((path) => join(nextRoot, path)),
);
const jsFiles = readdirSync(chunksRoot)
  .filter((file) => file.endsWith(".js"))
  .map((file) => join(chunksRoot, file));
const productChunks = appOwnedChunks(jsFiles, framework);
const productGzip = (await Promise.all(productChunks.map(gzipBytes))).reduce(
  (sum, value) => sum + value,
  0,
);
if (productGzip > 90 * 1024)
  throw new Error(
    `App-owned chunks (excluding shared framework runtime) exceed 90 KiB gzip: ${productGzip}`,
  );
for (const file of productChunks) {
  const bytes = await gzipBytes(file);
  if (bytes > 60 * 1024) throw new Error(`Client island exceeds 60 KiB gzip: ${file} ${bytes}`);
}

const stage05Modules = stage05IslandModuleIds(nextRoot);
const stage05IslandChunks = [];
for (const file of productChunks) {
  const source = readFileSync(file, "utf8");
  const labels = new Map();
  for (const module of stage05Modules) {
    const definition = new RegExp(`(?:^|[,\\[])${module.id},[A-Za-z_$][A-Za-z0-9_$]*=>`);
    if (definition.test(source)) labels.set(module.label, module.budget);
  }
  if (labels.size === 0) continue;
  const bytes = await gzipBytes(file);
  const budget = [...labels.values()].reduce((sum, value) => sum + value, 0);
  if (bytes > budget) {
    throw new Error(
      `Stage 05 co-bundled island chunk exceeds its declared budgets: ${file} ${bytes} > ${budget}`,
    );
  }
  stage05IslandChunks.push({ file, bytes, budget, labels: [...labels.keys()] });
}
for (const module of stage05Modules) {
  if (!stage05IslandChunks.some((chunk) => chunk.labels.includes(module.label))) {
    throw new Error(`No compiled chunk was attributed to ${module.label}`);
  }
}

const cssFiles = readdirSync(chunksRoot)
  .filter((file) => file.endsWith(".css"))
  .map((file) => join(chunksRoot, file));
const cssGzip = (await Promise.all(cssFiles.map(gzipBytes))).reduce((sum, value) => sum + value, 0);
if (cssGzip > 50 * 1024) throw new Error(`Design-system CSS exceeds 50 KiB gzip: ${cssGzip}`);

const mediaRoot = join(nextRoot, "static/media");
const fontBytes = readdirSync(mediaRoot)
  .filter((file) => file.endsWith(".woff2"))
  .reduce((sum, file) => sum + statSync(join(mediaRoot, file)).size, 0);
if (fontBytes > 300 * 1024) throw new Error(`WOFF2 assets exceed 300 KiB: ${fontBytes}`);

const iconAndLogoGzip =
  (await gzipBytes("packages/design-system/src/icons.tsx")) +
  (await gzipBytes("packages/design-system/assets/brand/bestehen-symbol-primary.svg")) +
  (await gzipBytes("packages/design-system/assets/brand/bestehen-symbol-micro.svg"));
if (iconAndLogoGzip > 40 * 1024)
  throw new Error(`Icon and logo sources exceed 40 KiB gzip: ${iconAndLogoGzip}`);

process.stdout.write(
  `P04-PERF-001 passed; P05-PERF-001 passed: protected route first load (includes shared framework runtime) ${protectedGzip} B gzip <= 200 KiB, App-owned chunks (excludes shared framework runtime) ${productGzip} B gzip <= 90 KiB, Stage 05 island chunks ${stage05IslandChunks.map((chunk) => `${chunk.file} ${chunk.bytes}/${chunk.budget} B [${chunk.labels.join("+")}]`).join("; ")}, CSS ${cssGzip} B gzip, fonts ${fontBytes} B, icons/brand ${iconAndLogoGzip} B gzip.\n`,
);
