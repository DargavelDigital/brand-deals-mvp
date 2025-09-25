import { requireAdmin } from '@/lib/admin/guards'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface AuditSummary {
  timestamp: string
  summary: {
    auth: { status: string; issues: string[] }
    writes: { status: string; issues: string[] }
    jobs: { status: string; issues: string[] }
    email: { status: string; issues: string[] }
    stripe: { status: string; issues: string[] }
    mediapack: { status: string; issues: string[] }
    env: { status: string; issues: string[] }
    obs: { status: string; issues: string[] }
    security: { status: string; issues: string[] }
    brandrun: { status: string; issues: string[] }
  }
  artifacts: Array<{
    name: string
    timestamp: string | null
    status: string
  }>
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'green':
      return '🟢'
    case 'amber':
      return '🟡'
    case 'red':
      return '🔴'
    default:
      return '⚪'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'green':
      return 'text-green-600'
    case 'amber':
      return 'text-yellow-600'
    case 'red':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

async function loadAuditSummary(): Promise<AuditSummary | null> {
  try {
    const summaryPath = join(process.cwd(), 'docs/audit/summarize.json')
    if (!existsSync(summaryPath)) {
      return null
    }
    
    const content = readFileSync(summaryPath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Failed to load audit summary:', error)
    return null
  }
}

export default async function StabilizationPage() {
  await requireAdmin()
  
  const auditSummary = await loadAuditSummary()
  
  if (!auditSummary) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Stabilization Checklist</h1>
        </div>
        
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Audit Reports Not Found
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>No audit reports found. Run the audit suite to generate reports:</p>
                <code className="mt-1 block rounded bg-yellow-100 px-2 py-1 text-xs">
                  npm run audit:all
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const categories = Object.entries(auditSummary.summary)
  const redCount = categories.filter(([, data]) => data.status === 'red').length
  const amberCount = categories.filter(([, data]) => data.status === 'amber').length
  const greenCount = categories.filter(([, data]) => data.status === 'green').length
  const totalIssues = categories.reduce((sum, [, data]) => sum + data.issues.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stabilization Checklist</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(auditSummary.timestamp).toLocaleString()}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <div className="text-2xl">🔴</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Critical Issues</p>
              <p className="text-2xl font-bold text-red-900">{redCount}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center">
            <div className="text-2xl">🟡</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">Moderate Issues</p>
              <p className="text-2xl font-bold text-yellow-900">{amberCount}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center">
            <div className="text-2xl">🟢</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Healthy</p>
              <p className="text-2xl font-bold text-green-900">{greenCount}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center">
            <div className="text-2xl">📊</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Audit Categories</h2>
        
        <div className="grid gap-4">
          {categories.map(([category, data]) => (
            <div key={category} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getStatusIcon(data.status)}</span>
                  <div>
                    <h3 className="font-medium capitalize">{category}</h3>
                    <p className={`text-sm ${getStatusColor(data.status)}`}>
                      {data.status.toUpperCase()} - {data.issues.length} issues
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link 
                    href={`/admin/stabilization/${category}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </Link>
                  <Link 
                    href={`/docs/audit/${category === 'writes' ? 'inventory-writes' : category === 'obs' ? 'observability' : category === 'env' ? 'env-flags' : category === 'jobs' ? 'jobs' : category === 'email' ? 'email-safety' : category === 'stripe' ? 'stripe-audit' : category === 'mediapack' ? 'mediapack-audit' : category === 'security' ? 'security' : category === 'brandrun' ? 'brandrun-trace' : 'doctor'}.md`}
                    target="_blank"
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    View Report
                  </Link>
                </div>
              </div>
              
              {data.issues.length > 0 && (
                <div className="mt-3">
                  <ul className="space-y-1">
                    {data.issues.slice(0, 3).map((issue, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {issue}
                      </li>
                    ))}
                    {data.issues.length > 3 && (
                      <li className="text-sm text-gray-500">
                        ... and {data.issues.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Link 
            href="/docs/audit/index.md"
            target="_blank"
            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            View Full Report
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Audit Artifacts Status */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Audit Artifacts Status</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {auditSummary.artifacts.map((artifact) => (
            <div key={artifact.name} className="flex items-center justify-between p-2 rounded border">
              <span className="font-mono">{artifact.name}</span>
              <span className={artifact.status === 'loaded' ? 'text-green-600' : 'text-red-600'}>
                {artifact.status === 'loaded' ? '✅' : '❌'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
