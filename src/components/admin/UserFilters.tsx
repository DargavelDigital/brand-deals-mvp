'use client'

interface UserFiltersProps {
  searchParams: {
    search?: string
    role?: string
    status?: string
    verified?: string
  }
}

export function UserFilters({ searchParams }: UserFiltersProps) {
  const handleFilterChange = (filterType: string, value: string) => {
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
    window.location.href = url
  }
  
  const handleSearch = () => {
    const input = document.getElementById('user-search-input') as HTMLInputElement
    const value = input?.value?.trim() || ''
    handleFilterChange('search', value)
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-6">
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
          onChange={(e) => handleFilterChange('role', e.target.value)}
          className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
        >
          <option value="">All Roles</option>
          <option value="admin">Admins Only</option>
          <option value="user">Users Only</option>
        </select>
        
        {/* Status Filter */}
        <select
          value={searchParams.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
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
            onClick={() => window.location.href = '/en/admin/users'}
            className="px-4 py-2.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700 transition-colors font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}
