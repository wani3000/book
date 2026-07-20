import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { clientId: process.env.GOOGLE_CLIENT_ID ?? "" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
