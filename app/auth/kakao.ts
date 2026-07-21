import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { authSecretKey } from "./session";

export const KAKAO_OAUTH_COOKIE = "daniels_note_kakao_oauth";
export const KAKAO_PENDING_COOKIE = "daniels_note_kakao_pending";
export const KAKAO_COOKIE_MAX_AGE = 60 * 10;

export type KakaoIntent = "login" | "link";
export type KakaoPendingFlow = "signup" | "reactivate";

type KakaoOAuthState = {
  state: string;
  nonce: string;
  verifier: string;
  intent: KakaoIntent;
  returnTo: string;
};

export type KakaoPendingUser = {
  providerSubject: string;
  email: string;
  name: string;
  picture?: string;
  flow: KakaoPendingFlow;
  memberId?: string;
  returnTo: string;
};

const kakaoKeys = createRemoteJWKSet(new URL("https://kauth.kakao.com/.well-known/jwks.json"));

export function kakaoRedirectUri() {
  const explicit = process.env.KAKAO_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return siteUrl ? `${siteUrl}/api/auth/kakao/callback` : "";
}

export function kakaoLoginEnabled() {
  return Boolean(
    process.env.KAKAO_REST_API_KEY?.trim()
    && process.env.KAKAO_CLIENT_SECRET?.trim()
    && process.env.KAKAO_ADMIN_KEY?.trim()
    && process.env.GOOGLE_SESSION_SECRET?.trim()
    && kakaoRedirectUri(),
  );
}

export function safeReturnTo(value: string | null | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/mypage";
}

export function randomUrlSafe(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function pkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export async function createKakaoOAuthToken(value: KakaoOAuthState) {
  return new SignJWT(value)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("daniels-note")
    .setAudience("kakao-oauth")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(authSecretKey());
}

export async function readKakaoOAuthToken(token?: string | null): Promise<KakaoOAuthState | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecretKey(), {
      algorithms: ["HS256"],
      issuer: "daniels-note",
      audience: "kakao-oauth",
    });
    if (
      typeof payload.state !== "string"
      || typeof payload.nonce !== "string"
      || typeof payload.verifier !== "string"
      || (payload.intent !== "login" && payload.intent !== "link")
      || typeof payload.returnTo !== "string"
    ) return null;
    return {
      state: payload.state,
      nonce: payload.nonce,
      verifier: payload.verifier,
      intent: payload.intent,
      returnTo: safeReturnTo(payload.returnTo),
    };
  } catch {
    return null;
  }
}

export async function createKakaoPendingToken(user: KakaoPendingUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("daniels-note")
    .setAudience("kakao-pending")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(authSecretKey());
}

export async function readKakaoPendingToken(token?: string | null): Promise<KakaoPendingUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecretKey(), {
      algorithms: ["HS256"],
      issuer: "daniels-note",
      audience: "kakao-pending",
    });
    if (
      typeof payload.providerSubject !== "string"
      || typeof payload.email !== "string"
      || typeof payload.name !== "string"
      || (payload.flow !== "signup" && payload.flow !== "reactivate")
      || typeof payload.returnTo !== "string"
    ) return null;
    return {
      providerSubject: payload.providerSubject,
      email: payload.email,
      name: payload.name,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
      flow: payload.flow,
      memberId: typeof payload.memberId === "string" ? payload.memberId : undefined,
      returnTo: safeReturnTo(payload.returnTo),
    };
  } catch {
    return null;
  }
}

export async function exchangeKakaoCode(code: string, verifier: string) {
  const response = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_REST_API_KEY ?? "",
      client_secret: process.env.KAKAO_CLIENT_SECRET ?? "",
      redirect_uri: kakaoRedirectUri(),
      code,
      code_verifier: verifier,
    }),
  });
  if (!response.ok) throw new Error("KAKAO_TOKEN_EXCHANGE_FAILED");
  const result = await response.json() as { access_token?: unknown; id_token?: unknown };
  if (typeof result.access_token !== "string" || typeof result.id_token !== "string") {
    throw new Error("KAKAO_TOKEN_RESPONSE_INVALID");
  }
  return { accessToken: result.access_token, idToken: result.id_token };
}

export async function verifiedKakaoUser(accessToken: string, idToken: string, nonce: string) {
  const { payload } = await jwtVerify(idToken, kakaoKeys, {
    audience: process.env.KAKAO_REST_API_KEY ?? "",
    issuer: "https://kauth.kakao.com",
  });
  if (!payload.sub || payload.nonce !== nonce) throw new Error("KAKAO_ID_TOKEN_INVALID");

  const response = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("KAKAO_USERINFO_FAILED");
  const result = await response.json() as {
    id?: string | number;
    properties?: { nickname?: unknown; profile_image?: unknown };
    kakao_account?: {
      email?: unknown;
      is_email_valid?: unknown;
      is_email_verified?: unknown;
      profile?: { nickname?: unknown; profile_image_url?: unknown };
    };
  };
  const providerSubject = String(result.id ?? "");
  if (!providerSubject || providerSubject !== payload.sub) throw new Error("KAKAO_SUBJECT_MISMATCH");
  const email = typeof result.kakao_account?.email === "string" ? result.kakao_account.email.trim().toLowerCase() : "";
  if (!email || result.kakao_account?.is_email_valid !== true || result.kakao_account?.is_email_verified !== true) {
    throw new Error("KAKAO_VERIFIED_EMAIL_REQUIRED");
  }
  const nickname = result.kakao_account?.profile?.nickname ?? result.properties?.nickname;
  const picture = result.kakao_account?.profile?.profile_image_url ?? result.properties?.profile_image;
  return {
    providerSubject,
    email,
    name: typeof nickname === "string" && nickname.trim() ? nickname.trim() : email.split("@")[0],
    picture: typeof picture === "string" ? picture : undefined,
  };
}

export async function unlinkKakaoUser(providerSubject: string) {
  const adminKey = process.env.KAKAO_ADMIN_KEY?.trim();
  if (!adminKey) throw new Error("KAKAO_ADMIN_KEY_MISSING");
  const response = await fetch("https://kapi.kakao.com/v1/user/unlink", {
    method: "POST",
    headers: {
      Authorization: `KakaoAK ${adminKey}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: new URLSearchParams({ target_id_type: "user_id", target_id: providerSubject }),
  });
  if (!response.ok) throw new Error("KAKAO_UNLINK_FAILED");
}
