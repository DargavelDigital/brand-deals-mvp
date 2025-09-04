import { NextResponse } from 'next/server';
import * as serverEnv from '@/lib/env';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const p = process.env;

  // Read both ways: directly and via env.ts
  const diag = {
    viaProcessEnv: {
      FEATURE_TIKTOK_ENABLED: p.FEATURE_TIKTOK_ENABLED ?? null,
      SOCIAL_TIKTOK_ENABLED: p.SOCIAL_TIKTOK_ENABLED ?? null,
      TIKTOK_CLIENT_KEY: p.TIKTOK_CLIENT_KEY ? '(set)' : null,
      TIKTOK_CLIENT_SECRET: p.TIKTOK_CLIENT_SECRET ? '(set)' : null,
      TIKTOK_REDIRECT_URI: p.TIKTOK_REDIRECT_URI ?? null,
      TIKTOK_SCOPES: p.TIKTOK_SCOPES ?? null,
      NODE_ENV: p.NODE_ENV ?? null,
    },
    viaEnvTs: {
      FEATURE_TIKTOK_ENABLED: (serverEnv as any).FEATURE_TIKTOK_ENABLED ?? null,
      SOCIAL_TIKTOK_ENABLED: (serverEnv as any).SOCIAL_TIKTOK_ENABLED ?? null,
      TIKTOK_CLIENT_KEY: (serverEnv as any).TIKTOK_CLIENT_KEY ? '(set)' : null,
      TIKTOK_CLIENT_SECRET: (serverEnv as any).TIKTOK_CLIENT_SECRET ? '(set)' : null,
      TIKTOK_REDIRECT_URI: (serverEnv as any).TIKTOK_REDIRECT_URI ?? null,
      TIKTOK_SCOPES: (serverEnv as any).TIKTOK_SCOPES ?? null,
    }
  };

  return NextResponse.json({ ok: true, diag });
}
