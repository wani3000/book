import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import {
  createKakaoOAuthToken,
  KAKAO_COOKIE_MAX_AGE,
  KAKAO_OAUTH_COOKIE,
  kakaoLoginEnabled,
  kakaoRedirectUri,
  pkceChallenge,
  randomUrlSafe,
  safeReturnTo,
  type KakaoIntent,
} from "@/app/auth/kakao";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  if (!kakaoLoginEnabled()) {
    return NextResponse.redirect(new URL("/mypage?auth_error=kakao_unavailable", request.url));
  }
  const intent: KakaoIntent = requestUrl.searchParams.get("intent") === "link" ? "link" : "login";
  if (intent === "link" && !(await getAuthenticatedMember(request))) {
    return NextResponse.redirect(new URL("/mypage?auth_error=login_required#profile", request.url));
  }

  const state = randomUrlSafe();
  const nonce = randomUrlSafe();
  const verifier = randomUrlSafe(48);
  let referrerPath = "";
  try {
    const referrer = new URL(request.headers.get("referer") ?? "");
    if (referrer.origin === requestUrl.origin) referrerPath = `${referrer.pathname}${referrer.search}`;
  } catch {
    referrerPath = "";
  }
  const returnTo = safeReturnTo(requestUrl.searchParams.get("returnTo") ?? referrerPath);
  const oauthToken = await createKakaoOAuthToken({ state, nonce, verifier, intent, returnTo });
  const authorizeUrl = new URL("https://kauth.kakao.com/oauth/authorize");
  authorizeUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: process.env.KAKAO_REST_API_KEY ?? "",
    redirect_uri: kakaoRedirectUri(),
    state,
    nonce,
    scope: "openid profile_nickname profile_image account_email",
    code_challenge: pkceChallenge(verifier),
    code_challenge_method: "S256",
  }).toString();

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(KAKAO_OAUTH_COOKIE, oauthToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: KAKAO_COOKIE_MAX_AGE,
  });
  return response;
}
