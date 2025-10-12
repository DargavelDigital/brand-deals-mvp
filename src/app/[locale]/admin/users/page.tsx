import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import Link from 'next/link'
import { UserTableWithBulk } from '@/components/admin/UserTableWithBulk'
import { UserFilters } from '@/components/admin/UserFilters'

export const dynamic = 'force-dynamic'

// IMPORTANT: searchParams type for Next.js 14+
type SearchParams = {
  [key: string]: string | string[] | undefined
}

interface PageProps {
  searchParams: SearchParams | Promise<SearchParams>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAdmin()
  
  const session = await getServerSession(authOptions)
  
  // Await searchParams if it's a Promise (Next.js 14+)
  const params = await Promise.resolve(searchParams)
  
  // Extract values as strings (not arrays)
  const page = parseInt((params.page as string) || '1')
  const pageSize = 50
  const searchQuery = params.search as string | undefined
  const roleFilter = params.role as string | undefined
  const statusFilter = params.status as string | undefined
  const verifiedFilter = params.verified as string | undefined
  
  // Build where clause with all filters
  const whereClause: any = {}
  
  // Search filter
  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' as any } },
      { email: { contains: searchQuery, mode: 'insensitive' as any } }
    ]
  }
  
  // Status filter (suspended/active)
  if (statusFilter === 'suspended') {
    whereClause.suspended = true
  } else if (statusFilter === 'active') {
    whereClause.suspended = false
  }
  
  // Email verification filter
  if (verifiedFilter === 'verified') {
    whereClause.emailVerified = { not: null }
  } else if (verifiedFilter === 'unverified') {
    whereClause.emailVerified = null
  }
  
  // Fetch users with their relationships
  const [users, totalCount] = await Promise.all([
    prisma().user.findMany({
      where: whereClause,
      include: {
        Membership_Membership_userIdToUser: {
          include: {
            Workspace: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize
    }),
    prisma().user.count({ where: whereClause })
  ])
  
  // Get admin info for each user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let usersWithAdmin = await Promise.all(
    users.map(async (user: any) => {
      const admin = await prisma().admin.findUnique({
        where: { email: user.email! },
        select: { role: true }
      }).catch(() => null)
      return { ...user, admin }
    })
  )
  
  // Apply role filter (post-query since Admin is separate table)
  if (roleFilter === 'admin') {
    usersWithAdmin = usersWithAdmin.filter(u => u.admin !== null)
  } else if (roleFilter === 'user') {
    usersWithAdmin = usersWithAdmin.filter(u => u.admin === null)
  }
  
  // Recalculate total count after role filter
  const filteredTotalCount = roleFilter ? usersWithAdmin.length : totalCount
  
  const totalPages = Math.ceil(filteredTotalCount / pageSize)
  
  // Create a plain serializable object for client components (no Promises!)
  const filterParams = {
    search: searchQuery || '',
    role: roleFilter || '',
    status: statusFilter || '',
    verified: verifiedFilter || ''
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
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="flex items-center gap-4">
            <a
              href="/api/admin/export/users"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
              download
            >
              📥 Export CSV
            </a>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {(roleFilter || statusFilter || verifiedFilter || searchQuery) && (
                <span>Filtered: {filteredTotalCount.toLocaleString()} / </span>
              )}
              Total: {totalCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Search & Filters */}
      <UserFilters searchParams={filterParams} />
      
      {/* Users Table with Bulk Selection */}
      <UserTableWithBulk
        users={usersWithAdmin as any}
        currentUserId={session?.user?.id}
        isSuperAdmin={session?.user?.adminRole === 'SUPER'}
      />
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          {page > 1 && (
            <Link
              href={`/en/admin/users?page=${page - 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
              className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 text-sm"
            >
              ← Previous
            </Link>
          )}
          
          <span className="px-4 py-2 border rounded bg-blue-50 dark:bg-blue-900 dark:border-blue-800 text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          
          {page < totalPages && (
            <Link
              href={`/en/admin/users?page=${page + 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
              className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 text-sm"
            >
              Next →
            </Link>
          )}
        </div>
      )}
      
      {/* Summary */}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filteredTotalCount)} of {filteredTotalCount.toLocaleString()} users
        {(roleFilter || statusFilter || verifiedFilter || searchQuery) && (
          <span> (filtered from {totalCount.toLocaleString()} total)</span>
        )}
      </div>
    </div>
  )
}

