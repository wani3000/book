import type { Metadata } from "next";
import AccountDashboard from "../components/AccountDashboard";
import BusinessFooter from "../components/BusinessFooter";

export const metadata: Metadata = { title: "마이페이지", description: "다니엘의 노트 회원 정보와 구매한 전자책을 관리합니다.", robots: { index: false, follow: false } };

export default function MyPage() {
  return <main className="account-site class-market"><AccountDashboard /><BusinessFooter /></main>;
}
