import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { resolveOfVendor } from '@/services/onlyfans/client'
import { saveOnlyFansConnection } from '@/services/onlyfans/store'

export async function GET(req: Request){
  const url = new URL(req.url)
  const state = url.searchParams.get('state')
  const code = url.searchParams.get('code') || url.searchParams.get('token')
  const cookieStore = await cookies()
  const stateCookie = cookieStore.get('of_oauth_state')?.value
  const vendor = resolveOfVendor()
  if (!state || !stateCookie || state !== stateCookie || !vendor || vendor==='manual'){
    return NextResponse.redirect('/tools/connect?error=onlyfans_oauth_state')
  }

  try {
    // Here you would exchange 'code' for tokens via the vendor's documented OAuth endpoint.
    // We store a placeholder token for now to keep the flow unblocked.
    const wsid = await currentWorkspaceId() || 'anonymous'
    await saveOnlyFansConnection({
      workspaceId: wsid,
      provider: vendor,
      accessToken: 'REPLACE_WITH_VENDOR_TOKEN',
      username: 'OnlyFans (linked)'
    })
    return NextResponse.redirect('/tools/connect?connected=onlyfans')
  } catch (e:any){
    return NextResponse.redirect(`/tools/connect?error=${encodeURIComponent(e?.message || 'onlyfans_oauth_failed')}`)
  }
}
