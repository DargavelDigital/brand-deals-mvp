import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    enabled: !!(env.FEATURE_TIKTOK_ENABLED || env.SOCIAL_TIKTOK_ENABLED),
    present: {
      TIKTOK_CLIENT_KEY: !!env.TIKTOK_CLIENT_KEY,
      TIKTOK_CLIENT_SECRET: !!env.TIKTOK_CLIENT_SECRET,
      TIKTOK_SCOPES: !!env.TIKTOK_SCOPES,
      TIKTOK_AUTH_BASE: !!env.TIKTOK_AUTH_BASE,
      TIKTOK_API_BASE: !!env.TIKTOK_API_BASE,
      NEXTAUTH_URL: !!env.NEXTAUTH_URL,
      TIKTOK_REDIRECT_URI: !!env.TIKTOK_REDIRECT_URI,
    },
    computed: {
      origin: env.NEXTAUTH_URL || 'unknown',
      redirectUri: `${env.NEXTAUTH_URL || ''}/api/tiktok/auth/callback`,
    },
    note: 'No secrets returned. Use this to verify config.',
  });
}
