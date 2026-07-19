import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PurchaseButton from "../components/PurchaseButton";
import ReviewSection from "../components/ReviewSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "승무원 다음은 IT였습니다 | 서나라 커리어 전환 전자책",
  description: "연기 전공자가 대한항공 객실승무원을 거쳐 위시켓 프로젝트 운영 매니저로 이직한 실제 커리어 전환 방법.",
  keywords: ["승무원 이직", "비전공 승무원", "서비스 운영", "CX 커리어", "위시켓", "서나라"],
  alternates: { canonical: "/seonara" },
  openGraph: {
    title: "승무원 다음은 IT였습니다",
    description: "전공과 이전 직업을 버리지 않고 다음 직무의 증거로 바꾸는 커리어 전환 실전서.",
    url: "/seonara",
    images: [{ url: "/seonara-og.png", width: 1728, height: 909, alt: "승무원 다음은 IT였습니다 커리어 전환 전자책" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "승무원 다음은 IT였습니다",
    description: "객실승무원의 현장 경험을 IT 프로젝트 운영 역량으로 번역한 실제 방법.",
    images: ["/seonara-og.png"],
  },
};

const proof = [
  ["22장", "실제 커리어 전환 과정"],
  ["56쪽", "표와 워크시트가 포함된 PDF"],
  ["2번", "승무원 이후 IT 이직"],
  ["₩19,000", "전자책 가격"],
];

const journey = [
  ["01", "연기 전공", "관찰·표현·반복 훈련을 직무 역량으로 해석합니다."],
  ["02", "1인 쇼핑몰", "상품·콘텐츠·CS·정산까지 운영한 오너십을 찾습니다."],
  ["03", "방송과 아나운서", "정보 구조화와 실시간 대응을 증거로 바꿉니다."],
  ["04", "대한항공", "안전·고객·다조직 협업을 서비스 운영 언어로 번역합니다."],
  ["05", "교육 서비스", "결제·배정·VOC·프로세스 개선의 실무를 쌓습니다."],
  ["06", "위시켓", "프로젝트 전 과정과 계약·데이터를 운영합니다."],
];

const parts = [
  ["PART 01", "경력은 직선이 아니었다", "연기, 쇼핑몰, 모델, 방송 경험에서 다음 직무가 원하는 행동을 찾습니다."],
  ["PART 02", "비전공자로 객실승무원이 되다", "흩어진 경험을 안전·서비스·협업 역량으로 번역해 합격 근거를 만듭니다."],
  ["PART 03", "승무원 경력을 IT 언어로 바꾸다", "월급쟁이부자들과 위시켓에서 고객 여정과 프로젝트 운영 실무를 쌓습니다."],
  ["PART 04", "제한 없는 커리어를 만드는 실전법", "이력서, 면접, STAR 사례와 30일 실행표로 다음 이동을 준비합니다."],
];

const operationSteps = [
  ["모집", "지원 현황과 지연 프로젝트 확인"],
  ["미팅", "신청·취소·일정 조율"],
  ["계약", "작성·수정·비교·이력 관리"],
  ["진행", "병목과 우선 업무 판단"],
  ["종료", "완료 상태와 후속 절차 확인"],
];

const faqs = [
  ["항공서비스 전공이 아니어도 도움이 되나요?", "네. 연기·쇼핑몰·방송처럼 서로 달라 보이는 경험을 객실승무원 역량으로 번역하는 과정을 단계별로 보여줍니다."],
  ["현재 승무원인데 IT 이직을 준비해도 될까요?", "객실의 안전·고객·이슈 대응·협업 경험을 CX, 서비스 운영과 프로젝트 운영의 언어로 바꾸는 방법을 다룹니다."],
  ["위시켓에서 실제로 하는 일도 들어 있나요?", "모집부터 미팅, 계약, 진행과 종료까지 프로젝트 전 과정 관리와 데이터를 활용한 업무 판단을 구체적으로 설명합니다."],
  ["AI 활용 경험도 포함되나요?", "Codex를 이용해 프로젝트 현황과 병목을 확인하는 HTML 대시보드를 직접 만든 과정과 포트폴리오 작성법이 포함됩니다."],
  ["취업이나 합격을 보장하나요?", "아닙니다. 실제 경험을 과장하지 않고 증거로 정리하는 방법을 제공합니다. 채용 결과와 수익을 보장하지 않습니다."],
];

const schema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "승무원 다음은 IT였습니다",
  description: "연기 전공자가 대한항공 객실승무원을 거쳐 IT 프로젝트 운영 매니저로 이직한 경험을 담은 전자책",
  image: `${siteUrl}/seonara-cover.png`,
  brand: { "@type": "Brand", name: "서나라" },
  offers: { "@type": "Offer", priceCurrency: "KRW", price: "19000", availability: "https://schema.org/InStock", url: `${siteUrl}/seonara` },
};

