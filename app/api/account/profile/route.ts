import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember, publicMember } from "@/app/auth/member";
import { SESSION_COOKIE } from "@/app/auth/session";
import { getDb } from "@/db";
import { members, orders, reviews } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const member = await getAuthenticatedMember(request);
    if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const [[orderCount], [reviewCount]] = await Promise.all([
      getDb().select({ value: count() }).from(orders).where(and(eq(orders.memberId, member.id), eq(orders.status, "paid"))),
      getDb().select({ value: count() }).from(reviews).where(eq(reviews.memberId, member.id)),
    ]);
    return NextResponse.json({
      member: publicMember(member),
      stats: { orders: orderCount?.value ?? 0, reviews: reviewCount?.value ?? 0 },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "회원 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
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
    const member = await getAuthenticatedMember(request);
    if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const now = new Date().toISOString();
    await getDb().update(members).set({
      email: `deleted-${member.id}@invalid.local`,
      name: "탈퇴 회원",
      displayName: "탈퇴 회원",
      picture: null,
      status: "deleted",
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
