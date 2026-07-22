import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember, hasRecentAuthentication } from "@/app/auth/member";
import { getDb } from "@/db";
import { auditLogs, reviews } from "@/db/schema";
import { requireSameOrigin } from "@/app/security/request";

export const dynamic = "force-dynamic";

async function requireAdmin(request: Request) {
  const member = await getAuthenticatedMember(request);
  return member?.isAdmin ? member : null;
}

export async function GET(request: Request) {
  try {
    if (!await requireAdmin(request)) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    const rows = await getDb().select().from(reviews).orderBy(desc(reviews.createdAt), desc(reviews.id)).limit(200);
    return NextResponse.json({ reviews: rows });
  } catch {
    return NextResponse.json({ error: "후기 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const originError = requireSameOrigin(request);
    if (originError) return originError;
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    if (!hasRecentAuthentication(admin)) return NextResponse.json({ error: "민감한 관리 작업을 계속하려면 다시 로그인해 주세요.", code: "admin_reauthentication_required", reauthenticateUrl: "/mypage?reauth=admin" }, { status: 401 });
    const body = await request.json() as { reviewId?: unknown; action?: unknown; reason?: unknown };
    const reviewId = Number(body.reviewId);
    const action = typeof body.action === "string" ? body.action : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!Number.isInteger(reviewId) || reviewId < 1 || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "처리할 후기 정보가 올바르지 않습니다." }, { status: 400 });
    }
    if (action === "reject" && (reason.length < 2 || reason.length > 300)) {
      return NextResponse.json({ error: "비공개 사유를 2~300자로 입력해 주세요." }, { status: 400 });
    }
    const now = new Date().toISOString();
    await getDb().update(reviews).set({
      status: action === "approve" ? "approved" : "rejected",
      purchaseVerified: 1,
      moderationReason: action === "approve" ? null : reason,
      reviewedBy: admin.id,
      reviewedAt: now,
      updatedAt: now,
    }).where(eq(reviews.id, reviewId));
    await getDb().insert(auditLogs).values({
      id: crypto.randomUUID(), actorMemberId: admin.id, action: `review.${action}`,
      entityType: "review", entityId: String(reviewId), detail: reason || null, createdAt: now,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "후기를 처리하지 못했습니다." }, { status: 500 });
  }
}
