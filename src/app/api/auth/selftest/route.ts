import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/nextauth-options";

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || null,
    trustHost: process.env.AUTH_TRUST_HOST || null,
    enableDemoAuth: process.env.ENABLE_DEMO_AUTH || null,
  });
}
