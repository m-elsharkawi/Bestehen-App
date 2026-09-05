import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { getListeningCommandDependencies } from "../../../../../../../server/listening-command-runtime";
import { handleListeningCommand } from "../../../../../../../server/listening-commands";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; mediaId: string }> },
) {
  const { id, mediaId } = await context.params;
  const cookieStore = await cookies();
  return handleListeningCommand(
    getListeningCommandDependencies(),
    cookieStore.get(appSessionCookie.name)?.value,
    "transcript",
    id,
    undefined,
    mediaId,
  );
}
