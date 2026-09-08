import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer as createHttpServer, request as httpRequest } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { connect as connectTcp } from "node:net";
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
const connectProxyPort = portFromEnvironment("PLAYWRIGHT_CONNECT_PROXY_PORT", 3302);
const canonicalHostname = "app.bestehen.test";
const canonicalAuthority = `${canonicalHostname}:${publicPort}`;
if (new Set([publicPort, upstreamPort, connectProxyPort]).size !== 3) {
  throw new Error("HTTPS, upstream, and CONNECT proxy ports must differ");
}

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
CN = app.bestehen.test

[extensions]
basicConstraints = critical, CA:FALSE
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alternative_names

[alternative_names]
DNS.1 = app.bestehen.test
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
  const diagnostic = openssl.stderr?.trim() || openssl.error?.message || "unknown OpenSSL failure";
  rmSync(certificateDirectory, { force: true, recursive: true });
  throw new Error(`Unable to create the disposable HTTPS certificate: ${diagnostic}`);
}
let tlsCredentials;
try {
  tlsCredentials = {
    cert: readFileSync(certificatePath),
    key: readFileSync(privateKeyPath),
  };
} finally {
  rmSync(certificateDirectory, { force: true, recursive: true });
}

const nextServer = spawn(process.execPath, [serverPath], {
  env: {
    ...process.env,
    HOSTNAME: upstreamHost,
    PORT: String(upstreamPort),
  },
  stdio: "inherit",
});

const httpsServer = createHttpsServer(tlsCredentials, (request, response) => {
  const incomingAuthority = request.headers.host?.toLowerCase();
  const loopbackAuthority = `${publicHost}:${publicPort}`;
  if (incomingAuthority !== canonicalAuthority && incomingAuthority !== loopbackAuthority) {
    response.writeHead(421, { "content-type": "text/plain; charset=utf-8" });
    response.end("Unexpected HTTPS authority.\n");
    return;
  }
  const authority = canonicalAuthority;
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
});

const tunnelSockets = new Set();
const connectProxy = createHttpServer((_request, response) => {
  response.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
  response.end("Only CONNECT is supported.\n");
});
connectProxy.on("connect", (request, clientSocket, head) => {
  if (request.url?.toLowerCase() !== canonicalAuthority) {
    clientSocket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
    return;
  }
  const upstreamSocket = connectTcp(publicPort, publicHost);
  tunnelSockets.add(clientSocket);
  tunnelSockets.add(upstreamSocket);
  clientSocket.once("close", () => tunnelSockets.delete(clientSocket));
  upstreamSocket.once("close", () => tunnelSockets.delete(upstreamSocket));
  clientSocket.once("error", () => upstreamSocket.destroy());
  upstreamSocket.once("connect", () => {
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    if (head.length > 0) upstreamSocket.write(head);
    clientSocket.pipe(upstreamSocket);
    upstreamSocket.pipe(clientSocket);
  });
  upstreamSocket.once("error", () => {
    clientSocket.end("HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\n\r\n");
  });
});

let stopping = false;
let forcedShutdown;

function stop(signal) {
  if (stopping) return;
  stopping = true;
  for (const socket of tunnelSockets) socket.destroy();
  connectProxy.close();
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
connectProxy.once("error", (error) => {
  process.stderr.write(`Local CONNECT proxy failed: ${error.message}\n`);
  stop("SIGTERM");
});
nextServer.once("error", (error) => {
  process.stderr.write(`Standalone web startup failed: ${error.message}\n`);
  stop("SIGTERM");
});
nextServer.once("exit", (code, signal) => {
  if (forcedShutdown) clearTimeout(forcedShutdown);
  httpsServer.close(() => {
    const expectedSignal = stopping && (signal === "SIGINT" || signal === "SIGTERM");
    process.exitCode = expectedSignal ? 0 : (code ?? 1);
  });
});
httpsServer.listen(publicPort, publicHost, () => {
  process.stdout.write(
    `Local HTTPS frontend listening for ${canonicalAuthority} on ${publicHost}:${publicPort}; standalone Next upstream is http://${upstreamHost}:${upstreamPort}.\n`,
  );
});
connectProxy.listen(connectProxyPort, publicHost);
