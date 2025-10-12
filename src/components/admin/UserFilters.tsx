'use client'

import { useEffect } from 'react'

interface UserFiltersProps {
  searchParams: {
    search?: string
    role?: string
    status?: string
    verified?: string
  }
}

export function UserFilters({ searchParams }: UserFiltersProps) {
  // Debug: Log when component mounts and searchParams change
  useEffect(() => {
    console.log('[UserFilters] Mounted with searchParams:', searchParams)
  }, [searchParams])
  
  const handleFilterChange = (filterType: string, value: string) => {
    console.log('[handleFilterChange]', { filterType, value, currentParams: searchParams })
    
    const params = new URLSearchParams()
    
    // Preserve all existing filters
    if (searchParams.search) params.set('search', searchParams.search)
    if (searchParams.role) params.set('role', searchParams.role)
    if (searchParams.status) params.set('status', searchParams.status)
    if (searchParams.verified) params.set('verified', searchParams.verified)
    
    // Update the changed filter
    if (value) {
      params.set(filterType, value)
    } else {
      params.delete(filterType)
    }
    
    // Navigate
    const url = params.toString() ? `/en/admin/users?${params.toString()}` : '/en/admin/users'
    console.log('[Navigating to]', url)
    window.location.href = url
  }
  
  const handleSearch = () => {
    const input = document.getElementById('user-search-input') as HTMLInputElement
    const value = input?.value?.trim() || ''
    handleFilterChange('search', value)
  }
  
  // Show current filter state at top of component
  console.log('[UserFilters RENDER]', {
    statusValue: searchParams.status || '',
    roleValue: searchParams.role || '',
    verifiedValue: searchParams.verified || ''
  })
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-6">
      {/* Debug Banner - Shows active filters */}
      {(searchParams.search || searchParams.role || searchParams.status || searchParams.verified) && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
            <strong>🔍 Active Filters:</strong>
            {searchParams.search && <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-blue-900 dark:text-blue-100">Search: {searchParams.search}</span>}
            {searchParams.role && <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded text-purple-900 dark:text-purple-100">Role: {searchParams.role}</span>}
            {searchParams.status && <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-yellow-900 dark:text-yellow-100">Status: {searchParams.status}</span>}
            {searchParams.verified && <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-green-900 dark:text-green-100">Verified: {searchParams.verified}</span>}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            defaultValue={searchParams.search || ''}
            id="user-search-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700"
          />
        </div>
        
        {/* Role Filter */}
        <select
          value={searchParams.role || ''}
          onChange={(e) => {
            console.log('[Role Filter] Selected:', e.target.value)
            handleFilterChange('role', e.target.value)
          }}
          className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
        >
          <option value="">All Roles</option>
          <option value="admin">Admins Only</option>
          <option value="user">Users Only</option>
        </select>
        
        {/* Status Filter */}
        <select
          value={searchParams.status || ''}
          onChange={(e) => {
            console.log('[Status Filter] Selected:', e.target.value)
            console.log('[Status Filter] Current searchParams:', searchParams)
            handleFilterChange('status', e.target.value)
          }}
          className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
        >
          <option value="">All Status</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
      </div>
      
      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {/* Email Verification Filter */}
        <select
          value={searchParams.verified || ''}
          onChange={(e) => handleFilterChange('verified', e.target.value)}
          className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
        >
          <option value="">Email Status</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>
        
        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Search
        </button>
        
        {/* Clear Filters Button */}
        {(searchParams.search || searchParams.role || searchParams.status || searchParams.verified) && (
          <button
            onClick={() => {
              console.log('[Clear Filters]')
              window.location.href = '/en/admin/users'
            }}
            className="px-4 py-2.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700 transition-colors font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}
