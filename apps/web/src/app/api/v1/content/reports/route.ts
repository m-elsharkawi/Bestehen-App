import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { handleDefectReportCommand } from "../../../../../server/content-commands";
import { getContentCommandDependencies } from "../../../../../server/content-runtime";

export async function POST(request: Request): Promise<Response> {
  const cookieStore = await cookies();
  const body = await request.json().catch(() => undefined);
  return handleDefectReportCommand(
    getContentCommandDependencies(),
    cookieStore.get(appSessionCookie.name)?.value,
    body,
  );
}
