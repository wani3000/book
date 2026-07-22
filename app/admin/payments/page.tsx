import type { Metadata } from "next";
import Link from "next/link";
import PaymentAdmin from "@/app/components/PaymentAdmin";

export const metadata: Metadata = { title: "결제 상태 관리", robots: { index: false, follow: false } };

export default function AdminPaymentsPage() {
  return <main className="account-site admin-site"><header className="account-header"><Link className="class-logo" href="/"><span className="class-logo-mark" aria-hidden="true">D</span><strong>다니엘의 노트</strong></Link><nav><Link href="/admin/members">회원 관리</Link><Link href="/admin/refunds">환불 관리</Link><Link href="/mypage">마이페이지</Link><Link href="/">스토어</Link></nav></header><PaymentAdmin /><footer>관리자 전용 · 제공사 상태를 확인한 뒤 주문과 열람 권한을 자동으로 복구합니다.</footer></main>;
}
