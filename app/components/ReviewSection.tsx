"use client";

import { FormEvent, useEffect, useState } from "react";

type ProductSlug = "codex" | "career" | "jane";

type Review = {
  id: number;
  displayName: string;
  rating: number;
  content: string;
  createdAt: string;
};

type AccountOrder = { product: string; status: string; testEntitlement?: boolean };

export default function ReviewSection({ product, tone = "light" }: { product: ProductSlug; tone?: "light" | "navy" }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canSubmitReview, setCanSubmitReview] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?product=${product}`)
      .then((response) => response.ok ? response.json() : { reviews: [] })
      .then((data) => setReviews(data.reviews ?? []))
      .finally(() => setLoading(false));
  }, [product]);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { user: null })
      .then((session: { user?: unknown }) => session.user
        ? fetch("/api/account/orders", { cache: "no-store" }).then((response) => response.ok ? response.json() : { orders: [] })
        : { orders: [] })
      .then((data: { orders?: AccountOrder[] }) => {
        const ownsProduct = (data.orders ?? []).some((order) =>
          order.product === product && (order.status === "paid" || order.testEntitlement)
        );
        setCanSubmitReview(ownsProduct);
      })
      .catch(() => setCanSubmitReview(false));
  }, [product]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("확인 중입니다…");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        product,
        displayName: form.get("displayName"),
        rating: Number(form.get("rating")),
        content: form.get("content"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "후기를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
      return;
    }
    event.currentTarget.reset();
    setMessage("후기가 접수되었습니다. 구매 확인 후 공개됩니다. 감사합니다.");
    setSubmitting(false);
  }

  return (
    <section className={`reviews-section ${tone === "navy" ? "reviews-navy" : ""}`} id="reviews">
      <div className="page-width">
        <div className="reviews-heading">
          <div>
            <p className={`eyebrow ${tone === "navy" ? "light" : ""}`}><span /> 구매자 후기</p>
            <h2>광고 문구보다<br /><em>먼저 읽은 사람의 말.</em></h2>
          </div>
          <p>실제 구매 후기는 구매 내역 확인 후 공개합니다. 좋은 평가뿐 아니라 아쉬운 점도 제품 개선에 반영합니다.</p>
        </div>

        {loading ? (
          <div className="reviews-empty">구매자 후기를 불러오고 있습니다.</div>
        ) : reviews.length ? (
          <div className="review-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-stars" aria-label={`별점 ${review.rating}점`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                <blockquote>“{review.content}”</blockquote>
                <p><b>{review.displayName}</b><span>구매 인증</span></p>
              </article>
            ))}
          </div>
        ) : (
          <div className="reviews-empty honest-empty"><b>아직 공개된 구매 후기가 없습니다.</b><p>첫 구매 인증 후기가 등록되면 이곳에 공개됩니다.</p></div>
        )}

        {canSubmitReview && <section className="review-form-shell" aria-labelledby={`${product}-review-form-title`}>
          <h3 id={`${product}-review-form-title`}>책을 구매하셨나요? 후기 남기기</h3>
          <form className="review-form" onSubmit={submitReview}>
            <label>표시 이름<input name="displayName" maxLength={30} placeholder="예: 3년차 프로덕트 디자이너" required /></label>
            <label>별점<select name="rating" defaultValue="5" required><option value="5">5점</option><option value="4">4점</option><option value="3">3점</option><option value="2">2점</option><option value="1">1점</option></select></label>
            <label className="wide">후기<textarea name="content" minLength={20} maxLength={700} placeholder="구매 전 고민, 도움이 된 부분, 아쉬운 점을 적어주세요." required /></label>
            <p className="wide privacy-note">로그인한 계정의 실제 구매 내역과 자동 연결됩니다. 상품별 후기는 한 번 작성할 수 있으며 다시 제출하면 기존 후기가 수정됩니다.</p>
            <button className="button primary" type="submit" disabled={submitting}>{submitting ? "후기 저장 중" : "후기 제출하기"} <span>→</span></button>
            <p className="form-message" role="status">{message}</p>
          </form>
        </section>}
      </div>
    </section>
  );
}
