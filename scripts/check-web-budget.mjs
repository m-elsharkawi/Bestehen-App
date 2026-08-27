import { createGzip } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable, Writable } from "node:stream";

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
const framework = new Set(
  [...build.polyfillFiles, ...build.rootMainFiles].map((path) => join(nextRoot, path)),
);
const jsFiles = readdirSync(chunksRoot)
  .filter((file) => file.endsWith(".js"))
  .map((file) => join(chunksRoot, file));
const productChunks = jsFiles.filter((file) => !framework.has(file));
const productGzip = (await Promise.all(productChunks.map(gzipBytes))).reduce(
  (sum, value) => sum + value,
  0,
);
if (productGzip > 90 * 1024)
  throw new Error(`Product shell client JS exceeds 90 KiB gzip: ${productGzip}`);
for (const file of productChunks) {
  const bytes = await gzipBytes(file);
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
  `P04-PERF-001 passed: product client ${productGzip} B gzip, CSS ${cssGzip} B gzip, fonts ${fontBytes} B, icons/brand ${iconAndLogoGzip} B gzip. Framework runtime is reported separately by Next.\n`,
);
