import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  return NextResponse.json({
    ok: true,
    db: Boolean(process.env.DATABASE_URL),
    nextauth: Boolean(env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL),
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    youtube: Boolean(process.env.YOUTUBE_API_KEY),
    exa: Boolean(process.env.EXA_API_KEY),
    hunter: Boolean(process.env.HUNTER_API_KEY),
    timestamp: new Date().toISOString()
  });
}
