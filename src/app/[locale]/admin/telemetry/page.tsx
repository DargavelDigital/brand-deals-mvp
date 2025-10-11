import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminTelemetryPage() {
  await requireAdmin()
  
  // Fetch analytics data
  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  try {
    // User Statistics
    const [
      totalUsers,
      activeUsers7d,
      newUsers30d,
      totalWorkspaces,
      totalMemberships,
      totalAdmins
    ] = await Promise.all([
      prisma().user.count(),
      prisma().user.count({
        where: {
          updatedAt: { gte: last7Days }
        }
      }),
      prisma().user.count({
        where: {
          createdAt: { gte: last30Days }
        }
      }),
      prisma().workspace.count(),
      prisma().membership.count(),
      prisma().admin.count()
    ])
    
    // Activity Statistics
    let recentActivity: any[] = []
    try {
      recentActivity = await prisma().activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: {
              name: true,
              email: true
            }
          },
          Workspace: {
            select: {
              name: true
            }
          }
        }
      })
    } catch (e) {
      // ActivityLog table might be empty
      recentActivity = []
    }
    
    // Feedback Statistics
    let feedbackStats = { total: 0, upCount: 0, downCount: 0 }
    try {
      const feedbackData = await prisma().aiFeedback.groupBy({
        by: ['decision'],
        _count: true
      })
      feedbackStats.total = feedbackData.reduce((sum, item) => sum + item._count, 0)
      feedbackStats.upCount = feedbackData.find(item => item.decision === 'UP')?._count || 0
      feedbackStats.downCount = feedbackData.find(item => item.decision === 'DOWN')?._count || 0
    } catch (e) {
      // Feedback table might be empty
    }
    
    // Error Statistics
    let errorCount = 0
    try {
      errorCount = await prisma().errorEvent.count({
        where: {
          createdAt: { gte: last7Days }
        }
      })
    } catch (e) {
      // ErrorEvent table might be empty
    }
    
    // Growth rate calculation
    const growthRate = totalUsers > 0 
      ? ((newUsers30d / totalUsers) * 100).toFixed(1) 
      : '0'
    
    // Average members per workspace
    const avgMembersPerWorkspace = totalWorkspaces > 0
      ? (totalMemberships / totalWorkspaces).toFixed(1)
      : '0'
    
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
            <h1 className="text-2xl font-bold">Analytics & Telemetry</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {now.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Users */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers.toLocaleString()}</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              +{newUsers30d} in last 30 days
            </div>
          </div>
          
          {/* Active Users */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Users (7d)</div>
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{activeUsers7d.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {totalUsers > 0 ? ((activeUsers7d / totalUsers) * 100).toFixed(1) : '0'}% of total
            </div>
          </div>
          
          {/* Total Workspaces */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Workspaces</div>
              <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalWorkspaces.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Avg {avgMembersPerWorkspace} members/workspace
            </div>
          </div>
          
          {/* AI Feedback */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">AI Feedback</div>
              <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{feedbackStats.total.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {feedbackStats.upCount} 👍 / {feedbackStats.downCount} 👎
            </div>
          </div>
        </div>
        
        {/* Growth Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-6">
          {/* User Growth */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Growth</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">30-day Growth Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{growthRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min(parseFloat(growthRate), 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{newUsers30d}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">New Users (30d)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeUsers7d}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Active Users (7d)</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* System Health */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Health</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                  ✓ Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Authentication</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                  ✓ Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Admin Users</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-semibold">
                  {totalAdmins} Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Errors (7d)</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  errorCount === 0 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : errorCount < 10
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {errorCount === 0 ? '✓ None' : `${errorCount} errors`}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivity.slice(0, 10).map((activity: any) => (
                <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.User?.name || 'Unknown User'} • {activity.action}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.Workspace?.name || 'System'} • {activity.targetType ? `${activity.targetType}` : ''}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-700 dark:text-blue-300 mb-1 font-medium">Average Engagement</div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {totalUsers > 0 ? ((activeUsers7d / totalUsers) * 100).toFixed(0) : '0'}%
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Users active in past week
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-700 dark:text-green-300 mb-1 font-medium">AI Approval Rate</div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {feedbackStats.total > 0 
                ? ((feedbackStats.upCount / feedbackStats.total) * 100).toFixed(0) 
                : '0'}%
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {feedbackStats.total > 0 ? `${feedbackStats.upCount} positive of ${feedbackStats.total} total` : 'No feedback yet'}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-purple-700 dark:text-purple-300 mb-1 font-medium">Workspace Utilization</div>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {avgMembersPerWorkspace}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Average members per workspace
            </div>
          </div>
        </div>
      </div>
    )
    
  } catch (error) {
    console.error('[admin/telemetry] Error fetching analytics:', error)
    
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <Link
            href="/en/admin"
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-2 inline-block"
          >
            ← Back to Admin Console
          </Link>
          <h1 className="text-2xl font-bold">Analytics & Telemetry</h1>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-red-800 dark:text-red-300">
            Unable to fetch analytics data. Please check your database connection and try again.
          </p>
          <pre className="mt-4 text-xs bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    )
  }
}

