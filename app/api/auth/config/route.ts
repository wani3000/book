import { NextResponse } from "next/server";
import { kakaoLoginEnabled } from "@/app/auth/kakao";
import { googleOAuthEnabled } from "@/app/auth/google";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { googleOAuthEnabled: googleOAuthEnabled(), kakaoEnabled: kakaoLoginEnabled() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
