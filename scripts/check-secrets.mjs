import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import process from "node:process";

const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const forbidden = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[oprsu]_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-[A-Za-z0-9_-]{24,}\b/,
  new RegExp(["sentinel", "secret", "stage01"].join("-")),
];

for (const file of files) {
  if (statSync(file).size > 2_000_000) continue;
  const buffer = readFileSync(file);
  if (buffer.includes(0)) continue;
  const source = buffer.toString("utf8");
  for (const pattern of forbidden) {
    if (pattern.test(source)) throw new Error(`Potential secret material found in ${file}`);
  }
}

const example = readFileSync(".env.example", "utf8");
if (/^BESTEHEN_.*_ADAPTER=configured$/m.test(example)) {
  throw new Error(".env.example must retain fake adapters");
}
if (/^(?:BESTEHEN_.*(?:SECRET|KEY|TOKEN|ALLOWLIST))=[^#\s]+$/m.test(example)) {
  throw new Error(".env.example contains a populated secret or private identity field");
}
process.stdout.write(
  `Secret policy passed for ${files.length} repository files and the safe example.\n`,
);
