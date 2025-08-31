import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/http/envelope'
import { findDuplicateGroups } from '@/lib/contacts/dedupe'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(['OWNER', 'MANAGER', 'MEMBER'])
    if (!authResult.ok) {
      return NextResponse.json(fail(authResult.error, authResult.status), { status: authResult.status })
    }

    // Get all contacts for the current workspace
    const contacts = await prisma.contact.findMany({
      where: { 
        workspaceId: authResult.data.workspaceId,
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
        department: true,
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
    console.error('Error finding duplicate contacts:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
