"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CaretDown,
  Check,
  Clock,
  DownloadSimple,
  Heart,
  MagnifyingGlass,
  ShareNetwork,
  ShieldCheck,
  Star,
  UserCircle,
} from "@phosphor-icons/react";
import PurchaseButton from "./PurchaseButton";
import ReviewSection from "./ReviewSection";

type ProductSlug = "codex" | "career" | "seonara";

export type DetailBook = {
  product: ProductSlug;
  category: string;
  title: string;
  subtitle: string;
  creator: string;
  cover: string;
  coverWidth: number;
  coverHeight: number;
  pages: string;
  chapters: string;
  level: string;
  theme: "orange" | "violet" | "teal";
  headline: string;
  intro: string;
  quote: string;
  targets: Array<[string, string]>;
  outcomes: Array<[string, string]>;
  curriculum: Array<[string, string, string]>;
  included: string[];
  creatorTitle: string;
  creatorBio: string;
  creatorProof: string[];
  faqs: Array<[string, string]>;
};

function StoreHeader() {
  return (
    <header className="detail-global-header">
      <div>
        <Link className="class-logo" href="/" aria-label="PHILIP BOOKS 홈">
          <BookOpen weight="fill" size={28} /><strong>PHILIP BOOKS</strong>
        </Link>
        <nav aria-label="주요 메뉴"><Link href="/">전자책</Link><a href="#curriculum">목차</a><a href="#reviews">후기</a><a href="#creator">저자</a></nav>
        <label className="detail-search"><span className="sr-only">전자책 검색</span><input placeholder="관심 주제, 전자책, 경험을 검색해보세요" /><MagnifyingGlass size={20} weight="bold" /></label>
        <div className="detail-account"><UserCircle size={23} /><span>로그인</span></div>
      </div>
    </header>
  );
}

function BuyCard({ book, compact = false }: { book: DetailBook; compact?: boolean }) {
  return (
    <aside className={compact ? "detail-buy-card compact" : "detail-buy-card"} aria-label="전자책 구매 정보">
      {!compact && <><p className="detail-offer-label">전자책 단품 구매</p><div className="detail-discount"><span>출간 기념 혜택</span><b>즉시 다운로드</b></div></>}
      <div className="detail-price"><span>판매가</span><strong>19,000<small>원</small></strong></div>
      {!compact && <ul><li><DownloadSimple size={18} /> 결제 후 PDF 바로 이용</li><li><BookOpen size={18} /> {book.pages} · {book.chapters}</li><li><ShieldCheck size={18} /> 안전한 결제와 구매 확인</li></ul>}
      <PurchaseButton product={book.product} label="19,000원에 구매하기" className="detail-buy-button" />
      {!compact && <p className="detail-buy-note">디지털 콘텐츠 특성상 다운로드 후에는 단순 변심 환불이 제한될 수 있습니다.</p>}
    </aside>
  );
}

