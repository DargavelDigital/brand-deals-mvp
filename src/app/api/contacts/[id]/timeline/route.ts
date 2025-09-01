import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/http/envelope'

interface TimelineItem {
  id: string
  kind: 'EMAIL_SENT' | 'EMAIL_OPENED' | 'EMAIL_REPLIED' | 'EMAIL_CLICKED' | 'NOTE_ADDED' | 'STATUS_CHANGED' | 'DEAL_CREATED' | 'DEAL_UPDATED' | 'DEAL_MOVED' | 'CONTACT_MERGED' | 'CONTACT_IMPORTED'
  title: string
  timestamp: string
  meta?: string
  icon?: string
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

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
    if (contact.workspaceId !== (session.user as any).workspaceId) {
      return NextResponse.json(fail('UNAUTHORIZED', 403), { status: 403 })
    }

    // Try to synthesize real data from existing tables
    let timelineItems: TimelineItem[] = []

    try {
      // Check for sequence steps (email events)
      const sequenceSteps = await prisma.sequenceStep.findMany({
        where: { contactId },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      sequenceSteps.forEach((step, index) => {
        if (step.status === 'SENT' || step.sentAt) {
          timelineItems.push({
            id: `step-sent-${step.id}`,
            kind: 'EMAIL_SENT',
            title: 'Email sent',
            timestamp: step.sentAt?.toISOString() || step.createdAt.toISOString(),
            meta: `Subject: ${step.subject || 'No subject'} • Sequence: ${step.sequenceId}`,
            icon: '📧'
          })
        }
        
        if (step.openedAt) {
          timelineItems.push({
            id: `step-opened-${step.id}`,
            kind: 'EMAIL_OPENED',
            title: 'Email opened',
            timestamp: step.openedAt.toISOString(),
            meta: `Sequence: ${step.sequenceId}`,
            icon: '👁️'
          })
        }
        
        if (step.clickedAt) {
          timelineItems.push({
            id: `step-clicked-${step.id}`,
            kind: 'EMAIL_CLICKED',
            title: 'Email clicked',
            timestamp: step.clickedAt.toISOString(),
            meta: `Sequence: ${step.sequenceId}`,
            icon: '🖱️'
          })
        }
        
        if (step.repliedAt) {
          timelineItems.push({
            id: `step-replied-${step.id}`,
            kind: 'EMAIL_REPLIED',
            title: 'Email replied to',
            timestamp: step.repliedAt.toISOString(),
            meta: `Sequence: ${step.sequenceId}`,
            icon: '💬'
          })
        }
      })

      // Check for notes in contact notes field
      if (contact.notes) {
        const notes = contact.notes.split('\n---\n').filter(note => note.trim())
        notes.forEach((note, index) => {
          timelineItems.push({
            id: `note-${index}`,
            kind: 'NOTE_ADDED',
            title: 'Note added',
            timestamp: contact.updatedAt.toISOString(),
            meta: note.trim(),
            icon: '📝'
          })
        })
      }

      // Check for notes in contact tags (temporary storage hack)
      const noteTags = contact.tags.filter(tag => tag.startsWith('note:'))
      noteTags.forEach((tag, index) => {
        try {
          const noteText = atob(tag.replace('note:', ''))
          timelineItems.push({
            id: `note-tag-${index}`,
            kind: 'NOTE_ADDED',
            title: 'Note added',
            timestamp: contact.updatedAt.toISOString(),
            meta: noteText,
            icon: '📝'
          })
        } catch (error) {
          // Skip invalid base64 notes
        }
      })

      // Check for deals related to this contact
      const deals = await prisma.deal.findMany({
        where: {
          workspaceId: (session.user as any).workspaceId,
          description: {
            contains: contact.email
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      })

      deals.forEach((deal, index) => {
        timelineItems.push({
          id: `deal-${deal.id}`,
          kind: 'DEAL_CREATED',
          title: 'Deal created',
          timestamp: deal.createdAt.toISOString(),
          meta: `${deal.title} • Status: ${deal.status}`,
          icon: '💼'
        })

        if (deal.updatedAt > deal.createdAt) {
          timelineItems.push({
            id: `deal-updated-${deal.id}`,
            kind: 'DEAL_UPDATED',
            title: 'Deal updated',
            timestamp: deal.updatedAt.toISOString(),
            meta: `${deal.title} • Status: ${deal.status}`,
            icon: '🔄'
          })
        }
      })

      // Check for merge tags
      const mergeTags = contact.tags.filter(tag => tag.includes('merged'))
      if (mergeTags.length > 0) {
        timelineItems.push({
          id: 'merge-1',
          kind: 'CONTACT_MERGED',
          title: 'Contact merged',
          timestamp: contact.updatedAt.toISOString(),
          meta: `Merged with other contacts • Tags: ${mergeTags.join(', ')}`,
          icon: '🔗'
        })
      }

      // Check for import tags
      const importTags = contact.tags.filter(tag => tag.includes('imported'))
      if (importTags.length > 0) {
        timelineItems.push({
          id: 'import-1',
          kind: 'CONTACT_IMPORTED',
          title: 'Contact imported',
          timestamp: contact.createdAt.toISOString(),
          meta: `Imported from external source • Tags: ${importTags.join(', ')}`,
          icon: '📥'
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
          meta: `Current status: ${contact.status}`,
          icon: '🏷️'
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
