import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'

async function ensureWorkspaceForUser(userId: string, workspaceId?: string | null) {
  if (workspaceId) {
    const w = await prisma.workspace.findUnique({ where: { id: workspaceId } })
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
    const sessionWsid = (session as any)?.user?.workspaceId ?? null
    if (!userId) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })

    const ws = await ensureWorkspaceForUser(userId, sessionWsid)
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
      brandId: maybeBrandId = null,
      source = 'MANUAL',
    } = body as {
      name: string
      email?: string | null
      company?: string | null
      title?: string | null
      brandId?: string | null
      source?: string | null
    }

    // verify brandId belongs to the same workspace; otherwise drop to avoid FK error
    let brandId: string | null = null
    if (maybeBrandId) {
      const brand = await prisma.brand.findFirst({
        where: { id: maybeBrandId, workspaceId },
        select: { id: true },
      })
      brandId = brand?.id ?? null
    }

    // If email present, try to find-and-update; otherwise create
    let saved
    if (email) {
      const existing = await prisma.contact.findFirst({
        where: { workspaceId, email },
        select: { id: true },
      })
      if (existing) {
        saved = await prisma.contact.update({
          where: { id: existing.id },
          data: { name, company, title, brandId, source },
        })
      } else {
        saved = await prisma.contact.create({
          data: { 
            id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            workspaceId, 
            name, 
            email, 
            company, 
            title, 
            brandId, 
            source,
            updatedAt: new Date(),
          },
        })
      }
    } else {
      saved = await prisma.contact.create({
        data: { 
          id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          workspaceId, 
          name, 
          email: '', 
          company, 
          title, 
          brandId, 
          source,
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ ok: true, contact: saved }, { status: 201 })
  } catch (err) {
    // Prisma codes: P2003 (FK), P2002 (unique), etc.
    // @ts-ignore
    const code = err?.code ?? 'ERR'
    // @ts-ignore
    const meta = err?.meta ?? null
    console.error('POST /api/contacts failed:', code, meta, err)
    const status = code === 'P2003' || code === 'P2002' ? 409 : 500
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR', code, meta }, { status })
  }
}