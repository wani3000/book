"use client";

import { LinkSimple } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import GoogleGMark from "./GoogleGMark";

export default function GoogleIdentity({ connected, onChanged }: { connected: boolean; onChanged: () => void }) {
  const [oauthEnabled, setOauthEnabled] = useState(false);
  const [error, setError] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((config: { googleOAuthEnabled?: boolean }) => {
        setOauthEnabled(config.googleOAuthEnabled === true);
        const params = new URLSearchParams(window.location.search);
        const authError = params.get("auth_error") ?? "";
        if (authError.startsWith("google_") || authError === "member_has_google") {
          setError("Google 계정 연결을 완료하지 못했습니다. 다시 시도해 주세요.");
        }
        if (params.get("google") === "linked") onChanged();
      })
      .catch(() => setOauthEnabled(false));
  }, [onChanged]);

  async function disconnect() {
    if (!window.confirm("Google 계정 연결을 해제할까요? 카카오 등 다른 로그인 수단은 유지됩니다.")) return;
    setDisconnecting(true);
    setError("");
    const response = await fetch("/api/auth/identities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "google" }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) setError(result.error ?? "Google 연결을 해제하지 못했습니다.");
    else onChanged();
    setDisconnecting(false);
  }

  return <div className={`identity-provider ${connected ? "connected" : ""}`}>
    <span className="identity-provider-icon google"><GoogleGMark size={20} /></span>
    <span><b>Google</b><small>{connected ? "로그인 계정 연결됨" : oauthEnabled ? "간편 로그인을 추가할 수 있습니다." : "운영 설정 후 연결할 수 있습니다."}</small></span>
    {connected
      ? <button type="button" disabled={disconnecting} onClick={disconnect}>{disconnecting ? "해제 중…" : "연결 해제"}</button>
      : oauthEnabled ? <a href="/api/auth/google/start?intent=link&returnTo=%2Fmypage%2Fprofile"><LinkSimple size={17} aria-hidden="true" />계정 연결</a> : <em>준비 중</em>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
