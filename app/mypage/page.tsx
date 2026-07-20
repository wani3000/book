import type { Metadata } from "next";
import Link from "next/link";
import AccountDashboard from "../components/AccountDashboard";

export const metadata: Metadata = { title: "마이페이지", description: "PHILIP BOOKS 회원 정보와 구매한 전자책을 관리합니다.", robots: { index: false, follow: false } };

export default function MyPage() {
  return <main className="account-site"><header className="account-header"><Link className="class-logo" href="/"><span className="class-logo-mark" aria-hidden="true">P</span><strong>PHILIP BOOKS</strong></Link><Link href="/">전자책 둘러보기</Link></header><AccountDashboard /><footer>© 2026 PHILIP BOOKS · 회원 정보는 서비스 제공과 구매 관리에만 사용합니다.</footer></main>;
}
