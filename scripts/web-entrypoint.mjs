import { spawn } from "node:child_process";
import process from "node:process";

const serverPath = process.argv[2];
if (!serverPath) throw new Error("The standalone Next server path is required");
const graceMilliseconds = Number.parseInt(process.env.BESTEHEN_SHUTDOWN_GRACE_MS ?? "5000", 10);
if (!Number.isInteger(graceMilliseconds) || graceMilliseconds < 100 || graceMilliseconds > 60_000) {
  throw new Error("BESTEHEN_SHUTDOWN_GRACE_MS is invalid");
}

const child = spawn(process.execPath, [serverPath], { env: process.env, stdio: "inherit" });
let stoppingSignal;
let forced = false;
let timer;

function stop(signal) {
  if (stoppingSignal) return;
  stoppingSignal = signal;
  child.kill(signal);
  timer = setTimeout(() => {
    forced = true;
    child.kill("SIGKILL");
  }, graceMilliseconds);
}

process.once("SIGTERM", () => stop("SIGTERM"));
process.once("SIGINT", () => stop("SIGINT"));
child.once("error", (error) => {
  process.stderr.write(`Web startup failed: ${error.message}\n`);
  process.exitCode = 1;
});
child.once("exit", (code, signal) => {
  if (timer) clearTimeout(timer);
  const gracefulSignalExit =
    stoppingSignal && !forced && (signal === stoppingSignal || code === 0 || code === 128 + 15);
  process.exitCode = gracefulSignalExit ? 0 : (code ?? 1);
});
