import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { WorkspaceTableWithBulk } from '@/components/admin/WorkspaceTableWithBulk'

export const dynamic = 'force-dynamic'

export default async function AdminWorkspacesPage({
  searchParams
}: {
  searchParams: { search?: string; members?: string; status?: string }
}) {
  await requireAdmin()
  
  const searchQuery = searchParams.search
  const membersFilter = searchParams.members
  const statusFilter = searchParams.status
  
  // Build where clause with filters
  const whereClause: any = {}
  
  // Search filter
  if (searchQuery) {
    whereClause.name = { contains: searchQuery, mode: 'insensitive' as any }
  }
  
  // Status filter
  if (statusFilter === 'suspended') {
    whereClause.suspended = true
  } else if (statusFilter === 'active') {
    whereClause.suspended = false
  }
  
  // Fetch all workspaces with member counts
  const workspaces = await prisma().workspace.findMany({
    where: whereClause,
    include: {
      Membership: {
        select: {
          id: true,
          role: true,
          User_Membership_userIdToUser: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      _count: {
        select: {
          Membership: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  // Filter by member count (post-query since it's a count)
  let filteredWorkspaces = workspaces
  if (membersFilter === 'empty') {
    filteredWorkspaces = workspaces.filter(w => w._count.Membership === 0)
  } else if (membersFilter === 'active') {
    filteredWorkspaces = workspaces.filter(w => w._count.Membership > 0)
  }
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Link
          href="/en/admin"
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-2 inline-block"
        >
          ← Back to Admin Console
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Workspace Management</h1>
          <div className="flex items-center gap-4">
            <a
              href="/api/admin/export/workspaces"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
              download
            >
              📥 Export CSV
            </a>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {(searchQuery || membersFilter || statusFilter) && (
                <span>Filtered: {filteredWorkspaces.length} / </span>
              )}
              Total: {workspaces.length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search workspaces by name..."
            defaultValue={searchQuery || ''}
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
            defaultValue={membersFilter || ''}
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
            defaultValue={statusFilter || ''}
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
          
          {(searchQuery || membersFilter || statusFilter) && (
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
      
      {/* Workspace Table with Bulk Selection */}
      <WorkspaceTableWithBulk workspaces={filteredWorkspaces as any} />
    </div>
  )
}

