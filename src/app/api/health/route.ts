import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  // Check if all required environment variables exist
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const hasNextAuthUrl = Boolean(process.env.NEXTAUTH_URL);
  const hasNextAuthSecret = Boolean(env.NEXTAUTH_SECRET);
  
  // Return ok: true only if all required variables are present
  const ok = hasDatabaseUrl && hasNextAuthUrl && hasNextAuthSecret;
  
  return NextResponse.json({
    ok,
    env: { 
      node: env.NODE_ENV,
      hasDatabaseUrl,
      hasNextAuthUrl,
      hasNextAuthSecret
    },
    timestamp: new Date().toISOString()
  });
}
