import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(_: NextRequest, { params }: any) {
  const id = params.id as string
  const conversation = await prisma().conversation.findUnique({ where: { id } })
  if (!conversation) return NextResponse.json({ error:'not found' }, { status:404 })
  const messages = await prisma().message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' }
  })
  return NextResponse.json({ conversation, messages })
}