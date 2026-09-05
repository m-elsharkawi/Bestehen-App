import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { getAttemptCommandDependencies } from "../../../../../../server/attempt-command-runtime";
import { handleExposureAttempt } from "../../../../../../server/attempt-commands";
import { requireSameOriginJsonMutation } from "../../../../../../server/json-mutation-boundary";

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
): Promise<Response> {
  const denied = requireSameOriginJsonMutation(request);
  if (denied) return denied;
  const [{ id }, cookieStore] = await Promise.all([context.params, cookies()]);
  return handleExposureAttempt(
    getAttemptCommandDependencies(),
    cookieStore.get(appSessionCookie.name)?.value,
    id,
    await request.json().catch(() => undefined),
  );
}
