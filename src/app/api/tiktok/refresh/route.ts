import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { encrypt, decrypt } from '@/lib/crypto/secretBox'
import { refreshToken } from '@/services/tiktok/api'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const encryptedToken = cookieStore.get('tiktok_token')?.value
    
    if (!encryptedToken) {
      return NextResponse.json({ ok: false, error: 'not_connected' }, { status: 401 })
    }

    // Decrypt token bundle
    const tokenData = Buffer.from(encryptedToken, 'base64')
    const iv = tokenData.subarray(0, 12)
    const tag = tokenData.subarray(12, 28)
    const enc = tokenData.subarray(28)
    
    const decrypted = decrypt(enc, iv, tag)
    const tokenBundle = JSON.parse(decrypted.toString())
    
    if (!tokenBundle.rt) {
      return NextResponse.json({ ok: false, error: 'no_refresh_token' }, { status: 401 })
    }

    // Refresh token using existing service
    const refreshed = await refreshToken(tokenBundle.rt)
    
    // Update token bundle
    const newTokenBundle = {
      at: refreshed.access_token,
      rt: refreshed.refresh_token || tokenBundle.rt,
      ea: refreshed.expires_in ? Date.now() + (refreshed.expires_in * 1000) : tokenBundle.ea,
      s: 'v1'
    }
    
    // Encrypt and store new token bundle
    const encrypted = encrypt(JSON.stringify(newTokenBundle))
    const encryptedData = Buffer.concat([encrypted.iv, encrypted.tag, encrypted.enc]).toString('base64')

    const response = NextResponse.json({ ok: true })
    response.cookies.set('tiktok_token', encryptedData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('TikTok refresh error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'refresh_failed' 
    }, { status: 500 })
  }
}
