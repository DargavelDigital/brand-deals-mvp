import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import Link from 'next/link'
import { UserTableWithBulk } from '@/components/admin/UserTableWithBulk'
import { UserFilters } from '@/components/admin/UserFilters'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: { page?: string; search?: string; role?: string; status?: string; verified?: string }
}) {
  await requireAdmin()
  
  const session = await getServerSession(authOptions)
  
  // ═════════════════════════════════════
  // DEBUG LOGGING - START
  // ═════════════════════════════════════
  console.log('═════════════════════════════════════')
  console.log('[Admin Users Page] Raw searchParams:', JSON.stringify(searchParams, null, 2))
  
  const page = parseInt(searchParams.page || '1')
  const pageSize = 50
  const searchQuery = searchParams.search
  const roleFilter = searchParams.role
  const statusFilter = searchParams.status
  const verifiedFilter = searchParams.verified
  
  console.log('[Parsed Filters]', {
    page,
    searchQuery,
    roleFilter,
    statusFilter,
    verifiedFilter
  })
  
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
    console.log('[Status Filter] Applied: suspended = true (SUSPENDED USERS ONLY)')
  } else if (statusFilter === 'active') {
    whereClause.suspended = false
    console.log('[Status Filter] Applied: suspended = false (ACTIVE USERS ONLY)')
  }
  
  // Email verification filter
  if (verifiedFilter === 'verified') {
    whereClause.emailVerified = { not: null }
    console.log('[Verification Filter] Applied: emailVerified IS NOT NULL')
  } else if (verifiedFilter === 'unverified') {
    whereClause.emailVerified = null
    console.log('[Verification Filter] Applied: emailVerified IS NULL')
  }
  
  console.log('[Final whereClause]', JSON.stringify(whereClause, null, 2))
  
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
  
  console.log('[Query Results]', {
    usersFound: users.length,
    totalCount,
    firstUser: users[0] ? {
      name: users[0].name,
      email: users[0].email,
      suspended: users[0].suspended
    } : null
  })
  
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
    console.log('[Role Filter] Applied: ADMINS ONLY - filtered to', usersWithAdmin.length, 'users')
  } else if (roleFilter === 'user') {
    usersWithAdmin = usersWithAdmin.filter(u => u.admin === null)
    console.log('[Role Filter] Applied: USERS ONLY - filtered to', usersWithAdmin.length, 'users')
  }
  
  // Recalculate total count after role filter
  const filteredTotalCount = roleFilter ? usersWithAdmin.length : totalCount
  
  console.log('[Final Result]', {
    displayedUsers: usersWithAdmin.length,
    filteredTotalCount,
    totalInDatabase: totalCount
  })
  console.log('═════════════════════════════════════')
  // ═════════════════════════════════════
  // DEBUG LOGGING - END
  // ═════════════════════════════════════
  
  const totalPages = Math.ceil(filteredTotalCount / pageSize)
  
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
      
      {/* Search & Filters - Client Component */}
      <UserFilters searchParams={searchParams} />
      
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

