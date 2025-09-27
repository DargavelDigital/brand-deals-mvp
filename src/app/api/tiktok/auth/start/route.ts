// src/app/api/tiktok/auth/start/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { randomUUID } from 'crypto'
import { socials, COMING_SOON_MSG } from '@/config/socials'

function comingSoon() {
  return NextResponse.json({ ok: false, code: 'COMING_SOON', message: COMING_SOON_MSG }, { status: 501 })
}

export async function GET() {
  if (!socials.enabled('tiktok')) return comingSoon()
  
  const state = randomUUID()

  const origin = env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const redirectUri = `${origin}/api/tiktok/auth/callback`
  const scope = env.TIKTOK_SCOPES ?? 'user.info.basic,video.list,video.stats'
  const authUrl =
    `${env.TIKTOK_AUTH_BASE ?? 'https://www.tiktok.com'}/v2/auth/authorize/`
    + `?client_key=${encodeURIComponent(env.TIKTOK_CLIENT_KEY!)}`
    + `&redirect_uri=${encodeURIComponent(redirectUri)}`
    + `&response_type=code`
    + `&scope=${encodeURIComponent(scope)}`
    + `&state=${encodeURIComponent(state)}`

  const res = NextResponse.redirect(authUrl)
  // store state for CSRF protection
  res.cookies.set('tiktok_state', state, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 10 * 60,
  })
  return res
}
