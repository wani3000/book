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

type ExampleReview = Omit<Review, "id" | "createdAt">;
type AccountOrder = { product: string; status: string; testEntitlement?: boolean };

const exampleReviews: Record<ProductSlug, ExampleReview[]> = {
  codex: [
    { displayName: "사이드 프로젝트를 시작한 기획자", rating: 5, content: "아이디어만 적어두고 미루던 서비스가 있었는데, 책의 순서대로 따라가니 첫 화면부터 테스트 가능한 결과물까지 연결할 수 있었습니다." },
    { displayName: "비개발 직군 4년 차", rating: 5, content: "코드를 외우게 하기보다 결과를 확인하고 수정 요청하는 법을 알려줘서 부담이 적었습니다. 막연했던 Codex 활용법이 구체적으로 잡혔어요." },
    { displayName: "1인 브랜드 운영자", rating: 4, content: "작은 랜딩페이지를 직접 고쳐야 할 때 무엇부터 확인해야 하는지 알게 됐습니다. 실습 예시가 조금 더 많았다면 더 좋았을 것 같아요." },
    { displayName: "서비스 운영 담당자", rating: 5, content: "개발자에게 전달할 요구사항을 훨씬 명확하게 쓰게 됐습니다. 결과 화면을 보고 다음 지시를 만드는 과정이 특히 실무적이었습니다." },
    { displayName: "예비 창업자", rating: 5, content: "완벽한 기획서를 만들기 전에 작게 구현하고 검증하는 흐름을 익혔습니다. 혼자서도 첫 버전을 만들 수 있다는 자신감이 생겼어요." },
  ],
  career: [
    { displayName: "이직을 준비하는 디자이너", rating: 5, content: "흩어져 있던 프로젝트를 단순히 나열하지 않고, 문제와 판단의 흐름으로 정리하는 방법이 가장 도움이 됐습니다." },
    { displayName: "스타트업 프로덕트 디자이너", rating: 5, content: "작은 팀에서 했던 잡다한 업무가 약점이라고 생각했는데, 오히려 협업과 실행력을 보여주는 근거가 될 수 있다는 관점이 좋았습니다." },
    { displayName: "포트폴리오를 다시 만드는 중", rating: 4, content: "문장을 덜어내고 결과보다 의사결정을 보여주라는 조언이 명확했습니다. 제 사례에 적용하려면 한 번 더 읽어봐야 할 것 같아요." },
    { displayName: "주니어 UX 디자이너", rating: 5, content: "경력기술서와 포트폴리오가 따로 놀았는데 책을 따라 정리하니 하나의 이야기로 연결됐습니다. 면접 답변 준비에도 유용했어요." },
    { displayName: "커리어 전환 준비생", rating: 5, content: "지금까지 한 일을 버리고 새로 시작해야 한다는 불안이 줄었습니다. 경험을 다음 직무의 언어로 바꾸는 기준이 생겼습니다." },
  ],
  jane: [
    { displayName: "서비스 직군에서 전환 준비 중", rating: 5, content: "승무원 경험을 IT와 연결할 수 있을지 막막했는데, 고객 대응과 운영 경험을 직무 역량으로 번역하는 방식이 구체적이었습니다." },
    { displayName: "항공사 근무 6년 차", rating: 5, content: "퇴사를 권하는 이야기가 아니라 지금 가진 경험을 먼저 해석해 주는 책이라 좋았습니다. 현실적인 전환 순서가 특히 도움이 됐어요." },
    { displayName: "IT 운영 직무 지원자", rating: 4, content: "지원서에 서비스 경험만 반복해서 적었는데 문제 해결과 협업 사례로 다시 정리할 수 있었습니다. 직무별 예시가 더 많으면 좋겠어요." },
    { displayName: "두 번째 커리어를 고민하는 직장인", rating: 5, content: "완전히 다른 일을 시작한다고 생각했지만, 실제로는 이미 가진 강점을 새로운 환경에 옮기는 과정이라는 말이 오래 남았습니다." },
    { displayName: "프로젝트 매니저 준비생", rating: 5, content: "현장에서 동시에 여러 상황을 조율했던 경험이 프로젝트 운영 역량이 될 수 있다는 점을 이해했습니다. 면접 사례도 훨씬 선명해졌어요." },
  ],
};

export default function ReviewSection({ product, tone = "light" }: { product: ProductSlug; tone?: "light" | "navy" }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canSubmitReview, setCanSubmitReview] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/reviews?product=${product}`)
      .then((response) => response.ok ? response.json() : { reviews: [] })
      .then((data) => setReviews(data.reviews ?? []))
      .finally(() => setLoading(false));
  }, [product]);

  useEffect(() => {
    fetch("/api/account/orders", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { orders: [] })
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

        <div className="sample-review-notice"><b>참고용</b><span>아래 내용은 후기 형식을 보여주기 위해 작성한 예시이며 실제 구매자의 후기가 아닙니다.</span></div>
        <div className="review-grid sample-review-grid">
          {exampleReviews[product].map((review) => (
            <article className="review-card" key={`${product}-${review.displayName}`}>
              <div className="review-stars" aria-label={`예시 별점 ${review.rating}점`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
              <blockquote>“{review.content}”</blockquote>
              <p><b>{review.displayName}</b><span className="sample-badge">참고용</span></p>
            </article>
          ))}
        </div>

        {canSubmitReview && <section className="review-form-shell" aria-labelledby={`${product}-review-form-title`}>
          <h3 id={`${product}-review-form-title`}>책을 구매하셨나요? 후기 남기기</h3>
          <form className="review-form" onSubmit={submitReview}>
            <label>표시 이름<input name="displayName" maxLength={30} placeholder="예: 3년차 프로덕트 디자이너" required /></label>
            <label>별점<select name="rating" defaultValue="5" required><option value="5">5점</option><option value="4">4점</option><option value="3">3점</option><option value="2">2점</option><option value="1">1점</option></select></label>
            <label className="wide">구매 번호<input name="purchaseReference" maxLength={100} placeholder="결제 영수증의 거래·주문 번호" required /></label>
            <label className="wide">후기<textarea name="content" minLength={20} maxLength={700} placeholder="구매 전 고민, 도움이 된 부분, 아쉬운 점을 적어주세요." required /></label>
            <p className="wide privacy-note">구매 번호는 확인에만 사용하며 공개하지 않습니다. 확인 전에는 사이트에 노출되지 않습니다.</p>
            <button className="button primary" type="submit">후기 제출하기 <span>→</span></button>
            <p className="form-message" role="status">{message}</p>
          </form>
        </section>}
      </div>
    </section>
  );
}
