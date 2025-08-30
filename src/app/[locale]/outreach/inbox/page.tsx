'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

type Thread = {
  id: string
  subject: string
  status: string
  lastMessageAt: string
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
        setThreads(data.threads)
      }
    } catch (error) {
      // Failed to fetch threads
    } finally {
      setLoading(false)
    }
  }

  async function fetchThread(threadId: string) {
    try {
      const res = await fetch(`/api/inbox/threads/${threadId}`)
      const data = await res.json()
      if (data.ok) {
        setSelectedThread(data.thread)
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
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">All Threads</option>
          <option value="OPEN">Open</option>
          <option value="WAITING">Waiting</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
          <option value="CLOSED">Closed</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Threads</h2>
            <div className="space-y-2">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-3 rounded cursor-pointer hover:bg-[var(--muted)]/10 ${
                    selectedThread?.id === thread.id ? 'bg-[var(--accent)]/10' : ''
                  }`}
                  onClick={() => fetchThread(thread.id)}
                >
                  <div className="font-medium truncate">{thread.subject}</div>
                  <div className="text-sm text-[var(--muted-fg)]">
                    {new Date(thread.lastMessageAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-[var(--muted-fg)] capitalize">
                    {thread.status}
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
