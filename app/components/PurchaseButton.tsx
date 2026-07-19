"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { useEffect, useMemo, useState } from "react";

type ProductSlug = "codex" | "career" | "seonara";

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
  seonara: {
    priceId: process.env.NEXT_PUBLIC_SEONARA_PRICE_ID,
    purchaseUrl: process.env.NEXT_PUBLIC_SEONARA_PURCHASE_URL,
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
  const externalUrl = useMemo(
    () => config.purchaseUrl?.startsWith("http") ? config.purchaseUrl : undefined,
    [config.purchaseUrl],
  );

  useEffect(() => {
    if (!config.priceId) return;
    getPaddle().then(setPaddle).catch(() => setPaddle(undefined));
  }, [config.priceId]);

  if (externalUrl) {
    return <a className={className} href={externalUrl} rel="noopener noreferrer">{label}<span>→</span></a>;
  }

  const ready = Boolean(paddle && config.priceId);

  return (
    <button
      type="button"
      className={className}
      disabled={!ready}
      aria-label={ready ? label : `${label} - 결제 설정 준비 중`}
      onClick={() => {
        if (!paddle || !config.priceId) return;
        paddle.Checkout.open({
          items: [{ priceId: config.priceId, quantity: 1 }],
          customData: { product },
          settings: { variant: "one-page" },
        });
      }}
    >
      {ready ? label : "결제 오픈 준비 중"}<span>→</span>
    </button>
  );
}
