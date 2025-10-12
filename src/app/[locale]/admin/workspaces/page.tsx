import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { WorkspaceTableWithBulk } from '@/components/admin/WorkspaceTableWithBulk'
import { WorkspaceFilters } from '@/components/admin/WorkspaceFilters'

export const dynamic = 'force-dynamic'

// IMPORTANT: searchParams type for Next.js 14+
type SearchParams = {
  [key: string]: string | string[] | undefined
}

interface PageProps {
  searchParams: SearchParams | Promise<SearchParams>
}

export default async function AdminWorkspacesPage({ searchParams }: PageProps) {
  await requireAdmin()
  
  // Await searchParams if it's a Promise (Next.js 14+)
  const params = await Promise.resolve(searchParams)
  
  // Extract values as strings (not arrays)
  const searchQuery = params.search as string | undefined
  const membersFilter = params.members as string | undefined
  const statusFilter = params.status as string | undefined
  
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
  
  // Create plain serializable object for client components (no Promises!)
  const filterParams = {
    search: searchQuery || '',
    members: membersFilter || '',
    status: statusFilter || ''
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
      <WorkspaceFilters searchParams={filterParams} />
      
      {/* Workspace Table with Bulk Selection */}
      <WorkspaceTableWithBulk workspaces={filteredWorkspaces as any} />
    </div>
  )
}

