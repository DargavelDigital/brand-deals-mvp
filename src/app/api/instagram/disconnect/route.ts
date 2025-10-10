import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { log } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const { workspaceId } = await requireSessionOrDemo(request)
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // DEBUG: Log who is calling disconnect
    console.error('🔴 [DISCONNECT] Called by:', request.headers.get('referer'))
    console.error('🔴 [DISCONNECT] User agent:', request.headers.get('user-agent'))
    console.error('🔴 [DISCONNECT] Request URL:', request.url)
    console.error('🔴 [DISCONNECT] Workspace:', workspaceId)
    
    // PROTECTION: Check if Instagram was just connected (within last 15 seconds)
    const recentConnection = await prisma().socialAccount.findFirst({
      where: { 
        workspaceId: workspaceId, 
        platform: 'instagram',
        updatedAt: {
          gte: new Date(Date.now() - 15000) // Connected in last 15 seconds
        }
      }
    })
    
    if (recentConnection) {
      console.error('⚠️ [DISCONNECT] BLOCKED - Instagram was just connected', {
        username: recentConnection.username,
        connectedAt: recentConnection.updatedAt,
        ageSeconds: Math.round((Date.now() - recentConnection.updatedAt.getTime()) / 1000)
      })
      return NextResponse.json({ 
        error: 'Connection was just established. Please wait before disconnecting.',
        blocked: true
      }, { status: 400 })
    }
    
    console.error('🔴 Disconnecting Instagram for workspace:', workspaceId)
    
    await prisma().socialAccount.deleteMany({
      where: {
        workspaceId: workspaceId,
        platform: 'instagram'
      }
    })
    
    console.error('✅ Instagram disconnected successfully')
    
    log.info({ workspaceId }, '[instagram/disconnect] Instagram account disconnected')
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('🔴 Instagram disconnect error:', error)
    log.error({ error }, '[instagram/disconnect] Failed to disconnect Instagram')
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}

// Also support POST for flexibility
export async function POST(request: Request) {
  return GET(request)
}
