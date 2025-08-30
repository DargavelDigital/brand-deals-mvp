import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth/getAuth'
import { isOn } from '@/config/flags'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuth(true)
  if (!auth) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }
  
  const notes = await prisma.contactNote.findMany({
    where: { workspaceId: auth.workspaceId, contactId: params.id },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }]
  })
  return NextResponse.json({ items: notes })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isOn('crm.light.enabled')) return NextResponse.json({ error: 'OFF' }, { status: 404 })
  
  const auth = await getAuth(true)
  if (!auth) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }
  
  const body = await req.json()
  const created = await prisma.contactNote.create({
    data: {
      workspaceId: auth.workspaceId,
      contactId: params.id,
      authorId: auth.user.id,
      body: String(body.body ?? ''),
      pinned: !!body.pinned
    }
  })
  return NextResponse.json({ item: created })
}
