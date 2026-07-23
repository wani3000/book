"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const CONSENT_KEY = "danielsnote.analytics-consent";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

function startAnalytics(measurementId: string) {
  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.gtag = analyticsWindow.gtag ?? ((...args: unknown[]) => analyticsWindow.dataLayer?.push(args));

  if (!document.getElementById("danielsnote-google-analytics")) {
    const script = document.createElement("script");
    script.id = "danielsnote-google-analytics";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
    analyticsWindow.gtag("js", new Date());
    analyticsWindow.gtag("config", measurementId, { anonymize_ip: true, send_page_view: false });
  }
  window.dispatchEvent(new Event("danielsnote:analytics-ready"));
}

export default function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);

  useEffect(() => {
    if (!measurementId) return;
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored !== "granted" && stored !== "denied") return;
    const frame = window.requestAnimationFrame(() => setConsent(stored));
    return () => window.cancelAnimationFrame(frame);
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || consent !== "granted") return;
    startAnalytics(measurementId);
    const analyticsWindow = window as AnalyticsWindow;
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    analyticsWindow.gtag?.("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
    const products: Record<string, string> = {
      "/codex": "아이디어를 서비스로 바꾸는 Codex 사용법",
      "/career": "커리어도 디자인할 수 있습니다",
      "/jane": "승무원 다음은 IT였습니다",
    };
    const itemName = products[pathname];
    if (itemName) {
      analyticsWindow.gtag?.("event", "view_item", {
        currency: "KRW",
        value: 19000,
        items: [{ item_id: pathname.slice(1), item_name: itemName, price: 19000, quantity: 1 }],
      });
    }
  }, [consent, measurementId, pathname, searchParams]);

  if (!measurementId || consent !== null) return null;

  const choose = (value: "granted" | "denied") => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  };

  return (
    <aside className="analytics-consent" aria-label="방문 분석 설정">
      <div>
        <strong>더 좋은 책과 경험을 만들고 싶어요.</strong>
        <p>방문 흐름을 익명으로 살펴보는 데 동의하시겠어요? 동의하지 않아도 모든 기능을 그대로 이용할 수 있어요.</p>
      </div>
      <div className="analytics-consent-actions">
        <button type="button" onClick={() => choose("denied")}>괜찮아요</button>
        <button className="primary" type="button" onClick={() => choose("granted")}>좋아요</button>
      </div>
    </aside>
  );
}
