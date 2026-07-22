import type { Metadata } from "next";
import OperationsAdmin from "../../components/OperationsAdmin";

export const metadata: Metadata = { title: "운영 현황", robots: { index: false, follow: false } };
export default function OperationsPage() { return <main className="admin-page-shell"><OperationsAdmin /></main>; }
