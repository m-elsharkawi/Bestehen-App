import { readinessPayload } from "../../../../server/runtime";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const result = await readinessPayload();
  return Response.json(result.payload, {
    headers: { "cache-control": "no-store" },
    status: result.statusCode,
  });
}
