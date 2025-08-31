'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ContactDTO, ContactStatus } from '@/types/contact'
import { flags } from '@/config/flags'
import { trackContactTimelineOpen } from '@/lib/telemetry'
import ContactTimeline from './ContactTimeline'
import CreateDealModal from './CreateDealModal'

interface ContactCardProps {
  contact: ContactDTO
  onUpdate: (contactId: string, updates: Partial<ContactDTO>) => Promise<void>
  onDelete: (contactId: string) => Promise<void>
  onEdit: (contact: ContactDTO) => void
  onSelect?: (contactId: string, checked: boolean) => void
  isSelected?: boolean
  showCheckbox?: boolean
}

const NEXT_STEP_OPTIONS = [
  'Follow up call',
  'Send proposal',
  'Schedule meeting',
  'Send contract',
  'Check in',
  'Send follow-up email',
  'Wait for response',
  'Archive'
]

export function ContactCard({ contact, onUpdate, onDelete, onEdit, onSelect, isSelected, showCheckbox }: ContactCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [notes, setNotes] = useState(contact.notes || '')
  const [nextStep, setNextStep] = useState(contact.nextStep || '')
  const [remindAt, setRemindAt] = useState(contact.remindAt ? new Date(contact.remindAt).toISOString().split('T')[0] : '')
  const [showTimeline, setShowTimeline] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [showCreateDealModal, setShowCreateDealModal] = useState(false)

  const getStatusBadgeClass = (status: ContactStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success/10 text-success'
      case 'INACTIVE':
        return 'bg-warn/10 text-warn'
      case 'ARCHIVED':
        return 'bg-muted/10 text-muted'
      default:
        return 'bg-muted/10 text-muted'
    }
  }

  const getVerificationBadgeClass = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'bg-success/10 text-success'
      case 'RISKY':
        return 'bg-warn/10 text-warn'
      case 'INVALID':
        return 'bg-error/10 text-error'
      default:
        return 'bg-muted/10 text-muted'
    }
  }

  const handleSave = async () => {
    setIsUpdating(true)
    try {
      const updates: Partial<ContactDTO> = {}
      
      if (notes !== contact.notes) {
        updates.notes = notes
      }
      
      if (nextStep !== contact.nextStep) {
        updates.nextStep = nextStep
      }
      
      if (remindAt !== (contact.remindAt ? new Date(contact.remindAt).toISOString().split('T')[0] : '')) {
        updates.remindAt = remindAt ? new Date(remindAt) : null
      }
      
      if (Object.keys(updates).length > 0) {
        await onUpdate(contact.id, updates)
      }
    } catch (error) {
      console.error('Failed to update contact:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const hasChanges = 
    notes !== (contact.notes || '') ||
    nextStep !== (contact.nextStep || '') ||
    remindAt !== (contact.remindAt ? new Date(contact.remindAt).toISOString().split('T')[0] : '')

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    
    setIsAddingNote(true)
    try {
      const response = await fetch(`/api/contacts/${contact.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim() })
      })
      
      if (response.ok) {
        setNewNote('')
        // Refresh the contact data
        await onUpdate(contact.id, { notes: newNote.trim() })
      }
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setIsAddingNote(false)
    }
  }

  return (
    <Card className="border border-[var(--border)] rounded-lg shadow-sm">
      <div className="p-4">
        {/* Contact Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {showCheckbox && onSelect && (
              <input
                type="checkbox"
                checked={isSelected || false}
                onChange={(e) => onSelect(contact.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
            <div className="w-10 h-10 rounded-full bg-[color:var(--accent)]/10 flex items-center justify-center">
              <span className="text-sm font-medium text-[color:var(--accent)]">
                {contact.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium text-lg">{contact.name}</div>
              <div className="text-sm text-[var(--muted)]">{contact.email}</div>
              {contact.title && (
                <div className="text-sm text-[var(--muted)]">{contact.title}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--muted)]">{contact.company || '—'}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(contact.status)}`}>
              {contact.status}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${getVerificationBadgeClass(contact.verifiedStatus)}`}>
              {contact.verifiedStatus}
            </span>
          </div>
        </div>

        {/* CRM Section */}
        <div className="space-y-4">
          {/* Next Step */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted-fg)] mb-2">
              Next Step
            </label>
            <Select 
              value={nextStep} 
              onChange={(e) => setNextStep(e.target.value)}
              className="w-full"
            >
              <option value="">Select next step...</option>
              {NEXT_STEP_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </div>

          {/* Reminder Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted-fg)] mb-2">
              Reminder Date
            </label>
            <Input
              type="date"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted-fg)] mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this contact..."
              className="w-full p-3 border border-[var(--border)] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {hasChanges && (
              <Button 
                onClick={handleSave}
                disabled={isUpdating}
                className="bg-[var(--brand-600)] hover:bg-[var(--brand-600)]/90"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
            
            {flags['crm.light.enabled'] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTimeline(true)
                  trackContactTimelineOpen(contact.id)
                }}
              >
                View Timeline
              </Button>
            )}
            
            {flags['crm.light.enabled'] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateDealModal(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Create Deal
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(contact)}
            >
              Edit Contact
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(contact.id)}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Drawer */}
      {showTimeline && flags['crm.light.enabled'] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Contact Timeline</h2>
                <p className="text-sm text-[var(--muted-fg)] mt-1">
                  {contact.name} • {contact.email}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowTimeline(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="flex h-[calc(90vh-120px)]">
              {/* Timeline */}
              <div className="flex-1 p-6 overflow-y-auto border-r">
                <ContactTimeline contactId={contact.id} />
              </div>
              
              {/* Add Note Panel */}
              <div className="w-80 p-6 bg-gray-50">
                <h3 className="text-lg font-medium mb-4">Add Note</h3>
                <div className="space-y-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this contact..."
                    className="w-full p-3 border border-[var(--border)] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    rows={4}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                    className="w-full"
                  >
                    {isAddingNote ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      {showCreateDealModal && flags['crm.light.enabled'] && (
        <CreateDealModal
          contact={contact}
          onClose={() => setShowCreateDealModal(false)}
        />
      )}
    </Card>
  )
}
