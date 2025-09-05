// src/app/api/tiktok/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { log } from '@/lib/logger'
import { 
  CK_TIKTOK_ACCESS, 
  CK_TIKTOK_REFRESH, 
  CK_TIKTOK_CONNECTED, 
  CK_TIKTOK_STATE 
} from '@/services/tiktok/cookies'

type TikTokTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  refresh_expires_in?: number
  open_id?: string
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
};

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  // TikTok OAuth token endpoint (v2)
  const tokenUrl = `${env.TIKTOK_API_BASE ?? 'https://open.tiktokapis.com'}/v2/oauth/token/`

  const body = new URLSearchParams({
    client_key: env.TIKTOK_CLIENT_KEY!,
    client_secret: env.TIKTOK_CLIENT_SECRET!,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })

  const r = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    // TikTok requires standard server-to-server call; no credentials here
  })

  const json = (await r.json()) as TikTokTokenResponse
  return { ok: r.ok, status: r.status, json }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const err = url.searchParams.get('error')
    const errDesc = url.searchParams.get('error_description') ?? undefined

    const jar = cookies()
    const expectedState = jar.get(CK_TIKTOK_STATE)?.value
    const origin = env.NEXTAUTH_URL ?? `${url.protocol}//${url.host}`
    const redirectUri = `${origin}/api/tiktok/auth/callback`

    if (err) {
      const to = `${origin}/en/tools/connect?provider=tiktok&error=${encodeURIComponent(err)}`
      return NextResponse.redirect(to)
    }

    if (!code || !state || !expectedState || state !== expectedState) {
      const to = `${origin}/en/tools/connect?provider=tiktok&error=invalid_state`
      return NextResponse.redirect(to)
    }

    const { ok, status, json } = await exchangeCodeForTokens(code, redirectUri)
    if (!ok || !json?.access_token) {
      log.warn({ status, json }, '[tiktok/callback] token exchange failed')
      const to = `${origin}/en/tools/connect?provider=tiktok&error=token_exchange_failed`
      return NextResponse.redirect(to)
    }

    // Success: set cookies
    const res = NextResponse.redirect(
      `${origin}/en/tools/connect?provider=tiktok&connected=1`
    )

    // clear state cookie
    res.cookies.set(CK_TIKTOK_STATE, '', { path: '/', maxAge: 0 })

    // set access token
    const oneHour = 60 * 60
    const thirtyDays = 30 * 24 * 60 * 60
    res.cookies.set(CK_TIKTOK_ACCESS, json.access_token!, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/',
      maxAge: json.expires_in ?? oneHour,
    })
    
    // set refresh token only if it exists
    if (json.refresh_token) {
      res.cookies.set(CK_TIKTOK_REFRESH, json.refresh_token, {
        httpOnly: true, secure: true, sameSite: 'lax', path: '/',
        maxAge: json.refresh_expires_in ?? thirtyDays,
      })
    }
    
    // set connected flag for UI
    res.cookies.set(CK_TIKTOK_CONNECTED, '1', {
      httpOnly: false, secure: true, sameSite: 'lax', path: '/', maxAge: thirtyDays,
    })

    return res
  } catch (e) {
    log.error({ e }, '[tiktok/callback] unhandled')
    // last-resort redirect with generic error
    return NextResponse.redirect('/en/tools/connect?provider=tiktok&error=internal')
  }
}
