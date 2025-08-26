import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { resolveOfVendor } from '@/services/onlyfans/client'

export async function GET(){
  const vendor = resolveOfVendor()
  const appUrl = process.env.APP_URL!
  
  if (!vendor || vendor === 'manual'){
    return NextResponse.redirect(`${appUrl}/tools/connect?error=onlyfans_vendor_not_configured`)
  }
  
  const state = crypto.randomBytes(16).toString('hex')
  // Store state for CSRF. We are vendor-agnostic; real redirect URL depends on vendor docs.
  const res = NextResponse.redirect(`${appUrl}/tools/connect?onlyfans=vendor_redirect_needed`)
  res.cookies.set('of_oauth_state', state, { httpOnly:true, secure:true, sameSite:'lax', path:'/', maxAge:600 })
  return res
}
