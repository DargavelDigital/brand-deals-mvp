import { NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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
    const { workspaceId, session, demo } = await requireSessionOrDemo(req);
    console.info('[contacts][GET]', { ws: workspaceId, user: session?.user?.email ?? null, demo: !!demo });

    // For demo mode, return mock data
    if (workspaceId === 'demo-workspace') {
      return NextResponse.json({ 
        ok: true, 
        items: [{
          id: 'demo-contact-1',
          name: 'Demo Contact',
          email: 'demo@example.com',
          company: 'Demo Company',
          title: 'Demo Title',
          verifiedStatus: 'UNVERIFIED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }], 
        total: 1 
      })
    }

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL not available, returning empty list')
      return NextResponse.json({ ok: true, items: [], total: 0 })
    }

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 20)

    console.log('Querying database for workspace:', workspaceId)
    
    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contact.count({ where: { workspaceId } }),
    ])

    console.log('Database query successful, items:', items.length, 'total:', total)
    return NextResponse.json({ ok: true, items, total })
  } catch (e: any) {
    console.warn('[contacts][GET] UNAUTHENTICATED', e?.message);
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { workspaceId, session, demo } = await requireSessionOrDemo(req);
    console.info('[contacts][POST]', { ws: workspaceId, user: session?.user?.email ?? null, demo: !!demo });

    // For demo mode, return mock response
    if (workspaceId === 'demo-workspace') {
      const body = await req.json().catch(() => ({}))
      return NextResponse.json({ 
        ok: true, 
        contact: {
          id: 'demo-contact-' + Date.now(),
          name: body.name || 'Demo Contact',
          email: body.email || 'demo@example.com',
          company: body.company || 'Demo Company',
          title: body.title || 'Demo Title',
          verifiedStatus: 'UNVERIFIED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }, { status: 201 })
    }

    // For real workspace, ensure it exists
    // Note: requireSessionOrDemo already handles workspace validation
    const finalWorkspaceId = workspaceId

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
        where: { id: brandIdInput, workspaceId: finalWorkspaceId },
        select: { id: true },
      })
      brandId = b?.id ?? null
    }

    const data = { 
      id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      workspaceId: finalWorkspaceId, 
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
      console.info('[contacts] created', { id: created.id, workspaceId: created.workspaceId });
      return NextResponse.json({ ok: true, contact: created }, { status: 201 })
    } catch (e: any) {
      if (e?.code === 'P2002') {
        // Unique target can be ["email"] OR ["workspaceId","email"] depending on schema.
        let existing = null
        if (email) {
          // try (workspaceId,email) first
          existing = await prisma.contact.findFirst({
            where: { workspaceId: finalWorkspaceId, email },
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
          console.info('[contacts] updated', { id: updated.id, workspaceId: updated.workspaceId });
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
  } catch (e: any) {
    console.warn('[contacts][POST] UNAUTHENTICATED', e?.message);
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}