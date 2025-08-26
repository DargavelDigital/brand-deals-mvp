import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { exchangeCodeForToken, myAdminOrgs } from '@/services/linkedin/api'
import { saveLinkedInConnection } from '@/services/linkedin/store'

export async function GET(req: Request){
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const stateCookie = cookies().get('li_oauth_state')?.value
  if (!code || !state || !stateCookie || state !== stateCookie){
    return NextResponse.redirect('/tools/connect?error=linkedin_oauth_state')
  }
  const appUrl = process.env.APP_URL!
  const redirectUri = `${appUrl}/api/linkedin/auth/callback`

  try {
    const tok = await exchangeCodeForToken(code, redirectUri)

    // Find first admin org
    const orgs = await myAdminOrgs(tok.access_token)
    const el = orgs?.elements?.[0]
    const org = el?.['organizationalTarget~'] || {}
    const orgUrn: string | undefined = org?.id ? `urn:li:organization:${org.id}` : undefined
    const orgId = org?.id ? String(org.id) : undefined
    const orgName = org?.localizedName || org?.vanityName || 'LinkedIn Org'

    const wsid = await currentWorkspaceId() || 'anonymous'
    const expiresAt = tok.expires_in ? new Date(Date.now()+tok.expires_in*1000).toISOString() : undefined

    await saveLinkedInConnection({
      workspaceId: wsid,
      accessToken: tok.access_token,
      refreshToken: tok.refresh_token,
      orgUrn, orgId, orgName, expiresAt
    })

    return NextResponse.redirect('/tools/connect?connected=linkedin')
  } catch (e:any){
    return NextResponse.redirect(`/tools/connect?error=${encodeURIComponent(e?.message || 'linkedin_oauth_failed')}`)
  }
}
