import { requireAdmin } from '@/lib/admin/guards'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminWorkspaceDetailPage({
  params
}: {
  params: { id: string; locale: string }
}) {
  await requireAdmin()
  
  // Fetch workspace with all details
  const workspace = await prisma().workspace.findUnique({
    where: { id: params.id },
    include: {
      Membership: {
        include: {
          User_Membership_userIdToUser: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      _count: {
        select: {
          Membership: true
        }
      }
    }
  })
  
  if (!workspace) {
    notFound()
  }
  
  // NEW: Get AI cost summary
  const { getWorkspaceCostSummary } = await import('@/services/ai/track-usage');
  const { formatCost } = await import('@/lib/ai-costs');
  
  const aiCosts = await getWorkspaceCostSummary(params.id).catch(err => {
    console.error('Failed to load AI costs:', err);
    return { totalCost: 0, totalTokens: 0, totalRequests: 0, byProvider: {}, byFeature: {} };
  });
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Link
          href="/en/admin/workspaces"
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-2 inline-block"
        >
          ← Back to Workspaces
        </Link>
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
          ID: {workspace.id}
        </p>
      </div>
      
      {/* Workspace Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Members</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{workspace._count.Membership}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {new Date(workspace.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Updated</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {new Date(workspace.updatedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
      
      {/* Members Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Members</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {workspace.Membership.map((membership) => (
                <tr key={membership.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {membership.User_Membership_userIdToUser.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {membership.User_Membership_userIdToUser.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      membership.role === 'OWNER' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : membership.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {membership.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(membership.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {workspace.Membership.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No members found
          </div>
        )}
      </div>
      
      {/* NEW: AI Usage & Costs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">💰 AI Usage & Costs</h2>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cost</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCost(aiCosts.totalCost)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {aiCosts.totalTokens.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Requests</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {aiCosts.totalRequests.toLocaleString()}
            </div>
          </div>
        </div>
        
        {Object.keys(aiCosts.byProvider).length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3">By Provider</h3>
            <div className="space-y-2">
              {Object.entries(aiCosts.byProvider).map(([provider, stats]: [string, any]) => (
                <div key={provider} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                  <span className="capitalize text-gray-900 dark:text-white">{provider}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCost(stats.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {Object.keys(aiCosts.byFeature).length > 0 && (
          <div>
            <h3 className="font-medium mb-3">By Feature</h3>
            <div className="space-y-2">
              {Object.entries(aiCosts.byFeature).map(([feature, stats]: [string, any]) => (
                <div key={feature} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                  <span className="text-gray-900 dark:text-white">{feature.replace(/_/g, ' ')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCost(stats.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {aiCosts.totalRequests === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">
            No AI usage yet
          </div>
        )}
      </div>
    </div>
  )
}

