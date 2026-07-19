import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PurchaseButton from "../components/PurchaseButton";
import ReviewSection from "../components/ReviewSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "커리어도 디자인할 수 있습니다 | UI/UX 디자이너 커리어북",
  description: "스타트업 창업, 해외 프로젝트, 대기업 이직을 경험한 10년차 UI/UX 디자이너 필립의 실전 커리어 가이드.",
  alternates: { canonical: "/career" },
  openGraph: {
    title: "커리어도 디자인할 수 있습니다",
    description: "화면을 넘어 경력을 설계하는 UI/UX 디자이너의 20가지 방법.",
    url: "/career",
    images: [{ url: "/career-cover.png", width: 933, height: 1323, alt: "커리어도 디자인할 수 있습니다 표지" }],
  },
};

const parts = [
  ["PART 01", "첫 경력은 회사가 아니라 경험으로 만든다", "휴학, 작은 팀, 해커톤, 창업과 제품 실패를 커리어의 증거로 바꾸는 법"],
  ["PART 02", "화면 밖으로 나가는 디자이너", "현장 관찰, 비즈니스, 낯선 산업, 첫 디자이너와 출시 이후의 운영"],
  ["PART 03", "해외와 큰 조직으로 이동하는 법", "글로벌 협업, 대기업 언어, 포트폴리오, 과제 전형과 조직 적응"],
  ["PART 04", "오래 일하는 디자이너의 운영법", "협업, 성과 기록, 사이드 프로젝트, AI 제작과 다음 10년 설계"],
];

const proof = [
  ["10년", "UI/UX 실무 경험"],
  ["20장", "경험 기반 커리어 원칙"],
  ["30일", "커리어 리디자인 워크북"],
  ["₩19,000", "PDF 전자책"],
];

const portfolioPoints = [
  "모바일 청첩장을 기획·디자인·마케팅·운영한 전 과정",
  "개인 서비스를 포트폴리오에 넣어 대기업 이직에 활용한 방법",
  "AI로 여러 서비스를 직접 구현·검수·배포한 경험의 설명법",
  "지원 회사마다 포트폴리오의 순서와 증거를 다시 짜는 기준",
];

const faqs = [
  ["신입 디자이너도 읽을 수 있나요?", "첫 프로젝트를 구하는 방법부터 다룹니다. 학교 과제를 실제 출시 경험으로 확장하고 싶은 예비·신입 디자이너에게 특히 적합합니다."],
  ["경력 디자이너에게도 도움이 되나요?", "스타트업 경력을 대기업의 언어로 번역하고 포트폴리오·과제·면접을 준비하는 실전 구조를 담았습니다."],
  ["UI 디자인 방법을 가르치는 책인가요?", "툴 튜토리얼보다 커리어 관리에 집중합니다. 현장 관찰, 비즈니스, 협업, 성과 기록, 이직과 해외 협업을 다룹니다."],
  ["AI로 서비스를 만드는 내용도 있나요?", "AI 코딩 도구를 이용해 요구사항을 전달하고, 오류를 수정하고, 테스트·배포한 경험을 이직 자산으로 정리하는 방법이 포함됩니다."],
  ["구매자 후기는 어떻게 관리하나요?", "구매 번호를 확인한 후기만 공개합니다. 확인되지 않은 후기나 임의로 만든 추천 문구는 게시하지 않습니다."],
];

const schema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "커리어도 디자인할 수 있습니다",
  description: "UI/UX 디자이너의 커리어 관리, 해외 협업, 대기업 이직, 포트폴리오와 AI 제작 경험을 담은 전자책",
  image: `${siteUrl}/career-cover.png`,
  brand: { "@type": "Brand", name: "필립" },
  offers: { "@type": "Offer", priceCurrency: "KRW", price: "19000", availability: "https://schema.org/InStock", url: `${siteUrl}/career` },
};

