import { NextResponse } from 'next/server'
import { prisma, ensurePrismaConnection } from '@/lib/prisma'
import { currentWorkspaceId } from '@/lib/workspace'

export async function GET(req: Request) {
  try {
    await ensurePrismaConnection();
    
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Math.min(Number(searchParams.get('pageSize') ?? 20), 100)
    const q = (searchParams.get('q') ?? '').trim()
    const status = (searchParams.get('status') ?? '').trim() // ACTIVE|INACTIVE|ARCHIVED|''

    const workspaceId = await currentWorkspaceId()

    const where: any = { workspaceId }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status

    const [total, items] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where, orderBy: { updatedAt: 'desc' },
        skip: (page-1)*pageSize, take: pageSize
      })
    ])

    return NextResponse.json({
      items, page, pageSize, total,
    })
  } catch (error: any) {
    console.error('Contacts API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensurePrismaConnection();
    
    const body = await req.json()
    const workspaceId = await currentWorkspaceId()
    const data = {
      workspaceId,
      name: body.name?.trim(),
      email: body.email?.trim(),
      title: body.title ?? null,
      company: body.company ?? null,
      phone: body.phone ?? null,
      status: body.status ?? 'ACTIVE',
      verifiedStatus: body.verifiedStatus ?? 'UNVERIFIED',
      tags: Array.isArray(body.tags) ? body.tags : [],
      notes: body.notes ?? null,
      source: body.source ?? null,
    }
    if (!data.name || !data.email) {
      return NextResponse.json({ error: 'name and email required' }, { status: 400 })
    }
    const created = await prisma.contact.create({ data })
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}