export default function ClassDetailPage({ book }: { book: DetailBook }) {
  return (
    <main className={`class-detail theme-${book.theme}`}>
      <StoreHeader />

      <div className="detail-breadcrumb"><Link href="/">홈</Link><span>›</span><Link href="/">전자책</Link><span>›</span><b>{book.category}</b></div>

      <section className="detail-product-top">
        <div className="detail-gallery">
          <div className="detail-gallery-main"><Image src={book.cover} width={book.coverWidth} height={book.coverHeight} alt={`${book.title} 표지`} priority /></div>
          <div className="detail-gallery-card detail-card-copy"><span>이 책을 읽고 나면</span><strong>{book.headline}</strong><small>실제 경험과 바로 쓰는 워크북</small></div>
          <div className="detail-gallery-card detail-card-stats"><b>{book.pages}</b><span>PDF 전자책</span><b>{book.chapters}</b><span>경험 기반 구성</span></div>
        </div>

        <div className="detail-product-info">
          <p className="detail-category">{book.category}</p>
          <h1>{book.title}</h1>
          <p className="detail-subtitle">{book.subtitle}</p>
          <Link className="detail-creator-link" href="#creator">{book.creator}<span>저자 정보 ›</span></Link>
          <div className="detail-rating"><b><Star weight="fill" /> 4.8</b><a href="#reviews">구매 후기 3개</a><span>·</span><button aria-label="관심 상품"><Heart size={21} /></button><button aria-label="공유"><ShareNetwork size={21} /></button></div>
          <div className="detail-facts"><div><BookOpen size={21} /><span>분량<strong>{book.pages}</strong></span></div><div><Clock size={21} /><span>난이도<strong>{book.level}</strong></span></div><div><DownloadSimple size={21} /><span>형식<strong>PDF</strong></span></div></div>
          <BuyCard book={book} />
        </div>
      </section>

      <nav className="detail-tabs" aria-label="상세페이지 목차"><div><a href="#intro">책 소개</a><a href="#outcomes">배우는 내용</a><a href="#curriculum">목차</a><a href="#creator">저자</a><a href="#reviews">후기</a></div></nav>

      <div className="detail-body-layout">
        <article className="detail-content">
          <section className="detail-section detail-intro" id="intro">
            <p className="detail-section-label">BOOK INTRODUCTION</p>
            <h2>{book.headline}</h2>
            <p className="detail-lead">{book.intro}</p>
            <blockquote>“{book.quote}”</blockquote>
          </section>

          <section className="detail-section detail-targets">
            <p className="detail-section-label">RECOMMENDED FOR</p><h2>이런 분께 추천해요</h2>
            <div>{book.targets.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
          </section>

          <section className="detail-section" id="outcomes">
            <p className="detail-section-label">WHAT YOU WILL GET</p><h2>이 책으로 얻어갈 수 있어요</h2>
            <div className="detail-outcome-grid">{book.outcomes.map(([title, copy], index) => <article key={title}><b><Check weight="bold" /></b><span>POINT {index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
          </section>

          <section className="detail-section detail-included">
            <div><p className="detail-section-label">ALL INCLUDED</p><h2>구매하면<br />모두 포함돼요</h2></div>
            <ul>{book.included.map((item) => <li key={item}><Check weight="bold" />{item}</li>)}</ul>
          </section>

          <section className="detail-section" id="curriculum">
            <p className="detail-section-label">CURRICULUM</p><h2>목차를 확인해 보세요</h2><p className="detail-section-copy">처음부터 순서대로 읽어도 좋고, 지금 막힌 지점부터 펼쳐도 좋습니다.</p>
            <div className="detail-curriculum">{book.curriculum.map(([part, title, copy], index) => <details key={part} open={index === 0}><summary><span>{part}</span><strong>{title}</strong><CaretDown size={20} /></summary><p>{copy}</p></details>)}</div>
          </section>

          <section className="detail-section detail-creator" id="creator">
            <p className="detail-section-label">CREATOR</p><h2>이 책을 만든 사람</h2>
            <div><span className="detail-avatar">{book.creator.slice(0, 1)}</span><article><small>{book.creatorTitle}</small><h3>{book.creator}</h3><p>{book.creatorBio}</p><ul>{book.creatorProof.map((item) => <li key={item}><Check weight="bold" />{item}</li>)}</ul></article></div>
          </section>
        </article>

        <div className="detail-side-sticky"><BuyCard book={book} compact /></div>
      </div>

      <ReviewSection product={book.product} tone="light" />

      <section className="detail-faq" id="faq"><div><p className="detail-section-label">FAQ</p><h2>구매 전 확인하세요</h2></div><div>{book.faqs.map(([q, a], index) => <details key={q} open={index === 0}><summary>{q}<span>＋</span></summary><p>{a}</p></details>)}</div></section>

      <section className="detail-final"><div><span>{book.category}</span><h2>{book.title}</h2><p>{book.pages} PDF · 구매 후 바로 읽기</p></div><strong>19,000<small>원</small></strong><PurchaseButton product={book.product} label="전자책 구매하기" className="detail-buy-button" /></section>

      <footer className="class-footer"><Link className="class-logo" href="/"><BookOpen weight="fill" size={25} /><strong>PHILIP BOOKS</strong></Link><p>실제 경험을 실행 가능한 지식으로 만듭니다.</p><div><Link href="/codex">AI 서비스 제작</Link><Link href="/career">UI/UX 커리어</Link><Link href="/seonara">승무원에서 IT로</Link></div><small>© 2026 PHILIP BOOKS</small></footer>
      <div className="detail-mobile-buy"><span><small>전자책</small><b>19,000원</b></span><PurchaseButton product={book.product} label="구매하기" className="detail-buy-button" /></div>
    </main>
  );
}
