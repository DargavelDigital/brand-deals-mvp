import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import Link from 'next/link'
import { UserTableWithBulk } from '@/components/admin/UserTableWithBulk'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: { page?: string; search?: string }
}) {
  await requireAdmin()
  
  const session = await getServerSession(authOptions)
  
  const page = parseInt(searchParams.page || '1')
  const pageSize = 50
  const searchQuery = searchParams.search
  
  // Build where clause
  const whereClause: any = {}
  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' as any } },
      { email: { contains: searchQuery, mode: 'insensitive' as any } }
    ]
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
  const usersWithAdmin = await Promise.all(
    users.map(async (user) => {
      const admin = await prisma().admin.findUnique({
        where: { email: user.email! },
        select: { role: true }
      }).catch(() => null)
      return { ...user, admin }
    })
  )
  
  const totalPages = Math.ceil(totalCount / pageSize)
  
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
              Total Users: {totalCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-6">
        <form method="get" className="flex gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search by name or email..."
            defaultValue={searchQuery || ''}
            className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Search
          </button>
          {searchQuery && (
            <Link
              href="/en/admin/users"
              className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 dark:border-gray-700 text-sm"
            >
              Clear
            </Link>
          )}
        </form>
      </div>
      
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
        Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} of {totalCount.toLocaleString()} users
      </div>
    </div>
  )
}

