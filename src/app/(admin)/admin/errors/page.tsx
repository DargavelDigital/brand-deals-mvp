import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin/guards'

export default async function AdminErrors() {
  await requireAdmin()
  const errors = await prisma.errorEvent.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 100,
    include: { workspace: { select: { name: true } } }
  })
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Error Events</h2>
      <div className="rounded-md border divide-y">
        {errors.map(error => (
          <div key={error.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{error.where}</div>
              <div className="text-sm text-muted-foreground">
                {error.workspace?.name || 'No workspace'}
              </div>
            </div>
            <div className="text-sm text-red-600">{error.message}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(error.createdAt).toLocaleString()}
              {error.traceId && ` • Trace: ${error.traceId}`}
            </div>
            {error.stack && (
              <details className="text-xs">
                <summary className="cursor-pointer">Stack trace</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">{error.stack}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
