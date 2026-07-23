"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Code,
  MagnifyingGlass,
  RocketLaunch,
  SquaresFour,
} from "@phosphor-icons/react";
import BusinessFooter from "./components/BusinessFooter";
import StorefrontHeader from "./components/StorefrontHeader";

const books = [
  {
    id: "codex",
    href: "/codex",
    image: "/ebook-cover.png",
    width: 1054,
    height: 1492,
    title: "아이디어를 서비스로 바꾸는 Codex 사용법",
    creator: "필립",
    category: "AI 서비스",
    tags: ["AI", "서비스 제작", "비개발자"],
    accent: "lime",
    badge: "입문 추천",
    subtitle: "폴더부터 결제·SEO까지",
  },
  {
    id: "career",
    href: "/career",
    image: "/career-cover.png",
    width: 1024,
    height: 1536,
    title: "커리어도 디자인할 수 있습니다",
    creator: "필립",
    category: "UI/UX 디자인",
    tags: ["디자인", "포트폴리오", "대기업 이직"],
    accent: "violet",
    badge: "디자이너 필독",
    subtitle: "포트폴리오와 대기업 이직",
  },
  {
    id: "jane",
    href: "/jane",
    image: "/jane-cover.png",
    width: 1054,
    height: 1493,
    title: "승무원 다음은 IT였습니다",
    creator: "제인",
    category: "커리어 전환",
    tags: ["이직", "서비스 운영", "비전공자"],
    accent: "teal",
    badge: "커리어 전환",
    subtitle: "승무원 경험을 IT 역량으로",
  },
];

const categories = [
  { label: "전체", icon: SquaresFour },
  { label: "커리어", icon: Briefcase },
  { label: "개발 · 생산성", icon: Code },
];

export default function BookstoreHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [promoIndex, setPromoIndex] = useState(0);
  const [promoPaused, setPromoPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("q")?.trim();
    const categoryQuery = params.get("category");
    const validCategory = categories.some(({ label }) => label === categoryQuery) ? categoryQuery : null;
    if (!searchQuery && !validCategory) return;
    const applySearch = window.setTimeout(() => {
      if (searchQuery) setQuery(searchQuery);
      if (validCategory) setCategory(validCategory);
    }, 0);
    return () => window.clearTimeout(applySearch);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (promoPaused || reduceMotion) return;
    const promoTimer = window.setInterval(() => {
      setPromoIndex((current) => (current + 1) % books.length);
    }, 5000);

    return () => window.clearInterval(promoTimer);
  }, [promoPaused, reduceMotion]);

  const promoBook = books[promoIndex];

  function resetDiscovery() {
    setQuery("");
    setCategory("전체");
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    url.searchParams.delete("category");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return books.filter((book) => {
      const categoryMatch = category === "전체" ||
        (category === "커리어" && (book.id === "career" || book.id === "jane")) ||
        (category === "개발 · 생산성" && book.id === "codex");
      const queryMatch = !normalized || [book.title, book.creator, book.category, book.subtitle, ...book.tags].join(" ").toLowerCase().includes(normalized);
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  return (
    <main className="class-market">
      <StorefrontHeader query={query} onQueryChange={setQuery} />

      <section className="class-discovery" aria-label="추천과 카테고리">
        <div className="class-promo-wrap"><Link className={`class-promo class-promo-${promoBook.accent}`} href={promoBook.href} aria-label={`${promoBook.title} 자세히 보기`}>
          <div key={`copy-${promoBook.id}`} className="class-promo-copy">
            <small>이번 주 추천</small>
            <h1>{promoBook.title}</h1>
            <p>{promoBook.subtitle}</p>
            <span>자세히 보기 <ArrowRight size={15} weight="bold" /></span>
          </div>
          <div key={`cover-${promoBook.id}`} className="class-promo-covers" aria-hidden="true">
            <img src={promoBook.image} width={promoBook.width} height={promoBook.height} alt="" />
          </div>
        </Link><button className="class-promo-pause" type="button" aria-pressed={promoPaused} onClick={() => setPromoPaused((value) => !value)}>{promoPaused ? "자동 전환 재생" : "자동 전환 일시정지"}</button></div>
      </section>

      <section className="class-content-section" id="books">
        <div className="class-section-title"><h2>{query || category !== "전체" ? "검색한 전자책" : "세 권의 실전 전자책"}</h2></div>
        {visible.length ? (
          <div className="class-product-grid">
            {visible.map((book) => (
              <article className="class-product" key={book.id}>
                <Link className={`class-cover-wrap ${book.accent}`} href={book.href}>
                  <span>{book.badge}</span><img src={book.image} width={book.width} height={book.height} alt={`${book.title} 표지`} />
                </Link>
                <div className="class-product-copy"><h3><Link href={book.href}>{book.title}</Link></h3><p>{book.subtitle}</p><small>{book.category} · {book.creator}</small></div>
              </article>
            ))}
          </div>
        ) : <div className="class-empty"><MagnifyingGlass size={34} /><h3>검색 결과가 없습니다</h3><p>다른 주제나 카테고리를 선택해 보세요.</p><button type="button" onClick={resetDiscovery}>전체 전자책 보기</button></div>}
      </section>

      <section className="class-all-books-section" aria-labelledby="all-books-title">
        <div className="class-all-books-heading">
          <small>ALL EBOOKS</small>
          <h2 id="all-books-title">전체 전자책</h2>
          <p>실제 경험을 다음 기회로 연결하는 세 권의 실전 가이드</p>
        </div>
        <div className="class-category-grid" aria-label="전자책 카테고리">
          {categories.map(({ label, icon: Icon }) => (
            <button className={category === label ? "active" : ""} type="button" key={label} onClick={() => setCategory(label)} aria-pressed={category === label}>
              <Icon size={22} weight={category === label ? "fill" : "duotone"} aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </div>
        <div className="class-all-book-list">
          {visible.map((book) => (
            <Link className="class-all-book-row" href={book.href} key={`all-${book.id}`}>
              <span className={`class-all-book-thumb ${book.accent}`}>
                <img src={book.image} width={book.width} height={book.height} alt={`${book.title} 표지`} />
              </span>
              <span className="class-all-book-copy">
                <span className="class-all-book-tags"><em>{book.category}</em></span>
                <strong>{book.title}</strong>
                <span>{book.subtitle}</span>
                <small>{book.creator} 지음</small>
              </span>
              <ArrowRight size={24} weight="bold" aria-hidden="true" />
            </Link>
          ))}
          {!visible.length && <p className="class-all-books-empty">선택한 카테고리에 해당하는 전자책이 없습니다.</p>}
        </div>
      </section>

      <section className="class-start-banner">
        <div><RocketLaunch size={34} weight="duotone" /><p>어떤 책부터 읽어야 할지 고민된다면</p><h2>지금 해결하고 싶은 문제에서 시작하세요.</h2></div>
        <a href="#books">나에게 맞는 전자책 찾기 <ArrowRight size={18} weight="bold" /></a>
      </section>

      <BusinessFooter />
    </main>
  );
}
