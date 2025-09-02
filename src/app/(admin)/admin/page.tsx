import { requireAdmin } from '@/lib/admin/guards'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  await requireAdmin()
  
  // Lazy import Prisma to avoid build-time issues
  const { prisma } = await import('@/lib/prisma')
  const recentWs = await prisma.workspace.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
  return (
    <div className="space-y-4">
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
