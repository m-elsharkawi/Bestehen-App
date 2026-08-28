import { appSessionCookie } from "@bestehen/infrastructure";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { syntheticFixtureEnabled } from "./runtime";
import { getIdentityService } from "./identity";

export const protectedRouteKinds = [
  "coach",
  "readiness",
  "train",
  "progress",
  "settings",
  "settings-data",
] as const;
export type ProtectedRouteKind = (typeof protectedRouteKinds)[number];

const paths: Record<ProtectedRouteKind, string> = {
  coach: "/coach",
  readiness: "/readiness",
  train: "/train",
  progress: "/progress",
  settings: "/settings",
  "settings-data": "/settings/data",
};

export function safeHeldDestination(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "/coach";
  return (protectedRouteKinds as readonly string[]).includes(value)
    ? paths[value as ProtectedRouteKind]
    : "/coach";
}

export async function requirePersonalSession(returnPath: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(appSessionCookie.name)?.value;
  let authorized =
    syntheticFixtureEnabled() && cookieStore.get("bestehen-synthetic-session")?.value === "1";
  if (!authorized) {
    try {
      authorized = Boolean(await getIdentityService().authenticate(token));
    } catch {
      authorized = false;
    }
  }
  if (!authorized) redirect(`/auth/login?returnTo=${encodeURIComponent(returnPath)}`);
}
