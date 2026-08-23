import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schemaPath = "schemas/personal-provider-readiness.schema.json";
const examplePath = "config/personal-provider-readiness.example.json";
const guideDirectory = "docs/setup/personal";
const requiredProviders = [
  "coolify",
  "pangolin",
  "auth0",
  "r2",
  "ses",
  "gemini",
  "openai_stt",
  "openai_tts",
  "polly",
];
const forbiddenKey =
  /(?:secret|password|token|credential|api.?key|access.?key|private.?key|email.?address|owner.?email|account.?id|tenant.?id|resource.?id|request.?id|message.?id|object.?key|transcript|prompt|response.?body)/i;
const forbiddenValue = /(?:\bBearer\s+|\bsk-[A-Za-z0-9_-]{8,}|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/i;

function loadJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function guideSteps() {
  const steps = new Set();
  for (const name of readdirSync(guideDirectory).filter((entry) => entry.endsWith(".md"))) {
    const source = readFileSync(path.join(guideDirectory, name), "utf8");
    for (const match of source.matchAll(/^### `([A-Z0-9]+-[0-9]{2})`/gm)) steps.add(match[1]);
  }
  return steps;
}

function scanRedaction(value, location = "receipt") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      scanRedaction(item, `${location}[${index}]`);
    });
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (forbiddenKey.test(key)) throw new Error(`Forbidden private field at ${location}.${key}`);
      scanRedaction(item, `${location}.${key}`);
    }
    return;
  }
  if (typeof value === "string" && forbiddenValue.test(value))
    throw new Error(`Forbidden private value at ${location}`);
}

function validateRelationships(receipt, steps) {
  if (receipt.authCallbackUrl !== `${receipt.applicationOrigin}/auth/callback`)
    throw new Error("Authentication callback must derive from the single application origin");
  if (receipt.applicationOrigin.includes("*") || receipt.authCallbackUrl.includes("*"))
    throw new Error("Wildcard origins and callbacks are forbidden");

  const providers = receipt.resources.map((resource) => resource.provider);
  if (new Set(providers).size !== providers.length)
    throw new Error("Each provider must have exactly one readiness resource");
  if (!requiredProviders.every((provider) => providers.includes(provider)))
    throw new Error("Readiness receipt is missing a required provider");
  for (const resource of receipt.resources) {
    if (!steps.has(resource.guideStep))
      throw new Error(`Unknown guide step for provider ${resource.provider}`);
    if (resource.result !== "verified" && resource.liveVerified)
      throw new Error(`False live claim for provider ${resource.provider}`);
  }
}

function makeValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(loadJson(schemaPath));
}

function validateReceipt(receipt, validate, steps) {
  scanRedaction(receipt);
  if (!validate(receipt)) {
    const fields = validate.errors
      .map((error) => `${error.instancePath || "/"}:${error.keyword}`)
      .join(", ");
    throw new Error(`Readiness schema rejected fields: ${fields}`);
  }
  validateRelationships(receipt, steps);
}

function clone(value) {
  return structuredClone(value);
}

function providerResource(receipt, provider) {
  return receipt.resources.find((resource) => resource.provider === provider);
}

function assertRejected(name, mutate, example, validate, steps) {
  const invalid = clone(example);
  mutate(invalid);
  try {
    validateReceipt(invalid, validate, steps);
  } catch {
    return;
  }
  throw new Error(`Invalid readiness fixture was accepted: ${name}`);
}

function runInvalidFixtures(example, validate, steps) {
  const fixtures = [
    ["private field", (receipt) => (providerResource(receipt, "auth0").clientSecret = "redacted")],
    [
      "false live claim",
      (receipt) => {
        providerResource(receipt, "auth0").result = "verified";
        providerResource(receipt, "auth0").liveVerified = false;
      },
    ],
    ["unknown guide step", (receipt) => (providerResource(receipt, "auth0").guideStep = "AUTH-99")],
    ["wrong region", (receipt) => (providerResource(receipt, "r2").region = "eu-central-1")],
    ["wrong model", (receipt) => (providerResource(receipt, "gemini").model = "not_applicable")],
    ["wildcard origin", (receipt) => (receipt.applicationOrigin = "https://*.example.invalid")],
    [
      "wrong callback path",
      (receipt) => (receipt.authCallbackUrl = `${receipt.applicationOrigin}/api/auth/callback`),
    ],
    [
      "missing Coolify",
      (receipt) =>
        receipt.resources.splice(
          receipt.resources.findIndex((resource) => resource.provider === "coolify"),
          1,
        ),
    ],
    [
      "misclassified Pangolin",
      (receipt) => (providerResource(receipt, "pangolin").capability = "deployment"),
    ],
    ["GitHub is outside the receipt", (receipt) => (receipt.resources[0].provider = "github")],
    ["missing rollback", (receipt) => delete providerResource(receipt, "auth0").rollback],
    ["missing verification", (receipt) => delete providerResource(receipt, "auth0").verification],
  ];
  for (const [name, mutate] of fixtures) assertRejected(name, mutate, example, validate, steps);
  return fixtures.length;
}

function receiptArgument(argv) {
  if (argv.length === 0) return undefined;
  if (argv.length === 2 && argv[0] === "--receipt" && argv[1]) return argv[1];
  throw new Error("Usage: check-provider-readiness.mjs [--receipt <protected-local-path>]");
}

const validate = makeValidator();
const steps = guideSteps();
const example = loadJson(examplePath);
validateReceipt(example, validate, steps);
const fixtureCount = runInvalidFixtures(example, validate, steps);
const localReceipt = receiptArgument(process.argv.slice(2));
if (localReceipt) validateReceipt(loadJson(localReceipt), validate, steps);

process.stdout.write(
  `P02-READINESS-001 passed: synthetic receipt, ${fixtureCount} negative fixtures${
    localReceipt ? ", and protected local receipt" : ""
  }.\n`,
);
