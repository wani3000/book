import { getDb } from "@/db";
import { notificationOutbox } from "@/db/schema";

type Notice = { memberId?: string; recipient: string; event: string; subject: string; text: string };

export async function deliverNotice(notice: Notice) {
  if (!notice.recipient.includes("@") || notice.recipient.endsWith("@daniels-note.kakao.local")) return;
  const id = crypto.randomUUID();
  const payload = JSON.stringify({ subject: notice.subject, text: notice.text });
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.TRANSACTIONAL_EMAIL_FROM;
  let status = "pending";
  let lastError: string | null = null;
  if (apiKey && from) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [notice.recipient], subject: notice.subject, text: notice.text }),
      });
      status = response.ok ? "sent" : "failed";
      if (!response.ok) lastError = `HTTP_${response.status}`;
    } catch { status = "failed"; lastError = "NETWORK_ERROR"; }
  }
  await getDb().insert(notificationOutbox).values({
    id, memberId: notice.memberId ?? null, event: notice.event, recipient: notice.recipient,
    payload, status, lastError, sentAt: status === "sent" ? new Date().toISOString() : null,
  });
}
