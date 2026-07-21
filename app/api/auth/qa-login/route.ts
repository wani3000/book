import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/app/account/policy";
import { qaAdminCredentials, secretsMatch } from "@/app/auth/qa";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/app/auth/session";
import { getDb } from "@/db";
import { members } from "@/db/schema";

export const dynamic = "force-dynamic";

const unavailable = () => NextResponse.json(
  { error: "로그인 정보를 확인할 수 없습니다." },
  { status: 404, headers: { "Cache-Control": "no-store" } },
);

export async function POST(request: Request) {
  const configured = qaAdminCredentials();
  if (!configured) return unavailable();

  let email = "";
  let password = "";
  try {
    const body = await request.json() as { email?: unknown; password?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return unavailable();
  }

  const [emailMatches, passwordMatches] = await Promise.all([
    secretsMatch(email, configured.email),
    secretsMatch(password, configured.password),
  ]);
  if (!emailMatches || !passwordMatches) {
    return NextResponse.json(
      { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const now = new Date().toISOString();
    const existing = await getDb().query.members.findFirst({ where: eq(members.email, configured.email) });
    const memberId = existing?.id ?? crypto.randomUUID();
    if (existing) {
      await getDb().update(members).set({
        name: "QA 관리자",
        displayName: "QA 관리자",
        role: "admin",
        status: "active",
        termsAcceptedAt: existing.termsAcceptedAt ?? now,
        termsVersion: existing.termsVersion ?? TERMS_VERSION,
        privacyAcceptedAt: existing.privacyAcceptedAt ?? now,
        privacyVersion: existing.privacyVersion ?? PRIVACY_VERSION,
        deletedAt: null,
        updatedAt: now,
        lastLoginAt: now,
      }).where(eq(members.id, memberId));
    } else {
      await getDb().insert(members).values({
        id: memberId,
        email: configured.email,
        name: "QA 관리자",
        displayName: "QA 관리자",
        role: "admin",
        status: "active",
        termsAcceptedAt: now,
        termsVersion: TERMS_VERSION,
        privacyAcceptedAt: now,
        privacyVersion: PRIVACY_VERSION,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });
    }

    const sessionUser = { id: memberId, email: configured.email, name: "QA 관리자" };
    const token = await createSessionToken(sessionUser);
    const response = NextResponse.json(
      { user: { ...sessionUser, displayName: "QA 관리자", role: "admin" }, returnTo: "/mypage" },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "QA 관리자 계정을 준비하지 못했습니다." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
