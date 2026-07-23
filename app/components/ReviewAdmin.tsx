"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatCircleText, CheckCircle, Clock, ShieldCheck, XCircle } from "@phosphor-icons/react";
import { redirectForAdminReauthentication } from "./adminReauthentication";

type Review = {
  id: number;
  product: string;
  displayName: string;
  rating: number;
  content: string;
  purchaseReference: string;
  purchaseVerified: number;
  status: string;
  createdAt: string;
};

const productNames: Record<string, string> = {
  codex: "아이디어를 서비스로 바꾸는 Codex 사용법",
  career: "커리어도 디자인할 수 있습니다",
  jane: "승무원 다음은 IT였습니다",
};

export default function ReviewAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/reviews", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "후기 목록을 불러오지 못했습니다.");
    else { setReviews(data.reviews ?? []); setError(""); }
    setLoading(false);
  }, []);

  useEffect(() => { const initialLoad = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(initialLoad); }, [load]);

  const visible = useMemo(() => reviews.filter((review) => filter === "all" || review.status === filter), [filter, reviews]);

  async function updateReview(review: Review, action: "approve" | "reject") {
    const reason = action === "reject" ? window.prompt("비공개 사유를 입력해 주세요. 기록에 남습니다.", "운영 정책에 맞지 않는 내용") : "";
    if (action === "reject" && !reason) return;
    if (action === "approve" && !window.confirm("자동 연결된 구매 내역을 확인하고 이 후기를 공개할까요?")) return;
    const response = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId: review.id, action, reason }),
    });
    const data = await response.json();
    if (await redirectForAdminReauthentication(data)) return;
    if (!response.ok) { setError(data.error ?? "후기를 처리하지 못했습니다."); return; }
    await load();
  }

  if (loading) return <div className="admin-state">후기 목록을 불러오고 있습니다.</div>;
  if (error && !reviews.length) return <div className="admin-state"><ShieldCheck size={38} /><h1>후기 관리에 접근할 수 없습니다.</h1><p>{error}</p><Link href="/mypage">마이페이지로 돌아가기</Link></div>;

  const pendingCount = reviews.filter((review) => review.status === "pending").length;
  const approvedCount = reviews.filter((review) => review.status === "approved" && review.purchaseVerified === 1).length;

  return <div className="admin-members admin-reviews">
    <section className="admin-title"><p>REVIEW ADMIN</p><h1>구매 후기 관리</h1><span>로그인 회원의 실제 주문과 자동 연결된 후기만 검토합니다.</span></section>
    <section className="admin-summary"><article><ChatCircleText /><span>전체 후기</span><strong>{reviews.length}</strong></article><article><Clock /><span>확인 대기</span><strong>{pendingCount}</strong></article><article><CheckCircle /><span>구매 인증 공개</span><strong>{approvedCount}</strong></article></section>
    <section className="admin-toolbar"><nav className="admin-links"><Link href="/admin/members">회원</Link><Link className="active" href="/admin/reviews">후기</Link><Link href="/admin/refunds">환불</Link></nav><select aria-label="후기 상태" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="pending">확인 대기</option><option value="approved">공개</option><option value="rejected">비공개</option><option value="all">전체</option></select></section>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <section className="admin-review-list">{visible.map((review) => <article key={review.id}>
      <header><div><b>{productNames[review.product] ?? review.product}</b><span>{review.displayName} · 별점 {review.rating}점 · {new Date(review.createdAt).toLocaleDateString("ko-KR")}</span></div><i className={`member-status ${review.status === "approved" ? "active" : review.status === "rejected" ? "deleted" : "suspended"}`}>{review.status === "approved" ? "공개" : review.status === "rejected" ? "비공개" : "확인 대기"}</i></header>
      <blockquote>“{review.content}”</blockquote><p>구매 번호 <code>{review.purchaseReference}</code></p>
      <footer><button onClick={() => updateReview(review, "approve")} disabled={review.status === "approved"}><CheckCircle />구매 확인 후 공개</button><button onClick={() => updateReview(review, "reject")} disabled={review.status === "rejected"}><XCircle />비공개</button></footer>
    </article>)}{!visible.length && <div className="admin-empty">조건에 맞는 후기가 없습니다.</div>}</section>
  </div>;
}
