import { requireAdmin } from '@/lib/admin/guards'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { WorkspaceTableWithBulk } from '@/components/admin/WorkspaceTableWithBulk'

export const dynamic = 'force-dynamic'

export default async function AdminWorkspacesPage() {
  await requireAdmin()
  
  // Fetch all workspaces with member counts
  const workspaces = await prisma().workspace.findMany({
    include: {
      Membership: {
        select: {
          id: true,
          role: true,
          User_Membership_userIdToUser: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      _count: {
        select: {
          Membership: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
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
          <h1 className="text-2xl font-bold">Workspace Management</h1>
          <div className="flex items-center gap-4">
            <a
              href="/api/admin/export/workspaces"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
              download
            >
              📥 Export CSV
            </a>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Workspaces: {workspaces.length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Workspace Table with Bulk Selection */}
      <WorkspaceTableWithBulk workspaces={workspaces as any} />
    </div>
  )
}

