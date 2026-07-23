import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember, hasRecentAuthentication } from "@/app/auth/member";
import { marketingCampaignMessage, recipientEmail } from "@/app/notifications/events";
import { deliverNotice, retryPendingNotices } from "@/app/notifications/outbox";
import { requireSameOrigin } from "@/app/security/request";
import { getDb } from "@/db";
import { auditLogs, members } from "@/db/schema";

export const dynamic = "force-dynamic";

async function requireAdmin(request: Request) {
  const member = await getAuthenticatedMember(request);
  return member?.isAdmin ? member : null;
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "관리자 권한이 필요해요." }, { status: 403 });
  if (!hasRecentAuthentication(admin)) return NextResponse.json({ error: "안전한 발송을 위해 다시 로그인해 주세요." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { action?: unknown; subject?: unknown; title?: unknown; message?: unknown; actionLabel?: unknown; actionUrl?: unknown };
  if (body.action === "retry") {
    const result = await retryPendingNotices(20);
    return NextResponse.json({ ok: true, message: `${result.found}개를 확인했고 ${result.completed}개를 다시 보냈어요.` });
  }
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const actionLabel = typeof body.actionLabel === "string" ? body.actionLabel.trim() : "";
  const actionUrl = typeof body.actionUrl === "string" ? body.actionUrl.trim() : "";
  if (subject.length < 2 || subject.length > 80 || title.length < 2 || title.length > 100 || message.length < 10 || message.length > 2000) return NextResponse.json({ error: "제목과 내용을 다시 확인해 주세요." }, { status: 400 });
  if (actionUrl && (!actionUrl.startsWith("https://") || actionUrl.length > 500)) return NextResponse.json({ error: "버튼 주소는 안전한 https 주소로 입력해 주세요." }, { status: 400 });
  const email = marketingCampaignMessage({ subject, title, message, actionLabel, actionUrl });
  if (body.action === "test") {
    const status = await deliverNotice({ memberId: admin.id, recipient: recipientEmail(admin), event: "marketing.preview", ...email });
    return NextResponse.json({ ok: status !== "failed", message: status === "failed" ? "미리보기를 보내지 못했어요." : "내 이메일로 미리보기를 보냈어요." }, { status: status === "failed" ? 502 : 200 });
  }
  const recipients = await getDb().select().from(members).where(and(eq(members.status, "active"), eq(members.marketingConsent, 1))).limit(200);
  const results = await Promise.allSettled(recipients.map((member) => deliverNotice({ memberId: member.id, recipient: recipientEmail(member), event: "marketing.campaign", ...email })));
  const accepted = results.filter((result) => result.status === "fulfilled" && ["sent", "pending"].includes(result.value)).length;
  await getDb().insert(auditLogs).values({ id: crypto.randomUUID(), actorMemberId: admin.id, action: "notification.campaign.sent", entityType: "notification", entityId: crypto.randomUUID(), detail: `${accepted}/${recipients.length}` });
  return NextResponse.json({ ok: true, message: `${accepted}명에게 소식 발송을 준비했어요.` });
}
