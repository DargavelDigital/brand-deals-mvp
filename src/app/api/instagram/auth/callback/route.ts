import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { env } from '@/lib/env'
import { exchangeCodeForToken, exchangeLongLivedToken, meAccounts, pageToIgUserId, igAccountInfo } from '@/services/instagram/graph'
import { saveIgConnection } from '@/services/instagram/store'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const err = url.searchParams.get('error')
    const errDesc = url.searchParams.get('error_description') ?? undefined

    const jar = cookies()
    const expectedState = jar.get('ig_oauth_state')?.value
    const origin = env.APP_URL ?? `${url.protocol}//${url.host}`
    const redirectUri = `${origin}/api/instagram/auth/callback`

    if (err) {
      log.warn({ err, errDesc }, '[instagram/callback] OAuth error from Instagram')
      const to = `${origin}/en/tools/connect?provider=instagram&error=${encodeURIComponent(err)}`
      return NextResponse.redirect(to)
    }

    if (!code || !state || !expectedState || state !== expectedState) {
      log.warn({ code: !!code, state: !!state, expectedState: !!expectedState }, '[instagram/callback] invalid state')
      const to = `${origin}/en/tools/connect?provider=instagram&error=invalid_state`
      return NextResponse.redirect(to)
    }

    // Get workspace ID
    let workspaceId: string
    try {
      const { workspaceId: wsid } = await requireSessionOrDemo(req)
      workspaceId = wsid
      log.info({ workspaceId }, '[instagram/callback] workspace resolved')
    } catch (e) {
      log.error({ e }, '[instagram/callback] failed to get workspace ID')
      return NextResponse.json({ ok: false, error: 'CALLBACK_ERROR' }, { status: 500 })
    }

    try {
      // Step 1: Exchange code for short-lived token
      log.info({ workspaceId }, '[instagram/callback] exchanging code for short-lived token')
      const shortTokenResponse = await exchangeCodeForToken(code, redirectUri)
      
      if (!shortTokenResponse.access_token) {
        throw new Error('No access token received from Instagram')
      }

      // Step 2: Exchange short-lived token for long-lived token (60 days)
      log.info({ workspaceId }, '[instagram/callback] exchanging for long-lived token')
      const longTokenResponse = await exchangeLongLivedToken(shortTokenResponse.access_token)
      
      if (!longTokenResponse.access_token) {
        throw new Error('No long-lived token received from Instagram')
      }

      // Step 3: Get user's pages
      log.info({ workspaceId }, '[instagram/callback] fetching user pages')
      const pagesResponse = await meAccounts(longTokenResponse.access_token)
      
      if (!pagesResponse.data || pagesResponse.data.length === 0) {
        log.warn({ workspaceId }, '[instagram/callback] no pages found')
        const to = `${origin}/en/tools/connect?provider=instagram&error=no_pages`
        return NextResponse.redirect(to)
      }

      // Step 4: Find a page with Instagram Business Account
      let selectedPage = null
      let igUserId = null
      
      for (const page of pagesResponse.data) {
        try {
          const pageInfo = await pageToIgUserId(page.id, page.access_token)
          if (pageInfo.instagram_business_account?.id) {
            selectedPage = page
            igUserId = pageInfo.instagram_business_account.id
            break
          }
        } catch (e) {
          log.debug({ pageId: page.id, error: e }, '[instagram/callback] page has no Instagram Business Account')
          continue
        }
      }

      if (!selectedPage || !igUserId) {
        log.warn({ workspaceId }, '[instagram/callback] no page with Instagram Business Account found')
        const to = `${origin}/en/tools/connect?provider=instagram&error=no_ig_business&hint=Convert to Business/Creator and link to a Page`
        return NextResponse.redirect(to)
      }

      // Step 5: Get Instagram profile information
      log.info({ workspaceId, igUserId }, '[instagram/callback] fetching Instagram profile')
      const igProfile = await igAccountInfo(igUserId, longTokenResponse.access_token)
      
      if (!igProfile.username) {
        throw new Error('Could not fetch Instagram profile information')
      }

      // Step 6: Calculate expiration date (60 days from now)
      const expiresAt = new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)).toISOString()

      // Step 7: Save connection using existing Instagram store service
      const igConnection = {
        workspaceId,
        userAccessToken: longTokenResponse.access_token,
        pageId: selectedPage.id,
        igUserId,
        username: igProfile.username,
        expiresAt
      }

      await saveIgConnection(igConnection)

      log.info({ 
        workspaceId, 
        igUserId, 
        username: igProfile.username,
        pageId: selectedPage.id 
      }, '[instagram/callback] Instagram connection established')

      // Step 8: Redirect to Connect UI
      const res = NextResponse.redirect(
        `${origin}/en/tools/connect?provider=instagram&status=connected`
      )

      // Clear state cookie
      res.cookies.set('ig_oauth_state', '', { path: '/', maxAge: 0 })

      return res

    } catch (e: any) {
      log.error({ e, workspaceId }, '[instagram/callback] Instagram OAuth flow failed')
      const to = `${origin}/en/tools/connect?provider=instagram&error=${encodeURIComponent(e?.message || 'instagram_oauth_failed')}`
      return NextResponse.redirect(to)
    }

  } catch (e) {
    log.error({ e }, '[instagram/callback] unhandled error')
    return NextResponse.json({ ok: false, error: 'CALLBACK_ERROR' }, { status: 500 })
  }
}
