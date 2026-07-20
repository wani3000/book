import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { ebookCatalog, isEbookProduct } from "@/app/library/catalog";
import { approveNaverPay, naverPayErrorCode } from "@/app/naverpay/server";
import { getDb } from "@/db";
import { orders, paymentAttempts } from "@/db/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const orderId = url.searchParams.get("orderId") ?? "";
  const resultCode = url.searchParams.get("resultCode") ?? "";
  const paymentId = url.searchParams.get("paymentId") ?? "";
  const member = await getAuthenticatedMember(request);
  if (!member) return NextResponse.redirect(`${origin}/mypage?payment=login-required`);
  if (!orderId) return NextResponse.redirect(`${origin}/checkout/fail?reason=invalid`);

  const attempt = await getDb().query.paymentAttempts.findFirst({
    where: and(eq(paymentAttempts.id, orderId), eq(paymentAttempts.memberId, member.id), eq(paymentAttempts.provider, "naverpay")),
  });
  if (!attempt || !isEbookProduct(attempt.product)) return NextResponse.redirect(`${origin}/checkout/fail?reason=unknown`);
  if (attempt.status === "paid") return NextResponse.redirect(`${origin}/checkout/success?orderId=${encodeURIComponent(orderId)}`);
  if (attempt.status !== "ready") return NextResponse.redirect(`${origin}/checkout/fail?reason=closed`);
  if (resultCode !== "Success" || !paymentId || paymentId.length > 80) {
    await getDb().update(paymentAttempts).set({ status: resultCode === "Fail" ? "cancelled" : "failed", errorCode: resultCode.slice(0, 80) || "INVALID_RESULT", updatedAt: new Date().toISOString() }).where(eq(paymentAttempts.id, orderId));
    return NextResponse.redirect(`${origin}/checkout/fail?reason=${resultCode === "Fail" ? "cancel" : "provider"}`);
  }

  await getDb().update(paymentAttempts).set({ status: "approving", providerReference: paymentId, updatedAt: new Date().toISOString() }).where(eq(paymentAttempts.id, orderId));
  try {
    const approved = await approveNaverPay(paymentId);
    const book = ebookCatalog[attempt.product];
    const detail = approved.body?.detail;
    if (approved.body?.paymentId !== paymentId || detail?.totalPayAmount !== book.amount || (detail.merchantPayKey && detail.merchantPayKey !== orderId)) {
      throw Object.assign(new Error("NaverPay approved order mismatch"), { code: "ORDER_MISMATCH" });
    }
    const now = new Date().toISOString();
    await getDb().batch([
      getDb().insert(orders).values({
        id: orderId,
        memberId: member.id,
        product: book.product,
        productTitle: book.title,
        amount: book.amount,
        provider: "naverpay",
        providerReference: paymentId,
        createdAt: now,
        updatedAt: now,
      }),
      getDb().update(paymentAttempts).set({ status: "paid", updatedAt: now }).where(eq(paymentAttempts.id, orderId)),
    ]);
    return NextResponse.redirect(`${origin}/checkout/success?orderId=${encodeURIComponent(orderId)}`);
  } catch (error) {
    const code = naverPayErrorCode(error);
    console.error("NaverPay approval failed", { code, orderId });
    const status = code === "TIMEOUT_RECONCILE_REQUIRED" ? "reconcile" : "failed";
    await getDb().update(paymentAttempts).set({ status, errorCode: code, updatedAt: new Date().toISOString() }).where(eq(paymentAttempts.id, orderId));
    return NextResponse.redirect(`${origin}/checkout/fail?reason=approve`);
  }
}
