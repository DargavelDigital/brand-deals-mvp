import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const TOKEN_URL =
  (env.TIKTOK_API_BASE?.replace(/\/$/, "") || "https://open.tiktokapis.com") +
  "/v2/oauth/token/";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");

  // 0) Handle denied/failed flows early
  if (error) {
    console.error("[tiktok/callback] error from TikTok:", error, errorDesc);
    return NextResponse.redirect(
      new URL(`/en/tools/connect?provider=tiktok&error=${encodeURIComponent(error)}`, env.NEXTAUTH_URL || url.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/en/tools/connect?provider=tiktok&error=missing_code`, env.NEXTAUTH_URL || url.origin)
    );
  }

  // (Optional) Validate state matches what you stored pre-auth.
  // For quick MVP, we skip verifying state storage.
  // If you kept state in a cookie, check it here and clear it.

  const redirectUri =
    env.TIKTOK_REDIRECT_URI?.trim() ||
    `${(env.NEXTAUTH_URL || url.origin).replace(/\/$/, "")}/api/tiktok/auth/callback`;

  // 1) Token exchange
  try {
    const body = {
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    };

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
      // TikTok requires JSON POST
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("[tiktok/callback] token exchange failed", res.status, json);
      return NextResponse.redirect(
        new URL(`/en/tools/connect?provider=tiktok&error=token_exchange_failed`, env.NEXTAUTH_URL || url.origin)
      );
    }

    // Expect something like:
    // {
    //   "access_token": "...",
    //   "expires_in": 86400,
    //   "refresh_token": "...",
    //   "refresh_expires_in": 2592000,
    //   "open_id": "user...",
    //   "scope": "user.info.basic,video.list"
    // }
    // For MVP, we won't persist in DB yet; we just set a short cookie flag.

    const c = cookies();
    // Non-secret, UI-only flag to show "Connected" in Connect page.
    c.set("tiktok_connected", "1", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 3, // 3 days
    });

    // (Optional) Store tokens server-side (DB or encrypted) later.

    return NextResponse.redirect(
      new URL(`/en/tools/connect?provider=tiktok&connected=1`, env.NEXTAUTH_URL || url.origin)
    );
  } catch (e) {
    console.error("[tiktok/callback] INTERNAL_ERROR", e);
    return NextResponse.redirect(
      new URL(`/en/tools/connect?provider=tiktok&error=internal_error`, env.NEXTAUTH_URL || url.origin)
    );
  }
}
