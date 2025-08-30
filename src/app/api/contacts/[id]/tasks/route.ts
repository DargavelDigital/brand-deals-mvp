import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureWorkspace } from '@/lib/workspace'
import { isOn } from '@/config/flags'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const ws = await ensureWorkspace(req)
  const tasks = await prisma.contactTask.findMany({
    where: { workspaceId: ws.id, contactId: params.id },
    orderBy: [{ status: 'asc' }, { dueAt: 'asc' }]
  })
  return NextResponse.json({ items: tasks })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isOn('crm.light.enabled')) return NextResponse.json({ error: 'OFF' }, { status: 404 })
  const ws = await ensureWorkspace(req)
  const body = await req.json()
  const item = await prisma.contactTask.create({
    data: {
      workspaceId: ws.id,
      contactId: params.id,
      title: String(body.title ?? 'Follow up'),
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      notes: body.notes ?? null
    }
  })
  return NextResponse.json({ item })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const ws = await ensureWorkspace(req)
  const body = await req.json()
  const item = await prisma.contactTask.update({
    where: { id: String(body.id) },
    data: {
      title: body.title,
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      status: body.status,
      notes: body.notes
    }
  })
  return NextResponse.json({ item })
}
