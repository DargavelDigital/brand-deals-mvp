import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminErrorsPage({
  searchParams
}: {
  searchParams: { page?: string; search?: string }
}) {
  await requireAdmin()
  
  const page = parseInt(searchParams.page || '1')
  const pageSize = 50
  const search = searchParams.search || ''
  
  // Fetch error events
  let errors: any[] = []
  let totalCount = 0
  let hasErrors = true
  
  try {
    const whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { message: { contains: search, mode: 'insensitive' as any } },
        { where: { contains: search, mode: 'insensitive' as any } }
      ]
    }
    
    const [errorResults, count] = await Promise.all([
      prisma().errorEvent.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: {
          Workspace: {
            select: {
              name: true,
              id: true
            }
          }
        }
      }),
      prisma().errorEvent.count({ where: whereClause })
    ])
    
    errors = errorResults
    totalCount = count
    
  } catch (error) {
    console.error('[admin/errors] Error fetching logs:', error)
    hasErrors = false
  }
  
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
          <h1 className="text-2xl font-bold">Error Logs</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Errors: {totalCount.toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-6">
        <form method="get" className="flex gap-4 items-center">
          <label className="text-sm font-medium">Search:</label>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by message or location..."
            className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Search
          </button>
          {search && (
            <Link
              href="/en/admin/errors"
              className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 text-sm"
            >
              Clear
            </Link>
          )}
        </form>
      </div>
      
      {/* Error Log Table */}
      {!hasErrors ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
            Unable to Load Error Logs
          </h3>
          <p className="text-yellow-800 dark:text-yellow-300">
            There was an error fetching the error logs. Please check the console for details.
          </p>
        </div>
      ) : errors.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-12 text-center">
          <div className="text-green-500 mb-2">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {search ? 'No errors match your search' : 'No errors found'}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {search ? 'Try a different search term' : 'System is running smoothly! ✅'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Workspace
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {errors.map((error: any) => (
                    <tr key={error.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          {new Date(error.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(error.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                          {error.where}
                        </div>
                        {error.traceId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {error.traceId.slice(0, 8)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-lg">
                          {error.message}
                        </div>
                        {error.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300">
                              View stack trace
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto max-w-lg border">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                        {error.meta && Object.keys(error.meta).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300">
                              View metadata
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto max-w-lg border">
                              {JSON.stringify(error.meta, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {error.Workspace ? (
                          <Link
                            href={`/en/admin/workspaces/${error.Workspace.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {error.Workspace.name}
                          </Link>
                        ) : (
                          'System'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/en/admin/errors?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
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
                  href={`/en/admin/errors?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                  className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 text-sm"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
          
          {/* Summary */}
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
            Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} of {totalCount.toLocaleString()} errors
          </div>
        </>
      )}
    </div>
  )
}

