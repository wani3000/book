"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowClockwise, CheckCircle, Clock, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import { redirectForAdminReauthentication } from "./adminReauthentication";

type Attempt = {
  id: string; memberName: string; memberEmail: string; product: string; amount: number; provider: string;
  providerReference: string; status: string; errorCode?: string | null; createdAt: string; updatedAt: string;
};

const productNames: Record<string, string> = { codex: "아이디어를 서비스로 바꾸는 Codex 사용법", career: "커리어도 디자인할 수 있습니다", jane: "승무원 다음은 IT였습니다" };
const attentionStatuses = ["approving", "reconcile", "refund_pending", "refund_review", "refund_processing", "failed"];

export default function PaymentAdmin() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [filter, setFilter] = useState("attention");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/payments", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.error ?? "결제 시도 목록을 불러오지 못했습니다.");
    else { setAttempts(data.attempts ?? []); setError(""); }
    setLoading(false);
  }, []);

  useEffect(() => { const initialLoad = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(initialLoad); }, [load]);
  const visible = useMemo(() => attempts.filter((item) => filter === "all" || (filter === "attention" ? attentionStatuses.includes(item.status) : item.status === filter)), [attempts, filter]);

  async function reconcile(attempt: Attempt) {
    if (!window.confirm(`${attempt.provider} 거래 상태를 다시 확인하고 주문·권한 상태를 맞출까요?`)) return;
    setWorkingId(attempt.id); setError("");
    const response = await fetch("/api/admin/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId: attempt.id }) });
    const data = await response.json().catch(() => ({}));
    if (await redirectForAdminReauthentication(data)) return;
    if (!response.ok) setError(data.error ?? "결제 상태를 확인하지 못했습니다.");
    await load(); setWorkingId("");
  }

  if (loading && !attempts.length) return <div className="admin-state">결제 시도 목록을 불러오고 있습니다.</div>;
  if (error && !attempts.length) return <div className="admin-state"><ShieldCheck size={38} /><h1>결제 관리에 접근할 수 없습니다.</h1><p>{error}</p><Link href="/mypage">마이페이지로 돌아가기</Link></div>;

  return <div className="admin-members admin-refunds">
    <section className="admin-title"><p>PAYMENT ADMIN</p><h1>결제 상태 관리</h1><span>결제사업자 승인·취소 상태와 내부 주문이 어긋난 건을 확인하고 복구합니다.</span></section>
    <section className="admin-summary"><article><WarningCircle /><span>확인 필요</span><strong>{attempts.filter((item) => attentionStatuses.includes(item.status)).length}</strong></article><article><CheckCircle /><span>결제 완료</span><strong>{attempts.filter((item) => item.status === "paid").length}</strong></article><article><Clock /><span>전체 시도</span><strong>{attempts.length}</strong></article></section>
    <section className="admin-toolbar"><nav className="admin-links"><Link href="/admin/members">회원</Link><Link href="/admin/reviews">후기</Link><Link href="/admin/refunds">환불</Link><Link className="active" href="/admin/payments">결제</Link></nav><select aria-label="결제 상태" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="attention">확인 필요</option><option value="paid">결제 완료</option><option value="failed">실패</option><option value="all">전체</option></select></section>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <section className="admin-refund-list">{visible.map((attempt) => <article key={attempt.id}><header><div><b>{productNames[attempt.product] ?? attempt.product}</b><span>{attempt.memberName} · {attempt.memberEmail} · {attempt.amount.toLocaleString("ko-KR")}원</span></div><i className={`refund-admin-status ${attempt.status}`}>{attempt.status}</i></header><div className="refund-admin-meta"><span>{attempt.provider}</span><span>주문 {attempt.id}</span><span>생성 {new Date(attempt.createdAt).toLocaleString("ko-KR")}</span>{attempt.errorCode && <span>오류 {attempt.errorCode}</span>}</div><footer><span>거래번호 {attempt.providerReference}</span><div><button onClick={() => reconcile(attempt)} disabled={workingId === attempt.id || attempt.providerReference.startsWith("pending:")}><ArrowClockwise />결제 상태 확인·복구</button></div></footer></article>)}{!visible.length && <div className="admin-empty">조건에 맞는 결제 시도가 없습니다.</div>}</section>
  </div>;
}
