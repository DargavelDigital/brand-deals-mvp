import { NextResponse, type NextRequest } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { workspaceId, session, demo } = await requireSessionOrDemo(req);
    log.info('[contacts][GET]', { id: params.id, workspaceId, demo: !!demo, user: session?.user?.email });
    
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
    }
    
    const contact = await prisma.contact.findFirst({ 
      where: { 
        id: params.id, 
        workspaceId
      }
    })
    
    if (!contact) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json(contact)
  } catch (e: any) {
    log.error('[contacts][GET] auth error', e?.message)
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
  }
}

export const PUT = withIdempotency(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { workspaceId, session, demo } = await requireSessionOrDemo(req);
    log.info('[contacts][PUT]', { id: params.id, workspaceId, demo: !!demo, user: session?.user?.email });
    
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
    }
    
    const body = await req.json()
    
    const updated = await prisma.contact.update({
      where: { id: params.id, workspaceId },
      data: {
        name: body.name, 
        email: body.email, 
        title: body.title,
        company: body.company, 
        phone: body.phone,
        status: body.status, 
        verifiedStatus: body.verifiedStatus,
        tags: body.tags ?? [],
        notes: body.notes, 
        source: body.source,
        nextStep: body.nextStep,
        remindAt: body.remindAt ? new Date(body.remindAt) : undefined,
        lastContacted: body.lastContacted ? new Date(body.lastContacted) : undefined,
        updatedAt: new Date(),
      },
    })
    
    return NextResponse.json(updated)
  } catch (e: any) {
    log.error('[contacts][PUT] auth error', e?.message)
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
  }
}

export const PATCH = withIdempotency(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { workspaceId, session, demo } = await requireSessionOrDemo(req);
    log.info('[contacts][PATCH]', { id: params.id, workspaceId, demo: !!demo, user: session?.user?.email });
    
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
    }
    
    const body = await req.json()
    
    // Only allow updating specific CRM fields
    const allowedUpdates: any = {}
    
    if (body.notes !== undefined) allowedUpdates.notes = body.notes
    if (body.nextStep !== undefined) allowedUpdates.nextStep = body.nextStep
    if (body.remindAt !== undefined) {
      allowedUpdates.remindAt = body.remindAt ? new Date(body.remindAt) : null
    }
    
    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }
    
    allowedUpdates.updatedAt = new Date()
    
    const updated = await prisma.contact.update({
      where: { id: params.id, workspaceId },
      data: allowedUpdates,
    })
    
    return NextResponse.json(updated)
  } catch (e: any) {
    log.error('[contacts][PATCH] auth error', e?.message)
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
  }
}

export const DELETE = withIdempotency(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { workspaceId, session, demo } = await requireSessionOrDemo(req);
    log.info('[contacts][DELETE]', { id: params.id, workspaceId, demo: !!demo, user: session?.user?.email });
    
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
    }
    
    await prisma.contact.delete({ 
      where: { id: params.id, workspaceId } 
    })
    
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    log.error('[contacts][DELETE] auth error', e?.message)
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
  }
});););
