import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

type SearchParams = {
  [key: string]: string | string[] | undefined
}

interface PageProps {
  searchParams: SearchParams | Promise<SearchParams>
}

export default async function ExportUserDataPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    redirect('/dashboard')
  }
  
  const params = await Promise.resolve(searchParams)
  const searchQuery = params.search as string | undefined
  
  // Get all users for the dropdown
  const users = await prisma().user.findMany({
    where: searchQuery ? {
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' as any } },
        { email: { contains: searchQuery, mode: 'insensitive' as any } }
      ]
    } : {},
    select: {
      id: true,
      name: true,
      email: true
    },
    orderBy: { email: 'asc' },
    take: 100
  })
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/en/admin/compliance" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Back to Compliance
        </Link>
        <h1 className="text-2xl font-bold">Export User Data (GDPR)</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate a complete export of a user's personal data in compliance with GDPR Article 15.
        </p>
      </div>
      
      {/* Search Users */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Search for User</h2>
        <form method="GET" className="flex gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search by name or email..."
            defaultValue={searchQuery || ''}
            className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Search
          </button>
          {searchQuery && (
            <Link
              href="/en/admin/compliance/export"
              className="px-6 py-2.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
            >
              Clear
            </Link>
          )}
        </form>
      </div>
      
      {/* User List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">
            {searchQuery ? 'Search Results' : 'All Users'} ({users.length})
          </h2>
        </div>
        
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900">
                <div>
                  <div className="font-medium">{user.name || 'No name'}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <a
                  href={`/api/admin/export/user/${user.id}`}
                  download
                  onClick={() => {
                    console.log(`[Export] Downloading data for user: ${user.id} (${user.email})`)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  📥 Export Data
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Information */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          What's included in the export:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• User profile information (name, email, registration date)</li>
          <li>• Workspace memberships and roles</li>
          <li>• Activity history (if available)</li>
          <li>• Account settings and preferences</li>
          <li>• Admin status (if applicable)</li>
        </ul>
        <p className="text-sm text-blue-800 dark:text-blue-200 mt-4">
          This export is provided in JSON format for easy processing and complies with GDPR requirements.
        </p>
      </div>
    </div>
  )
}

