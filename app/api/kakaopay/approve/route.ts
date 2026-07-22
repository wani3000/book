import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { ebookCatalog, isEbookProduct } from "@/app/library/catalog";
import { approveKakaoPay, kakaoPayErrorCode } from "@/app/kakaopay/server";
import { getDb } from "@/db";
import { orders, paymentAttempts } from "@/db/schema";
import { deliverNotice } from "@/app/notifications/outbox";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId") ?? "";
  const pgToken = url.searchParams.get("pg_token") ?? "";
  const member = await getAuthenticatedMember(request);
  const origin = url.origin;
  if (!member) return NextResponse.redirect(`${origin}/mypage?payment=login-required`);
  if (!orderId || !pgToken) return NextResponse.redirect(`${origin}/checkout/fail?reason=invalid`);

  const attempt = await getDb().query.paymentAttempts.findFirst({
    where: and(eq(paymentAttempts.id, orderId), eq(paymentAttempts.memberId, member.id)),
  });
  if (!attempt || !isEbookProduct(attempt.product)) return NextResponse.redirect(`${origin}/checkout/fail?reason=unknown`);
  if (attempt.status === "paid") return NextResponse.redirect(`${origin}/checkout/success?orderId=${encodeURIComponent(orderId)}`);
  if (attempt.status !== "ready") return NextResponse.redirect(`${origin}/checkout/fail?reason=closed`);

  await getDb().update(paymentAttempts).set({ status: "approving", updatedAt: new Date().toISOString() }).where(eq(paymentAttempts.id, orderId));
  try {
    const approved = await approveKakaoPay({
      tid: attempt.providerReference,
      orderId,
      memberId: member.id,
      pgToken,
    });
    const book = ebookCatalog[attempt.product];
    if (approved.tid !== attempt.providerReference || approved.amount?.total !== book.amount) {
      throw Object.assign(new Error("KakaoPay approved amount mismatch"), { code: "AMOUNT_MISMATCH" });
    }
    const now = new Date().toISOString();
    await getDb().batch([
      getDb().insert(orders).values({
        id: orderId,
        memberId: member.id,
        product: book.product,
        productTitle: book.title,
        amount: book.amount,
        provider: "kakaopay",
        providerReference: attempt.providerReference,
        createdAt: now,
        updatedAt: now,
      }),
      getDb().update(paymentAttempts).set({ status: "paid", updatedAt: now }).where(eq(paymentAttempts.id, orderId)),
    ]);
    await deliverNotice({ memberId: member.id, recipient: member.email, event: "payment.completed", subject: "[다니엘의 노트] 결제가 완료되었습니다.", text: `${book.title} 결제가 완료되었습니다. 주문번호: ${orderId}\n마이페이지 내 서재에서 전자책을 읽을 수 있습니다.` });
    return NextResponse.redirect(`${origin}/checkout/success?orderId=${encodeURIComponent(orderId)}`);
  } catch (error) {
    const code = kakaoPayErrorCode(error);
    console.error("KakaoPay approve failed", { code, orderId });
    await getDb().update(paymentAttempts).set({ status: "failed", errorCode: code, updatedAt: new Date().toISOString() }).where(eq(paymentAttempts.id, orderId));
    return NextResponse.redirect(`${origin}/checkout/fail?reason=approve`);
  }
}
