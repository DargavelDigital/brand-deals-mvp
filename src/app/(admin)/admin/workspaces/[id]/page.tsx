import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin/guards'

async function getData(id: string) {
  const ws = await prisma.workspace.findUnique({ where: { id } })
  const usage = { // derive from your tables
    aiTokens: await prisma.aiUsageEvent.aggregate({ _sum: { tokens: true }, where: { workspaceId: id } }).then(r => r._sum.tokens ?? 0).catch(()=>0)
  }
  const logs = await prisma.auditLog.findMany({ where: { workspaceId: id }, orderBy: { createdAt: 'desc' }, take: 50 })
  const runs = await prisma.brandRun.findMany({ where: { workspaceId: id }, orderBy: { createdAt: 'desc' }, take: 10 })
  return { ws, usage, logs, runs }
}

export default async function WorkspaceAdmin({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const { ws, usage, logs, runs } = await getData(id)
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
