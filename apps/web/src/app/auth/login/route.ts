import { NextResponse } from "next/server";
import { getIdentityService } from "../../../server/identity";
import { applicationRequestUrl } from "../../../server/runtime";

export async function GET(request: Request): Promise<Response> {
  const current = applicationRequestUrl(request.url);
  try {
    const destination = await getIdentityService().loginUrl(
      current.searchParams.get("returnTo") ?? "/",
    );
    if (destination) return NextResponse.redirect(destination, 303);
    const failure = new URL("/auth/failure", current.origin);
    failure.searchParams.set("code", "identity_not_configured");
    const returnTo = current.searchParams.get("returnTo");
    if (returnTo) failure.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(failure, 303);
  } catch {
    const failure = new URL("/auth/failure", current.origin);
    failure.searchParams.set("code", "sign_in_unavailable");
    const returnTo = current.searchParams.get("returnTo");
    if (returnTo) failure.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(failure, 303);
  }
}
