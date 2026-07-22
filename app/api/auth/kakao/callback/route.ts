import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import {
  createKakaoPendingToken,
  exchangeKakaoCode,
  KAKAO_COOKIE_MAX_AGE,
  KAKAO_OAUTH_COOKIE,
  KAKAO_PENDING_COOKIE,
  readKakaoOAuthToken,
  verifiedKakaoUser,
} from "@/app/auth/kakao";
import { cookieValue, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/app/auth/session";
import { getDb } from "@/db";
import { authIdentities, members } from "@/db/schema";

export const dynamic = "force-dynamic";

function redirectError(request: Request, code: string, profile = false) {
  const response = NextResponse.redirect(new URL(`/mypage?auth_error=${encodeURIComponent(code)}${profile ? "#profile" : ""}`, request.url));
  clearOAuthCookie(response);
  return response;
}

function clearOAuthCookie(response: NextResponse) {
  response.cookies.set(KAKAO_OAUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

async function activeSessionResponse(request: Request, member: typeof members.$inferSelect, returnTo: string) {
  const token = await createSessionToken({
    id: member.id,
    email: member.email,
    name: member.name,
    picture: member.picture ?? undefined,
  });
  const destination = returnTo === "/mypage" ? "/mypage?kakao=logged_in" : returnTo;
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
  const oauth = await readKakaoOAuthToken(cookieValue(request, KAKAO_OAUTH_COOKIE));
  if (!oauth || !url.searchParams.get("state") || url.searchParams.get("state") !== oauth.state) {
    return redirectError(request, "invalid_state");
  }
  if (url.searchParams.get("error")) return redirectError(request, "cancelled", oauth.intent === "link");
  const code = url.searchParams.get("code");
  if (!code) return redirectError(request, "missing_code", oauth.intent === "link");

  try {
    const tokens = await exchangeKakaoCode(code, oauth.verifier);
    const kakaoUser = await verifiedKakaoUser(tokens.accessToken, tokens.idToken, oauth.nonce);
    const identity = await getDb().query.authIdentities.findFirst({
      where: and(eq(authIdentities.provider, "kakao"), eq(authIdentities.providerSubject, kakaoUser.providerSubject)),
    });

    if (oauth.intent === "link") {
      const current = await getAuthenticatedMember(request);
      if (!current) return redirectError(request, "login_required", true);
      if (identity && identity.memberId !== current.id) return redirectError(request, "kakao_already_linked", true);
      const existingForMember = await getDb().query.authIdentities.findFirst({
        where: and(eq(authIdentities.memberId, current.id), eq(authIdentities.provider, "kakao")),
      });
      if (existingForMember && existingForMember.providerSubject !== kakaoUser.providerSubject) {
        return redirectError(request, "member_has_kakao", true);
      }
      const now = new Date().toISOString();
      await getDb().insert(authIdentities).values({
        id: crypto.randomUUID(),
        memberId: current.id,
        provider: "kakao",
        providerSubject: kakaoUser.providerSubject,
        providerEmail: kakaoUser.email,
        lastLoginAt: now,
      }).onConflictDoUpdate({
        target: [authIdentities.provider, authIdentities.providerSubject],
        set: { providerEmail: kakaoUser.email, lastLoginAt: now },
      });
      const response = NextResponse.redirect(new URL("/mypage/profile?kakao=linked", request.url));
      clearOAuthCookie(response);
      return response;
    }

    if (identity) {
      const member = await getDb().query.members.findFirst({ where: eq(members.id, identity.memberId) });
      if (!member) return redirectError(request, "member_not_found");
      if (member.status === "suspended") return redirectError(request, "suspended");
      if (member.status === "deleted") {
        const pendingToken = await createKakaoPendingToken({
          ...kakaoUser,
          flow: "reactivate",
          memberId: member.id,
          returnTo: oauth.returnTo,
        });
        const response = NextResponse.redirect(new URL(`/mypage?kakao=consent&next=${encodeURIComponent(oauth.returnTo)}`, request.url));
        response.cookies.set(KAKAO_PENDING_COOKIE, pendingToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: KAKAO_COOKIE_MAX_AGE,
        });
        clearOAuthCookie(response);
        return response;
      }
      const now = new Date().toISOString();
      await Promise.all([
        getDb().update(authIdentities).set({ providerEmail: kakaoUser.email, lastLoginAt: now }).where(eq(authIdentities.id, identity.id)),
        getDb().update(members).set({ lastLoginAt: now, updatedAt: now }).where(eq(members.id, member.id)),
      ]);
      return activeSessionResponse(request, member, oauth.returnTo);
    }

    const sameEmail = await getDb().query.members.findFirst({ where: eq(members.email, kakaoUser.email) });
    if (sameEmail) return redirectError(request, "account_link_required");
    const pendingToken = await createKakaoPendingToken({ ...kakaoUser, flow: "signup", returnTo: oauth.returnTo });
    const response = NextResponse.redirect(new URL(`/mypage?kakao=consent&next=${encodeURIComponent(oauth.returnTo)}`, request.url));
    response.cookies.set(KAKAO_PENDING_COOKIE, pendingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: KAKAO_COOKIE_MAX_AGE,
    });
    clearOAuthCookie(response);
    return response;
  } catch (error) {
    const code = error instanceof Error && error.message === "KAKAO_VERIFIED_EMAIL_REQUIRED" ? "verified_email_required" : "kakao_failed";
    return redirectError(request, code, oauth.intent === "link");
  }
}
