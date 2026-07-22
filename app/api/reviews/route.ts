import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { orders, reviews } from "../../../db/schema";
import { getAuthenticatedMember } from "@/app/auth/member";
import { isEbookProduct, isTestPurchaser } from "@/app/library/catalog";
import { enforceRateLimit, requireSameOrigin } from "@/app/security/request";

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
    const originError = requireSameOrigin(request);
    if (originError) return originError;
    const limited = await enforceRateLimit(request, "review", 5, 600);
    if (limited) return limited;
    const member = await getAuthenticatedMember(request);
    if (!member) return Response.json({ error: "후기를 작성하려면 먼저 로그인해 주세요." }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const product = String(body.product ?? "");
    const displayName = String(body.displayName ?? "").trim();
    const content = String(body.content ?? "").trim();
    const rating = Number(body.rating);

    if (!products.has(product) || !isEbookProduct(product)) return Response.json({ error: "지원하지 않는 책입니다." }, { status: 400 });
    const paidOrder = await getDb().query.orders.findFirst({
      where: and(eq(orders.memberId, member.id), eq(orders.product, product), eq(orders.status, "paid")),
    });
    if (!isTestPurchaser(member.email) && !paidOrder) {
      return Response.json({ error: "구매한 전자책에만 후기를 작성할 수 있습니다." }, { status: 403 });
    }
    if (displayName.length < 2 || displayName.length > 30) return Response.json({ error: "표시 이름은 2~30자로 입력해 주세요." }, { status: 400 });
    if (content.length < 20 || content.length > 700) return Response.json({ error: "후기는 20~700자로 입력해 주세요." }, { status: 400 });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return Response.json({ error: "별점은 1~5점으로 입력해 주세요." }, { status: 400 });

    const now = new Date().toISOString();
    const existing = await getDb().query.reviews.findFirst({ where: and(eq(reviews.memberId, member.id), eq(reviews.product, product)) });
    const values = {
      displayName,
      content,
      rating,
      orderId: paidOrder?.id ?? null,
      purchaseReference: paidOrder?.providerReference ?? "test-entitlement",
      purchaseVerified: 1,
      status: "pending",
      moderationReason: null,
      reviewedBy: null,
      reviewedAt: null,
      updatedAt: now,
    };
    if (existing) await getDb().update(reviews).set(values).where(eq(reviews.id, existing.id));
    else await getDb().insert(reviews).values({ product, memberId: member.id, createdAt: now, ...values });
    return Response.json({ ok: true, updated: Boolean(existing) }, { status: existing ? 200 : 201 });
  } catch {
    return Response.json({ error: "후기를 저장하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const member = await getAuthenticatedMember(request);
  if (!member) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const product = new URL(request.url).searchParams.get("product") ?? "";
  if (!products.has(product)) return Response.json({ error: "지원하지 않는 책입니다." }, { status: 400 });
  await getDb().delete(reviews).where(and(eq(reviews.memberId, member.id), eq(reviews.product, product)));
  return Response.json({ ok: true });
}
