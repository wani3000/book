import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { authSecretKey } from "./session";

export const GOOGLE_OAUTH_COOKIE = "daniels_note_google_oauth";
export const GOOGLE_PENDING_COOKIE = "daniels_note_google_pending";
export const GOOGLE_COOKIE_MAX_AGE = 60 * 10;

export type GoogleIntent = "login" | "link";
export type GooglePendingFlow = "signup" | "reactivate";

type GoogleOAuthState = {
  state: string;
  nonce: string;
  verifier: string;
  intent: GoogleIntent;
  returnTo: string;
};

export type GoogleUser = {
  providerSubject: string;
  email: string;
  name: string;
  picture?: string;
};

export type GooglePendingUser = GoogleUser & {
  flow: GooglePendingFlow;
  memberId?: string;
  returnTo: string;
};

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export function googleRedirectUri() {
  const explicit = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return siteUrl ? `${siteUrl}/api/auth/google/callback` : "";
}

export function googleOAuthEnabled() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim()
    && process.env.GOOGLE_CLIENT_SECRET?.trim()
    && process.env.GOOGLE_SESSION_SECRET?.trim()
    && googleRedirectUri(),
  );
}

export function safeGoogleReturnTo(value: string | null | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/mypage";
}

export function randomGoogleToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function googlePkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export async function createGoogleOAuthToken(value: GoogleOAuthState) {
  return new SignJWT(value)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("daniels-note")
    .setAudience("google-oauth")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(authSecretKey());
}

export async function readGoogleOAuthToken(token?: string | null): Promise<GoogleOAuthState | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecretKey(), {
      algorithms: ["HS256"], issuer: "daniels-note", audience: "google-oauth",
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
      returnTo: safeGoogleReturnTo(payload.returnTo),
    };
  } catch {
    return null;
  }
}

export async function createGooglePendingToken(value: GooglePendingUser) {
  return new SignJWT(value)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("daniels-note")
    .setAudience("google-pending")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(authSecretKey());
}

export async function readGooglePendingToken(token?: string | null): Promise<GooglePendingUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecretKey(), {
      algorithms: ["HS256"], issuer: "daniels-note", audience: "google-pending",
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
      returnTo: safeGoogleReturnTo(payload.returnTo),
    };
  } catch {
    return null;
  }
}

export async function exchangeGoogleCode(code: string, verifier: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: googleRedirectUri(),
      code,
      code_verifier: verifier,
    }),
  });
  if (!response.ok) throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
  const result = await response.json() as { id_token?: unknown };
  if (typeof result.id_token !== "string") throw new Error("GOOGLE_TOKEN_RESPONSE_INVALID");
  return result.id_token;
}

export async function verifiedGoogleUser(idToken: string, nonce: string): Promise<GoogleUser> {
  const { payload } = await jwtVerify(idToken, googleKeys, {
    audience: process.env.GOOGLE_CLIENT_ID ?? "",
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });
  if (
    !payload.sub
    || payload.nonce !== nonce
    || payload.email_verified !== true
    || typeof payload.email !== "string"
  ) throw new Error("GOOGLE_ID_TOKEN_INVALID");
  return {
    providerSubject: payload.sub,
    email: payload.email.trim().toLowerCase(),
    name: typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : payload.email.split("@")[0],
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
  };
}
