import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const source = execFileSync(
  "node",
  [
    "--import=tsx",
    "--eval",
    `import { sourceAnchorManifest } from './packages/design-system/src/coverage/source-anchors.ts';
   process.stdout.write(JSON.stringify(sourceAnchorManifest.inventory));`,
  ],
  { encoding: "utf8" },
);

const inventory = JSON.parse(source);
const generated = JSON.parse(
  readFileSync("packages/design-system/src/coverage/source-anchors.generated.json", "utf8"),
);
const expected = { compactFrames: 41, largeExemplars: 8, componentFamilies: 43, icons: 20 };
if (JSON.stringify(inventory) !== JSON.stringify(expected)) {
  throw new Error(`P04 coverage drift: ${JSON.stringify(inventory)}`);
}
if (
  JSON.stringify(inventory) !==
  JSON.stringify({
    compactFrames: generated.inventory.compactFrames,
    largeExemplars: generated.inventory.largeExemplars,
    componentFamilies: generated.inventory.componentFamilies,
    icons: generated.inventory.icons,
  })
) {
  throw new Error("Generated source-anchor inventory drifted from the typed manifest");
}
process.stdout.write("P04-COVERAGE-001 exact 41/8/43/20 inventory passed.\n");
