import { and, eq } from "drizzle-orm";
import { cancelKakaoPay, kakaoPayErrorCode } from "@/app/kakaopay/server";
import { cancelNaverPay, naverPayErrorCode } from "@/app/naverpay/server";
import { getDb } from "@/db";
import { orders, paymentAttempts } from "@/db/schema";

export type RefundOrderStatus = "refunded" | "refund_pending";

export class RefundProcessError extends Error {
  constructor(message: string, public readonly code: string, public readonly orderStatus?: string) {
    super(message);
  }
}

export async function processPaidOrderRefund(orderId: string, reason: string): Promise<{ status: RefundOrderStatus }> {
  const order = await getDb().query.orders.findFirst({ where: and(eq(orders.id, orderId), eq(orders.status, "paid")) });
  if (!order) throw new RefundProcessError("환불 가능한 결제 완료 주문을 찾지 못했습니다.", "ORDER_NOT_REFUNDABLE");
  if (!["kakaopay", "naverpay"].includes(order.provider)) {
    throw new RefundProcessError("해당 결제수단은 외부 결제 관리자에서 환불한 뒤 상태를 확인해 주세요.", "UNSUPPORTED_PROVIDER");
  }

  await getDb().update(orders).set({ status: "refund_processing", updatedAt: new Date().toISOString() }).where(eq(orders.id, order.id));
  try {
    let status: RefundOrderStatus = "refunded";
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
    return { status };
  } catch (error) {
    const code = order.provider === "kakaopay" ? kakaoPayErrorCode(error) : naverPayErrorCode(error);
    console.error("Direct payment refund requires review", { orderId, provider: order.provider, code });
    await getDb().update(orders).set({ status: "refund_review", updatedAt: new Date().toISOString() }).where(eq(orders.id, order.id));
    throw new RefundProcessError("자동 환불 결과를 확인하지 못했습니다. 결제사업자 관리자에서 상태를 확인해 주세요.", code, "refund_review");
  }
}
