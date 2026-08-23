/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular-workspace-dependencies",
      severity: "error",
      from: { path: "^(apps|packages)/" },
      to: { circular: true, path: "^(apps|packages)/" },
    },
    {
      name: "domain-is-pure",
      severity: "error",
      from: { path: "^packages/domain/" },
      to: {
        path: "^(apps/|packages/(application|configuration|content|contracts|design-system|infrastructure|test-support)/|node_modules/(next|react|pg|pg-boss|kysely|pino))",
      },
    },
    {
      name: "application-does-not-import-infrastructure",
      severity: "error",
      from: { path: "^packages/application/" },
      to: { path: "^packages/(configuration|design-system|infrastructure|test-support)/" },
    },
    {
      name: "contracts-do-not-import-implementations",
      severity: "error",
      from: { path: "^packages/contracts/" },
      to: {
        path: "^packages/(application|configuration|design-system|infrastructure|test-support)/",
      },
    },
    {
      name: "production-does-not-import-test-support",
      severity: "error",
      from: { path: "^(apps|packages)/(?!test-support).*", pathNot: "\\.(test|spec)\\." },
      to: { path: "^packages/test-support/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)(dist|node_modules|\\.next|coverage|test-results)(/|$)" },
    includeOnly: "^(apps|packages)/",
    tsConfig: { fileName: "tsconfig.base.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["types", "import", "default"],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
