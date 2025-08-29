'use client'

import { useState, useEffect } from 'react'
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ContactDrawer } from './ContactDrawer'
import { ImportModal } from './ImportModal'
import { ContactDTO, ContactStatus } from '@/types/contact'
import { safeJson } from '@/lib/http/safeJson'

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

  const pageSize = 20

  const fetchContacts = async () => {
    console.log('🔄 fetchContacts called')
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

      console.log('📡 Fetching contacts with params:', params.toString())
      
      // Test 1: Try safeJson first
      try {
        console.log('🧪 Testing safeJson...')
        const { ok, status, body } = await safeJson(`/api/contacts?${params}`, { cache: 'no-store' })
        console.log('📥 safeJson response:', { ok, status, body })
        
        if (!ok) {
          console.warn('❌ safeJson non-OK', status, body)
          throw new Error(body?.error || `safeJson failed (${status})`)
        }
        
        const data: ContactsResponse = body
        console.log('✅ safeJson success - Setting contacts:', data.items?.length || 0, 'total:', data.total || 0)
        setContacts(data.items || [])
        setTotalContacts(data.total || 0)
        return // Exit early on success
        
      } catch (safeJsonError) {
        console.warn('⚠️ safeJson failed, trying direct fetch:', safeJsonError)
        
        // Test 2: Fallback to direct fetch
        try {
          console.log('🔄 Fallback to direct fetch...')
          const response = await fetch(`/api/contacts?${params}`, { cache: 'no-store' })
          const data = await response.json()
          console.log('📥 Direct fetch response:', data)
          
          setContacts(data.items || [])
          setTotalContacts(data.total || 0)
          console.log('✅ Direct fetch success')
          
        } catch (directFetchError) {
          console.error('💥 Both safeJson and direct fetch failed:', directFetchError)
          throw directFetchError
        }
      }
    } catch (err: any) {
      console.error('💥 Error in fetchContacts:', err)
      setError(err.message || 'Failed to load contacts')
    } finally {
      console.log('🏁 Setting loading to false')
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔄 useEffect triggered with:', { currentPage, searchQuery, statusFilter })
    fetchContacts()
  }, [currentPage, searchQuery, statusFilter])

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Loading timeout reached, forcing loading to false')
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

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return
    }

    try {
      const { ok, status, body } = await safeJson(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      })

      if (!ok) {
        console.warn('delete contact non-OK', status, body)
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

  const totalPages = Math.ceil(totalContacts / pageSize)

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

  return (
    <Section title="Contacts" description="Import, enrich, and manage contacts">
      <div className="space-y-6">
        {/* Debug test button */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <button 
            type="button"
            onClick={() => {
              console.log('🧪 Test button clicked!')
              // Test 1: Check if safeJson is imported
              console.log('✅ safeJson function exists:', typeof safeJson)
              console.log('✅ safeJson function:', safeJson)
              
              // Test 2: Try safeJson directly
              try {
                safeJson('/api/contacts')
                  .then(result => {
                    console.log('📡 safeJson result:', result)
                    alert(`safeJson result: ${JSON.stringify(result, null, 2)}`)
                  })
                  .catch(err => {
                    console.error('❌ safeJson error:', err)
                    alert(`safeJson error: ${err.message}`)
                  })
              } catch (err: any) {
                console.error('💥 safeJson call error:', err)
                alert(`safeJson call error: ${err.message}`)
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test safeJson directly
          </button>
          <div className="mt-2 text-sm">
            <div>Loading state: {loading ? 'true' : 'false'}</div>
            <div>Error state: {error || 'none'}</div>
            <div>Contacts count: {contacts.length}</div>
            <div>Total contacts: {totalContacts}</div>
            <div>safeJson type: {typeof safeJson}</div>
          </div>
        </div>
        
        {/* Filters and import panel */}
        <Card className="p-6 space-y-4">
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
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted">
              Loading contacts...
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-muted">
              {searchQuery || statusFilter ? 'No contacts found matching your criteria.' : 'No contacts yet. Add your first contact to get started!'}
            </div>
          ) : (
            <>
              <div className="divide-y divide-[var(--border)]">
                {contacts.map((contact) => (
                  <div key={contact.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[color:var(--accent)]/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-[color:var(--accent)]">
                          {contact.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-[var(--muted)]">{contact.email}</div>
                        {contact.title && (
                          <div className="text-sm text-[var(--muted)]">{contact.title}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[var(--muted)]">{contact.company || '—'}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(contact.status)}`}>
                        {contact.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getVerificationBadgeClass(contact.verifiedStatus)}`}>
                        {contact.verifiedStatus}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingContact(contact)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between">
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
              )}
            </>
          )}
        </Card>
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
    </Section>
  );
}
