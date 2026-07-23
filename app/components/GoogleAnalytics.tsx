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
}

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
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
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    (window as AnalyticsWindow).gtag?.("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
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
