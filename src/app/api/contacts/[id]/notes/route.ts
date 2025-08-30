import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureWorkspace } from '@/lib/workspace'
import { isOn } from '@/config/flags'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const ws = await ensureWorkspace(req)
  const notes = await prisma.contactNote.findMany({
    where: { workspaceId: ws.id, contactId: params.id },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }]
  })
  return NextResponse.json({ items: notes })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isOn('crm.light.enabled')) return NextResponse.json({ error: 'OFF' }, { status: 404 })
  const ws = await ensureWorkspace(req)
  const body = await req.json()
  const created = await prisma.contactNote.create({
    data: {
      workspaceId: ws.id,
      contactId: params.id,
      authorId: ws.userId ?? null,
      body: String(body.body ?? ''),
      pinned: !!body.pinned
    }
  })
  return NextResponse.json({ item: created })
}
