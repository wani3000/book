import { NextResponse } from "next/server";
import { kakaoLoginEnabled } from "@/app/auth/kakao";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { clientId: process.env.GOOGLE_CLIENT_ID ?? "", kakaoEnabled: kakaoLoginEnabled() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
