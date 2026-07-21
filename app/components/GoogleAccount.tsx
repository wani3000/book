"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type User = { id: string; email: string; name: string; displayName?: string; picture?: string; role?: string };
type GoogleCredentialResponse = { credential?: string };
type ConsentFlow = "signup" | "reactivate" | null;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void;
          renderButton(element: HTMLElement, options: Record<string, string | number | boolean>): void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";

export default function GoogleAccount({ mode = "compact" }: { mode?: "compact" | "panel" | "login" }) {
  const slot = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [clientId, setClientId] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [pendingCredential, setPendingCredential] = useState("");
  const [consentFlow, setConsentFlow] = useState<ConsentFlow>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/session", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/auth/config", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([session, config]) => {
      setUser(session.user ?? null);
      setClientId(config.clientId ?? "");
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

  const authenticate = useCallback(async (credential: string, options?: { termsAccepted: boolean; privacyAccepted: boolean; marketingConsent: boolean; reactivate: boolean }) => {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, ...options }),
      });
      const result = await response.json() as { error?: string; code?: string; user?: User };
      if (!response.ok) {
        if (result.code === "SIGNUP_CONSENT_REQUIRED" || result.code === "ACCOUNT_REACTIVATION_REQUIRED") {
          setPendingCredential(credential);
          setConsentFlow(result.code === "SIGNUP_CONSENT_REQUIRED" ? "signup" : "reactivate");
        }
        setError(result.error ?? "로그인하지 못했습니다.");
        return;
      }
      setPendingCredential("");
      setConsentFlow(null);
      setUser(result.user ?? null);
      window.dispatchEvent(new CustomEvent("philip-auth-changed", { detail: result.user }));
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  const finishGoogleLogin = useCallback(async ({ credential }: GoogleCredentialResponse) => {
    if (!credential) return;
    await authenticate(credential);
  }, [authenticate]);

  async function completeConsent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingCredential || !consentFlow) return;
    const form = new FormData(event.currentTarget);
    await authenticate(pendingCredential, {
      termsAccepted: form.get("termsAccepted") === "on",
      privacyAccepted: form.get("privacyAccepted") === "on",
      marketingConsent: form.get("marketingConsent") === "on",
      reactivate: consentFlow === "reactivate",
    });
  }

  const closeConsent = () => {
    setPendingCredential("");
    setConsentFlow(null);
    setError("");
  };

  useEffect(() => {
    if (!ready || user || !clientId || !slot.current) return;
    const render = () => {
      if (!window.google || !slot.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: finishGoogleLogin });
      slot.current.replaceChildren();
      window.google.accounts.id.renderButton(slot.current, {
        type: "standard",
        theme: "outline",
        size: mode === "login" ? "large" : "medium",
        text: mode === "login" ? "continue_with" : "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: mode === "login"
          ? Math.min(400, Math.max(240, window.innerWidth - 40))
          : mode === "panel" ? 280 : 150,
      });
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT}"]`);
    if (window.google) render();
    else if (existing) existing.addEventListener("load", render, { once: true });
    else {
      const script = document.createElement("script");
      script.src = GOOGLE_SCRIPT;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }
    return () => existing?.removeEventListener("load", render);
  }, [clientId, finishGoogleLogin, mode, ready, user]);

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

  if (!ready) return <span className="google-account-loading">로그인 확인 중</span>;
  if (user) return (
    <div>
      <div className={`google-account-user ${mode}`}>
        <Link href="/mypage" aria-label="마이페이지로 이동">
          <span aria-hidden="true">{(user.displayName ?? user.name).slice(0, 1).toUpperCase()}</span>
          <span><b>{user.displayName ?? user.name}</b><small>{mode === "panel" ? user.email : "마이페이지"}</small></span>
        </Link>
        <button type="button" onClick={logout}>로그아웃</button>
      </div>
      {error && <p className="google-account-error" role="alert">{error}</p>}
    </div>
  );
  if (!clientId) return mode === "panel" || mode === "login"
    ? <div className="google-login-unavailable"><b>Google 로그인을 이용할 수 없습니다</b><p>잠시 후 다시 시도해 주세요.</p></div>
    : <Link className="google-account-login-link" href="/mypage">로그인</Link>;
  return <div className={`google-account ${mode}`}>
    <div ref={slot} />
    <Link className="mobile-google-account-link" href="/mypage">로그인</Link>
    <p role="alert">{error}</p>
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
        <div className="account-consent-actions"><button type="button" onClick={closeConsent} disabled={submitting}>취소</button><button type="submit" disabled={submitting}>{submitting ? "처리 중…" : consentFlow === "signup" ? "동의하고 가입하기" : "동의하고 재가입하기"}</button></div>
        {error && <p className="account-consent-error" role="alert">{error}</p>}
      </form>
    </div>}
  </div>;
}
