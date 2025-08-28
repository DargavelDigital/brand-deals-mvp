import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspaceId')
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })

  const since = searchParams.get('since') // optional ISO
  const where: any = { workspaceId }
  if (since) where.createdAt = { gte: new Date(since) }

  const rows = await prisma.aiUsageEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 500
  })

  const totals = rows.reduce((acc, r) => {
    acc.inputTokens += r.inputTokens
    acc.outputTokens += r.outputTokens
    acc.totalCostUsd += r.totalCostUsd
    return acc
  }, { inputTokens: 0, outputTokens: 0, totalCostUsd: 0 })

  return NextResponse.json({ totals, events: rows })
}
