import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { ebookCatalog, isEbookProduct } from "@/app/library/catalog";
import { naverPayCheckoutContext, naverPayEnabled } from "@/app/naverpay/server";
import { hasPaidOrder } from "@/app/payments/eligibility";
import { DIGITAL_CONTENT_CONSENT_VERSION } from "@/app/payments/policy";
import { getDb } from "@/db";
import { paymentAttempts } from "@/db/schema";

export async function POST(request: Request) {
  const member = await getAuthenticatedMember(request);
  if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!naverPayEnabled()) return NextResponse.json({ error: "현재 네이버페이 결제를 이용할 수 없습니다." }, { status: 503 });

  const body = await request.json().catch(() => ({})) as { product?: string; contentProvisionConsent?: boolean };
  if (!body.product || !isEbookProduct(body.product)) {
    return NextResponse.json({ error: "판매 상품을 확인할 수 없습니다." }, { status: 400 });
  }
  if (body.contentProvisionConsent !== true) {
    return NextResponse.json({ error: "디지털 콘텐츠 즉시 제공에 대한 확인이 필요합니다." }, { status: 400 });
  }
  if (await hasPaidOrder(member.id, body.product)) {
    return NextResponse.json({ error: "이미 구매한 전자책입니다.", owned: true, libraryUrl: "/mypage#orders" }, { status: 409 });
  }

  const orderId = `pb_np_${Date.now()}_${crypto.randomUUID().replaceAll("-", "").slice(0, 10)}`;
  const now = new Date().toISOString();
  await getDb().insert(paymentAttempts).values({
    id: orderId,
    memberId: member.id,
    product: body.product,
    amount: ebookCatalog[body.product].amount,
    provider: "naverpay",
    providerReference: `pending:${orderId}`,
    contentProvisionConsentAt: now,
    contentProvisionConsentVersion: DIGITAL_CONTENT_CONSENT_VERSION,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(naverPayCheckoutContext({
    product: body.product,
    orderId,
    memberId: member.id,
    origin: new URL(request.url).origin,
  }), { headers: { "Cache-Control": "no-store" } });
}
