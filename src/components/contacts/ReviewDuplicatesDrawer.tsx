'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ContactDTO } from '@/types/contact'
import { trackContactsMerge } from '@/lib/telemetry'

interface DuplicateGroup {
  key: string
  count: number
  sample: {
    id: string
    name: string
    email: string
    company: string
  }
  ids: string[]
}

interface ReviewDuplicatesDrawerProps {
  isOpen: boolean
  onClose: () => void
  group: DuplicateGroup | null
  onMergeComplete: () => void
}

export default function ReviewDuplicatesDrawer({ 
  isOpen, 
  onClose, 
  group, 
  onMergeComplete 
}: ReviewDuplicatesDrawerProps) {
  const [contacts, setContacts] = useState<ContactDTO[]>([])
  const [selectedContactId, setSelectedContactId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [merging, setMerging] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && group) {
      fetchContactDetails()
      setSelectedContactId(group.sample.id) // Default to first contact
    }
  }, [isOpen, group])

  const fetchContactDetails = async () => {
    if (!group) return
    
    setLoading(true)
    setError('')
    
    try {
      // Fetch full details for all contacts in the group
      const promises = group.ids.map(id => 
        fetch(`/api/contacts/${id}`).then(res => res.json())
      )
      
      const results = await Promise.all(promises)
      const validContacts = results
        .filter(result => result.ok)
        .map(result => result.data)
      
      setContacts(validContacts)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contact details')
    } finally {
      setLoading(false)
    }
  }

  const handleMerge = async () => {
    if (!selectedContactId || !group) return
    
    setMerging(true)
    setError('')
    
    try {
      const response = await fetch('/api/contacts/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: group.ids,
          keepId: selectedContactId
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.ok) {
        trackContactsMerge(group.count)
        onMergeComplete()
        onClose()
      } else {
        setError(result.error || 'Merge failed')
      }
    } catch (err: any) {
      setError(err.message || 'Merge failed')
    } finally {
      setMerging(false)
    }
  }

  const getFieldValue = (contact: ContactDTO, field: keyof ContactDTO) => {
    const value = contact[field]
    if (value === null || value === undefined || value === '') {
      return '—'
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '—'
    }
    return String(value)
  }

  const getFieldClass = (contact: ContactDTO, field: keyof ContactDTO) => {
    const value = contact[field]
    if (value === null || value === undefined || value === '') {
      return 'text-[var(--muted-fg)]'
    }
    return 'text-[var(--fg)]'
  }

  if (!isOpen || !group) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Review Duplicates</h2>
            <p className="text-sm text-[var(--muted-fg)] mt-1">
              Choose which contact to keep and merge the others
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-[var(--muted-fg)]">Loading contact details...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-[var(--error)]">{error}</div>
              <Button onClick={fetchContactDetails} className="mt-4">Retry</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Field comparison table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left p-3 font-medium">Field</th>
                      {contacts.map((contact, index) => (
                        <th key={contact.id} className="text-left p-3 font-medium">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="selectedContact"
                              value={contact.id}
                              checked={selectedContactId === contact.id}
                              onChange={(e) => setSelectedContactId(e.target.value)}
                              className="mr-2"
                            />
                            Contact {index + 1}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['name', 'email', 'company', 'title', 'phone', 'seniority', 'department', 'nextStep'].map(field => (
                      <tr key={field} className="border-b border-[var(--border)]">
                        <td className="p-3 font-medium text-[var(--muted-fg)] capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        {contacts.map(contact => (
                          <td key={contact.id} className={`p-3 ${getFieldClass(contact, field as keyof ContactDTO)}`}>
                            {getFieldValue(contact, field as keyof ContactDTO)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-b border-[var(--border)]">
                      <td className="p-3 font-medium text-[var(--muted-fg)]">Tags</td>
                      {contacts.map(contact => (
                        <td key={contact.id} className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags && contact.tags.length > 0 ? (
                              contact.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-[var(--muted-fg)]">—</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-[var(--muted-fg)]">Notes</td>
                      {contacts.map(contact => (
                        <td key={contact.id} className="p-3">
                          {contact.notes ? (
                            <div className="text-sm max-w-xs">
                              {contact.notes.length > 100 
                                ? `${contact.notes.substring(0, 100)}...` 
                                : contact.notes
                              }
                            </div>
                          ) : (
                            <span className="text-[var(--muted-fg)]">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div className="text-sm text-[var(--muted-fg)]">
                  Selected contact will be kept, others will be archived
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={merging}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleMerge}
                    disabled={!selectedContactId || merging}
                    className="bg-[var(--brand-600)] hover:bg-[var(--brand-600)]/90"
                  >
                    {merging ? 'Merging...' : `Merge ${contacts.length} Contacts`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
