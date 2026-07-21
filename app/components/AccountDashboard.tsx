"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowCounterClockwise, ArrowRight, BookOpen, Gear, Receipt, ShieldCheck, Star, UserCircle } from "@phosphor-icons/react";
import GoogleAccount from "./GoogleAccount";
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
};

type Order = { id: string; product: string; productTitle: string; amount: number; currency: string; status: string; provider?: string; providerReference?: string; createdAt: string; downloadUrl?: string; testEntitlement?: boolean; firstAccessedAt?: string | null; simpleChangeEligible?: boolean; refundId?: string | null; refundStatus?: string | null; refundDecisionNote?: string | null; refundRequestedAt?: string | null };

const bookLinks: Record<string, string> = { codex: "/codex", career: "/career", jane: "/jane" };
type MyPageSection = "overview" | "orders" | "profile";

export default function AccountDashboard() {
  const [member, setMember] = useState<Member | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ orders: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState<MyPageSection>("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const profileResponse = await fetch("/api/account/profile", { cache: "no-store" });
    if (profileResponse.status === 401) {
      setMember(null); setOrders([]); setLoading(false); return;
    }
    const profile = await profileResponse.json();
    if (!profileResponse.ok) { setMessage(profile.error ?? "회원 정보를 불러오지 못했습니다."); setLoading(false); return; }
    setMember(profile.member); setStats(profile.stats);
    const orderResponse = await fetch("/api/account/orders", { cache: "no-store" });
    const orderData = await orderResponse.json();
    setOrders(orderData.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
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
      setActiveSection(section === "orders" || section === "profile" ? section : "overview");
    };
    syncSection();
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

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

  if (loading) return <div className="account-loading">회원 정보를 불러오고 있습니다.</div>;
  if (!member) return (
    <section className="account-login-shell">
      <div className="account-login-card">
        <span><BookOpen size={40} weight="fill" /></span>
        <p>PHILIP BOOKS</p>
        <h1>로그인하고<br />나의 전자책을 만나보세요</h1>
        <div className="account-login-copy">Google 계정 하나로 구매 내역과 전자책을<br />안전하게 관리할 수 있습니다.</div>
        <GoogleAccount mode="login" />
        <small className="account-login-note">처음 이용하는 계정은 Google 인증 후 필수 약관 동의를 확인합니다.</small>
        <Link href="/#books">로그인 없이 전자책 둘러보기</Link>
      </div>
    </section>
  );

  return (
    <div className="mypage-grid">
      <aside className="mypage-sidebar">
        <div className="mypage-profile-head">
          <span className="mypage-avatar"><UserCircle size={42} weight="fill" aria-hidden="true" /></span>
          <span className="mypage-profile-copy"><strong>{member.displayName}</strong><small>{member.email}</small></span>
          <a className="mypage-manage-link" href="#profile" onClick={() => setActiveSection("profile")}>계정 관리</a>
        </div>

        <section className="mypage-summary" aria-label="내 활동 요약">
          <div><span>구매한 전자책</span><strong>{stats.orders}<small>권</small></strong></div>
          <div><span>작성한 후기</span><strong>{stats.reviews}<small>개</small></strong></div>
        </section>

        <a className="mypage-library-link" href="#orders" onClick={() => setActiveSection("orders")}><span>내 전자책 바로 보기</span><b>내 서재</b><ArrowRight size={20} weight="bold" /></a>

        <p className="mypage-menu-label">PHILIP BOOKS</p>
        <nav>
          <a className={activeSection === "overview" ? "active" : ""} href="#overview" aria-current={activeSection === "overview" ? "page" : undefined} onClick={() => setActiveSection("overview")}><BookOpen />내 서재</a>
          <a className={activeSection === "orders" ? "active" : ""} href="#orders" aria-current={activeSection === "orders" ? "page" : undefined} onClick={() => setActiveSection("orders")}><Receipt />주문 내역</a>
          <a className={activeSection === "profile" ? "active" : ""} href="#profile" aria-current={activeSection === "profile" ? "page" : undefined} onClick={() => setActiveSection("profile")}><Gear />프로필 관리</a>
          <Link href="/#books"><Star />전자책 둘러보기</Link>
        </nav>
        {member.role === "admin" && <div className="mypage-admin-links"><Link className="mypage-admin-link" href="/admin/members"><ShieldCheck />회원 관리</Link><Link className="mypage-admin-link" href="/admin/reviews"><Star />후기 관리</Link><Link className="mypage-admin-link" href="/admin/refunds"><ArrowCounterClockwise />환불 관리</Link><Link className="mypage-admin-link" href="/admin/payments"><ArrowCounterClockwise />결제 상태 관리</Link></div>}
        <GoogleAccount mode="panel" />
      </aside>

      <div className="mypage-content">
        {activeSection === "overview" && <section id="overview" className="mypage-welcome"><p>MY LIBRARY</p><h1>구매한 전자책을<br />한곳에서 확인하세요.</h1><span>{member.displayName}님의 구매 내역과 PDF를 안전하게 관리합니다.</span><a href="#orders" onClick={() => setActiveSection("orders")}>내 전자책 확인하기</a></section>}

        {activeSection === "orders" && <section id="orders" className="mypage-panel"><div className="mypage-panel-title"><div><p>LIBRARY</p><h2>내 전자책 · 주문 내역</h2></div><Receipt size={28} /></div>
          {orders.length ? <div className="order-list">{orders.map((order) => <article key={order.id}><div className="order-main"><span>{order.refundStatus === "requested" ? "환불 신청 완료" : order.refundStatus === "reviewing" ? "환불 검토 중" : order.refundStatus === "refunded" || order.status === "refunded" ? "환불 완료" : order.refundStatus === "rejected" ? "환불 불가" : (order.status === "paid" || order.testEntitlement) ? "구매 완료" : "처리 중"}</span><h3>{order.productTitle}</h3><p>{new Date(order.createdAt).toLocaleDateString("ko-KR")} · {order.amount.toLocaleString("ko-KR")}원{order.firstAccessedAt ? ` · 최초 열람 ${new Date(order.firstAccessedAt).toLocaleDateString("ko-KR")}` : " · 미열람"}</p><dl className="order-meta"><div><dt>주문번호</dt><dd>{order.id}</dd></div><div><dt>결제수단</dt><dd>{order.testEntitlement ? "테스트 열람 권한" : order.provider === "naverpay" ? "Npay" : order.provider === "kakaopay" ? "카카오페이" : order.provider ?? "결제 확인 중"}</dd></div></dl><RefundRequestForm order={order} onSubmitted={load} /></div><div className="order-actions">{order.downloadUrl && <a className="order-read" href={order.downloadUrl} target="_blank" rel="noreferrer">PDF 읽기</a>}<Link href={bookLinks[order.product] ?? "/"}>책 정보</Link></div></article>)}</div>
            : <div className="mypage-empty"><BookOpen size={34} /><h3>아직 구매한 전자책이 없습니다.</h3><p>지금 필요한 경험에서 첫 책을 골라보세요.</p><Link href="/#books">전자책 둘러보기</Link></div>}
        </section>}

        {activeSection === "profile" && <><section id="profile" className="mypage-panel"><div className="mypage-panel-title"><div><p>ACCOUNT</p><h2>프로필 관리</h2></div><Gear size={28} /></div>
          <form className="profile-form" onSubmit={saveProfile}><label>표시 이름<input name="displayName" defaultValue={member.displayName} minLength={2} maxLength={30} required /></label><label>이메일<input value={member.email} readOnly /><small>Google 계정 이메일은 변경할 수 없습니다.</small></label><label className="profile-checkbox"><input type="checkbox" name="marketingConsent" defaultChecked={member.marketingConsent} /><span><b>새 책과 할인 소식 받기</b><small>언제든 이 설정을 끌 수 있습니다.</small></span></label><button type="submit">변경사항 저장</button><p role="status">{message}</p></form>
        </section>

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
        </>}
      </div>
    </div>
  );
}
