import { ebookCatalog, type EbookProduct } from "@/app/library/catalog";

type NaverPayMode = "development" | "production";

type ApprovalResponse = {
  code: string;
  message?: string;
  body?: {
    paymentId?: string;
    detail?: {
      merchantPayKey?: string;
      totalPayAmount?: number;
      productName?: string;
      paymentStatus?: string;
    };
  };
  error?: { type?: string };
};

function credentials() {
  const partnerId = process.env.NAVERPAY_PARTNER_ID?.trim();
  const clientId = process.env.NAVERPAY_CLIENT_ID?.trim();
  const clientSecret = process.env.NAVERPAY_CLIENT_SECRET?.trim();
  const chainId = process.env.NAVERPAY_CHAIN_ID?.trim();
  const mode: NaverPayMode = process.env.NAVERPAY_MODE === "production" ? "production" : "development";
  if (!partnerId || !clientId || !clientSecret) throw new Error("NaverPay credentials are not configured");
  return { partnerId, clientId, clientSecret, chainId, mode };
}

export function naverPayEnabled() {
  return Boolean(process.env.NAVERPAY_PARTNER_ID && process.env.NAVERPAY_CLIENT_ID && process.env.NAVERPAY_CLIENT_SECRET);
}

export function naverPayCheckoutContext(args: { product: EbookProduct; orderId: string; memberId: string; origin: string }) {
  const { clientId, chainId, mode } = credentials();
  const book = ebookCatalog[args.product];
  return {
    clientId,
    chainId: chainId || undefined,
    mode,
    merchantUserKey: args.memberId,
    merchantPayKey: args.orderId,
    productName: book.title,
    productCount: 1,
    totalPayAmount: book.amount,
    taxScopeAmount: book.amount,
    taxExScopeAmount: 0,
    returnUrl: `${args.origin}/api/naverpay/return?orderId=${encodeURIComponent(args.orderId)}`,
    productItems: [{
      categoryType: "ETC",
      categoryId: "ETC",
      uid: book.product,
      name: book.title,
      payReferrer: "ETC",
      count: 1,
    }],
  };
}

export async function approveNaverPay(paymentId: string) {
  const { partnerId, clientId, clientSecret, chainId, mode } = credentials();
  const apiHost = mode === "production" ? "https://apis.naver.com" : "https://dev.apis.naver.com";
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "X-Naver-Client-Id": clientId,
    "X-Naver-Client-Secret": clientSecret,
  };
  if (chainId) headers["X-NaverPay-Chain-Id"] = chainId;
  const response = await fetch(`${apiHost}/${encodeURIComponent(partnerId)}/naverpay/payments/v2.2/apply/payment`, {
    method: "POST",
    headers,
    body: new URLSearchParams({ paymentId }),
    signal: AbortSignal.timeout(60_000),
  });
  const payload = await response.json().catch(() => ({})) as ApprovalResponse;
  if (!response.ok || payload.code !== "Success") {
    const error = new Error(payload.message || "NaverPay approval failed");
    Object.assign(error, { code: payload.error?.type || payload.code || String(response.status) });
    throw error;
  }
  return payload;
}

export async function cancelNaverPay(args: { paymentId: string; amount: number; reason: string }) {
  const { partnerId, clientId, clientSecret, chainId, mode } = credentials();
  const apiHost = mode === "production" ? "https://apis.naver.com" : "https://dev.apis.naver.com";
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "X-Naver-Client-Id": clientId,
    "X-Naver-Client-Secret": clientSecret,
  };
  if (chainId) headers["X-NaverPay-Chain-Id"] = chainId;
  const response = await fetch(`${apiHost}/${encodeURIComponent(partnerId)}/naverpay/payments/v1/cancel`, {
    method: "POST",
    headers,
    body: new URLSearchParams({
      paymentId: args.paymentId,
      cancelAmount: String(args.amount),
      cancelReason: args.reason.slice(0, 200),
      cancelRequester: "2",
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const payload = await response.json().catch(() => ({})) as ApprovalResponse;
  if (!response.ok || !["Success", "CancelNotComplete"].includes(payload.code)) {
    const error = new Error(payload.message || "NaverPay cancellation failed");
    Object.assign(error, { code: payload.error?.type || payload.code || String(response.status) });
    throw error;
  }
  return { pending: payload.code === "CancelNotComplete", payload };
}

export function naverPayErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) return String(error.code).slice(0, 80);
  if (error instanceof DOMException && error.name === "TimeoutError") return "TIMEOUT_RECONCILE_REQUIRED";
  return "UNKNOWN";
}
