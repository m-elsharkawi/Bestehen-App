import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { getAttemptCommandDependencies } from "../../../../../../server/attempt-command-runtime";
import { handleAssistanceAttempt } from "../../../../../../server/attempt-commands";

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
): Promise<Response> {
  const [{ id }, cookieStore] = await Promise.all([context.params, cookies()]);
  return handleAssistanceAttempt(
    getAttemptCommandDependencies(),
    cookieStore.get(appSessionCookie.name)?.value,
    id,
    await request.json().catch(() => undefined),
  );
}
