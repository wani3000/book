"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowCounterClockwise, CheckCircle, Clock, XCircle } from "@phosphor-icons/react";

export type RefundableOrder = {
  id: string;
  status: string;
  firstAccessedAt?: string | null;
  simpleChangeEligible?: boolean;
  refundId?: string | null;
  refundStatus?: string | null;
  refundDecisionNote?: string | null;
  refundRequestedAt?: string | null;
  testEntitlement?: boolean;
};

const statusCopy: Record<string, { label: string; description: string; icon: typeof Clock; tone: string }> = {
  requested: { label: "환불 신청 완료", description: "신청 내용을 확인한 뒤 검토를 시작합니다.", icon: CheckCircle, tone: "requested" },
  reviewing: { label: "환불 검토 중", description: "결제·열람 기록과 신청 사유를 확인하고 있습니다.", icon: Clock, tone: "reviewing" },
  refunded: { label: "환불 완료", description: "결제 취소가 처리됐으며 전자책 열람 권한이 회수됐습니다.", icon: CheckCircle, tone: "refunded" },
  rejected: { label: "환불 불가", description: "신청 내용과 환불 조건을 검토한 결과 환불이 어렵습니다.", icon: XCircle, tone: "rejected" },
};

export default function RefundRequestForm({ order, onSubmitted }: { order: RefundableOrder; onSubmitted: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [reasonCode, setReasonCode] = useState(order.simpleChangeEligible ? "change_of_mind" : "file_issue");
  const [reasonDetail, setReasonDetail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (order.testEntitlement) return <span className="refund-test-note">테스트 열람 권한은 실제 결제가 아니므로 환불 대상이 아닙니다.</span>;

  const refundStatus = order.refundStatus || (order.status === "refunded" ? "refunded" : ["refund_processing", "refund_pending", "refund_review"].includes(order.status) ? "reviewing" : "");
  if (refundStatus && statusCopy[refundStatus]) {
    const state = statusCopy[refundStatus];
    const Icon = state.icon;
    return <div className={`refund-status-card ${state.tone}`} role="status"><Icon size={19} weight="fill" /><div><b>{state.label}</b><span>{state.description}</span>{order.refundDecisionNote && <small>{order.refundDecisionNote}</small>}</div></div>;
  }
  if (order.status !== "paid") return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/account/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, reasonCode, reasonDetail, policyConfirmed: confirmed }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) { setError(data.error ?? "환불 신청을 접수하지 못했습니다."); return; }
      await onSubmitted();
      setOpen(false);
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return <div className="refund-request-entry"><button type="button" onClick={() => setOpen(true)}><ArrowCounterClockwise />환불 신청하기</button><small>{order.simpleChangeEligible ? "아직 PDF를 열지 않았고 구매 후 7일 이내라면 단순 변심 신청이 가능합니다." : "단순 변심은 제한될 수 있지만 파일 결함·설명과 다른 상품은 신청할 수 있습니다."}</small></div>;

  return <form className="refund-request-form" onSubmit={submit}>
    <div className="refund-policy-box"><b>신청 전 확인해 주세요</b><ul><li>PDF를 열지 않은 구매는 구매 후 7일 이내 단순 변심 신청이 가능합니다.</li><li>PDF 열람이 시작되면 단순 변심 환불이 제한될 수 있습니다.</li><li>파일 결함이나 설명과 다른 상품은 별도 기준에 따라 검토합니다.</li><li>승인되면 결제가 취소되고 PDF 열람 권한이 회수됩니다.</li></ul><Link href="/refund" target="_blank">전체 환불정책 보기</Link></div>
    <label>환불 사유<select value={reasonCode} onChange={(event) => setReasonCode(event.target.value)}><option value="change_of_mind" disabled={!order.simpleChangeEligible}>단순 변심{!order.simpleChangeEligible ? " (현재 조건상 제한)" : ""}</option><option value="file_issue">PDF 파일 결함</option><option value="description_mismatch">상품 설명과 실제 내용이 다름</option><option value="service_unavailable">구매한 콘텐츠를 이용할 수 없음</option><option value="other">기타 사유</option></select></label>
    <label>상세 사유<textarea value={reasonDetail} onChange={(event) => setReasonDetail(event.target.value)} minLength={10} maxLength={1000} required placeholder="확인이 필요한 내용을 10자 이상 적어 주세요." /></label>
    <label className="refund-confirm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} required /><span>환불 조건과 처리 과정, 승인 시 열람 권한이 회수되는 점을 확인했습니다.</span></label>
    {error && <p className="refund-form-error" role="alert">{error}</p>}
    <div className="refund-form-actions"><button type="button" onClick={() => { setOpen(false); setError(""); }} disabled={loading}>취소</button><button type="submit" disabled={loading || !confirmed || reasonDetail.trim().length < 10}>{loading ? "신청 중…" : "환불 신청 접수"}</button></div>
  </form>;
}
