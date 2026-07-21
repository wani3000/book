"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = { credential?: string };

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

export default function GoogleIdentity({ connected, onChanged }: { connected: boolean; onChanged: () => void }) {
  const slot = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((config: { clientId?: string }) => setClientId(config.clientId ?? ""))
      .catch(() => setClientId(""));
  }, []);

  const finishLink = useCallback(async ({ credential }: GoogleCredentialResponse) => {
    if (!credential) return;
    setError("");
    const response = await fetch("/api/auth/google/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) setError(result.error ?? "Google 계정을 연결하지 못했습니다.");
    else onChanged();
  }, [onChanged]);

  useEffect(() => {
    if (connected || !clientId || !slot.current) return;
    const render = () => {
      if (!window.google || !slot.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: finishLink });
      slot.current.replaceChildren();
      window.google.accounts.id.renderButton(slot.current, {
        type: "standard",
        theme: "outline",
        size: "medium",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 190,
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
  }, [clientId, connected, finishLink]);

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
    <span className="identity-provider-icon google">G</span>
    <span><b>Google</b><small>{connected ? "로그인 계정 연결됨" : clientId ? "간편 로그인을 추가할 수 있습니다." : "운영 설정 후 연결할 수 있습니다."}</small></span>
    {connected
      ? <button type="button" disabled={disconnecting} onClick={disconnect}>{disconnecting ? "해제 중…" : "연결 해제"}</button>
      : clientId ? <div className="identity-google-slot" ref={slot} /> : <em>준비 중</em>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
