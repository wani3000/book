import type { Metadata } from "next";
import AccountDashboard from "../../components/AccountDashboard";
import BusinessFooter from "../../components/BusinessFooter";

export const metadata: Metadata = { title: "프로필 관리", robots: { index: false, follow: false } };
export default function ProfilePage() { return <main className="account-site class-market"><AccountDashboard section="profile" /><BusinessFooter /></main>; }
