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
  searchParams: { page?: string; search?: string; role?: string; status?: string; verified?: string }
}) {
  await requireAdmin()
  
  const session = await getServerSession(authOptions)
  
  const page = parseInt(searchParams.page || '1')
  const pageSize = 50
  const searchQuery = searchParams.search
  const roleFilter = searchParams.role
  const statusFilter = searchParams.status
  const verifiedFilter = searchParams.verified
  
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
  let usersWithAdmin = await Promise.all(
    users.map(async (user) => {
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
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name or email..."
              defaultValue={searchQuery || ''}
              id="user-search-input"
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700"
            />
          </div>
          
          {/* Role Filter */}
          <select
            defaultValue={roleFilter || ''}
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
            defaultValue={statusFilter || ''}
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
            defaultValue={verifiedFilter || ''}
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
              const value = input?.value || ''
              const params = new URLSearchParams(searchParams as any)
              if (value) {
                params.set('search', value)
              } else {
                params.delete('search')
              }
              params.delete('page')
              window.location.href = `/en/admin/users?${params.toString()}`
            }}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Search
          </button>
          
          {/* Clear All Filters Button */}
          {(searchQuery || roleFilter || statusFilter || verifiedFilter) && (
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

