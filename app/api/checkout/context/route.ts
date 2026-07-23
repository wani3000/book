import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { isEbookProduct } from "@/app/library/catalog";
import { createPurchaseEntitlement } from "@/app/paddle/entitlement";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const member = await getAuthenticatedMember(request);
  if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json().catch(() => null) as { product?: unknown } | null;
  const product = typeof body?.product === "string" ? body.product : "";
  if (!isEbookProduct(product)) return NextResponse.json({ error: "전자책 상품을 확인해 주세요." }, { status: 400 });
  const entitlement = await createPurchaseEntitlement(member.id, product);
  return NextResponse.json({ entitlement, email: member.email }, { headers: { "Cache-Control": "no-store" } });
}
