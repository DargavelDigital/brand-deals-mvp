import { NextResponse, NextRequest } from "next/server";
import { env } from "@/lib/env";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const enabled =
    env.FEATURE_TIKTOK_ENABLED === "true" ||
    env.SOCIAL_TIKTOK_ENABLED === "true";

  if (!enabled) {
    return NextResponse.json(
      { ok: false, error: "TikTok disabled by flag" },
      { status: 400 }
    );
  }

  const clientKey = env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = env.TIKTOK_CLIENT_SECRET?.trim();

  const origin = env.NEXTAUTH_URL?.trim() || new URL(req.url).origin;
  const redirectUri =
    env.TIKTOK_REDIRECT_URI?.trim() ||
    `${origin.replace(/\/$/, "")}/api/tiktok/auth/callback`;

  const AUTH_BASE =
    (env.TIKTOK_AUTH_BASE?.replace(/\/$/, "") ||
      "https://www.tiktok.com") + "/v2/auth/authorize/";
  const scopes =
    env.TIKTOK_SCOPES?.trim() ||
    "user.info.basic,video.list,video.stats";

  const missing: string[] = [];
  if (!clientKey) missing.push("TIKTOK_CLIENT_KEY");
  if (!clientSecret) missing.push("TIKTOK_CLIENT_SECRET");
  if (!redirectUri) missing.push("TIKTOK_REDIRECT_URI (or origin fallback)");

  if (missing.length) {
    const payload =
      process.env.NODE_ENV === "production"
        ? { ok: false, error: "TikTok configuration missing" }
        : { ok: false, error: "TikTok configuration missing", missing };
    console.error("[tiktok/start] missing:", missing);
    return NextResponse.json(payload, { status: 500 });
  }

  const state = crypto.randomUUID();
  const url = new URL(AUTH_BASE);
  url.searchParams.set("client_key", clientKey);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);

  // You can redirect directly, or return JSON with the URL.
  return NextResponse.json({ ok: true, auth_url: url.toString() });
}
