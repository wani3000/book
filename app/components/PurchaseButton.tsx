"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { useEffect, useState } from "react";

type ProductSlug = "codex" | "career" | "jane";

type Props = {
  product: ProductSlug;
  label: string;
  className?: string;
};

const productConfig = {
  codex: {
    priceId: process.env.NEXT_PUBLIC_CODEX_PRICE_ID,
    purchaseUrl: process.env.NEXT_PUBLIC_CODEX_PURCHASE_URL,
  },
  career: {
    priceId: process.env.NEXT_PUBLIC_CAREER_PRICE_ID,
    purchaseUrl: process.env.NEXT_PUBLIC_CAREER_PURCHASE_URL,
  },
  jane: {
    priceId: process.env.NEXT_PUBLIC_JANE_PRICE_ID,
    purchaseUrl: process.env.NEXT_PUBLIC_JANE_PURCHASE_URL,
  },
};

let paddlePromise: Promise<Paddle | undefined> | null = null;

function getPaddle() {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) return Promise.resolve(undefined);
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      token,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
    });
  }
  return paddlePromise;
}

export default function PurchaseButton({ product, label, className = "button primary" }: Props) {
  const config = productConfig[product];
  const [paddle, setPaddle] = useState<Paddle>();
  const externalUrl = config.purchaseUrl?.startsWith("http") ? config.purchaseUrl : undefined;

  useEffect(() => {
    if (!config.priceId) return;
    getPaddle().then(setPaddle).catch(() => setPaddle(undefined));
  }, [config.priceId]);

  const kakaoPayReady = process.env.NEXT_PUBLIC_KAKAOPAY_ENABLED === "true";
  const ready = Boolean(kakaoPayReady || externalUrl || (paddle && config.priceId));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function beginPurchase() {
    if (!ready) return;
    setError("");
    setLoading(true);
    if (kakaoPayReady) {
      const consented = window.confirm("결제 완료 즉시 PDF 열람이 시작되며, 열람 또는 다운로드 후에는 단순 변심 청약철회가 제한될 수 있습니다. 결제를 계속할까요?");
      if (!consented) { setLoading(false); return; }
      const response = await fetch("/api/kakaopay/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, contentProvisionConsent: true }),
      }).catch(() => null);
      if (!response) {
        setError("결제 연결을 확인해 주세요.");
        setLoading(false);
        return;
      }
      if (response.status === 401) {
        window.location.href = `/mypage?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const data = await response.json().catch(() => ({})) as { redirectUrl?: string; mobileRedirectUrl?: string; error?: string };
      const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const redirectUrl = mobile ? data.mobileRedirectUrl : data.redirectUrl;
      if (response.ok && redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
      setError(data.error || "결제를 시작하지 못했습니다.");
      setLoading(false);
      return;
    }
    const contextResponse = await fetch("/api/checkout/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    });
    if (contextResponse.status === 401) {
      window.location.href = `/mypage?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const context = await contextResponse.json();
    if (!contextResponse.ok || !context.entitlement) { setLoading(false); return; }
    if (externalUrl) {
      window.location.href = externalUrl;
      return;
    }
    if (!paddle || !config.priceId) return;
    paddle.Checkout.open({
      items: [{ priceId: config.priceId, quantity: 1 }],
      customer: { email: context.email },
      customData: { entitlement: context.entitlement },
      settings: { variant: "one-page", successUrl: `${window.location.origin}/checkout/success` },
    });
    setLoading(false);
  }

  return (
    <><button
      type="button"
      className={className}
      disabled={!ready || loading}
      aria-label={ready ? label : `${label} - 결제 설정 준비 중`}
      onClick={beginPurchase}
    >
      {loading ? "결제창 여는 중" : ready ? label : "카카오페이 심사 준비 중"}<span>→</span>
    </button>{error && <span className="purchase-error" role="alert">{error}</span>}</>
  );
}
