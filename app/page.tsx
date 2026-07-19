"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChartLineUp,
  Code,
  DotsThree,
  Heart,
  MagnifyingGlass,
  Palette,
  RocketLaunch,
  Sparkle,
  SquaresFour,
  UserCircle,
} from "@phosphor-icons/react";

const books = [
  {
    id: "codex",
    href: "/codex",
    image: "/ebook-cover.png",
    width: 991,
    height: 1406,
    title: "아이디어를 서비스로 바꾸는 Codex 사용법",
    creator: "필립",
    category: "AI 서비스",
    tags: ["AI", "서비스 제작", "비개발자"],
    accent: "lime",
  },
  {
    id: "career",
    href: "/career",
    image: "/career-cover.png",
    width: 933,
    height: 1323,
    title: "커리어도 디자인할 수 있습니다",
    creator: "필립",
    category: "UI/UX 디자인",
    tags: ["디자인", "포트폴리오", "대기업 이직"],
    accent: "violet",
  },
  {
    id: "seonara",
    href: "/seonara",
    image: "/seonara-cover.png",
    width: 1007,
    height: 1429,
    title: "승무원 다음은 IT였습니다",
    creator: "서나라",
    category: "커리어 전환",
    tags: ["이직", "서비스 운영", "비전공자"],
    accent: "teal",
  },
];

const categories = [
  { label: "전체", icon: SquaresFour },
  { label: "AI 서비스", icon: Sparkle },
  { label: "커리어 전환", icon: Briefcase },
  { label: "UI/UX 디자인", icon: Palette },
  { label: "서비스 운영", icon: ChartLineUp },
  { label: "개발 · 생산성", icon: Code },
  { label: "전체 카테고리", icon: DotsThree },
];

const curated = [
  { book: books[0], badge: "입문 추천", subtitle: "폴더부터 결제·SEO까지" },
  { book: books[1], badge: "디자이너 필독", subtitle: "포트폴리오와 대기업 이직" },
  { book: books[2], badge: "커리어 전환", subtitle: "승무원 경험을 IT 역량으로" },
  { book: books[0], badge: "워크북 포함", subtitle: "Codex 명령문 250개" },
  { book: books[1], badge: "30일 실행", subtitle: "커리어 리디자인 워크북" },
];

const stories = [
  { book: books[0], title: "개발자가 아니어도 서비스의 책임자가 되는 법", meta: "AI · 서비스 제작" },
  { book: books[1], title: "작은 팀의 경험을 대기업 포트폴리오로 바꾸는 법", meta: "UI/UX · 커리어" },
  { book: books[2], title: "객실승무원의 현장 경험을 IT 언어로 번역하는 법", meta: "이직 · 서비스 운영" },
  { book: books[0], title: "GitHub부터 배포·결제까지 혼자 연결하는 법", meta: "개발 · 생산성" },
  { book: books[1], title: "AI로 만든 서비스를 이직의 증거로 쓰는 법", meta: "디자인 · AI" },
];

