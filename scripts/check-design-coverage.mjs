import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { executableCheckIds } from "./check-design-coverage-ids.mjs";

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

function filesUnder(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

const evidenceFiles = ["apps", "packages", "scripts"]
  .flatMap(filesUnder)
  .filter(
    (path) =>
      /(?:\.(?:test|spec)\.(?:ts|tsx)|\.mjs)$/.test(path) &&
      !path.endsWith("scripts/check-design-coverage.mjs"),
  );
const executableIds = new Set(
  evidenceFiles.flatMap((path) => {
    const contents = readFileSync(path, "utf8");
    if (/\.mjs$/.test(path)) return [...contents.matchAll(/P04-[A-Z0-9]+-001/g)].map(([id]) => id);
    return [...executableCheckIds(contents)];
  }),
);

for (const row of rows) {
  if (!existsSync(row.source))
    throw new Error(`Missing coverage source: ${row.id} -> ${row.source}`);
  if (!existsSync(row.target))
    throw new Error(`Missing coverage target: ${row.id} -> ${row.target}`);
  if (!readFileSync(row.source, "utf8").includes(row.anchor))
    throw new Error(`Unresolved coverage source anchor: ${row.id} -> ${row.source}#${row.anchor}`);
  if (!readFileSync(row.target, "utf8").includes(row.targetAnchor))
    throw new Error(
      `Unresolved coverage target anchor: ${row.id} -> ${row.target}#${row.targetAnchor}`,
    );
  if (!row.tests.length || row.tests.some((id) => !manifest.tests.includes(id)))
    throw new Error(`Invalid test mapping for ${row.id}`);
  if (row.tests.some((id) => !executableIds.has(id)))
    throw new Error(`Non-executable test mapping for ${row.id}: ${row.tests.join(", ")}`);
  if (!row.status || !row.resolution)
    throw new Error(`Incomplete coverage resolution for ${row.id}`);
}
process.stdout.write("P04-COVERAGE-001 full reciprocal 37/41/8/43/20 projection passed.\n");
