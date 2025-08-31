'use client'

import { Card } from '@/components/ui/Card'
import { Mail, Eye, MessageSquare, FileText, RefreshCw } from 'lucide-react'

interface TimelineItem {
  id: string
  kind: 'EMAIL_SENT' | 'EMAIL_OPENED' | 'EMAIL_REPLIED' | 'NOTE_ADDED' | 'STATUS_CHANGED'
  title: string
  timestamp: string
  meta?: string
}

interface ContactTimelineProps {
  contactId: string
}

const getIcon = (kind: TimelineItem['kind']) => {
  switch (kind) {
    case 'EMAIL_SENT':
      return <Mail className="w-4 h-4 text-blue-500" />
    case 'EMAIL_OPENED':
      return <Eye className="w-4 h-4 text-green-500" />
    case 'EMAIL_REPLIED':
      return <MessageSquare className="w-4 h-4 text-purple-500" />
    case 'NOTE_ADDED':
      return <FileText className="w-4 h-4 text-orange-500" />
    case 'STATUS_CHANGED':
      return <RefreshCw className="w-4 h-4 text-gray-500" />
    default:
      return <FileText className="w-4 h-4 text-gray-500" />
  }
}

export default function ContactTimeline({ contactId }: ContactTimelineProps) {
  // For now, return mock data - this will be replaced with real API data
  const mockTimeline: TimelineItem[] = [
    {
      id: '1',
      kind: 'EMAIL_SENT',
      title: 'Outreach email sent',
      timestamp: '2 hours ago',
      meta: 'Subject: Partnership opportunity with your brand'
    },
    {
      id: '2',
      kind: 'EMAIL_OPENED',
      title: 'Email opened',
      timestamp: '1 hour ago',
      meta: 'Opened from New York, NY'
    },
    {
      id: '3',
      kind: 'NOTE_ADDED',
      title: 'Follow-up note added',
      timestamp: '30 minutes ago',
      meta: 'Contact seems interested, schedule call next week'
    },
    {
      id: '4',
      kind: 'STATUS_CHANGED',
      title: 'Status updated',
      timestamp: '15 minutes ago',
      meta: 'Changed from "New" to "Qualified"'
    }
  ]

  return (
    <Card className="p-4 border-[var(--border)]">
      <div className="space-y-3">
        {mockTimeline.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="mt-1">
              {getIcon(item.kind)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-[var(--fg)]">{item.title}</h4>
                <span className="text-xs text-[var(--muted-fg)]">{item.timestamp}</span>
              </div>
              {item.meta && (
                <p className="text-xs text-[var(--muted-fg)] mt-1">{item.meta}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
