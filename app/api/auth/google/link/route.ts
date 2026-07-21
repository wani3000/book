import { createRemoteJWKSet, jwtVerify } from "jose";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { getDb } from "@/db";
import { authIdentities } from "@/db/schema";

export const dynamic = "force-dynamic";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function POST(request: Request) {
  const member = await getAuthenticatedMember(request);
  if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "Google 로그인을 이용할 수 없습니다." }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { credential?: unknown };
  if (typeof body.credential !== "string" || !body.credential) {
    return NextResponse.json({ error: "Google 인증 정보가 없습니다." }, { status: 400 });
  }
  try {
    const { payload } = await jwtVerify(body.credential, googleKeys, {
      audience: clientId,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
    });
    if (!payload.sub || payload.email_verified !== true || typeof payload.email !== "string") {
      return NextResponse.json({ error: "확인된 Google 이메일이 필요합니다." }, { status: 401 });
    }
    const identity = await getDb().query.authIdentities.findFirst({
      where: and(eq(authIdentities.provider, "google"), eq(authIdentities.providerSubject, payload.sub)),
    });
    if (identity && identity.memberId !== member.id) {
      return NextResponse.json({ error: "이 Google 계정은 다른 회원에게 이미 연결되어 있습니다." }, { status: 409 });
    }
    const memberGoogle = await getDb().query.authIdentities.findFirst({
      where: and(eq(authIdentities.memberId, member.id), eq(authIdentities.provider, "google")),
    });
    if (memberGoogle && memberGoogle.providerSubject !== payload.sub) {
      return NextResponse.json({ error: "이미 다른 Google 계정이 연결되어 있습니다." }, { status: 409 });
    }
    const now = new Date().toISOString();
    await getDb().insert(authIdentities).values({
      id: identity?.id ?? crypto.randomUUID(),
      memberId: member.id,
      provider: "google",
      providerSubject: payload.sub,
      providerEmail: payload.email.toLowerCase(),
      lastLoginAt: now,
    }).onConflictDoUpdate({
      target: [authIdentities.provider, authIdentities.providerSubject],
      set: { providerEmail: payload.email.toLowerCase(), lastLoginAt: now },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Google 계정 연결을 확인하지 못했습니다." }, { status: 401 });
  }
}
