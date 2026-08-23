import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const packageOrder = {
  domain: [],
  contracts: ["domain"],
  application: ["domain", "contracts"],
  configuration: [],
  infrastructure: ["domain", "contracts", "application", "configuration"],
  content: ["domain", "contracts"],
  "design-system": [],
  "test-support": [
    "domain",
    "contracts",
    "application",
    "configuration",
    "infrastructure",
    "content",
    "design-system",
  ],
};

function workspaceNameToOwner(name) {
  return name.replace(/^@bestehen\//, "");
}

function assertAllowed(from, to) {
  if (!Object.hasOwn(packageOrder, from)) return;
  if (!Object.hasOwn(packageOrder, to)) throw new Error(`Unknown workspace dependency ${to}`);
  if (!packageOrder[from].includes(to)) {
    throw new Error(`Forbidden workspace dependency: ${from} -> ${to}`);
  }
}

async function inspectManifests() {
  for (const owner of Object.keys(packageOrder)) {
    const manifestPath = path.join(root, "packages", owner, "package.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    for (const dependency of Object.keys(manifest.dependencies ?? {})) {
      if (dependency.startsWith("@bestehen/"))
        assertAllowed(owner, workspaceNameToOwner(dependency));
    }
    if (manifest.private !== true) throw new Error(`${owner} must remain private`);
    if (!manifest.exports) throw new Error(`${owner} must declare explicit exports`);
  }
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!["dist", "node_modules", ".next"].includes(entry.name))
        result.push(...(await sourceFiles(entryPath)));
    } else if (/\.(?:ts|tsx|mts|mjs)$/.test(entry.name)) {
      result.push(entryPath);
    }
  }
  return result;
}

async function inspectImports() {
  for (const topLevel of ["apps", "packages"]) {
    for (const file of await sourceFiles(path.join(root, topLevel))) {
      const source = await readFile(file, "utf8");
      for (const match of source.matchAll(/(?:from\s+|import\s*\()?["'](@bestehen\/[^"']+)["']/g)) {
        const specifier = match[1];
        if (
          specifier.split("/").length > 2 &&
          !new Set([
            "@bestehen/design-system/styles.css",
            "@bestehen/infrastructure/postgres",
          ]).has(specifier)
        ) {
          throw new Error(
            `Deep workspace import is forbidden in ${path.relative(root, file)}: ${specifier}`,
          );
        }
      }
      if (
        file.includes("packages/domain/") &&
        /["'](?:next|react|pg|pg-boss|kysely|pino)(?:\/|["'])/.test(source)
      ) {
        throw new Error(`Framework/provider import is forbidden in ${path.relative(root, file)}`);
      }
      if (
        !/\.(?:test|spec)\./.test(file) &&
        !file.includes("packages/test-support/") &&
        source.includes("@bestehen/test-support")
      ) {
        throw new Error(
          `Production import of test-support is forbidden in ${path.relative(root, file)}`,
        );
      }
    }
  }
}

function runNegativeFixtures() {
  const forbidden = [
    ["domain", "infrastructure"],
    ["contracts", "infrastructure"],
    ["application", "infrastructure"],
    ["configuration", "domain"],
    ["design-system", "application"],
  ];
  for (const [from, to] of forbidden) {
    let rejected = false;
    try {
      assertAllowed(from, to);
    } catch {
      rejected = true;
    }
    if (!rejected) throw new Error(`Boundary self-test failed to reject ${from} -> ${to}`);
  }
}

await inspectManifests();
await inspectImports();
runNegativeFixtures();
process.stdout.write(
  "Package manifests, public imports, negative fixtures, and dependency arrows are valid.\n",
);
