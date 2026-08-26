import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const source = execFileSync(
  "node",
  [
    "--import=tsx",
    "--eval",
    `import { sourceAnchorManifest } from './packages/design-system/src/coverage/source-anchors.ts';
   process.stdout.write(JSON.stringify(sourceAnchorManifest));`,
  ],
  { encoding: "utf8" },
);

const manifest = JSON.parse(source);
const inventory = manifest.inventory;
const generated = JSON.parse(
  readFileSync("packages/design-system/src/coverage/source-anchors.generated.json", "utf8"),
);
const expected = { compactFrames: 41, largeExemplars: 8, componentFamilies: 43, icons: 20 };
if (JSON.stringify(inventory) !== JSON.stringify(expected)) {
  throw new Error(`P04 coverage drift: ${JSON.stringify(inventory)}`);
}
if (
  JSON.stringify({ generatedFrom: "source-anchors.ts", ...manifest }) !== JSON.stringify(generated)
) {
  throw new Error("Generated source-anchor projection drifted from the typed manifest");
}
const collections = [
  manifest.boardAnchors,
  manifest.compactFrames,
  manifest.largeExemplars,
  manifest.componentFamilies,
  manifest.icons,
];
const rows = collections.flat();
const ids = rows.map((row) => row.id);
if (new Set(ids).size !== ids.length) throw new Error("Source-anchor IDs are not globally unique");
if (manifest.boardAnchors.length !== 37) throw new Error("Expected 37 board anchors");
for (const row of rows) {
  if (!existsSync(row.source))
    throw new Error(`Missing coverage source: ${row.id} -> ${row.source}`);
  if (!existsSync(row.target))
    throw new Error(`Missing coverage target: ${row.id} -> ${row.target}`);
  if (!row.tests.length || row.tests.some((id) => !manifest.tests.includes(id)))
    throw new Error(`Invalid test mapping for ${row.id}`);
  if (!row.status || !row.resolution)
    throw new Error(`Incomplete coverage resolution for ${row.id}`);
}
process.stdout.write("P04-COVERAGE-001 full reciprocal 37/41/8/43/20 projection passed.\n");
