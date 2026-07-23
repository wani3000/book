import { getDb } from "@/db";
import { and, eq, inArray, lt } from "drizzle-orm";
import { notificationOutbox } from "@/db/schema";
import type { EmailAttachment } from "./templates";

type Notice = { memberId?: string; recipient: string; event: string; subject: string; text: string; html?: string; attachments?: EmailAttachment[]; headers?: Record<string, string> };

export type NoticeDeliveryStatus = "sent" | "pending" | "failed" | "skipped";

const replyTo = () => process.env.CUSTOMER_SUPPORT_EMAIL?.trim() || "florencelab@naver.com";

async function sendWithRetry(notice: Notice, id: string, startingAttempt = 0) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.TRANSACTIONAL_EMAIL_FROM;
  if (!apiKey || !from) return { status: "pending" as const, attempts: startingAttempt, lastError: null, providerMessageId: null };
  let lastError = "UNKNOWN_ERROR";
  let attempts = startingAttempt;
  for (let attempt = startingAttempt + 1; attempt <= startingAttempt + 3; attempt += 1) {
    attempts = attempt;
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": id },
        body: JSON.stringify({ from, to: [notice.recipient], reply_to: replyTo(), subject: notice.subject, text: notice.text, html: notice.html, attachments: notice.attachments, headers: notice.headers, tags: [{ name: "event", value: notice.event.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 256) }] }),
      });
      const responseBody = await response.json().catch(() => ({})) as { id?: string; message?: string };
      if (response.ok) return { status: "sent" as const, attempts: attempt, lastError: null, providerMessageId: responseBody.id ?? null };
      lastError = `HTTP_${response.status}${responseBody.message ? `:${responseBody.message.slice(0, 180)}` : ""}`;
      if (response.status < 500 && response.status !== 429) break;
    } catch { lastError = "NETWORK_ERROR"; }
    await new Promise((resolve) => setTimeout(resolve, attempt * 250));
  }
  return { status: "failed" as const, attempts, lastError, providerMessageId: null };
}

export async function deliverNotice(notice: Notice): Promise<NoticeDeliveryStatus> {
  if (!notice.recipient.includes("@") || notice.recipient.endsWith("@daniels-note.kakao.local")) return "skipped";
  const id = crypto.randomUUID();
  const payload = JSON.stringify(notice);
  const now = new Date().toISOString();
  try {
    await getDb().insert(notificationOutbox).values({
      id, memberId: notice.memberId ?? null, event: notice.event, recipient: notice.recipient,
      payload, status: "pending", attemptCount: 0, updatedAt: now,
    });
    const result = await sendWithRetry(notice, id);
    await getDb().update(notificationOutbox).set({ status: result.status, attemptCount: result.attempts, lastError: result.lastError, providerMessageId: result.providerMessageId, sentAt: result.status === "sent" ? new Date().toISOString() : null, updatedAt: new Date().toISOString() }).where(eq(notificationOutbox.id, id));
    return result.status;
  } catch {
    console.error("Transactional notice could not be recorded", { event: notice.event, memberId: notice.memberId ?? null });
    return "failed";
  }
}

export async function retryNotice(id: string) {
  const row = await getDb().query.notificationOutbox.findFirst({ where: eq(notificationOutbox.id, id) });
  if (!row || row.status === "sent") return row?.status ?? "missing";
  const notice = JSON.parse(row.payload) as Notice;
  const result = await sendWithRetry(notice, row.id, row.attemptCount);
  await getDb().update(notificationOutbox).set({ status: result.status, attemptCount: result.attempts, lastError: result.lastError, providerMessageId: result.providerMessageId, sentAt: result.status === "sent" ? new Date().toISOString() : null, updatedAt: new Date().toISOString() }).where(eq(notificationOutbox.id, row.id));
  return result.status;
}

export async function retryPendingNotices(limit = 20) {
  const rows = await getDb().select({ id: notificationOutbox.id }).from(notificationOutbox).where(and(inArray(notificationOutbox.status, ["pending", "failed"]), lt(notificationOutbox.attemptCount, 9))).limit(Math.min(Math.max(limit, 1), 50));
  const results = await Promise.allSettled(rows.map((row) => retryNotice(row.id)));
  return { found: rows.length, completed: results.filter((result) => result.status === "fulfilled" && result.value === "sent").length };
}
