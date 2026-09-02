import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { getServingManifestCommandDependencies } from "../../../../../server/attempt-command-runtime";
import { handleAttemptRecovery } from "../../../../../server/attempt-recovery";

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
): Promise<Response> {
  const [{ id }, store] = await Promise.all([context.params, cookies()]);
  return handleAttemptRecovery(
    getServingManifestCommandDependencies(),
    store.get(appSessionCookie.name)?.value,
    id,
    new URL(request.url).searchParams.get("major") ?? "1",
  );
}
