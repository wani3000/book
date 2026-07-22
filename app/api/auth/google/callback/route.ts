import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import {
  createGooglePendingToken,
  exchangeGoogleCode,
  GOOGLE_COOKIE_MAX_AGE,
  GOOGLE_OAUTH_COOKIE,
  GOOGLE_PENDING_COOKIE,
  readGoogleOAuthToken,
  verifiedGoogleUser,
} from "@/app/auth/google";
import { cookieValue, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/app/auth/session";
import { getDb } from "@/db";
import { authIdentities, members } from "@/db/schema";

export const dynamic = "force-dynamic";

function clearOAuthCookie(response: NextResponse) {
  response.cookies.set(GOOGLE_OAUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

function redirectError(request: Request, code: string, profile = false) {
  const path = profile ? `/mypage/profile?auth_error=${encodeURIComponent(code)}` : `/mypage?auth_error=${encodeURIComponent(code)}`;
  const response = NextResponse.redirect(new URL(path, request.url));
  clearOAuthCookie(response);
  return response;
}

async function activeSessionResponse(request: Request, member: typeof members.$inferSelect, returnTo: string) {
  const token = await createSessionToken({
    id: member.id, email: member.email, name: member.name, picture: member.picture ?? undefined,
  });
  const destination = returnTo === "/mypage" ? "/mypage?google=logged_in" : returnTo;
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  clearOAuthCookie(response);
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oauth = await readGoogleOAuthToken(cookieValue(request, GOOGLE_OAUTH_COOKIE));
  if (!oauth || !url.searchParams.get("state") || url.searchParams.get("state") !== oauth.state) {
    return redirectError(request, "google_invalid_state");
  }
  if (url.searchParams.get("error")) return redirectError(request, "google_cancelled", oauth.intent === "link");
  const code = url.searchParams.get("code");
  if (!code) return redirectError(request, "google_missing_code", oauth.intent === "link");

  try {
    const idToken = await exchangeGoogleCode(code, oauth.verifier);
    const googleUser = await verifiedGoogleUser(idToken, oauth.nonce);
    let identity = await getDb().query.authIdentities.findFirst({
      where: and(eq(authIdentities.provider, "google"), eq(authIdentities.providerSubject, googleUser.providerSubject)),
    });

    if (oauth.intent === "link") {
      const current = await getAuthenticatedMember(request);
      if (!current) return redirectError(request, "login_required", true);
      if (identity && identity.memberId !== current.id) return redirectError(request, "google_already_linked", true);
      const existingForMember = await getDb().query.authIdentities.findFirst({
        where: and(eq(authIdentities.memberId, current.id), eq(authIdentities.provider, "google")),
      });
      if (existingForMember && existingForMember.providerSubject !== googleUser.providerSubject) {
        return redirectError(request, "member_has_google", true);
      }
      const now = new Date().toISOString();
      await getDb().insert(authIdentities).values({
        id: identity?.id ?? crypto.randomUUID(),
        memberId: current.id,
        provider: "google",
        providerSubject: googleUser.providerSubject,
        providerEmail: googleUser.email,
        lastLoginAt: now,
      }).onConflictDoUpdate({
        target: [authIdentities.provider, authIdentities.providerSubject],
        set: { memberId: current.id, providerEmail: googleUser.email, lastLoginAt: now },
      });
      const response = NextResponse.redirect(new URL("/mypage/profile?google=linked", request.url));
      clearOAuthCookie(response);
      return response;
    }

    let member = identity
      ? await getDb().query.members.findFirst({ where: eq(members.id, identity.memberId) })
      : await getDb().query.members.findFirst({ where: eq(members.id, googleUser.providerSubject) });
    if (!identity && member) {
      await getDb().insert(authIdentities).values({
        id: crypto.randomUUID(), memberId: member.id, provider: "google",
        providerSubject: googleUser.providerSubject, providerEmail: googleUser.email,
      });
      identity = await getDb().query.authIdentities.findFirst({
        where: and(eq(authIdentities.provider, "google"), eq(authIdentities.providerSubject, googleUser.providerSubject)),
      });
    }
    if (identity && !member) member = await getDb().query.members.findFirst({ where: eq(members.id, identity.memberId) });
    if (member?.status === "suspended") return redirectError(request, "suspended");
    if (member?.status === "deleted") {
      const pendingToken = await createGooglePendingToken({ ...googleUser, flow: "reactivate", memberId: member.id, returnTo: oauth.returnTo });
      const response = NextResponse.redirect(new URL(`/mypage?google=consent&next=${encodeURIComponent(oauth.returnTo)}`, request.url));
      response.cookies.set(GOOGLE_PENDING_COOKIE, pendingToken, {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: GOOGLE_COOKIE_MAX_AGE,
      });
      clearOAuthCookie(response);
      return response;
    }
    if (member) {
      const now = new Date().toISOString();
      await Promise.all([
        getDb().update(authIdentities).set({ providerEmail: googleUser.email, lastLoginAt: now }).where(eq(authIdentities.id, identity!.id)),
        getDb().update(members).set({ lastLoginAt: now, updatedAt: now, picture: googleUser.picture }).where(eq(members.id, member.id)),
      ]);
      return activeSessionResponse(request, member, oauth.returnTo);
    }
    const sameEmail = await getDb().query.members.findFirst({ where: eq(members.email, googleUser.email) });
    if (sameEmail) return redirectError(request, "google_account_link_required");
    const pendingToken = await createGooglePendingToken({ ...googleUser, flow: "signup", returnTo: oauth.returnTo });
    const response = NextResponse.redirect(new URL(`/mypage?google=consent&next=${encodeURIComponent(oauth.returnTo)}`, request.url));
    response.cookies.set(GOOGLE_PENDING_COOKIE, pendingToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: GOOGLE_COOKIE_MAX_AGE,
    });
    clearOAuthCookie(response);
    return response;
  } catch {
    return redirectError(request, "google_failed", oauth.intent === "link");
  }
}