export default function CareerBookPage() {
  return (
    <main className="career-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="nav-shell career-nav">
        <Link className="brand" href="/" aria-label="필립의 전자책 목록"><span className="brand-dot" /> PHILIP BOOKS</Link>
        <nav aria-label="주요 메뉴">
          <a href="#inside">책 소개</a>
          <a href="#portfolio">이직 포트폴리오</a>
          <a href="#reviews">구매 후기</a>
          <Link href="/seonara">승무원→IT 책</Link>
          <Link href="/codex">Codex 책</Link>
        </nav>
        <PurchaseButton product="career" label="19,000원 구매" className="nav-cta career-nav-cta" />
      </header>

      <section className="career-hero" id="top">
        <div className="page-width career-hero-grid">
          <div className="career-hero-copy">
            <p className="career-kicker">10-YEAR UI/UX CAREER PLAYBOOK</p>
            <h1>좋은 화면 다음엔,<br /><em>좋은 커리어</em>가 필요합니다.</h1>
            <p>작은 팀에서 시작해 미국 현장 조사, 해외 스타트업, 개인 서비스 운영과 대기업 이직까지. 필립이 실제로 해온 선택과 시행착오를 UI/UX 디자이너의 언어로 정리했습니다.</p>
            <div className="hero-actions">
              <PurchaseButton product="career" label="전자책 구매하기" className="button career-primary" />
              <a className="button text-button" href="#inside">목차 먼저 보기</a>
            </div>
            <div className="career-proof">
              {proof.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
            </div>
          </div>
          <div className="career-book-stage">
            <div className="career-path" />
            <div className="career-book-cover"><Image src="/career-cover.png" width={933} height={1323} alt="커리어도 디자인할 수 있습니다 전자책 표지" priority /></div>
            <div className="career-badge badge-start"><b>START</b><span>작은 팀</span></div>
            <div className="career-badge badge-next"><b>NEXT</b><span>대기업 이직</span></div>
          </div>
        </div>
      </section>

      <section className="career-question">
        <div className="page-width career-question-grid">
          <h2>“열심히 디자인하는데,<br />왜 다음 경력은 보이지 않을까?”</h2>
          <p>툴은 빨리 바뀌지만 경력은 저절로 쌓이지 않습니다. 어떤 프로젝트를 고르고, 무엇을 기록하고, 지원 회사에 어떻게 번역할지 알아야 합니다.</p>
          <a href="#inside">20가지 커리어 원칙 보기 <span>↓</span></a>
        </div>
      </section>

      <section className="career-section page-width" id="inside">
        <div className="career-section-heading">
          <p className="career-kicker">FROM EXPERIENCE TO EVIDENCE</p>
          <h2>경험을 쌓는 것에서<br /><em>증거를 설계하는 것</em>으로.</h2>
          <p>성공담만 모으지 않았습니다. 스마트워치 제품 실패, 첫 디자이너의 외로움, 큰 조직의 분업에 적응한 과정까지 다음 행동으로 바꿨습니다.</p>
        </div>
        <div className="career-parts">
          {parts.map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span><h3>{title}</h3><p>{description}</p><i>↗</i>
            </article>
          ))}
        </div>
      </section>

      <section className="career-portfolio" id="portfolio">
        <div className="page-width career-portfolio-grid">
          <div>
            <p className="career-kicker">PORTFOLIO THAT MOVES YOUR CAREER</p>
            <h2>회사 작업만으로<br />나를 설명하지 마세요.</h2>
            <p>필립은 직접 만든 모바일 청첩장을 이직 포트폴리오에 넣었습니다. 기획·디자인뿐 아니라 마케팅, 결제, 고객 문의, 운영과 매각까지 경험한 프로젝트는 제품의 결과를 책임진 증거가 됐습니다.</p>
            <ul>{portfolioPoints.map((point) => <li key={point}><span>✓</span>{point}</li>)}</ul>
          </div>
          <div className="career-evidence-card">
            <span>CASE STUDY STRUCTURE</span>
            <ol>
              <li><b>01</b><p><strong>발견</strong>실제 사용자의 불편</p></li>
              <li><b>02</b><p><strong>선택</strong>첫 버전과 버린 기능</p></li>
              <li><b>03</b><p><strong>제작</strong>내 책임과 협업 범위</p></li>
              <li><b>04</b><p><strong>판매</strong>메시지와 유입 채널</p></li>
              <li><b>05</b><p><strong>운영</strong>문의와 제품 개선</p></li>
              <li><b>06</b><p><strong>결과</strong>결제·사용·매각의 증거</p></li>
            </ol>
          </div>
        </div>
      </section>

      <section className="career-ai page-width">
        <div className="career-ai-grid">
          <div className="ai-window"><div><i /><i /><i /><span>AI PRODUCT BUILD LOG</span></div><p><b>YOU</b> 정상·빈 화면·오류 상태를 모두 구현하고 모바일에서 테스트해줘.</p><p><b>AI</b> 구현 계획을 먼저 정리하고 단계별 검증 결과를 보고하겠습니다.</p><small>문제 정의 → 요구사항 → 구현 → 검수 → 배포 → 개선</small></div>
          <div>
            <p className="career-kicker">AI-NATIVE DESIGNER</p>
            <h2>AI를 썼다는 말보다<br /><em>무엇을 출시했는지.</em></h2>
            <p>AI로 여러 서비스를 직접 만든 경험을 이직 자산으로 바꾸는 법을 다룹니다. 도구 이름이 아니라 요구사항, 검수, 배포와 사용자 반응으로 실행력을 증명합니다.</p>
          </div>
        </div>
      </section>

      <ReviewSection product="career" tone="navy" />

      <section className="career-faq page-width" id="faq">
        <div><p className="career-kicker">BEFORE YOU BUY</p><h2>구매 전<br />확인하세요.</h2></div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span>＋</span></summary><p>{answer}</p></details>)}
        </div>
      </section>

      <section className="career-purchase" id="purchase">
        <div className="page-width career-purchase-grid">
          <div><p className="career-kicker">DESIGN YOUR NEXT MOVE</p><h2>다음 회사를 기다리지 말고,<br />다음 <em>증거</em>를 만드세요.</h2><p>PDF 63쪽 · 20장 · 30일 워크북 · 필립 지음</p></div>
          <div className="career-price-card">
            <span>UI/UX 디자이너 커리어북</span><strong><small>₩</small>19,000</strong>
            <ul><li>✓ 전체 전자책 PDF</li><li>✓ 포트폴리오 편집 체크리스트</li><li>✓ 해외 협업·면접 답변 구조</li><li>✓ 30일 커리어 리디자인 워크북</li></ul>
            <PurchaseButton product="career" label="19,000원으로 구매하기" className="button career-primary full" />
            <p>결제 및 디지털 콘텐츠 환불 기준은 체크아웃에서 확인할 수 있습니다.</p>
          </div>
        </div>
      </section>

      <footer className="career-footer"><div className="page-width footer-grid"><Link className="brand" href="/"><span className="brand-dot" /> PHILIP BOOKS</Link><p>© 2026 필립. All rights reserved.</p><div><Link href="/">전체 전자책</Link><Link href="/codex">Codex 책</Link><Link href="/seonara">승무원→IT 책</Link><a href="#purchase">구매하기</a></div></div></footer>
    </main>
  );
}
