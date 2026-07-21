import type { Metadata } from "next";
import Link from "next/link";
import MemberAdmin from "../../components/MemberAdmin";

export const metadata: Metadata = { title: "회원 관리", robots: { index: false, follow: false } };

export default function AdminMembersPage() {
  return <main className="account-site admin-site"><header className="account-header"><Link className="class-logo" href="/"><span className="class-logo-mark" aria-hidden="true">P</span><strong>PHILIP BOOKS</strong></Link><nav><Link href="/admin/reviews">후기 관리</Link><Link href="/admin/refunds">환불 관리</Link><Link href="/mypage">마이페이지</Link><Link href="/">스토어</Link></nav></header><MemberAdmin /><footer>관리자 전용 · 회원 정보는 서비스 운영 목적으로만 사용하세요.</footer></main>;
}
