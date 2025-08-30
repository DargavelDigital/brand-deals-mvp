import { z } from 'zod'
import { env } from '@/lib/env'

const AUTH_BASE = env.LINKEDIN_AUTH_BASE || 'https://www.linkedin.com'
const API_BASE  = env.LINKEDIN_API_BASE  || 'https://api.linkedin.com'
const CLIENT_ID = env.LINKEDIN_CLIENT_ID!
const CLIENT_SECRET = env.LINKEDIN_CLIENT_SECRET!

export function buildAuthUrl(appUrl: string, state: string){
  const redirect = `${appUrl}/api/linkedin/auth/callback`
  const url = new URL(`${AUTH_BASE}/oauth/v2/authorization`)
  url.searchParams.set('response_type','code')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('redirect_uri', redirect)
  url.searchParams.set('scope', (env.LINKEDIN_SCOPES||'r_liteprofile').replace(/\s+/g,''))
  url.searchParams.set('state', state)
  return { url: url.toString(), redirect }
}

const TokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  refresh_token_expires_in: z.number().optional()
})

export async function exchangeCodeForToken(code: string, redirectUri: string){
  const r = await fetch(`${AUTH_BASE}/oauth/v2/accessToken`, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error_description || 'linkedin_token_error')
  return TokenSchema.parse(j)
}

export async function refreshAccessToken(refreshToken: string){
  const r = await fetch(`${AUTH_BASE}/oauth/v2/accessToken`, {
    method:'POST',
    headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error_description || 'linkedin_refresh_error')
  return TokenSchema.parse(j)
}

/** API helpers */
async function liGET<T>(path: string, token: string, params?: Record<string,string>){
  const url = new URL(`${API_BASE}${path}`)
  Object.entries(params || {}).forEach(([k,v]) => url.searchParams.set(k,v))
  const r = await fetch(url.toString(), { headers: { Authorization:`Bearer ${token}` } })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.message || j?.serviceErrorCode || `linkedin_get_error ${r.status}`)
  return j as T
}

export async function me(token: string){
  return liGET<{ id: string }>(`/v2/me`, token)
}

/** Organizations this user administers (roleAssignee = me) */
export async function myAdminOrgs(token: string){
  return liGET<{ elements: any[] }>(
    `/v2/organizationalEntityAcls`,
    token,
    {
      q: 'roleAssignee',
      role: 'ADMINISTRATOR',
      state: 'APPROVED',
      projection: '(elements*(organizationalTarget~(id,localizedName,vanityName)))'
    }
  )
}

/** Follower stats */
export async function orgFollowerStats(token: string, orgUrn: string){
  return liGET<{ elements: any[] }>(
    `/v2/organizationalEntityFollowerStatistics`,
    token,
    { q:'organizationalEntity', organizationalEntity: orgUrn }
  )
}

/** Page stats (reach/engagement) */
export async function orgPageStats(token: string, orgUrn: string){
  return liGET<{ elements: any[] }>(
    `/v2/organizationPageStatistics`,
    token,
    { q:'organization', organization: orgUrn, timeGranularity:'DAY' }
  )
}

/** UGC posts authored by the org (recent) */
export async function orgUgcPosts(token: string, orgUrn: string, count = 10){
  return liGET<{ elements: any[] }>(
    `/v2/ugcPosts`,
    token,
    { q:'authors', authors:`List(${orgUrn})`, sortBy:'LAST_MODIFIED', count:String(count) }
  )
}

/** Per-post engagement stats */
export async function orgShareStats(token: string, orgUrn: string){
  return liGET<{ elements: any[] }>(
    `/v2/organizationalEntityShareStatistics`,
    token,
    { q:'organizationalEntity', organizationalEntity: orgUrn }
  )
}
