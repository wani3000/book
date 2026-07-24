"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  BookOpen,
  Brain,
  Check,
  DownloadSimple,
  Fingerprint,
  Globe,
  Question,
  ShieldCheck,
  Sparkle,
  Users,
} from "@phosphor-icons/react";
import BusinessFooter from "./BusinessFooter";
import PurchaseButton from "./PurchaseButton";
import ReviewSection from "./ReviewSection";
import StorefrontHeader from "./StorefrontHeader";

const questions = [
  "다른 몸에서 눈을 떠도 나는 여전히 같은 사람인가?",
  "기억이 이어진다면 몸이 달라도 같은 인간인가?",
  "영원한 삶을 약속하는 기술이 인간을 통제하는 수단이 될 수 있는가?",
  "자신의 몸을 사용할 권리는 누구에게 있는가?",
];

const appeals = [
  ["의식 이전이 일상이 된 미래", "의식을 다른 신체로 옮기며 이동하고 더 긴 삶을 꿈꾸는 사회를 만납니다."],
  ["정체성을 흔드는 질문", "기억과 성격이 이어져도 낯선 감각과 심장 박동 앞에서 같은 사람이라 할 수 있는지 묻습니다."],
  ["혜택 뒤에 숨은 통제", "자유를 약속한 기술이 어떻게 계급과 허가, 권력의 장치가 될 수 있는지 따라갑니다."],
  ["선택의 대가를 좇는 성장 서사", "우정과 사랑, 가족과 권력의 충돌 속에서 한 소년이 스스로 결정을 내려야 합니다."],
  ["학교에서 세계로 확장되는 긴장", "서로 다른 믿음이 부딪히는 작은 공간에서 시작한 갈등이 더 넓은 충돌로 번집니다."],
  ["기술보다 사람을 보는 SF", "새로운 장치의 화려함보다 그것을 사용하는 사람의 욕망과 책임에 집중합니다."],
];

const readers = [
  "인간의 정체성과 의식을 다루는 SF를 좋아하는 독자",
  "기술과 사회의 관계를 생각해 보는 작품을 좋아하는 독자",
  "철학적 질문과 미스터리, 성장 서사가 결합된 소설을 찾는 독자",
  "기억 이전, 복제 신체, 디지털 불멸 소재에 관심 있는 독자",
  "세계관뿐 아니라 인물의 선택과 감정이 중요한 SF를 선호하는 독자",
];

function NovelBuyCard({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`novel-buy-card${compact ? " compact" : ""}`} aria-label="의식의 국경 구매 정보">
      {!compact && <p className="novel-buy-label">PDF 전자책</p>}
      <div className="novel-price"><span>판매가</span><strong>19,000<small>원</small></strong></div>
      {!compact && <ul>
        <li><DownloadSimple size={18} /> 결제 후 마이페이지에서 바로 이용</li>
        <li><BookOpen size={18} /> A5 · 299쪽 · 장편 SF소설</li>
        <li><ShieldCheck size={18} /> 구매 내역과 열람 권한 안전하게 관리</li>
      </ul>}
      <PurchaseButton product="consciousness" label="19,000원에 구매하기" className="novel-buy-button" />
      {!compact && <p className="novel-buy-note">결제 후 즉시 PDF가 제공돼요. 열람·다운로드 후에는 단순 변심 환불이 제한될 수 있어요. <Link href="/refund">환불정책 보기</Link></p>}
    </aside>
  );
}

