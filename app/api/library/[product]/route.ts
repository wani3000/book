import { and, desc, eq, isNull } from "drizzle-orm";
import { get } from "@vercel/blob";
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

  const testPurchaser = isTestPurchaser(member.email);
  let canRead = testPurchaser;
  if (!testPurchaser) {
    const [paidOrder] = await getDb().select({ id: orders.id, firstAccessedAt: orders.firstAccessedAt })
      .from(orders)
      .where(and(eq(orders.memberId, member.id), eq(orders.product, product), eq(orders.status, "paid")))
      .orderBy(desc(orders.createdAt))
      .limit(1);
    canRead = Boolean(paidOrder);
    if (paidOrder && !paidOrder.firstAccessedAt) {
      await getDb().update(orders).set({ firstAccessedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
        .where(and(eq(orders.id, paidOrder.id), isNull(orders.firstAccessedAt)));
    }
  }
  if (!canRead) return NextResponse.json({ error: "구매한 회원만 읽을 수 있습니다." }, { status: 403 });

  const book = ebookCatalog[product];
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "전자책 저장소가 준비되지 않았습니다." }, { status: 503 });
  const object = await get(book.objectKey, { access: "private" });
  if (!object || object.statusCode !== 200) return NextResponse.json({ error: "전자책 파일을 찾지 못했습니다." }, { status: 503 });
  const filename = encodeURIComponent(book.filename);
  return new Response(object.stream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Accept-Ranges": "none",
    },
  });
}
