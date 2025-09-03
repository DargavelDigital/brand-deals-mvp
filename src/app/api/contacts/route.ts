import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'

function parseIntSafe(v: string | null, d: number) {
  const n = Number(v ?? '')
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : d
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseIntSafe(url.searchParams.get('page'), 1)
  const pageSize = parseIntSafe(url.searchParams.get('pageSize'), 20)

  const session = await getServerSession(authOptions).catch(() => null)
  const wsid =
    (session as any)?.user?.workspaceId ??
    (session as any)?.workspaceId ??
    null

  if (!prisma) {
    return NextResponse.json({ ok: false, error: 'NO_DB' }, { status: 503 })
  }
  if (!wsid) {
    return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 401 })
  }

  const where = { workspaceId: wsid }
  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contact.count({ where }),
  ])

  return NextResponse.json({ ok: true, items, total, page, pageSize })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  const session = await getServerSession(authOptions).catch(() => null)
  const wsid =
    (session as any)?.user?.workspaceId ??
    (session as any)?.workspaceId ??
    null

  if (!prisma) {
    return NextResponse.json({ ok: false, error: 'NO_DB' }, { status: 503 })
  }
  if (!wsid) {
    return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 401 })
  }

  // Map only known fields; adjust to your schema
  const created = await prisma.contact.create({
    data: {
      id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      workspaceId: wsid,
      name: body.name ?? '',
      email: body.email ?? '',
      company: body.company ?? null,
      title: body.title ?? null,
      source: body.source ?? 'MANUAL',
      updatedAt: new Date(),
      // add other fields you actually support…
    },
  })

  return NextResponse.json({ ok: true, contact: created }, { status: 201 })
}