import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/http/envelope'
import { mergeContacts } from '@/lib/contacts/dedupe'

export async function POST(request: NextRequest) {
  try {
    const gate = await requireSession(request);
    if (!gate.ok) return gate.res;
    const session = gate.session!;

    const { ids, keepId } = await request.json()

    if (!Array.isArray(ids) || !keepId || !ids.includes(keepId)) {
      return NextResponse.json(fail('INVALID_REQUEST', 400), { status: 400 })
    }

    if (ids.length < 2) {
      return NextResponse.json(fail('INSUFFICIENT_CONTACTS', 400), { status: 400 })
    }

    // Get all contacts to be merged
    const contacts = await prisma.contact.findMany({
      where: { 
        id: { in: ids },
        workspaceId: (session.user as any).workspaceId
      }
    })

    if (contacts.length !== ids.length) {
      return NextResponse.json(fail('CONTACTS_NOT_FOUND', 404), { status: 404 })
    }

    // Merge contacts using our utility function
    const mergedContact = mergeContacts(contacts, keepId)
    if (!mergedContact) {
      return NextResponse.json(fail('MERGE_FAILED', 500), { status: 500 })
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update the target contact with merged data
      const updatedContact = await tx.contact.update({
        where: { id: keepId },
        data: {
          title: mergedContact.title,
          phone: mergedContact.phone,
          tags: mergedContact.tags,
          notes: mergedContact.notes,
          seniority: mergedContact.seniority,
          department: mergedContact.department,
          nextStep: mergedContact.nextStep,
          remindAt: mergedContact.remindAt,
          updatedAt: new Date()
        }
      })

      // Soft-delete other contacts by setting status to ARCHIVED and adding 'merged' tag
      const otherIds = ids.filter(id => id !== keepId)
      await tx.contact.updateMany({
        where: { id: { in: otherIds } },
        data: {
          status: 'ARCHIVED',
          tags: {
            push: 'merged'
          },
          updatedAt: new Date()
        }
      })

      return updatedContact
    })

    return NextResponse.json(ok(result))
  } catch (error) {
    console.error('Error merging contacts:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
