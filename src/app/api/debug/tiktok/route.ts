import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const origin = env.NEXTAUTH_URL?.trim() || new URL(req.url).origin;
  const redirectUri =
    env.TIKTOK_REDIRECT_URI?.trim() ||
    `${origin.replace(/\/$/, "")}/api/tiktok/auth/callback`;

  return NextResponse.json({
    ok: true,
    enabled:
      env.FEATURE_TIKTOK_ENABLED === "true" ||
      env.SOCIAL_TIKTOK_ENABLED === "true",
    present: {
      TIKTOK_CLIENT_KEY: !!env.TIKTOK_CLIENT_KEY,
      TIKTOK_CLIENT_SECRET: !!env.TIKTOK_CLIENT_SECRET,
      TIKTOK_SCOPES: !!env.TIKTOK_SCOPES,
      TIKTOK_AUTH_BASE: !!env.TIKTOK_AUTH_BASE,
      TIKTOK_API_BASE: !!env.TIKTOK_API_BASE,
      NEXTAUTH_URL: !!env.NEXTAUTH_URL,
      TIKTOK_REDIRECT_URI: !!env.TIKTOK_REDIRECT_URI,
    },
    computed: { origin, redirectUri },
    note: "No secrets returned. Use this to verify config."
  });
}
