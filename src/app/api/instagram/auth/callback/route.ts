import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForTokens, getUserProfile, getLongLivedToken } from '@/services/instagram/meta'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    
    // Construct base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || req.url.split('/api')[0]
    console.error('🔴 Instagram callback baseUrl:', {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      APP_URL: process.env.APP_URL,
      reqUrl: req.url,
      constructedBaseUrl: baseUrl
    })

    // Get current workspace ID
    let currentWorkspaceId: string
    try {
      const { workspaceId } = await requireSessionOrDemo(req)
      currentWorkspaceId = workspaceId
    } catch (e) {
      log.warn({ e }, '[instagram/auth/callback] failed to get workspace ID')
      return NextResponse.redirect(new URL('/settings?instagram_error=1', baseUrl))
    }

    // Verify state
    const cookieStore = await cookies()
    const stateCookie = cookieStore.get('ig_oauth_state')?.value

    if (!code || !state || !stateCookie || state !== stateCookie) {
      log.warn({ 
        hasCode: !!code, 
        hasState: !!state, 
        hasStateCookie: !!stateCookie,
        stateMatch: state === stateCookie 
      }, '[instagram/auth/callback] invalid state or missing code')
      return NextResponse.redirect(new URL('/settings?instagram_error=1', baseUrl))
    }

    // Exchange code for short-lived token
    const shortLivedTokenData = await exchangeCodeForTokens(code)
    
    // Exchange short-lived token for long-lived token
    const longLivedTokenData = await getLongLivedToken(shortLivedTokenData.access_token)
    
    // Get user profile using long-lived token
    const profile = await getUserProfile(longLivedTokenData.access_token)

    // Calculate expiration date (60 days from now)
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + longLivedTokenData.expires_in)

    // Add error logging for debugging
    console.log('Instagram OAuth callback:', {
      hasCode: !!code,
      hasState: !!state,
      userId: profile?.user_id
    })

    // Upsert SocialAccount with long-lived token
    await prisma().socialAccount.upsert({
      where: {
        workspaceId_platform: {
          workspaceId: currentWorkspaceId,
          platform: 'instagram'
        }
      },
      update: {
        externalId: profile.user_id,
        username: profile.username,
        accessToken: longLivedTokenData.access_token,
        tokenExpiresAt: expiresAt,
        meta: {
          account_type: profile.account_type,
          media_count: profile.media_count,
          followers_count: profile.followers_count,
          follows_count: profile.follows_count,
          profile_picture_url: profile.profile_picture_url
        }
      },
      create: {
        workspaceId: currentWorkspaceId,
        platform: 'instagram',
        externalId: profile.user_id,
        username: profile.username,
        accessToken: longLivedTokenData.access_token,
        tokenExpiresAt: expiresAt,
        meta: {
          account_type: profile.account_type,
          media_count: profile.media_count,
          followers_count: profile.followers_count,
          follows_count: profile.follows_count,
          profile_picture_url: profile.profile_picture_url
        }
      }
    })

    // Clear state cookie
    cookieStore.delete('ig_oauth_state')

    log.info({ 
      currentWorkspaceId, 
      instagramId: profile.user_id,
      username: profile.username,
      expiresAt: expiresAt.toISOString()
    }, '[instagram/auth/callback] Instagram connection established')

    return NextResponse.redirect(new URL('/dashboard?connected=instagram', baseUrl), { status: 303 })
  } catch (err) {
    log.error({ err }, '[instagram/auth/callback] unhandled error')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || req.url.split('/api')[0]
    return NextResponse.redirect(new URL('/settings?instagram_error=1', baseUrl))
  }
}