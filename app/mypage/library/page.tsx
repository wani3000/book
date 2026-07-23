import type { Metadata } from "next";
import AccountDashboard from "../../components/AccountDashboard";
import BusinessFooter from "../../components/BusinessFooter";

export const metadata: Metadata = { title: "내 서재", robots: { index: false, follow: false } };
export default function LibraryPage() { return <main className="account-site class-market"><AccountDashboard section="library" /><BusinessFooter /></main>; }
