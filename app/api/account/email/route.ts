import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { emailVerificationMessage, notifyEmailChanged } from "@/app/notifications/events";
import { deliverNotice } from "@/app/notifications/outbox";
import { enforceRateLimit, requireSameOrigin } from "@/app/security/request";
import { getDb } from "@/db";
import { members } from "@/db/schema";

export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function tokenHash(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const limited = await enforceRateLimit(request, "notification-email", 4, 900);
  if (limited) return limited;
  const member = await getAuthenticatedMember(request);
  if (!member) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 254 || email.endsWith("@daniels-note.kakao.local")) return NextResponse.json({ error: "사용할 수 있는 이메일 주소를 입력해 주세요." }, { status: 400 });
  if (email === (member.notificationEmail || member.email).toLowerCase()) return NextResponse.json({ error: "이미 알림을 받고 있는 이메일 주소예요." }, { status: 409 });

  const token = `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await getDb().update(members).set({ pendingNotificationEmail: email, notificationEmailTokenHash: await tokenHash(token), notificationEmailTokenExpiresAt: expiresAt, updatedAt: new Date().toISOString() }).where(eq(members.id, member.id));
  const verifyUrl = `${new URL(request.url).origin}/api/account/email?token=${encodeURIComponent(token)}`;
  const message = emailVerificationMessage(member.displayName, verifyUrl);
  const status = await deliverNotice({ memberId: member.id, recipient: email, event: "email.verification", ...message });
  if (status === "failed") return NextResponse.json({ error: "확인 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  return NextResponse.json({ ok: true, message: `${email}로 확인 메일을 보냈어요. 30분 안에 확인해 주세요.` });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (token.length < 40 || token.length > 160) return NextResponse.redirect(new URL("/mypage/profile?email=invalid", request.url));
  const now = new Date().toISOString();
  const member = await getDb().query.members.findFirst({ where: and(eq(members.notificationEmailTokenHash, await tokenHash(token)), eq(members.status, "active")) });
  if (!member?.pendingNotificationEmail || !member.notificationEmailTokenExpiresAt || member.notificationEmailTokenExpiresAt < now) return NextResponse.redirect(new URL("/mypage/profile?email=expired", request.url));
  const previousEmail = member.notificationEmail || member.email;
  const nextEmail = member.pendingNotificationEmail;
  await getDb().update(members).set({ notificationEmail: nextEmail, notificationEmailVerifiedAt: now, pendingNotificationEmail: null, notificationEmailTokenHash: null, notificationEmailTokenExpiresAt: null, updatedAt: now }).where(eq(members.id, member.id));
  await notifyEmailChanged(member, nextEmail, previousEmail);
  return NextResponse.redirect(new URL("/mypage/profile?email=verified", request.url));
}

export async function DELETE(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const member = await getAuthenticatedMember(request);
  if (!member) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  const previousEmail = member.notificationEmail;
  await getDb().update(members).set({ notificationEmail: null, notificationEmailVerifiedAt: null, pendingNotificationEmail: null, notificationEmailTokenHash: null, notificationEmailTokenExpiresAt: null, updatedAt: new Date().toISOString() }).where(eq(members.id, member.id));
  if (previousEmail) await notifyEmailChanged(member, member.email, previousEmail);
  return NextResponse.json({ ok: true, message: "로그인 이메일로 알림을 받도록 바꿨어요." });
}
