import { authorize } from "@bestehen/application";
import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { getIdentityService } from "../../../../../server/identity";

export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  const scope = await getIdentityService().authenticate(
    cookieStore.get(appSessionCookie.name)?.value,
  );
  const authorized = authorize(scope, "owner_status:read", {}, new Date());
  if (!authorized.ok) return Response.json({ status: "not_available" }, { status: 404 });
  return Response.json({
    contract: { major: 1, minor: 0 },
    status: "completed",
    owner: { state: "active" },
  });
}
