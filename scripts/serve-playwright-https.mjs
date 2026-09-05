import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const serverPath = process.argv[2];
if (!serverPath) throw new Error("The standalone Next server path is required");

function portFromEnvironment(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? String(fallback), 10);
  if (!Number.isInteger(value) || value < 1024 || value > 65_535) {
    throw new Error(`${name} must be a non-privileged TCP port`);
  }
  return value;
}

const publicHost = "127.0.0.1";
const upstreamHost = "127.0.0.1";
const publicPort = portFromEnvironment("PLAYWRIGHT_HTTPS_PORT", 3300);
const upstreamPort = portFromEnvironment("PLAYWRIGHT_UPSTREAM_PORT", 3301);
if (publicPort === upstreamPort) throw new Error("HTTPS and upstream ports must differ");

const certificateDirectory = mkdtempSync(path.join(tmpdir(), "bestehen-playwright-https-"));
const certificatePath = path.join(certificateDirectory, "certificate.pem");
const privateKeyPath = path.join(certificateDirectory, "private-key.pem");
const opensslConfigurationPath = path.join(certificateDirectory, "openssl.cnf");
writeFileSync(
  opensslConfigurationPath,
  `[req]
prompt = no
distinguished_name = subject
x509_extensions = extensions

[subject]
CN = 127.0.0.1

[extensions]
basicConstraints = critical, CA:FALSE
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alternative_names

[alternative_names]
IP.1 = 127.0.0.1
DNS.1 = localhost
`,
  { encoding: "utf8", mode: 0o600 },
);
const openssl = spawnSync(
  "openssl",
  [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-sha256",
    "-days",
    "1",
    "-keyout",
    privateKeyPath,
    "-out",
    certificatePath,
    "-config",
    opensslConfigurationPath,
  ],
  { encoding: "utf8" },
);
if (openssl.status !== 0) {
  rmSync(certificateDirectory, { force: true, recursive: true });
  throw new Error(`Unable to create the disposable HTTPS certificate: ${openssl.stderr.trim()}`);
}

const nextServer = spawn(process.execPath, [serverPath], {
  env: {
    ...process.env,
    HOSTNAME: upstreamHost,
    PORT: String(upstreamPort),
  },
  stdio: "inherit",
});

const httpsServer = createHttpsServer(
  {
    cert: readFileSync(certificatePath),
    key: readFileSync(privateKeyPath),
  },
  (request, response) => {
    const authority = request.headers.host ?? `${publicHost}:${publicPort}`;
    const proxyRequest = httpRequest({
      headers: {
        ...request.headers,
        host: authority,
        "x-forwarded-host": authority,
        "x-forwarded-port": String(publicPort),
        "x-forwarded-proto": "https",
      },
      host: upstreamHost,
      method: request.method,
      path: request.url,
      port: upstreamPort,
    });
    proxyRequest.on("response", (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode ?? 502, proxyResponse.headers);
      proxyResponse.pipe(response);
    });
    proxyRequest.on("error", () => {
      if (!response.headersSent) {
        response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      }
      response.end("Standalone web server is not ready.\n");
    });
    request.on("aborted", () => proxyRequest.destroy());
    request.pipe(proxyRequest);
  },
);

let stopping = false;
let forcedShutdown;

function removeCertificate() {
  rmSync(certificateDirectory, { force: true, recursive: true });
}

function stop(signal) {
  if (stopping) return;
  stopping = true;
  httpsServer.close();
  nextServer.kill(signal);
  forcedShutdown = setTimeout(() => nextServer.kill("SIGKILL"), 5_000);
}

process.once("SIGINT", () => stop("SIGINT"));
process.once("SIGTERM", () => stop("SIGTERM"));
httpsServer.once("error", (error) => {
  process.stderr.write(`Local HTTPS server failed: ${error.message}\n`);
  stop("SIGTERM");
});
nextServer.once("error", (error) => {
  process.stderr.write(`Standalone web startup failed: ${error.message}\n`);
  stop("SIGTERM");
});
nextServer.once("exit", (code, signal) => {
  if (forcedShutdown) clearTimeout(forcedShutdown);
  httpsServer.close(() => {
    removeCertificate();
    const expectedSignal = stopping && (signal === "SIGINT" || signal === "SIGTERM");
    process.exitCode = expectedSignal ? 0 : (code ?? 1);
  });
});
httpsServer.listen(publicPort, publicHost, () => {
  process.stdout.write(
    `Local HTTPS frontend listening on https://${publicHost}:${publicPort}; standalone Next upstream is http://${upstreamHost}:${upstreamPort}.\n`,
  );
});
