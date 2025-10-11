import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminWorkspacesPage() {
  await requireAdmin()
  
  // Fetch all workspaces with member counts
  const workspaces = await prisma().workspace.findMany({
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
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/en/admin"
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 text-sm mb-2 inline-block"
          >
            ← Back to Admin Console
          </Link>
          <h1 className="text-2xl font-bold">Workspace Management</h1>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Workspaces: {workspaces.length}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Workspace Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {workspaces.map((workspace) => {
              const owner = workspace.Membership.find(m => m.role === 'OWNER')
              return (
                <tr key={workspace.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {workspace.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {workspace.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {workspace._count.Membership} {workspace._count.Membership === 1 ? 'member' : 'members'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {owner?.User_Membership_userIdToUser.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {owner?.User_Membership_userIdToUser.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(workspace.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/en/admin/workspaces/${workspace.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {workspaces.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No workspaces found
          </div>
        )}
      </div>
    </div>
  )
}

