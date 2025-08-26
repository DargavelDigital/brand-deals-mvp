import { z } from 'zod'

const AUTH_BASE = process.env.TIKTOK_AUTH_BASE || 'https://www.tiktok.com'
const API_BASE = process.env.TIKTOK_API_BASE || 'https://open.tiktokapis.com'
const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!

export const TokSchema = z.object({
  access_token: z.string(),
  expires_in: z.number().optional(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  refresh_token: z.string().optional(),
  refresh_expires_in: z.number().optional(),
})

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
export async function getUserInfo(accessToken: string){
  const r = await fetch(`${API_BASE}/v2/user/info/`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error?.message || 'tiktok_user_info_error')
  return j
}

/** Recent videos (need video.list scope). */
export async function getVideoList(accessToken: string, cursor?: string){
  const url = new URL(`${API_BASE}/v2/video/list/`)
  if (cursor) url.searchParams.set('cursor', cursor)
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }})
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error?.message || 'tiktok_video_list_error')
  return j
}

/** Stats for a single video (need video.stats scope). */
export async function getVideoStats(accessToken: string, videoId: string){
  const r = await fetch(`${API_BASE}/v2/video/query/`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ filters: { video_ids: [videoId] } })
  })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error?.message || 'tiktok_video_stats_error')
  return j
}

/** Begin OAuth URL (front-end will redirect). */
export function buildAuthUrl(appUrl: string, state: string){
  const redirect = `${appUrl}/api/tiktok/auth/callback`
  const url = new URL(`${AUTH_BASE}/v2/auth/authorize/`)
  url.searchParams.set('client_key', CLIENT_KEY)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', process.env.TIKTOK_SCOPES || 'user.info.basic')
  url.searchParams.set('redirect_uri', redirect)
  url.searchParams.set('state', state)
  return { url: url.toString(), redirect }
}
