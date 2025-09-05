import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { log } from '@/lib/logger'

const AUTH_BASE = (env.TIKTOK_AUTH_BASE || 'https://open-api.tiktok.com').replace(/\/$/, '')
const TOKEN_URL = `${AUTH_BASE}/oauth/token`

function setCookie(name: string, value: string, opts: any = {}) {
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
  ;['tk_connected','tk_at','tk_rt','tk_meta'].forEach(n => c.set(n, '', { path: '/', maxAge: 0 }))
}

export async function POST() {
  const rt = cookies().get('tk_rt')?.value
  if (!rt) return NextResponse.json({ ok: false, connected: false, error: 'NO_REFRESH_TOKEN' })

  try {
    const form = new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY!,
      client_secret: env.TIKTOK_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: rt,
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
      log.warn({ where: 'tiktok/refresh', status: resp.status, data })
      clearAuthCookies()
      return NextResponse.json({ ok: true, connected: false, reason: 'REFRESH_FAILED' })
    }

    const accessToken = String(data.access_token)
    const refreshToken = data.refresh_token ? String(data.refresh_token) : undefined
    const expiresIn = Number(data.expires_in || 3600)
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + (isFinite(expiresIn) ? expiresIn : 3600)

    setCookie('tk_connected', '1', { maxAge: 60 * 60 * 24 * 30 })
    setCookie('tk_at', accessToken, { maxAge: Math.max(1, Math.min(expiresIn, 60 * 60 * 24)) })
    if (refreshToken) setCookie('tk_rt', refreshToken, { maxAge: 60 * 60 * 24 * 30 })
    setCookie('tk_meta', JSON.stringify({ expiresAt }), { maxAge: 60 * 60 * 24 * 30 })

    return NextResponse.json({ ok: true, connected: true })
  } catch (err) {
    log.error({ where: 'tiktok/refresh', err })
    return NextResponse.json({ ok: true, connected: false, reason: 'INTERNAL' })
  }
}