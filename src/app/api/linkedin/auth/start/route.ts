import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { buildAuthUrl } from '@/services/linkedin/api'

export async function GET(){
  const appUrl = process.env.APP_URL!
  const state = crypto.randomBytes(16).toString('hex')
  const { url } = buildAuthUrl(appUrl, state)
  const res = NextResponse.redirect(url)
  res.cookies.set('li_oauth_state', state, { httpOnly:true, secure:true, sameSite:'lax', path:'/', maxAge:600 })
  return res
}
