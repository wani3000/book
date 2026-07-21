import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/app/auth/member";
import { unlinkKakaoUser } from "@/app/auth/kakao";
import { getDb } from "@/db";
import { authIdentities } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  const member = await getAuthenticatedMember(request);
  if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { provider?: unknown };
  if (body.provider !== "kakao" && body.provider !== "google") return NextResponse.json({ error: "지원하지 않는 로그인 연결입니다." }, { status: 400 });
  const provider = body.provider;

  const [[identityCount], identity] = await Promise.all([
    getDb().select({ value: count() }).from(authIdentities).where(eq(authIdentities.memberId, member.id)),
    getDb().query.authIdentities.findFirst({
      where: and(eq(authIdentities.memberId, member.id), eq(authIdentities.provider, provider)),
    }),
  ]);
  if (!identity) return NextResponse.json({ error: "연결된 카카오 계정이 없습니다." }, { status: 404 });
  if ((identityCount?.value ?? 0) <= 1) {
    return NextResponse.json({ error: "마지막 로그인 수단은 해제할 수 없습니다. 다른 계정을 먼저 연결해 주세요." }, { status: 409 });
  }
  try {
    if (provider === "kakao") await unlinkKakaoUser(identity.providerSubject);
    await getDb().delete(authIdentities).where(eq(authIdentities.id, identity.id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "카카오 계정 연결을 해제하지 못했습니다." }, { status: 502 });
  }
}
