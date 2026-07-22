"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { UserCircle } from "@phosphor-icons/react";
import GoogleGMark from "./GoogleGMark";

type User = { id: string; email: string; name: string; displayName?: string; picture?: string; role?: string };
type ConsentFlow = "signup" | "reactivate" | null;

const googleErrors: Record<string, string> = {
  google_unavailable: "Google 로그인을 준비 중입니다. 잠시 후 다시 시도해 주세요.",
  google_invalid_state: "Google 로그인 요청이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.",
  google_cancelled: "Google 로그인이 취소되었습니다.",
  google_missing_code: "Google 인증 정보를 받지 못했습니다.",
  google_account_link_required: "같은 이메일의 기존 계정이 있습니다. 기존 방식으로 로그인한 뒤 프로필에서 Google 계정을 연결해 주세요.",
  google_already_linked: "이 Google 계정은 다른 회원에게 이미 연결되어 있습니다.",
  member_has_google: "이미 다른 Google 계정이 연결되어 있습니다.",
  suspended: "이용이 정지된 계정입니다. 고객센터에 문의해 주세요.",
  google_failed: "Google 로그인을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

export default function GoogleAccount({ mode = "compact" }: { mode?: "compact" | "icon" | "panel" | "login" }) {
  const [user, setUser] = useState<User | null>(null);
  const [oauthEnabled, setOauthEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [consentFlow, setConsentFlow] = useState<ConsentFlow>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/session", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/auth/config", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([session, config]) => {
      setUser(session.user ?? null);
      setOauthEnabled(config.googleOAuthEnabled === true);
      const params = new URLSearchParams(window.location.search);
      const authError = params.get("auth_error");
      if (authError) setError(googleErrors[authError] ?? "Google 로그인 중 문제가 발생했습니다.");
      if (params.get("google") === "consent") {
        fetch("/api/auth/google/pending", { cache: "no-store" })
          .then((response) => response.json())
          .then((result: { pending?: boolean; flow?: ConsentFlow }) => {
            if (result.pending && result.flow) setConsentFlow(result.flow);
            else setError("Google 로그인 시간이 만료되었습니다. 다시 시도해 주세요.");
          })
          .catch(() => setError("Google 가입 정보를 확인하지 못했습니다."));
      }
      setReady(true);
    }).catch(() => {
      setError("로그인 정보를 불러오지 못했습니다.");
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const syncAuth = (event: Event) => setUser((event as CustomEvent<User | null>).detail ?? null);
    window.addEventListener("philip-auth-changed", syncAuth);
    return () => window.removeEventListener("philip-auth-changed", syncAuth);
  }, []);

  async function completeConsent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consentFlow) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/google/pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        termsAccepted: form.get("termsAccepted") === "on",
        privacyAccepted: form.get("privacyAccepted") === "on",
        marketingConsent: form.get("marketingConsent") === "on",
      }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string; user?: User; returnTo?: string };
    if (!response.ok) {
      setError(result.error ?? "Google 회원가입을 완료하지 못했습니다.");
      setSubmitting(false);
      return;
    }
    window.dispatchEvent(new CustomEvent("philip-auth-changed", { detail: result.user ?? null }));
    window.location.href = result.returnTo?.startsWith("/") && !result.returnTo.startsWith("//") ? result.returnTo : "/mypage";
  }

  const logout = async () => {
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError("로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setUser(null);
      window.dispatchEvent(new CustomEvent("philip-auth-changed", { detail: null }));
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    }
  };

  if (!ready) return mode === "icon"
    ? <span className="header-user-icon is-loading" aria-label="로그인 확인 중"><UserCircle size={27} weight="regular" aria-hidden="true" /></span>
    : <span className="google-account-loading">로그인 확인 중</span>;
  if (mode === "icon") return (
    <Link className="header-user-icon" href="/mypage" aria-label={user ? `${user.displayName ?? user.name}님의 마이페이지로 이동` : "로그인 또는 마이페이지로 이동"}>
      <UserCircle size={27} weight={user ? "fill" : "regular"} aria-hidden="true" />
    </Link>
  );
  if (user) return (
    <div>
      <div className={`google-account-user ${mode}`}>
        <Link className="google-account-profile-link" href="/mypage" aria-label={`${user.displayName ?? user.name}님의 마이페이지로 이동`}>
          <span aria-hidden="true">{(user.displayName ?? user.name).slice(0, 1).toUpperCase()}</span>
          <span><b>{user.displayName ?? user.name}</b><small>{mode === "panel" ? user.email : "마이페이지"}</small></span>
        </Link>
        <button type="button" onClick={logout}>로그아웃</button>
      </div>
      {error && <p className="google-account-error" role="alert">{error}</p>}
    </div>
  );
  if (mode === "compact") return <Link className="google-account-login-link" href="/mypage">로그인</Link>;
  if (mode !== "login") return oauthEnabled
    ? <Link className="google-account-login-link" href="/api/auth/google/start">Google 로그인</Link>
    : <div className="google-login-unavailable"><b>Google 로그인을 이용할 수 없습니다</b><p>잠시 후 다시 시도해 주세요.</p></div>;

  return <div className="google-account login">
    {oauthEnabled
      ? <a className="google-login-button auth-login-button" href="/api/auth/google/start"><GoogleGMark /><span>Google로 계속하기</span><i aria-hidden="true" /></a>
      : <button className="google-login-button auth-login-button is-disabled" type="button" disabled><GoogleGMark /><span>Google 로그인 준비 중</span><i aria-hidden="true" /></button>}
    {error && <p role="alert">{error}</p>}
    {consentFlow && <div className="account-consent-overlay" role="dialog" aria-modal="true" aria-labelledby="account-consent-title">
      <form className="account-consent-dialog" onSubmit={completeConsent}>
        <p>{consentFlow === "signup" ? "WELCOME" : "WELCOME BACK"}</p>
        <h2 id="account-consent-title">{consentFlow === "signup" ? "회원가입을 마무리해 주세요" : "계정을 다시 이용할까요?"}</h2>
        <div className="account-consent-copy">{consentFlow === "signup"
          ? "Google 계정으로 안전하게 로그인하고 구매 내역과 전자책을 한곳에서 관리합니다."
          : "재가입하면 보관 중인 기존 구매 내역과 유효한 전자책 열람 권한이 다시 연결됩니다."}</div>
        <label><input type="checkbox" name="termsAccepted" required /><span><b>[필수] 이용약관 동의</b><Link href="/terms" target="_blank">내용 보기</Link></span></label>
        <label><input type="checkbox" name="privacyAccepted" required /><span><b>[필수] 개인정보 수집·이용 동의</b><Link href="/privacy" target="_blank">내용 보기</Link></span></label>
        <label><input type="checkbox" name="marketingConsent" /><span><b>[선택] 새 책과 할인 소식 받기</b><small>동의하지 않아도 서비스 이용에 제한이 없습니다.</small></span></label>
        {consentFlow === "reactivate" && <div className="account-reactivation-note">탈퇴 시 보관된 법정 거래 기록은 그대로 유지되며, 재가입 후 기존 결제·환불 내역을 다시 확인할 수 있습니다.</div>}
        <div className="account-consent-actions"><button type="button" onClick={() => setConsentFlow(null)} disabled={submitting}>취소</button><button type="submit" disabled={submitting}>{submitting ? "처리 중…" : consentFlow === "signup" ? "동의하고 가입하기" : "동의하고 재가입하기"}</button></div>
        {error && <p className="account-consent-error" role="alert">{error}</p>}
      </form>
    </div>}
  </div>;
}
