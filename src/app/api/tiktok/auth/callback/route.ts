import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { log } from '@/lib/logger'

const AUTH_BASE = (env.TIKTOK_AUTH_BASE || 'https://open-api.tiktok.com').replace(/\/$/, '')
const TOKEN_URL = `${AUTH_BASE}/oauth/token`

function setCookie(name: string, value: string, opts: Partial<Parameters<ReturnType<typeof cookies>['set']>[1]> = {}) {
  cookies().set(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    ...opts,
  })
}

function clearAuthCookies() {
  const c = cookies()
  ;['tk_connected','tk_at','tk_rt','tk_meta','tk_state'].forEach(n => c.set(n, '', { path: '/', maxAge: 0 }))
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') || undefined

  const connectUrl = `${env.NEXTAUTH_URL || ''}/en/tools/connect?provider=tiktok`
  if (!code) {
    log.warn({ where: 'tiktok/callback', msg: 'missing_code' })
    return NextResponse.redirect(`${connectUrl}&error=missing_code`)
  }

  // CSRF: verify state if set by start route
  const expectedState = cookies().get('tk_state')?.value
  if (expectedState && state && expectedState !== state) {
    log.warn({ where: 'tiktok/callback', msg: 'state_mismatch', expectedState, state })
    clearAuthCookies()
    return NextResponse.redirect(`${connectUrl}&error=state_mismatch`)
  }

  try {
    const form = new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY!,
      client_secret: env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: env.TIKTOK_REDIRECT_URI!, // must match your TikTok app
    })

    const resp = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })

    const text = await resp.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = { parseError: true, text } }

    if (!resp.ok || !data?.access_token) {
      log.error({ where: 'tiktok/callback', status: resp.status, data })
      clearAuthCookies()
      return NextResponse.redirect(`${connectUrl}&error=token_exchange_failed`)
    }

    const accessToken = String(data.access_token)
    const refreshToken = data.refresh_token ? String(data.refresh_token) : undefined
    const expiresIn = Number(data.expires_in || 3600)
    const openId = data.open_id || data.open_id_list?.[0] || null
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + (isFinite(expiresIn) ? expiresIn : 3600)

    setCookie('tk_connected', '1', { maxAge: 60 * 60 * 24 * 30 })
    setCookie('tk_at', accessToken, { maxAge: Math.max(1, Math.min(expiresIn, 60 * 60 * 24)) })
    if (refreshToken) setCookie('tk_rt', refreshToken, { maxAge: 60 * 60 * 24 * 30 })
    setCookie('tk_meta', JSON.stringify({ openId, expiresAt }), { maxAge: 60 * 60 * 24 * 30 })
    // consume state
    cookies().set('tk_state', '', { path: '/', maxAge: 0 })

    log.info({ where: 'tiktok/callback', ok: true, openId: Boolean(openId) })
    return NextResponse.redirect(`${connectUrl}&connected=1`)
  } catch (err) {
    log.error({ where: 'tiktok/callback', err })
    clearAuthCookies()
    return NextResponse.redirect(`${connectUrl}&error=internal`)
  }
}