import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const c = cookies();
  const connected = c.get("tiktok_connected")?.value === "1";
  return NextResponse.json({ ok: true, connected });
}
