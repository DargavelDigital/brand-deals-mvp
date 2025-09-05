import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { log } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AUTH_BASE = (env.TIKTOK_AUTH_BASE || 'https://open-api.tiktok.com').replace(/\/$/, '')
const TOKEN_URL = `${AUTH_BASE}/oauth/token`

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') || undefined
  const connectUrl = `${env.NEXTAUTH_URL || ''}/en/tools/connect?provider=tiktok`

  if (!code) return NextResponse.redirect(`${connectUrl}&error=missing_code`)

  try {
    const form = new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY!,
      client_secret: env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: env.TIKTOK_REDIRECT_URI!,
    })

    const resp = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok || !data?.access_token) {
      log.error({ where: 'tiktok/callback', status: resp.status, data })
      const errRes = NextResponse.redirect(`${connectUrl}&error=token_exchange_failed`)
      // clear any prior cookies on error
      ;['tk_connected','tk_at','tk_rt','tk_meta','tk_state'].forEach(n => errRes.cookies.set(n, '', { path: '/', maxAge: 0 }))
      return errRes
    }

    const accessToken = String(data.access_token)
    const refreshToken = data.refresh_token ? String(data.refresh_token) : undefined
    const expiresIn = Number(data.expires_in || 3600)
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + (isFinite(expiresIn) ? expiresIn : 3600)
    const openId = data.open_id || data.open_id_list?.[0] || null

    const res = NextResponse.redirect(`${connectUrl}&connected=1`)
    res.cookies.set('tk_connected', '1', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
    res.cookies.set('tk_at', accessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: Math.max(1, Math.min(expiresIn, 60 * 60 * 24)) })
    if (refreshToken) res.cookies.set('tk_rt', refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
    res.cookies.set('tk_meta', JSON.stringify({ openId, expiresAt }), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
    // consume state cookie if you set one in /auth/start
    res.cookies.set('tk_state', '', { path: '/', maxAge: 0 })

    return res
  } catch (err) {
    log.error({ where: 'tiktok/callback', err })
    const res = NextResponse.redirect(`${connectUrl}&error=internal`)
    ;['tk_connected','tk_at','tk_rt','tk_meta','tk_state'].forEach(n => res.cookies.set(n, '', { path: '/', maxAge: 0 }))
    return res
  }
}