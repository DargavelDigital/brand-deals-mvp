import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'
import { ensureWorkspaceForUser } from '@/lib/workspace/ensureWorkspace'

// Validate incoming body so we fail with 400, not 500
const ZContactCreate = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().nullable(),
  company: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(), // optional – will verify exists
  source: z.string().optional().nullable(),
})

function parseIntSafe(v: string | null, d: number) {
  const n = Number(v ?? '')
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : d
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions).catch(() => null)
    const wsid = (session as any)?.user?.workspaceId ?? null
    if (!wsid) {
      return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 20)

    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where: { workspaceId: wsid },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contact.count({ where: { workspaceId: wsid } }),
    ])

    return NextResponse.json({ ok: true, items, total })
  } catch (err) {
    console.error('GET /api/contacts error', err)
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions).catch(() => null)
    const userId = (session as any)?.user?.id ?? null
    const wsidSession = (session as any)?.user?.workspaceId ?? null
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
    }

    // Ensure we have a real workspace and link user if needed
    const ws = await ensureWorkspaceForUser(userId, wsidSession)
    const workspaceId = ws.id

    const body = await req.json().catch(() => null)
    const parsed = ZContactCreate.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_FAILED', issues: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const data = parsed.data

    // If brandId is provided, verify it belongs to this workspace; otherwise ignore it
    let brandId: string | null = null
    if (data.brandId) {
      const brand = await prisma.brand.findFirst({
        where: { id: data.brandId, workspaceId: workspaceId },
        select: { id: true },
      })
      brandId = brand?.id ?? null // drop invalid brandId to avoid FK error
    }

    // Create contact with proper FK handling
    const created = await prisma.contact.create({
      data: {
        id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        workspaceId,
        name: data.name,
        email: data.email ?? '',
        company: data.company ?? null,
        title: data.title ?? null,
        brandId,
        source: data.source ?? 'MANUAL',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ ok: true, contact: created }, { status: 201 })
  } catch (err: any) {
    // Prisma FK/unique diagnostics
    if (err?.code === 'P2003') {
      return NextResponse.json(
        { ok: false, error: 'FK_CONSTRAINT', detail: err.meta },
        { status: 409 },
      )
    }
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { ok: false, error: 'DUPLICATE', detail: err.meta?.target ?? 'unique' },
        { status: 409 },
      )
    }
    console.error('POST /api/contacts failed:', err)
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: String(err?.message ?? err) },
      { status: 500 },
    )
  }
}