import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'

async function ensureWorkspace(userId: string, hinted?: string | null) {
  if (hinted) {
    const w = await prisma.workspace.findUnique({ where: { id: hinted } })
    if (w) return w
  }
  
  // Check if user already has a workspace via Membership
  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: { workspace: true },
  })
  if (membership?.workspace) {
    return membership.workspace
  }
  
  // Create new workspace and membership
  const ws = await prisma.workspace.create({ 
    data: { 
      name: 'My Workspace',
      slug: `workspace-${Date.now()}`,
    } 
  })
  await prisma.membership.create({
    data: {
      userId,
      workspaceId: ws.id,
      role: 'OWNER',
    },
  })
  return ws
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions).catch(() => null)
    const wsid = (session as any)?.user?.workspaceId ?? null
    if (!wsid) return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 401 })

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
    console.error('GET /api/contacts error:', err)
    // expose minimal diagnostic
    // @ts-ignore
    const code = err?.code ?? 'ERR'
    // @ts-ignore
    const meta = err?.meta ?? null
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR', code, meta }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions).catch(() => null)
    const userId = (session as any)?.user?.id ?? null
    const hintedWsid = (session as any)?.user?.workspaceId ?? null
    if (!userId) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
    const ws = await ensureWorkspace(userId, hintedWsid)
    const workspaceId = ws.id

    const body = await req.json().catch(() => null)
    if (!body || !body.name) {
      return NextResponse.json({ ok: false, error: 'VALIDATION_FAILED' }, { status: 400 })
    }

    const {
      name,
      email = null,
      company = null,
      title = null,
      brandId: brandIdInput = null,
      source = 'MANUAL',
    } = body as {
      name: string
      email?: string | null
      company?: string | null
      title?: string | null
      brandId?: string | null
      source?: string | null
    }

    // verify brandId is valid for this workspace; otherwise drop it to avoid FK(P2003)
    let brandId: string | null = null
    if (brandIdInput) {
      const b = await prisma.brand.findFirst({
        where: { id: brandIdInput, workspaceId },
        select: { id: true },
      })
      brandId = b?.id ?? null
    }

    const data = { 
      id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      workspaceId, 
      name, 
      email: email ?? '', 
      company, 
      title, 
      brandId, 
      source,
      updatedAt: new Date(),
    }

    // Prefer create; on unique collision (P2002) do update instead
    try {
      const created = await prisma.contact.create({ data })
      return NextResponse.json({ ok: true, contact: created }, { status: 201 })
    } catch (e: any) {
      if (e?.code === 'P2002') {
        // Unique target can be ["email"] OR ["workspaceId","email"] depending on schema.
        let existing = null
        if (email) {
          // try (workspaceId,email) first
          existing = await prisma.contact.findFirst({
            where: { workspaceId, email },
            select: { id: true },
          })
          // if not found and schema is globally unique on email, try by email only
          if (!existing) {
            existing = await prisma.contact.findFirst({
              where: { email },
              select: { id: true, workspaceId: true },
            })
          }
        }
        if (existing) {
          const updated = await prisma.contact.update({
            where: { id: existing.id },
            data: { name, company, title, brandId, source },
          })
          return NextResponse.json({ ok: true, contact: updated }, { status: 200 })
        }
        // If we can't resolve, surface conflict
        return NextResponse.json(
          { ok: false, error: 'CONFLICT', code: 'P2002', meta: e?.meta ?? null },
          { status: 409 }
        )
      }
      if (e?.code === 'P2003') {
        // FK violation — we already guarded brandId, but just in case
        return NextResponse.json(
          { ok: false, error: 'FK_CONSTRAINT', code: 'P2003', meta: e?.meta ?? null },
          { status: 409 }
        )
      }
      throw e
    }
  } catch (err: any) {
    console.error('POST /api/contacts failed:', err)
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', code: err?.code ?? 'ERR', meta: err?.meta ?? null },
      { status: 500 }
    )
  }
}