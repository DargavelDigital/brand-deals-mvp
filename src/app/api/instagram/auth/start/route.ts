import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { getAuthUrl } from '@/services/instagram/meta'

export async function GET() {
  console.error('🔴🔴🔴 INSTAGRAM OAUTH START - ENTRY POINT 🔴🔴🔴', new Date().toISOString()); // Use console.error so it's red and obvious
  
  try {
    // Simple, direct configuration check
    console.error('🔴 Instagram OAuth configuration check:', {
      hasAppId: !!process.env.INSTAGRAM_APP_ID,
      hasSecret: !!process.env.INSTAGRAM_APP_SECRET,
      hasRedirectUri: !!process.env.INSTAGRAM_REDIRECT_URI,
      appIdValue: process.env.INSTAGRAM_APP_ID?.substring(0, 10) + '...',
      secretValue: process.env.INSTAGRAM_APP_SECRET?.substring(0, 10) + '...',
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
      enabled: process.env.SOCIAL_INSTAGRAM_ENABLED,
      allInstagramEnvVars: Object.keys(process.env).filter(key => key.includes('INSTAGRAM'))
    });

    if (!process.env.INSTAGRAM_APP_ID || !process.env.INSTAGRAM_APP_SECRET) {
      console.error('🔴 Instagram not configured - missing required env vars');
      return NextResponse.json({
        ok: true,
        configured: false,
        url: null,
        reason: 'NOT_CONFIGURED'
      });
    }

    // Generate crypto-random state
    const state = crypto.randomUUID()
    
    // Set state cookie
    const cookieStore = await cookies()
    cookieStore.set('ig_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10, // 10 minutes
      path: '/'
    })

    // Configuration is OK, generate OAuth URL
    console.error('🔴 Configuration OK, generating OAuth URL with state:', state);
    const authUrl = getAuthUrl({ state });
    console.error('🔴 Generated Instagram OAuth URL:', authUrl);

    log.info({ state }, '[instagram/auth/start] generated OAuth URL');

    return NextResponse.json({
      ok: true,
      configured: true,
      url: authUrl
    });
  } catch (err) {
    console.error('🔴 Instagram OAuth start error:', err); // Debug log
    log.error({ err }, '[instagram/auth/start] unhandled error');
    const errorResponse = { ok: false, error: 'INTERNAL_ERROR' };
    console.error('🔴 RETURNING ERROR RESPONSE:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}