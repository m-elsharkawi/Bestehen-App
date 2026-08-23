import http from "node:http";

const port = Number.parseInt(process.argv[2] ?? "", 10);
const path = process.argv[3] ?? "/health/live";
const timeoutMilliseconds = Number.parseInt(process.env.HEALTHCHECK_TIMEOUT_MS ?? "2000", 10);

if (!Number.isInteger(port) || port < 1 || port > 65_535 || !path.startsWith("/")) {
  process.stderr.write("Healthcheck requires a valid port and absolute path.\n");
  process.exit(2);
}

const request = http.get(
  { host: "127.0.0.1", path, port, timeout: timeoutMilliseconds },
  (response) => {
    response.resume();
    response.once("end", () =>
      process.exit(response.statusCode && response.statusCode < 400 ? 0 : 1),
    );
  },
);
request.once("timeout", () => request.destroy(new Error("healthcheck timeout")));
request.once("error", () => process.exit(1));
