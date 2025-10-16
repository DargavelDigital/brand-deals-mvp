import { requireAdmin } from '@/lib/admin/guards'

export const dynamic = 'force-dynamic'

async function getData(id: string) {
  // Lazy import Prisma to avoid build-time issues
  const { prisma } = await import('@/lib/prisma')
  const { getWorkspaceCostSummary } = await import('@/services/ai/track-usage')
  const { formatCost } = await import('@/lib/ai-costs')
  
  const ws = await prisma().workspace.findUnique({ where: { id } })
  const usage = { // derive from your tables
    aiTokens: await prisma().aiUsageEvent.aggregate({ _sum: { tokens: true }, where: { workspaceId: id } }).then(r => r._sum.tokens ?? 0).catch(()=>0)
  }
  
  // NEW: Get AI cost summary
  const aiCosts = await getWorkspaceCostSummary(id).catch(err => {
    console.error('Failed to load AI costs:', err)
    return { totalCost: 0, totalTokens: 0, totalRequests: 0, byProvider: {}, byFeature: {} }
  })
  
  const logs = await prisma().auditLog.findMany({ where: { workspaceId: id }, orderBy: { createdAt: 'desc' }, take: 50 })
  const runs = await prisma().brandRun.findMany({ where: { workspaceId: id }, orderBy: { createdAt: 'desc' }, take: 10 })
  return { ws, usage, logs, runs, aiCosts, formatCost }
}

export default async function WorkspaceAdmin({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const { ws, usage, logs, runs, aiCosts, formatCost } = await getData(id)
  if (!ws) return <div>Not found</div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{ws.name}</h2>
          <p className="text-sm text-muted-foreground">{ws.id}</p>
        </div>
        <form action={`/api/admin/impersonate`} method="post">
          <input type="hidden" name="workspaceId" value={ws.id} />
          <button className="px-3 py-2 rounded-md bg-blue-600 text-white">Impersonate</button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Usage</h3>
          <div className="rounded-md border p-3 text-sm">AI tokens: {usage.aiTokens}</div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Recent Runs</h3>
          <div className="rounded-md border divide-y">
            {runs.map(r => (
              <div key={r.id} className="p-3 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">{r.status}</div>
                  <div className="text-muted-foreground">{r.id}</div>
                </div>
                <a className="text-blue-600" href={`/admin/runs/${r.id}`}>Open</a>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* NEW: AI Usage & Costs Section */}
      <div className="rounded-md border p-6">
        <h3 className="text-xl font-semibold mb-4">💰 AI Usage & Costs</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Cost</div>
            <div className="text-2xl font-bold mt-1">
              {formatCost(aiCosts.totalCost)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Tokens</div>
            <div className="text-2xl font-bold mt-1">
              {aiCosts.totalTokens.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Requests</div>
            <div className="text-2xl font-bold mt-1">
              {aiCosts.totalRequests.toLocaleString()}
            </div>
          </div>
        </div>
        
        {Object.keys(aiCosts.byProvider).length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-3">By Provider</h4>
            <div className="space-y-2">
              {Object.entries(aiCosts.byProvider).map(([provider, stats]: [string, any]) => (
                <div key={provider} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="capitalize">{provider}</span>
                  <span className="font-semibold">{formatCost(stats.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {Object.keys(aiCosts.byFeature).length > 0 && (
          <div>
            <h4 className="font-medium mb-3">By Feature</h4>
            <div className="space-y-2">
              {Object.entries(aiCosts.byFeature).map(([feature, stats]: [string, any]) => (
                <div key={feature} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{feature.replace(/_/g, ' ')}</span>
                  <span className="font-semibold">{formatCost(stats.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {aiCosts.totalRequests === 0 && (
          <div className="text-center text-muted-foreground py-6">
            No AI usage yet
          </div>
        )}
      </div>

      <div>
        <h3 className="font-medium mb-2">Audit</h3>
        <div className="rounded-md border divide-y">
          {logs.map(l => (
            <div key={l.id} className="p-3 text-sm flex gap-3">
              <div className="text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</div>
              <div className="font-medium">{l.action}</div>
              <div className="truncate">{JSON.stringify(l.meta)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
