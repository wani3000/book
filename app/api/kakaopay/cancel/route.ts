import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { getDb } from "@/db";
import { paymentAttempts } from "@/db/schema";
import { ebookCatalog, isEbookProduct } from "@/app/library/catalog";
import { notifyPaymentCancelled } from "@/app/notifications/events";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId") ?? "";
  const member = await getAuthenticatedMember(request);
  if (member && orderId) {
    const attempt = await getDb().query.paymentAttempts.findFirst({ where: and(eq(paymentAttempts.id, orderId), eq(paymentAttempts.memberId, member.id)) });
    await getDb().update(paymentAttempts).set({ status: "cancelled", updatedAt: new Date().toISOString() }).where(and(eq(paymentAttempts.id, orderId), eq(paymentAttempts.memberId, member.id), eq(paymentAttempts.status, "ready")));
    if (attempt?.status === "ready" && isEbookProduct(attempt.product)) await notifyPaymentCancelled(member, { orderId, title: ebookCatalog[attempt.product].title });
  }
  return NextResponse.redirect(`${url.origin}/checkout/fail?reason=cancel`);
}
