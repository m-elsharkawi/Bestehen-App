import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { requireSameOriginJsonMutation } from "../../../../../../server/json-mutation-boundary";
import { getListeningCommandDependencies } from "../../../../../../server/listening-command-runtime";
import { handleListeningCommand } from "../../../../../../server/listening-commands";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = requireSameOriginJsonMutation(request);
  if (denied) return denied;
  const { id } = await context.params;
  const cookieStore = await cookies();
  return handleListeningCommand(
    getListeningCommandDependencies(),
    cookieStore.get(appSessionCookie.name)?.value,
    "preflight",
    id,
    await request.json().catch(() => undefined),
  );
}
