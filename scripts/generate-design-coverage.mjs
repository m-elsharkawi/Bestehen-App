import { writeFileSync } from "node:fs";
import { sourceAnchorManifest } from "../packages/design-system/src/coverage/source-anchors.ts";

writeFileSync(
  "packages/design-system/src/coverage/source-anchors.generated.json",
  `${JSON.stringify({ generatedFrom: "source-anchors.ts", ...sourceAnchorManifest }, null, 2)}\n`,
);
