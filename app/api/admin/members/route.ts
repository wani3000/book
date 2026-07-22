import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember, hasRecentAuthentication } from "@/app/auth/member";
import { getDb } from "@/db";
import { auditLogs, members } from "@/db/schema";
import { requireSameOrigin } from "@/app/security/request";

export const dynamic = "force-dynamic";

async function requireAdmin(request: Request) {
  const member = await getAuthenticatedMember(request);
  return member?.isAdmin ? member : null;
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    const rows = await getDb().select({
      id: members.id,
      email: members.email,
      name: members.name,
      displayName: members.displayName,
      picture: members.picture,
      role: members.role,
      status: members.status,
      marketingConsent: members.marketingConsent,
      createdAt: members.createdAt,
      lastLoginAt: members.lastLoginAt,
    }).from(members).orderBy(desc(members.createdAt)).limit(200);
    return NextResponse.json({ members: rows });
  } catch {
    return NextResponse.json({ error: "회원 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const originError = requireSameOrigin(request);
    if (originError) return originError;
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    if (!hasRecentAuthentication(admin)) return NextResponse.json({ error: "민감한 관리 작업을 계속하려면 다시 로그인해 주세요.", code: "admin_reauthentication_required", reauthenticateUrl: "/mypage?reauth=admin" }, { status: 401 });
    const body = await request.json() as { memberId?: unknown; status?: unknown; role?: unknown };
    const memberId = typeof body.memberId === "string" ? body.memberId : "";
    const status = typeof body.status === "string" ? body.status : "";
    const role = typeof body.role === "string" ? body.role : "";
    if (!memberId || !["active", "suspended"].includes(status) || !["member", "admin"].includes(role)) {
      return NextResponse.json({ error: "변경할 회원 정보가 올바르지 않습니다." }, { status: 400 });
    }
    if (memberId === admin.id && (status !== "active" || role !== "admin")) {
      return NextResponse.json({ error: "현재 로그인한 관리자 자신의 권한은 낮출 수 없습니다." }, { status: 400 });
    }
    const now = new Date().toISOString();
    await getDb().batch([
      getDb().update(members).set({ status, role, updatedAt: now }).where(eq(members.id, memberId)),
      getDb().insert(auditLogs).values({ id: crypto.randomUUID(), actorMemberId: admin.id, action: "member.update", entityType: "member", entityId: memberId, detail: JSON.stringify({ status, role }), createdAt: now }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "회원 상태를 변경하지 못했습니다." }, { status: 500 });
  }
}
