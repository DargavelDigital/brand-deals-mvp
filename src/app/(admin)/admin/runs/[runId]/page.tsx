import { requireAdmin } from '@/lib/admin/guards'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RunDetail({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  await requireAdmin()
  
  // Lazy import Prisma to avoid build-time issues
  const { prisma } = await import('@/lib/prisma')
  const steps = await prisma().runStepExecution.findMany({ where: { runId: runId }, orderBy: { startedAt: 'asc' } })
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Run {runId}</h2>
      <div className="rounded-md border divide-y">
        {steps.map(s => (
          <div key={s.id} className="p-3 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{s.step}</div>
              <div className={`px-2 py-0.5 rounded ${s.status==='OK'?'bg-green-100 text-green-700':s.status==='FAIL'?'bg-red-100 text-red-700':'bg-gray-100 text-gray-700'}`}>{s.status}</div>
            </div>
            <div className="text-muted-foreground">started {new Date(s.startedAt).toLocaleString()}</div>
            <div className="flex gap-3">
              <Link className="text-blue-600" href={`/api/admin/runs/${runId}/steps/${s.id}/replay`} prefetch={false}>Replay</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
