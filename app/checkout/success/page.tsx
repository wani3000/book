import Link from "next/link";
import CheckoutSuccessTracker from "@/app/components/CheckoutSuccessTracker";

export const metadata = { title: "결제 완료", robots: { index: false, follow: false } };

export default function CheckoutSuccessPage() {
  return <main className="checkout-success"><CheckoutSuccessTracker /><span>PAYMENT COMPLETE</span><h1>결제가 완료되었습니다.</h1><p>결제 확인이 끝나면 마이페이지 구매 내역에 전자책이 자동으로 나타납니다. 보통 몇 초 안에 반영됩니다.</p><div><Link href="/mypage/orders">구매한 전자책 확인</Link><Link href="/">스토어로 돌아가기</Link></div></main>;
}
