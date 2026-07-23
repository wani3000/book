import { ebookCatalog, type EbookProduct } from "@/app/library/catalog";

type NaverPayMode = "development" | "production";

type ApprovalResponse = {
  code: string;
  message?: string;
  body?: {
    paymentId?: string;
    detail?: {
      merchantPayKey?: string;
      merchantUserKey?: string;
      paymentId?: string;
      totalPayAmount?: number;
      productName?: string;
      paymentStatus?: string;
      admissionState?: string;
    };
  };
  error?: { type?: string };
};

type HistoryItem = {
  paymentId?: string;
  admissionState?: string;
  admissionTypeCode?: string;
  totalPayAmount?: number;
  merchantPayKey?: string;
  merchantUserKey?: string;
};

type HistoryResponse = {
  code: string;
  message?: string;
  body?: { list?: HistoryItem[] };
  error?: { type?: string };
};

function credentials() {
  const clientId = process.env.NAVERPAY_CLIENT_ID?.trim();
  const clientSecret = process.env.NAVERPAY_CLIENT_SECRET?.trim();
  const chainId = process.env.NAVERPAY_CHAIN_ID?.trim();
  const mode: NaverPayMode = process.env.NAVERPAY_MODE === "production" ? "production" : "development";
  if (!clientId || !clientSecret || !chainId) throw new Error("NaverPay credentials are not configured");
  return { clientId, clientSecret, chainId, mode };
}

export function naverPayEnabled() {
  return Boolean(process.env.NAVERPAY_CLIENT_ID && process.env.NAVERPAY_CLIENT_SECRET && process.env.NAVERPAY_CHAIN_ID);
}

function idempotencyKey(value: string) {
  return value.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 64);
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
    merchantPayTransactionKey: `${args.orderId}_reserve`,
    productName: book.title,
    productCount: 1,
    totalPayAmount: book.amount,
    taxScopeAmount: book.amount,
    taxExScopeAmount: 0,
    extraDeduction: false,
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

export async function approveNaverPay(paymentId: string, orderId: string) {
  const { clientId, clientSecret, chainId, mode } = credentials();
  const apiHost = mode === "production" ? "https://pay.paygate.naver.com" : "https://dev-pay.paygate.naver.com";
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "X-Naver-Client-Id": clientId,
    "X-Naver-Client-Secret": clientSecret,
    "X-NaverPay-Chain-Id": chainId,
    "X-NaverPay-Idempotency-Key": idempotencyKey(`apply_${orderId}`),
  };
  const response = await fetch(`${apiHost}/naverpay-partner/naverpay/payments/v2.2/apply/payment`, {
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

export async function cancelNaverPay(args: { paymentId: string; amount: number; reason: string; orderId: string }) {
  const { clientId, clientSecret, chainId, mode } = credentials();
  const apiHost = mode === "production" ? "https://pay.paygate.naver.com" : "https://dev-pay.paygate.naver.com";
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "X-Naver-Client-Id": clientId,
    "X-Naver-Client-Secret": clientSecret,
    "X-NaverPay-Chain-Id": chainId,
    "X-NaverPay-Idempotency-Key": idempotencyKey(`cancel_${args.orderId}`),
  };
  const response = await fetch(`${apiHost}/naverpay-partner/naverpay/payments/v1/cancel`, {
    method: "POST",
    headers,
    body: new URLSearchParams({
      paymentId: args.paymentId,
      cancelAmount: String(args.amount),
      cancelReason: args.reason.slice(0, 200),
      cancelRequester: "2",
      taxScopeAmount: String(args.amount),
      taxExScopeAmount: "0",
      doCompareRest: "1",
      expectedRestAmount: "0",
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

export async function getNaverPayHistory(paymentId: string) {
  const { clientId, clientSecret, chainId, mode } = credentials();
  const apiHost = mode === "production" ? "https://pay.paygate.naver.com" : "https://dev-pay.paygate.naver.com";
  const response = await fetch(`${apiHost}/naverpay-partner/naverpay/payments/v2.3/list/history/${encodeURIComponent(paymentId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
      "X-NaverPay-Chain-Id": chainId,
    },
    body: JSON.stringify({ pageNumber: 1, rowsPerPage: 50 }),
    signal: AbortSignal.timeout(60_000),
  });
  const payload = await response.json().catch(() => ({})) as HistoryResponse;
  if (!response.ok || payload.code !== "Success") {
    const error = new Error(payload.message || "NaverPay history lookup failed");
    Object.assign(error, { code: payload.error?.type || payload.code || String(response.status) });
    throw error;
  }
  return payload.body?.list ?? [];
}

export function naverPayErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) return String(error.code).slice(0, 80);
  if (error instanceof DOMException && error.name === "TimeoutError") return "TIMEOUT_RECONCILE_REQUIRED";
  return "UNKNOWN";
}
