import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { resolve } from "node:path";

const update = process.argv.slice(2);
if (update.length > 1 || (update.length === 1 && update[0] !== "--update")) {
  throw new Error("Usage: pnpm test:visual:container [--update]");
}

const workspace = realpathSync(resolve(import.meta.dirname, ".."));
const snapshots = resolve(workspace, "apps/web/tests/p04-visual.spec.ts-snapshots");
if (!existsSync(snapshots)) {
  throw new Error("The tracked P04 visual snapshot directory is required.");
}

const image = "bestehen-p04-visual:local";
const build = spawnSync("docker", ["build", "--tag", image, "--file", "Dockerfile.visual", "."], {
  cwd: workspace,
  stdio: "inherit",
});
if (build.status !== 0) process.exit(build.status ?? 1);

const command = ["run", "--rm", "--init", "-e", "PLAYWRIGHT_VISUAL_RASTER=pinned-container"];
if (update.length === 1) {
  command.push(
    "--mount",
    `type=bind,src=${snapshots},dst=/workspace/apps/web/tests/p04-visual.spec.ts-snapshots`,
  );
}
command.push(image, "pnpm", "test:visual", ...(update.length === 1 ? ["--update-snapshots"] : []));
const run = spawnSync("docker", command, { cwd: workspace, stdio: "inherit" });
process.exit(run.status ?? 1);
