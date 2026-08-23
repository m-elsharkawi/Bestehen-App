import { livenessPayload } from "../../../../server/runtime";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json(livenessPayload(), {
    headers: { "cache-control": "no-store" },
    status: 200,
  });
}
