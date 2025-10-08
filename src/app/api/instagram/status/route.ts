import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'

export async function GET(req: Request) {
  try {
    const { workspaceId } = await requireSessionOrDemo(req)
    
    if (!workspaceId) {
      return NextResponse.json({ connected: false })
    }
    
    const account = await prisma().socialAccount.findFirst({
      where: {
        workspaceId: workspaceId,
        platform: 'instagram'
      }
    })
    
    if (!account) {
      return NextResponse.json({ connected: false })
    }
    
    return NextResponse.json({ 
      connected: true,
      username: account.username,
      externalId: account.externalId
    })
  } catch (error) {
    console.error('[instagram/status] error:', error)
    return NextResponse.json({ connected: false, error: 'Failed to check status' })
  }
}