export default function NovelDetailPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://danielsnote.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        name: "의식의 국경",
        author: { "@type": "Person", name: "제임스 한" },
        genre: "Science fiction",
        bookFormat: "https://schema.org/EBook",
        inLanguage: "ko-KR",
        numberOfPages: 299,
        image: `${siteUrl}/consciousness-cover.png`,
        description: "몸과 기억, 정체성과 소유권, 불멸과 통제의 경계를 따라가는 철학적 SF 장편소설.",
      },
      {
        "@type": "Product",
        name: "의식의 국경",
        category: "장편 SF소설",
        image: `${siteUrl}/consciousness-cover.png`,
        brand: { "@type": "Brand", name: "다니엘의 노트" },
        offers: { "@type": "Offer", priceCurrency: "KRW", price: "19000", availability: "https://schema.org/PreOrder", url: `${siteUrl}/consciousness` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "SF소설", item: `${siteUrl}/?category=SF소설` },
          { "@type": "ListItem", position: 3, name: "의식의 국경", item: `${siteUrl}/consciousness` },
        ],
      },
    ],
  };

  return (
    <main className="novel-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }} />
      <StorefrontHeader />

      <div className="novel-breadcrumb"><Link href="/">홈</Link><span>›</span><Link href="/?category=SF소설">SF소설</Link><span>›</span><b>의식의 국경</b></div>

      <section className="novel-hero">
        <div className="novel-cover-stage">
          <span className="novel-orbit orbit-a" aria-hidden="true" />
          <span className="novel-orbit orbit-b" aria-hidden="true" />
          <img src="/consciousness-cover.png" width={1600} height={2263} alt="의식의 국경, 제임스 한 장편 SF소설 표지" fetchPriority="high" />
          <small>JAMES HAN · SCIENCE FICTION</small>
        </div>
        <div className="novel-hero-copy">
          <p className="novel-kicker">장편 SF소설 · 제임스 한</p>
          <h1>의식의 국경</h1>
          <blockquote>“내 몸인데,<br />돌아갈 권한은 내게 없었다.”</blockquote>
          <p className="novel-main-copy">다른 몸에서 눈을 떴다.<br />그런데 나는 여전히 나일까.</p>
          <p className="novel-sub-copy">영원한 삶을 약속한 기술은<br />가장 완벽한 통제가 되었다.</p>
          <div className="novel-meta" aria-label="도서 기본 정보"><span>제임스 한 지음</span><span>A5 · 299쪽</span><span>PDF 전자책</span></div>
          <NovelBuyCard />
        </div>
      </section>

      <nav className="novel-tabs" aria-label="의식의 국경 상세페이지 목차">
        <div><a href="#questions">핵심 질문</a><a href="#story">줄거리</a><a href="#appeal">작품의 매력</a><a href="#world">세계관</a><a href="#readers">추천 독자</a><a href="#book-info">책 정보</a></div>
      </nav>

      <div className="novel-body-layout">
        <article className="novel-content">
          <section className="novel-questions" id="questions">
            <p className="novel-section-label">THE QUESTIONS</p>
            <div className="novel-section-heading"><h2>몸이 바뀌어도<br />나는 나일까.</h2><p>이 이야기는 기술의 가능성보다, 그 기술 앞에 선 인간의 권리와 선택을 묻습니다.</p></div>
            <div className="novel-question-grid">{questions.map((item, index) => <article key={item}><Question size={26} weight="duotone" /><span>0{index + 1}</span><p>{item}</p></article>)}</div>
          </section>

          <section className="novel-story" id="story">
            <div><p className="novel-section-label">STORY</p><h2>낯선 심장의 박동으로<br />시작된 이야기</h2></div>
            <div className="novel-story-copy">
              <p>의식을 다른 신체로 옮길 수 있는 가까운 미래.</p>
              <p>기억과 성격은 그대로지만 손끝의 감각과 심장의 박동은 낯설다. 사람들은 새로운 몸을 통해 세계 어디로든 이동하고 더 긴 삶을 꿈꾼다. 하지만 자신의 몸으로 돌아가는 일조차 누군가의 허락을 받아야 한다면, 그것을 과연 자유라고 부를 수 있을까.</p>
              <p>「의식의 국경」은 몸과 기억, 정체성과 소유권, 불멸과 통제의 경계를 따라가는 철학적 SF 장편소설이다. 서로 다른 믿음을 가진 사람들이 한 학교에서 충돌하고, 한 소년은 자신과 친구들의 삶을 지키기 위해 누구도 대신해 줄 수 없는 선택과 마주한다.</p>
            </div>
          </section>

          <section className="novel-appeal" id="appeal">
            <p className="novel-section-label">WHY THIS STORY</p>
            <h2>이 소설이 특별한 이유</h2>
            <div className="novel-appeal-grid">{appeals.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
          </section>

          <section className="novel-world" id="world">
            <div className="novel-world-heading"><p className="novel-section-label">THE WORLD</p><h2>의식은 이동하고,<br />몸은 권한이 된다.</h2><p>복잡한 설정 용어를 외우지 않아도 이야기의 중심을 따라갈 수 있어요.</p></div>
            <div className="novel-world-steps">
              <article><Brain size={30} weight="duotone" /><span>01</span><h3>기억과 성격을 옮기다</h3><p>의식 이전 기술은 사람이 다른 신체에서 깨어날 수 있는 가능성을 엽니다.</p></article>
              <article><Globe size={30} weight="duotone" /><span>02</span><h3>몸을 통해 더 멀리 가다</h3><p>새로운 몸은 거리와 수명의 한계를 넘어서는 자유처럼 보입니다.</p></article>
              <article><Fingerprint size={30} weight="duotone" /><span>03</span><h3>돌아갈 권리를 묻다</h3><p>그러나 몸을 선택하고 되찾는 일에 허가가 필요해지는 순간, 기술은 통제가 됩니다.</p></article>
            </div>
          </section>

          <section className="novel-readers" id="readers">
            <div><p className="novel-section-label">FOR READERS</p><h2>이런 독자에게<br />권합니다.</h2><Sparkle size={46} weight="duotone" /></div>
            <ul>{readers.map((reader) => <li key={reader}><Check size={18} weight="bold" />{reader}</li>)}</ul>
          </section>

          <section className="novel-book-info" id="book-info">
            <p className="novel-section-label">BOOK INFORMATION</p>
            <h2>책의 기본 정보</h2>
            <dl>
              <div><dt>제목</dt><dd>의식의 국경</dd></div>
              <div><dt>저자</dt><dd>제임스 한</dd></div>
              <div><dt>장르</dt><dd>장편 SF소설</dd></div>
              <div><dt>분량</dt><dd>A5 · 299쪽 · 7개 장</dd></div>
              <div><dt>형식</dt><dd>PDF 전자책</dd></div>
              <div><dt>판매가</dt><dd>19,000원</dd></div>
            </dl>
          </section>
        </article>
        <div className="novel-side-sticky"><NovelBuyCard compact /></div>
      </div>

      <ReviewSection product="consciousness" tone="light" />

      <section className="novel-use-guide">
        <div><ShieldCheck size={34} weight="duotone" /><h2>구매 전 확인해 주세요.</h2></div>
        <div>
          <article><h3>어떻게 읽나요?</h3><p>결제가 확인되면 마이페이지의 내 서재에서 PDF를 바로 열어 읽을 수 있어요.</p></article>
          <article><h3>파일은 언제 제공되나요?</h3><p>결제 승인 후 즉시 제공되는 디지털 콘텐츠이며 별도의 배송은 없어요.</p></article>
          <article><h3>환불할 수 있나요?</h3><p>미열람 구매는 구매일부터 7일 이내에 신청할 수 있어요. 열람·다운로드 후에는 단순 변심 환불이 제한될 수 있어요. <Link href="/refund">자세한 환불정책 보기</Link></p></article>
        </div>
      </section>

      <section className="novel-final">
        <div><Users size={28} weight="duotone" /><span>장편 SF소설</span><h2>다른 몸에서 눈을 떴다.<br />그런데 나는 여전히 나일까.</h2><p>「의식의 국경」 · 제임스 한 지음 · A5 299쪽 PDF</p></div>
        <div><strong>19,000<small>원</small></strong><PurchaseButton product="consciousness" label="전자책 구매하기" className="novel-buy-button" /></div>
      </section>

      <BusinessFooter />

      <div className="novel-mobile-buy"><span><small>의식의 국경</small><b>19,000원</b></span><PurchaseButton product="consciousness" label="구매하기" className="novel-buy-button" /></div>
    </main>
  );
}
