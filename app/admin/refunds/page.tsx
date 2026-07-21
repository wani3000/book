import type { Metadata } from "next";
import Link from "next/link";
import RefundAdmin from "../../components/RefundAdmin";

export const metadata: Metadata = { title: "환불 신청 관리", robots: { index: false, follow: false } };

export default function AdminRefundsPage() {
  return <main className="account-site admin-site"><header className="account-header"><Link className="class-logo" href="/"><span className="class-logo-mark" aria-hidden="true">P</span><strong>PHILIP BOOKS</strong></Link><nav><Link href="/admin/members">회원 관리</Link><Link href="/admin/reviews">후기 관리</Link><Link href="/mypage">마이페이지</Link><Link href="/">스토어</Link></nav></header><RefundAdmin /><footer>관리자 전용 · 실제 결제 취소 전 주문과 열람 기록을 확인하세요.</footer></main>;
}
