"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type User = { id: string; email: string; name: string; picture?: string };
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

export default function GoogleAccount() {
  const slot = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [clientId, setClientId] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

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

  const finishGoogleLogin = useCallback(async ({ credential }: GoogleCredentialResponse) => {
    if (!credential) return;
    setError("");
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "로그인하지 못했습니다.");
      return;
    }
    setUser(result.user);
  }, []);

  useEffect(() => {
    if (!ready || user || !clientId || !slot.current) return;
    const render = () => {
      if (!window.google || !slot.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: finishGoogleLogin });
      slot.current.replaceChildren();
      window.google.accounts.id.renderButton(slot.current, {
        type: "standard",
        theme: "outline",
        size: "medium",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 150,
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
  }, [clientId, finishGoogleLogin, ready, user]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  if (!ready) return <span className="google-account-loading">로그인 확인 중</span>;
  if (user) return (
    <div className="google-account-user">
      <span aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
      <span><b>{user.name}</b><small>{user.email}</small></span>
      <button type="button" onClick={logout}>로그아웃</button>
    </div>
  );
  if (!clientId) return <span className="google-account-loading">Google 로그인 설정 필요</span>;
  return <div className="google-account"><div ref={slot} /><p role="alert">{error}</p></div>;
}
