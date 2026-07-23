import { NextResponse } from "next/server";
import { getAuthenticatedMember, publicMember } from "@/app/auth/member";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const member = await getAuthenticatedMember(request);
    return NextResponse.json({ user: member ? publicMember(member) : null }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }
}
