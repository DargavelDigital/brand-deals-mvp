'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import ThreadComposer from '@/components/inbox/ThreadComposer'
import SLABadge, { getSLAStatus } from '@/components/inbox/SLABadge'
import { flags } from '@/config/flags'
import { trackInboxReplySent } from '@/lib/telemetry'

type Thread = {
  id: string
  subject: string
  status: string
  lastMessageAt: string
  lastInboundAt: string
  contactName?: string
  brandName?: string
  messages: Array<{
    id: string
    role: string
    fromEmail: string
    toEmail: string
    subject?: string
    text?: string
    html?: string
    createdAt: string
  }>
}

export default function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [status, setStatus] = useState('ALL')
  const [slaFilter, setSlaFilter] = useState<'ALL' | 'DUE_SOON' | 'OVERDUE'>('ALL')
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    fetchThreads()
  }, [status])

  async function fetchThreads() {
    try {
      const res = await fetch(`/api/inbox/threads?status=${status}`)
      const data = await res.json()
      if (data.ok) {
        // Enhance threads with SLA and contact data
        const enhancedThreads = (data.threads || []).map((thread: any) => ({
          ...thread,
          lastInboundAt: thread.lastInboundAt || thread.lastMessageAt || new Date().toISOString(),
          contactName: thread.contact?.name || 'Unknown Contact',
          brandName: thread.contact?.company || 'Unknown Brand'
        }))
        setThreads(enhancedThreads)
      }
    } catch (error) {
      // Failed to fetch threads
    } finally {
      setLoading(false)
    }
  }

  // Filter threads by SLA status
  const filteredThreads = threads.filter(thread => {
    if (slaFilter === 'ALL') return true
    
    const slaStatus = getSLAStatus(thread.lastInboundAt)
    if (slaFilter === 'DUE_SOON') return slaStatus === 'warning'
    if (slaFilter === 'OVERDUE') return slaStatus === 'critical'
    
    return true
  })

  async function fetchThread(threadId: string) {
    try {
      const res = await fetch(`/api/inbox/threads/${threadId}`)
      const data = await res.json()
      if (data.ok) {
        // Enhance thread with SLA and contact data
        const enhancedThread = {
          ...data.thread,
          lastInboundAt: data.thread.lastInboundAt || data.thread.lastMessageAt || new Date().toISOString(),
          contactName: data.thread.contact?.name || 'Unknown Contact',
          brandName: data.thread.contact?.company || 'Unknown Brand'
        }
        setSelectedThread(enhancedThread)
      }
    } catch (error) {
      // Failed to fetch thread
    }
  }

  async function sendReply() {
    if (!selectedThread || !replyText.trim()) return

    try {
      const res = await fetch(`/api/inbox/threads/${selectedThread.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      })
      
      if (res.ok) {
        setReplyText('')
        // Refresh the thread to show the new message
        await fetchThread(selectedThread.id)
        // Refresh the thread list to update status
        await fetchThreads()
      }
    } catch (error) {
      // Failed to send reply
    }
  }

  if (loading) {
    return <div className="p-6">Loading inbox...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <div className="flex items-center gap-4">
          {/* SLA Filter Tabs */}
          {flags['inbox.pro.enabled'] && (
            <div className="flex items-center gap-2">
              <Button
                variant={slaFilter === 'ALL' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSlaFilter('ALL')}
                className="whitespace-nowrap min-w-[60px]"
              >
                All
              </Button>
              <Button
                variant={slaFilter === 'DUE_SOON' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSlaFilter('DUE_SOON')}
                className="whitespace-nowrap min-w-[80px]"
              >
                Due Soon
              </Button>
              <Button
                variant={slaFilter === 'OVERDUE' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSlaFilter('OVERDUE')}
                className="whitespace-nowrap min-w-[80px]"
              >
                Overdue
              </Button>
            </div>
          )}
          
          <Select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="min-w-[120px]"
          >
            <option value="ALL">All Threads</option>
            <option value="OPEN">Open</option>
            <option value="WAITING">Waiting</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
            <option value="CLOSED">Closed</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Threads</h2>
            <div className="space-y-2">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-3 rounded cursor-pointer hover:bg-[var(--muted)]/10 ${
                    selectedThread?.id === thread.id ? 'bg-[var(--accent)]/10' : ''
                  }`}
                  onClick={() => fetchThread(thread.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{thread.subject}</div>
                      <div className="text-sm text-[var(--muted-fg)]">
                        {new Date(thread.lastMessageAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-[var(--muted-fg)] capitalize">
                        {thread.status}
                      </div>
                    </div>
                    {flags['inbox.pro.enabled'] && (
                      <div className="flex-shrink-0 ml-2">
                        <SLABadge lastInboundAt={thread.lastInboundAt} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Thread View */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedThread.subject}</h3>
                <span className="text-sm text-[var(--muted-fg)] capitalize">
                  {selectedThread.status}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-4 mb-6">
                {selectedThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded ${
                      message.role === 'inbound'
                        ? 'bg-[var(--muted)]/20'
                        : 'bg-[var(--accent)]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">
                        {message.role === 'inbound' ? message.fromEmail : 'You'}
                      </div>
                      <div className="text-xs text-[var(--muted-fg)]">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.text || message.html || '(No content)'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {flags['inbox.pro.enabled'] ? (
                <div className="border-t pt-4">
                  <ThreadComposer
                    threadId={selectedThread.id}
                    contactName={selectedThread.contactName}
                    brandName={selectedThread.brandName}
                    onSent={() => {
                      trackInboxReplySent(selectedThread.id)
                      fetchThread(selectedThread.id)
                      fetchThreads()
                    }}
                  />
                </div>
              ) : (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Reply</h4>
                  <div className="space-y-3">
                    <Input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={4}
                    />
                    <Button onClick={sendReply} disabled={!replyText.trim()}>
                      Send Reply
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center text-[var(--muted-fg)]">
                Select a thread to view messages
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
