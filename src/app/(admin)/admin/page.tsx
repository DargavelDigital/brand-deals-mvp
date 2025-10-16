import { requireAdmin } from '@/lib/admin/guards'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  await requireAdmin()
  
  // Lazy import Prisma to avoid build-time issues
  const { prisma } = await import('@/lib/prisma')
  const recentWs = await prisma().workspace.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
  return (
    <div className="space-y-6">
      {/* Admin Tools Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/admin/ai-costs" 
          className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6 hover:bg-blue-100 transition-colors"
        >
          <div className="text-3xl mb-2">💰</div>
          <div className="font-semibold text-lg">AI Costs</div>
          <div className="text-sm text-muted-foreground mt-1">
            Track AI usage and costs across all workspaces
          </div>
        </Link>
        
        <Link 
          href="/admin/telemetry" 
          className="rounded-lg border p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="text-3xl mb-2">📊</div>
          <div className="font-semibold text-lg">Telemetry</div>
          <div className="text-sm text-muted-foreground mt-1">
            View system metrics and performance
          </div>
        </Link>
        
        <Link 
          href="/admin/compliance" 
          className="rounded-lg border p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="text-3xl mb-2">🔒</div>
          <div className="font-semibold text-lg">Compliance</div>
          <div className="text-sm text-muted-foreground mt-1">
            Security and compliance monitoring
          </div>
        </Link>
      </div>
    
      <h2 className="text-lg font-medium">Recent Workspaces</h2>
      <ul className="divide-y">
        {recentWs.map(w => (
          <li key={w.id} className="flex items-center justify-between py-3">
            <div className="text-sm">
              <div className="font-medium">{w.name}</div>
              <div className="text-muted-foreground">{w.id}</div>
            </div>
            <div className="space-x-3">
              <Link className="text-blue-600" href={`/admin/workspaces/${w.id}`}>View</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
