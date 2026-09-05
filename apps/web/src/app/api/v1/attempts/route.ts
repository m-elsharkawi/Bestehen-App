import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { getAttemptCommandDependencies } from "../../../../server/attempt-command-runtime";
import { handleCreateAttempt } from "../../../../server/attempt-commands";
import { requireSameOriginJsonMutation } from "../../../../server/json-mutation-boundary";

export async function POST(request: Request): Promise<Response> {
  const denied = requireSameOriginJsonMutation(request);
  if (denied) return denied;
  const cookieStore = await cookies();
  return handleCreateAttempt(
    getAttemptCommandDependencies(),
    cookieStore.get(appSessionCookie.name)?.value,
    await request.json().catch(() => undefined),
  );
}
