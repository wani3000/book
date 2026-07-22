import { and, count, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember, publicMember } from "@/app/auth/member";
import { isTestPurchaser } from "@/app/library/catalog";
import { SESSION_COOKIE } from "@/app/auth/session";
import { getDb } from "@/db";
import { authIdentities, members, orders, refundRequests, reviews } from "@/db/schema";
import { ACCOUNT_DELETE_CONFIRMATION } from "@/app/account/policy";
import { unlinkKakaoUser } from "@/app/auth/kakao";
import { requireSameOrigin } from "@/app/security/request";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const member = await getAuthenticatedMember(request);
    if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const [[orderCount], [reviewCount], identities] = await Promise.all([
      getDb().select({ value: count() }).from(orders).where(and(eq(orders.memberId, member.id), eq(orders.status, "paid"))),
      getDb().select({ value: count() }).from(reviews).where(eq(reviews.memberId, member.id)),
      getDb().select({ provider: authIdentities.provider }).from(authIdentities).where(eq(authIdentities.memberId, member.id)),
    ]);
    return NextResponse.json({
      member: { ...publicMember(member), linkedProviders: identities.map((identity) => identity.provider) },
      stats: { orders: isTestPurchaser(member.email) ? 3 : orderCount?.value ?? 0, reviews: reviewCount?.value ?? 0 },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "회원 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const originError = requireSameOrigin(request);
    if (originError) return originError;
    const member = await getAuthenticatedMember(request);
    if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const body = await request.json() as { displayName?: unknown; marketingConsent?: unknown };
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    if (displayName.length < 2 || displayName.length > 30) {
      return NextResponse.json({ error: "표시 이름은 2~30자로 입력해 주세요." }, { status: 400 });
    }
    const marketingConsent = body.marketingConsent === true ? 1 : 0;
    await getDb().update(members).set({ displayName, marketingConsent, updatedAt: new Date().toISOString() }).where(eq(members.id, member.id));
    return NextResponse.json({ ok: true, displayName, marketingConsent: marketingConsent === 1 });
  } catch {
    return NextResponse.json({ error: "회원 정보를 저장하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const originError = requireSameOrigin(request);
    if (originError) return originError;
    const member = await getAuthenticatedMember(request);
    if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const body = await request.json().catch(() => ({})) as { confirmation?: unknown; acknowledged?: unknown };
    if (body.confirmation !== ACCOUNT_DELETE_CONFIRMATION || body.acknowledged !== true) {
      return NextResponse.json({ error: `확인란에 '${ACCOUNT_DELETE_CONFIRMATION}'를 정확히 입력하고 안내를 확인해 주세요.` }, { status: 400 });
    }
    const pendingRefund = await getDb().query.refundRequests.findFirst({
      where: and(eq(refundRequests.memberId, member.id), inArray(refundRequests.status, ["requested", "reviewing"])),
    });
    if (pendingRefund) {
      return NextResponse.json({ error: "처리 중인 환불 신청이 있어 지금은 탈퇴할 수 없습니다. 환불 결과를 확인한 뒤 다시 시도해 주세요." }, { status: 409 });
    }
    const kakaoIdentity = await getDb().query.authIdentities.findFirst({
      where: and(eq(authIdentities.memberId, member.id), eq(authIdentities.provider, "kakao")),
    });
    if (kakaoIdentity) {
      try {
        await unlinkKakaoUser(kakaoIdentity.providerSubject);
      } catch {
        return NextResponse.json({ error: "카카오 계정 연결을 해제하지 못해 탈퇴를 중단했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
      }
    }
    const now = new Date().toISOString();
    await getDb().update(members).set({
      email: `deleted-${member.id}@invalid.local`,
      name: "탈퇴 회원",
      displayName: "탈퇴 회원",
      picture: null,
      status: "deleted",
      role: "member",
      deletedAt: now,
      updatedAt: now,
      marketingConsent: 0,
    }).where(eq(members.id, member.id));
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "회원 탈퇴를 처리하지 못했습니다." }, { status: 500 });
  }
}
