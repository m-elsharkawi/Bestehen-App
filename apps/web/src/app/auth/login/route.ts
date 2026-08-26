import { NextResponse } from "next/server";
import { getIdentityService } from "../../../server/identity";
import { applicationRequestUrl } from "../../../server/runtime";

export async function GET(request: Request): Promise<Response> {
  const current = applicationRequestUrl(request.url);
  try {
    const destination = await getIdentityService().loginUrl(
      current.searchParams.get("returnTo") ?? "/",
    );
    return NextResponse.redirect(
      destination ?? new URL("/auth/failure?code=identity_not_configured", current.origin),
      303,
    );
  } catch {
    return NextResponse.redirect(
      new URL("/auth/failure?code=sign_in_unavailable", current.origin),
      303,
    );
  }
}
