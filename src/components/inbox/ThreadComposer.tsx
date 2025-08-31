'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Send, Smartphone, Link, Clock } from 'lucide-react'
import savedReplies from '@/data/savedReplies.json'
import { interpolate } from '@/lib/templating/interpolate'

interface ThreadComposerProps {
  threadId: string
  onSent?: () => void
  contactName?: string
  brandName?: string
}

export default function ThreadComposer({ 
  threadId, 
  onSent, 
  contactName = 'there',
  brandName = 'this opportunity'
}: ThreadComposerProps) {
  const [message, setMessage] = useState('')
  const [selectedReply, setSelectedReply] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  const handleSavedReplySelect = (replyId: string) => {
    if (replyId === '') return
    
    const reply = savedReplies.find(r => r.id === replyId)
    if (reply) {
      const interpolatedContent = interpolate(reply.content, {
        first_name: contactName,
        brand_name: brandName
      })
      setMessage(interpolatedContent)
      setSelectedReply('')
    }
  }

  const insertSmartVariable = (variable: string) => {
    const cursorPos = textareaRef.current?.selectionStart || 0
    const before = message.slice(0, cursorPos)
    const after = message.slice(cursorPos)
    const newMessage = before + `{${variable}}` + after
    
    setMessage(newMessage)
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newPos = cursorPos + variable.length + 2
        textareaRef.current.setSelectionRange(newPos, newPos)
      }
    }, 0)
  }

  const handleSend = async () => {
    if (!message.trim()) return
    
    setIsSending(true)
    setError('')
    
    try {
      const response = await fetch('/api/inbox/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          plaintext: message.trim()
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.ok) {
        setMessage('')
        onSent?.()
      } else {
        setError(result.error || 'Failed to send reply')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reply')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="border-[var(--border)] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-[var(--fg)]">Send Reply</h3>
        <div className="flex items-center gap-2">
          <Select
            value={selectedReply}
            onChange={(e) => handleSavedReplySelect(e.target.value)}
            className="w-40"
          >
            <option value="">Saved Replies</option>
            {savedReplies.map(reply => (
              <option key={reply.id} value={reply.id}>
                {reply.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Smart Variables */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => insertSmartVariable('first_name')}
          className="text-xs"
        >
          <Smartphone className="w-3 h-3 mr-1" />
          first_name
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => insertSmartVariable('brand_name')}
          className="text-xs"
        >
          <Link className="w-3 h-3 mr-1" />
          brand_name
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => insertSmartVariable('media_pack_url')}
          className="text-xs"
        >
          <Link className="w-3 h-3 mr-1" />
          Media Pack
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => insertSmartVariable('calendly_url')}
          className="text-xs"
        >
          <Clock className="w-3 h-3 mr-1" />
          Calendly
        </Button>
      </div>

      {/* Message Composer */}
      <div className="space-y-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your reply here... Use Cmd+Enter to send"
          className="w-full min-h-[120px] p-3 border border-[var(--border)] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          style={{ fontFamily: 'inherit' }}
        />
        
        {error && (
          <div className="text-sm text-[var(--error)]">
            {error}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--muted-fg)]">
          Cmd+Enter to send
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className="bg-[var(--brand-600)] hover:bg-[var(--brand-600)]/90"
        >
          <Send className="w-4 h-4 mr-2" />
          {isSending ? 'Sending...' : 'Send Reply'}
        </Button>
      </div>
    </Card>
  )
}
