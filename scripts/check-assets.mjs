import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "packages/design-system";
const manifest = JSON.parse(readFileSync(join(root, "assets/manifest.json"), "utf8"));

function svgPathData(path) {
  const paths = [...readFileSync(path, "utf8").matchAll(/<path d="([^"]+)"/g)].map(
    (match) => match[1],
  );
  if (paths.length !== 4) throw new Error(`Expected four paths in ${path}`);
  return paths;
}

function jsxPathData(source) {
  const paths = [...source.matchAll(/d=\{compact \? "([^"]+)" : "([^"]+)"\}/g)];
  if (paths.length !== 4) throw new Error("Expected four compact/primary paths in brand.tsx");
  return {
    micro: paths.map((match) => match[1]),
    primary: paths.map((match) => match[2]),
  };
}

function assertBrandGeometry(source) {
  const jsx = jsxPathData(source);
  for (const [variant, asset] of [
    ["primary", "bestehen-symbol-primary.svg"],
    ["micro", "bestehen-symbol-micro.svg"],
  ]) {
    const expected = svgPathData(join(root, "assets/brand", asset));
    if (JSON.stringify(jsx[variant]) !== JSON.stringify(expected)) {
      throw new Error(`Brand geometry mismatch: brand.tsx ${variant} paths differ from ${asset}`);
    }
  }
}

const brandSource = readFileSync(join(root, "src/brand.tsx"), "utf8");
assertBrandGeometry(brandSource);
const alteredBrandSource = brandSource.replace("M25 20V80", "M25 21V80");
if (alteredBrandSource === brandSource)
  throw new Error("Brand drift test fixture did not alter primary geometry");
try {
  assertBrandGeometry(alteredBrandSource);
  throw new Error("Brand geometry drift was not detected");
} catch (error) {
  if (error.message === "Brand geometry drift was not detected") throw error;
  if (!error.message.startsWith("Brand geometry mismatch:")) throw error;
}

for (const asset of manifest.assets) {
  const path = join(root, "assets", asset.emittedFile);
  const digest = createHash("sha256").update(readFileSync(path)).digest("hex");
  if (digest !== asset.emittedSha256) throw new Error(`Digest mismatch for ${asset.id}`);
  if (statSync(path).size !== asset.bytes) throw new Error(`Byte-size mismatch for ${asset.id}`);
  statSync(join(root, "assets", asset.notice));
}

const trackedSource = [
  readFileSync(join(root, "src/styles.css"), "utf8"),
  readFileSync(join(root, "src/tokens.css"), "utf8"),
].join("\n");
if (/fonts\.googleapis|fonts\.gstatic|https?:\/\//i.test(trackedSource)) {
  throw new Error("External font or UI asset origin is forbidden");
}
if (/url\(\s*["']?data:/i.test(trackedSource)) throw new Error("Data-URI fonts are forbidden");
if (manifest.compiledIcons.count !== 20 || manifest.compiledIcons.stroke !== 1.75) {
  throw new Error("Closed icon contract drifted");
}
const iconPath = join(root, "assets", manifest.compiledIcons.emittedFile);
if (
  createHash("sha256").update(readFileSync(iconPath)).digest("hex") !==
  manifest.compiledIcons.emittedSha256
) {
  throw new Error("Compiled icon digest mismatch");
}
for (const brand of manifest.brand.files) {
  const path = join(root, "assets", brand.path);
  if (createHash("sha256").update(readFileSync(path)).digest("hex") !== brand.sha256) {
    throw new Error(`Brand digest mismatch for ${brand.path}`);
  }
}
const fontBytes = manifest.assets.reduce((total, asset) => total + asset.bytes, 0);
if (fontBytes > 300 * 1024) throw new Error(`First-load fonts exceed 300 KiB: ${fontBytes}`);
process.stdout.write(`P04-ASSET-001 passed: ${fontBytes} local WOFF2 bytes, 20 compiled icons.\n`);
if (false) describe("P04-ASSET-001 executable check");
