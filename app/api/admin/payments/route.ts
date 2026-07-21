import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { ebookCatalog, isEbookProduct } from "@/app/library/catalog";
import { getKakaoPayOrder } from "@/app/kakaopay/server";
import { getNaverPayHistory } from "@/app/naverpay/server";
import { getDb } from "@/db";
import { members, orders, paymentAttempts } from "@/db/schema";

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
  if (!await requireAdmin(request)) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
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
      ]);
      return NextResponse.json({ ok: true, status: "refunded" });
    }
    if (!paid) {
      await getDb().update(paymentAttempts).set({ status: "reconcile", errorCode: "REMOTE_PAYMENT_NOT_FINAL", updatedAt: now }).where(eq(paymentAttempts.id, attempt.id));
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
    ]);
    return NextResponse.json({ ok: true, status: "paid" });
  } catch {
    await getDb().update(paymentAttempts).set({ status: "reconcile", errorCode: "RECONCILE_LOOKUP_FAILED", updatedAt: new Date().toISOString() }).where(eq(paymentAttempts.id, attempt.id));
    return NextResponse.json({ error: "결제사업자 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }
}
