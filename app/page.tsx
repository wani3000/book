import Image from "next/image";
import Link from "next/link";
import PurchaseButton from "./components/PurchaseButton";
import ReviewSection from "./components/ReviewSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const purchaseUrl = process.env.NEXT_PUBLIC_CODEX_PURCHASE_URL || siteUrl;

const features = [
  ["01", "완전 초보자의 언어", "서버, DB, API, 배포, 커밋부터 일상어로 설명합니다."],
  ["02", "복사해서 시작하는 명령", "49개 장마다 첫 명령, 답변법, 후속 검증 명령을 제공합니다."],
  ["03", "출시 이후까지", "결제, SEO, 지도, 공유, 광고, Threads 자동화와 운영을 연결합니다."],
];

const curriculum = [
  { title: "시작", detail: "웹서비스 구조 · 폴더 · 터미널 · Git · GitHub" },
  { title: "제작", detail: "Codex 프롬프트 · Next.js · 화면 · 모바일 · 접근성" },
  { title: "기능", detail: "Supabase · 로그인 · 데이터 · 이미지 · 관리자" },
  { title: "출시", detail: "Vercel · 도메인 · 결제 · 지도 · 카카오톡" },
  { title: "성장", detail: "SEO · 검색 등록 · AdSense · Threads 자동화" },
  { title: "사업", detail: "첫 고객 · 자동화 · B2B · 매각까지의 실제 경험" },
];

const prompts = [
  "Codex에 그대로 입력하는 첫 명령 49개",
  "Codex가 되물었을 때 답하는 방법 49개",
  "테스트와 검증을 요청하는 후속 명령 49개",
  "실수와 비용을 막는 위험 명령 49개",
];

const faqs = [
  ["코딩을 전혀 몰라도 읽을 수 있나요?", "그 독자를 기준으로 썼습니다. 용어를 먼저 설명하고, Codex에 무엇을 어떻게 요청할지 순서대로 안내합니다."],
  ["프롬프트만 모아둔 책인가요?", "아닙니다. 폴더 생성부터 GitHub 기록, 배포, 회원, 결제, SEO, 자동화와 운영까지 하나의 흐름으로 연결합니다."],
  ["어떤 서비스를 사례로 사용하나요?", "모바일 청첩장 서비스 마리에카드와 부동산 계산·정보 서비스 아파트구구의 실제 제작·운영 경험을 사용합니다."],
  ["책을 읽으면 바로 수익이 나나요?", "특정 수익을 보장하지 않습니다. 대신 아이디어를 작동하는 서비스로 만들고 고객 반응을 검증하는 구체적인 실행 순서를 제공합니다."],
  ["파일 형식과 분량은 어떻게 되나요?", "A5 기준 253쪽 PDF 전자책이며, Codex 실전편 49장과 창업·운영 경험편 24장으로 구성했습니다."],
];

