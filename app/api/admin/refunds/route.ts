import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { processPaidOrderRefund, reconcileRefundOrder, RefundProcessError } from "@/app/refunds/process";
import { getDb } from "@/db";
import { members, orders, refundRequests } from "@/db/schema";

export const dynamic = "force-dynamic";

async function requireAdmin(request: Request) {
  const member = await getAuthenticatedMember(request);
  return member?.isAdmin ? member : null;
}

export async function GET(request: Request) {
  try {
    if (!await requireAdmin(request)) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    const rows = await getDb().select({
      id: refundRequests.id,
      orderId: refundRequests.orderId,
      memberId: refundRequests.memberId,
      memberName: members.displayName,
      memberEmail: members.email,
      productTitle: orders.productTitle,
      amount: orders.amount,
      provider: orders.provider,
      orderStatus: orders.status,
      firstAccessedAt: orders.firstAccessedAt,
      orderCreatedAt: orders.createdAt,
      reasonCode: refundRequests.reasonCode,
      reasonDetail: refundRequests.reasonDetail,
      status: refundRequests.status,
      decisionNote: refundRequests.decisionNote,
      requestedAt: refundRequests.requestedAt,
      reviewedAt: refundRequests.reviewedAt,
    }).from(refundRequests)
      .innerJoin(orders, eq(refundRequests.orderId, orders.id))
      .innerJoin(members, eq(refundRequests.memberId, members.id))
      .orderBy(desc(refundRequests.requestedAt))
      .limit(200);
    return NextResponse.json({ refunds: rows });
  } catch {
    return NextResponse.json({ error: "환불 신청 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { refundId?: unknown; action?: unknown; decisionNote?: unknown };
  const refundId = typeof body.refundId === "string" ? body.refundId.trim() : "";
  const action = typeof body.action === "string" ? body.action : "";
  const decisionNote = typeof body.decisionNote === "string" ? body.decisionNote.trim() : "";
  if (!refundId || refundId.length > 100 || !["review", "approve", "reject", "reconcile"].includes(action)) {
    return NextResponse.json({ error: "처리할 환불 신청 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const refund = await getDb().query.refundRequests.findFirst({ where: eq(refundRequests.id, refundId) });
  if (!refund) return NextResponse.json({ error: "환불 신청을 찾지 못했습니다." }, { status: 404 });
  if (["refunded", "rejected"].includes(refund.status)) return NextResponse.json({ error: "이미 처리가 끝난 환불 신청입니다." }, { status: 409 });

  const now = new Date().toISOString();
  if (action === "review") {
    await getDb().update(refundRequests).set({ status: "reviewing", reviewedBy: admin.id, reviewedAt: now, updatedAt: now }).where(eq(refundRequests.id, refund.id));
    return NextResponse.json({ ok: true, status: "reviewing" });
  }
  if (action === "reject") {
    if (decisionNote.length < 5 || decisionNote.length > 500) return NextResponse.json({ error: "환불 불가 사유를 5자 이상 500자 이하로 입력해 주세요." }, { status: 400 });
    await getDb().update(refundRequests).set({ status: "rejected", decisionNote, reviewedBy: admin.id, reviewedAt: now, updatedAt: now }).where(eq(refundRequests.id, refund.id));
    return NextResponse.json({ ok: true, status: "rejected" });
  }
  if (action === "reconcile") {
    try {
      const result = await reconcileRefundOrder(refund.orderId);
      const nextStatus = result.status === "refunded" ? "refunded" : "reviewing";
      await getDb().update(refundRequests).set({ status: nextStatus, decisionNote: result.status === "refunded" ? "결제사업자 취소 완료 상태를 확인했습니다." : "결제사업자에서 아직 최종 취소 상태가 확인되지 않았습니다.", reviewedBy: admin.id, reviewedAt: now, updatedAt: now }).where(eq(refundRequests.id, refund.id));
      return NextResponse.json({ ok: true, status: nextStatus, orderStatus: result.status });
    } catch (error) {
      const message = error instanceof RefundProcessError ? error.message : "결제사업자 상태를 확인하지 못했습니다.";
      return NextResponse.json({ error: message, status: "reviewing" }, { status: 502 });
    }
  }

  await getDb().update(refundRequests).set({ status: "reviewing", decisionNote: decisionNote || null, reviewedBy: admin.id, reviewedAt: now, updatedAt: now }).where(eq(refundRequests.id, refund.id));
  try {
    const result = await processPaidOrderRefund(refund.orderId, refund.reasonDetail);
    const nextStatus = result.status === "refunded" ? "refunded" : "reviewing";
    await getDb().update(refundRequests).set({ status: nextStatus, reviewedBy: admin.id, reviewedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(refundRequests.id, refund.id));
    return NextResponse.json({ ok: true, status: nextStatus, orderStatus: result.status });
  } catch (error) {
    const message = error instanceof RefundProcessError ? error.message : "환불 처리 결과를 확인하지 못했습니다.";
    await getDb().update(refundRequests).set({ status: "reviewing", decisionNote: message, reviewedBy: admin.id, reviewedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(refundRequests.id, refund.id));
    return NextResponse.json({ error: message, status: "reviewing" }, { status: error instanceof RefundProcessError && error.code === "ORDER_NOT_REFUNDABLE" ? 409 : 502 });
  }
}
