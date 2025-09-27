import { NextResponse } from "next/server";

// If you have a real start handler, keep it; otherwise provide a soft OK fallback:
export async function GET() {
  const haveSecrets =
    !!process.env.INSTAGRAM_APP_ID && !!process.env.INSTAGRAM_APP_SECRET && !!process.env.INSTAGRAM_REDIRECT_URI;
  if (!haveSecrets) {
    // Dashboard may prefetch; don't error – tell UI it's not configured
   return NextResponse.json({ ok: true, configured: false, authUrl: null, reason: "NOT_CONFIGURED" });
  }
  // If you have a real generator, return the real URL here.
  // return NextResponse.json({ ok: true, configured: true, authUrl });
  return NextResponse.json({ ok: true, configured: true, authUrl: "#" });
}
