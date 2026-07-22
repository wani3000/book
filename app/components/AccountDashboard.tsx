"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, MouseEvent, useCallback, useEffect, useState } from "react";
import { ArrowCounterClockwise, ArrowLeft, ArrowRight, BookOpen, Gear, Receipt, ShieldCheck, SignOut, Star, UserCircle } from "@phosphor-icons/react";
import GoogleAccount from "./GoogleAccount";
import GoogleIdentity from "./GoogleIdentity";
import KakaoAccount from "./KakaoAccount";
import RefundRequestForm from "./RefundRequestForm";

type Member = {
  id: string;
  email: string;
  name: string;
  displayName: string;
  picture?: string;
  role: "member" | "admin";
  marketingConsent: boolean;
  createdAt: string;
  linkedProviders: string[];
};

type Order = { id: string; product: string; productTitle: string; amount: number; currency: string; status: string; provider?: string; providerReference?: string; createdAt: string; downloadUrl?: string; testEntitlement?: boolean; firstAccessedAt?: string | null; simpleChangeEligible?: boolean; refundId?: string | null; refundStatus?: string | null; refundDecisionNote?: string | null; refundRequestedAt?: string | null };

const bookLinks: Record<string, string> = { codex: "/codex", career: "/career", jane: "/jane" };
const libraryBooks: Record<string, { cover: string; creator: string }> = {
  codex: { cover: "/ebook-cover.png", creator: "필립" },
  career: { cover: "/career-cover.png", creator: "필립" },
  jane: { cover: "/jane-cover.png", creator: "제인" },
};
type MyPageSection = "overview" | "library" | "orders" | "profile";

function MyPageHeader({ title, fallbackHref }: { title: string; fallbackHref: string }) {
  const goBack = () => window.location.assign(fallbackHref);

  return <header className="mypage-page-header"><div>
    <button type="button" onClick={goBack} aria-label={fallbackHref === "/" ? "이전 페이지로 돌아가기" : "마이페이지로 돌아가기"}><ArrowLeft size={24} weight="bold" /></button>
    <strong>{title}</strong>
    <span aria-hidden="true" />
  </div></header>;
}

