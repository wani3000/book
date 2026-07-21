import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { isTestPurchaser, testPurchaserOrders } from "@/app/library/catalog";
import { getDb } from "@/db";
import { orders, refundRequests } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const member = await getAuthenticatedMember(request);
    if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (isTestPurchaser(member.email)) {
      return NextResponse.json({ orders: testPurchaserOrders() }, { headers: { "Cache-Control": "no-store" } });
    }
    const rows = await getDb().select({
      id: orders.id,
      product: orders.product,
      productTitle: orders.productTitle,
      amount: orders.amount,
      currency: orders.currency,
      status: orders.status,
      firstAccessedAt: orders.firstAccessedAt,
      createdAt: orders.createdAt,
      refundId: refundRequests.id,
      refundStatus: refundRequests.status,
      refundReasonCode: refundRequests.reasonCode,
      refundDecisionNote: refundRequests.decisionNote,
      refundRequestedAt: refundRequests.requestedAt,
    }).from(orders)
      .leftJoin(refundRequests, eq(refundRequests.orderId, orders.id))
      .where(eq(orders.memberId, member.id))
      .orderBy(desc(orders.createdAt))
      .limit(50);
    const now = Date.now();
    return NextResponse.json({
      orders: rows.map((order) => {
        const purchasedAt = new Date(order.createdAt).getTime();
        return {
          ...order,
          simpleChangeEligible: !order.firstAccessedAt && Number.isFinite(purchasedAt) && now <= purchasedAt + 7 * 24 * 60 * 60 * 1000,
          downloadUrl: order.status === "paid" ? `/api/library/${order.product}` : undefined,
        };
      }),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "구매 내역을 불러오지 못했습니다." }, { status: 500 });
  }
}
