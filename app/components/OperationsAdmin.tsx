"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Data = { counts: Record<string, number>; logs: Array<{ id: string; action: string; entityType: string; entityId: string; detail?: string | null; createdAt: string }>; notices: Array<{ id: string; event: string; recipient: string; status: string; createdAt: string }>; recentOrders: Array<{ id: string; productTitle: string; status: string; provider: string; amount: number }>; recentPayments: Array<{ id: string; provider: string; status: string; errorCode?: string | null }>; recentRefunds: Array<{ id: string; orderId: string; status: string }> };

export default function OperationsAdmin() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/admin/operations", { cache: "no-store" }).then(async (response) => ({ response, body: await response.json() })).then(({ response, body }) => response.ok ? setData(body) : setError(body.error)).catch(() => setError("운영 현황을 불러오지 못했습니다.")); }, []);
  if (error) return <div className="admin-state"><h1>운영 현황에 접근할 수 없습니다.</h1><p>{error}</p></div>;
  if (!data) return <div className="admin-state">운영 현황을 불러오고 있습니다.</div>;
  return <div className="admin-members admin-operations"><section className="admin-title"><p>OPERATIONS</p><h1>운영 현황</h1><span>회원·주문·결제·환불·후기와 변경 이력을 한곳에서 추적합니다.</span></section>
    <nav className="admin-links"><Link href="/admin/members">회원</Link><Link href="/admin/reviews">후기</Link><Link href="/admin/refunds">환불</Link><Link href="/admin/payments">결제</Link><Link className="active" href="/admin/operations">운영 현황</Link></nav>
    <nav className="admin-links" aria-label="CSV 내보내기"><a href="/api/admin/export?type=orders">주문 CSV</a><a href="/api/admin/export?type=payments">결제 CSV</a><a href="/api/admin/export?type=refunds">환불 CSV</a><a href="/api/admin/export?type=reviews">후기 CSV</a><a href="/api/admin/export?type=audit">감사 로그 CSV</a></nav>
    <section className="admin-summary">{Object.entries(data.counts).map(([key, value]) => <article key={key}><span>{key}</span><strong>{value}</strong></article>)}</section>
    <section className="admin-review-list"><h2>최근 주문</h2>{data.recentOrders.map((item) => <article key={item.id}><header><b>{item.productTitle}</b><i>{item.status}</i></header><p>{item.id} · {item.provider} · {item.amount.toLocaleString("ko-KR")}원</p></article>)}</section>
    <section className="admin-review-list"><h2>결제·환불 확인</h2>{data.recentPayments.map((item) => <article key={item.id}><header><b>{item.id}</b><i>{item.status}</i></header><p>{item.provider}{item.errorCode ? ` · ${item.errorCode}` : ""}</p></article>)}{data.recentRefunds.map((item) => <article key={item.id}><header><b>환불 {item.orderId}</b><i>{item.status}</i></header></article>)}</section>
    <section className="admin-review-list"><h2>변경 감사 로그</h2>{data.logs.map((item) => <article key={item.id}><header><b>{item.action}</b><i>{new Date(item.createdAt).toLocaleString("ko-KR")}</i></header><p>{item.entityType} · {item.entityId}{item.detail ? ` · ${item.detail}` : ""}</p></article>)}</section>
    <section className="admin-review-list"><h2>알림 메일 큐</h2>{data.notices.map((item) => <article key={item.id}><header><b>{item.event}</b><i>{item.status}</i></header><p>{item.recipient}</p></article>)}</section>
  </div>;
}
