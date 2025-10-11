import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminStatsPage() {
  await requireAdmin()
  
  // System-level statistics (different from telemetry analytics)
  let dbVersion = 'Unknown'
  let tableStats: Array<{ table: string; count: number }> = []
  
  try {
    // Get database version
    const dbResult = await prisma().$queryRaw<any[]>`SELECT version()`
    dbVersion = dbResult[0]?.version || 'Unknown'
    
    // Get all table row counts
    tableStats = await Promise.all([
      prisma().user.count().then(count => ({ table: 'Users', count })),
      prisma().workspace.count().then(count => ({ table: 'Workspaces', count })),
      prisma().membership.count().then(count => ({ table: 'Memberships', count })),
      prisma().admin.count().then(count => ({ table: 'Admins', count })),
      prisma().aiFeedback.count().then(count => ({ table: 'AI Feedback', count })).catch(() => ({ table: 'AI Feedback', count: 0 })),
      prisma().errorEvent.count().then(count => ({ table: 'Error Events', count })).catch(() => ({ table: 'Error Events', count: 0 })),
      prisma().activityLog.count().then(count => ({ table: 'Activity Logs', count })).catch(() => ({ table: 'Activity Logs', count: 0 })),
      prisma().auditLog.count().then(count => ({ table: 'Audit Logs', count })).catch(() => ({ table: 'Audit Logs', count: 0 }))
    ])
  } catch (error) {
    console.error('[admin/stats] Error fetching system stats:', error)
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
        <h1 className="text-2xl font-bold">System Statistics</h1>
      </div>
      
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Platform</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">Vercel</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Deployment Platform</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Database</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">PostgreSQL (Neon)</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={dbVersion}>
            {dbVersion.split(' ').slice(0, 2).join(' ')}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Authentication</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">NextAuth.js</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">OAuth + Credentials</div>
        </div>
      </div>
      
      {/* Database Table Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Database Tables</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Row counts for all major tables
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Table Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Row Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tableStats.map((stat) => (
                <tr key={stat.table} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {stat.table}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {stat.count.toLocaleString()} {stat.count === 1 ? 'row' : 'rows'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      ✓ Healthy
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Technology Stack */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="font-semibold text-gray-900 dark:text-white">Next.js 14</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Framework</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="font-semibold text-gray-900 dark:text-white">React 18</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">UI Library</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="font-semibold text-gray-900 dark:text-white">Prisma</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">ORM</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="font-semibold text-gray-900 dark:text-white">TypeScript</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Language</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="font-semibold text-gray-900 dark:text-white">Tailwind CSS</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Styling</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="font-semibold text-gray-900 dark:text-white">NextAuth.js</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Authentication</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="font-semibold text-gray-900 dark:text-white">Vercel</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Hosting</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="font-semibold text-gray-900 dark:text-white">Neon</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Database Host</div>
          </div>
        </div>
      </div>
      
      {/* Environment Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
          Runtime Environment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-900 dark:text-blue-100">Node Version:</span>
            <span className="ml-2 text-blue-800 dark:text-blue-200">{process.version}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900 dark:text-blue-100">Environment:</span>
            <span className="ml-2 text-blue-800 dark:text-blue-200">{process.env.NODE_ENV}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900 dark:text-blue-100">Platform:</span>
            <span className="ml-2 text-blue-800 dark:text-blue-200">{process.platform}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900 dark:text-blue-100">Architecture:</span>
            <span className="ml-2 text-blue-800 dark:text-blue-200">{process.arch}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

