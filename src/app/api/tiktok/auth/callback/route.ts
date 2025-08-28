import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { exchangeCodeForToken, getUserInfo } from '@/services/tiktok/api'
import { saveTikTokConnection } from '@/services/tiktok/store'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  const stateCookie = cookieStore.get('tt_oauth_state')?.value
  if (!code || !state || !stateCookie || state !== stateCookie) {
    return NextResponse.redirect('/tools/connect?error=tiktok_oauth_state')
  }
  const appUrl = process.env.APP_URL!
  const redirectUri = `${appUrl}/api/tiktok/auth/callback`

  try {
    const token = await exchangeCodeForToken(code, redirectUri)
    // Fetch minimal user info to store username/id
    let userId: string | undefined, username: string | undefined
    try {
      const info = await getUserInfo(token.access_token)
      // Map fields defensively (TikTok responses can vary)
      userId = info?.data?.user?.open_id || info?.data?.user?.id
      username = info?.data?.user?.display_name || info?.data?.user?.nickname
    } catch {}

    const wsid = await currentWorkspaceId() || 'anonymous'
    const expiresAt = token.expires_in ? new Date(Date.now() + token.expires_in*1000).toISOString() : undefined

    await saveTikTokConnection({
      workspaceId: wsid,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      userId, username, expiresAt
    })

    return NextResponse.redirect('/tools/connect?connected=tiktok')
  } catch (e:any) {
    return NextResponse.redirect(`/tools/connect?error=${encodeURIComponent(e?.message || 'tiktok_oauth_failed')}`)
  }
}
