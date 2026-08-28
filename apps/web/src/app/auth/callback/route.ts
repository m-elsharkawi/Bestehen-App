import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getIdentityService } from "../../../server/identity";
import { applicationRequestUrl } from "../../../server/runtime";

export async function GET(request: Request): Promise<Response> {
  const current = applicationRequestUrl(request.url);
  const callback = await getIdentityService()
    .completeCallback(current)
    .catch(() => undefined);
  if (!callback?.ok) {
    const failure = new URL("/auth/failure", current.origin);
    failure.searchParams.set("code", "sign_in_failed");
    const returnTo = current.searchParams.get("returnTo");
    if (returnTo) failure.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(failure, 303);
  }
  const cookieStore = await cookies();
  cookieStore.set(appSessionCookie.name, callback.value.token, appSessionCookie.options);
  return NextResponse.redirect(new URL(callback.value.returnPath, current.origin), 303);
}
