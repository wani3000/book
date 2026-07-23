"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function QaLoginForm() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/qa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result = await response.json() as { error?: string; returnTo?: string };
      if (!response.ok) {
        setError(result.error ?? "로그인하지 못했습니다.");
        return;
      }
      window.location.href = result.returnTo ?? "/mypage";
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="qa-login-page">
    <form className="qa-login-form" onSubmit={login}>
      <p>QA ACCESS</p>
      <h1>관리자 테스트 로그인</h1>
      <span>외부 소셜 로그인 없이 회원·구매·환불 흐름을 검수합니다.</span>
      <label>QA 이메일<input name="email" type="email" autoComplete="username" required /></label>
      <label>QA 비밀번호<input name="password" type="password" autoComplete="current-password" required /></label>
      <button type="submit" disabled={submitting}>{submitting ? "로그인 중…" : "QA 관리자로 로그인"}</button>
      {error && <div role="alert">{error}</div>}
      <Link href="/mypage">일반 로그인으로 돌아가기</Link>
    </form>
  </main>;
}
