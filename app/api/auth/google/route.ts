import { createRemoteJWKSet, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/app/auth/session";
import { isConfiguredAdmin } from "@/app/auth/member";
import { getDb } from "@/db";
import { members } from "@/db/schema";

export const dynamic = "force-dynamic";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function POST(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || !process.env.GOOGLE_SESSION_SECRET) {
    return NextResponse.json({ error: "Google 로그인이 아직 설정되지 않았습니다." }, { status: 503 });
  }

  let credential = "";
  try {
    const body = await request.json() as { credential?: unknown };
    credential = typeof body.credential === "string" ? body.credential : "";
  } catch {
    return NextResponse.json({ error: "잘못된 로그인 요청입니다." }, { status: 400 });
  }

  if (!credential) return NextResponse.json({ error: "Google 인증 정보가 없습니다." }, { status: 400 });

  try {
    const { payload } = await jwtVerify(credential, googleKeys, {
      audience: clientId,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
    });
    if (!payload.sub || payload.email_verified !== true || typeof payload.email !== "string") {
      return NextResponse.json({ error: "확인된 Google 이메일이 필요합니다." }, { status: 401 });
    }

    const user = {
      id: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" && payload.name.trim() ? payload.name : payload.email.split("@")[0],
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
    };
    const existing = await getDb().query.members.findFirst({ where: eq(members.id, user.id) });
    if (existing?.status === "suspended") {
      return NextResponse.json({ error: "이용이 정지된 계정입니다. 관리자에게 문의해 주세요." }, { status: 403 });
    }
    const now = new Date().toISOString();
    await getDb().insert(members).values({
      id: user.id,
      email: user.email.toLowerCase(),
      name: user.name,
      displayName: user.name,
      picture: user.picture,
      role: isConfiguredAdmin(user.email) ? "admin" : "member",
      status: "active",
      updatedAt: now,
      lastLoginAt: now,
    }).onConflictDoUpdate({
      target: members.id,
      set: {
        email: user.email.toLowerCase(),
        name: user.name,
        displayName: existing?.status === "deleted" ? user.name : existing?.displayName ?? user.name,
        picture: user.picture,
        status: existing?.status === "deleted" ? "active" : existing?.status ?? "active",
        updatedAt: now,
        lastLoginAt: now,
      },
    });
    const token = await createSessionToken(user);
    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Google 인증을 확인하지 못했습니다." }, { status: 401 });
  }
}
