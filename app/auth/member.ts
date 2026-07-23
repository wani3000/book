import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { members } from "@/db/schema";
import { cookieValue, readSessionToken, SESSION_COOKIE } from "./session";

export const ADMIN_REAUTH_MAX_AGE_SECONDS = 30 * 60;

export function configuredAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isConfiguredAdmin(email: string) {
  return configuredAdminEmails().has(email.toLowerCase());
}

export async function getAuthenticatedMember(request: Request) {
  const session = await readSessionToken(cookieValue(request, SESSION_COOKIE));
  if (!session) return null;
  const member = await getDb().query.members.findFirst({ where: eq(members.id, session.id) });
  if (!member || member.status !== "active") return null;
  return { ...member, authenticatedAt: session.authenticatedAt, isAdmin: member.role === "admin" || isConfiguredAdmin(member.email) };
}

export function hasRecentAuthentication(
  member: NonNullable<Awaited<ReturnType<typeof getAuthenticatedMember>>>,
  maxAgeSeconds = ADMIN_REAUTH_MAX_AGE_SECONDS,
) {
  if (!member.authenticatedAt) return false;
  const ageSeconds = Math.floor(Date.now() / 1000) - member.authenticatedAt;
  return ageSeconds >= 0 && ageSeconds <= maxAgeSeconds;
}

export function publicMember(member: NonNullable<Awaited<ReturnType<typeof getAuthenticatedMember>>>) {
  return {
    id: member.id,
    email: member.email,
    name: member.name,
    displayName: member.displayName,
    picture: member.picture ?? undefined,
    role: member.isAdmin ? "admin" : "member",
    status: member.status,
    marketingConsent: member.marketingConsent === 1,
    notificationEmail: member.notificationEmail,
    pendingNotificationEmail: member.pendingNotificationEmail,
    notificationEmailVerifiedAt: member.notificationEmailVerifiedAt,
    createdAt: member.createdAt,
    lastLoginAt: member.lastLoginAt,
  };
}
