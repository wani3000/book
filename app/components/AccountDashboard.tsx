"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { BookOpen, CheckCircle, Gear, Receipt, ShieldCheck, Star, UserCircle } from "@phosphor-icons/react";
import GoogleAccount from "./GoogleAccount";

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

type Order = { id: string; product: string; productTitle: string; amount: number; currency: string; status: string; createdAt: string };

const bookLinks: Record<string, string> = { codex: "/codex", career: "/career", jane: "/jane" };

export default function AccountDashboard() {
  const [member, setMember] = useState<Member | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ orders: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
    if (!window.confirm("회원 탈퇴 후 현재 계정으로 마이페이지를 이용할 수 없습니다. 정말 탈퇴할까요?")) return;
    const response = await fetch("/api/account/profile", { method: "DELETE" });
    if (!response.ok) { const data = await response.json(); setMessage(data.error ?? "탈퇴하지 못했습니다."); return; }
    window.location.href = "/";
  }

  if (loading) return <div className="account-loading">회원 정보를 불러오고 있습니다.</div>;
  if (!member) return (
    <section className="account-login-card">
      <span><UserCircle size={38} weight="duotone" /></span>
      <p>PHILIP BOOKS 회원</p><h1>로그인하고<br />구매 내역을 관리하세요.</h1>
      <ul><li><CheckCircle /> 구매한 전자책 확인</li><li><CheckCircle /> 프로필과 후기 관리</li><li><CheckCircle /> 한 계정에서 안전하게 이용</li></ul>
      <GoogleAccount mode="panel" />
      <Link href="/">로그인 없이 전자책 둘러보기 →</Link>
    </section>
  );

  return (
    <div className="mypage-grid">
      <aside className="mypage-sidebar">
        <div className="mypage-avatar">{member.displayName.slice(0, 1).toUpperCase()}</div>
        <h2>{member.displayName}</h2><p>{member.email}</p>
        <nav><a href="#overview"><UserCircle />계정 홈</a><a href="#orders"><Receipt />구매 내역</a><a href="#profile"><Gear />회원 정보</a></nav>
        {member.role === "admin" && <Link className="mypage-admin-link" href="/admin/members"><ShieldCheck />회원 관리</Link>}
        <GoogleAccount mode="panel" />
      </aside>

      <div className="mypage-content">
        <section id="overview" className="mypage-welcome"><p>MY PAGE</p><h1>{member.displayName}님,<br />다시 만나 반가워요.</h1><span>가입일 {new Date(member.createdAt).toLocaleDateString("ko-KR")}</span></section>
        <section className="mypage-stats"><article><BookOpen /><span>구매한 전자책</span><strong>{stats.orders}<small>권</small></strong></article><article><Star /><span>작성한 후기</span><strong>{stats.reviews}<small>개</small></strong></article></section>

        <section id="orders" className="mypage-panel"><div className="mypage-panel-title"><div><p>LIBRARY</p><h2>구매 내역</h2></div><Receipt size={28} /></div>
          {orders.length ? <div className="order-list">{orders.map((order) => <article key={order.id}><div><span>{order.status === "paid" ? "구매 완료" : order.status}</span><h3>{order.productTitle}</h3><p>{new Date(order.createdAt).toLocaleDateString("ko-KR")} · {order.amount.toLocaleString("ko-KR")}원</p></div><Link href={bookLinks[order.product] ?? "/"}>책 정보 보기 →</Link></article>)}</div>
            : <div className="mypage-empty"><BookOpen size={34} /><h3>아직 구매한 전자책이 없습니다.</h3><p>지금 필요한 경험에서 첫 책을 골라보세요.</p><Link href="/#books">전자책 둘러보기</Link></div>}
        </section>

        <section id="profile" className="mypage-panel"><div className="mypage-panel-title"><div><p>PROFILE</p><h2>회원 정보</h2></div><Gear size={28} /></div>
          <form className="profile-form" onSubmit={saveProfile}><label>표시 이름<input name="displayName" defaultValue={member.displayName} minLength={2} maxLength={30} required /></label><label>이메일<input value={member.email} readOnly /><small>Google 계정 이메일은 변경할 수 없습니다.</small></label><label className="profile-checkbox"><input type="checkbox" name="marketingConsent" defaultChecked={member.marketingConsent} /><span><b>새 책과 할인 소식 받기</b><small>언제든 이 설정을 끌 수 있습니다.</small></span></label><button type="submit">변경사항 저장</button><p role="status">{message}</p></form>
        </section>

        <section className="mypage-danger"><div><h2>회원 탈퇴</h2><p>탈퇴하면 현재 계정의 마이페이지 접근이 중단됩니다. 구매 기록은 법적 의무와 환불 처리를 위해 필요한 기간 동안 보관될 수 있습니다.</p></div><button type="button" onClick={deleteAccount}>회원 탈퇴</button></section>
      </div>
    </div>
  );
}
