import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForTokens, getUserProfile } from '@/services/instagram/meta'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    // Get current workspace ID
    let currentWorkspaceId: string
    try {
      const { workspaceId } = await requireSessionOrDemo(req)
      currentWorkspaceId = workspaceId
    } catch (e) {
      log.warn({ e }, '[instagram/auth/callback] failed to get workspace ID')
      return NextResponse.redirect('/settings?instagram_error=1')
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
      return NextResponse.redirect('/settings?instagram_error=1')
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code)
    
    // Get user profile
    const profile = await getUserProfile(tokenResponse.access_token)

    // Calculate token expiration
    const tokenExpiresAt = tokenResponse.expires_in 
      ? new Date(Date.now() + tokenResponse.expires_in * 1000)
      : null

    // Upsert SocialAccount
    await prisma.socialAccount.upsert({
      where: {
        workspaceId_platform: {
          workspaceId: currentWorkspaceId,
          platform: 'instagram'
        }
      },
      update: {
        externalId: profile.id,
        username: profile.username,
        accessToken: tokenResponse.access_token,
        tokenExpiresAt,
        meta: {
          account_type: profile.account_type,
          media_count: profile.media_count
        }
      },
      create: {
        workspaceId: currentWorkspaceId,
        platform: 'instagram',
        externalId: profile.id,
        username: profile.username,
        accessToken: tokenResponse.access_token,
        tokenExpiresAt,
        meta: {
          account_type: profile.account_type,
          media_count: profile.media_count
        }
      }
    })

    // Clear state cookie
    cookieStore.delete('ig_oauth_state')

    log.info({ 
      currentWorkspaceId, 
      instagramId: profile.id,
      username: profile.username 
    }, '[instagram/auth/callback] Instagram connection established')

    return NextResponse.redirect('/dashboard?connected=instagram', { status: 303 })
  } catch (err) {
    log.error({ err }, '[instagram/auth/callback] unhandled error')
    return NextResponse.redirect('/settings?instagram_error=1')
  }
}