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

  const ready = Boolean(externalUrl || (paddle && config.priceId));

  async function beginPurchase() {
    if (!ready) return;
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
    if (!contextResponse.ok || !context.entitlement) return;
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
  }

  return (
    <button
      type="button"
      className={className}
      disabled={!ready}
      aria-label={ready ? label : `${label} - 결제 설정 준비 중`}
      onClick={beginPurchase}
    >
      {ready ? label : "결제 오픈 준비 중"}<span>→</span>
    </button>
  );
}
