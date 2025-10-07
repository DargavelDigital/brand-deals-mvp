import { NextResponse } from 'next/server'

export async function GET() {
  console.error('🔴🔴🔴 TEST INSTAGRAM ENDPOINT CALLED 🔴🔴🔴');
  
  return NextResponse.json({
    message: 'Instagram test endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      hasAppId: !!process.env.INSTAGRAM_APP_ID,
      hasSecret: !!process.env.INSTAGRAM_APP_SECRET,
      hasRedirectUri: !!process.env.INSTAGRAM_REDIRECT_URI,
      enabled: process.env.SOCIAL_INSTAGRAM_ENABLED,
      nodeEnv: process.env.NODE_ENV
    }
  });
}
