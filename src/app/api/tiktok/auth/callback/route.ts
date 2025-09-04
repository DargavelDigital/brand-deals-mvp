import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/crypto/secretBox'
import { env } from '@/lib/env'
import { oauthRedirect } from '@/lib/oauth/redirect'

export async function GET(request: Request) {
  try {
    // Check feature flags
    if (env.FEATURE_TIKTOK_ENABLED !== 'true' && env.SOCIAL_TIKTOK_ENABLED !== 'true') {
      return NextResponse.json({ ok: false, error: 'TikTok integration disabled' }, { status: 404 })
    }

    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      return NextResponse.json({ ok: false, error: `OAuth error: ${error}` }, { status: 400 })
    }

    if (!code || !state) {
      return NextResponse.json({ ok: false, error: 'Missing code or state' }, { status: 400 })
    }

    // Verify state
    const cookieStore = await cookies()
    const storedState = cookieStore.get('tiktok_oauth_state')?.value
    if (!storedState || storedState !== state) {
      return NextResponse.json({ ok: false, error: 'Invalid state' }, { status: 400 })
    }

    // Validate required env vars
    if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_CLIENT_SECRET || !env.NEXTAUTH_URL) {
      return NextResponse.json({ ok: false, error: 'TikTok configuration missing' }, { status: 500 })
    }

    // Exchange code for token
    const apiBase = env.TIKTOK_API_BASE || 'https://open.tiktokapis.com'
    const redirectUri = oauthRedirect('/api/tiktok/auth/callback')
    
    const tokenResponse = await fetch(`${apiBase}/v2/oauth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: env.TIKTOK_CLIENT_KEY,
        client_secret: env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      return NextResponse.json({ 
        ok: false, 
        error: errorData.error_description || 'Token exchange failed' 
      }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    if (!access_token) {
      return NextResponse.json({ ok: false, error: 'No access token received' }, { status: 400 })
    }

    // Calculate expiry
    const expiresAt = expires_in ? Date.now() + (expires_in * 1000) : Date.now() + (24 * 60 * 60 * 1000) // 24h fallback

    // Encrypt and store token bundle
    const tokenBundle = {
      at: access_token,
      rt: refresh_token || '',
      ea: expiresAt,
      s: 'v1'
    }
    
    const encrypted = encrypt(JSON.stringify(tokenBundle))
    const encryptedData = Buffer.concat([encrypted.iv, encrypted.tag, encrypted.enc]).toString('base64')

    // Create response and set cookies
    const response = NextResponse.redirect(oauthRedirect('/tools/connect'))
    
    // Clear state cookie
    response.cookies.delete('tiktok_oauth_state')
    
    // Set encrypted token cookie
    response.cookies.set('tiktok_token', encryptedData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    
    // Set light connection indicator
    response.cookies.set('tiktok_conn', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('TikTok callback error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
