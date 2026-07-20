import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { getDb } from "@/db";
import { reviews } from "@/db/schema";

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
    if (!await requireAdmin(request)) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    const body = await request.json() as { reviewId?: unknown; action?: unknown };
    const reviewId = Number(body.reviewId);
    const action = typeof body.action === "string" ? body.action : "";
    if (!Number.isInteger(reviewId) || reviewId < 1 || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "처리할 후기 정보가 올바르지 않습니다." }, { status: 400 });
    }
    await getDb().update(reviews).set({
      status: action === "approve" ? "approved" : "rejected",
      purchaseVerified: action === "approve" ? 1 : 0,
    }).where(eq(reviews.id, reviewId));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "후기를 처리하지 못했습니다." }, { status: 500 });
  }
}
