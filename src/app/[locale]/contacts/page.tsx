'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ContactCard } from '@/components/contacts/ContactCard'
import { ContactDrawer } from './ContactDrawer'
import { ImportModal } from './ImportModal'
import { ContactDTO, ContactStatus } from '@/types/contact'
import { safeJson } from '@/lib/http/safeJson'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { UnauthorizedPrompt } from '@/components/auth/UnauthorizedPrompt'

interface ContactsResponse {
  items: ContactDTO[]
  page: number
  pageSize: number
  total: number
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalContacts, setTotalContacts] = useState(0)
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactDTO | null>(null)

  const { isUnauthorized, handleResponse, signIn, reset } = useAuthGuard()

  const pageSize = 20

  const fetchContacts = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      })
      
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim())
      }
      
      if (statusFilter) {
        params.append('status', statusFilter)
      }
      
      const response = await fetch(`/api/contacts?${params}`, { cache: 'no-store' })
      const authCheckedResponse = await handleResponse(response)
      
      if (!authCheckedResponse) {
        return // Unauthorized, handled by useAuthGuard
      }
      
      const { ok, status, body } = await safeJson(`/api/contacts?${params}`, { cache: 'no-store' })
      
      if (!ok) {
        setError(body?.error || body?.message || `HTTP ${status}`)
        setContacts([])
        setTotalContacts(0)
        return
      }
      
      // Handle successful response
      const data = body
      setContacts(data.items || [])
      setTotalContacts(data.total || 0)
      
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts')
      setContacts([])
      setTotalContacts(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isUnauthorized) {
      fetchContacts()
    }
  }, [currentPage, searchQuery, statusFilter, isUnauthorized])

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setError('Loading timeout - please refresh the page')
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchContacts()
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleUpdateContact = async (contactId: string, updates: Partial<ContactDTO>) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      const authCheckedResponse = await handleResponse(response)
      if (!authCheckedResponse) {
        return // Unauthorized, handled by useAuthGuard
      }

      const { ok, status, body } = await safeJson(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!ok) {
        throw new Error(body?.error || `Failed to update contact (${status})`)
      }

      // Update local state
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, ...updates }
          : contact
      ))
    } catch (err: any) {
      setError(err.message || 'Failed to update contact')
    }
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return
    }

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      })
      
      const authCheckedResponse = await handleResponse(response)
      if (!authCheckedResponse) {
        return // Unauthorized, handled by useAuthGuard
      }

      const { ok, status, body } = await safeJson(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      })

      if (!ok) {
        throw new Error(body?.error || `Failed to delete contact (${status})`)
      }

      fetchContacts()
    } catch (err: any) {
      setError(err.message || 'Failed to delete contact')
    }
  }

  const handleExport = () => {
    window.open('/api/contacts/export', '_blank')
  }

  // Show unauthorized prompt if user needs to sign in
  if (isUnauthorized) {
    return (
      <div className="container-page py-6 lg:py-8">
        <UnauthorizedPrompt onSignIn={signIn} />
      </div>
    )
  }

  const totalPages = Math.ceil(totalContacts / pageSize)

  return (
    <div className="container-page space-y-6">
      <PageHeader 
        title="Contacts" 
        subtitle="Manage and enrich your brand relationships."
      />
        <div className="space-y-6">
          {/* Filters and import panel */}
          <Card className="border border-[var(--border)] rounded-lg shadow-sm p-6 space-y-4">
            <form onSubmit={handleSearch} className="flex items-center gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Search contacts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select 
                value={statusFilter} 
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
              <Button type="submit">Search</Button>
            </form>
            
            <div className="flex items-center gap-3">
              <Button onClick={() => setShowImportModal(true)}>Import CSV</Button>
              <Button onClick={handleExport}>Export</Button>
              <Button onClick={() => setShowAddDrawer(true)}>Add Contact</Button>
            </div>
          </Card>

          {/* Error display */}
          {error && (
            <div className="text-[var(--error)] text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          {/* Results list */}
          {loading ? (
            <Card className="border border-[var(--border)] rounded-lg shadow-sm p-8 text-center text-muted">
              Loading contacts...
            </Card>
          ) : contacts.length === 0 ? (
            <Card className="border border-[var(--border)] rounded-lg shadow-sm p-8 text-center text-muted">
              {searchQuery || statusFilter ? 'No contacts found matching your criteria.' : 'No contacts yet. Add your first contact to get started!'}
            </Card>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onUpdate={handleUpdateContact}
                  onDelete={handleDelete}
                  onEdit={setEditingContact}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <Card className="border border-[var(--border)] rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[var(--muted)]">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalContacts)} of {totalContacts} contacts
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-[var(--muted)]">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

      {/* Modals */}
      {showAddDrawer && (
        <ContactDrawer
          onClose={() => setShowAddDrawer(false)}
          onSaved={fetchContacts}
        />
      )}

      {editingContact && (
        <ContactDrawer
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSaved={fetchContacts}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={fetchContacts}
        />
      )}
    </div>
  );
}
