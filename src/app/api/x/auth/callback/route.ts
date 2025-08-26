import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { exchangeCodeForTokenPKCE, getMe } from '@/services/x/api'
import { saveXConnection } from '@/services/x/store'

export async function GET(req: Request){
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  const stateCookie = cookieStore.get('x_oauth_state')?.value
  const verifier = cookieStore.get('x_pkce_verifier')?.value
  if (!code || !state || !stateCookie || state !== stateCookie || !verifier){
    return NextResponse.redirect('/tools/connect?error=x_oauth_state')
  }
  const appUrl = process.env.APP_URL!
  const redirectUri = `${appUrl}/api/x/auth/callback`

  try {
    const tok = await exchangeCodeForTokenPKCE(code, redirectUri, verifier)
    const me = await getMe(tok.access_token).catch(()=> ({} as any))
    const userId = me?.data?.id
    const username = me?.data?.username || me?.data?.name

    const wsid = await currentWorkspaceId() || 'anonymous'
    const expiresAt = tok.expires_in ? new Date(Date.now()+tok.expires_in*1000).toISOString() : undefined

    await saveXConnection({
      workspaceId: wsid,
      accessToken: tok.access_token,
      refreshToken: tok.refresh_token,
      userId, username, expiresAt
    })

    return NextResponse.redirect('/tools/connect?connected=x')
  } catch (e:any){
    return NextResponse.redirect(`/tools/connect?error=${encodeURIComponent(e?.message || 'x_oauth_failed')}`)
  }
}
