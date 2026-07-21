"use client";

import { ChatCircleDots, LinkSimple, X } from "@phosphor-icons/react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type PendingFlow = "signup" | "reactivate" | null;

const errorMessages: Record<string, string> = {
  kakao_unavailable: "카카오 로그인을 준비 중입니다. Google 로그인을 이용해 주세요.",
  invalid_state: "로그인 요청이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.",
  cancelled: "카카오 로그인이 취소되었습니다.",
  missing_code: "카카오 인증 정보를 받지 못했습니다.",
  verified_email_required: "확인된 카카오계정 이메일 제공에 동의해야 가입할 수 있습니다.",
  account_link_required: "같은 이메일의 기존 계정이 있습니다. 기존 방식으로 로그인한 뒤 프로필에서 카카오 계정을 연결해 주세요.",
  suspended: "이용이 정지된 계정입니다. 고객센터에 문의해 주세요.",
  kakao_already_linked: "이 카카오 계정은 다른 회원에게 이미 연결되어 있습니다.",
  member_has_kakao: "이미 다른 카카오 계정이 연결되어 있습니다.",
  login_required: "계정을 연결하려면 먼저 로그인해 주세요.",
  kakao_failed: "카카오 로그인을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

export default function KakaoAccount({ mode = "login", connected = false, onChanged }: { mode?: "login" | "connect"; connected?: boolean; onChanged?: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [pendingFlow, setPendingFlow] = useState<PendingFlow>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((config: { kakaoEnabled?: boolean }) => {
        setEnabled(config.kakaoEnabled === true);
        const params = new URLSearchParams(window.location.search);
        const authError = params.get("auth_error");
        if (authError) setError(errorMessages[authError] ?? "로그인 중 문제가 발생했습니다.");
        if (params.get("kakao") === "consent") {
          fetch("/api/auth/kakao/pending", { cache: "no-store" })
            .then((response) => response.json())
            .then((result: { pending?: boolean; flow?: PendingFlow }) => {
              if (result.pending && result.flow) setPendingFlow(result.flow);
              else setError("카카오 로그인 시간이 만료되었습니다. 다시 시도해 주세요.");
            })
            .catch(() => setError("카카오 가입 정보를 확인하지 못했습니다."));
        }
      })
      .catch(() => setEnabled(false));
  }, []);

  async function completeConsent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/kakao/pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        termsAccepted: form.get("termsAccepted") === "on",
        privacyAccepted: form.get("privacyAccepted") === "on",
        marketingConsent: form.get("marketingConsent") === "on",
      }),
    });
    const result = await response.json() as { error?: string; user?: unknown; returnTo?: string };
    if (!response.ok) {
      setError(result.error ?? "카카오 회원가입을 완료하지 못했습니다.");
      setSubmitting(false);
      return;
    }
    window.dispatchEvent(new CustomEvent("philip-auth-changed", { detail: result.user ?? null }));
    window.location.href = result.returnTo?.startsWith("/") && !result.returnTo.startsWith("//") ? result.returnTo : "/mypage";
  }

  async function disconnect() {
    if (!window.confirm("카카오 계정 연결을 해제할까요? Google 등 다른 로그인 수단은 유지됩니다.")) return;
    setDisconnecting(true);
    setError("");
    const response = await fetch("/api/auth/identities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "kakao" }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) setError(result.error ?? "카카오 연결을 해제하지 못했습니다.");
    else onChanged?.();
    setDisconnecting(false);
  }

  const linkHref = "/api/auth/kakao/start?intent=link&returnTo=%2Fmypage%23profile";

  return <>
    {mode === "login" && enabled && <a className="kakao-login-button" href="/api/auth/kakao/start"><ChatCircleDots size={24} weight="fill" aria-hidden="true" /><span>카카오로 계속하기</span></a>}
    {mode === "connect" && <div className={`identity-provider ${connected ? "connected" : ""}`}>
      <span className="identity-provider-icon kakao"><ChatCircleDots size={22} weight="fill" aria-hidden="true" /></span>
      <span><b>카카오</b><small>{connected ? "로그인 계정 연결됨" : enabled ? "간편 로그인을 추가할 수 있습니다." : "운영 설정 후 연결할 수 있습니다."}</small></span>
      {connected
        ? <button type="button" disabled={disconnecting} onClick={disconnect}>{disconnecting ? "해제 중…" : "연결 해제"}</button>
        : enabled ? <a href={linkHref}><LinkSimple size={17} aria-hidden="true" />계정 연결</a> : <em>준비 중</em>}
      {error && <p role="alert">{error}</p>}
    </div>}
    {mode === "login" && error && <p className="kakao-login-error" role="alert">{error}</p>}
    {pendingFlow && <div className="account-consent-overlay" role="dialog" aria-modal="true" aria-labelledby="kakao-consent-title">
      <form className="account-consent-dialog" onSubmit={completeConsent}>
        <button className="account-consent-close" type="button" aria-label="닫기" onClick={() => setPendingFlow(null)}><X size={21} /></button>
        <p>{pendingFlow === "signup" ? "WELCOME" : "WELCOME BACK"}</p>
        <h2 id="kakao-consent-title">{pendingFlow === "signup" ? "카카오 회원가입을 마무리해 주세요" : "계정을 다시 이용할까요?"}</h2>
        <div className="account-consent-copy">{pendingFlow === "signup" ? "카카오 계정으로 구매 내역과 전자책을 안전하게 관리합니다." : "재가입하면 보관 중인 구매 내역과 유효한 전자책 열람 권한이 다시 연결됩니다."}</div>
        <label><input type="checkbox" name="termsAccepted" required /><span><b>[필수] 이용약관 동의</b><Link href="/terms" target="_blank">내용 보기</Link></span></label>
        <label><input type="checkbox" name="privacyAccepted" required /><span><b>[필수] 개인정보 수집·이용 동의</b><Link href="/privacy" target="_blank">내용 보기</Link></span></label>
        <label><input type="checkbox" name="marketingConsent" /><span><b>[선택] 새 책과 할인 소식 받기</b><small>동의하지 않아도 서비스 이용에 제한이 없습니다.</small></span></label>
        <div className="account-consent-actions"><button type="button" onClick={() => setPendingFlow(null)} disabled={submitting}>취소</button><button type="submit" disabled={submitting}>{submitting ? "처리 중…" : pendingFlow === "signup" ? "동의하고 가입하기" : "동의하고 재가입하기"}</button></div>
        {error && <p className="account-consent-error" role="alert">{error}</p>}
      </form>
    </div>}
  </>;
}
