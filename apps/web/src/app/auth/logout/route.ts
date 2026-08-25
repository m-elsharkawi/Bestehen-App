import { validateUnsafeRequest } from "@bestehen/application";
import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { getIdentityService } from "../../../server/identity";

export async function POST(request: Request): Promise<Response> {
  const current = new URL(request.url);
  const requestHeaders = await headers();
  const allowed = validateUnsafeRequest(
    {
      origin: requestHeaders.get("origin") ?? undefined,
      "sec-fetch-site": requestHeaders.get("sec-fetch-site") ?? undefined,
    },
    current.origin,
    requestHeaders.get("x-bestehen-csrf") === "1",
  );
  if (!allowed.ok) return Response.json({ status: "not_available" }, { status: 404 });
  const cookieStore = await cookies();
  await getIdentityService().logout(cookieStore.get(appSessionCookie.name)?.value);
  cookieStore.set(appSessionCookie.name, "", { ...appSessionCookie.options, maxAge: 0 });
  return NextResponse.json({ status: "completed" });
}
