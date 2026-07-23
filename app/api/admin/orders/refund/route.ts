import { NextResponse } from "next/server";
import { getAuthenticatedMember, hasRecentAuthentication } from "@/app/auth/member";
import { processPaidOrderRefund, RefundProcessError } from "@/app/refunds/process";
import { notifyRefundCompleted } from "@/app/notifications/events";
import { requireSameOrigin } from "@/app/security/request";
import { getDb } from "@/db";
import { members, orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const admin = await getAuthenticatedMember(request);
  if (!admin?.isAdmin) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  if (!hasRecentAuthentication(admin)) return NextResponse.json({ error: "민감한 관리 작업을 계속하려면 다시 로그인해 주세요.", code: "admin_reauthentication_required", reauthenticateUrl: "/mypage?reauth=admin" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { orderId?: string; reason?: string };
  const orderId = body.orderId?.trim() ?? "";
  const reason = body.reason?.trim() || "고객 환불 요청";
  if (!orderId || orderId.length > 100) return NextResponse.json({ error: "주문번호를 확인해 주세요." }, { status: 400 });

  try {
    const result = await processPaidOrderRefund(orderId, reason);
    if (result.status === "refunded") {
      const order = await getDb().query.orders.findFirst({ where: eq(orders.id, orderId) });
      const customer = order ? await getDb().query.members.findFirst({ where: eq(members.id, order.memberId) }) : null;
      if (order && customer) await notifyRefundCompleted(customer, { orderId: order.id, title: order.productTitle });
    }
    return NextResponse.json({ ok: true, status: result.status });
  } catch (error) {
    const message = error instanceof RefundProcessError ? error.message : "환불 처리 결과를 확인하지 못했습니다.";
    const status = error instanceof RefundProcessError ? error.orderStatus : undefined;
    return NextResponse.json({ error: message, status }, { status: error instanceof RefundProcessError && error.code === "ORDER_NOT_REFUNDABLE" ? 404 : 502 });
  }
}
