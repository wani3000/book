import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { getDb } from "@/db";
import { orders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const member = await getAuthenticatedMember(request);
    if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const rows = await getDb().select({
      id: orders.id,
      product: orders.product,
      productTitle: orders.productTitle,
      amount: orders.amount,
      currency: orders.currency,
      status: orders.status,
      createdAt: orders.createdAt,
    }).from(orders).where(eq(orders.memberId, member.id)).orderBy(desc(orders.createdAt)).limit(50);
    return NextResponse.json({ orders: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "구매 내역을 불러오지 못했습니다." }, { status: 500 });
  }
}
