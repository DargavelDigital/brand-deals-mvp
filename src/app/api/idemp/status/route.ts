import { NextResponse } from 'next/server';

// Static allowlist for Edge Runtime compatibility
const allowlist = {
  globs: [
    "/api/auth/**",
    "/api/invite/**",
    "/api/audit/**",
    "/api/match/**"
  ]
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: process.env.FEATURE_IDEMPOTENCY_GATE ?? 'warn',
    allowlist: allowlist.globs,
    ts: new Date().toISOString()
  });
}
