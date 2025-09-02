import { NextResponse } from 'next/server';
import { env, providers } from '@/lib/env';

export async function GET() {
  // "Core configs present" means auth & app can boot.
  const coreOk = Boolean(env.NEXTAUTH_SECRET);
  return NextResponse.json({
    ok: true,
    coreOk,
    env: { node: env.NODE_ENV },
    timestamp: new Date().toISOString()
  });
}
