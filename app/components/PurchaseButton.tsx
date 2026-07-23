"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DIGITAL_CONTENT_CONSENT_TEXT } from "@/app/payments/policy";
import { trackAnalyticsEvent } from "@/app/analytics/client";

type ProductSlug = "codex" | "career" | "jane";

type Props = {
  product: ProductSlug;
  label: string;
  className?: string;
};

const productConfig = {
  codex: {
    title: "아이디어를 서비스로 바꾸는 Codex 사용법",
    priceId: process.env.NEXT_PUBLIC_CODEX_PRICE_ID,
    purchaseUrl: process.env.NEXT_PUBLIC_CODEX_PURCHASE_URL,
  },
  career: {
    title: "커리어도 디자인할 수 있습니다",
    priceId: process.env.NEXT_PUBLIC_CAREER_PRICE_ID,
    purchaseUrl: process.env.NEXT_PUBLIC_CAREER_PURCHASE_URL,
  },
  jane: {
    title: "승무원 다음은 IT였습니다",
    priceId: process.env.NEXT_PUBLIC_JANE_PRICE_ID,
    purchaseUrl: process.env.NEXT_PUBLIC_JANE_PURCHASE_URL,
  },
};

let paddlePromise: Promise<Paddle | undefined> | null = null;
let naverPaySdkPromise: Promise<void> | null = null;

type DirectProvider = "kakaopay" | "naverpay";

type NaverPayCheckout = {
  clientId: string;
  chainId?: string;
  mode: "development" | "production";
  merchantUserKey: string;
  merchantPayKey: string;
  merchantPayTransactionKey: string;
  productName: string;
  productCount: number;
  totalPayAmount: number;
  taxScopeAmount: number;
  taxExScopeAmount: number;
  extraDeduction: boolean;
  returnUrl: string;
  productItems: Array<{ categoryType: string; categoryId: string; uid: string; name: string; payReferrer: string; count: number }>;
  error?: string;
};

declare global {
  interface Window {
    Naver?: {
      Pay: {
        create(config: { mode: string; clientId: string; chainId?: string; payType: "normal"; openType: "page" }): {
          open(context: Omit<NaverPayCheckout, "clientId" | "chainId" | "mode" | "error">): void;
        };
      };
    };
  }
}

function loadNaverPaySdk() {
  if (window.Naver?.Pay) return Promise.resolve();
  if (!naverPaySdkPromise) {
    naverPaySdkPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-naverpay-sdk="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("NaverPay SDK failed to load")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://nsp.pay.naver.com/sdk/js/naverpay.min.js";
      script.async = true;
      script.dataset.naverpaySdk = "true";
      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener("error", () => reject(new Error("NaverPay SDK failed to load")), { once: true });
      document.head.appendChild(script);
    });
  }
  return naverPaySdkPromise;
}

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
  const naverPayReady = process.env.NEXT_PUBLIC_NAVERPAY_ENABLED === "true";
  const ready = Boolean(kakaoPayReady || naverPayReady || externalUrl || (paddle && config.priceId));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consented, setConsented] = useState(false);

  async function beginPurchase(provider?: DirectProvider) {
    if (!ready) return;
    setError("");
    setLoading(true);
    trackAnalyticsEvent("begin_checkout", {
      currency: "KRW",
      value: 19000,
      payment_type: provider || (externalUrl ? "external" : "paddle"),
      items: [{ item_id: product, item_name: config.title, price: 19000, quantity: 1 }],
    });
    if (provider) {
      if (!consented) { setError("디지털 콘텐츠 즉시 제공과 청약철회 제한에 동의해 주세요."); setLoading(false); return; }
      const response = await fetch(`/api/${provider}/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, contentProvisionConsent: true }),
      }).catch(() => null);
      if (!response) {
        setError("결제 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setLoading(false);
        return;
      }
      if (response.status === 401) {
        window.location.href = `/mypage?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (response.status === 409) {
        const data = await response.json().catch(() => ({})) as { owned?: boolean; libraryUrl?: string; error?: string };
        if (data.owned && data.libraryUrl) { window.location.href = data.libraryUrl; return; }
      }
      if (provider === "naverpay") {
        const data = await response.json().catch(() => ({})) as NaverPayCheckout;
        if (!response.ok || !data.clientId) {
          setError(data.error || "네이버페이 결제를 시작하지 못했습니다.");
          setLoading(false);
          return;
        }
        try {
          await loadNaverPaySdk();
          if (!window.Naver?.Pay) throw new Error("NaverPay SDK is unavailable");
          const pay = window.Naver.Pay.create({
            mode: data.mode,
            clientId: data.clientId,
            ...(data.chainId ? { chainId: data.chainId } : {}),
            payType: "normal",
            openType: "page",
          });
          const { clientId: _clientId, chainId: _chainId, mode: _mode, error: _error, ...checkout } = data;
          void _clientId; void _chainId; void _mode; void _error;
          pay.open(checkout);
          return;
        } catch {
          setError("네이버페이 결제창을 불러오지 못했습니다.");
          setLoading(false);
          return;
        }
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

  if (kakaoPayReady || naverPayReady) {
    return <div className={`purchase-provider-wrap ${kakaoPayReady && naverPayReady ? "is-dual" : ""}`}>
      <label className="purchase-consent">
        <input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} />
        <span>{DIGITAL_CONTENT_CONSENT_TEXT} <Link href="/refund" target="_blank">환불정책 보기</Link></span>
      </label>
      <div className="purchase-provider-grid">
        {kakaoPayReady && <button type="button" className={`${className} provider-kakao`} disabled={loading || !consented} onClick={() => beginPurchase("kakaopay")}>{loading ? "결제창 여는 중" : "카카오페이로 결제하기"}<span>→</span></button>}
        {naverPayReady && <button type="button" className={`${className} provider-naver`} disabled={loading || !consented} onClick={() => beginPurchase("naverpay")}>{loading ? "결제창 여는 중" : "Npay로 결제하기"}<span>→</span></button>}
      </div>
      {error && <span className="purchase-error" role="alert">{error}</span>}
    </div>;
  }

  if (!ready) {
    return <div className="purchase-unavailable" role="status">
      <button type="button" className={className} disabled aria-label="간편결제 준비 중">
        간편결제 준비 중<span aria-hidden="true">→</span>
      </button>
      <span>카카오페이·네이버페이 가맹 심사가 끝나면 구매가 열립니다.</span>
    </div>;
  }

  return (
    <><button
      type="button"
      className={className}
      disabled={loading}
      aria-label={label}
      onClick={() => beginPurchase()}
    >
      {loading ? "결제창 여는 중" : label}<span>→</span>
    </button>{error && <span className="purchase-error" role="alert">{error}</span>}</>
  );
}
