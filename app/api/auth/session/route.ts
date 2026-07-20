import { NextResponse } from "next/server";
import { cookieValue, readSessionToken, SESSION_COOKIE } from "@/app/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await readSessionToken(cookieValue(request, SESSION_COOKIE));
  return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
}
