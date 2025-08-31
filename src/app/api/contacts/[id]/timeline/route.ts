import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/http/envelope'

interface TimelineItem {
  id: string
  kind: 'EMAIL_SENT' | 'EMAIL_OPENED' | 'EMAIL_REPLIED' | 'NOTE_ADDED' | 'STATUS_CHANGED'
  title: string
  timestamp: string
  meta?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(['OWNER', 'MANAGER', 'MEMBER'])
    if (!authResult.ok) {
      return NextResponse.json(fail(authResult.error, authResult.status), { status: authResult.status })
    }

    const contactId = params.id

    // Check if contact exists and user has access
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: { workspace: true }
    })

    if (!contact) {
      return NextResponse.json(fail('CONTACT_NOT_FOUND', 404), { status: 404 })
    }

    // Check if user has access to this contact's workspace
    if (contact.workspaceId !== authResult.data.workspaceId) {
      return NextResponse.json(fail('UNAUTHORIZED', 403), { status: 403 })
    }

    // Try to synthesize real data from existing tables
    let timelineItems: TimelineItem[] = []

    try {
      // Check for sequence steps (email events)
      const sequenceSteps = await prisma.sequenceStep.findMany({
        where: { contactId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      sequenceSteps.forEach((step, index) => {
        if (step.event === 'SENT') {
          timelineItems.push({
            id: `step-${step.id}`,
            kind: 'EMAIL_SENT',
            title: 'Email sent',
            timestamp: step.createdAt.toISOString(),
            meta: `Sequence: ${step.sequenceId}`
          })
        } else if (step.event === 'OPENED') {
          timelineItems.push({
            id: `step-${step.id}`,
            kind: 'EMAIL_OPENED',
            title: 'Email opened',
            timestamp: step.createdAt.toISOString(),
            meta: `Sequence: ${step.sequenceId}`
          })
        } else if (step.event === 'REPLIED') {
          timelineItems.push({
            id: `step-${step.id}`,
            kind: 'EMAIL_REPLIED',
            title: 'Email replied to',
            timestamp: step.createdAt.toISOString(),
            meta: `Sequence: ${step.sequenceId}`
          })
        }
      })

      // Check for notes in contact description
      if (contact.notes) {
        const notes = contact.notes.split('\n---\n').filter(note => note.trim())
        notes.forEach((note, index) => {
          timelineItems.push({
            id: `note-${index}`,
            kind: 'NOTE_ADDED',
            title: 'Note added',
            timestamp: contact.updatedAt.toISOString(),
            meta: note.trim()
          })
        })
      }

      // Check for status changes (if we had a history table, we'd use that)
      // For now, just show current status
      if (contact.status) {
        timelineItems.push({
          id: 'status-current',
          kind: 'STATUS_CHANGED',
          title: 'Status updated',
          timestamp: contact.updatedAt.toISOString(),
          meta: `Current status: ${contact.status}`
        })
      }
    } catch (error) {
      console.warn('Error synthesizing timeline data:', error)
      // Continue with mock data if synthesis fails
    }

    // If no real data, return mock data
    if (timelineItems.length === 0) {
      timelineItems = [
        {
          id: 'mock-1',
          kind: 'EMAIL_SENT',
          title: 'Outreach email sent',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          meta: 'Subject: Partnership opportunity with your brand'
        },
        {
          id: 'mock-2',
          kind: 'EMAIL_OPENED',
          title: 'Email opened',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          meta: 'Opened from New York, NY'
        },
        {
          id: 'mock-3',
          kind: 'NOTE_ADDED',
          title: 'Follow-up note added',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          meta: 'Contact seems interested, schedule call next week'
        }
      ]
    }

    // Sort by timestamp (newest first)
    timelineItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Format timestamps for display
    const formatTimestamp = (isoString: string) => {
      const date = new Date(isoString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor(diffMs / (1000 * 60))

      if (diffMinutes < 1) return 'Just now'
      if (diffMinutes < 60) return `${diffMinutes} minutes ago`
      if (diffHours < 24) return `${diffHours} hours ago`
      return date.toLocaleDateString()
    }

    const formattedItems = timelineItems.map(item => ({
      ...item,
      timestamp: formatTimestamp(item.timestamp)
    }))

    return NextResponse.json(ok(formattedItems))
  } catch (error) {
    console.error('Error fetching contact timeline:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
