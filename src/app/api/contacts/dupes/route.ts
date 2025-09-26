import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/http/envelope'
import { findDuplicateGroups } from '@/lib/contacts/dedupe'
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    // Get all contacts for the current workspace
    const contacts = await prisma.contact.findMany({
      where: { 
        workspaceId: (session.user as any).workspaceId,
        status: { not: 'ARCHIVED' } // Exclude already archived contacts
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        title: true,
        phone: true,
        tags: true,
        status: true,
        verifiedStatus: true,
        seniority: true,

        createdAt: true,
        updatedAt: true
      }
    })

    // Find duplicate groups
    const duplicateGroups = findDuplicateGroups(contacts)

    // Format response to match the required structure
    const groups = duplicateGroups.map(group => ({
      key: group.key,
      count: group.count,
      sample: {
        id: group.contacts[0].id,
        name: group.contacts[0].name,
        email: group.contacts[0].email,
        company: group.contacts[0].company
      },
      ids: group.contacts.map(c => c.id)
    }))

    return NextResponse.json(ok({ groups }))
  } catch (error) {
    log.error('Error finding duplicate contacts:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