export default function BookstoreHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return curated.filter(({ book, subtitle }) => {
      const categoryMatch = category === "전체" || category === "전체 카테고리" || book.category === category || book.tags.some((tag) => tag.includes(category.split(" ")[0]));
      const queryMatch = !normalized || [book.title, book.creator, book.category, subtitle, ...book.tags].join(" ").toLowerCase().includes(normalized);
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  return (
    <main className="class-market">
      <header className="class-header">
        <div className="class-header-main">
          <Link className="class-logo" href="/" aria-label="PHILIP BOOKS 홈">
            <BookOpen weight="fill" size={29} aria-hidden="true" />
            <strong>PHILIP BOOKS</strong>
          </Link>
          <nav aria-label="주요 메뉴">
            <a href="#books">전자책</a>
            <a href="#popular">베스트</a>
            <a href="#stories">커리어</a>
            <button type="button">카테고리 <CaretDown size={14} weight="bold" /></button>
          </nav>
          <label className="class-search">
            <span className="sr-only">전자책 검색</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="관심 주제, 전자책, 경험을 검색해보세요" />
            <MagnifyingGlass size={23} weight="bold" aria-hidden="true" />
          </label>
          <div className="class-account">
            <a href="#books">전체 전자책</a>
            <button type="button" aria-label="로그인"><UserCircle size={27} /></button>
            <span>로그인</span>
          </div>
        </div>
      </header>

      <section className="class-discovery" aria-label="추천과 카테고리">
        <Link className="class-promo" href="/codex">
          <div><small>이번 주 추천</small><h1>실무에 바로 쓰는<br />세 권의 실전 전자책</h1><p>읽은 다음 날 바로 시작할 수 있는 경험과 워크북</p><span>자세히 보기 <ArrowRight size={15} weight="bold" /></span></div>
          <div className="class-promo-covers" aria-hidden="true">
            {books.map((book) => <img key={book.id} src={book.image} width={book.width} height={book.height} alt="" />)}
          </div>
        </Link>
        <div className="class-category-grid">
          {categories.map(({ label, icon: Icon }) => (
            <button className={category === label ? "active" : ""} type="button" key={label} onClick={() => setCategory(label)} aria-pressed={category === label}>
              <Icon size={22} weight={category === label ? "fill" : "duotone"} aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="class-content-section" id="books">
        <div className="class-section-title"><h2>{query || category !== "전체" ? "검색한 전자책" : "지금 가장 필요한 실전 전자책"}</h2><div><button aria-label="이전"><CaretLeft size={22} /></button><button aria-label="다음"><CaretRight size={22} /></button></div></div>
        {visible.length ? (
          <div className="class-product-grid">
            {visible.map(({ book, badge, subtitle }, index) => (
              <article className="class-product" key={`${book.id}-${index}`}>
                <Link className={`class-cover-wrap ${book.accent}`} href={book.href}>
                  <span>{badge}</span><img src={book.image} width={book.width} height={book.height} alt={`${book.title} 표지`} />
                  <Heart className="class-heart" size={25} weight="bold" aria-label="관심 전자책" />
                </Link>
                <div className="class-product-copy"><h3><Link href={book.href}>{book.title}</Link></h3><p>{subtitle}</p><small>{book.category} · {book.creator}</small><strong>19,000원</strong></div>
              </article>
            ))}
          </div>
        ) : <div className="class-empty"><MagnifyingGlass size={34} /><h3>검색 결과가 없습니다</h3><p>다른 주제나 카테고리를 선택해 보세요.</p><button type="button" onClick={() => { setQuery(""); setCategory("전체"); }}>전체 전자책 보기</button></div>}
      </section>

      <section className="class-content-section" id="stories">
        <div className="class-section-title"><h2>경력을 바꾼 실제 경험</h2><a href="#books">더 보기 <CaretRight size={18} /></a></div>
        <div className="class-story-grid">
          {stories.map(({ book, title, meta }, index) => (
            <Link href={book.href} className={`class-story-card story-${book.accent}`} key={`${title}-${index}`}>
              <div><span>실전 경험</span><h3>{title}</h3></div>
              <img src={book.image} width={book.width} height={book.height} alt="" />
              <p>{meta}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="class-content-section" id="popular">
        <div className="class-section-title"><h2>실시간 인기 전자책</h2><a href="#books">더 보기 <CaretRight size={18} /></a></div>
        <div className="class-ranking-grid">
          {curated.map(({ book, subtitle }, index) => (
            <Link href={book.href} key={`${book.id}-rank-${index}`}>
              <b>{index + 1}</b><img src={book.image} width={book.width} height={book.height} alt="" />
              <div><h3>{book.title}</h3><p>{subtitle}</p><small>{book.category} · {book.creator}</small><strong>19,000원</strong></div>
              <Heart size={20} aria-label="관심 전자책" />
            </Link>
          ))}
        </div>
      </section>

      <section className="class-start-banner">
        <div><RocketLaunch size={34} weight="duotone" /><p>어떤 책부터 읽어야 할지 고민된다면</p><h2>지금 해결하고 싶은 문제에서 시작하세요.</h2></div>
        <a href="#books">나에게 맞는 전자책 찾기 <ArrowRight size={18} weight="bold" /></a>
      </section>

      <footer className="class-footer"><Link className="class-logo" href="/"><BookOpen weight="fill" size={25} /><strong>PHILIP BOOKS</strong></Link><p>실제 경험을 실행 가능한 지식으로 만듭니다.</p><div><Link href="/codex">AI 서비스 제작</Link><Link href="/career">UI/UX 커리어</Link><Link href="/seonara">승무원에서 IT로</Link></div><small>© 2026 PHILIP BOOKS</small></footer>
    </main>
  );
}
