"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowCounterClockwise, CheckCircle, Clock, ShieldCheck, XCircle } from "@phosphor-icons/react";
import { redirectForAdminReauthentication } from "./adminReauthentication";

type Refund = {
  id: string; orderId: string; memberName: string; memberEmail: string; productTitle: string; amount: number; provider: string;
  orderStatus: string; firstAccessedAt?: string | null; orderCreatedAt: string; reasonCode: string; reasonDetail: string;
  status: string; decisionNote?: string | null; requestedAt: string; reviewedAt?: string | null;
};

const reasonLabels: Record<string, string> = { change_of_mind: "단순 변심", file_issue: "PDF 파일 결함", description_mismatch: "상품 설명과 다름", service_unavailable: "콘텐츠 이용 불가", other: "기타" };
const statusLabels: Record<string, string> = { requested: "신청 완료", reviewing: "검토 중", refunded: "환불 완료", rejected: "환불 불가" };

export default function RefundAdmin() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [filter, setFilter] = useState("requested");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/refunds", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "환불 신청 목록을 불러오지 못했습니다.");
    else { setRefunds(data.refunds ?? []); setError(""); }
    setLoading(false);
  }, []);

  useEffect(() => { const initialLoad = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(initialLoad); }, [load]);
  const visible = useMemo(() => refunds.filter((refund) => filter === "all" || refund.status === filter), [filter, refunds]);

  async function process(refund: Refund, action: "review" | "approve" | "reject" | "reconcile") {
    const note = (notes[refund.id] ?? "").trim();
    if (action === "reject" && note.length < 5) { setError("환불 불가 사유를 5자 이상 입력해 주세요."); return; }
    if (action === "approve" && !window.confirm(`${refund.memberName}님의 ${refund.productTitle} 결제를 취소하고 PDF 권한을 회수할까요?`)) return;
    setWorkingId(refund.id); setError("");
    const response = await fetch("/api/admin/refunds", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refundId: refund.id, action, decisionNote: note }) });
    const data = await response.json().catch(() => ({})) as { error?: string; code?: string };
    if (await redirectForAdminReauthentication(data)) return;
    const processError = response.ok ? "" : (data.error ?? "환불 신청을 처리하지 못했습니다.");
    await load();
    if (processError) setError(processError);
    setWorkingId("");
  }

  if (loading && !refunds.length) return <div className="admin-state">환불 신청 목록을 불러오고 있습니다.</div>;
  if (error && !refunds.length) return <div className="admin-state"><ShieldCheck size={38} /><h1>환불 관리에 접근할 수 없습니다.</h1><p>{error}</p><Link href="/mypage">마이페이지로 돌아가기</Link></div>;

  const requestedCount = refunds.filter((item) => item.status === "requested").length;
  const reviewingCount = refunds.filter((item) => item.status === "reviewing").length;
  const refundedCount = refunds.filter((item) => item.status === "refunded").length;

  return <div className="admin-members admin-refunds">
    <section className="admin-title"><p>REFUND ADMIN</p><h1>환불 신청 관리</h1><span>열람 기록과 신청 사유를 확인하고 승인 또는 환불 불가를 결정합니다.</span></section>
    <section className="admin-summary"><article><ArrowCounterClockwise /><span>신청 완료</span><strong>{requestedCount}</strong></article><article><Clock /><span>검토 중</span><strong>{reviewingCount}</strong></article><article><CheckCircle /><span>환불 완료</span><strong>{refundedCount}</strong></article></section>
    <section className="admin-toolbar"><nav className="admin-links"><Link href="/admin/members">회원</Link><Link href="/admin/reviews">후기</Link><Link className="active" href="/admin/refunds">환불</Link><Link href="/admin/payments">결제</Link></nav><select aria-label="환불 상태" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="requested">신청 완료</option><option value="reviewing">검토 중</option><option value="refunded">환불 완료</option><option value="rejected">환불 불가</option><option value="all">전체</option></select></section>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <section className="admin-refund-list">{visible.map((refund) => <article key={refund.id}>
      <header><div><b>{refund.productTitle}</b><span>{refund.memberName} · {refund.memberEmail} · {refund.amount.toLocaleString("ko-KR")}원</span></div><i className={`refund-admin-status ${refund.status}`}>{statusLabels[refund.status] ?? refund.status}</i></header>
      <div className="refund-admin-meta"><span>신청 {new Date(refund.requestedAt).toLocaleString("ko-KR")}</span><span>결제수단 {refund.provider}</span><span>주문 {refund.orderId}</span><span>{refund.firstAccessedAt ? `최초 열람 ${new Date(refund.firstAccessedAt).toLocaleString("ko-KR")}` : "미열람"}</span></div>
      <section><b>{reasonLabels[refund.reasonCode] ?? refund.reasonCode}</b><p>{refund.reasonDetail}</p></section>
      {refund.decisionNote && <p className="refund-decision-note">처리 메모: {refund.decisionNote}</p>}
      {!['refunded', 'rejected'].includes(refund.status) && <footer><textarea aria-label={`${refund.memberName} 환불 처리 메모`} value={notes[refund.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [refund.id]: event.target.value }))} maxLength={500} placeholder="환불 불가 사유 또는 관리자 메모" /><div><button onClick={() => process(refund, "review")} disabled={workingId === refund.id || refund.status === "reviewing"}><Clock />검토 시작</button><button onClick={() => process(refund, "approve")} disabled={workingId === refund.id || refund.orderStatus !== "paid"}><CheckCircle />승인·결제 취소</button>{["refund_pending", "refund_review", "refund_processing"].includes(refund.orderStatus) && <button onClick={() => process(refund, "reconcile")} disabled={workingId === refund.id}><ArrowCounterClockwise />결제 상태 확인</button>}<button onClick={() => process(refund, "reject")} disabled={workingId === refund.id}><XCircle />환불 불가</button></div></footer>}
    </article>)}{!visible.length && <div className="admin-empty">조건에 맞는 환불 신청이 없습니다.</div>}</section>
  </div>;
}
