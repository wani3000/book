import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { GOOGLE_PENDING_COOKIE, readGooglePendingToken } from "@/app/auth/google";
import { cookieValue, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/app/auth/session";
import { isConfiguredAdmin } from "@/app/auth/member";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/app/account/policy";
import { getDb } from "@/db";
import { authIdentities, members } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const pending = await readGooglePendingToken(cookieValue(request, GOOGLE_PENDING_COOKIE));
  return NextResponse.json(pending ? { pending: true, flow: pending.flow } : { pending: false }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const pending = await readGooglePendingToken(cookieValue(request, GOOGLE_PENDING_COOKIE));
  if (!pending) return NextResponse.json({ error: "Google 로그인 시간이 만료되었습니다. 다시 시도해 주세요." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  if (body.termsAccepted !== true || body.privacyAccepted !== true) {
    return NextResponse.json({ error: "필수 약관에 동의해 주세요." }, { status: 400 });
  }
  const now = new Date().toISOString();
  const existing = pending.memberId
    ? await getDb().query.members.findFirst({ where: eq(members.id, pending.memberId) })
    : undefined;
  if (pending.flow === "reactivate" && !existing) {
    return NextResponse.json({ error: "재가입할 회원 정보를 찾지 못했습니다." }, { status: 404 });
  }
  if (!existing) {
    const sameEmail = await getDb().query.members.findFirst({ where: eq(members.email, pending.email) });
    if (sameEmail) {
      return NextResponse.json({ error: "같은 이메일의 기존 계정이 있습니다. 기존 로그인으로 접속한 뒤 Google 계정을 연결해 주세요." }, { status: 409 });
    }
  }
  const memberId = existing?.id ?? crypto.randomUUID();
  await getDb().insert(members).values({
    id: memberId,
    email: pending.email,
    name: pending.name,
    displayName: pending.name,
    picture: pending.picture,
    role: isConfiguredAdmin(pending.email) ? "admin" : "member",
    status: "active",
    marketingConsent: body.marketingConsent === true ? 1 : 0,
    termsAcceptedAt: now,
    termsVersion: TERMS_VERSION,
    privacyAcceptedAt: now,
    privacyVersion: PRIVACY_VERSION,
    reactivatedAt: existing ? now : undefined,
    deletedAt: null,
    updatedAt: now,
    lastLoginAt: now,
  }).onConflictDoUpdate({
    target: members.id,
    set: {
      email: pending.email, name: pending.name, displayName: pending.name, picture: pending.picture,
      role: isConfiguredAdmin(pending.email) ? "admin" : "member", status: "active",
      marketingConsent: body.marketingConsent === true ? 1 : 0,
      termsAcceptedAt: now, termsVersion: TERMS_VERSION, privacyAcceptedAt: now, privacyVersion: PRIVACY_VERSION,
      reactivatedAt: now, deletedAt: null, updatedAt: now, lastLoginAt: now,
    },
  });
  await getDb().insert(authIdentities).values({
    id: crypto.randomUUID(), memberId, provider: "google", providerSubject: pending.providerSubject,
    providerEmail: pending.email, lastLoginAt: now,
  }).onConflictDoUpdate({
    target: [authIdentities.provider, authIdentities.providerSubject],
    set: { memberId, providerEmail: pending.email, lastLoginAt: now },
  });
  const token = await createSessionToken({ id: memberId, email: pending.email, name: pending.name, picture: pending.picture });
  const response = NextResponse.json({
    user: { id: memberId, email: pending.email, name: pending.name, displayName: pending.name, picture: pending.picture },
    returnTo: pending.returnTo,
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE,
  });
  response.cookies.set(GOOGLE_PENDING_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