const schema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "아이디어를 서비스로 바꾸는 Codex 사용법",
  description: "IT 초보자가 Codex로 기획, 개발, 배포, 결제, SEO와 자동화까지 완성하는 253쪽 실전 전자책",
  brand: { "@type": "Brand", name: "필립" },
  offers: {
    "@type": "Offer",
    priceCurrency: "KRW",
    price: "19000",
    availability: "https://schema.org/InStock",
    url: purchaseUrl.startsWith("http") ? purchaseUrl : siteUrl,
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="nav-shell">
        <a className="brand" href="#top" aria-label="처음으로">
          <span className="brand-dot" /> PHILIP BOOKS
        </a>
        <nav aria-label="주요 메뉴">
          <a href="#inside">책 소개</a>
          <a href="#reviews">구매 후기</a>
          <Link href="/career">커리어북</Link>
          <Link href="/seonara">승무원→IT</Link>
          <a href="#faq">FAQ</a>
        </nav>
        <PurchaseButton product="codex" label="19,000원 구매" className="nav-cta" />
      </header>

      <section className="hero" id="top">
        <div className="hero-grid page-width">
          <div className="hero-copy">
            <p className="eyebrow"><span /> 비개발자를 위한 Codex 서비스 제작 실전서</p>
            <h1>아이디어를<br /><em>작동하는 서비스</em>로.</h1>
            <p className="hero-lead">개발자를 기다리지 마세요. 폴더 하나에서 시작해 GitHub, 배포, 회원, 결제, SEO와 자동화까지 Codex와 혼자 완성하는 순서를 담았습니다.</p>
            <div className="hero-actions">
              <PurchaseButton product="codex" label="전자책 구매하기" />
              <a className="button text-button" href="#preview">내용 미리보기</a>
            </div>
            <div className="hero-proof">
              <div><strong>253</strong><span>페이지</span></div>
              <div><strong>49</strong><span>실전 장</span></div>
              <div><strong>245</strong><span>워크북 블록</span></div>
              <div><strong>19,000</strong><span>원 · PDF</span></div>
            </div>
          </div>
          <div className="book-stage" aria-label="전자책 표지 미리보기">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="book-shadow" />
            <div className="book-cover">
              <Image src="/ebook-cover.png" alt="아이디어를 서비스로 바꾸는 Codex 사용법 전자책 표지" width={991} height={1406} priority />
            </div>
            <div className="floating-note note-a"><b>Goal</b><span>무엇을 만들까?</span></div>
            <div className="floating-note note-b"><b>Done</b><span>어떻게 확인할까?</span></div>
          </div>
        </div>
      </section>

      <section className="problem-strip">
        <div className="page-width problem-grid">
          <p>“AI가 코드는 만들어줬는데<br /><b>그다음은 뭘 해야 하지?</b>”</p>
          <ul>
            <li>코드를 어디에 넣는지 모르겠다</li>
            <li>커밋·푸시·배포에서 멈춘다</li>
            <li>회원·결제·검색까지 연결하지 못한다</li>
          </ul>
          <div className="answer">이 책은 바로 그<br /><strong>‘그다음’</strong>을 설명합니다.</div>
        </div>
      </section>

      <section className="section page-width" id="inside">
        <div className="section-heading">
          <p className="eyebrow"><span /> 이 책이 다른 이유</p>
          <h2>코드가 아니라<br />완성하는 <em>순서</em>를 팝니다.</h2>
          <p>단순 프롬프트 모음이 아닙니다. 비개발자가 서비스의 책임자로서 결정하고 확인해야 할 일을 실제 제작 경험 안에서 정리했습니다.</p>
        </div>
        <div className="feature-grid">
          {features.map(([number, title, description]) => (
            <article className="feature-card" key={number}>
              <span className="feature-number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section curriculum-section">
        <div className="page-width split-heading">
          <div>
            <p className="eyebrow light"><span /> 처음부터 운영까지</p>
            <h2>한 권으로 연결하는<br />서비스의 <em>전체 여정</em></h2>
          </div>
          <p>용어를 외우는 대신 각 단계에서 Codex에 무엇을 요청하고, 어떤 결과를 확인해야 하는지 따라갑니다.</p>
        </div>
        <div className="page-width curriculum-list">
          {curriculum.map((item, index) => (
            <div className="curriculum-row" key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <i>↗</i>
            </div>
          ))}
        </div>
      </section>

      <section className="section page-width" id="preview">
        <div className="preview-grid">
          <div className="prompt-panel">
            <div className="window-bar"><i /><i /><i /><span>codex-prompt.md</span></div>
            <p className="prompt-label">CODEX에 그대로 입력하세요</p>
            <p>“나는 IT 용어를 거의 모르는 비개발자야. 먼저 현재 폴더와 파일을 확인하고, 바로 코드를 만들지 말고 문제와 가설을 정리해줘.”</p>
            <div className="prompt-tags"><span>목표</span><span>맥락</span><span>제약</span><span>완료 조건</span></div>
          </div>
          <div className="preview-copy">
            <p className="eyebrow"><span /> 따라 쓰는 워크북</p>
            <h2>좋은 요청부터<br />안전한 검증까지.</h2>
            <ul className="check-list">
              {prompts.map((prompt) => <li key={prompt}><span>✓</span>{prompt}</li>)}
            </ul>
            <p className="caption">모든 장에서 초보자가 놓치기 쉬운 확인 항목까지 직접 체크합니다.</p>
          </div>
        </div>
      </section>

      <section className="case-section">
        <div className="page-width">
          <div className="section-heading compact">
            <p className="eyebrow"><span /> 실제 서비스에서 검증한 내용</p>
            <h2>성공 화면뿐 아니라<br /><em>실패와 수정</em>도 담았습니다.</h2>
          </div>
          <div className="case-grid">
            <article className="case-card marie">
              <span className="case-kicker">CASE 01 · MARIE CARD</span>
              <h3>마리에카드</h3>
              <p>모바일 청첩장의 제작·편집·발행, Google 로그인, 이미지 저장, 쿠폰과 SEO를 연결한 경험.</p>
              <div className="mini-ui"><span>초대장 편집</span><b>오늘의 초대장을<br />완성하세요.</b><button>미리보기</button></div>
            </article>
            <article className="case-card apt">
              <span className="case-kicker">CASE 02 · APART GUGU</span>
              <h3>아파트구구</h3>
              <p>구매 가능 금액, 대출·세금, 공공데이터, 지도, 광고와 Threads 자동발행을 운영한 경험.</p>
              <div className="chart"><i style={{height:"35%"}}/><i style={{height:"62%"}}/><i style={{height:"48%"}}/><i style={{height:"82%"}}/><i style={{height:"68%"}}/><i style={{height:"94%"}}/></div>
            </article>
          </div>
        </div>
      </section>

      <section className="section page-width author-section" id="author">
        <div className="author-mark">PHILIP<span>17</span></div>
        <div className="author-copy">
          <p className="eyebrow"><span /> 저자 필립</p>
          <h2>아이디어를 제품으로,<br />제품을 <em>결제</em>로 바꿔왔습니다.</h2>
          <p>시각디자인과 UX에서 출발해 스마트워치, 피트니스, 블록체인 스타트업을 거쳤습니다. 개발자와 유료 웹서비스를 만들고 운영해 매각했으며, 지금은 Codex로 마리에카드와 아파트구구를 직접 만들고 개선합니다.</p>
          <blockquote>“개발자가 아니어도 서비스의 책임자가 될 수 있습니다.”</blockquote>
        </div>
        <div className="timeline">
          <div><b>2015</b><span>첫 스타트업</span></div>
          <div><b>2020</b><span>유료 서비스 출시</span></div>
          <div><b>2021</b><span>서비스 매각</span></div>
          <div><b>NOW</b><span>Codex 솔로 빌더</span></div>
        </div>
      </section>

      <ReviewSection product="codex" />

      <section className="section faq-section" id="faq">
        <div className="page-width faq-grid">
          <div className="section-heading compact">
            <p className="eyebrow"><span /> 자주 묻는 질문</p>
            <h2>구매 전<br />확인하세요.</h2>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>{question}<span>＋</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="purchase-section" id="purchase">
        <div className="purchase-glow" />
        <div className="page-width purchase-grid">
          <div>
            <p className="eyebrow light"><span /> 지금 시작하세요</p>
            <h2>개발자를 기다리는 대신,<br /><em>오늘 첫 폴더</em>를 만드세요.</h2>
            <p>258쪽 PDF 전자책 · 구매 후 바로 읽기</p>
          </div>
          <div className="price-card">
            <span>전자책 단품</span>
            <strong><small>₩</small>19,000</strong>
            <ul><li>✓ PDF 전자책 258쪽</li><li>✓ 실전 워크북 블록 250개</li><li>✓ 출시 전 체크리스트·용어집</li></ul>
            <PurchaseButton product="codex" label="19,000원으로 구매하기" className="button primary full" />
            <p>디지털 콘텐츠 특성상 다운로드 후 환불 기준을 구매 페이지에서 확인해 주세요.</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="page-width footer-grid">
          <div className="brand"><span className="brand-dot" /> PHILIP BOOKS</div>
          <p>© 2026 필립. All rights reserved.</p>
          <div><Link href="/career">디자이너 커리어북</Link><Link href="/seonara">승무원→IT 커리어북</Link><a href="#purchase">구매하기</a></div>
        </div>
      </footer>
    </main>
  );
}
