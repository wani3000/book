import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { cancelKakaoPay, kakaoPayErrorCode } from "@/app/kakaopay/server";
import { cancelNaverPay, naverPayErrorCode } from "@/app/naverpay/server";
import { getDb } from "@/db";
import { orders, paymentAttempts } from "@/db/schema";

export async function POST(request: Request) {
  const admin = await getAuthenticatedMember(request);
  if (!admin?.isAdmin) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { orderId?: string; reason?: string };
  const orderId = body.orderId?.trim() ?? "";
  const reason = body.reason?.trim() || "고객 환불 요청";
  if (!orderId || orderId.length > 100) return NextResponse.json({ error: "주문번호를 확인해 주세요." }, { status: 400 });

  const order = await getDb().query.orders.findFirst({ where: and(eq(orders.id, orderId), eq(orders.status, "paid")) });
  if (!order) return NextResponse.json({ error: "환불 가능한 결제 완료 주문을 찾지 못했습니다." }, { status: 404 });
  if (!['kakaopay', 'naverpay'].includes(order.provider)) {
    return NextResponse.json({ error: "해당 결제수단은 외부 관리자에서 환불해 주세요." }, { status: 400 });
  }

  const now = new Date().toISOString();
  await getDb().update(orders).set({ status: "refund_processing", updatedAt: now }).where(eq(orders.id, order.id));
  try {
    let status = "refunded";
    if (order.provider === "kakaopay") {
      const cancelled = await cancelKakaoPay({ tid: order.providerReference, amount: order.amount });
      if (cancelled.tid !== order.providerReference || cancelled.canceled_amount?.total !== order.amount) {
        throw Object.assign(new Error("KakaoPay cancellation mismatch"), { code: "CANCEL_MISMATCH" });
      }
    } else {
      const cancelled = await cancelNaverPay({ paymentId: order.providerReference, amount: order.amount, reason });
      if (cancelled.pending) status = "refund_pending";
    }
    const completedAt = new Date().toISOString();
    await getDb().batch([
      getDb().update(orders).set({ status, updatedAt: completedAt }).where(eq(orders.id, order.id)),
      getDb().update(paymentAttempts).set({ status, updatedAt: completedAt }).where(and(eq(paymentAttempts.provider, order.provider), eq(paymentAttempts.providerReference, order.providerReference))),
    ]);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    const code = order.provider === "kakaopay" ? kakaoPayErrorCode(error) : naverPayErrorCode(error);
    console.error("Direct payment refund requires review", { orderId, provider: order.provider, code });
    await getDb().update(orders).set({ status: "refund_review", updatedAt: new Date().toISOString() }).where(eq(orders.id, order.id));
    return NextResponse.json({ error: "자동 환불 결과를 확인하지 못했습니다. 결제사업자 관리자에서 상태를 확인해 주세요.", status: "refund_review" }, { status: 502 });
  }
}
