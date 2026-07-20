import { ebookCatalog, type EbookProduct } from "@/app/library/catalog";

const KAKAOPAY_API = "https://open-api.kakaopay.com/online/v1/payment";

type ReadyResponse = {
  tid: string;
  next_redirect_pc_url: string;
  next_redirect_mobile_url: string;
};

type ApproveResponse = {
  tid: string;
  status?: string;
  amount?: { total?: number };
};

function credentials() {
  const cid = process.env.KAKAOPAY_CID;
  const secretKey = process.env.KAKAOPAY_SECRET_KEY;
  if (!cid || !secretKey) throw new Error("KakaoPay credentials are not configured");
  return { cid, secretKey };
}

async function requestKakaoPay<T>(path: string, body: Record<string, string | number>) {
  const { secretKey } = credentials();
  const response = await fetch(`${KAKAOPAY_API}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `SECRET_KEY ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({})) as T & { error_code?: string; error_message?: string };
  if (!response.ok) {
    const error = new Error(payload.error_message || `KakaoPay ${path} failed`);
    Object.assign(error, { code: payload.error_code || String(response.status) });
    throw error;
  }
  return payload;
}

export function kakaoPayEnabled() {
  return Boolean(process.env.KAKAOPAY_CID && process.env.KAKAOPAY_SECRET_KEY);
}

export async function readyKakaoPay(args: {
  product: EbookProduct;
  orderId: string;
  memberId: string;
  origin: string;
}) {
  const { cid } = credentials();
  const book = ebookCatalog[args.product];
  return requestKakaoPay<ReadyResponse>("ready", {
    cid,
    partner_order_id: args.orderId,
    partner_user_id: args.memberId,
    item_name: book.title,
    item_code: book.product,
    quantity: 1,
    total_amount: book.amount,
    tax_free_amount: 0,
    approval_url: `${args.origin}/api/kakaopay/approve?orderId=${encodeURIComponent(args.orderId)}`,
    cancel_url: `${args.origin}/api/kakaopay/cancel?orderId=${encodeURIComponent(args.orderId)}`,
    fail_url: `${args.origin}/api/kakaopay/fail?orderId=${encodeURIComponent(args.orderId)}`,
  });
}

export async function approveKakaoPay(args: {
  tid: string;
  orderId: string;
  memberId: string;
  pgToken: string;
}) {
  const { cid } = credentials();
  return requestKakaoPay<ApproveResponse>("approve", {
    cid,
    tid: args.tid,
    partner_order_id: args.orderId,
    partner_user_id: args.memberId,
    pg_token: args.pgToken,
  });
}

export function kakaoPayErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) return String(error.code).slice(0, 80);
  return "UNKNOWN";
}
