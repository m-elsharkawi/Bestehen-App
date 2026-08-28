import { createGzip } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable, Writable } from "node:stream";
import { protectedRouteBudgetError, protectedRouteFiles } from "./web-budget.mjs";

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
const jsFiles = readdirSync(chunksRoot)
  .filter((file) => file.endsWith(".js"))
  .map((file) => `static/chunks/${file}`);
const productChunks = protectedFiles.filter(
  (file) => !new Set([...build.polyfillFiles, ...build.rootMainFiles]).has(file),
);
const protectedGzip = (
  await Promise.all(protectedFiles.map((file) => gzipBytes(join(nextRoot, file))))
).reduce((sum, value) => sum + value, 0);
const protectedBudgetError = protectedRouteBudgetError(protectedGzip);
if (protectedBudgetError) throw new Error(protectedBudgetError);
const productGzip = (
  await Promise.all(productChunks.map((file) => gzipBytes(join(nextRoot, file))))
).reduce((sum, value) => sum + value, 0);
for (const file of productChunks) {
  const bytes = await gzipBytes(join(nextRoot, file));
  if (bytes > 60 * 1024) throw new Error(`Client island exceeds 60 KiB gzip: ${file} ${bytes}`);
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
  `P04-PERF-001 passed: protected route client ${protectedGzip} B gzip (framework/shared included), product client ${productGzip} B gzip, CSS ${cssGzip} B gzip, fonts ${fontBytes} B, icons/brand ${iconAndLogoGzip} B gzip.\n`,
);
