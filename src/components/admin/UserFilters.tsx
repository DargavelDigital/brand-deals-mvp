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
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700"
          />
        </div>
        
        {/* Role Filter */}
        <select
          defaultValue={searchParams.role || ''}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams as any)
            if (e.target.value) {
              params.set('role', e.target.value)
            } else {
              params.delete('role')
            }
            params.delete('page')
            window.location.href = `/en/admin/users?${params.toString()}`
          }}
          className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
        >
          <option value="">All Roles</option>
          <option value="admin">Admins Only</option>
          <option value="user">Users Only</option>
        </select>
        
        {/* Status Filter */}
        <select
          defaultValue={searchParams.status || ''}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams as any)
            if (e.target.value) {
              params.set('status', e.target.value)
            } else {
              params.delete('status')
            }
            params.delete('page')
            window.location.href = `/en/admin/users?${params.toString()}`
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
          defaultValue={searchParams.verified || ''}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams as any)
            if (e.target.value) {
              params.set('verified', e.target.value)
            } else {
              params.delete('verified')
            }
            params.delete('page')
            window.location.href = `/en/admin/users?${params.toString()}`
          }}
          className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
        >
          <option value="">Email Status</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>
        
        {/* Search Button */}
        <button
          onClick={() => {
            const input = document.getElementById('user-search-input') as HTMLInputElement
            const value = input?.value?.trim() || ''
            const params = new URLSearchParams()
            
            // Add search if exists
            if (value) {
              params.set('search', value)
            }
            
            // Preserve existing filters
            if (searchParams.role) params.set('role', searchParams.role)
            if (searchParams.status) params.set('status', searchParams.status)
            if (searchParams.verified) params.set('verified', searchParams.verified)
            
            // Navigate (no page param - start from page 1)
            const queryString = params.toString()
            window.location.href = `/en/admin/users${queryString ? '?' + queryString : ''}`
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Search
        </button>
        
        {/* Clear All Filters Button */}
        {(searchParams.search || searchParams.role || searchParams.status || searchParams.verified) && (
          <button
            onClick={() => {
              window.location.href = '/en/admin/users'
            }}
            className="px-4 py-2.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700 transition-colors font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  )
}

