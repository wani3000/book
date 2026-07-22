import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { isTestPurchaser } from "@/app/library/catalog";
import { getDb } from "@/db";
import { orders, refundRequests } from "@/db/schema";
import { deliverNotice } from "@/app/notifications/outbox";
import { enforceRateLimit, requireSameOrigin } from "@/app/security/request";

export const dynamic = "force-dynamic";

const reasonCodes = new Set(["change_of_mind", "file_issue", "description_mismatch", "service_unavailable", "other"]);
const withdrawalWindowMs = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const originError = requireSameOrigin(request);
    if (originError) return originError;
    const limited = await enforceRateLimit(request, "refund", 5, 600);
    if (limited) return limited;
    const member = await getAuthenticatedMember(request);
    if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (isTestPurchaser(member.email)) return NextResponse.json({ error: "테스트 열람 권한은 실제 결제가 아니어서 환불 대상이 아닙니다." }, { status: 400 });

    const body = await request.json().catch(() => ({})) as { orderId?: unknown; reasonCode?: unknown; reasonDetail?: unknown; policyConfirmed?: unknown };
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    const reasonCode = typeof body.reasonCode === "string" ? body.reasonCode.trim() : "";
    const reasonDetail = typeof body.reasonDetail === "string" ? body.reasonDetail.trim() : "";
    if (!orderId || orderId.length > 100 || !reasonCodes.has(reasonCode) || reasonDetail.length < 10 || reasonDetail.length > 1000 || body.policyConfirmed !== true) {
      return NextResponse.json({ error: "환불 사유와 정책 확인 항목을 다시 확인해 주세요." }, { status: 400 });
    }

    const order = await getDb().query.orders.findFirst({ where: and(eq(orders.id, orderId), eq(orders.memberId, member.id), eq(orders.status, "paid")) });
    if (!order) return NextResponse.json({ error: "환불 신청이 가능한 결제 완료 주문을 찾지 못했습니다." }, { status: 404 });
    const existing = await getDb().query.refundRequests.findFirst({ where: eq(refundRequests.orderId, order.id) });
    if (existing) return NextResponse.json({ error: "이미 접수된 환불 신청이 있습니다.", status: existing.status }, { status: 409 });

    const purchasedAt = new Date(order.createdAt).getTime();
    const simpleChangeEligible = !order.firstAccessedAt && Number.isFinite(purchasedAt) && Date.now() <= purchasedAt + withdrawalWindowMs;
    if (reasonCode === "change_of_mind" && !simpleChangeEligible) {
      return NextResponse.json({ error: "PDF 열람이 시작됐거나 구매 후 7일이 지나 단순 변심 환불이 제한됩니다. 파일 결함이나 상품 설명과 다른 문제가 있다면 해당 사유로 신청해 주세요." }, { status: 400 });
    }

    const now = new Date().toISOString();
    await getDb().insert(refundRequests).values({
      id: crypto.randomUUID(),
      orderId: order.id,
      memberId: member.id,
      reasonCode,
      reasonDetail,
      status: "requested",
      requestedAt: now,
      updatedAt: now,
    });
    await deliverNotice({ memberId: member.id, recipient: member.email, event: "refund.requested", subject: "[다니엘의 노트] 환불 신청이 접수되었습니다.", text: `${order.productTitle} 환불 신청이 접수되었습니다. 주문번호: ${order.id}\n마이페이지 주문 내역에서 처리 상태를 확인할 수 있습니다.` });
    return NextResponse.json({ ok: true, status: "requested" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "환불 신청을 접수하지 못했습니다." }, { status: 500 });
  }
}
