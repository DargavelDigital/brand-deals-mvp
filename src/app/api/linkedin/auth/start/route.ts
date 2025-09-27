import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { buildAuthUrl } from '@/services/linkedin/api'
import { env } from '@/lib/env'
import { socials, COMING_SOON_MSG } from '@/config/socials'

function comingSoon() {
  return NextResponse.json({ ok: false, code: 'COMING_SOON', message: COMING_SOON_MSG }, { status: 501 })
}

export async function GET(){
  if (!socials.enabled('linkedin')) return comingSoon()
  
  const appUrl = env.APP_URL!
  const state = crypto.randomBytes(16).toString('hex')
  const { url } = buildAuthUrl(appUrl, state)
  const res = NextResponse.redirect(url)
  res.cookies.set('li_oauth_state', state, { httpOnly:true, secure:true, sameSite:'lax', path:'/', maxAge:600 })
  return res
}
