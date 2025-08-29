export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/authz'

export async function GET(req: NextRequest) {
  try {
    const { workspaceId } = await requireSessionOrDemo(req)
    const { searchParams } = new URL(req.url)
    
    const status = searchParams.get('status') || 'ALL'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    
    const where: any = { workspaceId }
    if (status !== 'ALL') {
      where.status = status
    }
    
    const [threads, total] = await Promise.all([
      prisma.inboxThread.findMany({
        where,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // just the latest message for preview
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.inboxThread.count({ where }),
    ])
    
    return NextResponse.json({
      ok: true,
      threads,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    })
  } catch (error: any) {
    console.error('Failed to fetch inbox threads:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}
