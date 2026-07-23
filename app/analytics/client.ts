export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

export function analyticsReady() {
  return typeof window !== "undefined" && typeof (window as AnalyticsWindow).gtag === "function";
}

export function trackAnalyticsEvent(name: string, params: Record<string, unknown>) {
  if (!analyticsReady()) return false;
  (window as AnalyticsWindow).gtag?.("event", name, params);
  return true;
}
