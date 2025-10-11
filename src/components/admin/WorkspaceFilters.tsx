'use client'

interface WorkspaceFiltersProps {
  searchParams: {
    search?: string
    members?: string
    status?: string
  }
}

export function WorkspaceFilters({ searchParams }: WorkspaceFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search workspaces by name..."
          defaultValue={searchParams.search || ''}
          id="workspace-search-input"
          className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value
              const params = new URLSearchParams(searchParams as any)
              if (value) {
                params.set('search', value)
              } else {
                params.delete('search')
              }
              params.delete('page')
              window.location.href = `/en/admin/workspaces?${params.toString()}`
            }
          }}
        />
        
        {/* Member Count Filter */}
        <select
          defaultValue={searchParams.members || ''}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams as any)
            if (e.target.value) {
              params.set('members', e.target.value)
            } else {
              params.delete('members')
            }
            params.delete('page')
            window.location.href = `/en/admin/workspaces?${params.toString()}`
          }}
          className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
        >
          <option value="">All Workspaces</option>
          <option value="empty">Empty (0 members)</option>
          <option value="active">Active (1+ members)</option>
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
            window.location.href = `/en/admin/workspaces?${params.toString()}`
          }}
          className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
        >
          <option value="">All Status</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
      </div>
      
      {/* Search Button and Clear Filters */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => {
            const input = document.getElementById('workspace-search-input') as HTMLInputElement
            const value = input?.value || ''
            const params = new URLSearchParams(searchParams as any)
            if (value) {
              params.set('search', value)
            } else {
              params.delete('search')
            }
            params.delete('page')
            window.location.href = `/en/admin/workspaces?${params.toString()}`
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Search
        </button>
        
        {(searchParams.search || searchParams.members || searchParams.status) && (
          <button
            onClick={() => {
              window.location.href = '/en/admin/workspaces'
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

