import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { getAuthUrl } from '@/services/instagram/meta'

export async function GET() {
  console.error('🔴 INSTAGRAM OAUTH START - ENTRY POINT'); // Use console.error so it's red and obvious
  
  try {
    // Check if environment variables exist
    const hasAppId = !!process.env.INSTAGRAM_APP_ID
    const hasSecret = !!process.env.INSTAGRAM_APP_SECRET
    const appUrlSet = !!process.env.APP_URL

    console.error('🔴 Instagram config:', {
      hasAppId,
      hasSecret,
      appUrlSet,
      hasRedirectUri: !!process.env.INSTAGRAM_REDIRECT_URI,
      enabled: process.env.SOCIAL_INSTAGRAM_ENABLED
    }); // Debug log

    if (!hasAppId || !hasSecret || !appUrlSet) {
      console.error('🔴 Instagram not configured - missing required env vars'); // Debug log
      const response = {
        ok: true,
        configured: false,
        url: null,
        reason: 'NOT_CONFIGURED'
      };
      console.error('🔴 RETURNING NOT_CONFIGURED RESPONSE:', response);
      return NextResponse.json(response);
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

    // Generate OAuth URL
    console.error('🔴 Generating Instagram OAuth URL with state:', state); // Debug log
    const url = getAuthUrl({ state });
    console.error('🔴 Generated Instagram OAuth URL:', url); // Debug log

    log.info({ state }, '[instagram/auth/start] generated OAuth URL');

    const response = {
      ok: true,
      configured: true,
      url
    };
    console.error('🔴 RETURNING SUCCESS RESPONSE:', response);
    return NextResponse.json(response);
  } catch (err) {
    console.error('🔴 Instagram OAuth start error:', err); // Debug log
    log.error({ err }, '[instagram/auth/start] unhandled error');
    const errorResponse = { ok: false, error: 'INTERNAL_ERROR' };
    console.error('🔴 RETURNING ERROR RESPONSE:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}