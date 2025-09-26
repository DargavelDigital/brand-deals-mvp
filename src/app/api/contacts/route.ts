import { NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

const ContactCreate = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  company: z.string().optional(),
  brandId: z.string().optional(), // must exist in same workspace if provided
  title: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }
    const u = new URL(req.url);
    if (u.searchParams.get('diag') === '1') {
      return NextResponse.json({
        ok: true,
        user: session.user?.email ?? null,
        workspaceId: (session.user as any)?.workspaceId ?? null,
      });
    }

    const page = Math.max(1, Number(u.searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, Number(u.searchParams.get('pageSize') || '20')));
    const workspaceId = (session.user as any)?.workspaceId;

    if (!workspaceId) {
      // If your app uses a demo workspace cookie, you can map it here instead of 400.
      return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 400 });
    }

    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contact.count({ where: { workspaceId } }),
    ]);

    return NextResponse.json({ ok: true, items, total, page, pageSize });
  } catch (err) {
    log.error('[contacts][GET] INTERNAL_ERROR', err);
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export const POST = withIdempotency(async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }
    const workspaceId = (session.user as any)?.workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 400 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'UNSUPPORTED_MEDIA_TYPE' }, { status: 415 });
    }

    const raw = await req.text();
    let data: unknown = null;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
    }

    const parsed = ContactCreate.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'BAD_REQUEST', details: parsed.error.flatten() }, { status: 400 });
    }

    const body = parsed.data;

    // Optional FK guard: ensure brand belongs to workspace
    if (body.brandId) {
      const brand = await prisma.brand.findFirst({ where: { id: body.brandId, workspaceId }, select: { id: true } });
      if (!brand) {
        return NextResponse.json({ ok: false, error: 'FK_BRAND_NOT_FOUND' }, { status: 400 });
      }
    }

    const contact = await prisma.contact.create({
      data: {
        id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        workspaceId,
        name: body.name,
        email: body.email || '',
        company: body.company ?? null,
        brandId: body.brandId ?? null,
        title: body.title ?? null,
        phone: body.phone ?? null,
        notes: body.notes ?? null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, contact }, { status: 201 });
  } catch (err: any) {
    // Prisma error mapping
    if (err?.code === 'P2002') {
      // Unique conflict (e.g., email+workspace)
      return NextResponse.json({ ok: false, error: 'CONFLICT' }, { status: 409 });
    }
    if (err?.code === 'P2003') {
      // FK violation
      return NextResponse.json({ ok: false, error: 'FK_CONSTRAINT' }, { status: 400 });
    }
    log.error('[contacts][POST] INTERNAL_ERROR', err);
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
});