export default function SeoNaraBookPage() {
  return (
    <main className="seonara-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="nav-shell seonara-nav">
        <Link className="brand" href="/" aria-label="전자책 목록"><span className="brand-dot" /> PHILIP BOOKS</Link>
        <nav aria-label="주요 메뉴">
          <a href="#journey">커리어 여정</a>
          <a href="#inside">책 소개</a>
          <a href="#reviews">구매 후기</a>
          <Link href="/career">디자이너 커리어북</Link>
          <Link href="/codex">Codex 책</Link>
        </nav>
        <PurchaseButton product="seonara" label="19,000원 구매" className="nav-cta seonara-nav-cta" />
      </header>

      <section className="seonara-hero" id="top">
        <div className="page-width seonara-hero-grid">
          <div className="seonara-hero-copy">
            <p className="seonara-kicker">CAREER TRANSITION PLAYBOOK</p>
            <h1>경력은 바뀌어도,<br /><em>내 경험은 사라지지 않습니다.</em></h1>
            <p>연기 전공에서 의류 쇼핑몰과 방송, 대한항공 객실승무원을 거쳐 위시켓 프로젝트 운영 매니저까지. 서로 달라 보이는 경험을 다음 직무가 원하는 증거로 바꾼 실제 방법을 담았습니다.</p>
            <div className="hero-actions">
              <PurchaseButton product="seonara" label="전자책 구매하기" className="button seonara-primary" />
              <a className="button text-button" href="#inside">목차 먼저 보기</a>
            </div>
            <div className="seonara-proof">
              {proof.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
            </div>
          </div>
          <div className="seonara-book-stage" aria-label="전자책 표지와 커리어 전환 경로">
            <div className="seonara-route route-one" />
            <div className="seonara-route route-two" />
            <div className="seonara-book-cover"><Image src="/seonara-cover.png" width={1007} height={1429} alt="승무원 다음은 IT였습니다 전자책 표지" priority /></div>
            <div className="seonara-marker marker-flight"><b>FLIGHT</b><span>대한항공</span></div>
            <div className="seonara-marker marker-platform"><b>PLATFORM</b><span>위시켓</span></div>
          </div>
        </div>
      </section>

      <section className="seonara-thesis">
        <div className="page-width seonara-thesis-grid">
          <p>비전공자도 승무원이 될 수 있고,<br /><b>승무원도 IT로 이직할 수 있습니다.</b></p>
          <div><span>한계를 없애는 방법</span><strong>경험을 버리는 것이 아니라<br />다음 회사의 언어로 번역하는 것.</strong></div>
        </div>
      </section>

      <section className="seonara-journey page-width" id="journey">
        <div className="seonara-section-heading">
          <p className="seonara-kicker">ONE CAREER, SIX CHAPTERS</p>
          <h2>직함은 달랐지만,<br /><em>계속 같은 일을 해왔습니다.</em></h2>
          <p>사람을 관찰하고 필요한 정보를 전달하며, 문제가 생기면 여러 사람을 연결해 끝까지 해결했습니다.</p>
        </div>
        <div className="seonara-journey-list">
          {journey.map(([number, title, description]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{description}</p><i>→</i></article>)}
        </div>
      </section>

      <section className="seonara-inside" id="inside">
        <div className="page-width">
          <div className="seonara-section-heading light">
            <p className="seonara-kicker">WHAT IS INSIDE</p>
            <h2>성공담보다<br /><em>다음 행동을 만드는 책.</em></h2>
          </div>
          <div className="seonara-parts">
            {parts.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="seonara-operation page-width">
        <div>
          <p className="seonara-kicker">PROJECT OPERATIONS</p>
          <h2>응대를 넘어,<br /><em>프로젝트 전체를 운영합니다.</em></h2>
          <p>위시켓에서 고객·파트너·내부 담당자 사이를 연결하며 프로젝트가 다음 단계로 움직이게 합니다. 기존 시스템을 활용한 업무와 직접 만든 결과물을 구분해 정직하게 설명하는 법도 담았습니다.</p>
        </div>
        <div className="operation-flow">
          {operationSteps.map(([step, detail], index) => <div key={step}><b>{String(index + 1).padStart(2, "0")}</b><span><strong>{step}</strong>{detail}</span></div>)}
        </div>
      </section>

      <section className="seonara-codex">
        <div className="page-width seonara-codex-grid">
          <div className="dashboard-card">
            <div className="dashboard-bar"><i /><i /><i /><span>PROJECT OPERATIONS DASHBOARD</span></div>
            <div className="dashboard-metrics"><div><span>진행 프로젝트</span><b>STATUS</b></div><div><span>미팅 신청·취소</span><b>MEETING</b></div><div><span>병목 확인</span><b>PRIORITY</b></div></div>
            <div className="dashboard-chart"><i /><i /><i /><i /><i /><i /></div>
          </div>
          <div>
            <p className="seonara-kicker">AI FOR REAL WORK</p>
            <h2>불편을 발견하고,<br /><em>Codex로 직접 만들었습니다.</em></h2>
            <p>여러 데이터를 한눈에 보고 프로젝트의 병목과 우선순위를 판단하기 위해 HTML 대시보드를 직접 제작했습니다. 전문 개발자라고 포장하지 않고 문제 정의, 요구사항, 검수와 실제 업무 효과로 설명합니다.</p>
            <ul><li>프로젝트 상태 시각화</li><li>미팅 신청·취소 현황 확인</li><li>병목 프로젝트와 우선 업무 판단</li><li>반복적인 데이터 확인 시간 감소</li></ul>
          </div>
        </div>
      </section>

      <section className="seonara-fit page-width">
        <div className="seonara-section-heading">
          <p className="seonara-kicker">WHERE EXPERIENCE FITS</p>
          <h2>다음 직무는 이름보다<br /><em>겹치는 증거</em>로 고릅니다.</h2>
        </div>
        <div className="fit-grid">
          <article><span>01</span><h3>Service Operations</h3><p>고객 여정, 프로젝트 상태와 반복 업무를 안정적으로 운영합니다.</p></article>
          <article><span>02</span><h3>CX Operations</h3><p>문의와 VOC를 안내·프로세스·백오피스 개선으로 연결합니다.</p></article>
          <article><span>03</span><h3>Retail Operations</h3><p>온라인과 대면 고객 경험, 정확한 절차와 현장 대응을 함께 활용합니다.</p></article>
          <article><span>04</span><h3>Project Operations</h3><p>고객·파트너·내부 담당자와 계약·일정·상태를 조율합니다.</p></article>
        </div>
      </section>

      <ReviewSection product="seonara" tone="light" />

      <section className="seonara-faq page-width" id="faq">
        <div><p className="seonara-kicker">BEFORE YOU BUY</p><h2>구매 전<br />확인하세요.</h2></div>
        <div className="faq-list">{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span>＋</span></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="seonara-purchase" id="purchase">
        <div className="page-width seonara-purchase-grid">
          <div><p className="seonara-kicker">YOUR NEXT CAREER IS NOT A RESET</p><h2>지금까지의 경험으로<br /><em>다음 가능성</em>을 만드세요.</h2><p>PDF 56쪽 · 22장 · 체크리스트와 30일 실행표 · 서나라 지음</p></div>
          <div className="seonara-price-card"><span>커리어 전환 실전 전자책</span><strong><small>₩</small>19,000</strong><ul><li>✓ 전체 전자책 PDF</li><li>✓ 경험·직무 번역표</li><li>✓ STAR 경험 워크시트</li><li>✓ 30일 커리어 전환 실행표</li></ul><PurchaseButton product="seonara" label="19,000원으로 구매하기" className="button seonara-primary full" /><p>결제 및 디지털 콘텐츠 환불 기준은 체크아웃에서 확인할 수 있습니다.</p></div>
        </div>
      </section>

      <footer className="seonara-footer"><div className="page-width footer-grid"><Link className="brand" href="/"><span className="brand-dot" /> PHILIP BOOKS</Link><p>© 2026 서나라. All rights reserved.</p><div><Link href="/">전체 전자책</Link><Link href="/codex">Codex 책</Link><Link href="/career">디자이너 커리어북</Link><a href="#purchase">구매하기</a></div></div></footer>
    </main>
  );
}
