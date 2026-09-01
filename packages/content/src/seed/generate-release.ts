/** Regenerates the package-neutral document consumed by the infrastructure seed CLI. */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { contentSeedReleaseV1 } from "./index.js";

const outputPath = fileURLToPath(new URL("./release.json", import.meta.url));
await writeFile(outputPath, `${JSON.stringify(contentSeedReleaseV1, null, 2)}\n`, "utf8");
process.stdout.write(`Wrote ${outputPath}\n`);
