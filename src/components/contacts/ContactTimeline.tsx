'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Mail, Eye, MessageSquare, FileText, RefreshCw } from 'lucide-react'

interface TimelineItem {
  id: string
  kind: 'EMAIL_SENT' | 'EMAIL_OPENED' | 'EMAIL_REPLIED' | 'EMAIL_CLICKED' | 'NOTE_ADDED' | 'STATUS_CHANGED' | 'DEAL_CREATED' | 'DEAL_UPDATED' | 'DEAL_MOVED' | 'CONTACT_MERGED' | 'CONTACT_IMPORTED'
  title: string
  timestamp: string
  meta?: string
  icon?: string
}

interface ContactTimelineProps {
  contactId: string
}

const getIcon = (kind: TimelineItem['kind'], customIcon?: string) => {
  if (customIcon) {
    return <span className="text-lg">{customIcon}</span>
  }
  
  switch (kind) {
    case 'EMAIL_SENT':
      return <Mail className="w-4 h-4 text-blue-500" />
    case 'EMAIL_OPENED':
      return <Eye className="w-4 h-4 text-green-500" />
    case 'EMAIL_REPLIED':
      return <MessageSquare className="w-4 h-4 text-purple-500" />
    case 'EMAIL_CLICKED':
      return <span className="text-lg">🖱️</span>
    case 'NOTE_ADDED':
      return <FileText className="w-4 h-4 text-orange-500" />
    case 'STATUS_CHANGED':
      return <RefreshCw className="w-4 h-4 text-gray-500" />
    case 'DEAL_CREATED':
      return <span className="text-lg">💼</span>
    case 'DEAL_UPDATED':
      return <span className="text-lg">🔄</span>
    case 'DEAL_MOVED':
      return <span className="text-lg">📊</span>
    case 'CONTACT_MERGED':
      return <span className="text-lg">🔗</span>
    case 'CONTACT_IMPORTED':
      return <span className="text-lg">📥</span>
    default:
      return <FileText className="w-4 h-4 text-gray-500" />
  }
}

export default function ContactTimeline({ contactId }: ContactTimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/contacts/${contactId}/timeline`)
        if (response.ok) {
          const result = await response.json()
          setTimelineData(result.data || [])
        } else {
          setError('Failed to load timeline')
        }
      } catch (error) {
        setError('Failed to load timeline')
      } finally {
        setLoading(false)
      }
    }

    fetchTimeline()
  }, [contactId])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-4 h-4 bg-gray-200 rounded-full mt-1"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>{error}</p>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (timelineData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No timeline data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {timelineData.map((item) => (
        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-white">
          <div className="mt-1 flex-shrink-0">
            {getIcon(item.kind, item.icon)}
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
  )
}