export default function AccountDashboard() {
  const [member, setMember] = useState<Member | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ orders: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState<MyPageSection>("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (showPageLoader = false) => {
    if (showPageLoader) setLoading(true);
    setOrdersLoading(true);
    const orderRequest = fetch("/api/account/orders", { cache: "no-store" })
      .then(async (response) => ({ response, data: await response.json().catch(() => ({})) as { orders?: Order[] } }))
      .catch(() => null);

    try {
      const profileResponse = await fetch("/api/account/profile", { cache: "no-store" });
      const profile = await profileResponse.json().catch(() => ({})) as { member?: Member; stats?: { orders: number; reviews: number }; error?: string };
      if (profileResponse.status === 401) {
        setMember(null);
        setOrders([]);
        return;
      }
      if (!profileResponse.ok || !profile.member || !profile.stats) {
        setMessage(profile.error ?? "회원 정보를 불러오지 못했습니다.");
        return;
      }

      setMember(profile.member);
      setStats(profile.stats);
      setLoading(false);

      const orderResult = await orderRequest;
      setOrders(orderResult?.response.ok ? orderResult.data.orders ?? [] : []);
    } catch {
      setMessage("회원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(true), 0);
    const refresh = () => {
      const next = new URLSearchParams(window.location.search).get("next");
      if (next?.startsWith("/") && !next.startsWith("//")) window.location.href = next;
      else void load();
    };
    window.addEventListener("philip-auth-changed", refresh);
    return () => { window.clearTimeout(initialLoad); window.removeEventListener("philip-auth-changed", refresh); };
  }, [load]);

  useEffect(() => {
    const syncSection = () => {
      const section = window.location.hash.slice(1);
      setActiveSection(section === "library" || section === "orders" || section === "profile" ? section : "overview");
    };
    syncSection();
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeSection]);

  function openSection(event: MouseEvent<HTMLAnchorElement>, section: Exclude<MyPageSection, "overview">) {
    event.preventDefault();
    window.history.pushState(null, "", `#${section}`);
    setActiveSection(section);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("저장 중입니다…");
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: form.get("displayName"), marketingConsent: form.get("marketingConsent") === "on" }),
    });
    const data = await response.json();
    setMessage(response.ok ? "회원 정보가 저장되었습니다." : data.error ?? "저장하지 못했습니다.");
    if (response.ok) await load();
  }

  async function logout() {
    setMessage("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setMessage("로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setMember(null);
      window.dispatchEvent(new CustomEvent("philip-auth-changed", { detail: null }));
      window.history.replaceState(null, "", "/mypage");
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      setMessage("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    setMessage("");
    const response = await fetch("/api/account/profile", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: deleteConfirmation, acknowledged: deleteAcknowledged }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "탈퇴하지 못했습니다.");
      setDeleting(false);
      return;
    }
    window.dispatchEvent(new CustomEvent("philip-auth-changed", { detail: null }));
    window.location.href = "/?account=deleted";
  }

  if (loading) return <><MyPageHeader title="마이페이지" fallbackHref="/" /><div className="account-loading">회원 정보를 불러오고 있습니다.</div></>;
  if (!member) return (
    <section className="account-login-shell">
      <header className="account-login-header">
        <Link href="/" className="account-login-back" aria-label="스토어로 돌아가기"><ArrowLeft size={25} weight="bold" /></Link>
        <Link href="/" className="account-login-brand" aria-label="다니엘의 노트 홈">
          <BookOpen size={27} weight="fill" aria-hidden="true" />
          <strong>다니엘의 노트</strong>
        </Link>
        <span aria-hidden="true" />
      </header>
      <div className="account-login-card">
        <p>당신의 다음 장을 위한 기록</p>
        <h1>누군가의 경험이<br />당신의 다음 시작이 되도록.</h1>
        <div className="account-login-copy">카카오 또는 Google 계정으로 계속하면 구매한 전자책과<br />나의 기록을 한곳에서 안전하게 관리할 수 있습니다.</div>
        <div className="account-login-providers"><KakaoAccount mode="login" /><GoogleAccount mode="login" /></div>
        <small className="account-login-note">처음 방문하셨나요? 로그인하면 회원가입이 함께 진행됩니다.</small>
        <Link href="/#books">로그인 없이 전자책 둘러보기</Link>
      </div>
    </section>
  );

  const pageTitle = activeSection === "overview" ? "마이페이지" : activeSection === "library" ? "내 서재" : activeSection === "orders" ? "주문 내역" : "프로필 관리";
  const hasCustomerEmail = !member.email.endsWith("@daniels-note.kakao.local");
  const accountLabel = hasCustomerEmail ? member.email : "카카오 계정으로 로그인";

  return (<>
    <MyPageHeader title={pageTitle} fallbackHref={activeSection === "overview" ? "/" : "/mypage"} />
    <div className={`mypage-grid ${activeSection === "overview" ? "is-home" : "is-detail"}`}>
      {activeSection === "overview" ? <aside className="mypage-sidebar">
        <div className="mypage-profile-head">
          <span className="mypage-avatar"><UserCircle size={42} weight="fill" aria-hidden="true" /></span>
          <span className="mypage-profile-copy"><strong>{member.displayName}</strong><small>{accountLabel}</small></span>
          <a className="mypage-manage-link" href="#profile" onClick={(event) => openSection(event, "profile")}>프로필 관리</a>
        </div>

        <section className="mypage-summary" aria-label="내 활동 요약">
          <div><span>구매한 전자책</span><strong>{stats.orders}<small>권</small></strong></div>
          <div><span>작성한 후기</span><strong>{stats.reviews}<small>개</small></strong></div>
        </section>

        <a className="mypage-library-link" href="#library" onClick={(event) => openSection(event, "library")}><span>내 전자책 바로 보기</span><b>내 서재</b><ArrowRight size={20} weight="bold" /></a>

        <p className="mypage-menu-label">다니엘의 노트</p>
        <nav>
          <a href="#library" onClick={(event) => openSection(event, "library")}><BookOpen />내 서재<ArrowRight className="mypage-menu-arrow" weight="bold" /></a>
          <a href="#orders" onClick={(event) => openSection(event, "orders")}><Receipt />주문 내역<ArrowRight className="mypage-menu-arrow" weight="bold" /></a>
          <a href="#profile" onClick={(event) => openSection(event, "profile")}><Gear />프로필 관리<ArrowRight className="mypage-menu-arrow" weight="bold" /></a>
          <button type="button" onClick={logout}><SignOut />로그아웃</button>
        </nav>
        {member.role === "admin" && <div className="mypage-admin-links"><Link className="mypage-admin-link" href="/admin/members"><ShieldCheck />회원 관리</Link><Link className="mypage-admin-link" href="/admin/reviews"><Star />후기 관리</Link><Link className="mypage-admin-link" href="/admin/refunds"><ArrowCounterClockwise />환불 관리</Link><Link className="mypage-admin-link" href="/admin/payments"><ArrowCounterClockwise />결제 상태 관리</Link></div>}
      </aside> : <div className="mypage-detail">

        {activeSection === "library" && <section id="library" className="mypage-panel mypage-library-panel">
          {ordersLoading ? <div className="mypage-inline-loading" role="status">내 전자책을 불러오고 있습니다.</div> : orders.length ? <div className="mypage-library-grid">{orders.map((order) => {
            const book = libraryBooks[order.product];
            return <article key={order.id}>
              <div className="mypage-library-cover">{book && <Image src={book.cover} width={96} height={136} alt={`${order.productTitle} 표지`} unoptimized />}</div>
              <div className="mypage-library-copy"><span>구매 완료</span><h2>{order.productTitle}</h2><p>{book?.creator ?? "다니엘의 노트"} 지음 · PDF 전자책</p></div>
              <div className="mypage-library-actions">{order.downloadUrl && <a href={order.downloadUrl} target="_blank" rel="noreferrer">PDF 읽기</a>}<Link href={bookLinks[order.product] ?? "/"}>책 정보</Link></div>
            </article>;
          })}</div> : <div className="mypage-empty"><BookOpen size={34} /><h3>아직 구매한 전자책이 없습니다.</h3><p>지금 필요한 경험에서 첫 책을 골라보세요.</p><Link href="/#books">전자책 둘러보기</Link></div>}
        </section>}

        {activeSection === "orders" && <section id="orders" className="mypage-panel mypage-orders-panel">
          {ordersLoading ? <div className="mypage-inline-loading" role="status">주문 내역을 불러오고 있습니다.</div> : orders.length ? <div className="order-list">{orders.map((order) => <article key={order.id}><div className="order-main"><span>{order.refundStatus === "requested" ? "환불 신청 완료" : order.refundStatus === "reviewing" ? "환불 검토 중" : order.refundStatus === "refunded" || order.status === "refunded" ? "환불 완료" : order.refundStatus === "rejected" ? "환불 불가" : (order.status === "paid" || order.testEntitlement) ? "구매 완료" : "처리 중"}</span><h3>{order.productTitle}</h3><p>{new Date(order.createdAt).toLocaleDateString("ko-KR")} · {order.amount.toLocaleString("ko-KR")}원{order.firstAccessedAt ? ` · 최초 열람 ${new Date(order.firstAccessedAt).toLocaleDateString("ko-KR")}` : " · 미열람"}</p><dl className="order-meta"><div><dt>주문번호</dt><dd>{order.id}</dd></div><div><dt>결제수단</dt><dd>{order.testEntitlement ? "테스트 열람 권한" : order.provider === "naverpay" ? "Npay" : order.provider === "kakaopay" ? "카카오페이" : order.provider ?? "결제 확인 중"}</dd></div></dl><RefundRequestForm order={order} onSubmitted={load} /></div><div className="order-actions">{order.downloadUrl && <a className="order-read" href={order.downloadUrl} target="_blank" rel="noreferrer">PDF 읽기</a>}<Link href={bookLinks[order.product] ?? "/"}>책 정보</Link></div></article>)}</div>
            : <div className="mypage-empty"><BookOpen size={34} /><h3>아직 구매한 전자책이 없습니다.</h3><p>지금 필요한 경험에서 첫 책을 골라보세요.</p><Link href="/#books">전자책 둘러보기</Link></div>}
        </section>}

        {activeSection === "profile" && <div className="mypage-profile-sections"><section id="profile" className="mypage-panel mypage-profile-panel">
          <form className="profile-form" onSubmit={saveProfile}><label>표시 이름<input name="displayName" defaultValue={member.displayName} minLength={2} maxLength={30} required /></label><label>{hasCustomerEmail ? "이메일" : "로그인 계정"}<input className="profile-readonly-field" value={accountLabel} disabled aria-describedby="profile-email-note" /><small id="profile-email-note">{hasCustomerEmail ? "가입한 로그인 계정의 확인된 이메일입니다." : "카카오가 이메일을 제공하지 않아 계정 종류만 표시합니다."}</small></label><label className="profile-checkbox"><input type="checkbox" name="marketingConsent" defaultChecked={member.marketingConsent} disabled={!hasCustomerEmail} /><span><b>새 책과 할인 소식 받기</b><small>{hasCustomerEmail ? "언제든 이 설정을 끌 수 있습니다." : "이메일 계정을 연결하면 소식 수신을 설정할 수 있습니다."}</small></span></label><button type="submit">변경사항 저장</button><p role="status">{message}</p></form>
        </section>

        <section className="mypage-panel identity-connections"><div className="mypage-clean-heading"><h2>로그인 계정 연결</h2><p>로그인 수단을 추가해도 구매 내역과 PDF 권한은 하나의 회원 계정에 그대로 유지됩니다.</p></div><GoogleIdentity connected={member.linkedProviders.includes("google")} onChanged={load} /><KakaoAccount mode="connect" connected={member.linkedProviders.includes("kakao")} onChanged={load} /></section>

        <section className="mypage-danger"><div><h2>회원 탈퇴</h2><p>탈퇴 즉시 로그아웃되고 PDF 열람이 중단됩니다. 거래 기록은 법정 기간 동안 분리 보관하며, 같은 Google 계정으로 재가입할 때 기존 구매 내역과 유효한 열람 권한을 명시적 동의 후 복원합니다.</p></div><button type="button" onClick={() => setDeleteOpen(true)}>회원 탈퇴</button></section>
        {deleteOpen && <div className="account-delete-overlay" role="dialog" aria-modal="true" aria-labelledby="account-delete-title">
          <div className="account-delete-dialog">
            <p>DANGER ZONE</p><h2 id="account-delete-title">회원 탈퇴 전 확인해 주세요</h2>
            <ul><li>즉시 로그아웃되며 마이페이지와 PDF를 이용할 수 없습니다.</li><li>진행 중인 환불 신청이 있으면 처리가 끝날 때까지 탈퇴할 수 없습니다.</li><li>주문·결제·환불 기록은 관계 법령에 따라 필요한 기간 동안 보관됩니다.</li><li>같은 Google 계정으로 재가입하면 별도 동의 후 기존 구매 내역과 유효한 이용권이 복원됩니다.</li></ul>
            <label>확인을 위해 <b>회원 탈퇴</b>를 입력해 주세요<input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" /></label>
            <label className="account-delete-check"><input type="checkbox" checked={deleteAcknowledged} onChange={(event) => setDeleteAcknowledged(event.target.checked)} /><span>위 내용을 확인했으며 회원 탈퇴를 요청합니다.</span></label>
            {message && <p className="account-delete-error" role="alert">{message}</p>}
            <div><button type="button" onClick={() => { setDeleteOpen(false); setDeleteConfirmation(""); setDeleteAcknowledged(false); setMessage(""); }} disabled={deleting}>취소</button><button type="button" onClick={deleteAccount} disabled={deleting || deleteConfirmation !== "회원 탈퇴" || !deleteAcknowledged}>{deleting ? "처리 중…" : "회원 탈퇴 확정"}</button></div>
          </div>
        </div>}
        </div>}
      </div>
      }
    </div>
  </>);
}
