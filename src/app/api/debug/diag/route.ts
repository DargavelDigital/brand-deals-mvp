import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { flags } from '@/lib/flags';

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      database: Boolean(process.env.DATABASE_URL),
      nextauth: Boolean(env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL),
    },
    providers: {
      google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      youtube: Boolean(process.env.YOUTUBE_API_KEY),
      exa: Boolean(process.env.EXA_API_KEY),
      hunter: Boolean(process.env.HUNTER_API_KEY),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
      resend: Boolean(process.env.RESEND_API_KEY),
      sendgrid: Boolean(process.env.SENDGRID_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      tiktok: Boolean(process.env.TIKTOK_CLIENT_ID && process.env.TIKTOK_CLIENT_SECRET),
      instagram: Boolean(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET),
      linkedin: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
      x: Boolean(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET),
      onlyfans: Boolean(process.env.ONLYFANS_CLIENT_ID && process.env.ONLYFANS_CLIENT_SECRET),
    },
    flags: {
      demoMode: flags.demo.enabled,
      aiDryRun: flags.qa.aiDryRun,
      crmLight: flags.features.crmLight,
      enableDemoAuth: env.ENABLE_DEMO_AUTH === '1',
      inviteRequired: Boolean(process.env.INVITE_CODE),
    },
    build: {
      nextVersion: process.env.NEXT_VERSION || 'unknown',
      buildTime: process.env.BUILD_TIME || 'unknown',
    }
  });
}
