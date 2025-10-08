import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'

export async function GET(req: Request) {
  try {
    // Get current workspace ID
    const { workspaceId } = await requireSessionOrDemo(req)
    
    const accounts = await prisma().socialAccount.findMany({
      where: {
        workspaceId: workspaceId,
        platform: 'instagram'
      }
    })
    
    return NextResponse.json({ 
      workspaceId: workspaceId,
      accounts,
      count: accounts.length,
      env: {
        hasAppId: !!process.env.INSTAGRAM_APP_ID,
        hasSecret: !!process.env.INSTAGRAM_APP_SECRET,
        hasRedirectUri: !!process.env.INSTAGRAM_REDIRECT_URI,
        hasPublicAppUrl: !!process.env.NEXT_PUBLIC_APP_URL
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      workspaceId: null,
      accounts: [],
      count: 0
    }, { status: 500 })
  }
}

