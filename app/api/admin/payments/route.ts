import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember, hasRecentAuthentication } from "@/app/auth/member";
import { ebookCatalog, isEbookProduct } from "@/app/library/catalog";
import { getKakaoPayOrder } from "@/app/kakaopay/server";
import { getNaverPayHistory } from "@/app/naverpay/server";
import { getDb } from "@/db";
import { auditLogs, members, orders, paymentAttempts } from "@/db/schema";
import { requireSameOrigin } from "@/app/security/request";
import { deliverNotice } from "@/app/notifications/outbox";

export const dynamic = "force-dynamic";

async function requireAdmin(request: Request) {
  const member = await getAuthenticatedMember(request);
  return member?.isAdmin ? member : null;
}

export async function GET(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  try {
    const attempts = await getDb().select({
      id: paymentAttempts.id,
      memberId: paymentAttempts.memberId,
      memberName: members.displayName,
      memberEmail: members.email,
      product: paymentAttempts.product,
      amount: paymentAttempts.amount,
      provider: paymentAttempts.provider,
      providerReference: paymentAttempts.providerReference,
      status: paymentAttempts.status,
      errorCode: paymentAttempts.errorCode,
      createdAt: paymentAttempts.createdAt,
      updatedAt: paymentAttempts.updatedAt,
    }).from(paymentAttempts).innerJoin(members, eq(paymentAttempts.memberId, members.id)).orderBy(desc(paymentAttempts.createdAt)).limit(200);
    return NextResponse.json({ attempts });
  } catch {
    return NextResponse.json({ error: "결제 시도 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  if (!hasRecentAuthentication(admin)) return NextResponse.json({ error: "민감한 관리 작업을 계속하려면 다시 로그인해 주세요.", code: "admin_reauthentication_required", reauthenticateUrl: "/mypage?reauth=admin" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { attemptId?: unknown };
  const attemptId = typeof body.attemptId === "string" ? body.attemptId.trim() : "";
  if (!attemptId || attemptId.length > 100) return NextResponse.json({ error: "확인할 결제 시도가 올바르지 않습니다." }, { status: 400 });

  const attempt = await getDb().query.paymentAttempts.findFirst({ where: eq(paymentAttempts.id, attemptId) });
  if (!attempt || !isEbookProduct(attempt.product)) return NextResponse.json({ error: "결제 시도를 찾지 못했습니다." }, { status: 404 });
  if (!["kakaopay", "naverpay"].includes(attempt.provider) || attempt.providerReference.startsWith("pending:")) {
    return NextResponse.json({ error: "결제사업자 거래번호가 없어 자동 확인할 수 없습니다." }, { status: 409 });
  }

  try {
    let paid = false;
    let cancelled = false;
    if (attempt.provider === "kakaopay") {
      const remote = await getKakaoPayOrder(attempt.providerReference);
      paid = remote.tid === attempt.providerReference && remote.status === "SUCCESS_PAYMENT" && remote.partner_order_id === attempt.id && remote.partner_user_id === attempt.memberId && remote.amount?.total === attempt.amount;
      cancelled = remote.tid === attempt.providerReference && remote.status === "CANCEL_PAYMENT";
    } else {
      const history = await getNaverPayHistory(attempt.providerReference);
      paid = history.some((item) => item.paymentId === attempt.providerReference && item.admissionState === "SUCCESS" && item.admissionTypeCode === "01" && item.totalPayAmount === attempt.amount && item.merchantPayKey === attempt.id && item.merchantUserKey === attempt.memberId);
      cancelled = history.some((item) => item.paymentId === attempt.providerReference && item.admissionState === "SUCCESS" && item.admissionTypeCode === "03" && item.totalPayAmount === attempt.amount && item.merchantPayKey === attempt.id && item.merchantUserKey === attempt.memberId);
    }

    const now = new Date().toISOString();
    if (cancelled) {
      await getDb().batch([
        getDb().update(paymentAttempts).set({ status: "refunded", errorCode: null, updatedAt: now }).where(eq(paymentAttempts.id, attempt.id)),
        getDb().update(orders).set({ status: "refunded", updatedAt: now }).where(eq(orders.id, attempt.id)),
        getDb().insert(auditLogs).values({ id: crypto.randomUUID(), actorMemberId: admin.id, action: "payment.reconcile.refunded", entityType: "payment_attempt", entityId: attempt.id, createdAt: now }),
      ]);
      const customer = await getDb().query.members.findFirst({ where: eq(members.id, attempt.memberId) });
      if (customer) await deliverNotice({ memberId: customer.id, recipient: customer.email, event: "refund.completed", subject: "[다니엘의 노트] 환불이 완료되었습니다.", text: `${ebookCatalog[attempt.product].title} 환불이 완료되었습니다. 주문번호: ${attempt.id}\n환불 완료와 함께 전자책 열람 권한이 종료되었습니다.` });
      return NextResponse.json({ ok: true, status: "refunded" });
    }
    if (!paid) {
      await getDb().update(paymentAttempts).set({ status: "reconcile", errorCode: "REMOTE_PAYMENT_NOT_FINAL", updatedAt: now }).where(eq(paymentAttempts.id, attempt.id));
      await getDb().insert(auditLogs).values({ id: crypto.randomUUID(), actorMemberId: admin.id, action: "payment.reconcile.pending", entityType: "payment_attempt", entityId: attempt.id, createdAt: now });
      return NextResponse.json({ ok: true, status: "reconcile", message: "결제사업자에서 최종 승인 또는 취소 상태가 확인되지 않았습니다." });
    }

    const book = ebookCatalog[attempt.product];
    await getDb().batch([
      getDb().insert(orders).values({
        id: attempt.id,
        memberId: attempt.memberId,
        product: book.product,
        productTitle: book.title,
        amount: book.amount,
        provider: attempt.provider,
        providerReference: attempt.providerReference,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing(),
      getDb().update(paymentAttempts).set({ status: "paid", errorCode: null, updatedAt: now }).where(eq(paymentAttempts.id, attempt.id)),
      getDb().insert(auditLogs).values({ id: crypto.randomUUID(), actorMemberId: admin.id, action: "payment.reconcile.paid", entityType: "payment_attempt", entityId: attempt.id, createdAt: now }),
    ]);
    const customer = await getDb().query.members.findFirst({ where: eq(members.id, attempt.memberId) });
    if (customer) await deliverNotice({ memberId: customer.id, recipient: customer.email, event: "payment.completed", subject: "[다니엘의 노트] 결제가 확인되었습니다.", text: `${book.title} 결제가 확인되어 열람 권한이 복구되었습니다. 주문번호: ${attempt.id}\n마이페이지 내 서재에서 전자책을 읽을 수 있습니다.` });
    return NextResponse.json({ ok: true, status: "paid" });
  } catch {
    await getDb().update(paymentAttempts).set({ status: "reconcile", errorCode: "RECONCILE_LOOKUP_FAILED", updatedAt: new Date().toISOString() }).where(eq(paymentAttempts.id, attempt.id));
    return NextResponse.json({ error: "결제사업자 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }
}
