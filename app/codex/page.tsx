import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PurchaseButton from "../components/PurchaseButton";
import ReviewSection from "../components/ReviewSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "아이디어를 서비스로 바꾸는 Codex 사용법",
  description: "IT 초보자가 Codex로 기획, 개발, 배포, 결제, SEO와 자동화까지 완성하는 258쪽 실전 전자책.",
  alternates: { canonical: "/codex" },
  openGraph: { title: "아이디어를 서비스로 바꾸는 Codex 사용법", description: "개발자 없이 아이디어에서 배포·결제·운영까지.", url: "/codex", images: [{ url: "/og.png", width: 1731, height: 909 }] },
};

const curriculum = [
  ["01", "시작", "웹서비스 구조 · 폴더 · 터미널 · Git · GitHub"],
  ["02", "제작", "Codex 프롬프트 · Next.js · 화면 · 모바일 · 접근성"],
  ["03", "기능", "Supabase · 로그인 · 데이터 · 이미지 · 관리자"],
  ["04", "출시", "Vercel · 도메인 · 결제 · 지도 · 카카오톡"],
  ["05", "성장", "SEO · 검색 등록 · AdSense · Threads 자동화"],
  ["06", "사업", "첫 고객 · 자동화 · B2B · 매각까지의 실제 경험"],
];

const faqs = [
  ["코딩을 전혀 몰라도 읽을 수 있나요?", "그 독자를 기준으로 썼습니다. 용어부터 설명하고 Codex에 무엇을 어떻게 요청할지 순서대로 안내합니다."],
  ["프롬프트만 모아둔 책인가요?", "아닙니다. 폴더 생성부터 GitHub, 배포, 회원, 결제, SEO, 자동화와 운영까지 하나의 흐름으로 연결합니다."],
  ["어떤 서비스를 사례로 사용하나요?", "모바일 청첩장 마리에카드와 부동산 정보 서비스 아파트구구의 실제 제작·운영 경험을 사용합니다."],
  ["파일 형식과 분량은 어떻게 되나요?", "A5 기준 258쪽 PDF 전자책이며 실전 명령, 검증법, 체크리스트와 용어집을 포함합니다."],
];

const schema = { "@context": "https://schema.org", "@type": "Product", name: "아이디어를 서비스로 바꾸는 Codex 사용법", image: `${siteUrl}/ebook-cover.png`, offers: { "@type": "Offer", priceCurrency: "KRW", price: "19000", availability: "https://schema.org/InStock", url: `${siteUrl}/codex` } };

