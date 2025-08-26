import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID!
  const appUrl = process.env.APP_URL!
  const redirectUri = `${appUrl}/api/instagram/auth/callback`
  const scopes = [
    'instagram_basic',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement'
  ].join(',')

  const state = crypto.randomBytes(16).toString('hex')
  const url = new URL('https://www.facebook.com/dialog/oauth')
  url.searchParams.set('client_id', appId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('state', state)
  url.searchParams.set('scope', scopes)

  // Set state cookie for CSRF protection
  const res = NextResponse.redirect(url.toString())
  res.cookies.set('fb_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 })
  return res
}
