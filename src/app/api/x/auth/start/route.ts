import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'node:crypto'
import { buildAuthUrlPKCE, genVerifier, genChallenge } from '@/services/x/api'

export async function GET(){
  const appUrl = process.env.APP_URL!
  const state = crypto.randomBytes(16).toString('hex')
  const verifier = genVerifier()
  const challenge = genChallenge(verifier)
  const { url } = buildAuthUrlPKCE(appUrl, state, challenge)

  const res = NextResponse.redirect(url)
  const cookieStore = await cookies()
  cookieStore.set('x_oauth_state', state, { httpOnly:true, secure:true, sameSite:'lax', path:'/', maxAge:600 })
  cookieStore.set('x_pkce_verifier', verifier, { httpOnly:true, secure:true, sameSite:'lax', path:'/', maxAge:600 })
  return res
}
