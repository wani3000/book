import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import {
  createGoogleOAuthToken,
  GOOGLE_COOKIE_MAX_AGE,
  GOOGLE_OAUTH_COOKIE,
  googleOAuthEnabled,
  googlePkceChallenge,
  googleRedirectUri,
  randomGoogleToken,
  safeGoogleReturnTo,
  type GoogleIntent,
} from "@/app/auth/google";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  if (!googleOAuthEnabled()) {
    return NextResponse.redirect(new URL("/mypage?auth_error=google_unavailable", request.url));
  }
  const intent: GoogleIntent = requestUrl.searchParams.get("intent") === "link" ? "link" : "login";
  if (intent === "link" && !(await getAuthenticatedMember(request))) {
    return NextResponse.redirect(new URL("/mypage/profile?auth_error=login_required", request.url));
  }

  const state = randomGoogleToken();
  const nonce = randomGoogleToken();
  const verifier = randomGoogleToken(48);
  let referrerPath = "";
  try {
    const referrer = new URL(request.headers.get("referer") ?? "");
    if (referrer.origin === requestUrl.origin) referrerPath = `${referrer.pathname}${referrer.search}`;
  } catch {
    referrerPath = "";
  }
  const returnTo = safeGoogleReturnTo(requestUrl.searchParams.get("returnTo") ?? referrerPath);
  const oauthToken = await createGoogleOAuthToken({ state, nonce, verifier, intent, returnTo });
  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: googleRedirectUri(),
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: googlePkceChallenge(verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(GOOGLE_OAUTH_COOKIE, oauthToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GOOGLE_COOKIE_MAX_AGE,
  });
  return response;
}
