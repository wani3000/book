import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { ebookCatalog, isEbookProduct } from "@/app/library/catalog";
import { kakaoPayEnabled, kakaoPayErrorCode, readyKakaoPay } from "@/app/kakaopay/server";
import { getDb } from "@/db";
import { paymentAttempts } from "@/db/schema";

export async function POST(request: Request) {
  const member = await getAuthenticatedMember(request);
  if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!kakaoPayEnabled()) return NextResponse.json({ error: "현재 카카오페이 결제를 이용할 수 없습니다." }, { status: 503 });

  const body = await request.json().catch(() => ({})) as { product?: string; contentProvisionConsent?: boolean };
  if (!body.product || !isEbookProduct(body.product)) {
    return NextResponse.json({ error: "판매 상품을 확인할 수 없습니다." }, { status: 400 });
  }
  if (body.contentProvisionConsent !== true) {
    return NextResponse.json({ error: "디지털 콘텐츠 즉시 제공에 대한 확인이 필요합니다." }, { status: 400 });
  }

  const orderId = `pb_${Date.now()}_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const origin = new URL(request.url).origin;
  try {
    const ready = await readyKakaoPay({ product: body.product, orderId, memberId: member.id, origin });
    if (!ready.tid || !ready.next_redirect_pc_url || !ready.next_redirect_mobile_url) {
      throw new Error("KakaoPay ready response is incomplete");
    }
    await getDb().insert(paymentAttempts).values({
      id: orderId,
      memberId: member.id,
      product: body.product,
      amount: ebookCatalog[body.product].amount,
      providerReference: ready.tid,
      contentProvisionConsentAt: new Date().toISOString(),
    });
    return NextResponse.json({
      orderId,
      redirectUrl: ready.next_redirect_pc_url,
      mobileRedirectUrl: ready.next_redirect_mobile_url,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("KakaoPay ready failed", { code: kakaoPayErrorCode(error), orderId });
    return NextResponse.json({ error: "결제를 시작하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }
}
