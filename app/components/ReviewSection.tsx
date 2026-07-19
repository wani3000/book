"use client";

import { FormEvent, useEffect, useState } from "react";

type ProductSlug = "codex" | "career";

type Review = {
  id: number;
  displayName: string;
  rating: number;
  content: string;
  createdAt: string;
};

export default function ReviewSection({ product, tone = "light" }: { product: ProductSlug; tone?: "light" | "navy" }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/reviews?product=${product}`)
      .then((response) => response.ok ? response.json() : { reviews: [] })
      .then((data) => setReviews(data.reviews ?? []))
      .finally(() => setLoading(false));
  }, [product]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        purchaseReference: form.get("purchaseReference"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "후기를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    event.currentTarget.reset();
    setMessage("후기가 접수되었습니다. 구매 확인 후 공개됩니다. 감사합니다.");
  }

  return (
    <section className={`reviews-section ${tone === "navy" ? "reviews-navy" : ""}`} id="reviews">
      <div className="page-width">
        <div className="reviews-heading">
          <div>
            <p className={`eyebrow ${tone === "navy" ? "light" : ""}`}><span /> 구매자 후기</p>
            <h2>광고 문구보다<br /><em>먼저 읽은 사람의 말.</em></h2>
          </div>
          <p>구매 내역이 확인된 후기만 공개합니다. 좋은 평가뿐 아니라 아쉬운 점도 제품 개선에 반영합니다.</p>
        </div>

        {loading ? (
          <div className="reviews-empty">구매자 후기를 불러오고 있습니다.</div>
        ) : reviews.length > 0 ? (
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
          <div className="reviews-empty honest-empty">
            <b>첫 구매자 후기를 기다리고 있습니다.</b>
            <p>아직 공개된 후기가 없습니다. 판매 시작 후 구매가 확인된 후기부터 이곳에 투명하게 공개합니다.</p>
          </div>
        )}

        <details className="review-form-shell">
          <summary>책을 구매하셨나요? 후기 남기기 <span>＋</span></summary>
          <form className="review-form" onSubmit={submitReview}>
            <label>표시 이름<input name="displayName" maxLength={30} placeholder="예: 3년차 프로덕트 디자이너" required /></label>
            <label>별점<select name="rating" defaultValue="5" required><option value="5">5점</option><option value="4">4점</option><option value="3">3점</option><option value="2">2점</option><option value="1">1점</option></select></label>
            <label className="wide">구매 번호<input name="purchaseReference" maxLength={100} placeholder="결제 영수증의 거래·주문 번호" required /></label>
            <label className="wide">후기<textarea name="content" minLength={20} maxLength={700} placeholder="구매 전 고민, 도움이 된 부분, 아쉬운 점을 적어주세요." required /></label>
            <p className="wide privacy-note">구매 번호는 확인에만 사용하며 공개하지 않습니다. 확인 전에는 사이트에 노출되지 않습니다.</p>
            <button className="button primary" type="submit">후기 제출하기 <span>→</span></button>
            <p className="form-message" role="status">{message}</p>
          </form>
        </details>
      </div>
    </section>
  );
}
