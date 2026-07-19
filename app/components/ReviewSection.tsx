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

const sampleReviews: Record<ProductSlug, Array<{ id: number; displayName: string; rating: number; content: string }>> = {
  codex: [
    { id: -1, displayName: "비개발자 예비 창업자", rating: 5, content: "AI가 코드를 만든 뒤 무엇을 해야 할지 막막했는데, 커밋·푸시·배포를 일상어로 이어서 이해할 수 있었어요." },
    { id: -2, displayName: "혼자 서비스를 준비하는 직장인", rating: 5, content: "프롬프트만 모은 책이 아니라 로그인, 데이터, 결제, SEO까지 하나의 출시 순서로 연결해준 점이 좋았습니다." },
    { id: -3, displayName: "바이브 코딩 입문자", rating: 4, content: "Codex에 무엇을 요청하고 결과를 어떻게 검증해야 하는지 예문이 있어 첫 프로젝트의 시행착오를 줄이는 데 도움이 될 것 같아요." },
  ],
  career: [
    { id: -11, displayName: "3년차 프로덕트 디자이너", rating: 5, content: "스타트업에서 이것저것 했다는 경력을 대기업이 이해하는 상황·책임·행동·결과의 언어로 바꾸는 부분이 특히 실용적이었어요." },
    { id: -12, displayName: "이직을 준비하는 UI 디자이너", rating: 5, content: "회사 작업만 넣어야 한다고 생각했는데, 직접 만든 서비스를 기획·마케팅·운영한 경험도 강한 포트폴리오가 될 수 있다는 관점이 좋았습니다." },
    { id: -13, displayName: "AI를 공부하는 UX 디자이너", rating: 4, content: "AI 도구 이름을 나열하는 대신 직접 구현하고 검수하고 배포한 결과로 설명하라는 기준이 지금 이직 준비에 잘 맞는다고 느꼈어요." },
  ],
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

  const displayedReviews = [
    ...reviews.map((review) => ({ ...review, sample: false })),
    ...sampleReviews[product].map((review) => ({ ...review, createdAt: "", sample: true })),
  ];

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

        <p className="sample-review-notice"><b>안내</b> 현재 표시된 예시 후기는 페이지 구성을 위한 가상 독자 반응이며 실제 구매자가 작성한 후기가 아닙니다.</p>

        {loading ? (
          <div className="reviews-empty">구매자 후기를 불러오고 있습니다.</div>
        ) : (
          <div className="review-grid">
            {displayedReviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-stars" aria-label={`별점 ${review.rating}점`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                <blockquote>“{review.content}”</blockquote>
                <p><b>{review.displayName}</b><span className={review.sample ? "sample-badge" : ""}>{review.sample ? "예시 후기 · 실제 구매자 아님" : "구매 인증"}</span></p>
              </article>
            ))}
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
