import { requireAdmin } from '@/lib/admin/guards'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdmin()
  
  // Lazy import Prisma to avoid build-time issues
  const { prisma } = await import('@/lib/prisma')
  
  const recentWs = await prisma().workspace.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 20,
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          Membership: true
        }
      }
    }
  })
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Console</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage workspaces, users, and system settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/en/admin/workspaces" className="block">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">👥 User Management</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage users, roles, and permissions
            </p>
          </div>
        </Link>
        
        <Link href="/en/admin/workspaces" className="block">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">🏢 Workspaces</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              View and manage all workspaces
            </p>
          </div>
        </Link>
        
        <Link href="/en/admin/telemetry" className="block">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">📊 System Stats</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Monitor system health and usage
            </p>
          </div>
        </Link>
        
        <Link href="/en/admin/errors" className="block">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">🚨 Error Logs</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              View system errors and issues
            </p>
          </div>
        </Link>
        
        <Link href="/en/admin/telemetry" className="block">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">📈 Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Platform usage and metrics
            </p>
          </div>
        </Link>
        
        <Link href="/en/admin/compliance" className="block">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">🔒 Compliance</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Data compliance and privacy
            </p>
          </div>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Workspaces</h2>
        
        {recentWs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No workspaces found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Members</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentWs.map(w => (
                  <tr key={w.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{w.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs text-gray-500 dark:text-gray-400">
                        {w.id.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      {w._count.Membership}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link 
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium" 
                        href={`/en/admin/workspaces/${w.id}`}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          ✅ <strong>Admin console is now accessible!</strong> You have full access to all administrative features.
        </p>
      </div>
    </div>
  )
}

