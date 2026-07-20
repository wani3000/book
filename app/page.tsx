"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
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
  { label: "AI 서비스", icon: Sparkle },
  { label: "커리어 전환", icon: Briefcase },
  { label: "UI/UX 디자인", icon: Palette },
  { label: "서비스 운영", icon: ChartLineUp },
  { label: "개발 · 생산성", icon: Code },
  { label: "전체 카테고리", icon: DotsThree },
];

export default function BookstoreHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return books.filter((book) => {
      const categoryMatch = category === "전체" || category === "전체 카테고리" || book.category === category || book.tags.some((tag) => tag.includes(category.split(" ")[0]));
      const queryMatch = !normalized || [book.title, book.creator, book.category, book.subtitle, ...book.tags].join(" ").toLowerCase().includes(normalized);
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
        <div className="class-section-title"><h2>{query || category !== "전체" ? "검색한 전자책" : "세 권의 실전 전자책"}</h2></div>
        {visible.length ? (
          <div className="class-product-grid">
            {visible.map((book) => (
              <article className="class-product" key={book.id}>
                <Link className={`class-cover-wrap ${book.accent}`} href={book.href}>
                  <span>{book.badge}</span><img src={book.image} width={book.width} height={book.height} alt={`${book.title} 표지`} />
                  <Heart className="class-heart" size={25} weight="bold" aria-label="관심 전자책" />
                </Link>
                <div className="class-product-copy"><h3><Link href={book.href}>{book.title}</Link></h3><p>{book.subtitle}</p><small>{book.category} · {book.creator}</small><strong>19,000원</strong></div>
              </article>
            ))}
          </div>
        ) : <div className="class-empty"><MagnifyingGlass size={34} /><h3>검색 결과가 없습니다</h3><p>다른 주제나 카테고리를 선택해 보세요.</p><button type="button" onClick={() => { setQuery(""); setCategory("전체"); }}>전체 전자책 보기</button></div>}
      </section>

      <section className="class-start-banner">
        <div><RocketLaunch size={34} weight="duotone" /><p>어떤 책부터 읽어야 할지 고민된다면</p><h2>지금 해결하고 싶은 문제에서 시작하세요.</h2></div>
        <a href="#books">나에게 맞는 전자책 찾기 <ArrowRight size={18} weight="bold" /></a>
      </section>

      <footer className="class-footer"><Link className="class-logo" href="/"><BookOpen weight="fill" size={25} /><strong>PHILIP BOOKS</strong></Link><p>실제 경험을 실행 가능한 지식으로 만듭니다.</p><div><Link href="/codex">AI 서비스 제작</Link><Link href="/career">UI/UX 커리어</Link><Link href="/jane">승무원에서 IT로</Link></div><small>© 2026 PHILIP BOOKS</small></footer>
    </main>
  );
}
