import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { ebookCatalog, isEbookProduct, isTestPurchaser } from "@/app/library/catalog";
import { getDb } from "@/db";
import { orders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ product: string }> }) {
  const member = await getAuthenticatedMember(request);
  if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { product } = await params;
  if (!isEbookProduct(product)) return NextResponse.json({ error: "전자책을 찾을 수 없습니다." }, { status: 404 });

  let canRead = isTestPurchaser(member.email);
  if (!canRead) {
    const paidOrder = await getDb().query.orders.findFirst({
      where: and(eq(orders.memberId, member.id), eq(orders.product, product), eq(orders.status, "paid")),
    });
    canRead = Boolean(paidOrder);
  }
  if (!canRead) return NextResponse.json({ error: "구매한 회원만 읽을 수 있습니다." }, { status: 403 });

  const book = ebookCatalog[product];
  const response = NextResponse.redirect(new URL(book.assetPath, request.url), 307);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
