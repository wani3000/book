"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Data = { counts: Record<string, number>; logs: Array<{ id: string; action: string; entityType: string; entityId: string; detail?: string | null; createdAt: string }>; notices: Array<{ id: string; event: string; recipient: string; status: string; attemptCount: number; lastError?: string | null; createdAt: string }>; recentOrders: Array<{ id: string; productTitle: string; status: string; provider: string; amount: number }>; recentPayments: Array<{ id: string; provider: string; status: string; errorCode?: string | null }>; recentRefunds: Array<{ id: string; orderId: string; status: string }> };

export default function OperationsAdmin() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(() => { fetch("/api/admin/operations", { cache: "no-store" }).then(async (response) => ({ response, body: await response.json() })).then(({ response, body }) => response.ok ? setData(body) : setError(body.error)).catch(() => setError("운영 현황을 불러오지 못했어요.")); }, []);
  useEffect(() => { load(); }, [load]);
  async function submitCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement, (event.nativeEvent as SubmitEvent).submitter);
    setMessage("소식을 발송하고 있어요…");
    const response = await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
    const body = await response.json().catch(() => ({})) as { message?: string; error?: string };
    setMessage(response.ok ? body.message ?? "발송을 준비했어요." : body.error ?? "발송하지 못했어요.");
    if (response.ok) { formElement.reset(); load(); }
  }
  async function retryEmails() {
    setMessage("보내지 못한 메일을 다시 확인하고 있어요…");
    const response = await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "retry" }) });
    const body = await response.json().catch(() => ({})) as { message?: string; error?: string };
    setMessage(response.ok ? body.message ?? "다시 발송했어요." : body.error ?? "다시 발송하지 못했어요.");
    if (response.ok) load();
  }
  if (error) return <div className="admin-state"><h1>운영 현황에 접근할 수 없습니다.</h1><p>{error}</p></div>;
  if (!data) return <div className="admin-state">운영 현황을 불러오고 있습니다.</div>;
  return <div className="admin-members admin-operations"><section className="admin-title"><p>OPERATIONS</p><h1>운영 현황</h1><span>회원·주문·결제·환불·후기와 변경 이력을 한곳에서 추적합니다.</span></section>
    <nav className="admin-links"><Link href="/admin/members">회원</Link><Link href="/admin/reviews">후기</Link><Link href="/admin/refunds">환불</Link><Link href="/admin/payments">결제</Link><Link className="active" href="/admin/operations">운영 현황</Link></nav>
    <nav className="admin-links" aria-label="CSV 내보내기"><a href="/api/admin/export?type=orders">주문 CSV</a><a href="/api/admin/export?type=payments">결제 CSV</a><a href="/api/admin/export?type=refunds">환불 CSV</a><a href="/api/admin/export?type=reviews">후기 CSV</a><a href="/api/admin/export?type=audit">감사 로그 CSV</a></nav>
    <section className="admin-summary">{Object.entries(data.counts).map(([key, value]) => <article key={key}><span>{key}</span><strong>{value}</strong></article>)}</section>
    <section className="admin-review-list"><h2>최근 주문</h2>{data.recentOrders.map((item) => <article key={item.id}><header><b>{item.productTitle}</b><i>{item.status}</i></header><p>{item.id} · {item.provider} · {item.amount.toLocaleString("ko-KR")}원</p></article>)}</section>
    <section className="admin-review-list"><h2>결제·환불 확인</h2>{data.recentPayments.map((item) => <article key={item.id}><header><b>{item.id}</b><i>{item.status}</i></header><p>{item.provider}{item.errorCode ? ` · ${item.errorCode}` : ""}</p></article>)}{data.recentRefunds.map((item) => <article key={item.id}><header><b>환불 {item.orderId}</b><i>{item.status}</i></header></article>)}</section>
    <section className="admin-review-list"><h2>변경 감사 로그</h2>{data.logs.map((item) => <article key={item.id}><header><b>{item.action}</b><i>{new Date(item.createdAt).toLocaleString("ko-KR")}</i></header><p>{item.entityType} · {item.entityId}{item.detail ? ` · ${item.detail}` : ""}</p></article>)}</section>
    <section className="admin-review-list admin-email-center"><header><div><h2>알림 메일 큐</h2><p>결제·환불·회원 안내 메일의 발송 상태예요.</p></div><button type="button" onClick={retryEmails}>실패 메일 다시 보내기</button></header>{data.notices.map((item) => <article key={item.id}><header><b>{item.event}</b><i>{item.status}</i></header><p>{item.recipient} · 시도 {item.attemptCount}회{item.lastError ? ` · ${item.lastError}` : ""}</p></article>)}</section>
    <section className="admin-review-list admin-campaign"><h2>새 책과 할인 소식 보내기</h2><p>먼저 내 이메일로 미리보기를 확인한 뒤, 수신에 동의한 회원에게 보내세요.</p><form onSubmit={submitCampaign}><label>메일 제목<input name="subject" minLength={2} maxLength={80} placeholder="새로운 전자책이 나왔어요" required /></label><label>큰 제목<input name="title" minLength={2} maxLength={100} placeholder="이번 경험은 당신의 다음 기회가 될 거예요" required /></label><label>설명<textarea name="message" minLength={10} maxLength={2000} rows={6} placeholder="회원에게 전할 내용을 친절하게 작성해 주세요." required /></label><div><label>버튼 문구<input name="actionLabel" maxLength={40} placeholder="새 책 보러 가기" /></label><label>버튼 주소<input name="actionUrl" type="url" placeholder="https://danielsnote.com/codex" /></label></div><div className="admin-campaign-actions"><button type="submit" name="action" value="test">내 이메일로 미리보기</button><button type="submit" name="action" value="send">동의한 회원에게 보내기</button></div></form><p role="status">{message}</p></section>
  </div>;
}
