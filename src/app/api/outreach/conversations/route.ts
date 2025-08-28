import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
export async function GET() {
  const items = await prisma.conversation.findMany({
    orderBy: { lastAt: 'desc' },
    take: 100,
    select: { id:true, subject:true, threadKey:true, lastAt:true }
  })
  return NextResponse.json({ items })
}
