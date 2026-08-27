import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "packages/design-system";
const manifest = JSON.parse(readFileSync(join(root, "assets/manifest.json"), "utf8"));
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
