import { z } from 'zod'
import crypto from 'node:crypto'
import { env } from '@/lib/env'

const API_BASE = env.X_API_BASE || 'https://api.twitter.com'
const AUTH_BASE = env.X_AUTH_BASE || 'https://twitter.com'
const V = env.X_API_VERSION || '2'
const CLIENT_ID = env.X_CLIENT_ID!
const CLIENT_SECRET = env.X_CLIENT_SECRET // may be unused with PKCE

export function base64url(buf: Buffer){
  return buf.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}
export function genVerifier(){ return base64url(crypto.randomBytes(32)) }
export function genChallenge(verifier: string){
  return base64url(crypto.createHash('sha256').update(verifier).digest())
}

export function buildAuthUrlPKCE(appUrl: string, state: string, challenge: string){
  const redirect = `${appUrl}/api/x/auth/callback`
  const url = new URL(`${AUTH_BASE}/i/oauth2/authorize`)
  url.searchParams.set('response_type','code')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('redirect_uri', redirect)
  url.searchParams.set('scope', (env.X_SCOPES || 'tweet.read users.read offline.access').replace(/\s+/g,' '))
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return { url: url.toString(), redirect }
}

const TokenSchema = z.object({
  token_type: z.string().optional(),
  access_token: z.string(),
  expires_in: z.number().optional(),
  scope: z.string().optional(),
  refresh_token: z.string().optional(),
})

export async function exchangeCodeForTokenPKCE(code: string, redirectUri: string, verifier: string){
  const r = await fetch(`${API_BASE}/${V}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier
    })
  })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error_description || j?.error || 'x_token_error')
  return TokenSchema.parse(j)
}

export async function refreshToken(refreshToken: string){
  const r = await fetch(`${API_BASE}/${V}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      refresh_token: refreshToken
    })
  })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error_description || j?.error || 'x_refresh_error')
  return TokenSchema.parse(j)
}

/** Me (user context) */
export async function getMe(accessToken: string){
  const r = await fetch(`${API_BASE}/${V}/users/me?user.fields=public_metrics,verified,created_at`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store'
  })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.title || 'x_me_error')
  return j
}

/** Recent tweets (public metrics only) */
export async function getRecentTweets(accessToken: string, userId: string, max=50){
  const url = new URL(`${API_BASE}/${V}/users/${userId}/tweets`)
  url.searchParams.set('max_results', String(Math.min(max, 100)))
  url.searchParams.set('tweet.fields', 'public_metrics,created_at')
  url.searchParams.set('exclude', 'retweets,replies')
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache:'no-store' })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.title || 'x_tweets_error')
  return j
}
