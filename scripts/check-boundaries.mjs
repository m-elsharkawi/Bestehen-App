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
          !new Set(["@bestehen/design-system/styles.css", "@bestehen/infrastructure/postgres"]).has(
            specifier,
          )
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

const workspaceEntryPoints = {
  "@bestehen/application": "packages/application/src/index.ts",
  "@bestehen/configuration": "packages/configuration/src/index.ts",
  "@bestehen/content": "packages/content/src/index.ts",
  "@bestehen/contracts": "packages/contracts/src/index.ts",
  "@bestehen/design-system": "packages/design-system/src/index.ts",
  "@bestehen/domain": "packages/domain/src/index.ts",
  "@bestehen/infrastructure": "packages/infrastructure/src/index.ts",
  "@bestehen/infrastructure/postgres": "packages/infrastructure/src/postgres/index.ts",
  "@bestehen/test-support": "packages/test-support/src/index.ts",
};
const corpusRestrictedModules = [
  "packages/content/src/corpus/client.ts",
  "packages/content/src/corpus/bundle-reader.ts",
];
const importPattern = /(?:^|[\s;{(=])(?:import|export)\s+(?:[^'"]*?from\s*)?["']([^"']+)["']/gm;
const dynamicImportPattern = /\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g;

function sourceCandidates(relativePath) {
  const withoutJs = relativePath.replace(/\.(?:m?js)$/, "");
  return [
    relativePath,
    `${withoutJs}.ts`,
    `${withoutJs}.tsx`,
    `${withoutJs}.mts`,
    `${withoutJs}/index.ts`,
    `${withoutJs}/index.tsx`,
  ];
}

function resolveSourceSpecifier(fromRelative, specifier, sourceSet) {
  const workspaceEntry = workspaceEntryPoints[specifier];
  if (workspaceEntry) return sourceSet.has(workspaceEntry) ? workspaceEntry : undefined;
  let unresolved;
  if (specifier.startsWith("@/")) unresolved = `apps/web/src/${specifier.slice(2)}`;
  else if (specifier.startsWith(".")) {
    unresolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromRelative), specifier));
  } else return undefined;
  return sourceCandidates(unresolved).find((candidate) => sourceSet.has(candidate));
}

async function buildSourceImportGraph() {
  const absoluteFiles = (
    await Promise.all(
      ["apps", "packages"].map((directory) => sourceFiles(path.join(root, directory))),
    )
  ).flat();
  const relativeByAbsolute = new Map(
    absoluteFiles.map((file) => [file, path.relative(root, file).replaceAll(path.sep, "/")]),
  );
  const sourceSet = new Set(relativeByAbsolute.values());
  const graph = new Map();
  for (const absolute of absoluteFiles) {
    const relative = relativeByAbsolute.get(absolute);
    const source = await readFile(absolute, "utf8");
    const dependencies = new Set();
    for (const pattern of [importPattern, dynamicImportPattern]) {
      pattern.lastIndex = 0;
      for (const match of source.matchAll(pattern)) {
        const resolved = resolveSourceSpecifier(relative, match[1] ?? "", sourceSet);
        if (resolved) dependencies.add(resolved);
      }
    }
    graph.set(relative, [...dependencies]);
  }
  return graph;
}

function reachableModules(graph, entry) {
  const reached = new Set();
  const pending = [entry];
  while (pending.length > 0) {
    const current = pending.shift();
    if (!current || reached.has(current)) continue;
    reached.add(current);
    pending.push(...(graph.get(current) ?? []));
  }
  return reached;
}

async function inspectCorpusIsolation() {
  const graph = await buildSourceImportGraph();
  for (const restricted of corpusRestrictedModules) {
    if (!graph.has(restricted))
      throw new Error(`Corpus boundary names a missing module: ${restricted}`);
  }
  const positiveControl = reachableModules(graph, "packages/content/src/corpus/import.ts");
  for (const restricted of corpusRestrictedModules) {
    if (!positiveControl.has(restricted)) {
      throw new Error(`Corpus boundary resolver missed its positive control: ${restricted}`);
    }
  }
  const violations = [];
  for (const module of graph.keys()) {
    if (!module.startsWith("apps/web/")) continue;
    for (const restricted of corpusRestrictedModules) {
      if (reachableModules(graph, module).has(restricted)) {
        violations.push(`${module} -> ${restricted}`);
      }
    }
  }
  if (violations.length > 0) {
    throw new Error(`apps/web reaches a worker-only Corpus module: ${violations.join(", ")}`);
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
await inspectCorpusIsolation();
runNegativeFixtures();
process.stdout.write(
  "P05-BOUNDARY-001 passed: package arrows are valid and apps/web cannot transitively reach the Corpus client or bundle reader.\n",
);
