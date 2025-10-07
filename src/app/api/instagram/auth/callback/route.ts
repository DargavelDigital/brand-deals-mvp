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
    
    console.error('🔴 Received authorization code:', code?.substring(0, 20) + '...');
    console.error('🔴 Received state:', state);
    console.error('🔴 Full callback URL:', req.url);
    
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
      console.error('🔴 CALLBACK ERROR OCCURRED - Workspace ID:', e);
      console.error('🔴 CALLBACK ERROR STACK:', e.stack);
      log.warn({ e }, '[instagram/auth/callback] failed to get workspace ID')
      return NextResponse.redirect(new URL('/settings?instagram_error=1', baseUrl))
    }

    // Verify state
    const cookieStore = await cookies()
    const stateCookie = cookieStore.get('ig_oauth_state')?.value

    if (!code || !state || !stateCookie || state !== stateCookie) {
      console.error('🔴 CALLBACK ERROR OCCURRED - State validation failed:', {
        hasCode: !!code, 
        hasState: !!state, 
        hasStateCookie: !!stateCookie,
        stateMatch: state === stateCookie,
        receivedState: state,
        cookieState: stateCookie
      });
      log.warn({ 
        hasCode: !!code, 
        hasState: !!state, 
        hasStateCookie: !!stateCookie,
        stateMatch: state === stateCookie 
      }, '[instagram/auth/callback] invalid state or missing code')
      return NextResponse.redirect(new URL('/settings?instagram_error=1', baseUrl))
    }

    // Exchange code for Instagram access token
    console.error('🔴 Attempting Instagram token exchange...');
    let instagramTokenData, profile;
    try {
      instagramTokenData = await exchangeCodeForTokens(code)
      console.error('🔴 Instagram token exchange SUCCESS:', {
        hasToken: !!instagramTokenData.access_token,
        tokenPreview: instagramTokenData.access_token?.substring(0, 20) + '...',
        instagramUserId: instagramTokenData.user_id
      });
      
      // Get Instagram profile using Instagram token
      console.error('🔴 Getting Instagram profile...');
      profile = await getUserProfile(instagramTokenData.access_token)
      console.error('🔴 Instagram profile SUCCESS:', {
        userId: profile?.user_id,
        username: profile?.username,
        accountType: profile?.account_type
      });
      
      // Instagram tokens typically expire in 1 hour, set expiration accordingly
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      console.error('🔴 Using Instagram token with 1-hour expiration:', expiresAt.toISOString());
      
    } catch (tokenError) {
      console.error('🔴 CALLBACK ERROR OCCURRED - Instagram OAuth flow failed:', tokenError);
      console.error('🔴 CALLBACK ERROR STACK:', tokenError.stack);
      throw tokenError;
    }

    // Add error logging for debugging
    console.log('Instagram OAuth callback:', {
      hasCode: !!code,
      hasState: !!state,
      userId: profile?.user_id
    })

    // Upsert SocialAccount with Instagram token and profile data
    await prisma().socialAccount.upsert({
      where: {
        workspaceId_platform: {
          workspaceId: currentWorkspaceId,
          platform: 'instagram'
        }
      },
      update: {
        externalId: instagramTokenData.user_id, // Use Instagram user ID
        username: profile.username,
        accessToken: instagramTokenData.access_token, // Store Instagram token
        tokenExpiresAt: expiresAt,
        meta: {
          instagram_user_id: instagramTokenData.user_id,
          account_type: profile.account_type,
          permissions: instagramTokenData.permissions,
          // Additional fields can be added later when we expand the profile fetch
        }
      },
      create: {
        workspaceId: currentWorkspaceId,
        platform: 'instagram',
        externalId: instagramTokenData.user_id, // Use Instagram user ID
        username: profile.username,
        accessToken: instagramTokenData.access_token, // Store Instagram token
        tokenExpiresAt: expiresAt,
        meta: {
          instagram_user_id: instagramTokenData.user_id,
          account_type: profile.account_type,
          permissions: instagramTokenData.permissions,
          // Additional fields can be added later when we expand the profile fetch
        }
      }
    })

    // Clear state cookie
    cookieStore.delete('ig_oauth_state')

    log.info({ 
      currentWorkspaceId, 
      instagramUserId: instagramTokenData.user_id,
      username: profile.username,
      accountType: profile.account_type,
      expiresAt: expiresAt.toISOString()
    }, '[instagram/auth/callback] Instagram connection established via Instagram OAuth')

    return NextResponse.redirect(new URL('/dashboard?connected=instagram', baseUrl), { status: 303 })
  } catch (err) {
    console.error('🔴 CALLBACK ERROR OCCURRED - Main catch block:', err);
    console.error('🔴 CALLBACK ERROR STACK:', err.stack);
    log.error({ err }, '[instagram/auth/callback] unhandled error')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || req.url.split('/api')[0]
    return NextResponse.redirect(new URL('/settings?instagram_error=1', baseUrl))
  }
}