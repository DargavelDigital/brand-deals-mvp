// src/app/api/tiktok/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'

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
    const expectedState = jar.get('tiktok_state')?.value
    const origin = env.NEXTAUTH_URL ?? `${url.protocol}//${url.host}`
    const redirectUri = `${origin}/api/tiktok/auth/callback`

    if (err) {
      log.warn({ err, errDesc }, '[tiktok/callback] OAuth error from TikTok')
      const to = `${origin}/en/tools/connect?provider=tiktok&error=${encodeURIComponent(err)}`
      return NextResponse.redirect(to)
    }

    if (!code || !state || !expectedState || state !== expectedState) {
      log.warn({ code: !!code, state: !!state, expectedState: !!expectedState }, '[tiktok/callback] invalid state')
      const to = `${origin}/en/tools/connect?provider=tiktok&error=invalid_state`
      return NextResponse.redirect(to)
    }

    const { ok, status, json } = await exchangeCodeForTokens(code, redirectUri)
    if (!ok || !json?.access_token) {
      log.warn({ status, json }, '[tiktok/callback] token exchange failed')
      const to = `${origin}/en/tools/connect?provider=tiktok&error=token_exchange_failed`
      return NextResponse.redirect(to)
    }

    // Get workspace ID
    let workspaceId: string
    try {
      const { workspaceId: wsid } = await requireSessionOrDemo(req)
      workspaceId = wsid
      log.info({ workspaceId }, '[tiktok/callback] workspace resolved')
    } catch (e) {
      log.error({ e }, '[tiktok/callback] failed to get workspace ID')
      return NextResponse.json({ ok: false, error: 'CALLBACK_ERROR' }, { status: 500 })
    }

    // Success: set cookies
    const res = NextResponse.redirect(
      `${origin}/en/tools/connect?provider=tiktok&connected=1`
    )

    // clear state cookie
    res.cookies.set('tiktok_state', '', { path: '/', maxAge: 0 })

    // set tiktok_conn cookie with workspace info and tokens
    const now = Date.now()
    const expiresAt = json.expires_in ? new Date(now + (json.expires_in * 1000)).toISOString() : undefined
    
    const tiktokConnData = {
      wsid: workspaceId,
      createdAt: new Date().toISOString(),
      provider: 'tiktok',
      access_token: json.access_token,
      open_id: json.open_id,
      expires_at: expiresAt,
      ...(json.refresh_token && { refresh_token: json.refresh_token })
    }
    
    res.cookies.set('tiktok_conn', JSON.stringify(tiktokConnData), {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    log.info({ workspaceId }, '[tiktok/callback] TikTok connection established')

    return res
  } catch (e) {
    log.error({ e }, '[tiktok/callback] unhandled error')
    return NextResponse.json({ ok: false, error: 'CALLBACK_ERROR' }, { status: 500 })
  }
}
