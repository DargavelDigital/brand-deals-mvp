import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, enabled: false, reason: "COMING_SOON" }); // 200 not 501
}