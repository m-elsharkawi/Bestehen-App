import { validateUnsafeRequest } from "@bestehen/application";
import { applicationRequestUrl } from "./runtime";

const jsonContentType = /^application\/json(?:\s*;\s*charset\s*=\s*utf-8)?\s*$/i;

function notAvailable(): Response {
  return Response.json({ status: "not_available" }, { status: 404 });
}

/**
 * Refuses unsafe JSON requests before a route reads its body, session cookie, or command runtime.
 * Listening command routes reuse this boundary when they are added.
 */
export function requireSameOriginJsonMutation(request: Request): Response | undefined {
  if (request.method !== "POST") return notAvailable();

  const contentType = request.headers.get("content-type");
  if (!contentType || !jsonContentType.test(contentType)) return notAvailable();

  const current = applicationRequestUrl(request.url);
  const allowed = validateUnsafeRequest(
    {
      origin: request.headers.get("origin") ?? undefined,
      "sec-fetch-site": request.headers.get("sec-fetch-site") ?? undefined,
    },
    current.origin,
    request.headers.get("x-bestehen-csrf") === "1",
  );
  return allowed.ok ? undefined : notAvailable();
}
