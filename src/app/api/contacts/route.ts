import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'

// Validate incoming body so we fail with 400, not 500
const ZContactCreate = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  company: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
})

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
  try {
    if (!prisma) {
      return NextResponse.json({ ok: false, error: 'NO_DB' }, { status: 503 })
    }

    const session = await getServerSession(authOptions).catch(() => null)
    const wsid =
      (session as any)?.user?.workspaceId ??
      (session as any)?.workspaceId ??
      null

    if (!wsid) {
      return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 401 })
    }

    const json = await req.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 })
    }

    const parsed = ZContactCreate.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_FAILED', issues: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const data = parsed.data

    // Adjust field names to your schema
    const created = await prisma.contact.create({
      data: {
        id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        workspaceId: wsid,
        name: data.name,
        email: data.email ?? '',
        company: data.company ?? null,
        title: data.title ?? null,
        source: data.source ?? 'MANUAL',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ ok: true, contact: created }, { status: 201 })
  } catch (err: any) {
    // Prisma known errors → send meaningful JSON instead of generic 500
    if (err?.code === 'P2002') {
      // unique constraint (e.g., email per workspace)
      return NextResponse.json(
        { ok: false, error: 'DUPLICATE', detail: err.meta?.target ?? 'unique constraint' },
        { status: 409 },
      )
    }
    if (err?.code === 'P2003') {
      // foreign key constraint (likely workspaceId)
      return NextResponse.json(
        { ok: false, error: 'FK_CONSTRAINT', detail: err.meta },
        { status: 409 },
      )
    }

    // Last resort – stringify message/stack so client can show it
    console.error('POST /api/contacts failed:', err)
    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: String(err?.message ?? err),
      },
      { status: 500 },
    )
  }
}