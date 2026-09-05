import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { handleContentImpactCommand } from "../../../../../server/content-commands";
import { getContentCommandDependencies } from "../../../../../server/content-runtime";
import { requireSameOriginJsonMutation } from "../../../../../server/json-mutation-boundary";

export async function POST(request: Request): Promise<Response> {
  const denied = requireSameOriginJsonMutation(request);
  if (denied) return denied;
  const cookieStore = await cookies();
  const body = await request.json().catch(() => undefined);
  return handleContentImpactCommand(
    getContentCommandDependencies(),
    cookieStore.get(appSessionCookie.name)?.value,
    body,
  );
}
