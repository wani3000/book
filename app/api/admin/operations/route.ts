import { count, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { getDb } from "@/db";
import { auditLogs, members, notificationOutbox, orders, paymentAttempts, refundRequests, reviews } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const member = await getAuthenticatedMember(request);
  if (!member?.isAdmin) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  try {
    const db = getDb();
    const [memberCount, orderCount, paymentCount, refundCount, reviewCount, notices, logs, recentOrders, recentPayments, recentRefunds] = await Promise.all([
      db.select({ value: count() }).from(members), db.select({ value: count() }).from(orders), db.select({ value: count() }).from(paymentAttempts),
      db.select({ value: count() }).from(refundRequests), db.select({ value: count() }).from(reviews),
      db.select().from(notificationOutbox).orderBy(desc(notificationOutbox.createdAt)).limit(30),
      db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(50),
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(20),
      db.select().from(paymentAttempts).orderBy(desc(paymentAttempts.createdAt)).limit(20),
      db.select().from(refundRequests).orderBy(desc(refundRequests.requestedAt)).limit(20),
    ]);
    return NextResponse.json({
      counts: { members: memberCount[0]?.value ?? 0, orders: orderCount[0]?.value ?? 0, payments: paymentCount[0]?.value ?? 0, refunds: refundCount[0]?.value ?? 0, reviews: reviewCount[0]?.value ?? 0 },
      notices, logs, recentOrders, recentPayments, recentRefunds,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "운영 현황을 불러오지 못했습니다." }, { status: 500 });
  }
}
