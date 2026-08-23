import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const project = process.cwd();
const standaloneProject = path.join(project, ".next", "standalone", "apps", "web");
const staticSource = path.join(project, ".next", "static");
const staticTarget = path.join(standaloneProject, ".next", "static");
if (!existsSync(path.join(standaloneProject, "server.js")) || !existsSync(staticSource)) {
  throw new Error("Next standalone output is incomplete");
}
mkdirSync(path.dirname(staticTarget), { recursive: true });
cpSync(staticSource, staticTarget, { recursive: true });

const publicSource = path.join(project, "public");
if (existsSync(publicSource)) {
  cpSync(publicSource, path.join(standaloneProject, "public"), { recursive: true });
}
