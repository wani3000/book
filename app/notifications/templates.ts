export type EmailAttachment = { filename: string; content: string };

export type FriendlyEmail = {
  subject: string;
  text: string;
  html: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
};

type EmailDetail = { label: string; value: string };
type EmailAction = { label: string; url: string };

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://danielsnote.com").replace(/\/$/, "");
const supportEmail = () => process.env.CUSTOMER_SUPPORT_EMAIL?.trim() || "florencelab@naver.com";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function textAttachment(filename: string, content: string): EmailAttachment {
  return { filename, content: encodeBase64(content) };
}

export function friendlyEmail(input: {
  subject: string;
  eyebrow?: string;
  title: string;
  greeting?: string;
  paragraphs: string[];
  details?: EmailDetail[];
  action?: EmailAction;
  note?: string;
  attachments?: EmailAttachment[];
  marketing?: boolean;
}): FriendlyEmail {
  const details = input.details ?? [];
  const textParts = [input.greeting, ...input.paragraphs];
  if (details.length) textParts.push(...details.map((item) => `${item.label}: ${item.value}`));
  if (input.action) textParts.push(`${input.action.label}: ${input.action.url}`);
  if (input.note) textParts.push(input.note);
  textParts.push(`도움이 필요하면 ${supportEmail()}으로 편하게 알려 주세요.`);
  if (input.marketing) textParts.push(`${siteUrl()}/mypage/profile에서 언제든 소식 수신을 끌 수 있어요.`);

  const detailHtml = details.length ? `<div style="margin:24px 0;padding:18px 20px;background:#f7f5f2;border-radius:14px">${details.map((item) => `<div style="display:flex;gap:16px;margin:7px 0"><span style="min-width:86px;color:#777;font-size:13px">${escapeHtml(item.label)}</span><strong style="color:#222;font-size:14px">${escapeHtml(item.value)}</strong></div>`).join("")}</div>` : "";
  const actionHtml = input.action ? `<div style="margin:30px 0"><a href="${escapeHtml(input.action.url)}" style="display:inline-block;padding:15px 24px;border-radius:12px;background:#171717;color:#fff;text-decoration:none;font-size:15px;font-weight:700">${escapeHtml(input.action.label)}</a></div>` : "";
  const noteHtml = input.note ? `<div style="margin-top:24px;padding:16px 18px;border-left:3px solid #d97706;background:#fff9ed;color:#5f4826;font-size:13px;line-height:1.7">${escapeHtml(input.note)}</div>` : "";
  const marketingHtml = input.marketing ? `<p style="margin:20px 0 0;color:#999;font-size:12px;line-height:1.7">이 소식은 이메일 수신에 동의해 보내드렸어요. <a href="${siteUrl()}/mypage/profile" style="color:#777">프로필 관리</a>에서 언제든 수신을 끌 수 있어요.</p>` : "";

  return {
    subject: input.subject,
    text: textParts.filter(Boolean).join("\n\n"),
    html: `<!doctype html><html lang="ko"><body style="margin:0;background:#f2f0ed;font-family:Pretendard,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#222"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(input.paragraphs[0] ?? input.title)}</div><div style="max-width:620px;margin:0 auto;padding:32px 16px"><div style="padding:34px 32px;background:#fff;border-radius:20px"><a href="${siteUrl()}" style="color:#222;text-decoration:none;font-size:14px;font-weight:700">다니엘의 노트</a><p style="margin:42px 0 10px;color:#a16207;font-size:12px;font-weight:700;letter-spacing:.12em">${escapeHtml(input.eyebrow ?? "DANIEL'S NOTE")}</p><h1 style="margin:0 0 24px;font-size:28px;line-height:1.35;letter-spacing:-.04em">${escapeHtml(input.title)}</h1>${input.greeting ? `<p style="margin:0 0 18px;font-size:16px;line-height:1.8">${escapeHtml(input.greeting)}</p>` : ""}${input.paragraphs.map((paragraph) => `<p style="margin:0 0 14px;color:#4b4b4b;font-size:15px;line-height:1.85">${escapeHtml(paragraph)}</p>`).join("")}${detailHtml}${actionHtml}${noteHtml}<div style="margin-top:38px;padding-top:22px;border-top:1px solid #eee"><p style="margin:0;color:#777;font-size:13px;line-height:1.8">궁금한 점이 있으면 <a href="mailto:${supportEmail()}" style="color:#555">${supportEmail()}</a>으로 편하게 알려 주세요.<br>필립 드림</p>${marketingHtml}</div></div><p style="margin:18px 0;text-align:center;color:#aaa;font-size:11px">© 다니엘의 노트 · 경험을 다음 기회로 바꾸는 실전 전자책</p></div></body></html>`,
    attachments: input.attachments,
    headers: input.marketing ? { "List-Unsubscribe": `<${siteUrl()}/mypage/profile>, <mailto:${supportEmail()}?subject=${encodeURIComponent("이메일 소식 수신 해제")}>` } : undefined,
  };
}

export function receiptAttachment(input: { orderId: string; title: string; amount: number; provider: string; purchasedAt?: string }) {
  const receipt = [
    "다니엘의 노트 결제 확인서",
    "",
    `상품: ${input.title}`,
    `결제금액: ${input.amount.toLocaleString("ko-KR")}원`,
    `결제수단: ${input.provider}`,
    `주문번호: ${input.orderId}`,
    `결제일시: ${input.purchasedAt ?? new Date().toISOString()}`,
    "",
    "본 확인서는 주문 확인용이에요. 전자책은 로그인 후 내 서재에서 안전하게 이용할 수 있어요.",
  ].join("\n");
  return textAttachment(`danielsnote-receipt-${input.orderId}.txt`, receipt);
}

export const emailLinks = {
  library: () => `${siteUrl()}/mypage/library`,
  orders: () => `${siteUrl()}/mypage/orders`,
  profile: () => `${siteUrl()}/mypage/profile`,
  adminOperations: () => `${siteUrl()}/admin/operations`,
  adminRefunds: () => `${siteUrl()}/admin/refunds`,
};
