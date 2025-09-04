import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { env } from '@/lib/env'
import { oauthRedirect } from '@/lib/oauth/redirect'

export async function GET() {
  // Check feature flags
  if (env.FEATURE_TIKTOK_ENABLED !== 'true' && env.SOCIAL_TIKTOK_ENABLED !== 'true') {
    return NextResponse.json({ ok: false, error: 'TikTok integration disabled' }, { status: 404 })
  }

  // Validate required env vars
  if (!env.TIKTOK_CLIENT_KEY || !env.NEXTAUTH_URL) {
    return NextResponse.json({ ok: false, error: 'TikTok configuration missing' }, { status: 500 })
  }

  // Generate state nonce
  const state = randomBytes(32).toString('hex')
  
  // Build authorization URL
  const authBase = env.TIKTOK_AUTH_BASE || 'https://www.tiktok.com'
  const redirectUri = oauthRedirect('/api/tiktok/auth/callback')
  const scopes = env.TIKTOK_SCOPES || 'user.info.basic,video.list,video.stats'
  
  const url = new URL(`${authBase}/v2/auth/authorize/`)
  url.searchParams.set('client_key', env.TIKTOK_CLIENT_KEY)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scopes)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)

  // Set state cookie
  const response = NextResponse.redirect(url.toString())
  response.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/'
  })

  return response
}
