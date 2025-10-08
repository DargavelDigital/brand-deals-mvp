import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { log } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { workspaceId } = await requireSessionOrDemo(request)
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.error('🔴 Instagram disconnect requested for workspaceId:', workspaceId)
    
    await prisma().socialAccount.deleteMany({
      where: {
        workspaceId: workspaceId,
        platform: 'instagram'
      }
    })
    
    console.error('🔴 Instagram account disconnected successfully')
    
    log.info({ workspaceId }, '[instagram/disconnect] Instagram account disconnected')
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('🔴 Instagram disconnect error:', error)
    log.error({ error }, '[instagram/disconnect] Failed to disconnect Instagram')
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
