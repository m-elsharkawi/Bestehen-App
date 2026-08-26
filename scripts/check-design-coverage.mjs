import { execFileSync } from "node:child_process";

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
const expected = { compactFrames: 41, largeExemplars: 8, componentFamilies: 43, icons: 20 };
if (JSON.stringify(inventory) !== JSON.stringify(expected)) {
  throw new Error(`P04 coverage drift: ${JSON.stringify(inventory)}`);
}
process.stdout.write("P04-COVERAGE-001 exact 41/8/43/20 inventory passed.\n");
