import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentWorkspaceId } from '@/lib/workspace'
import { requireSession } from '@/lib/auth/requireSession'
import { withApiLogging } from '@/lib/api-wrapper'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gate = await requireSession(req);
    if (!gate.ok) return gate.res;
    const session = gate.session!;
    
    const contact = await prisma.contact.findFirst({ 
      where: { id: params.id, workspaceId: (session.user as any).workspaceId } 
    })
    
    if (!contact) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json(contact)
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Error fetching contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gate = await requireSession(req);
    if (!gate.ok) return gate.res;
    const session = gate.session!;
    
    const body = await req.json()
    
    const updated = await prisma.contact.update({
      where: { id: params.id, workspaceId: (session.user as any).workspaceId },
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
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gate = await requireSession(req);
    if (!gate.ok) return gate.res;
    const session = gate.session!;
    
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
      where: { id: params.id, workspaceId: (session.user as any).workspaceId },
      data: allowedUpdates,
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gate = await requireSession(req);
    if (!gate.ok) return gate.res;
    const session = gate.session!;
    
    await prisma.contact.delete({ 
      where: { id: params.id, workspaceId: (session.user as any).workspaceId } 
    })
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Error deleting contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
