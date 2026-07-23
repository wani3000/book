"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { analyticsReady, trackAnalyticsEvent } from "@/app/analytics/client";

type Order = {
  id: string;
  product: string;
  productTitle: string;
  amount: number;
  currency: string;
  status: string;
};

export default function CheckoutSuccessTracker() {
  const orderId = useSearchParams().get("orderId")?.trim();

  const trackPurchase = useCallback(async () => {
    if (!orderId || !analyticsReady()) return;
    const storageKey = `danielsnote.analytics.purchase.${orderId}`;
    if (window.sessionStorage.getItem(storageKey)) return;
    const response = await fetch("/api/account/orders", { cache: "no-store" }).catch(() => null);
    if (!response?.ok) return;
    const result = await response.json() as { orders?: Order[] };
    const order = result.orders?.find((item) => item.id === orderId && item.status === "paid");
    if (!order) return;
    const sent = trackAnalyticsEvent("purchase", {
      transaction_id: order.id,
      currency: order.currency || "KRW",
      value: order.amount,
      items: [{ item_id: order.product, item_name: order.productTitle, price: order.amount, quantity: 1 }],
    });
    if (sent) window.sessionStorage.setItem(storageKey, "sent");
  }, [orderId]);

  useEffect(() => {
    void trackPurchase();
    window.addEventListener("danielsnote:analytics-ready", trackPurchase);
    return () => window.removeEventListener("danielsnote:analytics-ready", trackPurchase);
  }, [trackPurchase]);

  return null;
}
