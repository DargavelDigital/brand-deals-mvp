'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ContactDTO, ContactStatus, ContactVerificationStatus } from '@/types/contact'
import { safeJson } from '@/lib/http/safeJson'
import { findDuplicateEmails } from '@/lib/dedupe'

interface ContactDrawerProps {
  contact?: ContactDTO
  onClose: () => void
  onSaved: () => void
}

export function ContactDrawer({ contact, onClose, onSaved }: ContactDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingEmails, setExistingEmails] = useState<string[]>([])
  const [dupes, setDupes] = useState<string[]>([])
  const [skipDupes, setSkipDupes] = useState(true)
  const [formData, setFormData] = useState({
    name: contact?.name ?? '',
    email: contact?.email ?? '',
    title: contact?.title ?? '',
    company: contact?.company ?? '',
    phone: contact?.phone ?? '',
    status: (contact?.status as ContactStatus) ?? 'ACTIVE',
    verifiedStatus: (contact?.verifiedStatus as ContactVerificationStatus) ?? 'UNVERIFIED',
    notes: contact?.notes ?? '',
    source: contact?.source ?? '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // If there are duplicates and skip duplicates is checked, don't submit
      if (dupes.length > 0 && skipDupes) {
        setError('Contact not saved - duplicate email detected and skip duplicates is enabled')
        setIsLoading(false)
        return
      }

      const url = contact ? `/api/contacts/${contact.id}` : '/api/contacts'
      const method = contact ? 'PUT' : 'POST'
      
      const { ok, status, body } = await safeJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!ok) {
        throw new Error(body?.error || `Failed to save contact (${status})`)
      }

      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch existing emails on mount (only for new contacts)
  useEffect(() => {
    if (!contact) {
      fetchExistingEmails()
    }
  }, [contact])

  // Check for duplicates when email changes
  useEffect(() => {
    if (formData.email && existingEmails.length > 0) {
      const duplicates = findDuplicateEmails(existingEmails, [formData.email])
      setDupes(duplicates)
    } else {
      setDupes([])
    }
  }, [formData.email, existingEmails])

  const fetchExistingEmails = async () => {
    try {
      const { ok, body } = await safeJson('/api/contacts?pageSize=1000')
      if (ok && body?.items) {
        const emails = body.items.map((c: ContactDTO) => c.email).filter(Boolean)
        setExistingEmails(emails)
      }
    } catch (err) {
      console.warn('Failed to fetch existing emails:', err)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {contact ? 'Edit Contact' : 'Add Contact'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            {/* Duplicate warning banner */}
            {dupes.length > 0 && (
              <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--tint-warn)] p-3">
                <div className="text-sm font-medium">Possible duplicates</div>
                <div className="mt-1 text-sm">
                  We found {dupes.length} email{dupes.length > 1 ? "s" : ""} already in your contacts. 
                  <details className="mt-1">
                    <summary className="cursor-pointer text-sm underline">Show emails</summary>
                    <div className="mt-1 text-xs">{dupes.join(", ")}</div>
                  </details>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Job title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <Input
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Verification Status</label>
              <Select
                value={formData.verifiedStatus}
                onChange={(e) => handleChange('verifiedStatus', e.target.value)}
              >
                <option value="UNVERIFIED">Unverified</option>
                <option value="VALID">Valid</option>
                <option value="RISKY">Risky</option>
                <option value="INVALID">Invalid</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <Input
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value)}
                placeholder="Where this contact came from"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {/* Skip duplicates checkbox */}
            {dupes.length > 0 && (
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={skipDupes} 
                  onChange={(e) => setSkipDupes(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)]"
                />
                Skip duplicates
              </label>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : 'Save Contact'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
