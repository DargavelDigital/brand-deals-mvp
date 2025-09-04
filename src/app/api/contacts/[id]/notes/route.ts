import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/http/envelope'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireSession(req);
  if (!gate.ok) return gate.res;
  const session = gate.session!;
  
  const notes = await prisma.contactNote.findMany({
    where: { workspaceId: (session.user as any).workspaceId, contactId: params.id },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }]
  })
  return NextResponse.json({ items: notes })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gate = await requireSession(request);
    if (!gate.ok) return gate.res;
    const session = gate.session!;

    const contactId = params.id
    const { note } = await request.json()

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return NextResponse.json(fail('INVALID_NOTE'), { status: 400 })
    }

    // Check if contact exists and user has access
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    })

    if (!contact) {
      return NextResponse.json(fail('CONTACT_NOT_FOUND', 404), { status: 404 })
    }

    // Check if user has access to this contact's workspace
    if (contact.workspaceId !== (session.user as any).workspaceId) {
      return NextResponse.json(fail('UNAUTHORIZED', 403), { status: 403 })
    }

    // Try to add note to notes field first, fallback to tags
    let updatedContact
    if (contact.notes) {
      // Add to existing notes field
      updatedContact = await prisma.contact.update({
        where: { id: contactId },
        data: {
          notes: `${contact.notes}\n---\n${note.trim()}`
        }
      })
    } else {
      // Use temporary storage hack: store note in tags as base64
      const noteTag = `note:${btoa(note.trim())}`
      updatedContact = await prisma.contact.update({
        where: { id: contactId },
        data: {
          tags: {
            push: [noteTag]
          }
        }
      })
    }

    return NextResponse.json(ok(updatedContact, { message: 'Note added successfully' }))
  } catch (error) {
    console.error('Error adding note to contact:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
