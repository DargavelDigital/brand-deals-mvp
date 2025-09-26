import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { log } from '@/lib/log';
import { withRequestContext } from '@/lib/with-request-context';

async function handleGET() {
  log.info('Health check requested', { feature: 'health-check' });
  
  // Check if all required environment variables exist
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const hasNextAuthUrl = Boolean(process.env.NEXTAUTH_URL);
  const hasNextAuthSecret = Boolean(env.NEXTAUTH_SECRET);
  
  // Return ok: true only if all required variables are present
  const ok = hasDatabaseUrl && hasNextAuthUrl && hasNextAuthSecret;
  
  log.info('Health check completed', { 
    ok, 
    hasDatabaseUrl, 
    hasNextAuthUrl, 
    hasNextAuthSecret,
    feature: 'health-check' 
  });
  
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

export const GET = withRequestContext(handleGET);
