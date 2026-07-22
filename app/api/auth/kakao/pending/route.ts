import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isConfiguredAdmin } from "@/app/auth/member";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/app/account/policy";
import { KAKAO_PENDING_COOKIE, readKakaoPendingToken } from "@/app/auth/kakao";
import { cookieValue, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/app/auth/session";
import { getDb } from "@/db";
import { authIdentities, members } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const pending = await readKakaoPendingToken(cookieValue(request, KAKAO_PENDING_COOKIE));
  return NextResponse.json(
    pending ? { pending: true, flow: pending.flow, emailAvailable: !pending.email.endsWith("@daniels-note.kakao.local") } : { pending: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const pending = await readKakaoPendingToken(cookieValue(request, KAKAO_PENDING_COOKIE));
  if (!pending) return NextResponse.json({ error: "카카오 로그인 시간이 만료되었습니다. 다시 시도해 주세요." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { termsAccepted?: unknown; privacyAccepted?: unknown; marketingConsent?: unknown };
  if (body.termsAccepted !== true || body.privacyAccepted !== true) {
    return NextResponse.json({ error: "회원가입에 필요한 필수 약관에 동의해 주세요." }, { status: 400 });
  }

  try {
    const now = new Date().toISOString();
    const marketingConsent = !pending.email.endsWith("@daniels-note.kakao.local") && body.marketingConsent === true ? 1 : 0;
    let memberId = pending.memberId;
    let existing = memberId ? await getDb().query.members.findFirst({ where: eq(members.id, memberId) }) : null;
    if (pending.flow === "reactivate" && (!existing || existing.status !== "deleted")) {
      return NextResponse.json({ error: "재가입할 계정 상태를 확인할 수 없습니다." }, { status: 409 });
    }
    if (!memberId) memberId = crypto.randomUUID();

    if (existing) {
      await getDb().update(members).set({
        email: pending.email,
        name: pending.name,
        displayName: pending.name,
        picture: pending.picture,
        role: isConfiguredAdmin(pending.email) ? "admin" : "member",
        status: "active",
        marketingConsent,
        termsAcceptedAt: now,
        termsVersion: TERMS_VERSION,
        privacyAcceptedAt: now,
        privacyVersion: PRIVACY_VERSION,
        reactivatedAt: now,
        deletedAt: null,
        updatedAt: now,
        lastLoginAt: now,
      }).where(eq(members.id, memberId));
    } else {
      await getDb().insert(members).values({
        id: memberId,
        email: pending.email,
        name: pending.name,
        displayName: pending.name,
        picture: pending.picture,
        role: isConfiguredAdmin(pending.email) ? "admin" : "member",
        status: "active",
        marketingConsent,
        termsAcceptedAt: now,
        termsVersion: TERMS_VERSION,
        privacyAcceptedAt: now,
        privacyVersion: PRIVACY_VERSION,
        updatedAt: now,
        lastLoginAt: now,
      });
      existing = await getDb().query.members.findFirst({ where: eq(members.id, memberId) });
    }

    await getDb().insert(authIdentities).values({
      id: crypto.randomUUID(),
      memberId,
      provider: "kakao",
      providerSubject: pending.providerSubject,
      providerEmail: pending.email,
      lastLoginAt: now,
    }).onConflictDoUpdate({
      target: [authIdentities.provider, authIdentities.providerSubject],
      set: { memberId, providerEmail: pending.email, lastLoginAt: now },
    });

    const sessionUser = { id: memberId, email: pending.email, name: pending.name, picture: pending.picture };
    const token = await createSessionToken(sessionUser);
    const response = NextResponse.json({ user: { ...sessionUser, displayName: pending.name }, returnTo: pending.returnTo });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    response.cookies.set(KAKAO_PENDING_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ error: "카카오 회원가입을 완료하지 못했습니다." }, { status: 500 });
  }
}
