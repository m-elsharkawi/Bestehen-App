import { spawnSync } from "node:child_process";
import process from "node:process";

process.loadEnvFile(".env");
const [command, ...arguments_] = process.argv.slice(2);
if (!command) throw new Error("A command is required");
const result = spawnSync(command, arguments_, { env: process.env, stdio: "inherit" });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
