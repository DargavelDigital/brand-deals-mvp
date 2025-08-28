import { NextResponse } from 'next/server'
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { exchangeCodeForToken, exchangeLongLivedToken, meAccounts, pageToIgUserId, igAccountInfo } from '@/services/instagram/graph'
import { saveIgConnection } from '@/services/instagram/store'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const stateCookie = cookieStore.get('fb_oauth_state')?.value
  if (!code || !state || !stateCookie || state !== stateCookie) {
    return NextResponse.redirect('/tools/connect?error=oauth_state')
  }
  const appUrl = process.env.APP_URL!
  const redirectUri = `${appUrl}/api/instagram/auth/callback`

  try {
    const short = await exchangeCodeForToken(code, redirectUri)
    const long = await exchangeLongLivedToken(short.access_token)

    // Find a Page with an IG business account
    const pages = await meAccounts(long.access_token)
    let pageId: string | null = null
    let igUserId: string | null = null
    for (const p of pages.data) {
      const ig = await pageToIgUserId(p.id, long.access_token)
      if (ig.instagram_business_account?.id) {
        pageId = p.id
        igUserId = ig.instagram_business_account.id
        break
      }
    }

    if (!pageId || !igUserId) {
      return NextResponse.redirect('/tools/connect?error=no_ig_business_account')
    }

    const info = await igAccountInfo(igUserId, long.access_token)
    const wsid = await currentWorkspaceId() || 'anonymous'

    await saveIgConnection({
      workspaceId: wsid,
      userAccessToken: long.access_token,
      pageId,
      igUserId,
      username: info.username,
      // expires_in is seconds; set a soft expiry ~55 days
      expiresAt: new Date(Date.now() + (long.expires_in ?? 60*24*60*60)*1000 - 5*24*60*60*1000).toISOString()
    })

    return NextResponse.redirect('/tools/connect?connected=instagram')
  } catch (e:any) {
    return NextResponse.redirect(`/tools/connect?error=${encodeURIComponent(e?.message || 'instagram_oauth_failed')}`)
  }
}
