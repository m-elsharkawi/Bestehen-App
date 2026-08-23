import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { globSync } from "node:fs";

const root = process.cwd();
const rootManifest = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const expected = { node: "24.19.0", pnpm: "11.23.0" };

function fail(message) {
  throw new Error(message);
}

if (rootManifest.packageManager !== `pnpm@${expected.pnpm}`) fail("packageManager pin drifted");
if (rootManifest.engines?.node !== expected.node || rootManifest.engines?.pnpm !== expected.pnpm) {
  fail("runtime engine pins drifted");
}
if (process.versions.node !== expected.node) {
  fail(`Node ${expected.node} is required; received ${process.versions.node}`);
}

for (const manifestPath of ["package.json", ...globSync("{apps,packages}/*/package.json")]) {
  const manifest = JSON.parse(readFileSync(path.join(root, manifestPath), "utf8"));
  for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
    for (const [name, version] of Object.entries(manifest[section] ?? {})) {
      if (String(version).startsWith("workspace:")) continue;
      if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(String(version))) {
        fail(`${manifestPath} has a non-exact ${section} pin for ${name}: ${version}`);
      }
    }
  }
}

const workspace = readFileSync(path.join(root, "pnpm-workspace.yaml"), "utf8");
const allowBuilds = workspace.match(/^allowBuilds:\n((?: {2}[^\n]+\n?)+)/m)?.[1]?.trim();
if (allowBuilds !== "esbuild: true") {
  fail("an unreviewed dependency lifecycle allowance is present");
}
if (/dangerouslyAllowAllBuilds/.test(workspace)) fail("global lifecycle scripts are forbidden");

const lock = readFileSync(path.join(root, "pnpm-lock.yaml"), "utf8");
if (!lock.startsWith("lockfileVersion: '9.0'")) fail("unexpected pnpm lockfile format");
if (/\b(?:git\+|github:|https?:\/\/).*?(?:\.git|\.tgz)|tarball:\s*https?:\/\//i.test(lock)) {
  fail("lockfile contains an unreviewed non-registry dependency source");
}
if (!lock.includes("esbuild@0.28.2")) fail("reviewed esbuild resolution drifted");

for (const [name, version] of Object.entries(rootManifest.devDependencies)) {
  const installed = JSON.parse(
    readFileSync(path.join(root, "node_modules", name, "package.json"), "utf8"),
  );
  if (installed.version !== version)
    fail(`${name} installed as ${installed.version}, expected ${version}`);
}

process.stdout.write(
  `Lock policy valid: Node ${expected.node}, pnpm ${expected.pnpm}, exact manifests, strict peers/engines, registry lock, only esbuild lifecycle allowed.\n`,
);
