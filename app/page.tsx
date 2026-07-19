import Image from "next/image";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const books = [
  {
    href: "/codex",
    image: "/ebook-cover.png",
    width: 991,
    height: 1406,
    tone: "lime",
    category: "AI · 서비스 제작",
    title: "아이디어를 서비스로 바꾸는 Codex 사용법",
    description: "비개발자가 폴더 생성부터 배포·결제·SEO·자동화까지 혼자 완성하는 실전서",
    author: "필립",
    pages: "258쪽",
    badge: "초보자 추천",
  },
  {
    href: "/career",
    image: "/career-cover.png",
    width: 933,
    height: 1323,
    tone: "violet",
    category: "UI/UX · 커리어",
    title: "커리어도 디자인할 수 있습니다",
    description: "작은 팀과 해외 프로젝트에서 대기업 이직까지, 경험을 포트폴리오 증거로 바꾸는 법",
    author: "필립",
    pages: "63쪽",
    badge: "디자이너 필독",
  },
  {
    href: "/seonara",
    image: "/seonara-cover.png",
    width: 1007,
    height: 1429,
    tone: "teal",
    category: "이직 · 서비스 운영",
    title: "승무원 다음은 IT였습니다",
    description: "연기 전공과 객실승무원 경험을 IT 프로젝트 운영 역량으로 번역한 실제 커리어 전환기",
    author: "서나라",
    pages: "56쪽",
    badge: "커리어 전환",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "PHILIP BOOKS 실전 전자책 컬렉션",
  itemListElement: books.map((book, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${siteUrl}${book.href}`,
    name: book.title,
  })),
};

export default function BookstoreHome() {
  return (
    <main className="bookstore-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="store-nav">
        <Link className="store-logo" href="/" aria-label="PHILIP BOOKS 홈">
          <span>PHILIP</span> BOOKS<i />
        </Link>
        <nav aria-label="주요 메뉴">
          <a href="#books">전체 전자책</a>
          <a href="#guide">추천 가이드</a>
          <a href="#about">브랜드 소개</a>
        </nav>
        <a className="store-nav-cta" href="#books">내 책 찾기 <span>↘</span></a>
      </header>

      <section className="store-hero">
        <div className="store-hero-copy">
          <p className="store-eyebrow">REAL EXPERIENCE. PRACTICAL PLAYBOOK.</p>
          <h1>배운 것을 넘어,<br /><em>해낸 경험</em>을 팝니다.</h1>
          <p>AI로 서비스를 만드는 법부터 UI/UX 디자이너의 커리어, 승무원에서 IT로 이동한 과정까지. 실제로 해본 사람의 시행착오를 바로 실행할 수 있는 전자책으로 만났습니다.</p>
          <div className="store-hero-actions">
            <a className="store-button dark" href="#books">전자책 둘러보기 <span>↓</span></a>
            <a className="store-text-link" href="#guide">나에게 맞는 책 찾기</a>
          </div>
          <div className="store-hero-metrics">
            <div><strong>3</strong><span>실전 전자책</span></div>
            <div><strong>377+</strong><span>전체 페이지</span></div>
            <div><strong>₩19,000</strong><span>권당 가격</span></div>
          </div>
        </div>
        <div className="store-hero-books" aria-label="전자책 세 권 표지">
          {books.map((book, index) => (
            <Link className={`store-hero-book book-${index + 1}`} href={book.href} key={book.href} aria-label={`${book.title} 상세보기`}>
              <Image src={book.image} width={book.width} height={book.height} alt={`${book.title} 표지`} priority />
            </Link>
          ))}
          <span className="store-float-label label-one">AI SOLO BUILDER</span>
          <span className="store-float-label label-two">CAREER PLAYBOOK</span>
        </div>
      </section>

      <section className="store-topic-strip" aria-label="전자책 주제">
        <span>관심 분야로 빠르게 찾기</span>
        <a href="#books">AI 서비스 제작</a>
        <a href="#books">UI/UX 커리어</a>
        <a href="#books">비전공자 이직</a>
        <a href="#books">서비스 운영</a>
      </section>

      <section className="store-section" id="books">
        <div className="store-section-head">
          <div><p>ALL BOOKS</p><h2>지금 필요한 다음 한 걸음</h2></div>
          <span>성공담보다 결정 과정, 도구보다 실제 사용법을 담았습니다.</span>
        </div>
        <div className="store-book-grid">
          {books.map((book, index) => (
            <article className={`store-book-card ${book.tone}`} key={book.href}>
              <Link className="store-book-visual" href={book.href} aria-label={`${book.title} 상세보기`}>
                <span className="store-rank">0{index + 1}</span>
                <span className="store-badge">{book.badge}</span>
                <Image src={book.image} width={book.width} height={book.height} alt={`${book.title} 표지`} />
              </Link>
              <div className="store-book-info">
                <p>{book.category}</p>
                <h3><Link href={book.href}>{book.title}</Link></h3>
                <span>{book.description}</span>
                <div className="store-book-meta"><b>{book.author}</b><i />{book.pages}<i />PDF</div>
                <div className="store-book-price"><strong>19,000원</strong><Link href={book.href}>상세보기 <span>→</span></Link></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="store-guide" id="guide">
        <div className="store-guide-head"><p>BOOK FINDER</p><h2>어떤 책부터<br />읽어야 할까요?</h2></div>
        <div className="store-guide-list">
          <Link href="/codex"><span>01</span><div><b>아이디어를 실제 웹서비스로 만들고 싶다면</b><p>코딩 경험이 없어도 Codex와 처음부터 끝까지 완성하는 방법</p></div><i>AI 서비스 제작</i><strong>↗</strong></Link>
          <Link href="/career"><span>02</span><div><b>UI/UX 디자이너로 더 큰 기회를 만들고 싶다면</b><p>프로젝트 선택, 포트폴리오, 해외 협업과 대기업 이직의 실제 기준</p></div><i>디자이너 커리어</i><strong>↗</strong></Link>
          <Link href="/seonara"><span>03</span><div><b>지금까지의 경력을 버리지 않고 IT로 옮기고 싶다면</b><p>비전공과 승무원 경험을 서비스 운영의 증거로 번역하는 방법</p></div><i>커리어 전환</i><strong>↗</strong></Link>
        </div>
      </section>

      <section className="store-values" id="about">
        <div><p>WHY PHILIP BOOKS</p><h2>읽고 끝나는 정보보다<br />내일 써먹는 경험.</h2></div>
        <div className="store-value-grid">
          <article><span>01</span><h3>실제 경험에서 출발</h3><p>해보지 않은 성공 공식을 만들지 않습니다. 프로젝트와 이직 과정에서 실제로 했던 선택을 다룹니다.</p></article>
          <article><span>02</span><h3>초보자의 언어</h3><p>전문 용어를 아는 사람만 이해하는 설명 대신, 첫 행동을 시작할 수 있는 말로 씁니다.</p></article>
          <article><span>03</span><h3>바로 쓰는 도구</h3><p>명령문, 체크리스트, 표와 워크시트로 읽은 내용을 자신의 일에 곧바로 적용합니다.</p></article>
        </div>
      </section>

      <section className="store-final">
        <p>당신의 다음 경험은 어디로 향하나요?</p>
        <h2>정답을 기다리지 말고,<br /><em>다음 장을 시작하세요.</em></h2>
        <a className="store-button lime" href="#books">전자책 3권 보기 <span>↗</span></a>
      </section>

      <footer className="store-footer">
        <div className="store-logo"><span>PHILIP</span> BOOKS<i /></div>
        <p>실제 경험을 실행 가능한 지식으로 만듭니다.</p>
        <div><Link href="/codex">Codex</Link><Link href="/career">UI/UX 커리어</Link><Link href="/seonara">승무원→IT</Link></div>
        <small>© 2026 PHILIP BOOKS. All rights reserved.</small>
      </footer>
    </main>
  );
}
