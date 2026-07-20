import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { reviews } from "../../../db/schema";

const products = new Set(["codex", "career", "jane"]);

export async function GET(request: Request) {
  const product = new URL(request.url).searchParams.get("product") ?? "";
  if (!products.has(product)) return Response.json({ error: "지원하지 않는 책입니다." }, { status: 400 });

  try {
    const rows = await getDb()
      .select({
        id: reviews.id,
        displayName: reviews.displayName,
        rating: reviews.rating,
        content: reviews.content,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(and(eq(reviews.product, product), eq(reviews.status, "approved"), eq(reviews.purchaseVerified, 1)))
      .orderBy(desc(reviews.createdAt), desc(reviews.id))
      .limit(12);
    return Response.json({ reviews: rows });
  } catch {
    return Response.json({ reviews: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const product = String(body.product ?? "");
    const displayName = String(body.displayName ?? "").trim();
    const content = String(body.content ?? "").trim();
    const purchaseReference = String(body.purchaseReference ?? "").trim();
    const rating = Number(body.rating);

    if (!products.has(product)) return Response.json({ error: "지원하지 않는 책입니다." }, { status: 400 });
    if (displayName.length < 2 || displayName.length > 30) return Response.json({ error: "표시 이름은 2~30자로 입력해 주세요." }, { status: 400 });
    if (content.length < 20 || content.length > 700) return Response.json({ error: "후기는 20~700자로 입력해 주세요." }, { status: 400 });
    if (purchaseReference.length < 4 || purchaseReference.length > 100) return Response.json({ error: "구매 번호를 확인해 주세요." }, { status: 400 });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return Response.json({ error: "별점은 1~5점으로 입력해 주세요." }, { status: 400 });

    await getDb().insert(reviews).values({ product, displayName, content, purchaseReference, rating });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "후기를 저장하지 못했습니다." }, { status: 500 });
  }
}
