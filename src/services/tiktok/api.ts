import { z } from 'zod'
import { env, flag } from '@/lib/env'
import { decrypt } from '@/lib/crypto/secretBox'

const AUTH_BASE = env.TIKTOK_AUTH_BASE || 'https://www.tiktok.com'
const API_BASE = env.TIKTOK_API_BASE || 'https://open.tiktokapis.com'
const CLIENT_KEY = env.TIKTOK_CLIENT_KEY!
const CLIENT_SECRET = env.TIKTOK_CLIENT_SECRET!

export const TokSchema = z.object({
  access_token: z.string(),
  expires_in: z.number().optional(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  refresh_token: z.string().optional(),
  refresh_expires_in: z.number().optional(),
})

// Token bundle schema for encrypted cookie storage
const TokenBundleSchema = z.object({
  at: z.string(), // access_token
  rt: z.string(), // refresh_token
  ea: z.number(), // expires_at (timestamp)
  s: z.string(),  // schema version
})

/**
 * Extract access token from encrypted cookie in request headers
 * Returns null if token is missing, expired, or invalid
 */
export function getAccessTokenFromRequest(req: Request): string | null {
  try {
    const cookieHeader = req.headers.get('cookie')
    if (!cookieHeader) return null

    // Parse cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const encryptedToken = cookies.tiktok_token
    if (!encryptedToken) return null

    // Decrypt token bundle
    const tokenData = Buffer.from(encryptedToken, 'base64')
    const iv = tokenData.subarray(0, 12)
    const tag = tokenData.subarray(12, 28)
    const enc = tokenData.subarray(28)
    
    const decrypted = decrypt(enc, iv, tag)
    const tokenBundle = TokenBundleSchema.parse(JSON.parse(decrypted.toString()))
    
    // Check if token is expired
    if (tokenBundle.ea < Date.now()) return null
    
    return tokenBundle.at
  } catch {
    return null
  }
}

/**
 * Refresh token using encrypted cookie from request
 * Returns the refreshed token data for cookie updates
 */
export async function refreshTokenFromRequest(req: Request): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> {
  try {
    const cookieHeader = req.headers.get('cookie')
    if (!cookieHeader) throw new Error('No cookies found')

    // Parse cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const encryptedToken = cookies.tiktok_token
    if (!encryptedToken) throw new Error('No TikTok token found')

    // Decrypt token bundle
    const tokenData = Buffer.from(encryptedToken, 'base64')
    const iv = tokenData.subarray(0, 12)
    const tag = tokenData.subarray(12, 28)
    const enc = tokenData.subarray(28)
    
    const decrypted = decrypt(enc, iv, tag)
    const tokenBundle = TokenBundleSchema.parse(JSON.parse(decrypted.toString()))
    
    if (!tokenBundle.rt) throw new Error('No refresh token available')

    // Refresh the token
    const refreshed = await refreshToken(tokenBundle.rt)
    
    return {
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_in: refreshed.expires_in
    }
  } catch (error) {
    throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function exchangeCodeForToken(code: string, redirectUri: string){
  const r = await fetch(`${API_BASE}/v2/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    })
  })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error_description || 'tiktok_token_error')
  return TokSchema.parse(j)
}

export async function refreshToken(refreshToken: string){
  const r = await fetch(`${API_BASE}/v2/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    })
  })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error_description || 'tiktok_refresh_error')
  return TokSchema.parse(j)
}

/** Minimal user info (scoped via user.info.basic). */
export async function getUserInfo(accessTokenOrRequest: string | Request){
  const accessToken = typeof accessTokenOrRequest === 'string' 
    ? accessTokenOrRequest 
    : getAccessTokenFromRequest(accessTokenOrRequest)
  
  if (!accessToken) throw new Error('No valid access token available')
  
  return makeTikTokRequest(async () => {
    const r = await fetch(`${API_BASE}/v2/user/info/`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const j = await r.json().catch(()=> ({}))
    if (!r.ok) throw new Error(j?.error?.message || 'tiktok_user_info_error')
    return j
  })
}

/** Recent videos (need video.list scope). */
export async function getVideoList(accessTokenOrRequest: string | Request, cursor?: string){
  const accessToken = typeof accessTokenOrRequest === 'string' 
    ? accessTokenOrRequest 
    : getAccessTokenFromRequest(accessTokenOrRequest)
  
  if (!accessToken) throw new Error('No valid access token available')
  
  return makeTikTokRequest(async () => {
    const url = new URL(`${API_BASE}/v2/video/list/`)
    if (cursor) url.searchParams.set('cursor', cursor)
    const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }})
    const j = await r.json().catch(()=> ({}))
    if (!r.ok) throw new Error(j?.error?.message || 'tiktok_video_list_error')
    return j
  })
}

/** Stats for a single video (need video.stats scope). */
export async function getVideoStats(accessTokenOrRequest: string | Request, videoId: string){
  const accessToken = typeof accessTokenOrRequest === 'string' 
    ? accessTokenOrRequest 
    : getAccessTokenFromRequest(accessTokenOrRequest)
  
  if (!accessToken) throw new Error('No valid access token available')
  
  return makeTikTokRequest(async () => {
    const r = await fetch(`${API_BASE}/v2/video/query/`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ filters: { video_ids: [videoId] } })
    })
    const j = await r.json().catch(()=> ({}))
    if (!r.ok) throw new Error(j?.error?.message || 'tiktok_video_stats_error')
    return j
  })
}

/**
 * Wrapper for TikTok API calls that handles 401/403 errors based on refresh support
 * Returns a "needs reconnect" state when refresh is not supported
 */
export async function makeTikTokRequest<T>(
  requestFn: () => Promise<T>
): Promise<{ data?: T; needsReconnect?: boolean; error?: string }> {
  try {
    const data = await requestFn()
    return { data }
  } catch (error) {
    // Check if it's an authentication error
    if (error instanceof Error && 
        (error.message.includes('401') || error.message.includes('403') || 
         error.message.includes('unauthorized') || error.message.includes('forbidden'))) {
      
      // If refresh is not supported, return needs reconnect state
      if (!flag(env.TIKTOK_REFRESH_SUPPORTED)) {
        return { needsReconnect: true, error: 'Token expired - reconnect required' }
      }
      
      // If refresh is supported, re-throw the error for normal handling
      throw error
    }
    
    // For other errors, re-throw
    throw error
  }
}

/** Begin OAuth URL (front-end will redirect). */
export function buildAuthUrl(appUrl: string, state: string){
  const redirect = `${appUrl}/api/tiktok/auth/callback`
  const url = new URL(`${AUTH_BASE}/v2/auth/authorize/`)
  url.searchParams.set('client_key', CLIENT_KEY)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', env.TIKTOK_SCOPES || 'user.info.basic')
  url.searchParams.set('redirect_uri', redirect)
  url.searchParams.set('state', state)
  return { url: url.toString(), redirect }
}
