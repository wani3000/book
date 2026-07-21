import { and, eq } from "drizzle-orm";
import type { EbookProduct } from "@/app/library/catalog";
import { getDb } from "@/db";
import { orders } from "@/db/schema";

export async function hasPaidOrder(memberId: string, product: EbookProduct) {
  const [order] = await getDb()
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.memberId, memberId), eq(orders.product, product), eq(orders.status, "paid")))
    .limit(1);
  return Boolean(order);
}
