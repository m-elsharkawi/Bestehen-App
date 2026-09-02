import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { getServingManifestCommandDependencies } from "../../../../server/attempt-command-runtime";
import { handleAcquireServingManifest } from "../../../../server/serving-manifest-commands";

export async function POST(request: Request): Promise<Response> {
  const cookieStore = await cookies();
  return handleAcquireServingManifest(
    getServingManifestCommandDependencies(),
    cookieStore.get(appSessionCookie.name)?.value,
    await request.json().catch(() => undefined),
  );
}
