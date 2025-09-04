'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ContactCard } from '@/components/contacts/ContactCard'
import { ContactSkeleton } from '@/components/ui/Skeleton'
import { ContactDrawer } from './ContactDrawer'
import { ImportModal } from './ImportModal'
import DuplicatesModal from '@/components/contacts/DuplicatesModal'
import ReviewDuplicatesDrawer from '@/components/contacts/ReviewDuplicatesDrawer'
import { ContactDTO, ContactStatus, ContactVerificationStatus } from '@/types/contact'
import { safeJson } from '@/lib/http/safeJson'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { UnauthorizedPrompt } from '@/components/auth/UnauthorizedPrompt'
import { track } from '@/lib/telemetry'
import { flags } from '@/config/flags'
import { useLocale } from 'next-intl'
import { getBoolean } from '@/lib/clientEnv'


interface ContactsResponse {
  items: ContactDTO[]
  page: number
  pageSize: number
  total: number
}

export default function ContactsPage() {
  const locale = useLocale();
  const [contacts, setContacts] = useState<ContactDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [verifiedStatusFilter, setVerifiedStatusFilter] = useState('')
  const [seniorityFilter, setSeniorityFilter] = useState('')

  const [tagsFilter, setTagsFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalContacts, setTotalContacts] = useState(0)
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactDTO | null>(null)
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([])
  const [showDuplicatesPanel, setShowDuplicatesPanel] = useState(false)
  const [duplicatesLoading, setDuplicatesLoading] = useState(false)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false)
  const [showReviewDrawer, setShowReviewDrawer] = useState(false)
  const [selectedDuplicateGroup, setSelectedDuplicateGroup] = useState<any>(null)

  const { isUnauthorized, handleResponse, signIn, reset } = useAuthGuard()

  const pageSize = 20

  // Filter options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ARCHIVED', label: 'Archived' }
  ]

  const verifiedStatusOptions = [
    { value: '', label: 'All Verification' },
    { value: 'UNVERIFIED', label: 'Unverified' },
    { value: 'VALID', label: 'Valid' },
    { value: 'RISKY', label: 'Risky' },
    { value: 'INVALID', label: 'Invalid' }
  ]

  const seniorityOptions = [
    { value: '', label: 'All Seniority' },
    { value: 'C-Level', label: 'C-Level' },
    { value: 'VP', label: 'VP' },
    { value: 'Director', label: 'Director' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Individual Contributor', label: 'Individual Contributor' }
  ]



  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
      setCurrentPage(1)
      track('contacts_filter_change', { keys: ['search'], hasQuery: Boolean(query) })
    }, 300),
    []
  )

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

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
      
      if (verifiedStatusFilter) {
        params.append('verifiedStatus', verifiedStatusFilter)
      }
      
      if (seniorityFilter) {
        params.append('seniority', seniorityFilter)
      }
      
      if (tagsFilter.trim()) {
        params.append('tags', tagsFilter.trim())
      }
      
      // Use same-origin path (no locale prefix)
      const url = `/api/contacts${params.toString() ? `?${params.toString()}` : ''}`;
      console.info('Contacts fetch request URL:', url);
      
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',    // <-- MUST HAVE
        cache: 'no-store',
        headers: { 'x-no-cache': '1' },
      });
      
      if (!res.ok) {
        const text = await res.text().catch(()=>'');
        console.error('Contacts API error:', res.status, url, text);
        throw new Error(String(res.status));
      }
      
      const data = await res.json()
      setContacts(data.items || [])
      setTotalContacts(data.total || 0)
      
    } catch (err: any) {
      console.error('Contacts fetch error:', err)
      // Show subtle error message and fallback to empty state
      setError('Couldn\'t load contacts right now. Showing empty list.')
      setContacts([])
      setTotalContacts(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchDuplicates = async () => {
    try {
      setDuplicatesLoading(true)
      const response = await fetch('/api/contacts/duplicates')
      const authCheckedResponse = await handleResponse(response)
      if (!authCheckedResponse) {
        return // Unauthorized, handled by useAuthGuard
      }

      const { ok, status, body } = await safeJson(response)
      
      if (ok && body.duplicateGroups) {
        setDuplicateGroups(body.duplicateGroups)
      }
    } catch (err: any) {
      // Silently fail for duplicates - don't show error to user
      console.warn('Failed to fetch duplicates:', err)
    } finally {
      setDuplicatesLoading(false)
    }
  }

  const handleBulkAction = async (op: 'addTag' | 'removeTag' | 'setStatus' | 'exportCsv' | 'delete', value?: string) => {
    if (selectedContactIds.length === 0) return

    // Track bulk action
    track('contacts_bulk_action', { action: op, count: selectedContactIds.length })

    try {
      setBulkActionLoading(true)
      
      if (op === 'exportCsv') {
        // Handle CSV export with file download using the export API
        const response = await fetch('/api/contacts/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedContactIds })
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `contacts-selected-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          // Show success feedback
          alert(`Exported ${selectedContactIds.length} contacts to CSV`)
          setSelectedContactIds([])
        } else {
          alert('Export failed')
        }
      } else if (op === 'delete') {
        // Handle soft delete
        if (!confirm(`Are you sure you want to archive ${selectedContactIds.length} contact${selectedContactIds.length !== 1 ? 's' : ''}?`)) {
          return
        }
        
        const response = await fetch('/api/contacts/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedContactIds, op, value })
        })

        const result = await response.json()
        
        if (result.ok) {
          alert(result.message)
          setSelectedContactIds([])
          fetchContacts() // Refresh the list
        } else {
          alert(`Operation failed: ${result.error}`)
        }
      } else {
        // Handle other bulk operations
        const response = await fetch('/api/contacts/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedContactIds, op, value })
        })

        const result = await response.json()
        
        if (result.ok) {
          alert(result.message)
          setSelectedContactIds([])
          fetchContacts() // Refresh the list
        } else {
          alert(`Operation failed: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Operation failed')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContactIds(prev => [...prev, contactId])
    } else {
      setSelectedContactIds(prev => prev.filter(id => id !== contactId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContactIds(contacts.map(contact => contact.id))
    } else {
      setSelectedContactIds([])
    }
  }

  useEffect(() => {
    if (!isUnauthorized) {
      fetchContacts()
      if (getBoolean('NEXT_PUBLIC_FEATURE_CONTACTS_DEDUPE')) {
        fetchDuplicates()
      }
    }
  }, [currentPage, searchQuery, statusFilter, verifiedStatusFilter, seniorityFilter, tagsFilter, isUnauthorized])

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



  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
    track('contacts_filter_change', { keys: ['status'], hasQuery: Boolean(searchQuery) })
  }

  const handleVerifiedStatusChange = (value: string) => {
    setVerifiedStatusFilter(value)
    setCurrentPage(1)
    track('contacts_filter_change', { keys: ['verifiedStatus'], hasQuery: Boolean(searchQuery) })
  }

  const handleSeniorityChange = (value: string) => {
    setSeniorityFilter(value)
    setCurrentPage(1)
    track('contacts_filter_change', { keys: ['seniority'], hasQuery: Boolean(searchQuery) })
  }



  const handleTagsChange = (value: string) => {
    setTagsFilter(value)
    setCurrentPage(1)
    track('contacts_filter_change', { keys: ['tags'], hasQuery: Boolean(searchQuery) })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setVerifiedStatusFilter('')
    setSeniorityFilter('')
    setDepartmentFilter('')
    setTagsFilter('')
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

      const { ok, status, body } = await safeJson(response)

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

      const { ok, status, body } = await safeJson(response)

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
        breadcrumbs={[
          { label: "Dashboard", href: `/${locale}/dashboard` },
          { label: "Contacts" }
        ]}
      />
      
      {/* Bulk Actions Bar */}
      {selectedContactIds.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="text-sm">
            <strong>{selectedContactIds.length}</strong> selected
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--tint-accent)]"
              onClick={async () => {
                // Simple tag demo - could open a modal
                const tag = prompt('Enter tag to add:');
                if (tag && tag.trim()) {
                  try {
                    const response = await fetch('/api/contacts/bulk-tag', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ids: selectedContactIds, tag: tag.trim() })
                    });
                    const result = await response.json();
                    if (result.ok) {
                      alert(result.message);
                      setSelectedContactIds([]);
                      fetchContacts(); // Refresh the list
                    } else {
                      alert(`Tag failed: ${result.error}`);
                    }
                  } catch (error) {
                    alert('Tag operation failed');
                  }
                }
              }}
            >
              Tag
            </button>
            <button
              type="button"
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              onClick={async () => {
                if (!confirm(`Delete ${selectedContactIds.length} contacts?`)) return;
                try {
                  const response = await fetch('/api/contacts/bulk-delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedContactIds })
                  });
                  const result = await response.json();
                  if (result.ok) {
                    alert(result.message);
                    setSelectedContactIds([]);
                    fetchContacts(); // Refresh the list
                  } else {
                    alert(`Delete failed: ${result.error}`);
                  }
                } catch (error) {
                  alert('Delete operation failed');
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
      
      {/* Duplicates Alert */}
      {flags.contacts.dedupe && duplicateGroups.length > 0 && (
        <Card className="border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-800">
                  We found {duplicateGroups.length} potential duplicate groups
                </h3>
                <p className="text-sm text-amber-700">
                  Review and manage duplicate contacts to keep your database clean.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => {
                setShowDuplicatesPanel(true)
                track('contacts_duplicates_open')
              }}
              variant="secondary"
              size="sm"
            >
              Review
            </Button>
          </div>
        </Card>
      )}
      
      <div className="space-y-6">
          {/* Filters and import panel */}
          <Card className="border border-[var(--border)] rounded-lg shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search input */}
              <div className="lg:col-span-2">
                <Input 
                  placeholder="Search contacts by name, email, or company..." 
                  value={searchQuery}
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
              
              {/* Status filter */}
              <Select 
                value={statusFilter} 
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              
              {/* Verified status filter */}
              <Select 
                value={verifiedStatusFilter} 
                onChange={(e) => handleVerifiedStatusChange(e.target.value)}
              >
                {verifiedStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              
              {/* Seniority filter */}
              <Select 
                value={seniorityFilter} 
                onChange={(e) => handleSeniorityChange(e.target.value)}
              >
                {seniorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              

              
              {/* Tags filter */}
              <div>
                <Input 
                  placeholder="Tags (comma separated)"
                  value={tagsFilter}
                  onChange={(e) => handleTagsChange(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Button 
                variant="secondary" 
                onClick={clearFilters}
                className="text-sm"
              >
                Clear filters
              </Button>
              
              <div className="flex items-center gap-3">
                {flags['crm.light.enabled'] && (
                  <Button 
                    variant="secondary"
                    onClick={() => setShowDuplicatesModal(true)}
                  >
                    Find Duplicates
                  </Button>
                )}
                <Button onClick={() => setShowImportModal(true)}>Import CSV</Button>
                <Button onClick={handleExport}>Export</Button>
                <Button onClick={() => setShowAddDrawer(true)}>Add Contact</Button>
              </div>
            </div>
          </Card>

          {/* Subtle error display */}
          {error && (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          {/* Bulk Selection Header */}
          {contacts.length > 0 && (
            <Card className="border border-[var(--border)] rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={contacts.length > 0 && selectedContactIds.length === contacts.length}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedContactIds(contacts.map(c => c.id));
                    else setSelectedContactIds([]);
                  }}
                  className="h-4 w-4 rounded border-[var(--border)]"
                />
                <span className="text-sm text-[var(--muted)]">
                  Select all {contacts.length} contacts
                </span>
                {selectedContactIds.length > 0 && (
                  <span className="text-sm text-blue-600 font-medium">
                    ({selectedContactIds.length} selected)
                  </span>
                )}
              </div>
            </Card>
          )}

          {/* Results list */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <ContactSkeleton key={index} />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <Card className="border border-[var(--border)] rounded-lg shadow-sm p-8 text-center text-muted">
              {searchQuery || statusFilter || verifiedStatusFilter || seniorityFilter || tagsFilter ? 'No contacts found matching your criteria.' : 'No contacts yet. Add your first contact to get started!'}
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
                  onSelect={handleSelectContact}
                  isSelected={selectedContactIds.includes(contact.id)}
                  showCheckbox={true}
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

      {/* Duplicates Panel */}
      {showDuplicatesPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Duplicate Contacts Review</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDuplicatesPanel(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {duplicateGroups.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8">
                  No duplicates found
                </div>
              ) : (
                <div className="space-y-6">
                  {duplicateGroups.map((group, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={group.type === 'email' ? 'default' : 'secondary'}>
                          {group.type === 'email' ? 'Email' : 'Domain'}
                        </Badge>
                        <span className="font-medium text-sm">
                          {group.type === 'email' ? group.value : `@${group.value}`}
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          ({group.count} contacts)
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {group.contacts.map((contact: any) => (
                          <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <div className="font-medium">{contact.name || 'Unnamed'}</div>
                              <div className="text-sm text-[var(--muted)]">{contact.email}</div>
                              {contact.company && (
                                <div className="text-sm text-[var(--muted)]">{contact.company}</div>
                              )}
                            </div>
                            <div className="text-xs text-[var(--muted)]">
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Duplicates Modal */}
      <DuplicatesModal
        isOpen={showDuplicatesModal}
        onClose={() => setShowDuplicatesModal(false)}
        onReview={(group) => {
          setSelectedDuplicateGroup(group)
          setShowReviewDrawer(true)
          setShowDuplicatesModal(false)
        }}
      />

      {/* Review Duplicates Drawer */}
      <ReviewDuplicatesDrawer
        isOpen={showReviewDrawer}
        onClose={() => setShowReviewDrawer(false)}
        group={selectedDuplicateGroup}
        onMergeComplete={() => {
          fetchContacts() // Refresh the contacts list
          setSelectedDuplicateGroup(null)
        }}
      />
    </div>
  );
}
