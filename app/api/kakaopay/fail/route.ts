import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { getDb } from "@/db";
import { paymentAttempts } from "@/db/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId") ?? "";
  const member = await getAuthenticatedMember(request);
  if (member && orderId) {
    await getDb().update(paymentAttempts).set({ status: "failed", updatedAt: new Date().toISOString() }).where(and(eq(paymentAttempts.id, orderId), eq(paymentAttempts.memberId, member.id), eq(paymentAttempts.status, "ready")));
  }
  return NextResponse.redirect(`${url.origin}/checkout/fail?reason=provider`);
}