export default function CodexBookPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="nav-shell">
        <Link className="brand" href="/" aria-label="전자책 전체 목록"><span className="brand-dot" /> PHILIP BOOKS</Link>
        <nav aria-label="주요 메뉴"><a href="#inside">책 소개</a><a href="#preview">명령문 미리보기</a><a href="#reviews">구매 후기</a><Link href="/career">UI/UX 커리어</Link><Link href="/seonara">승무원→IT</Link></nav>
        <PurchaseButton product="codex" label="19,000원 구매" className="nav-cta" />
      </header>
      <section className="hero" id="top"><div className="hero-grid page-width">
        <div className="hero-copy"><p className="eyebrow"><span /> 비개발자를 위한 Codex 서비스 제작 실전서</p><h1>아이디어를<br /><em>작동하는 서비스</em>로.</h1><p className="hero-lead">개발자를 기다리지 마세요. 폴더 하나에서 시작해 GitHub, 배포, 회원, 결제, SEO와 자동화까지 Codex와 혼자 완성하는 순서를 담았습니다.</p><div className="hero-actions"><PurchaseButton product="codex" label="전자책 구매하기" /><a className="button text-button" href="#inside">목차 먼저 보기</a></div><div className="hero-proof"><div><strong>258</strong><span>페이지</span></div><div><strong>49</strong><span>실전 장</span></div><div><strong>250</strong><span>워크북 블록</span></div><div><strong>19,000</strong><span>원 · PDF</span></div></div></div>
        <div className="book-stage"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="book-shadow"/><div className="book-cover"><Image src="/ebook-cover.png" alt="아이디어를 서비스로 바꾸는 Codex 사용법 표지" width={991} height={1406} priority/></div><div className="floating-note note-a"><b>GOAL</b><span>무엇을 만들까?</span></div><div className="floating-note note-b"><b>DONE</b><span>어떻게 확인할까?</span></div></div>
      </div></section>
      <section className="problem-strip"><div className="page-width problem-grid"><p>“AI가 코드는 만들어줬는데<br/><b>그다음은 뭘 해야 하지?</b>”</p><ul><li>코드를 어디에 넣는지 모르겠다</li><li>커밋·푸시·배포에서 멈춘다</li><li>회원·결제·검색까지 연결하지 못한다</li></ul><div className="answer">이 책은 바로 그<br/><strong>‘그다음’</strong>을 설명합니다.</div></div></section>
      <section className="section curriculum-section" id="inside"><div className="page-width split-heading"><div><p className="eyebrow light"><span/> 처음부터 운영까지</p><h2>한 권으로 연결하는<br/>서비스의 <em>전체 여정</em></h2></div><p>각 단계에서 Codex에 무엇을 요청하고 어떤 결과를 확인해야 하는지 따라갑니다.</p></div><div className="page-width curriculum-list">{curriculum.map(([number,title,detail])=><div className="curriculum-row" key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p><i>↗</i></div>)}</div></section>
      <section className="section page-width" id="preview"><div className="preview-grid"><div className="prompt-panel"><div className="window-bar"><i/><i/><i/><span>codex-prompt.md</span></div><p className="prompt-label">CODEX에 그대로 입력하세요</p><p>“나는 IT 용어를 거의 모르는 비개발자야. 먼저 현재 폴더와 파일을 확인하고, 바로 코드를 만들지 말고 문제와 가설을 정리해줘.”</p><div className="prompt-tags"><span>목표</span><span>맥락</span><span>제약</span><span>완료 조건</span></div></div><div className="preview-copy"><p className="eyebrow"><span/> 따라 쓰는 워크북</p><h2>좋은 요청부터<br/>안전한 검증까지.</h2><ul className="check-list"><li><span>✓</span>Codex에 그대로 입력하는 첫 명령</li><li><span>✓</span>Codex가 되물었을 때 답하는 방법</li><li><span>✓</span>테스트와 검증을 요청하는 후속 명령</li><li><span>✓</span>실수와 비용을 막는 위험 명령</li></ul></div></div></section>
      <ReviewSection product="codex" />
      <section className="section faq-section"><div className="page-width faq-grid"><div className="section-heading compact"><p className="eyebrow"><span/> FAQ</p><h2>구매 전<br/>확인하세요.</h2></div><div className="faq-list">{faqs.map(([q,a],i)=><details key={q} open={i===0}><summary>{q}<span>＋</span></summary><p>{a}</p></details>)}</div></div></section>
      <section className="purchase-section"><div className="page-width purchase-grid"><div><p className="eyebrow light"><span/> 지금 시작하세요</p><h2>오늘 첫 폴더를<br/><em>만드세요.</em></h2><p>258쪽 PDF 전자책 · 구매 후 바로 읽기</p></div><div className="price-card"><span>전자책 단품</span><strong><small>₩</small>19,000</strong><ul><li>✓ PDF 전자책 258쪽</li><li>✓ 실전 워크북 250개</li><li>✓ 출시 전 체크리스트·용어집</li></ul><PurchaseButton product="codex" label="19,000원으로 구매하기" className="button primary full"/></div></div></section>
      <footer><div className="page-width footer-grid"><Link className="brand" href="/"><span className="brand-dot"/> PHILIP BOOKS</Link><p>© 2026 필립.</p><div><Link href="/">전체 전자책</Link><Link href="/career">UI/UX 커리어</Link><Link href="/seonara">승무원→IT</Link></div></div></footer>
    </main>
  );
}
