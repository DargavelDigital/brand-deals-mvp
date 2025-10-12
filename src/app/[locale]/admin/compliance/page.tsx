import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminCompliancePage() {
  await requireAdmin()
  
  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  
  try {
    // Compliance Statistics
    const [
      totalUsers,
      recentUsers,
      usersWithEmail,
      verifiedUsers,
      oldUsers
    ] = await Promise.all([
      prisma().user.count(),
      prisma().user.count({
        where: { createdAt: { gte: last30Days } }
      }),
      prisma().user.count({
        where: { email: { not: null } }
      }),
      prisma().user.count({
        where: { emailVerified: { not: null } }
      }),
      prisma().user.count({
        where: {
          updatedAt: { lte: last90Days }
        }
      })
    ])
    
    // Admin activity
    const adminUsers = await prisma().admin.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Get associated user data for each admin
    const adminUsersWithDetails = await Promise.all(
      adminUsers.map(async (admin) => {
        const user = await prisma().user.findUnique({
          where: { email: admin.email },
          select: {
            name: true,
            updatedAt: true
          }
        })
        return {
          ...admin,
          user
        }
      })
    )
    
    const emailVerificationRate = totalUsers > 0 
      ? ((verifiedUsers / totalUsers) * 100).toFixed(1)
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
            <h1 className="text-2xl font-bold">Compliance & Privacy</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {now.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Registered accounts
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Email Verified</div>
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{emailVerificationRate}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {verifiedUsers} verified users
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">New Users (30d)</div>
              <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{recentUsers.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Recent signups
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Inactive (90d+)</div>
              <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{oldUsers.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              May need cleanup
            </div>
          </div>
        </div>
        
        {/* GDPR & Privacy Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Data Rights */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              GDPR Compliance
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Right to Access</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                  ✓ Implemented
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Right to Erasure</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                  ✓ Implemented
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Data Portability</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                  ✓ Implemented
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Consent Management</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                  ✓ Implemented
                </span>
              </div>
            </div>
          </div>
          
          {/* Security Measures */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Measures
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Data Encryption</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                  ✓ Active
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Secure Authentication</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                  ✓ Active
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Role-Based Access</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                  ✓ Active
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Audit Logging</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                  ✓ Active
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Admin Access Log */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Access Control</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              All users with administrative privileges
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Access Granted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {adminUsersWithDetails.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {admin.user?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {admin.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.role === 'SUPER'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {admin.user?.updatedAt 
                        ? new Date(admin.user.updatedAt).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Data Retention Policy */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-amber-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">
                Data Retention Policy
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                In compliance with GDPR and data protection regulations:
              </p>
              <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>User accounts inactive for 90+ days are flagged for review ({oldUsers} currently)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Users can request data deletion at any time via account settings</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>All personal data is encrypted at rest and in transit</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Email verification rate: {emailVerificationRate}% ({verifiedUsers}/{totalUsers} users)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Admin access is logged and monitored for security ({adminUsersWithDetails.length} admin users)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/en/admin/compliance/export" className="block">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer h-full">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Export User Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate GDPR-compliant data export for any user
              </p>
              <span className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Generate Export →
              </span>
            </div>
          </Link>
          
          <Link href="/en/admin/errors" className="block">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer h-full">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Error Logs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                View system errors and admin action history
              </p>
              <span className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                View Logs →
              </span>
            </div>
          </Link>
          
          <a href="/api/admin/security-report" download className="block">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer h-full">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Security Report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate comprehensive security audit
              </p>
              <span className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Generate Report →
              </span>
            </div>
          </a>
        </div>
      </div>
    )
    
  } catch (error) {
    console.error('[admin/compliance] Error fetching compliance data:', error)
    
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <Link
            href="/en/admin"
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-2 inline-block"
          >
            ← Back to Admin Console
          </Link>
          <h1 className="text-2xl font-bold">Compliance & Privacy</h1>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
            Error Loading Compliance Data
          </h3>
          <p className="text-red-800 dark:text-red-300 mb-4">
            Unable to fetch compliance information. Please check your database connection.
          </p>
          <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    )
  }
}

