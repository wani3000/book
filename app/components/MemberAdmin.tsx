"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, ShieldCheck, UserCircle, UsersThree } from "@phosphor-icons/react";

type Member = { id: string; email: string; name: string; displayName: string; role: string; status: string; marketingConsent: number; createdAt: string; lastLoginAt: string };

export default function MemberAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/members", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "회원 목록을 불러오지 못했습니다.");
    else { setMembers(data.members ?? []); setError(""); }
    setLoading(false);
  }, []);

  useEffect(() => { const initialLoad = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(initialLoad); }, [load]);

  const visible = useMemo(() => members.filter((member) => {
    const queryMatch = !query.trim() || `${member.displayName} ${member.name} ${member.email}`.toLowerCase().includes(query.trim().toLowerCase());
    const statusMatch = filter === "all" || member.status === filter || member.role === filter;
    return queryMatch && statusMatch;
  }), [filter, members, query]);

  async function updateMember(member: Member, changes: Partial<Pick<Member, "status" | "role">>) {
    const status = changes.status ?? member.status;
    const role = changes.role ?? member.role;
    const action = status === "suspended" ? "이용 정지" : role === "admin" ? "관리자 지정" : "회원 정보 변경";
    if (!window.confirm(`${member.displayName} 회원을 ${action} 처리할까요?`)) return;
    const response = await fetch("/api/admin/members", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: member.id, status, role }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error ?? "회원 정보를 변경하지 못했습니다."); return; }
    await load();
  }

  if (loading) return <div className="admin-state">회원 목록을 불러오고 있습니다.</div>;
  if (error && !members.length) return <div className="admin-state"><ShieldCheck size={38} /><h1>회원 관리에 접근할 수 없습니다.</h1><p>{error}</p><Link href="/mypage">마이페이지로 돌아가기</Link></div>;

  const activeCount = members.filter((member) => member.status === "active").length;
  const adminCount = members.filter((member) => member.role === "admin").length;

  return <div className="admin-members">
    <section className="admin-title"><p>MEMBER ADMIN</p><h1>회원 관리</h1><span>가입 회원의 상태와 관리자 권한을 확인하고 관리합니다.</span></section>
    <section className="admin-summary"><article><UsersThree /><span>전체 회원</span><strong>{members.length}</strong></article><article><UserCircle /><span>활성 회원</span><strong>{activeCount}</strong></article><article><ShieldCheck /><span>관리자</span><strong>{adminCount}</strong></article></section>
    <section className="admin-toolbar"><label><MagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름 또는 이메일 검색" /></label><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">전체 회원</option><option value="active">활성</option><option value="suspended">이용 정지</option><option value="deleted">탈퇴</option><option value="admin">관리자</option></select></section>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <section className="admin-table-shell"><table><thead><tr><th>회원</th><th>상태</th><th>권한</th><th>가입일</th><th>최근 로그인</th><th>관리</th></tr></thead><tbody>{visible.map((member) => <tr key={member.id}><td><b>{member.displayName}</b><span>{member.email}</span></td><td><i className={`member-status ${member.status}`}>{member.status === "active" ? "활성" : member.status === "suspended" ? "정지" : "탈퇴"}</i></td><td>{member.role === "admin" ? "관리자" : "회원"}</td><td>{new Date(member.createdAt).toLocaleDateString("ko-KR")}</td><td>{new Date(member.lastLoginAt).toLocaleDateString("ko-KR")}</td><td><div><button disabled={member.status === "deleted"} onClick={() => updateMember(member, { status: member.status === "suspended" ? "active" : "suspended" })}>{member.status === "suspended" ? "정지 해제" : "이용 정지"}</button><button disabled={member.status === "deleted"} onClick={() => updateMember(member, { role: member.role === "admin" ? "member" : "admin" })}>{member.role === "admin" ? "관리자 해제" : "관리자 지정"}</button></div></td></tr>)}</tbody></table>{!visible.length && <div className="admin-empty">조건에 맞는 회원이 없습니다.</div>}</section>
  </div>;
}
