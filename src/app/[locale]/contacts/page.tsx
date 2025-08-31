'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ContactCard } from '@/components/contacts/ContactCard'
import { ContactDrawer } from './ContactDrawer'
import { ImportModal } from './ImportModal'
import { ContactDTO, ContactStatus, ContactVerificationStatus } from '@/types/contact'
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
  const [verifiedStatusFilter, setVerifiedStatusFilter] = useState('')
  const [seniorityFilter, setSeniorityFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
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

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Partnerships', label: 'Partnerships' },
    { value: 'Brand', label: 'Brand' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Product', label: 'Product' }
  ]

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
      setCurrentPage(1)
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
      
      if (departmentFilter) {
        params.append('department', departmentFilter)
      }
      
      if (tagsFilter.trim()) {
        params.append('tags', tagsFilter.trim())
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

  const fetchDuplicates = async () => {
    try {
      setDuplicatesLoading(true)
      const response = await fetch('/api/contacts/duplicates')
      const authCheckedResponse = await handleResponse(response)
      if (!authCheckedResponse) {
        return // Unauthorized, handled by useAuthGuard
      }

      const { ok, status, body } = await safeJson('/api/contacts/duplicates')
      
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

  const handleBulkAction = async (op: 'addTag' | 'setStatus' | 'exportCsv', value?: string) => {
    if (selectedContactIds.length === 0) return

    try {
      setBulkActionLoading(true)
      
      if (op === 'exportCsv') {
        // Handle CSV export with file download
        const response = await fetch('/api/contacts/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedContactIds, op, value })
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`
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
      if (process.env.NEXT_PUBLIC_FEATURE_CONTACTS_DEDUPE === 'true') {
        fetchDuplicates()
      }
    }
  }, [currentPage, searchQuery, statusFilter, verifiedStatusFilter, seniorityFilter, departmentFilter, tagsFilter, isUnauthorized])

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
  }

  const handleVerifiedStatusChange = (value: string) => {
    setVerifiedStatusFilter(value)
    setCurrentPage(1)
  }

  const handleSeniorityChange = (value: string) => {
    setSeniorityFilter(value)
    setCurrentPage(1)
  }

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value)
    setCurrentPage(1)
  }

  const handleTagsChange = (value: string) => {
    setTagsFilter(value)
    setCurrentPage(1)
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
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Contacts" }
        ]}
      />
      
      {/* Bulk Actions Bar */}
      {process.env.NEXT_PUBLIC_FEATURE_CONTACTS_BULK === 'true' && selectedContactIds.length > 0 && (
        <Card className="sticky top-0 z-10 border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-800">
                {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="New tag..."
                className="w-32"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    handleBulkAction('addTag', e.currentTarget.value.trim())
                    e.currentTarget.value = ''
                  }
                }}
              />
              <Select
                onChange={(e) => handleBulkAction('setStatus', e.currentTarget.value)}
                disabled={bulkActionLoading}
              >
                <option value="">Set Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
              <Button
                onClick={() => handleBulkAction('exportCsv')}
                disabled={bulkActionLoading}
                size="sm"
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedContactIds([])}
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Duplicates Alert */}
      {process.env.NEXT_PUBLIC_FEATURE_CONTACTS_DEDUPE === 'true' && duplicateGroups.length > 0 && (
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
              onClick={() => setShowDuplicatesPanel(true)}
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
              
              {/* Department filter */}
              <Select 
                value={departmentFilter} 
                onChange={(e) => handleDepartmentChange(e.target.value)}
              >
                {departmentOptions.map(option => (
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
                <Button onClick={() => setShowImportModal(true)}>Import CSV</Button>
                <Button onClick={handleExport}>Export</Button>
                <Button onClick={() => setShowAddDrawer(true)}>Add Contact</Button>
              </div>
            </div>
          </Card>

          {/* Error display */}
          {error && (
            <div className="text-[var(--error)] text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          {/* Bulk Selection Header */}
          {process.env.NEXT_PUBLIC_FEATURE_CONTACTS_BULK === 'true' && contacts.length > 0 && (
            <Card className="border border-[var(--border)] rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedContactIds.length === contacts.length && contacts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
            <Card className="border border-[var(--border)] rounded-lg shadow-sm p-8 text-center text-muted">
              Loading contacts...
            </Card>
          ) : contacts.length === 0 ? (
            <Card className="border border-[var(--border)] rounded-lg shadow-sm p-8 text-center text-muted">
              {searchQuery || statusFilter || verifiedStatusFilter || seniorityFilter || departmentFilter || tagsFilter ? 'No contacts found matching your criteria.' : 'No contacts yet. Add your first contact to get started!'}
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
                  onSelect={process.env.NEXT_PUBLIC_FEATURE_CONTACTS_BULK === 'true' ? handleSelectContact : undefined}
                  isSelected={process.env.NEXT_PUBLIC_FEATURE_CONTACTS_BULK === 'true' ? selectedContactIds.includes(contact.id) : false}
                  showCheckbox={process.env.NEXT_PUBLIC_FEATURE_CONTACTS_BULK === 'true'}
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
                        <span className="text-[var(--muted)] text-sm">
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
    </div>
  );
}
