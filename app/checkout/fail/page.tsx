import Link from "next/link";

export const metadata = { title: "결제 실패", robots: { index: false, follow: false } };

export default async function CheckoutFailPage({ searchParams }: { searchParams: Promise<{ reason?: string; message?: string }> }) {
  const { reason, message } = await searchParams;
  const cancelled = reason === "cancel";
  const providerMessage = message?.trim().slice(0, 160);
  return <main className="checkout-success checkout-fail"><span>{cancelled ? "PAYMENT CANCELLED" : "PAYMENT FAILED"}</span><h1>{cancelled ? "결제를 취소했습니다." : "결제를 완료하지 못했습니다."}</h1><p>{providerMessage || (cancelled ? "결제 금액은 청구되지 않았습니다. 원하실 때 다시 구매할 수 있습니다." : "결제 승인 과정에서 문제가 발생했습니다. 잠시 후 다시 시도하거나 고객센터로 문의해 주세요.")}</p><div><Link href="/">전자책 다시 보기</Link><Link href="/mypage">마이페이지</Link></div></main>;
}
