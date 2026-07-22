import type { Metadata } from "next";
import AccountDashboard from "../../components/AccountDashboard";
import BusinessFooter from "../../components/BusinessFooter";

export const metadata: Metadata = { title: "주문 내역", robots: { index: false, follow: false } };
export default function OrdersPage() { return <main className="account-site class-market"><AccountDashboard section="orders" /><BusinessFooter /></main>; }
